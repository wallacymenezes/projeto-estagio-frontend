"use client";

import { useState, useEffect } from "react";
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
import { ArrowUpDown, Edit, Plus, Trash } from "lucide-react";
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
import type { Expense } from "@/models/Expense";
import { DailyExpensesChart } from "@/components/DailyExpensesChart";
import { useAuth } from "@/contexts/auth-context";

export default function DespesasPage() {
  const { Expenses, Categorys, fetchExpenses, fetchCategorys, deleteExpense } =
    useData();

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDespesa, setSelectedDespesa] = useState<Expense | null>(null);
  const [filteredDespesas, setFilteredDespesas] = useState<Expense[]>([]);
  const { user } = useAuth();

  const [hasLoadedData, setHasLoadedData] = useState(false);

  useEffect(() => {
    if (user?.token && !hasLoadedData) {
      const fetchData = async () => {
        try {
          await Promise.all([fetchExpenses(), fetchCategorys()]);
          console.log("Despesas e categorias carregadas com sucesso.");
          setHasLoadedData(true);
        } catch (error) {
          console.error("Erro no fetch:", error);
        }
      };
      fetchData();
    }
  }, [hasLoadedData, user]);

  // Filtrar despesas pelo intervalo de datas
  useEffect(() => {
    setFilteredDespesas(
      Expenses.filter((despesa) => {
        const date = new Date(despesa.creationDate);
        return date >= dateRange.from && date <= dateRange.to;
      })
    );
  }, [Expenses, dateRange]);

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

  // Colunas para DataTable
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
      accessorKey: "category.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Categoria
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.original.category?.name || "Sem categoria",
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

  const totalDespesas = filteredDespesas.reduce(
    (acc, despesa) => acc + despesa.value,
    0
  );

  // Preparar dados para o gráfico
  const despesasPorCategoria = filteredDespesas.reduce<Record<string, number>>(
    (acc, despesa) => {
      // Obtém o id da categoria da despesa
      const categoryId =
        typeof despesa.category === "object" && despesa.category !== null
          ? despesa.category.id
          : despesa.category; // pode ser id direto

      // Busca a categoria completa no array Categorys
      const categoria = Categorys.find((cat) => cat.id === categoryId);

      // Usa o nome da categoria ou "Sem categoria" se não encontrar
      const nomeCategoria = categoria?.name || "Sem categoria";

      acc[nomeCategoria] = (acc[nomeCategoria] ?? 0) + despesa.value;
      return acc;
    },
    {}
  );

  const despesasPorDia = filteredDespesas.reduce<Record<string, number>>(
    (acc, despesa) => {
      const dia = new Date(despesa.creationDate).toLocaleDateString("pt-BR");
      acc[dia] = (acc[dia] ?? 0) + despesa.value;
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <DateRangePicker
            date={dateRange} // Aqui passamos o valor de 'dateRange' com as propriedades 'from' e 'to' como obrigatórias
            onDateChange={(date) => {
              if (date.from && date.to) {
                setDateRange({ from: date.from, to: date.to });
              }
            }} // Função para atualizar 'dateRange'
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>
              Visão geral das suas despesas no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Despesas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalDespesas)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Quantidade de Registros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredDespesas.length}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <DailyExpensesChart />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição das suas despesas por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <PieChart
              data={Object.entries(despesasPorCategoria).map(
                ([name, value]) => ({ name, value })
              )}
            />
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
            data={filteredDespesas}
            searchColumn="name"
            searchPlaceholder="Filtrar por descrição..."
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
