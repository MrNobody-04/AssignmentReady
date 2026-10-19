import { CollegeProfile, FormattingSettings } from '../types';

export const DEFAULT_FORMATTING_SETTINGS: FormattingSettings = {
  paper_size: 'A4',
  margins: {
    top_inches: 1.0,
    bottom_inches: 1.0,
    left_inches: 1.0,
    right_inches: 1.0,
  },
  body: {
    font_family: 'Times New Roman',
    font_size_pt: 12.0,
    font_color_hex: '#000000',
    alignment: 'LEFT',
    line_spacing: 1.5,
    space_before_pt: 0.0,
    space_after_pt: 6.0,
    first_line_indent_inches: 0.0,
  },
  heading1: {
    font_family: 'Times New Roman',
    font_size_pt: 16.0,
    bold: true,
    italic: false,
    color_hex: '#1E3A8A',
    alignment: 'LEFT',
    space_before_pt: 18.0,
    space_after_pt: 6.0,
    page_break_before: true,
  },
  heading2: {
    font_family: 'Times New Roman',
    font_size_pt: 14.0,
    bold: true,
    italic: false,
    color_hex: '#1E3A8A',
    alignment: 'LEFT',
    space_before_pt: 12.0,
    space_after_pt: 4.0,
    page_break_before: false,
  },
  heading3: {
    font_family: 'Times New Roman',
    font_size_pt: 12.0,
    bold: true,
    italic: true,
    color_hex: '#334155',
    alignment: 'LEFT',
    space_before_pt: 6.0,
    space_after_pt: 2.0,
    page_break_before: false,
  },
  start_main_heading_on_new_page: true,
  excluded_heading_break_titles: ['Introduction', 'Executive Summary'],
  preserve_hyperlinks: true,
  preserve_tables: true,
  preserve_images: true,
  cover_page: {
    enabled: true,
    mode: 'builtin',
    replace_existing: true,
    student_name: '',
    student_id: '',
    institution: '',
    department: '',
    course: '',
    module_code: '',
    assignment_title: '',
    assignment_subtitle: '',
    lecturer_name: '',
    submission_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  },
  marking_scheme: {
    enabled: false,
    title: 'Official Assessment Criteria & Marking Scheme',
    placement: 'end_of_document',
    replace_existing: false,
    criteria: [
      { name: 'Subject Knowledge & Theory', description: 'Understanding of core theoretical concepts and foundational literature.', max_marks: 30, weight_percentage: 30 },
      { name: 'Critical Evaluation & Analysis', description: 'Application of critical thinking, comparative analysis, and methodology.', max_marks: 35, weight_percentage: 35 },
      { name: 'Structure, Coherence & Flow', description: 'Logical narrative progression, clear headings, and academic clarity.', max_marks: 20, weight_percentage: 20 },
      { name: 'Scholarly Referencing', description: 'Appropriate citation apparatus and bibliography format.', max_marks: 15, weight_percentage: 15 },
    ],
    notes: 'Official marking rubric. Evaluated and scored according to faculty guidelines.',
  },
  page_numbering: {
    enabled: true,
    hide_on_cover: true,
    roman_front_matter: true,
    restart_at_introduction: true,
    footer_alignment: 'RIGHT',
  },
  table_of_contents: {
    enabled: true,
    title: 'Table of Contents',
    depth: 3,
  },
  required_sections: ['Introduction', 'Conclusion', 'References'],
};

export const BUILTIN_PROFILES: CollegeProfile[] = [
  {
    id: 'uk-standard',
    name: 'UK University Standard',
    institution: 'Standard British & Commonwealth Universities',
    description: 'A4 paper, Times New Roman 12pt, 1.5 line spacing, 1-inch margins, major headings on new pages.',
    is_builtin: true,
    settings: {
      ...DEFAULT_FORMATTING_SETTINGS,
      paper_size: 'A4',
      body: { ...DEFAULT_FORMATTING_SETTINGS.body, font_family: 'Times New Roman', font_size_pt: 12, line_spacing: 1.5 },
    },
  },
  {
    id: 'apa-7th',
    name: 'APA 7th Edition Standard',
    institution: 'American Psychological Association Guidelines',
    description: 'Letter paper, Times New Roman or Calibri, Double line spacing, 1-inch margins, continuous page numbers.',
    is_builtin: true,
    settings: {
      ...DEFAULT_FORMATTING_SETTINGS,
      paper_size: 'LETTER',
      body: { ...DEFAULT_FORMATTING_SETTINGS.body, font_family: 'Calibri', font_size_pt: 11, line_spacing: 2.0 },
      heading1: { ...DEFAULT_FORMATTING_SETTINGS.heading1, font_family: 'Calibri', font_size_pt: 14, alignment: 'CENTER' },
      heading2: { ...DEFAULT_FORMATTING_SETTINGS.heading2, font_family: 'Calibri', font_size_pt: 12, alignment: 'LEFT' },
      page_numbering: { ...DEFAULT_FORMATTING_SETTINGS.page_numbering, restart_at_introduction: false },
    },
  },
  {
    id: 'harvard-style',
    name: 'Harvard Academic Format',
    institution: 'Standard International Harvard Referencing Style',
    description: 'A4, Arial 11pt, 1.5 line spacing, structured headings, formal academic cover sheet and TOC.',
    is_builtin: true,
    settings: {
      ...DEFAULT_FORMATTING_SETTINGS,
      paper_size: 'A4',
      body: { ...DEFAULT_FORMATTING_SETTINGS.body, font_family: 'Arial', font_size_pt: 11, line_spacing: 1.5 },
      heading1: { ...DEFAULT_FORMATTING_SETTINGS.heading1, font_family: 'Arial', font_size_pt: 15 },
      heading2: { ...DEFAULT_FORMATTING_SETTINGS.heading2, font_family: 'Arial', font_size_pt: 13 },
      heading3: { ...DEFAULT_FORMATTING_SETTINGS.heading3, font_family: 'Arial', font_size_pt: 11 },
    },
  },
  {
    id: 'engineering-report',
    name: 'STEM Technical Report',
    institution: 'Faculty of Engineering & Science',
    description: 'A4, Arial 11pt, 1.15 line spacing, Justified text alignment, embedded grading rubric table.',
    is_builtin: true,
    settings: {
      ...DEFAULT_FORMATTING_SETTINGS,
      paper_size: 'A4',
      body: { ...DEFAULT_FORMATTING_SETTINGS.body, font_family: 'Arial', font_size_pt: 11, line_spacing: 1.15, alignment: 'JUSTIFY' },
      marking_scheme: { ...DEFAULT_FORMATTING_SETTINGS.marking_scheme, enabled: true },
      required_sections: ['Introduction', 'Methodology', 'Results & Discussion', 'Conclusion', 'References'],
    },
  },
];

const STORAGE_KEY = 'assignmentready_custom_profiles';

export const profilesManager = {
  getAll(): CollegeProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const custom: CollegeProfile[] = stored ? JSON.parse(stored) : [];
      return [...BUILTIN_PROFILES, ...custom];
    } catch {
      return [...BUILTIN_PROFILES];
    }
  },

  getCustom(): CollegeProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  save(profile: Omit<CollegeProfile, 'id' | 'is_builtin'>): CollegeProfile {
    const custom = this.getCustom();
    const newProfile: CollegeProfile = {
      ...profile,
      id: `custom-${Date.now()}`,
      is_builtin: false,
    };
    custom.push(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    return newProfile;
  },

  update(id: string, updates: Partial<CollegeProfile>): void {
    const custom = this.getCustom().map((p) => (p.id === id ? { ...p, ...updates } : p));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  },

  duplicate(id: string): CollegeProfile | null {
    const all = this.getAll();
    const target = all.find((p) => p.id === id);
    if (!target) return null;

    return this.save({
      name: `${target.name} (Copy)`,
      institution: target.institution,
      description: target.description,
      settings: JSON.parse(JSON.stringify(target.settings)),
    });
  },

  delete(id: string): void {
    const custom = this.getCustom().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  },
};
