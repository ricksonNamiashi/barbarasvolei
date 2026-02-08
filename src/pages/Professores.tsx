import { Award, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";

const professors = [
  {
    name: "Ricardo Silva",
    role: "Head Coach",
    formation: "Ed. Física - UFRJ",
    experience: "15 anos de experiência",
    categories: ["Sub-11", "Sub-13"],
    bio: "Ex-jogador profissional com passagens pelo Flamengo e seleção brasileira juvenil. Especialista em formação de base.",
    initials: "RS",
  },
  {
    name: "Carla Mendes",
    role: "Treinadora",
    formation: "Ed. Física - USP",
    experience: "10 anos de experiência",
    categories: ["Sub-15", "Sub-17"],
    bio: "Formada pela USP com especialização em treinamento esportivo. Medalhista nos Jogos Universitários.",
    initials: "CM",
  },
  {
    name: "André Costa",
    role: "Treinador",
    formation: "Ed. Física - UFMG",
    experience: "8 anos de experiência",
    categories: ["Sub-13", "Adulto"],
    bio: "Especialista em vôlei de praia com experiência em competições nacionais. Certificado pela CBV.",
    initials: "AC",
  },
];

const Professores = () => {
  return (
    <PageTransition>
      <Header title="Professores" subtitle="Nossa equipe técnica" />

      <main className="space-y-4 px-4 pb-24 pt-4">
        {professors.map((prof, i) => (
          <motion.div
            key={prof.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
          >
            {/* Header with gradient */}
            <div className="gradient-hero p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary-foreground/30 bg-primary-foreground/20 font-display text-xl font-bold text-primary-foreground">
                  {prof.initials}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-primary-foreground">
                    {prof.name}
                  </h3>
                  <p className="text-sm text-primary-foreground/80">{prof.role}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{prof.bio}</p>

              <div className="flex items-center gap-2 text-xs text-card-foreground">
                <GraduationCap size={14} className="text-primary" />
                <span>{prof.formation}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-card-foreground">
                <Award size={14} className="text-primary" />
                <span>{prof.experience}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {prof.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </main>
    </PageTransition>
  );
};

export default Professores;
