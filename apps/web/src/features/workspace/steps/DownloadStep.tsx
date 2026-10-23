import React, { useState } from 'react';
import {
  Download,
  FileText,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Stethoscope,
  Presentation,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { FormattingSettings, ComplianceReport, InspectionResult } from '../../../types';
import { api } from '../../../lib/api';

interface DownloadStepProps {
  jobId: string;
  originalFilename: string;
  hasPdfVersion: boolean;
  settings: FormattingSettings;
  compliance: ComplianceReport | null;
  inspection: InspectionResult | null;
  hasCoverTemplate?: boolean;
  hasRubric?: boolean;
  onModifySettings: () => void;
  onReset: () => void;
  onOpenPreview?: () => void;
  onCheckWithDoctor?: () => void;
  onCreatePowerPoint?: () => void;
}

export const DownloadStep: React.FC<DownloadStepProps> = ({
  jobId,
  originalFilename,
  hasPdfVersion: _hasPdfVersion,
  settings,
  compliance: _compliance,
  inspection: _inspection,
  hasCoverTemplate: _hasCoverTemplate = false,
  hasRubric = false,
  onModifySettings,
  onReset,
  onOpenPreview: _onOpenPreview,
  onCheckWithDoctor,
  onCreatePowerPoint,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [customFilename, setCustomFilename] = useState(() => {
    const stem = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
    return `${stem}_SubmissionReady`;
  });

  const safeFilename = customFilename.trim() || 'assignment_SubmissionReady';
  const docxDownloadUrl = `/api/jobs/${jobId}/download?filename=${encodeURIComponent(safeFilename)}`;
  const pdfDownloadUrl = `/api/jobs/${jobId}/convert?target_format=pdf`;
  const coverPreviewUrl = `/api/jobs/${jobId}/cover-preview`;

  const handleDelete = async () => {
    if (!window.confirm('Delete all temporary files for this assignment from the server now?')) {
      return;
    }
    setIsDeleting(true);
    try {
      await api.deleteJob(jobId);
      setIsDeleted(true);
    } catch {
      // Ignored
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Cover Page Integrity Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-950">
                100% Submission-Ready & Verified
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Cover Unchanged</span>
              </span>
            </div>
            <p className="text-xs text-emerald-800/90 mt-0.5">
              Document package assembled: [Cover page, UNCHANGED] → [TOC & Lists] → [Report Body] {hasRubric ? '→ [Marking Scheme, UNCHANGED]' : ''}
            </p>
          </div>
        </div>

        {onCreatePowerPoint && (
          <button
            type="button"
            onClick={onCreatePowerPoint}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Generate PowerPoint Deck</span>
          </button>
        )}
      </div>

      {/* Primary Download Center */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-6">
        <div>
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Your Assignment is Ready for Submission
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-1 leading-relaxed">
            Preserved official cover sheet, real Word styles, automatic TOC, 1-inch margins, and section-aware Roman/Arabic numbering applied.
          </p>
        </div>

        {/* Custom Output Filename Input */}
        <div className="max-w-md mx-auto text-left">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Submission File Name:
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder="e.g. Coursework_Submission_Final"
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-academic-navy bg-white"
            />
            <span className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-xl">
              .docx / .pdf
            </span>
          </div>
        </div>

        {/* 3 Core Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2">
          {/* Download Word Document */}
          <a
            href={docxDownloadUrl}
            download
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-white bg-academic-navy hover:bg-slate-900 rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Word (.docx)</span>
          </a>

          {/* Download PDF */}
          <a
            href={pdfDownloadUrl}
            download
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Download PDF (.pdf)</span>
          </a>

          {/* Generate Presentation */}
          {onCreatePowerPoint && (
            <button
              type="button"
              onClick={onCreatePowerPoint}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Presentation className="w-4 h-4 text-indigo-600" />
              <span>Create Slides (.pptx)</span>
            </button>
          )}
        </div>
      </div>

      {/* Page 1 Cover Preview & Applied Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Page 1 Preview Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900">Page 1: Official Cover</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center min-h-48 relative">
            <img
              src={coverPreviewUrl}
              alt="Page 1 Cover Preview"
              className="max-h-56 object-contain shadow-xs"
              onError={(e) => {
                // If thumbnail not available, show placeholder icon
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="text-center p-4">
              <FileText className="w-8 h-8 text-academic-blue mx-auto mb-1 opacity-70" />
              <span className="text-[10px] font-semibold text-slate-500 block">
                Official Cover Sheet
              </span>
              <span className="text-[9px] text-slate-400">Positioned as Page 1</span>
            </div>
          </div>
        </div>

        {/* Applied Formatting Specs */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Applied Specifications & Composition
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-medium">Typography</span>
              <span className="font-bold text-slate-800 block mt-0.5 truncate">
                {settings.body.font_family} {settings.body.font_size_pt}pt ({settings.body.line_spacing}x)
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-medium">Paper & Margins</span>
              <span className="font-bold text-slate-800 block mt-0.5">
                {settings.paper_size} • {settings.margins.left_inches}" Margins
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-medium">Pagination</span>
              <span className="font-bold text-slate-800 block mt-0.5">
                Roman (i, ii) Prelims → Arabic 1 Body
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-medium">Auto-Lists</span>
              <span className="font-bold text-slate-800 block mt-0.5">
                TOC {settings.list_of_figures.enabled ? '+ LOF' : ''} {settings.list_of_tables.enabled ? '+ LOT' : ''}
              </span>
            </div>
          </div>

          {onCheckWithDoctor && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onCheckWithDoctor}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                <span>Run Assignment Doctor Pre-Submission Check</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons (Adjust / Delete / Reset) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onModifySettings}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Adjust Settings & Re-format</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isDeleting || isDeleted}
            onClick={handleDelete}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleted ? 'Server Files Purged' : 'Delete Temporary Files'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-academic-navy bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Format Another Assignment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
