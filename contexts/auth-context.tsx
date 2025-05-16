"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"

interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: { name: string; avatarFile: File | null }) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Prevent hydration errors
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Only run auth check on client side
    const token = localStorage.getItem("token")

    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`

      // Decodificando o token para obter o userId
      try {
        const decodedToken: any = jwtDecode(token)
        const userId = decodedToken.sub // O "sub" é geralmente o "userId" no JWT

        // Faz a requisição para buscar os dados do usuário com base no ID
        api
          .get(`/users/${userId}`)
          .then((response) => {
            setUser(response.data)
          })
          .catch(() => {
            localStorage.removeItem("token")
            delete api.defaults.headers.common.Authorization
          })
          .finally(() => {
            setLoading(false)
          })
      } catch (error) {
        console.error("Error decoding token:", error)
        localStorage.removeItem("token")
        delete api.defaults.headers.common.Authorization
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Realiza a requisição de login com o email e senha
      const response = await api.post("/auth/login", { user: email, password })

      const { accessToken, expiresIn } = response.data

      // Armazenar o token no localStorage
      localStorage.setItem("token", accessToken)

      // Configurar o token no cabeçalho Authorization para todas as requisições seguintes
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`

      // Decodificar o token para obter o userId (caso necessário)
      const decodedToken: any = jwtDecode(accessToken)
  
      const userId = decodedToken.sub

      return
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      await api.post("/auth/register", { name, email, password })
      return
    } catch (error) {
      console.error("Register error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common.Authorization
    setUser(null)
    router.push("/login")
  }

  const updateProfile = async (data: { name: string; avatarFile: File | null }) => {
    try {
      const formData = new FormData()
      formData.append("name", data.name)

      if (data.avatarFile) {
        formData.append("photo", data.avatarFile)
      }

      const response = await api.put("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setUser((prev) => {
        if (!prev) return null

        return {
          ...prev,
          name: data.name,
          avatarUrl: response.data.photo || prev.avatarUrl,
        }
      })

      return
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await api.put("/users/password", { currentPassword, newPassword })
      return
    } catch (error) {
      console.error("Update password error:", error)
      throw error
    }
  }

  // Provide a default value during server-side rendering
  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
  }

  // Only render children when mounted on client side
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
