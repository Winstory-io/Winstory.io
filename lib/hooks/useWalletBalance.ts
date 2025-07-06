import { useState, useEffect } from 'react';
import { getAddressValidationError } from '../blockchain';

interface WalletBalanceState {
  balance: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useWalletBalance() {
  const [state, setState] = useState<WalletBalanceState>({
    balance: '0',
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  // Fetch wallet balance for a specific token/item
  const fetchWalletBalance = async (
    contractAddress: string,
    blockchain: string,
    standard: string,
    walletAddress?: string,
    tokenId?: string
  ): Promise<string> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Validate address format first
      const validationError = getAddressValidationError(contractAddress, blockchain);
      if (validationError) {
        throw new Error(validationError);
      }

      if (!walletAddress) {
        throw new Error('Adresse du wallet requise');
      }

      // Import and use real RPC functions
      const { getTokenBalance } = await import('../blockchain-rpc');
      
      const balance = await getTokenBalance(contractAddress, blockchain, standard, walletAddress, tokenId);

      setState({
        balance,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      });

      return balance;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch balance';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return '0';
    }
  };

  // Auto-refresh balance
  const refreshBalance = async (
    contractAddress: string,
    blockchain: string,
    standard: string,
    walletAddress?: string
  ) => {
    return await fetchWalletBalance(contractAddress, blockchain, standard, walletAddress);
  };

  // Clear balance state
  const clearBalance = () => {
    setState({
      balance: '0',
      isLoading: false,
      error: null,
      lastUpdated: null
    });
  };

  return {
    ...state,
    fetchWalletBalance,
    refreshBalance,
    clearBalance
  };
}

// Hook for real-time balance monitoring
export function useRealTimeBalance(
  contractAddress: string,
  blockchain: string,
  standard: string,
  walletAddress?: string,
  autoRefresh: boolean = false
) {
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { fetchWalletBalance } = useWalletBalance();

  // Fetch balance when dependencies change
  useEffect(() => {
    if (!contractAddress || !blockchain || !standard) {
      setBalance('0');
      setError(null);
      return;
    }

    const loadBalance = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const newBalance = await fetchWalletBalance(contractAddress, blockchain, standard, walletAddress);
        setBalance(newBalance);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load balance');
        setBalance('0');
      } finally {
        setIsLoading(false);
      }
    };

    loadBalance();

    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(loadBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [contractAddress, blockchain, standard, walletAddress, autoRefresh]);

  return {
    balance,
    isLoading,
    error,
    refresh: () => fetchWalletBalance(contractAddress, blockchain, standard, walletAddress)
  };
} 