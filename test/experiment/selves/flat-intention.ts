// P157: directed intention WORKS on the flat layer (where P145 said it belongs). (P145, P142, P144.)
//
// P145 found large-scale DIRECTED intention (a will steering a self toward a goal) is geometrically
// FRUSTRATED on the hyperbolic scaffold, no clean directions, dispersal. The diagnosis was that directed
// action, like relativistic physics, belongs to the emergent FLAT layer. This tests exactly that, the same
// willed bias on a FLAT 2D geometry, where directions are clean. The prediction, the self moves coherently
// toward the goal (net directed drift), strongly, where on the scaffold it could not. This completes the
// intention story, the COORDINATION half lives on the scaffold, the DIRECTED-ACTION half on the flat layer.
// Run: npx tsx code/experiment/p157-flat-intention.ts

import { flatWilledDriftSweep } from '@/code/dynamics/flat-willed-drift-sweep'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

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

  const run = (
    bias: number,
  ): { drift: number; spread: number; c0: number } => {
    const tone = new Int8Array(L * L)
    const moved = new Uint8Array(L * L)
    const rng = makeRng({ seed: 5 })
    // a self = a disk of + charge near the left-center (so it has room to move toward the +x goal)
    const cx = Math.floor(L * 0.3)
    const cy = Math.floor(L / 2)
    const r = 12
    for (let y = 0; y < L; y++)
      for (let x = 0; x < L; x++)
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) tone[y * L + x] = 1
    const centroidX = (): number => {
      let sx = 0
      let c = 0
      for (let yy = 0; yy < L; yy++)
        for (let xx = 0; xx < L; xx++)
          if (tone[yy * L + xx] !== 0) {
            sx += xx
            c++
          }
      return c > 0 ? sx / c : 0
    }
    const spreadOf = (): number => {
      let sx = 0
      let sxx = 0
      let c = 0
      for (let yy = 0; yy < L; yy++)
        for (let xx = 0; xx < L; xx++)
          if (tone[yy * L + xx] !== 0) {
            sx += xx
            sxx += xx * xx
            c++
          }
      const m = sx / c
      return Math.sqrt(sxx / c - m * m)
    }
    const c0 = centroidX()
    const sp0 = spreadOf()
    for (let t = 0; t < beats; t++)
      flatWilledDriftSweep({ tone, length: L, moved, rng, bias })
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
    beatsHyperbolicContrast:
      'P145 hyperbolic: net drift ~0, will-effect 0.41, top-down 0.04 (frustrated)',
    solved,
  }
}

export default experiment({
  id: 'selves/flat-intention',
  title: 'directed intention works on the flat layer',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = flatIntention({ L: 120 })
    const ok = r.solved && r.directedIntentionWorks
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the will steers a self toward a goal with a clear net directed drift on a flat grid, the directed-action half of intention that was frustrated on the hyperbolic scaffold',
      metrics: {
        driftWithWill: r.driftWithWill,
        driftNoWill: r.driftNoWill,
        willEffect: r.willEffect,
      },
    })
  },
})
