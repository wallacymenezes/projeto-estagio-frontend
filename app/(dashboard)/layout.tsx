// app/(dashboard)/layout.tsx

"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
// 1. Importe o SidebarProvider e o componente Sidebar
import { SidebarProvider } from "@/components/ui/sidebar"; 
import { Sidebar } from "@/components/sidebar"; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // Verificação de autenticação
    if (!loading && !user?.token) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
      router.push("/login");
    }
  }, [user, loading, router, toast]);

  // Ecrã de carregamento
  if (loading || !user?.token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    // 2. Envolva tudo com o SidebarProvider
    <SidebarProvider>
      {/* O div principal agora é controlado pelo provider */}
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        {/* Apenas o <main> terá scroll */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </SidebarProvider>
  );
}