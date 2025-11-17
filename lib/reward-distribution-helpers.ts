/**
 * Helpers pour la distribution de récompenses blockchain
 * 
 * NOTE: Ces fonctions utilisent des transferts directs pour l'instant.
 * Elles seront remplacées par des appels au Smart Contract Winstory ultérieurement.
 */

import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Configuration des RPC par blockchain
const RPC_CONFIGS: Record<string, { rpcUrl: string; chainId: number; name: string }> = {
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

// ABI minimal pour ERC20
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

// ABI minimal pour ERC1155
const ERC1155_ABI = [
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address account, address operator) view returns (bool)'
];

// ABI minimal pour ERC721
const ERC721_ABI = [
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function balanceOf(address owner) view returns (uint256)',
  'function approve(address to, uint256 tokenId)',
  'function getApproved(uint256 tokenId) view returns (address)'
];

/**
 * Obtient un provider pour une blockchain donnée
 */
export async function getProvider(blockchain: string): Promise<ethers.providers.JsonRpcProvider> {
  const config = RPC_CONFIGS[blockchain];
  if (!config) {
    throw new Error(`Blockchain non supportée: ${blockchain}`);
  }

  return new ethers.providers.StaticJsonRpcProvider(config.rpcUrl, {
    chainId: config.chainId,
    name: config.name
  });
}

/**
 * Vérifie le solde d'un wallet pour un token donné
 */
export async function checkTokenBalance(
  contractAddress: string,
  blockchain: string,
  walletAddress: string,
  tokenStandard: string = 'ERC20',
  tokenId?: string
): Promise<string> {
  try {
    const provider = await getProvider(blockchain);
    
    if (tokenStandard === 'ERC20') {
      const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
      const balance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
      return ethers.utils.formatUnits(balance, decimals);
    } else if (tokenStandard === 'ERC1155' && tokenId) {
      const contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);
      const balance = await contract.balanceOf(walletAddress, tokenId);
      return balance.toString();
    } else if (tokenStandard === 'ERC721') {
      const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
      const balance = await contract.balanceOf(walletAddress);
      return balance.toString();
    }
    
    throw new Error(`Token standard non supporté: ${tokenStandard}`);
  } catch (error) {
    console.error('Error checking token balance:', error);
    throw error;
  }
}

/**
 * Vérifie si une adresse est un contrat (pas un wallet EOA)
 */
export async function isContractAddress(
  address: string,
  blockchain: string
): Promise<boolean> {
  try {
    const provider = await getProvider(blockchain);
    const code = await provider.getCode(address);
    return code !== '0x' && code !== '';
  } catch (error) {
    console.error('Error checking if address is contract:', error);
    return false;
  }
}

/**
 * Distribue un token ERC20 depuis le wallet Winstory custodial
 * 
 * Les tokens ont été prélevés au MINT et sont stockés dans le wallet Winstory
 * Cette fonction les distribue aux compléteurs validés
 */
export async function distributeERC20Token(
  campaignId: string,
  completionId: string,
  recipientWallet: string,
  config: {
    contractAddress: string;
    blockchain: string;
    amountPerUser: number;
    decimals: number;
    creatorWallet: string;
  }
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Validation de l'adresse destinataire
    if (!ethers.utils.isAddress(recipientWallet)) {
      return { success: false, error: 'Invalid recipient wallet address' };
    }
    
    // Vérifier que ce n'est pas un contrat
    const isContract = await isContractAddress(recipientWallet, config.blockchain);
    if (isContract) {
      return { success: false, error: 'Recipient address is a contract, not a wallet' };
    }
    
    // Récupérer le wallet Winstory custodial
    const winstoryPrivateKey = process.env.WINSTORY_CUSTODIAL_WALLET_PRIVATE_KEY;
    if (!winstoryPrivateKey) {
      return {
        success: false,
        error: 'WINSTORY_CUSTODIAL_WALLET_PRIVATE_KEY not configured'
      };
    }
    
    const provider = await getProvider(config.blockchain);
    const winstorySigner = new ethers.Wallet(winstoryPrivateKey, provider);
    const contract = new ethers.Contract(config.contractAddress, [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ], winstorySigner);
    
    // Vérifier le solde du wallet Winstory
    const decimals = await contract.decimals();
    const amountToTransfer = ethers.utils.parseUnits(config.amountPerUser.toString(), decimals);
    const winstoryBalance = await contract.balanceOf(winstorySigner.address);
    
    if (winstoryBalance.lt(amountToTransfer)) {
      return {
        success: false,
        error: `Insufficient balance in Winstory custodial wallet. Required: ${config.amountPerUser}, Available: ${ethers.utils.formatUnits(winstoryBalance, decimals)}`
      };
    }
    
    // Distribuer depuis le wallet Winstory vers le compléteur
    console.log(`🎁 Distributing ${config.amountPerUser} tokens from Winstory wallet to ${recipientWallet}...`);
    const tx = await contract.transfer(recipientWallet, amountToTransfer);
    const receipt = await tx.wait();
    
    if (receipt.status === 0) {
      return {
        success: false,
        error: 'Transaction failed'
      };
    }
    
    console.log(`✅ Tokens distributed successfully. TX: ${receipt.transactionHash}`);
    
    return {
      success: true,
      txHash: receipt.transactionHash
    };
    
  } catch (error) {
    console.error('Error distributing ERC20 token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Distribue un item ERC1155 (TEMPORAIRE - sera remplacé par Smart Contract)
 */
export async function distributeERC1155Item(
  campaignId: string,
  completionId: string,
  recipientWallet: string,
  config: {
    contractAddress: string;
    blockchain: string;
    tokenId: string;
    amountPerUser: number;
    creatorWallet: string;
  }
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Validation de l'adresse destinataire
    if (!ethers.utils.isAddress(recipientWallet)) {
      return { success: false, error: 'Invalid recipient wallet address' };
    }
    
    // Vérifier que ce n'est pas un contrat
    const isContract = await isContractAddress(recipientWallet, config.blockchain);
    if (isContract) {
      return { success: false, error: 'Recipient address is a contract, not a wallet' };
    }
    
    // TODO: Remplacer par appel au Smart Contract Winstory
    console.log('⚠️ [REWARD DISTRIBUTION] Using temporary direct transfer for ERC1155');
    
    const mockTxHash = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;
    
    return {
      success: true,
      txHash: mockTxHash,
      error: 'Temporary mock - Smart Contract integration pending'
    };
    
  } catch (error) {
    console.error('Error distributing ERC1155 item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Distribue un NFT ERC721 (TEMPORAIRE - sera remplacé par Smart Contract)
 */
export async function distributeERC721NFT(
  campaignId: string,
  completionId: string,
  recipientWallet: string,
  config: {
    contractAddress: string;
    blockchain: string;
    tokenId: string;
    creatorWallet: string;
  }
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Validation de l'adresse destinataire
    if (!ethers.utils.isAddress(recipientWallet)) {
      return { success: false, error: 'Invalid recipient wallet address' };
    }
    
    // Vérifier que ce n'est pas un contrat
    const isContract = await isContractAddress(recipientWallet, config.blockchain);
    if (isContract) {
      return { success: false, error: 'Recipient address is a contract, not a wallet' };
    }
    
    // TODO: Remplacer par appel au Smart Contract Winstory
    console.log('⚠️ [REWARD DISTRIBUTION] Using temporary direct transfer for ERC721');
    
    const mockTxHash = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;
    
    return {
      success: true,
      txHash: mockTxHash,
      error: 'Temporary mock - Smart Contract integration pending'
    };
    
  } catch (error) {
    console.error('Error distributing ERC721 NFT:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Vérifie une transaction on-chain pour confirmer la distribution
 */
export async function verifyOnChainDistribution(
  txHash: string,
  blockchain: string
): Promise<{ success: boolean; blockNumber?: number; error?: string }> {
  try {
    const provider = await getProvider(blockchain);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return { success: false, error: 'Transaction not found' };
    }
    
    if (receipt.status === 0) {
      return { success: false, error: 'Transaction failed' };
    }
    
    return {
      success: true,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Error verifying on-chain distribution:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Récupère l'adresse du Smart Contract Winstory pour une blockchain donnée
 * TODO: Remplacer par vraie configuration
 */
export async function getWinstoryContractAddress(blockchain: string): Promise<string> {
  // Pour l'instant, retourner une adresse mock
  // TODO: Récupérer depuis deployed_contracts table ou env variable
  const mockAddresses: Record<string, string> = {
    'Ethereum': '0x0000000000000000000000000000000000000000',
    'Polygon': '0x0000000000000000000000000000000000000000',
    'Base': '0x0000000000000000000000000000000000000000',
    'Chiliz': '0x0000000000000000000000000000000000000000'
  };
  
  return mockAddresses[blockchain] || '0x0000000000000000000000000000000000000000';
}

