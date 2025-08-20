/**
 * Nettoie complètement le cache et les données utilisateur
 * Utilisé pour forcer un redémarrage propre du processus d'authentification
 */
export function clearUserCache(): void {
  // Vérifier que nous sommes côté client
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  try {
    // Supprimer toutes les données d'authentification de base
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    localStorage.removeItem('walletAddress');
    
    // Supprimer les données spécifiques au hackathon
    localStorage.removeItem('hackathonChzBalance');
    localStorage.removeItem('hackathonWalletAddress');
    
    // Supprimer les données de création de campagne
    localStorage.removeItem('story');
    localStorage.removeItem('film');
    localStorage.removeItem('ipfsHistory');
    localStorage.removeItem('maxCompletions');
    
    // Supprimer les données de récompenses
    localStorage.removeItem('standardItemReward');
    localStorage.removeItem('standardTokenReward');
    localStorage.removeItem('premiumItemReward');
    localStorage.removeItem('premiumTokenReward');
    
    // Supprimer les données de configuration
    localStorage.removeItem('mintTermsAccepted');
    
    // Supprimer les données thirdweb si elles existent
    localStorage.removeItem('thirdweb:auth');
    localStorage.removeItem('thirdweb:wallet');
    localStorage.removeItem('thirdweb:session');
    
    // Supprimer toutes les données de champs de formulaire (pattern: field_*)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('field_') || 
        key.includes('form_') || 
        key.includes('campaign_') ||
        key.includes('thirdweb') ||
        key.includes('auth') ||
        key.includes('wallet') ||
        key.includes('session')
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Supprimer les données de session
    sessionStorage.clear();
    
    // Supprimer les cookies liés à l'authentification
    if (document.cookie) {
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    }
    
    // Déclencher un événement pour notifier les composants
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('storage'));
    
    console.log('Cache utilisateur nettoyé avec succès - toutes les données ont été supprimées');
  } catch (error) {
    console.warn('Erreur lors du nettoyage du cache:', error);
  }
}

/**
 * Détecte l'orientation d'une vidéo à partir d'un fichier
 * @param file - Le fichier vidéo à analyser
 * @returns Promise qui résout avec l'orientation détectée
 */
export const detectVideoOrientation = (file: File): Promise<'horizontal' | 'vertical'> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const aspectRatio = video.videoWidth / video.videoHeight;
      const orientation = aspectRatio > 1 ? 'horizontal' : 'vertical';
      resolve(orientation);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossible de charger la vidéo'));
    };
    
    video.src = url;
  });
};

/**
 * Valide si l'orientation d'une vidéo correspond à l'orientation attendue
 * @param file - Le fichier vidéo à valider
 * @param expectedOrientation - L'orientation attendue ('horizontal' | 'vertical')
 * @returns Promise qui résout avec true si valide, false sinon
 */
export const validateVideoOrientation = async (
  file: File, 
  expectedOrientation: 'horizontal' | 'vertical'
): Promise<{ isValid: boolean; detectedOrientation: 'horizontal' | 'vertical' }> => {
  try {
    const detectedOrientation = await detectVideoOrientation(file);
    return {
      isValid: detectedOrientation === expectedOrientation,
      detectedOrientation
    };
  } catch (error) {
    console.error('Erreur lors de la validation de l\'orientation:', error);
    throw error;
  }
};
