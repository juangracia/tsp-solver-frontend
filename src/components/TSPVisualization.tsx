import React, { useEffect, useRef, useState } from 'react';
import type { TSPSolution, Point } from '../types/tsp';

interface TSPVisualizationProps {
  solution: TSPSolution | null;
  showRoute: boolean;
  className?: string;
}

const TSPVisualization: React.FC<TSPVisualizationProps> = ({
  solution,
  showRoute,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const width = Math.min(container.clientWidth - 32, 800);
        const height = Math.min(width * 0.75, 600);
        setDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas || !solution) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Clear canvas with theme-appropriate background color
      ctx.fillStyle = darkMode ? '#1e293b' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add defensive checks for solution structure
      const points = Array.isArray(solution.originalPoints) ? solution.originalPoints : [];
      const route = Array.isArray(solution.route) ? solution.route : [];
      
      console.log('TSPVisualization rendering with points:', points.length, 'route:', route.length);

      if (points.length === 0) return;

      // Calculate bounds for scaling
      const xCoords = points.map(p => p.x);
      const yCoords = points.map(p => p.y);
      const minX = Math.min(...xCoords);
      const maxX = Math.max(...xCoords);
      const minY = Math.min(...yCoords);
      const maxY = Math.max(...yCoords);

      // Add padding
      const padding = 40;
      const rangeX = maxX - minX || 1;
      const rangeY = maxY - minY || 1;
      const scaleX = (canvas.width - 2 * padding) / rangeX;
      const scaleY = (canvas.height - 2 * padding) / rangeY;
      const scale = Math.min(scaleX, scaleY);

      // Center the visualization
      const offsetX = (canvas.width - rangeX * scale) / 2 - minX * scale;
      const offsetY = (canvas.height - rangeY * scale) / 2 - minY * scale;

      const scalePoint = (point: Point) => ({
        x: point.x * scale + offsetX,
        y: canvas.height - (point.y * scale + offsetY), // Flip Y axis
      });

      // Draw route lines if available and enabled
      if (showRoute && route && route.length > 1) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        
        ctx.beginPath();
        const scaledRoute = route.map(scalePoint);
        ctx.moveTo(scaledRoute[0].x, scaledRoute[0].y);
        
        for (let i = 1; i < scaledRoute.length; i++) {
          ctx.lineTo(scaledRoute[i].x, scaledRoute[i].y);
        }
        
        // Close the route (return to start)
        if (scaledRoute.length > 0) {
          ctx.lineTo(scaledRoute[0].x, scaledRoute[0].y);
        }
        
        ctx.stroke();

        // Draw route order numbers
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        route.forEach((point, index) => {
          const scaled = scalePoint(point);
          
          // Draw white circle background for number
          ctx.beginPath();
          ctx.arc(scaled.x, scaled.y, 12, 0, 2 * Math.PI);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          
          // Draw order number
          ctx.fillStyle = '#ffffff';
          ctx.fillText((index + 1).toString(), scaled.x, scaled.y);
        });
      }

      // Draw points
      points.forEach((point, index) => {
        const scaled = scalePoint(point);
        
        ctx.beginPath();
        ctx.arc(scaled.x, scaled.y, 6, 0, 2 * Math.PI);
        
        // Color coding: start point green, others blue
        if (index === 0) {
          ctx.fillStyle = '#22c55e';
        } else {
          ctx.fillStyle = '#3b82f6';
        }
        
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw grid with theme-appropriate colors
      ctx.strokeStyle = darkMode ? '#334155' : '#f3f4f6';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      
      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = (canvas.width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let i = 0; i <= 10; i++) {
        const y = (canvas.height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw axis labels with theme-appropriate colors
      ctx.setLineDash([]);
      ctx.fillStyle = darkMode ? '#94a3b8' : '#6b7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('X Coordinate', canvas.width / 2, canvas.height - 10);
      
      ctx.save();
      ctx.translate(15, canvas.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Y Coordinate', 0, 0);
      ctx.restore();
      
    } catch (error) {
      console.error('Error rendering TSP visualization:', error);
    }

  }, [solution, showRoute, dimensions, darkMode]);

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
                Route
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <canvas
          ref={canvasRef}
          className="border rounded w-full"
          style={{ 
            borderColor: 'var(--color-border)',
            maxWidth: '100%', 
            height: 'auto' 
          }}
        />
      </div>
    </div>
  );
};

export default TSPVisualization;