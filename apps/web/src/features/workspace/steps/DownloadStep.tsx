import React, { useState } from 'react';
import {
  Download,
  FileText,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
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
  onModifySettings: () => void;
  onReset: () => void;
}

export const DownloadStep: React.FC<DownloadStepProps> = ({
  jobId,
  originalFilename,
  hasPdfVersion,
  settings,
  compliance,
  inspection,
  onModifySettings,
  onReset,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [customFilename, setCustomFilename] = useState(() => {
    const stem = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
    return `${stem}_Formatted`;
  });

  const safeFilename = customFilename.trim() || 'assignment_Formatted';
  const docxDownloadUrl = `/api/jobs/${jobId}/download?filename=${encodeURIComponent(safeFilename)}`;
  const pdfDownloadUrl = `/api/jobs/${jobId}/download-pdf?filename=${encodeURIComponent(safeFilename)}`;

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
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Success Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Your Assignment is Formatted & Ready
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
          OpenXML typography, institutional margins, section breaks, cover pages, and dynamic page numbers have been applied while preserving your original manuscript content.
        </p>

        {/* Custom Output Filename Input */}
        <div className="mt-6 max-w-md mx-auto text-left">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Output File Name:
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder="e.g. CS101_Assignment_Final"
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-academic-teal bg-white"
            />
            <span className="px-2.5 py-2 text-xs font-semibold text-slate-500 bg-slate-200/80 rounded-lg">
              .docx / .pdf
            </span>
          </div>
        </div>

        {/* Download Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={docxDownloadUrl}
            download
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold text-white bg-academic-navy hover:bg-academic-indigo rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <Download className="w-5 h-5" />
            <span>Download Formatted Word (.docx)</span>
          </a>

          {hasPdfVersion ? (
            <a
              href={pdfDownloadUrl}
              download
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span>Download PDF</span>
            </a>
          ) : (
            <div className="text-xs text-slate-500 bg-white/70 py-2 px-3 rounded-lg border border-slate-200 inline-flex items-center gap-1.5">
              <span>PDF rendering:</span>
              <span className="font-medium text-slate-700">Open in Word & Export to PDF</span>
            </div>
          )}
        </div>
      </div>

      {/* Applied Formatting Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Applied Formatting Specifications
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="block text-slate-400 font-medium">Original File</span>
            <span className="font-semibold text-slate-800 truncate block mt-0.5">
              {originalFilename}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="block text-slate-400 font-medium">Paper & Margins</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {settings.paper_size} • {settings.margins.top_inches}" margins
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="block text-slate-400 font-medium">Body Typography</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {settings.body.font_family} {settings.body.font_size_pt} pt ({settings.body.line_spacing}x)
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="block text-slate-400 font-medium">Heading Hierarchy</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              H1 {settings.heading1.font_size_pt}pt, H2 {settings.heading2.font_size_pt}pt
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="block text-slate-400 font-medium">Compliance Audit</span>
            <span className="font-semibold text-emerald-700 block mt-0.5">
              {compliance ? `${compliance.score_percentage}% Pass Rate` : 'Audited'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="block text-slate-400 font-medium">Document Length</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {inspection ? `${inspection.total_words} Words (${inspection.total_paragraphs} paras)` : 'Processed'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="block text-slate-400 font-medium">Marking Scheme</span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {settings.marking_scheme.enabled
                ? `${settings.marking_scheme.criteria.length} Criteria Table`
                : 'Omitted'}
            </span>
          </div>
        </div>

        {/* Word Table of Contents notice */}
        {settings.table_of_contents.enabled && (
          <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed">
            <span className="font-bold block mb-1">Microsoft Word Table of Contents Notice:</span>
            When opening the generated .docx file in Microsoft Word, Word will ask whether you want to update the fields in the document. Click <strong className="font-semibold">"Yes"</strong> or right-click the Table of Contents and press <strong className="font-semibold">F9</strong> to populate exact page numbers for your headings.
          </div>
        )}
      </div>

      {/* Control Buttons (Modify / Reset / Delete) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onModifySettings}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Adjust Settings & Re-format</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            disabled={isDeleting || isDeleted}
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleted ? 'Server Files Deleted' : 'Delete Temporary Files'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-academic-navy bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Format Another Assignment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
