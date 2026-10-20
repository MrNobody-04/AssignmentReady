import io
import re
from pathlib import Path
from typing import Literal
from pydantic import BaseModel, Field
import docx
import openpyxl
import pypdf

from src.modules.presentation.report_analyzer import StructuredReport, ReportSection

class AssessmentCriterion(BaseModel):
    id: str
    title: str
    weight_percent: float = 0.0
    max_marks: float = 0.0
    description: str = ""
    expected_evidence: list[str] = Field(default_factory=list)
    category: str = "General Assessment"

class CriterionComplianceMatch(BaseModel):
    criterion_id: str
    criterion_title: str
    weight_percent: float
    status: Literal[
        "covered_with_evidence",
        "partially_covered",
        "missing_from_report",
        "uncertain_review_required",
        "strong_match",
        "partial_match",
        "missing_evidence",
    ]
    matched_sections: list[str] = Field(default_factory=list)
    evidence_snippets: list[str] = Field(default_factory=list)
    score_percent: float = 0.0
    recommendation: str = ""

class RubricAnalysisResult(BaseModel):
    rubric_title: str = "Assessment Rubric"
    total_criteria_count: int = 0
    total_weight_found: float = 0.0
    criteria: list[AssessmentCriterion] = Field(default_factory=list)
    compliance_matches: list[CriterionComplianceMatch] = Field(default_factory=list)
    overall_compliance_score: float = 0.0
    missing_evidence_warnings: list[str] = Field(default_factory=list)
    required_criteria_covered: str = "0/0"
    covered_count: int = 0

# Academic category keywords
CRITERION_KEYWORDS = {
    "Research & Context": ["literature", "background", "context", "problem", "review", "scope", "foundation", "fading", "clo2", "signal", "propagation"],
    "Methodology & Implementation": ["methodology", "method", "design", "architecture", "implementation", "development", "algorithm", "technique", "approach", "clo3", "technology", "cellular", "wi-fi", "bluetooth", "wimax"],
    "Analysis & Results": ["result", "finding", "data", "analysis", "evaluation", "experiment", "performance", "metric", "testing", "coverage", "capacity", "hall"],
    "Critical Discussion": ["discussion", "implication", "critical", "limitation", "synthesis", "reflection", "interpretation", "case study", "trade-off"],
    "Academic Presentation": ["referencing", "citation", "structure", "clarity", "grammar", "formatting", "layout", "slides", "delivery"],
}

def _extract_weight_from_text(text: str) -> tuple[float, float]:
    """Extracts percentage (e.g. 25%) or mark (e.g. 20 marks) from text."""
    pct_match = re.search(r"(\d+(?:\.\d+)?)\s*%", text)
    if pct_match:
        val = float(pct_match.group(1))
        return val, val

    mark_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:marks?|pts?|points?)", text, re.IGNORECASE)
    if mark_match:
        val = float(mark_match.group(1))
        return val, val

    bracket_match = re.search(r"[\(\[]\s*(\d{1,3})\s*(?:%|marks?)?\s*[\)\]]", text, re.IGNORECASE)
    if bracket_match:
        val = float(bracket_match.group(1))
        return val, val

    return 0.0, 0.0

def _categorize_criterion(title: str, desc: str) -> str:
    combined = f"{title} {desc}".lower()
    for cat, kws in CRITERION_KEYWORDS.items():
        if any(kw in combined for kw in kws):
            return cat
    return "General Academic Quality"

def _clean_academic_text(text: str) -> str:
    """Removes bad encoding glyphs and normalizes dashes."""
    return text.replace("\ufffd", "-").replace("\u2013", "-").replace("\u2014", "-").strip()

def _extract_criteria_from_paragraphs(lines: list[str]) -> list[AssessmentCriterion]:
    """
    Intelligently parses question-based assignment briefs, CLO descriptors,
    or structured checklists from document paragraph lines.
    """
    criteria: list[AssessmentCriterion] = []
    current_q: dict | None = None
    seen_q_keys = set()

    flattened_lines: list[str] = []
    for l in lines:
        for subl in l.split("\n"):
            subl_str = subl.strip()
            if subl_str:
                flattened_lines.append(subl_str)

    for line in flattened_lines:
        cleaned_line = _clean_academic_text(line)
        if not cleaned_line:
            continue

        # Check for Question, Task, or Criterion pattern (e.g. "Question 1: Signal Fading - CLO2" or "Criterion 1: Background")
        qm = re.match(
            r"^(?:(?:Part\s+[A-Z]\s*[\-\–—:]\s*)?(?:Question|Q|Task|Criterion|Criteria)\s*(\d+|[A-Z]))[\s:\.\-–—]+(.+)",
            cleaned_line,
            re.IGNORECASE,
        )
        if qm:
            q_num = qm.group(1).upper()
            if q_num not in seen_q_keys:
                if current_q:
                    criteria.append(_build_criterion_from_dict(current_q, len(criteria) + 1))
                seen_q_keys.add(q_num)
                w_pct, m_val = _extract_weight_from_text(cleaned_line)
                current_q = {
                    "id": f"crit_q{q_num}",
                    "title": qm.group(0),
                    "subparts": [],
                    "desc": [],
                    "weight_percent": w_pct,
                    "max_marks": m_val,
                }
            continue

        # If inside a question block, collect subparts or text
        if current_q:
            # Stop if reaching standard structural boundaries
            if re.match(r"^(?:Submission|YOUR REPORT|Required Sections|Main expectation|Instructions:)", cleaned_line, re.IGNORECASE):
                criteria.append(_build_criterion_from_dict(current_q, len(criteria) + 1))
                current_q = None
            else:
                sub = re.match(r"^([a-z]\.|\([a-z]\))\s*(.+)", cleaned_line, re.IGNORECASE)
                if sub:
                    sub_text = sub.group(2).strip()
                    current_q["subparts"].append(sub_text)
                    w_pct, m_val = _extract_weight_from_text(sub_text)
                    if w_pct > 0 and current_q["weight_percent"] == 0.0:
                        current_q["weight_percent"] += w_pct
                else:
                    current_q["desc"].append(cleaned_line)

    if current_q and current_q["id"] not in [c.id for c in criteria]:
        criteria.append(_build_criterion_from_dict(current_q, len(criteria) + 1))

    # Fallback to CLO descriptors if no Questions found
    if not criteria:
        for line in lines:
            cleaned = _clean_academic_text(line)
            clo_match = re.match(r"^(?:CLO|LO|Outcome)\s*(\d+)[\s:\.\-–—]+(.+)", cleaned, re.IGNORECASE)
            if clo_match:
                w_pct, m_val = _extract_weight_from_text(cleaned)
                criteria.append(
                    AssessmentCriterion(
                        id=f"crit_clo{clo_match.group(1)}",
                        title=cleaned[:80],
                        weight_percent=w_pct,
                        max_marks=m_val,
                        description=cleaned,
                        category=_categorize_criterion(cleaned, ""),
                    )
                )

    # Fallback to paragraph list mentioning marks / percentage
    if not criteria:
        for line in lines:
            cleaned = _clean_academic_text(line)
            w_pct, m_val = _extract_weight_from_text(cleaned)
            if w_pct > 0 and len(cleaned) < 180:
                clean_title = re.sub(r"^\d+[\.\)]\s*", "", cleaned).strip()
                clean_title = re.sub(r"[\(\[]?\d+(?:\.\d+)?\s*(?:%|marks?|pts?)[\)\]]?", "", clean_title, flags=re.IGNORECASE).strip()
                if len(clean_title) > 3 and not clean_title.lower().startswith("august"):
                    criteria.append(
                        AssessmentCriterion(
                            id=f"crit_{len(criteria) + 1}",
                            title=clean_title or cleaned[:60],
                            weight_percent=w_pct,
                            max_marks=m_val,
                            description=cleaned,
                            category=_categorize_criterion(clean_title, cleaned),
                        )
                    )

    # Distribute proportional weights if missing or equal to 0
    total_w = sum(c.weight_percent for c in criteria)
    if total_w < 5.0 and criteria:
        unit = round(100.0 / len(criteria), 1)
        for c in criteria:
            c.weight_percent = unit
            c.max_marks = unit

    return criteria

def _build_criterion_from_dict(q_data: dict, index: int) -> AssessmentCriterion:
    title = q_data["title"]
    subparts = q_data.get("subparts", [])
    desc_lines = q_data.get("desc", [])
    desc = " ".join(desc_lines)
    w_pct = q_data.get("weight_percent", 0.0)
    m_val = q_data.get("max_marks", 0.0)

    return AssessmentCriterion(
        id=q_data.get("id", f"crit_{index}"),
        title=title,
        weight_percent=w_pct,
        max_marks=m_val,
        description=desc,
        expected_evidence=subparts,
        category=_categorize_criterion(title, desc + " " + " ".join(subparts)),
    )

def extract_rubric_from_docx(doc_path: Path) -> list[AssessmentCriterion]:
    """Extracts criteria from Word table or list marking schemes / assignment briefs."""
    doc = docx.Document(str(doc_path))
    criteria: list[AssessmentCriterion] = []

    # First attempt: parse tables (standard marking rubric format)
    for t_idx, table in enumerate(doc.tables):
        if not table.rows:
            continue
        header_cells = [c.text.lower().strip() for c in table.rows[0].cells]
        crit_col = -1
        weight_col = -1
        desc_col = -1

        for c_idx, h_text in enumerate(header_cells):
            if any(k in h_text for k in ["criterion", "criteria", "component", "assessment task", "learning outcome", "grading", "section"]):
                crit_col = c_idx
            elif any(k in h_text for k in ["weight", "percentage", "%", "marks", "max mark", "points"]):
                weight_col = c_idx
            elif any(k in h_text for k in ["description", "descriptor", "standard", "expectation", "criteria detail"]):
                desc_col = c_idx

        # If columns identified, extract rows
        if crit_col != -1:
            for r_idx, row in enumerate(table.rows[1:], start=1):
                cells = row.cells
                if len(cells) <= crit_col:
                    continue
                c_title = cells[crit_col].text.strip()
                if not c_title or len(c_title) < 3 or c_title.lower().startswith("total"):
                    continue

                w_text = cells[weight_col].text.strip() if weight_col != -1 and len(cells) > weight_col else ""
                d_text = cells[desc_col].text.strip() if desc_col != -1 and len(cells) > desc_col else ""

                w_pct, m_val = _extract_weight_from_text(w_text)
                if w_pct == 0.0:
                    w_pct, m_val = _extract_weight_from_text(c_title)

                criteria.append(
                    AssessmentCriterion(
                        id=f"crit_{len(criteria) + 1}",
                        title=_clean_academic_text(c_title),
                        weight_percent=w_pct,
                        max_marks=m_val,
                        description=_clean_academic_text(d_text),
                        category=_categorize_criterion(c_title, d_text),
                    )
                )

    # If table didn't yield at least 2 structured criteria, parse paragraphs
    if len(criteria) < 2:
        para_lines = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        para_criteria = _extract_criteria_from_paragraphs(para_lines)
        if len(para_criteria) > len(criteria):
            criteria = para_criteria

    return criteria

def extract_rubric_from_xlsx(file_path: Path) -> list[AssessmentCriterion]:
    """Extracts criteria from Excel spreadsheets."""
    wb = openpyxl.load_workbook(str(file_path), data_only=True)
    criteria: list[AssessmentCriterion] = []

    sheet = wb.active
    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return criteria

    crit_col = 0
    weight_col = 1
    desc_col = -1

    # Search for header row in first 5 rows
    for r_idx, row in enumerate(rows[:5]):
        for c_idx, cell in enumerate(row):
            if cell is None:
                continue
            c_str = str(cell).lower().strip()
            if any(k in c_str for k in ["criterion", "criteria", "task", "component", "outcome"]):
                crit_col = c_idx
            elif any(k in c_str for k in ["weight", "percentage", "%", "marks", "points"]):
                weight_col = c_idx
            elif any(k in c_str for k in ["description", "descriptor", "standard"]):
                desc_col = c_idx

    for row in rows[1:]:
        if len(row) <= crit_col or row[crit_col] is None:
            continue
        c_val = str(row[crit_col]).strip()
        if not c_val or c_val.lower().startswith("total") or len(c_val) < 3:
            continue

        w_val_str = str(row[weight_col]).strip() if len(row) > weight_col and row[weight_col] is not None else ""
        d_val_str = str(row[desc_col]).strip() if desc_col != -1 and len(row) > desc_col and row[desc_col] is not None else ""

        w_pct, m_val = _extract_weight_from_text(w_val_str)
        if w_pct == 0.0:
            try:
                numeric_val = float(w_val_str.rstrip("%"))
                if 0 < numeric_val <= 100:
                    w_pct = numeric_val
                    m_val = numeric_val
            except ValueError:
                pass

        criteria.append(
            AssessmentCriterion(
                id=f"crit_{len(criteria) + 1}",
                title=_clean_academic_text(c_val),
                weight_percent=w_pct,
                max_marks=m_val,
                description=_clean_academic_text(d_val_str),
                category=_categorize_criterion(c_val, d_val_str),
            )
        )

    # Proportional weight fallback
    total_w = sum(c.weight_percent for c in criteria)
    if total_w < 5.0 and criteria:
        unit = round(100.0 / len(criteria), 1)
        for c in criteria:
            c.weight_percent = unit
            c.max_marks = unit

    return criteria

def extract_rubric_from_pdf(pdf_bytes: bytes) -> list[AssessmentCriterion]:
    """Extracts criteria from PDF marking schemes."""
    reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    full_text = "\n".join(p.extract_text() or "" for p in reader.pages)
    return extract_rubric_from_text(full_text)

def extract_rubric_from_text(text: str) -> list[AssessmentCriterion]:
    """Extracts criteria from plain text or extracted PDF text."""
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    return _extract_criteria_from_paragraphs(lines)

def map_report_to_rubric(report: StructuredReport, criteria: list[AssessmentCriterion]) -> RubricAnalysisResult:
    """
    Evaluates each assessment criterion against the structured report content.
    Identifies strong matches, partial matches, and missing evidence.
    Generates student compliance warnings and live metrics.
    """
    if not criteria:
        # Default synthesized criteria based on report sections
        criteria = [
            AssessmentCriterion(id="crit_1", title="Problem Formulation & Context", weight_percent=20.0, category="Research & Context"),
            AssessmentCriterion(id="crit_2", title="Methodology & Technical Design", weight_percent=30.0, category="Methodology & Implementation"),
            AssessmentCriterion(id="crit_3", title="Empirical Results & Evaluation", weight_percent=30.0, category="Analysis & Results"),
            AssessmentCriterion(id="crit_4", title="Critical Reflection & Conclusion", weight_percent=10.0, category="Critical Discussion"),
            AssessmentCriterion(id="crit_5", title="Academic Referencing & Structure", weight_percent=10.0, category="Academic Presentation"),
        ]

    compliance_matches: list[CriterionComplianceMatch] = []
    warnings: list[str] = []
    total_score = 0.0
    total_weight = sum(c.weight_percent for c in criteria) or 100.0

    for crit in criteria:
        crit_title_lower = crit.title.lower()
        crit_text = f"{crit.title} {crit.description} {' '.join(crit.expected_evidence)}".lower()
        matched_sections: list[str] = []
        evidence_snippets: list[str] = []

        # Extract question number or key identifiers if present (e.g. "Question 1", "Question 2", "CLO2")
        q_num_match = re.search(r"question\s*(\d+|[a-z])", crit_title_lower)
        q_num = q_num_match.group(1) if q_num_match else None
        clo_match = re.search(r"clo\s*(\d+)", crit_title_lower)
        clo_id = clo_match.group(1) if clo_match else None

        # Check against all report sections and sub-headings
        for sec in report.sections:
            sec_heading_lower = sec.heading.lower()
            sec_text = f"{sec.heading} {sec.content} {' '.join(sec.bullets)}".lower()

            hit = False

            # 1. Direct Question number hit (e.g., Question 1 in heading or parent_heading)
            if q_num and (f"question {q_num}" in sec_heading_lower or f"question {q_num}" in (sec.parent_heading or "").lower()):
                hit = True
            elif q_num and f"part {q_num}" in sec_heading_lower:
                hit = True

            # 2. Direct CLO identifier hit
            if not hit and clo_id and f"clo{clo_id}" in sec_heading_lower:
                hit = True

            # 3. Direct Subpart alignment (check if section heading matches expected evidence)
            if not hit and crit.expected_evidence:
                for sub in crit.expected_evidence:
                    sub_words = [w for w in re.findall(r"\b[a-z]{3,}\b", sub.lower())]
                    if sub_words and sum(1 for w in sub_words if w in sec_heading_lower) >= 1:
                        hit = True
                        break

            # 4. Standard Academic Pillar Alignment
            if not hit:
                academic_pillars = [
                    (["problem", "context", "introduction", "motivation", "background", "aims", "objective"], ["problem", "context", "introduction", "background", "aims", "objective"]),
                    (["methodology", "method", "design", "architecture", "implementation", "pipeline", "technical"], ["methodology", "method", "design", "architecture", "implementation", "pipeline", "technical"]),
                    (["result", "evaluation", "experiment", "benchmark", "performance", "metric", "testing"], ["result", "evaluation", "experiment", "benchmark", "performance", "metric", "testing"]),
                    (["conclusion", "reflection", "limitation", "discussion", "future"], ["conclusion", "reflection", "limitation", "discussion", "future"]),
                    (["referencing", "reference", "citation", "bibliography", "delivery"], ["reference", "bibliography", "citation", "works cited"]),
                    (["fading", "causes", "multipath"], ["fading", "causes", "multipath", "walls"]),
                    (["technology", "cellular", "wi-fi", "bluetooth", "wimax"], ["technology", "cellular", "wi-fi", "bluetooth", "wimax", "comparison"]),
                    (["coverage", "capacity", "lecture hall"], ["coverage", "capacity", "hall"]),
                ]
                for crit_kws, sec_kws in academic_pillars:
                    if any(k in crit_title_lower for k in crit_kws) and any(k in sec_heading_lower for k in sec_kws):
                        hit = True
                        break

            # 5. Overlap score (common significant words)
            if not hit:
                crit_words = set(re.findall(r"\b[a-z]{3,}\b", crit_text))
                sec_words = set(re.findall(r"\b[a-z]{3,}\b", sec_text))
                common = crit_words.intersection(sec_words)
                if len(common) >= 2:
                    hit = True

            if hit:
                matched_sections.append(sec.heading)
                for b in sec.bullets:
                    if b and b not in evidence_snippets:
                        evidence_snippets.append(b)
                        if len(evidence_snippets) >= 2:
                            break

        # Determine compliance status
        if len(matched_sections) >= 2 or (len(matched_sections) >= 1 and len(evidence_snippets) >= 1):
            status = "covered_with_evidence"
            score = 100.0
            rec = "Strong evidence found in report to substantiate this criterion in the presentation."
        elif len(matched_sections) == 1:
            status = "partially_covered"
            score = 65.0
            rec = "Partial evidence found. Consider expanding the specific findings in your slides."
            warnings.append(f"Partial Evidence: Criterion '{crit.title}' has limited matching coverage in your report.")
        else:
            status = "missing_from_report"
            score = 25.0
            rec = f"No direct evidence found for '{crit.title}'. We recommend adding dedicated talking points or an extra slide to address this."
            warnings.append(f"Missing Evidence: Rubric criterion '{crit.title}' ({crit.weight_percent}%) does not appear prominently in the report.")

        compliance_matches.append(
            CriterionComplianceMatch(
                criterion_id=crit.id,
                criterion_title=crit.title,
                weight_percent=crit.weight_percent,
                status=status,
                matched_sections=matched_sections,
                evidence_snippets=evidence_snippets[:2],
                score_percent=score,
                recommendation=rec,
            )
        )

        weight_factor = (crit.weight_percent / total_weight) if total_weight > 0 else (1.0 / len(criteria))
        total_score += score * weight_factor

    covered_count = sum(1 for m in compliance_matches if m.status in ["covered_with_evidence", "strong_match"])
    ratio_display = f"{covered_count}/{len(criteria)}"

    return RubricAnalysisResult(
        rubric_title="Assessed Rubric Alignment",
        total_criteria_count=len(criteria),
        total_weight_found=round(total_weight, 1),
        criteria=criteria,
        compliance_matches=compliance_matches,
        overall_compliance_score=round(total_score, 1),
        missing_evidence_warnings=warnings,
        required_criteria_covered=ratio_display,
        covered_count=covered_count,
    )
