"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3,
  ChevronLeft,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Moon,
  PiggyBank,
  Sun,
  Tag,
  Target,
  User,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [open, setOpen] = useState(false)

  // Verificar se é mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsCollapsed(false)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Verificar se o componente está montado (para evitar problemas de hidratação)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Ganhos",
      href: "/ganhos",
      icon: PiggyBank,
    },
    {
      title: "Despesas",
      href: "/despesas",
      icon: CreditCard,
    },
    {
      title: "Investimentos",
      href: "/investimentos",
      icon: BarChart3,
    },
    {
      title: "Objetivos",
      href: "/objetivos",
      icon: Target,
    },
    {
      title: "Categorias",
      href: "/categorias",
      icon: Tag,
    },
    {
      title: "Perfil",
      href: "/perfil",
      icon: User,
    },
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <PiggyBank className="h-6 w-6 text-primary" />
          {!isCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinanceU
            </span>
          )}
        </Link>
        {!isMobile && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsCollapsed(!isCollapsed)}>
            <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href} onClick={() => isMobile && setOpen(false)}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${isActive ? "bg-primary text-primary-foreground" : ""}`}
                >
                  <item.icon className={`mr-2 h-5 w-5 ${isCollapsed ? "mr-0" : ""}`} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <>
                <Sun className={`mr-2 h-4 w-4 ${isCollapsed ? "mr-0" : ""}`} />
                {!isCollapsed && <span>Modo claro</span>}
              </>
            ) : (
              <>
                <Moon className={`mr-2 h-4 w-4 ${isCollapsed ? "mr-0" : ""}`} />
                {!isCollapsed && <span>Modo escuro</span>}
              </>
            )}
          </Button>
          <Button variant="destructive" size="sm" className="justify-start" onClick={logout}>
            <LogOut className={`mr-2 h-4 w-4 ${isCollapsed ? "mr-0" : ""}`} />
            {!isCollapsed && <span>Sair</span>}
          </Button>
        </div>
      </div>
    </div>
  )

  // Versão mobile (Sheet)
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    )
  }

  // Versão desktop
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={isCollapsed ? "collapsed" : "expanded"}
        initial={{ width: isCollapsed ? 240 : 64 }}
        animate={{
          width: isCollapsed ? 64 : 240,
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
        className="hidden md:block h-screen border-r bg-background"
      >
        <SidebarContent />
      </motion.div>
    </AnimatePresence>
  )
}
