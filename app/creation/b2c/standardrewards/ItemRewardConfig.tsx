'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './Rewards.module.css';
import { getAddressValidationError, getDecimalsNote } from '../../../../lib/blockchain';
import { useRealTimeBalance } from '../../../../lib/hooks/useWalletBalance';
import { useAddress } from "@thirdweb-dev/react";
import { useRouter } from 'next/navigation';
import { validateContract } from '../../../../lib/blockchain-rpc';

interface ItemInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
  tokenType: string;
}

export default function ItemRewardConfig({ onClose }: { onClose: () => void }) {
  const [amountPerUser, setAmountPerUser] = useState<number | ''>('');
  const [maxCompletions, setMaxCompletions] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [itemName, setItemName] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [blockchain, setBlockchain] = useState<string>('Ethereum');
  const [itemStandard, setItemStandard] = useState<string>('ERC1155');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [itemInfo, setItemInfo] = useState<ItemInfo | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState<boolean>(false);

  // Wallet connection
  const account = useAddress();
  const walletAddress = account;
  const contractAddressRef = useRef<HTMLInputElement>(null);

  // Real-time balance monitoring with wallet address
  const { balance: walletBalance, isLoading: balanceLoading, error: balanceError } = useRealTimeBalance(
    contractAddress,
    blockchain,
    itemStandard,
    walletAddress,
    false // autoRefresh
  );

  const router = useRouter();

  useEffect(() => {
    // Try to get maxCompletions from localStorage (set by /rewardsornot)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('maxCompletions');
      if (stored) {
        setMaxCompletions(Number(stored));
      }
    }

    // Auto-focus on contract address input
    if (contractAddressRef.current) {
      contractAddressRef.current.focus();
    }
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setAmountPerUser('');
      setError(null);
      return;
    }
    const num = Number(val);
    if (isNaN(num) || num < 1) {
      setError('Amount per user must be at least 1');
    } else {
      setError(null);
    }
    setAmountPerUser(val === '' ? '' : num);
  };

  const validateContractAddress = async (address: string) => {
    if (!address || address.length < 10) return;
    
    setIsValidating(true);
    setIsCheckingBalance(true);
    try {
      // First validate address format
      const validationError = getAddressValidationError(address, blockchain);
      if (validationError) {
        setError(validationError);
        setItemInfo(null);
        return;
      }

      // Check if wallet is connected
      if (!walletAddress) {
        setError('Veuillez connecter votre wallet pour valider le contrat');
        setItemInfo(null);
        return;
      }

      // Use real blockchain validation
      // For ERC1155, we need a tokenId - using '0' as default
      const tokenId = itemStandard === 'ERC1155' ? '0' : undefined;
      const itemInfo = await validateContract(address, blockchain, itemStandard, walletAddress, tokenId) as ItemInfo;
      
      setItemInfo(itemInfo);
      setItemName(itemInfo.name); // Auto-fill item name
      setError(null);
    } catch (error) {
      console.error('Validation error:', error);
      setError(error instanceof Error ? error.message : 'Invalid contract address or network error');
      setItemInfo(null);
    } finally {
      setIsValidating(false);
      setIsCheckingBalance(false);
    }
  };

  const handleContractAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setContractAddress(address);
    if (address) {
      validateContractAddress(address);
    } else {
      setItemInfo(null);
      setError(null);
      setItemName(''); // Clear item name when address is cleared
    }
  };

  const handleBlockchainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBlockchain = e.target.value;
    setBlockchain(newBlockchain);
    
    // Update standard based on blockchain
    if (newBlockchain === 'Solana') {
      setItemStandard('SPL');
    } else if (newBlockchain === 'Bitcoin') {
      setItemStandard('BRC20');
    } else {
      setItemStandard('ERC1155');
    }
    
    // Re-validate contract address if exists
    if (contractAddress) {
      validateContractAddress(contractAddress);
    }
  };

  const totalItems = typeof amountPerUser === 'number' && !error && maxCompletions > 0
    ? (amountPerUser * maxCompletions).toFixed(0)
    : '[X items]';

  const hasEnoughBalance = itemInfo && walletBalance && 
    parseFloat(walletBalance) >= (typeof amountPerUser === 'number' ? amountPerUser * maxCompletions : 0);

  const canConfirm = itemName && contractAddress && typeof amountPerUser === 'number' && 
    amountPerUser > 0 && itemInfo && !error && walletAddress;

  const handleConfirm = () => {
    if (!canConfirm) return;
    
    // Save configuration to localStorage or state management
    const config = {
      type: 'item',
      name: itemName,
      contractAddress,
      blockchain,
      standard: itemStandard,
      amountPerUser,
      totalAmount: totalItems,
      itemInfo,
      hasEnoughBalance,
      walletAddress
    };
    
    localStorage.setItem('standardItemReward', JSON.stringify(config));
    setIsConfirmed(true);
    
    // Close modal after short delay
    router.push('/creation/b2c/premiumrewards');
  };

  const getButtonText = () => {
    if (isConfirmed) return '✅ Configuration Saved!';
    if (isValidating) return '🔍 Checking contract...';
    if (balanceLoading) return '💰 Fetching balance...';
    if (!walletAddress) return '🔗 Connect Wallet First';
    if (!canConfirm) return '⚠️ Complete Configuration';
    return 'Confirm Item Reward Configuration';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="close">✖️</button>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button style={{ border: '2px solid #00C46C', color: '#00C46C', background: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center' }}>
            👾 <span style={{ marginLeft: 10, fontStyle: 'italic' }}>Items</span>
          </button>
        </div>
        <h2 style={{ color: '#FFD600', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>Standard Rewards <span style={{ color: '#00C46C' }}>Items</span></h2>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, color: '#fff' }}>
          Select the name, item contract address, and the number of items to send per validated completer.
        </div>
        <div style={{ color: '#FFD600', fontWeight: 700, marginBottom: 12 }}>
          ⚠️ Winstory will automatically handle distribution to validated completers only if your connected wallet holds enough items.
        </div>
        <div style={{ color: '#fff', marginBottom: 18, fontWeight: 600 }}>
          You must hold at least : <span style={{ color: '#FFD600', fontWeight: 700 }}>{totalItems}</span> = <span style={{ color: '#FFD600' }}>{amountPerUser !== '' ? amountPerUser : '[Amount per user]'}</span> × {maxCompletions > 0 ? maxCompletions : '[Max completions]'}
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
              <option value="Base">Base</option>
            </select>
            
            <select 
              value={itemStandard}
              onChange={(e) => setItemStandard(e.target.value)}
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
              <option value="ERC1155">ERC1155 (Semi-fungible)</option>
              <option value="ERC721">ERC721 (NFT)</option>
              <option value="SPL">SPL Token (Solana)</option>
              <option value="BRC20">BRC20 (Bitcoin)</option>
            </select>
          </div>

          <input 
            type="text" 
            placeholder="Name of the Item" 
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: '2px solid #FFD600', background: 'none', color: '#FFD600', fontWeight: 600, fontSize: 16 }} 
          />
          
          <div style={{ position: 'relative' }}>
            <input 
              ref={contractAddressRef}
              type="text" 
              placeholder="Item contract address" 
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
            {(isValidating || balanceLoading) && (
              <div style={{ 
                position: 'absolute', 
                right: 12, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#FFD600'
              }}>
                {isValidating ? '🔍' : '💰'}
              </div>
            )}
          </div>

          {/* Item Info Display */}
          {itemInfo && (
            <div style={{ 
              background: 'rgba(255, 215, 0, 0.1)', 
              padding: 12, 
              borderRadius: 8, 
              border: '1px solid #FFD600',
              marginBottom: 12
            }}>
              <div style={{ color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                ✅ Valid {itemStandard} Contract
              </div>
              <div style={{ color: '#fff', fontSize: 14 }}>
                <div>Name: {itemInfo.name}</div>
                <div>Symbol: {itemInfo.symbol}</div>
                <div>Type: {itemInfo.tokenType}</div>
                <div>Your Balance: {walletBalance} {itemInfo.symbol}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
                  {getDecimalsNote(itemStandard, itemInfo.decimals)}
                </div>
              </div>
            </div>
          )}

          <input
            type="number"
            min={1}
            step={1}
            value={amountPerUser}
            onChange={handleAmountChange}
            placeholder="How many item(s) per individual community minter validated ?"
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

          {/* Confirmation Button */}
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isValidating || balanceLoading}
            style={{
              background: canConfirm && !isValidating && !balanceLoading ? '#00C46C' : '#666',
              color: '#fff',
              border: 'none',
              padding: '16px 32px',
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 700,
              cursor: canConfirm && !isValidating && !balanceLoading ? 'pointer' : 'not-allowed',
              width: '100%',
              marginTop: 16,
              transition: 'all 0.3s ease'
            }}
          >
            {getButtonText()}
          </button>

          {!canConfirm && !isValidating && !balanceLoading && (
            <div style={{ 
              color: '#FFD600', 
              fontSize: 14, 
              textAlign: 'center',
              marginTop: 8
            }}>
              {!walletAddress ? 'Please connect your wallet first' : 'Please fill all required fields and ensure sufficient balance'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 