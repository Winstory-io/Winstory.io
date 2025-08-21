import React, { useEffect, useState } from 'react';
import styles from '../standardrewards/Rewards.module.css';
import { useWalletAddress } from '../../../../lib/hooks/useWalletConnection';
import { useRouter } from 'next/navigation';

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
  const [error, setError] = useState<string | null>(null);
  const [itemName, setItemName] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [blockchain, setBlockchain] = useState<string>('Ethereum');
  const [itemStandard, setItemStandard] = useState<string>('ERC1155');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [itemInfo, setItemInfo] = useState<ItemInfo | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('0');

  // Wallet connection
  const walletAddress = useWalletAddress();
  const router = useRouter();

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
    
    setIsLoading(true);
    try {
      // Check if wallet is connected
      if (!walletAddress) {
        setError('Veuillez connecter votre wallet pour valider le contrat');
        setItemInfo(null);
        return;
      }

      // Use real blockchain validation
      const { validateContract } = await import('../../../../lib/blockchain-rpc');
      
      // For ERC1155, we need a tokenId - using '0' as default
      const tokenId = itemStandard === 'ERC1155' ? '0' : undefined;
      const itemInfo = await validateContract(address, blockchain, itemStandard, walletAddress, tokenId) as ItemInfo;
      
      setItemInfo(itemInfo);
      setItemName(itemInfo.name); // auto-remplissage du nom
      setError(null);
    } catch (error) {
      console.error('Validation error:', error);
      setError(error instanceof Error ? error.message : 'Invalid contract address or network error');
      setItemInfo(null);
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
      setItemInfo(null);
    }
  };

  const totalItems = typeof amountPerUser === 'number' && !error
    ? (amountPerUser * 3).toFixed(0)
    : '[X items]';

  const hasEnoughBalance = itemInfo && walletBalance && 
    parseFloat(walletBalance) >= (typeof amountPerUser === 'number' ? amountPerUser * 3 : 0);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="close">✖️</button>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button style={{ border: '2px solid #00C46C', color: '#00C46C', background: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center' }}>
            👾 <span style={{ marginLeft: 10, fontStyle: 'italic' }}>Items</span>
          </button>
        </div>
        <h2 style={{ color: '#FFD600', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>Premium Rewards <span style={{ color: '#00C46C' }}>Items</span></h2>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, color: '#fff' }}>
          Select the name, item contract address, and the number of items to send per 3 best completers.
        </div>
        <div style={{ color: '#FFD600', fontWeight: 700, marginBottom: 12 }}>
          ⚠️ Winstory will automatically handle distribution to 3 best completers only if your connected wallet holds enough items.
        </div>
        <div style={{ color: '#fff', marginBottom: 18, fontWeight: 600 }}>
          You must hold at least : <span style={{ color: '#FFD600', fontWeight: 700 }}>{totalItems}</span> = <span style={{ color: '#FFD600' }}>{amountPerUser !== '' ? amountPerUser : '[Amount per user]'}</span> × 3
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
                {/* Balance supprimée */}
              </div>
              {/* Message de balance insuffisante supprimé */}
            </div>
          )}

          <input
            type="number"
            min={1}
            step={1}
            value={amountPerUser}
            onChange={handleAmountChange}
            placeholder="How many item(s) per 3 best completers ?"
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
          {/* BOUTON VERT RECAP */}
          <button
            style={{
              background: '#00C46C',
              color: '#fff',
              border: 'none',
              padding: '16px 32px',
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 700,
              cursor: itemInfo && itemName && contractAddress && amountPerUser && !error ? 'pointer' : 'not-allowed',
              width: '100%',
              marginTop: 16,
              transition: 'all 0.3s ease',
              opacity: itemInfo && itemName && contractAddress && amountPerUser && !error ? 1 : 0.5,
              pointerEvents: itemInfo && itemName && contractAddress && amountPerUser && !error ? 'auto' : 'none'
            }}
            disabled={!(itemInfo && itemName && contractAddress && amountPerUser && !error)}
            onClick={() => {
              // Sauvegarde la config premium
              const config = {
                type: 'item',
                name: itemName,
                contractAddress,
                blockchain,
                standard: itemStandard,
                amountPerUser,
                totalAmount: totalItems,
                itemInfo,
                walletAddress
              };
              localStorage.setItem('premiumItemReward', JSON.stringify(config));
              router.push('/creation/b2c/recap');
            }}
          >
            Go to Recap
          </button>
        </div>
      </div>
    </div>
  );
} 