import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { api } from '../../services/api';
import { useUI } from '../../context/UIContext';

interface LogExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LogExpenseModal({ isOpen, onClose, onSuccess }: LogExpenseModalProps) {
  const { addToast } = useUI();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Office Supplies');
  const [amount, setAmount] = useState(150);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) {
      addToast('Description and valid Amount are required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.createExpense({
        description,
        category,
        amount: Number(amount),
      });
      addToast('Expense logged successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to log expense', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
      <div className="bg-navy-800 border border-navy-500/50 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-navy-500/50">
          <h3 className="text-base font-semibold text-text-primary">Log Expense Claim</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Printer Cartridges"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            >
              <option value="Office Supplies">Office Supplies</option>
              <option value="Travel & Lodging">Travel & Lodging</option>
              <option value="Software & Subscriptions">Software & Subscriptions</option>
              <option value="Utilities">Utilities</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-500/50">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Log Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
