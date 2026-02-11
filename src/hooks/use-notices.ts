import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Notice {
  id: string;
  title: string;
  description: string;
  type: string;
  created_at: string;
}

export const useNotices = () => {
  return useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Notice[];
    },
  });
};

export const useCreateNotice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notice: { title: string; description: string; type: string }) => {
      const { error } = await supabase.from("notices").insert(notice);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notices"] }),
  });
};

export const useUpdateNotice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title: string; description: string; type: string }) => {
      const { error } = await supabase.from("notices").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notices"] }),
  });
};

export const useDeleteNotice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notices"] }),
  });
};
