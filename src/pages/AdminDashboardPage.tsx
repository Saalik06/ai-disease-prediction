import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Database,
  Edit2,
  FileText,
  Filter,
  Layers,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Users,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { AdminStats, Disease, PredictionRecord, Symptom, User } from '../types/index.js';

interface AdminDashboardPageProps {
  currentUser: User;
  onNavigate: (page: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'symptoms' | 'diseases'>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [symptomsList, setSymptomsList] = useState<Symptom[]>([]);
  const [diseasesList, setDiseasesList] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals state
  const [showAddSymptomModal, setShowAddSymptomModal] = useState(false);
  const [showAddDiseaseModal, setShowAddDiseaseModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New Symptom Form
  const [newSymptom, setNewSymptom] = useState<{
    symptom_name: string;
    category: string;
    description: string;
    severity_weight?: number;
    frequency_weight?: number;
  }>({
    symptom_name: '',
    category: 'General',
    description: '',
    severity_weight: undefined,
    frequency_weight: undefined,
  });

  const [editingSymptomWeights, setEditingSymptomWeights] = useState<Symptom | null>(null);
  const [weightForm, setWeightForm] = useState<{ severity_weight: number; frequency_weight: number }>({
    severity_weight: 99,
    frequency_weight: 95,
  });

  // New Disease Form
  const [newDisease, setNewDisease] = useState({
    disease_name: '',
    category: 'General',
    description: '',
    symptoms: '',
    precautions: '',
    when_to_seek_doctor: '',
    risk_level: 'moderate',
  });

  // New User Form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    age: 30,
    gender: 'Prefer not to say',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, uData, sData, dData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getSymptoms(),
        api.getDiseases(),
      ]);
      setStats(statsData);
      setUsersList(uData);
      setSymptomsList(sData);
      setDiseasesList(dData);
    } catch (err: any) {
      setActionError(err.message || 'Failed to load administrative records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // User Actions
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      await api.deleteUser(id);
      triggerSuccess('User successfully removed.');
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete user.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.register({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        confirmPassword: newUser.password,
        age: Number(newUser.age),
        gender: newUser.gender,
      });
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'patient', age: 30, gender: 'Prefer not to say' });
      triggerSuccess('User successfully registered.');
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create user.');
    }
  };

  // Symptom Actions
  const handleCreateSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addSymptom(newSymptom);
      setShowAddSymptomModal(false);
      setNewSymptom({
        symptom_name: '',
        category: 'General',
        description: '',
        severity_weight: undefined,
        frequency_weight: undefined,
      });
      triggerSuccess('Symptom added to clinical catalog.');
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create symptom.');
    }
  };

  const handleAssignWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSymptomWeights) return;
    try {
      await api.assignSymptomWeights(editingSymptomWeights.id, {
        severity_weight: Number(weightForm.severity_weight),
        frequency_weight: Number(weightForm.frequency_weight),
      });
      triggerSuccess(
        `Assigned severity (${weightForm.severity_weight}) and frequency (${weightForm.frequency_weight}) weights for "${editingSymptomWeights.symptom_name}".`
      );
      setEditingSymptomWeights(null);
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to assign symptom weights.');
    }
  };

  const handleDeleteSymptom = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this symptom?')) return;
    try {
      await api.deleteSymptom(id);
      triggerSuccess('Symptom removed.');
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete symptom.');
    }
  };

  // Disease Actions
  const handleCreateDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addDisease({
        disease_name: newDisease.disease_name,
        category: newDisease.category,
        description: newDisease.description,
        symptoms: newDisease.symptoms.split(',').map((s) => s.trim()).filter(Boolean),
        precautions: newDisease.precautions.split('\n').map((p) => p.trim()).filter(Boolean),
        when_to_seek_doctor: newDisease.when_to_seek_doctor,
        risk_level: newDisease.risk_level as any,
      });
      setShowAddDiseaseModal(false);
      setNewDisease({
        disease_name: '',
        category: 'General',
        description: '',
        symptoms: '',
        precautions: '',
        when_to_seek_doctor: '',
        risk_level: 'moderate',
      });
      triggerSuccess('Disease condition added to knowledge database.');
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to add disease.');
    }
  };

  const handleDeleteDisease = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this disease?')) return;
    try {
      await api.deleteDisease(id);
      triggerSuccess('Disease removed.');
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete disease.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Master Administration Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage patient users, symptom catalogs, clinical disease schemas, and system-wide predictive analytics.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'stats'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Prediction Statistics & Logs
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Manage Users ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('symptoms')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'symptoms'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Manage Symptoms ({symptomsList.length})
        </button>

        <button
          onClick={() => setActiveTab('diseases')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'diseases'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          Manage Diseases ({diseasesList.length})
        </button>
      </div>

      {/* TAB 1: Prediction Statistics & Real-time Logs */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Total Users
              </span>
              <div className="text-3xl font-extrabold text-slate-900">{stats?.total_users || 0}</div>
              <p className="text-[11px] text-slate-400">Registered patients & admins</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Predictions Run
              </span>
              <div className="text-3xl font-extrabold text-blue-700">
                {stats?.total_predictions || 0}
              </div>
              <p className="text-[11px] text-slate-400">Evaluated machine learning passes</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Top Predicted Condition
              </span>
              <div className="text-xl font-extrabold text-slate-900 truncate">
                {stats?.most_predicted_disease || 'None recorded'}
              </div>
              <p className="text-[11px] text-slate-400">Highest statistical frequency</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Active Knowledge
              </span>
              <div className="text-3xl font-extrabold text-slate-900">
                {stats?.total_diseases || 0} Conditions
              </div>
              <p className="text-[11px] text-slate-400">{stats?.total_symptoms || 0} symptom features</p>
            </div>
          </div>

          {/* Condition Distribution Overview */}
          {stats?.disease_distribution && Object.keys(stats.disease_distribution).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Predicted Conditions Distribution Frequency
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.disease_distribution).map(([dis, count]) => {
                  const pct = Math.round(((count as number) / (stats.total_predictions || 1)) * 100);
                  return (
                    <div key={dis} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{dis}</span>
                        <span className="text-slate-500">{Number(count)} assessments ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Activity / Recent Prediction Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Recent System Prediction Audit Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Patient / User ID</th>
                    <th className="py-2.5 px-3">Symptoms Vector</th>
                    <th className="py-2.5 px-3">Predicted Disease</th>
                    <th className="py-2.5 px-3">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.recent_predictions && stats.recent_predictions.length > 0 ? (
                    stats.recent_predictions.map((log: PredictionRecord) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(log.prediction_date).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          {log.user_id.slice(0, 10)}...
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {log.symptoms.slice(0, 3).map((s) => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px]">
                                {s}
                              </span>
                            ))}
                            {log.symptoms.length > 3 && (
                              <span className="text-[10px] text-slate-400">+{log.symptoms.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">{log.predicted_disease}</td>
                        <td className="py-3 px-3 font-semibold text-blue-700">{log.confidence}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        No prediction logs captured yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Manage Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Account Management</h3>
              <p className="text-xs text-slate-500">View and manage registered patient and administrator profiles.</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.age || '-'} yrs / {u.gender || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.id !== currentUser.id ? (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Current Session</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Manage Symptoms */}
      {activeTab === 'symptoms' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Symptom Features Vocabulary</h3>
              <p className="text-xs text-slate-500">
                Clinical symptoms recognized by the machine learning binary vector encoder.
              </p>
            </div>
            <button
              onClick={() => setShowAddSymptomModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Symptom
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {symptomsList.map((sym) => (
              <div
                key={sym.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between gap-2 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{sym.symptom_name}</span>
                    <span className="text-[10px] text-slate-500">{sym.category}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteSymptom(sym.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    title="Remove symptom"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Severity & Frequency Weights (90-108) */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <div className="text-slate-600">
                    {sym.severity_weight !== undefined || sym.frequency_weight !== undefined ? (
                      <span className="text-blue-800 font-medium">
                        Sev: {sym.severity_weight || '—'} | Freq: {sym.frequency_weight || '—'}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No custom weights</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setEditingSymptomWeights(sym);
                      setWeightForm({
                        severity_weight: sym.severity_weight || 99,
                        frequency_weight: sym.frequency_weight || 95,
                      });
                    }}
                    className="text-blue-700 hover:text-blue-900 font-semibold text-[11px] underline"
                  >
                    Set Weights (90-108)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Manage Diseases */}
      {activeTab === 'diseases' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Clinical Disease Knowledge Base</h3>
              <p className="text-xs text-slate-500">
                Diseases, symptoms mappings, severity tiers, and associated precautions.
              </p>
            </div>
            <button
              onClick={() => setShowAddDiseaseModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Disease
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diseasesList.map((d) => (
              <div
                key={d.id}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {d.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{d.disease_name}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteDisease(d.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete disease"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{d.description}</p>

                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Symptoms: </span>
                  {d.symptoms.join(', ')}
                </div>

                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Precautions: </span>
                  {d.precautions.length} listed
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-left shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-3">Add New System User</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Symptom */}
      {showAddSymptomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-left shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-3">Add Symptom Feature</h3>
            <form onSubmit={handleCreateSymptom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Symptom Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dry Cough, Wheezing"
                  value={newSymptom.symptom_name}
                  onChange={(e) => setNewSymptom({ ...newSymptom, symptom_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Respiratory, Neurological"
                  value={newSymptom.category}
                  onChange={(e) => setNewSymptom({ ...newSymptom, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief clinical description"
                  value={newSymptom.description}
                  onChange={(e) => setNewSymptom({ ...newSymptom, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              {/* Custom Weights (90-108 Range) */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Severity Weight (90-108)
                  </label>
                  <input
                    type="number"
                    min="90"
                    max="108"
                    step="0.5"
                    placeholder="Optional (e.g. 102)"
                    value={newSymptom.severity_weight || ''}
                    onChange={(e) =>
                      setNewSymptom({
                        ...newSymptom,
                        severity_weight: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <span className="text-[10px] text-slate-500">Scale: 90 (baseline) to 108 (max)</span>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Frequency Weight (90-108)
                  </label>
                  <input
                    type="number"
                    min="90"
                    max="108"
                    step="0.5"
                    placeholder="Optional (e.g. 96)"
                    value={newSymptom.frequency_weight || ''}
                    onChange={(e) =>
                      setNewSymptom({
                        ...newSymptom,
                        frequency_weight: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <span className="text-[10px] text-slate-500">Scale: 90 (baseline) to 108 (max)</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSymptomModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Save Symptom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Custom Weights (90-108 Range) */}
      {editingSymptomWeights && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-left shadow-2xl border border-slate-200 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Backend ML Feature Weights
              </span>
              <h3 className="font-bold text-base text-slate-900 mt-1">
                Assign Weights: {editingSymptomWeights.symptom_name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure custom clinical severity and frequency values restricted to the <strong>90–108</strong> range.
              </p>
            </div>

            <form onSubmit={handleAssignWeights} className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-700">Custom Severity Weight (90-108):</label>
                  <span className="font-mono font-bold text-blue-800">{weightForm.severity_weight}</span>
                </div>
                <input
                  type="number"
                  min="90"
                  max="108"
                  step="0.5"
                  required
                  value={weightForm.severity_weight}
                  onChange={(e) =>
                    setWeightForm({ ...weightForm, severity_weight: parseFloat(e.target.value) || 90 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <span className="text-[10px] text-slate-500">
                  90 = 1.00x baseline, 99 = 1.75x moderate, 108 = 2.50x maximum severity multiplier
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-700">Custom Frequency Weight (90-108):</label>
                  <span className="font-mono font-bold text-blue-800">{weightForm.frequency_weight}</span>
                </div>
                <input
                  type="number"
                  min="90"
                  max="108"
                  step="0.5"
                  required
                  value={weightForm.frequency_weight}
                  onChange={(e) =>
                    setWeightForm({ ...weightForm, frequency_weight: parseFloat(e.target.value) || 90 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <span className="text-[10px] text-slate-500">
                  Reflects frequency of symptom episodes on the calibrated 90-108 scale
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-[11px] space-y-1">
                <div className="font-semibold text-blue-900">Computed Bayesian Influence:</div>
                <div>
                  Normalized score:{' '}
                  <strong>
                    {Math.round((((weightForm.severity_weight - 90) / 18) * 0.6 +
                      ((weightForm.frequency_weight - 90) / 18) * 0.4) *
                      100)}
                    %
                  </strong>
                </div>
                <div>
                  Feature weight multiplier:{' '}
                  <strong>
                    {(
                      1.0 +
                      (((weightForm.severity_weight - 90) / 18) * 0.6 +
                        ((weightForm.frequency_weight - 90) / 18) * 0.4) *
                        1.5
                    ).toFixed(2)}
                    x
                  </strong>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSymptomWeights(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Save 90-108 Weights
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Disease */}
      {showAddDiseaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl border border-slate-200 my-8 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Add Clinical Disease Profile</h3>
            <form onSubmit={handleCreateDisease} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Disease Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bronchitis"
                  value={newDisease.disease_name}
                  onChange={(e) => setNewDisease({ ...newDisease, disease_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Respiratory, Cardiovascular"
                  value={newDisease.category}
                  onChange={(e) => setNewDisease({ ...newDisease, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Clinical definition and presentation"
                  value={newDisease.description}
                  onChange={(e) => setNewDisease({ ...newDisease, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Symptoms (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cough, Fever, Fatigue, Shortness of breath"
                  value={newDisease.symptoms}
                  onChange={(e) => setNewDisease({ ...newDisease, symptoms: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Precautions (One per line)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Drink plenty of warm fluids&#10;Rest and avoid smoke exposure&#10;Use a humidifier"
                  value={newDisease.precautions}
                  onChange={(e) => setNewDisease({ ...newDisease, precautions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  When to seek medical attention
                </label>
                <input
                  type="text"
                  placeholder="e.g. If fever exceeds 102F or breathing difficulty occurs"
                  value={newDisease.when_to_seek_doctor}
                  onChange={(e) => setNewDisease({ ...newDisease, when_to_seek_doctor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDiseaseModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Add Disease
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
