"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

interface StepperProps {
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color?: string;
  disabled?: boolean;
}

const Stepper = ({ value, setValue, min, max, step, color, disabled }: StepperProps) => {
  const [pressed, setPressed] = React.useState<null | number>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (pressed !== null) {
      intervalRef.current = setInterval(() => {
        let newValue = value + pressed;
        if (typeof min === 'number') newValue = Math.max(min, newValue);
        if (typeof max === 'number') newValue = Math.min(max, newValue);
        setValue(Number(newValue.toFixed(4)));
      }, 80);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pressed, value, min, max, setValue]);

  const handleStep = (delta: number) => {
    if (disabled) return;
    let newValue = value + delta;
    if (typeof min === 'number') newValue = Math.max(min, newValue);
    if (typeof max === 'number') newValue = Math.min(max, newValue);
    setValue(Number(newValue.toFixed(4)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 12 }}>
      <span
        role="button"
        tabIndex={-1}
        aria-label="Increase"
        style={{
          background: 'none',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: color || '#FFD600',
          fontSize: 22,
          padding: 0,
          marginBottom: 2,
          lineHeight: 1,
          userSelect: 'none',
          outline: 'none',
        }}
        onMouseDown={() => { handleStep(step || 1); setPressed(step || 1); }}
        onMouseUp={() => setPressed(null)}
        onMouseLeave={() => setPressed(null)}
        onTouchStart={() => { handleStep(step || 1); setPressed(step || 1); }}
        onTouchEnd={() => setPressed(null)}
      >
        ▲
      </span>
      <span
        role="button"
        tabIndex={-1}
        aria-label="Decrease"
        style={{
          background: 'none',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: color || '#FFD600',
          fontSize: 22,
          padding: 0,
          marginTop: 2,
          lineHeight: 1,
          userSelect: 'none',
          outline: 'none',
        }}
        onMouseDown={() => { handleStep(-(step || 1)); setPressed(-(step || 1)); }}
        onMouseUp={() => setPressed(null)}
        onMouseLeave={() => setPressed(null)}
        onTouchStart={() => { handleStep(-(step || 1)); setPressed(-(step || 1)); }}
        onTouchEnd={() => setPressed(null)}
      >
        ▼
      </span>
    </div>
  );
};

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
      zIndex: 10,
    }}
  >
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill={disabled ? '#FF2D2D' : '#18C964'} />
      <path d="M16 22L24 30L32 22" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

interface RewardsOrNotProps {
  isAgencyB2C?: boolean;
}

export default function RewardsOrNot({ isAgencyB2C = false }: RewardsOrNotProps) {
  const router = useRouter();
  const [unitValue, setUnitValue] = useState<number|null>(null);
  const [unitValueInput, setUnitValueInput] = useState('');
  const [netProfit, setNetProfit] = useState<number|null>(null);
  const [netProfitInput, setNetProfitInput] = useState('');
  const [freeReward, setFreeReward] = useState(false);
  const [maxCompletions, setMaxCompletions] = useState(0);
  const [userMaxCompletions, setUserMaxCompletions] = useState(100);
  const [noReward, setNoReward] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferWinstory, setPreferWinstory] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const filmData = localStorage.getItem('film');
        if (filmData) {
          const parsed = JSON.parse(filmData);
          setPreferWinstory(!!parsed.aiRequested);
        } else {
          setPreferWinstory(false);
        }
      } catch (e) {
        setPreferWinstory(false);
      }
    }
  }, []);

  useEffect(() => {
    if (freeReward) {
      setMaxCompletions(userMaxCompletions);
    } else if (unitValue && netProfit) {
      const initialCost = preferWinstory ? 1500 : 1000;
      let max = Math.ceil((initialCost + netProfit) / (unitValue * 0.5));
      if (max < 5) max = 5;
      setMaxCompletions(max);
    } else {
      setMaxCompletions(0);
    }
  }, [unitValue, netProfit, freeReward, userMaxCompletions, preferWinstory]);

  useEffect(() => {
    if (freeReward) setNoReward(false);
    if (noReward) setFreeReward(false);
  }, [freeReward, noReward]);

  useEffect(() => {
    if (freeReward && userMaxCompletions < 5) {
      setUserMaxCompletions(5);
    }
  }, [freeReward, userMaxCompletions]);

  // Sauvegarder automatiquement les données de ROI quand elles changent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let roiData;
      
      if (noReward) {
        roiData = {
          unitValue: 0,
          netProfit: 0,
          maxCompletions: 0,
          isFreeReward: false,
          noReward: true
        };
      } else if (freeReward) {
        roiData = {
          unitValue: 0,
          netProfit: 0,
          maxCompletions: userMaxCompletions,
          isFreeReward: true,
          noReward: false
        };
      } else if (unitValue && netProfit) {
        roiData = {
          unitValue: unitValue,
          netProfit: netProfit,
          maxCompletions: maxCompletions,
          isFreeReward: false,
          noReward: false
        };
      } else {
        roiData = {
          unitValue: 0,
          netProfit: 0,
          maxCompletions: 0,
          isFreeReward: false,
          noReward: false
        };
      }
      
      localStorage.setItem('roiData', JSON.stringify(roiData));
    }
  }, [unitValue, netProfit, freeReward, userMaxCompletions, maxCompletions, noReward]);

  // Condition pour activer la flèche :
  const canProceed = (
    noReward ||
    freeReward ||
    (
      typeof unitValue === 'number' && unitValue > 0 &&
      typeof netProfit === 'number' && netProfit > 0 &&
      maxCompletions > 0
    )
  );

  const handleNoRewardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoReward(e.target.checked);
    if (e.target.checked) {
      localStorage.setItem(
        'campaignReward',
        JSON.stringify({
          rewardType: 'none',
          rewardLabel: 'No Reward to give? No Problem, free completions +$1000',
        })
      );
      // Sauvegarder les données de ROI pour no reward
      const roiData = {
        unitValue: 0,
        netProfit: 0,
        maxCompletions: 0,
        isFreeReward: false,
        noReward: true
      };
      localStorage.setItem('roiData', JSON.stringify(roiData));
    } else {
      localStorage.removeItem('campaignReward');
      // Supprimer les données de ROI no reward
      localStorage.removeItem('roiData');
    }
  };

  const handleNext = () => {
    // Sauvegarder les données de ROI dans tous les cas
    if (typeof window !== 'undefined') {
      let roiData;
      
      if (noReward) {
        roiData = {
          unitValue: 0,
          netProfit: 0,
          maxCompletions: 0,
          isFreeReward: false,
          noReward: true
        };
      } else if (freeReward) {
        roiData = {
          unitValue: 0,
          netProfit: 0,
          maxCompletions: userMaxCompletions,
          isFreeReward: true,
          noReward: false
        };
      } else if (unitValue && netProfit) {
        roiData = {
          unitValue: unitValue,
          netProfit: netProfit,
          maxCompletions: maxCompletions,
          isFreeReward: false,
          noReward: false
        };
      } else {
        roiData = {
          unitValue: 0,
          netProfit: 0,
          maxCompletions: 0,
          isFreeReward: false,
          noReward: false
        };
      }
      
      localStorage.setItem('roiData', JSON.stringify(roiData));
      localStorage.setItem('maxCompletions', String(freeReward ? userMaxCompletions : maxCompletions));
    }
    
    // Redirection différente selon le type de processus
    if (isAgencyB2C) {
      if ((freeReward || (!!unitValue && !!netProfit)) && !noReward) {
        router.push("/creation/agencyb2c/standardrewards");
      } else if (noReward) {
        router.push("/creation/agencyb2c/recap");
      } else {
        router.push("/creation/agencyb2c/yourwinstory");
      }
    } else {
      if ((freeReward || (!!unitValue && !!netProfit)) && !noReward) {
        router.push("/creation/b2c/standardrewards");
      } else if (noReward) {
        router.push("/creation/b2c/recap");
      } else {
        router.push("/creation/b2c/yourwinstory");
      }
    }
  };

  // Encarts chiffres + $ à gauche + stepper jaune à droite
  const renderMoneyInput = (
    value: number|null,
    setValue: (v:number|null)=>void,
    valueInput: string,
    setValueInput: (v:string)=>void,
    disabled: boolean,
    step: number,
    min: number,
    decimals: number = 2,
    isGreen: boolean = false,
    integerOnly: boolean = false
  ) => (
    <div style={{ display: 'flex', alignItems: 'center', width: 180, position: 'relative' }}>
      <span style={{ position: 'absolute', left: 10, color: isGreen ? '#18C964' : '#FFD600', fontWeight: 700, fontSize: 18, pointerEvents: 'none', transition: 'color 0.2s' }}>$</span>
      <input
        type="text"
        inputMode={integerOnly ? "numeric" : "decimal"}
        pattern={integerOnly ? "[0-9]*" : "[0-9.,]*"}
        value={valueInput}
        onChange={e => {
          let val = e.target.value;
          if (integerOnly) {
            // N'autoriser que des chiffres
            val = val.replace(/\D/g, '');
            setValueInput(val);
            if (val === '') setValue(null);
            else setValue(parseInt(val, 10));
          } else {
            // décimal, max 4 chiffres après la virgule
            val = val.replace(/,/g, '.');
            const parts = val.split('.');
            if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
            if (parts[1] && parts[1].length > 4) val = parts[0] + '.' + parts[1].slice(0, 4);
            if (/^\d*(\.?\d{0,4})?$/.test(val)) {
              setValueInput(val);
              if (val === '' || val === '.' || val === '0.') {
                setValue(null);
              } else {
                const num = parseFloat(val);
                if (!isNaN(num)) setValue(num);
                else setValue(null);
              }
            }
          }
        }}
        disabled={disabled}
        min={min}
        step={step}
        style={{
          background: 'transparent',
          border: `2px solid ${isGreen ? '#18C964' : (disabled ? '#888' : '#FFD600')}`,
          borderRadius: 8,
          color: isGreen ? '#18C964' : '#FFD600',
          fontWeight: 700,
          fontSize: 18,
          width: '100%',
          padding: '8px 12px 8px 28px',
          textAlign: 'right',
          outline: 'none',
          opacity: disabled ? 0.5 : 1,
          appearance: 'textfield',
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onFocus={e => e.target.select()}
        autoComplete="off"
      />
      {!disabled && <Stepper value={value||0} setValue={v => {
        setValue(v);
        if (integerOnly) setValueInput(v.toString());
        else setValueInput(v.toString().replace('.', ','));
      }} min={min} max={undefined} step={step} color={isGreen ? '#18C964' : '#FFD600'} disabled={disabled} />}
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
              min={5}
              step={1}
              onChange={e => {
                let val = parseInt(e.target.value.replace(/[^\d]/g, '')) || 5;
                if (val < 5) val = 5;
                setUserMaxCompletions(val);
              }}
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
            <Stepper value={userMaxCompletions} setValue={v=>setUserMaxCompletions(v < 5 ? 5 : v)} min={5} max={undefined} step={1} color="#18C964" disabled={false} />
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
        <Image src="/company.svg" alt="Company" width={96} height={96} style={{ marginRight: 16 }} />
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>Rewards or not ?</h1>
        <span
          style={{ fontSize: 36, marginLeft: 16, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => setShowModal(true)}
          aria-label="Show info"
        >
          <Image src="/tooltip.svg" alt="Info" width={36} height={36} />
        </span>
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
              <span style={{ color: '#FFD600', fontWeight: 700 }}>☑️ No Reward to give ? No problem ! Unlimited and free completions<br/>+ $1000</span>
              <br/><br/>
              In this case:
              <ul style={{ margin: '8px 0 8px 18px' }}>
                <li>You skip the reward setup entirely.</li>
                <li>Community unlimited members can participate for free during 7 days.</li>
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
            <h2 style={{ color: (freeReward || (!!unitValue && !!netProfit)) ? '#18C964' : '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center', transition: 'color 0.2s' }}>Rewards</h2>
            <div style={{ border: `2px solid ${(freeReward || (!!unitValue && !!netProfit)) ? '#18C964' : '#FFD600'}`, borderRadius: 16, padding: 32, marginBottom: 16, maxWidth: 500, width: '100%', transition: 'border-color 0.2s' }}>
              {/* Si pas freeReward, afficher les deux champs */}
              {!freeReward && <>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ color: (!!unitValue && !!netProfit) ? '#18C964' : '#FFD600', fontWeight: 600, fontSize: 18, flex: 1, transition: 'color 0.2s' }}>Unit Value of the Completion</span>
                  {renderMoneyInput(unitValue, setUnitValue, unitValueInput, setUnitValueInput, freeReward, 0.01, 0, 4, (!!unitValue && !!netProfit), false)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ color: (!!unitValue && !!netProfit) ? '#18C964' : '#FFD600', fontWeight: 600, fontSize: 18, flex: 1, transition: 'color 0.2s' }}>Net Profits targeted</span>
                  {renderMoneyInput(netProfit, setNetProfit, netProfitInput, setNetProfitInput, freeReward, 1, 0, 0, (!!unitValue && !!netProfit), true)}
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
        {/* Bloc "Or not" harmonisé, affiché seulement si freeReward n'est pas coché */}
        {!freeReward && (
          <div style={{ margin: '48px 0 40px 0', textAlign: 'center', width: '100%' }}>
            <h2 style={{ color: noReward ? '#18C964' : '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 8, transition: 'color 0.2s' }}>Or not</h2>
            <div
              style={{
                border: `2px solid ${noReward ? '#18C964' : '#FFD600'}`,
                borderRadius: 16,
                padding: 32,
                margin: '0 auto',
                maxWidth: 500,
                width: '100%',
                background: noReward ? '#000' : '#181818',
                display: 'flex',
                alignItems: 'center',
                transition: 'border-color 0.2s, background 0.2s',
                boxSizing: 'border-box',
              }}
            >
              <input
                type="checkbox"
                id="noRewardCheckbox"
                checked={noReward}
                onChange={handleNoRewardChange}
                style={{
                  width: 24,
                  height: 24,
                  accentColor: noReward ? '#18C964' : '#FFD600',
                  transition: 'accent-color 0.2s',
                }}
              />
              <label
                htmlFor="noRewardCheckbox"
                style={{
                  fontSize: 18,
                  color: noReward ? '#18C964' : '#FFD600',
                  fontWeight: 700,
                  cursor: 'pointer',
                  lineHeight: 1.2,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s',
                }}
              >
                <span style={{ fontWeight: 700, color: noReward ? '#18C964' : '#FFD600', marginRight: 8 }}>No Reward to give?</span>
                <span style={{ color: noReward ? '#18C964' : '#fff', fontWeight: 400, marginRight: 8 }}>No Problem, free completions</span>
                <span style={{ color: noReward ? '#18C964' : '#FFD600', fontWeight: 900 }}>+${'1000'}</span>
              </label>
            </div>
          </div>
        )}
      </main>
      <GreenArrowButton onClick={handleNext} disabled={!canProceed} />
    </div>
  );
} 