// A single quantum of light that travels (E-FRC-0231): the plaquette ladder (code/rule/plaquette-ladder), Z_N
// lattice QED on a periodic two-leg ladder of husk squares with every flux a column of D bulk trits (N = 2D + 1),
// kappa = 2 / (2D + 1) carried by the drift (c = 2, r = N, M = 2 N^2, the split E-FRC-0230 found holds a ladder),
// every factor exact over Z[zeta_M].
//
// DERIVED before the first run.
//   (1) one quantum is the classical wave   In the harmonic reading the beat is a metaplectic (Gaussian) map
//                       whose Heisenberg action on the linear fields X = (B, m) is the classical leapfrog M
//                       (drift B += s K m, force m -= f B), 2 - 2 cos omega = kappa K(k), K = 4 - 2 cos k: the
//                       one-quantum band IS the classical light's omega(k), and a linear field c^T X acting on the
//                       vacuum makes exactly one quantum, whose excess energy on any quadratic density H is
//                       2 z^dag H z / (c^dag W c) with z(t) = M^t W c, W the vacuum's two-point function (Wick): the
//                       single quantum's energy moves as a classical wave packet, at the classical group velocity.
//                       The classical light this is compared with is the E~ leapfrog (E-FRC-0185, 0205, 0207), whose
//                       shadow obeys the same symbol exactly; on the ladder its band is a waveguide band with cutoff
//                       omega(0) = arccos(1 - kappa), the husk photon's massless branch needing a closed transverse
//                       direction the ladder does not have
//   (2) where it fails  The reading holds while the state stays inside the column: the finite column cuts the
//                       ladder (E-FRC-0230), so the band departs from the symbol by an amount that falls with N
//   (3) Gauss           Every factor is a permutation of, or diagonal in, flux configurations that keep each
//                       dock's out-flux minus in-flux minus its charge: the recorded hop moves the charge and adds
//                       its unit to the rung it crosses, the loop shift adds a closed loop. The UNRECORDED hop (the
//                       charge moves, no flux) must break it on every state
//   (4) reversible      The inverse of every factor is exact (conjugate phases, conjugate loop coefficients, the hop
//                       with z -> z^-1)
//
// Gates, fixed before the first run (probes before this file, disclosed in the notes):
// S1 the band: on the boxes L = 2 (N = 9, 13, 17, 21, 25) and L = 3 (N = 9, 11, 13), the one-quantum level in each
//    momentum sector (the eigenstate with the largest overlap with m_k |vac>) sits at the classical symbol's
//    omega(k) within 1e-3 relative at every N >= 13 and within 1e-4 at N >= 21; its overlap is at least 0.99 at
//    N >= 17 (L = 2)
// S2 the control, the classical split (c = N, r = 2: the same kappa, the same classical light): on L = 2 at N = 9
//    and 13 the band misses the symbol by more than 10 times the balanced split's miss at the same box
// S3 a quantum that travels: on L = 6, N = 11, the excess energy per square of m_0 |vac> (the vacuum found by
//    spectral filtering, its residual reported) against the classical image 2 z^dag H_p z / (c^dag W c) over 20
//    beats: the arrival beat of the peak at the antipode (square 3) agrees within 1 beat, and the largest
//    difference of the per-square excess is within 0.05 of the peak
// S4 Gauss, exact: on the full register space (every link's flux a register, the STAND-IN charge at b_0 or t_0)
//    at L = 2, N = 3 and 5, the recorded hop and every loop shift keep every dock's Gauss value on every basis state
//    (0 violations over 1,458 and 31,250 states), the unrecorded hop breaks it on every state; the sector rule
//    (loop coordinates) equals the full-space rule exactly (BigInt cyclotomic) over 4 beats from 3 starts per N
//    (0 mismatches); the port form u + w = 0 holds by construction (each factor writes d to the tail and -d to the
//    head column)
// S5 reversible and integer: 8 beats forward and 8 back return every start exactly (L = 2, N = 3 and 5, L = 3,
//    N = 3, with the charge; 0 mismatches), every exponent an integer mod M
// Reported: the thermometer lift (every register value a column of D trits, column sums, the one-trit steps and
// the wraps), the group velocity of the band between sectors, the total excess energy's drift in S3.
// Status: pass if S1 to S5 pass; partial if S1, S4 and S5 pass; fail otherwise.
//
// Depth L2: Kogut-Susskind lattice QED in the model's column registers and Wick's theorem; the quantum light is
// the model's rule, the atom a STAND-IN.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { exactBasis, exactEqual, exactFrom, inverseSteps, reduce, runExact, type Exact } from '@/code/rule/lattice-qed'
import {
  classicalVelocity,
  columnSum,
  fullLadder,
  inverseDepthSpec,
  ladderBeat,
  ladderKernel,
  ladderSize,
  ladderSteps,
  splitOf,
  thermometer,
} from '@/code/rule/plaquette-ladder'
import {
  classicalBeat,
  classicalSquareEnergies,
  harmonicTwoPoint,
  ladderVacuum,
  loopTimes,
  normalize,
  oneQuantumBand,
  squareElectricTable,
  squareEnergies,
} from '@/code/measure/quantum-ladder'
import { weyl } from '@/code/tool/weyl'

const BAND_BOXES: readonly [number, number][] = [
  [9, 2],
  [13, 2],
  [17, 2],
  [21, 2],
  [25, 2],
  [9, 3],
  [11, 3],
  [13, 3],
]
const CONTROL_BOXES: readonly [number, number][] = [
  [9, 2],
  [13, 2],
]
const TRAVEL = { n: 11, plaquettes: 6, beats: 20 }
const GAUSS_NS = [3, 5]
const EXACT_BEATS = 4
const REVERSE_BEATS = 8

// sector starts: three basis states and a superposition of them, by golden Weyl picks (deterministic)
function startsOf(size: number, m: number): Exact[] {
  const picks: number[] = []

  for (let k = 1; picks.length < 3; k++) {
    const i = Math.floor(weyl(k) * size)

    if (!picks.includes(i)) picks.push(i)
  }

  return [...picks.map(i => exactBasis(m, i)), exactFrom(m, picks.map((i, j) => [i, BigInt(j + 1)]))]
}

// the sector result mapped into full-space indices
function embedExact(v: Exact, embed: (i: number) => number): Exact {
  return { m: v.m, den: v.den, entries: new Map([...v.entries].map(([i, e]) => [embed(i), e])) }
}

export default experiment({
  id: 'gauge/ladder-single-quantum',
  code: 'E-FRC-0231',
  title:
    "a single quantum of light that travels: on the plaquette ladder with every flux a column of trits, the one-quantum band sits on the classical E~ light's symbol omega(k) to a precision that grows with the column, a quantum made by one square's loop spreads its energy as its classical image does, Gauss's law holds factor by factor with a charge on the full register space, and the rule runs back exactly",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}

    // S1: the band
    let s1 = true
    const velocities: string[] = []

    for (const [n, L] of BAND_BOXES) {
      const spec = inverseDepthSpec(n, L, 'drift')
      const { band, residual } = oneQuantumBand(spec)
      let worst = 0
      let overlap = 1

      for (const b of band) {
        worst = Math.max(worst, Math.abs(b.omega - b.classical) / b.classical)
        overlap = Math.min(overlap, b.overlap)
      }

      metrics[`bandErrorN${n}L${L}`] = worst
      metrics[`bandOverlapN${n}L${L}`] = overlap
      metrics[`eigenResidualN${n}L${L}`] = residual

      if (n >= 13) s1 &&= worst <= 1e-3
      if (n >= 21) s1 &&= worst <= 1e-4
      if (n >= 17 && L === 2) s1 &&= overlap >= 0.99

      if (L === 3) {
        const { kappa } = splitOf(spec)
        const slope = (band[1]!.omega - band[0]!.omega) / band[1]!.k
        const classicalSlope = (band[1]!.classical - band[0]!.classical) / band[1]!.k

        metrics[`bandSlopeN${n}`] = slope
        metrics[`classicalSlopeN${n}`] = classicalSlope
        velocities.push(`${slope.toFixed(5)} against ${classicalSlope.toFixed(5)} at N = ${n} (v_g peak ${classicalVelocity(kappa, Math.PI / 2, 3).toFixed(4)})`)
      }
    }

    // S2: the classical split
    let s2 = true

    for (const [n, L] of CONTROL_BOXES) {
      const { band } = oneQuantumBand(inverseDepthSpec(n, L, 'force'))
      let worst = 0

      for (const b of band) worst = Math.max(worst, Math.abs(b.omega - b.classical) / b.classical)

      metrics[`controlBandErrorN${n}L${L}`] = worst
      s2 &&= worst > 10 * metrics[`bandErrorN${n}L${L}`]!
    }

    // S3: a quantum that travels
    const travelSpec = inverseDepthSpec(TRAVEL.n, TRAVEL.plaquettes, 'drift')
    const kernel = ladderKernel(travelSpec)
    const vac = ladderVacuum(kernel)
    const table = squareElectricTable(travelSpec)
    const e0 = squareEnergies(kernel, table, vac.vacuum)
    const psi = loopTimes(travelSpec, 0, vac.vacuum)
    const quantumNorm = normalize(psi) ** 2
    const W = harmonicTwoPoint(travelSpec)
    const L6 = TRAVEL.plaquettes
    const unit = { re: new Float64Array(L6), im: new Float64Array(L6) }

    unit.re[0] = 1

    const z = W({ re: new Float64Array(L6), im: new Float64Array(L6) }, unit)
    const classicalNorm = z.m.re[0]!
    const antipode = L6 / 2
    let worstDifference = 0
    let peak = 0
    let arrivalQuantum = 0
    let arrivalClassical = 0
    let bestQuantum = -1
    let bestClassical = -1
    const totals: number[] = []

    for (let t = 0; t <= TRAVEL.beats; t++) {
      const eq = squareEnergies(kernel, table, psi)
      const ec = classicalSquareEnergies(travelSpec, z.B, z.m)
      let total = 0

      for (let p = 0; p < L6; p++) {
        const xq = eq[p]! - e0[p]!
        const xc = (2 * ec[p]!) / classicalNorm

        total += xq
        worstDifference = Math.max(worstDifference, Math.abs(xq - xc))
        peak = Math.max(peak, xc)

        if (p === antipode && xq > bestQuantum) {
          bestQuantum = xq
          arrivalQuantum = t
        }

        if (p === antipode && xc > bestClassical) {
          bestClassical = xc
          arrivalClassical = t
        }
      }

      totals.push(total)
      ladderBeat(kernel, psi.re, psi.im)
      classicalBeat(travelSpec, z.B, z.m)
    }

    metrics.travelVacuumResidual = vac.residual
    metrics.travelQuantumNorm = quantumNorm
    metrics.travelHarmonicNorm = classicalNorm
    metrics.travelArrivalQuantum = arrivalQuantum
    metrics.travelArrivalClassical = arrivalClassical
    metrics.travelPeakQuantum = bestQuantum
    metrics.travelPeakClassical = bestClassical
    metrics.travelWorstDifference = worstDifference
    metrics.travelPeak = peak
    metrics.travelExcessStart = totals[0]!
    metrics.travelExcessEnd = totals[totals.length - 1]!

    const s3 = Math.abs(arrivalQuantum - arrivalClassical) <= 1 && worstDifference <= 0.05 * peak

    // S4: Gauss on the full register space, with the STAND-IN charge
    let s4 = true

    for (const n of GAUSS_NS) {
      const spec = inverseDepthSpec(n, 2, 'drift', 1)
      const full = fullLadder(spec)
      let violations = 0
      let controlBroken = 0

      for (let i = 0; i < full.size; i++) {
        const g = full.gauss(i).join(',')

        if (full.gauss(full.hopMove(true)(i)).join(',') !== g) violations++

        for (let p = 0; p < 2; p++) if (full.gauss(full.loopShift(p)(i)).join(',') !== g) violations++

        if (full.gauss(full.hopMove(false)(i)).join(',') !== g) controlBroken++
      }

      // the sector against the full space, exact
      const sectorSteps = ladderSteps(spec)
      const fullSteps = full.steps(true)
      let mismatches = 0
      let sectorGauss = 0

      for (let s = 0; s < ladderSize(spec); s++) if (full.gauss(full.embed(s)).some(v => v !== 0)) sectorGauss++

      for (const start of startsOf(ladderSize(spec), spec.root)) {
        let a = start
        let b = embedExact(start, full.embed)

        for (let t = 0; t < EXACT_BEATS; t++) {
          a = runExact(sectorSteps, a)
          b = runExact(fullSteps, b)

          if (!exactEqual(embedExact(a, full.embed), b)) mismatches++
        }
      }

      metrics[`gaussViolationsN${n}`] = violations
      metrics[`gaussStatesN${n}`] = full.size
      metrics[`unrecordedBrokenN${n}`] = controlBroken
      metrics[`sectorGaussOffN${n}`] = sectorGauss
      metrics[`sectorFullMismatchesN${n}`] = mismatches
      s4 &&= violations === 0 && controlBroken === full.size && sectorGauss === 0 && mismatches === 0
    }

    // S5: reversible and exact
    let reverseMismatches = 0

    for (const [n, L] of [
      [3, 2],
      [5, 2],
      [3, 3],
    ] as const) {
      const spec = inverseDepthSpec(n, L, 'drift', 1)
      const steps = ladderSteps(spec)
      const back = inverseSteps(steps)

      for (const start of startsOf(ladderSize(spec), spec.root)) {
        const there = runExact(steps, start, REVERSE_BEATS)
        const again = runExact(back, there, REVERSE_BEATS)

        if (!exactEqual(reduce(again), reduce(start))) reverseMismatches++
      }
    }

    metrics.reverseMismatches = reverseMismatches

    const s5 = reverseMismatches === 0

    // reported: the thermometer lift
    let liftFailures = 0
    let wraps = 0

    for (let D = 1; D <= 16; D++) {
      const seen = new Set<string>()

      for (let v = -D; v <= D; v++) {
        const col = thermometer(v, D)

        if (columnSum(col) !== v) liftFailures++

        seen.add(Array.from(col).join(''))

        const next = v === D ? -D : v + 1
        const nextCol = thermometer(next, D)
        let changed = 0

        for (let d = 0; d < D; d++) if (col[d] !== nextCol[d]) changed++

        if (v === D) wraps += changed === D || D === 0 ? 1 : 0
        else if (changed !== 1) liftFailures++
      }

      if (seen.size !== 2 * D + 1) liftFailures++
    }

    metrics.thermometerFailures = liftFailures
    metrics.thermometerWrapsAllTrits = wraps

    const gates = { S1: s1, S2: s2, S3: s3, S4: s4, S5: s5 }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : s1 && s4 && s5 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `on the plaquette ladder with every flux a column of trits the one-quantum band sits on the classical E~ symbol within ${metrics.bandErrorN13L2!.toExponential(1)}, ${metrics.bandErrorN17L2!.toExponential(1)}, ${metrics.bandErrorN21L2!.toExponential(1)}, ${metrics.bandErrorN25L2!.toExponential(1)} at N = 13, 17, 21, 25 (L = 2) and ${metrics.bandErrorN11L3!.toExponential(1)}, ${metrics.bandErrorN13L3!.toExponential(1)} at N = 11, 13 (L = 3), against ${metrics.controlBandErrorN13L2!.toExponential(1)} for the classical split at N = 13; a quantum made by one square's loop (L = 6, N = 11) reaches the antipode at beat ${arrivalQuantum} as its classical image does at beat ${arrivalClassical}, largest excess difference ${(worstDifference / peak).toFixed(3)} of the peak; Gauss holds factor by factor with a charge on ${metrics.gaussStatesN3} and ${metrics.gaussStatesN5} full register states (${metrics.gaussViolationsN3}, ${metrics.gaussViolationsN5} violations; the unrecorded hop breaks all), the sector rule equals the full-space rule exactly, and ${REVERSE_BEATS} beats run back exactly (${reverseMismatches} mismatches)`,
      metrics,
      control: {
        controlBandErrorN13L2: metrics.controlBandErrorN13L2!,
        unrecordedBrokenN3: metrics.unrecordedBrokenN3!,
      },
      notes: `L2. FIRST ATTEMPT 2026-09-26 crashed before any verdict (the classical-split control box's lowest level was not in the zero-momentum sector, so the band reader found no vacuum there); the reader now takes the vacuum among the translation-invariant states only, no gate changed. FIRST COMPLETE RUN (tmp/frc0231.log, 221 s), PASS on every gate. S1: band error 4.9e-3, 2.6e-4, 1.7e-4, 1.7e-5, 7.1e-6 at N = 9, 13, 17, 21, 25 (L = 2) and 2.0e-3, 2.0e-3, 4.7e-4 at N = 9, 11, 13 (L = 3), overlap with m_k |vac> 0.889, 0.953, 0.995, 0.999, 0.999 (L = 2) and 0.646, 0.922, 0.880 (L = 3): the one-quantum band converges on the classical symbol as the column deepens; eigen residuals at most 2e-10. S2: the classical split misses by 8.24 and 0.375 (N = 9, 13), 1,670 and 1,460 times the balanced miss. S3 (L = 6, N = 11, vacuum filter residual 3.4e-3): the single quantum's peak reaches the antipode at beat 18 in the rule and in its classical image (0.609 against 0.597), largest per-square difference 0.018 (0.023 of the peak); the quantum's total excess energy drifts from 0.906 to 1.002 over 20 beats while the classical image holds 0.904 (a probe at N = 9 drifted 1.04 to 1.46, so the drift is the column's finite size and falls with depth). S4: 0 Gauss violations on 1,458 and 31,250 full register states with the charge, the unrecorded hop breaks all of them, the loop sector is Gauss-exact and equals the full-space rule exactly over 4 beats from 4 starts per N. S5: 8 beats forward and back return all 12 starts exactly. Thermometer lift: 0 failures for D = 1 .. 16, every unit step changes one trit except the wrap D -> -D, which changes all D. Probes before this file (tmp/qlad-probe2 to 7, disclosed): the band trend and the S3 agreement at N = 9 and 11 were seen before the gates were written, S3's 0.05 set after the N = 11 probe read 0.023. Group velocity between sectors (L = 3): ${velocities.join('; ')}.`,
    })
  },
})
