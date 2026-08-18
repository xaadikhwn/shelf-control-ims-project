export interface SalesOrder {
  id: string;
  customerId: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  orderStatus: string;
  payment: string;
}
