import { type LinearAlgebraModule, type ModulePanelProps } from '../index'
import { type Matrix2, applyMatrix } from '../../utils/mathHelpers'
import styles from './BasisVectors.module.css'

// ── Extra canvas draw ─────────────────────────────────────────────────────

function extraDraw(
  ctx: CanvasRenderingContext2D,
  matrix: Matrix2,
  toCanvas: (v: [number, number]) => [number, number],
) {
  // Span visualisation: shade the column space (span of i-hat and j-hat after transform)
  const origin = toCanvas([0, 0])
  const v1 = applyMatrix(matrix, [1, 0])
  const v2 = applyMatrix(matrix, [0, 1])
  const iHat = toCanvas([1, 0])
  const jHat = toCanvas([0, 1])

  // Draw the column vectors with their coordinates
  const vectors: Array<{ label: string; color: string; tip: [number, number]; coord: [number, number] }> = [
    { label: 'col₁', color: '#ff6b6b', tip: iHat, coord: v1 },
    { label: 'col₂', color: '#51cf66', tip: jHat, coord: v2 },
  ]

  vectors.forEach(({ label, color, tip, coord }) => {
    // Draw a thicker arrow
    ctx.lineWidth = 3
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(origin[0], origin[1])
    ctx.lineTo(tip[0], tip[1])
    ctx.stroke()

    // Arrowhead
    const dx = tip[0] - origin[0]
    const dy = tip[1] - origin[1]
    const angle = Math.atan2(dy, dx)
    const alen = 10
    ctx.beginPath()
    ctx.moveTo(tip[0], tip[1])
    ctx.lineTo(
      tip[0] - alen * Math.cos(angle - Math.PI / 6),
      tip[1] - alen * Math.sin(angle - Math.PI / 6),
    )
    ctx.lineTo(
      tip[0] - alen * Math.cos(angle + Math.PI / 6),
      tip[1] - alen * Math.sin(angle + Math.PI / 6),
    )
    ctx.closePath()
    ctx.fill()

    ctx.font = 'bold 12px Inter, system-ui, sans-serif'
    ctx.fillText(
      `${label} = (${coord[0].toFixed(2)}, ${coord[1].toFixed(2)})`,
      tip[0] + 8,
      tip[1] - 8,
    )
  })

  // Parallelogram filled = span visualisation
  const tipR = iHat
  const tipS = jHat
  const both = toCanvas([1, 1])
  ctx.beginPath()
  ctx.moveTo(origin[0], origin[1])
  ctx.lineTo(tipR[0], tipR[1])
  ctx.lineTo(both[0], both[1])
  ctx.lineTo(tipS[0], tipS[1])
  ctx.closePath()
  ctx.fillStyle = 'rgba(130, 160, 255, 0.08)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(130, 160, 255, 0.3)'
  ctx.lineWidth = 1
  ctx.stroke()
}

// ── Panel ─────────────────────────────────────────────────────────────────

function Panel({ matrix, setMatrix }: ModulePanelProps) {
  const col1: [number, number] = [matrix[0], matrix[2]]
  const col2: [number, number] = [matrix[1], matrix[3]]

  const det = matrix[0] * matrix[3] - matrix[1] * matrix[2]
  const isDependent = Math.abs(det) < 1e-8

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Basis Vectors & Column Space</h3>
      <p className={styles.desc}>
        The columns of the matrix are the images of the standard basis vectors. Together they span the column
        space (range) of the transformation. A singular matrix collapses one dimension.
      </p>

      <div className={styles.colsCard}>
        <div className={styles.colItem} style={{ borderColor: 'rgba(255,107,107,0.35)' }}>
          <span className={styles.colLabel} style={{ color: '#ff6b6b' }}>col₁ (image of î)</span>
          <span className={styles.colVal}>({col1[0].toFixed(3)}, {col1[1].toFixed(3)})</span>
        </div>
        <div className={styles.colItem} style={{ borderColor: 'rgba(81,207,102,0.35)' }}>
          <span className={styles.colLabel} style={{ color: '#51cf66' }}>col₂ (image of ĵ)</span>
          <span className={styles.colVal}>({col2[0].toFixed(3)}, {col2[1].toFixed(3)})</span>
        </div>
      </div>

      {isDependent && (
        <div className={styles.warning}>
          ⚠ Columns are linearly dependent — the transformation collapses to a line (rank 1 or 0).
        </div>
      )}

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Examples</h4>
        <div className={styles.btnRow}>
          <button className={styles.btn} onClick={() => setMatrix([1, 0, 0, 1])}>Standard basis</button>
          <button className={styles.btn} onClick={() => setMatrix([2, 1, 0, 2])}>Upper-triangular</button>
          <button className={styles.btn} onClick={() => setMatrix([1, 2, 2, 4])}>Rank 1</button>
          <button className={styles.btn} onClick={() => setMatrix([1, -1, 1, 1])}>Orthogonal cols</button>
        </div>
      </section>
    </div>
  )
}

export const BasisVectorsModule: LinearAlgebraModule = {
  id: 'basis',
  name: 'Basis Vectors',
  description: 'Visualise column space, span, and linear dependence.',
  renderPanel: (props) => <Panel {...props} />,
  onExtraDraw: extraDraw,
}
