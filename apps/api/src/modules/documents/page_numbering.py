import docx
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH
from src.modules.jobs.job_schema import FormattingSettings, PageNumberingSettings

def _add_fld_simple_page_number(run) -> None:
    fldSimple = OxmlElement("w:fldSimple")
    fldSimple.set(qn("w:instr"), "PAGE")
    run._r.append(fldSimple)

def apply_page_numbering(doc: docx.Document, settings: FormattingSettings) -> None:
    """
    Configures Word section breaks, unlinks headers/footers, and injects dynamic page numbers
    with institutional Roman numerals for front matter and Arabic numerals starting at 1 for body.
    """
    pn = getattr(settings, "page_numbering", None)
    if pn is None or not getattr(pn, "enabled", True):
        return

    alignment_map = {
        "LEFT": WD_ALIGN_PARAGRAPH.LEFT,
        "CENTER": WD_ALIGN_PARAGRAPH.CENTER,
        "RIGHT": WD_ALIGN_PARAGRAPH.RIGHT,
    }
    align_choice = alignment_map.get(getattr(pn, "footer_alignment", "RIGHT"), WD_ALIGN_PARAGRAPH.RIGHT)

    sections = doc.sections
    num_sections = len(sections)
    if num_sections == 0:
        return

    has_cover = getattr(getattr(settings, "cover_page", None), "enabled", False)
    # Check if front matter was inserted
    has_front_matter = (
        getattr(getattr(settings, "declaration", None), "enabled", False)
        or getattr(getattr(settings, "acknowledgement", None), "enabled", False)
        or getattr(getattr(settings, "abstract", None), "enabled", False)
        or getattr(getattr(settings, "table_of_contents", None), "enabled", False)
        or getattr(getattr(settings, "list_of_figures", None), "enabled", False)
        or getattr(getattr(settings, "list_of_tables", None), "enabled", False)
        or getattr(getattr(settings, "list_of_abbreviations", None), "enabled", False)
    )

    # Case 1: 3 sections (Cover + Front Matter + Main Body)
    if num_sections >= 3 and has_cover:
        # Section 0: Cover Page
        sec_cover = sections[0]
        if getattr(pn, "hide_on_cover", True):
            sec_cover.different_first_page_header_footer = True
            sec_cover.footer.is_linked_to_previous = False
            for p in sec_cover.footer.paragraphs:
                p.text = ""
            if hasattr(sec_cover, "first_page_footer"):
                sec_cover.first_page_footer.is_linked_to_previous = False
                for p in sec_cover.first_page_footer.paragraphs:
                    p.text = ""

        # Section 1: Front Matter
        sec_fm = sections[1]
        sec_fm.footer.is_linked_to_previous = False
        sectPr_fm = sec_fm._sectPr
        pg_fm = sectPr_fm.find(qn("w:pgNumType"))
        if pg_fm is None:
            pg_fm = OxmlElement("w:pgNumType")
            sectPr_fm.append(pg_fm)
        if getattr(pn, "roman_front_matter", True):
            pg_fm.set(qn("w:fmt"), "lowerRoman")
            pg_fm.set(qn("w:start"), "1")

        fp_fm = sec_fm.footer.paragraphs[0] if sec_fm.footer.paragraphs else sec_fm.footer.add_paragraph()
        fp_fm.alignment = align_choice
        fp_fm.text = "Page "
        _add_fld_simple_page_number(fp_fm.add_run())

        # Section 2: Main Body
        sec_body = sections[2]
        sec_body.footer.is_linked_to_previous = False
        sectPr_body = sec_body._sectPr
        pg_body = sectPr_body.find(qn("w:pgNumType"))
        if pg_body is None:
            pg_body = OxmlElement("w:pgNumType")
            sectPr_body.append(pg_body)
        if getattr(pn, "restart_at_introduction", True):
            pg_body.set(qn("w:fmt"), "decimal")
            pg_body.set(qn("w:start"), "1")

        fp_body = sec_body.footer.paragraphs[0] if sec_body.footer.paragraphs else sec_body.footer.add_paragraph()
        fp_body.alignment = align_choice
        fp_body.text = "Page "
        _add_fld_simple_page_number(fp_body.add_run())

        # Any extra sections (Section 3+)
        for idx in range(3, num_sections):
            sec_extra = sections[idx]
            sec_extra.footer.is_linked_to_previous = False
            fp_extra = sec_extra.footer.paragraphs[0] if sec_extra.footer.paragraphs else sec_extra.footer.add_paragraph()
            fp_extra.alignment = align_choice
            fp_extra.text = "Page "
            _add_fld_simple_page_number(fp_extra.add_run())

    # Case 2: 2 sections (Cover + Body, OR Front Matter + Body)
    elif num_sections == 2:
        if has_cover:
            # Section 0: Cover
            sec_cov = sections[0]
            if getattr(pn, "hide_on_cover", True):
                sec_cov.different_first_page_header_footer = True
                sec_cov.footer.is_linked_to_previous = False
                for p in sec_cov.footer.paragraphs:
                    p.text = ""
            # Section 1: Body
            sec_body = sections[1]
            sec_body.footer.is_linked_to_previous = False
            sectPr_b = sec_body._sectPr
            pg_b = sectPr_b.find(qn("w:pgNumType"))
            if pg_b is None:
                pg_b = OxmlElement("w:pgNumType")
                sectPr_b.append(pg_b)
            if getattr(pn, "restart_at_introduction", True):
                pg_b.set(qn("w:fmt"), "decimal")
                pg_b.set(qn("w:start"), "1")
            fp_b = sec_body.footer.paragraphs[0] if sec_body.footer.paragraphs else sec_body.footer.add_paragraph()
            fp_b.alignment = align_choice
            fp_b.text = "Page "
            _add_fld_simple_page_number(fp_b.add_run())
        else:
            # Section 0: Front Matter (Roman)
            sec_fm = sections[0]
            sectPr_fm = sec_fm._sectPr
            pg_fm = sectPr_fm.find(qn("w:pgNumType"))
            if pg_fm is None:
                pg_fm = OxmlElement("w:pgNumType")
                sectPr_fm.append(pg_fm)
            if getattr(pn, "roman_front_matter", True):
                pg_fm.set(qn("w:fmt"), "lowerRoman")
                pg_fm.set(qn("w:start"), "1")
            fp_fm = sec_fm.footer.paragraphs[0] if sec_fm.footer.paragraphs else sec_fm.footer.add_paragraph()
            fp_fm.alignment = align_choice
            fp_fm.text = "Page "
            _add_fld_simple_page_number(fp_fm.add_run())

            # Section 1: Body (Decimal start 1)
            sec_b = sections[1]
            sec_b.footer.is_linked_to_previous = False
            sectPr_b = sec_b._sectPr
            pg_b = sectPr_b.find(qn("w:pgNumType"))
            if pg_b is None:
                pg_b = OxmlElement("w:pgNumType")
                sectPr_b.append(pg_b)
            pg_b.set(qn("w:fmt"), "decimal")
            pg_b.set(qn("w:start"), "1")
            fp_b = sec_b.footer.paragraphs[0] if sec_b.footer.paragraphs else sec_b.footer.add_paragraph()
            fp_b.alignment = align_choice
            fp_b.text = "Page "
            _add_fld_simple_page_number(fp_b.add_run())

    # Case 3: 1 section (Single section document)
    else:
        sec = sections[0]
        if not (has_cover and getattr(pn, "hide_on_cover", False)):
            fp = sec.footer.paragraphs[0] if sec.footer.paragraphs else sec.footer.add_paragraph()
            fp.alignment = align_choice
            fp.text = "Page "
            _add_fld_simple_page_number(fp.add_run())
