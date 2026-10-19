import time
import shutil
import subprocess
from pathlib import Path
from typing import Dict
from src.config import config
from src.common.security import get_job_directory, sanitize_filename
from src.common.errors import JobNotFoundError, DocumentProcessingError
from src.modules.jobs.job_schema import (
    JobStatusResponse,
    InspectionResult,
    FormattingSettings,
    ComplianceReport,
)
from src.modules.documents.inspector import inspect_docx
from src.modules.documents.formatter import apply_formatting
from src.modules.documents.compliance import audit_compliance

class JobRecord:
    def __init__(self, job_id: str, original_filename: str):
        self.job_id = job_id
        self.original_filename = original_filename
        self.created_at = time.time()
        self.has_cover_template = False
        self.has_guidelines = False
        self.has_marking_scheme_file = False
        self.is_formatted = False
        self.has_pdf_version = False
        self.inspection: InspectionResult | None = None
        self.compliance: ComplianceReport | None = None
        self.settings: FormattingSettings | None = None

class JobManager:
    def __init__(self):
        self._jobs: Dict[str, JobRecord] = {}

    def create_job(self, job_id: str, original_filename: str) -> JobRecord:
        record = JobRecord(job_id=job_id, original_filename=original_filename)
        self._jobs[job_id] = record
        return record

    def get_job(self, job_id: str) -> JobRecord:
        record = self._jobs.get(job_id)
        if not record:
            # Check if directory exists on disk
            job_dir = get_job_directory(job_id, create=False)
            orig_file = job_dir / "original.docx"
            if orig_file.exists():
                record = JobRecord(job_id=job_id, original_filename="document.docx")
                record.inspection = inspect_docx(orig_file)
                self._jobs[job_id] = record
            else:
                raise JobNotFoundError(job_id)
        return record

    def get_status_response(self, job_id: str) -> JobStatusResponse:
        record = self.get_job(job_id)
        job_dir = get_job_directory(job_id)
        fmt_file = job_dir / "formatted.docx"
        pdf_file = job_dir / "formatted.pdf"

        return JobStatusResponse(
            job_id=record.job_id,
            original_filename=record.original_filename,
            has_cover_template=record.has_cover_template or (job_dir / "cover_template.docx").exists(),
            has_guidelines=record.has_guidelines or (job_dir / "guidelines.pdf").exists() or (job_dir / "guidelines.docx").exists(),
            has_marking_scheme_file=record.has_marking_scheme_file or (job_dir / "rubric.pdf").exists() or (job_dir / "rubric.docx").exists(),
            is_formatted=fmt_file.exists(),
            has_pdf_version=pdf_file.exists(),
            inspection=record.inspection,
            compliance=record.compliance,
        )

    def execute_formatting(self, job_id: str, settings: FormattingSettings) -> JobStatusResponse:
        record = self.get_job(job_id)
        job_dir = get_job_directory(job_id)
        input_file = job_dir / "original.docx"
        output_file = job_dir / "formatted.docx"

        if not input_file.exists():
            raise DocumentProcessingError("Original assignment file was not found in storage.")

        cover_tpl = job_dir / "cover_template.docx"
        tpl_path = cover_tpl if cover_tpl.exists() else None

        # Run formatting
        apply_formatting(
            input_file=input_file,
            output_file=output_file,
            settings=settings,
            cover_template_path=tpl_path,
        )

        # Audit compliance on formatted document
        report = audit_compliance(output_file, settings)
        record.compliance = report
        record.settings = settings
        record.is_formatted = True

        # Optional LibreOffice PDF conversion
        if config.libreoffice_path:
            self._convert_to_pdf_libreoffice(output_file, job_dir)

        return self.get_status_response(job_id)

    def _convert_to_pdf_libreoffice(self, docx_path: Path, output_dir: Path) -> None:
        try:
            cmd = [
                config.libreoffice_path,
                "--headless",
                "--convert-to",
                "pdf",
                str(docx_path),
                "--outdir",
                str(output_dir),
            ]
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=45, check=True)
        except Exception:
            pass  # Non-fatal if conversion fails or times out

    def delete_job(self, job_id: str) -> None:
        job_dir = get_job_directory(job_id)
        if job_dir.exists():
            shutil.rmtree(job_dir, ignore_errors=True)
        if job_id in self._jobs:
            del self._jobs[job_id]

    def cleanup_expired_jobs(self) -> int:
        now = time.time()
        expired = []
        for jid, rec in self._jobs.items():
            if (now - rec.created_at) > config.job_ttl_seconds:
                expired.append(jid)
        for jid in expired:
            self.delete_job(jid)
        return len(expired)

job_manager = JobManager()
