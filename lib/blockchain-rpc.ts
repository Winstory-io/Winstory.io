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
  const config = RPC_CONFIGS[blockchain as keyof typeof RPC_CONFIGS];
  if (!config) {
    throw new Error(`Blockchain non supportée: ${blockchain}`);
  }
  
  try {
    return new ethers.providers.JsonRpcProvider(config.rpcUrl);
  } catch (error) {
    console.error('Failed to create provider for blockchain:', blockchain, error);
    throw new Error(`Failed to create provider for blockchain: ${blockchain}`);
  }
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
    // Appels parallèles pour optimiser les performances
    const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
      contract.balanceOf(toChecksum(walletAddress)),
    ]);

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
          contract.balanceOf(toChecksum(walletAddress)),
          contract.decimals()
        ]);
        return ethers.utils.formatUnits(balance, decimals);
      }
      
      case 'ERC1155': {
        if (!tokenId) throw new Error('TokenId requis pour ERC1155');
        const contract = new ethers.Contract(toChecksum(contractAddress), ERC1155_ABI, provider);
        const balance = await contract.balanceOf(toChecksum(walletAddress), tokenId);
        return balance.toString();
      }
      
      case 'ERC721': {
        const contract = new ethers.Contract(toChecksum(contractAddress), ERC721_ABI, provider);
        const balance = await contract.balanceOf(toChecksum(walletAddress));
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