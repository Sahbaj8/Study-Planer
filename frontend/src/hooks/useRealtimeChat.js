import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { MOCK_MESSAGES } from '../lib/mockData';
import { soundService } from '../lib/soundEffects';

export const useRealtimeChat = (roomId, user) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = (smooth = true) => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  // Fetch message history
  const fetchMessages = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);

    if (!isSupabaseConfigured) {
      const mockKey = `studysync_chat_${roomId}`;
      const saved = localStorage.getItem(mockKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        const initial = MOCK_MESSAGES[roomId] || [
          {
            id: 'system_welcome',
            user_id: 'system',
            user_name: 'StudySync Bot',
            avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=StudySyncBot',
            content: '👋 Welcome to the room study chat! Share links, notes, and ask questions here.',
            created_at: new Date().toISOString()
          }
        ];
        setMessages(initial);
      }
      setLoading(false);
      setTimeout(() => scrollToBottom(false), 100);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          room_id,
          user_id,
          content,
          created_at,
          sender:profiles!user_id(full_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formatted = data.map((msg) => ({
        id: msg.id,
        room_id: msg.room_id,
        user_id: msg.user_id,
        user_name: msg.sender?.full_name || 'Member',
        avatar_url: msg.sender?.avatar_url || '',
        content: msg.content,
        created_at: msg.created_at
      }));

      setMessages(formatted);
      setTimeout(() => scrollToBottom(false), 100);
    } catch (err) {
      console.error('Error loading chat messages:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Subscribe to Realtime Messages (DB changes & Broadcast channel)
  useEffect(() => {
    if (!roomId) return;
    fetchMessages();

    if (!isSupabaseConfigured) {
      // Polling interval fallback for local demo
      const interval = setInterval(() => {
        const saved = localStorage.getItem(`studysync_chat_${roomId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setMessages((prev) => {
            if (prev.length !== parsed.length) {
              setTimeout(() => scrollToBottom(true), 50);
              return parsed;
            }
            return prev;
          });
        }
      }, 1200);
      return () => clearInterval(interval);
    }

    // Subscribe to DB INSERT on messages table
    const channel = supabase
      .channel(`chat_room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const newMsg = payload.new;

          // Fetch sender profile info
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newMsg.user_id)
            .single();

          const formattedMsg = {
            id: newMsg.id,
            room_id: newMsg.room_id,
            user_id: newMsg.user_id,
            user_name: profile?.full_name || 'Member',
            avatar_url: profile?.avatar_url || '',
            content: newMsg.content,
            created_at: newMsg.created_at
          };

          setMessages((prev) => {
            // Avoid duplicate message render
            if (prev.some((m) => m.id === formattedMsg.id)) return prev;
            return [...prev, formattedMsg];
          });

          if (newMsg.user_id !== user?.id) {
            soundService.playMessagePop();
          }

          setTimeout(() => scrollToBottom(true), 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchMessages, user]);

  // Send message function
  const sendMessage = async (text) => {
    if (!text.trim() || !user || !roomId) return;
    setSending(true);

    const contentText = text.trim();
    const timeNow = new Date().toISOString();

    const tempMsg = {
      id: 'msg_' + Date.now(),
      room_id: roomId,
      user_id: user.id,
      user_name: user.full_name || user.email?.split('@')[0] || 'You',
      avatar_url: user.avatar_url,
      content: contentText,
      created_at: timeNow
    };

    if (!isSupabaseConfigured) {
      const mockKey = `studysync_chat_${roomId}`;
      const saved = localStorage.getItem(mockKey);
      const list = saved ? JSON.parse(saved) : MOCK_MESSAGES[roomId] || [];
      const updatedList = [...list, tempMsg];
      localStorage.setItem(mockKey, JSON.stringify(updatedList));
      setMessages(updatedList);
      setSending(false);
      setTimeout(() => scrollToBottom(true), 50);
      return;
    }

    try {
      const { error } = await supabase.from('messages').insert({
        room_id: roomId,
        user_id: user.id,
        content: contentText
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
      setTimeout(() => scrollToBottom(true), 50);
    }
  };

  return {
    messages,
    loading,
    sending,
    sendMessage,
    chatEndRef,
    scrollToBottom
  };
};
