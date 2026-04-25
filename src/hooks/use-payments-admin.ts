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
  receipt_url: string | null;
  created_at: string;
  profile_name?: string;
}

/**
 * Pre-flight check: ensures the current authenticated user really has the
 * `admin` role in the DB. The dev role switcher only changes the UI, NOT
 * the actual permissions, so we must verify against `user_roles` before
 * attempting any admin mutation — otherwise we get a generic 403 RLS error
 * at the very end of the flow.
 */
export const ensureAdmin = async (): Promise<{ ok: true } | { ok: false; reason: string }> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) {
    return { ok: false, reason: "Você precisa estar logado para realizar esta ação." };
  }
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) {
    return { ok: false, reason: "Não foi possível verificar suas permissões. Tente novamente." };
  }
  if (!data) {
    return {
      ok: false,
      reason:
        "Sua conta não tem permissão de administrador no banco de dados. Faça logout e entre com uma conta admin.",
    };
  }
  return { ok: true };
};

/**
 * Pre-flight: detect (user_id, month) pairs that already exist to avoid
 * generating duplicate monthly fees for the same student/month.
 */
export const findDuplicatePayments = async (
  userIds: string[],
  month: string,
): Promise<string[]> => {
  if (userIds.length === 0) return [];
  const { data, error } = await supabase
    .from("payments")
    .select("user_id")
    .eq("month", month)
    .in("user_id", userIds);
  if (error) return [];
  return (data ?? []).map((r) => r.user_id);
};

export const useAllPayments = () => {
  return useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("due_date", { ascending: false });
      if (error) throw error;

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

const friendlyError = (error: unknown, fallback: string): string => {
  const msg = (error as { message?: string; code?: string })?.message ?? "";
  const code = (error as { code?: string })?.code ?? "";
  if (code === "42501" || /row-level security|permission denied/i.test(msg)) {
    return "Permissão negada pelo banco. Confirme que sua conta é admin e refaça o login.";
  }
  if (code === "23505" || /duplicate key/i.test(msg)) {
    return "Já existe uma mensalidade igual cadastrada.";
  }
  return fallback;
};

// Exported standalone mutation functions so they can be unit-tested without
// rendering a React component / QueryClientProvider.
export const createPayment = async (payment: { user_id: string; month: string; amount: number; due_date: string }) => {
  const adminCheck = await ensureAdmin();
  if (adminCheck.ok === false) throw new Error(adminCheck.reason);
  const { error } = await supabase.from("payments").insert(payment);
  if (error) throw new Error(friendlyError(error, "Erro ao criar mensalidade."));
};

export const updatePaymentStatus = async ({ id, status, paid_date }: { id: string; status: string; paid_date?: string | null }) => {
  const adminCheck = await ensureAdmin();
  if (adminCheck.ok === false) throw new Error(adminCheck.reason);
  const update: Record<string, unknown> = { status };
  if (paid_date !== undefined) update.paid_date = paid_date;
  const { error } = await supabase.from("payments").update(update).eq("id", id);
  if (error) throw new Error(friendlyError(error, "Erro ao atualizar pagamento."));
};

export const deletePayment = async (id: string) => {
  const adminCheck = await ensureAdmin();
  if (adminCheck.ok === false) throw new Error(adminCheck.reason);
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw new Error(friendlyError(error, "Erro ao remover pagamento."));
};

export const bulkCreatePayments = async (params: { userIds: string[]; month: string; amount: number; due_date: string }) => {
  const adminCheck = await ensureAdmin();
  if (adminCheck.ok === false) throw new Error(adminCheck.reason);
  const rows = params.userIds.map((user_id) => ({
    user_id,
    month: params.month,
    amount: params.amount,
    due_date: params.due_date,
  }));
  const { error } = await supabase.from("payments").insert(rows);
  if (error) throw new Error(friendlyError(error, "Erro ao gerar mensalidades em lote."));
};

const invalidatePaymentQueries = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["admin-payments"] });
  qc.invalidateQueries({ queryKey: ["payments"] });
};

export const useCreatePayment = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createPayment, onSuccess: () => invalidatePaymentQueries(qc) });
};

export const useUpdatePaymentStatus = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: updatePaymentStatus, onSuccess: () => invalidatePaymentQueries(qc) });
};

export const useDeletePayment = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deletePayment, onSuccess: () => invalidatePaymentQueries(qc) });
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
      const adminCheck = await ensureAdmin();
      if (adminCheck.ok === false) throw new Error(adminCheck.reason);

      const rows = params.userIds.map((user_id) => ({
        user_id,
        month: params.month,
        amount: params.amount,
        due_date: params.due_date,
      }));
      const { error } = await supabase.from("payments").insert(rows);
      if (error) throw new Error(friendlyError(error, "Erro ao gerar mensalidades em lote."));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};
