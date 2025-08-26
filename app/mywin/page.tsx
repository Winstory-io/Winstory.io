"use client";

import { useActiveAccount } from 'thirdweb/react';
import { useState, useEffect, useCallback } from 'react';
import WalletConnect from '@/components/WalletConnect';
import { useRouter } from 'next/navigation';
import CreationIcon from '@/components/icons/CreationIcon';
import CompletionIcon from '@/components/icons/CompletionIcon';

interface DashboardStats {
  creations: number;
  completions: number;
  moderations: number;
  totalWinc: number;
  totalXp: number;
}

export default function MyWinPage() {
  const account = useActiveAccount();
  const [isConnected, setIsConnected] = useState(false);
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
    if (account) {
      // TODO: Fetch user stats from blockchain/database based on user's actual behavior
      // This will be replaced with real API calls to get:
      // - Number of campaigns created by this user
      // - Number of contents moderated by this user  
      // - Number of campaigns completed by this user
      // - Total $WINC earned from all activities
      // - Total XP points accumulated
      
      // For now, initialize with 0 - will be populated with real data
      setStats({
        creations: 0,
        completions: 0,
        moderations: 0,
        totalWinc: 0,
        totalXp: 0,
      });
      
      // TODO: Implement real data fetching:
      // const userStats = await fetchUserStatsFromBlockchain(account.address);
      // setStats(userStats);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      setIsConnected(true);
      fetchUserStats();
    } else {
      setIsConnected(false);
      setStats({
        creations: 0,
        completions: 0,
        moderations: 0,
        totalWinc: 0,
        totalXp: 0,
      });
    }
  }, [account, fetchUserStats]);

  const handleLoginSuccess = useCallback((data: { email: string, walletAddress: string }) => {
    // L'utilisateur s'est connecté avec succès
    setIsConnected(true);
    // TODO: Fetch user stats from blockchain/database based on actual user behavior
    // This will be replaced with real API calls to get user's actual stats
    
    // For now, initialize with 0 - will be populated with real data
    setStats({
      creations: 0,
      completions: 0,
      moderations: 0,
      totalWinc: 0,
      totalXp: 0,
    });
    
    // TODO: Implement real data fetching:
    // const userStats = await fetchUserStatsFromBlockchain(data.walletAddress);
    // setStats(userStats);
  }, []);

  // Si pas connecté, laisser le layout afficher l'écran d'authentification
  if (!isConnected) {
    return null;
  }

  return (
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
            margin: 0
          }}>
            My Win
          </h1>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 8, // Réduit de 16 à 8 pour rapprocher l'icône et la phrase
          marginBottom: 0,
          marginLeft: '-80px' // Décalage augmenté pour centrer parfaitement "Brainpowered by You"
        }}>
          <img
            src="/clienticon.svg"
            alt="My Win Icon"
            width="96" // Doublé de 48 à 96
            height="96" // Doublé de 48 à 96
            style={{ display: 'block' }}
          />
          <p style={{ 
            fontSize: '20px', 
            color: '#00FF00', 
            fontWeight: 600,
            margin: 0
          }}>
            Brainpowered by You
          </p>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 24, 
        marginBottom: 48 
      }}>
        {/* My Creations */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #00FF00',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          transition: 'all 0.3s ease'
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            <CreationIcon />
          </div>
          <h3 style={{ color: '#00FF00', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            My Creations
          </h3>
          <p style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>
            {stats.creations} campaigns created
          </p>
          <button style={{
            background: '#00FF00',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
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
          padding: '24px',
          textAlign: 'center',
          transition: 'all 0.3s ease'
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            <img
              src="/moderation.svg"
              alt="Moderation Icon"
              width="96"
              height="96"
              style={{ display: 'block', margin: '0 auto' }}
            />
          </div>
          <h3 style={{ color: '#00FF00', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            My Moderations
          </h3>
          <p style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>
            {stats.moderations} contents moderated
          </p>
          <button style={{
            background: '#00FF00',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
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
          padding: '24px',
          textAlign: 'center',
          transition: 'all 0.3s ease'
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            <CompletionIcon />
          </div>
          <h3 style={{ color: '#00FF00', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            My Completions
          </h3>
          <p style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>
            {stats.completions} campaigns completed
          </p>
          <button style={{
            background: '#00FF00',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
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
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', fontWeight: 900, color: '#00FF00', marginBottom: '8px' }}>
            {stats.totalXp}
          </div>
          <div style={{ color: '#fff', fontSize: '16px' }}>XP Points</div>
        </div>
      </div>
    </div>
  );
} 