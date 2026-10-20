import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Folder,
  ChevronDown,
  Download,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Stethoscope,
  Presentation,
  Check,
} from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './features/landing/LandingPage';
import { FormattingSettings, CollegeProfile, AppView, DocumentVersionInfo } from './types';
import { DEFAULT_FORMATTING_SETTINGS } from './lib/profiles';
import { api } from './lib/api';

// Dynamic code-split chunks for high-performance LCP and bundle budgets
const Workspace = lazy(() => import('./features/workspace/Workspace').then((m) => ({ default: m.Workspace })));
const PresentationWorkspace = lazy(() => import('./features/presentation/PresentationWorkspace').then((m) => ({ default: m.PresentationWorkspace })));
const DoctorWorkspace = lazy(() => import('./features/doctor/DoctorWorkspace').then((m) => ({ default: m.DoctorWorkspace })));
const ProfileManagerModal = lazy(() => import('./features/profiles/ProfileManagerModal').then((m) => ({ default: m.ProfileManagerModal })));
const LegalModal = lazy(() => import('./features/legal/LegalModal').then((m) => ({ default: m.LegalModal })));

const WorkspaceLoadingSkeleton: React.FC = () => (
  <div className="min-h-[50vh] max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center animate-fadeIn">
    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-2xs">
      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <h3 className="text-sm font-bold text-slate-800">Initializing Academic Engine...</h3>
    <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
      Loading OpenXML rules, institutional profiles, and compliance heuristics.
    </p>
  </div>
);

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isProfilesOpen, setIsProfilesOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  const [settings, setSettings] = useState<FormattingSettings>(DEFAULT_FORMATTING_SETTINGS);
  const [presentationSourceFile, setPresentationSourceFile] = useState<File | null>(null);
  const [workspaceInitialFile, setWorkspaceInitialFile] = useState<File | null>(null);

  // Shared Project State (Upload Once, Use Everywhere)
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<number | null>(null);
  const [projectFilename, setProjectFilename] = useState<string | null>(null);
  const [availableVersions, setAvailableVersions] = useState<DocumentVersionInfo[]>([]);
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);

  // Automatically scroll to the top whenever navigation view changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentView]);

  const refreshVersions = async (jobId: string) => {
    try {
      const data = await api.getDocumentVersions(jobId);
      if (data && data.versions) {
        setAvailableVersions(data.versions);
        if (data.current_version_id && !activeVersionId) {
          setActiveVersionId(data.current_version_id);
        }
      }
    } catch {
      // Non-fatal if server cleaned up job
    }
  };

  const handleApplyProfile = (profile: CollegeProfile) => {
    setSettings(JSON.parse(JSON.stringify(profile.settings)));
  };

  const handleStartFormatting = (file?: File) => {
    if (file) setWorkspaceInitialFile(file);
    setCurrentView('workspace');
  };

  const handleCreatePresentation = (file?: File) => {
    if (file) setPresentationSourceFile(file);
    setCurrentView('presentation');
  };

  const handleJobCreated = (jobId: string, filename: string) => {
    setActiveJobId(jobId);
    setProjectFilename(filename);
    setActiveVersionId(1);
    refreshVersions(jobId);
  };

  const handleFormattingCompleted = (jobId: string, versionId: number) => {
    setActiveVersionId(versionId);
    refreshVersions(jobId);
  };

  const handleSwitchVersion = async (vId: number) => {
    if (!activeJobId) return;
    try {
      await api.setDocumentVersion(activeJobId, vId);
      setActiveVersionId(vId);
      await refreshVersions(activeJobId);
      setIsVersionDropdownOpen(false);
    } catch (e) {
      console.error('Failed to switch document version:', e);
    }
  };

  const handleResetProject = () => {
    setActiveJobId(null);
    setActiveVersionId(null);
    setProjectFilename(null);
    setAvailableVersions([]);
    setIsVersionDropdownOpen(false);
    setWorkspaceInitialFile(null);
    setPresentationSourceFile(null);
    setCurrentView('workspace');
  };

  const activeVersion = availableVersions.find((v) => v.version_id === activeVersionId) ||
    availableVersions[availableVersions.length - 1];

  // Map current view to workflow stage
  const getActiveStageIndex = () => {
    switch (currentView) {
      case 'workspace':
        return 0;
      case 'presentation':
        return 1;
      case 'doctor':
        return 2;
      default:
        return 0;
    }
  };

  const workflowStages = [
    { name: 'Format Assignment', targetView: 'workspace' as AppView, icon: Sliders },
    { name: 'PowerPoint Slides', targetView: 'presentation' as AppView, icon: Presentation },
    { name: 'Assignment Doctor', targetView: 'doctor' as AppView, icon: Stethoscope },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Accessible skip link for keyboard & screen readers (WCAG AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-4 py-2 bg-slate-900 text-white rounded-lg shadow-lg text-xs font-bold ring-2 ring-indigo-500 focus:outline-none"
      >
        Skip to main content
      </a>

      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenProfiles={() => setIsProfilesOpen(true)}
      />

      {/* Persistent Shared Project & Workflow Stage Navigation Bar */}
      {activeJobId && currentView !== 'landing' && (
        <div className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-16 z-30 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs">
            {/* Left: Project & Version Selector */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700 flex items-center justify-center font-bold">
                  <Folder className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 leading-tight">
                    <span className="truncate max-w-[160px] sm:max-w-[220px]" title={projectFilename || 'Assignment'}>
                      {projectFilename || 'Active Assignment'}
                    </span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span>Project:</span>
                    <span className="font-mono text-slate-400">{activeJobId.slice(0, 8)}</span>
                  </div>
                </div>
              </div>

              {/* Version Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200/60 shadow-2xs transition-colors cursor-pointer text-xs"
                  title="Switch or view document versions"
                >
                  <span>v{activeVersionId || 1}</span>
                  <span className="text-indigo-400 font-normal">|</span>
                  <span className="font-normal text-indigo-700 truncate max-w-[90px]">
                    {activeVersion?.version_label || 'Current'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-indigo-600 ml-0.5" />
                </button>

                {isVersionDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Document Version History
                    </div>
                    {availableVersions.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-500">
                        Version 1 (Original Upload)
                      </div>
                    ) : (
                      availableVersions.map((v) => {
                        const isCurrent = v.version_id === (activeVersionId || 1);
                        return (
                          <button
                            key={v.version_id}
                            type="button"
                            onClick={() => handleSwitchVersion(v.version_id)}
                            className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                              isCurrent ? 'bg-indigo-50/60 font-semibold text-indigo-900' : 'text-slate-700'
                            }`}
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-bold text-slate-900">v{v.version_id}</span>
                                <span className="text-slate-600 truncate">{v.version_label}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {v.file_type.toUpperCase()} • {(v.file_size_bytes / 1024).toFixed(1)} KB
                              </div>
                            </div>
                            {isCurrent && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Center: Cohesive Workflow Breadcrumb Stages */}
            <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto py-1 scrollbar-none">
              {workflowStages.map((stage, idx) => {
                const isActive = getActiveStageIndex() === idx;
                const isPast = getActiveStageIndex() > idx;
                return (
                  <React.Fragment key={stage.name}>
                    <button
                      type="button"
                      onClick={() => setCurrentView(stage.targetView)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-2xs font-bold'
                          : isPast
                          ? 'bg-slate-100/90 text-slate-700 hover:bg-slate-200'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <stage.icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                      )}
                      <span>{stage.name}</span>
                    </button>
                    {idx < workflowStages.length - 1 && (
                      <span className="text-slate-300 font-light text-xs select-none px-0.5">→</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Right: Quick Download & Reset Actions */}
            <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
              {activeJobId && (
                <a
                  href={`/api/jobs/${activeJobId}/versions/${activeVersionId || 1}/download?filename=${encodeURIComponent(
                    projectFilename || 'Assignment'
                  )}`}
                  download
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200/80 shadow-2xs transition-colors cursor-pointer text-xs"
                  title="Download currently active version"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Export v{activeVersionId || 1}</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleResetProject}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-xs"
                title="Start a new assignment project"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">New Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Landmark with Suspense boundary */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<WorkspaceLoadingSkeleton />}>
          {currentView === 'landing' && (
            <LandingPage
              onStartFormatting={handleStartFormatting}
              onCreatePresentation={handleCreatePresentation}
              onOpenProfiles={() => setIsProfilesOpen(true)}
              onOpenDoctor={() => setCurrentView('doctor')}
              onOpenConverter={() => setCurrentView('converter')}
              onOpenRubric={() => setCurrentView('rubric')}
              onOpenProjects={() => setCurrentView('projects')}
            />
          )}

          {currentView === 'workspace' && (
            <Workspace
              settings={settings}
              onUpdateSettings={setSettings}
              onOpenProfiles={() => setIsProfilesOpen(true)}
              initialFile={workspaceInitialFile}
              activeJobId={activeJobId}
              onJobCreated={handleJobCreated}
              onFormattingCompleted={handleFormattingCompleted}
              onCheckWithDoctor={(id, vId) => {
                setActiveJobId(id);
                if (vId) setActiveVersionId(vId);
                setCurrentView('doctor');
              }}
              onCreatePowerPoint={(id, vId) => {
                setActiveJobId(id);
                if (vId) setActiveVersionId(vId);
                setCurrentView('presentation');
              }}
            />
          )}

          {currentView === 'presentation' && (
            <PresentationWorkspace
              initialFile={presentationSourceFile}
              onBackToLanding={() => setCurrentView('landing')}
              onOpenWorkspace={() => setCurrentView('workspace')}
              activeJobId={activeJobId}
              activeVersionId={activeVersionId}
              onOpenDoctor={(id, vId) => {
                setActiveJobId(id);
                if (vId) setActiveVersionId(vId);
                setCurrentView('doctor');
              }}
            />
          )}

          {currentView === 'doctor' && (
            <DoctorWorkspace
              onBackToLanding={() => setCurrentView('landing')}
              onOpenWorkspace={handleStartFormatting}
              activeJobId={activeJobId || undefined}
              activeVersionId={activeVersionId || undefined}
              settings={settings}
              onOpenPresentation={(id, vId) => {
                if (id) setActiveJobId(id);
                if (vId) setActiveVersionId(vId);
                setCurrentView('presentation');
              }}
            />
          )}
        </Suspense>
      </main>

      <Footer
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
        onNavigate={(view) => setCurrentView(view)}
        onOpenProfiles={() => setIsProfilesOpen(true)}
      />

      <Suspense fallback={null}>
        <ProfileManagerModal
          isOpen={isProfilesOpen}
          onClose={() => setIsProfilesOpen(false)}
          currentSettings={settings}
          onApplyProfile={handleApplyProfile}
        />

        <LegalModal
          isOpen={!!legalModalType}
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      </Suspense>
    </div>
  );
};

export default App;
