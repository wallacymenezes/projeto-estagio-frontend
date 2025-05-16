import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { DataProvider } from "@/contexts/data-context"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

// Add the Google Sign-In script to the head
export const metadata = {
  title: "FinanceU - Gerenciador Financeiro para Universitários",
  description: "Gerencie suas finanças de forma simples e eficiente",
    generator: 'v0.dev'
}

// Add a script component for Google Sign-In
function GoogleSignInScript() {
  return <script src="https://accounts.google.com/gsi/client" async defer />
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <GoogleSignInScript />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <DataProvider>
              {children}
              <Toaster />
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
