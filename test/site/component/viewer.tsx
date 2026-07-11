// The shared interactive viewer, a full-screen WebGPU canvas plus an overlay panel (a symbol picker and a
// controls legend). All rendering and navigation come from the vibe engine (VibeView); this component is just
// the page chrome around it.

import { useState } from 'react'
import { Link } from 'react-router'
import { VibeView } from '@/code/render/react/vibe-view'
import type { FoldMode } from '@/code/render/gpu/fold-scene'

export type ViewerProps = {
  title: string
  mode: FoldMode
  symbols: { label: string; value: number[] }[]
  hint: string
}

export function Viewer({
  title,
  mode,
  symbols,
  hint,
}: ViewerProps): React.ReactElement {
  const [symbol, setSymbol] = useState<number[]>(symbols[0]!.value)
  const is3D = mode !== '2d'

  return (
    <div className='viewer'>
      <VibeView
        symbol={symbol}
        mode={mode}
        className='viewer-canvas'
      />

      <div className='panel'>
        <Link
          to='/'
          className='back'
        >
          ← vibe
        </Link>
        <h1>{title}</h1>

        <label className='field'>
          <span>tessellation</span>
          <select
            value={symbol.join('-')}
            onChange={e =>
              setSymbol(
                symbols.find(s => s.value.join('-') === e.target.value)!
                  .value,
              )
            }
          >
            {symbols.map(s => (
              <option
                key={s.value.join('-')}
                value={s.value.join('-')}
              >
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <div className='legend'>
          <p className='hint'>{hint}</p>
          <dl>
            <dt>W / ↑</dt>
            <dd>forward</dd>
            <dt>S / ↓</dt>
            <dd>back</dd>
            <dt>A / ←</dt>
            <dd>turn left</dd>
            <dt>D / →</dt>
            <dd>turn right</dd>
            {is3D ? (
              <>
                <dt>Q / E</dt>
                <dd>strafe</dd>
                <dt>Space / Shift</dt>
                <dd>rise / sink</dd>
              </>
            ) : null}
            <dt>drag</dt>
            <dd>{is3D ? 'look around' : 'turn view'}</dd>
            <dt>wheel</dt>
            <dd>{is3D ? 'dolly forward' : 'zoom'}</dd>
          </dl>
        </div>
      </div>
    </div>
  )
}
