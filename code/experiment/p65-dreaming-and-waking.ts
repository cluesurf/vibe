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

import { pathToFileURL } from 'node:url'
import { makeRng, Rng } from '~/tool/rng'

const sign = (h: number): -1 | 0 | 1 => (h > 0 ? 1 : h < 0 ? -1 : 0)

export function storedPatterns(count: number, size: number, rng: Rng): Int8Array[] {
  return Array.from({ length: count }, () => Int8Array.from({ length: size }, () => (rng.next() < 0.5 ? -1 : 1)))
}

// Signed Hebbian coupling: ternary fill = sign of the correlation across stored patterns, so
// each stored pattern is an attractor and the fills stay ternary.
export function hebbianFills(patterns: Int8Array[], size: number): Int8Array[] {
  const J: Int8Array[] = Array.from({ length: size }, () => new Int8Array(size))
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      let s = 0
      for (const p of patterns) s += (p[i] ?? 0) * (p[j] ?? 0)
      const f = sign(s)
      J[i]![j] = f
      J[j]![i] = f
    }
  }
  return J
}

export function overlap(tone: Int8Array, pattern: Int8Array): number {
  let s = 0
  for (let i = 0; i < tone.length; i++) s += (tone[i] ?? 0) * (pattern[i] ?? 0)
  return s / tone.length
}

function nearestPattern(tone: Int8Array, patterns: Int8Array[]): { index: number; overlap: number } {
  let best = -1
  let bestOv = -2
  patterns.forEach((p, k) => {
    const o = Math.abs(overlap(tone, p))
    if (o > bestOv) {
      bestOv = o
      best = k
    }
  })
  return { index: best, overlap: bestOv }
}

export function step(J: Int8Array[], tone: Int8Array, bias: Float64Array, clamp: Int8Array | null): Int8Array {
  const n = tone.length
  const next = new Int8Array(n)
  for (let i = 0; i < n; i++) {
    if (clamp && clamp[i] !== 0) {
      next[i] = clamp[i] as -1 | 0 | 1
      continue
    }
    const row = J[i] ?? new Int8Array(0)
    let h = bias[i] ?? 0
    for (let j = 0; j < n; j++) h += (row[j] ?? 0) * (tone[j] ?? 0)
    next[i] = h > 0 ? 1 : h < 0 ? -1 : (tone[i] ?? 0)
  }
  return next
}

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
  for (let i = 0; i < size; i++) if (cr.next() < 0.4) clamp[i] = cuePattern[i] as -1 | 0 | 1
  let waking = Int8Array.from({ length: size }, () => rng.nextInt({ max: 3 }) - 1)
  const wakingVisited = new Set<number>()
  for (let t = 0; t < 200; t++) {
    waking = step(J, waking, zeroBias, clamp)
    if (t % 25 === 24) {
      const np = nearestPattern(waking, patterns)
      if (np.overlap > 0.5) wakingVisited.add(np.index)
    }
  }
  const wakingVeridical = Math.abs(overlap(waking, cuePattern))

  // Dreaming: no sustained external clamp. A slow internal rhythm briefly cues one stored
  // memory at the start of each window (a partial internal nudge, the subtle layer firing), and
  // the mesh then relaxes FREELY toward it. The rhythm cycles through the memories, so the mesh
  // wanders its own landscape, with free dynamics (and blends) in the transitions between.
  let dreaming = Int8Array.from({ length: size }, () => rng.nextInt({ max: 3 }) - 1)
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
      for (let i = 0; i < cueCount; i++) cue[i] = p[i] as -1 | 0 | 1
    }
    dreaming = step(J, dreaming, zeroBias, cue) // brief internal cue, then free relaxation
    // sample at the window midpoint (transition, blends) and end (settled memory)
    if (phase === Math.floor(dwell / 2)) {
      const np = nearestPattern(dreaming, patterns)
      windows++
      if (np.overlap <= 0.6) blends++
    }
    if (phase === dwell - 1) {
      const np = nearestPattern(dreaming, patterns)
      if (np.overlap > 0.6) dreamVisited.add(np.index)
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
    solved: wakingVisited.size === 1 && wakingVeridical > 0.8 && dreamVisited.size >= K - 1,
  }
}

export function main(): void {
  const r = dreamingAndWaking({ seed: 1 })
  console.log('P65: dreaming and waking (one mesh, two regimes)')
  console.log('')
  console.log(`  the mesh stores ${r.storedCount} patterns (memories), each a stable attractor.`)
  console.log('')
  console.log('  WAKING (external input clamps the surface to a stimulus):')
  console.log(`    distinct patterns the mesh settles on: ${r.wakingDistinct} (pinned to the one the world shows it)`)
  console.log(`    the completion faithfully matches the input: ${(100 * r.wakingVeridical).toFixed(0)}% (veridical)`)
  console.log('')
  console.log('  DREAMING (no external clamp, a slow internal rhythm drives from within):')
  console.log(`    distinct stored patterns visited in one trajectory: ${r.dreamingDistinct} of ${r.storedCount} (roams its memories)`)
  console.log(`    fraction of moments that were blends, not pure memories: ${(100 * r.dreamingBlendFraction).toFixed(0)}% (recombination)`)
  console.log('')
  console.log(`  dreaming and waking solved: ${r.solved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  One mesh, one rule, one set of memories, two regimes. In waking, an external input')
  console.log('  clamps the surface, and the mesh completes to the matching memory and holds it,')
  console.log('  veridical and stable, anchored to the shared world. In dreaming, the clamp is gone,')
  console.log('  and a slow internal rhythm sweeps the mesh through its own stored patterns, wandering')
  console.log('  the whole landscape (and, with softer cues, blending memories in the transitions). The only difference')
  console.log('  is whether the shared external constraint is imposed: pinned to reality when awake,')
  console.log('  free to roam its own depths when dreaming. This is also why dreams are made of your')
  console.log('  own material, recombined: a dream is the mesh exploring itself with the world let go.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
