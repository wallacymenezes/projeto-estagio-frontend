"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { Bell, LogOut, Moon, Sun, User } from "lucide-react"
import Link from "next/link"

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  // Verificar se o componente está montado (para evitar problemas de hidratação)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  // Mapear o pathname para um título
  const getPageTitle = () => {
    const routes: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/ganhos": "Ganhos",
      "/despesas": "Despesas",
      "/investimentos": "Investimentos",
      "/objetivos": "Objetivos",
      "/categorias": "Categorias",
      "/perfil": "Perfil",
    }

    return routes[pathname] || "Dashboard"
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">{getPageTitle()}</h1>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photo || ""} alt={user?.name || ""} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/perfil" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-2 cursor-pointer"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Modo claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Modo escuro</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
