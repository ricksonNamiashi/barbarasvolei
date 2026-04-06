import { useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, Users, Bell, Phone, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/agenda", icon: Calendar, label: "Agenda" },
  { path: "/professores", icon: Users, label: "Professores" },
  { path: "/avisos", icon: Bell, label: "Avisos" },
  { path: "/contato", icon: Phone, label: "Contato" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();

  const items = role === "admin"
    ? [...navItems, { path: "/admin", icon: Shield, label: "Admin" }]
    : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-2 transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                size={22}
                className={isActive ? "text-primary" : "text-muted-foreground"}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
