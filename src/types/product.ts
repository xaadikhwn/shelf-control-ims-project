export interface Product {
  id?: number | string;
  dbId?: number;
  sku: string;
  name: string;
  category: string;
  qty: number;
  reorderPoint: number;
  cost: number;
  price: number;
  status: string;
}
