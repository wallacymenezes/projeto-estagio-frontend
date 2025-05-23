"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Earning } from "@/models/Earning";
import { Expense } from "@/models/Expense";
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
  addExpense: (Expense: Omit<Expense, "id" | "creationDate">) => Promise<any>;
  updateExpense: (
    id: number,
    Expense: Partial<Omit<Expense, "id" | "creationDate">>
  ) => Promise<any>;
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

  const { user } = useAuth();
  const token = user?.token || "";
  const userId = user?.userId || "";

  const [Earnings, setEarnings] = useState<Earning[]>([]);
  const [Expenses, setExpenses] = useState<Expense[]>([]);
  const [Investments, setInvestments] = useState<Investment[]>([]);
  const [Objectives, setObjectives] = useState<Objective[]>([]);
  const [Categorys, setCategorys] = useState<Category[]>([]);

  // Earnings
  const fetchEarnings = useCallback(async () => {
    try {
      const data = await buscar(`/earnings/user/${userId}`, token);
      setEarnings(data);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Earnings",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      setEarnings([]);
    }
  }, [token]);

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
    try {
      const data = await buscar(`/expenses/user/${userId}`, token);
      setExpenses(data);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Expenses",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      setExpenses([]);
    }
  }, [token]);

  const addExpense = async (expense: Omit<Expense, "id" | "creationDate">) => {
    try {
      const expensePayload = {
        ...expense,
        userId,
        category: typeof expense.category === 'object' && expense.category?.id 
          ? expense.category.id 
          : expense.category
      };

      const newExpense = await register("/expenses", expensePayload, token);
      setExpenses((prev) => [...prev, newExpense]);
      return newExpense;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Expense",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateExpense = async (
    id: number,
    expense: Partial<Omit<Expense, "id" | "creationDate">>
  ) => {
    try {
      const updated = await atualizar(`/expenses/${id}`, { ...expense, id, userId }, token);
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Expense",
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
    try {
      const data = await buscar(`/investments/user/${userId}`, token);
      setInvestments(data);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Investments",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      setInvestments([]);
    }
  }, [token]);

  const addInvestment = async (
    investment: Omit<Investment, "id" | "creationDate">
  ) => {
    try {
      const newInvestment = await register("/investments", { ...investment, userId }, token);
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
      const updated = await atualizar(`/investments/${id}`, { ...investment, id, userId }, token);
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
    try {
      const data = await buscar(`/objectives/user/${userId}`, token);
      setObjectives(data);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Objectives",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      setObjectives([]);
    }
  }, [token]);

  const addObjective = async (
    objective: Omit<Objective, "id" | "creationDate">
  ) => {
    try {
      const newObjective = await register("/objectives", { ...objective, userId }, token);
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
      const updated = await atualizar(`/objectives/${id}`, { ...objective, id, userId }, token);
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
    try {
      const data = await buscar(`/categories/user/${userId}`, token);
      setCategorys(data);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar Categorys",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      setCategorys([]);
    }
  }, [token]);

  const addCategory = async (category: Omit<Category, "id">) => {
    try {
      const newCategory = await register("/categories", { ...category, userId }, token);
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
      const updated = await atualizar(`/categories`, { ...category, id, userId }, token);
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
