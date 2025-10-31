# 🎬 Spécifications Vidéo - Winstory

## 📋 Limites techniques

### Taille et format
```typescript
const VIDEO_CONSTRAINTS = {
  maxSize: 100 * 1024 * 1024,  // 100 MB (évolutif)
  acceptedFormats: ['.mp4'],    // MP4 uniquement pour V1
  acceptedMimeTypes: ['video/mp4'],
  
  // Pas de contraintes sur:
  duration: null,      // Ni minimum, ni maximum
  resolution: null,    // Qualité jugée par modération
  codec: null,         // Pas de codec spécifique requis
  bitrate: null        // Pas de contrainte
};
```

### Validation côté client

```typescript
// /lib/videoValidation.ts
export function validateVideo(file: File): {
  valid: boolean;
  error?: string;
} {
  // 1. Vérifier le format
  if (!file.type.includes('video/mp4') && !file.name.endsWith('.mp4')) {
    return {
      valid: false,
      error: 'Format non accepté. Seuls les fichiers MP4 sont autorisés.'
    };
  }
  
  // 2. Vérifier la taille
  const maxSize = 100 * 1024 * 1024; // 100 MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Maximum: ${maxSize / (1024 * 1024)} MB`
    };
  }
  
  // 3. Vérifier que c'est bien une vidéo
  if (!file.type.startsWith('video/')) {
    return {
      valid: false,
      error: 'Le fichier sélectionné n\'est pas une vidéo.'
    };
  }
  
  return { valid: true };
}

// Extraire les métadonnées
export async function extractVideoMetadata(file: File): Promise<{
  duration: number;      // en secondes
  width: number;
  height: number;
  orientation: 'horizontal' | 'vertical';
  createdAt: Date;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const orientation = height > width ? 'vertical' : 'horizontal';
      
      resolve({
        duration: video.duration,
        width,
        height,
        orientation,
        createdAt: new Date(file.lastModified)
      });
      
      URL.revokeObjectURL(video.src);
    };
    
    video.onerror = () => {
      reject(new Error('Vidéo corrompue ou format invalide'));
      URL.revokeObjectURL(video.src);
    };
    
    video.src = URL.createObjectURL(file);
  });
}
```

---

## 🔄 Orientation des vidéos

### Règles strictes

```typescript
interface OrientationRules {
  // Créations initiales
  creation: {
    allowed: ['horizontal', 'vertical'];  // Les deux acceptés
    constraint: null;
  };
  
  // Completions
  completion: {
    allowed: ['same_as_campaign'];        // DOIT respecter l'orientation initiale
    constraint: 'strict';                  // Refus automatique si différente
  };
}
```

### Validation de l'orientation (Completions)

```typescript
// Lors de l'upload d'une completion
export async function validateCompletionOrientation(
  completionFile: File,
  campaignId: string
): Promise<{ valid: boolean; error?: string }> {
  
  // 1. Récupérer l'orientation de la campagne initiale
  const { data: campaign } = await supabase
    .from('campaign_contents')
    .select('video_orientation')
    .eq('campaign_id', campaignId)
    .single();
  
  const requiredOrientation = campaign.video_orientation; // 'horizontal' | 'vertical'
  
  // 2. Extraire l'orientation de la completion
  const metadata = await extractVideoMetadata(completionFile);
  
  // 3. Vérifier la correspondance
  if (metadata.orientation !== requiredOrientation) {
    return {
      valid: false,
      error: `Cette campagne requiert une vidéo ${requiredOrientation === 'vertical' ? 'verticale (9:16)' : 'horizontale (16:9)'}. Votre vidéo est ${metadata.orientation === 'vertical' ? 'verticale' : 'horizontale'}.`
    };
  }
  
  return { valid: true };
}
```

---

## 🗜️ Compression automatique

### Stratégie
- ✅ **Compression côté serveur** (AWS Lambda)
- ✅ **Sans perte de qualité** (ou perte imperceptible)
- ✅ **Après upload** dans `/pending`
- ✅ **Objectif** : Réduire coûts de stockage et bande passante

### Architecture

```
Upload → S3 /pending (original) → Lambda déclenché → Compression
                                         ↓
                          Remplacer par version compressée
                                         ↓
                          Supprimer l'original non-compressé
```

### Configuration AWS Lambda

```typescript
// /aws-lambda/video-compressor/index.ts
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import ffmpeg from 'fluent-ffmpeg';

export const handler = async (event: any) => {
  // Déclenché par S3 event lors d'un upload dans /pending
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  
  console.log(`[Compression] Processing: ${key}`);
  
  try {
    // 1. Télécharger la vidéo originale
    const originalVideo = await s3.getObject({ Bucket: bucket, Key: key });
    
    // 2. Compresser avec FFmpeg (H.264, CRF 23 pour qualité quasi-identique)
    const compressed = await compressVideo(originalVideo.Body, {
      codec: 'libx264',
      crf: 23,           // Qualité élevée (18-28, 23 = sweet spot)
      preset: 'medium',   // Balance vitesse/compression
      maxBitrate: '5M'   // Limite bitrate pour uniformité
    });
    
    // 3. Remplacer dans S3
    await s3.putObject({
      Bucket: bucket,
      Key: key,
      Body: compressed,
      ContentType: 'video/mp4'
    });
    
    console.log(`[Compression] Completed: ${key}`);
    console.log(`  - Original size: ${originalVideo.ContentLength} bytes`);
    console.log(`  - Compressed size: ${compressed.length} bytes`);
    console.log(`  - Reduction: ${((1 - compressed.length / originalVideo.ContentLength) * 100).toFixed(2)}%`);
    
  } catch (error) {
    console.error(`[Compression] Failed: ${key}`, error);
    // Ne pas bloquer - garder l'original si compression échoue
  }
};
```

### Configuration S3 Event

```json
{
  "LambdaFunctionConfigurations": [
    {
      "Id": "VideoCompressionTrigger",
      "LambdaFunctionArn": "arn:aws:lambda:eu-north-1:xxx:function:winstory-video-compressor",
      "Events": ["s3:ObjectCreated:*"],
      "Filter": {
        "Key": {
          "FilterRules": [
            {
              "Name": "prefix",
              "Value": "pending/"
            },
            {
              "Name": "suffix",
              "Value": ".mp4"
            }
          ]
        }
      }
    }
  ]
}
```

---

## 🖼️ Génération de thumbnails

### Configuration

```typescript
const THUMBNAIL_CONFIG = {
  format: 'jpg',
  quality: 85,
  width: 1280,      // Largeur max (conserve ratio)
  timing: 'start',  // V1: Frame du début
  // V2: timing: 'custom' avec sélection par l'utilisateur
};
```

### Génération automatique

```typescript
// /lib/thumbnailGenerator.ts
export async function generateThumbnail(
  videoFile: File,
  timingSeconds: number = 0
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    video.onloadeddata = () => {
      video.currentTime = timingSeconds;
    };
    
    video.onseeked = () => {
      // Définir la taille du canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Dessiner la frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convertir en blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
          URL.revokeObjectURL(video.src);
        },
        'image/jpeg',
        0.85
      );
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
      URL.revokeObjectURL(video.src);
    };
    
    video.src = URL.createObjectURL(videoFile);
  });
}
```

### Upload thumbnail vers S3

```typescript
// Lors de l'upload de la vidéo
const thumbnail = await generateThumbnail(videoFile, 0); // Frame au début

// Upload thumbnail
const thumbnailFormData = new FormData();
thumbnailFormData.append('file', thumbnail, `${campaignId}_thumbnail.jpg`);
thumbnailFormData.append('folder', 'thumbnails');
thumbnailFormData.append('campaignId', campaignId);

const thumbnailResponse = await fetch('/api/s3/upload', {
  method: 'POST',
  body: thumbnailFormData
});

const { thumbnailUrl } = await thumbnailResponse.json();

// Enregistrer l'URL du thumbnail en DB
await supabase
  .from('campaign_contents')
  .update({ thumbnail_url: thumbnailUrl })
  .eq('campaign_id', campaignId);
```

---

## 🎥 Préchargement vidéo (Modération)

### Stratégie

```typescript
// /app/moderation/page.tsx
const [currentContent, setCurrentContent] = useState(null);
const [nextContent, setNextContent] = useState(null);

// Précharger la vidéo suivante en arrière-plan
useEffect(() => {
  if (currentContent) {
    preloadNextVideo();
  }
}, [currentContent]);

const preloadNextVideo = async () => {
  // Récupérer le contenu suivant
  const next = await fetch('/api/moderation/next-content', {
    method: 'POST',
    body: JSON.stringify({
      moderatorWallet: account?.address,
      category,
      subcategory,
      excludeIds: [currentContent.id] // Exclure le contenu actuel
    })
  }).then(r => r.json());
  
  setNextContent(next);
  
  // Précharger la vidéo dans le navigateur
  if (next?.videoUrl) {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.src = next.videoUrl;
    // Le navigateur commencera à télécharger en cache
  }
};

const handleVote = async (decision, score) => {
  // Enregistrer le vote
  await submitVote(currentContent.id, decision, score);
  
  // Passer au contenu suivant (déjà préchargé)
  setCurrentContent(nextContent);
  setNextContent(null);
  
  // Précharger le suivant du suivant
  preloadNextVideo();
};
```

---

## 🔐 Politique de sécurité S3

### Configuration recommandée

```typescript
const S3_ACCESS_POLICY = {
  '/pending': {
    access: 'private',           // Bucket privé
    method: 'presigned_urls',    // URLs temporaires signées
    expiration: 3600,            // 1 heure
    reason: 'Sécurité avant validation'
  },
  
  '/success': {
    access: 'public',            // Bucket public
    method: 'direct_urls',       // URLs directes
    reason: 'Contenu validé, accessible à tous'
  },
  
  '/thumbnails': {
    access: 'public',
    method: 'direct_urls',
    reason: 'Previews publics'
  }
};
```

### Génération de presigned URLs (pour `/pending`)

```typescript
// /app/api/s3/presigned-url/route.ts
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: NextRequest) {
  const { fileKey, moderatorWallet } = await request.json();
  
  // Vérifier que le modérateur est éligible
  const isEligible = await checkModeratorEligibility(moderatorWallet);
  if (!isEligible) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Générer URL signée valide 1 heure
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileKey
  });
  
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600 // 1 heure
  });
  
  return NextResponse.json({ signedUrl });
}
```

---

## 🎨 Watermarking (Filigrane)

### Règles

```typescript
const WATERMARK_RULES = {
  '/pending': {
    watermark: false,
    reason: 'Contenu non validé - pas de branding Winstory'
  },
  
  '/success/initial': {
    watermark: true,
    position: 'bottom-right',
    opacity: 0.3,
    logo: '/assets/winstory-logo-watermark.png'
  },
  
  '/success/completions': {
    watermark: true,  // Seulement TOP 3
    position: 'bottom-right',
    opacity: 0.3,
    logo: '/assets/winstory-logo-watermark.png'
  }
};
```

### Application du watermark

```typescript
// AWS Lambda déclenché lors du déplacement vers /success
export const applyWatermark = async (videoKey: string) => {
  // Utiliser FFmpeg pour overlay le logo
  const watermarked = await ffmpeg(videoKey)
    .input('/opt/winstory-logo-watermark.png')
    .complexFilter([
      '[1:v]scale=120:-1[logo]',
      '[0:v][logo]overlay=W-w-20:H-h-20:format=auto,format=yuv420p[out]'
    ])
    .map('[out]')
    .outputOptions('-c:a copy')  // Copier l'audio sans re-encoder
    .outputOptions('-c:v libx264')
    .outputOptions('-crf 23')
    .save();
    
  return watermarked;
};
```

---

## 📊 Métadonnées à stocker

### Structure de la table

```sql
-- Ajouter colonnes à campaign_contents
ALTER TABLE campaign_contents ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE campaign_contents ADD COLUMN IF NOT EXISTS resolution_width INTEGER;
ALTER TABLE campaign_contents ADD COLUMN IF NOT EXISTS resolution_height INTEGER;
ALTER TABLE campaign_contents ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE campaign_contents ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE campaign_contents ADD COLUMN IF NOT EXISTS mint_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE campaign_contents ADD COLUMN IF NOT EXISTS validation_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE campaign_contents ADD COLUMN IF NOT EXISTS refusal_date TIMESTAMP WITH TIME ZONE;
```

### Enregistrement lors de l'upload

```typescript
// Après upload S3
const metadata = await extractVideoMetadata(videoFile);

await supabase
  .from('campaign_contents')
  .update({
    duration_seconds: Math.round(metadata.duration),
    resolution_width: metadata.width,
    resolution_height: metadata.height,
    video_orientation: metadata.orientation,
    thumbnail_url: thumbnailUrl,
    mint_date: new Date().toISOString()
  })
  .eq('campaign_id', campaignId);
```

---

## 👁️ Tracking des vues

### Incrémenter le compteur

```typescript
// /app/api/videos/track-view/route.ts
export async function POST(request: NextRequest) {
  const { campaignId, userWallet } = await request.json();
  
  // Éviter de compter plusieurs fois la même vue
  const viewKey = `view:${campaignId}:${userWallet}`;
  const hasViewed = localStorage.getItem(viewKey);
  
  if (!hasViewed) {
    // Incrémenter le compteur
    await supabase.rpc('increment_view_count', { p_campaign_id: campaignId });
    
    // Marquer comme vu
    localStorage.setItem(viewKey, 'true');
  }
  
  return NextResponse.json({ success: true });
}
```

### Fonction SQL

```sql
-- Créer la fonction RPC
CREATE OR REPLACE FUNCTION increment_view_count(p_campaign_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE campaign_contents
  SET view_count = view_count + 1
  WHERE campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;
```

### Affichage dans /mywin

```typescript
// Dashboard créateur
const { data: myContent } = await supabase
  .from('campaign_contents')
  .select('*, campaigns(*)')
  .eq('campaigns.original_creator_wallet', userWallet);

// Afficher les stats
myContent.map(content => (
  <div>
    <h3>{content.campaigns.title}</h3>
    <p>👁️ {content.view_count} vues</p>
    <p>Status: {content.moderation_status}</p>
    {content.moderation_status === 'PENDING_MODERATION' && (
      <p>Votes: {content.total_votes} / 22</p>
    )}
  </div>
));
```

---

## 📱 Affichage mobile

### Plein écran automatique pour vidéos verticales

```typescript
// Composant VideoPlayer
const VideoPlayer = ({ videoUrl, orientation }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    // Sur mobile + vidéo verticale → suggérer plein écran
    if (isMobile() && orientation === 'vertical') {
      const video = videoRef.current;
      if (video) {
        video.addEventListener('play', () => {
          if (document.fullscreenEnabled) {
            video.requestFullscreen();
          }
        });
      }
    }
  }, [orientation]);
  
  return (
    <video
      ref={videoRef}
      src={videoUrl}
      controls
      playsInline  // Important pour iOS
      className={orientation === 'vertical' ? 'vertical-video' : 'horizontal-video'}
    />
  );
};
```

---

## 🎬 Player personnalisé - Court-métrage

### Combinaison création + completion

```typescript
// Lors de la lecture d'un court-métrage (création + completion)
const ShortFilmPlayer = ({ campaignId, completionId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPart, setCurrentPart] = useState<'intro' | 'creation' | 'transition' | 'completion'>('intro');
  
  const creationVideoUrl = '...';
  const completionVideoUrl = '...';
  const transitionLogoUrl = '/assets/winstory-transition-logo.png';
  
  return (
    <div className="short-film-player">
      {/* Vidéo de création */}
      {currentPart === 'creation' && (
        <video
          src={creationVideoUrl}
          autoPlay
          onEnded={() => setCurrentPart('transition')}
        />
      )}
      
      {/* Transition : Écran noir + logo Winstory (0.1s) */}
      {currentPart === 'transition' && (
        <div
          className="transition-screen"
          style={{
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={transitionLogoUrl}
            alt="Winstory"
            onLoad={() => {
              setTimeout(() => setCurrentPart('completion'), 100); // 0.1s
            }}
          />
        </div>
      )}
      
      {/* Vidéo de completion */}
      {currentPart === 'completion' && (
        <video
          src={completionVideoUrl}
          autoPlay
          controls
        />
      )}
      
      {/* Fonctionnalités */}
      <div className="player-controls">
        <button onClick={() => togglePictureInPicture()}>📺 PiP</button>
        <button onClick={() => toggleSubtitles()}>💬 Sous-titres</button>
      </div>
    </div>
  );
};
```

---

## 🔄 Re-upload en cas de refus

### Workflow

```typescript
// Si vidéo refusée
const handleReUpload = async () => {
  // 1. Vérifier que l'utilisateur a des MINTs disponibles
  const { data: userBalance } = await checkMintAvailability(userWallet);
  
  if (userBalance.availableMints === 0 && mintPrice > 0) {
    alert('Vous devez acheter un MINT pour re-tenter');
    router.push('/buy-mint');
    return;
  }
  
  // 2. Afficher les raisons du refus
  const { data: refusalReasons } = await supabase
    .from('moderation_history')
    .select('refusal_reasons, violation_checklist')
    .eq('campaign_id', campaignId)
    .single();
  
  // 3. Permettre le re-upload
  router.push('/creation/yourfilm', {
    state: {
      isReupload: true,
      previousCampaignId: campaignId,
      refusalReasons: refusalReasons
    }
  });
};
```

---

## 🚀 Recommandations d'implémentation

### Phase 1 (Immédiat)
- ✅ Validation vidéo côté client (taille, format)
- ✅ Extraction métadonnées (durée, résolution, orientation)
- ✅ Génération thumbnail (frame début)
- ✅ Validation orientation pour completions

### Phase 2 (Court terme)
- ✅ Compression AWS Lambda (sans perte)
- ✅ Presigned URLs pour `/pending`
- ✅ Tracking vues basique
- ✅ Affichage stats dans /mywin

### Phase 3 (Moyen terme)
- ✅ Watermarking automatique sur `/success`
- ✅ Préchargement vidéo en modération
- ✅ Player court-métrage (création + completion)
- ✅ Mobile responsive avancé

### Phase 4 (Long terme)
- ✅ CDN CloudFront
- ✅ Thumbnail personnalisé
- ✅ Sous-titres automatiques
- ✅ Stories-style mobile

---

**📖 Cette spécification est prête pour l'implémentation ! 🚀**

