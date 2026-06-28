// P144: the dynamics on the EMERGENT FLAT LAYER (a horosphere), spatial RP and dispersion re-run there. (P133, P137, P142.)
//
// The QFT and Lorentz physics belong to the emergent FLAT layer, a horosphere (P142), not the curved
// hyperbolic bulk. The rule is geometry-independent (P131), so we run it on the horosphere lattice (the
// in-surface proximity graph from buildHorosphere) and re-measure the two things that decide the physics:
//
//   (1) TRANSPORT (the dispersion answer): a single charge's mean-square displacement exponent. On the
//       curved bulk it is BALLISTIC (about 1.6, P123, the hyperbolic rate-of-escape). On a FLAT layer a
//       random walk should be DIFFUSIVE (about 1, MSD ~ t). Confirming this shows the ballistic z=1 was a
//       hyperbolic-bulk artifact, the physical flat layer is diffusive (z=2), matching P137.
//   (2) the static correlation RANGE (the spatial-RP answer): is the field still MASSIVE (contact
//       dominated) on the flat layer, confirming the masslessness gap is the RULE (needs a second
//       conservation law), not the geometry (P134, P136).
// Run: npx tsx code/experiment/p144-horosphere-dynamics.ts

import {
  buildCellGraph,
  buildHorosphere,
} from '@/code/substrate/coxeter/cell-direct'
import { makeRng, Rng } from '@/code/tool/rng'
import { bfsShells } from '@/code/measure/shells'
import { graphWalkMsdExponent } from '@/code/dynamics/random-walk'
import { conservingEdgeListSweep } from '@/code/dynamics/conserving-sweep'
import {
  proximityGraph,
  centerNearestOrigin,
} from '@/code/substrate/proximity-graph'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// single-charge random walk on a graph, MSD (graph distance from start)^2 vs time, fit the exponent
function msdExponent(
  neighbors: number[][],
  start: number,
  beats: number,
  runs: number,
): number {
  return graphWalkMsdExponent({ neighbors, start, beats, runs })
}

// conserved-exchange field beat on a general graph (edge list), for the static correlation
function fieldBeat(
  tone: Int8Array,
  edges: [number, number][],
  moved: Uint8Array,
  rng: Rng,
  arrow: number,
): void {
  conservingEdgeListSweep({ tone, edges, moved, rng, arrow })
}

export function horosphereDynamics(input?: { maxCells?: number }): {
  horoCells: number
  horoMsdExp: number
  bulkMsdExp: number
  correlationRange: number
  horoIsMassive: boolean
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 14000
  const bulk = buildCellGraph({ symbol: [5, 3, 4], maxCells })
  const horo = buildHorosphere({
    symbol: [5, 3, 4],
    maxCells,
    bandHalfWidth: 0.4,
  })

  const hg = proximityGraph({ coords: horo.coords })

  // pick a central horosphere cell (nearest origin) as the walk start
  const center = centerNearestOrigin(horo.coords)
  // transport exponents are informational only here, both the 14k-cell ball and the ~250-cell horosphere
  // patch SATURATE within a few steps (P123 needed the long sliver), so they are not conclusive. The
  // established contrast is the bulk-ballistic sliver (P123) vs the flat-diffusive dispersion (P137).
  const horoMsdExp = msdExponent(hg, center, 8, 600)
  const bulkMsdExp = msdExponent(bulk.neighbors, 0, 8, 600)

  // static correlation on the horosphere lattice: run the field, measure C(r) by graph distance
  const edges: [number, number][] = []

  for (let v = 0; v < hg.length; v++) {
    for (const w of hg[v]!) {
      if (w > v) {
        edges.push([v, w])
      }
    }
  }

  const dCenter = bfsShells({ neighbors: hg, root: center }).depth
  const maxR = Math.min(8, Math.max(...Array.from(dCenter)))
  const tone = new Int8Array(hg.length)
  const moved = new Uint8Array(hg.length)
  const rng = makeRng({ seed: 3 })

  for (let i = 0; i < hg.length; i++) {
    tone[i] = (rng.next() < 0.3 ? (rng.next() < 0.5 ? 1 : -1) : 0)
  }

  for (let t = 0; t < 60; t++) {
    fieldBeat(tone, edges, moved, rng, 0.1)
  }

  const sumP = new Float64Array(maxR + 1)
  const cntP = new Float64Array(maxR + 1)
  const T = 3000

  let mean = 0
  let mc = 0

  for (let t = 0; t < T; t++) {
    for (let i = 0; i < hg.length; i++) {
      mean += tone[i]!
      mc++
    }

    // correlation by graph distance from the center
    for (let i = 0; i < hg.length; i++) {
      const r = dCenter[i]!

      if (r >= 0 && r <= maxR) {
        sumP[r]! += tone[center]! * tone[i]!
        cntP[r]!++
      }
    }

    fieldBeat(tone, edges, moved, rng, 0.1)
  }

  const m2 = (mean / mc) ** 2
  const c: number[] = []

  for (let r = 0; r <= maxR; r++) {
    c.push(cntP[r]! > 0 ? sumP[r]! / cntP[r]! - m2 : 0)
  }

  let correlationRange = 0

  for (let r = 1; r <= maxR; r++) {
    if (Math.abs(c[r]!) > 0.05 * Math.abs(c[0]!)) {
      correlationRange = r
    }
  }

  // the decisive, clean result: the field is MASSIVE (contact-dominated) on the actual emergent flat layer
  const horoIsMassive = correlationRange <= 2
  const solved = horoIsMassive

  return {
    horoCells: horo.cellCount,
    horoMsdExp,
    bulkMsdExp,
    correlationRange,
    horoIsMassive,
    solved,
  }
}

export default experiment({
  id: 'quantum/horosphere-dynamics',
  code: 'E-QTM-0014',
  title: 'the field is massive on the emergent flat layer too',
  category: 'quantum',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = horosphereDynamics({ maxCells: 14000 })
    const ok = r.solved && r.horoIsMassive

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the field is massive (contact-dominated) on the flat horosphere too, so the masslessness gap is the rule not the geometry',
      metrics: {
        correlationRange: r.correlationRange,
        horoCells: r.horoCells,
      },
    })
  },
})
