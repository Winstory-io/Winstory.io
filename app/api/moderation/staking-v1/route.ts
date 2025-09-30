import { NextRequest, NextResponse } from 'next/server';
import { 
	computeStakingDecisionV1,
	StakerInputV1,
	StakingFrameworkParamsV1
} from '@/lib/moderation-engine';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { stakers, params }: { stakers: StakerInputV1[]; params?: StakingFrameworkParamsV1 } = body || {};

		if (!Array.isArray(stakers)) {
			return NextResponse.json(
				{ error: 'Invalid payload: `stakers` array is required' },
				{ status: 400 }
			);
		}

		// Basic normalization and validation
		const normalizedStakers: StakerInputV1[] = stakers.map((s) => ({
			wallet: String(s.wallet || ''),
			stake: Number(s.stake || 0),
			stakeAgeDays: Number(s.stakeAgeDays || 0),
			xp: Number(s.xp || 0),
			vote: (s.vote === 'YES' || s.vote === 'NO' || s.vote === 'PASSIVE') ? s.vote : 'PASSIVE'
		}));

		const result = computeStakingDecisionV1(normalizedStakers, params);

		return NextResponse.json({ success: true, result });
	} catch (error) {
		console.error('staking-v1 error:', error);
		return NextResponse.json(
			{ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		success: true,
		message: 'POST stakers and optional params to compute V1 staking decision',
		example_payload: {
			stakers: [
				{ wallet: '0xAAA', stake: 1000, stakeAgeDays: 30, xp: 200, vote: 'NO' },
				{ wallet: '0xBBB', stake: 50, stakeAgeDays: 10, xp: 20, vote: 'YES' },
				{ wallet: '0xCCC', stake: 50, stakeAgeDays: 5, xp: 0, vote: 'PASSIVE' }
			],
			params: {
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
			} as StakingFrameworkParamsV1
		}
	});
} 