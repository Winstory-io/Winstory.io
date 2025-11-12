"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../b2c/standardrewards/Rewards.module.css';

export default function AgencyB2CPhysicalExclusiveAccessConfig({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [accessName, setAccessName] = useState('');
  const [accessDescription, setAccessDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [blockchain, setBlockchain] = useState('Ethereum');
  const [tokenStandard, setTokenStandard] = useState('ERC721');
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Récupérer les données du localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = JSON.parse(localStorage.getItem('standardPhysicalAccessReward') || 'null');
      
      if (savedConfig) {
        setAccessName(savedConfig.accessName || '');
        setAccessDescription(savedConfig.accessDescription || '');
        setEventDate(savedConfig.eventDate || '');
        setEventLocation(savedConfig.eventLocation || '');
        setBlockchain(savedConfig.blockchain || 'Ethereum');
        setTokenStandard(savedConfig.tokenStandard || 'ERC721');
        setContractAddress(savedConfig.contractAddress || '');
        setTokenId(savedConfig.tokenId || '');
      }
      
      // Simuler une adresse de wallet connectée
      setWalletAddress('0x1234567890abcdef1234567890abcdef12345678');
    }
  }, []);

  // Event Date n'est plus requis (peut être du merchandising sans date d'événement)
  const canConfirm = accessName && accessDescription && contractAddress && tokenId;

  const handleTokenIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(value)) {
      setTokenId(value);
    }
  };

  const validateContractAddress = async (address: string) => {
    if (!address) return;
    
    setIsValidating(true);
    setError('');
    
    try {
      // Simulation de validation de contrat
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err) {
      setError('Invalid contract address or network error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleContractAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setContractAddress(address);
    
    if (address && address.length >= 42) {
      validateContractAddress(address);
    } else {
      setError('');
    }
  };

  const handleBlockchainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBlockchain(e.target.value);
    setError('');
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    
    const config = {
      accessName,
      accessDescription,
      eventDate,
      eventLocation,
      blockchain,
      tokenStandard,
      contractAddress,
      tokenId: parseInt(tokenId),
      walletAddress
    };
    
    // Clear all other standard reward types before saving the new one
    localStorage.removeItem('standardTokenReward');
    localStorage.removeItem('standardItemReward');
    localStorage.removeItem('standardDigitalAccessReward');
    
    localStorage.setItem('standardPhysicalAccessReward', JSON.stringify(config));
    setIsConfirmed(true);
    
    // Close modal after short delay
    router.push('/creation/agencyb2c/premiumrewards');
  };

  const getButtonText = () => {
    if (isConfirmed) return '✅ Configuration Saved!';
    if (isValidating) return '🔍 Checking contract...';
    if (!walletAddress) return '🔗 Connect Wallet First';
    if (!canConfirm) return '⚠️ Complete Configuration';
    return 'Confirm Physical Access Reward Configuration';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="close">✖️</button>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button style={{ border: '2px solid #E67E22', color: '#E67E22', background: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center' }}>
            🎫 <span style={{ marginLeft: 10, fontStyle: 'italic' }}>Physical Access</span>
          </button>
        </div>
        <h2 style={{ color: '#FFD600', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>Standard Rewards <span style={{ color: '#E67E22' }}>Physical Access</span></h2>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, color: '#fff' }}>
          Configure your physical exclusive access reward for validated completers.
        </div>
        <div style={{ color: '#FFD600', fontWeight: 700, marginBottom: 12 }}>
          ⚠️ Winstory will automatically handle distribution to validated completers only if your connected wallet holds enough access tokens.
        </div>
        
        {/* Wallet Connection Status */}
        {walletAddress && (
          <div style={{ 
            background: 'rgba(230, 126, 34, 0.1)', 
            padding: 8, 
            borderRadius: 6, 
            border: '1px solid #E67E22',
            marginBottom: 12,
            fontSize: 12
          }}>
            <span style={{ color: '#E67E22', fontWeight: 600 }}>✅ Connected:</span> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        )}
        
        {error && <div style={{ color: 'red', fontWeight: 600, marginBottom: 12 }}>{error}</div>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Blockchain Selection */}
          <div style={{ display: 'flex', gap: 12 }}>
            <select 
              value={blockchain}
              onChange={handleBlockchainChange}
              style={{ 
                flex: 1, 
                padding: 12, 
                borderRadius: 8, 
                border: '2px solid #FFD600', 
                background: 'none', 
                color: '#FFD600', 
                fontWeight: 600, 
                fontSize: 16 
              }}
            >
              <option value="Ethereum">Ethereum</option>
              <option value="Polygon">Polygon</option>
              <option value="BNB Chain">BNB Chain</option>
              <option value="Avalanche">Avalanche</option>
              <option value="Chiliz">Chiliz</option>
              <option value="Solana">Solana</option>
              <option value="Bitcoin">Bitcoin</option>
            </select>
            
            <select 
              value={tokenStandard}
              onChange={(e) => setTokenStandard(e.target.value)}
              style={{ 
                flex: 1, 
                padding: 12, 
                borderRadius: 8, 
                border: '2px solid #FFD600', 
                background: 'none', 
                color: '#FFD600', 
                fontWeight: 600, 
                fontSize: 16 
              }}
            >
              <option value="ERC721">ERC721</option>
              <option value="ERC1155">ERC1155</option>
              <option value="SPL">SPL NFT (Solana)</option>
              <option value="BRC721">BRC721 (Bitcoin)</option>
            </select>
          </div>

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

          {/* Event Date */}
          <div>
            <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
              Event Date <span style={{ color: '#888', fontSize: 12 }}>(optional - for events only)</span>
            </label>
            <input
              type="datetime-local"
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

          {/* Contract Address */}
          <div>
            <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Contract Address</label>
            <input
              type="text"
              value={contractAddress}
              onChange={handleContractAddressChange}
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
              onChange={handleTokenIdChange}
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

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isConfirmed || isValidating}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 8,
              border: 'none',
              background: canConfirm && !isConfirmed ? '#E67E22' : '#666',
              color: '#000',
              fontWeight: 700,
              fontSize: 16,
              cursor: canConfirm && !isConfirmed ? 'pointer' : 'not-allowed',
              marginTop: 16
            }}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
} 