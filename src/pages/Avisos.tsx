import { AlertTriangle, Info, PartyPopper, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { useNotices } from "@/hooks/use-notices";

type NoticeType = "urgent" | "info" | "event" | "general";

const typeConfig: Record<NoticeType, { icon: typeof Info; bg: string; border: string; iconColor: string }> = {
  urgent: { icon: AlertTriangle, bg: "bg-destructive/5", border: "border-destructive/20", iconColor: "text-destructive" },
  info: { icon: Info, bg: "bg-primary/5", border: "border-primary/20", iconColor: "text-primary" },
  event: { icon: PartyPopper, bg: "bg-accent/10", border: "border-accent/20", iconColor: "text-accent-foreground" },
  general: { icon: Megaphone, bg: "bg-muted", border: "border-border", iconColor: "text-muted-foreground" },
};

const Avisos = () => {
  const { data: notices, isLoading } = useNotices();

  return (
    <PageTransition>
      <Header title="Avisos" subtitle="Comunicados importantes" />

      <main className="space-y-3 px-4 pb-24 pt-4">
        {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>}

        {notices?.map((notice, i) => {
          const config = typeConfig[(notice.type as NoticeType)] || typeConfig.general;
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
                  <p className="text-sm font-semibold text-foreground">{notice.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.description}</p>
                  <p className="mt-2 text-[10px] font-medium text-muted-foreground">
                    {new Date(notice.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {!isLoading && (!notices || notices.length === 0) && (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum aviso no momento.</p>
        )}
      </main>
    </PageTransition>
  );
};

export default Avisos;
