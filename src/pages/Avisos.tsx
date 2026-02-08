import { AlertTriangle, Info, PartyPopper, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";

type NoticeType = "urgent" | "info" | "event" | "general";

interface Notice {
  id: number;
  title: string;
  description: string;
  date: string;
  type: NoticeType;
}

const notices: Notice[] = [
  {
    id: 1,
    title: "Treino cancelado dia 15/02",
    description:
      "Devido à manutenção do ginásio, o treino de sábado (15/02) está cancelado. Reposição será agendada.",
    date: "08 Fev 2026",
    type: "urgent",
  },
  {
    id: 2,
    title: "Torneio Regional Sub-15",
    description:
      "Nossos alunos participarão do Torneio Regional no dia 22/02. Concentração às 7h no ginásio.",
    date: "06 Fev 2026",
    type: "event",
  },
  {
    id: 3,
    title: "Novos horários a partir de março",
    description:
      "A partir de março teremos novos horários para as categorias Sub-11 e Sub-13. Confira na aba Agenda.",
    date: "04 Fev 2026",
    type: "info",
  },
  {
    id: 4,
    title: "Mensalidade de fevereiro disponível",
    description:
      "O boleto da mensalidade de fevereiro já está disponível. Vencimento dia 10/02.",
    date: "01 Fev 2026",
    type: "general",
  },
  {
    id: 5,
    title: "Festa de confraternização",
    description:
      "Dia 28/02 teremos nossa confraternização de carnaval! Traga sua família. Local: Ginásio A.",
    date: "30 Jan 2026",
    type: "event",
  },
];

const typeConfig: Record<NoticeType, { icon: typeof Info; bg: string; border: string; iconColor: string }> = {
  urgent: {
    icon: AlertTriangle,
    bg: "bg-destructive/5",
    border: "border-destructive/20",
    iconColor: "text-destructive",
  },
  info: {
    icon: Info,
    bg: "bg-primary/5",
    border: "border-primary/20",
    iconColor: "text-primary",
  },
  event: {
    icon: PartyPopper,
    bg: "bg-accent/10",
    border: "border-accent/20",
    iconColor: "text-accent-foreground",
  },
  general: {
    icon: Megaphone,
    bg: "bg-muted",
    border: "border-border",
    iconColor: "text-muted-foreground",
  },
};

const Avisos = () => {
  return (
    <PageTransition>
      <Header title="Avisos" subtitle="Comunicados importantes" />

      <main className="space-y-3 px-4 pb-24 pt-4">
        {notices.map((notice, i) => {
          const config = typeConfig[notice.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl border p-4 ${config.bg} ${config.border}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${config.iconColor}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {notice.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {notice.description}
                  </p>
                  <p className="mt-2 text-[10px] font-medium text-muted-foreground">
                    {notice.date}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </main>
    </PageTransition>
  );
};

export default Avisos;
