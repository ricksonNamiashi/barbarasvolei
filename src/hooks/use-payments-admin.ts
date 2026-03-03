import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminPayment {
  id: string;
  user_id: string;
  month: string;
  amount: number;
  due_date: string;
  status: string;
  paid_date: string | null;
  created_at: string;
  profile_name?: string;
}

export const useAllPayments = () => {
  return useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("due_date", { ascending: false });
      if (error) throw error;

      // Fetch profile names for each unique user_id
      const userIds = [...new Set((data ?? []).map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds);

      const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.name]));

      return (data ?? []).map((p) => ({
        ...p,
        profile_name: nameMap.get(p.user_id) ?? "Desconhecido",
      })) as AdminPayment[];
    },
  });
};

export const useCreatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: { user_id: string; month: string; amount: number; due_date: string }) => {
      const { error } = await supabase.from("payments").insert(payment);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, paid_date }: { id: string; status: string; paid_date?: string | null }) => {
      const update: Record<string, unknown> = { status };
      if (paid_date !== undefined) update.paid_date = paid_date;
      const { error } = await supabase.from("payments").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

export const useDeletePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

export const useAllProfiles = () => {
  return useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });
};

export const useBulkCreatePayments = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { userIds: string[]; month: string; amount: number; due_date: string }) => {
      const rows = params.userIds.map((user_id) => ({
        user_id,
        month: params.month,
        amount: params.amount,
        due_date: params.due_date,
      }));
      const { error } = await supabase.from("payments").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};