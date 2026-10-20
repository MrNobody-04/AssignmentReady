import os
from pathlib import Path
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from src.modules.jobs.job_schema import CoverPageData

def _set_cell_padding(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for edge, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{edge}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def apply_cover_page(
    doc: docx.Document,
    cover_data: CoverPageData,
    template_path: Path | None = None
) -> None:
    """
    Appends or prepends an academic cover page to the Word document.
    """
    if not cover_data.enabled:
        return

    first_p = doc.paragraphs[0] if doc.paragraphs else doc.add_paragraph()
    insert_cover_page_before(first_p, cover_data, template_path=template_path)

def insert_cover_page_before(
    target_p,
    cover_data: CoverPageData,
    template_path: Path | None = None
) -> None:
    """
    Inserts cover page paragraphs before target_p.
    """
    if not cover_data.enabled:
        return

    if cover_data.mode == "template" and template_path and template_path.exists():
        _insert_template_cover_before(target_p, cover_data, template_path)
    else:
        _insert_builtin_cover_before(target_p, cover_data)

def _insert_template_cover_before(target_p, cover_data: CoverPageData, template_path: Path) -> None:
    try:
        tpl_doc = docx.Document(template_path)
    except Exception:
        _insert_builtin_cover_before(target_p, cover_data)
        return

    replacements = {
        "{{student_name}}": cover_data.student_name,
        "{{student_id}}": cover_data.student_id,
        "{{institution}}": cover_data.institution,
        "{{department}}": cover_data.department,
        "{{course}}": cover_data.course,
        "{{module_code}}": cover_data.module_code,
        "{{assignment_title}}": cover_data.assignment_title,
        "{{assignment_subtitle}}": cover_data.assignment_subtitle,
        "{{lecturer_name}}": cover_data.lecturer_name,
        "{{submission_date}}": cover_data.submission_date,
    }

    # Replace placeholders in paragraphs and tables of template
    for p in tpl_doc.paragraphs:
        for placeholder, value in replacements.items():
            if placeholder in p.text:
                for run in p.runs:
                    if placeholder in run.text:
                        run.text = run.text.replace(placeholder, value or "")
                if placeholder in p.text:
                    p.text = p.text.replace(placeholder, value or "")

    for table in tpl_doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    for placeholder, value in replacements.items():
                        if placeholder in p.text:
                            for run in p.runs:
                                if placeholder in run.text:
                                    run.text = run.text.replace(placeholder, value or "")
                            if placeholder in p.text:
                                p.text = p.text.replace(placeholder, value or "")

    # Insert template paragraphs before target_p
    for p in tpl_doc.paragraphs:
        new_p = target_p.insert_paragraph_before(p.text)
        new_p.alignment = p.alignment

def _insert_builtin_cover_before(target_p, cover_data: CoverPageData) -> None:
    inst_text = (cover_data.institution or "UNIVERSITY ACADEMIC SUBMISSION").upper()
    dept_text = cover_data.department or cover_data.course or "DEPARTMENT OF COMPUTING & INFORMATICS"
    title_text = cover_data.assignment_title or "ACADEMIC ASSIGNMENT REPORT"
    subtitle_text = cover_data.assignment_subtitle or "Formative Coursework Assessment"

    p_top_space = target_p.insert_paragraph_before()
    p_top_space.paragraph_format.space_before = Pt(40)

    # Institution
    p_inst = target_p.insert_paragraph_before(inst_text)
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_after = Pt(4)
    run_inst = p_inst.runs[0]
    run_inst.font.name = "Arial"
    run_inst.font.size = Pt(14)
    run_inst.font.bold = True
    run_inst.font.color.rgb = RGBColor(30, 58, 138)  # Deep Navy

    # Department
    p_dept = target_p.insert_paragraph_before(dept_text)
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_after = Pt(72)
    run_dept = p_dept.runs[0]
    run_dept.font.name = "Arial"
    run_dept.font.size = Pt(10.5)
    run_dept.font.color.rgb = RGBColor(100, 116, 139)

    # Title
    p_title = target_p.insert_paragraph_before(title_text)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(8)
    run_title = p_title.runs[0]
    run_title.font.name = "Arial"
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)

    # Subtitle
    if subtitle_text:
        p_sub = target_p.insert_paragraph_before(subtitle_text)
        p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_sub.paragraph_format.space_after = Pt(80)
        run_sub = p_sub.runs[0]
        run_sub.font.name = "Arial"
        run_sub.font.size = Pt(12)
        run_sub.font.italic = True
        run_sub.font.color.rgb = RGBColor(71, 85, 105)
    else:
        p_sub_sp = target_p.insert_paragraph_before()
        p_sub_sp.paragraph_format.space_after = Pt(80)

    # Student metadata details
    meta_items = [
        ("Student Name:", cover_data.student_name or "Student Name"),
        ("Student ID / Matriculation:", cover_data.student_id or "N/A"),
        ("Module / Course Code:", cover_data.module_code or "N/A"),
        ("Course Title:", cover_data.course or "Degree Course"),
        ("Instructor / Lecturer:", cover_data.lecturer_name or "Academic Assessor"),
        ("Date of Submission:", cover_data.submission_date or "October 2026"),
    ]

    for label, val in meta_items:
        p_meta = target_p.insert_paragraph_before()
        p_meta.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_meta.paragraph_format.space_after = Pt(3)
        p_meta.paragraph_format.left_indent = Inches(1.0)

        r_lbl = p_meta.add_run(f"{label:<30} ")
        r_lbl.font.name = "Arial"
        r_lbl.font.size = Pt(10.5)
        r_lbl.font.bold = True
        r_lbl.font.color.rgb = RGBColor(51, 65, 85)

        r_val = p_meta.add_run(val)
        r_val.font.name = "Arial"
        r_val.font.size = Pt(10.5)
        r_val.font.color.rgb = RGBColor(15, 23, 42)

def _apply_template_cover(doc: docx.Document, cover_data: CoverPageData, template_path: Path) -> None:
    first_p = doc.paragraphs[0] if doc.paragraphs else doc.add_paragraph()
    _insert_template_cover_before(first_p, cover_data, template_path)
    break_p = first_p.insert_paragraph_before()
    break_p.paragraph_format.page_break_before = True

def _apply_builtin_cover(doc: docx.Document, cover_data: CoverPageData) -> None:
    first_p = doc.paragraphs[0] if doc.paragraphs else doc.add_paragraph()
    _insert_builtin_cover_before(first_p, cover_data)
    break_p = first_p.insert_paragraph_before()
    break_p.paragraph_format.page_break_before = True
