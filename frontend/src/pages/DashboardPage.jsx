import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoomData } from '../hooks/useRoomData';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { RoomCard } from '../components/dashboard/RoomCard';
import { CreateRoomModal } from '../components/dashboard/CreateRoomModal';
import { JoinRoomModal } from '../components/dashboard/JoinRoomModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Plus, KeyRound, Sparkles, Compass, BookOpen, Layers } from 'lucide-react';
import { MOCK_ROOMS } from '../lib/mockData';

export const DashboardPage = ({ onSelectRoom }) => {
  const { user, profile } = useAuth();
  const { fetchUserRooms, createRoom, joinRoomByCode, leaveRoom, loading } = useRoomData(user);

  const [myRooms, setMyRooms] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('joined'); // 'joined' | 'explore'

  const loadRooms = async () => {
    const rooms = await fetchUserRooms();
    setMyRooms(rooms);
  };

  useEffect(() => {
    loadRooms();
  }, [fetchUserRooms]);

  const handleCreateRoom = async (roomData) => {
    const newRoom = await createRoom(roomData);
    await loadRooms();
    if (newRoom?.id) {
      onSelectRoom(newRoom.id);
    }
  };

  const handleJoinRoom = async (code) => {
    const room = await joinRoomByCode(code);
    await loadRooms();
    if (room?.id) {
      onSelectRoom(room.id);
    }
    return room;
  };

  const handleLeaveRoom = async (roomId) => {
    await leaveRoom(roomId);
    await loadRooms();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ready for your next focus session?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create or join a study room to sync your Pomodoro timer, take live notes, and study with peers in real time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 z-10">
          <button
            onClick={() => setJoinModalOpen(true)}
            className="px-5 py-3 rounded-2xl glass-card hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-2"
          >
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <span>Join with Code</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition transform active:scale-95 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Study Room</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics Overview */}
      <StatsOverview joinedCount={myRooms.length} />

      {/* Rooms Navigation & List */}
      <div className="space-y-4">
        
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('joined')}
              className={`text-base font-bold flex items-center space-x-2 pb-1 border-b-2 transition ${
                activeTab === 'joined'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>My Study Rooms ({myRooms.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className={`text-base font-bold flex items-center space-x-2 pb-1 border-b-2 transition ${
                activeTab === 'explore'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Discover Public Rooms</span>
            </button>
          </div>
        </div>

        {/* Content Display */}
        {loading ? (
          <LoadingSpinner label="Fetching your study rooms..." />
        ) : activeTab === 'joined' ? (
          myRooms.length === 0 ? (
            /* Empty State */
            <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-slate-800">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Joined Rooms Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You haven't created or joined any study rooms yet. Start a new session or join an existing group using a room code!
              </p>
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg"
                >
                  Create First Room
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-5 py-2.5 rounded-xl glass-card text-slate-300 font-bold text-xs"
                >
                  Explore Public Rooms
                </button>
              </div>
            </div>
          ) : (
            /* Grid of Joined Rooms */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onSelectRoom={onSelectRoom}
                  onLeaveRoom={handleLeaveRoom}
                  isCreator={room.creator_id === user?.id}
                />
              ))}
            </div>
          )
        ) : (
          /* Grid of Public / Discover Rooms */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_ROOMS.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSelectRoom={(id) => handleJoinRoom(room.code)}
                isCreator={false}
              />
            ))}
          </div>
        )}

      </div>

      {/* Modals */}
      <CreateRoomModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />

      <JoinRoomModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onJoinRoom={handleJoinRoom}
      />

    </div>
  );
};
