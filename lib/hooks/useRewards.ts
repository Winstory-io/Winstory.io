import { useState, useEffect } from 'react';
import { 
  validateTokenContract, 
  validateItemContract, 
  calculateTotalAmount,
  hasSufficientBalance,
  TokenInfo,
  ItemInfo,
  SUPPORTED_BLOCKCHAINS,
  TOKEN_STANDARDS
} from '../blockchain';

export interface RewardConfig {
  type: 'token' | 'item' | 'digital' | 'physical';
  name: string;
  contractAddress: string;
  blockchain: string;
  standard: string;
  amountPerUser: number;
  totalAmount: string;
  tokenInfo?: TokenInfo;
  itemInfo?: ItemInfo;
  hasEnoughBalance: boolean;
  isValid: boolean;
}

export interface RewardsState {
  standard: RewardConfig | null;
  premium: RewardConfig | null;
  maxCompletions: number;
  isLoading: boolean;
  error: string | null;
}

export function useRewards() {
  const [state, setState] = useState<RewardsState>({
    standard: null,
    premium: null,
    maxCompletions: 0,
    isLoading: false,
    error: null
  });

  // Load max completions from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('maxCompletions');
      if (stored) {
        setState(prev => ({ ...prev, maxCompletions: Number(stored) }));
      }
    }
  }, []);

  // Validate token contract
  const validateToken = async (
    contractAddress: string,
    blockchain: string,
    standard: string,
    amountPerUser: number,
    isPremium: boolean = false
  ): Promise<RewardConfig | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const tokenInfo = await validateTokenContract(contractAddress, blockchain, standard);
      
      if (!tokenInfo) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Invalid contract address or network error' 
        }));
        return null;
      }

      const recipients = isPremium ? 3 : state.maxCompletions;
      const totalAmount = calculateTotalAmount(amountPerUser, recipients, tokenInfo.decimals);
      const hasEnough = hasSufficientBalance(tokenInfo.balance, totalAmount, tokenInfo.decimals);

      const config: RewardConfig = {
        type: 'token',
        name: tokenInfo.name,
        contractAddress,
        blockchain,
        standard,
        amountPerUser,
        totalAmount,
        tokenInfo,
        hasEnoughBalance: hasEnough,
        isValid: true
      };

      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        [isPremium ? 'premium' : 'standard']: config
      }));

      return config;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Validation failed' 
      }));
      return null;
    }
  };

  // Validate item contract
  const validateItem = async (
    contractAddress: string,
    blockchain: string,
    standard: string,
    amountPerUser: number,
    isPremium: boolean = false
  ): Promise<RewardConfig | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const itemInfo = await validateItemContract(contractAddress, blockchain, standard);
      
      if (!itemInfo) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Invalid contract address or network error' 
        }));
        return null;
      }

      const recipients = isPremium ? 3 : state.maxCompletions;
      const totalAmount = calculateTotalAmount(amountPerUser, recipients, itemInfo.decimals);
      const hasEnough = hasSufficientBalance(itemInfo.balance, totalAmount, itemInfo.decimals);

      const config: RewardConfig = {
        type: 'item',
        name: itemInfo.name,
        contractAddress,
        blockchain,
        standard,
        amountPerUser,
        totalAmount,
        itemInfo,
        hasEnoughBalance: hasEnough,
        isValid: true
      };

      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        [isPremium ? 'premium' : 'standard']: config
      }));

      return config;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Validation failed' 
      }));
      return null;
    }
  };

  // Update reward configuration
  const updateReward = (
    type: 'token' | 'item' | 'digital' | 'physical',
    config: Partial<RewardConfig>,
    isPremium: boolean = false
  ) => {
    const current = isPremium ? state.premium : state.standard;
    
    if (!current) return;

    const updated: RewardConfig = {
      ...current,
      ...config,
      type
    };

    setState(prev => ({
      ...prev,
      [isPremium ? 'premium' : 'standard']: updated
    }));
  };

  // Clear reward configuration
  const clearReward = (isPremium: boolean = false) => {
    setState(prev => ({
      ...prev,
      [isPremium ? 'premium' : 'standard']: null
    }));
  };

  // Get supported blockchains
  const getSupportedBlockchains = () => Object.keys(SUPPORTED_BLOCKCHAINS);

  // Get token standards for blockchain
  const getTokenStandards = (blockchain: string) => {
    switch (blockchain) {
      case 'Ethereum':
      case 'Polygon':
      case 'BNB Chain':
      case 'Avalanche':
        return ['ERC20', 'ERC1155', 'ERC721'];
      case 'Solana':
        return ['SPL'];
      case 'Bitcoin':
        return ['BRC20'];
      default:
        return [];
    }
  };

  // Check if configuration is complete
  const isConfigurationComplete = (isPremium: boolean = false) => {
    const config = isPremium ? state.premium : state.standard;
    return config && config.isValid && config.hasEnoughBalance;
  };

  // Get total distribution amount
  const getTotalDistributionAmount = () => {
    let total = 0;
    if (state.standard && state.standard.isValid) {
      total += parseFloat(state.standard.totalAmount);
    }
    if (state.premium && state.premium.isValid) {
      total += parseFloat(state.premium.totalAmount);
    }
    return total;
  };

  return {
    state,
    validateToken,
    validateItem,
    updateReward,
    clearReward,
    getSupportedBlockchains,
    getTokenStandards,
    isConfigurationComplete,
    getTotalDistributionAmount
  };
} 