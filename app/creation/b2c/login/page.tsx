"use client";
import React, { useState, useEffect, useRef } from 'react';
import LoginButton from '@/components/LoginButton';
import WalletConnect from '@/components/WalletConnect';
import { useRouter } from 'next/navigation';

export default function B2CLoginPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showRedirectArrow, setShowRedirectArrow] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');
  const router = useRouter();
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null);

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

  // Effet unique pour la redirection après login
  useEffect(() => {
    // Nettoyer tout timeout précédent
    if (redirectTimeout.current) {
      clearTimeout(redirectTimeout.current);
      redirectTimeout.current = null;
    }
    // Vérifier la présence de l'email et du wallet
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const wallet = localStorage.getItem('walletAddress');
    if (user?.email && wallet) {
      setIsConnected(true);
      setShowRedirectArrow(true);
      setRedirectMessage('Redirecting to "Your informations" in 1 second...');
      redirectTimeout.current = setTimeout(() => {
        setShowRedirectArrow(false);
        router.push('/creation/b2c/yourinformations');
      }, 1000);
    } else if (user) {
      setIsConnected(true);
      setShowRedirectArrow(true);
      setRedirectMessage('Redirecting to "Your Story" in 2 seconds...');
      redirectTimeout.current = setTimeout(() => {
        setShowRedirectArrow(false);
        router.push('/creation/b2c/yourwinstory');
      }, 2000);
    } else {
      setIsConnected(false);
      setShowRedirectArrow(false);
      setRedirectMessage('');
    }
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
        redirectTimeout.current = null;
      }
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
    setRedirectMessage('Redirecting to "Your informations" in 1 second...');
    if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
    redirectTimeout.current = setTimeout(() => {
      setShowRedirectArrow(false);
      router.push('/creation/b2c/yourinformations');
    }, 1000);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    setIsConnected(false);
    setShowRedirectArrow(false);
    setRedirectMessage('');
    if (redirectTimeout.current) {
      clearTimeout(redirectTimeout.current);
      redirectTimeout.current = null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 24 }}>
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
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowPopup(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: 600,
              width: '90vw',
              background: '#000',
              border: '4px solid #FFD600',
              borderRadius: 24,
              padding: '32px 24px 28px 24px',
              boxShadow: '0 0 32px #000',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#FFD600',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                zIndex: 10,
              }}
              aria-label="Close"
            >
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
                <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </button>
            <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 18, letterSpacing: 1 }}>Secure access for verified companies only</h2>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 400, marginBottom: 18, textAlign: 'center' }}>
              To create or manage a campaign on Winstory as a B2C brand, you must log in using a professional email address.<br /><br />
              This verification step helps ensure the authenticity of brand representatives and prevents identity spoofing.
            </div>
            <div style={{ width: '100%', marginBottom: 18 }}>
              <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>✅ How it works:</div>
              <ul style={{ color: '#fff', fontSize: 15, fontWeight: 500, marginLeft: 22, marginBottom: 0 }}>
                <li>Enter your professional email (e.g. name@yourcompany.com)</li>
                <li>Receive a one-time verification code by email</li>
                <li>Validate your code within 15 minutes</li>
                <li>A secure wallet will automatically be created and linked to your verified email address (via account abstraction).</li>
                <li>If your company already has its own wallet, you’ll be able to connect it later.</li>
                <li>Once your professional account is verified, you’ll be automatically redirected to continue your campaign setup</li>
              </ul>
            </div>
            <div style={{ width: '100%', marginBottom: 18 }}>
              <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>❗️Important:</div>
              <ul style={{ color: '#fff', fontSize: 15, fontWeight: 500, marginLeft: 22, marginBottom: 0 }}>
                <li><span style={{ color: '#18C964', fontWeight: 700 }}>Accepted:</span> Professional addresses only → @company.com, contact@brand.fr, etc.</li>
                <li><span style={{ color: '#FF2D2D', fontWeight: 700 }}>Rejected:</span> Personal emails → @gmail.com, @yahoo.com, @outlook.com, etc.</li>
              </ul>
            </div>
            <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 17, marginBottom: 6, width: '100%' }}>🛡️ Your email is your key.</div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 500, textAlign: 'center', width: '100%' }}>
              By verifying it, you prove your legitimacy to launch official brand campaigns on Winstory.
            </div>
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
            {redirectMessage}
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