'use client';

import React, { useEffect, useState, useRef } from 'react';
import TipBox from '@/components/icons/TipBox';
import CreationIcon from '@/components/icons/CreationIcon';
import ModerationIcon from '@/components/icons/ModerationIcon';
import CompletionIcon from '@/components/icons/CompletionIcon';
import ExplorerIcon from '@/components/icons/ExplorerIcon';
import { useRouter } from 'next/navigation';
import { useWalletAddress } from '@/lib/hooks/useWalletConnection';
import { clearUserCache } from '@/lib/utils';
import { useActiveAccount } from 'thirdweb/react';
import { ConnectButton } from 'thirdweb/react';
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({
  clientId: "4ddc5eed2e073e550a7307845d10f348",
});

export default function Home() {
  const router = useRouter();
  const walletAddress = useWalletAddress();
  const account = useActiveAccount();
  const [showDisconnectMenu, setShowDisconnectMenu] = useState(false);
  const [isForceDisconnected, setIsForceDisconnected] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Nettoyer automatiquement le cache à chaque visite de la page welcome
  useEffect(() => {
    // S'assurer que nous sommes côté client
    if (typeof window !== 'undefined') {
      clearUserCache();
    }
  }, []);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleForceDisconnect = () => {
    // Marquer comme forcément déconnecté
    setIsForceDisconnected(true);
    
    // Fermer le menu
    setShowDisconnectMenu(false);
  };

  const toggleMenu = () => {
    setShowDisconnectMenu(!showDisconnectMenu);
  };

  // Réinitialiser l'état de déconnexion forcée si un nouveau compte se connecte
  useEffect(() => {
    if (account) {
      setIsForceDisconnected(false);
    }
  }, [account]);

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

  // Déterminer si le wallet est connecté (compte en compte la déconnexion forcée)
  const isWalletConnected = account && !isForceDisconnected;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#000',
        color: '#FFD600',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Logo en haut à gauche */}
      <div
        style={{
          position: 'absolute',
          top: 32,
          left: 24,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Home"
        >
          <img
            src="/logo.svg"
            alt="Logo Winstory"
            style={{
              width: '15vw',
              minWidth: 72,
              maxWidth: 180,
              height: 'auto',
              display: 'block',
            }}
          />
        </button>
      </div>

      {/* Zone en haut à droite avec wallet et tooltip */}
      <div
        style={{
          position: 'absolute',
          top: 32,
          right: 32,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Affichage du wallet si connecté, sinon point rouge si déconnecté */}
        {isWalletConnected ? (
          /* Wallet Address Display with Disconnect Menu */
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
            
            {/* Disconnect Menu */}
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
                  padding: '12px',
                  minWidth: '200px',
                  zIndex: 1000,
                  boxShadow: '0 4px 20px rgba(0, 255, 0, 0.3)'
                }}
              >
                <div style={{
                  width: '100%',
                  padding: '8px 0',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#00FF00',
                  textAlign: 'center',
                  marginBottom: '12px'
                }}>
                  Connected Wallet
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ConnectButton 
                    client={client}
                    theme="dark"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Point rouge si déconnecté */
          <div
            style={{
              position: 'relative',
              width: '12px',
              height: '12px',
              background: '#FF0000',
              borderRadius: '50%',
              cursor: 'pointer',
              animation: 'pulse 2s infinite',
              boxShadow: '0 0 10px rgba(255, 0, 0, 0.6)'
            }}
            title="Wallet disconnected"
            onMouseEnter={(e) => {
              // Créer un tooltip hover
              const tooltip = document.createElement('div');
              tooltip.textContent = 'Wallet disconnected';
              tooltip.style.position = 'absolute';
              tooltip.style.bottom = '20px';
              tooltip.style.right = '0';
              tooltip.style.background = 'rgba(0, 0, 0, 0.9)';
              tooltip.style.color = '#FF0000';
              tooltip.style.padding = '4px 8px';
              tooltip.style.borderRadius = '4px';
              tooltip.style.fontSize = '12px';
              tooltip.style.whiteSpace = 'nowrap';
              tooltip.style.zIndex = '1001';
              tooltip.style.border = '1px solid #FF0000';
              e.currentTarget.appendChild(tooltip);
            }}
            onMouseLeave={(e) => {
              const tooltip = e.currentTarget.querySelector('div');
              if (tooltip) {
                e.currentTarget.removeChild(tooltip);
              }
            }}
          />
        )}

        {/* Ampoule tooltip */}
        <div
          style={{
            cursor: 'pointer',
          }}
          onClick={() => router.push('/welcome/tooltip')}
        >
          <TipBox />
        </div>
      </div>

      {/* Styles CSS pour l'animation pulse */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(0, 255, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 255, 0, 0);
          }
        }
      `}</style>

      {/* Actions principales */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 48,
          marginBottom: 80,
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#FFD600',
            fontWeight: 900,
            fontSize: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            cursor: 'pointer',
          }}
          onClick={() => router.push('/creation/youare')}
        >
          <span style={{ fontSize: 56 }}>
            <CreationIcon />
          </span>
          Create Campaign
        </button>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#FFD600',
            fontWeight: 900,
            fontSize: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            cursor: 'pointer',
          }}
          // TODO: restreindre l'accès à /moderation à la possession d'un token spécifique dans le wallet
          onClick={() => router.push('/moderation')}
        >
          <span style={{ fontSize: 56 }}>
            <ModerationIcon />
          </span>
          Moderate
        </button>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#FFD600',
            fontWeight: 900,
            fontSize: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            cursor: 'pointer',
          }}
          onClick={() => router.push('/completion/login')}
        >
          <span style={{ fontSize: 56 }}>
            <CompletionIcon />
          </span>
          Complete Campaign
        </button>
        
        {/* My Win - Positioned separately with green color */}
        <div style={{ 
          position: 'fixed', 
          bottom: '32px', 
          right: '32px', 
          zIndex: 100 
        }}>
          <button
            style={{
              background: '#000',
              border: '3px solid #00FF00',
              borderRadius: '50%',
              width: '120px',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `
                0 0 20px rgba(0, 255, 0, 0.6),
                0 0 40px rgba(0, 255, 0, 0.4),
                0 0 60px rgba(0, 255, 0, 0.2),
                inset 0 0 20px rgba(0, 255, 0, 0.1)
              `,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = `
                0 0 25px rgba(0, 255, 0, 0.8),
                0 0 50px rgba(0, 255, 0, 0.6),
                0 0 75px rgba(0, 255, 0, 0.4),
                inset 0 0 25px rgba(0, 255, 0, 0.2)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = `
                0 0 20px rgba(0, 255, 0, 0.6),
                0 0 40px rgba(0, 255, 0, 0.4),
                0 0 60px rgba(0, 255, 0, 0.2),
                inset 0 0 20px rgba(0, 255, 0, 0.1)
              `;
            }}
            onClick={() => router.push('/mywin')}
          >
            <div style={{
              color: '#00FF00',
              fontWeight: 900,
              fontSize: 24,
              lineHeight: 1,
              textAlign: 'center',
              textShadow: '0 0 10px rgba(0, 255, 0, 0.8)'
            }}>
              <div>My</div>
              <div>Win</div>
            </div>
          </button>
        </div>
      </div>

      {/* Explorer en bas */}
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#FFD600',
            fontWeight: 900,
            fontSize: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            cursor: 'pointer',
          }}
          onClick={() => router.push('/explorer')}
        >
          <span style={{ fontSize: 48 }}>
            <ExplorerIcon />
          </span>
          Explorer
        </button>
      </div>
    </div>
  );
}
