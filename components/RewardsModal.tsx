import React, { useEffect, useState } from 'react';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  standardReward?: string;
  premiumReward?: string;
  campaignId?: string;
  campaignType?: 'INITIAL' | 'COMPLETION';
  creatorType?: string;
}

interface EconomicData {
  mint: number;
  poolTotal: number;
  creatorGain: number;
  top1: number;
  top2: number;
  top3: number;
  platform: number;
  moderators: number;
  isCreatorProfitable: boolean;
  wincValue?: number;
  maxCompletions?: number;
}

const RewardsModal: React.FC<RewardsModalProps> = ({ 
  isOpen, 
  onClose, 
  standardReward, 
  premiumReward,
  campaignId,
  campaignType,
  creatorType
}) => {
  const [economicData, setEconomicData] = useState<EconomicData | null>(null);
  const [loadingEconomic, setLoadingEconomic] = useState(false);

  // Pour les campagnes individuelles INITIAL, récupérer les données économiques
  useEffect(() => {
    const isIndividual = creatorType && (
      creatorType.includes('INDIVIDUAL') || 
      creatorType === 'INDIVIDUAL_CREATORS'
    );
    
    console.log('🔍 [REWARDS MODAL] Checking if should fetch economic data:', {
      isOpen,
      campaignId,
      campaignType,
      creatorType,
      isIndividual
    });

    if (isOpen && campaignId && campaignType === 'INITIAL' && isIndividual) {
      console.log('📊 [REWARDS MODAL] Fetching economic data for campaign:', campaignId);
      setLoadingEconomic(true);
      fetch(`/api/campaigns/economic-data?campaignId=${campaignId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(result => {
          console.log('📊 [REWARDS MODAL] Economic data response:', result);
          if (result.success && result.data) {
            setEconomicData(result.data);
            console.log('✅ [REWARDS MODAL] Economic data loaded:', result.data);
          } else {
            console.warn('⚠️ [REWARDS MODAL] No economic data in response:', result);
          }
          setLoadingEconomic(false);
        })
        .catch(err => {
          console.error('❌ [REWARDS MODAL] Error fetching economic data:', err);
          setLoadingEconomic(false);
        });
    } else {
      setEconomicData(null);
    }
  }, [isOpen, campaignId, campaignType, creatorType]);

  if (!isOpen) return null;

  // Si c'est une campagne individuelle avec données économiques, afficher la répartition WINC
  const isIndividual = creatorType && (
    creatorType.includes('INDIVIDUAL') || 
    creatorType === 'INDIVIDUAL_CREATORS'
  );
  const isIndividualWithEconomicData = campaignType === 'INITIAL' && 
                                       isIndividual && 
                                       economicData;
  
  console.log('🎯 [REWARDS MODAL] Display mode:', {
    campaignType,
    creatorType,
    isIndividual,
    hasEconomicData: !!economicData,
    isIndividualWithEconomicData
  });

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
          border: '2px solid #FFD600',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '900px',
          maxHeight: '85vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(255, 215, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
          paddingBottom: '16px'
        }}>
          <h1 style={{
            color: '#FFD600',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            🎁 Rewards
          </h1>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#FFD600',
              fontSize: '32px',
              cursor: 'pointer',
              fontWeight: 'bold',
              padding: '8px',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            ×
          </button>
        </div>

        {/* Content - Conditional layout */}
        {isIndividualWithEconomicData ? (
          // Layout pour campagnes individuelles avec répartition WINC
          <div style={{ color: '#fff' }}>
            {loadingEconomic ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                Loading reward distribution...
              </div>
            ) : economicData ? (
              <>
                {/* Header avec MINT et Total Pool */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>MINT Price</div>
                    <div style={{ color: '#FFD600', fontSize: '24px', fontWeight: 'bold' }}>
                      {economicData.mint} $WINC
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>Total Pool</div>
                    <div style={{ color: '#FFD600', fontSize: '24px', fontWeight: 'bold' }}>
                      {economicData.poolTotal} $WINC
                    </div>
                  </div>
                </div>

                {/* Répartition Top 3 */}
                <div style={{
                  background: 'rgba(255, 215, 0, 0.05)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '16px'
                }}>
                  <h2 style={{
                    color: '#FFD600',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    borderLeft: '4px solid #FFD600',
                    paddingLeft: '16px'
                  }}>
                    🥇🥈🥉 Top 3 Rewards
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div style={{
                      background: 'rgba(255, 215, 0, 0.1)',
                      border: '1px solid #FFD700',
                      borderRadius: '8px',
                      padding: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: '#FFD700', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                        1st Place
                      </div>
                      <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                        {economicData.top1} $WINC
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(192, 192, 192, 0.1)',
                      border: '1px solid #C0C0C0',
                      borderRadius: '8px',
                      padding: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: '#C0C0C0', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                        2nd Place
                      </div>
                      <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                        {economicData.top2} $WINC
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(205, 127, 50, 0.1)',
                      border: '1px solid #CD7F32',
                      borderRadius: '8px',
                      padding: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: '#CD7F32', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                        3rd Place
                      </div>
                      <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                        {economicData.top3} $WINC
                      </div>
                    </div>
                  </div>
                </div>

                {/* Répartition autres acteurs */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: 'rgba(255, 215, 0, 0.05)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>Creator Gain</div>
                    <div style={{ color: '#FFD600', fontSize: '20px', fontWeight: 'bold' }}>
                      {economicData.creatorGain} $WINC
                    </div>
                    <div style={{ 
                      color: economicData.isCreatorProfitable ? '#18C964' : '#FF2D2D', 
                      fontSize: '12px', 
                      marginTop: '4px' 
                    }}>
                      {economicData.isCreatorProfitable ? '✓ Profitable' : '✗ Not Profitable'}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(255, 215, 0, 0.05)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>Moderators</div>
                    <div style={{ color: '#FFD600', fontSize: '20px', fontWeight: 'bold' }}>
                      {economicData.moderators} $WINC
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(255, 215, 0, 0.05)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>Platform</div>
                    <div style={{ color: '#FFD600', fontSize: '20px', fontWeight: 'bold' }}>
                      {economicData.platform} $WINC
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          // Layout original pour autres types de campagnes
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px',
            color: '#fff'
          }}>
          {/* Standard Rewards Column */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.05)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h2 style={{
              color: '#FFD600',
              fontSize: '22px',
              fontWeight: 'bold',
              marginBottom: '16px',
              borderLeft: '4px solid #FFD600',
              paddingLeft: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ✅ Standard Rewards
            </h2>
            <div style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#fff',
              minHeight: '120px'
            }}>
              {standardReward ? (
                <p style={{ margin: 0 }}>{standardReward}</p>
              ) : (
                <p style={{ 
                  margin: 0, 
                  color: '#999', 
                  fontStyle: 'italic' 
                }}>
                  No standard rewards defined for this campaign.
                </p>
              )}
            </div>
          </div>

          {/* Premium Rewards Column */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.05)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h2 style={{
              color: '#FFD600',
              fontSize: '22px',
              fontWeight: 'bold',
              marginBottom: '16px',
              borderLeft: '4px solid #FFD600',
              paddingLeft: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🥇🥈🥉 Premium Rewards
            </h2>
            <div style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#fff',
              minHeight: '120px'
            }}>
              {premiumReward ? (
                <p style={{ margin: 0 }}>{premiumReward}</p>
              ) : (
                <p style={{ 
                  margin: 0, 
                  color: '#999', 
                  fontStyle: 'italic' 
                }}>
                  No premium rewards defined for this campaign.
                </p>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Information section */}
        <div style={{
          marginTop: '24px',
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#FFD600',
            textAlign: 'center'
          }}>
            <strong>💡 Note:</strong> Standard Rewards are distributed to all validated completions. 
            Premium Rewards are bonus rewards exclusively for the top 3 validated completions.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(255, 215, 0, 0.3)',
          paddingTop: '20px',
          marginTop: '24px',
          textAlign: 'center'
        }}>
          <button
            style={{
              background: 'linear-gradient(135deg, #FFD600 0%, #e6c300 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#000',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardsModal; 