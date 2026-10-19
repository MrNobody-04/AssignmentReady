from pathlib import Path
import docx
from docx.shared import Inches, Pt, Mm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from src.modules.jobs.job_schema import FormattingSettings, HeadingStyle, BodyStyle
from src.modules.documents.style_utils import ALIGNMENT_MAP, hex_to_rgb, set_run_font
from src.modules.documents.cover_page import apply_cover_page
from src.modules.documents.toc import insert_table_of_contents
from src.modules.documents.marking_scheme import apply_marking_scheme
from src.modules.documents.page_numbering import apply_page_numbering
from src.common.errors import DocumentProcessingError

def apply_page_setup(doc: docx.Document, settings: FormattingSettings) -> None:
    for section in doc.sections:
        if settings.paper_size == "A4":
            section.page_width = Mm(210)
            section.page_height = Mm(297)
        else:  # LETTER
            section.page_width = Inches(8.5)
            section.page_height = Inches(11.0)

        section.top_margin = Inches(settings.margins.top_inches)
        section.bottom_margin = Inches(settings.margins.bottom_inches)
        section.left_margin = Inches(settings.margins.left_inches)
        section.right_margin = Inches(settings.margins.right_inches)

def format_heading_paragraph(
    p,
    heading_cfg: HeadingStyle,
    is_main_heading: bool = False,
    allow_page_break: bool = True
) -> None:
    p_format = p.paragraph_format
    p_format.alignment = ALIGNMENT_MAP.get(heading_cfg.alignment, WD_ALIGN_PARAGRAPH.LEFT)
    p_format.space_before = Pt(heading_cfg.space_before_pt)
    p_format.space_after = Pt(heading_cfg.space_after_pt)
    p_format.keep_with_next = True

    if is_main_heading and allow_page_break and heading_cfg.page_break_before:
        p_format.page_break_before = True
    else:
        p_format.page_break_before = False

    color_rgb = hex_to_rgb(heading_cfg.color_hex)
    for run in p.runs:
        set_run_font(run, heading_cfg.font_family, heading_cfg.font_size_pt, color_rgb)
        run.bold = heading_cfg.bold
        run.italic = heading_cfg.italic

def format_body_paragraph(p, body_cfg: BodyStyle) -> None:
    # Preserve indentation if present on block quotes or metadata
    p_format = p.paragraph_format
    if not (p_format.left_indent and p_format.left_indent.inches >= 0.8):
        p_format.alignment = ALIGNMENT_MAP.get(body_cfg.alignment, WD_ALIGN_PARAGRAPH.LEFT)
        p_format.line_spacing = body_cfg.line_spacing
        p_format.space_before = Pt(body_cfg.space_before_pt)
        p_format.space_after = Pt(body_cfg.space_after_pt)
        if body_cfg.first_line_indent_inches > 0:
            p_format.first_line_indent = Inches(body_cfg.first_line_indent_inches)

    color_rgb = hex_to_rgb(body_cfg.font_color_hex)
    for run in p.runs:
        set_run_font(run, body_cfg.font_family, body_cfg.font_size_pt, color_rgb)

def apply_document_formatting(doc: docx.Document, settings: FormattingSettings) -> None:
    apply_page_setup(doc, settings)

    first_h1_encountered = False

    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            continue

        style_name = p.style.name if p.style else ""

        is_h1 = (
            style_name.startswith("Heading 1")
            or (style_name.endswith("1") and "Heading" in style_name)
            or style_name.lower() in ["title"]
        )
        is_h2 = (
            style_name.startswith("Heading 2")
            or (style_name.endswith("2") and "Heading" in style_name)
        )
        is_h3 = (
            style_name.startswith("Heading 3")
            or (style_name.endswith("3") and "Heading" in style_name)
        )

        if not (is_h1 or is_h2 or is_h3) and len(text) < 80 and not text.endswith("."):
            if p.runs and all(r.bold for r in p.runs if r.text.strip()):
                is_h1 = True
                p.style = "Heading 1"

        if is_h1:
            allow_page_break = settings.start_main_heading_on_new_page
            lower_text = text.lower()
            for excluded in settings.excluded_heading_break_titles:
                if excluded.strip().lower() in lower_text:
                    allow_page_break = False
                    break

            if not first_h1_encountered:
                allow_page_break = False
                first_h1_encountered = True

            format_heading_paragraph(p, settings.heading1, is_main_heading=True, allow_page_break=allow_page_break)
        elif is_h2:
            format_heading_paragraph(p, settings.heading2, is_main_heading=False)
        elif is_h3:
            format_heading_paragraph(p, settings.heading3, is_main_heading=False)
        else:
            format_body_paragraph(p, settings.body)

    if settings.preserve_tables:
        body_color = hex_to_rgb(settings.body.font_color_hex)
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for cp in cell.paragraphs:
                        for run in cp.runs:
                            set_run_font(run, settings.body.font_family, max(9.0, settings.body.font_size_pt - 1.0), body_color)

def apply_formatting(
    input_file: Path,
    output_file: Path,
    settings: FormattingSettings,
    cover_template_path: Path | None = None
) -> None:
    try:
        doc = docx.Document(input_file)
    except Exception as e:
        raise DocumentProcessingError(f"Could not open document: {str(e)}")

    # 1. Base formatting
    apply_document_formatting(doc, settings)

    # 2. Cover Page
    if settings.cover_page.enabled:
        apply_cover_page(doc, settings.cover_page, template_path=cover_template_path)

    # 3. Table of Contents
    if settings.table_of_contents.enabled:
        insert_table_of_contents(doc, settings.table_of_contents)

    # 4. Marking Scheme
    if settings.marking_scheme.enabled:
        apply_marking_scheme(doc, settings.marking_scheme)

    # 5. Page Numbering
    if settings.page_numbering.enabled:
        apply_page_numbering(doc, settings.page_numbering)

    output_file.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(output_file))
