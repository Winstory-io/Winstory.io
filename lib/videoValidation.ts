/**
 * Utilitaires de validation vidéo pour Winstory
 * Spécifications complètes dans SPECIFICATIONS_VIDEO.md
 */

// Constantes de validation
export const VIDEO_CONSTRAINTS = {
  maxSize: 100 * 1024 * 1024,  // 100 MB (évolutif)
  acceptedFormats: ['.mp4'],
  acceptedMimeTypes: ['video/mp4'],
  // Pas de contraintes sur durée, résolution, codec, bitrate
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface VideoMetadata {
  duration: number;      // en secondes
  width: number;
  height: number;
  orientation: 'horizontal' | 'vertical';
  aspectRatio: string;   // ex: "16:9" ou "9:16"
  fileSize: number;      // en bytes
  fileName: string;
  createdAt: Date;
}

/**
 * Valide un fichier vidéo selon les contraintes Winstory
 */
export function validateVideoFile(file: File): ValidationResult {
  // 1. Vérifier que c'est bien un fichier
  if (!file) {
    return {
      valid: false,
      error: 'Aucun fichier sélectionné.'
    };
  }

  // 2. Vérifier le format (MP4 uniquement pour V1)
  const isMP4 = file.type.includes('video/mp4') || file.name.toLowerCase().endsWith('.mp4');
  
  if (!isMP4) {
    return {
      valid: false,
      error: 'Format non accepté. Seuls les fichiers MP4 sont autorisés pour le moment.'
    };
  }

  // 3. Vérifier que c'est bien une vidéo
  if (!file.type.startsWith('video/')) {
    return {
      valid: false,
      error: 'Le fichier sélectionné n\'est pas une vidéo.'
    };
  }

  // 4. Vérifier la taille (100 MB max)
  const maxSize = VIDEO_CONSTRAINTS.maxSize;
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    const fileSizeMB = Math.round(file.size / (1024 * 1024));
    return {
      valid: false,
      error: `Fichier trop volumineux (${fileSizeMB} MB). Taille maximale acceptée : ${maxSizeMB} MB.`
    };
  }

  // 5. Vérifier que la taille n'est pas 0
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Le fichier vidéo est vide ou corrompu.'
    };
  }

  return { valid: true };
}

/**
 * Extrait les métadonnées d'une vidéo
 */
export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const orientation = height > width ? 'vertical' : 'horizontal';
      
      // Calculer l'aspect ratio
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(width, height);
      const aspectRatio = `${width / divisor}:${height / divisor}`;
      
      resolve({
        duration: video.duration,
        width,
        height,
        orientation,
        aspectRatio,
        fileSize: file.size,
        fileName: file.name,
        createdAt: new Date(file.lastModified)
      });
      
      URL.revokeObjectURL(video.src);
    };
    
    video.onerror = () => {
      reject(new Error('Vidéo corrompue ou format invalide. Veuillez sélectionner une autre vidéo.'));
      URL.revokeObjectURL(video.src);
    };
    
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Valide l'orientation d'une completion par rapport à la campagne initiale
 */
export async function validateCompletionOrientation(
  completionFile: File,
  campaignOrientation: 'horizontal' | 'vertical'
): Promise<ValidationResult> {
  try {
    const metadata = await extractVideoMetadata(completionFile);
    
    if (metadata.orientation !== campaignOrientation) {
      const required = campaignOrientation === 'vertical' ? 'verticale (9:16)' : 'horizontale (16:9)';
      const provided = metadata.orientation === 'vertical' ? 'verticale' : 'horizontale';
      
      return {
        valid: false,
        error: `Cette campagne requiert une vidéo ${required}. Votre vidéo est ${provided} (${metadata.aspectRatio}).`
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la validation de la vidéo.'
    };
  }
}

/**
 * Formate la durée en format lisible (mm:ss ou hh:mm:ss)
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formate la taille de fichier en format lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

/**
 * Génère une thumbnail (vignette) à partir d'une vidéo
 */
export async function generateThumbnail(
  videoFile: File,
  timingSeconds: number = 0
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    video.onloadeddata = () => {
      video.currentTime = Math.min(timingSeconds, video.duration - 0.1);
    };
    
    video.onseeked = () => {
      // Définir la taille du canvas (max 1280px de largeur)
      const maxWidth = 1280;
      const scale = Math.min(1, maxWidth / video.videoWidth);
      
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      
      // Dessiner la frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convertir en blob JPEG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Échec de la génération de la vignette'));
          }
          URL.revokeObjectURL(video.src);
        },
        'image/jpeg',
        0.85 // Qualité 85%
      );
    };
    
    video.onerror = () => {
      reject(new Error('Échec du chargement de la vidéo'));
      URL.revokeObjectURL(video.src);
    };
    
    video.src = URL.createObjectURL(videoFile);
  });
}

/**
 * Vérifie si l'appareil est mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Détecte si la vidéo est corrompue avant upload
 */
export async function checkVideoIntegrity(file: File): Promise<ValidationResult> {
  try {
    // Essayer d'extraire les métadonnées
    await extractVideoMetadata(file);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'La vidéo semble corrompue. Veuillez réessayer avec un autre fichier.'
    };
  }
}

/**
 * Validation complète (format + intégrité + métadonnées)
 */
export async function validateVideoComplete(file: File): Promise<{
  valid: boolean;
  error?: string;
  metadata?: VideoMetadata;
}> {
  // 1. Validation de base (format, taille)
  const basicValidation = validateVideoFile(file);
  if (!basicValidation.valid) {
    return basicValidation;
  }
  
  // 2. Vérifier l'intégrité
  const integrityCheck = await checkVideoIntegrity(file);
  if (!integrityCheck.valid) {
    return integrityCheck;
  }
  
  // 3. Extraire les métadonnées
  try {
    const metadata = await extractVideoMetadata(file);
    return {
      valid: true,
      metadata
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'analyse de la vidéo.'
    };
  }
}

