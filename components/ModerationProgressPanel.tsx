import React from 'react';

interface ModerationProgressPanelProps {
  stakers: number;
  stakersRequired: number;
  stakedAmount: number;
  mintPrice: number;
  validVotes: number;
  refuseVotes: number;
  totalVotes: number;
  averageScore?: number;
  campaignType?: 'creation' | 'completion';
  creatorType?: 'b2c' | 'agency' | 'individual';
  style?: React.CSSProperties;
}

const ModerationProgressPanel: React.FC<ModerationProgressPanelProps> = ({
  stakers,
  stakersRequired,
  stakedAmount,
  mintPrice,
  validVotes,
  refuseVotes,
  totalVotes,
  averageScore,
  campaignType,
  creatorType,
  style
}) => {
  // Calculs pour les 3 conditions de validation
  const condition1Met = totalVotes >= 22; // 22 modérateurs minimum ont voté
  const condition2Met = stakedAmount >= mintPrice; // $WINC Staked > MINT price
  const condition3Met = (validVotes >= 2 * refuseVotes) || (refuseVotes >= 2 * validVotes); // 2:1 ratio minimum

  // Calcul du pourcentage de remplissage pour le score
  const getScoreFillPercentage = (score: number) => {
    return Math.max(0, Math.min(100, score));
  };

  // Couleur dynamique du score (rouge -> orange -> jaune -> vert clair -> vert foncé)
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00FF00'; // Vert foncé
    if (score >= 60) return '#90EE90'; // Vert clair
    if (score >= 40) return '#FFD700'; // Jaune
    if (score >= 20) return '#FFA500'; // Orange
    return '#FF0000'; // Rouge
  };

  // Couleur de fond du score
  const getScoreBackgroundColor = (score: number) => {
    if (score >= 80) return 'rgba(0, 255, 0, 0.1)';
    if (score >= 60) return 'rgba(144, 238, 144, 0.1)';
    if (score >= 40) return 'rgba(255, 215, 0, 0.1)';
    if (score >= 20) return 'rgba(255, 165, 0, 0.1)';
    return 'rgba(255, 0, 0, 0.1)';
  };

  // Couleur de bordure du score
  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return '#00FF00';
    if (score >= 60) return '#90EE90';
    if (score >= 40) return '#FFD700';
    if (score >= 20) return '#FFA500';
    return '#FF0000';
  };

  return (
    <div style={style}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '24px',
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        minWidth: '320px'
      }}>
        
        {/* Condition 1: 22 modérateurs minimum ont voté */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 600,
            color: condition1Met ? '#00FF00' : '#FFD600'
          }}>
            <span>22 modérateurs minimum ont voté</span>
            <span style={{ color: condition1Met ? '#00FF00' : '#FFD600' }}>
              {totalVotes}/22
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 215, 0, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min((totalVotes / 22) * 100, 100)}%`,
              height: '100%',
              background: condition1Met ? '#00FF00' : '#FFD600',
              borderRadius: '4px',
              transition: 'width 0.5s ease'
            }}></div>
          </div>
          <div style={{
            fontSize: '12px',
            color: condition1Met ? '#00FF00' : '#999',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {condition1Met ? '✅ Condition 1 atteinte!' : `${22 - totalVotes} votes restants`}
          </div>
        </div>

        {/* Condition 2: $WINC Staked > MINT price */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: condition2Met ? '#00FF00' : '#FFD600',
            textAlign: 'center'
          }}>
            $WINC Staked &gt; MINT Price
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 215, 0, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min((stakedAmount / mintPrice) * 100, 100)}%`,
              height: '100%',
              background: condition2Met ? '#00FF00' : '#FFD600',
              borderRadius: '4px',
              transition: 'width 0.5s ease'
            }}></div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFD600'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>Currently Staked</span>
              <span>{stakedAmount} $WINC</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>MINT Price Target</span>
              <span>{mintPrice} $WINC</span>
            </div>
          </div>
          <div style={{
            fontSize: '12px',
            color: condition2Met ? '#00FF00' : '#999',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {condition2Met ? '✅ Condition 2 atteinte!' : `Need ${mintPrice - stakedAmount} more $WINC`}
          </div>
        </div>

        {/* Condition 3: 2:1 ratio minimum Valid/Refuse */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: condition3Met ? '#00FF00' : '#FFD600',
            textAlign: 'center'
          }}>
            2:1 ratio minimum Valid/Refuse
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFD600'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>Valid Votes</span>
              <span style={{ color: '#00FF00' }}>{validVotes}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>Refuse Votes</span>
              <span style={{ color: '#FF0000' }}>{refuseVotes}</span>
            </div>
          </div>
          <div style={{
            fontSize: '12px',
            color: condition3Met ? '#00FF00' : '#999',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {condition3Met ? '✅ Condition 3 atteinte!' : 'Ratio 2:1 non atteint'}
          </div>
        </div>

        {/* Score moyen pour les complétions avec couleur dynamique */}
        {campaignType === 'completion' && averageScore !== undefined && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFD600',
              textAlign: 'center'
            }}>
              Current Average Score
            </div>
            <div style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '24px',
              fontWeight: '900',
              color: getScoreColor(averageScore),
              background: getScoreBackgroundColor(averageScore),
              borderRadius: '12px',
              padding: '16px',
              border: `2px solid ${getScoreBorderColor(averageScore)}`,
              minWidth: '120px',
              minHeight: '60px'
            }}>
              {/* Barre de remplissage proportionnelle au score */}
              <div style={{
                position: 'absolute',
                left: '0',
                top: '0',
                bottom: '0',
                width: `${getScoreFillPercentage(averageScore)}%`,
                background: getScoreColor(averageScore),
                borderRadius: '10px',
                opacity: 0.3,
                zIndex: 1
              }}></div>
              {/* Score au-dessus de la barre */}
              <span style={{ position: 'relative', zIndex: 2 }}>
                {averageScore}/100
              </span>
            </div>
            <div style={{
              fontSize: '12px',
              color: getScoreColor(averageScore),
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              {averageScore >= 80 ? '🌟 Excellent quality!' : 
               averageScore >= 60 ? '👍 Good quality' : 
               averageScore >= 40 ? '⚠️ Needs improvement' : '❌ Poor quality'}
            </div>
          </div>
        )}

        {/* Résumé des conditions */}
        <div style={{
          padding: '16px',
          background: 'rgba(255, 215, 0, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 215, 0, 0.3)'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '700',
            color: '#FFD600',
            textAlign: 'center',
            marginBottom: '12px'
          }}>
            Validation Status
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: condition1Met ? '#00FF00' : '#999'
            }}>
              <span>22 modérateurs votés</span>
              <span>{condition1Met ? '✅' : '❌'}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: condition2Met ? '#00FF00' : '#999'
            }}>
              <span>$WINC staked &gt; MINT price</span>
              <span>{condition2Met ? '✅' : '❌'}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: condition3Met ? '#00FF00' : '#999'
            }}>
              <span>2:1 ratio atteint</span>
              <span>{condition3Met ? '✅' : '❌'}</span>
            </div>
          </div>
          {condition1Met && condition2Met && condition3Met && (
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#00FF00',
              textAlign: 'center',
              marginTop: '12px',
              padding: '8px',
              background: 'rgba(0, 255, 0, 0.1)',
              borderRadius: '8px',
              border: '1px solid #00FF00'
            }}>
              🎉 Toutes les conditions sont remplies !
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModerationProgressPanel; 