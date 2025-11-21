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
import { useActiveAccount, useActiveWallet, useDisconnect, ConnectButton } from 'thirdweb/react';
import { createThirdwebClient } from "thirdweb";
import ExplorerContent from '@/components/ExplorerContent';

const client = createThirdwebClient({
  clientId: "4ddc5eed2e073e550a7307845d10f348",
});

export default function Home() {
  const router = useRouter();
  const walletAddress = useWalletAddress();
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const [showDisconnectMenu, setShowDisconnectMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isHoveringStickyBar, setIsHoveringStickyBar] = useState(false);

  // Track scroll progress for smooth transitions
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      // Calculate progress from 0 to 1 based on first viewport scroll
      const progress = Math.min(scrollY / windowHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      console.log('🔒 [WELCOME] Starting force disconnect...');

      // Nettoyer le cache local AVANT de déconnecter
      if (typeof window !== 'undefined') {
        clearUserCache();

        // Nettoyer les données de modération
        const wallet = account?.address || '';
        if (wallet) {
          const storageKey = `winstory_moderation_voted_${wallet}`;
          localStorage.removeItem(storageKey);
        }

        // Nettoyer TOUTES les clés thirdweb dans localStorage
        const thirdwebLocalKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('thirdweb') ||
            key.includes('walletconnect') ||
            key.includes('WALLETCONNECT') ||
            key.includes('-walletLink') ||
            key.includes('wagmi') ||
            key.includes('wallet') && !key.includes('winstory')
          )) {
            thirdwebLocalKeys.push(key);
          }
        }
        console.log('🧹 [WELCOME] Cleaning localStorage keys:', thirdwebLocalKeys);
        thirdwebLocalKeys.forEach(key => localStorage.removeItem(key));

        // Nettoyer TOUTES les clés thirdweb dans sessionStorage
        const thirdwebSessionKeys: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (
            key.includes('thirdweb') ||
            key.includes('walletconnect') ||
            key.includes('WALLETCONNECT') ||
            key.includes('-walletLink') ||
            key.includes('wagmi') ||
            key.includes('wallet')
          )) {
            thirdwebSessionKeys.push(key);
          }
        }
        console.log('🧹 [WELCOME] Cleaning sessionStorage keys:', thirdwebSessionKeys);
        thirdwebSessionKeys.forEach(key => sessionStorage.removeItem(key));
      }

      // Ensuite déconnecter via thirdweb
      if (wallet && disconnect) {
        try {
          disconnect(wallet);
          console.log('✅ [WELCOME] ThirdWeb disconnect successful');
        } catch (disconnectError) {
          console.warn('⚠️ [WELCOME] ThirdWeb disconnect failed:', disconnectError);
        }
      }

      console.log('✅ [WELCOME] Force disconnect completed');
    } catch (error) {
      console.error('❌ [WELCOME] Error during force disconnect:', error);
    } finally {
      // Fermer le menu
      setShowDisconnectMenu(false);

      // Forcer un refresh de la page pour s'assurer que tout est nettoyé
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
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

  // Déterminer si le wallet est connecté
  const isWalletConnected = !!account;


  // Calculate dynamic styles based on scroll progress
  const isSticky = scrollProgress > 0.05;
  const explorerOpacity = scrollProgress > 0 ? 0 : 1; // Disappear immediately on scroll

  return (
    <div
      style={{
        minHeight: '200vh', // Two sections: Welcome + Explorer
        width: '100vw',
        background: '#000',
        color: '#FFD600',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
      }}
    >
      {/* Welcome Section - First viewport */}
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Logo en haut à gauche - Fixed position */}
        {!isVideoPlaying && (
          <div
            style={{
              position: 'fixed',
              top: 32,
              left: 24,
              zIndex: 9999,
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
        )}

        {/* Zone en haut à droite avec wallet et tooltip - Fixed position */}
        {!isVideoPlaying && (
          <div
            style={{
              position: 'fixed',
              top: 32,
              right: 32,
              zIndex: 9999,
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
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ConnectButton styled as red dot when disconnected */
              /* ConnectButton styled as red dot when disconnected */
              /* ConnectButton styled as red dot when disconnected */
              <div
                style={{ position: 'relative', display: 'inline-block' }}
                onMouseEnter={(e) => {
                  // Create a temporary tooltip element just for the hover effect
                  const tooltip = document.getElementById('wallet-tooltip-temp');
                  if (!tooltip) {
                    const newTooltip = document.createElement('div');
                    newTooltip.textContent = 'Wallet disconnected';
                    newTooltip.id = 'wallet-tooltip-temp';
                    newTooltip.style.position = 'absolute';
                    newTooltip.style.bottom = '-30px';
                    newTooltip.style.right = '0';
                    newTooltip.style.background = 'rgba(0, 0, 0, 0.9)';
                    newTooltip.style.color = '#FF0000';
                    newTooltip.style.padding = '4px 8px';
                    newTooltip.style.borderRadius = '4px';
                    newTooltip.style.fontSize = '12px';
                    newTooltip.style.whiteSpace = 'nowrap';
                    newTooltip.style.zIndex = '1001';
                    newTooltip.style.border = '1px solid #FF0000';
                    // Append to body to avoid being clipped or removed with the parent if we want it to persist slightly, 
                    // BUT here we want it to disappear when parent disappears.
                    // Actually, let's stick to appending to currentTarget but ensure we clean up on unmount.
                    // Better yet, let's use a React portal or just conditional rendering if possible.
                    // Given the constraints and previous issues, let's try a pure React approach for the tooltip if possible,
                    // but since I can't easily add state to this component without rewriting a lot, I will improve the DOM logic.

                    // FIX: The issue is likely that when the component unmounts (on connect), onMouseLeave doesn't fire.
                    // We should check if the tooltip exists and remove it in the useEffect cleanup or just ensure it's a child.
                    // If it's a child, it should be removed when parent is removed.
                    // The user saw it persist. This implies it wasn't a child or the parent wasn't removed.
                    // Ah, I see I used e.currentTarget.appendChild.

                    // Let's try a different approach: Use a ref to track the tooltip and remove it on unmount.
                    // Or simpler: Just use a title attribute? No, user wants custom style.

                    // Let's use a unique ID and remove it globally if it exists.
                    const existing = document.getElementById('wallet-tooltip-temp');
                    if (existing) existing.remove();

                    // Append to the container
                    // e.currentTarget.appendChild(newTooltip); 
                    // Wait, if I append to currentTarget, and currentTarget is removed, tooltip is removed.
                    // Why did it persist?
                    // Maybe the parent container (the fixed div) was the currentTarget?
                    // No, I put it on the div inside the else block.

                    // Let's try appending to the button's container and give it a unique ID that we aggressively clean up.
                    e.currentTarget.appendChild(newTooltip);
                  }
                }}
                onMouseLeave={(e) => {
                  const tooltip = e.currentTarget.querySelector('#wallet-tooltip-temp');
                  if (tooltip) {
                    tooltip.remove();
                  }
                }}
                // Add a ref callback to clean up on unmount
                ref={(node) => {
                  if (!node) {
                    // Component unmounting
                    const tooltip = document.getElementById('wallet-tooltip-temp');
                    if (tooltip) tooltip.remove();
                  }
                }}
              >
                <ConnectButton
                  client={client}
                  theme="dark"
                  connectButton={{
                    label: " ",
                    style: {
                      width: '12px',
                      height: '12px',
                      background: '#FF0000',
                      borderRadius: '50%',
                      minWidth: 'unset',
                      padding: 0,
                      border: 'none',
                      animation: 'pulse 2s infinite',
                      boxShadow: '0 0 10px rgba(255, 0, 0, 0.6)',
                      fontSize: '0px',
                      color: 'transparent',
                      overflow: 'hidden',
                    }
                  }}
                  connectModal={{
                    size: "compact",
                    title: "Connect to Winstory",
                  }}
                />
              </div>
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
        )}

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

        {/* Actions principales - Sticky Navigation Bar */}
        {!isVideoPlaying && (
          <div
            onMouseEnter={() => setIsHoveringStickyBar(true)}
            onMouseLeave={() => setIsHoveringStickyBar(false)}
            style={{
              position: isSticky ? 'fixed' : 'absolute',
              top: isSticky ? '24px' : '50%',
              left: '50%',
              transform: isSticky
                ? 'translate(-50%, 0)'
                : 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: isSticky ? 'row' : 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isSticky ? 40 : 48,
              marginBottom: isSticky ? 0 : 80,
              zIndex: 10000,
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'auto',
              background: isSticky ? 'rgba(0, 0, 0, 0.72)' : 'transparent',
              backdropFilter: isSticky ? 'blur(20px) saturate(180%)' : 'none',
              WebkitBackdropFilter: isSticky ? 'blur(20px) saturate(180%)' : 'none',
              padding: isSticky ? '24px 56px' : '0',
              borderRadius: isSticky ? '80px' : '0',
              border: isSticky
                ? isHoveringStickyBar
                  ? '1px solid rgba(255, 214, 0, 0.8)'
                  : '1px solid rgba(255, 214, 0, 0.4)'
                : 'none',
              boxShadow: isSticky
                ? isHoveringStickyBar
                  ? '0 8px 32px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 214, 0, 0.4), 0 0 40px rgba(255, 214, 0, 0.2)'
                  : '0 8px 32px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : 'none',
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
                gap: isSticky ? 0 : 24,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textShadow: '0 0 10px rgba(255, 214, 0, 0.5)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFF8DC';
                e.currentTarget.style.textShadow = '0 0 20px rgba(255, 214, 0, 0.8), 0 0 40px rgba(255, 214, 0, 0.6), 0 0 60px rgba(255, 214, 0, 0.4)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(255, 214, 0, 0.7))';
                // Grossir l'icône
                const icon = e.currentTarget.querySelector('span');
                if (icon) {
                  icon.style.transform = isSticky ? 'scale(1.2)' : 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#FFD600';
                e.currentTarget.style.textShadow = '0 0 10px rgba(255, 214, 0, 0.5)';
                e.currentTarget.style.filter = 'none';
                // Restaurer la taille de l'icône
                const icon = e.currentTarget.querySelector('span');
                if (icon) {
                  icon.style.transform = 'scale(1)';
                }
              }}
              onClick={() => router.push('/creation/youare')}
            >
              <span style={{
                fontSize: 56,
                marginLeft: isSticky ? 0 : 10,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                transform: 'scale(1)',
              }}>
                <CreationIcon />
              </span>
              {!isSticky && 'Create'}
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
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFF8DC';
                e.currentTarget.style.textShadow = '0 0 20px rgba(255, 214, 0, 0.8), 0 0 40px rgba(255, 214, 0, 0.6), 0 0 60px rgba(255, 214, 0, 0.4)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(255, 214, 0, 0.7))';
                // Grossir les deux icônes ensemble
                const iconsWrapper = e.currentTarget.querySelector('div');
                if (iconsWrapper && isSticky) {
                  iconsWrapper.style.transform = 'scale(1.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#FFD600';
                e.currentTarget.style.textShadow = '0 0 10px rgba(255, 214, 0, 0.5)';
                e.currentTarget.style.filter = 'none';
                // Restaurer la taille des icônes
                const iconsWrapper = e.currentTarget.querySelector('div');
                if (iconsWrapper && isSticky) {
                  iconsWrapper.style.transform = 'scale(1)';
                }
              }}
              // TODO: restreindre l'accès à /moderation à la possession d'un token spécifique dans le wallet
              onClick={() => router.push('/moderation')}
            >
              {isSticky ? (
                // Mode sticky : icônes très proches
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'scale(1)',
                }}>
                  <img
                    src="/refuse.svg"
                    alt="Refuse"
                    style={{
                      height: '150px',
                      width: 'auto',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: 'drop-shadow(0 0 10px rgba(255, 214, 0, 0.6))'
                    }}
                  />
                  <img
                    src="/valid.svg"
                    alt="Valid"
                    style={{
                      height: '150px',
                      width: 'auto',
                      marginLeft: '-75px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: 'drop-shadow(0 0 10px rgba(255, 214, 0, 0.6))'
                    }}
                  />
                </div>
              ) : (
                // Mode normal : disposition d'origine
                <>
                  <img
                    src="/refuse.svg"
                    alt="Refuse"
                    style={{
                      height: '150px',
                      width: 'auto',
                      marginLeft: '222px',
                      transition: 'all 0.3s ease',
                      filter: 'drop-shadow(0 0 10px rgba(255, 214, 0, 0.6))'
                    }}
                  />
                  Moderate
                  <img
                    src="/valid.svg"
                    alt="Valid"
                    style={{
                      height: '150px',
                      width: 'auto',
                      transition: 'all 0.3s ease',
                      filter: 'drop-shadow(0 0 10px rgba(255, 214, 0, 0.6))'
                    }}
                  />
                </>
              )}
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
                gap: isSticky ? 0 : 24,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textShadow: '0 0 10px rgba(255, 214, 0, 0.5)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFF8DC';
                e.currentTarget.style.textShadow = '0 0 20px rgba(255, 214, 0, 0.8), 0 0 40px rgba(255, 214, 0, 0.6), 0 0 60px rgba(255, 214, 0, 0.4)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(255, 214, 0, 0.7))';
                // Grossir l'icône
                const icon = e.currentTarget.querySelector('span');
                if (icon) {
                  icon.style.transform = isSticky ? 'scale(1.2)' : 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#FFD600';
                e.currentTarget.style.textShadow = '0 0 10px rgba(255, 214, 0, 0.5)';
                e.currentTarget.style.filter = 'none';
                // Restaurer la taille de l'icône
                const icon = e.currentTarget.querySelector('span');
                if (icon) {
                  icon.style.transform = 'scale(1)';
                }
              }}
              onClick={() => router.push('/completion/login')}
            >
              <span style={{
                fontSize: 56,
                marginLeft: isSticky ? 0 : -18,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                transform: 'scale(1)',
              }}>
                <CompletionIcon />
              </span>
              {!isSticky && <span style={{ marginLeft: -35 }}>Complete</span>}
            </button>

            {/* My Win - Only visible in sticky bar */}
            {isSticky && (
              <button
                style={{
                  background: '#000',
                  border: '3px solid #00FF00',
                  borderRadius: '50%',
                  width: '100px',
                  height: '100px',
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
                  transition: 'all 0.3s ease',
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
                  fontSize: 20,
                  lineHeight: 1,
                  textAlign: 'center',
                  textShadow: '0 0 10px rgba(0, 255, 0, 0.8)',
                }}>
                  <div>My</div>
                  <div>Win</div>
                </div>
              </button>
            )}
          </div>
        )}

        {/* My Win - Fixed bottom right (only visible when not sticky) */}
        {!isSticky && !isVideoPlaying && (
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
        )}

        {/* Explorer en bas - Fades out on scroll */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            opacity: explorerOpacity,
            pointerEvents: explorerOpacity > 0.1 ? 'auto' : 'none',
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
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
            onClick={() => {
              // Navigate to Explorer page
              router.push('/explorer');
            }}
          >
            <span style={{ fontSize: 48, transition: 'all 0.3s ease' }}>
              <ExplorerIcon />
            </span>
            Explorer
          </button>
        </div>
      </div>

      {/* Explorer Section - Second viewport */}
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          background: '#000',
          paddingTop: isSticky ? '120px' : '0px', // Add padding when sticky bar is active
          transition: 'padding-top 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <ExplorerContent
          hideHeader={false}
          onVideoPlayingChange={setIsVideoPlaying}
        />
      </div>
    </div>
  );
}
