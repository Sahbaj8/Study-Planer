-- ==========================================
-- Supabase Schema for Collaborative Student Study Platform
-- ==========================================

-- Enable UUID extension if not enabled
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
    focus_duration INTEGER DEFAULT 25, -- in minutes
    break_duration INTEGER DEFAULT 5,  -- in minutes
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

-- 4. NOTES TABLE (Shared notes for each room)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    content TEXT DEFAULT '',
    last_updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MESSAGES TABLE (Room Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TIMER SESSIONS TABLE (Synchronized Pomodoro Timer)
CREATE TABLE IF NOT EXISTS public.timer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    mode VARCHAR(10) DEFAULT 'focus' CHECK (mode IN ('focus', 'break')),
    is_running BOOLEAN DEFAULT FALSE,
    duration_seconds INTEGER DEFAULT 1500, -- 25 mins * 60
    started_at TIMESTAMP WITH TIME ZONE,
    time_remaining INTEGER DEFAULT 1500,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR FAST SEARCH
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(code);
CREATE INDEX IF NOT EXISTS idx_room_members_room ON public.room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user ON public.room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON public.messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_room ON public.notes(room_id);
CREATE INDEX IF NOT EXISTS idx_timer_room ON public.timer_sessions(room_id);

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

-- Drop trigger if exists and recreate
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

-- Helper function to check room membership
CREATE OR REPLACE FUNCTION public.is_room_member(check_room_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.room_members 
        WHERE room_id = check_room_id AND user_id = check_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" 
    ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Rooms Policies
CREATE POLICY "Rooms viewable by all authenticated users" 
    ON public.rooms FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create rooms" 
    ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Room creator can update room" 
    ON public.rooms FOR UPDATE TO authenticated USING (auth.uid() = creator_id);

CREATE POLICY "Room creator can delete room" 
    ON public.rooms FOR DELETE TO authenticated USING (auth.uid() = creator_id);

-- Room Members Policies
CREATE POLICY "Room members viewable by authenticated users" 
    ON public.room_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can join rooms" 
    ON public.room_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms or creator can remove" 
    ON public.room_members FOR DELETE TO authenticated USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND creator_id = auth.uid())
    );

-- Notes Policies
CREATE POLICY "Members can view room notes" 
    ON public.notes FOR SELECT TO authenticated USING (public.is_room_member(room_id, auth.uid()));

CREATE POLICY "Members can update room notes" 
    ON public.notes FOR UPDATE TO authenticated USING (public.is_room_member(room_id, auth.uid()));

CREATE POLICY "Members can insert room notes" 
    ON public.notes FOR INSERT TO authenticated WITH CHECK (public.is_room_member(room_id, auth.uid()));

-- Messages Policies
CREATE POLICY "Members can view room messages" 
    ON public.messages FOR SELECT TO authenticated USING (public.is_room_member(room_id, auth.uid()));

CREATE POLICY "Members can post room messages" 
    ON public.messages FOR INSERT TO authenticated WITH CHECK (
        public.is_room_member(room_id, auth.uid()) AND auth.uid() = user_id
    );

-- Timer Sessions Policies
CREATE POLICY "Members can view room timer" 
    ON public.timer_sessions FOR SELECT TO authenticated USING (public.is_room_member(room_id, auth.uid()));

CREATE POLICY "Members can update room timer" 
    ON public.timer_sessions FOR UPDATE TO authenticated USING (public.is_room_member(room_id, auth.uid()));

CREATE POLICY "Members can insert room timer" 
    ON public.timer_sessions FOR INSERT TO authenticated WITH CHECK (public.is_room_member(room_id, auth.uid()));

-- PUBLICATION FOR REALTIME SYNCHRONIZATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.timer_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
