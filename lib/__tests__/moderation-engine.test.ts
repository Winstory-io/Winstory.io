import { 
  evaluateModeration, 
  computePayoutsAndXP, 
  ContentType, 
  ModerationStatus,
  ParticipantData,
  SCALE,
  MIN_VOTERS,
  THRESHOLD_RATIO
} from '../moderation-engine';

describe('Moderation Engine - Hybrid 50/50 System', () => {
  describe('evaluateModeration', () => {
    it('should return PENDING_REQUIREMENTS when total votes < 22', () => {
      const result = evaluateModeration(
        10, // votesYes
        5,  // votesNo
        BigInt(1000 * SCALE),
        BigInt(500 * SCALE),
        1000, // mintPriceUSDC
        Date.now(),
        Date.now() + 7 * 24 * 3600 * 1000
      );

      expect(result.status).toBe(ModerationStatus.PENDING_REQUIREMENTS);
      expect(result.reason).toBe('MIN_22_NOT_MET');
    });

    it('should return PENDING_REQUIREMENTS when total stake <= mint price', () => {
      const result = evaluateModeration(
        25, // votesYes
        10, // votesNo
        BigInt(500 * SCALE), // stakeYes
        BigInt(400 * SCALE), // stakeNo
        1000, // mintPriceUSDC
        Date.now(),
        Date.now() + 7 * 24 * 3600 * 1000
      );

      expect(result.status).toBe(ModerationStatus.PENDING_REQUIREMENTS);
      expect(result.reason).toBe('POOL_BELOW_MINT');
    });

    it('should return VALIDATED when YES score >= 2 * NO score', () => {
      const result = evaluateModeration(
        20, // votesYes
        5,  // votesNo
        BigInt(8000 * SCALE), // stakeYes (high)
        BigInt(2000 * SCALE), // stakeNo (low)
        1000, // mintPriceUSDC
        Date.now(),
        Date.now() + 7 * 24 * 3600 * 1000
      );

      expect(result.status).toBe(ModerationStatus.VALIDATED);
      expect(result.winner).toBe('YES');
      expect(result.victoryFactor).toBeGreaterThan(0n);
    });

    it('should return REJECTED when NO score >= 2 * YES score', () => {
      const result = evaluateModeration(
        5,  // votesYes
        20, // votesNo
        BigInt(2000 * SCALE), // stakeYes (low)
        BigInt(8000 * SCALE), // stakeNo (high)
        1000, // mintPriceUSDC
        Date.now(),
        Date.now() + 7 * 24 * 3600 * 1000
      );

      expect(result.status).toBe(ModerationStatus.REJECTED);
      expect(result.winner).toBe('NO');
      expect(result.victoryFactor).toBeGreaterThan(0n);
    });

    it('should return EN_COURS when ratio < 2:1', () => {
      const result = evaluateModeration(
        15, // votesYes
        10, // votesNo
        BigInt(6000 * SCALE), // stakeYes
        BigInt(4000 * SCALE), // stakeNo
        1000, // mintPriceUSDC
        Date.now(),
        Date.now() + 7 * 24 * 3600 * 1000
      );

      expect(result.status).toBe(ModerationStatus.EN_COURS);
      expect(result.winner).toBe('');
      expect(result.reason).toBe('THRESHOLD_NOT_REACHED');
    });

    it('should handle whale vs micro-stakers scenario', () => {
      // Whale: 1 vote, 48M WINC
      // Micro-stakers: 21 votes, 0.21 WINC total
      const result = evaluateModeration(
        1,  // votesYes (whale)
        21, // votesNo (micro-stakers)
        BigInt(4839211175 * SCALE), // stakeYes (whale)
        BigInt(21 * SCALE / 100),   // stakeNo (micro-stakers)
        1000, // mintPriceUSDC
        Date.now(),
        Date.now() + 7 * 24 * 3600 * 1000
      );

      // Should be EN_COURS because the democratic weight of micro-stakers
      // balances the plutocratic weight of the whale
      expect(result.status).toBe(ModerationStatus.EN_COURS);
    });
  });

  describe('computePayoutsAndXP', () => {
    const mockParticipantsActive: ParticipantData[] = [
      { address: '0x1', stakeWINC: BigInt(1000 * SCALE), voteChoice: 'YES' },
      { address: '0x2', stakeWINC: BigInt(2000 * SCALE), voteChoice: 'YES' },
      { address: '0x3', stakeWINC: BigInt(500 * SCALE), voteChoice: 'NO' },
    ];

    const mockParticipantsPassive: ParticipantData[] = [
      { address: '0x4', stakeWINC: BigInt(1500 * SCALE), voteChoice: 'YES' },
    ];

    it('should return empty payouts when no final decision', () => {
      const result = computePayoutsAndXP(
        ContentType.INITIAL_B2C,
        1000, // priceUSDC
        15,   // votesYes
        10,   // votesNo
        BigInt(6000 * SCALE), // stakeYes
        BigInt(4000 * SCALE), // stakeNo
        mockParticipantsActive,
        mockParticipantsPassive
      );

      expect(result.payouts).toHaveLength(0);
      expect(result.penalties).toHaveLength(0);
      expect(result.summary.totalPaidWINC).toBe(0n);
    });

    it('should calculate payouts for VALIDATED decision', () => {
      const result = computePayoutsAndXP(
        ContentType.INITIAL_B2C,
        1000, // priceUSDC
        20,   // votesYes
        5,    // votesNo
        BigInt(8000 * SCALE), // stakeYes (high)
        BigInt(2000 * SCALE), // stakeNo (low)
        mockParticipantsActive,
        mockParticipantsPassive
      );

      expect(result.payouts.length).toBeGreaterThan(0);
      expect(result.penalties.length).toBeGreaterThan(0);
      expect(result.summary.totalPaidWINC).toBeGreaterThan(0n);
      expect(result.summary.victoryFactor).toBeGreaterThan(0n);
    });

    it('should handle completion free B2C (XP only)', () => {
      const result = computePayoutsAndXP(
        ContentType.COMPLETION_FREE_B2C,
        0, // priceUSDC (free)
        20, // votesYes
        5,  // votesNo
        BigInt(8000 * SCALE), // stakeYes
        BigInt(2000 * SCALE), // stakeNo
        mockParticipantsActive,
        mockParticipantsPassive
      );

      // Should have XP changes but no monetary payouts
      expect(result.payouts.every(p => p.payoutWINC === 0n)).toBe(true);
      expect(result.payouts.every(p => p.xpDelta > 0)).toBe(true);
    });

    it('should redistribute passive pool to active when all participated', () => {
      const result = computePayoutsAndXP(
        ContentType.INITIAL_B2C,
        1000, // priceUSDC
        20,   // votesYes
        5,    // votesNo
        BigInt(8000 * SCALE), // stakeYes
        BigInt(2000 * SCALE), // stakeNo
        mockParticipantsActive,
        [] // No passive participants
      );

      // All participants should get additional payout from passive pool
      expect(result.payouts.length).toBeGreaterThan(0);
      expect(result.summary.passivePoolWINC).toBe(0n);
    });
  });

  describe('VictoryFactor calculations', () => {
    it('should calculate correct VictoryFactor for strong majority', () => {
      const result = evaluateModeration(
        20, // votesYes
        5,  // votesNo
        BigInt(9000 * SCALE), // stakeYes (very high)
        BigInt(1000 * SCALE), // stakeNo (low)
        1000, // mintPriceUSDC
        Date.now(),
        Date.now() + 7 * 24 * 3600 * 1000
      );

      expect(result.victoryFactor).toBeGreaterThan(0n);
      // VictoryFactor should be high for strong majority
      expect(Number(result.victoryFactor) / SCALE).toBeGreaterThan(0.5);
    });

    it('should calculate low VictoryFactor for close decision', () => {
      const result = evaluateModeration(
        13, // votesYes
        12, // votesNo
        BigInt(5500 * SCALE), // stakeYes
        BigInt(4500 * SCALE), // stakeNo
        1000, // mintPriceUSDC
        Date.now(),
        Date.now() + 7 * 24 * 3600 * 1000
      );

      expect(result.victoryFactor).toBeGreaterThan(0n);
      // VictoryFactor should be low for close decision
      expect(Number(result.victoryFactor) / SCALE).toBeLessThan(0.3);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero stakes gracefully', () => {
      const result = evaluateModeration(
        25, // votesYes
        10, // votesNo
        BigInt(0), // stakeYes
        BigInt(0), // stakeNo
        1000, // mintPriceUSDC
        Date.now(),
        Date.now() + 7 * 24 * 3600 * 1000
      );

      expect(result.status).toBe(ModerationStatus.PENDING_REQUIREMENTS);
      expect(result.reason).toBe('POOL_BELOW_MINT');
    });

    it('should handle equal scores', () => {
      const result = evaluateModeration(
        15, // votesYes
        15, // votesNo
        BigInt(5000 * SCALE), // stakeYes
        BigInt(5000 * SCALE), // stakeNo
        1000, // mintPriceUSDC
        Date.now(),
        Date.now() + 7 * 24 * 3600 * 1000
      );

      expect(result.status).toBe(ModerationStatus.EN_COURS);
      expect(result.victoryFactor).toBe(0n);
    });
  });
});
