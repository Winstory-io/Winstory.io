'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HackathonWalletConnect from '@/components/HackathonWalletConnect';
import { useRouter } from 'next/navigation';

export default function HackathonModerationLoginPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [chzBalance, setChzBalance] = useState<string>('0');
  const router = useRouter();

  // Nettoyage du cache à chaque arrivée sur la page
  useEffect(() => {
    localStorage.removeItem('hackathonWalletAddress');
    localStorage.removeItem('hackathonChzBalance');
    setIsWalletConnected(false);
    setChzBalance('0');
    setShowSuccess(false);
  }, []);

  // Callback après connexion wallet réussie
  const handleWalletLoginSuccess = (data: { walletAddress: string, chzBalance: string }) => {
    if (!data.walletAddress) return;
    localStorage.setItem('hackathonWalletAddress', data.walletAddress);
    localStorage.setItem('hackathonChzBalance', data.chzBalance);
    setIsWalletConnected(true);
    setChzBalance(data.chzBalance);
    setShowSuccess(true);
    setTimeout(() => {
      router.push('/moderation/hackathon');
    }, 1500);
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('hackathonWalletAddress');
    localStorage.removeItem('hackathonChzBalance');
    setIsWalletConnected(false);
    setChzBalance('0');
    setShowSuccess(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      color: '#fff', 
      fontFamily: 'Inter, sans-serif', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'flex-start', 
      paddingTop: 24 
    }}>
      {/* Encart de succès, remplace tout le reste après connexion */}
      {showSuccess ? (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#181818',
            border: '2px solid #2eea8b',
            borderRadius: 16,
            padding: 40,
            textAlign: 'center',
            color: '#fff',
            maxWidth: 400,
            width: '90%',
            boxShadow: '0 0 32px #000',
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#2eea8b', marginBottom: 16 }}>
              ✅ Authenticated Successfully!
            </div>
            <div style={{ fontSize: 16, marginBottom: 16 }}>
              CHZ Balance: {chzBalance} CHZ<br />
              <small style={{ color: '#FFD600' }}>Chiliz Spicy Testnet</small>
            </div>
            <div style={{ fontSize: 16, marginBottom: 24 }}>
              Redirecting to hackathon moderation...
            </div>
          </div>
        </div>
      ) : (
        // Encart de connexion (visible uniquement si pas connecté)
        <div style={{ 
          width: '100%', 
          maxWidth: 500, 
          margin: '0 auto', 
          marginTop: 32, 
          position: 'relative', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          {/* Custom header for Hackathon Moderation */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            position: 'relative', 
            marginTop: 10, 
            marginBottom: 48, 
            marginLeft: -120 
          }}>
            <img 
              src="/moderation.svg" 
              alt="Moderation Icon" 
              style={{ width: 192, height: 192, marginRight: 32 }} 
            />
            <span style={{ 
              fontSize: 32, 
              fontWeight: 700, 
              color: '#FFD600', 
              letterSpacing: 1, 
              whiteSpace: 'nowrap', 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              Hackathon Moderation
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  marginLeft: 8, 
                  cursor: 'pointer', 
                  fontSize: 32, 
                  padding: 0 
                }} 
                aria-label="Help" 
                onClick={() => { /* TODO: open popup */ }}
              >
                <img 
                  src="/tooltip.svg" 
                  alt="Help" 
                  style={{ 
                    width: 32, 
                    height: 32, 
                    filter: 'drop-shadow(0 0 6px #FFD600)' 
                  }} 
                />
              </button>
            </span>
            <Link 
              href="/welcome" 
              style={{ 
                position: 'absolute', 
                right: -196, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                cursor: 'pointer' 
              }} 
              aria-label="Close"
            >
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
                <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </Link>
          </div>

          {/* Info box for hackathon */}
          <div style={{
            background: '#181818',
            border: '2px solid #FFD600',
            borderRadius: 12,
            padding: 20,
            marginBottom: 32,
            textAlign: 'center',
            maxWidth: 450
          }}>
            <h3 style={{ color: '#FFD600', marginBottom: 16, fontSize: 20 }}>🌶️ Hackathon Special Access</h3>
            <p style={{ color: '#fff', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
              This is a special moderation session for the hackathon.<br />
              You need to authenticate with a wallet containing CHZ tokens on Chiliz Spicy Testnet.
            </p>
            <div style={{
              background: '#2a2a2a',
              padding: 16,
              borderRadius: 8,
              fontSize: 12,
              color: '#ccc',
              textAlign: 'left'
            }}>
              <strong style={{ color: '#FFD600' }}>Requirements:</strong><br />
              • Connect your Web3 wallet<br />
              • Switch to Chiliz Spicy Testnet<br />
              • Have at least 1 CHZ token<br />
              • Verify your identity for moderation access
            </div>
          </div>

          <div style={{ 
            width: '100%', 
            maxWidth: 400, 
            margin: '0 auto', 
            marginTop: 32, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 24 
          }}>
            <HackathonWalletConnect 
              onLoginSuccess={handleWalletLoginSuccess} 
              onLogout={handleLogout} 
            />
          </div>

          {/* Help section */}
          <div style={{
            marginTop: 48,
            padding: 20,
            background: '#1a1a1a',
            borderRadius: 12,
            maxWidth: 450,
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#FFD600', marginBottom: 12 }}>Need Help?</h4>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.5 }}>
              • Get CHZ from Chiliz Spicy Testnet faucet<br />
              • Make sure your wallet is on the correct network<br />
              • Contact hackathon organizers for support
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 