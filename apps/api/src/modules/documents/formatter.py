from pathlib import Path
import docx
from docx.shared import Inches, Pt, Mm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from src.modules.jobs.job_schema import FormattingSettings, HeadingStyle, BodyStyle
from src.modules.documents.style_utils import ALIGNMENT_MAP, hex_to_rgb, set_run_font
from src.modules.documents.inspector import inspect_docx
from src.modules.documents.cover_page import insert_cover_page_before
from src.modules.documents.marking_scheme import apply_marking_scheme
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

    # 1. Pre-inspect input document for headings, figures, tables
    inspection = inspect_docx(input_file)
    detected_headings = inspection.detected_headings
    detected_figures = inspection.detected_figures
    detected_tables = inspection.detected_table_captions

    # 2. De-duplicate: clean up any existing duplicate front matter
    remove_existing_front_matter_paragraphs(doc, settings)

    # 3. Base formatting (styles, spacing, typography)
    apply_document_formatting(doc, settings)

    # 4. Architecture: Section breaks & Front Matter
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

    if settings.cover_page.enabled:
        sec_break_cover = target_fm_p.insert_paragraph_before()
        add_section_break_to_paragraph(sec_break_cover)
        insert_cover_page_before(sec_break_cover, settings.cover_page, template_path=cover_template_path)

    # Insert the rubric after the cover/front-matter anchor, before References, or at
    # the end according to the explicit placement selected by the student.
    if settings.marking_scheme.enabled:
        rubric_anchor = target_fm_p if settings.marking_scheme.placement == "after_cover" else None
        apply_marking_scheme(doc, settings.marking_scheme, anchor_paragraph=rubric_anchor)

    # Front Matter pages inserted sequentially before target_fm_p:
    base_font = settings.body.font_family or "Times New Roman"

    # 2. Declaration
    if settings.declaration.enabled:
        insert_declaration_before(target_fm_p, settings.declaration, base_font=base_font)

    # 3. Acknowledgements
    if settings.acknowledgement.enabled:
        insert_acknowledgement_before(target_fm_p, settings.acknowledgement, base_font=base_font)

    # 4. Abstract
    if settings.abstract.enabled:
        insert_abstract_before(target_fm_p, settings.abstract, base_font=base_font)

    # 5. Table of Contents
    if settings.table_of_contents.enabled:
        insert_table_of_contents_before(target_fm_p, detected_headings, title=settings.table_of_contents.title, base_font=base_font)

    # 6. List of Figures (only if figures exist or explicitly requested)
    if settings.list_of_figures.enabled:
        if detected_figures or not settings.list_of_figures.only_if_figures_exist:
            insert_list_of_figures_before(target_fm_p, detected_figures, title=settings.list_of_figures.title, base_font=base_font)

    # 7. List of Tables (only if tables exist or explicitly requested)
    if settings.list_of_tables.enabled:
        if detected_tables or not settings.list_of_tables.only_if_tables_exist:
            insert_list_of_tables_before(target_fm_p, detected_tables, title=settings.list_of_tables.title, base_font=base_font)

    # 8. List of Abbreviations
    if settings.list_of_abbreviations.enabled:
        insert_list_of_abbreviations_before(target_fm_p, settings.list_of_abbreviations, base_font=base_font)

    # 6. Configure Section Page Numbering (Cover = none, Front matter = Roman, Body = Arabic start at 1)
    if settings.page_numbering.enabled:
        apply_page_numbering(doc, settings)

    output_file.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(output_file))
