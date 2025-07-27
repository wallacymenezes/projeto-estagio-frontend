"use client";

import { useState, useMemo } from "react";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRangePicker, type DateRange } from "@/components/date-range-picker";
import { DataTable } from "@/components/data-table";
import { DespesaDialog } from "@/components/despesa-dialog";
import { formatCurrency } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash, WalletIcon, TrendingUpIcon, CoinsIcon, ArrowUpIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import type { Expense, ExpenseStatus } from "@/models/Expense";

export default function DespesasPage() {
  const {
    Expenses,
    Categorys,
    Earnings,
    Investments,
    deleteExpense,
    dateRange,
    setDateRange,
  } = useData();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDespesa, setSelectedDespesa] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    if (!Expenses || !dateRange?.from || !dateRange?.to) return [];
    return Expenses.filter((despesa) => {
      const date = new Date(despesa.vencimento || despesa.creationDate);
      return date >= dateRange.from! && date <= dateRange.to!;
    });
  }, [Expenses, dateRange]);

  const filteredEarnings = useMemo(() => {
    if (!Earnings || !dateRange?.from || !dateRange?.to) return [];
    return Earnings.filter((earning) => {
      const date = new Date(earning.recebimento || earning.creationDate);
      return date >= dateRange.from! && date <= dateRange.to!;
    });
  }, [Earnings, dateRange]);

  const filteredInvestments = useMemo(() => {
    if (!Investments || !dateRange?.from || !dateRange?.to) return [];
    return Investments.filter((investment) => {
      const date = new Date(investment.creation_date);
      return date >= dateRange.from! && date <= dateRange.to!;
    });
  }, [Investments, dateRange]);


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

  // Definição de colunas com classes de responsividade
  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "name",
      header: "Despesa",
    },
    {
      id: "categoryName",
      header: () => <div className="hidden sm:table-cell">Categoria</div>,
      cell: ({ row }) => {
        const categoryName = row.original.category?.name;
        return <div className="hidden sm:table-cell">{categoryName || "N/A"}</div>;
      },
    },
    {
      accessorKey: "value",
      header: () => <div className="text-right">Valor</div>,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("value"))}</div>,
    },
    {
      accessorKey: "vencimento",
      header: () => <div className="hidden md:table-cell">Vencimento</div>,
      cell: ({ row }) => {
        const dateValue = row.getValue("vencimento") as string;
        if (!dateValue) return <span className="hidden md:table-cell">N/A</span>;
        return <span className="hidden md:table-cell">{new Date(dateValue + 'T00:00:00').toLocaleDateString("pt-BR")}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status as ExpenseStatus;
        let statusText = "";
        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
        
        switch (status) {
          case "PAID": statusText = "Pago"; badgeVariant = "secondary"; break;
          case "PENDING": statusText = "Pendente"; badgeVariant = "default"; break;
          case "OVERDUE": statusText = "Atrasada"; badgeVariant = "destructive"; break;
          case "CANCELLED": statusText = "Cancelada"; badgeVariant = "outline"; break;
          default: statusText = "N/A";
        }
        return <Badge variant={badgeVariant} className="text-xs">{statusText}</Badge>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Ações</div>,
      cell: ({ row }) => {
        const despesa = row.original;
        return (
          <div className="flex items-center justify-end">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(despesa)}><Edit className="h-4 w-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(despesa.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const totalGanhosPeriodo = useMemo(() => filteredEarnings.reduce((acc, earning) => acc + earning.value, 0), [filteredEarnings]);
  const totalDespesasPagasPeriodo = useMemo(() => filteredExpenses.filter(expense => expense.status === "PAID").reduce((acc, expense) => acc + expense.value, 0), [filteredExpenses]);
  const totalTodasDespesasPeriodo = useMemo(() => filteredExpenses.reduce((acc, expense) => acc + expense.value, 0), [filteredExpenses]);
  const totalInvestidoPeriodo = useMemo(() => filteredInvestments.reduce((acc, investment) => acc + investment.value, 0), [filteredInvestments]);
  const saldoEmConta = useMemo(() => totalGanhosPeriodo - totalDespesasPagasPeriodo - totalInvestidoPeriodo, [totalGanhosPeriodo, totalDespesasPagasPeriodo, totalInvestidoPeriodo]);
  const saldoASobrar = useMemo(() => totalGanhosPeriodo - totalTodasDespesasPeriodo - totalInvestidoPeriodo, [totalGanhosPeriodo, totalTodasDespesasPeriodo, totalInvestidoPeriodo]);
  
  return (
    <div className="space-y-6 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <DateRangePicker onDateChange={setDateRange} />
          <Button onClick={() => { setSelectedDespesa(null); setIsDialogOpen(true); }} className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600">
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <CoinsIcon className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalTodasDespesasPeriodo)}</div>
            <p className="text-xs text-muted-foreground">{filteredExpenses.length} registro(s) no período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo em Conta</CardTitle>
            <WalletIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoEmConta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(saldoEmConta)}</div>
            <p className="text-xs text-muted-foreground">Ganhos - Despesas Pagas - Invest.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo a Sobrar</CardTitle>
            <TrendingUpIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoASobrar >=0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>{formatCurrency(saldoASobrar)}</div>
            <p className="text-xs text-muted-foreground">Ganhos - Todas Despesas - Invest.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ganhos</CardTitle>
            <ArrowUpIcon className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalGanhosPeriodo)}</div>
            <p className="text-xs text-muted-foreground">{filteredEarnings.length} registro(s) no período</p>
          </CardContent>
        </Card>
      </div>

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