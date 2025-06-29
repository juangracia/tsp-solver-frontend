import React, { useMemo, useState, useEffect } from 'react';
import type { TSPSolution, Point } from '../types/tsp';

interface TSPVisualizationSVGProps {
  solution: TSPSolution | null;
  showRoute: boolean;
  className?: string;
  selectedOriginalPoint?: number | null;
  selectedRoutePoint?: number | null;
}

const TSPVisualizationSVG: React.FC<TSPVisualizationSVGProps> = ({
  solution,
  showRoute,
  className = '',
  selectedOriginalPoint = null,
  selectedRoutePoint = null,
}) => {
  // Check if dark mode is enabled
  const isDarkMode = () => document.documentElement.getAttribute('data-theme') === 'dark';
  const [darkMode, setDarkMode] = useState(isDarkMode());
  
  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(isDarkMode());
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
    return () => observer.disconnect();
  }, []);

  const calculateDistance = (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const { scaledPoints, scaledRoute, bounds, routeDistances } = useMemo(() => {
    if (!solution) return { scaledPoints: [], scaledRoute: [], bounds: null, routeDistances: [] };

    const points = Array.isArray(solution.originalPoints) ? solution.originalPoints : [];
    const route = Array.isArray(solution.route) ? solution.route : [];

    if (points.length === 0) return { scaledPoints: [], scaledRoute: [], bounds: null, routeDistances: [] };

    // Calculate distances for each segment in the original coordinate system
    const distances = route.length > 1 ? route.map((current, i) => {
      const next = route[(i + 1) % route.length];
      return calculateDistance(current, next);
    }) : [];

    // Calculate bounds
    const xCoords = points.map(p => p.x);
    const yCoords = points.map(p => p.y);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);

    // SVG dimensions
    const svgWidth = 800;
    const svgHeight = 600;
    const padding = 60;

    // Calculate scale
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const scaleX = (svgWidth - 2 * padding) / rangeX;
    const scaleY = (svgHeight - 2 * padding) / rangeY;
    const scale = Math.min(scaleX, scaleY);

    // Center the visualization
    const offsetX = (svgWidth - rangeX * scale) / 2 - minX * scale;
    const offsetY = (svgHeight - rangeY * scale) / 2 - minY * scale;

    const scalePoint = (point: Point) => ({
      x: point.x * scale + offsetX,
      y: svgHeight - (point.y * scale + offsetY), // Flip Y axis
    });

    return {
      scaledPoints: points.map(scalePoint),
      scaledRoute: route.map(scalePoint),
      bounds: { minX, maxX, minY, maxY, scale, offsetX, offsetY, svgWidth, svgHeight },
      routeDistances: distances
    };
  }, [solution]);

  if (!solution) {
    return (
      <div className={`flex items-center justify-center rounded-lg ${className}`} style={{ background: 'var(--color-bg-card-hover)' }}>
        <div className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="text-4xl mb-4">🗺️</div>
          <div>Upload a file to see the visualization</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border shadow-sm ${className}`} style={{ background: 'var(--color-bg-card)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Route Visualization ({solution.pointCount} points)
        </h3>
        {solution.route && (
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Start point
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Other points
            </div>
            {showRoute && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <div className="w-8 h-0.5 bg-red-500"></div>
                Route with arrows
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <svg
          viewBox={`0 0 ${bounds?.svgWidth || 800} ${bounds?.svgHeight || 600}`}
          className="w-full h-auto border rounded"
          style={{ 
            borderColor: 'var(--color-border)',
            background: darkMode ? '#1e293b' : '#ffffff'
          }}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="80" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M 80 0 L 0 0 0 60"
                fill="none"
                stroke={darkMode ? '#334155' : '#f3f4f6'}
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            </pattern>
            
            {/* Arrow marker */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#ef4444"
              />
            </marker>
          </defs>

          {/* Grid background */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Axis labels */}
          <text
            x={bounds?.svgWidth ? bounds.svgWidth / 2 : 400}
            y={bounds?.svgHeight ? bounds.svgHeight - 10 : 590}
            textAnchor="middle"
            fontSize="12"
            fill={darkMode ? '#94a3b8' : '#6b7280'}
          >
            X Coordinate
          </text>
          <text
            x="15"
            y={bounds?.svgHeight ? bounds.svgHeight / 2 : 300}
            textAnchor="middle"
            fontSize="12"
            fill={darkMode ? '#94a3b8' : '#6b7280'}
            transform={`rotate(-90 15 ${bounds?.svgHeight ? bounds.svgHeight / 2 : 300})`}
          >
            Y Coordinate
          </text>

          {/* Route lines with arrows and numbers */}
          {showRoute && scaledRoute.length > 1 && (
            <g>
              {scaledRoute.map((current, i) => {
                const next = scaledRoute[(i + 1) % scaledRoute.length];
                const midX = current.x + (next.x - current.x) * 0.5;
                const midY = current.y + (next.y - current.y) * 0.5;
                
                // Calculate perpendicular offset for labels positioning
                const lineAngle = Math.atan2(next.y - current.y, next.x - current.x);
                const perpAngle = lineAngle + Math.PI / 2;
                const offsetDistance = 25;
                const offsetX = Math.cos(perpAngle) * offsetDistance;
                const offsetY = Math.sin(perpAngle) * offsetDistance;

                const distance = routeDistances[i];

                return (
                  <g key={i}>
                    {/* Route line */}
                    <line
                      x1={current.x}
                      y1={current.y}
                      x2={next.x}
                      y2={next.y}
                      stroke="#ef4444"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    
                    {/* Route order number */}
                    <text
                      x={midX + offsetX}
                      y={midY + offsetY - 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="13"
                      fontWeight="bold"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="3"
                      paintOrder="stroke"
                    >
                      {i + 1}
                    </text>
                    
                    {/* Distance label */}
                    <text
                      x={midX + offsetX}
                      y={midY + offsetY + 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fontWeight="normal"
                      fill="#059669"
                      stroke="#ffffff"
                      strokeWidth="2"
                      paintOrder="stroke"
                    >
                      {distance ? distance.toFixed(1) : '0.0'}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Points */}
          {scaledPoints.map((point, index) => {
            const originalPoint = solution?.originalPoints?.[index];
            const isSelectedOriginal = selectedOriginalPoint === index;
            
            return (
              <g key={index}>
                {/* Highlight ring for selected original point */}
                {isSelectedOriginal && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="12"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="4,2"
                    opacity="0.8"
                  />
                )}
                
                {/* Point circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isSelectedOriginal ? "8" : "6"}
                  fill={index === 0 ? '#22c55e' : '#3b82f6'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  opacity={isSelectedOriginal ? "1" : "0.9"}
                />
                
                {/* START label for first point */}
                {index === 0 && (
                  <text
                    x={point.x}
                    y={point.y - 25}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#22c55e"
                    stroke="#ffffff"
                    strokeWidth="2"
                    paintOrder="stroke"
                  >
                    START
                  </text>
                )}
                
                {/* Coordinate label for each point */}
                {originalPoint && (
                  <text
                    x={point.x}
                    y={point.y + (index === 0 ? 20 : 20)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isSelectedOriginal ? "10" : "9"}
                    fontWeight={isSelectedOriginal ? "bold" : "normal"}
                    fill={isSelectedOriginal ? "#3b82f6" : "#374151"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    paintOrder="stroke"
                  >
                    ({originalPoint.x.toFixed(1)}, {originalPoint.y.toFixed(1)})
                  </text>
                )}
                
                {/* Point number for selected original point */}
                {isSelectedOriginal && (
                  <text
                    x={point.x}
                    y={point.y + 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#ffffff"
                  >
                    {index + 1}
                  </text>
                )}
              </g>
            );
          })}

          {/* Route points highlighting */}
          {showRoute && selectedRoutePoint !== null && scaledRoute[selectedRoutePoint] && (
            <g>
              {/* Highlight ring for selected route point */}
              <circle
                cx={scaledRoute[selectedRoutePoint].x}
                cy={scaledRoute[selectedRoutePoint].y}
                r="15"
                fill="none"
                stroke="#22c55e"
                strokeWidth="4"
                strokeDasharray="6,3"
                opacity="0.8"
              />
              
              {/* Route point indicator */}
              <text
                x={scaledRoute[selectedRoutePoint].x}
                y={scaledRoute[selectedRoutePoint].y - 30}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#22c55e"
                stroke="#ffffff"
                strokeWidth="2"
                paintOrder="stroke"
              >
                ROUTE #{selectedRoutePoint + 1}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default TSPVisualizationSVG;