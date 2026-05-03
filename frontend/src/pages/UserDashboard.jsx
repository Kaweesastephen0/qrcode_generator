import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

export default function UserDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getUserAnalytics();
      setAnalytics(response.data.data);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Profiles</h3>
                    <p className="text-4xl font-bold text-indigo-600">{analytics?.totalProfiles || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2">Total QR Codes</h3>
                    <p className="text-4xl font-bold text-green-600">{analytics?.totalQRCodes || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Scans</h3>
                    <p className="text-4xl font-bold text-blue-600">{analytics?.totalScans || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-600 text-sm font-semibold mb-2">Device Types</h3>
                    <p className="text-4xl font-bold text-purple-600">
                      {analytics?.deviceDistribution ? Object.keys(analytics.deviceDistribution).length : 0}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => navigate('/create-profile')}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                    >
                      + Create Profile
                    </button>
                    <button
                      onClick={() => navigate('/my-profiles')}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                    >
                      View Profiles
                    </button>
                  </div>
                </div>

                {/* Device Distribution */}
                {analytics?.deviceDistribution && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Device Distribution</h2>
                    <div className="space-y-3">
                      {Object.entries(analytics.deviceDistribution).map(([device, count]) => (
                        <div key={device} className="flex items-center justify-between">
                          <span className="text-gray-700 capitalize">{device}</span>
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-200 rounded-full h-8 w-48">
                              <div
                                className="bg-indigo-600 h-8 rounded-full"
                                style={{
                                  width: `${(count / analytics.totalScans) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-gray-700 font-semibold">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
