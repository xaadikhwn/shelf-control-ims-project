import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart, Tag } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SalesByCategoryDonutProps {
  data: { category: string; percentage: number; color: string }[];
}

export default function SalesByCategoryDonut({ data }: SalesByCategoryDonutProps) {
  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        data: data.map((d) => d.percentage),
        backgroundColor: data.map((d) => d.color),
        borderColor: '#111827',
        borderWidth: 3,
        hoverBorderColor: '#1f2937',
        hoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: false,
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
          label: (ctx: { label?: string; parsed: number }) => {
            return `${ctx.label}: ${ctx.parsed}%`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-navy-800 border border-navy-500/50 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <PieChart className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Sales by Category
          </h3>
          <p className="text-xs text-text-muted">December 2024 · % share</p>
        </div>
      </div>
      <div className="h-[220px] mx-auto max-w-[220px]">
        <Doughnut data={chartData} options={options} />
      </div>
      {/* Custom legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item) => (
          <div key={item.category} className="flex items-center gap-2 p-1.5 rounded-lg bg-navy-700/30 border border-navy-600/30">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <Tag className="w-3 h-3 text-text-muted" />
              {item.category}
            </span>
            <span className="text-xs font-semibold text-text-primary ml-auto font-mono">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
