import {
  Activity,
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Stethoscope,
  Trash2,
  X
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { PredictionResponse, Symptom } from '../types/index.js';

interface SymptomCheckerPageProps {
  onPredictionComplete: (result: PredictionResponse) => void;
  onNavigate: (page: string) => void;
}

export const SymptomCheckerPage: React.FC<SymptomCheckerPageProps> = ({
  onPredictionComplete,
  onNavigate,
}) => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVectorModal, setShowVectorModal] = useState(false);

  // Load available symptoms from server catalog
  useEffect(() => {
    async function load() {
      try {
        const data = await api.getSymptoms();
        setSymptoms(data);
      } catch (err) {
        console.error('Failed to load symptoms:', err);
      }
    }
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    symptoms.forEach((s) => set.add(s.category));
    return ['All', ...Array.from(set)];
  }, [symptoms]);

  const filteredSymptoms = useMemo(() => {
    return symptoms.filter((s) => {
      const matchesSearch = s.symptom_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [symptoms, searchQuery, selectedCategory]);

  const toggleSymptom = (name: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const removeSymptom = (name: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s !== name));
  };

  const clearAll = () => {
    setSelectedSymptoms([]);
  };

  // Quick preset bundles
  const applyPreset = (presetName: string, syms: string[]) => {
    setSelectedSymptoms(syms);
  };

  const [enableWeights, setEnableWeights] = useState(false);
  const [symptomWeights, setSymptomWeights] = useState<Record<string, { severity: number; frequency: number }>>({});

  // Ensure default weights exist when symptoms are selected
  useEffect(() => {
    setSymptomWeights((prev) => {
      const next = { ...prev };
      for (const sym of selectedSymptoms) {
        if (!next[sym]) {
          next[sym] = { severity: 99, frequency: 95 };
        }
      }
      return next;
    });
  }, [selectedSymptoms]);

  const updateSymptomSeverity = (sym: string, val: number) => {
    const clamped = Math.max(90, Math.min(108, val));
    setSymptomWeights((prev) => ({
      ...prev,
      [sym]: { ...(prev[sym] || { frequency: 95 }), severity: clamped }
    }));
  };

  const updateSymptomFrequency = (sym: string, val: number) => {
    const clamped = Math.max(90, Math.min(108, val));
    setSymptomWeights((prev) => ({
      ...prev,
      [sym]: { ...(prev[sym] || { severity: 99 }), frequency: clamped }
    }));
  };

  const calcWeightMultiplier = (sev: number, freq: number) => {
    const sNorm = Math.max(0, Math.min(1, (sev - 90) / 18));
    const fNorm = Math.max(0, Math.min(1, (freq - 90) / 18));
    const comb = Math.round((0.6 * sNorm + 0.4 * fNorm) * 1000) / 1000;
    const mult = Math.round((1.0 + comb * 1.5) * 100) / 100;
    return { comb, mult };
  };

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom before submitting for prediction.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const payloadWeights = enableWeights ? symptomWeights : undefined;
      const result = await api.predictDisease(selectedSymptoms, payloadWeights);
      onPredictionComplete(result);
    } catch (err: any) {
      setError(err.message || 'Prediction analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Title and Introduction */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
          <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
          <span>Symptom Selection Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Select Your Symptoms
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
          Search, filter, or tap from the comprehensive clinical symptoms catalog below. Your selections will be converted into a binary feature vector and evaluated by the trained machine-learning model.
        </p>
      </div>

      {/* Preset Quick Bundles */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Quick Educational Test Bundles:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset('Flu Bundle', ['Fever', 'Cough', 'Fatigue', 'Chills', 'Body pain'])}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
          >
            Cold & Flu (Fever, Cough, Chills)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('Migraine Bundle', ['Headache', 'Nausea', 'Dizziness'])}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
          >
            Migraine / Headache (Headache, Nausea, Dizziness)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('Digestive Bundle', ['Nausea', 'Vomiting', 'Diarrhea', 'Abdominal pain'])}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
          >
            Gastrointestinal (Nausea, Vomiting, Diarrhea)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('Respiratory Bundle', ['Shortness of breath', 'Wheezing', 'Chest pain', 'Cough'])}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
          >
            Respiratory Flare (Wheezing, Cough, Shortness of breath)
          </button>
        </div>
      </div>

      {/* Selected Symptoms Floating / Review Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Selected Symptoms ({selectedSymptoms.length})
            </h2>
            <button
              onClick={() => setShowVectorModal(true)}
              className="text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-300 flex items-center gap-1"
            >
              <Code2 className="w-3 h-3 text-slate-500" />
              View Binary Vector
            </button>
          </div>

          {selectedSymptoms.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>

        {selectedSymptoms.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl">
            <p className="text-xs text-slate-400">
              No symptoms selected yet. Select from the grid below or search by keyword.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map((sym) => (
              <span
                key={sym}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                {sym}
                <button
                  onClick={() => removeSymptom(sym)}
                  className="hover:text-rose-600 p-0.5 rounded hover:bg-blue-100/60 transition-colors ml-1"
                  title="Remove symptom"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Custom Severity & Frequency Weighting Panel (90-108 Scale) */}
        {selectedSymptoms.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEnableWeights(!enableWeights)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    enableWeights
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  {enableWeights ? 'Custom Weights Enabled (90-108)' : 'Customize Severity & Frequency (90-108 Range)'}
                </button>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  {enableWeights ? 'Adjust input values (90-108) per symptom below' : 'Optional clinical weighting'}
                </span>
              </div>
              {enableWeights && (
                <div className="text-[11px] font-medium text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                  Scale: <span className="font-bold">90</span> (1.0x mild) → <span className="font-bold">108</span> (2.5x critical)
                </div>
              )}
            </div>

            {enableWeights && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="text-[11px] text-slate-600">
                  Assign custom clinical severity and recurrence frequency values in the <strong className="text-blue-900">90 to 108 range</strong>. These values are calibrated into posterior probability weights for the Bernoulli Naive Bayes engine.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSymptoms.map((sym) => {
                    const cfg = symptomWeights[sym] || { severity: 99, frequency: 95 };
                    const { comb, mult } = calcWeightMultiplier(cfg.severity, cfg.frequency);

                    return (
                      <div
                        key={sym}
                        className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 truncate max-w-[180px]">{sym}</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {mult}x weight ({Math.round(comb * 100)}%)
                          </span>
                        </div>

                        {/* Severity Slider/Input (90-108) */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>Severity Intensity:</span>
                            <span className="font-mono font-bold text-blue-900">{cfg.severity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="90"
                              max="108"
                              step="0.5"
                              value={cfg.severity}
                              onChange={(e) => updateSymptomSeverity(sym, parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <input
                              type="number"
                              min="90"
                              max="108"
                              step="0.5"
                              value={cfg.severity}
                              onChange={(e) => updateSymptomSeverity(sym, parseFloat(e.target.value) || 90)}
                              className="w-14 px-1.5 py-0.5 text-[11px] font-mono border border-slate-300 rounded text-center"
                            />
                          </div>
                        </div>

                        {/* Frequency Slider/Input (90-108) */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>Episode Frequency:</span>
                            <span className="font-mono font-bold text-blue-900">{cfg.frequency}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="90"
                              max="108"
                              step="0.5"
                              value={cfg.frequency}
                              onChange={(e) => updateSymptomFrequency(sym, parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <input
                              type="number"
                              min="90"
                              max="108"
                              step="0.5"
                              value={cfg.frequency}
                              onChange={(e) => updateSymptomFrequency(sym, parseFloat(e.target.value) || 90)}
                              className="w-14 px-1.5 py-0.5 text-[11px] font-mono border border-slate-300 rounded text-center"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            {selectedSymptoms.length > 0
              ? `Ready to analyze ${selectedSymptoms.length} symptom${selectedSymptoms.length > 1 ? 's' : ''}.`
              : 'Select at least 1 symptom to proceed.'}
          </span>

          <button
            id="submit-prediction-btn"
            onClick={handleSubmit}
            disabled={loading || selectedSymptoms.length === 0}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing ML Model...
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4" />
                Run AI Disease Prediction
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search and Category Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search symptoms (e.g., Fever, Cough, Chest pain)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="md:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Symptoms Interactive Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Available Symptoms ({filteredSymptoms.length})
          </h3>
          <span className="text-xs text-slate-400">Click to select or unselect</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredSymptoms.map((sym) => {
            const isSelected = selectedSymptoms.includes(sym.symptom_name);
            return (
              <div
                key={sym.id}
                id={`sym-card-${sym.id}`}
                onClick={() => toggleSymptom(sym.symptom_name)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-xs text-slate-900 leading-snug">
                    {sym.symptom_name}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-slate-50'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 text-[10px]">
                    {sym.category}
                  </span>
                  {sym.description && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={sym.description}>
                      {sym.description}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Binary Feature Vector Modal for ML Explainability */}
      {showVectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 text-left shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Binary One-Hot Symptom Feature Vector
                </h3>
              </div>
              <button
                onClick={() => setShowVectorModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              In machine learning, input symptoms are encoded into high-dimensional binary vectors (where each feature is 0 or 1) passed into the Bernoulli Naive Bayes classifier.
            </p>

            <div className="my-4 overflow-y-auto flex-1 p-3 bg-slate-950 rounded-xl text-emerald-400 font-mono text-xs space-y-1">
              <div className="text-slate-500">// Feature Vector Mapping (Vocabulary Size: {symptoms.length})</div>
              {symptoms.map((s) => {
                const isActive = selectedSymptoms.includes(s.symptom_name);
                return (
                  <div key={s.id} className="flex justify-between py-0.5 border-b border-slate-800/60">
                    <span className={isActive ? 'text-blue-300 font-bold' : 'text-slate-500'}>
                      "{s.symptom_name}"
                    </span>
                    <span className={isActive ? 'text-amber-400 font-bold' : 'text-slate-600'}>
                      {isActive ? '1 (Active)' : '0'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowVectorModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Vector Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
