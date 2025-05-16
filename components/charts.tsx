"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface ChartData {
  name: string
  value: number
}

interface PieChartProps {
  data: ChartData[]
}

export function PieChart({ data }: PieChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Cores para o gráfico
  const COLORS = [
    "#f87171", // red-400
    "#fb923c", // orange-400
    "#fbbf24", // amber-400
    "#facc15", // yellow-400
    "#a3e635", // lime-400
    "#4ade80", // green-400
    "#34d399", // emerald-400
    "#2dd4bf", // teal-400
    "#22d3ee", // cyan-400
    "#38bdf8", // sky-400
    "#60a5fa", // blue-400
    "#818cf8", // indigo-400
    "#a78bfa", // violet-400
    "#c084fc", // purple-400
    "#e879f9", // fuchsia-400
    "#f472b6", // pink-400
    "#fb7185", // rose-400
  ]

  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-full flex items-center justify-center">Carregando gráfico...</div>
  }

  // Se não houver dados, mostrar mensagem
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Nenhum dado disponível para exibir o gráfico
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPie>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          animationDuration={500}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
            borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
            color: theme === "dark" ? "#f9fafb" : "#111827",
          }}
        />
        <Legend />
      </RechartsPie>
    </ResponsiveContainer>
  )
}

interface BarChartProps {
  data: {
    date: string
    value: number
  }[]
}

export function BarChart({ data }: BarChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-full flex items-center justify-center">Carregando gráfico...</div>
  }

  // Se não houver dados, mostrar mensagem
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Nenhum dado disponível para exibir o gráfico
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBar
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
        <XAxis dataKey="date" stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} />
        <YAxis stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} tickFormatter={(value) => formatCurrency(value)} />
        <BarTooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
            borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
            color: theme === "dark" ? "#f9fafb" : "#111827",
          }}
        />
        <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={500} />
      </RechartsBar>
    </ResponsiveContainer>
  )
}
