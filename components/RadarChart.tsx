"use client";

import { useMemo, useState } from 'react';

interface ModeratorScore {
  stakerId: string;
  stakerName: string;
  score: number; // 0-100
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
  const labelRadius = maxRadius + 35; // Keep same gap - labels stay in same position
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);

  // Generate points for each moderator score
  const radarPoints = useMemo(() => {
    const points = moderatorScores.map((moderator, index) => {
      const angle = (index / moderatorScores.length) * 2 * Math.PI - Math.PI / 2; // Start from top
      const radius = (moderator.score / 100) * maxRadius;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      
      // Label position (outside the radar)
      const labelX = center + Math.cos(angle) * labelRadius;
      const labelY = center + Math.sin(angle) * labelRadius;
      
      // Determine score category
      const scoreCategory = getScoreCategory(moderator.score);
      
      return {
        x,
        y,
        labelX,
        labelY,
        angle,
        moderator,
        index,
        scoreCategory,
        radius // Store the actual radius for path creation
      };
    });
    return points;
  }, [moderatorScores, center, maxRadius, labelRadius]);

  // Create gradients for each segment between consecutive points
  const segmentGradients = useMemo(() => {
    return radarPoints.map((point, index) => {
      const nextIndex = (index + 1) % radarPoints.length;
      const nextPoint = radarPoints[nextIndex];
      
      const currentCategory = point.scoreCategory;
      const nextCategory = nextPoint.scoreCategory;
      
      let gradientId = `gradient-${index}`;
      let startColor = getScoreColor(currentCategory);
      let endColor = getScoreColor(nextCategory);
      
      return {
        id: gradientId,
        startColor,
        endColor,
        x1: point.x,
        y1: point.y,
        x2: nextPoint.x,
        y2: nextPoint.y
      };
    });
  }, [radarPoints]);

  // Create path segments with individual gradients
  const radarSegments = useMemo(() => {
    if (radarPoints.length === 0) return [];
    
    return radarPoints.map((point, index) => {
      const nextIndex = (index + 1) % radarPoints.length;
      const nextPoint = radarPoints[nextIndex];
      
      return {
        path: `M ${center} ${center} L ${point.x} ${point.y} L ${nextPoint.x} ${nextPoint.y} Z`,
        gradientId: `gradient-${index}`
      };
    });
  }, [radarPoints, center]);

  // Create grid circles
  const gridCircles = [0.2, 0.4, 0.6, 0.8, 1.0].map(ratio => ratio * maxRadius);

  // Create grid lines from center to each moderator position
  const gridLines = radarPoints.map(point => ({
    x1: center,
    y1: center,
    x2: center + Math.cos(point.angle) * maxRadius,
    y2: center + Math.sin(point.angle) * maxRadius
  }));

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
      style={{ 
        width: size + 60, // Reduced from 80 back to 60 since no side AVG bubble needed
        height: size + 200, // Increased from 180 to 200 for even more vertical space
        position: 'relative',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 0.2s ease'
      }}
      onClick={isClickable ? onClick : undefined}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'scale(1.02)';
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'scale(1)';
        }
        setHoveredPoint(null); // Clear hover when leaving the chart
      }}
    >
      <svg 
        width={size + 60} 
        height={size + 80} // Increased height for better label visibility
        viewBox={`0 0 ${size + 60} ${size + 80}`} // Enlarged viewBox to give more space for labels
        style={{ position: 'absolute', top: 80, left: 0 }} // Reduced back to 80px since we're giving more space in viewBox
      >
        {/* Define gradients for each segment */}
        <defs>
          {segmentGradients.map((gradient) => (
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

        {/* Radar segments with gradients */}
        {radarSegments.map((segment, index) => {
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

        {/* Radar border with gradient strokes */}
        {radarPoints.map((point, index) => {
          const nextIndex = (index + 1) % radarPoints.length;
          const nextPoint = radarPoints[nextIndex];
          const gradient = segmentGradients[index];
          
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
        })}

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
              }}
              onMouseLeave={(e) => {
                e.stopPropagation(); // Prevent bubbling
                setHoveredPoint(null);
              }}
            />
          </g>
        ))}

        {/* Labels - only show if not too many moderators */}
        {shouldShowLabels && radarPoints.map((point, index) => (
          <g key={`label-${index}`}>
            {/* Moderator number label - simplified to just the number */}
            <text
              x={point.labelX + 30}
              y={point.labelY + 40 - (shouldShowScore ? 10 : 3)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#FFD600"
              fontSize={moderatorScores.length > 20 ? 12 : 15} // Increased font sizes
              fontWeight={900} // Maximum boldness
              style={{ 
                pointerEvents: 'none',
                textShadow: '0 0 3px rgba(0,0,0,0.8)' // Add text shadow for better visibility
              }}
            >
              {point.moderator.stakerId}
            </text>
            {/* Score label - only show if not too many moderators */}
            {shouldShowScore && (
              <text
                x={point.labelX + 30}
                y={point.labelY + 40 + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={getScoreColor(point.scoreCategory)}
                fontSize={17} // Increased from 16
                fontWeight={900} // Maximum boldness
                style={{ 
                  pointerEvents: 'none',
                  textShadow: '0 0 3px rgba(0,0,0,0.8)' // Add text shadow for better visibility
                }}
              >
                {point.moderator.score}
              </text>
            )}
          </g>
        ))}
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
          transform: hoveredPoint.x > size - 60 ? 'translateX(-100%)' : 'translateX(0)', // Adjusted for new dimensions
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ color: '#FFD600', fontSize: 11, marginBottom: 2 }}>
            Staker {hoveredPoint.moderator.stakerId}
          </div>
          <div style={{ 
            color: getScoreColor(hoveredPoint.scoreCategory), 
            fontSize: 14, 
            fontWeight: 800 
          }}>
            {hoveredPoint.moderator.score} / 100
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

      {/* Click indicator - repositioned to not interfere */}
      {isClickable && (
        <div style={{
          position: 'absolute',
          top: 30, // Moved down more to avoid obstruction
          right: 20, // Positioned well away from labels
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #FFD600',
          borderRadius: 8,
          padding: '4px 8px',
          fontSize: 11,
          color: '#FFD600',
          fontWeight: 600,
          pointerEvents: 'none'
        }}>
          🔍 Click to expand
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