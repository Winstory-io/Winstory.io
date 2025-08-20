"use client";
import React, { useState } from 'react';

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

export default function PricingBubbles({ options, totalPrice, flowType = 'B2C' }: PricingBubblesProps) {
  const mintTitle = flowType === 'AgencyB2C' ? 'Winstory MINT Agency B2C' : 'Winstory MINT B2C';
  const [showModal, setShowModal] = useState<string | null>(null);
  
  // Format numbers European style (no commas)
  const formatPrice = (price: number) => `$${price}`;
  
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

Payment is processed securely through our trusted partners. Your campaign will be activated immediately after successful payment verification.`
        };
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
                  color: '#FFD600', // Same color for both options
                  fontWeight: 600, 
                  fontSize: 13 
                }}>
                  {option.label.includes('Winstory creates') ? 'AI Film Creation' : 'No Rewards Setup'}
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
              {getModalContent(showModal).title}
            </div>

            <div style={{ 
              fontSize: 16, 
              lineHeight: 1.6, 
              color: '#fff',
              whiteSpace: 'pre-line' as const
            }}>
              {getModalContent(showModal).content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 