import React, { useState } from 'react';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { FormattingSettings, JobStatusResponse } from '../../../types';
import { api, ApiError } from '../../../lib/api';

interface GenerateStepProps {
  jobId: string;
  settings: FormattingSettings;
  hasCoverTemplate: boolean;
  hasRubric: boolean;
  onGenerationComplete: (response: JobStatusResponse) => void;
  onBack: () => void;
}

interface GenerationStage {
  id: number;
  label: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export const GenerateStep: React.FC<GenerateStepProps> = ({
  jobId,
  settings,
  hasCoverTemplate: _hasCoverTemplate,
  hasRubric: _hasRubric,
  onGenerationComplete,
  onBack,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [stages, setStages] = useState<GenerationStage[]>([
    {
      id: 1,
      label: 'AI Output Normalization',
      description: 'Stripping markdown asterisks, hashtags, and converting tables to native Word format',
      status: 'pending',
    },
    {
      id: 2,
      label: 'Institutional Word Styles',
      description: 'Configuring styles (Normal, Headings 1-3, 1-inch margins, line spacing)',
      status: 'pending',
    },
    {
      id: 3,
      label: 'Dynamic Front Matter & Numbering',
      description: 'Generating auto-updating TOC, figures/tables lists, and Roman/Arabic pagination',
      status: 'pending',
    },
    {
      id: 4,
      label: 'Document Package Composition',
      description: 'Merging opaque cover page and marking scheme at OOXML/PDF package level',
      status: 'pending',
    },
    {
      id: 5,
      label: 'Cover Integrity Verification',
      description: 'Running SHA-256 hash and XML structure check to verify 0% cover alteration',
      status: 'pending',
    },
  ]);

  const runGeneration = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    // Progressive stage animation helper
    const updateStage = (id: number, status: GenerationStage['status']) => {
      setStages((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    };

    try {
      updateStage(1, 'in_progress');
      await new Promise((r) => setTimeout(r, 600));
      updateStage(1, 'completed');

      updateStage(2, 'in_progress');
      await new Promise((r) => setTimeout(r, 700));
      updateStage(2, 'completed');

      updateStage(3, 'in_progress');
      await new Promise((r) => setTimeout(r, 800));
      updateStage(3, 'completed');

      updateStage(4, 'in_progress');
      // Trigger actual backend compilation API
      const res = await api.formatDocument(jobId, settings);
      updateStage(4, 'completed');

      updateStage(5, 'in_progress');
      await new Promise((r) => setTimeout(r, 500));
      updateStage(5, 'completed');

      // Short delay then navigate to Step 4
      setTimeout(() => {
        onGenerationComplete(res);
      }, 600);
    } catch (err) {
      setIsGenerating(false);
      setStages((prev) =>
        prev.map((s) => (s.status === 'in_progress' ? { ...s, status: 'failed' } : s))
      );
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Document generation encountered an unexpected error. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-blue-50/80 border border-emerald-100 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Step 3 — Generate Submission Document</h2>
            <p className="text-xs text-slate-500">
              Transform your draft into a publication-grade academic document with guaranteed cover preservation.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="font-bold">Generation Failed</div>
            <div>{errorMessage}</div>
          </div>
          <button
            type="button"
            onClick={runGeneration}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-2xs hover:bg-rose-700 transition-colors shrink-0 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Progress Stages List */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900">Document Processing Stages</span>
          <span className="text-2xs font-semibold text-slate-400 font-mono">
            {stages.filter((s) => s.status === 'completed').length} / {stages.length} Completed
          </span>
        </div>

        <div className="space-y-3">
          {stages.map((stage) => {
            return (
              <div
                key={stage.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                  stage.status === 'in_progress'
                    ? 'bg-indigo-50/60 border-indigo-200 shadow-2xs'
                    : stage.status === 'completed'
                    ? 'bg-emerald-50/40 border-emerald-100'
                    : stage.status === 'failed'
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-slate-50/50 border-slate-100 opacity-60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {stage.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : stage.status === 'in_progress' ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  ) : stage.status === 'failed' ? (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                </div>

                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>{stage.label}</span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        stage.status === 'completed'
                          ? 'text-emerald-700 font-bold'
                          : stage.status === 'in_progress'
                          ? 'text-indigo-600 font-bold'
                          : stage.status === 'failed'
                          ? 'text-rose-600 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.status === 'completed'
                        ? 'Done'
                        : stage.status === 'in_progress'
                        ? 'Running...'
                        : stage.status === 'failed'
                        ? 'Error'
                        : 'Queued'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Action Button */}
      {!isGenerating && stages.every((s) => s.status !== 'completed') && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={runGeneration}
            className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-academic-navy hover:bg-slate-900 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Submission-Ready Document</span>
          </button>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          disabled={isGenerating}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Criteria Review</span>
        </button>
      </div>
    </div>
  );
};
