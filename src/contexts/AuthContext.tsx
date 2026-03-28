import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'admin_programador' | 'responsavel' | 'aluno' | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Buscar role do usuário
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      return { role: data?.role, error };
    } catch (err) {
      return { role: null, error: err };
    }
  };

  // Verificar sessão ao carregar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { role } = await fetchUserRole(session.user.id);
          
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Usuário',
            role: (role as any) || null,
          };

          setUser(userData);

          // Redirecionar admin para painel
          if (role === 'admin' || role === 'admin_programador') {
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

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { role } = await fetchUserRole(session.user.id);
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Usuário',
            role: (role as any) || null,
          };
          setUser(userData);

          if (role === 'admin' || role === 'admin_programador') {
            navigate('/admin', { replace: true });
          }
        } else {
          setUser(null);
          navigate('/auth', { replace: true });
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        const { role } = await fetchUserRole(data.user.id);
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || 'Usuário',
          role: (role as any) || null,
        };
        setUser(userData);

        // Redirecionar admin automaticamente
        if (role === 'admin' || role === 'admin_programador') {
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
        options: {
          data: { name },
        },
      });

      if (error) return { error };

      if (data.user) {
        // Criar registro de usuário com role de responsavel
        await supabase
          .from('users_roles')
          .insert({
            user_id: data.user.id,
            role: 'responsavel',
          });

        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          name,
          role: 'responsavel',
        };
        setUser(userData);
      }

      return {};
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/auth', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
