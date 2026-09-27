// The husk transport of the candidate knit, with its store places: the pair-making isometric knit whose store
// returns the unmade pair's tokens, with the neutral veto (E-RLT-0067), linearized as E-RLT-0065 linearized the
// knit without the places (E-RLT-0071).
//
// THE QUESTION. E-RLT-0065 found the pair-making knit's husk exponents 3.84 (charge), 4.05 (trace), 4.08 (sound) and
// 1.99 (shear). The candidate adds the store places and the veto: a love-fear pair is unmade only where its two
// tokens hold one point. That reads the points, which E-RLT-0065's 72 indices do not carry. Does the candidate keep
// the law, and what does the veto do to the magnitudes?
//
// WHAT IS KNOWN BEFORE RUNNING. With the points, the one-body space has 648 indices (a vibe at each of 9 points on
// each slot, 432; a stored unit of either orientation at each of 9 points on each line, 216, one point per unit since
// the veto made its two tokens equal and the places never stream). The veto reads only whether two points are EQUAL,
// so the linearization commutes with every permutation of the 9 points; streaming moves points by grid moves, which
// are permutations. So the 648 indices split into the 72-index singlet and eight 72-index color blocks, the singlet
// evolves alone for ANY link field, and charge, energy and momentum (every husk scalar) are in the singlet. Its
// matrix is the pair-making knit's with an unmake allowed at chance 1/9 (two independent uniform points agree) and a
// make always allowed (code/measure/token-store-linearization). The rule keeps W(F4) (E-RLT-0067 G5), so the matrix
// commutes with the 72-index representation and the scalar law k^4 and shear k^2 are forced by symmetry, as in
// E-RLT-0065; the measurement adds whether the slow modes stay charge, energy and momentum, and the magnitudes.
//
// Gates, fixed before the first run of this file:
//  X1 exactness: with the veto off (point agreement chance 1) the matrix is E-RLT-0065's pairLinearization to 1e-10;
//     the candidate's matrix agrees with a 200,000-dock Kronecker estimate from the FULL collision (storeDockCollide,
//     'returned-neutral', with tokens, places and points) to 0.02, and the veto-off matrix with the same estimate of
//     'returned' to 0.02; the candidate's matrix commutes with all 1,152 coin maps to 1e-10; the veto changes the
//     matrix (largest entry change over 1e-3)
//  X2 invariants: exactly 6 left invariants with 6 unit eigenvalues of M(0) (to 1e-10), the energy vector inside their
//     span and the count vector outside it
//  X3 every gated fit resolved (standard error under 0.3)
// HYPOTHESIS H: the candidate's husk charge, trace and sound exponents are at least 3.5 and its husk shear exponent is
// 2 +- 0.5.
// Verdict: pass if X1 to X3 and H hold; fail if X1 to X3 hold and H does not; partial otherwise.
//
// DISCLOSED: a probe (tmp/cand-probe-linear.ts, log tmp/cand-probe-linear.log) checked the instrument before this file
// was written: veto off against pairLinearization 3.8e-13, the sampled estimates at 50,000 docks 0.016 (candidate)
// and 0.022 (veto off), the veto's largest change 0.065. No transport number was computed before the gates.
//
// Depth L2. DETERMINISM: exact enumeration, Kronecker docks, golden-spiral directions. The husk is read (the ladder is
// taken along husk directions, x4 = 0); the bulk is not.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { isometricTable } from '@/code/rule/isometric-knit'
import { pairEquivarianceDefect, pairLinearization } from '@/code/measure/pair-knit-linearization'
import { sampledStoreLinearization, storeLinearization, STORE_N, UNIFORM } from '@/code/measure/token-store-linearization'
import { storeKnit, storeWeave } from '@/code/measure/token-store-gates'
import { invariantsOf, readStoreTransport, storeExponents, storeSpectrum, type Named, type Space, type StoreExponent } from '@/code/measure/store-transport'
import { huskDirections } from '@/code/measure/husk-transport-order'

const N = STORE_N
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

type Reading = { husk: Record<string, StoreExponent>; invariants: Float64Array[]; unit: number; kc: number; means: Record<string, number>; series: Record<string, number[]> }

export function storeTransportOf(matrix: Float64Array): Reading {
  const matrices = [matrix]
  const invariants = invariantsOf(SPACE, matrices)
  const s = storeSpectrum(SPACE, NAMED, matrices, invariants)
  const kc = Math.sqrt(s.gap / s.dMax)
  const reading = readStoreTransport({ space: SPACE, named: NAMED, matrices, invariants, ks: LADDER.map(r => kc / r), directions: huskDirections(24) })

  return { husk: storeExponents(reading, FIT), invariants, unit: s.unitEigenvalues, kc, means: reading.means, series: reading.series }
}

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

const worstOf = (a: Float64Array, b: Float64Array): number => {
  let w = 0

  for (let i = 0; i < a.length; i++) w = Math.max(w, Math.abs((a[i] as number) - (b[i] as number)))

  return w
}

// the readings E-RLT-0073 cites, computed once per process
let cached: { status: string; metrics: Record<string, number> } | undefined

export function tokenStoreTransport(): { status: string; claim: string; metrics: Record<string, number>; notes: string } {
  const started = Date.now()
  const permutations = weylF4DirectionPermutations({ directions: ROOTS })
  const table = isometricTable()
  const reference = pairLinearization({ table }).matrix
  const vetoOff = storeLinearization({ table, background: { ...UNIFORM, equal: 1 } })
  const candidate = storeLinearization({ table, background: UNIFORM })
  const weave = storeWeave()
  const sampledCandidate = sampledStoreLinearization({ knit: storeKnit(weave, 'returned-neutral'), background: UNIFORM, samples: SAMPLES })
  const sampledOff = sampledStoreLinearization({ knit: storeKnit(weave, 'returned'), background: { ...UNIFORM, equal: 1 }, samples: SAMPLES })
  const offWorst = worstOf(vetoOff, reference)
  const sampledWorst = worstOf(sampledCandidate, candidate)
  const sampledOffWorst = worstOf(sampledOff, vetoOff)
  const defect = pairEquivarianceDefect(candidate, permutations)
  const vetoChange = worstOf(candidate, vetoOff)
  const x1 = offWorst < 1e-10 && sampledWorst < 0.02 && sampledOffWorst < 0.02 && defect < 1e-10 && vetoChange > 1e-3

  const knit = storeTransportOf(candidate)
  const off = storeTransportOf(vetoOff)
  const energyInside = inside(ENERGY, knit.invariants)
  const countInside = inside(COUNT, knit.invariants)
  const x2 = knit.invariants.length === 6 && knit.unit === 6 && Math.abs(energyInside - 1) < 1e-9 && countInside < 1 - 1e-6
  const gated = ['charge', 'trace', 'sound', 'shear']
  const x3 = gated.every(q => (knit.husk[q]?.error ?? 1) < 0.3)
  const slope = (r: Reading, q: string): number => r.husk[q]?.slope ?? Number.NaN
  const h = slope(knit, 'charge') >= 3.5 && slope(knit, 'trace') >= 3.5 && slope(knit, 'sound') >= 3.5 && Math.abs(slope(knit, 'shear') - 2) <= 0.5

  const metrics: Record<string, number> = {
    vetoOffWorst: offWorst,
    sampledWorst,
    sampledVetoOffWorst: sampledOffWorst,
    equivarianceDefect: defect,
    vetoLargestChange: vetoChange,
    invariants: knit.invariants.length,
    unitEigenvalues: knit.unit,
    energyInsideInvariants: energyInside,
    countInsideInvariants: countInside,
    kc: knit.kc,
    vetoOffKc: off.kc,
  }

  for (const [name, r] of Object.entries({ candidate: knit, vetoOff: off })) {
    for (const [q, e] of Object.entries(r.husk)) {
      metrics[`${name}_husk_${q}_exponent`] = Number(e.slope.toFixed(4))
      metrics[`${name}_husk_${q}_error`] = Number(e.error.toFixed(4))
      metrics[`${name}_husk_${q}_anisotropyAtSmallestK`] = e.atSmallestK
    }

    for (const [q, v] of Object.entries(r.means)) if (Number.isFinite(v)) metrics[`${name}_husk_${q}_mean`] = v

    // added after the first run (a reading, no gate): the charge anisotropy at each rung, k_c / 4 to k_c / 256
    ;(r.series.charge ?? []).forEach((a, rung) => {
      metrics[`${name}_husk_charge_anisotropy_rung${LADDER[rung]}`] = a
    })

    // and its slope over the three longest rungs (k_c / 4 to k_c / 16), above the rounding floor
    const c = r.series.charge ?? []

    metrics[`${name}_husk_charge_slopeLongestThree`] = Math.log((c[0] ?? 1) / (c[2] ?? 1)) / Math.log(4)
  }

  metrics.seconds = (Date.now() - started) / 1000

  const status = x1 && x2 && x3 ? (h ? 'pass' : 'fail') : 'partial'
  const list = (r: Reading): string => gated.map(q => `${q} ${slope(r, q).toFixed(2)} +- ${r.husk[q]?.error.toFixed(2)}`).join(', ')

  cached = { status, metrics }

  return {
    status,
    claim: `the candidate knit keeps the isotropic husk law with its store places: the 648 one-body indices (a vibe or a stored unit at each of 9 points) split exactly into a 72-index singlet that carries every husk scalar for any link field and eight color blocks, and the singlet's exact linearization (an unmake allowed where two independent uniform points agree, chance 1/9) matches the full collision with tokens and places sampled over ${SAMPLES.toLocaleString('en-US')} docks to ${sampledWorst.toFixed(3)}, reduces to E-RLT-0065's matrix with the veto off (${offWorst.toExponential(1)}), commutes with all 1,152 coin maps (${defect.toExponential(1)}), keeps exactly ${knit.invariants.length} invariants (charge, energy, momentum; the count is not one), and gives husk exponents ${list(knit)}, against ${list(off)} with the veto off`,
    metrics,
    notes: `L2. Gates: X1 ${x1}, X2 ${x2}, X3 ${x3}, H ${h}. Magnitudes at the longest rung (per beat): husk charge D ${knit.means.charge?.toFixed(3)} with the veto against ${off.means.charge?.toFixed(3)} without (E-RLT-0065 0.602), shear rate ${knit.means.shear?.toFixed(3)} against ${off.means.shear?.toFixed(3)} (1.249), sound ${knit.means.sound?.toFixed(3)} against ${off.means.sound?.toFixed(3)} (0.408); k_c ${knit.kc.toFixed(3)} against ${off.kc.toFixed(3)}. The veto slows the store's exchange with the gas (an unmake needs agreeing points), which is what moves the magnitudes. The eight color blocks (the nine color densities, which flat links conserve one by one and live links move covariantly) are not built: they carry no husk scalar. The background is the symmetric one (every slot and store a third to each value, points uniform), the infinite-temperature equilibrium; E-RLT-0072 takes the oriented hot vacuum. FIRST RUN (13.0 s): partial, on X3 alone (charge fit error 0.37; H then also misses on charge, 3.29). ADDED AFTER THE FIRST RUN, a reading with no gate and no gate moved (the second run reproduces every gated number): the charge anisotropy per rung, ${(r0 => r0.map(x => x.toExponential(2)).join(', '))(Object.keys(metrics).filter(k => k.startsWith('candidate_husk_charge_anisotropy_rung')).map(k => metrics[k] as number))}. It falls by 15.97 and 15.96 per halving of k over the three longest rungs (slope ${metrics['candidate_husk_charge_slopeLongestThree']?.toFixed(3)}, k^4 to three digits) until it meets the rounding floor near 1e-9 at k_c / 32, below which the reading rises as the floor over k^2: the five-rung fit straddles the floor, which is an instrument limit (the candidate's k_c is 0.18, smaller than E-RLT-0065's, so its ladder reaches the floor a rung sooner). The veto-off matrix has the same floor (slope over the longest three ${metrics['vetoOff_husk_charge_slopeLongestThree']?.toFixed(3)}; its five-rung 3.87 here against 3.84 in E-RLT-0065 differ by rounding alone, the matrices agreeing to 4e-13).`,
  }
}

export function tokenStoreTransportCached(): { status: string; metrics: Record<string, number> } {
  return cached ?? tokenStoreTransport()
}

export default experiment({
  id: 'relativity/token-store-transport',
  code: 'E-RLT-0071',
  title:
    'the candidate knit keeps the isotropic husk law with its store places, partial (the charge fit straddles the rounding floor): the 648 one-body indices split into a 72-index singlet that carries every husk scalar for any link field, whose exact linearization (unmake allowed where two uniform points agree, 1/9) matches the full collision with tokens and places to 0.009, commutes with all 1,152 coin maps and keeps exactly charge, energy and momentum; husk trace 3.96, sound 4.00, shear 1.96, charge k^4 to three digits over the resolved rungs (five-rung fit 3.29 +- 0.37); the veto lowers the charge diffusion from 0.602 to 0.468, the shear rate from 1.249 to 0.931 and the sound from 0.408 to 0.342',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = tokenStoreTransport()

    return verdict({
      status: r.status as 'pass' | 'fail' | 'partial',
      claim: r.claim,
      metrics: r.metrics,
      control: { vetoOffChargeExponent: r.metrics['vetoOff_husk_charge_exponent'] ?? -1, vetoOffShearExponent: r.metrics['vetoOff_husk_shear_exponent'] ?? -1 },
      notes: r.notes,
    })
  },
})
