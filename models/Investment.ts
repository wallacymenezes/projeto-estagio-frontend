export interface Investment {
  id: number;
  name: string;
  description?: string;
  percentage: number;
  months: number;
  creation_date: string;
  value: number;
  investmentType: string;
  objectiveId?: number;
  userId?: string; // id do usuário dono do investimento
}
