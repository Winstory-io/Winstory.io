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
import { useActiveAccount, useDisconnect, ConnectButton } from 'thirdweb/react';
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({
  clientId: "4ddc5eed2e073e550a7307845d10f348",
});

export default function Home() {
  const router = useRouter();
  const walletAddress = useWalletAddress();
  const account = useActiveAccount();
  const { disconnect, isDisconnecting } = useDisconnect();
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

  // Gestionnaire d'erreur global pour capturer les erreurs de déconnexion
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Si l'erreur concerne la déconnexion, on la gère silencieusement
      if (event.message && (event.message.includes('logout') || event.message.includes('disconnect') || event.message.includes('Failed to logout'))) {
        console.warn('⚠️ [WELCOME] Logout/disconnect error caught and handled:', event.message);
        event.preventDefault();
        return true;
      }
      return false;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Si l'erreur concerne la déconnexion, on la gère silencieusement
      const errorMessage = event.reason?.message || String(event.reason || '');
      if (errorMessage.includes('logout') || errorMessage.includes('disconnect') || errorMessage.includes('Failed to logout')) {
        console.warn('⚠️ [WELCOME] Logout/disconnect promise rejection caught and handled:', errorMessage);
        event.preventDefault();
        return true;
      }
      return false;
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleForceDisconnect = async () => {
    try {
      // Essayer de déconnecter proprement via thirdweb
      if (account && !isDisconnecting) {
        try {
          await disconnect();
        } catch (disconnectError) {
          // Si la déconnexion thirdweb échoue, on continue avec la déconnexion forcée locale
          console.warn('⚠️ [WELCOME] Thirdweb disconnect failed (using force disconnect):', disconnectError);
        }
      }
    } catch (error) {
      // Si une erreur survient, on continue quand même
      console.warn('⚠️ [WELCOME] Error during disconnect attempt (continuing anyway):', error);
    } finally {
      // Toujours marquer comme déconnecté et nettoyer, même si la déconnexion thirdweb a échoué
      setIsForceDisconnected(true);
      
      // Nettoyer le cache local
      if (typeof window !== 'undefined') {
        clearUserCache();
        // Nettoyer aussi les données de modération
        const wallet = account?.address || '';
        if (wallet) {
          const storageKey = `winstory_moderation_voted_${wallet}`;
          localStorage.removeItem(storageKey);
        }
        
        // Persister l'état de déconnexion forcée dans localStorage
        localStorage.setItem('winstory_force_disconnected', 'true');
        localStorage.setItem('winstory_force_disconnected_timestamp', Date.now().toString());
        
        // Nettoyer toutes les clés thirdweb possibles
        const thirdwebKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('thirdweb') || key.includes('wallet') || key.includes('auth'))) {
            thirdwebKeys.push(key);
          }
        }
        thirdwebKeys.forEach(key => localStorage.removeItem(key));
      }
      
      // Fermer le menu
      setShowDisconnectMenu(false);
    }
  };

  const toggleMenu = () => {
    setShowDisconnectMenu(!showDisconnectMenu);
  };

  // Charger l'état de déconnexion forcée depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const forceDisconnected = localStorage.getItem('winstory_force_disconnected') === 'true';
      if (forceDisconnected) {
        setIsForceDisconnected(true);
      }
    }
  }, []);

  // Réinitialiser l'état de déconnexion forcée si un nouveau compte se connecte
  useEffect(() => {
    if (account) {
      setIsForceDisconnected(false);
      // Nettoyer le flag de déconnexion forcée quand on se reconnecte
      if (typeof window !== 'undefined') {
        localStorage.removeItem('winstory_force_disconnected');
        localStorage.removeItem('winstory_force_disconnected_timestamp');
      }
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
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
            filter: 'drop-shadow(0 0 5px rgba(255, 214, 0, 0.3))',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(255, 214, 0, 0.7))';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'drop-shadow(0 0 5px rgba(255, 214, 0, 0.3))';
            e.currentTarget.style.transform = 'scale(1)';
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
                  <div
                    onError={(e) => {
                      // Gérer silencieusement les erreurs de déconnexion
                      console.warn('⚠️ [WELCOME] ConnectButton error (handled):', e);
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <ConnectButton 
                      client={client}
                      theme="dark"
                      onConnect={() => {
                        setIsForceDisconnected(false);
                        setShowDisconnectMenu(false);
                      }}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleForceDisconnect();
                    }}
                    style={{
                      background: 'rgba(255, 0, 0, 0.1)',
                      border: '2px solid #FF0000',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      color: '#FF0000',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      marginTop: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 0, 0, 0.1)';
                    }}
                  >
                    Force Disconnect
                  </button>
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
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
            filter: 'drop-shadow(0 0 5px rgba(255, 214, 0, 0.3))',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.filter = 'drop-shadow(0 0 20px rgba(255, 214, 0, 0.8))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'drop-shadow(0 0 5px rgba(255, 214, 0, 0.3))';
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
            transition: 'all 0.3s ease',
            textShadow: '0 0 10px rgba(255, 214, 0, 0.5)',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFF8DC';
            e.currentTarget.style.textShadow = '0 0 20px rgba(255, 214, 0, 0.8), 0 0 40px rgba(255, 214, 0, 0.6), 0 0 60px rgba(255, 214, 0, 0.4)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(255, 214, 0, 0.7))';
            // Appliquer l'effet de luminescence à l'icône Creation
            const icon = e.currentTarget.querySelector('img');
            if (icon) {
              icon.style.filter = 'drop-shadow(0 0 20px rgba(255, 214, 0, 0.9)) brightness(1.2)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#FFD600';
            e.currentTarget.style.textShadow = '0 0 10px rgba(255, 214, 0, 0.5)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'none';
            // Restaurer l'effet normal de l'icône
            const icon = e.currentTarget.querySelector('img');
            if (icon) {
              icon.style.filter = 'drop-shadow(0 0 10px rgba(255, 214, 0, 0.6))';
            }
          }}
          onClick={() => router.push('/creation/youare')}
        >
          <span style={{ fontSize: 56, marginLeft: -29, transition: 'all 0.3s ease' }}>
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
            transition: 'all 0.3s ease',
            textShadow: '0 0 10px rgba(255, 214, 0, 0.5)',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFF8DC';
            e.currentTarget.style.textShadow = '0 0 20px rgba(255, 214, 0, 0.8), 0 0 40px rgba(255, 214, 0, 0.6), 0 0 60px rgba(255, 214, 0, 0.4)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(255, 214, 0, 0.7))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#FFD600';
            e.currentTarget.style.textShadow = '0 0 10px rgba(255, 214, 0, 0.5)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'none';
          }}
          // TODO: restreindre l'accès à /moderation à la possession d'un token spécifique dans le wallet
          onClick={() => router.push('/moderation')}
        >
          <span style={{ fontSize: 56, marginLeft: -201, transition: 'all 0.3s ease' }}>
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
            transition: 'all 0.3s ease',
            textShadow: '0 0 10px rgba(255, 214, 0, 0.5)',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFF8DC';
            e.currentTarget.style.textShadow = '0 0 20px rgba(255, 214, 0, 0.8), 0 0 40px rgba(255, 214, 0, 0.6), 0 0 60px rgba(255, 214, 0, 0.4)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(255, 214, 0, 0.7))';
            // Appliquer l'effet de luminescence à l'icône Completion
            const icon = e.currentTarget.querySelector('img');
            if (icon) {
              icon.style.filter = 'drop-shadow(0 0 20px rgba(255, 214, 0, 0.9)) brightness(1.2)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#FFD600';
            e.currentTarget.style.textShadow = '0 0 10px rgba(255, 214, 0, 0.5)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'none';
            // Restaurer l'effet normal de l'icône
            const icon = e.currentTarget.querySelector('img');
            if (icon) {
              icon.style.filter = 'drop-shadow(0 0 10px rgba(255, 214, 0, 0.6))';
            }
          }}
          onClick={() => router.push('/completion/login')}
        >
          <span style={{ fontSize: 56, transition: 'all 0.3s ease', marginLeft: -18 }}>
            <CompletionIcon />
          </span>
          <span style={{ marginLeft: -35 }}>Complete Campaign</span>
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
            transition: 'all 0.3s ease',
            textShadow: '0 0 10px rgba(255, 214, 0, 0.5)',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFF8DC';
            e.currentTarget.style.textShadow = '0 0 20px rgba(255, 214, 0, 0.8), 0 0 40px rgba(255, 214, 0, 0.6), 0 0 60px rgba(255, 214, 0, 0.4)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(255, 214, 0, 0.7))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#FFD600';
            e.currentTarget.style.textShadow = '0 0 10px rgba(255, 214, 0, 0.5)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'none';
          }}
          onClick={() => router.push('/explorer')}
        >
          <span style={{ fontSize: 48, transition: 'all 0.3s ease' }}>
            <ExplorerIcon />
          </span>
          Explorer
        </button>
      </div>
    </div>
  );
}
