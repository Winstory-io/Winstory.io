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
        <div
          style={{
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
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            style={{ background: '#111', color: '#fff', padding: 36, borderRadius: 18, minWidth: 340, maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', textAlign: 'left', position: 'relative', boxShadow: '0 0 24px #000' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <h2 style={{ color: '#FFD600', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>Understanding Rewards</h2>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
              Offer engaging rewards to motivate the community to complete your Story.<br/>
              <span style={{ color: '#FFD600' }}>Winstory</span> guides you every step of the way.
            </div>
            <div style={{ fontWeight: 700, color: '#FFD600', margin: '18px 0 6px 0', fontSize: 18 }}>☀️ Key Terms explained :</div>
            <div style={{ marginBottom: 10 }}>
              <b>Unit Value</b> : The amount paid by each community member to participate in your campaign, usually in stablecoin (e.g., 25 USDC).<br/>
              <span style={{ fontStyle: 'italic', color: '#FFD600' }}>
                You can set the Unit Value paid, slightly below the perceived value of the reward in order to make it easier to attract the individuals Community. To make them want to complete and obtain the standard reward. And even to produce the best possible completion in order to obtain the Premium reward as well !<br/>
                You can also set the Unit Value to 0 to allow free participation (excluding transaction fees). In this case, there's no direct return on investment—but your brand image gets a powerful boost.
              </span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <b>Net Profit</b> : The profit goal your company wants to achieve from the campaign, after MINTs costs. This amount is fully customizable.
            </div>
            <div style={{ marginBottom: 10 }}>
              <b>Maximum Mint</b> : The total number of community participations you allow. It defines the maximum number of rewards needed and helps frame the campaign.<br/>
              <span style={{ fontStyle: 'italic', color: '#FFD600' }}>
                Maximum Mint = (Initial MINT Cost + Net Profit) / (Unit Value × 50%)<br/>
                Why 50%? : 50% of participation fees fund active and passive Stakers + <span style={{ color: '#FFD600' }}>Winstory</span>.<br/>
                The other 50% goes to you.
              </span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <b>Total Revenue</b> : The total turnover (i.e. gross revenue) expected from your campaign.<br/>
              Formula = Selected Net Profit + Your initial MINT price
            </div>
            <div style={{ marginBottom: 10 }}>
              <b>Your initial MINT price</b> : The price your company pays to launch the campaign on Winstory :<br/>
              <span style={{ color: '#FFD600' }}>$1000</span>: Initial Price (but you must import your own film based on your Starting Story and have rewards to set up)<br/>
              <span style={{ color: '#FFD600' }}>2 options :</span><br/>
              <span style={{ color: '#FFD600' }}>➕ $500</span>: Winstory creates the film based on your Starting Story.<br/>
              <span style={{ color: '#FFD600' }}>➕ $1000</span>: No rewards to set up (free completions for the community).
            </div>
            <div style={{ fontWeight: 700, color: '#FFD600', margin: '18px 0 6px 0', fontSize: 18 }}>🎁 Types of Rewards :</div>
            <ul style={{ marginBottom: 10, paddingLeft: 22 }}>
              <li><b>Digital Tokens</b>: Blockchain-based tokens (e.g., $WINC or others).</li>
              <li><b>Digital Items</b>: Unique digital collectibles (via NFTs, e.g. video-game character element).</li>
              <li><b>Digital Exclusive Access</b>: Privileged access to online content or experiences. (via NFTs, e.g. exclusive webinar,)</li>
              <li><b>Physical Exclusive Access</b>: Access to real-world events or physical goods (via NFTs e.g. VIP event).</li>
            </ul>
            <div style={{ fontWeight: 700, color: '#FFD600', margin: '18px 0 6px 0', fontSize: 18 }}>Standard & Premium :</div>
            <div style={{ marginBottom: 10 }}>
              <b>Standard Rewards 👤👤👤</b> : Sent to every contributor whose completion is validated by the moderators (Stakers). These are distributed automatically once your campaign ends or reaches full participation.
            </div>
            <div style={{ marginBottom: 10 }}>
              <b>Premium Rewards 🥇🥈🥉</b> : Awarded to the top 3 contributors with the highest average score, based on moderation, criteria, guidelina, coherence, scored by Stakers. This encourages creativity, effort, and storymaking quality.
            </div>
            <div style={{ fontWeight: 700, color: '#FFD600', margin: '18px 0 6px 0', fontSize: 18 }}>Easy distribution :</div>
            <div style={{ marginBottom: 10 }}>
              Rewards are sent automatically during the MINT, in a single transaction. Simply provide the token, NFT, or access address on the blockchain. <span style={{ color: '#FFD600' }}>Winstory</span> ensures everything is securely distributed to validated contributors by Smart Contract. You'll only be able to publish your campaign once all rewards are properly registered and validated. Once launched, everything runs automatically.
            </div>
            <div style={{ fontWeight: 700, color: '#FFD600', margin: '18px 0 6px 0', fontSize: 18 }}>🚨 Important</div>
            <div style={{ marginBottom: 10 }}>
              Rewards are automatically distributed as soon as the 3 validation conditions are met :
              <ul style={{ margin: '8px 0 8px 18px' }}>
                <li>✅ At least 22 stakers voted</li>
                <li>✅ The staking pool exceeds the Unit Value</li>
                <li>✅ 2:1 majority votes YES</li>
              </ul>
              These same 3/3 conditions apply for both :
              <ul style={{ margin: '8px 0 8px 18px' }}>
                <li>Your Initial Story to be available<br/>(At least 22 stakers voted + Staking pool &gt; your MINT price + 2:1 majority votes YES)</li>
                <li>All community Completions</li>
              </ul>
            </div>
            <div style={{ fontWeight: 700, color: '#FFD600', margin: '18px 0 6px 0', fontSize: 18 }}>No Reward to give? No problem.</div>
            <div style={{ marginBottom: 10 }}>
              If you don't wish to offer any reward (digital or physical), you can simply <b>check the "No Reward" box</b> when setting up your campaign.<br/><br/>
              <span style={{ color: '#FFD600', fontWeight: 700 }}>☑️ No Reward to give? No problem — free completions<br/>+ $1000</span>
              <br/><br/>
              In this case:
              <ul style={{ margin: '8px 0 8px 18px' }}>
                <li>You skip the reward setup entirely.</li>
                <li>Community members can participate for free (you define the max number of completions).</li>
                <li>You pay a <b>$1000 additional fee</b> on top of your base MINT cost to cover visibility and platform infrastructure.</li>
                <li>The best completions may still be awarded <b>$WINC tokens</b> by Winstory to encourage creativity and quality storytelling.</li>
              </ul>
              This option helps brands test narrative engagement without needing to manage reward logistics.
            </div>
          </div>
        </div>
      )}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Bloc Rewards */}
        {!noReward && (
          <>
            <h2 style={{ color: freeReward ? '#18C964' : '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center', transition: 'color 0.2s' }}>Rewards</h2>
            <div style={{ border: `2px solid ${freeReward ? '#18C964' : '#FFD600'}`, borderRadius: 16, padding: 32, marginBottom: 16, maxWidth: 500, width: '100%', transition: 'border-color 0.2s' }}>
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
            {/* Checkbox free reward, italique, SOUS l'encart Rewards, police réduite, centrée, verte si cochée, sur une seule ligne */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, justifyContent: 'center', maxWidth: 500, width: '100%' }}>
              <input
                type="checkbox"
                checked={freeReward}
                onChange={e => setFreeReward(e.target.checked)}
                style={{ width: 28, height: 28, accentColor: freeReward ? '#18C964' : '#FFD600', marginRight: 18, transition: 'accent-color 0.2s' }}
              />
              <span style={{ fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: freeReward ? '#18C964' : '#FFD600', width: '100%', textAlign: 'center', transition: 'color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Make the rewards free to $0 for your community
              </span>
            </div>
          </>
        )}
        {/* Bloc Or Not */}
        {!freeReward && (
          <>
            <h2 style={{ color: noReward ? '#18C964' : '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center', transition: 'color 0.2s' }}>Or not</h2>
            <div style={{ border: `2px solid ${noReward ? '#18C964' : '#FFD600'}`, borderRadius: 16, padding: 32, maxWidth: 500, width: '100%', marginBottom: 40, transition: 'border-color 0.2s' }}>
              <div style={{ color: noReward ? '#18C964' : 'white', fontWeight: 700, fontSize: 20, marginBottom: 16, textAlign: 'center', transition: 'color 0.2s' }}>
                No Reward to give ? No Problem, free completions
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <input
                  type="checkbox"
                  checked={noReward}
                  onChange={e => setNoReward(e.target.checked)}
                  style={{ width: 28, height: 28, accentColor: noReward ? '#18C964' : '#FFD600', marginRight: 16, transition: 'accent-color 0.2s' }}
                />
                <span style={{ color: noReward ? '#18C964' : '#FFD600', fontWeight: 700, fontSize: 26, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}>
                  <span style={{ fontSize: 28, marginRight: 6, fontWeight: 900 }}>+</span>$1000
                </span>
              </div>
            </div>
          </>
        )}
      </main>
      <GreenArrowButton onClick={handleNext} disabled={!canProceed} />
    </div>
  );
} 