import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Copy,
  Trash2,
  Check,
  Info,
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
              <h3 className="text-base font-bold text-slate-900">College Formatting Profiles</h3>
              <p className="text-xs text-slate-500">
                Preset academic standards & browser-saved faculty templates
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
          {/* Privacy & Storage Notice */}
          <ScrollReveal delay={0}>
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-academic-blue shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold block">Browser Local Storage:</span>
                College profiles are saved locally in your browser so you can reuse requirements without an account. Profiles never contain assignment texts. If browser storage is cleared, custom profiles may be reset.
              </div>
            </div>
          </ScrollReveal>

          {/* Create New Profile Form */}
          <ScrollReveal delay={50}>
            {!isCreating ? (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-academic-navy hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-academic-blue" />
                <span>Save Current Workspace Settings as New Profile</span>
              </button>
            ) : (
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
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-academic-navy hover:bg-academic-indigo rounded-lg"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            )}
          </ScrollReveal>

          {/* Profile List */}
          <div className="space-y-3">
            <ScrollReveal delay={100}>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Available Formatting Profiles ({profiles.length})
              </h4>
            </ScrollReveal>

            {profiles.map((profile, idx) => (
              <ScrollReveal key={profile.id} delay={Math.min(100 + idx * 40, 400)}>
                <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{profile.name}</span>
                      {profile.is_builtin ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
                          Built-in Preset
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-academic-blue">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{profile.institution}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{profile.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(profile.id)}
                      title="Duplicate Profile"
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {!profile.is_builtin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(profile.id)}
                        title="Delete Profile"
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleApply(profile)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
