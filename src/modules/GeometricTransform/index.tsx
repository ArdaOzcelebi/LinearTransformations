import { type LinearAlgebraModule, type ModulePanelProps } from '../index'
import { type Matrix2 } from '../../utils/mathHelpers'
import styles from './GeometricTransform.module.css'

// ── Preset generators ──────────────────────────────────────────────────────

function rotation(deg: number): Matrix2 {
  const r = (deg * Math.PI) / 180
  return [Math.cos(r), -Math.sin(r), Math.sin(r), Math.cos(r)]
}

function scaling(sx: number, sy: number): Matrix2 {
  return [sx, 0, 0, sy]
}

function shearX(k: number): Matrix2 {
  return [1, k, 0, 1]
}

function shearY(k: number): Matrix2 {
  return [1, 0, k, 1]
}

// ── Panel ─────────────────────────────────────────────────────────────────

function Panel({ setMatrix }: ModulePanelProps) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Geometric Transformations</h3>
      <p className={styles.desc}>
        Explore how rotation, scaling, and shearing affect the grid. Each button sets the matrix and triggers the
        animation.
      </p>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Rotation</h4>
        <div className={styles.btnRow}>
          {[30, 45, 60, 90, 120, 180].map((deg) => (
            <button key={deg} className={styles.btn} onClick={() => setMatrix(rotation(deg))}>
              {deg}°
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Uniform Scaling</h4>
        <div className={styles.btnRow}>
          {[0.5, 1.5, 2, 3].map((s) => (
            <button key={s} className={styles.btn} onClick={() => setMatrix(scaling(s, s))}>
              ×{s}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Shear</h4>
        <div className={styles.btnRow}>
          {[0.5, 1, 2].map((k) => (
            <button key={`sx${k}`} className={styles.btn} onClick={() => setMatrix(shearX(k))}>
              X k={k}
            </button>
          ))}
          {[0.5, 1, 2].map((k) => (
            <button key={`sy${k}`} className={styles.btn} onClick={() => setMatrix(shearY(k))}>
              Y k={k}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Reflections</h4>
        <div className={styles.btnRow}>
          <button className={styles.btn} onClick={() => setMatrix([1, 0, 0, -1])}>
            Over X-axis
          </button>
          <button className={styles.btn} onClick={() => setMatrix([-1, 0, 0, 1])}>
            Over Y-axis
          </button>
          <button className={styles.btn} onClick={() => setMatrix([0, 1, 1, 0])}>
            Over y=x
          </button>
          <button className={styles.btn} onClick={() => setMatrix([0, -1, -1, 0])}>
            Over y=−x
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Projections</h4>
        <div className={styles.btnRow}>
          <button className={styles.btn} onClick={() => setMatrix([1, 0, 0, 0])}>
            Onto X-axis
          </button>
          <button className={styles.btn} onClick={() => setMatrix([0, 0, 0, 1])}>
            Onto Y-axis
          </button>
          <button className={styles.btn} onClick={() => setMatrix([0.5, 0.5, 0.5, 0.5])}>
            Onto y=x
          </button>
        </div>
      </section>
    </div>
  )
}

export const GeometricTransformModule: LinearAlgebraModule = {
  id: 'geometric',
  name: 'Geometric Transforms',
  description: 'Rotation, scaling, shearing, reflections, and projections.',
  renderPanel: (props) => <Panel {...props} />,
}
