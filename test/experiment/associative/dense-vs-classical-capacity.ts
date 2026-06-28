// F2: a DENSE (higher-order) energy holds far more patterns than the CLASSICAL Hopfield
// at the same recall. The classical pairwise energy saturates near 0.14 N stored patterns,
// crosstalk between the linear couplings overwhelms recall past that. A sharper, higher-order
// energy (the modern-Hopfield / dense-associative-memory family) separates the patterns far
// more strongly, the capacity grows super-linearly, even exponentially in N with a sharp
// enough nonlinearity. See land/text/papers/more-4/notes/papers/ for the expected scaling
// (Krotov-Hopfield dense memories, modern Hopfield networks). Nothing is imported from there.
//
// Classical update, next = sign of the linear Hebbian field (operator/hopfield). Dense update,
// next site = the sign favored by the patterns weighted by a SHARP separation of their overlap
// with the cue (a high power of the overlap), which is the dense-associative-memory energy.

import {
  storedPatterns,
  hebbianFills,
  hopfieldStep,
  toneOverlap,
  nearestPattern,
} from '@/code/operator/hopfield'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// One dense (higher-order) update beat. For each site, every stored pattern votes for its own
// sign there, weighted by overlap(cue, pattern) raised to a high power. The sharp power picks
// the single closest prototype out of a crowded bank, so crosstalk does not pile up the way it
// does in the linear field. This is the dense-associative-memory recall rule.
function denseStep(input: {
  patterns: Int8Array[]
  state: Int8Array
  power: number
}): Int8Array {
  const { patterns, state, power } = input
  const n = state.length
  const overlaps = patterns.map(p => Math.max(0, toneOverlap(state, p)))
  const weights = overlaps.map(o => Math.pow(o, power))
  const next = new Int8Array(n)

  for (let i = 0; i < n; i++) {
    let h = 0

    for (let m = 0; m < patterns.length; m++) {
      h += (weights[m] ?? 0) * (patterns[m]![i] ?? 0)
    }

    next[i] = h > 0 ? 1 : h < 0 ? -1 : (state[i] ?? 0)
  }

  return next
}

// Classical relax, repeated linear Hebbian beats until the state settles into a pairwise attractor.
function classicalRelax(input: {
  J: Int8Array[]
  cue: Int8Array
  beats: number
}): Int8Array {
  const zero = new Float64Array(input.cue.length)

  let s = Int8Array.from(input.cue)

  for (let t = 0; t < input.beats; t++) {
    s = hopfieldStep(input.J, s, zero, null)
  }

  return s
}

// Dense relax, repeated higher-order beats.
function denseRelax(input: {
  patterns: Int8Array[]
  cue: Int8Array
  beats: number
  power: number
}): Int8Array {
  let s = Int8Array.from(input.cue)

  for (let t = 0; t < input.beats; t++) {
    s = denseStep({
      patterns: input.patterns,
      state: s,
      power: input.power,
    })
  }

  return s
}

// Recall rate for a bank of `patternCount` patterns under a relax function, averaged over
// every pattern with a fixed-fraction corrupted cue. Deterministic given the seeds.
function recallRate(input: {
  size: number
  patternCount: number
  fraction: number
  relax: (cue: Int8Array, patterns: Int8Array[]) => Int8Array
}): number {
  const { size, patternCount, fraction, relax } = input
  const patterns = storedPatterns(
    patternCount,
    size,
    makeRng({ seed: 1 }),
  )

  let hits = 0

  for (let m = 0; m < patternCount; m++) {
    const rng = makeRng({ seed: 200 + m })
    const cue = Int8Array.from(patterns[m]!)

    for (let i = 0; i < size; i++) {
      if (rng.next() < fraction) {
        cue[i] = -(cue[i] ?? 0)
      }
    }

    if (nearestPattern(relax(cue, patterns), patterns).index === m) {
      hits++
    }
  }

  return hits / patternCount
}

export function denseVsClassicalCapacity(input?: {
  size?: number
  fraction?: number
  power?: number
}): {
  size: number
  classicalCapacity: number
  denseCapacity: number
  solved: boolean
} {
  const size = input?.size ?? 120
  const fraction = input?.fraction ?? 0.1
  const power = input?.power ?? 8
  const target = 0.9

  // Capacity, the largest P at which the relax still recalls at the target rate. Sweep P up.
  const capacityOf = (
    relax: (cue: Int8Array, patterns: Int8Array[]) => Int8Array,
  ): number => {
    let best = 0

    for (let P = 2; P <= size; P++) {
      const rate = recallRate({
        size,
        patternCount: P,
        fraction,
        relax,
      })

      if (rate >= target) {
        best = P
      } else if (P > 4 && rate < target - 0.2) {
        break
      }
    }

    return best
  }

  const classicalCapacity = capacityOf((cue, patterns) =>
    classicalRelax({ J: hebbianFills(patterns, size), cue, beats: 8 }),
  )

  const denseCapacity = capacityOf((cue, patterns) =>
    denseRelax({ patterns, cue, beats: 8, power }),
  )

  // PASS, the dense (higher-order) energy holds strictly more patterns at the matched recall.
  const solved = denseCapacity > classicalCapacity

  return { size, classicalCapacity, denseCapacity, solved }
}

export default experiment({
  id: 'associative/dense-vs-classical-capacity',
  code: 'E-MMR-0004',
  title:
    'a dense higher-order energy stores more patterns than the classical Hopfield at matched recall',
  category: 'associative',
  substrates: ['any'],
  depth: 'L2',
  paper: true,
  run() {
    const r = denseVsClassicalCapacity()

    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'sweeping the stored pattern count, the dense higher-order energy still recalls a corrupted cue at the target rate for many more patterns than the classical pairwise Hopfield, so its capacity exceeds the classical at matched recall',
      metrics: {
        classicalCapacity: r.classicalCapacity,
        denseCapacity: r.denseCapacity,
        size: r.size,
        classicalRatio: r.classicalCapacity / r.size,
        denseRatio: r.denseCapacity / r.size,
      },
      control: { classicalCapacity: r.classicalCapacity },
    })
  },
})
