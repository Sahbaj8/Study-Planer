import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { MOCK_CURRENT_USER } from '../lib/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch or construct profile
  const fetchUserProfile = async (userId) => {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('studysync_mock_profile');
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        setProfile(MOCK_CURRENT_USER);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      }

      if (data) {
        setProfile(data);
      } else {
        // Create initial fallback profile if missing
        const { data: authUserData } = await supabase.auth.getUser();
        const initialName = authUserData?.user?.user_metadata?.full_name || authUserData?.user?.email?.split('@')[0] || 'Student';
        const initialAvatar = authUserData?.user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`;
        
        const newProfile = {
          id: userId,
          full_name: initialName,
          avatar_url: initialAvatar
        };

        await supabase.from('profiles').upsert(newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Profile fetch exception:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mock auth state initialization
      const mockSaved = localStorage.getItem('studysync_mock_user');
      if (mockSaved) {
        const u = JSON.parse(mockSaved);
        setUser(u);
        setProfile(u);
      } else {
        setUser(MOCK_CURRENT_USER);
        setProfile(MOCK_CURRENT_USER);
      }
      setLoading(false);
      return;
    }

    // Supabase Auth listener
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auth Methods
  const signUp = async (email, password, fullName, avatarUrl) => {
    if (!isSupabaseConfigured) {
      const newUser = {
        id: 'usr_' + Date.now(),
        email,
        full_name: fullName || email.split('@')[0],
        avatar_url: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${fullName || email}`,
      };
      localStorage.setItem('studysync_mock_user', JSON.stringify(newUser));
      localStorage.setItem('studysync_mock_profile', JSON.stringify(newUser));
      setUser(newUser);
      setProfile(newUser);
      return { data: { user: newUser }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar_url: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${fullName || email}`
        }
      }
    });

    if (data?.user && !error) {
      // Upsert profile
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName || email.split('@')[0],
        avatar_url: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.id}`
      });
    }

    return { data, error };
  };

  const login = async (email, password) => {
    if (!isSupabaseConfigured) {
      const existing = localStorage.getItem('studysync_mock_user');
      const u = existing ? JSON.parse(existing) : { ...MOCK_CURRENT_USER, email };
      localStorage.setItem('studysync_mock_user', JSON.stringify(u));
      setUser(u);
      setProfile(u);
      return { data: { user: u }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (data?.user && !error) {
      await fetchUserProfile(data.user.id);
    }

    return { data, error };
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('studysync_mock_user');
      setUser(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };

  const updateProfile = async (updates) => {
    const targetId = user?.id || profile?.id;
    if (!targetId) return;

    const updatedProfile = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (!isSupabaseConfigured) {
      localStorage.setItem('studysync_mock_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('studysync_mock_user', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setUser(updatedProfile);
      return { data: updatedProfile, error: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', targetId)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }
    return { data, error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        login,
        logout,
        resetPassword,
        updateProfile,
        isConfigured: isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
