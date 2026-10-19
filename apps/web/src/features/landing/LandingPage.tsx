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
  Sparkles,
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
    <div className="space-y-24 py-8">
      {/* ==================================================== */}
      {/* HERO SECTION */}
      {/* ==================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 sm:pt-14">
        {/* Subtle Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-academic-teal border border-teal-200 mb-6 shadow-2xs">
          <Sparkles className="w-4 h-4 text-academic-teal" />
          <span>Academic Formatter • Universal Converter • Presentation Generator</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] max-w-4xl mx-auto">
          Your Assignment. Your Rules.{' '}
          <span className="text-academic-teal">Ready to Submit.</span>
        </h1>

        {/* Supporting Description */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Format assignments, convert documents, follow college requirements, and transform reports into presentations — all in one workspace.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => onStartFormatting()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold text-white bg-academic-navy hover:bg-academic-indigo rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <span>Start Formatting</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onCreatePresentation()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-bold text-white bg-academic-teal hover:bg-academic-teal-dark rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <Presentation className="w-5 h-5" />
            <span>Create a Presentation</span>
          </button>

          <button
            type="button"
            onClick={onOpenProfiles}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-academic-blue" />
            <span>College Profiles</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 mb-12 pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium text-slate-600 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero Paid AI APIs</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No Account Required</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Authentic OpenXML Word Fields</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>1-Hour Automatic Cleanup</span>
          </div>
        </div>

        {/* ==================================================== */}
        {/* AUTOMATIC ANIMATED 5-SCENE FEATURE SHOWCASE */}
        {/* ==================================================== */}
        <div className="mt-6">
          <HeroShowcase
            onStartFormatting={() => onStartFormatting()}
            onCreatePresentation={() => onCreatePresentation()}
          />
        </div>
      </section>

      {/* ==================================================== */}
      {/* UNIVERSAL DOCUMENT UPLOAD & CONVERSION CENTER */}
      {/* ==================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-academic-teal uppercase tracking-wider">
            All-in-One Gateway
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Universal Document Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
            Drop any supported document to immediately format college guidelines, convert file formats, or generate PowerPoint slides.
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Engineered Specifically for Academic Standards
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Every feature is designed to ensure strict compliance with institutional guidelines and faculty rubrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center mb-4">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Typographic Precision
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Configures exact font families (Times New Roman, Arial, Calibri), point sizes, 1.5/2.0 line spacing, paragraph space-after, and 1-inch margins.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-academic-blue" />
                <span>Distinct H1, H2, H3 hierarchy</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-academic-blue" />
                <span>Automatic page break on major headings</span>
              </li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-academic-teal flex items-center justify-center mb-4">
              <Presentation className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              PowerPoint Presentation Decks
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Automatically transform assignment reports into editable 16:9 widescreen PowerPoint slides with 5 academic themes, bullet points, and card layouts.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-academic-teal" />
                <span>Academic Classic & Modern Minimal</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-academic-teal" />
                <span>Editable in PowerPoint, Keynote & Google Slides</span>
              </li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-academic-indigo flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Official Cover Page Replacement
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Upload your official university cover page template (.docx) or generate a clean institutional title page without disturbing existing body text.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-academic-indigo" />
                <span>Course code, module & lecturer metadata</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-academic-indigo" />
                <span>Replaces raw AI title pages cleanly</span>
              </li>
            </ul>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Marking Scheme & Rubrics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Extract assessment criteria from PDF/DOCX guidelines or attach a structured marking rubric table directly into the document for assessor feedback.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Criteria weights & maximum mark breakdown</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Configurable rubric placement</span>
              </li>
            </ul>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Section-Aware Page Numbering
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Real Word XML field codes (PAGE / NUMPAGES). Hides numbers on the cover page, uses Roman numerals (i, ii, iii) on prelims, and restarts Arabic numerals (1, 2, 3) at the Introduction.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Dynamic Table of Contents (TOC)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Automatic section breaks</span>
              </li>
            </ul>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Academic Compliance Auditor
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Evaluates margins, fonts, line spacing, heading levels, and mandatory sections (Introduction, Conclusion, References) with deterministic scoring.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Clear pass/fail and warning breakdown</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Actionable remediation guidance</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* PRIVACY & LOCAL PROCESSING SECTION */}
      {/* ==================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-academic-teal/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-academic-teal/20 text-academic-teal flex items-center justify-center border border-academic-teal/30">
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
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-8">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-academic-navy via-slate-900 to-academic-dark text-white shadow-2xl">
          <span className="text-xs font-bold text-academic-teal uppercase tracking-widest block mb-2">
            Get Ready to Submit
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Stop Fighting Microsoft Word Formatting.
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto mt-3 mb-8 leading-relaxed">
            Upload your draft, select your university requirements, and get a compliant submission in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onStartFormatting()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all text-sm"
            >
              Start Formatting Now
            </button>
            <button
              onClick={() => onCreatePresentation()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-academic-teal hover:bg-academic-teal-dark shadow-md transition-all text-sm"
            >
              Create a Presentation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
