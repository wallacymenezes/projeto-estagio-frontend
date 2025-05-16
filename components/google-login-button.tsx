"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { jwtDecode } from "jwt-decode"

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, options: any) => void
          prompt: () => void
        }
      }
    }
  }
}

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)

    // Initialize Google Sign-In only on client side
    if (typeof window !== "undefined" && window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: "102340322001-ko3465pptf0rpbc8rb4gfpqmd4k3ta2n.apps.googleusercontent.com",
        callback: handleGoogleLogin,
      })
    }
  }, [])

  const handleGoogleLogin = async (response: any) => {
    try {
      setLoading(true)

      // Send the token to your backend
      const apiResponse = await api.post("/auth/google", {
        token: response.credential,
      })

      // Handle the response from your backend
      const { accessToken } = apiResponse.data

      // Store the token
      localStorage.setItem("token", accessToken)
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`

      // Decodificar o token para obter o userId
      const decodedToken: any = jwtDecode(accessToken)
      const userId = decodedToken.sub

      // Buscar dados do usuário
      await api.get(`/users/${userId}`)

      // Redirect to dashboard
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Google login error:", error)
      toast({
        title: "Erro ao fazer login com Google",
        description: "Não foi possível autenticar com o Google. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Only render the button when mounted on client side
  if (!mounted) {
    return null
  }

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2 py-6"
        disabled={loading}
        onClick={() => {
          if (window.google && window.google.accounts) {
            window.google.accounts.id.prompt()
          } else {
            toast({
              title: "Google Sign-In não disponível",
              description: "Não foi possível carregar o Google Sign-In. Tente novamente mais tarde.",
              variant: "destructive",
            })
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-chrome"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <line x1="21.17" y1="8" x2="12" y2="8" />
          <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
          <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
        </svg>
        {loading ? "Processando..." : "Continuar com Google"}
      </Button>

      {/* Hidden div for Google Sign-In button rendering */}
      <div
        id="google-signin-button"
        className="hidden"
        ref={(ref) => {
          if (ref && window.google && window.google.accounts) {
            window.google.accounts.id.renderButton(ref, {
              theme: "outline",
              size: "large",
              width: ref.offsetWidth,
              text: "signin_with",
              shape: "rectangular",
            })
          }
        }}
      />
    </div>
  )
}
