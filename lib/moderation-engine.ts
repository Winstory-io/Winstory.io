// Moderation Engine - Système hybride 50/50 avec VictoryFactor
// Implémentation complète du système de modération Winstory

// Configuration par défaut (sera remplacée par les Dev Controls)
export const SCALE = 1e18; // Fixed-point arithmetic scale
export const MIN_VOTERS = 22;
export const THRESHOLD_RATIO = 2; // Majoritaire >= 2 * minoritaire

// Interface pour la configuration dynamique
export interface ModerationEngineConfig {
  minVoters: number;
  thresholdRatio: number;
  scale: number;
  autoResolvePolicy: 'escalate' | 'extend_by_hours' | 'auto_accept' | 'auto_reject';
  voteWindowHours: number;
  refreshIntervalMs: number;
}

// Configuration par défaut
export const DEFAULT_ENGINE_CONFIG: ModerationEngineConfig = {
  minVoters: MIN_VOTERS,
  thresholdRatio: THRESHOLD_RATIO,
  scale: SCALE,
  autoResolvePolicy: 'escalate',
  voteWindowHours: 168, // 7 jours
  refreshIntervalMs: 30000, // 30 secondes
};

// Variable globale pour la configuration actuelle
let currentEngineConfig: ModerationEngineConfig = DEFAULT_ENGINE_CONFIG;

// Fonction pour mettre à jour la configuration du moteur
export function updateEngineConfig(config: Partial<ModerationEngineConfig>) {
  currentEngineConfig = { ...currentEngineConfig, ...config };
}

// Fonction pour obtenir la configuration actuelle
export function getEngineConfig(): ModerationEngineConfig {
  return currentEngineConfig;
}

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
  
  // Vérification des pré-conditions (utilise la configuration dynamique)
  const config = getEngineConfig();
  if (totalVotes < config.minVoters) {
    return {
      status: ModerationStatus.PENDING_REQUIREMENTS,
      winner: '',
      scoreYes: 0n,
      scoreNo: 0n,
      totalVotes,
      totalStake,
      reason: `MIN_${config.minVoters}_NOT_MET`
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

  // Décision basée sur le seuil configurable
  if (scoreYes >= (scoreNo * BigInt(config.thresholdRatio))) {
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
  } else if (scoreNo >= (scoreYes * BigInt(config.thresholdRatio))) {
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

// V1 Staking & Moderation Framework Types
export interface StakerInputV1 {
  wallet: string;
  stake: number; // in base currency units (e.g., WINC), not wei
  stakeAgeDays: number;
  xp: number; // current XP_i
  vote: 'YES' | 'NO' | 'PASSIVE';
}

export interface StakingFrameworkParamsV1 {
  minStakeToVote?: number;
  stakeAgeMinDays?: number;
  threshold_stake_k?: number;
  age_max_days?: number;
  XP_scale?: number;
  alpha?: number;
  beta?: number;
  fraction_small_threshold?: number;
  stake_fraction_threshold?: number;
  enableAdaptiveDemocracy?: boolean;
  totalPoolEur?: number; // default example 510
  majorityPoolRatio?: number; // default 0.9 -> 459 on 510
}

export interface StakingFrameworkOutputV1Item {
  wallet: string;
  stake: number;
  vote: 'YES' | 'NO' | 'PASSIVE';
  eligibility: 'ACTIVE' | 'PASSIVE';
  reward_eur: number;
  xp: number;
  weights: {
    pluto_share: number;
    demo_share: number;
    combined_weight: number;
  };
}

export interface StakingFrameworkOutputV1 {
  decision: 'YES' | 'NO' | 'GREY';
  majority_pool_eur: number;
  minority_pool_eur: number;
  dominance: number; // Combined_majority / (Combined_yes + Combined_no)
  stake_yes_active_fraction: number; // active stake YES / active stake total
  params: Required<StakingFrameworkParamsV1>;
  totals: {
    activeCount: number;
    passiveCount: number;
    activeStakeTotal: number;
    passiveStakeTotal: number;
    yesCombined: number;
    noCombined: number;
    yesStakeActive: number;
    noStakeActive: number;
  };
  distribution: StakingFrameworkOutputV1Item[];
}

const DEFAULT_PARAMS_V1: Required<StakingFrameworkParamsV1> = {
  minStakeToVote: 50,
  stakeAgeMinDays: 7,
  threshold_stake_k: 50,
  age_max_days: 365,
  XP_scale: 100,
  alpha: 0.5,
  beta: 0.5,
  fraction_small_threshold: 0.30,
  stake_fraction_threshold: 0.5,
  enableAdaptiveDemocracy: true,
  totalPoolEur: 510,
  majorityPoolRatio: 0.9
};

function clamp01(x: number): number {
  if (Number.isNaN(x) || !Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function safeDiv(a: number, b: number): number {
  return b === 0 ? 0 : a / b;
}

function sum(nums: number[]): number { return nums.reduce((acc, v) => acc + v, 0); }

/**
 * Implements V1 staking & moderation framework (deployable version).
 * Returns structured JSON for front/back-end integration.
 */
export function computeStakingDecisionV1(
  stakers: StakerInputV1[],
  params?: StakingFrameworkParamsV1
): StakingFrameworkOutputV1 {
  const p = { ...DEFAULT_PARAMS_V1, ...(params || {}) };

  // 1) Eligibility (anti-sybil filter)
  const enriched = stakers.map(s => {
    const isActive = s.stake >= p.minStakeToVote && s.stakeAgeDays >= p.stakeAgeMinDays;
    return { ...s, eligibility: isActive ? 'ACTIVE' as const : 'PASSIVE' as const };
  });

  const active = enriched.filter(s => s.eligibility === 'ACTIVE');
  const passive = enriched.filter(s => s.eligibility === 'PASSIVE');

  // 2) Raw scores
  // Ploutocracy raw = stake
  const pluto_raw = active.map(s => Math.max(0, s.stake));

  // Democracy factors
  const demo_raw = active.map(s => {
    const stake_factor = safeDiv(s.stake, s.stake + p.threshold_stake_k);
    const xp_factor = 1 + Math.log1p(Math.max(0, s.xp)) / Math.log1p(p.XP_scale);
    const age_factor = clamp01(safeDiv(s.stakeAgeDays, p.age_max_days));
    return stake_factor * xp_factor * age_factor;
  });

  // 3) Normalized shares
  const sum_pluto = sum(pluto_raw);
  const sum_demo = sum(demo_raw);
  const pluto_share = active.map((_, i) => safeDiv(pluto_raw[i], sum_pluto));
  const demo_share = active.map((_, i) => safeDiv(demo_raw[i], sum_demo));

  // 4) Combined weights with optional adaptive democracy
  let alpha = p.alpha;
  let beta = p.beta;

  if (p.enableAdaptiveDemocracy) {
    const smallVoters = active.filter(s => s.stake < p.threshold_stake_k).length;
    const fraction_small = safeDiv(smallVoters, Math.max(1, active.length));
    if (fraction_small > p.fraction_small_threshold) {
      // Reduce beta proportionally to how much the threshold is exceeded (cap at 50% reduction)
      const overload = clamp01((fraction_small - p.fraction_small_threshold) / (1 - p.fraction_small_threshold));
      const reduction = 0.5 * overload;
      beta = Math.max(0, beta * (1 - reduction));
      const sum_ab = alpha + beta;
      if (sum_ab > 0) {
        alpha = alpha / sum_ab;
        beta = beta / sum_ab;
      }
    }
  }

  const combined_weight = active.map((_, i) => alpha * pluto_share[i] + beta * demo_share[i]);

  // 5) Decision (quorum mixte)
  const yesIdx = active.map((s, i) => ({ i, yes: s.vote === 'YES' }));
  const combined_yes = sum(yesIdx.map(o => o.yes ? combined_weight[o.i] : 0));
  const combined_no = sum(yesIdx.map(o => !o.yes ? combined_weight[o.i] : 0));

  const activeStakeYes = sum(active.filter(s => s.vote === 'YES').map(s => s.stake));
  const activeStakeNo = sum(active.filter(s => s.vote === 'NO').map(s => s.stake));
  const activeStakeTotal = activeStakeYes + activeStakeNo;

  const stake_yes_fraction = safeDiv(activeStakeYes, Math.max(1e-12, activeStakeTotal));
  const stake_no_fraction = safeDiv(activeStakeNo, Math.max(1e-12, activeStakeTotal));

  let decision: 'YES' | 'NO' | 'GREY' = 'GREY';
  if (combined_yes >= 2 * combined_no && stake_yes_fraction >= p.stake_fraction_threshold) {
    decision = 'YES';
  } else if (combined_no >= 2 * combined_yes && stake_no_fraction >= p.stake_fraction_threshold) {
    decision = 'NO';
  }

  // Dominance for XP (majority combined share)
  const combinedTotal = combined_yes + combined_no;
  const majoritySide = decision === 'YES' ? 'YES' : decision === 'NO' ? 'NO' : (combined_yes >= combined_no ? 'YES' : 'NO');
  const dominance = combinedTotal > 0 ? (majoritySide === 'YES' ? combined_yes : combined_no) / combinedTotal : 0.5;

  // 6) Rewards distribution
  const totalPool = p.totalPoolEur;
  const majorityPool = Math.round(totalPool * p.majorityPoolRatio);
  const minorityPool = Math.round(totalPool - majorityPool);

  // Majority = majority ACTIVE voters ∝ stake
  const majorityActive = active.filter(s => (decision === 'YES' ? s.vote === 'YES' : s.vote === 'NO'));
  const minorityActive = active.filter(s => (decision === 'YES' ? s.vote === 'NO' : s.vote === 'YES'));
  const passiveAll = passive; // PASSIVE voters share minority pool

  const minorityPoolGroup = [...minorityActive, ...passiveAll];

  const majorityStakeSum = sum(majorityActive.map(s => s.stake));
  const minorityStakeSum = sum(minorityPoolGroup.map(s => s.stake));

  const effectiveMajorityPool = (minorityStakeSum === 0) ? (majorityPool + minorityPool) : majorityPool;
  const effectiveMinorityPool = (minorityStakeSum === 0) ? 0 : minorityPool;

  // 7) XP distribution
  const XP_part = 5; // fixed per active voter
  const XP_pool_major = 50;
  const XP_pool_min = 10;

  // XP log factor per voter
  const xpLog = (xp: number) => 1 + Math.log1p(Math.max(0, xp)) / Math.log1p(p.XP_scale);

  const distribution: StakingFrameworkOutputV1Item[] = enriched.map(s => {
    // base structure
    return {
      wallet: s.wallet,
      stake: s.stake,
      vote: s.vote,
      eligibility: s.eligibility,
      reward_eur: 0,
      xp: 0,
      weights: { pluto_share: 0, demo_share: 0, combined_weight: 0 }
    };
  });

  // Attach weights for ACTIVE
  active.forEach((s, idxActive) => {
    const d = distribution.find(d => d.wallet === s.wallet)!;
    d.weights.pluto_share = pluto_share[idxActive] || 0;
    d.weights.demo_share = demo_share[idxActive] || 0;
    d.weights.combined_weight = combined_weight[idxActive] || 0;
  });

  // Rewards majority
  distribution.forEach(d => {
    if (d.eligibility === 'ACTIVE' && (decision === 'YES' ? d.vote === 'YES' : d.vote === 'NO')) {
      const share = safeDiv(d.stake, Math.max(1e-12, majorityStakeSum));
      d.reward_eur = +(effectiveMajorityPool * share).toFixed(2);
    }
  });

  // Rewards minority + passive
  distribution.forEach(d => {
    const isMinorityActive = d.eligibility === 'ACTIVE' && (decision === 'YES' ? d.vote === 'NO' : d.vote === 'YES');
    const isPassive = d.eligibility === 'PASSIVE';
    if ((isMinorityActive || isPassive) && effectiveMinorityPool > 0) {
      const share = safeDiv(d.stake, Math.max(1e-12, minorityStakeSum));
      d.reward_eur += +(effectiveMinorityPool * share).toFixed(2);
    }
  });

  // XP base for active voters only
  distribution.forEach(d => {
    if (d.eligibility === 'ACTIVE' && (d.vote === 'YES' || d.vote === 'NO')) {
      d.xp += XP_part;
    }
  });

  // XP pools weighted
  const majorityActives = distribution.filter(d => d.eligibility === 'ACTIVE' && (decision === 'YES' ? d.vote === 'YES' : d.vote === 'NO'));
  const minorityActives = distribution.filter(d => d.eligibility === 'ACTIVE' && (decision === 'YES' ? d.vote === 'NO' : d.vote === 'YES'));

  const majorityXPWeights = majorityActives.map(d => (safeDiv(d.stake, Math.max(1e-12, majorityStakeSum)) * dominance * xpLog(enriched.find(s => s.wallet === d.wallet)!.xp)));
  const minorityXPWeights = minorityActives.map(d => (safeDiv(d.stake, Math.max(1e-12, sum(minorityActives.map(x => x.stake)))) * (1 - dominance) * xpLog(enriched.find(s => s.wallet === d.wallet)!.xp)));

  const sumMajW = sum(majorityXPWeights);
  const sumMinW = sum(minorityXPWeights);

  majorityActives.forEach((d, idx) => {
    const w = majorityXPWeights[idx];
    const share = safeDiv(w, Math.max(1e-12, sumMajW));
    d.xp += Math.floor(XP_pool_major * share);
  });

  minorityActives.forEach((d, idx) => {
    const w = minorityXPWeights[idx];
    const share = safeDiv(w, Math.max(1e-12, sumMinW));
    d.xp += Math.floor(XP_pool_min * share);
  });

  return {
    decision,
    majority_pool_eur: effectiveMajorityPool,
    minority_pool_eur: effectiveMinorityPool,
    dominance: +dominance.toFixed(6),
    stake_yes_active_fraction: +stake_yes_fraction.toFixed(6),
    params: p,
    totals: {
      activeCount: active.length,
      passiveCount: passive.length,
      activeStakeTotal: +activeStakeTotal,
      passiveStakeTotal: +sum(passive.map(s => s.stake)),
      yesCombined: +combined_yes,
      noCombined: +combined_no,
      yesStakeActive: +activeStakeYes,
      noStakeActive: +activeStakeNo
    },
    distribution
  };
}
