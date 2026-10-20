import io
import base64
from pathlib import Path
import docx
import openpyxl
import pptx
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image

from src.modules.presentation.report_analyzer import (
    analyze_docx_report,
    analyze_text_report,
    StructuredReport,
)
from src.modules.presentation.rubric_analyzer import (
    extract_rubric_from_docx,
    extract_rubric_from_xlsx,
    extract_rubric_from_text,
    map_report_to_rubric,
    AssessmentCriterion,
)
from src.modules.presentation.ppt_generator import (
    PresentationOutline,
    PresenterInfo,
    SlideItem,
    build_presentation_outline_from_report,
    generate_powerpoint_presentation,
    validate_presentation_model,
    validate_generated_pptx,
    THEMES,
)

def _create_sample_report_docx(tmp_path: Path) -> Path:
    doc = docx.Document()
    # Cover Page Content
    doc.add_paragraph("Tribhuvan University")
    doc.add_paragraph("Department of Computer Science and Information Technology")
    doc.add_paragraph("Automated Document Formatting Engine Using Pure OpenXML")
    doc.add_paragraph("A Capstone Project Report")
    doc.add_paragraph("Submitted by: Sujan G.C.")
    doc.add_paragraph("Student ID: 771234")
    doc.add_paragraph("Course Code: CSC-401 Advanced Software Engineering")
    doc.add_paragraph("Submitted to: Dr. Ramesh Sharma")
    doc.add_paragraph("Date: October 2026")
    doc.add_page_break()

    # Academic Section 1: Abstract
    doc.add_heading("Abstract", level=1)
    doc.add_paragraph("This paper presents a deterministic, rule-based academic document preparation system. It achieves 99.4% adherence to college formatting guidelines without requiring paid AI APIs.")

    # Academic Section 2: Introduction & Problem Statement
    doc.add_heading("Introduction & Problem Statement", level=1)
    doc.add_paragraph("University students regularly encounter severe formatting non-compliance when submitting assignments prepared in LLM text editors. Common defects include corrupted margins, unnumbered front matter, and broken tables of contents.")

    # Academic Section 3: Research Objectives
    doc.add_heading("Research Aims & Objectives", level=1)
    doc.add_paragraph("1. Develop an air-gapped OpenXML manipulation engine.")
    doc.add_paragraph("2. Support automatic front matter Roman pagination.")
    doc.add_paragraph("3. Synthesize executive 16:9 widescreen PowerPoint presentation decks directly from source reports.")

    # Academic Section 4: Methodology
    doc.add_heading("Methodology & System Architecture", level=1)
    doc.add_paragraph("The engine utilizes low-level XML manipulation through python-docx and python-pptx. A four-stage pipeline performs format detection, token normalization, style synchronization, and compliance verification.")

    # Academic Section 5: Experimental Results
    doc.add_heading("Experimental Results & Evaluation", level=1)
    doc.add_paragraph("Performance benchmarking on 150 student documents demonstrated an average processing latency of 1.8 seconds. Compliance accuracy reached 98.5% with 0% data leakage.")

    # Academic Section 6: Conclusion
    doc.add_heading("Conclusion & Future Work", level=1)
    doc.add_paragraph("The deterministic OpenXML architecture successfully solves academic formatting failures. Future enhancements will integrate institutional LaTeX templates.")

    # Academic Section 7: References
    doc.add_heading("References", level=1)
    doc.add_paragraph("[1] ISO/IEC 29500-1:2021 Information technology — Document description and processing languages.")
    doc.add_paragraph("[2] ECMA-376 Office Open XML File Formats.")

    out_file = tmp_path / "sample_report.docx"
    doc.save(str(out_file))
    return out_file

def _create_sample_rubric_docx(tmp_path: Path) -> Path:
    doc = docx.Document()
    doc.add_heading("Assessment Rubric for Capstone Presentation", level=1)
    tbl = doc.add_table(rows=1, cols=3)
    hdr_cells = tbl.rows[0].cells
    hdr_cells[0].text = "Assessment Criterion"
    hdr_cells[1].text = "Weight"
    hdr_cells[2].text = "Expectations / Descriptors"

    criteria_data = [
        ("Problem Statement & Context", "20%", "Clear articulation of the research problem and academic motivation."),
        ("Methodology & Technical Design", "30%", "Soundness of the technical architecture and pipeline execution."),
        ("Experimental Evaluation & Results", "30%", "Rigorous testing with quantitative metrics and benchmarks."),
        ("Critical Reflection & Conclusion", "10%", "Identification of limitations and meaningful future scope."),
        ("Academic Referencing & Delivery", "10%", "Proper scholarly citations and high standard of presentation."),
    ]
    for c_title, w, desc in criteria_data:
        row = tbl.add_row()
        row.cells[0].text = c_title
        row.cells[1].text = w
        row.cells[2].text = desc

    out_file = tmp_path / "sample_rubric.docx"
    doc.save(str(out_file))
    return out_file

def _create_sample_rubric_xlsx(tmp_path: Path) -> Path:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Rubric"
    ws.append(["Criterion", "Weight %", "Description"])
    ws.append(["Technical Implementation", 35, "Clean codebase and architecture"])
    ws.append(["Empirical Testing", 35, "Evaluation and statistical data"])
    ws.append(["Academic Rigor", 30, "Literature review and citations"])
    out_file = tmp_path / "sample_rubric.xlsx"
    wb.save(str(out_file))
    return out_file

def _create_sample_logo_base64() -> str:
    img = Image.new("RGBA", (120, 60), color=(0, 33, 71, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

def test_report_understanding_and_cover_isolation(tmp_path):
    report_file = _create_sample_report_docx(tmp_path)
    report = analyze_docx_report(report_file)

    # 1. Verify Cover Page Metadata Extraction
    assert "Sujan G.C." in report.cover_page.student_name
    assert "771234" in report.cover_page.student_id
    assert "Dr. Ramesh Sharma" in report.cover_page.lecturer_name
    assert "Tribhuvan University" in report.cover_page.institution or "Tribhuvan University" in report.cover_page.quarantined_lines
    assert len(report.cover_page.quarantined_lines) >= 4

    # 2. Verify Sections are structured correctly
    section_types = [s.section_type for s in report.sections]
    assert "abstract" in section_types
    assert "methodology" in section_types
    assert "results" in section_types
    assert "conclusion" in section_types

    # 3. Build Presentation Outline and verify STRICT COVER ISOLATION
    outline = build_presentation_outline_from_report(report)
    assert outline.author == "Sujan G.C."
    assert outline.student_id == "771234"

    # Verify that NO body slide contains student name or ID
    for s in outline.slides:
        assert s.slide_type != "title"
        for bullet in s.bullets:
            assert "771234" not in bullet
            assert "Sujan G.C." not in bullet
            assert "Dr. Ramesh Sharma" not in bullet

def test_marking_scheme_parsing_and_compliance_mapping(tmp_path):
    report_file = _create_sample_report_docx(tmp_path)
    rubric_file = _create_sample_rubric_docx(tmp_path)
    xlsx_file = _create_sample_rubric_xlsx(tmp_path)

    report = analyze_docx_report(report_file)

    # 1. Test DOCX Rubric Parsing
    docx_criteria = extract_rubric_from_docx(rubric_file)
    assert len(docx_criteria) == 5
    assert any(c.weight_percent == 20.0 for c in docx_criteria)
    assert any(c.weight_percent == 30.0 for c in docx_criteria)

    # 2. Test XLSX Rubric Parsing
    xlsx_criteria = extract_rubric_from_xlsx(xlsx_file)
    assert len(xlsx_criteria) == 3
    assert any(c.weight_percent == 35.0 for c in xlsx_criteria)

    # 3. Test Evidence-to-Rubric Mapping
    compliance_res = map_report_to_rubric(report, docx_criteria)
    assert compliance_res.total_criteria_count == 5
    assert compliance_res.overall_compliance_score > 60.0
    assert len(compliance_res.compliance_matches) == 5

    # Methodology and Results should be strong matches
    method_match = next(m for m in compliance_res.compliance_matches if "Methodology" in m.criterion_title)
    assert method_match.status in ["covered_with_evidence", "strong_match"]
    assert len(method_match.matched_sections) >= 1

def test_all_10_themes_generate_valid_pptx(tmp_path):
    report_file = _create_sample_report_docx(tmp_path)
    report = analyze_docx_report(report_file)
    outline = build_presentation_outline_from_report(report)

    theme_keys = [
        "premium_university",
        "modern_technology",
        "research_science",
        "corporate_pro",
        "creative_gradient",
        "dark_premium",
        "editorial_academic",
        "university_branded",
        "engineering_it",
        "business_management",
    ]

    for t_key in theme_keys:
        pptx_bytes = generate_powerpoint_presentation(outline, theme_key=t_key)
        assert len(pptx_bytes) > 20000, f"Theme {t_key} produced truncated PPTX"

        # Verify PPTX is readable and valid
        prs = pptx.Presentation(io.BytesIO(pptx_bytes))
        # Total slides = body slides + 1 title slide
        assert len(prs.slides) == len(outline.slides) + 1
        assert round(prs.slide_width.inches, 2) == 13.33
        assert round(prs.slide_height.inches, 2) == 7.5

def test_dual_logo_branding_and_transitions(tmp_path):
    report_file = _create_sample_report_docx(tmp_path)
    report = analyze_docx_report(report_file)

    logo_b64 = _create_sample_logo_base64()
    outline = build_presentation_outline_from_report(
        report,
        transition_type="wipe",
        animation_intensity="enhanced",
    )
    outline.university_logo_base64 = logo_b64
    outline.college_logo_base64 = logo_b64

    pptx_bytes = generate_powerpoint_presentation(outline, theme_key="premium_university")
    assert len(pptx_bytes) > 25000

    prs = pptx.Presentation(io.BytesIO(pptx_bytes))
    # Title slide (slide 0) should contain the pictures
    title_slide = prs.slides[0]
    pics = [s for s in title_slide.shapes if s.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE]
    assert len(pics) >= 2, "Title slide must contain both university and college logos"

    # Verify transitions injected into slide XML
    slide_xml = title_slide._element.xml
    assert "p:transition" in slide_xml
    assert "p:wipe" in slide_xml

def test_strict_document_model_validation():
    # Attempt to inject duplicate title slide or duplicate titles
    outline = PresentationOutline(
        title="Main Title",
        slides=[
            SlideItem(title="Duplicate Title", slide_type="title"),  # Forbidden!
            SlideItem(title="Methodology", slide_type="content"),
            SlideItem(title="Methodology", slide_type="process_workflow"),  # Duplicate!
        ]
    )
    warnings = validate_presentation_model(outline)
    # The title slide must be stripped from body slides
    assert all(s.slide_type != "title" for s in outline.slides)
    # The duplicate title must be disambiguated
    assert outline.slides[0].title == "Methodology"
    assert outline.slides[1].title == "Methodology (Part 2)"

def test_ec3277_rubric_parsing_and_compliance():
    fixture_dir = Path(__file__).parent / "fixtures"
    rubric_file = fixture_dir / "ec3277_rubric.docx"
    report_file = fixture_dir / "ec3277_report.docx"

    assert rubric_file.exists(), "ec3277_rubric.docx fixture missing"
    assert report_file.exists(), "ec3277_report.docx fixture missing"

    # 1. Test Rubric Extraction
    criteria = extract_rubric_from_docx(rubric_file)
    assert len(criteria) == 4, f"Expected 4 questions, got {len(criteria)}"
    
    q_titles = [c.title for c in criteria]
    assert any("Question 1" in t and "Signal Fading" in t for t in q_titles)
    assert any("Question 2" in t and "Wireless Technology" in t for t in q_titles)
    assert any("Question 3" in t and "Coverage and Capacity" in t for t in q_titles)
    assert any("Question 4" in t and "Case Study" in t for t in q_titles)
    
    # Proportional weights: 25% each
    for c in criteria:
        assert c.weight_percent == 25.0
        assert len(c.expected_evidence) >= 5

    # 2. Test Report Compliance Mapping
    report = analyze_docx_report(report_file)
    comp_res = map_report_to_rubric(report, criteria)

    assert comp_res.overall_compliance_score == 100.0
    assert comp_res.required_criteria_covered == "4/4"
    assert comp_res.covered_count == 4
    assert len(comp_res.missing_evidence_warnings) == 0

    for m in comp_res.compliance_matches:
        assert m.status == "covered_with_evidence"
        assert m.score_percent == 100.0
        assert len(m.matched_sections) >= 2
        assert len(m.evidence_snippets) >= 1

def test_exact_n_slide_count_constraints():
    fixture_dir = Path(__file__).parent / "fixtures"
    report_file = fixture_dir / "ec3277_report.docx"
    rubric_file = fixture_dir / "ec3277_rubric.docx"
    report = analyze_docx_report(report_file)
    rubric = extract_rubric_from_docx(rubric_file)

    test_targets = [5, 8, 10, 12, 15, 20]
    for target in test_targets:
        outline = build_presentation_outline_from_report(report, target_count=target, criteria=rubric)
        assert len(outline.slides) == target - 1, f"Expected {target - 1} outline slides for target {target}, got {len(outline.slides)}"
        assert outline.requested_slide_count == target
        assert outline.planned_slide_count == target

        # Generate PPTX and verify EXACT slide count in PPTX
        pptx_bytes = generate_powerpoint_presentation(outline)
        prs = pptx.Presentation(io.BytesIO(pptx_bytes))
        assert len(prs.slides) == target, f"Expected {target} slides in generated PPTX, got {len(prs.slides)}"

def test_ec3277_part_b_10_slide_structure():
    fixture_dir = Path(__file__).parent / "fixtures"
    report_file = fixture_dir / "ec3277_report.docx"
    rubric_file = fixture_dir / "ec3277_rubric.docx"
    report = analyze_docx_report(report_file)
    rubric = extract_rubric_from_docx(rubric_file)

    outline = build_presentation_outline_from_report(report, target_count=10, criteria=rubric)
    assert len(outline.slides) == 9  # Slide 1 is Title at index 0
    assert outline.summary_banner == "Requested slides: 10 | Planned slides: 10 | Required criteria covered: 4/4 | Warnings: 0"

    expected_titles = [
        "Objectives & Course Context",
        "Signal Fading: Causes & Obstacle Effects",
        "Reducing Fading & Recommended Strategy",
        "Wireless Technology Comparative Matrix",
        "Wireless Coverage vs Capacity Engineering",
        "Optimizing High-Density Lecture Hall Capacity",
        "Campus Case Study: Diagnosis & Remediation",
        "Recommended Network Design & Conclusion",
        "Scholarly References & Academic Discussion",
    ]

    for idx, expected in enumerate(expected_titles):
        actual_title = outline.slides[idx].title
        assert expected in actual_title, f"Slide {idx + 2} expected '{expected}', got '{actual_title}'"

    # Verify OpenXML generated presentation
    pptx_bytes = generate_powerpoint_presentation(outline, theme_key="modern_technology")
    prs = pptx.Presentation(io.BytesIO(pptx_bytes))
    assert len(prs.slides) == 10
    assert "Wireless Communication Problems and Network Analysis" in outline.title

def test_mode_b_content_slide_count_mode():
    fixture_dir = Path(__file__).parent / "fixtures"
    report_file = fixture_dir / "ec3277_report.docx"
    rubric_file = fixture_dir / "ec3277_rubric.docx"
    report = analyze_docx_report(report_file)
    rubric = extract_rubric_from_docx(rubric_file)

    # In content-only mode: 8 content slides requested
    # Title (1) + 8 Content + 1 Conclusion + 2 Closing (Ref + QA) = 12 total slides
    outline = build_presentation_outline_from_report(
        report,
        target_count=8,
        counting_mode="content_only",
        criteria=rubric,
        include_references=True,
        include_qa=True,
    )
    assert outline.counting_mode == "content_only"
    assert outline.requested_slide_count == 8
    assert outline.planned_slide_count == 12
    assert len(outline.slides) == 11  # 8 content + 1 conclusion + 2 closing

    # Verify substantive conclusion slide is present
    conclusion_slides = [s for s in outline.slides if s.slide_type == "conclusion"]
    assert len(conclusion_slides) >= 1
    c_slide = conclusion_slides[0]
    assert c_slide.conclusion_verdict != ""
    assert len(c_slide.conclusion_takeaways) >= 2

    # Verify generated PPTX file matches exact planned slide count
    pptx_bytes = generate_powerpoint_presentation(outline)
    validation = validate_generated_pptx(pptx_bytes, outline)
    assert validation["valid"] is True
    assert validation["slide_count"] == 12

def test_group_presentation_mode_with_multiple_presenters():
    fixture_dir = Path(__file__).parent / "fixtures"
    report_file = fixture_dir / "ec3277_report.docx"
    report = analyze_docx_report(report_file)

    presenters = [
        PresenterInfo(name="Aayush Sharma", student_id="ST-101", role="Project Lead & RF Analysis"),
        PresenterInfo(name="Bibek Karki", student_id="ST-102", role="Network Capacity & Simulation"),
        PresenterInfo(name="Chirag Thapa", student_id="ST-103", role="Case Study & Defense"),
    ]

    outline = build_presentation_outline_from_report(
        report,
        target_count=10,
        presentation_mode="group",
        presenters=presenters,
        duration_minutes=15,
        include_notes=True,
    )

    assert outline.presentation_mode == "group"
    assert len(outline.presenters) == 3
    assert outline.presenters[0].name == "Aayush Sharma"

    # Verify slides are allocated among all 3 presenters
    assigned_names = {s.assigned_presenter_name for s in outline.slides if s.assigned_presenter_name}
    assert "Aayush Sharma" in assigned_names
    assert "Bibek Karki" in assigned_names
    assert "Chirag Thapa" in assigned_names

    # Verify speaker notes contain [Speaker: ...] cue
    for s in outline.slides:
        assert f"[Speaker: {s.assigned_presenter_name}]" in s.notes

    # Generate PPTX and verify
    pptx_bytes = generate_powerpoint_presentation(outline)
    prs = pptx.Presentation(io.BytesIO(pptx_bytes))
    assert len(prs.slides) == 10

    # Title slide must contain presenter names and student IDs
    title_text = " ".join([shape.text_frame.text for shape in prs.slides[0].shapes if shape.has_text_frame])
    assert "Aayush Sharma" in title_text
    assert "ST-101" in title_text
    assert "Bibek Karki" in title_text
    assert "ST-102" in title_text
    assert "Chirag Thapa" in title_text
    assert "ST-103" in title_text

    validation = validate_generated_pptx(pptx_bytes, outline)
    assert validation["valid"] is True

def test_presenter_and_student_id_hygiene():
    fixture_dir = Path(__file__).parent / "fixtures"
    report_file = fixture_dir / "ec3277_report.docx"
    report = analyze_docx_report(report_file)

    # Simulate dirty user inputs with duplicate "(ID: ...)" tags
    report.cover_page.student_name = "Sujan G.C. (ID: 771234) (ID: 771234)"
    report.cover_page.student_id = "Student ID: 771234)j"

    outline = build_presentation_outline_from_report(report, target_count=8)

    # Verify cleaned
    assert outline.author == "Sujan G.C."
    assert outline.student_id == "771234"

    pptx_bytes = generate_powerpoint_presentation(outline)
    prs = pptx.Presentation(io.BytesIO(pptx_bytes))

    title_text = " ".join([shape.text_frame.text for shape in prs.slides[0].shapes if shape.has_text_frame])
    assert "(ID: 771234) (ID: 771234)" not in title_text
    assert ")j" not in title_text
    assert "Presenter: Sujan G.C. (ID: 771234)" in title_text

def test_dynamic_visual_layouts_and_native_charts():
    # Build outline with native charts, architecture diagrams, problem-solution, and timeline
    outline = PresentationOutline(
        title="Dynamic Layout Intelligence Test",
        subtitle="Verification of Native Shapes and Layouts",
        author="System Architect",
        target_slide_count=5,
        planned_slide_count=5,
        slides=[
            SlideItem(
                title="Antenna Propagation Benchmarks",
                slide_type="chart_bar",
                chart_type="bar",
                chart_categories=["2.4 GHz", "5 GHz", "6 GHz"],
                chart_series=[{"name": "Free Space Loss (dB)", "values": [40.0, 46.5, 48.0]}],
                bullets=["Higher frequency bands incur higher free-space path loss."],
            ),
            SlideItem(
                title="High-Density Network Architecture",
                slide_type="architecture_diagram",
                diagram_nodes=[
                    {"label": "Edge Router", "desc": "10G Core Gateway"},
                    {"label": "PoE+ Switch", "desc": "802.3at 30W Power"},
                    {"label": "Wi-Fi 6 AP", "desc": "Tri-radio Microcells"},
                ],
                bullets=["Multi-tier resilient enterprise campus architecture."],
            ),
            SlideItem(
                title="Congestion Diagnosis and Remediation",
                slide_type="problem_solution",
                bullets=["Problem: Channel contention", "Cause: 802.11b slow probes", "Solution: 12 Mbps basic rates"],
            ),
            SlideItem(
                title="Implementation Roadmap",
                slide_type="timeline",
                bullets=["Phase 1: Site Survey", "Phase 2: Cabling", "Phase 3: Activation"],
            ),
        ]
    )

    pptx_bytes = generate_powerpoint_presentation(outline)
    assert len(pptx_bytes) > 25000

    prs = pptx.Presentation(io.BytesIO(pptx_bytes))
    assert len(prs.slides) == 5  # 1 title + 4 body

    # Slide 2 (index 1) should contain a native chart
    slide_chart = prs.slides[1]
    has_chart = any(s.has_chart for s in slide_chart.shapes)
    assert has_chart is True, "Slide 2 must contain a native PowerPoint chart object"

    # Slide 3 (index 2) should contain architecture diagram arrows
    slide_diag = prs.slides[2]
    def _is_right_arrow(s):
        try:
            return s.auto_shape_type == MSO_SHAPE.RIGHT_ARROW
        except Exception:
            return False

    arrows = [s for s in slide_diag.shapes if _is_right_arrow(s)]
    assert len(arrows) >= 2, "Architecture diagram must contain directional arrow connectors"

    validation = validate_generated_pptx(pptx_bytes, outline)
    assert validation["valid"] is True


