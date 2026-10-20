import uuid
import tempfile
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from src.config import config
from src.common.errors import FileValidationError
from src.common.security import validate_uuid
from src.common.format_detector import detect_file_format
from src.modules.presentation.ppt_generator import (
    PresentationOutline,
    extract_presentation_outline_from_docx,
    extract_presentation_outline_from_text,
    generate_powerpoint_presentation,
    THEMES,
)
from src.modules.converters.universal_converter import sanitize_output_filename
import pypdf

router = APIRouter(prefix="/api/presentation", tags=["Presentation Generator"])

class GeneratePresentationRequest(BaseModel):
    outline: PresentationOutline
    theme: str = "modern_academic"
    custom_filename: str = ""

@router.get("/themes")
async def get_presentation_themes():
    themes_list = [
        {
            "id": "modern_academic",
            "name": "Modern Academic",
            "description": "Clean, structured scholarly deep navy blue and warm amber accents with serif headings.",
            "is_dark": False,
            "primary_color": "#1E3A8A",
            "accent_color": "#B45309",
            "font_title": "Georgia",
        },
        {
            "id": "tech_innovation",
            "name": "Technology & Innovation",
            "description": "Contemporary technology visuals with vibrant cyan accents and sharp geometric layouts.",
            "is_dark": False,
            "primary_color": "#0F172A",
            "accent_color": "#06B6D4",
            "font_title": "Segoe UI",
        },
        {
            "id": "minimalist_premium",
            "name": "Minimalist Premium",
            "description": "Generous whitespace, elegant typography, and refined stone and ochre tones.",
            "is_dark": False,
            "primary_color": "#1C1917",
            "accent_color": "#D97706",
            "font_title": "Georgia",
        },
        {
            "id": "corporate_pro",
            "name": "Corporate Professional",
            "description": "Polished executive enterprise styling with royal blue and clean data cards.",
            "is_dark": False,
            "primary_color": "#0A2540",
            "accent_color": "#2563EB",
            "font_title": "Arial",
        },
        {
            "id": "creative_gradient",
            "name": "Creative Gradient",
            "description": "Tasteful gradient highlights, bold headlines, and vibrant fuchsia and violet accents.",
            "is_dark": False,
            "primary_color": "#4338CA",
            "accent_color": "#EC4899",
            "font_title": "Trebuchet MS",
        },
        {
            "id": "research_science",
            "name": "Research & Science",
            "description": "Tailored for scientific investigations, laboratory methodologies, and empirical findings.",
            "is_dark": False,
            "primary_color": "#065F46",
            "accent_color": "#0D9488",
            "font_title": "Trebuchet MS",
        },
        {
            "id": "dark_presentation",
            "name": "Dark Presentation",
            "description": "Readable dark obsidian background with high-contrast glowing cyan highlights.",
            "is_dark": True,
            "primary_color": "#0F172A",
            "accent_color": "#38BDF8",
            "font_title": "Segoe UI",
        },
        {
            "id": "university_classic",
            "name": "University Classic",
            "description": "Formal traditional academic prestige styling with Oxford blue, burgundy, and antique gold.",
            "is_dark": False,
            "primary_color": "#002147",
            "accent_color": "#800020",
            "font_title": "Georgia",
        },
    ]
    return {"themes": themes_list}

@router.post("/extract-outline", response_model=PresentationOutline)
async def extract_outline_from_file(file: UploadFile = File(...)):
    raw_filename = file.filename or "assignment.docx"
    content = await file.read()

    if len(content) > config.max_upload_size_bytes:
        raise FileValidationError("File size exceeds 25MB limit.")

    detected = detect_file_format(content, raw_filename)

    if detected == "docx":
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
            tmp.write(content)
            tmp_path = Path(tmp.name)
        try:
            outline = extract_presentation_outline_from_docx(tmp_path)
        finally:
            if tmp_path.exists():
                tmp_path.unlink()
        return outline

    elif detected == "pdf":
        import io
        reader = pypdf.PdfReader(io.BytesIO(content))
        full_text = "\n".join(page.extract_text() or "" for page in reader.pages)
        return extract_presentation_outline_from_text(full_text)

    elif detected in ["txt", "csv"]:
        text = content.decode("utf-8", errors="replace")
        return extract_presentation_outline_from_text(text)

    else:
        raise FileValidationError(
            f"Cannot extract presentation outline from '{detected}'. Supported formats: Word (.docx), PDF (.pdf), or Plain Text (.txt)."
        )

@router.post("/generate")
async def generate_presentation(req: GeneratePresentationRequest):
    pptx_bytes = generate_powerpoint_presentation(req.outline, theme_key=req.theme)

    default_stem = req.outline.title or "Presentation"
    safe_name = sanitize_output_filename(req.custom_filename, default_stem, ".pptx")

    presentation_id = str(uuid.uuid4())
    pres_dir = config.storage_dir / "presentations" / presentation_id
    pres_dir.mkdir(parents=True, exist_ok=True)

    out_file = pres_dir / safe_name
    with open(out_file, "wb") as f:
        f.write(pptx_bytes)

    return {
        "presentation_id": presentation_id,
        "filename": safe_name,
        "total_slides": len(req.outline.slides) + 1,  # +1 for title slide
        "size_bytes": len(pptx_bytes),
        "download_url": f"/api/presentation/download/{presentation_id}",
    }

@router.get("/download/{presentation_id}")
async def download_presentation_file(presentation_id: str, filename: str | None = None):
    validate_uuid(presentation_id)
    pres_dir = config.storage_dir / "presentations" / presentation_id
    if not pres_dir.exists():
        raise HTTPException(status_code=404, detail="Presentation not found or expired.")

    files = list(pres_dir.iterdir())
    if not files:
        raise HTTPException(status_code=404, detail="Presentation file not found.")

    target_file = files[0]
    out_name = filename if filename and filename.strip() else target_file.name

    return FileResponse(
        path=str(target_file),
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        filename=out_name,
    )
