import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import logoAbv from "@/assets/logo-abv.jpg";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header = ({ title, subtitle }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-lg">
      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src={logoAbv}
          alt="ABV - Escola de Vôlei"
          className="h-10 w-10 rounded-full object-cover shadow-card"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold leading-tight font-display text-foreground">
            {title || "ABV Vôlei"}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <button
          onClick={() => navigate("/perfil")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 transition-colors active:bg-primary/20"
        >
          <User size={18} className="text-primary" />
        </button>
      </div>
    </header>
  );
};

export default Header;
