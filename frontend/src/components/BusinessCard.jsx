import React, { useState, useEffect } from 'react';
import { Mail, Phone, Globe, MapPin, Building } from 'lucide-react';
import { getBackendUrl, getProfileImage } from '../api/client.js';

const BusinessCard = ({ 
  profile, 
  qrCodeUrl, 
  variant = 'modern',
  showQR = true,
  className = ''
}) => {
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (profile.profilePhoto && !profile.profilePhoto.startsWith('http')) {
        setImageLoading(true);
        try {
          const base64Image = await getProfileImage(profile.profilePhoto);
          setProfileImageUrl(base64Image);
        } catch (error) {
          console.error('Failed to fetch profile image:', error);
        } finally {
          setImageLoading(false);
        }
      } else if (profile.profilePhoto && profile.profilePhoto.startsWith('http')) {
        setProfileImageUrl(profile.profilePhoto);
      }
    };
    
    fetchProfileImage();
  }, [profile.profilePhoto]);
  
  const cardStyles = {
    modern: {
      background: '#6366f1',
      textColor: 'white',
      accentColor: '#f59e0b'
    },
    professional: {
      background: '#1e293b',
      textColor: 'white',
      accentColor: '#3b82f6'
    },
    minimal: {
      background: '#ffffff',
      textColor: '#1e293b',
      accentColor: '#3b82f6'
    }
  };

  const style = cardStyles[variant] || cardStyles.modern;

  return (
    <div className={`relative w-full max-w-lg mx-auto ${className}`}>
      {/* Card Container */}
      <div 
        className="relative rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105"
        style={{ background: style.background }}
      >
        
        {/* Card Content */}
        <div className="relative p-6">
          {/* Horizontal Layout */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Left Section - Contact Info */}
            <div className="flex-1">
              {/* Header */}
              <div className="mb-4">
                <h2 
                  className="text-xl sm:text-2xl font-bold mb-1"
                  style={{ color: style.textColor }}
                >
                  {profile.fullName}
                </h2>
                <p 
                  className="text-base sm:text-lg font-medium mb-1"
                  style={{ color: style.accentColor }}
                >
                  {profile.position}
                </p>
                <p 
                  className="text-sm opacity-90"
                  style={{ color: style.textColor }}
                >
                  {profile.companyName}
                </p>
              </div>

              {/* Description */}
              {profile.description && (
                <p 
                  className="text-sm mb-4 opacity-90 leading-relaxed"
                  style={{ color: style.textColor }}
                >
                  {profile.description}
                </p>
              )}

              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center" style={{ color: style.textColor }}>
                  <Mail className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: style.accentColor }} />
                  <span className="text-sm truncate">{profile.email}</span>
                </div>
                <div className="flex items-center" style={{ color: style.textColor }}>
                  <Phone className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: style.accentColor }} />
                  <span className="text-sm">{profile.phone}</span>
                </div>
                {profile.website && (
                  <div className="flex items-center" style={{ color: style.textColor }}>
                    <Globe className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: style.accentColor }} />
                    <span className="text-sm truncate">{profile.website}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-center" style={{ color: style.textColor }}>
                    <MapPin className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: style.accentColor }} />
                    <span className="text-sm">{profile.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Avatar and QR Code */}
            <div className="flex flex-col items-center space-y-4">
              {/* Avatar/Initial */}
              <div>
                {profileImageUrl ? (
                  <img 
                    src={profileImageUrl}
                    alt={profile.fullName}
                    className="w-20 h-20 rounded-full shadow-lg object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src);
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                    onLoad={(e) => {
                      console.log('Image loaded successfully:', e.target.src);
                    }}
                  />
                ) : null}
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg text-2xl font-bold"
                  style={{ 
                    backgroundColor: style.accentColor,
                    color: variant === 'minimal' ? '#1e293b' : style.background,
                    display: profileImageUrl || imageLoading ? 'none' : 'flex'
                  }}
                >
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* QR Code Section */}
              {showQR && qrCodeUrl && (
                <div className="text-center">
                  <div className="relative group">
                    <div 
                      className="p-3 rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105"
                      style={{ backgroundColor: 'white' }}
                    >
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code" 
                        className="w-16 h-16"
                      />
                    </div>
                    {/* QR Code Corner Decorations */}
                    <div 
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full shadow-md transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: style.accentColor }}
                    />
                    <div 
                      className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full opacity-60"
                      style={{ backgroundColor: style.accentColor }}
                    />
                  </div>
                  <p 
                    className="text-xs font-medium mt-2 opacity-90"
                    style={{ color: style.textColor }}
                  >
                    Scan for contact
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Shadow Effect */}
      <div className="absolute -bottom-2 left-4 right-4 h-4 bg-black opacity-10 rounded-full blur-xl" />
    </div>
  );
};

export default BusinessCard;
