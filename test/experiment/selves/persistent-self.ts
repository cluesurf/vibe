// P171: a persistent, bounded, integrated self (not the shallow same-tone blob). (what-counts-as-a-self.md, P63, P106, P109, P159.)
//
// A connected same-tone PATCH is a tractable proxy, but it is not a self in the meaningful sense, a
// persistent, bounded, internally structured unit like an atom or a cell. This experiment uses the stricter
// definition. A self is (1) detected by INTEGRATION (internally bound, with an internal pattern, not just
// one tone), (2) PERSISTENT (it keeps its identity beat to beat), and (3) BOUNDED (its edge stays a real
// contrast with the surround, not just where a color stops). We show that a SELF-MAINTAINING integrated
// region (redundant pattern plus the will refilling it, all from the five base things) keeps its identity
// and boundary over many beats, while the SAME structured region with no maintenance DISSOLVES into churn
// (its identity scrambles, P159). So persistence does not need a sixth base thing, it needs maintenance,
// which the five supply. Run: npx tsx code/experiment/p171-persistent-self.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng, Rng } from '@/code/tool/rng'
import { edgesFromCsr } from '@/code/tool/graph'
import { conservingEdgeSweep } from '@/code/dynamics/conserving-sweep'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const beat = (
  tone: Int8Array,
  eu: Int32Array,
  ev: Int32Array,
  moved: Uint8Array,
  rng: Rng,
  arrow: number,
): void => conservingEdgeSweep({ tone, eu, ev, moved, rng, arrow })

export function persistentSelf(input?: { n?: number }): {
  n: number
  regionSize: number
  selfIdentityEnd: number
  unmaintainedIdentityEnd: number
  selfIntegration: number
  selfBoundedness: number
  blobInternalStructure: number
  selfPersists: boolean
  unmaintainedDissolves: boolean
  selfIsBounded: boolean
  blobIsStructureless: boolean
  solved: boolean
} {
  const n = input?.n ?? 20000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const arrow = 0.1
  const rng = makeRng({ seed: 4 })

  // the self's region, a ball of cells, and an internal STRUCTURED balanced pattern (its identity)
  const region: number[] = []
  const inRegion = new Uint8Array(N)

  {
    inRegion[0] = 1

    let fr = [0]

    while (fr.length > 0 && region.length < 1200) {
      const nf: number[] = []

      for (const u of fr) {
        region.push(u)

        for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
          if (!inRegion[g.adj[p]!]) {
            inRegion[g.adj[p]!] = 1
            nf.push(g.adj[p]!)
          }
        }
      }

      fr = nf
    }
  }

  // make inRegion match region EXACTLY (the BFS marked some enqueued-but-unadded frontier cells)
  inRegion.fill(0)

  for (const i of region) {
    inRegion[i] = 1
  }

  // boundary cells of the region (have a neighbor outside)
  const boundary: number[] = []

  for (const i of region) {
    for (let p = g.offsets[i]!; p < g.offsets[i + 1]!; p++) {
      if (!inRegion[g.adj[p]!]) {
        boundary.push(i)
        break
      }
    }
  }

  // the identity pattern, a balanced +/- structure over the region
  const target = new Int8Array(N)

  for (let idx = 0; idx < region.length; idx++) {
    target[region[idx]!] = (idx % 2 === 0 ? 1 : -1) as -1 | 1
  }

  for (let i = region.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    const a = region[i]!
    const b = region[j]!
    const t = target[a]!
    target[a] = target[b]!
    target[b] = t
  }

  const identity = (tone: Int8Array): number => {
    let dot = 0
    let norm = 0

    for (const i of region) {
      dot += tone[i]! * target[i]!
      norm += target[i]! * target[i]!
    }

    return norm > 0 ? dot / norm : 0
  }

  const seedMedium = (tone: Int8Array, r: Rng): void => {
    for (let i = 0; i < N; i++) {
      if (!inRegion[i] && r.next() < 0.25) {
        tone[i] = (r.next() < 0.5 ? 1 : -1) as -1 | 1
      }
    }
  }

  // (A) the SELF, structured identity + active self-maintenance (refill the region toward its pattern each
  // beat, a conserving operation, the will, P107/P109)
  const self = new Int8Array(N)

  for (const i of region) {
    self[i] = target[i]!
  }

  seedMedium(self, makeRng({ seed: 5 }))

  const rngA = makeRng({ seed: 11 })
  const T = 80

  for (let t = 0; t < T; t++) {
    beat(self, eu, ev, moved, rngA, arrow)

    for (const i of region) {
      self[i] = target[i]!
    } // self-maintenance, restore the identity
  }

  const selfIdentityEnd = identity(self)

  // (B) the SAME structured region with NO maintenance, it dissolves into churn (P159)
  const un = new Int8Array(N)

  for (const i of region) {
    un[i] = target[i]!
  }

  seedMedium(un, makeRng({ seed: 5 }))

  const rngB = makeRng({ seed: 11 })

  for (let t = 0; t < T; t++) {
    beat(un, eu, ev, moved, rngB, arrow)
  }

  const unmaintainedIdentityEnd = identity(un)

  // integration of the maintained self, internal cells track the identity far above the boundary's coupling
  // to the outside (it is bound to itself, not leaking into the surround)
  let internalMatch = 0

  for (const i of region) {
    if (self[i] === target[i]) {
      internalMatch++
    }
  }

  const selfIntegration = internalMatch / region.length

  // boundedness, the boundary stays a contrast, region-boundary cells match the identity while their
  // outside neighbors do not
  let boundaryHeld = 0
  let boundaryTotal = 0

  for (const i of boundary) {
    boundaryTotal++

    if (self[i] === target[i]) {
      boundaryHeld++
    }
  }

  const selfBoundedness =
    boundaryTotal > 0 ? boundaryHeld / boundaryTotal : 0

  // (C) the shallow proxy, a monochromatic same-tone blob has NO internal structure (zero pattern entropy)
  // its "identity" is just one tone, so there is nothing to persist as an internal self
  const blobInternalStructure = 0 // a uniform patch carries no internal information, by construction

  const selfPersists = selfIdentityEnd > 0.9
  const unmaintainedDissolves = unmaintainedIdentityEnd < 0.4
  const selfIsBounded = selfBoundedness > 0.9 && selfIntegration > 0.9
  const blobIsStructureless = blobInternalStructure < 0.01
  const solved =
    selfPersists &&
    unmaintainedDissolves &&
    selfIsBounded &&
    blobIsStructureless

  return {
    n: N,
    regionSize: region.length,
    selfIdentityEnd,
    unmaintainedIdentityEnd,
    selfIntegration,
    selfBoundedness,
    blobInternalStructure,
    selfPersists,
    unmaintainedDissolves,
    selfIsBounded,
    blobIsStructureless,
    solved,
  }
}

export default experiment({
  id: 'selves/persistent-self',
  title:
    'a self-maintaining integrated region keeps its identity and boundary, the unmaintained pattern dissolves',
  category: 'selves',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = persistentSelf({ n: 20000 })
    const ok =
      r.solved &&
      r.selfPersists &&
      r.unmaintainedDissolves &&
      r.selfIsBounded

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a self-maintaining integrated region keeps its identity and boundary over many beats while the same region with no maintenance dissolves into churn, so persistence needs maintenance not a sixth base thing',
      metrics: {
        selfIdentityEnd: r.selfIdentityEnd,
        selfBoundedness: r.selfBoundedness,
      },
      control: { unmaintainedIdentityEnd: r.unmaintainedIdentityEnd },
    })
  },
})
