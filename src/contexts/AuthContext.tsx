import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'admin_programador' | 'responsavel' | 'aluno' | null;
  created_at?: string;
}

export interface Profile {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const initialized = useRef(false);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      return data?.role ?? null;
    } catch {
      return null;
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      return data as Profile | null;
    } catch {
      return null;
    }
  };

  const buildUser = (sessionUser: any, userRole: string | null): User => ({
    id: sessionUser.id,
    email: sessionUser.email || '',
    name: sessionUser.user_metadata?.name || 'Usuário',
    role: (userRole as any) || null,
    created_at: sessionUser.created_at,
  });

  const handleSession = async (sessionUser: any) => {
    const userRole = await fetchUserRole(sessionUser.id);
    const prof = await fetchProfile(sessionUser.id);
    const userData = buildUser(sessionUser, userRole);

    setUser(userData);
    setProfile(prof);
    setRole(userRole);

    if (userRole === 'admin') {
      navigate('/admin', { replace: true });
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Set up listener FIRST (per Supabase best practices)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setProfile(null);
          setRole(null);
          setLoading(false);
          navigate('/auth', { replace: true });
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            await handleSession(session.user);
            setLoading(false);
          }, 0);
        }
      }
    );

    // Then check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await handleSession(session.user);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Safety timeout - never stay loading more than 5 seconds
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      subscription?.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };

      if (data.user) {
        await handleSession(data.user);
      }

      return {};
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) return { error };

      if (data.user) {
        // The handle_new_user trigger already creates the role
        const userData = buildUser(data.user, 'aluno');
        setUser(userData);
        setRole('aluno');
      }

      return {};
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRole(null);
    navigate('/auth', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
