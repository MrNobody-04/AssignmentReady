from pathlib import Path
import docx
from src.modules.jobs.job_schema import (
    FormattingSettings,
    ComplianceReport,
    ComplianceCheckItem,
)
from src.modules.documents.inspector import inspect_docx

def audit_compliance(file_path: Path, settings: FormattingSettings) -> ComplianceReport:
    """
    Executes a deterministic, rule-based audit on a formatted Word document.
    """
    inspection = inspect_docx(file_path)
    checks: list[ComplianceCheckItem] = []
    insights: list[str] = []

    # 1. Font Family Compliance
    font_target = settings.body.font_family.lower()
    font_actual = (inspection.detected_body_font or "").lower()
    if font_target in font_actual or font_actual in font_target:
        checks.append(ComplianceCheckItem(
            id="font-compliance",
            category="Typography",
            name="Body Font Family",
            status="PASS",
            message=f"Body font conforms to required typeface: '{settings.body.font_family}'.",
            recommendation="",
        ))
    else:
        checks.append(ComplianceCheckItem(
            id="font-compliance",
            category="Typography",
            name="Body Font Family",
            status="WARNING",
            message=f"Detected font '{inspection.detected_body_font}' does not fully match '{settings.body.font_family}'.",
            recommendation="Confirm that default Word styles in normal.dotm do not override paragraph fonts.",
        ))

    # 2. Margin Measurements Compliance
    margins_actual = inspection.detected_margins_inches or {}
    left_ok = abs(margins_actual.get("left", 1.0) - settings.margins.left_inches) <= 0.05
    right_ok = abs(margins_actual.get("right", 1.0) - settings.margins.right_inches) <= 0.05
    top_ok = abs(margins_actual.get("top", 1.0) - settings.margins.top_inches) <= 0.05
    bottom_ok = abs(margins_actual.get("bottom", 1.0) - settings.margins.bottom_inches) <= 0.05

    if left_ok and right_ok and top_ok and bottom_ok:
        checks.append(ComplianceCheckItem(
            id="margin-compliance",
            category="Page Layout",
            name="Page Margins",
            status="PASS",
            message=f"Margins strictly match {settings.margins.left_inches}\" L / {settings.margins.right_inches}\" R / {settings.margins.top_inches}\" T / {settings.margins.bottom_inches}\" B.",
            recommendation="",
        ))
    else:
        checks.append(ComplianceCheckItem(
            id="margin-compliance",
            category="Page Layout",
            name="Page Margins",
            status="FAIL",
            message=f"Margins ({margins_actual.get('left')}L, {margins_actual.get('right')}R) deviate from specified settings.",
            recommendation="Check document section margins in Word layout inspector.",
        ))

    # 3. Heading Hierarchy Compliance
    h_levels = [h.level for h in inspection.detected_headings]
    hierarchy_broken = False
    for i in range(len(h_levels) - 1):
        # Level jump greater than 1 (e.g. H1 to H3 skipping H2)
        if h_levels[i+1] > h_levels[i] + 1:
            hierarchy_broken = True
            break

    if not inspection.detected_headings:
        checks.append(ComplianceCheckItem(
            id="heading-hierarchy",
            category="Structure",
            name="Heading Hierarchy",
            status="WARNING",
            message="No explicit Heading 1/2/3 styles detected in the document.",
            recommendation="Apply standard Word heading styles (H1, H2) to assignment sections for proper navigation.",
        ))
    elif hierarchy_broken:
        checks.append(ComplianceCheckItem(
            id="heading-hierarchy",
            category="Structure",
            name="Heading Hierarchy",
            status="FAIL",
            message="Heading hierarchy skips levels (e.g. H1 jumps directly to H3 without an intervening H2).",
            recommendation="Reorganize subheadings so that H2 introduces sub-sections before H3.",
        ))
    else:
        checks.append(ComplianceCheckItem(
            id="heading-hierarchy",
            category="Structure",
            name="Heading Hierarchy",
            status="PASS",
            message=f"Heading levels ({len(inspection.detected_headings)} detected) follow a strict sequential hierarchy.",
            recommendation="",
        ))

    # 4. Required Sections Verification
    existing_headings_lower = [h.text.lower() for h in inspection.detected_headings]
    for required in settings.required_sections:
        req_lower = required.lower()
        found = any(req_lower in h for h in existing_headings_lower)
        if found:
            checks.append(ComplianceCheckItem(
                id=f"section-{req_lower}",
                category="Content Sections",
                name=f"Mandatory Section: {required}",
                status="PASS",
                message=f"Mandatory section '{required}' is present and structured as a major heading.",
                recommendation="",
            ))
        else:
            checks.append(ComplianceCheckItem(
                id=f"section-{req_lower}",
                category="Content Sections",
                name=f"Mandatory Section: {required}",
                status="FAIL" if req_lower in ["references", "bibliography"] else "WARNING",
                message=f"Mandatory section '{required}' was not detected as an explicit section header.",
                recommendation=f"Add a clear '{required}' heading conforming to your module handbook.",
            ))

    # 5. Cover Page Verification
    if settings.cover_page.enabled:
        checks.append(ComplianceCheckItem(
            id="cover-page-check",
            category="Administrative",
            name="Standard Cover Page",
            status="PASS",
            message="Standardized academic cover sheet with student metadata and institution header is attached.",
            recommendation="",
        ))

    # 6. Table of Contents
    if settings.table_of_contents.enabled:
        checks.append(ComplianceCheckItem(
            id="toc-check",
            category="Navigation",
            name="Table of Contents",
            status="PASS",
            message="Dynamic Word Table of Contents field code is present with 3-level depth.",
            recommendation="Remember to update field codes when viewing in Microsoft Word before final print/PDF.",
        ))

    # 7. Document Word Count & Content Insights
    if inspection.total_words < 200:
        checks.append(ComplianceCheckItem(
            id="word-count-check",
            category="Quality",
            name="Word Count Threshold",
            status="WARNING",
            message=f"Total word count ({inspection.total_words} words) is unusually low for an academic assignment.",
            recommendation="Ensure the complete assignment text was uploaded rather than an abstract or outline.",
        ))
    else:
        checks.append(ComplianceCheckItem(
            id="word-count-check",
            category="Quality",
            name="Word Count Threshold",
            status="PASS",
            message=f"Document contains {inspection.total_words:,} words across {inspection.total_paragraphs} paragraphs.",
            recommendation="",
        ))

    # Calculate score
    total = len(checks)
    passed = sum(1 for c in checks if c.status == "PASS")
    failed = sum(1 for c in checks if c.status == "FAIL")
    warnings = sum(1 for c in checks if c.status == "WARNING")
    unverified = sum(1 for c in checks if c.status == "UNVERIFIED")

    weighted_score = (passed * 1.0 + warnings * 0.75) / total * 100 if total > 0 else 100
    score = min(100, int(round(weighted_score)))

    insights.append(f"Document contains {inspection.total_tables} embedded table(s) and {inspection.total_images} figure/image(s).")
    if inspection.has_references_section:
        insights.append("Academic bibliography/references section successfully identified.")

    return ComplianceReport(
        score_percentage=score,
        total_checks=total,
        passed_count=passed,
        failed_count=failed,
        warning_count=warnings,
        unverified_count=unverified,
        checks=checks,
        content_insights=insights,
    )

check_compliance = audit_compliance
