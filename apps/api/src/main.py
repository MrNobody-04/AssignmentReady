import asyncio
import time
from contextlib import asynccontextmanager
import uuid
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from src.config import config
from src.common.errors import (
    AppError,
    FileValidationError,
    JobNotFoundError,
    app_error_handler,
    general_error_handler,
)
from src.common.security import (
    validate_uuid,
    sanitize_filename,
    validate_docx_bytes,
    validate_pdf_bytes,
    get_job_directory,
)
from src.modules.jobs.job_schema import (
    JobStatusResponse,
    FormattingSettings,
    ComplianceReport,
)
from src.modules.jobs.job_manager import job_manager
from src.modules.documents.inspector import inspect_docx
from src.modules.converters.conversion_controller import router as conversion_router
from src.modules.presentation.presentation_controller import router as presentation_router
from src.modules.doctor.doctor_controller import router as doctor_router
from src.modules.converters.universal_converter import sanitize_output_filename

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: purge any stale jobs/directories older than TTL
    job_manager.cleanup_expired_jobs()

    # 2. Schedule recurring cleanup every 10 minutes
    async def periodic_cleanup():
        while True:
            await asyncio.sleep(600)
            try:
                job_manager.cleanup_expired_jobs()
            except Exception:
                pass

    task = asyncio.create_task(periodic_cleanup())
    yield
    task.cancel()

app = FastAPI(
    title=config.app_name,
    version="1.0.0",
    description="Dedicated Academic Assignment Formatter API conforming to institution guidelines.",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow local dev ports (5173, 3000, 8080)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversion_router)
app.include_router(presentation_router)
app.include_router(doctor_router)

# Exception Handlers
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, general_error_handler)

@app.middleware("http")
async def security_and_telemetry_middleware(request: Request, call_next):
    start_time = time.time()
    req_id = str(uuid.uuid4())[:8]
    request.state.request_id = req_id

    response = await call_next(request)

    duration_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Request-Id"] = req_id
    response.headers["X-Response-Time"] = f"{duration_ms}ms"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"

    return response

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": config.app_name,
        "libreoffice_available": config.libreoffice_path is not None,
        "libreoffice_path": config.libreoffice_path,
        "storage_ready": config.storage_dir.exists(),
    }

@app.post("/api/jobs/upload", response_model=JobStatusResponse)
@app.post("/api/upload", response_model=JobStatusResponse)
async def upload_assignment(file: UploadFile = File(...)):
    raw_filename = file.filename or "assignment.docx"
    safe_filename = sanitize_filename(raw_filename)

    content = await file.read()
    if len(content) > config.max_upload_size_bytes:
        raise FileValidationError(f"File exceeds maximum allowed size of 25MB (Received {len(content) / (1024*1024):.1f}MB)")

    # Auto-detect format & auto-convert PDF or plain text files uploaded as assignment
    if content.startswith(b"%PDF-") or raw_filename.lower().endswith(".pdf"):
        from src.modules.converters.universal_converter import convert_pdf_to_docx
        content = convert_pdf_to_docx(content)
        if not safe_filename.lower().endswith(".docx"):
            safe_filename = f"{Path(safe_filename).stem}.docx"
    elif content.startswith(b"PK\x03\x04"):
        validate_docx_bytes(content, safe_filename)
    elif not content.startswith(b"\x00") and len(content) > 0:
        try:
            text_str = content.decode("utf-8")
            from src.modules.converters.universal_converter import convert_txt_to_docx
            content = convert_txt_to_docx(text_str)
            if not safe_filename.lower().endswith(".docx"):
                safe_filename = f"{Path(safe_filename).stem}.docx"
        except UnicodeDecodeError:
            validate_docx_bytes(content, safe_filename)
    else:
        validate_docx_bytes(content, safe_filename)

    job_id = str(uuid.uuid4())
    job_dir = get_job_directory(job_id, create=True)
    orig_path = job_dir / "original.docx"

    with open(orig_path, "wb") as f:
        f.write(content)

    # Inspect document
    inspection = inspect_docx(orig_path)
    inspection.filename = safe_filename

    # Register in manager
    record = job_manager.create_job(job_id, safe_filename)
    record.inspection = inspection

    return job_manager.get_status_response(job_id)

@app.post("/api/jobs/{job_id}/upload-cover")
@app.post("/api/upload/template/{job_id}")
async def upload_cover_template(job_id: str, file: UploadFile = File(...)):
    validate_uuid(job_id)
    job_dir = get_job_directory(job_id, create=False)
    if not job_dir.exists():
        raise JobNotFoundError(job_id)

    raw_filename = file.filename or "cover.docx"
    safe_filename = sanitize_filename(raw_filename)
    if not safe_filename.lower().endswith(".docx"):
        raise FileValidationError("Cover page template must be a Microsoft Word (.docx) document.")

    content = await file.read()
    validate_docx_bytes(content, safe_filename)

    cover_path = job_dir / "cover_template.docx"
    with open(cover_path, "wb") as f:
        f.write(content)

    record = job_manager.get_job(job_id)
    record.has_cover_template = True
    return {"message": "Cover template uploaded successfully", "job_id": job_id}

@app.post("/api/jobs/{job_id}/upload-guidelines")
@app.post("/api/upload/guidelines/{job_id}")
async def upload_guidelines(job_id: str, file: UploadFile = File(...)):
    validate_uuid(job_id)
    job_dir = get_job_directory(job_id, create=False)
    if not job_dir.exists():
        raise JobNotFoundError(job_id)

    raw_filename = file.filename or "guidelines.pdf"
    ext = Path(raw_filename).suffix.lower()
    if ext not in config.allowed_guideline_extensions:
        raise FileValidationError(f"Guidelines file must be one of {config.allowed_guideline_extensions}. Received '{ext}'.")

    content = await file.read()
    if ext == ".docx":
        validate_docx_bytes(content, raw_filename)
        out_path = job_dir / "guidelines.docx"
    elif ext == ".pdf":
        validate_pdf_bytes(content, raw_filename)
        out_path = job_dir / "guidelines.pdf"
    else:
        out_path = job_dir / "guidelines.txt"

    with open(out_path, "wb") as f:
        f.write(content)

    record = job_manager.get_job(job_id)
    record.has_guidelines = True
    return {"message": "Guidelines uploaded successfully", "job_id": job_id}

@app.post("/api/jobs/{job_id}/upload-rubric")
@app.post("/api/upload/marking-scheme/{job_id}")
async def upload_rubric(job_id: str, file: UploadFile = File(...)):
    validate_uuid(job_id)
    job_dir = get_job_directory(job_id, create=False)
    if not job_dir.exists():
        raise JobNotFoundError(job_id)

    raw_filename = file.filename or "rubric.pdf"
    ext = Path(raw_filename).suffix.lower()
    if ext not in config.allowed_guideline_extensions:
        raise FileValidationError(f"Marking scheme file must be one of {config.allowed_guideline_extensions}.")

    content = await file.read()
    if ext == ".docx":
        validate_docx_bytes(content, raw_filename)
        out_path = job_dir / "rubric.docx"
    elif ext == ".pdf":
        validate_pdf_bytes(content, raw_filename)
        out_path = job_dir / "rubric.pdf"
    else:
        out_path = job_dir / "rubric.txt"

    with open(out_path, "wb") as f:
        f.write(content)

    record = job_manager.get_job(job_id)
    record.has_marking_scheme_file = True

    # Deterministically extract criteria and persist in project intelligence
    try:
        criteria = []
        if ext == ".docx":
            from src.modules.presentation.rubric_analyzer import extract_rubric_from_docx
            criteria = extract_rubric_from_docx(out_path)
        elif ext == ".pdf":
            from src.modules.presentation.rubric_analyzer import extract_rubric_from_pdf
            criteria = extract_rubric_from_pdf(content)
        elif ext in [".xlsx", ".xls"]:
            from src.modules.presentation.rubric_analyzer import extract_rubric_from_xlsx
            criteria = extract_rubric_from_xlsx(out_path)
        else:
            from src.modules.presentation.rubric_analyzer import extract_rubric_from_text
            text_val = content.decode("utf-8", errors="replace")
            criteria = extract_rubric_from_text(text_val)

        from src.modules.jobs.job_schema import RubricProjectData
        total_w = sum(c.weight_percent for c in criteria)
        record.rubric_data = RubricProjectData(
            filename=raw_filename,
            total_criteria_count=len(criteria),
            total_weight_found=total_w,
            criteria=[c.model_dump() if hasattr(c, "model_dump") else c.__dict__ for c in criteria],
            uploaded_at=time.time(),
        )
    except Exception as e:
        import traceback
        traceback.print_exc()

    return {
        "message": "Marking scheme uploaded and parsed successfully",
        "job_id": job_id,
        "criteria_count": record.rubric_data.total_criteria_count if record.rubric_data else 0,
    }

@app.get("/api/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    validate_uuid(job_id)
    return job_manager.get_status_response(job_id)

@app.get("/api/projects/{project_id}", response_model=JobStatusResponse)
async def get_project_status(project_id: str):
    validate_uuid(project_id)
    return job_manager.get_status_response(project_id)

@app.post("/api/jobs/{job_id}/format", response_model=JobStatusResponse)
async def format_document(job_id: str, settings: FormattingSettings, version_id: int | None = None):
    validate_uuid(job_id)
    return job_manager.execute_formatting(job_id, settings, source_version_id=version_id)

@app.get("/api/jobs/{job_id}/versions")
async def get_document_versions(job_id: str):
    validate_uuid(job_id)
    record = job_manager.get_job(job_id)
    return {
        "project_id": job_id,
        "current_version_id": record.current_version_id,
        "versions": record.get_versions_info(),
    }

@app.get("/api/jobs/{job_id}/versions/{version_id}/download")
async def download_document_version(job_id: str, version_id: int, filename: str | None = None):
    validate_uuid(job_id)
    record = job_manager.get_job(job_id)
    v_rec = record.get_version(version_id)
    if not v_rec or not v_rec.file_path.exists():
        raise HTTPException(status_code=404, detail=f"Document version {version_id} not found.")

    out_name = sanitize_output_filename(filename or "", v_rec.filename, f".{v_rec.file_type}")
    media_type = (
        "application/pdf"
        if v_rec.file_type == "pdf"
        else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

    return FileResponse(
        path=str(v_rec.file_path),
        media_type=media_type,
        filename=out_name,
    )

@app.post("/api/jobs/{job_id}/versions/{version_id}/set-current")
async def set_current_document_version(job_id: str, version_id: int):
    validate_uuid(job_id)
    info = job_manager.set_current_version(job_id, version_id)
    return {
        "message": f"Active project document set to Version {version_id}",
        "active_version": info,
    }

@app.get("/api/jobs/{job_id}/rubric-analysis")
async def get_project_rubric_analysis(job_id: str, version_id: int | None = None):
    validate_uuid(job_id)
    record = job_manager.get_job(job_id)
    if not record.rubric_data or not record.rubric_data.criteria:
        raise HTTPException(status_code=404, detail="No marking scheme uploaded for this project.")

    v_rec = record.get_version(version_id)
    target_path = v_rec.file_path if v_rec and v_rec.file_path.exists() else (get_job_directory(job_id) / "original.docx")
    if not target_path.exists():
        raise HTTPException(status_code=404, detail="No document available to analyze against rubric.")

    from src.modules.presentation.report_analyzer import analyze_docx_report
    from src.modules.presentation.rubric_analyzer import map_report_to_rubric, AssessmentCriterion

    report = analyze_docx_report(target_path)
    criteria_objs = [AssessmentCriterion(**c) for c in record.rubric_data.criteria]
    compliance_res = map_report_to_rubric(report, criteria_objs)

    analysis_dict = compliance_res.model_dump() if hasattr(compliance_res, "model_dump") else compliance_res.__dict__

    return {
        "project_id": job_id,
        "version_id": v_rec.version_id if v_rec else 1,
        "version_label": v_rec.version_label if v_rec else "Version 1",
        "rubric_filename": record.rubric_data.filename,
        "rubric_analysis": compliance_res,
        **analysis_dict,
    }

@app.post("/api/jobs/{job_id}/convert")
async def convert_project_document(
    job_id: str,
    target_format: str = "pdf",
    version_id: int | None = None,
):
    validate_uuid(job_id)
    record = job_manager.get_job(job_id)
    v_rec = record.get_version(version_id)
    if not v_rec or not v_rec.file_path.exists():
        raise HTTPException(status_code=404, detail="Document version not found.")

    target_fmt = target_format.lower().lstrip(".")
    if target_fmt not in ["pdf", "txt"]:
        raise HTTPException(status_code=400, detail=f"Unsupported target format '{target_fmt}'. Supported: pdf, txt.")

    job_dir = get_job_directory(job_id)
    base_stem = Path(v_rec.filename).stem

    if target_fmt == "txt":
        doc = docx.Document(str(v_rec.file_path))
        full_text = "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
        out_file = job_dir / f"{base_stem}.txt"
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(full_text)
        return FileResponse(path=str(out_file), media_type="text/plain", filename=f"{base_stem}.txt")

    elif target_fmt == "pdf":
        pdf_file = job_dir / f"{base_stem}.pdf"
        if not pdf_file.exists() and config.libreoffice_path:
            job_manager._convert_to_pdf_libreoffice(v_rec.file_path, job_dir)

        if pdf_file.exists():
            return FileResponse(path=str(pdf_file), media_type="application/pdf", filename=f"{base_stem}.pdf")
        else:
            raise HTTPException(
                status_code=422,
                detail="PDF conversion requires LibreOffice. You can download the OpenXML (.docx) and export to PDF directly via Microsoft Word.",
            )

@app.get("/api/jobs/{job_id}/compliance", response_model=ComplianceReport)
async def get_compliance_report(job_id: str):
    validate_uuid(job_id)
    record = job_manager.get_job(job_id)
    if not record.compliance:
        job_dir = get_job_directory(job_id)
        fmt_file = job_dir / "formatted.docx"
        target_file = fmt_file if fmt_file.exists() else (job_dir / "original.docx")
        if target_file.exists():
            default_settings = record.settings or FormattingSettings()
            from src.modules.documents.compliance import audit_compliance
            record.compliance = audit_compliance(target_file, default_settings)
        else:
            raise HTTPException(status_code=404, detail="No document available to audit.")
    return record.compliance

@app.get("/api/jobs/{job_id}/download")
async def download_formatted_document(job_id: str, filename: str | None = None):
    validate_uuid(job_id)
    job_dir = get_job_directory(job_id)
    fmt_file = job_dir / "formatted.docx"
    if not fmt_file.exists():
        orig_file = job_dir / "original.docx"
        if orig_file.exists():
            fmt_file = orig_file
        else:
            raise JobNotFoundError(job_id)

    record = job_manager.get_job(job_id)
    base_name = Path(record.original_filename).stem
    download_name = sanitize_output_filename(filename or "", f"{base_name}_Formatted", ".docx")

    return FileResponse(
        path=str(fmt_file),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=download_name,
    )

@app.get("/api/jobs/{job_id}/download-pdf")
async def download_pdf_document(job_id: str, filename: str | None = None):
    validate_uuid(job_id)
    job_dir = get_job_directory(job_id)
    pdf_file = job_dir / "formatted.pdf"
    if not pdf_file.exists():
        raise HTTPException(
            status_code=404,
            detail="PDF version is not available. Headless LibreOffice is not installed on this host.",
        )

    record = job_manager.get_job(job_id)
    base_name = Path(record.original_filename).stem
    download_name = sanitize_output_filename(filename or "", f"{base_name}_Formatted", ".pdf")

    return FileResponse(
        path=str(pdf_file),
        media_type="application/pdf",
        filename=download_name,
    )

@app.delete("/api/jobs/{job_id}")
async def delete_job(job_id: str):
    validate_uuid(job_id)
    job_manager.delete_job(job_id)
    return {"message": "Job temporary storage deleted successfully", "job_id": job_id}

# =====================================================================
# Compatibility Endpoints for Direct /api/upload & Frontend APIs
# =====================================================================

@app.post("/api/upload", response_model=JobStatusResponse)
async def upload_assignment_direct_alias(file: UploadFile = File(...)):
    return await upload_assignment(file)

@app.post("/api/upload/template/{job_id}")
async def upload_cover_template_alias(job_id: str, file: UploadFile = File(...)):
    return await upload_cover_template(job_id, file)

@app.post("/api/upload/guidelines/{job_id}")
async def upload_guidelines_alias(job_id: str, file: UploadFile = File(...)):
    return await upload_guidelines(job_id, file)

@app.post("/api/upload/marking-scheme/{job_id}")
async def upload_rubric_alias(job_id: str, file: UploadFile = File(...)):
    return await upload_rubric(job_id, file)

@app.post("/api/inspect/{job_id}")
async def inspect_document_alias(job_id: str):
    validate_uuid(job_id)
    record = job_manager.get_job(job_id)
    return record.inspection

@app.post("/api/format/{job_id}", response_model=JobStatusResponse)
async def format_document_alias(job_id: str, settings: FormattingSettings):
    return await format_document(job_id, settings)

@app.post("/api/check-compliance/{job_id}", response_model=ComplianceReport)
async def check_compliance_alias(job_id: str, settings: FormattingSettings):
    validate_uuid(job_id)
    job_dir = get_job_directory(job_id)
    fmt_file = job_dir / "formatted.docx"
    target_file = fmt_file if fmt_file.exists() else (job_dir / "original.docx")
    if not target_file.exists():
        raise HTTPException(status_code=404, detail="No document available to audit.")
    from src.modules.documents.compliance import audit_compliance
    report = audit_compliance(target_file, settings)
    record = job_manager.get_job(job_id)
    record.compliance = report
    return report

@app.get("/api/download/{job_id}")
async def download_alias(job_id: str, format: str = "docx", filename: str | None = None):
    if format == "pdf":
        return await download_pdf_document(job_id, filename)
    return await download_formatted_document(job_id, filename)

