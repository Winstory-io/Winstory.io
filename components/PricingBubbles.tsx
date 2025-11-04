"use client";
import React, { useState, useEffect } from 'react';

interface PricingOption {
  label: string;
  price: number;
  isSelected: boolean;
  description?: string;
}

interface PricingBubblesProps {
  options: PricingOption[];
  totalPrice: number;
  flowType?: 'B2C' | 'AgencyB2C';
}

// Composant ROI Modal avec jauge interactive
const ROIModalContent = ({ 
  actualMintCost, 
  totalROI, 
  roiData, 
  aiOptionCost, 
  onClose 
}: {
  actualMintCost: number;
  totalROI: number;
  roiData: any;
  aiOptionCost: number;
  onClose: () => void;
}) => {
  const [completionRate, setCompletionRate] = useState(100);
  const [currentROI, setCurrentROI] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calcul du montant récupéré selon la logique Winstory exacte
  const calculateRecovered = (completionRate: number) => {
    if (!roiData?.unitValue || !roiData?.maxCompletions) return 0;
    
    // Calcul du nombre réel de completions
    const actualCompletions = Math.round((completionRate / 100) * roiData.maxCompletions);
    
    // Calcul selon la formule Winstory : (Unit Value × Actual Completions) × 50%
    // Car 50% des frais de completion reviennent à l'entreprise B2C
    const totalFees = roiData.unitValue * actualCompletions;
    const recovered = totalFees * 0.50; // 50% revient à l'entreprise B2C
    
    return recovered;
  };

  useEffect(() => {
    const newROI = calculateRecovered(completionRate);
    setCurrentROI(newROI);
  }, [completionRate, roiData]);

  const handleSliderChange = (value: number) => {
    setIsAnimating(true);
    setCompletionRate(value);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const recoveredAmount = calculateRecovered(completionRate);
  
  // Calculer le nombre réel de completions
  const actualCompletions = Math.round((completionRate / 100) * (roiData?.maxCompletions || 0));

  // Fonction pour calculer la couleur dynamique du ROI
  const getROIColor = (roi: number, mintCost: number) => {
    if (roi === 0) return '#FFD600'; // Jaune pour Initial MINT
    
    const progress = roi / mintCost; // Progression par rapport au MINT initial
    
    if (progress < 0.25) return '#F31260'; // Rouge (0-25%)
    if (progress < 0.5) return '#FF8C00'; // Orange (25-50%)
    if (progress < 0.75) return '#FFD600'; // Jaune (50-75%)
    if (progress < 1) return '#18C964'; // Vert clair (75-100%)
    if (progress >= 1) return '#00C46C'; // Vert foncé (100%+ = ROI franchit le MINT initial)
    return '#00C46C'; // Fallback
  };

  const roiColor = getROIColor(recoveredAmount, actualMintCost);

  return (
    <div style={{ color: '#fff' }}>
      {/* Header avec titre et fermeture */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#00C46C' }}>
          🎯 ROI Interactive Calculator
        </div>
        <button 
          onClick={onClose} 
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            color: '#F31260',
            fontSize: 24,
            fontWeight: 'bold'
          }}
        >
          ✕
        </button>
      </div>

      {/* Section d'accueil simplifiée */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(0, 196, 108, 0.1) 0%, rgba(0, 196, 108, 0.05) 100%)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        border: '1px solid rgba(0, 196, 108, 0.3)'
      }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#00C46C', marginBottom: 12 }}>
          💡 ROI Calculator
        </div>
        <div style={{ fontSize: 14, color: '#ccc', lineHeight: 1.6 }}>
          <strong>🎯 How it works:</strong><br/>
          • Each completion pays the Unit Value (e.g., $100)<br/>
          • <strong>50%</strong> goes to your company (B2C)<br/>
          • <strong>50%</strong> goes to moderators and platform<br/>
          • <strong>Your ROI = 50% × Total Fees Collected</strong>
        </div>
      </div>

      {/* Section COMPLETIONS IMPACT */}
      <div style={{ 
        background: 'rgba(0, 196, 108, 0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        border: '1px solid rgba(0, 196, 108, 0.2)'
      }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#00C46C', marginBottom: 20 }}>
          📊 COMPLETIONS IMPACT
        </div>
        
        {/* Informations de configuration */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>
            Unit Value: <span style={{ color: '#FFD600', fontWeight: 600 }}>${roiData?.unitValue || 0}.00</span>
          </div>
          <div style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>
            Max Completions: <span style={{ color: '#FFD600', fontWeight: 600 }}>{roiData?.maxCompletions || 0}</span>
          </div>
          <div style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>
            Net Profit Potential: <span style={{ color: '#FFD600', fontWeight: 600 }}>${roiData?.netProfit || 0}.00</span>
          </div>
        </div>

        {/* Affichage des completions actuelles */}
        <div style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>
          Current Completions: <span style={{ color: '#00C46C', fontWeight: 600 }}>{actualCompletions}</span> / {roiData?.maxCompletions || 0}
        </div>
        
        {/* Slider interactif */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="range"
            min="0"
            max="100"
            value={completionRate}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: 8,
              borderRadius: 4,
              background: 'linear-gradient(90deg, #F31260 0%, #FF8C00 25%, #FFD600 50%, #18C964 75%, #00C46C 100%)',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: 8,
            fontSize: 12,
            color: '#666'
          }}>
            <span>0</span>
            <span>{Math.round((roiData?.maxCompletions || 0) / 2)}</span>
            <span>{roiData?.maxCompletions || 0}</span>
          </div>
        </div>

        {/* Affichage du montant récupéré */}
        <div style={{ fontSize: 14, color: '#ccc', marginBottom: 16 }}>
          Recovered (50% of fees): <span style={{ color: '#00C46C', fontWeight: 600 }}>
            {formatPrice(recoveredAmount)}
          </span>
        </div>
        
        {/* Affichage du ROI avec couleur dynamique */}
        <div style={{ fontSize: 24, fontWeight: 700, color: roiColor }}>
          {completionRate === 0 ? (
            <span style={{ color: '#FFD600' }}>Initial MINT: {formatPrice(actualMintCost)}</span>
          ) : (
            <span>ROI: {formatPrice(recoveredAmount)}</span>
          )}
        </div>
      </div>

      {/* Insights simplifiés */}
      <div style={{ 
        background: 'rgba(255, 214, 0, 0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        border: '1px solid rgba(255, 214, 0, 0.2)'
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#FFD600', marginBottom: 16 }}>
          📊 ROI Examples
        </div>
        <div style={{ fontSize: 14, color: '#ccc', lineHeight: 1.6 }}>
          <div style={{ marginBottom: 8 }}>
            • <strong>0 completions:</strong> <span style={{ color: '#FFD600' }}>Initial MINT: {formatPrice(actualMintCost)}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            • <strong>25 completions:</strong> <span style={{ color: getROIColor(calculateRecovered(50), actualMintCost) }}>ROI = {formatPrice(calculateRecovered(50))}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            • <strong>50 completions:</strong> <span style={{ color: getROIColor(calculateRecovered(100), actualMintCost) }}>ROI = {formatPrice(calculateRecovered(100))}</span>
          </div>
        </div>
      </div>

      {/* Facteurs de succès améliorés */}
      <div style={{ 
        background: 'rgba(0, 196, 108, 0.05)',
        borderRadius: 16,
        padding: 20,
        border: '1px solid rgba(0, 196, 108, 0.2)'
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#00C46C', marginBottom: 16 }}>
          🎬 Campaign Success Factors
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 12,
          fontSize: 14,
          color: '#ccc'
        }}>
          <div>• Compelling narrative</div>
          <div>• Clear instructions</div>
          <div>• Engaging rewards</div>
          <div>• Community building</div>
          <div>• Cross-channel promotion</div>
          <div>• Social media outreach</div>
        </div>
      </div>
    </div>
  );
};

export default function PricingBubbles({ options, totalPrice, flowType = 'B2C' }: PricingBubblesProps) {
  const mintTitle = flowType === 'AgencyB2C' ? 'Winstory MINT Agency B2C' : 'Winstory MINT B2C';
  const [showModal, setShowModal] = useState<string | null>(null);
  const [roiData, setRoiData] = useState<any>(null);
  
  // Format numbers European style (no commas)
  const formatPrice = (price: number) => `$${price}`;
  
  // Récupérer les données ROI depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRoiData = localStorage.getItem('roiData');
      if (storedRoiData) {
        try {
          const parsed = JSON.parse(storedRoiData);
          setRoiData(parsed);
        } catch (e) {
          console.error('Error parsing ROI data:', e);
        }
      }
    }
  }, []);

  // Calculer le ROI total si des récompenses sont configurées
  const hasRewards = roiData && !roiData.noReward && (roiData.unitValue > 0 || roiData.netProfit > 0);
  
  // Calculer le vrai coût du MINT (base 1000$ + option AI si sélectionnée)
  const baseMintCost = 1000;
  const aiOptionCost = options.find(opt => opt.isSelected && opt.label.includes('Winstory creates')) ? 500 : 0;
  const actualMintCost = baseMintCost + aiOptionCost;
  
  // ROI total = MINT réel + Net Profits
  const totalROI = hasRewards ? (actualMintCost + (roiData?.netProfit || 0)) : 0;
  
  const getModalContent = (type: string) => {
    switch (type) {
      case 'mint':
        return {
          title: mintTitle,
          content: `This is the base cost for creating your story on the Winstory platform. This includes:
          
• Story creation and hosting
• Community access to your story
• Moderation system
• Basic analytics and reporting
• 7-day campaign duration
• IPFS storage for your content`
        };
      case 'ai':
        return {
          title: 'AI Film Creation',
          content: `🎬 Transform your story into professional content without the hassle

✨ Why choose this option?
• Skip the complexity of video production
• No need for expensive equipment or editing skills  
• Guaranteed professional quality that represents your brand
• Focus on your business while we handle the creative work
• Perfect for busy entrepreneurs who want results fast

🚀 What you get:
• AI-generated film tailored to your Starting Story
• Professional editing with brand-appropriate aesthetics
• Optimized for social media and maximum engagement
• Delivered within 24h - no delays, no excuses
• Ready-to-use content that drives community participation

💡 Perfect for: Companies who want to launch fast without creative bottlenecks`
        };
      case 'norewards':
        return {
          title: 'No Rewards Setup',
          content: `🔥 Maximize viral potential and organic reach without reward complexity

💰 Why this drives better ROI?
• Pure focus on viral content creation
• Community creates for passion, not prizes = authentic engagement
• Zero reward management overhead or logistics
• Maximum budget allocation to visibility and reach
• Unlimited participation = unlimited content potential

🎯 Viral Marketing Benefits:
• Authentic user-generated content at scale
• Organic social media amplification
• Real customer testimonials and stories
• Community-driven brand advocacy
• Content that feels genuine, not incentivized

📈 Business Impact:
• Higher engagement rates (passion > rewards)
• Massive content library for future marketing
• Extended campaign visibility on Winstory platform
• Pure brand awareness without transaction costs

🚀 Perfect for: Brands prioritizing viral reach and authentic community engagement`
        };
      case 'total':
        return {
          title: 'Total Amount Breakdown',
          content: `This is your final payment amount which includes:
          
• Base Winstory MINT service: $1000
${options.find(opt => opt.isSelected && opt.label.includes('Winstory creates')) ? '• AI Film Creation: +$500' : ''}
${options.find(opt => opt.isSelected && opt.label.includes('No rewards')) ? '• No Rewards Setup: +$1000' : ''}

${hasRewards ? `\n💚 Potential ROI at 100% Completions: $${totalROI.toFixed(2)}
This represents your actual MINT cost ($${actualMintCost}) + Net Profits ($${roiData?.netProfit || 0}) if all completions are achieved.` : ''}

Payment is processed securely through our trusted partners. Your campaign will be activated immediately after successful payment verification.`
        };
      case 'roi':
        return null; // Pas de contenu pour ROI, géré par ROIModalContent
      default:
        return { title: '', content: '' };
    }
  };
  
  // Check if there are any selected options to show the OPTIONS label
  const hasSelectedOptions = options.some(option => option.isSelected);
  
  return (
    <div style={{ 
      marginBottom: 32, 
      maxWidth: 420, 
      width: '100%' 
    }}>
      {/* Title */}
      <h2 style={{ 
        color: '#FFD600', 
        fontSize: 24, 
        fontWeight: 700, 
        marginBottom: 20, 
        textAlign: 'center' 
      }}>
        Pricing Details
      </h2>

      {/* Base MINT cost - Harmonized with options */}
      <div 
        onClick={() => setShowModal('mint')}
        style={{
          background: 'rgba(255, 214, 0, 0.2)', // More transparent than options but still golden
          borderRadius: 16,
          padding: '14px 18px',
          marginTop: 0,
          marginBottom: 14,
          marginLeft: 0,
          marginRight: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 16px rgba(255, 214, 0, 0.25)',
          border: '2px solid rgba(255, 214, 0, 0.5)', // Slightly thicker border to maintain importance
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          width: '85%'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 214, 0, 0.6)';
          e.currentTarget.style.filter = 'brightness(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 214, 0, 0.25)';
          e.currentTarget.style.filter = 'brightness(1)';
        }}
      >
        <div>
          <div style={{ 
            color: '#FFD600', // Same golden color as options
            fontWeight: 700, 
            fontSize: 15 
          }}>
            {mintTitle}
          </div>
        </div>
        <div style={{ 
          color: '#FFD600', // Same golden color as options
          fontWeight: 700, 
          fontSize: 17 
        }}>
          {formatPrice(1000)}
        </div>
      </div>

      {/* Optional features bubbles with individual OPTION labels */}
      {options
        .filter(option => option.isSelected)
        .sort((a, b) => b.price - a.price) // Sort by price descending (highest first)
        .map((option, index) => (
          <div key={index} style={{ position: 'relative', marginBottom: 6, marginTop: index === 0 ? 12 : 0 }}>
            {/* OPTION Label - Positioned outside main alignment */}
            <div style={{
              position: 'absolute',
              left: -75,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1
            }}>
              <span style={{
                color: '#FFD600',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
                background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
                border: '1px solid rgba(255, 214, 0, 0.3)',
                borderRadius: 8,
                padding: '4px 8px',
                display: 'inline-block',
                whiteSpace: 'nowrap' as const
              }}>
                OPTION
              </span>
            </div>
            
            {/* Option Element - Aligned with other elements, consistent style */}
            <div 
              onClick={() => setShowModal(option.label.includes('Winstory creates') ? 'ai' : 'norewards')}
              style={{
                background: 'rgba(255, 214, 0, 0.12)', // Same background for both options
                borderRadius: 12,
                padding: '10px 14px',
                marginTop: 0,
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(255, 214, 0, 0.3)', // Same border for both options
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '80%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 214, 0, 0.4)'; // Same hover effect
                e.currentTarget.style.filter = 'brightness(1.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              <div>
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {option.label.includes('Winstory creates') ? (
                    <span style={{ color: '#FFD600' }}>
                      AI Film Creation
                      {option.label.includes(' - Horizontal') && ' - Horizontal'}
                      {option.label.includes(' - Vertical') && ' - Vertical'}
                    </span>
                  ) : (
                    <span style={{ color: '#FFD600' }}>No Rewards Setup</span>
                  )}
                </div>
                <div style={{ 
                  color: '#fff', 
                  fontSize: 11, 
                  fontStyle: 'italic' 
                }}>
                  {option.label.includes('Winstory creates') 
                    ? 'Winstory creates the film based on your story within 24h' 
                    : 'Free community access'
                  }
                </div>
              </div>
              <div style={{ 
                color: '#FFD600', // Same color for both options
                fontWeight: 700, 
                fontSize: 14 
              }}>
                +{formatPrice(option.price)}
              </div>
            </div>
          </div>
        )
      )}

      {/* Total cost bubble - Full width, prominent with hover */}
      <div 
        onClick={() => setShowModal('total')}
        style={{
          background: 'linear-gradient(135deg, #000 0%, #333 100%)',
          borderRadius: 24,
          padding: '32px',
          marginTop: 28,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '2px solid #FFD600',
          boxShadow: '0 12px 40px rgba(255, 214, 0, 0.5)',
          position: 'relative' as const,
          width: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(255, 214, 0, 0.7)';
          e.currentTarget.style.filter = 'brightness(1.1)';
          e.currentTarget.style.borderColor = '#FFA500';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 214, 0, 0.5)';
          e.currentTarget.style.filter = 'brightness(1)';
          e.currentTarget.style.borderColor = '#FFD600';
        }}
      >
        <div>
          <div style={{ 
            color: '#FFD600', 
            fontWeight: 700, 
            fontSize: 28 
          }}>
            Total
          </div>
          <div style={{ 
            color: '#fff', 
            fontSize: 14 
          }}>
            Due at payment
          </div>
        </div>
        <div style={{ 
          color: '#FFD600', 
          fontWeight: 700, 
          fontSize: 36 
        }}>
          {formatPrice(totalPrice)}
        </div>
      </div>

      {/* ROI Information - Affiché en vert si des récompenses sont configurées */}
      {hasRewards && (
        <div 
          onClick={() => setShowModal('roi')}
          style={{
            background: 'rgba(0, 196, 108, 0.08)', // Plus transparent mais reste visible
            border: '1px solid rgba(0, 196, 108, 0.3)', // Bordure plus subtile
            borderRadius: 24, // Même que "Total Due at payment"
            padding: '32px', // Même que "Total Due at payment"
            marginTop: 16,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            width: '100%', // Même largeur que "Total Due at payment"
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 196, 108, 0.15)', // Ombre plus subtile
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer', // Curseur pointer pour indiquer qu'il est cliquable
            transition: 'all 0.3s ease' // Transition pour les effets hover
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 196, 108, 0.4)';
            e.currentTarget.style.filter = 'brightness(1.1)';
            e.currentTarget.style.borderColor = 'rgba(0, 196, 108, 0.6)';
            e.currentTarget.style.background = 'rgba(0, 196, 108, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 196, 108, 0.15)';
            e.currentTarget.style.filter = 'brightness(1)';
            e.currentTarget.style.borderColor = 'rgba(0, 196, 108, 0.3)';
            e.currentTarget.style.background = 'rgba(0, 196, 108, 0.08)';
          }}
        >
          {/* Liseré vert en haut et en bas */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 196, 108, 0.6), transparent)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 196, 108, 0.6), transparent)'
          }} />
          
          <div style={{ 
            color: '#00C46C', 
            fontWeight: 700, 
            fontSize: 16,
            marginBottom: 4
          }}>
            If 100% Completions:
          </div>
          <div style={{ 
            color: '#00C46C', 
            fontWeight: 700, 
            fontSize: 20
          }}>
            Total ROI: {formatPrice(totalROI)}
          </div>
          <div style={{ 
            color: '#00C46C', 
            fontSize: 12,
            marginTop: 4,
            opacity: 0.8
          }}>
            MINT (${actualMintCost}) + Net Profits (${formatPrice(roiData?.netProfit || 0)})
          </div>
        </div>
      )}

      {/* Modal Pop-up */}
      {showModal && (
        <div
          style={{
            position: 'fixed' as const,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
          }}
          onClick={() => setShowModal(null)}
        >
          <div
            style={{
              background: '#111',
              color: '#fff',
              padding: 32,
              borderRadius: 20,
              minWidth: 400,
              maxWidth: 600,
              textAlign: 'left' as const,
              position: 'relative' as const,
              maxHeight: '80vh',
              overflowY: 'auto' as const,
              border: '2px solid #FFD600',
              boxShadow: '0 12px 48px rgba(255, 214, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {showModal === 'roi' ? (
              <ROIModalContent 
                actualMintCost={actualMintCost}
                totalROI={totalROI}
                roiData={roiData}
                aiOptionCost={aiOptionCost}
                onClose={() => setShowModal(null)}
              />
            ) : (
              <>
                <button 
                  onClick={() => setShowModal(null)} 
                  style={{ 
                    position: 'absolute' as const, 
                    top: 16, 
                    right: 16, 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: '#F31260',
                    fontSize: 24,
                    fontWeight: 'bold'
                  }}
                >
                  ✕
                </button>

                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: '#FFD600' }}>
                  {getModalContent(showModal)?.title || ''}
                </div>

                <div style={{ 
                  fontSize: 16, 
                  lineHeight: 1.6, 
                  color: '#fff',
                  whiteSpace: 'pre-line' as const
                }}>
                  {getModalContent(showModal)?.content || ''}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 