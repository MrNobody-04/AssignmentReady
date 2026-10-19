import zipfile
import io
from typing import Literal

DetectedFormat = Literal[
    "docx", "pdf", "pptx", "xlsx", "png", "jpeg", "webp", "bmp", "tiff", "txt", "csv", "unknown"
]

def detect_file_format(content: bytes, filename: str = "") -> DetectedFormat:
    """
    Detect file format using magic bytes / binary signatures first,
    falling back to zip structure inspection or extension analysis.
    """
    if not content:
        return "unknown"

    # 1. PDF: %PDF-
    if content.startswith(b"%PDF-"):
        return "pdf"

    # 2. PNG: \x89PNG\r\n\x1a\n
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"

    # 3. JPEG: \xff\xd8\xff
    if content.startswith(b"\xff\xd8\xff"):
        return "jpeg"

    # 4. WEBP: RIFF....WEBP
    if len(content) >= 12 and content.startswith(b"RIFF") and content[8:12] == b"WEBP":
        return "webp"

    # 5. BMP: BM
    if content.startswith(b"BM"):
        return "bmp"

    # 6. TIFF: II*\x00 or MM\x00*
    if content.startswith(b"II*\x00") or content.startswith(b"MM\x00*"):
        return "tiff"

    # 7. Zip-based formats (DOCX, PPTX, XLSX)
    if content.startswith(b"PK\x03\x04"):
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as zf:
                namelist = zf.namelist()
                if any(name.startswith("word/") for name in namelist):
                    return "docx"
                if any(name.startswith("ppt/") for name in namelist):
                    return "pptx"
                if any(name.startswith("xl/") for name in namelist):
                    return "xlsx"
        except Exception:
            pass

    # 8. Check for UTF-8 / ASCII plain text / CSV
    try:
        sample = content[:4096].decode("utf-8")
        # Check if text
        ext = filename.lower().split(".")[-1] if "." in filename else ""
        if ext == "csv" or ("," in sample and "\n" in sample):
            return "csv"
        return "txt"
    except UnicodeDecodeError:
        pass

    # Fallback by extension if magic bytes didn't match
    ext = filename.lower().split(".")[-1] if "." in filename else ""
    if ext in ["docx", "pdf", "pptx", "xlsx", "png", "jpg", "jpeg", "webp", "bmp", "tiff", "txt", "csv"]:
        if ext in ["jpg", "jpeg"]:
            return "jpeg"
        return ext  # type: ignore

    return "unknown"
