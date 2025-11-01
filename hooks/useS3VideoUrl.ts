import { useState, useEffect, useRef } from 'react';
import { extractS3KeyFromUrl } from '../lib/s3Utils';

/**
 * Hook pour gérer les URLs de vidéos S3
 * Génère automatiquement une presigned URL si la vidéo est dans /pending
 * Régénère automatiquement l'URL avant expiration (45 minutes sur une durée de 1 heure)
 */
export function useS3VideoUrl(originalUrl: string | undefined | null) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expirationTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Fonction pour générer une presigned URL (définie dans le scope de l'effect)
    const generatePresignedUrl = async (fileKey: string, expiresIn: number = 3600) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/s3/presigned-url?fileKey=${encodeURIComponent(fileKey)}&expiresIn=${expiresIn}`);
        const result = await response.json();

        if (result.success && result.signedUrl) {
          console.log('✅ [USE S3 VIDEO URL] Presigned URL generated, expires in', expiresIn, 'seconds');
          
          // Enregistrer l'heure d'expiration (45 minutes avant expiration pour régénération)
          const refreshDelay = Math.max(expiresIn - 900, expiresIn * 0.75); // 45 min ou 75% de la durée
          expirationTimeRef.current = Date.now() + (refreshDelay * 1000);
          
          setVideoUrl(result.signedUrl);
          setIsLoading(false);
          
          // Programmer la régénération automatique avant expiration
          if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
          }
          
          refreshTimerRef.current = setTimeout(() => {
            console.log('🔄 [USE S3 VIDEO URL] Presigned URL expiring soon, refreshing...');
            generatePresignedUrl(fileKey, expiresIn);
          }, refreshDelay * 1000);
          
          return result.signedUrl;
        } else {
          console.warn('⚠️ [USE S3 VIDEO URL] Failed to generate presigned URL:', result.error);
          setError(result.error || 'Failed to generate presigned URL');
          setVideoUrl(originalUrl || null); // Fallback
          setIsLoading(false);
          return null;
        }
      } catch (err) {
        console.error('❌ [USE S3 VIDEO URL] Error generating presigned URL:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate presigned URL');
        setVideoUrl(originalUrl || null); // Fallback
        setIsLoading(false);
        return null;
      }
    };

    if (!originalUrl) {
      setVideoUrl(null);
      // Nettoyer le timer si l'URL change
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      expirationTimeRef.current = null;
      return;
    }

    // Extraire la clé S3 de l'URL
    const fileKey = extractS3KeyFromUrl(originalUrl);
    
    if (!fileKey) {
      console.warn('⚠️ [USE S3 VIDEO URL] Could not extract S3 key from URL:', originalUrl);
      setVideoUrl(originalUrl); // Fallback vers l'URL originale
      return;
    }

    // Si la vidéo est dans /pending, générer une presigned URL
    if (fileKey.startsWith('pending/')) {
      console.log('🔑 [USE S3 VIDEO URL] Video is in /pending, generating presigned URL for:', fileKey);
      generatePresignedUrl(fileKey, 3600); // 1 heure de validité
    } else {
      // Si la vidéo est dans /success, elle devrait être publique, utiliser l'URL directement
      console.log('✅ [USE S3 VIDEO URL] Video is in /success, using direct URL');
      setVideoUrl(originalUrl);
      
      // Nettoyer le timer car on n'a pas besoin de presigned URL
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      expirationTimeRef.current = null;
    }

    // Cleanup: nettoyer le timer lors du démontage ou changement d'URL
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [originalUrl]);

  return { videoUrl, isLoading, error };
}
