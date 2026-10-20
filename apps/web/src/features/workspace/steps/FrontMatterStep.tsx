import React from 'react';
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  FileText,
  ListOrdered,
  Image as ImageIcon,
  Table as TableIcon,
  CheckCircle2,
  Info,
  ShieldCheck,
  Plus,
  Trash2,
} from 'lucide-react';
import { FormattingSettings, InspectionResult } from '../../../types';

interface FrontMatterStepProps {
  settings: FormattingSettings;
  inspection: InspectionResult | null;
  onChange: (settings: FormattingSettings) => void;
  onNext: () => void;
  onBack: () => void;
}

export const FrontMatterStep: React.FC<FrontMatterStepProps> = ({
  settings,
  inspection,
  onChange,
  onNext,
  onBack,
}) => {
  const detectedFigs = inspection?.detected_figures || [];
  const detectedTbls = inspection?.detected_table_captions || [];

  const handleToggle = (key: keyof FormattingSettings, subKey: string, val: boolean) => {
    onChange({
      ...settings,
      [key]: {
        ...(settings[key] as any),
        [subKey]: val,
      },
    });
  };

  const handleUpdate = (key: keyof FormattingSettings, subKey: string, val: any) => {
    onChange({
      ...settings,
      [key]: {
        ...(settings[key] as any),
        [subKey]: val,
      },
    });
  };

  const handleAddAbbr = () => {
    const items = [...settings.list_of_abbreviations.items, { term: 'TERM', definition: 'Definition' }];
    onChange({
      ...settings,
      list_of_abbreviations: {
        ...settings.list_of_abbreviations,
        items,
      },
    });
  };

  const handleRemoveAbbr = (idx: number) => {
    const items = settings.list_of_abbreviations.items.filter((_, i) => i !== idx);
    onChange({
      ...settings,
      list_of_abbreviations: {
        ...settings.list_of_abbreviations,
        items,
      },
    });
  };

  const handleUpdateAbbr = (idx: number, field: 'term' | 'definition', val: string) => {
    const items = [...settings.list_of_abbreviations.items];
    items[idx][field] = val;
    onChange({
      ...settings,
      list_of_abbreviations: {
        ...settings.list_of_abbreviations,
        items,
      },
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-academic-blue" />
          <span>Academic Front Matter & Initial Document Structure</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select which academic preliminaries to generate. Sections will be ordered in strict institutional compliance with Roman numeral pagination.
        </p>
      </div>

      {/* Institutional Document Hierarchy Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 text-white shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configured Academic Document Hierarchy</span>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          The generated document will strictly follow this sequence:
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">1. Cover Page (No Page #)</span>
          {settings.declaration.enabled && (
            <span className="px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-200 border border-indigo-800">2. Declaration (i)</span>
          )}
          {settings.acknowledgement.enabled && (
            <span className="px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-200 border border-indigo-800">3. Acknowledgements (ii)</span>
          )}
          {settings.abstract.enabled && (
            <span className="px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-200 border border-indigo-800">4. Abstract</span>
          )}
          {settings.table_of_contents.enabled && (
            <span className="px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-200 border border-emerald-800">5. Table of Contents</span>
          )}
          {settings.list_of_figures.enabled && (
            <span className="px-2.5 py-1 rounded-md bg-teal-950 text-teal-200 border border-teal-800">6. List of Figures</span>
          )}
          {settings.list_of_tables.enabled && (
            <span className="px-2.5 py-1 rounded-md bg-teal-950 text-teal-200 border border-teal-800">7. List of Tables</span>
          )}
          {settings.list_of_abbreviations.enabled && (
            <span className="px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-200 border border-indigo-800">8. Abbreviations</span>
          )}
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700 font-semibold">
            9. Main Content (Chapter 1 / Intro: Restarts at Page 1)
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">10. References & Rubric</span>
        </div>
      </div>

      {/* Front Matter Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Declaration of Originality */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-academic-blue" />
              <h3 className="font-bold text-sm text-slate-900">Declaration of Originality</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.declaration.enabled}
                onChange={(e) => handleToggle('declaration', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-academic-blue"></div>
            </label>
          </div>

          {settings.declaration.enabled ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Page Title</label>
                <input
                  type="text"
                  value={settings.declaration.title}
                  onChange={(e) => handleUpdate('declaration', 'title', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-academic-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Statement</label>
                <textarea
                  rows={3}
                  value={settings.declaration.statement}
                  onChange={(e) => handleUpdate('declaration', 'statement', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-academic-blue"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="include_sig"
                  checked={settings.declaration.include_signature_line}
                  onChange={(e) => handleUpdate('declaration', 'include_signature_line', e.target.checked)}
                  className="rounded text-academic-blue focus:ring-academic-blue"
                />
                <label htmlFor="include_sig" className="text-xs text-slate-700 font-medium">
                  Include signature & date line
                </label>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Enable if your college requires an explicit student declaration of originality and academic integrity.
            </p>
          )}
        </div>

        {/* 2. Acknowledgements */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-academic-teal" />
              <h3 className="font-bold text-sm text-slate-900">Acknowledgements</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.acknowledgement.enabled}
                onChange={(e) => handleToggle('acknowledgement', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-academic-teal"></div>
            </label>
          </div>

          {settings.acknowledgement.enabled ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Page Title</label>
                <input
                  type="text"
                  value={settings.acknowledgement.title}
                  onChange={(e) => handleUpdate('acknowledgement', 'title', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-academic-teal"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Content</label>
                <textarea
                  rows={4}
                  value={settings.acknowledgement.content}
                  onChange={(e) => handleUpdate('acknowledgement', 'content', e.target.value)}
                  placeholder="Express gratitude to supervisors, faculty, or peers..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-academic-teal"
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Optional acknowledgements page for final-year dissertations, theses, and capstone coursework.
            </p>
          )}
        </div>

        {/* 3. Table of Contents */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Table of Contents (TOC)</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.table_of_contents.enabled}
                onChange={(e) => handleToggle('table_of_contents', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {settings.table_of_contents.enabled ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">TOC Title</label>
                  <input
                    type="text"
                    value={settings.table_of_contents.title}
                    onChange={(e) => handleUpdate('table_of_contents', 'title', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Heading Depth</label>
                  <select
                    value={settings.table_of_contents.depth}
                    onChange={(e) => handleUpdate('table_of_contents', 'depth', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
                  >
                    <option value={1}>Level 1 Only (Chapters)</option>
                    <option value={2}>Level 1 & 2 (1.1, 1.2)</option>
                    <option value={3}>Level 1, 2 & 3 (Recommended)</option>
                  </select>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-start gap-2 text-xs text-indigo-900">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Generates native OpenXML TOC field code + pre-rendered dot-leader entries based on actual document headings.
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Omits Table of Contents. (Recommended only for short essays under 1,000 words).
            </p>
          )}
        </div>

        {/* 4. List of Figures (LOF) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">List of Figures (LOF)</h3>
                {detectedFigs.length > 0 ? (
                  <span className="text-[11px] font-bold text-emerald-600">
                    {detectedFigs.length} caption(s) detected (e.g. Figure {detectedFigs[0].number})
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">0 figure captions found</span>
                )}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.list_of_figures.enabled}
                onChange={(e) => handleToggle('list_of_figures', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {settings.list_of_figures.enabled ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={settings.list_of_figures.title}
                  onChange={(e) => handleUpdate('list_of_figures', 'title', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="only_fig_exist"
                  checked={settings.list_of_figures.only_if_figures_exist}
                  onChange={(e) => handleUpdate('list_of_figures', 'only_if_figures_exist', e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-600"
                />
                <label htmlFor="only_fig_exist" className="text-xs text-slate-700 font-medium">
                  Omit page automatically if no figures exist (Prevents empty pages)
                </label>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Skip generating a formal List of Figures.
            </p>
          )}
        </div>

        {/* 5. List of Tables (LOT) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">List of Tables (LOT)</h3>
                {detectedTbls.length > 0 ? (
                  <span className="text-[11px] font-bold text-teal-600">
                    {detectedTbls.length} caption(s) detected (e.g. Table {detectedTbls[0].number})
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">0 table captions found</span>
                )}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.list_of_tables.enabled}
                onChange={(e) => handleToggle('list_of_tables', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {settings.list_of_tables.enabled ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={settings.list_of_tables.title}
                  onChange={(e) => handleUpdate('list_of_tables', 'title', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="only_tbl_exist"
                  checked={settings.list_of_tables.only_if_tables_exist}
                  onChange={(e) => handleUpdate('list_of_tables', 'only_if_tables_exist', e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-600"
                />
                <label htmlFor="only_tbl_exist" className="text-xs text-slate-700 font-medium">
                  Omit page automatically if no tables exist (Prevents empty pages)
                </label>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Skip generating a formal List of Tables.
            </p>
          )}
        </div>

        {/* 6. List of Abbreviations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-sm text-slate-900">List of Abbreviations</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.list_of_abbreviations.enabled}
                onChange={(e) => handleToggle('list_of_abbreviations', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-700"></div>
            </label>
          </div>

          {settings.list_of_abbreviations.enabled ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-600">Acronyms & Definitions</label>
                <button
                  type="button"
                  onClick={handleAddAbbr}
                  className="text-[11px] font-bold text-academic-blue hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Acronym</span>
                </button>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {settings.list_of_abbreviations.items.map((abbr, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={abbr.term}
                      onChange={(e) => handleUpdateAbbr(i, 'term', e.target.value)}
                      placeholder="Acronym"
                      className="w-24 px-2 py-1 text-xs font-bold rounded border border-slate-300"
                    />
                    <input
                      type="text"
                      value={abbr.definition}
                      onChange={(e) => handleUpdateAbbr(i, 'definition', e.target.value)}
                      placeholder="Full Definition"
                      className="flex-1 px-2 py-1 text-xs rounded border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAbbr(i)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Include a structured glossary table for technical acronyms and domain abbreviations.
            </p>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cover Page</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-academic-navy hover:bg-academic-indigo text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
        >
          <span>Continue to Page Setup & Formatting</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
