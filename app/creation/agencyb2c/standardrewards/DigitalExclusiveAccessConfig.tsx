"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../b2c/standardrewards/Rewards.module.css';

export default function AgencyB2CDigitalExclusiveAccessConfig({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [accessName, setAccessName] = useState('');
  const [accessDescription, setAccessDescription] = useState('');
  const [accessType, setAccessType] = useState('Private Link');
  const [accessUrl, setAccessUrl] = useState('');
  const [maxAccesses, setMaxAccesses] = useState('');
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
      const savedConfig = JSON.parse(localStorage.getItem('standardDigitalAccessReward') || 'null');
      
      if (savedConfig) {
        setAccessName(savedConfig.accessName || '');
        setAccessDescription(savedConfig.accessDescription || '');
        setAccessType(savedConfig.accessType || 'Private Link');
        setAccessUrl(savedConfig.accessUrl || '');
        setMaxAccesses(savedConfig.maxAccesses || '');
        setBlockchain(savedConfig.blockchain || 'Ethereum');
        setTokenStandard(savedConfig.tokenStandard || 'ERC721');
        setContractAddress(savedConfig.contractAddress || '');
        setTokenId(savedConfig.tokenId || '');
      }
      
      // Simuler une adresse de wallet connectée
      setWalletAddress('0x1234567890abcdef1234567890abcdef12345678');
    }
  }, []);

  const canConfirm = accessName && accessDescription && accessUrl;

  const handleBlockchainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBlockchain(e.target.value);
    // Reset token standard based on blockchain
    if (e.target.value === 'Solana') {
      setTokenStandard('SPL');
    } else if (e.target.value === 'Bitcoin') {
      setTokenStandard('BRC721');
    } else {
      setTokenStandard('ERC721');
    }
  };

  const handleContractAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContractAddress(e.target.value);
    setError('');
  };

  const handleTokenIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenId(e.target.value);
    setError('');
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    
    setIsValidating(true);
    setError('');
    
    try {
      // Simuler une validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sauvegarder la configuration
      const config = {
        accessName,
        accessDescription,
        accessType,
        accessUrl,
        maxAccesses,
        blockchain,
        tokenStandard,
        contractAddress,
        tokenId
      };
      
      // Clear all other standard reward types before saving the new one
      localStorage.removeItem('standardTokenReward');
      localStorage.removeItem('standardItemReward');
      localStorage.removeItem('standardPhysicalAccessReward');
      
      localStorage.setItem('standardDigitalAccessReward', JSON.stringify(config));
      
      setIsConfirmed(true);
      setIsValidating(false);
      
      // Rediriger après confirmation
      setTimeout(() => {
        router.push('/creation/agencyb2c/standardrewards');
      }, 1500);
      
    } catch (err) {
      setError('An error occurred during validation. Please try again.');
      setIsValidating(false);
    }
  };

  const getButtonText = () => {
    if (isConfirmed) return '✅ Configuration Confirmed!';
    if (isValidating) return 'Validating...';
    return 'Confirm Digital Access Reward Configuration';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="close">✖️</button>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button style={{ border: '2px solid #9B59B6', color: '#9B59B6', background: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center' }}>
            🔗 <span style={{ marginLeft: 10, fontStyle: 'italic' }}>Digital Access</span>
          </button>
        </div>
        
        <h2 style={{ color: '#FFD600', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>
          Standard Rewards <span style={{ color: '#9B59B6' }}>Digital Exclusive Access</span>
        </h2>
        
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, color: '#fff' }}>
          Configure your digital exclusive access reward for validated completers.
        </div>
        
        <div style={{ color: '#00C46C', fontWeight: 600, marginBottom: 24, padding: 12, background: 'rgba(0, 196, 108, 0.1)', borderRadius: 8, border: '1px solid #00C46C' }}>
          ✅ Winstory will automatically mint and distribute access NFTs to validated completers if no contract is provided.
        </div>
        
        {/* Wallet Connection Status */}
        {walletAddress && (
          <div style={{ 
            background: 'rgba(155, 89, 182, 0.1)', 
            padding: 8, 
            borderRadius: 6, 
            border: '1px solid #9B59B6',
            marginBottom: 12,
            fontSize: 12
          }}>
            <span style={{ color: '#9B59B6', fontWeight: 600 }}>✅ Connected:</span> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        )}
        
        {error && <div style={{ color: 'red', fontWeight: 600, marginBottom: 12 }}>{error}</div>}

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
                placeholder="e.g., Exclusive Webinar Access"
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
                placeholder="Describe the digital access..."
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

            {/* Access Type */}
            <div>
              <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Access Type</label>
              <select
                value={accessType}
                onChange={(e) => setAccessType(e.target.value)}
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
                <option value="Private Link">🔑 Private Link (Zoom, Discord, etc.)</option>
                <option value="Content">🎬 Content (Video, Audio, File)</option>
                <option value="Code/Key">🔓 Code/Key (API, Promo Code)</option>
                <option value="File/Media">📁 File/Media (Download, Stream)</option>
              </select>
            </div>

            {/* Access URL */}
            <div>
              <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Access URL or Delivery Method</label>
              <input
                type="url"
                value={accessUrl}
                onChange={(e) => setAccessUrl(e.target.value)}
                placeholder="https://..., Zoom link, Discord invite, download URL"
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
                      color: '#fff', 
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
                      color: '#fff', 
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
              </div>
              
              <div style={{ color: '#00C46C', fontWeight: 600, marginTop: 16, padding: 12, background: 'rgba(0, 196, 108, 0.1)', borderRadius: 8, border: '1px solid #00C46C', fontSize: 14 }}>
                ✅ If a contract is provided, Winstory uses your existing tokens.
              </div>
            </div>
          )}
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
            background: canConfirm && !isConfirmed ? '#9B59B6' : '#666',
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
  );
} 