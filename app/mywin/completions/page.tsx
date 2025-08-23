"use client";

import { useAddress } from '@thirdweb-dev/react';
import { useState, useEffect } from 'react';

interface Completion {
  id: string;
  campaignTitle: string;
  completionTitle: string;
  date: string;
  status: 'completed' | 'in_progress';
  score?: number; // Score moyen sur 100 des modérateurs
  ranking?: number; // Position dans le classement
  roiEarned?: number; // ROI gagné par le completeur (seulement si top 3 sur campagne individuelle)
  standardReward?: string; // Récompense standard proposée
  premiumReward?: string; // Récompense premium proposée si top 3
  campaignEndDate?: string; // Date de fin de campagne
  completionTarget?: number; // Nombre de complétions cibles
  currentCompletions?: number; // Nombre de complétions actuelles
  usdcRevenue?: number; // Revenus USDC générés par les récompenses payantes
  campaignCreatorType?: 'individual' | 'company'; // Type de créateur de la campagne
}

export default function MyCompletionsPage() {
  const account = useAddress();
  const [completions, setCompletions] = useState<Completion[]>([]);

  useEffect(() => {
    if (account) {
      // TODO: Fetch user completions from blockchain/database based on actual user behavior
      // This will be replaced with real API calls to get:
      // - Campaigns completed by this user
      // - Real completion status, scores, rankings, and rewards
      // - Actual ROI earned (only for top 3 on individual campaigns)
      // - Real campaign progress and completion data
      // - Actual USDC revenue and campaign creator types
      
      // For now, initialize with empty array - will be populated with real data
      setCompletions([]);
      
      // TODO: Implement real data fetching:
      // const userCompletions = await fetchUserCompletionsFromBlockchain(account.address);
      // setCompletions(userCompletions);
    }
  }, [account]);

  const handleCompletionClick = (completion: Completion) => {
    // TODO: Navigate to detailed completion view
    console.log('Viewing completion details:', completion);
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? '#00FF00' : '#FFD600';
  };

  const getStatusText = (status: string) => {
    return status === 'completed' ? 'Completed' : 'In Progress';
  };

  // Si pas d'adresse, afficher un message de chargement
  if (!account) {
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
          Track your campaign completions and rewards
        </p>
      </div>

      {/* Completions List */}
      <div style={{ 
        maxWidth: '1000px', 
        width: '90vw' 
      }}>
        {completions.map((completion) => (
          <div
            key={completion.id}
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              border: `2px solid ${getStatusColor(completion.status)}`,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 8px 25px ${getStatusColor(completion.status)}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => handleCompletionClick(completion)}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 800, 
                  color: '#00FF00',
                  marginBottom: '8px'
                }}>
                  {completion.campaignTitle}
                </h3>
                <p style={{ 
                  fontSize: '18px', 
                  color: '#fff',
                  marginBottom: '8px'
                }}>
                  {completion.completionTitle}
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#ccc'
                }}>
                  Completed on {completion.date}
                </p>
              </div>
              
              <div style={{
                background: getStatusColor(completion.status),
                color: '#000',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 700
              }}>
                {getStatusText(completion.status)}
              </div>
            </div>

            {completion.status === 'completed' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginTop: '16px'
              }}>
                <div style={{
                  background: 'rgba(0, 255, 0, 0.1)',
                  border: '1px solid #00FF00',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#00FF00' }}>
                    {completion.score}/100
                  </div>
                  <div style={{ fontSize: '12px', color: '#fff' }}>Average Score</div>
                </div>
                
                <div style={{
                  background: 'rgba(255, 214, 0, 0.1)',
                  border: '1px solid #FFD600',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#FFD600' }}>
                    #{completion.ranking}
                  </div>
                  <div style={{ fontSize: '12px', color: '#fff' }}>Ranking</div>
                </div>
                
                {completion.roiEarned && completion.campaignCreatorType === 'individual' && completion.ranking <= 3 && (
                  <div style={{
                    background: 'rgba(0, 123, 255, 0.1)',
                    border: '1px solid #007BFF',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#007BFF' }}>
                      ${completion.roiEarned}
                    </div>
                    <div style={{ fontSize: '12px', color: '#fff' }}>ROI Earned</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 214, 0, 0.1)',
                border: '1px solid #FFD600',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '16px'
              }}>
                <p style={{ 
                  color: '#FFD600', 
                  fontSize: '16px', 
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Campaign live in progress. Waiting for the end of days/completions
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: '#fff'
                }}>
                  <span>End Date: {completion.campaignEndDate}</span>
                  <span>Progress: {completion.currentCompletions}/{completion.completionTarget}</span>
                </div>
              </div>
            )}

            {completion.status === 'completed' && completion.usdcRevenue && (
              <div style={{
                background: 'rgba(0, 255, 0, 0.1)',
                border: '1px solid #00FF00',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#00FF00' }}>
                  ${completion.usdcRevenue}
                </div>
                <div style={{ fontSize: '12px', color: '#fff' }}>USDC Revenue from Paid Rewards</div>
              </div>
            )}

            {completion.status === 'completed' && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px'
              }}>
                <h4 style={{ 
                  color: '#00FF00', 
                  fontSize: '16px', 
                  fontWeight: 700,
                  marginBottom: '8px'
                }}>
                  Rewards Offered:
                </h4>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  {completion.standardReward && (
                    <span style={{
                      background: '#00FF00',
                      color: '#000',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {completion.standardReward}
                    </span>
                  )}
                  {completion.premiumReward && (
                    <span style={{
                      background: '#FFD600',
                      color: '#000',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {completion.premiumReward}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 