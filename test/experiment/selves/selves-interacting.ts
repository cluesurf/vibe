// P110: selves interacting at scale on the exact {5,3,4}. (what-is-a-self.md, P106-P108.)
//
// Two adjacent selves (two coherent regions sharing a contact interface) are run under the rule alone
// (share plus cohesive hop, no arrow) and we watch what their interaction does:
//   - OPPOSITE selves (a + self touching a - self): the contact interface ANNIHILATES (share turns
//     +,- into 0,0), so they consume each other along the seam, losing charge and opening a peace
//     buffer. Opposite selves destroy each other on contact.
//   - SAME selves (a + self touching a + self): no interface annihilation, they COEXIST and MERGE into
//     a single connected self, keeping their charge.
// This is a real interaction law (opposite annihilate, same merge), tested at up to a million cells.
//
// Predictions checked: the opposite pair loses far more charge than the same pair (annihilation), and
// the same pair ends as ONE connected self (merger), while the opposite pair splits into two selves with
// a peace buffer (mutual retreat). Charge conserved by the rule. Run: npx tsx code/experiment/p110-selves-interacting.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng, Rng } from '@/code/tool/rng'
import { csrBallNodes, edgesFromCsr } from '@/code/tool/graph'
import { cohesiveEdgeSweep } from '@/code/dynamics/cohesive-sweep'
import { countLargeSameSignComponents } from '@/code/model/self-kit'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const absCharge = (t: Int8Array): number => {
  let s = 0

  for (let i = 0; i < t.length; i++) {
    s += Math.abs(t[i]!)
  }

  return s
}

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
    annihilate: true,
    arrow: 0,
  })

export function selvesInteracting(input?: {
  n?: number
  beats?: number
  regionSize?: number
}): {
  n: number
  oppositeLoss: number
  sameLoss: number
  sameComponents: number
  oppositeComponents: number
  selvesInteract: boolean
  sameMerges: boolean
  oppositeAnnihilates: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const beats = input?.beats ?? 30

  // two adjacent selves = one region split into two halves (the seam is the contact interface)
  const region = csrBallNodes({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: 0,
    limit: input?.regionSize ?? 6000,
  })

  const half = Math.floor(region.length / 2)

  // OPPOSITE: first half +, second half - (a + self touching a - self)
  const opp = new Int8Array(N)

  for (let k = 0; k < region.length; k++) {
    opp[region[k]!] = k < half ? 1 : -1
  }

  const oppStart = absCharge(opp)
  const rngO = makeRng({ seed: 5 })

  for (let b = 0; b < beats; b++) {
    beat(opp, eu, ev, g.offsets, g.adj, moved, rngO)
  }

  const oppositeLoss = (oppStart - absCharge(opp)) / oppStart
  const oppositeComponents = countLargeSameSignComponents({
    tone: opp,
    g,
    minSize: 100,
    cells: region,
  })

  // SAME: both halves + (a + self touching a + self)
  const same = new Int8Array(N)

  for (const i of region) {
    same[i] = 1
  }

  const sameStart = absCharge(same)
  const rngS = makeRng({ seed: 5 })

  for (let b = 0; b < beats; b++) {
    beat(same, eu, ev, g.offsets, g.adj, moved, rngS)
  }

  const sameLoss = (sameStart - absCharge(same)) / sameStart
  const sameComponents = countLargeSameSignComponents({
    tone: same,
    g,
    minSize: 100,
    cells: region,
  })

  const oppositeAnnihilates =
    oppositeLoss > 0.1 && oppositeLoss > 5 * Math.max(sameLoss, 0.001)

  const sameMerges = sameComponents === 1 // one large merged self
  const oppositeSplits = oppositeComponents >= 2 // a + self and a - self, split by the annihilated seam
  const selvesInteract =
    oppositeAnnihilates && sameMerges && oppositeSplits

  const solved = selvesInteract

  return {
    n: N,
    oppositeLoss,
    sameLoss,
    sameComponents,
    oppositeComponents,
    selvesInteract,
    sameMerges,
    oppositeAnnihilates,
    solved,
  }
}

export default experiment({
  id: 'selves/selves-interacting',
  code: 'E-SLF-0122',
  title:
    'opposite selves annihilate at contact, same selves merge into one',
  category: 'selves',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = selvesInteracting({ n: 60000 })
    const ok =
      r.solved &&
      r.selvesInteract &&
      r.oppositeAnnihilates &&
      r.sameMerges

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two adjacent selves under the rule alone annihilate at the contact seam when opposite and merge into one connected self when same',
      metrics: {
        oppositeLoss: r.oppositeLoss,
        oppositeComponents: r.oppositeComponents,
      },
      control: {
        sameLoss: r.sameLoss,
        sameComponents: r.sameComponents,
      },
    })
  },
})
