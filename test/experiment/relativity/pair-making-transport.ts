// The husk transport of the pair-making isometric knit: does pair creation keep the scalar law k^4 and the
// shear k^2 (E-RLT-0065)?
//
// THE QUESTION. E-RLT-0064 adds a W(F4)-covariant pair move (code/rule/pair-making-knit) to the isometric knit
// (E-RLT-0061). The count is no longer kept; the energy E = count + 2 sum |tau| is, with a store that does not
// stream. Does the husk transport keep E-RLT-0061's law: diffusion and sound isotropic through k^4, the shear
// through k^2?
//
// WHAT THE THEOREMS SAY, before measuring. The collision commutes with all 1,152 coin maps acting on slots and on
// the oriented store, so its exact linearization A commutes with their 72-index representation, and the period
// map obeys M(g k) = g M(k) g^-1. Every husk transport scalar is then a W(F4)-invariant function of k, whose only
// quartic is |k|^4 (E-MTH-0008), and W(F4) forces the husk shear only at leading order (E-RLT-0058). So the law is
// predicted by symmetry alone, whatever the store does; what the measurement adds is whether the slow modes are
// still charge, energy and momentum (the store could add a slow non-streaming mode or keep a separate count),
// and the magnitudes.
//
// THE MEASUREMENT. The exact 72-index linearization at the uniform background (code/measure/pair-knit-
// linearization: slots and stores each a third to each value), summed over the 3^12 line-momentum vectors; the
// husk exponents by E-RLT-0059's method with the store as non-streaming indices (code/measure/store-transport),
// the ladder k_c / 4 to k_c / 256, fit over the five longest rungs. CONTROL: the same pair move on the first-
// mirror knit (not covariant), whose husk charge law should stay anisotropic at leading order. REFERENCE: the
// isometric knit without the move, from E-RLT-0061's own 48-index tools.
//
// DISCLOSED: a probe (tmp/pair-probe-transport.ts) computed the pair knit's and the control's exponents before this
// file was written (charge 3.84, trace 4.05, sound 4.08, shear 1.99; control charge 0.008). The thresholds are
// E-RLT-0061's, unchanged. The unit-eigenvalue tolerance is 1e-10, not 1e-12, because the 3^12-term sum carries
// about 7e-12 of rounding (the idle-collision check reads 6.8e-12 in the probe, tmp/pair-probe-linear.log).
//
// Gates, fixed before the first run of this file:
//  X1 exactness: the idle collision (no coin map, no pair move) gives the identity to 1e-10; with the pair move
//     off the matrix is E-RLT-0061's 48-index matrix beside an identity store block, to 1e-10; the exact matrix
//     agrees with a 200,000-dock Kronecker estimate from the collision function to 0.02; it commutes with all
//     1,152 coin maps to 1e-10, and the control's does not (over 1e-3)
//  X2 invariants: exactly 6 left invariants with 6 unit eigenvalues of M(0) (to 1e-10), the energy vector inside
//     their span and the count vector outside it
//  X3 every gated fit resolved (standard error under 0.3)
// HYPOTHESIS H: the pair knit's husk charge, trace and sound exponents are at least 3.5 and its husk shear exponent
// is 2 +- 0.5; the control's husk charge exponent is under 1.
// Verdict: pass if X1 to X3 and H hold; fail if X1 to X3 hold and H does not; partial otherwise.
//
// Depth L2. DETERMINISM: exact enumeration, Kronecker docks, golden-spiral directions.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { firstMirrorTable, isometricTable, lineMomentumRule, type MomentumTable } from '@/code/rule/isometric-knit'
import { makePairKnit } from '@/code/rule/pair-making-knit'
import { pairEquivarianceDefect, pairLinearization, PAIR_N, sampledPairLinearization } from '@/code/measure/pair-knit-linearization'
import { invariantsOf, readStoreTransport, storeExponents, storeSpectrum, type Named, type Space, type StoreExponent } from '@/code/measure/store-transport'
import { huskDirections, invariantBasis } from '@/code/measure/husk-transport-order'
import { lineMomentumLinearization } from '@/code/measure/line-momentum-linearization'
import { exponentsOf, readTransport, spectrumOf } from '@/code/measure/husk-transport-exponents'

const N = PAIR_N
const ROOTS = rootsD4()
const LADDER = [4, 8, 16, 32, 64, 128, 256]
const FIT = 5
const SAMPLES = 200_000
const SPACE: Space = { n: N, roots: Array.from({ length: N }, (_, i) => (i < 48 ? ROOTS[i >> 1] : undefined)) }
const NAMED: Named = {
  charge: Float64Array.from({ length: N }, (_, i) => (i < 48 ? (i % 2 === 0 ? 1 : -1) : 0)),
  momentumAlong: u => Float64Array.from({ length: N }, (_, i) => (i < 48 ? (ROOTS[i >> 1] as number[]).reduce((s, x, k) => s + x * (u[k] ?? 0), 0) : 0)),
}
const ENERGY = Float64Array.from({ length: N }, (_, i) => (i < 48 ? 1 : 2))
const COUNT = Float64Array.from({ length: N }, (_, i) => (i < 48 ? 1 : 0))

type Reading = { husk: Record<string, StoreExponent>; invariants: Float64Array[]; unit: number; kc: number; means: Record<string, number>; axes: Record<string, number[]> }

function transport(matrix: Float64Array): Reading {
  const matrices = [matrix]
  const invariants = invariantsOf(SPACE, matrices)
  const s = storeSpectrum(SPACE, NAMED, matrices, invariants)
  const kc = Math.sqrt(s.gap / s.dMax)
  const reading = readStoreTransport({ space: SPACE, named: NAMED, matrices, invariants, ks: LADDER.map(r => kc / r), directions: huskDirections(24) })

  return { husk: storeExponents(reading, FIT), invariants, unit: s.unitEigenvalues, kc, means: reading.means, axes: reading.axes }
}

// the share of a vector's norm inside the span of an orthonormal list
function inside(v: Float64Array, basis: readonly Float64Array[]): number {
  let norm = 0
  let projected = 0

  for (let i = 0; i < v.length; i++) norm += (v[i] as number) ** 2

  for (const b of basis) {
    let s = 0

    for (let i = 0; i < v.length; i++) s += (b[i] as number) * (v[i] as number)

    projected += s * s
  }

  return projected / norm
}

export default experiment({
  id: 'relativity/pair-making-transport',
  code: 'E-RLT-0065',
  title:
    'pair creation keeps the isotropic husk law: the exact 72-index linearization of the pair-making isometric knit commutes with all 1,152 coin maps (defect 2e-13, the sampled check 0.008), keeps exactly 6 invariants (charge, energy E = count + 2 sum |tau|, momentum; the count is not one), and gives husk exponents 3.84 (charge diffusion), 4.05 (trace), 4.08 (sound) and 1.99 (shear), against 3.99, 3.98, 3.96, 2.01 without the move, while the same move on the first-mirror knit stays anisotropic at leading order (charge 0.01); the stored pairs slow the sound from 0.72 to 0.41 per beat, raise the charge diffusion from 0.45 to 0.60 and the shear rate from 0.63 to 1.25',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const permutations = weylF4DirectionPermutations({ directions: ROOTS })
    const none: MomentumTable = new Array(13 ** 4).fill(undefined)

    // X1
    const idle = pairLinearization({ table: none, pairs: false }).matrix
    let idleWorst = 0

    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) idleWorst = Math.max(idleWorst, Math.abs((idle[r * N + c] as number) - (r === c ? 1 : 0)))

    const off = pairLinearization({ table: isometricTable(), pairs: false }).matrix
    const base = lineMomentumLinearization({ rule: lineMomentumRule('isometric') }).matrix
    let offWorst = 0

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const expected = r < 48 && c < 48 ? (base[r * 48 + c] as number) : r === c ? 1 : 0

        offWorst = Math.max(offWorst, Math.abs((off[r * N + c] as number) - expected))
      }
    }

    const exact = pairLinearization({ table: isometricTable() })
    const control = pairLinearization({ table: firstMirrorTable() })
    const sampled = sampledPairLinearization({ knit: makePairKnit({ mesh: d4BoxMesh({ side: 1 }) }), samples: SAMPLES })
    let sampledWorst = 0

    for (let i = 0; i < N * N; i++) sampledWorst = Math.max(sampledWorst, Math.abs((sampled[i] as number) - (exact.matrix[i] as number)))

    const defect = pairEquivarianceDefect(exact.matrix, permutations)
    const controlDefect = pairEquivarianceDefect(control.matrix, permutations)
    const x1 = idleWorst < 1e-10 && offWorst < 1e-10 && sampledWorst < 0.02 && defect < 1e-10 && controlDefect > 1e-3

    // X2, X3, H
    const knit = transport(exact.matrix)
    const first = transport(control.matrix)
    const energyInside = inside(ENERGY, knit.invariants)
    const countInside = inside(COUNT, knit.invariants)
    const x2 = knit.invariants.length === 6 && knit.unit === 6 && Math.abs(energyInside - 1) < 1e-9 && countInside < 1 - 1e-6
    const gated: [Reading, string][] = [
      [knit, 'charge'],
      [knit, 'trace'],
      [knit, 'sound'],
      [knit, 'shear'],
      [first, 'charge'],
    ]
    const x3 = gated.every(([r, q]) => (r.husk[q]?.error ?? 1) < 0.3)
    const slope = (r: Reading, q: string): number => r.husk[q]?.slope ?? Number.NaN
    const h = slope(knit, 'charge') >= 3.5 && slope(knit, 'trace') >= 3.5 && slope(knit, 'sound') >= 3.5 && Math.abs(slope(knit, 'shear') - 2) <= 0.5 && slope(first, 'charge') < 1

    // reference: the isometric knit without the move (E-RLT-0061's tools)
    const refInvariants = invariantBasis([base])
    const refSpectrum = spectrumOf({ matrices: [base], invariants: refInvariants })
    const refKc = Math.sqrt(refSpectrum.gap / refSpectrum.dMax)
    const refReading = readTransport({ matrices: [base], invariants: refInvariants, ks: LADDER.map(r => refKc / r), directions: huskDirections(24), husk: true })
    const reference = exponentsOf(refReading, FIT)

    const metrics: Record<string, number> = {
      idleWorst,
      pairOffWorst: offWorst,
      sampledWorst,
      equivarianceDefect: defect,
      controlEquivarianceDefect: controlDefect,
      actingChance: exact.acting,
      invariants: knit.invariants.length,
      unitEigenvalues: knit.unit,
      energyInsideInvariants: energyInside,
      countInsideInvariants: countInside,
      kc: knit.kc,
      controlKc: first.kc,
      referenceKc: refKc,
    }

    for (const [name, r] of Object.entries({ pair: knit, control: first })) {
      for (const [q, e] of Object.entries(r.husk)) {
        metrics[`${name}_husk_${q}_exponent`] = Number(e.slope.toFixed(4))
        metrics[`${name}_husk_${q}_error`] = Number(e.error.toFixed(4))
        metrics[`${name}_husk_${q}_anisotropyAtSmallestK`] = e.atSmallestK
      }

      for (const [q, v] of Object.entries(r.means)) if (Number.isFinite(v)) metrics[`${name}_husk_${q}_mean`] = v
    }

    for (const [q, e] of Object.entries(reference)) metrics[`reference_husk_${q}_exponent`] = Number(e.slope.toFixed(4))
    for (const [q, v] of Object.entries(refReading.means)) if (Number.isFinite(v)) metrics[`reference_husk_${q}_mean`] = v

    metrics.seconds = (Date.now() - started) / 1000

    const status = x1 && x2 && x3 ? (h ? 'pass' : 'fail') : 'partial'
    const list = (r: Reading): string => ['charge', 'trace', 'sound', 'shear'].map(q => `${q} ${slope(r, q).toFixed(2)} +- ${r.husk[q]?.error.toFixed(2)}`).join(', ')

    return verdict({
      status,
      claim: `pair creation keeps the husk law: the pair-making knit's exact 72-index linearization commutes with all 1,152 coin maps (defect ${defect.toExponential(1)}), keeps exactly ${knit.invariants.length} invariants (charge, energy E = count + 2 sum |tau|, momentum; the count is not one, ${countInside.toFixed(3)} of it inside), and gives husk exponents ${list(knit)}; the first-mirror control with the same move gives ${list(first)}`,
      metrics,
      control: { firstMirrorHuskChargeExponent: slope(first, 'charge'), firstMirrorDefect: controlDefect },
      notes: `L2. Gates: X1 ${x1}, X2 ${x2}, X3 ${x3}, H ${h}. First run recorded as is. Magnitudes at the longest rung (per beat): husk charge D ${knit.means.charge?.toFixed(3)} with the move against ${refReading.means.charge?.toFixed(3)} without (E-RLT-0061), shear rate ${knit.means.shear?.toFixed(3)} against ${refReading.means.shear?.toFixed(3)}, sound speed ${knit.means.sound?.toFixed(3)} against ${refReading.means.sound?.toFixed(3)}; k_c ${knit.kc.toFixed(3)} against ${refKc.toFixed(3)}. Reference exponents without the move: charge ${reference.charge?.slope.toFixed(2)}, trace ${reference.trace?.slope.toFixed(2)}, sound ${reference.sound?.slope.toFixed(2)}, shear ${reference.shear?.slope.toFixed(2)}. The law is forced by the covariance (the matrix commutes with the 72-index representation of W(F4)); the measurement confirms the slow modes stay charge, energy and momentum, so the stored pairs relax and add no hydrodynamic mode. The store does not stream: its 24 indices carry phase 1 in the period map.`,
    })
  },
})
