import { type LinearAlgebraModule, type ModulePanelProps } from '../index'
import { type Matrix2, eigenvalues2, eigenvectors2, applyMatrix } from '../../utils/mathHelpers'
import styles from './Eigenvectors.module.css'

// ── Extra canvas draw ─────────────────────────────────────────────────────

const SCALE = 3 // length of eigenvector arrows drawn on canvas

function extraDraw(
  ctx: CanvasRenderingContext2D,
  matrix: Matrix2,
  toCanvas: (v: [number, number]) => [number, number],
) {
  const vecs = eigenvectors2(matrix)
  const vals = eigenvalues2(matrix)
  if (!vecs || !vals) return

  const colors = ['#ffd43b', '#74c0fc']
  const origin = toCanvas([0, 0])

  vecs.forEach((vec, i) => {
    const color = colors[i]
    const lambda = vals[i]

    // Original direction (unit vector * SCALE)
    const tipRaw = toCanvas([vec[0] * SCALE, vec[1] * SCALE])

    // After applying matrix (should be lambda * v)
    const stretched = applyMatrix(matrix, [vec[0] * SCALE, vec[1] * SCALE])
    const tipTransformed = toCanvas(stretched)

    // Draw original eigenvector (dashed)
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = color + '66'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(origin[0], origin[1])
    ctx.lineTo(tipRaw[0], tipRaw[1])
    ctx.stroke()
    ctx.setLineDash([])

    // Draw transformed (solid) – should be the same direction, just scaled
    ctx.strokeStyle = color
    ctx.lineWidth = 2.5
    drawLine(ctx, origin, tipTransformed)

    // Label
    ctx.font = 'bold 12px Inter, system-ui, sans-serif'
    ctx.fillStyle = color
    ctx.fillText(
      `λ${i + 1}=${lambda.toFixed(2)}`,
      tipTransformed[0] + 6,
      tipTransformed[1] - 6,
    )
  })
}

function drawLine(ctx: CanvasRenderingContext2D, from: [number, number], to: [number, number]) {
  ctx.beginPath()
  ctx.moveTo(from[0], from[1])
  ctx.lineTo(to[0], to[1])
  ctx.stroke()
}

// ── Panel ─────────────────────────────────────────────────────────────────

function Panel({ matrix, setMatrix }: ModulePanelProps) {
  const vals = eigenvalues2(matrix)
  const vecs = eigenvectors2(matrix)
  const hasReal = vals !== null && vecs !== null

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Eigenvectors & Eigenvalues</h3>
      <p className={styles.desc}>
        Eigenvectors are directions that the transformation only <em>stretches</em> (or flips) — never rotates.
        The eigenvalue λ is the scale factor. On the canvas, solid lines show transformed eigenvectors; dashed
        lines show the original direction.
      </p>

      {hasReal ? (
        <div className={styles.eigenList}>
          {vals!.map((lambda, i) => (
            <div key={i} className={styles.eigenRow}>
              <span className={styles.eigenLabel} style={{ color: i === 0 ? '#ffd43b' : '#74c0fc' }}>
                λ{i + 1}
              </span>
              <span className={styles.eigenVal}>{lambda.toFixed(4)}</span>
              <span className={styles.eigenVec}>
                v = ({vecs![i][0].toFixed(3)}, {vecs![i][1].toFixed(3)})
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.complexNote}>
          ℂ Complex eigenvalues — no real eigenvectors. The transformation is a rotation or spiral.
        </div>
      )}

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Classic examples</h4>
        <div className={styles.btnRow}>
          <button className={styles.btn} onClick={() => setMatrix([3, 1, 1, 3])}>
            Symmetric
          </button>
          <button className={styles.btn} onClick={() => setMatrix([2, 0, 0, 3])}>
            Diagonal
          </button>
          <button className={styles.btn} onClick={() => setMatrix([4, 1, 2, 3])}>
            General
          </button>
          <button className={styles.btn} onClick={() => setMatrix([0, -1, 1, 0])}>
            Rotation (complex)
          </button>
          <button className={styles.btn} onClick={() => setMatrix([2, 1, 0, 2])}>
            Repeated λ
          </button>
        </div>
      </section>
    </div>
  )
}

export const EigenvectorsModule: LinearAlgebraModule = {
  id: 'eigenvectors',
  name: 'Eigenvectors',
  description: 'Animate eigenvectors and eigenvalues of a 2×2 matrix.',
  renderPanel: (props) => <Panel {...props} />,
  onExtraDraw: extraDraw,
}
