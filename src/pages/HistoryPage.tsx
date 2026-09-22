import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  History,
  Search,
  Stethoscope,
  X
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { PredictionRecord, User } from '../types/index.js';

interface HistoryPageProps {
  user: User | null;
  openId?: string;
  onNavigate: (page: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ user, openId, onNavigate }) => {
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PredictionRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getHistory();
        setHistory(data);
        if (openId) {
          const matched = data.find((d) => d.id === openId);
          if (matched) setSelectedRecord(matched);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, openId]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchSearch =
        item.predicted_disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [history, searchQuery]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <History className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign in to View History</h2>
        <p className="text-xs text-slate-500">
          Your prediction history is securely stored on your account. Please log in or register.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span>Assessment Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Prediction History
          </h1>
          <p className="text-xs text-slate-500">
            Audit trail of your previous symptom submissions and machine learning results.
          </p>
        </div>

        <button
          onClick={() => onNavigate('checker')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Stethoscope className="w-4 h-4" />
          Start New Prediction
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter history by disease or symptom..."
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

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading your history records...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-700">No predictions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't recorded any predictions matching this search. Run an assessment to log your first entry.
            </p>
            <button
              onClick={() => onNavigate('checker')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
            >
              Run Symptom Checker
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 font-bold">Symptoms</th>
                  <th className="py-3 px-4 font-bold">Predicted Disease</th>
                  <th className="py-3 px-4 font-bold">Result / Confidence</th>
                  <th className="py-3 px-4 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(row.prediction_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block pl-5">
                        {new Date(row.prediction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs sm:max-w-md">
                        {row.symptoms.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm">{row.predicted_disease}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800">
                        <Activity className="w-3 h-3 text-blue-600" />
                        {row.confidence}% Confidence
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedRecord(row)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Open Record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Individual Record Modal Viewer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-left shadow-2xl border border-slate-200 my-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Record ID: {selectedRecord.id}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  Prediction Details: {selectedRecord.predicted_disease}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Recorded on {new Date(selectedRecord.prediction_date).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Model Confidence Box */}
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-600 font-medium">Model Confidence Probability:</span>
                <div className="text-2xl font-extrabold text-blue-900">{selectedRecord.confidence}%</div>
              </div>
              <span className="text-xs bg-white px-3 py-1 rounded-lg border border-blue-200 font-semibold text-blue-800">
                Algorithm: Naive Bayes
              </span>
            </div>

            {/* Symptoms Analyzed */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Symptoms Submitted for Assessment
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedRecord.symptoms.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            {selectedRecord.disease_description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Condition Summary
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {selectedRecord.disease_description}
                </p>
              </div>
            )}

            {/* Precautions */}
            {selectedRecord.precautions && selectedRecord.precautions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Associated Precautions & Steps
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedRecord.precautions.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Next Step */}
            {selectedRecord.recommended_next_step && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">
                  Recommended Action:
                </span>
                <p>{selectedRecord.recommended_next_step}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
