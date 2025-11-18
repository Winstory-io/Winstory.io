"use client";

import { useEffect, useMemo, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
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

// Enhanced chart modal component with day navigation
function ChartModal({ isOpen, onClose, points, maxY, maxX, currentPoint, yAxisLabel, isROI, type, currentDay, setCurrentDay, validatedPoints, currentValidatedPoint }: {
  isOpen: boolean;
  onClose: () => void;
  points: CompletionPoint[];
  maxY: number;
  maxX: number;
  currentPoint?: CompletionPoint;
  yAxisLabel: string;
  isROI?: boolean;
  type: 'mint' | 'roi' | 'rewards';
  currentDay: number;
  setCurrentDay: (day: number) => void;
  validatedPoints?: CompletionPoint[];
  currentValidatedPoint?: CompletionPoint;
}) {
  if (!isOpen) return null;

  // Calculate total days (168h = 7 days)
  const totalDays = Math.ceil(maxX / 24);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Filter points for current 24h period
  const dayStartHour = (currentDay - 1) * 24;
  const dayEndHour = currentDay * 24;
  
  const currentDayPoints = points.filter(p => 
    p.x >= dayStartHour && p.x <= dayEndHour
  ); // Keep original x coordinates (24h, 48h, 72h, etc.)

  const currentDayValidatedPoints = validatedPoints?.filter(p => 
    p.x >= dayStartHour && p.x <= dayEndHour
  ) || [];

  // Current point for this day
  const currentDayPoint = currentPoint && currentPoint.x >= dayStartHour && currentPoint.x <= dayEndHour 
    ? currentPoint
    : undefined;

  const currentDayValidatedPoint = currentValidatedPoint && currentValidatedPoint.x >= dayStartHour && currentValidatedPoint.x <= dayEndHour 
    ? currentValidatedPoint
    : undefined;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        backgroundColor: '#000',
        borderRadius: 16,
        padding: 24,
        maxWidth: '95vw',
        maxHeight: '95vh',
        border: '2px solid #18C964'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: '#18C964', fontSize: 24, fontWeight: 800, margin: 0 }}>
            {type === 'mint' ? 'MINT Completion' : type === 'roi' ? 'R.O.I.' : 'Rewards'} - Day {currentDay} Detailed View (24h)
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '2px solid #FF4444',
              color: '#FF4444',
              borderRadius: 8,
              padding: '8px 16px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ✕ Close
          </button>
        </div>
        
        {/* Day navigation */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          marginBottom: 16, 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {daysArray.map(day => (
            <button
              key={day}
              onClick={() => setCurrentDay(day)}
              style={{
                background: day === currentDay ? '#18C964' : 'transparent',
                border: `2px solid ${day === currentDay ? '#18C964' : '#555'}`,
                color: day === currentDay ? '#000' : '#18C964',
                borderRadius: 8,
                padding: '6px 12px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: 14,
                minWidth: '60px'
              }}
            >
              Day {day}
            </button>
          ))}
        </div>
        
        {/* Enhanced larger chart with current day's 24h view */}
        {currentDayPoints.length > 0 ? (
          type === 'rewards' ? (
            <DualLineChart 
              mintPoints={currentDayPoints}
              validatedPoints={currentDayValidatedPoints} 
              maxY={maxY} 
              maxX={dayStartHour + 24}
              currentMintPoint={currentDayPoint}
              currentValidatedPoint={currentDayValidatedPoint}
              yAxisLabel={yAxisLabel}
              isEnhanced={true}
              dayStartHour={dayStartHour}
            />
          ) : (
            <ModernLineChart 
              points={currentDayPoints} 
              maxY={maxY} 
              maxX={dayStartHour + 24} // Scale X axis to current day end (24h, 48h, 72h, etc.)
              currentPoint={currentDayPoint}
              yAxisLabel={yAxisLabel}
              isROI={isROI}
              isEnhanced={true}
              dayStartHour={dayStartHour} // Pass day start for proper X axis labels
            />
          )
        ) : (
          <div style={{
            width: 1200,
            height: 600,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #333',
            borderRadius: 8,
            color: '#C0C0C0'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📊</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No data for Day {currentDay}</div>
            <div style={{ fontSize: 14, opacity: 0.7 }}>Data will appear as the campaign progresses</div>
          </div>
        )}
        
        <div style={{ marginTop: 16, color: '#C0C0C0', fontSize: 14, textAlign: 'center' }}>
          Navigate between days to explore detailed 24h periods • Enhanced precision view
        </div>
      </div>
    </div>
  );
}

// Linear path for line chart (no curves)
function buildLinearPath(points: CompletionPoint[], width: number, height: number, padding: {left:number;right:number;top:number;bottom:number}, maxX: number, maxY: number, xOffset: number = 0) {
	const innerW = width - padding.left - padding.right;
	const innerH = height - padding.top - padding.bottom;
	const toX = (x: number) => padding.left + (Math.min(Math.max(x - xOffset, 0), maxX) / maxX) * innerW;
	const toY = (y: number) => padding.top + innerH - (Math.min(y, maxY) / maxY) * innerH;
	if (points.length === 0) return '';
	let d = `M ${toX(points[0].x)} ${toY(points[0].y)}`;
	for (let i = 1; i < points.length; i++) {
		d += ` L ${toX(points[i].x)} ${toY(points[i].y)}`;
	}
	return d;
}

function ModernLineChart({ points, maxY, maxX, showDeficit = false, deficitThreshold = 0, currentPoint, yAxisLabel, isROI = false, isEnhanced = false, onChartClick, dayStartHour = 0 }: { 
  points: CompletionPoint[]; 
  maxY: number; 
  maxX: number; 
  showDeficit?: boolean;
  deficitThreshold?: number;
  currentPoint?: CompletionPoint;
  yAxisLabel: string;
  isROI?: boolean;
  isEnhanced?: boolean;
  onChartClick?: () => void;
  dayStartHour?: number;
}) {
	
	const width = isEnhanced ? 1200 : 900;
	const height = isEnhanced ? 700 : 380; // Increased height significantly
	const padding = { left: 60, right: 16, top: 10, bottom: 28 };
	const innerW = width - padding.left - padding.right;
	const innerH = height - padding.top - padding.bottom;
	// For enhanced view with day navigation, use day-specific range
	const xRange = isEnhanced ? 24 : maxX; // 24h range for enhanced view, full range for standard view
	const xOffset = isEnhanced ? dayStartHour : 0; // Starting point for enhanced view
	const toX = (x: number) => padding.left + (Math.min(Math.max(x - xOffset, 0), xRange) / xRange) * innerW;
	const toY = (y: number) => padding.top + innerH - (Math.min(y, maxY) / maxY) * innerH;

	// Use consistent X range for path building
	const pathMaxX = isEnhanced ? xRange : maxX;
	const pathXOffset = isEnhanced ? dayStartHour : 0;
	const d = buildLinearPath(points, width, height, padding, pathMaxX, maxY, pathXOffset);

	const xTicks = isEnhanced ? 
		Array.from({ length: 13 }, (_, i) => dayStartHour + i * 2) :  // 24h detailed view from day start
		[0, 24, 48, 72, 96, 120, 144, 168]; // Standard 168h view
	
	// Y-axis ticks based on maxY
	const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];
	
	return (
		<div style={{ position: 'relative', display: 'inline-block' }}>
			<svg 
				width={width} 
				height={height}
				style={{ 
					background: 'transparent', 
					cursor: !isEnhanced && onChartClick ? 'pointer' : 'default',
					transition: 'transform 0.3s ease'
				}}
				onClick={!isEnhanced && onChartClick ? onChartClick : undefined}
			>
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
						<text x={toX(h)} y={height - 8} fill="#C0C0C0" fontSize={10} textAnchor="middle">
							{h === 0 ? 'Launch' : `${h}h`}
						</text>
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
				{points.length > 0 && (
					<path d={`${d} L${toX(points[points.length - 1].x)} ${toY(0)} L${toX(points[0].x)} ${toY(0)} Z`} fill="url(#gArea)" opacity={0.35} />
				)}
				<defs>
					<linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#18C964" stopOpacity="0.35" />
						<stop offset="100%" stopColor="#18C964" stopOpacity="0.05" />
					</linearGradient>
				</defs>

				{/* Thinner line as requested */}
				<path d={d} fill="none" stroke="#18C964" strokeWidth={2} />
				
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
			
			{/* Click indicator - outside SVG */}
			{!isEnhanced && onChartClick && (
				<div style={{
					position: 'absolute',
					top: 15,
					right: 15,
					background: 'rgba(0, 0, 0, 0.8)',
					borderRadius: 8,
					padding: '8px 10px',
					fontSize: 11,
					color: '#FFD600',
					fontWeight: 600,
					cursor: 'pointer',
					zIndex: 10
				}}
				onMouseEnter={(e) => {
					// Agrandir le graphique entier
					const svgElement = e.currentTarget.parentElement?.querySelector('svg');
					if (svgElement) {
						svgElement.style.transform = 'scale(1.02)';
						svgElement.style.transition = 'transform 0.3s ease';
					}
				}}
				onMouseLeave={(e) => {
					// Remettre à la taille normale
					const svgElement = e.currentTarget.parentElement?.querySelector('svg');
					if (svgElement) {
						svgElement.style.transform = 'scale(1)';
					}
				}}
				onClick={onChartClick}
				>
					<svg width="40" height="40" viewBox="0 0 40 40" fill="none" 
						 style={{ 
							display: 'inline-block', 
							cursor: 'pointer' 
						 }}
					>
						<path d="M6 6L14 14M6 6L6 14M6 6L14 6" stroke="#FFD600" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
						<path d="M34 34L26 26M34 34L34 26M34 34L26 34" stroke="#FFD600" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
				</div>
			)}
		</div>
	);
}

// Dual line chart for Rewards (MINT vs Validated)
function DualLineChart({ mintPoints, validatedPoints, maxY, maxX, currentMintPoint, currentValidatedPoint, yAxisLabel, isEnhanced = false, onChartClick, dayStartHour = 0 }: { 
  mintPoints: CompletionPoint[]; 
  validatedPoints: CompletionPoint[];
  maxY: number; 
  maxX: number; 
  currentMintPoint?: CompletionPoint;
  currentValidatedPoint?: CompletionPoint;
  yAxisLabel: string;
  isEnhanced?: boolean;
  onChartClick?: () => void;
  dayStartHour?: number;
}) {
	
	const width = isEnhanced ? 1200 : 900;
	const height = isEnhanced ? 700 : 380;
	const padding = { left: 60, right: 16, top: 10, bottom: 28 };
	const innerW = width - padding.left - padding.right;
	const innerH = height - padding.top - padding.bottom;
	// For enhanced view with day navigation, use day-specific range
	const xRange = isEnhanced ? 24 : maxX;
	const xOffset = isEnhanced ? dayStartHour : 0;
	const toX = (x: number) => padding.left + (Math.min(Math.max(x - xOffset, 0), xRange) / xRange) * innerW;
	const toY = (y: number) => padding.top + innerH - (Math.min(y, maxY) / maxY) * innerH;

	// Use consistent X range for path building
	const pathMaxX = isEnhanced ? xRange : maxX;
	const pathXOffset = isEnhanced ? dayStartHour : 0;
	const mintPath = buildLinearPath(mintPoints, width, height, padding, pathMaxX, maxY, pathXOffset);
	const validatedPath = buildLinearPath(validatedPoints, width, height, padding, pathMaxX, maxY, pathXOffset);

	const xTicks = isEnhanced ? 
		Array.from({ length: 13 }, (_, i) => dayStartHour + i * 2) :
		[0, 24, 48, 72, 96, 120, 144, 168];
	
	const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];
	
	return (
		<div style={{ position: 'relative', display: 'inline-block' }}>
			<svg 
				width={width} 
				height={height}
				style={{ 
					background: 'transparent', 
					cursor: !isEnhanced && onChartClick ? 'pointer' : 'default',
					transition: 'transform 0.3s ease'
				}}
				onClick={!isEnhanced && onChartClick ? onChartClick : undefined}
			>
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
							{Math.round(t)}
						</text>
					</g>
				))}
				
				{/* X-axis grid and labels */}
				{xTicks.map((h) => (
					<g key={h}>
						<line x1={toX(h)} y1={padding.top} x2={toX(h)} y2={height - padding.bottom} stroke="#0f0f0f" />
						<text x={toX(h)} y={height - 8} fill="#C0C0C0" fontSize={10} textAnchor="middle">
							{h === 0 ? 'Launch' : `${h}h`}
						</text>
					</g>
				))}

				{/* Areas under curves */}
				{mintPoints.length > 0 && (
					<path d={`${mintPath} L${toX(mintPoints[mintPoints.length - 1].x)} ${toY(0)} L${toX(mintPoints[0].x)} ${toY(0)} Z`} fill="url(#mintArea)" opacity={0.3} />
				)}
				{validatedPoints.length > 0 && (
					<path d={`${validatedPath} L${toX(validatedPoints[validatedPoints.length - 1].x)} ${toY(0)} L${toX(validatedPoints[0].x)} ${toY(0)} Z`} fill="url(#validatedArea)" opacity={0.3} />
				)}
				
				<defs>
					<linearGradient id="mintArea" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#FFD600" stopOpacity="0.2" />
						<stop offset="100%" stopColor="#FFD600" stopOpacity="0.05" />
					</linearGradient>
					<linearGradient id="validatedArea" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#18C964" stopOpacity="0.3" />
						<stop offset="100%" stopColor="#18C964" stopOpacity="0.05" />
					</linearGradient>
				</defs>

				{/* MINT line (yellow) */}
				<path d={mintPath} fill="none" stroke="#FFD600" strokeWidth={2} />
				
				{/* Validated line (green) */}
				<path d={validatedPath} fill="none" stroke="#18C964" strokeWidth={2} />
				
				{/* Current points */}
				{currentMintPoint && (
					<circle 
						cx={toX(currentMintPoint.x)} 
						cy={toY(currentMintPoint.y)} 
						r={4} 
						fill="#FFD600" 
					/>
				)}
				{currentValidatedPoint && (
					<circle 
						cx={toX(currentValidatedPoint.x)} 
						cy={toY(currentValidatedPoint.y)} 
						r={4} 
						fill="#18C964" 
					/>
				)}
				
				{/* Legend */}
				<g transform={`translate(${width - 200}, 30)`}>
					<rect x={0} y={0} width={190} height={50} fill="rgba(0,0,0,0.8)" stroke="#333" strokeWidth={1} rx={4} />
					<circle cx={15} cy={15} r={4} fill="#FFD600" />
					<text x={25} y={19} fill="#FFD600" fontSize={12} fontWeight={600}>Total MINT</text>
					<circle cx={15} cy={35} r={4} fill="#18C964" />
					<text x={25} y={39} fill="#18C964" fontSize={12} fontWeight={600}>Validated Rewards</text>
				</g>
			</svg>
			
			{/* Click indicator - outside SVG */}
			{!isEnhanced && onChartClick && (
				<div style={{
					position: 'absolute',
					top: 15,
					right: 15,
					background: 'rgba(0, 0, 0, 0.8)',
					borderRadius: 8,
					padding: '8px 10px',
					fontSize: 11,
					color: '#FFD600',
					fontWeight: 600,
					cursor: 'pointer',
					zIndex: 10
				}}
				onMouseEnter={(e) => {
					// Agrandir le graphique entier
					const svgElement = e.currentTarget.parentElement?.querySelector('svg');
					if (svgElement) {
						svgElement.style.transform = 'scale(1.02)';
						svgElement.style.transition = 'transform 0.3s ease';
					}
				}}
				onMouseLeave={(e) => {
					// Remettre à la taille normale
					const svgElement = e.currentTarget.parentElement?.querySelector('svg');
					if (svgElement) {
						svgElement.style.transform = 'scale(1)';
					}
				}}
				onClick={onChartClick}
				>
					<svg width="40" height="40" viewBox="0 0 40 40" fill="none" 
						 style={{ 
							display: 'inline-block', 
							cursor: 'pointer' 
						 }}
					>
						<path d="M6 6L14 14M6 6L6 14M6 6L14 6" stroke="#FFD600" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
						<path d="M34 34L26 26M34 34L34 26M34 34L26 34" stroke="#FFD600" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
				</div>
			)}
		</div>
	);
}

interface VCProps {
    forceValidated?: boolean;
    onForceValidated?: (enabled: boolean) => void;
    campaignId?: string;
    creatorType?: 'FOR_B2C' | 'B2C_AGENCIES' | 'INDIVIDUAL_CREATORS' | 'FOR_INDIVIDUALS';
}

export default function ValidatedCampaignDashboard({ forceValidated, onForceValidated, campaignId, creatorType }: VCProps) {
	const account = useActiveAccount();
	const [tab, setTab] = useState<TabKey>('mint');
	const [objective, setObjective] = useState<number>(200);
	const [remainingHours, setRemainingHours] = useState<number>(168);
	const [now, setNow] = useState<number>(Date.now());
	const [mintCompleted, setMintCompleted] = useState<number>(0);
	const [endTs, setEndTs] = useState<number>(() => Date.now() + 168 * 3600 * 1000);
	const [showTextModal, setShowTextModal] = useState(false);
	const [showVideoModal, setShowVideoModal] = useState(false);
	const [showChartModal, setShowChartModal] = useState(false);
	const [chartModalType, setChartModalType] = useState<'mint' | 'roi' | 'rewards'>('mint');
	const [currentDay, setCurrentDay] = useState(1); // Day navigation for chart modal
	const [validatedCompletions, setValidatedCompletions] = useState<number>(0); // Number of validated completions (≤ mintCompleted)
	
	// Short link state
	const [shortLink, setShortLink] = useState<{ shortUrl: string; shortCode: string; clicksCount: number } | null>(null);
	const [shortLinkLoading, setShortLinkLoading] = useState(false);
	const [shortLinkError, setShortLinkError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	
	// Clicks history state
	const [showClicksHistory, setShowClicksHistory] = useState(false);
	const [clicksHistory, setClicksHistory] = useState<any[]>([]);
	const [clicksStats, setClicksStats] = useState<any>(null);
	const [clicksHistoryLoading, setClicksHistoryLoading] = useState(false);
	
	// Pricing controls - MINT Community to Company is always 50% of MINT Price
	const [mintPrice, setMintPrice] = useState<number>(25);
	const [mintCommunityToCompany, setMintCommunityToCompany] = useState<number>(12.50);
	const [mintCreationPrice, setMintCreationPrice] = useState<number>(1000); // Price paid by creator for campaign creation

	// Auto-update MINT Community to Company when MINT Price changes
	useEffect(() => {
		setMintCommunityToCompany(mintPrice * 0.5);
	}, [mintPrice]);

	// Ensure validated completions never exceed mintCompleted
	useEffect(() => {
		if (validatedCompletions > mintCompleted) {
			setValidatedCompletions(mintCompleted);
		}
	}, [mintCompleted, validatedCompletions]);

	// Fetch short link for B2C/Agence B2C campaigns
	useEffect(() => {
		if (campaignId && (creatorType === 'FOR_B2C' || creatorType === 'B2C_AGENCIES')) {
			setShortLinkLoading(true);
			setShortLinkError(null);
			
			fetch(`/api/campaigns/short-link?campaignId=${campaignId}`)
				.then(res => res.json())
				.then(data => {
					if (data.success) {
						setShortLink({
							shortUrl: data.shortUrl,
							shortCode: data.shortCode,
							clicksCount: data.clicksCount || 0
						});
					} else {
						setShortLinkError(data.error || 'Failed to fetch short link');
					}
				})
				.catch(err => {
					console.error('Error fetching short link:', err);
					setShortLinkError('Failed to fetch short link');
				})
				.finally(() => {
					setShortLinkLoading(false);
				});
		}
	}, [campaignId, creatorType]);

	// Copy short link to clipboard
	const handleCopyLink = async () => {
		if (shortLink) {
			try {
				await navigator.clipboard.writeText(shortLink.shortUrl);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (err) {
				console.error('Failed to copy:', err);
			}
		}
	};

	// Fetch clicks history
	const fetchClicksHistory = async () => {
		if (!campaignId || !account?.address) return;
		
		setClicksHistoryLoading(true);
		try {
			const response = await fetch(`/api/campaigns/short-link/clicks?campaignId=${campaignId}&walletAddress=${account.address}`);
			const data = await response.json();
			
			if (data.success) {
				setClicksHistory(data.clicks || []);
				setClicksStats(data.stats || null);
			}
		} catch (err) {
			console.error('Error fetching clicks history:', err);
		} finally {
			setClicksHistoryLoading(false);
		}
	};

	// Open clicks history modal
	const handleShowClicksHistory = () => {
		setShowClicksHistory(true);
		fetchClicksHistory();
	};

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

	// Validated completions chart data (always ≤ mintCompleted)
	const validatedChart = useMemo(() => {
		const ticks = [0, 24, 48, 72, 96, 120, 144, 168];
		const pts: CompletionPoint[] = [];
		
		// Create points up to the current elapsed time
		for (let i = 0; i < ticks.length; i++) {
			const x = ticks[i];
			if (x <= elapsedH) {
				const ratio = Math.min(1, x / Math.max(1, elapsedH));
				const y = Math.round(validatedCompletions * ratio);
				pts.push({ x, y });
			}
		}
		
		// Add current point at actual elapsed time for real-time evolution
		if (elapsedH > 0) {
			pts.push({ x: elapsedH, y: validatedCompletions });
			pts.sort((a, b) => a.x - b.x);
		}
		
		return pts;
	}, [elapsedH, validatedCompletions]);

	// Current validated point at actual elapsed time
	const currentValidatedPoint = useMemo(() => {
		if (elapsedH <= 0) return { x: 0, y: 0 };
		return { x: elapsedH, y: validatedCompletions };
	}, [elapsedH, validatedCompletions]);

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

	// Handle Community Completions click
	const handleCommunityCompletionsClick = () => {
		// Navigate to Community Completions Super-Moderator interface
		console.log('Navigating to Community Completions - Super-Moderator interface');
		window.location.href = '/mywin/community-completions';
	};

	// Handle chart click for modal
	const handleChartClick = (type: 'mint' | 'roi' | 'rewards') => {
		setChartModalType(type);
		setShowChartModal(true);
	};

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
				<span style={{ fontSize: 13 }}>Validated Completions</span>
				<input
					type="number"
					value={validatedCompletions}
					min={0}
					max={mintCompleted}
					onChange={(e) => setValidatedCompletions(Math.min(mintCompleted, Math.max(0, Number.isFinite(parseInt(e.target.value)) ? parseInt(e.target.value) : 0)))}
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
			<div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
				<h2 style={{ 
					color: '#18C964', 
					fontSize: 38, // Reduced from 44 for better spacing
					fontWeight: 900,
					margin: 0
				}}>
					Validated Campaign
				</h2>
				<button 
					onClick={handleCommunityCompletionsClick}
					style={{ 
						background: 'transparent', 
						border: '1px solid rgba(255, 214, 0, 0.4)', 
						color: 'rgba(255, 214, 0, 0.7)', 
						borderRadius: 8, 
						padding: '8px 14px', 
						fontWeight: 600,
						fontSize: 18,
						cursor: 'pointer',
						transition: 'all 0.3s ease',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = 'rgba(255, 214, 0, 0.1)';
						e.currentTarget.style.color = 'rgba(255, 214, 0, 1)';
						e.currentTarget.style.borderColor = 'rgba(255, 214, 0, 0.8)';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = 'transparent';
						e.currentTarget.style.color = 'rgba(255, 214, 0, 0.7)';
						e.currentTarget.style.borderColor = 'rgba(255, 214, 0, 0.4)';
					}}
				>
					Community Completions
				</button>
				
				{/* Short Link Section - Only for B2C/Agence B2C */}
				{(creatorType === 'FOR_B2C' || creatorType === 'B2C_AGENCIES') && (
					<div style={{ 
						display: 'flex', 
						alignItems: 'center', 
						gap: 12,
						marginLeft: 'auto',
						padding: '8px 16px',
						background: 'rgba(24, 201, 100, 0.1)',
						border: '1px solid rgba(24, 201, 100, 0.3)',
						borderRadius: 8
					}}>
						{shortLinkLoading ? (
							<span style={{ color: '#18C964', fontSize: 14 }}>Chargement du lien...</span>
						) : shortLinkError ? (
							<span style={{ color: '#FF3B30', fontSize: 14 }}>{shortLinkError}</span>
						) : shortLink ? (
							<>
								<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
									<span style={{ color: '#C0C0C0', fontSize: 12 }}>Lien de completion</span>
									<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
										<a 
											href={shortLink.shortUrl} 
											target="_blank" 
											rel="noopener noreferrer"
											style={{ 
												color: '#18C964', 
												fontSize: 14, 
												fontWeight: 600,
												textDecoration: 'none',
												fontFamily: 'monospace'
											}}
										>
											{shortLink.shortUrl}
										</a>
										<button
											onClick={handleCopyLink}
											style={{
												background: copied ? '#18C964' : 'transparent',
												border: '1px solid #18C964',
												color: copied ? '#000' : '#18C964',
												borderRadius: 6,
												padding: '4px 12px',
												fontSize: 12,
												fontWeight: 600,
												cursor: 'pointer',
												transition: 'all 0.2s'
											}}
										>
											{copied ? '✓ Copié' : 'Copier'}
										</button>
									</div>
									<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
										{shortLink.clicksCount > 0 && (
											<span style={{ color: '#C0C0C0', fontSize: 11 }}>
												{shortLink.clicksCount} clic{shortLink.clicksCount > 1 ? 's' : ''}
											</span>
										)}
										<button
											onClick={handleShowClicksHistory}
											style={{
												background: 'transparent',
												border: '1px solid #18C964',
												color: '#18C964',
												borderRadius: 4,
												padding: '2px 8px',
												fontSize: 10,
												fontWeight: 600,
												cursor: 'pointer'
											}}
										>
											📊 Stats
										</button>
									</div>
								</div>
							</>
						) : null}
					</div>
				)}
			</div>

			{/* Sub-tabs with carousel effect - spaced down for better breathing room */}
			<div style={{ display: 'flex', gap: 26, alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
				{tabs.map((t: any) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key as TabKey)}
						style={{
							background: 'transparent',
							border: 'none',
							color: tab === t.key ? '#18C964' : (t.dim ? 'rgba(24,201,100,0.4)' : '#2BAE56'),
							fontWeight: 900,
							fontSize: 20, // Reduced from 22 for better spacing
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

			<div style={{ display: 'grid', gridTemplateColumns: 'minmax(900px, 1fr) 320px', gap: 40, alignItems: 'start', marginTop: 16 }}>
				{/* Chart area */}
				<div style={{ overflow: 'hidden', marginBottom: 20 }}>
					{tab === 'mint' && (
						<ModernLineChart 
							points={chart} 
							maxY={objective} 
							maxX={168} 
							currentPoint={currentPoint}
							yAxisLabel="MINT Completions"
							isROI={false}
							onChartClick={() => handleChartClick('mint')}
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
							onChartClick={() => handleChartClick('roi')}
						/>
					)}
					{tab === 'rewards' && (
						<DualLineChart 
							mintPoints={chart} 
							validatedPoints={validatedChart}
							maxY={objective} 
							maxX={168} 
							currentMintPoint={currentPoint}
							currentValidatedPoint={currentValidatedPoint}
							yAxisLabel="Completions"
							onChartClick={() => handleChartClick('rewards')}
						/>
					)}
				</div>

				{/* Right info panel (more compact) */}
				<div>
					<div style={{ color: '#18C964', fontStyle: 'italic', fontSize: 18, marginBottom: 10 }}>{mockCampaignData.title}</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
						<button 
							onClick={() => setShowTextModal(true)}
							style={{ 
								color: '#18C964', 
								border: '2px solid #18C964', 
								borderRadius: 14, 
								padding: '6px 4px', // Reduced horizontal padding for narrower width
								textDecoration: 'none', 
								textAlign: 'center', 
								fontWeight: 800, 
								background: 'transparent', 
								cursor: 'pointer',
								fontSize: 14, // Restored original font size
								maxWidth: '180px' // Limit button width
							}}
						>
							Your Starting Text
						</button>
						<button 
							onClick={() => setShowVideoModal(true)}
							style={{ 
								color: '#18C964', 
								border: '2px solid #18C964', 
								borderRadius: 14, 
								padding: '6px 4px', // Reduced horizontal padding for narrower width
								textDecoration: 'none', 
								textAlign: 'center', 
								fontWeight: 800, 
								background: 'transparent', 
								cursor: 'pointer',
								fontSize: 14, // Restored original font size
								maxWidth: '180px' // Limit button width
							}}
						>
							Your Starting A.I. Film
						</button>
					</div>

					<div style={{ marginTop: 14, color: '#FFD600', fontWeight: 900, fontSize: 20 }}>End of Campaign in</div>
					<div style={{ color: '#FFFFFF', fontFamily: 'monospace', fontSize: 28, marginTop: 4 }}>{countdown}</div>

					<div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
						<button style={{ 
							background: 'transparent', 
							border: '2px solid #18C964', 
							color: '#18C964', 
							borderRadius: 14, 
							padding: '6px 4px', // Reduced horizontal padding for narrower width
							fontWeight: 800,
							fontSize: 14, // Restored original font size
							maxWidth: '180px' // Limit button width
						}}>
							Standard Rewards
						</button>
						<button style={{ 
							background: 'transparent', 
							border: '2px solid #FFD600', 
							color: '#FFD600', 
							borderRadius: 14, 
							padding: '6px 4px', // Reduced horizontal padding for narrower width
							fontWeight: 800,
							fontSize: 14, // Restored original font size
							maxWidth: '180px' // Limit button width
						}}>
							Premium Rewards
						</button>
						<div style={{ color: '#18C964', fontSize: 14 }}>
							<span style={{ color: '#C0C0C0' }}>Value MINT Completion</span> 
							<strong style={{ marginLeft: 6 }}>{mintPrice} $</strong>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom metrics and Top 3 */}
			<div style={{ display: 'grid', gridTemplateColumns: 'minmax(900px, 1fr) 320px', gap: 40, alignItems: 'start', marginTop: 32 }}>
				<div style={{ textAlign: 'center' }}>
					{tab === 'mint' && (
						<>
							<div style={{ color: '#2BAE56', fontWeight: 900, fontSize: 14, marginBottom: 8 }}>MINT Completed</div>
							<div style={{ color: '#18C964', fontWeight: 900, fontSize: 32, marginBottom: 12 }}>{mintCompleted}</div>
							<div style={{ color: '#FFD600', fontWeight: 900, fontSize: 18, marginTop: 6, marginBottom: 4 }}>{objective}</div>
							<div style={{ color: '#C0C0C0', fontStyle: 'italic', marginBottom: 16 }}>Your Objective MINT</div>
							<div style={{ marginTop: 6, color: '#18C964', fontWeight: 900, fontSize: 30 }}>{percent} % MINT Completion</div>
						</>
					)}
					{tab === 'roi' && (
						<>
							<div style={{ color: '#18C964', fontWeight: 900, fontSize: 18, marginBottom: 16 }}>
								{mintCompleted} MINT Completed × {mintCommunityToCompany}€ MINT Community to Company = <span style={{ color: '#FFD600' }}>+ {totalRevenue.toFixed(0)}$</span> on your Wallet connected
							</div>
							<div style={{ color: '#C0C0C0', fontSize: 14, marginTop: 8, marginBottom: 12 }}>
								Break Even Point: <span style={{ color: '#FFD600' }}>${breakEvenPoint}</span>
							</div>
							<div style={{ color: totalRevenue >= breakEvenPoint ? '#18C964' : '#FF0000', fontSize: 16, fontWeight: 800, marginTop: 4 }}>
								{totalRevenue >= breakEvenPoint ? '✅ Profitable' : '❌ Deficit'}
							</div>
						</>
					)}
					{tab === 'rewards' && (
						<>
							<div style={{ color: '#FFD600', fontWeight: 900, fontSize: 18, marginBottom: 12 }}>
								Total MINT: <span style={{ color: '#FFD600' }}>{mintCompleted}</span>
							</div>
							<div style={{ color: '#18C964', fontWeight: 900, fontSize: 18, marginBottom: 12 }}>
								Validated Rewards: <span style={{ color: '#18C964' }}>{validatedCompletions}</span>
							</div>
							<div style={{ color: '#C0C0C0', fontSize: 14, marginTop: 8, marginBottom: 10 }}>
								Validation Rate: <span style={{ color: mintCompleted > 0 ? '#FFD600' : '#C0C0C0' }}>
									{mintCompleted > 0 ? `${Math.round((validatedCompletions / mintCompleted) * 100)}%` : '0%'}
								</span>
							</div>
							<div style={{ color: validatedCompletions < mintCompleted ? '#FF8C00' : '#18C964', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
								{validatedCompletions < mintCompleted 
									? `⚠️ ${mintCompleted - validatedCompletions} completions pending validation` 
									: '✅ All completions validated'
								}
							</div>
						</>
					)}
				</div>
				<div>
					<div style={{ color: '#C0C0C0', marginBottom: 6, fontSize: 14 }}>Actual Top 3 Validated</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
						{mockCampaignData.topCompletions.map((completion, index) => (
							<div key={completion.rank}>
								<div style={{ 
									color: index === 0 ? '#FFD600' : index === 1 ? '#C0C0C0' : '#FF8C00', 
									fontWeight: 800,
									fontSize: 13 // Reduced font size as requested
								}}>
									{completion.rank === 1 ? '1st' : completion.rank === 2 ? '2nd' : '3rd'} Best Completion
								</div>
								<div style={{ color: '#C0C0C0', fontSize: 12 }}>by {completion.address}</div>
								<div style={{ color: '#18C964', fontWeight: 800, fontSize: 13 }}>{completion.score} / 100</div>
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
			
			{/* Enhanced Chart Modal */}
			<ChartModal
				isOpen={showChartModal}
				onClose={() => setShowChartModal(false)}
				points={chartModalType === 'mint' || chartModalType === 'rewards' ? chart : roiChart}
				maxY={chartModalType === 'mint' || chartModalType === 'rewards' ? objective : Math.max(maxPossibleRevenue, breakEvenPoint)}
				maxX={168}
				currentPoint={chartModalType === 'mint' || chartModalType === 'rewards' ? currentPoint : currentROIPoint}
				yAxisLabel={chartModalType === 'mint' || chartModalType === 'rewards' ? "Completions" : "Creator Profit ($)"}
				isROI={chartModalType === 'roi'}
				type={chartModalType}
				currentDay={currentDay}
				setCurrentDay={setCurrentDay}
				validatedPoints={chartModalType === 'rewards' ? validatedChart : undefined}
				currentValidatedPoint={chartModalType === 'rewards' ? currentValidatedPoint : undefined}
			/>

			{/* Clicks History Modal */}
			{showClicksHistory && (
				<div style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: 'rgba(0, 0, 0, 0.95)',
					zIndex: 1000,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					padding: 20
				}} onClick={() => setShowClicksHistory(false)}>
					<div style={{
						backgroundColor: '#000',
						borderRadius: 16,
						padding: 24,
						maxWidth: 1200,
						maxHeight: '90vh',
						border: '2px solid #18C964',
						overflow: 'auto',
						width: '100%'
					}} onClick={e => e.stopPropagation()}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
							<h3 style={{ color: '#18C964', fontSize: 24, fontWeight: 800, margin: 0 }}>
								📊 Statistiques des clics
							</h3>
							<button
								onClick={() => setShowClicksHistory(false)}
								style={{
									background: 'transparent',
									border: '2px solid #FF4444',
									color: '#FF4444',
									borderRadius: 8,
									padding: '8px 16px',
									fontWeight: 800,
									cursor: 'pointer'
								}}
							>
								✕ Fermer
							</button>
						</div>

						{clicksHistoryLoading ? (
							<div style={{ color: '#18C964', textAlign: 'center', padding: 40 }}>
								Chargement des statistiques...
							</div>
						) : clicksStats ? (
							<>
								{/* Statistiques générales */}
								<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
									<div style={{ background: 'rgba(24, 201, 100, 0.1)', padding: 16, borderRadius: 8, border: '1px solid #18C964' }}>
										<div style={{ color: '#C0C0C0', fontSize: 12, marginBottom: 4 }}>Total</div>
										<div style={{ color: '#18C964', fontSize: 24, fontWeight: 800 }}>{clicksStats.total}</div>
									</div>
									<div style={{ background: 'rgba(24, 201, 100, 0.1)', padding: 16, borderRadius: 8, border: '1px solid #18C964' }}>
										<div style={{ color: '#C0C0C0', fontSize: 12, marginBottom: 4 }}>Valides</div>
										<div style={{ color: '#18C964', fontSize: 24, fontWeight: 800 }}>{clicksStats.valid}</div>
									</div>
									<div style={{ background: 'rgba(255, 68, 68, 0.1)', padding: 16, borderRadius: 8, border: '1px solid #FF4444' }}>
										<div style={{ color: '#C0C0C0', fontSize: 12, marginBottom: 4 }}>Spam</div>
										<div style={{ color: '#FF4444', fontSize: 24, fontWeight: 800 }}>{clicksStats.spam}</div>
									</div>
								</div>

								{/* Statistiques par pays */}
								{Object.keys(clicksStats.byCountry).length > 0 && (
									<div style={{ marginBottom: 24 }}>
										<h4 style={{ color: '#FFD600', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Par pays</h4>
										<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
											{Object.entries(clicksStats.byCountry)
												.sort(([, a]: any, [, b]: any) => b - a)
												.slice(0, 10)
												.map(([country, count]: any) => (
													<div key={country} style={{ 
														background: 'rgba(255, 214, 0, 0.1)', 
														padding: '8px 12px', 
														borderRadius: 6, 
														border: '1px solid #FFD600' 
													}}>
														<span style={{ color: '#FFD600', fontWeight: 600 }}>{country}: </span>
														<span style={{ color: '#fff' }}>{count}</span>
													</div>
												))}
										</div>
									</div>
								)}

								{/* Statistiques par appareil */}
								{Object.keys(clicksStats.byDevice).length > 0 && (
									<div style={{ marginBottom: 24 }}>
										<h4 style={{ color: '#FFD600', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Par appareil</h4>
										<div style={{ display: 'flex', gap: 8 }}>
											{Object.entries(clicksStats.byDevice).map(([device, count]: any) => (
												<div key={device} style={{ 
													background: 'rgba(255, 214, 0, 0.1)', 
													padding: '8px 12px', 
													borderRadius: 6, 
													border: '1px solid #FFD600' 
												}}>
													<span style={{ color: '#FFD600', fontWeight: 600 }}>{device}: </span>
													<span style={{ color: '#fff' }}>{count}</span>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Historique détaillé */}
								<div>
									<h4 style={{ color: '#FFD600', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Historique détaillé</h4>
									<div style={{ maxHeight: 400, overflow: 'auto' }}>
										<table style={{ width: '100%', borderCollapse: 'collapse' }}>
											<thead>
												<tr style={{ borderBottom: '1px solid #333' }}>
													<th style={{ color: '#18C964', padding: 12, textAlign: 'left', fontSize: 12 }}>Date/Heure</th>
													<th style={{ color: '#18C964', padding: 12, textAlign: 'left', fontSize: 12 }}>Pays</th>
													<th style={{ color: '#18C964', padding: 12, textAlign: 'left', fontSize: 12 }}>Appareil</th>
													<th style={{ color: '#18C964', padding: 12, textAlign: 'left', fontSize: 12 }}>Référent</th>
													<th style={{ color: '#18C964', padding: 12, textAlign: 'left', fontSize: 12 }}>Wallet</th>
													<th style={{ color: '#18C964', padding: 12, textAlign: 'left', fontSize: 12 }}>Statut</th>
												</tr>
											</thead>
											<tbody>
												{clicksHistory.slice(0, 50).map((click: any) => (
													<tr key={click.id} style={{ borderBottom: '1px solid #222' }}>
														<td style={{ color: '#fff', padding: 12, fontSize: 12 }}>
															{new Date(click.clicked_at).toLocaleString('fr-FR')}
														</td>
														<td style={{ color: '#fff', padding: 12, fontSize: 12 }}>
															{click.country_code || '-'}
														</td>
														<td style={{ color: '#fff', padding: 12, fontSize: 12 }}>
															{click.device_type || '-'}
														</td>
														<td style={{ color: '#fff', padding: 12, fontSize: 12 }}>
															{click.referrer ? (() => {
																try {
																	const url = new URL(click.referrer);
																	return url.hostname;
																} catch {
																	return 'Direct';
																}
															})() : 'Direct'}
														</td>
														<td style={{ color: '#fff', padding: 12, fontSize: 12, fontFamily: 'monospace' }}>
															{click.wallet_address ? `${click.wallet_address.slice(0, 6)}...${click.wallet_address.slice(-4)}` : '-'}
														</td>
														<td style={{ padding: 12, fontSize: 12 }}>
															{click.is_spam ? (
																<span style={{ color: '#FF4444' }}>⚠️ Spam</span>
															) : (
																<span style={{ color: '#18C964' }}>✅ Valide</span>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</>
						) : (
							<div style={{ color: '#C0C0C0', textAlign: 'center', padding: 40 }}>
								Aucune statistique disponible pour le moment
							</div>
						)}
					</div>
				</div>
			)}

			{/* Dev controls pour ce dashboard */}
			<DevControls 
				onForceValidated={onForceValidated}
				forceValidated={forceValidated}
				additionalControls={additionalControls} 
			/>
		</div>
	);
}
