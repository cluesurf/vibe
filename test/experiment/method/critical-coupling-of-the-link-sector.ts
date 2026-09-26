// The critical coupling of the link sector, measured on the model's own rule: a candidate for a coupling the
// model FORCES rather than chooses (the self-tuned critical point of compact U(1)).
//
// The idea under test. The U(1) coupling of E-FRC-0164 is chosen (kappa = 2 pi K / N = 0.0613592). A compact
// U(1) has one coupling it cannot choose: the one at its phase transition, between the Coulomb phase and the
// confined (monopole-condensed) phase. If the vacuum sat at that point by itself, alpha would be forced. The
// leapfrog's thermal states are the classical statistics of the D4 bulk, Boltzmann weight exp(-beta sum over
// triangles of (1 - cos B)) with beta = K N / (2 pi <E^2>) (E-FRC-0173). That is a 4D Euclidean compact U(1)
// on the D4 lattice, the Euclidean form of a 3 + 1 theory, so its critical beta is the bare critical coupling
// of a 3 + 1 compact U(1) written on the model's own lattice. With the D4 plaquette normalization
// (code/measure/coupling-candidates: 1 / e^2 = 2 beta, since the 96 root pairs a . b = 1 give (1/3) sum
// (F(a, b) / 2)^2 = 4 sum F^2 per dock of volume 2), alpha_c = 1 / (8 pi beta_c).
//
// THIS IS A BULK MEASUREMENT: the 4D thermal lattice is the substrate. Its husk reading failed in E-FRC-0173
// (the column sum of a thermal state wraps mod N), so no husk number is claimed; the bulk number is the input
// E-MTH-0021 judges, labeled as bulk there.
//
// Method, fixed before any run. The E-FRC-0173 procedure exactly: N = 8192, K = 80, the D4 box side 4 and
// side 6, ordered starts (angles 0) with a hashed curl of the flux sized for a target beta, 800 beats to
// settle and 1,200 measured, read every 20 beats: beta from the flux, the plaquette mean cos, and the bulk
// DeGrand-Toussaint monopoles per D4 tetrahedron. Target betas 0.35, then 0.45 to 0.80 in steps of 0.025,
// then 1.0 (17 points a side). Deterministic: the starts are the rule's hashed fills, no seed.
//
// Two estimators of beta_c, both fixed before the run, on the points sorted by measured beta:
//   E1 the beta where the monopole density crosses 0.02 (between E-FRC-0173's Coulomb gate 0.01 and its
//      confined gate 0.05), by linear interpolation at the crossing of largest beta
//   E2 the midpoint of the adjacent pair with the steepest rise of <cos> per unit beta
// beta_c is E1 on side 6. Its uncertainty u is the largest of: |E1 - E2| on side 6, |E1(6) - E1(4)|, and half
// the beta gap of the crossing pair.
//
// Gates, fixed before the run:
// G1 the plaquette form is exactly 4 I on Lambda^2 (96 pairs), so 1 / e^2 = 2 beta on D4
// G2 on both sides the smallest measured beta has over 0.05 monopoles per tetrahedron and the largest under
//    0.01: the transition is inside the sweep
// G3 E1 exists on both sides and |E1(6) - E1(4)| < 0.05: the location is not a finite-size artifact at
//    the resolution claimed
// Reported, not gated: beta_c, u, 8 pi beta_c (the model's critical alpha^-1, bulk), and beside it the
// literature hypercubic Wilson beta_c = 1.0111331 (Arnold, Lippert, Neuhaus, Schilling 2003), a STAND-IN
// for a husk lattice transition the model has not measured, alpha^-1 = 4 pi beta_c = 12.706.
//
// Depth L2: a lattice gauge phase transition located on the model's substrate with its own rule. The
// critical coupling of a compact U(1) is not universal: it depends on the lattice and on the action (here the
// rounded sine table of E-FRC-0164), which is itself the finding that matters for alpha.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { addHashedCurl, emptyPhotonState, magneticSum, makePhotonRule, photonBeatInPlace, photonLatticeD4 } from '@/code/rule/photon-links'
import { bulkMonopoles, d4Tetrahedra } from '@/code/measure/photon-magnetism'
import { d4PlaquetteForm } from '@/code/measure/coupling-candidates'

const N = 8192
const K = 80
const SETTLE = 800
const BEATS = 2000
const EVERY = 20
const THRESHOLD = 0.02
const TARGETS = [0.35, 0.45, 0.475, 0.5, 0.525, 0.55, 0.575, 0.6, 0.625, 0.65, 0.675, 0.7, 0.725, 0.75, 0.775, 0.8, 1.0]
const HYPERCUBIC_BETA_C = 1.0111331

type Point = { target: number; beta: number; cos: number; monopoles: number }

const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)

function sweep(side: number): Point[] {
  const lattice = photonLatticeD4({ side })
  const rule = makePhotonRule({ lattice, n: N, k: K, capacity: 0, hop: false })
  const tetrahedra = d4Tetrahedra(lattice)

  return TARGETS.map(target => {
    const s = emptyPhotonState(rule)
    const t0 = (K * N) / (2 * Math.PI * target)

    addHashedCurl(rule, s, Math.max(1, Math.round(Math.sqrt((3 * t0) / 4))), 5.3)

    const temps: number[] = []
    const cos: number[] = []
    const mono: number[] = []

    for (let t = 0; t < BEATS; t++) {
      photonBeatInPlace(rule, s, t)

      if (t < SETTLE || t % EVERY !== 0) {
        continue
      }

      temps.push(s.flux.reduce((a, b) => a + b * b, 0) / (lattice.links - lattice.cells + 1))
      cos.push(magneticSum(rule, s.angle).meanCos)
      mono.push(bulkMonopoles(tetrahedra, s.angle, N) / tetrahedra.count)
    }

    return { target, beta: (K * N) / (2 * Math.PI * mean(temps)), cos: mean(cos), monopoles: mean(mono) }
  }).sort((a, b) => a.beta - b.beta)
}

// E1: the crossing of THRESHOLD at the largest beta, and the beta gap of its pair
function crossing(points: readonly Point[]): { beta: number; gap: number } | undefined {
  for (let i = points.length - 1; i > 0; i--) {
    const lo = points[i - 1]!
    const hi = points[i]!

    if (lo.monopoles >= THRESHOLD && hi.monopoles < THRESHOLD) {
      const f = (lo.monopoles - THRESHOLD) / (lo.monopoles - hi.monopoles)

      return { beta: lo.beta + f * (hi.beta - lo.beta), gap: hi.beta - lo.beta }
    }
  }

  return undefined
}

// E2: the midpoint of the steepest rise of <cos>
function steepest(points: readonly Point[]): number {
  let best = -Infinity
  let at = Number.NaN

  for (let i = 1; i < points.length; i++) {
    const lo = points[i - 1]!
    const hi = points[i]!
    const slope = (hi.cos - lo.cos) / Math.max(1e-9, hi.beta - lo.beta)

    if (slope > best) {
      best = slope
      at = (lo.beta + hi.beta) / 2
    }
  }

  return at
}

export default experiment({
  id: 'method/critical-coupling-of-the-link-sector',
  code: 'E-MTH-0023',
  title:
    'the critical coupling of the E-FRC-0164 link sector measured on its own rule: the thermal D4 bulk (a 4D Euclidean compact U(1), 1 / e^2 = 2 beta from the root pairs) confines below beta_c, located by the monopole crossing on sides 4 and 6, the bulk candidate for a self-tuned alpha',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const form = d4PlaquetteForm()
    const formExact = form.length === 6 && form.every((row, u) => row.every((x, v) => Math.abs(x - (u === v ? 4 : 0)) < 1e-12))
    const four = sweep(4)
    const six = sweep(6)
    const inside = (ps: readonly Point[]): boolean => ps[0]!.monopoles > 0.05 && ps[ps.length - 1]!.monopoles < 0.01
    const e14 = crossing(four)
    const e16 = crossing(six)
    const e2 = steepest(six)
    const located = e14 !== undefined && e16 !== undefined && Math.abs(e16.beta - e14.beta) < 0.05
    const betaC = e16?.beta ?? Number.NaN
    const u = Math.max(Math.abs(betaC - e2), Math.abs(betaC - (e14?.beta ?? Number.NaN)), (e16?.gap ?? Number.NaN) / 2)
    const metrics: Record<string, number> = {
      plaquetteFormDiagonal: form[0]?.[0] ?? Number.NaN,
      betaCritical: betaC,
      betaCriticalUncertainty: u,
      betaCriticalSideFour: e14?.beta ?? Number.NaN,
      betaCriticalSteepestCos: e2,
      inverseAlphaCriticalBulk: 8 * Math.PI * betaC,
      inverseAlphaCriticalBulkUncertainty: 8 * Math.PI * u,
    }

    for (const [side, ps] of [
      [4, four],
      [6, six],
    ] as const) {
      ps.forEach((p, i) => {
        metrics[`side${side}Point${i}Beta`] = Number(p.beta.toFixed(4))
        metrics[`side${side}Point${i}Cos`] = Number(p.cos.toFixed(4))
        metrics[`side${side}Point${i}Monopoles`] = Number(p.monopoles.toFixed(5))
      })
    }

    const ok = formExact && inside(four) && inside(six) && located

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the thermal D4 bulk of the leapfrog link sector is a 4D Euclidean compact U(1) with 1 / e^2 = 2 beta (the root-pair plaquette form is exactly 4 I), and its Coulomb-to-confined transition, located on the rule itself by the monopole density on sides 4 and 6, fixes a bulk critical coupling alpha_c = 1 / (8 pi beta_c); the number depends on the lattice and the action, so it is the model\'s critical coupling, not a universal one',
      metrics,
      control: {
        hypercubicWilsonBetaCritical: HYPERCUBIC_BETA_C,
        hypercubicInverseAlphaCritical: 4 * Math.PI * HYPERCUBIC_BETA_C,
        sideFourConfinedMonopoles: four[0]!.monopoles,
        sideFourCoulombMonopoles: four[four.length - 1]!.monopoles,
        sideSixConfinedMonopoles: six[0]!.monopoles,
        sideSixCoulombMonopoles: six[six.length - 1]!.monopoles,
      },
      notes:
        'L2, bulk (the substrate). Deterministic: ordered starts with the rule\'s hashed curl, no seed. beta is measured from the flux by equipartition, as in E-FRC-0173, so the points land where the microcanonical run puts them, not on the targets. The hypercubic value beside it is a literature stand-in for a husk transition the model has not measured, not a model number. First run, 2026-09-25, pass (970 s): the plaquette form is 4 I to 3e-15; beta_c = 0.6355 on side 6 (E1), 0.6304 on side 4, 0.6153 by the steepest cos, so u = 0.0211, set by half the gap of the crossing pair (0.594 to 0.637): on side 6 the ordered starts piled up above beta 0.59, one point on the confined side, so the edge is resolved only to that gap. alpha_c^-1 = 8 pi beta_c = 15.97 +- 0.53 (bulk), against 12.71 for the hypercubic stand-in: the same compact U(1) on another lattice with another action has another critical coupling, which is the non-universality that keeps a critical point from fixing alpha by itself. Monopoles 0.150 and 0.087 per tetrahedron at the lowest beta, 1e-5 and 0 at the highest.',
    })
  },
})
