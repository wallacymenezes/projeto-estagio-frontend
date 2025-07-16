"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "next-themes";
import {
  BarChart3,
  CreditCard,
  Home,
  LogOut,
  Moon,
  PiggyBank,
  Sun,
  Tag,
  Target,
  User,
} from "lucide-react";

import { 
  Sidebar as SidebarContainer, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const sidebarItems = [
    { title: "Dashboard", href: "/dashboard", icon: Home },
    { title: "Ganhos", href: "/ganhos", icon: PiggyBank },
    { title: "Despesas", href: "/despesas", icon: CreditCard },
    { title: "Investimentos", href: "/investimentos", icon: BarChart3 },
    { title: "Objetivos", href: "/objetivos", icon: Target },
    { title: "Categorias", href: "/categorias", icon: Tag },
    { title: "Perfil", href: "/perfil", icon: User },
  ];

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <PiggyBank className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FinanceU
          </span>
        </Link>
        
      </SidebarHeader>

      <SidebarContent>
        {/* CORREÇÃO: Aumentado o espaçamento entre os itens do menu */}
        <SidebarMenu className="gap-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={isActive} >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
             <SidebarMenuButton 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
             >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>
             </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="text-red-600 dark:text-red-400">
              <LogOut className="h-5 w-5"/>
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarContainer>
  );
}