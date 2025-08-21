/**
 * Script de test pour le système de notation par modérateur
 * Teste les API endpoints pour les scores utilisés par modérateur
 */

const BASE_URL = 'http://localhost:3000';

// Données de test
const testData = {
  campaignId: 'test_campaign_123',
  moderatorWallet: '0x1234567890123456789012345678901234567890',
  scores: [25, 67, 89]
};

async function testModeratorScoringAPI() {
  console.log('🧪 Test du système de notation par modérateur');
  console.log('================================================\n');

  try {
    // 1. Test GET initial (devrait être vide)
    console.log('1. Test GET initial (scores vides)...');
    const initialResponse = await fetch(
      `${BASE_URL}/api/moderation/moderator-scores?campaignId=${testData.campaignId}&moderatorWallet=${testData.moderatorWallet}`
    );
    
    if (initialResponse.ok) {
      const initialData = await initialResponse.json();
      console.log('✅ Réponse initiale:', initialData);
      console.log(`   Scores utilisés: ${initialData.usedScores.length === 0 ? 'Aucun (correct)' : initialData.usedScores.join(', ')}\n`);
    } else {
      console.log('❌ Erreur lors du GET initial:', initialResponse.status, '\n');
    }

    // 2. Test POST pour ajouter des scores
    console.log('2. Test POST pour ajouter des scores...');
    for (const score of testData.scores) {
      console.log(`   Ajout du score ${score}...`);
      
      const postResponse = await fetch(`${BASE_URL}/api/moderation/moderator-scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: testData.campaignId,
          moderatorWallet: testData.moderatorWallet,
          score: score,
          completionId: `completion_${score}`
        }),
      });

      if (postResponse.ok) {
        const postData = await postResponse.json();
        console.log(`   ✅ Score ${score} ajouté avec succès:`, postData.scoreId);
      } else {
        const errorData = await postResponse.json();
        console.log(`   ❌ Erreur lors de l'ajout du score ${score}:`, errorData.error);
      }
    }
    console.log('');

    // 3. Test GET après ajout des scores
    console.log('3. Test GET après ajout des scores...');
    const finalResponse = await fetch(
      `${BASE_URL}/api/moderation/moderator-scores?campaignId=${testData.campaignId}&moderatorWallet=${testData.moderatorWallet}`
    );
    
    if (finalResponse.ok) {
      const finalData = await finalResponse.json();
      console.log('✅ Scores utilisés après ajout:', finalData.usedScores);
      
      // Vérifier que tous les scores ont été ajoutés
      const expectedScores = testData.scores.sort();
      const actualScores = finalData.usedScores.sort();
      
      if (JSON.stringify(expectedScores) === JSON.stringify(actualScores)) {
        console.log('✅ Tous les scores ont été correctement enregistrés\n');
      } else {
        console.log('❌ Incohérence dans les scores enregistrés');
        console.log('   Attendu:', expectedScores);
        console.log('   Obtenu:', actualScores, '\n');
      }
    } else {
      console.log('❌ Erreur lors du GET final:', finalResponse.status, '\n');
    }

    // 4. Test de contrainte unique (tentative d'ajout d'un score déjà utilisé)
    console.log('4. Test de contrainte unique (score déjà utilisé)...');
    const duplicateScore = testData.scores[0];
    const duplicateResponse = await fetch(`${BASE_URL}/api/moderation/moderator-scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaignId: testData.campaignId,
        moderatorWallet: testData.moderatorWallet,
        score: duplicateScore,
        completionId: `completion_duplicate_${duplicateScore}`
      }),
    });

    if (duplicateResponse.status === 409) {
      const duplicateError = await duplicateResponse.json();
      console.log(`✅ Contrainte unique respectée pour le score ${duplicateScore}:`, duplicateError.error);
    } else {
      console.log(`❌ La contrainte unique n'a pas fonctionné pour le score ${duplicateScore}`);
    }
    console.log('');

    // 5. Test avec un autre modérateur (devrait être indépendant)
    console.log('5. Test avec un autre modérateur...');
    const otherModerator = '0xABCDEF1234567890123456789012345678901234';
    
    const otherModeratorResponse = await fetch(
      `${BASE_URL}/api/moderation/moderator-scores?campaignId=${testData.campaignId}&moderatorWallet=${otherModerator}`
    );
    
    if (otherModeratorResponse.ok) {
      const otherModeratorData = await otherModeratorResponse.json();
      console.log('✅ Scores pour un autre modérateur:', otherModeratorData.usedScores);
      
      if (otherModeratorData.usedScores.length === 0) {
        console.log('✅ Les scores sont bien isolés par modérateur\n');
      } else {
        console.log('❌ Les scores ne sont pas correctement isolés par modérateur\n');
      }
    }

    console.log('🎉 Tests terminés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Lancer les tests
if (typeof window === 'undefined') {
  // Environnement Node.js
  testModeratorScoringAPI();
} else {
  // Environnement navigateur
  console.log('Script de test - à lancer côté serveur');
} 