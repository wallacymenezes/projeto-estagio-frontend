import type { Objective } from "./Objective";

export interface Investment {
  id: number;
  name: string;
  description?: string;
  percentage: number;
  months: number;
  creation_date: string;
  lastUpdate?: string; // Novo campo
  value: number;
  investmentType: "TESOURO" | "FIIS" | "ACOES" | "POUPANCA" | "CDI" | "CRYPTO";
  objectiveId?: number | null;
  objective?: Objective | null;
  userId?: string;
}