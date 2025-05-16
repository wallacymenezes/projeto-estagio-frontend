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
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Objetivo {
  id: string
  name: string
  target: number
  term: string
  creationDate: string
}

interface ObjetivoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  objetivo: Objetivo | null
}

export function ObjetivoDialog({ open, onOpenChange, objetivo }: ObjetivoDialogProps) {
  const { addObjetivo, updateObjetivo } = useData()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [target, setTarget] = useState("")
  const [term, setTerm] = useState<Date | undefined>(undefined)

  // Resetar o formulário quando o diálogo é aberto
  useEffect(() => {
    if (open) {
      if (objetivo) {
        setName(objetivo.name)
        setTarget(objetivo.target.toString())
        setTerm(objetivo.term ? new Date(objetivo.term) : undefined)
      } else {
        setName("")
        setTarget("")
        setTerm(undefined)
      }
    }
  }, [open, objetivo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !target || !term) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const objetivoData = {
        name,
        target: Number.parseFloat(target),
        term: term.toISOString(),
      }

      if (objetivo) {
        await updateObjetivo(objetivo.id, objetivoData)
        toast({
          title: "Objetivo atualizado",
          description: "O objetivo foi atualizado com sucesso.",
        })
      } else {
        await addObjetivo(objetivoData)
        toast({
          title: "Objetivo adicionado",
          description: "O objetivo foi adicionado com sucesso.",
        })
      }

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: objetivo ? "Não foi possível atualizar o objetivo." : "Não foi possível adicionar o objetivo.",
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
          <DialogTitle>{objetivo ? "Editar Objetivo" : "Novo Objetivo"}</DialogTitle>
          <DialogDescription>
            {objetivo
              ? "Edite as informações do objetivo selecionado."
              : "Preencha as informações para adicionar um novo objetivo."}
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
                placeholder="Ex: Viagem, Carro, etc."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target">Valor Alvo (R$)</Label>
              <Input
                id="target"
                type="number"
                step="0.01"
                min="0"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="term">Data Limite</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !term && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {term ? format(term, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={term}
                    onSelect={setTerm}
                    initialFocus
                    locale={ptBR}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {objetivo ? "Atualizando..." : "Adicionando..."}
                </>
              ) : objetivo ? (
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
