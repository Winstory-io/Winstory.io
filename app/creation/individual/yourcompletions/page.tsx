"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import CompletionRateModal from '@/components/CompletionRateModal';

// Constantes du modèle économique WINC (MINT réduit de ~15% pour rentabilité créateur)
const ECONOMIC_CONSTANTS = {
  BASE_FEE: 1.53,        // Réduit de 1.8 à 1.53 (baisse de 15%)
  SCALING_FACTOR: 0.115, // Réduit de 0.135 à 0.115 (baisse de ~15%)
  RISK_ADJUSTMENT: 0.069, // Réduit de 0.081 à 0.069 (baisse de ~15%)
  POOL_TOP3_PERCENTAGE: 0.617, // Maintenu
  POOL_CREATOR_PERCENTAGE: 0.23, // Maintenu
  POOL_PLATFORM_PERCENTAGE: 0.10, // Maintenu
  POOL_MODERATORS_PERCENTAGE: 0.32, // Maintenu

  POOL_MINT_PERCENTAGE: 0.25
};

// Fonction de simulation du modèle économique WINC - VERSION CORRIGÉE
function simulateCampaign(P: number, N: number, CR: number = N) {
  // Calcul dynamique de la durée de campagne basé sur P×N
  // Plus P×N est élevé, plus la campagne est longue (plus complexe)
  const baseDuration = 7; // Durée de base
  const complexityFactor = Math.log10(Math.max(1, P * N / 100)); // Facteur de complexité
  const CAMPAIGN_DURATION_DAYS = Math.min(30, Math.max(7, Math.round(baseDuration + complexityFactor * 7)));
  
  // Discount basé sur la durée : plus court = moins cher
  const DURATION_DISCOUNT = CAMPAIGN_DURATION_DAYS <= 7 ? 0.88 : 
                           CAMPAIGN_DURATION_DAYS <= 14 ? 0.94 : 
                           CAMPAIGN_DURATION_DAYS <= 21 ? 0.97 : 1.0;

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

  // CORRECTION : Logique améliorée pour éviter les baisses contre-intuitives des gains modérateurs
  // Boost des Top3 quand la complétion est faible, mais avec protection des modérateurs
  const boostForWinners = Math.min(0.15, 0.10 * (1 - tauxCompletion)); // Réduit de 15% à 10% max
  let top3Share = BASE_TOP3 + boostForWinners;

  // CORRECTION : Protection des modérateurs - gains toujours croissants
  // Au lieu de réduire drastiquement, on ajuste plus progressivement
  let platformShare = Math.max(0.05, BASE_PLATFORM - 0.01 * (1 - tauxCompletion)); // Réduction plus douce
  let moderatorsShare = Math.max(0.15, BASE_MODERATORS - 0.02 * (1 - tauxCompletion)); // Réduction plus douce

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

  // Winners floors (only when minimum completions reached)
  if (isMinimumCompletionsReached) {
    // Minimum floors to ensure winners are profitable
    const floor1 = 2.5 * P; // 150% profit
    const floor2 = 2.0 * P; // 100% profit
    const floor3 = 1.5 * P; // 50% profit

    const need1 = Math.max(0, floor1 - top1);
    const need2 = Math.max(0, floor2 - top2);
    const need3 = Math.max(0, floor3 - top3);
    const totalNeeds = need1 + need2 + need3;

    if (totalNeeds > 0) {
      // Priority: 1) Creator surplus above cap, 2) Platform, 3) Moderators (capped)
      const creatorSurplus = Math.max(0, creatorGainWithMultiplier - creatorGain);
      let remainingNeeds = totalNeeds;
      let recovered = 0;

      if (creatorSurplus > 0) {
        const takeFromCreatorSurplus = Math.min(creatorSurplus, remainingNeeds);
        recovered += takeFromCreatorSurplus;
        remainingNeeds -= takeFromCreatorSurplus;
      }

      if (remainingNeeds > 0 && platform > 0) {
        const takeFromPlatform = Math.min(platform * 0.5, remainingNeeds); // up to 50% of platform
        platform = Math.max(0, Math.round((platform - takeFromPlatform) * 100) / 100);
        recovered += takeFromPlatform;
        remainingNeeds -= takeFromPlatform;
      }

      if (remainingNeeds > 0 && moderators > 0) {
        const maxTakeFromModerators = moderators * 0.3; // up to 30% of moderators
        const takeFromModerators = Math.min(maxTakeFromModerators, remainingNeeds);
        moderators = Math.max(0, Math.round((moderators - takeFromModerators) * 100) / 100);
        recovered += takeFromModerators;
        remainingNeeds -= takeFromModerators;
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
    // CORRECTION : Mode normal (CR >= 5) - Transition fluide pour les modérateurs
    // Calculer d'abord les gains de base selon les parts normales
    const baseModerators = Math.round(totalValue * moderatorsShare * 100) / 100;
    
    // Créer une transition fluide depuis le mode remboursement
    // À CR=5, les modérateurs doivent avoir au moins le gain qu'ils auraient eu à CR=4 + une croissance minimale
    const transitionFactor = Math.min(1, Math.max(0, (CR - 5) / 5)); // 0 à CR=5, 1 à CR=10+
    
    // Gain minimum garanti basé sur le mode remboursement (extrapolé) + croissance minimale
    const refundModeModerators = mint * Math.min(0.6, Math.max(0.35, 0.35 + 0.20 * 0.8)); // CR=4 equivalent
    
    // GARANTIR la croissance : au minimum le gain CR=4 + 1% de croissance
    const guaranteedMinGain = refundModeModerators * 1.01; // +1% minimum
    const minModeratorsGain = Math.max(baseModerators, guaranteedMinGain);
    
    // Transition progressive : de minModeratorsGain vers baseModerators
    moderators = Math.round((minModeratorsGain + (baseModerators - minModeratorsGain) * transitionFactor) * 100) / 100;
    
    // Ajuster la plateforme pour maintenir l'équilibre
    const totalDistributed = creatorGain + top1 + top2 + top3 + moderators;
    const remainingForPlatform = Math.max(0, totalValue - totalDistributed);
    platform = Math.round(remainingForPlatform * 100) / 100;
  }

  // CORRECTION : Remboursement des completeurs si CR < 5
  let top1Final = top1;
  let top2Final = top2;
  let top3Final = top3;
  let isRefundTop1 = false;
  let isRefundTop2 = false;
  let isRefundTop3 = false;
  let refundTotal = 0; // Nouveau: total des remboursements (linéaire)

  if (!isMinimumCompletionsReached) {
    // Sous 5 completions :
    // - Pas de "winners" (top1/2/3 = 0)
    // - Remboursement linéaire des completers existants (P × CR)
    // - Le créateur perd sa mise (MINT)
    // - Le MINT est réparti entre Plateforme et Modérateurs avec un incentive croissant pour les modérateurs
    top1Final = 0;
    top2Final = 0;
    top3Final = 0;

    // Remboursement linéaire uniquement s'il y a au moins 1 completion
    refundTotal = P * CR;
    const hasAnyCompletion = CR > 0;
    isRefundTop1 = hasAnyCompletion;
    isRefundTop2 = hasAnyCompletion;
    isRefundTop3 = hasAnyCompletion;

    // Le créateur perd sa mise, les completers sont remboursés
    creatorGain = 0;
    creatorNetGain = -mint;

    // CORRECTION : Incentive modérateurs avec transition fluide vers le mode normal
    // Part croissante avec CR (0 -> ~35%, 4 -> ~55%) sur le MINT
    // Mais on prépare la transition pour éviter la discontinuité à CR=5
    const linearFactor = Math.min(1, Math.max(0, CR / 5)); // 0.. <1 sous 5
    const moderatorsRate = Math.min(0.6, Math.max(0.35, 0.35 + 0.20 * linearFactor));
    const platformRate = 1 - moderatorsRate; // reste pour plateforme

    platform = Math.round(mint * platformRate * 100) / 100;
    moderators = Math.round(mint * moderatorsRate * 100) / 100;
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
    top1: Math.round(top1Final * 100) / 100,
    top2: Math.round(top2Final * 100) / 100,
    top3: Math.round(top3Final * 100) / 100,
    platform: Math.round(platform * 100) / 100,
    moderators: Math.round(moderators * 100) / 100,
    platformTotal: Math.round((totalValue * platformShare) * 100) / 100, // info brute
      tauxCompletion: Math.round(tauxCompletion * 100) / 100,
      multiplicateurGain,
    multiplicateurXP,
    // Nouvelles propriétés pour le remboursement
    isRefundTop1,
    isRefundTop2,
    isRefundTop3,
    refundTotal: Math.round(refundTotal * 100) / 100,
    unitPrice: P, // Prix unitaire pour les avertissements
    currentCompletions: CR,
    campaignDuration: CAMPAIGN_DURATION_DAYS // Durée calculée dynamiquement
  };

  // Vérification finale: s'assurer que le total distribué ≈ totalValue (tolérance 0.01)
  const winnersOrRefund = isMinimumCompletionsReached 
    ? (result.top1 + result.top2 + result.top3) 
    : result.refundTotal;
  const distributed = result.creatorGain + winnersOrRefund + result.platform + result.moderators;
  if (Math.abs(distributed - result.poolTotal) > 0.01 && result.poolTotal > 0) {
    const adj = result.poolTotal / distributed;
    if (isMinimumCompletionsReached) {
      result.top1 = Math.round(result.top1 * adj * 100) / 100;
      result.top2 = Math.round(result.top2 * adj * 100) / 100;
      result.top3 = Math.round(result.top3 * adj * 100) / 100;
    } else {
      result.refundTotal = Math.round(result.refundTotal * adj * 100) / 100;
    }
    result.platform = Math.round(result.platform * adj * 100) / 100;
    result.moderators = Math.round(result.moderators * adj * 100) / 100;
    // creatorGain reste inchangé car cap et surplus déjà pris en compte
  }

  return result;
}

const GreenArrowButton = ({ onClick, disabled }: { onClick: () => void, disabled: boolean }) => (
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
);

const CloseIcon = ({ onClick }: { onClick: () => void }) => (
  <svg onClick={onClick} width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', position: 'absolute', top: 24, right: 24, zIndex: 100 }}>
    <line x1="10" y1="10" x2="22" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
    <line x1="22" y1="10" x2="10" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Composant pour le diagramme circulaire de répartition du pool
const PoolDistributionChart = ({ data, isVisible, onClose }: { data: any, isVisible: boolean, onClose: () => void }) => {
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
      
      // Calculer un minimum basé sur le MINT
      const minPlatform = Math.max(0.1, campaignData.mint * 0.05); // 5% du MINT minimum
      const minModerators = Math.max(0.2, campaignData.mint * 0.10); // 10% du MINT minimum
      
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
                  {Math.floor((completionRate / 100) * (data.maxCompletions || 5))} / {data.maxCompletions || 5}
                </span>
                <span style={{ color: '#666' }}>{data.maxCompletions || 5}</span>
              </div>
              
              <input
                type="range"
                min="0"
                max={data.maxCompletions || 5}
                value={Math.floor((completionRate / 100) * (data.maxCompletions || 5))}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  const rate = Math.round((value / (data.maxCompletions || 5)) * 100);
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
};

// Composant pour afficher les détails économiques en temps réel
const EconomicDetails = ({ data, isVisible, isInline = false, onCreatorGainClick, onTop3Click, onPoolClick }: { data: any, isVisible: boolean, isInline?: boolean, onCreatorGainClick?: () => void, onTop3Click?: () => void, onPoolClick?: () => void }) => {
  if (!isVisible || !data) return null;

  const containerStyle: React.CSSProperties = isInline ? {
    background: '#000',
    border: '2px solid #18C964',
    borderRadius: 24,
    padding: '24px 24px 32px 24px',
    width: 400,
    maxWidth: 400,
    boxShadow: '0 0 24px #000',
    color: '#fff',
    opacity: 1,
    transition: 'opacity 0.3s ease'
  } : {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#000',
    border: '3px solid #FFD600',
    borderRadius: 24,
    padding: '32px 24px',
    width: '90vw',
    maxWidth: 600,
    zIndex: 2000,
    boxShadow: '0 0 32px rgba(255, 214, 0, 0.3)',
    color: '#fff',
    opacity: 1,
    transition: 'opacity 0.3s ease'
  };

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h2 style={{ color: '#18C964', fontSize: 24, fontWeight: 900, marginBottom: 6 }}>
          $WINC Economic Details
        </h2>
        {!data.isCreatorProfitable && (
          <div style={{ 
            fontSize: 12, 
            color: '#FF2D2D', 
            background: 'rgba(255, 45, 45, 0.1)', 
            padding: '6px 10px', 
            borderRadius: '4px',
            marginTop: '6px',
            fontWeight: 600
          }}>
            ⚠️ Unprofitable Campaign - Values Disabled
          </div>
        )}
        {data.isThirdPlaceDeficit && (
          <div style={{ 
            fontSize: 12, 
            color: '#FF2D2D', 
            background: 'rgba(255, 45, 45, 0.1)', 
            padding: '6px 10px', 
            borderRadius: '4px',
            marginTop: '6px',
            fontWeight: 600
          }}>
            ⚠️ Winners Would Lose Money - Rewards Disabled
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        {/* Pool Total - Maintenant cliquable */}
        <div 
          onClick={onPoolClick || (() => {})}
          style={{
            background: '#000',
            border: '2px solid #18C964',
            borderRadius: 10,
            padding: 8,
            textAlign: 'center',
            opacity: 1,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(24, 201, 100, 0.4)';
            e.currentTarget.style.borderColor = '#00B894';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = '#18C964';
          }}
        >
          {/* Effet de brillance */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(24, 201, 100, 0.2), transparent)',
            transition: 'left 0.5s ease',
            pointerEvents: 'none'
          }} />
          
          <div style={{ fontSize: 12, fontWeight: 600, color: '#18C964', marginBottom: 2 }}>
            Total Reward $WINC Pool
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#18C964' }}>
            {data.poolTotal} $WINC
          </div>
          <div style={{ fontSize: 10, color: '#18C964', opacity: 0.7, marginTop: 4 }}>
            Click to view distribution chart
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        {/* Top 3 Rewards - Disposition verticale hiérarchique */}
        <div 
          onClick={onTop3Click || (() => {})}
          style={{
            background: 'transparent',
            border: `2px solid ${data.isThirdPlaceDeficit ? '#FF2D2D' : '#FFD700'}`,
            borderRadius: 8,
            padding: 8,
            textAlign: 'center',
            opacity: 1,
            transition: 'opacity 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Effet de brillance */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)',
            transition: 'left 0.5s ease',
            pointerEvents: 'none'
          }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#FFD700', marginBottom: 4 }}>
            1st Place 🥇
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#FFD700' }}>
            {data.top1} $WINC
          </div>
          <div style={{ fontSize: 10, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#FFD700', opacity: 0.7, marginTop: 4 }}>
            Click to simulate
          </div>
        </div>

        <div 
          onClick={onTop3Click || (() => {})}
          style={{
            background: 'transparent',
            border: `2px solid ${data.isThirdPlaceDeficit ? '#FF2D2D' : '#C0C0C0'}`,
            borderRadius: 8,
            padding: 8,
            textAlign: 'center',
            opacity: 1,
            transition: 'opacity 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(192, 192, 192, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Effet de brillance */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(192,192,192,0.2), transparent)',
            transition: 'left 0.5s ease',
            pointerEvents: 'none'
          }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#C0C0C0', marginBottom: 4 }}>
            2nd Place 🥈
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#C0C0C0' }}>
            {data.top2} $WINC
          </div>
          <div style={{ fontSize: 10, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#C0C0C0', opacity: 0.7, marginTop: 4 }}>
            Click to simulate
          </div>
        </div>

        <div 
          onClick={onTop3Click || (() => {})}
          style={{
            background: 'transparent',
            border: `2px solid ${data.isThirdPlaceDeficit ? '#FF2D2D' : '#CD7F32'}`,
            borderRadius: 8,
            padding: 8,
            textAlign: 'center',
            opacity: 1,
            transition: 'opacity 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(205, 127, 50, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Effet de brillance */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(205,127,50,0.2), transparent)',
            transition: 'left 0.5s ease',
            pointerEvents: 'none'
          }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#CD7F32', marginBottom: 4 }}>
            3rd Place 🥉
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#CD7F32' }}>
            {data.top3} $WINC
          </div>
          <div style={{ fontSize: 10, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#CD7F32', opacity: 0.7, marginTop: 4 }}>
            Click to simulate
          </div>
        </div>

        {/* Platform et Moderators séparés */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFD600, #FFA500)',
            border: '2px solid #FFD600',
            borderRadius: 8,
            padding: 8,
            textAlign: 'center',
            opacity: 1,
            transition: 'opacity 0.3s ease'
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#000', marginBottom: 4 }}>
              Platform Winstory
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#000' }}>
              {data.platform} $WINC
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #4A90E2, #357ABD)',
            border: '2px solid #4A90E2',
            borderRadius: 8,
            padding: 8,
            textAlign: 'center',
            opacity: 1,
            transition: 'opacity 0.3s ease'
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
              Moderators
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>
              {data.moderators} $WINC
            </div>
          </div>
        </div>
      </div>

      {/* Gain Créateur amélioré - Cliquable */}
      <div 
        onClick={onCreatorGainClick || (() => {})}
        style={{
          background: data.isCreatorProfitable 
            ? 'linear-gradient(135deg, #18C964, #00B894)' 
            : 'linear-gradient(135deg, #FFD600, #FFA500)',
          borderRadius: 12,
          padding: 16,
          textAlign: 'center',
          boxShadow: data.isCreatorProfitable 
            ? '0 0 20px rgba(24, 201, 100, 0.3)' 
            : '0 0 20px rgba(255, 214, 0, 0.5)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: 'scale(1)',
          position: 'relative',
          overflow: 'hidden',
          opacity: 1
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = data.isCreatorProfitable 
            ? '0 0 30px rgba(24, 201, 100, 0.5)' 
            : '0 0 30px rgba(255, 214, 0, 0.7)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = data.isCreatorProfitable 
            ? '0 0 20px rgba(24, 201, 100, 0.3)' 
            : '0 0 20px rgba(255, 214, 0, 0.5)';
        }}
      >
        {/* Effet de brillance */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          transition: 'left 0.5s ease',
          pointerEvents: 'none'
        }} />
        
        <div style={{ fontSize: 14, fontWeight: 600, color: '#000', marginBottom: 4 }}>
          Your Creator Gain
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#000', marginBottom: 4 }}>
          {data.creatorGain} $WINC
        </div>
        <div style={{ fontSize: 11, color: '#000', opacity: 0.8 }}>
          Click to simulate different completion rates
        </div>
        {!data.isCreatorProfitable && (
          <div style={{ 
            fontSize: 11, 
            color: '#000', 
            background: 'rgba(255, 45, 45, 0.2)', 
            padding: '8px', 
            borderRadius: '6px',
            marginTop: '8px',
            fontWeight: 600
          }}>
            ⚠️ WARNING: You would lose money! Increase values.
          </div>
        )}
      </div>
    </div>
  );
};

// Composant pop-up pour le Creator Gain avec slider
const CreatorGainModal = ({ 
  isVisible, 
  onClose, 
  completionRate, 
  onCompletionRateChange, 
  economicData 
}: { 
  isVisible: boolean, 
  onClose: () => void, 
  completionRate: number, 
  onCompletionRateChange: (rate: number) => void, 
  economicData: any 
}) => {
  if (!isVisible || !economicData) return null;

  // Calculer les données avec le taux de completion actuel
  const normalizedWincValue = economicData.wincValue?.replace(',', '.') || '0';
  const P = parseFloat(normalizedWincValue);
  const N = parseInt(economicData.maxCompletions || '0');
  const CR = Math.round((completionRate / 100) * N);
  
  const dynamicData = simulateCampaign(P, N, CR);
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
        padding: '20px',
        cursor: 'pointer'
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
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          cursor: 'default'
        }}
      >
        <CloseIcon onClick={onClose} />
        
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ 
            fontSize: 24, 
            fontWeight: 900, 
            color: '#18C964', 
            margin: '0 0 8px 0' 
          }}>
            Your Creator Gain Simulator
          </h2>
          <p style={{ 
            fontSize: 14, 
            color: '#888', 
            margin: 0 
          }}>
            Adjust completion rate to see your potential gains
          </p>
        </div>

        {/* Slider Section */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 16 
          }}>
            <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>
              Completion Rate
            </span>
            <span style={{ 
              fontSize: 18, 
              fontWeight: 900, 
              color: '#18C964' 
            }}>
              {completionRate}%
            </span>
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            value={completionRate}
            onChange={(e) => onCompletionRateChange(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: 8,
              borderRadius: 4,
              background: 'linear-gradient(to right, #18C964 0%, #18C964 ' + completionRate + '%, #333 ' + completionRate + '%, #333 100%)',
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: 8 
          }}>
            <span style={{ fontSize: 12, color: '#666' }}>0%</span>
            <span style={{ fontSize: 12, color: '#666' }}>100%</span>
          </div>
        </div>

        {/* Results Section */}
        <div style={{ 
          background: 'rgba(24, 201, 100, 0.1)', 
          borderRadius: 12, 
          padding: 20, 
          marginBottom: 24 
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 16 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                Actual Completions
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>
                {actualCompletions} / {N}
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                Your Creator Gain
              </div>
              <div style={{ 
                fontSize: 20, 
                fontWeight: 900, 
                color: dynamicData.isCreatorProfitable ? '#18C964' : '#FF2D2D' 
              }}>
                {dynamicData.creatorGain} $WINC
              </div>
            </div>
          </div>
          
          {/* Warning si moins de 5 completions */}
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
                If less than 5 completions: You lose your MINT, completers get refunded
              </div>
            </div>
          )}
        </div>

        {/* Multiplier Info */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: 8, 
          padding: 12, 
          textAlign: 'center',
          marginBottom: 16
        }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
            Pool Total
          </div>
          <div style={{ 
            fontSize: 16, 
            fontWeight: 700, 
            color: '#FFD600' 
          }}>
            {dynamicData.poolTotal} $WINC
          </div>
        </div>

        {/* Campaign Duration Info */}
        <div style={{ 
          background: 'rgba(255, 214, 0, 0.1)', 
          border: '1px solid #FFD600', 
          borderRadius: 8, 
          padding: 12, 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#FFD600', marginBottom: 4 }}>
            ⏰ Campaign Duration
          </div>
          <div style={{ fontSize: 12, color: '#FFD600' }}>
            Campaigns are accessible for maximum 7 days if completions are still available
          </div>
        </div>
      </div>
    </div>
  );
};

export default function YourCompletionsPage() {
  const router = useRouter();
  const [wincValue, setWincValue] = useState<string>('');
  const [maxCompletions, setMaxCompletions] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [economicData, setEconomicData] = useState<any>(null);
  const [showEconomicDetails, setShowEconomicDetails] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showCreatorGainModal, setShowCreatorGainModal] = useState(false);
  const [completionRate, setCompletionRate] = useState(100);
  const [showCompletionRateModal, setShowCompletionRateModal] = useState(false);
  const [showPoolDistributionChart, setShowPoolDistributionChart] = useState(false);

  // Réinitialiser le taux de completion quand le modal s'ouvre
  useEffect(() => {
    if (showCreatorGainModal) {
      setCompletionRate(100);
    }
  }, [showCreatorGainModal]);

  useEffect(() => {
    // Détecter si on est sur desktop
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  useEffect(() => {
    // Réinitialiser les champs à vide pour une nouvelle saisie
    // Les champs afficheront "Minimum" comme placeholder
    setWincValue('');
    setMaxCompletions('');
    
    // Nettoyer les données économiques
    setEconomicData(null);
  }, []);

  // Calculer les données économiques quand les valeurs changent
  useEffect(() => {
    if (wincValue && maxCompletions) {
      // Normaliser la valeur WINC en remplaçant les virgules par des points
      const normalizedWincValue = wincValue.replace(',', '.');
      const P = parseFloat(normalizedWincValue);
      const N = parseInt(maxCompletions);
      if (P >= 1 && N >= 5 && !isNaN(P)) {
        const data = simulateCampaign(P, N);
        // Vérifier si la 3ème place est inférieure au Unit Value
        const isThirdPlaceDeficit = data.top3 < P;
        setEconomicData({ ...data, isThirdPlaceDeficit });
      }
    }
  }, [wincValue, maxCompletions]);

  const handleWincChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permettre les nombres décimaux positifs avec virgules et points
    if (value === '' || /^[\d.,]+$/.test(value)) {
      // Remplacer les virgules par des points pour la conversion
      const normalizedValue = value.replace(',', '.');
      const numValue = parseFloat(normalizedValue);
      if (value === '' || (numValue >= 1 && !isNaN(numValue))) {
        setWincValue(value);
      }
    }
  };

  const handleCompletionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permettre seulement les nombres entiers positifs
    if (value === '' || /^\d+$/.test(value)) {
      setMaxCompletions(value);
    }
  };

  const canProceed = wincValue !== '' && maxCompletions !== '' && 
                    (() => {
                      const normalizedWincValue = wincValue.replace(',', '.');
                      const P = parseFloat(normalizedWincValue);
                      const N = parseInt(maxCompletions);
                      return P >= 1 && N >= 5 && !isNaN(P) && economicData && economicData.isCreatorProfitable && !economicData.isThirdPlaceDeficit;
                    })();

  const handleNext = () => {
    if (canProceed) {
      // Normaliser la valeur WINC en remplaçant les virgules par des points
      const normalizedWincValue = wincValue.replace(',', '.');
      // Sauvegarder les valeurs dans le localStorage
      localStorage.setItem("completions", JSON.stringify({
        wincValue: parseFloat(normalizedWincValue),
        maxCompletions: parseInt(maxCompletions)
      }));
      router.push('/creation/individual/recap');
    }
  };

  const handleCloseClick = () => {
    setShowLeaveModal(true);
  };

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', paddingTop: 48 }}>
        {/* Croix rouge à l'extérieur en haut à droite */}
        <CloseIcon onClick={handleCloseClick} />
        
        {/* Header en haut de la page */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 600, margin: '0 auto 24px auto', position: 'relative' }}>
          <img src="/individual.svg" alt="Individual" style={{ width: 96, height: 96, marginRight: 18 }} />
          <span style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>Your Completions</span>
          <button onClick={() => setShowTooltip(true)} style={{ background: 'none', border: 'none', marginLeft: 18, cursor: 'pointer', padding: 0 }} aria-label="Help">
            <img src="/tooltip.svg" alt="Aide" style={{ width: 40, height: 40 }} />
          </button>
        </div>

        {/* Layout principal avec deux colonnes sur desktop */}
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
            {/* Encart principal */}
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
                <div style={{ 
                  color: economicData && !economicData.isCreatorProfitable ? '#FF2D2D' : '#FFD600', 
                  fontWeight: 700, 
                  fontSize: 20, 
                  marginBottom: 8, 
                  textAlign: 'center',
                  transition: 'color 0.3s ease'
                }}>
                  Unit Value of the Completion in $WINC
                </div>
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
                    type="text"
                    value={wincValue}
                    onChange={handleWincChange}
                    placeholder="Minimum 1 $WINC"
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
                <div style={{ 
                  color: (economicData && !economicData.isCreatorProfitable) || (maxCompletions !== '' && parseInt(maxCompletions) < 5) ? '#FF2D2D' : '#FFD600', 
                  fontWeight: 700, 
                  fontSize: 20, 
                  marginBottom: 8, 
                  textAlign: 'center',
                  transition: 'color 0.3s ease'
                }}>
                  Max. Completions
                </div>
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
                    type="text"
                    value={maxCompletions}
                    onChange={handleCompletionsChange}
                    placeholder="Minimum 5 Completions"
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
                  background: economicData && !economicData.isCreatorProfitable 
                    ? 'linear-gradient(135deg, #FFD600, #FFA500)' 
                    : 'linear-gradient(135deg, #FFD600, #FFA500)',
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

              {/* Message d'erreur amélioré si le créateur perd de l'argent */}
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

          {/* Colonne droite - Détails économiques (visible sur desktop) */}
          {isDesktop && economicData && (
            <div style={{ 
              flex: '0 0 400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 400
            }}>
              <EconomicDetails 
                data={economicData} 
                isVisible={true} 
                isInline={true} 
                onCreatorGainClick={() => setShowCreatorGainModal(true)}
                onTop3Click={() => setShowCompletionRateModal(true)}
                onPoolClick={() => setShowPoolDistributionChart(true)}
              />
            </div>
          )}
        </div>

        <GreenArrowButton onClick={handleNext} disabled={!canProceed} />

        {/* Pop-up Creator Gain Modal */}
        <CreatorGainModal 
          isVisible={showCreatorGainModal}
          onClose={() => setShowCreatorGainModal(false)}
          completionRate={completionRate}
          onCompletionRateChange={setCompletionRate}
          economicData={{ ...economicData, wincValue, maxCompletions }}
        />

        {/* Pop-up Completion Rate Modal */}
        <CompletionRateModal 
          isVisible={showCompletionRateModal}
          onClose={() => setShowCompletionRateModal(false)}
          economicData={{ ...economicData, wincValue, maxCompletions }}
        />

        {/* Pop-up Pool Distribution Chart */}
        {economicData && (
          <PoolDistributionChart 
            isVisible={showPoolDistributionChart}
            onClose={() => setShowPoolDistributionChart(false)}
            data={{ ...economicData, wincValue, maxCompletions }}
          />
        )}

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
                maxHeight: '90vh',
                height: '90vh',
                background: '#000',
                border: '4px solid #FFD600',
                borderRadius: 24,
                padding: '32px 24px 28px 24px',
                boxShadow: '0 0 32px #000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#FFD600',
                overflowY: 'auto',
                overflowX: 'hidden'
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
              <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 18, letterSpacing: 1 }}>Your Completions</h2>
              
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 400, marginBottom: 24, textAlign: 'left', flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>📝 Quick Guide</strong><br />
                  • <strong>Unit Value in $WINC:</strong> amount paid per completer. Minimum 1 $WINC.<br />
                  • <strong>Max. Completions:</strong> maximum number of validations. Minimum 5. Caps your campaign budget and defines reward supply.<br />
                  Both fields must meet the minima to continue. The pool scales linearly: <code style={{ background: '#333', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>(Unit Value × Max Completions) + MINT = Total Pool</code>.
                </div>

                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>🏅 Winner Selection</strong><br />
                  <strong>Decentralized moderators</strong> score each completion from 0/100 to 100/100 based on quality and alignment with your original creation. Each moderator can only use a score once per campaign, ensuring unique ranking. The <strong>top 3 winners</strong> are determined by the <strong>average scores</strong> across all moderators - the completions most preferred by the moderation community.
                </div>

                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>💰 Economic Equation</strong><br />
                  The system ensures perfect balance with this equation:<br />
                  <code style={{ background: '#333', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
                    (Unit Value × Max Completions) + MINT = Total Pool
                  </code><br />
                  Where Total Pool = 1st + 2nd + 3rd + Platform + Moderators + Creator Gain
                </div>

                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>🏆 Reward Distribution</strong><br />
                  • <strong>Top 3 Winners:</strong> 50% of total pool + creator surplus + reductions<br />
                  • <strong>Creator:</strong> Capped at 1.5x MINT (≤60%) to 2.5x MINT (100%)<br />
                  • <strong>Platform:</strong> 7% of total pool (10% - 30% reduction)<br />
                  • <strong>Moderators:</strong> 32% of total pool (40% - 20% reduction)
                </div>

                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>⚡ Performance Multipliers</strong><br />
                  Your rewards increase based on completion rate:<br />
                  • <strong>0-20%:</strong> 0.00x multiplier (no bonus)<br />
                  • <strong>20-40%:</strong> 0.40x multiplier<br />
                  • <strong>40-60%:</strong> 0.80x multiplier<br />
                  • <strong>60-80%:</strong> 1.20x multiplier<br />
                  • <strong>80-95%:</strong> 1.60x multiplier<br />
                  • <strong>95%+:</strong> 2.00x bonus multiplier
                </div>

                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>🎮 XP System</strong><br />
                  Earn XP multipliers based on campaign success:<br />
                  • <strong>60%+ completion:</strong> 2x XP<br />
                  • <strong>80%+ completion:</strong> 3x XP<br />
                  • <strong>90%+ completion:</strong> 4x XP<br />
                  • <strong>95%+ completion:</strong> 5x XP<br />
                  • <strong>100% completion:</strong> 6x XP
                </div>

                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>💡 Economic Balance</strong><br />
                  The system automatically adjusts reward distribution to maintain economic balance. When you receive bonus multipliers, the excess is proportionally reduced from other participants to prevent inflation.
                </div>

                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>🎯 Minimum Completions Rule</strong><br />
                  ROI is only available from 5 completed validations. If your campaign has less than 5 completions, you lose your MINT and completers get refunded. This ensures competitive hierarchy for the top 3 positions.
                </div>

                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>⏰ Campaign Duration</strong><br />
                  Campaigns are accessible for maximum 7 days if completions are still available. This ensures active participation and prevents campaigns from becoming stale.
                </div>

                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>🔍 Real-time Analytics</strong><br />
                  Monitor your campaign performance with live economic data. Desktop users can see detailed breakdowns of all calculations and projections.
                </div>

                <div style={{ background: '#FFD600', color: '#000', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
                  💡 Economic details are displayed in real-time on desktop!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pop-up des détails économiques (mobile) */}
        {showEconomicDetails && (
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
            <EconomicDetails 
              data={economicData} 
              isVisible={showEconomicDetails} 
              onTop3Click={() => setShowCompletionRateModal(true)}
              onPoolClick={() => setShowPoolDistributionChart(true)}
            />
          </div>
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