import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { MOCK_NOTES } from '../lib/mockData';

export const useCollaborativeNotes = (roomId, user) => {
  const [content, setContent] = useState('');
  const [lastUpdatedBy, setLastUpdatedBy] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const debounceTimeoutRef = useRef(null);
  const isSelfEditingRef = useRef(false);

  // Fetch initial notes
  const fetchNotes = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);

    if (!isSupabaseConfigured) {
      const mockKey = `studysync_notes_${roomId}`;
      const saved = localStorage.getItem(mockKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setContent(parsed.content || '');
        setLastUpdatedBy(parsed.last_updated_by || null);
        setUpdatedAt(parsed.updated_at || new Date().toISOString());
      } else {
        const initialContent = MOCK_NOTES[roomId] || `# 📝 Shared Study Notes\n\nCollaborate, take notes, and organize study topics together!`;
        setContent(initialContent);
        setUpdatedAt(new Date().toISOString());
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          updater:profiles!last_updated_by(full_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notes:', error);
      }

      if (data) {
        setContent(data.content || '');
        setLastUpdatedBy(data.updater?.full_name || 'Room Member');
        setUpdatedAt(data.updated_at);
      } else {
        // Create initial notes row
        const defaultContent = `# 📝 Room Study Notes\n\nType here to collaborate with your room members...`;
        await supabase.from('notes').insert({
          room_id: roomId,
          content: defaultContent,
          last_updated_by: user?.id || null
        });
        setContent(defaultContent);
        setUpdatedAt(new Date().toISOString());
      }
    } catch (err) {
      console.error('Exception fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId, user]);

  // Subscribe to Realtime Updates
  useEffect(() => {
    if (!roomId) return;
    fetchNotes();

    if (!isSupabaseConfigured) {
      // Local fallback interval listener
      const interval = setInterval(() => {
        if (isSelfEditingRef.current) return;
        const saved = localStorage.getItem(`studysync_notes_${roomId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.content !== content) {
            setContent(parsed.content || '');
            setLastUpdatedBy(parsed.last_updated_by || 'Room Member');
            setUpdatedAt(parsed.updated_at);
          }
        }
      }, 1500);
      return () => clearInterval(interval);
    }

    // Supabase Realtime Subscription for Postgres changes
    const channel = supabase
      .channel(`notes_room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          if (payload.new && !isSelfEditingRef.current) {
            setContent(payload.new.content || '');
            setUpdatedAt(payload.new.updated_at);

            // Fetch updater profile name if updated by another user
            if (payload.new.last_updated_by) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', payload.new.last_updated_by)
                .single();

              if (profile) {
                setLastUpdatedBy(profile.full_name);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchNotes]);

  // Save notes to Supabase / Local Storage
  const saveNotesToDb = async (newContent) => {
    setSaving(true);

    const timeNow = new Date().toISOString();
    const updaterName = user?.full_name || user?.email?.split('@')[0] || 'You';

    if (!isSupabaseConfigured) {
      const mockKey = `studysync_notes_${roomId}`;
      localStorage.setItem(
        mockKey,
        JSON.stringify({
          content: newContent,
          last_updated_by: updaterName,
          updated_at: timeNow
        })
      );
      setLastUpdatedBy(updaterName);
      setUpdatedAt(timeNow);
      setSaving(false);
      isSelfEditingRef.current = false;
      return;
    }

    try {
      await supabase.from('notes').upsert(
        {
          room_id: roomId,
          content: newContent,
          last_updated_by: user?.id || null,
          updated_at: timeNow
        },
        { onConflict: 'room_id' }
      );

      setLastUpdatedBy(updaterName);
      setUpdatedAt(timeNow);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSaving(false);
      isSelfEditingRef.current = false;
    }
  };

  // Debounced note change handler
  const updateContent = (newText) => {
    setContent(newText);
    isSelfEditingRef.current = true;
    setSaving(true);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      saveNotesToDb(newText);
    }, 600);
  };

  return {
    content,
    updateContent,
    lastUpdatedBy,
    updatedAt,
    saving,
    loading
  };
};
