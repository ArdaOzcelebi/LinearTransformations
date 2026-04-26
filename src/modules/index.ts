import { type ReactNode } from 'react'
import { type Matrix2 } from '../utils/mathHelpers'

/** The interface every module must implement. */
export interface LinearAlgebraModule {
  /** Short identifier used in routing / keys. */
  id: string
  /** Display name shown in the navigation. */
  name: string
  /** One-line description shown in the navigation tooltip. */
  description: string
  /** Render the module's side-panel controls / info. */
  renderPanel: (props: ModulePanelProps) => ReactNode
  /**
   * Optional: draw extra content on top of the shared TransformVisualizer canvas.
   * Receives the 2D rendering context and a helper that maps math-space coordinates
   * (after applying the current matrix) to canvas pixels.
   */
  onExtraDraw?: (
    ctx: CanvasRenderingContext2D,
    matrix: Matrix2,
    toCanvas: (v: [number, number]) => [number, number],
  ) => void
}

export interface ModulePanelProps {
  matrix: Matrix2
  /** Callback to push a new matrix to the shared visualiser. */
  setMatrix: (m: Matrix2) => void
}
