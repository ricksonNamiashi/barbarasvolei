import { useState } from "react";
import { ArrowLeft, Plus, Search, CheckCircle2, Clock, AlertCircle, Trash2, Check } from "lucide-react";
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
import { useAllPayments, useCreatePayment, useUpdatePaymentStatus, useDeletePayment } from "@/hooks/use-payments-admin";
import { useStudents } from "@/hooks/use-students";

const statusConfig = {
  paid: { icon: CheckCircle2, label: "Pago", color: "text-green-600", bg: "bg-green-50" },
  pending: { icon: Clock, label: "Pendente", color: "text-primary", bg: "bg-primary/5" },
  overdue: { icon: AlertCircle, label: "Atrasado", color: "text-destructive", bg: "bg-destructive/5" },
} as const;

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const AdminPagamentos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: payments = [], isLoading } = useAllPayments();
  const { data: students = [] } = useStudents();
  const createMutation = useCreatePayment();
  const updateStatusMutation = useUpdatePaymentStatus();
  const deleteMutation = useDeletePayment();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [formUserId, setFormUserId] = useState("");
  const [formMonth, setFormMonth] = useState("");
  const [formAmount, setFormAmount] = useState("250");
  const [formDueDate, setFormDueDate] = useState("");

  // For "mark as paid" confirmation
  const [confirmPayId, setConfirmPayId] = useState<string | null>(null);

  const resetForm = () => {
    setFormUserId("");
    setFormMonth("");
    setFormAmount("250");
    setFormDueDate("");
  };

  const handleCreate = async () => {
    if (!formUserId || !formMonth || !formAmount || !formDueDate) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    try {
      await createMutation.mutateAsync({
        user_id: formUserId,
        month: formMonth,
        amount: Number(formAmount),
        due_date: formDueDate,
      });
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

  const filtered = payments.filter((p) => {
    const matchSearch =
      p.profile_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.month.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const overdueCount = payments.filter((p) => p.status === "overdue").length;

  // Build a list of users from profiles in payments + students for the form
  const userOptions = (() => {
    const map = new Map<string, string>();
    payments.forEach((p) => {
      if (p.profile_name) map.set(p.user_id, p.profile_name);
    });
    // Note: students table doesn't have user_id linked; we use profiles from payments
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  })();

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
