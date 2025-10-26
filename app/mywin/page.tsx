"use client";

import { useActiveAccount } from 'thirdweb/react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CreationIcon from '@/components/icons/CreationIcon';
import CompletionIcon from '@/components/icons/CompletionIcon';
import MyWinIntroModal from '@/components/MyWin/MyWinIntroModal';
import Image from 'next/image';

interface DashboardStats {
  creations: number;
  completions: number;
  moderations: number;
  totalWinc: number;
  totalXp: number;
  xpBalance?: {
    total_xp: number;
    current_level: number;
    xp_to_next_level: number;
    xp_in_current_level: number;
  };
}

export default function MyWinPage() {
  const account = useActiveAccount();
  const [showIntro, setShowIntro] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Commencer en mode chargement
  const [stats, setStats] = useState<DashboardStats>({
    creations: 0,
    completions: 0,
    moderations: 0,
    totalWinc: 0,
    totalXp: 0,
  });
  const router = useRouter();

  // Utiliser useCallback pour éviter les re-créations de fonction
  const fetchUserStats = useCallback(async () => {
    if (!account) return; // Guard clause
    
    setIsLoading(true); // Commencer le chargement
    try {
      console.log('Fetching user stats for wallet:', account.address);
      
      // D'abord, vérifier si l'utilisateur existe et l'initialiser si nécessaire
      const checkResponse = await fetch(`/api/user/initialize?walletAddress=${account.address}`);
      
      if (!checkResponse.ok) {
        throw new Error('Failed to check user status');
      }
      
      const checkResult = await checkResponse.json();
      
      if (!checkResult.userExists) {
        console.log('🆕 New user detected, initializing...');
        
        // Initialiser l'utilisateur
        const initResponse = await fetch('/api/user/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: account.address,
            email: null, // TODO: Récupérer l'email si disponible
            displayName: `User_${account.address.slice(-6)}`
          }),
        });
        
        if (!initResponse.ok) {
          console.warn('⚠️ Failed to initialize user, continuing to fetch stats anyway');
        }
        
        const initResult = await initResponse.json();
        console.log('✅ User initialized:', initResult.message);
      } else {
        console.log('✅ Existing user found');
      }
      
      // Maintenant récupérer les statistiques
      const response = await fetch(`/api/user/stats?walletAddress=${account.address}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setStats({
          creations: result.stats.creations,
          completions: result.stats.completions,
          moderations: result.stats.moderations,
          totalWinc: result.stats.totalWinc,
          totalXp: result.stats.totalXp,
          xpBalance: result.stats.xpBalance
        });
        
        console.log('✅ User stats loaded:', result.stats);
        console.log('🎮 XP Balance:', result.stats.xpBalance);
      } else {
        throw new Error(result.error || 'Failed to fetch user stats');
      }
      
    } catch (error) {
      console.error('Error fetching user stats:', error);
      
      // Fallback avec des valeurs par défaut en cas d'erreur
      setStats({
        creations: 0,
        completions: 0,
        moderations: 0,
        totalWinc: 0,
        totalXp: 0,
        xpBalance: {
          total_xp: 0,
          current_level: 1,
          xp_to_next_level: 100,
          xp_in_current_level: 0
        }
      });
    } finally {
      setIsLoading(false); // Fin du chargement dans tous les cas
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      fetchUserStats();
      
      // Définir l'intervalle de rafraîchissement
      const intervalId = setInterval(fetchUserStats, 30000); // Rafraîchir toutes les 30 secondes
      
      // Nettoyer l'intervalle lors du démontage
      return () => clearInterval(intervalId);
    }
  }, [account, fetchUserStats]);

  // Le layout gère déjà l'authentification, pas besoin de vérifier ici
  if (!account) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      background: '#000', 
      color: '#00FF00',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48, marginTop: 32 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 16,
          marginBottom: 1
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 900, 
            color: '#00FF00',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            letterSpacing: '1px',
          }}>
            My Win
            <button
              onClick={() => setShowIntro(true)}
              style={{
                background: 'rgba(0, 255, 0, 0.1)',
                border: '2px solid rgba(0, 255, 0, 0.3)',
                borderRadius: '50%',
                padding: 8,
                marginLeft: 12,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 0, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.6)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Image
                src="/tooltip.svg"
                alt="Info"
                width={28}
                height={28}
                style={{ display: 'inline-block', verticalAlign: 'middle' }}
              />
            </button>
          </h1>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 32, 
        marginBottom: 48,
        maxWidth: '1200px',
        width: '100%',
        padding: '0 24px'
      }}>
        {/* My Creations */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #00FF00',
          borderRadius: '16px',
          padding: '40px 32px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          minHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onClick={() => router.push('/mywin/creations')}
        >
          {/* Loading overlay */}
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid rgba(0, 255, 0, 0.2)',
                borderTop: '4px solid #00FF00',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          )}
          
          <div style={{ fontSize: '56px', marginBottom: '24px' }}>
            <CreationIcon />
          </div>
          <h3 style={{ color: '#00FF00', fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>
            My Creations
          </h3>
          <p style={{ color: '#fff', fontSize: '20px', marginBottom: '24px' }}>
            {stats.creations} campaigns created
          </p>
          <button style={{
            background: '#00FF00',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '14px 28px',
            fontSize: '18px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#00CC00';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#00FF00';
          }}
          >
            View More
          </button>
        </div>

        {/* My Moderations */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #00FF00',
          borderRadius: '16px',
          padding: '40px 32px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          minHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onClick={() => router.push('/mywin/moderations')}
        >
          {/* Loading overlay */}
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid rgba(0, 255, 0, 0.2)',
                borderTop: '4px solid #00FF00',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          )}
          
          <div style={{ fontSize: '56px', marginBottom: '24px' }}>
            <img
              src="/moderation.svg"
              alt="Moderation Icon"
              width="112"
              height="112"
              style={{ display: 'block', margin: '0 auto' }}
            />
          </div>
          <h3 style={{ color: '#00FF00', fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>
            My Moderations
          </h3>
          <p style={{ color: '#fff', fontSize: '20px', marginBottom: '24px' }}>
            {stats.moderations} contents moderated
          </p>
          <button style={{
            background: '#00FF00',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '14px 28px',
            fontSize: '18px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#00CC00';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#00FF00';
          }}
          >
            View More
          </button>
        </div>

        {/* My Completions */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #00FF00',
          borderRadius: '16px',
          padding: '40px 32px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          minHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onClick={() => router.push('/mywin/completions')}
        >
          {/* Loading overlay */}
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid rgba(0, 255, 0, 0.2)',
                borderTop: '4px solid #00FF00',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          )}
          
          <div style={{ fontSize: '56px', marginBottom: '24px' }}>
            <CompletionIcon />
          </div>
          <h3 style={{ color: '#00FF00', fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>
            My Completions
          </h3>
          <p style={{ color: '#fff', fontSize: '20px', marginBottom: '24px' }}>
            {stats.completions} campaigns completed
          </p>
          <button style={{
            background: '#00FF00',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '14px 28px',
            fontSize: '18px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#00CC00';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#00FF00';
          }}
          >
            View More
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: 24, 
        maxWidth: 600, 
        margin: '0 auto' 
      }}>
        <div style={{
          background: 'rgba(0, 255, 0, 0.1)',
          border: '2px solid #00FF00',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', fontWeight: 900, color: '#00FF00', marginBottom: '8px' }}>
            {stats.totalWinc}
          </div>
          <div style={{ color: '#fff', fontSize: '16px' }}>$WINC Earned</div>
        </div>
        <div style={{
          background: 'rgba(0, 255, 0, 0.1)',
          border: '2px solid #00FF00',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Loading overlay */}
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(0, 255, 0, 0.2)',
                borderTop: '4px solid #00FF00',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          )}
          
          {/* Niveau badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#00FF00',
            color: '#000',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 900,
            boxShadow: '0 2px 8px rgba(0, 255, 0, 0.4)'
          }}>
            LVL {stats.xpBalance?.current_level || 1}
          </div>

          {/* XP Total */}
          <div style={{ fontSize: '36px', fontWeight: 900, color: '#00FF00', marginBottom: '4px', marginTop: '8px' }}>
            {stats.totalXp.toLocaleString()}
          </div>
          <div style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>XP Points</div>
          
          {/* Barre de progression vers le prochain niveau (toujours affichée) */}
          {stats.xpBalance && (
            <div style={{ marginTop: '12px' }}>
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                height: '8px',
                overflow: 'hidden',
                marginBottom: '8px'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #00FF00 0%, #00CC00 100%)',
                  height: '100%',
                  width: `${(stats.xpBalance.xp_in_current_level / 
                    (stats.xpBalance.xp_in_current_level + stats.xpBalance.xp_to_next_level)) * 100}%`,
                  transition: 'width 0.5s ease',
                  boxShadow: '0 0 10px rgba(0, 255, 0, 0.6)'
                }} />
              </div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{stats.xpBalance.xp_in_current_level.toLocaleString()} XP</span>
                <span style={{ color: '#00FF00', fontWeight: 700 }}>
                  {stats.xpBalance.xp_to_next_level.toLocaleString()} to LVL {stats.xpBalance.current_level + 1}
                </span>
              </div>
              
              {/* Badge de prestige pour niveaux élevés */}
              {stats.xpBalance.current_level >= 50 && (
                <div style={{
                  marginTop: '8px',
                  color: '#FFD700',
                  fontSize: '11px',
                  fontWeight: 700,
                  textAlign: 'center',
                  textShadow: '0 0 8px rgba(255, 215, 0, 0.8)'
                }}>
                  ⭐ {stats.xpBalance.current_level >= 100 ? 'LEGENDARY' : 'ELITE'} MEMBER ⭐
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* My Win Intro Modal */}
      {showIntro && (
        <MyWinIntroModal onClose={() => setShowIntro(false)} />
      )}
      </div>
    </>
  );
} 