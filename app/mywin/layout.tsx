"use client";

import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import WalletConnect from '@/components/WalletConnect';
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({
  clientId: "4ddc5eed2e073e550a7307845d10f348",
});

export default function MyWinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const account = useActiveAccount();
  const [showDisconnectMenu, setShowDisconnectMenu] = useState(false);
  const [isForceDisconnected, setIsForceDisconnected] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getActiveStyle = (path: string) => {
    return pathname === path
      ? { background: '#00FF00', color: '#000' }
      : { background: 'none', color: '#00FF00' };
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleForceDisconnect = () => {
    setIsForceDisconnected(true);
    setShowDisconnectMenu(false);
    router.push('/welcome');
  };

  const handleLogout = () => {
    router.push('/welcome');
  };

  const toggleMenu = () => {
    setShowDisconnectMenu(!showDisconnectMenu);
  };

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDisconnectMenu(false);
      }
    };

    if (showDisconnectMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDisconnectMenu]);

  // Réinitialiser l'état de déconnexion forcée si un nouveau compte se connecte
  useEffect(() => {
    if (account) {
      setIsForceDisconnected(false);
    }
  }, [account]);

  // Rediriger vers /welcome quand le wallet se déconnecte
  useEffect(() => {
    // Ne rediriger que si l'utilisateur était précédemment connecté et se déconnecte
    // Pas de redirection automatique au premier chargement
    if (!account && !isForceDisconnected && account !== undefined) {
      router.push('/welcome');
    }
  }, [account, isForceDisconnected, router]);


  // Si pas de compte connecté OU si déconnexion forcée, afficher l'écran d'authentification
  if (!account || isForceDisconnected) {
    return (
      <div style={{ minHeight: '100vh', background: '#000' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh',
          color: '#00FF00',
          textAlign: 'center',
          padding: '24px'
        }}>
          <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>
            Please authenticate to access My Win
          </h1>
          <WalletConnect 
            isBothLogin={true} 
            onLogout={handleLogout}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {/* Fixed Navigation Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          borderBottom: '2px solid #00FF00',
          zIndex: 100,
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          {/* Logo */}
          <button
            onClick={() => router.push('/welcome')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Back to Welcome"
          >
            <Image
              src="/logo.svg"
              alt="Logo Winstory"
              width={48}
              height={48}
              style={{ display: 'block' }}
            />
          </button>

          {/* Navigation Links - Centered */}
          <div style={{ 
            display: 'flex', 
            gap: 16,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            <button
              onClick={() => router.push('/mywin')}
              style={{
                border: '2px solid #00FF00',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14,
                transition: 'all 0.3s ease',
                ...getActiveStyle('/mywin')
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/mywin/creations')}
              style={{
                border: '2px solid #00FF00',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14,
                transition: 'all 0.3s ease',
                ...getActiveStyle('/mywin/creations')
              }}
            >
              My Creations
            </button>
            <button
              onClick={() => router.push('/mywin/moderations')}
              style={{
                border: '2px solid #00FF00',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14,
                transition: 'all 0.3s ease',
                ...getActiveStyle('/mywin/moderations')
              }}
            >
              My Moderations
            </button>
            <button
              onClick={() => router.push('/mywin/completions')}
              style={{
                border: '2px solid #00FF00',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14,
                transition: 'all 0.3s ease',
                ...getActiveStyle('/mywin/completions')
              }}
            >
              My Completions
            </button>
          </div>

          {/* Wallet Address Display */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={toggleMenu}
              style={{
                background: showDisconnectMenu ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 255, 0, 0.1)',
                border: '2px solid #00FF00',
                borderRadius: '20px',
                padding: '8px 16px',
                color: '#00FF00',
                fontWeight: 700,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                background: '#00FF00',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
              {truncateAddress(account.address)}
              <span style={{ 
                fontSize: '12px', 
                transition: 'transform 0.3s ease',
                transform: showDisconnectMenu ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </button>
            
            {/* Simple Disconnect Menu */}
            {showDisconnectMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'rgba(0, 0, 0, 0.95)',
                  border: '2px solid #00FF00',
                  borderRadius: '12px',
                  padding: '16px',
                  minWidth: '200px',
                  zIndex: 1000,
                  boxShadow: '0 4px 20px rgba(0, 255, 0, 0.3)',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  fontSize: '14px',
                  color: '#00FF00',
                  marginBottom: '12px'
                }}>
                  Wallet Connected
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#999',
                  marginBottom: '16px'
                }}>
                  {account.address}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <ConnectButton 
                    client={client}
                    theme="dark"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content with top margin for fixed navigation */}
      <div style={{ paddingTop: '80px' }}>
        {children}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
