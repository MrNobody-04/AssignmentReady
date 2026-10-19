import React from 'react';
import {
  ArrowRight,
  BookOpen,
  FileCheck2,
  FileSpreadsheet,
  Layers,
  Lock,
  CheckCircle2,
  Sliders,
  FileText,
  Presentation,
  ShieldCheck,
} from 'lucide-react';
import { HeroShowcase } from './components/HeroShowcase';
import { UniversalUploadCenter } from '../converters/UniversalUploadCenter';

interface LandingPageProps {
  onStartFormatting: (file?: File) => void;
  onCreatePresentation: (file?: File) => void;
  onOpenProfiles: () => void;
  onOpenConverter?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartFormatting,
  onCreatePresentation,
  onOpenProfiles,
  onOpenConverter: _onOpenConverter,
}) => {
  return (
    <div className="space-y-20 pb-16">
      {/* ==================================================== */}
      {/* HERO SECTION WITH ARCHITECTURAL GRID & RADIAL DEPTH */}
      {/* ==================================================== */}
      <section className="relative bg-slate-50 bg-radial-hero bg-grid-pattern pt-8 sm:pt-14 pb-12 border-b border-slate-200/60 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Official Brand Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs mb-4 animate-fade-up">
            <img src="/logo.jpg" alt="AssignmentReady Logo" className="w-5 h-5 rounded-md object-contain" />
            <span className="text-xs font-bold text-slate-900 tracking-wide">
              Assignment<span className="text-indigo-600">Ready</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 border-l border-slate-200 pl-2">
              Submit with confidence
            </span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto animate-fade-up">
            Your Assignment. Your Rules.{' '}
            <span className="text-academic-navy">Ready to Submit.</span>
          </h1>

          {/* Supporting Description */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-up">
            Format assignments, convert documents, follow college requirements, and transform reports into presentations — all in one workspace.
          </p>

          {/* Hero Action Buttons (Stacked on mobile, row on tablet/desktop) */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-xl mx-auto animate-fade-up">
            {/* Primary CTA */}
            <button
              type="button"
              onClick={() => onStartFormatting()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold text-white bg-academic-navy hover:bg-academic-indigo rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            >
              <span>Start Formatting</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Secondary CTA (High Contrast, distinct styling) */}
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

          {/* Trust Badges */}
          <div className="mt-10 mb-10 pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium text-slate-600 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero Paid AI APIs</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>No Account Required</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Authentic Word XML Fields</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>1-Hour Automatic Cleanup</span>
            </div>
          </div>

          {/* ==================================================== */}
          {/* AUTOMATIC ANIMATED 5-SCENE FEATURE SHOWCASE */}
          {/* ==================================================== */}
          <div className="mt-4">
            <HeroShowcase
              onStartFormatting={() => onStartFormatting()}
              onCreatePresentation={() => onCreatePresentation()}
            />
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* UNIVERSAL DOCUMENT UPLOAD & CONVERSION CENTER */}
      {/* ==================================================== */}
      <section id="converter" className="scroll-mt-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <div className="tracking-widest text-xs font-bold text-academic-navy uppercase mb-1">
            Universal Document Center
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Drop Any Document or File to Begin
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
            Upload your draft, guidelines, scan, or dataset to format college requirements, convert between formats, or generate presentation decks.
          </p>
        </div>

        <UniversalUploadCenter
          onStartAssignmentFormatting={(file) => onStartFormatting(file)}
          onOpenPresentationWorkspace={(file) => onCreatePresentation(file)}
        />
      </section>

      {/* ==================================================== */}
      {/* FEATURE PILLARS */}
      {/* ==================================================== */}
      <section id="features" className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="tracking-widest text-xs font-bold text-indigo-600 uppercase mb-1">
            Institutional Standards
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered Specifically for University Compliance
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Every feature is designed to ensure strict compliance with institutional guidelines and faculty rubrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center mb-4">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Typographic Precision
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Configures exact font families (Times New Roman, Arial, Calibri), point sizes, 1.5/2.0 line spacing, paragraph space-after, and 1-inch margins.
              </p>
            </div>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-academic-blue shrink-0" />
                <span>Distinct H1, H2, H3 hierarchy</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-academic-blue shrink-0" />
                <span>Automatic page break on major headings</span>
              </li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Presentation className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                PowerPoint Presentation Decks
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Automatically transform assignment reports into editable 16:9 widescreen PowerPoint slides with 5 academic themes, bullet points, and card layouts.
              </p>
            </div>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Academic Classic & Modern Minimal</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Editable in PowerPoint, Keynote & Slides</span>
              </li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-academic-navy flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Official Cover Page Replacement
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Upload your official university cover page template (.docx) or generate a clean institutional title page without disturbing existing body text.
              </p>
            </div>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-academic-navy shrink-0" />
                <span>Course code, module & lecturer metadata</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-academic-navy shrink-0" />
                <span>Replaces raw AI title pages cleanly</span>
              </li>
            </ul>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Marking Scheme & Rubrics
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Extract assessment criteria from PDF/DOCX guidelines or attach a structured marking rubric table directly into the document for assessor feedback.
              </p>
            </div>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Criteria weights & maximum mark breakdown</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Configurable rubric placement</span>
              </li>
            </ul>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Section-Aware Page Numbering
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Real Word XML field codes (PAGE / NUMPAGES). Hides numbers on the cover page, uses Roman numerals (i, ii, iii) on prelims, and restarts Arabic numerals at the Introduction.
              </p>
            </div>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Dynamic Table of Contents (TOC)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Automatic section breaks</span>
              </li>
            </ul>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Academic Compliance Auditor
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Evaluates margins, fonts, line spacing, heading levels, and mandatory sections (Introduction, Conclusion, References) with deterministic scoring.
              </p>
            </div>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Clear pass/fail and warning breakdown</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Actionable remediation guidance</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* PRIVACY & LOCAL PROCESSING SECTION */}
      {/* ==================================================== */}
      <section id="privacy" className="scroll-mt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Privacy by Design • Zero AI Reselling
            </h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            We understand that university assignments represent your proprietary intellectual property. AssignmentReady processes files through deterministic local OpenXML algorithms. No document content is ever indexed, stored permanently, or used for AI training.
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Free Open-Source Architecture
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Automatic 1-Hour File Purge
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No Tracking or Third-Party Analytics
            </span>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* FINAL CTA BANNER */}
      {/* ==================================================== */}
      <section className="scroll-mt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-8">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-academic-navy to-slate-950 text-white shadow-2xl border border-slate-800/80">
          <div className="tracking-widest text-xs font-bold text-indigo-400 uppercase mb-2">
            Get Ready to Submit
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Stop Fighting Microsoft Word Formatting.
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto mt-3 mb-8 leading-relaxed">
            Upload your draft, select your university requirements, and get a compliant submission in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onStartFormatting()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all text-sm duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            >
              Start Formatting Now
            </button>
            <button
              onClick={() => onCreatePresentation()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 shadow-md transition-all text-sm duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              Create a Presentation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
