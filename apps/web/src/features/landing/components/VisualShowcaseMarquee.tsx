import React from 'react';
import {
  FileText,
  Presentation,
  ArrowRight,
  CheckCircle2,
  FileType,
  Sparkles,
  Layers,
  GraduationCap,
  ClipboardCheck,
} from 'lucide-react';
import { ScrollReveal } from '../../../components/ui/ScrollReveal';

export interface VisualShowcaseItem {
  id: string;
  category: string;
  title: string;
  badge: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  icon: React.ElementType;
  outputFormat: string;
  tags: string[];
  actionLabel: string;
  actionType: 'workspace' | 'presentation' | 'converter';
  mockup: {
    type: 'document' | 'slide' | 'converter' | 'cover' | 'rubric' | 'audit';
  };
}

const VISUAL_SHOWCASE_ITEMS: VisualShowcaseItem[] = [
  {
    id: 'doc-formatted',
    category: 'Word Formatter',
    title: 'APA & Harvard Academic Assignments',
    badge: 'Times New Roman • 12pt • 1" Margins',
    description:
      'Transforms unformatted essays and research drafts into pristine Word XML documents with dynamic running headers, 2.0 line spacing, and automated section breaks.',
    imageUrl:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Academic manuscript and research document layout',
    icon: FileText,
    outputFormat: 'Word XML',
    tags: ['Double Spacing', 'Dynamic Header'],
    actionLabel: 'Format Assignment',
    actionType: 'workspace',
    mockup: { type: 'document' },
  },
  {
    id: 'ppt-maker',
    category: 'PowerPoint Decks',
    title: 'Faculty-Ready 16:9 Presentation Decks',
    badge: '16:9 Widescreen • 4 Contrast Themes',
    description:
      'Extracts key arguments and structured headings from your paper to generate widescreen PowerPoint slides complete with executive summary cards and presenter speaking notes.',
    imageUrl:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Modern conference presentation slides on widescreen monitor',
    icon: Presentation,
    outputFormat: '16:9 PPTX',
    tags: ['Executive Cards', 'Speaker Notes'],
    actionLabel: 'Create Slides',
    actionType: 'presentation',
    mockup: { type: 'slide' },
  },
  {
    id: 'universal-converter',
    category: 'Document Converter',
    title: 'Cross-Format Document Transformation',
    badge: 'PDF ➔ DOCX ➔ TXT ➔ PPTX',
    description:
      'Extracts editable text, formatting hierarchies, and tables from locked PDFs, scanned handouts, spreadsheets, and markdown notes in under 3 seconds.',
    imageUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Digital document conversion workflow',
    icon: FileType,
    outputFormat: 'Fast OCR',
    tags: ['Zero Data Loss', 'Instant Export'],
    actionLabel: 'Convert File',
    actionType: 'converter',
    mockup: { type: 'converter' },
  },
  {
    id: 'cover-page',
    category: 'Cover Engine',
    title: 'Standardized University Cover Sheets',
    badge: 'Faculty Crest • Student Metadata',
    description:
      'Inserts official university cover pages featuring module codes, student ID, submission date, word counts, and verified candidate academic integrity declarations.',
    imageUrl:
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Historic university campus architecture',
    icon: GraduationCap,
    outputFormat: 'Cover Page',
    tags: ['No Page Number', 'Custom Crest'],
    actionLabel: 'Attach Cover',
    actionType: 'workspace',
    mockup: { type: 'cover' },
  },
  {
    id: 'rubrics-scheme',
    category: 'Grading Rubrics',
    title: 'Embedded Assessment Rubric Tables',
    badge: 'Component Marks • Weighting %',
    description:
      'Appends clean grading criteria tables at the end of your document with component breakdowns and score allocations for direct professor mark entry.',
    imageUrl:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Study notes, rubric scoring, and academic assessment',
    icon: Layers,
    outputFormat: 'Rubric Table',
    tags: ['Weighted Rubrics', 'Mark Allocations'],
    actionLabel: 'Insert Rubric',
    actionType: 'workspace',
    mockup: { type: 'rubric' },
  },
  {
    id: 'compliance-auditor',
    category: 'Compliance Auditor',
    title: 'Deterministic Academic Pre-Flight Audit',
    badge: '18 Institutional Rules • 100% Pass',
    description:
      'Scans your entire assignment for typography consistency, heading depth, margin boundaries, and required sections before you submit to faculty portals.',
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Data analytics and quality verification dashboard',
    icon: ClipboardCheck,
    outputFormat: 'Audit Pass',
    tags: ['100% Rule Audit', 'Zero AI Traces'],
    actionLabel: 'Run Audit',
    actionType: 'workspace',
    mockup: { type: 'audit' },
  },
];

interface VisualShowcaseMarqueeProps {
  onStartFormatting: () => void;
  onCreatePresentation: () => void;
  onOpenConverter?: () => void;
}

export const VisualShowcaseMarquee: React.FC<VisualShowcaseMarqueeProps> = ({
  onStartFormatting,
  onCreatePresentation,
  onOpenConverter,
}) => {
  const handleCardClick = (actionType: VisualShowcaseItem['actionType']) => {
    if (actionType === 'presentation') {
      onCreatePresentation();
    } else if (actionType === 'converter') {
      if (onOpenConverter) {
        onOpenConverter();
      } else {
        const el = document.getElementById('converter');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onStartFormatting();
    }
  };

  const renderMockup = (item: VisualShowcaseItem) => {
    switch (item.mockup.type) {
      case 'document':
        return (
          <div className="bg-white rounded-lg border border-slate-200/90 p-2.5 sm:p-3 shadow-2xs text-[10px] space-y-1.5 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1 text-slate-400">
              <span className="uppercase tracking-wider font-mono text-[8.5px] text-slate-500 truncate max-w-[80%]">
                RUNNING HEAD: ACADEMIC PAPERS
              </span>
              <span className="font-mono text-slate-700 font-bold text-[9px]">1</span>
            </div>
            <div className="text-center font-bold text-slate-800 text-[10.5px] pt-0.5 truncate">
              Impact of Deterministic Formatting in Higher Education
            </div>
            <div className="text-slate-500 leading-relaxed text-[9px] line-clamp-2">
              &emsp;Academic submissions require rigorous adherence to institutional typography standards. Ensuring proper font sizes and margins enhances readability...
            </div>
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-[8.5px] text-emerald-700 font-semibold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Times New Roman 12pt • 1.0" Margins</span>
            </div>
          </div>
        );

      case 'slide':
        return (
          <div className="bg-slate-900 rounded-lg p-2.5 sm:p-3 shadow-2xs text-[10px] space-y-1.5 text-white border border-slate-800">
            <div className="flex items-center justify-between text-indigo-400 text-[8.5px] font-mono">
              <span>EXECUTIVE PRESENTATION DECK</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-950/80 border border-indigo-700/50 text-[7.5px] text-indigo-300">
                16:9 HD
              </span>
            </div>
            <div className="font-bold text-white text-[10.5px] truncate">
              Key Findings & Research Insights
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <div className="bg-slate-800/90 border border-slate-700/80 rounded p-1.5">
                <div className="text-indigo-300 font-bold text-[8.5px]">Finding 01</div>
                <div className="text-slate-300 text-[8px] leading-tight">
                  84% faster grading
                </div>
              </div>
              <div className="bg-slate-800/90 border border-slate-700/80 rounded p-1.5">
                <div className="text-indigo-300 font-bold text-[8.5px]">Finding 02</div>
                <div className="text-slate-300 text-[8px] leading-tight">
                  100% compliance
                </div>
              </div>
            </div>
          </div>
        );

      case 'converter':
        return (
          <div className="bg-slate-50 rounded-lg border border-slate-200/90 p-2.5 sm:p-3 shadow-2xs text-[10px] space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-[8.5px] font-mono">
              <span>DOCUMENT PIPELINE</span>
              <span className="text-teal-700 font-bold text-[8.5px]">0.3s Fast</span>
            </div>
            <div className="flex items-center justify-between gap-1.5 py-0.5">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-rose-200 text-rose-700 rounded text-[8.5px] font-bold">
                <span>PDF Draft</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
              <div className="flex items-center gap-1 px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 rounded text-[8.5px] font-bold">
                <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                <span>Word .docx</span>
              </div>
            </div>
            <div className="text-[8px] text-slate-500 text-center font-medium truncate">
              Extracted 14 headings, 3 tables & footnotes
            </div>
          </div>
        );

      case 'cover':
        return (
          <div className="bg-white rounded-lg border border-slate-200/90 p-2.5 sm:p-3 shadow-2xs text-[10px] space-y-1 text-slate-800">
            <div className="text-center border-b border-slate-100 pb-0.5">
              <div className="font-extrabold text-[9px] text-slate-900 tracking-wide uppercase truncate">
                DEPARTMENT OF ACADEMIC AFFAIRS
              </div>
              <div className="text-[8px] text-slate-400">Coursework Submission</div>
            </div>
            <div className="bg-slate-50 rounded p-1 text-[8.5px] space-y-0.5 text-slate-600 border border-slate-100">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Candidate ID:</span>
                <span className="font-mono text-slate-900">AR-2026-9041</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Module:</span>
                <span>CS-408 Software</span>
              </div>
            </div>
          </div>
        );

      case 'rubric':
        return (
          <div className="bg-white rounded-lg border border-slate-200/90 p-2 sm:p-2.5 shadow-2xs text-[9px] space-y-1">
            <div className="font-bold text-slate-800 uppercase text-[8.5px] border-b border-slate-100 pb-0.5 flex justify-between">
              <span>Assessment Criterion</span>
              <span className="text-indigo-600 font-mono">Weight</span>
            </div>
            <div className="space-y-0.5 pt-0.5 text-slate-600 text-[8px]">
              <div className="flex justify-between items-center bg-slate-50 px-1.5 py-0.5 rounded">
                <span className="truncate max-w-[70%]">Literature Review</span>
                <span className="font-bold text-slate-800">30%</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 px-1.5 py-0.5 rounded">
                <span className="truncate max-w-[70%]">Methodology</span>
                <span className="font-bold text-slate-800">40%</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 px-1.5 py-0.5 rounded">
                <span className="truncate max-w-[70%]">Formatting & Citations</span>
                <span className="font-bold text-slate-800">30%</span>
              </div>
            </div>
          </div>
        );

      case 'audit':
        return (
          <div className="bg-emerald-50/70 rounded-lg border border-emerald-200/90 p-2.5 sm:p-3 shadow-2xs text-[10px] space-y-1">
            <div className="flex items-center justify-between text-emerald-900 font-bold text-[10px]">
              <span>Compliance Pre-Flight Audit</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 font-mono text-[8.5px]">
                100% PASS
              </span>
            </div>
            <div className="space-y-0.5 text-[8px] text-emerald-800">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                <span className="truncate">Margins: 2.54cm uniform bounds</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                <span className="truncate">Dynamic pagination valid</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <section className="scroll-mt-24 w-full py-8 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white border-y border-slate-200/60">
      <ScrollReveal delay={0}>
        <div className="text-center max-w-2xl mx-auto mb-7 px-4 sm:px-6">
          <div className="tracking-widest text-xs font-bold text-indigo-600 uppercase mb-1">
            Visual Output Portfolio
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Formatted Documents, Presentation Decks & Features
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
            Explore authentic academic assignments, widescreen presentation slides, and conversion outputs produced in seconds.
          </p>
        </div>
      </ScrollReveal>

      {/* Marquee Viewport with Left and Right Gradient Edge Fade Masks */}
      <ScrollReveal delay={150}>
        <div className="relative max-w-7xl mx-auto overflow-hidden py-2">
          {/* Subtle gradient fade masks optimized for mobile & desktop */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-slate-50 to-transparent z-10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-slate-50 to-transparent z-10"
            aria-hidden="true"
          />

          {/* Continuous Right-to-Left Marquee Slider */}
          <div className="flex gap-4 sm:gap-6 w-max animate-marquee-rtl hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
            {[...VISUAL_SHOWCASE_ITEMS, ...VISUAL_SHOWCASE_ITEMS].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => handleCardClick(item.actionType)}
                  className="w-[290px] sm:w-[360px] shrink-0 flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-indigo-500/50 transition-all duration-300 select-none group cursor-pointer overflow-hidden"
                >
                  {/* Card Visual Header with Image & Responsive Overlays */}
                  <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Top Row: Category Pill & Output Format Badge */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold backdrop-blur-md shadow-xs bg-slate-900/85 text-white border border-white/20 truncate max-w-[60%]">
                        <IconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{item.category}</span>
                      </div>

                      <div className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono font-semibold bg-white/95 text-slate-800 shadow-xs backdrop-blur-md shrink-0 whitespace-nowrap">
                        {item.outputFormat}
                      </div>
                    </div>

                    {/* Badge Overlay at Bottom of Image */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                      <span className="font-semibold text-slate-200 drop-shadow-xs text-[10px] sm:text-[11px] truncate">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Interactive UI Artifact Mockup */}
                    <div className="pt-0.5">
                      {renderMockup(item)}
                    </div>

                    {/* Bottom Resource Tags & Action Trigger */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1 max-w-[55%] overflow-hidden">
                        {item.tags.slice(0, 2).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-block px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] sm:text-[9.5px] font-medium whitespace-nowrap"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform shrink-0 whitespace-nowrap">
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
