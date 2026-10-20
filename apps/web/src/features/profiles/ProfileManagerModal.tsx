import React, { useState, useRef } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Copy,
  Trash2,
  Check,
  Info,
  Download,
  UploadCloud,
  ShieldCheck,
} from 'lucide-react';
import { CollegeProfile, FormattingSettings } from '../../types';
import { profilesManager } from '../../lib/profiles';
import { ScrollReveal } from '../../components/ui/ScrollReveal';

interface ProfileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: FormattingSettings;
  onApplyProfile: (profile: CollegeProfile) => void;
}

export const ProfileManagerModal: React.FC<ProfileManagerModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onApplyProfile,
}) => {
  const [profiles, setProfiles] = useState<CollegeProfile[]>(() => profilesManager.getAll());
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleApply = (profile: CollegeProfile) => {
    onApplyProfile(profile);
    setAppliedId(profile.id);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    profilesManager.save({
      name: newProfileName.trim(),
      institution: newInstitution.trim() || 'My University',
      description: newDescription.trim() || 'Custom academic formatting profile',
      settings: JSON.parse(JSON.stringify(currentSettings)),
    });

    setProfiles(profilesManager.getAll());
    setIsCreating(false);
    setNewProfileName('');
    setNewInstitution('');
    setNewDescription('');
  };

  const handleDuplicate = (id: string) => {
    profilesManager.duplicate(id);
    setProfiles(profilesManager.getAll());
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this saved formatting profile?')) {
      profilesManager.delete(id);
      setProfiles(profilesManager.getAll());
    }
  };

  const handleExport = (profile: CollegeProfile) => {
    profilesManager.exportProfile(profile);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        profilesManager.importProfile(text);
        setProfiles(profilesManager.getAll());
      } catch (err: unknown) {
        setImportError((err as Error).message || 'Invalid profile JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-academic-navy text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">College & University Rules Library</h3>
              <p className="text-xs text-slate-500">
                Verified institutional standards, custom rules & faculty templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {importError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {importError}
            </div>
          )}

          {/* Privacy & Storage Notice */}
          <ScrollReveal delay={0}>
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-academic-blue shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold block">Browser Local Storage & Rule Privacy:</span>
                College profiles are saved locally in your browser. AssignmentReady operates without accounts or external cloud databases. You can export and import profile JSON files across devices.
              </div>
            </div>
          </ScrollReveal>

          {/* Action Row: Create New & Import JSON */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex-1 w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-academic-navy hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-academic-blue" />
              <span>Save Current Settings as New Profile</span>
            </button>

            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-slate-500" />
              <span>Import JSON</span>
            </button>
          </div>

          {/* Create New Profile Form */}
          {isCreating && (
            <form onSubmit={handleSaveCurrent} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                New Custom College Profile
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Profile Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Warwick CS Standard"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Institution</label>
                  <input
                    type="text"
                    placeholder="e.g. University of Warwick"
                    value={newInstitution}
                    onChange={(e) => setNewInstitution(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Guidelines</label>
                <input
                  type="text"
                  placeholder="e.g. 1.5 spacing, 1-inch margins, title sheet required"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-academic-navy hover:bg-academic-indigo rounded-lg cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {/* Profile List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Available Formatting Profiles ({profiles.length})
            </h4>

            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{profile.name}</span>
                    {profile.is_builtin ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Standard
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-academic-blue border border-blue-200">
                        Custom User Profile
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{profile.institution}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{profile.description}</p>
                  {profile.verified_source && (
                    <p className="text-[11px] text-slate-400">
                      Source: {profile.verified_source} • Verified: {profile.last_verified_date}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleExport(profile)}
                    title="Export Profile as JSON"
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(profile.id)}
                    title="Duplicate Profile"
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {!profile.is_builtin && (
                    <button
                      type="button"
                      onClick={() => handleDelete(profile.id)}
                      title="Delete Profile"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleApply(profile)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      appliedId === profile.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-academic-navy text-white hover:bg-academic-indigo'
                    }`}
                  >
                    {appliedId === profile.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Applied!</span>
                      </>
                    ) : (
                      <span>Apply Profile</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
