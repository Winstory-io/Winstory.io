"use client";
import React, { useState, useEffect } from 'react';
import LoginButton from '@/components/LoginButton';
import WalletConnect from '@/components/WalletConnect';
import { useRouter } from 'next/navigation';

export default function B2CLoginPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showRedirectArrow, setShowRedirectArrow] = useState(false);
  const router = useRouter();

  // Vérifier si l'utilisateur est déjà connecté au chargement de la page
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsConnected(true);
      setShowRedirectArrow(true);
      // Redirection automatique après 2 secondes
      setTimeout(() => {
        router.push('/creation/b2c/yourwinstory');
      }, 2000);
    }
  }, [router]);

  // Fonction à appeler après un login réussi
  const handleLoginSuccess = (email) => {
    if (!email) return;
    const domain = email.split('@')[1] || '';
    localStorage.setItem("user", JSON.stringify({ email }));
    localStorage.setItem("company", JSON.stringify({ name: domain }));
    setIsConnected(true);
    setShowRedirectArrow(true);
    // Redirection automatique après 2 secondes
    setTimeout(() => {
      router.push('/creation/b2c/yourwinstory');
    }, 2000);
  };

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    setIsConnected(false);
    setShowRedirectArrow(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 500, margin: '32px auto 32px auto', position: 'relative' }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: '#2eea8b', letterSpacing: 1, whiteSpace: 'nowrap' }}>Creation B2C login</span>
        <button onClick={() => setShowPopup(true)} style={{ background: 'none', border: 'none', marginLeft: 16, marginRight: 8, cursor: 'pointer', padding: 0 }} aria-label="Ampoule">
          <img src="/tooltip.svg" alt="Aide" style={{ width: 32, height: 32 }} />
        </button>
        <button style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer', fontSize: 32, color: '#FF2D2D' }} aria-label="Fermer" onClick={() => { window.location.href = '/welcome'; }}>
          ×
        </button>
      </div>
      {showPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#181818', border: '2px solid #FFD600', borderRadius: 12, padding: 32, color: '#fff', position: 'relative' }}>
            <button onClick={() => setShowPopup(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#FF5252', fontSize: 28, cursor: 'pointer' }}>×</button>
            <div>Popup à paramétrer ultérieurement</div>
          </div>
        </div>
      )}

      {/* Message de connexion réussie avec flèche verte */}
      {showRedirectArrow && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1500,
          background: '#181818',
          border: '2px solid #18C964',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center',
          color: '#fff',
          maxWidth: 400,
          width: '90%'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#18C964', marginBottom: 16 }}>
            Connexion réussie !
          </div>
          <div style={{ fontSize: 16, marginBottom: 24 }}>
            Redirection vers "Your Story" dans 2 secondes...
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18 }}>Redirection automatique</span>
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="18" fill="#18C964" />
              <path d="M16 22L24 30L32 22" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <WalletConnect
          isEmailLogin={true}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />
        {/* <LoginButton
          icon={<span role="img" aria-label="wallet">💳</span>}
          text="With your Web.3 Wallet"
          optional
        /> */}
      </div>
    </div>
  );
} 