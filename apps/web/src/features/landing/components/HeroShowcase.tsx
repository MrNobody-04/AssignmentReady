import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  FileCheck,
  FileType,
  Layers,
  Presentation,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowRight,
  RefreshCw,
  Award,
} from 'lucide-react';

interface HeroShowcaseProps {
  onStartFormatting: () => void;
  onCreatePresentation: () => void;
}

interface SceneMeta {
  id: number;
  label: string;
  tag: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const SCENES: SceneMeta[] = [
  {
    id: 0,
    label: 'Assignment Formatter',
    tag: 'Typography & Layout',
    title: 'Academic Assignment Formatter',
    description: 'Converts unstyled drafts into strictly compliant university submissions with standardized typography, 1-inch margins, and dynamic headers.',
    icon: FileText,
  },
  {
    id: 1,
    label: 'PDF to Word',
    tag: 'Document Conversion',
    title: 'PDF to Word Conversion',
    description: 'Extracts locked assignment briefs, handouts, and research papers into fully editable Microsoft Word (.docx) files.',
    icon: FileType,
  },
  {
    id: 2,
    label: 'Cover Page',
    tag: 'Institutional Templates',
    title: 'Official Cover Page Integration',
    description: 'Generates or replaces generic title pages with formal university cover sheets while keeping body sections intact.',
    icon: Layers,
  },
  {
    id: 3,
    label: 'Report to Slides',
    tag: 'Slide Synthesis',
    title: 'Report to PowerPoint Decks',
    description: 'Synthesizes assignment headings and key takeaways into 16:9 widescreen PowerPoint presentation decks.',
    icon: Presentation,
  },
  {
    id: 4,
    label: 'Compliance Audit',
    tag: 'Deterministic Audit',
    title: 'Institutional Compliance Auditor',
    description: 'Inspects typography, margins, heading hierarchy, and mandatory sections against 18 deterministic university rules.',
    icon: FileCheck,
  },
];

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  onStartFormatting,
  onCreatePresentation,
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Auto-rotation timer
  useEffect(() => {
    if (prefersReducedMotion || !isPlaying || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % SCENES.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, prefersReducedMotion]);

  // Pause on page hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleNext = () => {
    setCurrentScene((prev) => (prev + 1) % SCENES.length);
  };

  const handlePrev = () => {
    setCurrentScene((prev) => (prev - 1 + SCENES.length) % SCENES.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
  };

  const activeMeta = SCENES[currentScene];

  return (
    <div
      className="relative w-full max-w-5xl mx-auto focus:outline-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="AssignmentReady Feature Showcase"
    >
      {/* Top Workflow Tabs Navigation */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none w-full">
        <div className="flex items-center gap-1.5 p-1 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-2xs overflow-x-auto scrollbar-none">
          {SCENES.map((scene, idx) => {
            const Icon = scene.icon;
            const isActive = currentScene === idx;
            return (
              <button
                key={scene.id}
                onClick={() => setCurrentScene(idx)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
                aria-selected={isActive}
                role="tab"
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{scene.label}</span>
              </button>
            );
          })}
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handlePrev}
            className="p-1.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-all"
            title="Previous"
            aria-label="Previous"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-all"
            title="Next"
            aria-label="Next"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Showcase Stage */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden transition-all duration-300 min-h-[440px] flex flex-col justify-between">
        {/* Modern Workflow Header Strip (Replaced Demonstration 1 of 5 & Live Simulation) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-50/90 border-b border-slate-200/80">
          <div className="flex items-center gap-2 sm:gap-2.5 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/80 font-bold text-indigo-700 uppercase tracking-wider text-[10px]">
              Workflow
            </span>
            <span className="text-slate-300 select-none">•</span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              {activeMeta.title}
            </span>
            <span className="hidden sm:inline text-slate-400 font-normal text-xs">
              — {activeMeta.tag}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span className="text-slate-900 font-bold">{currentScene + 1}</span>
            <span>/</span>
            <span>{SCENES.length}</span>
          </div>
        </div>

        {/* Dynamic Scene Visual Area */}
        <div className="p-5 sm:p-7 flex-1 flex items-center justify-center">
          {/* ==================================================== */}
          {/* SCENE 0: ASSIGNMENT FORMATTING (BEFORE & AFTER) */}
          {/* ==================================================== */}
          {currentScene === 0 && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              {/* Left: Raw Draft */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Unformatted Raw Draft
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Calibri 11 • 0pt margins</span>
                  </div>
                  <div className="space-y-2.5 text-xs text-slate-600 opacity-80 leading-relaxed font-sans">
                    <div className="font-bold text-xs text-slate-800">
                      1. Introduction to Machine Learning in Healthcare
                    </div>
                    <p className="line-clamp-3 text-[11px]">
                      Recently large language models and predictive diagnostics have seen rapid adoption. However, drafts often fail institutional typography and margin constraints required by grading rubrics.
                    </p>
                    <div className="font-bold text-xs text-slate-800 pt-1">
                      1.1 Technical Limitations
                    </div>
                    <p className="line-clamp-2 text-[11px]">
                      Inconsistent line height, raw URLs instead of references, and missing section breaks.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-rose-600 font-medium">
                  <span>❌ Irregular Margin Spacing</span>
                  <span>❌ Inconsistent Heading Depth</span>
                </div>
              </div>

              {/* Right: Formatted Document */}
              <div className="p-4 sm:p-5 rounded-xl bg-white border-2 border-indigo-500/40 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-50/60 rounded-full blur-xl pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Compliant Word XML Document
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Times New Roman 12pt • 1.5 Spacing
                    </span>
                  </div>
                  <div className="space-y-2.5 font-serif text-xs text-slate-800 leading-relaxed">
                    <div className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-1">
                      1.0 Introduction to Machine Learning in Healthcare
                    </div>
                    <p className="text-justify indent-5 text-[11.5px] text-slate-700">
                      Recently, large language models and predictive diagnostics have seen rapid adoption across healthcare institutions. Submissions now adhere strictly to official font requirements, standard 1.0-inch margins, and structured heading styles.
                    </p>
                    <div className="font-bold text-xs text-slate-900 pt-0.5">
                      1.1 Technical Limitations & Validation
                    </div>
                    <p className="text-justify indent-5 text-[11.5px] text-slate-700">
                      Standardized line spacing, automated section breaks, dynamic table of contents, and continuous section-aware page numbering.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">✓ 1.0" Uniform Margins</span>
                  <span className="flex items-center gap-1">✓ Dynamic Section Breaks</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE 1: PDF TO WORD CONVERSION */}
          {/* ==================================================== */}
          {currentScene === 1 && (
            <div className="w-full max-w-2xl py-3 flex flex-col items-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 w-full">
                {/* Source PDF Card */}
                <div className="w-48 p-4 bg-white rounded-xl border border-red-200/90 shadow-xs flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-2.5">
                    <FileType className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-800 mb-0.5">Course_Brief.pdf</span>
                  <span className="text-[10px] text-slate-400">Locked PDF Document</span>
                  <div className="mt-3 w-full py-1 rounded bg-red-50 text-red-700 text-[10px] font-semibold">
                    Read-Only Format
                  </div>
                </div>

                {/* Conversion Flow Animation */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200/90 flex items-center justify-center text-indigo-600 shadow-2xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" style={{ animationDuration: '6s' }} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 tracking-tight">
                    Deterministic Extraction
                  </span>
                  <span className="text-[10px] text-slate-400">Headings • Tables • Text</span>
                </div>

                {/* Target Word Document Card */}
                <div className="w-48 p-4 bg-white rounded-xl border-2 border-indigo-500/40 shadow-xs flex flex-col items-center text-center relative">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-800 mb-0.5">Course_Brief.docx</span>
                  <span className="text-[10px] text-slate-400">Microsoft Word XML</span>
                  <div className="mt-3 w-full py-1 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Editable OpenXML</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-center max-w-md text-xs text-slate-600">
                Preserves paragraph flow, heading hierarchy, and embedded tables without third-party subscriptions.
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE 2: COVER PAGE REPLACEMENT */}
          {/* ==================================================== */}
          {currentScene === 2 && (
            <div className="w-full max-w-2xl py-2 flex flex-col items-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full items-center">
                {/* 1. Old Cover Page */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center opacity-70 w-full max-w-xs mx-auto md:max-w-none">
                  <span className="text-xs font-semibold text-rose-500 mb-2">Original AI Cover</span>
                  <div className="w-full h-32 bg-white border border-dashed border-slate-300 rounded-lg p-2.5 flex flex-col justify-between text-left text-[10px] text-slate-400">
                    <div className="font-bold text-slate-600">Assignment Title</div>
                    <div className="space-y-0.5 text-[9px]">
                      <div>Name: Candidate</div>
                      <div>Date: 2026</div>
                    </div>
                  </div>
                  <span className="mt-1.5 text-[10px] text-slate-400">Missing institutional details</span>
                </div>

                {/* 2. Arrow Action */}
                <div className="flex flex-col items-center justify-center py-1">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-2xs border border-indigo-100">
                    <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0 transition-transform duration-300" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-1 whitespace-nowrap">Template Replacement</span>
                  <span className="text-[10px] text-slate-400 text-center">Body paragraphs intact</span>
                </div>

                {/* 3. Official University Template */}
                <div className="p-3.5 rounded-xl bg-white border-2 border-indigo-600 shadow-sm flex flex-col items-center text-center w-full max-w-xs mx-auto md:max-w-none">
                  <span className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    Official Faculty Cover
                  </span>
                  <div className="w-full h-32 bg-gradient-to-b from-indigo-50/40 to-white border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between text-left text-[10px] text-slate-700">
                    <div className="border-b border-indigo-900/20 pb-1">
                      <div className="font-bold text-indigo-950 text-[10px]">FACULTY OF COMPUTING</div>
                      <div className="text-[8.5px] text-slate-500">School of Engineering</div>
                    </div>
                    <div className="font-serif font-bold text-slate-900 text-[11px] leading-tight">
                      Coursework Report
                    </div>
                    <div className="space-y-0.5 text-[8px] text-slate-600">
                      <div>Student ID: 20268491</div>
                      <div>Module: CS-408</div>
                    </div>
                  </div>
                  <span className="mt-1.5 text-[10px] font-semibold text-emerald-600">Faculty Standards Met</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE 3: REPORT TO POWERPOINT */}
          {/* ==================================================== */}
          {currentScene === 3 && (
            <div className="w-full py-2 flex flex-col items-center">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                {/* Slide 1 */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between h-36">
                  <div className="w-full h-1 bg-indigo-600 rounded mb-1" />
                  <div>
                    <span className="text-[9px] font-bold text-indigo-600 uppercase">Title Slide</span>
                    <h5 className="font-bold text-xs text-slate-900 mt-1 leading-snug">AI in Higher Education</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">Sujan G.C. • University</p>
                  </div>
                  <span className="text-[8.5px] text-slate-400">Slide 1 / 4</span>
                </div>

                {/* Slide 2 */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between h-36">
                  <div className="w-full h-1 bg-teal-600 rounded mb-1" />
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Context & Problem</span>
                    <ul className="text-[8.5px] text-slate-600 mt-1 space-y-0.5 list-disc list-inside">
                      <li>Generative adoption</li>
                      <li>Inconsistent formatting</li>
                      <li>Rubric mismatch</li>
                    </ul>
                  </div>
                  <span className="text-[8.5px] text-slate-400">Slide 2 / 4</span>
                </div>

                {/* Slide 3 */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between h-36">
                  <div className="w-full h-1 bg-amber-500 rounded mb-1" />
                  <div>
                    <span className="text-[9px] font-bold text-amber-600 uppercase">Key Metrics</span>
                    <div className="my-1 p-1 rounded bg-slate-50 border border-slate-100 text-center">
                      <span className="font-bold text-xs text-slate-900">88%</span>
                      <p className="text-[7.5px] text-slate-500">Time Saved</p>
                    </div>
                  </div>
                  <span className="text-[8.5px] text-slate-400">Slide 3 / 4</span>
                </div>

                {/* Slide 4 */}
                <div className="p-3 bg-white rounded-xl border-2 border-indigo-400 shadow-xs flex flex-col justify-between h-36">
                  <div className="w-full h-1 bg-emerald-500 rounded mb-1" />
                  <div>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">Conclusion</span>
                    <div className="text-[8.5px] text-slate-700 mt-1 space-y-0.5">
                      <p className="font-medium">✓ Compliant export</p>
                      <p className="text-slate-500">✓ Editable vector shapes</p>
                    </div>
                  </div>
                  <span className="text-[8.5px] text-emerald-600 font-semibold">16:9 Presentation Ready</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">4 Slide Palettes:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px]">Academic Navy</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px]">Minimal Slate</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px]">High Contrast Dark</span>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE 4: COMPLIANCE CHECKER */}
          {/* ==================================================== */}
          {currentScene === 4 && (
            <div className="w-full max-w-2xl py-2 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 pb-2.5 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Institutional Audit Protocol</h4>
                  <span className="text-[11px] text-slate-500">Deterministic verification against university standards</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1 sm:justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      All Rules Passed
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">6 of 6 checks verified</span>
                  </div>
                  <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden shrink-0">
                    <div className="w-full h-full bg-emerald-600 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { name: 'Font Typography', desc: 'Times New Roman 12pt throughout body' },
                  { name: 'Heading Hierarchy', desc: 'Distinct 16pt / 14pt heading styles' },
                  { name: 'Paragraph Line Spacing', desc: 'Standard 1.5 spacing with 6pt space after' },
                  { name: 'Page Margins', desc: '1.0 inch (2.54cm) top, bottom, left, right' },
                  { name: 'Page Numbering', desc: 'Bottom-right, restarts at Introduction' },
                  { name: 'Mandatory Sections', desc: 'Introduction, Conclusion, and References found' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-left"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{item.name}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Callout & Action Strip */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              {activeMeta.title}
            </h4>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed mt-0.5">
              {activeMeta.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentScene === 3 ? (
              <button
                onClick={onCreatePresentation}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0"
              >
                <span>Create a Presentation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onStartFormatting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0"
              >
                <span>Start Formatting</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
