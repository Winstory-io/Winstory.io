import { ethers } from 'ethers';
import { TOKEN_STANDARDS } from './blockchain';

// Fonction pour obtenir un provider (copiée depuis blockchain-rpc.ts)
async function getProvider(blockchain: string): Promise<ethers.providers.JsonRpcProvider> {
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

  const config = RPC_CONFIGS[blockchain as keyof typeof RPC_CONFIGS];
  if (!config) {
    throw new Error(`Blockchain non supportée: ${blockchain}`);
  }

  return new ethers.providers.StaticJsonRpcProvider(config.rpcUrl, {
    chainId: config.chainId,
    name: config.name
  });
}

// Types pour la gestion des récompenses
export interface RewardConfig {
  type: 'token' | 'item';
  name: string;
  contractAddress: string;
  blockchain: string;
  standard: string;
  amountPerUser: number;
  totalAmount: string;
  tokenInfo?: any;
  walletAddress?: string;
}

export interface UnifiedRewardConfig {
  standard: RewardConfig | null;
  premium: RewardConfig | null;
  campaignId?: string;
  creatorWallet: string;
  maxCompletions: number;
}

export interface DistributionResult {
  success: boolean;
  transactionHash?: string;
  blockchain: string;
  recipients: string[];
  amountDistributed: string;
  error?: string;
}

// ABI pour les contrats ERC20
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

// ABI pour les contrats ERC1155
const ERC1155_ABI = [
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
];

// ABI pour les contrats ERC721
const ERC721_ABI = [
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function balanceOf(address owner) view returns (uint256)',
];

/**
 * Sauvegarde la configuration unifiée des récompenses
 */
export function saveUnifiedRewardConfig(
  standardConfig: RewardConfig | null,
  premiumConfig: RewardConfig | null,
  creatorWallet: string,
  maxCompletions: number
): void {
  const unifiedConfig: UnifiedRewardConfig = {
    standard: standardConfig,
    premium: premiumConfig,
    creatorWallet,
    maxCompletions,
    campaignId: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  localStorage.setItem('unifiedRewardConfig', JSON.stringify(unifiedConfig));
  console.log('Unified reward config saved:', unifiedConfig);
}

/**
 * Récupère la configuration unifiée des récompenses
 */
export function getUnifiedRewardConfig(): UnifiedRewardConfig | null {
  try {
    const config = localStorage.getItem('unifiedRewardConfig');
    return config ? JSON.parse(config) : null;
  } catch (error) {
    console.error('Error parsing unified reward config:', error);
    return null;
  }
}

/**
 * Vérifie si le wallet a suffisamment de tokens pour la distribution
 */
export async function checkWalletBalance(
  config: RewardConfig,
  numberOfRecipients: number
): Promise<{ hasEnough: boolean; currentBalance: string; requiredAmount: string }> {
  try {
    const provider = await getProvider(config.blockchain);
    const contract = new ethers.Contract(config.contractAddress, ERC20_ABI, provider);
    
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(config.walletAddress || ''),
      contract.decimals()
    ]);
    
    const currentBalance = ethers.utils.formatUnits(balance, decimals);
    const requiredAmount = (config.amountPerUser * numberOfRecipients).toFixed(decimals);
    
    return {
      hasEnough: parseFloat(currentBalance) >= parseFloat(requiredAmount),
      currentBalance,
      requiredAmount
    };
  } catch (error) {
    console.error('Error checking wallet balance:', error);
    return { hasEnough: false, currentBalance: '0', requiredAmount: '0' };
  }
}

/**
 * Distribue des tokens ERC20
 */
async function distributeERC20(
  config: RewardConfig,
  recipients: string[],
  privateKey: string
): Promise<DistributionResult> {
  try {
    const provider = await getProvider(config.blockchain);
    const signer = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(config.contractAddress, ERC20_ABI, signer);
    
    const decimals = await contract.decimals();
    const amountPerUser = ethers.utils.parseUnits(
      config.amountPerUser.toString(),
      decimals
    );
    
    // Vérifier le solde avant distribution
    const balance = await contract.balanceOf(signer.address);
    const totalRequired = amountPerUser.mul(recipients.length);
    
    if (balance.lt(totalRequired)) {
      throw new Error(`Insufficient balance. Required: ${ethers.utils.formatUnits(totalRequired, decimals)}, Available: ${ethers.utils.formatUnits(balance, decimals)}`);
    }
    
    // Distribuer aux destinataires
    const tx = await contract.transfer(recipients[0], amountPerUser);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockchain: config.blockchain,
      recipients: [recipients[0]], // Pour l'instant, on distribue à un seul pour éviter les gas fees élevés
      amountDistributed: ethers.utils.formatUnits(amountPerUser, decimals)
    };
  } catch (error) {
    console.error('Error distributing ERC20:', error);
    return {
      success: false,
      blockchain: config.blockchain,
      recipients: [],
      amountDistributed: '0',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Distribue des tokens ERC1155
 */
async function distributeERC1155(
  config: RewardConfig,
  recipients: string[],
  privateKey: string
): Promise<DistributionResult> {
  try {
    const provider = await getProvider(config.blockchain);
    const signer = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(config.contractAddress, ERC1155_ABI, signer);
    
    const tokenId = config.tokenInfo?.tokenId || '0';
    const amountPerUser = config.amountPerUser;
    
    // Vérifier le solde avant distribution
    const balance = await contract.balanceOf(signer.address, tokenId);
    const totalRequired = amountPerUser * recipients.length;
    
    if (balance.lt(totalRequired)) {
      throw new Error(`Insufficient balance. Required: ${totalRequired}, Available: ${balance}`);
    }
    
    // Distribuer aux destinataires
    const tx = await contract.safeTransferFrom(
      signer.address,
      recipients[0],
      tokenId,
      amountPerUser,
      '0x' // Pas de données supplémentaires
    );
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockchain: config.blockchain,
      recipients: [recipients[0]],
      amountDistributed: amountPerUser.toString()
    };
  } catch (error) {
    console.error('Error distributing ERC1155:', error);
    return {
      success: false,
      blockchain: config.blockchain,
      recipients: [],
      amountDistributed: '0',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Distribue des tokens ERC721
 */
async function distributeERC721(
  config: RewardConfig,
  recipients: string[],
  privateKey: string
): Promise<DistributionResult> {
  try {
    const provider = await getProvider(config.blockchain);
    const signer = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(config.contractAddress, ERC721_ABI, signer);
    
    // Pour ERC721, on ne peut transférer qu'un token à la fois
    // On suppose que le créateur a plusieurs tokens du même type
    const balance = await contract.balanceOf(signer.address);
    
    if (balance.lt(recipients.length)) {
      throw new Error(`Insufficient balance. Required: ${recipients.length}, Available: ${balance}`);
    }
    
    // Transférer le premier token disponible
    const tx = await contract.transferFrom(signer.address, recipients[0], 0); // Token ID 0
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockchain: config.blockchain,
      recipients: [recipients[0]],
      amountDistributed: '1'
    };
  } catch (error) {
    console.error('Error distributing ERC721:', error);
    return {
      success: false,
      blockchain: config.blockchain,
      recipients: [],
      amountDistributed: '0',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Fonction principale de distribution des récompenses
 */
export async function distributeRewards(
  config: RewardConfig,
  recipients: string[],
  privateKey: string
): Promise<DistributionResult> {
  try {
    switch (config.standard) {
      case 'ERC20':
        return await distributeERC20(config, recipients, privateKey);
      
      case 'ERC1155':
        return await distributeERC1155(config, recipients, privateKey);
      
      case 'ERC721':
        return await distributeERC721(config, recipients, privateKey);
      
      default:
        throw new Error(`Unsupported token standard: ${config.standard}`);
    }
  } catch (error) {
    console.error('Error in distributeRewards:', error);
    return {
      success: false,
      blockchain: config.blockchain,
      recipients: [],
      amountDistributed: '0',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Distribue toutes les récompenses (Standard + Premium) sur leurs blockchains respectives
 */
export async function distributeAllRewards(
  privateKey: string,
  validatedCompleters: string[],
  top3Completers: string[]
): Promise<{
  standardResults: DistributionResult[];
  premiumResults: DistributionResult[];
  summary: {
    totalSuccess: number;
    totalFailed: number;
    totalDistributed: string;
  };
}> {
  const unifiedConfig = getUnifiedRewardConfig();
  if (!unifiedConfig) {
    throw new Error('No unified reward configuration found');
  }
  
  const results = {
    standardResults: [] as DistributionResult[],
    premiumResults: [] as DistributionResult[],
    summary: {
      totalSuccess: 0,
      totalFailed: 0,
      totalDistributed: '0'
    }
  };
  
  // Distribution des récompenses Standard
  if (unifiedConfig.standard && validatedCompleters.length > 0) {
    console.log(`Distributing standard rewards to ${validatedCompleters.length} completers on ${unifiedConfig.standard.blockchain}`);
    
    const standardResult = await distributeRewards(
      unifiedConfig.standard,
      validatedCompleters,
      privateKey
    );
    
    results.standardResults.push(standardResult);
    
    if (standardResult.success) {
      results.summary.totalSuccess++;
      // TODO: Ajouter la logique pour calculer le total distribué
    } else {
      results.summary.totalFailed++;
    }
  }
  
  // Distribution des récompenses Premium
  if (unifiedConfig.premium && top3Completers.length > 0) {
    console.log(`Distributing premium rewards to ${top3Completers.length} top completers on ${unifiedConfig.premium.blockchain}`);
    
    const premiumResult = await distributeRewards(
      unifiedConfig.premium,
      top3Completers,
      privateKey
    );
    
    results.premiumResults.push(premiumResult);
    
    if (premiumResult.success) {
      results.summary.totalSuccess++;
      // TODO: Ajouter la logique pour calculer le total distribué
    } else {
      results.summary.totalFailed++;
    }
  }
  
  return results;
}

/**
 * Vérifie la validité de la configuration des récompenses
 */
export function validateRewardConfig(config: UnifiedRewardConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!config.creatorWallet) {
    errors.push('Creator wallet address is required');
  }
  
  if (config.maxCompletions <= 0) {
    errors.push('Maximum completions must be greater than 0');
  }
  
  // Vérifier les récompenses Standard
  if (config.standard) {
    if (!config.standard.contractAddress) {
      errors.push('Standard reward contract address is required');
    }
    if (!config.standard.blockchain) {
      errors.push('Standard reward blockchain is required');
    }
    if (config.standard.amountPerUser <= 0) {
      errors.push('Standard reward amount per user must be greater than 0');
    }
  }
  
  // Vérifier les récompenses Premium
  if (config.premium) {
    if (!config.premium.contractAddress) {
      errors.push('Premium reward contract address is required');
    }
    if (!config.premium.blockchain) {
      errors.push('Premium reward blockchain is required');
    }
    if (config.premium.amountPerUser <= 0) {
      errors.push('Premium reward amount per user must be greater than 0');
    }
  }
  
  // Vérifier si au moins une récompense est configurée
  if (!config.standard && !config.premium) {
    warnings.push('No rewards configured - this will be a free campaign');
  }
  
  // Vérifier les conflits de blockchain si les deux types de récompenses sont configurés
  if (config.standard && config.premium) {
    if (config.standard.blockchain === config.premium.blockchain) {
      warnings.push('Standard and Premium rewards use the same blockchain - this may simplify distribution');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
} 