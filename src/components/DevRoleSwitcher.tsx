import { Shield, ShieldCheck, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const roles = [
  { value: "admin", label: "Admin", icon: ShieldCheck },
  { value: "aluno", label: "Aluno", icon: User },
  { value: "responsavel", label: "Responsável", icon: Shield },
] as const;

const DevRoleSwitcher = () => {
  const { user, role, setDevRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || !import.meta.env.DEV) return null;

  const switchRole = (newRole: "admin" | "responsavel" | "aluno") => {
    if (newRole === role) return;

    setDevRole(newRole);
    toast({ title: `Papel DEV alterado para ${newRole}` });

    if (newRole === "admin") {
      navigate("/admin");
      return;
    }

    if (location.pathname.startsWith("/admin")) {
      navigate("/");
    }
  };

  return (
    <div className="fixed bottom-20 right-3 z-50 flex flex-col gap-1 rounded-xl border border-border bg-card p-2 shadow-lg">
      <span className="text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">DEV</span>
      {roles.map((r) => {
        const Icon = r.icon;
        const active = role === r.value;
        return (
          <Button
            key={r.value}
            size="sm"
            variant={active ? "default" : "ghost"}
            className="h-7 gap-1 text-[10px]"
            onClick={() => switchRole(r.value)}
          >
            <Icon size={12} />
            {r.label}
          </Button>
        );
      })}
    </div>
  );
};

export default DevRoleSwitcher;
