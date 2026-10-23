from typing import Literal
from pydantic import BaseModel, Field, field_validator

class MarginSettings(BaseModel):
    top_inches: float = Field(default=1.0, ge=0.0, le=5.0)
    bottom_inches: float = Field(default=1.0, ge=0.0, le=5.0)
    left_inches: float = Field(default=1.0, ge=0.0, le=5.0)
    right_inches: float = Field(default=1.0, ge=0.0, le=5.0)

class HeadingStyle(BaseModel):
    font_family: str = "Times New Roman"
    font_size_pt: float = 16.0
    bold: bool = True
    italic: bool = False
    color_hex: str = "#000000"
    alignment: Literal["LEFT", "CENTER", "RIGHT", "JUSTIFY", "JUSTIFIED", "left", "center", "right", "justify", "justified"] = "LEFT"
    space_before_pt: float = 12.0
    space_after_pt: float = 6.0
    page_break_before: bool = False

    @field_validator("alignment", mode="before")
    @classmethod
    def normalize_alignment(cls, v):
        if isinstance(v, str):
            v_upper = v.strip().upper()
            if v_upper in ("JUSTIFIED", "JUSTIFY"):
                return "JUSTIFY"
            if v_upper in ("LEFT", "CENTER", "RIGHT"):
                return v_upper
        return v

class BodyStyle(BaseModel):
    font_family: str = "Times New Roman"
    font_size_pt: float = 12.0
    font_color_hex: str = "#000000"
    alignment: Literal["LEFT", "CENTER", "RIGHT", "JUSTIFY", "JUSTIFIED", "left", "center", "right", "justify", "justified"] = "LEFT"
    line_spacing: float = 1.5  # 1.0, 1.15, 1.5, 2.0
    space_before_pt: float = 0.0
    space_after_pt: float = 6.0
    first_line_indent_inches: float = 0.0

    @field_validator("alignment", mode="before")
    @classmethod
    def normalize_alignment(cls, v):
        if isinstance(v, str):
            v_upper = v.strip().upper()
            if v_upper in ("JUSTIFIED", "JUSTIFY"):
                return "JUSTIFY"
            if v_upper in ("LEFT", "CENTER", "RIGHT"):
                return v_upper
        return v

class CoverPageData(BaseModel):
    enabled: bool = True
    mode: Literal["builtin", "template", "BUILTIN", "TEMPLATE"] = "builtin"
    replace_existing: bool = True
    use_exact_cover: bool = True
    fill_placeholders: bool = False
    student_name: str | None = ""
    student_id: str | None = ""
    institution: str | None = ""
    department: str | None = ""
    course: str | None = ""
    module_code: str | None = ""
    assignment_title: str | None = ""
    assignment_subtitle: str | None = ""
    lecturer_name: str | None = ""
    submission_date: str | None = ""

class MarkingCriterion(BaseModel):
    name: str
    description: str = ""
    max_marks: float = 10.0
    weight_percentage: float = 0.0

class MarkingSchemeData(BaseModel):
    enabled: bool = False
    title: str = "Official Assessment Criteria & Marking Scheme"
    placement: Literal["after_cover", "before_references", "end_of_document", "AFTER_COVER", "BEFORE_REFERENCES", "END_OF_DOCUMENT"] = "end_of_document"
    replace_existing: bool = False
    criteria: list[MarkingCriterion] = []
    notes: str | None = ""

class PageNumberingSettings(BaseModel):
    enabled: bool = True
    hide_on_cover: bool = True
    roman_front_matter: bool = True
    restart_at_introduction: bool = True
    footer_alignment: Literal["LEFT", "CENTER", "RIGHT", "left", "center", "right"] = "RIGHT"

class TableOfContentsSettings(BaseModel):
    enabled: bool = True
    title: str = "Table of Contents"
    depth: int = Field(default=3, ge=1, le=5)

class DeclarationSettings(BaseModel):
    enabled: bool = False
    title: str = "Declaration of Originality"
    statement: str | None = (
        "I hereby declare that this assignment represents my own original academic work, "
        "prepared in accordance with institutional academic integrity regulations. "
        "All secondary literature, data sources, and external quotations have been duly cited."
    )
    include_signature_line: bool = True

class AcknowledgementSettings(BaseModel):
    enabled: bool = False
    title: str = "Acknowledgements"
    content: str | None = ""

class AbstractSettings(BaseModel):
    enabled: bool = False
    title: str = "Abstract"
    content: str | None = ""

class ListOfFiguresSettings(BaseModel):
    enabled: bool = True
    title: str = "List of Figures"
    only_if_figures_exist: bool = True

class ListOfTablesSettings(BaseModel):
    enabled: bool = True
    title: str = "List of Tables"
    only_if_tables_exist: bool = True

class AbbreviationItem(BaseModel):
    term: str
    definition: str

class ListOfAbbreviationsSettings(BaseModel):
    enabled: bool = False
    title: str = "List of Abbreviations"
    items: list[AbbreviationItem] = Field(default_factory=list)

class FormattingSettings(BaseModel):
    paper_size: Literal["A4", "LETTER", "a4", "letter"] = "A4"
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
    declaration: DeclarationSettings = Field(default_factory=DeclarationSettings)
    acknowledgement: AcknowledgementSettings = Field(default_factory=AcknowledgementSettings)
    abstract: AbstractSettings = Field(default_factory=AbstractSettings)
    table_of_contents: TableOfContentsSettings = Field(default_factory=TableOfContentsSettings)
    list_of_figures: ListOfFiguresSettings = Field(default_factory=ListOfFiguresSettings)
    list_of_tables: ListOfTablesSettings = Field(default_factory=ListOfTablesSettings)
    list_of_abbreviations: ListOfAbbreviationsSettings = Field(default_factory=ListOfAbbreviationsSettings)
    marking_scheme: MarkingSchemeData = Field(default_factory=MarkingSchemeData)
    page_numbering: PageNumberingSettings = Field(default_factory=PageNumberingSettings)
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

class CaptionItem(BaseModel):
    number: str
    caption: str
    full_text: str
    paragraph_index: int = 0

class InspectionResult(BaseModel):
    filename: str
    file_size_bytes: int
    total_paragraphs: int
    total_words: int
    total_tables: int
    total_images: int
    detected_headings: list[DocumentStructureItem]
    detected_figures: list[CaptionItem] = Field(default_factory=list)
    detected_table_captions: list[CaptionItem] = Field(default_factory=list)
    detected_body_font: str | None = None
    detected_margins_inches: dict[str, float] | None = None
    has_cover_page_markers: bool = False
    has_table_of_contents: bool = False
    has_references_section: bool = False
    has_marking_scheme_section: bool = False
    has_declaration_section: bool = False
    has_acknowledgement_section: bool = False
    has_abstract_section: bool = False
    has_list_of_figures: bool = False
    has_list_of_tables: bool = False

# ==========================================
# Unified Workflow & Shared Project Schemas
# ==========================================

class DocumentVersionInfo(BaseModel):
    version_id: int
    version_label: str
    filename: str
    file_type: str = "docx"
    operation: str  # "original", "formatted", "doctor_repaired", "converted"
    source_version_id: int | None = None
    created_at: float
    file_size_bytes: int
    is_valid: bool = True
    download_url: str

class ProjectPresentationRecord(BaseModel):
    presentation_id: str
    source_version_id: int
    theme: str
    total_slides: int
    filename: str
    created_at: float
    download_url: str
    is_stale: bool = False

class RubricProjectData(BaseModel):
    filename: str
    total_criteria_count: int
    total_weight_found: float
    criteria: list[dict] = Field(default_factory=list)
    uploaded_at: float

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
    # Unified Workflow Extensions
    project_id: str | None = None
    current_version_id: int = 1
    versions: list[DocumentVersionInfo] = Field(default_factory=list)
    rubric_data: RubricProjectData | None = None
    presentations: list[ProjectPresentationRecord] = Field(default_factory=list)

class ProjectDetailResponse(BaseModel):
    project_id: str
    original_filename: str
    current_version_id: int
    versions: list[DocumentVersionInfo]
    has_cover_template: bool
    has_guidelines: bool
    has_marking_scheme: bool
    rubric_data: RubricProjectData | None = None
    settings: FormattingSettings | None = None
    presentations: list[ProjectPresentationRecord] = Field(default_factory=list)
    inspection: InspectionResult | None = None
    compliance: ComplianceReport | None = None
    created_at: float
    updated_at: float
    status: str = "completed"
