import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      return { role: data?.role ?? null, error };
    } catch (err) {
      return { role: null, error: err };
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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { role: userRole } = await fetchUserRole(session.user.id);
          const prof = await fetchProfile(session.user.id);
          const userData = buildUser(session.user, userRole);

          setUser(userData);
          setProfile(prof);
          setRole(userRole);

          if (userRole === 'admin' || userRole === 'admin_programador') {
            navigate('/admin', { replace: true });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { role: userRole } = await fetchUserRole(session.user.id);
          const prof = await fetchProfile(session.user.id);
          const userData = buildUser(session.user, userRole);
          setUser(userData);
          setProfile(prof);
          setRole(userRole);

          if (userRole === 'admin' || userRole === 'admin_programador') {
            navigate('/admin', { replace: true });
          }
        } else {
          setUser(null);
          setProfile(null);
          setRole(null);
          navigate('/auth', { replace: true });
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };

      if (data.user) {
        const { role: userRole } = await fetchUserRole(data.user.id);
        const prof = await fetchProfile(data.user.id);
        const userData = buildUser(data.user, userRole);
        setUser(userData);
        setProfile(prof);
        setRole(userRole);

        if (userRole === 'admin' || userRole === 'admin_programador') {
          navigate('/admin', { replace: true });
        }
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
        await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: 'responsavel' as const });

        const userData = buildUser(data.user, 'responsavel');
        setUser(userData);
        setRole('responsavel');
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
