export interface Category {
  id: number;
  name: string;
  description: string;
  color?: string;
  userId?: string; // id do usuário dono da categoria
}