"use client";

import { useEffect, useMemo, useState } from 'react';
import DevControls from '@/components/DevControls';
import { TextModal, VideoModal } from '@/components/CampaignModals';

type TabKey = 'mint' | 'roi' | 'rewards';

interface CompletionPoint { x: number; y: number }

// Mock campaign data - in real app this would come from props or API
const mockCampaignData = {
  title: "My Amazing Campaign",
  startingStory: "Once upon a time, in a digital world far away, there was a creator who wanted to tell their story through the power of community and blockchain technology. This is the beginning of an epic journey that will be completed by the community...",
  videoUrl: "/test-vertical.mp4", // Using existing test video
  topCompletions: [
    { rank: 1, address: "0x567EP...2SK9U9EP", score: 96.50 },
    { rank: 2, address: "0xF4U3L...G7X5CH3J", score: 93 },
    { rank: 3, address: "0xQJ8A7...1K5N3FB8", score: 89 }
  ]
};

function formatCountdown(msRemaining: number) {
	if (msRemaining <= 0) return '00h 00m 00s';
	const totalSeconds = Math.floor(msRemaining / 1000);
	const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
	const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
	const seconds = String(totalSeconds % 60).padStart(2, '0');
	return `${hours}h ${minutes}m ${seconds}s`;
}

// Smooth cubic bezier path for line chart
function buildSmoothPath(points: CompletionPoint[], width: number, height: number, padding: {left:number;right:number;top:number;bottom:number}, maxX: number, maxY: number) {
	const innerW = width - padding.left - padding.right;
	const innerH = height - padding.top - padding.bottom;
	const toX = (x: number) => padding.left + (Math.min(x, maxX) / maxX) * innerW;
	const toY = (y: number) => padding.top + innerH - (Math.min(y, maxY) / maxY) * innerH;
	if (points.length === 0) return '';
	let d = `M ${toX(points[0].x)} ${toY(points[0].y)}`;
	for (let i = 1; i < points.length; i++) {
		const p0 = points[i - 1];
		const p1 = points[i];
		const cx = (toX(p0.x) + toX(p1.x)) / 2;
		d += ` C ${cx} ${toY(p0.y)}, ${cx} ${toY(p1.y)}, ${toX(p1.x)} ${toY(p1.y)}`;
	}
	return d;
}

function ModernLineChart({ points, maxY, maxX, showDeficit = false, deficitThreshold = 0, currentPoint, yAxisLabel, isROI = false }: { 
  points: CompletionPoint[]; 
  maxY: number; 
  maxX: number; 
  showDeficit?: boolean;
  deficitThreshold?: number;
  currentPoint?: CompletionPoint;
  yAxisLabel: string;
  isROI?: boolean;
}) {
	const width = 820;
	const height = 240;
	const padding = { left: 60, right: 16, top: 10, bottom: 28 }; // Increased left padding for Y-axis labels
	const innerW = width - padding.left - padding.right;
	const innerH = height - padding.top - padding.bottom;
	const toX = (x: number) => padding.left + (Math.min(x, maxX) / maxX) * innerW;
	const toY = (y: number) => padding.top + innerH - (Math.min(y, maxY) / maxY) * innerH;

	const d = buildSmoothPath(points, width, height, padding, maxX, maxY);

	const xTicks = [0, 24, 48, 72, 96, 120, 144, 168];
	
	// Y-axis ticks based on maxY
	const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];
	
	return (
		<svg width={width} height={height} style={{ background: 'transparent' }}>
			{/* Y-axis label */}
			<text 
				x={15} 
				y={height / 2} 
				fill="#C0C0C0" 
				fontSize={12} 
				textAnchor="middle" 
				dominantBaseline="central"
				transform={`rotate(-90, 15, ${height / 2})`}
			>
				{yAxisLabel}
			</text>

			{/* horizontal grid */}
			{yTicks.map((t, i) => (
				<line key={i} x1={padding.left} y1={toY(t)} x2={width - padding.right} y2={toY(t)} stroke="#141414" />
			))}
			
			{/* Y-axis ticks and labels */}
			{yTicks.map((t, i) => (
				<g key={i}>
					<line x1={padding.left - 5} y1={toY(t)} x2={padding.left} y2={toY(t)} stroke="#333" />
					<text x={padding.left - 8} y={toY(t)} fill="#FFD600" fontSize={10} textAnchor="end" dominantBaseline="central">
						{isROI ? `$${Math.round(t)}` : Math.round(t)}
					</text>
				</g>
			))}
			
			{xTicks.map((h) => (
				<g key={h}>
					<line x1={toX(h)} y1={padding.top} x2={toX(h)} y2={height - padding.bottom} stroke="#0f0f0f" />
					<text x={toX(h)} y={height - 8} fill="#C0C0C0" fontSize={10} textAnchor="middle">{h === 0 ? 'Launch' : `${h}h`}</text>
				</g>
			))}

			{/* Deficit area for ROI chart - break even point */}
			{showDeficit && deficitThreshold > 0 && (
				<rect
					x={padding.left}
					y={toY(deficitThreshold)}
					width={innerW}
					height={innerH - toY(deficitThreshold)}
					fill="rgba(255, 0, 0, 0.2)"
					stroke="rgba(255, 0, 0, 0.5)"
					strokeWidth={1}
				/>
			)}

			{/* area under curve */}
			<path d={`${d} L ${toX(points[points.length - 1].x)} ${toY(0)} L ${toX(points[0].x)} ${toY(0)} Z`} fill="url(#gArea)" opacity={0.35} />
			<defs>
				<linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#18C964" stopOpacity="0.35" />
					<stop offset="100%" stopColor="#18C964" stopOpacity="0.05" />
				</linearGradient>
			</defs>

			{/* line */}
			<path d={d} fill="none" stroke="#18C964" strokeWidth={3} />
			
			{/* current point - positioned at actual current time */}
			{currentPoint && (
				<circle 
					cx={toX(currentPoint.x)} 
					cy={toY(currentPoint.y)} 
					r={4} 
					fill="#18C964" 
				/>
			)}
		</svg>
	);
}

interface VCProps {
    forceValidated?: boolean;
    onForceValidated?: (enabled: boolean) => void;
}

export default function ValidatedCampaignDashboard({ forceValidated, onForceValidated }: VCProps) {
	const [tab, setTab] = useState<TabKey>('mint');
	const [objective, setObjective] = useState<number>(200);
	const [remainingHours, setRemainingHours] = useState<number>(168);
	const [now, setNow] = useState<number>(Date.now());
	const [mintCompleted, setMintCompleted] = useState<number>(0);
	const [endTs, setEndTs] = useState<number>(() => Date.now() + 168 * 3600 * 1000);
	const [showTextModal, setShowTextModal] = useState(false);
	const [showVideoModal, setShowVideoModal] = useState(false);
	
	// Pricing controls - MINT Community to Company is always 50% of MINT Price
	const [mintPrice, setMintPrice] = useState<number>(25);
	const [mintCommunityToCompany, setMintCommunityToCompany] = useState<number>(12.50);
	const [mintCreationPrice, setMintCreationPrice] = useState<number>(1000); // Price paid by creator for campaign creation

	// Auto-update MINT Community to Company when MINT Price changes
	useEffect(() => {
		setMintCommunityToCompany(mintPrice * 0.5);
	}, [mintPrice]);

	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, []);

	// Update endTs only when remainingHours changes
	useEffect(() => {
		setEndTs(Date.now() + Math.max(0, remainingHours) * 3600 * 1000);
	}, [remainingHours]);

	const elapsedHRaw = (now - (endTs - 168 * 3600 * 1000)) / 3600000;
	const elapsedH = Math.max(0, Math.min(168, elapsedHRaw));
	const remainingMs = Math.max(0, endTs - now);

	// Build chart points - FIXED: Include current point in the line for real-time evolution
	const chart = useMemo(() => {
		const ticks = [0, 24, 48, 72, 96, 120, 144, 168];
		const pts: CompletionPoint[] = [];
		
		// Create points up to the current elapsed time
		for (let i = 0; i < ticks.length; i++) {
			const x = ticks[i];
			if (x <= elapsedH) {
				const ratio = Math.min(1, x / Math.max(1, elapsedH));
				const y = Math.round(mintCompleted * ratio);
				pts.push({ x, y });
			}
		}
		
		// Add current point at actual elapsed time for real-time evolution
		if (elapsedH > 0) {
			pts.push({ x: elapsedH, y: mintCompleted });
			pts.sort((a, b) => a.x - b.x);
		}
		
		return pts;
	}, [elapsedH, mintCompleted]);

	// Current point at actual elapsed time
	const currentPoint = useMemo(() => {
		if (elapsedH <= 0) return { x: 0, y: 0 };
		return { x: elapsedH, y: mintCompleted };
	}, [elapsedH, mintCompleted]);

	// ROI chart data (revenue over time) - FIXED: Include current point for real-time evolution
	const roiChart = useMemo(() => {
		const ticks = [0, 24, 48, 72, 96, 120, 144, 168];
		const pts: CompletionPoint[] = [];
		
		// Create points up to the current elapsed time
		for (let i = 0; i < ticks.length; i++) {
			const x = ticks[i];
			if (x <= elapsedH) {
				const ratio = Math.min(1, x / Math.max(1, elapsedH));
				const revenue = mintCompleted * mintCommunityToCompany;
				const y = Math.round(revenue * ratio);
				pts.push({ x, y });
			}
		}
		
		// Add current point at actual elapsed time for real-time evolution
		if (elapsedH > 0) {
			const revenue = mintCompleted * mintCommunityToCompany;
			pts.push({ x: elapsedH, y: revenue });
			pts.sort((a, b) => a.x - b.x);
		}
		
		return pts;
	}, [elapsedH, mintCompleted, mintCommunityToCompany]);

	// Current ROI point at actual elapsed time
	const currentROIPoint = useMemo(() => {
		if (elapsedH <= 0) return { x: 0, y: 0 };
		const revenue = mintCompleted * mintCommunityToCompany;
		return { x: elapsedH, y: revenue };
	}, [elapsedH, mintCompleted, mintCommunityToCompany]);

	// Calculate break even point for ROI chart
	const breakEvenPoint = useMemo(() => {
		// Break even when revenue equals creation cost
		return mintCreationPrice;
	}, [mintCreationPrice]);

	// Calculate maximum possible revenue (100% completion)
	const maxPossibleRevenue = useMemo(() => {
		return objective * mintCommunityToCompany;
	}, [objective, mintCommunityToCompany]);

	const percent = Math.max(0, Math.min(100, Math.round((mintCompleted / Math.max(1, objective)) * 100)));
	const countdown = formatCountdown(remainingMs);
	const totalRevenue = mintCompleted * mintCommunityToCompany;

	// Tab carousel effect
	const tabs = [
		{ key: 'mint', label: 'MINT Completion', dim: tab !== 'mint' },
		{ key: 'roi', label: 'R.O.I.', dim: tab !== 'roi' },
		{ key: 'rewards', label: 'Rewards', dim: tab !== 'rewards' },
	];

	const additionalControls = (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
			<label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
				<span style={{ fontSize: 13 }}>MINT Completed</span>
				<input
					type="number"
					value={mintCompleted}
					min={0}
					onChange={(e) => setMintCompleted(Math.max(0, Number.isFinite(parseInt(e.target.value)) ? parseInt(e.target.value) : 0))}
					style={{ width: 90, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '6px 8px' }}
				/>
			</label>
			<label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
				<span style={{ fontSize: 13 }}>Your Objective MINT</span>
				<input
					type="number"
					value={objective}
					min={1}
					onChange={(e) => setObjective(Math.max(1, Number.isFinite(parseInt(e.target.value)) ? parseInt(e.target.value) : 1))}
					style={{ width: 90, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '6px 8px' }}
				/>
			</label>
			<label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
				<span style={{ fontSize: 13 }}>Heures restantes</span>
				<input
					type="number"
					value={remainingHours}
					min={0}
					max={168}
					onChange={(e) => setRemainingHours(Math.min(168, Math.max(0, Number.isFinite(parseInt(e.target.value)) ? parseInt(e.target.value) : 0)))}
					style={{ width: 90, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '6px 8px' }}
				/>
			</label>
			<label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
				<span style={{ fontSize: 13 }}>MINT Price ($)</span>
				<input
					type="number"
					value={mintPrice}
					min={0}
					step={0.01}
					onChange={(e) => setMintPrice(Math.max(0, Number.isFinite(parseFloat(e.target.value)) ? parseFloat(e.target.value) : 0))}
					style={{ width: 90, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '6px 8px' }}
				/>
			</label>
			<label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
				<span style={{ fontSize: 13 }}>MINT Community to Company ($)</span>
				<input
					type="number"
					value={mintCommunityToCompany}
					min={0}
					step={0.01}
					onChange={(e) => setMintCommunityToCompany(Math.max(0, Number.isFinite(parseFloat(e.target.value)) ? parseFloat(e.target.value) : 0))}
					style={{ width: 90, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '6px 8px' }}
				/>
			</label>
			<label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
				<span style={{ fontSize: 13 }}>MINT Creation Price ($)</span>
				<input
					type="number"
					value={mintCreationPrice}
					min={0}
					step={0.01}
					onChange={(e) => setMintCreationPrice(Math.max(0, Number.isFinite(parseFloat(e.target.value)) ? parseFloat(e.target.value) : 0))}
					style={{ width: 90, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '6px 8px' }}
				/>
			</label>
		</div>
	);

	return (
		<div style={{ width: '100%', maxWidth: 1180 }}>
			{/* Title row */}
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
				<h2 style={{ color: '#18C964', fontSize: 44, fontWeight: 900 }}>Validated Campaign</h2>
				<button style={{ 
					background: 'transparent', 
					border: '2px solid rgba(255, 214, 0, 0.6)', 
					color: 'rgba(255, 214, 0, 0.8)', 
					borderRadius: 12, 
					padding: '8px 14px', 
					fontWeight: 800,
					fontSize: 20
				}}>
					Community Completions
				</button>
			</div>

			{/* Sub-tabs with carousel effect */}
			<div style={{ display: 'flex', gap: 26, alignItems: 'center', marginBottom: 6 }}>
				{tabs.map((t: any) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key as TabKey)}
						style={{
							background: 'transparent',
							border: 'none',
							color: tab === t.key ? '#18C964' : (t.dim ? 'rgba(24,201,100,0.4)' : '#2BAE56'),
							fontWeight: 900,
							fontSize: 22,
							cursor: 'pointer',
							position: 'relative',
							transition: 'all 0.3s ease',
							transform: tab === t.key ? 'scale(1.05)' : 'scale(1)',
						}}
					>
						{t.label}
						{tab === t.key && (
							<div style={{
								position: 'absolute',
								bottom: -4,
								left: 0,
								right: 0,
								height: 3,
								background: '#18C964',
								borderRadius: 2
							}} />
						)}
					</button>
				))}
			</div>

			<div style={{ display: 'grid', gridTemplateColumns: 'minmax(680px, 1fr) 280px', gap: 18, alignItems: 'start' }}>
				{/* Chart area */}
				<div style={{ overflow: 'hidden' }}>
					{tab === 'mint' && (
						<ModernLineChart 
							points={chart} 
							maxY={objective} 
							maxX={168} 
							currentPoint={currentPoint}
							yAxisLabel="MINT Completions"
							isROI={false}
						/>
					)}
					{tab === 'roi' && (
						<ModernLineChart 
							points={roiChart} 
							maxY={Math.max(maxPossibleRevenue, breakEvenPoint)} 
							maxX={168} 
							showDeficit={true}
							deficitThreshold={breakEvenPoint}
							currentPoint={currentROIPoint}
							yAxisLabel="Creator Profit ($)"
							isROI={true}
						/>
					)}
					{tab === 'rewards' && (
						<div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>Rewards à venir</div>
					)}
				</div>

				{/* Right info panel (more compact) */}
				<div>
					<div style={{ color: '#18C964', fontStyle: 'italic', fontSize: 18, marginBottom: 10 }}>{mockCampaignData.title}</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
						<button 
							onClick={() => setShowTextModal(true)}
							style={{ color: '#18C964', border: '2px solid #18C964', borderRadius: 14, padding: '8px 12px', textDecoration: 'none', textAlign: 'center', fontWeight: 800, background: 'transparent', cursor: 'pointer' }}
						>
							Your Starting Text
						</button>
						<button 
							onClick={() => setShowVideoModal(true)}
							style={{ color: '#18C964', border: '2px solid #18C964', borderRadius: 14, padding: '8px 12px', textDecoration: 'none', textAlign: 'center', fontWeight: 800, background: 'transparent', cursor: 'pointer' }}
						>
							Your Starting A.I. Film
						</button>
					</div>

					<div style={{ marginTop: 14, color: '#FFD600', fontWeight: 900, fontSize: 20 }}>End of Campaign in</div>
					<div style={{ color: '#FFFFFF', fontFamily: 'monospace', fontSize: 28, marginTop: 4 }}>{countdown}</div>

					<div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
						<button style={{ background: 'transparent', border: '2px solid #18C964', color: '#18C964', borderRadius: 14, padding: '6px 10px', fontWeight: 800 }}>Standard Rewards</button>
						<button style={{ background: 'transparent', border: '2px solid #FFD600', color: '#FFD600', borderRadius: 14, padding: '6px 10px', fontWeight: 800 }}>Premium Rewards</button>
						<div style={{ color: '#18C964', fontSize: 14 }}><span style={{ color: '#C0C0C0' }}>Value MINT Completion</span> <strong style={{ marginLeft: 6 }}>{mintPrice} $</strong></div>
					</div>
				</div>
			</div>

			{/* Bottom metrics and Top 3 */}
			<div style={{ display: 'grid', gridTemplateColumns: 'minmax(680px, 1fr) 280px', gap: 18, alignItems: 'start', marginTop: 12 }}>
				<div style={{ textAlign: 'center' }}>
					{tab === 'mint' && (
						<>
							<div style={{ color: '#2BAE56', fontWeight: 900, fontSize: 14 }}>MINT Completed</div>
							<div style={{ color: '#18C964', fontWeight: 900, fontSize: 32 }}>{mintCompleted}</div>
							<div style={{ color: '#FFD600', fontWeight: 900, fontSize: 18, marginTop: 6 }}>{objective}</div>
							<div style={{ color: '#C0C0C0', fontStyle: 'italic' }}>Your Objective MINT</div>
							<div style={{ marginTop: 6, color: '#18C964', fontWeight: 900, fontSize: 30 }}>{percent} % MINT Completion</div>
						</>
					)}
					{tab === 'roi' && (
						<>
							<div style={{ color: '#18C964', fontWeight: 900, fontSize: 18, marginBottom: 8 }}>
								{mintCompleted} MINT Completed × {mintCommunityToCompany}€ MINT Community to Company = <span style={{ color: '#FFD600' }}>+ {totalRevenue.toFixed(0)}$</span> on your Wallet connected
							</div>
							<div style={{ color: '#C0C0C0', fontSize: 14, marginTop: 8 }}>
								Break Even Point: <span style={{ color: '#FFD600' }}>${breakEvenPoint}</span>
							</div>
							<div style={{ color: totalRevenue >= breakEvenPoint ? '#18C964' : '#FF0000', fontSize: 16, fontWeight: 800, marginTop: 4 }}>
								{totalRevenue >= breakEvenPoint ? '✅ Profitable' : '❌ Deficit'}
							</div>
						</>
					)}
				</div>
				<div>
					<div style={{ color: '#C0C0C0', marginBottom: 6 }}>Actual Top 3 Validated</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
						{mockCampaignData.topCompletions.map((completion, index) => (
							<div key={completion.rank}>
								<div style={{ color: index === 0 ? '#FFD600' : index === 1 ? '#C0C0C0' : '#FF8C00', fontWeight: 800 }}>
									{completion.rank === 1 ? '1st' : completion.rank === 2 ? '2nd' : '3rd'} Best Completion
								</div>
								<div style={{ color: '#C0C0C0' }}>by {completion.address}</div>
								<div style={{ color: '#18C964', fontWeight: 800 }}>{completion.score} / 100</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Modals */}
			<TextModal
				isOpen={showTextModal}
				onClose={() => setShowTextModal(false)}
				title="Your Starting Story"
				content={mockCampaignData.startingStory}
			/>
			<VideoModal
				isOpen={showVideoModal}
				onClose={() => setShowVideoModal(false)}
				title="Your Starting A.I. Film"
				videoUrl={mockCampaignData.videoUrl}
			/>

			{/* Dev controls pour ce dashboard */}
			<DevControls 
				onForceValidated={onForceValidated}
				forceValidated={forceValidated}
				additionalControls={additionalControls} 
			/>
		</div>
	);
}
