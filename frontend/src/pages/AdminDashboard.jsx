import { useState, useEffect } from 'react';
import { adminAPI } from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import AdminSidebar from '../components/AdminSidebar.jsx';
import { Bar, Pie } from 'react-chartjs-2';
import { Users, Briefcase, QrCode, BarChart3, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getOverallAnalytics(),
      ]);
      setStats(statsRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const deviceData = {
    labels: analytics ? Object.keys(analytics.deviceDistribution) : [],
    datasets: [
      {
        label: 'Device Distribution',
        data: analytics ? Object.values(analytics.deviceDistribution) : [],
        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
      },
    ],
  };

  const countryData = {
    labels: analytics ? Object.keys(analytics.countryDistribution).slice(0, 10) : [],
    datasets: [
      {
        label: 'Scans by Country',
        data: analytics ? Object.values(analytics.countryDistribution).slice(0, 10) : [],
        backgroundColor: '#4f46e5',
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Navbar />
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Admin Dashboard</h1>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : stats ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-gray-600 text-xs sm:text-sm font-semibold">Total Users</h3>
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    </div>
                    <p className="text-2xl sm:text-4xl font-bold text-indigo-600">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-1 sm:mt-2">{stats.newUsersThisMonth} this month</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-gray-600 text-xs sm:text-sm font-semibold">Total Profiles</h3>
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <p className="text-2xl sm:text-4xl font-bold text-green-600">{stats.totalProfiles}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-gray-600 text-xs sm:text-sm font-semibold">Total QR Codes</h3>
                      <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl sm:text-4xl font-bold text-blue-600">{stats.totalQRCodes}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-gray-600 text-xs sm:text-sm font-semibold">Total Scans</h3>
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl sm:text-4xl font-bold text-purple-600">{stats.totalScans}</p>
                    <p className="text-xs text-gray-500 mt-1 sm:mt-2">{stats.scansThisMonth} this month</p>
                  </div>
                </div>

                {/* Active Users */}
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-gray-600 text-xs sm:text-sm font-semibold">Active Users</h3>
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.activeUsers}</p>
                </div>

                {/* Charts */}
                {analytics && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Device Distribution</h2>
                      <div className="h-64 sm:h-72">
                        <Pie
                          data={deviceData}
                          options={{ responsive: true, maintainAspectRatio: false }}
                        />
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Top Countries</h2>
                      <div className="h-64 sm:h-72">
                        <Bar
                          data={countryData}
                          options={{ responsive: true, maintainAspectRatio: false }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
