'use client';
import React, { useState, useEffect } from 'react';
import LoginButton from '@/components/LoginButton';
import WalletConnect from '@/components/WalletConnect';
import Link from 'next/link';
import EmailAuth from '@/components/EmailAuth';
import { useRouter } from 'next/navigation';

export default function IndividualLoginPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [isEmailConnected, setIsEmailConnected] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [showRedirectArrow, setShowRedirectArrow] = useState(false);
  const router = useRouter();

  // Check if user is already connected when page loads
  useEffect(() => {
    const user = localStorage.getItem("user");
    const walletAddress = localStorage.getItem("walletAddress");

    if (user) {
      setIsEmailConnected(true);
    }

    if (walletAddress) {
      setIsWalletConnected(true);
      setShowRedirectArrow(true);
      // Automatic redirect after 2 seconds
      setTimeout(() => {
        router.push('/creation/individual/yourwinstory');
      }, 2000);
    }
  }, [router]);

  // Function to call after successful wallet connection
  const handleWalletLoginSuccess = (address: string) => {
    if (!address) return;
    localStorage.setItem("walletAddress", address);
    setIsWalletConnected(true);
    setShowRedirectArrow(true);
    // Automatic redirect after 2 seconds
    setTimeout(() => {
      router.push('/creation/individual/yourwinstory');
    }, 2000);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    localStorage.removeItem("walletAddress");
    setIsEmailConnected(false);
    setIsWalletConnected(false);
    setShowRedirectArrow(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 500, margin: '32px auto 32px auto', position: 'relative' }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: '#2eea8b', letterSpacing: 1, whiteSpace: 'nowrap' }}>Creation Individual login</span>
        <button onClick={() => setShowPopup(true)} style={{ background: 'none', border: 'none', marginLeft: 16, marginRight: 8, cursor: 'pointer', padding: 0 }} aria-label="Help">
          <img src="/tooltip.svg" alt="Help" style={{ width: 32, height: 32, filter: 'drop-shadow(0 0 6px #FFD600)' }} />
        </button>
        <Link href="/creation/youare" style={{ marginLeft: 8, cursor: 'pointer', fontSize: 32, color: '#FF2D2D', display: 'flex', alignItems: 'center' }} aria-label="Close">
          ×
        </Link>
      </div>

      {showPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#181818', border: '2px solid #FFD600', borderRadius: 12, padding: 32, color: '#fff', position: 'relative' }}>
            <button onClick={() => setShowPopup(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#FF5252', fontSize: 28, cursor: 'pointer' }}>×</button>
            <div>Popup to be configured later</div>
          </div>
        </div>
      )}

      {/* Successful connection message with green arrow */}
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
            Wallet connected !
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
        {/* Message if connected with professional email */}
        {isEmailConnected && (
          <div style={{
            background: '#181818',
            border: '2px solid #FFD600',
            borderRadius: 12,
            padding: 16,
            color: '#fff',
            textAlign: 'center',
            width: '100%'
          }}>
            <div style={{ color: '#FFD600', marginBottom: 8, fontWeight: 600 }}>
              Connected with professional email
            </div>
            <div style={{ fontSize: 14, color: '#ccc', marginBottom: 12 }}>
              You need to connect with your wallet to continue
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: 'none',
                background: '#FF2D2D',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Disconnect
            </button>
          </div>
        )}

        <WalletConnect
          isWalletLogin={true}
          onLoginSuccess={handleWalletLoginSuccess}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
} 