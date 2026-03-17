import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useTransactions } from '../context/useTransactions';
import './Charts.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe',
  '#43e97b', '#fa709a', '#fee140', '#a18cd1', '#fbc2eb',
];

export default function Charts() {
  const { transactions } = useTransactions();

  if (transactions.length === 0) return null;

  // Expense by category (doughnut)
  const expenseByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const doughnutData = {
    labels: Object.keys(expenseByCategory),
    datasets: [
      {
        data: Object.values(expenseByCategory),
        backgroundColor: COLORS,
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Monthly income vs expense (bar)
  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.date.slice(0, 7);
    if (!acc[month]) acc[month] = { income: 0, expense: 0 };
    acc[month][t.type] += t.amount;
    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlyData).sort();
  const barData = {
    labels: sortedMonths.map((m) => {
      const [year, month] = m.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Income',
        data: sortedMonths.map((m) => monthlyData[m].income),
        backgroundColor: 'rgba(76, 175, 80, 0.7)',
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: sortedMonths.map((m) => monthlyData[m].expense),
        backgroundColor: 'rgba(244, 67, 54, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#888', font: { size: 12 } },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: false,
      },
    },
    scales: {
      x: { ticks: { color: '#888' }, grid: { display: false } },
      y: { ticks: { color: '#888' }, grid: { color: 'rgba(0,0,0,0.05)' } },
    },
  };

  return (
    <div className="charts-section">
      {Object.keys(expenseByCategory).length > 0 && (
        <div className="chart-card">
          <h3 className="chart-title">Expenses by Category</h3>
          <div className="doughnut-wrapper">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>
      )}
      {sortedMonths.length > 0 && (
        <div className="chart-card">
          <h3 className="chart-title">Monthly Overview</h3>
          <Bar data={barData} options={barOptions} />
        </div>
      )}
    </div>
  );
}
