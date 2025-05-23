import type { Objective } from "./Objective";

export interface Investment {
  id: number;
  name: string;
  description?: string;
  percentage: number;
  months: number;
  creation_date: string;
  value: number;
  investmentType: "TESOURO" | "FIIS" | "ACOES" | "POUPANCA" | "CDI" | "CRYPTO";
  objectiveId?: Objective;
  userId?: string; // id do usuário dono do investimento
}
