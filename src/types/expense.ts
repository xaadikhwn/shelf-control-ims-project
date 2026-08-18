export interface Expense {
  id?: number;
  ref: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  submittedBy: string;
  status: string;
}
