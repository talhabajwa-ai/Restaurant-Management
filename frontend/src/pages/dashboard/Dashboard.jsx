import { useEffect, useState } from 'react';
import { reportAPI } from '../../services/api';
import { 
  FaShoppingCart, 
  FaDollarSign, 
  FaChair, 
  FaUsers,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
        <Icon size={24} className="text-primary-500" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await reportAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const salesChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales',
        data: [1200, 1900, 1500, 2200, 1800, 2800, 2400],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const orderStatusData = {
    labels: ['Pending', 'Preparing', 'Ready', 'Served', 'Completed'],
    datasets: [
      {
        data: [5, 8, 3, 12, 45],
        backgroundColor: [
          '#f59e0b',
          '#3b82f6',
          '#8b5cf6',
          '#06b6d4',
          '#10b981',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          padding: 20,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Orders"
          value={stats?.todayStats.orders || 0}
          icon={FaShoppingCart}
          trend="up"
          trendValue="12%"
        />
        <StatCard
          title="Today's Revenue"
          value={`$${(stats?.todayStats.revenue || 0).toFixed(2)}`}
          icon={FaDollarSign}
          trend="up"
          trendValue="8%"
        />
        <StatCard
          title="Active Tables"
          value={`${stats?.tables.active || 0}/${stats?.tables.total || 0}`}
          icon={FaChair}
        />
        <StatCard
          title="Total Staff"
          value={stats?.staff || 0}
          icon={FaUsers}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Sales</h3>
          <div className="h-64">
            <Line data={salesChartData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Order Status</h3>
          <div className="h-64">
            <Doughnut data={orderStatusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">Order #{1000 + i}</p>
                  <p className="text-sm text-gray-400">Table {i + 1}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">${(Math.random() * 100 + 50).toFixed(2)}</p>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Popular Items</h3>
          <div className="space-y-3">
            {['Margherita Pizza', 'Chicken Burger', 'Caesar Salad', 'Pasta Alfredo', 'Grilled Salmon'].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{item}</p>
                    <p className="text-sm text-gray-400">{120 - i * 15} orders</p>
                  </div>
                </div>
                <div className="w-24 h-2 bg-dark-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${100 - i * 15}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;