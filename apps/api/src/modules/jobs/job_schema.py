from typing import Literal
from pydantic import BaseModel, Field

class MarginSettings(BaseModel):
    top_inches: float = Field(default=1.0, ge=0.2, le=3.0)
    bottom_inches: float = Field(default=1.0, ge=0.2, le=3.0)
    left_inches: float = Field(default=1.0, ge=0.2, le=3.0)
    right_inches: float = Field(default=1.0, ge=0.2, le=3.0)

class HeadingStyle(BaseModel):
    font_family: str = "Times New Roman"
    font_size_pt: float = 16.0
    bold: bool = True
    italic: bool = False
    color_hex: str = "#000000"
    alignment: Literal["LEFT", "CENTER", "RIGHT", "JUSTIFY"] = "LEFT"
    space_before_pt: float = 12.0
    space_after_pt: float = 6.0
    page_break_before: bool = False

class BodyStyle(BaseModel):
    font_family: str = "Times New Roman"
    font_size_pt: float = 12.0
    font_color_hex: str = "#000000"
    alignment: Literal["LEFT", "CENTER", "RIGHT", "JUSTIFY"] = "LEFT"
    line_spacing: float = 1.5  # 1.0, 1.15, 1.5, 2.0
    space_before_pt: float = 0.0
    space_after_pt: float = 6.0
    first_line_indent_inches: float = 0.0

class CoverPageData(BaseModel):
    enabled: bool = True
    mode: Literal["builtin", "template"] = "builtin"
    replace_existing: bool = True
    student_name: str = ""
    student_id: str = ""
    institution: str = ""
    department: str = ""
    course: str = ""
    module_code: str = ""
    assignment_title: str = ""
    assignment_subtitle: str = ""
    lecturer_name: str = ""
    submission_date: str = ""

class MarkingCriterion(BaseModel):
    name: str
    description: str = ""
    max_marks: float = 10.0
    weight_percentage: float = 0.0

class MarkingSchemeData(BaseModel):
    enabled: bool = False
    title: str = "Official Assessment Criteria & Marking Scheme"
    placement: Literal["after_cover", "before_references", "end_of_document"] = "end_of_document"
    replace_existing: bool = False
    criteria: list[MarkingCriterion] = []
    notes: str = ""

class PageNumberingSettings(BaseModel):
    enabled: bool = True
    hide_on_cover: bool = True
    roman_front_matter: bool = True
    restart_at_introduction: bool = True
    footer_alignment: Literal["LEFT", "CENTER", "RIGHT"] = "RIGHT"

class TableOfContentsSettings(BaseModel):
    enabled: bool = True
    title: str = "Table of Contents"
    depth: int = Field(default=3, ge=1, le=4)

class FormattingSettings(BaseModel):
    paper_size: Literal["A4", "LETTER"] = "A4"
    margins: MarginSettings = Field(default_factory=MarginSettings)
    body: BodyStyle = Field(default_factory=BodyStyle)
    heading1: HeadingStyle = Field(
        default_factory=lambda: HeadingStyle(
            font_size_pt=16.0, bold=True, space_before_pt=18.0, space_after_pt=6.0, page_break_before=True
        )
    )
    heading2: HeadingStyle = Field(
        default_factory=lambda: HeadingStyle(
            font_size_pt=14.0, bold=True, space_before_pt=12.0, space_after_pt=4.0, page_break_before=False
        )
    )
    heading3: HeadingStyle = Field(
        default_factory=lambda: HeadingStyle(
            font_size_pt=12.0, bold=True, italic=True, space_before_pt=6.0, space_after_pt=2.0, page_break_before=False
        )
    )
    start_main_heading_on_new_page: bool = True
    excluded_heading_break_titles: list[str] = Field(default_factory=list)
    preserve_hyperlinks: bool = True
    preserve_tables: bool = True
    preserve_images: bool = True
    cover_page: CoverPageData = Field(default_factory=CoverPageData)
    marking_scheme: MarkingSchemeData = Field(default_factory=MarkingSchemeData)
    page_numbering: PageNumberingSettings = Field(default_factory=PageNumberingSettings)
    table_of_contents: TableOfContentsSettings = Field(default_factory=TableOfContentsSettings)
    required_sections: list[str] = Field(
        default_factory=lambda: ["Introduction", "Conclusion", "References"]
    )

class ComplianceCheckItem(BaseModel):
    id: str
    category: str
    name: str
    status: Literal["PASS", "FAIL", "WARNING", "UNVERIFIED"]
    message: str
    recommendation: str = ""

class ComplianceReport(BaseModel):
    score_percentage: int
    total_checks: int
    passed_count: int
    failed_count: int
    warning_count: int
    unverified_count: int
    checks: list[ComplianceCheckItem]
    content_insights: list[str] = []

class DocumentStructureItem(BaseModel):
    level: int  # 1 for H1, 2 for H2, 3 for H3, 0 for regular paragraph
    text: str
    word_count: int

class InspectionResult(BaseModel):
    filename: str
    file_size_bytes: int
    total_paragraphs: int
    total_words: int
    total_tables: int
    total_images: int
    detected_headings: list[DocumentStructureItem]
    detected_body_font: str | None = None
    detected_margins_inches: dict[str, float] | None = None
    has_cover_page_markers: bool = False
    has_table_of_contents: bool = False
    has_references_section: bool = False
    has_marking_scheme_section: bool = False

class JobStatusResponse(BaseModel):
    job_id: str
    original_filename: str
    has_cover_template: bool
    has_guidelines: bool
    has_marking_scheme_file: bool
    is_formatted: bool
    has_pdf_version: bool
    inspection: InspectionResult | None = None
    compliance: ComplianceReport | None = None
