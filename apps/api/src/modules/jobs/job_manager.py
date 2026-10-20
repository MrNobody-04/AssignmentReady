import time
import shutil
import subprocess
from pathlib import Path
from typing import Dict, Optional, List
import docx

from src.config import config
from src.common.security import get_job_directory, sanitize_filename
from src.common.errors import JobNotFoundError, DocumentProcessingError
from src.modules.jobs.job_schema import (
    JobStatusResponse,
    InspectionResult,
    FormattingSettings,
    ComplianceReport,
    DocumentVersionInfo,
    ProjectPresentationRecord,
    RubricProjectData,
    ProjectDetailResponse,
)
from src.modules.documents.inspector import inspect_docx
from src.modules.documents.formatter import apply_formatting
from src.modules.documents.compliance import audit_compliance

class DocumentVersionRecord:
    def __init__(
        self,
        version_id: int,
        version_label: str,
        filename: str,
        file_path: Path,
        file_type: str = "docx",
        operation: str = "original",
        source_version_id: Optional[int] = None,
        created_at: Optional[float] = None,
    ):
        self.version_id = version_id
        self.version_label = version_label
        self.filename = filename
        self.file_path = file_path
        self.file_type = file_type
        self.operation = operation
        self.source_version_id = source_version_id
        self.created_at = created_at or time.time()
        self.is_valid = True

    @property
    def file_size_bytes(self) -> int:
        try:
            if self.file_path.exists():
                return self.file_path.stat().st_size
        except Exception:
            pass
        return 0

    def to_info(self, job_id: str) -> DocumentVersionInfo:
        return DocumentVersionInfo(
            version_id=self.version_id,
            version_label=self.version_label,
            filename=self.filename,
            file_type=self.file_type,
            operation=self.operation,
            source_version_id=self.source_version_id,
            created_at=self.created_at,
            file_size_bytes=self.file_size_bytes,
            is_valid=self.is_valid,
            download_url=f"/api/jobs/{job_id}/versions/{self.version_id}/download",
        )

class JobRecord:
    def __init__(self, job_id: str, original_filename: str):
        self.job_id = job_id
        self.project_id = job_id
        self.original_filename = original_filename
        self.created_at = time.time()
        self.updated_at = time.time()
        self.has_cover_template = False
        self.has_guidelines = False
        self.has_marking_scheme_file = False
        self.is_formatted = False
        self.has_pdf_version = False
        self.inspection: InspectionResult | None = None
        self.compliance: ComplianceReport | None = None
        self.settings: FormattingSettings | None = None

        # Versioning & Shared Project Models
        self.versions: List[DocumentVersionRecord] = []
        self.current_version_id: int = 1
        self.rubric_data: Optional[RubricProjectData] = None
        self.presentations: List[ProjectPresentationRecord] = []

    def get_version(self, version_id: Optional[int] = None) -> Optional[DocumentVersionRecord]:
        if not self.versions:
            return None
        target_id = version_id if version_id is not None else self.current_version_id
        for v in self.versions:
            if v.version_id == target_id:
                return v
        return self.versions[-1]

    def get_latest_version(self) -> DocumentVersionRecord:
        if not self.versions:
            raise DocumentProcessingError("No document versions exist for this project.")
        return self.versions[-1]

    def add_version(
        self,
        label: str,
        filename: str,
        file_path: Path,
        operation: str = "formatted",
        source_version_id: Optional[int] = None,
        file_type: str = "docx",
    ) -> DocumentVersionRecord:
        next_id = 1
        if self.versions:
            next_id = max(v.version_id for v in self.versions) + 1

        rec = DocumentVersionRecord(
            version_id=next_id,
            version_label=label,
            filename=filename,
            file_path=file_path,
            file_type=file_type,
            operation=operation,
            source_version_id=source_version_id,
        )
        self.versions.append(rec)
        self.current_version_id = next_id
        self.updated_at = time.time()
        return rec

    def add_presentation(
        self,
        presentation_id: str,
        source_version_id: int,
        theme: str,
        total_slides: int,
        filename: str,
        download_url: str,
    ) -> ProjectPresentationRecord:
        rec = ProjectPresentationRecord(
            presentation_id=presentation_id,
            source_version_id=source_version_id,
            theme=theme,
            total_slides=total_slides,
            filename=filename,
            created_at=time.time(),
            download_url=download_url,
            is_stale=self.current_version_id > source_version_id,
        )
        self.presentations.append(rec)
        self.updated_at = time.time()
        return rec

    def get_versions_info(self) -> List[DocumentVersionInfo]:
        return [v.to_info(self.job_id) for v in self.versions]

class JobManager:
    def __init__(self):
        self._jobs: Dict[str, JobRecord] = {}

    def create_job(self, job_id: str, original_filename: str) -> JobRecord:
        record = JobRecord(job_id=job_id, original_filename=original_filename)

        # Set up versions directory and register Version 1
        job_dir = get_job_directory(job_id, create=True)
        versions_dir = job_dir / "versions"
        versions_dir.mkdir(parents=True, exist_ok=True)

        v1_path = versions_dir / f"v1_{sanitize_filename(original_filename)}"
        orig_root = job_dir / "original.docx"

        # If original.docx was already written in root, copy to v1_path
        if orig_root.exists() and not v1_path.exists():
            shutil.copy2(orig_root, v1_path)

        rec = DocumentVersionRecord(
            version_id=1,
            version_label="Version 1 (Original)",
            filename=original_filename,
            file_path=v1_path,
            file_type="docx",
            operation="original",
            source_version_id=None,
        )
        record.versions.append(rec)
        record.current_version_id = 1

        self._jobs[job_id] = record
        return record

    def get_job(self, job_id: str) -> JobRecord:
        record = self._jobs.get(job_id)
        if not record:
            job_dir = get_job_directory(job_id, create=False)
            orig_file = job_dir / "original.docx"
            if orig_file.exists():
                record = JobRecord(job_id=job_id, original_filename="document.docx")
                record.inspection = inspect_docx(orig_file)

                # Reconstruct versions from disk
                versions_dir = job_dir / "versions"
                if versions_dir.exists():
                    v_files = sorted(list(versions_dir.glob("v*.*")), key=lambda p: p.name)
                    for vf in v_files:
                        name_parts = vf.stem.split("_", 1)
                        v_num = 1
                        if name_parts[0].startswith("v") and name_parts[0][1:].isdigit():
                            v_num = int(name_parts[0][1:])
                        op = "original" if v_num == 1 else ("doctor_repaired" if "repaired" in vf.stem.lower() else "formatted")
                        lbl = f"Version {v_num} ({op.replace('_', ' ').title()})"
                        rec = DocumentVersionRecord(
                            version_id=v_num,
                            version_label=lbl,
                            filename=vf.name,
                            file_path=vf,
                            file_type=vf.suffix.lstrip("."),
                            operation=op,
                            source_version_id=v_num - 1 if v_num > 1 else None,
                        )
                        record.versions.append(rec)
                if not record.versions:
                    v1_rec = DocumentVersionRecord(
                        version_id=1,
                        version_label="Version 1 (Original)",
                        filename="document.docx",
                        file_path=orig_file,
                        operation="original",
                    )
                    record.versions.append(v1_rec)
                    fmt_file = job_dir / "formatted.docx"
                    if fmt_file.exists():
                        v2_rec = DocumentVersionRecord(
                            version_id=2,
                            version_label="Version 2 (Formatted)",
                            filename="document_Formatted.docx",
                            file_path=fmt_file,
                            operation="formatted",
                            source_version_id=1,
                        )
                        record.versions.append(v2_rec)
                        record.current_version_id = 2

                self._jobs[job_id] = record
            else:
                raise JobNotFoundError(job_id)
        return record

    def get_status_response(self, job_id: str) -> JobStatusResponse:
        record = self.get_job(job_id)
        job_dir = get_job_directory(job_id)
        fmt_file = job_dir / "formatted.docx"
        pdf_file = job_dir / "formatted.pdf"

        # Update presentation staleness flags
        for p in record.presentations:
            p.is_stale = record.current_version_id > p.source_version_id

        return JobStatusResponse(
            job_id=record.job_id,
            original_filename=record.original_filename,
            has_cover_template=record.has_cover_template or (job_dir / "cover_template.docx").exists(),
            has_guidelines=record.has_guidelines or (job_dir / "guidelines.pdf").exists() or (job_dir / "guidelines.docx").exists(),
            has_marking_scheme_file=record.has_marking_scheme_file or (job_dir / "rubric.pdf").exists() or (job_dir / "rubric.docx").exists() or (record.rubric_data is not None),
            is_formatted=fmt_file.exists() or len(record.versions) > 1,
            has_pdf_version=pdf_file.exists(),
            inspection=record.inspection,
            compliance=record.compliance,
            project_id=record.project_id,
            current_version_id=record.current_version_id,
            versions=record.get_versions_info(),
            rubric_data=record.rubric_data,
            presentations=record.presentations,
        )

    def execute_formatting(
        self,
        job_id: str,
        settings: FormattingSettings,
        source_version_id: Optional[int] = None,
    ) -> JobStatusResponse:
        record = self.get_job(job_id)
        job_dir = get_job_directory(job_id)
        versions_dir = job_dir / "versions"
        versions_dir.mkdir(parents=True, exist_ok=True)

        source_v = record.get_version(source_version_id)
        if not source_v or not source_v.file_path.exists():
            input_file = job_dir / "original.docx"
            source_id = 1
        else:
            input_file = source_v.file_path
            source_id = source_v.version_id

        if not input_file.exists():
            raise DocumentProcessingError("Original assignment file was not found in storage.")

        base_stem = Path(record.original_filename).stem
        next_v_id = max((v.version_id for v in record.versions), default=1) + 1
        v_out_path = versions_dir / f"v{next_v_id}_{base_stem}_Formatted.docx"
        output_file = job_dir / "formatted.docx"

        cover_tpl = job_dir / "cover_template.docx"
        tpl_path = cover_tpl if cover_tpl.exists() else None

        # Run formatting to output version file
        apply_formatting(
            input_file=input_file,
            output_file=v_out_path,
            settings=settings,
            cover_template_path=tpl_path,
        )

        # Validate that the formatted output opens cleanly
        try:
            docx.Document(str(v_out_path))
        except Exception as e:
            raise DocumentProcessingError(f"Generated formatted document failed validation: {str(e)}")

        # Copy to formatted.docx root for download compatibility
        shutil.copy2(v_out_path, output_file)

        # Register Version in project record
        record.add_version(
            label=f"Version {next_v_id} (Formatted)",
            filename=f"{base_stem}_Formatted_v{next_v_id}.docx",
            file_path=v_out_path,
            operation="formatted",
            source_version_id=source_id,
        )

        # Audit compliance on formatted document
        report = audit_compliance(v_out_path, settings)
        record.compliance = report
        record.settings = settings
        record.is_formatted = True

        # Optional LibreOffice PDF conversion
        if config.libreoffice_path:
            self._convert_to_pdf_libreoffice(output_file, job_dir)

        return self.get_status_response(job_id)

    def save_doctor_repair(
        self,
        job_id: str,
        repaired_file_path: Path,
        source_version_id: int,
        actions_applied: List[str],
    ) -> DocumentVersionRecord:
        record = self.get_job(job_id)
        job_dir = get_job_directory(job_id)
        versions_dir = job_dir / "versions"
        versions_dir.mkdir(parents=True, exist_ok=True)

        # Validate the new file
        try:
            docx.Document(str(repaired_file_path))
        except Exception as e:
            raise DocumentProcessingError(f"Doctor-repaired document failed validation: {str(e)}")

        base_stem = Path(record.original_filename).stem
        next_v_id = max((v.version_id for v in record.versions), default=1) + 1
        permanent_v_path = versions_dir / f"v{next_v_id}_{base_stem}_Doctor_Repaired.docx"

        # Copy repaired file into versions directory
        shutil.copy2(repaired_file_path, permanent_v_path)
        # Update formatted.docx pointer
        shutil.copy2(permanent_v_path, job_dir / "formatted.docx")

        v_rec = record.add_version(
            label=f"Version {next_v_id} (Doctor Repaired)",
            filename=f"{base_stem}_Doctor_Repaired_v{next_v_id}.docx",
            file_path=permanent_v_path,
            operation="doctor_repaired",
            source_version_id=source_version_id,
        )
        record.is_formatted = True
        return v_rec

    def set_current_version(self, job_id: str, version_id: int) -> DocumentVersionInfo:
        record = self.get_job(job_id)
        v = record.get_version(version_id)
        if not v or not v.file_path.exists():
            raise DocumentProcessingError(f"Document version {version_id} does not exist in project.")

        record.current_version_id = version_id
        record.updated_at = time.time()

        # Update root formatted.docx pointer to match active version
        job_dir = get_job_directory(job_id)
        shutil.copy2(v.file_path, job_dir / "formatted.docx")

        return v.to_info(job_id)

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
        for jid, rec in list(self._jobs.items()):
            if (now - rec.created_at) > config.job_ttl_seconds:
                expired.append(jid)
        for jid in expired:
            self.delete_job(jid)

        # Also purge any orphaned directories on disk older than TTL
        evicted_disk = 0
        if config.storage_dir.exists():
            for item in config.storage_dir.iterdir():
                if item.is_dir():
                    try:
                        mtime = item.stat().st_mtime
                        if (now - mtime) > config.job_ttl_seconds:
                            shutil.rmtree(item, ignore_errors=True)
                            evicted_disk += 1
                    except Exception:
                        pass
        return len(expired) + evicted_disk

job_manager = JobManager()
