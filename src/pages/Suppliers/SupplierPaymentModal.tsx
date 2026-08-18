import { useState } from 'react';
import { Banknote } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { api } from '../../services/api';
import { useUI } from '../../context/UIContext';
import { formatCurrency } from '../../utils';
import type { Supplier } from '../../types';

interface Props {
  isOpen: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SupplierPaymentModal({ isOpen, supplier, onClose, onSuccess }: Props) {
  const { addToast } = useUI();
  const [mode, setMode] = useState<'payment' | 'purchase'>('payment');
  const [amount, setAmount] = useState<number>(0);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!supplier) return null;

  const handleClose = () => {
    setAmount(0);
    setReference('');
    setMode('payment');
    onClose();
  };

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      addToast('Enter a valid amount', 'error');
      return;
    }
    const supplierId = supplier.dbId || supplier.id;
    setSubmitting(true);
    try {
      if (mode === 'payment') {
        await api.recordSupplierPayment(supplierId, amount);
        addToast(`Payment of ${formatCurrency(amount)} recorded successfully`, 'success');
      } else {
        await api.recordSupplierPurchase(supplierId, amount, reference || undefined);
        addToast(`Purchase of ${formatCurrency(amount)} recorded successfully`, 'success');
      }
      onSuccess();
      handleClose();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to record entry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={supplier.company}
      subtitle={`Current payable: ${formatCurrency(supplier.payable)}`}
      icon={<Banknote className="w-5 h-5 text-emerald-400" />}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex gap-2 p-1 bg-navy-900/50 rounded-lg">
          <button
            onClick={() => setMode('payment')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'payment' ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Record Payment
          </button>
          <button
            onClick={() => setMode('purchase')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'purchase' ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Record Purchase / Invoice
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Amount (£)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg bg-navy-700/50 border border-navy-500/50 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
            placeholder="0.00"
          />
        </div>

        {mode === 'purchase' && (
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Invoice reference (optional)</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-navy-700/50 border border-navy-500/50 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="INV-2026-001"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving…' : mode === 'payment' ? 'Record Payment' : 'Record Purchase'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
