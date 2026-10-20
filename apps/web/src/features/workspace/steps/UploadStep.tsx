import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  FileCheck,
  AlertCircle,
  X,
  FileSpreadsheet,
  BookOpen,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { GuidelineAnalysis, InspectionResult, MarkingCriterion } from '../../../types';
import { api, ApiError } from '../../../lib/api';

interface UploadStepProps {
  jobId: string | null;
  assignmentFile: File | null;
  inspection: InspectionResult | null;
  onAssignmentUploaded: (jobId: string, file: File, inspection: InspectionResult) => void;
  onCoverTemplateUploaded: (file: File) => void;
  onGuidelinesUploaded: (file: File, analysis: GuidelineAnalysis) => void;
  onMarkingSchemeUploaded: (file: File, criteria: MarkingCriterion[]) => void;
  onNext: () => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  jobId,
  assignmentFile,
  inspection,
  onAssignmentUploaded,
  onCoverTemplateUploaded,
  onGuidelinesUploaded,
  onMarkingSchemeUploaded,
  onNext,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File state for auxiliary files
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [guidelinesFile, setGuidelinesFile] = useState<File | null>(null);
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [guidelineEvidence, setGuidelineEvidence] = useState<string[]>([]);

  const assignmentInputRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const guidelinesInputRef = useRef<HTMLInputElement>(null);
  const rubricInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (assignmentFile && !jobId && !isUploading) {
      processAssignmentFile(assignmentFile);
    }
  }, [assignmentFile, jobId]);

  const handleAssignmentDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processAssignmentFile(e.dataTransfer.files[0]);
    }
  };

  const handleAssignmentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processAssignmentFile(e.target.files[0]);
    }
  };

  const processAssignmentFile = async (file: File) => {
    setErrorMessage(null);
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.docx') && !lowerName.endsWith('.pdf')) {
      setErrorMessage(
        'Please upload a valid Microsoft Word (.docx) or PDF document.'
      );
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 25 MB upload limit.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await api.uploadAssignment(file);
      onAssignmentUploaded(res.job_id, file, res.inspection);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to upload and parse the Word document. Please ensure it is not corrupted or password-protected.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleTemplateSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!jobId || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setErrorMessage('Cover page template must be a Microsoft Word (.docx) file.');
      return;
    }
    try {
      await api.uploadCoverTemplate(jobId, file);
      setTemplateFile(file);
      onCoverTemplateUploaded(file);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Failed to attach cover template';
      setErrorMessage(msg);
    }
  };

  const handleGuidelinesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!jobId || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    try {
      const res = await api.uploadGuidelines(jobId, file);
      setGuidelinesFile(file);
      setGuidelineEvidence(res.guideline_analysis.evidence);
      onGuidelinesUploaded(file, res.guideline_analysis);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Failed to attach guidelines';
      setErrorMessage(msg);
    }
  };

  const handleRubricSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!jobId || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    try {
      const res = await api.uploadMarkingScheme(jobId, file);
      setRubricFile(file);
      onMarkingSchemeUploaded(file, res.criteria);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Failed to attach marking scheme';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto px-1 sm:px-0">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Upload Your Assignment & College Assets
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Upload your unformatted draft as a Microsoft Word document (.docx). You can also optionally attach your official college cover page template, guidelines, or marking rubric.
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Assignment Dropzone */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          1. Existing Assignment Manuscript <span className="text-rose-600">*</span>
        </label>

        {!assignmentFile ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleAssignmentDrop}
            onClick={() => assignmentInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 sm:p-8 text-center cursor-pointer transition-colors ${
              isUploading
                ? 'border-academic-blue bg-blue-50/50'
                : 'border-slate-300 hover:border-academic-navy hover:bg-slate-50'
            }`}
          >
            <input
              ref={assignmentInputRef}
              type="file"
              accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
              onChange={handleAssignmentSelect}
              className="hidden"
            />
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-4">
                <Loader2 className="w-8 h-8 text-academic-blue animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-800">
                  Inspecting Word document structure...
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Parsing OpenXML headings, styles, and embedded tables
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-3 shadow-2xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-base font-semibold text-slate-900">
                  Drop your Microsoft Word (.docx) file here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  or click to browse your computer (Max 25 MB)
                </p>
                <span className="inline-block mt-3 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md">
                  Supports drafts generated with ChatGPT, Gemini, or Word
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{assignmentFile.name}</p>
                <p className="text-xs text-slate-500">
                  {(assignmentFile.size / 1024).toFixed(1)} KB • Microsoft Word Document
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Validated
              </span>
              <button
                type="button"
                onClick={() => assignmentInputRef.current?.click()}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-200 transition-colors"
              >
                Replace File
              </button>
            </div>
            <input
              ref={assignmentInputRef}
              type="file"
              accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
              onChange={handleAssignmentSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Inspection Quick Stats */}
        {inspection && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="block text-xs font-medium text-slate-500">Words</span>
              <span className="text-lg font-bold text-slate-900">{inspection.total_words}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="block text-xs font-medium text-slate-500">Headings</span>
              <span className="text-lg font-bold text-slate-900">{inspection.detected_headings.length}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="block text-xs font-medium text-slate-500">Tables</span>
              <span className="text-lg font-bold text-slate-900">{inspection.total_tables}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="block text-xs font-medium text-slate-500">Figures / Images</span>
              <span className="text-lg font-bold text-slate-900">{inspection.total_images}</span>
            </div>
          </div>
        )}
      </div>

      {/* Auxiliary Optional Files */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cover Template */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-academic-navy">
              <FileCheck className="w-5 h-5 text-academic-blue" />
              <h3 className="text-sm font-semibold text-slate-900">Cover Page Template</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Optional official faculty cover sheet (.docx) to merge student details into.
            </p>
          </div>

          <div>
            {templateFile ? (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="truncate max-w-[150px] font-medium text-slate-800">
                  {templateFile.name}
                </span>
                <button
                  onClick={() => setTemplateFile(null)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!jobId}
                onClick={() => templateInputRef.current?.click()}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
              >
                Upload Template (.docx)
              </button>
            )}
            <input
              ref={templateInputRef}
              type="file"
              accept=".docx"
              onChange={handleTemplateSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-academic-navy">
              <BookOpen className="w-5 h-5 text-academic-blue" />
              <h3 className="text-sm font-semibold text-slate-900">Module Guidelines</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Upload your assignment brief or guidelines (.docx, .pdf) for requirement cross-checking.
            </p>
          </div>

          <div>
            {guidelinesFile ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="truncate max-w-[150px] font-medium text-slate-800">
                    {guidelinesFile.name}
                  </span>
                  <button
                    onClick={() => { setGuidelinesFile(null); setGuidelineEvidence([]); }}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {guidelineEvidence.length > 0 && (
                  <p className="text-[11px] leading-relaxed text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-md p-2">
                    Applied to formatting: {guidelineEvidence.join(' ')} Review these settings in the next step.
                  </p>
                )}
              </div>
            ) : (
              <button
                type="button"
                disabled={!jobId}
                onClick={() => guidelinesInputRef.current?.click()}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
              >
                Upload Guidelines (.pdf, .docx)
              </button>
            )}
            <input
              ref={guidelinesInputRef}
              type="file"
              accept=".docx,.pdf,.txt"
              onChange={handleGuidelinesSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Marking Scheme */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-academic-navy">
              <FileSpreadsheet className="w-5 h-5 text-academic-blue" />
              <h3 className="text-sm font-semibold text-slate-900">Marking Rubric</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Attach official grading criteria (.docx, .pdf) to generate an assessment rubric table.
            </p>
          </div>

          <div>
            {rubricFile ? (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="truncate max-w-[150px] font-medium text-slate-800">
                  {rubricFile.name}
                </span>
                <button
                  onClick={() => setRubricFile(null)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!jobId}
                onClick={() => rubricInputRef.current?.click()}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
              >
                Upload Rubric (.docx, .pdf)
              </button>
            )}
            <input
              ref={rubricInputRef}
              type="file"
              accept=".docx,.pdf"
              onChange={handleRubricSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Navigation Next */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          disabled={!assignmentFile || isUploading}
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-academic-navy hover:bg-academic-indigo rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue to Requirements</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
