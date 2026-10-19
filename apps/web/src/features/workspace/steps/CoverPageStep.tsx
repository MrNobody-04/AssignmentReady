import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { CoverPageData, FormattingSettings } from '../../../types';

interface CoverPageStepProps {
  settings: FormattingSettings;
  hasTemplateFile: boolean;
  onChange: (coverData: CoverPageData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const CoverPageStep: React.FC<CoverPageStepProps> = ({
  settings,
  hasTemplateFile,
  onChange,
  onNext,
  onBack,
}) => {
  const cover = settings.cover_page;

  const update = (key: keyof CoverPageData, val: unknown) => {
    onChange({
      ...cover,
      [key]: val,
    });
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
                  onClick={() => update('mode', 'builtin')}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    cover.mode === 'builtin'
                      ? 'border-academic-blue bg-blue-50/50 text-academic-navy font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-sm">Built-in Academic Layout</span>
                  <span className="text-xs text-slate-500 font-normal">
                    Standard clean university design
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => update('mode', 'template')}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    cover.mode === 'template'
                      ? 'border-academic-blue bg-blue-50/50 text-academic-navy font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-sm">Uploaded Template</span>
                  <span className="text-xs text-slate-500 font-normal">
                    {hasTemplateFile ? 'Using attached .docx template' : 'No template uploaded yet'}
                  </span>
                </button>
              </div>

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
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Live Cover Preview Mockup
              </span>
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
          <span>Back to Requirements</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-academic-navy hover:bg-academic-indigo rounded-lg shadow-sm transition-colors"
        >
          <span>Continue to Marking Scheme</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
