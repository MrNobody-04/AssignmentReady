"""High-Fidelity Document Formatter and Style Engine.

Applies institutional formatting strictly to the report body:
- Real Word styles (Normal, Heading 1, Heading 2, Heading 3, Caption)
- AI output normalization (stripping markdown artifacts, converting markdown tables)
- Dynamic Table of Contents (TOC), List of Figures (LOF), List of Tables (LOT)
- Omission of empty lists when no figures or tables exist
- Section-aware pagination (Roman prelims, Arabic body restarting at 1)
- Opaque composition with uploaded cover page and marking scheme via composer.py
"""

import tempfile
from pathlib import Path
import docx
from docx.shared import Inches, Pt, Mm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

from src.modules.jobs.job_schema import FormattingSettings, HeadingStyle, BodyStyle
from src.modules.documents.style_utils import ALIGNMENT_MAP, hex_to_rgb, set_run_font
from src.modules.documents.inspector import inspect_docx
from src.modules.documents.cover_page import insert_cover_page_before
from src.modules.documents.marking_scheme import apply_marking_scheme
from src.modules.documents.normalizer import normalize_ai_report_document
from src.modules.documents.page_numbering import apply_page_numbering
from src.modules.documents.front_matter import (
    add_section_break_to_paragraph,
    remove_existing_front_matter_paragraphs,
    insert_declaration_before,
    insert_acknowledgement_before,
    insert_abstract_before,
    insert_table_of_contents_before,
    insert_list_of_figures_before,
    insert_list_of_tables_before,
    insert_list_of_abbreviations_before,
)
from src.modules.documents.composer import compose_submission_document
from src.common.errors import DocumentProcessingError


def configure_word_styles(doc: docx.Document, settings: FormattingSettings) -> None:
    """Configures real Word styles so that the document is natively editable and TOC-indexed."""
    try:
        # 1. Normal Body Style
        normal = doc.styles["Normal"]
        normal.font.name = settings.body.font_family
        normal.font.size = Pt(settings.body.font_size_pt)
        normal.paragraph_format.line_spacing = settings.body.line_spacing
        normal.paragraph_format.space_before = Pt(settings.body.space_before_pt)
        normal.paragraph_format.space_after = Pt(settings.body.space_after_pt)
        normal.paragraph_format.alignment = ALIGNMENT_MAP.get(settings.body.alignment, WD_ALIGN_PARAGRAPH.LEFT)

        # 2. Heading 1
        h1 = doc.styles["Heading 1"]
        h1.font.name = settings.heading1.font_family or settings.body.font_family
        h1.font.size = Pt(settings.heading1.font_size_pt)
        h1.font.bold = settings.heading1.bold
        h1.font.italic = settings.heading1.italic
        h1.paragraph_format.space_before = Pt(settings.heading1.space_before_pt)
        h1.paragraph_format.space_after = Pt(settings.heading1.space_after_pt)
        h1.paragraph_format.keep_with_next = True

        # 3. Heading 2
        h2 = doc.styles["Heading 2"]
        h2.font.name = settings.heading2.font_family or settings.body.font_family
        h2.font.size = Pt(settings.heading2.font_size_pt)
        h2.font.bold = settings.heading2.bold
        h2.font.italic = settings.heading2.italic
        h2.paragraph_format.space_before = Pt(settings.heading2.space_before_pt)
        h2.paragraph_format.space_after = Pt(settings.heading2.space_after_pt)
        h2.paragraph_format.keep_with_next = True

        # 4. Heading 3
        h3 = doc.styles["Heading 3"]
        h3.font.name = settings.heading3.font_family or settings.body.font_family
        h3.font.size = Pt(settings.heading3.font_size_pt)
        h3.font.bold = settings.heading3.bold
        h3.font.italic = settings.heading3.italic
        h3.paragraph_format.space_before = Pt(settings.heading3.space_before_pt)
        h3.paragraph_format.space_after = Pt(settings.heading3.space_after_pt)
        h3.paragraph_format.keep_with_next = True
    except Exception:
        pass


def apply_page_setup(doc: docx.Document, settings: FormattingSettings) -> None:
    """Configures paper size and 1-inch margins across report body sections."""
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


def apply_body_document_formatting(doc: docx.Document, settings: FormattingSettings) -> None:
    """Applies styles, typography, and page setup to the report body."""
    apply_page_setup(doc, settings)
    configure_word_styles(doc, settings)

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


apply_document_formatting = apply_body_document_formatting


def apply_formatting(
    input_file: Path,
    output_file: Path,
    settings: FormattingSettings,
    cover_template_path: Path | None = None,
    marking_scheme_path: Path | None = None,
) -> None:
    """
    Orchestrates the submission-ready pipeline:
    1. Normalizes AI artifacts and converts markdown tables.
    2. Applies institutional styles and dynamic TOC/LOF/LOT to report body.
    3. Merges the opaque cover page and marking scheme at the package level.
    4. Runs integrity validation.
    """
    try:
        doc = docx.Document(input_file)
    except Exception as e:
        raise DocumentProcessingError(f"Could not open document: {str(e)}")

    # 1. Normalize AI artifacts in report body
    normalize_ai_report_document(doc, font_family=settings.body.font_family)

    # 2. Inspect document structure
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp_inspect:
        tmp_inspect_path = Path(tmp_inspect.name)
    doc.save(str(tmp_inspect_path))
    inspection = inspect_docx(tmp_inspect_path)
    tmp_inspect_path.unlink(missing_ok=True)

    detected_headings = inspection.detected_headings
    detected_figures = inspection.detected_figures
    detected_tables = inspection.detected_table_captions

    # 3. Clean up any existing duplicate front matter paragraphs
    remove_existing_front_matter_paragraphs(doc, settings)

    # 4. Format report body
    apply_body_document_formatting(doc, settings)

    # 5. Build Front Matter & Section Architecture
    first_body_p = doc.paragraphs[0] if doc.paragraphs else doc.add_paragraph()

    has_front_matter = (
        settings.declaration.enabled
        or settings.acknowledgement.enabled
        or settings.abstract.enabled
        or settings.table_of_contents.enabled
        or (settings.list_of_figures.enabled and (detected_figures or not settings.list_of_figures.only_if_figures_exist))
        or (settings.list_of_tables.enabled and (detected_tables or not settings.list_of_tables.only_if_tables_exist))
        or settings.list_of_abbreviations.enabled
    )

    if has_front_matter:
        sec_break_body = first_body_p.insert_paragraph_before()
        add_section_break_to_paragraph(sec_break_body)
        target_fm_p = sec_break_body
    else:
        target_fm_p = first_body_p

    effective_cover = cover_template_path if (cover_template_path and cover_template_path.exists()) else None
    effective_rubric = marking_scheme_path if (marking_scheme_path and marking_scheme_path.exists()) else None

    # Built-in cover page (Section 0) when no uploaded cover template
    if not effective_cover and settings.cover_page.enabled:
        sec_break_cover = target_fm_p.insert_paragraph_before()
        add_section_break_to_paragraph(sec_break_cover)
        insert_cover_page_before(sec_break_cover, settings.cover_page)

    # Built-in marking scheme when no uploaded rubric
    if not effective_rubric and settings.marking_scheme.enabled:
        rubric_anchor = target_fm_p if settings.marking_scheme.placement == "after_cover" else None
        apply_marking_scheme(doc, settings.marking_scheme, anchor_paragraph=rubric_anchor)

    base_font = settings.body.font_family or "Times New Roman"

    # Insert Front Matter elements sequentially
    if settings.declaration.enabled:
        insert_declaration_before(target_fm_p, settings.declaration, base_font=base_font)

    if settings.acknowledgement.enabled:
        insert_acknowledgement_before(target_fm_p, settings.acknowledgement, base_font=base_font)

    if settings.abstract.enabled:
        insert_abstract_before(target_fm_p, settings.abstract, base_font=base_font)

    if settings.table_of_contents.enabled:
        insert_table_of_contents_before(target_fm_p, detected_headings, title=settings.table_of_contents.title, base_font=base_font)

    # List of Figures: omitted if no figures exist
    if settings.list_of_figures.enabled and (detected_figures or not settings.list_of_figures.only_if_figures_exist):
        insert_list_of_figures_before(target_fm_p, detected_figures, title=settings.list_of_figures.title, base_font=base_font)

    # List of Tables: omitted if no tables exist
    if settings.list_of_tables.enabled and (detected_tables or not settings.list_of_tables.only_if_tables_exist):
        insert_list_of_tables_before(target_fm_p, detected_tables, title=settings.list_of_tables.title, base_font=base_font)

    if settings.list_of_abbreviations.enabled:
        insert_list_of_abbreviations_before(target_fm_p, settings.list_of_abbreviations, base_font=base_font)

    # Apply section page numbering
    if settings.page_numbering.enabled:
        apply_page_numbering(doc, settings)

    # Save intermediate formatted body
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp_body:
        tmp_body_path = Path(tmp_body.name)
    doc.save(str(tmp_body_path))

    # 6. Compose with opaque cover page and marking scheme
    effective_cover = cover_template_path if (cover_template_path and cover_template_path.exists()) else None
    effective_rubric = marking_scheme_path if (marking_scheme_path and marking_scheme_path.exists()) else None

    compose_submission_document(
        cover_path=effective_cover,
        body_docx_path=tmp_body_path,
        output_docx_path=output_file,
        marking_scheme_path=effective_rubric,
        cover_page_data=settings.cover_page,
    )
    tmp_body_path.unlink(missing_ok=True)
