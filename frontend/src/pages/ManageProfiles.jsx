import { useState, useEffect } from 'react';
import { adminAPI } from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import AdminSidebar from '../components/AdminSidebar.jsx';

export default function ManageProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProfiles();
  }, [search, page]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllProfiles(page, 20, search);
      setProfiles(response.data.data.profiles);
    } catch (err) {
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profileId) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await adminAPI.deleteProfile(profileId);
        fetchProfiles();
      } catch (err) {
        setError('Failed to delete profile');
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Business Profiles</h1>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Search */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <input
                type="text"
                placeholder="Search by name, company, or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Profiles Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : profiles.length === 0 ? (
                <div className="p-8 text-center text-gray-600">No profiles found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Company</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Owner</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {profiles.map((profile) => (
                        <tr key={profile._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-700">{profile.fullName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{profile.companyName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{profile.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {profile.userId?.fullName || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            <button
                              onClick={() => handleDelete(profile._id)}
                              className="px-3 py-1 bg-red-100 text-red-600 font-semibold rounded hover:bg-red-200 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
