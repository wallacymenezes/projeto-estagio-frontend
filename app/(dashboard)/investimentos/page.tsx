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
import { InvestimentoDialog } from "@/components/investimento-dialog";
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
import type { Investment } from "@/models/Investment";

// Função para calcular o rendimento líquido após o Imposto de Renda
const calculateNetReturn = (investment: Investment): number => {
  const { value, percentage, months, investmentType } = investment;

  // 1. Calcula o rendimento bruto para o período
  const annualRate = percentage / 100;
  const grossReturn = value * (annualRate / 12) * months;

  let taxRate = 0;

  // 2. Determina a alíquota do IR com base no tipo de investimento e prazo
  switch (investmentType) {
    case "Tesouro Direto":
    case "Certificado de Depósito Interbancário":
      // Aplica a tabela regressiva (baseada em dias, aproximamos com meses)
      const days = months * 30;
      if (days <= 180) {
        taxRate = 0.225; // 22,5%
      } else if (days <= 360) {
        taxRate = 0.20; // 20%
      } else if (days <= 720) {
        taxRate = 0.175; // 17,5%
      } else {
        taxRate = 0.15; // 15%
      }
      break;

    case "Ações":// Assumindo a mesma regra de ações para simplificar
      taxRate = 0.15; // 15% sobre o lucro
      break;
    
    case "Fundo de Investimento Imobiliário":
    case "Criptomoedas":
    case "Poupança":
      // Isentos para pessoa física
      taxRate = 0;
      break;
      
    default:
      taxRate = 0;
  }

  // 3. Calcula o imposto e o rendimento líquido
  const taxAmount = grossReturn * taxRate;
  const netReturn = grossReturn - taxAmount;

  return netReturn;
};


export default function InvestimentosPage() {
  const { Investments, Objectives, fetchInvestments, fetchObjectives, deleteInvestment } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] =
    useState<Investment | null>(null);

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  useEffect(() => {
    fetchInvestments();
    fetchObjectives();
  }, [fetchInvestments, fetchObjectives]);

  const filteredInvestments = useMemo(() => {
    return Investments.filter((investment) => {
      const date = new Date(investment.creation_date);
      if (!dateRange.from || !dateRange.to) return true;
      return date >= dateRange.from && date <= dateRange.to;
    });
  }, [Investments, dateRange]);

  const handleEdit = (investment: Investment) => {
    setSelectedInvestment(investment);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteInvestment(id);
      toast({
        title: "Investimento excluído",
        description: "O investimento foi excluído com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o investimento.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Investment>[] = [
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
      id: 'objective',
      header: 'Objetivo',
      cell: ({ row }) => {
        const objectiveId = row.original.objectiveId;
        if (!objectiveId) {
          return "Nenhum";
        }
        const objective = Objectives.find(obj => obj.id === objectiveId);
        return objective ? objective.name : "Nenhum";
      },
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
      accessorKey: "percentage",
      header: "Rendimento (% a.a.)",
      cell: ({ row }) => `${row.getValue("percentage")}%`,
    },
    // Nova coluna para o Rendimento Líquido
    {
      id: "netReturn",
      header: "Rendimento Líquido",
      cell: ({ row }) => {
        const netReturn = calculateNetReturn(row.original);
        return formatCurrency(netReturn);
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const investment = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(investment)}
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
                    Tem certeza que deseja excluir este investimento? Esta ação
                    não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(investment.id)}
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

  const totalInvested = useMemo(() => 
    filteredInvestments.reduce((acc, inv) => acc + inv.value, 0),
    [filteredInvestments]
  );
  
  // CORREÇÃO: O cálculo agora usa a função auxiliar
  const totalExpectedReturn = useMemo(() =>
    filteredInvestments.reduce((acc, inv) => {
      return acc + calculateNetReturn(inv);
    }, 0),
    [filteredInvestments]
  );


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Investimentos</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          <Button
            onClick={() => {
              setSelectedInvestment(null);
              setIsDialogOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Investimento
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Investido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalInvested)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Rendimento Líquido Esperado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalExpectedReturn)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Investimentos</CardTitle>
          <CardDescription>
            Gerencie todos os seus investimentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredInvestments}
            searchColumn="name"
            searchPlaceholder="Filtrar por nome..."
          />
        </CardContent>
      </Card>

      <InvestimentoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        investimento={selectedInvestment}
        objectives={Objectives}
      />
    </div>
  );
}