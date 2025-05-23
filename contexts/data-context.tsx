"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { Earning } from "@/models/Earning";
import { Expense } from "@/models/Expense";
import { Investment } from "@/models/Investment";
import { Objective } from "@/models/Objective";
import { Category } from "@/models/Category";
import { atualizar, buscar, register, deletar } from "@/Service/Service";
import { toast } from "@/hooks/use-toast";
// Context Type
interface DataContextType {
  // Estados
  Earnings: Earning[]
  Expenses: Expense[]
  Investments: Investment[]
  Objectives: Objective[]
  Categorys: Category[]

  // Métodos para Earnings
  fetchEarnings: () => Promise<void>
  addEarning: (Earning: Omit<Earning, "id" | "creationDate">) => Promise<any>
  updateEarning: (id: number, Earning: Partial<Omit<Earning, "id" | "creationDate">>) => Promise<any>
  deleteEarning: (id: number) => Promise<void>

  // Métodos para Expenses
  fetchExpenses: () => Promise<void>
  addExpense: (Expense: Omit<Expense, "id" | "creationDate">) => Promise<any>
  updateExpense: (id: number, Expense: Partial<Omit<Expense, "id" | "creationDate">>) => Promise<any>
  deleteExpense: (id: number) => Promise<void>

  // Métodos para Investments
  fetchInvestments: () => Promise<void>
  addInvestment: (Investment: Omit<Investment, "id" | "creationDate">) => Promise<any>
  updateInvestment: (id: number, Investment: Partial<Omit<Investment, "id" | "creationDate">>) => Promise<any>
  deleteInvestment: (id: number) => Promise<void>

  // Métodos para Objectives
  fetchObjectives: () => Promise<void>
  addObjective: (Objective: Omit<Objective, "id" | "creationDate">) => Promise<any>
  updateObjective: (id: number, Objective: Partial<Omit<Objective, "id" | "creationDate">>) => Promise<any>
  deleteObjective: (id: number) => Promise<void>

  // Métodos para Categorys
  fetchCategorys: () => Promise<void>
  addCategory: (Category: Omit<Category, "id">) => Promise<any>
  updateCategory: (id: number, Category: Partial<Omit<Category, "id">>) => Promise<any>
  deleteCategory: (id: number) => Promise<void>
}

const mockEarnings: Earning[] = [
  {
    id: 1,
    name: "Salário",
    description: "Salário",
    value: 3500,
    wage: true,
    creationDate: "2023-05-05T00:00:00.000Z",
    userId: "user123",
  },
  {
    id: 2,
    name: "Freelance",
    description: "Freelance",
    value: 1200,
    wage: false,
    creationDate: "2023-05-15T00:00:00.000Z",
    userId: "user123",
  },
  {
    id: 3,
    name: "Dividendos",
    description: "Dividendos",
    value: 350,
    wage: true,
    creationDate: "2023-05-20T00:00:00.000Z",
    userId: "user123",
  },
]

const mockCategories: Category[] = [
  { id: 1, name: "Alimentação", description: "Gastos com alimentação em geral", color: "#f87171", userId: "user123" },
  { id: 2, name: "Transporte", description: "Gastos com transporte", color: "#60a5fa", userId: "user123" },
  { id: 3, name: "Lazer", description: "Gastos com lazer e entretenimento", color: "#a78bfa", userId: "user123" },
  { id: 4, name: "Moradia", description: "Gastos com moradia", color: "#34d399", userId: "user123" },
  { id: 5, name: "Educação", description: "Gastos com educação", color: "#fbbf24", userId: "user123" },
]

const mockExpenses: Expense[] = [
  {
    id: 1,
    name: "Aluguel",
    description: "Aluguel",
    value: 1200,
    creationDate: "2023-05-10T00:00:00.000Z",
    category: mockCategories.find(c => c.id === 4)!,
    userId: "user123",
  },
  {
    id: 2,
    name: "Supermercado",
    description: "Supermercado",
    value: 500,
    creationDate: "2023-05-12T00:00:00.000Z",
    category: mockCategories.find(c => c.id === 1)!,
    userId: "user123",
  },
  {
    id: 3,
    name: "Uber",
    description: "Uber",
    value: 150,
    creationDate: "2023-05-15T00:00:00.000Z",
    category: mockCategories.find(c => c.id === 2)!,
    userId: "user123",
  },
  {
    id: 4,
    name: "Cinema",
    description: "Cinema",
    value: 80,
    creationDate: "2023-05-18T00:00:00.000Z",
    category: mockCategories.find(c => c.id === 3)!,
    userId: "user123",
  },
  {
    id: 5,
    name: "Curso online",
    description: "Curso online",
    value: 300,
    creationDate: "2023-05-20T00:00:00.000Z",
    category: mockCategories.find(c => c.id === 5)!,
    userId: "user123",
  },
]

const mockInvestments: Investment[] = [
  {
    id: 1,
    name: "Tesouro Direto",
    description: "Tesouro Direto",
    percentage: 12.5,
    months: 12,
    creation_date: "2023-01-10T00:00:00.000Z",
    value: 5000,
    investmentType: "TESOURO", // ajuste conforme seu enum, aqui deixei string para exemplo
  },
  {
    id: 2,
    name: "CDB Banco XYZ",
    description: "CDB Banco XYZ",
    percentage: 10.8,
    months: 12,
    creation_date: "2023-02-15T00:00:00.000Z",
    value: 3000,
    investmentType: "CDI",
  },
  {
    id: 3,
    name: "Ações PETR4",
    description: "Ações PETR4",
    percentage: 8.2,
    months: 12,
    creation_date: "2023-03-20T00:00:00.000Z",
    value: 2000,
    investmentType: "ACOES",
  },
]

const mockObjectives: Objective[] = [
  {
    id: 1,
    name: "Viagem para Europa",
    targetValue: 15000,
    term: "2024-07-01T00:00:00.000Z",
    creationDate: "2023-05-05T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Comprar notebook",
    targetValue: 5000,
    term: "2023-06-01T00:00:00.000Z",
    creationDate: "2023-05-05T00:00:00.000Z",
  },
  {
    id: 3,
    name: "Fundo de emergência",
    targetValue: 20000,
    term: "2023-05-05T00:00:00.000Z",
    creationDate: "2023-05-05T00:00:00.000Z",
  },
]


// Criar o contexto
const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [Earnings, setEarnings] = useState<Earning[]>([])
  const [Expenses, setExpenses] = useState<Expense[]>([])
  const [Investments, setInvestments] = useState<Investment[]>([])
  const [Objectives, setObjectives] = useState<Objective[]>([])
  const [Categorys, setCategorys] = useState<Category[]>([])

  // Earnings
  const fetchEarnings = async () => {
    try {
      const data = await buscar("/earnings")
      setEarnings(data)
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Earnings",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      setEarnings([])
    }
  }

  const addEarning = async (earning: Omit<Earning, "id" | "creationDate">) => {
    try {
      const newEarning = await register("/earnings", earning)
      setEarnings(prev => [...prev, newEarning])
      return newEarning
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Earning",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateEarning = async (id: number, earning: Partial<Omit<Earning, "id" | "creationDate">>) => {
    try {
      const updated = await atualizar(`/earnings/${id}`, earning)
      setEarnings(prev => prev.map(e => (e.id === id ? updated : e)))
      return updated
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Earning",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteEarning = async (id: number) => {
    try {
      await deletar(`/earnings/${id}`)
      setEarnings(prev => prev.filter(e => e.id !== id))
    } catch (error: any) {
      toast({
        title: "Erro ao deletar Earning",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Expenses
  const fetchExpenses = async () => {
    try {
      const data = await buscar("/expenses")
      setExpenses(data)
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Expenses",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      setExpenses([])
    }
  }

  const addExpense = async (expense: Omit<Expense, "id" | "creationDate">) => {
    try {
      const newExpense = await register("/expenses", expense)
      setExpenses(prev => [...prev, newExpense])
      return newExpense
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Expense",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateExpense = async (id: number, expense: Partial<Omit<Expense, "id" | "creationDate">>) => {
    try {
      const updated = await atualizar(`/expenses/${id}`, expense)
      setExpenses(prev => prev.map(e => (e.id === id ? updated : e)))
      return updated
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Expense",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteExpense = async (id: number) => {
    try {
      await deletar(`/expenses/${id}`)
      setExpenses(prev => prev.filter(e => e.id !== id))
    } catch (error: any) {
      toast({
        title: "Erro ao deletar Expense",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Investments
  const fetchInvestments = async () => {
    try {
      const data = await buscar("/investments")
      setInvestments(data)
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Investments",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      setInvestments([])
    }
  }

  const addInvestment = async (investment: Omit<Investment, "id" | "creationDate">) => {
    try {
      const newInvestment = await register("/investments", investment)
      setInvestments(prev => [...prev, newInvestment])
      return newInvestment
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Investment",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateInvestment = async (id: number, investment: Partial<Omit<Investment, "id" | "creationDate">>) => {
    try {
      const updated = await atualizar(`/investments/${id}`, investment)
      setInvestments(prev => prev.map(i => (i.id === id ? updated : i)))
      return updated
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Investment",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteInvestment = async (id: number) => {
    try {
      await deletar(`/investments/${id}`)
      setInvestments(prev => prev.filter(i => i.id !== id))
    } catch (error: any) {
      toast({
        title: "Erro ao deletar Investment",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Objectives
  const fetchObjectives = async () => {
    try {
      const data = await buscar("/objectives")
      setObjectives(data)
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Objectives",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      setObjectives([])
    }
  }

  const addObjective = async (objective: Omit<Objective, "id" | "creationDate">) => {
    try {
      const newObjective = await register("/objectives", objective)
      setObjectives(prev => [...prev, newObjective])
      return newObjective
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Objective",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateObjective = async (id: number, objective: Partial<Omit<Objective, "id" | "creationDate">>) => {
    try {
      const updated = await atualizar(`/objectives/${id}`, objective)
      setObjectives(prev => prev.map(o => (o.id === id ? updated : o)))
      return updated
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Objective",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteObjective = async (id: number) => {
    try {
      await deletar(`/objectives/${id}`)
      setObjectives(prev => prev.filter(o => o.id !== id))
    } catch (error: any) {
      toast({
        title: "Erro ao deletar Objective",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Categorys
  const fetchCategorys = async () => {
    try {
      const data = await buscar("/categories")
      setCategorys(data)
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Categorys",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      setCategorys([])
    }
  }

  const addCategory = async (category: Omit<Category, "id">) => {
    try {
      const newCategory = await register("/categories", category)
      setCategorys(prev => [...prev, newCategory])
      return newCategory
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Category",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateCategory = async (id: number, category: Partial<Omit<Category, "id">>) => {
    try {
      const updated = await atualizar(`/categories/${id}`, category)
      setCategorys(prev => prev.map(c => (c.id === id ? updated : c)))
      return updated
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Category",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteCategory = async (id: number) => {
    try {
      await deletar(`/categories/${id}`)
      setCategorys(prev => prev.filter(c => c.id !== id))
    } catch (error: any) {
      toast({
        title: "Erro ao deletar Category",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      })
      throw error
    }
  }

  return (
    <DataContext.Provider
      value={{
        Earnings,
        Expenses,
        Investments,
        Objectives,
        Categorys,
        fetchEarnings,
        addEarning,
        updateEarning,
        deleteEarning,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        fetchInvestments,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        fetchObjectives,
        addObjective,
        updateObjective,
        deleteObjective,
        fetchCategorys,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error("useData must be used within a DataProvider")
  return context
}