"use client";

import { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
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
  lastActivity: string;
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
    lastActivity: 'Never'
  });
  const router = useRouter();

  // Utiliser useCallback pour éviter les re-créations de fonction
  const fetchUserStats = useCallback(async () => {
    if (account && account.address) {
      // TODO: Fetch user stats from blockchain/database
      // For now, using mock data
      setStats({
        creations: 3,
        completions: 12,
        moderations: 8,
        totalWinc: 1250,
        totalXp: 450,
        lastActivity: '2 hours ago'
      });
    }
  }, [account]);

  useEffect(() => {
    if (account && account.address) {
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
        lastActivity: 'Never'
      });
    }
  }, [account, fetchUserStats]);

  const handleLoginSuccess = useCallback((data: { email: string, walletAddress: string }) => {
    // L'utilisateur s'est connecté avec succès
    setIsConnected(true);
    // TODO: Fetch user stats from blockchain/database
    setStats({
      creations: 3,
      completions: 12,
      moderations: 8,
      totalWinc: 1250,
      totalXp: 450,
      lastActivity: '2 hours ago'
    });
  }, []);

  if (!isConnected) {
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
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', padding: '0 24px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 900, 
            marginBottom: '24px',
            color: '#00FF00'
          }}>
            My Win Dashboard
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#fff', 
            marginBottom: '48px',
            lineHeight: '1.6'
          }}>
            Connect your wallet to access your personal dashboard and track your progress, earnings, and achievements.
          </p>
          <WalletConnect 
            isBothLogin={true} 
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      </div>
    );
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
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 16,
          marginBottom: 16,
          marginLeft: '-100px'
        }}>
          <img
            src="/clienticon.svg"
            alt="My Win Icon"
            width="120"
            height="120"
            style={{ display: 'block' }}
          />
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 900, 
            color: '#00FF00',
            margin: 0
          }}>
            My Win
          </h1>
        </div>
        <p style={{ 
          fontSize: '20px', 
          color: '#00FF00', 
          fontWeight: 600,
          margin: 0
        }}>
          Powered by You !
        </p>
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
      <div
        style={{
          display: 'flex',
          gap: 48,
          marginBottom: 48,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#FFD600' }}>
            {stats.totalWinc}
          </div>
          <div style={{ color: '#fff' }}>$WINC Earned</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#FFD600' }}>
            {stats.totalXp}
          </div>
          <div style={{ color: '#fff' }}>XP Points</div>
        </div>
      </div>

      {/* Last Activity */}
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <p style={{ fontSize: 16 }}>
          Last activity: <span style={{ color: '#00FF00' }}>{stats.lastActivity}</span>
        </p>
      </div>
    </div>
  );
} 