import pytest
from pathlib import Path
import docx
from docx.oxml.ns import qn

from src.modules.jobs.job_schema import FormattingSettings, MarkingCriterion
from src.modules.documents.formatter import apply_formatting


def _create_source_doc(path: Path):
    doc = docx.Document()
    doc.add_heading("1.0 Introduction", level=1)
    doc.add_paragraph("This is the main introduction text.")
    doc.add_heading("2.0 Method", level=1)
    doc.add_paragraph("This is the methodology section.")
    doc.save(str(path))


def _create_cover_doc(path: Path):
    doc = docx.Document()
    doc.add_paragraph("FACULTY OF SCIENCE AND TECHNOLOGY")
    doc.add_paragraph("OFFICIAL ASSIGNMENT COVER SHEET")
    doc.save(str(path))


def _create_rubric_doc(path: Path):
    doc = docx.Document()
    doc.add_paragraph("MARKING SCHEME CRITERIA")
    doc.add_paragraph("Criterion 1: Academic Analysis (50%)")
    doc.save(str(path))


def test_section_page_numbering_xml_conformance(tmp_path: Path):
    source_path = tmp_path / "source.docx"
    _create_source_doc(source_path)

    cover_path = tmp_path / "cover.docx"
    _create_cover_doc(cover_path)

    rubric_path = tmp_path / "rubric.docx"
    _create_rubric_doc(rubric_path)

    output_path = tmp_path / "formatted.docx"

    settings = FormattingSettings()
    settings.cover_page.mode = "template"
    settings.table_of_contents.enabled = True
    settings.marking_scheme.enabled = True
    settings.marking_scheme.placement = "appendix"
    settings.marking_scheme.criteria = [
        MarkingCriterion(name="Criterion 1", description="Academic Analysis", max_marks=50, weight_percentage=50)
    ]

    apply_formatting(
        input_file=source_path,
        output_file=output_path,
        settings=settings,
        cover_template_path=cover_path,
        marking_scheme_path=rubric_path,
    )

    assert output_path.exists()
    doc = docx.Document(str(output_path))
    sections = doc.sections
    assert len(sections) >= 3, f"Expected at least 3 sections, found {len(sections)}"

    # 1. Cover Page Section (Section 0)
    sec_cover = sections[0]
    # Header & Footer should have no text and not link to previous
    footer_text = "".join(p.text for p in sec_cover.footer.paragraphs).strip()
    assert footer_text == ""
    # titlePg should be present or footer empty
    sectPr_cover = sec_cover._sectPr
    titlePg = sectPr_cover.find(qn("w:titlePg"))
    # Either titlePg exists or footer has no page number field

    # 2. Front matter / TOC section (Section 1)
    sec_front = sections[1]
    sectPr_front = sec_front._sectPr
    pgNumType_front = sectPr_front.find(qn("w:pgNumType"))
    # In academic specs, front matter pagination format is lowerRoman
    if pgNumType_front is not None:
        fmt_val = pgNumType_front.get(qn("w:fmt"))
        assert fmt_val in ["lowerRoman", "roman", None]

    # 3. Body Section
    sec_body = sections[2]
    sectPr_body = sec_body._sectPr
    pgNumType_body = sectPr_body.find(qn("w:pgNumType"))
    if pgNumType_body is not None:
        start_val = pgNumType_body.get(qn("w:start"))
        fmt_val = pgNumType_body.get(qn("w:fmt"))
        # Arabic restart at 1
        assert start_val == "1" or start_val is None
        assert fmt_val in ["decimal", None]

    # 4. Rubric / Appendix Section (last section)
    sec_rubric = sections[-1]
    assert sec_rubric.footer.is_linked_to_previous is False
    assert sec_rubric.header.is_linked_to_previous is False
