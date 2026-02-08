import { CheckCircle2, Clock, AlertCircle, CreditCard, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";

type PaymentStatus = "paid" | "pending" | "overdue";

interface Payment {
  id: number;
  month: string;
  amount: string;
  dueDate: string;
  status: PaymentStatus;
  paidDate?: string;
}

const payments: Payment[] = [
  { id: 1, month: "Fevereiro 2026", amount: "R$ 250,00", dueDate: "10/02/2026", status: "pending" },
  { id: 2, month: "Janeiro 2026", amount: "R$ 250,00", dueDate: "10/01/2026", status: "paid", paidDate: "08/01/2026" },
  { id: 3, month: "Dezembro 2025", amount: "R$ 250,00", dueDate: "10/12/2025", status: "paid", paidDate: "09/12/2025" },
  { id: 4, month: "Novembro 2025", amount: "R$ 250,00", dueDate: "10/11/2025", status: "paid", paidDate: "10/11/2025" },
  { id: 5, month: "Outubro 2025", amount: "R$ 250,00", dueDate: "10/10/2025", status: "paid", paidDate: "07/10/2025" },
];

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

const Pagamentos = () => {
  const totalPending = payments.filter((p) => p.status === "pending").length;

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
                R$ 250,00
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
          <div className="space-y-2">
            {payments.map((payment, i) => {
              const config = statusConfig[payment.status];
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
                      Vencimento: {payment.dueDate}
                    </p>
                    {payment.paidDate && (
                      <p className="text-[10px] text-muted-foreground">
                        Pago em: {payment.paidDate}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-card-foreground">
                      {payment.amount}
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
        </section>
      </main>
    </PageTransition>
  );
};

export default Pagamentos;
