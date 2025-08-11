// Analyse du calcul de la durée de campagne
// Pourquoi 10 Completions à 100$WINC l'unité = 30 jours de campagne ?

console.log("=== Analyse du calcul de la durée de campagne ===\n");

// Constantes actuelles
const ECONOMIC_CONSTANTS = {
  BASE_FEE: 1.53,
  SCALING_FACTOR: 0.115,
  RISK_ADJUSTMENT: 0.069,
};

// Fonction actuelle
function simulateCampaignCurrent(P, N, CR = N) {
  const CAMPAIGN_DURATION_DAYS = 7; // Fixé à 7 jours
  const DURATION_DISCOUNT = CAMPAIGN_DURATION_DAYS === 7 ? 0.88 : 1.0;

  const sqrtPN = Math.sqrt(P * N);
  const mintRaw = (ECONOMIC_CONSTANTS.BASE_FEE * DURATION_DISCOUNT) +
                  (P * N * ECONOMIC_CONSTANTS.SCALING_FACTOR * DURATION_DISCOUNT) +
                  (sqrtPN * ECONOMIC_CONSTANTS.RISK_ADJUSTMENT * DURATION_DISCOUNT);

  return {
    P, N, CR,
    sqrtPN: Math.round(sqrtPN * 100) / 100,
    mintRaw: Math.round(mintRaw * 100) / 100,
    durationDiscount: DURATION_DISCOUNT,
    campaignDuration: CAMPAIGN_DURATION_DAYS
  };
}

// Test du scénario : 10 Completions à 100$WINC
console.log("🧪 Scénario: P=100, N=10, CR=10");
const result = simulateCampaignCurrent(100, 10, 10);
console.log("Résultat:", result);

console.log("\n📊 Analyse des composants du MINT:");
console.log(`- BASE_FEE × DURATION_DISCOUNT: ${ECONOMIC_CONSTANTS.BASE_FEE} × ${result.durationDiscount} = ${Math.round(ECONOMIC_CONSTANTS.BASE_FEE * result.durationDiscount * 100) / 100}`);
console.log(`- P × N × SCALING_FACTOR × DURATION_DISCOUNT: ${result.P} × ${result.N} × ${ECONOMIC_CONSTANTS.SCALING_FACTOR} × ${result.durationDiscount} = ${Math.round(result.P * result.N * ECONOMIC_CONSTANTS.SCALING_FACTOR * result.durationDiscount * 100) / 100}`);
console.log(`- sqrt(P×N) × RISK_ADJUSTMENT × DURATION_DISCOUNT: ${result.sqrtPN} × ${ECONOMIC_CONSTANTS.RISK_ADJUSTMENT} × ${result.durationDiscount} = ${Math.round(result.sqrtPN * ECONOMIC_CONSTANTS.RISK_ADJUSTMENT * result.durationDiscount * 100) / 100}`);

console.log("\n❓ Question: Où est calculée la durée de 30 jours ?");
console.log("La fonction actuelle a une durée FIXE de 7 jours.");
console.log("Il doit y avoir une autre logique ailleurs dans le code...");

// Test avec différentes valeurs
console.log("\n🧪 Tests avec différentes valeurs:");
console.log("P=1, N=5:", simulateCampaignCurrent(1, 5, 5));
console.log("P=10, N=20:", simulateCampaignCurrent(10, 20, 20));
console.log("P=50, N=100:", simulateCampaignCurrent(50, 100, 100)); 