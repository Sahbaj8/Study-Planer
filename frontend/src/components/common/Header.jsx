import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AmbientPlayer } from './AmbientPlayer';
import { LogOut, User as UserIcon, Database, Sparkles, BookOpen, Layers } from 'lucide-react';

export const Header = ({ currentTab, setCurrentTab }) => {
  const { profile, logout, isConfigured } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Connection Badge */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                StudySync
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2.0
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[11px] font-medium">
                {isConfigured ? 'Supabase Connected' : 'Demo / Setup Mode'}
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1 glass-card px-2 py-1 rounded-2xl">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('setup')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
              currentTab === 'setup'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Supabase Setup</span>
          </button>
        </nav>

        {/* Right Tools & User Profile */}
        <div className="flex items-center space-x-3">
          <AmbientPlayer />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-2xl glass-card-hover border border-slate-800 focus:outline-none"
            >
              <img
                src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=student'}
                alt={profile?.full_name || 'User'}
                className="w-8 h-8 rounded-xl bg-slate-800 object-cover border border-slate-700"
              />
              <span className="hidden sm:inline text-xs font-bold text-slate-200 max-w-[120px] truncate">
                {profile?.full_name || 'Student'}
              </span>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 p-2 rounded-2xl glass-panel shadow-2xl border border-slate-800 z-50 space-y-1"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800/80">
                  <p className="text-xs font-bold text-slate-200 truncate">{profile?.full_name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{profile?.email || 'student@studyhive.io'}</p>
                </div>

                <button
                  onClick={() => {
                    setCurrentTab('profile');
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5 font-medium transition"
                >
                  <UserIcon className="w-4 h-4 text-indigo-400" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('setup');
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5 font-medium transition"
                >
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>SQL & RLS Setup</span>
                </button>

                <div className="border-t border-slate-800/80 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 font-medium transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
