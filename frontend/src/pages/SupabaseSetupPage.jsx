import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Database, Copy, Check, ShieldCheck, Zap, Terminal, ExternalLink } from 'lucide-react';

const SQL_SCHEMA_CONTENT = `-- ==========================================
-- Supabase Schema for Collaborative Student Study Platform
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/bottts/svg?seed=student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(12) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    focus_duration INTEGER DEFAULT 25,
    break_duration INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ROOM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role VARCHAR(20) DEFAULT 'member',
    UNIQUE (room_id, user_id)
);

-- 4. NOTES TABLE
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    content TEXT DEFAULT '',
    last_updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TIMER SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.timer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    mode VARCHAR(10) DEFAULT 'focus' CHECK (mode IN ('focus', 'break')),
    is_running BOOLEAN DEFAULT FALSE,
    duration_seconds INTEGER DEFAULT 1500,
    started_at TIMESTAMP WITH TIME ZONE,
    time_remaining INTEGER DEFAULT 1500,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR FAST SEARCH
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(code);
CREATE INDEX IF NOT EXISTS idx_room_members_room ON public.room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON public.messages(room_id, created_at DESC);

-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_room_member(check_room_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.room_members 
        WHERE room_id = check_room_id AND user_id = check_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Public profiles are viewable by authenticated users" 
    ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Rooms viewable by all authenticated users" 
    ON public.rooms FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create rooms" 
    ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Room members viewable by authenticated users" 
    ON public.room_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can join rooms" 
    ON public.room_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can view room notes" 
    ON public.notes FOR SELECT TO authenticated USING (public.is_room_member(room_id, auth.uid()));

CREATE POLICY "Members can update room notes" 
    ON public.notes FOR UPDATE TO authenticated USING (public.is_room_member(room_id, auth.uid()));

CREATE POLICY "Members can view room messages" 
    ON public.messages FOR SELECT TO authenticated USING (public.is_room_member(room_id, auth.uid()));

CREATE POLICY "Members can post room messages" 
    ON public.messages FOR INSERT TO authenticated WITH CHECK (
        public.is_room_member(room_id, auth.uid()) AND auth.uid() = user_id
    );

CREATE POLICY "Members can view room timer" 
    ON public.timer_sessions FOR SELECT TO authenticated USING (public.is_room_member(room_id, auth.uid()));

CREATE POLICY "Members can update room timer" 
    ON public.timer_sessions FOR UPDATE TO authenticated USING (public.is_room_member(room_id, auth.uid()));

-- ENABLE REALTIME REPLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.timer_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
`;

export const SupabaseSetupPage = () => {
  const { isConfigured } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CONTENT);
    setCopied(true);
    showToast('SQL Schema copied to clipboard! 📋', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <Database className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black text-white">Supabase Setup & SQL Schema</h1>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Follow the quick 3-step guide below to connect your Supabase database instance and enable full Realtime synchronization and Row Level Security (RLS).
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className={`w-3.5 h-3.5 rounded-full ${isConfigured ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
          <div>
            <p className="text-xs font-bold text-white">
              {isConfigured ? 'Connected to Supabase' : 'Running in Demo Mode'}
            </p>
            <p className="text-[11px] text-slate-400">
              {isConfigured ? 'Live PostgreSQL & Realtime active' : 'Add env keys to connect your database'}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Step Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="text-sm font-bold text-white">Create Supabase Project</h3>
          <p className="text-xs text-slate-400">
            Sign up at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center space-x-1"><span>supabase.com</span> <ExternalLink className="w-3 h-3" /></a> and create a new project.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="text-sm font-bold text-white">Run SQL Schema</h3>
          <p className="text-xs text-slate-400">
            Open the <strong>SQL Editor</strong> in your Supabase Dashboard, paste the schema below, and click <strong>Run</strong>.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="text-sm font-bold text-white">Set Environment Variables</h3>
          <p className="text-xs text-slate-400">
            Copy Project URL & Anon Key from Settings -&gt; API and save into <code className="text-indigo-300 font-mono">frontend/.env</code>.
          </p>
        </div>
      </div>

      {/* SQL Script Block */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">PostgreSQL Schema & RLS Script</h3>
          </div>
          <button
            onClick={handleCopySql}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
          </button>
        </div>

        <div className="relative max-h-96 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <pre className="text-xs font-mono text-slate-300 whitespace-pre leading-relaxed">
            {SQL_SCHEMA_CONTENT}
          </pre>
        </div>
      </div>

    </div>
  );
};
