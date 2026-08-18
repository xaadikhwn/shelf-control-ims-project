import { useState, useEffect } from 'react';
import {
  Wallet,
  Banknote,
  Users,
  Clock,
  Play,
  FileSpreadsheet,
  FileText,
  Plus,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import KpiCard from '../../components/ui/KpiCard';
import DataTable, { type Column } from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import AddEmployeeModal from './AddEmployeeModal';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import type { Employee } from '../../types';

export default function PayrollPage() {
  const { user } = useAuth();
  const { addToast } = useUI();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [runningPayroll, setRunningPayroll] = useState(false);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const data = await api.getPayroll();
      setEmployees(data);
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to fetch payroll data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const canManagePayroll = user?.role === 'Administrator' || user?.role === 'Manager';

  const handleRunPayroll = async () => {
    setRunningPayroll(true);
    try {
      await api.runPayroll();
      addToast('Payroll run completed successfully!', 'success');
      await fetchPayroll();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to run payroll', 'error');
    } finally {
      setRunningPayroll(false);
    }
  };

  const handleExportExcel = () => {
    const headers = ['Emp ID', 'Name', 'Department', 'Role', 'Gross (£)', 'Deductions (£)', 'Net Pay (£)', 'Pay Date', 'Status'];
    const rows = employees.map((e) => [e.id, e.name, e.department, e.role, e.gross, e.deductions, e.netPay, e.payDate, e.status]);
    exportToExcel('payroll_report_2026', headers, rows);
    addToast('Payroll exported to Excel (CSV)', 'success');
  };

  const handleExportPDF = () => {
    const headers = ['Emp ID', 'Name', 'Department', 'Role', 'Gross (£)', 'Deductions (£)', 'Net Pay (£)', 'Pay Date', 'Status'];
    const rows = employees.map((e) => [e.id, e.name, e.department, e.role, `£${e.gross}`, `£${e.deductions}`, `£${e.netPay}`, e.payDate, e.status]);
    exportToPDF('Payroll Summary Report', headers, rows);
    addToast('Payroll PDF generated', 'success');
  };

  const grossPayroll = employees.reduce((sum, e) => sum + e.gross, 0);
  const totalDeductions = employees.reduce((sum, e) => sum + e.deductions, 0);
  const netPayroll = employees.reduce((sum, e) => sum + e.netPay, 0);
  const pendingCount = employees.filter((e) => e.status === 'pending').length;

  const columns: Column<Employee>[] = [
    {
      key: 'id',
      header: 'Emp ID',
      render: (row) => (
        <span className="text-accent-blue-light font-mono text-xs">{row.id}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => <span className="font-medium">{row.name}</span>,
      sortable: true,
      sortValue: (row) => row.name,
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => <span className="text-text-secondary">{row.department}</span>,
      sortable: true,
      sortValue: (row) => row.department,
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <span className="text-text-secondary">{row.role}</span>,
    },
    {
      key: 'gross',
      header: 'Gross',
      align: 'right',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.gross)}</span>
      ),
      sortable: true,
      sortValue: (row) => row.gross,
    },
    {
      key: 'deductions',
      header: 'Deductions',
      align: 'right',
      render: (row) => (
        <span className="text-red-400">{formatCurrency(row.deductions)}</span>
      ),
    },
    {
      key: 'netPay',
      header: 'Net Pay',
      align: 'right',
      render: (row) => (
        <span className="text-emerald-400 font-medium">
          {formatCurrency(row.netPay)}
        </span>
      ),
    },
    {
      key: 'payDate',
      header: 'Pay Date',
      render: (row) => <span className="text-text-secondary">{row.payDate}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const footerRow = (
    <tr className="border-t-2 border-navy-400 bg-navy-700/30">
      <td className="px-4 py-3 text-sm font-bold text-text-primary" colSpan={4}>
        Totals
      </td>
      <td className="px-4 py-3 text-sm font-bold text-text-primary text-right">
        {formatCurrency(grossPayroll)}
      </td>
      <td className="px-4 py-3 text-sm font-bold text-red-400 text-right">
        {formatCurrency(totalDeductions)}
      </td>
      <td className="px-4 py-3 text-sm font-bold text-emerald-400 text-right">
        {formatCurrency(netPayroll)}
      </td>
      <td className="px-4 py-3" colSpan={2} />
    </tr>
  );

  return (
    <div>
      <PageHeader
        title="Payroll"
        subtitle="Employee compensation & pay records"
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
            {canManagePayroll && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Add Employee
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Play className="w-4 h-4" />}
                  onClick={handleRunPayroll}
                  disabled={runningPayroll}
                >
                  {runningPayroll ? 'Processing...' : 'Run Payroll'}
                  {pendingCount > 0 && !runningPayroll && (
                    <span className="ml-1 bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </Button>
              </>
            )}
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Gross Payroll"
          value={formatCurrency(grossPayroll)}
          subtitle="Current Cycle"
          icon={Wallet}
          iconColor="text-accent-blue"
          iconBg="bg-accent-blue/10"
        />
        <KpiCard
          label="Net Payroll"
          value={formatCurrency(netPayroll)}
          subtitle="after deductions"
          icon={Banknote}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <KpiCard
          label="Employees"
          value={employees.length.toString()}
          subtitle="on payroll"
          icon={Users}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
        />
        <KpiCard
          label="Pending"
          value={pendingCount.toString()}
          subtitle="awaiting processing"
          trend={
            pendingCount > 0
              ? { text: 'Action required', type: 'info' }
              : undefined
          }
          icon={Clock}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Employee Pay Records Table */}
      <div className="bg-navy-800 border border-navy-500/50 rounded-xl">
        <div className="flex items-center justify-between p-5 pb-0">
          <h3 className="text-sm font-semibold text-text-primary">
            Employee Pay Records
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
            data={employees}
            loading={loading}
            footerRow={footerRow}
          />
        </div>
      </div>

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPayroll}
      />
    </div>
  );
}
