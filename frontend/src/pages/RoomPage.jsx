import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoomData } from '../hooks/useRoomData';
import { useSharedTimer } from '../hooks/useSharedTimer';
import { useCollaborativeNotes } from '../hooks/useCollaborativeNotes';
import { useRealtimeChat } from '../hooks/useRealtimeChat';
import { useRealtimePresence } from '../hooks/useRealtimePresence';
import { RoomHeader } from '../components/room/RoomHeader';
import { LiveVideoCall } from '../components/room/LiveVideoCall';
import { PomodoroTimer } from '../components/room/PomodoroTimer';
import { CollaborativeNotes } from '../components/room/CollaborativeNotes';
import { LiveParticipants } from '../components/room/LiveParticipants';
import { RealTimeChat } from '../components/room/RealTimeChat';
import { InviteModal } from '../components/room/InviteModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const RoomPage = ({ roomId, onLeaveRoom }) => {
  const { user } = useAuth();
  const { fetchRoomDetails } = useRoomData(user);
  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Load room details
  useEffect(() => {
    const init = async () => {
      if (roomId) {
        const data = await fetchRoomDetails(roomId);
        setRoom(data);
      }
      setLoadingRoom(false);
    };
    init();
  }, [roomId, fetchRoomDetails]);

  // Hook 1: Real-time Synchronized Pomodoro Timer
  const timer = useSharedTimer(
    roomId,
    room?.focus_duration || 25,
    room?.break_duration || 5
  );

  // Hook 2: Real-time Collaborative Notes
  const notes = useCollaborativeNotes(roomId, user);

  // Hook 3: Real-time Chat
  const chat = useRealtimeChat(roomId, user);

  // Hook 4: Real-time Presence
  const presence = useRealtimePresence(roomId, user, timer.mode);

  if (loadingRoom) {
    return <LoadingSpinner label="Loading Study Room..." size="lg" />;
  }

  if (!room) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-panel text-center rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white">Room Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested study room could not be loaded or you may not be a member.
        </p>
        <button
          onClick={onLeaveRoom}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      
      {/* Room Header */}
      <RoomHeader
        room={room}
        onLeave={onLeaveRoom}
        onOpenInvite={() => setInviteModalOpen(true)}
        isHost={room.creator_id === user?.id}
      />

      {/* Live Video Call Conference Bar */}
      <LiveVideoCall
        user={user}
        onlineParticipants={presence.onlineParticipants}
      />

      {/* Main Room Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide on Desktop): Pomodoro Timer & Shared Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Synchronized Pomodoro Timer */}
          <PomodoroTimer
            mode={timer.mode}
            isRunning={timer.isRunning}
            durationSeconds={timer.durationSeconds}
            secondsRemaining={timer.secondsRemaining}
            startTimer={timer.startTimer}
            pauseTimer={timer.pauseTimer}
            resetTimer={timer.resetTimer}
            skipSession={timer.skipSession}
          />

          {/* Collaborative Notes */}
          <CollaborativeNotes
            content={notes.content}
            updateContent={notes.updateContent}
            lastUpdatedBy={notes.lastUpdatedBy}
            updatedAt={notes.updatedAt}
            saving={notes.saving}
            loading={notes.loading}
          />
        </div>

        {/* Right Column (1 Col wide on Desktop): Participants & Real-time Chat */}
        <div className="space-y-6">
          {/* Live Online Participants */}
          <LiveParticipants
            onlineParticipants={presence.onlineParticipants}
            allRoomMembers={room.members || []}
            hostId={room.creator_id}
          />

          {/* Room Real-Time Chat */}
          <RealTimeChat
            messages={chat.messages}
            sendMessage={chat.sendMessage}
            sending={chat.sending}
            chatEndRef={chat.chatEndRef}
            currentUserId={user?.id}
          />
        </div>

      </div>

      {/* Invite Friends Modal */}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        room={room}
      />

    </div>
  );
};
