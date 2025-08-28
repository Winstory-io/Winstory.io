'use client';

import React, { useState } from 'react';
import styles from './Rewards.module.css';

export default function PhysicalExclusiveAccessConfig({ onClose }: { onClose: () => void }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [accessName, setAccessName] = useState('');
  const [accessDescription, setAccessDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [maxAccesses, setMaxAccesses] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [blockchain, setBlockchain] = useState('Ethereum');

  const canComplete = accessName && accessDescription && eventDate && eventTime && eventLocation;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="close">✖️</button>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button style={{ border: '2px solid #00C46C', color: '#00C46C', background: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center' }}>
            🎫 <span style={{ marginLeft: 10, fontStyle: 'italic' }}>Physical Access</span>
          </button>
        </div>
        
        <h2 style={{ color: '#FFD600', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>
          Standard Rewards <span style={{ color: '#00C46C' }}>Physical Exclusive Access</span>
        </h2>
        
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, color: '#fff' }}>
          Configure your physical exclusive access reward for validated completers.
        </div>
        
        <div style={{ color: '#00C46C', fontWeight: 600, marginBottom: 24, padding: 12, background: 'rgba(0, 196, 108, 0.1)', borderRadius: 8, border: '1px solid #00C46C' }}>
          ✅ Winstory will automatically mint and distribute access NFTs to validated completers if no contract is provided.
        </div>

        {/* Basic Information Section */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#FFD600', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Step 1: Fill in basic information</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Access Name */}
            <div>
              <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Access Name</label>
              <input
                type="text"
                value={accessName}
                onChange={(e) => setAccessName(e.target.value)}
                placeholder="e.g., VIP Event Access"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '2px solid #FFD600',
                  background: 'none',
                  color: '#fff',
                  fontSize: 16
                }}
              />
            </div>

            {/* Access Description */}
            <div>
              <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Access Description</label>
              <textarea
                value={accessDescription}
                onChange={(e) => setAccessDescription(e.target.value)}
                placeholder="Describe the physical access..."
                rows={3}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '2px solid #FFD600',
                  background: 'none',
                  color: '#fff',
                  fontSize: 16,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Event Date & Time */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: '2px solid #FFD600',
                    background: 'none',
                    color: '#fff',
                    fontSize: 16
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Event Time</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: '2px solid #FFD600',
                    background: 'none',
                    color: '#fff',
                    fontSize: 16
                  }}
                />
              </div>
            </div>

            {/* Event Location */}
            <div>
              <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Event Location</label>
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="e.g., Paris, France"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '2px solid #FFD600',
                  background: 'none',
                  color: '#fff',
                  fontSize: 16
                }}
              />
            </div>

            {/* Max Accesses */}
            <div>
              <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                Max. number of accesses <span style={{ color: '#888', fontSize: 14 }}>(optional)</span>
              </label>
              <input
                type="number"
                value={maxAccesses}
                onChange={(e) => setMaxAccesses(e.target.value)}
                placeholder="Leave blank for unlimited"
                min="1"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '2px solid #FFD600',
                  background: 'none',
                  color: '#fff',
                  fontSize: 16
                }}
              />
              <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                💡 Leave blank for unlimited access
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Web3 Configuration Section */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '2px solid #666',
              background: 'none',
              color: '#666',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>⚡ Advanced Web3 configuration</span>
            <span>{showAdvanced ? '▼' : '▶'}</span>
          </button>
          
          {showAdvanced && (
            <div style={{ marginTop: 16, padding: 16, background: 'rgba(255, 214, 0, 0.05)', borderRadius: 8, border: '1px solid #333' }}>
              <div style={{ color: '#FFD600', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>
                For agencies or advanced users who already have NFTs
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Blockchain */}
                <div>
                  <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Blockchain</label>
                  <select
                    value={blockchain}
                    onChange={(e) => setBlockchain(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: '2px solid #FFD600',
                      background: 'none',
                      color: '#fff',
                      fontSize: 16
                    }}
                  >
                    <option value="Ethereum">Ethereum</option>
                    <option value="Polygon">Polygon</option>
                    <option value="BNB Chain">BNB Chain</option>
                    <option value="Avalanche">Avalanche</option>
                    <option value="Chiliz">Chiliz</option>
                  </select>
                </div>

                {/* Contract Address */}
                <div>
                  <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Contract Address</label>
                  <input
                    type="text"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="0x..."
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: '2px solid #FFD600',
                      background: 'none',
                      color: '#fff',
                      fontSize: 16
                    }}
                  />
                </div>

                {/* Token ID */}
                <div>
                  <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Token ID</label>
                  <input
                    type="number"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    placeholder="0"
                    min="0"
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: '2px solid #FFD600',
                      background: 'none',
                      color: '#fff',
                      fontSize: 16
                    }}
                  />
                </div>
              </div>
              
              <div style={{ color: '#00C46C', fontWeight: 600, marginTop: 16, padding: 12, background: 'rgba(0, 196, 108, 0.1)', borderRadius: 8, border: '1px solid #00C46C', fontSize: 14 }}>
                ✅ If a contract is provided, Winstory uses your existing tokens.
              </div>
            </div>
          )}
        </div>

        {/* Complete Configuration Button */}
        <button
          onClick={onClose}
          disabled={!canComplete}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 8,
            border: 'none',
            background: canComplete ? '#00C46C' : '#666',
            color: '#000',
            fontWeight: 700,
            fontSize: 16,
            cursor: canComplete ? 'pointer' : 'not-allowed'
          }}
        >
          Complete Configuration
        </button>
      </div>
    </div>
  );
} 