import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { api } from '../../services/api';
import { useUI } from '../../context/UIContext';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const { addToast } = useUI();
  const [employeeCode, setEmployeeCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('Developer');
  const [baseSalary, setBaseSalary] = useState(5000);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeCode || !fullName) {
      addToast('Employee Code and Full Name are required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.createEmployee({
        id: employeeCode,
        name: fullName,
        department,
        role: designation,
        gross: Number(baseSalary),
        deductions: Number(baseSalary) * 0.1,
        netPay: Number(baseSalary) * 0.9,
      } as any);
      addToast('Employee added successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to add employee', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
      <div className="bg-navy-800 border border-navy-500/50 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-navy-500/50">
          <h3 className="text-base font-semibold text-text-primary">Add Employee</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Employee ID / Code</label>
            <input
              type="text"
              required
              placeholder="e.g. EMP-009"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Role / Title</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Base Salary ($)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={baseSalary}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
              className="w-full bg-navy-900 border border-navy-500/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-500/50">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
