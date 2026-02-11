import { useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNotices, useCreateNotice, useUpdateNotice, useDeleteNotice, type Notice } from "@/hooks/use-notices";

const typeColors: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  urgent: "destructive",
  info: "default",
  event: "secondary",
  general: "outline",
};
const typeLabels: Record<string, string> = { urgent: "Urgente", info: "Informativo", event: "Evento", general: "Geral" };
const types = ["urgent", "info", "event", "general"];

const AdminAvisos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: notices = [], isLoading } = useNotices();
  const createMutation = useCreateNotice();
  const updateMutation = useUpdateNotice();
  const deleteMutation = useDeleteNotice();

  const [editItem, setEditItem] = useState<Notice | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState("");

  const resetForm = () => { setFormTitle(""); setFormDesc(""); setFormType(""); setEditItem(null); };
  const openNew = () => { resetForm(); setFormOpen(true); };
  const openEdit = (n: Notice) => { setEditItem(n); setFormTitle(n.title); setFormDesc(n.description); setFormType(n.type); setFormOpen(true); };

  const handleSave = async () => {
    if (!formTitle || !formDesc || !formType) {
      toast({ title: "Preencha todos os campos", variant: "destructive" }); return;
    }
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, title: formTitle, description: formDesc, type: formType });
        toast({ title: "Aviso atualizado!" });
      } else {
        await createMutation.mutateAsync({ title: formTitle, description: formDesc, type: formType });
        toast({ title: "Aviso criado!" });
      }
      setFormOpen(false); resetForm();
    } catch { toast({ title: "Erro ao salvar", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Aviso removido" });
    } catch { toast({ title: "Erro ao remover", variant: "destructive" }); }
  };

  return (
    <PageTransition>
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/admin")} className="text-muted-foreground"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold text-foreground">Avisos</h1>
            <p className="text-xs text-muted-foreground">Gerenciar comunicados</p>
          </div>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openNew} className="gap-1"><Plus size={16} /> Novo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[360px]">
              <DialogHeader><DialogTitle>{editItem ? "Editar Aviso" : "Novo Aviso"}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input placeholder="Título do aviso" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea placeholder="Detalhes do aviso" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{types.map((t) => <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
                <Button size="sm" onClick={handleSave}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="space-y-2 px-4 pb-24 pt-4">
        {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>}
        <AnimatePresence>
          {notices.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-card">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Bell size={18} className="text-primary" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground truncate">{n.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{n.description}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={typeColors[n.type] || "outline"} className="text-[10px]">{typeLabels[n.type] || n.type}</Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(n.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openEdit(n)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(n.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
    </PageTransition>
  );
};

export default AdminAvisos;
