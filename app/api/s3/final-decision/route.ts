import { NextRequest, NextResponse } from 'next/server';
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { supabaseServer } from '@/lib/supabaseServer';
import { extractS3KeyFromUrl, isS3Url } from '@/lib/s3Utils';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'winstory-videos';

interface FinalDecisionRequest {
  campaignId: string;
  completionId?: string;
  decision: 'VALIDATED' | 'REFUSED';
  campaignType: 'INITIAL' | 'COMPLETION';
  isTop3?: boolean; // Pour les complétions, indique si c'est dans le TOP 3
}

/**
 * POST /api/s3/final-decision
 * 
 * Gère la décision finale de modération et déplace/supprime les vidéos S3 en conséquence.
 * 
 * Pour les CAMPAGNES INITIALES :
 * - VALIDATED → Déplacer de /pending vers /success/initial
 * - REFUSED → Supprimer de /pending
 * 
 * Pour les COMPLETIONS :
 * - VALIDATED + TOP 3 → Déplacer de /pending vers /success/completions
 * - VALIDATED + HORS TOP 3 → Supprimer de /pending (garder seulement metadata)
 * - REFUSED → Supprimer de /pending
 */
export async function POST(request: NextRequest) {
  const consoleLogs: string[] = [];
  
  try {
    const body: FinalDecisionRequest = await request.json();
    const { campaignId, completionId, decision, campaignType, isTop3 = false } = body;

    consoleLogs.push(`🔍 [FINAL DECISION] Traitement de la décision finale`);
    consoleLogs.push(`📋 Campaign ID: ${campaignId}`);
    consoleLogs.push(`📋 Completion ID: ${completionId || 'N/A'}`);
    consoleLogs.push(`📋 Type: ${campaignType}`);
    consoleLogs.push(`📋 Décision: ${decision}`);
    consoleLogs.push(`📋 TOP 3: ${isTop3 ? 'OUI' : 'NON'}`);

    // Validation
    if (!campaignId || !decision || !campaignType) {
      const error = 'Données manquantes: campaignId, decision et campaignType sont requis';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    if (!['VALIDATED', 'REFUSED'].includes(decision)) {
      const error = 'decision doit être VALIDATED ou REFUSED';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    // Récupérer l'URL de la vidéo depuis la base de données
    let videoUrl: string | null = null;
    
    if (supabaseServer) {
      // Pour les campagnes initiales, utiliser campaign_contents
      if (campaignType === 'INITIAL') {
        const { data: contentData, error: contentError } = await supabaseServer
          .from('campaign_contents')
          .select('video_url')
          .eq('campaign_id', campaignId)
          .single();

        if (contentError) {
          consoleLogs.push(`⚠️ Erreur lors de la récupération du contenu: ${contentError.message}`);
        } else {
          videoUrl = contentData?.video_url || null;
        }
      } 
      // Pour les complétions, utiliser completion_contents ou la table appropriée
      else if (campaignType === 'COMPLETION' && completionId) {
        // Chercher dans campaign_contents avec completion_id si la structure le permet
        // Sinon, chercher directement dans la table completions
        const { data: completionData, error: completionError } = await supabaseServer
          .from('campaign_contents')
          .select('video_url')
          .eq('campaign_id', completionId) // Peut nécessiter un ajustement selon la structure
          .single();

        if (completionError) {
          consoleLogs.push(`⚠️ Erreur lors de la récupération de la complétion: ${completionError.message}`);
          // Essayer une autre approche si la première échoue
          consoleLogs.push(`ℹ️ Essai avec completion_id: ${completionId}`);
        } else {
          videoUrl = completionData?.video_url || null;
        }
      }
    }

    if (!videoUrl) {
      const error = 'Aucune URL vidéo trouvée dans la base de données';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 404 }
      );
    }

    consoleLogs.push(`📹 URL vidéo trouvée: ${videoUrl}`);

    // Vérifier que c'est bien une URL S3
    if (!isS3Url(videoUrl)) {
      const error = `L'URL vidéo n'est pas une URL S3 valide: ${videoUrl}`;
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    // Extraire la clé S3
    const sourceKey = extractS3KeyFromUrl(videoUrl);
    if (!sourceKey) {
      const error = `Impossible d'extraire la clé S3 depuis l'URL: ${videoUrl}`;
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    consoleLogs.push(`🔑 Clé S3 source: ${sourceKey}`);

    // Vérifier que la vidéo est bien dans /pending
    if (!sourceKey.startsWith('pending/')) {
      const error = `La vidéo n'est pas dans le dossier /pending: ${sourceKey}`;
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    let newVideoUrl: string | null = null;

    // Traitement selon la décision
    if (decision === 'VALIDATED') {
      if (campaignType === 'INITIAL') {
        // Campagne initiale validée → Déplacer vers /success/initial
        const destinationKey = sourceKey.replace('pending/', 'success/initial/');
        
        consoleLogs.push(`📦 Déplacement: ${sourceKey} → ${destinationKey}`);
        
        // Copier vers la destination
        const copyCommand = new CopyObjectCommand({
          Bucket: BUCKET_NAME,
          CopySource: `${BUCKET_NAME}/${sourceKey}`,
          Key: destinationKey,
        });
        await s3Client.send(copyCommand);
        consoleLogs.push(`✅ Copie effectuée`);

        // Supprimer l'original
        const deleteCommand = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: sourceKey,
        });
        await s3Client.send(deleteCommand);
        consoleLogs.push(`✅ Original supprimé`);

        newVideoUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${destinationKey}`;
      } 
      else if (campaignType === 'COMPLETION') {
        if (isTop3) {
          // Complétion TOP 3 → Déplacer vers /success/completions
          const destinationKey = sourceKey.replace('pending/', 'success/completions/');
          
          consoleLogs.push(`📦 Déplacement TOP 3: ${sourceKey} → ${destinationKey}`);
          
          const copyCommand = new CopyObjectCommand({
            Bucket: BUCKET_NAME,
            CopySource: `${BUCKET_NAME}/${sourceKey}`,
            Key: destinationKey,
          });
          await s3Client.send(copyCommand);
          consoleLogs.push(`✅ Copie effectuée`);

          const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: sourceKey,
          });
          await s3Client.send(deleteCommand);
          consoleLogs.push(`✅ Original supprimé`);

          newVideoUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${destinationKey}`;
        } else {
          // Complétion hors TOP 3 → Supprimer (garder seulement metadata)
          consoleLogs.push(`🗑️ Suppression (hors TOP 3): ${sourceKey}`);
          
          const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: sourceKey,
          });
          await s3Client.send(deleteCommand);
          consoleLogs.push(`✅ Vidéo supprimée (metadata conservée)`);

          newVideoUrl = 'METADATA_ONLY'; // Marqueur pour indiquer que seule la metadata est conservée
        }
      }
    } 
    else if (decision === 'REFUSED') {
      // Refus → Supprimer la vidéo
      consoleLogs.push(`🗑️ Suppression (refus): ${sourceKey}`);
      
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: sourceKey,
      });
      await s3Client.send(deleteCommand);
      consoleLogs.push(`✅ Vidéo supprimée (metadata conservée)`);

      newVideoUrl = 'REFUSED_AND_DELETED'; // Marqueur pour indiquer que la vidéo a été refusée
    }

    // Mettre à jour la base de données
    if (supabaseServer && newVideoUrl) {
      if (campaignType === 'INITIAL') {
        const { error: updateError } = await supabaseServer
          .from('campaign_contents')
          .update({
            video_url: newVideoUrl,
          })
          .eq('campaign_id', campaignId);

        if (updateError) {
          consoleLogs.push(`⚠️ Erreur lors de la mise à jour de campaign_contents: ${updateError.message}`);
        } else {
          consoleLogs.push(`✅ Base de données mise à jour`);
        }
      } 
      else if (campaignType === 'COMPLETION') {
        // Mettre à jour la complétion
        // Note: Cela peut nécessiter un ajustement selon la structure de votre base de données
        const { error: updateError } = await supabaseServer
          .from('campaign_contents')
          .update({
            video_url: newVideoUrl,
          })
          .eq('campaign_id', completionId || campaignId);

        if (updateError) {
          consoleLogs.push(`⚠️ Erreur lors de la mise à jour de la complétion: ${updateError.message}`);
        } else {
          consoleLogs.push(`✅ Base de données mise à jour`);
        }
      }

      // Mettre à jour le statut de la campagne/complétion
      const statusTable = campaignType === 'INITIAL' ? 'campaigns' : 'completions';
      const statusId = campaignType === 'INITIAL' ? campaignId : (completionId || campaignId);
      
      const { error: statusError } = await supabaseServer
        .from(statusTable)
        .update({
          status: decision === 'VALIDATED' ? 'VALIDATED' : 'REFUSED',
        })
        .eq('id', statusId);

      if (statusError) {
        consoleLogs.push(`⚠️ Erreur lors de la mise à jour du statut: ${statusError.message}`);
      } else {
        consoleLogs.push(`✅ Statut mis à jour: ${decision}`);
      }
    }

    return NextResponse.json({
      success: true,
      newVideoUrl,
      consoleLogs,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    consoleLogs.push(`❌ Erreur: ${errorMessage}`);
    
    console.error('❌ [FINAL DECISION API] Erreur:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage, 
        consoleLogs 
      },
      { status: 500 }
    );
  }
}

