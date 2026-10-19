import React, { useState } from 'react';
import {
  BookOpen,
  Settings,
  Presentation,
  FileType,
  Sliders,
  Menu,
  X,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { AppView } from '../../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenProfiles: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenProfiles }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleProfilesClick = () => {
    onOpenProfiles();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 text-left focus:outline-none group transition-transform duration-200 active:scale-95 shrink-0 mr-4 lg:mr-8"
        >
          <img
            src="/logo.jpg"
            alt="AssignmentReady Logo"
            className="w-9 h-9 rounded-xl object-contain bg-white shadow-2xs border border-slate-200/80 p-0.5 group-hover:shadow-sm group-hover:-translate-y-0.5 transition-all duration-300"
          />
          <div>
            <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block leading-tight">
              Assignment<span className="text-academic-navy">Ready</span>
            </span>
            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">
              Submit with confidence
            </span>
          </div>
        </button>

        {/* Desktop Navigation Items */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNavClick('landing')}
            className={`px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap hover:text-slate-900 hover:bg-slate-100 ${
              currentView === 'landing' ? 'text-academic-navy font-bold bg-slate-100/90 shadow-2xs' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleNavClick('workspace')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap hover:text-slate-900 hover:bg-slate-100 ${
              currentView === 'workspace' ? 'text-academic-navy font-bold bg-slate-100/90 shadow-2xs' : ''
            }`}
          >
            <Sliders className="w-4 h-4 text-academic-navy shrink-0" />
            <span>Assignment Formatter</span>
          </button>
          <button
            onClick={() => handleNavClick('presentation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap hover:text-slate-900 hover:bg-slate-100 ${
              currentView === 'presentation' ? 'text-indigo-700 font-bold bg-indigo-50/70 shadow-2xs' : ''
            }`}
          >
            <Presentation className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>PowerPoint Decks</span>
          </button>
          <button
            onClick={() => handleNavClick('converter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap hover:text-slate-900 hover:bg-slate-100 ${
              currentView === 'converter' ? 'text-teal-700 font-bold bg-teal-50/70 shadow-2xs' : ''
            }`}
          >
            <FileType className="w-4 h-4 text-teal-600 shrink-0" />
            <span>File Converter</span>
          </button>
          <button
            onClick={onOpenProfiles}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap hover:text-slate-900 hover:bg-slate-100 text-slate-600"
          >
            <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
            <span>College Profiles</span>
          </button>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenProfiles}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            title="Preset College Styles"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Presets</span>
          </button>

          {currentView === 'workspace' ? (
            <button
              onClick={() => handleNavClick('workspace')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl shadow-2xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              title="Reset Workspace / Start New Document"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>New Document</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('workspace')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-academic-navy hover:bg-academic-indigo rounded-xl shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 whitespace-nowrap"
            >
              <span>Format My Assignment</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 animate-fade-up shadow-xl">
          <nav className="flex flex-col space-y-1.5 text-sm font-medium">
            <button
              onClick={() => handleNavClick('landing')}
              className={`flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                currentView === 'landing'
                  ? 'bg-indigo-50/80 text-academic-navy font-bold border border-indigo-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Overview</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleNavClick('workspace')}
              className={`flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                currentView === 'workspace'
                  ? 'bg-indigo-50/80 text-academic-navy font-bold border border-indigo-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-academic-navy" />
                <span>Assignment Formatter</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleNavClick('presentation')}
              className={`flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                currentView === 'presentation'
                  ? 'bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Presentation className="w-4 h-4 text-indigo-600" />
                <span>PowerPoint Decks</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleNavClick('converter')}
              className={`flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                currentView === 'converter'
                  ? 'bg-teal-50/80 text-teal-800 font-bold border border-teal-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileType className="w-4 h-4 text-teal-600" />
                <span>File Converter</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={handleProfilesClick}
              className="flex items-center justify-between p-3 rounded-xl text-left text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>College Profiles</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={handleProfilesClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Preset Style Standards</span>
            </button>

            {currentView === 'workspace' ? (
              <button
                onClick={() => handleNavClick('workspace')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 shadow-2xs transition-all active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>New Document</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('workspace')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-academic-navy hover:bg-academic-indigo shadow-md transition-all active:scale-[0.98]"
              >
                <span>Format My Assignment</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
