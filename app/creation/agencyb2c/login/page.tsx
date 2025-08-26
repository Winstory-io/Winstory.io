"use client";
import React, { useState } from 'react';
import ThirdwebEmailAuth from '@/components/ThirdwebEmailAuth';

export default function AgencyB2CLoginPage() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 500, margin: '32px auto 32px auto', position: 'relative' }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: '#2eea8b', letterSpacing: 1, whiteSpace: 'nowrap' }}>Creation Agency login</span>
        <button onClick={() => setShowPopup(true)} style={{ background: 'none', border: 'none', marginLeft: 16, marginRight: 8, cursor: 'pointer', padding: 0 }} aria-label="Ampoule">
          <img src="/tooltip.svg" alt="Aide" width={32} height={32} style={{ filter: 'drop-shadow(0 0 6px #FFD600)' }} />
        </button>
        <button style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer', fontSize: 32, color: '#FF2D2D' }} aria-label="Fermer" onClick={() => { window.location.href = '/welcome'; }}>
          ×
        </button>
      </div>
      {showPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#181818', border: '2px solid #FFD600', borderRadius: 12, padding: 32, color: '#fff', position: 'relative' }}>
            <button onClick={() => setShowPopup(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#5252', fontSize: 28, cursor: 'pointer' }}>×</button>
            <div>Popup à paramétrer ultérieurement</div>
          </div>
        </div>
      )}
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <ThirdwebEmailAuth 
          title="Login with professional email"
          onSuccess={() => {
            // Rediriger vers la page Your Informations après connexion réussie
            window.location.href = '/creation/agencyb2c/yourinformations';
          }}
        />
      </div>
    </div>
  );
} 