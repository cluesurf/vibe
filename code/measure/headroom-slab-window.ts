// E-GRV-0126's slab rerun on a window set by the headroom light's own speed (test/experiment/gravity/headroom-slab-window).
// Everything but the window is code/measure/headroom-slab's: the rooms, the medium, the packet, the detectors, the rest
// rates, the eikonal and the Newtonian counts come from headroomSlabSurvey unchanged, and the reference and slab runs
// are runHeadroom again over the new window.
//
// THE WINDOW, fixed before any run of this file. E-GRV-0093's 3,600 beats were sized for a light at the full-room speed
// c0; the reference light here runs at c0 k0 / C, so the same distance takes C / k0 times as long:
//   window = ceil(3600 C / k0) + SLAB_WINDOW_MARGIN,    SLAB_WINDOW_MARGIN = 64 (one energy reading)
// At C 243, k0 169 that is 5,177 + 64 = 5,241 beats. The margin is one SLAB_EVERY so the kept energy is read at least
// once past the scaled time; it is not a fit to any arrival. The rule reads only C, k0 and E-GRV-0093's window.
//
// THE WRAP BOUND (reported, gating nothing): a longer window gives the packet's -x half more time to come round the
// ring to the far detector from the other side. Its earliest eikonal arrival there is the -x path's time, the
// intervals from the source down through x = 0 and round to the last detector, each at (k0 / k) / c_ref. It is printed
// beside the window so a reader can check the window stays short of it.
//
// DETERMINISM: every start is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import {
  spanPacket,
  SPAN_LENS_WINDOW,
  SPAN_LEVELS,
} from '@/code/measure/depth-span'
import {
  runHeadroom,
  SLAB_BASE,
  SLAB_EVERY,
  type HeadroomRun,
  type HeadroomSlabSurvey,
} from '@/code/measure/headroom-slab'
import {
  LENS_AMP,
  LENS_DETECTORS,
  LENS_HALF_WIDTH,
  LENS_LINE,
  LENS_SOURCE_X,
  RADION_DEPTH,
} from '@/code/measure/radion'
import { dockAt } from '@/code/measure/varying-depth-light'
import { makeHeadroomSpanMedium } from '@/code/rule/depth-span-light'

export const SLAB_WINDOW_MARGIN = SLAB_EVERY

// the rule, from the light's own speed: E-GRV-0093's window in the reference light's time, plus the margin
export const slabWindow = (reference: number): number =>
  Math.ceil((SPAN_LENS_WINDOW * SLAB_BASE) / reference) +
  SLAB_WINDOW_MARGIN

export type HeadroomSlabWindow = {
  window: number
  uniform: HeadroomRun
  lens: HeadroomRun
  measuredDelay: number
  // the -x half's earliest eikonal arrival at the last detector, round the ring, on the slab and on the reference
  wrapSlab: number
  wrapReference: number
  seconds: number
}

let cache: HeadroomSlabWindow | undefined

export function headroomSlabWindow(
  s: HeadroomSlabSurvey,
  log?: (what: string) => void,
): HeadroomSlabWindow {
  if (cache) {
    return cache
  }

  const started = Date.now()
  const n = LENS_DETECTORS.length - 1
  const [sx] = LENS_LINE
  const last = LENS_DETECTORS[n]!
  const window = slabWindow(s.reference)
  const flat = makeHeadroomSpanMedium(
    LENS_LINE,
    RADION_DEPTH,
    SLAB_BASE,
    () => s.reference,
  )
  const slab = makeHeadroomSpanMedium(
    LENS_LINE,
    RADION_DEPTH,
    SLAB_BASE,
    x => s.room[x]!,
  )
  const start = spanPacket(
    flat,
    SPAN_LEVELS,
    LENS_SOURCE_X,
    LENS_AMP,
    LENS_HALF_WIDTH,
  )
  const detectors = LENS_DETECTORS.map(x => dockAt(flat, x, 0, 0))
  const uniform = runHeadroom(
    flat,
    start,
    detectors,
    window,
    SLAB_EVERY,
  )

  log?.(`window ${window} uniform ${uniform.seconds}s`)

  const lens = runHeadroom(slab, start, detectors, window, SLAB_EVERY)

  log?.(`window ${window} slab ${lens.seconds}s`)

  // the -x path: intervals [x, x + 1] for x from the source - 1 down to 0, then from sx - 1 down to the last detector
  let wrapSlab = 0
  let wrapReference = 0

  for (let x = LENS_SOURCE_X - 1; x >= 0; x--) {
    wrapSlab +=
      s.reference / Math.min(s.room[x]!, s.room[(x + 1) % sx]!) / s.c0
    wrapReference += 1 / s.c0
  }

  for (let x = sx - 1; x >= last; x--) {
    wrapSlab +=
      s.reference / Math.min(s.room[x]!, s.room[(x + 1) % sx]!) / s.c0
    wrapReference += 1 / s.c0
  }

  cache = {
    window,
    uniform,
    lens,
    measuredDelay:
      lens.arrival[n]! -
      lens.arrival[0]! -
      (uniform.arrival[n]! - uniform.arrival[0]!),
    wrapSlab,
    wrapReference,
    seconds: (Date.now() - started) / 1000,
  }

  return cache
}
