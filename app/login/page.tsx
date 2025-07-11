"use client"

import type React from "react"

import { useState, useEffect, ChangeEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Eye, EyeOff, LogIn } from "lucide-react"

// Create a client-only wrapper component
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="w-full max-w-md flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Create a client-only auth form component
const LoginForm = () => {
  // Now we can safely use hooks here
  const { user, handleLogin } = useAuth()
  const router = useRouter()
  //const { toast } = useToast()

  const [loginRequest, setLoginRequest] = useState({
    user: "",
    password: "",
  });

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  /*useEffect(() => {
        if (user?.token !== "") {
            router.push("/dashboard")
            setLoading(false)
        }
    }, [user]);
    */
  // Em seu LoginForm
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const success =  await handleLogin(loginRequest)
    
    if (success) {
      router.push("/dashboard")
    }
    setLoading(false)
  }

  function atualizarEstado(e: ChangeEvent<HTMLInputElement>) {
    setLoginRequest({
      ...loginRequest,
      [e.target.name]: e.target.value,
    });
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
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinanceU
            </CardTitle>
            <CardDescription>Entre com seu e-mail e senha para acessar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="user"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginRequest.user}
                  onChange={atualizarEstado}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="/recuperar-senha" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginRequest.password}
                    onChange={atualizarEstado}
                    required
                    className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn size={18} />
                    <span>Entrar</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Não tem uma conta?{" "}
              <Link href="/cadastro" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Cadastre-se
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

// Import the useAuth hook here to avoid the error during the initial render
import { useAuth } from "@/contexts/auth-context"

// Main component that doesn't use any hooks directly
export default function LoginPage() {
  return (
    <ClientOnly>
      <LoginForm />
    </ClientOnly>
  )
}
