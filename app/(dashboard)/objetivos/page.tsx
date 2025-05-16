"use client"

import { useState, useEffect } from "react"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { ObjetivoDialog } from "@/components/objetivo-dialog"
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

interface Objetivo {
  id: string
  nome: string
  descricao: string
  valorAlvo: number
  valorAtual: number
  dataLimite: string | null
  status: "em_andamento" | "concluido" | "cancelado"
}

export default function ObjetivosPage() {
  const { objetivos, fetchObjetivos, deleteObjetivo } = useData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedObjetivo, setSelectedObjetivo] = useState<Objetivo | null>(null)

  useEffect(() => {
    fetchObjetivos()
  }, [fetchObjetivos])

  const handleEdit = (objetivo: Objetivo) => {
    setSelectedObjetivo(objetivo)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteObjetivo(id)
      toast({
        title: "Objetivo excluído",
        description: "O objetivo foi excluído com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o objetivo.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Objetivo>[] = [
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
      accessorKey: "valorAlvo",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Valor Alvo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatCurrency(row.getValue("valorAlvo")),
    },
    {
      accessorKey: "valorAtual",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Valor Atual
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatCurrency(row.getValue("valorAtual")),
    },
    {
      id: "progresso",
      header: "Progresso",
      cell: ({ row }) => {
        const valorAtual = row.original.valorAtual
        const valorAlvo = row.original.valorAlvo
        const progresso = (valorAtual / valorAlvo) * 100

        return (
          <div className="w-full">
            <div className="flex justify-between mb-1 text-xs">
              <span>{progresso.toFixed(0)}%</span>
              <span>
                {formatCurrency(valorAtual)} de {formatCurrency(valorAlvo)}
              </span>
            </div>
            <Progress value={progresso} className="h-2" />
          </div>
        )
      },
    },
    {
      accessorKey: "dataLimite",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Data Limite
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const dataLimite = row.getValue("dataLimite") as string | null
        return dataLimite ? new Date(dataLimite).toLocaleDateString("pt-BR") : "Sem data"
      },
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
              status === "em_andamento"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                : status === "concluido"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {status === "em_andamento" ? "Em andamento" : status === "concluido" ? "Concluído" : "Cancelado"}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const objetivo = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(objetivo)}>
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
                    Tem certeza que deseja excluir este objetivo? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(objetivo.id)} className="bg-red-600 hover:bg-red-700">
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

  const totalObjetivos = objetivos.length
  const objetivosConcluidos = objetivos.filter((obj) => obj.status === "concluido").length
  const objetivosEmAndamento = objetivos.filter((obj) => obj.status === "em_andamento").length
  const valorTotalAlvo = objetivos.reduce((acc, obj) => acc + obj.valorAlvo, 0)
  const valorTotalAtual = objetivos.reduce((acc, obj) => acc + obj.valorAtual, 0)
  const progressoGeral = (valorTotalAtual / valorTotalAlvo) * 100 || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Objetivos</h1>
        <Button
          onClick={() => {
            setSelectedObjetivo(null)
            setIsDialogOpen(true)
          }}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Objetivo
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Objetivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalObjetivos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Objetivos Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{objetivosConcluidos}</div>
            <Progress value={(objetivosConcluidos / totalObjetivos) * 100 || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Objetivos em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{objetivosEmAndamento}</div>
            <Progress value={(objetivosEmAndamento / totalObjetivos) * 100 || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressoGeral.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground mb-1">
              {formatCurrency(valorTotalAtual)} de {formatCurrency(valorTotalAlvo)}
            </div>
            <Progress value={progressoGeral} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Objetivos</CardTitle>
          <CardDescription>Gerencie todos os seus objetivos financeiros</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={objetivos} searchColumn="nome" searchPlaceholder="Filtrar por nome..." />
        </CardContent>
      </Card>

      <ObjetivoDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} objetivo={selectedObjetivo} />
    </div>
  )
}
