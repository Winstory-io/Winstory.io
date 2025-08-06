"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

// Constantes du modèle économique WINC
const ECONOMIC_CONSTANTS = {
  BASE_FEE: 3,
  SCALING_FACTOR: 0.20,
  RISK_ADJUSTMENT: 0.12,
  POOL_TOP3_PERCENTAGE: 0.55,
  POOL_CREATOR_PERCENTAGE: 0.30,
  POOL_PLATFORM_PERCENTAGE: 0.15,
  POOL_REWARD_PERCENTAGE: 0.75,
  POOL_MINT_PERCENTAGE: 0.25
};

// Fonction de simulation du modèle économique WINC
function simulateCampaign(P: number, N: number, CR: number = N) {
  const sqrtPN = Math.sqrt(P * N);
  const mint = ECONOMIC_CONSTANTS.BASE_FEE + 
               (P * N * ECONOMIC_CONSTANTS.SCALING_FACTOR) + 
               (sqrtPN * ECONOMIC_CONSTANTS.RISK_ADJUSTMENT);
  
  const poolTotal = (P * N * ECONOMIC_CONSTANTS.POOL_REWARD_PERCENTAGE) + 
                    (mint * ECONOMIC_CONSTANTS.POOL_MINT_PERCENTAGE);
  
  const poolTop3 = poolTotal * ECONOMIC_CONSTANTS.POOL_TOP3_PERCENTAGE;
  const poolCreator = poolTotal * ECONOMIC_CONSTANTS.POOL_CREATOR_PERCENTAGE;
  const platform = poolTotal * ECONOMIC_CONSTANTS.POOL_PLATFORM_PERCENTAGE;

  const tauxCompletion = CR / N;
  let multiplicateurGain = 0;
  let multiplicateurXP = 1;

  // Système de multiplicateurs basé directement sur le pourcentage exact
  const completionPercentage = tauxCompletion * 100;
  
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

  const creatorGain = poolCreator * multiplicateurGain;
  const creatorNetGain = creatorGain - mint; // Gain net (gain brut - MINT initial)
  const isCreatorProfitable = creatorGain >= mint;

  // Répartition Platform/Moderators (70% modérateurs, 30% plateforme)
  const platformShare = platform * 0.3;
  const moderatorsShare = platform * 0.7;

  // Ajuster la répartition pour maintenir l'économie circulaire
  let adjustedTop1, adjustedTop2, adjustedTop3, adjustedPlatform, adjustedModerators;
  
  // Vérification : s'assurer qu'aucun argent n'est créé ex nihilo
  const totalPool = poolTop3 + platform;
  const creatorShare = poolCreator * multiplicateurGain;
  
  if (multiplicateurGain > 1.0) {
    // Le créateur reçoit plus que sa part normale, réduire les autres
    const bonusCreator = poolCreator * (multiplicateurGain - 1.0);
    const totalToReduce = bonusCreator;
    
    // Réduire proportionnellement Top3 et Platform
    const reductionRatio = totalToReduce / totalPool;
    
    // S'assurer que la réduction ne dépasse pas 100%
    const safeReductionRatio = Math.min(reductionRatio, 0.99);
    
    adjustedTop1 = poolTop3 * 0.5 * (1 - safeReductionRatio);
    adjustedTop2 = poolTop3 * 0.3 * (1 - safeReductionRatio);
    adjustedTop3 = poolTop3 * 0.2 * (1 - safeReductionRatio);
    adjustedPlatform = platformShare * (1 - safeReductionRatio);
    adjustedModerators = moderatorsShare * (1 - safeReductionRatio);
  } else {
    // Répartition normale
    adjustedTop1 = poolTop3 * 0.5;
    adjustedTop2 = poolTop3 * 0.3;
    adjustedTop3 = poolTop3 * 0.2;
    adjustedPlatform = platformShare;
    adjustedModerators = moderatorsShare;
  }
  
  // Vérification finale : s'assurer que le total distribué = poolTotal
  const totalDistributed = creatorShare + adjustedTop1 + adjustedTop2 + adjustedTop3 + adjustedPlatform + adjustedModerators;
  
  // Si il y a une différence, ajuster proportionnellement
  if (Math.abs(totalDistributed - poolTotal) > 0.01) {
    const adjustmentRatio = poolTotal / totalDistributed;
    adjustedTop1 *= adjustmentRatio;
    adjustedTop2 *= adjustmentRatio;
    adjustedTop3 *= adjustmentRatio;
    adjustedPlatform *= adjustmentRatio;
    adjustedModerators *= adjustmentRatio;
  }

      return {
      mint: Math.round(mint * 100) / 100,
      poolTotal: Math.round(poolTotal * 100) / 100,
      creatorGain: Math.round(creatorGain * 100) / 100,
      creatorNetGain: Math.round(creatorNetGain * 100) / 100,
      isCreatorProfitable,
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

// Composant pour afficher les détails économiques en temps réel
const EconomicDetails = ({ data, isVisible, isInline = false, onCreatorGainClick }: { data: any, isVisible: boolean, isInline?: boolean, onCreatorGainClick?: () => void }) => {
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
    opacity: data.isCreatorProfitable ? 1 : 0.5,
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
    opacity: data.isCreatorProfitable ? 1 : 0.5,
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
        {/* Pool Total */}
        <div style={{
          background: '#000',
          border: '2px solid #18C964',
          borderRadius: 10,
          padding: 8,
          textAlign: 'center',
          opacity: data.isCreatorProfitable ? 1 : 0.6,
          transition: 'opacity 0.3s ease'
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#18C964', marginBottom: 2 }}>
            Total Reward $WINC Pool
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#18C964' }}>
            {data.poolTotal} $WINC
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        {/* Top 3 Rewards - Disposition verticale hiérarchique */}
        <div style={{
          background: 'transparent',
          border: `2px solid ${data.isThirdPlaceDeficit ? '#FF2D2D' : '#FFD700'}`,
          borderRadius: 8,
          padding: 8,
          textAlign: 'center',
          opacity: data.isCreatorProfitable ? 1 : 0.6,
          transition: 'opacity 0.3s ease'
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#FFD700', marginBottom: 4 }}>
            1st Place
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#FFD700' }}>
            {data.top1} $WINC
          </div>
        </div>

        <div style={{
          background: 'transparent',
          border: `2px solid ${data.isThirdPlaceDeficit ? '#FF2D2D' : '#C0C0C0'}`,
          borderRadius: 8,
          padding: 8,
          textAlign: 'center',
          opacity: data.isCreatorProfitable ? 1 : 0.6,
          transition: 'opacity 0.3s ease'
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#C0C0C0', marginBottom: 4 }}>
            2nd Place
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#C0C0C0' }}>
            {data.top2} $WINC
          </div>
        </div>

        <div style={{
          background: 'transparent',
          border: `2px solid ${data.isThirdPlaceDeficit ? '#FF2D2D' : '#CD7F32'}`,
          borderRadius: 8,
          padding: 8,
          textAlign: 'center',
          opacity: data.isCreatorProfitable ? 1 : 0.6,
          transition: 'opacity 0.3s ease'
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#CD7F32', marginBottom: 4 }}>
            3rd Place
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: data.isThirdPlaceDeficit ? '#FF2D2D' : '#CD7F32' }}>
            {data.top3} $WINC
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
            opacity: data.isCreatorProfitable ? 1 : 0.6,
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
            opacity: data.isCreatorProfitable ? 1 : 0.6,
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
            : 'linear-gradient(135deg, #FF2D2D, #FF1744)',
          borderRadius: 12,
          padding: 16,
          textAlign: 'center',
          boxShadow: data.isCreatorProfitable ? '0 0 20px rgba(24, 201, 100, 0.3)' : '0 0 20px rgba(255, 45, 45, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: 'scale(1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = data.isCreatorProfitable 
            ? '0 0 30px rgba(24, 201, 100, 0.5)' 
            : '0 0 30px rgba(255, 45, 45, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = data.isCreatorProfitable 
            ? '0 0 20px rgba(24, 201, 100, 0.3)' 
            : '0 0 20px rgba(255, 45, 45, 0.3)';
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
        </div>

        {/* Multiplier Info */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: 8, 
          padding: 12, 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
            Gain Multiplier
          </div>
          <div style={{ 
            fontSize: 16, 
            fontWeight: 700, 
            color: '#18C964' 
          }}>
            {dynamicData.multiplicateurGain.toFixed(4)}x
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
    // Vérifier si on vient de la page recap
    const isFromRecap = localStorage.getItem('fromRecap') === 'true';
    
    if (isFromRecap) {
      // Restaurer les données sauvegardées
      const completionsData = localStorage.getItem("completions");
      if (completionsData) {
        try {
          const data = JSON.parse(completionsData);
          setWincValue(data.wincValue?.toString() || '');
          setMaxCompletions(data.maxCompletions?.toString() || '');
        } catch (e) {
          console.error("Error parsing completions data:", e);
        }
      }
      // Nettoyer le flag
      localStorage.removeItem('fromRecap');
    } else {
      // Charger les données existantes si disponibles
      const completionsData = localStorage.getItem("completions");
      if (completionsData) {
        try {
          const data = JSON.parse(completionsData);
          setWincValue(data.wincValue?.toString() || '');
          setMaxCompletions(data.maxCompletions?.toString() || '');
        } catch (e) {
          console.error("Error parsing completions data:", e);
        }
      }
    }
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
                  background: 'linear-gradient(135deg, #FFD600, #FFA500)',
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'center',
                  marginBottom: 24,
                  border: '2px solid #FFD600',
                  opacity: economicData && !economicData.isCreatorProfitable ? 0.5 : 1,
                  transition: 'opacity 0.3s ease'
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
                        marginTop: 8
                      }}
                    >
                      📊 View Economic Details
                    </button>
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
              <EconomicDetails data={economicData} isVisible={true} isInline={true} onCreatorGainClick={() => setShowCreatorGainModal(true)} />
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
              <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 18, letterSpacing: 1 }}>Your Completions</h2>
              
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 400, marginBottom: 24, textAlign: 'left' }}>
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>🎯 Campaign Configuration</strong><br />
                  Configure the completion parameters for your campaign. Set the unit value in $WINC tokens and the maximum number of completions allowed for your community.
                </div>

                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>💰 Dynamic MINT Calculation</strong><br />
                  The MINT cost is calculated automatically using our advanced economic model:<br />
                  <code style={{ background: '#333', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
                    MINT = 3 + (P×N×0.20) + (√(P×N)×0.12)
                  </code>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>🏆 Reward Distribution</strong><br />
                  • <strong>Top 3 Winners:</strong> 55% of total pool<br />
                  • <strong>Creator:</strong> 30% of total pool<br />
                  • <strong>Platform:</strong> 15% of total pool
                </div>

                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>⚡ Performance Multipliers</strong><br />
                  Your rewards increase based on completion rate:<br />
                  • 20-40% completion: 0.25x multiplier<br />
                  • 40-60% completion: 0.50x multiplier<br />
                  • 60-80% completion: 0.75x multiplier<br />
                  • 80-95% completion: 1.00x multiplier<br />
                  • 95%+ completion: 1.50x bonus multiplier
                </div>

                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: '#FFD600' }}>🎮 XP System</strong><br />
                  Earn XP multipliers based on campaign success, unlocking new features and benefits as you level up.
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
            <EconomicDetails data={economicData} isVisible={showEconomicDetails} />
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