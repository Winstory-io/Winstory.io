'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveAccount } from 'thirdweb/react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  creationDate: string;
  targetCompletions: number;
  currentCompletions: number;
  averageScore: number;
  rewardsDistributed: number;
  roi: number;
  status: 'active' | 'completed' | 'paused';
}

export default function MyCreationsPage() {
  const router = useRouter();
  const account = useActiveAccount();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (account && account.address) {
      // TODO: Fetch user campaigns from blockchain/database based on actual user behavior
      // This will be replaced with real API calls to get:
      // - Campaigns created by this user
      // - Real completion progress, scores, rewards, and ROI data
      // - Actual campaign status and performance metrics
      
      // For now, initialize with empty array - will be populated with real data
      setCampaigns([]);
      
      // TODO: Implement real data fetching:
      // const userCampaigns = await fetchUserCampaignsFromBlockchain(account.address);
      // setCampaigns(userCampaigns);
    }
  }, [account]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00FF00';
      case 'completed': return '#FFD600';
      case 'paused': return '#FF6B6B';
      default: return '#fff';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'paused': return 'Paused';
      default: return 'Unknown';
    }
  };

  // Si pas d'adresse, afficher un message de chargement au lieu de rediriger
  if (!account || !account.address) {
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
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
          Loading your creations...
        </h1>
        <p style={{ fontSize: '16px', color: '#ccc' }}>
          Please wait while we fetch your campaign data.
        </p>
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
      <div style={{ 
        marginTop: '24px', 
        textAlign: 'center', 
        marginBottom: '48px' 
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 900, 
          marginBottom: '16px' 
        }}>
          My Creations
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#fff' 
        }}>
          Track your campaign progress and performance
        </p>
      </div>

      {/* Campaigns List */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px', 
        maxWidth: '1000px', 
        width: '90vw', 
        marginBottom: '48px' 
      }}>
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            style={{
              background: 'rgba(0, 255, 0, 0.05)',
              border: '2px solid #00FF00',
              borderRadius: 16,
              padding: 32,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => router.push(`/mywin/creations/${campaign.id}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 0, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Header Row */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: '16px' 
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 700, 
                  marginBottom: '8px',
                  color: '#00FF00'
                }}>
                  {campaign.title}
                </h3>
                <p style={{ 
                  color: '#fff', 
                  marginBottom: '12px',
                  lineHeight: '1.5'
                }}>
                  {campaign.description}
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  alignItems: 'center',
                  fontSize: '14px',
                  color: '#ccc'
                }}>
                  <span>Created: {campaign.creationDate}</span>
                  <span style={{ 
                    color: getStatusColor(campaign.status),
                    fontWeight: 600
                  }}>
                    {getStatusText(campaign.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '8px',
                fontSize: '14px',
                color: '#fff'
              }}>
                <span>MINT Progress</span>
                <span>{campaign.currentCompletions}/{campaign.targetCompletions} ({Math.round((campaign.currentCompletions / campaign.targetCompletions) * 100)}%)</span>
              </div>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '8px', 
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  background: '#00FF00', 
                  height: '100%', 
                  width: `${(campaign.currentCompletions / campaign.targetCompletions) * 100}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '16px' 
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFD600' }}>
                  {campaign.averageScore}/10
                </div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>Avg Score</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFD600' }}>
                  {campaign.rewardsDistributed}
                </div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>$WINC Distributed</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFD600' }}>
                  {campaign.roi}%
                </div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>ROI</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: '#fff',
          marginTop: '48px'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '24px' }}>
            You haven't created any campaigns yet.
          </p>
          <p style={{ fontSize: '16px', color: '#ccc' }}>
            Start creating campaigns to track your progress here.
          </p>
        </div>
      )}
    </div>
  );
} 