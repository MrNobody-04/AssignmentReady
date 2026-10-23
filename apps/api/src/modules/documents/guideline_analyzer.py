"""Deterministic, reviewable extraction of assignment criteria and formatting briefs.

Parses criteria documents (.pdf, .docx, .txt) into a structured configuration:
- Font family
- Body font size
- Heading 1, 2, 3 sizes and bold/italic
- Line spacing & paragraph spacing
- Text alignment (justified / left)
- Margins (top, bottom, left, right in inches)
- Page numbering position & format
- Referencing style (APA, Harvard, IEEE, MLA, Chicago)
- Caption style
Provides sensible academic defaults if criteria is silent.
"""

import re
from pathlib import Path
from typing import Dict, Any, List
import docx
import pypdf


DEFAULT_CRITERIA_CONFIG = {
    "font_family": "Times New Roman",
    "body_size_pt": 12.0,
    "heading1_size_pt": 16.0,
    "heading1_bold": True,
    "heading1_italic": False,
    "heading2_size_pt": 14.0,
    "heading2_bold": True,
    "heading2_italic": False,
    "heading3_size_pt": 12.0,
    "heading3_bold": True,
    "heading3_italic": True,
    "line_spacing": 1.5,
    "paragraph_space_before_pt": 0.0,
    "paragraph_space_after_pt": 6.0,
    "alignment": "JUSTIFY",
    "paper_size": "A4",
    "margins_top_inches": 1.0,
    "margins_bottom_inches": 1.0,
    "margins_left_inches": 1.0,
    "margins_right_inches": 1.0,
    "page_numbering_position": "BOTTOM_RIGHT",
    "page_numbering_format": "ARABIC",
    "referencing_style": "Harvard",
    "caption_style": "BELOW_FIGURE",
    "start_main_heading_on_new_page": True,
}


def extract_guideline_text(path: Path, content: bytes, extension: str) -> str:
    """Extracts raw text content from a guideline or criteria document."""
    if extension == ".docx":
        try:
            document = docx.Document(str(path))
            return "\n".join(paragraph.text for paragraph in document.paragraphs)
        except Exception:
            return ""
    if extension == ".pdf":
        try:
            reader = pypdf.PdfReader(str(path))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception:
            return ""
    return content.decode("utf-8", errors="replace")


def analyze_guidelines(text: str) -> dict:
    """
    Parses assignment criteria text into structured formatting configuration
    merged with sensible academic defaults.
    """
    compact = re.sub(r"\s+", " ", text).strip()
    lowered = compact.lower()
    
    config: Dict[str, Any] = dict(DEFAULT_CRITERIA_CONFIG)
    evidence: List[str] = []
    detected_fields: List[str] = []

    # 1. Paper Size
    if re.search(r"\ba4\b", lowered):
        config["paper_size"] = "A4"
        evidence.append("Detected A4 paper size.")
        detected_fields.append("paper_size")
    elif re.search(r"\b(?:us )?letter\b", lowered):
        config["paper_size"] = "LETTER"
        evidence.append("Detected Letter paper size.")
        detected_fields.append("paper_size")

    # 2. Font Family
    font_match = re.search(r"\b(times new roman|arial|calibri|cambria|georgia|garamond|helvetica)\b", compact, re.I)
    if font_match:
        matched_font = font_match.group(1).title() if font_match.group(1).lower() != "arial" else "Arial"
        config["font_family"] = matched_font
        evidence.append(f"Detected required font family: {matched_font}.")
        detected_fields.append("font_family")

    # 3. Body Font Size
    size_match = re.search(r"(?:font(?:\s+size)?|body(?:\s+text)?|text)\s*(?:of|:)?\s*(\d{1,2}(?:\.\d+)?)\s*(?:pt|points?)", lowered)
    if size_match:
        size = float(size_match.group(1))
        if 8.0 <= size <= 18.0:
            config["body_size_pt"] = size
            evidence.append(f"Detected {size:g} pt body text size.")
            detected_fields.append("body_size_pt")

    # 4. Heading Sizes
    h1_match = re.search(r"(?:heading\s*1|h1|main\s+headings?)\s*(?:font|size|of|:)?\s*(\d{1,2}(?:\.\d+)?)\s*(?:pt|points?)", lowered)
    if h1_match:
        h1_size = float(h1_match.group(1))
        if 12.0 <= h1_size <= 28.0:
            config["heading1_size_pt"] = h1_size
            evidence.append(f"Detected Heading 1 size: {h1_size:g} pt.")
            detected_fields.append("heading1_size_pt")

    h2_match = re.search(r"(?:heading\s*2|h2|subheadings?)\s*(?:font|size|of|:)?\s*(\d{1,2}(?:\.\d+)?)\s*(?:pt|points?)", lowered)
    if h2_match:
        h2_size = float(h2_match.group(1))
        if 11.0 <= h2_size <= 22.0:
            config["heading2_size_pt"] = h2_size
            evidence.append(f"Detected Heading 2 size: {h2_size:g} pt.")
            detected_fields.append("heading2_size_pt")

    # 5. Line Spacing
    if "double-spaced" in lowered or "double spaced" in lowered or "2.0 spacing" in lowered:
        config["line_spacing"] = 2.0
        evidence.append("Detected double line spacing (2.0).")
        detected_fields.append("line_spacing")
    elif "1.5 line" in lowered or "1.5 spacing" in lowered or "one and a half" in lowered:
        config["line_spacing"] = 1.5
        evidence.append("Detected 1.5 line spacing.")
        detected_fields.append("line_spacing")
    elif "single-spaced" in lowered or "single spaced" in lowered or "1.0 spacing" in lowered:
        config["line_spacing"] = 1.0
        evidence.append("Detected single line spacing (1.0).")
        detected_fields.append("line_spacing")

    # 6. Margins
    margin_match = re.search(r"(\d(?:\.\d+)?)\s*(?:inch|inches|\")\s*(?:margins?|on all sides)", lowered)
    if margin_match:
        margin = float(margin_match.group(1))
        if 0.25 <= margin <= 3.0:
            config["margins_top_inches"] = margin
            config["margins_bottom_inches"] = margin
            config["margins_left_inches"] = margin
            config["margins_right_inches"] = margin
            evidence.append(f"Detected {margin:g}-inch margins on all sides.")
            detected_fields.append("margins")
    elif "2.54 cm" in lowered or "2.5cm" in lowered:
        config["margins_top_inches"] = 1.0
        config["margins_bottom_inches"] = 1.0
        config["margins_left_inches"] = 1.0
        config["margins_right_inches"] = 1.0
        evidence.append("Detected standard 2.54 cm (1 inch) margins.")
        detected_fields.append("margins")

    # 7. Text Alignment
    if "justified" in lowered or "justify" in lowered:
        config["alignment"] = "JUSTIFY"
        evidence.append("Detected justified text alignment.")
        detected_fields.append("alignment")
    elif "left aligned" in lowered or "left-aligned" in lowered or "align left" in lowered:
        config["alignment"] = "LEFT"
        evidence.append("Detected left-aligned body text.")
        detected_fields.append("alignment")

    # 8. Referencing Style
    ref_match = re.search(r"\b(apa(?:\s*(?:6th|7th))?|harvard|ieee|mla(?:\s*(?:8th|9th))?|chicago|vancouver)\b", lowered)
    if ref_match:
        ref_style = ref_match.group(1).upper()
        if "APA" in ref_style:
            config["referencing_style"] = "APA 7th"
        elif "HARVARD" in ref_style:
            config["referencing_style"] = "Harvard"
        elif "IEEE" in ref_style:
            config["referencing_style"] = "IEEE"
        elif "MLA" in ref_style:
            config["referencing_style"] = "MLA 9th"
        elif "CHICAGO" in ref_style:
            config["referencing_style"] = "Chicago"
        elif "VANCOUVER" in ref_style:
            config["referencing_style"] = "Vancouver"
        evidence.append(f"Detected referencing style: {config['referencing_style']}.")
        detected_fields.append("referencing_style")

    # 9. Required Sections
    known_sections = [
        "Introduction", "Literature Review", "Methodology",
        "System Architecture", "Implementation", "Results",
        "Discussion", "Conclusion", "References"
    ]
    required = [section for section in known_sections if section.lower() in lowered]
    if required:
        config["required_sections"] = required
        evidence.append(f"Detected required sections: {', '.join(required)}.")
        detected_fields.append("required_sections")

    # Build response format compatible with UI
    suggestions = {
        "paper_size": config["paper_size"],
        "required_sections": required,
        "body": {
            "font_family": config["font_family"],
            "font_size_pt": config["body_size_pt"],
            "line_spacing": config["line_spacing"],
            "alignment": config["alignment"],
            "space_before_pt": config["paragraph_space_before_pt"],
            "space_after_pt": config["paragraph_space_after_pt"],
        },
        "heading1": {
            "font_family": config["font_family"],
            "font_size_pt": config["heading1_size_pt"],
            "bold": config["heading1_bold"],
            "italic": config["heading1_italic"],
            "page_break_before": config["start_main_heading_on_new_page"],
        },
        "heading2": {
            "font_family": config["font_family"],
            "font_size_pt": config["heading2_size_pt"],
            "bold": config["heading2_bold"],
            "italic": config["heading2_italic"],
        },
        "heading3": {
            "font_family": config["font_family"],
            "font_size_pt": config["heading3_size_pt"],
            "bold": config["heading3_bold"],
            "italic": config["heading3_italic"],
        },
        "margins": {
            "top_inches": config["margins_top_inches"],
            "bottom_inches": config["margins_bottom_inches"],
            "left_inches": config["margins_left_inches"],
            "right_inches": config["margins_right_inches"],
        },
        "referencing_style": config["referencing_style"],
    }

    return {
        "suggestions": suggestions,
        "criteria_config": config,
        "evidence": evidence,
        "detected_fields": detected_fields,
        "has_suggestions": len(detected_fields) > 0,
    }
