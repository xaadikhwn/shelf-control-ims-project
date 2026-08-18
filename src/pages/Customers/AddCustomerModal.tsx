import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { api } from '../../services/api';
import { useUI } from '../../context/UIContext';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCustomerModal({ isOpen, onClose, onSuccess }: AddCustomerModalProps) {
  const { addToast } = useUI();
  const [accountCode, setAccountCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(5000);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      addToast('Company Name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.createCustomer({
        account_code: accountCode || `CUST-${Date.now()}`,
        company_name: companyName,
        contact_person: contactPerson,
        phone,
        email,
        credit_limit: creditLimit,
        status: 'active',
      });
      addToast('Customer account added successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to add customer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
      <div className="bg-navy-800 border border-navy-500/50 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-navy-500/50">
          <h3 className="text-base font-semibold text-text-primary">Add Customer Account</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Account Code / ID</label>
            <input
              type="text"
              placeholder="e.g. CUST-009"
              value={accountCode}
              onChange={(e) => setAccountCode(e.target.value)}
              className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Company Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Global Tech Solutions"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Phone</label>
              <input
                type="text"
                placeholder="e.g. +44 20 7123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Email</label>
              <input
                type="email"
                placeholder="accounts@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Credit Limit (£)</label>
              <input
                type="number"
                step="100"
                min="0"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-500/50">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
