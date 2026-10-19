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
import { ScrollReveal } from '../../components/ui/ScrollReveal';

interface LandingPageProps {
  onStartFormatting: (file?: File) => void;
  onCreatePresentation: (file?: File) => void;
  onOpenProfiles: () => void;
  onOpenConverter?: () => void;
}

const FEATURE_STANDARDS = [
  {
    id: 'typographic-precision',
    icon: Sliders,
    iconBg: 'bg-blue-50 text-academic-blue',
    checkColor: 'text-academic-blue',
    title: 'Typographic Precision',
    description:
      'Configures exact font families (Times New Roman, Arial, Calibri), point sizes, 1.5/2.0 line spacing, paragraph space-after, and 1-inch margins.',
    bullets: [
      'Distinct H1, H2, H3 hierarchy',
      'Automatic page break on major headings',
    ],
  },
  {
    id: 'powerpoint-decks',
    icon: Presentation,
    iconBg: 'bg-indigo-50 text-indigo-600',
    checkColor: 'text-indigo-600',
    title: 'PowerPoint Presentation Decks',
    description:
      'Automatically transform assignment reports into editable 16:9 widescreen PowerPoint slides with 5 academic themes, bullet points, and card layouts.',
    bullets: [
      'Academic Classic & Modern Minimal',
      'Editable in PowerPoint, Keynote & Slides',
    ],
  },
  {
    id: 'official-cover-page',
    icon: Layers,
    iconBg: 'bg-blue-50 text-academic-navy',
    checkColor: 'text-academic-navy',
    title: 'Official Cover Page Replacement',
    description:
      'Upload your official university cover page template (.docx) or generate a clean institutional title page without disturbing existing body text.',
    bullets: [
      'Course code, module & lecturer metadata',
      'Replaces raw AI title pages cleanly',
    ],
  },
  {
    id: 'marking-scheme',
    icon: FileSpreadsheet,
    iconBg: 'bg-amber-50 text-amber-600',
    checkColor: 'text-amber-600',
    title: 'Marking Scheme & Rubrics',
    description:
      'Extract assessment criteria from PDF/DOCX guidelines or attach a structured marking rubric table directly into the document for assessor feedback.',
    bullets: [
      'Criteria weights & maximum mark breakdown',
      'Configurable rubric placement',
    ],
  },
  {
    id: 'page-numbering',
    icon: FileText,
    iconBg: 'bg-purple-50 text-purple-600',
    checkColor: 'text-purple-600',
    title: 'Section-Aware Page Numbering',
    description:
      'Real Word XML field codes (PAGE / NUMPAGES). Hides numbers on the cover page, uses Roman numerals (i, ii, iii) on prelims, and restarts Arabic numerals at the Introduction.',
    bullets: [
      'Dynamic Table of Contents (TOC)',
      'Automatic section breaks',
    ],
  },
  {
    id: 'compliance-auditor',
    icon: FileCheck2,
    iconBg: 'bg-emerald-50 text-emerald-600',
    checkColor: 'text-emerald-600',
    title: 'Academic Compliance Auditor',
    description:
      'Evaluates margins, fonts, line spacing, heading levels, and mandatory sections (Introduction, Conclusion, References) with deterministic scoring.',
    bullets: [
      'Clear pass/fail and warning breakdown',
      'Actionable remediation guidance',
    ],
  },
];

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

          {/* Trust Badges */}
          <ScrollReveal delay={400}>
            <div className="mt-10 mb-8 pt-6 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center lg:justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 bg-white/80 border border-slate-200/80 px-3.5 py-2 rounded-full shadow-2xs whitespace-nowrap justify-center sm:justify-start lg:justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Paid AI APIs</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 bg-white/80 border border-slate-200/80 px-3.5 py-2 rounded-full shadow-2xs whitespace-nowrap justify-center sm:justify-start lg:justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No Account Required</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 bg-white/80 border border-slate-200/80 px-3.5 py-2 rounded-full shadow-2xs whitespace-nowrap justify-center sm:justify-start lg:justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Authentic Word XML Fields</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 bg-white/80 border border-slate-200/80 px-3.5 py-2 rounded-full shadow-2xs whitespace-nowrap justify-center sm:justify-start lg:justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1-Hour Automatic Cleanup</span>
              </div>
            </div>
          </ScrollReveal>

          {/* ==================================================== */}
          {/* AUTOMATIC ANIMATED 5-SCENE FEATURE SHOWCASE */}
          {/* ==================================================== */}
          <ScrollReveal delay={200} className="mt-4">
            <HeroShowcase
              onStartFormatting={() => onStartFormatting()}
              onCreatePresentation={() => onCreatePresentation()}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ==================================================== */}
      {/* UNIVERSAL DOCUMENT UPLOAD & CONVERSION CENTER */}
      {/* ==================================================== */}
      <section id="converter" className="scroll-mt-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={0}>
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
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <UniversalUploadCenter
            onStartAssignmentFormatting={(file) => onStartFormatting(file)}
            onOpenPresentationWorkspace={(file) => onCreatePresentation(file)}
          />
        </ScrollReveal>
      </section>

      {/* ==================================================== */}
      {/* INSTITUTIONAL STANDARDS - CONTINUOUS INFINITE MARQUEE SLIDER */}
      {/* ==================================================== */}
      <section id="features" className="scroll-mt-24 w-full py-4 overflow-hidden">
        <ScrollReveal delay={0}>
          <div className="text-center max-w-2xl mx-auto mb-10 px-4 sm:px-6">
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
        </ScrollReveal>

        {/* Marquee Viewport with Left and Right Gradient Edge Fade Masks */}
        <ScrollReveal delay={150}>
          <div className="relative max-w-7xl mx-auto overflow-hidden py-4">
            {/* Left subtle gradient fade mask */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-slate-50 to-transparent z-10"
              aria-hidden="true"
            />
            {/* Right subtle gradient fade mask */}
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-slate-50 to-transparent z-10"
              aria-hidden="true"
            />

            {/* Infinite Marquee Track: rendered twice [...cards, ...cards] */}
            <div className="flex gap-6 w-max animate-marquee-rtl hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
              {[...FEATURE_STANDARDS, ...FEATURE_STANDARDS].map((feature, idx) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={`${feature.id}-${idx}`}
                    className="w-[320px] sm:w-[370px] shrink-0 flex flex-col justify-between bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-indigo-500/40 transition-all duration-300 select-none group"
                  >
                    <div>
                      <div
                        className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {feature.description}
                      </p>
                    </div>
                    <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
                      {feature.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-center gap-1.5">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${feature.checkColor} shrink-0`} />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ==================================================== */}
      {/* PRIVACY & LOCAL PROCESSING SECTION */}
      {/* ==================================================== */}
      <section id="privacy" className="scroll-mt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={0}>
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
        </ScrollReveal>
      </section>

      {/* ==================================================== */}
      {/* FINAL CTA BANNER */}
      {/* ==================================================== */}
      <section className="scroll-mt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-8">
        <ScrollReveal delay={0}>
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
        </ScrollReveal>
      </section>
    </div>
  );
};
