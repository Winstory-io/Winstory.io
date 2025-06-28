"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BriefcaseIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 16 }}>
    <rect x="8" y="16" width="32" height="20" rx="3" stroke="#FFD600" strokeWidth="2"/>
    <rect x="14" y="10" width="20" height="8" rx="2" stroke="#FFD600" strokeWidth="2"/>
  </svg>
);

const LockIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{marginLeft:12,verticalAlign:'middle'}} xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="8" rx="2" stroke="#18C964" strokeWidth="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="#18C964" strokeWidth="2" strokeLinecap="round"/><path d="M12 16v2" stroke="#18C964" strokeWidth="2" strokeLinecap="round"/></svg>
) : (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{marginLeft:12,verticalAlign:'middle'}} xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="8" rx="2" stroke="#888" strokeWidth="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="#888" strokeWidth="2" strokeLinecap="round"/><path d="M12 15v3" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
);

const Stepper = ({ value, setValue, min, max, step, color, disabled }: { value: number, setValue: (v:number)=>void, min?:number, max?:number, step?:number, color?:string, disabled?:boolean }) => (
  <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 12 }}>
    <button onClick={()=>!disabled && setValue(Math.min(max ?? value+step!, value+step!))} disabled={disabled} style={{ background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', color: color||'#FFD600', fontSize: 22, padding: 0, marginBottom: 2, lineHeight:1 }} aria-label="Increase">
      ▲
    </button>
    <button onClick={()=>!disabled && setValue(Math.max(min ?? value-step!, value-step!))} disabled={disabled} style={{ background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', color: color||'#FFD600', fontSize: 22, padding: 0, marginTop: 2, lineHeight:1 }} aria-label="Decrease">
      ▼
    </button>
  </div>
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
  const [unitValue, setUnitValue] = useState<number|null>(null);
  const [netProfit, setNetProfit] = useState<number|null>(null);
  const [freeReward, setFreeReward] = useState(false);
  const [maxCompletions, setMaxCompletions] = useState(0);
  const [userMaxCompletions, setUserMaxCompletions] = useState(100);
  const [noReward, setNoReward] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (freeReward) {
      setMaxCompletions(userMaxCompletions);
    } else if (unitValue && netProfit) {
      let max = Math.ceil((1000 + netProfit) / (unitValue * 0.5));
      if (max < 5) max = 5;
      setMaxCompletions(max);
    } else {
      setMaxCompletions(0);
    }
  }, [unitValue, netProfit, freeReward, userMaxCompletions]);

  useEffect(() => {
    if (freeReward) setNoReward(false);
    if (noReward) setFreeReward(false);
  }, [freeReward, noReward]);

  const canProceed = freeReward || noReward || (!!unitValue && !!netProfit);

  const handleNext = () => {
    router.push("/creation/b2c/yourwinstory");
  };

  // Encarts chiffres + $ à gauche + stepper jaune à droite
  const renderMoneyInput = (value: number|null, setValue: (v:number)=>void, disabled: boolean, step: number, min: number) => (
    <div style={{ display: 'flex', alignItems: 'center', width: 180, position: 'relative' }}>
      <span style={{ position: 'absolute', left: 10, color: '#FFD600', fontWeight: 700, fontSize: 18, pointerEvents: 'none' }}>$</span>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*"
        value={value === null ? '' : value}
        onChange={e => {
          const val = e.target.value.replace(/[^\d.]/g, '');
          setValue(val === '' ? null : parseFloat(val));
        }}
        disabled={disabled}
        min={min}
        step={step}
        style={{
          background: 'transparent',
          border: `2px solid ${disabled ? '#888' : '#FFD600'}`,
          borderRadius: 8,
          color: '#FFD600',
          fontWeight: 700,
          fontSize: 18,
          width: '100%',
          padding: '8px 12px 8px 28px',
          textAlign: 'right',
          outline: 'none',
          opacity: disabled ? 0.5 : 1,
          appearance: 'textfield',
        }}
        onFocus={e => e.target.select()}
        autoComplete="off"
      />
      {!disabled && <Stepper value={value||0} setValue={setValue} min={min} step={step} color="#FFD600" />}
    </div>
  );

  // Encadré completions + stepper vert + cadenas, sans cadenas si freeReward
  const renderMaxCompletions = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
      {freeReward ? (
        <>
          <div style={{ background: 'transparent', border: '2px solid #18C964', borderRadius: 8, color: '#18C964', fontWeight: 700, fontSize: 22, width: 180, padding: '10px 0', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #18C964' }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userMaxCompletions}
              min={1}
              max={1000}
              step={1}
              onChange={e => setUserMaxCompletions(Math.max(1, Math.min(1000, parseInt(e.target.value.replace(/[^\d]/g, ''))||1)))}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#18C964',
                fontWeight: 700,
                fontSize: 22,
                width: 80,
                textAlign: 'center',
                outline: 'none',
                appearance: 'textfield',
              }}
              autoComplete="off"
            />
            <Stepper value={userMaxCompletions} setValue={v=>setUserMaxCompletions(Math.max(1, Math.min(1000, v)))} min={1} max={1000} step={1} color="#18C964" />
          </div>
        </>
      ) : (
        <>
          <div style={{ background: 'transparent', border: '2px solid #888', borderRadius: 8, color: '#888', fontWeight: 700, fontSize: 22, width: 180, padding: '10px 0', textAlign: 'center', userSelect: 'none', opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{maxCompletions}</div>
          <LockIcon open={false} />
        </>
      )}
    </div>
  );

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
        <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Rewards</h2>
        <div style={{ border: '2px solid #FFD600', borderRadius: 16, padding: 32, marginBottom: 16, maxWidth: 500, width: '100%' }}>
          {/* Si pas freeReward, afficher les deux champs */}
          {!freeReward && <>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ color: '#FFD600', fontWeight: 600, fontSize: 18, flex: 1 }}>Unit Value of the Completion</span>
              {renderMoneyInput(unitValue, setUnitValue, freeReward, 0.01, 0)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ color: '#FFD600', fontWeight: 600, fontSize: 18, flex: 1 }}>Net Profits targeted</span>
              {renderMoneyInput(netProfit, setNetProfit, freeReward, 1, 0)}
            </div>
          </>}
          {/* Maximum completions, texte dynamique, stepper vert, cadenas */}
          <div style={{ color: freeReward ? '#18C964' : '#888', fontWeight: 700, fontSize: 18, marginBottom: 8, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {freeReward ? 'Select the maximum number of completions available at 0$ :' : 'Maximum Completions auto-calculated'}
            {renderMaxCompletions()}
          </div>
        </div>
        {/* Checkbox free reward, italique, SOUS l'encart Rewards */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, justifyContent: 'flex-start', maxWidth: 500, width: '100%' }}>
          <input
            type="checkbox"
            checked={freeReward}
            onChange={e => setFreeReward(e.target.checked)}
            style={{ width: 24, height: 24, accentColor: '#FFD600', marginRight: 12 }}
          />
          <span style={{ fontStyle: 'italic', color: '#FFD600', fontSize: 16 }}>
            Make the rewards free to $0 for your community
          </span>
        </div>
        {/* Bloc Or Not */}
        <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Or not</h2>
        <div style={{ border: '2px solid #FFD600', borderRadius: 16, padding: 32, maxWidth: 500, width: '100%', marginBottom: 40 }}>
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