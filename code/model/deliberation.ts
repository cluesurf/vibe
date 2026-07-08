// Deliberation: a phenomenological model of how a DETERMINISTIC self makes a choice.
//
// A self is a set of stored ternary patterns, the options it can settle into, held as a
// Hopfield attractor memory. An urge is a bias field arriving from a subtler layer. A choice
// is the self relaxing, under its own stored structure plus the urge, from a starting state
// into one definite pattern. The relaxation is fully deterministic: the same self, the same
// urge, and the same start always give the same trajectory and the same final choice. There
// is no randomness in the dynamics. Randomness appears only in CONSTRUCTING a self or an
// urge (a fixed structured pattern chosen by a seed), and robustness is checked by varying
// the size, never by averaging over seeds.
//
// This is the shared engine for the freedom experiments. An experiment imports it and keeps
// only its own claim. The model is L2: a known construction (a Hopfield attractor under a
// bias field) used to exhibit the compatibilist structure of choice. It is NOT a claim that
// selves emerge from the five base things, which is the separate, harder self-emergence work.

import { makeRng, Rng } from '@/code/tool/rng'
import { toneOverlap } from '@/code/operator/hopfield'

export type Tone = -1 | 0 | 1

// a fixed ternary pattern of length n, drawn from a seeded source (a structured initial
// condition, deterministic given the seed)
export function ternaryVector(n: number, rng: Rng): Int8Array {
  const v = new Int8Array(n)

  for (let i = 0; i < n; i++) {
    v[i] = rng.nextInt({ max: 3 }) - 1
  }

  return v
}

const GOLDEN = (1 + Math.sqrt(5)) / 2
const SILVER = 1 + Math.sqrt(2)

// The deterministic replacement for ternaryVector: a fixed ternary pattern of length n with NO
// randomness, built from two low-discrepancy (golden and silver ratio) irrational rotations. Site i of
// pattern `index` is floor(3 * frac((i + 1) * GOLDEN + index * SILVER)) - 1, which is equidistributed
// over {-1, 0, +1} by Weyl's theorem and gives a distinct, reproducible pattern per index. Robustness
// is checked by varying the SIZE n, never by averaging over a random seed.
export function ternaryPattern(n: number, index: number): Int8Array {
  const v = new Int8Array(n)
  for (let i = 0; i < n; i++) {
    const frac = (((i + 1) * GOLDEN + index * SILVER) % 1 + 1) % 1
    v[i] = Math.floor(3 * frac) - 1
  }
  return v
}

// A self built from deterministic patterns (the golden-ratio construction), the drop-in deterministic
// replacement for makeSelf: `patterns` distinct ternary attractors, indices 0..patterns-1, no seed.
export function makeSelfPattern(input: {
  n: number
  patterns: number
  offset?: number
}): Int8Array[] {
  const offset = input.offset ?? 0
  return Array.from({ length: input.patterns }, (_unused, k) =>
    ternaryPattern(input.n, offset + k),
  )
}

// a self: `patterns` stored ternary patterns, the options it can settle into (its attractors)
export function makeSelf(input: {
  n: number
  patterns: number
  seed: number
}): Int8Array[] {
  const rng = makeRng({ seed: input.seed })

  return Array.from({ length: input.patterns }, () =>
    ternaryVector(input.n, rng),
  )
}

// one relaxation step: the local field at each site is the self's own Hopfield field (its
// structure pulling toward its stored patterns) plus the urge bias, and each site takes the
// sign of that field. Returns the next state and whether anything changed.
function step(input: {
  state: Int8Array
  patterns: Int8Array[]
  coupling: number
  urge: Int8Array
  urgeWeight: number
}): { next: Int8Array; changed: boolean } {
  const { state, patterns, coupling, urge, urgeWeight } = input
  const n = state.length

  // the overlap of each stored pattern with the current state (the Hopfield projection)
  const proj = patterns.map(xi => {
    let o = 0

    for (let j = 0; j < n; j++) {
      o += (xi[j] ?? 0) * (state[j] ?? 0)
    }

    return o / n
  })

  const next = new Int8Array(n)

  let changed = false

  for (let i = 0; i < n; i++) {
    let h = urgeWeight * (urge[i] ?? 0)

    for (let m = 0; m < patterns.length; m++) {
      h += coupling * (patterns[m]![i] ?? 0) * (proj[m] ?? 0)
    }

    const t: Tone = h > 1e-12 ? 1 : h < -1e-12 ? -1 : 0
    next[i] = t

    if (t !== state[i]) {
      changed = true
    }
  }

  return { next, changed }
}

// settle the self under an urge from a given start, returning the chosen state and the number
// of beats it took (its settling time). Deterministic in its inputs.
export function settle(input: {
  patterns: Int8Array[]
  coupling: number
  urge: Int8Array
  urgeWeight: number
  init: Int8Array
  maxBeats?: number
}): { state: Int8Array; beats: number } {
  const maxBeats = input.maxBeats ?? 100

  let state = Int8Array.from(input.init)

  let beats = 0

  for (let b = 0; b < maxBeats; b++) {
    const { next, changed } = step({
      state,
      patterns: input.patterns,
      coupling: input.coupling,
      urge: input.urge,
      urgeWeight: input.urgeWeight,
    })

    state = next
    beats++

    if (!changed) {
      break
    }
  }

  return { state, beats }
}

// settle but keep the whole trajectory, one state per beat (the lived path of the choice),
// for measuring how the outcome reveals itself only as the deliberation runs
export function settleTrace(input: {
  patterns: Int8Array[]
  coupling: number
  urge: Int8Array
  urgeWeight: number
  init: Int8Array
  maxBeats?: number
}): { states: Int8Array[]; beats: number } {
  const maxBeats = input.maxBeats ?? 100
  const states: Int8Array[] = []

  let state = Int8Array.from(input.init)

  let beats = 0

  for (let b = 0; b < maxBeats; b++) {
    const { next, changed } = step({
      state,
      patterns: input.patterns,
      coupling: input.coupling,
      urge: input.urge,
      urgeWeight: input.urgeWeight,
    })

    state = next
    states.push(Int8Array.from(state))
    beats++

    if (!changed) {
      break
    }
  }

  return { states, beats }
}

// the naive shortcut: guess the outcome in one step from the urge alone, ignoring the self.
// This is the cheapest possible predictor, the thing a reductive read of the inputs would do.
export function oneStepGuess(urge: Int8Array): Int8Array {
  const n = urge.length
  const out = new Int8Array(n)

  for (let i = 0; i < n; i++) {
    out[i] = (urge[i] ?? 0) > 0 ? 1 : (urge[i] ?? 0) < 0 ? -1 : 0
  }

  return out
}

// the fraction of sites at which two states differ (0 identical, 1 fully different)
export function hammingFraction(a: Int8Array, b: Int8Array): number {
  const n = Math.min(a.length, b.length)

  if (n === 0) {
    return 0
  }

  let diff = 0

  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) {
      diff++
    }
  }

  return diff / n
}

// a LOSSY coarse read of a state: split it into `blocks` contiguous blocks and keep only the
// SIGN of each block's tone sum. This is the self's own internal, compressed view of a state,
// the partial model it actually has access to, far smaller than the micro-state it summarizes.
export function blockCoarse(
  state: Int8Array,
  blocks: number,
): Int8Array {
  const n = state.length
  const out = new Int8Array(blocks)
  const size = Math.ceil(n / blocks)

  for (let b = 0; b < blocks; b++) {
    let sum = 0

    for (let i = b * size; i < Math.min(n, (b + 1) * size); i++) {
      sum += state[i] ?? 0
    }

    out[b] = sum > 0 ? 1 : sum < 0 ? -1 : 0
  }

  return out
}

// two coarse reads are equal when every block agrees: the lossy model cannot tell the two
// underlying micro-states apart
export function coarseEqual(a: Int8Array, b: Int8Array): boolean {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

// an urge is not injected from outside, it is the voice of a self's PARTS. Given the sub-selves (drives, modules,
// the body's lower layers), the urge the upper self feels is the coarse aggregate of their states: at each site the
// sign of the parts' summed tone. So "where the urge comes from" is, literally, your parts speaking together.
export function aggregateUrge(parts: Int8Array[]): Int8Array {
  const n = parts[0]?.length ?? 0
  const out = new Int8Array(n)

  for (let i = 0; i < n; i++) {
    let s = 0

    for (const p of parts) {
      s += p[i] ?? 0
    }

    out[i] = s > 0 ? 1 : s < 0 ? -1 : 0
  }

  return out
}

// how much a settled state IS one of the self's own stored options, the largest overlap with any stored pattern.
// High means the act is authored by the self (it landed in one of its own attractors). Low means the act is not
// the self's own, it was dictated by something uncorrelated with its structure.
export function selfCoherence(
  state: Int8Array,
  patterns: Int8Array[],
): number {
  let best = 0

  for (const p of patterns) {
    const o = Math.abs(toneOverlap(state, p))

    if (o > best) {
      best = o
    }
  }

  return best
}

// one consensus step that binds sub-selves into a higher self: each sub-self moves toward the group's aggregate
// voice (coupling) plus its own inertia. With strong coupling the sub-selves converge to a shared pattern, the
// higher self's body, and the group acts as one. With zero coupling each keeps to itself and no higher self forms.
export function consensusStep(
  subs: Int8Array[],
  coupling: number,
): Int8Array[] {
  const aggregate = aggregateUrge(subs)

  return subs.map(s => {
    const out = new Int8Array(s.length)

    for (let i = 0; i < s.length; i++) {
      const h = coupling * (aggregate[i] ?? 0) + (s[i] ?? 0)
      out[i] = h > 0 ? 1 : h < 0 ? -1 : 0
    }

    return out
  })
}

// settle, but each beat override the first `injectSites` sites with an EXOGENOUS pattern uncorrelated with the self
// (a deterministic stand-in for an uncaused, not-by-you input). As more sites are pinned to the exogenous values,
// the act is dictated less by the self and more by the outside, so its self-coherence falls. Used to show that an
// uncaused spark does not create freedom, it erodes authorship.
export function settleWithInjection(input: {
  patterns: Int8Array[]
  coupling: number
  urge: Int8Array
  urgeWeight: number
  init: Int8Array
  inject: Int8Array
  injectSites: number
  maxBeats?: number
}): { state: Int8Array; beats: number } {
  const maxBeats = input.maxBeats ?? 100
  const k = Math.min(input.injectSites, input.init.length)

  let state = Int8Array.from(input.init)

  let beats = 0

  for (let b = 0; b < maxBeats; b++) {
    const { next } = step({
      state,
      patterns: input.patterns,
      coupling: input.coupling,
      urge: input.urge,
      urgeWeight: input.urgeWeight,
    })

    for (let i = 0; i < k; i++) {
      next[i] = input.inject[i] ?? 0
    }

    let changed = false

    for (let i = 0; i < next.length; i++) {
      if (next[i] !== state[i]) {
        changed = true
      }
    }

    state = next
    beats++

    if (!changed) {
      break
    }
  }

  return { state, beats }
}
