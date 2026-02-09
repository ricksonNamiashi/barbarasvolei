import { User, Calendar, Trophy, Clock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const studentData = {
  name: "Lucas Martins",
  age: 14,
  category: "Sub-15",
  enrolledSince: "Mar 2025",
  nextTraining: "Seg, 10 Fev - 17:00",
};

const trainingHistory = [
  { date: "07 Fev", type: "Treino", status: "Presente" },
  { date: "05 Fev", type: "Treino", status: "Presente" },
  { date: "03 Fev", type: "Treino", status: "Falta" },
  { date: "31 Jan", type: "Treino", status: "Presente" },
  { date: "29 Jan", type: "Amistoso", status: "Presente" },
  { date: "27 Jan", type: "Treino", status: "Presente" },
];

const Perfil = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <Header title="Perfil do Aluno" subtitle="Informações e histórico" />

      <main className="space-y-6 px-4 pb-24 pt-4">
        {/* Student Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
              {studentData.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="font-display text-xl font-bold text-foreground">
              {studentData.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {studentData.age} anos
            </p>
          </div>
          <Badge variant="default">{studentData.category}</Badge>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <Calendar size={20} className="text-primary" />
            <span className="text-[10px] font-medium uppercase text-muted-foreground">
              Matrícula
            </span>
            <span className="text-sm font-bold text-foreground">
              {studentData.enrolledSince}
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <Clock size={20} className="text-accent" />
            <span className="text-[10px] font-medium uppercase text-muted-foreground">
              Próximo treino
            </span>
            <span className="text-center text-xs font-bold text-foreground">
              {studentData.nextTraining}
            </span>
          </motion.div>
        </div>

        {/* Training History */}
        <section>
          <h3 className="mb-3 font-display text-base font-bold text-foreground">
            Histórico de Presença
          </h3>
          <div className="space-y-2">
            {trainingHistory.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Trophy size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      {entry.type}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                </div>
                <Badge
                  variant={entry.status === "Presente" ? "default" : "destructive"}
                  className="text-[10px]"
                >
                  {entry.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </PageTransition>
  );
};

export default Perfil;
