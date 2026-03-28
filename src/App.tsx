import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Agenda from "./pages/Agenda";
import Professores from "./pages/Professores";
import Avisos from "./pages/Avisos";
import Pagamentos from "./pages/Pagamentos";
import Contato from "./pages/Contato";
import Perfil from "./pages/Perfil";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHorarios from "./pages/admin/AdminHorarios";
import AdminAvisos from "./pages/admin/AdminAvisos";
import AdminResponsaveis from "./pages/admin/AdminResponsaveis";
import AdminPagamentos from "./pages/admin/AdminPagamentos";
import NotFound from "./pages/NotFound";
import DevRoleSwitcher from "@/components/DevRoleSwitcher";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isAuth = location.pathname === "/auth";

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <Routes>
        <Route path="/admin/responsaveis" element={<ProtectedRoute requiredRole="admin"><AdminResponsaveis /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
        <Route path="/professores" element={<ProtectedRoute><Professores /></ProtectedRoute>} />
        <Route path="/avisos" element={<ProtectedRoute><Avisos /></ProtectedRoute>} />
        <Route path="/pagamentos" element={<ProtectedRoute><Pagamentos /></ProtectedRoute>} />
        <Route path="/contato" element={<ProtectedRoute><Contato /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/horarios" element={<ProtectedRoute requiredRole="admin"><AdminHorarios /></ProtectedRoute>} />
        <Route path="/admin/avisos" element={<ProtectedRoute requiredRole="admin"><AdminAvisos /></ProtectedRoute>} />
        <Route path="/admin/alunos" element={<ProtectedRoute requiredRole="admin"><AdminAlunos /></ProtectedRoute>} />
        <Route path="/admin/pagamentos" element={<ProtectedRoute requiredRole="admin"><AdminPagamentos /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && !isAuth && <BottomNav />}
      {import.meta.env.DEV && <DevRoleSwitcher />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
