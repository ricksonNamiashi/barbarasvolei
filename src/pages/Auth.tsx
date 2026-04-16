import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, LogIn, UserPlus, Volleyball, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import logoAbv from "@/assets/logo-abv.jpg";

const translateError = (message: string): string => {
  const map: Record<string, string> = {
    "Invalid login credentials": "Email ou senha incorretos",
    "Email not confirmed": "Email ainda não confirmado. Verifique sua caixa de entrada",
    "User already registered": "Este email já está cadastrado",
    "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres",
    "Unable to validate email address: invalid format": "Formato de email inválido",
    "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos",
    "For security purposes, you can only request this after": "Por segurança, aguarde antes de tentar novamente",
  };
  for (const [key, value] of Object.entries(map)) {
    if (message.includes(key)) return value;
  }
  return message;
};

const floatingBalls = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 40 + Math.random() * 60,
  delay: Math.random() * 3,
  duration: 6 + Math.random() * 6,
}));

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Erro ao entrar", description: translateError(error.message), variant: "destructive" });
        setShakeForm(true);
        setTimeout(() => setShakeForm(false), 600);
      }
    } else {
      if (!name.trim()) {
        toast({ title: "Informe seu nome", variant: "destructive" });
        setShakeForm(true);
        setTimeout(() => setShakeForm(false), 600);
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) {
        toast({ title: "Erro ao cadastrar", description: translateError(error.message), variant: "destructive" });
        setShakeForm(true);
        setTimeout(() => setShakeForm(false), 600);
      } else {
        toast({ title: "Conta criada com sucesso!" });
        navigate("/");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute right-4 top-4 z-20 rounded-full border border-border/60 bg-card/80 p-2.5 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
        aria-label="Alternar tema"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

        {/* Floating volleyball icons */}
        {floatingBalls.map((ball) => (
          <motion.div
            key={ball.id}
            className="absolute text-primary/[0.06]"
            style={{ left: `${ball.x}%`, top: `${ball.y}%` }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: ball.duration,
              delay: ball.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Volleyball size={ball.size} strokeWidth={1} />
          </motion.div>
        ))}

        {/* Top-right glow */}
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
        {/* Bottom-left glow */}
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-4 w-full max-w-sm"
      >
        <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-elevated backdrop-blur-xl">
          {/* Logo & header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "backOut" }}
            className="mb-8 flex flex-col items-center gap-3"
          >
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 blur-lg" />
              <img
                src={logoAbv}
                alt="ABV Vôlei"
                className="relative h-20 w-20 rounded-2xl object-cover shadow-lg ring-2 ring-primary/20"
              />
            </div>
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-foreground">ABV Vôlei</h1>
              <AnimatePresence mode="wait">
                <motion.p
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 text-sm text-muted-foreground"
                >
                  {isLogin ? "Entre na sua conta" : "Crie sua conta"}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            animate={shakeForm ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pb-1">
                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Nome completo
                    </Label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                      <Input
                        id="name"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11 rounded-xl border-border/60 bg-background/60 pl-9 text-sm transition-colors focus:border-primary/40 focus:bg-background"
                        maxLength={100}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-border/60 bg-background/60 pl-9 text-sm transition-colors focus:border-primary/40 focus:bg-background"
                  required
                  maxLength={255}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Senha
              </Label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-border/60 bg-background/60 pl-9 text-sm transition-colors focus:border-primary/40 focus:bg-background"
                  required
                  minLength={6}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Button
                type="submit"
                className="mt-2 h-12 w-full gap-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
                disabled={submitting}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={submitting ? "loading" : isLogin ? "login" : "signup"}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                        />
                        Aguarde...
                      </>
                    ) : isLogin ? (
                      <>
                        <LogIn size={16} />
                        Entrar
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Criar conta
                      </>
                    )}
                  </motion.span>
                </AnimatePresence>
              </Button>
            </motion.div>
          </motion.form>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-6"
          >
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card/80 px-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="group w-full rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
            >
              {isLogin ? (
                <span>
                  Não tem conta?{" "}
                  <span className="font-bold text-primary">Cadastre-se</span>
                </span>
              ) : (
                <span>
                  Já tem conta?{" "}
                  <span className="font-bold text-primary">Entre aqui</span>
                </span>
              )}
            </button>
          </motion.div>
        </div>

        {/* Slogan */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center text-xs text-muted-foreground/60"
        >
          A vida é melhor com vôlei e boas vibrações 🏐
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;
