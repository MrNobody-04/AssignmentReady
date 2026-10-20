from pathlib import Path
from typing import Literal
from pydantic import BaseModel, Field
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from src.modules.jobs.job_schema import FormattingSettings
from src.modules.documents.inspector import inspect_docx
from src.modules.documents.formatter import apply_formatting
from src.modules.references.citation_analyzer import analyze_document_citations, CitationAnalysisReport

class DoctorIssue(BaseModel):
    id: str
    category: str  # Typography, Structure, Margins, FrontMatter, Captions, References, Quality
    issue: str
    location: str
    why_it_matters: str
    recommendation: str
    can_fix_automatically: bool = True
    requires_user_review: bool = False
    severity: Literal["CRITICAL", "WARNING", "NOTICE"] = "WARNING"
    fix_action: str

class DoctorDiagnosisResponse(BaseModel):
    job_id: str
    filename: str
    total_issues: int
    critical_count: int
    warning_count: int
    notice_count: int
    auto_fixable_count: int
    issues: list[DoctorIssue] = Field(default_factory=list)
    citation_report: CitationAnalysisReport | None = None
    overall_health_score: int = 100
    summary_message: str = ""
    # Unified Workflow Extensions
    project_id: str | None = None
    version_id: int = 1
    version_label: str = "Version 1 (Original)"
    is_latest_version: bool = True
    rubric_used: bool = False
    rubric_summary: str | None = None
    resolved_issues_count: int = 0
    unresolved_issues_count: int = 0

def diagnose_document(
    doc_path: Path,
    job_id: str,
    settings: FormattingSettings,
    version_id: int = 1,
    version_label: str = "Version 1 (Original)",
    is_latest: bool = True,
    rubric_criteria: list[dict] | None = None,
) -> DoctorDiagnosisResponse:
    """
    Deep diagnostic auditor for the Assignment Doctor feature.
    Inspects document typography, hierarchy, margins, captions, front matter,
    suspicious blank pages, and citation apparatus.
    """
    inspection = inspect_docx(doc_path)
    citation_rep = analyze_document_citations(doc_path)
    issues: list[DoctorIssue] = []

    # 1. Typography & Font Consistency
    target_font = settings.body.font_family.lower()
    actual_font = (inspection.detected_body_font or "").lower()
    if target_font not in actual_font and actual_font not in target_font:
        issues.append(
            DoctorIssue(
                id="doc-font-mismatch",
                category="Typography",
                issue=f"Body Font Deviates from Standard ({inspection.detected_body_font})",
                location="Global Document Body",
                why_it_matters=f"Institutional submissions require consistent typography ('{settings.body.font_family}'). Inconsistent fonts look unedited and can incur presentation deductions.",
                recommendation=f"Standardize all body paragraphs to {settings.body.font_family} {settings.body.font_size_pt}pt.",
                can_fix_automatically=True,
                requires_user_review=False,
                severity="WARNING",
                fix_action="standardize_body_font",
            )
        )

    # 2. Page Margins Compliance
    margins = inspection.detected_margins_inches or {}
    left_m = margins.get("left", 1.0)
    right_m = margins.get("right", 1.0)
    top_m = margins.get("top", 1.0)
    bot_m = margins.get("bottom", 1.0)

    if (
        abs(left_m - settings.margins.left_inches) > 0.05
        or abs(right_m - settings.margins.right_inches) > 0.05
        or abs(top_m - settings.margins.top_inches) > 0.05
        or abs(bot_m - settings.margins.bottom_inches) > 0.05
    ):
        issues.append(
            DoctorIssue(
                id="doc-margin-deviation",
                category="Margins",
                issue=f"Irregular Page Margins ({left_m}\" L, {right_m}\" R, {top_m}\" T, {bot_m}\" B)",
                location="Section Layout Properties",
                why_it_matters="Examiners and tutors require standard 1.0-inch margins for binding, margin annotations, and rubric compliance.",
                recommendation=f"Adjust page layout to uniform {settings.margins.left_inches}\" margins across all sections.",
                can_fix_automatically=True,
                requires_user_review=False,
                severity="WARNING",
                fix_action="apply_standard_margins",
            )
        )

    # 3. Heading Hierarchy Consistency
    h_levels = [h.level for h in inspection.detected_headings]
    hierarchy_broken = False
    broken_location = "Body Sections"
    for i in range(len(h_levels) - 1):
        if h_levels[i + 1] > h_levels[i] + 1:
            hierarchy_broken = True
            broken_location = f"Between Heading '{inspection.detected_headings[i].text}' and '{inspection.detected_headings[i+1].text}'"
            break

    if not inspection.detected_headings:
        issues.append(
            DoctorIssue(
                id="doc-missing-headings",
                category="Structure",
                issue="No Formal Headings Detected in Assignment",
                location="Throughout Document",
                why_it_matters="Academic papers require structured sections (H1, H2) for reading flow and dynamic Table of Contents generation.",
                recommendation="Promote major section titles to Heading 1 and subsections to Heading 2.",
                can_fix_automatically=False,
                requires_user_review=True,
                severity="CRITICAL",
                fix_action="review_headings",
            )
        )
    elif hierarchy_broken:
        issues.append(
            DoctorIssue(
                id="doc-heading-jump",
                category="Structure",
                issue="Heading Hierarchy Level Jump (Skips H2)",
                location=broken_location,
                why_it_matters="Skipping heading depths (e.g. H1 jumping to H3) creates broken document outlines and invalidates automated academic indexing.",
                recommendation="Ensure H2 is used for subsections before introducing H3 sub-topics.",
                can_fix_automatically=False,
                requires_user_review=True,
                severity="WARNING",
                fix_action="adjust_heading_depths",
            )
        )

    # 4. Cover Page / Title Sheet Presence
    if not inspection.has_cover_page_markers and settings.cover_page.enabled:
        issues.append(
            DoctorIssue(
                id="doc-missing-cover",
                category="FrontMatter",
                issue="Missing Institutional Cover Sheet",
                location="Page 1",
                why_it_matters="Most universities penalize anonymous submissions or require a formal cover sheet with module code, student ID, and title.",
                recommendation="Attach a standardized academic cover page with candidate and course metadata.",
                can_fix_automatically=True,
                requires_user_review=False,
                severity="CRITICAL",
                fix_action="inject_cover_page",
            )
        )

    # 5. Table of Contents
    if not inspection.has_table_of_contents and inspection.total_words > 800:
        issues.append(
            DoctorIssue(
                id="doc-missing-toc",
                category="FrontMatter",
                issue="Missing Table of Contents (Recommended for Long Reports)",
                location="Before Introduction",
                why_it_matters="Assignments exceeding 800 words require a clear Table of Contents for navigation.",
                recommendation="Generate an automated Table of Contents with dynamic Word field codes.",
                can_fix_automatically=True,
                requires_user_review=False,
                severity="NOTICE",
                fix_action="inject_table_of_contents",
            )
        )

    # 6. Uncaptioned Figures and Tables
    if inspection.total_images > 0 and len(inspection.detected_figures) == 0:
        issues.append(
            DoctorIssue(
                id="doc-uncaptioned-figures",
                category="Captions",
                issue=f"Detected {inspection.total_images} Image(s) Without Formal Figure Captions",
                location="Body Diagrams / Images",
                why_it_matters="Academic standards require all diagrams to be labeled (e.g. 'Figure 1: Architecture Overview') for formal indexing and referencing.",
                recommendation="Add formal 'Figure X: Title' captions beneath each image.",
                can_fix_automatically=False,
                requires_user_review=True,
                severity="WARNING",
                fix_action="add_figure_captions",
            )
        )

    if inspection.total_tables > 0 and len(inspection.detected_table_captions) == 0:
        issues.append(
            DoctorIssue(
                id="doc-uncaptioned-tables",
                category="Captions",
                issue=f"Detected {inspection.total_tables} Table(s) Without Academic Captions",
                location="Data Tables",
                why_it_matters="Tables should be labeled with 'Table 1: Description' above the table for academic clarity.",
                recommendation="Add table caption headings above embedded data tables.",
                can_fix_automatically=False,
                requires_user_review=True,
                severity="NOTICE",
                fix_action="add_table_captions",
            )
        )

    # 7. Missing Mandatory Academic Sections
    existing_headings_lower = [h.text.lower() for h in inspection.detected_headings]
    for req in settings.required_sections:
        if not any(req.lower() in h for h in existing_headings_lower):
            is_critical = req.lower() in ["references", "bibliography", "conclusion"]
            issues.append(
                DoctorIssue(
                    id=f"doc-missing-section-{req.lower()}",
                    category="Structure",
                    issue=f"Mandatory Section '{req}' Not Found",
                    location="Expected Document Outline",
                    why_it_matters=f"The required coursework section '{req}' is essential for meeting module syllabus criteria.",
                    recommendation=f"Add a distinct Heading 1 for '{req}'.",
                    can_fix_automatically=req.lower() in ["references"],
                    requires_user_review=True,
                    severity="CRITICAL" if is_critical else "WARNING",
                    fix_action=f"add_heading_{req.lower()}",
                )
            )

    # 8. Citation & Referencing Issues
    if citation_rep.style_inconsistencies:
        for inc in citation_rep.style_inconsistencies:
            issues.append(
                DoctorIssue(
                    id="doc-citation-style-inconsistent",
                    category="References",
                    issue="Inconsistent Citation Style (Mixed Numeric & Author-Date)",
                    location="Throughout Assignment Body",
                    why_it_matters=inc,
                    recommendation="Standardize all citations to a single uniform style (e.g., Harvard/APA author-date throughout).",
                    can_fix_automatically=False,
                    requires_user_review=True,
                    severity="WARNING",
                    fix_action="review_citation_style",
                )
            )

    if citation_rep.unmatched_in_text_citations:
        sample_unmatched = ", ".join(c.raw_text for c in citation_rep.unmatched_in_text_citations[:3])
        issues.append(
            DoctorIssue(
                id="doc-unmatched-citations",
                category="References",
                issue=f"{len(citation_rep.unmatched_in_text_citations)} In-Text Citation(s) Missing From References List",
                location=f"Citations: {sample_unmatched}",
                why_it_matters="In-text citations without corresponding bibliography entries represent incomplete academic sourcing and can trigger plagiarism warnings.",
                recommendation="Add full bibliographic entries to the References section for all cited authors.",
                can_fix_automatically=False,
                requires_user_review=True,
                severity="CRITICAL",
                fix_action="complete_references_list",
            )
        )

    # 9. Suspicious Blank Paragraphs / Blank Pages Check
    try:
        doc = docx.Document(str(doc_path))
        consecutive_empty = 0
        max_consecutive = 0
        for p in doc.paragraphs:
            if not p.text.strip():
                consecutive_empty += 1
                max_consecutive = max(max_consecutive, consecutive_empty)
            else:
                consecutive_empty = 0

        if max_consecutive >= 4:
            issues.append(
                DoctorIssue(
                    id="doc-suspicious-empty-paragraphs",
                    category="Quality",
                    issue=f"Multiple Consecutive Empty Paragraphs Detected ({max_consecutive} blank lines)",
                    location="Body Layout",
                    why_it_matters="Using multiple Enter/Return keys to push content creates accidental blank pages and breaks pagination across different screen sizes.",
                    recommendation="Remove empty paragraph spacers and use proper section breaks or 'Page Break Before' styles.",
                    can_fix_automatically=True,
                    requires_user_review=False,
                    severity="NOTICE",
                    fix_action="purge_empty_paragraphs",
                )
            )
    except Exception:
        pass

    # 10. Marking Scheme Alignment Check
    rubric_used = False
    rubric_summary = None
    if rubric_criteria and len(rubric_criteria) > 0:
        rubric_used = True
        missing_criteria = []
        headings_text = " ".join(h.text for h in inspection.detected_headings).lower()
        try:
            doc = docx.Document(str(doc_path))
            full_body_text = " ".join(p.text for p in doc.paragraphs).lower()
        except Exception:
            full_body_text = ""

        for crit in rubric_criteria:
            c_name = crit.get("name") or crit.get("title") or "Criterion"
            tokens = [t.lower() for t in c_name.split() if len(t) > 3]
            matched = any(t in headings_text or t in full_body_text for t in tokens) if tokens else True
            if not matched:
                missing_criteria.append(c_name)

        if missing_criteria:
            issues.append(
                DoctorIssue(
                    id="doc-rubric-missing-evidence",
                    category="Marking Scheme",
                    issue=f"{len(missing_criteria)} Rubric Criteria Lack Direct Section Evidence",
                    location=f"Criteria: {', '.join(missing_criteria[:2])}",
                    why_it_matters="If your assignment does not clearly address all criteria specified in the marking scheme, markers may deduct substantial points.",
                    recommendation="Add explicit headings or subsections clearly covering each criterion listed in your marking scheme.",
                    can_fix_automatically=False,
                    requires_user_review=True,
                    severity="WARNING",
                    fix_action="align_rubric_sections",
                )
            )
            rubric_summary = f"{len(rubric_criteria) - len(missing_criteria)}/{len(rubric_criteria)} criteria covered."
        else:
            rubric_summary = f"All {len(rubric_criteria)} criteria addressed."

    # Health score calculation
    crit_count = sum(1 for i in issues if i.severity == "CRITICAL")
    warn_count = sum(1 for i in issues if i.severity == "WARNING")
    not_count = sum(1 for i in issues if i.severity == "NOTICE")
    auto_count = sum(1 for i in issues if i.can_fix_automatically)

    deduction = (crit_count * 20) + (warn_count * 10) + (not_count * 4)
    health_score = max(10, 100 - deduction)

    summary = (
        f"Document health score: {health_score}/100. "
        f"Found {len(issues)} issue(s): {crit_count} critical, {warn_count} warning(s), {not_count} notice(s). "
        f"{auto_count} can be repaired automatically."
    )

    return DoctorDiagnosisResponse(
        job_id=job_id,
        project_id=job_id,
        filename=inspection.filename,
        version_id=version_id,
        version_label=version_label,
        is_latest_version=is_latest,
        rubric_used=rubric_used,
        rubric_summary=rubric_summary,
        total_issues=len(issues),
        critical_count=crit_count,
        warning_count=warn_count,
        notice_count=not_count,
        auto_fixable_count=auto_count,
        issues=issues,
        citation_report=citation_rep,
        overall_health_score=health_score,
        summary_message=summary,
    )

def fix_document_issues(
    doc_path: Path,
    output_path: Path,
    settings: FormattingSettings,
    selected_fix_actions: list[str],
) -> Path:
    """
    Applies targeted, deterministic repairs to the document for chosen fix actions.
    Preserves all original figures, tables, and unselected elements.
    """
    # If fixing all safe issues or general formatting, run standard apply_formatting pipeline
    apply_formatting(
        input_file=doc_path,
        output_file=output_path,
        settings=settings,
    )

    # Post-process targeted fixes if requested
    try:
        doc = docx.Document(str(output_path))
        modified = False

        if "purge_empty_paragraphs" in selected_fix_actions:
            # Remove excessive trailing or clustered blank paragraphs
            empty_count = 0
            for p in list(doc.paragraphs):
                if not p.text.strip() and not p._p.xpath("./w:pPr/w:sectPr"):
                    empty_count += 1
                    if empty_count > 1:
                        p._p.getparent().remove(p._p)
                        modified = True
                else:
                    empty_count = 0

        if modified:
            doc.save(str(output_path))
    except Exception:
        pass

    return output_path
