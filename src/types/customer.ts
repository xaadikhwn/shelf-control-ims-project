export interface CustomerOrder {
  id: string;
  date: string;
  items: number;
  total: number;
  status: string;
  payment: string;
}

export interface Customer {
  id: string;
  dbId?: number;
  company: string;
  contact: string;
  phone: string;
  email?: string;
  creditLimit: number;
  outstanding: number;
  lastOrder: string;
  status: string;
  orders: CustomerOrder[];
}
