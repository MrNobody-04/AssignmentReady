import React, { useRef, useState, useEffect } from 'react';
import {
  FileText,
  FileCheck,
  AlertCircle,
  X,
  FileSpreadsheet,
  BookOpen,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Presentation,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import { GuidelineAnalysis, InspectionResult, MarkingCriterion } from '../../../types';
import { api, ApiError } from '../../../lib/api';

interface UploadStepProps {
  jobId: string | null;
  assignmentFile: File | null;
  inspection: InspectionResult | null;
  templateFile?: File | null;
  guidelinesFile?: File | null;
  rubricFile?: File | null;
  guidelineEvidence?: string[];
  rubricCriteriaCount?: number;
  hasTemplateFile?: boolean;
  hasGuidelinesFile?: boolean;
  hasRubricFile?: boolean;
  onAssignmentUploaded: (jobId: string, file: File, inspection: InspectionResult) => void;
  onCoverTemplateUploaded: (file: File) => void;
  onGuidelinesUploaded: (file: File, analysis: GuidelineAnalysis) => void;
  onMarkingSchemeUploaded: (file: File, criteria: MarkingCriterion[]) => void;
  onRemoveTemplate?: () => void;
  onRemoveGuidelines?: () => void;
  onRemoveRubric?: () => void;
  onNext: () => void;
  onDirectPPT?: (file: File) => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  jobId,
  assignmentFile,
  inspection,
  templateFile: propTemplateFile,
  guidelinesFile: propGuidelinesFile,
  rubricFile: propRubricFile,
  guidelineEvidence: _propGuidelineEvidence = [],
  rubricCriteriaCount: _rubricCriteriaCount = 0,
  hasTemplateFile = false,
  hasGuidelinesFile = false,
  hasRubricFile = false,
  onAssignmentUploaded,
  onCoverTemplateUploaded,
  onGuidelinesUploaded,
  onMarkingSchemeUploaded,
  onRemoveTemplate,
  onRemoveGuidelines,
  onRemoveRubric,
  onNext,
  onDirectPPT,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGuidelines, setIsUploadingGuidelines] = useState(false);
  const [isUploadingRubric, setIsUploadingRubric] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronized file state
  const [templateFile, setTemplateFile] = useState<File | null>(propTemplateFile || null);
  const [guidelinesFile, setGuidelinesFile] = useState<File | null>(propGuidelinesFile || null);
  const [rubricFile, setRubricFile] = useState<File | null>(propRubricFile || null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (propTemplateFile !== undefined) setTemplateFile(propTemplateFile);
  }, [propTemplateFile]);

  useEffect(() => {
    if (propGuidelinesFile !== undefined) setGuidelinesFile(propGuidelinesFile);
  }, [propGuidelinesFile]);

  useEffect(() => {
    if (propRubricFile !== undefined) setRubricFile(propRubricFile);
  }, [propRubricFile]);

  useEffect(() => {
    if (jobId && (templateFile || hasTemplateFile)) {
      setCoverPreviewUrl(`/api/jobs/${jobId}/cover-preview`);
    } else {
      setCoverPreviewUrl(null);
    }
  }, [jobId, templateFile, hasTemplateFile]);

  const assignmentInputRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const guidelinesInputRef = useRef<HTMLInputElement>(null);
  const rubricInputRef = useRef<HTMLInputElement>(null);

  const processAssignmentFile = async (file: File) => {
    setErrorMessage(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['docx', 'pdf', 'txt', 'md'];
    if (!ext || !validExts.includes(ext)) {
      setErrorMessage(`Please upload a valid assignment file (${validExts.map((e) => `.${e}`).join(', ')}).`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('Assignment file exceeds the 25 MB size limit.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await api.uploadAssignment(file);
      onAssignmentUploaded(res.job_id, file, res.inspection);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to upload assignment document. Please verify your connection.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const processTemplateFile = async (file: File) => {
    if (!jobId) {
      setErrorMessage('Please upload your assignment report first before uploading the cover page.');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['docx', 'pdf'].includes(ext)) {
      setErrorMessage('Cover page must be an official Word (.docx) or PDF (.pdf) document.');
      return;
    }

    setIsUploadingCover(true);
    try {
      await api.uploadCoverTemplate(jobId, file);
      setTemplateFile(file);
      setCoverPreviewUrl(`/api/jobs/${jobId}/cover-preview?t=${Date.now()}`);
      onCoverTemplateUploaded(file);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to upload official cover page.');
      }
    } finally {
      setIsUploadingCover(false);
    }
  };

  const processGuidelinesFile = async (file: File) => {
    if (!jobId) {
      setErrorMessage('Please upload your assignment report first before uploading the criteria brief.');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'docx', 'txt'].includes(ext)) {
      setErrorMessage('Criteria document must be a .pdf, .docx, or .txt file.');
      return;
    }

    setIsUploadingGuidelines(true);
    try {
      const res = await api.uploadGuidelines(jobId, file);
      setGuidelinesFile(file);
      onGuidelinesUploaded(file, res.guideline_analysis);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to upload assignment criteria.');
      }
    } finally {
      setIsUploadingGuidelines(false);
    }
  };

  const processRubricFile = async (file: File) => {
    if (!jobId) {
      setErrorMessage('Please upload your assignment report first before uploading the marking scheme.');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'docx', 'xlsx', 'txt'].includes(ext)) {
      setErrorMessage('Marking scheme must be a .pdf, .docx, .xlsx, or .txt file.');
      return;
    }

    setIsUploadingRubric(true);
    try {
      const res = await api.uploadMarkingScheme(jobId, file);
      setRubricFile(file);
      onMarkingSchemeUploaded(file, res.criteria);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to upload marking scheme.');
      }
    } finally {
      setIsUploadingRubric(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner: Direct PPT Shortcut & Guidance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/80 border border-indigo-100/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Step 1 — Upload Required Assets</h2>
            <p className="text-xs text-slate-500">
              Provide your report draft, assignment brief, and official college cover page.
            </p>
          </div>
        </div>

        {assignmentFile && onDirectPPT && (
          <button
            type="button"
            onClick={() => onDirectPPT(assignmentFile)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Generate PPT Only</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main 3 Core Upload Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* ==================================================== */}
        {/* ZONE 1: AI REPORT / ASSIGNMENT DRAFT */}
        {/* ==================================================== */}
        <div
          className={`flex flex-col justify-between p-5 rounded-2xl border-2 transition-all ${
            assignmentFile
              ? 'bg-blue-50/40 border-blue-200 shadow-xs'
              : 'bg-white border-dashed border-slate-300 hover:border-academic-blue/80 hover:bg-slate-50/50'
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) processAssignmentFile(e.dataTransfer.files[0]);
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-academic-navy uppercase tracking-wider bg-blue-100/70 px-2 py-0.5 rounded-md">
                1. Required Report
              </span>
              {assignmentFile && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-1">AI Assignment / Draft</h3>
            <p className="text-xs text-slate-500 mb-4">
              Your raw or unformatted assignment draft (.docx, .pdf, .txt, .md).
            </p>

            {assignmentFile ? (
              <div className="p-3 rounded-xl bg-white border border-blue-100 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-5 h-5 text-academic-blue shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{assignmentFile.name}</div>
                      <div className="text-[10px] text-slate-400">{formatFileSize(assignmentFile.size)}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (assignmentInputRef.current) assignmentInputRef.current.value = '';
                      assignmentInputRef.current?.click();
                    }}
                    className="text-2xs font-semibold text-academic-blue hover:underline cursor-pointer"
                  >
                    Replace
                  </button>
                </div>

                {inspection && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>{inspection.total_words.toLocaleString()} words</span>
                    <span>{inspection.detected_headings.length} headings</span>
                    <span>{inspection.detected_figures?.length || 0} figures</span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => assignmentInputRef.current?.click()}
                className="py-8 flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-academic-blue animate-spin mb-2" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800">Drop your assignment draft</span>
                <span className="text-[10px] text-slate-400 mt-0.5">or click to browse (.docx, .pdf, .txt)</span>
              </div>
            )}
          </div>

          <input
            ref={assignmentInputRef}
            type="file"
            accept=".docx,.pdf,.txt,.md"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) processAssignmentFile(e.target.files[0]);
            }}
          />
        </div>

        {/* ==================================================== */}
        {/* ZONE 2: ASSIGNMENT CRITERIA / FORMATTING BRIEF */}
        {/* ==================================================== */}
        <div
          className={`flex flex-col justify-between p-5 rounded-2xl border-2 transition-all ${
            guidelinesFile || hasGuidelinesFile
              ? 'bg-purple-50/40 border-purple-200 shadow-xs'
              : 'bg-white border-dashed border-slate-300 hover:border-purple-400/80 hover:bg-slate-50/50'
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) processGuidelinesFile(e.dataTransfer.files[0]);
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider bg-purple-100/70 px-2 py-0.5 rounded-md">
                2. Assignment Criteria
              </span>
              {(guidelinesFile || hasGuidelinesFile) && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-1">Formatting Brief / Criteria</h3>
            <p className="text-xs text-slate-500 mb-4">
              Module rules for fonts, spacing, margins, and referencing (.pdf, .docx).
            </p>

            {guidelinesFile || hasGuidelinesFile ? (
              <div className="p-3 rounded-xl bg-white border border-purple-100 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="w-5 h-5 text-purple-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {guidelinesFile ? guidelinesFile.name : 'Criteria Brief Attached'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {guidelinesFile ? formatFileSize(guidelinesFile.size) : 'Ready for review'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => guidelinesInputRef.current?.click()}
                      className="text-2xs font-semibold text-purple-600 hover:underline cursor-pointer"
                    >
                      Replace
                    </button>
                    {onRemoveGuidelines && (
                      <button
                        type="button"
                        onClick={() => {
                          setGuidelinesFile(null);
                          onRemoveGuidelines();
                        }}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Remove criteria"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 shrink-0" />
                  <span>Formatting rules automatically parsed for Step 2 Review</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  if (!jobId) {
                    setErrorMessage('Please upload your assignment report first.');
                    return;
                  }
                  guidelinesInputRef.current?.click();
                }}
                className="py-8 flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                {isUploadingGuidelines ? (
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800">Drop assignment criteria brief</span>
                <span className="text-[10px] text-slate-400 mt-0.5">or click to browse (.pdf, .docx, .txt)</span>
              </div>
            )}
          </div>

          <input
            ref={guidelinesInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) processGuidelinesFile(e.target.files[0]);
            }}
          />
        </div>

        {/* ==================================================== */}
        {/* ZONE 3: OFFICIAL COLLEGE COVER PAGE (OPAQUE ASSET) */}
        {/* ==================================================== */}
        <div
          className={`flex flex-col justify-between p-5 rounded-2xl border-2 transition-all ${
            templateFile || hasTemplateFile
              ? 'bg-amber-50/40 border-amber-200 shadow-xs'
              : 'bg-white border-dashed border-slate-300 hover:border-amber-400/80 hover:bg-slate-50/50'
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) processTemplateFile(e.dataTransfer.files[0]);
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100/70 px-2 py-0.5 rounded-md">
                3. Official Cover Page
              </span>
              {(templateFile || hasTemplateFile) && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-1">College Cover Page</h3>
            <p className="text-xs text-slate-500 mb-4">
              Your official institution cover (.docx or .pdf). Preserved 100% UNCHANGED.
            </p>

            {templateFile || hasTemplateFile ? (
              <div className="p-3 rounded-xl bg-white border border-amber-100 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck className="w-5 h-5 text-amber-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {templateFile ? templateFile.name : 'Official Cover Attached'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {templateFile ? formatFileSize(templateFile.size) : 'Protected asset'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => templateInputRef.current?.click()}
                      className="text-2xs font-semibold text-amber-600 hover:underline cursor-pointer"
                    >
                      Replace
                    </button>
                    {onRemoveTemplate && (
                      <button
                        type="button"
                        onClick={() => {
                          setTemplateFile(null);
                          setCoverPreviewUrl(null);
                          onRemoveTemplate();
                        }}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Remove cover"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Cover Thumbnail Preview */}
                {coverPreviewUrl && (
                  <div className="relative mt-2 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 max-h-32 flex items-center justify-center">
                    <img
                      src={coverPreviewUrl}
                      alt="Cover Preview"
                      className="max-h-32 object-contain shadow-2xs"
                      onError={() => setCoverPreviewUrl(null)}
                    />
                    <div className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                      Page 1 Preview
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Package-level preservation active (0% font/layout bleed)</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  if (!jobId) {
                    setErrorMessage('Please upload your assignment report first.');
                    return;
                  }
                  templateInputRef.current?.click();
                }}
                className="py-8 flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                {isUploadingCover ? (
                  <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-2" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <FileCheck className="w-6 h-6" />
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800">Drop official cover page</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Word (.docx) or PDF (.pdf)</span>
              </div>
            )}
          </div>

          <input
            ref={templateInputRef}
            type="file"
            accept=".docx,.pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) processTemplateFile(e.target.files[0]);
            }}
          />
        </div>
      </div>

      {/* ZONE 4 (OPTIONAL): MARKING SCHEME */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900">Optional: Marking Scheme / Rubric</h4>
              <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                Appended Unchanged
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {rubricFile || hasRubricFile
                ? `Attached: ${rubricFile ? rubricFile.name : 'Marking Scheme'}`
                : 'Upload grading criteria table (.docx, .pdf, .xlsx) to append at the end of the document.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {rubricFile || hasRubricFile ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Attached</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setRubricFile(null);
                  onRemoveRubric?.();
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!jobId) {
                  setErrorMessage('Please upload your assignment report first.');
                  return;
                }
                rubricInputRef.current?.click();
              }}
              disabled={isUploadingRubric}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              {isUploadingRubric ? 'Uploading...' : 'Attach Marking Scheme'}
            </button>
          )}
        </div>

        <input
          ref={rubricInputRef}
          type="file"
          accept=".pdf,.docx,.xlsx,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) processRubricFile(e.target.files[0]);
          }}
        />
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          {assignmentFile ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Report ready. Proceed to review extracted criteria.</span>
            </span>
          ) : (
            <span>Upload your assignment report to get started.</span>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!assignmentFile || !jobId || isUploading}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
            assignmentFile && jobId && !isUploading
              ? 'bg-academic-navy hover:bg-slate-900 text-white shadow-md'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Review Criteria (Step 2)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
