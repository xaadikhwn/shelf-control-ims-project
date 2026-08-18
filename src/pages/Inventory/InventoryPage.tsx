import { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  Plus,
  Download,
  Edit2,
  Trash2,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import KpiCard from '../../components/ui/KpiCard';
import DataTable, { type Column } from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import { api } from '../../services/api';
import { formatCurrency, getStockQtyColor } from '../../utils';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import type { Product } from '../../types';

export default function InventoryPage() {
  const { user } = useAuth();
  const { addToast } = useUI();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to fetch inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const canManageStock = user?.role === 'Administrator' || user?.role === 'Manager' || user?.role === 'Warehouse Operative';

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      const prodId = product.dbId || product.id;
      if (prodId === undefined) return;
      await api.deleteProduct(prodId);
      addToast('Product deleted successfully', 'success');
      fetchProducts();
    } catch (err: any) {
      addToast(err.response?.data?.error?.message || 'Failed to delete product', 'error');
    }
  };

  const lowStock = products.filter((p) => p.status === 'low-stock').length;
  const outOfStock = products.filter((p) => p.status === 'out-of-stock').length;
  const stockValue = products.reduce((sum, p) => sum + p.cost * p.qty, 0);

  const columns: Column<Product>[] = [
    {
      key: 'sku',
      header: 'SKU',
      render: (row) => (
        <span className="text-accent-blue-light font-mono text-xs">{row.sku}</span>
      ),
    },
    {
      key: 'name',
      header: 'Product',
      render: (row) => <span className="font-medium">{row.name}</span>,
      sortable: true,
      sortValue: (row) => row.name,
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <span className="text-text-secondary">{row.category}</span>,
      sortable: true,
      sortValue: (row) => row.category,
    },
    {
      key: 'qty',
      header: 'Qty',
      align: 'center',
      render: (row) => (
        <span
          className={`font-semibold ${getStockQtyColor(row.qty, row.reorderPoint)}`}
        >
          {row.qty}
        </span>
      ),
      sortable: true,
      sortValue: (row) => row.qty,
    },
    {
      key: 'reorderPoint',
      header: 'Reorder Pt',
      align: 'center',
      render: (row) => (
        <span className="text-text-secondary">{row.reorderPoint}</span>
      ),
    },
    {
      key: 'cost',
      header: 'Cost',
      align: 'right',
      render: (row) => (
        <span className="text-text-secondary">{formatCurrency(row.cost)}</span>
      ),
      sortable: true,
      sortValue: (row) => row.cost,
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.price)}</span>
      ),
      sortable: true,
      sortValue: (row) => row.price,
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
            onClick={() => setEditingProduct(row)}
            className="p-1.5 rounded-lg bg-navy-700/60 hover:bg-navy-600 text-accent-blue-light hover:text-white transition-colors"
            title="Edit Product"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {user?.role === 'Administrator' && (
            <button
              onClick={() => handleDeleteProduct(row)}
              className="p-1.5 rounded-lg bg-navy-700/60 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
              title="Delete Product"
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
        title="Inventory"
        subtitle="Stock levels and product catalogue"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => addToast('Inventory data exported', 'success')}
            >
              Export
            </Button>
            {canManageStock && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Product
              </Button>
            )}
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total SKUs"
          value={products.length.toString()}
          subtitle="across all categories"
          icon={Package}
          iconColor="text-accent-blue"
          iconBg="bg-accent-blue/10"
        />
        <KpiCard
          label="Low Stock"
          value={lowStock.toString()}
          subtitle="below reorder point"
          trend={
            lowStock > 0
              ? { text: 'Reorder now', type: 'warning' }
              : undefined
          }
          icon={AlertTriangle}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
        <KpiCard
          label="Out of Stock"
          value={outOfStock.toString()}
          subtitle="immediate action needed"
          trend={
            outOfStock > 0
              ? { text: `${outOfStock} SKUs`, type: 'warning' }
              : undefined
          }
          icon={XCircle}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <KpiCard
          label="Stock Value"
          value={formatCurrency(stockValue)}
          subtitle="at cost price"
          trend={{ text: 'Total inventory', type: 'neutral' }}
          icon={DollarSign}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
        />
      </div>

      {/* Product Stock Levels Table */}
      <div className="bg-navy-800 border border-navy-500/50 rounded-xl">
        <div className="flex items-center justify-between p-5 pb-0">
          <h3 className="text-sm font-semibold text-text-primary">
            Product Stock Levels
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">
              {products.length} products
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => addToast('Stock report exported', 'success')}
            >
              Export
            </Button>
          </div>
        </div>
        <div className="p-5 pt-3">
          <DataTable columns={columns} data={products} loading={loading} />
        </div>
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchProducts}
      />

      <EditProductModal
        isOpen={!!editingProduct}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
