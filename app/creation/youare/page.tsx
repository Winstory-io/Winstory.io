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

const cardStyle = {
  ...boxStyle,
  width: '400px',
  maxWidth: '95vw',
  margin: '0 auto 40px auto',
};

export default function YouAre() {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: yellow, fontFamily: 'Inter, sans-serif', position: 'relative', padding: 0 }}>
      {/* Red cross in top right */}
      <Link href="/welcome" style={{ position: 'absolute', top: 8, right: 24, zIndex: 10 }}>
        <span title="Close">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </span>
      </Link>

      {/* Title and clickable help emoji at top */}
      <div style={{ textAlign: 'center', marginTop: 80, marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: 1 }}>
          You are ?
        </span>
        <button
          aria-label="Show tooltip"
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8, padding: 0 }}
          onClick={() => setShowTooltip(true)}
        >
          <img src="/tooltip.svg" alt="Help" style={{ width: 36, height: 36 }} />
        </button>
      </div>

      {/* Main centered content (cards and central phrase) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: 32 }}>
        {/* Tooltip modal */}
        {showTooltip && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowTooltip(false)}>
            <div style={{ background: '#111', border: `2px solid ${yellow}`, borderRadius: 24, padding: 32, minWidth: 340, maxWidth: 480, color: yellow, position: 'relative', textAlign: 'center', boxShadow: '0 0 24px #000' }}
              onClick={e => e.stopPropagation()}>
              <button
                aria-label="Close tooltip"
                onClick={() => setShowTooltip(false)}
                style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 32, color: '#FF2D2D', cursor: 'pointer', fontWeight: 700 }}
              >
                ×
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
                <img src="/tooltip.svg" alt="Help" style={{ width: 40, height: 40 }} />
                <span style={{ fontSize: 24, fontWeight: 700, color: yellow, textShadow: '0 0 4px #FFD600' }}>
                  Who you are as Campaign Creator ?
                </span>
              </div>
              <div style={{ fontStyle: 'italic', color: '#fff', fontWeight: 500, fontSize: 16, marginBottom: 18, textAlign: 'left' }}>
                Choose your path wisely, it defines your creation rights, your reward system, and your business goals on Winstory.<br />
                Are you a B2C Company with a Neo-Marketing vision ?<br />
                Or an agency working on behalf of a client ?<br />
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
                  <li>✅ Use multiple payment methods : <br /><span style={{ fontStyle: 'italic', color: yellow }}>Apple Pay, PayPal, Visa/Mastercard, USDC etc.</span></li>
                  <li>✅ Earn revenue from your campaign</li>
                  <li>✅ Manage storytelling under your brand identity</li>
                </ul>
                <div style={{ color: '#2eea8b', fontWeight: 700, fontSize: 16, margin: '10px 0 18px 0', textAlign: 'center' }}>
                  You own the narrative.<br />
                  You build the audience.<br />
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
                  You grow your legend.<br />
                  You inspire the world.<br />
                  You Win visibility (& $WINC).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* B2C Brand */}
        <Link href="/creation/b2c/login" style={{ textDecoration: 'none' }}>
          <div style={{ ...cardStyle, marginBottom: 48 }}>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
              {/* Company SVG icon replaced with image */}
              <span>
                <img src="/company.svg" alt="B2C Brand Icon" style={{ width: 96, height: 96, display: 'block' }} />
              </span>
              <span style={{ fontSize: 32, fontWeight: 700, color: yellow, marginTop: 8 }}>B2C Brand</span>
            </span>
          </div>
        </Link>

        {/* Agency question */}
        <div style={{ textAlign: 'center', margin: '0 0 48px 0', minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Link href="/creation/agencyb2c/login" style={{ color: yellow, fontStyle: 'italic', textDecoration: 'underline', fontWeight: 600, fontSize: 20, display: 'inline-block', margin: '0 auto', padding: '12px 0' }}>
            You are an agency working with a B2C client ?
          </Link>
        </div>

        {/* Individual Member */}
        <Link href="/creation/individual/login" style={{ textDecoration: 'none' }}>
          <div style={cardStyle}>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
              {/* Individual SVG icon replaced with image */}
              <span>
                <img src="/individual.svg" alt="Individual Member Icon" style={{ width: 96, height: 96, display: 'block' }} />
              </span>
              <span style={{ fontSize: 32, fontWeight: 700, color: yellow, marginTop: 8 }}>Individual Member</span>
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
