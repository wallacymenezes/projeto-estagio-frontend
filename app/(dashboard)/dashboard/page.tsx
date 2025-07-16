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
import { DateRangePicker } from "@/components/date-range-picker";
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
  } = useData();

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const [comparisons, setComparisons] = useState({
    earnings: 0,
    expenses: 0,
    investments: 0,
    objectives: 0,
  });

  function handleDateChange(range: { from?: Date; to?: Date }) {
    if (range.from && range.to) {
      setDateRange({ from: range.from, to: range.to });
    }
  }

  const filteredExpenses = useMemo(() => {
    return Expenses.filter((expense) => {
      // CORREÇÃO: Usa 'vencimento' ou 'creationDate' como fallback
      const dateToFilter = new Date(expense.vencimento || expense.creationDate);
      if (!dateRange.from || !dateRange.to) return true;
      return dateToFilter >= dateRange.from && dateToFilter <= dateRange.to;
    });
  }, [Expenses, dateRange]);

  const getCategoryName = (categoryId: number | string | undefined) => {
    if (!categoryId) return "Sem categoria";
    const cat = Categorys.find((c) => c.id === categoryId);
    return cat?.name ?? "Sem categoria";
  };

  const expensesByCategory = useMemo(() => 
    filteredExpenses.reduce<Record<string, number>>(
      (acc, expense) => {
        const categoryId =
          typeof expense.category === "object"
            ? expense.category?.id
            : expense.category;
        const categoryName = getCategoryName(categoryId);
        acc[categoryName] = (acc[categoryName] ?? 0) + expense.value;
        return acc;
      },
      {}
    ), [filteredExpenses, Categorys]
  );

  const filteredEarnings = useMemo(() => {
    return Earnings.filter((earning) => {
      // CORREÇÃO: Usa 'recebimento' ou 'creationDate' como fallback
      const dateToFilter = new Date(earning.recebimento || earning.creationDate);
      if (!dateRange.from || !dateRange.to) return true;
      return dateToFilter >= dateRange.from && dateToFilter <= dateRange.to;
    });
  }, [Earnings, dateRange]);


  const filteredInvestments = useMemo(() => {
    return Investments.filter((investment) => {
      const date = new Date(investment.creation_date ?? investment.creation_date);
      if (!dateRange.from || !dateRange.to) return true;
      return date >= dateRange.from && date <= dateRange.to;
    });
  }, [Investments, dateRange]);

  const totalEarnings = useMemo(() => 
    filteredEarnings.reduce((acc, earning) => acc + earning.value, 0),
    [filteredEarnings]
  );
  
  const totalExpenses = useMemo(() =>
    filteredExpenses.reduce((acc, expense) => acc + expense.value, 0),
    [filteredExpenses]
  );

  const totalInvestments = useMemo(() => 
    filteredInvestments.reduce((acc, investment) => acc + investment.value, 0),
    [filteredInvestments]
  );
  
  const totalObjectives = useMemo(() =>
    Objectives.reduce((acc, obj) => acc + (obj.target ?? 0), 0),
    [Objectives]
  );

  useEffect(() => {
    const duration = dateRange.to.getTime() - dateRange.from.getTime();
    const prevPeriodEnd = new Date(dateRange.from);
    const prevPeriodStart = new Date(prevPeriodEnd.getTime() - duration);

    const prevEarnings = Earnings.filter((earning) => {
      const date = new Date(earning.recebimento || earning.creationDate);
      return date >= prevPeriodStart && date < prevPeriodEnd;
    });
    const prevExpenses = Expenses.filter((expense) => {
      const date = new Date(expense.vencimento || expense.creationDate);
      return date >= prevPeriodStart && date < prevPeriodEnd;
    });
    const prevInvestments = Investments.filter((investment) => {
      const date = new Date(
        investment.creation_date ?? investment.creation_date
      );
      return date >= prevPeriodStart && date < prevPeriodEnd;
    });

    const prevTotalEarnings = prevEarnings.reduce((acc, e) => acc + e.value, 0);
    const prevTotalExpenses = prevExpenses.reduce((acc, e) => acc + e.value, 0);
    const prevTotalInvestments = prevInvestments.reduce(
      (acc, e) => acc + e.value,
      0
    );

    const earningsComparison =
      prevTotalEarnings === 0
        ? 100
        : ((totalEarnings - prevTotalEarnings) / prevTotalEarnings) * 100;
    const expensesComparison =
      prevTotalExpenses === 0
        ? 0
        : ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100;
    const investmentsComparison =
      prevTotalInvestments === 0
        ? 100
        : ((totalInvestments - prevTotalInvestments) / prevTotalInvestments) *
          100;

    setComparisons({
      earnings: Number(earningsComparison.toFixed(2)),
      expenses: Number(expensesComparison.toFixed(2)),
      investments: Number(investmentsComparison.toFixed(2)),
      objectives: 0,
    });
  }, [
    dateRange,
    Earnings,
    Expenses,
    Investments,
    totalEarnings,
    totalExpenses,
    totalInvestments,
  ]);

  const expensesByDay = useMemo(() =>
    filteredExpenses.reduce<Record<string, number>>(
      (acc, expense) => {
        const day = new Date(expense.vencimento || expense.creationDate).toLocaleDateString("pt-BR");
        acc[day] = (acc[day] ?? 0) + expense.value;
        return acc;
      },
      {}
    ), [filteredExpenses]
  );

  const showComparisons = useMemo(() => {
    const isFullMonth =
      dateRange.from.getDate() === 1 &&
      dateRange.to.getDate() ===
        new Date(
          dateRange.to.getFullYear(),
          dateRange.to.getMonth() + 1,
          0
        ).getDate();
    const isLessThan32Days =
      (dateRange.to.getTime() - dateRange.from.getTime()) /
        (1000 * 60 * 60 * 24) <
      32;
    return isFullMonth && isLessThan32Days;
  }, [dateRange]);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.42, 0, 0.58, 1]
      }
    })
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <DateRangePicker onDateChange={handleDateChange} />
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
              <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
              {showComparisons && (
                <div className="flex items-center mt-1">
                  <div className={`flex items-center ${comparisons.earnings >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {comparisons.earnings >= 0 ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
                    <span className="text-sm font-medium">{Math.abs(comparisons.earnings).toFixed(1)}%</span>
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
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              {showComparisons && (
                <div className="flex items-center mt-1">
                  <div className={`flex items-center ${comparisons.expenses <= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {comparisons.expenses <= 0 ? <ArrowDownIcon className="h-4 w-4 mr-1" /> : <ArrowUpIcon className="h-4 w-4 mr-1" />}
                    <span className="text-sm font-medium">{Math.abs(comparisons.expenses).toFixed(1)}%</span>
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
              <div className="text-2xl font-bold">{formatCurrency(totalInvestments)}</div>
              {showComparisons && (
                <p className={`text-xs ${comparisons.investments >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {comparisons.investments >= 0 ? "+" : ""}{comparisons.investments}% em relação ao período anterior
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={3}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo em Conta</CardTitle>
              <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900">
                <BanknoteIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalEarnings - (totalExpenses + totalInvestments))}</div>
              <p className="text-xs text-muted-foreground">Valor restante dos ganhos</p>
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
                <PieChart data={Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }))} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Dia</CardTitle>
                <CardDescription>Evolução dos seus gastos diários no período selecionado</CardDescription>
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
                <CardTitle className="flex items-center gap-2">
                  <BanknoteIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Últimos Ganhos</span>
                </CardTitle>
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
                        <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(earning.value)}</span>
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
                {filteredExpenses.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredExpenses.slice(0, 5).map((expense) => (
                      <li key={expense.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                        <div>
                          <p className="font-medium">{expense.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {getCategoryName(typeof expense.category === "object" ? expense.category?.id : expense.category)} •{" "}
                            {new Date(expense.vencimento || expense.creationDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(expense.value)}</span>
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
  );
}