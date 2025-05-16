"use client"

import { useState, useEffect } from "react"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { DataTable } from "@/components/data-table"
import { DespesaDialog } from "@/components/despesa-dialog"
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
import { PieChart } from "@/components/charts"

interface Despesa {
  id: string
  descricao: string
  valor: number
  data: string
  categoria: {
    id: string
    nome: string
  } | null
}

export default function DespesasPage() {
  const { despesas, categorias, fetchDespesas, fetchCategorias, deleteDespesa } = useData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDespesa, setSelectedDespesa] = useState<Despesa | null>(null)
  const [filteredDespesas, setFilteredDespesas] = useState<Despesa[]>([])
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

  useEffect(() => {
    fetchDespesas()
    fetchCategorias()
  }, [fetchDespesas, fetchCategorias])

  useEffect(() => {
    setFilteredDespesas(
      despesas.filter((despesa) => {
        const date = new Date(despesa.data)
        return date >= dateRange.from && date <= dateRange.to
      }),
    )
  }, [despesas, dateRange])

  const handleEdit = (despesa: Despesa) => {
    setSelectedDespesa(despesa)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDespesa(id)
      toast({
        title: "Despesa excluída",
        description: "A despesa foi excluída com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a despesa.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Despesa>[] = [
    {
      accessorKey: "descricao",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Descrição
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "categoria.nome",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Categoria
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.original.categoria?.nome || "Sem categoria",
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
      accessorKey: "data",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => new Date(row.getValue("data")).toLocaleDateString("pt-BR"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const despesa = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(despesa)}>
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
                    Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(despesa.id)} className="bg-red-600 hover:bg-red-700">
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

  const totalDespesas = filteredDespesas.reduce((acc, despesa) => acc + despesa.valor, 0)

  // Preparar dados para o gráfico
  const despesasPorCategoria = filteredDespesas.reduce(
    (acc, despesa) => {
      const categoria = despesa.categoria?.nome || "Sem categoria"
      if (!acc[categoria]) {
        acc[categoria] = 0
      }
      acc[categoria] += despesa.valor
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          <Button
            onClick={() => {
              setSelectedDespesa(null)
              setIsDialogOpen(true)
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
            <CardDescription>Visão geral das suas despesas no período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalDespesas)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Quantidade de Registros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredDespesas.length}</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>Distribuição das suas despesas por categoria</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <PieChart data={Object.entries(despesasPorCategoria).map(([name, value]) => ({ name, value }))} />
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
            searchColumn="descricao"
            searchPlaceholder="Filtrar por descrição..."
          />
        </CardContent>
      </Card>

      <DespesaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        despesa={selectedDespesa}
        categorias={categorias}
      />
    </div>
  )
}
