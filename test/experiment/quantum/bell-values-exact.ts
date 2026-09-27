// The corrected Bell values in exact form: what algebraic numbers the reading-beat CHSH values of E-QTM-0100's
// two histories are, now that every link acts by the element sigma-links assigns it (E-QTM-0124).
//
// STATUS (2026-09-26, E-MTH-0028): fail at the default integer link start (E-MTH-0027), partial on 2 of 17 starts
// (integer+7 and the retired golden start), fail on 15. G1, G4 and G5 hold on all 17 and G3 fails on all 17 (the
// registered candidate is wrong). G2 asks for the middle rung, and holds on exactly the 8 middle-rung starts. G6 asks
// the transposed-link control for the top rung, and the transposed history is start-sensitive too: top on 8 starts,
// middle on 8, the bottom rung 2 on 1 (integer+4). Partial needs both, which only integer+7 and golden give. The
// failure is the control's fixed prediction on a start-sensitive history, not a value off the ladder: every one of
// the 102 readings (6 histories on 17 starts) is a ladder knot by its exact integers.
//
// E-QTM-0123 reported, after the link convention fix, reading-beat CHSH 2.3094 on the swap history (the vacuum
// pair on live links, grain mode, one beat after its first meeting; Schmidt 0.908 / 0.092) and 2.3613 on the
// color history (the same pair as a love and a fear in the color mode). Both were floating see-saw readings.
//
// THE CANDIDATES, written before any of this file's computations:
//   swap history A1: Schmidt ((1 + sqrt(2/3)) / 2, (1 - sqrt(2/3)) / 2, 0), so e2 = 1/12 and e3 = 0 exactly,
//     and CHSH = 2 sqrt(1 + 4/12) = 4 / sqrt 3, the positive root of 3 x^2 - 16. The reason predicted: the
//     first meeting is one swap phase on a PRODUCT, and E-QTM-0131 gives its Schmidt product as
//     (3/16)(1 - |c|^2)^2 in the overlap c of the two factors. The live links before the meeting moved one
//     token's role into another stabilizer basis, where two stabilizer states overlap |c|^2 = 1/3, so
//     p1 p2 = (3/16)(4/9) = 1/12. Under the transposed links the factors stayed orthogonal (c = 0), p1 p2 =
//     3/16, sqrt 7. On stabilizer products one meeting can give only three values: sqrt 7, 4 / sqrt 3, 2.
//   color history B1: Schmidt (7/8, 1/9, 1/72), the weights E-QTM-0132 found for E-FRC-0159 HF, whose exact
//     maximum it gave as 2.3613: CHSH = 2 sqrt((71/72)^2 + 7/18) + 1/36 = (1 + sqrt 7057) / 36, the positive
//     root of 18 x^2 - x - 98. Registered because the two readings agree to the digits shown, not from a
//     mechanism: if B1 fails, the exact number found is reported as it is.
//   control C: the same histories with every link acting by its TRANSPOSE (the pre-fix convention, rebuilt by
//     conjugating each grid table by the transpose of the index) give sqrt 7 (x^2 - 7) and (2 + 4 sqrt 2) / 3
//     (9 x^2 - 12 x - 28), the E-MTH-0009 proven values.
//
// THE METHOD (code/measure/exact-schmidt). The knot's first-role marginal times A(p), whose entries are
// Eisenstein integers, gives M = U rho_A over Z[omega]; tr M, E2 = U^2 e2 and E3 = U^3 e3 are integers, the
// weights are the roots of the monic integer cubic y^3 - U y^2 + E2 y - E3 over U, and CHSH follows from
// E-QTM-0132's form as a surd (2 y3 + 2 f sqrt s) / U with its primitive minimal polynomial. Independently, the
// swap history is rebuilt as an Eisenstein WORD: each crossing's link as the Clifford element whose action on
// the phase points is phaseMove(its grid table), each like meeting as SWAP U, each comoving meeting conjugated
// by the displacements to the two own points.
//
// Both fear beats are read: comoving (adopted 2026-09-26, the default now) and fixed-frame (comoving: false),
// since another agent is adopting the comoving beat while this runs; the reading beat is the first meeting's.
//
// Gates, fixed before the first run:
//   G1 exactness: every A(p) entry is an Eisenstein integer; for the four knots (two histories, two beats)
//      tr M = U, E2 and E3 have no omega part, and the whole passes the purity count 9 sum W^2 = U^2
//      (3^k on k roles; the first run's text said 9^2 and its code used 81, a slip, fixed, disclosed below).
//   G2 swap: on both beats e3 = 0 and e2 = 1/12 exactly, CHSH's minimal polynomial is 3 x^2 - 16 (A1).
//   G3 color: on both beats the weights are 7/8, 1/9, 1/72 exactly (three integer roots) and the minimal
//      polynomial is 18 x^2 - x - 98 (B1).
//   G4 the word: the Eisenstein word's grid weights equal the swap knot's within 1e-12 at the reading beat on
//      both beats, and its e2, e3 equal the marginal route's exactly.
//   G5 the instrument: code/measure/pure-chsh's see-saw on each knot's density agrees with its exact value
//      within 1e-6 (a see-saw is a lower bound, so only from below).
//   G6 control C: the transposed-link histories give minimal polynomials x^2 - 7 and 9 x^2 - 12 x - 28 on the
//      fixed-frame beat.
// Reported, not gated (E-MTH-0010's discipline): the integer-relation hits and null rate of 2.3094 and 2.3613 at
// the four decimals E-QTM-0123 quoted (delta 5e-5), and of the see-saw values at delta 1e-6. An identification
// here rests on G2 and G3, never on a hit.
// Status: pass if every gate holds; partial if only G3 fails (the color value then reported exactly as found).
//
// Depth L2: exact arithmetic on the knit's own histories, with an independent rebuild and a control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  fearBeat,
  fearKernels,
  makeLattice,
  meetingKernel,
  phaseMove,
  swapPhase,
  twoRolePoints,
  wholeUnits,
  GRID_OF_PHASE,
  type BeatRecord,
  type Whole,
} from '@/code/rule/fear-weave'
import { gridWeights, type Operator } from '@/code/measure/grid-weights'
import { chshNumber, exactReduced, type ChshNumber, type ExactReduced } from '@/code/measure/exact-schmidt'
import { densitySeeSaw } from '@/code/measure/pure-chsh'
import { applySwapPhase, eisValue, schmidtInvariants, type State9 } from '@/code/measure/eisenstein-words'
import { applyOn, cliffordTable, phaseNegate, swapRoles } from '@/code/measure/clifford-words'
import { nullMatchRate, relationHits } from '@/code/measure/integer-relation'

const OMEGA = (2 * Math.PI) / 3
const SIDE = 3
const VACUUM_PAIR = [4, 7]
const BEATS = 60
const NULL_SAMPLES = 5000

function basisWhole(tokens: readonly number[], digits: readonly number[]): Whole {
  const weight = new Array<bigint>(9 ** tokens.length).fill(0n)

  for (let i = 0; i < weight.length; i++) {
    const on = tokens.every((_, c) => Math.floor((Math.floor(i / 9 ** (tokens.length - 1 - c)) % 9) / 3) === digits[c])

    weight[i] = on ? 1n : 0n
  }

  return { tokens, weight }
}

function densityOf(whole: Whole): Operator {
  const points = twoRolePoints()
  const units = Number(wholeUnits(whole))
  const rho: Operator = { n: 9, re: new Float64Array(81), im: new Float64Array(81) }

  whole.weight.forEach((w, x) => {
    if (w === 0n) {
      return
    }

    const a = points[x]!

    for (let k = 0; k < 81; k++) {
      rho.re[k] = (rho.re[k] ?? 0) + (Number(w) / units) * (a.re[k] ?? 0)
      rho.im[k] = (rho.im[k] ?? 0) + (Number(w) / units) * (a.im[k] ?? 0)
    }
  })

  return rho
}

type Case = { name: string; comoving: boolean; transposed: boolean; color: boolean }

// Z[sqrt 15, sqrt 21, sqrt 35], basis 1, r15, r21, r35: r15 r21 = 3 r35, r15 r35 = 5 r21, r21 r35 = 7 r15
type Quad = [bigint, bigint, bigint, bigint]

function quadMul(x: Quad, y: Quad): Quad {
  const [a0, a1, a2, a3] = x
  const [b0, b1, b2, b3] = y

  return [
    a0 * b0 + 15n * a1 * b1 + 21n * a2 * b2 + 35n * a3 * b3,
    a0 * b1 + a1 * b0 + 7n * (a2 * b3 + a3 * b2),
    a0 * b2 + a2 * b0 + 5n * (a1 * b3 + a3 * b1),
    a0 * b3 + a3 * b0 + 3n * (a1 * b2 + a2 * b1),
  ]
}

function quadAdd(...xs: Quad[]): Quad {
  return xs.reduce((s, x) => [s[0] + x[0], s[1] + x[1], s[2] + x[2], s[3] + x[3]], [0n, 0n, 0n, 0n] as Quad)
}

function quadScale(c: bigint, x: Quad): Quad {
  return [c * x[0], c * x[1], c * x[2], c * x[3]]
}

const isZero = (x: Quad): boolean => x.every(c => c === 0n)

export default experiment({
  id: 'quantum/bell-values-exact',
  code: 'E-QTM-0140',
  title:
    'the corrected reading-beat Bell values sit on a three-rung ladder of exact knots, and the link start picks the rung, fail at the default integer link start (E-MTH-0027), which reads the top rung (swap sqrt 7, color (2 + 4 sqrt 2) / 3), so the middle-rung forms its gate asks for are not found there; partial on 2 of 17 starts of E-MTH-0028\'s family (integer+7 and the retired golden start), fail on 15: the swap history reads the middle rung 4 / sqrt 3 (e2 = 1/12, overlap 1/3) on 8 starts and the top rung sqrt 7 (e2 = 3/16, overlap 0) on 9, never 2; the color knot has Phi-overlap 1/9 on the same 8 and 1/3 on the other 9; the registered color candidate (1 + sqrt 7057) / 36 is wrong on every start; the transposed-link control lands on the top rung on 8 starts, the middle on 8 and the bottom rung 2 on 1, so its gate holds only where it happens to read the top rung; the middle color value (8 + 2 sqrt 21 + 2 sqrt 35 - 2 sqrt 15) / 9 = 2.3613 is the Schmidt-aligned block value of a three-weight knot, a lower bound, where a wider see-saw reaches 2.3848',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const weave = makeColorWeave({ side: SIDE, table: 'pair' })
    const { mesh, moves } = weave
    const slots = mesh.cellCount * 24
    const open = new Uint8Array(slots)

    VACUUM_PAIR.forEach(t => {
      open[t] = 1
    })

    // the classical run, E-QTM-0100's live history
    const records: BeatRecord[] = []
    let lattice = makeLattice({ vibe: new Int8Array(slots), point: new Int8Array(slots) })

    for (let t = 0; t < BEATS; t++) {
      const r = fearBeat({ weave, links: weave.links, lattice, open, t })

      lattice = r.lattice
      records.push(r.record)
    }

    const firstMeeting = records.findIndex(r => r.meetings.length > 0)
    // the pre-fix convention: phaseMove(G t G) = t, so each grid table acts on the phase index directly
    const transposedWeave = {
      ...weave,
      moves: { ...moves, act: moves.act.map(t => GRID_OF_PHASE.map(q => GRID_OF_PHASE[t[q] ?? q] ?? 0)) as unknown as typeof moves.act },
    }
    const kSwap = meetingKernel(swapPhase(OMEGA)) ?? []
    const colorOn = fearKernels({ like: OMEGA, unlike: OMEGA }) ?? undefined
    const knotOf = (c: Case): Whole => {
      let whole = basisWhole(VACUUM_PAIR, c.color ? [0, 0] : [0, 1])

      for (let t = 0; t <= firstMeeting + 1; t++) {
        whole = advanceWhole({
          weave: c.transposed ? transposedWeave : weave,
          whole,
          record: records[t]!,
          kernel4: c.color ? [] : kSwap,
          ...(c.color ? { color: colorOn } : {}),
          fixed: false,
          forward: true,
          comoving: c.comoving,
        })!
      }

      return whole
    }

    const cases: Case[] = [
      { name: 'swapComoving', comoving: true, transposed: false, color: false },
      { name: 'swapFixedFrame', comoving: false, transposed: false, color: false },
      { name: 'colorComoving', comoving: true, transposed: false, color: true },
      { name: 'colorFixedFrame', comoving: false, transposed: false, color: true },
      { name: 'swapTransposed', comoving: false, transposed: true, color: false },
      { name: 'colorTransposed', comoving: false, transposed: true, color: true },
    ]
    const read = cases.map(c => {
      const knot = knotOf(c)
      const reduced = exactReduced({ weight: knot.weight, coordinate: 0, coordinates: 2 })
      const number = chshNumber(reduced)
      const seesaw = densitySeeSaw(densityOf(knot), 8)

      return { c, knot, reduced, number, seesaw }
    })
    const byName = (name: string): { knot: Whole; reduced: ExactReduced; number: ChshNumber; seesaw: number } => read.find(r => r.c.name === name)!
    const poly = (n: ChshNumber): string => n.minimalPolynomial.join(',')

    // G1
    const g1 = read.every(r => r.reduced.trace === r.reduced.units && r.reduced.pure)

    // G2: e3 = 0, 12 E2 = U^2, minimal polynomial 3 x^2 - 16
    const swapA1 = (r: { reduced: ExactReduced; number: ChshNumber }): boolean =>
      r.reduced.e3 === 0n && 12n * r.reduced.e2 === r.reduced.units * r.reduced.units && poly(r.number) === '3,0,-16'
    const g2 = swapA1(byName('swapComoving')) && swapA1(byName('swapFixedFrame'))

    // G3: weights 7/8, 1/9, 1/72 (U 7/8, U/9, U/72 all integer roots), minimal polynomial 18 x^2 - x - 98
    const colorB1 = (r: { reduced: ExactReduced; number: ChshNumber }): boolean => {
      const U = r.reduced.units

      return (
        U % 72n === 0n &&
        [(7n * U) / 8n, U / 9n, U / 72n].every(y => r.number.integerRoots.includes(y)) &&
        poly(r.number) === '18,-1,-98'
      )
    }
    const g3 = colorB1(byName('colorComoving')) && colorB1(byName('colorFixedFrame'))

    // G4: the swap history as an Eisenstein word
    const { elementOf, translation } = cliffordTable()
    const wordOf = (comoving: boolean): State9 => {
      // |0>|1>, entries over 1
      let s: State9 = { num: Array.from({ length: 9 }, (_, i) => (i === 1 ? [1, 0] : [0, 0]) as [number, number]), k2: 0, m3: 0 }
      const own = [0, 0]
      const coordinate = new Map(VACUUM_PAIR.map((t, i) => [t, i]))

      for (let t = 0; t <= firstMeeting + 1; t++) {
        const record = records[t]!

        for (const [ta, tb] of record.meetings) {
          const ca = coordinate.get(ta)
          const cb = coordinate.get(tb)

          if (ca === undefined || cb === undefined) {
            continue
          }

          const pa = comoving ? own[ca]! : 0
          const pb = comoving ? own[cb]! : 0
          // K'(x; x0) = K(x - p; x0 - p): translate by -p, meet, translate by +p
          const shiftFirst = (v: number): void => {
            s = applyOn(ca, translation(v), s)
          }
          const shiftSecond = (v: number): void => {
            s = applyOn(cb, translation(v), s)
          }

          shiftFirst(phaseNegate(pa))
          shiftSecond(phaseNegate(pb))
          s = swapRoles(applySwapPhase(s))
          shiftFirst(pa)
          shiftSecond(pb)
        }

        for (const [tk, g] of record.crossings) {
          const c = coordinate.get(tk)

          if (c === undefined || g === moves.identity) {
            continue
          }

          const perm = phaseMove(moves.act[g] ?? [])
          const d = elementOf(perm)

          s = applyOn(c, d, s)
          own[c] = perm[own[c]!] ?? 0
        }
      }

      return s
    }
    const wordCheck = (comoving: boolean, name: string): { gap: number; same: boolean } => {
      const s = wordOf(comoving)
      const scale = 2 ** s.k2 * 3 ** s.m3
      const re: number[] = []
      const im: number[] = []

      s.num.forEach(x => {
        const [r, i] = eisValue(x, scale)

        re.push(r)
        im.push(i)
      })

      const weights = gridWeights({ re, im, points: twoRolePoints() })
      const r = byName(name)
      const units = Number(r.reduced.units)
      const gap = Math.max(...weights.map((w, i) => Math.abs(w - Number(r.knot.weight[i] ?? 0n) / units)))
      const inv = schmidtInvariants(s)
      const d4 = inv.scale ** 4n
      const U = r.reduced.units
      // e2 = e2Num / scale^4 = E2 / U^2, e3 = e3Num / scale^6 = E3 / U^3
      const same = inv.e2Num * U * U === r.reduced.e2 * d4 && inv.e3Num * U ** 3n === r.reduced.e3 * d4 * inv.scale ** 2n

      return { gap, same }
    }
    const wordComoving = wordCheck(true, 'swapComoving')
    const wordFixed = wordCheck(false, 'swapFixedFrame')
    const g4 = wordComoving.gap <= 1e-12 && wordFixed.gap <= 1e-12 && wordComoving.same && wordFixed.same

    // G5
    const g5 = read.every(r => r.seesaw <= r.number.value + 1e-9 && r.number.value - r.seesaw <= 1e-6)

    // G6
    const g6 = poly(byName('swapTransposed').number) === '1,0,-7' && poly(byName('colorTransposed').number) === '9,-12,-28'

    // R1, reported and NOT a gate (written after the first run showed B1 wrong): the color knot as found.
    // U = 27, E2 = 81, E3 = 27: y^3 - 27 y^2 + 81 y - 27 = (y - 3)(y^2 - 24 y + 9), so the weights are 1/9 and
    // (12 +- 3 sqrt 15) / 27 = (4 +- sqrt 15) / 9. Then 81 ((p1 + p2)^2 + 4 p1 p2) = (5 + sqrt 15)^2 + 4 (4 + sqrt
    // 15) = 56 + 14 sqrt 15 = (sqrt 35 + sqrt 21)^2, so CHSH = (8 + 2 sqrt 21 + 2 sqrt 35 - 2 sqrt 15) / 9, and
    // with z = sqrt 21 + sqrt 35 - sqrt 15 (four conjugates, abc = 1 over the sign flips) the minimal polynomial is
    // 6561 x^4 - 23328 x^3 - 14904 x^2 + 123840 x - 106160. Every step checked here in exact integers
    const colorKnot = byName('colorComoving').reduced
    const cubicFactors = ['colorComoving', 'colorFixedFrame'].every(n => {
      const r = byName(n).reduced

      return r.units === 27n && r.e2 === 81n && r.e3 === 27n
    })
    const y: Quad = [12n, 3n, 0n, 0n]
    const yConj: Quad = [12n, -3n, 0n, 0n]
    const quadraticRoots = [y, yConj].every(r => isZero(quadAdd(quadMul(r, r), quadScale(-24n, r), [9n, 0n, 0n, 0n])))
    const factorProduct = [1n, -27n, 81n, -27n].join(',') === [1n, -24n - 3n, 9n + 72n, -27n].join(',')
    const radicand = quadAdd(quadMul([5n, 1n, 0n, 0n], [5n, 1n, 0n, 0n]), quadScale(4n, [4n, 1n, 0n, 0n]))
    const denested = quadMul([0n, 0n, 1n, 1n], [0n, 0n, 1n, 1n])
    const denests = radicand.every((c, k) => c === denested[k]) && radicand.join(',') === '56,14,0,0'
    // 9 x = 8 + 2 z; P(x) 9^4 = (8 + 2 z)^4 - 32 (8 + 2 z)^3 - 184 (8 + 2 z)^2 + 13760 (8 + 2 z) - 106160
    const nine: Quad = [8n, -2n, 2n, 2n]
    const n2 = quadMul(nine, nine)
    const n3 = quadMul(n2, nine)
    const n4 = quadMul(n3, nine)
    const polyVanishes = isZero(quadAdd(n4, quadScale(-32n, n3), quadScale(-184n, n2), quadScale(13760n, nine), [-106160n, 0n, 0n, 0n]))
    const found = (8 + 2 * Math.sqrt(21) + 2 * Math.sqrt(35) - 2 * Math.sqrt(15)) / 9
    const colorFormExact = cubicFactors && quadraticRoots && factorProduct && denests && polyVanishes
    const colorFormGap = Math.max(...['colorComoving', 'colorFixedFrame'].map(n => Math.abs(byName(n).number.value - found)))
    // THE ONE-MEETING LAWS behind both numbers, read here off the two knots (proven in E-QTM-0141): one swap phase on
    // a product with overlap |c|^2 gives e2 = (3/16)(1 - |c|^2)^2, e3 = 0; one singlet phase on a love-fear product
    // with Phi-overlap g gives e2 = g, e3 = g^3. So 1/12 is |c|^2 = 1/3 and (1/9, 1/729) is g = 1/9
    const swapOverlapThird = 12n * byName('swapComoving').reduced.e2 === byName('swapComoving').reduced.units ** 2n
    const colorOverlapNinth = 9n * colorKnot.e2 === colorKnot.units ** 2n && 729n * colorKnot.e3 === colorKnot.units ** 3n

    // the E-MTH-0010 null, reported
    const nullOf = (value: number, delta: number): { hits: number; best: string; rate: number } => {
      const hits = relationHits(value, delta)

      return { hits: hits.length, best: hits[0]?.form ?? 'none', rate: nullMatchRate(value, delta, NULL_SAMPLES) }
    }
    const nullSwap = nullOf(2.3094, 5e-5)
    const nullColor = nullOf(2.3613, 5e-5)
    const nullSwapSeeSaw = nullOf(byName('swapComoving').seesaw, 1e-6)
    const nullColorSeeSaw = nullOf(byName('colorComoving').seesaw, 1e-6)

    const gates = { G1: g1, G2: g2, G3: g3, G4: g4, G5: g5, G6: g6 }
    const others = g1 && g2 && g4 && g5 && g6
    const status = others && g3 ? 'pass' : others ? 'partial' : 'fail'
    const metrics: Record<string, number> = {
      firstMeetingBeat: firstMeeting,
      readingBeat: firstMeeting + 1,
    }
    // the exact data, as text (metrics are numbers)
    const exact: string[] = []

    read.forEach(r => {
      const n = r.c.name

      metrics[`${n}_units`] = Number(r.reduced.units)
      metrics[`${n}_traceIsUnits`] = r.reduced.trace === r.reduced.units ? 1 : 0
      metrics[`${n}_purityCount`] = r.reduced.pure ? 1 : 0
      metrics[`${n}_chshExactValue`] = r.number.value
      metrics[`${n}_chshSeeSaw`] = r.seesaw
      r.number.schmidt.forEach((x, k) => {
        metrics[`${n}_schmidt${k + 1}`] = x
      })
      exact.push(
        `${n}: U ${r.reduced.units}, E2 ${r.reduced.e2}, E3 ${r.reduced.e3}, rational weights ${r.number.integerRoots.map(y => `${y}/${r.reduced.units}`).join(' ') || 'none'}, CHSH ${r.number.form}, minimal polynomial [${poly(r.number)}]`,
      )
    })

    metrics['colorFoundFormExact'] = colorFormExact ? 1 : 0
    metrics['colorFoundFormGap'] = colorFormGap
    metrics['colorFoundForm'] = found
    metrics['swapKnotIsOverlapThird'] = swapOverlapThird ? 1 : 0
    metrics['colorKnotIsPhiOverlapNinth'] = colorOverlapNinth ? 1 : 0
    metrics['wordComovingWeightGap'] = wordComoving.gap
    metrics['wordFixedFrameWeightGap'] = wordFixed.gap
    metrics['wordInvariantsEqual'] = wordComoving.same && wordFixed.same ? 1 : 0
    ;[
      ['quoted2p3094', nullSwap],
      ['quoted2p3613', nullColor],
      ['swapSeeSaw', nullSwapSeeSaw],
      ['colorSeeSaw', nullColorSeeSaw],
    ].forEach(([k, v]) => {
      const x = v as { hits: number; best: string; rate: number }

      metrics[`null_${k as string}_hits`] = x.hits
      metrics[`null_${k as string}_rate`] = x.rate
      exact.push(`null ${k as string}: simplest hit ${x.best}, ${x.hits} hits, null rate ${x.rate}`)
    })

    Object.entries(gates).forEach(([k, v]) => {
      metrics[`gate_${k}`] = v ? 1 : 0
    })

    // THE RUNG each knot reads, identified from its exact integers (U, E2, E3) by the one-meeting laws above, never
    // from a decimal (added 2026-09-26 after E-MTH-0028 found the start picks the rung: the claim had printed the
    // middle rung whatever was measured). No gate reads this.
    type Rung = { rung: string; value: string; knot: string }
    const swapRung = (r: ExactReduced): Rung => {
      const u2 = r.units * r.units

      if (r.e3 === 0n && 16n * r.e2 === 3n * u2) {
        return { rung: 'top', value: 'sqrt 7 (root of x^2 - 7)', knot: 'e3 = 0 and e2 = 3/16, one swap phase on a product of two orthogonal stabilizer roles (overlap 0)' }
      }

      if (r.e3 === 0n && 12n * r.e2 === u2) {
        return { rung: 'middle', value: '4 / sqrt 3 (root of 3 x^2 - 16)', knot: 'e3 = 0 and e2 = 1/12, one swap phase on a product of two stabilizer roles from different bases (overlap 1/3)' }
      }

      if (r.e3 === 0n && r.e2 === 0n) {
        return { rung: 'bottom', value: '2', knot: 'e2 = e3 = 0, a product (overlap 1)' }
      }

      return { rung: 'no', value: `U ${r.units}, E2 ${r.e2}, E3 ${r.e3}`, knot: 'off the one-meeting ladder' }
    }
    const colorRung = (r: ExactReduced): Rung => {
      const u2 = r.units * r.units
      const u3 = u2 * r.units

      if (3n * r.e2 === u2 && 27n * r.e3 === u3) {
        return { rung: 'top', value: '(2 + 4 sqrt 2) / 3 (root of 9 x^2 - 12 x - 28)', knot: 'e2 = 1/3, e3 = 1/27, one singlet phase on a love-fear product with Phi-overlap 1/3' }
      }

      if (9n * r.e2 === u2 && 729n * r.e3 === u3) {
        return {
          rung: 'middle',
          value:
            '(8 + 2 sqrt 21 + 2 sqrt 35 - 2 sqrt 15) / 9 (root of 6561 x^4 - 23328 x^3 - 14904 x^2 + 123840 x - 106160) on the Schmidt-aligned blocks, a lower bound on this three-weight knot\'s maximum (see the notes)',
          knot: 'e2 = 1/9, e3 = 1/729, one singlet phase on a love-fear product with Phi-overlap 1/9',
        }
      }

      if (r.e2 === 0n && r.e3 === 0n) {
        return { rung: 'bottom', value: '2', knot: 'e2 = e3 = 0, a product (Phi-overlap 0)' }
      }

      return { rung: 'no', value: `U ${r.units}, E2 ${r.e2}, E3 ${r.e3}`, knot: 'off the one-meeting ladder' }
    }
    const rungs = Object.fromEntries(read.map(r => [r.c.name, r.c.color ? colorRung(r.reduced) : swapRung(r.reduced)])) as Record<string, Rung>
    const beatsAgree = (a: string, b: string): boolean => rungs[a]?.rung === rungs[b]?.rung
    const historyText = (history: string, comoving: string, fixed: string): string => {
      const c = rungs[comoving]!
      const f = rungs[fixed]!

      return beatsAgree(comoving, fixed)
        ? `the ${history} history's reading-beat CHSH is exactly ${c.value}, the ${c.rung} rung of one meeting's ladder, on both fear beats: its knot has ${c.knot}`
        : `the ${history} history's reading-beat CHSH is exactly ${c.value} (the ${c.rung} rung) on the comoving beat and ${f.value} (the ${f.rung} rung) on the fixed-frame beat`
    }
    const registered = (1 + Math.sqrt(7057)) / 36
    const colorValue = byName('colorComoving').number.value
    const claim = `${historyText('swap', 'swapComoving', 'swapFixedFrame')}; ${historyText('color', 'colorComoving', 'colorFixedFrame')}; the registered color candidate (1 + sqrt 7057) / 36 = 2.3612764 is not the color value (off by ${Math.abs(registered - colorValue).toExponential(1)}); the transposed links give ${rungs['swapTransposed']!.value} (the ${rungs['swapTransposed']!.rung} rung) and ${rungs['colorTransposed']!.value} (the ${rungs['colorTransposed']!.rung} rung) exactly`

    metrics['swapRung'] = ['bottom', 'middle', 'top'].indexOf(rungs['swapComoving']!.rung)
    metrics['colorRung'] = ['bottom', 'middle', 'top'].indexOf(rungs['colorComoving']!.rung)
    metrics['swapTransposedRung'] = ['bottom', 'middle', 'top'].indexOf(rungs['swapTransposed']!.rung)
    metrics['colorTransposedRung'] = ['bottom', 'middle', 'top'].indexOf(rungs['colorTransposed']!.rung)

    return verdict({
      status,
      claim,
      metrics,
      notes: `REGISTRATION FIX 2026-09-26, no gate moved: the claim printed 4 / sqrt 3 and the middle color form whatever was measured; it now names each history's rung from its exact integers (U, E2, E3) by the one-meeting laws, and the rung indices are reported (swapRung, colorRung, swapTransposedRung, colorTransposedRung: 0 bottom, 1 middle, 2 top, -1 off the ladder). A FINDING FROM THE SAME PASS: the middle color value is the value of E-QTM-0132's formula, which pairs the two largest Schmidt weights in one qubit block and adds the third; on this knot's three weights (0.8748, 1/9, 0.0141) that is a lower bound, not the maximum. E-QTM-0100's see-saw on the same physical knot (its density pure, spectrum 0 and 1) reads 2.3612 to 2.3669 from eight starts, 2.3771 from 200 and 2.3848 from 1,500, while the swap knots do not move from 4 / sqrt 3 at 200 starts (two Schmidt weights, a two-qubit state, where the block formula is the Horodecki maximum) and the top color knot (three equal weights) does not move from (2 + 4 sqrt 2) / 3 at 1,500. G5 passed because this file's see-saw starts in the same basin. So the middle color rung is exact as a knot (e2 = 1/9, e3 = 1/729) but its CHSH maximum is open, at least 2.3848. ` + `L2, exact. FIRST RUN (2026-09-26, 1 s): status fail on G1 and G3. G1 failed on a slip in the purity count (the header said 9^2 sum W^2 and the code used 81, where two roles need 9 = 3^2: tr A(x) A(y) = 3^k delta); corrected in code/measure/exact-schmidt and in the header text, no other gate or number touched, and G1 then passes on all six knots. SECOND RUN: status partial, G3 alone failing, as the pre-registered rule says. THE SWAP VALUE: 4 / sqrt 3 exactly, on both fear beats (the comoving beat changes nothing at the first meeting, since the kernel is conjugated by local displacements), confirmed by an independent Eisenstein word rebuilt from the record (grid weights to 4e-17, e2 and e3 equal exactly). THE COLOR VALUE: the registered candidate B1 (Schmidt 7/8, 1/9, 1/72, taken from E-QTM-0132's reading of E-FRC-0159 HF) is WRONG: the knot's cubic is y^3 - 27 y^2 + 81 y - 27 = (y - 3)(y^2 - 24 y + 9) over U = 27, so the weights are 1/9 and (4 +- sqrt 15) / 9 = 0.87478 and 0.01411, and CHSH = (8 + 2 sqrt 21 + 2 sqrt 35 - 2 sqrt 15) / 9 = 2.36126047374 (the root sqrt(56 + 14 sqrt 15) denests to sqrt 35 + sqrt 21), a degree-4 number in Q(sqrt 15, sqrt 21), every step checked in exact integers (R1, reported after the first run, not a gate). (1 + sqrt 7057) / 36 = 2.3612764 agrees with it to four decimals only (off by 1.6e-5), which is exactly the E-MTH-0010 lesson: the four-decimal readings have null rate 0.999 (2.3094 hits 3 x^2 = 16 among 9 forms, 2.3613 hits 7 forms, the best 8 x^2 = 49 - 4 log 3), and at the see-saw's 1e-6 the rate is 0.117 and 0.114: no number here is identified by a match; the swap value by G2 and the word, the color value by the factored cubic. E-QTM-0132's (0.875, 1/9, 1/72) for E-FRC-0159 HF is very likely this same knot, ((4 + sqrt 15) / 9, 1/9, (4 - sqrt 15) / 9) (0.8748 and 0.0141), misread from floating digits; that file is not rerun here. THE MECHANISM, one law per meeting kind (proven in E-QTM-0141): one swap phase on a product with overlap |c|^2 gives e2 = (3/16)(1 - |c|^2)^2, e3 = 0; one singlet phase on a love-fear product with Phi-overlap g = |<Phi|a b>|^2 gives e2 = g, e3 = g^3, characteristic polynomial (x - g)(x^2 - (1 - g) x + g^2). On stabilizer roles |c|^2 is 0, 1/3 or 1 and g is 0, 1/9 or 1/3. The transposed links met the first meeting with |c|^2 = 0 and g = 1/3 (sqrt 7, (2 + 4 sqrt 2) / 3, the control, G6), the corrected links with |c|^2 = 1/3 and g = 1/9: the link fix moved each history from the best stabilizer start to the middle one, and both values are the middle rung of a three-rung ladder, not new constants. Exact data: ${exact.join('. ')}.`,
    })
  },
})
