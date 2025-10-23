"use client";

import { useEffect, useMemo, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
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
	
	// Vérifier que mintPrice est un nombre valide
	const safeMintPrice = isNaN(mintPrice) || mintPrice <= 0 ? 100 : mintPrice; // Valeur par défaut de 100 USDC
	
	// Use the hybrid moderation engine for intrinsic validation
	const hybridResult = evaluateModeration(
		validVotes || 0, // votesYes
		refuseVotes || 0, // votesNo  
		BigInt(Math.floor((stakeYes || 0) * SCALE)), // stakeYes in WINC (scaled)
		BigInt(Math.floor((stakeNo || 0) * SCALE)), // stakeNo in WINC (scaled)
		safeMintPrice, // mintPriceUSDC
		Date.now(), // currentTimestamp
		Date.now() + 7 * 24 * 3600 * 1000, // voteWindowEnd (7 days)
		BigInt(SCALE) // wincPerUSDC (1 WINC = 1 USDC)
	);
	
	// Extract hybrid validation results
	const votesOk = (totalVotes || 0) >= MIN_REQUIRED_VOTES;
	const stakingOk = (stakedAmount || 0) > safeMintPrice; // Must be greater than MINT price
	const hybridScoreYes = Number(hybridResult.scoreYes) / SCALE;
	const hybridScoreNo = Number(hybridResult.scoreNo) / SCALE;
	
	// Fix: Hybrid ratio should only be OK if there are actual votes and a clear majority
	// If no votes or insufficient votes, ratio should be false
	const ratioOk = (totalVotes || 0) >= MIN_REQUIRED_VOTES && 
					((hybridScoreYes >= (hybridScoreNo * 2.0)) || (hybridScoreNo >= (hybridScoreYes * 2.0)));
	
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
		hybridRatio: hybridScoreYes.toFixed(2),
		hybridScoreYes: hybridScoreYes.toFixed(3),
		hybridScoreNo: hybridScoreNo.toFixed(3)
	};
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
	const stroke = 48;
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;
	
	// Ajouter un petit espacement entre les segments pour éviter les angles étranges
	const gap = total > 0 ? Math.min(8, circumference * 0.02) : 0;
	const validLen = total > 0 ? Math.max(0, (validPct / 100) * circumference - gap/2) : 0;
	const refuseLen = total > 0 ? Math.max(0, (refusePct / 100) * circumference - gap/2) : 0;

	// Calculer les positions des segments avec espacement
	const validOffset = 0;
	const refuseOffset = -(validLen + gap);

	return (
		<div style={{ width: size, height: size, position: 'relative' }}>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				<defs>
					{/* Gradients modernes */}
					<linearGradient id="validGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="#22C55E" />
						<stop offset="50%" stopColor="#16A34A" />
						<stop offset="100%" stopColor="#15803D" />
					</linearGradient>
					<linearGradient id="refuseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="#EF4444" />
						<stop offset="50%" stopColor="#DC2626" />
						<stop offset="100%" stopColor="#B91C1C" />
					</linearGradient>
					{/* Ombres et effets de glow */}
					<filter id="glow">
						<feGaussianBlur stdDeviation="3" result="coloredBlur"/>
						<feMerge> 
							<feMergeNode in="coloredBlur"/>
							<feMergeNode in="SourceGraphic"/>
						</feMerge>
					</filter>
					<filter id="shadow">
						<feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(0,0,0,0.3)"/>
					</filter>
				</defs>
				<g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
					{/* Cercle de fond avec effet moderne */}
					<circle 
						cx={size / 2} 
						cy={size / 2} 
						r={radius} 
						fill="none" 
						stroke="url(#backgroundGradient)" 
						strokeWidth={stroke}
						opacity="0.15"
					/>
					
					{/* Segment des votes validés */}
					{validLen > 0 && (
						<circle 
							cx={size / 2} 
							cy={size / 2} 
							r={radius} 
							fill="none" 
							stroke="url(#validGradient)" 
							strokeWidth={stroke} 
							strokeDasharray={`${validLen} ${circumference - validLen}`} 
							strokeDashoffset={validOffset}
							strokeLinecap="round"
							filter="url(#glow)"
							style={{
								transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
								transformOrigin: 'center'
							}}
						/>
					)}
					
					{/* Segment des votes refusés */}
					{refuseLen > 0 && (
						<circle 
							cx={size / 2} 
							cy={size / 2} 
							r={radius} 
							fill="none" 
							stroke="url(#refuseGradient)" 
							strokeWidth={stroke} 
							strokeDasharray={`${refuseLen} ${circumference - refuseLen}`} 
							strokeDashoffset={refuseOffset}
							strokeLinecap="round"
							filter="url(#glow)"
							style={{
								transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
								transformOrigin: 'center'
							}}
						/>
					)}
				</g>
				
				{/* Gradients pour le fond */}
				<defs>
					<linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="#374151" />
						<stop offset="100%" stopColor="#1F2937" />
					</linearGradient>
				</defs>
			</svg>
			
			{/* Centre du donut avec informations */}
			<div style={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				textAlign: 'center',
				pointerEvents: 'none'
			}}>
				<div style={{
					fontSize: '48px',
					fontWeight: '900',
					color: total > 0 ? (validPct > refusePct ? '#22C55E' : validPct < refusePct ? '#EF4444' : '#FFD600') : '#666',
					textShadow: '0 0 10px rgba(0,0,0,0.5)',
					marginBottom: '4px'
				}}>
					{total}
				</div>
				<div style={{
					fontSize: '14px',
					color: '#9CA3AF',
					fontWeight: '600',
					textTransform: 'uppercase',
					letterSpacing: '0.5px'
				}}>
					Total Votes
				</div>
				{total > 0 && (
					<div style={{
						fontSize: '12px',
						color: '#6B7280',
						marginTop: '8px'
					}}>
						{validPct.toFixed(0)}% / {refusePct.toFixed(0)}%
					</div>
				)}
			</div>
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

interface ActiveCampaignDashboardProps {
	externalProgressData?: any;
	campaignTitle?: string;
}

export default function ActiveCampaignDashboard({ externalProgressData, campaignTitle }: ActiveCampaignDashboardProps) {
	const account = useActiveAccount();
	const [campaign, setCampaign] = useState<CampaignLike | null>(null);

	useEffect(() => {
		console.log('=== ActiveCampaignDashboard useEffect ===');
		console.log('externalProgressData:', externalProgressData);
		console.log('campaignTitle:', campaignTitle);
		
		if (externalProgressData) {
			console.log('✅ Using external progress data');
			// Utiliser les données externes (vraies données de modération)
			setCampaign({
				id: externalProgressData.campaignId || 'unknown',
				title: campaignTitle || externalProgressData.campaignTitle || 'Campaign Title',
				type: 'INITIAL',
				creatorType: 'FOR_B2C',
				progress: {
					validVotes: externalProgressData.validVotes || 0,
					refuseVotes: externalProgressData.refuseVotes || 0,
					totalVotes: externalProgressData.totalVotes || 0,
					stakedAmount: externalProgressData.stakedAmount || 0,
					mintPrice: externalProgressData.mintPrice || 100
				}
			});
		} else {
			console.log('⚠️ No external data, using mock data');
			// Fallback vers les données mockées si pas de données externes
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
		}
	}, [externalProgressData, campaignTitle]);

	const stats = useMemo(() => {
		if (!campaign) return null;
		// Use external progress data if available, otherwise use campaign's own progress
		const progressData = externalProgressData || campaign.progress;
		const { validVotes, refuseVotes, totalVotes } = progressData;
		const computed = computeValidationState(progressData);
		const requirements: Requirement[] = [
			{ label: `Minimum ${MIN_REQUIRED_VOTES} Stakers moderations votes`, ok: computed.votesOk },
			{ label: `Pool Staking by Moderators > MINT Price $`, ok: computed.stakingOk },
			{ label: `Hybrid (Majority / Minority) ≥ 2`, ok: computed.ratioOk },
		];
		let title = 'Moderation Campaign in progress';
		if (computed.allOk) title = 'Moderators validated your Initial Campaign !';
		else if (computed.hybridResult.status === 'REJECTED') title = 'Moderators refused your Initial Campaign';
		return { requirements, title, validVotes, refuseVotes, totalVotes, computed };
	}, [campaign, externalProgressData]);

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
			<h2 style={{ color: stats?.computed.hybridResult.status === 'REJECTED' ? '#FF3B30' : '#FFD600', fontSize: 40, fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>{stats?.title}</h2>
			<p style={{ color: '#C0C0C0', textAlign: 'center', marginBottom: 20 }}>{campaign?.title || 'Campaign Title'}</p>

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

			{stats && stats.computed.hybridResult.status === 'REJECTED' && (
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