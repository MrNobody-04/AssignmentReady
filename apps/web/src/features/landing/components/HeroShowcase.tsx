import React, { useState } from 'react';
import {
  FileText,
  Layers,
  Presentation,
  CheckCircle2,
  ArrowRight,
  Award,
  Sparkles,
  Stethoscope,
  Check,
} from 'lucide-react';

interface HeroShowcaseProps {
  onStartFormatting: () => void;
  onCreatePresentation: () => void;
  onOpenDoctor?: () => void;
}

interface SceneMeta {
  id: number;
  label: string;
  tag: string;
  title: string;
  description: string;
  icon: React.ElementType;
  actionText: string;
}

const SCENES: SceneMeta[] = [
  {
    id: 0,
    label: 'Format Assignment',
    tag: 'Typography & Layout',
    title: 'Academic Word Formatter',
    description: 'Transform unformatted drafts into compliant university submissions with 1-inch margins, Times New Roman 12pt, dynamic headers, and automated Roman/Arabic page breaks.',
    icon: FileText,
    actionText: 'Open Assignment Formatter',
  },
  {
    id: 1,
    label: 'Faculty Cover Page',
    tag: 'Official Submissions',
    title: 'University Cover Page & Front Matter',
    description: 'Attach your faculty cover template or generate institutional title pages with separate declaration and abstract pages before the body.',
    icon: Layers,
    actionText: 'Configure Cover Page',
  },
  {
    id: 2,
    label: 'PowerPoint Studio',
    tag: '16:9 Presentation',
    title: 'Coursework to PowerPoint Decks',
    description: 'Synthesize structured 16:9 presentation slides directly from your research draft with individual or group speaking cues and speaker notes.',
    icon: Presentation,
    actionText: 'Generate PowerPoint Slides',
  },
  {
    id: 3,
    label: 'Assignment Doctor',
    tag: 'Automated Diagnostic',
    title: 'Compliance Audit & Health Check',
    description: 'Audit heading hierarchy, citation references, margin consistency, and page structure with deterministic 1-click auto-repair.',
    icon: Stethoscope,
    actionText: 'Run Health Diagnosis',
  },
];

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  onStartFormatting,
  onCreatePresentation,
  onOpenDoctor,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const activeScene = SCENES[activeTab];

  const handleActionClick = () => {
    if (activeTab === 2) {
      onCreatePresentation();
    } else if (activeTab === 3 && onOpenDoctor) {
      onOpenDoctor();
    } else {
      onStartFormatting();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto focus:outline-hidden select-none">
      {/* Workflow Tabs Navigation */}
      <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none w-full px-1">
        <div className="inline-flex items-center gap-1 p-1 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-2xs overflow-x-auto scrollbar-none">
          {SCENES.map((scene, idx) => {
            const Icon = scene.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{scene.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Showcase Stage */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden flex flex-col justify-between">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3 bg-slate-50/90 border-b border-slate-200/80">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 font-bold text-indigo-700 uppercase tracking-wider text-[10px]">
              Workflow {activeTab + 1} of 4
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              {activeScene.title}
            </span>
            <span className="hidden md:inline text-slate-500 font-normal text-xs">
              — {activeScene.tag}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium">Deterministic OpenXML</span>
          </div>
        </div>

        {/* Dynamic Scene Visual Area */}
        <div className="p-4 sm:p-6 flex-1 flex items-center justify-center bg-slate-50/30">
          {/* ==================================================== */}
          {/* SCENE 0: ASSIGNMENT FORMATTER (BEFORE & AFTER) */}
          {/* ==================================================== */}
          {activeTab === 0 && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch animate-fadeIn">
              {/* Left: Raw Draft */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 text-xs">
                    <span className="font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Unformatted Student Draft
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Calibri 11 • 0pt Margins</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 font-sans leading-relaxed">
                    <div className="font-bold text-slate-800 text-xs">
                      1. Introduction to Distributed Systems
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      Modern cloud workloads require fault-tolerant consensus. However students submit drafts with irregular margins, missing section breaks, and broken tables of contents.
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Ref: http://arxiv.org/abs/2401.9901
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-rose-600 font-semibold">
                  <span>❌ 0.3" Irregular Margins</span>
                  <span>❌ No Section Breaks</span>
                </div>
              </div>

              {/* Right: Formatted Document */}
              <div className="p-4 rounded-xl bg-white border-2 border-indigo-500/40 shadow-xs flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/60 rounded-full blur-xl pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 text-xs">
                    <span className="font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Compliant Word Document
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Times New Roman 12pt • 1.5 Spaced
                    </span>
                  </div>
                  <div className="space-y-1.5 font-serif text-xs text-slate-800 leading-relaxed">
                    <div className="text-right text-[9.5px] font-mono text-slate-400 pb-0.5">
                      CS-408 | PAGE 1
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-100 pb-1">
                      1.0 Introduction to Distributed Systems
                    </div>
                    <p className="text-justify indent-5 text-[11px] text-slate-700 leading-relaxed">
                      Submissions strictly adhere to institutional criteria, standard 1.0-inch margins, and structured heading styles (Milner, 2026).
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                  <span>✓ 1.00" Academic Margins</span>
                  <span>✓ Dynamic Word XML TOC</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE 1: FACULTY COVER PAGE & FRONT MATTER */}
          {/* ==================================================== */}
          {activeTab === 1 && (
            <div className="w-full max-w-xl mx-auto py-1 animate-fadeIn">
              <div className="bg-white rounded-xl border-2 border-indigo-600/50 p-5 shadow-sm text-slate-800 space-y-3">
                <div className="text-center border-b border-indigo-900/15 pb-2.5">
                  <div className="inline-flex items-center gap-1.5 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>Faculty of Engineering & Computing</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Official Coursework Submission Sheet (.docx)
                  </div>
                </div>

                <div className="text-center py-1">
                  <h5 className="font-serif font-bold text-slate-900 text-sm sm:text-base leading-tight">
                    Distributed Consensus in High-Throughput Replicated Clusters
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5">Honours Degree Research Assessment</p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-[11px] text-slate-700 grid grid-cols-2 gap-2 font-sans">
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
                    <span className="font-semibold text-slate-500 block text-[9.5px] uppercase">Tutor</span>
                    <span className="font-medium text-slate-900">Dr. Katherine Evans</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-emerald-700 font-semibold border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Declaration & Abstract on Separate Pages
                  </span>
                  <span className="text-indigo-600 font-mono text-[10px]">Section Break Follows</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE 2: POWERPOINT STUDIO */}
          {/* ==================================================== */}
          {activeTab === 2 && (
            <div className="w-full max-w-2xl mx-auto py-1 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                {/* Dark Title Slide */}
                <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between h-40">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400 mb-1.5">
                      <span>SLIDE 01 / 10</span>
                      <span className="px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-700/50 text-[8.5px] text-indigo-300">
                        16:9 Widescreen
                      </span>
                    </div>
                    <h5 className="font-bold text-xs sm:text-sm text-white leading-snug">
                      Distributed Consensus in High-Throughput Replicated Clusters
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-1">Sujan G.C. • Candidate ID: 771234</p>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 flex items-center justify-between">
                    <span>Presenter speaking notes embedded</span>
                    <span className="text-indigo-400 font-semibold">Academic Theme</span>
                  </div>
                </div>

                {/* Light Content Slide */}
                <div className="p-4 bg-white text-slate-800 rounded-xl border-2 border-indigo-500/40 shadow-xs flex flex-col justify-between h-40">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>KEY FINDINGS</span>
                      <span className="text-indigo-600 font-bold">Slide 03 / 10</span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-900">
                      Performance Evaluation & Throughput
                    </h5>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-center">
                        <span className="font-bold text-sm text-indigo-700 block">4.2x</span>
                        <span className="text-[9px] text-slate-500">Lower Latency</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-center">
                        <span className="font-bold text-sm text-emerald-700 block">99.9%</span>
                        <span className="text-[9px] text-slate-500">Quorum Pass</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold border-t border-slate-100 pt-1">
                    ✓ Editable in Microsoft PowerPoint, Keynote & Google Slides
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCENE 3: ASSIGNMENT DOCTOR */}
          {/* ==================================================== */}
          {activeTab === 3 && (
            <div className="w-full max-w-xl mx-auto py-1 animate-fadeIn">
              <div className="p-5 bg-white rounded-xl border-2 border-emerald-500/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-100">
                      98
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Overall Health Score: Excellent</h5>
                      <p className="text-[10px] text-slate-500">Assignment complies with institutional rules</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Passed 18 Verification Checks
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-slate-800 font-medium">Heading Hierarchy: No skips (H1 → H2 → H3)</span>
                    </div>
                    <span className="text-emerald-700 font-bold text-[10px]">VERIFIED</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-slate-800 font-medium">Page Margins: Strict 1.00" throughout body</span>
                    </div>
                    <span className="text-emerald-700 font-bold text-[10px]">VERIFIED</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-slate-800 font-medium">Front Matter: Separate Declaration & Abstract pages</span>
                    </div>
                    <span className="text-emerald-700 font-bold text-[10px]">VERIFIED</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>1 Click Safe Auto-Repair Enabled</span>
                  <span className="text-indigo-600 font-bold">14 Citations Cross-Matched</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Description and Primary CTA Button */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
            {activeScene.description}
          </p>

          <button
            type="button"
            onClick={handleActionClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-academic-navy hover:bg-academic-indigo shadow-sm transition-all cursor-pointer shrink-0"
          >
            <span>{activeScene.actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
