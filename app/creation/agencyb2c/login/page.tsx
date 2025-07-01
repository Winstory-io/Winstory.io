import React, { useState } from 'react';
import LoginHeader from '@/components/LoginHeader';
import LoginButton from '@/components/LoginButton';

export default function AgencyB2CLoginPage() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 24 }}>
      <LoginHeader />
      <h1>Creation Agency login</h1>
      <button onClick={() => setShowPopup(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <span style={{ fontSize: 32, color: '#FFD600' }}>💡</span>
      </button>
      {showPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#181818', border: '2px solid #FFD600', borderRadius: 12, padding: 32, color: '#fff' }}>
            <button onClick={() => setShowPopup(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#FF5252', fontSize: 28, cursor: 'pointer' }}>×</button>
            <div>Popup à paramétrer ultérieurement</div>
          </div>
        </div>
      )}
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', marginTop: 32 }}>
        <LoginButton
          icon={<span role="img" aria-label="email">📧</span>}
          text="With your Pro E-mail"
          required
          color="#fff"
        />
        <LoginButton
          icon={<span role="img" aria-label="wallet">💳</span>}
          text="With your Web.3 Wallet"
          optional
        />
      </div>
    </div>
  );
} 