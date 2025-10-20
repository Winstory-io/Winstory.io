'use client';

import React, { useState, useEffect } from 'react';

interface ModerationStatsProps {
  campaignId: string;
  completionId: string;
  communityData: {
    validVotes: number;
    refuseVotes: number;
    averageScore: number;
    decision: 'VALID' | 'REFUSE';
    stakersCount: number;
    stakingPool: number;
  };
  superModeratorData?: {
    voteDecision: 'VALID' | 'REFUSE';
    score?: number;
    finalScore?: number;
    finalDecision?: 'VALID' | 'REFUSE';
    timestamp: string;
  };
  showDetailedBreakdown?: boolean;
}

interface ScoreBreakdown {
  communityScore: number;
  communityWeight: number;
  superModeratorScore?: number;
  superModeratorWeight?: number;
  finalScore: number;
  calculationFormula: string;
}

export default function ModerationStats({
  campaignId,
  completionId,
  communityData,
  superModeratorData,
  showDetailedBreakdown = false
}: ModerationStatsProps) {
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculer le breakdown du score
  useEffect(() => {
    const calculateScoreBreakdown = async () => {
      if (!superModeratorData?.score) {
        // Pas de Super-Modérateur
        setScoreBreakdown({
          communityScore: communityData.averageScore,
          communityWeight: 1.0,
          finalScore: communityData.averageScore,
          calculationFormula: 'Score final = Score communautaire (100%)'
        });
        return;
      }

      setIsCalculating(true);

      try {
        const response = await fetch('/api/moderation/final-score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campaignId,
            completionId,
            communityScore: communityData.averageScore,
            communityDecision: communityData.decision,
            superModeratorScore: superModeratorData.score,
            superModeratorDecision: superModeratorData.voteDecision
          }),
        });

        const result = await response.json();

        if (result.success) {
          setScoreBreakdown({
            communityScore: result.calculationBreakdown.communityScore,
            communityWeight: result.calculationBreakdown.communityWeight,
            superModeratorScore: result.calculationBreakdown.superModeratorScore,
            superModeratorWeight: result.calculationBreakdown.superModeratorWeight,
            finalScore: result.finalScore,
            calculationFormula: 'Score final = (Communauté × 49%) + (Super-Modérateur × 51%)'
          });
        }
      } catch (error) {
        console.error('Erreur lors du calcul du score:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateScoreBreakdown();
  }, [campaignId, completionId, communityData, superModeratorData]);

  const getDecisionColor = (decision: 'VALID' | 'REFUSE') => {
    return decision === 'VALID' ? '#00FF00' : '#FF2D2D';
  };

  const getDecisionIcon = (decision: 'VALID' | 'REFUSE') => {
    return decision === 'VALID' ? '✅' : '❌';
  };

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.8)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      margin: '16px 0'
    }}>
      {/* En-tête */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(255, 215, 0, 0.3)'
      }}>
        <h3 style={{
          color: '#FFD600',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: 0
        }}>
          📊 Statistiques de Modération
        </h3>
        <div style={{
          fontSize: '14px',
          color: '#ccc'
        }}>
          {completionId}
        </div>
      </div>

      {/* Données communautaires */}
      <div style={{
        background: 'rgba(0, 255, 0, 0.1)',
        border: '1px solid rgba(0, 255, 0, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#00FF00',
          marginBottom: '12px'
        }}>
          🏘️ Modération Communautaire
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          fontSize: '14px'
        }}>
          <div>
            <div style={{ color: '#ccc', marginBottom: '4px' }}>Votes OUI</div>
            <div style={{ color: '#00FF00', fontWeight: 'bold', fontSize: '16px' }}>
              {communityData.validVotes}
            </div>
          </div>
          <div>
            <div style={{ color: '#ccc', marginBottom: '4px' }}>Votes NON</div>
            <div style={{ color: '#FF2D2D', fontWeight: 'bold', fontSize: '16px' }}>
              {communityData.refuseVotes}
            </div>
          </div>
          <div>
            <div style={{ color: '#ccc', marginBottom: '4px' }}>Score moyen</div>
            <div style={{ color: '#FFD600', fontWeight: 'bold', fontSize: '16px' }}>
              {communityData.averageScore}/100
            </div>
          </div>
          <div>
            <div style={{ color: '#ccc', marginBottom: '4px' }}>Décision</div>
            <div style={{ 
              color: getDecisionColor(communityData.decision), 
              fontWeight: 'bold', 
              fontSize: '16px' 
            }}>
              {getDecisionIcon(communityData.decision)} {communityData.decision}
            </div>
          </div>
          <div>
            <div style={{ color: '#ccc', marginBottom: '4px' }}>Stakers</div>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
              {communityData.stakersCount}
            </div>
          </div>
          <div>
            <div style={{ color: '#ccc', marginBottom: '4px' }}>Pool staking</div>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
              ${communityData.stakingPool.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Données Super-Modérateur */}
      {superModeratorData && (
        <div style={{
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#FFD600',
            marginBottom: '12px'
          }}>
            👑 Super-Modérateur
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            fontSize: '14px'
          }}>
            <div>
              <div style={{ color: '#ccc', marginBottom: '4px' }}>Vote</div>
              <div style={{ 
                color: getDecisionColor(superModeratorData.voteDecision), 
                fontWeight: 'bold', 
                fontSize: '16px' 
              }}>
                {getDecisionIcon(superModeratorData.voteDecision)} {superModeratorData.voteDecision}
              </div>
            </div>
            <div>
              <div style={{ color: '#ccc', marginBottom: '4px' }}>Score</div>
              <div style={{ color: '#FFD600', fontWeight: 'bold', fontSize: '16px' }}>
                {superModeratorData.score || 'N/A'}/100
              </div>
            </div>
            <div>
              <div style={{ color: '#ccc', marginBottom: '4px' }}>Date</div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
                {new Date(superModeratorData.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown détaillé du score */}
      {showDetailedBreakdown && scoreBreakdown && (
        <div style={{
          background: 'rgba(255, 215, 0, 0.05)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#FFD600',
            marginBottom: '12px'
          }}>
            🧮 Calcul du Score Final
          </div>
          
          {isCalculating ? (
            <div style={{
              color: '#FFD600',
              fontSize: '14px',
              textAlign: 'center',
              padding: '20px'
            }}>
              ⏳ Calcul en cours...
            </div>
          ) : (
            <div style={{ fontSize: '14px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{ color: '#ccc', marginBottom: '4px' }}>Score Communauté</div>
                  <div style={{ color: '#00FF00', fontWeight: 'bold' }}>
                    {scoreBreakdown.communityScore}/100
                  </div>
                </div>
                <div>
                  <div style={{ color: '#ccc', marginBottom: '4px' }}>Poids Communauté</div>
                  <div style={{ color: '#00FF00', fontWeight: 'bold' }}>
                    {(scoreBreakdown.communityWeight * 100).toFixed(0)}%
                  </div>
                </div>
                {scoreBreakdown.superModeratorScore !== undefined && (
                  <>
                    <div>
                      <div style={{ color: '#ccc', marginBottom: '4px' }}>Score Super-Mod</div>
                      <div style={{ color: '#FFD600', fontWeight: 'bold' }}>
                        {scoreBreakdown.superModeratorScore}/100
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#ccc', marginBottom: '4px' }}>Poids Super-Mod</div>
                      <div style={{ color: '#FFD600', fontWeight: 'bold' }}>
                        {((scoreBreakdown.superModeratorWeight || 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '6px',
                padding: '12px',
                marginTop: '12px'
              }}>
                <div style={{ color: '#ccc', marginBottom: '8px' }}>Formule:</div>
                <div style={{ color: '#FFD600', fontWeight: 'bold', fontSize: '12px' }}>
                  {scoreBreakdown.calculationFormula}
                </div>
                <div style={{ 
                  color: '#FFD600', 
                  fontWeight: 'bold', 
                  fontSize: '18px',
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  Score Final: {scoreBreakdown.finalScore}/100
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Résultat final */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.1)',
        border: '2px solid rgba(255, 215, 0, 0.5)',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#FFD600',
          marginBottom: '8px'
        }}>
          🎯 Résultat Final
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: getDecisionColor(superModeratorData?.finalDecision || communityData.decision),
          marginBottom: '4px'
        }}>
          {getDecisionIcon(superModeratorData?.finalDecision || communityData.decision)} {' '}
          {superModeratorData?.finalDecision || communityData.decision}
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#FFD600'
        }}>
          Score: {superModeratorData?.finalScore || communityData.averageScore}/100
        </div>
      </div>
    </div>
  );
}