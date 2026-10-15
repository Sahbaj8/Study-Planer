import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AvatarPicker } from '../common/AvatarPicker';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export const SignupForm = ({ onToggleLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://api.dicebear.com/7.x/bottts/svg?seed=AlexRivera');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { signUp } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, avatarUrl);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      showToast(error.message, 'error');
    } else {
      showToast('Account created successfully! Welcome to StudySync 🎉', 'success');
    }
  };

  return (
    <div className="w-full space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-white">Create Account</h2>
        <p className="text-xs text-slate-400">Join thousands of students studying together</p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
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
          <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
            Password (Min 6 chars)
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Avatar Picker */}
        <div className="pt-1">
          <AvatarPicker selectedAvatar={avatarUrl} onSelect={setAvatarUrl} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 transition transform active:scale-98 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <span>Creating account...</span>
          ) : (
            <>
              <span>Complete Sign Up</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={onToggleLogin}
            className="text-indigo-400 hover:text-indigo-300 font-bold"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
