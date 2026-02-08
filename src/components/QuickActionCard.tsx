import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface QuickActionCardProps {
  icon: LucideIcon;
  label: string;
  description: string;
  to: string;
  variant?: "primary" | "secondary" | "accent";
  index?: number;
}

const variantStyles = {
  primary: "gradient-hero text-primary-foreground",
  secondary: "bg-card border border-border text-card-foreground shadow-card",
  accent: "bg-accent/10 border border-accent/20 text-foreground",
};

const QuickActionCard = ({
  icon: Icon,
  label,
  description,
  to,
  variant = "secondary",
  index = 0,
}: QuickActionCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
      onClick={() => navigate(to)}
      className={`flex w-full items-start gap-3 rounded-xl p-4 text-left transition-transform active:scale-[0.97] ${variantStyles[variant]}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          variant === "primary"
            ? "bg-primary-foreground/20"
            : "bg-primary/10"
        }`}
      >
        <Icon
          size={20}
          className={variant === "primary" ? "text-primary-foreground" : "text-primary"}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-bold">{label}</p>
        <p
          className={`mt-0.5 text-xs ${
            variant === "primary"
              ? "text-primary-foreground/80"
              : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      </div>
    </motion.button>
  );
};

export default QuickActionCard;
