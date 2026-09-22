import { Activity, AlertCircle, CheckCircle, KeyRound, Lock, Mail, ShieldAlert, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { api } from '../services/api.js';
import { User } from '../types/index.js';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoType: 'patient' | 'admin') => {
    if (demoType === 'patient') {
      setEmail('john.doe@example.com');
      setPassword('password123');
    } else {
      setEmail('admin@healthai.org');
      setPassword('admin123');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 text-left">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-600/20">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Login</h2>
          <p className="text-xs text-slate-500">
            Access your AI disease predictions, personal records, and health insights.
          </p>
        </div>

        {/* Demo Fast Fillers */}
        <div className="mb-6 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>1-Click Demo Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="demo-patient-btn"
              type="button"
              onClick={() => handleDemoLogin('patient')}
              className="px-2.5 py-1.5 bg-white border border-blue-300 hover:bg-blue-100/50 rounded-lg text-xs font-semibold text-blue-800 transition-colors text-center"
            >
              Patient Demo
              <span className="block text-[10px] text-slate-500 font-normal">john.doe@example.com</span>
            </button>

            <button
              id="demo-admin-btn"
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="px-2.5 py-1.5 bg-white border border-blue-300 hover:bg-blue-100/50 rounded-lg text-xs font-semibold text-blue-800 transition-colors text-center"
            >
              Admin Master
              <span className="block text-[10px] text-slate-500 font-normal">admin@healthai.org</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="login-email">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="login-email"
                type="text"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="login-password">
                Password
              </label>
              <button
                id="login-forgot-pass-btn"
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/25 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
          Don't have an account yet?{' '}
          <button
            id="login-to-reg-btn"
            type="button"
            onClick={() => onNavigate('register')}
            className="text-blue-600 hover:text-blue-700 font-semibold underline"
          >
            Register as a patient
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-left shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Password Recovery</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered email address to receive password reset instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password reset token generated! (For testing, use default demo passwords password123 / admin123).</span>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSuccess(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              {!forgotSuccess && (
                <button
                  onClick={() => {
                    if (forgotEmail) setForgotSuccess(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                >
                  Send Reset Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
