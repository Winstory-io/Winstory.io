"use client";
import React, { useState, useEffect } from 'react';

// Constantes du modèle économique WINC
const ECONOMIC_CONSTANTS = {
  BASE_FEE: 2,           // Réduit de 3 à 2 (baisse de 33%)
  SCALING_FACTOR: 0.15,  // Réduit de 0.20 à 0.15 (baisse de 25%)
  RISK_ADJUSTMENT: 0.09, // Réduit de 0.12 à 0.09 (baisse de 25%)
  POOL_TOP3_PERCENTAGE: 0.50, // 50% pour les 3 gagnants
  POOL_CREATOR_PERCENTAGE: 0.30, // 30% pour le créateur (sera réduit de 15%)
  POOL_PLATFORM_PERCENTAGE: 0.10, // 10% pour la plateforme
  POOL_MODERATORS_PERCENTAGE: 0.40, // 40% pour les modérateurs
  POOL_REWARD_PERCENTAGE: 0.75,
  POOL_MINT_PERCENTAGE: 0.25
};

// Fonction de simulation du modèle économique WINC
function simulateCampaign(P: number, N: number, CR: number = N) {
  const sqrtPN = Math.sqrt(P * N);
  const mint = ECONOMIC_CONSTANTS.BASE_FEE + 
               (P * N * ECONOMIC_CONSTANTS.SCALING_FACTOR) + 
               (sqrtPN * ECONOMIC_CONSTANTS.RISK_ADJUSTMENT);
  
  // CORRECTION : Calcul du pool total basé sur les Actual Completions
  const totalValue = (P * CR) + mint; // Unit Value × Actual Completions + MINT initial
  
  const poolTop3 = totalValue * ECONOMIC_CONSTANTS.POOL_TOP3_PERCENTAGE;
  const poolCreator = totalValue * ECONOMIC_CONSTANTS.POOL_CREATOR_PERCENTAGE;
  const platform = totalValue * ECONOMIC_CONSTANTS.POOL_PLATFORM_PERCENTAGE;
  const moderators = totalValue * ECONOMIC_CONSTANTS.POOL_MODERATORS_PERCENTAGE;

  const tauxCompletion = CR / N;
  let multiplicateurGain = 0;
  let multiplicateurXP = 1;
  let creatorGain = 0;
  let creatorNetGain = 0;
  let isCreatorProfitable = false;
  let isMinimumCompletionsReached = CR >= 5;

  // Système de multiplicateurs basé directement sur le pourcentage exact
  const completionPercentage = tauxCompletion * 100;
  
  // Vérifier si le minimum de 5 completions est atteint
  if (isMinimumCompletionsReached) {
    // Calcul du multiplicateur basé sur le pourcentage exact (formule continue)
    // Formule : multiplicateur = (completionPercentage / 100) * 2.0
    // Cela donne un multiplicateur unique pour chaque pourcentage de 0% à 100%
    
    // Multiplicateur unique pour chaque pourcentage (0.00 à 2.00)
    multiplicateurGain = (completionPercentage / 100) * 2.0;
    
    // XP basé sur des paliers pour simplifier
    if (completionPercentage >= 100) {
      multiplicateurXP = 6;
    } else if (completionPercentage >= 95) {
      multiplicateurXP = 5;
    } else if (completionPercentage >= 90) {
      multiplicateurXP = 4;
    } else if (completionPercentage >= 80) {
      multiplicateurXP = 3;
    } else if (completionPercentage >= 60) {
      multiplicateurXP = 2;
    } else {
      multiplicateurXP = 1;
    }

    // Calcul du creator gain avec plafond à 2.5x le MINT initial
    const creatorGainWithMultiplier = poolCreator * multiplicateurGain;
    
    // Plafond maximum : 2.5x le MINT initial
    const maxCreatorGain = mint * 2.5;
    
    // Calcul du plafond progressif basé sur le taux de completion
    let creatorGainCap;
    
    if (completionPercentage <= 60) {
      // En dessous de 60% : plafonné à 1.5x le MINT
      creatorGainCap = mint * 1.5;
    } else if (completionPercentage >= 100) {
      // À 100% : plafonné à 2.5x le MINT
      creatorGainCap = mint * 2.5;
    } else {
      // Entre 60% et 100% : progression linéaire de 1.5x à 2.5x le MINT
      const progressionRatio = (completionPercentage - 60) / 40; // 0 à 1 entre 60% et 100%
      const capRange = 2.5 - 1.5; // Différence entre 2.5x et 1.5x
      const currentCap = 1.5 + (progressionRatio * capRange);
      creatorGainCap = mint * currentCap;
    }
    
    creatorGain = Math.min(creatorGainWithMultiplier, creatorGainCap);
    creatorNetGain = creatorGain - mint; // Gain net (gain brut - MINT initial)
    isCreatorProfitable = creatorGain >= mint;
  } else {
    // Si moins de 5 completions : le créateur perd sa mise, les completers sont remboursés
    creatorGain = 0;
    creatorNetGain = -mint; // Perte de la mise initiale
    isCreatorProfitable = false;
    multiplicateurGain = 0;
    multiplicateurXP = 1;
  }

  // Calcul du surplus du creator gain à redistribuer aux 3 premiers
  const creatorGainSurplus = poolCreator * multiplicateurGain - creatorGain; // Différence entre gain calculé et gain plafonné
  
  // Réduction des gains modérateurs et plateforme
  const moderatorsReduction = moderators * 0.20; // 20% de réduction
  const platformReduction = platform * 0.30; // 30% de réduction
  const moderatorsAdjusted = moderators - moderatorsReduction;
  const platformAdjusted = platform - platformReduction;
  
  // Total des réductions à redistribuer aux 3 premiers
  const totalReductionForTop3 = creatorGainSurplus + moderatorsReduction + platformReduction;
  
  // Répartition du total des réductions entre les 3 premiers (50% + 30% + 20%)
  const top1Bonus = totalReductionForTop3 * 0.5; // 50% du total des réductions
  const top2Bonus = totalReductionForTop3 * 0.3; // 30% du total des réductions
  const top3BonusFinal = totalReductionForTop3 * 0.2; // 20% du total des réductions

  // Ajuster la répartition pour maintenir l'économie circulaire
  let adjustedTop1, adjustedTop2, adjustedTop3, adjustedPlatform, adjustedModerators;
  
  // CORRECTION : Les gains des 3 premiers doivent être proportionnels au taux de completion
  // Base pool pour les 3 premiers (proportionnel au taux de completion)
  const baseTop3Pool = poolTop3 * tauxCompletion;
  
  // Répartition normale avec redistribution (proportionnelle au taux de completion)
  adjustedTop1 = (baseTop3Pool * 0.5) + (top1Bonus * tauxCompletion);
  adjustedTop2 = (baseTop3Pool * 0.3) + (top2Bonus * tauxCompletion);
  adjustedTop3 = (baseTop3Pool * 0.2) + (top3BonusFinal * tauxCompletion);
  adjustedPlatform = platformAdjusted;
  adjustedModerators = moderatorsAdjusted;
  
  // Vérification finale : s'assurer que le total distribué = totalValue
  const totalDistributed = creatorGain + adjustedTop1 + adjustedTop2 + adjustedTop3 + adjustedPlatform + adjustedModerators;
  
  // Si il y a une différence, ajuster proportionnellement
  if (Math.abs(totalDistributed - totalValue) > 0.01) {
    const adjustmentRatio = totalValue / totalDistributed;
    adjustedTop1 *= adjustmentRatio;
    adjustedTop2 *= adjustmentRatio;
    adjustedTop3 *= adjustmentRatio;
    adjustedPlatform *= adjustmentRatio;
    adjustedModerators *= adjustmentRatio;
  }

  return {
    mint: Math.round(mint * 100) / 100,
    poolTotal: Math.round(totalValue * 100) / 100,
    creatorGain: Math.round(creatorGain * 100) / 100,
    creatorNetGain: Math.round(creatorNetGain * 100) / 100,
    isCreatorProfitable,
    isMinimumCompletionsReached,
    creatorXP: 200 * multiplicateurXP,
    top1: Math.round(adjustedTop1 * 100) / 100,
    top2: Math.round(adjustedTop2 * 100) / 100,
    top3: Math.round(adjustedTop3 * 100) / 100,
    platform: Math.round(adjustedPlatform * 100) / 100,
    moderators: Math.round(adjustedModerators * 100) / 100,
    platformTotal: Math.round(platform * 100) / 100,
    tauxCompletion: Math.round(tauxCompletion * 100) / 100,
    multiplicateurGain,
    multiplicateurXP
  };
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
      setDynamicData(data);
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
            {!dynamicData?.isMinimumCompletionsReached && (
              <div style={{ 
                fontSize: 12, 
                color: '#FF2D2D', 
                marginTop: 8,
                background: 'rgba(255, 45, 45, 0.1)',
                padding: '8px',
                borderRadius: '6px'
              }}>
                ⚠️ Minimum 5 completions required for rewards
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
                color: !dynamicData?.isMinimumCompletionsReached ? '#FF2D2D' : '#FFD700' 
              }}>
                {!dynamicData?.isMinimumCompletionsReached ? 'REFUND' : `${dynamicData?.top1 || 0} $WINC`}
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
                color: !dynamicData?.isMinimumCompletionsReached ? '#FF2D2D' : '#C0C0C0' 
              }}>
                {!dynamicData?.isMinimumCompletionsReached ? 'REFUND' : `${dynamicData?.top2 || 0} $WINC`}
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
                color: !dynamicData?.isMinimumCompletionsReached ? '#FF2D2D' : '#CD7F32' 
              }}>
                {!dynamicData?.isMinimumCompletionsReached ? 'REFUND' : `${dynamicData?.top3 || 0} $WINC`}
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
                color: !dynamicData?.isMinimumCompletionsReached ? '#FF2D2D' : (dynamicData?.isCreatorProfitable ? '#18C964' : '#FF2D2D')
              }}>
                {!dynamicData?.isMinimumCompletionsReached ? 'REFUND' : `${dynamicData?.creatorGain || 0} $WINC`}
              </div>
            </div>
          </div>
        </div>

        {/* Avertissement pour les taux faibles */}
        {!dynamicData?.isMinimumCompletionsReached && (
          <div style={{ 
            background: 'rgba(255, 45, 45, 0.1)', 
            border: '1px solid #FF2D2D', 
            borderRadius: 8, 
            padding: 12, 
            textAlign: 'center',
            marginBottom: 16
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#FF2D2D', marginBottom: 4 }}>
              ⚠️ Minimum 5 Completions Required
            </div>
            <div style={{ fontSize: 12, color: '#FF2D2D' }}>
              Below 5 completions: You lose MINT, completers get REFUNDED
            </div>
          </div>
        )}

        {/* Avertissement pour les taux faibles (60% et moins) */}
        {dynamicData?.isMinimumCompletionsReached && completionRate < 60 && (
          <div style={{ 
            background: 'rgba(255, 45, 45, 0.1)', 
            border: '1px solid #FF2D2D', 
            borderRadius: 8, 
            padding: 12, 
            textAlign: 'center',
            marginBottom: 16
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#FF2D2D', marginBottom: 4 }}>
              ⚠️ Low Completion Rate
            </div>
            <div style={{ fontSize: 12, color: '#FF2D2D' }}>
              Below 60% completion: Creator gains are capped at 1.5x MINT
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

export default CompletionRateModal; 