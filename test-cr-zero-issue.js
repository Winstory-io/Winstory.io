// Test du problème CR=0 (0 complétions) - Platform et Moderators = 0
console.log("=== Test du problème CR=0 ===\n");

// Simulation de la fonction simulateCampaign avec CR=0
function simulateCampaign(P, N, CR = N) {
  const ECONOMIC_CONSTANTS = {
    BASE_FEE: 1.53,
    SCALING_FACTOR: 0.115,
    RISK_ADJUSTMENT: 0.069,
  };

  const sqrtPN = Math.sqrt(P * N);
  const mint = ECONOMIC_CONSTANTS.BASE_FEE + 
               (P * N * ECONOMIC_CONSTANTS.SCALING_FACTOR) + 
               (sqrtPN * ECONOMIC_CONSTANTS.RISK_ADJUSTMENT);

  const totalValue = (P * CR) + mint; // Si CR=0, totalValue = mint
  const isMinimumCompletionsReached = CR >= 5;

  console.log("🔍 Debug CR=0:");
  console.log("- P (Unit Value):", P);
  console.log("- N (Max Completions):", N);
  console.log("- CR (Completions):", CR);
  console.log("- MINT:", mint);
  console.log("- totalValue:", totalValue);
  console.log("- isMinimumCompletionsReached:", isMinimumCompletionsReached);

  let top1, top2, top3, platform, moderators, creatorGain, creatorNetGain;
  let isRefundTop1, isRefundTop2, isRefundTop3;

  if (!isMinimumCompletionsReached) {
    // Sous 5 complétions : logique de remboursement avec redistribution du MINT
    isRefundTop1 = true;
    isRefundTop2 = true;
    isRefundTop3 = true;
    
    creatorGain = 0;
    creatorNetGain = -mint;
    
    // PROBLÈME IDENTIFIÉ : Quand CR=0, P*CR=0, donc top3Deficit = 3*P
    const totalRefunds = 3 * P; // 3 × P
    const mintToRedistribute = mint; // Le MINT initial à redistribuer
    
    console.log("- totalRefunds (3×P):", totalRefunds);
    console.log("- mintToRedistribute:", mintToRedistribute);
    
    // Répartition du MINT initial
    const platformFromMint = Math.round(mintToRedistribute * 0.10 * 100) / 100; // 10% du MINT
    const moderatorsFromMint = Math.round(mintToRedistribute * 0.20 * 100) / 100; // 20% du MINT
    const remainingForTop3 = Math.round(mintToRedistribute * 0.70 * 100) / 100; // 70% du MINT pour Top3
    
    console.log("- platformFromMint (10%):", platformFromMint);
    console.log("- moderatorsFromMint (20%):", moderatorsFromMint);
    console.log("- remainingForTop3 (70%):", remainingForTop3);
    
    // Ajuster les gains Top3 avec le surplus du MINT
    const top3Needs = totalRefunds; // 3 × P
    const top3FromPool = (P * CR); // Valeur des complétions actuelles = 0 si CR=0
    const top3Deficit = Math.max(0, top3Needs - top3FromPool);
    
    console.log("- top3Needs:", top3Needs);
    console.log("- top3FromPool (P×CR):", top3FromPool);
    console.log("- top3Deficit:", top3Deficit);
    
    if (top3Deficit > 0) {
      // Utiliser le MINT restant pour combler le déficit Top3
      const top3Bonus = Math.min(remainingForTop3, top3Deficit);
      const top3BonusPerWinner = Math.round(top3Bonus / 3 * 100) / 100;
      
      console.log("- top3Bonus:", top3Bonus);
      console.log("- top3BonusPerWinner:", top3BonusPerWinner);
      
      top1 = P + top3BonusPerWinner;
      top2 = P + top3BonusPerWinner;
      top3 = P + top3BonusPerWinner;
      
      // Ajuster platform et moderators avec le reste
      const remainingMint = mintToRedistribute - top3Bonus;
      platform = platformFromMint + Math.round(remainingMint * 0.375 * 100) / 100;
      moderators = moderatorsFromMint + Math.round(remainingMint * 0.625 * 100) / 100;
      
      console.log("- remainingMint:", remainingMint);
      console.log("- platform final:", platform);
      console.log("- moderators final:", moderators);
    } else {
      // Pas de déficit, Top3 peut être remboursé entièrement
      top1 = P;
      top2 = P;
      top3 = P;
      platform = platformFromMint;
      moderators = moderatorsFromMint;
      
      console.log("- Pas de déficit, platform:", platform, "moderators:", moderators);
    }
  } else {
    // 5+ complétions : logique normale
    console.log("- Logique normale 5+ complétions");
    // ... logique normale
  }

  return {
    mint: Math.round(mint * 100) / 100,
    poolTotal: Math.round(totalValue * 100) / 100,
    creatorGain: Math.round(creatorGain * 100) / 100,
    creatorNetGain: Math.round(creatorNetGain * 100) / 100,
    top1: Math.round(top1 * 100) / 100,
    top2: Math.round(top2 * 100) / 100,
    top3: Math.round(top3 * 100) / 100,
    platform: Math.round(platform * 100) / 100,
    moderators: Math.round(moderators * 100) / 100,
    isMinimumCompletionsReached,
    isRefundTop1,
    isRefundTop2,
    isRefundTop3,
    unitPrice: P
  };
}

// Test du cas problématique
console.log("🧪 Test CR=0: P=10, N=10, CR=0");
const test1 = simulateCampaign(10, 10, 0);
console.log("\n📊 Résultat final:", test1);

console.log("\n🔍 Analyse du problème:");
console.log("- Quand CR=0, P×CR=0");
console.log("- top3Deficit = 3×P - 0 = 3×P");
console.log("- remainingForTop3 = 70% du MINT");
console.log("- Si 70% du MINT < 3×P, tout le MINT va aux Top3");
console.log("- Platform et Moderators reçoivent 0");

console.log("\n💡 Solution proposée:");
console.log("- Garantir un minimum absolu pour Platform et Moderators");
console.log("- Même avec 0 complétions, ils doivent recevoir leur part du MINT");
console.log("- Redistribuer le surplus Top3 seulement si nécessaire"); 