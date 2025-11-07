import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

/**
 * API pour normaliser les wallet addresses en lowercase dans moderation_votes
 * Cette API doit être appelée une fois pour corriger les données existantes
 */
export async function POST(request: NextRequest) {
  const consoleLogs: string[] = [];
  
  try {
    if (!supabaseServer) {
      consoleLogs.push('⚠️ Supabase server client not configured');
      return NextResponse.json({ success: false, error: 'Supabase not configured', consoleLogs }, { status: 500 });
    }

    consoleLogs.push('🔄 [NORMALIZE VOTES] Starting normalization of moderator_wallet addresses...');

    // Récupérer tous les votes
    const { data: votes, error: fetchError } = await supabaseServer
      .from('moderation_votes')
      .select('id, moderator_wallet');

    if (fetchError) {
      consoleLogs.push(`❌ [NORMALIZE VOTES] Error fetching votes: ${fetchError.message}`);
      return NextResponse.json({ success: false, error: fetchError.message, consoleLogs }, { status: 500 });
    }

    if (!votes || votes.length === 0) {
      consoleLogs.push('✅ [NORMALIZE VOTES] No votes to normalize');
      return NextResponse.json({ success: true, updated: 0, consoleLogs });
    }

    consoleLogs.push(`📊 [NORMALIZE VOTES] Found ${votes.length} votes to check`);

    // Filtrer les votes qui ont besoin de normalisation
    const votesToUpdate = votes.filter(v => v.moderator_wallet !== v.moderator_wallet.toLowerCase());
    
    consoleLogs.push(`📊 [NORMALIZE VOTES] ${votesToUpdate.length} votes need normalization`);

    if (votesToUpdate.length === 0) {
      consoleLogs.push('✅ [NORMALIZE VOTES] All votes are already normalized');
      return NextResponse.json({ success: true, updated: 0, consoleLogs });
    }

    // Mettre à jour chaque vote
    let updated = 0;
    let errors = 0;

    for (const vote of votesToUpdate) {
      const normalizedWallet = vote.moderator_wallet.toLowerCase();
      
      const { error: updateError } = await supabaseServer
        .from('moderation_votes')
        .update({ moderator_wallet: normalizedWallet })
        .eq('id', vote.id);

      if (updateError) {
        consoleLogs.push(`❌ [NORMALIZE VOTES] Error updating vote ${vote.id}: ${updateError.message}`);
        errors++;
      } else {
        updated++;
        if (updated % 10 === 0) {
          consoleLogs.push(`🔄 [NORMALIZE VOTES] Progress: ${updated}/${votesToUpdate.length}`);
        }
      }
    }

    consoleLogs.push(`✅ [NORMALIZE VOTES] Normalization complete: ${updated} updated, ${errors} errors`);

    return NextResponse.json({ 
      success: true, 
      updated, 
      errors,
      total: votes.length,
      consoleLogs 
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    consoleLogs.push(`❌ [NORMALIZE VOTES] Exception: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage, consoleLogs }, { status: 500 });
  }
}

