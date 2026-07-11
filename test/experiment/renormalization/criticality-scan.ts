// P129: the criticality scan, the doorway to the continuum. (discovering-the-hidden-layers.md.)
//
// A generic lattice coarse-grains to nothing (a short correlation length, a trivial gapped fixed point).
// To get a real continuum field, the base must be tuned to a CRITICAL POINT where the correlation length
// diverges. The signature is a peak in the SUSCEPTIBILITY (the fluctuation of the order parameter). We
// scan the arrow rate (the creation coupling, competing with annihilation toward the absorbing peace
// state), measure the activity (order parameter) and its susceptibility, and look for the critical point.
// That point, if it exists, is where coarse-graining flows to a scale-invariant continuum theory.
// Run: npx tsx code/experiment/p129-criticality-scan.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { edgesFromCsr } from '@/code/tool/graph'
import { conservingEdgeSweep } from '@/code/dynamics/conserving-sweep'
import { linearFit } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function criticalityScan(input?: { n?: number }): {
  n: number
  scan: { arrow: number; density: number }[]
  beta: number
  betaR2: number
  meanField: boolean
  vanishesAtZero: boolean
  solved: boolean
} {
  const n = input?.n ?? 20000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)

  // the absorbing (creation-off) transition is at arrow -> 0. The mean-field rate equation for the
  // pair reaction (creation 0 -> +,- at rate arrow, annihilation +,- -> 0) gives a steady-state density
  // rho ~ sqrt(arrow), so beta = 1/2. Finding beta near 1/2 confirms a critical point at arrow -> 0 with
  // MEAN-FIELD exponents, expected because the hyperbolic graph is above the upper critical dimension.
  const arrows = [0.001, 0.002, 0.004, 0.008, 0.016, 0.032, 0.064]
  const scan: { arrow: number; density: number }[] = []

  for (const arrow of arrows) {
    const tone = new Int8Array(N)
    const rng = makeRng({ seed: 3 })

    for (let i = 0; i < N; i++) {
      tone[i] = rng.next() < 0.2 ? (rng.next() < 0.5 ? 1 : -1) : 0
    }

    for (let t = 0; t < 200; t++) {
      conservingEdgeSweep({ tone, eu, ev, moved, rng, arrow })
    }
    // relax to steady state

    const samples = 100

    let mean = 0

    for (let s = 0; s < samples; s++) {
      let active = 0

      for (let i = 0; i < N; i++) {
        if (tone[i] !== 0) {
          active++
        }
      }

      mean += active / N
      conservingEdgeSweep({ tone, eu, ev, moved, rng, arrow })
    }

    mean /= samples
    scan.push({ arrow, density: mean })
  }

  // fit log(density) = beta * log(arrow) + const
  const fit = linearFit({
    xs: scan.map(s => Math.log(s.arrow)),
    ys: scan.map(s => Math.log(s.density)),
  })

  const beta = fit.slope
  const betaR2 = fit.r2
  const meanField = beta > 0.35 && beta < 0.65 // mean-field directed percolation, beta = 1/2
  const vanishesAtZero =
    scan[0]!.density < scan[scan.length - 1]!.density * 0.5 // order parameter -> 0 as arrow -> 0

  const solved = meanField && vanishesAtZero && betaR2 > 0.9

  return { n: N, scan, beta, betaR2, meanField, vanishesAtZero, solved }
}

export default experiment({
  id: 'renormalization/criticality-scan',
  code: 'E-SCL-0004',
  title:
    'an absorbing critical point at arrow zero with mean-field exponent beta near one half',
  category: 'renormalization',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = criticalityScan({ n: 20000 })
    const ok =
      r.solved && r.meanField && r.vanishesAtZero && r.betaR2 > 0.9

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the order parameter vanishes as density proportional to square root of arrow toward arrow zero, a mean-field critical point whose continuum limit is a free field',
      metrics: {
        beta: r.beta,
        betaR2: r.betaR2,
        densityFirst: r.scan[0]?.density ?? 0,
        densityLast: r.scan[r.scan.length - 1]?.density ?? 0,
      },
    })
  },
})
