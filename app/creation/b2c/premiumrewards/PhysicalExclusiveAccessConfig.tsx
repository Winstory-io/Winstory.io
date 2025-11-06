'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../standardrewards/Rewards.module.css';

export default function PhysicalExclusiveAccessConfig({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAdditionalSettings, setShowAdditionalSettings] = useState(false);
  const [accessName, setAccessName] = useState('');
  const [accessDescription, setAccessDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [maxAccesses, setMaxAccesses] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [blockchain, setBlockchain] = useState('Ethereum');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [claimDeadline, setClaimDeadline] = useState('');
  const [deliveryDeadline, setDeliveryDeadline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [userInstructions, setUserInstructions] = useState('');
  const [allowTransfer, setAllowTransfer] = useState(true);
  const [cancellationPolicy, setCancellationPolicy] = useState('');

  // Validation de la date d'événement
  const validateEventDate = (date: string) => {
    if (!date) return '';
    const eventDateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDateObj < today) {
      return 'Event date cannot be in the past';
    }
    
    // Délai minimum de 7 jours avant l'événement
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 7);
    if (eventDateObj < minDate) {
      return 'Event must be at least 7 days in the future to allow proper planning';
    }
    
    return '';
  };

  // Validation de la date limite de claim
  const validateClaimDeadline = (deadline: string) => {
    if (!deadline || !eventDate) return '';
    const deadlineDate = new Date(deadline);
    const eventDateObj = new Date(eventDate);
    
    if (deadlineDate >= eventDateObj) {
      return 'Claim deadline must be before the event date';
    }
    
    const today = new Date();
    if (deadlineDate < today) {
      return 'Claim deadline cannot be in the past';
    }
    
    return '';
  };

  // Validation de la date limite de livraison
  const validateDeliveryDeadline = (deadline: string) => {
    if (!deadline || !eventDate) return '';
    const deadlineDate = new Date(deadline);
    const eventDateObj = new Date(eventDate);
    
    // Délai minimum de 3 jours avant l'événement pour la livraison
    const minDeliveryDate = new Date(eventDateObj);
    minDeliveryDate.setDate(minDeliveryDate.getDate() - 3);
    
    if (deadlineDate >= eventDateObj) {
      return 'Delivery deadline must be at least 3 days before the event';
    }
    
    return '';
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
    // Format Ethereum: 0x suivi de 40 caractères hexadécimaux
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(address)) {
      return 'Invalid contract address format (must be 0x followed by 40 hex characters)';
    }
    return '';
  };

  const handleEventDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setEventDate(date);
    const error = validateEventDate(date);
    setErrors(prev => ({ ...prev, eventDate: error }));
  };

  const handleClaimDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const deadline = e.target.value;
    setClaimDeadline(deadline);
    const error = validateClaimDeadline(deadline);
    setErrors(prev => ({ ...prev, claimDeadline: error }));
  };

  const handleDeliveryDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const deadline = e.target.value;
    setDeliveryDeadline(deadline);
    const error = validateDeliveryDeadline(deadline);
    setErrors(prev => ({ ...prev, deliveryDeadline: error }));
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

  const hasErrors = Object.values(errors).some(error => error !== '');
  const canComplete = accessName && accessDescription && eventDate && eventTime && eventLocation && !hasErrors;

  const handleCompleteConfiguration = () => {
    if (!canComplete) return;
    
    // Save complete configuration in localStorage
    const config = {
      accessName,
      accessDescription,
      eventDate,
      eventTime,
      eventLocation,
      maxAccesses,
      contractAddress,
      tokenId,
      blockchain,
      // Nouveaux paramètres pour protection et pérennité
      timezone,
      claimDeadline,
      deliveryDeadline,
      contactEmail,
      contactPhone,
      userInstructions,
      allowTransfer,
      cancellationPolicy
    };
    
    localStorage.setItem('premiumPhysicalAccessReward', JSON.stringify(config));
    
    // Navigate to Recap page
    router.push('/creation/b2c/recap');
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="close">✖️</button>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button style={{ border: '2px solid #FFD600', color: '#FFD600', background: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center' }}>
            🎫 <span style={{ marginLeft: 10, fontStyle: 'italic' }}>Physical Access</span>
          </button>
        </div>
        
        <h2 style={{ color: '#FFD600', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>
          Premium Rewards <span style={{ color: '#FFD600' }}>Physical Exclusive Access</span>
        </h2>
        
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, color: '#fff' }}>
          Configure your physical exclusive access reward for the Top 3 validated completers (highest scores).
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
                <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                  Event Date <span style={{ color: '#FF2D2D', fontSize: 14 }}>*</span>
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={handleEventDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: errors.eventDate ? '2px solid #FF2D2D' : '2px solid #FFD600',
                    background: 'none',
                    color: '#fff',
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
                />
                {errors.eventDate && (
                  <div style={{ color: '#FF2D2D', fontSize: 12, marginTop: 4 }}>{errors.eventDate}</div>
                )}
                <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                  ⚠️ Event must be at least 7 days in the future
                </div>
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
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            
            {/* Timezone */}
            <div>
              <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                Timezone <span style={{ color: '#888', fontSize: 14 }}>(optional)</span>
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
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
                <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="UTC">UTC</option>
              </select>
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
            <span>⚙️ Additional Settings (Deadlines, Contact, Policies)</span>
            <span>{showAdditionalSettings ? '▼' : '▶'}</span>
          </button>
          
          {showAdditionalSettings && (
            <div style={{ marginTop: 16, padding: 16, background: 'rgba(255, 214, 0, 0.05)', borderRadius: 8, border: '1px solid #333' }}>
              <div style={{ color: '#FFD600', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>
                Configure deadlines and contact information to protect both creators and completers
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                    max={eventDate ? new Date(new Date(eventDate).getTime() - 86400000).toISOString().split('T')[0] : undefined}
                  style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: errors.claimDeadline ? '2px solid #FF2D2D' : '2px solid #FFD600',
                      background: 'none',
                      color: '#fff',
                    fontSize: 16,
                    boxSizing: 'border-box'
                    }}
                  />
                  {errors.claimDeadline && (
                    <div style={{ color: '#FF2D2D', fontSize: 12, marginTop: 4 }}>{errors.claimDeadline}</div>
                  )}
                  <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                    💡 Last date for completers to claim their reward (must be before event)
                  </div>
                </div>

                {/* Delivery Deadline */}
                <div>
                  <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                    Delivery Address Deadline <span style={{ color: '#888', fontSize: 14 }}>(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={deliveryDeadline}
                    onChange={handleDeliveryDeadlineChange}
                    min={new Date().toISOString().split('T')[0]}
                    max={eventDate ? new Date(new Date(eventDate).getTime() - 3 * 86400000).toISOString().split('T')[0] : undefined}
                  style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: errors.deliveryDeadline ? '2px solid #FF2D2D' : '2px solid #FFD600',
                      background: 'none',
                      color: '#fff',
                    fontSize: 16,
                    boxSizing: 'border-box'
                    }}
                  />
                  {errors.deliveryDeadline && (
                    <div style={{ color: '#FF2D2D', fontSize: 12, marginTop: 4 }}>{errors.deliveryDeadline}</div>
                  )}
                  <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                    💡 Last date for completers to provide shipping address (min. 3 days before event)
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
                    fontSize: 16,
                    boxSizing: 'border-box'
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
                    fontSize: 16,
                    boxSizing: 'border-box'
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
                    placeholder="Instructions on how to use the access, what to bring, dress code, etc."
                    rows={3}
                  style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: '2px solid #FFD600',
                      background: 'none',
                      color: '#fff',
                      fontSize: 16,
                    resize: 'vertical',
                    boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Cancellation Policy */}
                <div>
                  <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                    Cancellation Policy <span style={{ color: '#888', fontSize: 14 }}>(optional)</span>
                  </label>
                  <textarea
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value)}
                    placeholder="Policy for event cancellation, refunds, rescheduling, etc."
                    rows={3}
                  style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: '2px solid #FFD600',
                      background: 'none',
                      color: '#fff',
                      fontSize: 16,
                    resize: 'vertical',
                    boxSizing: 'border-box'
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
