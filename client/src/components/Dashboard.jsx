import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  Users, 
  FileText, 
  Hash, 
  TrendingUp, 
  Package, 
  ClipboardList,
  RefreshCw,
  Building2,
  FileCheck,
  BarChart3
} from 'lucide-react';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://103.118.158.188:5000/api/dashboard/data', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Chart Data for Customers
  const customerBarChartData = {
    labels: dashboardData?.customers?.slice(0, 10).map(c => {
      // Shorten long customer names
      let name = c.customer_name;
      if (name.length > 20) {
        name = name.substring(0, 20) + '...';
      }
      return name;
    }) || [],
    datasets: [
      {
        label: 'PO Line Items',
        data: dashboardData?.customers?.slice(0, 10).map(c => c.total_po_line_items) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // Chart Data for Overview
  const doughnutChartData = {
    labels: ['Total Records', 'Unique TC Numbers'],
    datasets: [
      {
        data: [
          dashboardData?.overview?.total_records || 0,
          dashboardData?.overview?.unique_tc_numbers || 0,
        ],
        backgroundColor: ['#6366f1', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  // Chart Data for TC Numbers Distribution
  const lineChartData = {
    labels: dashboardData?.tc_numbers?.slice(0, 20).map(item => item.tc_no) || [],
    datasets: [
      {
        label: 'Occurrence Count',
        data: dashboardData?.tc_numbers?.slice(0, 20).map(item => item.occurrence_count) || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Chart Data for Certificate Analysis
  const certificateBarData = {
    labels: dashboardData?.certificate_analysis?.slice(0, 10).map(c => {
      let name = c.customer_name;
      if (name && name.length > 20) {
        name = name.substring(0, 20) + '...';
      }
      return name || `Certificate ${c.certificate_id}`;
    }) || [],
    datasets: [
      {
        label: 'Line Items per Certificate',
        data: dashboardData?.certificate_analysis?.slice(0, 10).map(c => c.line_items_count) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        },
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1f2937',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value?.toLocaleString()}</h3>
        </div>
        <div className={`h-12 w-12 rounded-2xl bg-${color}-50 flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats Grid - Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Customers"
            value={dashboardData?.overview?.total_customers}
            icon={Users}
            color="indigo"
          />
          <StatCard
            title="Total PO Line Items"
            value={dashboardData?.overview?.total_po_line_items}
            icon={ClipboardList}
            color="blue"
          />
          <StatCard
            title="Total Records"
            value={dashboardData?.overview?.total_records}
            icon={FileText}
            color="green"
          />
          <StatCard
            title="Unique TC Numbers"
            value={dashboardData?.overview?.unique_tc_numbers}
            icon={Hash}
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Customers Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Top Customers</h3>
                <p className="text-sm text-gray-500 mt-1">PO line items by customer</p>
              </div>
              <Building2 className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="h-80">
              <Bar data={customerBarChartData} options={chartOptions} />
            </div>
          </div>

          {/* Records Distribution Doughnut */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Records Overview</h3>
                <p className="text-sm text-gray-500 mt-1">Total vs Unique TC numbers</p>
              </div>
              <Package className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="h-80 flex items-center justify-center">
              <div className="w-64 h-64">
                <Doughnut data={doughnutChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Certificate Analysis Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Certificate Analysis</h3>
                <p className="text-sm text-gray-500 mt-1">Line items per certificate</p>
              </div>
              <FileCheck className="h-5 w-5 text-green-500" />
            </div>
            <div className="h-80">
              <Bar data={certificateBarData} options={chartOptions} />
            </div>
          </div>

          {/* TC Numbers Distribution Line Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">TC Number Distribution</h3>
                <p className="text-sm text-gray-500 mt-1">Top 20 TC numbers by occurrence</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="h-80">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Customers Table - Simplified */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Customers List</h3>
            <p className="text-sm text-gray-500 mt-1">All customers with their PO line items count</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Line Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboardData?.customers?.map((customer, index) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                          <span className="text-indigo-600 text-sm font-medium">
                            {customer.customer_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{customer.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {customer.total_po_line_items} items
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TC Numbers Table */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">TC Numbers Analysis</h3>
            <p className="text-sm text-gray-500 mt-1">All TC numbers with their occurrence count</p>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TC Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occurrence Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboardData?.tc_numbers?.map((tc, index) => (
                  <tr key={tc.tc_no} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{tc.tc_no}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tc.occurrence_count > 2 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tc.occurrence_count} {tc.occurrence_count === 1 ? 'time' : 'times'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;