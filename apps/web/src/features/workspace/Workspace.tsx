import React, { useState } from 'react';
import { ProgressSteps } from '../../components/layout/ProgressSteps';
import { UploadStep } from './steps/UploadStep';
import { ReviewStep } from './steps/ReviewStep';
import { GenerateStep } from './steps/GenerateStep';
import { DownloadStep } from './steps/DownloadStep';
import { DocumentPreviewModal } from '../../components/preview/DocumentPreviewModal';
import {
  FormattingSettings,
  InspectionResult,
  ComplianceReport,
  GuidelineAnalysis,
  MarkingCriterion,
  JobStatusResponse,
} from '../../types';
import { ScrollReveal } from '../../components/ui/ScrollReveal';

interface WorkspaceProps {
  settings: FormattingSettings;
  onUpdateSettings: (settings: FormattingSettings) => void;
  onOpenProfiles: () => void;
  initialFile?: File | null;
  activeJobId?: string | null;
  onJobCreated?: (jobId: string, filename: string) => void;
  onFormattingCompleted?: (jobId: string, versionId: number) => void;
  onCheckWithDoctor?: (jobId: string, versionId?: number) => void;
  onCreatePowerPoint?: (jobId: string, versionId?: number) => void;
  onOpenRubric?: (jobId: string) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  settings,
  onUpdateSettings,
  onOpenProfiles: _onOpenProfiles,
  initialFile,
  activeJobId,
  onJobCreated,
  onFormattingCompleted,
  onCheckWithDoctor,
  onCreatePowerPoint,
  onOpenRubric: _onOpenRubric,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [jobId, setJobId] = useState<string | null>(activeJobId || null);
  const [assignmentFile, setAssignmentFile] = useState<File | null>(initialFile || null);
  const [inspection, setInspection] = useState<InspectionResult | null>(null);

  React.useEffect(() => {
    if (activeJobId && !jobId) {
      setJobId(activeJobId);
    }
  }, [activeJobId, jobId]);

  React.useEffect(() => {
    if (initialFile && !assignmentFile) {
      setAssignmentFile(initialFile);
    }
  }, [initialFile]);

  // Auxiliary files lifted state
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [guidelinesFile, setGuidelinesFile] = useState<File | null>(null);
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [guidelineEvidence, setGuidelineEvidence] = useState<string[]>([]);
  const [rubricCriteriaCount, setRubricCriteriaCount] = useState<number>(
    settings.marking_scheme?.criteria?.length || 0
  );
  const [hasTemplateFile, setHasTemplateFile] = useState(
    settings.cover_page?.mode === 'template'
  );
  const [hasGuidelinesFile, setHasGuidelinesFile] = useState(false);
  const [hasRubricFile, setHasRubricFile] = useState(
    (settings.marking_scheme?.criteria?.length || 0) > 0
  );

  // Results
  const [compliance, setCompliance] = useState<ComplianceReport | null>(null);
  const [hasPdfVersion, setHasPdfVersion] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleAssignmentUploaded = (id: string, file: File, inspectRes: InspectionResult) => {
    setJobId(id);
    setAssignmentFile(file);
    setInspection(inspectRes);
    onJobCreated?.(id, file.name);

    const updatedSettings: FormattingSettings = { ...settings };
    if (!updatedSettings.cover_page.assignment_title && inspectRes.detected_headings.length > 0) {
      updatedSettings.cover_page.assignment_title = inspectRes.detected_headings[0].text;
    }
    onUpdateSettings(updatedSettings);
  };

  const handleCoverTemplateUploaded = (file: File) => {
    setTemplateFile(file);
    setHasTemplateFile(true);
    onUpdateSettings({
      ...settings,
      cover_page: {
        ...settings.cover_page,
        mode: 'template',
        enabled: true,
      },
    });
  };

  const handleGuidelinesUploaded = (file: File, analysis: GuidelineAnalysis) => {
    setGuidelinesFile(file);
    setHasGuidelinesFile(true);
    if (analysis.evidence) {
      setGuidelineEvidence(analysis.evidence);
    }

    // Automatically apply high-confidence criteria rules to settings
    if (analysis.suggestions) {
      const merged: FormattingSettings = { ...settings };
      const s = analysis.suggestions;
      if (s.paper_size) merged.paper_size = s.paper_size;
      if (s.body) {
        merged.body = { ...merged.body, ...s.body };
      }
      if (s.heading1) {
        merged.heading1 = { ...merged.heading1, ...s.heading1 };
      }
      if (s.margins) {
        merged.margins = { ...merged.margins, ...s.margins };
      }
      onUpdateSettings(merged);
    }
  };

  const handleMarkingSchemeUploaded = (file: File, criteria: MarkingCriterion[]) => {
    setRubricFile(file);
    setHasRubricFile(true);
    setRubricCriteriaCount(criteria.length);
    onUpdateSettings({
      ...settings,
      marking_scheme: {
        ...settings.marking_scheme,
        enabled: true,
        criteria,
      },
    });
  };

  const handleRemoveTemplate = () => {
    setTemplateFile(null);
    setHasTemplateFile(false);
    onUpdateSettings({
      ...settings,
      cover_page: {
        ...settings.cover_page,
        mode: 'builtin',
      },
    });
  };

  const handleRemoveGuidelines = () => {
    setGuidelinesFile(null);
    setHasGuidelinesFile(false);
    setGuidelineEvidence([]);
  };

  const handleRemoveRubric = () => {
    setRubricFile(null);
    setHasRubricFile(false);
    setRubricCriteriaCount(0);
    onUpdateSettings({
      ...settings,
      marking_scheme: {
        ...settings.marking_scheme,
        enabled: false,
        criteria: [],
      },
    });
  };

  const canNavigateTo = (stepId: number): boolean => {
    if (stepId === 1) return true;
    if (!jobId || !assignmentFile) return false;
    if (stepId === 2) return true;
    if (stepId === 3) return true;
    if (stepId === 4) return !!compliance;
    return false;
  };

  const handleGenerationComplete = (res: JobStatusResponse) => {
    setCompliance(res.compliance || null);
    setHasPdfVersion(true);
    if (jobId) {
      onFormattingCompleted?.(jobId, res.current_version_id || 2);
    }
    setCurrentStep(4);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setJobId(null);
    setAssignmentFile(null);
    setTemplateFile(null);
    setGuidelinesFile(null);
    setRubricFile(null);
    setInspection(null);
    setCompliance(null);
    setHasPdfVersion(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0">
      {/* 4-Step Progress Navigation Bar */}
      <ProgressSteps
        currentStep={currentStep}
        onStepClick={(step) => {
          if (canNavigateTo(step)) setCurrentStep(step);
        }}
        canNavigateTo={canNavigateTo}
      />

      {/* Main Step Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ScrollReveal key={currentStep}>
          {currentStep === 1 && (
            <UploadStep
              jobId={jobId}
              assignmentFile={assignmentFile}
              inspection={inspection}
              templateFile={templateFile}
              guidelinesFile={guidelinesFile}
              rubricFile={rubricFile}
              guidelineEvidence={guidelineEvidence}
              rubricCriteriaCount={rubricCriteriaCount}
              hasTemplateFile={hasTemplateFile}
              hasGuidelinesFile={hasGuidelinesFile}
              hasRubricFile={hasRubricFile}
              onAssignmentUploaded={handleAssignmentUploaded}
              onCoverTemplateUploaded={handleCoverTemplateUploaded}
              onGuidelinesUploaded={handleGuidelinesUploaded}
              onMarkingSchemeUploaded={handleMarkingSchemeUploaded}
              onRemoveTemplate={handleRemoveTemplate}
              onRemoveGuidelines={handleRemoveGuidelines}
              onRemoveRubric={handleRemoveRubric}
              onNext={() => setCurrentStep(2)}
              onDirectPPT={(_file) => {
                if (onCreatePowerPoint && jobId) {
                  onCreatePowerPoint(jobId);
                }
              }}
            />
          )}

          {currentStep === 2 && (
            <ReviewStep
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              guidelineEvidence={guidelineEvidence}
              hasCoverTemplate={hasTemplateFile}
              hasRubric={hasRubricFile}
              coverFilename={templateFile?.name}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && jobId && (
            <GenerateStep
              jobId={jobId}
              settings={settings}
              hasCoverTemplate={hasTemplateFile}
              hasRubric={hasRubricFile}
              onGenerationComplete={handleGenerationComplete}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && jobId && (
            <DownloadStep
              jobId={jobId}
              originalFilename={assignmentFile?.name || 'Assignment.docx'}
              hasPdfVersion={hasPdfVersion}
              settings={settings}
              compliance={compliance}
              inspection={inspection}
              hasCoverTemplate={hasTemplateFile}
              hasRubric={hasRubricFile}
              onModifySettings={() => setCurrentStep(2)}
              onReset={handleReset}
              onOpenPreview={() => setIsPreviewOpen(true)}
              onCheckWithDoctor={
                onCheckWithDoctor && jobId ? () => onCheckWithDoctor(jobId) : undefined
              }
              onCreatePowerPoint={
                onCreatePowerPoint && jobId ? () => onCreatePowerPoint(jobId) : undefined
              }
            />
          )}
        </ScrollReveal>
      </div>

      {/* Interactive Document Preview Modal */}
      {jobId && (
        <DocumentPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          settings={settings}
          inspection={inspection}
          filename={assignmentFile?.name || 'Assignment.docx'}
        />
      )}
    </div>
  );
};
