import { NextRequest, NextResponse } from 'next/server';

// Mode de test pour le développement (sans base de données)
const TEST_MODE = process.env.NODE_ENV === 'development';

// Stockage temporaire en mémoire pour les tests
const mockScores: Record<string, number[]> = {};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const moderatorWallet = searchParams.get('moderatorWallet');

    console.log('🔍 GET /api/moderation/moderator-scores - Params:', { campaignId, moderatorWallet });

    if (!campaignId || !moderatorWallet) {
      console.log('❌ Paramètres manquants');
      return NextResponse.json(
        { error: 'Campaign ID and moderator wallet are required' },
        { status: 400 }
      );
    }

    // IMPORTANT: Normaliser le wallet address en lowercase pour la cohérence
    const normalizedWallet = moderatorWallet.toLowerCase();

    // En mode test, utiliser le stockage en mémoire
    if (TEST_MODE) {
      const key = `${campaignId}_${normalizedWallet}`;
      const scores = mockScores[key] || [];
      console.log('🧪 Mode test activé, scores récupérés:', scores);
      return NextResponse.json({ usedScores: scores });
    }

    // TODO: Implémenter la vraie logique avec Prisma
    console.log('⚠️ Mode production non encore implémenté, retour d\'un tableau vide');
    return NextResponse.json({ usedScores: [] });
    
  } catch (error) {
    console.error('❌ Erreur dans GET /api/moderation/moderator-scores:', error);
    return NextResponse.json({ usedScores: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, moderatorWallet, score, completionId } = body;

    console.log('📝 POST /api/moderation/moderator-scores - Body:', { campaignId, moderatorWallet, score, completionId });

    if (!campaignId || !moderatorWallet || score === undefined) {
      console.log('❌ Données manquantes dans le body');
      return NextResponse.json(
        { error: 'Campaign ID, moderator wallet, and score are required' },
        { status: 400 }
      );
    }

    // IMPORTANT: Normaliser le wallet address en lowercase pour la cohérence
    const normalizedWallet = moderatorWallet.toLowerCase();

    // En mode test, utiliser le stockage en mémoire
    if (TEST_MODE) {
      const key = `${campaignId}_${normalizedWallet}`;
      
      // Vérifier si le score est déjà utilisé
      if (mockScores[key] && mockScores[key].includes(score)) {
        console.log('⚠️ Score déjà utilisé:', score);
        return NextResponse.json(
          { error: 'This score has already been used by this moderator for this campaign' },
          { status: 409 }
        );
      }
      
      // Ajouter le score
      if (!mockScores[key]) {
        mockScores[key] = [];
      }
      mockScores[key].push(score);
      
      console.log('🧪 Mode test activé, score ajouté:', score, 'Scores actuels:', mockScores[key]);
      return NextResponse.json({ success: true, scoreId: `test_${Date.now()}` });
    }

    // TODO: Implémenter la vraie logique avec Prisma
    console.log('⚠️ Mode production non encore implémenté');
    return NextResponse.json({ success: true, scoreId: `mock_${Date.now()}` });
    
  } catch (error) {
    console.error('❌ Erreur dans POST /api/moderation/moderator-scores:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 