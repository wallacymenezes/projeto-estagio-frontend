"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
  useMemo,
} from "react";
import { Earning } from "@/models/Earning";
import { Expense, ExpenseStatus } from "@/models/Expense";
import { Investment } from "@/models/Investment";
import { Objective } from "@/models/Objective";
import { Category } from "@/models/Category";
import { atualizar, buscar, register, deletar } from "@/Service/Service";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./auth-context";

// Context Type
interface DataContextType {
  Earnings: Earning[];
  Expenses: Expense[];
  Investments: Investment[];
  Objectives: Objective[];
  Categorys: Category[];

  fetchEarnings: () => Promise<void>;
  addEarning: (Earning: Omit<Earning, "id" | "creationDate">) => Promise<any>;
  updateEarning: (
    id: number,
    Earning: Partial<Omit<Earning, "id" | "creationDate">>
  ) => Promise<any>;
  deleteEarning: (id: number) => Promise<void>;

  fetchExpenses: () => Promise<void>;
  // Espera o objeto Category completo e status
  addExpense: (expense: Omit<Expense, "id" | "creationDate" | "category" | "userId"> & { category: number, status: ExpenseStatus }) => Promise<Expense | undefined>;
  updateExpense: (
    id: number,
    expense: Partial<Omit<Expense, "id" | "creationDate" | "category" | "userId">> & { category?: number, status?: ExpenseStatus }
  ) => Promise<Expense | undefined>;
  deleteExpense: (id: number) => Promise<void>;

  fetchInvestments: () => Promise<void>;
  addInvestment: (
    Investment: Omit<Investment, "id" | "creationDate">
  ) => Promise<any>;
  updateInvestment: (
    id: number,
    Investment: Partial<Omit<Investment, "id" | "creationDate">>
  ) => Promise<any>;
  deleteInvestment: (id: number) => Promise<void>;

  fetchObjectives: () => Promise<void>;
  addObjective: (
    Objective: Omit<Objective, "id" | "creationDate">
  ) => Promise<any>;
  updateObjective: (
    id: number,
    Objective: Partial<Omit<Objective, "id" | "creationDate">>
  ) => Promise<any>;
  deleteObjective: (id: number) => Promise<void>;

  fetchCategorys: () => Promise<void>;
  addCategory: (Category: Omit<Category, "id">) => Promise<any>;
  updateCategory: (
    id: number,
    Category: Partial<Omit<Category, "id">>
  ) => Promise<any>;
  deleteCategory: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const token = useMemo(() => user?.token || "", [user?.token]);
  const userId = useMemo(() => user?.userId || "", [user?.userId]);

  const [Earnings, setEarnings] = useState<Earning[]>([]);
  const [Expenses, setExpenses] = useState<Expense[]>([]);
  const [Investments, setInvestments] = useState<Investment[]>([]);
  const [Objectives, setObjectives] = useState<Objective[]>([]);
  const [Categorys, setCategorys] = useState<Category[]>([]);

  // Earnings
  const fetchEarnings = useCallback(async () => {
    if (authLoading || !token || !userId) return;
    try {
      const data = await buscar(`/earnings/user/${userId}`, token);
      setEarnings(data);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Ganhos",
        description: error.message || "Erro.",
        variant: "destructive",
      });
      setEarnings([]);
    }
  }, [token, userId, authLoading]);

  const addEarning = async (earning: Omit<Earning, "id" | "creationDate">) => {
    try {
      const newEarning = await register(
        "/earnings",
        { ...earning, userId },
        token
      );
      setEarnings((prev) => [...prev, newEarning]);
      return newEarning;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Earning",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEarning = async (
    id: number,
    earning: Partial<Omit<Earning, "id" | "creationDate">>
  ) => {
    try {
      const updated = await atualizar(
        `/earnings/${id}`,
        { ...earning, id, userId },
        token
      );
      setEarnings((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Earning",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEarning = async (id: number) => {
    try {
      await deletar(`/earnings/${id}`, token);
      setEarnings((prev) => prev.filter((e) => e.id !== id));
    } catch (error: any) {
      toast({
        title: "Erro ao deletar Earning",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Expenses
  const fetchExpenses = useCallback(async () => {
    if (authLoading || !token || !userId) {
      // Verificar authLoading, token e userId
      return;
    }
    try {
      const data = await buscar(`/expenses/user/${userId}`, token);
      setExpenses(data);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Despesas",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      setExpenses([]); // Definir como array vazio em caso de erro
    }
  }, [token, userId, authLoading]);

  const addExpense = async (expense: Omit<Expense, "id" | "creationDate" | "category" | "userId"> & { category: number, status: ExpenseStatus }): Promise<Expense | undefined> => {
    try {
      const expensePayload = {
        ...expense, // Contém name, description, value, status
        userId,
        category: expense.category, // Já deve ser o ID da categoria
      };

      const newExpenseResponse = await register("/expenses", expensePayload, token);

      // Para atualizar o estado local corretamente, buscamos a categoria completa
      const categoryDetails = Categorys.find(cat => cat.id === expense.category);

      if (newExpenseResponse && categoryDetails) {
        const newExpenseWithCategory: Expense = {
          ...newExpenseResponse, // Resposta do backend (pode já ter a categoria completa)
          category: categoryDetails, // Garante que temos o objeto Category
          status: expense.status, // Garante que o status está correto no estado local
        };
        setExpenses((prev) => [...prev, newExpenseWithCategory]);
        return newExpenseWithCategory;
      }
      return newExpenseResponse; // Retorna a resposta do backend mesmo se a categoria não for encontrada localmente
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Despesa",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateExpense = async (
    id: number,
    expense: Partial<Omit<Expense, "id" | "creationDate" | "category" | "userId">> & { category?: number, status?: ExpenseStatus }
  ): Promise<Expense | undefined> => {
    try {
      const expensePayload: any = { ...expense, id, userId };
      if (expense.category) {
        expensePayload.category = expense.category; // Já deve ser o ID
      }

      const updatedExpenseResponse = await atualizar(`/expenses/${id}`, expensePayload, token);

      // Para atualizar o estado local corretamente
      const categoryDetails = expense.category ? Categorys.find(cat => cat.id === expense.category) : undefined;

      if (updatedExpenseResponse) {
         const updatedExpenseWithCategory: Expense = {
            ...updatedExpenseResponse,
            // Se a categoria foi atualizada, use os detalhes dela. Senão, mantenha a existente.
            category: categoryDetails || Expenses.find(exp => exp.id === id)?.category!,
            status: expense.status || Expenses.find(exp => exp.id === id)?.status!,
         };
        setExpenses((prev) => prev.map((e) => (e.id === id ? updatedExpenseWithCategory : e)));
        return updatedExpenseWithCategory;
      }
      return updatedExpenseResponse;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Despesa",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      await deletar(`/expenses/${id}`, token);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (error: any) {
      toast({
        title: "Erro ao deletar Expense",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Investments
  const fetchInvestments = useCallback(async () => {
    if (authLoading || !token || !userId) return;
    try {
      const data = await buscar(`/investments/user/${userId}`, token);
      setInvestments(data);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Investimentos",
        description: error.message || "Erro.",
        variant: "destructive",
      });
      setInvestments([]);
    }
  }, [token, userId, authLoading]);

  const addInvestment = async (
    investment: Omit<Investment, "id" | "creationDate">
  ) => {
    try {
      const newInvestment = await register(
        "/investments",
        { ...investment, userId },
        token
      );
      setInvestments((prev) => [...prev, newInvestment]);
      return newInvestment;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Investment",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateInvestment = async (
    id: number,
    investment: Partial<Omit<Investment, "id" | "creationDate">>
  ) => {
    try {
      const updated = await atualizar(
        `/investments`,
        { ...investment, id, userId },
        token
      );
      setInvestments((prev) => prev.map((i) => (i.id === id ? updated : i)));
      return updated;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Investment",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteInvestment = async (id: number) => {
    try {
      await deletar(`/investments/${id}`, token);
      setInvestments((prev) => prev.filter((i) => i.id !== id));
    } catch (error: any) {
      toast({
        title: "Erro ao deletar Investment",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Objectives
  const fetchObjectives = useCallback(async () => {
    if (authLoading || !token || !userId) return;
    try {
      const data = await buscar(`/objectives/user/${userId}`, token);
      setObjectives(data);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Objetivos",
        description: error.message || "Erro.",
        variant: "destructive",
      });
      setObjectives([]);
    }
  }, [token, userId, authLoading]);

  const addObjective = async (
    objective: Omit<Objective, "id" | "creationDate">
  ) => {
    try {
      const newObjective = await register(
        "/objectives",
        { ...objective, userId },
        token
      );
      setObjectives((prev) => [...prev, newObjective]);
      return newObjective;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Objective",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateObjective = async (
    id: number,
    objective: Partial<Omit<Objective, "id" | "creationDate">>
  ) => {
    try {
      const updated = await atualizar(
        `/objectives/${id}`,
        { ...objective, id, userId },
        token
      );
      setObjectives((prev) => prev.map((o) => (o.id === id ? updated : o)));
      return updated;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Objective",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteObjective = async (id: number) => {
    try {
      await deletar(`/objectives/${id}`, token);
      setObjectives((prev) => prev.filter((o) => o.id !== id));
    } catch (error: any) {
      toast({
        title: "Erro ao deletar Objective",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Categorys
  const fetchCategorys = useCallback(async () => {
    if (authLoading || !token || !userId) {
      // Verificar authLoading, token e userId
      return;
    }
    try {
      const data = await buscar(`/categories/user/${userId}`, token);
      setCategorys(data);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Categorias",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      setCategorys([]); // Definir como array vazio em caso de erro
    }
  }, [token, userId, authLoading]);

  const addCategory = async (category: Omit<Category, "id">) => {
    try {
      const newCategory = await register(
        "/categories",
        { ...category, userId },
        token
      );
      setCategorys((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Category",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCategory = async (
    id: number,
    category: Partial<Omit<Category, "id">>
  ) => {
    try {
      const updated = await atualizar(
        `/categories`,
        { ...category, id, userId },
        token
      );
      setCategorys((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Category",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await deletar(`/categories/${id}`, token);
      setCategorys((prev) => prev.filter((c) => c.id !== id));
    } catch (error: any) {
      toast({
        title: "Erro ao deletar Category",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

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
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}
