"use client";
import React, { useState, useEffect } from 'react';

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

const CloseIcon = ({ onClick }: { onClick: () => void }) => (
  <svg onClick={onClick} width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', position: 'absolute', top: 24, right: 24, zIndex: 100 }}>
    <line x1="10" y1="10" x2="22" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
    <line x1="22" y1="10" x2="10" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

interface CompletionRateModalProps {
  isVisible: boolean;
  onClose: () => void;
  economicData: any;
}

const CompletionRateModal: React.FC<CompletionRateModalProps> = ({ 
  isVisible, 
  onClose, 
  economicData 
}) => {
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
      
      // Logique de refund basée sur la comparaison gain vs prix unitaire
      // SEULS les gagnants peuvent avoir un refund, PAS le créateur
      const isRefundTop1 = data.top1 < P;
      const isRefundTop2 = data.top2 < P;
      const isRefundTop3 = data.top3 < P;
      
      // Ajouter ces informations aux données
      const enhancedData = {
        ...data,
        isRefundTop1,
        isRefundTop2,
        isRefundTop3,
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
                color: '#FF2D2D', 
                marginTop: 8,
                background: 'rgba(255, 45, 45, 0.1)',
                padding: '8px',
                borderRadius: '6px'
              }}>
                ⚠️ Some winners' gains are below unit completion price ({dynamicData?.unitPrice} $WINC)
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
                color: dynamicData?.isRefundTop1 ? '#FF2D2D' : '#FFD700' 
              }}>
                {dynamicData?.isRefundTop1 ? 'REFUND' : `${dynamicData?.top1 || 0} $WINC`}
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
                color: dynamicData?.isRefundTop2 ? '#FF2D2D' : '#C0C0C0' 
              }}>
                {dynamicData?.isRefundTop2 ? 'REFUND' : `${dynamicData?.top2 || 0} $WINC`}
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
                color: dynamicData?.isRefundTop3 ? '#FF2D2D' : '#CD7F32' 
              }}>
                {dynamicData?.isRefundTop3 ? 'REFUND' : `${dynamicData?.top3 || 0} $WINC`}
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

        {/* Avertissement pour les gains insuffisants - SEULS LES GAGNANTS */}
        {(dynamicData?.isRefundTop1 || dynamicData?.isRefundTop2 || dynamicData?.isRefundTop3) && (
          <div style={{ 
            background: 'rgba(255, 45, 45, 0.1)', 
            border: '1px solid #FF2D2D', 
            borderRadius: 8, 
            padding: 12, 
            textAlign: 'center',
            marginBottom: 16
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#FF2D2D', marginBottom: 4 }}>
              ⚠️ Economic Refund Warning
            </div>
            <div style={{ fontSize: 12, color: '#FF2D2D' }}>
              Some winners' gains are below their unit completion cost ({dynamicData?.unitPrice} $WINC). 
              These winners will receive a full refund instead.
            </div>
          </div>
        )}

        {/* Info sur la durée de campagne */}
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
            30 days to complete the challenge
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionRateModal; 