import React, { useState } from 'react';
import type { TSPSolution } from '../types/tsp';
import { SolutionStatus } from '../types/tsp';

interface SolutionDetailsProps {
  solution: TSPSolution | null;
  onSolve?: () => void;
  isSolving?: boolean;
  className?: string;
  selectedOriginalPoint?: number | null;
  selectedRoutePoint?: number | null;
  onSelectOriginalPoint?: (index: number | null) => void;
  onSelectRoutePoint?: (index: number | null) => void;
  showOnlyTables?: boolean;
  showTablesOnly?: boolean;
}

const SolutionDetails: React.FC<SolutionDetailsProps> = ({
  solution,
  onSolve,
  isSolving = false,
  className = '',
  selectedOriginalPoint = null,
  selectedRoutePoint = null,
  onSelectOriginalPoint,
  onSelectRoutePoint,
  showOnlyTables = false,
  showTablesOnly = false,
}) => {
  // Log for debugging
  console.log('SolutionDetails rendering with solution:', solution);
  
  // Handle null solution case
  if (!solution) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <div>Upload a file to see solution details</div>
        </div>
      </div>
    );
  }

  // Validate solution has required properties to avoid runtime errors
  try {
    if (!solution.id || !solution.status || !solution.pointCount) {
      console.error('Invalid solution structure:', solution);
      return (
        <div className={`bg-red-50 rounded-lg p-6 ${className}`}>
          <div className="text-center text-red-500">
            <div className="text-4xl mb-4">⚠️</div>
            <div>Error: Invalid solution data</div>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error('Error validating solution:', error);
    return (
      <div className={`bg-red-50 rounded-lg p-6 ${className}`}>
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <div>Error processing solution data</div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: SolutionStatus) => {
    switch (status) {
      case SolutionStatus.SOLVED:
        return 'bg-green-100 text-green-800';
      case SolutionStatus.SOLVING:
        return 'bg-yellow-100 text-yellow-800';
      case SolutionStatus.ERROR:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getAlgorithmDescription = (algorithm: string) => {
    switch (algorithm) {
      case 'BRUTE_FORCE':
        return 'Exact algorithm (Brute Force) - Optimal solution guaranteed';
      case 'DYNAMIC_PROGRAMMING':
        return 'Exact algorithm (Dynamic Programming) - Optimal solution guaranteed';
      case 'NEAREST_NEIGHBOR_2OPT':
        return 'Heuristic algorithm (Nearest Neighbor + 2-opt) - Good quality solution';
      case 'SIMULATED_ANNEALING':
        return 'Metaheuristic algorithm (Simulated Annealing) - Advanced optimization';
      default:
        return algorithm || 'Algorithm not specified';
    }
  };

  const formatExecutionTime = (timeMs?: number) => {
    if (!timeMs) return 'N/A';
    if (timeMs < 1000) return `${timeMs}ms`;
    return `${(timeMs / 1000).toFixed(2)}s`;
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return 'N/A';
    return distance.toFixed(2);
  };

  const calculateDistance = (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getRouteDistances = (route: Array<{ x: number; y: number }>) => {
    const distances = [];
    for (let i = 0; i < route.length; i++) {
      const current = route[i];
      const next = route[(i + 1) % route.length];
      distances.push(calculateDistance(current, next));
    }
    return distances;
  };

  // If showOnlyTables is true, only render the tables
  if (showOnlyTables) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Original Points Table */}
        {solution.originalPoints && solution.originalPoints.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Original Points (Upload Order)</h4>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        Point #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        Coordinates
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {solution.originalPoints.map((point, index) => (
                      <tr 
                        key={index} 
                        className={`cursor-pointer transition-colors duration-150 hover:bg-blue-50 ${
                          selectedOriginalPoint === index ? 'bg-blue-100 border-l-4 border-l-blue-500' : 
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        onClick={() => onSelectOriginalPoint?.(selectedOriginalPoint === index ? null : index)}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-100">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-mono border-r border-gray-100">
                          ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                          {point.address || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Route Information */}
        {solution.route && solution.route.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Optimized Route Details</h4>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        Original #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        Route Order
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        Coordinates
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        Segment Distance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total Distance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {(() => {
                      const routeDistances = getRouteDistances(solution.route);
                      let cumulativeDistance = 0;
                      
                      return solution.route.map((point, index) => {
                        const distance = routeDistances[index];
                        cumulativeDistance += distance;
                        
                        // Find original index of this point
                        const originalIndex = solution.originalPoints ? 
                          solution.originalPoints.findIndex(op => 
                            Math.abs(op.x - point.x) < 0.001 && Math.abs(op.y - point.y) < 0.001
                          ) + 1 : 'N/A';

                        return (
                          <tr 
                            key={index} 
                            className={`cursor-pointer transition-colors duration-150 hover:bg-green-50 ${
                              selectedRoutePoint === index ? 'bg-green-100 border-l-4 border-l-green-500' : 
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                            onClick={() => onSelectRoutePoint?.(selectedRoutePoint === index ? null : index)}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-100">
                              {originalIndex}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-blue-600 border-r border-gray-100">
                              <div className="flex items-center gap-2">
                                {index + 1}
                                {index === 0 && <span className="text-xs text-green-600 font-semibold">START</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 font-mono border-r border-gray-100">
                              {point.address ? (
                                <div className="max-w-xs truncate" title={point.address}>
                                  {point.address.split(',')[0]}
                                </div>
                              ) : (
                                `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-blue-600 border-r border-gray-100">
                              <div>
                                {formatDistance(distance)}
                                {index === solution.route.length - 1 && (
                                  <div className="text-xs text-gray-500 mt-1">Return to start</div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-green-600">
                              {formatDistance(cumulativeDistance)}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      <div className="p-6">
        {!showTablesOnly && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Solution Details</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(solution.status)}`}>
                {solution.status.replace('_', ' ')}
              </span>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Problem Size</h4>
                <div className="text-2xl font-bold text-blue-600">{solution.pointCount} points</div>
                {solution.fileName && (
                  <div className="text-sm text-gray-500 mt-1">File: {solution.fileName}</div>
                )}
              </div>

              {solution.totalDistance && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Total Distance</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {formatDistance(solution.totalDistance)}
                  </div>
                  {solution.realWorldDistance && (
                    <div className="text-sm text-gray-500 mt-1">
                      Real-world: {solution.realWorldDistance}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Algorithm Information */}
            {solution.algorithm && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Algorithm Used</h4>
                <div className="font-semibold text-blue-800 mb-1">
                  {solution.algorithm.replace(/_/g, ' ')}
                </div>
                <div className="text-sm text-gray-600">
                  {getAlgorithmDescription(solution.algorithm)}
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {solution.executionTimeMs !== undefined && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Execution Time</div>
                  <div className="font-semibold text-gray-800">
                    {formatExecutionTime(solution.executionTimeMs)}
                  </div>
                </div>
              )}

              {solution.estimatedDriveTime && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Drive Time</div>
                  <div className="font-semibold text-gray-800">
                    {solution.estimatedDriveTime}
                  </div>
                </div>
              )}

              {solution.createdAt && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Created</div>
                  <div className="font-semibold text-gray-800">
                    {new Date(solution.createdAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {solution.status === SolutionStatus.UPLOADED && onSolve && (
                <button
                  onClick={onSolve}
                  disabled={isSolving}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSolving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Solving...
                    </div>
                  ) : (
                    'Solve Route'
                  )}
                </button>
              )}

              {solution.mapUrl && (
                <a
                  href={solution.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
                >
                  View in Google Maps
                </a>
              )}
            </div>
          </div>
        )}

        {!showTablesOnly && (
          <div className="space-y-6 pt-6 border-t border-gray-100">
            {/* Original Points Table */}
            {solution.originalPoints && solution.originalPoints.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Original Points (Upload Order)</h4>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                            Point #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                            Coordinates
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Address
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {solution.originalPoints.map((point, index) => (
                          <tr 
                            key={index} 
                            className={`cursor-pointer transition-colors duration-150 hover:bg-blue-50 ${
                              selectedOriginalPoint === index ? 'bg-blue-100 border-l-4 border-l-blue-500' : 
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                            onClick={() => onSelectOriginalPoint?.(selectedOriginalPoint === index ? null : index)}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-100">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 font-mono border-r border-gray-100">
                              ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                              {point.address || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Route Information */}
            {solution.route && solution.route.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Optimized Route Details</h4>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                            Original #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                            Route Order
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                            Coordinates
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                            Segment Distance
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Total Distance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {(() => {
                          const routeDistances = getRouteDistances(solution.route);
                          let cumulativeDistance = 0;
                          
                          return solution.route.map((point, index) => {
                            const distance = routeDistances[index];
                            cumulativeDistance += distance;
                            
                            // Find original index of this point
                            const originalIndex = solution.originalPoints ? 
                              solution.originalPoints.findIndex(op => 
                                Math.abs(op.x - point.x) < 0.001 && Math.abs(op.y - point.y) < 0.001
                              ) + 1 : 'N/A';

                            return (
                              <tr 
                                key={index} 
                                className={`cursor-pointer transition-colors duration-150 hover:bg-green-50 ${
                                  selectedRoutePoint === index ? 'bg-green-100 border-l-4 border-l-green-500' : 
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }`}
                                onClick={() => onSelectRoutePoint?.(selectedRoutePoint === index ? null : index)}
                              >
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-100">
                                  {originalIndex}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-blue-600 border-r border-gray-100">
                                  <div className="flex items-center gap-2">
                                    {index + 1}
                                    {index === 0 && <span className="text-xs text-green-600 font-semibold">START</span>}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 font-mono border-r border-gray-100">
                                  {point.address ? (
                                    <div className="max-w-xs truncate" title={point.address}>
                                      {point.address.split(',')[0]}
                                    </div>
                                  ) : (
                                    `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-blue-600 border-r border-gray-100">
                                  <div>
                                    {formatDistance(distance)}
                                    {index === solution.route.length - 1 && (
                                      <div className="text-xs text-gray-500 mt-1">Return to start</div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                  {formatDistance(cumulativeDistance)}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SolutionDetails;