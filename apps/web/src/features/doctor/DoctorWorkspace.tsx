import React, { useState, useRef, useEffect } from 'react';
import {
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Wrench,
  Download,
  RefreshCw,
  ChevronLeft,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Presentation,
} from 'lucide-react';
import { DoctorDiagnosisResponse, FormattingSettings, DocumentVersionInfo } from '../../types';
import { api, ApiError } from '../../lib/api';
import { projectsManager } from '../../lib/projectsManager';

interface DoctorWorkspaceProps {
  onBackToLanding: () => void;
  onOpenWorkspace: (file?: File) => void;
  activeJobId?: string;
  activeVersionId?: number;
  settings?: FormattingSettings;
  onOpenPresentation?: (jobId?: string, versionId?: number) => void;
}

export const DoctorWorkspace: React.FC<DoctorWorkspaceProps> = ({
  onBackToLanding,
  onOpenWorkspace,
  activeJobId,
  activeVersionId,
  settings,
  onOpenPresentation,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DoctorDiagnosisResponse | null>(null);
  const [availableVersions, setAvailableVersions] = useState<DocumentVersionInfo[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | undefined>(activeVersionId);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [repairedDownloadUrl, setRepairedDownloadUrl] = useState<string | null>(null);
  const [repairedFilename, setRepairedFilename] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'NOTICE'>('ALL');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeJobId) {
      setIsLoading(true);
      // Fetch available versions
      api.getDocumentVersions(activeJobId)
        .then((vData) => {
          if (vData && vData.versions) {
            setAvailableVersions(vData.versions);
          }
        })
        .catch(() => {});

      // Diagnose requested version or latest
      api.diagnoseExistingJob(activeJobId, activeVersionId)
        .then((res: DoctorDiagnosisResponse) => {
          setDiagnosis(res);
          setSelectedVersionId(res.version_id);
          const autoFixable = res.issues.filter((i: any) => i.can_fix_automatically).map((i: any) => i.fix_action);
          setSelectedActions(Array.from(new Set(autoFixable)));
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [activeJobId, activeVersionId]);

  const handleSwitchVersion = async (vId: number) => {
    if (!activeJobId && !diagnosis) return;
    const jId = activeJobId || diagnosis!.job_id;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res: DoctorDiagnosisResponse = await api.diagnoseExistingJob(jId, vId);
      setDiagnosis(res);
      setSelectedVersionId(vId);
      const autoFixable = res.issues.filter((i: any) => i.can_fix_automatically).map((i: any) => i.fix_action);
      setSelectedActions(Array.from(new Set(autoFixable)));
    } catch {
      setErrorMessage(`Failed to diagnose Version ${vId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiagnoseFile = async (selectedFile: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setRepairedDownloadUrl(null);
    try {
      const res: DoctorDiagnosisResponse = await api.diagnoseUploadedAssignment(selectedFile);
      setDiagnosis(res);
      setSelectedVersionId(res.version_id);
      // Auto-select all fixable actions by default
      const autoFixable = res.issues.filter((i) => i.can_fix_automatically).map((i) => i.fix_action);
      setSelectedActions(Array.from(new Set(autoFixable)));

      // Save to student recent projects
      projectsManager.add({
        title: selectedFile.name,
        type: 'doctor',
        sourceFilename: selectedFile.name,
        fileSizeBytes: selectedFile.size,
        status: 'processed',
        jobId: res.job_id,
        summary: `Health Score: ${res.overall_health_score}/100 • ${res.total_issues} issues detected`,
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to diagnose document. Please verify it is a valid Word (.docx) or PDF document.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixIssues = async (fixAllSafe: boolean) => {
    if (!diagnosis) return;
    setIsFixing(true);
    setErrorMessage(null);
    try {
      const actionsToRun = fixAllSafe
        ? diagnosis.issues.filter((i) => i.can_fix_automatically).map((i) => i.fix_action)
        : selectedActions;

      const res = await api.fixAssignmentIssues(
        diagnosis.job_id,
        fixAllSafe,
        actionsToRun,
        settings,
        selectedVersionId || diagnosis.version_id
      );

      setDiagnosis(res.updated_diagnosis);
      setSelectedVersionId(res.updated_diagnosis.version_id);
      setRepairedDownloadUrl(res.download_url);
      setRepairedFilename(res.repaired_filename);

      // Refresh versions
      api.getDocumentVersions(diagnosis.job_id).then((vData) => {
        if (vData && vData.versions) setAvailableVersions(vData.versions);
      });

      projectsManager.add({
        title: res.repaired_filename,
        type: 'doctor',
        sourceFilename: diagnosis.filename,
        status: 'downloaded',
        jobId: diagnosis.job_id,
        downloadUrl: res.download_url,
        summary: `Repaired: ${actionsToRun.length} safe fixes applied • Score: ${res.updated_diagnosis.overall_health_score}/100 • Version ${res.updated_diagnosis.version_id}`,
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to apply selected fixes.');
      }
    } finally {
      setIsFixing(false);
    }
  };

  const toggleAction = (action: string) => {
    if (selectedActions.includes(action)) {
      setSelectedActions(selectedActions.filter((a) => a !== action));
    } else {
      setSelectedActions([...selectedActions, action]);
    }
  };

  const issues = diagnosis?.issues || [];
  const filteredIssues =
    filterSeverity === 'ALL' ? issues : issues.filter((i) => i.severity === filterSeverity);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Main Menu</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Stethoscope className="w-6 h-6 text-emerald-600" />
            <span>Assignment Doctor</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Intelligent pre-submission document diagnostic auditor. Inspects typography, heading jumps, margins, cover sheets, and citation consistency.
          </p>
        </div>

        {diagnosis && (
          <button
            onClick={() => {
              setDiagnosis(null);
              setRepairedFilename(null);
              setRepairedDownloadUrl(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Another Document</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* UPLOAD SCREEN */}
      {!diagnosis && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-2xl p-10 text-center cursor-pointer bg-slate-50/50 hover:bg-white transition-all shadow-xs"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.pdf,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleDiagnoseFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100 shadow-2xs">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Upload Assignment to Run Diagnostic Health Check
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
              Upload Word (.docx), PDF (.pdf), or text draft. Assignment Doctor performs 10 rule-based academic compliance checks and reports actionable fixes.
            </p>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-academic-navy hover:bg-academic-indigo shadow-xs">
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing Document Structure & Citations...</span>
                </>
              ) : (
                <span>Choose Assignment File</span>
              )}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-academic-blue" />
              <span>Diagnostic Safeguard & Academic Integrity</span>
            </div>
            <p className="text-blue-800 leading-relaxed pl-6">
              Assignment Doctor identifies structural, typographic, and bibliographic non-compliance. It never fabricates citations, research findings, or missing paragraphs.
            </p>
          </div>
        </div>
      )}

      {/* DIAGNOSTIC RESULTS DASHBOARD */}
      {diagnosis && (
        <div className="space-y-6">
          {/* Active Version & Shared Intelligence Banner */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border border-slate-800">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider text-2xs bg-indigo-500 text-white">
                Analyzed Document
              </span>
              <span className="font-bold text-amber-300 font-mono">
                {diagnosis.version_label || `Version ${diagnosis.version_id || 1}`}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300 truncate max-w-xs">{diagnosis.filename}</span>
              {diagnosis.is_latest_version && (
                <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Latest Version
                </span>
              )}
              {diagnosis.rubric_used && (
                <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Rubric: {diagnosis.rubric_summary}
                </span>
              )}
            </div>

            {/* Version Switcher Dropdown */}
            {availableVersions.length > 1 && (
              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <span className="text-2xs text-slate-400 font-semibold">Switch Version:</span>
                <select
                  value={selectedVersionId || diagnosis.version_id}
                  onChange={(e) => handleSwitchVersion(Number(e.target.value))}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {availableVersions.map((v) => (
                    <option key={v.version_id} value={v.version_id}>
                      {v.version_label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Health Score Overview */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-extrabold border-2 shadow-2xs ${
                  diagnosis.overall_health_score >= 80
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : diagnosis.overall_health_score >= 60
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300'
                }`}
              >
                <span className="text-2xl leading-none">{diagnosis.overall_health_score}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">/ 100</span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Document Health Diagnosis
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {diagnosis.filename}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {diagnosis.summary_message}
                </p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => handleFixIssues(false)}
                disabled={isFixing || selectedActions.length === 0}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-academic-navy hover:bg-academic-indigo disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              >
                {isFixing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" />}
                <span>Fix Selected ({selectedActions.length})</span>
              </button>

              <button
                onClick={() => handleFixIssues(true)}
                disabled={isFixing}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fix All Safe Issues</span>
              </button>

              {onOpenPresentation && (
                <button
                  onClick={() => onOpenPresentation(activeJobId || diagnosis.job_id, diagnosis.version_id)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  <Presentation className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Create Slides</span>
                </button>
              )}

              <button
                onClick={() => onOpenWorkspace()}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Formatter</span>
              </button>
            </div>
          </div>

          {/* Repaired Download Alert */}
          {repairedDownloadUrl && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">
                    Document Repaired Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Safe structural and typographic fixes were applied to OpenXML DOM. Original text and images preserved.
                  </p>
                </div>
              </div>

              <a
                href={repairedDownloadUrl}
                download={repairedFilename || 'Repaired_Document.docx'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Repaired Word (.docx)</span>
              </a>
            </div>
          )}

          {/* Issue Filters */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Diagnosed Issues ({diagnosis.total_issues})
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setFilterSeverity('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  filterSeverity === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({diagnosis.total_issues})
              </button>
              <button
                onClick={() => setFilterSeverity('CRITICAL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  filterSeverity === 'CRITICAL'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Critical ({diagnosis.critical_count})
              </button>
              <button
                onClick={() => setFilterSeverity('WARNING')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  filterSeverity === 'WARNING'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Warnings ({diagnosis.warning_count})
              </button>
              <button
                onClick={() => setFilterSeverity('NOTICE')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  filterSeverity === 'NOTICE'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Notices ({diagnosis.notice_count})
              </button>
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                No issues match the selected filter.
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const isSelected = selectedActions.includes(issue.fix_action);
                return (
                  <div
                    key={issue.id}
                    className={`p-5 rounded-2xl border bg-white shadow-2xs transition-all ${
                      issue.severity === 'CRITICAL'
                        ? 'border-rose-200/90'
                        : issue.severity === 'WARNING'
                        ? 'border-amber-200/90'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              issue.severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : issue.severity === 'WARNING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {issue.severity}
                          </span>
                          <span className="text-xs font-bold text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-500">{issue.category}</span>
                          <span className="text-xs font-bold text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-medium">Location: {issue.location}</span>
                        </div>

                        <h4 className="font-bold text-base text-slate-900 leading-snug">
                          {issue.issue}
                        </h4>

                        <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                          <p>
                            <span className="font-semibold text-slate-800">Why it matters: </span>
                            {issue.why_it_matters}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-800">Recommended fix: </span>
                            {issue.recommendation}
                          </p>
                        </div>
                      </div>

                      {/* Action selector */}
                      <div className="shrink-0 pt-1">
                        {issue.can_fix_automatically ? (
                          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleAction(issue.fix_action)}
                              className="rounded text-academic-blue focus:ring-academic-blue"
                            />
                            <span>Include in Automated Fix</span>
                          </label>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Requires Manual Review</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Citation & References Deep Report Drawer */}
          {diagnosis.citation_report && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-academic-blue" />
                  <h3 className="font-bold text-base text-slate-900">
                    Citation & Bibliographic Consistency Audit
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-academic-blue border border-blue-200">
                  {diagnosis.citation_report.detected_style}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {diagnosis.citation_report.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Unmatched citations */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Unmatched In-Text Citations ({diagnosis.citation_report.unmatched_in_text_citations.length})</span>
                  </h5>
                  {diagnosis.citation_report.unmatched_in_text_citations.length === 0 ? (
                    <p className="text-xs text-emerald-700">All detected in-text citations match bibliography entries.</p>
                  ) : (
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {diagnosis.citation_report.unmatched_in_text_citations.map((c, idx) => (
                        <div key={idx} className="text-xs text-slate-600 flex items-center justify-between">
                          <code className="bg-white px-1.5 py-0.5 rounded border text-[11px] font-mono">{c.raw_text}</code>
                          <span className="text-slate-400 text-[10px]">Para {c.paragraph_index}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Uncited references */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>Uncited Reference Entries ({diagnosis.citation_report.uncited_reference_entries.length})</span>
                  </h5>
                  {diagnosis.citation_report.uncited_reference_entries.length === 0 ? (
                    <p className="text-xs text-emerald-700">All bibliography entries are cited in the document text.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {diagnosis.citation_report.uncited_reference_entries.map((r, idx) => (
                        <p key={idx} className="text-xs text-slate-600 truncate" title={r.raw_text}>
                          {r.entry_index}. {r.raw_text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
