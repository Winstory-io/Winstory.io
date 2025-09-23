"use client";

import React, { useMemo } from 'react';

export interface StakingPerformanceChartProps {
	// Per-campaign delta earnings in WINC (can be negative)
	campaignDeltas: number[];
	width?: number;
	height?: number;
	padding?: { top: number; right: number; bottom: number; left: number };
	barColorPositive?: string;
	barColorNegative?: string;
	lineColor?: string;
	gridGreen?: string;
	gridRed?: string;
	background?: string;
	barGap?: number; // gap in pixels between bars
	barRadius?: number;
	smoothLine?: boolean;
	maxAbsY?: number | null; // when null, auto from data
	showAxes?: boolean;
	showZeroLine?: boolean;
	labelX?: string;
	labelY?: string;
}

export default function StakingPerformanceChart({
	campaignDeltas,
	width = 1100,
	height = 460,
	padding = { top: 32, right: 24, bottom: 48, left: 72 },
	barColorPositive = "#18C964",
	barColorNegative = "#FF2222",
	lineColor = "#FFD600",
	gridGreen = "#0D4018",
	gridRed = "#401010",
	background = "#000",
	barGap = 10,
	barRadius = 4,
	smoothLine = true,
	maxAbsY = null,
	showAxes = true,
	showZeroLine = true,
	labelX = "Campaigns",
	labelY = "Cumulative Earnings (WINC)"
}: StakingPerformanceChartProps) {
	const dims = { w: width, h: height, innerW: width - padding.left - padding.right, innerH: height - padding.top - padding.bottom };

	const { cumulative, maxAbs, scaleY, scaleX, zeroY, pathD } = useMemo(() => {
		const cumulative: number[] = [];
		let acc = 0;
		for (const d of campaignDeltas) {
			acc += d;
			cumulative.push(acc);
		}
		const maxAbsFromData = Math.max(
			1,
			...campaignDeltas.map(v => Math.abs(v)),
			...cumulative.map(v => Math.abs(v))
		);
		const maxAbs = maxAbsY ? Math.max(1, maxAbsY) : maxAbsFromData;
		const zeroY = padding.top + dims.innerH / 2; // visual baseline center; we will use scale to map values to +/-
		// We want +maxAbs at top area and -maxAbs at bottom area
		const scaleY = (v: number) => {
			const ratio = v / (maxAbs * 2); // map [-maxAbs, +maxAbs] to [-0.5, +0.5]
			return zeroY - ratio * dims.innerH; // invert for SVG y
		};
		const scaleX = (i: number) => {
			const n = Math.max(1, campaignDeltas.length);
			return padding.left + (i + 0.5) * (dims.innerW / n);
		};
		// Build path for cumulative line
		const points = cumulative.map((v, i) => [scaleX(i), scaleY(v)] as const);
		let d = "";
		if (points.length) {
			if (smoothLine && points.length > 1) {
				// Cubic bezier smoothing
				const cps = (p0: any, p1: any, p2: any, t = 0.2) => {
					const d01 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
					const d12 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
					const fa = (t * d01) / (d01 + d12);
					const fb = (t * d12) / (d01 + d12);
					const p1x = p1[0] - fa * (p2[0] - p0[0]);
					const p1y = p1[1] - fa * (p2[1] - p0[1]);
					const p2x = p1[0] + fb * (p2[0] - p0[0]);
					const p2y = p1[1] + fb * (p2[1] - p0[1]);
					return [p1x, p1y, p2x, p2y];
				};
				d = `M ${points[0][0]} ${points[0][1]}`;
				for (let i = 1; i < points.length; i++) {
					const p0 = points[i - 2] ?? points[0];
					const p1 = points[i - 1];
					const p2 = points[i];
					const [cp1x, cp1y, cp2x, cp2y] = cps(p0, p1, p2, 0.2);
					d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
				}
			} else {
				d = `M ${points[0][0]} ${points[0][1]} ` + points.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(" ");
			}
		}
		return { cumulative, maxAbs, scaleY, scaleX, zeroY, pathD: d };
	}, [campaignDeltas, dims.innerH, dims.innerW, padding.left, padding.top, maxAbsY, smoothLine]);

	// Bars geometry
	const n = Math.max(1, campaignDeltas.length);
	const barWidth = Math.max(2, (dims.innerW / n) - barGap);

	// Grid lines
	const gridLines = useMemo(() => {
		const lines: { y: number; color: string; value: number }[] = [];
		const steps = 10; // 10 up, 10 down visually
		for (let i = -steps; i <= steps; i++) {
			const v = (i / steps) * (maxAbs ?? 1);
			const y = scaleY(v);
			lines.push({ y, color: i >= 0 ? gridGreen : gridRed, value: v });
		}
		return lines;
	}, [gridGreen, gridRed, scaleY, maxAbs]);

	// Decide x label step to avoid clutter (aim for <= 16 labels)
	const xLabelStep = useMemo(() => {
		const nBars = campaignDeltas.length;
		if (nBars <= 16) return 1;
		if (nBars <= 32) return 2;
		if (nBars <= 48) return 3;
		return Math.ceil(nBars / 16);
	}, [campaignDeltas.length]);

	return (
		<div style={{ width, height, background, borderRadius: 16, border: "1px solid #123", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", position: "relative" }}>
			<svg width={width} height={height}>
				<defs>
					<filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{/* Green half background */}
				<rect x={padding.left} y={padding.top} width={dims.innerW} height={dims.innerH / 2} fill="#031a0a" />
				{/* Red half background */}
				<rect x={padding.left} y={padding.top + dims.innerH / 2} width={dims.innerW} height={dims.innerH / 2} fill="#1a0606" />

				{/* Grid */}
				{gridLines.map((g, idx) => (
					<line key={`gl-${idx}`} x1={padding.left} x2={padding.left + dims.innerW} y1={g.y} y2={g.y} stroke={g.color} strokeWidth={1} opacity={0.5} />
				))}

				{/* Zero baseline */}
				{showZeroLine && (
					<line x1={padding.left} x2={padding.left + dims.innerW} y1={zeroY} y2={zeroY} stroke="#ffffff" strokeWidth={1.5} />
				)}

				{/* Y-axis tick labels */}
				{showAxes && gridLines.map((g, idx) => (
					g.value === 0 ? (
						<text key={`yt-${idx}`} x={padding.left - 12} y={g.y + 4} fill="#FFFFFF" fontSize={11} textAnchor="end">0</text>
					) : (
						<text key={`yt-${idx}`} x={padding.left - 12} y={g.y + 4} fill={g.value > 0 ? "#18C964" : "#FF4D4D"} fontSize={10} textAnchor="end">{Math.round(g.value * 10) / 10}</text>
					)
				))}

				{/* Bars */}
				{campaignDeltas.map((v, i) => {
					const xCenter = scaleX(i);
					const x = xCenter - barWidth / 2;
					const y = scaleY(Math.max(0, v));
					const yNeg = scaleY(Math.min(0, v));
					const top = Math.min(y, zeroY);
					const bottom = Math.max(yNeg, zeroY);
					const h = Math.max(1, bottom - top);
					const color = v >= 0 ? barColorPositive : barColorNegative;
					return (
						<rect key={i} x={x} y={top} width={barWidth} height={h} fill={color} rx={barRadius} ry={barRadius} opacity={0.9} />
					);
				})}

				{/* X-axis tick labels (1..n) */}
				{showAxes && campaignDeltas.map((_, i) => (
					(i % xLabelStep === 0) ? (
						<text key={`xt-${i}`} x={scaleX(i)} y={height - padding.bottom + 16} fill="#9CA3AF" fontSize={10} textAnchor="middle">{i + 1}</text>
					) : null
				))}

				{/* Cumulative line */}
				{pathD && (
					<path d={pathD} fill="none" stroke={lineColor} strokeWidth={2} filter="url(#softGlow)" />
				)}

				{/* Axes titles */}
				{showAxes && (
					<>
						<text x={padding.left + dims.innerW / 2} y={height - 12} fill="#FFFFFF" fontSize={14} fontWeight={800} textAnchor="middle">{labelX}</text>
						<g transform={`translate(16 ${padding.top + dims.innerH / 2}) rotate(-90)`}>
							<text x={0} y={0} fill="#FFFFFF" fontSize={14} fontWeight={800} textAnchor="middle">{labelY}</text>
						</g>
					</>
				)}
			</svg>
		</div>
	);
} 