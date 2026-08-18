export interface DashboardSummary {
  totalRevenue: number;
  revenueTrend: string;
  outstandingCredit: number;
  creditAccounts: number;
  overdueAccounts: number;
  stockAlerts: number;
  outOfStock: number;
  monthlyPayroll: number;
  payrollEmployees: number;
  payrollProcessed: string;
  revenueByMonth: { month: string; revenue: number; expenses: number }[];
  salesByCategory: { category: string; percentage: number; color: string }[];
}

export type { Customer, CustomerOrder } from './customer';
export type { Supplier } from './supplier';
export type { Product } from './product';
export type { SalesOrder } from './salesOrder';
export type { Employee } from './employee';
export type { Expense } from './expense';
