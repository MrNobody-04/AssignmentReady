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
} from 'lucide-react';
import { AppView } from '../../types';
import { ScrollReveal } from '../ui/ScrollReveal';

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          {/* Col 1: Brand & Mission */}
          <ScrollReveal delay={0} className="lg:col-span-7 space-y-4">
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

            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
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
          </ScrollReveal>

          {/* Col 2: Quick Navigation */}
          <ScrollReveal delay={100} className="lg:col-span-5">
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
          </ScrollReveal>
        </div>

        {/* Bottom Bar with Attribution */}
        <ScrollReveal delay={400} className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
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
        </ScrollReveal>
      </div>
    </footer>
  );
};
