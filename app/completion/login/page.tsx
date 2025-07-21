'use client';
import React, { useEffect } from 'react';
import LoginHeader from '@/components/LoginHeader';
import LoginButton from '@/components/LoginButton';
import Link from 'next/link';
import WalletConnect from '@/components/WalletConnect';
import { useRouter } from 'next/navigation';

export default function CompletionLoginPage() {
  const router = useRouter();
  const handleLoginSuccess = () => {
    router.push('/completion');
  };

  useEffect(() => {
    // Vérifie si l'utilisateur est déjà connecté (wallet ou email)
    const walletAddress = localStorage.getItem('walletAddress');
    const user = localStorage.getItem('user');
    if (walletAddress || user) {
      router.push('/completion');
    }
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', marginTop: 32, position: 'relative' }}>
        {/* Custom header for Completion */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 40, marginBottom: 48, width: '100%', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          <img src="/individual.svg" alt="Individual Icon" style={{ width: 96, height: 96, marginRight: 24 }} />
          <span style={{ fontSize: 32, fontWeight: 700, color: '#2eea8b', letterSpacing: 1, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
            Completion login
            <button style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer', fontSize: 32, padding: 0 }} aria-label="Help" onClick={() => { }}>
              <img src="/tooltip.svg" alt="Help" style={{ width: 32, height: 32 }} />
            </button>
          </span>
          <Link href="/welcome" style={{ position: 'absolute', right: -122, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} aria-label="Close">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
              <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
        {/* Remplacement des deux boutons par WalletConnect */}
        <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
          <WalletConnect isBothLogin={true} onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
} 