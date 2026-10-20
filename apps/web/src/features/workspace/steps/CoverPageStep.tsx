import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Upload,
  CheckCircle2,
  X,
} from 'lucide-react';
import { CoverPageData, FormattingSettings } from '../../../types';

interface CoverPageStepProps {
  settings: FormattingSettings;
  hasTemplateFile: boolean;
  templateFile?: File | null;
  onUploadTemplate?: (file: File) => Promise<void> | void;
  onChange: (coverData: CoverPageData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const CoverPageStep: React.FC<CoverPageStepProps> = ({
  settings,
  hasTemplateFile,
  templateFile,
  onUploadTemplate,
  onChange,
  onNext,
  onBack,
}) => {
  const cover = settings.cover_page;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const update = (key: keyof CoverPageData, val: unknown) => {
    onChange({
      ...cover,
      [key]: val,
    });
  };

  const handleModeChange = (newMode: 'builtin' | 'template') => {
    update('mode', newMode);
    if (newMode === 'template' && !hasTemplateFile && !templateFile) {
      // Automatically prompt to select the template file if not attached yet
      fileInputRef.current?.click();
    }
  };

  const handleTemplateFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setTemplateError('Cover template must be a Microsoft Word (.docx) document.');
      return;
    }
    setTemplateError(null);
    setIsUploadingTemplate(true);
    try {
      if (onUploadTemplate) {
        await onUploadTemplate(file);
      }
      update('mode', 'template');
    } catch {
      setTemplateError('Failed to upload cover template. Please check file format.');
    } finally {
      setIsUploadingTemplate(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Academic Cover Page Configuration
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Prepare a formal university cover sheet with institutional header, course codes, and candidate metadata.
        </p>
      </div>

      {/* Enable Toggle Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Include Official Cover Page</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Generates or replaces the front title page followed by a clean section break.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={cover.enabled}
            onChange={(e) => update('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-academic-navy"></div>
        </label>
      </div>

      {cover.enabled && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Template Selection */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Cover Page Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleModeChange('builtin')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    cover.mode === 'builtin'
                      ? 'border-academic-blue bg-blue-50/70 text-academic-navy font-semibold ring-2 ring-academic-blue/20 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-sm font-bold">Built-in Academic Layout</span>
                  <span className="text-xs text-slate-500 font-normal">
                    Standard university title page
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('template')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    cover.mode === 'template'
                      ? 'border-academic-blue bg-blue-50/70 text-academic-navy font-semibold ring-2 ring-academic-blue/20 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-sm font-bold flex items-center justify-between">
                    <span>Uploaded Template</span>
                    {(hasTemplateFile || templateFile) && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </span>
                  <span className="text-xs text-slate-500 font-normal block truncate">
                    {hasTemplateFile || templateFile
                      ? (templateFile ? templateFile.name : 'Faculty template active')
                      : 'Attach official .docx'}
                  </span>
                </button>
              </div>

              {/* Uploaded Template Attachment Card */}
              {cover.mode === 'template' && (
                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {templateFile ? templateFile.name : (hasTemplateFile ? 'Faculty_Cover_Template.docx' : 'No template loaded')}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isUploadingTemplate}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-academic-blue hover:text-white bg-blue-50 hover:bg-academic-blue border border-blue-200 rounded-md transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{hasTemplateFile || templateFile ? 'Replace File' : 'Upload .docx Template'}</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx"
                    onChange={handleTemplateFileChange}
                    className="hidden"
                  />

                  {templateError && (
                    <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                      <span>{templateError}</span>
                      <button type="button" onClick={() => setTemplateError(null)}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Official tables, institutional logos, and department layout in this Word template will precede your body text with placeholder injection.
                  </p>
                </div>
              )}

              {/* Replace vs Prepend Toggle */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-slate-800">
                    Replace Existing Cover Page
                  </span>
                  <span className="block text-xs text-slate-500">
                    If checked, overwrites existing title page markers rather than duplicating.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={cover.replace_existing}
                  onChange={(e) => update('replace_existing', e.target.checked)}
                  className="rounded text-academic-blue"
                />
              </div>
            </div>

            {/* Candidate & Academic Fields */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Title & Metadata Fields
              </label>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Assignment Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Database Consistency in Cloud Systems"
                  value={cover.assignment_title}
                  onChange={(e) => update('assignment_title', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Assignment Subtitle (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. A Comparative Analysis of Raft vs Paxos"
                  value={cover.assignment_subtitle}
                  onChange={(e) => update('assignment_subtitle', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Eleanor Vance"
                    value={cover.student_name}
                    onChange={(e) => update('student_name', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Student ID / Matriculation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024-CS-0912"
                    value={cover.student_id}
                    onChange={(e) => update('student_id', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. University of Edinburgh"
                    value={cover.institution}
                    onChange={(e) => update('institution', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. School of Informatics"
                    value={cover.department}
                    onChange={(e) => update('department', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Advanced Distributed Systems"
                    value={cover.course}
                    onChange={(e) => update('course', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Module Code</label>
                  <input
                    type="text"
                    placeholder="e.g. INFR11025"
                    value={cover.module_code}
                    onChange={(e) => update('module_code', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Lecturer / Assessor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. R. Milner"
                    value={cover.lecturer_name}
                    onChange={(e) => update('lecturer_name', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Submission Date
                  </label>
                  <input
                    type="text"
                    value={cover.submission_date}
                    onChange={(e) => update('submission_date', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Document Preview Mockup */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-2">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Live Cover Preview Mockup
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  cover.mode === 'template'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {cover.mode === 'template' ? 'Faculty Template' : 'Built-in Academic'}
                </span>
              </div>

              {cover.mode === 'template' ? (
                /* Faculty Template Mockup */
                <div className="bg-white rounded-xl border-2 border-emerald-500/50 shadow-md p-6 aspect-3/4 flex flex-col justify-between text-center select-none overflow-hidden relative">
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-[10.5px] font-bold text-emerald-900 flex items-center justify-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Official Template Active: {templateFile ? templateFile.name : (hasTemplateFile ? 'Attached .docx' : 'Preset Loaded')}</span>
                  </div>

                  <div className="space-y-1 my-auto py-2">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                      {cover.institution || 'FACULTY / UNIVERSITY EMBEDDED TEMPLATE'}
                    </p>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                      {cover.assignment_title || 'Assignment Title'}
                    </h3>
                    {cover.assignment_subtitle && (
                      <p className="text-[11px] text-slate-500 italic">
                        {cover.assignment_subtitle}
                      </p>
                    )}
                  </div>

                  {/* Template Injected Table Box */}
                  <div className="border border-slate-300 rounded text-[9.5px] text-left overflow-hidden bg-slate-50">
                    <div className="bg-slate-200/80 px-2 py-1 font-bold text-slate-700 text-[9px] uppercase tracking-wider border-b border-slate-300">
                      Faculty Coursework Cover Sheet
                    </div>
                    <div className="p-2 space-y-1 text-slate-800 bg-white">
                      <div className="flex justify-between border-b border-slate-100 pb-0.5">
                        <span className="font-semibold text-slate-500">Student Name:</span>
                        <span className="font-bold text-slate-900">{cover.student_name || 'Candidate Name'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-0.5">
                        <span className="font-semibold text-slate-500">Candidate ID:</span>
                        <span className="font-mono text-slate-900">{cover.student_id || 'ID / Roll No'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-0.5">
                        <span className="font-semibold text-slate-500">Module / Course:</span>
                        <span className="text-slate-900">{cover.course || cover.module_code || 'Course Code'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-500">Submission Date:</span>
                        <span className="text-slate-900">{cover.submission_date || 'Date'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[9.5px] text-emerald-700 font-medium pt-2 border-t border-slate-100">
                    Preserves original faculty typography, crests, and table structures.
                  </div>
                </div>
              ) : (
                /* Built-in Academic Mockup */
                <div className="bg-white rounded-xl border border-slate-300 shadow-md p-8 aspect-3/4 flex flex-col justify-between text-center select-none overflow-hidden">
                  {/* Top: Institution */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                      {cover.institution || 'UNIVERSITY / COLLEGE NAME'}
                    </h4>
                    <p className="text-[10px] text-slate-500 italic">
                      {cover.department || 'Department or Faculty Name'}
                    </p>
                  </div>

                  {/* Center: Title & Subtitle */}
                  <div className="space-y-3 my-auto py-6">
                    <h3 className="text-base font-bold text-academic-navy leading-tight line-clamp-3">
                      {cover.assignment_title || 'Assignment Title Goes Here'}
                    </h3>
                    {cover.assignment_subtitle && (
                      <p className="text-xs text-slate-600 italic line-clamp-2">
                        {cover.assignment_subtitle}
                      </p>
                    )}
                    {(cover.module_code || cover.course) && (
                      <div className="inline-block px-2.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                        {[cover.module_code, cover.course].filter(Boolean).join(' — ')}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Candidate Details */}
                  <div className="text-[10px] text-slate-600 border-t border-slate-100 pt-4 space-y-1 text-left px-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">Student:</span>
                      <span>{cover.student_name || 'Candidate Name'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">ID / Matric:</span>
                      <span>{cover.student_id || 'ID Number'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">Assessor:</span>
                      <span>{cover.lecturer_name || 'Course Instructor'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">Date:</span>
                      <span>{cover.submission_date || 'Date'}</span>
                    </div>
                  </div>
                </div>
              )}
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
          <span>Back to College Rules</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-academic-navy hover:bg-academic-indigo rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <span>Continue to Front Matter</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
