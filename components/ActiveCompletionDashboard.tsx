"use client";

import { useEffect, useMemo, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useRouter } from 'next/navigation';
import { evaluateModeration, ModerationStatus } from '@/lib/moderation-engine';

export const MIN_REQUIRED_VOTES = 22;
const SCALE = 1000000000000000000; // 1e18 for WINC precision

export function computeValidationState(progress: { 
	validVotes: number; 
	refuseVotes: number; 
	totalVotes: number; 
	stakedAmount: number; 
	mintPrice: number;
	stakeYes?: number;
	stakeNo?: number;
}) {
	const { validVotes, refuseVotes, totalVotes, stakedAmount, mintPrice, stakeYes = 0, stakeNo = 0 } = progress;
	
	// Use the hybrid moderation engine for intrinsic validation
	const hybridResult = evaluateModeration(
		validVotes, // votesYes
		refuseVotes, // votesNo  
		BigInt(Math.floor(stakeYes * SCALE)), // stakeYes in WINC (scaled)
		BigInt(Math.floor(stakeNo * SCALE)), // stakeNo in WINC (scaled)
		mintPrice, // mintPriceUSDC
		Date.now(), // currentTimestamp
		Date.now() + 7 * 24 * 3600 * 1000, // voteWindowEnd (7 days)
		BigInt(SCALE) // wincPerUSDC (1 WINC = 1 USDC)
	);
	
	// Extract hybrid validation results
	const votesOk = totalVotes >= MIN_REQUIRED_VOTES;
	const stakingOk = stakedAmount > mintPrice; // Must be greater than MINT price
	const hybridScoreYes = Number(hybridResult.scoreYes) / SCALE;
	const hybridScoreNo = Number(hybridResult.scoreNo) / SCALE;
	// Fix: Use same logic as moderation engine
	const ratioOk = (hybridScoreYes >= (hybridScoreNo * 2.0)) || (hybridScoreNo >= (hybridScoreYes * 2.0));
	const majorityValid = hybridResult.status === ModerationStatus.VALIDATED || 
						  (hybridResult.status === ModerationStatus.PENDING_REQUIREMENTS && hybridScoreYes > hybridScoreNo);
	
	const allOk = hybridResult.status === ModerationStatus.VALIDATED;
	
	return { 
		votesOk, 
		stakingOk, 
		ratioOk, 
		majorityValid, 
		allOk,
		hybridResult,
		hybridRatio: hybridScoreNo > 0 ? (hybridScoreYes / hybridScoreNo).toFixed(2) : "∞",
		hybridScoreYes: hybridScoreYes.toFixed(3),
		hybridScoreNo: hybridScoreNo.toFixed(3)
	};
}

interface Requirement {
	label: string;
	ok: boolean;
}

interface CompletionProgress {
	validVotes: number;
	refuseVotes: number;
	totalVotes: number;
	stakedAmount: number;
	mintPrice: number;
}

interface CompletionLike {
	id: string;
	campaignTitle: string;
	completionTitle: string;
	status: 'in_moderation' | 'validated' | 'refused' | null;
	progress?: CompletionProgress;
}

function DonutChart({ valid, refuse }: { valid: number; refuse: number }) {
	const total = Math.max(valid + refuse, 0);
	const validPct = total > 0 ? (valid / total) * 100 : 0;
	const refusePct = total > 0 ? (refuse / total) * 100 : 0;

	const size = 380;
	const stroke = 44;
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;
	const validLen = (validPct / 100) * circumference;
	const refuseLen = (refusePct / 100) * circumference;

	return (
		<div style={{ width: size, height: size, position: 'relative' }}>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				<g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
					<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#222" strokeWidth={stroke} />
					<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#18C964" strokeWidth={stroke} strokeDasharray={`${validLen} ${circumference - validLen}`} strokeLinecap="butt" />
					<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#FF3B30" strokeWidth={stroke} strokeDasharray={`${refuseLen} ${circumference - refuseLen}`} strokeDashoffset={-validLen} strokeLinecap="butt" />
				</g>
			</svg>
		</div>
	);
}

function RequirementItem({ label, ok }: Requirement) {
	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
			<div style={{ width: 22, height: 22, borderRadius: 999, background: ok ? '#18C964' : '#444', border: `2px solid ${ok ? '#18C964' : '#FF3B30'}` }} />
			<span style={{ color: ok ? '#18C964' : '#FFD600', fontSize: 18 }}>{label}</span>
		</div>
	);
}

export default function ActiveCompletionDashboard() {
	const account = useActiveAccount();
	const router = useRouter();
	const [completion, setCompletion] = useState<CompletionLike | null>(null);

	useEffect(() => {
		if (account) {
			// TODO: Fetch actual user completion data from API/blockchain
			// For now, simulate different states based on mock data
			// This will be replaced with real data fetching
			setCompletion(null); // Default: no active completion
		}
	}, [account]);

	const stats = useMemo(() => {
		if (!completion || !completion.progress) return null;
		const { validVotes, refuseVotes, totalVotes } = completion.progress;
		const computed = computeValidationState(completion.progress);
		const requirements: Requirement[] = [
			{ label: `Minimum ${MIN_REQUIRED_VOTES} Stakers moderations votes`, ok: computed.votesOk },
			{ label: `Pool Staking by Moderators > Completion Price $`, ok: computed.stakingOk },
			{ label: `Hybrid (Majority / Minority) ≥ 2`, ok: computed.ratioOk },
		];
		let title = 'Moderation Completion in progress';
		if (computed.allOk) title = 'Moderators validated and scored your Completion !';
		else if (!computed.majorityValid && totalVotes > 0) title = 'Moderators refused your Completion';
		return { requirements, title, validVotes, refuseVotes, totalVotes, computed };
	}, [completion]);

	const handleGoToOpenCampaigns = () => {
		router.push('/completion');
	};

	// No active completion
	if (!completion) {
		return (
			<div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, paddingTop: 80 }}>
				<h2 style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 800, textAlign: 'center', margin: 0 }}>No completion in progress.</h2>
				<p style={{ color: '#C0C0C0', fontSize: 20, textAlign: 'center', margin: 0 }}>Activate your creativity !</p>
				<button 
					onClick={handleGoToOpenCampaigns}
					style={{ 
						background: 'linear-gradient(90deg, #FFD600, #8F6B00)', 
						color: '#000', 
						borderRadius: 12, 
						padding: '16px 32px', 
						fontWeight: 800, 
						fontSize: 18, 
						border: 'none',
						cursor: 'pointer',
						textDecoration: 'none',
						transition: 'transform 0.2s ease'
					}}
					onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
					onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
				>
					Go to Open Campaigns
				</button>
			</div>
		);
	}

	// Completion in moderation
	return (
		<div style={{ width: '100%', maxWidth: 1200 }}>
			<h2 style={{ color: stats?.title.includes('refused') ? '#FF3B30' : '#FFD600', fontSize: 40, fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>{stats?.title}</h2>
			
			<div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 24 }}>
				<div style={{ color: '#FFD600', justifySelf: 'start' }}>
					<div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Initial Moderation<br/>by {stats?.totalVotes || 0} Staker</div>
					<div style={{ color: '#18C964', fontSize: 18, fontWeight: 700 }}>{stats?.validVotes || 0} Validated</div>
					<div style={{ color: '#FF3B30', fontSize: 18, fontWeight: 700, marginTop: 6 }}>{stats?.refuseVotes || 0} Refused</div>
				</div>

				<DonutChart valid={stats?.validVotes || 0} refuse={stats?.refuseVotes || 0} />

				<div style={{ justifySelf: 'end' }}>
					<div style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 800, marginBottom: 12 }}>3 Requirements for Completion availability</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
						{stats?.requirements.map((r) => (<RequirementItem key={r.label} label={r.label} ok={r.ok} />))}
					</div>
				</div>
			</div>

			{stats && stats.title.includes('refused') && (
				<p style={{ marginTop: 20, textAlign: 'center', color: '#FF3B30', fontSize: 16 }}>
					Unfortunately, your completion has been rejected by the Stakers moderators. It was deemed that the content did not comply with the moderation rules.
				</p>
			)}
		</div>
	);
} 