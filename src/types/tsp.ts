export interface Point {
  x: number;
  y: number;
  address?: string;
  coordinates?: Coordinates;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RoutePoint extends Point {
  order: number;
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
  realWorldDistance?: string;
  estimatedDriveTime?: string;
  executionTimeMs?: number;
  route?: RoutePoint[];
  originalPoints: Point[];
  realWorldDemo?: boolean;
  mapUrl?: string;
  createdAt?: string;
  addresses?: AddressInfo[];
}

export interface AddressInfo {
  address: string;
  coordinates: Coordinates;
  placeId?: string;
}

export interface SolveOptions {
  algorithm?: string;
  maxTime?: number;
  useRealDistances?: boolean;
}

export interface UploadResponse {
  id: string;
  pointCount: number;
  status: SolutionStatus;
  fileName?: string;
  addresses?: AddressInfo[];
  realWorldDemo?: boolean;
}

export interface SolutionsListResponse {
  solutions: TSPSolution[];
}