// wallacymenezes/projeto-estagio-frontend/projeto-estagio-frontend-d0eaefe2ab734cdf8502a055fd12d3c722944237/contexts/data-context.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
  useMemo,
  useEffect, // Importar useEffect
} from "react";
import { Earning } from "@/models/Earning";
import { Expense, ExpenseStatus } from "@/models/Expense";
import { Investment } from "@/models/Investment";
import { Objective } from "@/models/Objective";
import { Category } from "@/models/Category";
import { atualizar, buscar, register, deletar } from "@/Service/Service";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./auth-context";

interface BackendExpenseData {
  id: number;
  name: string;
  description?: string;
  value: number;
  creationDate: string;
  categoryId: number;
  userId?: string;
  status: ExpenseStatus;
}

interface DataContextType {
  Earnings: Earning[];
  Expenses: Expense[];
  Investments: Investment[];
  Objectives: Objective[];
  Categorys: Category[];

  isLoadingData: boolean;

  fetchEarnings: () => Promise<void>;
  addEarning: (earning: Omit<Earning, "id" | "creationDate">) => Promise<Earning | undefined>;
  updateEarning: (
    id: number,
    earning: Partial<Omit<Earning, "id" | "creationDate">>
  ) => Promise<Earning | undefined>;
  deleteEarning: (id: number) => Promise<void>;

  fetchExpenses: () => Promise<void>;
  addExpense: (expenseData: Omit<Expense, "id" | "creationDate" | "userId" | "categoryId">) => Promise<Expense | undefined>;
  updateExpense: (
    id: number,
    expenseData: Partial<Omit<Expense, "id" | "creationDate" | "userId" | "categoryId">>
  ) => Promise<Expense | undefined>;
  deleteExpense: (id: number) => Promise<void>;

  fetchInvestments: () => Promise<void>;
  addInvestment: (investment: Omit<Investment, "id" | "creation_date">) => Promise<Investment | undefined>;
  updateInvestment: (
    id: number,
    investment: Partial<Omit<Investment, "id" | "creation_date">>
  ) => Promise<Investment | undefined>;
  deleteInvestment: (id: number) => Promise<void>;

  fetchObjectives: () => Promise<void>;
  addObjective: (objective: Omit<Objective, "id" | "creationDate">) => Promise<Objective | undefined>;
  updateObjective: (
    id: number,
    objective: Partial<Omit<Objective, "id" | "creationDate">>
  ) => Promise<Objective | undefined>;
  deleteObjective: (id: number) => Promise<void>;

  fetchCategorys: () => Promise<void>;
  addCategory: (category: Omit<Category, "id">) => Promise<Category | undefined>;
  updateCategory: (
    id: number,
    category: Partial<Omit<Category, "id">>
  ) => Promise<Category | undefined>;
  deleteCategory: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const token = useMemo(() => user?.token || "", [user?.token]);
  const userId = useMemo(() => user?.userId || "", [user?.userId]);

  const [isLoadingData, setIsLoadingData] = useState(true); // Novo estado de loading
  const [Earnings, setEarnings] = useState<Earning[]>([]);
  const [Expenses, setExpenses] = useState<Expense[]>([]);
  const [Investments, setInvestments] = useState<Investment[]>([]);
  const [Objectives, setObjectives] = useState<Objective[]>([]);
  const [Categorys, setCategorys] = useState<Category[]>([]);

  useEffect(() => {
    // Só executa quando a autenticação terminar e tivermos um usuário válido
    if (!authLoading && userId && token) {
      const fetchAllInitialData = async () => {
        setIsLoadingData(true);
        try {
          // Busca categorias primeiro, pois as despesas dependem delas para serem populadas
          const categoriesData = await buscar<Category[]>(`/categories/user/${userId}`, token);
          setCategorys(categoriesData);

          // Busca o resto dos dados em paralelo
          const [earningsData, expensesFromApi, investmentsData, objectivesData] = await Promise.all([
            buscar<Earning[]>(`/earnings/user/${userId}`, token),
            buscar<BackendExpenseData[]>(`/expenses/user/${userId}`, token),
            buscar<Investment[]>(`/investments/user/${userId}`, token),
            buscar<Objective[]>(`/objectives/user/${userId}`, token),
          ]);

          // Popula as despesas com os detalhes das categorias buscadas
          const populatedExpenses: Expense[] = expensesFromApi.map(exp => {
            const categoryDetail = categoriesData.find(cat => cat.id === exp.categoryId);
            return {
              ...exp,
              category: categoryDetail || null,
              categoryId: exp.categoryId,
            };
          });

          setEarnings(earningsData);
          setExpenses(populatedExpenses);
          setInvestments(investmentsData);
          setObjectives(objectivesData);

        } catch (error: any) {
          console.error("DataContext: Erro ao buscar dados iniciais.", error);
          toast({ title: "Erro ao carregar dados", description: "Não foi possível carregar as informações.", variant: "destructive" });
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchAllInitialData();
    } else if (!authLoading) {
      // Se a autenticação terminou e não há usuário, limpa os dados
      setIsLoadingData(false);
      setEarnings([]);
      setExpenses([]);
      setInvestments([]);
      setObjectives([]);
      setCategorys([]);
    }
  }, [userId, token, authLoading]);

  const fetchCategorys = useCallback(async () => {
    if (authLoading || !token || !userId) return;
    try {
      const data: Category[] = await buscar(`/categories/user/${userId}`, token);
      setCategorys(data);
    } catch (error: any) {
      toast({ title: "Erro ao buscar Categorias", description: error.message || "Erro.", variant: "destructive" });
      setCategorys([]);
    }
  }, [token, userId, authLoading]);

  const fetchExpenses = useCallback(async () => {
    if (authLoading || !token || !userId) return;
    try {
      const categoriesData = await buscar<Category[]>(`/categories/user/${userId}`, token);
      setCategorys(categoriesData);
      
      const expensesFromApi: BackendExpenseData[] = await buscar(`/expenses/user/${userId}`, token);
      const populatedExpenses: Expense[] = expensesFromApi.map(exp => {
        const categoryDetail = categoriesData.find(cat => cat.id === exp.categoryId);
        return { ...exp, category: categoryDetail || null };
      });
      setExpenses(populatedExpenses);
    } catch (error) { /* ... */ }
  }, [token, userId, authLoading]);


  const addExpense = async (expenseData: Omit<Expense, "id" | "creationDate" | "userId" | "categoryId">): Promise<Expense | undefined> => {
    if (!expenseData.category) {
      toast({ title: "Erro", description: "Categoria não fornecida.", variant: "destructive" });
      return undefined;
    }
    try {
      const payload = {
        name: expenseData.name,
        description: expenseData.description,
        value: expenseData.value,
        categoryId: expenseData.category.id,
        status: expenseData.status,
        userId,
      };
      const newExpenseFromApi: BackendExpenseData = await register("/expenses", payload, token);
      const categoryDetail = Categorys.find(cat => cat.id === newExpenseFromApi.categoryId);
      const newPopulatedExpense: Expense = {
        ...newExpenseFromApi,
        category: categoryDetail || null, // CORREÇÃO: Garante que seja Category | null
      };
      setExpenses((prev) => [...prev, newPopulatedExpense]);
      return newPopulatedExpense;
    } catch (error: any) {
      toast({ title: "Erro ao adicionar Despesa", description: error.message || "Erro.", variant: "destructive" });
      throw error;
    }
  };

  const updateExpense = async (
    id: number,
    expenseData: Partial<Omit<Expense, "id" | "creationDate" | "userId" | "categoryId">>
  ): Promise<Expense | undefined> => {
    try {
      const payload: any = { ...expenseData, id, userId };
      if (expenseData.category && typeof expenseData.category === 'object' && expenseData.category.id) {
        payload.categoryId = expenseData.category.id;
        delete payload.category;
      } else if (expenseData.hasOwnProperty('category') && expenseData.category === null) { // Verifica se a intenção era remover a categoria
         payload.categoryId = null;
         delete payload.category;
      }


      const updatedExpenseFromApi: BackendExpenseData = await atualizar(`/expenses`, payload, token);
      const categoryDetail = updatedExpenseFromApi.categoryId ? Categorys.find(cat => cat.id === updatedExpenseFromApi.categoryId) : null;
      const updatedPopulatedExpense: Expense = {
        ...updatedExpenseFromApi,
        category: categoryDetail || null, // CORREÇÃO: categoryDetail já é Category | null ou undefined, que é convertido para null
      };
      setExpenses((prev) => prev.map((e) => (e.id === id ? updatedPopulatedExpense : e)));
      return updatedPopulatedExpense;
    } catch (error: any) {
      toast({ title: "Erro ao atualizar Despesa", description: error.message || "Erro.", variant: "destructive" });
      throw error;
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      await deletar(`/expenses/${id}`, token);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (error: any) {
      toast({
        title: "Erro ao deletar Despesa",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Earnings
  const fetchEarnings = useCallback(async () => {
    if (authLoading || !token || !userId) return;
    try {
      const data: Earning[] = await buscar(`/earnings/user/${userId}`, token);
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

  const addEarning = async (earning: Omit<Earning, "id" | "creationDate">): Promise<Earning | undefined> => {
    try {
      const newEarning: Earning = await register(
        "/earnings",
        { ...earning, userId },
        token
      );
      setEarnings((prev) => [...prev, newEarning]);
      return newEarning;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Ganho",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEarning = async (
    id: number,
    earning: Partial<Omit<Earning, "id" | "creationDate">>
  ): Promise<Earning | undefined> => {
    try {
      const updated: Earning = await atualizar(
        `/earnings`,
        { ...earning, id, userId },
        token
      );
      setEarnings((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Ganho",
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
        title: "Erro ao deletar Ganho",
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
      const data: Investment[] = await buscar(`/investments/user/${userId}`, token);
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

  const addInvestment = async (investment: Omit<Investment, "id" | "creation_date">): Promise<Investment | undefined> => {
    try {
      const newInvestment: Investment = await register(
        "/investments",
        { ...investment, userId },
        token
      );
      setInvestments((prev) => [...prev, newInvestment]);
      return newInvestment;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Investimento",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateInvestment = async (
    id: number,
    investment: Partial<Omit<Investment, "id" | "creation_date">>
  ): Promise<Investment | undefined> => {
    try {
      const updated: Investment = await atualizar(
        `/investments`, // Assumindo que o backend espera o ID na URL para PUT
        { ...investment, id, userId }, // Removido 'id' do corpo se já está na URL
        token
      );
      setInvestments((prev) => prev.map((i) => (i.id === id ? updated : i)));
      return updated;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Investimento",
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
        title: "Erro ao deletar Investimento",
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
      const data: Objective[] = await buscar(`/objectives/user/${userId}`, token);
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

  const addObjective = async (objective: Omit<Objective, "id" | "creationDate">): Promise<Objective | undefined> => {
    try {
      const newObjective: Objective = await register(
        "/objectives",
        { ...objective, userId },
        token
      );
      setObjectives((prev) => [...prev, newObjective]);
      return newObjective;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Objetivo",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateObjective = async (
    id: number,
    objective: Partial<Omit<Objective, "id" | "creationDate">>
  ): Promise<Objective | undefined> => {
    try {
      const updated: Objective = await atualizar(
        `/objectives`,
        { ...objective, id, userId },
        token
      );
      setObjectives((prev) => prev.map((o) => (o.id === id ? updated : o)));
      return updated;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Objetivo",
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
        title: "Erro ao deletar Objetivo",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Categorys
  const addCategory = async (category: Omit<Category, "id">): Promise<Category | undefined> => {
    try {
      const newCategory: Category = await register(
        "/categories",
        { ...category, userId },
        token
      );
      setCategorys((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar Categoria",
        description: error.message || "Erro durante a operação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCategory = async (
    id: number,
    category: Partial<Omit<Category, "id">>
  ): Promise<Category | undefined> => {
    try {
      const updated: Category = await atualizar(
        `/categories`, // Assumindo que o backend espera o ID na URL para PUT
        { ...category, id, userId }, // Removido 'id' do corpo se já está na URL
        token
      );
      setCategorys((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar Categoria",
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
        title: "Erro ao deletar Categoria",
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