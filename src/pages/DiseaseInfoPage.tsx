import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Filter,
  HeartPulse,
  Info,
  Search,
  ShieldCheck,
  Stethoscope,
  X
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { Disease } from '../types/index.js';

interface DiseaseInfoPageProps {
  onSelectForChecker?: (symptoms: string[]) => void;
  onNavigate: (page: string) => void;
}

export const DiseaseInfoPage: React.FC<DiseaseInfoPageProps> = ({
  onSelectForChecker,
  onNavigate,
}) => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalDisease, setActiveModalDisease] = useState<Disease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getDiseases();
        setDiseases(data);
      } catch (err) {
        console.error('Failed to load diseases:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    diseases.forEach((d) => set.add(d.category || 'General'));
    return ['All', ...Array.from(set)];
  }, [diseases]);

  const filteredDiseases = useMemo(() => {
    return diseases.filter((d) => {
      const matchSearch =
        d.disease_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === 'All' || d.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [diseases, searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Title Header */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Clinical Knowledge Base</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Disease Information & Health Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
          Browse clinical summaries, known symptoms, lifestyle precautions, and medical consultation guidance for common health conditions. Written in simple, clear language for educational awareness.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by disease name, symptom, or keyword..."
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

      {/* Disease Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading disease catalog...</div>
      ) : filteredDiseases.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <Info className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No diseases match your search criteria</p>
          <p className="text-xs text-slate-500">Try adjusting your keyword or reset filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiseases.map((disease) => {
            const riskColors = {
              low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              moderate: 'bg-amber-50 text-amber-700 border-amber-200',
              high: 'bg-orange-50 text-orange-700 border-orange-200',
              critical: 'bg-rose-50 text-rose-700 border-rose-200',
            }[disease.risk_level || 'moderate'];

            return (
              <div
                key={disease.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {disease.category || 'General'}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border capitalize ${riskColors}`}
                    >
                      {disease.risk_level || 'Moderate'} Tier
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {disease.disease_name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {disease.description}
                  </p>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">
                      Common Symptoms:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {disease.symptoms.slice(0, 4).map((sym) => (
                        <span
                          key={sym}
                          className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[11px] font-medium border border-blue-100"
                        >
                          {sym}
                        </span>
                      ))}
                      {disease.symptoms.length > 4 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{disease.symptoms.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setActiveModalDisease(disease)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    View Precautions & Care <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigate('checker')}
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-900"
                    title="Run symptom checker"
                  >
                    Check Symptoms
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Disease Detail Modal */}
      {activeModalDisease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-left shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {activeModalDisease.category}
                  </span>
                  <span className="text-[11px] uppercase font-bold text-slate-500">
                    Severity: {activeModalDisease.risk_level}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {activeModalDisease.disease_name}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalDisease(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Medical Overview
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {activeModalDisease.description}
              </p>
            </div>

            {/* Symptoms */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Common Symptoms
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeModalDisease.symptoms.map((s) => (
                  <div
                    key={s}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Precautions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                General Prevention & Self-Care Precautions
              </h4>
              <ul className="space-y-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                {activeModalDisease.precautions.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* When to seek doctor */}
            {activeModalDisease.when_to_seek_doctor && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-xs">
                <div className="font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  When to Seek Professional Medical Attention:
                </div>
                <p className="text-amber-900 leading-relaxed">
                  {activeModalDisease.when_to_seek_doctor}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setActiveModalDisease(null);
                  onNavigate('find-care');
                }}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Find Local Medical Provider →
              </button>
              <button
                onClick={() => setActiveModalDisease(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close Condition Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
