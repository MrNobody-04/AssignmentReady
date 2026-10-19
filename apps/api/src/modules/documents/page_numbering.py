import docx
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH
from src.modules.jobs.job_schema import PageNumberingSettings

def _add_fld_simple_page_number(run) -> None:
    fldSimple = OxmlElement("w:fldSimple")
    fldSimple.set(qn("w:instr"), "PAGE")
    run._r.append(fldSimple)

def apply_page_numbering(doc: docx.Document, settings) -> None:
    """
    Configures Word section breaks, unlinks headers/footers, and injects dynamic page numbers.
    """
    pn = getattr(settings, "page_numbering", settings)
    if not getattr(pn, "enabled", True):
        return

    alignment_map = {
        "LEFT": WD_ALIGN_PARAGRAPH.LEFT,
        "CENTER": WD_ALIGN_PARAGRAPH.CENTER,
        "RIGHT": WD_ALIGN_PARAGRAPH.RIGHT,
    }
    align_choice = alignment_map.get(getattr(pn, "footer_alignment", "RIGHT"), WD_ALIGN_PARAGRAPH.RIGHT)

    sections = doc.sections
    if not sections:
        return

    # If there are multiple sections (e.g. Section 0 = Cover page, Section 1+ = Body)
    if len(sections) > 1:
        if getattr(pn, "hide_on_cover", True):
            # Clear cover footer and unlink
            cover_footer = sections[0].footer
            cover_footer.is_linked_to_previous = False
            for p in cover_footer.paragraphs:
                p.text = ""

        # Body sections starting at section index 1
        for idx in range(1, len(sections)):
            sec = sections[idx]
            sec.footer.is_linked_to_previous = False

            # Set starting page number if restart is enabled
            if getattr(pn, "restart_at_introduction", True) and idx == 1:
                sectPr = sec._sectPr
                pgNumType = sectPr.find(qn("w:pgNumType"))
                if pgNumType is None:
                    pgNumType = OxmlElement("w:pgNumType")
                    sectPr.append(pgNumType)
                pgNumType.set(qn("w:start"), "1")

            # Ingest footer paragraph
            fp = sec.footer.paragraphs[0] if sec.footer.paragraphs else sec.footer.add_paragraph()
            fp.alignment = align_choice
            fp.text = "Page "
            run = fp.add_run()
            _add_fld_simple_page_number(run)
    else:
        # Single section document
        sec = sections[0]
        if not getattr(pn, "hide_on_cover", False):
            fp = sec.footer.paragraphs[0] if sec.footer.paragraphs else sec.footer.add_paragraph()
            fp.alignment = align_choice
            fp.text = "Page "
            run = fp.add_run()
            _add_fld_simple_page_number(run)
