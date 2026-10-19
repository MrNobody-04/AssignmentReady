from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, Depends
from fastapi.responses import FileResponse, JSONResponse

from src.config import config
from src.common.errors import FileValidationError, JobNotFoundError
from src.common.security import validate_uuid, get_job_directory, sanitize_filename
from src.modules.jobs.job_schema import (
    JobStatusResponse,
    FormattingSettings,
    InspectionResult,
    ComplianceReport,
)
from src.modules.jobs.job_manager import job_manager
from src.modules.documents.converter import is_libreoffice_available

router = APIRouter(prefix="/api", tags=["Document Processing"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": config.app_name,
        "libreoffice_available": is_libreoffice_available(),
        "storage_ready": config.storage_dir.exists(),
    }

@router.post("/upload")
async def upload_assignment(file: UploadFile = File(...)):
    filename = file.filename or "assignment.docx"
    content = await file.read()

    if len(content) > config.max_upload_size_bytes:
        raise FileValidationError(
            f"File size ({len(content) // (1024 * 1024)} MB) exceeds the maximum allowed limit of {config.max_upload_size_bytes // (1024 * 1024)} MB."
        )

    job_id = job_manager.create_job(filename, content)
    inspection = job_manager.inspect_job(job_id)

    return {
        "job_id": job_id,
        "filename": filename,
        "inspection": inspection,
    }

@router.post("/upload/template/{job_id}")
async def upload_cover_template(job_id: str, file: UploadFile = File(...)):
    validate_uuid(job_id)
    content = await file.read()
    filename = file.filename or "template.docx"
    job_manager.save_cover_template(job_id, filename, content)
    return {"status": "success", "message": "Cover page template attached successfully."}

@router.post("/upload/guidelines/{job_id}")
async def upload_guidelines(job_id: str, file: UploadFile = File(...)):
    validate_uuid(job_id)
    content = await file.read()
    filename = file.filename or "guidelines.pdf"
    job_manager.save_guidelines(job_id, filename, content)
    return {"status": "success", "message": "College guidelines attached successfully."}

@router.post("/upload/marking-scheme/{job_id}")
async def upload_marking_scheme(job_id: str, file: UploadFile = File(...)):
    validate_uuid(job_id)
    content = await file.read()
    filename = file.filename or "rubric.docx"
    job_manager.save_marking_scheme(job_id, filename, content)
    return {"status": "success", "message": "Marking scheme attached successfully."}

@router.post("/inspect/{job_id}", response_model=InspectionResult)
async def inspect_document(job_id: str):
    validate_uuid(job_id)
    return job_manager.inspect_job(job_id)

@router.post("/format/{job_id}", response_model=JobStatusResponse)
async def format_document(job_id: str, settings: FormattingSettings):
    validate_uuid(job_id)
    return job_manager.format_document(job_id, settings)

@router.post("/check-compliance/{job_id}", response_model=ComplianceReport)
async def check_document_compliance(job_id: str, settings: FormattingSettings):
    validate_uuid(job_id)
    job_dir = get_job_directory(job_id)
    doc_path = job_dir / "formatted.docx" if (job_dir / "formatted.docx").exists() else job_dir / "original.docx"
    if not doc_path.exists():
        raise JobNotFoundError(job_id)
    from src.modules.documents.compliance import check_compliance
    return check_compliance(doc_path, settings)

@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    validate_uuid(job_id)
    return job_manager.get_job_status(job_id)

@router.get("/download/{job_id}")
async def download_formatted_file(job_id: str, format: str = "docx"):
    validate_uuid(job_id)
    job_dir = get_job_directory(job_id)
    meta = job_manager.get_job_meta(job_id)

    orig_stem = Path(meta.get("original_filename", "assignment")).stem
    safe_base = sanitize_filename(orig_stem)

    if format.lower() == "pdf":
        pdf_path = job_dir / "formatted.pdf"
        if not pdf_path.exists():
            return JSONResponse(
                status_code=404,
                content={
                    "error": {
                        "code": "PDF_UNAVAILABLE",
                        "message": "PDF rendering is not available for this job (LibreOffice was not detected on the server). Please download the Word (.docx) document.",
                    }
                },
            )
        return FileResponse(
            path=pdf_path,
            filename=f"{safe_base}_Formatted.pdf",
            media_type="application/pdf",
        )

    # Default to .docx
    docx_path = job_dir / "formatted.docx"
    if not docx_path.exists():
        docx_path = job_dir / "original.docx"
    if not docx_path.exists():
        raise JobNotFoundError(job_id)

    return FileResponse(
        path=docx_path,
        filename=f"{safe_base}_Formatted.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )

@router.delete("/jobs/{job_id}")
async def delete_job_files(job_id: str):
    validate_uuid(job_id)
    deleted = job_manager.delete_job(job_id)
    return {
        "status": "success" if deleted else "not_found",
        "message": f"Job {job_id} data deleted.",
    }
