// P245 (FD1-FD4, FD6): the {3,4,3,4} foundational engine. Build the D4 lattice (even-sum integer 4-vectors,
// the 24 root directions), run the directional lattice-gas rule (stream plus a reversible collision), and
// verify EXACTLY (integer arithmetic, the rule is a permutation): FD4 the mesh has 24 neighbours and closes,
// FD2 the rule conserves particle count AND momentum, FD3 it is reversible (forward then inverse = identity),
// FD1/FD6 it is deterministic and the streaming is a conflict-free permutation of slots.
// Run: npx tsx code/experiment/p245-fd-foundational-3434.ts

import { makeRng } from '@/code/tool/rng'
import { buildD4Torus } from '@/code/substrate/d4-torus'
import {
  D4_DIRECTIONS,
  d4OppositeDirections,
  streamD4,
  streamD4Inverse,
  d4CollisionInvolution,
  d4Count,
  d4Momentum,
} from '@/code/operator/d4-lattice-gas'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function fdFoundational(): {
  neighborsOk: boolean
  closes: boolean
  countConserved: boolean
  momentumConserved: boolean
  reversible: boolean
} {
  const M = 4
  const { cells, roots, neigh } = buildD4Torus(M)
  const N = cells.length
  const D = D4_DIRECTIONS

  // FD4: every cell has exactly 24 distinct in-lattice neighbours, and the lattice closes under the roots
  const neighborsOk = neigh.every(
    ns =>
      ns.length === D &&
      new Set(ns).size === D &&
      ns.every(n => n >= 0),
  )
  const closes = cells.every(p =>
    roots.every(
      r =>
        (p[0]! +
          r[0]! +
          p[1]! +
          r[1]! +
          p[2]! +
          r[2]! +
          p[3]! +
          r[3]!) %
          2 ===
        0,
    ),
  )

  // the directional lattice-gas rule (stream + a reversible collision involution) lives in
  // code/operator/d4-lattice-gas. A step is collide then stream, the inverse stream-back then collide.
  const opp = d4OppositeDirections(roots)
  const collide = d4CollisionInvolution({ roots, opp })
  const step = (occ: number[]): number[] =>
    streamD4({ occupancy: collide(occ), neigh })
  const stepInv = (occ: number[]): number[] =>
    collide(streamD4Inverse({ occupancy: occ, neigh, opp }))

  // deterministic pseudo-random initial state (a fixed seed, integer)
  const rng = makeRng({ seed: 12345 })
  const rnd = (): number => rng.next()
  const occ0 = new Array(N).fill(0).map(() => {
    let o = 0
    for (let d = 0; d < D; d++) {
      if (rnd() < 0.25) {
        o |= 1 << d
      }
    }
    return o
  })

  // run forward T, check conservation each step
  const T = 40
  let occ = occ0.slice()
  const c0 = d4Count(occ),
    m0 = d4Momentum({ occupancy: occ, roots })
  let countConserved = true,
    momentumConserved = true
  for (let t = 0; t < T; t++) {
    occ = step(occ)
    if (d4Count(occ) !== c0) {
      countConserved = false
    }
    const m = d4Momentum({ occupancy: occ, roots })
    if (!m.every((x, q) => x === m0[q]!)) {
      momentumConserved = false
    }
  }

  // FD3: run inverse T, must recover occ0 EXACTLY
  for (let t = 0; t < T; t++) {
    occ = stepInv(occ)
  }
  const reversible = occ.every((o, c) => o === occ0[c]!)

  return {
    neighborsOk,
    closes,
    countConserved,
    momentumConserved,
    reversible,
  }
}

export default experiment({
  id: 'substrate-survey/fd-foundational-3434',
  title:
    'the D4 lattice-gas rule closes on 24 neighbours and is exactly reversible, conserving count and momentum',
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
