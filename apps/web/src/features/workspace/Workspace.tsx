import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { ProgressSteps } from '../../components/layout/ProgressSteps';
import { UploadStep } from './steps/UploadStep';
import { RequirementsStep } from './steps/RequirementsStep';
import { CoverPageStep } from './steps/CoverPageStep';
import { MarkingSchemeStep } from './steps/MarkingSchemeStep';
import { ReviewComplianceStep } from './steps/ReviewComplianceStep';
import { DownloadStep } from './steps/DownloadStep';
import {
  FormattingSettings,
  InspectionResult,
  ComplianceReport,
} from '../../types';
import { ScrollReveal } from '../../components/ui/ScrollReveal';

interface WorkspaceProps {
  settings: FormattingSettings;
  onUpdateSettings: (settings: FormattingSettings) => void;
  onOpenProfiles: () => void;
  initialFile?: File | null;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  settings,
  onUpdateSettings,
  onOpenProfiles,
  initialFile,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [jobId, setJobId] = useState<string | null>(null);
  const [assignmentFile, setAssignmentFile] = useState<File | null>(initialFile || null);
  const [inspection, setInspection] = useState<InspectionResult | null>(null);

  React.useEffect(() => {
    if (initialFile && !assignmentFile) {
      setAssignmentFile(initialFile);
    }
  }, [initialFile]);

  // Auxiliary files
  const [hasTemplateFile, setHasTemplateFile] = useState(false);
  const [, setHasGuidelinesFile] = useState(false);
  const [hasRubricFile, setHasRubricFile] = useState(false);

  // Results
  const [compliance, setCompliance] = useState<ComplianceReport | null>(null);
  const [hasPdfVersion, setHasPdfVersion] = useState(false);

  const handleAssignmentUploaded = (id: string, file: File, inspectRes: InspectionResult) => {
    setJobId(id);
    setAssignmentFile(file);
    setInspection(inspectRes);

    // If inspection detected headings or cover markers, update default title
    const updatedSettings: FormattingSettings = { ...settings };
    if (!updatedSettings.cover_page.assignment_title && inspectRes.detected_headings.length > 0) {
      updatedSettings.cover_page.assignment_title = inspectRes.detected_headings[0].text;
    }
    onUpdateSettings(updatedSettings);
  };

  const canNavigateTo = (stepId: number): boolean => {
    if (stepId === 1) return true;
    if (!jobId || !assignmentFile) return false;
    if (stepId === 6) return !!compliance;
    return true;
  };

  const handleFormattingCompleted = (comp: ComplianceReport, hasPdf = false) => {
    setCompliance(comp);
    setHasPdfVersion(hasPdf);
    setCurrentStep(6); // Move to Download
  };

  const handleReset = () => {
    setJobId(null);
    setAssignmentFile(null);
    setInspection(null);
    setCompliance(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col">
      {/* Workspace Sub-header Bar */}
      <ScrollReveal delay={0}>
        <div className="bg-slate-100/70 border-b border-slate-200 py-2 px-4 sm:px-8 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="Logo" className="w-4 h-4 rounded object-contain" />
            <span className="font-semibold text-slate-800">Formatting Workspace:</span>
            <span>{assignmentFile ? assignmentFile.name : 'Upload assignment to begin'}</span>
          </div>
          <button
            type="button"
            onClick={onOpenProfiles}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-academic-blue" />
            <span>Load College Preset Profile</span>
          </button>
        </div>
      </ScrollReveal>

      {/* Progress Steps Bar */}
      <ScrollReveal delay={100}>
        <ProgressSteps
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
          canNavigateTo={canNavigateTo}
        />
      </ScrollReveal>

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScrollReveal delay={150} key={currentStep}>
          {currentStep === 1 && (
            <UploadStep
              jobId={jobId}
              assignmentFile={assignmentFile}
              inspection={inspection}
              onAssignmentUploaded={handleAssignmentUploaded}
              onCoverTemplateUploaded={() => setHasTemplateFile(true)}
              onGuidelinesUploaded={() => setHasGuidelinesFile(true)}
              onMarkingSchemeUploaded={() => setHasRubricFile(true)}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <RequirementsStep
              settings={settings}
              onChange={onUpdateSettings}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <CoverPageStep
              settings={settings}
              hasTemplateFile={hasTemplateFile}
              onChange={(coverData) => onUpdateSettings({ ...settings, cover_page: coverData })}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <MarkingSchemeStep
              settings={settings}
              hasRubricFile={hasRubricFile}
              onChange={(markingData) =>
                onUpdateSettings({ ...settings, marking_scheme: markingData })
              }
              onNext={() => setCurrentStep(5)}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && jobId && (
            <ReviewComplianceStep
              jobId={jobId}
              settings={settings}
              inspection={inspection}
              compliance={compliance}
              onFormattingCompleted={handleFormattingCompleted}
              onBack={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 6 && jobId && (
            <DownloadStep
              jobId={jobId}
              originalFilename={assignmentFile?.name || 'assignment.docx'}
              hasPdfVersion={hasPdfVersion}
              settings={settings}
              compliance={compliance}
              inspection={inspection}
              onModifySettings={() => setCurrentStep(2)}
              onReset={handleReset}
            />
          )}
        </ScrollReveal>
      </main>
    </div>
  );
};
