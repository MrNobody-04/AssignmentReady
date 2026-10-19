import React from 'react';
import { ShieldCheck, GraduationCap, FileLock2, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-academic-blue flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                AssignmentReady
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-4">
              A privacy-first, client-driven formatting workspace designed to prepare university assignments according to official departmental style guides, cover pages, and marking rubrics.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero paid AI APIs
              </span>
              <span className="flex items-center gap-1">
                <FileLock2 className="w-4 h-4 text-blue-400" />
                Temporary server storage (1 hr auto-purge)
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                Original document structure preserved
              </span>
            </div>
          </div>

          {/* Col 2: Product & Tools */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Capabilities
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>OpenXML Document Styling</li>
              <li>Academic Cover Page Insertion</li>
              <li>Marking Scheme Rubric Tables</li>
              <li>Dynamic Page Numbering (Word fields)</li>
              <li>Word Table of Contents (TOC)</li>
              <li>Rule-Based Compliance Auditor</li>
            </ul>
          </div>

          {/* Col 3: Academic Notice & Privacy */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Academic Notice
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              AssignmentReady provides automated typographic and structural formatting. Proper academic citation, argument validity, and factual accuracy remain the student's responsibility. Formatting does not guarantee academic approval or prove absence of AI generation.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AssignmentReady. Open-source university assignment formatter.</p>
          <div className="flex items-center gap-6">
            <span>Privacy by Design</span>
            <span>No Accounts Required</span>
            <span>Local Browser Profiles</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
