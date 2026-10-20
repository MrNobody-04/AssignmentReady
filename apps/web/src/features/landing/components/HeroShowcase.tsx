import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  FileCheck,
  Layers,
  Presentation,
  CheckCircle2,
  ArrowRight,
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
    label: 'Cover Page',
    tag: 'Institutional Templates',
    title: 'Official Cover Page Integration',
    description: 'Generates or replaces generic title pages with formal university cover sheets while keeping body sections intact.',
    icon: Layers,
  },
  {
    id: 2,
    label: 'Report to Slides',
    tag: 'Slide Synthesis',
    title: 'Report to PowerPoint Decks',
    description: 'Synthesizes assignment headings and key takeaways into 16:9 widescreen PowerPoint presentation decks.',
    icon: Presentation,
  },
  {
    id: 3,
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
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<number | null>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Auto-rotation timer: smoothly advances scenes
  useEffect(() => {
    if (prefersReducedMotion || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % SCENES.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, prefersReducedMotion]);

  const activeMeta = SCENES[currentScene];

  return (
    <div
      className="relative w-full max-w-5xl mx-auto focus:outline-none select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="AssignmentReady Feature Showcase"
    >
      {/* Top Workflow Tabs Navigation (Removed pause and left/right buttons for clean mobile responsiveness) */}
      <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none w-full">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-2xs overflow-x-auto scrollbar-none max-w-full">
          {SCENES.map((scene, idx) => {
            const Icon = scene.icon;
            const isActive = currentScene === idx;
            return (
              <button
                key={scene.id}
                onClick={() => setCurrentScene(idx)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
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
      </div>

      {/* Main Showcase Stage (Responsive min-height and padding) */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden transition-all duration-300 min-h-[310px] sm:min-h-[380px] flex flex-col justify-between">
        {/* Modern Workflow Header Strip */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 bg-slate-50/90 border-b border-slate-200/80">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/80 font-bold text-indigo-700 uppercase tracking-wider text-[10px]">
              Workflow
            </span>
            <span className="text-slate-300 select-none">•</span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
              {activeMeta.title}
            </span>
            <span className="hidden sm:inline text-slate-400 font-normal text-xs">
              — {activeMeta.tag}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono text-slate-400 shrink-0">
            <span className="text-slate-900 font-bold">{currentScene + 1}</span>
            <span>/</span>
            <span>{SCENES.length}</span>
          </div>
        </div>

        {/* Dynamic Scene Visual Area: Right-to-Left Slide Animation */}
        <div className="p-3.5 sm:p-6 flex-1 flex items-center justify-center overflow-hidden">
          <div key={currentScene} className="w-full animate-slide-from-right">
            {/* ==================================================== */}
            {/* SCENE 0: ASSIGNMENT FORMATTING (BEFORE & AFTER) */}
            {/* ==================================================== */}
            {currentScene === 0 && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 items-stretch">
                {/* Left: Raw Draft */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200">
                      <span className="text-[11px] sm:text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Raw Draft
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Calibri 11 • 0pt margins</span>
                    </div>
                    <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-sans">
                      <div className="font-bold text-xs text-slate-800">
                        1. Introduction to Machine Learning in Healthcare
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        Recently large language models have seen rapid adoption. However unformatted drafts violate institutional font guidelines and 1-inch margins.
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Reference: http://arxiv.org/abs/2401.9901
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] sm:text-[11px] text-rose-600 font-medium">
                    <span>❌ Margins: 0.2" Irregular</span>
                    <span>❌ Missing Running Header</span>
                  </div>
                </div>

                {/* Right: Formatted Document */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-white border-2 border-indigo-500/40 shadow-xs flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/60 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
                      <span className="text-[11px] sm:text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        Compliant Word Document
                      </span>
                      <span className="text-[9.5px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Times New Roman 12pt • 1.5 Spacing
                      </span>
                    </div>
                    <div className="space-y-1.5 font-serif text-xs text-slate-800 leading-relaxed">
                      <div className="text-right text-[9px] font-mono text-slate-400 pb-0.5">
                        AR-2026-9041 | PAGE 1
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-100 pb-1">
                        1.0 Introduction to Machine Learning in Healthcare
                      </div>
                      <p className="text-justify indent-5 text-[11px] text-slate-700 leading-relaxed">
                        Submissions adhere strictly to official font requirements, standard 1.0-inch margins, and structured heading styles (Vance & Mercer, 2026).
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">✓ 1.0" Academic Margins</span>
                    <span className="flex items-center gap-1">✓ Dynamic Running Header</span>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* SCENE 1: COVER PAGE INTEGRATION (Authentic Academic) */}
            {/* ==================================================== */}
            {currentScene === 1 && (
              <div className="w-full max-w-xl mx-auto py-1">
                <div className="bg-gradient-to-b from-indigo-50/30 to-white rounded-xl border-2 border-indigo-600/60 p-4 sm:p-5 shadow-sm text-slate-800 space-y-3">
                  {/* Institutional Header */}
                  <div className="text-center border-b border-indigo-900/15 pb-2.5">
                    <div className="inline-flex items-center gap-1.5 text-indigo-900 font-bold text-[11px] sm:text-xs uppercase tracking-wider">
                      <Award className="w-4 h-4 text-indigo-600" />
                      <span>University Faculty of Computing & Engineering</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Official Academic Coursework Submission</div>
                  </div>

                  {/* Paper Title */}
                  <div className="text-center py-1">
                    <h5 className="font-serif font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      Critical Analysis of Distributed Machine Learning Systems
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Honours Degree Research Assessment</p>
                  </div>

                  {/* Candidate Metadata Grid */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-[10.5px] text-slate-700 grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold text-slate-500 block text-[9.5px] uppercase">Candidate ID</span>
                      <span className="font-mono font-bold text-slate-900">AR-2026-9041</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-[9.5px] uppercase">Module Code</span>
                      <span className="font-medium text-slate-900">CS-408 Distributed Systems</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-[9.5px] uppercase">Word Count</span>
                      <span className="font-medium text-slate-900">3,450 Words</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-[9.5px] uppercase">Advisor</span>
                      <span className="font-medium text-slate-900">Dr. Katherine Evans</span>
                    </div>
                  </div>

                  {/* Verification Footer */}
                  <div className="flex items-center justify-between text-[10px] pt-1 text-emerald-700 font-semibold border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Candidate Originality Declaration Attached
                    </span>
                    <span className="text-indigo-600 font-mono">Section Break Follows</span>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* SCENE 2: REPORT TO POWERPOINT */}
            {/* ==================================================== */}
            {currentScene === 2 && (
              <div className="w-full max-w-2xl mx-auto py-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {/* Dark Slide */}
                  <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between h-36 sm:h-40">
                    <div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-indigo-400 mb-1.5">
                        <span>SLIDE 01 / 04</span>
                        <span className="px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-700/50 text-[8px] text-indigo-300">
                          16:9 Widescreen
                        </span>
                      </div>
                      <h5 className="font-bold text-xs sm:text-sm text-white leading-snug">
                        AI in Higher Education: Policy & Practice
                      </h5>
                      <p className="text-[10px] text-slate-400 mt-1">Sujan G.C. • University Academic Seminar</p>
                    </div>
                    <div className="text-[9.5px] text-slate-400 border-t border-slate-800 pt-1.5">
                      Presenter speaking notes embedded
                    </div>
                  </div>

                  {/* Light Slide */}
                  <div className="p-3.5 bg-white text-slate-800 rounded-xl border-2 border-indigo-500/40 shadow-xs flex flex-col justify-between h-36 sm:h-40">
                    <div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                        <span>KEY FINDINGS</span>
                        <span className="text-indigo-600 font-bold">Slide 03</span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-900">
                        Turnaround & Compliance Metrics
                      </h5>
                      <div className="grid grid-cols-2 gap-1.5 mt-2">
                        <div className="bg-slate-50 border border-slate-100 rounded p-1 text-center">
                          <span className="font-bold text-xs text-indigo-700 block">88%</span>
                          <span className="text-[8px] text-slate-500 leading-tight">Time Saved</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded p-1 text-center">
                          <span className="font-bold text-xs text-emerald-700 block">100%</span>
                          <span className="text-[8px] text-slate-500 leading-tight">Format Pass</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[9.5px] text-emerald-700 font-semibold border-t border-slate-100 pt-1">
                      ✓ Ready for Microsoft PowerPoint & Keynote
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* SCENE 3: COMPLIANCE AUDITOR */}
            {/* ==================================================== */}
            {currentScene === 3 && (
              <div className="w-full max-w-2xl mx-auto py-1">
                <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-slate-200">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">Institutional Audit Protocol</h4>
                    <span className="text-[10px] sm:text-[11px] text-slate-500">Deterministic check against 18 academic criteria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] sm:text-xs">
                      100% PASS (6/6)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { name: 'Page Margins', desc: '1.0 inch (2.54cm) uniform bounds' },
                    { name: 'Typography Standard', desc: 'Times New Roman 12pt throughout body' },
                    { name: 'Heading Hierarchy', desc: 'Distinct H1, H2, H3 depth verified' },
                    { name: 'Dynamic Pagination', desc: 'Bottom-right, restarts after cover' },
                    { name: 'Mandatory Sections', desc: 'Intro, Conclusion, References present' },
                    { name: 'Referencing Format', desc: 'APA 7th citation syntax conformed' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-left"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[11px] sm:text-xs font-semibold text-slate-800">{item.name}</div>
                        <div className="text-[9.5px] sm:text-[10px] text-slate-500 leading-tight">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Callout & Action Strip */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-left w-full sm:w-auto">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              {activeMeta.title}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 max-w-xl leading-relaxed mt-0.5 line-clamp-1 sm:line-clamp-none">
              {activeMeta.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {currentScene === 2 ? (
              <button
                onClick={onCreatePresentation}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Create a Presentation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onStartFormatting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-all hover:-translate-y-0.5 active:translate-y-0"
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
