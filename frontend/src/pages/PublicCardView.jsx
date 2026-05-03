import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { profileAPI, analyticsAPI } from '../api/client.js';

export default function PublicCardView() {
  const { profileId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Log the scan
        await analyticsAPI.logScan(profileId);
        // Get profile data
        const response = await profileAPI.getPublicProfile(profileId);
        setProfile(response.data.data.profile);
      } catch (err) {
        setError('Profile not found');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 h-32"></div>

        {/* Profile Card */}
        <div className="px-6 pb-6">
          <div className="text-center -mt-16 mb-4">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.fullName}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg mx-auto object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg mx-auto bg-indigo-200 flex items-center justify-center text-4xl font-bold text-indigo-600">
                {profile.fullName.charAt(0)}
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-800 text-center">{profile.fullName}</h1>
          <p className="text-indigo-600 font-semibold text-center">{profile.position}</p>
          <p className="text-gray-600 text-center">{profile.companyName}</p>

          {profile.description && (
            <p className="text-gray-600 text-center mt-3 text-sm">{profile.description}</p>
          )}

          {/* Contact Info */}
          <div className="mt-6 space-y-3 border-t pt-6">
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <span>📧</span>
              <a href={`mailto:${profile.email}`} className="hover:text-indigo-600">
                {profile.email}
              </a>
            </div>

            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <span>📱</span>
              <a href={`tel:${profile.phone}`} className="hover:text-indigo-600">
                {profile.phone}
              </a>
            </div>

            {profile.website && (
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <span>🌐</span>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 truncate"
                >
                  {profile.website}
                </a>
              </div>
            )}

            {profile.address && (
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <span>📍</span>
                <span>{profile.address}</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          {profile.socialLinks && Object.keys(profile.socialLinks).some((key) => profile.socialLinks[key]) && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-center gap-4 flex-wrap">
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-900 text-2xl"
                    title="LinkedIn"
                  >
                    in
                  </a>
                )}
                {profile.socialLinks.facebook && (
                  <a
                    href={profile.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-2xl"
                    title="Facebook"
                  >
                    f
                  </a>
                )}
                {profile.socialLinks.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-600 text-2xl"
                    title="Twitter"
                  >
                    𝕏
                  </a>
                )}
                {profile.socialLinks.instagram && (
                  <a
                    href={profile.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-800 text-2xl"
                    title="Instagram"
                  >
                    📷
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 hover:text-gray-900 text-2xl"
                    title="GitHub"
                  >
                    ⚙️
                  </a>
                )}
                {profile.socialLinks.whatsapp && (
                  <a
                    href={profile.socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-700 text-2xl"
                    title="WhatsApp"
                  >
                    💬
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
