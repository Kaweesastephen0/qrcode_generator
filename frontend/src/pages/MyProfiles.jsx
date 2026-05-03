import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI, qrCodeAPI } from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

export default function MyProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCode, setQRCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getUserProfiles();
      setProfiles(response.data.data.profiles);
    } catch (err) {
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQR = async (profile) => {
    try {
      setSelectedProfile(profile);
      const response = await qrCodeAPI.getQRCodeByProfile(profile._id);
      setQRCode(response.data.data.qrCode);
      setShowQRModal(true);
    } catch (err) {
      setError('Failed to load QR code');
    }
  };

  const handleDownloadQR = async (profileId) => {
    try {
      const response = await qrCodeAPI.downloadQRCode(profileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qr-code-${profileId}.png`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      setError('Failed to download QR code');
    }
  };

  const handleDelete = async (profileId) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await profileAPI.deleteProfile(profileId);
        setProfiles(profiles.filter((p) => p._id !== profileId));
      } catch (err) {
        setError('Failed to delete profile');
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">My Business Profiles</h1>
              <button
                onClick={() => navigate('/create-profile')}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
              >
                + Create Profile
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No profiles created yet</p>
                <button
                  onClick={() => navigate('/create-profile')}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
                >
                  Create Your First Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                  <div key={profile._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-24"></div>
                    <div className="px-6 pb-6">
                      <h3 className="text-xl font-bold text-gray-800 mt-2">{profile.fullName}</h3>
                      <p className="text-indigo-600 font-semibold">{profile.position}</p>
                      <p className="text-gray-600 text-sm mb-4">{profile.companyName}</p>

                      <div className="space-y-2 mb-4 text-sm">
                        <p className="text-gray-600">📧 {profile.email}</p>
                        <p className="text-gray-600">📱 {profile.phone}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewQR(profile)}
                          className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-200 transition text-sm"
                        >
                          View QR
                        </button>
                        <button
                          onClick={() => handleDownloadQR(profile._id)}
                          className="flex-1 px-3 py-2 bg-green-100 text-green-600 font-semibold rounded-lg hover:bg-green-200 transition text-sm"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => navigate(`/analytics/${profile._id}`)}
                          className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 font-semibold rounded-lg hover:bg-blue-200 transition text-sm"
                        >
                          Analytics
                        </button>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => navigate(`/edit-profile/${profile._id}`)}
                          className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-600 font-semibold rounded-lg hover:bg-yellow-200 transition text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(profile._id)}
                          className="flex-1 px-3 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">QR Code</h2>
            {qrCode && (
              <div>
                <img src={qrCode.qrCodeUrl} alt="QR Code" className="mx-auto mb-4 w-64 h-64" />
                <div className="mb-4 p-3 bg-gray-100 rounded">
                  <p className="text-sm text-gray-600">Scans: <strong>{qrCode.totalScans}</strong></p>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowQRModal(false)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
