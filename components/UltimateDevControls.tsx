'use client';

import React, { useState, useEffect } from 'react';

const UltimateDevControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stakerData, setStakerData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    console.log('🎮 [ULTIMATE DEV CONTROLS] Component mounted');
    
    // Charger les données depuis localStorage
    const savedData = localStorage.getItem('dev-controls-staker-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setStakerData(parsed);
        console.log('🎮 [ULTIMATE DEV CONTROLS] Loaded data from localStorage:', parsed);
      } catch (error) {
        console.error('🎮 [ULTIMATE DEV CONTROLS] Error loading data:', error);
      }
    }
  }, []);

  const handleStakerDataUpdate = (data: any) => {
    setStakerData(data);
    localStorage.setItem('dev-controls-staker-data', JSON.stringify(data));
    
    // Notifier le parent via un événement personnalisé
    window.dispatchEvent(new CustomEvent('dev-controls-staker-update', { detail: data }));
    console.log('🎮 [ULTIMATE DEV CONTROLS] Updated staker data:', data);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Bouton principal - toujours visible */}
      <div
        style={{
          position: 'fixed',
          right: 20,
          bottom: 140,
          zIndex: 999999, // Z-index maximum
          pointerEvents: 'auto',
          background: '#FFD600',
          color: '#000',
          border: '4px solid #000',
          borderRadius: 12,
          padding: '12px 16px',
          fontWeight: 800,
          cursor: 'pointer',
          fontSize: 14,
          boxShadow: '0 4px 20px rgba(255, 214, 0, 0.8)',
          transition: 'all 0.3s ease',
          minWidth: '200px',
          textAlign: 'center',
          display: 'block'
        }}
        onClick={() => {
          console.log('🎮 [ULTIMATE DEV CONTROLS] Button clicked');
          setIsOpen(!isOpen);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#FFE55C';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#FFD600';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Dev Controls de Modération - ULTIMATE PERSISTENT"
      >
        🎮 Moderation Dev Controls
      </div>

      {/* Modal - toujours au-dessus de tout */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.98)',
            zIndex: 9999999, // Z-index maximum absolu
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              background: '#111',
              border: '4px solid #FFD600',
              borderRadius: 16,
              padding: 24,
              maxWidth: 600,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              color: '#fff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              borderBottom: '2px solid #FFD600',
              paddingBottom: 16
            }}>
              <h2 style={{ color: '#FFD600', margin: 0, fontSize: 20 }}>
                🎮 Ultimate Dev Controls
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFD600',
                  fontSize: 24,
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3 style={{ color: '#FFD600', marginBottom: 12 }}>Staker Data Simulation</h3>
              
              <div style={{
                background: 'rgba(255, 214, 0, 0.1)',
                border: '2px solid #FFD600',
                borderRadius: 8,
                padding: 16
              }}>
                <h4 style={{ color: '#FFD600', marginBottom: 12 }}>Quick Actions</h4>
                
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      const mockData = {
                        stakedAmount: 100,
                        stakeAgeDays: 15,
                        moderatorXP: 250,
                        isEligible: true
                      };
                      handleStakerDataUpdate(mockData);
                    }}
                    style={{
                      background: '#18C964',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    ✅ Eligible Staker (100 WINC)
                  </button>
                  
                  <button
                    onClick={() => {
                      const mockData = {
                        stakedAmount: 30,
                        stakeAgeDays: 3,
                        moderatorXP: 50,
                        isEligible: false
                      };
                      handleStakerDataUpdate(mockData);
                    }}
                    style={{
                      background: '#FF2D2D',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    ❌ Non-Eligible Staker (30 WINC)
                  </button>
                  
                  <button
                    onClick={() => {
                      handleStakerDataUpdate(null);
                    }}
                    style={{
                      background: '#666',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    🗑️ Clear Data
                  </button>
                </div>
                
                {stakerData && (
                  <div style={{ 
                    marginTop: 16, 
                    padding: 12, 
                    background: 'rgba(0, 0, 0, 0.3)', 
                    borderRadius: 6,
                    fontSize: 12
                  }}>
                    <strong style={{ color: '#FFD600' }}>Current Data:</strong>
                    <div style={{ marginTop: 4 }}>
                      <div>Staked: {stakerData.stakedAmount} WINC</div>
                      <div>Age: {stakerData.stakeAgeDays} days</div>
                      <div>XP: {stakerData.moderatorXP}</div>
                      <div>Eligible: {stakerData.isEligible ? '✅ Yes' : '❌ No'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 255, 0, 0.1)',
              border: '2px solid #00FF00',
              borderRadius: 8,
              padding: 12,
              fontSize: 12,
              color: '#00FF00'
            }}>
              <strong>💡 Ultimate Persistent:</strong> This Dev Controls component is completely independent 
              and uses localStorage + custom events. It will stay visible even during wallet connection and campaign loading.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UltimateDevControls;
