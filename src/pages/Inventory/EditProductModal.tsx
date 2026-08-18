import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { api } from '../../services/api';
import { useUI } from '../../context/UIContext';
import type { Product } from '../../types';

interface EditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProductModal({
  isOpen,
  product,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const { addToast } = useUI();
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [qty, setQty] = useState<number>(0);
  const [reorderPoint, setReorderPoint] = useState<number>(5);
  const [cost, setCost] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSku(product.sku || '');
      setCategory(product.category || 'General');
      setQty(product.qty || 0);
      setReorderPoint(product.reorderPoint || 5);
      setCost(product.cost || 0);
      setPrice(product.price || 0);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Product name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const prodId = product.dbId || product.id;
      if (prodId === undefined) return;
      await api.updateProduct(prodId, {
        name,
        sku,
        category,
        quantity: qty,
        reorder_point: reorderPoint,
        cost_price: cost,
        sale_price: price,
      });
      addToast('Product updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to update product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
      <div className="bg-navy-800 border border-navy-500/50 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-navy-500/50">
          <h3 className="text-base font-semibold text-text-primary">Edit Product</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Product Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">SKU Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Quantity in Stock</label>
              <input
                type="number"
                min="0"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
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
              <label className="block text-xs font-medium text-text-secondary mb-1">Cost Price (£)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Selling Price (£)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-500/50">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
