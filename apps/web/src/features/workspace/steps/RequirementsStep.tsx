import React, { useState } from 'react';
import {
  Sliders,
  Type,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { FormattingSettings, TextAlignment } from '../../../types';

interface RequirementsStepProps {
  settings: FormattingSettings;
  onChange: (settings: FormattingSettings) => void;
  onNext: () => void;
  onBack: () => void;
}

const AVAILABLE_FONTS = [
  'Times New Roman',
  'Arial',
  'Calibri',
  'Georgia',
  'Garamond',
  'Verdana',
  'Trebuchet MS',
];

export const RequirementsStep: React.FC<RequirementsStepProps> = ({
  settings,
  onChange,
  onNext,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'page' | 'body' | 'headings' | 'structure'>('page');

  const updateBody = (key: keyof FormattingSettings['body'], val: unknown) => {
    onChange({
      ...settings,
      body: { ...settings.body, [key]: val },
    });
  };

  const updateMargins = (key: keyof FormattingSettings['margins'], val: number) => {
    onChange({
      ...settings,
      margins: { ...settings.margins, [key]: val },
    });
  };

  const updateH1 = (key: keyof FormattingSettings['heading1'], val: unknown) => {
    onChange({
      ...settings,
      heading1: { ...settings.heading1, [key]: val },
    });
  };

  const updateH2 = (key: keyof FormattingSettings['heading2'], val: unknown) => {
    onChange({
      ...settings,
      heading2: { ...settings.heading2, [key]: val },
    });
  };

  const updateH3 = (key: keyof FormattingSettings['heading3'], val: unknown) => {
    onChange({
      ...settings,
      heading3: { ...settings.heading3, [key]: val },
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Configure Formatting Requirements
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Adjust page setup, typography, and heading rules to strictly match your institution's submission criteria.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('page')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === 'page'
              ? 'border-academic-navy text-academic-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Page & Margins</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('body')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === 'body'
              ? 'border-academic-navy text-academic-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Body Typography</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('headings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === 'headings'
              ? 'border-academic-navy text-academic-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Heading Styles (H1-H3)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('structure')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === 'structure'
              ? 'border-academic-navy text-academic-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Structure & Page Breaks</span>
        </button>
      </div>

      {/* Tab 1: Page Setup & Margins */}
      {activeTab === 'page' && (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Paper Size</label>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <button
                type="button"
                onClick={() => onChange({ ...settings, paper_size: 'A4' })}
                className={`p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  settings.paper_size === 'A4'
                    ? 'border-academic-blue bg-blue-50/50 text-academic-navy font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <span className="block text-sm">A4 Standard</span>
                  <span className="text-xs text-slate-500">210 × 297 mm (UK / Europe / Commonwealth)</span>
                </div>
                {settings.paper_size === 'A4' && <Check className="w-4 h-4 text-academic-blue" />}
              </button>

              <button
                type="button"
                onClick={() => onChange({ ...settings, paper_size: 'LETTER' })}
                className={`p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  settings.paper_size === 'LETTER'
                    ? 'border-academic-blue bg-blue-50/50 text-academic-navy font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <span className="block text-sm">US Letter</span>
                  <span className="text-xs text-slate-500">8.5 × 11.0 in (North America)</span>
                </div>
                {settings.paper_size === 'LETTER' && <Check className="w-4 h-4 text-academic-blue" />}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-900">
                Page Margins (Inches)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...settings,
                      margins: { top_inches: 1.0, bottom_inches: 1.0, left_inches: 1.0, right_inches: 1.0 },
                    })
                  }
                  className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Standard 1.0"
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...settings,
                      margins: { top_inches: 1.0, bottom_inches: 1.0, left_inches: 1.5, right_inches: 1.0 },
                    })
                  }
                  className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Binding Margin (Left 1.5")
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Top Margin</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.2"
                  max="3.0"
                  value={settings.margins.top_inches}
                  onChange={(e) => updateMargins('top_inches', parseFloat(e.target.value) || 1.0)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Bottom Margin</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.2"
                  max="3.0"
                  value={settings.margins.bottom_inches}
                  onChange={(e) => updateMargins('bottom_inches', parseFloat(e.target.value) || 1.0)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Left Margin</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.2"
                  max="3.0"
                  value={settings.margins.left_inches}
                  onChange={(e) => updateMargins('left_inches', parseFloat(e.target.value) || 1.0)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Right Margin</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.2"
                  max="3.0"
                  value={settings.margins.right_inches}
                  onChange={(e) => updateMargins('right_inches', parseFloat(e.target.value) || 1.0)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Body Typography */}
      {activeTab === 'body' && (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Font Family</label>
              <select
                value={settings.body.font_family}
                onChange={(e) => updateBody('font_family', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Font Size</label>
              <select
                value={settings.body.font_size_pt}
                onChange={(e) => updateBody('font_size_pt', parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
              >
                <option value={10}>10 pt (Footnotes / Compact)</option>
                <option value={11}>11 pt (Standard APA / Modern)</option>
                <option value={12}>12 pt (Standard University Default)</option>
                <option value={13}>13 pt</option>
                <option value={14}>14 pt</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Line Spacing</label>
              <select
                value={settings.body.line_spacing}
                onChange={(e) => updateBody('line_spacing', parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
              >
                <option value={1.0}>1.0 (Single Spaced)</option>
                <option value={1.15}>1.15 (Slightly Relaxed)</option>
                <option value={1.5}>1.5 (Standard UK/Harvard Default)</option>
                <option value={2.0}>2.0 (Double Spaced - APA/MLA)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Text Alignment</label>
              <div className="grid grid-cols-4 gap-2">
                {(['LEFT', 'CENTER', 'RIGHT', 'JUSTIFY'] as TextAlignment[]).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => updateBody('alignment', align)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      settings.body.alignment === align
                        ? 'border-academic-blue bg-blue-50 text-academic-navy'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {align.charAt(0) + align.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Space After Paragraph (pt)
              </label>
              <input
                type="number"
                min="0"
                max="24"
                value={settings.body.space_after_pt}
                onChange={(e) => updateBody('space_after_pt', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                First Line Indent (Inches)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1.0"
                value={settings.body.first_line_indent_inches}
                onChange={(e) => updateBody('first_line_indent_inches', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Headings */}
      {activeTab === 'headings' && (
        <div className="space-y-6">
          {/* Heading 1 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Heading 1 (Major Sections)</span>
              <span className="text-xs text-slate-500 font-normal">e.g. 1. Introduction, 4. Discussion</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Font Family</label>
                <select
                  value={settings.heading1.font_family}
                  onChange={(e) => updateH1('font_family', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                >
                  {AVAILABLE_FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Size (pt)</label>
                <input
                  type="number"
                  value={settings.heading1.font_size_pt}
                  onChange={(e) => updateH1('font_size_pt', parseFloat(e.target.value) || 16)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Emphasis</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={settings.heading1.bold}
                      onChange={(e) => updateH1('bold', e.target.checked)}
                      className="rounded text-academic-blue"
                    />
                    <span>Bold</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={settings.heading1.italic}
                      onChange={(e) => updateH1('italic', e.target.checked)}
                      className="rounded text-academic-blue"
                    />
                    <span>Italic</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Color (Hex)</label>
                <input
                  type="text"
                  value={settings.heading1.color_hex}
                  onChange={(e) => updateH1('color_hex', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Heading 2 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Heading 2 (Subsections)</span>
              <span className="text-xs text-slate-500 font-normal">e.g. 2.1 Theoretical Framework</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Font Family</label>
                <select
                  value={settings.heading2.font_family}
                  onChange={(e) => updateH2('font_family', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                >
                  {AVAILABLE_FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Size (pt)</label>
                <input
                  type="number"
                  value={settings.heading2.font_size_pt}
                  onChange={(e) => updateH2('font_size_pt', parseFloat(e.target.value) || 14)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Emphasis</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={settings.heading2.bold}
                      onChange={(e) => updateH2('bold', e.target.checked)}
                      className="rounded text-academic-blue"
                    />
                    <span>Bold</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={settings.heading2.italic}
                      onChange={(e) => updateH2('italic', e.target.checked)}
                      className="rounded text-academic-blue"
                    />
                    <span>Italic</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Color (Hex)</label>
                <input
                  type="text"
                  value={settings.heading2.color_hex}
                  onChange={(e) => updateH2('color_hex', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Heading 3 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Heading 3 (Sub-subsections)</span>
              <span className="text-xs text-slate-500 font-normal">e.g. 2.1.1 Dataset Preprocessing</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Font Family</label>
                <select
                  value={settings.heading3.font_family}
                  onChange={(e) => updateH3('font_family', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                >
                  {AVAILABLE_FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Size (pt)</label>
                <input
                  type="number"
                  value={settings.heading3.font_size_pt}
                  onChange={(e) => updateH3('font_size_pt', parseFloat(e.target.value) || 12)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Emphasis</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={settings.heading3.bold}
                      onChange={(e) => updateH3('bold', e.target.checked)}
                      className="rounded text-academic-blue"
                    />
                    <span>Bold</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={settings.heading3.italic}
                      onChange={(e) => updateH3('italic', e.target.checked)}
                      className="rounded text-academic-blue"
                    />
                    <span>Italic</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Color (Hex)</label>
                <input
                  type="text"
                  value={settings.heading3.color_hex}
                  onChange={(e) => updateH3('color_hex', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Structure, Page Breaks & Preservation */}
      {activeTab === 'structure' && (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          {/* Main Heading Page Breaks */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Start Every Main Heading on a New Page
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Forces major Level 1 headings to start cleanly on the next page. Kept with next paragraph to prevent orphaned headings.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.start_main_heading_on_new_page}
                onChange={(e) =>
                  onChange({ ...settings, start_main_heading_on_new_page: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-academic-navy"></div>
            </label>
          </div>

          {/* Table of Contents */}
          <div className="pt-4 border-t border-slate-200 flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Generate Word Table of Contents (TOC)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Inserts a dynamic OpenXML TOC field code directly after the cover page / front matter.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.table_of_contents.enabled}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    table_of_contents: { ...settings.table_of_contents, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-academic-navy"></div>
            </label>
          </div>

          {/* Page Numbering Rules */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Dynamic Page Numbering</h4>
            <div className="space-y-2 text-xs text-slate-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.page_numbering.hide_on_cover}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      page_numbering: { ...settings.page_numbering, hide_on_cover: e.target.checked },
                    })
                  }
                  className="rounded text-academic-blue"
                />
                <span>Hide page number on official cover page</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.page_numbering.restart_at_introduction}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      page_numbering: {
                        ...settings.page_numbering,
                        restart_at_introduction: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-academic-blue"
                />
                <span>Restart Arabic page numbering (Page 1) at Introduction</span>
              </label>
            </div>
          </div>

          {/* Preservation Checklist */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Document Integrity</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.preserve_tables}
                  onChange={(e) => onChange({ ...settings, preserve_tables: e.target.checked })}
                  className="rounded text-academic-blue"
                />
                <span>Preserve Tables & Grids</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.preserve_images}
                  onChange={(e) => onChange({ ...settings, preserve_images: e.target.checked })}
                  className="rounded text-academic-blue"
                />
                <span>Preserve Images & Figures</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.preserve_hyperlinks}
                  onChange={(e) => onChange({ ...settings, preserve_hyperlinks: e.target.checked })}
                  className="rounded text-academic-blue"
                />
                <span>Preserve URLs & Links</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upload</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-academic-navy hover:bg-academic-indigo rounded-lg shadow-sm transition-colors"
        >
          <span>Continue to Cover Page</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
