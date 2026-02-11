import { useEffect, useState } from 'react';
import { reportAPI } from '../../services/api';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { FaDownload, FaCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [salesRes, itemsRes, categoryRes] = await Promise.all([
        reportAPI.getSalesReport(),
        reportAPI.getTopSellingItems({ limit: 5 }),
        reportAPI.getRevenueByCategory(),
      ]);
      
      setSalesData(salesRes.data.data);
      setTopItems(itemsRes.data.data);
      setRevenueByCategory(categoryRes.data.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    try {
      const response = await reportAPI.getSalesReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setSalesData(response.data.data);
      toast.success('Report updated');
    } catch (error) {
      toast.error('Failed to filter reports');
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Total Sales', 'Order Count', 'Average Order'],
      ...salesData.map(item => [
        `${item._id.year}-${item._id.month}-${item._id.day || '01'}`,
        item.totalSales.toFixed(2),
        item.orderCount,
        item.averageOrderValue.toFixed(2),
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const salesChartData = {
    labels: salesData.map(item => 
      `${item._id.month}/${item._id.day || '01'}`
    ).reverse(),
    datasets: [
      {
        label: 'Sales',
        data: salesData.map(item => item.totalSales).reverse(),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: '#3b82f6',
        borderWidth: 2,
      },
    ],
  };

  const topItemsChartData = {
    labels: topItems.map(item => item.name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: topItems.map(item => item.totalQuantity),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const categoryChartData = {
    labels: revenueByCategory.map(item => item._id),
    datasets: [
      {
        data: revenueByCategory.map(item => item.revenue),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(6, 182, 212, 0.8)',
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
        labels: {
          color: '#94a3b8',
        },
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-gray-400 mt-1">View detailed business reports</p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn-primary flex items-center gap-2"
        >
          <FaDownload />
          Export CSV
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <FaCalendarAlt className="inline mr-2" />
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <FaCalendarAlt className="inline mr-2" />
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="input-field"
            />
          </div>
          <button
            onClick={handleDateFilter}
            className="btn-secondary px-6"
          >
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Sales Trend</h3>
          <div className="h-64">
            <Bar data={salesChartData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Top Selling Items</h3>
          <div className="h-64">
            <Bar data={topItemsChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Category</h3>
          <div className="h-64">
            <Doughnut data={categoryChartData} options={doughnutOptions} />
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Top Items Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-dark-600">
                  <th className="pb-3">Item Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-center">Quantity Sold</th>
                  <th className="pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-dark-700">
                    <td className="py-3 text-white">{item.name}</td>
                    <td className="py-3 text-gray-400">{item.category}</td>
                    <td className="py-3 text-center text-white">{item.totalQuantity}</td>
                    <td className="py-3 text-right text-primary-500">
                      ${item.totalRevenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sales Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-dark-700 rounded-lg">
            <p className="text-gray-400 text-sm">Total Sales</p>
            <p className="text-2xl font-bold text-white">
              ${salesData.reduce((sum, item) => sum + item.totalSales, 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-dark-700 rounded-lg">
            <p className="text-gray-400 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-white">
              {salesData.reduce((sum, item) => sum + item.orderCount, 0)}
            </p>
          </div>
          <div className="p-4 bg-dark-700 rounded-lg">
            <p className="text-gray-400 text-sm">Average Order Value</p>
            <p className="text-2xl font-bold text-white">
              ${salesData.length > 0
                ? (salesData.reduce((sum, item) => sum + item.averageOrderValue, 0) / salesData.length).toFixed(2)
                : '0.00'}
            </p>
          </div>
          <div className="p-4 bg-dark-700 rounded-lg">
            <p className="text-gray-400 text-sm">Report Period</p>
            <p className="text-2xl font-bold text-white">
              {salesData.length} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;