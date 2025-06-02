// wallacymenezes/projeto-estagio-frontend/projeto-estagio-frontend-d0eaefe2ab734cdf8502a055fd12d3c722944237/models/Expense.ts
import type { Category } from "./Category";

// Definir os possíveis status para uma despesa
export type ExpenseStatus = "PAID" | "PENDING" | "OVERDUE";

export interface Expense {
  id: number;
  name: string;
  description?: string;
  value: number;
  creationDate: string;
  category: Category;
  userId?: string;
  status: ExpenseStatus; // Novo campo adicionado
}
