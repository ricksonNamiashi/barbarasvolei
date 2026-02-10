import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Agenda from "./pages/Agenda";
import Professores from "./pages/Professores";
import Avisos from "./pages/Avisos";
import Pagamentos from "./pages/Pagamentos";
import Contato from "./pages/Contato";
import Perfil from "./pages/Perfil";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHorarios from "./pages/admin/AdminHorarios";
import AdminAvisos from "./pages/admin/AdminAvisos";
import AdminAlunos from "./pages/admin/AdminAlunos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/professores" element={<Professores />} />
        <Route path="/avisos" element={<Avisos />} />
        <Route path="/pagamentos" element={<Pagamentos />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/horarios" element={<AdminHorarios />} />
        <Route path="/admin/avisos" element={<AdminAvisos />} />
        <Route path="/admin/alunos" element={<AdminAlunos />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <BottomNav />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
