import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  ClipboardList,
  TrendingUp,
  Clock,
  Plus,
  Download,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import KpiCard from '../../components/ui/KpiCard';
import DataTable, { type Column } from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import NewSaleModal from './NewSaleModal';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import type { SalesOrder } from '../../types';

export default function SalesPage() {
  const { user } = useAuth();
  const { addToast } = useUI();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getSalesOrders();
      setOrders(data);
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to fetch sales orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const canCreateSale = user?.role === 'Administrator' || user?.role === 'Manager' || user?.role === 'Sales Representative';

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length ? totalSales / orders.length : 0;
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === 'processing' || o.orderStatus === 'pending'
  ).length;

  const columns: Column<SalesOrder>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (row) => (
        <span className="text-accent-blue-light font-mono text-xs">{row.id}</span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => <span className="font-medium">{row.customer}</span>,
      sortable: true,
      sortValue: (row) => row.customer,
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="text-text-secondary">{row.date}</span>,
      sortable: true,
      sortValue: (row) => row.date,
    },
    {
      key: 'items',
      header: 'Items',
      align: 'center',
      render: (row) => row.items,
      sortable: true,
      sortValue: (row) => row.items,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.total)}</span>
      ),
      sortable: true,
      sortValue: (row) => row.total,
    },
    {
      key: 'orderStatus',
      header: 'Order Status',
      render: (row) => <StatusBadge status={row.orderStatus} />,
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (row) => <StatusBadge status={row.payment} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sales"
        subtitle="Sales orders & revenue tracking"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => addToast('Sales data exported', 'success')}
            >
              Export
            </Button>
            {canCreateSale && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsModalOpen(true)}
              >
                New Order
              </Button>
            )}
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Sales"
          value={formatCurrency(totalSales)}
          subtitle="Lifetime total"
          icon={ShoppingCart}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <KpiCard
          label="Orders"
          value={orders.length.toString()}
          subtitle="total orders"
          icon={ClipboardList}
          iconColor="text-accent-blue"
          iconBg="bg-accent-blue/10"
        />
        <KpiCard
          label="Avg Order Value"
          value={formatCurrency(avgOrderValue)}
          subtitle="per order"
          icon={TrendingUp}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
        />
        <KpiCard
          label="Pending"
          value={pendingOrders.toString()}
          subtitle="awaiting processing"
          trend={
            pendingOrders > 0
              ? { text: 'Requires attention', type: 'info' }
              : undefined
          }
          icon={Clock}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Sales Orders Table */}
      <div className="bg-navy-800 border border-navy-500/50 rounded-xl">
        <div className="flex items-center justify-between p-5 pb-0">
          <h3 className="text-sm font-semibold text-text-primary">
            Sales Orders
          </h3>
          <span className="text-xs text-text-muted">
            {orders.length} orders
          </span>
        </div>
        <div className="p-5 pt-3">
          <DataTable columns={columns} data={orders} loading={loading} />
        </div>
      </div>

      <NewSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchOrders}
      />
    </div>
  );
}
