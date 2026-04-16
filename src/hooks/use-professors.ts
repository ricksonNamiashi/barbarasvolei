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

  // Store the storage path (not a URL). Signed URLs are generated on demand for display.
  return path;
};

/**
 * Extract the storage path within the 'professor-photos' bucket from either
 * a stored path (new format) or a legacy public URL (old format).
 */
const extractProfessorPhotoPath = (photoUrlOrPath: string): string | null => {
  if (!photoUrlOrPath) return null;
  // Already a path (no scheme)
  if (!photoUrlOrPath.startsWith("http")) return photoUrlOrPath;
  // Legacy public URL: .../storage/v1/object/public/professor-photos/<path>
  const marker = "/professor-photos/";
  const idx = photoUrlOrPath.indexOf(marker);
  if (idx === -1) return null;
  return photoUrlOrPath.slice(idx + marker.length).split("?")[0];
};

/**
 * Generate a short-lived signed URL (1 hour) for a professor photo.
 * Accepts both stored paths and legacy public URLs.
 */
export const getProfessorPhotoSignedUrl = async (
  photoUrlOrPath: string | null
): Promise<string | null> => {
  const path = photoUrlOrPath ? extractProfessorPhotoPath(photoUrlOrPath) : null;
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("professor-photos")
    .createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
};

/**
 * Hook that resolves a list of professors' photo_url values to short-lived signed URLs.
 * Returns a map of professor.id -> signed URL.
 */
export const useProfessorPhotoUrls = (professors: Pick<Professor, "id" | "photo_url">[]) => {
  return useQuery({
    queryKey: [
      "professor-photo-signed-urls",
      professors.map((p) => `${p.id}:${p.photo_url ?? ""}`).join("|"),
    ],
    queryFn: async () => {
      const entries = await Promise.all(
        professors.map(async (p) => {
          const url = await getProfessorPhotoSignedUrl(p.photo_url);
          return [p.id, url] as const;
        })
      );
      return Object.fromEntries(entries) as Record<string, string | null>;
    },
    enabled: professors.length > 0,
    staleTime: 1000 * 60 * 50, // refresh before 1h expiry
  });
};
