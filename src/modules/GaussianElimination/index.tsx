import { useState } from 'react'
import { type LinearAlgebraModule, type ModulePanelProps } from '../index'
import { gaussianElimination, type GaussStep } from '../../utils/mathHelpers'
import styles from './GaussianElimination.module.css'

// ── Panel ─────────────────────────────────────────────────────────────────

function Panel({ matrix }: ModulePanelProps) {
  // Build a 2×3 augmented matrix from the 2×2 matrix + a RHS
  const [rhs, setRhs] = useState<[number, number]>([1, 1])
  const [steps, setSteps] = useState<GaussStep[] | null>(null)
  const [stepIdx, setStepIdx] = useState(0)

  const augmented = [
    [matrix[0], matrix[1], rhs[0]],
    [matrix[2], matrix[3], rhs[1]],
  ]

  const runElimination = () => {
    const result = gaussianElimination(augmented)
    setSteps(result)
    setStepIdx(0)
  }

  const currentStep = steps ? steps[Math.min(stepIdx, steps.length - 1)] : null

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Gaussian Elimination</h3>
      <p className={styles.desc}>
        Solve Ax = b by reducing the augmented matrix [A | b] to row-echelon form. Step through each elementary
        row operation.
      </p>

      {/* Augmented matrix preview */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Augmented matrix [A | b]</h4>
        <div className={styles.augmented}>
          <table className={styles.matTable}>
            <tbody>
              {augmented.map((row, r) => (
                <tr key={r}>
                  {row.map((val, c) => (
                    <td key={c} className={`${styles.cell} ${c === 2 ? styles.rhsCell : ''}`}>
                      {c === 2 && <span className={styles.bar}>|</span>}
                      {val.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.rhsInputs}>
            <span className={styles.rhsLabel}>b =</span>
            {rhs.map((v, i) => (
              <input
                key={i}
                className={styles.rhsInput}
                type="number"
                step="1"
                value={v}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  if (!isNaN(val)) setRhs((prev) => (i === 0 ? [val, prev[1]] : [prev[0], val]))
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Run button */}
      <button className={styles.runBtn} onClick={runElimination}>
        ▶ Run Elimination
      </button>

      {/* Steps */}
      {steps && currentStep && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>
            Step {stepIdx + 1} of {steps.length}
          </h4>
          <div className={styles.stepDesc}>{currentStep.description}</div>

          <table className={styles.matTable}>
            <tbody>
              {currentStep.matrix.map((row, r) => (
                <tr key={r}>
                  {row.map((val, c) => (
                    <td key={c} className={`${styles.cell} ${c === row.length - 1 ? styles.rhsCell : ''}`}>
                      {c === row.length - 1 && <span className={styles.bar}>|</span>}
                      {Math.abs(val) < 1e-10 ? '0' : val.toFixed(3)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Navigation */}
          <div className={styles.navRow}>
            <button
              className={styles.navBtn}
              disabled={stepIdx === 0}
              onClick={() => setStepIdx((s) => s - 1)}
            >
              ‹ Prev
            </button>
            <div className={styles.dots}>
              {steps.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === stepIdx ? styles.dotActive : ''}`}
                  onClick={() => setStepIdx(i)}
                />
              ))}
            </div>
            <button
              className={styles.navBtn}
              disabled={stepIdx === steps.length - 1}
              onClick={() => setStepIdx((s) => s + 1)}
            >
              Next ›
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export const GaussianEliminationModule: LinearAlgebraModule = {
  id: 'gaussian',
  name: 'Gaussian Elimination',
  description: 'Step through row operations to solve Ax = b.',
  renderPanel: (props) => <Panel {...props} />,
}
