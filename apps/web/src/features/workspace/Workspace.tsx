import React, { useState } from 'react';
import { BookOpen, Eye } from 'lucide-react';
import { ProgressSteps } from '../../components/layout/ProgressSteps';
import { UploadStep } from './steps/UploadStep';
import { CollegeRulesStep } from './steps/CollegeRulesStep';
import { CoverPageStep } from './steps/CoverPageStep';
import { FrontMatterStep } from './steps/FrontMatterStep';
import { RequirementsStep } from './steps/RequirementsStep';
import { ReviewComplianceStep } from './steps/ReviewComplianceStep';
import { DownloadStep } from './steps/DownloadStep';
import { DocumentPreviewModal } from '../../components/preview/DocumentPreviewModal';
import {
  FormattingSettings,
  InspectionResult,
  ComplianceReport,
} from '../../types';
import { api } from '../../lib/api';
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
  onOpenProfiles,
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

  // Auxiliary files lifted state to preserve uploads across step navigation
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
    if (stepId === 7) return !!compliance;
    return true;
  };

  const handleFormattingCompleted = (comp: ComplianceReport, hasPdf = false) => {
    setCompliance(comp);
    setHasPdfVersion(hasPdf);
    if (jobId) {
      onFormattingCompleted?.(jobId, 2);
    }
    setCurrentStep(7); // Move to Download
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

  const handleReset = () => {
    setJobId(null);
    setAssignmentFile(null);
    setTemplateFile(null);
    setGuidelinesFile(null);
    setRubricFile(null);
    setGuidelineEvidence([]);
    setRubricCriteriaCount(0);
    setHasTemplateFile(false);
    setHasGuidelinesFile(false);
    setHasRubricFile(false);
    setInspection(null);
    setCompliance(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col">
      {/* Workspace Sub-header Bar */}
      <ScrollReveal delay={0}>
        <div className="bg-slate-100/80 border-b border-slate-200 py-2 sm:py-2.5 px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/logo.jpg" alt="Logo" className="w-4 h-4 rounded object-contain shrink-0" />
            <span className="font-semibold text-slate-800 whitespace-nowrap">Formatting Workspace:</span>
            <span className="truncate text-slate-600 font-medium max-w-[170px] sm:max-w-xs md:max-w-md">
              {assignmentFile ? assignmentFile.name : 'Upload assignment to begin'}
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer text-xs"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={onOpenProfiles}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer text-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-academic-blue" />
              <span className="hidden sm:inline">Load College Profile</span>
              <span className="sm:hidden">College Profiles</span>
            </button>
          </div>
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
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <UploadStep
              jobId={jobId}
              assignmentFile={assignmentFile}
              inspection={inspection}
              templateFile={templateFile}
              guidelinesFile={guidelinesFile}
              rubricFile={rubricFile}
              guidelineEvidence={guidelineEvidence}
              rubricCriteriaCount={rubricCriteriaCount || settings.marking_scheme?.criteria?.length || 0}
              hasTemplateFile={hasTemplateFile || !!templateFile}
              hasGuidelinesFile={hasGuidelinesFile || !!guidelinesFile}
              hasRubricFile={hasRubricFile || !!rubricFile || (settings.marking_scheme?.criteria?.length || 0) > 0}
              onAssignmentUploaded={handleAssignmentUploaded}
              onCoverTemplateUploaded={(file) => {
                setTemplateFile(file);
                setHasTemplateFile(true);
                onUpdateSettings({
                  ...settings,
                  cover_page: { ...settings.cover_page, mode: 'template', enabled: true },
                });
              }}
              onGuidelinesUploaded={(file, analysis) => {
                setGuidelinesFile(file);
                setHasGuidelinesFile(true);
                const ev = analysis?.evidence || [];
                setGuidelineEvidence(ev);
                if (!analysis?.has_suggestions) return;
                const suggested = analysis.suggestions;
                onUpdateSettings({
                  ...settings,
                  ...(suggested.paper_size ? { paper_size: suggested.paper_size } : {}),
                  ...(suggested.margins ? { margins: { ...settings.margins, ...suggested.margins } } : {}),
                  ...(suggested.body ? { body: { ...settings.body, ...suggested.body } } : {}),
                  ...(suggested.required_sections ? { required_sections: suggested.required_sections } : {}),
                });
              }}
              onMarkingSchemeUploaded={(file, criteria) => {
                setRubricFile(file);
                setHasRubricFile(true);
                setRubricCriteriaCount(criteria.length);
                onUpdateSettings({
                  ...settings,
                  marking_scheme: {
                    ...settings.marking_scheme,
                    enabled: criteria.length > 0,
                    criteria,
                  },
                });
              }}
              onRemoveTemplate={handleRemoveTemplate}
              onRemoveGuidelines={handleRemoveGuidelines}
              onRemoveRubric={handleRemoveRubric}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {/* Step 2: College Rules & Profile */}
          {currentStep === 2 && (
            <CollegeRulesStep
              settings={settings}
              onChange={onUpdateSettings}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
              onOpenProfilesModal={onOpenProfiles}
            />
          )}

          {/* Step 3: Cover Page Details */}
          {currentStep === 3 && (
            <CoverPageStep
              settings={settings}
              hasTemplateFile={hasTemplateFile || !!templateFile}
              templateFile={templateFile}
              onUploadTemplate={async (file) => {
                if (jobId) {
                  await api.uploadCoverTemplate(jobId, file);
                }
                setTemplateFile(file);
                setHasTemplateFile(true);
                onUpdateSettings({
                  ...settings,
                  cover_page: { ...settings.cover_page, mode: 'template', enabled: true },
                });
              }}
              onChange={(coverData) => onUpdateSettings({ ...settings, cover_page: coverData })}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {/* Step 4: Required Front Matter */}
          {currentStep === 4 && (
            <FrontMatterStep
              settings={settings}
              inspection={inspection}
              onChange={onUpdateSettings}
              onNext={() => setCurrentStep(5)}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {/* Step 5: Formatting & Page Numbering */}
          {currentStep === 5 && (
            <RequirementsStep
              settings={settings}
              onChange={onUpdateSettings}
              onNext={() => setCurrentStep(6)}
              onBack={() => setCurrentStep(4)}
            />
          )}

          {/* Step 6: Process & Validate */}
          {currentStep === 6 && jobId && (
            <ReviewComplianceStep
              jobId={jobId}
              settings={settings}
              inspection={inspection}
              compliance={compliance}
              onFormattingCompleted={handleFormattingCompleted}
              onBack={() => setCurrentStep(5)}
            />
          )}

          {/* Step 7: Download Formatted Document */}
          {currentStep === 7 && jobId && (
            <DownloadStep
              jobId={jobId}
              originalFilename={assignmentFile?.name || 'assignment.docx'}
              hasPdfVersion={hasPdfVersion}
              settings={settings}
              compliance={compliance}
              inspection={inspection}
              onModifySettings={() => setCurrentStep(2)}
              onReset={handleReset}
              onOpenPreview={() => setIsPreviewOpen(true)}
              onCheckWithDoctor={() => onCheckWithDoctor?.(jobId, 2)}
              onCreatePowerPoint={() => onCreatePowerPoint?.(jobId, 2)}
            />
          )}
        </ScrollReveal>
      </main>

      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        settings={settings}
        inspection={inspection}
        filename={assignmentFile?.name}
      />
    </div>
  );
};
