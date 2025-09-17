import React, { useState, useEffect } from 'react';
import { 
  evaluateModeration, 
  ModerationStatus, 
  ContentType,
  computePayoutsAndXP,
  ParticipantData
} from '@/lib/moderation-engine';

interface ModerationProgressPanelHybridProps {
  stakers: number;
  stakedAmount: number;
  mintPrice: number;
  validVotes: number;
  refuseVotes: number;
  totalVotes: number;
  averageScore?: number;
  campaignType?: 'creation' | 'completion';
  creatorType?: 'b2c' | 'agency' | 'individual';
  style?: React.CSSProperties;
  onClick?: () => void;
  stakeYes?: number;
  stakeNo?: number;
  participantsActive?: ParticipantData[];
  participantsPassive?: ParticipantData[];
  contentType?: ContentType;
  priceUSDC?: number;
  wincPerUSDC?: string;
}

const ModerationProgressPanelHybrid: React.FC<ModerationProgressPanelHybridProps> = ({
  stakers,
  stakedAmount,
  mintPrice,
  validVotes,
  refuseVotes,
  totalVotes,
  averageScore,
  campaignType,
  creatorType,
  style,
  onClick,
  stakeYes = 0,
  stakeNo = 0,
  participantsActive = [],
  participantsPassive = [],
  contentType = ContentType.INITIAL_B2C,
  priceUSDC = 1000,
  wincPerUSDC = '1000000000000000000' // 1 WINC = 1 USDC par défaut
}) => {
  const [moderationResult, setModerationResult] = useState<any>(null);
  const [payoutResult, setPayoutResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Évaluation de la modération avec le système hybride
  useEffect(() => {
    const evaluateModerationStatus = async () => {
      setIsLoading(true);
      try {
        const result = evaluateModeration(
          validVotes,
          refuseVotes,
          BigInt(Math.floor(stakeYes * 1e18)),
          BigInt(Math.floor(stakeNo * 1e18)),
          mintPrice,
          Date.now(),
          Date.now() + 7 * 24 * 3600 * 1000, // 7 jours
          BigInt(wincPerUSDC)
        );

        setModerationResult(result);

        // Si décision finale, calculer les paiements
        if (result.status === ModerationStatus.VALIDATED || 
            result.status === ModerationStatus.REJECTED) {
          const payout = computePayoutsAndXP(
            contentType,
            priceUSDC,
            validVotes,
            refuseVotes,
            BigInt(Math.floor(stakeYes * 1e18)),
            BigInt(Math.floor(stakeNo * 1e18)),
            participantsActive,
            participantsPassive,
            BigInt(wincPerUSDC)
          );
          setPayoutResult(payout);
        }
      } catch (error) {
        console.error('Error evaluating moderation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    evaluateModerationStatus();
  }, [validVotes, refuseVotes, stakeYes, stakeNo, mintPrice, contentType, priceUSDC, participantsActive, participantsPassive, wincPerUSDC]);

  // Calculs des conditions de validation
  const condition1Met = totalVotes >= 22;
  const condition2Met = stakedAmount >= mintPrice;
  
  // Scores hybrides (convertis de fixed-point)
  const scoreYes = moderationResult ? Number(moderationResult.scoreYes) / 1e18 : 0;
  const scoreNo = moderationResult ? Number(moderationResult.scoreNo) / 1e18 : 0;
  const condition3Met = moderationResult ? 
    (moderationResult.status === ModerationStatus.VALIDATED || moderationResult.status === ModerationStatus.REJECTED) : 
    false;

  // VictoryFactor (converti de fixed-point)
  const victoryFactor = moderationResult?.victoryFactor ? 
    Number(moderationResult.victoryFactor) / 1e18 : 0;

  // Calcul du pourcentage de remplissage pour le score
  const getScoreFillPercentage = (score: number) => {
    return Math.max(0, Math.min(100, score * 100));
  };

  // Couleur dynamique du score
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#00FF00'; // Vert foncé
    if (score >= 0.6) return '#90EE90'; // Vert clair
    if (score >= 0.4) return '#FFD700'; // Jaune
    if (score >= 0.2) return '#FFA500'; // Orange
    return '#FF0000'; // Rouge
  };

  // Couleur de fond du score
  const getScoreBackgroundColor = (score: number) => {
    if (score >= 0.8) return 'rgba(0, 255, 0, 0.1)';
    if (score >= 0.6) return 'rgba(144, 238, 144, 0.1)';
    if (score >= 0.4) return 'rgba(255, 215, 0, 0.1)';
    if (score >= 0.2) return 'rgba(255, 165, 0, 0.1)';
    return 'rgba(255, 0, 0, 0.1)';
  };

  // Couleur de bordure du score
  const getScoreBorderColor = (score: number) => {
    if (score >= 0.8) return '#00FF00';
    if (score >= 0.6) return '#90EE90';
    if (score >= 0.4) return '#FFD700';
    if (score >= 0.2) return '#FFA500';
    return '#FF0000';
  };

  // Statut de la modération
  const getModerationStatusText = () => {
    if (!moderationResult) return 'Calcul en cours...';
    
    switch (moderationResult.status) {
      case ModerationStatus.PENDING_REQUIREMENTS:
        return `En attente: ${moderationResult.reason}`;
      case ModerationStatus.EN_COURS:
        return 'Modération en cours - Seuil 2:1 hybride non atteint';
      case ModerationStatus.VALIDATED:
        return '✅ Contenu validé';
      case ModerationStatus.REJECTED:
        return '❌ Contenu rejeté';
      case ModerationStatus.REQUIRES_ESCALATION:
        return '⚠️ Escalade requise';
      default:
        return 'Statut inconnu';
    }
  };

  // Couleur du statut
  const getStatusColor = () => {
    if (!moderationResult) return '#FFD700';
    
    switch (moderationResult.status) {
      case ModerationStatus.VALIDATED:
        return '#00FF00';
      case ModerationStatus.REJECTED:
        return '#FF0000';
      case ModerationStatus.EN_COURS:
        return '#FFA500';
      case ModerationStatus.REQUIRES_ESCALATION:
        return '#FF6B6B';
      default:
        return '#FFD700';
    }
  };

  return (
    <div style={style}>
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '18px',
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          minWidth: '340px',
          maxHeight: '55vh',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease'
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          if (onClick) {
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.6)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (onClick) {
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {/* En-tête avec statut */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ 
            color: getStatusColor(), 
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {getModerationStatusText()}
          </h3>
          {isLoading && (
            <div style={{ color: '#FFD700', fontSize: '12px' }}>
              Calcul des scores hybrides...
            </div>
          )}
        </div>

        {/* Conditions de validation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '14px'
          }}>
            <span style={{ color: '#CCCCCC' }}>Min. 22 Stakers:</span>
            <span style={{ 
              color: condition1Met ? '#00FF00' : '#FF0000',
              fontWeight: 'bold'
            }}>
              {totalVotes}/22 {condition1Met ? '✅' : '❌'}
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '14px'
          }}>
            <span style={{ color: '#CCCCCC' }}>Pool &gt; MINT:</span>
            <span style={{ 
              color: condition2Met ? '#00FF00' : '#FF0000',
              fontWeight: 'bold'
            }}>
              ${stakedAmount.toFixed(2)}/${mintPrice} {condition2Met ? '✅' : '❌'}
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '14px'
          }}>
            <span style={{ color: '#CCCCCC' }}>Ratio 2:1 Hybride:</span>
            <span style={{ 
              color: condition3Met ? '#00FF00' : '#FFA500',
              fontWeight: 'bold'
            }}>
              {condition3Met ? '✅' : '⏳'}
            </span>
          </div>
        </div>

        {/* Scores hybrides détaillés */}
        {moderationResult && (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            padding: '12px', 
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ 
              fontSize: '13px', 
              color: '#CCCCCC', 
              marginBottom: '8px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              Scores Hybrides 50/50
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ color: '#00FF00', fontSize: '12px', marginBottom: '4px' }}>OUI</div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: getScoreColor(scoreYes)
                }}>
                  {(scoreYes * 100).toFixed(1)}%
                </div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ color: '#FF0000', fontSize: '12px', marginBottom: '4px' }}>NON</div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: getScoreColor(scoreNo)
                }}>
                  {(scoreNo * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Barres de progression */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{ 
                flex: 1, 
                height: '8px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${getScoreFillPercentage(scoreYes)}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${getScoreColor(scoreYes)}, ${getScoreColor(scoreYes)}80)`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ 
                flex: 1, 
                height: '8px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${getScoreFillPercentage(scoreNo)}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${getScoreColor(scoreNo)}, ${getScoreColor(scoreNo)}80)`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* VictoryFactor */}
            {victoryFactor > 0 && (
              <div style={{ 
                textAlign: 'center', 
                fontSize: '11px', 
                color: '#FFD700',
                marginTop: '8px'
              }}>
                Victory Factor: {(victoryFactor * 100).toFixed(1)}%
              </div>
            )}
          </div>
        )}

        {/* Résumé des paiements si disponible */}
        {payoutResult && (
          <div style={{ 
            background: 'rgba(0, 255, 0, 0.1)', 
            padding: '12px', 
            borderRadius: '8px',
            border: '1px solid rgba(0, 255, 0, 0.3)'
          }}>
            <div style={{ 
              fontSize: '13px', 
              color: '#00FF00', 
              marginBottom: '8px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              Résumé des Paiements
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#CCCCCC' }}>Total Payout:</span>
              <span style={{ color: '#00FF00' }}>
                {(Number(payoutResult.summary.totalPaidWINC) / 1e18).toFixed(2)} WINC
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#CCCCCC' }}>Total Penalties:</span>
              <span style={{ color: '#FF6B6B' }}>
                {(Number(payoutResult.summary.totalPenaltiesWINC) / 1e18).toFixed(2)} WINC
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#CCCCCC' }}>Active Pool:</span>
              <span style={{ color: '#FFD700' }}>
                {(Number(payoutResult.summary.activePoolWINC) / 1e18).toFixed(2)} WINC
              </span>
            </div>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '12px',
          color: '#888888',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '8px'
        }}>
          <span>Stakers: {stakers}</span>
          <span>Votes: {totalVotes}</span>
        </div>
      </div>
    </div>
  );
};

export default ModerationProgressPanelHybrid;
