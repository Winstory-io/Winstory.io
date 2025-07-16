'use client';
import React, { useState, useEffect } from 'react';
import WalletConnect from '@/components/WalletConnect';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function IndividualLoginPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [showRedirectArrow, setShowRedirectArrow] = useState(false);
  const router = useRouter();

  // Check if wallet is already connected when page loads
  useEffect(() => {
    const walletAddress = localStorage.getItem("walletAddress");
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
  const handleWalletLoginSuccess = ({ walletAddress }: { walletAddress: string }) => {
    if (!walletAddress) return;
    localStorage.setItem("walletAddress", walletAddress);
    setIsWalletConnected(true);
    setShowRedirectArrow(true);
    // Automatic redirect after 2 seconds
    setTimeout(() => {
      router.push('/creation/individual/yourwinstory');
    }, 2000);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("walletAddress");
    setIsWalletConnected(false);
    setShowRedirectArrow(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 500, margin: '32px auto 32px auto', position: 'relative' }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: '#2eea8b', letterSpacing: 1, whiteSpace: 'nowrap' }}>Creation Individual login</span>
        <Link href="/creation/youare" style={{ marginLeft: 8, cursor: 'pointer', fontSize: 32, color: '#FF2D2D', display: 'flex', alignItems: 'center' }} aria-label="Close">
          ×
        </Link>
      </div>

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
        <WalletConnect
          isWalletLogin={true}
          onLoginSuccess={({ walletAddress }) => handleWalletLoginSuccess({ walletAddress })}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
} 