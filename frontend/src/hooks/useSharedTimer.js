import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { soundService } from '../lib/soundEffects';
import confetti from 'canvas-confetti';

export const useSharedTimer = (roomId, focusDuration = 25, breakDuration = 5) => {
  const [timerState, setTimerState] = useState({
    mode: 'focus', // 'focus' | 'break'
    isRunning: false,
    durationSeconds: focusDuration * 60,
    timeRemaining: focusDuration * 60,
    startedAt: null
  });

  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // Helper to calculate exact remaining seconds based on server timestamp
  const calculateRemaining = useCallback((state) => {
    if (!state.isRunning || !state.startedAt) {
      return Math.max(0, state.timeRemaining);
    }
    const startTime = new Date(state.startedAt).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const rem = state.timeRemaining - elapsedSeconds;
    return Math.max(0, rem);
  }, []);

  // Fetch timer state from Supabase / Mock Storage
  const fetchTimerState = useCallback(async () => {
    if (!roomId) return;

    if (!isSupabaseConfigured) {
      const mockKey = `studysync_timer_${roomId}`;
      const saved = localStorage.getItem(mockKey);
      if (saved) {
        setTimerState(JSON.parse(saved));
      } else {
        const initial = {
          mode: 'focus',
          isRunning: false,
          durationSeconds: focusDuration * 60,
          timeRemaining: focusDuration * 60,
          startedAt: null
        };
        localStorage.setItem(mockKey, JSON.stringify(initial));
        setTimerState(initial);
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('timer_sessions')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching timer session:', error);
      }

      if (data) {
        const currentState = {
          mode: data.mode || 'focus',
          isRunning: data.is_running || false,
          durationSeconds: data.duration_seconds || focusDuration * 60,
          timeRemaining: data.time_remaining || focusDuration * 60,
          startedAt: data.started_at || null
        };
        setTimerState(currentState);
      } else {
        // Create initial session record
        const initial = {
          room_id: roomId,
          mode: 'focus',
          is_running: false,
          duration_seconds: focusDuration * 60,
          time_remaining: focusDuration * 60
        };
        await supabase.from('timer_sessions').insert(initial);
        setTimerState({
          mode: 'focus',
          isRunning: false,
          durationSeconds: focusDuration * 60,
          timeRemaining: focusDuration * 60,
          startedAt: null
        });
      }
    } catch (err) {
      console.error('Exception fetching timer state:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId, focusDuration]);

  // Subscribe to Realtime Postgres Changes & Broadcasts
  useEffect(() => {
    if (!roomId) return;
    fetchTimerState();

    if (!isSupabaseConfigured) {
      // Local storage polling/listener fallback
      const interval = setInterval(() => {
        const saved = localStorage.getItem(`studysync_timer_${roomId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setTimerState((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
              return parsed;
            }
            return prev;
          });
        }
      }, 1000);
      return () => clearInterval(interval);
    }

    // Subscribe to DB changes on timer_sessions
    const channel = supabase
      .channel(`timer_room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timer_sessions',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          if (payload.new) {
            const updated = payload.new;
            setTimerState({
              mode: updated.mode,
              isRunning: updated.is_running,
              durationSeconds: updated.duration_seconds,
              timeRemaining: updated.time_remaining,
              startedAt: updated.started_at
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchTimerState]);

  // Handle local interval tick and auto session transition
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (timerState.isRunning) {
      intervalRef.current = setInterval(() => {
        const rem = calculateRemaining(timerState);

        if (rem <= 0) {
          clearInterval(intervalRef.current);
          handleAutoSwitchMode();
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, calculateRemaining]);

  // Auto switch between Focus and Break when timer ends
  const handleAutoSwitchMode = async () => {
    soundService.playTimerComplete(timerState.mode === 'focus');

    if (timerState.mode === 'focus') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    const nextMode = timerState.mode === 'focus' ? 'break' : 'focus';
    const nextDuration = (nextMode === 'focus' ? focusDuration : breakDuration) * 60;

    const newState = {
      mode: nextMode,
      isRunning: false, // pause when automatically transitioning
      durationSeconds: nextDuration,
      timeRemaining: nextDuration,
      startedAt: null
    };

    updateTimerInDb(newState);
  };

  // Helper to persist timer changes to Supabase or Mock Storage
  const updateTimerInDb = async (newState) => {
    setTimerState(newState);

    if (!isSupabaseConfigured) {
      localStorage.setItem(`studysync_timer_${roomId}`, JSON.stringify(newState));
      return;
    }

    try {
      await supabase
        .from('timer_sessions')
        .upsert({
          room_id: roomId,
          mode: newState.mode,
          is_running: newState.isRunning,
          duration_seconds: newState.durationSeconds,
          time_remaining: newState.timeRemaining,
          started_at: newState.startedAt,
          updated_at: new Date().toISOString()
        }, { onConflict: 'room_id' });
    } catch (err) {
      console.error('Failed to sync timer with Supabase:', err);
    }
  };

  // Control Functions
  const startTimer = () => {
    const currentRem = calculateRemaining(timerState);
    const newState = {
      ...timerState,
      isRunning: true,
      timeRemaining: currentRem,
      startedAt: new Date().toISOString()
    };
    updateTimerInDb(newState);
    soundService.playClick();
  };

  const pauseTimer = () => {
    const currentRem = calculateRemaining(timerState);
    const newState = {
      ...timerState,
      isRunning: false,
      timeRemaining: currentRem,
      startedAt: null
    };
    updateTimerInDb(newState);
    soundService.playClick();
  };

  const resetTimer = () => {
    const defaultSecs = (timerState.mode === 'focus' ? focusDuration : breakDuration) * 60;
    const newState = {
      ...timerState,
      isRunning: false,
      durationSeconds: defaultSecs,
      timeRemaining: defaultSecs,
      startedAt: null
    };
    updateTimerInDb(newState);
    soundService.playClick();
  };

  const skipSession = () => {
    const nextMode = timerState.mode === 'focus' ? 'break' : 'focus';
    const nextDuration = (nextMode === 'focus' ? focusDuration : breakDuration) * 60;
    const newState = {
      mode: nextMode,
      isRunning: false,
      durationSeconds: nextDuration,
      timeRemaining: nextDuration,
      startedAt: null
    };
    updateTimerInDb(newState);
    soundService.playClick();
  };

  // Computed current remaining seconds
  const secondsRemaining = calculateRemaining(timerState);

  return {
    mode: timerState.mode,
    isRunning: timerState.isRunning,
    durationSeconds: timerState.durationSeconds,
    secondsRemaining,
    loading,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession
  };
};
