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
}

export interface CollegeProfile {
  id: string;
  name: string;
  institution: string;
  description: string;
  settings: FormattingSettings;
  is_builtin?: boolean;
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

export interface SlideItem {
  title: string;
  category?: string;
  bullets: string[];
  notes?: string;
  slide_type?: string;
  column_left_title?: string;
  column_left_bullets?: string[];
  column_right_title?: string;
  column_right_bullets?: string[];
  metrics?: MetricItem[];
  steps?: StepItem[];
  table_headers?: string[];
  table_rows?: string[][];
}

export interface PresentationOutline {
  title: string;
  subtitle: string;
  author: string;
  institution: string;
  target_slide_count?: number;
  audience?: string;
  duration_minutes?: number;
  text_density?: string;
  include_notes?: boolean;
  include_references?: boolean;
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

export type AppView = 'landing' | 'workspace' | 'presentation' | 'converter';

