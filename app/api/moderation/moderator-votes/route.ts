import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  const consoleLogs: string[] = [];
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const campaignId = searchParams.get('campaignId');
    const limit = Math.min(Number(searchParams.get('limit') ?? 100), 500);
    const offset = Math.max(Number(searchParams.get('offset') ?? 0), 0);

    if (!wallet) {
      return NextResponse.json({ error: 'wallet is required', consoleLogs }, { status: 400 });
    }

    if (!supabaseServer) {
      consoleLogs.push('⚠️ Supabase server client not configured');
      return NextResponse.json({ votes: [], metrics: {}, consoleLogs });
    }

    // Fetch votes
    // IMPORTANT: Normaliser le wallet address en lowercase pour la cohérence avec la base de données
    const normalizedWallet = wallet.toLowerCase();
    let query = supabaseServer
      .from('moderation_votes')
      .select('id,campaign_id,moderator_wallet,completion_id,vote_decision,staked_amount,vote_weight,transaction_hash,vote_timestamp,created_at')
      .eq('moderator_wallet', normalizedWallet)
      .order('vote_timestamp', { ascending: false })
      .range(offset, offset + limit - 1);
    if (campaignId) query = query.eq('campaign_id', campaignId);
    const { data: votes, error } = await query;
    if (error) {
      consoleLogs.push(`❌ Error fetching votes: ${error.message}`);
      return NextResponse.json({ error: error.message, consoleLogs }, { status: 500 });
    }

    // Fetch completion scores aligned with these votes
    const completionIds = (votes ?? []).map(v => v.completion_id).filter(Boolean);
    let scoresMap: Record<string, any[]> = {};
    if (completionIds.length > 0) {
      const { data: scores } = await supabaseServer
        .from('user_completion_moderator_scores')
        .select('completion_id,staker_wallet,score,is_refused,vote_timestamp')
        .in('completion_id', completionIds as string[])
        .eq('staker_wallet', wallet);
      if (scores) {
        for (const s of scores) {
          const cid = s.completion_id;
          if (!scoresMap[cid]) scoresMap[cid] = [];
          scoresMap[cid].push(s);
        }
      }
    }

    // Aggregate simple metrics for analysis
    const metrics = {
      totalVotes: votes?.length ?? 0,
      // Convertir approve/reject de la DB vers VALID/REFUSE pour la compatibilité
      validCount: votes?.filter(v => v.vote_decision === 'approve').length ?? 0,
      refuseCount: votes?.filter(v => v.vote_decision === 'reject').length ?? 0,
      avgWeight: votes && votes.length > 0 ? Number((votes.reduce((a, v) => a + (Number(v.vote_weight) || 0), 0) / votes.length).toFixed(3)) : 0,
    };

    return NextResponse.json({ votes, scores: scoresMap, metrics, consoleLogs });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}


