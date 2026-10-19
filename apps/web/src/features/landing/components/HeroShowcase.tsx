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
    label: 'Formatting',
    tag: 'Typography & Layout',
    title: 'Assignment Formatting',
    description: 'Transform unformatted AI drafts into compliant academic submissions with exact typography, spacing, and margins.',
    icon: FileText,
  },
  {
    id: 1,
    label: 'PDF to Word',
    tag: 'Document Conversion',
    title: 'PDF to Word Conversion',
    description: 'Convert locked PDF course guidelines or reports into clean, fully editable Microsoft Word (.docx) files.',
    icon: FileType,
  },
  {
    id: 2,
    label: 'Cover Page',
    tag: 'Institutional Templates',
    title: 'Cover Page Replacement',
    description: 'Replace generic covers with official college templates while preserving all body paragraphs and formatting.',
    icon: Layers,
  },
  {
    id: 3,
    label: 'Report to PPT',
    tag: 'Slide Synthesis',
    title: 'Report to PowerPoint',
    description: 'Convert assignment reports and research papers into editable PowerPoint presentation decks in 5 themes.',
    icon: Presentation,
  },
  {
    id: 4,
    label: 'Compliance',
    tag: 'Rule-Based Audit',
    title: 'Assignment Compliance Checker',
    description: 'Inspect typography, headings, margins, pagination, and required sections with real-time academic validation.',
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
    }, 4500);

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

  // Keyboard navigation
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
      aria-label="AssignmentReady Interactive Feature Showcase"
    >
      {/* Top Scene Tabs Navigation */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none flex-nowrap w-full">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-inner shrink-0">
          {SCENES.map((scene, idx) => {
            const Icon = scene.icon;
            const isActive = currentScene === idx;
            return (
              <button
                key={scene.id}
                onClick={() => setCurrentScene(idx)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-academic-navy shadow-sm border border-slate-200/80 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                aria-selected={isActive}
                role="tab"
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{scene.label}</span>
              </button>
            );
          })}
        </div>

        {/* Carousel Play/Pause & Nav Arrows */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handlePrev}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            title="Previous feature"
            aria-label="Previous feature"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            title="Next feature"
            aria-label="Next feature"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Showcase Stage */}
      <div className="relative bg-white rounded-2xl border border-slate-200/80 border-t-2 border-t-indigo-600 shadow-xl overflow-hidden transition-all duration-500 min-h-[460px] flex flex-col justify-between">
        {/* Top Header Strip */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50/80 border-b border-slate-200/80">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="font-bold text-slate-900">Demonstration {currentScene + 1} of 5</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">{activeMeta.tag}</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            Live Simulation
          </span>
        </div>

        {/* Dynamic Scene Visual Area */}
        <div className="p-6 md:p-8 flex-1 flex items-center justify-center">
          {/* ==================================================== */}
          {/* SCENE 1: ASSIGNMENT FORMATTING (BEFORE & AFTER) */}
          {/* ==================================================== */}
          {currentScene === 0 && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch animate-fadeIn">
              {/* Left: Unformatted AI Draft */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                      Unformatted AI Draft
                    </span>
                    <span className="text-[11px] text-slate-400">Irregular margins • Calibri 11</span>
                  </div>
                  <div className="space-y-3 font-sans text-xs text-slate-600 opacity-80 leading-tight">
                    <div className="font-bold text-sm text-slate-800">
                      1. introduction to artificial intelligence in higher ed
                    </div>
                    <p className="line-clamp-3">
                      Recently large language models have been utilized across institutions. However many submissions fail to satisfy strict font styles and table formats required by faculty assessors.
                    </p>
                    <div className="font-bold text-xs text-slate-800 pt-1">
                      1.1 background issues
                    </div>
                    <p className="line-clamp-2">
                      Inconsistent line height, raw URLs instead of citations, and missing roman page numbers on prelims.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-rose-500 font-medium">
                  <span>❌ Failed Department Margins</span>
                  <span>❌ Inconsistent Heading Spacing</span>
                </div>
              </div>

              {/* Right: Professionally Formatted Document */}
              <div className="p-5 rounded-xl bg-gradient-to-b from-white to-teal-50/20 border-2 border-academic-teal/40 shadow-md flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-academic-teal/10 rounded-full blur-xl pointer-events-none"></div>
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-teal-100">
                    <span className="text-xs font-bold text-academic-teal uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-academic-teal" />
                      AssignmentReady Formatted
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Times New Roman 12pt • 1.5 Spacing</span>
                  </div>
                  <div className="space-y-3 font-serif text-xs text-slate-800 leading-relaxed">
                    <div className="font-bold text-base text-academic-navy border-b border-slate-200 pb-1">
                      1.0 Introduction to Artificial Intelligence in Higher Education
                    </div>
                    <p className="text-justify indent-6">
                      Recently, large language models have been utilized across institutions. Submissions now adhere precisely to official font requirements, standard 1.0-inch margins, and structured heading styles.
                    </p>
                    <div className="font-bold text-sm text-academic-navy pt-1">
                      1.1 Institutional Background & Compliance
                    </div>
                    <p className="text-justify indent-6">
                      Standardized line spacing, automated section breaks, dynamic table of contents, and continuous section-aware page numbering.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-teal-100 flex items-center justify-between text-[11px] text-teal-700 font-semibold">
                  <span className="flex items-center gap-1">✓ 1.0" Academic Margins</span>
                  <span className="flex items-center gap-1">✓ Page Breaks on Main Headings</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE 2: PDF TO WORD CONVERSION */}
          {/* ==================================================== */}
          {currentScene === 1 && (
            <div className="w-full max-w-2xl py-4 flex flex-col items-center animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 w-full">
                {/* Source PDF Card */}
                <div className="w-48 p-4 bg-white rounded-xl border border-red-200 shadow-md flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                    <FileType className="w-7 h-7" />
                  </div>
                  <span className="font-bold text-sm text-slate-800 mb-1">Lecture_Notes.pdf</span>
                  <span className="text-[11px] text-slate-500">Locked PDF Format</span>
                  <div className="mt-3 w-full py-1 rounded bg-red-100/60 text-red-700 text-[10px] font-semibold">
                    Read-Only Document
                  </div>
                </div>

                {/* Conversion Flow Animation */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-academic-teal shadow-inner animate-pulse">
                    <RefreshCw className="w-6 h-6 animate-spin text-academic-teal" style={{ animationDuration: '6s' }} />
                  </div>
                  <span className="text-xs font-semibold text-academic-teal tracking-wide">
                    Structure Extraction
                  </span>
                  <span className="text-[10px] text-slate-400">Headings • Tables • Text</span>
                </div>

                {/* Target Word Document Card */}
                <div className="w-48 p-4 bg-white rounded-xl border-2 border-blue-300 shadow-lg flex flex-col items-center text-center relative">
                  <div className="w-14 h-14 rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center mb-3">
                    <FileText className="w-7 h-7" />
                  </div>
                  <span className="font-bold text-sm text-slate-800 mb-1">Lecture_Notes.docx</span>
                  <span className="text-[11px] text-slate-500">Editable Microsoft Word</span>
                  <div className="mt-3 w-full py-1 rounded bg-blue-100/70 text-blue-800 text-[10px] font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-academic-blue" />
                    <span>Fully Editable OpenXML</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-lg bg-slate-50 border border-slate-200 text-center max-w-md text-xs text-slate-600">
                Preserves paragraph flow, heading hierarchy, and tables without paying for commercial OCR software.
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE 3: COVER PAGE REPLACEMENT */}
          {/* ==================================================== */}
          {currentScene === 2 && (
            <div className="w-full max-w-2xl py-2 flex flex-col items-center animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {/* 1. Old Cover Page sliding away */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center opacity-70">
                  <span className="text-xs font-semibold text-rose-500 mb-2">Original AI Cover</span>
                  <div className="w-full h-36 bg-white border border-dashed border-slate-300 rounded-lg p-2.5 flex flex-col justify-between text-left text-[10px] text-slate-400">
                    <div className="font-bold text-slate-600">Assignment Title</div>
                    <div className="space-y-1">
                      <div>Name: John Doe</div>
                      <div>Date: 2026</div>
                    </div>
                  </div>
                  <span className="mt-2 text-[11px] text-slate-500">Missing faculty details</span>
                </div>

                {/* 2. Arrow Action */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-teal-50 text-academic-teal flex items-center justify-center font-bold">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-academic-navy mt-1">Smart Replacement</span>
                  <span className="text-[10px] text-slate-500 text-center">Body text remains intact</span>
                </div>

                {/* 3. Official University Template Snapped */}
                <div className="p-4 rounded-xl bg-white border-2 border-academic-navy shadow-lg flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-academic-navy mb-2 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-academic-teal" />
                    Official College Cover
                  </span>
                  <div className="w-full h-36 bg-gradient-to-b from-blue-50/50 to-white border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between text-left text-[10px] text-slate-700">
                    <div className="border-b border-academic-navy pb-1">
                      <div className="font-bold text-academic-navy text-xs">UNIVERSITY FACULTY</div>
                      <div className="text-[9px] text-slate-500">Department of Computing</div>
                    </div>
                    <div className="font-serif font-bold text-slate-900 leading-tight">
                      Research Evaluation Report
                    </div>
                    <div className="space-y-0.5 text-[8px] text-slate-600">
                      <div>Student ID: 20268491</div>
                      <div>Lecturer: Dr. Patricia Vance</div>
                    </div>
                  </div>
                  <span className="mt-2 text-[11px] font-semibold text-emerald-600">Exact Faculty Guidelines</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE 4: REPORT TO POWERPOINT */}
          {/* ==================================================== */}
          {currentScene === 3 && (
            <div className="w-full py-2 flex flex-col items-center animate-fadeIn">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                {/* Slide 1: Title */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
                  <div className="w-full h-1 bg-academic-navy rounded mb-1"></div>
                  <div>
                    <span className="text-[9px] font-bold text-academic-teal uppercase">Title Slide</span>
                    <h5 className="font-bold text-xs text-slate-900 mt-1 leading-snug">AI in Higher Education</h5>
                    <p className="text-[9px] text-slate-500 mt-1">Sujan G.C. • University Dept</p>
                  </div>
                  <span className="text-[9px] text-slate-400">Slide 1 of 4</span>
                </div>

                {/* Slide 2: Content */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
                  <div className="w-full h-1 bg-academic-teal rounded mb-1"></div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Context & Problem</span>
                    <ul className="text-[9px] text-slate-700 mt-1 space-y-1 list-disc list-inside">
                      <li>Rapid generative adoption</li>
                      <li>Inconsistent formatting</li>
                      <li>Academic rubric mismatch</li>
                    </ul>
                  </div>
                  <span className="text-[9px] text-slate-400">Slide 2 of 4</span>
                </div>

                {/* Slide 3: Findings */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
                  <div className="w-full h-1 bg-amber-500 rounded mb-1"></div>
                  <div>
                    <span className="text-[9px] font-bold text-amber-600 uppercase">Key Findings</span>
                    <div className="my-1.5 p-1.5 rounded bg-slate-50 border border-slate-200 text-center">
                      <span className="font-bold text-sm text-academic-navy">88%</span>
                      <p className="text-[8px] text-slate-500 leading-none">Time Saved in Formatting</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400">Slide 3 of 4</span>
                </div>

                {/* Slide 4: Conclusion */}
                <div className="p-3 bg-white rounded-xl border-2 border-teal-300 shadow-md flex flex-col justify-between h-40">
                  <div className="w-full h-1 bg-emerald-500 rounded mb-1"></div>
                  <div>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">Conclusions</span>
                    <div className="text-[9px] text-slate-700 mt-1 space-y-1">
                      <p className="font-medium">✓ Rules engine ensures standard compliance.</p>
                      <p className="text-slate-500">✓ Free open-source export.</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-emerald-600 font-semibold">Ready to Present</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">5 Themes Available:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">Academic Classic</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">Modern Minimal</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">Research Teal</span>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE 5: COMPLIANCE CHECKER */}
          {/* ==================================================== */}
          {currentScene === 4 && (
            <div className="w-full max-w-2xl py-2 flex flex-col animate-fadeIn">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Institutional Audit Protocol</h4>
                  <span className="text-xs text-slate-500">Checking submission against academic criteria</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      All Rules Passed
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight">6 of 6 checks verified</span>
                  </div>
                  <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-emerald-600 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { name: 'Font Typography', desc: 'Times New Roman 12pt throughout body', status: 'PASS' },
                  { name: 'Heading Hierarchy', desc: 'Distinct 16pt / 14pt heading styles', status: 'PASS' },
                  { name: 'Paragraph Line Spacing', desc: 'Standard 1.5 spacing with 6pt space after', status: 'PASS' },
                  { name: 'Page Margins', desc: '1.0 inch (2.54cm) top, bottom, left, right', status: 'PASS' },
                  { name: 'Page Numbering', desc: 'Bottom-right, restarts at Introduction', status: 'PASS' },
                  { name: 'Mandatory Sections', desc: 'Introduction, Conclusion, and References found', status: 'PASS' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-left hover:border-slate-300 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-500 leading-tight">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Callout & Quick Action Strip */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>{activeMeta.title}</span>
            </h4>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed mt-0.5">
              {activeMeta.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentScene === 3 ? (
              <button
                onClick={onCreatePresentation}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
              >
                <span>Create a Presentation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onStartFormatting}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-academic-navy hover:bg-academic-indigo rounded-lg shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
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
