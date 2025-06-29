import axios, { type AxiosResponse } from 'axios';
import type { TSPSolution, SolveOptions, UploadResponse, SolutionsListResponse } from '../types/tsp';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://tsp-backend.railway.app'
  : 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/tsp`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class TSPService {
  static async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<UploadResponse> = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  static async uploadAddresses(addresses: string[], mode: string = 'DEMO'): Promise<UploadResponse> {
    const response: AxiosResponse<UploadResponse> = await api.post('/upload-addresses', {
      addresses,
      mode,
    });
    
    return response.data;
  }

  static async solveTSP(id: string, options?: SolveOptions): Promise<TSPSolution> {
    const params = new URLSearchParams();
    
    if (options?.algorithm) {
      params.append('algorithm', options.algorithm);
    }
    if (options?.maxTime) {
      params.append('maxTime', options.maxTime.toString());
    }
    if (options?.useRealDistances) {
      params.append('useRealDistances', options.useRealDistances.toString());
    }

    const response: AxiosResponse<TSPSolution> = await api.post(`/${id}/solve?${params.toString()}`);
    
    return response.data;
  }

  static async getSolution(id: string): Promise<TSPSolution> {
    const response: AxiosResponse<TSPSolution> = await api.get(`/${id}`);
    
    return response.data;
  }

  static async getAllSolutions(): Promise<SolutionsListResponse> {
    const response: AxiosResponse<SolutionsListResponse> = await api.get('');
    
    return response.data;
  }

  static async deleteSolution(id: string): Promise<void> {
    await api.delete(`/${id}`);
  }

  static validateCoordinateFile(content: string): { isValid: boolean; points?: { x: number; y: number }[]; error?: string } {
    try {
      const lines = content.trim().split('\n');
      
      if (lines.length < 3) {
        return { isValid: false, error: 'File must contain at least 3 points' };
      }
      
      if (lines.length > 1000) {
        return { isValid: false, error: 'File cannot contain more than 1000 points' };
      }

      const points = lines.map((line, index) => {
        const parts = line.trim().split(',');
        if (parts.length !== 2) {
          throw new Error(`Line ${index + 1}: Expected format "x,y"`);
        }
        
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        
        if (isNaN(x) || isNaN(y)) {
          throw new Error(`Line ${index + 1}: Invalid coordinates`);
        }
        
        return { x, y };
      });

      return { isValid: true, points };
    } catch (error) {
      return { isValid: false, error: error instanceof Error ? error.message : 'Invalid file format' };
    }
  }
}

export default TSPService;