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
  },
  'Base': {
    rpcUrl: 'https://rpc.ankr.com/base',
    chainId: 8453,
    name: 'Base'
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
async function getProvider(blockchain: string): Promise<ethers.providers.JsonRpcProvider> {
  // Liste de RPC à tester (ordre de priorité)
  let rpcUrls: string[] = [];

  // 1. Variable d'environnement prioritaire
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL && blockchain === 'Ethereum') {
    rpcUrls.push(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL);
  }

  // 2. RPC publics connus (mettre les endpoints sans clé API en premier)
  if (blockchain === 'Ethereum') {
    rpcUrls.push(
      'https://eth.llamarpc.com',
      'https://ethereum.publicnode.com',
      'https://1rpc.io/eth',
      'https://rpc.ankr.com/eth'
    );
  } else if (blockchain === 'Polygon') {
    rpcUrls.push(
      'https://polygon-rpc.com',
      'https://polygon.llamarpc.com',
      'https://polygon-bor.publicnode.com',
      'https://1rpc.io/matic',
      'https://rpc.ankr.com/polygon'
    );
  } else if (blockchain === 'BNB Chain') {
    rpcUrls.push('https://bsc-dataseed.binance.org', 'https://bsc.publicnode.com', 'https://1rpc.io/bnb', 'https://rpc.ankr.com/bsc');
  } else if (blockchain === 'Avalanche') {
    rpcUrls.push('https://api.avax.network/ext/bc/C/rpc', 'https://avalanche-c-chain.publicnode.com', 'https://1rpc.io/avax/c', 'https://rpc.ankr.com/avalanche');
  } else if (blockchain === 'Chiliz') {
    rpcUrls.push('https://rpc.ankr.com/chiliz');
  } else if (blockchain === 'Base') {
    rpcUrls.push('https://mainnet.base.org', 'https://base.llamarpc.com', 'https://1rpc.io/base', 'https://rpc.ankr.com/base');
  }

  // 3. Fallback sur config statique si jamais
  const config = (typeof RPC_CONFIGS !== 'undefined') ? RPC_CONFIGS[blockchain as keyof typeof RPC_CONFIGS] : undefined;
  if (config && config.rpcUrl) {
    // Mettre à la fin si déjà inclus
    if (!rpcUrls.includes(config.rpcUrl)) rpcUrls.push(config.rpcUrl);
  }

  // Helper: timeout wrapper for provider calls
  function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('RPC timeout')), ms);
      promise.then(v => { clearTimeout(t); resolve(v); }).catch(e => { clearTimeout(t); reject(e); });
    });
  }

  // 4. Essayer chaque RPC jusqu'à succès (vérifier avec getBlockNumber)
  let lastError: any = null;
  for (const url of rpcUrls) {
    try {
      const cfg = RPC_CONFIGS[blockchain as keyof typeof RPC_CONFIGS];
      const network = cfg ? { chainId: cfg.chainId, name: cfg.name } : undefined as any;
      const provider = new ethers.providers.StaticJsonRpcProvider(url, network);
      // Vérifie rapidement la disponibilité
      await withTimeout(provider.getBlockNumber(), 1500);
      console.log('[RPC] Using endpoint:', url);
      return provider;
    } catch (error) {
      lastError = error;
      console.warn('[RPC] Failed endpoint:', url, error);
      continue;
    }
  }
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
  const provider = await getProvider(blockchain);
  const contract = new ethers.Contract(toChecksum(contractAddress), ERC20_ABI, provider);

  async function readStringOrBytes32(method: 'name' | 'symbol'): Promise<string> {
    try {
      const value = await contract[method]();
      if (typeof value === 'string' && value.trim().length > 0) return value;
    } catch {}

    // Low-level eth_call attempt then decode
    try {
      const selector = method === 'name' ? '0x06fdde03' /* name() */ : '0x95d89b41' /* symbol() */;
      const raw = await provider.call({ to: toChecksum(contractAddress), data: selector });
      if (raw && raw !== '0x') {
        try {
          const [decoded] = ethers.utils.defaultAbiCoder.decode(['string'], raw);
          if (typeof decoded === 'string' && decoded.trim().length > 0) return decoded;
        } catch {}
        try {
          const [decodedBytes] = ethers.utils.defaultAbiCoder.decode(['bytes32'], raw);
          const parsed = (() => {
            try { return ethers.utils.parseBytes32String(decodedBytes); } catch { return null; }
          })();
          if (parsed && parsed.trim().length > 0) return parsed;
          try {
            const ascii = ethers.utils.toUtf8String(decodedBytes).replace(/\u0000+$/g, '').trim();
            if (ascii) return ascii;
          } catch {}
        } catch {}
      }
    } catch {}

    // bytes32 ABI variant attempt
    try {
      const altAbi = [
        method === 'name' ? 'function name() view returns (bytes32)' : 'function symbol() view returns (bytes32)'
      ];
      const alt = new ethers.Contract(toChecksum(contractAddress), altAbi, provider);
      const bytes: string = await alt[method]();
      if (bytes && ethers.utils.isBytesLike(bytes)) {
        try {
          return ethers.utils.parseBytes32String(bytes);
        } catch {
          try {
            const ascii = ethers.utils.toUtf8String(bytes).replace(/\u0000+$/g, '').trim();
            if (ascii) return ascii;
          } catch {}
        }
      }
    } catch {}

    return method === 'name' ? 'Unknown Token' : 'UNKNOWN';
  }

  try {
    let name: string, symbol: string, decimals: number, totalSupply: any, balance: any;

    name = await readStringOrBytes32('name');
    symbol = await readStringOrBytes32('symbol');

    try {
      decimals = await contract.decimals();
    } catch (error) {
      console.warn('Failed to get decimals, using default:', (error as any)?.message);
      decimals = 18;
    }

    try {
      totalSupply = await contract.totalSupply();
    } catch (error) {
      console.warn('Failed to get totalSupply, using default:', (error as any)?.message);
      totalSupply = ethers.BigNumber.from('0');
    }

    try {
      balance = await contract.balanceOf(toChecksum(walletAddress));
    } catch (error) {
      console.warn('Failed to get balance, using default:', (error as any)?.message);
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
  const provider = await getProvider(blockchain);
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
  const provider = await getProvider(blockchain);
  const contract = new ethers.Contract(toChecksum(contractAddress), ERC721_ABI, provider);

  async function safeCallString(method: 'name' | 'symbol'): Promise<string> {
    try {
      const v = await contract[method]();
      if (typeof v === 'string' && v.trim().length > 0) return v;
    } catch {}
    return method === 'name' ? 'Unknown Item' : 'UNKNOWN';
  }

  try {
    const name = await safeCallString('name');
    const symbol = await safeCallString('symbol');
    let balance: any;
    let totalSupply: any;
    try {
      balance = await contract.balanceOf(toChecksum(walletAddress));
    } catch { balance = ethers.BigNumber.from('0'); }
    try {
      totalSupply = await contract.totalSupply();
    } catch { totalSupply = ethers.BigNumber.from('0'); }

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
  const provider = await getProvider(blockchain);
  
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
    const provider = await getProvider(blockchain);
    const code = await provider.getCode(toChecksum(address));
    return code !== '0x';
  } catch (error) {
    console.error('Erreur lors de la vérification du contrat:', error);
    return false;
  }
} 