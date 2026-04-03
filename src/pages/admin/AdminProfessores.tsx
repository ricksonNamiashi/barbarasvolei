import { useState, useRef, useCallback } from "react";
import { Plus, Pencil, Trash2, ArrowLeft, Save, X, Camera, GripVertical } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  useReorderProfessors,
  uploadProfessorPhoto,
  Professor,
} from "@/hooks/use-professors";
import { toast } from "@/hooks/use-toast";

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

const ProfessorCard = ({
  prof,
  onEdit,
  onDelete,
}: {
  prof: Professor;
  onEdit: (p: Professor) => void;
  onDelete: (id: string) => void;
}) => (
  <Reorder.Item
    value={prof}
    id={prof.id}
    className="cursor-grab active:cursor-grabbing"
    whileDrag={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
  >
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex items-center self-center text-muted-foreground/50 touch-none">
          <GripVertical size={18} />
        </div>
        <Avatar className="h-12 w-12 shrink-0">
          {prof.photo_url ? <AvatarImage src={prof.photo_url} alt={prof.name} /> : null}
          <AvatarFallback className="bg-primary/10 font-display text-sm font-bold text-primary">
            {prof.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-card-foreground">{prof.name}</p>
          <p className="text-xs text-muted-foreground">{prof.role}</p>
          {prof.categories?.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {prof.categories.map((c) => (
                <Badge key={c} variant="secondary" className="text-[10px]">
                  {c}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(prof)}>
            <Pencil size={14} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                <Trash2 size={14} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover professor?</AlertDialogTitle>
                <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(prof.id)}>Remover</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  </Reorder.Item>
);

const AdminProfessores = () => {
  const { data: professors = [], isLoading } = useProfessors();
  const createMut = useCreateProfessor();
  const updateMut = useUpdateProfessor();
  const deleteMut = useDeleteProfessor();
  const reorderMut = useReorderProfessors();

  const [orderedProfs, setOrderedProfs] = useState<Professor[]>([]);
  const [hasLocalOrder, setHasLocalOrder] = useState(false);

  // Sync server data to local state when not dragging
  const displayProfs = hasLocalOrder ? orderedProfs : professors;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<ProfessorForm>(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReorder = useCallback(
    (newOrder: Professor[]) => {
      setOrderedProfs(newOrder);
      setHasLocalOrder(true);
    },
    []
  );

  const saveOrder = useCallback(() => {
    if (!hasLocalOrder) return;
    const ids = orderedProfs.map((p) => p.id);
    reorderMut.mutate(ids, {
      onSuccess: () => {
        setHasLocalOrder(false);
        toast({ title: "Ordem salva com sucesso" });
      },
    });
  }, [hasLocalOrder, orderedProfs, reorderMut]);

  const handleEdit = (p: Professor) => {
    setEditingId(p.id);
    setForm(toForm(p));
    setPhotoPreview(p.photo_url || null);
    setPhotoFile(null);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyForm);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagem muito grande (máx 5MB)", variant: "destructive" });
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const nextOrder = professors.length;
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

    setUploading(true);
    try {
      if (editingId) {
        let photo_url: string | undefined;
        if (photoFile) {
          photo_url = await uploadProfessorPhoto(photoFile, editingId);
        }
        await updateMut.mutateAsync({ id: editingId, ...payload, ...(photo_url ? { photo_url } : {}) });
      } else {
        const tempId = crypto.randomUUID();
        const photo_url = photoFile ? await uploadProfessorPhoto(photoFile, tempId) : null;
        await createMut.mutateAsync({ ...payload, photo_url, display_order: nextOrder });
      }
      handleCancel();
    } catch {
      // Error handled by mutation
    } finally {
      setUploading(false);
    }
  };

  const set = (key: keyof ProfessorForm, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const isFormOpen = isAdding || editingId;

  return (
    <PageTransition>
      <div className="space-y-4 p-4 pb-8">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground">Professores</h1>
          </div>
          <div className="flex gap-2">
            {hasLocalOrder && (
              <Button
                size="sm"
                variant="outline"
                onClick={saveOrder}
                disabled={reorderMut.isPending}
              >
                <Save size={14} className="mr-1" />
                {reorderMut.isPending ? "Salvando..." : "Salvar ordem"}
              </Button>
            )}
            {!isFormOpen && (
              <Button
                size="sm"
                onClick={() => {
                  setIsAdding(true);
                  setForm(emptyForm);
                  setEditingId(null);
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
              >
                <Plus size={16} className="mr-1" /> Adicionar
              </Button>
            )}
          </div>
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
                  {/* Photo upload */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted transition-colors hover:border-primary"
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <Camera size={24} className="text-muted-foreground group-hover:text-primary" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <Camera size={18} className="text-primary" />
                      </div>
                    </button>
                    <p className="text-xs text-muted-foreground">
                      Clique para adicionar uma foto do professor (máx 5MB)
                    </p>
                  </div>

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
                      disabled={createMut.isPending || updateMut.isPending || uploading}
                    >
                      <Save size={14} className="mr-1" />
                      {uploading ? "Enviando..." : "Salvar"}
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

        {/* Reorderable list */}
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Carregando...</p>
        ) : displayProfs.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Nenhum professor cadastrado.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              <GripVertical size={12} className="mr-1 inline" />
              Arraste para reordenar
            </p>
            <Reorder.Group
              axis="y"
              values={displayProfs}
              onReorder={handleReorder}
              className="space-y-3"
            >
              {displayProfs.map((p) => (
                <ProfessorCard
                  key={p.id}
                  prof={p}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteMut.mutate(id)}
                />
              ))}
            </Reorder.Group>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default AdminProfessores;
