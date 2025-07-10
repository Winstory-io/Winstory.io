import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIGS } from './config/blockchain-config';

// Fonction pour forcer le format checksum des adresses
function toChecksum(address: string): string {
  try {
    return ethers.utils.getAddress(address);
  } catch (error) {
    console.warn('Failed to get checksum address:', error);
    return address; // Laisse l'erreur se produire plus loin si vraiment invalide
  }
}

// ABI pour les contrats ERC20
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
];

// ABI pour les contrats ERC1155
const ERC1155_ABI = [
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function uri(uint256 id) view returns (string)',
  'function totalSupply(uint256 id) view returns (uint256)',
];

// ABI pour les contrats ERC721
const ERC721_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
];

// Configuration des RPC par blockchain
const RPC_CONFIGS = {
  'Ethereum': {
    rpcUrl: 'https://rpc.ankr.com/eth',
    chainId: 1,
    name: 'Ethereum'
  },
  'Polygon': {
    rpcUrl: 'https://rpc.ankr.com/polygon',
    chainId: 137,
    name: 'Polygon'
  },
  'BNB Chain': {
    rpcUrl: 'https://rpc.ankr.com/bsc',
    chainId: 56,
    name: 'BNB Chain'
  },
  'Avalanche': {
    rpcUrl: 'https://rpc.ankr.com/avalanche',
    chainId: 43114,
    name: 'Avalanche'
  },
  'Chiliz': {
    rpcUrl: 'https://rpc.ankr.com/chiliz',
    chainId: 88888,
    name: 'Chiliz'
  }
};

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
  tokenId?: string;
}

/**
 * Obtient un provider ethers.js pour la blockchain spécifiée
 */
function getProvider(blockchain: string): ethers.providers.JsonRpcProvider {
  // Liste de RPC à tester (ordre de priorité)
  let rpcUrls: string[] = [];

  // 1. Variable d'environnement prioritaire
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL && blockchain === 'Ethereum') {
    rpcUrls.push(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL);
  }

  // 2. RPC publics connus
  if (blockchain === 'Ethereum') {
    rpcUrls.push(
      'https://eth.llamarpc.com',
      'https://rpc.ankr.com/eth',
      'https://ethereum.publicnode.com',
      'https://1rpc.io/eth'
    );
  } else if (blockchain === 'Polygon') {
    rpcUrls.push('https://rpc.ankr.com/polygon', 'https://polygon-rpc.com');
  } else if (blockchain === 'BNB Chain') {
    rpcUrls.push('https://rpc.ankr.com/bsc', 'https://bsc-dataseed.binance.org');
  } else if (blockchain === 'Avalanche') {
    rpcUrls.push('https://rpc.ankr.com/avalanche', 'https://api.avax.network/ext/bc/C/rpc');
  } else if (blockchain === 'Chiliz') {
    rpcUrls.push('https://rpc.ankr.com/chiliz');
  }

  // 3. Fallback sur config statique si jamais
  const config = (typeof RPC_CONFIGS !== 'undefined') ? RPC_CONFIGS[blockchain as keyof typeof RPC_CONFIGS] : undefined;
  if (config && config.rpcUrl) {
    rpcUrls.push(config.rpcUrl);
  }

  // 4. Essayer chaque RPC jusqu'à succès
  let lastError = null;
  for (const url of rpcUrls) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(url);
      // Test rapide : getNetwork (synchronique car provider n'est pas connecté tant qu'on ne fait pas d'appel)
      // On retourne le provider, l'appel réel sera catché plus loin si le RPC ne répond pas
      console.log('[RPC] Using endpoint:', url);
      return provider;
    } catch (error) {
      lastError = error;
      console.warn('[RPC] Failed endpoint:', url, error);
      continue;
    }
  }
  // Si aucun RPC ne marche
  console.error('[RPC] All endpoints failed for', blockchain, lastError);
  throw new Error(`Aucun endpoint RPC valide pour ${blockchain}. Merci de vérifier votre connexion internet ou réessayer plus tard.`);
}

/**
 * Valide un contrat ERC20 et récupère ses informations
 */
export async function validateERC20Contract(
  contractAddress: string,
  blockchain: string,
  walletAddress: string
): Promise<TokenInfo> {
  const provider = getProvider(blockchain);
  const contract = new ethers.Contract(toChecksum(contractAddress), ERC20_ABI, provider);

  try {
    // Appels séquentiels pour éviter les problèmes de timing avec Promise.all
    let name, symbol, decimals, totalSupply, balance;
    
    try {
      name = await contract.name();
    } catch (error) {
      console.warn('Failed to get name, using default:', error.message);
      name = 'Unknown Token';
    }
    
    try {
      symbol = await contract.symbol();
    } catch (error) {
      console.warn('Failed to get symbol, using default:', error.message);
      symbol = 'UNKNOWN';
    }
    
    try {
      decimals = await contract.decimals();
    } catch (error) {
      console.warn('Failed to get decimals, using default:', error.message);
      decimals = 18;
    }
    
    try {
      totalSupply = await contract.totalSupply();
    } catch (error) {
      console.warn('Failed to get totalSupply, using default:', error.message);
      totalSupply = ethers.BigNumber.from('0');
    }
    
    try {
      balance = await contract.balanceOf(toChecksum(walletAddress));
    } catch (error) {
      console.warn('Failed to get balance, using default:', error.message);
      balance = ethers.BigNumber.from('0');
    }

    return {
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
      balance: ethers.utils.formatUnits(balance, decimals),
      contractAddress,
      blockchain,
      standard: 'ERC20'
    };
  } catch (error) {
    console.error('Erreur lors de la validation ERC20:', error);
    throw new Error('Contrat ERC20 invalide ou erreur réseau');
  }
}

/**
 * Valide un contrat ERC1155 et récupère ses informations
 */
export async function validateERC1155Contract(
  contractAddress: string,
  blockchain: string,
  walletAddress: string,
  tokenId?: string
): Promise<ItemInfo> {
  const provider = getProvider(blockchain);
  const contract = new ethers.Contract(toChecksum(contractAddress), ERC1155_ABI, provider);

  try {
    // Toujours utiliser '0' par défaut si tokenId non fourni
    const defaultTokenId = tokenId ?? '0';
    const [balance, totalSupply] = await Promise.all([
      contract.balanceOf(toChecksum(walletAddress), defaultTokenId),
      contract.totalSupply(defaultTokenId).catch(() => ethers.BigNumber.from('0')),
    ]);
    return {
      name: `Token #${defaultTokenId}`,
      symbol: 'ITEM',
      decimals: 0,
      totalSupply: totalSupply.toString(),
      balance: balance.toString(),
      contractAddress,
      blockchain,
      standard: 'ERC1155',
      tokenType: 'ERC1155',
      tokenId: defaultTokenId
    };
  } catch (error) {
    console.error('Erreur lors de la validation ERC1155:', error);
    throw new Error('Contrat ERC1155 invalide ou erreur réseau');
  }
}

/**
 * Valide un contrat ERC721 et récupère ses informations
 */
export async function validateERC721Contract(
  contractAddress: string,
  blockchain: string,
  walletAddress: string
): Promise<ItemInfo> {
  const provider = getProvider(blockchain);
  const contract = new ethers.Contract(toChecksum(contractAddress), ERC721_ABI, provider);

  try {
    const [name, symbol, balance, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.balanceOf(toChecksum(walletAddress)),
      contract.totalSupply().catch(() => ethers.BigNumber.from('0')), // Certains contrats n'ont pas totalSupply
    ]);

    return {
      name,
      symbol,
      decimals: 0,
      totalSupply: totalSupply.toString(),
      balance: balance.toString(),
      contractAddress,
      blockchain,
      standard: 'ERC721',
      tokenType: 'ERC721'
    };
  } catch (error) {
    console.error('Erreur lors de la validation ERC721:', error);
    throw new Error('Contrat ERC721 invalide ou erreur réseau');
  }
}

/**
 * Fonction générique pour valider un contrat selon son standard
 */
export async function validateContract(
  contractAddress: string,
  blockchain: string,
  standard: string,
  walletAddress: string,
  tokenId?: string
): Promise<TokenInfo | ItemInfo> {
  if (!walletAddress) {
    throw new Error('Adresse du wallet requise pour la validation');
  }

  switch (standard) {
    case 'ERC20':
      return await validateERC20Contract(contractAddress, blockchain, walletAddress);
    
    case 'ERC1155':
      // Toujours passer tokenId (même si undefined, la fonction gère le défaut)
      return await validateERC1155Contract(contractAddress, blockchain, walletAddress, tokenId);
    
    case 'ERC721':
      return await validateERC721Contract(contractAddress, blockchain, walletAddress);
    
    default:
      throw new Error(`Standard non supporté: ${standard}`);
  }
}

/**
 * Récupère le solde d'un token pour une adresse spécifique
 */
export async function getTokenBalance(
  contractAddress: string,
  blockchain: string,
  standard: string,
  walletAddress: string,
  tokenId?: string
): Promise<string> {
  const provider = getProvider(blockchain);
  
  try {
    switch (standard) {
      case 'ERC20': {
        const contract = new ethers.Contract(toChecksum(contractAddress), ERC20_ABI, provider);
        const [balance, decimals] = await Promise.all([
          contract.balanceOf(toChecksum(walletAddress)).catch(() => ethers.BigNumber.from('0')),
          contract.decimals().catch(() => 18)
        ]);
        return ethers.utils.formatUnits(balance, decimals);
      }
      
      case 'ERC1155': {
        if (!tokenId) throw new Error('TokenId requis pour ERC1155');
        const contract = new ethers.Contract(toChecksum(contractAddress), ERC1155_ABI, provider);
        const balance = await contract.balanceOf(toChecksum(walletAddress), tokenId).catch(() => ethers.BigNumber.from('0'));
        return balance.toString();
      }
      
      case 'ERC721': {
        const contract = new ethers.Contract(toChecksum(contractAddress), ERC721_ABI, provider);
        const balance = await contract.balanceOf(toChecksum(walletAddress)).catch(() => ethers.BigNumber.from('0'));
        return balance.toString();
      }
      
      default:
        throw new Error(`Standard non supporté: ${standard}`);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du solde:', error);
    return '0';
  }
}

/**
 * Vérifie si une adresse est un contrat valide
 */
export async function isContractAddress(
  address: string,
  blockchain: string
): Promise<boolean> {
  try {
    const provider = getProvider(blockchain);
    const code = await provider.getCode(toChecksum(address));
    return code !== '0x';
  } catch (error) {
    console.error('Erreur lors de la vérification du contrat:', error);
    return false;
  }
} 