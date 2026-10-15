import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { MOCK_ROOMS } from '../lib/mockData';

export const useRoomData = (user) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate a random 6-character room code (e.g. STUDY-7X9)
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `STUDY-${code}`;
  };

  // Fetch all rooms the user has joined
  const fetchUserRooms = useCallback(async () => {
    if (!user) return [];
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      const savedMock = localStorage.getItem('studysync_mock_rooms');
      const rooms = savedMock ? JSON.parse(savedMock) : MOCK_ROOMS;
      setLoading(false);
      return rooms;
    }

    try {
      // Get room IDs user belongs to
      const { data: memberships, error: memError } = await supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', user.id);

      if (memError) throw memError;

      const roomIds = memberships.map((m) => m.room_id);
      if (roomIds.length === 0) {
        setLoading(false);
        return [];
      }

      const { data: rooms, error: roomError } = await supabase
        .from('rooms')
        .select(`
          *,
          creator:profiles!creator_id(id, full_name, avatar_url),
          room_members(id, user_id, role, joined_at, profiles(id, full_name, avatar_url))
        `)
        .in('id', roomIds)
        .order('created_at', { ascending: false });

      if (roomError) throw roomError;

      // Transform data for UI
      const formattedRooms = rooms.map((r) => ({
        ...r,
        creator_name: r.creator?.full_name || 'Anonymous',
        creator_avatar: r.creator?.avatar_url || '',
        members_count: r.room_members?.length || 0,
        members: r.room_members?.map((m) => ({
          id: m.profiles?.id || m.user_id,
          full_name: m.profiles?.full_name || 'Member',
          avatar_url: m.profiles?.avatar_url || '',
          role: m.role
        })) || []
      }));

      setLoading(false);
      return formattedRooms;
    } catch (err) {
      console.error('Error fetching user rooms:', err);
      setError(err.message);
      setLoading(false);
      return [];
    }
  }, [user]);

  // Fetch single room details
  const fetchRoomDetails = useCallback(async (roomId) => {
    if (!roomId) return null;
    setLoading(true);

    if (!isSupabaseConfigured) {
      const savedMock = localStorage.getItem('studysync_mock_rooms');
      const rooms = savedMock ? JSON.parse(savedMock) : MOCK_ROOMS;
      const found = rooms.find((r) => r.id === roomId || r.code === roomId);
      setLoading(false);
      return found || rooms[0];
    }

    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select(`
          *,
          creator:profiles!creator_id(id, full_name, avatar_url),
          room_members(
            id, user_id, role, joined_at,
            profiles(id, full_name, avatar_url)
          )
        `)
        .or(`id.eq.${roomId},code.eq.${roomId}`)
        .single();

      if (roomError) throw roomError;

      const formatted = {
        ...room,
        creator_name: room.creator?.full_name || 'Host',
        creator_avatar: room.creator?.avatar_url || '',
        members: room.room_members?.map((m) => ({
          id: m.profiles?.id || m.user_id,
          full_name: m.profiles?.full_name || 'Member',
          avatar_url: m.profiles?.avatar_url || '',
          role: m.role,
          joined_at: m.joined_at
        })) || []
      };

      setLoading(false);
      return formatted;
    } catch (err) {
      console.error('Error fetching room details:', err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, []);

  // Create room
  const createRoom = async ({ name, description, focusDuration = 25, breakDuration = 5 }) => {
    if (!user) throw new Error('Must be logged in to create a room');
    setLoading(true);

    const roomCode = generateRoomCode();

    if (!isSupabaseConfigured) {
      const savedMock = localStorage.getItem('studysync_mock_rooms');
      const rooms = savedMock ? JSON.parse(savedMock) : [...MOCK_ROOMS];
      const newRoom = {
        id: 'rm_' + Date.now(),
        code: roomCode,
        name,
        description,
        creator_id: user.id,
        creator_name: user.full_name || user.email?.split('@')[0],
        creator_avatar: user.avatar_url,
        focus_duration: Number(focusDuration),
        break_duration: Number(breakDuration),
        created_at: new Date().toISOString(),
        members_count: 1,
        members: [
          {
            id: user.id,
            full_name: user.full_name || 'Host',
            avatar_url: user.avatar_url,
            role: 'host'
          }
        ]
      };
      rooms.unshift(newRoom);
      localStorage.setItem('studysync_mock_rooms', JSON.stringify(rooms));
      setLoading(false);
      return newRoom;
    }

    try {
      // 1. Insert room record
      const { data: room, error: createError } = await supabase
        .from('rooms')
        .insert({
          code: roomCode,
          name,
          description,
          creator_id: user.id,
          focus_duration: Number(focusDuration),
          break_duration: Number(breakDuration)
        })
        .select()
        .single();

      if (createError) throw createError;

      // 2. Add creator as room member with role 'host'
      await supabase.from('room_members').insert({
        room_id: room.id,
        user_id: user.id,
        role: 'host'
      });

      // 3. Initialize timer session for room
      await supabase.from('timer_sessions').insert({
        room_id: room.id,
        mode: 'focus',
        is_running: false,
        duration_seconds: Number(focusDuration) * 60,
        time_remaining: Number(focusDuration) * 60
      });

      // 4. Initialize notes document for room
      await supabase.from('notes').insert({
        room_id: room.id,
        content: `# 📝 ${name} Study Notes\n\nWelcome to your study room! Collaboratively edit these notes in real time.`
      });

      setLoading(false);
      return room;
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Join room using code
  const joinRoomByCode = async (code) => {
    if (!user) throw new Error('Must be logged in to join a room');
    setLoading(true);

    const cleanCode = code.trim().toUpperCase();

    if (!isSupabaseConfigured) {
      const savedMock = localStorage.getItem('studysync_mock_rooms');
      const rooms = savedMock ? JSON.parse(savedMock) : [...MOCK_ROOMS];
      const target = rooms.find((r) => r.code === cleanCode || r.id === cleanCode);

      if (!target) {
        setLoading(false);
        throw new Error('Room not found. Please check the room code.');
      }

      const isMember = target.members.some((m) => m.id === user.id);
      if (!isMember) {
        target.members.push({
          id: user.id,
          full_name: user.full_name || 'Member',
          avatar_url: user.avatar_url,
          role: 'member'
        });
        target.members_count = target.members.length;
        localStorage.setItem('studysync_mock_rooms', JSON.stringify(rooms));
      }

      setLoading(false);
      return target;
    }

    try {
      // Find room by code
      const { data: room, error: findError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', cleanCode)
        .single();

      if (findError || !room) {
        throw new Error('Invalid room code. Please check and try again.');
      }

      // Upsert membership
      const { error: joinError } = await supabase
        .from('room_members')
        .upsert(
          { room_id: room.id, user_id: user.id, role: 'member' },
          { onConflict: 'room_id,user_id' }
        );

      if (joinError) throw joinError;

      setLoading(false);
      return room;
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Leave room
  const leaveRoom = async (roomId) => {
    if (!user) return;
    setLoading(true);

    if (!isSupabaseConfigured) {
      const savedMock = localStorage.getItem('studysync_mock_rooms');
      if (savedMock) {
        let rooms = JSON.parse(savedMock);
        rooms = rooms.map((r) => {
          if (r.id === roomId) {
            return {
              ...r,
              members: r.members.filter((m) => m.id !== user.id),
              members_count: Math.max(0, r.members_count - 1)
            };
          }
          return r;
        });
        localStorage.setItem('studysync_mock_rooms', JSON.stringify(rooms));
      }
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('room_members')
        .delete()
        .match({ room_id: roomId, user_id: user.id });

      if (error) throw error;
      setLoading(false);
    } catch (err) {
      console.error('Error leaving room:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    error,
    fetchUserRooms,
    fetchRoomDetails,
    createRoom,
    joinRoomByCode,
    leaveRoom
  };
};
