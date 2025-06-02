import type { Category } from "./Category";

export type ExpenseStatus = "PAID" | "PENDING" | "OVERDUE" | "CANCELLED";

export interface Expense {
  id: number;
  name: string;
  description?: string;
  value: number;
  creationDate: string;
  /** Representa o objeto Category populado no frontend. A API pode retornar um categoryId. */
  category: Category | null;
  /** O ID da categoria como retornado pela API, usado para popular o objeto 'category'. */
  categoryId?: number; // Adicionado para manter o ID original da API
  userId?: string;
  status: ExpenseStatus;
}