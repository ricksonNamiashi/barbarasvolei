import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowLeft, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PageTransition from "@/components/PageTransition";
import {
  useProfessors,
  useCreateProfessor,
  useUpdateProfessor,
  useDeleteProfessor,
  Professor,
} from "@/hooks/use-professors";

interface ProfessorForm {
  name: string;
  role: string;
  formation: string;
  experience: string;
  bio: string;
  initials: string;
  categories: string;
}

const emptyForm: ProfessorForm = {
  name: "",
  role: "Treinador",
  formation: "",
  experience: "",
  bio: "",
  initials: "",
  categories: "",
};

const toForm = (p: Professor): ProfessorForm => ({
  name: p.name,
  role: p.role,
  formation: p.formation || "",
  experience: p.experience || "",
  bio: p.bio || "",
  initials: p.initials,
  categories: (p.categories || []).join(", "),
});

const AdminProfessores = () => {
  const { data: professors = [], isLoading } = useProfessors();
  const createMut = useCreateProfessor();
  const updateMut = useUpdateProfessor();
  const deleteMut = useDeleteProfessor();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<ProfessorForm>(emptyForm);

  const handleEdit = (p: Professor) => {
    setEditingId(p.id);
    setForm(toForm(p));
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyForm);
  };

  const handleSave = () => {
    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      formation: form.formation.trim() || null,
      experience: form.experience.trim() || null,
      bio: form.bio.trim() || null,
      initials: form.initials.trim().toUpperCase(),
      categories: form.categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    };

    if (!payload.name || !payload.initials) return;

    if (editingId) {
      updateMut.mutate({ id: editingId, ...payload }, { onSuccess: handleCancel });
    } else {
      createMut.mutate(payload, { onSuccess: handleCancel });
    }
  };

  const set = (key: keyof ProfessorForm, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const isFormOpen = isAdding || editingId;

  return (
    <PageTransition>
      <div className="space-y-4 p-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground">
              Professores
            </h1>
          </div>
          {!isFormOpen && (
            <Button
              size="sm"
              onClick={() => {
                setIsAdding(true);
                setForm(emptyForm);
                setEditingId(null);
              }}
            >
              <Plus size={16} className="mr-1" /> Adicionar
            </Button>
          )}
        </div>

        {/* Form */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {editingId ? "Editar Professor" : "Novo Professor"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Iniciais"
                      value={form.initials}
                      onChange={(e) => set("initials", e.target.value)}
                      maxLength={3}
                      className="col-span-1"
                    />
                    <Input
                      placeholder="Nome completo"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className="col-span-2"
                    />
                  </div>
                  <Input
                    placeholder="Cargo (ex: Head Coach)"
                    value={form.role}
                    onChange={(e) => set("role", e.target.value)}
                  />
                  <Input
                    placeholder="Formação"
                    value={form.formation}
                    onChange={(e) => set("formation", e.target.value)}
                  />
                  <Input
                    placeholder="Experiência"
                    value={form.experience}
                    onChange={(e) => set("experience", e.target.value)}
                  />
                  <Input
                    placeholder="Categorias (separadas por vírgula)"
                    value={form.categories}
                    onChange={(e) => set("categories", e.target.value)}
                  />
                  <Textarea
                    placeholder="Biografia"
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={createMut.isPending || updateMut.isPending}
                    >
                      <Save size={14} className="mr-1" /> Salvar
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X size={14} className="mr-1" /> Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Carregando...</p>
        ) : professors.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Nenhum professor cadastrado.
          </p>
        ) : (
          professors.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                  {p.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-card-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.role}</p>
                  {p.categories?.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {p.categories.map((c) => (
                        <Badge key={c} variant="secondary" className="text-[10px]">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleEdit(p)}
                  >
                    <Pencil size={14} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover professor?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMut.mutate(p.id)}
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageTransition>
  );
};

export default AdminProfessores;
