import { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  AlertTriangle,
  TrendingDown,
  Plus,
  FileSpreadsheet,
  FileText,
  Edit2,
  Trash2,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import KpiCard from '../../components/ui/KpiCard';
import DataTable, { type Column } from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';
import CustomerDetailModal from './CustomerDetailModal';
import AddCustomerModal from './AddCustomerModal';
import EditCustomerModal from './EditCustomerModal';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import type { Customer } from '../../types';

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { addToast } = useUI();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
      if (selectedCustomer) {
        const updatedSelected = data.find((c) => String(c.id) === String(selectedCustomer.id));
        if (updatedSelected) setSelectedCustomer(updatedSelected);
      }
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to fetch customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDeleteCustomer = async (cust: Customer) => {
    if (!window.confirm(`Are you sure you want to delete customer "${cust.company}"?`)) return;
    try {
      const custId = cust.dbId || cust.id;
      await api.deleteCustomer(custId);
      addToast('Customer account deleted successfully', 'success');
      fetchCustomers();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to delete customer', 'error');
    }
  };

  const handleExportExcel = () => {
    const headers = ['Account Code', 'Company', 'Contact', 'Phone', 'Credit Limit (£)', 'Outstanding (£)', 'Last Order', 'Status'];
    const rows = customers.map((c) => [c.id, c.company, c.contact, c.phone, c.creditLimit, c.outstanding, c.lastOrder, c.status]);
    exportToExcel('customer_credit_ledger_2026', headers, rows);
    addToast('Customer ledger exported to Excel (CSV)', 'success');
  };

  const handleExportPDF = () => {
    const headers = ['Account Code', 'Company', 'Contact', 'Phone', 'Credit Limit (£)', 'Outstanding (£)', 'Last Order', 'Status'];
    const rows = customers.map((c) => [c.id, c.company, c.contact, c.phone, `£${c.creditLimit}`, `£${c.outstanding}`, c.lastOrder, c.status]);
    exportToPDF('Customer Credit Ledger Report', headers, rows);
    addToast('Customer ledger PDF generated', 'success');
  };

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0);
  const overdueAccounts = customers.filter((c) => c.status === 'overdue').length;
  const atRisk = customers.filter((c) => c.status === 'warning').length;

  const columns: Column<Customer>[] = [
    {
      key: 'id',
      header: 'Acct ID',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCustomer(row);
          }}
          className="text-accent-blue-light font-mono text-xs hover:underline"
        >
          {row.id}
        </button>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (row) => <span className="font-medium">{row.company}</span>,
      sortable: true,
      sortValue: (row) => row.company,
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (row) => <span className="text-text-secondary">{row.contact}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row) => (
        <span className="text-text-secondary font-mono text-xs">{row.phone}</span>
      ),
    },
    {
      key: 'creditLimit',
      header: 'Credit Limit',
      align: 'right',
      render: (row) => (
        <span className="text-text-secondary">{formatCurrency(row.creditLimit)}</span>
      ),
      sortable: true,
      sortValue: (row) => row.creditLimit,
    },
    {
      key: 'outstanding',
      header: 'Outstanding',
      align: 'right',
      render: (row) =>
        row.outstanding > 0 ? (
          <span className="font-medium">{formatCurrency(row.outstanding)}</span>
        ) : (
          <span className="text-text-muted">–</span>
        ),
      sortable: true,
      sortValue: (row) => row.outstanding,
    },
    {
      key: 'utilisation',
      header: 'Utilisation',
      render: (row) => {
        const pct =
          row.creditLimit > 0
            ? (row.outstanding / row.creditLimit) * 100
            : 0;
        return (
          <div className="min-w-[100px]">
            <ProgressBar percentage={pct} showLabel />
          </div>
        );
      },
    },
    {
      key: 'lastOrder',
      header: 'Last Order',
      render: (row) => (
        <span className="text-text-secondary">{row.lastOrder}</span>
      ),
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
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setEditingCustomer(row)}
            className="p-1.5 rounded-lg bg-navy-700/60 hover:bg-navy-600 text-accent-blue-light hover:text-white transition-colors"
            title="Edit Customer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {user?.role === 'Administrator' && (
            <button
              onClick={() => handleDeleteCustomer(row)}
              className="p-1.5 rounded-lg bg-navy-700/60 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
              title="Delete Customer"
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
        title="Customer Accounts"
        subtitle="Credit ledger & account management"
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
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Customer
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Customers"
          value={customers.length.toString()}
          subtitle="registered accounts"
          icon={Users}
          iconColor="text-accent-blue"
          iconBg="bg-accent-blue/10"
        />
        <KpiCard
          label="Total Outstanding"
          value={formatCurrency(totalOutstanding)}
          subtitle="credit balances"
          trend={{ text: 'Across all accounts', type: 'neutral' }}
          icon={CreditCard}
          iconColor="text-accent-blue"
          iconBg="bg-accent-blue/10"
        />
        <KpiCard
          label="Overdue Accounts"
          value={overdueAccounts.toString()}
          subtitle="past due date"
          trend={
            overdueAccounts > 0
              ? { text: 'Immediate follow-up', type: 'warning' }
              : undefined
          }
          icon={AlertTriangle}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
        <KpiCard
          label="At-Risk"
          value={atRisk.toString()}
          subtitle="near credit limit"
          trend={
            atRisk > 0
              ? { text: 'Monitor closely', type: 'warning' }
              : undefined
          }
          icon={TrendingDown}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
        />
      </div>

      {/* Customer Credit Ledger Table */}
      <div className="bg-navy-800 border border-navy-500/50 rounded-xl">
        <div className="flex items-center justify-between p-5 pb-0">
          <h3 className="text-sm font-semibold text-text-primary">
            Customer Credit Ledger
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
          <DataTable
            columns={columns}
            data={customers}
            loading={loading}
            onRowClick={(row) => setSelectedCustomer(row)}
          />
        </div>
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onPaymentSuccess={fetchCustomers}
      />

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchCustomers}
      />

      <EditCustomerModal
        isOpen={!!editingCustomer}
        customer={editingCustomer}
        onClose={() => setEditingCustomer(null)}
        onSuccess={fetchCustomers}
      />
    </div>
  );
}
