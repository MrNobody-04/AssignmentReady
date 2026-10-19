import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  BookOpen,
  FileCheck2,
  FileSpreadsheet,
  Layers,
  Lock,
  CheckCircle2,
  Sliders,
  FileText,
} from 'lucide-react';

interface LandingPageProps {
  onStartFormatting: () => void;
  onOpenProfiles: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartFormatting, onOpenProfiles }) => {
  const [activeTab, setActiveTab] = useState<'unformatted' | 'formatted'>('formatted');

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 sm:pt-16">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-academic-navy border border-blue-200 mb-6">
          <ShieldCheck className="w-4 h-4 text-academic-blue" />
          <span>Rule-Based OpenXML Engine • Zero Paid AI APIs</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Your Assignment. Your College Rules.{' '}
          <span className="text-academic-blue">Perfectfully Formatted.</span>
        </h1>

        {/* Supporting Description */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          AI tools generate text, but universities grade structure. Transform raw drafts into professionally formatted Microsoft Word documents adhering to your department's exact typography, margins, cover pages, and marking schemes.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onStartFormatting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold text-white bg-academic-navy hover:bg-academic-indigo rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <span>Format My Assignment</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenProfiles}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-academic-blue" />
            <span>Explore College Profiles</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No Account Required</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preserves Figures & Tables</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Genuine Word XML Fields</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>1-Hour Automatic Cleanup</span>
          </div>
        </div>
      </section>

      {/* Interactive Visual Demonstration Slider */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            See the Transformation
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Compare an unformatted AI draft with an AssignmentReady institutional manuscript.
          </p>

          {/* Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-slate-200 mt-5">
            <button
              type="button"
              onClick={() => setActiveTab('unformatted')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'unformatted'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw AI Draft (Unformatted)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('formatted')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'formatted'
                  ? 'bg-academic-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AssignmentReady Formatted (.docx)
            </button>
          </div>
        </div>

        {/* Document Visualizer Window */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden max-w-3xl mx-auto">
          {/* Top Window Bar */}
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-500 font-mono ml-2">
                {activeTab === 'unformatted'
                  ? 'draft_output.txt (Inconsistent Styles)'
                  : 'Final_Assignment_Submission.docx (Formatted)'}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                activeTab === 'unformatted'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {activeTab === 'unformatted' ? 'Non-Compliant' : '100% University Compliant'}
            </span>
          </div>

          {/* Document Content Simulation */}
          <div className="p-8 sm:p-12 min-h-[420px] bg-white text-slate-800 font-serif">
            {activeTab === 'unformatted' ? (
              <div className="space-y-4 font-sans text-xs text-slate-700">
                <div className="text-base font-bold text-slate-900">
                  # Distributed Ledger Consensus
                </div>
                <p className="leading-normal text-slate-600">
                  Distributed ledgers provide immutable records across untrusted networks. While traditional databases use central coordinators, Byzantine fault tolerant systems require consensus among peers...
                </p>
                <div className="font-bold text-sm text-slate-900">## 2. Methodology</div>
                <p className="leading-normal text-slate-600">
                  We simulated three algorithms with 100 node clusters. The results are summarized below without standard captions or table styling:
                </p>
                <div className="p-2 border border-slate-300 font-mono text-[11px] bg-slate-50">
                  Algorithm | Latency | Throughput
                  Raft | 12ms | 4500 tx/s
                  PBFT | 38ms | 1800 tx/s
                </div>
                <div className="font-bold text-sm text-slate-900">## 3. Conclusion</div>
                <p className="leading-normal text-slate-600">
                  Raft demonstrates significantly higher throughput under low churn conditions.
                </p>
                <div className="mt-4 p-3 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-sans">
                  ⚠️ Deficiencies: Missing cover page, 1.0 line spacing, no page numbering, missing bibliography, raw markdown hashtags.
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Academic Header */}
                <div className="text-center border-b border-slate-200 pb-4 font-sans">
                  <span className="text-[11px] font-bold tracking-widest text-slate-600 uppercase block">
                    Department of Computer Science
                  </span>
                  <h3 className="text-xl font-bold text-academic-navy mt-1">
                    Distributed Ledger Consensus: A Comparative Analysis
                  </h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-3">
                    <span>CS-401 Advanced Systems</span>
                    <span>•</span>
                    <span>Student ID: 2024-CS-0912</span>
                    <span>•</span>
                    <span>Submission: October 2026</span>
                  </div>
                </div>

                {/* Body Content with 1.5 spacing and proper typography */}
                <div className="space-y-4 text-xs leading-[1.7] text-slate-800">
                  <h4 className="text-sm font-bold text-academic-navy font-sans tracking-tight">
                    1. Introduction & Theoretical Foundations
                  </h4>
                  <p>
                    Distributed ledgers provide verifiable and tamper-evident transaction logs across decoupled asynchronous networks. While centralized architectures utilize leader-elected coordinators, fault-tolerant protocols enforce atomic commitment across decentralized peer groups.
                  </p>

                  <h4 className="text-sm font-bold text-academic-navy font-sans tracking-tight">
                    2. Empirical Benchmark Methodology
                  </h4>
                  <p>
                    A cluster of one hundred participating nodes was instantiated to benchmark round-trip consensus latency and transaction throughput:
                  </p>

                  {/* Formatted Table */}
                  <table className="w-full text-left text-[11px] border border-slate-200 font-sans mt-2">
                    <thead className="bg-slate-100 font-bold text-slate-800">
                      <tr>
                        <th className="p-2 border-b border-slate-200">Consensus Protocol</th>
                        <th className="p-2 border-b border-slate-200 text-center">Round Latency</th>
                        <th className="p-2 border-b border-slate-200 text-center">Throughput (tx/s)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2 font-medium">Raft Consensus</td>
                        <td className="p-2 text-center">12.4 ms</td>
                        <td className="p-2 text-center">4,520</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Practical Byzantine Fault Tolerance</td>
                        <td className="p-2 text-center">38.1 ms</td>
                        <td className="p-2 text-center">1,810</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Page Footer Simulation */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-sans">
                    <span>CS-401 • Final Assignment</span>
                    <span>Page 1 of 6</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Engineered Specifically for University Standards
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Every feature addresses a real academic grading requirement without relying on third-party AI tokens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Typographic Precision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enforce Times New Roman, Arial, or Calibri with 1.5 or double line spacing, first-line indents, and custom margin bindings without breaking inline figures or math.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Faculty Cover Sheets</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inject clean academic title pages or substitute student metadata into your department's official .docx template with unlinked headers that suppress cover page numbers.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Official Marking Schemes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Attach grading criteria tables with component weights and marks allocations so examiners can score assignments directly against university descriptors.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Heading Page Breaks</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automatically start major Level 1 headings on new pages while keeping subheadings glued to their subsequent paragraphs to eliminate dangling titles.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Word TOC & Numbering</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inject genuine OpenXML dynamic Table of Contents and PAGE fields configured with Roman front matter and Arabic numbers starting at the Introduction.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Deterministic Compliance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant rule-based audit validating font sizes, heading hierarchies, required sections (Intro, Conclusion, References), and margin tolerances.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy by Design Commitment */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-4 text-emerald-400">
            <Lock className="w-6 h-6" />
            <h3 className="text-lg font-bold tracking-tight text-white">
              Privacy by Design & Academic Security
            </h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your coursework is private intellectual property. AssignmentReady processes files on an isolated, temporary workspace:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-800 text-xs text-slate-300">
            <div>
              <strong className="block text-white font-semibold mb-1">Zero AI Scraping</strong>
              We do not transmit your documents to OpenAI, Google Gemini, or third-party LLMs.
            </div>
            <div>
              <strong className="block text-white font-semibold mb-1">1-Hour Auto-Purge</strong>
              Uploaded and generated files are automatically deleted from server memory within 60 minutes.
            </div>
            <div>
              <strong className="block text-white font-semibold mb-1">Local Browser Profiles</strong>
              Saved institution presets reside exclusively in your browser's local storage.
            </div>
          </div>
        </div>
      </section>

      {/* Closing Call to Action */}
      <section className="text-center max-w-2xl mx-auto px-4 pb-12">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Ready to Format Your Assignment?
        </h2>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          No signups, no credit cards, no subscriptions. Upload your Word document and download a compliant academic submission in seconds.
        </p>
        <button
          type="button"
          onClick={onStartFormatting}
          className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-bold text-white bg-academic-navy hover:bg-academic-indigo rounded-xl shadow-md transition-all hover:scale-[1.02]"
        >
          <span>Start Formatting Now</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>
    </div>
  );
};
