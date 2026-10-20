import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ListOrdered,
  Lightbulb,
} from 'lucide-react';
import {
  ComplianceReport,
  ComplianceCheckItem,
  InspectionResult,
  FormattingSettings,
} from '../../../types';
import { api, ApiError } from '../../../lib/api';

interface ReviewComplianceStepProps {
  jobId: string;
  settings: FormattingSettings;
  inspection: InspectionResult | null;
  compliance: ComplianceReport | null;
  onFormattingCompleted: (compliance: ComplianceReport, hasPdf?: boolean) => void;
  onBack: () => void;
}

export const ReviewComplianceStep: React.FC<ReviewComplianceStepProps> = ({
  jobId,
  settings,
  inspection,
  compliance,
  onFormattingCompleted,
  onBack,
}) => {
  const [isFormatting, setIsFormatting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'FAIL' | 'WARNING' | 'PASS'>('ALL');

  const handleApplyFormatting = async () => {
    setIsFormatting(true);
    setErrorMessage(null);
    try {
      const res = await api.formatDocument(jobId, settings);
      if (res.compliance) {
        onFormattingCompleted(res.compliance, res.has_pdf_version);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred while executing the formatting pipeline.');
      }
    } finally {
      setIsFormatting(false);
    }
  };

  const checks = compliance?.checks || [];
  const filteredChecks =
    filterStatus === 'ALL' ? checks : checks.filter((c) => c.status === filterStatus);

  const getStatusBadge = (status: ComplianceCheckItem['status']) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pass
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Warning
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Action Required
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5" />
            Notice
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Review & Academic Compliance Audit
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Review automated rule-based checks for typography, margins, heading depth, required sections, and cover metadata before generating your final document.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      {/* Compliance Overview Score Card */}
      {compliance && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl ${
                  compliance.score_percentage >= 80
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300'
                    : compliance.score_percentage >= 60
                    ? 'bg-amber-50 text-amber-700 border-2 border-amber-300'
                    : 'bg-rose-50 text-rose-700 border-2 border-rose-300'
                }`}
              >
                {compliance.score_percentage}%
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {compliance.score_percentage >= 80
                    ? 'High Academic Compliance'
                    : compliance.score_percentage >= 60
                    ? 'Moderate Compliance — Check Warnings'
                    : 'Corrections Required Before Submission'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audited across {compliance.total_checks} deterministic institutional requirements.
                </p>
              </div>
            </div>

            {/* Quick Filter Counters */}
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                  filterStatus === 'ALL'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All ({compliance.total_checks})
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('FAIL')}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                  filterStatus === 'FAIL'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-rose-700 border-slate-200 hover:bg-rose-50'
                }`}
              >
                Failed ({compliance.failed_count})
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('WARNING')}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                  filterStatus === 'WARNING'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-amber-700 border-slate-200 hover:bg-amber-50'
                }`}
              >
                Warnings ({compliance.warning_count})
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('PASS')}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                  filterStatus === 'PASS'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-emerald-700 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                Passed ({compliance.passed_count})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Checklist Items */}
      {compliance && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Verification Results ({filteredChecks.length})
            </h4>
          </div>

          {filteredChecks.map((item) => (
            <div key={item.id} className="p-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <h5 className="text-sm font-semibold text-slate-900">{item.name}</h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                {item.recommendation && (
                  <p className="text-xs text-academic-navy bg-blue-50/70 p-2 rounded-md font-medium mt-1">
                    Recommendation: {item.recommendation}
                  </p>
                )}
              </div>
              <div className="shrink-0">{getStatusBadge(item.status)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content Insights Panel */}
      {compliance?.content_insights && compliance.content_insights.length > 0 && (
        <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-5">
          <div className="flex items-center gap-2 mb-2 text-amber-900 font-semibold text-sm">
            <Lightbulb className="w-4 h-4 text-amber-700" />
            <span>Academic Writing & Section Observations</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-900 list-disc list-inside">
            {compliance.content_insights.map((insight, idx) => (
              <li key={idx} className="leading-relaxed">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Document Outline Inspection */}
      {inspection?.detected_headings && inspection.detected_headings.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-academic-blue" />
            <span>Detected Document Heading Outline ({inspection.detected_headings.length})</span>
          </h4>
          <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-2">
            {inspection.detected_headings.map((h, idx) => (
              <div
                key={idx}
                className={`text-xs py-1.5 px-3 rounded-md flex items-center justify-between ${
                  h.level === 1
                    ? 'bg-slate-100 font-bold text-slate-900'
                    : h.level === 2
                    ? 'ml-4 bg-slate-50 font-semibold text-slate-800'
                    : 'ml-8 text-slate-600'
                }`}
              >
                <span>{h.text}</span>
                <span className="text-[10px] text-slate-400 font-normal">Level {h.level}</span>
              </div>
            ))}
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
          <span>Back to Formatting & Page Setup</span>
        </button>

        <button
          type="button"
          disabled={isFormatting}
          onClick={handleApplyFormatting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-academic-navy hover:bg-academic-indigo rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          {isFormatting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Applying OpenXML Formatting...</span>
            </>
          ) : (
            <>
              <span>Apply Formatting & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
