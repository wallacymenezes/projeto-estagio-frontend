"use client";

import { useState, useEffect, useMemo } from "react";
import { useData } from "@/contexts/data-context";
import { Variants } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRangePicker, type DateRange } from "@/components/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart } from "@/components/charts";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanknoteIcon,
  CoinsIcon,
  LineChartIcon,
} from "lucide-react";

export default function DashboardPage() {
  const {
    Earnings,
    Expenses,
    Investments,
    Objectives,
    Categorys,
    // 1. Obter o estado do filtro e a função para atualizá-lo do contexto
    dateRange,
    setDateRange,
  } = useData();

  const [comparisons, setComparisons] = useState({
    earnings: 0,
    expenses: 0,
    investments: 0,
  });

  // 2. Filtros de dados agora verificam se dateRange e suas propriedades existem
  const filteredExpenses = useMemo(() => {
    if (!Expenses || !dateRange?.from || !dateRange?.to) return [];
    return Expenses.filter((expense) => {
      const dateToFilter = new Date(expense.vencimento || expense.creationDate);
      return dateToFilter >= dateRange.from! && dateToFilter <= dateRange.to!;
    });
  }, [Expenses, dateRange]);

  const filteredEarnings = useMemo(() => {
    if (!Earnings || !dateRange?.from || !dateRange?.to) return [];
    return Earnings.filter((earning) => {
      const dateToFilter = new Date(earning.recebimento || earning.creationDate);
      return dateToFilter >= dateRange.from! && dateToFilter <= dateRange.to!;
    });
  }, [Earnings, dateRange]);

  const filteredInvestments = useMemo(() => {
    if (!Investments || !dateRange?.from || !dateRange?.to) return [];
    return Investments.filter((investment) => {
      const date = new Date(investment.creation_date);
      return date >= dateRange.from! && date <= dateRange.to!;
    });
  }, [Investments, dateRange]);
  
  // 3. Cálculos de totais e gráficos com useMemo para performance
  const totalEarnings = useMemo(() => filteredEarnings.reduce((acc, e) => acc + e.value, 0), [filteredEarnings]);
  const totalExpenses = useMemo(() => filteredExpenses.reduce((acc, e) => acc + e.value, 0), [filteredExpenses]);
  const totalInvestments = useMemo(() => filteredInvestments.reduce((acc, i) => acc + i.value, 0), [filteredInvestments]);
  const totalDespesasPagas = useMemo(() => filteredExpenses.filter(e => e.status === "PAID").reduce((acc, e) => acc + e.value, 0), [filteredExpenses]);
  const saldoEmConta = useMemo(() => totalEarnings - totalDespesasPagas - totalInvestments, [totalEarnings, totalDespesasPagas, totalInvestments]);

  const expensesByCategory = useMemo(() => 
    filteredExpenses.reduce<Record<string, number>>((acc, expense) => {
      const categoryName = expense.category?.name || "Sem categoria";
      acc[categoryName] = (acc[categoryName] ?? 0) + expense.value;
      return acc;
    }, {}), 
  [filteredExpenses]);

  const expensesByDay = useMemo(() =>
    filteredExpenses.reduce<Record<string, number>>((acc, expense) => {
        const day = new Date(expense.vencimento || expense.creationDate).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' });
        acc[day] = (acc[day] ?? 0) + expense.value;
        return acc;
      }, {}), 
  [filteredExpenses]);


  // 4. Cálculo de comparações com o período anterior
  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return;

    const duration = dateRange.to.getTime() - dateRange.from.getTime();
    if (duration <= 0) return;
    
    const prevPeriodEnd = new Date(dateRange.from);
    const prevPeriodStart = new Date(prevPeriodEnd.getTime() - duration);

    const prevEarningsTotal = Earnings.filter(e => {
      const date = new Date(e.recebimento || e.creationDate);
      return date >= prevPeriodStart && date < prevPeriodEnd;
    }).reduce((acc, e) => acc + e.value, 0);

    const prevExpensesTotal = Expenses.filter(e => {
      const date = new Date(e.vencimento || e.creationDate);
      return date >= prevPeriodStart && date < prevPeriodEnd;
    }).reduce((acc, e) => acc + e.value, 0);

    const earningsComparison = prevEarningsTotal === 0 ? (totalEarnings > 0 ? 100 : 0) : ((totalEarnings - prevEarningsTotal) / prevEarningsTotal) * 100;
    const expensesComparison = prevExpensesTotal === 0 ? (totalExpenses > 0 ? 100 : 0) : ((totalExpenses - prevExpensesTotal) / prevExpensesTotal) * 100;

    setComparisons({
      earnings: Number(earningsComparison.toFixed(1)),
      expenses: Number(expensesComparison.toFixed(1)),
      investments: 0, // Lógica para investimentos pode ser adicionada aqui
    });
  }, [dateRange, Earnings, Expenses, totalEarnings, totalExpenses]);

  const showComparisons = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return false;
    const durationDays = (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24);
    return durationDays > 27 && durationDays < 32;
  }, [dateRange]);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <DateRangePicker onDateChange={(range) => range && setDateRange(range)} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card Total de Ganhos */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={0}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Ganhos</CardTitle>
              <ArrowUpIcon className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalEarnings)}</div>
              {showComparisons && (
                <div className="flex items-center mt-1 text-xs">
                  <div className={`flex items-center ${comparisons.earnings >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {comparisons.earnings >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                    <span>{Math.abs(comparisons.earnings)}%</span>
                  </div>
                  <span className="text-muted-foreground ml-1">vs. mês anterior</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Total de Gastos */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={1}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
              <ArrowDownIcon className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</div>
              {showComparisons && (
                <div className="flex items-center mt-1 text-xs">
                  <div className={`flex items-center ${comparisons.expenses <= 0 ? "text-green-500" : "text-red-500"}`}>
                    {comparisons.expenses <= 0 ? <ArrowDownIcon className="h-4 w-4" /> : <ArrowUpIcon className="h-4 w-4" />}
                    <span>{Math.abs(comparisons.expenses)}%</span>
                  </div>
                  <span className="text-muted-foreground ml-1">vs. mês anterior</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Investimentos Ativos */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={2}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Investimentos Ativos</CardTitle>
                    <LineChartIcon className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalInvestments)}</div>
                     <p className="text-xs text-muted-foreground">total aplicado no período</p>
                </CardContent>
            </Card>
        </motion.div>

        {/* Card Saldo em Conta */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={3}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo em Conta</CardTitle>
              <BanknoteIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldoEmConta >= 0 ? '' : 'text-red-500'}`}>{formatCurrency(saldoEmConta)}</div>
              <p className="text-xs text-muted-foreground">Ganhos - Despesas Pagas - Investimentos</p>
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
              </CardHeader>
              <CardContent className="h-80">
                <PieChart data={Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }))} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Dia</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart data={Object.entries(expensesByDay).map(([date, value]) => ({ date, value }))} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="summary">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BanknoteIcon className="h-5 w-5 text-green-500" /><span>Últimos Ganhos</span></CardTitle>
              </CardHeader>
              <CardContent>
                {filteredEarnings.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredEarnings.slice(0, 5).map((earning) => (
                      <li key={earning.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                        <div>
                          <p className="font-medium">{earning.name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(earning.recebimento || earning.creationDate).toLocaleDateString("pt-BR")}</p>
                        </div>
                        <span className="font-semibold text-green-500">{formatCurrency(earning.value)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nenhum ganho no período</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CoinsIcon className="h-5 w-5 text-red-500" /><span>Últimos Gastos</span></CardTitle>
              </CardHeader>
              <CardContent>
                {filteredExpenses.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredExpenses.slice(0, 5).map((expense) => (
                      <li key={expense.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                        <div>
                          <p className="font-medium">{expense.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {expense.category?.name || "Sem categoria"} • {new Date(expense.vencimento || expense.creationDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <span className="font-semibold text-red-500">{formatCurrency(expense.value)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nenhum gasto no período</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}