// The Born rule on lines, and with a record: is an outcome a line of the grid, and does a SUM record turn
// the chance into a count?
//
// E-QTM-0113: the chance of a reading is the SIGNED count, loves minus fears, and no non-negative count of
// the model's deterministic starts equals it. Two ways out are put to the model here.
//
// LINES. For the discrete Wigner function of odd dimension (Wootters 1987, Gibbons, Hoffman and Wootters
// 2004, Gross 2006), the weight summed along any line of the 3 x 3 grid is the probability of one outcome of
// one measurement: the line's stabilizer state, one of the 12, in 4 parallel classes that are the 4 mutually
// unbiased bases. For two tokens the lines become the 360 cosets of the 40 isotropic planes of Z3^4 (the
// two-role stabilizer states), 144 of them products of lines. A single point is not an outcome and can be
// negative (a fear). The hypothesis: the Born rule is the line sum of the signed weight, and an outcome is a
// line. Note that a knot of three loves is a line (E-FRC-0118).
//
// A RECORD. After a SUM record of token A (E-QTM-0127), the record's own weight is A's role distribution
// spread evenly over each role line, P(a) / 3 at every point: it holds no fear wherever A's role line sums
// are non-negative, so its love share IS the chance. Whether the model's deterministic starts count it is
// asked as E-QTM-0113 asked: hidden grid points for A and B on the 9 support points of the start and for
// the record on the 3 points of role line 0 (27 starts) move with the links and with SUM (a permutation), and
// by nothing at a fear-beat meeting, so Liouville predicts the record counts the fear-off chance.
//
// A RECORD AND A KNOT. Conditioned on a record's reading, which object remains? Predicted (a Clifford
// measurement): both A and the record sit evenly on one line, A on the read class's line with that label and
// the record on the role line of that label. A line with weight 1 on each point is the one-token image of a
// knot of three loves. The knots of three loves are counted: 3-multisets of points with vector sum 0 mod 3.
//
// States: token A and B of the six Bell histories (code/measure/knot-histories), every beat of 480, read in
// the physical convention.
//
// Gates, fixed before the first run. Instrument gates must pass for the rest to mean anything:
//   I1 the Born identity: every one-token line sum and every product-line sum equals Tr(rho P), P the
//      eigenprojector of a displacement (code/measure/sum-record lineProjectors, built without the phase
//      points), to 1e-9, on every state (an identity for any weight, stated as one).
//   I2 Liouville through SUM: the record's hidden count over the 27 starts equals the fear-off chance of A's
//      role at every beat of every history, exactly.
//   I3 the knot count: 21 three-love knots (sum 0 mod 3), the 12 lines, each a state (purity 1), and the 9
//      triple points, none a state.
// Hypothesis gates:
//   H1 lines are probabilities: every one-token line sum (A and B) and every two-token isotropic coset sum
//      is in [0, units] on every state of every history.
//   H2 other sets are not: some reached state has a negative sum on a non-collinear triple and some on a
//      coset of a non-isotropic plane.
//   H3 the record is a count: after SUM, the record's reduced weight has no fear and its love share on each
//      role equals A's role chance, on every state.
//   H4 the record counts the chance: the record's hidden count over the 27 starts equals A's signed role
//      chance at every beat of every history.
//   H5 an outcome is a knot: for each of the 4 class readers and each reading with nonzero weight, A's
//      conditional weight is even on the class line with that label and zero elsewhere, and the record's is
//      even on the role line of that label, on every state.
// Predicted before the run: I1 to I3 pass; H2 and H5 pass; H4 fails (the record copies the hidden role, which
// never saw the fear beat); H1 and H3 pass on the swap-law history and FAIL on color-law histories wherever
// E-QTM-0121's non-states (a one-role marginal point below -1/3) put a line sum below 0. Status: pass if every
// gate passes, partial if every instrument gate and at least one hypothesis gate pass, fail otherwise.
//
// FIRST RUN (2026-09-26, 19.9 s): the instrument gate I2 FAILED on 639 beats, from two instrument errors.
// The record's hidden count was a malformed expression (rewritten before the second run, with per-history
// readings added), and the second run still failed I2 from the first beat: the hidden point was moved by
// the grid table on the phase index, while the shared rule, changed during this session by E-QTM-0124, now
// moves a whole's phase index 3 a + b by the grid table through GRID_OF_PHASE (the transpose fix). The
// hidden point now moves by phaseMove(act), the rule's own conversion, and the physical reading reads the
// whole's per-coordinate frames (E-QTM-0123) through sum-record's physicalFrame. No gate was changed.
// THIRD RUN (3.0 s): I1 to I3 pass, H1, H2, H3, H5 pass, H4 fails as predicted, status partial.
//   - PREDICTION WRONG on H1 and H3: no line sum and no isotropic coset sum is outside [0, 1] on any
//     history, color law included. The prediction leaned on E-QTM-0121's 299 non-states, which E-QTM-0123
//     removed from the shared rule before this run (frames), so the color-law states are states now.
//   - I1: the worst gap between a line sum and Tr(rho P) is 2.2e-15 over 2,880 states (12 one-token lines
//     and 144 product lines each). 0 of 69,120 line checks and 0 of 1,036,800 isotropic coset checks fall
//     outside [0, 1]; 6,287 non-collinear triple checks and 200,372 non-isotropic coset checks are negative.
//   - H3: the record holds no fear on any of 2,880 states and its love share is A's role chance on all.
//   - I2 and H4: the record's hidden count equals the fear-off chance on every beat (Liouville through SUM)
//     and misses the signed chance on 2,121 of 2,880 beats (474, 328, 266, 266, 310, 477 by history).
//   - I3 and H5: 21 knots, 12 lines (all states), 9 triple points (none); 0 conditional mismatches.
//
// WHAT THIS SAYS. The Born rule of the fear weave is the line sum of the signed weight: each of the 4 line
// classes is one of the 4 mutually unbiased role bases, each line one outcome, and its sum is never
// negative, where single points (fears) are. A record makes the outcome's chance a non-negative weight on the
// record, so the record's own loves count it. It does not make the chance a count of the model's
// deterministic starts: the starts ride only the links and the SUM (both Cliffords), never the fear beat, so
// they count the fear-off chance, as E-QTM-0113 found without a record. A record and a knot are not the same
// object. A knot of three loves is one token's line (weight 1 on each point); a record outcome is that line
// held by two tokens at once, the token read and the record, and the unconditioned record is the mixture of
// the class's three knots weighted by the line sums.
//
// Depth L1 for I1 and the knot count (known mathematics), L2 for the rest (the model's own reached states
// read against it). The husk is not read: every number is a role-grid number.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fearKernels, meetingKernel, phaseMove, swapPhase, type Whole } from '@/code/rule/fear-weave'
import { advanceKnot, bellHistories, lineKnot, type KnotHistory } from '@/code/measure/knot-histories'
import { operatorFromWigner } from '@/code/measure/qutrit-clifford'
import { phasePointOperators, tensorOperators, type Operator } from '@/code/measure/grid-weights'
import {
  LINE_CLASSES,
  cosetsOf,
  jointPlanes,
  lineProjectors,
  marginalOne,
  openToken,
  permuteTwo,
  physicalFrame,
  pointVector,
  readerPermutation,
  sumPermutation,
  traceProduct,
} from '@/code/measure/sum-record'

const BEATS = 480
const ROLE_LINE_0 = [0, 1, 2]
const IDENTITY_TOLERANCE = 1e-9

const roleOf = (p: number): number => Math.floor(p / 3)
const roleShares = (m: readonly bigint[]): bigint[] => [0, 1, 2].map(a => (m[3 * a] ?? 0n) + (m[3 * a + 1] ?? 0n) + (m[3 * a + 2] ?? 0n))
const unitsOf = (w: Whole): bigint => w.weight.reduce((s, x) => s + x, 0n)

// a history's knot with the fear beat off (E-QTM-0113's fearOff): the same record, identity kernels
function fearOff(h: KnotHistory): KnotHistory {
  const OFF = Math.PI

  return h.kernels.mode === 'swap'
    ? { ...h, kernels: { mode: 'swap', kernel4: meetingKernel(swapPhase(OFF)) ?? [] } }
    : {
        ...h,
        kernels: {
          mode: 'color',
          color: h.name === 'qtm0100-color' ? fearKernels({ like: OFF, unlike: 0 })! : fearKernels({ like: 0, unlike: 0, likeExchanged: false })!,
        },
      }
}

export default experiment({
  id: 'quantum/born-rule-on-lines',
  code: 'E-QTM-0130',
  title:
    'the Born rule on lines: on every state six Bell histories reach, every line sum and every two-role stabilizer coset sum is a probability, the chance of one outcome of one Pauli measurement, while non-lines go negative; a SUM record\'s weight holds no fear, so its love share is the chance, but the model\'s deterministic starts still count only the fear-off chance; each record outcome leaves token and record on one line, the one-token image of a knot of three loves',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const sum = sumPermutation()
    const allLines = LINE_CLASSES.flatMap(c => c.lines)
    const lineKey = new Set(allLines.map(l => l.join(',')))
    const nonLines: number[][] = []

    for (let a = 0; a < 9; a++) {
      for (let b = a + 1; b < 9; b++) {
        for (let c = b + 1; c < 9; c++) {
          if (!lineKey.has([a, b, c].join(','))) {
            nonLines.push([a, b, c])
          }
        }
      }
    }

    // I3: the three-love knots
    let knots = 0
    let knotLines = 0
    let knotStates = 0
    let knotPoints = 0

    for (let a = 0; a < 9; a++) {
      for (let b = a; b < 9; b++) {
        for (let c = b; c < 9; c++) {
          const [va, vb, vc] = [a, b, c].map(pointVector) as [[number, number], [number, number], [number, number]]

          if ((va[0] + vb[0] + vc[0]) % 3 !== 0 || (va[1] + vb[1] + vc[1]) % 3 !== 0) {
            continue
          }

          knots++

          // purity of the normalized weight, 3 sum W^2
          const w = new Array<number>(9).fill(0)

          for (const p of [a, b, c]) {
            w[p] = (w[p] ?? 0) + 1 / 3
          }

          const purity = 3 * w.reduce((s, x) => s + x * x, 0)

          knotStates += purity <= 1 + 1e-12 ? 1 : 0
          knotLines += lineKey.has([a, b, c].join(',')) ? 1 : 0
          knotPoints += a === b && b === c ? 1 : 0
        }
      }
    }

    // the operator reading of every line: the displacement eigenprojector each line's state equals
    const one = phasePointOperators(1)
    const two = phasePointOperators(2)
    const projectorOf = new Map<string, Operator>()

    for (const c of LINE_CLASSES) {
      const projectors = lineProjectors(c.direction)

      for (const line of c.lines) {
        const match = projectors.find(p => Math.abs(line.reduce((s, q) => s + traceProduct(p, one[q]!) / 3, 0) - 1) < IDENTITY_TOLERANCE)

        if (match) {
          projectorOf.set(line.join(','), match)
        }
      }
    }

    const productProjectors = allLines.flatMap(la => allLines.map(lb => ({ la, lb, p: tensorOperators(projectorOf.get(la.join(','))!, projectorOf.get(lb.join(','))!) })))
    const planes = jointPlanes()
    const isotropicCosets = planes.isotropic.flatMap(p => cosetsOf(p.points))
    const otherCosets = planes.other.flatMap(p => cosetsOf(p))
    const readers = LINE_CLASSES.map(c => ({ c, ...readerPermutation(c.direction) }))

    const per: Record<string, number> = {}
    let identityWorst = 0
    let states = 0
    let lineNegative = 0
    let lineAbove = 0
    let cosetNegative = 0
    let nonLineNegative = 0
    let otherCosetNegative = 0
    let recordFears = 0
    let recordShareBad = 0
    let liouvilleBad = 0
    let countMisses = 0
    let knotBad = 0
    let swapLawLineNegative = 0

    for (const h of bellHistories(BEATS)) {
      const off = fearOff(h)
      const supportA = [0, 1, 2].map(k => 3 * (h.start[0] ?? 0) + k)
      const supportB = [0, 1, 2].map(k => 3 * (h.start[1] ?? 0) + k)
      let w: Whole = lineKnot(h.tokens, supportA, supportB)
      let wOff: Whole = w
      // A's hidden point for each of the 9 support starts (B's never enters A's role or the record)
      let hiddenA = supportA.flatMap(a => supportB.map(() => a))
      const coordinateA = h.tokens[0]
      let historyLineNegative = 0
      let historyLiouville = 0
      let historyCount = 0
      let firstLiouville = -1
      const startState = states

      for (const record of h.records) {
        w = advanceKnot(h, w, record)
        wOff = advanceKnot(off, wOff, record)

        for (const [tk, g] of record.crossings) {
          if (tk === coordinateA) {
            // a grid move is a table on the grid index a + 3 b; the whole and the hidden point are written on
            // the phase index 3 a + b (fear-weave's phaseMove, E-QTM-0124)
            const act = phaseMove(h.weave.moves.act[g] ?? [])

            hiddenA = hiddenA.map(p => act[p] ?? p)
          }
        }

        const state = physicalFrame(w, h.conjugated)
        const units = unitsOf(state)
        const mA = marginalOne(state, 0)
        const mB = marginalOne(state, 1)

        states++

        // H1 and H2 on one token
        for (const m of [mA, mB]) {
          for (const line of allLines) {
            const s = line.reduce((t, p) => t + (m[p] ?? 0n), 0n)

            lineNegative += s < 0n ? 1 : 0
            lineAbove += s > units ? 1 : 0
            historyLineNegative += s < 0n ? 1 : 0
          }

          for (const t of nonLines) {
            nonLineNegative += t.reduce((u, p) => u + (m[p] ?? 0n), 0n) < 0n ? 1 : 0
          }
        }

        for (const coset of isotropicCosets) {
          const s = coset.reduce((t, j) => t + (state.weight[j] ?? 0n), 0n)

          cosetNegative += s < 0n || s > units ? 1 : 0
        }

        for (const coset of otherCosets) {
          otherCosetNegative += coset.reduce((t, j) => t + (state.weight[j] ?? 0n), 0n) < 0n ? 1 : 0
        }

        // I1: the Born identity in floating point
        const u = Number(units)
        const rhoA = operatorFromWigner(mA.map(x => Number(x) / u), one)
        const rho = operatorFromWigner(state.weight.map(x => Number(x) / u), two)

        for (const line of allLines) {
          const s = line.reduce((t, p) => t + Number(mA[p] ?? 0n), 0) / u

          identityWorst = Math.max(identityWorst, Math.abs(s - traceProduct(rhoA, projectorOf.get(line.join(','))!)))
        }

        for (const { la, lb, p } of productProjectors) {
          let s = 0

          for (const x of la) {
            for (const y of lb) {
              s += Number(state.weight[9 * x + y] ?? 0n)
            }
          }

          identityWorst = Math.max(identityWorst, Math.abs(s / u - traceProduct(rho, p)))
        }

        // H3: the record's weight after SUM
        const measured = permuteTwo(openToken(state, -1, ROLE_LINE_0), 0, 2, sum)
        const mR = marginalOne(measured, 2)
        const pA = roleShares(mA)
        const recordLoves = mR.reduce((t, x) => (x > 0n ? t + x : t), 0n)
        const recordRoleLoves = roleShares(mR.map(x => (x > 0n ? x : 0n)))

        recordFears += mR.some(x => x < 0n) ? 1 : 0
        recordShareBad += recordRoleLoves.every((x, a) => x * units === (pA[a] ?? 0n) * recordLoves) ? 0 : 1

        // I2 and H4: the record's hidden count, 27 starts (each A start with 3 record points)
        const hiddenCount = [0n, 0n, 0n]

        for (const p of hiddenA) {
          for (const q of ROLE_LINE_0) {
            const r = roleOf((sum[9 * p + q] ?? 0) % 9)

            hiddenCount[r] = (hiddenCount[r] ?? 0n) + 1n
          }
        }
        const offA = roleShares(marginalOne(physicalFrame(wOff, off.conjugated), 0))
        const unitsOff = offA.reduce((t, x) => t + x, 0n)

        const liouvilleMiss = hiddenCount.every((x, r) => x * unitsOff === (offA[r] ?? 0n) * 27n) ? 0 : 1
        const countMiss = hiddenCount.every((x, r) => x * units === (pA[r] ?? 0n) * 27n) ? 0 : 1

        liouvilleBad += liouvilleMiss
        countMisses += countMiss
        historyLiouville += liouvilleMiss
        historyCount += countMiss
        firstLiouville = liouvilleMiss && firstLiouville < 0 ? states : firstLiouville

        // H5: conditioned on each reading of each class reader
        const alone: Whole = { tokens: [0], weight: mA }

        for (const r of readers) {
          const read = permuteTwo(openToken(alone, -1, ROLE_LINE_0), 0, 1, r.perm)

          for (let k = 0; k < 3; k++) {
            // the joint weight restricted to record role k
            const a = new Array<bigint>(9).fill(0n)
            const rec = new Array<bigint>(9).fill(0n)

            read.weight.forEach((x, i) => {
              if (roleOf(i % 9) === k) {
                a[Math.floor(i / 9)] = (a[Math.floor(i / 9)] ?? 0n) + x
                rec[i % 9] = (rec[i % 9] ?? 0n) + x
              }
            })

            const total = a.reduce((t, x) => t + x, 0n)

            if (total === 0n) {
              continue
            }

            const aEven = a.every((x, p) => (r.label[p] === k ? 3n * x === total : x === 0n))
            const recEven = rec.every((x, p) => (roleOf(p) === k ? 3n * x === total : x === 0n))

            knotBad += aEven && recEven ? 0 : 1
          }
        }
      }

      per[`${h.name}_lineSumsBelowZero`] = historyLineNegative
      per[`${h.name}_liouvilleMismatchBeats`] = historyLiouville
      per[`${h.name}_firstLiouvilleMismatchBeat`] = firstLiouville < 0 ? -1 : firstLiouville - startState
      per[`${h.name}_recordCountMissBeats`] = historyCount
      swapLawLineNegative += h.kernels.mode === 'swap' ? historyLineNegative : 0
    }

    const gates = {
      I1: identityWorst < IDENTITY_TOLERANCE && projectorOf.size === 12,
      I2: liouvilleBad === 0,
      I3: knots === 21 && knotLines === 12 && knotPoints === 9 && knotStates === 12,
      H1: lineNegative === 0 && lineAbove === 0 && cosetNegative === 0,
      H2: nonLineNegative > 0 && otherCosetNegative > 0,
      H3: recordFears === 0 && recordShareBad === 0,
      H4: countMisses === 0,
      H5: knotBad === 0,
    }
    const instruments = gates.I1 && gates.I2 && gates.I3
    const hypotheses = [gates.H1, gates.H2, gates.H3, gates.H4, gates.H5]
    const status = instruments && hypotheses.every(Boolean) ? 'pass' : instruments && hypotheses.some(Boolean) ? 'partial' : 'fail'

    return verdict({
      status,
      claim:
        'partial, as the gates read: on 2,880 states of six Bell histories every one-token line sum (69,120 checks) and every two-token isotropic coset sum (1,036,800) lies in [0, 1], and each equals Tr(rho P) for a displacement eigenprojector to 2.2e-15, while 6,287 non-collinear triple sums and 200,372 non-isotropic coset sums are negative: an outcome is a line. After a SUM record the record\'s weight holds no fear on any state and its love share is the role chance exactly, so a record makes the chance a non-negative weight; but the 27 deterministic starts count the fear-off chance exactly (Liouville through SUM) and miss the signed chance on 2,121 of 2,880 beats: no record turns the Born rule into a count of equal starts. The 21 three-love knots are the 12 lines and 9 triple points, only the lines are states, and every record outcome of every class leaves token and record evenly on one line: a record outcome is a knot, a record is two tokens sharing one',
      metrics: {
        states,
        isotropicPlanes: planes.isotropic.length,
        productPlanes: planes.isotropic.filter(p => p.product).length,
        nonIsotropicPlanes: planes.other.length,
        identityWorst,
        knots,
        knotLines,
        knotPoints,
        knotStates,
        lineSumChecksBelowZero: lineNegative,
        lineSumChecksAboveOne: lineAbove,
        swapLawLineSumsBelowZero: swapLawLineNegative,
        isotropicCosetChecksOutside: cosetNegative,
        nonLineTripleChecksBelowZero: nonLineNegative,
        nonIsotropicCosetChecksBelowZero: otherCosetNegative,
        recordStatesWithFear: recordFears,
        recordShareMismatch: recordShareBad,
        liouvilleMismatchBeats: liouvilleBad,
        recordCountMissBeats: countMisses,
        knotConditionalMismatch: knotBad,
        ...per,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        "RERUN 2026-09-26 under the adopted comoving fear beat: status partial as before; non-line triple checks below zero 6,287 -> 5,621, non-isotropic coset checks below zero 200,372 -> 202,685. " + ('L1/L2, exact BigInt wholes; the Born identity I1 in floating point to 1e-9. The hidden starts are E-QTM-0113\'s: A\'s classical point, moved by the links and never by a meeting kernel; the SUM moves the record\'s hidden point by the same permutation the weights ride. The fear-off histories are E-QTM-0113\'s fearOff, rebuilt here.'),
    })
  },
})
