import uuid
import tempfile
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from pydantic import BaseModel, Field

from src.config import config
from src.common.errors import FileValidationError, JobNotFoundError
from src.common.security import validate_uuid, sanitize_filename, validate_docx_bytes, get_job_directory
from src.modules.jobs.job_schema import FormattingSettings
from src.modules.jobs.job_manager import job_manager
from src.modules.doctor.doctor_engine import (
    diagnose_document,
    fix_document_issues,
    DoctorDiagnosisResponse,
)

router = APIRouter(prefix="/api/doctor", tags=["Assignment Doctor"])

class FixRequest(BaseModel):
    settings: Optional[FormattingSettings] = None
    selected_action_ids: list[str] = Field(default_factory=list)
    fix_all_safe: bool = False
    version_id: Optional[int] = None

class FixResponse(BaseModel):
    job_id: str
    repaired_filename: str
    download_url: str
    updated_diagnosis: DoctorDiagnosisResponse
    fixes_applied: list[str]

@router.post("/diagnose-upload", response_model=DoctorDiagnosisResponse)
async def diagnose_uploaded_assignment(file: UploadFile = File(...)):
    raw_filename = file.filename or "assignment.docx"
    safe_filename = sanitize_filename(raw_filename)

    content = await file.read()
    if len(content) > config.max_upload_size_bytes:
        raise FileValidationError(f"File exceeds maximum allowed size of 25MB.")

    # Convert PDF or TXT if needed
    if content.startswith(b"%PDF-") or raw_filename.lower().endswith(".pdf"):
        from src.modules.converters.universal_converter import convert_pdf_to_docx
        content = convert_pdf_to_docx(content)
        if not safe_filename.lower().endswith(".docx"):
            safe_filename = f"{Path(safe_filename).stem}.docx"
    elif not content.startswith(b"PK\x03\x04"):
        try:
            text_str = content.decode("utf-8")
            from src.modules.converters.universal_converter import convert_txt_to_docx
            content = convert_txt_to_docx(text_str)
            if not safe_filename.lower().endswith(".docx"):
                safe_filename = f"{Path(safe_filename).stem}.docx"
        except Exception:
            validate_docx_bytes(content, safe_filename)
    else:
        validate_docx_bytes(content, safe_filename)

    job_id = str(uuid.uuid4())
    job_dir = get_job_directory(job_id, create=True)
    orig_path = job_dir / "original.docx"

    with open(orig_path, "wb") as f:
        f.write(content)

    record = job_manager.create_job(job_id, safe_filename)
    default_settings = FormattingSettings()
    record.settings = default_settings

    return diagnose_document(
        doc_path=orig_path,
        job_id=job_id,
        settings=default_settings,
        version_id=1,
        version_label="Version 1 (Original)",
        is_latest=True,
    )

@router.get("/diagnose/{job_id}", response_model=DoctorDiagnosisResponse)
async def diagnose_existing_job(job_id: str, version_id: Optional[int] = None):
    validate_uuid(job_id)
    record = job_manager.get_job(job_id)
    v_rec = record.get_version(version_id)

    if not v_rec or not v_rec.file_path.exists():
        job_dir = get_job_directory(job_id, create=False)
        target_file = job_dir / "formatted.docx"
        if not target_file.exists():
            target_file = job_dir / "original.docx"
        if not target_file.exists():
            raise JobNotFoundError(job_id)
        v_id = 1
        v_lbl = "Version 1 (Original)"
    else:
        target_file = v_rec.file_path
        v_id = v_rec.version_id
        v_lbl = v_rec.version_label

    settings = record.settings or FormattingSettings()
    rubric_criteria = record.rubric_data.criteria if record.rubric_data else None

    return diagnose_document(
        doc_path=target_file,
        job_id=job_id,
        settings=settings,
        version_id=v_id,
        version_label=v_lbl,
        is_latest=(v_id == record.current_version_id),
        rubric_criteria=rubric_criteria,
    )

@router.post("/fix/{job_id}", response_model=FixResponse)
async def fix_assignment_issues(job_id: str, req: FixRequest):
    validate_uuid(job_id)
    record = job_manager.get_job(job_id)

    # 1. Select source document version
    source_v = record.get_version(req.version_id)
    if not source_v or not source_v.file_path.exists():
        job_dir = get_job_directory(job_id, create=False)
        src_path = job_dir / "formatted.docx"
        if not src_path.exists():
            src_path = job_dir / "original.docx"
        if not src_path.exists():
            raise JobNotFoundError(job_id)
        src_version_id = 1
        src_label = "Version 1 (Original)"
    else:
        src_path = source_v.file_path
        src_version_id = source_v.version_id
        src_label = source_v.version_label

    settings = req.settings or record.settings or FormattingSettings()
    rubric_criteria = record.rubric_data.criteria if record.rubric_data else None

    # Baseline diagnosis to compare resolved vs remaining issues
    baseline_diagnosis = diagnose_document(
        doc_path=src_path,
        job_id=job_id,
        settings=settings,
        version_id=src_version_id,
        version_label=src_label,
        rubric_criteria=rubric_criteria,
    )

    # 2. Determine actions to execute
    actions = req.selected_action_ids
    if req.fix_all_safe or not actions:
        actions = [
            "standardize_body_font",
            "apply_standard_margins",
            "inject_cover_page",
            "inject_table_of_contents",
            "purge_empty_paragraphs",
        ]

    # 3. Apply fixes to temporary working copy
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp_file:
        tmp_output_path = Path(tmp_file.name)

    try:
        fix_document_issues(
            doc_path=src_path,
            output_path=tmp_output_path,
            settings=settings,
            selected_fix_actions=actions,
        )

        # 4. Save repaired document as a new version in project
        new_v_rec = job_manager.save_doctor_repair(
            job_id=job_id,
            repaired_file_path=tmp_output_path,
            source_version_id=src_version_id,
            actions_applied=actions,
        )
    finally:
        if tmp_output_path.exists():
            try:
                tmp_output_path.unlink()
            except Exception:
                pass

    # 5. Re-diagnose newly created version
    updated_diagnosis = diagnose_document(
        doc_path=new_v_rec.file_path,
        job_id=job_id,
        settings=settings,
        version_id=new_v_rec.version_id,
        version_label=new_v_rec.version_label,
        is_latest=True,
        rubric_criteria=rubric_criteria,
    )

    # Calculate resolved vs unresolved
    old_issue_ids = {i.id for i in baseline_diagnosis.issues}
    new_issue_ids = {i.id for i in updated_diagnosis.issues}
    resolved_count = len(old_issue_ids - new_issue_ids)
    unresolved_count = len(new_issue_ids)

    updated_diagnosis.resolved_issues_count = resolved_count
    updated_diagnosis.unresolved_issues_count = unresolved_count

    return FixResponse(
        job_id=job_id,
        repaired_filename=new_v_rec.filename,
        download_url=f"/api/jobs/{job_id}/versions/{new_v_rec.version_id}/download",
        updated_diagnosis=updated_diagnosis,
        fixes_applied=actions,
    )
