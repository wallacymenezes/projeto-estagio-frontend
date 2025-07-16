"use client";

import type React from "react";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { api } from "@/lib/api";
import type { User } from "@/models/User";

function ResetPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // 1. Ler os dados do usuário do sessionStorage
    const userDataString = sessionStorage.getItem("password_reset_user");
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    } else {
      toast({
        title: "Erro",
        description: "Sessão de recuperação inválida. Por favor, comece o processo novamente.",
        variant: "destructive",
      });
      router.push("/recuperar-senha");
    }
  }, [router, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // 2. Construir o payload completo com a nova senha
      const payload: User = {
        ...user,
        password: newPassword,
      };

      await api.post("/auth/change-password", payload);
      
      toast({
        title: "Senha redefinida com sucesso!",
        description: "Você já pode fazer login com sua nova senha.",
      });

      // 3. Limpar o sessionStorage e redirecionar para o login
      sessionStorage.removeItem("password_reset_user");
      router.push("/login");

    } catch (error) {
      toast({
        title: "Erro ao redefinir senha",
        description: "Sua sessão pode ter expirado. Tente o processo novamente.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
            <CardDescription>Crie uma nova senha para sua conta.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                 <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                   <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                {loading ? "Salvando..." : "Salvar Nova Senha"}
              </Button>
            </form>
          </CardContent>
           <CardFooter>
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors w-full text-center">
              Voltar para o login
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

// O Suspense é necessário porque useSearchParams() só funciona em Client Components.
export default function RedefinirSenhaPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}