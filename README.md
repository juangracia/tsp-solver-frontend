# TSP Solver Frontend

A React TypeScript frontend for the Travelling Salesman Problem (TSP) solver application. Features interactive visualization, file upload, and real-time algorithm performance monitoring.

## Features

- **Interactive File Upload**: Drag & drop interface for coordinate files (.txt, .csv)
- **Advanced Visualization**: Modern SVG-based rendering with interactive point selection
- **Dark Mode Support**: Toggle between light and dark themes with system preference detection  
- **Algorithm Performance**: Real-time metrics and execution time tracking
- **Solutions History**: Manage and compare multiple TSP solutions
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Interactive Features**: Point highlighting, side-by-side route data, smooth animations
- **Type Safety**: Full TypeScript implementation with strict type checking

## Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling and development
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Dropzone** for file uploads
- **SVG Rendering** for modern interactive visualization
- **Canvas API** for legacy visualization support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- TSP Solver backend running on port 8080

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Server

The app will be available at http://localhost:3000 with automatic reload.

## Usage

### File Upload

1. **Coordinate Files**: Upload .txt or .csv files with x,y coordinates (one per line)
   ```
   0,0
   3,4
   6,0
   3,-4
   -3,2
   ```

2. **File Requirements**:
   - Format: x,y coordinates (one per line)
   - Minimum: 3 points
   - Maximum: 1000 points
   - File size: Up to 10MB
   - Supported formats: .txt, .csv

### Algorithm Selection

The backend automatically selects algorithms based on problem size:
- **≤10 points**: Exact algorithms (Brute Force/Dynamic Programming)
- **11-25 points**: Heuristic algorithms (Nearest Neighbor + 2-opt)
- **26+ points**: Metaheuristic algorithms (Simulated Annealing)

### Visualization

- **Modern SVG Interface**: Interactive SVG-based visualization with smooth animations
- **Point Visualization**: Green for start point, blue for other points, with hover effects
- **Route Display**: Red lines showing the optimal path with smooth transitions
- **Interactive Features**: 
  - Click to select and highlight points
  - Side-by-side route data panel
  - Toggle route display
  - Responsive scaling and layout
- **Dark Mode**: Full dark theme support with theme-aware colors
- **Legacy Canvas**: Alternative canvas-based visualization for compatibility

## API Integration

The frontend communicates with the Spring Boot backend via REST API:

- `POST /api/tsp/upload` - Upload coordinate files
- `POST /api/tsp/{id}/solve` - Solve TSP with automatic algorithm selection
- `GET /api/tsp/{id}` - Get solution details
- `GET /api/tsp` - Get all solutions
- `DELETE /api/tsp/{id}` - Delete solution

## Project Structure

```
src/
├── components/           # React components
│   ├── FileUpload.tsx         # File upload with validation
│   ├── TSPVisualization.tsx   # Legacy Canvas-based route display
│   ├── TSPVisualizationSVG.tsx # Modern SVG visualization with interactions
│   ├── ThemeToggle.tsx        # Dark/light mode toggle
│   ├── SolutionDetails.tsx    # Algorithm results and metrics
│   └── SolutionsHistory.tsx   # Solution management
├── services/            # API communication
│   └── tspService.ts    # Backend integration service
├── types/              # TypeScript definitions
│   └── tsp.ts          # TSP data models and interfaces
└── App.tsx             # Main application component
```

## Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npx tsc --noEmit        # Type checking without build
```

## Configuration

### Environment Variables

- **Development**: Automatically proxies API calls to http://localhost:8080
- **Production**: Uses deployed backend URL

### Vite Configuration

The development server includes CORS proxy configuration for seamless backend integration:

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

## Testing

### Manual Testing

1. Start the backend server (port 8080)
2. Start the frontend dev server (port 3000)
3. Upload test files from `/tsp-solver-backend/txt/` (organized by algorithm type)
4. Verify algorithm selection and visualization

### Test Files

Sample coordinate files are available:
- `/public/sample_points.txt` - 5 points for exact algorithm testing
- Backend test files in `/tsp-solver-backend/txt/`:
  - `exact_*.txt` - Small datasets (≤10 points) for ExactTSPSolver
  - `heuristic_*.txt` - Medium datasets (11-25 points) for HeuristicTSPSolver  
  - `metaheuristic_*.txt` - Large datasets (26+ points) for MetaheuristicTSPSolver

## Performance

- **Build Size**: ~60KB gzipped
- **Rendering**: Optimized canvas visualization for 1000+ points
- **API Calls**: Efficient request batching and error handling
- **Memory**: Minimal footprint with proper cleanup

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with Canvas API support

## Troubleshooting

### Common Issues

1. **Backend Connection**: Ensure Spring Boot backend is running on port 8080
2. **File Upload Errors**: Check file format (x,y coordinates, one per line)
3. **Build Issues**: Clear node_modules and reinstall dependencies
4. **TypeScript Errors**: Run `npx tsc --noEmit` for detailed error information

### Development Issues

- **CORS Errors**: Use the Vite proxy configuration (already configured)
- **Hot Reload**: Restart dev server if changes aren't reflected
- **Build Failures**: Check TypeScript errors and dependencies
5. Test with various file sizes and formats

## License

This project is part of the TSP Solver application suite.
