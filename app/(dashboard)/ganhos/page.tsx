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
import { DateRangePicker, type DateRange } from "@/components/date-range-picker";
import { DataTable } from "@/components/data-table";
import { GanhoDialog } from "@/components/ganho-dialog";
import { formatCurrency } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Plus, Trash, ListChecksIcon, BanknoteIcon } from "lucide-react";
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
import type { Earning } from "@/models/Earning";

export default function GanhosPage() {
  const { Earnings, deleteEarning, dateRange, setDateRange } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGanho, setSelectedGanho] = useState<Earning | null>(null);

  const filteredGanhos = useMemo(() => {
    if (!Earnings || !dateRange?.from || !dateRange?.to) return [];
    return Earnings.filter((ganho) => {
      const date = new Date(ganho.recebimento || ganho.creationDate);
      return date >= dateRange.from! && date <= dateRange.to!;
    });
  }, [Earnings, dateRange]);


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
      header: "Ganho",
    },
    {
      accessorKey: "value",
      header: () => <div className="text-right">Valor</div>,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("value"))}</div>,
    },
    {
      accessorKey: "recebimento",
      header: () => <div className="hidden md:table-cell">Data</div>,
      cell: ({ row }) => {
        const dateValue = row.getValue("recebimento") as string;
        if (!dateValue) return <span className="hidden md:table-cell">N/A</span>;
        return <span className="hidden md:table-cell">{new Date(dateValue).toLocaleDateString("pt-BR")}</span>;
      }
    },
    {
      accessorKey: "wage",
      header: () => <div className="hidden sm:table-cell text-center">Recorrente</div>,
      cell: ({ row }) => <div className="hidden sm:table-cell text-center">{row.getValue("wage") ? "Sim" : "Não"}</div>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Ações</div>,
      cell: ({ row }) => {
        const ganho = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(ganho)}><Edit className="h-4 w-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>Tem certeza que deseja excluir este ganho? Esta ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(ganho.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const totalGanhos = useMemo(() => 
    filteredGanhos.reduce((acc, ganho) => acc + ganho.value, 0),
    [filteredGanhos]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Ganhos</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <DateRangePicker onDateChange={setDateRange} />
          <Button onClick={() => { setSelectedGanho(null); setIsDialogOpen(true); }} className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600">
            <Plus className="mr-2 h-4 w-4" />
            Novo Ganho
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ganhos</CardTitle>
            <BanknoteIcon className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalGanhos)}</div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantidade de Registros</CardTitle>
            <ListChecksIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredGanhos.length}</div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>
      </div>

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
            searchPlaceholder="Filtrar por nome..."
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