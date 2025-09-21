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

// This is a test file that should be run with a test runner

function runModerationEngineTests() {
  console.log('Moderation Engine Tests:');

  console.log('\n--- evaluateModeration Tests ---');
  console.log('Test 1: Should return PENDING_REQUIREMENTS when total votes < 22');
  const result1 = evaluateModeration(
    10, // votesYes
    5,  // votesNo
    BigInt(1000 * SCALE),
    BigInt(500 * SCALE),
    1000, // mintPriceUSDC
    Date.now(),
    Date.now() + 7 * 24 * 3600 * 1000
  );
  console.log(`Result 1: Status: ${result1.status}, Reason: ${result1.reason}`);
  if (result1.status === ModerationStatus.PENDING_REQUIREMENTS && result1.reason === 'MIN_22_NOT_MET') {
    console.log('Test 1 PASSED');
  } else {
    console.log('Test 1 FAILED');
  }

  console.log('\nTest 2: Should return PENDING_REQUIREMENTS when total stake <= mint price');
  const result2 = evaluateModeration(
    25, // votesYes
    10, // votesNo
    BigInt(500 * SCALE), // stakeYes
    BigInt(400 * SCALE), // stakeNo
    1000, // mintPriceUSDC
    Date.now(),
    Date.now() + 7 * 24 * 3600 * 1000
  );
  console.log(`Result 2: Status: ${result2.status}, Reason: ${result2.reason}`);
  if (result2.status === ModerationStatus.PENDING_REQUIREMENTS && result2.reason === 'POOL_BELOW_MINT') {
    console.log('Test 2 PASSED');
  } else {
    console.log('Test 2 FAILED');
  }

  console.log('\nTest 3: Should return VALIDATED when YES score >= 2 * NO score');
  const result3 = evaluateModeration(
    20, // votesYes
    5,  // votesNo
    BigInt(8000 * SCALE), // stakeYes (high)
    BigInt(2000 * SCALE), // stakeNo (low)
    1000, // mintPriceUSDC
    Date.now(),
    Date.now() + 7 * 24 * 3600 * 1000
  );
  console.log(`Result 3: Status: ${result3.status}, Winner: ${result3.winner}, VictoryFactor: ${result3.victoryFactor}`);
  if (result3.status === ModerationStatus.VALIDATED && result3.winner === 'YES' && result3.victoryFactor > 0n) {
    console.log('Test 3 PASSED');
  } else {
    console.log('Test 3 FAILED');
  }

  console.log('\nTest 4: Should return REJECTED when NO score >= 2 * YES score');
  const result4 = evaluateModeration(
    5,  // votesYes
    20, // votesNo
    BigInt(2000 * SCALE), // stakeYes (low)
    BigInt(8000 * SCALE), // stakeNo (high)
    1000, // mintPriceUSDC
    Date.now(),
    Date.now() + 7 * 24 * 3600 * 1000
  );
  console.log(`Result 4: Status: ${result4.status}, Winner: ${result4.winner}, VictoryFactor: ${result4.victoryFactor}`);
  if (result4.status === ModerationStatus.REJECTED && result4.winner === 'NO' && result4.victoryFactor > 0n) {
    console.log('Test 4 PASSED');
  } else {
    console.log('Test 4 FAILED');
  }

  console.log('\nTest 5: Should return EN_COURS when ratio < 2:1');
  const result5 = evaluateModeration(
    15, // votesYes
    10, // votesNo
    BigInt(6000 * SCALE), // stakeYes
    BigInt(4000 * SCALE), // stakeNo
    1000, // mintPriceUSDC
    Date.now(),
    Date.now() + 7 * 24 * 3600 * 1000
  );
  console.log(`Result 5: Status: ${result5.status}, Winner: ${result5.winner}, Reason: ${result5.reason}`);
  if (result5.status === ModerationStatus.EN_COURS && result5.winner === '' && result5.reason === 'THRESHOLD_NOT_REACHED') {
    console.log('Test 5 PASSED');
  } else {
    console.log('Test 5 FAILED');
  }

  console.log('\nTest 6: Should handle whale vs micro-stakers scenario');
  const result6 = evaluateModeration(
    1,  // votesYes (whale)
    21, // votesNo (micro-stakers)
    BigInt(4839211175 * SCALE), // stakeYes (whale)
    BigInt(21 * SCALE / 100),   // stakeNo (micro-stakers)
    1000, // mintPriceUSDC
    Date.now(),
    Date.now() + 7 * 24 * 3600 * 1000
  );
  console.log(`Result 6: Status: ${result6.status}, Winner: ${result6.winner}, Reason: ${result6.reason}`);
  if (result6.status === ModerationStatus.EN_COURS && result6.winner === '' && result6.reason === 'THRESHOLD_NOT_REACHED') {
    console.log('Test 6 PASSED');
  } else {
    console.log('Test 6 FAILED');
  }

  console.log('\n--- computePayoutsAndXP Tests ---');
  const mockParticipantsActive: ParticipantData[] = [
    { address: '0x1', stakeWINC: BigInt(1000 * SCALE), voteChoice: 'YES' },
    { address: '0x2', stakeWINC: BigInt(2000 * SCALE), voteChoice: 'YES' },
    { address: '0x3', stakeWINC: BigInt(500 * SCALE), voteChoice: 'NO' },
  ];

  const mockParticipantsPassive: ParticipantData[] = [
    { address: '0x4', stakeWINC: BigInt(1500 * SCALE), voteChoice: 'YES' },
  ];

  console.log('\nTest 7: Should return empty payouts when no final decision');
  const result7 = computePayoutsAndXP(
    ContentType.INITIAL_B2C,
    1000, // priceUSDC
    15,   // votesYes
    10,   // votesNo
    BigInt(6000 * SCALE), // stakeYes
    BigInt(4000 * SCALE), // stakeNo
    mockParticipantsActive,
    mockParticipantsPassive
  );
  console.log(`Result 7: Payouts: ${result7.payouts.length}, Penalties: ${result7.penalties.length}, Total Paid WINC: ${result7.summary.totalPaidWINC}`);
  if (result7.payouts.length === 0 && result7.penalties.length === 0 && result7.summary.totalPaidWINC === 0n) {
    console.log('Test 7 PASSED');
  } else {
    console.log('Test 7 FAILED');
  }

  console.log('\nTest 8: Should calculate payouts for VALIDATED decision');
  const result8 = computePayoutsAndXP(
    ContentType.INITIAL_B2C,
    1000, // priceUSDC
    20,   // votesYes
    5,    // votesNo
    BigInt(8000 * SCALE), // stakeYes (high)
    BigInt(2000 * SCALE), // stakeNo (low)
    mockParticipantsActive,
    mockParticipantsPassive
  );
  console.log(`Result 8: Payouts: ${result8.payouts.length}, Penalties: ${result8.penalties.length}, Total Paid WINC: ${result8.summary.totalPaidWINC}`);
  if (result8.payouts.length > 0 && result8.penalties.length > 0 && result8.summary.totalPaidWINC > 0n && result8.summary.victoryFactor > 0n) {
    console.log('Test 8 PASSED');
  } else {
    console.log('Test 8 FAILED');
  }

  console.log('\nTest 9: Should handle completion free B2C (XP only)');
  const result9 = computePayoutsAndXP(
    ContentType.COMPLETION_FREE_B2C,
    0, // priceUSDC (free)
    20, // votesYes
    5,  // votesNo
    BigInt(8000 * SCALE), // stakeYes
    BigInt(2000 * SCALE), // stakeNo
    mockParticipantsActive,
    mockParticipantsPassive
  );
  console.log(`Result 9: Payouts: ${result9.payouts.length}, Penalties: ${result9.penalties.length}, Total Paid WINC: ${result9.summary.totalPaidWINC}`);
  if (result9.payouts.every(p => p.payoutWINC === 0n) && result9.payouts.every(p => p.xpDelta > 0) && result9.summary.totalPaidWINC === 0n) {
    console.log('Test 9 PASSED');
  } else {
    console.log('Test 9 FAILED');
  }

  console.log('\nTest 10: Should redistribute passive pool to active when all participated');
  const result10 = computePayoutsAndXP(
    ContentType.INITIAL_B2C,
    1000, // priceUSDC
    20,   // votesYes
    5,    // votesNo
    BigInt(8000 * SCALE), // stakeYes
    BigInt(2000 * SCALE), // stakeNo
    mockParticipantsActive,
    [] // No passive participants
  );
  console.log(`Result 10: Payouts: ${result10.payouts.length}, Passive Pool WINC: ${result10.summary.passivePoolWINC}`);
  if (result10.payouts.length > 0 && result10.summary.passivePoolWINC === 0n) {
    console.log('Test 10 PASSED');
  } else {
    console.log('Test 10 FAILED');
  }

  console.log('\n--- VictoryFactor calculations ---');
  console.log('\nTest 11: Should calculate correct VictoryFactor for strong majority');
  const result11 = evaluateModeration(
    20, // votesYes
    5,  // votesNo
    BigInt(9000 * SCALE), // stakeYes (very high)
    BigInt(1000 * SCALE), // stakeNo (low)
    1000, // mintPriceUSDC
    Date.now(),
    Date.now() + 7 * 24 * 3600 * 1000
  );
  console.log(`Result 11: VictoryFactor: ${result11.victoryFactor}`);
  if (result11.victoryFactor > 0n && Number(result11.victoryFactor) / SCALE > 0.5) {
    console.log('Test 11 PASSED');
  } else {
    console.log('Test 11 FAILED');
  }

  console.log('\nTest 12: Should calculate low VictoryFactor for close decision');
  const result12 = evaluateModeration(
    13, // votesYes
    12, // votesNo
    BigInt(5500 * SCALE), // stakeYes
    BigInt(4500 * SCALE), // stakeNo
    1000, // mintPriceUSDC
    Date.now(),
    Date.now() + 7 * 24 * 3600 * 1000
  );
  console.log(`Result 12: VictoryFactor: ${result12.victoryFactor}`);
  if (result12.victoryFactor > 0n && Number(result12.victoryFactor) / SCALE < 0.3) {
    console.log('Test 12 PASSED');
  } else {
    console.log('Test 12 FAILED');
  }

  console.log('\n--- Edge cases ---');
  console.log('\nTest 13: Should handle zero stakes gracefully');
  const result13 = evaluateModeration(
    25, // votesYes
    10, // votesNo
    BigInt(0), // stakeYes
    BigInt(0), // stakeNo
    1000, // mintPriceUSDC
    Date.now(),
    Date.now() + 7 * 24 * 3600 * 1000
  );
  console.log(`Result 13: Status: ${result13.status}, Reason: ${result13.reason}`);
  if (result13.status === ModerationStatus.PENDING_REQUIREMENTS && result13.reason === 'POOL_BELOW_MINT') {
    console.log('Test 13 PASSED');
  } else {
    console.log('Test 13 FAILED');
  }

  console.log('\nTest 14: Should handle equal scores');
  const result14 = evaluateModeration(
    15, // votesYes
    15, // votesNo
    BigInt(5000 * SCALE), // stakeYes
    BigInt(5000 * SCALE), // stakeNo
    1000, // mintPriceUSDC
    Date.now(),
    Date.now() + 7 * 24 * 3600 * 1000
  );
  console.log(`Result 14: Status: ${result14.status}, VictoryFactor: ${result14.victoryFactor}`);
  if (result14.status === ModerationStatus.EN_COURS && result14.victoryFactor === 0n) {
    console.log('Test 14 PASSED');
  } else {
    console.log('Test 14 FAILED');
  }

  console.log('\nTest 15: Should handle 22-0 scenario');
  const result15 = evaluateModeration(
    0,  // votesYes (all NO)
    22, // votesNo (all NO)
    BigInt(1000 * SCALE), // stakeYes (minimum)
    BigInt(1000 * SCALE), // stakeNo (minimum)
    1000, // mintPriceUSDC
    Date.now(),
    Date.now() + 7 * 24 * 3600 * 1000
  );
  console.log(`Result 15: Status: ${result15.status}, Reason: ${result15.reason}`);
  if (result15.status === ModerationStatus.PENDING_REQUIREMENTS && result15.reason === 'MIN_22_NOT_MET') {
    console.log('Test 15 PASSED');
  } else {
    console.log('Test 15 FAILED');
  }
}

runModerationEngineTests();
