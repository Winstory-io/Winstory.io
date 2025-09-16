"use client";

import { useEffect, useMemo, useState } from 'react';
import DevControls from '@/components/DevControls';

type TabKey = 'mint' | 'roi' | 'rewards';

interface CompletionPoint { x: number; y: number }

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

function ModernLineChart({ points, maxY, maxX }: { points: CompletionPoint[]; maxY: number; maxX: number }) {
	const width = 820;
	const height = 240;
	const padding = { left: 44, right: 16, top: 10, bottom: 28 };
	const innerW = width - padding.left - padding.right;
	const innerH = height - padding.top - padding.bottom;
	const toX = (x: number) => padding.left + (Math.min(x, maxX) / maxX) * innerW;
	const toY = (y: number) => padding.top + innerH - (Math.min(y, maxY) / maxY) * innerH;

	const d = buildSmoothPath(points, width, height, padding, maxX, maxY);

	const xTicks = [0, 24, 48, 72, 96, 120, 144, 168];
	return (
		<svg width={width} height={height} style={{ background: 'transparent' }}>
			{/* horizontal grid */}
			{[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
				<line key={i} x1={padding.left} y1={padding.top + t * innerH} x2={width - padding.right} y2={padding.top + t * innerH} stroke="#141414" />
			))}
			{/* vertical grid + labels */}
			{xTicks.map((h) => (
				<g key={h}>
					<line x1={toX(h)} y1={padding.top} x2={toX(h)} y2={height - padding.bottom} stroke="#0f0f0f" />
					<text x={toX(h)} y={height - 8} fill="#C0C0C0" fontSize={10} textAnchor="middle">{h === 0 ? 'Launch' : `${h}h`}</text>
				</g>
			))}

			{/* area under curve */}
			{points.length > 0 && (
				<>
					<defs>
						<linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#18C964" stopOpacity="0.35" />
							<stop offset="100%" stopColor="#18C964" stopOpacity="0.05" />
						</linearGradient>
					</defs>
					<path d={`${d} L ${toX(points[points.length - 1].x)} ${toY(0)} L ${toX(points[0].x)} ${toY(0)} Z`} fill="url(#gArea)" opacity={0.35} />
				</>
			)}

			{/* line */}
			<path d={d} fill="none" stroke="#18C964" strokeWidth={3} />
			{/* current point */}
			{points.length > 0 && (
				<circle cx={toX(points[points.length - 1].x)} cy={toY(points[points.length - 1].y)} r={4} fill="#18C964" />
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
	const [remainingHours, setRemainingHours] = useState<number>(168); // contrôlable via DevControls
	const [now, setNow] = useState<number>(Date.now());
	const [endTs, setEndTs] = useState<number>(() => Date.now() + 168 * 3600 * 1000);
	const [mintCompleted, setMintCompleted] = useState<number>(0);

	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, []);

	// Mettre à jour endTs seulement quand remainingHours change (pas à chaque tick),
	// ainsi le timer décrémente correctement.
	useEffect(() => {
		setEndTs(Date.now() + Math.max(0, remainingHours) * 3600 * 1000);
	}, [remainingHours]);

	// Calculs basés sur un endTs figé jusqu’au prochain changement de remainingHours
	const end = endTs;
	const start = endTs - 168 * 3600 * 1000; // fenêtre d'une semaine
	const elapsedHRaw = (now - start) / 3600000;
	const elapsedH = Math.max(0, Math.min(168, elapsedHRaw)); // 0 -> tout à gauche, 168 -> tout à droite
	const remainingMs = Math.max(0, end - now);

	// Points du graphe: de Launch à elapsedH, puis point courant à elapsedH
	const chart = useMemo(() => {
		const allTicks = [0, 24, 48, 72, 96, 120, 144, 168];
		const usedTicks = allTicks.filter((t) => t <= Math.floor(elapsedH));
		const pts: CompletionPoint[] = [];
		for (let i = 0; i < usedTicks.length; i++) {
			const x = usedTicks[i];
			let y = 0;
			if (elapsedH > 0) {
				const ratio = Math.min(1, x / Math.max(1, elapsedH));
				y = Math.round(mintCompleted * ratio);
			}
			pts.push({ x, y });
		}
		// point courant
		pts.push({ x: elapsedH, y: mintCompleted });
		pts.sort((a, b) => a.x - b.x);
		return pts;
	}, [elapsedH, mintCompleted]);

	const percent = Math.max(0, Math.min(100, Math.round((mintCompleted / Math.max(1, objective)) * 100)));
	const countdown = formatCountdown(remainingMs);

	// DevControls - contrôles spécifiques Validated Campaign
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
		</div>
	);

	return (
		<div style={{ width: '100%', maxWidth: 1180 }}>
			{/* Title row */}
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
				<h2 style={{ color: '#18C964', fontSize: 44, fontWeight: 900 }}>Validated Campaign</h2>
				<button style={{ background: 'transparent', border: '2px solid #18C964', color: '#18C964', borderRadius: 12, padding: '8px 14px', fontWeight: 800 }}>Community Completions</button>
			</div>

			{/* Sub-tabs with underline for active tab */}
			<div style={{ display: 'flex', gap: 26, alignItems: 'center', marginBottom: 6 }}>
				{[
					{ key: 'mint', label: 'MINT Completion', dim: false },
					{ key: 'roi', label: 'R.O.I.', dim: true },
					{ key: 'rewards', label: 'Rewards', dim: true },
				].map((t: any) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key)}
						style={{
							background: 'transparent',
							border: 'none',
							color: tab === t.key ? '#18C964' : (t.dim ? 'rgba(24,201,100,0.5)' : '#2BAE56'),
							fontWeight: 900,
							fontSize: 22,
							cursor: 'pointer',
							position: 'relative',
							paddingBottom: 8,
						}}
					>
						{t.label}
						{tab === t.key && (
							<div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#18C964', borderRadius: 2 }} />
						)}
					</button>
				))}
			</div>

			<div style={{ display: 'grid', gridTemplateColumns: 'minmax(680px, 1fr) 280px', gap: 18, alignItems: 'start' }}>
				{/* Chart area */}
				<div style={{ overflow: 'hidden' }}>
					{tab === 'mint' && <ModernLineChart points={chart} maxY={objective} maxX={168} />}
					{tab === 'roi' && (
						<div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>ROI à venir</div>
					)}
					{tab === 'rewards' && (
						<div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>Rewards à venir</div>
					)}
				</div>

				{/* Right info panel (compact) */}
				<div>
					<div style={{ color: '#18C964', fontStyle: 'italic', fontSize: 18, marginBottom: 10 }}>Title</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
						<a href="#" style={{ color: '#18C964', border: '2px solid #18C964', borderRadius: 14, padding: '8px 12px', textDecoration: 'none', textAlign: 'center', fontWeight: 800 }}>Your Starting Text</a>
						<a href="#" style={{ color: '#18C964', border: '2px solid #18C964', borderRadius: 14, padding: '8px 12px', textDecoration: 'none', textAlign: 'center', fontWeight: 800 }}>Your Starting A.I. Film</a>
					</div>

					<div style={{ marginTop: 14, color: '#FFD600', fontWeight: 900, fontSize: 20 }}>End of Campaign in</div>
					<div style={{ color: '#FFFFFF', fontFamily: 'monospace', fontSize: 28, marginTop: 4 }}>{countdown}</div>

					<div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
						<button style={{ background: 'transparent', border: '2px solid #18C964', color: '#18C964', borderRadius: 14, padding: '6px 10px', fontWeight: 800 }}>Standard Rewards</button>
						<button style={{ background: 'transparent', border: '2px solid #FFD600', color: '#FFD600', borderRadius: 14, padding: '6px 10px', fontWeight: 800 }}>Premium Rewards</button>
						<div style={{ color: '#18C964', fontSize: 14 }}><span style={{ color: '#C0C0C0' }}>Value MINT Completion</span> <strong style={{ marginLeft: 6 }}>25 $</strong></div>
					</div>
				</div>
			</div>

			{/* Bottom metrics and Top 3 */}
			<div style={{ display: 'grid', gridTemplateColumns: 'minmax(680px, 1fr) 280px', gap: 18, alignItems: 'start', marginTop: 12 }}>
				<div style={{ textAlign: 'center' }}>
					<div style={{ color: '#2BAE56', fontWeight: 900, fontSize: 14 }}>MINT Completed</div>
					<div style={{ color: '#18C964', fontWeight: 900, fontSize: 32 }}>{mintCompleted}</div>
					<div style={{ color: '#FFD600', fontWeight: 900, fontSize: 18, marginTop: 6 }}>{objective}</div>
					<div style={{ color: '#C0C0C0', fontStyle: 'italic' }}>Your Objective MINT</div>
					<div style={{ marginTop: 6, color: '#18C964', fontWeight: 900, fontSize: 30 }}>{percent} % MINT Completion</div>
				</div>
				<div>
					<div style={{ color: '#C0C0C0', marginBottom: 6 }}>Actual Top 3 Validated</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
						<div style={{ color: '#FFD600', fontWeight: 800 }}>1st Best Completion</div>
						<div style={{ color: '#C0C0C0' }}>by 0x567EP...2SK9U9EP</div>
						<div style={{ color: '#18C964', fontWeight: 800 }}>96.50 / 100</div>
						<div style={{ color: '#FFD600', fontWeight: 800, marginTop: 4 }}>2nd Best Completion</div>
						<div style={{ color: '#C0C0C0' }}>by 0xF4U3L...G7X5CH3J</div>
						<div style={{ color: '#18C964', fontWeight: 800 }}>93 / 100</div>
						<div style={{ color: '#FFD600', fontWeight: 800, marginTop: 4 }}>3rd Best Completion</div>
						<div style={{ color: '#C0C0C0' }}>by 0xQJ8A7...1K5N3FB8</div>
						<div style={{ color: '#18C964', fontWeight: 800 }}>89 / 100</div>
					</div>
				</div>
			</div>

			{/* Dev controls for this dashboard (visible only en dev via DevControls) */}
			<DevControls 
		onForceValidated={onForceValidated}
		forceValidated={forceValidated}
		additionalControls={additionalControls} 
	/>
		</div>
	);
}
