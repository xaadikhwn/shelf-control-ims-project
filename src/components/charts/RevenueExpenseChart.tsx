import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RevenueExpenseChartProps {
  data: { month: string; revenue: number; expenses: number }[];
}

export default function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: 'Revenue',
        data: data.map((d) => d.revenue),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
      {
        label: 'Expenses',
        data: data.map((d) => d.expenses),
        backgroundColor: '#ef4444',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9ca3af',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'rect',
          font: { size: 11, family: 'Inter' },
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => {
            return `${ctx.dataset.label}: £${ctx.parsed.y?.toLocaleString() || 0}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 11, family: 'Inter' } },
        border: { display: false },
      },
      y: {
        grid: { color: '#1f2937' },
        ticks: {
          color: '#6b7280',
          font: { size: 11, family: 'Inter' },
          callback: (value: string | number) => `£${Number(value) / 1000}k`,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="bg-navy-800 border border-navy-500/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue-light">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Revenue vs Expenses
            </h3>
            <p className="text-xs text-text-muted">FY 2024 · Monthly Comparison</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
            <TrendingUp className="w-3 h-3" />
            Revenue
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
            <TrendingDown className="w-3 h-3" />
            Expenses
          </span>
        </div>
      </div>
      <div className="h-[280px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
