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
import { AlertCircle as AlertCircleIcon, CalendarIcon, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Expense, ExpenseStatus } from "@/models/Expense"
import type { Category } from "@/models/Category"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { ptBR } from "date-fns/locale"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DespesaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  despesa: Expense | null
  categorias: Category[]
}

type FormErrors = {
  name?: string;
  value?: string;
  category?: string;
};

export function DespesaDialog({ open, onOpenChange, despesa, categorias }: DespesaDialogProps) {
  const { addExpense, updateExpense } = useData()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [value, setValue] = useState("")
  const [category, setCategory] = useState<Category | null>(null)
  const [status, setStatus] = useState<ExpenseStatus>("PENDING")
  const [vencimento, setVencimento] = useState<Date | undefined | null>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setErrors({}); // Limpa todos os erros ao fechar
    }
  };

  useEffect(() => {
    if (open) {
      if (despesa) {
        setName(despesa.name)
        setDescription(despesa.description ?? "")
        setValue(despesa.value.toString())
        setCategory(despesa.category)
        setStatus(despesa.status || "PENDING")
        setVencimento(despesa.vencimento ? new Date(despesa.vencimento + 'T00:00:00') : null);
      } else {
        setName("")
        setDescription("")
        setValue("")
        setCategory(null)
        setStatus("PENDING")
        setVencimento(new Date());
      }
      setErrors({});
    }
  }, [open, despesa])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setErrors({}); // Limpa erros antigos
    const newErrors: FormErrors = {};

    if (!name.trim() || name.trim().length < 3) {
      newErrors.name = "O nome é obrigatório e deve ter pelo menos 3 caracteres.";
    }
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      newErrors.value = "Insira um valor válido.";
    }
    if (!category) {
      newErrors.category = "Selecione uma categoria.";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true)
    
    try {
      const dataParaEnvio = vencimento || new Date();
      const despesaDataPayload = {
        name,
        description,
        value: Number.parseFloat(value),
        category: category,
        status,
        vencimento: format(dataParaEnvio, "yyyy-MM-dd"),
      };

      if (despesa) {
        await updateExpense(despesa.id, despesaDataPayload as Partial<Omit<Expense, "id" | "creationDate" | "userId" | "categoryId">>);
        toast({ title: "Despesa atualizada", description: "A despesa foi atualizada com sucesso." })
      } else {
        await addExpense(despesaDataPayload as Omit<Expense, "id" | "creationDate" | "userId" | "categoryId">);
        toast({ title: "Despesa adicionada", description: "A despesa foi adicionada com sucesso." })
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      toast({
        title: "Erro",
        description: despesa ? "Não foi possível atualizar a despesa." : "Não foi possível adicionar a despesa.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    // Usa a nova função handleOpenChange para controlar o diálogo
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{despesa ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
          <DialogDescription>
            {despesa ? "Edite as informações da despesa selecionada." : "Preencha as informações para adicionar uma nova despesa."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {Object.values(errors).find(error => error) && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-500 dark:text-red-400 [&>svg]:text-red-500 dark:[&>svg]:text-red-400">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Erro de Validação</AlertTitle>
                <AlertDescription>
                  <p>{Object.values(errors).find(error => error)}</p>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Nome (*)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                placeholder="Ex: Aluguel, Mercado, etc."
                className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição da despesa" className="resize-none" rows={3} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input id="value" type="number" step="0.01" min="0" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vencimento">Data de Vencimento</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !vencimento && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {vencimento ? format(vencimento, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={vencimento ?? undefined} onSelect={(date) => { setVencimento(date); setIsCalendarOpen(false); }} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria (*)</Label>
              <Select
                value={category?.id?.toString() ?? ""}
                onValueChange={(val) => {
                  const selectedCat = categorias.find(c => c.id.toString() === val);
                  setCategory(selectedCat ?? null);
                  if (selectedCat && errors.category) setErrors(prev => ({ ...prev, category: undefined }));
                }}
              >
                <SelectTrigger className={cn(errors.category && "border-red-500 focus-visible:ring-red-500")}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(val: string) => setStatus(val as ExpenseStatus)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="PAID">Pago</SelectItem>
                  <SelectItem value="OVERDUE">Atrasado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600">
              {loading ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {despesa ? "Atualizando..." : "Adicionando..."}</> ) : ( despesa ? "Atualizar" : "Adicionar" )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}