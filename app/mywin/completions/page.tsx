"use client";

import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';

interface Completion {
  id: string;
  campaignTitle: string;
  completionDate: string;
  score: number;
  validationStatus: 'validated' | 'pending' | 'rejected';
  moderatorFeedback: string;
  wincReward: number;
  nftReward: string;
  physicalReward: string;
  digitalReward: string;
}

export default function MyCompletionsPage() {
  const account = useActiveAccount();
  const [completions, setCompletions] = useState<Completion[]>([]);

  useEffect(() => {
    if (account && account.address) {
      // TODO: Fetch user completions from blockchain/database
      // For now, using mock data
      setCompletions([
        {
          id: '1',
          campaignTitle: 'Product Launch Video',
          completionDate: '2024-01-20',
          score: 9.2,
          validationStatus: 'validated',
          moderatorFeedback: 'Excellent work! High quality content that perfectly matches the campaign requirements.',
          wincReward: 150,
          nftReward: 'Campaign Contributor NFT #123',
          physicalReward: 'Limited Edition T-Shirt',
          digitalReward: 'Premium Access Pass'
        },
        {
          id: '2',
          campaignTitle: 'Brand Awareness Campaign',
          completionDate: '2024-01-18',
          score: 8.7,
          validationStatus: 'validated',
          moderatorFeedback: 'Great content with good engagement potential. Minor improvements could enhance impact.',
          wincReward: 120,
          nftReward: 'Brand Ambassador NFT #456',
          physicalReward: 'Branded Hoodie',
          digitalReward: 'Exclusive Content Library'
        },
        {
          id: '3',
          campaignTitle: 'Community Engagement',
          completionDate: '2024-01-22',
          score: 7.5,
          validationStatus: 'pending',
          moderatorFeedback: 'Content submitted successfully. Awaiting moderator review.',
          wincReward: 0,
          nftReward: 'Pending',
          physicalReward: 'Pending',
          digitalReward: 'Pending'
        },
        {
          id: '4',
          campaignTitle: 'Tech Innovation Quest',
          completionDate: '2024-01-16',
          score: 6.8,
          validationStatus: 'rejected',
          moderatorFeedback: 'Content does not meet quality standards. Please review guidelines and resubmit.',
          wincReward: 0,
          nftReward: 'None',
          physicalReward: 'None',
          digitalReward: 'None'
        }
      ]);
    }
  }, [account]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return '#00FF00';
      case 'pending': return '#FFD600';
      case 'rejected': return '#FF6B6B';
      default: return '#fff';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'validated': return 'Validated';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return '#00FF00';
    if (score >= 7) return '#FFD600';
    if (score >= 5) return '#FFA500';
    return '#FF6B6B';
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
          Loading your completions...
        </h1>
        <p style={{ fontSize: '16px', color: '#ccc' }}>
          Please wait while we fetch your completion data.
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
          My Completions
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#fff' 
        }}>
          Track your completed tasks and rewards
        </p>
      </div>

      {/* Completions List */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px', 
        maxWidth: '1000px', 
        width: '90vw', 
        marginBottom: '48px' 
      }}>
        {completions.map((completion) => (
          <div
            key={completion.id}
            style={{
              background: 'rgba(0, 255, 0, 0.05)',
              border: '2px solid #00FF00',
              borderRadius: 16,
              padding: 32,
              transition: 'all 0.3s ease',
            }}
          >
            {/* Header Row */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: '20px' 
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 700, 
                  marginBottom: '8px',
                  color: '#00FF00'
                }}>
                  {completion.campaignTitle}
                </h3>
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  alignItems: 'center',
                  fontSize: '14px',
                  color: '#ccc'
                }}>
                  <span>Completed: {completion.completionDate}</span>
                  <span style={{ 
                    color: getStatusColor(completion.validationStatus),
                    fontWeight: 600
                  }}>
                    {getStatusText(completion.validationStatus)}
                  </span>
                  <span style={{ 
                    color: getScoreColor(completion.score),
                    fontWeight: 600
                  }}>
                    Score: {completion.score}/10
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              padding: '16px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ 
                color: '#fff', 
                fontSize: '14px',
                lineHeight: '1.5',
                margin: 0
              }}>
                <strong>Moderator Feedback:</strong> {completion.moderatorFeedback}
              </p>
            </div>

            {/* Rewards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFD600' }}>
                  {completion.wincReward}
                </div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>$WINC</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#00FF00' }}>
                  {completion.nftReward}
                </div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>NFT Reward</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#00FF00' }}>
                  {completion.physicalReward}
                </div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>Physical Reward</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#00FF00' }}>
                  {completion.digitalReward}
                </div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>Digital Reward</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {completions.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: '#fff',
          marginTop: '48px'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '24px' }}>
            You haven't completed any campaigns yet.
          </p>
          <p style={{ fontSize: '16px', color: '#ccc' }}>
            Complete campaigns to see your progress and rewards here.
          </p>
        </div>
      )}
    </div>
  );
} 