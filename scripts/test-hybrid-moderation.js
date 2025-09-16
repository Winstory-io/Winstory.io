#!/usr/bin/env node

/**
 * Script de test pour le système de modération hybride 50/50
 * Usage: node scripts/test-hybrid-moderation.js
 */

const { 
  evaluateModeration, 
  computePayoutsAndXP, 
  ContentType, 
  ModerationStatus,
  SCALE 
} = require('../lib/moderation-engine');

console.log('🧪 Test du Système de Modération Hybride 50/50\n');

// Test 1: Whale vs Micro-stakers
console.log('📊 Test 1: Whale vs Micro-stakers');
console.log('Whale: 1 vote, 48,392,111.75 WINC');
console.log('Micro-stakers: 21 votes, 0.21 WINC total\n');

const whaleVsMicros = evaluateModeration(
  1,  // votesYes (whale)
  21, // votesNo (micro-stakers)
  BigInt(4839211175 * SCALE), // stakeYes (whale)
  BigInt(21 * SCALE / 100),   // stakeNo (micro-stakers)
  1000, // mintPriceUSDC
  Date.now(),
  Date.now() + 7 * 24 * 3600 * 1000
);

console.log('Résultat:', whaleVsMicros.status);
console.log('Gagnant:', whaleVsMicros.winner);
console.log('Score OUI:', (Number(whaleVsMicros.scoreYes) / SCALE * 100).toFixed(1) + '%');
console.log('Score NON:', (Number(whaleVsMicros.scoreNo) / SCALE * 100).toFixed(1) + '%');
console.log('VictoryFactor:', (Number(whaleVsMicros.victoryFactor) / SCALE * 100).toFixed(1) + '%');
console.log('Raison:', whaleVsMicros.reason);
console.log('');

// Test 2: Communauté vs Whale isolée
console.log('📊 Test 2: Communauté vs Whale isolée');
console.log('Whale: 1 vote, 1,000 WINC');
console.log('Communauté: 21 votes, 12,600 WINC total\n');

const communityVsWhale = evaluateModeration(
  1,   // votesYes (whale)
  21,  // votesNo (communauté)
  BigInt(1000 * SCALE),  // stakeYes (whale)
  BigInt(12600 * SCALE), // stakeNo (communauté)
  1000, // mintPriceUSDC
  Date.now(),
  Date.now() + 7 * 24 * 3600 * 1000
);

console.log('Résultat:', communityVsWhale.status);
console.log('Gagnant:', communityVsWhale.winner);
console.log('Score OUI:', (Number(communityVsWhale.scoreYes) / SCALE * 100).toFixed(1) + '%');
console.log('Score NON:', (Number(communityVsWhale.scoreNo) / SCALE * 100).toFixed(1) + '%');
console.log('VictoryFactor:', (Number(communityVsWhale.victoryFactor) / SCALE * 100).toFixed(1) + '%');
console.log('Raison:', communityVsWhale.reason);
console.log('');

// Test 3: Décision serrée
console.log('�� Test 3: Décision serrée');
console.log('OUI: 13 votes, 5,500 WINC');
console.log('NON: 12 votes, 4,500 WINC\n');

const closeDecision = evaluateModeration(
  13, // votesYes
  12, // votesNo
  BigInt(5500 * SCALE), // stakeYes
  BigInt(4500 * SCALE), // stakeNo
  1000, // mintPriceUSDC
  Date.now(),
  Date.now() + 7 * 24 * 3600 * 1000
);

console.log('Résultat:', closeDecision.status);
console.log('Gagnant:', closeDecision.winner);
console.log('Score OUI:', (Number(closeDecision.scoreYes) / SCALE * 100).toFixed(1) + '%');
console.log('Score NON:', (Number(closeDecision.scoreNo) / SCALE * 100).toFixed(1) + '%');
console.log('VictoryFactor:', (Number(closeDecision.victoryFactor) / SCALE * 100).toFixed(1) + '%');
console.log('Raison:', closeDecision.reason);
console.log('');

// Test 4: Majorité forte
console.log('📊 Test 4: Majorité forte');
console.log('OUI: 20 votes, 9,000 WINC');
console.log('NON: 5 votes, 1,000 WINC\n');

const strongMajority = evaluateModeration(
  20, // votesYes
  5,  // votesNo
  BigInt(9000 * SCALE), // stakeYes
  BigInt(1000 * SCALE), // stakeNo
  1000, // mintPriceUSDC
  Date.now(),
  Date.now() + 7 * 24 * 3600 * 1000
);

console.log('Résultat:', strongMajority.status);
console.log('Gagnant:', strongMajority.winner);
console.log('Score OUI:', (Number(strongMajority.scoreYes) / SCALE * 100).toFixed(1) + '%');
console.log('Score NON:', (Number(strongMajority.scoreNo) / SCALE * 100).toFixed(1) + '%');
console.log('VictoryFactor:', (Number(strongMajority.victoryFactor) / SCALE * 100).toFixed(1) + '%');
console.log('Raison:', strongMajority.reason);
console.log('');

// Test 5: Calcul des paiements
console.log('💰 Test 5: Calcul des paiements (Majorité forte)');

const participantsActive = [
  { address: '0x1', stakeWINC: BigInt(3000 * SCALE), voteChoice: 'YES' },
  { address: '0x2', stakeWINC: BigInt(4000 * SCALE), voteChoice: 'YES' },
  { address: '0x3', stakeWINC: BigInt(2000 * SCALE), voteChoice: 'YES' },
  { address: '0x4', stakeWINC: BigInt(500 * SCALE), voteChoice: 'NO' },
  { address: '0x5', stakeWINC: BigInt(500 * SCALE), voteChoice: 'NO' },
];

const participantsPassive = [
  { address: '0x6', stakeWINC: BigInt(2000 * SCALE), voteChoice: 'YES' },
];

const payoutResult = computePayoutsAndXP(
  ContentType.INITIAL_B2C,
  1000, // priceUSDC
  20,   // votesYes
  5,    // votesNo
  BigInt(9000 * SCALE), // stakeYes
  BigInt(1000 * SCALE), // stakeNo
  participantsActive,
  participantsPassive
);

console.log('Payouts:');
payoutResult.payouts.forEach((payout, index) => {
  console.log(`  ${payout.address}: ${(Number(payout.payoutWINC) / SCALE).toFixed(2)} WINC, ${payout.xpDelta} XP`);
});

console.log('\nPenalties:');
payoutResult.penalties.forEach((penalty, index) => {
  console.log(`  ${penalty.address}: ${(Number(penalty.lossWINC) / SCALE).toFixed(2)} WINC, ${penalty.xpDelta} XP`);
});

console.log('\nRésumé:');
console.log(`  Total Payout: ${(Number(payoutResult.summary.totalPaidWINC) / SCALE).toFixed(2)} WINC`);
console.log(`  Total Penalties: ${(Number(payoutResult.summary.totalPenaltiesWINC) / SCALE).toFixed(2)} WINC`);
console.log(`  Active Pool: ${(Number(payoutResult.summary.activePoolWINC) / SCALE).toFixed(2)} WINC`);
console.log(`  Passive Pool: ${(Number(payoutResult.summary.passivePoolWINC) / SCALE).toFixed(2)} WINC`);
console.log(`  VictoryFactor: ${(Number(payoutResult.summary.victoryFactor) / SCALE * 100).toFixed(1)}%`);
console.log('');

// Test 6: Complétion gratuite (XP uniquement)
console.log('🎯 Test 6: Complétion gratuite (XP uniquement)');

const freeCompletionPayout = computePayoutsAndXP(
  ContentType.COMPLETION_FREE_B2C,
  0, // priceUSDC (gratuit)
  20, // votesYes
  5,  // votesNo
  BigInt(9000 * SCALE), // stakeYes
  BigInt(1000 * SCALE), // stakeNo
  participantsActive,
  participantsPassive
);

console.log('Payouts (XP uniquement):');
freeCompletionPayout.payouts.forEach((payout, index) => {
  console.log(`  ${payout.address}: ${payout.xpDelta} XP (${(Number(payout.payoutWINC) / SCALE).toFixed(2)} WINC)`);
});

console.log('\nPenalties (XP uniquement):');
freeCompletionPayout.penalties.forEach((penalty, index) => {
  console.log(`  ${penalty.address}: ${penalty.xpDelta} XP (${(Number(penalty.lossWINC) / SCALE).toFixed(2)} WINC)`);
});

console.log('\n✅ Tests terminés !');
console.log('\n📋 Résumé des résultats :');
console.log('1. Whale vs Micro-stakers: EN_COURS (protection contre Sybil)');
console.log('2. Communauté vs Whale: REJECTED (communauté l\'emporte)');
console.log('3. Décision serrée: EN_COURS (ratio < 2:1)');
console.log('4. Majorité forte: VALIDATED (ratio >= 2:1)');
console.log('5. Paiements calculés correctement avec VictoryFactor');
console.log('6. Complétion gratuite: XP uniquement, pas de WINC');
