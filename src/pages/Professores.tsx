import { Award, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { useProfessors } from "@/hooks/use-professors";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Professores = () => {
  const { data: professors = [], isLoading } = useProfessors();

  return (
    <PageTransition>
      <Header title="Professores" subtitle="Nossa equipe técnica" />

      <main className="space-y-4 px-4 pb-24 pt-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))
          : professors.map((prof, i) => (
              <motion.div
                key={prof.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
              >
                <div className="gradient-hero p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 border-2 border-primary-foreground/30">
                      {prof.photo_url ? (
                        <AvatarImage src={prof.photo_url} alt={prof.name} />
                      ) : null}
                      <AvatarFallback className="bg-primary-foreground/20 font-display text-xl font-bold text-primary-foreground">
                        {prof.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-display text-lg font-bold text-primary-foreground">
                        {prof.name}
                      </h3>
                      <p className="text-sm text-primary-foreground/80">{prof.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  {prof.bio && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {prof.bio}
                    </p>
                  )}

                  {prof.formation && (
                    <div className="flex items-center gap-2 text-xs text-card-foreground">
                      <GraduationCap size={14} className="text-primary" />
                      <span>{prof.formation}</span>
                    </div>
                  )}

                  {prof.experience && (
                    <div className="flex items-center gap-2 text-xs text-card-foreground">
                      <Award size={14} className="text-primary" />
                      <span>{prof.experience}</span>
                    </div>
                  )}

                  {prof.categories?.length > 0 && (
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
                  )}
                </div>
              </motion.div>
            ))}
      </main>
    </PageTransition>
  );
};

export default Professores;
