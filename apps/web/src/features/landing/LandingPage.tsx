import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Layers,
  Sliders,
  FileText,
  Presentation,
  Stethoscope,
  FileSpreadsheet,
} from 'lucide-react';
import { HeroShowcase } from './components/HeroShowcase';
import { VisualShowcaseMarquee } from './components/VisualShowcaseMarquee';
import { ScrollReveal } from '../../components/ui/ScrollReveal';

interface LandingPageProps {
  onStartFormatting: (file?: File) => void;
  onCreatePresentation: (file?: File) => void;
  onOpenProfiles: () => void;
  onOpenDoctor?: () => void;
  onOpenConverter?: () => void;
  onOpenRubric?: () => void;
  onOpenProjects?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartFormatting,
  onCreatePresentation,
  onOpenProfiles,
  onOpenDoctor,
  onOpenConverter,
  onOpenRubric,
  onOpenProjects,
}) => {
  return (
    <div className="space-y-20 pb-16">
      {/* ==================================================== */}
      {/* HERO SECTION WITH ARCHITECTURAL GRID & RADIAL DEPTH */}
      {/* ==================================================== */}
      <section className="relative bg-slate-50 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(79,70,229,0.08),transparent)] pt-8 sm:pt-14 pb-12 border-b border-slate-200/60 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Official Brand Badge */}
          <ScrollReveal delay={0}>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs mb-4">
              <img src="/logo.jpg" alt="AssignmentReady Logo" className="w-5 h-5 rounded-md object-contain" />
              <span className="text-xs font-bold text-slate-900 tracking-wide">
                Assignment<span className="text-indigo-600">Ready</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 border-l border-slate-200 pl-2">
                Submit with confidence
              </span>
            </div>
          </ScrollReveal>

          {/* Primary Headline */}
          <ScrollReveal delay={100}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
              Your Assignment. Your Rules.{' '}
              <span className="text-academic-navy">Ready to Submit.</span>
            </h1>
          </ScrollReveal>

          {/* Supporting Description */}
          <ScrollReveal delay={200}>
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Format assignments, convert documents, follow college requirements, and transform reports into presentations — all in one workspace.
            </p>
          </ScrollReveal>

          {/* Hero Action Buttons */}
          <ScrollReveal delay={300}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-xl mx-auto">
              {/* Primary CTA */}
              <button
                type="button"
                onClick={() => onStartFormatting()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold text-white bg-academic-navy hover:bg-academic-indigo rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              >
                <span>Start Formatting</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Secondary CTA */}
              <button
                type="button"
                onClick={() => onCreatePresentation()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-400 active:translate-y-0"
              >
                <Presentation className="w-5 h-5 text-indigo-600" />
                <span>Create a Presentation</span>
              </button>

              {/* Tertiary Action */}
              <button
                type="button"
                onClick={onOpenProfiles}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>College Profiles</span>
              </button>
            </div>
          </ScrollReveal>

          {/* ==================================================== */}
          {/* AUTOMATIC ANIMATED 5-SCENE FEATURE SHOWCASE */}
          {/* ==================================================== */}
          <ScrollReveal delay={300} className="mt-8">
            <HeroShowcase
              onStartFormatting={() => onStartFormatting()}
              onCreatePresentation={() => onCreatePresentation()}
              onOpenDoctor={onOpenDoctor}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ==================================================== */}
      {/* SIX CORE ACADEMIC WORKFLOWS */}
      {/* ==================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={0}>
          <div className="text-center mb-8">
            <div className="tracking-widest text-xs font-bold text-academic-navy uppercase mb-1">
              Unified Academic Intelligence
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Six Dedicated Workflows for University Students
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
              Select the exact tool for your assignment, slides, file conversion, health diagnosis, or grading rubric.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workflow 1 */}
          <ScrollReveal delay={50}>
            <div
              onClick={() => onStartFormatting()}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-academic-blue/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group h-full"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-academic-navy transition-colors">
                  1. Format My Assignment
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apply institutional typography, 1-inch margins, cover pages, dynamic Table of Contents, and section-aware Roman/Arabic page numbering to Word documents.
                </p>
              </div>
              <div className="pt-5 flex items-center gap-1.5 text-xs font-bold text-academic-navy">
                <span>Open Formatter</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </ScrollReveal>

          {/* Workflow 2 */}
          <ScrollReveal delay={100}>
            <div
              onClick={() => onCreatePresentation()}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group h-full"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                  <Presentation className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                  2. Create a PowerPoint
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Synthesize editable 16:9 widescreen presentations across academic themes directly from your coursework report or research draft with speaker notes.
                </p>
              </div>
              <div className="pt-5 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                <span>Open Slide Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </ScrollReveal>

          {/* Workflow 3 */}
          <ScrollReveal delay={150}>
            <div
              onClick={() => onOpenDoctor && onOpenDoctor()}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group h-full"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                  3. Check My Assignment (Doctor)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Diagnose heading hierarchy jumps, font mismatches, uncaptioned figures, missing cover pages, and citation inconsistencies with one-click automated repair.
                </p>
              </div>
              <div className="pt-5 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <span>Run Diagnostic Health Check</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </ScrollReveal>

          {/* Workflow 4 */}
          <ScrollReveal delay={200}>
            <div
              onClick={() => onOpenConverter && onOpenConverter()}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-violet-400/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group h-full"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-violet-700 transition-colors">
                  4. File Conversion Center
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Convert between PDF, DOCX, TXT, RTF, Markdown, and ODT with deterministic formatting preservation and zero external AI telemetry.
                </p>
              </div>
              <div className="pt-5 flex items-center gap-1.5 text-xs font-bold text-violet-700">
                <span>Launch File Converter</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </ScrollReveal>

          {/* Workflow 5 */}
          <ScrollReveal delay={250}>
            <div
              onClick={() => onOpenRubric && onOpenRubric()}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group h-full"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                  5. Marking Scheme Analyzer
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Align your document against university assessment rubrics, score criteria coverage, and surface missing mandatory requirements before submission.
                </p>
              </div>
              <div className="pt-5 flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <span>Audit Marking Criteria</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </ScrollReveal>

          {/* Workflow 6 */}
          <ScrollReveal delay={300}>
            <div
              onClick={() => onOpenProjects && onOpenProjects()}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-400/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group h-full"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors">
                  6. Project Hub & Versions
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload once and use everywhere. Track document versions, compare health diagnostics across revisions, and generate slides from any saved state.
                </p>
              </div>
              <div className="pt-5 flex items-center gap-1.5 text-xs font-bold text-teal-700">
                <span>Open Project Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================================================== */}
      {/* VISUAL ARTIFACTS SHOWCASE - CONTINUOUS MARQUEE SLIDER */}
      {/* ==================================================== */}
      <VisualShowcaseMarquee
        onStartFormatting={() => onStartFormatting()}
        onCreatePresentation={() => onCreatePresentation()}
        onOpenConverter={onOpenConverter}
      />

      {/* ==================================================== */}
      {/* DATA SOVEREIGNTY & PRIVACY BENTO STRIP */}
      {/* ==================================================== */}
      <section id="privacy" className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={0}>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="text-xs font-semibold tracking-wider text-indigo-600 uppercase mb-2">
                Data Sovereignty & Privacy
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                Privacy by Design. Zero AI Reselling.
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                We understand that university assignments represent your proprietary intellectual property. AssignmentReady processes files through deterministic local OpenXML algorithms. No document content is ever indexed, stored permanently, or used for AI training.
              </p>
            </div>

            {/* 3 Minimal Icon-Free Metric Pills - Compact 3-Column on Mobile and Desktop */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl px-2 sm:px-4 py-2.5 sm:py-3.5 text-center">
                <div className="text-base sm:text-2xl font-extrabold text-slate-900 tracking-tight">0%</div>
                <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 whitespace-nowrap">AI Training</div>
              </div>
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl px-2 sm:px-4 py-2.5 sm:py-3.5 text-center">
                <div className="text-base sm:text-2xl font-extrabold text-slate-900 tracking-tight">60 Min</div>
                <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 whitespace-nowrap">Auto Purge</div>
              </div>
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl px-2 sm:px-4 py-2.5 sm:py-3.5 text-center">
                <div className="text-base sm:text-2xl font-extrabold text-slate-900 tracking-tight">100%</div>
                <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 whitespace-nowrap">Local XML</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ==================================================== */}
      {/* FINAL CTA BANNER */}
      {/* ==================================================== */}
      <section className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-16 sm:my-24">
        <ScrollReveal delay={0}>
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 py-14 sm:px-12 sm:py-16 text-center shadow-xl border border-indigo-500/20 relative overflow-hidden">
            <div className="tracking-widest text-xs font-bold text-indigo-400 uppercase mb-2">
              Get Ready to Submit
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Stop Fighting Microsoft Word Formatting.
            </h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto mt-3 mb-8 leading-relaxed">
              Upload your draft, select your university requirements, and get a compliant submission in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => onStartFormatting()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all text-sm duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              >
                Start Formatting Now
              </button>
              <button
                type="button"
                onClick={() => onCreatePresentation()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 shadow-md transition-all text-sm duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Create a Presentation
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};
