import { Calendar, Bell, Users, CreditCard, Settings, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";

const stats = [
  { label: "Alunos Ativos", value: "47", icon: Users, color: "text-primary" },
  { label: "Treinos/Semana", value: "12", icon: Calendar, color: "text-secondary" },
  { label: "Avisos Ativos", value: "3", icon: Bell, color: "text-destructive" },
  { label: "Pagamentos Pendentes", value: "8", icon: CreditCard, color: "text-accent" },
];

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
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Painel Admin</h1>
            <p className="text-xs text-muted-foreground">Gestão da escola</p>
          </div>
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

        {/* Menu */}
        <section>
          <h3 className="mb-3 font-display text-base font-bold text-foreground">Gerenciamento</h3>
          <div className="space-y-2">
            {menuItems.map((item, i) => (
              <motion.button
                key={item.to}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
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
