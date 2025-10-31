/**
 * Utilitaires pour gérer les fichiers S3
 */

/**
 * Extrait la clé S3 depuis une URL S3
 * Exemples :
 * - https://winstory-videos.s3.eu-north-1.amazonaws.com/pending/campaign_123_video.mp4
 *   → pending/campaign_123_video.mp4
 * - https://winstory-videos.s3.eu-north-1.amazonaws.com/success/initial/campaign_123_video.mp4
 *   → success/initial/campaign_123_video.mp4
 */
export function extractS3KeyFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Si l'URL est déjà une clé (sans préfixe https://), la retourner telle quelle
  if (!url.startsWith('http')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    // Extraire le chemin après le domaine
    // Ex: /pending/campaign_123_video.mp4 -> pending/campaign_123_video.mp4
    const pathname = urlObj.pathname;
    if (pathname.startsWith('/')) {
      return pathname.slice(1); // Retirer le slash initial
    }
    return pathname;
  } catch (error) {
    console.error('❌ [S3 Utils] Erreur lors de l\'extraction de la clé S3:', error);
    return null;
  }
}

/**
 * Vérifie si une URL est une URL S3 valide
 */
export function isS3Url(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Vérifier si c'est une URL S3 (format standard)
  if (url.includes('s3') && url.includes('amazonaws.com')) {
    return true;
  }

  // Vérifier si c'est déjà une clé (format simple)
  if (!url.startsWith('http') && url.length > 0) {
    return true;
  }

  return false;
}

/**
 * Construit une URL S3 complète à partir d'une clé
 */
export function buildS3Url(key: string, bucketName?: string, region?: string): string {
  const bucket = bucketName || process.env.AWS_S3_BUCKET_NAME || 'winstory-videos';
  const reg = region || process.env.AWS_REGION || 'eu-north-1';
  
  return `https://${bucket}.s3.${reg}.amazonaws.com/${key}`;
}

