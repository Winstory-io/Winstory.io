"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function MintPage() {
  const router = useRouter();
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Titre */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: 'center', marginBottom: 32, width: '100%' }}>
        <span style={{ fontSize: 48, marginRight: 16 }}>💳</span>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, textAlign: 'center' }}>MINT</h1>
      </div>
      {/* Encadré paiement */}
      <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 32, maxWidth: 420, width: '100%', background: '#181818', marginBottom: 40, boxShadow: '0 4px 32px rgba(24,201,100,0.10)' }}>
        <h2 style={{ color: '#FFD600', fontWeight: 700, fontSize: 24, marginBottom: 24, textAlign: 'center' }}>Choisissez votre méthode de paiement</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* USDC */}
          <button style={{ background: 'none', border: '2px solid #18C964', color: '#18C964', borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🪙</span> USDC (Polygon)
          </button>
          <button style={{ background: 'none', border: '2px solid #18C964', color: '#18C964', borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🪙</span> USDC (Base)
          </button>
          {/* Carte bancaire */}
          <button style={{ background: 'none', border: '2px solid #FFD600', color: '#FFD600', borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>💳</span> Visa / Mastercard
          </button>
          {/* Stripe */}
          <button style={{ background: 'none', border: '2px solid #fff', color: '#fff', borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🌐</span> Stripe
          </button>
          {/* Paypal */}
          <button style={{ background: 'none', border: '2px solid #0070ba', color: '#0070ba', borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🅿️</span> Paypal
          </button>
          {/* Google Pay */}
          <button style={{ background: 'none', border: '2px solid #34A853', color: '#34A853', borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🟩</span> Google Pay
          </button>
          {/* Apple Pay */}
          <button style={{ background: 'none', border: '2px solid #fff', color: '#fff', borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🍏</span> Apple Pay
          </button>
        </div>
        <div style={{ marginTop: 32, color: '#888', fontSize: 14, textAlign: 'center' }}>
          Les paiements sont sécurisés et traités via nos partenaires.<br/>Vous recevrez votre vidéo sous 24h après validation.
        </div>
      </div>
      {/* Retour */}
      <button onClick={() => router.back()} style={{ background: 'none', border: '2px solid #fff', color: '#fff', borderRadius: 32, fontSize: 18, fontWeight: 700, padding: '10px 32px', cursor: 'pointer', marginTop: 16 }}>Retour</button>
    </div>
  );
} 