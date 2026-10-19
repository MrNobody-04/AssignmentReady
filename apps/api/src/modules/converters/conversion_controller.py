import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse

from src.config import config
from src.common.errors import FileValidationError
from src.common.security import validate_uuid, sanitize_filename
from src.common.format_detector import detect_file_format
from src.modules.converters.conversion_registry import get_conversion_registry
from src.modules.converters.universal_converter import (
    sanitize_output_filename,
    convert_image_to_pdf,
    convert_image_format,
    convert_csv_to_xlsx,
    convert_txt_to_docx,
    convert_pdf_to_docx,
    convert_csv_to_docx_table,
    convert_source_to_pptx,
    is_libreoffice_available,
    convert_docx_to_pdf,
)

router = APIRouter(prefix="/api/conversions", tags=["Universal Conversion"])

MIME_TYPES = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "txt": "text/plain",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
}

@router.get("/registry")
async def get_registry():
    return {
        "registry": get_conversion_registry(),
        "libreoffice_available": is_libreoffice_available(),
    }

@router.post("/convert")
async def convert_file(
    file: UploadFile = File(...),
    target_format: str = Form(...),
    custom_filename: str = Form(""),
    theme: str = Form("academic_classic"),
):
    raw_filename = file.filename or "uploaded_file"
    content = await file.read()

    if len(content) > config.max_upload_size_bytes:
        raise FileValidationError(
            f"File exceeds maximum allowed size of {config.max_upload_size_bytes // (1024 * 1024)}MB."
        )

    # Detect input format via magic bytes
    detected = detect_file_format(content, raw_filename)
    if detected == "unknown":
        raise FileValidationError(
            f"Unsupported or unrecognized file format for '{raw_filename}'. Please upload a valid document or image."
        )

    target_fmt = target_format.lower().lstrip(".")
    out_ext = f".{target_fmt}" if not target_fmt.startswith(".") else target_fmt

    # Perform real conversion based on detected input and requested target
    output_bytes: bytes

    if target_fmt == "pdf":
        if detected in ["png", "jpeg", "webp", "bmp", "tiff"]:
            output_bytes = convert_image_to_pdf(content)
        elif detected == "docx":
            if not is_libreoffice_available():
                raise HTTPException(
                    status_code=400,
                    detail="PDF conversion from Word (.docx) requires headless LibreOffice, which is not installed on this server.",
                )
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
                tmp.write(content)
                tmp_path = Path(tmp.name)
            try:
                pdf_path = convert_docx_to_pdf(tmp_path)
                if not pdf_path or not pdf_path.exists():
                    raise FileValidationError("Headless LibreOffice failed to generate PDF.")
                with open(pdf_path, "rb") as f:
                    output_bytes = f.read()
            finally:
                if tmp_path.exists():
                    tmp_path.unlink()
        else:
            raise FileValidationError(f"Cannot convert '{detected}' to PDF directly.")

    elif target_fmt == "docx":
        if detected == "pdf":
            output_bytes = convert_pdf_to_docx(content)
        elif detected == "txt":
            output_bytes = convert_txt_to_docx(content.decode("utf-8", "replace"))
        elif detected == "csv":
            output_bytes = convert_csv_to_docx_table(content)
        else:
            raise FileValidationError(f"Cannot convert '{detected}' to Word document (.docx).")

    elif target_fmt == "xlsx":
        if detected == "csv":
            output_bytes = convert_csv_to_xlsx(content)
        else:
            raise FileValidationError(f"Cannot convert '{detected}' to Excel (.xlsx). Expected CSV input.")

    elif target_fmt == "pptx":
        output_bytes = convert_source_to_pptx(content, detected, theme=theme)

    elif target_fmt == "txt":
        if detected == "docx":
            import docx
            import io
            doc = docx.Document(io.BytesIO(content))
            full_text = "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
            output_bytes = full_text.encode("utf-8")
        elif detected == "pdf":
            import pypdf
            import io
            reader = pypdf.PdfReader(io.BytesIO(content))
            full_text = "\n\n".join(page.extract_text() or "" for page in reader.pages)
            output_bytes = full_text.encode("utf-8")
        else:
            output_bytes = content

    elif target_fmt in ["png", "jpeg", "jpg"]:
        if detected in ["png", "jpeg", "webp", "bmp", "tiff"]:
            output_bytes = convert_image_format(content, target_fmt)
        else:
            raise FileValidationError(f"Cannot convert non-image '{detected}' to {target_fmt}.")
    else:
        raise FileValidationError(f"Unsupported target format: '{target_fmt}'")

    # Generate sanitized output filename
    orig_stem = Path(raw_filename).stem
    safe_output_name = sanitize_output_filename(custom_filename, orig_stem, out_ext)

    # Persist converted file in storage
    conversion_id = str(uuid.uuid4())
    conv_dir = config.storage_dir / "conversions" / conversion_id
    conv_dir.mkdir(parents=True, exist_ok=True)

    out_file = conv_dir / safe_output_name
    with open(out_file, "wb") as f:
        f.write(output_bytes)

    return {
        "conversion_id": conversion_id,
        "original_filename": raw_filename,
        "detected_format": detected,
        "target_format": target_fmt,
        "output_filename": safe_output_name,
        "size_bytes": len(output_bytes),
        "download_url": f"/api/conversions/download/{conversion_id}",
    }

@router.get("/download/{conversion_id}")
async def download_converted_file(conversion_id: str, filename: str | None = None):
    validate_uuid(conversion_id)
    conv_dir = config.storage_dir / "conversions" / conversion_id
    if not conv_dir.exists():
        raise HTTPException(status_code=404, detail="Conversion not found or expired.")

    files = list(conv_dir.iterdir())
    if not files:
        raise HTTPException(status_code=404, detail="Converted file not found.")

    target_file = files[0]
    out_name = filename if filename and filename.strip() else target_file.name

    ext = target_file.suffix.lower().lstrip(".")
    media_type = MIME_TYPES.get(ext, "application/octet-stream")

    return FileResponse(
        path=str(target_file),
        media_type=media_type,
        filename=out_name,
    )
