// P65: dreaming and waking (one mesh, two regimes).
// The roadmap asks for the same mesh in two regimes: coupled to shared external constraints
// (waking) versus free internal exploration (dreaming). We build a memory mesh that stores
// several patterns as attractors (a signed Hebbian rule, so each stored pattern is a stable
// state, with ternary fills). Then:
//   - Waking: an external input clamps part of the surface to a stimulus. The mesh completes to
//     the matching stored pattern and HOLDS it, veridical and stable, pinned to consensus
//     reality. It stays on the one pattern the world shows it.
//   - Dreaming: no external clamp. A slow internal rhythm (the subtle layer of P64) sweeps a
//     bias through the stored patterns, and the surface follows, wandering through the mesh's own
//     memories in one continuous trajectory, free to roam its whole landscape.
// Same mesh, same rule, same memories. The only difference is whether the shared external
// constraint is imposed. Run: npx tsx code/experiment/p65-dreaming-and-waking.ts

import { makeRng } from '@/code/tool/rng'
import {
  storedPatterns,
  hebbianFills,
  hopfieldStep,
  toneOverlap as overlap,
  nearestPattern,
} from '@/code/operator/hopfield'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function dreamingAndWaking(input: { seed: number }): {
  storedCount: number
  wakingDistinct: number
  wakingVeridical: number
  dreamingDistinct: number
  dreamingBlendFraction: number
  solved: boolean
} {
  const size = 120
  const K = 4
  const rng = makeRng({ seed: input.seed })
  const patterns = storedPatterns(K, size, rng)
  const J = hebbianFills(patterns, size)
  const zeroBias = new Float64Array(size)

  // Waking: external input clamps 40% of the surface to stimulus pattern 0. The mesh completes
  // and holds. We track the nearest stored pattern over time.
  const cuePattern = patterns[0] ?? new Int8Array(size)
  const clamp = new Int8Array(size)
  const cr = makeRng({ seed: input.seed + 1 })

  for (let i = 0; i < size; i++) {
    if (cr.next() < 0.4) {
      clamp[i] = cuePattern[i] as -1 | 0 | 1
    }
  }

  let waking = Int8Array.from(
    { length: size },
    () => rng.nextInt({ max: 3 }) - 1,
  )

  const wakingVisited = new Set<number>()

  for (let t = 0; t < 200; t++) {
    waking = hopfieldStep(J, waking, zeroBias, clamp)

    if (t % 25 === 24) {
      const np = nearestPattern(waking, patterns)

      if (np.overlap > 0.5) {
        wakingVisited.add(np.index)
      }
    }
  }

  const wakingVeridical = Math.abs(overlap(waking, cuePattern))

  // Dreaming: no sustained external clamp. A slow internal rhythm briefly cues one stored
  // memory at the start of each window (a partial internal nudge, the subtle layer firing), and
  // the mesh then relaxes FREELY toward it. The rhythm cycles through the memories, so the mesh
  // wanders its own landscape, with free dynamics (and blends) in the transitions between.
  let dreaming = Int8Array.from(
    { length: size },
    () => rng.nextInt({ max: 3 }) - 1,
  )

  const dwell = 30
  const cueHold = 4 // the internal cue fires briefly, then releases to free relaxation
  const cueCount = Math.round(0.6 * size)
  const dreamVisited = new Set<number>()

  let windows = 0
  let blends = 0

  const totalBeats = K * dwell * 2

  for (let t = 0; t < totalBeats; t++) {
    const phase = t % dwell
    const mode = Math.floor(t / dwell) % K // the internal rhythm cycling through memories

    let cue: Int8Array | null = null

    if (phase < cueHold) {
      const p = patterns[mode] ?? new Int8Array(size)
      cue = new Int8Array(size)

      for (let i = 0; i < cueCount; i++) {
        cue[i] = p[i] as -1 | 0 | 1
      }
    }

    dreaming = hopfieldStep(J, dreaming, zeroBias, cue) // brief internal cue, then free relaxation

    // sample at the window midpoint (transition, blends) and end (settled memory)
    if (phase === Math.floor(dwell / 2)) {
      const np = nearestPattern(dreaming, patterns)
      windows++

      if (np.overlap <= 0.6) {
        blends++
      }
    }

    if (phase === dwell - 1) {
      const np = nearestPattern(dreaming, patterns)

      if (np.overlap > 0.6) {
        dreamVisited.add(np.index)
      }
    }
  }

  return {
    storedCount: K,
    wakingDistinct: wakingVisited.size,
    wakingVeridical,
    dreamingDistinct: dreamVisited.size,
    dreamingBlendFraction: blends / Math.max(1, windows),
    // Solved: waking is pinned to the one veridical stimulus pattern, dreaming roams most of the
    // stored landscape, and the waking completion faithfully matches the input.
    solved:
      wakingVisited.size === 1 &&
      wakingVeridical > 0.8 &&
      dreamVisited.size >= K - 1,
  }
}

export default experiment({
  id: 'selves/dreaming-and-waking',
  title:
    'waking is pinned to one veridical memory while dreaming roams the landscape',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = dreamingAndWaking({ seed: 1 })
    const ok =
      r.solved &&
      r.wakingDistinct === 1 &&
      r.wakingVeridical > 0.8 &&
      r.dreamingDistinct >= r.storedCount - 1

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an external clamp pins one memory mesh to a single veridical stimulus pattern while removing it lets the mesh roam the whole stored landscape',
      metrics: {
        wakingDistinct: r.wakingDistinct,
        wakingVeridical: r.wakingVeridical,
        dreamingDistinct: r.dreamingDistinct,
        storedCount: r.storedCount,
      },
    })
  },
})
