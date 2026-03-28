import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getResponsaveis,
  createResponsavel,
  updateResponsavel,
  deleteResponsavel,
  checkResponsavelStudentCount,
} from '@/integrations/supabase/api';
import { Responsavel } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminResponsaveis() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [filtrados, setFiltrados] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nome_completo: '',
    grau_parentesco: '',
    endereco: '',
    email: '',
    cpf: '',
    celular: '',
    user_id: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadResponsaveis();
    }
  }, [user]);

  useEffect(() => {
    const filtered = responsaveis.filter(r =>
      r.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cpf.includes(searchTerm)
    );
    setFiltrados(filtered);
  }, [searchTerm, responsaveis]);

  const loadResponsaveis = async () => {
    setLoading(true);
    const { data, error } = await getResponsaveis();
    if (error) {
      toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' });
    } else {
      setResponsaveis(data);
      // Carregar contagem de alunos
      const counts: Record<string, number> = {};
      for (const resp of data) {
        const { count } = await checkResponsavelStudentCount(resp.id);
        counts[resp.id] = count;
      }
      setStudentCounts(counts);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await updateResponsavel(editingId, formData);
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Responsável atualizado' });
      } else {
        const { error } = await createResponsavel({
          ...formData,
          user_id: user?.id || '',
        });
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Responsável criado' });
      }
      
      resetForm();
      setIsOpen(false);
      loadResponsaveis();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await deleteResponsavel(deleteId);
    if (error) {
      toast({ title: 'Erro ao deletar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Responsável deletado' });
      loadResponsaveis();
    }
    setDeleteId(null);
  };

  const handleEdit = (resp: Responsavel) => {
    setFormData({
      nome_completo: resp.nome_completo,
      grau_parentesco: resp.grau_parentesco,
      endereco: resp.endereco,
      email: resp.email,
      cpf: resp.cpf,
      celular: resp.celular,
      user_id: resp.user_id,
    });
    setEditingId(resp.id);
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nome_completo: '',
      grau_parentesco: '',
      endereco: '',
      email: '',
      cpf: '',
      celular: '',
      user_id: '',
    });
    setEditingId(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Carregando...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Responsáveis</h1>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Responsável
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar' : 'Novo'} Responsável</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input
                  required
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                />
              </div>
              <div>
                <Label>Grau de Parentesco *</Label>
                <Input
                  required
                  value={formData.grau_parentesco}
                  onChange={(e) => setFormData({...formData, grau_parentesco: e.target.value})}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label>Celular</Label>
                <Input
                  value={formData.celular}
                  onChange={(e) => setFormData({...formData, celular: e.target.value})}
                />
              </div>
              <div>
                <Label>CPF</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingId ? 'Atualizar' : 'Criar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Search className="w-5 h-5 text-muted-foreground mt-2" />
        <Input
          placeholder="Buscar por nome, email ou CPF..."
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold">{resp.nome_completo}</p>
                      <p className="text-sm text-muted-foreground">{resp.grau_parentesco}</p>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                        <p>📧 {resp.email || '-'}</p>
                        <p>📱 {resp.celular || '-'}</p>
                        <p>🏠 {resp.endereco || '-'}</p>
                        <p>👥 {studentCounts[resp.id] || 0}/4 alunos</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-col">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(resp)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(resp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Deletar</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
