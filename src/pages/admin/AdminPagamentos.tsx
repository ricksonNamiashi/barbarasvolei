import { useState } from "react";
import { ArrowLeft, Plus, Search, CheckCircle2, Clock, AlertCircle, Trash2, Check, Users } from "lucide-react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import PageTransition from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAllPayments, useCreatePayment, useUpdatePaymentStatus, useDeletePayment, useAllProfiles, useBulkCreatePayments } from "@/hooks/use-payments-admin";
import { useStudents } from "@/hooks/use-students";
import { Checkbox } from "@/components/ui/checkbox";

const statusConfig = {
  paid: { icon: CheckCircle2, label: "Pago", color: "text-green-600", bg: "bg-green-50" },
  pending: { icon: Clock, label: "Pendente", color: "text-primary", bg: "bg-primary/5" },
  overdue: { icon: AlertCircle, label: "Atrasado", color: "text-destructive", bg: "bg-destructive/5" },
} as const;

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const paymentSchema = z.object({
  user_id: z.string().uuid("Selecione um aluno válido"),
  month: z.string().trim().min(3, "Mês deve ter ao menos 3 caracteres").max(50, "Mês muito longo"),
  amount: z.number({ invalid_type_error: "Valor inválido" }).min(1, "Valor mínimo: R$ 1").max(50000, "Valor máximo: R$ 50.000"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de vencimento inválida"),
});

const bulkPaymentSchema = z.object({
  month: z.string().trim().min(3, "Mês deve ter ao menos 3 caracteres").max(50, "Mês muito longo"),
  amount: z.number({ invalid_type_error: "Valor inválido" }).min(1, "Valor mínimo: R$ 1").max(50000, "Valor máximo: R$ 50.000"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de vencimento inválida"),
  userIds: z.array(z.string().uuid()).min(1, "Selecione ao menos um aluno"),
});

const AdminPagamentos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: payments = [], isLoading } = useAllPayments();
  const { data: students = [] } = useStudents();
  const { data: profiles = [] } = useAllProfiles();
  const createMutation = useCreatePayment();
  const updateStatusMutation = useUpdatePaymentStatus();
  const deleteMutation = useDeletePayment();
  const bulkMutation = useBulkCreatePayments();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [formUserId, setFormUserId] = useState("");
  const [formMonth, setFormMonth] = useState("");
  const [formAmount, setFormAmount] = useState("250");
  const [formDueDate, setFormDueDate] = useState("");

  // Bulk generation
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkMonth, setBulkMonth] = useState("");
  const [bulkAmount, setBulkAmount] = useState("250");
  const [bulkDueDate, setBulkDueDate] = useState("");
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);

  // For "mark as paid" confirmation
  const [confirmPayId, setConfirmPayId] = useState<string | null>(null);

  const resetForm = () => {
    setFormUserId("");
    setFormMonth("");
    setFormAmount("250");
    setFormDueDate("");
  };

  const handleCreate = async () => {
    const result = paymentSchema.safeParse({
      user_id: formUserId,
      month: formMonth,
      amount: Number(formAmount),
      due_date: formDueDate,
    });
    if (!result.success) {
      toast({ title: result.error.issues[0].message, variant: "destructive" });
      return;
    }
    try {
      await createMutation.mutateAsync({ user_id: result.data.user_id, month: result.data.month, amount: result.data.amount, due_date: result.data.due_date });
      toast({ title: "Mensalidade adicionada!" });
      setFormOpen(false);
      resetForm();
    } catch {
      toast({ title: "Erro ao criar mensalidade", variant: "destructive" });
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id,
        status: "paid",
        paid_date: format(new Date(), "yyyy-MM-dd"),
      });
      toast({ title: "Pagamento confirmado!" });
      setConfirmPayId(null);
    } catch {
      toast({ title: "Erro ao confirmar pagamento", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Pagamento removido" });
    } catch {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  const resetBulkForm = () => {
    setBulkMonth("");
    setBulkAmount("250");
    setBulkDueDate("");
    setBulkSelectedIds(profiles.map((p) => p.id));
  };

  const handleBulkCreate = async () => {
    const result = bulkPaymentSchema.safeParse({
      month: bulkMonth,
      amount: Number(bulkAmount),
      due_date: bulkDueDate,
      userIds: bulkSelectedIds,
    });
    if (!result.success) {
      toast({ title: result.error.issues[0].message, variant: "destructive" });
      return;
    }
    try {
      await bulkMutation.mutateAsync({
        userIds: result.data.userIds,
        month: result.data.month,
        amount: result.data.amount,
        due_date: result.data.due_date,
      });
      toast({ title: `${result.data.userIds.length} mensalidade(s) gerada(s)!` });
      setBulkOpen(false);
    } catch {
      toast({ title: "Erro ao gerar mensalidades em lote", variant: "destructive" });
    }
  };

  const toggleBulkId = (id: string) => {
    setBulkSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = payments.filter((p) => {
    const matchSearch =
      p.profile_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.month.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const overdueCount = payments.filter((p) => p.status === "overdue").length;

  // Use all profiles for the individual payment form
  const userOptions = profiles.map((p) => ({ id: p.id, name: p.name }));

  return (
    <PageTransition>
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate("/admin")} className="text-muted-foreground">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold text-foreground">Pagamentos</h1>
            <p className="text-xs text-muted-foreground">
              {pendingCount} pendente(s) · {overdueCount} atrasado(s)
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => { resetBulkForm(); setBulkOpen(true); }} className="gap-1">
                  <Users size={16} /> Lote
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Gerar Mensalidades em Lote</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Mês de Referência</Label>
                    <Input placeholder="Ex: Março 2026" value={bulkMonth} onChange={(e) => setBulkMonth(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input type="number" value={bulkAmount} onChange={(e) => setBulkAmount(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Vencimento</Label>
                    <Input type="date" value={bulkDueDate} onChange={(e) => setBulkDueDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Alunos ({bulkSelectedIds.length}/{profiles.length})</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() =>
                          setBulkSelectedIds(
                            bulkSelectedIds.length === profiles.length ? [] : profiles.map((p) => p.id)
                          )
                        }
                      >
                        {bulkSelectedIds.length === profiles.length ? "Desmarcar todos" : "Selecionar todos"}
                      </Button>
                    </div>
                    <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                      {profiles.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-muted cursor-pointer">
                          <Checkbox
                            checked={bulkSelectedIds.includes(p.id)}
                            onCheckedChange={() => toggleBulkId(p.id)}
                          />
                          {p.name}
                        </label>
                      ))}
                      {profiles.length === 0 && (
                        <p className="text-xs text-muted-foreground py-2 text-center">Nenhum aluno cadastrado.</p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
                  <Button size="sm" onClick={handleBulkCreate} disabled={bulkMutation.isPending}>
                    {bulkMutation.isPending ? "Gerando..." : `Gerar ${bulkSelectedIds.length} mensalidade(s)`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => { resetForm(); setFormOpen(true); }} className="gap-1">
                  <Plus size={16} /> Nova
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-[360px]">
              <DialogHeader>
                <DialogTitle>Nova Mensalidade</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Aluno</Label>
                  {userOptions.length > 0 ? (
                    <Select value={formUserId} onValueChange={setFormUserId}>
                      <SelectTrigger><SelectValue placeholder="Selecione o aluno" /></SelectTrigger>
                      <SelectContent>
                        {userOptions.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <Input placeholder="ID do usuário" value={formUserId} onChange={(e) => setFormUserId(e.target.value)} />
                      <p className="text-[10px] text-muted-foreground">Nenhum aluno com pagamentos encontrado. Informe o ID do usuário.</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Mês de Referência</Label>
                  <Input placeholder="Ex: Março 2026" value={formMonth} onChange={(e) => setFormMonth(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data de Vencimento</Label>
                  <Input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
                <Button size="sm" onClick={handleCreate}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="space-y-3 px-4 pb-24 pt-4">
        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar aluno ou mês..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="overdue">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>}

        <AnimatePresence>
          {filtered.map((p, i) => {
            const config = statusConfig[p.status as keyof typeof statusConfig] ?? statusConfig.pending;
            const Icon = config.icon;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-border bg-card p-3 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                    <Icon size={18} className={config.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-card-foreground truncate">
                      {p.profile_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.month}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Vencimento: {p.due_date}
                      {p.paid_date && ` · Pago em: ${p.paid_date}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-card-foreground">{formatCurrency(p.amount)}</p>
                    <Badge variant="secondary" className={`text-[10px] ${config.color}`}>
                      {config.label}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-2 flex items-center justify-end gap-1 border-t border-border pt-2">
                  {p.status !== "paid" && (
                    confirmPayId === p.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Confirmar?</span>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-green-600" onClick={() => handleMarkPaid(p.id)}>
                          <Check size={14} className="mr-1" /> Sim
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setConfirmPayId(null)}>
                          Não
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-green-600" onClick={() => setConfirmPayId(p.id)}>
                        <CheckCircle2 size={14} /> Marcar Pago
                      </Button>
                    )
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!isLoading && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum pagamento encontrado.</p>
        )}
      </main>
    </PageTransition>
  );
};

export default AdminPagamentos;
