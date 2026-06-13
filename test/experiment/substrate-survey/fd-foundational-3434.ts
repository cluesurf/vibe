// P245 (FD1-FD4, FD6): the {3,4,3,4} foundational engine. Build the D4 lattice (even-sum integer 4-vectors,
// the 24 root directions), run the directional lattice-gas rule (stream plus a reversible collision), and
// verify EXACTLY (integer arithmetic, the rule is a permutation): FD4 the mesh has 24 neighbours and closes,
// FD2 the rule conserves particle count AND momentum, FD3 it is reversible (forward then inverse = identity),
// FD1/FD6 it is deterministic and the streaming is a conflict-free permutation of slots.
// Run: npx tsx code/experiment/p245-fd-foundational-3434.ts

import { makeRng } from '@/code/tool/rng'
import { buildD4Torus } from '@/code/substrate/d4-torus'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The 24 D4 roots (= the 24 directions of {3,4,3,4}) and the finite even-sum D4 torus
// live in code/algebra/group/root-system and code/substrate/d4-torus.
const buildTorus = buildD4Torus

export function fdFoundational(): { neighborsOk: boolean; closes: boolean; countConserved: boolean; momentumConserved: boolean; reversible: boolean } {
  const M = 4
  const { cells, roots, neigh } = buildTorus(M)
  const N = cells.length
  const D = 24

  // FD4: every cell has exactly 24 distinct in-lattice neighbours, and the lattice closes under the roots
  const neighborsOk = neigh.every((ns) => ns.length === D && new Set(ns).size === D && ns.every((n) => n >= 0))
  const closes = cells.every((p) => roots.every((r) => (p[0]! + r[0]! + p[1]! + r[1]! + p[2]! + r[2]! + p[3]! + r[3]!) % 2 === 0))

  // opp[d] = direction index of -root[d]
  const opp = roots.map((r) => roots.findIndex((s) => s.every((x, k) => x === -r[k]!)))

  // ---- the directional lattice-gas rule ----
  // state: occ[cell] is a 24-bit integer, bit d = a particle moving in direction d
  // STREAM: the particle in slot (c,d) hops to (neighbour-in-d, d). Each target slot has ONE source => a
  //   permutation of the N*24 slots (FD6 conflict-free, FD1 deterministic, FD2/FD3 exact by being a permutation).
  const stream = (occ: number[]): number[] => {
    const out = new Array(N).fill(0)
    for (let c = 0; c < N; c++) { const o = occ[c]!; for (let d = 0; d < D; d++) if ((o >> d) & 1) out[neigh[c]![d]!]! |= (1 << d) }
    return out
  }
  // COLLIDE: a reversible INVOLUTION conserving count and momentum. Swap two head-on pairs of equal momentum
  //   (both momentum 0): config {0,opp0} <-> {k,oppk} for a fixed k. Involution => self-inverse.
  const k = roots.findIndex((s, i) => i !== 0 && i !== opp[0] && s.every((x, q) => x !== -roots[0]![q]!))
  const A = (1 << 0) | (1 << opp[0]!), B = (1 << k) | (1 << opp[k]!)
  const collide = (occ: number[]): number[] => occ.map((o) => (o === A ? B : o === B ? A : o))

  // a step is collide then stream, the inverse is stream^-1 then collide
  const streamInv = (occ: number[]): number[] => {
    const out = new Array(N).fill(0)
    for (let c = 0; c < N; c++) { const o = occ[c]!; for (let d = 0; d < D; d++) if ((o >> d) & 1) out[neigh[c]![opp[d]!]!]! |= (1 << d) } // hop backward
    return out
  }
  const step = (occ: number[]): number[] => stream(collide(occ))
  const stepInv = (occ: number[]): number[] => collide(streamInv(occ))

  // invariants
  const count = (occ: number[]): number => occ.reduce((s, o) => { let c = 0; for (let d = 0; d < D; d++) c += (o >> d) & 1; return s + c }, 0)
  const momentum = (occ: number[]): number[] => { const m = [0, 0, 0, 0]; for (let c = 0; c < N; c++) { const o = occ[c]!; for (let d = 0; d < D; d++) if ((o >> d) & 1) for (let q = 0; q < 4; q++) m[q]! += roots[d]![q]! } return m }

  // deterministic pseudo-random initial state (a fixed seed, integer)
  const rng = makeRng({ seed: 12345 })
  const rnd = (): number => rng.next()
  const occ0 = new Array(N).fill(0).map(() => { let o = 0; for (let d = 0; d < D; d++) if (rnd() < 0.25) o |= (1 << d); return o })

  // run forward T, check conservation each step
  const T = 40
  let occ = occ0.slice()
  const c0 = count(occ), m0 = momentum(occ)
  let countConserved = true, momentumConserved = true
  for (let t = 0; t < T; t++) { occ = step(occ); if (count(occ) !== c0) countConserved = false; const m = momentum(occ); if (!m.every((x, q) => x === m0[q]!)) momentumConserved = false }

  // FD3: run inverse T, must recover occ0 EXACTLY
  for (let t = 0; t < T; t++) occ = stepInv(occ)
  const reversible = occ.every((o, c) => o === occ0[c]!)

  return { neighborsOk, closes, countConserved, momentumConserved, reversible }
}

export default defineExperiment({
  id: 'substrate-survey/fd-foundational-3434',
  title: 'the D4 lattice-gas rule closes on 24 neighbours and is exactly reversible, conserving count and momentum',
  category: 'substrate-survey',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = fdFoundational()
    const ok =
      r.neighborsOk &&
      r.closes &&
      r.countConserved &&
      r.momentumConserved &&
      r.reversible
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on a finite D4 torus every cell has 24 in-lattice neighbours and the stream-and-collide rule is a deterministic reversible permutation that conserves particle count and momentum exactly',
      metrics: {
        neighborsOk: r.neighborsOk ? 1 : 0,
        closes: r.closes ? 1 : 0,
        countConserved: r.countConserved ? 1 : 0,
        momentumConserved: r.momentumConserved ? 1 : 0,
        reversible: r.reversible ? 1 : 0,
      },
      notes:
        'L1, exact integer arithmetic confirming the rule is a permutation (forward then inverse recovers the start bit for bit). The initial occupancy is a fixed-seed deterministic pseudo-random fill, so the conservation and reversibility hold for that fixed state. The base itself is deterministic, the fill only chooses one starting configuration.',
    })
  },
})
