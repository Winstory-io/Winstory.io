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

  // DEBUG affichage du localStorage
  const [debugUser, setDebugUser] = useState('');
  const [debugWallet, setDebugWallet] = useState('');
  useEffect(() => {
    const updateDebug = () => {
      setDebugUser(localStorage.getItem('user') || 'null');
      setDebugWallet(localStorage.getItem('walletAddress') || 'null');
    };
    updateDebug();
    window.addEventListener('focus', updateDebug);
    document.addEventListener('visibilitychange', updateDebug);
    return () => {
      window.removeEventListener('focus', updateDebug);
      document.removeEventListener('visibilitychange', updateDebug);
    };
  }, []);

  // Check if user is already connected when page loads
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsConnected(true);
      setShowRedirectArrow(true);
      // Automatic redirect after 2 seconds
      setTimeout(() => {
        router.push('/creation/b2c/yourwinstory');
      }, 2000);
    }
  }, [router]);

  // Redirection automatique dès que l'email et le wallet sont présents dans le localStorage
  useEffect(() => {
    const checkAndRedirect = () => {
      const user = JSON.parse(localStorage.getItem("user") || 'null');
      const wallet = localStorage.getItem("walletAddress");
      if (user?.email && wallet) {
        setIsConnected(true);
        setShowRedirectArrow(true);
        setTimeout(() => {
          router.push('/creation/b2c/yourinformations');
        }, 1000);
      }
    };
    checkAndRedirect();
    window.addEventListener('focus', checkAndRedirect);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkAndRedirect();
    });
    return () => {
      window.removeEventListener('focus', checkAndRedirect);
      document.removeEventListener('visibilitychange', checkAndRedirect);
    };
  }, [router]);

  // Function to call after successful login
  const handleLoginSuccess = (data) => {
    // data: { email, walletAddress }
    if (!data || !data.email || !data.walletAddress) return;
    const domain = data.email.split('@')[1] || '';
    localStorage.setItem("user", JSON.stringify({ email: data.email }));
    localStorage.setItem("company", JSON.stringify({ name: domain }));
    setIsConnected(true);
    setShowRedirectArrow(true);
    setTimeout(() => {
      router.push('/creation/b2c/yourinformations');
    }, 2000);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    setIsConnected(false);
    setShowRedirectArrow(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 24 }}>
      {/* DEBUG INFO */}
      <div style={{ background: '#222', color: '#FFD600', padding: 12, marginBottom: 16, borderRadius: 8 }}>
        <div><b>DEBUG</b></div>
        <div>localStorage.user: {debugUser}</div>
        <div>localStorage.walletAddress: {debugWallet}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 500, margin: '32px auto 32px auto', position: 'relative' }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: '#2eea8b', letterSpacing: 1, whiteSpace: 'nowrap' }}>Creation B2C login</span>
        <button onClick={() => setShowPopup(true)} style={{ background: 'none', border: 'none', marginLeft: 16, marginRight: 8, cursor: 'pointer', padding: 0 }} aria-label="Help">
          <img src="/tooltip.svg" alt="Help" style={{ width: 32, height: 32 }} />
        </button>
        <button style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer', fontSize: 32, color: '#FF2D2D' }} aria-label="Close" onClick={() => { window.location.href = '/welcome'; }}>
          ×
        </button>
      </div>
      {showPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#181818', border: '2px solid #FFD600', borderRadius: 12, padding: 32, color: '#fff', position: 'relative' }}>
            <button onClick={() => setShowPopup(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#FF5252', fontSize: 28, cursor: 'pointer' }}>×</button>
            <div>Popup to be configured later</div>
          </div>
        </div>
      )}

      {/* Successful login message with green arrow */}
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
            Login successful !
          </div>
          <div style={{ fontSize: 16, marginBottom: 24 }}>
            Redirecting to "Your Story" in 2 seconds...
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18 }}>Automatic redirect</span>
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