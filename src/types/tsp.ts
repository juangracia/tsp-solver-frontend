export interface Point {
  x: number;
  y: number;
}


export interface RoutePoint extends Point {
  order: number;
  segmentDistance?: number;
  accumulatedDistance?: number;
}

export const SolutionStatus = {
  UPLOADED: 'UPLOADED',
  GEOCODED: 'GEOCODED',
  SOLVING: 'SOLVING',
  SOLVED: 'SOLVED',
  ERROR: 'ERROR'
} as const;

export type SolutionStatus = typeof SolutionStatus[keyof typeof SolutionStatus];

export interface TSPSolution {
  id: string;
  fileName?: string;
  pointCount: number;
  status: SolutionStatus;
  algorithm?: string;
  totalDistance?: number;
  executionTimeMs?: number;
  route?: RoutePoint[];
  originalPoints: Point[];
  createdAt?: string;
}


export interface SolveOptions {
  algorithm?: string;
  maxTime?: number;
}

export interface UploadResponse {
  id: string;
  pointCount: number;
  status: SolutionStatus;
  fileName?: string;
}

export interface SolutionsListResponse {
  solutions: TSPSolution[];
}