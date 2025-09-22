"use client";

import { useActiveAccount } from 'thirdweb/react';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import DevControls from '@/components/DevControls';

// Types pour les données de modération active
interface BaseModerationData {
  id: string;
  type: 'initial' | 'completion';
  mintPrice: number;
  walletAddress: string;
  personalStaking: number;
  poolStaking: number;
  personalStakingPercentage: number;
  validatedVotes: number;
  refusedVotes: number;
  totalModerators: number;
  userVote: 'valid' | 'refuse' | null;
  conditions: {
    poolStakingExceedsMint: boolean;
    hybridRatioMet: boolean;
    moderatorThresholdMet: boolean;
  };
}

interface InitialModerationData extends BaseModerationData {
  type: 'initial';
}

interface CompletionModerationData extends BaseModerationData {
  type: 'completion';
  userScore: number; // Score que l'utilisateur a donné
  averageScore: number; // Score moyen de tous les modérateurs
}

type ModerationData = InitialModerationData | CompletionModerationData;

export default function MyModerationsPage() {
  const account = useActiveAccount();
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'staking' | 'influence'>('active');
  const [currentModerationIndex, setCurrentModerationIndex] = useState(0);
  
  // Données mock pour les modérations actives - combinées dans un seul tableau
  const [activeModerations, setActiveModerations] = useState<ModerationData[]>([
    {
      id: 'INIT_001',
      type: 'initial',
      mintPrice: 150,
      walletAddress: '0x9B28EP...75A0G9BR',
      personalStaking: 200,
      poolStaking: 2400,
      personalStakingPercentage: 8.3,
      validatedVotes: 12,
      refusedVotes: 3,
      totalModerators: 22,
      userVote: 'valid',
      conditions: {
        poolStakingExceedsMint: true,
        hybridRatioMet: true,
        moderatorThresholdMet: true,
      }
    },
    {
      id: 'COMP_001',
      type: 'completion',
      mintPrice: 100,
      walletAddress: '0x9B28EP...75A0G9BR',
      personalStaking: 150,
      poolStaking: 1800,
      personalStakingPercentage: 8.3,
      validatedVotes: 14,
      refusedVotes: 3,
      totalModerators: 22,
      userVote: 'valid',
      userScore: 88,
      averageScore: 86.5,
      conditions: {
        poolStakingExceedsMint: true,
        hybridRatioMet: true,
        moderatorThresholdMet: true,
      }
    },
    {
      id: 'COMP_002',
      type: 'completion',
      mintPrice: 75,
      walletAddress: '0x7A15BC...23F8D1AC',
      personalStaking: 100,
      poolStaking: 1200,
      personalStakingPercentage: 8.3,
      validatedVotes: 8,
      refusedVotes: 2,
      totalModerators: 15,
      userVote: 'valid',
      userScore: 92,
      averageScore: 89.2,
      conditions: {
        poolStakingExceedsMint: true,
        hybridRatioMet: true,
        moderatorThresholdMet: false,
      }
    }
  ]);

  // Données mock pour l'historique des modérations (finalisées)
  type FinalDecision = 'valid' | 'refuse';
  interface HistoryModerationData extends BaseModerationData {
    finalizedAt: string; // ISO date-time
    finalDecision: FinalDecision; // majorité hybride finale
    campaignName: string;
  }
  const [historyModerations, setHistoryModerations] = useState<HistoryModerationData[]>([]); // Commencer vide
  const [initialHistoryData] = useState<HistoryModerationData[]>([
    {
      id: 'HIST_INIT_101',
      type: 'initial',
      mintPrice: 120,
      walletAddress: '0x9B28EP...75A0G9BR',
      personalStaking: 180,
      poolStaking: 2200,
      personalStakingPercentage: 8.2,
      validatedVotes: 16,
      refusedVotes: 6,
      totalModerators: 22,
      userVote: 'valid',
      conditions: { poolStakingExceedsMint: true, hybridRatioMet: true, moderatorThresholdMet: true },
      finalizedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      finalDecision: 'valid',
      campaignName: 'Campaign A'
    },
    {
      id: 'HIST_COMP_202',
      type: 'completion',
      mintPrice: 95,
      walletAddress: '0x7A15BC...23F8D1AC',
      personalStaking: 120,
      poolStaking: 1400,
      personalStakingPercentage: 8.6,
      validatedVotes: 7,
      refusedVotes: 12,
      totalModerators: 22,
      userVote: 'valid',
      conditions: { poolStakingExceedsMint: true, hybridRatioMet: true, moderatorThresholdMet: true },
      finalizedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      finalDecision: 'refuse',
      campaignName: 'Campaign B'
    },
    {
      id: 'HIST_INIT_303',
      type: 'initial',
      mintPrice: 160,
      walletAddress: '0x1111AA...2222BB',
      personalStaking: 90,
      poolStaking: 800,
      personalStakingPercentage: 11.3,
      validatedVotes: 9,
      refusedVotes: 13,
      totalModerators: 22,
      userVote: 'refuse',
      conditions: { poolStakingExceedsMint: false, hybridRatioMet: true, moderatorThresholdMet: true },
      finalizedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
      finalDecision: 'refuse',
      campaignName: 'Campaign C'
    },
    {
      id: 'HIST_COMP_404',
      type: 'completion',
      mintPrice: 70,
      walletAddress: '0x3333CC...4444DD',
      personalStaking: 140,
      poolStaking: 2100,
      personalStakingPercentage: 6.6,
      validatedVotes: 18,
      refusedVotes: 4,
      totalModerators: 22,
      userVote: 'refuse',
      conditions: { poolStakingExceedsMint: true, hybridRatioMet: true, moderatorThresholdMet: true },
      finalizedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
      finalDecision: 'valid',
      campaignName: 'Campaign D'
    }
  ]);

  // DevControls pour l'onglet History uniquement
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const HistoryDevControls = () => {
    // Initialiser la sélection
    useEffect(() => {
      if (!selectedHistoryId && historyModerations.length > 0) {
        setSelectedHistoryId(historyModerations[0].id);
      }
    }, [historyModerations.length]);

    const addItem = (preset: Partial<HistoryModerationData>) => {
      const base: HistoryModerationData = {
        id: `HIST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'initial',
        mintPrice: 100,
        walletAddress: '0xFAKE...WALLET',
        personalStaking: 120,
        poolStaking: 1500,
        personalStakingPercentage: 8.0,
        validatedVotes: 12,
        refusedVotes: 10,
        totalModerators: 22,
        userVote: 'valid',
        conditions: { poolStakingExceedsMint: true, hybridRatioMet: true, moderatorThresholdMet: true },
        finalizedAt: new Date().toISOString(),
        finalDecision: 'valid',
        campaignName: 'Campaign X'
      };
      
      // Appliquer le preset et ajuster les votes pour la cohérence si nécessaire
      const item = { ...base, ...preset } as HistoryModerationData;
      
      // Si on force une finalDecision, ajuster les votes pour être cohérent
      if (preset.finalDecision) {
        if (preset.finalDecision === 'valid') {
          item.validatedVotes = Math.max(item.validatedVotes, item.refusedVotes + 1);
        } else {
          item.refusedVotes = Math.max(item.refusedVotes, item.validatedVotes + 1);
        }
      }
      
      setHistoryModerations((prev) => [item, ...prev]);
    };

    const clearAll = () => setHistoryModerations([]);
    const resetToMock = () => setHistoryModerations(initialHistoryData);
    const removeFirst = () => setHistoryModerations((prev) => prev.slice(1));
    const shuffle = () => setHistoryModerations((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });

    // Form state pour édition détaillée
    const selected = historyModerations.find(m => m.id === selectedHistoryId) || null;
    const [form, setForm] = useState<Partial<HistoryModerationData>>({});
    useEffect(() => {
      if (selected) {
        setForm({ ...selected });
      }
    }, [selectedHistoryId]);

    const updateForm = (k: keyof HistoryModerationData, v: any) => setForm((f) => ({ ...f, [k]: v }));
    const applyToSelected = () => {
      if (!selected) return;
      setHistoryModerations((prev) => prev.map(m => m.id === selected.id ? { ...m, ...form } as HistoryModerationData : m));
    };
    const applyToAll = () => {
      setHistoryModerations((prev) => prev.map(m => ({ ...m, ...form } as HistoryModerationData)));
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ borderTop: '1px solid #333', paddingTop: 12, marginTop: 12 }}>
          <strong style={{ color: '#FFD600', fontSize: 14, marginBottom: 10, display: 'block' }}>
            🗂️ History Controls ({historyModerations.length} cards)
          </strong>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => addItem({ finalDecision: 'valid', userVote: 'valid', validatedVotes: 15, refusedVotes: 7 })} style={{ background: '#18C964', color: '#000', border: 'none', borderRadius: 4, padding: '6px 8px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>+ Add Win</button>
            <button onClick={() => addItem({ finalDecision: 'refuse', userVote: 'valid', validatedVotes: 8, refusedVotes: 14 })} style={{ background: '#FF4D4D', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 8px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>+ Add Lose</button>
            <button onClick={removeFirst} disabled={historyModerations.length === 0} style={{ background: historyModerations.length === 0 ? '#222' : '#AA1111', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 8px', fontSize: 12, cursor: historyModerations.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 700 }}>🗑️ Remove First</button>
            <button onClick={clearAll} disabled={historyModerations.length === 0} style={{ background: historyModerations.length === 0 ? '#222' : '#661111', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 8px', fontSize: 12, cursor: historyModerations.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 700 }}>🗑️ Clear All</button>
            <button onClick={shuffle} disabled={historyModerations.length < 2} style={{ background: historyModerations.length < 2 ? '#222' : '#333', color: '#FFD600', border: '1px solid #555', borderRadius: 4, padding: '6px 8px', fontSize: 12, cursor: historyModerations.length < 2 ? 'not-allowed' : 'pointer', fontWeight: 700 }}>🔀 Shuffle</button>
            <button onClick={resetToMock} style={{ background: '#333', color: '#FFD600', border: '1px solid #555', borderRadius: 4, padding: '6px 8px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>🔄 Reset to Mock</button>
          </div>
          {/* Edition détaillée */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 12, textAlign: 'left' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#C0C0C0', fontSize: 12 }}>Select card</label>
              <select value={selectedHistoryId ?? ''} onChange={(e) => setSelectedHistoryId(e.target.value)} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: 8 }}>
                {historyModerations.map(m => (<option key={m.id} value={m.id}>{m.campaignName} — {m.id}</option>))}
              </select>
            </div>
            <div>
              <label style={{ color: '#C0C0C0', fontSize: 12 }}>Campaign</label>
              <input value={String(form.campaignName ?? '')} onChange={(e) => updateForm('campaignName', e.target.value)} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: 8 }} />
            </div>
            <div>
              <label style={{ color: '#C0C0C0', fontSize: 12 }}>Type</label>
              <select value={String(form.type ?? 'initial')} onChange={(e) => updateForm('type', e.target.value as any)} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: 8 }}>
                <option value="initial">Initial</option>
                <option value="completion">Completion</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#C0C0C0', fontSize: 12 }}>User vote</label>
              <select value={String(form.userVote ?? 'valid')} onChange={(e) => updateForm('userVote', e.target.value as any)} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: 8 }}>
                <option value="valid">valid</option>
                <option value="refuse">refuse</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#C0C0C0', fontSize: 12 }}>Final decision</label>
              <select value={String(form.finalDecision ?? 'valid')} onChange={(e) => updateForm('finalDecision', e.target.value as any)} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: 8 }}>
                <option value="valid">valid</option>
                <option value="refuse">refuse</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#C0C0C0', fontSize: 12 }}>Mint Price</label>
              <input type="number" value={Number(form.mintPrice ?? 0)} onChange={(e) => updateForm('mintPrice', Number(e.target.value))} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: 8 }} />
            </div>
            <div>
              <label style={{ color: '#C0C0C0', fontSize: 12 }}>Personal staking</label>
              <input type="number" value={Number(form.personalStaking ?? 0)} onChange={(e) => updateForm('personalStaking', Number(e.target.value))} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: 8 }} />
            </div>
            <div>
              <label style={{ color: '#C0C0C0', fontSize: 12 }}>Pool staking</label>
              <input type="number" value={Number(form.poolStaking ?? 0)} onChange={(e) => updateForm('poolStaking', Number(e.target.value))} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: 8 }} />
            </div>
            <div>
              <label style={{ color: '#C0C0C0', fontSize: 12 }}>Validated votes</label>
              <input type="number" value={Number(form.validatedVotes ?? 0)} onChange={(e) => updateForm('validatedVotes', Number(e.target.value))} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: 8 }} />
            </div>
            <div>
              <label style={{ color: '#C0C0C0', fontSize: 12 }}>Refused votes</label>
              <input type="number" value={Number(form.refusedVotes ?? 0)} onChange={(e) => updateForm('refusedVotes', Number(e.target.value))} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: 8 }} />
            </div>
            <div>
              <label style={{ color: '#C0C0C0', fontSize: 12 }}>Total moderators</label>
              <input type="number" value={Number(form.totalModerators ?? 22)} onChange={(e) => updateForm('totalModerators', Number(e.target.value))} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: 8 }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#C0C0C0', fontSize: 12 }}>Finalized at</label>
              <input type="datetime-local" value={selected && form.finalizedAt ? (() => { try { const date = new Date(form.finalizedAt as string); return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16); } catch { return ''; } })() : ''} onChange={(e) => { try { const newDate = new Date(e.target.value); if (!isNaN(newDate.getTime())) { updateForm('finalizedAt', newDate.toISOString()); } } catch { } }} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: 8 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <button onClick={applyToSelected} disabled={!selected} style={{ background: !selected ? '#222' : '#18C964', color: !selected ? '#666' : '#000', border: 'none', borderRadius: 4, padding: '8px 10px', fontSize: 12, cursor: !selected ? 'not-allowed' : 'pointer', fontWeight: 800 }}>Apply to selected</button>
            <button onClick={applyToAll} disabled={historyModerations.length === 0} style={{ background: historyModerations.length === 0 ? '#222' : '#FF9500', color: '#000', border: 'none', borderRadius: 4, padding: '8px 10px', fontSize: 12, cursor: historyModerations.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 800 }}>Apply to all</button>
          </div>
        </div>
      </div>
    );
  };

  // Navigation du carrousel
  const nextModeration = () => {
    setCurrentModerationIndex((prev) => 
      prev < activeModerations.length - 1 ? prev + 1 : 0
    );
  };

  const prevModeration = () => {
    setCurrentModerationIndex((prev) => 
      prev > 0 ? prev - 1 : activeModerations.length - 1
    );
  };

  const goToModeration = (index: number) => {
    setCurrentModerationIndex(index);
  };

  const separatorStyle = {
    height: 1,
    width: '85%',
    background: 'linear-gradient(90deg, rgba(255,214,0,0.9), rgba(255,255,255,0.5))'
  } as React.CSSProperties;

  const truncateAddress = (address: string) => {
    return address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
  };

  // Fonction pour rendre un cercle de modération stylisé
  const renderModerationCircle = (data: ModerationData) => {
    // Calculs des pourcentages basés sur les votes réels
    const totalVotes = data.validatedVotes + data.refusedVotes;
    const validPct = totalVotes > 0 ? (data.validatedVotes / totalVotes) * 100 : 0;
    const refusePct = totalVotes > 0 ? (data.refusedVotes / totalVotes) * 100 : 0;

    const size = 280; // Taille du cercle
    const stroke = 40; // Épaisseur du trait
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    
    // Ajouter un petit espacement entre les segments pour éviter les angles étranges
    const gap = totalVotes > 0 ? Math.min(8, circumference * 0.02) : 0;
    const validLen = totalVotes > 0 ? Math.max(0, (validPct / 100) * circumference - gap/2) : 0;
    const refuseLen = totalVotes > 0 ? Math.max(0, (refusePct / 100) * circumference - gap/2) : 0;

    // Calculer les positions des segments avec espacement
    const validOffset = 0;
    const refuseOffset = -(validLen + gap);

    // Déterminer les propriétés de la bulle de vote
    const getVoteBubbleProps = () => {
      switch (data.userVote) {
        case 'valid':
          return {
            background: 'rgba(34, 197, 94, 0.15)',
            border: '2px solid #22C55E',
            color: '#22C55E',
            text: 'Valid',
            emoji: '✅'
          };
        case 'refuse':
          return {
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid #EF4444',
            color: '#EF4444',
            text: 'Refuse',
            emoji: '❌'
          };
        default:
          return {
            background: 'rgba(156, 163, 175, 0.15)',
            border: '2px solid #9CA3AF',
            color: '#9CA3AF',
            text: 'Not voted',
            emoji: '⏳'
          };
      }
    };

    const bubbleProps = getVoteBubbleProps();

    return (
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Bulle de vote au-dessus */}
        <div style={{
          background: bubbleProps.background,
          border: bubbleProps.border,
          borderRadius: '20px',
          padding: '10px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backdropFilter: 'blur(10px)',
          boxShadow: `0 4px 20px ${bubbleProps.color}33`
        }}>
          <span style={{ fontSize: '18px' }}>{bubbleProps.emoji}</span>
          <span style={{ 
            color: bubbleProps.color, 
            fontSize: '15px', 
            fontWeight: 700 
          }}>
            Your Vote: {bubbleProps.text}
          </span>
        </div>

        {/* Cercle de modération moderne */}
        <div style={{ width: size, height: size, position: 'relative' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              {/* Gradients modernes pour les votes validés */}
              <linearGradient id="validGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="50%" stopColor="#16A34A" />
                <stop offset="100%" stopColor="#15803D" />
              </linearGradient>
              {/* Gradients modernes pour les votes refusés */}
              <linearGradient id="refuseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#B91C1C" />
              </linearGradient>
              {/* Gradient pour le fond */}
              <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#374151" />
                <stop offset="100%" stopColor="#1F2937" />
              </linearGradient>
              {/* Effets de glow */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="shadow">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(0,0,0,0.3)"/>
              </filter>
            </defs>
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              {/* Cercle de fond avec effet moderne */}
              <circle 
                cx={size / 2} 
                cy={size / 2} 
                r={radius} 
                fill="none" 
                stroke="url(#backgroundGradient)" 
                strokeWidth={stroke}
                opacity="0.15"
              />
              
              {/* Segment des votes validés */}
              {validLen > 0 && (
                <circle 
                  cx={size / 2} 
                  cy={size / 2} 
                  r={radius} 
                  fill="none" 
                  stroke="url(#validGradient)" 
                  strokeWidth={stroke} 
                  strokeDasharray={`${validLen} ${circumference - validLen}`} 
                  strokeDashoffset={validOffset}
                  strokeLinecap="round"
                  filter="url(#glow)"
                  style={{
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transformOrigin: 'center'
                  }}
                />
              )}
              
              {/* Segment des votes refusés */}
              {refuseLen > 0 && (
                <circle 
                  cx={size / 2} 
                  cy={size / 2} 
                  r={radius} 
                  fill="none" 
                  stroke="url(#refuseGradient)" 
                  strokeWidth={stroke} 
                  strokeDasharray={`${refuseLen} ${circumference - refuseLen}`} 
                  strokeDashoffset={refuseOffset}
                  strokeLinecap="round"
                  filter="url(#glow)"
                  style={{
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transformOrigin: 'center'
                  }}
                />
              )}
            </g>
          </svg>
          
          {/* Centre du donut avec informations */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            {/* Nombre total de votes avec couleur dynamique */}
            <div style={{
              fontSize: '36px',
              fontWeight: '900',
              color: totalVotes > 0 ? (validPct > refusePct ? '#22C55E' : validPct < refusePct ? '#EF4444' : '#FFD600') : '#666',
              textShadow: '0 0 10px rgba(0,0,0,0.5)',
              marginBottom: '4px'
            }}>
              {totalVotes}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#9CA3AF',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Total Votes
            </div>
            
            {/* Informations de staking */}
            <div style={{
              fontSize: '11px',
              color: '#FFD600',
              fontWeight: 600,
              marginBottom: '2px'
            }}>
              Personal: {data.personalStaking}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#FFFFFF',
              fontWeight: 700,
              marginBottom: '2px'
            }}>
              Pool: {data.poolStaking}
            </div>
            <div style={{
              fontSize: '10px',
              color: '#9CA3AF'
            }}>
              {data.personalStakingPercentage}%
            </div>
            
            {/* Pourcentages si votes présents */}
            {totalVotes > 0 && (
              <div style={{
                fontSize: '10px',
                color: '#6B7280',
                marginTop: '6px'
              }}>
                {validPct.toFixed(0)}% / {refusePct.toFixed(0)}%
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Rendu d'une carte d'historique (finalisée)
  const renderHistoryCard = (data: HistoryModerationData) => {
    const totalVotes = data.validatedVotes + data.refusedVotes;
    
    // Calculer la majorité basée sur les votes réels
    const majoritySide: FinalDecision = data.validatedVotes > data.refusedVotes ? 'valid' : 'refuse';
    
    // Utiliser la finalDecision telle quelle (permet les cas incohérents via Dev Controls)
    const finalDecision = data.finalDecision;
    
    // Le modérateur gagne s'il est dans la majorité (même vote que la décision finale)
    const isWinForStaker = data.userVote === finalDecision;
    
    // Couleur de la bulle = vote personnel du modérateur
    const voteBubbleColor = data.userVote === 'valid' ? '#18C964' : '#FF3333';
    
    // Couleur de la carte = victoire/défaite du modérateur (majorité/minorité)
    const cardBorderColor = isWinForStaker ? '#18C964' : '#FF3333';
    const cardGlow = isWinForStaker ? '0 0 24px rgba(24,201,100,0.25)' : '0 0 24px rgba(255,51,51,0.25)';
    
    // Debug: afficher les calculs
    console.log('Debug moderation:', {
      id: data.id,
      userVote: data.userVote,
      validatedVotes: data.validatedVotes,
      refusedVotes: data.refusedVotes,
      majoritySide,
      originalFinalDecision: data.finalDecision,
      correctedFinalDecision: finalDecision,
      isWinForStaker
    });



    const date = new Date(data.finalizedAt);
    const dateStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    return (
      <div style={{
        position: 'relative',
        background: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        border: `2px solid ${cardBorderColor}`,
        boxShadow: cardGlow,
        padding: 20,
        minWidth: 320,
      }}>
        {/* Good/Bad decision dans le coin supérieur droit */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          color: isWinForStaker ? '#18C964' : '#FF3333',
          fontWeight: 800,
          fontSize: 11,
          background: 'rgba(0,0,0,0.7)',
          padding: '4px 8px',
          borderRadius: 8,
          border: `1px solid ${isWinForStaker ? '#18C964' : '#FF3333'}`,
          backdropFilter: 'blur(4px)'
        }}>
          {isWinForStaker ? 'Good decision !' : 'Bad decision !'}
        </div>
        {/* Bulle de vote dans le coin supérieur gauche */}
        <div style={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 32,
          height: 32,
          borderRadius: 999,
          background: `${voteBubbleColor}22`,
          border: `2px solid ${voteBubbleColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: voteBubbleColor,
          fontWeight: 900,
          zIndex: 10
        }}>
          {data.userVote === 'valid' ? '✓' : '✗'}
        </div>
        
        {/* En-tête avec ID seulement */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 12, marginTop: 20, padding: '0 8px', paddingLeft: 48 }}>
          <div style={{ color: '#C0C0C0', fontSize: 12, fontWeight: 700 }}>ID: {data.id}</div>
        </div>

        <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(255,214,0,0.7), rgba(255,255,255,0.2))', margin: '8px 0' }} />

        {/* Corps */}
        <div style={{ color: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Campaign</div>
            <div style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 600, background: 'rgba(156, 163, 175, 0.1)', padding: '4px 8px', borderRadius: 6 }}>{data.type === 'initial' ? 'Initial' : 'Completion'}</div>
          </div>
          <div style={{ color: '#C0C0C0', fontSize: 12, marginTop: -6, marginBottom: 10 }}>{data.campaignName}</div>

          <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Snapshot personal staking :</div>
          <div style={{ fontSize: 14, marginBottom: 8 }}>{data.personalStaking}</div>

          <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Final pool staking :</div>
          <div style={{ fontSize: 14, marginBottom: 8 }}>{data.poolStaking}</div>

          <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>MINT Price</div>
          <div style={{ fontSize: 14, marginBottom: 12 }}>{data.mintPrice}</div>

          <div style={{ color: '#FFD600', fontWeight: 800, margin: '8px 0 6px 0' }}>Final requirements :</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
            <li style={{ color: '#FFFFFF', fontSize: 12 }}>* {data.poolStaking} SWINC Staked &gt; {data.mintPrice} MINT Price</li>
            <li style={{ color: '#FFFFFF', fontSize: 12 }}>* {data.totalModerators} Moderators</li>
            <li style={{ color: '#FFFFFF', fontSize: 12 }}>* {finalDecision === 'valid' ? (
              <>
                <span style={{ color: '#18C964' }}>Majority ({data.validatedVotes} $SWINC Valid)</span> / <span style={{ color: '#FF3333' }}>Minority ({data.refusedVotes} $SWINC Refuse)</span> ≥ 2
              </>
            ) : (
              <>
                <span style={{ color: '#FF3333' }}>Majority ({data.refusedVotes} $SWINC Refuse)</span> / <span style={{ color: '#18C964' }}>Minority ({data.validatedVotes} $SWINC Valid)</span> ≥ 2
              </>
            )}</li>
          </ul>

          <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 10 }}>Moderation vote {dateStr}</div>

          <div style={{ height: 1, background: '#222', margin: '10px 0' }} />

          {isWinForStaker ? (
            <div style={{ color: '#18C964', fontWeight: 800 }}>Your WIN = <span style={{ color: '#FFFFFF' }}>TBD</span></div>
          ) : (
            <div style={{ color: '#FF3333', fontWeight: 800 }}>Your LOOSE = <span style={{ color: '#FFFFFF' }}>TBD</span></div>
          )}
        </div>
      </div>
    );
  };

  // Fonction pour rendre les conditions
  const renderConditions = (data: ModerationData) => {
    const totalVotes = data.validatedVotes + data.refusedVotes;
    
    // Déterminer majorité et minorité avec couleurs appropriées
    const getMajorityMinorityDisplay = () => {
      const validVotes = data.validatedVotes;
      const refusedVotes = data.refusedVotes;
      
      if (validVotes === refusedVotes) {
        // Égalité - tout en jaune
        return (
          <>
            <span style={{ color: '#FFD600' }}>Majority ({validVotes})</span> / <span style={{ color: '#FFD600' }}>Minority ({refusedVotes})</span> ≥ 2
          </>
        );
      } else if (validVotes > refusedVotes) {
        // Valid est majoritaire (vert), Refuse est minoritaire (rouge)
        return (
          <>
            <span style={{ color: '#00FF00' }}>Majority ({validVotes})</span> / <span style={{ color: '#FF0000' }}>Minority ({refusedVotes})</span> ≥ 2
          </>
        );
      } else {
        // Refuse est majoritaire (rouge), Valid est minoritaire (vert)
        return (
          <>
            <span style={{ color: '#FF0000' }}>Majority ({refusedVotes})</span> / <span style={{ color: '#00FF00' }}>Minority ({validVotes})</span> ≥ 2
          </>
        );
      }
    };
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#fff' }}>
        {/* Titre des conditions */}
        <div style={{
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#FFD600',
            margin: 0,
            marginBottom: '4px'
          }}>
            Conditions Status
          </h3>
          <div style={{
            height: '2px',
            width: '60%',
            margin: '0 auto',
            background: 'linear-gradient(90deg, rgba(255,214,0,0.8), rgba(255,255,255,0.3))',
            borderRadius: '1px'
          }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 22, 
            height: 22, 
            borderRadius: 999, 
            background: data.conditions.poolStakingExceedsMint ? '#18C964' : '#444', 
            border: `2px solid ${data.conditions.poolStakingExceedsMint ? '#18C964' : '#FF3B30'}` 
          }} />
          <span style={{ 
            color: data.conditions.poolStakingExceedsMint ? '#18C964' : '#FFD600', 
            fontSize: 18 
          }}>
            Pool Staking ({data.poolStaking} SWINC) &gt; MINT Price
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 22, 
            height: 22, 
            borderRadius: 999, 
            background: data.conditions.hybridRatioMet ? '#18C964' : '#444', 
            border: `2px solid ${data.conditions.hybridRatioMet ? '#18C964' : '#FF3B30'}` 
          }} />
          <span style={{ 
            color: data.conditions.hybridRatioMet ? '#18C964' : '#FFD600', 
            fontSize: 18 
          }}>
            {getMajorityMinorityDisplay()}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 22, 
            height: 22, 
            borderRadius: 999, 
            background: totalVotes >= 22 ? '#18C964' : '#444', 
            border: `2px solid ${totalVotes >= 22 ? '#18C964' : '#FF3B30'}` 
          }} />
          <span style={{ 
            color: totalVotes >= 22 ? '#18C964' : '#FFD600', 
            fontSize: 18 
          }}>
            You moderate ({data.userVote === 'valid' ? (
              <span style={{ color: '#00FF00' }}>Valid</span>
            ) : data.userVote === 'refuse' ? (
              <span style={{ color: '#FF0000' }}>Refuse</span>
            ) : (
              <span style={{ color: '#FFD600' }}>Not voted</span>
            )}) with {totalVotes} others Moderators / 22
          </span>
        </div>
      </div>
    );
  };

  // Fonction pour rendre la ligne de score (completion seulement)
  const renderScoreLine = (data: CompletionModerationData) => {
    // Forcer le score à 0 si le modérateur a refusé
    const actualUserScore = data.userVote === 'refuse' ? 0 : data.userScore;
    const userScorePosition = (actualUserScore / 100) * 100;
    const averageScorePosition = (data.averageScore / 100) * 100;

    const getScoreColor = (score: number) => {
      if (score >= 80) return '#00FF00';
      if (score >= 50) return '#FFD600';
      return '#FF0000';
    };

    return (
      <div style={{ width: '100%', margin: '24px 0', position: 'relative' }}>
        {/* Container avec 0 et 100 aux extrémités */}
        <div style={{ position: 'relative', padding: '0 20px' }}>
          {/* 0 rouge à gauche */}
          <div style={{
            position: 'absolute',
            left: '0',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#FF0000',
            fontSize: '16px',
            fontWeight: 700
          }}>
            0
          </div>

          {/* 100 vert à droite - décalé davantage vers la droite */}
          <div style={{
            position: 'absolute',
            right: '-25px', // Décalé davantage vers la droite
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#00FF00',
            fontSize: '16px',
            fontWeight: 700
          }}>
            100
          </div>

          {/* Ligne de fond dégradée */}
          <div style={{
            width: '100%',
            height: '10px',
            borderRadius: '5px',
            background: 'linear-gradient(90deg, #FF0000 0%, #FFA500 25%, #FFD600 50%, #90EE90 75%, #00FF00 100%)',
            position: 'relative',
            margin: '0 20px'
          }}>
            {/* Marqueur de votre score - monté vers le haut */}
            <div style={{
              position: 'absolute',
              left: `${userScorePosition}%`,
              top: '-40px', // Monté davantage vers le haut
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                background: getScoreColor(actualUserScore),
                color: '#000',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                marginBottom: '6px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                Your Score: {actualUserScore}
              </div>
              <div style={{
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `6px solid ${getScoreColor(actualUserScore)}`,
              }} />
            </div>

            {/* Marqueur du score moyen - espacé en hauteur */}
            <div style={{
              position: 'absolute',
              left: `${averageScorePosition}%`,
              top: '26px', // Plus d'espace en hauteur
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: `6px solid ${getScoreColor(data.averageScore)}`,
                marginBottom: '6px' // Plus d'espace entre la flèche et le texte
              }} />
              <div style={{
                background: getScoreColor(data.averageScore),
                color: '#000',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                Average Score: {data.averageScore}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fonction pour rendre les contrôles du carrousel
  const renderCarouselControls = () => {
    if (activeModerations.length <= 1) return null;

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Bouton précédent */}
        <button
          onClick={prevModeration}
          style={{
            background: '#333',
            border: '2px solid #FFD600',
            borderRadius: '8px',
            color: '#FFD600',
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FFD600';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#333';
            e.currentTarget.style.color = '#FFD600';
          }}
        >
          ← Prev
        </button>

        {/* Indicateurs de pagination */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {activeModerations.map((_, index) => (
            <button
              key={index}
              onClick={() => goToModeration(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentModerationIndex ? '#FFD600' : '#666',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Compteur */}
        <span style={{ 
          color: '#C0C0C0', 
          fontSize: '14px',
          minWidth: '60px',
          textAlign: 'center'
        }}>
          {currentModerationIndex + 1} / {activeModerations.length}
        </span>

        {/* Bouton suivant */}
        <button
          onClick={nextModeration}
          style={{
            background: '#333',
            border: '2px solid #FFD600',
            borderRadius: '8px',
            color: '#FFD600',
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FFD600';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#333';
            e.currentTarget.style.color = '#FFD600';
          }}
        >
          Next →
        </button>
      </div>
    );
  };

  // Loading state
  if (!account) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        width: '100vw', 
        background: '#000', 
        color: '#00FF00',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
          Loading your moderations...
        </h1>
        <p style={{ fontSize: '16px', color: '#ccc' }}>
          Please wait while we fetch your moderation data.
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      background: '#000', 
      color: '#00FF00',
      fontFamily: 'Inter, sans-serif',
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      gap: 24,
      alignItems: 'start',
      paddingTop: 16,
      paddingLeft: 16,
      paddingRight: 16
    }}>
      {/* Left sidebar menu */}
      <div style={{ 
        position: 'sticky', 
        top: '50%', 
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: 'fit-content'
      }}>
        <div style={{ 
          color: activeTab === 'active' ? '#18C964' : '#C0C0C0', 
          fontWeight: 900, 
          fontSize: 16,
          cursor: 'pointer', 
          marginBottom: 10 
        }} onClick={() => setActiveTab('active')}>
          Active Moderations
        </div>
        <div style={separatorStyle} />
        <div style={{ 
          marginTop: 10, 
          marginBottom: 10, 
          color: activeTab === 'history' ? '#18C964' : '#C0C0C0', 
          fontWeight: 900, 
          fontSize: 16,
          cursor: 'pointer' 
        }} onClick={() => setActiveTab('history')}>
          Moderation History
        </div>
        <div style={separatorStyle} />
        <div style={{ 
          marginTop: 10,
          marginBottom: 10, 
          color: activeTab === 'staking' ? '#18C964' : '#C0C0C0', 
          fontWeight: 900, 
          fontSize: 16,
          cursor: 'pointer' 
        }} onClick={() => setActiveTab('staking')}>
          Staking Performance
        </div>
        <div style={separatorStyle} />
        <div style={{ 
          marginTop: 10, 
          color: activeTab === 'influence' ? '#18C964' : '#C0C0C0', 
          fontWeight: 900, 
          fontSize: 16,
          cursor: 'pointer' 
        }} onClick={() => setActiveTab('influence')}>
          Your Staker Influence
        </div>
        <div style={separatorStyle} />
      </div>

      {/* Right content area */}
      <div style={{ width: '100%', maxWidth: 1400, justifySelf: 'center', position: 'relative' }}>
        {activeTab === 'active' && (
          <div style={{ color: '#fff', paddingTop: 20 }}>
            {activeModerations.length > 0 ? (
              <div>
                {/* Contrôles du carrousel */}
                {renderCarouselControls()}

                {/* Modération actuelle */}
                {(() => {
                  const currentModeration = activeModerations[currentModerationIndex];
                  const isCompletion = currentModeration.type === 'completion';
                  
                                     return (
                     <div style={{
                       background: 'transparent',
                       padding: '32px 0',
                       marginBottom: '32px'
                     }}>
                       {/* Header */}
                       <div style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: '24px',
                         marginBottom: '48px',
                         justifyContent: 'center'
                       }}>
                         <h2 style={{
                           fontSize: '32px',
                           fontWeight: 800,
                           color: '#FFD600',
                           margin: 0,
                           textAlign: 'center'
                         }}>
                           {isCompletion ? 'Completion Moderation in progress' : 'Initial Moderation in progress'}
                         </h2>
                       </div>

                       {/* ID, MINT Price, Wallet - Centered */}
                       <div style={{
                         display: 'flex',
                         justifyContent: 'center',
                         marginBottom: '32px'
                       }}>
                         <div style={{
                           background: 'rgba(24, 201, 100, 0.1)',
                           border: '1px solid #18C964',
                           color: '#18C964',
                           padding: '10px 20px',
                           borderRadius: '24px',
                           fontSize: '14px',
                           fontWeight: 700
                         }}>
                           ID: {currentModeration.id} • MINT Price: ${currentModeration.mintPrice} • {truncateAddress(currentModeration.walletAddress)}
                         </div>
                       </div>

                       {/* Score line for completion moderations only */}
                       {isCompletion && (
                         <div style={{ marginBottom: '48px', maxWidth: '800px', margin: '0 auto 48px auto' }}>
                           {renderScoreLine(currentModeration as CompletionModerationData)}
                         </div>
                       )}

                       {/* Main content */}
                       <div style={{
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         gap: '80px',
                         maxWidth: '1200px',
                         margin: '0 auto'
                       }}>
                         {/* Cercle de modération */}
                         <div style={{ flex: 'none' }}>
                           {renderModerationCircle(currentModeration)}
                         </div>

                         {/* Conditions */}
                         <div style={{ flex: 1, maxWidth: '600px' }}>
                           {renderConditions(currentModeration)}
                         </div>
                       </div>
                     </div>
                   );
                })()}
              </div>
            ) : (
              /* Empty state */
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.6)',
                border: '2px dashed #333',
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>⚖️</div>
                <h3 style={{ color: '#C0C0C0', fontSize: '20px', marginBottom: '8px' }}>No active moderations</h3>
                <p style={{ color: '#888', fontSize: '16px' }}>You don't currently have any content in moderation.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ color: '#fff', textAlign: 'center', paddingTop: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Moderation History</h2>
            <p style={{ color: '#C0C0C0', marginBottom: 24 }}>Your complete moderation history will be displayed here</p>
            {historyModerations.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 20,
                textAlign: 'left',
                width: '100%',
                maxWidth: 1180,
                margin: '0 auto'
              }}>
                {historyModerations.map((m) => <div key={m.id}>{renderHistoryCard(m)}</div>)}
              </div>
            ) : (
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.6)',
                border: '2px dashed #333',
                borderRadius: 16,
                padding: '48px 24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🗂️</div>
                <h3 style={{ color: '#C0C0C0', fontSize: 20, marginBottom: 8 }}>No finished moderations yet</h3>
                <p style={{ color: '#888', fontSize: 16 }}>When your moderated campaigns are finalized, they will appear here.</p>
              </div>
            )}

            {/* Dev Controls uniquement pour l'historique */}
            <DevControls 
              onForceValidated={() => {}}
              forceValidated={false}
              additionalControls={
                <HistoryDevControls />
              }
            />
          </div>
        )}

        {activeTab === 'staking' && (
          <div style={{ color: '#fff', textAlign: 'center', paddingTop: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Staking Performance</h2>
            <p style={{ color: '#C0C0C0' }}>Your staking performance metrics will be displayed here</p>
          </div>
        )}

        {activeTab === 'influence' && (
          <div style={{ color: '#fff', textAlign: 'center', paddingTop: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Your Staker Influence</h2>
            <p style={{ color: '#C0C0C0' }}>Your influence as a staker in the community will be displayed here</p>
          </div>
        )}

        {/* Dev Controls déplacés dans l'onglet History */}
      </div>
    </div>
  );
} 