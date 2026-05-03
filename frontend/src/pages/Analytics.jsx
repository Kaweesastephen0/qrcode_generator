import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { analyticsAPI } from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { Line, Pie, Bar } from 'react-chartjs-2';
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

export default function Analytics() {
  const { profileId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [scanLogs, setScanLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAnalytics();
    fetchScanLogs();
  }, [profileId, page]);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getProfileAnalytics(profileId);
      setAnalytics(response.data.data);
    } catch (err) {
      setError('Failed to load analytics');
    }
  };

  const fetchScanLogs = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getScanLogs(profileId, page, 20);
      setScanLogs(response.data.data.scans);
    } catch (err) {
      setError('Failed to load scan logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data - Generate last 30 days with zero-filled data
  const generateDailyScansData = () => {
    const dailyDistribution = analytics.dailyDistribution || {};
    const today = new Date();
    const dates = [];
    const counts = [];
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
      counts.push(dailyDistribution[dateStr] || 0);
    }
    
    return {
      labels: dates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Daily Scans',
          data: counts,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    };
  };

  const dailyScansData = generateDailyScansData();

  const deviceData = {
    labels: Object.keys(analytics.deviceDistribution || {}),
    datasets: [
      {
        label: 'Device Distribution',
        data: Object.values(analytics.deviceDistribution || {}),
        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
      },
    ],
  };

  const countryData = {
    labels: Object.keys(analytics.countriesDistribution || {}).slice(0, 10),
    datasets: [
      {
        label: 'Scans by Country',
        data: Object.values(analytics.countriesDistribution || {}).slice(0, 10),
        backgroundColor: '#4f46e5',
      },
    ],
  };

  // Chart options for Daily Scans
  const dailyScansOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: function(context) {
            return `Date: ${context[0].label}`;
          },
          label: function(context) {
            return `Scans: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          },
          callback: function(value) {
            if (Math.floor(value) === value) {
              return value;
            }
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Navbar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto pb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">QR Code Analytics</h1>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Scans</h3>
                <p className="text-4xl font-bold text-indigo-600">{analytics.totalScans}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Last Scanned</h3>
                <p className="text-lg text-gray-800">
                  {analytics.lastScannedAt
                    ? new Date(analytics.lastScannedAt).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Device Types</h3>
                <p className="text-lg text-gray-800">
                  {Object.keys(analytics.deviceDistribution || {}).length}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Scans (Last 30 Days)</h2>
                <div className="h-64">
                  <Line data={dailyScansData} options={dailyScansOptions} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Device Distribution</h2>
                <div className="h-64">
                  <Pie data={deviceData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Countries</h2>
              <div className="h-64">
                <Bar data={countryData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Recent Scans */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Scans</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Country</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">City</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Device</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Browser</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">IP Address</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanLogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-600">
                          No scans yet
                        </td>
                      </tr>
                    ) : (
                      scanLogs.map((scan) => (
                        <tr key={scan._id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700">{scan.country || 'Unknown'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{scan.city || 'Unknown'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{scan.deviceType}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{scan.browser}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-mono text-xs">{scan.ipAddress}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {new Date(scan.timestamp).toLocaleDateString()} {new Date(scan.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
