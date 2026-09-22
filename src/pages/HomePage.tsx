import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Database,
  FileText,
  HeartHandshake,
  Lock,
  MapPin,
  Microscope,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users
} from 'lucide-react';
import React from 'react';
import { User } from '../types/index.js';

interface HomePageProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ currentUser, onNavigate }) => {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50 to-white pt-12 pb-16 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold tracking-wide border border-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Machine Learning & Healthcare Informatics</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Intelligent Disease Risk Prediction Powered by{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Machine Learning
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                Analyze symptoms through mathematical feature-vector classification. Get probabilistic condition predictions, tailored precautions, and structured guidance—engineered for educational and clinical informatics awareness.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="hero-start-prediction-btn"
                  onClick={() => onNavigate('checker')}
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-md shadow-blue-600/25 flex items-center gap-2.5 transition-all hover:translate-y-[-1px]"
                >
                  <Stethoscope className="w-5 h-5" />
                  Start Prediction
                  <ArrowRight className="w-4 h-4" />
                </button>

                {!currentUser ? (
                  <>
                    <button
                      id="hero-login-btn"
                      onClick={() => onNavigate('login')}
                      className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-300 shadow-sm transition-colors"
                    >
                      Login
                    </button>
                    <button
                      id="hero-register-btn"
                      onClick={() => onNavigate('register')}
                      className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-colors"
                    >
                      Create Account
                    </button>
                  </>
                ) : (
                  <button
                    id="hero-dashboard-btn"
                    onClick={() => onNavigate('dashboard')}
                    className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-blue-800 font-semibold text-sm border border-blue-300 shadow-sm transition-colors flex items-center gap-2"
                  >
                    <span>Go to Patient Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </button>
                )}
              </div>

              {/* Trust & Academic Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg">
                <div>
                  <div className="text-xl font-extrabold text-slate-900">30+</div>
                  <div className="text-xs text-slate-500 font-medium">Recognized Symptoms</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-blue-700">91.8%</div>
                  <div className="text-xs text-slate-500 font-medium">Dataset Test Accuracy</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">18+</div>
                  <div className="text-xs text-slate-500 font-medium">Clinical Conditions</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Mock Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 relative">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-400 pl-2">Prediction Engine Live</span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Naive Bayes α=1.0
                  </span>
                </div>

                <div className="space-y-4 text-left">
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                      Selected Symptoms Matrix
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['Fever', 'Cough', 'Fatigue', 'Chills'].map((sym) => (
                        <span
                          key={sym}
                          className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium rounded-md flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Predicted Possible Condition:</span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                        88.4% Confidence
                      </span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">Influenza (Flu)</div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '88.4%' }} />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Acute viral respiratory presentation with typical sudden onset febrile curve and systemic muscle aches.
                    </p>
                  </div>

                  <div className="text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Educational simulation only. Predictions must never supersede a qualified physician's evaluation.
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate('checker')}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide transition-colors"
                  >
                    Test Your Symptoms Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How the System Works (4 Step Flow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            Machine Learning Workflow
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How The AI Prediction Pipeline Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            A transparent 4-stage machine-learning pipeline converting raw patient observations into structured clinical guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {/* Step 1 */}
          <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-sm relative space-y-3 hover:border-blue-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900">Symptom Selection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Users search and select from categorized clinical symptoms (e.g. fever, headache, cough, shortness of breath).
            </p>
            <div className="text-[11px] font-mono text-blue-800 bg-slate-50 p-2 rounded border border-slate-200">
              Input: [Fever, Cough, Chills]
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-sm relative space-y-3 hover:border-blue-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900">One-Hot Vector Encoding</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Symptoms are mathematically encoded into a binary feature vector mapping presence (1) or absence (0) across the 30-feature vocabulary.
            </p>
            <div className="text-[11px] font-mono text-blue-800 bg-slate-50 p-2 rounded border border-slate-200">
              Vector: [1, 1, 0, 0, 1, 0, ...]
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-sm relative space-y-3 hover:border-blue-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900">Model Probability Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The trained Bernoulli Naive Bayes classifier computes conditional class likelihoods and applies Laplace smoothing with temperature-scaled Softmax.
            </p>
            <div className="text-[11px] font-mono text-blue-800 bg-slate-50 p-2 rounded border border-slate-200">
              P(C|X) ∝ P(C)·∏ P(xᵢ|C)
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-sm relative space-y-3 hover:border-blue-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900">Results & Precautions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Presents the predicted disease, matching symptoms, confidence rating, general precautions, and explicit next steps to seek healthcare.
            </p>
            <div className="text-[11px] font-mono text-blue-800 bg-slate-50 p-2 rounded border border-slate-200">
              Output: Condition + Guidance
            </div>
          </div>
        </div>
      </section>

      {/* Core Highlights & User Types */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                Multi-User Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Designed for Patients, Researchers, and Administrators
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Whether you are an individual tracking personal symptom history or an administrator managing disease databases and monitoring predictive statistics, our platform provides tailored workspaces.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <Users className="w-4 h-4" /> Patient Experience
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• Intuitive symptom selection</li>
                    <li>• Instant ML prediction cards</li>
                    <li>• Historical assessment audit</li>
                    <li>• Emergency provider locator</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" /> Administrator Suite
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• Real-time system analytics</li>
                    <li>• Disease & symptom CRUD</li>
                    <li>• User management</li>
                    <li>• Prediction record logs</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 text-left space-y-2">
                <Brain className="w-6 h-6 text-blue-400" />
                <h4 className="font-bold text-sm text-white">ML Benchmark Evaluation</h4>
                <p className="text-xs text-slate-400">
                  Compare performance against Naive Bayes, Decision Trees, and Logistic Regression with interactive Confusion Matrix.
                </p>
                <button
                  onClick={() => onNavigate('ml-evaluation')}
                  className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1 pt-1"
                >
                  View ML Metrics <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 text-left space-y-2">
                <Database className="w-6 h-6 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">Curated Disease Library</h4>
                <p className="text-xs text-slate-400">
                  Browse comprehensive condition profiles, known symptom markers, precautions, and warning thresholds.
                </p>
                <button
                  onClick={() => onNavigate('diseases')}
                  className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1 pt-1"
                >
                  Browse Diseases <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 text-left space-y-2">
                <Lock className="w-6 h-6 text-indigo-400" />
                <h4 className="font-bold text-sm text-white">Secure Data Architecture</h4>
                <p className="text-xs text-slate-400">
                  PBKDF2 salted password hashing, authenticated session tokens, and strict authorization bounds.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 text-left space-y-2">
                <MapPin className="w-6 h-6 text-rose-400" />
                <h4 className="font-bold text-sm text-white">Healthcare Facilities</h4>
                <p className="text-xs text-slate-400">
                  Quickly locate nearby emergency rooms, walk-in urgent care centers, and certified telehealth hotlines.
                </p>
                <button
                  onClick={() => onNavigate('find-care')}
                  className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1 pt-1"
                >
                  Locate Clinics <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Educational & Medical Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300/80 shadow-sm text-left">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-700" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-amber-950">
                Medical Disclaimer: Not a Substitute for Professional Medical Diagnosis
              </h3>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                The <strong>AI Disease Prediction System</strong> is created exclusively as an educational and research project in computer science and healthcare informatics. The system calculates mathematical probability based on symptom patterns. <strong>It cannot diagnose illnesses, prescribe medication, or formulate treatment plans.</strong>
              </p>
              <p className="text-xs text-amber-800 font-medium">
                If you suspect a medical condition, always consult a licensed doctor, nurse practitioner, or certified healthcare provider. In a life-threatening crisis, dial emergency dispatch (100 / 102) immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="py-10 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white space-y-4 shadow-lg">
          <h3 className="text-2xl font-bold">Ready to check your symptoms?</h3>
          <p className="text-sm text-blue-50 max-w-xl mx-auto">
            Experience the machine-learning disease prediction module now with instant probability results and precautions.
          </p>
          <button
            id="cta-start-prediction-btn"
            onClick={() => onNavigate('checker')}
            className="px-6 py-3 bg-white text-blue-800 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-md transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4 text-blue-600" />
            Launch Symptom Checker
          </button>
        </div>
      </section>
    </div>
  );
};
