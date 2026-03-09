import { useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Search } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent, type Student } from "@/hooks/use-students";

const categories = ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Adulto"] as const;

const studentSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(100, "Nome muito longo"),
  age: z.number({ invalid_type_error: "Idade inválida" }).int().min(5, "Idade mínima: 5").max(100, "Idade máxima: 100"),
  category: z.enum(categories, { errorMap: () => ({ message: "Selecione uma categoria" }) }),
  responsible: z.string().trim().min(2, "Nome do responsável deve ter ao menos 2 caracteres").max(100, "Nome muito longo"),
});

const AdminAlunos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: students = [], isLoading } = useStudents();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<Student | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formResponsible, setFormResponsible] = useState("");

  const resetForm = () => { setFormName(""); setFormAge(""); setFormCategory(""); setFormResponsible(""); setEditItem(null); };
  const openNew = () => { resetForm(); setFormOpen(true); };
  const openEdit = (s: Student) => {
    setEditItem(s); setFormName(s.name); setFormAge(String(s.age)); setFormCategory(s.category); setFormResponsible(s.responsible); setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formName || !formAge || !formCategory || !formResponsible) {
      toast({ title: "Preencha todos os campos", variant: "destructive" }); return;
    }
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, name: formName, age: Number(formAge), category: formCategory, responsible: formResponsible });
        toast({ title: "Aluno atualizado!" });
      } else {
        await createMutation.mutateAsync({ name: formName, age: Number(formAge), category: formCategory, responsible: formResponsible });
        toast({ title: "Aluno cadastrado!" });
      }
      setFormOpen(false); resetForm();
    } catch { toast({ title: "Erro ao salvar", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Aluno removido" });
    } catch { toast({ title: "Erro ao remover", variant: "destructive" }); }
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/admin")} className="text-muted-foreground"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold text-foreground">Alunos</h1>
            <p className="text-xs text-muted-foreground">{students.length} cadastrados</p>
          </div>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openNew} className="gap-1"><Plus size={16} /> Novo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[360px]">
              <DialogHeader><DialogTitle>{editItem ? "Editar Aluno" : "Novo Aluno"}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2"><Label>Nome</Label><Input placeholder="Nome completo" value={formName} onChange={(e) => setFormName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Idade</Label><Input type="number" placeholder="Idade" value={formAge} onChange={(e) => setFormAge(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Responsável</Label><Input placeholder="Nome do responsável" value={formResponsible} onChange={(e) => setFormResponsible(e.target.value)} /></div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
                <Button size="sm" onClick={handleSave}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="space-y-3 px-4 pb-24 pt-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar aluno ou categoria..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>}

        <AnimatePresence>
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-card">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                  {s.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground truncate">{s.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{s.category}</Badge>
                  <span className="text-[10px] text-muted-foreground">{s.age} anos</span>
                  <Badge variant={s.status === "Ativo" ? "default" : "outline"} className="text-[10px]">{s.status}</Badge>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!isLoading && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum aluno encontrado.</p>
        )}
      </main>
    </PageTransition>
  );
};

export default AdminAlunos;
