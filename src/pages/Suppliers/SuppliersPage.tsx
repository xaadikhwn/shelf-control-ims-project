import { useState, useEffect } from 'react';
import {
  Truck,
  Banknote,
  AlertTriangle,
  Globe,
  Plus,
  FileSpreadsheet,
  FileText,
  Edit2,
  Trash2,
  Wallet,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import KpiCard from '../../components/ui/KpiCard';
import DataTable, { type Column } from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import AddSupplierModal from './AddSupplierModal';
import EditSupplierModal from './EditSupplierModal';
import SupplierPaymentModal from './SupplierPaymentModal';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import type { Supplier } from '../../types';

export default function SuppliersPage() {
  const { user } = useAuth();
  const { addToast } = useUI();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await api.getSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to fetch suppliers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const canManageSuppliers = user?.role === 'Administrator' || user?.role === 'Manager';

  const handleDeleteSupplier = async (supp: Supplier) => {
    if (!window.confirm(`Are you sure you want to delete vendor "${supp.company}"?`)) return;
    try {
      const suppId = supp.dbId || supp.id;
      await api.deleteSupplier(suppId);
      addToast('Supplier deleted successfully', 'success');
      fetchSuppliers();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to delete supplier', 'error');
    }
  };

  const handleExportExcel = () => {
    const headers = ['Vendor ID', 'Company', 'Contact', 'Phone', 'Country', 'Payable (£)', 'Credit Terms', 'Status'];
    const rows = suppliers.map((s) => [s.id, s.company, s.contact, s.phone || 'N/A', s.country, s.payable, s.creditTerms, s.status]);
    exportToExcel('supplier_ledger_2026', headers, rows);
    addToast('Supplier ledger exported to Excel (CSV)', 'success');
  };

  const handleExportPDF = () => {
    const headers = ['Vendor ID', 'Company', 'Contact', 'Phone', 'Country', 'Payable (£)', 'Credit Terms', 'Status'];
    const rows = suppliers.map((s) => [s.id, s.company, s.contact, s.phone || 'N/A', s.country, `£${s.payable}`, s.creditTerms, s.status]);
    exportToPDF('Supplier Purchase Ledger Report', headers, rows);
    addToast('Supplier ledger PDF generated', 'success');
  };

  const totalPayable = suppliers.reduce((sum, s) => sum + s.payable, 0);
  const overduePayables = suppliers.filter((s) => s.status === 'overdue').length;
  const countries = new Set(suppliers.map((s) => s.country)).size;

  const columns: Column<Supplier>[] = [
    {
      key: 'id',
      header: 'Vendor ID',
      render: (row) => (
        <span className="text-accent-blue-light font-mono text-xs">{row.id}</span>
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
      key: 'country',
      header: 'Country',
      render: (row) => <span className="text-text-secondary">{row.country}</span>,
      sortable: true,
      sortValue: (row) => row.country,
    },
    {
      key: 'payable',
      header: 'Payable',
      align: 'right',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.payable)}</span>
      ),
      sortable: true,
      sortValue: (row) => row.payable,
    },
    {
      key: 'creditTerms',
      header: 'Credit Terms',
      render: (row) => (
        <span className="text-text-secondary">{row.creditTerms}</span>
      ),
    },
    {
      key: 'lastInvoice',
      header: 'Last Invoice',
      render: (row) => (
        <span className="text-text-secondary">{row.lastInvoice}</span>
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
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setPayingSupplier(row)}
            className="p-1.5 rounded-lg bg-navy-700/60 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors"
            title="Record Payment / Purchase"
          >
            <Wallet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setEditingSupplier(row)}
            className="p-1.5 rounded-lg bg-navy-700/60 hover:bg-navy-600 text-accent-blue-light hover:text-white transition-colors"
            title="Edit Supplier"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {user?.role === 'Administrator' && (
            <button
              onClick={() => handleDeleteSupplier(row)}
              className="p-1.5 rounded-lg bg-navy-700/60 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
              title="Delete Supplier"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const footerRow = (
    <tr className="border-t-2 border-navy-400 bg-navy-700/30">
      <td className="px-4 py-3 text-sm font-bold text-text-primary" colSpan={4}>
        Total Payable
      </td>
      <td className="px-4 py-3 text-sm font-bold text-text-primary text-right">
        {formatCurrency(totalPayable)}
      </td>
      <td className="px-4 py-3" colSpan={4} />
    </tr>
  );

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle="Vendor management & purchase ledger"
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
            {canManageSuppliers && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Supplier
              </Button>
            )}
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Suppliers"
          value={suppliers.length.toString()}
          subtitle="active vendors"
          icon={Truck}
          iconColor="text-accent-blue"
          iconBg="bg-accent-blue/10"
        />
        <KpiCard
          label="Total Payable"
          value={formatCurrency(totalPayable)}
          subtitle="across all vendors"
          icon={Banknote}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <KpiCard
          label="Overdue Payables"
          value={overduePayables.toString()}
          subtitle="past credit terms"
          trend={
            overduePayables > 0
              ? { text: 'Payment required', type: 'warning' }
              : undefined
          }
          icon={AlertTriangle}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
        <KpiCard
          label="Countries"
          value={countries.toString()}
          subtitle="supplier regions"
          icon={Globe}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
        />
      </div>

      {/* Supplier Purchase Ledger Table */}
      <div className="bg-navy-800 border border-navy-500/50 rounded-xl">
        <div className="flex items-center justify-between p-5 pb-0">
          <h3 className="text-sm font-semibold text-text-primary">
            Supplier Purchase Ledger
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
            data={suppliers}
            loading={loading}
            footerRow={footerRow}
          />
        </div>
      </div>

      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchSuppliers}
      />

      <EditSupplierModal
        isOpen={!!editingSupplier}
        supplier={editingSupplier}
        onClose={() => setEditingSupplier(null)}
        onSuccess={fetchSuppliers}
      />

      <SupplierPaymentModal
        isOpen={!!payingSupplier}
        supplier={payingSupplier}
        onClose={() => setPayingSupplier(null)}
        onSuccess={fetchSuppliers}
      />
    </div>
  );
}
