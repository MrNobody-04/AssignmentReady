import React from 'react';
import {
  ShieldCheck,
  FileLock2,
  RefreshCw,
  ChevronRight,
  Sliders,
  Presentation,
  FileType,
  BookOpen,
  ArrowUpRight,
} from 'lucide-react';
import { AppView } from '../../types';

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onNavigate?: (view: AppView) => void;
  onOpenProfiles?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onNavigate,
  onOpenProfiles,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-950 text-slate-300 mt-24 border-t border-slate-800/80">
      {/* Subtle Top Gradient Border Highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="AssignmentReady Logo"
                className="w-10 h-10 rounded-xl object-contain bg-white shadow-md p-0.5"
              />
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight block leading-tight">
                  Assignment<span className="text-indigo-400">Ready</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-indigo-300/80 font-bold block">
                  Submit with confidence
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              A privacy-first academic preparation platform designed to help university students format assignments to institutional guidelines, convert documents, and generate presentation decks.
            </p>

            {/* Sleek inline trust badges */}
            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero paid AI APIs & zero tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <FileLock2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Temporary files auto-purged in 1 hour</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Deterministic OpenXML formatting</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate?.('landing')}
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-200"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Overview & Showcase</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('workspace')}
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-200"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Assignment Formatter</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('presentation')}
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-200"
                >
                  <Presentation className="w-3.5 h-3.5 text-indigo-400" />
                  <span>PowerPoint Slides</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('converter')}
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-200"
                >
                  <FileType className="w-3.5 h-3.5 text-indigo-400" />
                  <span>File Converter</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenProfiles}
                  className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-200"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>College Profiles</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Core Capabilities */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">
              Core Capabilities
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>OpenXML Typography & Margins</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Faculty Cover Page Templates</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Marking Scheme Rubric Tables</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Word XML Dynamic Pagination</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>PowerPoint Presentation Decks</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Deterministic Compliance Auditor</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Academic Notice & Legal (Glassmorphic Callout) */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">
              Academic Integrity
            </h4>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-xs space-y-3">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                AssignmentReady automates typography and institutional structure. Proper citation, factual validity, and academic ethics remain the student's responsibility. Formatting does not prove absence of AI generation.
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="flex items-center justify-between text-indigo-400 hover:text-indigo-300 font-medium transition-colors text-left"
                >
                  <span>Privacy & Data Processing</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="flex items-center justify-between text-indigo-400 hover:text-indigo-300 font-medium transition-colors text-left"
                >
                  <span>Terms of Use & Student Notice</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Attribution */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p className="text-center sm:text-left">
            © {currentYear} AssignmentReady. Developed by{' '}
            <span className="text-white font-semibold hover:text-indigo-400 transition-colors">
              Sujan G.C.
            </span>
          </p>

          <div className="flex items-center gap-6 text-slate-400 text-xs">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={onOpenTerms}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <span className="text-slate-600">•</span>
            <span>No Accounts Required</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
