"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface Categoria {
  id: string
  name: string
  description: string | null
  color: string
}

interface CategoriaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria: Categoria | null
}

// Lista de cores predefinidas
const CORES_PREDEFINIDAS = [
  "#f87171", // red-400
  "#fb923c", // orange-400
  "#fbbf24", // amber-400
  "#facc15", // yellow-400
  "#a3e635", // lime-400
  "#4ade80", // green-400
  "#34d399", // emerald-400
  "#2dd4bf", // teal-400
  "#22d3ee", // cyan-400
  "#38bdf8", // sky-400
  "#60a5fa", // blue-400
  "#818cf8", // indigo-400
  "#a78bfa", // violet-400
  "#c084fc", // purple-400
  "#e879f9", // fuchsia-400
  "#f472b6", // pink-400
  "#fb7185", // rose-400
]

export function CategoriaDialog({ open, onOpenChange, categoria }: CategoriaDialogProps) {
  const { addCategoria, updateCategoria } = useData()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(CORES_PREDEFINIDAS[0])

  // Resetar o formulário quando o diálogo é aberto
  useEffect(() => {
    if (open) {
      if (categoria) {
        setName(categoria.name)
        setDescription(categoria.description || "")
        setColor(categoria.color)
      } else {
        setName("")
        setDescription("")
        setColor(CORES_PREDEFINIDAS[Math.floor(Math.random() * CORES_PREDEFINIDAS.length)])
      }
    }
  }, [open, categoria])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast({
        title: "Nome obrigatório",
        description: "Informe um nome para a categoria.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const categoriaData = {
        name,
        description: description || null,
        color,
      }

      if (categoria) {
        await updateCategoria(categoria.id, categoriaData)
        toast({
          title: "Categoria atualizada",
          description: "A categoria foi atualizada com sucesso.",
        })
      } else {
        await addCategoria(categoriaData)
        toast({
          title: "Categoria adicionada",
          description: "A categoria foi adicionada com sucesso.",
        })
      }

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: categoria ? "Não foi possível atualizar a categoria." : "Não foi possível adicionar a categoria.",
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
          <DialogTitle>{categoria ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          <DialogDescription>
            {categoria
              ? "Edite as informações da categoria selecionada."
              : "Preencha as informações para adicionar uma nova categoria."}
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
                placeholder="Ex: Alimentação, Transporte, etc."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a categoria..."
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {CORES_PREDEFINIDAS.map((corItem) => (
                  <button
                    key={corItem}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === corItem ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: corItem }}
                    onClick={() => setColor(corItem)}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="cor-personalizada">Personalizada:</Label>
                <Input
                  id="cor-personalizada"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 p-0 border-0"
                />
                <span className="text-sm font-medium">{color}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {categoria ? "Atualizando..." : "Adicionando..."}
                </>
              ) : categoria ? (
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
