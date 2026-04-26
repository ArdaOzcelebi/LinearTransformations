import { type LinearAlgebraModule, type ModulePanelProps } from '../index'
import { type Matrix2, det2, applyMatrix } from '../../utils/mathHelpers'
import styles from './Determinant.module.css'

// ── Extra canvas draw ─────────────────────────────────────────────────────

function extraDraw(
  ctx: CanvasRenderingContext2D,
  matrix: Matrix2,
  toCanvas: (v: [number, number]) => [number, number],
) {
  const d = det2(matrix)
  const isFlipped = d < 0

  // Draw a highlighted unit-square parallelogram
  const corners: [number, number][] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]
  const pts = corners.map((c) => toCanvas(c))

  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.closePath()
  ctx.strokeStyle = isFlipped ? '#ff6b6b' : '#51cf66'
  ctx.lineWidth = 2
  ctx.stroke()

  // Label the area at the centroid
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
  ctx.font = 'bold 13px Inter, system-ui, sans-serif'
  ctx.fillStyle = isFlipped ? '#ff6b6b' : '#51cf66'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`|det| = ${Math.abs(d).toFixed(3)}`, cx, cy)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  // Draw original unit square as dashed reference
  const origCorners: [number, number][] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]
  // toCanvas with identity → same as world-to-canvas
  const worldScale = ctx.canvas.width / 16 / (window.devicePixelRatio || 1)
  const half = ctx.canvas.width / 2 / (window.devicePixelRatio || 1)
  const orig = origCorners.map(
    ([x, y]): [number, number] => [half + x * worldScale, half - y * worldScale],
  )
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(orig[0][0], orig[0][1])
  for (let i = 1; i < orig.length; i++) ctx.lineTo(orig[i][0], orig[i][1])
  ctx.closePath()
  ctx.strokeStyle = 'rgba(200,210,255,0.25)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.setLineDash([])

  // Annotate the i-hat and j-hat vectors
  const o = toCanvas([0, 0])
  const iHat = toCanvas([1, 0])
  const jHat = toCanvas([0, 1])

  ctx.font = '11px Inter, system-ui, sans-serif'
  ctx.fillStyle = '#ff6b6b'
  ctx.fillText(
    `(${applyMatrix(matrix, [1, 0])[0].toFixed(2)}, ${applyMatrix(matrix, [1, 0])[1].toFixed(2)})`,
    iHat[0] + 6,
    iHat[1] - 4,
  )
  ctx.fillStyle = '#51cf66'
  ctx.fillText(
    `(${applyMatrix(matrix, [0, 1])[0].toFixed(2)}, ${applyMatrix(matrix, [0, 1])[1].toFixed(2)})`,
    jHat[0] + 6,
    jHat[1] - 4,
  )
  void o // suppress unused warning
}

// ── Panel ─────────────────────────────────────────────────────────────────

function Panel({ matrix, setMatrix }: ModulePanelProps) {
  const d = det2(matrix)
  const isFlipped = d < 0

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Determinant & Area Scaling</h3>
      <p className={styles.desc}>
        The determinant tells you how much a transformation scales areas. A negative determinant means the
        orientation is flipped. The green parallelogram on the canvas shows the unit square after transformation.
      </p>

      <div className={`${styles.detCard} ${isFlipped ? styles.negative : styles.positive}`}>
        <span className={styles.detLabel}>det(M)</span>
        <span className={styles.detValue}>{d.toFixed(4)}</span>
        <span className={styles.detNote}>
          {Math.abs(d) < 1e-6
            ? '⚠ Singular matrix – collapses space'
            : isFlipped
              ? '↺ Orientation flipped'
              : d < 1
                ? '↙ Contracts space'
                : d === 1
                  ? '✓ Area-preserving'
                  : '↗ Expands space'}
        </span>
      </div>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Try examples</h4>
        <div className={styles.btnRow}>
          <button className={styles.btn} onClick={() => setMatrix([2, 0, 0, 2])}>
            Area ×4
          </button>
          <button className={styles.btn} onClick={() => setMatrix([0.5, 0, 0, 0.5])}>
            Area ×0.25
          </button>
          <button className={styles.btn} onClick={() => setMatrix([1, 0, 0, -1])}>
            Reflected (det=−1)
          </button>
          <button className={styles.btn} onClick={() => setMatrix([1, 0, 0, 0])}>
            Singular (det=0)
          </button>
          <button className={styles.btn} onClick={() => setMatrix([3, 1, 1, 3])}>
            det=8
          </button>
        </div>
      </section>
    </div>
  )
}

export const DeterminantModule: LinearAlgebraModule = {
  id: 'determinant',
  name: 'Determinant',
  description: 'Visualise how the determinant scales (and flips) areas.',
  renderPanel: (props) => <Panel {...props} />,
  onExtraDraw: extraDraw,
}
