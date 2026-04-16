import { MessageCircle, Instagram, MapPin, Clock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import logoAbv from "@/assets/logo-abv.jpg";

const contactMethods = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "(21) 96621-3552",
    action: "https://wa.me/5521966213552",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@barbarasvolei",
    action: "https://www.instagram.com/barbarasvolei?igsh=YzJwODI0c3YyZ2dm",
    color: "bg-pink-50 text-pink-600",
  },
];

const Contato = () => {
  return (
    <PageTransition>
      <Header title="Contato" subtitle="Fale conosco" />

      <main className="space-y-5 px-4 pb-24 pt-4">
        {/* School Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          <img
            src={logoAbv}
            alt="ABV"
            className="h-16 w-16 rounded-xl object-cover shadow-card"
          />
          <div>
            <h2 className="font-display text-lg font-bold text-card-foreground">
              ABV Escola de Vôlei
            </h2>
            <p className="text-xs text-muted-foreground">
              Academia de Vôlei dos Vikings
            </p>
          </div>
        </motion.div>

        {/* Contact Methods */}
        <section>
          <h3 className="mb-3 font-display text-sm font-bold text-foreground">
            Canais de Atendimento
          </h3>
          <div className="space-y-2">
            {contactMethods.map((method, i) => {
              const Icon = method.icon;
              return (
                <motion.a
                  key={method.label}
                  href={method.action}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card transition-transform active:scale-[0.98]"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${method.color}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-card-foreground">
                      {method.label}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {method.value}
                    </p>
                  </div>
                  <ExternalLink size={16} className="text-muted-foreground" />
                </motion.a>
              );
            })}
          </div>
        </section>

        {/* Address */}
        <section>
          <h3 className="mb-3 font-display text-sm font-bold text-foreground">
            Localização
          </h3>
          <motion.a
            href="https://www.google.com/maps/search/?api=1&query=R.+Domingos+Meireles+242+Campo+Grande+Rio+de+Janeiro"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="block rounded-xl border border-border bg-card p-4 shadow-card transition-transform active:scale-[0.98]"
          >
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-card-foreground">
                  Escola Santa Bárbara — Filial (Vila Nova)
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  R. Domingos Meireles, 242
                </p>
                <p className="text-xs text-muted-foreground">
                  Campo Grande, Rio de Janeiro - RJ
                </p>
                <p className="text-xs text-muted-foreground">
                  CEP 23070-500
                </p>
              </div>
              <ExternalLink size={16} className="mt-0.5 text-muted-foreground" />
            </div>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-3 overflow-hidden rounded-xl border border-border shadow-card"
          >
            <iframe
              title="Mapa - Escola Santa Bárbara Vila Nova"
              src="https://www.google.com/maps?q=R.+Domingos+Meireles,+242,+Campo+Grande,+Rio+de+Janeiro+-+RJ,+23070-500&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-48 w-full border-0"
              allowFullScreen
            />
          </motion.div>
        </section>

        {/* Hours */}
        <section>
          <h3 className="mb-3 font-display text-sm font-bold text-foreground">
            Dias e Horários de Treino
          </h3>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <div className="flex items-start gap-3">
              <Clock size={18} className="mt-0.5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Segundas e Quartas
                  </p>
                  <ul className="mt-1 space-y-0.5 text-xs text-card-foreground">
                    <li>▫️ 19h00 às 20h00</li>
                    <li>▫️ 20h00 às 21h00</li>
                    <li>▫️ 21h00 às 22h00</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Sexta-feira
                  </p>
                  <ul className="mt-1 space-y-0.5 text-xs text-card-foreground">
                    <li>▫️ 18h00 às 19h00</li>
                    <li>▫️ 19h00 às 20h00</li>
                    <li className="font-semibold text-primary">▫️ 20h00 às 22h00 — Adulto</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </PageTransition>
  );
};

export default Contato;
