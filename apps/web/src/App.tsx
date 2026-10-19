import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './features/landing/LandingPage';
import { Workspace } from './features/workspace/Workspace';
import { PresentationWorkspace } from './features/presentation/PresentationWorkspace';
import { UniversalUploadCenter } from './features/converters/UniversalUploadCenter';
import { ProfileManagerModal } from './features/profiles/ProfileManagerModal';
import { LegalModal } from './features/legal/LegalModal';
import { FormattingSettings, CollegeProfile, AppView } from './types';
import { DEFAULT_FORMATTING_SETTINGS } from './lib/profiles';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isProfilesOpen, setIsProfilesOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  const [settings, setSettings] = useState<FormattingSettings>(DEFAULT_FORMATTING_SETTINGS);
  const [presentationSourceFile, setPresentationSourceFile] = useState<File | null>(null);

  const handleApplyProfile = (profile: CollegeProfile) => {
    setSettings(JSON.parse(JSON.stringify(profile.settings)));
  };

  const handleStartFormatting = (_file?: File) => {
    setCurrentView('workspace');
  };

  const handleCreatePresentation = (file?: File) => {
    if (file) setPresentationSourceFile(file);
    setCurrentView('presentation');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-academic-teal-dark">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenProfiles={() => setIsProfilesOpen(true)}
      />

      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartFormatting={handleStartFormatting}
            onCreatePresentation={handleCreatePresentation}
            onOpenProfiles={() => setIsProfilesOpen(true)}
            onOpenConverter={() => setCurrentView('converter')}
          />
        )}

        {currentView === 'workspace' && (
          <Workspace
            settings={settings}
            onUpdateSettings={setSettings}
            onOpenProfiles={() => setIsProfilesOpen(true)}
          />
        )}

        {currentView === 'presentation' && (
          <PresentationWorkspace
            initialFile={presentationSourceFile}
            onBackToLanding={() => setCurrentView('landing')}
            onOpenWorkspace={() => setCurrentView('workspace')}
          />
        )}

        {currentView === 'converter' && (
          <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <UniversalUploadCenter
              onStartAssignmentFormatting={handleStartFormatting}
              onOpenPresentationWorkspace={handleCreatePresentation}
            />
          </div>
        )}
      </div>

      <Footer
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
        onNavigate={(view) => setCurrentView(view)}
        onOpenProfiles={() => setIsProfilesOpen(true)}
      />

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
    </div>
  );
};

export default App;
