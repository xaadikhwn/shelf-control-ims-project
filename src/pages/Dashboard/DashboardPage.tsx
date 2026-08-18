import { useState, useEffect } from 'react';
import {
  BadgeDollarSign,
  Wallet,
  AlertOctagon,
  Users,
  ShoppingBag,
  User,
  Calendar,
  Layers,
  Activity,
  Clock,
  Database,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import KpiCard from '../../components/ui/KpiCard';
import DataTable, { type Column } from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import RevenueExpenseChart from '../../components/charts/RevenueExpenseChart';
import SalesByCategoryDonut from '../../components/charts/SalesByCategoryDonut';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import type { DashboardSummary, SalesOrder } from '../../types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { addToast } = useUI();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashData, orderData] = await Promise.all([
          api.getDashboardSummary(),
          api.getSalesOrders(),
        ]);
        setSummary(dashData);
        setOrders(orderData.slice(0, 8));
      } catch (err: any) {
        addToast(err.response?.data?.error?.message || 'Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  const columns: Column<SalesOrder>[] = [
    {
      key: 'id',
      header: 'Order ID',
      mono: true,
      render: (row) => (
        <span className="text-accent-blue-light font-mono text-xs flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-accent-blue/70" />
          {row.id}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <span className="font-medium flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-navy-700 border border-navy-500/40 flex items-center justify-center text-text-muted">
            <User className="w-3 h-3 text-accent-blue-light" />
          </div>
          {row.customer}
        </span>
      ),
      sortable: true,
      sortValue: (row) => row.customer,
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <span className="text-text-secondary flex items-center gap-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-text-muted" />
          {row.date}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-mono text-xs bg-navy-700/50 px-2 py-0.5 rounded border border-navy-600/40">
          {row.items}
        </span>
      ),
      sortable: true,
      sortValue: (row) => row.items,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (row) => (
        <span className="font-semibold text-text-primary font-mono">{formatCurrency(row.total)}</span>
      ),
      sortable: true,
      sortValue: (row) => row.total,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.orderStatus} />,
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (row) => <StatusBadge status={row.payment} />,
    },
  ];

  if (loading || !summary) {
    return (
      <div>
        <PageHeader
          title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`}
          subtitle="Overview for FY2024"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-navy-800 border border-navy-500/50 rounded-xl p-5 h-32 skeleton"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`}
        subtitle={`Role: ${user?.role || 'Staff'} · System Operational`}
        actions={
          <div className="flex items-center gap-2">
            <div
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              aria-label="API Connected"
              title="API Connected"
            >
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-navy-700/60 text-text-secondary border border-navy-600/40"
              aria-label="SQLite DB Active"
              title="SQLite DB Active"
            >
              <Database className="w-4 h-4 text-accent-blue" />
            </div>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          subtitle="YTD Performance"
          trend={{ text: summary.revenueTrend, type: 'up' }}
          icon={BadgeDollarSign}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10 border border-emerald-500/20"
        />
        <KpiCard
          label="Outstanding Credit"
          value={formatCurrency(summary.outstandingCredit)}
          subtitle={`${summary.creditAccounts} customer accounts`}
          trend={{
            text: `${summary.overdueAccounts} account overdue`,
            type: 'warning',
          }}
          icon={Wallet}
          iconColor="text-accent-blue"
          iconBg="bg-accent-blue/10 border border-accent-blue/20"
        />
        <KpiCard
          label="Stock Alerts"
          value={`${summary.stockAlerts} SKUs`}
          subtitle={`${summary.outOfStock} out of stock`}
          trend={{ text: 'Reorder required', type: 'warning' }}
          icon={AlertOctagon}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border border-amber-500/20"
        />
        <KpiCard
          label="Monthly Payroll"
          value={formatCurrency(summary.monthlyPayroll)}
          subtitle={`${summary.payrollEmployees} active employees`}
          trend={{
            text: `Processed ${summary.payrollProcessed}`,
            type: 'neutral',
          }}
          icon={Users}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10 border border-indigo-500/20"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <RevenueExpenseChart data={summary.revenueByMonth} />
        </div>
        <div>
          <SalesByCategoryDonut data={summary.salesByCategory} />
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-navy-800 border border-navy-500/50 rounded-xl">
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue-light" aria-label="Recent Sales Orders" title="Recent Sales Orders">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Recent Sales</p>
              <h3 className="text-sm font-semibold text-text-primary">Orders</h3>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-text-muted bg-navy-700/50 px-2.5 py-1 rounded-md border border-navy-600/40">
            <Clock className="w-3.5 h-3.5 text-accent-blue" />
            Last 8 orders
          </span>
        </div>
        <div className="p-5 pt-3">
          <DataTable columns={columns} data={orders} loading={loading} />
        </div>
      </div>
    </div>
  );
}
