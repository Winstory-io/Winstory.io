'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from '../standardrewards/Rewards.module.css';

export default function DigitalExclusiveAccessConfig({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAgencyB2C = pathname?.includes('/creation/agencyb2c/');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAdditionalSettings, setShowAdditionalSettings] = useState(false);
  const [accessName, setAccessName] = useState('');
  const [accessDescription, setAccessDescription] = useState('');
  const [accessType, setAccessType] = useState('Private Link');
  const [accessUrl, setAccessUrl] = useState('');
  const [maxAccesses, setMaxAccesses] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [blockchain, setBlockchain] = useState('Ethereum');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [urlValidationStatus, setUrlValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [contentType, setContentType] = useState('');
  const [codeType, setCodeType] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [claimDeadline, setClaimDeadline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [userInstructions, setUserInstructions] = useState('');
  const [allowTransfer, setAllowTransfer] = useState(true);
  const [allowSharing, setAllowSharing] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState('');

  // Validation d'URL robuste
  const validateUrl = (url: string): string => {
    if (!url) return '';
    
    // Permettre les URLs spéciales (Zoom, Discord, etc.)
    const specialPatterns = [
      /^zoom\.us\/j\//i,
      /^discord\.gg\//i,
      /^discord\.com\/invite\//i,
      /^meet\.google\.com\//i,
      /^teams\.microsoft\.com\//i
    ];
    
    // Si c'est un pattern spécial sans https://, c'est OK
    if (specialPatterns.some(pattern => pattern.test(url))) {
      return '';
    }
    
    // Validation URL standard
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      
      // Vérifier le protocole (HTTPS recommandé)
      if (urlObj.protocol === 'http:') {
        return '⚠️ HTTP is not secure. Please use HTTPS for better security.';
      }
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return 'Invalid URL protocol. Only HTTP and HTTPS are allowed.';
      }
      
      // Vérifier que le domaine est valide
      if (!urlObj.hostname || urlObj.hostname.length < 3) {
        return 'Invalid domain name';
      }
      
      // Vérifier format basique
      if (urlObj.hostname.split('.').length < 2) {
        return 'Invalid domain format';
      }
      
      return '';
    } catch (e) {
      // Si l'URL n'est pas valide, essayer de détecter si c'est un code/key
      if (accessType === 'Code/Key') {
        // Pour les codes/keys, on accepte tout texte
        return '';
      }
      return 'Invalid URL format. Please enter a valid URL (https://example.com) or a special link (Zoom, Discord, etc.)';
    }
  };

  // Validation du format email
  const validateEmail = (email: string) => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Validation du format de l'adresse de contrat
  const validateContractAddress = (address: string) => {
    if (!address) return '';
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(address)) {
      return 'Invalid contract address format (must be 0x followed by 40 hex characters)';
    }
    return '';
  };

  // Validation de la date d'expiration
  const validateExpirationDate = (date: string) => {
    if (!date) return '';
    const expDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (expDate <= today) {
      return 'Expiration date must be in the future';
    }
    
    return '';
  };

  // Validation de la date limite de claim
  const validateClaimDeadline = (deadline: string) => {
    if (!deadline) return '';
    const deadlineDate = new Date(deadline);
    const today = new Date();
    
    if (deadlineDate < today) {
      return 'Claim deadline cannot be in the past';
    }
    
    if (expirationDate) {
      const expDate = new Date(expirationDate);
      if (deadlineDate >= expDate) {
        return 'Claim deadline must be before expiration date';
      }
    }
    
    return '';
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setAccessUrl(url);
    
    // Validation en temps réel
    if (url) {
      setUrlValidationStatus('validating');
      setTimeout(() => {
        const error = validateUrl(url);
        setErrors(prev => ({ ...prev, accessUrl: error }));
        setUrlValidationStatus(error ? 'invalid' : 'valid');
      }, 300);
    } else {
      setUrlValidationStatus('idle');
      setErrors(prev => ({ ...prev, accessUrl: '' }));
    }
  };

  const handleContactEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setContactEmail(email);
    const error = validateEmail(email);
    setErrors(prev => ({ ...prev, contactEmail: error }));
  };

  const handleContractAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setContractAddress(address);
    if (address) {
      const error = validateContractAddress(address);
      setErrors(prev => ({ ...prev, contractAddress: error }));
    } else {
      setErrors(prev => ({ ...prev, contractAddress: '' }));
    }
  };

  const handleExpirationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setExpirationDate(date);
    const error = validateExpirationDate(date);
    setErrors(prev => ({ ...prev, expirationDate: error }));
    // Re-validate claim deadline if expiration date changed
    if (claimDeadline) {
      const claimError = validateClaimDeadline(claimDeadline);
      setErrors(prev => ({ ...prev, claimDeadline: claimError }));
    }
  };

  const handleClaimDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const deadline = e.target.value;
    setClaimDeadline(deadline);
    const error = validateClaimDeadline(deadline);
    setErrors(prev => ({ ...prev, claimDeadline: error }));
  };

  const hasErrors = Object.values(errors).some(error => error !== '');
  const canComplete = accessName && accessDescription && accessUrl && !hasErrors;

  const handleCompleteConfiguration = () => {
    if (!canComplete) return;
    
    // Save complete configuration in localStorage
    const config = {
      accessName,
      accessDescription,
      accessType,
      accessUrl,
      maxAccesses,
      contractAddress,
      tokenId,
      blockchain,
      // Nouveaux paramètres pour protection et pérennité
      contentType,
      codeType,
      expirationDate,
      claimDeadline,
      contactEmail,
      contactPhone,
      userInstructions,
      allowTransfer,
      allowSharing,
      privacyPolicy
    };
    
    // Clear all other premium reward types before saving the new one
    localStorage.removeItem('premiumTokenReward');
    localStorage.removeItem('premiumItemReward');
    localStorage.removeItem('premiumPhysicalAccessReward');
    
    localStorage.setItem('premiumDigitalAccessReward', JSON.stringify(config));
    
    // Navigate to Recap page
    router.push(isAgencyB2C ? '/creation/agencyb2c/recap' : '/creation/b2c/recap');
  };

  // Déterminer le type de contenu basé sur accessType
  const getContentTypeOptions = () => {
    switch (accessType) {
      case 'Content':
        return ['Video', 'Audio', 'Document', 'Image', 'Interactive'];
      case 'Code/Key':
        return ['Promo Code', 'API Key', 'License Key', 'Access Code', 'Coupon'];
      case 'File/Media':
        return ['Download', 'Stream', 'Archive', 'Software'];
      default:
        return [];
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="close">✖️</button>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button style={{ border: '2px solid #FFD600', color: '#FFD600', background: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center' }}>
            🔗 <span style={{ marginLeft: 10, fontStyle: 'italic' }}>Digital Access</span>
          </button>
        </div>
        
        <h2 style={{ color: '#FFD600', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>
          Premium Rewards <span style={{ color: '#FFD600' }}>Digital Exclusive Access</span>
        </h2>
        
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, color: '#fff' }}>
          Configure your digital exclusive access reward for the Top 3 validated completers (highest scores).
        </div>
        
        <div style={{ color: '#FFD600', fontWeight: 600, marginBottom: 24, padding: 12, background: 'rgba(255, 214, 0, 0.1)', borderRadius: 8, border: '1px solid #FFD600' }}>
          ⚡ Distribution only to the Top 3 validated completers (highest scores).
        </div>
        
        <div style={{ color: '#00C46C', fontWeight: 600, marginBottom: 24, padding: 12, background: 'rgba(0, 196, 108, 0.1)', borderRadius: 8, border: '1px solid #00C46C' }}>
          ✅ Winstory will automatically mint and distribute access NFTs to Top 3 completers if no contract is provided.
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
                onChange={(e) => {
                  setAccessType(e.target.value);
                  setContentType(''); // Reset content type when access type changes
                }}
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

            {/* Content Type (conditional) */}
            {getContentTypeOptions().length > 0 && (
              <div>
                <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                  Content/Code Type <span style={{ color: '#888', fontSize: 14 }}>(optional)</span>
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
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
                  <option value="">Select type...</option>
                  {getContentTypeOptions().map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Access URL */}
            <div>
              <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                Access URL or Delivery Method <span style={{ color: '#FF2D2D', fontSize: 14 }}>*</span>
              </label>
              <input
                type="text"
                value={accessUrl}
                onChange={handleUrlChange}
                placeholder="https://..., zoom.us/j/..., discord.gg/..., or code/key"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: errors.accessUrl ? '2px solid #FF2D2D' : (urlValidationStatus === 'valid' ? '2px solid #00C46C' : '2px solid #FFD600'),
                  background: 'none',
                  color: '#fff',
                  fontSize: 16
                }}
              />
              {urlValidationStatus === 'validating' && (
                <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Validating URL...</div>
              )}
              {errors.accessUrl && (
                <div style={{ color: errors.accessUrl.includes('⚠️') ? '#FFD600' : '#FF2D2D', fontSize: 12, marginTop: 4 }}>{errors.accessUrl}</div>
              )}
              {urlValidationStatus === 'valid' && !errors.accessUrl && (
                <div style={{ color: '#00C46C', fontSize: 12, marginTop: 4 }}>✓ Valid URL format</div>
              )}
              <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                💡 Supports: HTTPS URLs, Zoom links, Discord invites, Google Meet, Teams, or access codes
              </div>
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

        {/* Additional Settings Section */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setShowAdditionalSettings(!showAdditionalSettings)}
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
            <span>⚙️ Additional Settings (Deadlines, Expiration, Contact, Policies)</span>
            <span>{showAdditionalSettings ? '▼' : '▶'}</span>
          </button>
          
          {showAdditionalSettings && (
            <div style={{ marginTop: 16, padding: 16, background: 'rgba(255, 214, 0, 0.05)', borderRadius: 8, border: '1px solid #333' }}>
              <div style={{ color: '#FFD600', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>
                Configure deadlines, expiration, and contact information to protect both creators and completers
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Expiration Date */}
                <div>
                  <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                    Access Expiration Date <span style={{ color: '#888', fontSize: 14 }}>(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={handleExpirationDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: errors.expirationDate ? '2px solid #FF2D2D' : '2px solid #FFD600',
                      background: 'none',
                      color: '#fff',
                      fontSize: 16
                    }}
                  />
                  {errors.expirationDate && (
                    <div style={{ color: '#FF2D2D', fontSize: 12, marginTop: 4 }}>{errors.expirationDate}</div>
                  )}
                  <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                    💡 Leave blank for unlimited access duration
                  </div>
                </div>

                {/* Claim Deadline */}
                <div>
                  <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                    Claim Deadline <span style={{ color: '#888', fontSize: 14 }}>(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={claimDeadline}
                    onChange={handleClaimDeadlineChange}
                    min={new Date().toISOString().split('T')[0]}
                    max={expirationDate || undefined}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: errors.claimDeadline ? '2px solid #FF2D2D' : '2px solid #FFD600',
                      background: 'none',
                      color: '#fff',
                      fontSize: 16
                    }}
                  />
                  {errors.claimDeadline && (
                    <div style={{ color: '#FF2D2D', fontSize: 12, marginTop: 4 }}>{errors.claimDeadline}</div>
                  )}
                  <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                    💡 Last date for completers to claim their reward
                  </div>
                </div>

                {/* Contact Email */}
                <div>
                  <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                    Contact Email <span style={{ color: '#888', fontSize: 14 }}>(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={handleContactEmailChange}
                    placeholder="support@yourcompany.com"
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: errors.contactEmail ? '2px solid #FF2D2D' : '2px solid #FFD600',
                      background: 'none',
                      color: '#fff',
                      fontSize: 16
                    }}
                  />
                  {errors.contactEmail && (
                    <div style={{ color: '#FF2D2D', fontSize: 12, marginTop: 4 }}>{errors.contactEmail}</div>
                  )}
                </div>

                {/* Contact Phone */}
                <div>
                  <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                    Contact Phone <span style={{ color: '#888', fontSize: 14 }}>(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+33 1 23 45 67 89"
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

                {/* User Instructions */}
                <div>
                  <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                    Instructions for Users <span style={{ color: '#888', fontSize: 14 }}>(optional)</span>
                  </label>
                  <textarea
                    value={userInstructions}
                    onChange={(e) => setUserInstructions(e.target.value)}
                    placeholder="Instructions on how to use the access, system requirements, etc."
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

                {/* Privacy Policy */}
                <div>
                  <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                    Privacy Policy <span style={{ color: '#888', fontSize: 14 }}>(optional)</span>
                  </label>
                  <textarea
                    value={privacyPolicy}
                    onChange={(e) => setPrivacyPolicy(e.target.value)}
                    placeholder="Privacy policy, data usage, terms of access, etc."
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

                {/* Allow Transfer */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      checked={allowTransfer}
                      onChange={(e) => setAllowTransfer(e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                    Allow reward transfer to another wallet
                  </label>
                  <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                    💡 If enabled, completers can transfer their reward to another wallet address
                  </div>
                </div>

                {/* Allow Sharing */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      checked={allowSharing}
                      onChange={(e) => setAllowSharing(e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                    Allow sharing access link/code
                  </label>
                  <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                    💡 If enabled, completers can share their access link or code with others
                  </div>
                </div>
              </div>
            </div>
          )}
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
                    onChange={handleContractAddressChange}
                    placeholder="0x..."
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: errors.contractAddress ? '2px solid #FF2D2D' : '2px solid #FFD600',
                      background: 'none',
                      color: '#fff',
                      fontSize: 16
                    }}
                  />
                  {errors.contractAddress && (
                    <div style={{ color: '#FF2D2D', fontSize: 12, marginTop: 4 }}>{errors.contractAddress}</div>
                  )}
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
          onClick={handleCompleteConfiguration}
          disabled={!canComplete}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 8,
            border: 'none',
            background: canComplete ? '#FFD600' : '#666',
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
