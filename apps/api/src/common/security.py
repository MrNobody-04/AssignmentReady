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
            # Security Hardening: Reject macro-enabled files (.docm)
            if "word/vbaProject.bin" in namelist or any("vba" in n.lower() for n in namelist):
                raise FileValidationError(
                    f"File '{filename}' contains macros or VBA code. Macro-enabled documents (.docm) are strictly prohibited for security reasons."
                )
            if "[Content_Types].xml" in namelist:
                ct = zf.read("[Content_Types].xml").decode("utf-8", errors="ignore")
                if "macroEnabled" in ct:
                    raise FileValidationError(
                        f"File '{filename}' is a macro-enabled document (.docm), which is not permitted."
                    )
    except zipfile.BadZipFile:
        raise FileValidationError(f"File '{filename}' is corrupted or not a valid archive.")

def validate_text_or_markdown_bytes(content: bytes, filename: str) -> None:
    if b"\x00" in content:
        raise FileValidationError(f"File '{filename}' contains invalid binary data.")
    # Reject common binary executable headers
    if content.startswith(b"MZ") or content.startswith(b"\x7fELF"):
        raise FileValidationError(f"File '{filename}' is an executable file and cannot be processed.")
    try:
        content.decode("utf-8")
    except UnicodeDecodeError:
        raise FileValidationError(f"File '{filename}' must be valid UTF-8 encoded text.")

def detect_and_validate_upload(content: bytes, filename: str, allowed_extensions: list[str]) -> str:
    """Validates file size, determines true MIME/type from magic bytes, and enforces security restrictions."""
    if len(content) > config.max_upload_size_bytes:
        max_mb = config.max_upload_size_bytes / (1024 * 1024)
        raise FileValidationError(f"File '{filename}' exceeds maximum allowed size of {max_mb:.0f} MB.")

    if len(content) == 0:
        raise FileValidationError(f"File '{filename}' is empty.")

    detected_ext = None
    if content.startswith(b"PK\x03\x04"):
        validate_docx_bytes(content, filename)
        detected_ext = ".docx"
    elif content.startswith(b"%PDF-"):
        validate_pdf_bytes(content, filename)
        detected_ext = ".pdf"
    else:
        # Check if text or markdown
        validate_text_or_markdown_bytes(content, filename)
        suffix = Path(filename).suffix.lower()
        detected_ext = suffix if suffix in [".md", ".txt"] else ".txt"

    if detected_ext not in allowed_extensions and Path(filename).suffix.lower() not in allowed_extensions:
        raise FileValidationError(
            f"File '{filename}' format '{detected_ext}' is not permitted. Allowed formats: {', '.join(allowed_extensions)}"
        )
    return detected_ext

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
