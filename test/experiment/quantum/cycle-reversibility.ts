// P128: multi-cell reversibility, Kolmogorov's criterion on loops. (P126, bridge-theories-vibe-to-field.md.)
//
// P126 showed LOCAL (single-edge) detailed balance holds. Full reversibility (the precondition for
// reflection positivity and genuine quantization) needs Kolmogorov's criterion on MULTI-CELL cycles, no
// persistent probability current around any loop. We test the cleanest version: instrument every charge
// hop's direction, accumulate the net charge flow on each graph edge, and measure the CIRCULATION around
// closed 4-cycles of the {5,3,4} cell graph (four cells around a shared edge). A reversible (equilibrium)
// process has ZERO net circulation, only statistical noise. A persistent nonzero circulation is a steady
// current, the signature of irreversibility. Run: npx tsx code/experiment/p128-cycle-reversibility.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

export function cycleReversibility(input?: { n?: number }): {
  n: number
  cycles: number
  meanAbsCirculation: number
  floor: number
  ratio: number
  reversible: boolean
  solved: boolean
} {
  const n = input?.n ?? 20000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount

  // directed edge index: map (min,max) -> k, with flow[k] = net charge moved from min to max
  const eu: number[] = []
  const ev: number[] = []
  const idx = new Map<number, number>()

  for (let v = 0; v < N; v++) {
    for (let p = g.offsets[v]!; p < g.offsets[v + 1]!; p++) {
      const w = g.adj[p]!

      if (w > v) {
        idx.set(v * N + w, eu.length)
        eu.push(v)
        ev.push(w)
      }
    }
  }

  const euA = Int32Array.from(eu)
  const evA = Int32Array.from(ev)
  const flow = new Float64Array(eu.length)

  const edgeBetween = (
    a: number,
    b: number,
  ): { k: number; sign: number } | null => {
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    const k = idx.get(lo * N + hi)

    if (k === undefined) {
      return null
    }

    return { k, sign: a < b ? 1 : -1 } // flow from a to b
  }

  // find closed 4-cycles a-b-c-d-a (four cells around a shared edge of the tiling)
  const cycles: number[][] = []
  const nbrSet: Set<number>[] = Array.from(
    { length: N },
    () => new Set<number>(),
  )

  for (let v = 0; v < N; v++) {
    for (let p = g.offsets[v]!; p < g.offsets[v + 1]!; p++) {
      nbrSet[v]!.add(g.adj[p]!)
    }
  }

  const rngC = makeRng({ seed: 2 })

  let tries = 0

  while (cycles.length < 800 && tries < 40000) {
    tries++

    const a = Math.floor(rngC.next() * N)
    const an = [...nbrSet[a]!]

    if (an.length < 2) {
      continue
    }

    const b = an[Math.floor(rngC.next() * an.length)]!
    const d = an[Math.floor(rngC.next() * an.length)]!

    if (b === d) {
      continue
    }

    // common neighbor c of b and d, c != a
    let c = -1

    for (const x of nbrSet[b]!) {
      if (x !== a && nbrSet[d]!.has(x)) {
        c = x
        break
      }
    }

    if (c < 0) {
      continue
    }

    cycles.push([a, b, c, d])
  }

  // run the dynamics (arrow on), instrumenting the net charge flow per edge
  const tone = new Int8Array(N)
  const moved = new Uint8Array(N)
  const rng = makeRng({ seed: 3 })

  for (let i = 0; i < N; i++) {
    tone[i] = (rng.next() < 0.3 ? (rng.next() < 0.5 ? 1 : -1) : 0)
  }

  const arrow = 0.1
  const warmup = 40
  const beats = 400

  for (let t = 0; t < warmup + beats; t++) {
    const record = t >= warmup
    moved.fill(0)

    for (let k = 0; k < euA.length; k++) {
      const v = euA[k]!
      const w = evA[k]!

      if (moved[v] || moved[w]) {
        continue
      }

      const a = tone[v]!
      const b = tone[w]!

      if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
        tone[v] = 0
        tone[w] = 0
        moved[v] = 1
        moved[w] = 1
      } else if ((a === 0) !== (b === 0)) {
        const cc = a === 0 ? w : v // charged
        const e = a === 0 ? v : w // empty

        if (rng.next() < 0.5) {
          tone[e] = tone[cc]!
          tone[cc] = 0
          moved[v] = 1
          moved[w] = 1

          if (record) {
            flow[k]! += cc === v ? 1 : -1
          } // net flow from v to w is +1 if charge went v->w
        }
      } else if (a === 0 && b === 0) {
        if (rng.next() < arrow) {
          if (rng.next() < 0.5) {
            tone[v] = 1
            tone[w] = -1
          } else {
            tone[v] = -1
            tone[w] = 1
          }

          moved[v] = 1
          moved[w] = 1
        }
      }
    }
  }

  // circulation around each 4-cycle, and the statistical floor (from per-edge flow magnitudes)
  let sumAbsCirc = 0
  let cycleCount = 0

  for (const [a, b, c, d] of cycles) {
    const e1 = edgeBetween(a!, b!)
    const e2 = edgeBetween(b!, c!)
    const e3 = edgeBetween(c!, d!)
    const e4 = edgeBetween(d!, a!)

    if (!e1 || !e2 || !e3 || !e4) {
      continue
    }

    const circ =
      e1.sign * flow[e1.k]! +
      e2.sign * flow[e2.k]! +
      e3.sign * flow[e3.k]! +
      e4.sign * flow[e4.k]!

    sumAbsCirc += Math.abs(circ)
    cycleCount++
  }

  const meanAbsCirculation =
    cycleCount > 0 ? sumAbsCirc / cycleCount : 0

  // floor: a reversible process has zero-mean per-edge flow, so circulation is a sum of 4 zero-mean
  // noisy terms. estimate the floor from the typical per-edge |flow| (the noise scale of one edge).
  let sumAbsFlow = 0

  for (let k = 0; k < flow.length; k++) {
    sumAbsFlow += Math.abs(flow[k]!)
  }

  const meanAbsFlow = sumAbsFlow / flow.length
  const floor = 2 * meanAbsFlow // ~the noise level of summing 4 independent zero-mean edge flows
  const ratio = floor > 0 ? meanAbsCirculation / floor : 0
  const reversible = ratio < 1.3 // circulation is at the noise floor, no persistent current
  const solved = reversible

  return {
    n: N,
    cycles: cycleCount,
    meanAbsCirculation,
    floor,
    ratio,
    reversible,
    solved,
  }
}

export default experiment({
  id: 'quantum/cycle-reversibility',
  code: 'E-QTM-0008',
  title: 'no persistent charge circulation around closed loops',
  category: 'quantum',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = cycleReversibility({ n: 20000 })
    const ok = r.solved && r.reversible

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the net charge circulation around closed 4-cycles sits at the noise floor, so the dynamics is a genuine equilibrium process',
      metrics: {
        meanAbsCirculation: r.meanAbsCirculation,
        floor: r.floor,
        ratio: r.ratio,
      },
    })
  },
})
