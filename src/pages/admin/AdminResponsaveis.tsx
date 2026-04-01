import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileWithRole {
  id: string;
  name: string;
  created_at: string;
  role?: string;
}

export default function AdminResponsaveis() {
  const [responsaveis, setResponsaveis] = useState<ProfileWithRole[]>([]);
  const [filtrados, setFiltrados] = useState<ProfileWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) loadResponsaveis();
  }, [user]);

  useEffect(() => {
    const filtered = responsaveis.filter(r =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltrados(filtered);
  }, [searchTerm, responsaveis]);

  const loadResponsaveis = async () => {
    setLoading(true);
    try {
      // Get users with 'responsavel' role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'responsavel');

      if (roles && roles.length > 0) {
        const userIds = roles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        setResponsaveis((profiles || []).map(p => ({ ...p, role: 'responsavel' })));
      } else {
        setResponsaveis([]);
      }
    } catch (error: any) {
      toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Carregando...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4"
    >
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Responsáveis</h1>
      </div>

      <div className="flex gap-2">
        <Search className="w-5 h-5 text-muted-foreground mt-2" />
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="space-y-2">
        {filtrados.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhum responsável encontrado
            </CardContent>
          </Card>
        ) : (
          filtrados.map((resp) => (
            <motion.div key={resp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardContent className="pt-4">
                  <p className="font-semibold">{resp.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Cadastrado em {new Date(resp.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
