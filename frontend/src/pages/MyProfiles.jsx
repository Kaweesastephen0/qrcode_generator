import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI, qrCodeAPI } from '../api/client';

export default function MyProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await profileAPI.getUserProfiles();
      setProfiles(response.data.data.profiles);
    } catch (err) {
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (profileId) => {
    try {
      await qrCodeAPI.generateQR(profileId);
      fetchProfiles();
      setError('QR Code generated successfully!');
    } catch (err) {
      setError('Failed to generate QR code');
    }
  };

  const handleViewQR = async (profileId) => {
    try {
      const response = await qrCodeAPI.getQRCodeByProfile(profileId);
      const qrCode = response.data.data.qrCode;
      setSelectedQR(qrCode.qrCodeUrl);
      setShowQRModal(true);
    } catch (err) {
      setError('Failed to load QR code');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div className="flex-between">
        <h2>My Profiles</h2>
        <button 
          onClick={() => navigate('/create-profile')}
          className="btn btn-primary"
        >
          + Create Profile
        </button>
      </div>

      {error && (
        <div className={`message ${error.includes('successfully') ? 'message-success' : 'message-error'}`}>
          {error}
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="no-profiles">
          <p>No profiles yet</p>
        </div>
      ) : (
        <div className="grid">
          {profiles.map((profile) => (
            <div key={profile._id} className="profile-card">
              <h3>{profile.companyName}</h3>
              {profile.slogan && <p><strong>Slogan:</strong> {profile.slogan}</p>}
              <p><strong>Location:</strong> {profile.location}</p>
              {profile.workingHours && <p><strong>Working Hours:</strong> {profile.workingHours}</p>}
              <p><strong>Projects/Services:</strong> {profile.projectsServices}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Phone:</strong> {profile.phone}</p>
              {profile.website && <p><strong>Website:</strong> <a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website}</a></p>}
              
              <div className="actions">
                <button 
                  onClick={() => handleGenerateQR(profile._id)}
                  className="btn btn-success btn-sm"
                >
                  Generate QR
                </button>
                <button 
                  onClick={() => handleViewQR(profile._id)}
                  className="btn btn-primary btn-sm"
                >
                  View QR Code
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showQRModal && selectedQR && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>QR Code</h3>
            <img src={selectedQR} alt="QR Code" />
            <button 
              onClick={() => setShowQRModal(false)}
              className="btn btn-danger"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}