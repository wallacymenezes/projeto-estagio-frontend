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
import { GanhoDialog } from "@/components/ganho-dialog";
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
import type { Earning } from "@/models/Earning"; // Importa o tipo correto do modelo

export default function GanhosPage() {
  // Usar nomes e tipos do contexto correto:
  const { Earnings, fetchEarnings, deleteEarning } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGanho, setSelectedGanho] = useState<Earning | null>(null); // Ajuste do tipo para Earning
  const [filteredGanhos, setFilteredGanhos] = useState<Earning[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  useEffect(() => {
    setFilteredGanhos(
      Earnings.filter((ganho) => {
        const date = new Date(ganho.creationDate);
        return date >= dateRange.from && date <= dateRange.to;
      })
    );
  }, [Earnings, dateRange]);

  // Função intermediária para corrigir problema do DateRangePicker
  function handleDateChange(range: { from?: Date; to?: Date }) {
    if (range.from && range.to) {
      setDateRange({ from: range.from, to: range.to });
    }
  }

  const handleEdit = (ganho: Earning) => {
    setSelectedGanho(ganho);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEarning(id);
      toast({
        title: "Ganho excluído",
        description: "O ganho foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o ganho.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Earning>[] = [
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
      cell: ({ row }) => row.getValue("name"),
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
      accessorKey: "wage",
      header: "Recorrente",
      cell: ({ row }) => (row.getValue("wage") ? "Sim" : "Não"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ganho = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(ganho)}
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
                    Tem certeza que deseja excluir este ganho? Esta ação não
                    pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(ganho.id)}
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

  const totalGanhos = filteredGanhos.reduce(
    (acc, ganho) => acc + ganho.value,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Ganhos</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <DateRangePicker date={dateRange} onDateChange={handleDateChange} />
          <Button
            onClick={() => {
              setSelectedGanho(null);
              setIsDialogOpen(true);
            }}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Ganho
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
          <CardDescription>
            Visão geral dos seus ganhos no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Ganhos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalGanhos)}
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
                  {filteredGanhos.length}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Ganhos</CardTitle>
          <CardDescription>Gerencie todos os seus ganhos</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredGanhos}
            searchColumn="name"
            searchPlaceholder="Filtrar por descrição..."
          />
        </CardContent>
      </Card>

      <GanhoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ganho={selectedGanho}
      />
    </div>
  );
}
