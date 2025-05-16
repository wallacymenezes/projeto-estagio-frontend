"use client"

import { useState, useEffect } from "react"
import { useData } from "@/contexts/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, PieChart } from "@/components/charts"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"
import { ArrowDownIcon, ArrowUpIcon, BanknoteIcon, CoinsIcon, LineChartIcon, TargetIcon } from "lucide-react"

export default function DashboardPage() {
  const { ganhos, despesas, investimentos, objetivos, fetchGanhos, fetchDespesas, fetchInvestimentos, fetchObjetivos } =
    useData()

  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

  const [comparisons, setComparisons] = useState({
    ganhos: 0,
    despesas: 0,
    investimentos: 0,
    objetivos: 0,
  })

  useEffect(() => {
    fetchGanhos()
    fetchDespesas()
    fetchInvestimentos()
    fetchObjetivos()
  }, [fetchGanhos, fetchDespesas, fetchInvestimentos, fetchObjetivos])

  // Filtrar dados pelo intervalo de datas
  const filteredGanhos = ganhos.filter((ganho) => {
    const date = new Date(ganho.creationDate)
    return date >= dateRange.from && date <= dateRange.to
  })

  const filteredDespesas = despesas.filter((despesa) => {
    const date = new Date(despesa.creationDate)
    return date >= dateRange.from && date <= dateRange.to
  })

  const filteredInvestimentos = investimentos.filter((investimento) => {
    const date = new Date(investimento.creationDate)
    return date >= dateRange.from && date <= dateRange.to
  })

  // Calcular totais
  const totalGanhos = filteredGanhos.reduce((acc, ganho) => acc + ganho.value, 0)
  const totalDespesas = filteredDespesas.reduce((acc, despesa) => acc + despesa.value, 0)
  const totalInvestimentos = filteredInvestimentos.reduce((acc, inv) => acc + inv.value, 0)
  const totalObjetivos = objetivos.reduce((acc, obj) => acc + obj.target, 0)

  // Calcular comparações com período anterior
  useEffect(() => {
    // Calcular o período anterior com a mesma duração
    const duration = dateRange.to.getTime() - dateRange.from.getTime()
    const prevPeriodEnd = new Date(dateRange.from)
    const prevPeriodStart = new Date(prevPeriodEnd.getTime() - duration)

    // Filtrar dados do período anterior
    const prevGanhos = ganhos.filter((ganho) => {
      const date = new Date(ganho.creationDate)
      return date >= prevPeriodStart && date < prevPeriodEnd
    })

    const prevDespesas = despesas.filter((despesa) => {
      const date = new Date(despesa.creationDate)
      return date >= prevPeriodStart && date < prevPeriodEnd
    })

    const prevInvestimentos = investimentos.filter((investimento) => {
      const date = new Date(investimento.creationDate)
      return date >= prevPeriodStart && date < prevPeriodEnd
    })

    // Calcular totais do período anterior
    const prevTotalGanhos = prevGanhos.reduce((acc, ganho) => acc + ganho.value, 0)
    const prevTotalDespesas = prevDespesas.reduce((acc, despesa) => acc + despesa.value, 0)
    const prevTotalInvestimentos = prevInvestimentos.reduce((acc, inv) => acc + inv.value, 0)

    // Calcular percentuais de comparação
    const ganhosComparison = prevTotalGanhos === 0 ? 100 : ((totalGanhos - prevTotalGanhos) / prevTotalGanhos) * 100

    const despesasComparison =
      prevTotalDespesas === 0 ? 0 : ((totalDespesas - prevTotalDespesas) / prevTotalDespesas) * 100

    const investimentosComparison =
      prevTotalInvestimentos === 0
        ? 100
        : ((totalInvestimentos - prevTotalInvestimentos) / prevTotalInvestimentos) * 100

    setComparisons({
      ganhos: Number.parseFloat(ganhosComparison.toFixed(2)),
      despesas: Number.parseFloat(despesasComparison.toFixed(2)),
      investimentos: Number.parseFloat(investimentosComparison.toFixed(2)),
      objetivos: 0, // Não há comparação para objetivos
    })
  }, [dateRange, ganhos, despesas, investimentos, objetivos])

  // Preparar dados para os gráficos
  const despesasPorCategoria = filteredDespesas.reduce(
    (acc, despesa) => {
      const categoria = despesa.category || "Sem categoria"
      if (!acc[categoria]) {
        acc[categoria] = 0
      }
      acc[categoria] += despesa.value
      return acc
    },
    {} as Record<string, number>,
  )

  const despesasPorDia = filteredDespesas.reduce(
    (acc, despesa) => {
      const date = new Date(despesa.creationDate)
      const day = date.toLocaleDateString("pt-BR")
      if (!acc[day]) {
        acc[day] = 0
      }
      acc[day] += despesa.value
      return acc
    },
    {} as Record<string, number>,
  )

  // Verificar se deve mostrar comparações
  const showComparisons = (() => {
    // Se for um mês inteiro (do primeiro ao último dia)
    const isFullMonth =
      dateRange.from.getDate() === 1 &&
      dateRange.to.getDate() === new Date(dateRange.to.getFullYear(), dateRange.to.getMonth() + 1, 0).getDate()

    // Se for um período menor que 32 dias
    const isLessThan32Days = (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24) < 32

    return isFullMonth && isLessThan32Days
  })()

  // Animação para os cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={0}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Ganhos</CardTitle>
              <div className="rounded-full p-2 bg-green-100 dark:bg-green-900">
                <ArrowUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalGanhos)}</div>
              {showComparisons && (
                <div className="flex items-center mt-1">
                  <div
                    className={`flex items-center ${
                      comparisons.ganhos >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {comparisons.ganhos >= 0 ? (
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">{Math.abs(comparisons.ganhos).toFixed(1)}%</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">vs. período anterior</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={1}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
              <div className="rounded-full p-2 bg-red-100 dark:bg-red-900">
                <ArrowDownIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalDespesas)}</div>
              {showComparisons && (
                <div className="flex items-center mt-1">
                  <div
                    className={`flex items-center ${
                      comparisons.despesas <= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {comparisons.despesas <= 0 ? (
                      <ArrowDownIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">{Math.abs(comparisons.despesas).toFixed(1)}%</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">vs. período anterior</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={2}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Investimentos Ativos</CardTitle>
              <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900">
                <LineChartIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvestimentos)}</div>
              {showComparisons && (
                <p
                  className={`text-xs ${comparisons.investimentos >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {comparisons.investimentos >= 0 ? "+" : ""}
                  {comparisons.investimentos}% em relação ao período anterior
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={3}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Objetivos Cadastrados</CardTitle>
              <div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900">
                <TargetIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{objetivos.length}</div>
              <p className="text-xs text-muted-foreground">Total: {formatCurrency(totalObjetivos)}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
        </TabsList>
        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
                <CardDescription>Distribuição dos seus gastos por categoria no período selecionado</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <PieChart data={Object.entries(despesasPorCategoria).map(([name, value]) => ({ name, value }))} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Dia</CardTitle>
                <CardDescription>Evolução dos seus gastos diários no período selecionado</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart data={Object.entries(despesasPorDia).map(([date, value]) => ({ date, value }))} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="summary">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BanknoteIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Últimos Ganhos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredGanhos.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredGanhos.slice(0, 5).map((ganho) => (
                      <li key={ganho.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                        <div>
                          <p className="font-medium">{ganho.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(ganho.creationDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(ganho.value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nenhum ganho no período selecionado</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CoinsIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span>Últimos Gastos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredDespesas.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredDespesas.slice(0, 5).map((despesa) => (
                      <li key={despesa.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                        <div>
                          <p className="font-medium">{despesa.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {despesa.category || "Sem categoria"} •{" "}
                            {new Date(despesa.creationDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(despesa.value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nenhum gasto no período selecionado</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
