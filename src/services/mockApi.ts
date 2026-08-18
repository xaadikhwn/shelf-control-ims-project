import apiClient from './apiClient';
import { customers, suppliers, products, salesOrders, employees, expenses, dashboardSummary } from '../mock-data';
import type { Customer } from '../types/customer';
import type { Supplier } from '../types/supplier';
import type { Product } from '../types/product';
import type { SalesOrder } from '../types/salesOrder';
import type { Employee } from '../types/employee';
import type { Expense } from '../types/expense';
import type { DashboardSummary } from '../types';

export const mockApi = {
  // ── Dashboard ──────────────────────────────────────
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    try {
      const res = await apiClient.get('/dashboard/summary');
      if (res.data?.success && res.data?.data) return res.data.data;
    } catch (e) {
      console.warn('Backend endpoint unavailable, using fallback', e);
    }
    return { ...dashboardSummary };
  },

  // ── Customers ──────────────────────────────────────
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const res = await apiClient.get('/customers');
      if (res.data?.success && Array.isArray(res.data?.data)) return res.data.data;
    } catch (e) {
      console.warn('Backend endpoint unavailable, using fallback', e);
    }
    return [...customers];
  },

  getCustomerById: async (id: string): Promise<Customer | undefined> => {
    try {
      const res = await apiClient.get(`/customers/${id}`);
      if (res.data?.success && res.data?.data) return res.data.data;
    } catch (e) {
      console.warn('Backend endpoint unavailable, using fallback', e);
    }
    return customers.find((c) => c.id === id);
  },

  // ── Suppliers ──────────────────────────────────────
  getSuppliers: async (): Promise<Supplier[]> => {
    try {
      const res = await apiClient.get('/suppliers');
      if (res.data?.success && Array.isArray(res.data?.data)) return res.data.data;
    } catch (e) {
      console.warn('Backend endpoint unavailable, using fallback', e);
    }
    return [...suppliers];
  },

  // ── Products / Inventory ───────────────────────────
  getProducts: async (): Promise<Product[]> => {
    try {
      const res = await apiClient.get('/products');
      if (res.data?.success && Array.isArray(res.data?.data)) return res.data.data;
    } catch (e) {
      console.warn('Backend endpoint unavailable, using fallback', e);
    }
    return [...products];
  },

  // ── Sales Orders ───────────────────────────────────
  getSalesOrders: async (): Promise<SalesOrder[]> => {
    try {
      const res = await apiClient.get('/sales');
      if (res.data?.success && Array.isArray(res.data?.data)) return res.data.data;
    } catch (e) {
      console.warn('Backend endpoint unavailable, using fallback', e);
    }
    return [...salesOrders];
  },

  // ── Employees / Payroll ────────────────────────────
  getEmployees: async (): Promise<Employee[]> => {
    try {
      const res = await apiClient.get('/payroll');
      if (res.data?.success && Array.isArray(res.data?.data)) return res.data.data;
    } catch (e) {
      console.warn('Backend endpoint unavailable, using fallback', e);
    }
    return [...employees];
  },

  // ── Expenses ───────────────────────────────────────
  getExpenses: async (): Promise<Expense[]> => {
    try {
      const res = await apiClient.get('/expenses');
      if (res.data?.success && Array.isArray(res.data?.data)) return res.data.data;
    } catch (e) {
      console.warn('Backend endpoint unavailable, using fallback', e);
    }
    return [...expenses];
  },
};

export default mockApi;
