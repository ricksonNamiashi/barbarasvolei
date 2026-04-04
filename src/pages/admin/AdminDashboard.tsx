import { Calendar, Bell, Users, CreditCard, ArrowRight, TrendingUp, DollarSign, AlertCircle, Clock, ShieldAlert, Send, Download, FileText, GraduationCap, Activity, Zap, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import PageTransition from "@/components/PageTransition";
import NotificationBell from "@/components/NotificationBell";
import { useAllPayments } from "@/hooks/use-payments-admin";
import { useStudents } from "@/hooks/use-students";
import { useNotices } from "@/hooks/use-notices";
import { useSchedules } from "@/hooks/use-schedules";
import { useTriggerOverdueNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { exportCSV, exportPDF } from "@/utils/export-financial-report";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const menuItems = [
  {
    label: "Gerenciar Horários",
    description: "Criar, editar e remover treinos",
    icon: Calendar,
    to: "/admin/horarios",
    gradient: "from-primary/20 to-secondary/10",
  },
  {
    label: "Gerenciar Avisos",
    description: "Enviar comunicados e alertas",
    icon: Bell,
    to: "/admin/avisos",
    gradient: "from-accent/20 to-primary/10",
  },
  {
    label: "Gerenciar Alunos",
    description: "Cadastro e informações de alunos",
    icon: Users,
    to: "/admin/alunos",
    gradient: "from-secondary/20 to-accent/10",
  },
  {
    label: "Gerenciar Pagamentos",
    description: "Mensalidades e cobranças",
    icon: CreditCard,
    to: "/admin/pagamentos",
    gradient: "from-primary/15 to-accent/15",
  },
  {
    label: "Gerenciar Professores",
    description: "Equipe técnica e treinadores",
    icon: GraduationCap,
    to: "/admin/professores",
    gradient: "from-accent/15 to-secondary/15",
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [exportPeriod, setExportPeriod] = useState("all");
  const { data: payments = [] } = useAllPayments();
  const { data: students = [] } = useStudents();
  const { data: notices = [] } = useNotices();
  const { data: schedules = [] } = useSchedules();
  const triggerNotifications = useTriggerOverdueNotifications();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const activeStudents = students.filter((s) => s.status === "Ativo").length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const overduePayments = payments.filter((p) => p.status === "overdue").length;

  const stats = [
    { label: "Alunos Ativos", value: String(activeStudents), icon: Users, color: "text-primary", bgGradient: "from-primary/15 to-primary/5", iconBg: "bg-primary/20" },
    { label: "Treinos/Semana", value: String(schedules.length), icon: Activity, color: "text-secondary", bgGradient: "from-secondary/15 to-secondary/5", iconBg: "bg-secondary/20" },
    { label: "Pendentes", value: String(pendingPayments), icon: Clock, color: "text-accent", bgGradient: "from-accent/15 to-accent/5", iconBg: "bg-accent/20" },
    { label: "Atrasados", value: String(overduePayments), icon: AlertCircle, color: "text-destructive", bgGradient: "from-destructive/15 to-destructive/5", iconBg: "bg-destructive/20" },
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

  const filteredPayments = useMemo(() => {
    if (exportPeriod === "all") return payments;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const periodsMap: Record<string, number> = { "1m": 1, "3m": 3, "6m": 6, "12m": 12 };
    const months = periodsMap[exportPeriod] ?? 0;
    if (months === 0) return payments;
    const cutoff = new Date(currentYear, currentMonth - months + 1, 1);
    return payments.filter((p) => new Date(p.due_date) >= cutoff);
  }, [payments, exportPeriod]);

  const filteredFinancial = useMemo(() => {
    const totalReceived = filteredPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
    const totalPending = filteredPayments.filter((p) => p.status === "pending" || p.status === "overdue").reduce((s, p) => s + p.amount, 0);
    const overdueTotal = filteredPayments.filter((p) => p.status === "overdue").reduce((s, p) => s + p.amount, 0);
    const overdueCount = filteredPayments.filter((p) => p.status === "overdue").length;
    const delinquencyRate = filteredPayments.length > 0 ? (overdueCount / filteredPayments.length) * 100 : 0;
    return { totalReceived, totalPending, overdueTotal, delinquencyRate };
  }, [filteredPayments]);

  return (
    <PageTransition>
      {/* Header with gradient accent */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="relative overflow-hidden">
          {/* Subtle gradient accent line */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] gradient-hero opacity-60" />
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero shadow-md">
                  <Zap size={16} className="text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-display text-lg font-bold text-foreground tracking-tight">Painel Admin</h1>
                  <p className="text-[10px] text-muted-foreground font-medium">Gestão da escola</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-muted/80 active:scale-90"
                title={theme === "dark" ? "Modo claro" : "Modo escuro"}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <NotificationBell />
              <button
                onClick={() => navigate("/")}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 px-3 text-xs font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
              >
                Ver App
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="space-y-5 px-4 pb-24 pt-4">
        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
              className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${stat.bgGradient} p-4 shadow-card`}
            >
              {/* Decorative circle */}
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-gradient-to-br from-background/40 to-transparent" />
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.iconBg} mb-2`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <p className="font-display text-3xl font-bold text-foreground leading-none">{stat.value}</p>
              <p className="text-[10px] font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Financial Summary - Enhanced */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 150 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                <TrendingUp size={14} className="text-primary" />
              </div>
              Resumo Financeiro
            </h3>
            <div className="flex items-center gap-1.5">
              <Select value={exportPeriod} onValueChange={setExportPeriod}>
                <SelectTrigger className="h-7 w-[90px] text-[10px] border-border rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tudo</SelectItem>
                  <SelectItem value="1m">Último mês</SelectItem>
                  <SelectItem value="3m">3 meses</SelectItem>
                  <SelectItem value="6m">6 meses</SelectItem>
                  <SelectItem value="12m">12 meses</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => exportCSV(filteredPayments)}
                className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground transition-all hover:bg-muted/80 active:scale-95"
              >
                <Download size={12} /> CSV
              </button>
              <button
                onClick={() => exportPDF(filteredPayments, filteredFinancial)}
                className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-[10px] font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
              >
                <FileText size={12} /> PDF
              </button>
            </div>
          </div>

          {/* Financial cards with improved styling */}
          <div className="grid grid-cols-3 gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-card"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 to-green-400 opacity-80" />
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-green-500/15">
                  <DollarSign size={10} className="text-green-600" />
                </div>
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Recebido</span>
              </div>
              <p className="font-display text-sm font-bold text-green-600 leading-tight">
                {formatCurrency(financial.totalReceived)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-card"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-secondary opacity-80" />
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/15">
                  <Clock size={10} className="text-primary" />
                </div>
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">A receber</span>
              </div>
              <p className="font-display text-sm font-bold text-primary leading-tight">
                {formatCurrency(financial.totalPending)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-card"
            >
              <div className={`absolute inset-x-0 top-0 h-1 ${financial.delinquencyRate > 0 ? "bg-gradient-to-r from-destructive to-red-400" : "bg-gradient-to-r from-green-500 to-green-400"} opacity-80`} />
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`flex h-5 w-5 items-center justify-center rounded-md ${financial.delinquencyRate > 0 ? "bg-destructive/15" : "bg-green-500/15"}`}>
                  <ShieldAlert size={10} className={financial.delinquencyRate > 0 ? "text-destructive" : "text-green-600"} />
                </div>
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Inadimpl.</span>
              </div>
              <p className={`font-display text-sm font-bold leading-tight ${financial.delinquencyRate > 0 ? "text-destructive" : "text-green-600"}`}>
                {financial.delinquencyRate.toFixed(1)}%
              </p>
              <p className="text-[8px] text-muted-foreground mt-0.5">
                {financial.overdueCount} de {payments.length}
              </p>
            </motion.div>
          </div>

          {/* Overdue notification button */}
          {financial.overdueCount > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
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
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-gradient-to-r from-destructive/10 to-destructive/5 p-3.5 text-xs font-bold text-destructive transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Send size={14} />
              {triggerNotifications.isPending
                ? "Enviando..."
                : `Notificar ${financial.overdueCount} inadimplentes`}
            </motion.button>
          )}

          {/* Chart - Enhanced */}
          {financial.chartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-card"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-foreground">Pagamentos por Mês</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "hsl(142, 71%, 45%)" }} />
                    <span className="text-[9px] text-muted-foreground font-medium">Pago</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-[9px] text-muted-foreground font-medium">Pendente</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={financial.chartData} barGap={2}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
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
                      borderRadius: 12,
                      fontSize: 11,
                      boxShadow: "0 8px 24px -8px hsl(var(--foreground) / 0.1)",
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === "paid" ? "Pago" : "Pendente",
                    ]}
                    labelStyle={{ fontWeight: 700, color: "hsl(var(--foreground))" }}
                    cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  />
                  <Bar dataKey="paid" stackId="a" radius={[0, 0, 4, 4]} fill="hsl(142, 71%, 45%)" name="paid" />
                  <Bar dataKey="pending" stackId="a" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" name="pending" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </motion.section>

        {/* Menu - Enhanced */}
        <section>
          <h3 className="mb-3 font-display text-base font-bold text-foreground flex items-center gap-2">
            <div className="h-5 w-1 rounded-full gradient-hero" />
            Gerenciamento
          </h3>
          <div className="space-y-2">
            {menuItems.map((item, i) => (
              <motion.button
                key={item.to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.07, type: "spring", stiffness: 200 }}
                onClick={() => navigate(item.to)}
                className={`group flex w-full items-center gap-3 rounded-2xl border border-border bg-gradient-to-r ${item.gradient} p-4 shadow-card transition-all active:scale-[0.97] hover:shadow-elevated`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-hero shadow-md transition-transform group-active:scale-95">
                  <item.icon size={20} className="text-primary-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-card-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-background/60 transition-transform group-hover:translate-x-0.5">
                  <ArrowRight size={14} className="text-muted-foreground" />
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      </main>
    </PageTransition>
  );
};

export default AdminDashboard;
