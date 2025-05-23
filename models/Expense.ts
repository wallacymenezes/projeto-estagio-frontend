import type { Category } from "./Category";

export interface Expense {
  id: number;
  name: string;
  description?: string;
  value: number;
  creationDate: string; // ou Date, se for convertido com new Date()
  category: Category; // nome da categoria ou ID dependendo da API
  userId?: string;
}
