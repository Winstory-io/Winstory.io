// Moderation Engine - Système hybride 50/50 avec VictoryFactor
// Implémentation complète du système de modération Winstory

export const SCALE = 1e18; // Fixed-point arithmetic scale
export const MIN_VOTERS = 22;
export const THRESHOLD_RATIO = 2; // Majoritaire >= 2 * minoritaire

// Types de contenu et répartitions
export enum ContentType {
  INITIAL_B2C = 'INITIAL_B2C',
  INITIAL_AGENCY_B2C = 'INITIAL_AGENCY_B2C', 
  COMPLETION_PAID_B2C = 'COMPLETION_PAID_B2C',
  COMPLETION_FREE_B2C = 'COMPLETION_FREE_B2C',
  INITIAL_INDIVIDUAL = 'INITIAL_INDIVIDUAL',
  COMPLETION_INDIVIDUAL = 'COMPLETION_INDIVIDUAL'
}

// Politique de résolution automatique
export enum AutoResolvePolicy {
  ESCALATE = 'escalate',
  EXTEND_BY_HOURS = 'extend_by_hours',
  AUTO_ACCEPT = 'auto_accept',
  AUTO_REJECT = 'auto_reject'
}

// Statuts de modération
export enum ModerationStatus {
  PENDING_REQUIREMENTS = 'PENDING_REQUIREMENTS',
  EN_COURS = 'EN_COURS',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  REQUIRES_ESCALATION = 'REQUIRES_ESCALATION'
}

// Résultat de l'évaluation de modération
export interface ModerationResult {
  status: ModerationStatus;
  winner: 'YES' | 'NO' | '';
  scoreYes: bigint; // Fixed-point scaled
  scoreNo: bigint;  // Fixed-point scaled
  totalVotes: number;
  totalStake: bigint;
  reason: string;
  victoryFactor?: bigint; // Fixed-point scaled
}

// Données de participation
export interface ParticipantData {
  address: string;
  stakeWINC: bigint;
  voteChoice: 'YES' | 'NO';
}

// Résultat des paiements
export interface PayoutResult {
  payouts: Array<{
    address: string;
    payoutWINC: bigint;
    xpDelta: number;
  }>;
  penalties: Array<{
    address: string;
    lossWINC: bigint;
    xpDelta: number;
  }>;
  summary: {
    totalPaidWINC: bigint;
    totalPenaltiesWINC: bigint;
    activePoolWINC: bigint;
    passivePoolWINC: bigint;
    penaltyPoolFromMinorityWINC: bigint;
    victoryFactor: bigint;
  };
}

// Configuration des répartitions par type de contenu
export const CONTENT_TYPE_CONFIG = {
  [ContentType.INITIAL_B2C]: {
    mintPriceUSDC: 1000,
    rewardPoolPercentage: 0.51, // 510 USDC sur 1000
    winstoryPercentage: 0.49,   // 490 USDC sur 1000
    activePoolPercentage: 0.90, // 90% des rewards aux actifs
    passivePoolPercentage: 0.10 // 10% aux passifs
  },
  [ContentType.INITIAL_AGENCY_B2C]: {
    mintPriceUSDC: 1000,
    rewardPoolPercentage: 0.51,
    winstoryPercentage: 0.49,
    activePoolPercentage: 0.90,
    passivePoolPercentage: 0.10
  },
  [ContentType.COMPLETION_PAID_B2C]: {
    mintPriceUSDC: 0, // Pas de MINT pour les complétions
    rewardPoolPercentage: 0.40, // 40% aux modérateurs
    winstoryPercentage: 0.10,   // 10% à Winstory
    activePoolPercentage: 0.90,
    passivePoolPercentage: 0.10
  },
  [ContentType.COMPLETION_FREE_B2C]: {
    mintPriceUSDC: 0,
    rewardPoolPercentage: 0, // Pas de récompenses monétaires
    winstoryPercentage: 0,
    activePoolPercentage: 0,
    passivePoolPercentage: 0
  },
  [ContentType.INITIAL_INDIVIDUAL]: {
    // Utiliser la logique existante du code
    mintPriceUSDC: 0, // Calculé dynamiquement
    rewardPoolPercentage: 0,
    winstoryPercentage: 0,
    activePoolPercentage: 0,
    passivePoolPercentage: 0
  },
  [ContentType.COMPLETION_INDIVIDUAL]: {
    // Utiliser la logique existante du code
    mintPriceUSDC: 0,
    rewardPoolPercentage: 0,
    winstoryPercentage: 0,
    activePoolPercentage: 0,
    passivePoolPercentage: 0
  }
};

// Configuration XP par type de contenu
export const XP_CONFIG = {
  [ContentType.INITIAL_B2C]: { baseXP: 10, minorityFactor: 0.25, passiveFactor: 0.1 },
  [ContentType.INITIAL_AGENCY_B2C]: { baseXP: 10, minorityFactor: 0.25, passiveFactor: 0.1 },
  [ContentType.COMPLETION_PAID_B2C]: { baseXP: 20, minorityFactor: 0.25, passiveFactor: 0.1 },
  [ContentType.COMPLETION_FREE_B2C]: { baseXP: 100, minorityFactor: 0.25, passiveFactor: 0.1 },
  [ContentType.INITIAL_INDIVIDUAL]: { baseXP: 0, minorityFactor: 0.25, passiveFactor: 0.1 },
  [ContentType.COMPLETION_INDIVIDUAL]: { baseXP: 0, minorityFactor: 0.25, passiveFactor: 0.1 }
};

/**
 * Évalue une décision de modération selon le système hybride 50/50
 */
export function evaluateModeration(
  votesYes: number,
  votesNo: number,
  stakeYes: bigint,
  stakeNo: bigint,
  mintPriceUSDC: number,
  currentTimestamp: number,
  voteWindowEnd: number,
  wincPerUSDC: bigint = BigInt(SCALE) // 1 WINC = 1 USDC par défaut
): ModerationResult {
  const totalVotes = votesYes + votesNo;
  const totalStake = stakeYes + stakeNo;
  
  // Vérification des pré-conditions
  if (totalVotes < MIN_VOTERS) {
    return {
      status: ModerationStatus.PENDING_REQUIREMENTS,
      winner: '',
      scoreYes: 0n,
      scoreNo: 0n,
      totalVotes,
      totalStake,
      reason: 'MIN_22_NOT_MET'
    };
  }

  const mintPriceWINC = BigInt(Math.floor(mintPriceUSDC * Number(wincPerUSDC) / SCALE));
  if (totalStake <= mintPriceWINC) {
    return {
      status: ModerationStatus.PENDING_REQUIREMENTS,
      winner: '',
      scoreYes: 0n,
      scoreNo: 0n,
      totalVotes,
      totalStake,
      reason: 'POOL_BELOW_MINT'
    };
  }

  // Calcul des poids démocratiques (fixed-point)
  const demYes = totalVotes > 0 ? BigInt(Math.floor((votesYes * SCALE) / totalVotes)) : 0n;
  const demNo = totalVotes > 0 ? BigInt(Math.floor((votesNo * SCALE) / totalVotes)) : 0n;

  // Calcul des poids ploutocratiques (fixed-point)
  const plutoYes = totalStake > 0n ? (stakeYes * BigInt(SCALE)) / totalStake : 0n;
  const plutoNo = totalStake > 0n ? (stakeNo * BigInt(SCALE)) / totalStake : 0n;

  // Scores hybrides 50/50
  const scoreYes = (demYes + plutoYes) / 2n;
  const scoreNo = (demNo + plutoNo) / 2n;

  // Décision basée sur le seuil 2:1
  if (scoreYes >= (scoreNo * BigInt(THRESHOLD_RATIO))) {
    return {
      status: ModerationStatus.VALIDATED,
      winner: 'YES',
      scoreYes,
      scoreNo,
      totalVotes,
      totalStake,
      reason: 'VALIDATED',
      victoryFactor: calculateVictoryFactor(scoreYes, scoreNo)
    };
  } else if (scoreNo >= (scoreYes * BigInt(THRESHOLD_RATIO))) {
    return {
      status: ModerationStatus.REJECTED,
      winner: 'NO',
      scoreYes,
      scoreNo,
      totalVotes,
      totalStake,
      reason: 'REJECTED',
      victoryFactor: calculateVictoryFactor(scoreNo, scoreYes)
    };
  } else {
    return {
      status: ModerationStatus.EN_COURS,
      winner: '',
      scoreYes,
      scoreNo,
      totalVotes,
      totalStake,
      reason: 'THRESHOLD_NOT_REACHED',
      victoryFactor: calculateVictoryFactor(scoreYes, scoreNo)
    };
  }
}

/**
 * Calcule le VictoryFactor (fixed-point)
 */
function calculateVictoryFactor(scoreWinner: bigint, scoreLoser: bigint): bigint {
  if (scoreWinner === 0n) return 0n;
  return ((scoreWinner - scoreLoser) * BigInt(SCALE)) / scoreWinner;
}

/**
 * Calcule les paiements et XP selon le système hybride avec VictoryFactor
 */
export function computePayoutsAndXP(
  contentType: ContentType,
  priceUSDC: number,
  votesYes: number,
  votesNo: number,
  stakeYes: bigint,
  stakeNo: bigint,
  participantsActive: ParticipantData[],
  participantsPassive: ParticipantData[],
  wincPerUSDC: bigint = BigInt(SCALE)
): PayoutResult {
  const config = CONTENT_TYPE_CONFIG[contentType];
  const xpConfig = XP_CONFIG[contentType];
  
  // Évaluation de la modération
  const moderationResult = evaluateModeration(
    votesYes, votesNo, stakeYes, stakeNo,
    config.mintPriceUSDC, Date.now(), Date.now() + 7 * 24 * 3600 * 1000,
    wincPerUSDC
  );

  // Si pas de décision finale, pas de paiements
  if (moderationResult.status !== ModerationStatus.VALIDATED && 
      moderationResult.status !== ModerationStatus.REJECTED) {
    return {
      payouts: [],
      penalties: [],
      summary: {
        totalPaidWINC: 0n,
        totalPenaltiesWINC: 0n,
        activePoolWINC: 0n,
        passivePoolWINC: 0n,
        penaltyPoolFromMinorityWINC: 0n,
        victoryFactor: moderationResult.victoryFactor || 0n
      }
    };
  }

  const winner = moderationResult.winner;
  const victoryFactor = moderationResult.victoryFactor || 0n;

  // Calcul des pools de récompenses
  const rewardPoolUSDC = priceUSDC * config.rewardPoolPercentage;
  const activePoolUSDC = rewardPoolUSDC * config.activePoolPercentage;
  const passivePoolUSDC = rewardPoolUSDC * config.passivePoolPercentage;

  // Conversion USDC -> WINC
  const activePoolWINC = BigInt(Math.floor(activePoolUSDC * Number(wincPerUSDC) / SCALE));
  const passivePoolWINC = BigInt(Math.floor(passivePoolUSDC * Number(wincPerUSDC) / SCALE));

  // Séparation des participants par camp
  const majorityParticipants = participantsActive.filter(p => p.voteChoice === winner);
  const minorityParticipants = participantsActive.filter(p => p.voteChoice !== winner);

  const totalMajorityStake = majorityParticipants.reduce((sum, p) => sum + p.stakeWINC, 0n);
  const totalMinorityStake = minorityParticipants.reduce((sum, p) => sum + p.stakeWINC, 0n);

  // Calcul de la pénalité des minoritaires
  const penaltyPoolFromMinorityWINC = (victoryFactor * totalMinorityStake) / BigInt(SCALE);
  const totalAvailableForMajorityWINC = activePoolWINC + penaltyPoolFromMinorityWINC;

  // Calcul des paiements pour les majoritaires
  const payouts = majorityParticipants.map(participant => {
    const stakeRatio = totalMajorityStake > 0n ? 
      (participant.stakeWINC * BigInt(SCALE)) / totalMajorityStake : 0n;
    const payoutWINC = (stakeRatio * totalAvailableForMajorityWINC) / BigInt(SCALE);
    
    const xpDelta = computeXPForMajority(
      xpConfig.baseXP,
      participant.stakeWINC,
      totalMajorityStake,
      majorityParticipants.length,
      victoryFactor
    );

    return {
      address: participant.address,
      payoutWINC,
      xpDelta
    };
  });

  // Calcul des pertes pour les minoritaires
  const penalties = minorityParticipants.map(participant => {
    const lossWINC = (victoryFactor * participant.stakeWINC) / BigInt(SCALE);
    
    const xpDelta = computeXPForMinority(
      xpConfig.baseXP,
      participant.stakeWINC,
      totalMinorityStake,
      minorityParticipants.length,
      victoryFactor,
      xpConfig.minorityFactor
    );

    return {
      address: participant.address,
      lossWINC,
      xpDelta
    };
  });

  // Gestion des participants passifs
  const totalPassiveStake = participantsPassive.reduce((sum, p) => sum + p.stakeWINC, 0n);
  let finalPassivePoolWINC = passivePoolWINC;

  // Si tous ont participé, ajouter le pool passif au pool actif
  if (totalPassiveStake === 0n) {
    finalPassivePoolWINC = 0n;
    // Redistribuer aux majoritaires
    const additionalPerMajority = passivePoolWINC / BigInt(Math.max(1, majorityParticipants.length));
    payouts.forEach(payout => {
      payout.payoutWINC += additionalPerMajority;
    });
  } else {
    // Distribuer aux passifs
    participantsPassive.forEach(participant => {
      const stakeRatio = (participant.stakeWINC * BigInt(SCALE)) / totalPassiveStake;
      const payoutWINC = (stakeRatio * passivePoolWINC) / BigInt(SCALE);
      const xpDelta = computePassiveXP(xpConfig.baseXP, participant.stakeWINC, totalPassiveStake, xpConfig.passiveFactor);
      
      payouts.push({
        address: participant.address,
        payoutWINC,
        xpDelta
      });
    });
  }

  return {
    payouts,
    penalties,
    summary: {
      totalPaidWINC: payouts.reduce((sum, p) => sum + p.payoutWINC, 0n),
      totalPenaltiesWINC: penalties.reduce((sum, p) => sum + p.lossWINC, 0n),
      activePoolWINC,
      passivePoolWINC: finalPassivePoolWINC,
      penaltyPoolFromMinorityWINC,
      victoryFactor
    }
  };
}

/**
 * Calcule l'XP pour un participant majoritaire
 */
function computeXPForMajority(
  baseXP: number,
  stake: bigint,
  totalMajorityStake: bigint,
  numMajority: number,
  victoryFactor: bigint
): number {
  // Poids démocratique (1/nombre de majoritaires)
  const demWeight = BigInt(Math.floor((1 / numMajority) * SCALE));
  
  // Poids ploutocratique
  const plutoWeight = totalMajorityStake > 0n ? 
    (stake * BigInt(SCALE)) / totalMajorityStake : 0n;
  
  // Poids hybride 50/50
  const hybridWeight = (demWeight + plutoWeight) / 2n;
  
  // Multiplicateur VictoryFactor
  const victoryMultiplier = (BigInt(SCALE) + victoryFactor) / BigInt(SCALE);
  
  // XP final
  const xp = (BigInt(Math.floor(baseXP)) * hybridWeight * victoryMultiplier) / BigInt(SCALE);
  
  return Math.floor(Number(xp));
}

/**
 * Calcule l'XP pour un participant minoritaire
 */
function computeXPForMinority(
  baseXP: number,
  stake: bigint,
  totalMinorityStake: bigint,
  numMinority: number,
  victoryFactor: bigint,
  minorityFactor: number
): number {
  // Poids démocratique
  const demWeight = BigInt(Math.floor((1 / numMinority) * SCALE));
  
  // Poids ploutocratique
  const plutoWeight = totalMinorityStake > 0n ? 
    (stake * BigInt(SCALE)) / totalMinorityStake : 0n;
  
  // Poids hybride 50/50
  const hybridWeight = (demWeight + plutoWeight) / 2n;
  
  // Réduction par VictoryFactor et facteur minoritaire
  const penaltyMultiplier = (BigInt(SCALE) - victoryFactor) / BigInt(SCALE);
  const minorityMultiplier = BigInt(Math.floor(minorityFactor * SCALE));
  
  // XP final réduit
  const xp = (BigInt(Math.floor(baseXP)) * hybridWeight * penaltyMultiplier * minorityMultiplier) / (BigInt(SCALE) * BigInt(SCALE));
  
  return Math.floor(Number(xp));
}

/**
 * Calcule l'XP pour un participant passif
 */
function computePassiveXP(
  baseXP: number,
  stake: bigint,
  totalPassiveStake: bigint,
  passiveFactor: number
): number {
  const stakeRatio = totalPassiveStake > 0n ? 
    (stake * BigInt(SCALE)) / totalPassiveStake : 0n;
  
  const xp = (BigInt(Math.floor(baseXP)) * stakeRatio * BigInt(Math.floor(passiveFactor * SCALE))) / (BigInt(SCALE) * BigInt(SCALE));
  
  return Math.floor(Number(xp));
}

/**
 * Gère la clôture d'une période de vote
 */
export function handleVoteWindowClosure(
  moderationResult: ModerationResult,
  autoResolvePolicy: AutoResolvePolicy = AutoResolvePolicy.ESCALATE
): ModerationResult {
  if (moderationResult.status !== ModerationStatus.EN_COURS) {
    return moderationResult;
  }

  switch (autoResolvePolicy) {
    case AutoResolvePolicy.ESCALATE:
      return {
        ...moderationResult,
        status: ModerationStatus.REQUIRES_ESCALATION,
        reason: 'VOTE_WINDOW_CLOSED_ESCALATION_REQUIRED'
      };
    
    case AutoResolvePolicy.AUTO_ACCEPT:
      return {
        ...moderationResult,
        status: ModerationStatus.VALIDATED,
        winner: 'YES',
        reason: 'VOTE_WINDOW_CLOSED_AUTO_ACCEPTED'
      };
    
    case AutoResolvePolicy.AUTO_REJECT:
      return {
        ...moderationResult,
        status: ModerationStatus.REJECTED,
        winner: 'NO',
        reason: 'VOTE_WINDOW_CLOSED_AUTO_REJECTED'
      };
    
    case AutoResolvePolicy.EXTEND_BY_HOURS:
      // Logique d'extension - à implémenter selon les besoins
      return {
        ...moderationResult,
        reason: 'VOTE_WINDOW_EXTENDED'
      };
    
    default:
      return {
        ...moderationResult,
        status: ModerationStatus.REQUIRES_ESCALATION,
        reason: 'VOTE_WINDOW_CLOSED_ESCALATION_REQUIRED'
      };
  }
}

/**
 * Valide les données d'entrée pour éviter les erreurs
 */
export function validateModerationInputs(
  votesYes: number,
  votesNo: number,
  stakeYes: bigint,
  stakeNo: bigint,
  mintPriceUSDC: number
): { valid: boolean; error?: string } {
  if (votesYes < 0 || votesNo < 0) {
    return { valid: false, error: 'Votes cannot be negative' };
  }
  
  if (stakeYes < 0n || stakeNo < 0n) {
    return { valid: false, error: 'Stakes cannot be negative' };
  }
  
  if (mintPriceUSDC < 0) {
    return { valid: false, error: 'Mint price cannot be negative' };
  }
  
  if (votesYes + votesNo === 0) {
    return { valid: false, error: 'Total votes cannot be zero' };
  }
  
  return { valid: true };
}
