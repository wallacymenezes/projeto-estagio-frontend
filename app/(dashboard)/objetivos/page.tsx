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
import { DataTable } from "@/components/data-table";
import { ObjetivoDialog } from "@/components/objetivo-dialog";
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
import { Progress } from "@/components/ui/progress";
import { StackedProgressBar } from "@/components/ui/stacked-progress-bar";

import type { Objective } from "@/models/Objective";
import type { Investment } from "@/models/Investment";

const PROGRESS_COLORS = [
  '#60a5fa', // blue-400
  '#4ade80', // green-400
  '#fbbf24', // amber-400
  '#f87171', // red-400
  '#a78bfa', // violet-400
  '#2dd4bf', // teal-400
  '#fb923c', // orange-400
  '#f472b6', // pink-400
];

export default function ObjetivosPage() {
  const {
    Objectives,
    Investments,
    fetchObjectives,
    fetchInvestments,
    deleteObjective,
  } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(
    null
  );

  useEffect(() => {
    fetchObjectives();
    fetchInvestments();
  }, [fetchObjectives, fetchInvestments]);

  const handleEdit = (objective: Objective) => {
    setSelectedObjective(objective);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteObjective(id);
      toast({
        title: "Objetivo excluído",
        description: "O objetivo foi excluído com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o objetivo.",
        variant: "destructive",
      });
    }
  };

  const objetivosComValorAtual = useMemo(() => {
    return Objectives.map((obj) => {
      const relatedInvestments = Investments.filter(
        (inv) => inv.objectiveId === obj.id
      );
      const valorAtual = relatedInvestments.reduce((acc, inv) => acc + inv.value, 0);

      return {
        ...obj,
        valorAtual,
        relatedInvestments,
      };
    });
  }, [Objectives, Investments]);

  const columns: ColumnDef<Objective & { valorAtual: number; relatedInvestments: Investment[] }>[] = [
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
      accessorKey: "target",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Valor Alvo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatCurrency(row.getValue("target")),
    },
    {
      id: "valorAtual",
      header: "Valor Atual",
      cell: ({ row }) => formatCurrency(row.original.valorAtual),
    },
    {
      id: "progresso",
      header: "Progresso",
      cell: ({ row }) => {
        const { valorAtual, target: valorAlvo, relatedInvestments } = row.original;
        const progressoTotal = valorAlvo > 0 ? (valorAtual / valorAlvo) * 100 : 0;
        
        const segments = relatedInvestments.map((inv, index) => ({
          value: valorAlvo > 0 ? (inv.value / valorAlvo) * 100 : 0,
          color: PROGRESS_COLORS[index % PROGRESS_COLORS.length],
          tooltip: `${inv.name}: ${formatCurrency(inv.value)}`
        }));

        return (
          <div className="w-full">
            <div className="flex justify-between mb-1 text-xs">
              <span>{progressoTotal.toFixed(0)}%</span>
              <span>
                {formatCurrency(valorAtual)} de {formatCurrency(valorAlvo)}
              </span>
            </div>
            {/* Mantém a barra colorida na tabela */}
            <StackedProgressBar segments={segments} />
          </div>
        );
      },
    },
    {
      accessorKey: "term",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Prazo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const term = row.getValue("term") as string;
        return term ? new Date(term + 'T00:00:00').toLocaleDateString("pt-BR") : "Sem prazo";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const objective = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(objective)}
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
                    Tem certeza que deseja excluir este objetivo? Esta ação não
                    pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(objective.id)}
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

  const totalObjectives = objetivosComValorAtual.length;
  const valorTotalAlvo = objetivosComValorAtual.reduce(
    (acc, obj) => acc + obj.target,
    0
  );
  const valorTotalAtual = objetivosComValorAtual.reduce(
    (acc, obj) => acc + obj.valorAtual,
    0
  );
  const progressoGeral =
    valorTotalAlvo > 0 ? (valorTotalAtual / valorTotalAlvo) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Objetivos</h1>
        <Button
          onClick={() => {
            setSelectedObjective(null);
            setIsDialogOpen(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Objetivo
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Objetivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalObjectives}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Progresso Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressoGeral.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground mb-1">
              {formatCurrency(valorTotalAtual)} de{" "}
              {formatCurrency(valorTotalAlvo)}
            </div>
            {/* CORREÇÃO: Usando o componente Progress padrão com a cor roxa */}
            <Progress value={progressoGeral} className="h-2 [&>div]:bg-purple-600" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Objetivos</CardTitle>
          <CardDescription>
            Gerencie todos os seus objetivos financeiros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={objetivosComValorAtual}
            searchColumn="name"
            searchPlaceholder="Filtrar por nome..."
          />
        </CardContent>
      </Card>

      <ObjetivoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        objetivo={selectedObjective}
      />
    </div>
  );
}