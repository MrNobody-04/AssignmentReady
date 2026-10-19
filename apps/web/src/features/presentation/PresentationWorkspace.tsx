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
  ChevronLeft,
  AlertCircle,
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
    id: 'academic_classic',
    name: 'Academic Classic',
    description: 'Deep navy and warm amber accents with serif headings.',
    is_dark: false,
    primary_color: '#1E3A8A',
    accent_color: '#B45309',
    font_title: 'Georgia',
  },
  {
    id: 'modern_minimal',
    name: 'Modern Minimal',
    description: 'Clean layout with slate tones and vibrant indigo highlights.',
    is_dark: false,
    primary_color: '#0F172A',
    accent_color: '#4F46E5',
    font_title: 'Segoe UI',
  },
  {
    id: 'corporate_blue',
    name: 'Corporate Blue',
    description: 'Crisp corporate styling with vibrant blue accents.',
    is_dark: false,
    primary_color: '#0A2540',
    accent_color: '#0066CC',
    font_title: 'Arial',
  },
  {
    id: 'research_presentation',
    name: 'Research Presentation',
    description: 'Scholarly deep teal and sage accents for research presentations.',
    is_dark: false,
    primary_color: '#0F766E',
    accent_color: '#0D9488',
    font_title: 'Trebuchet MS',
  },
  {
    id: 'dark_professional',
    name: 'Dark Professional',
    description: 'Sleek dark slate background with glowing cyan typography.',
    is_dark: true,
    primary_color: '#0F172A',
    accent_color: '#06B6D4',
    font_title: 'Segoe UI',
  },
];

const SAMPLE_OUTLINE: PresentationOutline = {
  title: 'Generative AI in Higher Education',
  subtitle: 'Institutional Guidelines, Assessment Integrity & Practical Applications',
  author: 'Sujan G.C.',
  institution: 'Department of Computer Science',
  slides: [
    {
      title: 'Context & Executive Overview',
      category: 'Introduction',
      bullets: [
        'Rapid adoption of generative AI tools (ChatGPT, Gemini) across student cohorts.',
        'Widespread discrepancies in meeting institutional typography and rubric standards.',
        'Need for deterministic document processing pipelines without proprietary API lock-in.',
      ],
      slide_type: 'content',
    },
    {
      title: 'Methodology & Technical Approach',
      category: 'Methods',
      bullets: [
        'OpenXML document parsing and OpenPyXL tabular validation.',
        'Section-aware document pagination with separate Roman prelim numerals.',
        'Deterministic rule engine to verify margins, font hierarchy, and required sections.',
      ],
      slide_type: 'content',
    },
    {
      title: 'Key Findings & Evaluation',
      category: 'Analysis',
      bullets: [
        '92% reduction in student time spent on mechanical formatting compliance.',
        '100% adherence to institutional cover pages and departmental rubrics.',
        'Complete client-side privacy preservation with automated temporary file cleanup.',
      ],
      slide_type: 'content',
    },
    {
      title: 'Recommendations & Future Work',
      category: 'Conclusion',
      bullets: [
        'Adopt automated compliance checking in university submission portals.',
        'Provide standardized OpenXML template registries for all academic departments.',
        'Encourage open-source formatting solutions over expensive commercial software.',
      ],
      slide_type: 'conclusion',
    },
  ],
};

export const PresentationWorkspace: React.FC<PresentationWorkspaceProps> = ({
  initialFile,
  onBackToLanding,
  onOpenWorkspace: _onOpenWorkspace,
}) => {
  const [step, setStep] = useState<'upload' | 'outline' | 'generate'>('upload');
  const [outline, setOutline] = useState<PresentationOutline>(SAMPLE_OUTLINE);
  const [selectedTheme, setSelectedTheme] = useState<string>('academic_classic');
  const [customFilename, setCustomFilename] = useState<string>('Research_Presentation');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<{
    filename: string;
    download_url: string;
    total_slides: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-extract if initialFile is supplied
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
      setStep('outline');
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

  const handleUpdateSlideTitle = (idx: number, title: string) => {
    const updated = [...outline.slides];
    updated[idx].title = title;
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
    setIsGenerating(true);
    setErrorMessage(null);
    setDownloadInfo(null);
    try {
      const res = await generatePresentation(
        outline,
        selectedTheme,
        customFilename.trim()
      );
      setDownloadInfo(res);
      setStep('generate');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate presentation deck.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
          <div>
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Main Menu</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Presentation className="w-7 h-7 text-academic-teal" />
              <span>PowerPoint Presentation Generator</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Transform assignment reports, research papers, and notes into editable 16:9 PowerPoint (.pptx) decks.
            </p>
          </div>

          {/* Workflow Steps Indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                step === 'upload' ? 'bg-academic-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              1. Source
            </button>
            <button
              onClick={() => setStep('outline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                step === 'outline' ? 'bg-academic-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              2. Review Outline
            </button>
            <button
              onClick={() => downloadInfo && setStep('generate')}
              disabled={!downloadInfo}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                step === 'generate' ? 'bg-academic-teal text-white shadow-xs' : 'bg-slate-100 text-slate-400'
              }`}
            >
              3. Download Deck
            </button>
          </div>
        </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Step Content */}

      {/* ==================================================== */}
      {/* STEP 1: UPLOAD SOURCE OR USE SAMPLE */}
      {/* ==================================================== */}
      {step === 'upload' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-academic-teal rounded-2xl p-10 text-center cursor-pointer bg-slate-50/50 hover:bg-white transition-all shadow-xs"
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
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-academic-teal flex items-center justify-center mb-4 border border-teal-100">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Upload Document to Convert to Presentation
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Select your Word (.docx) document, PDF report, or text notes to automatically extract slide structure.
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-academic-navy hover:bg-academic-indigo shadow-xs">
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting Slide Outline...</span>
                </>
              ) : (
                <span>Choose Document</span>
              )}
            </span>
          </div>

          <div className="text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">or</span>
          </div>

          {/* Quick Start with Sample */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-academic-teal" />
                <span>Start with Sample Academic Outline</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Load a pre-configured 4-slide research deck to test themes and PowerPoint generation instantly.
              </p>
            </div>
            <button
              onClick={() => {
                setOutline(SAMPLE_OUTLINE);
                setCustomFilename('Generative_AI_Higher_Ed_Deck');
                setStep('outline');
              }}
              className="px-4 py-2 text-xs font-bold text-academic-navy bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
            >
              Use Sample
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 2: REVIEW & EDIT OUTLINE + THEMES */}
      {/* ==================================================== */}
      {step === 'outline' && (
        <div className="space-y-8">
          {/* Metadata Bar */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Presentation Title & Meta
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Presentation Title
                </label>
                <input
                  type="text"
                  value={outline.title}
                  onChange={(e) => setOutline({ ...outline, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-academic-teal bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Subtitle / Department
                </label>
                <input
                  type="text"
                  value={outline.subtitle}
                  onChange={(e) => setOutline({ ...outline, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-academic-teal bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Presenter / Author
                </label>
                <input
                  type="text"
                  value={outline.author}
                  onChange={(e) => setOutline({ ...outline, author: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-academic-teal bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Institution / Faculty
                </label>
                <input
                  type="text"
                  value={outline.institution}
                  onChange={(e) => setOutline({ ...outline, institution: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-academic-teal bg-white"
                />
              </div>
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Choose Presentation Theme</h3>
                <p className="text-xs text-slate-500">
                  Select an academic color scheme and font pairing for your PowerPoint slides.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {DEFAULT_THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-academic-teal bg-white ring-2 ring-academic-teal/40 shadow-md scale-[1.02]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Color Preview Swatch */}
                      <div className="flex items-center gap-1.5 mb-3">
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
                      {isSelected && <span className="text-academic-teal font-bold">Selected</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slide Outline Editor */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Slide Structure ({outline.slides.length + 1} Total Slides)
                </h3>
                <p className="text-xs text-slate-500">
                  Review and customize the extracted slide titles and bullet points.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSlide}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-academic-navy hover:bg-academic-indigo transition-colors"
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
                      <span className="w-6 h-6 rounded-md bg-teal-50 text-academic-teal text-xs font-bold flex items-center justify-center border border-teal-200">
                        {sIdx + 2}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Slide {sIdx + 2}
                      </span>
                      {slide.slide_type === 'conclusion' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Conclusion Card
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveSlide(sIdx, 'up')}
                        disabled={sIdx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                        title="Move slide up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveSlide(sIdx, 'down')}
                        disabled={sIdx === outline.slides.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                        title="Move slide down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(sIdx)}
                        className="p-1 text-rose-400 hover:text-rose-600 rounded ml-2"
                        title="Delete slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Slide Heading
                      </label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleUpdateSlideTitle(sIdx, e.target.value)}
                        className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-academic-teal bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Bullet Points
                      </label>
                      <div className="space-y-2">
                        {slide.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2">
                            <span className="text-academic-teal font-bold text-sm">•</span>
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) => handleUpdateBullet(sIdx, bIdx, e.target.value)}
                              className="flex-1 px-3 py-1.5 text-xs text-slate-700 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-academic-teal bg-white"
                            />
                            <button
                              onClick={() => handleRemoveBullet(sIdx, bIdx)}
                              className="text-slate-400 hover:text-rose-500 p-1"
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
                        className="mt-2 text-xs font-semibold text-academic-teal hover:text-academic-teal-dark flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add bullet point</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Card */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="font-bold text-base text-white">Ready to Generate PowerPoint (.pptx)</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Outputs an editable 16:9 widescreen presentation compatible with Microsoft PowerPoint, Google Slides, and Apple Keynote.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <input
                type="text"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder="Filename"
                className="px-3 py-2 text-xs rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-1 focus:ring-academic-teal max-w-[200px]"
              />
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateDeck}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all shrink-0"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-academic-teal" />
                    <span>Rendering Slides...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Presentation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 3: DECK READY & DOWNLOAD */}
      {/* ==================================================== */}
      {step === 'generate' && downloadInfo && (
        <div className="max-w-xl mx-auto p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Presentation Ready
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {downloadInfo.filename}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {downloadInfo.total_slides} Widescreen Slides Rendered • Theme: {selectedTheme}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Full OpenXML compatibility</span>
            </div>
            <p className="text-slate-500 pl-6">
              You can edit texts, swap shapes, apply university slide masters, and present immediately.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={downloadInfo.download_url}
              download={downloadInfo.filename}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white bg-academic-teal hover:bg-academic-teal-dark shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PowerPoint (.pptx)</span>
            </a>

            <button
              onClick={() => setStep('outline')}
              className="w-full sm:w-auto px-4 py-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Adjust Slides or Theme
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
