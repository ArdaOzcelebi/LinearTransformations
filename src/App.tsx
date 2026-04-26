import { useState, useCallback } from 'react'
import { TransformVisualizer } from './components/TransformVisualizer'
import { MatrixInput } from './components/MatrixInput'
import { Controls } from './components/Controls'
import { type Matrix2, IDENTITY } from './utils/mathHelpers'
import { useTransformAnimation } from './hooks/useTransformAnimation'
import { GeometricTransformModule } from './modules/GeometricTransform'
import { DeterminantModule } from './modules/Determinant'
import { EigenvectorsModule } from './modules/Eigenvectors'
import { BasisVectorsModule } from './modules/BasisVectors'
import { GaussianEliminationModule } from './modules/GaussianElimination'
import { type LinearAlgebraModule } from './modules'
import styles from './App.module.css'

// ── Module registry ───────────────────────────────────────────────────────
// To add a new module: import it above and add it to this array.
const MODULES: LinearAlgebraModule[] = [
  GeometricTransformModule,
  DeterminantModule,
  EigenvectorsModule,
  BasisVectorsModule,
  GaussianEliminationModule,
]

// ── App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [targetMatrix, setTargetMatrix] = useState<Matrix2>([2, 1, 0, 1])
  const [displayMatrix, setDisplayMatrix] = useState<Matrix2>([2, 1, 0, 1])
  const [showGrid, setShowGrid] = useState(true)
  const [showBasis, setShowBasis] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeModuleId, setActiveModuleId] = useState(MODULES[0].id)

  const activeModule = MODULES.find((m) => m.id === activeModuleId)!

  // When module sets matrix via its panel, update both target and display immediately
  const handleSetMatrix = useCallback((m: Matrix2) => {
    setTargetMatrix(m)
    setDisplayMatrix(m)
  }, [])

  // Handle animation updates
  const { startAnimation } = useTransformAnimation({
    duration: 1200,
    onUpdate: (m) => setDisplayMatrix(m),
    onComplete: () => {
      setDisplayMatrix(targetMatrix)
      setIsAnimating(false)
    },
  })

  const handleAnimate = () => {
    setIsAnimating(true)
    startAnimation(targetMatrix)
  }

  const handleReset = () => {
    setTargetMatrix(IDENTITY)
    setDisplayMatrix(IDENTITY)
  }

  const handlePreset = (m: Matrix2) => {
    setTargetMatrix(m)
    setDisplayMatrix(m)
  }

  // onExtraDraw wrapper binds the current displayMatrix
  const extraDraw = activeModule.onExtraDraw
    ? (ctx: CanvasRenderingContext2D, toCanvas: (v: [number, number]) => [number, number]) =>
        activeModule.onExtraDraw!(ctx, displayMatrix, toCanvas)
    : undefined

  return (
    <div className={styles.app}>
      {/* ── Header ─────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>∑</span>
          <span>Linear Transformations</span>
        </div>
        <p className={styles.subtitle}>Interactive linear-algebra visualiser</p>
      </header>

      <div className={styles.layout}>
        {/* ── Sidebar ────────────────────────────────────────── */}
        <aside className={styles.sidebar}>
          {/* Module navigation */}
          <nav className={styles.moduleNav}>
            {MODULES.map((mod) => (
              <button
                key={mod.id}
                className={`${styles.modBtn} ${activeModuleId === mod.id ? styles.modBtnActive : ''}`}
                onClick={() => setActiveModuleId(mod.id)}
                title={mod.description}
              >
                {mod.name}
              </button>
            ))}
          </nav>

          {/* Matrix input */}
          <div className={styles.sideSection}>
            <span className={styles.sideSectionLabel}>Matrix A</span>
            <MatrixInput matrix={targetMatrix} onChange={handleSetMatrix} />
          </div>

          {/* Controls */}
          <Controls
            showGrid={showGrid}
            showBasis={showBasis}
            isAnimating={isAnimating}
            onToggleGrid={() => setShowGrid((v) => !v)}
            onToggleBasis={() => setShowBasis((v) => !v)}
            onAnimate={handleAnimate}
            onReset={handleReset}
            onPreset={handlePreset}
          />

          {/* Active module panel */}
          <div className={styles.modulePanel}>
            {activeModule.renderPanel({ matrix: displayMatrix, setMatrix: handleSetMatrix })}
          </div>
        </aside>

        {/* ── Canvas ─────────────────────────────────────────── */}
        <main className={styles.canvasArea}>
          <TransformVisualizer
            matrix={displayMatrix}
            showGrid={showGrid}
            showBasis={showBasis}
            onExtraDraw={extraDraw}
          />
          <div className={styles.matrixOverlay}>
            <span className={styles.matrixOverlayLabel}>Current transform A</span>
            <code className={styles.matrixCode}>
              [{displayMatrix[0].toFixed(3)}, {displayMatrix[1].toFixed(3)}]{'\n'}
              [{displayMatrix[2].toFixed(3)}, {displayMatrix[3].toFixed(3)}]
            </code>
          </div>
        </main>
      </div>
    </div>
  )
}
