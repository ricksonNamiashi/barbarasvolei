import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Professor {
  id: string;
  name: string;
  role: string;
  formation: string | null;
  experience: string | null;
  bio: string | null;
  initials: string;
  categories: string[];
  photo_url: string | null;
  display_order: number;
  created_at: string;
}

export const useProfessors = () => {
  return useQuery({
    queryKey: ["professors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professors")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as Professor[];
    },
  });
};

export const useCreateProfessor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prof: Omit<Professor, "id" | "created_at">) => {
      const { error } = await supabase.from("professors").insert([prof] as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["professors"] });
      toast({ title: "Professor adicionado com sucesso" });
    },
    onError: () => toast({ title: "Erro ao adicionar professor", variant: "destructive" }),
  });
};

export const useUpdateProfessor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Professor> & { id: string }) => {
      const { error } = await supabase.from("professors").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["professors"] });
      toast({ title: "Professor atualizado com sucesso" });
    },
    onError: () => toast({ title: "Erro ao atualizar professor", variant: "destructive" }),
  });
};

export const useDeleteProfessor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("professors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["professors"] });
      toast({ title: "Professor removido com sucesso" });
    },
    onError: () => toast({ title: "Erro ao remover professor", variant: "destructive" }),
  });
};

export const useReorderProfessors = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      // Update each professor's display_order
      const updates = orderedIds.map((id, index) =>
        supabase.from("professors").update({ display_order: index } as any).eq("id", id)
      );
      const results = await Promise.all(updates);
      const err = results.find((r) => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["professors"] });
    },
    onError: () => toast({ title: "Erro ao reordenar", variant: "destructive" }),
  });
};

export const uploadProfessorPhoto = async (file: File, professorId: string): Promise<string> => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${professorId}.${ext}`;

  await supabase.storage.from("professor-photos").remove([path]);

  const { error } = await supabase.storage
    .from("professor-photos")
    .upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from("professor-photos").getPublicUrl(path);
  return data.publicUrl;
};
