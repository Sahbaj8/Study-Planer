import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Header } from './components/common/Header';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoomPage } from './pages/RoomPage';
import { ProfilePage } from './pages/ProfilePage';
import { SupabaseSetupPage } from './pages/SupabaseSetupPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const MainAppContent = () => {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard' | 'room' | 'profile' | 'setup'
  const [activeRoomId, setActiveRoomId] = useState(null);

  // Auto join/open room if room query parameter is present (e.g. ?room=STUDY-CS101)
  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      const roomCodeParam = params.get('room');
      if (roomCodeParam) {
        setActiveRoomId(roomCodeParam);
        setCurrentTab('room');
        showToast(`Joining room from invite link (${roomCodeParam})... 🚀`, 'info');
      }
    }
  }, [user, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <LoadingSpinner label="Initializing StudySync platform..." size="lg" />
      </div>
    );
  }

  // Protected Route: User must be authenticated
  if (!user) {
    return <AuthPage />;
  }

  const handleSelectRoom = (roomId) => {
    setActiveRoomId(roomId);
    setCurrentTab('room');
  };

  const handleLeaveRoom = () => {
    setActiveRoomId(null);
    setCurrentTab('dashboard');
    // Clear URL search params
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Navbar Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab !== 'room') setActiveRoomId(null);
          setCurrentTab(tab);
        }}
      />

      {/* Main Page Router */}
      <main className="flex-1">
        {currentTab === 'dashboard' && (
          <DashboardPage onSelectRoom={handleSelectRoom} />
        )}

        {currentTab === 'room' && activeRoomId && (
          <RoomPage roomId={activeRoomId} onLeaveRoom={handleLeaveRoom} />
        )}

        {currentTab === 'profile' && (
          <ProfilePage onBack={() => setCurrentTab('dashboard')} />
        )}

        {currentTab === 'setup' && <SupabaseSetupPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 StudySync Collaborative Student Platform. Powered by React & Supabase.</p>
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentTab('setup')} className="hover:text-slate-300">
              Database SQL & RLS
            </button>
            <button onClick={() => setCurrentTab('profile')} className="hover:text-slate-300">
              User Profile
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
