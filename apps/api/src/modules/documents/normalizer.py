"""Normalizes AI-generated reports and assignments.

Strips markdown artifacts:
- Markdown heading markers (# Heading 1, ## Heading 2, ### Heading 3)
- Bold and italic syntax (**, __)
- Horizontal divider rules (---, ***)
- Bullet and numbered list formatting
- Markdown tables (| col1 | col2 |) converted to real native Word tables with styled header rows
"""

import re
from typing import List, Tuple
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls


def set_cell_shading(cell, color_hex: str):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tcPr.append(shd)


def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)


def normalize_ai_report_document(doc: docx.Document, font_family: str = "Times New Roman") -> None:
    """
    Cleans inline markdown artifacts, assigns proper Word styles,
    and converts markdown tables into genuine Word tables.
    """
    paragraphs_to_remove = []
    i = 0
    while i < len(doc.paragraphs):
        p = doc.paragraphs[i]
        raw_text = p.text.strip()

        # 1. Strip horizontal rules
        if re.match(r"^[-*_]{3,}$", raw_text):
            p._p.getparent().remove(p._p)
            continue

        # 2. Markdown tables detection
        if raw_text.startswith("|") and raw_text.endswith("|"):
            table_lines = []
            scan_idx = i
            while scan_idx < len(doc.paragraphs):
                cand = doc.paragraphs[scan_idx].text.strip()
                if cand.startswith("|") and cand.endswith("|"):
                    table_lines.append(cand)
                    scan_idx += 1
                else:
                    break

            if len(table_lines) >= 2:
                # Parse markdown table
                parsed_rows = []
                for line in table_lines:
                    # Ignore separator rows like |---|---|
                    if re.match(r"^\|[\s\-:|]+\|$", line):
                        continue
                    cells = [c.strip() for c in line.strip("|").split("|")]
                    if cells:
                        parsed_rows.append(cells)

                if parsed_rows:
                    num_cols = max(len(r) for r in parsed_rows)
                    # Create native Word table before the first markdown table paragraph
                    new_tbl = doc.add_table(rows=len(parsed_rows), cols=num_cols)
                    new_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                    set_table_borders(new_tbl, color="CBD5E1", sz="4")

                    for r_idx, row_data in enumerate(parsed_rows):
                        row = new_tbl.rows[r_idx]
                        is_header = (r_idx == 0)
                        for c_idx in range(num_cols):
                            cell = row.cells[c_idx]
                            val = row_data[c_idx] if c_idx < len(row_data) else ""
                            # Strip markdown bold inside cell
                            clean_val = re.sub(r"\*\*(.*?)\*\*", r"\1", val)
                            cell.text = clean_val
                            cp = cell.paragraphs[0]
                            cp.paragraph_format.space_before = Pt(4)
                            cp.paragraph_format.space_after = Pt(4)
                            if cp.runs:
                                r = cp.runs[0]
                                r.font.name = font_family
                                r.font.size = Pt(9.5 if is_header else 9.0)
                                if is_header:
                                    r.font.bold = True
                            if is_header:
                                set_cell_shading(cell, "F1F5F9")  # Light slate header

                    # Move new table element right before the markdown table paragraph
                    p._p.addprevious(new_tbl._tbl)

                    # Remove the original markdown table paragraphs
                    for rm_idx in range(i, scan_idx):
                        rm_p = doc.paragraphs[i]
                        rm_p._p.getparent().remove(rm_p._p)
                    continue

        # 3. Heading normalization (#, ##, ###)
        h_match = re.match(r"^(#{1,3})\s+(.*)$", raw_text)
        if h_match:
            level = len(h_match.group(1))
            heading_text = h_match.group(2).strip()
            # Clean any bold/italic markers in heading text
            clean_heading = re.sub(r"\*\*(.*?)\*\*", r"\1", heading_text)
            p.text = clean_heading
            p.style = f"Heading {level}"
            i += 1
            continue

        # 4. Standard list item normalization (* bullet, - bullet, 1. numbered)
        bullet_match = re.match(r"^[\*\-•]\s+(.*)$", raw_text)
        if bullet_match:
            clean_content = bullet_match.group(1).strip()
            clean_content = re.sub(r"\*\*(.*?)\*\*", r"\1", clean_content)
            p.text = f"•   {clean_content}"
            p.paragraph_format.left_indent = Inches(0.25)
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            i += 1
            continue

        # 5. Clean inline markdown asterisks in standard body text
        if "**" in raw_text or "__" in raw_text:
            cleaned = re.sub(r"\*\*(.*?)\*\*", r"\1", raw_text)
            cleaned = re.sub(r"__(.*?)__", r"\1", cleaned)
            p.text = cleaned

        i += 1
