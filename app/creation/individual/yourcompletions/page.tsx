"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

// ============================================================================
// TYPES & INTERFACES - Typage strict pour éviter les 'any'
// ============================================================================

interface EconomicConstants {
  BASE_FEE: number;
  SCALING_FACTOR: number;
  RISK_ADJUSTMENT: number;
  POOL_TOP3_PERCENTAGE: number;
  POOL_CREATOR_PERCENTAGE: number;
  POOL_PLATFORM_PERCENTAGE: number;
  POOL_MODERATORS_PERCENTAGE: number;
  POOL_MINT_PERCENTAGE: number;
}

interface CampaignResult {
  mint: number;
  poolTotal: number;
  creatorGain: number;
  creatorNetGain: number;
  isCreatorProfitable: boolean;
  isMinimumCompletionsReached: boolean;
  creatorXP: number;
  top1: number;
  top2: number;
  top3: number;
  platform: number;
  moderators: number;
  platformTotal: number;
  tauxCompletion: number;
  multiplicateurGain: number;
  multiplicateurXP: number;
  isRefundTop1: boolean;
  isRefundTop2: boolean;
  isRefundTop3: boolean;
  refundTotal: number;
  unitPrice: number;
  currentCompletions: number;
  campaignDuration: number;
}

interface ChartDataItem {
  label: string;
  value: number;
  percentage: string;
  color: string;
  icon: string;
  isRefund?: boolean;
  refundAmount?: number;
}

interface EconomicData extends CampaignResult {
  isThirdPlaceDeficit?: boolean;
  wincValue?: string;
  maxCompletions?: string;
}

// ============================================================================
// CONSTANTES - Centralisées et typées
// ============================================================================

const ECONOMIC_CONSTANTS: EconomicConstants = {
  BASE_FEE: 1.53,
  SCALING_FACTOR: 0.115,
  RISK_ADJUSTMENT: 0.069,
  POOL_TOP3_PERCENTAGE: 0.617,
  POOL_CREATOR_PERCENTAGE: 0.23,
  POOL_PLATFORM_PERCENTAGE: 0.10,
  POOL_MODERATORS_PERCENTAGE: 0.32,
  POOL_MINT_PERCENTAGE: 0.25
};

const COLORS = {
  top1: '#FFD700',
  top2: '#C0C0C0',
  top3: '#CD7F32',
  refund: '#FF2D2D',
  creator: '#18C964',
  platform: '#FFFFFF',
  moderators: '#4A90E2'
} as const;

const VALIDATION = {
  MIN_WINC_VALUE: 1,
  MIN_COMPLETIONS: 5,
  MIN_COMPLETIONS_FOR_ROI: 5
} as const;

// ============================================================================
// UTILITAIRES - Fonctions pures réutilisables
// ============================================================================

/**
 * Normalise une valeur string en nombre en remplaçant les virgules par des points
 * @param value - Valeur string à normaliser
 * @returns Nombre normalisé ou NaN si invalide
 */
const normalizeNumber = (value: string): number => {
  return parseFloat(value.replace(',', '.'));
};

/**
 * Arrondit un nombre à 2 décimales
 */
const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Vérifie si une valeur est un nombre valide et non-NaN
 */
const isValidNumber = (value: number): boolean => {
  return !isNaN(value) && isFinite(value);
};

/**
 * Calcule le pourcentage d'une valeur par rapport au total
 */
const calculatePercentage = (value: number, total: number): string => {
  if (total <= 0) return '0.0';
  return ((value / total) * 100).toFixed(1);
};

// ============================================================================
// LOGIQUE MÉTIER - Calculs économiques isolés
// ============================================================================

/**
 * Calcule la durée dynamique de la campagne basée sur P×N
 */
const calculateCampaignDuration = (P: number, N: number): number => {
  const baseDuration = 7;
  const complexityFactor = Math.log10(Math.max(1, P * N / 100));
  return Math.min(30, Math.max(7, Math.round(baseDuration + complexityFactor * 7)));
};

/**
 * Calcule le discount basé sur la durée
 */
const calculateDurationDiscount = (duration: number): number => {
  if (duration <= 7) return 0.88;
  if (duration <= 14) return 0.94;
  if (duration <= 21) return 0.97;
  return 1.0;
};

/**
 * Calcule le multiplicateur XP basé sur le taux de completion
 */
const calculateXPMultiplier = (completionPercentage: number, isMinReached: boolean): number => {
  if (!isMinReached) return 1;
  
  if (completionPercentage >= 100) return 6;
  if (completionPercentage >= 95) return 5;
  if (completionPercentage >= 90) return 4;
  if (completionPercentage >= 80) return 3;
  if (completionPercentage >= 60) return 2;
  return 1;
};

/**
 * Calcule le multiplicateur de gain basé sur le taux de completion
 */
const calculateGainMultiplier = (completionPercentage: number, isMinReached: boolean): number => {
  if (!isMinReached) return 0;
  return Math.max(0, Math.min(2, (completionPercentage / 100) * 2));
};

/**
 * Calcule les parts de distribution du pool
 */
const calculatePoolShares = (tauxCompletion: number) => {
  const BASE_TOP3 = 0.56;
  const BASE_CREATOR = 0.203;
  const BASE_PLATFORM = 0.0525;
  const BASE_MODERATORS = 0.1845;

  const boostForWinners = Math.min(0.15, 0.10 * (1 - tauxCompletion));
  let top3Share = BASE_TOP3 + boostForWinners;

  let platformShare = Math.max(0.0375, BASE_PLATFORM - 0.0075 * (1 - tauxCompletion));
  let moderatorsShare = Math.max(0.16, BASE_MODERATORS - 0.015 * (1 - tauxCompletion));

  let creatorShare = 1 - (top3Share + platformShare + moderatorsShare);
  if (creatorShare < 0.12) creatorShare = 0.12;

  // Renormalisation
  const shareSum = top3Share + platformShare + moderatorsShare + creatorShare;
  return {
    top3Share: top3Share / shareSum,
    platformShare: platformShare / shareSum,
    moderatorsShare: moderatorsShare / shareSum,
    creatorShare: creatorShare / shareSum
  };
};

/**
 * Fonction principale de simulation de campagne - VERSION OPTIMISÉE
 * Tous les calculs économiques sont centralisés ici
 */
function simulateCampaign(P: number, N: number, CR: number = N): CampaignResult {
  // Validation des entrées
  if (!isValidNumber(P) || !isValidNumber(N) || !isValidNumber(CR)) {
    throw new Error('Invalid input parameters for campaign simulation');
  }

  if (P < VALIDATION.MIN_WINC_VALUE || N < VALIDATION.MIN_COMPLETIONS) {
    throw new Error(`P must be >= ${VALIDATION.MIN_WINC_VALUE} and N must be >= ${VALIDATION.MIN_COMPLETIONS}`);
  }

  // Calcul de la durée et du discount
  const CAMPAIGN_DURATION_DAYS = calculateCampaignDuration(P, N);
  const DURATION_DISCOUNT = calculateDurationDiscount(CAMPAIGN_DURATION_DAYS);

  // Calcul du MINT
  const sqrtPN = Math.sqrt(P * N);
  const mintRaw = (ECONOMIC_CONSTANTS.BASE_FEE * DURATION_DISCOUNT) +
                  (P * N * ECONOMIC_CONSTANTS.SCALING_FACTOR * DURATION_DISCOUNT) +
                  (sqrtPN * ECONOMIC_CONSTANTS.RISK_ADJUSTMENT * DURATION_DISCOUNT);
  const mint = round2(mintRaw);

  // Calcul du taux de completion
  const tauxCompletion = Math.max(0, Math.min(1, CR / N));
  const completionPercentage = tauxCompletion * 100;

  // Valeur totale du pool
  const totalValue = (P * CR) + mint;

  // Vérification minimum completions
  const isMinimumCompletionsReached = CR >= VALIDATION.MIN_COMPLETIONS_FOR_ROI;

  // Calcul des multiplicateurs
  const multiplicateurXP = calculateXPMultiplier(completionPercentage, isMinimumCompletionsReached);
  const multiplicateurGain = calculateGainMultiplier(completionPercentage, isMinimumCompletionsReached);

  // Calcul des parts de distribution
  const shares = calculatePoolShares(tauxCompletion);

  // Montants bruts par part
  const rawTop3Pool = totalValue * shares.top3Share;
  const rawCreatorPool = totalValue * shares.creatorShare;
  let platform = round2(totalValue * shares.platformShare);
  let moderators = round2(totalValue * shares.moderatorsShare);

  // Calcul du gain créateur avec cap
  const creatorGainWithMultiplier = rawCreatorPool * multiplicateurGain;
  const minCap = 1.2;
  const maxCap = 2.2;
  let creatorCapFactor: number;
  
  if (completionPercentage <= 60) {
    creatorCapFactor = minCap;
  } else if (completionPercentage >= 100) {
    creatorCapFactor = maxCap;
  } else {
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

  // Logique des floors pour les winners (si minimum completions atteint)
  if (isMinimumCompletionsReached) {
    const floor1 = 2.5 * P;
    const floor2 = 2.0 * P;
    const floor3 = 1.5 * P;

    const need1 = Math.max(0, floor1 - top1);
    const need2 = Math.max(0, floor2 - top2);
    const need3 = Math.max(0, floor3 - top3);
    const totalNeeds = need1 + need2 + need3;

    if (totalNeeds > 0) {
      const creatorSurplus = Math.max(0, creatorGainWithMultiplier - creatorGain);
      let remainingNeeds = totalNeeds;
      let recovered = 0;

      if (creatorSurplus > 0) {
        const takeFromCreatorSurplus = Math.min(creatorSurplus, remainingNeeds);
        recovered += takeFromCreatorSurplus;
        remainingNeeds -= takeFromCreatorSurplus;
      }

      if (remainingNeeds > 0 && platform > 0) {
        const takeFromPlatform = Math.min(platform * 0.5, remainingNeeds);
        platform = Math.max(0, round2(platform - takeFromPlatform));
        recovered += takeFromPlatform;
        remainingNeeds -= takeFromPlatform;
      }

      if (remainingNeeds > 0 && moderators > 0) {
        const maxTakeFromModerators = moderators * 0.3;
        const takeFromModerators = Math.min(maxTakeFromModerators, remainingNeeds);
        moderators = Math.max(0, round2(moderators - takeFromModerators));
        recovered += takeFromModerators;
      }

      if (recovered > 0) {
        const ratio1 = totalNeeds > 0 ? (need1 / totalNeeds) : 0;
        const ratio2 = totalNeeds > 0 ? (need2 / totalNeeds) : 0;
        const ratio3 = totalNeeds > 0 ? (need3 / totalNeeds) : 0;

        top1 += recovered * ratio1;
        top2 += recovered * ratio2;
        top3 += recovered * ratio3;
      }
    }
  } else {
    // Mode normal (CR >= 5) - Gains modérateurs strictement croissants
    const cr4ModeratorGain = mint * 0.35;
    const theoreticalModerators = round2(totalValue * shares.moderatorsShare);
    const completionProgress = Math.min(1, (CR - 5) / (N - 5));
    const minimumGrowthRate = 1.02;
    const maximumGrowthRate = 1.5;
    const growthMultiplier = minimumGrowthRate + (maximumGrowthRate - minimumGrowthRate) * completionProgress;
    const guaranteedMinGain = cr4ModeratorGain * growthMultiplier;
    
    moderators = Math.max(theoreticalModerators, guaranteedMinGain);
    moderators = round2(moderators);
    
    const totalDistributed = creatorGain + top1 + top2 + top3 + moderators;
    const remainingForPlatform = Math.max(0, totalValue - totalDistributed);
    platform = round2(remainingForPlatform);
  }

  // Gestion du remboursement si < 5 completions
  let top1Final = top1;
  let top2Final = top2;
  let top3Final = top3;
  let isRefundTop1 = false;
  let isRefundTop2 = false;
  let isRefundTop3 = false;
  let refundTotal = 0;

  if (!isMinimumCompletionsReached) {
    top1Final = 0;
    top2Final = 0;
    top3Final = 0;
    refundTotal = P * CR;
    const hasAnyCompletion = CR > 0;
    isRefundTop1 = hasAnyCompletion;
    isRefundTop2 = hasAnyCompletion;
    isRefundTop3 = hasAnyCompletion;

    creatorGain = 0;
    creatorNetGain = -mint;

    const baseModeratorGain = mint * 0.15;
    const maxModeratorGainBeforeNormal = mint * 0.35;
    const completionRatio = CR / 4;
    const growthBonus = (maxModeratorGainBeforeNormal - baseModeratorGain) * completionRatio;
    
    moderators = round2(baseModeratorGain + growthBonus);
    platform = round2(mint - moderators);
  }

  // Construction du résultat
  const result: CampaignResult = {
    mint: round2(mint),
    poolTotal: round2(totalValue),
    creatorGain: round2(creatorGain),
    creatorNetGain: round2(creatorNetGain),
    isCreatorProfitable: creatorGain >= mint,
    isMinimumCompletionsReached,
    creatorXP: 200 * multiplicateurXP,
    top1: round2(top1Final),
    top2: round2(top2Final),
    top3: round2(top3Final),
    platform: round2(platform),
    moderators: round2(moderators),
    platformTotal: round2(totalValue * shares.platformShare),
    tauxCompletion: round2(tauxCompletion),
    multiplicateurGain,
    multiplicateurXP,
    isRefundTop1,
    isRefundTop2,
    isRefundTop3,
    refundTotal: round2(refundTotal),
    unitPrice: P,
    currentCompletions: CR,
    campaignDuration: CAMPAIGN_DURATION_DAYS
  };

  // Vérification finale et ajustement si nécessaire
  const winnersOrRefund = isMinimumCompletionsReached 
    ? (result.top1 + result.top2 + result.top3) 
    : result.refundTotal;
  const distributed = result.creatorGain + winnersOrRefund + result.platform + result.moderators;
  
  if (Math.abs(distributed - result.poolTotal) > 0.01 && result.poolTotal > 0) {
    const adj = result.poolTotal / distributed;
    if (isMinimumCompletionsReached) {
      result.top1 = round2(result.top1 * adj);
      result.top2 = round2(result.top2 * adj);
      result.top3 = round2(result.top3 * adj);
    } else {
      result.refundTotal = round2(result.refundTotal * adj);
    }
    result.platform = round2(result.platform * adj);
    result.moderators = round2(result.moderators * adj);
  }

  return result;
}

// ============================================================================
// HOOKS PERSONNALISÉS - Logique réutilisable
// ============================================================================

/**
 * Hook pour gérer la simulation économique avec mémorisation
 */
const useEconomicSimulation = (wincValue: string, maxCompletions: string, completionRate?: number) => {
  return useMemo(() => {
    if (!wincValue || !maxCompletions) return null;

    const P = normalizeNumber(wincValue);
    const N = parseInt(maxCompletions);

    if (!isValidNumber(P) || !isValidNumber(N)) return null;
    if (P < VALIDATION.MIN_WINC_VALUE || N < VALIDATION.MIN_COMPLETIONS) return null;

    try {
      const CR = completionRate !== undefined 
        ? Math.round((completionRate / 100) * N)
        : N;
      
      const data = simulateCampaign(P, N, CR);
      const isThirdPlaceDeficit = data.top3 < P;
      
      return { ...data, isThirdPlaceDeficit, wincValue, maxCompletions };
    } catch (error) {
      console.error('Economic simulation error:', error);
      return null;
    }
  }, [wincValue, maxCompletions, completionRate]);
};

/**
 * Hook pour détecter si on est sur desktop
 */
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth > 768);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  return isDesktop;
};

// ============================================================================
// COMPOSANTS UI - Séparés et optimisés
// ============================================================================

const GreenArrowButton: React.FC<{ onClick: () => void; disabled: boolean }> = React.memo(({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label="Next"
    style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'none',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      padding: 0,
      outline: 'none',
      zIndex: 10,
    }}
  >
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill={disabled ? '#FF2D2D' : '#18C964'} />
      <path d="M16 22L24 30L32 22" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
));

const CloseIcon: React.FC<{ onClick: () => void }> = React.memo(({ onClick }) => (
  <svg 
    onClick={onClick} 
    width={32} 
    height={32} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    style={{ cursor: 'pointer', position: 'absolute', top: 24, right: 24, zIndex: 100 }}
    role="button"
    aria-label="Close"
  >
    <line x1="10" y1="10" x2="22" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
    <line x1="22" y1="10" x2="10" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
  </svg>
));

// ============================================================================
// COMPOSANT PRINCIPAL - Version refactorisée
// ============================================================================

export default function YourCompletionsPage() {
  const router = useRouter();
  const [wincValue, setWincValue] = useState<string>('');
  const [maxCompletions, setMaxCompletions] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showEconomicDetails, setShowEconomicDetails] = useState(false);
  const [showCreatorGainModal, setShowCreatorGainModal] = useState(false);
  const [completionRate, setCompletionRate] = useState(100);
  const [showCompletionRateModal, setShowCompletionRateModal] = useState(false);
  const [showPoolDistributionChart, setShowPoolDistributionChart] = useState(false);

  const isDesktop = useIsDesktop();
  
  // Utilisation du hook mémorisé pour les calculs économiques
  const economicData = useEconomicSimulation(wincValue, maxCompletions);

  // Réinitialiser le taux de completion quand le modal s'ouvre
  useEffect(() => {
    if (showCreatorGainModal) {
      setCompletionRate(100);
    }
  }, [showCreatorGainModal]);

  // Handlers mémorisés pour éviter les re-renders inutiles
  const handleWincChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[\d.,]+$/.test(value)) {
      const normalizedValue = value.replace(',', '.');
      const numValue = normalizeNumber(normalizedValue);
      if (value === '' || (numValue >= VALIDATION.MIN_WINC_VALUE && isValidNumber(numValue))) {
        setWincValue(value);
      }
    }
  }, []);

  const handleCompletionsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setMaxCompletions(value);
    }
  }, []);

  const canProceed = useMemo(() => {
    if (!wincValue || !maxCompletions || !economicData) return false;
    return economicData.isCreatorProfitable && !economicData.isThirdPlaceDeficit;
  }, [wincValue, maxCompletions, economicData]);

  const handleNext = useCallback(() => {
    if (canProceed && economicData) {
      const normalizedWincValue = wincValue.replace(',', '.');
      localStorage.setItem("completions", JSON.stringify({
        wincValue: parseFloat(normalizedWincValue),
        maxCompletions: parseInt(maxCompletions)
      }));
      router.push('/creation/individual/recap');
    }
  }, [canProceed, economicData, wincValue, maxCompletions, router]);

  const handleCloseClick = useCallback(() => setShowLeaveModal(true), []);

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', paddingTop: 48 }}>
        <CloseIcon onClick={handleCloseClick} />
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 600, margin: '0 auto 24px auto', position: 'relative' }}>
          <img src="/individual.svg" alt="Individual" style={{ width: 96, height: 96, marginRight: 18 }} />
          <span style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>Your Completions</span>
          <button onClick={() => setShowTooltip(true)} style={{ background: 'none', border: 'none', marginLeft: 18, cursor: 'pointer', padding: 0 }} aria-label="Help">
            <img src="/tooltip.svg" alt="Aide" style={{ width: 40, height: 40 }} />
          </button>
        </div>

        {/* Layout principal */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isDesktop ? 'row' : 'column',
          gap: 48,
          width: '100%',
          maxWidth: 1200,
          padding: '0 24px',
          alignItems: 'flex-start',
          justifyContent: 'center'
        }}>
          
          {/* Colonne gauche - Configuration */}
          <div style={{ 
            flex: isDesktop ? '0 0 400px' : '1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ 
              position: 'relative', 
              background: '#000', 
              borderRadius: 24, 
              boxShadow: '0 0 24px #000', 
              padding: '32px 24px 32px 24px', 
              width: 400, 
              maxWidth: '90vw', 
              border: '2px solid #FFD600', 
              marginBottom: 32
            }}>
              
              {/* Premier encart - Unit Value */}
              <div style={{ marginBottom: 32 }}>
                <label htmlFor="unit-value" style={{ 
                  color: economicData && !economicData.isCreatorProfitable ? '#FF2D2D' : '#FFD600', 
                  fontWeight: 700, 
                  fontSize: 20, 
                  marginBottom: 8, 
                  textAlign: 'center',
                  transition: 'color 0.3s ease',
                  display: 'block'
                }}>
                  Unit Value of the Completion in $WINC
                </label>
                <div style={{ 
                  border: `2px solid ${economicData && !economicData.isCreatorProfitable ? '#FF2D2D' : '#FFD600'}`, 
                  borderRadius: 6, 
                  padding: '12px 0', 
                  textAlign: 'center', 
                  fontStyle: 'italic', 
                  fontSize: 18, 
                  color: economicData && !economicData.isCreatorProfitable ? '#FF2D2D' : '#FFD600', 
                  background: 'none',
                  transition: 'all 0.3s ease'
                }}>
                  <input
                    id="unit-value"
                    type="text"
                    value={wincValue}
                    onChange={handleWincChange}
                    placeholder="Minimum 1 $WINC"
                    aria-label="Unit value in WINC"
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: economicData && !economicData.isCreatorProfitable ? '#FF2D2D' : '#FFD600',
                      fontSize: 18,
                      fontStyle: 'italic',
                      textAlign: 'center',
                      width: '100%',
                      transition: 'color 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Deuxième encart - Max Completions */}
              <div style={{ marginBottom: 32 }}>
                <label htmlFor="max-completions" style={{ 
                  color: (economicData && !economicData.isCreatorProfitable) || (maxCompletions !== '' && parseInt(maxCompletions) < 5) ? '#FF2D2D' : '#FFD600', 
                  fontWeight: 700, 
                  fontSize: 20, 
                  marginBottom: 8, 
                  textAlign: 'center',
                  transition: 'color 0.3s ease',
                  display: 'block'
                }}>
                  Max. Completions
                </label>
                <div style={{ 
                  border: `2px solid ${(economicData && !economicData.isCreatorProfitable) || (maxCompletions !== '' && parseInt(maxCompletions) < 5) ? '#FF2D2D' : '#FFD600'}`, 
                  borderRadius: 6, 
                  padding: '12px 0', 
                  textAlign: 'center', 
                  fontStyle: 'italic', 
                  fontSize: 18, 
                  color: (economicData && !economicData.isCreatorProfitable) || (maxCompletions !== '' && parseInt(maxCompletions) < 5) ? '#FF2D2D' : '#FFD600', 
                  background: 'none',
                  transition: 'all 0.3s ease'
                }}>
                  <input
                    id="max-completions"
                    type="text"
                    value={maxCompletions}
                    onChange={handleCompletionsChange}
                    placeholder="Minimum 5 Completions"
                    aria-label="Maximum number of completions"
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: (economicData && !economicData.isCreatorProfitable) || (maxCompletions !== '' && parseInt(maxCompletions) < 5) ? '#FF2D2D' : '#FFD600',
                      fontSize: 18,
                      fontStyle: 'italic',
                      textAlign: 'center',
                      width: '100%',
                      transition: 'color 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Affichage dynamique du MINT */}
              {economicData && (
                <div style={{
                  background: 'linear-gradient(135deg, #FFD600, #FFA500)',
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'center',
                  marginBottom: 24,
                  border: '2px solid #FFD600',
                  opacity: 1,
                  transition: 'all 0.3s ease',
                  boxShadow: economicData && !economicData.isCreatorProfitable 
                    ? '0 0 20px rgba(255, 214, 0, 0.5)' 
                    : 'none'
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#000', marginBottom: 4 }}>
                    Your initial MINT
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#000', marginBottom: 4 }}>
                    {economicData.mint} $WINC
                  </div>
                  <div style={{ fontSize: 12, fontStyle: 'italic', color: '#000', opacity: 0.8 }}>
                    Make sure you have enough $WINC in your wallet
                  </div>
                  {!isDesktop && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => setShowEconomicDetails(true)}
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid #000',
                          borderRadius: 6,
                          padding: '8px 16px',
                          color: '#000',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          flex: 1
                        }}
                      >
                        📊 Economic Details
                      </button>
                      <button
                        onClick={() => setShowCompletionRateModal(true)}
                        style={{
                          background: 'rgba(255, 215, 0, 0.2)',
                          border: '1px solid #000',
                          borderRadius: 6,
                          padding: '8px 16px',
                          color: '#000',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          flex: 1
                        }}
                      >
                        🏆 Simulate Rewards
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Message d'erreur si non profitable */}
              {economicData && !economicData.isCreatorProfitable && (
                <div style={{
                  background: 'linear-gradient(135deg, #FF2D2D, #FF1744)',
                  borderRadius: 12,
                  padding: 20,
                  textAlign: 'center',
                  marginBottom: 24,
                  border: '2px solid #FF2D2D',
                  boxShadow: '0 0 20px rgba(255, 45, 45, 0.3)'
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
                    ⚠️ WARNING: Unprofitable Campaign
                  </div>
                  <div style={{ fontSize: 16, color: '#fff', marginBottom: 12, lineHeight: 1.4 }}>
                    As an individual creator, you would lose money with these values!
                  </div>
                  {!economicData.isMinimumCompletionsReached && (
                    <div style={{ fontSize: 14, color: '#fff', marginBottom: 8, background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '6px' }}>
                      ⚠️ Minimum 5 completions required for ROI. Below 5: You lose MINT, completers get refunded.
                    </div>
                  )}
                  <div style={{ fontSize: 14, color: '#fff', marginBottom: 8, opacity: 0.9 }}>
                    Your Creator Gain: <strong>{economicData.creatorGain} $WINC</strong>
                  </div>
                  <div style={{ fontSize: 14, color: '#fff', marginBottom: 12, opacity: 0.9 }}>
                    Your Initial MINT: <strong>{economicData.mint} $WINC</strong>
                  </div>
                  <div style={{ fontSize: 14, color: '#fff', fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '6px' }}>
                    💡 Increase Unit Value or Max Completions to make it profitable
                  </div>
                </div>
              )}

              {/* Message d'erreur pour la 3ème place déficitaire */}
              {economicData && economicData.isThirdPlaceDeficit && (
                <div style={{
                  background: 'linear-gradient(135deg, #FF2D2D, #FF1744)',
                  borderRadius: 12,
                  padding: 20,
                  textAlign: 'center',
                  marginBottom: 24,
                  border: '2px solid #FF2D2D',
                  boxShadow: '0 0 20px rgba(255, 45, 45, 0.3)'
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
                    ⚠️ WARNING: Winners Would Lose Money
                  </div>
                  <div style={{ fontSize: 16, color: '#fff', marginBottom: 12, lineHeight: 1.4 }}>
                    The winners would receive less than what they paid!
                  </div>
                  <div style={{ fontSize: 14, color: '#fff', marginBottom: 8, opacity: 0.9 }}>
                    Unit Value: <strong>{wincValue} $WINC</strong>
                  </div>
                  <div style={{ fontSize: 14, color: '#fff', fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '6px' }}>
                    💡 Increase Unit Value and/or Max Completions to make rewards profitable
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Détails économiques (desktop uniquement) */}
          {isDesktop && economicData && (
            <div style={{ 
              flex: '0 0 400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 400
            }}>
              <div style={{
                background: '#000',
                border: '2px solid #18C964',
                borderRadius: 24,
                padding: '24px 24px 32px 24px',
                width: 400,
                maxWidth: 400,
                boxShadow: '0 0 24px #000',
                color: '#fff'
              }}>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <h2 style={{ color: '#18C964', fontSize: 24, fontWeight: 900, marginBottom: 6 }}>
                    $WINC Economic Details
                  </h2>
                </div>

                <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                  <div 
                    onClick={() => setShowPoolDistributionChart(true)}
                    style={{
                      background: '#000',
                      border: '2px solid #18C964',
                      borderRadius: 10,
                      padding: 8,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#18C964', marginBottom: 2 }}>
                      Total Reward $WINC Pool
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#18C964' }}>
                      {economicData.poolTotal} $WINC
                    </div>
                    <div style={{ fontSize: 10, color: '#18C964', opacity: 0.7, marginTop: 4 }}>
                      Click to view distribution chart
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: '1st Place 🥇', value: economicData.top1, color: economicData.isThirdPlaceDeficit ? '#FF2D2D' : '#FFD700' },
                    { label: '2nd Place 🥈', value: economicData.top2, color: economicData.isThirdPlaceDeficit ? '#FF2D2D' : '#C0C0C0' },
                    { label: '3rd Place 🥉', value: economicData.top3, color: economicData.isThirdPlaceDeficit ? '#FF2D2D' : '#CD7F32' }
                  ].map((winner, index) => (
                    <div 
                      key={index}
                      onClick={() => setShowCompletionRateModal(true)}
                      style={{
                        background: 'transparent',
                        border: `2px solid ${winner.color}`,
                        borderRadius: 8,
                        padding: 8,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, color: winner.color, marginBottom: 4 }}>
                        {winner.label}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: winner.color }}>
                        {winner.value} $WINC
                      </div>
                      <div style={{ fontSize: 10, color: winner.color, opacity: 0.7, marginTop: 4 }}>
                        Click to simulate
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #FFD600, #FFA500)',
                      border: '2px solid #FFD600',
                      borderRadius: 8,
                      padding: 8,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#000', marginBottom: 4 }}>
                        Platform
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#000' }}>
                        {economicData.platform} $WINC
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'linear-gradient(135deg, #4A90E2, #357ABD)',
                      border: '2px solid #4A90E2',
                      borderRadius: 8,
                      padding: 8,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                        Moderators
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>
                        {economicData.moderators} $WINC
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setShowCreatorGainModal(true)}
                  style={{
                    background: economicData.isCreatorProfitable 
                      ? 'linear-gradient(135deg, #18C964, #00B894)' 
                      : 'linear-gradient(135deg, #FFD600, #FFA500)',
                    borderRadius: 12,
                    padding: 16,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#000', marginBottom: 4 }}>
                    Your Creator Gain
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#000', marginBottom: 4 }}>
                    {economicData.creatorGain} $WINC
                  </div>
                  <div style={{ fontSize: 11, color: '#000', opacity: 0.8 }}>
                    Click to simulate different completion rates
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <GreenArrowButton onClick={handleNext} disabled={!canProceed} />

        {/* Modals - Simplifiés pour éviter la duplication */}
        {showTooltip && <TooltipModal onClose={() => setShowTooltip(false)} />}
        {showLeaveModal && <LeaveModal onClose={() => setShowLeaveModal(false)} onConfirm={() => router.push('/welcome')} />}
        {showCreatorGainModal && economicData && (
          <CreatorGainModal 
            isVisible={showCreatorGainModal}
            onClose={() => setShowCreatorGainModal(false)}
            completionRate={completionRate}
            onCompletionRateChange={setCompletionRate}
            economicData={economicData}
          />
        )}
        {showCompletionRateModal && economicData && (
          <CompletionRateModal 
            isVisible={showCompletionRateModal}
            onClose={() => setShowCompletionRateModal(false)}
            economicData={economicData}
          />
        )}
        {showPoolDistributionChart && economicData && (
          <PoolDistributionChart 
            isVisible={showPoolDistributionChart}
            onClose={() => setShowPoolDistributionChart(false)}
            data={economicData}
          />
        )}
        {showEconomicDetails && !isDesktop && economicData && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.8)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setShowEconomicDetails(false)}
          >
            {/* Contenu identique à la version desktop */}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

// ============================================================================
// COMPOSANTS MODALS - Extraits pour réutilisabilité
// ============================================================================

const TooltipModal: React.FC<{ onClose: () => void }> = React.memo(({ onClose }) => (
  <div
    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    onClick={onClose}
  >
    <div
      style={{
        position: 'relative',
        maxWidth: 600,
        width: '90vw',
        maxHeight: '90vh',
        background: '#000',
        border: '4px solid #FFD600',
        borderRadius: 24,
        padding: '32px 24px 28px 24px',
        boxShadow: '0 0 32px #000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#FFD600',
        overflowY: 'auto'
      }}
      onClick={e => e.stopPropagation()}
    >
      <CloseIcon onClick={onClose} />
      <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 18 }}>Your Completions</h2>
      
      <div style={{ color: '#fff', fontSize: 16, fontWeight: 400, marginBottom: 24, textAlign: 'left', flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: 16 }}>
          <strong style={{ color: '#FFD600' }}>📝 Quick Guide</strong><br />
          • <strong>Unit Value in $WINC:</strong> amount paid per completer. Minimum 1 $WINC.<br />
          • <strong>Max. Completions:</strong> maximum number of validations. Minimum 5.
        </div>

        <div style={{ marginBottom: 16 }}>
          <strong style={{ color: '#FFD600' }}>🏅 Winner Selection</strong><br />
          Decentralized moderators score each completion from 1/100 to 100/100. The top 3 winners are determined by average scores.
        </div>

        <div style={{ marginBottom: 16 }}>
          <strong style={{ color: '#FFD600' }}>💰 Economic Equation</strong><br />
          <code style={{ background: '#333', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
            (Unit Value × Max Completions) + MINT = Total Pool
          </code>
        </div>

        <div style={{ background: '#FFD600', color: '#000', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
          💡 Economic details displayed in real-time on desktop!
        </div>
      </div>
    </div>
  </div>
));

const LeaveModal: React.FC<{ onClose: () => void; onConfirm: () => void }> = React.memo(({ onClose, onConfirm }) => (
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
    onClick={onClose}
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
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ fontWeight: 700, fontSize: 28, color: '#FF2D2D', marginBottom: 8 }}>Back to home?</div>
      <div style={{ color: '#FF2D2D', background: '#000', border: '2px solid #FF2D2D', borderRadius: 12, padding: 18, fontSize: 18, fontWeight: 500 }}>
        Your current progress won't be saved
      </div>
      <button
        onClick={onConfirm}
        style={{
          background: '#FF2D2D',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '14px 32px',
          fontWeight: 700,
          fontSize: 18,
          cursor: 'pointer',
          boxShadow: '0 2px 12px #FF2D2D55'
        }}
      >
        Confirm & leave
      </button>
    </div>
  </div>
));

const CreatorGainModal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  completionRate: number;
  onCompletionRateChange: (rate: number) => void;
  economicData: EconomicData;
}> = React.memo(({ isVisible, onClose, completionRate, onCompletionRateChange, economicData }) => {
  const dynamicData = useEconomicSimulation(
    economicData.wincValue || '0',
    economicData.maxCompletions || '0',
    completionRate
  );

  if (!isVisible || !dynamicData) return null;

  const N = parseInt(economicData.maxCompletions || '0');
  const actualCompletions = Math.round((completionRate / 100) * N);

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#000',
          border: '2px solid #18C964',
          borderRadius: 24,
          padding: '32px',
          maxWidth: 500,
          width: '100%',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}
      >
        <CloseIcon onClick={onClose} />
        
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#18C964', margin: '0 0 8px 0' }}>
            Your Creator Gain Simulator
          </h2>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>
            Adjust completion rate to see your potential gains
          </p>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>Completion Rate</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#18C964' }}>{completionRate}%</span>
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            value={completionRate}
            onChange={(e) => onCompletionRateChange(parseInt(e.target.value))}
            aria-label="Completion rate percentage"
            style={{
              width: '100%',
              height: 8,
              borderRadius: 4,
              background: `linear-gradient(to right, #18C964 0%, #18C964 ${completionRate}%, #333 ${completionRate}%, #333 100%)`,
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
        </div>

        <div style={{ background: 'rgba(24, 201, 100, 0.1)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Actual Completions</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{actualCompletions} / {N}</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Your Creator Gain</div>
              <div style={{ 
                fontSize: 20, 
                fontWeight: 900, 
                color: dynamicData.isCreatorProfitable ? '#18C964' : '#FF2D2D' 
              }}>
                {dynamicData.creatorGain} $WINC
              </div>
            </div>
          </div>
          
          {!dynamicData.isMinimumCompletionsReached && (
            <div style={{ 
              background: 'rgba(255, 45, 45, 0.1)', 
              border: '1px solid #FF2D2D', 
              borderRadius: 8, 
              padding: 12, 
              marginTop: 16, 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#FF2D2D', marginBottom: 4 }}>
                ⚠️ Minimum 5 Completions Required
              </div>
              <div style={{ fontSize: 12, color: '#FF2D2D' }}>
                Below 5: You lose your MINT, completers get refunded
              </div>
            </div>
          )}
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Pool Total</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#FFD600' }}>{dynamicData.poolTotal} $WINC</div>
        </div>
      </div>
    </div>
  );
});

const CompletionRateModal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  economicData: EconomicData;
}> = React.memo(({ isVisible, onClose, economicData }) => {
  const [completionRate, setCompletionRate] = useState(100);
  const [absoluteCompletions, setAbsoluteCompletions] = useState(0);
  const [dynamicData, setDynamicData] = useState<any>(null);

  // Styles CSS pour les sliders
  const sliderStyles = `
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid #000;
      cursor: pointer;
      box-shadow: 0 0 8px rgba(255, 214, 0, 0.5);
    }
    
    input[type="range"]::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid #000;
      cursor: pointer;
      box-shadow: 0 0 8px rgba(255, 214, 0, 0.5);
      background: #FFD600;
    }

    .slider-gold::-webkit-slider-thumb {
      background: #FFD700;
    }
    
    .slider-silver::-webkit-slider-thumb {
      background: #C0C0C0;
      box-shadow: 0 0 8px rgba(192, 192, 192, 0.5);
    }
    
    .slider-bronze::-webkit-slider-thumb {
      background: #CD7F32;
      box-shadow: 0 0 8px rgba(205, 127, 50, 0.5);
    }
  `;

  // Calculer les données dynamiques quand le taux de completion change
  useEffect(() => {
    if (economicData && isVisible) {
      const normalizedWincValue = economicData.wincValue?.toString().replace(',', '.') || '0';
      const P = parseFloat(normalizedWincValue);
      const N = parseInt(economicData.maxCompletions?.toString() || '0');
      const isLargeMaxCompletions = N > 100;
      
      let CR;
      if (isLargeMaxCompletions) {
        CR = absoluteCompletions;
      } else {
        CR = Math.round((completionRate / 100) * N);
      }
      
      const data = simulateCampaign(P, N, CR);
      
      // PROTECTION : S'assurer que Platform et Moderators ne soient jamais à 0
      if (data.platform <= 0 || data.moderators <= 0) {
        console.warn("⚠️ Platform ou Moderators = 0 détecté, correction automatique appliquée");
        
        // Calculer un minimum basé sur le MINT (ajusté pour la réduction de 25% de la plateforme)
        const minPlatform = Math.max(0.075, data.mint * 0.0375); // 3.75% du MINT minimum (réduit de 25%)
        const minModerators = Math.max(0.2, data.mint * 0.10); // 10% du MINT minimum (inchangé)
        
        data.platform = Math.max(data.platform, minPlatform);
        data.moderators = Math.max(data.moderators, minModerators);
        
        // Recalculer le total si nécessaire
        const totalDistributed = data.top1 + data.top2 + data.top3 + 
                                data.creatorGain + data.platform + data.moderators;
        
        if (Math.abs(totalDistributed - data.poolTotal) > 0.01) {
          // Normaliser pour maintenir l'équilibre
          const adjustmentFactor = data.poolTotal / totalDistributed;
          data.top1 = Math.round(data.top1 * adjustmentFactor * 100) / 100;
          data.top2 = Math.round(data.top2 * adjustmentFactor * 100) / 100;
          data.top3 = Math.round(data.top3 * adjustmentFactor * 100) / 100;
          data.creatorGain = Math.round(data.creatorGain * adjustmentFactor * 100) / 100;
          data.platform = Math.round(data.platform * adjustmentFactor * 100) / 100;
          data.moderators = Math.round(data.moderators * adjustmentFactor * 100) / 100;
        }
      }
      
      // La fonction simulateCampaign gère déjà la logique de remboursement
      // Pas besoin de recalculer ici, utiliser directement les données
      const enhancedData = {
        ...data,
        unitPrice: P
      };
      
      setDynamicData(enhancedData);
      
      // Sauvegarder les données de simulation pour persistance
      const simulationData = {
        completionRate: isLargeMaxCompletions ? Math.round((absoluteCompletions / N) * 100) : completionRate,
        absoluteCompletions: isLargeMaxCompletions ? absoluteCompletions : Math.round((completionRate / 100) * N),
        economicResults: enhancedData,
        timestamp: Date.now()
      };
      localStorage.setItem('completionSimulationData', JSON.stringify(simulationData));
    }
  }, [completionRate, absoluteCompletions, economicData, isVisible]);

  // Initialiser absoluteCompletions quand le modal s'ouvre
  useEffect(() => {
    if (isVisible && economicData) {
      const N = parseInt(economicData.maxCompletions?.toString() || '0');
      if (N > 100) {
        setAbsoluteCompletions(N); // Commencer à 100% pour les grandes campagnes
      }
    }
  }, [isVisible, economicData]);

  if (!isVisible || !economicData) return null;

  const normalizedWincValue = economicData.wincValue?.toString().replace(',', '.') || '0';
  const P = parseFloat(normalizedWincValue);
  const N = parseInt(economicData.maxCompletions?.toString() || '0');
  const isLargeMaxCompletions = N > 100;
  
  const actualCompletions = isLargeMaxCompletions ? absoluteCompletions : Math.round((completionRate / 100) * N);
  const displayPercentage = isLargeMaxCompletions ? Math.round((absoluteCompletions / N) * 100) : completionRate;

  const handleSliderChange = (value: number) => {
    if (isLargeMaxCompletions) {
      setAbsoluteCompletions(value);
    } else {
      setCompletionRate(value);
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        cursor: 'pointer'
      }}
    >
      <style>{sliderStyles}</style>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#000',
          border: '2px solid #FFD600',
          borderRadius: 24,
          padding: '32px',
          maxWidth: 600,
          width: '100%',
          maxHeight: '90vh',
          height: '90vh',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          cursor: 'default',
          overflowY: 'auto'
        }}
      >
        <CloseIcon onClick={onClose} />
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ 
            fontSize: 28, 
            fontWeight: 900, 
            color: '#FFD600', 
            margin: '0 0 8px 0' 
          }}>
            Completion Rate Simulator
          </h2>
          <p style={{ 
            fontSize: 16, 
            color: '#888', 
            margin: 0 
          }}>
            {isLargeMaxCompletions 
              ? 'Adjust completion count to see rewards for each position'
              : 'Adjust completion rate to see rewards for each position'
            }
          </p>
        </div>

        {/* Sliders Section */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 20 
          }}>
            <span style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>
              {isLargeMaxCompletions ? 'Completion Count' : 'Completion Rate'}
            </span>
            {isLargeMaxCompletions ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                fontSize: 24, 
                fontWeight: 900, 
                color: '#FFD600' 
              }}>
                <input
                  type="number"
                  min={0}
                  max={N}
                  value={absoluteCompletions}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    const clampedValue = Math.min(Math.max(value, 0), N);
                    setAbsoluteCompletions(clampedValue);
                  }}
                  style={{
                    background: '#333',
                    border: '2px solid #FFD600',
                    borderRadius: 8,
                    color: '#FFD600',
                    fontSize: 20,
                    fontWeight: 900,
                    padding: '8px 12px',
                    width: 120,
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
                <span>/ {N}</span>
              </div>
            ) : (
              <span style={{ 
                fontSize: 24, 
                fontWeight: 900, 
                color: '#FFD600' 
              }}>
                {completionRate}%
              </span>
            )}
          </div>
          
          {/* Slider principal */}
          <input
            type="range"
            min={isLargeMaxCompletions ? 0 : 0}
            max={isLargeMaxCompletions ? N : 100}
            value={isLargeMaxCompletions ? absoluteCompletions : completionRate}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            className={isLargeMaxCompletions ? 'slider-gold' : ''}
            style={{
              width: '100%',
              height: 12,
              borderRadius: 6,
              background: isLargeMaxCompletions 
                ? `linear-gradient(to right, #FFD600 0%, #FFD600 ${(absoluteCompletions / N) * 100}%, #333 ${(absoluteCompletions / N) * 100}%, #333 100%)`
                : `linear-gradient(to right, #FFD600 0%, #FFD600 ${completionRate}%, #333 ${completionRate}%, #333 100%)`,
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none',
              marginBottom: 16
            }}
          />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: 24 
          }}>
            <span style={{ fontSize: 14, color: '#666' }}>
              {isLargeMaxCompletions ? '0' : '0%'}
            </span>
            <span style={{ fontSize: 14, color: '#666' }}>
              {isLargeMaxCompletions ? `${N}` : '100%'}
            </span>
          </div>

          {/* Info sur les completions actuelles */}
          <div style={{ 
            background: 'rgba(255, 214, 0, 0.1)', 
            border: '1px solid #FFD600', 
            borderRadius: 12, 
            padding: 16, 
            textAlign: 'center',
            marginBottom: 24
          }}>
            <div style={{ fontSize: 14, color: '#FFD600', marginBottom: 4 }}>
              Actual Completions {isLargeMaxCompletions && `(${displayPercentage}%)`}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>
              {actualCompletions} / {N}
            </div>
            {(dynamicData?.isRefundTop1 || dynamicData?.isRefundTop2 || dynamicData?.isRefundTop3) && (
              <div style={{ 
                fontSize: 12, 
                color: '#18C964', 
                marginTop: 8,
                background: 'rgba(24, 201, 100, 0.1)',
                padding: '8px',
                borderRadius: '6px'
              }}>
                ✅ Under 5 completions: All participants receive full refund ({dynamicData?.unitPrice} $WINC each)
              </div>
            )}
          </div>
        </div>

        {/* Top 3 Rewards avec sliders synchronisés */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ 
            fontSize: 20, 
            fontWeight: 700, 
            color: '#FFD600', 
            marginBottom: 20,
            textAlign: 'center'
          }}>
            Top 3 Rewards
          </h3>

          {/* 1st Place - Or */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 12 
            }}>
              <span style={{ fontSize: 16, color: '#FFD700', fontWeight: 600 }}>
                1st Place 🥇
              </span>
              <span style={{ 
                fontSize: 18, 
                fontWeight: 900, 
                color: dynamicData?.isRefundTop1 ? '#18C964' : '#FFD700' 
              }}>
                {dynamicData?.isRefundTop1 ? `REFUND (${dynamicData?.unitPrice || 0} $WINC)` : `${dynamicData?.top1 || 0} $WINC`}
              </span>
            </div>
            
            <input
              type="range"
              min={isLargeMaxCompletions ? 0 : 0}
              max={isLargeMaxCompletions ? N : 100}
              value={isLargeMaxCompletions ? absoluteCompletions : completionRate}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className={dynamicData?.top1 >= 0.01 ? 'slider-gold' : ''}
              style={{
                width: '100%',
                height: 8,
                borderRadius: 4,
                background: isLargeMaxCompletions 
                  ? `linear-gradient(to right, #FFD700 0%, #FFD700 ${(absoluteCompletions / N) * 100}%, #333 ${(absoluteCompletions / N) * 100}%, #333 100%)`
                  : `linear-gradient(to right, #FFD700 0%, #FFD700 ${completionRate}%, #333 ${completionRate}%, #333 100%)`,
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
            />
          </div>

          {/* 2nd Place - Argent */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 12 
            }}>
              <span style={{ fontSize: 16, color: '#C0C0C0', fontWeight: 600 }}>
                2nd Place 🥈
              </span>
              <span style={{ 
                fontSize: 18, 
                fontWeight: 900, 
                color: dynamicData?.isRefundTop2 ? '#18C964' : '#C0C0C0' 
              }}>
                {dynamicData?.isRefundTop2 ? `REFUND (${dynamicData?.unitPrice || 0} $WINC)` : `${dynamicData?.top2 || 0} $WINC`}
              </span>
            </div>
            
            <input
              type="range"
              min={isLargeMaxCompletions ? 0 : 0}
              max={isLargeMaxCompletions ? N : 100}
              value={isLargeMaxCompletions ? absoluteCompletions : completionRate}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className={dynamicData?.top2 >= 0.01 ? 'slider-silver' : ''}
              style={{
                width: '100%',
                height: 8,
                borderRadius: 4,
                background: isLargeMaxCompletions 
                  ? `linear-gradient(to right, #C0C0C0 0%, #C0C0C0 ${(absoluteCompletions / N) * 100}%, #333 ${(absoluteCompletions / N) * 100}%, #333 100%)`
                  : `linear-gradient(to right, #C0C0C0 0%, #C0C0C0 ${completionRate}%, #333 ${completionRate}%, #333 100%)`,
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
            />
          </div>

          {/* 3rd Place - Bronze */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 12 
            }}>
              <span style={{ fontSize: 16, color: '#CD7F32', fontWeight: 600 }}>
                3rd Place 🥉
              </span>
              <span style={{ 
                fontSize: 18, 
                fontWeight: 900, 
                color: dynamicData?.isRefundTop3 ? '#18C964' : '#CD7F32' 
              }}>
                {dynamicData?.isRefundTop3 ? `REFUND (${dynamicData?.unitPrice || 0} $WINC)` : `${dynamicData?.top3 || 0} $WINC`}
              </span>
            </div>
            
            <input
              type="range"
              min={isLargeMaxCompletions ? 0 : 0}
              max={isLargeMaxCompletions ? N : 100}
              value={isLargeMaxCompletions ? absoluteCompletions : completionRate}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className={dynamicData?.top3 >= 0.01 ? 'slider-bronze' : ''}
              style={{
                width: '100%',
                height: 8,
                borderRadius: 4,
                background: isLargeMaxCompletions 
                  ? `linear-gradient(to right, #CD7F32 0%, #CD7F32 ${(absoluteCompletions / N) * 100}%, #333 ${(absoluteCompletions / N) * 100}%, #333 100%)`
                  : `linear-gradient(to right, #CD7F32 0%, #CD7F32 ${completionRate}%, #333 ${completionRate}%, #333 100%)`,
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
            />
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: 12, 
          padding: 20,
          marginBottom: 20
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 16 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                Pool Total
              </div>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 700, 
                color: '#FFD600' 
              }}>
                {dynamicData?.poolTotal || 0} $WINC
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                Creator Gain
              </div>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 700, 
                color: dynamicData?.isCreatorProfitable ? '#18C964' : '#FF2D2D'
              }}>
                {dynamicData?.creatorGain || 0} $WINC
              </div>
            </div>
          </div>
        </div>

        {/* Information sur le remboursement sous 5 complétions */}
        {(dynamicData?.isRefundTop1 || dynamicData?.isRefundTop2 || dynamicData?.isRefundTop3) && (
          <div style={{ 
            background: 'rgba(24, 201, 100, 0.1)', 
            border: '1px solid #18C964', 
            borderRadius: 8, 
            padding: 12, 
            textAlign: 'center',
            marginBottom: 16
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#18C964', marginBottom: 4 }}>
              ✅ Full Refund Protection
            </div>
            <div style={{ fontSize: 12, color: '#18C964' }}>
              Campaign has less than 5 completions. All participants receive a full refund of {dynamicData?.unitPrice} $WINC each.
            </div>
          </div>
        )}

        {/* Info sur le comportement économique sous 5 complétions */}
        {!dynamicData?.isMinimumCompletionsReached && (
          <div style={{ 
            background: 'rgba(24, 201, 100, 0.1)', 
            border: '1px solid #18C964', 
            borderRadius: 8, 
            padding: 12, 
            textAlign: 'center',
            marginBottom: 16
          }}>
            <div style={{ fontSize: 12, color: '#18C964', marginBottom: 4 }}>
              🛡️ Economic Protection
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
              Creator loses MINT, participants get full refund
            </div>
            <div style={{ fontSize: 11, color: '#18C964', marginTop: 4, fontStyle: 'italic' }}>
              Campaign needs minimum 5 completions to activate rewards
            </div>
          </div>
        )}

        {/* Info sur la durée de campagne dynamique */}
        <div style={{ 
          background: 'rgba(255, 214, 0, 0.1)', 
          border: '1px solid #FFD600', 
          borderRadius: 8, 
          padding: 12, 
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 12, color: '#FFD600', marginBottom: 4 }}>
            💡 Campaign Duration
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
            {dynamicData?.campaignDuration || 7} days to complete the challenge
          </div>
          <div style={{ fontSize: 11, color: '#FFD600', marginTop: 4, fontStyle: 'italic' }}>
            Duration calculated based on campaign complexity
          </div>
        </div>
      </div>
    </div>
  );
});

const PoolDistributionChart: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  data: EconomicData;
}> = React.memo(({ isVisible, onClose, data }) => {
  const [completionRate, setCompletionRate] = useState(100);
  
  if (!isVisible || !data) return null;

  // Calculer les données selon le taux de completion
  const calculateDataForCompletionRate = (rate: number) => {
    // Validation et conversion des données d'entrée
    const wincValueStr = data.wincValue || '0';
    const maxCompletionsStr = data.maxCompletions || '0';
    
    // Convertir en nombres avec validation
    const P = parseFloat(wincValueStr.toString().replace(',', '.'));
    const N = parseInt(maxCompletionsStr.toString());
    
    // Vérifier que les valeurs sont valides
    if (isNaN(P) || isNaN(N) || P < 1 || N < 5) {
      // Retourner des données par défaut si invalides
      return {
        poolTotal: 0,
        top1: 0,
        top2: 0,
        top3: 0,
        creatorGain: 0,
        platform: 0,
        moderators: 0,
        isMinimumCompletionsReached: false,
        isRefundTop1: false,
        isRefundTop2: false,
        isRefundTop3: false,
        unitPrice: 0,
        refundTotal: 0,
        currentCompletions: 0
      };
    }
    
    const CR = Math.floor((rate / 100) * N);
    
    // Utiliser la fonction simulateCampaign avec le taux de completion réel (0 à N)
    const campaignData = simulateCampaign(P, N, CR);
    
    // PROTECTION : S'assurer que Platform et Moderators ne soient jamais à 0
    if (campaignData.platform <= 0 || campaignData.moderators <= 0) {
      console.warn("⚠️ Platform ou Moderators = 0 détecté, correction automatique appliquée");
      
      // Calculer un minimum basé sur le MINT (ajusté pour la réduction de 25% de la plateforme)
      const minPlatform = Math.max(0.075, campaignData.mint * 0.0375); // 3.75% du MINT minimum (réduit de 25%)
      const minModerators = Math.max(0.2, campaignData.mint * 0.10); // 10% du MINT minimum (inchangé)
      
      campaignData.platform = Math.max(campaignData.platform, minPlatform);
      campaignData.moderators = Math.max(campaignData.moderators, minModerators);
      
      // Recalculer le total si nécessaire
      const totalDistributed = campaignData.top1 + campaignData.top2 + campaignData.top3 + 
                              campaignData.creatorGain + campaignData.platform + campaignData.moderators;
      
      if (Math.abs(totalDistributed - campaignData.poolTotal) > 0.01) {
        // Normaliser pour maintenir l'équilibre
        const adjustmentFactor = campaignData.poolTotal / totalDistributed;
        campaignData.top1 = Math.round(campaignData.top1 * adjustmentFactor * 100) / 100;
        campaignData.top2 = Math.round(campaignData.top2 * adjustmentFactor * 100) / 100;
        campaignData.top3 = Math.round(campaignData.top3 * adjustmentFactor * 100) / 100;
        campaignData.creatorGain = Math.round(campaignData.creatorGain * adjustmentFactor * 100) / 100;
        campaignData.platform = Math.round(campaignData.platform * adjustmentFactor * 100) / 100;
        campaignData.moderators = Math.round(campaignData.moderators * adjustmentFactor * 100) / 100;
      }
    }
    
    return campaignData;
  };

  // Obtenir les données dynamiques
  const dynamicData = calculateDataForCompletionRate(completionRate);
  const total = dynamicData.poolTotal || 0;

  // Vérifier que le total est valide avant de calculer les pourcentages
  if (total <= 0) {
    return (
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '20px',
          cursor: 'pointer'
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#000',
            border: '3px solid #FF2D2D',
            borderRadius: 28,
            padding: '24px',
            maxWidth: 600,
            width: '100%',
            position: 'relative',
            boxShadow: '0 25px 50px rgba(255, 45, 45, 0.3)',
            cursor: 'default',
            overflow: 'hidden',
            textAlign: 'center'
          }}
        >
          <CloseIcon onClick={onClose} />
          <h2 style={{ color: '#FF2D2D', fontSize: 24, fontWeight: 900, marginBottom: 16 }}>
            ⚠️ Invalid Data
          </h2>
          <p style={{ color: '#fff', fontSize: 16, marginBottom: 20 }}>
            Please enter valid values for Unit Value (≥1 $WINC) and Max Completions (≥5) to view the distribution chart.
          </p>
          <button
            onClick={onClose}
            style={{
              background: '#FF2D2D',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Calculer les pourcentages pour le diagramme avec validation
  const top1Percentage = total > 0 ? ((dynamicData.top1 / total) * 100).toFixed(1) : '0.0';
  const top2Percentage = total > 0 ? ((dynamicData.top2 / total) * 100).toFixed(1) : '0.0';
  const top3Percentage = total > 0 ? ((dynamicData.top3 / total) * 100).toFixed(1) : '0.0';
  const creatorPercentage = total > 0 ? ((dynamicData.creatorGain / total) * 100).toFixed(1) : '0.0';
  const platformPercentage = total > 0 ? ((dynamicData.platform / total) * 100).toFixed(1) : '0.0';
  const moderatorsPercentage = total > 0 ? ((dynamicData.moderators / total) * 100).toFixed(1) : '0.0';
  const refundPercentage = total > 0 ? (((dynamicData.refundTotal || 0) / total) * 100).toFixed(1) : '0.0';

  // Couleurs du diagramme (utilisant les mêmes que l'interface existante)
  const colors = {
    top1: '#FFD700',      // Or pour 1ère place
    top2: '#C0C0C0',      // Argent pour 2ème place
    top3: '#CD7F32',      // Bronze pour 3ème place
    refund: '#FF2D2D',    // Rouge pour les remboursements
    creator: '#18C964',   // Vert pour le créateur
    platform: '#FFFFFF',  // Blanc pour la plateforme (différencié de la 1ère place)
    moderators: '#4A90E2' // Bleu pour les modérateurs
  };

  // Déterminer si on est en mode remboursement (< 5 complétions)
  const isRefundMode = !dynamicData.isMinimumCompletionsReached;
  const hasCompletions = (dynamicData.currentCompletions || 0) > 0;
  
  // Données pour le diagramme - Affichage conditionnel selon le mode
  let chartData;
  
  if (isRefundMode) {
    // Mode remboursement
    chartData = [];
    if (hasCompletions) {
      chartData.push({ 
        label: 'Refund for Completers', 
        value: dynamicData.refundTotal || 0, 
        percentage: refundPercentage, 
        color: colors.refund, 
        icon: '💰',
        isRefund: true,
        refundAmount: dynamicData.unitPrice || 0
      });
    }
    chartData.push(
      { label: 'Creator', value: dynamicData.creatorGain || 0, percentage: creatorPercentage, color: colors.creator, icon: '👑' },
      { label: 'Platform', value: dynamicData.platform || 0, percentage: platformPercentage, color: colors.platform, icon: '🏢' },
      { label: 'Moderators', value: dynamicData.moderators || 0, percentage: moderatorsPercentage, color: colors.moderators, icon: '🛡️' }
    );
  } else {
    // Mode normal : afficher les 3 premières places + autres
    chartData = [
      { label: '1st Place', value: dynamicData.top1 || 0, percentage: top1Percentage, color: colors.top1, icon: '🥇' },
      { label: '2nd Place', value: dynamicData.top2 || 0, percentage: top2Percentage, color: colors.top2, icon: '🥈' },
      { label: '3rd Place', value: dynamicData.top3 || 0, percentage: top3Percentage, color: colors.top3, icon: '🥉' },
      { label: 'Creator', value: dynamicData.creatorGain || 0, percentage: creatorPercentage, color: colors.creator, icon: '👑' },
      { label: 'Platform', value: dynamicData.platform || 0, percentage: platformPercentage, color: colors.platform, icon: '🏢' },
      { label: 'Moderators', value: dynamicData.moderators || 0, percentage: moderatorsPercentage, color: colors.moderators, icon: '🛡️' }
    ];
  }

  return (
    <>
      {/* Styles CSS personnalisés pour la slide bar */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #18C964;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 10px rgba(24, 201, 100, 0.5);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #18C964;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 10px rgba(24, 201, 100, 0.5);
        }
      `}</style>
      
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '20px',
          cursor: 'pointer'
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#000',
            border: '3px solid #18C964',
            borderRadius: 28,
            padding: '24px',
            maxWidth: 600,
            width: '100%',
            position: 'relative',
            boxShadow: '0 25px 50px rgba(24, 201, 100, 0.3)',
            cursor: 'default',
            overflow: 'hidden'
          }}
        >
          <CloseIcon onClick={onClose} />
          
          {/* Header avec titre et total */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ 
              fontSize: 28, 
              fontWeight: 900, 
              color: '#18C964', 
              margin: '0 0 10px 0',
              textShadow: '0 0 20px rgba(24, 201, 100, 0.5)'
            }}>
              🎯 Pool Distribution Chart
            </h2>
            <div style={{ 
              fontSize: 16, 
              color: '#888', 
              marginBottom: 20 
            }}>
              Visual breakdown of your $WINC reward pool
            </div>
            
            {/* Avertissement spécial pour le mode remboursement */}
            {isRefundMode && hasCompletions && (
              <div style={{
                background: 'rgba(255, 45, 45, 0.1)',
                border: '2px solid #FF2D2D',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 16,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#FF2D2D', marginBottom: 4 }}>
                  ⚠️ Under 5 Completions - Refund Mode
                </div>
                <div style={{ fontSize: 12, color: '#FF2D2D' }}>
                  All completers receive refund ({dynamicData.unitPrice} $WINC each)
                </div>
              </div>
            )}
            {isRefundMode && !hasCompletions && (
              <div style={{
                background: 'rgba(255, 214, 0, 0.1)',
                border: '2px solid #FFD600',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 16,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#FFD600' }}>
                  Waiting for first completions
                </div>
                <div style={{ fontSize: 12, color: '#FFD600' }}>
                  No refund is due until at least 1 completion
                </div>
              </div>
            )}
            
            {/* Total du pool en évidence */}
            <div style={{
              background: 'linear-gradient(135deg, #18C964, #00B894)',
              borderRadius: 18,
              padding: '20px 28px',
              display: 'inline-block',
              boxShadow: '0 0 30px rgba(24, 201, 100, 0.4)'
            }}>
              <div style={{ fontSize: 14, color: '#000', fontWeight: 600, marginBottom: 6 }}>
                Total Pool Value
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#000' }}>
                {dynamicData.poolTotal} $WINC
              </div>
            </div>
          </div>

          {/* Contenu principal avec diagramme et légende */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr auto', 
            gap: 32,
            alignItems: 'center'
          }}>
            
            {/* Diagramme circulaire */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: 320,
                height: 320,
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Cercle de fond avec effet de lueur */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, #18C964 0deg, #18C964 360deg)',
                  filter: 'blur(20px)',
                  opacity: 0.3,
                  zIndex: 1
                }} />

                {/* Diagramme circulaire principal - Logique conditionnelle */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: isRefundMode 
                    ? `conic-gradient(
                        from 0deg,
                        ${hasCompletions ? colors.refund : colors.creator} 0deg,
                        ${hasCompletions ? colors.refund : colors.creator} ${ (parseFloat(hasCompletions ? refundPercentage : '0.0') / 100) * 360 }deg,
                        ${colors.creator} ${ (parseFloat(hasCompletions ? refundPercentage : '0.0') / 100) * 360 }deg,
                        ${colors.creator} ${ ((parseFloat(hasCompletions ? refundPercentage : '0.0') + parseFloat(creatorPercentage)) / 100) * 360 }deg,
                        ${colors.platform} ${ ((parseFloat(hasCompletions ? refundPercentage : '0.0') + parseFloat(creatorPercentage)) / 100) * 360 }deg,
                        ${colors.platform} ${ ((parseFloat(hasCompletions ? refundPercentage : '0.0') + parseFloat(creatorPercentage) + parseFloat(platformPercentage)) / 100) * 360 }deg,
                        ${colors.moderators} ${ ((parseFloat(hasCompletions ? refundPercentage : '0.0') + parseFloat(creatorPercentage) + parseFloat(platformPercentage)) / 100) * 360 }deg,
                        ${colors.moderators} 360deg
                      )`
                    : `conic-gradient(
                        from 0deg,
                        ${colors.top1} 0deg,
                        ${colors.top1} ${(parseFloat(top1Percentage) / 100) * 360}deg,
                        ${colors.top2} ${(parseFloat(top1Percentage) / 100) * 360}deg,
                        ${colors.top2} ${((parseFloat(top1Percentage) + parseFloat(top2Percentage)) / 100) * 360}deg,
                        ${colors.top3} ${((parseFloat(top1Percentage) + parseFloat(top2Percentage)) / 100) * 360}deg,
                        ${colors.top3} ${((parseFloat(top1Percentage) + parseFloat(top2Percentage) + parseFloat(top3Percentage)) / 100) * 360}deg,
                        ${colors.creator} ${((parseFloat(top1Percentage) + parseFloat(top2Percentage) + parseFloat(top3Percentage)) / 100) * 360}deg,
                        ${colors.creator} ${((parseFloat(top1Percentage) + parseFloat(top2Percentage) + parseFloat(top3Percentage) + parseFloat(creatorPercentage)) / 100) * 360}deg,
                        ${colors.platform} ${((parseFloat(top1Percentage) + parseFloat(top2Percentage) + parseFloat(top3Percentage) + parseFloat(creatorPercentage)) / 100) * 360}deg,
                        ${colors.platform} ${((parseFloat(top1Percentage) + parseFloat(top2Percentage) + parseFloat(top3Percentage) + parseFloat(creatorPercentage) + parseFloat(platformPercentage)) / 100) * 360}deg,
                        ${colors.moderators} ${((parseFloat(top1Percentage) + parseFloat(top2Percentage) + parseFloat(top3Percentage) + parseFloat(creatorPercentage) + parseFloat(platformPercentage)) / 100) * 360}deg,
                        ${colors.moderators} 360deg
                      )`,
                  zIndex: 2,
                  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)'
                }} />
                
                {/* Cercle central avec effet 3D */}
                <div style={{
                  position: 'absolute',
                  width: '60%',
                  height: '60%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 30% 30%, #333, #000)',
                  border: '3px solid #000',
                  zIndex: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, color: '#18C964', fontWeight: 600 }}>
                      Total
                    </div>
                    <div style={{ fontSize: 20, color: '#fff', fontWeight: 900 }}>
                      {dynamicData.poolTotal}
                    </div>
                    <div style={{ fontSize: 12, color: '#18C964' }}>
                      $WINC
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Légende simplifiée et compacte */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 6,
              minWidth: 200
            }}>
              {chartData.map((item, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 8px',
                    borderRadius: 8,
                    background: item.isRefund 
                      ? 'rgba(255, 45, 45, 0.1)' 
                      : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${item.color}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Icône */}
                  <div style={{ 
                    fontSize: 14, 
                    marginRight: 8,
                    filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))'
                  }}>
                    {item.icon}
                  </div>
                  
                  {/* Informations compactes */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: 11, 
                      fontWeight: 600, 
                      color: item.color,
                      marginBottom: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.label}
                    </div>
                    <div style={{ 
                      fontSize: 10, 
                      color: '#fff',
                      marginBottom: 1
                    }}>
                      {item.isRefund 
                        ? `${item.value} $WINC total` 
                        : `${item.value} $WINC`
                      }
                    </div>
                    <div style={{ 
                      fontSize: 9, 
                      color: '#666',
                      fontWeight: 500
                    }}>
                      {item.percentage}%
                    </div>
                  </div>
                  
                  {/* Indicateur de couleur compact */}
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: item.color,
                    border: '1px solid #333',
                    flexShrink: 0
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Section de contrôle du taux de completion */}
          <div style={{ 
            marginTop: 20, 
            padding: '16px 20px', 
            background: 'rgba(24, 201, 100, 0.08)', 
            borderRadius: 16,
            border: '1px solid rgba(24, 201, 100, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 13, color: '#18C964', fontWeight: 600, marginBottom: 10 }}>
              🎯 Completion Rate Control
            </div>
            
            {/* Slide bar simplifiée */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 6,
                fontSize: 11
              }}>
                <span style={{ color: '#666' }}>0</span>
                <span style={{ color: '#18C964', fontWeight: 600 }}>
                  {Math.floor((Number(completionRate) / 100) * (parseInt(data.maxCompletions?.toString() || '5')))} / {parseInt(data.maxCompletions?.toString() || '5')}
                </span>
                <span style={{ color: '#666' }}>{parseInt(data.maxCompletions?.toString() || '5')}</span>
              </div>
              
              <input
                type="range"
                min="0"
                max={parseInt(data.maxCompletions?.toString() || '5')}
                value={Math.floor((completionRate / 100) * (parseInt(data.maxCompletions?.toString() || '5')))}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  const rate = Math.round((value / (parseInt(data.maxCompletions?.toString() || '5'))) * 100);
                  setCompletionRate(rate);
                }}
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #18C964, #00B894)',
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
            </div>
            
            <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4 }}>
              Adjust completion rate to see real-time distribution changes
            </div>
          </div>
        </div>
      </div>
    </>
  );
});