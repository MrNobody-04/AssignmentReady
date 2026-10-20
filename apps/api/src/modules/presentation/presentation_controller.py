import uuid
import tempfile
import io
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from src.config import config
from src.common.errors import FileValidationError
from src.common.security import validate_uuid
from src.common.format_detector import detect_file_format
from src.modules.presentation.report_analyzer import (
    analyze_docx_report,
    analyze_pdf_report,
    analyze_text_report,
    StructuredReport,
)
from src.modules.presentation.rubric_analyzer import (
    extract_rubric_from_docx,
    extract_rubric_from_xlsx,
    extract_rubric_from_pdf,
    extract_rubric_from_text,
    map_report_to_rubric,
    AssessmentCriterion,
    RubricAnalysisResult,
)
from src.modules.presentation.ppt_generator import (
    PresentationOutline,
    PresenterInfo,
    SlideItem,
    extract_presentation_outline_from_docx,
    extract_presentation_outline_from_text,
    build_presentation_outline_from_report,
    generate_powerpoint_presentation,
    validate_presentation_model,
    validate_generated_pptx,
    THEMES,
)
from src.modules.converters.universal_converter import sanitize_output_filename
from src.modules.jobs.job_manager import job_manager

router = APIRouter(prefix="/api/presentation", tags=["Presentation Generator"])


def _apply_project_cover_metadata(outline: PresentationOutline, settings) -> PresentationOutline:
    """Carry approved assignment metadata into the deck instead of generic defaults."""
    if not settings:
        return outline
    cover = settings.cover_page
    outline.title = cover.assignment_title or outline.title
    outline.subtitle = cover.assignment_subtitle or outline.subtitle
    outline.author = cover.student_name or outline.author
    outline.student_id = cover.student_id or outline.student_id
    outline.institution = cover.institution or outline.institution
    outline.college_name = cover.department or outline.college_name
    outline.course_name = cover.course or outline.course_name
    outline.course_code = cover.module_code or outline.course_code
    outline.lecturer_name = cover.lecturer_name or outline.lecturer_name
    outline.submission_date = cover.submission_date or outline.submission_date
    return outline

class ProjectPlanSlidesRequest(BaseModel):
    version_id: Optional[int] = None
    target_slide_count: int = 10
    text_density: str = "balanced"
    theme: str = "premium_university"
    audience: str = "academic"
    presentation_type: str = "assignment_summary"
    duration_minutes: int = 15
    include_notes: bool = True
    include_references: bool = True
    include_qa: bool = True
    transition_type: str = "fade"
    animation_intensity: str = "subtle"
    university_logo_base64: str = ""
    college_logo_base64: str = ""
    presentation_mode: str = "individual"
    presenters: list[PresenterInfo] = Field(default_factory=list)
    counting_mode: str = "total"

class ProjectGeneratePresentationRequest(BaseModel):
    outline: PresentationOutline
    theme: str = "premium_university"
    custom_filename: str = ""
    version_id: Optional[int] = None

class PlanSlidesRequest(BaseModel):
    report: StructuredReport
    criteria: list[AssessmentCriterion] = Field(default_factory=list)
    text_density: str = "balanced"  # concise, balanced, detailed
    target_slide_count: int = 10
    audience: str = "academic"
    presentation_type: str = "assignment_summary"
    duration_minutes: int = 15
    include_notes: bool = True
    include_references: bool = True
    include_qa: bool = True
    transition_type: str = "fade"
    animation_intensity: str = "subtle"
    university_logo_base64: str = ""
    college_logo_base64: str = ""
    presentation_mode: str = "individual"
    presenters: list[PresenterInfo] = Field(default_factory=list)
    counting_mode: str = "total"

class MapComplianceRequest(BaseModel):
    report: StructuredReport
    criteria: list[AssessmentCriterion]

class GeneratePresentationRequest(BaseModel):
    outline: PresentationOutline
    theme: str = "premium_university"
    custom_filename: str = ""

@router.get("/themes")
async def get_presentation_themes():
    themes_list = [
        {
            "id": "premium_university",
            "name": "Premium University",
            "description": "Formal academic prestige with Oxford navy, antique gold, and classical serif typography.",
            "is_dark": False,
            "primary_color": "#002147",
            "accent_color": "#C5A059",
            "font_title": "Georgia",
        },
        {
            "id": "modern_technology",
            "name": "Modern Technology",
            "description": "Contemporary tech visuals with vibrant cyan accents and sharp geometric layouts.",
            "is_dark": False,
            "primary_color": "#0F172A",
            "accent_color": "#06B6D4",
            "font_title": "Segoe UI",
        },
        {
            "id": "research_science",
            "name": "Research & Innovation",
            "description": "Tailored for scientific investigations, laboratory methodologies, and empirical findings.",
            "is_dark": False,
            "primary_color": "#065F46",
            "accent_color": "#0D9488",
            "font_title": "Trebuchet MS",
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
            "id": "dark_premium",
            "name": "Dark Premium",
            "description": "Readable dark obsidian background with high-contrast glowing cyan highlights.",
            "is_dark": True,
            "primary_color": "#0B0F19",
            "accent_color": "#38BDF8",
            "font_title": "Segoe UI",
        },
        {
            "id": "editorial_academic",
            "name": "Editorial Academic",
            "description": "Classical bookmaker typography with warm alabaster backgrounds and crimson accents.",
            "is_dark": False,
            "primary_color": "#800020",
            "accent_color": "#C5A059",
            "font_title": "Georgia",
        },
        {
            "id": "university_branded",
            "name": "University Branded",
            "description": "Institutional heraldry layout with primary navy and rich amber gold accents.",
            "is_dark": False,
            "primary_color": "#1E3A8A",
            "accent_color": "#D97706",
            "font_title": "Georgia",
        },
        {
            "id": "engineering_it",
            "name": "Engineering & IT",
            "description": "Structured technical aesthetic with orange accents designed for software & engineering.",
            "is_dark": False,
            "primary_color": "#1E293B",
            "accent_color": "#F97316",
            "font_title": "Segoe UI",
        },
        {
            "id": "business_management",
            "name": "Business & Management",
            "description": "Case study executive aesthetic with hunter green, warm gold, and concise metrics.",
            "is_dark": False,
            "primary_color": "#14532D",
            "accent_color": "#D97706",
            "font_title": "Georgia",
        },
    ]
    return {"themes": themes_list}

@router.post("/analyze-report", response_model=StructuredReport)
async def analyze_uploaded_report(file: UploadFile = File(...)):
    raw_filename = file.filename or "report.docx"
    content = await file.read()

    if len(content) > config.max_upload_size_bytes:
        raise FileValidationError("File size exceeds 25MB limit.")

    detected = detect_file_format(content, raw_filename)

    if detected == "docx":
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
            tmp.write(content)
            tmp_path = Path(tmp.name)
        try:
            report = analyze_docx_report(tmp_path)
        finally:
            if tmp_path.exists():
                tmp_path.unlink()
        return report

    elif detected == "pdf":
        return analyze_pdf_report(content)

    elif detected in ["txt", "csv"]:
        text = content.decode("utf-8", errors="replace")
        return analyze_text_report(text)

    else:
        raise FileValidationError(
            f"Unsupported report format '{detected}'. Please upload a Word document (.docx), PDF (.pdf), or Text file (.txt)."
        )

@router.post("/analyze-rubric", response_model=RubricAnalysisResult)
async def analyze_uploaded_rubric(file: UploadFile = File(...)):
    raw_filename = file.filename or "rubric.docx"
    content = await file.read()

    if len(content) > config.max_upload_size_bytes:
        raise FileValidationError("Rubric file size exceeds 25MB limit.")

    detected = detect_file_format(content, raw_filename)
    criteria: list[AssessmentCriterion] = []

    if detected == "docx":
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
            tmp.write(content)
            tmp_path = Path(tmp.name)
        try:
            criteria = extract_rubric_from_docx(tmp_path)
        finally:
            if tmp_path.exists():
                tmp_path.unlink()

    elif detected in ["xlsx", "csv"]:
        if detected == "xlsx":
            with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
                tmp.write(content)
                tmp_path = Path(tmp.name)
            try:
                criteria = extract_rubric_from_xlsx(tmp_path)
            finally:
                if tmp_path.exists():
                    tmp_path.unlink()
        else:
            text = content.decode("utf-8", errors="replace")
            criteria = extract_rubric_from_text(text)

    elif detected == "pdf":
        criteria = extract_rubric_from_pdf(content)

    elif detected in ["txt"]:
        text = content.decode("utf-8", errors="replace")
        criteria = extract_rubric_from_text(text)

    else:
        raise FileValidationError(
            f"Unsupported rubric format '{detected}'. Please upload Word (.docx), Excel (.xlsx), PDF (.pdf), or Text (.txt)."
        )

    total_weight = sum(c.weight_percent for c in criteria)
    return RubricAnalysisResult(
        rubric_title=f"Rubric: {raw_filename}",
        total_criteria_count=len(criteria),
        total_weight_found=total_weight,
        criteria=criteria,
    )

@router.post("/map-compliance", response_model=RubricAnalysisResult)
async def map_report_compliance(req: MapComplianceRequest):
    return map_report_to_rubric(req.report, req.criteria)

@router.post("/plan-slides", response_model=PresentationOutline)
async def plan_slides_endpoint(req: PlanSlidesRequest):
    outline = build_presentation_outline_from_report(
        report=req.report,
        text_density=req.text_density,
        target_count=req.target_slide_count,
        transition_type=req.transition_type,
        animation_intensity=req.animation_intensity,
        audience=req.audience,
        presentation_type=req.presentation_type,
        duration_minutes=req.duration_minutes,
        include_notes=req.include_notes,
        include_references=req.include_references,
        include_qa=req.include_qa,
        criteria=req.criteria,
        presentation_mode=req.presentation_mode,
        presenters=req.presenters,
        counting_mode=req.counting_mode,
    )
    if req.university_logo_base64:
        outline.university_logo_base64 = req.university_logo_base64
    if req.college_logo_base64:
        outline.college_logo_base64 = req.college_logo_base64

    return outline

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
        report = analyze_pdf_report(content)
        return build_presentation_outline_from_report(report)

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
    validation = validate_generated_pptx(pptx_bytes, req.outline)

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
        "validation": validation,
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

@router.post("/project/{job_id}/plan", response_model=PresentationOutline)
async def plan_project_slides(job_id: str, req: ProjectPlanSlidesRequest):
    validate_uuid(job_id)
    record = job_manager.get_job(job_id)
    target_v = record.get_version(req.version_id)
    if not target_v or not target_v.file_path.exists():
        raise HTTPException(status_code=404, detail="Project document version not found.")

    report = analyze_docx_report(target_v.file_path)

    # Use project cover page title or student info if available
    if record.settings and record.settings.cover_page.assignment_title:
        report.cover_page.title = record.settings.cover_page.assignment_title
        if record.settings.cover_page.student_name:
            report.cover_page.student_name = record.settings.cover_page.student_name
        if record.settings.cover_page.institution:
            report.cover_page.institution = record.settings.cover_page.institution
        if record.settings.cover_page.module_code:
            report.cover_page.course_code = record.settings.cover_page.module_code

    criteria: list[AssessmentCriterion] = []
    if record.rubric_data and record.rubric_data.criteria:
        criteria = [AssessmentCriterion(**c) for c in record.rubric_data.criteria]

    outline = build_presentation_outline_from_report(
        report=report,
        text_density=req.text_density,
        target_count=req.target_slide_count,
        transition_type=req.transition_type,
        animation_intensity=req.animation_intensity,
        audience=req.audience,
        presentation_type=req.presentation_type,
        duration_minutes=req.duration_minutes,
        include_notes=req.include_notes,
        include_references=req.include_references,
        include_qa=req.include_qa,
        criteria=criteria,
        presentation_mode=req.presentation_mode,
        presenters=req.presenters,
        counting_mode=req.counting_mode,
    )
    if req.university_logo_base64:
        outline.university_logo_base64 = req.university_logo_base64
    if req.college_logo_base64:
        outline.college_logo_base64 = req.college_logo_base64

    return _apply_project_cover_metadata(outline, record.settings)

@router.post("/project/{job_id}/generate")
async def generate_project_presentation(job_id: str, req: ProjectGeneratePresentationRequest):
    validate_uuid(job_id)
    record = job_manager.get_job(job_id)
    target_v = record.get_version(req.version_id)
    src_v_id = target_v.version_id if target_v else record.current_version_id

    pptx_bytes = generate_powerpoint_presentation(req.outline, theme_key=req.theme)
    validation = validate_generated_pptx(pptx_bytes, req.outline)

    default_stem = req.outline.title or Path(record.original_filename).stem
    safe_name = sanitize_output_filename(req.custom_filename, f"{default_stem}_Slides_v{src_v_id}", ".pptx")

    presentation_id = str(uuid.uuid4())
    pres_dir = config.storage_dir / "presentations" / presentation_id
    pres_dir.mkdir(parents=True, exist_ok=True)

    out_file = pres_dir / safe_name
    with open(out_file, "wb") as f:
        f.write(pptx_bytes)

    dl_url = f"/api/presentation/download/{presentation_id}?filename={safe_name}"
    total_slides = len(req.outline.slides) + 1  # Title slide (Slide 0) + content slides

    pres_rec = record.add_presentation(
        presentation_id=presentation_id,
        source_version_id=src_v_id,
        theme=req.theme,
        total_slides=total_slides,
        filename=safe_name,
        download_url=dl_url,
    )

    return {
        "presentation_id": presentation_id,
        "filename": safe_name,
        "total_slides": total_slides,
        "size_bytes": len(pptx_bytes),
        "source_version_id": src_v_id,
        "download_url": dl_url,
        "is_stale": record.current_version_id > src_v_id,
        "validation": validation,
    }

@router.get("/project/{job_id}/status")
async def get_project_presentation_status(job_id: str):
    validate_uuid(job_id)
    record = job_manager.get_job(job_id)
    for p in record.presentations:
        p.is_stale = record.current_version_id > p.source_version_id
    return {
        "project_id": job_id,
        "current_version_id": record.current_version_id,
        "presentations": record.presentations,
    }
