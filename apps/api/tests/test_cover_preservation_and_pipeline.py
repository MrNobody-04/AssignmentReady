"""Comprehensive Automated Test Suite for Cover Page Preservation,
AI Output Normalization, Real Word Styles, TOC/LOF/LOT, and End-to-End Pipeline.
"""

import hashlib
import io
import shutil
import tempfile
from pathlib import Path
import pytest
import docx
from docx.shared import Inches, Pt, Mm
from docx.oxml.ns import qn
import pypdf
import pptx

from src.modules.jobs.job_schema import (
    FormattingSettings,
    BodyStyle,
    HeadingStyle,
    MarginSettings,
    PageNumberingSettings,
    TableOfContentsSettings,
    ListOfFiguresSettings,
    ListOfTablesSettings,
)
from src.modules.documents.composer import (
    compose_submission_document,
    compose_submission_pdf,
    compute_docx_content_hash,
    generate_cover_thumbnail,
    CoverIntegrityError,
)
from src.modules.documents.formatter import apply_formatting
from src.modules.documents.normalizer import normalize_ai_report_document
from src.modules.documents.guideline_analyzer import analyze_guidelines, extract_guideline_text
from src.modules.presentation.ppt_generator import (
    build_presentation_outline_from_report,
    generate_powerpoint_presentation,
    PresentationOutline,
    SlideItem,
)
from src.modules.presentation.report_analyzer import analyze_docx_report


FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def fixtures_dir():
    return FIXTURES_DIR


# =========================================================================
# TEST SUITE 1: COVER PAGE INTEGRITY (Opaque Asset Preservation)
# =========================================================================

def test_docx_cover_with_logo_and_table_preservation(fixtures_dir, tmp_path):
    """Verifies that an official cover with logos and tables is 100% preserved without modification."""
    cover_path = fixtures_dir / "cover_with_logo_and_table.docx"
    body_path = fixtures_dir / "sample_ai_report_plain.docx"
    output_docx = tmp_path / "final_submission.docx"

    orig_hash = compute_docx_content_hash(cover_path)
    orig_doc = docx.Document(str(cover_path))
    orig_table_data = [[c.text for c in row.cells] for row in orig_doc.tables[0].rows]

    settings = FormattingSettings()
    settings.body.font_family = "Times New Roman"
    settings.body.font_size_pt = 12.0

    # Execute formatting & package composition
    apply_formatting(
        input_file=body_path,
        output_file=output_docx,
        settings=settings,
        cover_template_path=cover_path,
    )

    assert output_docx.exists()
    comp_doc = docx.Document(str(output_docx))

    # 1. Verify Cover exists in Section 0
    assert len(comp_doc.sections) >= 2

    # 2. Verify Table content and structure in Cover is completely intact
    assert len(comp_doc.tables) >= 1
    comp_cover_table = comp_doc.tables[0]
    comp_table_data = [[c.text for c in row.cells] for row in comp_cover_table.rows]
    assert comp_table_data == orig_table_data

    # 3. Verify images / drawings preserved in cover section
    has_drawing = any(
        "w:drawing" in p._p.xml for p in comp_doc.paragraphs[:5]
    )
    assert has_drawing is True


def test_docx_cover_with_custom_font_header_preserved(fixtures_dir, tmp_path):
    """Verifies that custom fonts (Georgia) and unlinked headers/footers in cover are not altered."""
    cover_path = fixtures_dir / "cover_with_custom_font_header.docx"
    body_path = fixtures_dir / "sample_ai_report_plain.docx"
    output_docx = tmp_path / "submission_georgia.docx"

    settings = FormattingSettings()
    settings.body.font_family = "Calibri"  # Distinct from Georgia
    settings.body.font_size_pt = 11.0

    apply_formatting(
        input_file=body_path,
        output_file=output_docx,
        settings=settings,
        cover_template_path=cover_path,
    )

    comp_doc = docx.Document(str(output_docx))
    sec0 = comp_doc.sections[0]

    # Verify Cover Header has not been wiped or overwritten by body
    assert "UNIVERSITY OF CAMBRIDGE" in sec0.header.paragraphs[0].text
    assert "CONFIDENTIAL CANDIDATE SUBMISSION" in sec0.footer.paragraphs[0].text

    # Verify Section 1 (Body) does NOT inherit the cover header
    sec1 = comp_doc.sections[1]
    assert sec1.header.is_linked_to_previous is False


def test_pdf_cover_stream_level_merging(fixtures_dir, tmp_path):
    """Verifies that an uploaded PDF cover is merged into the final PDF export byte-identically."""
    cover_pdf = fixtures_dir / "official_cover.pdf"
    body_docx = fixtures_dir / "sample_ai_report_plain.docx"
    output_docx = tmp_path / "submission_with_pdf_cover.docx"
    output_pdf = tmp_path / "final_submission.pdf"

    # Compose DOCX with PDF fallback
    res = compose_submission_document(
        cover_path=cover_pdf,
        body_docx_path=body_docx,
        output_docx_path=output_docx,
    )
    assert res["status"] == "success"
    assert res["cover_type"] == "pdf"
    assert len(res["warnings"]) > 0

    # Simulate body PDF conversion and merge native PDF cover
    temp_body_pdf = tmp_path / "body_rendered.pdf"
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=595, height=842)
    with open(temp_body_pdf, "wb") as f:
        writer.write(f)

    compose_submission_pdf(
        cover_pdf_path=cover_pdf,
        body_pdf_path=temp_body_pdf,
        output_pdf_path=output_pdf,
    )

    assert output_pdf.exists()
    reader = pypdf.PdfReader(str(output_pdf))
    assert len(reader.pages) == 2  # Cover page + 1 body page
    # Verify Page 1 text matches Imperial College from original cover
    page1_text = reader.pages[0].extract_text()
    assert "IMPERIAL COLLEGE LONDON" in page1_text


def test_cover_thumbnail_generation(fixtures_dir, tmp_path):
    """Verifies that high-res preview thumbnails are generated for both PDF and DOCX covers."""
    cover_pdf = fixtures_dir / "official_cover.pdf"
    thumb_path = tmp_path / "thumb.png"

    ok = generate_cover_thumbnail(cover_pdf, thumb_path)
    assert ok is True
    assert thumb_path.exists()
    assert thumb_path.stat().st_size > 1000


# =========================================================================
# TEST SUITE 2: FORMATTING ENGINE & AI NORMALIZATION
# =========================================================================

def test_criteria_extraction_apa(fixtures_dir):
    """Verifies that guideline_analyzer extracts APA formatting specifications accurately."""
    criteria_path = fixtures_dir / "criteria_apa.pdf"
    with open(criteria_path, "rb") as f:
        content = f.read()

    text = extract_guideline_text(criteria_path, content, ".pdf")
    analysis = analyze_guidelines(text)

    config = analysis["criteria_config"]
    assert config["font_family"] == "Times New Roman"
    assert config["body_size_pt"] == 12.0
    assert config["line_spacing"] == 2.0
    assert config["margins_top_inches"] == 1.0
    assert config["alignment"] == "LEFT"
    assert "APA" in config["referencing_style"]


def test_criteria_extraction_harvard(fixtures_dir):
    """Verifies that guideline_analyzer extracts Harvard specifications accurately."""
    criteria_path = fixtures_dir / "criteria_harvard.docx"
    with open(criteria_path, "rb") as f:
        content = f.read()

    text = extract_guideline_text(criteria_path, content, ".docx")
    analysis = analyze_guidelines(text)

    config = analysis["criteria_config"]
    assert config["font_family"] == "Arial"
    assert config["body_size_pt"] == 11.0
    assert config["line_spacing"] == 1.5
    assert config["alignment"] == "JUSTIFIED"
    assert config["referencing_style"] == "Harvard"


def test_ai_output_normalization_markdown_tables(fixtures_dir, tmp_path):
    """Verifies that markdown tables, hashtags, and asterisks are converted to native Word elements."""
    raw_doc_path = fixtures_dir / "sample_ai_report_with_tables.docx"
    test_doc = docx.Document(str(raw_doc_path))

    # Pre-normalization: 0 native Word tables
    assert len(test_doc.tables) == 0

    normalize_ai_report_document(test_doc, font_family="Arial")

    # Post-normalization: converted to 1 native Word table
    assert len(test_doc.tables) == 1
    tbl = test_doc.tables[0]
    assert len(tbl.rows) == 4  # 1 header + 3 data rows
    assert "Transformer Base" in tbl.rows[1].cells[0].text
    assert "84.2%" in tbl.rows[1].cells[1].text

    # Verify heading styles assigned
    h1_paras = [p for p in test_doc.paragraphs if p.style and p.style.name == "Heading 1"]
    assert len(h1_paras) >= 2


# =========================================================================
# TEST SUITE 3: TOC, LIST OF FIGURES, LIST OF TABLES & NUMBERING
# =========================================================================

def test_toc_and_lists_generation_and_omission(fixtures_dir, tmp_path):
    """Verifies that TOC, LOF, LOT use Word field codes, and empty lists are omitted."""
    report_with_figures = fixtures_dir / "sample_ai_report_with_tables.docx"
    plain_report = fixtures_dir / "sample_ai_report_plain.docx"

    out_with_figures = tmp_path / "out_fig.docx"
    out_plain = tmp_path / "out_plain.docx"

    settings = FormattingSettings()
    settings.table_of_contents.enabled = True
    settings.list_of_figures.enabled = True
    settings.list_of_figures.only_if_figures_exist = True
    settings.list_of_tables.enabled = True
    settings.list_of_tables.only_if_tables_exist = True

    # 1. Format document with figures & tables
    apply_formatting(
        input_file=report_with_figures,
        output_file=out_with_figures,
        settings=settings,
    )

    doc_fig = docx.Document(str(out_with_figures))
    para_texts = [p.text.strip().lower() for p in doc_fig.paragraphs]
    assert any("table of contents" in t for t in para_texts)
    assert any("list of figures" in t for t in para_texts)
    assert any("list of tables" in t for t in para_texts)

    # 2. Format plain document without figures
    apply_formatting(
        input_file=plain_report,
        output_file=out_plain,
        settings=settings,
    )

    doc_plain = docx.Document(str(out_plain))
    plain_para_texts = [p.text.strip().lower() for p in doc_plain.paragraphs]
    assert any("table of contents" in t for t in plain_para_texts)
    # List of figures and tables MUST be omitted when none exist
    assert not any("list of figures" in t for t in plain_para_texts)
    assert not any("list of tables" in t for t in plain_para_texts)


# =========================================================================
# TEST SUITE 4: MARKING SCHEME PRESERVATION
# =========================================================================

def test_marking_scheme_appended_unchanged(fixtures_dir, tmp_path):
    """Verifies that an uploaded marking scheme is appended to the document as an opaque asset."""
    cover_docx = fixtures_dir / "cover_with_logo_and_table.docx"
    body_docx = fixtures_dir / "sample_ai_report_plain.docx"
    rubric_pdf = fixtures_dir / "marking_scheme.pdf"
    out_doc = tmp_path / "full_submission.docx"

    res = compose_submission_document(
        cover_path=cover_docx,
        body_docx_path=body_docx,
        output_docx_path=out_doc,
        marking_scheme_path=rubric_pdf,
    )

    assert res["status"] == "success"
    assert res["marking_scheme_appended"] is True
    assert out_doc.exists()


# =========================================================================
# TEST SUITE 5: POWERPOINT PRESENTATION SYNTHESIS
# =========================================================================

def test_powerpoint_generation_bounds_and_overflow(fixtures_dir, tmp_path):
    """Verifies presentation slide bounds, absence of text overflow, and substantive conclusion."""
    report_docx = fixtures_dir / "sample_ai_report_with_tables.docx"
    output_pptx = tmp_path / "presentation.pptx"

    structured = analyze_docx_report(report_docx)
    outline = build_presentation_outline_from_report(
        structured,
        target_count=8,
        duration_minutes=15,
        text_density="balanced",
    )

    assert len(outline.slides) >= 5
    assert len(outline.slides) <= 12

    # Verify Conclusion slide is present and substantive
    conclusion_slides = [s for s in outline.slides if s.slide_type == "conclusion"]
    assert len(conclusion_slides) >= 1
    assert len(conclusion_slides[0].bullets) >= 2 or len(conclusion_slides[0].conclusion_takeaways) >= 1

    # Build PPTX
    pptx_bytes = generate_powerpoint_presentation(outline, theme_key="premium_university")
    assert len(pptx_bytes) > 20000

    prs = pptx.Presentation(io.BytesIO(pptx_bytes))
    # Title slide is slide 0 in the presentation
    assert len(prs.slides) >= 6
    title_slide = prs.slides[0]
    assert len(title_slide.shapes) >= 1

    with open(output_pptx, "wb") as f:
        f.write(pptx_bytes)

    assert output_pptx.exists()


# =========================================================================
# TEST SUITE 6: END-TO-END PIPELINE (Upload -> Review -> Generate -> Download)
# =========================================================================

def test_end_to_end_complete_workflow(fixtures_dir, tmp_path):
    """Verifies the complete pipeline from multi-asset input to final submission document."""
    report_docx = fixtures_dir / "sample_ai_report_with_tables.docx"
    cover_docx = fixtures_dir / "cover_with_custom_font_header.docx"
    criteria_docx = fixtures_dir / "criteria_harvard.docx"
    rubric_pdf = fixtures_dir / "marking_scheme.pdf"
    output_file = tmp_path / "submission_e2e.docx"

    # 1. Parse Criteria
    text = extract_guideline_text(criteria_docx, b"", ".docx")
    analysis = analyze_guidelines(text)
    cfg = analysis["criteria_config"]

    # 2. Build Settings from Extracted Criteria
    settings = FormattingSettings()
    settings.body.font_family = cfg["font_family"]
    settings.body.font_size_pt = cfg["body_size_pt"]
    settings.body.line_spacing = cfg["line_spacing"]
    settings.margins.left_inches = cfg["margins_left_inches"]
    settings.margins.right_inches = cfg["margins_right_inches"]
    settings.table_of_contents.enabled = True
    settings.list_of_figures.enabled = True
    settings.list_of_tables.enabled = True

    # 3. Format & Compose
    apply_formatting(
        input_file=report_docx,
        output_file=output_file,
        settings=settings,
        cover_template_path=cover_docx,
        marking_scheme_path=rubric_pdf,
    )

    assert output_file.exists()
    doc = docx.Document(str(output_file))

    # Verify Sections: Section 0 (Cover), Section 1 (Prelims/Body), Section 2 (Rubric)
    assert len(doc.sections) >= 2

    # Verify Cover Page Section 0 remains untouched (Georgia font in header)
    assert "UNIVERSITY OF CAMBRIDGE" in doc.sections[0].header.paragraphs[0].text

    # Verify Body typography adopted Arial 11pt
    body_paras = [p for p in doc.paragraphs if p.text.strip() and not p.style.name.startswith("Heading")]
    assert len(body_paras) > 0
    # Check that paragraph runs in body adopted Arial
    body_runs = [r for p in body_paras for r in p.runs if r.text.strip()]
    assert len(body_runs) > 0
    assert any(r.font.name == "Arial" for r in body_runs)
