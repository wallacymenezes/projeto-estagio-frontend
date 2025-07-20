"use client"

import React, { useState, useEffect } from "react"
import type { Earning } from "@/models/Earning"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface GanhoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ganho: Earning | null
}

export function GanhoDialog({ open, onOpenChange, ganho }: GanhoDialogProps) {
  const { addEarning, updateEarning } = useData()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [value, setValue] = useState("")
  const [wage, setWage] = useState(false)
  // 1. Alterado 'date' para 'recebimento' para corresponder ao backend
  const [recebimento, setRecebimento] = useState<Date | undefined>(new Date())

  useEffect(() => {
    if (open) {
      if (ganho) {
        setName(ganho.name)
        setDescription(ganho.description ?? "")
        setValue(ganho.value.toString())
        setWage(ganho.wage)
        // 2. Usar o novo campo 'recebimento' do modelo Earning
        setRecebimento(ganho.recebimento ? new Date(ganho.recebimento) : new Date())
      } else {
        setName("")
        setDescription("")
        setValue("")
        setWage(false)
        setRecebimento(new Date())
      }
    }
  }, [open, ganho])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !value) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // 3. Enviar o campo 'recebimento' no formato correto
      const ganhoData = {
        name,
        description,
        value: Number.parseFloat(value),
        wage,
        recebimento: recebimento ? format(recebimento, "yyyy-MM-dd") : undefined,
      }

      if (ganho) {
        await updateEarning(ganho.id, ganhoData)
        toast({
          title: "Ganho atualizado",
          description: "O ganho foi atualizado com sucesso.",
        })
      } else {
        await addEarning(ganhoData as Omit<Earning, "id">)
        toast({
          title: "Ganho adicionado",
          description: "O ganho foi adicionado com sucesso.",
        })
      }

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: ganho ? "Não foi possível atualizar o ganho." : "Não foi possível adicionar o ganho.",
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
          <DialogTitle>{ganho ? "Editar Ganho" : "Novo Ganho"}</DialogTitle>
          <DialogDescription>
            {ganho
              ? "Edite as informações do ganho selecionado."
              : "Preencha as informações para adicionar um novo ganho."}
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
                placeholder="Ex: Salário, Freelance, etc."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do ganho"
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
            {/* 4. Adicionar o seletor de data para o recebimento */}
            <div className="grid gap-2">
              <Label htmlFor="recebimento">Data de Recebimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !recebimento && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {recebimento ? format(recebimento, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={recebimento} onSelect={setRecebimento} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="wage" checked={wage} onCheckedChange={setWage} />
              <Label htmlFor="wage">Ganho recorrente</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {ganho ? "Atualizando..." : "Adicionando..."}
                </>
              ) : ganho ? (
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