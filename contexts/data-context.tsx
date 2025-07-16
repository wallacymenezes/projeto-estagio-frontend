"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
  useMemo,
  useEffect,
} from "react";
import { usePathname } from "next/navigation";
import { Earning } from "@/models/Earning";
import { Expense, ExpenseStatus } from "@/models/Expense";
import { Investment } from "@/models/Investment";
import { Objective } from "@/models/Objective";
import { Category } from "@/models/Category";
import { atualizar, buscar, register, deletar } from "@/Service/Service";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./auth-context";

// Interfaces para os dados brutos que vêm do backend
interface BackendExpenseData {
  id: number;
  name: string;
  description?: string;
  value: number;
  creationDate: string;
  vencimento: string;
  lastUpdate?: string;
  categoryId: number;
  userId?: string;
  status: ExpenseStatus;
}

interface BackendEarningData {
  id: number;
  name: string;
  description?: string;
  value: number;
  creationDate: string;
  recebimento: string;
  lastUpdate?: string;
  wage: boolean;
  userId?: string;
}

// Interface principal do contexto
interface DataContextType {
  Earnings: Earning[];
  Expenses: Expense[];
  Investments: Investment[];
  Objectives: Objective[];
  Categorys: Category[];
  isLoadingData: boolean;
  // Funções de busca (mantidas para possíveis re-fetches manuais)
  fetchEarnings: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  fetchInvestments: () => Promise<void>;
  fetchObjectives: () => Promise<void>;
  fetchCategorys: () => Promise<void>;
  // Funções de modificação de dados
  addEarning: (earning: Omit<Earning, "id" | "creationDate" | "lastUpdate">) => Promise<void>;
  updateEarning: (id: number, earning: Partial<Omit<Earning, "id" | "creationDate" | "lastUpdate">>) => Promise<void>;
  deleteEarning: (id: number) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id" | "creationDate" | "lastUpdate" | "category" | "categoryId">) => Promise<void>;
  updateExpense: (id: number, expense: Partial<Omit<Expense, "id" | "creationDate" | "lastUpdate" | "category" | "categoryId">>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  addInvestment: (investment: Omit<Investment, "id" | "creation_date" | "lastUpdate" | "objective">) => Promise<void>;
  updateInvestment: (id: number, investment: Partial<Omit<Investment, "id" | "creation_date" | "lastUpdate" | "objective">>) => Promise<void>;
  deleteInvestment: (id: number) => Promise<void>;
  addObjective: (objective: Omit<Objective, "id" | "creationDate">) => Promise<void>;
  updateObjective: (id: number, objective: Partial<Omit<Objective, "id" | "creationDate">>) => Promise<void>;
  deleteObjective: (id: number) => Promise<void>;
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (id: number, category: Partial<Omit<Category, "id">>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const token = useMemo(() => user?.token || "", [user?.token]);
  const userId = useMemo(() => user?.userId || "", [user?.userId]);
  const pathname = usePathname();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [Earnings, setEarnings] = useState<Earning[]>([]);
  const [Expenses, setExpenses] = useState<Expense[]>([]);
  const [Investments, setInvestments] = useState<Investment[]>([]);
  const [Objectives, setObjectives] = useState<Objective[]>([]);
  const [Categorys, setCategorys] = useState<Category[]>([]);

  const fetchAllInitialData = useCallback(async () => {
    const protectedRoutes = ['/dashboard', '/despesas', '/ganhos', '/investimentos', '/objetivos', '/categorias', '/perfil'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (!authLoading && userId && token && isProtectedRoute) {
      setIsLoadingData(true);
      try {
        const [earningsData, expensesData, investmentsData, objectivesData, categoriesData] = await Promise.all([
          buscar<BackendEarningData[]>(`/earnings/user/${userId}`, token),
          buscar<BackendExpenseData[]>(`/expenses/user/${userId}`, token),
          buscar<Investment[]>(`/investments/user/${userId}`, token),
          buscar<Objective[]>(`/objectives/user/${userId}`, token),
          buscar<Category[]>(`/categories/user/${userId}`, token),
        ]);

        const populatedExpenses = expensesData.map(exp => ({
          ...exp,
          category: categoriesData.find(cat => cat.id === exp.categoryId) || null,
        }));

        const populatedInvestments = investmentsData.map(inv => ({
            ...inv,
            objective: objectivesData.find(obj => obj.id === inv.objectiveId) || null
        }));

        setEarnings(earningsData);
        setExpenses(populatedExpenses);
        setInvestments(populatedInvestments);
        setObjectives(objectivesData);
        setCategorys(categoriesData);

      } catch (error) {
        console.error("DataContext: Erro ao buscar dados iniciais.", error);
        toast({ title: "Erro ao carregar dados", description: "Não foi possível carregar as informações.", variant: "destructive" });
      } finally {
        setIsLoadingData(false);
      }
    } else if (!authLoading) {
      setIsLoadingData(false);
    }
  }, [userId, token, authLoading, pathname]);

  useEffect(() => {
    fetchAllInitialData();
  }, [fetchAllInitialData]);


  // Funções de CRUD (Create, Read, Update, Delete)

  // Ganhos (Earnings)
  const fetchEarnings = useCallback(async () => { /* Implementação de re-fetch se necessário */ }, []);
  const addEarning = async (earning: Omit<Earning, "id" | "creationDate" | "lastUpdate">) => {
    try {
      await register("/earnings", { ...earning, userId }, token);
      fetchAllInitialData(); // Re-sincroniza todos os dados
    } catch (error) { /* ... */ }
  };
  const updateEarning = async (id: number, earning: Partial<Omit<Earning, "id" | "creationDate" | "lastUpdate">>) => {
    try {
      await atualizar(`/earnings`, { ...earning, id }, token);
      fetchAllInitialData();
    } catch (error) { /* ... */ }
  };
  const deleteEarning = async (id: number) => {
    try {
      await deletar(`/earnings/${id}`, token);
      fetchAllInitialData();
    } catch (error) { /* ... */ }
  };

  // Despesas (Expenses)
  const fetchExpenses = useCallback(async () => { /* ... */ }, []);
  const addExpense = async (expense: Omit<Expense, "id" | "creationDate" | "lastUpdate" | "category" | "categoryId">) => {
    try {
        const payload = {
            ...expense,
            categoryId: (expense as any).category.id,
            userId,
        };
        delete (payload as any).category;
        await register("/expenses", payload, token);
        fetchAllInitialData();
    } catch (error) { /* ... */ }
  };
  const updateExpense = async (id: number, expense: Partial<Omit<Expense, "id" | "creationDate" | "lastUpdate" | "category" | "categoryId">>) => {
    try {
        const payload: any = { ...expense, id };
        if (payload.category) {
            payload.categoryId = payload.category.id;
            delete payload.category;
        }
        await atualizar(`/expenses`, payload, token);
        fetchAllInitialData();
    } catch (error) { /* ... */ }
  };
  const deleteExpense = async (id: number) => {
    try {
      await deletar(`/expenses/${id}`, token);
      fetchAllInitialData();
    } catch (error) { /* ... */ }
  };

  // Investimentos (Investments)
  const fetchInvestments = useCallback(async () => { /* ... */ }, []);
  const addInvestment = async (investment: Omit<Investment, "id" | "creation_date" | "lastUpdate" | "objective">) => {
    try {
      await register("/investments", { ...investment, userId }, token);
      fetchAllInitialData();
    } catch(error) { /* ... */ }
  };
  const updateInvestment = async (id: number, investment: Partial<Omit<Investment, "id" | "creation_date" | "lastUpdate" | "objective">>) => {
    try {
        await atualizar(`/investments`, { ...investment, id }, token);
        fetchAllInitialData();
    } catch(error) { /* ... */ }
  };
  const deleteInvestment = async (id: number) => {
    try {
        await deletar(`/investments/${id}`, token);
        fetchAllInitialData();
    } catch(error) { /* ... */ }
  };

  // Objetivos (Objectives)
  const fetchObjectives = useCallback(async () => { /* ... */ }, []);
  const addObjective = async (objective: Omit<Objective, "id" | "creationDate">) => {
    try {
        await register("/objectives", { ...objective, userId }, token);
        fetchAllInitialData();
    } catch(error) { /* ... */ }
  };
  const updateObjective = async (id: number, objective: Partial<Omit<Objective, "id" | "creationDate">>) => {
    try {
        await atualizar(`/objectives`, { ...objective, id }, token);
        fetchAllInitialData();
    } catch(error) { /* ... */ }
  };
  const deleteObjective = async (id: number) => {
    try {
        await deletar(`/objectives/${id}`, token);
        fetchAllInitialData();
    } catch(error) { /* ... */ }
  };

  // Categorias (Categorys)
  const fetchCategorys = useCallback(async () => { /* ... */ }, []);
  const addCategory = async (category: Omit<Category, "id">) => {
    try {
        await register("/categories", { ...category, userId }, token);
        fetchAllInitialData();
    } catch(error) { /* ... */ }
  };
  const updateCategory = async (id: number, category: Partial<Omit<Category, "id">>) => {
    try {
        await atualizar(`/categories`, { ...category, id }, token);
        fetchAllInitialData();
    } catch(error) { /* ... */ }
  };
  const deleteCategory = async (id: number) => {
    try {
        await deletar(`/categories/${id}`, token);
        fetchAllInitialData();
    } catch(error) { /* ... */ }
  };


  return (
    <DataContext.Provider
      value={{
        Earnings,
        Expenses,
        Investments,
        Objectives,
        Categorys,
        isLoadingData,
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
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}