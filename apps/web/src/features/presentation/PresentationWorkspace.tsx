import React, { useState, useRef } from 'react';
import {
  Presentation,
  UploadCloud,
  BookOpen,
  Download,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  AlertCircle,
  Clock,
  Users,
  FileText,
  Sliders,
  Eye,
  Check,
} from 'lucide-react';
import {
  extractPresentationOutline,
  generatePresentation,
} from '../../services/api';
import {
  PresentationOutline,
  SlideItem,
  PresentationThemeInfo,
} from '../../types';

interface PresentationWorkspaceProps {
  initialFile?: File | null;
  onBackToLanding: () => void;
  onOpenWorkspace: () => void;
}

const DEFAULT_THEMES: PresentationThemeInfo[] = [
  {
    id: 'modern_academic',
    name: 'Modern Academic',
    description: 'Clean, structured scholarly deep navy blue and warm amber accents with serif headings.',
    is_dark: false,
    primary_color: '#1E3A8A',
    accent_color: '#B45309',
    font_title: 'Georgia',
  },
  {
    id: 'tech_innovation',
    name: 'Technology & Innovation',
    description: 'Contemporary tech visuals with vibrant cyan accents and sharp geometric layouts.',
    is_dark: false,
    primary_color: '#0F172A',
    accent_color: '#06B6D4',
    font_title: 'Segoe UI',
  },
  {
    id: 'minimalist_premium',
    name: 'Minimalist Premium',
    description: 'Generous whitespace, elegant typography, and refined stone and ochre tones.',
    is_dark: false,
    primary_color: '#1C1917',
    accent_color: '#D97706',
    font_title: 'Georgia',
  },
  {
    id: 'corporate_pro',
    name: 'Corporate Professional',
    description: 'Polished executive enterprise styling with royal blue and clean data cards.',
    is_dark: false,
    primary_color: '#0A2540',
    accent_color: '#2563EB',
    font_title: 'Arial',
  },
  {
    id: 'creative_gradient',
    name: 'Creative Gradient',
    description: 'Tasteful gradient highlights, bold headlines, and vibrant fuchsia and violet accents.',
    is_dark: false,
    primary_color: '#4338CA',
    accent_color: '#EC4899',
    font_title: 'Trebuchet MS',
  },
  {
    id: 'research_science',
    name: 'Research & Science',
    description: 'Tailored for scientific investigations, laboratory methodologies, and empirical findings.',
    is_dark: false,
    primary_color: '#065F46',
    accent_color: '#0D9488',
    font_title: 'Trebuchet MS',
  },
  {
    id: 'dark_presentation',
    name: 'Dark Presentation',
    description: 'Readable dark obsidian background with high-contrast glowing cyan highlights.',
    is_dark: true,
    primary_color: '#0F172A',
    accent_color: '#38BDF8',
    font_title: 'Segoe UI',
  },
  {
    id: 'university_classic',
    name: 'University Classic',
    description: 'Formal traditional academic prestige styling with Oxford blue, burgundy, and antique gold.',
    is_dark: false,
    primary_color: '#002147',
    accent_color: '#800020',
    font_title: 'Georgia',
  },
];

const SAMPLE_OUTLINE: PresentationOutline = {
  title: 'Generative AI in Higher Education',
  subtitle: 'Institutional Guidelines, Assessment Integrity & Practical Applications',
  author: 'Sujan G.C.',
  institution: 'Department of Computer Science',
  target_slide_count: 8,
  audience: 'academic',
  duration_minutes: 15,
  text_density: 'balanced',
  include_notes: true,
  include_references: true,
  slides: [
    {
      title: 'Context & Executive Overview',
      category: 'Overview',
      bullets: [
        'Rapid adoption of generative AI tools (ChatGPT, Gemini) across student cohorts.',
        'Widespread discrepancies in meeting institutional typography and rubric standards.',
        'Need for deterministic document processing pipelines without proprietary API lock-in.',
      ],
      slide_type: 'agenda',
      notes: 'Introduce the context of rising generative AI adoption and student formatting challenges.',
    },
    {
      title: 'Key Objectives & Project Scope',
      category: 'Objectives',
      bullets: [
        'Automate document section breaks, Roman pagination, and cover pages.',
        'Provide instant rule-based compliance auditing without external AI costs.',
        'Synthesize 16:9 widescreen PowerPoint presentation decks directly from reports.',
      ],
      slide_type: 'objectives',
      notes: 'Highlight the three primary aims: formatting automation, compliance verification, and presentation generation.',
    },
    {
      title: 'Methodology & Processing Workflow',
      category: 'Methodology',
      bullets: [
        '1. Ingestion: Inspect OpenXML headings, captions, and embedded tables.',
        '2. Front Matter: Inject unlinked cover, TOC, LOF, LOT, and Declaration.',
        '3. Formatting: Apply paragraph margins, font styles, and chapter page breaks.',
        '4. Verification: Audit compliance score and generate editable PPTX.',
      ],
      slide_type: 'process_workflow',
      notes: 'Walk through the 4-step processing pipeline from document ingestion to final generation.',
    },
    {
      title: 'Commercial AI vs. AssignmentReady',
      category: 'Comparison',
      bullets: [
        'Commercial tools require monthly subscriptions and cloud API dependencies.',
        'AssignmentReady is 100% free, runs client-safe, and requires zero paid accounts.',
      ],
      column_left_title: 'Commercial Paid Tools',
      column_left_bullets: [
        'Expensive monthly subscriptions ($20+/mo)',
        'Potential student privacy & data leaks',
        'Inconsistent formatting rule compliance',
      ],
      column_right_title: 'AssignmentReady (Free)',
      column_right_bullets: [
        'Zero API costs or mandatory accounts',
        'Deterministic rule verification',
        'Official institutional templates',
      ],
      slide_type: 'comparison',
      notes: 'Compare traditional subscription tools against AssignmentReady open-source architecture.',
    },
    {
      title: 'Empirical Results & Impact',
      category: 'Findings',
      bullets: [
        '94.5% reduction in student formatting time prior to submission.',
        '100% adherence to institutional cover sheet and rubric guidelines.',
        'Zero API latency overhead with local deterministic processing.',
      ],
      slide_type: 'metrics_stats',
      metrics: [
        { value: '94.5%', label: 'Time Saved', description: 'Average reduction in formatting time.' },
        { value: '100%', label: 'Rubric Compliance', description: 'Conforms to faculty handbook standards.' },
        { value: '0', label: 'Paid APIs', description: 'Complete offline-safe processing privacy.' },
      ],
      notes: 'Present quantitative evaluation metrics demonstrating time savings and adherence.',
    },
    {
      title: 'Recommendations & Future Work',
      category: 'Conclusion',
      bullets: [
        'Adopt automated compliance checking in university submission portals.',
        'Provide standardized OpenXML template registries for all academic departments.',
        'Expand universal converter formats for LaTeX and Markdown assignments.',
      ],
      slide_type: 'conclusion',
      notes: 'Synthesize concluding recommendations for academic faculties and future software expansion.',
    },
    {
      title: 'Academic References',
      category: 'References',
      bullets: [
        '[1] ISO/IEC 29500-1:2021. Information technology — Document description and processing languages.',
        '[2] OpenXML Consortium. (2024). Standard ECMA-376: Office Open XML File Formats.',
        '[3] Higher Education Academy. (2025). Guidelines on Academic Integrity in Digital Submissions.',
      ],
      slide_type: 'references',
      notes: 'Acknowledge foundational literature and institutional standards.',
    },
    {
      title: 'Questions & Discussion',
      category: 'Q&A',
      bullets: [],
      slide_type: 'qa_closing',
      notes: 'Open the floor for questions, remarks, and faculty evaluation.',
    },
  ],
};

const SLIDE_TYPE_OPTIONS = [
  { value: 'content', label: 'Standard Content Card' },
  { value: 'agenda', label: 'Agenda & Topics Grid' },
  { value: 'objectives', label: 'Target Objectives Grid' },
  { value: 'process_workflow', label: 'Process / Workflow Steps' },
  { value: 'comparison', label: '2-Column Comparison' },
  { value: 'metrics_stats', label: 'Key Metrics & Statistics' },
  { value: 'table', label: 'Structured Table' },
  { value: 'conclusion', label: 'Conclusion Takeaways' },
  { value: 'references', label: 'Scholarly References' },
  { value: 'qa_closing', label: 'Q&A Closing Slide' },
];

export const PresentationWorkspace: React.FC<PresentationWorkspaceProps> = ({
  initialFile,
  onBackToLanding,
  onOpenWorkspace: _onOpenWorkspace,
}) => {
  // 6 Steps: 1: upload, 2: outline, 3: settings, 4: generating, 5: preview, 6: download
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [outline, setOutline] = useState<PresentationOutline>(SAMPLE_OUTLINE);
  const [selectedTheme, setSelectedTheme] = useState<string>('modern_academic');
  const [customFilename, setCustomFilename] = useState<string>('Research_Presentation');
  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<{
    filename: string;
    download_url: string;
    total_slides: number;
    size_bytes?: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initialFile) {
      handleProcessFile(initialFile);
    }
  }, [initialFile]);

  const handleProcessFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const extracted = await extractPresentationOutline(file);
      setOutline(extracted);
      const stem = file.name.substring(0, file.name.lastIndexOf('.')) || 'Presentation';
      setCustomFilename(`${stem}_Slides`);
      setCurrentStep(2); // Move to Review Outline
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to extract outline from file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlide = () => {
    const newSlide: SlideItem = {
      title: `New Section ${outline.slides.length + 1}`,
      category: 'Section',
      bullets: ['Key takeaway point 1', 'Supporting evidence or context'],
      slide_type: 'content',
      notes: 'Discuss the key elements of this section.',
    };
    setOutline({
      ...outline,
      slides: [...outline.slides, newSlide],
    });
  };

  const handleDeleteSlide = (idx: number) => {
    if (outline.slides.length <= 1) return;
    const updated = outline.slides.filter((_, i) => i !== idx);
    setOutline({ ...outline, slides: updated });
  };

  const handleMoveSlide = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= outline.slides.length) return;
    const updated = [...outline.slides];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setOutline({ ...outline, slides: updated });
  };

  const handleUpdateSlide = (idx: number, field: keyof SlideItem, val: any) => {
    const updated = [...outline.slides];
    updated[idx] = { ...updated[idx], [field]: val };
    setOutline({ ...outline, slides: updated });
  };

  const handleUpdateBullet = (slideIdx: number, bulletIdx: number, val: string) => {
    const updated = [...outline.slides];
    updated[slideIdx].bullets[bulletIdx] = val;
    setOutline({ ...outline, slides: updated });
  };

  const handleAddBullet = (slideIdx: number) => {
    const updated = [...outline.slides];
    updated[slideIdx].bullets.push('New key takeaway point');
    setOutline({ ...outline, slides: updated });
  };

  const handleRemoveBullet = (slideIdx: number, bulletIdx: number) => {
    const updated = [...outline.slides];
    if (updated[slideIdx].bullets.length <= 1) return;
    updated[slideIdx].bullets = updated[slideIdx].bullets.filter((_, i) => i !== bulletIdx);
    setOutline({ ...outline, slides: updated });
  };

  const handleGenerateDeck = async () => {
    setErrorMessage(null);
    setCurrentStep(4); // Generating step
    try {
      const res = await generatePresentation(
        outline,
        selectedTheme,
        customFilename.trim()
      );
      setDownloadInfo(res);
      setCurrentStep(5); // Preview & Revise step
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate presentation deck.');
      setCurrentStep(3); // Return to settings
    }
  };

  const activeThemeObj = DEFAULT_THEMES.find((t) => t.id === selectedTheme) || DEFAULT_THEMES[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Main Menu</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Presentation className="w-6 h-6 text-academic-blue" />
            <span>PowerPoint Presentation Generator</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Transform assignment reports, research papers, and notes into editable 16:9 widescreen PowerPoint (.pptx) decks.
          </p>
        </div>

        {/* 6-Step Workflow Navigation Indicator */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 1, label: '1. Upload' },
            { id: 2, label: '2. Outline' },
            { id: 3, label: '3. Theme & Settings' },
            { id: 4, label: '4. Render' },
            { id: 5, label: '5. Preview' },
            { id: 6, label: '6. Download' },
          ].map((s) => {
            const isCurrent = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            const isClickable = s.id <= 3 || (s.id >= 5 && !!downloadInfo);
            return (
              <button
                key={s.id}
                disabled={!isClickable || currentStep === 4}
                onClick={() => isClickable && setCurrentStep(s.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'bg-academic-navy text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 1: UPLOAD REPORT */}
      {/* ==================================================== */}
      {currentStep === 1 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-academic-blue rounded-2xl p-10 text-center cursor-pointer bg-slate-50/50 hover:bg-white transition-all shadow-xs"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.pdf,.txt,.md"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleProcessFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center mb-3 border border-blue-100 shadow-2xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Upload Report to Generate Presentation
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
              Upload Word (.docx), PDF (.pdf), or text notes. AssignmentReady will automatically extract sections, key findings, and figures into an editable outline.
            </p>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-academic-navy hover:bg-academic-indigo shadow-xs">
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Document Structure...</span>
                </>
              ) : (
                <span>Choose Document</span>
              )}
            </span>
          </div>

          <div className="text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">or</span>
          </div>

          {/* Quick Start Sample Outline */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-academic-blue" />
                <span>Start with Pre-Loaded Academic Research Outline</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Test all 8 themes, interactive layouts, and editable PowerPoint features immediately with an 8-slide research deck.
              </p>
            </div>
            <button
              onClick={() => {
                setOutline(SAMPLE_OUTLINE);
                setCustomFilename('Generative_AI_Higher_Ed_Deck');
                setCurrentStep(2);
              }}
              className="px-4 py-2 text-xs font-bold text-academic-navy bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              Load Sample Deck
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 2: REVIEW EXTRACTED CONTENT & OUTLINE */}
      {/* ==================================================== */}
      {currentStep === 2 && (
        <div className="space-y-8">
          {/* Presentation Metadata */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-academic-blue" />
              <span>Presentation Title & Academic Header</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Presentation Title</label>
                <input
                  type="text"
                  value={outline.title}
                  onChange={(e) => setOutline({ ...outline, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-academic-blue bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subtitle / Scope</label>
                <input
                  type="text"
                  value={outline.subtitle}
                  onChange={(e) => setOutline({ ...outline, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-academic-blue bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Presenter / Author</label>
                <input
                  type="text"
                  value={outline.author}
                  onChange={(e) => setOutline({ ...outline, author: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-academic-blue bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Institution / Faculty</label>
                <input
                  type="text"
                  value={outline.institution}
                  onChange={(e) => setOutline({ ...outline, institution: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-academic-blue bg-white"
                />
              </div>
            </div>
          </div>

          {/* Slide Outline Editor */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Slide Structure & Layouts ({outline.slides.length + 1} Total Slides)
                </h3>
                <p className="text-xs text-slate-500">
                  Customize slide titles, assign rich layouts (comparison, metrics, workflow), and edit bullet points.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSlide}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-academic-navy hover:bg-academic-indigo transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>
            </div>

            <div className="space-y-4">
              {outline.slides.map((slide, sIdx) => (
                <div
                  key={sIdx}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-blue-50 text-academic-blue text-xs font-bold flex items-center justify-center border border-blue-200">
                        {sIdx + 2}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Slide {sIdx + 2}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Layout: {SLIDE_TYPE_OPTIONS.find((o) => o.value === slide.slide_type)?.label || 'Content Card'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveSlide(sIdx, 'up')}
                        disabled={sIdx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded cursor-pointer"
                        title="Move slide up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveSlide(sIdx, 'down')}
                        disabled={sIdx === outline.slides.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded cursor-pointer"
                        title="Move slide down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(sIdx)}
                        className="p-1 text-rose-400 hover:text-rose-600 rounded ml-2 cursor-pointer"
                        title="Delete slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Slide Heading
                        </label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => handleUpdateSlide(sIdx, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-academic-blue bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Slide Layout Engine
                        </label>
                        <select
                          value={slide.slide_type || 'content'}
                          onChange={(e) => handleUpdateSlide(sIdx, 'slide_type', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-academic-blue bg-white"
                        >
                          {SLIDE_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Bullet Points */}
                    {slide.slide_type !== 'qa_closing' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Slide Bullet Content
                        </label>
                        <div className="space-y-2">
                          {slide.bullets.map((bullet, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2">
                              <span className="text-academic-blue font-bold text-sm">•</span>
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => handleUpdateBullet(sIdx, bIdx, e.target.value)}
                                className="flex-1 px-3 py-1.5 text-xs text-slate-700 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-academic-blue bg-white"
                              />
                              <button
                                onClick={() => handleRemoveBullet(sIdx, bIdx)}
                                className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                                title="Remove point"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddBullet(sIdx)}
                          className="mt-2 text-xs font-semibold text-academic-blue hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Bullet Point</span>
                        </button>
                      </div>
                    )}

                    {/* Speaker Notes */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Presenter Talking Notes
                      </label>
                      <input
                        type="text"
                        value={slide.notes || ''}
                        onChange={(e) => handleUpdateSlide(sIdx, 'notes', e.target.value)}
                        placeholder="Key talking points for presenter notes view..."
                        className="w-full px-3 py-1.5 text-xs text-slate-600 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-academic-blue bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Upload</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-academic-navy hover:bg-academic-indigo text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>Continue to Theme & Settings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 3: SELECT THEME & PRESENTATION SETTINGS */}
      {/* ==================================================== */}
      {currentStep === 3 && (
        <div className="space-y-8">
          {/* Theme Selector Grid (8 Themes) */}
          <div>
            <div className="mb-4">
              <h3 className="font-bold text-base text-slate-900">Choose Presentation Theme (8 Academic Styles)</h3>
              <p className="text-xs text-slate-500">
                Select an institutional color scheme and typography pairing for your 16:9 PowerPoint deck.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DEFAULT_THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-academic-blue bg-white ring-2 ring-academic-blue/30 shadow-md scale-[1.02]'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Swatch & Dark Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="w-6 h-6 rounded-md shadow-2xs border border-black/10"
                          style={{ backgroundColor: theme.primary_color }}
                        ></span>
                        <span
                          className="w-6 h-6 rounded-md shadow-2xs border border-black/10"
                          style={{ backgroundColor: theme.accent_color }}
                        ></span>
                        {theme.is_dark && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                            DARK
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">{theme.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {theme.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>{theme.font_title}</span>
                      {isSelected && <span className="text-academic-blue font-bold">Selected</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Presentation Parameters & Settings */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-academic-blue" />
              <span>Presentation Parameters & Density</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-academic-blue" />
                  <span>Audience Target</span>
                </label>
                <select
                  value={outline.audience || 'academic'}
                  onChange={(e) => setOutline({ ...outline, audience: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-academic-blue bg-white"
                >
                  <option value="academic">University Academic Seminar</option>
                  <option value="conference">Conference Presentation</option>
                  <option value="defense">Viva / Dissertation Defense</option>
                  <option value="general">General Audience</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-academic-blue" />
                  <span>Presentation Duration</span>
                </label>
                <select
                  value={outline.duration_minutes || 15}
                  onChange={(e) => setOutline({ ...outline, duration_minutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-academic-blue bg-white"
                >
                  <option value={5}>5 Minutes (Lightning Talk)</option>
                  <option value={10}>10 Minutes (Standard Seminar)</option>
                  <option value={15}>15 Minutes (Coursework Demo)</option>
                  <option value={20}>20 Minutes (Final Project Defense)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Text Density</label>
                <select
                  value={outline.text_density || 'balanced'}
                  onChange={(e) => setOutline({ ...outline, text_density: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-academic-blue bg-white"
                >
                  <option value="concise">Concise (3 Punchy Bullets)</option>
                  <option value="balanced">Balanced (4 Explanatory Points)</option>
                  <option value="detailed">Detailed (5 Comprehensive Points)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={outline.include_notes ?? true}
                  onChange={(e) => setOutline({ ...outline, include_notes: e.target.checked })}
                  className="rounded text-academic-blue focus:ring-academic-blue"
                />
                <span className="font-medium">Include Speaker Talking Notes in Slides</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={outline.include_references ?? true}
                  onChange={(e) => setOutline({ ...outline, include_references: e.target.checked })}
                  className="rounded text-academic-blue focus:ring-academic-blue"
                />
                <span className="font-medium">Include Academic Bibliography Slide</span>
              </label>
            </div>
          </div>

          {/* Export Filename & Generate Action Bar */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-base text-white">Generate 16:9 PowerPoint Deck</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Outputs genuine editable OpenXML vector shapes, cards, and text boxes compatible with Microsoft PowerPoint & Google Slides.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <input
                type="text"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder="Filename"
                className="px-3 py-2 text-xs rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-1 focus:ring-academic-blue max-w-[200px]"
              />
              <button
                type="button"
                onClick={handleGenerateDeck}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all shrink-0 cursor-pointer"
              >
                <span>Generate Presentation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Back */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Outline</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 4: RENDERING PROGRESS */}
      {/* ==================================================== */}
      {currentStep === 4 && (
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-academic-blue flex items-center justify-center animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Synthesizing PowerPoint Slides...</h3>
          <p className="text-xs text-slate-500">
            Applying {activeThemeObj.name} palette, formatting vector cards, and embedding speaker notes.
          </p>
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 5: PREVIEW & REVISE */}
      {/* ==================================================== */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-academic-blue" />
                <span>Interactive Slide Preview & Verification</span>
              </h3>
              <p className="text-xs text-slate-500">
                Review the rendered 16:9 slides, vector shapes, layout structures, and speaker notes before downloading.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold text-white bg-academic-navy hover:bg-academic-indigo shadow-sm cursor-pointer"
            >
              <span>Proceed to Download</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Slide Stage Preview (16:9 Aspect Ratio) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Stage Slide */}
            <div className="lg:col-span-3 space-y-4">
              <div
                className="aspect-video w-full rounded-2xl border border-slate-300 shadow-lg p-8 flex flex-col justify-between relative overflow-hidden"
                style={{
                  backgroundColor: activeThemeObj.is_dark ? '#0F172A' : '#FFFFFF',
                  color: activeThemeObj.is_dark ? '#F8FAFC' : '#0F172A',
                }}
              >
                {/* Accent Top Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: activeThemeObj.accent_color }}
                />

                {/* Slide Content Header */}
                <div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider block mb-1"
                    style={{ color: activeThemeObj.accent_color }}
                  >
                    {previewSlideIdx === 0
                      ? 'TITLE SLIDE'
                      : outline.slides[previewSlideIdx - 1]?.category?.toUpperCase() || `SECTION ${previewSlideIdx}`}
                  </span>
                  <h2
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                    style={{
                      fontFamily: activeThemeObj.font_title,
                      color: activeThemeObj.is_dark ? '#F8FAFC' : activeThemeObj.primary_color,
                    }}
                  >
                    {previewSlideIdx === 0
                      ? outline.title
                      : outline.slides[previewSlideIdx - 1]?.title}
                  </h2>
                  <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-700 my-3" />
                </div>

                {/* Slide Body Stage */}
                <div className="flex-1 py-2">
                  {previewSlideIdx === 0 ? (
                    <div className="space-y-4 pt-4">
                      <p className="text-base text-slate-500 font-medium">{outline.subtitle}</p>
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 inline-block text-xs space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-100">Presenter: {outline.author}</p>
                        <p className="text-slate-500">{outline.institution}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 h-full flex flex-col justify-around">
                      {outline.slides[previewSlideIdx - 1]?.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2.5 text-sm sm:text-base">
                          <span style={{ color: activeThemeObj.accent_color }} className="font-bold">•</span>
                          <span className={activeThemeObj.is_dark ? 'text-slate-200' : 'text-slate-700'}>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Slide Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{outline.title}</span>
                  <span>Slide {previewSlideIdx + 1} of {outline.slides.length + 1}</span>
                </div>
              </div>

              {/* Speaker Notes Drawer */}
              {previewSlideIdx > 0 && outline.slides[previewSlideIdx - 1]?.notes && (
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-1">Speaker Talking Notes:</span>
                  <p>{outline.slides[previewSlideIdx - 1]?.notes}</p>
                </div>
              )}
            </div>

            {/* Slide Thumbnails Column */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                All Slides ({outline.slides.length + 1})
              </span>

              {/* Title Slide Thumbnail */}
              <button
                type="button"
                onClick={() => setPreviewSlideIdx(0)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  previewSlideIdx === 0
                    ? 'border-academic-blue bg-blue-50/50 ring-2 ring-academic-blue/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span>Slide 1 (Title)</span>
                  <span className="w-2 h-2 rounded-full bg-academic-blue"></span>
                </div>
                <p className="text-xs font-bold text-slate-800 truncate">{outline.title}</p>
              </button>

              {/* Content Slides Thumbnails */}
              {outline.slides.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewSlideIdx(idx + 1)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    previewSlideIdx === idx + 1
                      ? 'border-academic-blue bg-blue-50/50 ring-2 ring-academic-blue/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span>Slide {idx + 2}</span>
                    <span className="text-[10px] font-normal text-slate-400 truncate max-w-[80px]">
                      {s.category || 'Content'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate">{s.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Adjust Theme or Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-academic-navy hover:bg-academic-indigo text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>Download PowerPoint (.pptx)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 6: DOWNLOAD PPTX */}
      {/* ==================================================== */}
      {currentStep === 6 && downloadInfo && (
        <div className="max-w-xl mx-auto p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Presentation Ready for Download
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {downloadInfo.filename}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {downloadInfo.total_slides} Widescreen (16:9) Slides • Theme: {activeThemeObj.name}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Full OpenXML Editable Compatibility</span>
            </div>
            <p className="text-slate-500 pl-6 leading-relaxed">
              Every slide contains genuine PowerPoint vector shapes, cards, and text boxes. You can edit text, recolor elements, swap images, or present directly in Microsoft PowerPoint, Google Slides, or Keynote.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={downloadInfo.download_url}
              download={downloadInfo.filename}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-academic-navy hover:bg-academic-indigo shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PowerPoint (.pptx)</span>
            </a>

            <button
              onClick={() => setCurrentStep(5)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Preview Slides Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
