import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Mail, Globe } from 'lucide-react';
import { profileAPI, analyticsAPI } from '../api/client.js';
import BusinessCard from '../components/BusinessCard.jsx';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-4xl">
        {/* Professional Business Card */}
        <BusinessCard
          profile={profile}
          qrCodeUrl={null} // Public view doesn't show QR code
          variant="modern"
          showQR={false}
          className="mb-8"
        />
        
        {/* Additional Contact Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </a>
            <a
              href={`tel:${profile.phone}`}
              className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </a>
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors sm:col-span-2"
              >
                <Globe className="w-4 h-4 mr-2" />
                Visit Website
              </a>
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
