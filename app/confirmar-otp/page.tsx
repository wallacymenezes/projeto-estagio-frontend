"use client";

import type React from "react";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { KeyRound, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { User } from "@/models/User"; // Importar o modelo User

function ConfirmOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      toast({
        title: "Erro",
        description: "E-mail não fornecido. Por favor, comece o processo novamente.",
        variant: "destructive",
      });
      router.push("/recuperar-senha");
    }
  }, [email, router, toast]);

  const handleValidateOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      // 1. Capturar a resposta da API, que contém o objeto User com o token
      const response = await api.post<User>("/auth/validate-otp", { otp, email });
      const userWithToken = response.data;
      
      if (!userWithToken?.token) {
        throw new Error("Token de recuperação não recebido.");
      }
      
      // 2. Salvar os dados do usuário temporariamente no sessionStorage
      sessionStorage.setItem("password_reset_user", JSON.stringify(userWithToken));

      toast({
        title: "Código validado!",
        description: "Agora você pode definir uma nova senha.",
      });

      // 3. Redirecionar para a página de redefinição de senha
      router.push(`/redefinir-senha`);

    } catch (error) {
      toast({
        title: "Código inválido",
        description: "O código informado é inválido ou expirou.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (!email) {
    return null; // ou um componente de loading
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
            <CardTitle className="text-2xl font-bold">Verificar Código</CardTitle>
            <CardDescription>
              Digite o código de 6 dígitos enviado para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleValidateOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Código de Verificação</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="text-center tracking-[1em]"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="mr-2 h-4 w-4" />
                )}
                {loading ? "Verificando..." : "Verificar Código"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Link href="/recuperar-senha" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors w-full text-center">
              Voltar e reenviar código
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

// O Suspense é necessário porque useSearchParams() só funciona em Client Components.
export default function ConfirmarOTPPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ConfirmOTPForm />
        </Suspense>
    )
}