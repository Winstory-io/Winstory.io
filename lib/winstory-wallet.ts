/**
 * Helper pour obtenir l'adresse du wallet Winstory custodial
 * Utilisé côté frontend pour afficher l'adresse à approuver
 */

/**
 * Obtient l'adresse du wallet Winstory custodial
 * 
 * NOTE: Cette fonction appelle l'API backend car la clé privée
 * ne doit jamais être exposée côté frontend
 */
export async function getWinstoryCustodialAddress(): Promise<string | null> {
  try {
    const response = await fetch('/api/rewards/winstory-address');
    if (!response.ok) {
      console.error('Failed to get Winstory address');
      return null;
    }
    
    const data = await response.json();
    return data.address || null;
  } catch (error) {
    console.error('Error getting Winstory address:', error);
    return null;
  }
}

/**
 * Génère le message d'approbation pour l'entreprise
 */
export function getApprovalMessage(tokenName: string, amount: number, winstoryAddress: string): string {
  return `Please approve Winstory wallet (${winstoryAddress}) to transfer ${amount} ${tokenName} tokens.\n\nThis is required to lock rewards for your campaign.`;
}

