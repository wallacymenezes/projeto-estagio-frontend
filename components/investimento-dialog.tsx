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
import type { Investment } from "@/models/Investment"

const INVESTMENT_TYPES = ["TESOURO", "FIIS", "ACOES", "POUPANCA", "CDI", "CRYPTO"] as const

interface InvestimentoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investimento: Investment | null
}

export function InvestimentoDialog({ open, onOpenChange, investimento }: InvestimentoDialogProps) {
  const { addInvestment, updateInvestment } = useData()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [value, setValue] = useState("")
  const [percentage, setPercentage] = useState("")
  const [months, setMonths] = useState("")
  const [investmentType, setInvestmentType] = useState<typeof INVESTMENT_TYPES[number] | "">("")

  useEffect(() => {
    if (open) {
      if (investimento) {
        setName(investimento.name)
        setDescription(investimento.description ?? "")
        setValue(investimento.value.toString())
        setPercentage(investimento.percentage.toString())
        setMonths(investimento.months.toString())
        setInvestmentType(investimento.investmentType)
      } else {
        setName("")
        setDescription("")
        setValue("")
        setPercentage("")
        setMonths("")
        setInvestmentType("")
      }
    }
  }, [open, investimento])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !value || !percentage || !months || !investmentType) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const now = new Date().toISOString()

      const investimentoData: Omit<Investment, "id"> = {
        name,
        description: description || undefined,
        value: Number(value),
        percentage: Number(percentage),
        months: Number(months),
        investmentType,
        creation_date: investimento ? investimento.creation_date : now, // manter creation_date no update, usar data atual no create
      }

      if (investimento) {
        await updateInvestment(investimento.id, investimentoData)
        toast({
          title: "Investimento atualizado",
          description: "O investimento foi atualizado com sucesso.",
        })
      } else {
        await addInvestment(investimentoData)
        toast({
          title: "Investimento adicionado",
          description: "O investimento foi adicionado com sucesso.",
        })
      }

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: investimento
          ? "Não foi possível atualizar o investimento."
          : "Não foi possível adicionar o investimento.",
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
          <DialogTitle>{investimento ? "Editar Investimento" : "Novo Investimento"}</DialogTitle>
          <DialogDescription>
            {investimento
              ? "Edite as informações do investimento selecionado."
              : "Preencha as informações para adicionar um novo investimento."}
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
                placeholder="Ex: Tesouro Direto, CDB, etc."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do investimento"
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
              <Label htmlFor="percentage">Rendimento (%)</Label>
              <Input
                id="percentage"
                type="number"
                step="0.01"
                min="0"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="months">Prazo (meses)</Label>
              <Input
                id="months"
                type="number"
                min="1"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                placeholder="12"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="investmentType">Tipo de Investimento</Label>
              <Select
                value={investmentType}
                onValueChange={(val) => {
                  if (INVESTMENT_TYPES.includes(val as any)) {
                    setInvestmentType(val as typeof INVESTMENT_TYPES[number])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {investimento ? "Atualizando..." : "Adicionando..."}
                </>
              ) : investimento ? (
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
