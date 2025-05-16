"use client"

import { useState, useEffect } from "react"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { DataTable } from "@/components/data-table"
import { GanhoDialog } from "@/components/ganho-dialog"
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

interface Ganho {
  id: string
  descricao: string
  valor: number
  data: string
  recorrente: boolean
}

export default function GanhosPage() {
  const { ganhos, fetchGanhos, deleteGanho } = useData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedGanho, setSelectedGanho] = useState<Ganho | null>(null)
  const [filteredGanhos, setFilteredGanhos] = useState<Ganho[]>([])
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

  useEffect(() => {
    fetchGanhos()
  }, [fetchGanhos])

  useEffect(() => {
    setFilteredGanhos(
      ganhos.filter((ganho) => {
        const date = new Date(ganho.data)
        return date >= dateRange.from && date <= dateRange.to
      }),
    )
  }, [ganhos, dateRange])

  const handleEdit = (ganho: Ganho) => {
    setSelectedGanho(ganho)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteGanho(id)
      toast({
        title: "Ganho excluído",
        description: "O ganho foi excluído com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o ganho.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Ganho>[] = [
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
      accessorKey: "recorrente",
      header: "Recorrente",
      cell: ({ row }) => (row.getValue("recorrente") ? "Sim" : "Não"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ganho = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(ganho)}>
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
                    Tem certeza que deseja excluir este ganho? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(ganho.id)} className="bg-red-600 hover:bg-red-700">
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

  const totalGanhos = filteredGanhos.reduce((acc, ganho) => acc + ganho.valor, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Ganhos</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          <Button
            onClick={() => {
              setSelectedGanho(null)
              setIsDialogOpen(true)
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
          <CardDescription>Visão geral dos seus ganhos no período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Ganhos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalGanhos)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quantidade de Registros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredGanhos.length}</div>
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
            searchColumn="descricao"
            searchPlaceholder="Filtrar por descrição..."
          />
        </CardContent>
      </Card>

      <GanhoDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} ganho={selectedGanho} />
    </div>
  )
}
