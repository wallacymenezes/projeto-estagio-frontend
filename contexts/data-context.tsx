"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import api from "@/lib/api"
import { handleApiError } from "@/lib/error-handler"

// Tipos
interface Ganho {
  id: string
  name: string
  description: string
  value: number
  wage: boolean
  creationDate: string
}

interface Categoria {
  id: string
  name: string
  description: string | null
  color: string
}

interface Despesa {
  id: string
  name: string
  description: string
  value: number
  creationDate: string
  category: string
}

interface Investimento {
  id: string
  name: string
  description: string
  percentage: number
  months: number
  creationDate: string
  value: number
  investmentType: string
}

interface Objetivo {
  id: string
  name: string
  target: number
  term: string
  creationDate: string
}

// Context Type
interface DataContextType {
  // Estados
  ganhos: Ganho[]
  despesas: Despesa[]
  investimentos: Investimento[]
  objetivos: Objetivo[]
  categorias: Categoria[]

  // Métodos para Ganhos
  fetchGanhos: () => Promise<void>
  addGanho: (ganho: Omit<Ganho, "id" | "creationDate">) => Promise<any>
  updateGanho: (id: string, ganho: Partial<Omit<Ganho, "id" | "creationDate">>) => Promise<any>
  deleteGanho: (id: string) => Promise<void>

  // Métodos para Despesas
  fetchDespesas: () => Promise<void>
  addDespesa: (despesa: Omit<Despesa, "id" | "creationDate">) => Promise<any>
  updateDespesa: (id: string, despesa: Partial<Omit<Despesa, "id" | "creationDate">>) => Promise<any>
  deleteDespesa: (id: string) => Promise<void>

  // Métodos para Investimentos
  fetchInvestimentos: () => Promise<void>
  addInvestimento: (investimento: Omit<Investimento, "id" | "creationDate">) => Promise<any>
  updateInvestimento: (id: string, investimento: Partial<Omit<Investimento, "id" | "creationDate">>) => Promise<any>
  deleteInvestimento: (id: string) => Promise<void>

  // Métodos para Objetivos
  fetchObjetivos: () => Promise<void>
  addObjetivo: (objetivo: Omit<Objetivo, "id" | "creationDate">) => Promise<any>
  updateObjetivo: (id: string, objetivo: Partial<Omit<Objetivo, "id" | "creationDate">>) => Promise<any>
  deleteObjetivo: (id: string) => Promise<void>

  // Métodos para Categorias
  fetchCategorias: () => Promise<void>
  addCategoria: (categoria: Omit<Categoria, "id">) => Promise<any>
  updateCategoria: (id: string, categoria: Partial<Omit<Categoria, "id">>) => Promise<any>
  deleteCategoria: (id: string) => Promise<void>
}

// Dados mockados para simulação
const mockGanhos: Ganho[] = [
  {
    id: "1",
    name: "Salário",
    description: "Salário",
    value: 3500,
    wage: true,
    creationDate: "2023-05-05T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Freelance",
    description: "Freelance",
    value: 1200,
    wage: false,
    creationDate: "2023-05-15T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Dividendos",
    description: "Dividendos",
    value: 350,
    wage: true,
    creationDate: "2023-05-20T00:00:00.000Z",
  },
]

const mockCategorias: Categoria[] = [
  {
    id: "1",
    name: "Alimentação",
    description: "Gastos com alimentação em geral",
    color: "#f87171",
  },
  {
    id: "2",
    name: "Transporte",
    description: "Gastos com transporte",
    color: "#60a5fa",
  },
  {
    id: "3",
    name: "Lazer",
    description: "Gastos com lazer e entretenimento",
    color: "#a78bfa",
  },
  {
    id: "4",
    name: "Moradia",
    description: "Gastos com moradia",
    color: "#34d399",
  },
  {
    id: "5",
    name: "Educação",
    description: "Gastos com educação",
    color: "#fbbf24",
  },
]

const mockDespesas: Despesa[] = [
  {
    id: "1",
    name: "Aluguel",
    description: "Aluguel",
    value: 1200,
    creationDate: "2023-05-10T00:00:00.000Z",
    category: "4",
  },
  {
    id: "2",
    name: "Supermercado",
    description: "Supermercado",
    value: 500,
    creationDate: "2023-05-12T00:00:00.000Z",
    category: "1",
  },
  {
    id: "3",
    name: "Uber",
    description: "Uber",
    value: 150,
    creationDate: "2023-05-15T00:00:00.000Z",
    category: "2",
  },
  {
    id: "4",
    name: "Cinema",
    description: "Cinema",
    value: 80,
    creationDate: "2023-05-18T00:00:00.000Z",
    category: "3",
  },
  {
    id: "5",
    name: "Curso online",
    description: "Curso online",
    value: 300,
    creationDate: "2023-05-20T00:00:00.000Z",
    category: "5",
  },
]

const mockInvestimentos: Investimento[] = [
  {
    id: "1",
    name: "Tesouro Direto",
    description: "Tesouro Direto",
    percentage: 12.5,
    months: 12,
    creationDate: "2023-01-10T00:00:00.000Z",
    value: 5000,
    investmentType: "Tesouro Direto",
  },
  {
    id: "2",
    name: "CDB Banco XYZ",
    description: "CDB Banco XYZ",
    percentage: 10.8,
    months: 12,
    creationDate: "2023-02-15T00:00:00.000Z",
    value: 3000,
    investmentType: "CDB",
  },
  {
    id: "3",
    name: "Ações PETR4",
    description: "Ações PETR4",
    percentage: 8.2,
    months: 12,
    creationDate: "2023-03-20T00:00:00.000Z",
    value: 2000,
    investmentType: "Ações",
  },
]

const mockObjetivos: Objetivo[] = [
  {
    id: "1",
    name: "Viagem para Europa",
    target: 15000,
    term: "2024-07-01T00:00:00.000Z",
    creationDate: "2023-05-05T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Comprar notebook",
    target: 5000,
    term: "2023-06-01T00:00:00.000Z",
    creationDate: "2023-05-05T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Fundo de emergência",
    target: 20000,
    term: "2023-05-05T00:00:00.000Z",
    creationDate: "2023-05-05T00:00:00.000Z",
  },
]

// Criar o contexto
const DataContext = createContext<DataContextType | undefined>(undefined)

// Provider
export function DataProvider({ children }: { children: ReactNode }) {
  const [ganhos, setGanhos] = useState<Ganho[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [investimentos, setInvestimentos] = useState<Investimento[]>([])
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])

  // Métodos para Ganhos
  const fetchGanhos = async () => {
    try {
      const response = await api.get("/earnings")
      setGanhos(response.data)
    } catch (error) {
      handleApiError(error, "Erro ao buscar ganhos")
      setGanhos([])
    }
  }

  const addGanho = async (ganho: Omit<Ganho, "id" | "creationDate">) => {
    try {
      const response = await api.post("/earnings", ganho)
      setGanhos((prev) => [...prev, response.data])
      return response.data
    } catch (error) {
      handleApiError(error, "Erro ao adicionar ganho")
      throw error
    }
  }

  const updateGanho = async (id: string, ganho: Partial<Omit<Ganho, "id" | "creationDate">>) => {
    try {
      const response = await api.put(`/earnings/${id}`, ganho)
      setGanhos((prev) => prev.map((g) => (g.id === id ? response.data : g)))
      return response.data
    } catch (error) {
      handleApiError(error, "Erro ao atualizar ganho")
      throw error
    }
  }

  const deleteGanho = async (id: string) => {
    try {
      await api.delete(`/earnings/${id}`)
      setGanhos((prev) => prev.filter((g) => g.id !== id))
    } catch (error) {
      handleApiError(error, "Erro ao deletar ganho")
      throw error
    }
  }

  // Métodos para Despesas
  const fetchDespesas = async () => {
    try {
      const response = await api.get("/expenses")
      setDespesas(response.data)
    } catch (error) {
      handleApiError(error, "Erro ao buscar despesas")
      setDespesas([])
    }
  }

  const addDespesa = async (despesa: Omit<Despesa, "id" | "creationDate">) => {
    try {
      const response = await api.post("/expenses", despesa)
      setDespesas((prev) => [...prev, response.data])
      return response.data
    } catch (error) {
      handleApiError(error, "Erro ao adicionar despesa")
      throw error
    }
  }

  const updateDespesa = async (id: string, despesa: Partial<Omit<Despesa, "id" | "creationDate">>) => {
    try {
      const response = await api.put(`/expenses/${id}`, despesa)
      setDespesas((prev) => prev.map((d) => (d.id === id ? response.data : d)))
      return response.data
    } catch (error) {
      handleApiError(error, "Erro ao atualizar despesa")
      throw error
    }
  }

  const deleteDespesa = async (id: string) => {
    try {
      await api.delete(`/expenses/${id}`)
      setDespesas((prev) => prev.filter((d) => d.id !== id))
    } catch (error) {
      handleApiError(error, "Erro ao deletar despesa")
      throw error
    }
  }

  // Métodos para Investimentos
  const fetchInvestimentos = async () => {
    try {
      const response = await api.get("/investments")
      setInvestimentos(response.data)
    } catch (error) {
      handleApiError(error, "Erro ao buscar investimentos")
      setInvestimentos([])
    }
  }

  const addInvestimento = async (investimento: Omit<Investimento, "id" | "creationDate">) => {
    try {
      const response = await api.post("/investments", investimento)
      setInvestimentos((prev) => [...prev, response.data])
      return response.data
    } catch (error) {
      handleApiError(error, "Erro ao adicionar investimento")
      throw error
    }
  }

  const updateInvestimento = async (id: string, investimento: Partial<Omit<Investimento, "id" | "creationDate">>) => {
    try {
      const response = await api.put(`/investments/${id}`, investimento)
      setInvestimentos((prev) => prev.map((i) => (i.id === id ? response.data : i)))
      return response.data
    } catch (error) {
      handleApiError(error, "Erro ao atualizar investimento")
      throw error
    }
  }

  const deleteInvestimento = async (id: string) => {
    try {
      await api.delete(`/investments/${id}`)
      setInvestimentos((prev) => prev.filter((i) => i.id !== id))
    } catch (error) {
      handleApiError(error, "Erro ao deletar investimento")
      throw error
    }
  }

  // Métodos para Objetivos
  const fetchObjetivos = async () => {
    try {
      const response = await api.get("/objectives")
      setObjetivos(response.data)
    } catch (error) {
      handleApiError(error, "Erro ao buscar objetivos")
      setObjetivos([])
    }
  }

  const addObjetivo = async (objetivo: Omit<Objetivo, "id" | "creationDate">) => {
    try {
      const response = await api.post("/objectives", objetivo)
      setObjetivos((prev) => [...prev, response.data])
      return response.data
    } catch (error) {
      handleApiError(error, "Erro ao adicionar objetivo")
      throw error
    }
  }

  const updateObjetivo = async (id: string, objetivo: Partial<Omit<Objetivo, "id" | "creationDate">>) => {
    try {
      const response = await api.put(`/objectives/${id}`, objetivo)
      setObjetivos((prev) => prev.map((o) => (o.id === id ? response.data : o)))
      return response.data
    } catch (error) {
      handleApiError(error, "Erro ao atualizar objetivo")
      throw error
    }
  }

  const deleteObjetivo = async (id: string) => {
    try {
      await api.delete(`/objectives/${id}`)
      setObjetivos((prev) => prev.filter((o) => o.id !== id))
    } catch (error) {
      handleApiError(error, "Erro ao deletar objetivo")
      throw error
    }
  }

  // Métodos para Categorias
  const fetchCategorias = async () => {
    try {
      const response = await api.get("/categories")
      setCategorias(response.data)
    } catch (error) {
      handleApiError(error, "Erro ao buscar categorias")
      setCategorias([])
    }
  }

  const addCategoria = async (categoria: Omit<Categoria, "id">) => {
    try {
      const response = await api.post("/categories", categoria)
      setCategorias((prev) => [...prev, response.data])
      return response.data
    } catch (error) {
      handleApiError(error, "Erro ao adicionar categoria")
      throw error
    }
  }

  const updateCategoria = async (id: string, categoria: Partial<Omit<Categoria, "id">>) => {
    try {
      const response = await api.put(`/categories/${id}`, categoria)
      setCategorias((prev) => prev.map((c) => (c.id === id ? response.data : c)))

      // Update expenses that use this category
      if (Object.keys(categoria).length > 0) {
        setDespesas((prev) =>
          prev.map((d) => {
            if (d.category === id) {
              return {
                ...d,
                category: response.data.id,
              }
            }
            return d
          }),
        )
      }

      return response.data
    } catch (error) {
      handleApiError(error, "Erro ao atualizar categoria")
      throw error
    }
  }

  const deleteCategoria = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`)
      setCategorias((prev) => prev.filter((c) => c.id !== id))

      // Remove category from expenses
      setDespesas((prev) =>
        prev.map((d) => {
          if (d.category === id) {
            return {
              ...d,
              category: null,
            }
          }
          return d
        }),
      )
    } catch (error) {
      handleApiError(error, "Erro ao deletar categoria")
      throw error
    }
  }

  return (
    <DataContext.Provider
      value={{
        ganhos,
        despesas,
        investimentos,
        objetivos,
        categorias,
        fetchGanhos,
        addGanho,
        updateGanho,
        deleteGanho,
        fetchDespesas,
        addDespesa,
        updateDespesa,
        deleteDespesa,
        fetchInvestimentos,
        addInvestimento,
        updateInvestimento,
        deleteInvestimento,
        fetchObjetivos,
        addObjetivo,
        updateObjetivo,
        deleteObjetivo,
        fetchCategorias,
        addCategoria,
        updateCategoria,
        deleteCategoria,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)

  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }

  return context
}
