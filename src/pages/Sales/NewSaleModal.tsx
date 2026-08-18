import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { api } from '../../services/api';
import { useUI } from '../../context/UIContext';
import type { Customer, Product } from '../../types';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewSaleModal({ isOpen, onClose, onSuccess }: NewSaleModalProps) {
  const { addToast } = useUI();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState<string | number>('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'credit' | 'pending'>('paid');
  const [items, setItems] = useState<Array<{ product_id: number; quantity: number }>>([
    { product_id: 0, quantity: 1 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([api.getCustomers(), api.getProducts()])
        .then(([custData, prodData]) => {
          setCustomers(custData);
          setProducts(prodData);
          if (custData.length > 0) {
            const firstCustVal = custData[0].dbId || custData[0].id;
            setCustomerId(firstCustVal);
          }
          if (prodData.length > 0 && items[0].product_id === 0) {
            const firstProdId = prodData[0].dbId || Number(prodData[0].id) || 1;
            setItems([{ product_id: firstProdId, quantity: 1 }]);
          }
        })
        .catch(() => {
          addToast('Failed to load customers/products', 'error');
        });
    }
  }, [isOpen, addToast]);

  if (!isOpen) return null;

  const addItem = () => {
    const defaultProdId = products[0]?.dbId || Number(products[0]?.id) || 1;
    setItems([...items, { product_id: defaultProdId, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'product_id' | 'quantity', val: number) => {
    const updated = [...items];
    updated[index][field] = val;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      addToast('Please select a customer', 'warning');
      return;
    }
    if (items.some((i) => !i.product_id || i.quantity <= 0)) {
      addToast('Please select valid products and quantities', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.createSale({
        customer_id: customerId,
        payment_status: paymentStatus,
        items,
      });
      addToast('Sales order created successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to create sales order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
      <div className="bg-navy-800 border border-navy-500/50 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-navy-500/50">
          <h3 className="text-base font-semibold text-text-primary">New Sales Order</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            >
              {customers.map((c) => {
                const cVal = c.dbId || c.id;
                return (
                  <option key={c.id} value={cVal}>
                    {c.company} (Contact: {c.contact})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Payment Method
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            >
              <option value="paid">Paid (Cash / Bank Card)</option>
              <option value="credit">Credit (Customer Ledger)</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-text-secondary">Line Items</label>
              <Button type="button" variant="ghost" size="sm" icon={<Plus className="w-3 h-3" />} onClick={addItem}>
                Add Item
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={item.product_id}
                    onChange={(e) => handleItemChange(idx, 'product_id', Number(e.target.value))}
                    className="flex-1 bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-blue"
                  >
                    {products.map((p) => {
                      const pId = p.dbId || Number(p.id) || 1;
                      return (
                        <option key={pId} value={pId}>
                          {p.name} — ${p.price} (Stock: {p.qty})
                        </option>
                      );
                    })}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                    className="w-20 bg-navy-900 border border-navy-500/50 rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-blue"
                  />

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-500/50">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? 'Creating Order...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
