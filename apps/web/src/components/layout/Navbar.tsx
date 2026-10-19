import React from 'react';
import { GraduationCap, BookOpen, ShieldCheck, Settings, Presentation, FileType } from 'lucide-react';
import { AppView } from '../../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenProfiles: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenProfiles }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-lg bg-academic-navy flex items-center justify-center text-white shadow-sm group-hover:bg-academic-indigo transition-colors">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight block">
              Assignment<span className="text-academic-teal">Ready</span>
            </span>
            <span className="text-xs text-slate-500 font-medium block">
              Academic Formatter & Converter
            </span>
          </div>
        </button>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors hover:text-slate-900 ${
              currentView === 'landing' ? 'text-academic-navy font-bold' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('workspace')}
            className={`transition-colors hover:text-slate-900 ${
              currentView === 'workspace' ? 'text-academic-navy font-bold' : ''
            }`}
          >
            Assignment Formatter
          </button>
          <button
            onClick={() => onNavigate('presentation')}
            className={`flex items-center gap-1.5 transition-colors hover:text-slate-900 ${
              currentView === 'presentation' ? 'text-academic-teal font-bold' : ''
            }`}
          >
            <Presentation className="w-4 h-4 text-academic-teal" />
            <span>PowerPoint Decks</span>
          </button>
          <button
            onClick={() => onNavigate('converter')}
            className={`flex items-center gap-1.5 transition-colors hover:text-slate-900 ${
              currentView === 'converter' ? 'text-academic-blue font-bold' : ''
            }`}
          >
            <FileType className="w-4 h-4 text-academic-blue" />
            <span>File Converter</span>
          </button>
          <button
            onClick={onOpenProfiles}
            className="flex items-center gap-1.5 transition-colors hover:text-slate-900 text-slate-600"
          >
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>College Profiles</span>
          </button>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfiles}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Preset Styles</span>
          </button>

          {currentView === 'landing' ? (
            <button
              onClick={() => onNavigate('workspace')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-academic-navy hover:bg-academic-indigo rounded-lg shadow-sm transition-colors"
            >
              <span>Start Formatting</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline-safe processing</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
