import { useRef, useEffect, useCallback } from 'react'
import { type Matrix2, lerpMatrix, IDENTITY } from '../utils/mathHelpers'

interface AnimationOptions {
  duration?: number
  onUpdate: (matrix: Matrix2, progress: number) => void
  onComplete?: () => void
}

/**
 * Returns a `startAnimation(target)` function that drives a matrix animation
 * from IDENTITY to `target` via requestAnimationFrame.
 */
export function useTransformAnimation({ duration = 1000, onUpdate, onComplete }: AnimationOptions) {
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const targetRef = useRef<Matrix2>(IDENTITY)

  const cancel = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const startAnimation = useCallback(
    (target: Matrix2) => {
      cancel()
      targetRef.current = target
      startTimeRef.current = null

      const tick = (timestamp: number) => {
        if (startTimeRef.current === null) startTimeRef.current = timestamp
        const elapsed = timestamp - startTimeRef.current
        const t = Math.min(elapsed / duration, 1)
        // Ease in-out cubic
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        const current = lerpMatrix(IDENTITY, targetRef.current, eased)
        onUpdate(current, eased)

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          rafRef.current = null
          onComplete?.()
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    },
    [cancel, duration, onUpdate, onComplete],
  )

  // Clean up on unmount
  useEffect(() => () => cancel(), [cancel])

  return { startAnimation, cancel }
}
