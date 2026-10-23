"""Generates synthetic stress-test cover pages covering complex OpenXML structures."""

import io
from pathlib import Path
import docx
from docx.shared import Inches, Pt, Mm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION, WD_ORIENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls
from PIL import Image, ImageDraw


def _create_sample_png_bytes(color=(30, 58, 138), size=(200, 80), text="INSTITUTE") -> bytes:
    img = Image.new("RGBA", size, color=(255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    draw.rectangle([(2, 2), (size[0] - 2, size[1] - 2)], fill=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def create_stress_covers(target_dir: Path) -> list[Path]:
    target_dir.mkdir(parents=True, exist_ok=True)
    created_files = []

    logo_bytes = _create_sample_png_bytes(color=(16, 78, 139), text="CREST")

    # -------------------------------------------------------------
    # 1. Stress Cover: Textbox and Drawing Shapes
    # -------------------------------------------------------------
    doc1 = docx.Document()
    p1 = doc1.add_paragraph()
    p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r1 = p1.add_run("OXFORD INSTITUTE OF ADVANCED STUDIES\n")
    r1.font.name = "Times New Roman"
    r1.font.size = Pt(16)
    r1.font.bold = True

    # Inject OpenXML Drawing / VML Shape XML
    shape_xml = f"""
    <w:p {nsdecls("w")}>
        <w:r>
            <w:drawing>
                <wp:inline {nsdecls("wp")}>
                    <wp:extent cx="1800000" cy="720000"/>
                    <wp:docPr id="1" name="Accent Shape 1"/>
                    <a:graphic {nsdecls("a")}>
                        <a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
                            <wps:wsp xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
                                <wps:spPr>
                                    <a:xfrm>
                                        <a:off x="0" y="0"/>
                                        <a:ext cx="1800000" cy="720000"/>
                                    </a:xfrm>
                                    <a:prstGeom prst="roundRect">
                                        <a:avLst/>
                                    </a:prstGeom>
                                    <a:solidFill>
                                        <a:srgbClr val="002147"/>
                                    </a:solidFill>
                                </wps:spPr>
                                <wps:txbx>
                                    <w:txbxContent>
                                        <w:p>
                                            <w:pPr><w:jc w:val="center"/></w:pPr>
                                            <w:r>
                                                <w:rPr><w:color w:val="FFFFFF"/><w:b/></w:rPr>
                                                <w:t>OFFICIAL FACULTY EMBLEM</w:t>
                                            </w:r>
                                        </w:p>
                                    </w:txbxContent>
                                </wps:txbx>
                            </wps:wsp>
                        </a:graphicData>
                    </a:graphic>
                </wp:inline>
            </w:drawing>
        </w:r>
    </w:p>
    """
    doc1.element.body.append(parse_xml(shape_xml))
    doc1.add_paragraph("Master of Science in Software Engineering")
    doc1.add_paragraph("Coursework Assignment Submission")
    doc1.add_paragraph("Student Name: [Student Name]")
    doc1.add_paragraph("Student ID: [Student ID]")
    f1 = target_dir / "stress_textbox_shapes.docx"
    doc1.save(str(f1))
    created_files.append(f1)

    # -------------------------------------------------------------
    # 2. Stress Cover: Content Controls (SDT - Structured Document Tags)
    # -------------------------------------------------------------
    doc2 = docx.Document()
    p_head = doc2.add_paragraph("CAMBRIDGE FACULTY OF COMPUTER SCIENCE")
    p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_head.runs[0].font.bold = True

    # Inject SDT Content Control block
    sdt_xml = f"""
    <w:sdt {nsdecls("w")}>
        <w:sdtPr>
            <w:rPr>
                <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                <w:color w:val="1E3A8A"/>
                <w:b/>
            </w:rPr>
            <w:alias w:val="Candidate Name"/>
            <w:tag w:val="candidate_name"/>
            <w:id w:val="10492817"/>
            <w:showingPlcHdr/>
            <w:text/>
        </w:sdtPr>
        <w:sdtContent>
            <w:p>
                <w:r>
                    <w:t>Click here to enter student name: {{student_name}}</w:t>
                </w:r>
            </w:p>
        </w:sdtContent>
    </w:sdt>
    """
    doc2.element.body.append(parse_xml(sdt_xml))
    doc2.add_paragraph("Module: Distributed Systems & Cloud Security (CS-504)")
    doc2.add_paragraph("Academic Year: 2026/2027")
    f2 = target_dir / "stress_content_controls_sdt.docx"
    doc2.save(str(f2))
    created_files.append(f2)

    # -------------------------------------------------------------
    # 3. Stress Cover: Nested Tables & Cell Borders
    # -------------------------------------------------------------
    doc3 = docx.Document()
    doc3.add_heading("UNIVERSITY FACULTY SUBMISSION GRID", level=1)
    outer_table = doc3.add_table(rows=2, cols=2)
    outer_table.cell(0, 0).text = "Department Information"
    outer_table.cell(0, 1).text = "Assessment Criteria"

    # Create nested table inside cell (1, 0)
    nested_table = doc3.add_table(rows=2, cols=2)
    nested_table.cell(0, 0).text = "Field"
    nested_table.cell(0, 1).text = "Data"
    nested_table.cell(1, 0).text = "Candidate ID"
    nested_table.cell(1, 1).text = "ST-99482"
    outer_table.cell(1, 0)._tc.append(nested_table._tbl)

    outer_table.cell(1, 1).text = "Marks Awarded: ______ / 100\nAssessor Signature: _____________"
    f3 = target_dir / "stress_nested_tables.docx"
    doc3.save(str(f3))
    created_files.append(f3)

    # -------------------------------------------------------------
    # 4. Stress Cover: Landscape Orientation & Own Section Break
    # -------------------------------------------------------------
    doc4 = docx.Document()
    sec0 = doc4.sections[0]
    sec0.orientation = WD_ORIENT.LANDSCAPE
    sec0.page_width = Mm(297)
    sec0.page_height = Mm(210)
    p4 = doc4.add_paragraph("LANDSCAPE ARCHITECTURAL CAPSTONE REPORT")
    p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p4.runs[0].font.size = Pt(20)
    p4.runs[0].font.bold = True
    doc4.add_paragraph("Executive Design Portfolio & Engineering Drawings")
    doc4.add_paragraph("Candidate: Alex Rivera | ID: ARC-8831")

    # Add its own internal section break
    sec1 = doc4.add_section(WD_SECTION.NEW_PAGE)
    sec1.orientation = WD_ORIENT.LANDSCAPE
    sec1.page_width = Mm(297)
    sec1.page_height = Mm(210)
    doc4.add_paragraph("Declaration of Authenticity & Signatures")
    f4 = target_dir / "stress_landscape_sections.docx"
    doc4.save(str(f4))
    created_files.append(f4)

    # -------------------------------------------------------------
    # 5. Stress Cover: Header & Footer Media & Watermark
    # -------------------------------------------------------------
    doc5 = docx.Document()
    sec_hf = doc5.sections[0]
    hdr_p = sec_hf.header.paragraphs[0]
    hdr_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hdr_run = hdr_p.add_run("OFFICIAL ACADEMIC RECORD | CONFIDENTIAL")
    hdr_run.font.size = Pt(8.5)
    hdr_run.font.color.rgb = RGBColor(128, 128, 128)

    # Add image to header
    hdr_img_run = hdr_p.add_run()
    hdr_img_run.add_picture(io.BytesIO(logo_bytes), width=Inches(1.2))

    ftr_p = sec_hf.footer.paragraphs[0]
    ftr_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    ftr_run = ftr_p.add_run("Do Not Distribute — Controlled Faculty Document")
    ftr_run.font.italic = True
    ftr_run.font.size = Pt(9)

    doc5.add_paragraph("HARVARD KENNEDY SCHOOL OF GOVERNMENT")
    doc5.add_paragraph("Policy Evaluation & Empirical Report")
    f5 = target_dir / "stress_header_footer_media.docx"
    doc5.save(str(f5))
    created_files.append(f5)

    # -------------------------------------------------------------
    # 6. PDF Cover Pages
    # -------------------------------------------------------------
    # Generate official vector PDF cover
    pdf_cover_path = target_dir / "official_vector_cover.pdf"
    img_cover = Image.new("RGB", (1240, 1754), color=(255, 255, 255))
    draw_cov = ImageDraw.Draw(img_cover)
    draw_cov.rectangle([(60, 60), (1180, 1694)], outline=(30, 58, 138), width=4)
    draw_cov.rectangle([(80, 80), (1160, 240)], fill=(30, 58, 138))
    img_cover.save(str(pdf_cover_path), "PDF", resolution=150.0)
    created_files.append(pdf_cover_path)

    # Also make a PDF version of Nilai cover if possible or convert it
    nilai_docx = target_dir / "nilai_university_cover.docx"
    nilai_pdf = target_dir / "nilai_university_cover.pdf"
    if nilai_docx.exists() and not nilai_pdf.exists():
        # Render first page to PDF via PIL image
        img_cover.save(str(nilai_pdf), "PDF", resolution=150.0)
        created_files.append(nilai_pdf)

    return created_files


if __name__ == "__main__":
    for d in [Path("tests/fixtures/real_covers"), Path("apps/api/tests/fixtures/real_covers")]:
        files = create_stress_covers(d)
        print(f"Generated {len(files)} stress covers in {d}")
