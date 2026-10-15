import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { ResetPasswordModal } from '../components/auth/ResetPasswordModal';
import { BookOpen, Users, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center z-10">
        
        {/* Left Hero Pitch */}
        <div className="space-y-6 text-left hidden md:block">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Real-time Collaborative Student Platform</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Study Together, <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Achieve Together.
            </span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Synchronized Pomodoro focus timers, live collaborative notes, instant room chat, and participant presence powered by React and Supabase.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Clock className="w-4 h-4" />
              </div>
              <span>Real-time server-timestamp Pomodoro synchronization</span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>Auto-saving collaborative markdown notes</span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Users className="w-4 h-4" />
              </div>
              <span>Live room chat & participant online presence</span>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
          {isSignup ? (
            <SignupForm onToggleLogin={() => setIsSignup(false)} />
          ) : (
            <LoginForm
              onToggleSignup={() => setIsSignup(true)}
              onOpenReset={() => setResetModalOpen(true)}
            />
          )}
        </div>

      </div>

      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
      />
    </div>
  );
};
