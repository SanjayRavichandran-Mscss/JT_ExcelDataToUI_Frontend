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
  Building2,
  FileCheck,
  Calendar,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
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

// ─── Daily Target Tracker Card (Simplified - Only Target Input) ─────────────
const DailyTargetTracker = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [selectedDate, setSelectedDate] = useState(today);
  const [targetInput, setTargetInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fetch stats data on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://136.109.165.80:5000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStatsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get data for selected date
  const selectedDateStr = formatDateForAPI(selectedDate);
  const currentEntry = statsData?.progress_entries?.find(
    entry => {
      const entryDate = new Date(entry.selected_date);
      entryDate.setHours(0, 0, 0, 0);
      return formatDateForAPI(entryDate) === selectedDateStr;
    }
  );
  
  const targetForDay = currentEntry?.target_count || 0;
  const completedToday = currentEntry?.completed_count || 0;
  const remainingToday = currentEntry?.remaining || 0;
  const progressPct = currentEntry?.progress_percentage || 0;

  // FIXED: Calculate overall statistics from progress_entries only
  // This ensures accuracy by using actual completed counts from the database
  const allProgressEntries = statsData?.progress_entries || [];
  
  // Calculate overall target (sum of all target counts)
  const overallTarget = allProgressEntries.reduce((sum, entry) => sum + entry.target_count, 0);
  
  // Calculate overall completed (sum of all completed counts from certificate_details)
  const overallCompleted = allProgressEntries.reduce((sum, entry) => sum + entry.completed_count, 0);
  
  // Calculate overall remaining
  const overallRemaining = Math.max(0, overallTarget - overallCompleted);
  
  // Days logged count
  const daysLogged = allProgressEntries.length;

  const handleSubmit = async () => {
    const targetVal = parseInt(targetInput, 10);
    if (isNaN(targetVal) || targetVal <= 0) {
      alert('Please enter a valid target count');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://136.109.165.80:5000/api/dashboard/save', {
        selected_date: selectedDateStr,
        target_count: targetVal,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2000);
        setTargetInput('');
        // Refresh stats after saving
        await fetchStats();
      }
    } catch (error) {
      console.error('Error saving target:', error);
      alert('Failed to save target. Please try again.');
    }
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    const newDate = new Date();
    newDate.setHours(0, 0, 0, 0);
    setSelectedDate(newDate);
  };

  const recentDates = statsData?.progress_entries
    ?.sort((a, b) => new Date(b.selected_date) - new Date(a.selected_date))
    .slice(0, 10) || [];

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-8 py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      {/* Card Header */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-white to-emerald-50">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
            <Target className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Certificate Target Tracker</h2>
        </div>
        <p className="text-sm text-gray-500 ml-12">Set daily targets - completed certificates are auto-tracked</p>
      </div>

      <div className="px-8 py-7">
        {/* Summary stats - Bold and prominent */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wide">Overall Target</p>
                <p className="text-2xl font-bold text-white mt-1">{overallTarget}</p>
              </div>
              <Target className="h-8 w-8 text-indigo-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wide">Overall Completed</p>
                <p className="text-2xl font-bold text-white mt-1">{overallCompleted}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-100 uppercase tracking-wide">Overall Remaining</p>
                <p className="text-2xl font-bold text-white mt-1">{overallRemaining}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-100 uppercase tracking-wide">Days Logged</p>
                <p className="text-2xl font-bold text-white mt-1">{daysLogged}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Main input section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Date + Target Input form */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Set Target for a Date</p>
            <div className="flex flex-col gap-4">
              {/* Enhanced Date picker with navigation */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Select Date</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={goToPreviousDay}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      value={formatDateForAPI(selectedDate)}
                      onChange={(e) => {
                        const newDate = new Date(e.target.value);
                        newDate.setHours(0, 0, 0, 0);
                        setSelectedDate(newDate);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 cursor-pointer"
                    />
                  </div>
                  
                  <button
                    onClick={goToNextDay}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={goToToday}
                    className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Target input only */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Target Count
                  {targetForDay > 0 && (
                    <span className="ml-2 text-xs text-indigo-600 font-semibold">
                      (Current: {targetForDay})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter target count for this date"
                  value={targetInput}
                  onChange={e => setTargetInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 placeholder-gray-300"
                />
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={targetInput === ''}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  submitted
                    ? 'bg-emerald-500 text-white'
                    : targetInput !== ''
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {submitted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Saved!
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4" /> Set Target
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Selected date breakdown */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Status for{' '}
              <span className="text-indigo-600 font-bold">
                {formatDateForDisplay(selectedDate)}
              </span>
            </p>

            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span className="font-semibold">Progress</span>
                  <span className="font-bold text-indigo-600">{progressPct}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      progressPct >= 100
                        ? 'bg-emerald-500'
                        : progressPct >= 60
                        ? 'bg-indigo-500'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Stats row - Bold */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white rounded-xl p-3 border-2 border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Target</p>
                  <p className="text-2xl font-bold text-gray-800">{targetForDay}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border-2 border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide mb-1">Completed</p>
                  <p className="text-2xl font-bold text-emerald-600">{completedToday}</p>
                </div>
                <div className={`bg-white rounded-xl p-3 border-2 ${remainingToday === 0 ? 'border-emerald-100' : 'border-amber-100'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${remainingToday === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    Remaining
                  </p>
                  <p className={`text-2xl font-bold ${remainingToday === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {remainingToday}
                  </p>
                </div>
              </div>

              {remainingToday === 0 && targetForDay > 0 && (
                <div className="mt-4 flex items-center gap-2 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-4 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <p className="text-sm font-bold text-emerald-700">Target achieved for this date! </p>
                </div>
              )}

              {targetForDay === 0 && (
                <p className="mt-4 text-center text-xs text-gray-400 italic">No target set for this date yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent entries log - Enhanced with better styling */}
        {recentDates.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Targets History</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Date</th>
                    <th className="text-center py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Target</th>
                    <th className="text-center py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Completed</th>
                    <th className="text-center py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Remaining</th>
                    <th className="text-center py-3 px-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDates.map(entry => {
                    const entryDate = new Date(entry.selected_date);
                    entryDate.setHours(0, 0, 0, 0);
                    const dateStr = formatDateForAPI(entryDate);
                    const isToday = formatDateForAPI(new Date()) === dateStr;
                    const done = entry.remaining === 0;
                    return (
                      <tr key={dateStr} className={`border-b border-gray-100 hover:bg-gray-50 transition ${isToday ? 'bg-indigo-50' : ''}`}>
                        <td className="py-3 px-3 font-semibold text-gray-700">
                          {formatDateForDisplay(entryDate)}
                          {isToday && <span className="ml-2 text-xs text-indigo-600 font-bold">(Today)</span>}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-gray-700">{entry.target_count}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-600">{entry.completed_count}</td>
                        <td className="py-3 px-3 text-center font-bold text-amber-600">{entry.remaining}</td>
                        <td className="py-3 px-3 text-center">
                          {done ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" /> Achieved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                              <AlertCircle className="h-3 w-3" /> Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://136.109.165.80:5000/api/dashboard/data', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) setDashboardData(response.data.data);
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

  const customerBarChartData = {
    labels: dashboardData?.customers?.slice(0, 10).map(c => {
      let name = c.customer_name;
      return name.length > 20 ? name.substring(0, 20) + '...' : name;
    }) || [],
    datasets: [{
      label: 'PO Line Items',
      data: dashboardData?.customers?.slice(0, 10).map(c => c.total_po_line_items) || [],
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderColor: 'rgb(99, 102, 241)',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const doughnutChartData = {
    labels: ['Total Records', 'Unique TC Numbers'],
    datasets: [{
      data: [dashboardData?.overview?.total_records || 0, dashboardData?.overview?.unique_tc_numbers || 0],
      backgroundColor: ['#6366f1', '#10b981'],
      borderWidth: 0,
    }],
  };

  const lineChartData = {
    labels: dashboardData?.tc_numbers?.slice(0, 20).map(item => item.tc_no) || [],
    datasets: [{
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
    }],
  };

  const certificateBarData = {
    labels: dashboardData?.certificate_analysis?.slice(0, 10).map(c => {
      let name = c.customer_name;
      if (name && name.length > 20) name = name.substring(0, 20) + '...';
      return name || `Certificate ${c.certificate_id}`;
    }) || [],
    datasets: [{
      label: 'Line Items per Certificate',
      data: dashboardData?.certificate_analysis?.slice(0, 10).map(c => c.line_items_count) || [],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: 'rgb(16, 185, 129)',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 20, font: { size: 12 } },
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
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
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
      <div className="px-8 py-6">
        {/* Daily Target Tracker */}
        <DailyTargetTracker />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Customers" value={dashboardData?.overview?.total_customers} icon={Users} color="indigo" />
          <StatCard title="Total PO Line Items" value={dashboardData?.overview?.total_po_line_items} icon={ClipboardList} color="blue" />
          <StatCard title="Total Records" value={dashboardData?.overview?.total_records} icon={FileText} color="green" />
          <StatCard title="Unique TC Numbers" value={dashboardData?.overview?.unique_tc_numbers} icon={Hash} color="purple" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Top Customers</h3>
                <p className="text-sm text-gray-500 mt-1">PO line items by customer</p>
              </div>
              <Building2 className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="h-80"><Bar data={customerBarChartData} options={chartOptions} /></div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Records Overview</h3>
                <p className="text-sm text-gray-500 mt-1">Total vs Unique TC numbers</p>
              </div>
              <Package className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="h-80 flex items-center justify-center">
              <div className="w-64 h-64"><Doughnut data={doughnutChartData} options={chartOptions} /></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Certificate Analysis</h3>
                <p className="text-sm text-gray-500 mt-1">Line items per certificate</p>
              </div>
              <FileCheck className="h-5 w-5 text-green-500" />
            </div>
            <div className="h-80"><Bar data={certificateBarData} options={chartOptions} /></div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">TC Number Distribution</h3>
                <p className="text-sm text-gray-500 mt-1">Top 20 TC numbers by occurrence</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="h-80"><Line data={lineChartData} options={chartOptions} /></div>
          </div>
        </div>

        {/* Customers Table */}
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
                          <span className="text-indigo-600 text-sm font-medium">{customer.customer_name?.charAt(0) || '?'}</span>
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