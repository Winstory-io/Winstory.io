import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const consoleLogs: string[] = [];
  
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const completionId = searchParams.get('completionId');

    consoleLogs.push(`🔍 [COMMUNITY DATA] Récupération des données communautaires`);
    consoleLogs.push(`📊 Campagne: ${campaignId}`);
    consoleLogs.push(`📊 Complétion: ${completionId}`);

    // Validation des paramètres
    if (!campaignId || !completionId) {
      const error = 'Paramètres manquants: campaignId et completionId sont requis';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    // Utiliser Supabase pour récupérer les données
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Récupérer les données de modération communautaire
    const { data: moderationData, error } = await supabase
      .from('moderation_progress')
      .select('valid_votes, refuse_votes, average_score, decision, stakers_count, staking_pool_total')
      .eq('completion_id', completionId)
      .single();

    if (error) {
      consoleLogs.push(`❌ Erreur Supabase: ${error.message}`);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des données', consoleLogs },
        { status: 500 }
      );
    }

    if (!moderationData) {
      consoleLogs.push(`⚠️ Aucune donnée de modération trouvée`);
      return NextResponse.json(
        { success: false, error: 'Aucune donnée de modération trouvée', consoleLogs },
        { status: 404 }
      );
    }

    const result = {
      validVotes: moderationData.valid_votes || 0,
      refuseVotes: moderationData.refuse_votes || 0,
      averageScore: moderationData.average_score || 0,
      decision: moderationData.decision || 'REFUSE',
      stakersCount: moderationData.stakers_count || 0,
      stakingPool: moderationData.staking_pool_total || 0
    };

    consoleLogs.push(`✅ Données communautaires récupérées: ${JSON.stringify(result)}`);

    return NextResponse.json({
      success: true,
      data: result,
      consoleLogs
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    consoleLogs.push(`❌ Erreur: ${errorMessage}`);
    console.error('❌ [COMMUNITY DATA] Erreur:', error);
    
    return NextResponse.json(
      { success: false, error: errorMessage, consoleLogs },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'API pour récupérer les données de modération communautaire',
    usage: {
      method: 'GET',
      endpoint: '/api/moderation/community-data',
      description: 'Récupère les données de modération communautaire pour une complétion'
    },
    parameters: {
      campaignId: 'string - ID de la campagne',
      completionId: 'string - ID de la complétion'
    },
    response: {
      success: 'boolean - Succès de la requête',
      data: {
        validVotes: 'number - Nombre de votes OUI',
        refuseVotes: 'number - Nombre de votes NON',
        averageScore: 'number - Score moyen communautaire',
        decision: 'VALID | REFUSE - Décision communautaire',
        stakersCount: 'number - Nombre de stakers',
        stakingPool: 'number - Montant du pool de staking'
      },
      consoleLogs: 'string[] - Logs de débogage'
    },
    example: {
      url: '/api/moderation/community-data?campaignId=campaign_123&completionId=completion_456',
      response: {
        success: true,
        data: {
          validVotes: 26,
          refuseVotes: 8,
          averageScore: 78.4,
          decision: 'VALID',
          stakersCount: 34,
          stakingPool: 1250.50
        }
      }
    }
  });
}
