import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, Profile } from './supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'customer' | 'photographer' | 'admin') => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => {
          await fetchProfile(session.user.id);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      if (data.role === ('couple' as any)) {
        data.role = 'customer';
        await supabase.from('profiles').update({ role: 'customer' }).eq('id', userId);
      }
      setProfile(data);
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'customer' | 'photographer' | 'admin') => {
    let userObj: User | null = null;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already in use')) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) {
          return { error: new Error('An account with this email already exists. Please switch to "Sign In" to log in.') };
        }
        userObj = signInData.user;
      } else {
        return { error };
      }
    } else {
      userObj = data.user;
    }

    if (userObj) {
      // Direct upsert to profiles table
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userObj.id,
        email,
        full_name: fullName,
        role,
        Password: password,
      }, { onConflict: 'id' });

      if (profileError) {
        console.error('Profile creation error:', profileError.message);
      }

      // Immediately fetch and populate profile state before resolving
      await fetchProfile(userObj.id);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data?.user) {
      // Instantly sync password & fetch profile
      await supabase.from('profiles').update({ Password: password }).eq('id', data.user.id);
      await fetchProfile(data.user.id);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
