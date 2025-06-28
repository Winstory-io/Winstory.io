"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BriefcaseIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 16 }}>
    <rect x="8" y="16" width="32" height="20" rx="3" stroke="#FFD600" strokeWidth="2"/>
    <rect x="14" y="10" width="20" height="8" rx="2" stroke="#FFD600" strokeWidth="2"/>
  </svg>
);

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
      opacity: disabled ? 0.3 : 1,
      zIndex: 10,
    }}
  >
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="#18C964"/>
      <path d="M16 22L24 30L32 22" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
);

export default function RewardsOrNotB2C() {
  const router = useRouter();
  // Champs Rewards
  const [unitValue, setUnitValue] = useState(1.00);
  const [netProfit, setNetProfit] = useState(1000);
  const [freeReward, setFreeReward] = useState(false);
  const [maxCompletions, setMaxCompletions] = useState(0);
  // Option 2
  const [noReward, setNoReward] = useState(false);
  // Bulb popup
  const [showModal, setShowModal] = useState(false);

  // Calcul dynamique
  useEffect(() => {
    if (freeReward) {
      setMaxCompletions(100); // Valeur par défaut pour free
    } else {
      // Même logique que src/01_SaaSCompanyCreation/index01.js
      let max = Math.ceil((1000 + netProfit) / (unitValue * 0.5));
      if (max < 5) max = 5;
      setMaxCompletions(max);
    }
  }, [unitValue, netProfit, freeReward]);

  // Exclusivité des choix
  useEffect(() => {
    if (freeReward) setNoReward(false);
    if (noReward) setFreeReward(false);
  }, [freeReward, noReward]);

  // Validation bouton
  const canProceed = (freeReward || noReward || (!freeReward && !noReward && unitValue > 0 && netProfit > 0));

  const handleNext = () => {
    // Aller à la page suivante
    router.push("/creation/b2c/yourwinstory");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: 'white', fontFamily: 'Inter, sans-serif', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 60, textAlign: 'center', position: 'relative' }}>
        <BriefcaseIcon />
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>Rewards or not ?</h1>
        <span
          style={{ fontSize: 36, marginLeft: 16, cursor: 'pointer' }}
          onClick={() => setShowModal(true)}
          aria-label="Show info"
        >💡</span>
      </header>
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ background: '#111', color: '#FFD600', padding: 32, borderRadius: 16, minWidth: 320, textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Info</div>
            <div style={{ fontSize: 16 }}>This popup will be customized later.</div>
          </div>
        </div>
      )}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Bloc Rewards */}
        <div style={{ border: '2px solid #FFD600', borderRadius: 16, padding: 32, marginBottom: 40, maxWidth: 500, width: '100%' }}>
          <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Rewards</h2>
          {/* Ligne 1 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ color: '#FFD600', fontWeight: 600, fontSize: 18, flex: 1 }}>Unit Value of the Completion</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={unitValue}
              disabled={freeReward}
              onChange={e => setUnitValue(parseFloat(e.target.value) || 0)}
              style={{ background: 'transparent', border: '2px solid #FFD600', borderRadius: 8, color: '#FFD600', fontWeight: 700, fontSize: 18, width: 120, padding: '8px 12px', textAlign: 'right', marginLeft: 16 }}
            />
            <span style={{ color: '#FFD600', fontWeight: 700, fontSize: 18, marginLeft: 8 }}>$</span>
          </div>
          {/* Ligne 2 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ color: '#FFD600', fontWeight: 600, fontSize: 18, flex: 1 }}>Net Profits targeted</span>
            <input
              type="number"
              step="1"
              min="0"
              value={netProfit}
              disabled={freeReward}
              onChange={e => setNetProfit(parseInt(e.target.value) || 0)}
              style={{ background: 'transparent', border: '2px solid #FFD600', borderRadius: 8, color: '#FFD600', fontWeight: 700, fontSize: 18, width: 120, padding: '8px 12px', textAlign: 'right', marginLeft: 16 }}
            />
            <span style={{ color: '#FFD600', fontWeight: 700, fontSize: 18, marginLeft: 8 }}>$</span>
          </div>
          {/* Ligne 3 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ color: 'white', fontWeight: 600, fontSize: 18, flex: 1 }}>Rewards free to $0 for your community</span>
            <input
              type="checkbox"
              checked={freeReward}
              onChange={e => setFreeReward(e.target.checked)}
              style={{ width: 28, height: 28, accentColor: 'white', marginLeft: 16 }}
            />
          </div>
          {/* Ligne 4 */}
          <div style={{ color: '#18C964', fontWeight: 700, fontSize: 18, marginBottom: 8, textAlign: 'center' }}>Maximum Completions auto-calculated</div>
          <div style={{ background: 'transparent', border: '2px solid #18C964', borderRadius: 8, color: '#18C964', fontWeight: 700, fontSize: 22, width: 180, margin: '0 auto', padding: '10px 0', textAlign: 'center' }}>{maxCompletions}</div>
        </div>
        {/* Bloc Or Not */}
        <div style={{ border: '2px solid #FFD600', borderRadius: 16, padding: 32, maxWidth: 500, width: '100%', marginBottom: 40 }}>
          <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>or not</h2>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 18, marginBottom: 16, textAlign: 'center' }}>No Reward to give ? No Problem, free completions</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input
              type="checkbox"
              checked={noReward}
              onChange={e => setNoReward(e.target.checked)}
              style={{ width: 28, height: 28, accentColor: '#FFD600', marginRight: 16 }}
            />
            <span style={{ color: '#FFD600', fontWeight: 700, fontSize: 22 }}>$1000</span>
          </div>
        </div>
      </main>
      <GreenArrowButton onClick={handleNext} disabled={!canProceed} />
    </div>
  );
} 