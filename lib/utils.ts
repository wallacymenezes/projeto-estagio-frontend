import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  // Adicionada uma verificação para garantir que o valor é um número
  if (typeof value !== 'number') {
    return "R$ 0,00";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(date: Date): string {
  // Verifica se a data é válida
  if (!(date instanceof Date && !isNaN(date.getTime()))) {
    return "";
  }
  return new Intl.DateTimeFormat("pt-BR").format(date)
}

export function formatDatetime(date: Date): string {
  // Verifica se a data é válida
  if (!(date instanceof Date && !isNaN(date.getTime()))) {
    return "";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}