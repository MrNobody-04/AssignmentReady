import docx
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, RGBColor
from src.modules.jobs.job_schema import TableOfContentsSettings

def insert_table_of_contents(doc: docx.Document, settings: TableOfContentsSettings, insert_index: int = 0) -> None:
    """
    Inserts a native Microsoft Word Table of Contents field code and heading.
    """
    if not settings.enabled:
        return

    # Check if TOC already exists to avoid duplicates
    for p in doc.paragraphs[:15]:
        if "TOC " in p._p.xml or (p.text.strip().lower() in ["table of contents", "contents"] and "Heading" in p.style.name):
            return

    # Create TOC Title paragraph
    if insert_index < len(doc.paragraphs):
        target_p = doc.paragraphs[insert_index]
        title_p = target_p.insert_paragraph_before(settings.title, style="Heading 1")
    else:
        title_p = doc.add_paragraph(settings.title, style="Heading 1")

    # Instruction / guidance paragraph
    guide_p = title_p.insert_paragraph_before() if insert_index < len(doc.paragraphs) else doc.add_paragraph()
    guide_p.text = "[Table of Contents: In Microsoft Word or Pages, right-click and choose 'Update Field' to populate exact page numbers.]"
    guide_p.paragraph_format.space_after = Pt(6)
    if guide_p.runs:
        guide_p.runs[0].font.size = Pt(9.5)
        guide_p.runs[0].font.italic = True
        guide_p.runs[0].font.color.rgb = RGBColor(100, 116, 139)

    # Insert the TOC field code paragraph
    toc_p = title_p.insert_paragraph_before() if insert_index < len(doc.paragraphs) else doc.add_paragraph()
    run = toc_p.add_run()
    r_elm = run._r

    depth = max(1, min(settings.depth, 4))
    field_code = f'TOC \\o "1-{depth}" \\h \\z \\u'

    fldChar1 = OxmlElement("w:fldChar")
    fldChar1.set(qn("w:fldCharType"), "begin")

    instrText = OxmlElement("w:instrText")
    instrText.set(qn("xml:space"), "preserve")
    instrText.text = field_code

    fldChar2 = OxmlElement("w:fldChar")
    fldChar2.set(qn("w:fldCharType"), "separate")

    # Fallback text inside field
    fallback_run = OxmlElement("w:r")
    fallback_text = OxmlElement("w:t")
    fallback_text.text = "Table of Contents (Auto-generated on open)"
    fallback_run.append(fallback_text)

    fldChar3 = OxmlElement("w:fldChar")
    fldChar3.set(qn("w:fldCharType"), "end")

    r_elm.append(fldChar1)
    r_elm.append(instrText)
    r_elm.append(fldChar2)
    r_elm.append(fallback_run)
    r_elm.append(fldChar3)

    # Add a page break after TOC
    break_p = title_p.insert_paragraph_before() if insert_index < len(doc.paragraphs) else doc.add_paragraph()
    break_p.paragraph_format.page_break_before = True
