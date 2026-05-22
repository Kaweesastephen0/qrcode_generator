import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { publicAPI } from '../api/client';

export default function PublicCardView() {
  const { profileId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await publicAPI.getPublicProfile(profileId);
        setProfile(response.data.data.profile);
      } catch (err) {
        setError('Business profile not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileId]);

  if (loading) return <div className="loading">Loading business card...</div>;
  if (error) return <div className="message message-error">{error}</div>;
  if (!profile) return <div className="message message-error">Profile not found</div>;

  return (
    <div className="container-sm" style={{ maxWidth: '600px' }}>
      <div className="profile-card" style={{ 
        border: '2px solid #4f46e5', 
        borderRadius: '12px',
        padding: '30px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        {/* Company Logo or Name */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#4f46e5',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: 'bold',
          margin: '0 auto 20px'
        }}>
          {profile.companyName.charAt(0).toUpperCase()}
        </div>

        <h2 style={{ color: '#4f46e5', marginBottom: '5px' }}>{profile.companyName}</h2>
        {profile.slogan && <p style={{ color: '#666', fontStyle: 'italic' }}>"{profile.slogan}"</p>}
        
        <div style={{ textAlign: 'left', marginTop: '20px' }}>
          <p><strong>📍 Location:</strong> {profile.location}</p>
          {profile.workingHours && <p><strong>🕐 Working Hours:</strong> {profile.workingHours}</p>}
          <p><strong>📋 Projects/Services:</strong> {profile.projectsServices}</p>
          <p><strong>📧 Email:</strong> <a href={`mailto:${profile.email}`}>{profile.email}</a></p>
          <p><strong>📞 Phone:</strong> <a href={`tel:${profile.phone}`}>{profile.phone}</a></p>
          {profile.website && <p><strong>🌐 Website:</strong> <a href={profile.website} target="_blank">{profile.website}</a></p>}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <a href={`tel:${profile.phone}`} className="btn btn-success" style={{ padding: '8px 16px' }}>
            Call Now
          </a>
          <a href={`mailto:${profile.email}`} className="btn btn-primary" style={{ padding: '8px 16px' }}>
            Send Email
          </a>
        </div>
      </div>
    </div>
  );
}