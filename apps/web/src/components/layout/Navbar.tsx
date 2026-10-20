import React, { useState } from 'react';
import {
  BookOpen,
  Presentation,
  Sliders,
  Menu,
  X,
  ChevronRight,
  Stethoscope,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <button
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 text-left focus:outline-none group transition-transform duration-200 active:scale-95 shrink-0 mr-2 xl:mr-4 cursor-pointer"
        >
          <img
            src="/logo.jpg"
            alt="AssignmentReady Logo"
            width={36}
            height={36}
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
        <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => handleNavClick('landing')}
            className={`px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap hover:text-slate-900 hover:bg-slate-100 cursor-pointer ${
              currentView === 'landing' ? 'text-academic-navy font-bold bg-slate-100/90 shadow-2xs' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleNavClick('workspace')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap hover:text-slate-900 hover:bg-slate-100 cursor-pointer ${
              currentView === 'workspace' ? 'text-academic-navy font-bold bg-slate-100/90 shadow-2xs' : ''
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-academic-navy shrink-0" />
            <span>Format Assignment</span>
          </button>
          <button
            onClick={() => handleNavClick('presentation')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap hover:text-slate-900 hover:bg-slate-100 cursor-pointer ${
              currentView === 'presentation' ? 'text-indigo-700 font-bold bg-indigo-50/70 shadow-2xs' : ''
            }`}
          >
            <Presentation className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>PowerPoint</span>
          </button>
          <button
            onClick={() => handleNavClick('doctor')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap hover:text-slate-900 hover:bg-slate-100 cursor-pointer ${
              currentView === 'doctor' ? 'text-emerald-700 font-bold bg-emerald-50/80 shadow-2xs' : ''
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Assignment Doctor</span>
          </button>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenProfiles}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap cursor-pointer"
            title="Preset College Styles"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Rules Library</span>
          </button>

          <button
            onClick={() => handleNavClick('workspace')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-academic-navy hover:bg-academic-indigo rounded-xl shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 whitespace-nowrap cursor-pointer"
          >
            <span>Format My Assignment</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 xl:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-2 animate-fade-up shadow-xl">
          <nav className="flex flex-col space-y-1 text-xs font-medium">
            <button
              onClick={() => handleNavClick('landing')}
              className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
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
              className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                currentView === 'workspace'
                  ? 'bg-indigo-50/80 text-academic-navy font-bold border border-indigo-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-academic-navy" />
                <span>Format My Assignment</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleNavClick('presentation')}
              className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                currentView === 'presentation'
                  ? 'bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Presentation className="w-4 h-4 text-indigo-600" />
                <span>Create a PowerPoint</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleNavClick('doctor')}
              className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                currentView === 'doctor'
                  ? 'bg-emerald-50/80 text-emerald-800 font-bold border border-emerald-100'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>Check My Assignment (Assignment Doctor)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={handleProfilesClick}
              className="flex items-center justify-between p-2.5 rounded-xl text-left text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>College & University Rules Library</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </nav>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => handleNavClick('workspace')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-academic-navy hover:bg-academic-indigo shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Start Formatting Assignment</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

