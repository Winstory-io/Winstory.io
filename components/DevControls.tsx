"use client";

import { useState } from 'react';

interface DevControlsProps {
  onForceValidated?: (enabled: boolean) => void;
  forceValidated?: boolean;
  additionalControls?: React.ReactNode;
}

export default function DevControls({ onForceValidated, forceValidated = false, additionalControls }: DevControlsProps) {
  const [devOpen, setDevOpen] = useState(false);
  const isDev = process.env.NODE_ENV !== 'production';

  if (!isDev) return null;

  return (
    <>
      {!devOpen && (
        <button
          onClick={() => setDevOpen(true)}
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            background: '#111',
            color: '#FFD600',
            border: '1px solid #6B5A20',
            borderRadius: 12,
            padding: '10px 12px',
            fontWeight: 800,
            cursor: 'pointer',
            zIndex: 50,
            fontSize: 14
          }}
        >
          Dev Controls
        </button>
      )}

      {devOpen && (
        <div
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            width: 300,
            background: '#0a0a0a',
            border: '1px solid #6B5A20',
            borderRadius: 12,
            padding: 16,
            color: '#fff',
            zIndex: 60,
            boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <strong style={{ color: '#FFD600', fontSize: 16 }}>Dev Controls</strong>
            <button 
              onClick={() => setDevOpen(false)} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#C0C0C0', 
                cursor: 'pointer', 
                fontWeight: 800,
                fontSize: 18,
                padding: 0,
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {onForceValidated && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={forceValidated} 
                  onChange={(e) => onForceValidated(e.target.checked)}
                  style={{ accentColor: '#FFD600' }}
                />
                <span style={{ fontSize: 14 }}>Forcer "Validated Campaign"</span>
              </label>
            )}

            {additionalControls}

            <div style={{ 
              marginTop: 8, 
              fontSize: 11, 
              color: '#888',
              fontStyle: 'italic',
              borderTop: '1px solid #333',
              paddingTop: 8
            }}>
              Visible uniquement en développement. N'affecte pas la production.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
