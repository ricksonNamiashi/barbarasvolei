import { Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { useSchedules } from "@/hooks/use-schedules";

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const dayOrder = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const Agenda = () => {
  const { data: schedules, isLoading } = useSchedules();

  // Group by day
  const grouped = dayOrder
    .map((day) => ({
      day,
      sessions: (schedules || []).filter((s) => s.day === day),
    }))
    .filter((g) => g.sessions.length > 0);

  return (
    <PageTransition>
      <Header title="Agenda" subtitle="Horários de treino" />

      <main className="space-y-4 px-4 pb-24 pt-4">
        {/* Week indicator */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weekDays.map((day, i) => (
            <button
              key={day}
              className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-medium transition-colors ${
                i === 0
                  ? "gradient-hero text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground"
              }`}
            >
              <span className="text-[10px]">{day}</span>
              <span className="font-display text-base font-bold">{10 + i}</span>
            </button>
          ))}
        </div>

        {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>}

        {/* Schedule */}
        {grouped.map((daySchedule, dayIndex) => (
          <motion.section
            key={daySchedule.day}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.08 }}
          >
            <h3 className="mb-2 font-display text-sm font-bold text-foreground">
              {daySchedule.day}
            </h3>
            <div className="space-y-2">
              {daySchedule.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Clock size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-card-foreground">
                        {session.time}
                      </p>
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                        {session.category}
                      </span>
                    </div>
                    {session.coach && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {session.coach}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin size={10} />
                      {session.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </main>
    </PageTransition>
  );
};

export default Agenda;
