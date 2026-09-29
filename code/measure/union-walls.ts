// A planted spatial wall read against its two ideal histories (E-RLT-0095). MEASUREMENT: every count is an exact
// integer and every comparison an exact comparison of trits. No rule code: the runs use code/measure/bounce-pair-kernel.
//
// THE READING. A wall is planted by giving the inside half of the box the image of the vacuum's store under one
// element (g, t, c) of the symmetry of the rule that is NOT a symmetry of the vacuum (a coset, E-RLT-0090). Three runs
// go in lockstep from the same links and layout: the planted run P, the vacuum A (the store everywhere) and the image
// vacuum B (the image store everywhere). A dock's OWN ideal is A outside and B inside. Over each window of W beats a
// dock HOLDS its own ideal when its 24 vibes and 12 stores equal the own run's at every beat of the window. This is
// E-RLT-0092's B' with the ideal fixed to the two planted ground states rather than any state of the vacuum's orbit,
// so it is at least as strict: a dock holding the other side's history departs.
//
//   E           the docks with a neighbor across the planted interface (the ideal wall's end docks)
//   departing   the docks that do not hold their own ideal
//   B'          at every window, departing is a subset of E and never grows from one window to the next
//
// HUSK FIRST. A husk dock is a column of bulk docks (code/measure/causal-components boxHusk). The husk reading is the
// number of columns holding a departing dock outside E; the bulk count is beside it.
//
// NOTHING MOVES: the stream copies values one dock along; this file only compares values.

import {
  bounceRunner,
  type BounceKernel,
} from '@/code/measure/bounce-pair-kernel'
import { type Reduced } from '@/code/measure/living-pair-kernel'

export type WallReading = {
  readonly windows: number
  readonly endDocks: number
  readonly departing: number[]
  readonly outside: number[]
  readonly outsideColumns: number[]
  readonly grew: number[]
  // departing docks that hold the OTHER side's ideal, and docks holding neither (the core), at the last window
  readonly holdsOther: number
  readonly holdsNeither: number
  // the departing set is the same at every window
  readonly frozen: boolean
  readonly passes: boolean
}

export type WallInput = {
  readonly kernel: BounceKernel
  readonly layout: Int8Array
  readonly store: Int8Array
  readonly image: Int8Array
  readonly inside: Uint8Array
  readonly column: Int32Array
  readonly columns: number
  readonly from: number
  readonly to: number
  readonly window: number
  // an optional edit of the planted run's start (a planted defect, the reader's control)
  readonly edit?: (s: Reduced) => void
}

const startOf = (
  cells: number,
  store: Int8Array,
  layout: Int8Array,
): Reduced => ({
  vibe: new Int8Array(cells * 24),
  point: new Int8Array(cells * 24),
  store: Int8Array.from(store),
  spoint: Int8Array.from(layout),
})

export function endDocks(
  kernel: BounceKernel,
  inside: Uint8Array,
): Uint8Array {
  const end = new Uint8Array(kernel.cells)

  for (let x = 0; x < kernel.cells; x++) {
    for (let d = 0; d < 24; d++) {
      const y = (kernel.target[x * 24 + d]! / 24) | 0

      if (inside[x] !== inside[y]) {
        end[x] = 1
        end[y] = 1
      }
    }
  }

  return end
}

export function readWall(input: WallInput): WallReading {
  const {
    kernel,
    layout,
    store,
    image,
    inside,
    column,
    columns,
    from,
    to,
    window,
  } = input
  const cells = kernel.cells
  const planted = Int8Array.from(store)

  for (let x = 0; x < cells; x++) {
    if (inside[x]) {
      planted.set(image.subarray(x * 12, x * 12 + 12), x * 12)
    }
  }

  const p0 = startOf(cells, planted, layout)

  input.edit?.(p0)

  const P = bounceRunner(kernel, p0)
  const A = bounceRunner(kernel, startOf(cells, store, layout))
  const B = bounceRunner(kernel, startOf(cells, image, layout))
  const end = endDocks(kernel, inside)
  const notOwn = new Uint8Array(cells)
  const notOther = new Uint8Array(cells)
  const out: {
    departing: number[]
    outside: number[]
    outsideColumns: number[]
    grew: number[]
  } = { departing: [], outside: [], outsideColumns: [], grew: [] }

  let previous: Uint8Array | undefined
  let frozen = true
  let holdsOther = 0
  let holdsNeither = 0
  let windows = 0

  const scratch = new Uint8Array(columns)

  if ((to - from) % window !== 0) {
    throw new Error('the reading span must be whole windows')
  }

  for (let t = 0; t < to; t++) {
    if (t >= from) {
      if ((t - from) % window === 0) {
        notOwn.fill(0)
        notOther.fill(0)
      }

      const p = P.state()
      const a = A.state()
      const b = B.state()

      for (let x = 0; x < cells; x++) {
        const own = inside[x] ? b : a
        const other = inside[x] ? a : b

        let dOwn = notOwn[x]!
        let dOther = notOther[x]!

        for (let d = 0; d < 24 && !(dOwn && dOther); d++) {
          const v = p.vibe[x * 24 + d]

          if (v !== own.vibe[x * 24 + d]) {
            dOwn = 1
          }

          if (v !== other.vibe[x * 24 + d]) {
            dOther = 1
          }
        }

        for (let l = 0; l < 12 && !(dOwn && dOther); l++) {
          const v = p.store[x * 12 + l]

          if (v !== own.store[x * 12 + l]) {
            dOwn = 1
          }

          if (v !== other.store[x * 12 + l]) {
            dOther = 1
          }
        }

        notOwn[x] = dOwn
        notOther[x] = dOther
      }

      if ((t - from) % window === window - 1) {
        windows++

        let n = 0
        let outside = 0
        let grew = 0

        scratch.fill(0)
        holdsOther = 0
        holdsNeither = 0

        for (let x = 0; x < cells; x++) {
          if (!notOwn[x]) {
            continue
          }

          n++

          if (notOther[x]) {
            holdsNeither++
          } else {
            holdsOther++
          }

          if (!end[x]) {
            outside++
            scratch[column[x]!] = 1
          }

          if (previous && !previous[x]) {
            grew++
          }
        }

        if (previous) {
          for (let x = 0; x < cells && frozen; x++) {
            frozen = previous[x] === notOwn[x]
          }
        }

        out.departing.push(n)
        out.outside.push(outside)
        out.outsideColumns.push(scratch.reduce((s, v) => s + v, 0))

        if (previous) {
          out.grew.push(grew)
        }

        previous = Uint8Array.from(notOwn)
      }
    }

    P.beat()
    A.beat()
    B.beat()
  }

  let endCount = 0

  for (let x = 0; x < cells; x++) {
    endCount += end[x]!
  }

  const passes =
    out.outside.every(v => v === 0) && out.grew.every(v => v === 0)

  return {
    windows,
    endDocks: endCount,
    ...out,
    holdsOther,
    holdsNeither,
    frozen,
    passes,
  }
}
