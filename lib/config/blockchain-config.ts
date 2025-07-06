// Centralized blockchain configuration for Winstory rewards system

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
  supportedStandards: string[];
  addressRegex: RegExp;
  validationMessage: string;
}

export interface TokenStandardConfig {
  name: string;
  description: string;
  transferMethod: string;
  balanceMethod: string;
  decimals: number;
  isDivisible: boolean;
}

// Blockchain configurations
export const BLOCKCHAIN_CONFIGS: Record<string, BlockchainConfig> = {
  'Ethereum': {
    name: 'Ethereum',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    supportedStandards: ['ERC20', 'ERC1155', 'ERC721'],
    addressRegex: /^0x[a-f0-9]{40}$/,
    validationMessage: 'Invalid EVM address format. Must be 42 characters starting with 0x'
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
    },
    supportedStandards: ['ERC20', 'ERC1155', 'ERC721'],
    addressRegex: /^0x[a-f0-9]{40}$/,
    validationMessage: 'Invalid EVM address format. Must be 42 characters starting with 0x'
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
    },
    supportedStandards: ['ERC20', 'ERC1155', 'ERC721'],
    addressRegex: /^0x[a-f0-9]{40}$/,
    validationMessage: 'Invalid EVM address format. Must be 42 characters starting with 0x'
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
    },
    supportedStandards: ['ERC20', 'ERC1155', 'ERC721'],
    addressRegex: /^0x[a-f0-9]{40}$/,
    validationMessage: 'Invalid EVM address format. Must be 42 characters starting with 0x'
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
    },
    supportedStandards: ['SPL'],
    addressRegex: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    validationMessage: 'Invalid Solana address format. Must be 32-44 base58 characters'
  },
  'Bitcoin': {
    name: 'Bitcoin',
    chainId: 0,
    rpcUrl: 'https://blockstream.info/api',
    explorerUrl: 'https://blockstream.info',
    nativeCurrency: {
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8
    },
    supportedStandards: ['BRC20'],
    addressRegex: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
    validationMessage: 'Invalid Bitcoin address format. Must be legacy (1...), P2SH (3...), or Bech32 (bc1...)'
  },
  'Chiliz': {
    name: 'Chiliz',
    chainId: 88888,
    rpcUrl: 'https://rpc.ankr.com/chiliz',
    explorerUrl: 'https://scan.chiliz.com',
    nativeCurrency: {
      name: 'Chiliz',
      symbol: 'CHZ',
      decimals: 18
    },
    supportedStandards: ['ERC20', 'ERC1155', 'ERC721'],
    addressRegex: /^0x[a-f0-9]{40}$/,
    validationMessage: 'Invalid EVM address format. Must be 42 characters starting with 0x'
  }
};

// Token standard configurations
export const TOKEN_STANDARD_CONFIGS: Record<string, TokenStandardConfig> = {
  'ERC20': {
    name: 'ERC20',
    description: 'Fungible tokens (Ethereum)',
    transferMethod: 'transfer',
    balanceMethod: 'balanceOf',
    decimals: 18,
    isDivisible: true
  },
  'ERC1155': {
    name: 'ERC1155',
    description: 'Semi-fungible tokens (Ethereum)',
    transferMethod: 'safeTransferFrom',
    balanceMethod: 'balanceOf',
    decimals: 0,
    isDivisible: false
  },
  'ERC721': {
    name: 'ERC721',
    description: 'Non-fungible tokens (Ethereum)',
    transferMethod: 'transferFrom',
    balanceMethod: 'balanceOf',
    decimals: 0,
    isDivisible: false
  },
  'SPL': {
    name: 'SPL',
    description: 'Solana Program Library tokens',
    transferMethod: 'transfer',
    balanceMethod: 'getAccountInfo',
    decimals: 9,
    isDivisible: true
  },
  'BRC20': {
    name: 'BRC20',
    description: 'Bitcoin token standard',
    transferMethod: 'transfer',
    balanceMethod: 'getBalance',
    decimals: 0,
    isDivisible: false
  }
};

// Utility functions
export function getBlockchainConfig(blockchain: string): BlockchainConfig | null {
  return BLOCKCHAIN_CONFIGS[blockchain] || null;
}

export function getTokenStandardConfig(standard: string): TokenStandardConfig | null {
  return TOKEN_STANDARD_CONFIGS[standard] || null;
}

export function getSupportedStandards(blockchain: string): string[] {
  const config = getBlockchainConfig(blockchain);
  return config ? config.supportedStandards : [];
}

export function isValidAddressForBlockchain(address: string, blockchain: string): boolean {
  const config = getBlockchainConfig(blockchain);
  if (!config) return false;
  
  const cleanAddress = address.trim().toLowerCase();
  return config.addressRegex.test(cleanAddress);
}

export function getValidationMessage(address: string, blockchain: string): string | null {
  if (!address) return 'Contract address is required';
  
  const config = getBlockchainConfig(blockchain);
  if (!config) return 'Unsupported blockchain';
  
  if (!isValidAddressForBlockchain(address, blockchain)) {
    return config.validationMessage;
  }
  
  return null;
}

export function getDefaultStandardForBlockchain(blockchain: string): string {
  switch (blockchain) {
    case 'Solana':
      return 'SPL';
    case 'Bitcoin':
      return 'BRC20';
    default:
      return 'ERC20';
  }
}

export function getDecimalsNote(standard: string): string {
  const config = getTokenStandardConfig(standard);
  if (!config) return 'Unknown token standard';
  
  if (config.isDivisible) {
    return `This token is divisible with ${config.decimals} decimal places`;
  } else {
    return 'This token is not divisible (decimals: 0)';
  }
}

export function getBlockchainIcon(blockchain: string): string {
  switch (blockchain) {
    case 'Ethereum': return '🔷';
    case 'Polygon': return '🟣';
    case 'BNB Chain': return '🟡';
    case 'Avalanche': return '🔴';
    case 'Solana': return '🟢';
    case 'Bitcoin': return '🟠';
    case 'Chiliz': return '🔥';
    default: return '⚪';
  }
}

export function getStandardIcon(standard: string): string {
  switch (standard) {
    case 'ERC20': return '🪙';
    case 'ERC1155': return '👾';
    case 'ERC721': return '🖼️';
    case 'SPL': return '🟢';
    case 'BRC20': return '🟠';
    default: return '🎁';
  }
} 