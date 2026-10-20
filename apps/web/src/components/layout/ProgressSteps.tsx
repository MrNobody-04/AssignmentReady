import React from 'react';
import { Check, Upload, Sliders, FileText, Layers, FileCheck, ShieldAlert, Download } from 'lucide-react';

export interface StepItem {
  id: number;
  label: string;
  icon: React.ReactNode;
}

interface ProgressStepsProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  canNavigateTo: (step: number) => boolean;
}

export const WORKSPACE_STEPS: StepItem[] = [
  { id: 1, label: '1. Upload', icon: <Upload className="w-4 h-4" /> },
  { id: 2, label: '2. College Rules', icon: <Sliders className="w-4 h-4" /> },
  { id: 3, label: '3. Cover Page', icon: <FileText className="w-4 h-4" /> },
  { id: 4, label: '4. Front Matter', icon: <Layers className="w-4 h-4" /> },
  { id: 5, label: '5. Formatting & Pages', icon: <FileCheck className="w-4 h-4" /> },
  { id: 6, label: '6. Validate & Format', icon: <ShieldAlert className="w-4 h-4" /> },
  { id: 7, label: '7. Download', icon: <Download className="w-4 h-4" /> },
];

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  currentStep,
  onStepClick,
  canNavigateTo,
}) => {
  return (
    <nav aria-label="Progress" className="w-full bg-white border-b border-slate-200 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center justify-between sm:justify-center sm:gap-6 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          {WORKSPACE_STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isClickable = canNavigateTo(step.id);

            return (
              <li key={step.id} className="flex items-center shrink-0">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(step.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-hidden ${
                    isCurrent
                      ? 'bg-academic-navy text-white shadow-xs'
                      : isCompleted
                      ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 cursor-pointer'
                      : 'text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      isCurrent
                        ? 'bg-white/20 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.id}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>

                {idx < WORKSPACE_STEPS.length - 1 && (
                  <div className="w-4 sm:w-8 h-0.5 bg-slate-200 mx-1 sm:mx-2 shrink-0" />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
