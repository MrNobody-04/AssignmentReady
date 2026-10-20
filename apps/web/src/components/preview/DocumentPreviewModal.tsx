import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { FormattingSettings, InspectionResult } from '../../types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FormattingSettings;
  inspection: InspectionResult | null;
  filename?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  settings,
  inspection,
  filename = 'Assignment_Document.docx',
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  if (!isOpen) return null;

  const totalPages = 5;

  const fontFam = settings.body.font_family || 'Times New Roman';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-academic-blue" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Live Document Layout Preview
              </h3>
              <p className="text-[11px] text-slate-500">
                {filename} • Typography: {fontFam} • Margins: {settings.margins.left_inches}"{inspection ? ` • Words: ${inspection.total_words.toLocaleString()}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs bg-white border border-slate-200 rounded-lg px-2 py-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-slate-700 px-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informational Disclaimer Banner */}
        <div className="px-6 py-2 bg-blue-50/70 border-b border-blue-100 flex items-center gap-2 text-[11px] text-blue-900">
          <span className="font-bold uppercase tracking-wider text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
            Notice
          </span>
          <span>
            Approximate Browser Preview • Final spacing, font kerning, and true pagination are rendered in Microsoft Word & LibreOffice.
          </span>
        </div>

        {/* Document Simulation Stage (A4 Aspect Ratio Sheet) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100/60 flex items-center justify-center">
          <div
            className="w-full max-w-2xl bg-white shadow-xl rounded-lg border border-slate-200/90 min-h-[580px] p-8 sm:p-12 flex flex-col justify-between transition-all"
            style={{ fontFamily: fontFam }}
          >
            {/* PAGE 1: COVER PAGE */}
            {currentPage === 1 && (
              <div className="flex-1 flex flex-col justify-between text-center py-6 space-y-8 animate-fadeIn">
                <div className="space-y-1">
                  <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
                    {settings.cover_page.institution || 'UNIVERSITY / COLLEGE NAME'}
                  </p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    {settings.cover_page.department || 'FACULTY / DEPARTMENT'}
                  </p>
                </div>

                <div className="space-y-3 py-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    {settings.cover_page.assignment_title || 'Assignment Title'}
                  </h1>
                  {settings.cover_page.assignment_subtitle && (
                    <p className="text-sm text-slate-500">
                      {settings.cover_page.assignment_subtitle}
                    </p>
                  )}
                </div>

                <div className="border-t border-b border-slate-200 py-4 max-w-sm mx-auto text-xs text-slate-700 space-y-1.5 text-left w-full">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Student Name:</span>
                    <span className="font-bold text-slate-900">{settings.cover_page.student_name || 'Candidate Name'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Student ID:</span>
                    <span className="font-mono text-slate-900">{settings.cover_page.student_id || 'ID / Matriculation'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Module / Course:</span>
                    <span className="text-slate-900">{settings.cover_page.course || 'Course Code'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Lecturer:</span>
                    <span className="text-slate-900">{settings.cover_page.lecturer_name || 'Module Tutor'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Submission Date:</span>
                    <span className="text-slate-900">{settings.cover_page.submission_date}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Academic Declaration & Institutional Cover Sheet
                </div>
              </div>
            )}

            {/* PAGE 2: FRONT MATTER / DECLARATION / TOC */}
            {currentPage === 2 && (
              <div className="flex-1 space-y-6 animate-fadeIn">
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200">
                    Declaration of Academic Integrity
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    I hereby declare that this assignment represents my own original academic work, prepared in accordance with institutional academic integrity regulations. All secondary literature, experimental data sources, and external quotations have been duly referenced using standard scholarship apparatus.
                  </p>
                  <div className="pt-4 flex justify-between text-xs text-slate-500 border-b border-slate-100 pb-4">
                    <span>Candidate Signature: _____________________</span>
                    <span>Date: {settings.cover_page.submission_date}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Abstract
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed text-justify">
                    This academic report provides a structured investigation and rigorous analysis of the subject domain. It synthesizes core theoretical frameworks, outlines investigative methodology, and presents empirical findings conforming to institutional guidelines.
                  </p>
                </div>
              </div>
            )}

            {/* PAGE 3: TABLE OF CONTENTS */}
            {currentPage === 3 && (
              <div className="flex-1 space-y-4 animate-fadeIn">
                <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200">
                  {settings.table_of_contents.title || 'Table of Contents'}
                </h2>

                <div className="space-y-2 text-xs text-slate-700 pt-2">
                  {[
                    { title: '1. Introduction & Background', page: '1', level: 1 },
                    { title: '1.1 Problem Statement and Context', page: '2', level: 2 },
                    { title: '1.2 Research Aims and Objectives', page: '3', level: 2 },
                    { title: '2. Literature Review & Theoretical Context', page: '4', level: 1 },
                    { title: '3. Investigative Methodology', page: '7', level: 1 },
                    { title: '3.1 System Architecture & Pipeline', page: '8', level: 2 },
                    { title: '4. Findings & Discussion', page: '11', level: 1 },
                    { title: '5. Conclusion & Recommendations', page: '15', level: 1 },
                    { title: 'References', page: '17', level: 1 },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between ${
                        item.level === 1 ? 'font-bold text-slate-900 mt-2' : 'pl-4 text-slate-600'
                      }`}
                    >
                      <span>{item.title}</span>
                      <span className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                      <span className="font-mono text-slate-500">{item.page}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE 4: BODY CONTENT WITH CHAPTER HEADINGS */}
            {currentPage === 4 && (
              <div className="flex-1 space-y-4 animate-fadeIn">
                <h1 className="text-lg font-bold text-academic-blue pb-2 border-b border-slate-200">
                  1. Introduction & Problem Statement
                </h1>

                <p className="text-xs text-slate-700 leading-relaxed text-justify">
                  University students regularly encounter severe formatting non-compliance when submitting assignments prepared across heterogeneous digital environments. Discrepancies in line spacing, font size hierarchies, margin boundaries, and broken tables of contents frequently incur grading deductions.
                </p>

                <h2 className="text-sm font-bold text-slate-900 pt-2">
                  1.1 Problem Statement and Context
                </h2>

                <p className="text-xs text-slate-700 leading-relaxed text-justify">
                  Deterministic formatting rules guarantee reproducible document typography without relying on external cloud APIs or exposing confidential student research to unauthorized third parties.
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center my-4">
                  <p className="font-bold text-slate-800">Figure 1.1: Architectural Pipeline of OpenXML Manipulation Engine</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">[Embedded High-Resolution Academic Vector Diagram]</p>
                </div>
              </div>
            )}

            {/* PAGE 5: REFERENCES SECTION */}
            {currentPage === 5 && (
              <div className="flex-1 space-y-4 animate-fadeIn">
                <h1 className="text-lg font-bold text-academic-blue pb-2 border-b border-slate-200">
                  References
                </h1>

                <div className="space-y-2.5 text-xs text-slate-700 pt-1 leading-relaxed">
                  <p className="pl-6 -indent-6">
                    American Psychological Association. (2020). <em>Publication manual of the American Psychological Association</em> (7th ed.). https://doi.org/10.1037/0000165-000
                  </p>
                  <p className="pl-6 -indent-6">
                    ISO/IEC 29500-1:2021. (2021). <em>Information technology — Document description and processing languages — Office Open XML File Formats</em>. International Organization for Standardization.
                  </p>
                  <p className="pl-6 -indent-6">
                    Smith, J., & Davis, R. (2023). Deterministic document preparation systems in higher education. <em>Journal of Academic Computing</em>, 14(2), 112–128.
                  </p>
                </div>
              </div>
            )}

            {/* Footer with Unlinked Page Numbering */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 select-none">
              <span>{settings.cover_page.assignment_title || 'Assignment'}</span>
              <span>
                {currentPage === 1
                  ? '[No Page Number on Cover]'
                  : currentPage <= 3
                  ? `[Roman Front Matter: ${currentPage === 2 ? 'i' : 'ii'}]`
                  : `Page ${currentPage - 3}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
