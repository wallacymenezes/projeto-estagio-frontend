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
import { ArrowUpDown, Edit, Plus, Trash, LineChartIcon, BanknoteIcon } from "lucide-react";
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

  const annualRate = percentage / 100;
  const grossReturn = value * (annualRate / 12) * months;

  let taxRate = 0;

  // Usar os valores de enum corretos (maiúsculas)
  switch (investmentType) {
    case "TESOURO":
    case "CDI":
      const days = months * 30;
      if (days <= 180) taxRate = 0.225;
      else if (days <= 360) taxRate = 0.20;
      else if (days <= 720) taxRate = 0.175;
      else taxRate = 0.15;
      break;

    case "ACOES":
    case "CRYPTO":
      taxRate = 0.15;
      break;
    
    case "FIIS":
    case "POUPANCA":
      taxRate = 0;
      break;
      
    default:
      taxRate = 0;
  }

  const taxAmount = grossReturn * taxRate;
  return grossReturn - taxAmount;
};


export default function InvestimentosPage() {
  const { Investments, Objectives, deleteInvestment } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const filteredInvestments = useMemo(() => {
    if (!Investments) return [];
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

  // Definição de colunas com classes de responsividade
  const columns: ColumnDef<Investment>[] = [
    {
      accessorKey: "name",
      header: "Investimento",
    },
    {
      id: 'objective',
      header: () => <div className="hidden sm:table-cell">Objetivo</div>,
      cell: ({ row }) => {
        const objectiveId = row.original.objectiveId;
        const objective = Objectives.find(obj => obj.id === objectiveId);
        return <div className="hidden sm:table-cell">{objective ? objective.name : "Nenhum"}</div>;
      },
    },
    {
      accessorKey: "value",
      header: () => <div className="text-right">Valor</div>,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("value"))}</div>,
    },
    {
      id: "netReturn",
      header: () => <div className="text-right">Rend. Líquido</div>,
      cell: ({ row }) => {
        const netReturn = calculateNetReturn(row.original);
        return <div className="text-right font-medium text-emerald-500">{formatCurrency(netReturn)}</div>;
      }
    },
    {
      id: "actions",
      header: () => <div className="text-right">Ações</div>,
      cell: ({ row }) => {
        const investment = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(investment)}><Edit className="h-4 w-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash className="h-4 w-4" /></Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>Tem certeza que deseja excluir este investimento? Esta ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(investment.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
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
  
  const totalExpectedReturn = useMemo(() =>
    filteredInvestments.reduce((acc, inv) => acc + calculateNetReturn(inv), 0),
    [filteredInvestments]
  );


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Investimentos</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <DateRangePicker onDateChange={setDateRange} />
          <Button onClick={() => { setSelectedInvestment(null); setIsDialogOpen(true); }} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
            <Plus className="mr-2 h-4 w-4" />
            Novo Investimento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            <BanknoteIcon className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalInvested)}</div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimento Líquido Esperado</CardTitle>
            <LineChartIcon className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalExpectedReturn)}</div>
            <p className="text-xs text-muted-foreground">considerando o prazo total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Investimentos</CardTitle>
          <CardDescription>Gerencie todos os seus investimentos</CardDescription>
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