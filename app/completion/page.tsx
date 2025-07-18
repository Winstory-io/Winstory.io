"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CompletionPopup from '../../components/CompletionPopup';

const CompletionPage = () => {
  const [activeTab, setActiveTab] = useState<'b2c' | 'individual'>('b2c');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const router = useRouter();

  // Placeholder identity
  const companyIdentity = '@Company';
  const individualIdentity = '@0x12...89AB';

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#FFD600', fontFamily: 'inherit', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 0 24px' }}>
        {/* Logo à gauche */}
        <Image src="/individual.svg" alt="logo" width={56} height={56} style={{ borderRadius: '50%' }} />
        {/* Titre + tooltip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center', position: 'relative' }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: '#FFD600', letterSpacing: 1 }}>Complete</span>
          <button onClick={() => setShowTooltip(true)} style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer' }}>
            <Image src="/tooltip.svg" alt="tooltip" width={32} height={32} />
          </button>
        </div>
        {/* Croix rouge à droite */}
        <button onClick={() => router.push('/welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: 40, color: '#FF2D2D', fontWeight: 700, lineHeight: 1 }}>&times;</span>
        </button>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 32 }}>
        <button
          onClick={() => setActiveTab('b2c')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'b2c' ? '#FFD600' : '#6A5F1C',
            fontWeight: 700,
            fontSize: 22,
            borderBottom: activeTab === 'b2c' ? '3px solid #FFD600' : 'none',
            cursor: 'pointer',
            paddingBottom: 4,
            transition: 'color 0.2s',
          }}
        >
          B2C Companies
        </button>
        <button
          onClick={() => setActiveTab('individual')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'individual' ? '#FFD600' : '#6A5F1C',
            fontWeight: 700,
            fontSize: 22,
            borderBottom: activeTab === 'individual' ? '3px solid #FFD600' : 'none',
            cursor: 'pointer',
            paddingBottom: 4,
            transition: 'color 0.2s',
          }}
        >
          Individuals
        </button>
      </div>

      {/* Identité + info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 32 }}>
        <div style={{ background: '#FFD600', color: '#222', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 20 }}>
          {activeTab === 'b2c' ? companyIdentity : individualIdentity}
        </div>
        <button onClick={() => setShowInfo(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ background: '#FFD600', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#111', fontWeight: 700, fontSize: 38, fontFamily: 'serif' }}>i</span>
          </div>
        </button>
      </div>
      {/* Titre de campagne (placeholder) */}
      <div style={{ textAlign: 'center', marginTop: 8, fontStyle: 'italic', color: '#FFD600', fontSize: 18 }}>Title</div>

      {/* Vidéo (placeholder responsive) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
        <div style={{ width: '90vw', maxWidth: 700, aspectRatio: '16/9', background: 'linear-gradient(135deg,#FFD600 60%,#111 100%)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 80, color: '#111', opacity: 0.3 }}>&#9654;</span>
        </div>
      </div>

      {/* Bouton Complete */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
        <button
          onClick={() => setShowComplete(true)}
          style={{ background: '#4ECB71', color: '#111', fontWeight: 700, fontSize: 26, border: 'none', borderRadius: 16, padding: '16px 48px', cursor: 'pointer', boxShadow: '0 2px 8px #0008' }}
        >
          Complete
        </button>
      </div>

      {/* Pop-ups (vides pour l'instant) */}
      {showTooltip && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000A', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowTooltip(false)}>
          <div style={{ background: '#222', color: '#FFD600', padding: 32, borderRadius: 18, minWidth: 320 }}>Tooltip (à paramétrer)</div>
        </div>
      )}
      {showInfo && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000A', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowInfo(false)}>
          <div style={{ background: '#222', color: '#FFD600', padding: 32, borderRadius: 18, minWidth: 320 }}>Infos campagne (à paramétrer)</div>
        </div>
      )}
      {showComplete && (
        <CompletionPopup open={showComplete} onClose={() => setShowComplete(false)} />
      )}
    </div>
  );
};

export default CompletionPage;
