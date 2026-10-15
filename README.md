# 📚 StudySync - Collaborative Student Study Platform

A modern, production-ready **Collaborative Student Study Platform** built using **React.js**, **Vite**, **Tailwind CSS**, and **Supabase**.

---

## 🌟 Key Features

1. **Authentication**
   - Email & Password signup and login via Supabase Auth
   - User profile with name & avatar picker (DiceBear bottts / custom image URL)
   - Password reset & protected routes
   - Out-of-the-box Quick Demo login option

2. **Study Rooms**
   - Create study rooms with custom focus & break durations (e.g., 25m/5m, 50m/10m)
   - Join rooms instantly via unique 6-character room codes (e.g. `STUDY-8X9K`)
   - Leave rooms & view room members
   - Display joined & recent rooms on the dashboard

3. **Shared Pomodoro Timer**
   - Default 25-minute focus and 5-minute break sessions
   - Controls: Start, Pause, Resume, Reset, and Skip
   - **Real-time synchronization** across all room participants using server/database timestamps (`started_at`, `duration_seconds`) to prevent drift
   - Audio completion alerts (Web Audio API synth chimes) & confetti celebration effect upon focus milestone

4. **Collaborative Notes**
   - Real-time shared Markdown notes for every study room
   - Multiple users can edit simultaneously
   - Auto-save with debounced persistence to Supabase
   - Markdown formatting toolbar (Bold, Italic, Header, Bullet list, Code snippet) & Live Preview mode
   - Preserves notes when users leave and rejoin
   - Copy to clipboard & export as `.md` file

5. **Real-Time Room Chat**
   - Room-based instant chat powered by Supabase Realtime
   - Username, avatar, and relative timestamp display (`date-fns`)
   - Quick emoji reaction shortcuts (`👍`, `🚀`, `💡`, `☕`, `🧠`)
   - Auto-scroll to latest messages

6. **Live Participants & Presence**
   - Shows all active participants inside the study room in real time
   - Online/offline indicator using Supabase Realtime Presence (`channel.track()`)
   - Host badge & current user study mode ("🎯 Focusing" / "☕ Taking a break")

7. **Dashboard & Ambient Audio**
   - Quick Statistics (Focus hours logged, joined rooms, active streak, notes count)
   - Built-in Web Audio Ambience generator (Rain, Pink Noise, Forest sound profiles with volume control)
   - Interactive Supabase SQL & RLS Setup page inside the app

8. **Database & Security**
   - Supabase PostgreSQL tables: `profiles`, `rooms`, `room_members`, `notes`, `messages`, `timer_sessions`
   - Row Level Security (RLS) policies for strict room-based access control
   - Automated profile creation triggers on user signup

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 2. Run Locally

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🛠️ Supabase Database & RLS Setup

1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Run the complete SQL script provided in `supabase-schema.sql` (or view it inside the app under the **Supabase Setup** tab).
4. Copy your **Project URL** and **Anon API Key** from **Project Settings -> API**.
5. Update `frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

---

## 📂 Project Structure

```
student management/
├── supabase-schema.sql         # Supabase PostgreSQL tables, triggers & RLS policies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # LoginForm, SignupForm, ResetPasswordModal
│   │   │   ├── common/         # Header, AmbientPlayer, AvatarPicker, Modal, Spinner
│   │   │   ├── dashboard/      # StatsOverview, RoomCard, CreateRoomModal, JoinRoomModal
│   │   │   └── room/           # RoomHeader, PomodoroTimer, CollaborativeNotes, LiveParticipants, RealTimeChat
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # Supabase Auth state & Demo fallback
│   │   │   └── ToastContext.jsx# Global Toast notifications
│   │   ├── hooks/
│   │   │   ├── useRoomData.js          # Room creation & joining logic
│   │   │   ├── useSharedTimer.js       # Real-time Pomodoro timer hook
│   │   │   ├── useCollaborativeNotes.js# Debounced real-time notes hook
│   │   │   ├── useRealtimeChat.js      # Room chat messaging hook
│   │   │   └── useRealtimePresence.js  # Online presence tracking hook
│   │   ├── lib/
│   │   │   ├── supabaseClient.js       # Supabase JS client
│   │   │   ├── soundEffects.js         # Web Audio API chime & ambient sound generator
│   │   │   └── mockData.js             # Initial fallback dataset
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx            # Landing / Auth screen
│   │   │   ├── DashboardPage.jsx       # Student Dashboard
│   │   │   ├── RoomPage.jsx            # Active Study Room view
│   │   │   ├── ProfilePage.jsx         # User profile manager
│   │   │   └── SupabaseSetupPage.jsx   # Interactive SQL schema & setup guide
│   │   ├── App.jsx
│   │   └── index.css                   # Tailwind CSS v4 & glassmorphism theme
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
```
"# Study-Planer" 
