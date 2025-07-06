// Blockchain utility functions for Winstory rewards system

export interface BlockchainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
  contractAddress: string;
  blockchain: string;
  standard: string;
}

export interface ItemInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
  contractAddress: string;
  blockchain: string;
  standard: string;
  tokenType: string;
}

// Supported blockchains configuration
export const SUPPORTED_BLOCKCHAINS: Record<string, BlockchainConfig> = {
  'Ethereum': {
    name: 'Ethereum',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  'Polygon': {
    name: 'Polygon',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  'BNB Chain': {
    name: 'BNB Chain',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  'Avalanche': {
    name: 'Avalanche',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    }
  },
  'Solana': {
    name: 'Solana',
    chainId: 101,
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9
    }
  }
};

// Token standards mapping
export const TOKEN_STANDARDS = {
  'ERC20': {
    name: 'ERC20',
    description: 'Fungible tokens (Ethereum)',
    transferMethod: 'transfer',
    balanceMethod: 'balanceOf'
  },
  'ERC1155': {
    name: 'ERC1155',
    description: 'Semi-fungible tokens (Ethereum)',
    transferMethod: 'safeTransferFrom',
    balanceMethod: 'balanceOf'
  },
  'ERC721': {
    name: 'ERC721',
    description: 'Non-fungible tokens (Ethereum)',
    transferMethod: 'transferFrom',
    balanceMethod: 'balanceOf'
  },
  'SPL': {
    name: 'SPL',
    description: 'Solana Program Library tokens',
    transferMethod: 'transfer',
    balanceMethod: 'getAccountInfo'
  },
  'BRC20': {
    name: 'BRC20',
    description: 'Bitcoin token standard',
    transferMethod: 'transfer',
    balanceMethod: 'getBalance'
  }
};

// Enhanced contract address validation by blockchain
export function isValidContractAddress(address: string, blockchain: string): boolean {
  if (!address || !blockchain) return false;
  
  // Remove whitespace and convert to lowercase for consistency
  const cleanAddress = address.trim().toLowerCase();
  
  switch (blockchain) {
    case 'Ethereum':
    case 'Polygon':
    case 'BNB Chain':
    case 'Avalanche':
      // EVM addresses: 42 characters starting with 0x, followed by 40 hex characters
      return /^0x[a-f0-9]{40}$/.test(cleanAddress);
    
    case 'Solana':
      // Solana addresses: 32-44 characters, base58 encoded
      // Base58 alphabet: 1-9, A-H, J-N, P-Z, a-k, m-z (excluding 0, O, I, l)
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cleanAddress);
    
    case 'Bitcoin':
      // Bitcoin addresses have multiple formats:
      // Legacy: 1 + 25-34 base58 chars
      // P2SH: 3 + 25-34 base58 chars  
      // Bech32: bc1 + 39-59 chars (lowercase)
      // BRC20 tokens typically use P2SH or Bech32
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(cleanAddress) || 
             /^bc1[a-z0-9]{39,59}$/.test(cleanAddress);
    
    default:
      return false;
  }
}

// Get validation error message for specific blockchain
export function getAddressValidationError(address: string, blockchain: string): string | null {
  if (!address) return 'Contract address is required';
  
  if (!isValidContractAddress(address, blockchain)) {
    switch (blockchain) {
      case 'Ethereum':
      case 'Polygon':
      case 'BNB Chain':
      case 'Avalanche':
        return 'Invalid EVM address format. Must be 42 characters starting with 0x';
      case 'Solana':
        return 'Invalid Solana address format. Must be 32-44 base58 characters';
      case 'Bitcoin':
        return 'Invalid Bitcoin address format. Must be legacy (1...), P2SH (3...), or Bech32 (bc1...)';
      default:
        return 'Invalid address format for selected blockchain';
    }
  }
  
  return null;
}

// Validate contract and get token info
export async function validateTokenContract(
  contractAddress: string, 
  blockchain: string, 
  standard: string,
  walletAddress?: string
): Promise<TokenInfo | null> {
  try {
    // First validate address format
    const validationError = getAddressValidationError(contractAddress, blockchain);
    if (validationError) {
      throw new Error(validationError);
    }

    // Import the real RPC functions
    const { validateContract } = await import('./blockchain-rpc');
    
    if (!walletAddress) {
      throw new Error('Adresse du wallet requise pour la validation');
    }

    // Use real blockchain calls instead of mocks
    const tokenInfo = await validateContract(contractAddress, blockchain, standard, walletAddress) as TokenInfo;
    
    return tokenInfo;
  } catch (error) {
    console.error('Contract validation failed:', error);
    return null;
  }
}

// Validate contract and get item info
export async function validateItemContract(
  contractAddress: string, 
  blockchain: string, 
  standard: string,
  walletAddress?: string,
  tokenId?: string
): Promise<ItemInfo | null> {
  try {
    // First validate address format
    const validationError = getAddressValidationError(contractAddress, blockchain);
    if (validationError) {
      throw new Error(validationError);
    }

    // Import the real RPC functions
    const { validateContract } = await import('./blockchain-rpc');
    
    if (!walletAddress) {
      throw new Error('Adresse du wallet requise pour la validation');
    }

    // Use real blockchain calls instead of mocks
    const itemInfo = await validateContract(contractAddress, blockchain, standard, walletAddress, tokenId) as ItemInfo;
    
    return itemInfo;
  } catch (error) {
    console.error('Contract validation failed:', error);
    return null;
  }
}

// Calculate total amount needed for distribution
export function calculateTotalAmount(
  amountPerUser: number, 
  numberOfRecipients: number, 
  decimals: number = 18
): string {
  const total = amountPerUser * numberOfRecipients;
  return total.toFixed(decimals);
}

// Check if wallet has sufficient balance
export function hasSufficientBalance(
  walletBalance: string, 
  requiredAmount: string, 
  decimals: number = 18
): boolean {
  const balance = parseFloat(walletBalance);
  const required = parseFloat(requiredAmount);
  return balance >= required;
}

// Get blockchain explorer URL for contract
export function getContractExplorerUrl(
  contractAddress: string, 
  blockchain: string
): string {
  const config = SUPPORTED_BLOCKCHAINS[blockchain];
  if (!config) return '';
  
  return `${config.explorerUrl}/address/${contractAddress}`;
}

// Format amount with proper decimals
export function formatAmount(
  amount: string, 
  decimals: number, 
  symbol: string
): string {
  const num = parseFloat(amount);
  const formatted = num.toFixed(decimals);
  return `${formatted} ${symbol}`;
}

// Get decimals note based on standard
export function getDecimalsNote(standard: string, decimals: number): string {
  switch (standard) {
    case 'ERC1155':
    case 'ERC721':
      return 'This item is not divisible (decimals: 0)';
    case 'ERC20':
      return `This token is divisible with ${decimals} decimal places`;
    case 'SPL':
      return `This token has ${decimals} decimal places`;
    case 'BRC20':
      return 'BRC20 tokens are typically not divisible';
    default:
      return `Decimals: ${decimals}`;
  }
} 