import { type Matrix2 } from '../utils/mathHelpers'
import styles from './MatrixInput.module.css'

interface Props {
  matrix: Matrix2
  onChange: (m: Matrix2) => void
}

const LABELS = [
  ['a', 'b'],
  ['c', 'd'],
] as const

export function MatrixInput({ matrix, onChange }: Props) {
  const handle = (index: number, raw: string) => {
    const value = parseFloat(raw)
    if (isNaN(value)) return
    const next = [...matrix] as Matrix2
    next[index] = value
    onChange(next)
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.bracket}>[</span>
      <div className={styles.grid}>
        {matrix.map((val, i) => (
          <div key={i} className={styles.cell}>
            <label className={styles.label}>{LABELS[Math.floor(i / 2)][i % 2]}</label>
            <input
              className={styles.input}
              type="number"
              step="0.1"
              value={val}
              onChange={(e) => handle(i, e.target.value)}
            />
          </div>
        ))}
      </div>
      <span className={styles.bracket}>]</span>
    </div>
  )
}
