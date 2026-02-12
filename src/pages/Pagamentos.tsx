import { CheckCircle2, Clock, AlertCircle, CreditCard, QrCode, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { usePayments } from "@/hooks/use-payments";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type PaymentStatus = "paid" | "pending" | "overdue";

const statusConfig: Record<PaymentStatus, { icon: typeof CheckCircle2; label: string; color: string; bg: string }> = {
  paid: {
    icon: CheckCircle2,
    label: "Pago",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  pending: {
    icon: Clock,
    label: "Pendente",
    color: "text-primary",
    bg: "bg-primary/5",
  },
  overdue: {
    icon: AlertCircle,
    label: "Atrasado",
    color: "text-destructive",
    bg: "bg-destructive/5",
  },
};

const formatDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy");
  } catch {
    return dateStr;
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

const Pagamentos = () => {
  const { data: payments = [], isLoading } = usePayments();

  const totalPending = payments.filter((p) => p.status === "pending").length;
  const currentAmount = payments.length > 0 ? payments[0].amount : 250;

  return (
    <PageTransition>
      <Header title="Pagamentos" subtitle="Mensalidades" />

      <main className="space-y-4 px-4 pb-24 pt-4">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl gradient-hero p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-foreground/80">Mensalidade Atual</p>
              <p className="mt-1 font-display text-3xl font-bold text-primary-foreground">
                {formatCurrency(currentAmount)}
              </p>
              <p className="mt-1 text-xs text-primary-foreground/70">
                {totalPending} pagamento(s) pendente(s)
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/20">
              <CreditCard size={28} className="text-primary-foreground" />
            </div>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <section>
          <h3 className="mb-3 font-display text-sm font-bold text-foreground">
            Formas de Pagamento
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-card">
              <QrCode size={20} className="text-primary" />
              <div>
                <p className="text-xs font-semibold text-card-foreground">Pix</p>
                <p className="text-[10px] text-muted-foreground">Instantâneo</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-card">
              <CreditCard size={20} className="text-primary" />
              <div>
                <p className="text-xs font-semibold text-card-foreground">Cartão</p>
                <p className="text-[10px] text-muted-foreground">Crédito/Débito</p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment History */}
        <section>
          <h3 className="mb-3 font-display text-sm font-bold text-foreground">
            Histórico
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhum pagamento encontrado.
            </p>
          ) : (
            <div className="space-y-2">
              {payments.map((payment, i) => {
                const status = (payment.status as PaymentStatus) || "pending";
                const config = statusConfig[status] ?? statusConfig.pending;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-card"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                      <Icon size={18} className={config.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-card-foreground">
                        {payment.month}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vencimento: {formatDate(payment.due_date)}
                      </p>
                      {payment.paid_date && (
                        <p className="text-[10px] text-muted-foreground">
                          Pago em: {formatDate(payment.paid_date)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-card-foreground">
                        {formatCurrency(payment.amount)}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.bg} ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </PageTransition>
  );
};

export default Pagamentos;
