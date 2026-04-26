import * as math from 'mathjs'

/** A 2×2 matrix represented as a flat array [a, b, c, d] → [[a,b],[c,d]] */
export type Matrix2 = [number, number, number, number]

export const IDENTITY: Matrix2 = [1, 0, 0, 1]

/** Linearly interpolate between two matrices element-wise. */
export function lerpMatrix(a: Matrix2, b: Matrix2, t: number): Matrix2 {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
    a[3] + (b[3] - a[3]) * t,
  ]
}

/** Apply a 2×2 matrix to a 2D vector. */
export function applyMatrix(m: Matrix2, v: [number, number]): [number, number] {
  return [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]]
}

/** Compute the determinant of a 2×2 matrix. */
export function det2(m: Matrix2): number {
  return m[0] * m[3] - m[1] * m[2]
}

/** Flatten a mathjs MathCollection to a plain number array. */
function flattenCollection(c: math.MathCollection): number[] {
  if (Array.isArray(c)) return c as number[]
  return (c as math.Matrix).toArray() as number[]
}

/** Compute eigenvalues of a 2×2 matrix using math.js. Returns null if complex. */
export function eigenvalues2(m: Matrix2): [number, number] | null {
  try {
    const matrix = math.matrix([[m[0], m[1]], [m[2], m[3]]])
    const result = math.eigs(matrix)
    const vals = flattenCollection(result.values) as (number | math.Complex)[]
    if (vals.some((v) => typeof v === 'object' && 'im' in v && (v as math.Complex).im !== 0)) {
      return null
    }
    const reals = vals.map((v) =>
      typeof v === 'number' ? v : (v as math.Complex).re
    ) as [number, number]
    return reals
  } catch {
    return null
  }
}

/** Compute eigenvectors of a 2×2 matrix using math.js.
 *  Returns array of unit vectors or null if complex eigenvalues. */
export function eigenvectors2(m: Matrix2): [[number, number], [number, number]] | null {
  try {
    const matrix = math.matrix([[m[0], m[1]], [m[2], m[3]]])
    const result = math.eigs(matrix)
    const vecs = (result.eigenvectors as { value: number; vector: math.MathCollection }[])
    if (vecs.length < 2) return null
    const v0 = flattenCollection(vecs[0].vector)
    const v1 = flattenCollection(vecs[1].vector)
    // Normalise
    const norm0 = Math.hypot(v0[0], v0[1])
    const norm1 = Math.hypot(v1[0], v1[1])
    if (norm0 === 0 || norm1 === 0) return null
    return [
      [v0[0] / norm0, v0[1] / norm0],
      [v1[0] / norm1, v1[1] / norm1],
    ]
  } catch {
    return null
  }
}

/** Perform one step of Gaussian elimination on an augmented matrix [A|b].
 *  Returns the sequence of row-operation descriptions and intermediate matrices. */
export interface GaussStep {
  description: string
  matrix: number[][]
}

export function gaussianElimination(augmented: number[][]): GaussStep[] {
  const steps: GaussStep[] = []
  const m = augmented.map((row) => [...row])
  const rows = m.length
  const cols = m[0].length

  steps.push({ description: 'Initial augmented matrix [A|b]', matrix: m.map((r) => [...r]) })

  let pivotRow = 0
  for (let col = 0; col < cols - 1 && pivotRow < rows; col++) {
    // Find pivot
    let maxRow = pivotRow
    for (let r = pivotRow + 1; r < rows; r++) {
      if (Math.abs(m[r][col]) > Math.abs(m[maxRow][col])) maxRow = r
    }
    if (Math.abs(m[maxRow][col]) < 1e-10) continue

    // Swap
    if (maxRow !== pivotRow) {
      ;[m[pivotRow], m[maxRow]] = [m[maxRow], m[pivotRow]]
      steps.push({
        description: `Swap R${pivotRow + 1} ↔ R${maxRow + 1}`,
        matrix: m.map((r) => [...r]),
      })
    }

    // Eliminate below
    for (let r = pivotRow + 1; r < rows; r++) {
      if (Math.abs(m[r][col]) < 1e-10) continue
      const factor = m[r][col] / m[pivotRow][col]
      for (let c = col; c < cols; c++) {
        m[r][c] -= factor * m[pivotRow][c]
      }
      const factorStr = factor.toFixed(3)
      steps.push({
        description: `R${r + 1} ← R${r + 1} − (${factorStr})·R${pivotRow + 1}`,
        matrix: m.map((row) => [...row]),
      })
    }
    pivotRow++
  }

  // Back substitution
  for (let r = rows - 1; r >= 0; r--) {
    const pivotCol = m[r].findIndex((v, ci) => ci < cols - 1 && Math.abs(v) > 1e-10)
    if (pivotCol < 0) continue
    const scale = m[r][pivotCol]
    if (Math.abs(scale - 1) > 1e-10) {
      for (let c = pivotCol; c < cols; c++) m[r][c] /= scale
      steps.push({
        description: `R${r + 1} ← R${r + 1} / ${scale.toFixed(3)}`,
        matrix: m.map((row) => [...row]),
      })
    }
    for (let above = r - 1; above >= 0; above--) {
      const factor = m[above][pivotCol]
      if (Math.abs(factor) < 1e-10) continue
      for (let c = pivotCol; c < cols; c++) m[above][c] -= factor * m[r][c]
      steps.push({
        description: `R${above + 1} ← R${above + 1} − (${factor.toFixed(3)})·R${r + 1}`,
        matrix: m.map((row) => [...row]),
      })
    }
  }

  return steps
}
