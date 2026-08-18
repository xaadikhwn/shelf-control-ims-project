export interface Supplier {
  id: string;
  dbId?: number;
  company: string;
  contact: string;
  phone?: string;
  country: string;
  payable: number;
  creditTerms: string;
  lastInvoice: string;
  status: string;
}
