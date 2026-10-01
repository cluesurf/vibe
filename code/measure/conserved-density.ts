// A LOCAL DENSITY ON THE KNIT'S STATE, AND THE QUANTITIES THE PACKAGE CALLS CONSERVED (E-FND-0170). A translation-
// invariant quantity of degree at most 2 and support one dock is Q(s) = sum over docks x of q(s at x), q a polynomial of
// degree <= 2 in the dock's TONE INDICATORS. A dock has 36 positions (its 24 slots, then its 12 lines' stores), each
// holding a trit; its indicators are [position = +1] and [position = -1] (an indicator squared is itself and the two of
// one position multiply to 0, so these span every function of degree <= 2 of the trits). The features:
//
//   0                        the constant (its sum is the dock count, the same for every state)
//   1 + 2 pos + (v < 0)      the 72 linear indicators, pos 0 .. 23 a slot, 24 .. 35 line pos - 24's store
//   73 + 4 k + 2 (va < 0) + (vb < 0)   the 2,520 products of two positions a < b of one dock (k the pair's index)
//
// so a degree-<= 2 density is a vector of 2,593 coefficients and Q(s) is its dot product with the state's FEATURE
// COUNTS, the sum over docks of each feature. A degree-1 density is one on the first 73. The points, the open marks and
// the stored pair words are not tone and are not read: the search is over functions of the occupation's trits.
//
//   dockFeatures        a configuration's feature counts on some docks, or their difference between two
//   docksApart          the docks where two configurations differ in any trit
//   featureName         a feature in words
//   featurePermutation  a dock symmetry (a permutation of the 24 slots, code/measure/dock-group) acting on the
//                       features: slot d -> g d, line l's store -> the line of g(first slot of l), its trit negated
//                       when g carries the first slot to a second slot (a stored tau is its FIRST slot's vibe)
//   namedDensities      the package's quantities as coefficient vectors: the love and fear counts (charge and
//                       energy, code/rule/bounce-pair-knit THE LAWS), the twelve line tones (E-SPN-0098's line law,
//                       summed over the lines of one direction), the per-direction love and fear counts, and the
//                       quantities the package says the coin breaks (the occupation momentum, the directed tones),
//                       with the vibe count and the store count alone
//
// DETERMINISM: no random numbers. EXACT: integer counts.

import { type Configuration } from '@/code/rule/doublet-locked-knit'
import { LINE_FIRSTS, LINE_OF, OPPOSITE, SIDE } from '@/code/rule/isometric-knit'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'

export const POSITIONS = 36
export const LINEAR_FEATURES = 1 + 2 * POSITIONS
export const PAIR_COUNT = (POSITIONS * (POSITIONS - 1)) / 2
export const DENSITY_FEATURES = LINEAR_FEATURES + 4 * PAIR_COUNT

const PAIR_INDEX = new Int32Array(POSITIONS * POSITIONS).fill(-1)
const PAIR_OF: [number, number][] = []

for (let a = 0; a < POSITIONS; a++) {
  for (let b = a + 1; b < POSITIONS; b++) {
    PAIR_INDEX[a * POSITIONS + b] = PAIR_OF.length
    PAIR_OF.push([a, b])
  }
}

export const linearFeature = (pos: number, v: number): number =>
  1 + 2 * pos + (v < 0 ? 1 : 0)

export function pairFeature(a: number, va: number, b: number, vb: number): number {
  if (a > b) {
    return pairFeature(b, vb, a, va)
  }

  return (
    LINEAR_FEATURES +
    4 * PAIR_INDEX[a * POSITIONS + b]! +
    (va < 0 ? 2 : 0) +
    (vb < 0 ? 1 : 0)
  )
}

const POS = new Int32Array(POSITIONS)
const VAL = new Int8Array(POSITIONS)

// add sign times dock x's features (degree 1 or 2) into `out`
function addDock(
  c: Configuration,
  x: number,
  sign: number,
  degree: 1 | 2,
  out: Map<number, number>,
): void {
  let k = 0

  for (let d = 0; d < 24; d++) {
    const v = c.vibe[x * 24 + d]!

    if (v !== 0) {
      POS[k] = d
      VAL[k] = v
      k++
    }
  }

  for (let l = 0; l < 12; l++) {
    const v = c.store[x * 12 + l]!

    if (v !== 0) {
      POS[k] = 24 + l
      VAL[k] = v
      k++
    }
  }

  const bump = (f: number): void => {
    out.set(f, (out.get(f) ?? 0) + sign)
  }

  for (let i = 0; i < k; i++) {
    bump(linearFeature(POS[i]!, VAL[i]!))

    if (degree === 2) {
      for (let j = i + 1; j < k; j++) {
        bump(pairFeature(POS[i]!, VAL[i]!, POS[j]!, VAL[j]!))
      }
    }
  }
}

// the docks where two configurations differ in a vibe or a store trit
export function docksApart(a: Configuration, b: Configuration, cells: number): number[] {
  const out: number[] = []

  for (let x = 0; x < cells; x++) {
    let differ = false

    for (let d = 0; d < 24 && !differ; d++) {
      differ = a.vibe[x * 24 + d] !== b.vibe[x * 24 + d]
    }

    for (let l = 0; l < 12 && !differ; l++) {
      differ = a.store[x * 12 + l] !== b.store[x * 12 + l]
    }

    if (differ) {
      out.push(x)
    }
  }

  return out
}

// the feature counts of `a` on `docks`, minus those of `b` on the same docks when `b` is given
export function dockFeatures(
  a: Configuration,
  docks: Iterable<number>,
  degree: 1 | 2,
  b?: Configuration,
): Map<number, number> {
  const out = new Map<number, number>()

  for (const x of docks) {
    addDock(a, x, 1, degree, out)

    if (b) {
      addDock(b, x, -1, degree, out)
    }
  }

  return out
}

// the difference of two feature-count maps, a - b
export function featureDifference(
  a: ReadonlyMap<number, number>,
  b: ReadonlyMap<number, number>,
): Map<number, number> {
  const out = new Map(a)

  b.forEach((v, f) => out.set(f, (out.get(f) ?? 0) - v))

  return out
}

const posName = (p: number): string => (p < 24 ? `slot ${p}` : `store ${p - 24}`)
const sgn = (neg: boolean): string => (neg ? '-' : '+')

export function featureName(f: number): string {
  if (f === 0) {
    return 'const'
  }

  if (f < LINEAR_FEATURES) {
    const pos = Math.floor((f - 1) / 2)

    return `[${posName(pos)} ${sgn((f - 1) % 2 === 1)}]`
  }

  const k = Math.floor((f - LINEAR_FEATURES) / 4)
  const r = (f - LINEAR_FEATURES) % 4
  const [a, b] = PAIR_OF[k]!

  return `[${posName(a)} ${sgn(r >= 2)}][${posName(b)} ${sgn(r % 2 === 1)}]`
}

// the image of every feature under a slot permutation of the dock (`slots[d]` the slot d goes to)
export function featurePermutation(slots: ArrayLike<number>): Int32Array {
  const pos = new Int32Array(POSITIONS)
  const flip = new Int8Array(POSITIONS).fill(1)

  for (let d = 0; d < 24; d++) {
    pos[d] = slots[d]!
  }

  for (let l = 0; l < 12; l++) {
    const e = slots[LINE_FIRSTS[l]!]!

    pos[24 + l] = 24 + LINE_OF[e]!
    flip[24 + l] = SIDE[e]!
  }

  const out = new Int32Array(DENSITY_FEATURES)

  for (let p = 0; p < POSITIONS; p++) {
    for (const v of [1, -1]) {
      out[linearFeature(p, v)] = linearFeature(pos[p]!, v * flip[p]!)
    }
  }

  PAIR_OF.forEach(([a, b]) => {
    for (const va of [1, -1]) {
      for (const vb of [1, -1]) {
        out[pairFeature(a, va, b, vb)] = pairFeature(
          pos[a]!,
          va * flip[a]!,
          pos[b]!,
          vb * flip[b]!,
        )
      }
    }
  })

  return out
}

export type NamedDensity = { name: string; vector: Float64Array }

const density = (name: string, fill: (v: Float64Array) => void): NamedDensity => {
  const vector = new Float64Array(DENSITY_FEATURES)

  fill(vector)

  return { name, vector }
}

const slotsOfLine = (l: number): [number, number] => [LINE_FIRSTS[l]!, OPPOSITE[LINE_FIRSTS[l]!]!]

// the package's quantities, the per-direction counts, and the ones the coin breaks
export function namedDensities(): {
  known: NamedDensity[]
  perLine: NamedDensity[]
  broken: NamedDensity[]
} {
  const lines = Array.from({ length: 12 }, (_, l) => l)
  const L = density('L (love count)', v => {
    for (let d = 0; d < 24; d++) {
      v[linearFeature(d, 1)] = 1
    }

    for (const l of lines) {
      v[linearFeature(24 + l, 1)] = 1
      v[linearFeature(24 + l, -1)] = 1
    }
  })
  const F = density('F (fear count)', v => {
    for (let d = 0; d < 24; d++) {
      v[linearFeature(d, -1)] = 1
    }

    for (const l of lines) {
      v[linearFeature(24 + l, 1)] = 1
      v[linearFeature(24 + l, -1)] = 1
    }
  })
  const tone = lines.map(l =>
    density(`T${l} (line ${l} tone)`, v => {
      for (const d of slotsOfLine(l)) {
        v[linearFeature(d, 1)] = 1
        v[linearFeature(d, -1)] = -1
      }
    }),
  )
  const loves = lines.map(l =>
    density(`L${l} (line ${l} loves)`, v => {
      for (const d of slotsOfLine(l)) {
        v[linearFeature(d, 1)] = 1
      }

      v[linearFeature(24 + l, 1)] = 1
      v[linearFeature(24 + l, -1)] = 1
    }),
  )
  const fears = lines.map(l =>
    density(`F${l} (line ${l} fears)`, v => {
      for (const d of slotsOfLine(l)) {
        v[linearFeature(d, -1)] = 1
      }

      v[linearFeature(24 + l, 1)] = 1
      v[linearFeature(24 + l, -1)] = 1
    }),
  )
  const momentum = [0, 1, 2, 3].map(k =>
    density(`P${k} (occupation momentum)`, v => {
      for (let d = 0; d < 24; d++) {
        v[linearFeature(d, 1)] = DOCK_ROOTS[d]![k]!
        v[linearFeature(d, -1)] = DOCK_ROOTS[d]![k]!
      }
    }),
  )
  const directed = lines.map(l =>
    density(`D${l} (line ${l} directed tone)`, v => {
      const [f, s] = slotsOfLine(l)

      v[linearFeature(f, 1)] = 1
      v[linearFeature(f, -1)] = -1
      v[linearFeature(s, 1)] = -1
      v[linearFeature(s, -1)] = 1
      v[linearFeature(24 + l, 1)] = 2
      v[linearFeature(24 + l, -1)] = -2
    }),
  )
  const vibes = density('vibe count', v => {
    for (let d = 0; d < 24; d++) {
      v[linearFeature(d, 1)] = 1
      v[linearFeature(d, -1)] = 1
    }
  })
  const stores = density('store count', v => {
    for (const l of lines) {
      v[linearFeature(24 + l, 1)] = 1
      v[linearFeature(24 + l, -1)] = 1
    }
  })

  return {
    known: [L, F, ...tone],
    perLine: [...loves, ...fears],
    broken: [...momentum, ...directed, vibes, stores],
  }
}
