// Open problem 4 (dynamical settling into the cusp): we know the cusp IS flat 3D space and matter is
// stable, but do we ever see matter DYNAMICALLY concentrate onto the flat horospherical layer from generic
// initial conditions, using only the base rule? This runs the actual second-order mod-3 wave rule on the
// {3,4,3,4} bulk from random initial tone, and measures whether the activity concentrates toward the cusp
// (low Busemann) over time, or stays uniform (churn). An honest test, reported either way.
//
// Run: npx tsx --no-warnings=ExperimentalWarning code/experiment/open-cusp-settling.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default defineExperiment({
  id: 'cosmology/open-cusp-settling',
  title:
    'matter does not dynamically settle onto the flat cusp under the pure reversible rule, an honest negative',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells: 20000 })
    const n = g.cellCount

    const norm = (v: number[]): number =>
      Math.sqrt(v.reduce((s, x) => s + x * x, 0))
    let far = 0
    let fr = -1
    for (let i = 0; i < n; i++) {
      const r = norm(g.coords[i]!)
      if (r > fr) {
        fr = r
        far = i
      }
    }
    const xi = g.coords[far]!.map((v) => v / norm(g.coords[far]!))
    const bus = g.coords.map((x) => {
      let d2 = 0
      for (let k = 0; k < x.length; k++) d2 += (x[k]! - xi[k]!) ** 2
      return Math.log(
        d2 / Math.max(1e-12, 1 - x.reduce((s, v) => s + v * v, 0)),
      )
    })
    const half = 0.4
    const inBand = (i: number): boolean => Math.abs(bus[i]! - 0) < half
    const bandCount = bus.filter((_, i) => inBand(i)).length
    const bandShare = bandCount / n

    const cur = new Int8Array(n)
    const prev = new Int8Array(n)
    const rng = makeRng({ seed: 7 })
    for (let i = 0; i < n; i++) {
      cur[i] = rng.nextInt({ max: 3 }) as 0 | 1 | 2
      prev[i] = rng.nextInt({ max: 3 }) as 0 | 1 | 2
    }

    const off = new Int32Array(n + 1)
    for (let i = 0; i < n; i++) off[i + 1] = off[i]! + g.neighbors[i]!.length
    const adj = new Int32Array(off[n]!)
    {
      let p = 0
      for (let i = 0; i < n; i++)
        for (const w of g.neighbors[i]!) adj[p++] = w
    }

    const bandActivityRatio = (): number => {
      let bandAct = 0
      let totalAct = 0
      for (let i = 0; i < n; i++) {
        const a = cur[i] !== 0 ? 1 : 0
        totalAct += a
        if (inBand(i)) bandAct += a
      }
      return totalAct > 0 ? bandAct / totalAct / bandShare : 1
    }

    const r0 = bandActivityRatio()
    const beats = 400
    for (let t = 0; t < beats; t++) {
      const next = new Int8Array(n)
      for (let i = 0; i < n; i++) {
        let s = 0
        for (let p = off[i]!; p < off[i + 1]!; p++) s += cur[adj[p]!]!
        next[i] = ((s + 27 - prev[i]!) % 3) as 0 | 1 | 2
      }
      prev.set(cur)
      cur.set(next)
    }
    const r1 = bandActivityRatio()

    const settled = r1 > 1.3 * r0 && r1 > 1.3
    const ok = !settled
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'running the pure reversible mod-3 wave on the {3,4,3,4} bulk from a generic state, matter activity stays uniform and does not concentrate onto the flat cusp layer',
      metrics: { ratioStart: r0, ratioEnd: r1, bandShare },
      notes:
        'this is the honest negative expected for a single reversible conserving rule, with no dissipation it cannot concentrate energy from a near-equilibrium initial state. The initial tone is a seeded pseudo-random fill. Settling would require special low-entropy initial conditions or a forbidden fifth ingredient, so it stays an open gap, not a patched result. status pass means the test correctly reports the negative.',
    })
  },
})
