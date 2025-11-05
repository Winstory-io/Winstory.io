// TODO: Améliorer la configuration IPFS globale pour le MINT (à faire ultérieurement)
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PricingBubbles from "@/components/PricingBubbles";
import StripePaymentModal from "@/components/StripePaymentModal";

export default function AgencyB2CMintPage() {
  const router = useRouter();
  const [totalPrice, setTotalPrice] = useState(1000);
  const [pricingOptions, setPricingOptions] = useState([
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
    // Only access localStorage on client side
    if (typeof window === 'undefined') return;
    
    try {
      // Mark current flow as AgencyB2C to keep context coherent
      localStorage.setItem("currentCreationFlow", "AgencyB2C");
      
      // Récupérer l'email de l'utilisateur depuis localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setUserEmail(parsed.email || '');
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
      
      // Fallback: try to get from agency info
      if (!userEmail) {
        const agencyInfo = localStorage.getItem("agencyB2CContext");
        if (agencyInfo) {
          try {
            const parsed = JSON.parse(agencyInfo);
            setUserEmail(parsed.agency?.email || '');
          } catch (e) {
            console.error('Failed to parse agency info:', e);
          }
        }
      }
    } catch {}

    // Récupérer les données nécessaires du localStorage (sans utiliser les clés legacy de B2C)
    const roiDataRaw = localStorage.getItem("roiData");
    const standardTokenRaw = localStorage.getItem("standardTokenReward");
    const standardItemRaw = localStorage.getItem("standardItemReward");
    const premiumTokenRaw = localStorage.getItem("premiumTokenReward");
    const premiumItemRaw = localStorage.getItem("premiumItemReward");
    // Vérifier aussi les récompenses Digital et Physical Access
    const standardDigitalAccess = localStorage.getItem("standardDigitalAccessReward");
    const premiumDigitalAccess = localStorage.getItem("premiumDigitalAccessReward");
    const standardPhysicalAccess = localStorage.getItem("standardPhysicalAccessReward");
    const premiumPhysicalAccess = localStorage.getItem("premiumPhysicalAccessReward");

    const roi = roiDataRaw ? JSON.parse(roiDataRaw) : null;
    const hasStandard = !!(standardTokenRaw || standardItemRaw || standardDigitalAccess || standardPhysicalAccess);
    const hasPremium = !!(premiumTokenRaw || premiumItemRaw || premiumDigitalAccess || premiumPhysicalAccess);

    // "No rewards" uniquement si explicitement choisi ET aucune config de récompense n'existe
    const noRewards = roi?.noReward === true && !hasStandard && !hasPremium;

    // Mettre à jour les options de prix (aucune option AI dans le flux agence)
    setPricingOptions([
      {
        label: "No rewards to give",
        price: 1000,
        isSelected: noRewards,
        description: "Free completions for the community"
      }
    ]);

    // Calculer le prix total (base + éventuel supplément "no rewards")
    let price = 1000; // Prix de base
    if (noRewards) price += 1000;

    setTotalPrice(price);

    // Stocker le prix final pour le paiement
    if (typeof window !== 'undefined') {
      localStorage.setItem("finalPrice", price.toString());
    }
  }, []);

  const handlePaymentMethod = (method: string) => {
    // Stocker la méthode de paiement choisie
    if (typeof window !== 'undefined') {
      localStorage.setItem("paymentMethod", method);
    }
    
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
          <PricingBubbles options={pricingOptions} totalPrice={totalPrice} flowType="AgencyB2C" />
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
        flowType="agencyb2c"
        userEmail={userEmail}
        metadata={{
          pricingOptions: pricingOptions.filter(opt => opt.isSelected).map(opt => opt.label),
          agencyName: typeof window !== 'undefined' ? localStorage.getItem("agencyName") || '' : '',
          clientB2CName: typeof window !== 'undefined' ? localStorage.getItem("clientB2CName") || '' : '',
        }}
      />
    </div>
  );
} 