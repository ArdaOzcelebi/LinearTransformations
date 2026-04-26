import { useRef, useEffect, useCallback } from 'react'
import { type Matrix2, applyMatrix, det2 } from '../utils/mathHelpers'
import styles from './TransformVisualizer.module.css'

interface Props {
  matrix: Matrix2
  showGrid: boolean
  showBasis: boolean
  /** Optional extra draw pass (used by modules to draw on top). */
  onExtraDraw?: (ctx: CanvasRenderingContext2D, toCanvas: (v: [number, number]) => [number, number]) => void
}

const GRID_RANGE = 6      // grid lines from -GRID_RANGE to +GRID_RANGE
const CANVAS_SIZE = 560   // logical px (we'll scale with devicePixelRatio)

/** Convert a math-space coordinate to canvas pixel using the current matrix. */
function makeToCanvas(size: number, m: Matrix2) {
  const half = size / 2
  const scale = size / (GRID_RANGE * 2 + 2) // a bit of padding
  return (v: [number, number]): [number, number] => {
    const t = applyMatrix(m, v)
    return [half + t[0] * scale, half - t[1] * scale]
  }
}

/** Same but without applying the matrix – just world-to-canvas. */
function makeWorldToCanvas(size: number) {
  const half = size / 2
  const scale = size / (GRID_RANGE * 2 + 2)
  return (v: [number, number]): [number, number] => [half + v[0] * scale, half - v[1] * scale]
}

export function TransformVisualizer({ matrix, showGrid, showBasis, onExtraDraw }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const physicalSize = CANVAS_SIZE * dpr

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    const toCanvas = makeToCanvas(CANVAS_SIZE, matrix)
    const worldToCanvas = makeWorldToCanvas(CANVAS_SIZE)
    const determinant = det2(matrix)
    const isFlipped = determinant < 0

    // ── Background ────────────────────────────────────────────────
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // ── Transformed grid ─────────────────────────────────────────
    if (showGrid) {
      ctx.lineWidth = 0.5

      // Vertical lines (originally x = constant)
      for (let x = -GRID_RANGE; x <= GRID_RANGE; x++) {
        const [x0, y0] = toCanvas([x, -GRID_RANGE])
        const [x1, y1] = toCanvas([x, GRID_RANGE])
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.strokeStyle = x === 0 ? 'rgba(100,120,200,0.6)' : 'rgba(60,80,140,0.35)'
        ctx.stroke()
      }

      // Horizontal lines (originally y = constant)
      for (let y = -GRID_RANGE; y <= GRID_RANGE; y++) {
        const [x0, y0] = toCanvas([-GRID_RANGE, y])
        const [x1, y1] = toCanvas([GRID_RANGE, y])
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.strokeStyle = y === 0 ? 'rgba(100,120,200,0.6)' : 'rgba(60,80,140,0.35)'
        ctx.stroke()
      }
    }

    // ── Axes (always visible in world space) ─────────────────────
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(150,160,200,0.4)'
    // X axis
    ctx.beginPath()
    ctx.moveTo(...worldToCanvas([-GRID_RANGE - 1, 0]))
    ctx.lineTo(...worldToCanvas([GRID_RANGE + 1, 0]))
    ctx.stroke()
    // Y axis
    ctx.beginPath()
    ctx.moveTo(...worldToCanvas([0, -GRID_RANGE - 1]))
    ctx.lineTo(...worldToCanvas([0, GRID_RANGE + 1]))
    ctx.stroke()

    // ── Determinant parallelogram ─────────────────────────────────
    if (showGrid) {
      const alpha = Math.min(Math.abs(determinant) * 0.04, 0.18)
      const col = isFlipped ? `rgba(220,60,80,${alpha})` : `rgba(80,200,140,${alpha})`
      const [o] = [toCanvas([0, 0])]
      const [ix, iy] = toCanvas([1, 0])
      const [jx, jy] = toCanvas([0, 1])
      const ex = ix + jx - o[0]
      const ey = iy + jy - o[1]
      ctx.beginPath()
      ctx.moveTo(...o)
      ctx.lineTo(ix, iy)
      ctx.lineTo(ex, ey)
      ctx.lineTo(jx, jy)
      ctx.closePath()
      ctx.fillStyle = col
      ctx.fill()
    }

    // ── Basis vectors ─────────────────────────────────────────────
    if (showBasis) {
      drawArrow(ctx, toCanvas([0, 0]), toCanvas([1, 0]), '#ff6b6b', 2.5, 'î')
      drawArrow(ctx, toCanvas([0, 0]), toCanvas([0, 1]), '#51cf66', 2.5, 'ĵ')
    }

    // ── Origin dot ───────────────────────────────────────────────
    const origin = worldToCanvas([0, 0])
    ctx.beginPath()
    ctx.arc(origin[0], origin[1], 3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(200,210,255,0.6)'
    ctx.fill()

    // ── Determinant label ─────────────────────────────────────────
    ctx.font = '12px Inter, system-ui, sans-serif'
    ctx.fillStyle = isFlipped ? '#ff6b6b' : '#74c0fc'
    ctx.fillText(`det = ${determinant.toFixed(3)}`, 10, CANVAS_SIZE - 10)

    // ── Module overlay ────────────────────────────────────────────
    onExtraDraw?.(ctx, toCanvas)
  }, [matrix, showGrid, showBasis, onExtraDraw, dpr])

  // Re-draw whenever props change
  useEffect(() => {
    draw()
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      width={physicalSize}
      height={physicalSize}
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
    />
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: [number, number],
  to: [number, number],
  color: string,
  lineWidth: number,
  label: string,
) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const angle = Math.atan2(dy, dx)
  const arrowLen = 10

  ctx.lineWidth = lineWidth
  ctx.strokeStyle = color
  ctx.fillStyle = color

  // Shaft
  ctx.beginPath()
  ctx.moveTo(from[0], from[1])
  ctx.lineTo(to[0], to[1])
  ctx.stroke()

  // Arrowhead
  ctx.beginPath()
  ctx.moveTo(to[0], to[1])
  ctx.lineTo(to[0] - arrowLen * Math.cos(angle - Math.PI / 6), to[1] - arrowLen * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(to[0] - arrowLen * Math.cos(angle + Math.PI / 6), to[1] - arrowLen * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()

  // Label
  ctx.font = 'bold 13px Inter, system-ui, sans-serif'
  const offsetX = 14 * Math.cos(angle - 0.3)
  const offsetY = 14 * Math.sin(angle - 0.3)
  ctx.fillText(label, to[0] + offsetX, to[1] + offsetY)
}
