import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const consoleLogs: string[] = [];
  
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const wallet = searchParams.get('wallet');

    consoleLogs.push(`🔍 [VERIFY SUPER MODERATOR] Vérification pour la campagne ${campaignId}`);
    consoleLogs.push(`👤 Wallet: ${wallet}`);

    // Validation des paramètres
    if (!campaignId || !wallet) {
      const error = 'Paramètres manquants: campaignId et wallet sont requis';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    // Vérifier si le wallet est le créateur de la campagne
    const isAuthorized = await verifySuperModeratorRole(campaignId, wallet);
    
    consoleLogs.push(`🔐 Résultat de vérification: ${isAuthorized ? 'AUTORISÉ' : 'NON AUTORISÉ'}`);

    return NextResponse.json({
      success: true,
      isAuthorized,
      campaignId,
      wallet,
      consoleLogs
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    consoleLogs.push(`❌ Erreur: ${errorMessage}`);
    console.error('❌ [VERIFY SUPER MODERATOR] Erreur:', error);
    
    return NextResponse.json(
      { success: false, error: errorMessage, consoleLogs },
      { status: 500 }
    );
  }
}

// Fonction pour vérifier le rôle de Super-Modérateur
async function verifySuperModeratorRole(campaignId: string, walletAddress: string): Promise<boolean> {
  try {
    console.log(`🔍 Vérification du rôle Super-Modérateur pour ${walletAddress} sur la campagne ${campaignId}`);
    
    // En mode développement, accepter toutes les adresses pour les tests
    if (process.env.NODE_ENV !== 'production') {
      console.log('🧪 Mode développement: Autorisation accordée pour les tests');
      return true;
    }
    
    // Utiliser la fonction Supabase pour vérifier les autorisations
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Appeler la fonction PostgreSQL pour vérifier les autorisations
    const { data, error } = await supabase.rpc('check_super_moderator_authorization', {
      p_campaign_id: campaignId,
      p_wallet: walletAddress
    });
    
    if (error) {
      console.error('❌ Erreur lors de la vérification Supabase:', error);
      return false;
    }
    
    const isAuthorized = data as boolean;
    console.log(`🔐 Résultat de vérification Supabase: ${isAuthorized ? 'AUTORISÉ' : 'NON AUTORISÉ'}`);
    
    return isAuthorized;
    
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle Super-Modérateur:', error);
    return false;
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'API pour vérifier les autorisations de Super-Modérateur',
    usage: {
      method: 'GET',
      endpoint: '/api/moderation/verify-super-moderator',
      description: 'Vérifie si une adresse wallet peut exercer le rôle de Super-Modérateur pour une campagne'
    },
    parameters: {
      campaignId: 'string - ID de la campagne',
      wallet: 'string - Adresse wallet à vérifier'
    },
    response: {
      success: 'boolean - Succès de la requête',
      isAuthorized: 'boolean - Si le wallet est autorisé',
      campaignId: 'string - ID de la campagne vérifiée',
      wallet: 'string - Adresse wallet vérifiée',
      consoleLogs: 'string[] - Logs de débogage'
    },
    example: {
      url: '/api/moderation/verify-super-moderator?campaignId=campaign_123&wallet=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      response: {
        success: true,
        isAuthorized: true,
        campaignId: 'campaign_123',
        wallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        consoleLogs: ['🔍 [VERIFY SUPER MODERATOR] Vérification pour la campagne campaign_123', '👤 Wallet: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', '🔐 Résultat de vérification: AUTORISÉ']
      }
    }
  });
}
