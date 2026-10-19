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
from src.modules.converters.universal_converter import sanitize_output_filename

app = FastAPI(
    title=config.app_name,
    version="1.0.0",
    description="Dedicated Academic Assignment Formatter API conforming to institution guidelines.",
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

# Exception Handlers
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, general_error_handler)

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request.state.request_id = str(uuid.uuid4())[:8]
    response = await call_next(request)
    response.headers["X-Request-Id"] = request.state.request_id
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
async def upload_assignment(file: UploadFile = File(...)):
    raw_filename = file.filename or "assignment.docx"
    safe_filename = sanitize_filename(raw_filename)

    if not safe_filename.lower().endswith(".docx"):
        raise FileValidationError(f"Only Microsoft Word (.docx) documents are supported. Received '{raw_filename}'")

    content = await file.read()
    if len(content) > config.max_upload_size_bytes:
        raise FileValidationError(f"File exceeds maximum allowed size of 25MB (Received {len(content) / (1024*1024):.1f}MB)")

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
    return {"message": "Marking scheme uploaded successfully", "job_id": job_id}

@app.get("/api/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    validate_uuid(job_id)
    return job_manager.get_status_response(job_id)

@app.post("/api/jobs/{job_id}/format", response_model=JobStatusResponse)
async def format_document(job_id: str, settings: FormattingSettings):
    validate_uuid(job_id)
    return job_manager.execute_formatting(job_id, settings)

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

