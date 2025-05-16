"use client"

import { useState, useEffect } from "react"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { DataTable } from "@/components/data-table"
import { InvestimentoDialog } from "@/components/investimento-dialog"
import { formatCurrency } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, Plus, Trash } from "lucide-react"
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
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

interface Investimento {
  id: string
  nome: string
  valor: number
  dataInicio: string
  dataFim: string | null
  rendimento: number
  status: "ativo" | "finalizado"
}

export default function InvestimentosPage() {
  const { investimentos, fetchInvestimentos, deleteInvestimento } = useData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedInvestimento, setSelectedInvestimento] = useState<Investimento | null>(null)
  const [filteredInvestimentos, setFilteredInvestimentos] = useState<Investimento[]>([])
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

  useEffect(() => {
    fetchInvestimentos()
  }, [fetchInvestimentos])

  useEffect(() => {
    setFilteredInvestimentos(
      investimentos.filter((investimento) => {
        const date = new Date(investimento.dataInicio)
        return date >= dateRange.from && date <= dateRange.to
      }),
    )
  }, [investimentos, dateRange])

  const handleEdit = (investimento: Investimento) => {
    setSelectedInvestimento(investimento)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteInvestimento(id)
      toast({
        title: "Investimento excluído",
        description: "O investimento foi excluído com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o investimento.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Investimento>[] = [
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "valor",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Valor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatCurrency(row.getValue("valor")),
    },
    {
      accessorKey: "rendimento",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Rendimento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => `${row.getValue("rendimento")}%`,
    },
    {
      accessorKey: "dataInicio",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Data Início
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => new Date(row.getValue("dataInicio")).toLocaleDateString("pt-BR"),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
              status === "ativo"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {status === "ativo" ? "Ativo" : "Finalizado"}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const investimento = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(investimento)}>
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
                    Tem certeza que deseja excluir este investimento? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(investimento.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]

  const totalInvestimentos = filteredInvestimentos.reduce((acc, inv) => acc + inv.valor, 0)
  const totalRendimentos = filteredInvestimentos.reduce((acc, inv) => {
    const rendimento = (inv.valor * inv.rendimento) / 100
    return acc + rendimento
  }, 0)
  const investimentosAtivos = filteredInvestimentos.filter((inv) => inv.status === "ativo")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Investimentos</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          <Button
            onClick={() => {
              setSelectedInvestimento(null)
              setIsDialogOpen(true)
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Investimento
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalInvestimentos)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rendimento Esperado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalRendimentos)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Investimentos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {investimentosAtivos.length} de {filteredInvestimentos.length}
            </div>
            <Progress
              value={(investimentosAtivos.length / filteredInvestimentos.length) * 100 || 0}
              className="h-2 mt-2"
            />
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
            data={filteredInvestimentos}
            searchColumn="nome"
            searchPlaceholder="Filtrar por nome..."
          />
        </CardContent>
      </Card>

      <InvestimentoDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} investimento={selectedInvestimento} />
    </div>
  )
}
