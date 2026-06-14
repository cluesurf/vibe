// P64: subtle-layer urges (the deep self biasing the surface).
// P43 modeled an urge as an abstract bias field. Here the urge is a real, slower, deeper layer
// of the mesh. We build a two-scale mesh: a fast, dense surface layer (the conscious mind, many
// vibes, updating every beat) coupled to a slow, sparse subtle layer (the deep self, fewer
// vibes, with high inertia). The subtle layer's state biases the surface through their shared
// notes. We show:
//   1. Steering: the same surface situation, under a different deep state, settles to a
//      different surface outcome, and the effect grows with how deeply the layers are coupled.
//      This is the urge: a pull from below that shapes what the surface resolves to (P43).
//   2. Persistence and reassertion: the deep layer is stable, and after the surface is thrown
//      into disorder it pulls the surface back toward its own pattern. The deep self endures and
//      reimposes its urge.
// Run: npx tsx code/experiment/p64-subtle-layer-urges.ts

import { makeRng, Rng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

interface TwoScale {
  n: number
  slowCount: number
  neighbors: number[][]
  fills: Int8Array[]
}

// Build a two-scale mesh. Nodes [0, slowCount) are the slow subtle layer, [slowCount, n) the
// fast surface. Surface is dense among itself, each surface vibe couples to `coupling` subtle
// vibes (the depth of connection), the subtle layer is sparse among itself. All fills +1.
function twoScale(input: { slowCount: number; fastCount: number; fastDegree: number; coupling: number; rng: Rng }): TwoScale {
  const { slowCount, fastCount, fastDegree, coupling, rng } = input
  const n = slowCount + fastCount
  const adj: Map<number, number>[] = Array.from({ length: n }, () => new Map())
  const add = (u: number, v: number): void => {
    if (u !== v) {
      adj[u]?.set(v, 1)
      adj[v]?.set(u, 1)
    }
  }
  // dense surface
  for (let i = 0; i < fastCount; i++) {
    const u = slowCount + i
    for (let d = 0; d < fastDegree; d++) add(u, slowCount + rng.nextInt({ max: fastCount }))
  }
  // surface-to-subtle coupling
  for (let i = 0; i < fastCount; i++) {
    const u = slowCount + i
    for (let c = 0; c < coupling; c++) add(u, rng.nextInt({ max: slowCount }))
  }
  // sparse subtle layer
  for (let i = 0; i < slowCount; i++) add(i, rng.nextInt({ max: slowCount }))
  return { n, slowCount, neighbors: adj.map((m) => [...m.keys()]), fills: adj.map((m) => Int8Array.from(m.values())) }
}

// Settle the FAST layer with the slow layer held fixed (the deep state is the standing
// background the surface resolves against).
function settleFast(ts: TwoScale, slowState: Int8Array, fastInit: Int8Array, sweeps: number, rng: Rng): Int8Array {
  const t = new Int8Array(ts.n)
  for (let i = 0; i < ts.slowCount; i++) t[i] = slowState[i] ?? 0
  for (let i = ts.slowCount; i < ts.n; i++) t[i] = fastInit[i - ts.slowCount] ?? 0
  for (let sweep = 0; sweep < sweeps; sweep++) {
    for (let s = 0; s < ts.n - ts.slowCount; s++) {
      const v = ts.slowCount + rng.nextInt({ max: ts.n - ts.slowCount })
      const nb = ts.neighbors[v] ?? []
      const fl = ts.fills[v] ?? new Int8Array(0)
      let h = 0
      for (let k = 0; k < nb.length; k++) h += (fl[k] ?? 0) * (t[nb[k] ?? 0] ?? 0)
      t[v] = h > 0 ? 1 : h < 0 ? -1 : (t[v] ?? 0)
    }
  }
  return t.slice(ts.slowCount)
}

function differ(a: Int8Array, b: Int8Array): number {
  let d = 0
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++
  return d / Math.max(1, a.length)
}

export function subtleLayerUrges(input: { seed: number }): {
  byCoupling: { coupling: number; steering: number }[]
  steeringRises: boolean
  reassertion: number
  solved: boolean
} {
  const slowCount = 40
  const fastCount = 400
  const seed = input.seed

  // Steering versus coupling depth. Same surface starting situation, two opposite deep states.
  const couplings = [0, 1, 2, 4]
  const byCoupling = couplings.map((coupling) => {
    const ts = twoScale({ slowCount, fastCount, fastDegree: 6, coupling, rng: makeRng({ seed: seed + coupling }) })
    const dr = makeRng({ seed: seed + 100 })
    const deepA = Int8Array.from({ length: slowCount }, () => dr.nextInt({ max: 3 }) - 1)
    const deepB = Int8Array.from(deepA, (x) => (-x) as -1 | 0 | 1)
    const fastInit = Int8Array.from({ length: fastCount }, () => dr.nextInt({ max: 3 }) - 1)
    const fa = settleFast(ts, deepA, fastInit, 40, makeRng({ seed: seed + 1 }))
    const fb = settleFast(ts, deepB, fastInit, 40, makeRng({ seed: seed + 1 }))
    return { coupling, steering: differ(fa, fb) }
  })
  const steeringRises = (byCoupling[byCoupling.length - 1]?.steering ?? 0) > (byCoupling[0]?.steering ?? 1) + 0.2 && (byCoupling[0]?.steering ?? 1) < 0.05

  // Persistence and reassertion. In the deep-dominated regime (the depth coupled more strongly
  // than the surface is to itself), settle the surface under a deep state, then throw the surface
  // into disorder (randomize it) and re-settle with the SAME deep state. The surface should
  // return to its original deep-shaped pattern, the deep self reasserting after the storm.
  const ts = twoScale({ slowCount, fastCount, fastDegree: 3, coupling: 9, rng: makeRng({ seed: seed + 4 }) })
  const dr = makeRng({ seed: seed + 200 })
  const deep = Int8Array.from({ length: slowCount }, () => dr.nextInt({ max: 3 }) - 1)
  const init = Int8Array.from({ length: fastCount }, () => dr.nextInt({ max: 3 }) - 1)
  const settled = settleFast(ts, deep, init, 40, makeRng({ seed: seed + 5 }))
  const disordered = Int8Array.from({ length: fastCount }, () => dr.nextInt({ max: 3 }) - 1)
  const recovered = settleFast(ts, deep, disordered, 40, makeRng({ seed: seed + 6 }))
  const reassertion = 1 - differ(settled, recovered) // how much the surface returns to its deep-shaped pattern

  return {
    byCoupling,
    steeringRises,
    reassertion,
    // Solved: the deep layer steers the surface (no steer at zero coupling, strong steer when
    // deeply coupled), and after disorder the surface reasserts the deep pattern.
    solved: steeringRises && reassertion > 0.8,
  }
}

export default experiment({
  id: 'selves/subtle-layer-urges',
  title: 'deep layer steers the surface and reasserts after disorder',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = subtleLayerUrges({ seed: 1 })
    const ok = r.solved && r.steeringRises && r.reassertion > 0.8
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a slow deep layer biases the fast surface layer, with steering rising with coupling depth and the deep pattern reasserting after disorder',
      metrics: { reassertion: r.reassertion },
    })
  },
})
