import { Calendar, Bell, Users, CreditCard, ArrowRight, TrendingUp, DollarSign, AlertCircle, Clock, ShieldAlert, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import PageTransition from "@/components/PageTransition";
import NotificationBell from "@/components/NotificationBell";
import { useAllPayments } from "@/hooks/use-payments-admin";
import { useStudents } from "@/hooks/use-students";
import { useNotices } from "@/hooks/use-notices";
import { useSchedules } from "@/hooks/use-schedules";
import { useTriggerOverdueNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const menuItems = [
  {
    label: "Gerenciar Horários",
    description: "Criar, editar e remover treinos",
    icon: Calendar,
    to: "/admin/horarios",
  },
  {
    label: "Gerenciar Avisos",
    description: "Enviar comunicados e alertas",
    icon: Bell,
    to: "/admin/avisos",
  },
  {
    label: "Gerenciar Alunos",
    description: "Cadastro e informações de alunos",
    icon: Users,
    to: "/admin/alunos",
  },
  {
    label: "Gerenciar Pagamentos",
    description: "Mensalidades e cobranças",
    icon: CreditCard,
    to: "/admin/pagamentos",
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: payments = [] } = useAllPayments();
  const { data: students = [] } = useStudents();
  const { data: notices = [] } = useNotices();
  const { data: schedules = [] } = useSchedules();
  const triggerNotifications = useTriggerOverdueNotifications();
  const { toast } = useToast();

  const activeStudents = students.filter((s) => s.status === "Ativo").length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const overduePayments = payments.filter((p) => p.status === "overdue").length;

  const stats = [
    { label: "Alunos Ativos", value: String(activeStudents), icon: Users, color: "text-primary" },
    { label: "Treinos/Semana", value: String(schedules.length), icon: Calendar, color: "text-secondary" },
    { label: "Pendentes", value: String(pendingPayments), icon: Clock, color: "text-primary" },
    { label: "Atrasados", value: String(overduePayments), icon: AlertCircle, color: "text-destructive" },
  ];

  // Financial summary
  const financial = useMemo(() => {
    const totalReceived = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments
      .filter((p) => p.status === "pending" || p.status === "overdue")
      .reduce((sum, p) => sum + p.amount, 0);
    const overdueTotal = payments
      .filter((p) => p.status === "overdue")
      .reduce((sum, p) => sum + p.amount, 0);
    const overdueCount = payments.filter((p) => p.status === "overdue").length;
    const totalCount = payments.length;
    const delinquencyRate = totalCount > 0 ? (overdueCount / totalCount) * 100 : 0;

    // Group by month for chart
    const monthMap = new Map<string, { paid: number; pending: number }>();
    payments.forEach((p) => {
      const key = p.month;
      const entry = monthMap.get(key) ?? { paid: 0, pending: 0 };
      if (p.status === "paid") {
        entry.paid += p.amount;
      } else {
        entry.pending += p.amount;
      }
      monthMap.set(key, entry);
    });

    const chartData = Array.from(monthMap.entries())
      .map(([month, vals]) => ({ month, ...vals }))
      .slice(-6);

    return { totalReceived, totalPending, overdueTotal, overdueCount, delinquencyRate, chartData };
  }, [payments]);

  return (
    <PageTransition>
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Painel Admin</h1>
            <p className="text-xs text-muted-foreground">Gestão da escola</p>
          </div>
          <NotificationBell />
          <button
            onClick={() => navigate("/")}
            className="flex h-9 items-center gap-1 rounded-lg bg-primary/10 px-3 text-xs font-medium text-primary"
          >
            Ver App
          </button>
        </div>
      </header>

      <main className="space-y-6 px-4 pb-24 pt-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-4 shadow-card"
            >
              <stat.icon size={18} className={stat.color} />
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] font-medium text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Financial Summary */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="mb-3 font-display text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            Resumo Financeiro
          </h3>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl border border-border bg-card p-3 shadow-card">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign size={12} className="text-green-600" />
                <span className="text-[10px] font-medium text-muted-foreground">Recebido</span>
              </div>
              <p className="font-display text-base font-bold text-green-600">
                {formatCurrency(financial.totalReceived)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-card">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={12} className="text-primary" />
                <span className="text-[10px] font-medium text-muted-foreground">A receber</span>
              </div>
              <p className="font-display text-base font-bold text-primary">
                {formatCurrency(financial.totalPending)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-card">
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldAlert size={12} className="text-destructive" />
                <span className="text-[10px] font-medium text-muted-foreground">Inadimplência</span>
              </div>
              <p className={`font-display text-base font-bold ${financial.delinquencyRate > 0 ? "text-destructive" : "text-green-600"}`}>
                {financial.delinquencyRate.toFixed(1)}%
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {financial.overdueCount} de {payments.length}
              </p>
            </div>
          </div>

          {financial.overdueCount > 0 && (
            <button
              onClick={async () => {
                try {
                  const result = await triggerNotifications.mutateAsync();
                  toast({
                    title: "Notificações enviadas",
                    description: `${result?.notified ?? 0} notificações criadas para pagamentos atrasados.`,
                  });
                } catch {
                  toast({ title: "Erro ao enviar notificações", variant: "destructive" });
                }
              }}
              disabled={triggerNotifications.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs font-semibold text-destructive transition-colors active:bg-destructive/10 disabled:opacity-50"
            >
              <Send size={14} />
              {triggerNotifications.isPending
                ? "Enviando..."
                : `Notificar ${financial.overdueCount} inadimplentes`}
            </button>
          )}
          {/* Chart */}
          {financial.chartData.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Pagamentos por Mês</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={financial.chartData} barGap={2}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => {
                      const parts = v.split(" ");
                      return parts[0]?.substring(0, 3) ?? v;
                    }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === "paid" ? "Pago" : "Pendente",
                    ]}
                    labelStyle={{ fontWeight: 600, color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="paid" stackId="a" radius={[0, 0, 0, 0]} fill="hsl(142, 71%, 45%)" name="paid" />
                  <Bar dataKey="pending" stackId="a" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" name="pending" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
                  <span className="text-[10px] text-muted-foreground">Pago</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
                  <span className="text-[10px] text-muted-foreground">Pendente</span>
                </div>
              </div>
            </div>
          )}
        </motion.section>

        {/* Menu */}
        <section>
          <h3 className="mb-3 font-display text-base font-bold text-foreground">Gerenciamento</h3>
          <div className="space-y-2">
            {menuItems.map((item, i) => (
              <motion.button
                key={item.to}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                onClick={() => navigate(item.to)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card transition-transform active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon size={20} className="text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-card-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </section>
      </main>
    </PageTransition>
  );
};

export default AdminDashboard;
