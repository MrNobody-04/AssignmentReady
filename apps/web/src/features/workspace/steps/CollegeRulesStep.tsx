import React from 'react';
import { BookOpen, Check, ArrowRight, ArrowLeft, Sliders } from 'lucide-react';
import { FormattingSettings, CollegeProfile } from '../../../types';
import { preloadedProfiles } from '../../../data/preloadedProfiles';

interface CollegeRulesStepProps {
  settings: FormattingSettings;
  onChange: (settings: FormattingSettings) => void;
  onNext: () => void;
  onBack: () => void;
  onOpenProfilesModal: () => void;
}

export const CollegeRulesStep: React.FC<CollegeRulesStepProps> = ({
  settings,
  onChange,
  onNext,
  onBack,
  onOpenProfilesModal,
}) => {
  const [selectedProfileId, setSelectedProfileId] = React.useState<string>('harvard-academic');

  const handleSelectProfile = (profile: CollegeProfile) => {
    setSelectedProfileId(profile.id);
    onChange({
      ...profile.settings,
      cover_page: {
        ...profile.settings.cover_page,
        student_name: settings.cover_page.student_name || profile.settings.cover_page.student_name,
        student_id: settings.cover_page.student_id || profile.settings.cover_page.student_id,
        assignment_title: settings.cover_page.assignment_title || profile.settings.cover_page.assignment_title,
        module_code: settings.cover_page.module_code || profile.settings.cover_page.module_code,
      },
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-academic-blue" />
            <span>Select College Profile or Academic Formatting Rules</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose an official institutional template or preset rule set. All rules can be fine-tuned in following steps.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenProfilesModal}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5 text-academic-blue" />
          <span>Browse All College Profiles</span>
        </button>
      </div>

      {/* Preset Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {preloadedProfiles.map((p) => {
          const isSelected = selectedProfileId === p.id;
          return (
            <div
              key={p.id}
              onClick={() => handleSelectProfile(p)}
              className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-academic-blue bg-white ring-2 ring-academic-blue/30 shadow-md scale-[1.01]'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-academic-blue px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                    {p.institution.split('&')[0].trim()}
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-academic-blue text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-1">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{p.settings.body.font_family} {p.settings.body.font_size_pt}pt</span>
                <span className="font-semibold text-slate-600">{p.settings.body.line_spacing}x Spacing</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Rules Summary */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          <span className="font-bold text-slate-800">Active Rule Set: </span>
          <span>{settings.body.font_family} ({settings.body.font_size_pt}pt), {settings.body.line_spacing}x line spacing, {settings.margins.left_inches}" margins, {settings.paper_size} page format.</span>
        </div>
        <span className="text-emerald-700 font-semibold shrink-0 flex items-center gap-1">
          <Check className="w-3.5 h-3.5" />
          <span>Rules loaded & verified</span>
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upload</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-academic-navy hover:bg-academic-indigo text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
        >
          <span>Continue to Cover Page</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
