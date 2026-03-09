import { useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Clock } from "lucide-react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSchedules, type Schedule } from "@/hooks/use-schedules";
import { useCreateSchedule, useUpdateSchedule, useDeleteSchedule } from "@/hooks/use-schedules-admin";

const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const;
const categories = ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Adulto"] as const;

const timeRegex = /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/;
const scheduleSchema = z.object({
  day: z.enum(days, { errorMap: () => ({ message: "Selecione um dia" }) }),
  time: z.string().regex(timeRegex, "Formato de horário inválido (ex: 17:00 - 18:30)"),
  category: z.enum(categories, { errorMap: () => ({ message: "Selecione uma categoria" }) }),
  location: z.string().trim().min(2, "Local deve ter ao menos 2 caracteres").max(100, "Local muito longo"),
});

const AdminHorarios = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: trainings = [], isLoading } = useSchedules();
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  const [editItem, setEditItem] = useState<Schedule | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formDay, setFormDay] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formLocation, setFormLocation] = useState("");

  const resetForm = () => { setFormDay(""); setFormTime(""); setFormCategory(""); setFormLocation(""); setEditItem(null); };
  const openNew = () => { resetForm(); setFormOpen(true); };
  const openEdit = (t: Schedule) => {
    setEditItem(t); setFormDay(t.day); setFormTime(t.time); setFormCategory(t.category); setFormLocation(t.location); setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formDay || !formTime || !formCategory || !formLocation) {
      toast({ title: "Preencha todos os campos", variant: "destructive" }); return;
    }
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, day: formDay, time: formTime, category: formCategory, location: formLocation });
        toast({ title: "Horário atualizado!" });
      } else {
        await createMutation.mutateAsync({ day: formDay, time: formTime, category: formCategory, location: formLocation });
        toast({ title: "Horário criado!" });
      }
      setFormOpen(false); resetForm();
    } catch { toast({ title: "Erro ao salvar", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Horário removido" });
    } catch { toast({ title: "Erro ao remover", variant: "destructive" }); }
  };

  return (
    <PageTransition>
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/admin")} className="text-muted-foreground"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold text-foreground">Horários</h1>
            <p className="text-xs text-muted-foreground">Gerenciar treinos</p>
          </div>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openNew} className="gap-1"><Plus size={16} /> Novo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[360px]">
              <DialogHeader><DialogTitle>{editItem ? "Editar Horário" : "Novo Horário"}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Dia</Label>
                  <Select value={formDay} onValueChange={setFormDay}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{days.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input placeholder="Ex: 17:00 - 18:30" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Local</Label>
                  <Input placeholder="Ex: Ginásio A" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
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
          {trainings.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Clock size={18} className="text-primary" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground truncate">{t.day} — {t.time}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
                  <span className="text-[10px] text-muted-foreground">{t.location}</span>
                </div>
              </div>
              <button onClick={() => openEdit(t)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(t.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
    </PageTransition>
  );
};

export default AdminHorarios;
