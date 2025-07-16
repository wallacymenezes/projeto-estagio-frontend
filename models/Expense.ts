import type { Category } from "./Category";

export type ExpenseStatus = "PAID" | "PENDING" | "OVERDUE" | "CANCELLED";

export interface Expense {
  id: number;
  name: string;
  description?: string;
  value: number;
  creationDate: string;
  vencimento: string; // Novo campo
  lastUpdate?: string; // Novo campo
  category: Category | null;
  categoryId?: number;
  userId?: string;
  status: ExpenseStatus;
}