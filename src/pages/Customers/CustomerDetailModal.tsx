import { useState } from 'react';
import { Building2, DollarSign } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import DataTable, { type Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils';
import { api } from '../../services/api';
import { useUI } from '../../context/UIContext';
import type { Customer, CustomerOrder } from '../../types';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export default function CustomerDetailModal({
  customer,
  isOpen,
  onClose,
  onPaymentSuccess,
}: CustomerDetailModalProps) {
  const { addToast } = useUI();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  if (!customer) return null;

  const utilisation =
    customer.creditLimit > 0
      ? (customer.outstanding / customer.creditLimit) * 100
      : 0;
  const availableCredit = customer.creditLimit - customer.outstanding;
  const orderTotal = customer.orders.reduce((sum, o) => sum + o.total, 0);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) {
      addToast('Please enter a valid payment amount', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.recordCustomerPayment(customer.id, paymentAmount);
      addToast(`Payment of $${paymentAmount} recorded successfully!`, 'success');
      setShowPaymentForm(false);
      setPaymentAmount(0);
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to record payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const orderColumns: Column<CustomerOrder>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (row) => (
        <span className="text-accent-blue-light font-mono text-xs">{row.id}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="text-text-secondary">{row.date}</span>,
    },
    {
      key: 'items',
      header: 'Items',
      align: 'center',
      render: (row) => row.items,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.total)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (row) => <StatusBadge status={row.payment} />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer.company}
      subtitle={`${customer.id} · Customer Account`}
      icon={<Building2 className="w-5 h-5 text-accent-blue" />}
    >
      {/* Contact Information */}
      <div className="mb-6">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted mb-3">
          Contact Information
        </h4>
        <div className="grid grid-cols-2 gap-4 bg-navy-700/30 rounded-lg p-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
              Contact Person
            </p>
            <p className="text-sm font-medium text-text-primary">
              {customer.contact}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
              Phone
            </p>
            <p className="text-sm font-mono text-text-primary">{customer.phone}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
              Last Order
            </p>
            <p className="text-sm font-medium text-text-primary">
              {customer.lastOrder}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
              Account Status
            </p>
            <StatusBadge status={customer.status} />
          </div>
        </div>
      </div>

      {/* Credit Ledger */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
            Credit Ledger
          </h4>
          {customer.outstanding > 0 && !showPaymentForm && (
            <Button
              variant="secondary"
              size="sm"
              icon={<DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
              onClick={() => {
                setPaymentAmount(customer.outstanding);
                setShowPaymentForm(true);
              }}
            >
              Record Payment
            </Button>
          )}
        </div>

        {showPaymentForm && (
          <form onSubmit={handleRecordPayment} className="bg-navy-900 border border-emerald-500/30 rounded-lg p-4 mb-4 space-y-3">
            <h5 className="text-xs font-semibold text-emerald-400">Record Customer Payment</h5>
            <div>
              <label className="block text-[11px] text-text-secondary mb-1">Payment Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={customer.outstanding}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full bg-navy-800 border border-navy-500/50 rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowPaymentForm(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                {submitting ? 'Recording...' : 'Submit Payment'}
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3 bg-navy-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Credit Limit</span>
            <span className="text-sm font-semibold text-text-primary">
              {formatCurrency(customer.creditLimit)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              Outstanding Balance
            </span>
            <span className="text-sm font-semibold text-amber-400">
              {formatCurrency(customer.outstanding)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Available Credit</span>
            <span className="text-sm font-semibold text-emerald-400">
              {formatCurrency(availableCredit)}
            </span>
          </div>
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">
                Credit Utilisation
              </span>
              <span className="text-xs font-semibold text-text-primary">
                {Math.round(utilisation)}%
              </span>
            </div>
            <ProgressBar percentage={utilisation} />
          </div>
        </div>
      </div>

      {/* Order History */}
      <div>
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted mb-1">
          Order History · {customer.orders.length} order{customer.orders.length !== 1 ? 's' : ''} · {formatCurrency(orderTotal)} total
        </h4>
        <div className="mt-3">
          <DataTable
            columns={orderColumns}
            data={customer.orders}
            emptyMessage="No orders found"
          />
        </div>
      </div>
    </Modal>
  );
}
