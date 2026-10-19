import re
import uuid
import zipfile
import io
from pathlib import Path
from src.config import config
from src.common.errors import FileValidationError

FILENAME_SAFE_CHARS = re.compile(r"[^a-zA-Z0-9_\-\.]")

def validate_uuid(value: str) -> str:
    try:
        val = uuid.UUID(value, version=4)
        return str(val)
    except (ValueError, AttributeError):
        raise FileValidationError(f"Invalid identifier format: '{value}'")

def sanitize_filename(filename: str) -> str:
    cleaned = Path(filename).name
    safe_name = FILENAME_SAFE_CHARS.sub("_", cleaned).strip("._")
    if not safe_name:
        safe_name = "document.docx"
    return safe_name

def validate_docx_bytes(content: bytes, filename: str) -> None:
    # DOCX is an OOXML zip archive starting with PK\x03\x04
    if len(content) < 4 or not content.startswith(b"PK\x03\x04"):
        raise FileValidationError(
            f"File '{filename}' is not a valid Microsoft Word (.docx) document (invalid file signature)."
        )
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as zf:
            namelist = zf.namelist()
            if "word/document.xml" not in namelist:
                raise FileValidationError(
                    f"File '{filename}' does not appear to be a valid Word document (missing internal document structure)."
                )
    except zipfile.BadZipFile:
        raise FileValidationError(f"File '{filename}' is corrupted or not a valid archive.")

def validate_pdf_bytes(content: bytes, filename: str) -> None:
    if len(content) < 5 or not content.startswith(b"%PDF-"):
        raise FileValidationError(f"File '{filename}' is not a valid PDF document (missing PDF header).")

def get_job_directory(job_id: str, create: bool = False) -> Path:
    safe_id = validate_uuid(job_id)
    job_dir = (config.storage_dir / safe_id).resolve()
    # Path traversal check
    if not str(job_dir).startswith(str(config.storage_dir.resolve())):
        raise FileValidationError("Unauthorized directory traversal attempt detected.")
    if create:
        job_dir.mkdir(parents=True, exist_ok=True)
    return job_dir
