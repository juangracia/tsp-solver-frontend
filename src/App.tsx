import { useState, useEffect } from 'react'
import './App.css'
import FileUpload from './components/FileUpload'
import TSPVisualizationSVG from './components/TSPVisualizationSVG'
import SolutionDetails from './components/SolutionDetails'
import ThemeToggle from './components/ThemeToggle'
import { TSPService } from './services/tspService'
import type { TSPSolution, UploadResponse } from './types/tsp'

function App() {
  const [currentSolution, setCurrentSolution] = useState<TSPSolution | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSolving, setIsSolving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allSolutions, setAllSolutions] = useState<TSPSolution[]>([])
  const [selectedOriginalPoint, setSelectedOriginalPoint] = useState<number | null>(null)
  const [selectedRoutePoint, setSelectedRoutePoint] = useState<number | null>(null)

  useEffect(() => {
    // Load existing solutions on component mount
    loadSolutions()
  }, [])

  const loadSolutions = async () => {
    try {
      const response = await TSPService.getAllSolutions()
      setAllSolutions(response.solutions)
    } catch (err) {
      console.error('Failed to load solutions:', err)
    }
  }

  const handleUploadSuccess = async (result: UploadResponse) => {
    try {
      setError(null)
      const solution = await TSPService.getSolution(result.id)
      setCurrentSolution(solution)
      await loadSolutions()
      
      // Auto-solve if file is successfully uploaded
      handleSolve(result.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load solution')
    }
  }

  const handleUploadError = (errorMsg: string) => {
    setError(errorMsg)
    setCurrentSolution(null)
  }

  const handleSolve = async (id: string) => {
    try {
      setIsSolving(true)
      setError(null)
      const solution = await TSPService.solveTSP(id)
      setCurrentSolution(solution)
      await loadSolutions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to solve TSP')
    } finally {
      setIsSolving(false)
    }
  }

  const handleSelectSolution = async (id: string) => {
    try {
      setError(null)
      console.log('Fetching solution with ID:', id)
      const solution = await TSPService.getSolution(id)
      console.log('Solution received:', solution)
      
      // Validate solution has required properties
      if (!solution) {
        throw new Error('Solution is null or undefined')
      }
      if (!Array.isArray(solution.originalPoints)) {
        console.error('Invalid solution structure:', solution)
        throw new Error('Invalid solution structure: originalPoints is not an array')
      }
      
      setCurrentSolution(solution)
    } catch (err) {
      console.error('Error loading solution:', err)
      setError(err instanceof Error ? err.message : 'Failed to load solution')
    }
  }

  const handleDeleteSolution = async (id: string) => {
    try {
      await TSPService.deleteSolution(id)
      if (currentSolution?.id === id) {
        setCurrentSolution(null)
      }
      await loadSolutions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete solution')
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: 'var(--main-bg)' }}>
      {/* Theme Toggle */}
      <ThemeToggle className="animate-fade-in" />
      
      <header className="py-10 mb-8 flex flex-col items-center justify-center shadow-lg rounded-b-3xl" style={{ background: 'var(--header-bg)' }}>
        <div className="flex items-center gap-4 mb-2">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-400 to-pink-400 shadow-lg border-4 border-white dark:border-gray-700">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 21l18-9L3 3v7l13 2-13 2v7z"/></svg>
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-lg" style={{ color: 'var(--color-primary)' }}>SF3 TPS Solver</h1>
        </div>
        <p className="text-lg font-semibold drop-shadow-sm" style={{ color: 'var(--color-secondary)' }}>Smart, interactive route optimization and visualization</p>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-12 animate-fade-in">
        {error && (
          <div className="card-modern mb-6" style={{ backgroundColor: 'var(--color-error)', color: 'white', borderColor: 'transparent' }}>
            <div className="flex items-center gap-3">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.2"/><path stroke="white" strokeWidth="2" d="M12 8v4m0 4h.01"/></svg>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column: Upload + History */}
          <div className="lg:col-span-1 space-y-8">
            <div className="card-modern">
              <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2 text-indigo-700 bg-gradient-to-r from-indigo-200/60 to-pink-100/40 px-3 py-2 rounded-lg shadow-sm">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" fill="#6366f1" opacity=".1"/><rect x="3" y="7" width="18" height="13" rx="2" stroke="#6366f1" strokeWidth="2"/><path stroke="#6366f1" strokeWidth="2" d="M8 7V5a4 4 0 018 0v2"/></svg>
                Upload Coordinates
              </h2>
              <div className="transition hover:scale-[1.02]">
                <FileUpload 
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  isUploading={isUploading}
                  setIsUploading={setIsUploading}
                />
              </div>
            </div>

            {allSolutions.length > 0 && (
              <div className="card-modern">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="#818cf8" opacity=".1"/><rect x="4" y="4" width="16" height="16" rx="2" stroke="#6366f1" strokeWidth="2"/><path stroke="#6366f1" strokeWidth="2" d="M8 8h8M8 12h8M8 16h4"/></svg>
                  Solution History
                </h2>
                <div className="overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-indigo-200/60 scrollbar-track-white">
                  <ul className="divide-y divide-gray-200">
                    {allSolutions.map((solution) => (
                      <li key={solution.id} className="py-3">
                        <div className="flex items-center justify-between">
                          <button 
                            onClick={() => handleSelectSolution(solution.id)}
                            className={`text-left flex-grow transition-colors rounded px-2 py-1 hover:bg-indigo-50 ${currentSolution?.id === solution.id ? 'font-bold' : ''}`}
                            style={{ color: currentSolution?.id === solution.id ? 'var(--color-primary)' : 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-card-hover)' }}
                          >
                            <div className="truncate">{solution.fileName || `Points (${solution.pointCount})`}</div>
                            <div className="text-xs text-gray-500">
                              {solution.status === 'SOLVED' 
                                ? `Distance: ${solution.totalDistance?.toFixed(2) || 'N/A'}`
                                : solution.status}
                            </div>
                          </button>
                          <button 
                            onClick={() => handleDeleteSolution(solution.id)}
                            className="btn-outline text-xs px-2 py-1 rounded"
                            style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                            title="Delete"
                          >
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="5" y="7" width="14" height="12" rx="2" fill="#fee2e2"/><path stroke="#dc2626" strokeWidth="2" d="M10 11v4m4-4v4M4 7h16"/></svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Right column: Side-by-side Tables and Visualization */}
          <div className="lg:col-span-2">
            {currentSolution && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Left: Data Tables */}
                <div className="card-modern">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"/></svg>
                    Route Data
                  </h2>
                  <SolutionDetails 
                    solution={currentSolution}
                    isSolving={isSolving}
                    onSolve={() => handleSolve(currentSolution.id)}
                    selectedOriginalPoint={selectedOriginalPoint}
                    selectedRoutePoint={selectedRoutePoint}
                    onSelectOriginalPoint={setSelectedOriginalPoint}
                    onSelectRoutePoint={setSelectedRoutePoint}
                    showOnlyTables={true}
                  />
                </div>

                {/* Right: Visualization */}
                <div className="card-modern">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#6366f1" opacity=".1"/><path stroke="#6366f1" strokeWidth="2" d="M5 12h14M12 5v14"/></svg>
                    Interactive Graph
                  </h2>
                  <TSPVisualizationSVG 
                    solution={currentSolution}
                    showRoute={true}
                    selectedOriginalPoint={selectedOriginalPoint}
                    selectedRoutePoint={selectedRoutePoint}
                  />
                </div>
              </div>
            )}

            {!currentSolution && !isUploading && (
              <div className="card-modern p-12 flex flex-col items-center" style={{ background: 'var(--color-bg-card)' }}>
                <div className="flex flex-col items-center mb-6">
                  <svg width="80" height="80" fill="none" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="38" fill="var(--color-primary)" opacity=".08"/>
                    <path stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" d="M20 50c8-12 32-12 40 0"/>
                    <circle cx="40" cy="34" r="8" fill="var(--color-primary)" opacity=".18"/>
                    <circle cx="40" cy="34" r="4" fill="var(--color-primary)"/>
                  </svg>
                  <h3 className="text-2xl font-semibold mt-6 mb-2" style={{ color: 'var(--color-text-primary)' }}>No Solution Selected</h3>
                  <p style={{ color: 'var(--color-text-secondary)' }} className="mb-6">Upload a coordinate file to get started</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="white" strokeWidth="2" d="M12 19V6m0 0l-5 5m5-5l5 5"/></svg>
                  Upload Now
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
