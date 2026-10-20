export type PaperSize = 'A4' | 'LETTER';
export type TextAlignment = 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFY';
export type CheckStatus = 'PASS' | 'FAIL' | 'WARNING' | 'UNVERIFIED';

export interface MarginSettings {
  top_inches: number;
  bottom_inches: number;
  left_inches: number;
  right_inches: number;
}

export interface HeadingStyle {
  font_family: string;
  font_size_pt: number;
  bold: boolean;
  italic: boolean;
  color_hex: string;
  alignment: TextAlignment;
  space_before_pt: number;
  space_after_pt: number;
  page_break_before: boolean;
}

export interface BodyStyle {
  font_family: string;
  font_size_pt: number;
  font_color_hex: string;
  alignment: TextAlignment;
  line_spacing: number;
  space_before_pt: number;
  space_after_pt: number;
  first_line_indent_inches: number;
}

export interface CoverPageData {
  enabled: boolean;
  mode: 'builtin' | 'template';
  replace_existing: boolean;
  student_name: string;
  student_id: string;
  institution: string;
  department: string;
  course: string;
  module_code: string;
  assignment_title: string;
  assignment_subtitle: string;
  lecturer_name: string;
  submission_date: string;
}

export interface MarkingCriterion {
  name: string;
  description: string;
  max_marks: number;
  weight_percentage: number;
}

export interface MarkingSchemeData {
  enabled: boolean;
  title: string;
  placement: 'after_cover' | 'before_references' | 'end_of_document';
  replace_existing: boolean;
  criteria: MarkingCriterion[];
  notes: string;
}

export interface GuidelineAnalysis {
  suggestions: Partial<Pick<FormattingSettings, 'paper_size' | 'margins' | 'required_sections'>> & {
    body?: Partial<BodyStyle>;
  };
  evidence: string[];
  has_suggestions: boolean;
}

export interface PageNumberingSettings {
  enabled: boolean;
  hide_on_cover: boolean;
  roman_front_matter: boolean;
  restart_at_introduction: boolean;
  footer_alignment: 'LEFT' | 'CENTER' | 'RIGHT';
}

export interface TableOfContentsSettings {
  enabled: boolean;
  title: string;
  depth: number;
}

export interface DeclarationSettings {
  enabled: boolean;
  title: string;
  statement: string;
  include_signature_line: boolean;
}

export interface AcknowledgementSettings {
  enabled: boolean;
  title: string;
  content: string;
}

export interface AbstractSettings {
  enabled: boolean;
  title: string;
  content: string;
}

export interface ListOfFiguresSettings {
  enabled: boolean;
  title: string;
  only_if_figures_exist: boolean;
}

export interface ListOfTablesSettings {
  enabled: boolean;
  title: string;
  only_if_tables_exist: boolean;
}

export interface AbbreviationItem {
  term: string;
  definition: string;
}

export interface ListOfAbbreviationsSettings {
  enabled: boolean;
  title: string;
  items: AbbreviationItem[];
}

export interface FormattingSettings {
  paper_size: PaperSize;
  margins: MarginSettings;
  body: BodyStyle;
  heading1: HeadingStyle;
  heading2: HeadingStyle;
  heading3: HeadingStyle;
  start_main_heading_on_new_page: boolean;
  excluded_heading_break_titles: string[];
  preserve_hyperlinks: boolean;
  preserve_tables: boolean;
  preserve_images: boolean;
  cover_page: CoverPageData;
  declaration: DeclarationSettings;
  acknowledgement: AcknowledgementSettings;
  abstract: AbstractSettings;
  table_of_contents: TableOfContentsSettings;
  list_of_figures: ListOfFiguresSettings;
  list_of_tables: ListOfTablesSettings;
  list_of_abbreviations: ListOfAbbreviationsSettings;
  marking_scheme: MarkingSchemeData;
  page_numbering: PageNumberingSettings;
  required_sections: string[];
}

export interface DocumentStructureItem {
  level: number;
  text: string;
  word_count: number;
}

export interface CaptionItem {
  number: string;
  caption: string;
  full_text: string;
  paragraph_index?: number;
}

export interface InspectionResult {
  filename: string;
  file_size_bytes: number;
  total_paragraphs: number;
  total_words: number;
  total_tables: number;
  total_images: number;
  detected_headings: DocumentStructureItem[];
  detected_figures?: CaptionItem[];
  detected_table_captions?: CaptionItem[];
  detected_body_font: string | null;
  detected_margins_inches: Record<string, number> | null;
  has_cover_page_markers: boolean;
  has_table_of_contents: boolean;
  has_references_section: boolean;
  has_marking_scheme_section: boolean;
  has_declaration_section?: boolean;
  has_acknowledgement_section?: boolean;
  has_abstract_section?: boolean;
  has_list_of_figures?: boolean;
  has_list_of_tables?: boolean;
}

export interface ComplianceCheckItem {
  id: string;
  category: string;
  name: string;
  status: CheckStatus;
  message: string;
  recommendation: string;
}

export interface ComplianceReport {
  score_percentage: number;
  total_checks: number;
  passed_count: number;
  failed_count: number;
  warning_count: number;
  unverified_count: number;
  checks: ComplianceCheckItem[];
  content_insights: string[];
}

export interface DocumentVersionInfo {
  version_id: number;
  version_label: string;
  filename: string;
  file_type: string;
  operation: string;
  source_version_id?: number | null;
  created_at: number;
  file_size_bytes: number;
  is_valid: boolean;
  download_url: string;
}

export interface ProjectPresentationRecord {
  presentation_id: string;
  source_version_id: number;
  theme: string;
  total_slides: number;
  filename: string;
  created_at: number;
  download_url: string;
  is_stale: boolean;
}

export interface RubricProjectData {
  filename: string;
  total_criteria_count: number;
  total_weight_found: number;
  criteria: any[];
  uploaded_at: number;
}

export interface JobStatusResponse {
  job_id: string;
  original_filename: string;
  has_cover_template: boolean;
  has_guidelines: boolean;
  has_marking_scheme_file: boolean;
  is_formatted: boolean;
  has_pdf_version: boolean;
  inspection: InspectionResult | null;
  compliance: ComplianceReport | null;
  // Unified Workflow Extensions
  project_id?: string;
  current_version_id?: number;
  versions?: DocumentVersionInfo[];
  rubric_data?: RubricProjectData | null;
  presentations?: ProjectPresentationRecord[];
}

export interface CollegeProfile {
  id: string;
  name: string;
  institution: string;
  description: string;
  settings: FormattingSettings;
  is_builtin?: boolean;
  verified_source?: string;
  last_verified_date?: string;
}

export interface MetricItem {
  value: string;
  label: string;
  description?: string;
}

export interface StepItem {
  step_number: string;
  title: string;
  description: string;
}

export interface ExtractedCoverPage {
  title: string;
  subtitle: string;
  student_name: string;
  student_id: string;
  institution: string;
  college_name: string;
  course_name: string;
  course_code: string;
  lecturer_name: string;
  submission_date: string;
  quarantined_lines: string[];
}

export interface ReportSection {
  section_type: string;
  heading: string;
  content: string;
  bullets: string[];
  key_metrics: string[];
  word_count: number;
}

export interface StructuredReport {
  cover_page: ExtractedCoverPage;
  document_title: string;
  sections: ReportSection[];
  total_words: number;
  detected_figures_count: number;
  detected_tables_count: number;
  key_highlights: string[];
}

export interface AssessmentCriterion {
  id: string;
  title: string;
  weight_percent: number;
  max_marks: number;
  description: string;
  expected_evidence?: string[];
  category: string;
}

export interface CriterionComplianceMatch {
  criterion_id: string;
  criterion_title: string;
  weight_percent: number;
  status:
    | 'covered_with_evidence'
    | 'partially_covered'
    | 'missing_from_report'
    | 'uncertain_review_required'
    | 'strong_match'
    | 'partial_match'
    | 'missing_evidence';
  matched_sections: string[];
  evidence_snippets: string[];
  score_percent: number;
  recommendation: string;
}

export interface RubricAnalysisResult {
  rubric_title: string;
  total_criteria_count: number;
  total_weight_found: number;
  criteria: AssessmentCriterion[];
  compliance_matches?: CriterionComplianceMatch[];
  overall_compliance_score?: number;
  missing_evidence_warnings?: string[];
  required_criteria_covered?: string;
  covered_count?: number;
}

export interface PresenterInfo {
  name: string;
  student_id: string;
  role: string;
  assigned_slide_numbers?: number[];
  estimated_speaking_minutes?: number;
}

export interface SlideItem {
  title: string;
  category?: string;
  bullets: string[];
  notes?: string;
  slide_type?: string;
  purpose?: string;
  key_message?: string;
  source_sections?: string[];
  supporting_evidence?: string[];
  visual_type?: string;
  visual_description?: string;
  decision?: string;
  decision_reason?: string;
  assigned_presenter_name?: string;
  estimated_speaking_minutes?: number;
  column_left_title?: string;
  column_left_bullets?: string[];
  column_right_title?: string;
  column_right_bullets?: string[];
  metrics?: MetricItem[];
  steps?: StepItem[];
  table_headers?: string[];
  table_rows?: string[][];
  criteria_addressed?: string[];
  chart_type?: string;
  chart_categories?: string[];
  chart_series?: { name: string; values: number[] }[];
  diagram_nodes?: { label: string; desc: string }[];
  conclusion_verdict?: string;
  conclusion_takeaways?: string[];
  conclusion_recommendation?: string;
  conclusion_limitations?: string;
}

export interface PresentationOutline {
  title: string;
  subtitle: string;
  author: string;
  student_id?: string;
  presentation_mode?: 'individual' | 'group';
  presenters?: PresenterInfo[];
  counting_mode?: 'total' | 'content_only';
  institution: string;
  college_name?: string;
  course_name?: string;
  course_code?: string;
  lecturer_name?: string;
  submission_date?: string;
  university_logo_base64?: string;
  college_logo_base64?: string;
  target_slide_count?: number;
  requested_slide_count?: number;
  planned_slide_count?: number;
  audience?: string;
  duration_minutes?: number;
  presentation_type?: string;
  text_density?: string; // concise, balanced, detailed
  transition_type?: string; // fade, push, wipe, cut, none
  animation_intensity?: string; // none, subtle, enhanced
  include_notes?: boolean;
  include_references?: boolean;
  include_qa?: boolean;
  required_criteria_covered?: string;
  planning_warnings?: string[];
  summary_banner?: string;
  quarantined_cover_lines?: string[];
  slides: SlideItem[];
}

export interface PresentationThemeInfo {
  id: string;
  name: string;
  description: string;
  is_dark: boolean;
  primary_color: string;
  accent_color: string;
  font_title: string;
}

export interface ConversionOption {
  target_format: string;
  target_label: string;
  extension: string;
  mime_type: string;
  available: boolean;
  description: string;
}

export interface InputFormatInfo {
  format_key: string;
  label: string;
  extensions: string[];
  mime_types: string[];
  allowed_outputs: ConversionOption[];
}

export interface ConversionResult {
  conversion_id: string;
  original_filename: string;
  detected_format: string;
  target_format: string;
  output_filename: string;
  size_bytes: number;
  download_url: string;
}

export interface DoctorIssue {
  id: string;
  category: string;
  issue: string;
  location: string;
  why_it_matters: string;
  recommendation: string;
  can_fix_automatically: boolean;
  requires_user_review: boolean;
  severity: 'CRITICAL' | 'WARNING' | 'NOTICE';
  fix_action: string;
}

export interface InTextCitation {
  raw_text: string;
  author: string;
  year: string;
  paragraph_index: number;
  citation_type: string;
}

export interface ReferenceEntry {
  entry_index: number;
  raw_text: string;
  detected_author: string;
  detected_year: string;
  is_complete: boolean;
  missing_fields: string[];
}

export interface CitationAnalysisReport {
  total_in_text_citations: number;
  total_references_entries: number;
  detected_style: string;
  unmatched_in_text_citations: InTextCitation[];
  uncited_reference_entries: ReferenceEntry[];
  style_inconsistencies: string[];
  incomplete_reference_entries: ReferenceEntry[];
  is_consistent: boolean;
  summary: string;
}

export interface DoctorDiagnosisResponse {
  job_id: string;
  filename: string;
  total_issues: number;
  critical_count: number;
  warning_count: number;
  notice_count: number;
  auto_fixable_count: number;
  issues: DoctorIssue[];
  citation_report?: CitationAnalysisReport | null;
  overall_health_score: number;
  summary_message: string;
  // Unified Workflow Extensions
  project_id?: string;
  version_id?: number;
  version_label?: string;
  is_latest_version?: boolean;
  rubric_used?: boolean;
  rubric_summary?: string | null;
  resolved_issues_count?: number;
  unresolved_issues_count?: number;
}

export interface DoctorFixResponse {
  job_id: string;
  repaired_filename: string;
  download_url: string;
  updated_diagnosis: DoctorDiagnosisResponse;
  fixes_applied: string[];
}

export interface StudentProjectRecord {
  id: string;
  title: string;
  type: 'formatting' | 'presentation' | 'conversion' | 'doctor' | 'rubric';
  createdAt: string;
  sourceFilename: string;
  fileSizeBytes?: number;
  status: 'draft' | 'processed' | 'downloaded';
  jobId?: string;
  downloadUrl?: string;
  summary?: string;
  meta?: Record<string, any>;
}

export type AppView =
  | 'landing'
  | 'workspace'
  | 'presentation'
  | 'doctor'
  | 'converter'
  | 'rubric'
  | 'projects';


