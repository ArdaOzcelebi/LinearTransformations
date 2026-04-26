import styles from './Controls.module.css'

interface Preset {
  label: string
  matrix: [number, number, number, number]
}

const PRESETS: Preset[] = [
  { label: 'Identity', matrix: [1, 0, 0, 1] },
  { label: 'Rotate 90°', matrix: [0, -1, 1, 0] },
  { label: 'Scale 2×', matrix: [2, 0, 0, 2] },
  { label: 'Shear X', matrix: [1, 1, 0, 1] },
  { label: 'Reflect X', matrix: [1, 0, 0, -1] },
  { label: 'Reflect Y', matrix: [-1, 0, 0, 1] },
  { label: 'Squeeze', matrix: [2, 0, 0, 0.5] },
  { label: 'Projection', matrix: [1, 0, 0, 0] },
]

interface Props {
  showGrid: boolean
  showBasis: boolean
  isAnimating: boolean
  onToggleGrid: () => void
  onToggleBasis: () => void
  onAnimate: () => void
  onReset: () => void
  onPreset: (m: [number, number, number, number]) => void
}

export function Controls({
  showGrid,
  showBasis,
  isAnimating,
  onToggleGrid,
  onToggleBasis,
  onAnimate,
  onReset,
  onPreset,
}: Props) {
  return (
    <div className={styles.wrapper}>
      {/* Toggle switches */}
      <div className={styles.toggleGroup}>
        <button
          className={`${styles.toggle} ${showGrid ? styles.active : ''}`}
          onClick={onToggleGrid}
        >
          <span className={styles.toggleIcon}>⊞</span> Grid
        </button>
        <button
          className={`${styles.toggle} ${showBasis ? styles.active : ''}`}
          onClick={onToggleBasis}
        >
          <span className={styles.toggleIcon}>→</span> Basis
        </button>
      </div>

      {/* Action buttons */}
      <div className={styles.actionGroup}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onAnimate}
          disabled={isAnimating}
        >
          {isAnimating ? 'Animating…' : '▶ Animate'}
        </button>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onReset}>
          ↺ Reset
        </button>
      </div>

      {/* Presets */}
      <div className={styles.presets}>
        <span className={styles.presetsLabel}>Presets</span>
        <div className={styles.presetsGrid}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              className={styles.preset}
              onClick={() => onPreset(p.matrix)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
