import { useState, useEffect } from 'react';
import {
  Receipt,
  CheckCircle,
  Clock,
  Grid3X3,
  Plus,
  FileSpreadsheet,
  FileText,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import KpiCard from '../../components/ui/KpiCard';
import DataTable, { type Column } from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import LogExpenseModal from './LogExpenseModal';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import type { Expense } from '../../types';

export default function ExpensesPage() {
  const { user } = useAuth();
  const { addToast } = useUI();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await api.getExpenses();
      setExpenses(data);
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to fetch expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleExportExcel = () => {
    const headers = ['Ref', 'Description', 'Category', 'Amount (£)', 'Date', 'Submitted By', 'Status'];
    const rows = expenses.map((e) => [e.ref, e.description, e.category, e.amount, e.date, e.submittedBy, e.status]);
    exportToExcel('expenses_report_2026', headers, rows);
    addToast('Expenses exported to Excel (CSV)', 'success');
  };

  const handleExportPDF = () => {
    const headers = ['Ref', 'Description', 'Category', 'Amount (£)', 'Date', 'Submitted By', 'Status'];
    const rows = expenses.map((e) => [e.ref, e.description, e.category, `£${e.amount}`, e.date, e.submittedBy, e.status]);
    exportToPDF('Expenses Report', headers, rows);
    addToast('Expenses PDF generated', 'success');
  };

  const handleUpdateStatus = async (exp: Expense, status: 'approved' | 'rejected') => {
    try {
      const expId = exp.id || Number(exp.ref.replace(/\D/g, ''));
      await api.updateExpenseStatus(expId, status);
      addToast(`Expense status updated to ${status}`, 'success');
      fetchExpenses();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to update expense status', 'error');
    }
  };

  const handleDeleteExpense = async (exp: Expense) => {
    if (!window.confirm(`Are you sure you want to delete expense "${exp.ref}"?`)) return;
    try {
      const expId = exp.id || Number(exp.ref.replace(/\D/g, ''));
      await api.deleteExpense(expId);
      addToast('Expense deleted successfully', 'success');
      fetchExpenses();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to delete expense', 'error');
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedTotal = expenses
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter((e) => e.status === 'pending').length;
  const pendingTotal = expenses
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);
  const categories = new Set(expenses.map((e) => e.category)).size;

  const columns: Column<Expense>[] = [
    {
      key: 'ref',
      header: 'Ref',
      render: (row) => (
        <span className="text-accent-blue-light font-mono text-xs">{row.ref}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => <span className="font-medium">{row.description}</span>,
      sortable: true,
      sortValue: (row) => row.description,
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <span className="text-text-secondary">{row.category}</span>,
      sortable: true,
      sortValue: (row) => row.category,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.amount)}</span>
      ),
      sortable: true,
      sortValue: (row) => row.amount,
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="text-text-secondary">{row.date}</span>,
    },
    {
      key: 'submittedBy',
      header: 'Submitted By',
      render: (row) => <span className="text-text-secondary">{row.submittedBy}</span>,
      sortable: true,
      sortValue: (row) => row.submittedBy,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === 'pending' && (user?.role === 'Administrator' || user?.role === 'Manager') && (
            <>
              <button
                onClick={() => handleUpdateStatus(row, 'approved')}
                className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                title="Approve Expense"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleUpdateStatus(row, 'rejected')}
                className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                title="Reject Expense"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {user?.role === 'Administrator' && (
            <button
              onClick={() => handleDeleteExpense(row)}
              className="p-1.5 rounded-lg bg-navy-700/60 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
              title="Delete Expense"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Business expenditure tracking"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
              onClick={handleExportExcel}
            >
              Export Excel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<FileText className="w-4 h-4 text-rose-400" />}
              onClick={handleExportPDF}
            >
              Export PDF
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Log Expense
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          subtitle="All time"
          icon={Receipt}
          iconColor="text-accent-blue"
          iconBg="bg-accent-blue/10"
        />
        <KpiCard
          label="Approved"
          value={formatCurrency(approvedTotal)}
          subtitle={`${expenses.filter((e) => e.status === 'approved').length} items`}
          trend={{ text: 'Processed', type: 'up' }}
          icon={CheckCircle}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <KpiCard
          label="Pending Approval"
          value={pendingCount.toString()}
          subtitle={formatCurrency(pendingTotal)}
          trend={
            pendingCount > 0
              ? { text: 'Awaiting review', type: 'warning' }
              : undefined
          }
          icon={Clock}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
        <KpiCard
          label="Categories"
          value={categories.toString()}
          subtitle="active cost centres"
          icon={Grid3X3}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
        />
      </div>

      {/* Expense Claims Table */}
      <div className="bg-navy-800 border border-navy-500/50 rounded-xl">
        <div className="flex items-center justify-between p-5 pb-0">
          <h3 className="text-sm font-semibold text-text-primary">
            Expense Claims
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<FileSpreadsheet className="w-3.5 h-3.5" />} onClick={handleExportExcel}>
              Excel
            </Button>
            <Button variant="ghost" size="sm" icon={<FileText className="w-3.5 h-3.5" />} onClick={handleExportPDF}>
              PDF
            </Button>
          </div>
        </div>
        <div className="p-5 pt-3">
          <DataTable columns={columns} data={expenses} loading={loading} />
        </div>
      </div>

      <LogExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchExpenses}
      />
    </div>
  );
}
