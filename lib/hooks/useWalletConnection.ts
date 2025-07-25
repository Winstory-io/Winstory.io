import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletConnectionState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  chainId: number | null;
  network: string | null;
}

export function useWalletConnection() {
  const [state, setState] = useState<WalletConnectionState>({
    address: null,
    isConnected: false,
    isLoading: false, // Start as not loading
    error: null,
    chainId: null,
    network: null
  });

  useEffect(() => {
    // Check if wallet is already connected
    const checkWalletConnection = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));

        // Check if MetaMask is available
        if (typeof window !== 'undefined' && window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              const chainId = await window.ethereum.request({ method: 'eth_chainId' });
              const mockAddress = ethers.utils.getAddress(accounts[0]);
              const mockChainId = parseInt(chainId, 16);
              
              setState({
                address: mockAddress,
                isConnected: true,
                isLoading: false,
                error: null,
                chainId: mockChainId,
                network: getNetworkName(mockChainId)
              });
              return;
            }
          } catch (error) {
            console.warn('MetaMask not available or user rejected:', error);
          }
        }

        // SUPPRESSION DU FALLBACK MOCK : ne rien faire si aucun compte trouvé
        setState(prev => ({
          ...prev,
          isLoading: false,
          address: null,
          isConnected: false,
          error: null,
          chainId: null,
          network: null
        }));
      } catch (error) {
        setState({
          address: null,
          isConnected: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to connect wallet',
          chainId: null,
          network: null
        });
      }
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // In a real implementation, you would:
      // 1. Request account access from wallet
      // 2. Handle user rejection
      // 3. Get account and network info

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const rawMockAddress = '0x742d35Cc6634C0532925a3b8D4C9dB96C4b4d8b6';
      const mockAddress = ethers.utils.getAddress(rawMockAddress);
      const mockChainId = 1;
      
      setState({
        address: mockAddress,
        isConnected: true,
        isLoading: false,
        error: null,
        chainId: mockChainId,
        network: 'Ethereum'
      });

      return mockAddress;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return null;
    }
  };

  const disconnectWallet = () => {
    setState({
      address: null,
      isConnected: false,
      isLoading: false,
      error: null,
      chainId: null,
      network: null
    });
  };

  const switchNetwork = async (chainId: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // In a real implementation, you would:
      // 1. Request network switch in wallet
      // 2. Handle the switch
      // 3. Update the state

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        chainId,
        network: getNetworkName(chainId),
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to switch network'
      }));
    }
  };

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork
  };
}

// Helper function to get network name from chainId
function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 1: return 'Ethereum';
    case 137: return 'Polygon';
    case 56: return 'BNB Chain';
    case 43114: return 'Avalanche';
    case 101: return 'Solana';
    default: return 'Unknown';
  }
}

// Hook for getting wallet address in components
export function useWalletAddress(): string | null {
  const { address, isConnected } = useWalletConnection();
  // Si le provider thirdweb a une session active, on ne regarde jamais le localStorage
  if (isConnected && address) return address;
  // Sinon, fallback localStorage (pour compatibilité legacy uniquement)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('walletAddress');
    if (stored) {
      try {
        if (stored.startsWith('{')) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.address) return parsed.address;
        }
        return stored;
      } catch {
        return stored;
      }
    }
  }
  return null;
}

// Hook for checking if wallet is connected
export function useWalletConnected(): boolean {
  const { isConnected } = useWalletConnection();
  return isConnected;
} 