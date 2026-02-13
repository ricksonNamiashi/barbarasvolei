import { useState } from "react";
import { Shield, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const roles = [
  { value: "admin", label: "Admin", icon: ShieldCheck },
  { value: "aluno", label: "Aluno", icon: User },
  { value: "responsavel", label: "Responsável", icon: Shield },
] as const;

const DevRoleSwitcher = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [switching, setSwitching] = useState(false);

  if (!user) return null;

  const switchRole = async (newRole: string) => {
    if (newRole === role || switching) return;
    setSwitching(true);
    try {
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("user_roles")
          .update({ role: newRole as "admin" | "responsavel" | "aluno" })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: newRole as "admin" | "responsavel" | "aluno" });
      }

      toast({ title: `Papel alterado para ${newRole}` });
      window.location.reload();
    } catch {
      toast({ title: "Erro ao trocar papel", variant: "destructive" });
    }
    setSwitching(false);
  };

  return (
    <div className="fixed bottom-20 right-3 z-50 flex flex-col gap-1 rounded-xl border border-border bg-card p-2 shadow-lg">
      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-center">DEV</span>
      {roles.map((r) => {
        const Icon = r.icon;
        const active = role === r.value;
        return (
          <Button
            key={r.value}
            size="sm"
            variant={active ? "default" : "ghost"}
            className="h-7 gap-1 text-[10px]"
            disabled={switching}
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
