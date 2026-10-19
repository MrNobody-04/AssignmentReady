import React from 'react';
import {
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  FileCheck2,
} from 'lucide-react';
import { MarkingSchemeData, MarkingCriterion, FormattingSettings } from '../../../types';

interface MarkingSchemeStepProps {
  settings: FormattingSettings;
  hasRubricFile: boolean;
  onChange: (markingData: MarkingSchemeData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const MarkingSchemeStep: React.FC<MarkingSchemeStepProps> = ({
  settings,
  hasRubricFile,
  onChange,
  onNext,
  onBack,
}) => {
  const scheme = settings.marking_scheme;

  const update = (key: keyof MarkingSchemeData, val: unknown) => {
    onChange({
      ...scheme,
      [key]: val,
    });
  };

  const addCriterion = () => {
    const newCrit: MarkingCriterion = {
      name: 'New Assessment Component',
      description: 'Describe grading expectations and required evidence.',
      max_marks: 20,
      weight_percentage: 20,
    };
    update('criteria', [...scheme.criteria, newCrit]);
  };

  const updateCriterion = (index: number, key: keyof MarkingCriterion, val: unknown) => {
    const updated = scheme.criteria.map((c, idx) => (idx === index ? { ...c, [key]: val } : c));
    update('criteria', updated);
  };

  const removeCriterion = (index: number) => {
    const filtered = scheme.criteria.filter((_, idx) => idx !== index);
    update('criteria', filtered);
  };

  const totalMarks = scheme.criteria.reduce((sum, c) => sum + (c.max_marks || 0), 0);
  const totalWeight = scheme.criteria.reduce((sum, c) => sum + (c.weight_percentage || 0), 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Marking Scheme & Assessment Rubric
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Attach or generate an official grading rubric table so professors and markers can record component scores directly on your document.
        </p>
      </div>

      {/* Enable Toggle Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Insert Official Marking Rubric Table
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Embeds a formatted OpenXML grading table with criteria, descriptions, and mark allocations.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={scheme.enabled}
            onChange={(e) => update('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-academic-navy"></div>
        </label>
      </div>

      {hasRubricFile && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-academic-blue shrink-0" />
          <span>Official marking scheme attached. Backend will extract criteria tables and descriptors from your uploaded file.</span>
        </div>
      )}

      {scheme.enabled && (
        <div className="space-y-6">
          {/* Configuration Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Section Heading Title
              </label>
              <input
                type="text"
                value={scheme.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Official Assessment Criteria & Marking Scheme"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Document Placement
              </label>
              <select
                value={scheme.placement}
                onChange={(e) => update('placement', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
              >
                <option value="end_of_document">End of Document (Appendix / Scoring Sheet)</option>
                <option value="after_cover">Directly After Cover Page / Front Matter</option>
                <option value="before_references">Before References & Bibliography</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Rubric Explanatory Notes (Optional)
              </label>
              <input
                type="text"
                value={scheme.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="e.g. Scored against standard university Level 7 marking descriptors."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-academic-blue"
              />
            </div>
          </div>

          {/* Criteria Editor Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Grading Components & Weights</h4>
                <p className="text-xs text-slate-500">
                  {scheme.criteria.length} criteria defined • Total Marks: {totalMarks} • Total Weight: {totalWeight}%
                </p>
              </div>

              <button
                type="button"
                onClick={addCriterion}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-academic-navy bg-white hover:bg-slate-100 rounded-md border border-slate-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Component</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-1/4">Criterion / Component</th>
                    <th className="py-2.5 px-3 w-1/2">Description & Standards</th>
                    <th className="py-2.5 px-3 w-20 text-center">Marks</th>
                    <th className="py-2.5 px-3 w-20 text-center">Weight %</th>
                    <th className="py-2.5 px-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {scheme.criteria.map((crit, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <input
                          type="text"
                          value={crit.name}
                          onChange={(e) => updateCriterion(idx, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-medium"
                        />
                      </td>
                      <td className="p-3">
                        <textarea
                          rows={2}
                          value={crit.description}
                          onChange={(e) => updateCriterion(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded resize-none"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={crit.max_marks}
                          onChange={(e) =>
                            updateCriterion(idx, 'max_marks', parseFloat(e.target.value) || 0)
                          }
                          className="w-16 px-2 py-1 text-xs border border-slate-300 rounded text-center"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={crit.weight_percentage}
                          onChange={(e) =>
                            updateCriterion(idx, 'weight_percentage', parseFloat(e.target.value) || 0)
                          }
                          className="w-16 px-2 py-1 text-xs border border-slate-300 rounded text-center"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeCriterion(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cover Page</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-academic-navy hover:bg-academic-indigo rounded-lg shadow-sm transition-colors"
        >
          <span>Continue to Review & Compliance</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
