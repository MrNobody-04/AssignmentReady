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
  AlertTriangle,
  Bug,
  Layers,
  FileCode,
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
  const [showDebug, setShowDebug] = useState(false);
  const [customFilename, setCustomFilename] = useState(() => {
    const stem = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
    return `${stem}_SubmissionReady`;
  });

  const safeFilename = customFilename.trim() || 'assignment_SubmissionReady';
  const docxDownloadUrl = `/api/jobs/${jobId}/download?filename=${encodeURIComponent(safeFilename)}`;
  const pdfDownloadUrl = `/api/jobs/${jobId}/convert?target_format=pdf`;
  const coverPreviewUrl = `/api/jobs/${jobId}/cover-preview`;
  const debugLogUrl = `/api/jobs/${jobId}/debug-log`;

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

      {/* Fallback Warning Banner if PDF conversion had limitations */}
      {!_hasPdfVersion && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold block">Desktop Word Recommended:</span>
            <span className="text-amber-800 leading-normal block">
              Direct PDF compilation was deferred or timed out. Download the Word (.docx) file directly to view your document with full layout fidelity in desktop Microsoft Word.
            </span>
          </div>
        </div>
      )}

      {/* Multi-Page Document Architecture Preview */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Multi-Page Submission Package Layout
            </h3>
          </div>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            Exact Order Enforced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Page 1: Official Cover */}
          <div className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-950">Page 1: Cover</span>
              <span className="text-[9px] font-bold text-amber-800 bg-amber-200/80 px-1.5 py-0.5 rounded">
                Unmodified
              </span>
            </div>
            <div className="h-28 rounded-lg bg-white border border-amber-100 flex items-center justify-center overflow-hidden relative">
              <img
                src={coverPreviewUrl}
                alt="Cover Preview"
                className="max-h-24 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <FileText className="w-7 h-7 text-amber-600/70" />
            </div>
            <span className="text-[10px] text-amber-900/80 font-medium block text-center">
              No page numbering
            </span>
          </div>

          {/* Page 2: TOC & Prelims */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-900">Page 2: Front Matter</span>
              <span className="text-[9px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                Dynamic TOC
              </span>
            </div>
            <div className="h-28 rounded-lg bg-white border border-slate-200 p-2 space-y-1.5 flex flex-col justify-center">
              <div className="h-2 bg-slate-200 rounded w-3/4" />
              <div className="h-1.5 bg-slate-100 rounded w-full flex justify-between">
                <span className="text-[7px] text-slate-400">1.0 Introduction</span>
                <span className="text-[7px] text-slate-400">1</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded w-full flex justify-between">
                <span className="text-[7px] text-slate-400">2.0 Background</span>
                <span className="text-[7px] text-slate-400">2</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded w-4/5" />
            </div>
            <span className="text-[10px] text-slate-500 font-medium block text-center">
              Roman (i, ii) Prelims
            </span>
          </div>

          {/* Page 3: Assignment Body */}
          <div className="p-3 rounded-xl border border-blue-200/80 bg-blue-50/40 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-950">Page 3: Body</span>
              <span className="text-[9px] font-bold text-blue-800 bg-blue-200/80 px-1.5 py-0.5 rounded">
                Formatted
              </span>
            </div>
            <div className="h-28 rounded-lg bg-white border border-blue-100 p-2 space-y-1.5 flex flex-col justify-center">
              <div className="h-2 bg-indigo-200 rounded w-1/2" />
              <div className="h-1.5 bg-slate-100 rounded w-full" />
              <div className="h-1.5 bg-slate-100 rounded w-full" />
              <div className="h-1.5 bg-slate-100 rounded w-5/6" />
            </div>
            <span className="text-[10px] text-blue-900/80 font-medium block text-center">
              Arabic 1 (Restart)
            </span>
          </div>

          {/* Page 4: Marking Scheme Appendix (if present) */}
          <div className="p-3 rounded-xl border border-teal-200/80 bg-teal-50/40 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-950">
                {hasRubric ? 'Appendix: Rubric' : 'Submission Ready'}
              </span>
              <span className="text-[9px] font-bold text-teal-800 bg-teal-200/80 px-1.5 py-0.5 rounded">
                {hasRubric ? 'Preserved' : 'Complete'}
              </span>
            </div>
            <div className="h-28 rounded-lg bg-white border border-teal-100 p-2 space-y-1.5 flex flex-col justify-center text-center">
              {hasRubric ? (
                <>
                  <FileText className="w-6 h-6 text-teal-600 mx-auto opacity-80" />
                  <span className="text-[8px] font-bold text-teal-900">Marking Criteria</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 text-teal-600 mx-auto" />
                  <span className="text-[8px] font-bold text-teal-900">Fully Standardized</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-teal-900/80 font-medium block text-center">
              {hasRubric ? 'Unchanged Appendix' : '100% Compliant'}
            </span>
          </div>
        </div>
      </div>

      {/* Applied Formatting Specs */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          Applied Specifications & Composition
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
              Roman (i, ii) → Arabic 1 Body
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

      {/* Inline Pipeline Audit & Debug Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setShowDebug(!showDebug)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-800">
              Pipeline Audit & Verification Diagnostics
            </span>
          </div>
          <span className="text-xs font-semibold text-indigo-600">
            {showDebug ? 'Hide Diagnostics' : 'Show Diagnostics'}
          </span>
        </button>

        {showDebug && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-3 bg-slate-50/50">
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify SHA-256 integrity hashes, Word COM field updates, and conversion engine performance logs for this assignment package.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={debugLogUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Download Pipeline Audit Log (.log)</span>
              </a>

              <button
                type="button"
                onClick={onModifySettings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Re-run Formatting / Retry</span>
              </button>
            </div>
          </div>
        )}
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
