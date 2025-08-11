"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

const CloseIcon = ({ onClick }: { onClick: () => void }) => (
  <svg onClick={onClick} width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', position: 'absolute', top: 24, right: 24, zIndex: 100 }}>
    <line x1="10" y1="10" x2="22" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
    <line x1="22" y1="10" x2="10" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

interface RecapData {
  story?: {
    title: string;
    startingStory: string;
    guideline: string;
  };
  film?: {
    url: string;
    aiRequested: boolean;
  };
  completions?: {
    wincValue: number;
    maxCompletions: number;
  };
}

// Constantes du modèle économique WINC pour calculer le MINT et le ROI
const ECONOMIC_CONSTANTS = {
  BASE_FEE: 1.53,
  SCALING_FACTOR: 0.115,
  RISK_ADJUSTMENT: 0.069,
  POOL_TOP3_PERCENTAGE: 0.617,
  POOL_CREATOR_PERCENTAGE: 0.23,
  POOL_PLATFORM_PERCENTAGE: 0.10,
  POOL_MODERATORS_PERCENTAGE: 0.32,
  POOL_MINT_PERCENTAGE: 0.25
};

// Fonction de simulation du modèle économique WINC - VERSION HARMONISÉE
function simulateCampaign(P: number, N: number, CR: number = N) {
  // Réglage de durée de campagne (à brancher ensuite sur l'UI si besoin)
  const CAMPAIGN_DURATION_DAYS = 7; // 7 ou 30
  const DURATION_DISCOUNT = CAMPAIGN_DURATION_DAYS === 7 ? 0.88 : 1.0; // 7j: MINT ~12% moins cher

  const sqrtPN = Math.sqrt(P * N);
  const mintRaw = (ECONOMIC_CONSTANTS.BASE_FEE * DURATION_DISCOUNT) +
                  (P * N * ECONOMIC_CONSTANTS.SCALING_FACTOR * DURATION_DISCOUNT) +
                  (sqrtPN * ECONOMIC_CONSTANTS.RISK_ADJUSTMENT * DURATION_DISCOUNT);

  const tauxCompletion = Math.max(0, Math.min(1, CR / N));
  const completionPercentage = tauxCompletion * 100;

  const mint = Math.round(mintRaw * 100) / 100;

  // Valeur totale du pool
  const totalValue = (P * CR) + mint;

  // Partages de base (la somme ≈ 1.0)
  const BASE_TOP3 = 0.55;
  const BASE_CREATOR = 0.20;
  const BASE_PLATFORM = 0.07;      // peut descendre dynamiquement jusqu'à 0.03
  const BASE_MODERATORS = 0.18;    // peut descendre dynamiquement jusqu'à 0.10

  // Boost des Top3 quand la complétion est faible, pris sur mods/platform en priorité
  const boostForWinners = 0.15 * (1 - tauxCompletion); // +15% vers Top3 à 0%, 0 à 100%
  let top3Share = BASE_TOP3 + boostForWinners;

  // Réductions dynamiques mods/platform si CR bas
  let platformShare = Math.max(0.03, BASE_PLATFORM - 0.02 * (1 - tauxCompletion));
  let moderatorsShare = Math.max(0.10, BASE_MODERATORS - 0.08 * (1 - tauxCompletion));

  // Reste pour le créateur (plancher 12%)
  let creatorShare = 1 - (top3Share + platformShare + moderatorsShare);
  if (creatorShare < 0.12) creatorShare = 0.12;

  // Renormalisation si dépassement
  const shareSum = top3Share + platformShare + moderatorsShare + creatorShare;
  top3Share /= shareSum;
  platformShare /= shareSum;
  moderatorsShare /= shareSum;
  creatorShare /= shareSum;

  // Multiplicateurs/XP
  let multiplicateurGain = 0;
  let multiplicateurXP = 1;

  const isMinimumCompletionsReached = CR >= 5;

  if (isMinimumCompletionsReached) {
    if (completionPercentage >= 100) multiplicateurXP = 6;
    else if (completionPercentage >= 95) multiplicateurXP = 5;
    else if (completionPercentage >= 90) multiplicateurXP = 4;
    else if (completionPercentage >= 80) multiplicateurXP = 3;
    else if (completionPercentage >= 60) multiplicateurXP = 2;
    else multiplicateurXP = 1;

    // De 0 à 2.0, plus "doux" sous 60%
    multiplicateurGain = Math.max(0, Math.min(2, (completionPercentage / 100) * 2));
  } else {
    multiplicateurGain = 0;
    multiplicateurXP = 1;
  }

  // Montants bruts par part
  const rawTop3Pool = totalValue * top3Share;
  const rawCreatorPool = totalValue * creatorShare;
  let platform = Math.round(totalValue * platformShare * 100) / 100;
  let moderators = Math.round(totalValue * moderatorsShare * 100) / 100;

  // Créateur avant cap
  const creatorGainWithMultiplier = rawCreatorPool * multiplicateurGain;

  // Cap créateur plus prudent à bas CR (1.2x à 60%, 2.2x à 100%)
  const minCap = 1.2;
  const maxCap = 2.2;
  let creatorCapFactor: number;
  if (completionPercentage <= 60) creatorCapFactor = minCap;
  else if (completionPercentage >= 100) creatorCapFactor = maxCap;
  else {
    const ratio = (completionPercentage - 60) / 40;
    creatorCapFactor = minCap + (maxCap - minCap) * ratio;
  }
  const creatorCap = mint * creatorCapFactor;

  let creatorGain = Math.min(creatorGainWithMultiplier, creatorCap);
  let creatorNetGain = creatorGain - mint;

  // Répartition Top3 (50/30/20)
  let top1 = rawTop3Pool * 0.5;
  let top2 = rawTop3Pool * 0.3;
  let top3 = rawTop3Pool * 0.2;

  // GARANTIR des planchers gagnants si CR >= 5
  if (isMinimumCompletionsReached) {
    const floor1 = 2 * P;
    const floor2 = 1.5 * P;
    const floor3 = 1.0 * P;

    const need1 = Math.max(0, floor1 - top1);
    const need2 = Math.max(0, floor2 - top2);
    const need3 = Math.max(0, floor3 - top3);
    const totalNeeds = need1 + need2 + need3;

    if (totalNeeds > 0) {
      // D'abord puiser chez Modérateurs puis Plateforme, puis dans le SURPLUS créateur (au-delà du cap)
      const poolAvailable = moderators + platform;
      const creatorSurplus = Math.max(0, creatorGainWithMultiplier - creatorGain);
      const available = poolAvailable + creatorSurplus;

      if (available > 0) {
        const takeRatio = Math.min(1, totalNeeds / available);
        const takeFromModerators = Math.round(moderators * takeRatio * 100) / 100;
        const takeFromPlatform = Math.round(platform * takeRatio * 100) / 100;
        const takeFromCreatorSurplus = Math.round(creatorSurplus * takeRatio * 100) / 100;

        // Appliquer retraits
        moderators = Math.max(0, Math.round((moderators - takeFromModerators) * 100) / 100);
        platform = Math.max(0, Math.round((platform - takeFromPlatform) * 100) / 100);
        // Note: le gain créateur RESTE identique (on utilise le surplus au-dessus du cap)

        // Redispatch du budget récupéré vers les planchers
        const recovered = takeFromModerators + takeFromPlatform + takeFromCreatorSurplus;
        const ratio1 = totalNeeds > 0 ? (need1 / totalNeeds) : 0;
        const ratio2 = totalNeeds > 0 ? (need2 / totalNeeds) : 0;
        const ratio3 = totalNeeds > 0 ? (need3 / totalNeeds) : 0;

        top1 += recovered * ratio1;
        top2 += recovered * ratio2;
        top3 += recovered * ratio3;
      }
    }
  }

  // Arrondis finaux
  const result = {
    mint: Math.round(mint * 100) / 100,
    poolTotal: Math.round(totalValue * 100) / 100,
    creatorGain: Math.round(creatorGain * 100) / 100,
    creatorNetGain: Math.round(creatorNetGain * 100) / 100,
    isCreatorProfitable: creatorGain >= mint,
    isMinimumCompletionsReached,
    creatorXP: 200 * multiplicateurXP,
    top1: Math.round(top1 * 100) / 100,
    top2: Math.round(top2 * 100) / 100,
    top3: Math.round(top3 * 100) / 100,
    platform: Math.round(platform * 100) / 100,
    moderators: Math.round(moderators * 100) / 100,
    platformTotal: Math.round((totalValue * platformShare) * 100) / 100, // info brute
    tauxCompletion: Math.round(tauxCompletion * 100) / 100,
    multiplicateurGain,
    multiplicateurXP
  };

  // Vérification finale: s'assurer que le total distribué ≈ totalValue (tolérance 0.01)
  const distributed = result.creatorGain + result.top1 + result.top2 + result.top3 + result.platform + result.moderators;
  if (Math.abs(distributed - result.poolTotal) > 0.01 && result.poolTotal > 0) {
    const adj = result.poolTotal / distributed;
    result.top1 = Math.round(result.top1 * adj * 100) / 100;
    result.top2 = Math.round(result.top2 * adj * 100) / 100;
    result.top3 = Math.round(result.top3 * adj * 100) / 100;
    result.platform = Math.round(result.platform * adj * 100) / 100;
    result.moderators = Math.round(result.moderators * adj * 100) / 100;
    // creatorGain reste inchangé car cap et surplus déjà pris en compte
  }

  return result;
}

export default function IndividualRecapPage() {
  const router = useRouter();
  const [recap, setRecap] = useState<RecapData>({});
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showFullStartingStory, setShowFullStartingStory] = useState(false);
  const [showFullGuideline, setShowFullGuideline] = useState(false);
  const [economicData, setEconomicData] = useState<any>(null);

  useEffect(() => {
    // Charger les données depuis le localStorage
    const storyData = localStorage.getItem("story");
    const filmData = localStorage.getItem("film");
    const completionsData = localStorage.getItem("completions");

    const recapData: RecapData = {};

    if (storyData) {
      try {
        recapData.story = JSON.parse(storyData);
      } catch (e) {
        console.error("Error parsing story data:", e);
      }
    }

    if (filmData) {
      try {
        recapData.film = JSON.parse(filmData);
      } catch (e) {
        console.error("Error parsing film data:", e);
      }
    }

    if (completionsData) {
      try {
        recapData.completions = JSON.parse(completionsData);
      } catch (e) {
        console.error("Error parsing completions data:", e);
      }
    }

    setRecap(recapData);

    // Calculer les données économiques si on a les informations de completion
    if (recapData.completions) {
      const P = recapData.completions.wincValue;
      const N = recapData.completions.maxCompletions;
      if (P >= 1 && N >= 5) {
        const data = simulateCampaign(P, N);
        setEconomicData(data);
      }
    }

    // Gestion de la navigation retour
    const handleBeforeUnload = () => {
      localStorage.setItem('fromRecap', 'true');
    };

    const handlePopState = () => {
      localStorage.setItem('fromRecap', 'true');
      router.push('/creation/individual/yourcompletions');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  // Recalculer les données économiques quand les données de completion changent
  useEffect(() => {
    if (recap.completions) {
      const P = recap.completions.wincValue;
      const N = recap.completions.maxCompletions;
      if (P >= 1 && N >= 5) {
        const data = simulateCampaign(P, N);
        setEconomicData(data);
      }
    }
  }, [recap.completions]);

  const handleCloseClick = () => {
    setShowLeaveModal(true);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      // TODO: Rediriger vers le processus de MINT
      console.log("Redirecting to minting process...");
      // router.push("/creation/individual/mint");
    }, 1000);
  };

  const handleStartingStoryClick = () => {
    setShowFullStartingStory(!showFullStartingStory);
  };

  const handleGuidelineClick = () => {
    setShowFullGuideline(!showFullGuideline);
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const canProceed = recap.story && recap.film && recap.completions;

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', paddingTop: 48 }}>
        {/* Croix rouge à l'extérieur en haut à droite */}
        <CloseIcon onClick={handleCloseClick} />
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 600, margin: '0 auto 24px auto', position: 'relative' }}>
          <img src="/individual.svg" alt="Individual" style={{ width: 96, height: 96, marginRight: 18 }} />
          <span style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>Recap</span>
          <button onClick={() => setShowTooltip(true)} style={{ background: 'none', border: 'none', marginLeft: 18, cursor: 'pointer', padding: 0 }} aria-label="Help">
            <img src="/tooltip.svg" alt="Aide" style={{ width: 40, height: 40 }} />
          </button>
        </div>

        {/* Pop-up tooltip */}
        {showTooltip && (
          <div
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowTooltip(false)}
          >
            <div
              style={{
                position: 'relative',
                maxWidth: 600,
                width: '90vw',
                background: '#000',
                border: '4px solid #FFD600',
                borderRadius: 24,
                padding: '32px 24px 28px 24px',
                boxShadow: '0 0 32px #000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#FFD600',
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTooltip(false)}
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 10,
                }}
                aria-label="Close"
              >
                <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
                  <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </button>
              <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 18, letterSpacing: 1 }}>Recap</h2>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 400, marginBottom: 18, textAlign: 'center' }}>
                Review all your campaign information before proceeding to MINT.<br /><br />
                This is your final chance to verify all details before launching your campaign.
              </div>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
          
          {/* Section Story */}
          {recap.story && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
                Your WinStory
              </div>
              <div style={{ background: '#000', border: '2px solid #FFD600', borderRadius: 12, padding: 28 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Title:</div>
                  <div style={{ color: '#fff', fontSize: 18 }}>{recap.story.title}</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Starting Story:</div>
                  <div 
                    onClick={handleStartingStoryClick}
                    style={{ 
                      color: '#fff', 
                      fontSize: 16, 
                      lineHeight: 1.6, 
                      whiteSpace: 'pre-line',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '6px',
                      transition: 'background-color 0.2s',
                      maxHeight: showFullStartingStory ? 'none' : '120px',
                      overflow: showFullStartingStory ? 'visible' : 'hidden',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {showFullStartingStory 
                      ? recap.story.startingStory 
                      : truncateText(recap.story.startingStory, 200)
                    }
                    {!showFullStartingStory && recap.story.startingStory && (
                      <div style={{ 
                        color: '#FFD600', 
                        fontSize: '14px', 
                        fontWeight: 600, 
                        marginTop: '8px',
                        textAlign: 'center'
                      }}>
                        Click to see full Story
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Guideline:</div>
                  <div 
                    onClick={handleGuidelineClick}
                    style={{ 
                      color: '#fff', 
                      fontSize: 16, 
                      lineHeight: 1.6, 
                      whiteSpace: 'pre-line',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '6px',
                      transition: 'background-color 0.2s',
                      maxHeight: showFullGuideline ? 'none' : '120px',
                      overflow: showFullGuideline ? 'visible' : 'hidden',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {showFullGuideline 
                      ? recap.story.guideline 
                      : truncateText(recap.story.guideline, 200)
                    }
                  </div>
                  {!showFullGuideline && (
                    <div style={{ 
                      color: '#FFD600', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      marginTop: '8px',
                      textAlign: 'center'
                    }}>
                      Click to see full Guideline
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section Film */}
          {recap.film && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
                Your Film
              </div>
              <div style={{ background: '#000', border: '2px solid #FFD600', borderRadius: 12, padding: 20 }}>
                {/* Affichage des informations de la vidéo sans tentative de chargement */}
                <div>
                  <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Video Uploaded:</div>
                  
                  {/* Icône de vidéo */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '20px',
                    background: 'rgba(255, 215, 0, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid #FFD600',
                    marginBottom: '16px'
                  }}>
                    <img 
                      src="/importvideo.svg" 
                      alt="Video Uploaded" 
                      style={{ width: '80px', height: '80px', marginRight: '16px' }} 
                    />
                    <div style={{ color: '#FFD600', fontSize: '18px', fontWeight: '600' }}>
                      ✓ Video Successfully Uploaded
                    </div>
                  </div>

                  {/* Informations détaillées sur la vidéo */}
                  {(recap.film as any).fileName && (
                    <div style={{ 
                      padding: '16px', 
                      background: 'rgba(255, 215, 0, 0.1)', 
                      borderRadius: '8px', 
                      border: '1px solid #FFD600',
                      marginBottom: '12px'
                    }}>
                      <div style={{ color: '#FFD600', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>📁 File Details:</div>
                      <div style={{ color: '#fff', fontSize: 14, marginBottom: 4 }}>
                        <strong>Name:</strong> {(recap.film as any).fileName}
                      </div>
                      {(recap.film as any).fileSize && (
                        <div style={{ color: '#fff', fontSize: 14, marginBottom: 4 }}>
                          <strong>Size:</strong> {Math.round((recap.film as any).fileSize / (1024 * 1024) * 100) / 100} MB
                        </div>
                      )}
                      {(recap.film as any).format && (
                        <div style={{ color: '#fff', fontSize: 14 }}>
                          <strong>Format:</strong> {(recap.film as any).format}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message informatif */}
                  <div style={{ 
                    padding: '12px', 
                    background: 'rgba(24, 201, 100, 0.1)', 
                    borderRadius: '6px', 
                    border: '1px solid #18C964',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#18C964', fontSize: 12, fontStyle: 'italic' }}>
                      Your video has been uploaded and will be used for community completions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Completions - Renommée en "Your Completions" */}
          {recap.completions && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
                Your Completions
              </div>
              <div style={{ background: '#000', border: '2px solid #FFD600', borderRadius: 12, padding: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Unit Value:</div>
                  <div style={{ color: '#fff', fontSize: 18 }}>{recap.completions.wincValue} $WINC</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Max Completions:</div>
                  <div style={{ color: '#fff', fontSize: 18 }}>{recap.completions.maxCompletions}</div>
                </div>
                
                {/* Informations économiques ajoutées */}
                {economicData && (
                  <>
                    <div style={{ marginBottom: 16, padding: '16px', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '8px', border: '1px solid #FFD600' }}>
                      <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>💰 Initial MINT Cost:</div>
                      <div style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{economicData.mint} $WINC</div>
                      <div style={{ color: '#FFD600', fontSize: 12, fontStyle: 'italic' }}>
                        This is what you need to pay to launch your campaign
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: 16, padding: '16px', background: 'rgba(24, 201, 100, 0.1)', borderRadius: '8px', border: '1px solid #18C964' }}>
                      <div style={{ color: '#18C964', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>🏆 Your Creator Gain (100% completion):</div>
                      <div style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{economicData.creatorGain} $WINC</div>
                      <div style={{ color: '#18C964', fontSize: 12, fontStyle: 'italic' }}>
                        Maximum potential reward if all completions are successful
                      </div>
                    </div>
                    
                    <div style={{ padding: '16px', background: 'rgba(255, 214, 0, 0.1)', borderRadius: '8px', border: '1px solid #FFD600' }}>
                      <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>📈 Your ROI if 100% completed:</div>
                      <div style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                        {economicData.isCreatorProfitable ? '+' : ''}{economicData.creatorNetGain} $WINC
                      </div>
                      <div style={{ color: '#FFD600', fontSize: 12, fontStyle: 'italic' }}>
                        Net profit: {economicData.creatorGain} - {economicData.mint} = {economicData.creatorNetGain} $WINC
                      </div>
                      {economicData.isCreatorProfitable && (
                        <div style={{ color: '#18C964', fontSize: 14, fontWeight: '600', marginTop: '8px' }}>
                          🎯 ROI: {((economicData.creatorNetGain / economicData.mint) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Message si données manquantes */}
          {!canProceed && (
            <div style={{ textAlign: 'center', color: '#FF2D2D', fontSize: 18, marginTop: 32 }}>
              Some campaign data is missing. Please complete all steps before proceeding.
            </div>
          )}
        </div>

        {/* Bouton de confirmation */}
        {canProceed && (
          <button
            onClick={handleConfirm}
            style={{
              position: 'fixed',
              right: 24,
              bottom: 24,
              zIndex: 1100,
              background: '#18C964',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              fontSize: confirmed ? 32 : 20,
              fontWeight: 700,
              width: confirmed ? 88 : 88,
              height: 88,
              boxShadow: '0 4px 32px rgba(24,201,100,0.35)',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s, box-shadow 0.2s, width 0.2s, height 0.2s, font-size 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              whiteSpace: 'pre-line',
              padding: 0,
            }}
            aria-label="Confirm"
          >
            {confirmed ? '✓' : 'Confirm'}
          </button>
        )}

        {/* Pop-up de confirmation pour quitter */}
        {showLeaveModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.7)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setShowLeaveModal(false)}
          >
            <div
              style={{
                background: '#181818',
                border: '3px solid #FF2D2D',
                color: '#FF2D2D',
                padding: 40,
                borderRadius: 20,
                minWidth: 340,
                maxWidth: '90vw',
                boxShadow: '0 0 32px #FF2D2D55',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ fontWeight: 700, fontSize: 28, color: '#FF2D2D', marginBottom: 8 }}>Back to home ?</div>
              <div style={{ color: '#FF2D2D', background: '#000', border: '2px solid #FF2D2D', borderRadius: 12, padding: 18, fontSize: 18, fontWeight: 500, marginBottom: 12 }}>
                You're about to leave this campaign creation process.<br/>Your current progress won't be saved
              </div>
              <button
                onClick={() => router.push('/welcome')}
                style={{
                  background: '#FF2D2D',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 32px',
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: 'pointer',
                  marginTop: 8,
                  boxShadow: '0 2px 12px #FF2D2D55',
                  transition: 'background 0.2s',
                }}
              >
                Confirm & leave
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 