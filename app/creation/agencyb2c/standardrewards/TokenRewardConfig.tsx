"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../b2c/standardrewards/Rewards.module.css';

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
}

export default function AgencyB2CTokenRewardConfig({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [amountPerUser, setAmountPerUser] = useState('');
  const [blockchain, setBlockchain] = useState('Ethereum');
  const [tokenStandard, setTokenStandard] = useState('ERC20');
  const [isValidating, setIsValidating] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [balanceError, setBalanceError] = useState('');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Récupérer les données du localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const roiData = JSON.parse(localStorage.getItem('roiData') || 'null');
      const maxCompletions = roiData?.maxCompletions || 0;
      const savedConfig = JSON.parse(localStorage.getItem('standardTokenReward') || 'null');
      
      if (savedConfig) {
        setTokenName(savedConfig.tokenName || '');
        setTokenSymbol(savedConfig.tokenSymbol || '');
        setContractAddress(savedConfig.contractAddress || '');
        setAmountPerUser(savedConfig.amountPerUser || '');
        setBlockchain(savedConfig.blockchain || 'Ethereum');
        setTokenStandard(savedConfig.tokenStandard || 'ERC20');
      }
      
      // Simuler une adresse de wallet connectée
      setWalletAddress('0x1234567890abcdef1234567890abcdef12345678');
    }
  }, []);

  const maxCompletions = JSON.parse(localStorage.getItem('roiData') || 'null')?.maxCompletions || 0;
  const totalTokens = parseFloat(amountPerUser || '0') * maxCompletions;

  const canConfirm = tokenName && tokenSymbol && contractAddress && amountPerUser && parseFloat(amountPerUser) > 0 && maxCompletions > 0;
  const hasEnoughBalance = tokenInfo && parseFloat(tokenInfo.balance) >= totalTokens;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmountPerUser(value);
    }
  };

  const validateContractAddress = async (address: string) => {
    if (!address) return;
    
    setIsValidating(true);
    setError('');
    
    try {
      // Simulation de validation de contrat
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simuler des informations de token
      setTokenInfo({
        name: 'Sample Token',
        symbol: 'SMPL',
        decimals: 18,
        totalSupply: '1000000000000000000000000',
        balance: '50000000000000000000000'
      });
      
      setBalanceLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setBalanceLoading(false);
      
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
      setTokenInfo(null);
      setError('');
    }
  };

  const handleBlockchainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBlockchain(e.target.value);
    setTokenInfo(null);
    setError('');
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    
    const config = {
      tokenName,
      tokenSymbol,
      contractAddress,
      amountPerUser: parseFloat(amountPerUser),
      blockchain,
      tokenStandard,
      hasEnoughBalance,
      walletAddress
    };
    
    localStorage.setItem('standardTokenReward', JSON.stringify(config));
    setIsConfirmed(true);
    
    // Close modal after short delay
    router.push('/creation/agencyb2c/premiumrewards');
  };

  const getButtonText = () => {
    if (isConfirmed) return '✅ Configuration Saved!';
    if (isValidating) return '🔍 Checking contract...';
    if (balanceLoading) return '💰 Fetching balance...';
    if (!walletAddress) return '🔗 Connect Wallet First';
    if (!canConfirm) return '⚠️ Complete Configuration';
    return 'Confirm Token Reward Configuration';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="close">✖️</button>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button style={{ border: '2px solid #00C46C', color: '#00C46C', background: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center' }}>
            🪙 <span style={{ marginLeft: 10, fontStyle: 'italic' }}>Tokens</span>
          </button>
        </div>
        <h2 style={{ color: '#FFD600', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>Standard Rewards <span style={{ color: '#00C46C' }}>Tokens</span></h2>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, color: '#fff' }}>
          Select the name, token contract address, and the number of tokens to send per validated completer.
        </div>
        <div style={{ color: '#FFD600', fontWeight: 700, marginBottom: 12 }}>
          ⚠️ Winstory will automatically handle distribution to validated completers only if your connected wallet holds enough tokens.
        </div>
        <div style={{ color: '#fff', marginBottom: 18, fontWeight: 600 }}>
          You must hold at least : <span style={{ color: '#FFD600', fontWeight: 700 }}>{totalTokens}</span> = <span style={{ color: '#FFD600' }}>{amountPerUser !== '' ? amountPerUser : '[Amount per user]'}</span> × {maxCompletions > 0 ? maxCompletions : '[Max completions]'}
        </div>
        
        {/* Wallet Connection Status */}
        {walletAddress && (
          <div style={{ 
            background: 'rgba(0, 196, 108, 0.1)', 
            padding: 8, 
            borderRadius: 6, 
            border: '1px solid #00C46C',
            marginBottom: 12,
            fontSize: 12
          }}>
            <span style={{ color: '#00C46C', fontWeight: 600 }}>✅ Connected:</span> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        )}
        
        {error && <div style={{ color: 'red', fontWeight: 600, marginBottom: 12 }}>{error}</div>}
        {balanceError && <div style={{ color: 'orange', fontWeight: 600, marginBottom: 12 }}>⚠️ {balanceError}</div>}
        
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
              <option value="ERC20">ERC20</option>
              <option value="ERC1155">ERC1155</option>
              <option value="SPL">SPL Token (Solana)</option>
              <option value="BRC20">BRC20 (Bitcoin)</option>
            </select>
          </div>

          {/* Token Name */}
          <div>
            <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Token Name</label>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="e.g., Winstory Token"
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

          {/* Token Symbol */}
          <div>
            <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Token Symbol</label>
            <input
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., WINC"
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

          {/* Amount per User */}
          <div>
            <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>Amount per User</label>
            <input
              type="number"
              value={amountPerUser}
              onChange={handleAmountChange}
              placeholder="0.0"
              step="0.1"
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

          {/* Token Info Display */}
          {tokenInfo && (
            <div style={{ 
              background: 'rgba(0, 196, 108, 0.1)', 
              padding: 16, 
              borderRadius: 8, 
              border: '1px solid #00C46C',
              marginTop: 8
            }}>
              <div style={{ color: '#00C46C', fontWeight: 600, marginBottom: 8 }}>✅ Token Found</div>
              <div style={{ fontSize: 14, color: '#fff' }}>
                <div>Name: {tokenInfo.name}</div>
                <div>Symbol: {tokenInfo.symbol}</div>
                <div>Decimals: {tokenInfo.decimals}</div>
                <div>Your Balance: {parseFloat(tokenInfo.balance).toLocaleString()} {tokenInfo.symbol}</div>
                <div style={{ marginTop: 8, fontWeight: 600, color: hasEnoughBalance ? '#00C46C' : '#ff6b6b' }}>
                  {hasEnoughBalance ? '✅ Sufficient Balance' : '❌ Insufficient Balance'}
                </div>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isConfirmed || isValidating || balanceLoading}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 8,
              border: 'none',
              background: canConfirm && !isConfirmed ? '#00C46C' : '#666',
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