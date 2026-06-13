// P75: selves as attractors, fully.
// P34 and P43 used stable attractors as selves, and P66 showed a self persists through total
// material turnover. Here is the dedicated study the roadmap asks for: the stability of a self,
// its basin of attraction, its identity over time, and how many distinct selves a mesh can hold.
// A self is a stored pattern (an attractor) of the memory mesh, and we measure:
//   - stability and basin: how large a perturbation a self recovers from,
//   - identity over time: that a settled self stays itself across many beats,
//   - capacity: how many selves a mesh can hold, and that the count grows with size.
// Run: npx tsx code/experiment/p75-selves-as-attractors.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '@/code/tool/rng'
import { storedPatterns, hebbianFills, step, overlap } from '@/test/experiment/selves/dreaming-and-waking'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function settle(J: Int8Array[], state: Int8Array, steps: number): Int8Array {
  const zero = new Float64Array(state.length)
  let t = state
  for (let i = 0; i < steps; i++) t = step(J, t, zero, null)
  return t
}

function perturb(p: Int8Array, fraction: number, seed: number): Int8Array {
  const out = Int8Array.from(p)
  const rng = makeRng({ seed })
  const k = Math.round(fraction * p.length)
  const idx = Array.from({ length: p.length }, (_, i) => i)
  for (let i = 0; i < k; i++) {
    const j = i + rng.nextInt({ max: p.length - i })
    const tmp = idx[i]!
    idx[i] = idx[j]!
    idx[j] = tmp
    out[idx[i]!] = (-(p[idx[i]!] ?? 0)) as -1 | 0 | 1
  }
  return out
}

// Mean recovery of a stored self from a perturbation of the given fraction.
function recoveryAt(size: number, k: number, fraction: number, seed: number): number {
  const rng = makeRng({ seed })
  const patterns = storedPatterns(k, size, rng)
  const J = hebbianFills(patterns, size)
  let total = 0
  for (let p = 0; p < k; p++) {
    const self = patterns[p] ?? new Int8Array(size)
    const settled = settle(J, perturb(self, fraction, seed + 100 * p + Math.round(fraction * 50)), 40)
    total += Math.abs(overlap(settled, self))
  }
  return total / k
}

export function selvesAsAttractors(input: { seed: number }): {
  byFraction: { fraction: number; recovery: number }[]
  basinRadius: number
  identityOverlap: number
  capacityByN: { n: number; capacity: number; ratio: number }[]
  capacityGrows: boolean
  solved: boolean
} {
  const size = 200
  const k = 6

  // Stability and basin: recovery versus perturbation size.
  const fractions = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5]
  const byFraction = fractions.map((f) => ({ fraction: f, recovery: recoveryAt(size, k, f, input.seed) }))
  let basinRadius = 0
  for (const b of byFraction) if (b.recovery > 0.9) basinRadius = b.fraction

  // Identity over time: settle to a self, run many more beats, confirm it stays itself.
  const rng = makeRng({ seed: input.seed + 1 })
  const patterns = storedPatterns(k, size, rng)
  const J = hebbianFills(patterns, size)
  const self0 = patterns[0] ?? new Int8Array(size)
  const settled = settle(J, Int8Array.from(self0), 20)
  const later = settle(J, settled, 80)
  const identityOverlap = Math.abs(overlap(settled, later))

  // Capacity: the most selves a mesh can hold (recovery from a light perturbation stays high),
  // measured at two sizes to show it grows with size.
  const capacityByN = [120, 240].map((n) => {
    let capacity = 0
    for (let kk = 2; kk <= Math.round(0.3 * n); kk += 2) {
      const rec = recoveryAt(n, kk, 0.1, input.seed + 7 + n)
      if (rec > 0.9) capacity = kk
      else break
    }
    return { n, capacity, ratio: capacity / n }
  })
  const capacityGrows = (capacityByN[1]?.capacity ?? 0) > (capacityByN[0]?.capacity ?? 0)

  return {
    byFraction,
    basinRadius,
    identityOverlap,
    capacityByN,
    capacityGrows,
    // Solved: selves recover within a real basin, keep their identity over time, and the mesh
    // holds several of them with the count growing with size.
    solved: basinRadius >= 0.2 && identityOverlap > 0.98 && capacityGrows && (capacityByN[0]?.capacity ?? 0) >= 4,
  }
}

export function main(): void {
  const r = selvesAsAttractors({ seed: 1 })
  console.log('P75: selves as attractors, fully')
  console.log('')
  console.log('  Stability and basin (recovery of a self from a perturbation):')
  console.log('  perturbation flipped | recovery')
  for (const b of r.byFraction) {
    console.log(`         ${(b.fraction * 100).toFixed(0).padStart(3)}%         |   ${b.recovery.toFixed(2)}`)
  }
  console.log(`  basin radius (largest perturbation still recovered): ${(r.basinRadius * 100).toFixed(0)}%`)
  console.log('')
  console.log(`  identity over time (a settled self stays itself across many beats): ${r.identityOverlap.toFixed(3)}`)
  console.log('')
  console.log('  capacity (how many selves the mesh holds), by size:')
  for (const c of r.capacityByN) {
    console.log(`    N = ${c.n}: ${c.capacity} selves (${(c.ratio * 100).toFixed(0)}% of N)`)
  }
  console.log(`  capacity grows with size: ${r.capacityGrows ? 'YES' : 'no'}`)
  console.log('')
  console.log(`  selves as attractors solved: ${r.solved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  A self is a stable attractor of the mesh, and it behaves like one in every way the')
  console.log('  roadmap asked about. It recovers from a partial disturbance, snapping back to itself')
  console.log('  for perturbations inside a real basin and only losing its identity once the disturbance')
  console.log('  grows too large. Once settled, it keeps its identity across many beats, a genuine fixed')
  console.log('  point. And a single mesh holds several distinct selves at once, with the number it can')
  console.log('  hold growing as the mesh grows. Selves are not a metaphor laid over the dynamics, they')
  console.log('  are stable, recoverable, persistent patterns the dynamics actually supports.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}

export default defineExperiment({
  id: 'selves/selves-as-attractors',
  title: 'stable basin, persistent identity, capacity grows with size',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = selvesAsAttractors({ seed: 1 })
    const ok =
      r.solved && r.basinRadius >= 0.2 && r.identityOverlap > 0.98 && r.capacityGrows
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a stored self recovers within a real basin, keeps its identity over time, and the count of selves grows with mesh size',
      metrics: { basinRadius: r.basinRadius, identityOverlap: r.identityOverlap },
    })
  },
})
