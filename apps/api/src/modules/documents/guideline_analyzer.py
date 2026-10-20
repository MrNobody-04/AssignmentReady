"""Deterministic, reviewable extraction of common assignment-format requirements."""

import re
from pathlib import Path

import docx
import pypdf


def extract_guideline_text(path: Path, content: bytes, extension: str) -> str:
    if extension == ".docx":
        document = docx.Document(path)
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    if extension == ".pdf":
        reader = pypdf.PdfReader(path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    return content.decode("utf-8", errors="replace")


def analyze_guidelines(text: str) -> dict:
    """Return only high-confidence suggestions; the UI applies them transparently."""
    compact = re.sub(r"\s+", " ", text).strip()
    lowered = compact.lower()
    suggestions: dict = {}
    evidence: list[str] = []

    if re.search(r"\ba4\b", lowered):
        suggestions["paper_size"] = "A4"
        evidence.append("Detected A4 paper size.")
    elif re.search(r"\b(?:us )?letter\b", lowered):
        suggestions["paper_size"] = "LETTER"
        evidence.append("Detected Letter paper size.")

    font_match = re.search(r"\b(times new roman|arial|calibri|cambria|georgia)\b", compact, re.I)
    body: dict = {}
    if font_match:
        body["font_family"] = font_match.group(1).title() if font_match.group(1).lower() != "arial" else "Arial"
        evidence.append(f"Detected {body['font_family']} as a required font.")
    size_match = re.search(r"(?:font(?:\s+size)?|text)\s*(?:of|:)?\s*(\d{1,2}(?:\.\d+)?)\s*(?:pt|points?)", lowered)
    if size_match:
        size = float(size_match.group(1))
        if 8 <= size <= 18:
            body["font_size_pt"] = size
            evidence.append(f"Detected {size:g} pt body text.")
    if "double-spaced" in lowered or "double spaced" in lowered:
        body["line_spacing"] = 2.0
        evidence.append("Detected double line spacing.")
    elif "1.5 line" in lowered or "1.5 spacing" in lowered or "one and a half" in lowered:
        body["line_spacing"] = 1.5
        evidence.append("Detected 1.5 line spacing.")
    elif "single-spaced" in lowered or "single spaced" in lowered:
        body["line_spacing"] = 1.0
        evidence.append("Detected single line spacing.")
    if body:
        suggestions["body"] = body

    margin_match = re.search(r"(\d(?:\.\d+)?)\s*(?:inch|inches|\")\s*(?:margins?|on all sides)", lowered)
    if margin_match:
        margin = float(margin_match.group(1))
        if 0.2 <= margin <= 3:
            suggestions["margins"] = {
                "top_inches": margin, "bottom_inches": margin,
                "left_inches": margin, "right_inches": margin,
            }
            evidence.append(f"Detected {margin:g}-inch margins.")

    known_sections = ["Introduction", "Literature Review", "Methodology", "Results", "Discussion", "Conclusion", "References"]
    required = [section for section in known_sections if section.lower() in lowered]
    if required:
        suggestions["required_sections"] = required
        evidence.append("Detected required sections: " + ", ".join(required) + ".")

    return {"suggestions": suggestions, "evidence": evidence, "has_suggestions": bool(suggestions)}
