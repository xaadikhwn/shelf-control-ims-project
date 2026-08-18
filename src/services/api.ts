import apiClient from './apiClient';
import type {
  DashboardSummary,
  Customer,
  Supplier,
  Product,
  SalesOrder,
  Employee,
  Expense,
} from '../types';

export const api = {
  // Dashboard
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get('/dashboard/summary');
    return res.data.data;
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const res = await apiClient.get('/customers');
    return res.data.data;
  },
  getCustomerById: async (id: string | number): Promise<Customer> => {
    const res = await apiClient.get(`/customers/${id}`);
    return res.data.data;
  },
  recordCustomerPayment: async (customerId: string | number, amount: number) => {
    const res = await apiClient.post(`/customers/${customerId}/payments`, { amount });
    return res.data;
  },
  createCustomer: async (data: any): Promise<Customer> => {
    const res = await apiClient.post('/customers', data);
    return res.data.data;
  },
  updateCustomer: async (id: string | number, data: any): Promise<Customer> => {
    const res = await apiClient.put(`/customers/${id}`, data);
    return res.data.data;
  },
  deleteCustomer: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },

  // Suppliers
  getSuppliers: async (): Promise<Supplier[]> => {
    const res = await apiClient.get('/suppliers');
    return res.data.data;
  },
  createSupplier: async (data: Partial<Supplier>): Promise<Supplier> => {
    const res = await apiClient.post('/suppliers', data);
    return res.data.data;
  },
  updateSupplier: async (id: string | number, data: Partial<Supplier>): Promise<Supplier> => {
    const res = await apiClient.put(`/suppliers/${id}`, data);
    return res.data.data;
  },
  deleteSupplier: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },
  recordSupplierPayment: async (supplierId: string | number, amount: number) => {
    const res = await apiClient.post(`/suppliers/${supplierId}/payments`, { amount });
    return res.data;
  },
  recordSupplierPurchase: async (supplierId: string | number, amount: number, reference?: string) => {
    const res = await apiClient.post(`/suppliers/${supplierId}/purchases`, { amount, reference });
    return res.data;
  },

  // Products / Inventory
  getProducts: async (): Promise<Product[]> => {
    const res = await apiClient.get('/products');
    return res.data.data;
  },
  getProductById: async (id: string | number): Promise<Product> => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data.data;
  },
  createProduct: async (data: any): Promise<Product> => {
    const res = await apiClient.post('/products', data);
    return res.data.data;
  },
  updateProduct: async (id: string | number, data: any): Promise<Product> => {
    const res = await apiClient.put(`/products/${id}`, data);
    return res.data.data;
  },
  deleteProduct: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  // Sales
  getSalesOrders: async (): Promise<SalesOrder[]> => {
    const res = await apiClient.get('/sales');
    return res.data.data;
  },
  getSalesOrderById: async (id: string | number): Promise<SalesOrder> => {
    const res = await apiClient.get(`/sales/${id}`);
    return res.data.data;
  },
  createSale: async (data: { customer_id: number | string; payment_status: string; items: { product_id: number; quantity: number }[] }) => {
    const res = await apiClient.post('/sales', data);
    return res.data.data;
  },

  // Payroll
  getPayroll: async (): Promise<Employee[]> => {
    const res = await apiClient.get('/payroll');
    return res.data.data;
  },
  createEmployee: async (data: Partial<Employee>): Promise<Employee> => {
    const res = await apiClient.post('/payroll', data);
    return res.data.data;
  },
  runPayroll: async (): Promise<void> => {
    await apiClient.post('/payroll/run');
  },

  // Expenses
  getExpenses: async (): Promise<Expense[]> => {
    const res = await apiClient.get('/expenses');
    return res.data.data;
  },
  createExpense: async (data: Partial<Expense>): Promise<Expense> => {
    const res = await apiClient.post('/expenses', data);
    return res.data.data;
  },
  updateExpenseStatus: async (id: number, status: 'approved' | 'rejected') => {
    const res = await apiClient.patch(`/expenses/${id}/status`, { status });
    return res.data;
  },
  updateExpense: async (id: number, data: any) => {
    const res = await apiClient.put(`/expenses/${id}`, data);
    return res.data;
  },
  deleteExpense: async (id: number) => {
    await apiClient.delete(`/expenses/${id}`);
  },
};
