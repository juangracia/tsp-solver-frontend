import React from 'react';
import type { TSPSolution } from '../types/tsp';
import { SolutionStatus } from '../types/tsp';

interface SolutionDetailsProps {
  solution: TSPSolution | null;
  onSolve?: () => void;
  isSolving?: boolean;
  className?: string;
}

const SolutionDetails: React.FC<SolutionDetailsProps> = ({
  solution,
  onSolve,
  isSolving = false,
  className = '',
}) => {
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

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Solution Details</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(solution.status)}`}>
            {solution.status.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-4">
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
                  'Solve TSP'
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

          {/* Route Information */}
          {solution.route && solution.route.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-700 mb-3">Route Order</h4>
              <div className="max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                  {solution.route.map((point, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        {point.address ? (
                          <div className="truncate text-gray-700" title={point.address}>
                            {point.address.split(',')[0]}
                          </div>
                        ) : (
                          <div className="text-gray-700">
                            ({point.x.toFixed(1)}, {point.y.toFixed(1)})
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionDetails;