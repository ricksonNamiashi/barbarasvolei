import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import logoAbv from "@/assets/logo-abv.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import NotificationBell from "@/components/NotificationBell";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  responsavel: "Responsável",
  aluno: "Aluno",
};

const Header = ({ title, subtitle }: HeaderProps) => {
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();

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
          <p className="truncate text-xs text-muted-foreground">
            {subtitle || (profile ? profile.name : "")}
          </p>
        </div>
        {role && (
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {roleLabels[role] || role}
          </Badge>
        )}
        <NotificationBell />
        <button
          onClick={() => navigate("/perfil")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 transition-colors active:bg-primary/20"
        >
          <User size={18} className="text-primary" />
        </button>
        <button
          onClick={async () => { await signOut(); navigate("/auth"); }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 transition-colors active:bg-destructive/20"
        >
          <LogOut size={18} className="text-destructive" />
        </button>
      </div>
    </header>
  );
};

export default Header;
