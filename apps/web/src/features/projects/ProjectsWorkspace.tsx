import React, { useState, useEffect } from 'react';
import {
  FolderClock,
  FileText,
  Presentation,
  FileType,
  Stethoscope,
  FileSpreadsheet,
  Download,
  Trash2,
  ChevronLeft,
  ShieldCheck,
} from 'lucide-react';
import { StudentProjectRecord, AppView } from '../../types';
import { projectsManager } from '../../lib/projectsManager';
import { api } from '../../lib/api';

interface ProjectsWorkspaceProps {
  onBackToLanding: () => void;
  onNavigate: (view: AppView) => void;
  onOpenProject?: (jobId: string) => void;
}

export const ProjectsWorkspace: React.FC<ProjectsWorkspaceProps> = ({
  onBackToLanding,
  onNavigate,
  onOpenProject,
}) => {
  const [projects, setProjects] = useState<StudentProjectRecord[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');

  const loadProjects = () => {
    setProjects(projectsManager.getAll());
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDeleteProject = async (proj: StudentProjectRecord) => {
    if (proj.jobId) {
      try {
        await api.deleteJob(proj.jobId);
      } catch {
        // Non-fatal if already cleaned up by backend TTL
      }
    }
    projectsManager.remove(proj.id);
    loadProjects();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your local project history?')) {
      projectsManager.clearAll();
      loadProjects();
    }
  };

  const filteredProjects =
    filterType === 'ALL' ? projects : projects.filter((p) => p.type === filterType);

  const getTypeIcon = (type: StudentProjectRecord['type']) => {
    switch (type) {
      case 'formatting':
        return <FileText className="w-4 h-4 text-academic-blue" />;
      case 'presentation':
        return <Presentation className="w-4 h-4 text-indigo-600" />;
      case 'doctor':
        return <Stethoscope className="w-4 h-4 text-emerald-600" />;
      case 'conversion':
        return <FileType className="w-4 h-4 text-teal-600" />;
      case 'rubric':
        return <FileSpreadsheet className="w-4 h-4 text-purple-600" />;
    }
  };

  const getTypeBadge = (type: StudentProjectRecord['type']) => {
    switch (type) {
      case 'formatting':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-academic-blue border border-blue-200">Assignment Format</span>;
      case 'presentation':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">PowerPoint Deck</span>;
      case 'doctor':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Doctor Diagnosis</span>;
      case 'conversion':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">File Conversion</span>;
      case 'rubric':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Rubric Analysis</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Main Menu</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderClock className="w-6 h-6 text-academic-navy" />
            <span>My Projects & Recent Files</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Student workspace history. Review your formatted documents, generated presentation decks, converted files, and diagnostic reports.
          </p>
        </div>

        {projects.length > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Privacy Notice Banner */}
      <div className="mb-6 p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-academic-navy shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">
            Local Browser Storage & Data Privacy Guarantee
          </p>
          <p className="leading-relaxed">
            Your project history is preserved directly in your browser. AssignmentReady operates without persistent user accounts or third-party trackers. All backend files are automatically purged after 1 hour.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 text-xs">
        {[
          { id: 'ALL', label: `All Projects (${projects.length})` },
          { id: 'formatting', label: 'Formatted Docs' },
          { id: 'presentation', label: 'PowerPoint Decks' },
          { id: 'doctor', label: 'Doctor Diagnoses' },
          { id: 'conversion', label: 'File Conversions' },
          { id: 'rubric', label: 'Rubrics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === tab.id
                ? 'bg-academic-navy text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <FolderClock className="w-12 h-12 mx-auto text-slate-300" />
          <div>
            <h3 className="font-bold text-base text-slate-900">No Projects in Local History</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Format an assignment, generate a presentation, convert a document, or run Assignment Doctor to see your files here.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => onNavigate('workspace')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-academic-navy hover:bg-academic-indigo cursor-pointer"
            >
              Format Assignment
            </button>
            <button
              onClick={() => onNavigate('presentation')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              Create Presentation
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  {getTypeIcon(proj.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(proj.type)}
                    <span className="text-[11px] text-slate-400">
                      {new Date(proj.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {proj.fileSizeBytes && (
                      <span className="text-[10px] text-slate-400">
                        • {(proj.fileSizeBytes / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{proj.title}</h4>

                  {proj.summary && (
                    <p className="text-xs text-slate-500">{proj.summary}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {proj.jobId && onOpenProject && (
                  <button
                    onClick={() => onOpenProject(proj.jobId!)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 shadow-2xs cursor-pointer"
                  >
                    <span>Open in Workspace</span>
                  </button>
                )}

                {proj.downloadUrl && (
                  <a
                    href={proj.downloadUrl}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-academic-navy hover:bg-academic-indigo shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}

                <button
                  onClick={() => handleDeleteProject(proj)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
