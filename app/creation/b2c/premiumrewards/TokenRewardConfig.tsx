import React, { useEffect, useState } from 'react';
import styles from '../standardrewards/Rewards.module.css';
import { useWalletAddress } from '../../../../lib/hooks/useWalletConnection';

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
}

export default function TokenRewardConfig({ onClose }: { onClose: () => void }) {
  const [amountPerUser, setAmountPerUser] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [blockchain, setBlockchain] = useState<string>('Ethereum');
  const [tokenStandard, setTokenStandard] = useState<string>('ERC20');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('0');

  // Wallet connection
  const walletAddress = useWalletAddress();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setAmountPerUser('');
      setError(null);
      return;
    }
    const num = Number(val);
    if (isNaN(num) || num < 0.0001) {
      setError('Amount per user must be at least 0.0001');
    } else {
      setError(null);
    }
    setAmountPerUser(val === '' ? '' : num);
  };

  const validateContractAddress = async (address: string) => {
    if (!address || address.length < 10) return;
    
    setIsLoading(true);
    try {
      // Check if wallet is connected
      if (!walletAddress) {
        setError('Veuillez connecter votre wallet pour valider le contrat');
        setTokenInfo(null);
        return;
      }

      // Use real blockchain validation
      const { validateContract } = await import('../../../../lib/blockchain-rpc');
      
      const tokenInfo = await validateContract(address, blockchain, tokenStandard, walletAddress) as TokenInfo;
      
      setTokenInfo(tokenInfo);
      setError(null);
    } catch (error) {
      console.error('Validation error:', error);
      setError(error instanceof Error ? error.message : 'Invalid contract address or network error');
      setTokenInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContractAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setContractAddress(address);
    if (address) {
      validateContractAddress(address);
    } else {
      setTokenInfo(null);
    }
  };

  const totalTokens = typeof amountPerUser === 'number' && !error
    ? (amountPerUser * 3).toFixed(5)
    : '[X tokens]';

  const hasEnoughBalance = tokenInfo && walletBalance && 
    parseFloat(walletBalance) >= (typeof amountPerUser === 'number' ? amountPerUser * 3 : 0);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="close">✖️</button>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button style={{ border: '2px solid #00C46C', color: '#00C46C', background: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center' }}>
            🪙 <span style={{ marginLeft: 10, fontStyle: 'italic' }}>Tokens</span>
          </button>
        </div>
        <h2 style={{ color: '#FFD600', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>Premium Rewards <span style={{ color: '#00C46C' }}>Tokens</span></h2>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, color: '#fff' }}>
          Select the name, token contract address, and the number of tokens to send per 3 best completers.
        </div>
        <div style={{ color: '#FFD600', fontWeight: 700, marginBottom: 12 }}>
          ⚠️ Winstory will automatically handle distribution to 3 best completers only if your connected wallet holds enough tokens.
        </div>
        <div style={{ color: '#fff', marginBottom: 18, fontWeight: 600 }}>
          You must hold at least : <span style={{ color: '#FFD600', fontWeight: 700 }}>{totalTokens}</span> = <span style={{ color: '#FFD600' }}>{amountPerUser !== '' ? amountPerUser : '[Amount per user]'}</span> × 3
        </div>
        
        {error && <div style={{ color: 'red', fontWeight: 600, marginBottom: 12 }}>{error}</div>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Blockchain Selection */}
          <div style={{ display: 'flex', gap: 12 }}>
            <select 
              value={blockchain}
              onChange={(e) => setBlockchain(e.target.value)}
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

          <input 
            type="text" 
            placeholder="Name of the Token" 
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: '2px solid #FFD600', background: 'none', color: '#FFD600', fontWeight: 600, fontSize: 16 }} 
          />
          
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Token contract address" 
              value={contractAddress}
              onChange={handleContractAddressChange}
              style={{ 
                padding: 12, 
                borderRadius: 8, 
                border: '2px solid #FFD600', 
                background: 'none', 
                color: '#FFD600', 
                fontWeight: 600, 
                fontSize: 16,
                width: '100%'
              }} 
            />
            {isLoading && (
              <div style={{ 
                position: 'absolute', 
                right: 12, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#FFD600'
              }}>
                🔍
              </div>
            )}
          </div>

          {/* Token Info Display */}
          {tokenInfo && (
            <div style={{ 
              background: 'rgba(255, 215, 0, 0.1)', 
              padding: 12, 
              borderRadius: 8, 
              border: '1px solid #FFD600',
              marginBottom: 12
            }}>
              <div style={{ color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                ✅ Valid {tokenStandard} Contract
              </div>
              <div style={{ color: '#fff', fontSize: 14 }}>
                <div>Name: {tokenInfo.name}</div>
                <div>Symbol: {tokenInfo.symbol}</div>
                <div>Decimals: {tokenInfo.decimals}</div>
                <div>Your Balance: {walletBalance} {tokenInfo.symbol}</div>
              </div>
              {!hasEnoughBalance && (
                <div style={{ color: '#ff6b6b', fontWeight: 600, marginTop: 8 }}>
                  ⚠️ Insufficient balance for distribution
                </div>
              )}
            </div>
          )}

          <input
            type="number"
            min={0.0001}
            step={0.00001}
            value={amountPerUser}
            onChange={handleAmountChange}
            placeholder="How many token(s) per 3 best completers ?"
            style={{
              padding: 12,
              borderRadius: 8,
              border: '2px solid #FFD600',
              background: 'none',
              color: '#FFD600',
              fontWeight: 600,
              fontSize: 16,
            }}
          />
        </div>
      </div>
    </div>
  );
} 