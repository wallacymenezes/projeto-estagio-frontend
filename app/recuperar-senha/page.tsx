"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Mail, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

export default function RecuperarSenhaPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Envia o e-mail para o backend
      await api.post("/auth/recover-token", { email })
      toast({
        title: "Código enviado!",
        description: "Verifique seu e-mail para o código de recuperação.",
      })
      // Redireciona para a página de confirmação de OTP, passando o e-mail na URL
      router.push(`/confirmar-otp?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast({
        title: "Erro ao enviar código",
        description: "Verifique o e-mail informado e tente novamente.",
        variant: "destructive",
      })
      setLoading(false);
    } 
    // Não definimos setLoading(false) aqui, pois a página irá redirecionar
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
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Recuperar Senha
            </CardTitle>
            <CardDescription>
              Informe seu e-mail para receber um código de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail size={18} />
                      <span>Enviar código</span>
                    </div>
                  )}
                </Button>
              </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Lembrou sua senha?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Voltar para o login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}