// wallacymenezes/projeto-estagio-frontend/projeto-estagio-frontend-d0eaefe2ab734cdf8502a055fd12d3c722944237/app/(dashboard)/despesas/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRangePicker } from "@/components/date-range-picker";
import { DataTable } from "@/components/data-table";
import { DespesaDialog } from "@/components/despesa-dialog";
import { formatCurrency } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Plus, Trash, WalletIcon, TrendingUpIcon, CoinsIcon, ArrowUpIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { PieChart } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import type { Expense, ExpenseStatus } from "@/models/Expense";
import { DailyExpensesChart } from "@/components/DailyExpensesChart";
import type { Earning } from "@/models/Earning";
import type { Investment } from "@/models/Investment";

export default function DespesasPage() {
  const {
    Expenses,
    Categorys,
    Earnings,
    Investments,
    fetchExpenses,
    fetchCategorys,
    fetchEarnings,
    fetchInvestments,
    deleteExpense,
  } = useData();

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDespesa, setSelectedDespesa] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() =>
    Expenses.filter((despesa) => {
      if (!despesa || !despesa.creationDate) return false; // Verificação adicional
      const date = new Date(despesa.creationDate);
      return date >= dateRange.from && date <= dateRange.to;
    }), [Expenses, dateRange]);

  const filteredEarnings = useMemo(() =>
    Earnings.filter((earning) => {
      if (!earning || !earning.creationDate) return false;
      const date = new Date(earning.creationDate);
      return date >= dateRange.from && date <= dateRange.to;
    }), [Earnings, dateRange]);

  const filteredInvestments = useMemo(() =>
    Investments.filter((investment) => {
      if (!investment || !investment.creation_date) return false;
      const date = new Date(investment.creation_date);
      return date >= dateRange.from && date <= dateRange.to;
    }), [Investments, dateRange]);


  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchExpenses(),
          fetchCategorys(),
          fetchEarnings(),
          fetchInvestments(),
        ]);
      } catch (error) {
        console.error("DespesasPage: Erro ao buscar dados iniciais", error);
      }
    };
    loadInitialData();
  }, [fetchExpenses, fetchCategorys, fetchEarnings, fetchInvestments]);


  const handleEdit = (despesa: Expense) => {
    setSelectedDespesa(despesa);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteExpense(id);
      toast({
        title: "Despesa excluída",
        description: "A despesa foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a despesa.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      // accessorKey: "category.name", // Usar uma função accessor para segurança
      accessorFn: row => row.category?.name, // Função accessor para obter o nome da categoria
      id: "categoryName", // ID único para a coluna
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Categoria
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const category = row.original.category; // Acessa o objeto category diretamente
        return category?.name || "Sem categoria"; // Exibe o nome ou "Sem categoria"
      }
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Valor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatCurrency(row.getValue("value")),
    },
    {
      accessorKey: "creationDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        new Date(row.getValue("creationDate")).toLocaleDateString("pt-BR"),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.original.status; // Acessar diretamente de row.original
        let statusText = "Desconhecido";
        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
        let customStyle: React.CSSProperties = {};

        switch (status) {
          case "PAID":
            statusText = "Pago";
            badgeVariant = "secondary";
            customStyle = { backgroundColor: 'hsl(var(--chart-2))', color: 'hsl(var(--primary-foreground))', borderColor: 'hsl(var(--chart-2))' };
            break;
          case "PENDING":
            statusText = "Pendente";
            badgeVariant = "default";
            customStyle = { backgroundColor: 'hsl(var(--chart-4))', color: 'hsl(var(--primary-foreground))', borderColor: 'hsl(var(--chart-4))' };
            break;
          case "OVERDUE":
            statusText = "Atrasado";
            badgeVariant = "destructive";
            break;
          default:
             statusText = status ? String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase() : "Desconhecido";
        }
        return <Badge variant={badgeVariant} style={badgeVariant !== 'destructive' ? customStyle : {}}>{statusText}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const despesa = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(despesa)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta despesa? Esta ação não
                    pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(despesa.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const totalGanhosPeriodo = useMemo(() =>
    filteredEarnings.reduce((acc, earning) => acc + earning.value, 0), [filteredEarnings]);

  const totalDespesasPagasPeriodo = useMemo(() =>
    filteredExpenses
      .filter(expense => expense.status === "PAID")
      .reduce((acc, expense) => acc + expense.value, 0), [filteredExpenses]);

  const totalTodasDespesasPeriodo = useMemo(() =>
    filteredExpenses.reduce((acc, expense) => acc + expense.value, 0), [filteredExpenses]);

  const totalInvestidoPeriodo = useMemo(() =>
    filteredInvestments.reduce((acc, investment) => acc + investment.value, 0), [filteredInvestments]);

  const saldoEmConta = useMemo(() =>
    totalGanhosPeriodo - totalDespesasPagasPeriodo - totalInvestidoPeriodo, [totalGanhosPeriodo, totalDespesasPagasPeriodo, totalInvestidoPeriodo]);

  const saldoASobrar = useMemo(() =>
    totalGanhosPeriodo - totalTodasDespesasPeriodo - totalInvestidoPeriodo, [totalGanhosPeriodo, totalTodasDespesasPeriodo, totalInvestidoPeriodo]);


  return (
    <div className="space-y-6 min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <DateRangePicker
            date={dateRange}
            onDateChange={(date) => {
              if (date?.from && date?.to) {
                setDateRange({ from: date.from, to: date.to });
              }
            }}
          />
          <Button
            onClick={() => {
              setSelectedDespesa(null);
              setIsDialogOpen(true);
            }}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do Período</CardTitle>
          <CardDescription>
            Visão geral das suas finanças no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
                <CoinsIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalTodasDespesasPeriodo)}
                </div>
                 <p className="text-xs text-muted-foreground">
                  {filteredExpenses.length} registro(s)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Saldo em Conta</CardTitle>
                <WalletIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${saldoEmConta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(saldoEmConta)}
                </div>
                <p className="text-xs text-muted-foreground">Ganhos - Despesas Pagas - Investimentos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Saldo a Sobrar</CardTitle>
                <TrendingUpIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${saldoASobrar >=0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {formatCurrency(saldoASobrar)}
                </div>
                <p className="text-xs text-muted-foreground">Ganhos - Todas Despesas - Investimentos</p>
              </CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Total de Ganhos
                  </CardTitle>
                   <ArrowUpIcon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalGanhosPeriodo)}
                  </div>
                   <p className="text-xs text-muted-foreground">
                    {filteredEarnings.length} registro(s) no período
                  </p>
                </CardContent>
              </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Despesas</CardTitle>
          <CardDescription>Gerencie todas as suas despesas</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredExpenses}
            searchColumn="name"
            searchPlaceholder="Filtrar por nome..."
          />
        </CardContent>
      </Card>

      <DespesaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        despesa={selectedDespesa}
        categorias={Categorys}
      />
    </div>
  );
}