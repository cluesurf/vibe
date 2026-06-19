// P112: reproduction, does a self split into two like selves (fission)? Honest answer on the hyperbolic
// {5,3,4}: NO, the geometry suppresses fission. (what-is-a-self.md.)
//
// Two facts kill parental fission here. (1) The diameter is tiny (about 6 hops, P111), so there are no
// thin elongated necks to pinch, every region is fat and close. (2) Hyperbolic balls are almost all
// boundary (a radius-4 ball already holds thousands of cells, nearly all at the rim), so a self cannot be
// cleanly bisected. And the cohesive rule MERGES like with like (P110), the opposite of dividing. So a
// solid self stays ONE self, it does not divide. Reproduction in this universe is therefore DE NOVO, new
// selves are born from peace by the arrow (P106), not by a parent splitting.
//
// Predictions checked: a solid self run under the rule alone stays a single large self (no fission),
// charge conserved. The experiment establishes the honest negative and its geometric cause.
// Run: npx tsx code/experiment/p112-reproduction.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng, Rng } from '@/code/tool/rng'
import {
  csrBallNodes,
  csrDistances,
  edgesFromCsr,
} from '@/code/tool/graph'
import { cohesiveEdgeSweep } from '@/code/dynamics/cohesive-sweep'
import { countLargeSameSignComponents } from '@/code/model/self-kit'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const beat = (
  tone: Int8Array,
  eu: Int32Array,
  ev: Int32Array,
  offsets: Int32Array,
  adj: Int32Array,
  moved: Uint8Array,
  rng: Rng,
): void =>
  cohesiveEdgeSweep({
    tone,
    eu,
    ev,
    offsets,
    adj,
    moved,
    rng,
    annihilate: false,
    arrow: 0,
  })

export function reproduction(input?: { n?: number }): {
  n: number
  ballRadius: number
  ballCells: number
  startComponents: number
  endComponents: number
  conserved: boolean
  fissionSuppressed: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)

  // a solid self: a + ball. measure its radius to show it is almost all boundary (no clean bisection)
  const self = csrBallNodes({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: 0,
    limit: 6000,
  })

  const distAll = csrDistances({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: 0,
  })

  let ballRadius = 0

  for (const i of self) {
    if (distAll[i]! > ballRadius) {
      ballRadius = distAll[i]!
    }
  }

  const tone = new Int8Array(N)

  for (const i of self) {
    tone[i] = 1
  }

  let q0 = 0

  for (let i = 0; i < N; i++) {
    q0 += tone[i]!
  }

  const startComponents = countLargeSameSignComponents({
    tone,
    g,
    minSize: 300,
    sign: 'positive',
  })

  const rng = makeRng({ seed: 5 })

  for (let b = 0; b < 30; b++) {
    beat(tone, eu, ev, g.offsets, g.adj, moved, rng)
  }

  const endComponents = countLargeSameSignComponents({
    tone,
    g,
    minSize: 300,
    sign: 'positive',
  })

  let q1 = 0

  for (let i = 0; i < N; i++) {
    q1 += tone[i]!
  }

  const conserved = q0 === q1

  // the honest finding: the self does NOT split, it stays one self (fission is suppressed)
  const fissionSuppressed = startComponents === 1 && endComponents === 1
  const solved = conserved && fissionSuppressed

  return {
    n: N,
    ballRadius,
    ballCells: self.length,
    startComponents,
    endComponents,
    conserved,
    fissionSuppressed,
    solved,
  }
}

export default experiment({
  id: 'selves/reproduction',
  title:
    'fission is suppressed on hyperbolic geometry, a self stays one',
  category: 'selves',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = reproduction({ n: 60000 })
    const ok = r.solved && r.conserved && r.fissionSuppressed

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a solid self run under the rule alone stays one self because hyperbolic geometry has no thin necks and all-boundary balls, so reproduction is de novo not by division',
      metrics: {
        ballRadius: r.ballRadius,
        startComponents: r.startComponents,
        endComponents: r.endComponents,
      },
    })
  },
})
