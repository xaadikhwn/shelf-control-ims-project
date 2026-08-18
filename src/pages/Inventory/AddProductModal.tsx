import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { api } from '../../services/api';
import { useUI } from '../../context/UIContext';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const { addToast } = useUI();
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryId] = useState(1);
  const [quantity, setQuantity] = useState(10);
  const [reorderPoint, setReorderPoint] = useState(5);
  const [costPrice, setCostPrice] = useState(50);
  const [salePrice, setSalePrice] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name) {
      addToast('SKU and Name are required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.createProduct({
        sku,
        name,
        category_id: categoryId,
        quantity: Number(quantity),
        reorder_point: Number(reorderPoint),
        cost_price: Number(costPrice),
        sale_price: Number(salePrice),
      });
      addToast('Product added successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to add product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
      <div className="bg-navy-800 border border-navy-500/50 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-navy-500/50">
          <h3 className="text-base font-semibold text-text-primary">Add New Product</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">SKU</label>
            <input
              type="text"
              required
              placeholder="e.g. ELEC-005"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Wireless Mouse"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Quantity</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Reorder Point</label>
              <input
                type="number"
                min="0"
                value={reorderPoint}
                onChange={(e) => setReorderPoint(Number(e.target.value))}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Sale Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-500/50">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
