import React from 'react';
import {
  Sliders,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { FormattingSettings } from '../../../types';
import { SearchableFontSelect } from '../../../components/ui/SearchableFontSelect';

interface ReviewStepProps {
  settings: FormattingSettings;
  onUpdateSettings: (settings: FormattingSettings) => void;
  guidelineEvidence: string[];
  hasCoverTemplate: boolean;
  hasRubric: boolean;
  coverFilename?: string;
  onBack: () => void;
  onNext: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  settings,
  onUpdateSettings,
  guidelineEvidence = [],
  hasCoverTemplate,
  hasRubric,
  coverFilename,
  onBack,
  onNext,
}) => {
  const handleBodyChange = (field: string, value: any) => {
    onUpdateSettings({
      ...settings,
      body: {
        ...settings.body,
        [field]: value,
      },
    });
  };

  const handleHeading1Change = (field: string, value: any) => {
    onUpdateSettings({
      ...settings,
      heading1: {
        ...settings.heading1,
        [field]: value,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 via-white to-blue-50/80 border border-purple-100 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Step 2 — Review & Refine Criteria</h2>
            <p className="text-xs text-slate-500">
              Review extracted formatting rules before compiling your submission document.
            </p>
          </div>
        </div>
      </div>

      {/* Locked Opaque Cover Page Guarantee */}
      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-950">
                Use my cover page exactly as uploaded
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                Locked & Protected
              </span>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              {hasCoverTemplate
                ? `Official cover file (${coverFilename || 'uploaded asset'}) is preserved at the document package level. Fonts, university crests, and layouts will NOT be modified.`
                : 'No custom cover uploaded; a standard institutional academic cover sheet will precede the Table of Contents.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Active</span>
        </div>
      </div>

      {/* Detected Criteria Evidence Pill Strip */}
      {guidelineEvidence.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>Extracted Criteria Evidence from Brief</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {guidelineEvidence.map((ev, i) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200/70 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{ev}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Editable Formatting Configuration Grid */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-academic-blue" />
          <span>Report Body Typography & Layout</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Font Family */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Font Family (115+ Academic Styles)</label>
            <SearchableFontSelect
              value={settings.body.font_family}
              onChange={(newFont) => {
                onUpdateSettings({
                  ...settings,
                  body: { ...settings.body, font_family: newFont },
                  heading1: { ...settings.heading1, font_family: newFont },
                  heading2: { ...settings.heading2, font_family: newFont },
                  heading3: { ...settings.heading3, font_family: newFont },
                });
              }}
            />
          </div>

          {/* Body Font Size & Spacing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Body Size (pt)</label>
              <select
                value={settings.body.font_size_pt}
                onChange={(e) => handleBodyChange('font_size_pt', parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10.0}>10.0 pt</option>
                <option value={11.0}>11.0 pt</option>
                <option value={12.0}>12.0 pt (Standard)</option>
                <option value={14.0}>14.0 pt</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Line Spacing</label>
              <select
                value={settings.body.line_spacing}
                onChange={(e) => handleBodyChange('line_spacing', parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1.0}>1.0 (Single)</option>
                <option value={1.15}>1.15 (Compact)</option>
                <option value={1.5}>1.5 (Academic)</option>
                <option value={2.0}>2.0 (Double)</option>
              </select>
            </div>
          </div>

          {/* Heading 1 Size & Heading Break */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Heading 1 Size</label>
              <select
                value={settings.heading1.font_size_pt}
                onChange={(e) => handleHeading1Change('font_size_pt', parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={14.0}>14.0 pt</option>
                <option value={16.0}>16.0 pt (Standard)</option>
                <option value={18.0}>18.0 pt</option>
                <option value={20.0}>20.0 pt</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Alignment</label>
              <select
                value={settings.body.alignment}
                onChange={(e) => handleBodyChange('alignment', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="JUSTIFIED">Justified (Academic)</option>
                <option value="LEFT">Left-Aligned</option>
              </select>
            </div>
          </div>

          {/* Margins */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Margins</label>
              <select
                value={settings.margins.left_inches}
                onChange={(e) => {
                  const m = parseFloat(e.target.value);
                  onUpdateSettings({
                    ...settings,
                    margins: { top_inches: m, bottom_inches: m, left_inches: m, right_inches: m },
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1.0}>1.0 Inch (Standard 2.54cm)</option>
                <option value={1.25}>1.25 Inch (Dissertation/Bound)</option>
                <option value={0.75}>0.75 Inch (Compact)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Paper Size</label>
              <select
                value={settings.paper_size}
                onChange={(e) => onUpdateSettings({ ...settings, paper_size: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="LETTER">US Letter (8.5 × 11 in)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Front Matter Toggles */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Automatic Front Matter & Numbering</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.table_of_contents.enabled}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    table_of_contents: { ...settings.table_of_contents, enabled: e.target.checked },
                  })
                }
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-700">Table of Contents</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.list_of_figures.enabled}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    list_of_figures: { ...settings.list_of_figures, enabled: e.target.checked },
                  })
                }
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-700">List of Figures (If present)</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.list_of_tables.enabled}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    list_of_tables: { ...settings.list_of_tables, enabled: e.target.checked },
                  })
                }
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-700">List of Tables (If present)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Assembly Output Architecture Roadmap */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-md space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <Sparkles className="w-4 h-4" />
          <span>Output Document Assembly Order</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-200 border border-slate-700">
            [Cover Page, UNCHANGED]
          </span>
          <span className="text-slate-500 font-bold">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
            [TOC & Lists]
          </span>
          <span className="text-slate-500 font-bold">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-blue-200 border border-slate-700">
            [Formatted Report Body]
          </span>
          {hasRubric && (
            <>
              <span className="text-slate-500 font-bold">→</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-teal-200 border border-slate-700">
                [Marking Scheme, UNCHANGED]
              </span>
            </>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upload</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-academic-navy hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <span>Confirm & Proceed to Generate (Step 3)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
