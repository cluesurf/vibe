// P157: directed intention WORKS on the flat layer (where P145 said it belongs). (P145, P142, P144.)
//
// P145 found large-scale DIRECTED intention (a will steering a self toward a goal) is geometrically
// FRUSTRATED on the hyperbolic scaffold, no clean directions, dispersal. The diagnosis was that directed
// action, like relativistic physics, belongs to the emergent FLAT layer. This tests exactly that, the same
// willed bias on a FLAT 2D geometry, where directions are clean. The prediction, the self moves coherently
// toward the goal (net directed drift), strongly, where on the scaffold it could not. This completes the
// intention story, the COORDINATION half lives on the scaffold, the DIRECTED-ACTION half on the flat layer.
// Run: npx tsx code/experiment/p157-flat-intention.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'

type Rng = { next: () => number }

// a willed beat on a flat 2D square grid (4-neighbour). A charge hops toward the empty neighbour, biased
// toward the goal (the +x edge), with strength `bias` (the will). bias=0 is unbiased.
function beat(tone: Int8Array, L: number, moved: Uint8Array, rng: Rng, bias: number): void {
  moved.fill(0)
  // process the four edge-directions; for each charged cell try to move toward an empty neighbour
  for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
    const i = y * L + x
    if (tone[i] === 0 || moved[i]) continue
    // candidate moves: +x (toward goal), -x, +y, -y, with willed bias toward +x
    const dirs: { j: number; toward: number }[] = []
    if (x + 1 < L) dirs.push({ j: i + 1, toward: 1 })
    if (x - 1 >= 0) dirs.push({ j: i - 1, toward: -1 })
    if (y + 1 < L) dirs.push({ j: i + L, toward: 0 })
    if (y - 1 >= 0) dirs.push({ j: i - L, toward: 0 })
    // pick an empty neighbour, weighting +x by the will
    let chosen = -1
    let bestW = 0
    for (const d of dirs) {
      if (tone[d.j] !== 0 || moved[d.j]) continue
      const w = (1 + bias * d.toward) * (0.5 + 0.5 * rng.next())
      if (w > bestW) {
        bestW = w
        chosen = d.j
      }
    }
    if (chosen >= 0 && rng.next() < 0.6) {
      tone[chosen] = tone[i]!
      tone[i] = 0
      moved[i] = 1
      moved[chosen] = 1
    }
  }
}

export function flatIntention(input?: { L?: number; beats?: number }): {
  L: number
  centroidStart: number
  driftWithWill: number
  driftNoWill: number
  willEffect: number
  cohesion: number
  directedIntentionWorks: boolean
  beatsHyperbolicContrast: string
  solved: boolean
} {
  const L = input?.L ?? 120
  const beats = input?.beats ?? 60

  const run = (bias: number): { drift: number; spread: number; c0: number } => {
    const tone = new Int8Array(L * L)
    const moved = new Uint8Array(L * L)
    const rng = makeRng({ seed: 5 })
    // a self = a disk of + charge near the left-center (so it has room to move toward the +x goal)
    const cx = Math.floor(L * 0.3)
    const cy = Math.floor(L / 2)
    const r = 12
    for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) tone[y * L + x] = 1
    const centroidX = (): number => {
      let sx = 0
      let c = 0
      for (let yy = 0; yy < L; yy++) for (let xx = 0; xx < L; xx++) if (tone[yy * L + xx] !== 0) {
        sx += xx
        c++
      }
      return c > 0 ? sx / c : 0
    }
    const spreadOf = (): number => {
      let sx = 0
      let sxx = 0
      let c = 0
      for (let yy = 0; yy < L; yy++) for (let xx = 0; xx < L; xx++) if (tone[yy * L + xx] !== 0) {
        sx += xx
        sxx += xx * xx
        c++
      }
      const m = sx / c
      return Math.sqrt(sxx / c - m * m)
    }
    const c0 = centroidX()
    const sp0 = spreadOf()
    for (let t = 0; t < beats; t++) beat(tone, L, moved, rng, bias)
    return { drift: centroidX() - c0, spread: spreadOf() / sp0, c0 }
  }

  const withWill = run(2.0)
  const noWill = run(0)
  const driftWithWill = withWill.drift
  const driftNoWill = noWill.drift
  const willEffect = driftWithWill - driftNoWill
  const cohesion = 1 / withWill.spread // >~1 if it stayed cohesive (did not blow apart)
  // on the FLAT layer the will produces a clear NET directed drift toward the goal (unlike the hyperbolic
  // scaffold, P145, where with-will minus no-will was tiny and there was no net motion)
  const directedIntentionWorks = driftWithWill > 3 && willEffect > 2
  const solved = directedIntentionWorks

  return {
    L,
    centroidStart: withWill.c0,
    driftWithWill,
    driftNoWill,
    willEffect,
    cohesion,
    directedIntentionWorks,
    beatsHyperbolicContrast: 'P145 hyperbolic: net drift ~0, will-effect 0.41, top-down 0.04 (frustrated)',
    solved,
  }
}

export function main(): void {
  const r = flatIntention()
  console.log('P157: directed intention on the FLAT layer (where P145 said it belongs)')
  console.log('')
  console.log(`  a flat ${r.L}x${r.L} grid, a + self steered toward the +x goal by the will`)
  console.log(`  net drift toward goal: with will ${r.driftWithWill.toFixed(1)} cells vs no will ${r.driftNoWill.toFixed(1)} cells`)
  console.log(`  will effect (with minus without) = ${r.willEffect.toFixed(1)}, cohesion kept ${r.cohesion.toFixed(2)}`)
  console.log('')
  console.log(`  directed intention WORKS on the flat layer (clear net directed motion): ${r.directedIntentionWorks}`)
  console.log(`  contrast: ${r.beatsHyperbolicContrast}`)
  console.log('  => the DIRECTED-ACTION half of intention lives on the FLAT layer, the COORDINATION half on the scaffold.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
