'use client';
import Link from 'next/link';
import React, { useState } from 'react';

const yellow = '#FFD600';
const borderRadius = '16px';
const boxStyle = {
  border: `2px solid ${yellow}`,
  borderRadius,
  padding: '32px 0',
  margin: '0 0 24px 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.85)',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
};

export default function YouAre() {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: yellow, fontFamily: 'Inter, sans-serif', position: 'relative', padding: 0 }}>
      {/* Croix rouge en haut à droite */}
      <Link href="/welcome" style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <span title="Close">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round"/>
            <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </span>
      </Link>

      {/* Titre et ampoule emoji cliquable */}
      <div style={{ textAlign: 'center', marginTop: 80, marginBottom: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: 1 }}>
          You are ?
        </span>
        <button
          aria-label="Show tooltip"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 36, marginLeft: 8 }}
          onClick={() => setShowTooltip(true)}
        >
          💡
        </button>
      </div>

      {/* Tooltip modale */}
      {showTooltip && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: `2px solid ${yellow}`, borderRadius: 24, padding: 32, minWidth: 340, maxWidth: 480, color: yellow, position: 'relative', textAlign: 'center', boxShadow: '0 0 24px #000' }}>
            <button
              aria-label="Fermer le tooltip"
              onClick={() => setShowTooltip(false)}
              style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 32, color: '#FF2D2D', cursor: 'pointer', fontWeight: 700 }}
            >
              ×
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 40, filter: 'drop-shadow(0 0 6px #FFD600)' }}>💡</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: yellow, textShadow: '0 0 4px #FFD600' }}>
                Who you are as Campaign Creator ?
              </span>
            </div>
            <div style={{ fontStyle: 'italic', color: '#fff', fontWeight: 500, fontSize: 16, marginBottom: 18, textAlign: 'left' }}>
              Choose your path wisely, it defines your creation rights, your reward system, and your business goals on Winstory.<br/>
              Are you a B2C Company with a Neo-Marketing vision ?<br/>
              Or an agency working on behalf of a client ?<br/>
              Or an individual with a creative mission ?
            </div>
            <div style={{ textAlign: 'left', marginBottom: 18 }}>
              <div style={{ fontWeight: 700, color: yellow, fontSize: 22, display: 'flex', alignItems: 'center', gap: 8, margin: '18px 0 2px 0' }}>
                <span style={{ fontSize: 28 }}>🧳</span> B2C Brand
              </div>
              <div style={{ color: '#2eea8b', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
                For companies, agencies, marketing teams.
              </div>
              <ul style={{ color: '#fff', fontSize: 15, fontWeight: 500, margin: 0, padding: '0 0 0 18px', textAlign: 'left', marginBottom: 10 }}>
                <li>✅ Set ROI objectives and distribute custom Rewards (tokens, NFTs, exclusive access/events)</li>
                <li>✅ Collect contributions to boost brand visibility</li>
                <li>✅ Use multiple payment methods : <br/><span style={{ fontStyle: 'italic', color: yellow }}>Apple Pay, PayPal, Visa/Mastercard, USDC etc.</span></li>
                <li>✅ Earn revenue from your campaign</li>
                <li>✅ Manage storytelling under your brand identity</li>
              </ul>
              <div style={{ color: '#2eea8b', fontWeight: 700, fontSize: 16, margin: '10px 0 18px 0', textAlign: 'center' }}>
                You own the narrative.<br/>
                You build the audience.<br/>
                You Win your ecosystem.
              </div>
              <div style={{ fontWeight: 700, color: yellow, fontSize: 22, display: 'flex', alignItems: 'center', gap: 8, margin: '18px 0 2px 0' }}>
                <span style={{ fontSize: 28 }}>🧑‍🎤</span> Individual Member
              </div>
              <div style={{ color: '#2eea8b', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
                For creators, AI-artists, storytellers.
              </div>
              <ul style={{ color: '#fff', fontSize: 15, fontWeight: 500, margin: 0, padding: '0 0 0 18px', textAlign: 'left', marginBottom: 10 }}>
                <li>✅ Start a campaign using only $WINC</li>
                <li>✅ Contributors also pay and interact in $WINC</li>
                <li>✅ No external payment options</li>
                <li>✅ No financial ROI — only possible $WINC returns if 100% of completions are validated</li>
                <li>✅ Build your own universe, one frame at a time</li>
              </ul>
              <div style={{ color: '#2eea8b', fontWeight: 700, fontSize: 16, margin: '10px 0 0 0', textAlign: 'center' }}>
                You grow your legend.<br/>
                You inspire the world.<br/>
                You Win visibility (& $WINC).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B2C Brand */}
      <Link href="/creation/b2c/login" style={{ textDecoration: 'none' }}>
        <div style={{ ...boxStyle, margin: '0 24px 16px 24px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Mallette + graphique */}
            <span>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="16" width="32" height="20" rx="4" fill="#222" stroke={yellow} strokeWidth="2"/>
                <rect x="18" y="12" width="12" height="6" rx="2" fill="#222" stroke={yellow} strokeWidth="2"/>
                <rect x="14" y="28" width="4" height="6" rx="2" fill={yellow}/>
                <rect x="22" y="24" width="4" height="10" rx="2" fill={yellow}/>
                <rect x="30" y="20" width="4" height="14" rx="2" fill={yellow}/>
              </svg>
            </span>
            <span style={{ fontSize: 32, fontWeight: 700, color: yellow }}>B2C Brand</span>
          </span>
        </div>
      </Link>

      {/* Question agence */}
      <div style={{ textAlign: 'center', margin: '0 0 16px 0' }}>
        <Link href="/creation/agencyb2c/login" style={{ color: yellow, fontStyle: 'italic', textDecoration: 'underline', fontWeight: 600, fontSize: 20 }}>
          You are an agency working with a B2C client ?
        </Link>
      </div>

      {/* Individual Member */}
      <Link href="/creation/individual/login" style={{ textDecoration: 'none' }}>
        <div style={{ ...boxStyle, margin: '0 24px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Profil */}
            <span>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="18" r="10" fill="#222" stroke={yellow} strokeWidth="2"/>
                <rect x="10" y="32" width="28" height="10" rx="5" fill="#222" stroke={yellow} strokeWidth="2"/>
              </svg>
            </span>
            <span style={{ fontSize: 32, fontWeight: 700, color: yellow }}>Individual Member</span>
          </span>
        </div>
      </Link>
    </div>
  );
}
