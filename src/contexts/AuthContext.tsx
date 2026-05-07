import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  isAuthReady: boolean;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  loginAsMock: (role: UserRole) => void;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  signOut: async () => {},
  logout: async () => {},
  loginAsMock: () => {},
  signUp: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const savedMock = localStorage.getItem('mock_user_profile');
      if (savedMock) {
        const p = JSON.parse(savedMock);
        setUser({ id: p.id, email: 'mock@example.com' });
        setProfile(p);
      }
      setLoading(false);
      setIsAuthReady(true);
      return;
    }

    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Auth session error:", error);
        setLoading(false);
        setIsAuthReady(true);
        return;
      }
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
        setIsAuthReady(true);
      }
    }).catch(err => {
      console.error("Auth session fetch error:", err);
      setLoading(false);
      setIsAuthReady(true);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
      setIsAuthReady(true);
    }
  };

  const loginAsMock = (role: UserRole) => {
    const mockProfile: Profile = {
      id: 'mock-id',
      full_name: `Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role,
      status: 'active',
      created_at: new Date().toISOString()
    };
    localStorage.setItem('mock_user_profile', JSON.stringify(mockProfile));
    setUser({ id: mockProfile.id, email: 'mock@example.com' });
    setProfile(mockProfile);
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      localStorage.removeItem('mock_user_profile');
      setUser(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (authError) throw authError;

    // Explicitly insert into profiles so it works dynamically even if triggers aren't configured
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          role: role,
          status: 'active'
        });

      if (profileError && profileError.code !== '23505') {
        console.warn('Profile creation note:', profileError.message);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, signOut, logout: signOut, loginAsMock, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
