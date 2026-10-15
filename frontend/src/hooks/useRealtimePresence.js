import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const useRealtimePresence = (roomId, user, timerMode = 'focus') => {
  const [onlineParticipants, setOnlineParticipants] = useState([]);

  useEffect(() => {
    if (!roomId || !user) return;

    const currentUserState = {
      user_id: user.id,
      full_name: user.full_name || user.email?.split('@')[0] || 'Student',
      avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
      online_at: new Date().toISOString(),
      current_status: timerMode === 'focus' ? '🎯 Focusing' : '☕ Taking a break'
    };

    if (!isSupabaseConfigured) {
      // Demo mock presence: current user + active room members
      const mockKey = `studysync_presence_${roomId}`;
      const existing = localStorage.getItem(mockKey);
      let list = existing ? JSON.parse(existing) : [];

      // Remove existing stale entry for current user and push latest state
      list = list.filter((p) => p.user_id !== user.id);
      list.push(currentUserState);

      // Add dummy active peers if only 1 user for demo realism
      if (list.length === 1) {
        list.push({
          user_id: 'usr_peer_102',
          full_name: 'Sophia Chen',
          avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sophia',
          online_at: new Date().toISOString(),
          current_status: '🎯 Focusing'
        });
        list.push({
          user_id: 'usr_peer_103',
          full_name: 'Marcus Vance',
          avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus',
          online_at: new Date().toISOString(),
          current_status: '🎯 Focusing'
        });
      }

      localStorage.setItem(mockKey, JSON.stringify(list));
      setOnlineParticipants(list);
      return;
    }

    // Supabase Realtime Presence Channel setup
    const channel = supabase.channel(`presence_room_${roomId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const usersList = [];

        Object.keys(presenceState).forEach((key) => {
          const presences = presenceState[key];
          if (presences && presences.length > 0) {
            usersList.push(presences[0]);
          }
        });

        setOnlineParticipants(usersList);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Participant joined
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // Participant left
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(currentUserState);
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [roomId, user?.id, user?.full_name, user?.avatar_url, timerMode]);

  return {
    onlineParticipants
  };
};
