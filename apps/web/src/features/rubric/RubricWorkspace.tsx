import React, { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronLeft,
  RefreshCw,
  FileText,
  ShieldAlert,
  Presentation,
  BookOpen,
} from 'lucide-react';
import { RubricAnalysisResult, AssessmentCriterion } from '../../types';
import { api, ApiError } from '../../lib/api';
import { projectsManager } from '../../lib/projectsManager';

interface RubricWorkspaceProps {
  onBackToLanding: () => void;
  onOpenPresentation: (file?: File) => void;
  onOpenWorkspace: (file?: File) => void;
  activeJobId?: string | null;
  activeVersionId?: number | null;
  onCheckWithDoctor?: (jobId: string, versionId?: number) => void;
}

export const RubricWorkspace: React.FC<RubricWorkspaceProps> = ({
  onBackToLanding,
  onOpenPresentation,
  onOpenWorkspace,
  activeJobId,
  activeVersionId,
  onCheckWithDoctor,
}) => {
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rubricResult, setRubricResult] = useState<RubricAnalysisResult | null>(null);
  const [complianceResult, setComplianceResult] = useState<RubricAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'CRITERIA' | 'MAPPING'>('CRITERIA');

  const rubricInputRef = useRef<HTMLInputElement>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);

  const loadProjectRubric = async (jobId: string, vId?: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getProjectRubricAnalysis(jobId, vId);
      if (res && res.criteria) {
        setComplianceResult(res);
        setRubricResult({
          rubric_title: res.rubric_title || 'Project Marking Scheme',
          total_criteria_count: res.criteria_count || res.criteria.length,
          total_weight_found: res.total_weight || 100,
          criteria: res.criteria,
          overall_compliance_score: res.compliance_score,
          required_criteria_covered: res.required_criteria_covered,
        });
        setActiveTab('MAPPING');
      }
    } catch (err: any) {
      // If 404, no rubric yet attached to project; ready for upload
      console.log('Project has no existing rubric or analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeJobId) {
      loadProjectRubric(activeJobId, activeVersionId || undefined);
    }
  }, [activeJobId, activeVersionId]);

  const handleAnalyzeRubric = async (file: File) => {
    setRubricFile(file);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (activeJobId) {
        await api.uploadMarkingScheme(activeJobId, file);
        await loadProjectRubric(activeJobId, activeVersionId || undefined);
        return;
      }

      const res = await api.analyzeRubricFile(file);
      setRubricResult(res);
      setActiveTab('CRITERIA');

      projectsManager.add({
        title: `Rubric: ${file.name}`,
        type: 'rubric',
        sourceFilename: file.name,
        fileSizeBytes: file.size,
        status: 'processed',
        summary: `Parsed ${res.total_criteria_count} criteria • ${res.total_weight_found}% total weight`,
      });

      // If report already selected, auto-run mapping
      if (reportFile) {
        await handleMapCompliance(res.criteria, reportFile);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to parse marking scheme. Supported formats include PDF, DOCX, XLSX, and TXT.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectReport = async (file: File) => {
    setReportFile(file);
    if (rubricResult) {
      await handleMapCompliance(rubricResult.criteria, file);
    }
  };

  const handleMapCompliance = async (criteria: AssessmentCriterion[], repFile: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Analyze report first
      const formData = new FormData();
      formData.append('file', repFile);
      const repRes = await fetch('/api/presentation/analyze-report', {
        method: 'POST',
        body: formData,
      });
      if (!repRes.ok) throw new Error('Failed to analyze assignment draft.');
      const reportData = await repRes.json();

      // 2. Map compliance
      const mapRes = await api.mapRubricCompliance(reportData, criteria);
      setComplianceResult(mapRes);
      setActiveTab('MAPPING');

      projectsManager.add({
        title: `Rubric Alignment: ${repFile.name}`,
        type: 'rubric',
        sourceFilename: repFile.name,
        status: 'processed',
        summary: `Compliance Score: ${mapRes.overall_compliance_score || 0}% • ${mapRes.required_criteria_covered || 'N/A'} criteria covered`,
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to evaluate assignment against rubric criteria.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'strong_match':
      case 'covered_with_evidence':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Covered
          </span>
        );
      case 'partial_match':
      case 'partially_covered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Partially Covered
          </span>
        );
      case 'missing_evidence':
      case 'missing_from_report':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Not Found
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5" />
            Needs Manual Review
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header */}
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
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            <span>Smart Marking-Scheme Analyzer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Extract assessment criteria, weights, and expected deliverables from your lecturer's rubric and map them directly against your assignment.
          </p>
        </div>

        {rubricResult && (
          <button
            onClick={() => {
              setRubricResult(null);
              setComplianceResult(null);
              setRubricFile(null);
              setReportFile(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Upload New Rubric</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Shared Project Mode Banner */}
      {activeJobId && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-950">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-900">Shared Project Mode:</span>
            <span className="font-medium text-indigo-800">
              Marking scheme is linked to project document {activeVersionId ? `(v${activeVersionId})` : ''} and shared across Doctor & Slides.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {onCheckWithDoctor && (
              <button
                type="button"
                onClick={() => onCheckWithDoctor(activeJobId, activeVersionId || undefined)}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
              >
                Inspect in Doctor
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenPresentation()}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
            >
              Build Slide Deck
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD CARDS */}
      {!rubricResult && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div
            onClick={() => rubricInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-600 rounded-2xl p-10 text-center cursor-pointer bg-slate-50/50 hover:bg-white transition-all shadow-xs"
          >
            <input
              ref={rubricInputRef}
              type="file"
              accept=".docx,.pdf,.xlsx,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleAnalyzeRubric(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 border border-indigo-100 shadow-2xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Upload Lecturer's Marking Rubric / Assessment Criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
              Upload PDF rubric, Word (.docx) assessment brief, Excel (.xlsx) criteria sheet, or text file.
            </p>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-academic-navy hover:bg-academic-indigo shadow-xs">
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Criteria & Weights...</span>
                </>
              ) : (
                <span>Select Marking Scheme</span>
              )}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Transparent Academic Evaluation Protocol:</span>
            <p className="leading-relaxed">
              AssignmentReady extracts criteria titles, marks, and descriptions. It maps them strictly to evidence in your report without inventing scores or guaranteeing lecturer grades.
            </p>
          </div>
        </div>
      )}

      {/* RUBRIC DASHBOARD */}
      {rubricResult && (
        <div className="space-y-6">
          {/* Top Metric Bar */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {rubricFile?.name || 'Marking Scheme'}
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                {rubricResult.rubric_title}
              </h3>
              <p className="text-xs text-slate-500">
                Extracted {rubricResult.total_criteria_count} assessment criteria • Total weight:{' '}
                {rubricResult.total_weight_found}%
              </p>
            </div>

            {/* Optional Report Upload / Mapping Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <input
                ref={reportInputRef}
                type="file"
                accept=".docx,.pdf,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleSelectReport(e.target.files[0]);
                  }
                }}
              />
              <button
                onClick={() => reportInputRef.current?.click()}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-academic-navy bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{reportFile ? `Report: ${reportFile.name}` : 'Upload Assignment to Map'}</span>
              </button>

              <button
                onClick={() => onOpenPresentation(reportFile || undefined)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-academic-navy hover:bg-academic-indigo transition-colors shadow-xs cursor-pointer"
              >
                <Presentation className="w-4 h-4" />
                <span>Create Presentation from Rubric</span>
              </button>

              <button
                onClick={() => onOpenWorkspace(reportFile || undefined)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Format in Workspace</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('CRITERIA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'CRITERIA'
                  ? 'bg-academic-navy text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Extracted Criteria ({rubricResult.criteria.length})
            </button>
            <button
              onClick={() => setActiveTab('MAPPING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'MAPPING'
                  ? 'bg-academic-navy text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Assignment Evidence Mapping {complianceResult ? `(${complianceResult.overall_compliance_score || 0}%)` : ''}
            </button>
          </div>

          {/* TAB 1: CRITERIA LIST */}
          {activeTab === 'CRITERIA' && (
            <div className="space-y-3">
              {rubricResult.criteria.map((crit, idx) => (
                <div
                  key={crit.id || idx}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center border border-indigo-200">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{crit.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {crit.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      {crit.weight_percent > 0 && (
                        <span className="font-bold text-indigo-600">
                          Weight: {crit.weight_percent}%
                        </span>
                      )}
                      {crit.max_marks > 0 && (
                        <span className="text-slate-400">
                          Max Marks: {crit.max_marks}
                        </span>
                      )}
                    </div>
                  </div>

                  {crit.description && (
                    <p className="text-xs text-slate-600 leading-relaxed pl-8">
                      {crit.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: COMPLIANCE MAPPING */}
          {activeTab === 'MAPPING' && (
            <div className="space-y-4">
              {!complianceResult ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                  <FileText className="w-10 h-10 mx-auto text-slate-300" />
                  <h4 className="font-bold text-sm text-slate-800">
                    No Assignment Draft Attached Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Upload your Word (.docx) or PDF assignment report to map each rubric criterion against your text.
                  </p>
                  <button
                    onClick={() => reportInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-academic-navy hover:bg-academic-indigo cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Assignment Draft</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {complianceResult.compliance_matches?.map((m, idx) => (
                    <div
                      key={m.criterion_id || idx}
                      className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">
                            {m.criterion_title}
                          </h4>
                          <span className="text-xs font-bold text-indigo-600">
                            ({m.weight_percent}%)
                          </span>
                        </div>
                        {getStatusBadge(m.status)}
                      </div>

                      <div className="text-xs text-slate-600 space-y-1.5">
                        <p>
                          <span className="font-semibold text-slate-800">Recommendation: </span>
                          {m.recommendation}
                        </p>
                        {m.matched_sections.length > 0 && (
                          <p>
                            <span className="font-semibold text-slate-800">Matched In Report Sections: </span>
                            <span className="text-slate-500">{m.matched_sections.join(', ')}</span>
                          </p>
                        )}
                        {m.evidence_snippets.length > 0 && (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 italic space-y-1">
                            {m.evidence_snippets.map((snip, sIdx) => (
                              <p key={sIdx}>"{snip}"</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
