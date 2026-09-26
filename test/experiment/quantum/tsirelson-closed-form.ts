// The exact largest CHSH value of every knot the Bell histories reach, as a closed form in its Schmidt
// weights, replacing E-QTM-0112's G3 (the pairing form was called only a lower bound there).
//
// THE THEOREM, derived before this file was written. For a pure two-qutrit state with Schmidt weights
// p1 >= p2 >= p3 and two-outcome observables on each side,
//   CHSH_max = 2 sqrt((p1 + p2)^2 + 4 p1 p2) + 2 p3.
// Proof. Two involutions on C^3 split it (Jordan) into a plane S where they are two reflections and a line E
// where they are signs; Bob's split C^3 into T and F. The Bell operator is block diagonal on S x T, S x F,
// E x T and E x F. On S x T it is a qubit CHSH operator, so its value on the block's piece of psi is at most
// Horodecki's 2 sqrt((a + b)^2 + 4 a b), a and b the squared singular values of that piece; on each other
// block it is a sign times at most 2, so those give at most 2 (1 - a - b). The sum grows in a and in b (its
// derivative in a is 2 ((a + 3 b) / sqrt(a^2 + 6 a b + b^2) - 1) >= 0), and the singular values of a
// compression sit below the whole's, a <= p1, b <= p2. So CHSH <= the form, and the Schmidt-aligned blocks
// reach it. Also: the form is at most 2 + (2 sqrt 2 - 2)(p1 + p2), so it equals 2 sqrt 2 exactly at
// (1/2, 1/2, 0) and nowhere else.
//
// WHAT THIS PREDICTS FOR E-QTM-0112. Its G3 found a see-saw 0.09 above the form on later knots. If the knots
// are pure, that cannot be: the see-saw it used must be reading something that is not a CHSH value. A probe
// before this file (tmp/hidden-sign-probe.ts) found why: code/measure/role-bell's signOf takes the sign of a
// complex Hermitian 3 x 3 through the real 6 x 6 embedding and reads the complex matrix off its blocks, and
// where an eigenvalue is 0 (twice in the embedding) the two copies can take opposite signs, so the result is
// neither Hermitian nor an involution (|S^2 - 1| = 0.94 on a rank-one complex projector). The reduced
// operators of the knots are often rank-deficient and complex, which is where the excess comes from.
// code/measure/pure-chsh diagonalizes the same embedding but pairs the doubled eigenvalues by a complex
// Gram-Schmidt, so its sign is an involution; this experiment checks that on every observable it returns.
//
// Gates, fixed before the first run:
//   G1 the knots are pure: E-QTM-0112's 1,222 states (every meeting beat of the six histories over 480
//      beats from each experiment's own start, and all 144 line-product starts at each reading beat), each
//      with |Tr rho^2 - 1| <= 1e-9.
//   G2 the bound holds: the pure-chsh see-saw (8 Weyl starts) is at most the form + 1e-9 on every state,
//      and every observable it ends on satisfies |A^2 - 1| <= 1e-9.
//   G3 the second method (E-QTM-0112's G3, corrected): the see-saw equals the form within 1e-6 on every
//      state.
//   G4 the simplex: on the Schmidt grid p = (i, j, k) / 30, i >= j >= k, the see-saw equals the form within
//      1e-6 and never exceeds it, and the form reaches 2 sqrt 2 (within 1e-12) only at (15, 15, 0) / 30.
//   G5 control, the gate can fail: the mixed state (|00><00| + |11><11|) / 2 has first-role spectrum
//      (1/2, 1/2, 0), where the form says 2 sqrt 2, and the see-saw reads 2 (within 1e-9): the form is a
//      statement about pure states, which G1 establishes.
// Reported, not gated: role-bell's roleChsh on the same states against the form (how many it exceeds by more
// than 1e-6, and by how much), the E-QTM-0112 readings.
//
// FIRST RUN (2026-09-26, 288 s, 8 starts and 400 steps per see-saw): status fail on G3 and G4. G1, G2, G5
// passed: all 1,222 knots pure (worst 4e-15), the see-saw never above the form (worst 6e-15), every
// observable an involution (9e-16), the form 2 sqrt 2 at (15, 15, 0) / 30 only, and the mixed control 2
// against the form's 2 sqrt 2. G3 and G4 failed on agreement: the see-saw stopped up to 6.5e-5 BELOW the
// form on the knots and 1.0e-5 below on the simplex, a see-saw that had not converged (it only ever
// climbs), not a state above the maximum. roleChsh read above the maximum on 542 of the 1,222 states, by up
// to 0.064.
// SECOND RUN, disclosed changes: the see-saw gets 16 starts and up to 3,000 steps (the instrument, not the
// gates), and a gate G6 is ADDED after the first run: the explicit Schmidt-aligned observables
// (code/measure/pure-chsh alignedChsh), evaluated as Tr[B rho] on each knot's own density and on each
// simplex state, give the form within 1e-9. G6 is the exact second method the see-saw only approximates.
// G1 to G5 keep their thresholds.
// SECOND RUN (2026-09-26, 217 s): G1, G2, G4, G5, G6 pass, G3 fails, status fail on G3 alone. The see-saw
// now ends at most 1.7e-6 below the form on the knots (2.1e-8 on the simplex, so G4 passes), still never
// above it (6e-15), and the explicit Schmidt-aligned observables read the form on every knot's own density
// to 6.2e-12 and on the simplex to 1.3e-15. So the form is attained exactly (G6) and never exceeded (G2 and
// the theorem); G3 fails on the see-saw's convergence at a threshold it was not given the steps to meet.
// The largest exact CHSH over the 1,222 knots is 2.7487, 0.0797 below 2 sqrt 2; E-QTM-0112's 2.789 was
// roleChsh, which reads above the maximum on 542 states, by up to 0.064.
//
// Depth L2: a closed form proven and checked on the knit's own histories. Substrate-independent: every
// number is on the role grid.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { advanceKnot, bellHistories, lineKnot, physicalKnot } from '@/code/measure/knot-histories'
import { gridLines, hermitianValues, reducedFirst } from '@/code/measure/bell-gates'
import { roleChsh, roleDensity } from '@/code/measure/role-bell'
import { alignedChsh, densitySeeSaw, pureChshExact, pureSeeSaw, sign3, type Complex3 } from '@/code/measure/pure-chsh'
import { topEigenvector } from '@/code/measure/qutrit-clifford'
import type { Operator } from '@/code/measure/grid-weights'
import type { Whole } from '@/code/rule/fear-weave'

const BEATS = 480
const STARTS = 16
const STEPS = 3000
const TSIRELSON = 2 * Math.SQRT2
const GRID = 30

// |A^2 - 1| for a sign returned by the see-saw (checked on the operators the see-saw builds)
function involutionDefect(a: Complex3): number {
  let worst = 0

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < 3; k++) {
        re += (a.re[3 * i + k] ?? 0) * (a.re[3 * k + j] ?? 0) - (a.im[3 * i + k] ?? 0) * (a.im[3 * k + j] ?? 0)
        im += (a.re[3 * i + k] ?? 0) * (a.im[3 * k + j] ?? 0) + (a.im[3 * i + k] ?? 0) * (a.re[3 * k + j] ?? 0)
      }

      worst = Math.max(worst, Math.abs(re - (i === j ? 1 : 0)), Math.abs(im))
    }
  }

  return worst
}

type Reading = { purity: number; exact: number; seesaw: number; role: number; aligned: number; schmidt: number[] }

function read(w: Whole): Reading {
  const rho = roleDensity(w)
  let purity = 0

  for (let i = 0; i < 81; i++) {
    purity += (rho.re[i] ?? 0) ** 2 + (rho.im[i] ?? 0) ** 2
  }

  const schmidt = hermitianValues(reducedFirst(rho)).reverse()

  return {
    purity,
    exact: pureChshExact(schmidt),
    seesaw: densitySeeSaw(rho, STARTS, STEPS),
    role: roleChsh(rho),
    aligned: alignedChsh(rho, topEigenvector(rho)),
    schmidt,
  }
}

// the pure Schmidt state sum sqrt(p_i) |i i> as a density and a vector
function schmidtState(p: readonly number[]): { rho: Operator; top: { re: number[]; im: number[] } } {
  const re = [0, 1, 2].flatMap(i => [0, 1, 2].map(j => (i === j ? Math.sqrt(p[i] ?? 0) : 0)))
  const rho: Operator = { n: 9, re: new Float64Array(81), im: new Float64Array(81) }

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      rho.re[i * 9 + j] = (re[i] ?? 0) * (re[j] ?? 0)
    }
  }

  return { rho, top: { re, im: new Array<number>(9).fill(0) } }
}

export default experiment({
  id: 'quantum/tsirelson-closed-form',
  code: 'E-QTM-0132',
  title:
    'the exact largest CHSH of a pure two-qutrit knot is 2 sqrt((p1 + p2)^2 + 4 p1 p2) + 2 p3 in its Schmidt weights, proven by the Jordan split of each side into a plane and a line, and equal to a sound see-saw on all 1,222 knots of the Bell histories; E-QTM-0112\'s excess over it was the see-saw\'s sign of a degenerate complex operator, not physics',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const histories = bellHistories(BEATS)
    const { lines } = gridLines()
    const readings: Reading[] = []
    const named: Record<string, number> = {}

    for (const h of histories) {
      const first = h.records.findIndex(r => r.meetings.length > 0)
      const reading = first + 1
      let w = lineKnot(
        h.tokens,
        [0, 1, 2].map(k => 3 * (h.start[0] ?? 0) + k),
        [0, 1, 2].map(k => 3 * (h.start[1] ?? 0) + k),
      )

      for (let t = 0; t < BEATS; t++) {
        w = advanceKnot(h, w, h.records[t]!)

        if ((h.records[t]?.meetings.length ?? 0) > 0) {
          const r = read(physicalKnot(h, w))

          readings.push(r)

          if (t === reading) {
            named[`${h.name}_readingExact`] = r.exact
            named[`${h.name}_readingSeeSaw`] = r.seesaw
            named[`${h.name}_readingRoleChsh`] = r.role
          }
        }
      }

      for (const a of lines) {
        for (const b of lines) {
          let x = lineKnot(h.tokens, a, b)

          for (let t = 0; t <= reading; t++) {
            x = advanceKnot(h, x, h.records[t]!)
          }

          readings.push(read(physicalKnot(h, x)))
        }
      }
    }

    const purityWorst = Math.max(...readings.map(r => Math.abs(r.purity - 1)))
    const above = Math.max(...readings.map(r => r.seesaw - r.exact))
    const agreement = Math.max(...readings.map(r => Math.abs(r.seesaw - r.exact)))
    const roleExcess = readings.map(r => r.role - r.exact)
    const roleAbove = roleExcess.filter(x => x > 1e-6).length
    const roleWorst = Math.max(...roleExcess)
    const maxExact = Math.max(...readings.map(r => r.exact))

    // the involution check on the observables of the pure see-saw, over the simplex grid, and G4
    let simplexWorst = 0
    let simplexAbove = Number.NEGATIVE_INFINITY
    let involution = 0
    let atTsirelson: number[][] = []
    let points = 0
    let simplexAligned = 0

    for (let i = 0; i <= GRID; i++) {
      for (let j = 0; j <= i; j++) {
        const k = GRID - i - j

        if (k < 0 || k > j) {
          continue
        }

        const p = [i / GRID, j / GRID, k / GRID]
        const s = pureSeeSaw(p, STARTS, STEPS)
        const exact = pureChshExact(p)
        const st = schmidtState(p)

        simplexAligned = Math.max(simplexAligned, Math.abs(alignedChsh(st.rho, st.top) - exact))
        points++
        simplexWorst = Math.max(simplexWorst, Math.abs(s.value - exact))
        simplexAbove = Math.max(simplexAbove, s.value - exact)
        involution = Math.max(involution, involutionDefect(s.a0), involutionDefect(s.a1), involutionDefect(sign3(s.a0)))

        if (Math.abs(exact - TSIRELSON) <= 1e-12) {
          atTsirelson = [...atTsirelson, [i, j, k]]
        }
      }
    }

    // G5, the control
    const mixed: Operator = { n: 9, re: new Float64Array(81), im: new Float64Array(81) }

    mixed.re[0] = 0.5
    mixed.re[4 * 9 + 4] = 0.5

    const mixedSchmidt = hermitianValues(reducedFirst(mixed)).reverse()
    const mixedForm = pureChshExact(mixedSchmidt)
    const mixedSeeSaw = densitySeeSaw(mixed, STARTS, STEPS)
    const alignedWorst = Math.max(...readings.map(r => Math.abs(r.aligned - r.exact)))

    const gates = {
      G1: readings.length === 1222 && purityWorst <= 1e-9,
      G2: above <= 1e-9 && involution <= 1e-9,
      G3: agreement <= 1e-6,
      G4: simplexWorst <= 1e-6 && simplexAbove <= 1e-9 && atTsirelson.length === 1 && atTsirelson[0]?.join(',') === '15,15,0',
      G5: Math.abs(mixedForm - TSIRELSON) <= 1e-9 && Math.abs(mixedSeeSaw - 2) <= 1e-9,
      G6: alignedWorst <= 1e-9 && simplexAligned <= 1e-9,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'every knot the six Bell histories reach is pure, and its largest CHSH is exactly 2 sqrt((p1 + p2)^2 + 4 p1 p2) + 2 p3 (a theorem: a sound see-saw meets it on all 1,222 knots and on the Schmidt simplex, never above it), which is 2 sqrt 2 only at Schmidt (1/2, 1/2, 0); the see-saw of E-QTM-0100 and 0112 reads above this maximum on knots whose reduced operators are degenerate and complex, because its sign of such an operator is not an involution',
      metrics: {
        states: readings.length,
        purityWorstDefect: purityWorst,
        seeSawAboveFormWorst: above,
        seeSawFormAgreementWorst: agreement,
        maxExactChsh: maxExact,
        tsirelsonGap: TSIRELSON - maxExact,
        simplexPoints: points,
        simplexWorstAgreement: simplexWorst,
        simplexSeeSawAboveForm: simplexAbove,
        involutionDefectWorst: involution,
        alignedObservablesWorstGap: alignedWorst,
        simplexAlignedWorstGap: simplexAligned,
        formAtTsirelsonPoints: atTsirelson.length,
        roleChshAboveMaximumStates: roleAbove,
        roleChshWorstExcess: roleWorst,
        ...named,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      control: {
        mixedSchmidt1: mixedSchmidt[0] ?? -1,
        mixedSchmidt2: mixedSchmidt[1] ?? -1,
        mixedPureForm: mixedForm,
        mixedSeeSaw,
      },
      notes:
        "RERUN 2026-09-26 under the adopted comoving fear beat: status fail -> PASS, G3 now holds; the largest exact CHSH 2.7487 -> 2.8271, the gap to Tsirelson 0.0797 -> 0.0014, the see-saw against the closed form 1.7e-6 -> 1.4e-7. No gate was moved. " + ('L2. Status fail on G3 alone, in the second run: the see-saw (16 starts, 3,000 steps) stops up to 1.7e-6 below the form on the knots, never above it, while the explicit Schmidt-aligned observables attain the form on every knot\'s own density to 6.2e-12 (G6, added after the first run, disclosed in the header with the first run\'s numbers). The theorem is the upper bound, G6 the attainment, so the form is the exact maximum on all 1,222 knots; the largest is 2.7487, 0.080 below 2 sqrt 2. REPORTED FOR THE OWNERS OF code/measure/role-bell (not fixed here): signOf builds the sign of a complex Hermitian 3 x 3 from its real 6 x 6 form and, where an eigenvalue is 0 (twice in the embedding), can give the two real copies opposite signs, returning a matrix that is neither Hermitian nor an involution (|S^2 - 1| = 0.94 on a rank-one complex projector, tmp/hidden-sign-probe.ts); roleChsh then reads above the true maximum on 542 of the 1,222 knots, by up to 0.064. The E-QTM-0100 readings sqrt 7 and 2.5523 are exact at their states and stand. E-QTM-0112\'s 2.789 on later knots and E-FRC-0159 HF\'s 2.369 (Schmidt 0.875, 1/9, 1/72, whose exact maximum is 2.3613) are the instrument, and E-QTM-0112\'s G3 (pairing form = see-saw) fails because of it, not because the form is only a lower bound.'),
    })
  },
})
