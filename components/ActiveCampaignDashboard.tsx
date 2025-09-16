"use client";

import { useEffect, useMemo, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';

export const MIN_REQUIRED_VOTES = 22;

export function computeValidationState(progress: { validVotes: number; refuseVotes: number; totalVotes: number; stakedAmount: number; mintPrice: number; }) {
	const { validVotes, refuseVotes, totalVotes, stakedAmount, mintPrice } = progress;
	const votesOk = totalVotes >= MIN_REQUIRED_VOTES;
	const stakingOk = stakedAmount >= Math.max(1, mintPrice);
	const ratioOk = refuseVotes === 0 ? validVotes >= 2 : validVotes / refuseVotes >= 2;
	const majorityValid = validVotes >= refuseVotes;
	const allOk = votesOk && stakingOk && ratioOk && majorityValid;
	return { votesOk, stakingOk, ratioOk, majorityValid, allOk };
}

interface Requirement {
	label: string;
	ok: boolean;
}

interface CampaignProgress {
	validVotes: number;
	refuseVotes: number;
	totalVotes: number;
	stakedAmount: number;
	mintPrice: number;
}

interface CampaignLike {
	id: string;
	title: string;
	type: string;
	creatorType: string;
	progress: CampaignProgress;
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

export default function ActiveCampaignDashboard() {
	const account = useActiveAccount();
	const [campaign, setCampaign] = useState<CampaignLike | null>(null);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const data = await import('../lib/mockData');
				const firstInitial = (data.mockCampaigns as any[]).find((c) => c.type === 'INITIAL');
				if (mounted) {
					setCampaign(firstInitial ? { id: firstInitial.id, title: firstInitial.title, type: firstInitial.type, creatorType: firstInitial.creatorType, progress: firstInitial.progress } : null);
				}
			} catch (e) {
				console.error(e);
			}
		})();
		return () => { mounted = false; };
	}, [account]);

	const stats = useMemo(() => {
		if (!campaign) return null;
		const { validVotes, refuseVotes, totalVotes } = campaign.progress;
		const computed = computeValidationState(campaign.progress);
		const requirements: Requirement[] = [
			{ label: `Minimum ${MIN_REQUIRED_VOTES} Stakers moderations votes`, ok: computed.votesOk },
			{ label: `Pool Staking by Moderators > MINT Price $`, ok: computed.stakingOk },
			{ label: `Majority Valide / Minority Refuse ≥ 2`, ok: computed.ratioOk },
		];
		let title = 'Moderation Campaign in progress';
		if (computed.allOk) title = 'Moderators validated your Initial Campaign !';
		else if (!computed.majorityValid && totalVotes > 0) title = 'Moderators refused your Initial Campaign';
		return { requirements, title, validVotes, refuseVotes, totalVotes, computed };
	}, [campaign]);

	if (!campaign) {
		return (
			<div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, paddingTop: 24 }}>
				<h2 style={{ color: '#FFFFFF', fontSize: 40, fontWeight: 800, textAlign: 'center' }}>No Active Campaign !</h2>
				<a href="/creation" style={{ background: 'linear-gradient(90deg, #FFD600, #8F6B00)', color: '#000', borderRadius: 12, padding: '14px 28px', fontWeight: 800, fontSize: 18, textDecoration: 'none' }}>Create Campaign</a>
			</div>
		);
	}

	return (
		<div style={{ width: '100%', maxWidth: 1200 }}>
			<h2 style={{ color: stats?.title.includes('refused') ? '#FF3B30' : '#FFD600', fontSize: 40, fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>{stats?.title}</h2>
			<p style={{ color: '#C0C0C0', textAlign: 'center', marginBottom: 20 }}>Title</p>

			<div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 24 }}>
				<div style={{ color: '#FFD600', justifySelf: 'start' }}>
					<div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Initial Moderation<br/>by {stats?.totalVotes || 0} Stakers</div>
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
					Unfortunately, your Initial content has been rejected by the Stakers moderators. It was deemed that the content did not comply with the moderation rules.
				</p>
			)}

			{stats && stats.title.includes('validated') && (
				<div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
					<a href="#" style={{ background: 'linear-gradient(90deg, #18C964, #0EA75A)', color: '#000', borderRadius: 14, padding: '12px 20px', fontWeight: 800, textDecoration: 'none' }}>Publish to Community</a>
				</div>
			)}
		</div>
	);
} 