import Link from 'next/link';

const yellow = '#FFD600';
const borderRadius = '16px';
const boxStyle = {
  border: `2px solid ${yellow}`,
  borderRadius,
  padding: '32px 0',
  margin: '0 0 24px 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.85)',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
};

export default function YouAre() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: yellow, fontFamily: 'Inter, sans-serif', position: 'relative', padding: 0 }}>
      {/* Croix rouge en haut à droite */}
      <Link href="/welcome" style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <span title="Close">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round"/>
            <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </span>
      </Link>

      {/* Titre et ampoule */}
      <div style={{ textAlign: 'center', marginTop: 80, marginBottom: 56 }}>
        <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: 1 }}>
          You are ?
        </span>
        <span style={{ marginLeft: 16, verticalAlign: 'middle' }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="18" fill="rgba(255,214,0,0.12)"/>
            <path d="M18 8a7 7 0 0 1 7 7c0 2.6-1.5 4.8-3.7 6v2.5a1.3 1.3 0 0 1-2.6 0V21c-2.2-1.2-3.7-3.4-3.7-6a7 7 0 0 1 7-7Z" stroke="#FFD600" strokeWidth="2"/>
            <rect x="16" y="25" width="4" height="2" rx="1" fill="#FFD600"/>
          </svg>
        </span>
      </div>

      {/* B2C Brand */}
      <Link href="/creation/b2c" style={{ textDecoration: 'none' }}>
        <div style={{ ...boxStyle, margin: '0 24px 16px 24px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Mallette + graphique */}
            <span>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="16" width="32" height="20" rx="4" fill="#222" stroke={yellow} strokeWidth="2"/>
                <rect x="18" y="12" width="12" height="6" rx="2" fill="#222" stroke={yellow} strokeWidth="2"/>
                <rect x="14" y="28" width="4" height="6" rx="2" fill={yellow}/>
                <rect x="22" y="24" width="4" height="10" rx="2" fill={yellow}/>
                <rect x="30" y="20" width="4" height="14" rx="2" fill={yellow}/>
              </svg>
            </span>
            <span style={{ fontSize: 32, fontWeight: 700, color: yellow }}>B2C Brand</span>
          </span>
        </div>
      </Link>

      {/* Question agence */}
      <div style={{ textAlign: 'center', margin: '0 0 16px 0' }}>
        <Link href="/creation/agencyb2c" style={{ color: yellow, fontStyle: 'italic', textDecoration: 'underline', fontWeight: 600, fontSize: 20 }}>
          You are an agency working with a B2C client ?
        </Link>
      </div>

      {/* Individual Member */}
      <Link href="/creation/individual" style={{ textDecoration: 'none' }}>
        <div style={{ ...boxStyle, margin: '0 24px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Profil */}
            <span>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="18" r="10" fill="#222" stroke={yellow} strokeWidth="2"/>
                <rect x="10" y="32" width="28" height="10" rx="5" fill="#222" stroke={yellow} strokeWidth="2"/>
              </svg>
            </span>
            <span style={{ fontSize: 32, fontWeight: 700, color: yellow }}>Individual Member</span>
          </span>
        </div>
      </Link>
    </div>
  );
}
