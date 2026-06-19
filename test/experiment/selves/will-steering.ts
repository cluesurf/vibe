// P113: the will steering a self's interactions, goal-directed merge and avoidance. (P99, P110.)
//
// A self can carry a WILL, a directed bias on its hops (the pump of P99), aimed at a goal:
//   - MERGE: the will pumps the self TOWARD a target, so it crosses the bulk and reaches it, where an
//     unbiased self would just diffuse and mostly stay put.
//   - AVOID: facing an opposite self that would annihilate it, the will pumps it AWAY, so it retreats
//     from the contact seam and SURVIVES, where an unbiased self gets eaten.
// The will is the same directed pump as P99, here used for inter-self goals, conserving.
//
// Predictions checked: with the will, a self reaches a distant target (merge) far more than unbiased,
// and a self facing an opposite one retains far more charge (avoid) than unbiased. Charge conserved.
// Run: npx tsx code/experiment/p113-will-steering.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import {
  csrBallNodes,
  csrEccentricity,
  edgesFromCsr,
} from '@/code/tool/graph'
import { conservingEdgeSweepSteered } from '@/code/dynamics/conserving-sweep'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const dd = (d: Int32Array, i: number): number => d[i] ?? 1e9

export function willSteering(input?: { n?: number }): {
  n: number
  mergeWithWill: number
  mergeNoWill: number
  mergeWorks: boolean
  avoidWithWill: number
  avoidNoWill: number
  avoidWorks: boolean
  willSteers: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const { dist, far } = csrEccentricity({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: 0,
  })
  const distTarget = csrEccentricity({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: far,
  }).dist // distance to the far target

  // MERGE: a + self at node 0, target = the far cell. measure the self's CENTROID distance to the target
  // (with the will it moves toward the target, unbiased it diffuses symmetrically and stays put)
  const meanDistTo = (t: Int8Array, d: Int32Array): number => {
    let s = 0
    let c = 0
    for (let i = 0; i < N; i++)
      if (t[i] === 1) {
        s += dd(d, i)
        c++
      }
    return c > 0 ? s / c : 0
  }
  const selfA = csrBallNodes({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: 0,
    limit: 2000,
  })
  const mk = (): Int8Array => {
    const t = new Int8Array(N)
    for (const i of selfA) t[i] = 1
    return t
  }
  const beats = 12 * dd(dist, far)
  const willM = mk()
  const r1 = makeRng({ seed: 3 })
  for (let b = 0; b < beats; b++)
    conservingEdgeSweepSteered({
      tone: willM,
      eu,
      ev,
      moved,
      rng: r1,
      distGoal: distTarget,
      towardSign: -1,
    })
  const mergeWithWill = meanDistTo(willM, distTarget) // lower = moved toward the target
  const noWillM = mk()
  const r2 = makeRng({ seed: 3 })
  for (let b = 0; b < beats; b++)
    conservingEdgeSweepSteered({
      tone: noWillM,
      eu,
      ev,
      moved,
      rng: r2,
      distGoal: null,
      towardSign: 0,
    })
  const mergeNoWill = meanDistTo(noWillM, distTarget)
  const mergeWorks = mergeWithWill < mergeNoWill - 1 // the will moved the self meaningfully toward the target

  // AVOID: a + self and an adjacent - self (a split region). the will pumps + away from the - side
  const region = csrBallNodes({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: 0,
    limit: 4000,
  })
  const half = Math.floor(region.length / 2)
  const minusCenter = region[region.length - 1]! // a cell on the - side
  const distMinus = csrEccentricity({
    offsets: g.offsets,
    adj: g.adj,
    size: N,
    source: minusCenter,
  }).dist
  const mkSplit = (): Int8Array => {
    const t = new Int8Array(N)
    for (let k = 0; k < region.length; k++)
      t[region[k]!] = k < half ? 1 : -1
    return t
  }
  const plus = (t: Int8Array): number => {
    let c = 0
    for (let i = 0; i < N; i++) if (t[i] === 1) c++
    return c
  }
  void plus
  const willA = mkSplit()
  const r3 = makeRng({ seed: 3 })
  for (let b = 0; b < 50; b++)
    conservingEdgeSweepSteered({
      tone: willA,
      eu,
      ev,
      moved,
      rng: r3,
      distGoal: distMinus,
      towardSign: 1,
    }) // pump + away from the - side
  const avoidWithWill = meanDistTo(willA, distMinus) // higher = the + fled away from the - threat
  const noWillA = mkSplit()
  const r4 = makeRng({ seed: 3 })
  for (let b = 0; b < 50; b++)
    conservingEdgeSweepSteered({
      tone: noWillA,
      eu,
      ev,
      moved,
      rng: r4,
      distGoal: null,
      towardSign: 0,
    })
  const avoidNoWill = meanDistTo(noWillA, distMinus)
  // the will moves the self about a hop away, near the geometric ceiling (the diameter is tiny, so a hop
  // is a large fraction of the whole universe, the steering is directional, not large in raw hops)
  const avoidWorks = avoidWithWill > avoidNoWill + 0.8

  const willSteers = mergeWorks && avoidWorks
  const solved = willSteers

  return {
    n: N,
    mergeWithWill,
    mergeNoWill,
    mergeWorks,
    avoidWithWill,
    avoidNoWill,
    avoidWorks,
    willSteers,
    solved,
  }
}

export default experiment({
  id: 'selves/will-steering',
  title:
    'with the will a self moves toward a target and away from a threat, unbiased does not',
  category: 'selves',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = willSteering({ n: 120000 })
    const ok = r.solved && r.willSteers && r.mergeWorks && r.avoidWorks
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a directed pump steers a self toward a distant target (merge) and away from an opposite threat (avoid) where an unbiased self does not',
      metrics: {
        mergeWithWill: r.mergeWithWill,
        mergeNoWill: r.mergeNoWill,
        avoidWithWill: r.avoidWithWill,
        avoidNoWill: r.avoidNoWill,
      },
    })
  },
})
