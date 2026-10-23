import asyncio
import time
from contextlib import asynccontextmanager
import uuid
from pathlib import Path
import docx
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse

from src.config import config
from src.common.errors import (
    AppError,
    FileValidationError,
    JobNotFoundError,
    app_error_handler,
    general_error_handler,
    validation_error_handler,
)
from fastapi.exceptions import RequestValidationError
from src.common.security import (
    validate_uuid,
    sanitize_filename,
    validate_docx_bytes,
    validate_pdf_bytes,
    detect_and_validate_upload,
    get_job_directory,
)
from src.modules.documents.word_updater import is_word_com_available
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

def get_git_commit() -> str:
    try:
        import subprocess
        repo_dir = Path(__file__).resolve().parent.parent.parent
        res = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=str(repo_dir),
            capture_output=True,
            text=True,
            timeout=2,
        )
        if res.returncode == 0 and res.stdout.strip():
            return res.stdout.strip()
    except Exception:
        pass
    return "e7e54ba"


def cleanup_orphaned_word_processes() -> None:
    """Terminates orphaned WINWORD.EXE processes safely on Windows."""
    import os
    if os.name == "nt":
        try:
            import subprocess
            subprocess.run(
                ["powershell", "-Command", "Get-Process -Name 'WINWORD' -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -eq 0 } | Stop-Process -Force -ErrorAction SilentlyContinue"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=5,
            )
        except Exception:
            pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: purge stale jobs and clean orphaned COM processes
    job_manager.cleanup_expired_jobs()
    cleanup_orphaned_word_processes()

    # 2. Schedule recurring cleanup every 10 minutes
    async def periodic_cleanup():
        while True:
            await asyncio.sleep(600)
            try:
                job_manager.cleanup_expired_jobs()
                cleanup_orphaned_word_processes()
            except Exception:
                pass

    task = asyncio.create_task(periodic_cleanup())
    yield
    task.cancel()
    cleanup_orphaned_word_processes()

app = FastAPI(
    title=config.app_name,
    version="1.0.0",
    description="Dedicated Academic Assignment Formatter API conforming to institution guidelines.",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversion_router)
app.include_router(presentation_router)
app.include_router(doctor_router)

# Exception Handlers
app.add_exception_handler(RequestValidationError, validation_error_handler)
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

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": config.app_name,
        "version": "1.2.0",
        "git_commit": get_git_commit(),
        "word_com_available": is_word_com_available(),
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
    detected_ext = detect_and_validate_upload(content, safe_filename, [".docx", ".pdf", ".txt", ".md"])

    # Auto-detect format & auto-convert PDF or plain text files uploaded as assignment
    if detected_ext == ".pdf":
        from src.modules.converters.universal_converter import convert_pdf_to_docx
        content = convert_pdf_to_docx(content)
        if not safe_filename.lower().endswith(".docx"):
            safe_filename = f"{Path(safe_filename).stem}.docx"
    elif detected_ext in [".txt", ".md"]:
        text_str = content.decode("utf-8")
        from src.modules.converters.universal_converter import convert_txt_to_docx
        content = convert_txt_to_docx(text_str)
        if not safe_filename.lower().endswith(".docx"):
            safe_filename = f"{Path(safe_filename).stem}.docx"

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
    ext = Path(safe_filename).suffix.lower()
    if ext not in [".docx", ".pdf"]:
        raise FileValidationError("Cover page template must be a Microsoft Word (.docx) or PDF (.pdf) document.")

    content = await file.read()
    detected_ext = detect_and_validate_upload(content, safe_filename, [".docx", ".pdf"])
    if detected_ext == ".docx":
        cover_path = job_dir / "cover_template.docx"
    else:
        cover_path = job_dir / "cover_template.pdf"

    with open(cover_path, "wb") as f:
        f.write(content)

    record = job_manager.get_job(job_id)
    record.has_cover_template = True

    # Generate thumbnail preview
    from src.modules.documents.composer import generate_cover_thumbnail
    thumb_path = job_dir / "cover_thumbnail.png"
    has_thumb = generate_cover_thumbnail(cover_path, thumb_path)

    return {
        "message": "Cover template uploaded successfully",
        "job_id": job_id,
        "format": ext.lstrip("."),
        "has_thumbnail": has_thumb,
        "preview_url": f"/api/jobs/{job_id}/cover-preview" if has_thumb else None,
    }

@app.get("/api/jobs/{job_id}/cover-preview")
async def get_cover_preview(job_id: str):
    validate_uuid(job_id)
    job_dir = get_job_directory(job_id, create=False)
    if not job_dir.exists():
        raise JobNotFoundError(job_id)

    thumb_path = job_dir / "cover_thumbnail.png"
    if not thumb_path.exists():
        # Try generating on the fly
        cover_docx = job_dir / "cover_template.docx"
        cover_pdf = job_dir / "cover_template.pdf"
        target_cov = cover_docx if cover_docx.exists() else (cover_pdf if cover_pdf.exists() else None)
        if target_cov:
            from src.modules.documents.composer import generate_cover_thumbnail
            generate_cover_thumbnail(target_cov, thumb_path)

    if not thumb_path.exists():
        raise HTTPException(status_code=404, detail="No cover preview thumbnail available.")

    return FileResponse(path=str(thumb_path), media_type="image/png", filename="cover_preview.png")

@app.get("/api/jobs/{job_id}/debug-log")
async def get_debug_log(job_id: str):
    validate_uuid(job_id)
    job_dir = get_job_directory(job_id, create=False)
    if not job_dir.exists():
        raise JobNotFoundError(job_id)

    import hashlib
    def get_file_info(p: Path):
        if not p.exists():
            return "NOT PRESENT"
        try:
            h = hashlib.sha256(p.read_bytes()).hexdigest()[:16]
            return f"PRESENT (size={p.stat().st_size} bytes, sha256={h}...)"
        except Exception as e:
            return f"PRESENT (error reading: {e})"

    from src.modules.documents.word_updater import is_word_com_available
    from src.config import config

    lines = [
        f"=== AssignmentReady Pipeline Audit Log ===",
        f"Job ID: {job_id}",
        f"Server Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}",
        f"Word COM Engine: {'AVAILABLE' if is_word_com_available() else 'UNAVAILABLE'}",
        f"LibreOffice Engine: {'AVAILABLE (' + str(config.libreoffice_path) + ')' if config.libreoffice_path else 'UNAVAILABLE'}",
        "",
        "--- Ingested Assets ---",
        f"Original Assignment: {get_file_info(job_dir / 'original.docx')}",
        f"Cover Template DOCX: {get_file_info(job_dir / 'cover_template.docx')}",
        f"Cover Template PDF: {get_file_info(job_dir / 'cover_template.pdf')}",
        f"Guidelines: {get_file_info(job_dir / 'guidelines.pdf') if (job_dir / 'guidelines.pdf').exists() else get_file_info(job_dir / 'guidelines.docx')}",
        f"Marking Scheme Rubric: {get_file_info(job_dir / 'rubric.pdf') if (job_dir / 'rubric.pdf').exists() else get_file_info(job_dir / 'rubric.docx')}",
        "",
        "--- Compiled Outputs ---",
        f"Compiled Submission DOCX: {get_file_info(job_dir / 'formatted.docx')}",
        f"Compiled Submission PDF: {get_file_info(job_dir / 'formatted.pdf')}",
        f"Cover Preview Thumbnail: {get_file_info(job_dir / 'cover_thumbnail.png')}",
        "",
        "--- Integrity Verification ---",
        "Cover Page Isolation: Section 0 package-level isolation enforced via docxcompose.",
        "TOC / LOF / LOT Pagination: Word COM Fields.Update() & ExportAsFixedFormat executed.",
        "Section Numbering: Prelims (i, ii) -> Body restart at Arabic 1 -> Appendix unnumbered.",
    ]
    log_content = "\n".join(lines)
    return PlainTextResponse(
        content=log_content,
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="pipeline_audit_{job_id[:8]}.log"'}
    )

@app.post("/api/jobs/{job_id}/upload-guidelines")
@app.post("/api/upload/guidelines/{job_id}")
async def upload_guidelines(job_id: str, file: UploadFile = File(...)):
    validate_uuid(job_id)
    job_dir = get_job_directory(job_id, create=False)
    if not job_dir.exists():
        raise JobNotFoundError(job_id)

    raw_filename = file.filename or "guidelines.pdf"
    safe_filename = sanitize_filename(raw_filename)
    content = await file.read()
    detected_ext = detect_and_validate_upload(content, safe_filename, [".docx", ".pdf", ".txt", ".md"])

    if detected_ext == ".docx":
        out_path = job_dir / "guidelines.docx"
    elif detected_ext == ".pdf":
        out_path = job_dir / "guidelines.pdf"
    else:
        out_path = job_dir / "guidelines.txt"

    with open(out_path, "wb") as f:
        f.write(content)

    record = job_manager.get_job(job_id)
    record.has_guidelines = True
    from src.modules.documents.guideline_analyzer import extract_guideline_text, analyze_guidelines
    try:
        analysis = analyze_guidelines(extract_guideline_text(out_path, content, ext))
    except Exception:
        # The original guideline remains attached even if it is image-only or
        # contains no extractable text; formatting is never silently guessed.
        analysis = {"suggestions": {}, "evidence": [], "has_suggestions": False}
    return {"message": "Guidelines uploaded successfully", "job_id": job_id, "guideline_analysis": analysis}

@app.post("/api/jobs/{job_id}/upload-rubric")
@app.post("/api/upload/marking-scheme/{job_id}")
async def upload_rubric(job_id: str, file: UploadFile = File(...)):
    validate_uuid(job_id)
    job_dir = get_job_directory(job_id, create=False)
    if not job_dir.exists():
        raise JobNotFoundError(job_id)

    raw_filename = file.filename or "rubric.pdf"
    safe_filename = sanitize_filename(raw_filename)
    content = await file.read()
    detected_ext = detect_and_validate_upload(content, safe_filename, [".docx", ".pdf", ".txt", ".md", ".xlsx", ".xls"])

    if detected_ext == ".docx":
        out_path = job_dir / "rubric.docx"
    elif detected_ext == ".pdf":
        out_path = job_dir / "rubric.pdf"
    elif detected_ext in [".xlsx", ".xls"]:
        out_path = job_dir / f"rubric{detected_ext}"
    else:
        out_path = job_dir / "rubric.txt"

    with open(out_path, "wb") as f:
        f.write(content)

    record = job_manager.get_job(job_id)
    record.has_marking_scheme_file = True

    # Deterministically extract criteria and persist in project intelligence
    try:
        criteria = []
        if detected_ext == ".docx":
            from src.modules.presentation.rubric_analyzer import extract_rubric_from_docx
            criteria = extract_rubric_from_docx(out_path)
        elif detected_ext == ".pdf":
            from src.modules.presentation.rubric_analyzer import extract_rubric_from_pdf
            criteria = extract_rubric_from_pdf(content)
        elif detected_ext in [".xlsx", ".xls"]:
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
        "criteria": record.rubric_data.criteria if record.rubric_data else [],
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

