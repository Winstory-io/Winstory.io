// TODO: Améliorer la configuration IPFS globale pour le MINT (à faire ultérieurement)
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PricingBubbles from "@/components/PricingBubbles";
import StripePaymentModal from "@/components/StripePaymentModal";

export default function MintPage() {
  const router = useRouter();
  const [totalPrice, setTotalPrice] = useState(1000);
  const [pricingOptions, setPricingOptions] = useState([
    {
      label: "Winstory creates the film",
      price: 500,
      isSelected: false,
      description: "AI-generated film based on your story"
    },
    {
      label: "No rewards to give",
      price: 1000,
      isSelected: false,
      description: "Free completions for the community"
    }
  ]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    try {
      // Vérifier le contexte actuel du workflow plutôt que juste la présence de agencyB2CContext
      // Si on vient du workflow agencyb2c (via l'URL ou le contexte), rediriger
      const currentFlow = localStorage.getItem("currentCreationFlow");
      const agencyContext = localStorage.getItem("agencyB2CContext");
      
      // Rediriger UNIQUEMENT si on est explicitement dans le flow agencyb2c
      // Vérifier aussi l'URL pour être sûr
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        // Si l'URL contient agencyb2c, on est déjà au bon endroit (mais on devrait être dans agencyb2c/mint)
        if (pathname.includes('/agencyb2c/')) {
          router.replace("/creation/agencyb2c/mint");
          return;
        }
      }
      
      // Si le flow actuel est AgencyB2C ET qu'on a un contexte agency, rediriger
      if (currentFlow === "AgencyB2C" && agencyContext) {
        router.replace("/creation/agencyb2c/mint");
        return;
      }
      
      // Mark current flow to avoid cross-session confusion
      localStorage.setItem("currentCreationFlow", "B2C");
      
      // Récupérer l'email de l'utilisateur
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setUserEmail(parsed.email || '');
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    } catch {}

    // Récupérer les données du localStorage pour déterminer le prix
    const filmData = localStorage.getItem("film");
    const campaignRewardData = localStorage.getItem("campaignReward");
    const roiData = localStorage.getItem("roiData");
    
    // Vérifier les récompenses sélectionnées
    const standardToken = localStorage.getItem("standardTokenReward");
    const standardItem = localStorage.getItem("standardItemReward");
    const premiumToken = localStorage.getItem("premiumTokenReward");
    const premiumItem = localStorage.getItem("premiumItemReward");
    
    const hasStandard = !!(standardToken || standardItem);
    const hasPremium = !!(premiumToken || premiumItem);
    
    let aiRequested = false;
    let videoFormat: 'horizontal' | 'vertical' | null = null;
    let noRewards = false;
    
    if (filmData) {
      const film = JSON.parse(filmData);
      aiRequested = film.aiRequested || false;
      videoFormat = film.format || null;
    }
    
    // Vérifier si "No rewards" est sélectionné
    // No rewards est vrai UNIQUEMENT si explicitement choisi ET aucune récompense n'est configurée
    if (campaignRewardData) {
      const campaignReward = JSON.parse(campaignRewardData);
      noRewards = (campaignReward.rewardType === 'none' || 
                  campaignReward.rewardLabel?.includes('No Reward')) && 
                  !hasStandard && !hasPremium;
    }
    
    // Vérifier aussi dans roiData
    if (roiData) {
      const roi = JSON.parse(roiData);
      // noReward doit être true ET aucune récompense configurée
      if (roi.noReward === true && !hasStandard && !hasPremium) {
        noRewards = true;
      }
    }
    
    // Construire le label pour l'option AI avec le format
    let aiLabel = "Winstory creates the film";
    if (aiRequested && videoFormat) {
      aiLabel = `Winstory creates the film - ${videoFormat === 'horizontal' ? 'Horizontal' : 'Vertical'}`;
    }
    
    // Mettre à jour les options de prix
    setPricingOptions([
      {
        label: aiLabel,
        price: 500,
        isSelected: aiRequested,
        description: "AI-generated film based on your story"
      },
      {
        label: "No rewards to give",
        price: 1000,
        isSelected: noRewards,
        description: "Free completions for the community"
      }
    ]);
    
    // Calculer le prix total
    let price = 1000; // Prix de base
    if (aiRequested) price += 500;
    if (noRewards) price += 1000;
    
    setTotalPrice(price);
    
    // Stocker le prix final pour le paiement
    localStorage.setItem("finalPrice", price.toString());
  }, [router]);

  const handlePaymentMethod = (method: string) => {
    console.log('=== CREATE CAMPAIGN - Step 6: MINT & Payment ===');
    console.log('Payment Method Selected:', method);
    console.log('Total Price:', totalPrice, 'USD');
    console.log('Pricing Options:', pricingOptions.filter(opt => opt.isSelected).map(opt => opt.label));
    console.log('User Email:', userEmail);
    console.log('==========================================');
    
    // Stocker la méthode de paiement choisie
    localStorage.setItem("paymentMethod", method);
    
    if (method === 'USDC_Base') {
      // TODO: Implement USDC payment (coming soon)
      alert('USDC payment will be available soon!');
    } else {
      // For all other payment methods (Card, Stripe, PayPal, etc.), use Stripe
      setIsPaymentModalOpen(true);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: 'center', marginBottom: 24, width: '100%' }}>
        <img src="/company.svg" alt="Company" style={{ width: 96, height: 96, marginRight: 16 }} />
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, textAlign: 'center' }}>MINT</h1>
      </div>
      
      {/* Desktop Layout - Two columns */}
      <div style={{ 
        display: 'flex', 
        gap: 48, 
        maxWidth: 1200, 
        width: '100%',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }}>
        {/* Left Column - Pricing */}
        <div style={{ flex: 1, minWidth: 420 }}>
          <PricingBubbles options={pricingOptions} totalPrice={totalPrice} flowType="B2C" />
        </div>
        
        {/* Right Column - Payment Methods */}
        <div style={{ flex: 1, minWidth: 420 }}>
          <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, width: '100%', background: '#181818', boxShadow: '0 4px 32px rgba(24,201,100,0.10)' }}>
            <h2 style={{ color: '#FFD600', fontWeight: 700, fontSize: 22, marginBottom: 20, textAlign: 'center' }}>Choose your payment method</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* USDC */}
              <button 
                onClick={() => handlePaymentMethod('USDC_Base')}
                style={{ background: 'none', border: '2px solid #18C964', color: '#18C964', borderRadius: 16, fontSize: 16, fontWeight: 700, padding: '12px 0', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(24, 201, 100, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                USDC (Base)
              </button>
              {/* Credit card */}
              <button 
                onClick={() => handlePaymentMethod('Credit_Card')}
                style={{ background: 'none', border: '2px solid #FFD600', color: '#FFD600', borderRadius: 16, fontSize: 16, fontWeight: 700, padding: '12px 0', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 214, 0, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                Visa / Mastercard
              </button>
              {/* Stripe */}
              <button 
                onClick={() => handlePaymentMethod('Stripe')}
                style={{ background: 'none', border: '2px solid #fff', color: '#fff', borderRadius: 16, fontSize: 16, fontWeight: 700, padding: '12px 0', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                Stripe
              </button>
              {/* Paypal */}
              <button 
                onClick={() => handlePaymentMethod('PayPal')}
                style={{ background: 'none', border: '2px solid #0070ba', color: '#0070ba', borderRadius: 16, fontSize: 16, fontWeight: 700, padding: '12px 0', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 112, 186, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                PayPal
              </button>
              {/* Google Pay */}
              <button 
                onClick={() => handlePaymentMethod('Google_Pay')}
                style={{ background: 'none', border: '2px solid #34A853', color: '#34A853', borderRadius: 16, fontSize: 16, fontWeight: 700, padding: '12px 0', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(52, 168, 83, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                Google Pay
              </button>
              {/* Apple Pay */}
              <button 
                onClick={() => handlePaymentMethod('Apple_Pay')}
                style={{ background: 'none', border: '2px solid #fff', color: '#fff', borderRadius: 16, fontSize: 16, fontWeight: 700, padding: '12px 0', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                Apple Pay
              </button>
            </div>
            <div style={{ marginTop: 20, color: '#888', fontSize: 13, textAlign: 'center' }}>
              Payments are secure and processed via our partners.<br/>You will receive your video within 24h after validation.
            </div>
          </div>
        </div>
      </div>
      
      {/* Back Button */}
      <button onClick={() => router.back()} style={{ background: 'none', border: '2px solid #fff', color: '#fff', borderRadius: 32, fontSize: 18, fontWeight: 700, padding: '10px 32px', cursor: 'pointer', marginTop: 32 }}>Back</button>
      
      {/* Modal de paiement Stripe */}
      <StripePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={totalPrice}
        flowType="b2c"
        userEmail={userEmail}
        metadata={{
          pricingOptions: pricingOptions.filter(opt => opt.isSelected).map(opt => opt.label),
        }}
      />
    </div>
  );
} 