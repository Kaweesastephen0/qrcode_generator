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

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0f1e',
      fontFamily: '"DM Sans", sans-serif',
      color: '#fff',
      fontSize: '15px',
      letterSpacing: '0.05em'
    }}>
      Loading...
    </div>
  );

  if (error || !profile) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0f1e',
      color: '#ef4444',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '15px'
    }}>
      {error || 'Profile not found'}
    </div>
  );

  const initial = profile.companyName.charAt(0).toUpperCase();

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .card-root a { text-decoration: none; }
        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          border-radius: 4px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          transition: opacity 0.2s, transform 0.15s;
        }
        .action-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .action-btn:active { transform: translateY(0); }
        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .info-row:last-child { border-bottom: none; }
        .info-row a { color: #93c5fd; }
        .info-row a:hover { color: #bfdbfe; }
      `}</style>

      <div className="card-root" style={{
        minHeight: '100vh',
        background: '#080d1c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: '"DM Sans", sans-serif',
      }}>

        {/* Card */}
        <div style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
          animation: 'fadeUp 0.6s ease both',
          background: '#111827',
          position: 'relative',
        }}>

          {/* ─── Header band with clipped geometry ─── */}
          <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#0f172a' }}>

            {/* Deep navy base */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
            }} />

            {/* Red diagonal slash — clipping accent */}
            <svg
              viewBox="0 0 480 200"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <defs>
                <clipPath id="slash-clip">
                  <polygon points="300,0 480,0 480,200 220,200" />
                </clipPath>
                <clipPath id="inner-clip">
                  <polygon points="340,0 480,0 480,200 260,200" />
                </clipPath>
                <clipPath id="corner-clip">
                  <polygon points="420,0 480,0 480,90" />
                </clipPath>
              </defs>

              {/* Wide red panel */}
              <rect x="0" y="0" width="480" height="200" fill="#be123c" clipPath="url(#slash-clip)" />

              {/* Darker crimson inner layer */}
              <rect x="0" y="0" width="480" height="200" fill="#9f1239" clipPath="url(#inner-clip)" />

              {/* White geometric accent top-right corner */}
              <rect x="0" y="0" width="480" height="200" fill="rgba(255,255,255,0.07)" clipPath="url(#corner-clip)" />

              {/* Fine horizontal line on the slash edge */}
              <line x1="300" y1="0" x2="220" y2="200" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <line x1="340" y1="0" x2="260" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            </svg>

            {/* Company initial circle */}
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '32px',
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: '700',
              fontFamily: '"Playfair Display", serif',
              color: '#be123c',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              border: '3px solid rgba(255,255,255,0.2)',
              zIndex: 2,
            }}>
              {initial}
            </div>

            {/* Company name top-left */}
            <div style={{
              position: 'absolute',
              top: '28px',
              left: '32px',
              zIndex: 2,
            }}>
              <div style={{
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                fontWeight: '500',
                marginBottom: '5px',
              }}>
                Business Card
              </div>
              <div style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '22px',
                fontWeight: '700',
                color: '#fff',
                lineHeight: '1.2',
                maxWidth: '240px',
              }}>
                {profile.companyName}
              </div>
            </div>

            {/* Red dot pattern on right panel */}
            <svg
              viewBox="0 0 160 200"
              style={{ position: 'absolute', right: 0, top: 0, width: '160px', height: '200px', opacity: 0.18 }}
            >
              {[...Array(5)].map((_, row) =>
                [...Array(5)].map((_, col) => (
                  <circle key={`${row}-${col}`} cx={20 + col * 28} cy={20 + row * 40} r="2.5" fill="#fff" />
                ))
              )}
            </svg>
          </div>

          {/* ─── Body ─── */}
          <div style={{ padding: '0 32px 32px', background: '#111827' }}>

            {/* Slogan */}
            {profile.slogan && (
              <div style={{
                padding: '18px 0 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.45)',
                fontSize: '13px',
                fontStyle: 'italic',
                letterSpacing: '0.02em',
                lineHeight: '1.5',
              }}>
                "{profile.slogan}"
              </div>
            )}

            {/* Info rows */}
            <div style={{ paddingTop: profile.slogan ? '4px' : '20px' }}>

              {/* Services */}
              <div className="info-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#be123c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <div>
                  <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Services</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.4' }}>{profile.projectsServices}</div>
                </div>
              </div>

              {/* Location */}
              <div className="info-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#be123c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Location</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>{profile.location}</div>
                </div>
              </div>

              {/* Working Hours */}
              {profile.workingHours && (
                <div className="info-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#be123c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Working Hours</div>
                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>{profile.workingHours}</div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="info-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#be123c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <div>
                  <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Email</div>
                  <a href={`mailto:${profile.email}`} style={{ fontSize: '14px', color: '#93c5fd' }}>{profile.email}</a>
                </div>
              </div>

              {/* Phone */}
              <div className="info-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#be123c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.49 5.49l.72-.84a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <div>
                  <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Phone</div>
                  <a href={`tel:${profile.phone}`} style={{ fontSize: '14px', color: '#93c5fd' }}>{profile.phone}</a>
                </div>
              </div>

              {/* Website */}
              {profile.website && (
                <div className="info-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#be123c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                    <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Website</div>
                    <a href={profile.website} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: '#93c5fd' }}>{profile.website.replace(/^https?:\/\//, '')}</a>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Action buttons ─── */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <a
                href={`tel:${profile.phone}`}
                className="action-btn"
                style={{ flex: 1, justifyContent: 'center', background: '#be123c', color: '#fff' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.49 5.49l.72-.84a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Call Now
              </a>
              <a
                href={`mailto:${profile.email}`}
                className="action-btn"
                style={{ flex: 1, justifyContent: 'center', background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                Email Us
              </a>
            </div>

            {/* Footer rule */}
            <div style={{
              marginTop: '28px',
              paddingTop: '18px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
                DIGITAL BUSINESS CARD
              </span>
              {/* Red dot accent */}
              <div style={{ display: 'flex', gap: '5px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#be123c' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(190,18,60,0.4)' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(190,18,60,0.15)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}