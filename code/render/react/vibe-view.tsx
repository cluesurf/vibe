// The React mount for the interactive WebGPU renderer. This is a THIN wrapper, all the work (the fold core, the
// camera, the keyboard / mouse controls) lives in code/render/gpu and is framework-agnostic, so this component
// only owns the canvas element and the renderer's lifecycle. Changing `symbol` or `mode` rebuilds the renderer.
//
//   <VibeView symbol={[7, 3]} mode="2d" />            a 2D {p,q} tiling, walk with W/A/S/D, drag to look
//   <VibeView symbol={[5, 3, 4]} mode="3d-interior" /> fly the textured dodecahedral rooms

import { useEffect, useRef, useState } from 'react'
import {
  createVibeRenderer,
  type VibeRenderer,
} from '@/code/render/gpu/engine'
import type { FoldMode } from '@/code/render/gpu/fold-scene'

export type VibeViewProps = {
  symbol: number[]
  mode: FoldMode
  className?: string
  style?: React.CSSProperties
}

export function VibeView({
  symbol,
  mode,
  className,
  style,
}: VibeViewProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const key = `${symbol.join('-')}:${mode}`

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let renderer: VibeRenderer | null = null
    let disposed = false
    setError(null)
    createVibeRenderer({ canvas, symbol, mode })
      .then(r => {
        if (disposed) r.dispose()
        else renderer = r
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e)),
      )
    return () => {
      disposed = true
      renderer?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (
    <div
      className={className}
      style={{ position: 'relative', ...style }}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          outline: 'none',
          cursor: 'grab',
        }}
      />
      {error ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            padding: '2rem',
            textAlign: 'center',
            color: '#ddd',
            background: 'rgba(10,10,12,0.85)',
          }}
        >
          <div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              WebGPU could not start
            </p>
            <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{error}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
