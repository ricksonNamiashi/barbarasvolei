import { Calendar, Users, Bell, CreditCard, Trophy, ArrowRight, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import QuickActionCard from "@/components/QuickActionCard";
import PageTransition from "@/components/PageTransition";
import logoAbv from "@/assets/logo-abv.jpg";
import { useSchedules } from "@/hooks/use-schedules";
import { useNotices } from "@/hooks/use-notices";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { data: schedules } = useSchedules();
  const { data: notices } = useNotices();
  const { role } = useAuth();

  // Pick next 3 trainings (simplistic: just first 3)
  const upcomingTrainings = (schedules || []).slice(0, 3);
  const latestNotice = notices?.[0];

  return (
    <PageTransition>
      <Header title="ABV Vôlei" subtitle="Escola de Vôlei" />

      <main className="space-y-6 px-4 pb-24 pt-4">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl gradient-hero p-5"
        >
          <div className="relative z-10 flex items-center gap-4">
            <img src={logoAbv} alt="ABV" className="h-16 w-16 rounded-xl border-2 border-primary-foreground/30 object-cover shadow-elevated" />
            <div>
              <h2 className="font-display text-xl font-bold text-primary-foreground">Bem-vindo ao ABV!</h2>
              <p className="mt-0.5 text-sm text-primary-foreground/80">A vida é melhor com vôlei e boas vibrações</p>
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary-foreground/10" />
          <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-primary-foreground/5" />
        </motion.div>

        {/* Quick Actions */}
        <section>
          <h3 className="mb-3 font-display text-base font-bold text-foreground">Acesso Rápido</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard icon={Calendar} label="Agenda" description="Horários de treino" to="/agenda" variant="primary" index={0} />
            <QuickActionCard icon={Bell} label="Avisos" description="Comunicados" to="/avisos" variant="secondary" index={1} />
            <QuickActionCard icon={Users} label="Professores" description="Nossa equipe" to="/professores" variant="secondary" index={2} />
            <QuickActionCard icon={CreditCard} label="Pagamentos" description="Mensalidades" to="/pagamentos" variant="accent" index={3} />
          </div>
        </section>

        {/* Upcoming Trainings */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground">Próximos Treinos</h3>
            <button onClick={() => navigate("/agenda")} className="flex items-center gap-1 text-xs font-medium text-primary">
              Ver todos <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {upcomingTrainings.map((training, i) => (
              <motion.div
                key={training.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-card"
              >
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-[10px] font-medium uppercase text-primary">{training.day.slice(0, 3)}</span>
                  <Trophy size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-card-foreground">{training.time}</p>
                  <p className="text-xs text-muted-foreground">{training.category} — {training.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Latest Notice */}
        {latestNotice && (
          <section>
            <h3 className="mb-3 font-display text-base font-bold text-foreground">Último Aviso</h3>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => navigate("/avisos")}
              className="cursor-pointer rounded-xl border border-destructive/20 bg-destructive/5 p-4 transition-transform active:scale-[0.98]"
            >
              <p className="text-sm font-semibold text-foreground">{latestNotice.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{latestNotice.description}</p>
              <p className="mt-2 text-[10px] font-medium text-muted-foreground">
                {new Date(latestNotice.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </motion.div>
          </section>
        )}

        {/* Admin Access - only for admins */}
        {role === "admin" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => navigate("/admin")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-medium text-muted-foreground transition-colors active:bg-muted"
          >
            <Settings size={16} />
            Painel Administrativo
          </motion.button>
        )}
      </main>
    </PageTransition>
  );
};

export default Index;
