"use client";

import { useMemo, useState, useRef } from 'react';

interface ModeratorScore {
  stakerId: string;
  stakerName: string;
  score: number; // 0-100
  stakedAmount: number; // Amount staked by this moderator in WINC
}

interface RadarChartProps {
  moderatorScores: ModeratorScore[];
  size?: number;
  showLabels?: boolean;
  onClick?: () => void;
  isClickable?: boolean;
}

interface HoveredPoint {
  moderator: ModeratorScore;
  x: number;
  y: number;
  scoreCategory: 'refused' | 'medium' | 'good';
}

// Helper function to get score category and color
function getScoreCategory(score: number): 'refused' | 'medium' | 'good' {
  if (score === 0) return 'refused';
  if (score <= 50) return 'medium';
  return 'good';
}

function getScoreColor(category: 'refused' | 'medium' | 'good'): string {
  switch (category) {
    case 'refused': return '#FF3B30'; // Red
    case 'medium': return '#FF9500'; // Orange
    case 'good': return '#18C964'; // Green
  }
}

export default function RadarChart({ moderatorScores, size = 400, showLabels = true, onClick, isClickable = false }: RadarChartProps) {
  const center = size / 2;
  const maxRadius = (size * 0.48); // Increased from 44% to 48% - radar chart closer to staker numbers
  const labelRadius = maxRadius + 18; // Reduced gap to bring labels nearer the outer circle
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);
  const [hoveredRefusedGroup, setHoveredRefusedGroup] = useState<ModeratorScore[] | null>(null);
  const radarContainerRef = useRef<HTMLDivElement>(null);

  // Separate refused moderators (score = 0) and others
  const refusedModerators = useMemo(() => {
    return moderatorScores.filter(mod => mod.score === 0);
  }, [moderatorScores]);

  const validatedModerators = useMemo(() => {
    return moderatorScores.filter(mod => mod.score > 0);
  }, [moderatorScores]);

  // Generate points for each moderator score (excluding refused ones - they'll be handled separately)
  const radarPoints = useMemo(() => {
    const points = [];
    moderatorScores.forEach((moderator, originalIndex) => {
      // Only create points for validated moderators (score > 0)
      if (moderator.score > 0) {
        // Use the original index to maintain position consistency with labels
        const angle = (originalIndex / moderatorScores.length) * 2 * Math.PI - Math.PI / 2; // Start from top
        const radius = (moderator.score / 100) * maxRadius;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        
        // Label position (outside the radar)
        const labelX = center + Math.cos(angle) * labelRadius;
        const labelY = center + Math.sin(angle) * labelRadius;
        
        // Determine score category
        const scoreCategory = getScoreCategory(moderator.score);
        
        points.push({
          x,
          y,
          labelX,
          labelY,
          angle,
          moderator,
          originalIndex, // Store the original index for consistency
          scoreCategory,
          radius // Store the actual radius for path creation
        });
      }
    });
    return points;
  }, [moderatorScores, center, maxRadius, labelRadius]);

  // Create gradients for each segment between consecutive validated points
  const segmentGradients = useMemo(() => {
    const gradients = [];
    
    for (let i = 0; i < radarPoints.length; i++) {
      const currentPoint = radarPoints[i];
      const nextIndex = (i + 1) % radarPoints.length;
      const nextPoint = radarPoints[nextIndex];
      
      // Check if the two points are actually consecutive in the original moderator list
      const currentOriginalIndex = currentPoint.originalIndex;
      const nextOriginalIndex = nextPoint.originalIndex;
      
      // Calculate if they are consecutive (considering wrap-around)
      const isConsecutive = 
        (nextOriginalIndex === currentOriginalIndex + 1) || // Normal consecutive
        (currentOriginalIndex === moderatorScores.length - 1 && nextOriginalIndex === 0) || // Wrap around case
        // Check if all moderators between them are also validated (no refused in between)
        (() => {
          if (nextOriginalIndex < currentOriginalIndex) {
            // Wrap around case - check from current to end, then from 0 to next
            for (let j = currentOriginalIndex + 1; j < moderatorScores.length; j++) {
              if (moderatorScores[j].score === 0) return false;
            }
            for (let j = 0; j < nextOriginalIndex; j++) {
              if (moderatorScores[j].score === 0) return false;
            }
            return true;
          } else {
            // Normal case - check all between current and next
            for (let j = currentOriginalIndex + 1; j < nextOriginalIndex; j++) {
              if (moderatorScores[j].score === 0) return false;
            }
            return true;
          }
        })();
      
      // Only create gradient if points are truly consecutive
      if (isConsecutive) {
        const currentCategory = currentPoint.scoreCategory;
        const nextCategory = nextPoint.scoreCategory;
        
        gradients.push({
          id: `gradient-${i}`,
          startColor: getScoreColor(currentCategory),
          endColor: getScoreColor(nextCategory),
          x1: currentPoint.x,
          y1: currentPoint.y,
          x2: nextPoint.x,
          y2: nextPoint.y,
          shouldRender: true
        });
      } else {
        // Create a placeholder gradient but mark it as not to render
        gradients.push({
          id: `gradient-${i}`,
          startColor: '#000000',
          endColor: '#000000',
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0,
          shouldRender: false
        });
      }
    }
    
    return gradients;
  }, [radarPoints, moderatorScores]);

  // Create path segments with individual gradients
  const radarSegments = useMemo(() => {
    if (radarPoints.length === 0) return [];
    
    return radarPoints.map((point, index) => {
      const nextIndex = (index + 1) % radarPoints.length;
      const nextPoint = radarPoints[nextIndex];
      const gradient = segmentGradients[index];
      
      return {
        path: `M ${center} ${center} L ${point.x} ${point.y} L ${nextPoint.x} ${nextPoint.y} Z`,
        gradientId: `gradient-${index}`,
        shouldRender: gradient?.shouldRender || false
      };
    });
  }, [radarPoints, center, segmentGradients]);

  // Create grid circles
  const gridCircles = [0.2, 0.4, 0.6, 0.8, 1.0].map(ratio => ratio * maxRadius);

  // Create grid lines from center to each moderator position (ALL moderators, not just validated ones)
  const gridLines = moderatorScores.map((_, index) => {
    const angle = (index / moderatorScores.length) * 2 * Math.PI - Math.PI / 2; // Start from top
    return {
      x1: center,
      y1: center,
      x2: center + Math.cos(angle) * maxRadius,
      y2: center + Math.sin(angle) * maxRadius
    };
  });

  // Calculate average score for external display
  const averageScore = useMemo(() => {
    if (moderatorScores.length === 0) return 0;
    return Math.round(moderatorScores.reduce((sum, mod) => sum + mod.score, 0) / moderatorScores.length);
  }, [moderatorScores]);

  // Determine how to show labels based on number of moderators
  const shouldShowLabels = showLabels && moderatorScores.length <= 30; // Only show labels if <= 30 moderators
  const shouldShowScore = moderatorScores.length <= 15; // Only show individual scores if <= 15 moderators

  if (moderatorScores.length === 0) {
    return (
      <div style={{ 
        width: size, 
        height: size, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#C0C0C0',
        fontSize: 18
      }}>
        No moderator scores available
      </div>
    );
  }

  return (
    <div 
      ref={radarContainerRef}
      style={{ 
        width: size + 60, // Reduced from 80 back to 60 since no side AVG bubble needed
        height: size + 200, // Increased from 180 to 200 for even more vertical space
        position: 'relative',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 0.2s ease'
      }}
      onClick={isClickable ? onClick : undefined}
      onMouseLeave={(e) => {
        setHoveredPoint(null); // Clear hover when leaving the chart
        setHoveredRefusedGroup(null); // Clear refused group hover when leaving the chart
      }}
    >
      <svg 
        width={size + 60} 
        height={size + 80} // Increased height for better label visibility
        viewBox={`0 0 ${size + 60} ${size + 80}`} // Enlarged viewBox to give more space for labels
        style={{ position: 'absolute', top: 80, left: 0 }} // Reduced back to 80px since we're giving more space in viewBox
      >
        {/* Define gradients for each segment - only for consecutive segments */}
        <defs>
          {segmentGradients.filter(gradient => gradient.shouldRender).map((gradient) => (
            <linearGradient
              key={gradient.id}
              id={gradient.id}
              x1={gradient.x1 + 30} // Increased offset from 20 to 30
              y1={gradient.y1 + 40} // Increased offset from 30 to 40 for more top space
              x2={gradient.x2 + 30}
              y2={gradient.y2 + 40}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={gradient.startColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={gradient.endColor} stopOpacity="0.3" />
            </linearGradient>
          ))}
        </defs>

        {/* Background grid circles */}
        {gridCircles.map((radius, index) => (
          <circle
            key={`grid-${index}`}
            cx={center + 30} // Increased offset from 20 to 30
            cy={center + 40} // Increased offset from 30 to 40 for more top space
            r={radius}
            fill="none"
            stroke="#333"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
        ))}

        {/* Grid lines */}
        {gridLines.map((line, index) => (
          <line
            key={`line-${index}`}
            x1={line.x1 + 30}
            y1={line.y1 + 40}
            x2={line.x2 + 30}
            y2={line.y2 + 40}
            stroke="#333"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
        ))}

        {/* Radar segments with gradients - only for consecutive segments */}
        {radarSegments.filter(segment => segment.shouldRender).map((segment, index) => {
          // Adjust path coordinates for SVG offset
          const adjustedPath = segment.path
            .replace(/M (\d+\.?\d*) (\d+\.?\d*)/g, (match, x, y) => `M ${parseFloat(x) + 30} ${parseFloat(y) + 40}`)
            .replace(/L (\d+\.?\d*) (\d+\.?\d*)/g, (match, x, y) => ` L ${parseFloat(x) + 30} ${parseFloat(y) + 40}`);
            
          return (
            <path
              key={`segment-${index}`}
              d={adjustedPath}
              fill={`url(#${segment.gradientId})`}
            />
          );
        })}

        {/* Radar border with gradient strokes - only for consecutive segments */}
        {radarPoints.map((point, index) => {
          const nextIndex = (index + 1) % radarPoints.length;
          const nextPoint = radarPoints[nextIndex];
          const gradient = segmentGradients[index];
          
          // Only render border if the gradient should be rendered (consecutive points)
          if (!gradient.shouldRender) return null;
          
          return (
            <line
              key={`border-${index}`}
              x1={point.x + 30}
              y1={point.y + 40}
              x2={nextPoint.x + 30}
              y2={nextPoint.y + 40}
              stroke={gradient.startColor === gradient.endColor ? gradient.startColor : `url(#${gradient.id})`}
              strokeWidth={2}
            />
          );
        }).filter(Boolean)}

        {/* Score points with hover functionality */}
        {radarPoints.map((point, index) => (
          <g key={`point-${index}`}>
            {/* Enhanced glow effect */}
            <circle
              cx={point.x + 30}
              cy={point.y + 40}
              r={point.scoreCategory === 'refused' ? 14 : 10} // Larger glow for refused points
              fill={`${getScoreColor(point.scoreCategory)}30`} // 30 in hex = ~20% opacity
            />
            
            {/* Main point */}
            <circle
              cx={point.x + 30}
              cy={point.y + 40}
              r={point.scoreCategory === 'refused' ? 7 : 5} // Larger point for refused
              fill={getScoreColor(point.scoreCategory)}
              stroke="#fff"
              strokeWidth={point.scoreCategory === 'refused' ? 3 : 2} // Thicker border for refused
              style={{ 
                filter: hoveredPoint?.moderator.stakerId === point.moderator.stakerId ? 'drop-shadow(0 0 10px currentColor)' : 'none',
                transform: hoveredPoint?.moderator.stakerId === point.moderator.stakerId ? 'scale(1.4)' : 'scale(1)',
                transformOrigin: `${point.x + 30}px ${point.y + 40}px`,
                transition: 'all 0.2s ease'
              }}
            />

            {/* Large hover area (must be last to be on top) */}
            <circle
              cx={point.x + 30}
              cy={point.y + 40}
              r={25} // Larger hover area
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.stopPropagation(); // Prevent bubbling
                setHoveredPoint({
                  moderator: point.moderator,
                  x: point.x + 30,
                  y: point.y + 40,
                  scoreCategory: point.scoreCategory
                });
                setHoveredRefusedGroup(null); // Clear refused group hover
              }}
              onMouseLeave={(e) => {
                e.stopPropagation(); // Prevent bubbling
                setHoveredPoint(null);
              }}
            />
          </g>
        ))}

        {/* Central refused group point - only show if there are refused moderators */}
        {refusedModerators.length > 0 && (
          <g key="refused-group">
            {/* Enhanced glow effect for refused group */}
            <circle
              cx={center + 30}
              cy={center + 40}
              r={18 + refusedModerators.length * 2} // Larger glow based on number of refuses
              fill="rgba(255, 59, 48, 0.4)" // Red glow
            />
            
            {/* Main refused group point */}
            <circle
              cx={center + 30}
              cy={center + 40}
              r={8 + refusedModerators.length} // Larger point based on number of refuses
              fill="#FF3B30"
              stroke="#fff"
              strokeWidth={4}
              style={{ 
                filter: hoveredRefusedGroup ? 'drop-shadow(0 0 12px #FF3B30)' : 'none',
                transform: hoveredRefusedGroup ? 'scale(1.4)' : 'scale(1)',
                transformOrigin: `${center + 30}px ${center + 40}px`,
                transition: 'all 0.2s ease'
              }}
            />

            {/* Badge showing number of refuses */}
            <circle
              cx={center + 30 + 12}
              cy={center + 40 - 12}
              r={8}
              fill="#FF3B30"
              stroke="#fff"
              strokeWidth={2}
            />
            <text
              x={center + 30 + 12}
              y={center + 40 - 12}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize={10}
              fontWeight={900}
              style={{ pointerEvents: 'none' }}
            >
              {refusedModerators.length}
            </text>

            {/* Large hover area for refused group */}
            <circle
              cx={center + 30}
              cy={center + 40}
              r={30} // Large hover area
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                setHoveredRefusedGroup(refusedModerators);
                setHoveredPoint(null); // Clear individual point hover
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                setHoveredRefusedGroup(null);
              }}
            />
          </g>
        )}

        {/* Labels - only show if not too many moderators */}
        {shouldShowLabels && moderatorScores.map((moderator, index) => {
          // Calculate position for all moderators (including refused ones)
          const angle = (index / moderatorScores.length) * 2 * Math.PI - Math.PI / 2; // Start from top
          const labelX = center + Math.cos(angle) * labelRadius;
          const labelY = center + Math.sin(angle) * labelRadius;
          
          const scoreCategory = getScoreCategory(moderator.score);
          const isRefused = moderator.score === 0;
          
          return (
            <g key={`label-${index}`}>
              {/* Moderator number label - show for ALL moderators, but in red for refused ones */}
              <text
                x={labelX + 30}
                y={labelY + 40 - (shouldShowScore && !isRefused ? 8 : 2)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isRefused ? "#FF3B30" : "#FFD600"} // Red for refused, yellow for others
                fontSize={moderatorScores.length > 20 ? 12 : 15} // Increased font sizes
                fontWeight={900} // Maximum boldness
                style={{ 
                  pointerEvents: 'none',
                  textShadow: `0 0 3px rgba(0,0,0,0.8)` // Add text shadow for better visibility
                }}
              >
                {moderator.stakerId}
              </text>
              {/* Score label - only show for non-refused moderators and if not too many */}
              {shouldShowScore && !isRefused && (
                <text
                  x={labelX + 30}
                  y={labelY + 40 + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={getScoreColor(scoreCategory)}
                  fontSize={17} // Increased from 16
                  fontWeight={900} // Maximum boldness
                  style={{ 
                    pointerEvents: 'none',
                    textShadow: '0 0 3px rgba(0,0,0,0.8)' // Add text shadow for better visibility
                  }}
                >
                  {moderator.score}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip */}
      {hoveredPoint && (
        <div style={{
          position: 'absolute',
          left: hoveredPoint.x + 15,
          top: hoveredPoint.y - 45,
          background: 'rgba(0, 0, 0, 0.95)',
          border: `2px solid ${getScoreColor(hoveredPoint.scoreCategory)}`,
          borderRadius: 8,
          padding: '8px 12px',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          zIndex: 100,
          pointerEvents: 'none',
          transform: hoveredPoint.x > size - 60 ? 'translateX(-100%)' : 'translateX(0)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ color: '#FFD600', fontSize: 11, marginBottom: 2 }}>
            Staker {hoveredPoint.moderator.stakerId}
          </div>
          <div style={{ 
            color: getScoreColor(hoveredPoint.scoreCategory), 
            fontSize: 14, 
            fontWeight: 800,
            marginBottom: 2
          }}>
            {hoveredPoint.moderator.score} / 100
          </div>
          <div style={{ 
            color: '#888', 
            fontSize: 10, 
            marginBottom: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span>💰</span>
            <span style={{ color: '#FFD600' }}>{hoveredPoint.moderator.stakedAmount?.toLocaleString() || 0} WINC</span>
          </div>
          <div style={{ 
            color: getScoreColor(hoveredPoint.scoreCategory), 
            fontSize: 10, 
            marginTop: 2 
          }}>
            {hoveredPoint.scoreCategory === 'refused' ? '❌ Refused' : 
             hoveredPoint.scoreCategory === 'medium' ? '🟠 Medium' : '✅ Validated'}
          </div>
        </div>
      )}

      {/* Grouped Refused Tooltip */}
      {hoveredRefusedGroup && (
        <div style={{
          position: 'absolute',
          left: (center + 30) + 15,
          top: (center + 40) - 60,
          background: 'rgba(0, 0, 0, 0.95)',
          border: '2px solid #FF3B30',
          borderRadius: 8,
          padding: '8px 12px',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          zIndex: 100,
          pointerEvents: 'none',
          transform: (center + 30) > size - 150 ? 'translateX(-100%)' : 'translateX(0)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          maxWidth: '200px'
        }}>
          <div style={{ color: '#FF3B30', fontSize: 11, marginBottom: 4, fontWeight: 800 }}>
            {hoveredRefusedGroup.length} Staker{hoveredRefusedGroup.length > 1 ? 's' : ''} Refused
          </div>
          {hoveredRefusedGroup.map((moderator, index) => (
            <div key={moderator.stakerId} style={{ 
              marginBottom: index < hoveredRefusedGroup.length - 1 ? 6 : 0,
              padding: '4px 0'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 2
              }}>
                <span style={{ color: '#FFD600', fontSize: 11 }}>
                  Staker {moderator.stakerId}
                </span>
                <span style={{ color: '#FF3B30', fontSize: 11, fontWeight: 800 }}>
                  ❌ 0/100
                </span>
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                fontSize: 10,
                color: '#888'
              }}>
                <span>💰</span>
                <span style={{ color: '#FFD600' }}>{moderator.stakedAmount?.toLocaleString() || 0} WINC</span>
              </div>
            </div>
          ))}
          <div style={{ 
            marginTop: 6, 
            paddingTop: 4, 
            borderTop: '1px solid rgba(255, 59, 48, 0.3)', 
            color: '#FF3B30', 
            fontSize: 10,
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            All refused completion
          </div>
        </div>
      )}

      {/* Click indicator - repositioned to not interfere */}
      {isClickable && (
        <div style={{
          position: 'absolute',
          top: 30, // Moved down more to avoid obstruction
          right: 20, // Positioned well away from labels
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: 8,
          padding: '8px 10px',
          fontSize: 11,
          color: '#FFD600',
          fontWeight: 600,
          pointerEvents: 'auto',
          cursor: 'pointer'
        }}
        onMouseEnter={() => {
          // Zoomer le RadarChart entier via la référence
          if (radarContainerRef.current) {
            radarContainerRef.current.style.transform = 'scale(1.02)';
          }
        }}
        onMouseLeave={() => {
          // Remettre le RadarChart à sa taille normale
          if (radarContainerRef.current) {
            radarContainerRef.current.style.transform = 'scale(1)';
          }
        }}
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

      {/* Info indicator for many moderators */}
      {moderatorScores.length > 30 && (
        <div style={{
          position: 'absolute',
          bottom: 20, // Positioned at bottom since no AVG bubble
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #C0C0C0',
          borderRadius: 8,
          padding: '4px 8px',
          fontSize: 11,
          color: '#C0C0C0',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          {moderatorScores.length} moderators • Hover points for scores
        </div>
      )}
    </div>
  );
} 