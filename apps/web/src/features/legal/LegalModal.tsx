import { X, ShieldCheck, FileText, Lock, AlertTriangle } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen || !type) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            {type === 'privacy' ? (
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-academic-teal flex items-center justify-center border border-teal-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-academic-blue flex items-center justify-center border border-blue-200">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <h2 id="legal-modal-title" className="text-lg font-bold text-slate-900">
              {type === 'privacy' ? 'Privacy Policy & Data Processing' : 'Terms of Use & Academic Notice'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-600 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start gap-3">
                <Lock className="w-4 h-4 text-academic-teal shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Zero Permanent Storage & No Tracking:</span>
                  <p className="mt-0.5 text-teal-800">
                    AssignmentReady does not sell, analyze, or train AI models on user documents. All uploaded assignments and files are strictly stored in temporary memory/disk and purged automatically within 1 hour.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">1. Document Processing Principles</h3>
                <p>
                  Documents submitted for formatting, conversion, or presentation generation are processed deterministically on our server. We do not transmit document content to third-party paid AI APIs, advertisers, or academic institutions.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">2. Local College Profiles</h3>
                <p>
                  Custom college profiles and formatting presets are stored entirely within your browser's local storage (LocalStorage). Clearing your browser cookies or cache will reset your saved presets.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">3. No Mandatory User Accounts</h3>
                <p>
                  AssignmentReady requires no sign-up, email registration, credit card, or personal identifiable information (PII) to format documents or download results.
                </p>
              </section>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
                Maintained and developed by <span className="font-semibold text-slate-700">Sujan G.C.</span> as an open academic utility.
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Important Academic Notice:</span>
                  <p className="mt-0.5 text-amber-800">
                    Formatting an assignment does not guarantee passing grades, faculty approval, or prove the absence of AI generation. Students remain strictly responsible for their academic integrity and citation accuracy.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">1. Permitted Use</h3>
                <p>
                  AssignmentReady is provided free of charge for university students, educators, and researchers to format documents, replace cover pages, and prepare presentations according to departmental guidelines.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">2. Student Responsibility</h3>
                <p>
                  Users must ensure that their final submission satisfies their specific instructor's instructions, institution's plagiarism and AI policies, and departmental referencing conventions (e.g. APA 7, Harvard, IEEE).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">3. Limitation of Liability</h3>
                <p>
                  The software is provided "as is", without warranty of any kind, express or implied. In no event shall the authors or copyright holders be liable for any claims, damages, or grading outcomes arising from document preparation.
                </p>
              </section>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
                AssignmentReady platform developed by <span className="font-semibold text-slate-700">Sujan G.C.</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
