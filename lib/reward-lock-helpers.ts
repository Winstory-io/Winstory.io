/**
 * Helpers pour le lock réel des récompenses blockchain
 * 
 * Système temporaire utilisant un wallet Winstory custodial
 * Sera remplacé par Smart Contract ultérieurement
 */

import { ethers } from 'ethers';
import { getProvider } from './reward-distribution-helpers';

// ABI pour ERC20 (approve + transferFrom)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

// ABI pour ERC1155
const ERC1155_ABI = [
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function balanceOf(address account, uint256 id) view returns (uint256)'
];

// ABI pour ERC721
const ERC721_ABI = [
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function approve(address to, uint256 tokenId)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)'
];

/**
 * Obtient le wallet Winstory custodial depuis les variables d'environnement
 */
function getWinstoryCustodialWallet(): { address: string; privateKey: string } {
  const privateKey = process.env.WINSTORY_CUSTODIAL_WALLET_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('WINSTORY_CUSTODIAL_WALLET_PRIVATE_KEY not configured in environment variables');
  }

  // Générer l'adresse depuis la clé privée pour vérification
  const wallet = new ethers.Wallet(privateKey);
  
  return {
    address: wallet.address,
    privateKey: privateKey
  };
}

/**
 * Vérifie si le wallet entreprise a approuvé le wallet Winstory pour prélever
 */
export async function checkApprovalStatus(
  contractAddress: string,
  blockchain: string,
  tokenStandard: string,
  creatorWallet: string,
  amount: string
): Promise<{ isApproved: boolean; currentAllowance?: string; needsApproval: boolean }> {
  try {
    const provider = await getProvider(blockchain);
    const winstoryWallet = getWinstoryCustodialWallet();
    
    if (tokenStandard === 'ERC20') {
      const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
      const decimals = await contract.decimals();
      const requiredAmount = ethers.utils.parseUnits(amount, decimals);
      const currentAllowance = await contract.allowance(creatorWallet, winstoryWallet.address);
      
      return {
        isApproved: currentAllowance.gte(requiredAmount),
        currentAllowance: ethers.utils.formatUnits(currentAllowance, decimals),
        needsApproval: currentAllowance.lt(requiredAmount)
      };
    } else if (tokenStandard === 'ERC1155') {
      const contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);
      const isApproved = await contract.isApprovedForAll(creatorWallet, winstoryWallet.address);
      
      return {
        isApproved,
        needsApproval: !isApproved
      };
    } else if (tokenStandard === 'ERC721') {
      // Pour ERC721, l'approbation se fait par token, donc on considère qu'il faut toujours approuver
      return {
        isApproved: false,
        needsApproval: true
      };
    }
    
    return { isApproved: false, needsApproval: true };
  } catch (error) {
    console.error('Error checking approval status:', error);
    return { isApproved: false, needsApproval: true };
  }
}

/**
 * Lock réel des tokens ERC20 depuis le wallet entreprise vers le wallet Winstory
 * 
 * NOTE: Nécessite que l'entreprise ait approuvé le wallet Winstory au préalable
 */
export async function lockERC20Tokens(
  contractAddress: string,
  blockchain: string,
  creatorWallet: string,
  amount: string,
  decimals: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const provider = await getProvider(blockchain);
    const winstoryWallet = getWinstoryCustodialWallet();
    const signer = new ethers.Wallet(winstoryWallet.privateKey, provider);
    
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer);
    
    // Vérifier l'approbation
    const requiredAmount = ethers.utils.parseUnits(amount, decimals);
    const currentAllowance = await contract.allowance(creatorWallet, winstoryWallet.address);
    
    if (currentAllowance.lt(requiredAmount)) {
      return {
        success: false,
        error: `Insufficient approval. Required: ${amount}, Approved: ${ethers.utils.formatUnits(currentAllowance, decimals)}. Creator must approve Winstory wallet first.`
      };
    }
    
    // Vérifier le solde
    const balance = await contract.balanceOf(creatorWallet);
    if (balance.lt(requiredAmount)) {
      return {
        success: false,
        error: `Insufficient balance. Required: ${amount}, Available: ${ethers.utils.formatUnits(balance, decimals)}`
      };
    }
    
    // Transférer depuis le wallet entreprise vers le wallet Winstory
    console.log(`🔒 Locking ${amount} tokens from ${creatorWallet} to Winstory custodial wallet...`);
    const tx = await contract.transferFrom(creatorWallet, winstoryWallet.address, requiredAmount);
    const receipt = await tx.wait();
    
    if (receipt.status === 0) {
      return {
        success: false,
        error: 'Transaction failed'
      };
    }
    
    console.log(`✅ Tokens locked successfully. TX: ${receipt.transactionHash}`);
    
    return {
      success: true,
      txHash: receipt.transactionHash
    };
    
  } catch (error) {
    console.error('Error locking ERC20 tokens:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Lock réel des items ERC1155
 */
export async function lockERC1155Items(
  contractAddress: string,
  blockchain: string,
  creatorWallet: string,
  tokenId: string,
  amount: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const provider = await getProvider(blockchain);
    const winstoryWallet = getWinstoryCustodialWallet();
    const signer = new ethers.Wallet(winstoryWallet.privateKey, provider);
    
    const contract = new ethers.Contract(contractAddress, ERC1155_ABI, signer);
    
    // Vérifier l'approbation
    const isApproved = await contract.isApprovedForAll(creatorWallet, winstoryWallet.address);
    if (!isApproved) {
      return {
        success: false,
        error: 'Creator must approve Winstory wallet for all tokens (setApprovalForAll)'
      };
    }
    
    // Vérifier le solde
    const balance = await contract.balanceOf(creatorWallet, tokenId);
    if (balance.lt(amount)) {
      return {
        success: false,
        error: `Insufficient balance. Required: ${amount}, Available: ${balance.toString()}`
      };
    }
    
    // Transférer
    console.log(`🔒 Locking ${amount} items (tokenId: ${tokenId}) from ${creatorWallet} to Winstory...`);
    const tx = await contract.safeTransferFrom(
      creatorWallet,
      winstoryWallet.address,
      tokenId,
      amount,
      '0x'
    );
    const receipt = await tx.wait();
    
    if (receipt.status === 0) {
      return {
        success: false,
        error: 'Transaction failed'
      };
    }
    
    return {
      success: true,
      txHash: receipt.transactionHash
    };
    
  } catch (error) {
    console.error('Error locking ERC1155 items:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Lock réel des NFTs ERC721
 */
export async function lockERC721NFT(
  contractAddress: string,
  blockchain: string,
  creatorWallet: string,
  tokenId: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const provider = await getProvider(blockchain);
    const winstoryWallet = getWinstoryCustodialWallet();
    const signer = new ethers.Wallet(winstoryWallet.privateKey, provider);
    
    const contract = new ethers.Contract(contractAddress, ERC721_ABI, signer);
    
    // Vérifier l'approbation (pour ERC721, c'est par token)
    const approvedAddress = await contract.getApproved(tokenId);
    if (approvedAddress.toLowerCase() !== winstoryWallet.address.toLowerCase()) {
      return {
        success: false,
        error: `Token ${tokenId} must be approved for Winstory wallet (${winstoryWallet.address})`
      };
    }
    
    // Vérifier que le créateur possède le token
    const owner = await contract.ownerOf(tokenId);
    if (owner.toLowerCase() !== creatorWallet.toLowerCase()) {
      return {
        success: false,
        error: `Creator wallet does not own token ${tokenId}`
      };
    }
    
    // Transférer
    console.log(`🔒 Locking NFT (tokenId: ${tokenId}) from ${creatorWallet} to Winstory...`);
    const tx = await contract.transferFrom(creatorWallet, winstoryWallet.address, tokenId);
    const receipt = await tx.wait();
    
    if (receipt.status === 0) {
      return {
        success: false,
        error: 'Transaction failed'
      };
    }
    
    return {
      success: true,
      txHash: receipt.transactionHash
    };
    
  } catch (error) {
    console.error('Error locking ERC721 NFT:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Obtient l'adresse du wallet Winstory custodial
 */
export function getWinstoryCustodialAddress(): string {
  try {
    const wallet = getWinstoryCustodialWallet();
    return wallet.address;
  } catch (error) {
    console.error('Error getting Winstory custodial address:', error);
    return '0x0000000000000000000000000000000000000000';
  }
}

