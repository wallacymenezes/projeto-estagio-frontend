export interface Earning {
  id: number;
  name: string;
  description?: string;
  value: number;
  creationDate: string;
  wage: boolean; // se é salário ou não
  userId?: string;
}
