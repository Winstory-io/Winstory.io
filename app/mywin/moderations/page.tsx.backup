"use client";

import { useActiveAccount } from 'thirdweb/react';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import DevControls from '@/components/DevControls';

// Types pour les données de modération active
interface BaseModerationData {
  id: string;
  type: 'initial' | 'completion';
  mintPrice: number;
  walletAddress: string;
  personalStaking: number;
  poolStaking: number;
  personalStakingPercentage: number;
  validatedVotes: number;
  refusedVotes: number;
  totalModerators: number;
  userVote: 'valid' | 'refuse' | null;
  conditions: {
    poolStakingExceedsMint: boolean;
    hybridRatioMet: boolean;
    moderatorThresholdMet: boolean;
  };
}

interface InitialModerationData extends BaseModerationData {
  type: 'initial';
}

interface CompletionModerationData extends BaseModerationData {
  type: 'completion';
  userScore: number; // Score que l'utilisateur a donné
  averageScore: number; // Score moyen de tous les modérateurs
}

type ModerationData = InitialModerationData | CompletionModerationData;

export default function MyModerationsPage() {
  const account = useActiveAccount();
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'staking' | 'influence'>('active');
  const [currentModerationIndex, setCurrentModerationIndex] = useState(0);
  
  // Données mock pour les modérations actives - combinées dans un seul tableau
  const [activeModerations, setActiveModerations] = useState<ModerationData[]>([
    {
      id: 'INIT_001',
      type: 'initial',
      mintPrice: 150,
      walletAddress: '0x9B28EP...75A0G9BR',
      personalStaking: 200,
      poolStaking: 2400,
      personalStakingPercentage: 8.3,
      validatedVotes: 12,
      refusedVotes: 3,
      totalModerators: 22,
      userVote: 'valid',
      conditions: {
        poolStakingExceedsMint: true,
        hybridRatioMet: true,
        moderatorThresholdMet: true,
      }
    },
    {
      id: 'COMP_001',
      type: 'completion',
      mintPrice: 100,
      walletAddress: '0x9B28EP...75A0G9BR',
      personalStaking: 150,
      poolStaking: 1800,
      personalStakingPercentage: 8.3,
      validatedVotes: 14,
      refusedVotes: 3,
      totalModerators: 22,
      userVote: 'valid',
      userScore: 88,
      averageScore: 86.5,
      conditions: {
        poolStakingExceedsMint: true,
        hybridRatioMet: true,
        moderatorThresholdMet: true,
      }
    },
    {
      id: 'COMP_002',
      type: 'completion',
      mintPrice: 75,
      walletAddress: '0x7A15BC...23F8D1AC',
      personalStaking: 100,
      poolStaking: 1200,
      personalStakingPercentage: 8.3,
      validatedVotes: 8,
      refusedVotes: 2,
      totalModerators: 15,
      userVote: 'valid',
      userScore: 92,
      averageScore: 89.2,
      conditions: {
        poolStakingExceedsMint: true,
        hybridRatioMet: true,
        moderatorThresholdMet: false,
      }
    }
  ]);

  // Navigation du carrousel
  const nextModeration = () => {
    setCurrentModerationIndex((prev) => 
      prev < activeModerations.length - 1 ? prev + 1 : 0
    );
  };

  const prevModeration = () => {
    setCurrentModerationIndex((prev) => 
      prev > 0 ? prev - 1 : activeModerations.length - 1
    );
  };

  const goToModeration = (index: number) => {
    setCurrentModerationIndex(index);
  };

  const separatorStyle = {
    height: 1,
    width: '85%',
    background: 'linear-gradient(90deg, rgba(255,214,0,0.9), rgba(255,255,255,0.5))'
  } as React.CSSProperties;

  const truncateAddress = (address: string) => {
    return address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
  };

  // Fonction pour rendre un cercle de modération stylisé
  const renderModerationCircle = (data: ModerationData) => {
    const validPercentage = data.totalModerators > 0 ? (data.validatedVotes / data.totalModerators) * 100 : 0;
    const refusedPercentage = data.totalModerators > 0 ? (data.refusedVotes / data.totalModerators) * 100 : 0;
    const remainingPercentage = 100 - validPercentage - refusedPercentage;

    const radius = 140; // Agrandi de 110 à 140
    const strokeWidth = 16; // Légèrement plus épais aussi
    const normalizedRadius = radius - strokeWidth * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;

    // Calculs pour les segments
    const validOffset = circumference * (1 - validPercentage / 100);
    const refusedOffset = circumference * (1 - refusedPercentage / 100);

    // Déterminer les propriétés de la bulle de vote
    const getVoteBubbleProps = () => {
      switch (data.userVote) {
        case 'valid':
          return {
            background: 'rgba(0, 255, 0, 0.15)',
            border: '2px solid #00FF00',
            color: '#00FF00',
            text: 'Valid',
            emoji: '✅'
          };
        case 'refuse':
          return {
            background: 'rgba(255, 0, 0, 0.15)',
            border: '2px solid #FF0000',
            color: '#FF0000',
            text: 'Refuse',
            emoji: '❌'
          };
        default:
          return {
            background: 'rgba(128, 128, 128, 0.15)',
            border: '2px solid #888',
            color: '#888',
            text: 'Not voted',
            emoji: '⏳'
          };
      }
    };

    const bubbleProps = getVoteBubbleProps();

    return (
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Bulle de vote au-dessus */}
        <div style={{
          background: bubbleProps.background,
          border: bubbleProps.border,
          borderRadius: '20px',
          padding: '8px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(10px)',
          boxShadow: `0 4px 20px ${bubbleProps.color}33`
        }}>
          <span style={{ fontSize: '16px' }}>{bubbleProps.emoji}</span>
          <span style={{ 
            color: bubbleProps.color, 
            fontSize: '14px', 
            fontWeight: 700 
          }}>
            Your Vote: {bubbleProps.text}
          </span>
        </div>

        {/* Cercle de modération */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg
            height={radius * 2}
            width={radius * 2}
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Cercle de base (gris) */}
            <circle
              stroke="#333"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            
            {/* Segment vert (validé) */}
            {validPercentage > 0 && (
              <circle
                stroke="#00FF00"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={`${validPercentage / 100 * circumference} ${circumference}`}
                strokeDashoffset={0}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            )}
            
            {/* Segment rouge (refusé) */}
            {refusedPercentage > 0 && (
              <circle
                stroke="#FF0000"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={`${refusedPercentage / 100 * circumference} ${circumference}`}
                strokeDashoffset={-validPercentage / 100 * circumference}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            )}
          </svg>
          
          {/* Contenu central */}
          <div style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: '#FFD600',
            fontSize: '13px', // Légèrement plus grand
            fontWeight: 600
          }}>
            <div style={{ fontSize: '16px', marginBottom: '2px' }}>Personal Staking</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFD600' }}>{data.personalStaking}</div>
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>Pool Staking</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{data.poolStaking}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {data.personalStakingPercentage}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fonction pour rendre les conditions
  const renderConditions = (data: ModerationData) => {
    const totalVotes = data.validatedVotes + data.refusedVotes;
    
    // Déterminer majorité et minorité avec couleurs appropriées
    const getMajorityMinorityDisplay = () => {
      const validVotes = data.validatedVotes;
      const refusedVotes = data.refusedVotes;
      
      if (validVotes === refusedVotes) {
        // Égalité - tout en jaune
        return (
          <>
            <span style={{ color: '#FFD600' }}>Majority ({validVotes})</span> / <span style={{ color: '#FFD600' }}>Minority ({refusedVotes})</span> ≥ 2
          </>
        );
      } else if (validVotes > refusedVotes) {
        // Valid est majoritaire (vert), Refuse est minoritaire (rouge)
        return (
          <>
            <span style={{ color: '#00FF00' }}>Majority ({validVotes})</span> / <span style={{ color: '#FF0000' }}>Minority ({refusedVotes})</span> ≥ 2
          </>
        );
      } else {
        // Refuse est majoritaire (rouge), Valid est minoritaire (vert)
        return (
          <>
            <span style={{ color: '#FF0000' }}>Majority ({refusedVotes})</span> / <span style={{ color: '#00FF00' }}>Minority ({validVotes})</span> ≥ 2
          </>
        );
      }
    };
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#fff' }}>
        {/* Titre des conditions */}
        <div style={{
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#FFD600',
            margin: 0,
            marginBottom: '4px'
          }}>
            Conditions Status
          </h3>
          <div style={{
            height: '2px',
            width: '60%',
            margin: '0 auto',
            background: 'linear-gradient(90deg, rgba(255,214,0,0.8), rgba(255,255,255,0.3))',
            borderRadius: '1px'
          }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 22, 
            height: 22, 
            borderRadius: 999, 
            background: data.conditions.poolStakingExceedsMint ? '#18C964' : '#444', 
            border: `2px solid ${data.conditions.poolStakingExceedsMint ? '#18C964' : '#FF3B30'}` 
          }} />
          <span style={{ 
            color: data.conditions.poolStakingExceedsMint ? '#18C964' : '#FFD600', 
            fontSize: 18 
          }}>
            Pool Staking ({data.poolStaking} SWINC) &gt; MINT Price
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 22, 
            height: 22, 
            borderRadius: 999, 
            background: data.conditions.hybridRatioMet ? '#18C964' : '#444', 
            border: `2px solid ${data.conditions.hybridRatioMet ? '#18C964' : '#FF3B30'}` 
          }} />
          <span style={{ 
            color: data.conditions.hybridRatioMet ? '#18C964' : '#FFD600', 
            fontSize: 18 
          }}>
            {getMajorityMinorityDisplay()}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 22, 
            height: 22, 
            borderRadius: 999, 
            background: totalVotes >= 22 ? '#18C964' : '#444', 
            border: `2px solid ${totalVotes >= 22 ? '#18C964' : '#FF3B30'}` 
          }} />
          <span style={{ 
            color: totalVotes >= 22 ? '#18C964' : '#FFD600', 
            fontSize: 18 
          }}>
            You moderate ({data.userVote === 'valid' ? (
              <span style={{ color: '#00FF00' }}>Valid</span>
            ) : data.userVote === 'refuse' ? (
              <span style={{ color: '#FF0000' }}>Refuse</span>
            ) : (
              <span style={{ color: '#FFD600' }}>Not voted</span>
            )}) with {totalVotes} others Moderators / 22
          </span>
        </div>
      </div>
    );
  };

  // Fonction pour rendre la ligne de score (completion seulement)
  const renderScoreLine = (data: CompletionModerationData) => {
    // Forcer le score à 0 si le modérateur a refusé
    const actualUserScore = data.userVote === 'refuse' ? 0 : data.userScore;
    const userScorePosition = (actualUserScore / 100) * 100;
    const averageScorePosition = (data.averageScore / 100) * 100;

    const getScoreColor = (score: number) => {
      if (score >= 80) return '#00FF00';
      if (score >= 50) return '#FFD600';
      return '#FF0000';
    };

    return (
      <div style={{ width: '100%', margin: '24px 0', position: 'relative' }}>
        {/* Container avec 0 et 100 aux extrémités */}
        <div style={{ position: 'relative', padding: '0 20px' }}>
          {/* 0 rouge à gauche */}
          <div style={{
            position: 'absolute',
            left: '0',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#FF0000',
            fontSize: '16px',
            fontWeight: 700
          }}>
            0
          </div>

          {/* 100 vert à droite - décalé davantage vers la droite */}
          <div style={{
            position: 'absolute',
            right: '-25px', // Décalé davantage vers la droite
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#00FF00',
            fontSize: '16px',
            fontWeight: 700
          }}>
            100
          </div>

          {/* Ligne de fond dégradée */}
          <div style={{
            width: '100%',
            height: '10px',
            borderRadius: '5px',
            background: 'linear-gradient(90deg, #FF0000 0%, #FFA500 25%, #FFD600 50%, #90EE90 75%, #00FF00 100%)',
            position: 'relative',
            margin: '0 20px'
          }}>
            {/* Marqueur de votre score - monté vers le haut */}
            <div style={{
              position: 'absolute',
              left: `${userScorePosition}%`,
              top: '-40px', // Monté davantage vers le haut
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                background: getScoreColor(actualUserScore),
                color: '#000',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                marginBottom: '6px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                Your Score: {actualUserScore}
              </div>
              <div style={{
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `6px solid ${getScoreColor(actualUserScore)}`,
              }} />
            </div>

            {/* Marqueur du score moyen - espacé en hauteur */}
            <div style={{
              position: 'absolute',
              left: `${averageScorePosition}%`,
              top: '26px', // Plus d'espace en hauteur
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: `6px solid ${getScoreColor(data.averageScore)}`,
                marginBottom: '6px' // Plus d'espace entre la flèche et le texte
              }} />
              <div style={{
                background: getScoreColor(data.averageScore),
                color: '#000',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                Average Score: {data.averageScore}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fonction pour rendre les contrôles du carrousel
  const renderCarouselControls = () => {
    if (activeModerations.length <= 1) return null;

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Bouton précédent */}
        <button
          onClick={prevModeration}
          style={{
            background: '#333',
            border: '2px solid #FFD600',
            borderRadius: '8px',
            color: '#FFD600',
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FFD600';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#333';
            e.currentTarget.style.color = '#FFD600';
          }}
        >
          ← Prev
        </button>

        {/* Indicateurs de pagination */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {activeModerations.map((_, index) => (
            <button
              key={index}
              onClick={() => goToModeration(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentModerationIndex ? '#FFD600' : '#666',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Compteur */}
        <span style={{ 
          color: '#C0C0C0', 
          fontSize: '14px',
          minWidth: '60px',
          textAlign: 'center'
        }}>
          {currentModerationIndex + 1} / {activeModerations.length}
        </span>

        {/* Bouton suivant */}
        <button
          onClick={nextModeration}
          style={{
            background: '#333',
            border: '2px solid #FFD600',
            borderRadius: '8px',
            color: '#FFD600',
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FFD600';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#333';
            e.currentTarget.style.color = '#FFD600';
          }}
        >
          Next →
        </button>
      </div>
    );
  };

  // Loading state
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
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      gap: 24,
      alignItems: 'start',
      paddingTop: 16,
      paddingLeft: 16,
      paddingRight: 16
    }}>
      {/* Left sidebar menu */}
      <div style={{ 
        position: 'sticky', 
        top: '50%', 
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: 'fit-content'
      }}>
        <div style={{ 
          color: activeTab === 'active' ? '#18C964' : '#C0C0C0', 
          fontWeight: 900, 
          fontSize: 16,
          cursor: 'pointer', 
          marginBottom: 10 
        }} onClick={() => setActiveTab('active')}>
          Active Moderations
        </div>
        <div style={separatorStyle} />
        <div style={{ 
          marginTop: 10, 
          marginBottom: 10, 
          color: activeTab === 'history' ? '#18C964' : '#C0C0C0', 
          fontWeight: 900, 
          fontSize: 16,
          cursor: 'pointer' 
        }} onClick={() => setActiveTab('history')}>
          Moderation History
        </div>
        <div style={separatorStyle} />
        <div style={{ 
          marginTop: 10,
          marginBottom: 10, 
          color: activeTab === 'staking' ? '#18C964' : '#C0C0C0', 
          fontWeight: 900, 
          fontSize: 16,
          cursor: 'pointer' 
        }} onClick={() => setActiveTab('staking')}>
          Staking Performance
        </div>
        <div style={separatorStyle} />
        <div style={{ 
          marginTop: 10, 
          color: activeTab === 'influence' ? '#18C964' : '#C0C0C0', 
          fontWeight: 900, 
          fontSize: 16,
          cursor: 'pointer' 
        }} onClick={() => setActiveTab('influence')}>
          Your Staker Influence
        </div>
        <div style={separatorStyle} />
      </div>

      {/* Right content area */}
      <div style={{ width: '100%', maxWidth: 1400, justifySelf: 'center', position: 'relative' }}>
        {activeTab === 'active' && (
          <div style={{ color: '#fff', paddingTop: 20 }}>
            {activeModerations.length > 0 ? (
              <div>
                {/* Contrôles du carrousel */}
                {renderCarouselControls()}

                {/* Modération actuelle */}
                {(() => {
                  const currentModeration = activeModerations[currentModerationIndex];
                  const isCompletion = currentModeration.type === 'completion';
                  
                                     return (
                     <div style={{
                       background: 'transparent',
                       padding: '32px 0',
                       marginBottom: '32px'
                     }}>
                       {/* Header */}
                       <div style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: '24px',
                         marginBottom: '48px',
                         justifyContent: 'center'
                       }}>
                         <h2 style={{
                           fontSize: '32px',
                           fontWeight: 800,
                           color: '#FFD600',
                           margin: 0,
                           textAlign: 'center'
                         }}>
                           {isCompletion ? 'Completion Moderation in progress' : 'Initial Moderation in progress'}
                         </h2>
                       </div>

                       {/* ID, MINT Price, Wallet - Centered */}
                       <div style={{
                         display: 'flex',
                         justifyContent: 'center',
                         marginBottom: '32px'
                       }}>
                         <div style={{
                           background: 'rgba(24, 201, 100, 0.1)',
                           border: '1px solid #18C964',
                           color: '#18C964',
                           padding: '10px 20px',
                           borderRadius: '24px',
                           fontSize: '14px',
                           fontWeight: 700
                         }}>
                           ID: {currentModeration.id} • MINT Price: ${currentModeration.mintPrice} • {truncateAddress(currentModeration.walletAddress)}
                         </div>
                       </div>

                       {/* Score line for completion moderations only */}
                       {isCompletion && (
                         <div style={{ marginBottom: '48px', maxWidth: '800px', margin: '0 auto 48px auto' }}>
                           {renderScoreLine(currentModeration as CompletionModerationData)}
                         </div>
                       )}

                       {/* Main content */}
                       <div style={{
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         gap: '80px',
                         maxWidth: '1200px',
                         margin: '0 auto'
                       }}>
                         {/* Cercle de modération */}
                         <div style={{ flex: 'none' }}>
                           {renderModerationCircle(currentModeration)}
                         </div>

                         {/* Conditions */}
                         <div style={{ flex: 1, maxWidth: '600px' }}>
                           {renderConditions(currentModeration)}
                         </div>
                       </div>
                     </div>
                   );
                })()}
              </div>
            ) : (
              /* Empty state */
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.6)',
                border: '2px dashed #333',
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>⚖️</div>
                <h3 style={{ color: '#C0C0C0', fontSize: '20px', marginBottom: '8px' }}>No active moderations</h3>
                <p style={{ color: '#888', fontSize: '16px' }}>You don't currently have any content in moderation.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ color: '#fff', textAlign: 'center', paddingTop: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Moderation History</h2>
            <p style={{ color: '#C0C0C0' }}>Your complete moderation history will be displayed here</p>
          </div>
        )}

        {activeTab === 'staking' && (
          <div style={{ color: '#fff', textAlign: 'center', paddingTop: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Staking Performance</h2>
            <p style={{ color: '#C0C0C0' }}>Your staking performance metrics will be displayed here</p>
          </div>
        )}

        {activeTab === 'influence' && (
          <div style={{ color: '#fff', textAlign: 'center', paddingTop: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Your Staker Influence</h2>
            <p style={{ color: '#C0C0C0' }}>Your influence as a staker in the community will be displayed here</p>
          </div>
        )}

        {/* Dev Controls */}
        <DevControls 
          onForceValidated={() => {}} // Pas utilisé ici mais requis par le composant
          forceValidated={false}
          additionalControls={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Section 1: Gestion des modérations */}
              <div style={{ borderTop: '1px solid #333', paddingTop: 12, marginTop: 12 }}>
                <strong style={{ color: '#FFD600', fontSize: 14, marginBottom: 10, display: 'block' }}>
                  📊 Moderation Management ({activeModerations.length} total)
                </strong>
                
                {/* Navigation forcée du carrousel */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <button 
                    onClick={prevModeration}
                    disabled={activeModerations.length <= 1}
                    style={{ 
                      background: activeModerations.length <= 1 ? '#222' : '#333', 
                      color: activeModerations.length <= 1 ? '#666' : '#FFD600', 
                      border: '1px solid #555', 
                      borderRadius: 4, 
                      padding: '6px 8px', 
                      fontSize: 11, 
                      cursor: activeModerations.length <= 1 ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    ← Prev
                  </button>
                  <span style={{ 
                    fontSize: 12, 
                    color: '#FFD600', 
                    textAlign: 'center', 
                    alignSelf: 'center' 
                  }}>
                    {activeModerations.length > 0 ? `${currentModerationIndex + 1} / ${activeModerations.length}` : 'No moderations'}
                  </span>
                  <button 
                    onClick={nextModeration}
                    disabled={activeModerations.length <= 1}
                    style={{ 
                      background: activeModerations.length <= 1 ? '#222' : '#333', 
                      color: activeModerations.length <= 1 ? '#666' : '#FFD600', 
                      border: '1px solid #555', 
                      borderRadius: 4, 
                      padding: '6px 8px', 
                      fontSize: 11, 
                      cursor: activeModerations.length <= 1 ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    Next →
                  </button>
                </div>

                {/* Boutons de gestion */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                  <button 
                    onClick={() => {
                      const newId = `TEST_${Date.now().toString().slice(-4)}`;
                      const newModeration: ModerationData = {
                        id: newId,
                        type: 'initial',
                        mintPrice: 100,
                        walletAddress: '0x1234AB...5678CD',
                        personalStaking: 150,
                        poolStaking: 1500,
                        personalStakingPercentage: 10,
                        validatedVotes: 10,
                        refusedVotes: 2,
                        totalModerators: 22,
                        userVote: 'valid',
                        conditions: {
                          poolStakingExceedsMint: true,
                          hybridRatioMet: true,
                          moderatorThresholdMet: true,
                        }
                      };
                      setActiveModerations([...activeModerations, newModeration]);
                      setCurrentModerationIndex(activeModerations.length);
                    }}
                    style={{ background: '#18C964', color: '#000', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 10, cursor: 'pointer', fontWeight: 600 }}
                  >
                    + Add Initial
                  </button>
                  <button 
                    onClick={() => {
                      const newId = `COMP_${Date.now().toString().slice(-4)}`;
                      const newModeration: ModerationData = {
                        id: newId,
                        type: 'completion',
                        mintPrice: 75,
                        walletAddress: '0x5678EF...9ABC10',
                        personalStaking: 120,
                        poolStaking: 1200,
                        personalStakingPercentage: 10,
                        validatedVotes: 8,
                        refusedVotes: 1,
                        totalModerators: 15,
                        userVote: 'valid',
                        userScore: 85,
                        averageScore: 82.3,
                        conditions: {
                          poolStakingExceedsMint: true,
                          hybridRatioMet: true,
                          moderatorThresholdMet: false,
                        }
                      };
                      setActiveModerations([...activeModerations, newModeration]);
                      setCurrentModerationIndex(activeModerations.length);
                    }}
                    style={{ background: '#FF9500', color: '#000', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 10, cursor: 'pointer', fontWeight: 600 }}
                  >
                    + Add Completion
                  </button>
                  <button 
                    onClick={() => {
                      if (activeModerations.length > 0) {
                        const newModerations = activeModerations.filter((_, index) => index !== currentModerationIndex);
                        setActiveModerations(newModerations);
                        setCurrentModerationIndex(Math.max(0, Math.min(currentModerationIndex, newModerations.length - 1)));
                      }
                    }}
                    disabled={activeModerations.length === 0}
                    style={{ 
                      background: activeModerations.length === 0 ? '#222' : '#FF3333', 
                      color: activeModerations.length === 0 ? '#666' : '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 10, 
                      cursor: activeModerations.length === 0 ? 'not-allowed' : 'pointer', 
                      fontWeight: 600 
                    }}
                  >
                    🗑️ Remove Current
                  </button>
                  <button 
                    onClick={() => {
                      setActiveModerations([]);
                      setCurrentModerationIndex(0);
                    }}
                    disabled={activeModerations.length === 0}
                    style={{ 
                      background: activeModerations.length === 0 ? '#222' : '#AA1111', 
                      color: activeModerations.length === 0 ? '#666' : '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 10, 
                      cursor: activeModerations.length === 0 ? 'not-allowed' : 'pointer', 
                      fontWeight: 600 
                    }}
                  >
                    🗑️ Clear All
                  </button>
                </div>

                {/* Presets rapides */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => {
                      const presets: ModerationData[] = [
                        {
                          id: 'INIT_VALID',
                          type: 'initial',
                          mintPrice: 100,
                          walletAddress: '0x9B28EP...75A0G9BR',
                          personalStaking: 200,
                          poolStaking: 2400,
                          personalStakingPercentage: 8.3,
                          validatedVotes: 18,
                          refusedVotes: 4,
                          totalModerators: 22,
                          userVote: 'valid',
                          conditions: { poolStakingExceedsMint: true, hybridRatioMet: true, moderatorThresholdMet: true }
                        },
                        {
                          id: 'COMP_HIGH',
                          type: 'completion',
                          mintPrice: 150,
                          walletAddress: '0x7A15BC...23F8D1AC',
                          personalStaking: 300,
                          poolStaking: 3000,
                          personalStakingPercentage: 10,
                          validatedVotes: 20,
                          refusedVotes: 2,
                          totalModerators: 22,
                          userVote: 'valid',
                          userScore: 95,
                          averageScore: 91.2,
                          conditions: { poolStakingExceedsMint: true, hybridRatioMet: true, moderatorThresholdMet: true }
                        }
                      ];
                      setActiveModerations(presets);
                      setCurrentModerationIndex(0);
                    }}
                    style={{ background: '#333', color: '#18C964', border: '1px solid #555', borderRadius: 4, padding: '2px 6px', fontSize: 9, cursor: 'pointer' }}
                  >
                    ✅ All Valid
                  </button>
                  <button 
                    onClick={() => {
                      const presets: ModerationData[] = [
                        {
                          id: 'INIT_FAIL',
                          type: 'initial',
                          mintPrice: 200,
                          walletAddress: '0x1111AA...2222BB',
                          personalStaking: 50,
                          poolStaking: 150, // Moins que MINT price
                          personalStakingPercentage: 33.3,
                          validatedVotes: 3,
                          refusedVotes: 8,
                          totalModerators: 11, // Moins de 22
                          userVote: 'refuse',
                          conditions: { poolStakingExceedsMint: false, hybridRatioMet: false, moderatorThresholdMet: false }
                        }
                      ];
                      setActiveModerations(presets);
                      setCurrentModerationIndex(0);
                    }}
                    style={{ background: '#333', color: '#FF3333', border: '1px solid #555', borderRadius: 4, padding: '2px 6px', fontSize: 9, cursor: 'pointer' }}
                  >
                    ❌ All Failed
                  </button>
                  <button 
                    onClick={() => {
                      const presets: ModerationData[] = [
                        {
                          id: 'INIT_MIX',
                          type: 'initial',
                          mintPrice: 100,
                          walletAddress: '0x3333CC...4444DD',
                          personalStaking: 150,
                          poolStaking: 1500,
                          personalStakingPercentage: 10,
                          validatedVotes: 12,
                          refusedVotes: 5,
                          totalModerators: 22,
                          userVote: 'valid',
                          conditions: { poolStakingExceedsMint: true, hybridRatioMet: false, moderatorThresholdMet: true }
                        },
                        {
                          id: 'COMP_LOW',
                          type: 'completion',
                          mintPrice: 80,
                          walletAddress: '0x5555EE...6666FF',
                          personalStaking: 80,
                          poolStaking: 800,
                          personalStakingPercentage: 10,
                          validatedVotes: 6,
                          refusedVotes: 3,
                          totalModerators: 12,
                          userVote: 'refuse',
                          userScore: 25,
                          averageScore: 42.8,
                          conditions: { poolStakingExceedsMint: true, hybridRatioMet: true, moderatorThresholdMet: false }
                        }
                      ];
                      setActiveModerations(presets);
                      setCurrentModerationIndex(0);
                    }}
                    style={{ background: '#333', color: '#FFD600', border: '1px solid #555', borderRadius: 4, padding: '2px 6px', fontSize: 9, cursor: 'pointer' }}
                  >
                    ⚡ Mixed
                  </button>
                </div>
              </div>

              {/* Section 2: Modification de la modération actuelle */}
              {activeModerations.length > 0 && (
                <div style={{ borderTop: '1px solid #333', paddingTop: 12, marginTop: 12 }}>
                  <strong style={{ color: '#FFD600', fontSize: 14, marginBottom: 10, display: 'block' }}>
                    ⚙️ Current Moderation: {activeModerations[currentModerationIndex]?.id} ({activeModerations[currentModerationIndex]?.type})
                  </strong>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
                    {/* Type de modération */}
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 11, color: '#FFD600' }}>Type</span>
                                             <select
                         value={activeModerations[currentModerationIndex]?.type || 'initial'}
                         onChange={(e) => {
                           const newModerations = [...activeModerations];
                           const current = newModerations[currentModerationIndex];
                           if (e.target.value === 'completion' && current.type === 'initial') {
                             // Convertir en completion - recréer l'objet avec le bon type
                             const newCompletion: CompletionModerationData = {
                               ...current,
                               type: 'completion',
                               userScore: 85,
                               averageScore: 82
                             };
                             newModerations[currentModerationIndex] = newCompletion;
                           } else if (e.target.value === 'initial' && current.type === 'completion') {
                             // Convertir en initial - recréer l'objet avec le bon type
                             const { userScore, averageScore, ...rest } = current as CompletionModerationData;
                             const newInitial: InitialModerationData = {
                               ...rest,
                               type: 'initial'
                             };
                             newModerations[currentModerationIndex] = newInitial;
                           }
                           setActiveModerations(newModerations);
                         }}
                        style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 11 }}
                      >
                        <option value="initial">Initial</option>
                        <option value="completion">Completion</option>
                      </select>
                    </label>

                    {/* MINT Price */}
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 11, color: '#FFD600' }}>MINT Price</span>
                      <input
                        type="number"
                        value={activeModerations[currentModerationIndex]?.mintPrice || 100}
                        min={1}
                        max={1000}
                        onChange={(e) => {
                          const newModerations = [...activeModerations];
                          newModerations[currentModerationIndex].mintPrice = parseInt(e.target.value) || 100;
                          // Recalculer la condition 1
                          newModerations[currentModerationIndex].conditions.poolStakingExceedsMint = 
                            newModerations[currentModerationIndex].poolStaking >= newModerations[currentModerationIndex].mintPrice;
                          setActiveModerations(newModerations);
                        }}
                        style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 11 }}
                      />
                    </label>

                    {/* Personal Staking */}
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 11, color: '#FFD600' }}>Personal Staking</span>
                      <input
                        type="number"
                        value={activeModerations[currentModerationIndex]?.personalStaking || 100}
                        min={1}
                        max={5000}
                        onChange={(e) => {
                          const newModerations = [...activeModerations];
                          const personal = parseInt(e.target.value) || 100;
                          newModerations[currentModerationIndex].personalStaking = personal;
                          // Recalculer le pourcentage
                          newModerations[currentModerationIndex].personalStakingPercentage = 
                            Math.round((personal / newModerations[currentModerationIndex].poolStaking) * 100 * 10) / 10;
                          setActiveModerations(newModerations);
                        }}
                        style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 11 }}
                      />
                    </label>

                    {/* Pool Staking */}
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 11, color: '#FFD600' }}>Pool Staking</span>
                      <input
                        type="number"
                        value={activeModerations[currentModerationIndex]?.poolStaking || 1000}
                        min={1}
                        max={10000}
                        onChange={(e) => {
                          const newModerations = [...activeModerations];
                          const pool = parseInt(e.target.value) || 1000;
                          newModerations[currentModerationIndex].poolStaking = pool;
                          // Recalculer les pourcentages et conditions
                          newModerations[currentModerationIndex].personalStakingPercentage = 
                            Math.round((newModerations[currentModerationIndex].personalStaking / pool) * 100 * 10) / 10;
                          newModerations[currentModerationIndex].conditions.poolStakingExceedsMint = 
                            pool >= newModerations[currentModerationIndex].mintPrice;
                          setActiveModerations(newModerations);
                        }}
                        style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 11 }}
                      />
                    </label>

                    {/* Validated Votes */}
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 11, color: '#00FF00' }}>Valid Votes</span>
                      <input
                        type="number"
                        value={activeModerations[currentModerationIndex]?.validatedVotes || 0}
                        min={0}
                        max={30}
                        onChange={(e) => {
                          const newModerations = [...activeModerations];
                          const valid = parseInt(e.target.value) || 0;
                          newModerations[currentModerationIndex].validatedVotes = valid;
                          const refused = newModerations[currentModerationIndex].refusedVotes;
                          // Recalculer la condition hybrid ratio (2:1 minimum)
                          newModerations[currentModerationIndex].conditions.hybridRatioMet = 
                            (valid >= 2 * refused) || (refused >= 2 * valid);
                          setActiveModerations(newModerations);
                        }}
                        style={{ background: '#111', color: '#00FF00', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 11 }}
                      />
                    </label>

                    {/* Refused Votes */}
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 11, color: '#FF0000' }}>Refuse Votes</span>
                      <input
                        type="number"
                        value={activeModerations[currentModerationIndex]?.refusedVotes || 0}
                        min={0}
                        max={30}
                        onChange={(e) => {
                          const newModerations = [...activeModerations];
                          const refused = parseInt(e.target.value) || 0;
                          newModerations[currentModerationIndex].refusedVotes = refused;
                          const valid = newModerations[currentModerationIndex].validatedVotes;
                          // Recalculer la condition hybrid ratio
                          newModerations[currentModerationIndex].conditions.hybridRatioMet = 
                            (valid >= 2 * refused) || (refused >= 2 * valid);
                          setActiveModerations(newModerations);
                        }}
                        style={{ background: '#111', color: '#FF0000', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 11 }}
                      />
                    </label>
                  </div>

                  {/* Total Moderators et User Vote */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 11, color: '#FFD600' }}>Total Moderators</span>
                      <input
                        type="number"
                        value={activeModerations[currentModerationIndex]?.totalModerators || 22}
                        min={1}
                        max={50}
                        onChange={(e) => {
                          const newModerations = [...activeModerations];
                          const total = parseInt(e.target.value) || 22;
                          newModerations[currentModerationIndex].totalModerators = total;
                          // Recalculer la condition de seuil
                          newModerations[currentModerationIndex].conditions.moderatorThresholdMet = total >= 22;
                          setActiveModerations(newModerations);
                        }}
                        style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 11 }}
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 11, color: '#FFD600' }}>Your Vote</span>
                      <select
                        value={activeModerations[currentModerationIndex]?.userVote || 'valid'}
                        onChange={(e) => {
                          const newModerations = [...activeModerations];
                          newModerations[currentModerationIndex].userVote = e.target.value as 'valid' | 'refuse' | null;
                          setActiveModerations(newModerations);
                        }}
                        style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 11 }}
                      >
                        <option value="valid">Valid</option>
                        <option value="refuse">Refuse</option>
                        <option value={null}>Not voted</option>
                      </select>
                    </label>
                  </div>

                  {/* Scores pour les completions */}
                  {activeModerations[currentModerationIndex]?.type === 'completion' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 11, color: '#FFD600' }}>Your Score</span>
                        <input
                          type="number"
                          value={(activeModerations[currentModerationIndex] as CompletionModerationData)?.userScore || 85}
                          min={0}
                          max={100}
                          onChange={(e) => {
                            const newModerations = [...activeModerations];
                            (newModerations[currentModerationIndex] as CompletionModerationData).userScore = parseInt(e.target.value) || 85;
                            setActiveModerations(newModerations);
                          }}
                          style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 11 }}
                        />
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 11, color: '#FFD600' }}>Average Score</span>
                        <input
                          type="number"
                          value={(activeModerations[currentModerationIndex] as CompletionModerationData)?.averageScore || 82}
                          min={0}
                          max={100}
                          step={0.1}
                          onChange={(e) => {
                            const newModerations = [...activeModerations];
                            (newModerations[currentModerationIndex] as CompletionModerationData).averageScore = parseFloat(e.target.value) || 82;
                            setActiveModerations(newModerations);
                          }}
                          style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 11 }}
                        />
                      </label>
                    </div>
                  )}

                  {/* Status des conditions */}
                  <div style={{ marginTop: 8, padding: 8, background: '#111', borderRadius: 4, border: '1px solid #333' }}>
                    <div style={{ fontSize: 11, color: '#FFD600', marginBottom: 4 }}>Conditions Status:</div>
                    <div style={{ fontSize: 10, color: activeModerations[currentModerationIndex]?.conditions.poolStakingExceedsMint ? '#00FF00' : '#FF0000' }}>
                      Pool ≥ MINT: {activeModerations[currentModerationIndex]?.conditions.poolStakingExceedsMint ? '✅' : '❌'}
                    </div>
                    <div style={{ fontSize: 10, color: activeModerations[currentModerationIndex]?.conditions.hybridRatioMet ? '#00FF00' : '#FF0000' }}>
                      Hybrid 2:1: {activeModerations[currentModerationIndex]?.conditions.hybridRatioMet ? '✅' : '❌'}
                    </div>
                    <div style={{ fontSize: 10, color: activeModerations[currentModerationIndex]?.conditions.moderatorThresholdMet ? '#00FF00' : '#FF0000' }}>
                      Threshold 22+: {activeModerations[currentModerationIndex]?.conditions.moderatorThresholdMet ? '✅' : '❌'}
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Informations générales */}
              <div style={{ borderTop: '1px solid #333', paddingTop: 12, marginTop: 12 }}>
                <div style={{ fontSize: 11, color: '#666', fontStyle: 'italic' }}>
                  💡 <strong>Dev Mode Tips:</strong><br/>
                  🔄 <strong>Carrousel:</strong> Navigate between different moderation states<br/>
                  📊 <strong>Initial:</strong> Content creation moderation (B2C/Agency/Individual)<br/>
                  🎯 <strong>Completion:</strong> User-generated content moderation with scoring<br/>
                  ⚖️ <strong>Conditions:</strong> Pool ≥ MINT + Hybrid 2:1 ratio + 22+ moderators<br/>
                  🎨 <strong>Real-time:</strong> All changes update the UI immediately
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
} 