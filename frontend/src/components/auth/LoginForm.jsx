import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const LoginForm = ({ onToggleSignup, onOpenReset }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      showToast(error.message, 'error');
    } else {
      showToast('Welcome back to StudySync! 🚀', 'success');
    }
  };

  const handleDemoLogin = async () => {
    setEmail('alex.student@studyhive.io');
    setPassword('demo123456');
    setLoading(true);
    await login('alex.student@studyhive.io', 'demo123456');
    setLoading(false);
    showToast('Logged in with Demo Account! ✨', 'success');
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
        <p className="text-xs text-slate-400">
          Sign in to access your collaborative study rooms and timers
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={onOpenReset}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 transition transform active:scale-98 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Quick Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 px-4 rounded-xl glass-card border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-500/20 transition flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Quick Demo Student Login</span>
        </button>
      </div>

      <div className="text-center pt-2 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={onToggleSignup}
            className="text-indigo-400 hover:text-indigo-300 font-bold"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};
