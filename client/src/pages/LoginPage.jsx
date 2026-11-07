import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Lock, Mail, ArrowRight, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    try {
      setLoading(true);
      setError(null);
      setEmail(demoEmail);
      setPassword(demoPassword);
      await login(demoEmail, demoPassword);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-brand-900/30">
            <Scale className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to LexiMem
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          AI Contract Lifecycle & Precedent Intelligence Agent
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card sm:rounded-2xl sm:px-10 border border-slate-200/80 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4 text-xs" onSubmit={handleSubmit}>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Corporate Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign in to Platform'}
            </button>
          </form>

          {/* Quick Demo Login Personas */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
              One-Click Demonstration Logins
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('lawyer@leximem.com', 'LexiMemLawyer2026!')}
                className="w-full p-2.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg text-left text-xs flex items-center justify-between text-brand-900 font-medium transition-colors"
              >
                <div>
                  <div className="font-bold">David Sterling, Esq. (Legal Counsel)</div>
                  <div className="text-[10px] text-brand-700">Can approve precedents, negotiate, & sign-off</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-brand-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@leximem.com', 'LexiMemAdmin2026!')}
                className="w-full p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left text-xs flex items-center justify-between text-purple-900 font-medium transition-colors"
              >
                <div>
                  <div className="font-bold">Victoria Vance (Administrator)</div>
                  <div className="text-[10px] text-purple-700">Full system access, policies, and audit logs</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('employee@leximem.com', 'LexiMemEmployee2026!')}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-xs flex items-center justify-between text-slate-800 font-medium transition-colors"
              >
                <div>
                  <div className="font-bold">Marcus Chen (Business User)</div>
                  <div className="text-[10px] text-slate-500">Submit agreements, view assigned obligations</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
