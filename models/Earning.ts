export interface Earning {
  id: number;
  name: string;
  description?: string;
  value: number;
  creationDate: string;
  recebimento: string; // Novo campo
  lastUpdate?: string; // Novo campo
  wage: boolean;
  userId?: string;
}