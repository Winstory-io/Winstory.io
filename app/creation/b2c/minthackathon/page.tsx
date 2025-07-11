"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function MintHackathonPage() {
  const router = useRouter();
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: 'center', marginBottom: 32, width: '100%' }}>
        <span style={{ fontSize: 48, marginRight: 16 }}>💳</span>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, textAlign: 'center' }}>MINT</h1>
      </div>
      {/* Payment box */}
      <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 32, maxWidth: 420, width: '100%', background: '#181818', marginBottom: 40, boxShadow: '0 4px 32px rgba(24,201,100,0.10)' }}>
        <h2 style={{ color: '#FFD600', fontWeight: 700, fontSize: 24, marginBottom: 24, textAlign: 'center' }}>Choose your payment method</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Disabled payment buttons */}
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🪙</span> USDC (Polygon)
          </button>
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🪙</span> USDC (Base)
          </button>
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>💳</span> Visa / Mastercard
          </button>
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🌐</span> Stripe
          </button>
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🅿️</span> Paypal
          </button>
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🟩</span> Google Pay
          </button>
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🍏</span> Apple Pay
          </button>
          {/* Hackathon Chiliz FREE button */}
          <button style={{ background: 'none', border: '2px solid #FF2D85', color: '#FF2D85', borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'pointer', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            Hackathon Chiliz FREE 🌶️
          </button>
        </div>
        <div style={{ marginTop: 32, color: '#888', fontSize: 14, textAlign: 'center' }}>
          Payments are secured and processed via our partners.<br/>You will receive your video within 24h after validation.
        </div>
      </div>
      {/* Back */}
      <button onClick={() => router.back()} style={{ background: 'none', border: '2px solid #fff', color: '#fff', borderRadius: 32, fontSize: 18, fontWeight: 700, padding: '10px 32px', cursor: 'pointer', marginTop: 16 }}>Back</button>
      {/* TODO: Integrate IPFS logic here for Hackathon button */}
    </div>
  );
} 