import { useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Search } from "lucide-react";
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

interface Student {
  id: number;
  name: string;
  age: number;
  category: string;
  responsible: string;
  status: "Ativo" | "Inativo";
}

const initialStudents: Student[] = [
  { id: 1, name: "Lucas Martins", age: 14, category: "Sub-15", responsible: "Ana Martins", status: "Ativo" },
  { id: 2, name: "Sofia Costa", age: 12, category: "Sub-13", responsible: "Carlos Costa", status: "Ativo" },
  { id: 3, name: "Pedro Alves", age: 10, category: "Sub-11", responsible: "Juliana Alves", status: "Ativo" },
  { id: 4, name: "Maria Oliveira", age: 16, category: "Sub-17", responsible: "Roberto Oliveira", status: "Inativo" },
  { id: 5, name: "João Santos", age: 14, category: "Sub-15", responsible: "Patrícia Santos", status: "Ativo" },
  { id: 6, name: "Isabela Lima", age: 11, category: "Sub-13", responsible: "Fernando Lima", status: "Ativo" },
];

const categories = ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Adulto"];

const AdminAlunos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>(initialStudents);
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
    setEditItem(s);
    setFormName(s.name);
    setFormAge(String(s.age));
    setFormCategory(s.category);
    setFormResponsible(s.responsible);
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formAge || !formCategory || !formResponsible) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (editItem) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editItem.id
            ? { ...s, name: formName, age: Number(formAge), category: formCategory, responsible: formResponsible }
            : s
        )
      );
      toast({ title: "Aluno atualizado!" });
    } else {
      setStudents((prev) => [
        ...prev,
        { id: Date.now(), name: formName, age: Number(formAge), category: formCategory, responsible: formResponsible, status: "Ativo" as const },
      ]);
      toast({ title: "Aluno cadastrado!" });
    }
    setFormOpen(false);
    resetForm();
  };

  const handleDelete = (id: number) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Aluno removido" });
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
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
              <DialogHeader>
                <DialogTitle>{editItem ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input placeholder="Nome completo" value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Idade</Label>
                  <Input type="number" placeholder="Idade" value={formAge} onChange={(e) => setFormAge(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Input placeholder="Nome do responsável" value={formResponsible} onChange={(e) => setFormResponsible(e.target.value)} />
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

      <main className="space-y-3 px-4 pb-24 pt-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar aluno ou categoria..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <AnimatePresence>
          {filtered.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-card"
            >
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

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum aluno encontrado.</p>
        )}
      </main>
    </PageTransition>
  );
};

export default AdminAlunos;
