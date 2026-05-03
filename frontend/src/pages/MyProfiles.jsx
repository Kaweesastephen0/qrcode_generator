import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import { profileAPI, qrCodeAPI, getBackendUrl, getProfileImage } from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import BusinessCard from '../components/BusinessCard.jsx';

export default function MyProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCode, setQRCode] = useState(null);
  const [cardVariant, setCardVariant] = useState('modern');
  const [profileImageUrls, setProfileImageUrls] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getUserProfiles();
      const profilesData = response.data.data.profiles;
      setProfiles(profilesData);
      
      // Load profile images
      const imageUrls = {};
      for (const profile of profilesData) {
        if (profile.profilePhoto && !profile.profilePhoto.startsWith('http')) {
          try {
            const imageUrl = await getProfileImage(profile.profilePhoto);
            if (imageUrl) {
              imageUrls[profile._id] = imageUrl;
            }
          } catch (error) {
            console.error('Failed to load image for profile:', profile._id);
          }
        } else if (profile.profilePhoto && profile.profilePhoto.startsWith('http')) {
          imageUrls[profile._id] = profile.profilePhoto;
        }
      }
      setProfileImageUrls(imageUrls);
    } catch (err) {
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQR = async (profile) => {
    try {
      console.log('Profile data passed to modal:', profile);
      setSelectedProfile(profile);
      const response = await qrCodeAPI.getQRCodeByProfile(profile._id);
      setQRCode(response.data.data.qrCode);
      setShowQRModal(true);
    } catch (err) {
      setError('Failed to load QR code');
    }
  };

  const handleDownloadBusinessCard = async (profileId) => {
    try {
      const response = await qrCodeAPI.downloadBusinessCard(profileId, cardVariant);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `business-card-${profileId}.png`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      setError('Failed to download business card');
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

  const handleEditProfile = (profile) => {
    navigate(`/edit-profile/${profile._id}`);
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
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Navbar />
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">My Profiles</h1>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <button
                onClick={() => navigate('/create-profile')}
                className="px-4 sm:px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition text-sm sm:text-base"
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
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profile
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Website
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {profiles.map((profile) => (
                        <tr key={profile._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {profileImageUrls[profile._id] ? (
                                <img
                                  src={profileImageUrls[profile._id]}
                                  alt={profile.fullName}
                                  className="w-10 h-10 rounded-full object-cover mr-3"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                  <span className="text-sm font-semibold text-indigo-600">
                                    {profile.fullName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{profile.fullName}</div>
                                <div className="text-xs text-gray-500">ID: {profile._id.slice(-8)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center gap-1 mb-1">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="truncate max-w-[150px]">{profile.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span>{profile.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{profile.companyName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{profile.position}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {profile.website ? (
                              <a
                                href={profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-600 hover:text-indigo-900 truncate max-w-[150px] block"
                              >
                                {profile.website}
                              </a>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewQR(profile)}
                                className="px-3 py-1 bg-indigo-100 text-indigo-600 text-xs font-medium rounded hover:bg-indigo-200 transition-colors"
                                title="View QR Code"
                              >
                                QR
                              </button>
                              <button
                                onClick={() => handleEditProfile(profile)}
                                className="px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded hover:bg-green-200 transition-colors"
                                title="Edit Profile"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDownloadQR(profile._id)}
                                className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded hover:bg-blue-200 transition-colors"
                                title="Download QR"
                              >
                                DL
                              </button>
                              <button
                                onClick={() => navigate(`/analytics/${profile._id}`)}
                                className="px-3 py-1 bg-yellow-100 text-yellow-600 text-xs font-medium rounded hover:bg-yellow-200 transition-colors"
                                title="View Analytics"
                              >
                                Analytics
                              </button>
                              <button
                                onClick={() => handleDelete(profile._id)}
                                className="px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded hover:bg-red-200 transition-colors"
                                title="Delete Profile"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Business Card Designs</h2>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Card Variant Selector */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Choose Card Style:</h3>
                <div className="flex space-x-2">
                  {['modern', 'professional', 'minimal'].map((variant) => (
                    <button
                      key={variant}
                      onClick={() => setCardVariant(variant)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                        cardVariant === variant
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Business Card Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <BusinessCard
                profile={selectedProfile}
                qrCodeUrl={qrCode?.qrCodeUrl}
                variant={cardVariant}
                showQR={true}
                className="mb-6"
              />
              
              {/* Analytics Info */}
              {qrCode && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">QR Code Analytics</p>
                      <p className="text-xs text-gray-500 mt-1">Total Scans: <span className="font-semibold">{qrCode.totalScans}</span></p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadBusinessCard(selectedProfile._id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Download Business Card
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
