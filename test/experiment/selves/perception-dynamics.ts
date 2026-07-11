// P100: the perception rule on the real {5,3,4} crystal, the corrected fill-free dynamics.
// (the-perception-rule.md, the-note-is-perception.md.) Supersedes the fill-based P94.
//
// Only vibes with tones. No fills, no edge-state. A vibe SEES its neighbors (the note) and the
// PERCEIVED relation picks a conserving move:
//   - opposite (+ , -)        -> share, both relax to peace (0, 0)
//   - empty (one 0, one charged) -> hop, the charge moves into the peaceful one (arrow-biased = pumping)
//   - both peace (0, 0)        -> polarize to (+1, -1), but ONLY when the arrow drives it (creation)
//   - same nonzero             -> inert
// Every move preserves the pair sum, so the total charge Q is conserved exactly. The arrow is the engine,
// it creates charge from peace (move 3), without it everything relaxes to a dead all-peace.
//
// Predictions checked: Q conserved under the perception rule, the arrow CREATES life from all-peace
// (charge appears and settles to a dynamic balance), WITHOUT the arrow a charged start RELAXES to peace
// (death), the live state is a stable dynamic balance (not 0, not saturated), and hops DIFFUSE a pocket
// while arrow-biased hops PUMP it. Run: npx tsx code/experiment/p100-perception-dynamics.ts

import { neighborDistances, edgesOf } from '@/code/tool/graph'
import { totalCharge as sumTone } from '@/code/model/self-kit'
import { conservingEdgeListSweepPumped } from '@/code/dynamics/conserving-sweep'
import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const nonzero = (t: Int8Array): number => {
  let s = 0

  for (const value of t) {
    if (value !== 0) {
      s++
    }
  }

  return s
}

const dd = (d: Int32Array, i: number): number => d[i] ?? 1e9

export function perceptionDynamics(): {
  cells: number
  conserved: boolean
  lifeStart: number
  lifeEnd: number
  arrowCreatesLife: boolean
  deathStart: number
  deathEnd: number
  noArrowRelaxesToPeace: boolean
  balanceMid: number
  balanceLate: number
  dynamicBalance: boolean
  absChargeStart: number
  absDiffused: number
  netPumped: number
  netDiffused: number
  diffusesAndPumps: boolean
  solved: boolean
} {
  const mesh = buildCoxeterMesh({
    symbol: [5, 3, 4],
    depth: 20,
    maxChambers: 60000,
  })

  const neighbors = mesh.neighbors
  const n = mesh.cellCount
  const edges = edgesOf(neighbors)
  const moved = new Uint8Array(n)

  let center = 0

  for (let i = 1; i < n; i++) {
    if (neighbors[i]!.length > neighbors[center]!.length) center = i
  }

  const distC = neighborDistances({
    neighbors,
    size: n,
    source: center,
  })

  const r0 = 4

  // ARROW CREATES LIFE: from all-peace, the arrow makes charge appear and settle to a balance
  const life = new Int8Array(n) // all 0
  const qLife = sumTone(life)
  const rngL = makeRng({ seed: 9 })
  const lifeStart = nonzero(life)

  let balanceMid = 0

  for (let b = 0; b < 120; b++) {
    conservingEdgeListSweepPumped({
      tone: life,
      edges,
      moved,
      rng: rngL,
      arrow: 0.1,
      pump: null,
    })

    if (b === 59) balanceMid = nonzero(life)
  }

  const lifeEnd = nonzero(life)
  const balanceLate = lifeEnd
  const conservedLife = sumTone(life) === qLife

  // NO ARROW RELAXES TO PEACE: a balanced charged start, no creation, relaxes toward peace
  const death = new Int8Array(n)
  const rngD0 = makeRng({ seed: 14 })

  for (let i = 0; i < n; i++) {
    const r = rngD0.next()

    death[i] = r < 0.4 ? 1 : r < 0.8 ? -1 : 0 // balanced-ish, Q near 0
  }

  // force exact balance so it can fully relax
  let q = sumTone(death)

  for (let i = 0; i < n && q !== 0; i++) {
    if (q > 0 && death[i] === 1) {
      death[i] = 0
      q--
    } else if (q < 0 && death[i] === -1) {
      death[i] = 0
      q++
    }
  }

  const qDeath = sumTone(death)
  const deathStart = nonzero(death)
  const rngD = makeRng({ seed: 14 })

  for (let b = 0; b < 300; b++) {
    conservingEdgeListSweepPumped({
      tone: death,
      edges,
      moved,
      rng: rngD,
      arrow: 0,
      pump: null,
    })
  }

  const deathEnd = nonzero(death)
  const conservedDeath = sumTone(death) === qDeath

  // DIFFUSION vs PUMPING: a balanced pocket near the center, no creation, just transport
  const makePocket = (): Int8Array => {
    const t = new Int8Array(n)
    const inner: number[] = []

    for (let i = 0; i < n; i++) {
      if (dd(distC, i) <= r0) inner.push(i)
    }

    for (let k = 0; k < inner.length; k++)
      t[inner[k]!] = k % 2 === 0 ? 1 : -1

    if (inner.length % 2 === 1) t[inner[inner.length - 1]!] = 0

    return t
  }

  const absInR0 = (t: Int8Array): number => {
    let s = 0

    for (let i = 0; i < n; i++) {
      if (dd(distC, i) <= r0) s += Math.abs(t[i]!)
    }

    return s
  }

  const netInR0 = (t: Int8Array): number => {
    let s = 0

    for (let i = 0; i < n; i++) {
      if (dd(distC, i) <= r0) s += t[i]!
    }

    return s
  }

  const diff = makePocket()
  const qDiff = sumTone(diff)
  const absChargeStart = absInR0(diff)
  const rngDi = makeRng({ seed: 5 })

  for (let b = 0; b < 80; b++) {
    conservingEdgeListSweepPumped({
      tone: diff,
      edges,
      moved,
      rng: rngDi,
      arrow: 0,
      pump: null,
    })
  }

  const absDiffused = absInR0(diff)
  const netDiffused = netInR0(diff)
  const conservedDiff = sumTone(diff) === qDiff

  const pump = makePocket()
  const qPump = sumTone(pump)
  const rngPu = makeRng({ seed: 5 })

  for (let b = 0; b < 80; b++) {
    conservingEdgeListSweepPumped({
      tone: pump,
      edges,
      moved,
      rng: rngPu,
      arrow: 0,
      pump: distC,
    })
  }

  const netPumped = netInR0(pump)
  const conservedPump = sumTone(pump) === qPump

  const conserved =
    conservedLife && conservedDeath && conservedDiff && conservedPump

  const arrowCreatesLife = lifeStart === 0 && lifeEnd > 0.1 * n
  const noArrowRelaxesToPeace = deathEnd < 0.4 * deathStart
  const dynamicBalance =
    balanceMid > 0.1 * n &&
    Math.abs(balanceLate - balanceMid) < 0.25 * balanceMid

  const diffusesAndPumps =
    absDiffused < absChargeStart &&
    Math.abs(netPumped) > Math.abs(netDiffused) + 3

  const solved =
    conserved &&
    arrowCreatesLife &&
    noArrowRelaxesToPeace &&
    dynamicBalance &&
    diffusesAndPumps

  return {
    cells: n,
    conserved,
    lifeStart,
    lifeEnd,
    arrowCreatesLife,
    deathStart,
    deathEnd,
    noArrowRelaxesToPeace,
    balanceMid,
    balanceLate,
    dynamicBalance,
    absChargeStart,
    absDiffused,
    netPumped,
    netDiffused,
    diffusesAndPumps,
    solved,
  }
}

export default experiment({
  id: 'selves/perception-dynamics',
  code: 'E-SLF-0093',
  title:
    'Q conserved, arrow creates life from peace, no-arrow relaxes, dynamic balance, diffuse and pump',
  category: 'selves',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = perceptionDynamics()
    const ok =
      r.solved &&
      r.conserved &&
      r.arrowCreatesLife &&
      r.noArrowRelaxesToPeace &&
      r.dynamicBalance &&
      r.diffusesAndPumps

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the perception rule conserves charge, the arrow creates life from all-peace, without it a charged start relaxes to peace, and hops diffuse while arrow-biased hops pump',
      metrics: {
        lifeEnd: r.lifeEnd,
        deathStart: r.deathStart,
        deathEnd: r.deathEnd,
        balanceMid: r.balanceMid,
        balanceLate: r.balanceLate,
        netPumped: r.netPumped,
        netDiffused: r.netDiffused,
      },
    })
  },
})
