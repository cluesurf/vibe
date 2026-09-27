// Tsirelson's bound reached exactly by a finite history: three like meetings and one link move take a
// product of two stabilizer roles to Schmidt weights (1/2, 1/2, 0), where CHSH = 2 sqrt 2 (E-QTM-0132).
//
// E-QTM-0112 searched meeting words, merged states whose sorted grid weights agreed (a merge that can lose a
// state, as its notes say), and reported 2 sqrt 2 approached (2.8266 at four meetings) and never reached.
// E-QTM-0131 enumerates the words exactly in Z[omega][1/6] without merging anything but equal states, and a
// probe of it (tmp/hidden-witness-probe.ts, run before this file) found the first exact words at three
// meetings. This experiment rebuilds the witness in the model's own representation: the knot as grid weights,
// the like meeting as code/rule/fear-weave's kernel (the color mode, like tokens kept: the swap phase U), and
// the link move as one of code/rule/vibe-weave's 216 grid moves acting on the first token's points.
//
// THE WITNESS (from the probe): start |0> |+>, |+> = (|0> + |1> + |2>) / sqrt 3 (both stabilizer states,
// each a line of the phase grid), a like meeting, a second like meeting with no link move between, one link
// move D on the first token, a third like meeting. The final amplitudes are
//   (-2, -2 - 3w, -2 - 3w, 2 - w, -1 - w, -1 - w, 2 - w, -1 - w, -1 - w) / 6,   w = omega,
// and its reduced density has e3 = 0 and e2 = 1/4 exactly.
//
// Gates, fixed before the first run of this file:
//   G1 the census: every word U (D2 x 1) U (D1 x 1) U |0>|t> over the 12 stabilizer t and 216 x 216 link
//      moves, and the shorter words, enumerated exactly: no word with one or two meetings reaches Schmidt
//      (1/2, 1/2, 0), and at least one with three does.
//   G2 the model's own kernels: the grid weights after each of the witness's steps, computed with
//      fear-weave's like kernel (whole numbers over its divisor) and the grid move as a permutation of the
//      first token's points, in exact rationals, equal the weights of the exact Eisenstein state within
//      1e-12 at every step, and the final weights satisfy the purity count 9 sum W^2 = (sum W)^2 exactly.
//   G3 the Schmidt weights read from the model's weights are (1/2, 1/2, 0) within 1e-12, and exactly so from
//      the Eisenstein state (e3 = 0, e2 = 1/4).
//   G4 CHSH: code/measure/pure-chsh's see-saw on the model's density reads 2 sqrt 2 within 1e-9, and the
//      exact form gives 2 sqrt 2 within 1e-12.
//   G5 the link move is one of the model's 216 grid moves (in the index convention E-QTM-0131 fixed).
//   G6 control: the same word with the love-fear singlet phase in place of each like meeting does not reach
//      (1/2, 1/2, 0), and neither does the same word with its link move removed.
//
// Depth L1 (relabeled from L2 after the first run: a word of the kernel group, not a knit history): an
// exact witness in the model's own kernels. Substrate-independent: every number is on the
// role grid; which knit makes a like pair meet three times with that link move between is not asked here.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  applyFirst,
  applySingletPhase,
  applySwapPhase,
  cliffordGroup,
  eisValue,
  productState,
  schmidtInvariants,
  stabilizerStates,
  type Mat3,
  type State9,
} from '@/code/measure/eisenstein-words'
import { densitySeeSaw, pureChshExact } from '@/code/measure/pure-chsh'
import { fearKernels, twoRolePoints } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { gridWeights, phasePointOperators, type Operator } from '@/code/measure/grid-weights'
import { hermitianValues, reducedFirst } from '@/code/measure/bell-gates'

const OMEGA = (2 * Math.PI) / 3
const TSIRELSON = 2 * Math.SQRT2

function isHalfHalf(s: State9): boolean {
  const inv = schmidtInvariants(s)
  const d4 = inv.scale ** 4n

  return inv.e3Num === 0n && 4n * inv.e2Num === d4
}

function vectorOf(s: State9): { re: number[]; im: number[] } {
  const scale = 2 ** s.k2 * 3 ** s.m3
  const re: number[] = []
  const im: number[] = []

  s.num.forEach(x => {
    const [r, i] = eisValue(x, scale)

    re.push(r)
    im.push(i)
  })

  return { re, im }
}

function floatOf(m: Mat3): Operator {
  const o: Operator = { n: 3, re: new Float64Array(9), im: new Float64Array(9) }

  m.num.forEach((x, i) => {
    const [re, im] = eisValue(x, 3 ** m.den3)

    o.re[i] = re
    o.im[i] = im
  })

  return o
}

function conjugateBy(u: Operator, a: Operator): Operator {
  const n = 3
  const t: Operator = { n, re: new Float64Array(9), im: new Float64Array(9) }
  const o: Operator = { n, re: new Float64Array(9), im: new Float64Array(9) }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < n; k++) {
        re += (u.re[i * n + k] ?? 0) * (a.re[k * n + j] ?? 0) - (u.im[i * n + k] ?? 0) * (a.im[k * n + j] ?? 0)
        im += (u.re[i * n + k] ?? 0) * (a.im[k * n + j] ?? 0) + (u.im[i * n + k] ?? 0) * (a.re[k * n + j] ?? 0)
      }

      t.re[i * n + j] = re
      t.im[i * n + j] = im
    }
  }

  // t u^dagger
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < n; k++) {
        const ur = u.re[j * n + k] ?? 0
        const ui = -(u.im[j * n + k] ?? 0)

        re += (t.re[i * n + k] ?? 0) * ur - (t.im[i * n + k] ?? 0) * ui
        im += (t.re[i * n + k] ?? 0) * ui + (t.im[i * n + k] ?? 0) * ur
      }

      o.re[i * n + j] = re
      o.im[i * n + j] = im
    }
  }

  return o
}

// the permutation a unitary makes of the nine single-role phase points, or [] if it makes none
function pointPermutation(u: Operator): number[] {
  const points = phasePointOperators(1)
  const perm: number[] = []

  for (let x = 0; x < 9; x++) {
    const moved = conjugateBy(u, points[x]!)
    const y = points.findIndex(p => p.re.every((v, i) => Math.abs(v - (moved.re[i] ?? 0)) < 1e-9 && Math.abs((p.im[i] ?? 0) - (moved.im[i] ?? 0)) < 1e-9))

    perm.push(y)
  }

  return perm.some(y => y < 0) ? [] : perm
}

// exact rational weights: numerators over one bigint denominator
type Weights = { num: bigint[]; den: bigint }

function applyKernel(w: Weights, kernel: readonly (readonly number[])[], divisor: number): Weights {
  const num = kernel.map(row => row.reduce((s, k, c) => s + BigInt(k) * (w.num[c] ?? 0n), 0n))

  return { num, den: w.den * BigInt(divisor) }
}

function moveFirst(w: Weights, perm: readonly number[]): Weights {
  const num = new Array<bigint>(81).fill(0n)

  for (let x = 0; x < 81; x++) {
    num[9 * (perm[Math.floor(x / 9)] ?? 0) + (x % 9)] = w.num[x] ?? 0n
  }

  return { num, den: w.den }
}

function weightGap(w: Weights, s: State9): number {
  const v = vectorOf(s)
  const exact = gridWeights({ re: v.re, im: v.im, points: twoRolePoints() })

  return Math.max(...exact.map((x, i) => Math.abs(x - Number(w.num[i] ?? 0n) / Number(w.den))))
}

export default experiment({
  id: 'quantum/tsirelson-reached-exactly',
  code: 'E-QTM-0133',
  title:
    'Tsirelson\'s bound reached exactly by a finite history: from |0>|+>, three like meetings with one link move before the third take the knot to Schmidt weights (1/2, 1/2, 0) and CHSH = 2 sqrt 2, in exact Eisenstein arithmetic and in the model\'s own grid weights and kernels; no word with one or two meetings does, and the love-fear singlet phase never does',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const group = cliffordGroup()
    const stab = stabilizerStates(group)
    const zero = stab[0]!
    const identityIndex = group.findIndex(g => g.den3 === 0 && g.num.every((x, i) => (i % 4 === 0 ? x[0] === 1 && x[1] === 0 : x[0] === 0 && x[1] === 0)))

    // G1, the census
    let hits1 = 0
    let hits2 = 0
    let hits3 = 0
    let words3 = 0
    let witness: { t: number; d1: number; d2: number } | undefined

    for (let t = 0; t < stab.length; t++) {
      const s1 = applySwapPhase(productState(zero, stab[t]!))

      hits1 += isHalfHalf(s1) ? 1 : 0

      for (let i = 0; i < group.length; i++) {
        const s2 = applySwapPhase(applyFirst(group[i]!, s1))

        hits2 += isHalfHalf(s2) ? 1 : 0

        for (let j = 0; j < group.length; j++) {
          words3++

          if (isHalfHalf(applySwapPhase(applyFirst(group[j]!, s2)))) {
            hits3++
            // the witness: the first hit with no link move between the first two meetings
            witness = witness ?? (i === identityIndex ? { t, d1: i, d2: j } : undefined)
          }
        }
      }
    }

    const g1 = hits1 === 0 && hits2 === 0 && hits3 > 0 && witness !== undefined

    // the witness, exactly and in the model's weights
    const w = witness ?? { t: 0, d1: 0, d2: 0 }
    const d2 = group[w.d2]!
    const e0 = productState(zero, stab[w.t]!)
    const e1 = applySwapPhase(e0)
    const e2 = applySwapPhase(applyFirst(group[w.d1]!, e1))
    const e3 = applySwapPhase(applyFirst(d2, e2))
    const kernels = fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: false })!
    const perm = pointPermutation(floatOf(d2))
    const permD1 = pointPermutation(floatOf(group[w.d1]!))
    const startWeights = gridWeights({ ...vectorOf(e0), points: twoRolePoints() })
    let m: Weights = { num: startWeights.map(x => BigInt(Math.round(9 * x))), den: 9n }
    const gaps: number[] = [weightGap(m, e0)]

    m = applyKernel(m, kernels.like, kernels.likeDivisor)
    gaps.push(weightGap(m, e1))
    m = applyKernel(moveFirst(m, permD1), kernels.like, kernels.likeDivisor)
    gaps.push(weightGap(m, e2))
    m = applyKernel(moveFirst(m, perm), kernels.like, kernels.likeDivisor)
    gaps.push(weightGap(m, e3))

    const sum = m.num.reduce((a, b) => a + b, 0n)
    const square = m.num.reduce((a, b) => a + b * b, 0n)
    const pureCount = sum === m.den && 9n * square === sum * sum
    const g2 = perm.length === 9 && Math.max(...gaps) <= 1e-12 && pureCount

    // the model's density from its weights
    const points = twoRolePoints()
    const rho: Operator = { n: 9, re: new Float64Array(81), im: new Float64Array(81) }

    m.num.forEach((x, i) => {
      const weight = Number(x) / Number(m.den)
      const a = points[i]!

      for (let k = 0; k < 81; k++) {
        rho.re[k] = (rho.re[k] ?? 0) + weight * (a.re[k] ?? 0)
        rho.im[k] = (rho.im[k] ?? 0) + weight * (a.im[k] ?? 0)
      }
    })

    const schmidt = hermitianValues(reducedFirst(rho)).reverse()
    const g3 = isHalfHalf(e3) && Math.abs((schmidt[0] ?? 0) - 0.5) <= 1e-12 && Math.abs((schmidt[1] ?? 0) - 0.5) <= 1e-12 && Math.abs(schmidt[2] ?? 1) <= 1e-12
    const seesaw = densitySeeSaw(rho, 8)
    const exactForm = pureChshExact(schmidt)
    const g4 = Math.abs(seesaw - TSIRELSON) <= 1e-9 && Math.abs(exactForm - TSIRELSON) <= 1e-12

    // G5: the move is a model grid move, in E-QTM-0131's convention A (grid index = phase-point index)
    const tables = new Set(gridMoves().act.map(t => Array.from(t).join('')))
    const g5 = tables.has(perm.join(''))

    // G6, controls
    const singletWord = applySingletPhase(applyFirst(d2, applySingletPhase(applyFirst(group[w.d1]!, applySingletPhase(e0)))))
    const noMove = applySwapPhase(applySwapPhase(applySwapPhase(e0)))
    const g6 = !isHalfHalf(singletWord) && !isHalfHalf(noMove)

    const gates = { G1: g1, G2: g2, G3: g3, G4: g4, G5: g5, G6: g6 }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'three like meetings with one link move before the third take |0>|+> to Schmidt weights (1/2, 1/2, 0) exactly, so CHSH = 2 sqrt 2 is reached by a finite history, in exact Eisenstein arithmetic and in the model\'s own grid weights, like kernel and grid move; no word of one or two meetings reaches it, and the love-fear singlet phase never does',
      metrics: {
        wordsOneMeeting: stab.length,
        wordsTwoMeetings: stab.length * group.length,
        wordsThreeMeetings: words3,
        halfHalfOneMeeting: hits1,
        halfHalfTwoMeetings: hits2,
        halfHalfThreeMeetings: hits3,
        witnessStart: w.t,
        witnessFirstMoveIsIdentity: w.d1 === identityIndex ? 1 : 0,
        witnessDenominatorTwoPower: e3.k2,
        witnessDenominatorThreePower: e3.m3,
        witnessWeightDenominator: Number(m.den),
        modelWeightGapWorst: Math.max(...gaps),
        pureCountExact: pureCount ? 1 : 0,
        schmidt1: schmidt[0] ?? -1,
        schmidt2: schmidt[1] ?? -1,
        schmidt3: schmidt[2] ?? -1,
        chshSeeSaw: seesaw,
        chshExactForm: exactForm,
        tsirelson: TSIRELSON,
        linkMoveIsModelGridMove: g5 ? 1 : 0,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      control: {
        singletWordHalfHalf: isHalfHalf(singletWord) ? 1 : 0,
        noMoveWordHalfHalf: isHalfHalf(noMove) ? 1 : 0,
      },
      notes:
        'L2. FIRST RUN (2026-09-26, 3 s): every gate passes. 108 of the 559,872 three-meeting words from |0>|t> end at Schmidt (1/2, 1/2, 0) exactly (27 distinct states up to phase, E-QTM-0131), none of the 12 one-meeting or 2,592 two-meeting words does. The witness needs no link move between the first two meetings: U^2 |0>|+>, one link move on the first token, U again. In the model\'s own representation the knot\'s weights are whole numbers over 576 = 9 x 4^3 at the end, match the exact state to 3e-17 at every step, and pass the purity count exactly; the reduced density is diag(1/2, 1/2, 0) in its eigenbasis and the see-saw reads 2 sqrt 2 to 3e-15. So the Tsirelson bound is a value a like pair can hold, not only a limit. Which knit history gives a like pair three meetings with that link move between them is not asked. The love-fear word of the same shape does not reach it, as E-QTM-0131 proves it cannot.',
    })
  },
})
