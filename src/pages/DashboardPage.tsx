import {
  Activity,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Heart,
  History,
  LogOut,
  MapPin,
  PlusCircle,
  Shield,
  Stethoscope,
  TrendingUp,
  User as UserIcon
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { PredictionRecord, User } from '../types/index.js';

interface DashboardPageProps {
  user: User;
  onNavigate: (page: string, params?: any) => void;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate, onLogout }) => {
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await api.getHistory();
        setHistory(data);
      } catch (err) {
        console.error('Failed to load user history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/30">
              <Activity className="w-3.5 h-3.5 text-blue-300" />
              Patient Health Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl">
              Track your symptom assessments, view machine learning predictions, examine precautionary measures, and consult accredited healthcare resources.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dash-start-pred-btn"
              onClick={() => onNavigate('checker')}
              className="px-5 py-3 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              Start New Prediction
            </button>
            <button
              id="dash-logout-btn"
              onClick={onLogout}
              className="px-4 py-3 rounded-xl bg-blue-900/60 hover:bg-blue-900 text-blue-200 hover:text-white font-medium text-sm border border-blue-700 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation / Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Start New Prediction */}
        <div
          onClick={() => onNavigate('checker')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
            Start New Prediction
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Input recent symptoms for machine learning disease classification.
          </p>
        </div>

        {/* 2. Prediction History */}
        <div
          onClick={() => onNavigate('history')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <History className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
              Prediction History
            </h3>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              {history.length} Saved
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Access past assessments and reviewed precautions.
          </p>
        </div>

        {/* 3. Disease & Health Information */}
        <div
          onClick={() => onNavigate('diseases')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
            Health Information
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Browse conditions, known symptoms, and clinical advice.
          </p>
        </div>

        {/* 4. Patient Profile */}
        <div
          onClick={() => onNavigate('profile')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <UserIcon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
            Patient Profile
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Update personal metrics, contact numbers, and security.
          </p>
        </div>
      </div>

      {/* Main Grid: Recent History + Health Info summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Predictions Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Symptom Predictions</h2>
              <p className="text-xs text-slate-500">Your most recent AI classification records</p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Full History <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading your history...</div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Stethoscope className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No predictions recorded yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select your symptoms to generate your first machine-learning disease risk analysis.
              </p>
              <button
                onClick={() => onNavigate('checker')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                Check Symptoms Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Symptoms Entered</th>
                    <th className="py-2.5 px-3">Possible Disease</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.slice(0, 4).map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(rec.prediction_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {rec.symptoms.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]"
                            >
                              {s}
                            </span>
                          ))}
                          {rec.symptoms.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-medium self-center">
                              +{rec.symptoms.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {rec.predicted_disease}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                          {rec.confidence}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onNavigate('history', { openId: rec.id })}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Profile & Health Tip Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{user.name}</h3>
                <p className="text-xs text-slate-500">{user.email}</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                  Role: {user.role.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Age:</span>
                <span className="font-semibold text-slate-800">{user.age} yrs</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Gender:</span>
                <span className="font-semibold text-slate-800">{user.gender}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Phone:</span>
                <span className="font-semibold text-slate-800">{user.phone || 'Not specified'}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('profile')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Edit Profile Information
            </button>
          </div>

          {/* Educational Guidelines */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <Heart className="w-4 h-4 text-emerald-600" />
              <span>Health Observation Checklist</span>
            </div>
            <p className="text-xs text-emerald-900/90 leading-relaxed">
              When monitoring symptoms at home, keep a log of onset time, fever temperatures, and any newly emerging red-flag signals.
            </p>
            <button
              onClick={() => onNavigate('find-care')}
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              Emergency Care & Clinic Hotline <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
