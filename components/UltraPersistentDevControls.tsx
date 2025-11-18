'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface UltraPersistentDevControlsProps {
  stakerData: {
    stakedAmount: number;
    stakeAgeDays: number;
    moderatorXP: number;
    isEligible: boolean;
  } | null;
  onStakerDataUpdate: (data: {
    stakedAmount: number;
    stakeAgeDays: number;
    moderatorXP: number;
    isEligible: boolean;
  } | null) => void;
}

const UltraPersistentDevControls: React.FC<UltraPersistentDevControlsProps> = ({
  stakerData,
  onStakerDataUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [globalStakerData, setGlobalStakerData] = useState(stakerData);

  // Synchroniser avec les données globales
  useEffect(() => {
    if (stakerData) {
      setGlobalStakerData(stakerData);
    }
  }, [stakerData]);

  useEffect(() => {
    setMounted(true);
    console.log('🎮 [ULTRA PERSISTENT DEV CONTROLS] Component mounted');
    
    // Force la création d'un élément dans le DOM qui ne peut pas être supprimé
    const existingButton = document.getElementById('ultra-persistent-dev-controls');
    if (!existingButton) {
      const button = document.createElement('div');
      button.id = 'ultra-persistent-dev-controls';
      button.style.cssText = `
        position: fixed !important;
        right: 20px !important;
        bottom: 140px !important;
        z-index: 999999 !important;
        pointer-events: auto !important;
        background: #FFD600 !important;
        color: #000 !important;
        border: 3px solid #000 !important;
        border-radius: 12px !important;
        padding: 12px 16px !important;
        font-weight: 800 !important;
        cursor: pointer !important;
        font-size: 14px !important;
        box-shadow: 0 4px 20px rgba(255, 214, 0, 0.8) !important;
        transition: all 0.3s ease !important;
        min-width: 200px !important;
        text-align: center !important;
        display: block !important;
        font-family: inherit !important;
      `;
      button.innerHTML = '🎮 Moderation Dev Controls';
      button.title = 'Dev Controls de Modération - ULTRA PERSISTENT';
      
      // Ajouter les événements
      button.addEventListener('click', () => {
        console.log('🎮 [ULTRA PERSISTENT DEV CONTROLS] Button clicked');
        setIsOpen(!isOpen);
      });
      
      button.addEventListener('mouseenter', (e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.background = '#FFE55C';
        target.style.transform = 'scale(1.05)';
      });
      
      button.addEventListener('mouseleave', (e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.background = '#FFD600';
        target.style.transform = 'scale(1)';
      });
      
      document.body.appendChild(button);
      console.log('🎮 [ULTRA PERSISTENT DEV CONTROLS] Button added to DOM');
    }
  }, []);

  // Empêcher la suppression du bouton
  useEffect(() => {
    const checkButton = () => {
      const button = document.getElementById('ultra-persistent-dev-controls');
      if (!button) {
        console.log('🎮 [ULTRA PERSISTENT DEV CONTROLS] Button was removed! Recreating...');
        // Recréer le bouton s'il a été supprimé
        const newButton = document.createElement('div');
        newButton.id = 'ultra-persistent-dev-controls';
        newButton.style.cssText = `
          position: fixed !important;
          right: 20px !important;
          bottom: 140px !important;
          z-index: 999999 !important;
          pointer-events: auto !important;
          background: #FFD600 !important;
          color: #000 !important;
          border: 3px solid #000 !important;
          border-radius: 12px !important;
          padding: 12px 16px !important;
          font-weight: 800 !important;
          cursor: pointer !important;
          font-size: 14px !important;
          box-shadow: 0 4px 20px rgba(255, 214, 0, 0.8) !important;
          transition: all 0.3s ease !important;
          min-width: 200px !important;
          text-align: center !important;
          display: block !important;
          font-family: inherit !important;
        `;
        newButton.innerHTML = '🎮 Moderation Dev Controls';
        newButton.title = 'Dev Controls de Modération - ULTRA PERSISTENT';
        
        newButton.addEventListener('click', () => {
          console.log('🎮 [ULTRA PERSISTENT DEV CONTROLS] Button clicked');
          setIsOpen(!isOpen);
        });
        
        newButton.addEventListener('mouseenter', (e) => {
          const target = e.currentTarget as HTMLElement;
          target.style.background = '#FFE55C';
          target.style.transform = 'scale(1.05)';
        });
        
        newButton.addEventListener('mouseleave', (e) => {
          const target = e.currentTarget as HTMLElement;
          target.style.background = '#FFD600';
          target.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(newButton);
      }
    };

    // Vérifier toutes les 100ms
    const interval = setInterval(checkButton, 100);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const modalContent = isOpen ? (
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
            🎮 Ultra Persistent Dev Controls
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
                  onStakerDataUpdate(mockData);
                  console.log('🎮 [ULTRA PERSISTENT DEV CONTROLS] Applied mock eligible staker data');
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
                  onStakerDataUpdate(mockData);
                  console.log('🎮 [ULTRA PERSISTENT DEV CONTROLS] Applied mock non-eligible staker data');
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
                  onStakerDataUpdate(null);
                  console.log('🎮 [ULTRA PERSISTENT DEV CONTROLS] Cleared staker data');
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
            
            {globalStakerData && (
              <div style={{ 
                marginTop: 16, 
                padding: 12, 
                background: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: 6,
                fontSize: 12
              }}>
                <strong style={{ color: '#FFD600' }}>Current Data:</strong>
                <div style={{ marginTop: 4 }}>
                  <div>Staked: {globalStakerData.stakedAmount} WINC</div>
                  <div>Age: {globalStakerData.stakeAgeDays} days</div>
                  <div>XP: {globalStakerData.moderatorXP}</div>
                  <div>Eligible: {globalStakerData.isEligible ? '✅ Yes' : '❌ No'}</div>
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
          <strong>💡 Ultra Persistent:</strong> This Dev Controls component creates a DOM element that cannot be removed. 
          It monitors itself and recreates if deleted. It will stay visible even during wallet connection and campaign loading.
        </div>
      </div>
    </div>
  ) : null;

  return createPortal(modalContent, document.body);
};

export default UltraPersistentDevControls;
