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
  created_at: string;
}

export const useProfessors = () => {
  return useQuery({
    queryKey: ["professors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professors" as any)
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as Professor[];
    },
  });
};

export const useCreateProfessor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prof: Omit<Professor, "id" | "created_at">) => {
      const { error } = await supabase.from("professors" as any).insert([prof] as any);
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
      const { error } = await supabase.from("professors" as any).update(updates as any).eq("id", id);
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
      const { error } = await supabase.from("professors" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["professors"] });
      toast({ title: "Professor removido com sucesso" });
    },
    onError: () => toast({ title: "Erro ao remover professor", variant: "destructive" }),
  });
};
