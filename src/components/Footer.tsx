import { Activity, AlertTriangle, ExternalLink, HeartPulse, ShieldCheck } from 'lucide-react';
import React from 'react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Comprehensive Medical Disclaimer Box */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 mb-10 text-xs leading-relaxed text-slate-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-300 uppercase tracking-wider text-[11px] mb-1">
                Strict Medical Disclaimer & Educational Notice
              </h4>
              <p className="text-slate-300">
                The <strong>AI Disease Prediction System</strong> is developed strictly for{' '}
                <span className="text-white font-medium">educational and academic research demonstrations</span>. All statistical probabilities, disease associations, and recommendations are derived using probabilistic pattern matching algorithms (Naive Bayes, Decision Trees, and feature vector classification).{' '}
                <strong>This application does not provide a definitive medical diagnosis, clinical prognosis, or direct treatment regimen.</strong>
              </p>
              <p className="mt-2 text-slate-400">
                Never disregard professional medical advice or delay seeking clinical attention because of information provided by this system. If you or someone you know is experiencing severe shortness of breath, sudden chest pressure, uncontrollable bleeding, loss of consciousness, or other severe acute symptoms, please dial <strong>100 or 102 (Emergency & Ambulance Dispatch)</strong> or proceed to the nearest emergency room immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand & Domain */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500 text-slate-950 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">AI Disease Prediction</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              An intelligent machine-learning healthcare assistant bridging symptom assessment with educational medical insights and precautionary guidance.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Domain: Healthcare + AI + ML</span>
            </div>
          </div>

          {/* Col 2: Core Platform Links */}
          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">System Features</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  id="footer-link-checker"
                  onClick={() => onNavigate('checker')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Symptom Selection Engine
                </button>
              </li>
              <li>
                <button
                  id="footer-link-diseases"
                  onClick={() => onNavigate('diseases')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Medical Conditions Directory
                </button>
              </li>
              <li>
                <button
                  id="footer-link-history"
                  onClick={() => onNavigate('history')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Prediction History Audit
                </button>
              </li>
              <li>
                <button
                  id="footer-link-ml"
                  onClick={() => onNavigate('ml-evaluation')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Machine Learning Model Metrics
                </button>
              </li>
              <li>
                <button
                  id="footer-link-findcare"
                  onClick={() => onNavigate('find-care')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Locate Healthcare Facilities
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: ML Model Specs */}
          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">ML Architecture</h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Feature Vector: One-hot binary indicator</li>
              <li>• Classifier: Bernoulli & Multinomial Naive Bayes</li>
              <li>• Smoothing: Calibrated Laplace Smoothing (α=1.0)</li>
              <li>• Output: Calibrated Softmax class probabilities</li>
              <li>• Benchmark Comparison: Decision Tree, RF, LogReg</li>
              <li>• Security: PBKDF2 Password Salt Hashing</li>
            </ul>
          </div>

          {/* Col 4: Urgent Assistance */}
          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Emergency Resources</h5>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
                <span className="text-rose-400 font-bold block">Emergency & Ambulance</span>
                <span className="text-white text-sm font-extrabold tracking-wide">Dial 100 / 102</span>
              </div>
              <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
                <span className="text-amber-400 font-medium block">Poison Control Center</span>
                <span className="text-white text-xs font-semibold">1-800-222-1222</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} AI Disease Prediction System. Built for academic & educational purposes.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> Healthcare Technology Innovation
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
