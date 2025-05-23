"use client"

import React, { useState, useEffect } from "react"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import type { Expense } from "@/models/Expense"
import type { Category } from "@/models/Category"

interface DespesaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  despesa: Expense | null
  categorias: Category[]
}

export function DespesaDialog({ open, onOpenChange, despesa, categorias }: DespesaDialogProps) {
  const { addExpense, updateExpense } = useData()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [value, setValue] = useState("")
  const [category, setCategory] = useState<Category | null>(null)

  useEffect(() => {
    if (open) {
      if (despesa) {
        setName(despesa.name)
        setDescription(despesa.description ?? "")
        setValue(despesa.value.toString())
        setCategory(despesa.category)
      } else {
        setName("")
        setDescription("")
        setValue("")
        setCategory(null)
      }
    }
  }, [open, despesa])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !value || isNaN(Number(value)) || Number(value) <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios com valores válidos.",
        variant: "destructive",
      })
      return
    }

    if (!category) {
      toast({
        title: "Categoria obrigatória",
        description: "Por favor, selecione uma categoria.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const despesaData: Omit<Expense, "id" | "creationDate"> = {
        name,
        description,
        value: Number.parseFloat(value),
        category,
        userId: despesa?.userId, // opcionalmente mantenha userId se existir
      }

      if (despesa) {
        await updateExpense(despesa.id, despesaData)
        toast({
          title: "Despesa atualizada",
          description: "A despesa foi atualizada com sucesso.",
        })
      } else {
        await addExpense(despesaData)
        toast({
          title: "Despesa adicionada",
          description: "A despesa foi adicionada com sucesso.",
        })
      }

      onOpenChange(false)
    } catch {
      toast({
        title: "Erro",
        description: despesa
          ? "Não foi possível atualizar a despesa."
          : "Não foi possível adicionar a despesa.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{despesa ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
          <DialogDescription>
            {despesa
              ? "Edite as informações da despesa selecionada."
              : "Preencha as informações para adicionar uma nova despesa."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Aluguel, Mercado, etc."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição da despesa"
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={category?.id.toString() ?? "none"}
                onValueChange={(val) => {
                  if (val === "none") {
                    setCategory(null)
                  } else {
                    const cat = categorias.find(c => c.id === parseInt(val))
                    setCategory(cat ?? null)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id.toString()}>
                      {categoria.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {despesa ? "Atualizando..." : "Adicionando..."}
                </>
              ) : despesa ? (
                "Atualizar"
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
