import re
import io
from pathlib import Path
from typing import Optional, Literal
from pydantic import BaseModel, Field
import docx
import pypdf

# Specific academic cover patterns
COVER_PATTERNS = [
    r"submitted\s+by\b",
    r"submitted\s+to\b",
    r"student\s+name\b",
    r"student\s+id\b",
    r"matriculation\s+no\b",
    r"roll\s+no\b",
    r"course\s+code\b",
    r"module\s+code\b",
    r"course\s+title\b",
    r"module\s+title\b",
    r"\blecturer\b",
    r"\bsupervisor\b",
    r"\btutor\b",
    r"faculty\s+of\b",
    r"department\s+of\b",
    r"school\s+of\b",
    r"\bacademic\s+year\b",
    r"date\s+of\s+submission\b",
    r"submission\s+date\b",
    r"assignment\s+title\b",
]

# Section mapping rules
SECTION_MAPPINGS = {
    "abstract": [r"\babstract\b", r"\bexecutive\s+summary\b", r"\bsynopsis\b"],
    "introduction": [r"\bintroduction\b", r"\bbackground\b", r"\bcontext\b", r"\bproblem\s+context\b"],
    "problem_statement": [r"\bproblem\s+statement\b", r"\bresearch\s+problem\b", r"\bmotivation\b", r"\bproblem\s+formulation\b"],
    "objectives": [r"\baaims?\b", r"\bobjectives?\b", r"\bresearch\s+questions?\b", r"\bhypothes[ie]s\b", r"\bscope\b"],
    "literature_review": [r"\bliterature\s+review\b", r"\brelated\s+works?\b", r"\bstate\s+of\s+the\s+art\b", r"\btheoretical\s+framework\b", r"\bbackground\s+study\b"],
    "methodology": [r"\bmethodology\b", r"\bmethods?\b", r"\bresearch\s+design\b", r"\bproposed\s+approach\b", r"\bmaterials\s+and\s+methods\b", r"\bdata\s+collection\b"],
    "architecture": [r"\bsystem\s+architecture\b", r"\barchitectural\s+design\b", r"\bconceptual\s+framework\b", r"\bmodel\s+architecture\b", r"\bpipeline\s+design\b", r"\bdata\s+flow\b"],
    "implementation": [r"\bimplementation\b", r"\bdevelopment\b", r"\bexperimental\s+setup\b", r"\bprototyping\b", r"\btooling\b", r"\btechnology\s+stack\b"],
    "comparison": [r"\bcompar(?:ison|e)\b", r"\bversus\b", r"\bvs\.?\b", r"\btradeoffs?\b"],
    "case_study": [r"\bcase\s+study\b", r"\bcampus\b", r"\bscenario\b", r"\bpractical\s+application\b"],
    "results": [r"\bresults\b", r"\bfindings\b", r"\bevaluation\b", r"\bexperimental\s+results\b", r"\bdata\s+analysis\b", r"\bperformance\s+analysis\b", r"\bmetrics\b"],
    "discussion": [r"\bdiscussion\b", r"\bcritical\s+analysis\b", r"\binterpretation\b", r"\bcomparative\s+analysis\b"],
    "limitations": [r"\blimitations?\b", r"\bchallenges?\b", r"\bthreats\s+to\s+validity\b", r"\bconstraints\b"],
    "conclusion": [r"\bconclusion\b", r"\bconcluding\s+remarks\b", r"\bfuture\s+work\b", r"\brecommendations?\b", r"\bsummary\b"],
    "references": [r"\breferences?\b", r"\bbibliography\b", r"\bworks\s+cited\b", r"\bcitations\b"],
    "appendices": [r"\bappendix\b", r"\bappendices\b"],
}

class ExtractedCoverPage(BaseModel):
    title: str = "Academic Research Report"
    subtitle: str = "Comprehensive Analysis & Key Findings"
    student_name: str = ""
    student_id: str = ""
    institution: str = ""
    college_name: str = ""
    course_name: str = ""
    course_code: str = ""
    lecturer_name: str = ""
    submission_date: str = ""
    quarantined_lines: list[str] = Field(default_factory=list)

class SubSectionItem(BaseModel):
    heading: str
    content: str
    bullets: list[str] = Field(default_factory=list)

class ReportSection(BaseModel):
    section_type: str  # e.g., 'abstract', 'introduction', 'methodology', etc.
    heading: str
    parent_heading: str = ""
    level: int = 1
    content: str
    bullets: list[str] = Field(default_factory=list)
    key_metrics: list[str] = Field(default_factory=list)
    has_table: bool = False
    has_figure: bool = False
    table_preview: list[list[str]] = Field(default_factory=list)
    subsections: list[SubSectionItem] = Field(default_factory=list)
    source_location: str = ""
    word_count: int = 0

class StructuredReport(BaseModel):
    cover_page: ExtractedCoverPage
    document_title: str
    course_info: str = ""
    abstract_text: str = ""
    objectives_list: list[str] = Field(default_factory=list)
    sections: list[ReportSection] = Field(default_factory=list)
    total_words: int = 0
    detected_figures_count: int = 0
    detected_tables_count: int = 0
    key_highlights: list[str] = Field(default_factory=list)

def _clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()

def _classify_section_heading(heading_text: str) -> str:
    h_clean = heading_text.lower().strip()
    h_clean = re.sub(r"^(?:chapter\s+\d+|section\s+\d+|\d+[\.\d]*)\s*[:\.\-]?\s*", "", h_clean)

    for sec_type, patterns in SECTION_MAPPINGS.items():
        for pat in patterns:
            if re.search(pat, h_clean):
                return sec_type
    return "content"

def _extract_metrics(text: str) -> list[str]:
    """Extract quantitative data points (percentages, sample sizes, metrics)."""
    metrics = []
    pct_matches = re.findall(r"\b\d+(?:\.\d+)?%\b", text)
    metrics.extend(pct_matches[:3])

    sample_matches = re.findall(r"\b(?:N\s*=\s*\d+|p\s*<\s*0\.\d+|\d+\s*ms|\d+\s*GB|\d+\s*MB|\d+\s*GHz|\d+\s*MHz|\d+\s*kbps|\d+\s*Mbps)\b", text, re.IGNORECASE)
    metrics.extend(sample_matches[:3])
    return list(dict.fromkeys(metrics))[:4]

def _extract_bullets(text: str, max_bullets: int = 5) -> list[str]:
    """Split text into high-value academic summary sentences."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    bullets = []
    for s in sentences:
        s_clean = _clean_text(s)
        if len(s_clean) > 20 and not s_clean.lower().startswith("table") and not s_clean.lower().startswith("figure"):
            if len(s_clean) > 130:
                s_clean = s_clean[:127] + "..."
            bullets.append(s_clean)
            if len(bullets) >= max_bullets:
                break
    return bullets

def analyze_docx_report(file_path: Path) -> StructuredReport:
    """
    Deeply parses a DOCX report:
    1. Identifies and isolates cover page elements into ExtractedCoverPage.
    2. Quarantines cover lines completely so they are NEVER leaked into content slides.
    3. Segments body content by academic headings into structured hierarchical sections.
    4. Detects tables, figure mentions, and objectives lists.
    """
    doc = docx.Document(str(file_path))

    cover = ExtractedCoverPage()
    quarantined: list[str] = []

    # 1. Identify cover boundary
    cover_paragraphs: list[str] = []
    body_paragraphs: list[docx.text.paragraph.Paragraph] = []
    in_cover_page = True

    for p in doc.paragraphs:
        txt = p.text.strip()
        style_name = p.style.name.lower() if p.style else ""
        has_page_break = bool(p._element.xpath('.//w:br[@w:type="page"]') or p._element.xpath('.//w:lastRenderedPageBreak'))

        is_academic_heading = (
            "heading" in style_name
            or (txt.lower() in ["abstract", "executive summary", "table of contents", "introduction", "chapter 1", "1. objectives", "objectives"])
        )

        if in_cover_page:
            if is_academic_heading or (has_page_break and txt):
                in_cover_page = False
                body_paragraphs.append(p)
                continue
            elif has_page_break and not txt:
                in_cover_page = False
                continue

            if txt:
                cover_paragraphs.append(txt)
                if len(cover_paragraphs) >= 14:
                    in_cover_page = False
        else:
            body_paragraphs.append(p)

    # 2. Extract metadata from cover_paragraphs
    for p_text in cover_paragraphs:
        p_lower = p_text.lower()
        if re.search(r"student\s+name|submitted\s+by|author", p_lower):
            m = re.split(r"[:\-]\s*", p_text, maxsplit=1)
            cover.student_name = m[1].strip() if len(m) > 1 else re.sub(r"(?i)student\s+name|submitted\s+by|author", "", p_text).strip()
            quarantined.append(p_text)
        elif re.search(r"student\s+id|matriculation|roll\s+no|id\s*:", p_lower):
            m = re.split(r"[:\-]\s*", p_text, maxsplit=1)
            cover.student_id = m[1].strip() if len(m) > 1 else p_text.strip()
            quarantined.append(p_text)
        elif re.search(r"submitted\s+to|lecturer|supervisor|instructor", p_lower):
            m = re.split(r"[:\-]\s*", p_text, maxsplit=1)
            cover.lecturer_name = m[1].strip() if len(m) > 1 else p_text.strip()
            quarantined.append(p_text)
        elif re.search(r"course\s+code|module\s+code", p_lower) or re.search(r"\b[A-Z]{2,4}\d{3,4}\b", p_text):
            m = re.split(r"[:\-]\s*", p_text, maxsplit=1)
            cover.course_code = m[1].strip() if len(m) > 1 else p_text.strip()
            quarantined.append(p_text)
        elif re.search(r"course\s+title|module\s+title|subject", p_lower):
            m = re.split(r"[:\-]\s*", p_text, maxsplit=1)
            cover.course_name = m[1].strip() if len(m) > 1 else p_text.strip()
            quarantined.append(p_text)
        elif re.search(r"university|college|faculty|department|school\s+of", p_lower):
            if "college" in p_lower:
                cover.college_name = p_text.strip()
            else:
                cover.institution = p_text.strip()
            quarantined.append(p_text)
        elif re.search(r"date|submission\s+date|academic\s+year", p_lower) or re.search(r"\b(?:202[0-9]|january|february|march|april|may|june|july|august|september|october|november|december)\b", p_lower):
            m = re.split(r"[:\-]\s*", p_text, maxsplit=1)
            cover.submission_date = m[1].strip() if len(m) > 1 else p_text.strip()
            quarantined.append(p_text)
        elif any(re.search(pat, p_lower) for pat in COVER_PATTERNS):
            quarantined.append(p_text)

    # Smart title extraction: look for specific title lines (avoid generic program name like 'BACHELOR OF IT' if a specific title exists)
    candidate_titles = []
    for p in cover_paragraphs:
        if p not in quarantined and 6 < len(p) < 120 and not p.lower().startswith("chapter"):
            p_low = p.lower()
            if not any(k in p_low for k in ["bachelor of", "master of", "assignment", "weightage", "department of"]):
                candidate_titles.append(p)

    if candidate_titles:
        cover.title = candidate_titles[0]
        quarantined.append(candidate_titles[0])
        if len(candidate_titles) > 1:
            cover.subtitle = candidate_titles[1]
            quarantined.append(candidate_titles[1])
    else:
        # Fallback to non-quarantined cover paragraphs
        for p in cover_paragraphs:
            if p not in quarantined and 6 < len(p) < 120:
                cover.title = p
                quarantined.append(p)
                break

    cover.quarantined_lines = quarantined

    # 3. Parse Sections with Heading Hierarchy
    sections: list[ReportSection] = []
    current_parent_h = ""
    current_heading = "Introduction & Overview"
    current_level = 1
    current_content: list[str] = []

    fig_count = 0
    tbl_count = len(doc.tables)
    abstract_text = ""
    objectives_list: list[str] = []

    for p in body_paragraphs:
        txt = p.text.strip()
        if not txt:
            continue

        # Strict cover isolation
        if txt in quarantined or any(q == txt or (len(q) > 20 and q in txt) for q in quarantined):
            continue

        # Check for figure caption
        if re.match(r"^(?:figure|fig\.)\s+\d+", txt, re.IGNORECASE):
            fig_count += 1

        # Check for TOC dots
        if re.search(r"\.{4,}\s*\d+$", txt):
            continue

        style_name = p.style.name.lower() if p.style else ""
        
        # Check if heading
        is_h1 = (
            "heading 1" in style_name
            or "front heading" in style_name
            or re.match(r"^\d+\.\s+[A-Z]", txt)
            or (txt.lower() in ["abstract", "objectives", "introduction", "conclusion", "references"])
        )
        is_h2 = (
            "heading 2" in style_name
            or re.match(r"^\([a-z]\)\s+[A-Z]", txt)
            or re.match(r"^\d+\.\d+\s+[A-Z]", txt)
        )
        is_h3 = "heading 3" in style_name or re.match(r"^\d+\.\d+\.\d+\s+", txt)

        if is_h1 or is_h2 or is_h3:
            # Flush current section
            if current_content:
                full_sec_text = " ".join(current_content)
                sec_type = _classify_section_heading(current_heading)
                
                # Check for abstract
                if sec_type == "abstract" and not abstract_text:
                    abstract_text = full_sec_text
                # Check for objectives
                if sec_type == "objectives" and not objectives_list:
                    objectives_list = [b for b in current_content if len(b) > 15][:5]

                sections.append(
                    ReportSection(
                        section_type=sec_type,
                        heading=current_heading,
                        parent_heading=current_parent_h,
                        level=current_level,
                        content=full_sec_text,
                        bullets=_extract_bullets(full_sec_text),
                        key_metrics=_extract_metrics(full_sec_text),
                        source_location=current_heading,
                        word_count=len(full_sec_text.split()),
                    )
                )
                current_content = []

            # Update heading states
            clean_txt = re.sub(r"^\d+[\.\)]\s*", "", txt).strip()
            if is_h1:
                current_parent_h = clean_txt
                current_heading = clean_txt
                current_level = 1
            elif is_h2:
                current_heading = clean_txt
                current_level = 2
            else:
                current_heading = clean_txt
                current_level = 3
        else:
            current_content.append(txt)

    # Flush final section
    if current_content:
        full_sec_text = " ".join(current_content)
        sec_type = _classify_section_heading(current_heading)
        if sec_type == "abstract" and not abstract_text:
            abstract_text = full_sec_text
        if sec_type == "objectives" and not objectives_list:
            objectives_list = [b for b in current_content if len(b) > 15][:5]

        sections.append(
            ReportSection(
                section_type=sec_type,
                heading=current_heading,
                parent_heading=current_parent_h,
                level=current_level,
                content=full_sec_text,
                bullets=_extract_bullets(full_sec_text),
                key_metrics=_extract_metrics(full_sec_text),
                source_location=current_heading,
                word_count=len(full_sec_text.split()),
            )
        )

    # Fallback if document has very few headings
    if len(sections) < 2 and body_paragraphs:
        non_quarantined = [p.text.strip() for p in body_paragraphs if p.text.strip() and p.text.strip() not in quarantined]
        chunk_size = max(2, len(non_quarantined) // 5)
        chunks = [non_quarantined[i:i + chunk_size] for i in range(0, len(non_quarantined), chunk_size)]
        std_names = [
            ("introduction", "Research Context & Problem Formulation"),
            ("objectives", "Project Aims & Key Deliverables"),
            ("methodology", "Methodology & Architecture"),
            ("results", "Key Findings & Implementation Results"),
            ("conclusion", "Critical Summary & Future Work"),
        ]
        sections = []
        for idx, chunk in enumerate(chunks[:5]):
            stype, hname = std_names[idx] if idx < len(std_names) else ("content", f"Section {idx + 1}")
            full_txt = " ".join(chunk)
            sections.append(
                ReportSection(
                    section_type=stype,
                    heading=hname,
                    parent_heading="",
                    level=1,
                    content=full_txt,
                    bullets=_extract_bullets(full_txt),
                    key_metrics=_extract_metrics(full_txt),
                    source_location=hname,
                    word_count=len(full_txt.split()),
                )
            )

    total_words = sum(s.word_count for s in sections)
    highlights = [b for s in sections for b in s.bullets][:5]

    return StructuredReport(
        cover_page=cover,
        document_title=cover.title,
        course_info=f"{cover.course_code} {cover.course_name}".strip(),
        abstract_text=abstract_text,
        objectives_list=objectives_list,
        sections=sections,
        total_words=total_words,
        detected_figures_count=fig_count,
        detected_tables_count=tbl_count,
        key_highlights=highlights,
    )

def analyze_pdf_report(pdf_bytes: bytes) -> StructuredReport:
    """Parses a PDF report using PyMuPDF / pypdf, isolating page 1 cover content."""
    reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    pages_text = [p.extract_text() or "" for p in reader.pages]

    cover = ExtractedCoverPage()
    quarantined: list[str] = []

    if pages_text:
        first_page_lines = [l.strip() for l in pages_text[0].splitlines() if l.strip()]
        for l in first_page_lines:
            l_lower = l.lower()
            if any(re.search(pat, l_lower) for pat in COVER_PATTERNS):
                quarantined.append(l)
                if re.search(r"student\s+name|submitted\s+by|author", l_lower):
                    m = re.split(r"[:\-]\s*", l, maxsplit=1)
                    cover.student_name = m[1].strip() if len(m) > 1 else l.strip()
                elif re.search(r"student\s+id|matriculation|roll\s+no", l_lower):
                    m = re.split(r"[:\-]\s*", l, maxsplit=1)
                    cover.student_id = m[1].strip() if len(m) > 1 else l.strip()
                elif re.search(r"university|college|faculty|department", l_lower):
                    cover.institution = l.strip()

        for l in first_page_lines[:6]:
            if l not in quarantined and 6 < len(l) < 100:
                cover.title = l
                quarantined.append(l)
                break

    cover.quarantined_lines = quarantined

    sections: list[ReportSection] = []
    current_h = "Executive Overview"
    current_content: list[str] = []

    body_text = "\n".join(pages_text[1:]) if len(pages_text) > 1 else (pages_text[0] if pages_text else "")
    lines = [l.strip() for l in body_text.splitlines() if l.strip()]

    for line in lines:
        if line in quarantined or any(line == q for q in quarantined):
            continue
        is_heading = (
            (len(line) < 65 and line.isupper() and len(line) > 4)
            or re.match(r"^(?:chapter\s+\d+|\d+\.\d*)\s+[A-Z]", line)
            or any(re.match(rf"^{p}\b", line.lower()) for p in [r"abstract", r"introduction", r"methodology", r"results", r"conclusion", r"references"])
        )
        if is_heading:
            if current_content:
                full_t = " ".join(current_content)
                sections.append(
                    ReportSection(
                        section_type=_classify_section_heading(current_h),
                        heading=current_h,
                        content=full_t,
                        bullets=_extract_bullets(full_t),
                        key_metrics=_extract_metrics(full_t),
                        source_location=current_h,
                        word_count=len(full_t.split()),
                    )
                )
                current_content = []
            current_h = line
        else:
            current_content.append(line)

    if current_content:
        full_t = " ".join(current_content)
        sections.append(
            ReportSection(
                section_type=_classify_section_heading(current_h),
                heading=current_h,
                content=full_t,
                bullets=_extract_bullets(full_t),
                key_metrics=_extract_metrics(full_t),
                source_location=current_h,
                word_count=len(full_t.split()),
            )
        )

    if not sections:
        sections = [
            ReportSection(
                section_type="introduction",
                heading="Report Overview",
                content=body_text[:1000],
                bullets=_extract_bullets(body_text[:1000]),
                source_location="Report Overview",
                word_count=len(body_text.split()),
            )
        ]

    total_words = sum(s.word_count for s in sections)
    return StructuredReport(
        cover_page=cover,
        document_title=cover.title,
        sections=sections,
        total_words=total_words,
        detected_figures_count=0,
        detected_tables_count=0,
        key_highlights=[b for s in sections for b in s.bullets][:5],
    )

def analyze_text_report(text: str) -> StructuredReport:
    """Parses plain text / Markdown assignment content."""
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    title = lines[0] if lines else "Academic Report Presentation"
    cover = ExtractedCoverPage(title=title)

    sections: list[ReportSection] = []
    current_h = "Background & Context"
    current_content: list[str] = []

    for line in lines[1:]:
        if line.startswith("# ") or line.startswith("## ") or (len(line) < 60 and line.isupper()):
            if current_content:
                full_t = " ".join(current_content)
                sections.append(
                    ReportSection(
                        section_type=_classify_section_heading(current_h),
                        heading=current_h,
                        content=full_t,
                        bullets=_extract_bullets(full_t),
                        key_metrics=_extract_metrics(full_t),
                        source_location=current_h,
                        word_count=len(full_t.split()),
                    )
                )
                current_content = []
            current_h = line.lstrip("#").strip()
        else:
            current_content.append(line)

    if current_content:
        full_t = " ".join(current_content)
        sections.append(
            ReportSection(
                section_type=_classify_section_heading(current_h),
                heading=current_h,
                content=full_t,
                bullets=_extract_bullets(full_t),
                key_metrics=_extract_metrics(full_t),
                source_location=current_h,
                word_count=len(full_t.split()),
            )
        )

    return StructuredReport(
        cover_page=cover,
        document_title=title,
        sections=sections,
        total_words=sum(s.word_count for s in sections),
        key_highlights=[b for s in sections for b in s.bullets][:5],
    )
