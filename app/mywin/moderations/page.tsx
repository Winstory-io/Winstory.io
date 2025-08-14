"use client";

import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';

interface Moderation {
  id: string;
  campaignTitle: string;
  completionTitle: string;
  date: string;
  vote: 'approve' | 'reject';
  finalResult: 'approved' | 'rejected';
  wincEarned: number;
  wincLost: number;
  alignment: number;
  contentUrl: string;
}

export default function MyModerationsPage() {
  const account = useActiveAccount();
  const [moderations, setModerations] = useState<Moderation[]>([]);

  useEffect(() => {
    if (account && account.address) {
      // TODO: Fetch user moderations from blockchain/database based on actual user behavior
      // This will be replaced with real API calls to get:
      // - Content moderated by this user
      // - Real voting history and final results
      // - Actual $WINC earned/lost and alignment rates
      // - Real content URLs and campaign information
      
      // For now, initialize with empty array - will be populated with real data
      setModerations([]);
      
      // TODO: Implement real data fetching:
      // const userModerations = await fetchUserModerationsFromBlockchain(account.address);
      // setModerations(userModerations);
    }
  }, [account]);

  const getVoteColor = (vote: string) => {
    return vote === 'approve' ? '#00FF00' : '#FF6B6B';
  };

  const getVoteText = (vote: string) => {
    return vote === 'approve' ? 'Approved' : 'Rejected';
  };

  const getResultColor = (result: string) => {
    return result === 'approved' ? '#00FF00' : '#FF6B6B';
  };

  const getResultText = (result: string) => {
    return result === 'approved' ? 'Approved' : 'Rejected';
  };

  const getAlignmentColor = (alignment: number) => {
    if (alignment >= 80) return '#00FF00';
    if (alignment >= 60) return '#FFD600';
    if (alignment >= 40) return '#FFA500';
    return '#FF6B6B';
  };

  // Calculate totals
  const totalWincEarned = moderations.reduce((sum, mod) => sum + mod.wincEarned, 0);
  const totalWincLost = moderations.reduce((sum, mod) => sum + mod.wincLost, 0);
  const totalVotes = moderations.length;
  const averageAlignment = moderations.reduce((sum, mod) => sum + mod.alignment, 0) / totalVotes;

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
          Loading your moderations...
        </h1>
        <p style={{ fontSize: '16px', color: '#ccc' }}>
          Please wait while we fetch your moderation data.
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
          My Moderations
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#fff' 
        }}>
          Track your moderation history and staking results
        </p>
      </div>

      {/* Total Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '16px', 
        maxWidth: '800px', 
        width: '90vw', 
        marginBottom: '48px' 
      }}>
        <div style={{ 
          background: 'rgba(0, 255, 0, 0.1)', 
          border: '2px solid #00FF00', 
          borderRadius: '12px', 
          padding: '16px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#00FF00', marginBottom: '4px' }}>
            {totalWincEarned}
          </div>
          <div style={{ color: '#fff', fontSize: '12px' }}>Total WINC Earned</div>
        </div>
        <div style={{ 
          background: 'rgba(255, 107, 107, 0.1)', 
          border: '2px solid #FF6B6B', 
          borderRadius: '12px', 
          padding: '16px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#FF6B6B', marginBottom: '4px' }}>
            {totalWincLost}
          </div>
          <div style={{ color: '#fff', fontSize: '12px' }}>Total WINC Lost</div>
        </div>
        <div style={{ 
          background: 'rgba(255, 214, 0, 0.1)', 
          border: '2px solid #FFD600', 
          borderRadius: '12px', 
          padding: '16px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#FFD600', marginBottom: '4px' }}>
            {totalVotes}
          </div>
          <div style={{ color: '#fff', fontSize: '12px' }}>Total Votes</div>
        </div>
        <div style={{ 
          background: 'rgba(0, 255, 0, 0.1)', 
          border: '2px solid #00FF00', 
          borderRadius: '12px', 
          padding: '16px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#00FF00', marginBottom: '4px' }}>
            {Math.round(averageAlignment)}%
          </div>
          <div style={{ color: '#fff', fontSize: '12px' }}>Alignment Rate</div>
        </div>
      </div>

      {/* Moderations List */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px', 
        maxWidth: '1000px', 
        width: '90vw', 
        marginBottom: '48px' 
      }}>
        {moderations.map((moderation) => (
          <div
            key={moderation.id}
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
                  {moderation.campaignTitle}
                </h3>
                <p style={{ 
                  color: '#fff', 
                  marginBottom: '12px',
                  fontSize: '16px'
                }}>
                  {moderation.completionTitle}
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  alignItems: 'center',
                  fontSize: '14px',
                  color: '#ccc'
                }}>
                  <span>Vote Date: {moderation.date}</span>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                alignItems: 'center' 
              }}>
                <div style={{ 
                  background: getVoteColor(moderation.vote), 
                  color: '#000', 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  fontSize: '14px', 
                  fontWeight: 700 
                }}>
                  Your Vote: {getVoteText(moderation.vote)}
                </div>
                <div style={{ 
                  background: getResultColor(moderation.finalResult), 
                  color: '#000', 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  fontSize: '14px', 
                  fontWeight: 700 
                }}>
                  Final: {getResultText(moderation.finalResult)}
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#00FF00' }}>
                  {moderation.wincEarned}
                </div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>WINC Earned</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#FF6B6B' }}>
                  {moderation.wincLost}
                </div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>WINC Lost</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: 700, 
                  color: getAlignmentColor(moderation.alignment) 
                }}>
                  {moderation.alignment}%
                </div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>Alignment</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {moderations.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: '#fff',
          marginTop: '48px'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '24px' }}>
            You haven't moderated any content yet.
          </p>
          <p style={{ fontSize: '16px', color: '#ccc' }}>
            Start moderating content to see your staking results here.
          </p>
        </div>
      )}
    </div>
  );
} 