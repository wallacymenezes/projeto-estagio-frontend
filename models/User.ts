import type { Earning } from "./Earning";
import type { Expense } from "./Expense";
import type { Investment } from "./Investment";
import type { Objective } from "./Objective";

export interface User {
  userId: string;
  name: string;
  email: string;
  password?: string;
  photo?: string;
  registrationMethod?: string;
  token: string;
  earnings: Earning[];
  expenses: Expense[];
  investments: Investment[];
  objectives: Objective[];
}
