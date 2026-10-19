import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './features/landing/LandingPage';
import { Workspace } from './features/workspace/Workspace';
import { ProfileManagerModal } from './features/profiles/ProfileManagerModal';
import { FormattingSettings, CollegeProfile } from './types';
import { DEFAULT_FORMATTING_SETTINGS } from './lib/profiles';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>('landing');
  const [isProfilesOpen, setIsProfilesOpen] = useState(false);
  const [settings, setSettings] = useState<FormattingSettings>(DEFAULT_FORMATTING_SETTINGS);

  const handleApplyProfile = (profile: CollegeProfile) => {
    setSettings(JSON.parse(JSON.stringify(profile.settings)));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-academic-navy">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenProfiles={() => setIsProfilesOpen(true)}
      />

      <div className="flex-1">
        {currentView === 'landing' ? (
          <LandingPage
            onStartFormatting={() => setCurrentView('workspace')}
            onOpenProfiles={() => setIsProfilesOpen(true)}
          />
        ) : (
          <Workspace
            settings={settings}
            onUpdateSettings={setSettings}
            onOpenProfiles={() => setIsProfilesOpen(true)}
          />
        )}
      </div>

      <Footer />

      <ProfileManagerModal
        isOpen={isProfilesOpen}
        onClose={() => setIsProfilesOpen(false)}
        currentSettings={settings}
        onApplyProfile={handleApplyProfile}
      />
    </div>
  );
};

export default App;
