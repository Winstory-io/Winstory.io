'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActiveAccount } from 'thirdweb/react';
import WalletConnect from '../../components/WalletConnect';
import ModeratorHeader, { CloseButton } from '../../components/ModeratorHeader';
import BrandInfo from '../../components/BrandInfo';
import ModerationBubbles from '../../components/ModerationBubbles';
import ModerationProgressPanel from '../../components/ModerationProgressPanel';
import ModerationButtons from '../../components/ModerationButtons';
import ModerationInfoModal from '../../components/ModerationInfoModal';
import ModerationTooltip from '../../components/ModerationTooltip';
import CompletionScoringModal from '../../components/CompletionScoringModal';
import styles from '../../styles/Moderation.module.css';
import { useModeration } from '../../lib/hooks/useModeration';
import { ModerationCampaign, getUICreatorType, getUICampaignType } from '../../lib/types';

const ModerationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const account = useActiveAccount();
  
  // Récupérer l'ID de campagne et les paramètres depuis l'URL
  const campaignId = searchParams.get('campaignId');
  const campaignType = searchParams.get('type') as 'initial' | 'completion' | null;
  const campaignSubType = searchParams.get('subtype') as string | null;
  
  // États pour la gestion des onglets et de la disponibilité
  const [activeTab, setActiveTab] = useState<'initial' | 'completion'>('initial');
  const [activeSubTab, setActiveSubTab] = useState<string>('b2c-agencies');
  const [showInfo, setShowInfo] = useState(false);
  const [showBubble, setShowBubble] = useState<string | null>(null);
  const [showBulbPopup, setShowBulbPopup] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);
  
  // État pour stocker la disponibilité des campagnes
  const [campaignsAvailability, setCampaignsAvailability] = useState<{
    hasInitialB2CCampaigns: boolean;
    hasInitialIndividualCampaigns: boolean;
    hasCompletionB2CCampaigns: boolean;
    hasCompletionIndividualCampaigns: boolean;
  } | null>(null);
  
  // Fonction pour convertir les clés de sous-type en labels lisibles
  const getSubTypeLabel = (subType: string) => {
    switch (subType) {
      case 'b2c-agencies': return 'B2C & Agencies';
      case 'individual-creators': return 'Individual Creators';
      case 'for-b2c': return 'For B2C';
      case 'for-individuals': return 'For Individuals';
      default: return subType;
    }
  };
  
  const activeSubTypeLabel = getSubTypeLabel(activeSubTab);
  
  // Fonctions de conversion des types Prisma vers types familiers
  const convertPrismaCreatorType = (prismaType: string): 'b2c' | 'agency' | 'individual' => {
    if (prismaType === 'B2C_AGENCIES' || prismaType === 'FOR_B2C') {
      return 'b2c';
    } else if (prismaType === 'INDIVIDUAL_CREATORS' || prismaType === 'FOR_INDIVIDUALS') {
      return 'individual';
    } else {
      return 'individual';
    }
  };

  const convertPrismaCampaignType = (prismaType: string): 'creation' | 'completion' => {
    if (prismaType === 'INITIAL') {
      return 'creation';
    } else if (prismaType === 'COMPLETION') {
      return 'completion';
    } else {
      return 'creation';
    }
  };
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoHeight, setVideoHeight] = useState(0);

  // Utiliser le hook de modération dynamique
  const { 
    currentSession, 
    isLoading, 
    error, 
    availableCampaigns,
    submitModerationDecision, 
    submitCompletionScore,
    checkCampaignsAvailability,
    fetchCampaignById,
    refreshData 
  } = useModeration();
  
  // Charger la disponibilité des campagnes au montage - SIMPLIFIÉ
  useEffect(() => {
    console.log('useEffect triggered - account:', account?.address);
    // Temporairement désactivé pour éviter la boucle
    // if (account?.address) {
    //   loadCampaignsAvailability();
    // }
  }, [account?.address]);

  // Charger la disponibilité des campagnes quand l'utilisateur est connecté
  useEffect(() => {
    const loadAvailability = async () => {
      if (account?.address) {
        try {
          const availability = await checkCampaignsAvailability();
          setCampaignsAvailability(availability);
        } catch (error) {
          console.error('Error loading campaigns availability:', error);
        }
      }
    };
    
    loadAvailability();
  }, [account?.address]);

  // Charger la campagne quand campaignId est présent dans l'URL
  useEffect(() => {
    if (campaignId && account?.address && !currentSession) {
      console.log('Loading campaign from URL:', campaignId);
      
      // Vérifier si l'ID existe dans nos données mockées
      const checkCampaignExists = async () => {
        try {
          const { mockCampaigns } = await import('../../lib/mockData');
          const campaignExists = mockCampaigns.some(c => c.id === campaignId);
          
          if (!campaignExists) {
            console.log('Campaign ID not found in mock data, redirecting to campaign selection');
            // Rediriger vers la sélection de campagne
            router.push('/moderation');
            return;
          }
          
          // Si l'ID existe, charger la campagne
          await fetchCampaignById(campaignId);
        } catch (error) {
          console.error('Error checking campaign existence:', error);
          router.push('/moderation');
        }
      };
      
      checkCampaignExists();
    }
  }, [campaignId, account?.address, currentSession, fetchCampaignById, router]);
  
  // Fonction pour vérifier s'il y a des campagnes disponibles pour le type actuellement sélectionné
  const hasCampaignsForCurrentSelection = async () => {
    try {
      // Récupérer la disponibilité des campagnes depuis le hook
      const availability = await checkCampaignsAvailability();
      
      // Logique métier : chaque onglet affiche le contenu approprié
      if (activeTab === 'initial' && activeSubTab === 'b2c-agencies') {
        // Initial Story > B2C & Agencies : modération de contenu créé par des entreprises B2C
        return availability.hasInitialB2CCampaigns;
      } else if (activeTab === 'initial' && activeSubTab === 'individual-creators') {
        // Initial Story > Individual Creators : modération de contenu créé par des individus
        return availability.hasInitialIndividualCampaigns;
      } else if (activeTab === 'completion' && activeSubTab === 'for-b2c') {
        // Completion > For B2C : modération de contenus d'individus qui complètent des campagnes d'entreprises B2C
        return availability.hasCompletionB2CCampaigns;
      } else if (activeTab === 'completion' && activeSubTab === 'for-individuals') {
        // Completion > For Individuals : modération de contenus d'individus qui complètent des campagnes d'autres individus
        return availability.hasCompletionIndividualCampaigns;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking campaigns availability:', error);
      return false;
    }
  };
  
  // Mettre à jour les onglets quand les paramètres d'URL changent
  useEffect(() => {
    if (campaignType) {
      setActiveTab(campaignType);
      console.log('Active tab updated to:', campaignType);
    }
    if (campaignSubType) {
      setActiveSubTab(campaignSubType);
      console.log('Active sub tab updated to:', campaignSubType);
    }
  }, [campaignType, campaignSubType]);

  // Vider la session actuelle et charger la nouvelle campagne quand on change d'onglets ou sous-onglets
  useEffect(() => {
    const loadCampaignForNewSelection = async () => {
      if (!account?.address) return;
      
      try {
        // Déterminer le type de campagne et créateur selon la sélection actuelle
        let campaignType = 'INITIAL';
        let creatorType = 'B2C_AGENCIES';
        
        if (activeTab === 'initial') {
          campaignType = 'INITIAL';
          if (activeSubTab === 'b2c-agencies') {
            creatorType = 'B2C_AGENCIES';
          } else if (activeSubTab === 'individual-creators') {
            creatorType = 'INDIVIDUAL_CREATORS';
          }
        } else if (activeTab === 'completion') {
          campaignType = 'COMPLETION';
          if (activeSubTab === 'for-b2c') {
            creatorType = 'FOR_B2C';
          } else if (activeSubTab === 'for-individuals') {
            creatorType = 'FOR_INDIVIDUALS';
          }
        }
        
        console.log(`Loading campaign for: ${campaignType} - ${creatorType}`);
        
        // TEMPORAIRE: Utiliser les données mockées au lieu de l'API
        // TODO: Remplacer par les vrais appels API quand la base de données sera configurée
        try {
          const { mockCampaigns } = await import('../../lib/mockData');
          
          // Filtrer les campagnes selon le type et créateur
          const availableCampaigns = mockCampaigns.filter(campaign => {
            if (campaign.type !== campaignType) return false;
            if (campaign.creatorType !== creatorType) return false;
            return campaign.status === 'PENDING_MODERATION';
          });
          
          if (availableCampaigns.length > 0) {
            // Prendre la première campagne disponible et la charger directement
            const campaign = availableCampaigns[0];
            console.log('Loading campaign directly from mock data:', campaign.title);
            await fetchCampaignById(campaign.id);
          } else {
            console.log('No campaigns available for this type in mock data');
          }
        } catch (error) {
          console.error('Error loading campaign from mock data:', error);
        }
      } catch (error) {
        console.error('Error loading campaign for new selection:', error);
      }
    };
    
    // Charger la campagne pour la nouvelle sélection
    loadCampaignForNewSelection();
  }, [activeTab, activeSubTab, account?.address]);

  // Vérifier l'éligibilité de l'utilisateur et charger la campagne prioritaire
  useEffect(() => {
    if (!campaignId) {
      // Pas de campagne spécifique, on reste sur la page pour afficher la sélection
      return;
    }

    if (currentSession && !currentSession.isEligible) {
      // L'utilisateur n'est pas éligible pour cette campagne
      router.push('/moderation/unauthorized');
      return;
    }
  }, [campaignId, currentSession, router, account?.address]);

  // Gestion des événements de modération
  const handleCompletionValid = () => {
    setShowScoringModal(true);
  };

  const handleCompletionRefuse = async () => {
    if (currentSession) {
      const success = await submitModerationDecision('refuse', 'completion');
      if (success) {
        console.log('Completion refused successfully');
        refreshData();
      }
    }
  };

  const handleCompletionScore = async (score: number) => {
    if (currentSession) {
      const success = await submitCompletionScore(score);
      if (success) {
        console.log(`Completion scored successfully with ${score}/100`);
        setShowScoringModal(false);
        refreshData();
      }
    }
  };

  const handleInitialValid = async () => {
    if (currentSession) {
      const success = await submitModerationDecision('valid', 'creation');
      if (success) {
        console.log('Initial story validated successfully');
        refreshData();
      }
    }
  };

  const handleInitialRefuse = async () => {
    if (currentSession) {
      const success = await submitModerationDecision('refuse', 'creation');
      if (success) {
        console.log('Initial story refused successfully');
        refreshData();
      }
    }
  };

  // Ajuster la hauteur de la vidéo
  useEffect(() => {
    if (videoRef.current) {
      setVideoHeight(videoRef.current.clientHeight);
    }
  }, [currentSession?.campaign.content.videoUrl]);

  // Calcul pour aligner le panneau de droite verticalement avec la vidéo
  const panelRightStyle = videoHeight
    ? { justifyContent: 'center', minHeight: videoHeight, display: 'flex', flexDirection: 'column' as const }
    : {};

  // Affichage de chargement - seulement si on a un campaignId et qu'on charge
  if (campaignId && isLoading) {
    return (
      <div className={styles.moderationBg}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          color: '#00FF00',
          fontSize: '24px'
        }}>
          Loading moderation data...
        </div>
      </div>
    );
  }

  // Affichage d'erreur - seulement si on a un campaignId et qu'il y a une erreur
  if (campaignId && error) {
    return (
      <div className={styles.moderationBg}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          color: '#FF6B6B',
          fontSize: '24px',
          textAlign: 'center',
          padding: '24px'
        }}>
          <div>Error loading moderation data:</div>
          <div style={{ fontSize: '18px', marginTop: '16px' }}>{error}</div>
          <button 
            onClick={refreshData}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              background: '#00FF00',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Pas de session ET pas de campaignId - afficher l'authentification
  if (!currentSession && !campaignId && !account?.address) {
    return (
      <div className={styles.moderationBg}>
        {/* Croix rouge fixe en haut à droite */}
        <CloseButton />

        <div style={{
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          color: '#00FF00',
          textAlign: 'center',
          padding: '24px'
        }}>
          <h1 style={{ 
            fontSize: '32px', 
            marginBottom: '24px' 
          }}>
            Please authenticate to access moderation
          </h1>
          <WalletConnect
            isBothLogin={true}
            onLoginSuccess={() => {
              // L'authentification réussie déclenchera le chargement des données
              console.log('Authentication successful');
              // Une fois connecté, on reste sur la page pour afficher la sélection
              // car currentSession sera null mais account sera défini
            }}
          />
        </div>
      </div>
    );
  }

  // Utilisateur connecté mais pas de campagne spécifique - afficher la sélection
  if (!campaignId && account?.address) {
    return (
      <div className={styles.moderationBg}>
        {/* Croix rouge fixe en haut à droite */}
        <CloseButton />

        <ModeratorHeader
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          onTabChange={setActiveTab}
          onSubTabChange={setActiveSubTab}
          onIconClick={() => router.push('/welcome')}
          onBulbClick={() => setShowBulbPopup(true)}
        />
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 200px)',
          color: '#FFD600',
          textAlign: 'center',
          padding: '24px'
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '900',
            marginBottom: '48px',
            color: '#FFD600'
          }}>
            Select Campaign to Moderate
          </h1>
          
          {/* Indicateur de sélection actuelle */}
          <div style={{
            background: 'rgba(0, 255, 0, 0.1)',
            border: '2px solid #00FF00',
            borderRadius: '12px',
            padding: '16px 24px',
            marginBottom: '32px',
            color: '#00FF00'
          }}>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              Current Selection:
            </div>
            <div style={{ fontSize: '16px' }}>
              {activeTab === 'initial' ? 'Initial Story' : 'Completion'} → {activeSubTypeLabel}
            </div>
          </div>
          
          {/* Contenu dynamique selon la sélection */}
          {campaignsAvailability && (() => {
            // Déterminer s'il y a des campagnes disponibles pour la sélection actuelle
            let hasCampaigns = false;
            let campaignType = '';
            let creatorType = '';
            
            if (activeTab === 'initial' && activeSubTab === 'b2c-agencies') {
              hasCampaigns = campaignsAvailability.hasInitialB2CCampaigns;
              campaignType = 'INITIAL';
              creatorType = 'B2C_AGENCIES';
            } else if (activeTab === 'initial' && activeSubTab === 'individual-creators') {
              hasCampaigns = campaignsAvailability.hasInitialIndividualCampaigns;
              campaignType = 'INITIAL';
              creatorType = 'INDIVIDUAL_CREATORS';
            } else if (activeTab === 'completion' && activeSubTab === 'for-b2c') {
              hasCampaigns = campaignsAvailability.hasCompletionB2CCampaigns;
              campaignType = 'COMPLETION';
              creatorType = 'FOR_B2C';
            } else if (activeTab === 'completion' && activeSubTab === 'for-individuals') {
              hasCampaigns = campaignsAvailability.hasCompletionIndividualCampaigns;
              campaignType = 'COMPLETION';
              creatorType = 'FOR_INDIVIDUALS';
            }
            
            return hasCampaigns ? (
              // Si des campagnes sont disponibles, afficher l'interface de modération
              <div style={{
                background: 'rgba(0, 255, 0, 0.1)',
                border: '2px solid #00FF00',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '600px',
                textAlign: 'center'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#00FF00',
                  marginBottom: '16px'
                }}>
                  🎯 Campaigns Available for Moderation
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#fff',
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  There are campaigns available for {activeTab === 'initial' ? 'initial story' : 'completion'} moderation in the "{activeSubTypeLabel}" category.
                </p>
                
                {/* Explication claire du type de contenu */}
                <div style={{
                  background: 'rgba(0, 255, 0, 0.2)',
                  border: '1px solid #00FF00',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                  textAlign: 'left'
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#00FF00',
                    margin: '0',
                    lineHeight: '1.5'
                  }}>
                    <strong>Content Type:</strong> {
                      activeTab === 'initial' 
                        ? `Content created by ${activeSubTab === 'b2c-agencies' ? 'B2C companies and agencies' : 'individual creators'}`
                        : `Content created by individuals completing campaigns ${activeSubTab === 'for-b2c' ? 'from B2C companies' : 'from other individuals'}`
                    }
                  </p>
                </div>
                
                <button
                  onClick={async () => {
                    try {
                      // Récupérer les campagnes depuis l'API
                      const response = await fetch(`/api/moderation/campaigns?type=${campaignType}&creatorType=${creatorType}`);
                      const result = await response.json();
                      
                      if (result.success && result.data.length > 0) {
                        // Prendre la première campagne disponible
                        const campaign = result.data[0];
                        router.push(`/moderation?campaignId=${campaign.id}&type=${activeTab}&subtype=${activeSubTab}`);
                      } else {
                        console.error('No campaigns available for this type');
                      }
                    } catch (error) {
                      console.error('Error fetching campaign:', error);
                    }
                  }}
                  style={{
                    padding: '16px 32px',
                    background: '#00FF00',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#00CC00';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#00FF00';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Start Moderation
                </button>
              </div>
            ) : (
              // Si pas de campagnes disponibles, afficher le message d'information
              <div style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '2px solid #FF0000',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '600px',
                textAlign: 'center'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#FF0000',
                  marginBottom: '16px'
                }}>
                  📭 No Campaigns Available
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#fff',
                  marginBottom: '24px',
                  lineHeight: '1.6'
                }}>
                  There are currently no {activeTab === 'initial' ? 'initial story' : 'completion'} campaigns of type "{activeSubTypeLabel}" that require moderation.
                </p>
                <div style={{
                  background: 'rgba(255, 255, 0, 0.1)',
                  border: '1px solid #FFFF00',
                  borderRadius: '8px',
                  padding: '16px',
                  marginTop: '16px'
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#FFFF00',
                    margin: '0',
                    lineHeight: '1.5'
                  }}>
                    💡 <strong>Tip:</strong> Try switching to a different tab or sub-tab to see if there are campaigns available in other categories.
                  </p>
                </div>
              </div>
            );
          })()}
          
          <p style={{
            fontSize: '16px',
            color: '#999',
            marginTop: '32px',
            maxWidth: '600px',
            lineHeight: '1.6'
          }}>
            Select the type of content you want to moderate. The system will automatically assign you the highest priority campaign that requires moderation.
          </p>
          

        </div>

        {/* Moderation Tooltip */}
        <ModerationTooltip 
          isOpen={showBulbPopup} 
          onClose={() => setShowBulbPopup(false)} 
        />
      </div>
    );
  }

  // Pas de session mais on a un campaignId - afficher un message d'erreur
  if (!currentSession && campaignId) {
    // Vérifier s'il y a des campagnes disponibles pour ce type
    const hasCampaignsForType = async () => {
      try {
        const availability = await checkCampaignsAvailability();
        return (
          (activeTab === 'initial' && activeSubTab === 'b2c-agencies' && availability.hasInitialB2CCampaigns) ||
          (activeTab === 'initial' && activeSubTab === 'individual-creators' && availability.hasInitialIndividualCampaigns) ||
          (activeTab === 'completion' && activeSubTab === 'for-b2c' && availability.hasCompletionB2CCampaigns) ||
          (activeTab === 'completion' && activeSubTab === 'for-individuals' && availability.hasCompletionIndividualCampaigns)
        );
      } catch (error) {
        console.error('Error checking campaigns availability:', error);
        return false;
      }
    };
    
    // Pour l'instant, on suppose qu'il y a des campagnes disponibles
    const hasCampaigns = true;
    
    // Si pas de campagnes disponibles, afficher le message approprié
    if (!hasCampaigns) {
      return (
        <div className={styles.moderationBg}>
          <ModeratorHeader
            activeTab={activeTab}
            activeSubTab={activeSubTab}
            onTabChange={setActiveTab}
            onSubTabChange={setActiveSubTab}
            onIconClick={() => router.push('/welcome')}
            onBulbClick={() => setShowBulbPopup(true)}
          />
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 'calc(100vh - 200px)',
            color: '#FFD600',
            textAlign: 'center',
            padding: '24px'
          }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '700',
              marginBottom: '24px',
              color: '#FFD600'
            }}>
              No Winstory campaigns to moderate
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#999',
              marginBottom: '32px',
              maxWidth: '600px',
              lineHeight: '1.6'
            }}>
              There are currently no {activeTab === 'initial' ? 'initial story' : 'completion'} campaigns of type "{activeSubTypeLabel}" that require moderation.
            </p>
            <div style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '2px solid #FFD600',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '32px',
              maxWidth: '500px'
            }}>
              <div style={{ fontSize: '16px', color: '#FFD600', fontWeight: '600', marginBottom: '12px' }}>
                Current Selection:
              </div>
              <div style={{ fontSize: '18px', color: '#FFD600', fontWeight: '700' }}>
                {activeTab === 'initial' ? 'Initial Story' : 'Completion'} → {activeSubTypeLabel}
              </div>
            </div>
            <button
              onClick={() => router.push('/moderation')}
              style={{
                padding: '16px 32px',
                background: '#FFD600',
                color: '#000',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFE44D';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFD600';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Back to Campaign Selection
            </button>
          </div>

          {/* Moderation Tooltip */}
          <ModerationTooltip 
            isOpen={showBulbPopup} 
            onClose={() => setShowBulbPopup(false)} 
          />
        </div>
      );
    }
    
    // Si des campagnes sont disponibles mais qu'on n'arrive pas à les charger, afficher un message d'erreur
    return (
      <div className={styles.moderationBg}>
        <ModeratorHeader
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          onTabChange={setActiveTab}
          onSubTabChange={setActiveSubTab}
          onIconClick={() => router.push('/welcome')}
          onBulbClick={() => setShowBulbPopup(true)}
        />
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 200px)',
          color: '#FF6B6B',
          textAlign: 'center',
          padding: '24px'
        }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700',
            marginBottom: '24px',
            color: '#FF6B6B'
          }}>
            Campaign Loading Error
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#999',
            marginBottom: '32px',
            maxWidth: '600px',
            lineHeight: '1.6'
          }}>
            There was an error loading the campaign data. This might be due to type conflicts that need to be resolved.
          </p>
          <div style={{
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            maxWidth: '500px'
          }}>
            <p style={{ fontSize: '14px', color: '#FF8888', margin: 0 }}>
              💡 <strong>Debug Info:</strong> Campaign ID: {campaignId}, Type: {activeTab}, Subtype: {activeSubTab}
            </p>
          </div>
          <button
            onClick={() => router.push('/moderation')}
            style={{
              padding: '16px 32px',
              background: '#FF6B6B',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FF8E8E';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FF6B6B';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Back to Campaign Selection
          </button>
        </div>

        {/* Moderation Tooltip */}
        <ModerationTooltip 
          isOpen={showBulbPopup} 
          onClose={() => setShowBulbPopup(false)} 
        />
      </div>
    );
  }

  const { campaign, progress } = currentSession;

  return (
    <div className={styles.moderationBg}>
      <ModeratorHeader
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onTabChange={setActiveTab}
        onSubTabChange={setActiveSubTab}
        onIconClick={() => router.push('/welcome')}
        onBulbClick={() => setShowBulbPopup(true)}
      />
      
      <div className={styles.moderationContainer}>
        {/* Colonne bulles à gauche */}
        <ModerationBubbles
          userType={convertPrismaCreatorType(campaign.creatorType)}
          onBubbleClick={setShowBubble}
          bubbleSize={100}
          bubbleGap={24}
        />

        {/* Panneau gauche : vidéo */}
        <div className={styles.moderationPanelLeft}>
          {/* Informations de la marque/agence/individu */}
          <BrandInfo
            companyName={campaign.creatorInfo.companyName}
            agencyName={campaign.creatorInfo.agencyName}
            userType={convertPrismaCreatorType(campaign.creatorType)}
            walletAddress={campaign.creatorInfo.walletAddress}
          />
          
          {/* Titre dynamique selon le type de campagne */}
          <div style={{
            padding: '16px',
            marginBottom: '16px',
            background: 'rgba(255, 215, 0, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#FFD600',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              {campaign.title}
            </h2>
            
            {/* Informations supplémentaires pour les complétions */}
            {campaign.type === 'COMPLETION' && (
              <div style={{
                fontSize: '14px',
                color: '#fff',
                textAlign: 'center',
                lineHeight: '1.4'
              }}>
                {campaign.creatorType === 'FOR_B2C' ? (
                  <div>
                    <div style={{ color: '#00FF00', fontWeight: '600', marginBottom: '4px' }}>
                      🏢 Campagne d'entreprise: {campaign.originalCampaign?.companyName || 'Entreprise B2C'}
                    </div>
                    <div style={{ color: '#FFD600', fontSize: '12px' }}>
                      Complété par: {campaign.completerWallet ? 
                        `${campaign.completerWallet.slice(0, 6)}...${campaign.completerWallet.slice(-4)}` : 
                        'Créateur individuel'
                      }
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ color: '#00FF00', fontWeight: '600', marginBottom: '4px' }}>
                      👤 Campagne d'individu: {campaign.originalCreator?.walletAddress ? 
                        `${campaign.originalCreator.walletAddress.slice(0, 6)}...${campaign.originalCreator.walletAddress.slice(-4)}` : 
                        'Créateur individuel'
                      }
                    </div>
                    <div style={{ color: '#FFD600', fontSize: '12px' }}>
                      Complété par: {campaign.completerWallet ? 
                        `${campaign.completerWallet.slice(0, 6)}...${campaign.completerWallet.slice(-4)}` : 
                        'Créateur individuel'
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className={styles.videoSection} style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <video 
              ref={videoRef} 
              src={campaign.content.videoUrl} 
              controls 
              className={styles.campaignVideo} 
              style={{ margin: '0 0' }} 
            />
          </div>
        </div>

        {/* Panneau droit : barres de progression + boutons */}
        <div className={styles.moderationPanelRight} style={panelRightStyle}>
          <ModerationProgressPanel
            stakers={progress.stakers}
            stakersRequired={progress.stakersRequired}
            stakedAmount={progress.stakedAmount}
            mintPrice={progress.mintPrice}
            validVotes={progress.validVotes}
            refuseVotes={progress.refuseVotes}
            totalVotes={progress.totalVotes}
            averageScore={progress.averageScore}
            campaignType={convertPrismaCampaignType(campaign.type)}
            creatorType={convertPrismaCreatorType(campaign.creatorType)}
          />
          
          <ModerationButtons
            activeTab={activeTab}
            userType={convertPrismaCreatorType(campaign.creatorType)}
            onValid={activeTab === 'initial' ? handleInitialValid : handleCompletionValid}
            onRefuse={activeTab === 'initial' ? handleCompletionRefuse : handleCompletionRefuse}
            onValidWithScore={handleCompletionScore}
          />
        </div>
      </div>

      {/* Popups bulles infos - Contenu dynamique */}
      {showBubble && (
        <div className={styles.popupOverlay} onClick={() => setShowBubble(null)}>
          <div className={styles.textPopup} onClick={e => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <h2 className={styles.popupTitle}>
                {showBubble === 'startingText' ? 'Starting Story' : 
                 showBubble === 'guideline' ? 'Guideline' : 
                 showBubble === 'standardRewards' ? 'Standard Reward' : 'Premium Reward'}
              </h2>
              <button className={styles.closePopup} onClick={() => setShowBubble(null)}>&times;</button>
            </div>
            <div className={styles.textPopupContent}>
              {showBubble === 'startingText' && campaign.content.startingStory}
              {showBubble === 'guideline' && campaign.content.guidelines}
              {showBubble === 'standardRewards' && campaign.rewards?.standardReward}
              {showBubble === 'premiumRewards' && campaign.rewards?.premiumReward}
            </div>
          </div>
        </div>
      )}

      {/* Popup infos campagne (bulle i) */}
      {showInfo && (
        <ModerationInfoModal 
          info={{
            startingText: campaign.content.startingStory,
            guideline: campaign.content.guidelines || '',
            standardRewards: campaign.rewards?.standardReward,
            premiumRewards: campaign.rewards?.premiumReward,
            completionPrice: campaign.rewards?.completionPrice || '',
            totalCompletions: campaign.metadata.totalCompletions || 0
          }} 
          onClose={() => setShowInfo(false)} 
        />
      )}

      {/* Moderation Tooltip */}
      <ModerationTooltip 
        isOpen={showBulbPopup} 
        onClose={() => setShowBulbPopup(false)} 
      />

      {/* Modal de notation des complétions */}
      <CompletionScoringModal
        isOpen={showScoringModal}
        onClose={() => setShowScoringModal(false)}
        onConfirm={handleCompletionScore}
        usedScores={progress.completionScores || []}
        contentType={convertPrismaCreatorType(campaign.creatorType)}
      />
    </div>
  );
};

export default ModerationPage;
