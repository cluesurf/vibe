// One ring behind the 1:3 splitter and Tsirelson's bound: which exact values a finite history of meetings
// and link moves can reach, and which it can only approach.
//
// THE HYPOTHESIS (from the roadmap): every amplitude any word of meetings and link moves makes lies in one
// ring, every probability in a ring where 1/2 is not reachable, so no finite history reaches an exact 50:50
// split, a full Hong-Ou-Mandel dip, or CHSH = 2 sqrt 2, while each is approached as a limit.
//
// THE RING, derived. Up to one global phase per generator:
//   links (the qutrit Clifford group, E-QTM-0117): entries omega^j or omega^j / sqrt(-3), and
//     sqrt(-3) = 1 + 2 omega is an Eisenstein integer of norm 3, so 1 / sqrt(-3) = -(1 + 2 omega) / 3;
//   the swap phase (a like meeting): (1 + omega) / 2 and (1 - omega) / 2;
//   the singlet phase (a love-fear meeting): delta + (omega - 1) / 3;
//   the fear line coin (E-SPN-0046): (1 + omega) / 2, (1 - omega) / 2.
// So every amplitude is in Z[omega][1/6], and a love-fear history's in Z[omega][1/3]: only like meetings
// bring the 2.
//
// WHAT 2 BEING INERT GIVES. 2 is prime in Z[omega] (the norm a^2 - ab + b^2 is never 2 mod 4), so the norm
// of an Eisenstein integer has an even power of 2, and a SINGLE amplitude's |x|^2 = N / (4^k 3^m) is never
// 1/2. A SUM of norms can be (1/4 + 1/4). So:
//   (1) no finite word makes a single-amplitude 50:50 split, in any ring Z[omega][1/n];
//   (2) no finite word gives a fine-grained full Hong-Ou-Mandel dip (zero bosonic coincidence over every
//       pair of distinct output modes): writing u, w for the two vibes' output amplitudes, u_j w_q + u_q w_j
//       = 0 for all j != q forces u onto two modes with |u_j|^2 = |u_q|^2 = 1/2 (three active modes force
//       w = 0 on them, one forces w = 0 by orthogonality), a single amplitude of norm 1/2;
//   (3) a love-fear knot's reduced density has entries in Z[omega][1/3], so its characteristic polynomial
//       x^3 - x^2 + e2 x - e3 has coefficients in Z[1/3], every rational Schmidt weight is in Z[1/3], and
//       (1/2, 1/2, 0), the only point where CHSH = 2 sqrt 2 (E-QTM-0132), is unreachable;
//   (4) for LIKE pairs the argument does NOT go through: Schmidt (1/2, 1/2, 0) has representatives with
//       entries 1/2 (|00> + |01> + |10> - |11>) / 2, so whether it is reached is a question about the
//       words, not the ring.
//   (5) the balanced splitter needs a ring where 2 is not inert: i (1 + i has norm 2), sqrt 2, or
//       sqrt(-7) ((1 + sqrt -7) / 2 has norm 2) each supply it. Z[omega, i] = Z[zeta_12] is the smallest
//       cyclotomic ring over the model's that does.
//
// DISCLOSED BEFORE THE GATES: a probe (tmp/hidden-words-probe.ts) enumerated the like words exactly before
// this file was written and found Schmidt (1/2, 1/2, 0) at three meetings. Gate G5 states the hypothesis as
// the roadmap posed it and is written knowing it fails; E-QTM-0133 carries the witness through the model's
// own kernels.
//
// Gates, fixed before the first run of this file:
//   G1 the generators: the Clifford group generated exactly from X, Z, S and F has 216 elements up to the six
//      units, each unitary exactly and with entries over 3^m, m <= 1; each one's action on the nine phase
//      points is one of the model's 216 grid moves (code/rule/vibe-weave, in one fixed index convention for
//      all of them); the exact swap phase, singlet phase and line coin equal code/rule/fear-weave's
//      swapPhase(2 pi / 3), singletPhase(2 pi / 3) and the E-SPN-0046 coin within 1e-12.
//   G2 2 is inert: no norm a^2 - ab + b^2 with |a|, |b| <= 400 has an odd power of 2 (so none is 2 mod 4).
//   G3 Hong-Ou-Mandel: over every line word of widths 3 (up to 5 beats) and 4 (4 beats), from starts at
//      separations 2 and 4, no fine-grained full dip, and the best visibility is at most 3/5 + 1e-12.
//      Reported: coarse dips (none predicted, no theorem either way).
//   G4 love-fear: every state of every singlet-phase word to three meetings (exact, deduplicated, from all
//      12 stabilizer products |0>|t>) has no factor 2 in its denominator and none has Schmidt (1/2, 1/2, 0)
//      (e3 = 0 and e2 = 1/4 exactly).
//   G5 the hypothesis for like pairs: no swap-phase word to three meetings reaches Schmidt (1/2, 1/2, 0).
//      KNOWN TO FAIL (see above).
//   G6 the balanced splitter: an element of norm 2 times an odd number exists in Z[i] and in
//      Z[(1 + sqrt -7) / 2] within |a|, |b| <= 4, and none in Z[omega] (G2).
// Status: pass if all hold, partial if only G5 fails, fail otherwise.
// Reported: the best CHSH (by E-QTM-0132's exact form) per number of meetings for both kinds, the gap to
// 2 sqrt 2, and the count of distinct states.
//
// Depth L1 (relabeled from L2 after the first run: it is number theory and an enumeration of the model's
// generators, not a run of the knit): exact arithmetic and exhaustive enumeration, with the theorems
// that say why.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  applyFirst,
  applySingletPhase,
  applySwapPhase,
  cliffordGroup,
  eisValue,
  lineWordHom,
  productState,
  schmidtInvariants,
  schmidtWeights,
  stabilizerStates,
  stateKey,
  type Mat3,
  type State9,
} from '@/code/measure/eisenstein-words'
import { pureChshExact } from '@/code/measure/pure-chsh'
import { singletPhase, swapPhase } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { phasePointOperators, type Operator } from '@/code/measure/grid-weights'

const OMEGA = (2 * Math.PI) / 3
const TSIRELSON = 2 * Math.SQRT2
const DEPTH = 3

// the float complex matrix of an exact 3 x 3
function floatOf(m: Mat3): Operator {
  const o: Operator = { n: 3, re: new Float64Array(9), im: new Float64Array(9) }
  const scale = 3 ** m.den3

  m.num.forEach((x, i) => {
    const [re, im] = eisValue(x, scale)

    o.re[i] = re
    o.im[i] = im
  })

  return o
}

function mul3(a: Operator, b: Operator, n: number): Operator {
  const o: Operator = { n, re: new Float64Array(n * n), im: new Float64Array(n * n) }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < n; k++) {
        re += (a.re[i * n + k] ?? 0) * (b.re[k * n + j] ?? 0) - (a.im[i * n + k] ?? 0) * (b.im[k * n + j] ?? 0)
        im += (a.re[i * n + k] ?? 0) * (b.im[k * n + j] ?? 0) + (a.im[i * n + k] ?? 0) * (b.re[k * n + j] ?? 0)
      }

      o.re[i * n + j] = re
      o.im[i * n + j] = im
    }
  }

  return o
}

function adjoint(a: Operator, n: number): Operator {
  const o: Operator = { n, re: new Float64Array(n * n), im: new Float64Array(n * n) }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      o.re[i * n + j] = a.re[j * n + i] ?? 0
      o.im[i * n + j] = -(a.im[j * n + i] ?? 0)
    }
  }

  return o
}

function distance(a: Operator, b: Operator): number {
  let d = 0

  for (let i = 0; i < a.re.length; i++) {
    d = Math.max(d, Math.abs((a.re[i] ?? 0) - (b.re[i] ?? 0)), Math.abs((a.im[i] ?? 0) - (b.im[i] ?? 0)))
  }

  return d
}

// the exact two-role gate as a float 9 x 9, by its action on the basis
function gateFloat(apply: (s: State9) => State9): Operator {
  const o: Operator = { n: 9, re: new Float64Array(81), im: new Float64Array(81) }

  for (let c = 0; c < 9; c++) {
    const num = Array.from({ length: 9 }, (_, i) => (i === c ? [1, 0] : [0, 0]) as [number, number])
    const s = apply({ num, k2: 0, m3: 0 })
    const scale = 2 ** s.k2 * 3 ** s.m3

    for (let r = 0; r < 9; r++) {
      const [re, im] = eisValue(s.num[r]!, scale)

      o.re[r * 9 + c] = re
      o.im[r * 9 + c] = im
    }
  }

  return o
}

type Level = { states: number; best: number; halfHalf: number; twoInDenominator: number }

function enumerate(meet: (s: State9) => State9, group: readonly Mat3[], starts: readonly State9[]): Level[] {
  const levels: Level[] = []
  const seen = new Set<string>()
  let frontier: State9[] = []

  for (let depth = 1; depth <= DEPTH; depth++) {
    const level: State9[] = []
    const add = (s: State9): void => {
      const key = stateKey(s)

      if (!seen.has(key)) {
        seen.add(key)
        level.push(s)
      }
    }

    if (depth === 1) {
      starts.forEach(s => add(meet(s)))
    } else {
      for (const s of frontier) {
        for (const d of group) {
          add(meet(applyFirst(d, s)))
        }
      }
    }

    let best = 0
    let halfHalf = 0
    let twoInDenominator = 0

    for (const s of level) {
      const inv = schmidtInvariants(s)
      const d2 = inv.scale * inv.scale
      const d4 = d2 * d2

      if (inv.normSum !== d2) {
        throw new Error('a state lost its norm')
      }

      halfHalf += inv.e3Num === 0n && 4n * inv.e2Num === d4 ? 1 : 0
      twoInDenominator += s.k2 > 0 ? 1 : 0
      best = Math.max(best, pureChshExact(schmidtWeights(Number(inv.e2Num) / Number(d4), Number(inv.e3Num) / Number(d4 * d2))))
    }

    levels.push({ states: level.length, best, halfHalf, twoInDenominator })
    frontier = level
  }

  return levels
}

export default experiment({
  id: 'quantum/one-ring-behind-the-limits',
  code: 'E-QTM-0131',
  title:
    'one ring behind the limits, partial: every amplitude of every word of link moves and meetings is in Z[omega][1/6], and since 2 is inert in Z[omega] no single amplitude has |x|^2 = 1/2, so no word makes a 50:50 split or a fine-grained full Hong-Ou-Mandel dip, and a love-fear knot (whose ring is Z[omega][1/3]) can never reach CHSH = 2 sqrt 2; but like meetings bring the 2 in, and three of them reach Tsirelson\'s bound exactly',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // G1, the generators
    const group = cliffordGroup()
    const identity: Operator = { n: 3, re: Float64Array.from([1, 0, 0, 0, 1, 0, 0, 0, 1]), im: new Float64Array(9) }
    const unitaryWorst = Math.max(...group.map(g => distance(mul3(floatOf(g), adjoint(floatOf(g), 3), 3), identity)))
    const maxDen3 = Math.max(...group.map(g => g.den3))
    const points = phasePointOperators(1)
    const moves = gridMoves()
    const tables = new Set(moves.act.map(t => Array.from(t).join('')))
    // phase-point index 3a + b; the grid index p = x + 3y read two ways: (x, y) = (b, a) or (a, b)
    const conventions = [(q: number): number => q, (q: number): number => 3 * (q % 3) + Math.floor(q / 3)]
    const matched = conventions.map(conv =>
      group.filter(g => {
        const u = floatOf(g)
        const ud = adjoint(u, 3)
        const perm: number[] = []

        for (let x = 0; x < 9; x++) {
          const moved = mul3(mul3(u, points[x]!, 3), ud, 3)
          const y = points.findIndex(p => distance(p, moved) < 1e-9)

          perm.push(y)
        }

        if (perm.some(y => y < 0)) {
          return false
        }

        const table = Array.from({ length: 9 }, (_, p) => conv(perm[conv(p)] ?? 0))

        return tables.has(table.join(''))
      }).length,
    )
    const gridMatch = Math.max(...matched)
    const swapGap = distance(gateFloat(applySwapPhase), swapPhase(OMEGA))
    const singletGap = distance(gateFloat(applySingletPhase), singletPhase(OMEGA))
    // the line coin's float form against its exact entries (2a = 1 + w, 2b = 1 - w)
    const a = eisValue([1, 1], 2)
    const b = eisValue([1, -1], 2)
    const coinGap = Math.max(
      Math.abs(a[0] - (1 + Math.cos(OMEGA)) / 2),
      Math.abs(a[1] - Math.sin(OMEGA) / 2),
      Math.abs(b[0] - (1 - Math.cos(OMEGA)) / 2),
      Math.abs(b[1] + Math.sin(OMEGA) / 2),
    )
    const g1 = group.length === 216 && unitaryWorst <= 1e-12 && maxDen3 <= 1 && gridMatch === 216 && swapGap <= 1e-12 && singletGap <= 1e-12 && coinGap <= 1e-12

    // G2, 2 is inert
    let oddTwo = 0
    let twoModFour = 0

    for (let x = -400; x <= 400; x++) {
      for (let y = -400; y <= 400; y++) {
        let n = x * x - x * y + y * y

        if (n === 0) {
          continue
        }

        twoModFour += n % 4 === 2 ? 1 : 0

        let v = 0

        while (n % 2 === 0) {
          n /= 2
          v++
        }

        oddTwo += v % 2 === 1 ? 1 : 0
      }
    }

    const g2 = oddTwo === 0 && twoModFour === 0

    // G3, Hong-Ou-Mandel on line words
    const starts: [number, number][] = [
      [-1, 2],
      [-1, 4],
      [0, 2],
      [0, 4],
    ]
    const homRuns = [
      { width: 3, beats: 3 },
      { width: 3, beats: 4 },
      { width: 3, beats: 5 },
      { width: 4, beats: 4 },
    ].map(c => ({ ...c, ...lineWordHom({ ...c, starts }) }))
    const g3 = homRuns.every(r => r.fineDips === 0 && r.bestVisibility <= 3 / 5 + 1e-12)

    // G4, G5: the words
    const stab = stabilizerStates(group)
    const productStarts = stab.map(t => productState(stab[0]!, t))
    const loveFear = enumerate(applySingletPhase, group, productStarts)
    const like = enumerate(applySwapPhase, group, productStarts)
    const g4 = loveFear.every(l => l.halfHalf === 0 && l.twoInDenominator === 0)
    const g5 = like.every(l => l.halfHalf === 0)

    // G6, rings where 2 is not inert: norm forms a^2 + b^2 (Z[i]) and a^2 + ab + 2 b^2 (Z[(1 + sqrt -7) / 2])
    const hasOddTwo = (form: (x: number, y: number) => number): boolean => {
      for (let x = -4; x <= 4; x++) {
        for (let y = -4; y <= 4; y++) {
          const n = form(x, y)

          if (n > 0 && n % 2 === 0 && (n / 2) % 2 === 1) {
            return true
          }
        }
      }

      return false
    }
    const gaussian = hasOddTwo((x, y) => x * x + y * y)
    const sqrtMinus7 = hasOddTwo((x, y) => x * x + x * y + 2 * y * y)
    const eisenstein = hasOddTwo((x, y) => x * x - x * y + y * y)
    const g6 = gaussian && sqrtMinus7 && !eisenstein

    const rest = g1 && g2 && g3 && g4 && g6
    const status = rest ? (g5 ? 'pass' : 'partial') : 'fail'
    const metrics: Record<string, number> = {
      cliffordElements: group.length,
      cliffordUnitaryWorst: unitaryWorst,
      cliffordMaxThreePower: maxDen3,
      cliffordOnModelGridMovesConventionA: matched[0] ?? 0,
      cliffordOnModelGridMovesConventionB: matched[1] ?? 0,
      swapPhaseGap: swapGap,
      singletPhaseGap: singletGap,
      lineCoinGap: coinGap,
      normsWithOddTwo: oddTwo,
      normsTwoModFour: twoModFour,
    }

    homRuns.forEach(r => {
      const tag = `hom_w${r.width}t${r.beats}`

      metrics[`${tag}_runs`] = r.runs
      metrics[`${tag}_fineDips`] = r.fineDips
      metrics[`${tag}_coarseDips`] = r.coarseDips
      metrics[`${tag}_bestVisibility`] = r.bestVisibility
    })
    ;[
      ['like', like],
      ['loveFear', loveFear],
    ].forEach(([name, levels]) => {
      ;(levels as Level[]).forEach((l, k) => {
        metrics[`${name}_meetings${k + 1}_states`] = l.states
        metrics[`${name}_meetings${k + 1}_bestChsh`] = l.best
        metrics[`${name}_meetings${k + 1}_gapToTsirelson`] = TSIRELSON - l.best
        metrics[`${name}_meetings${k + 1}_halfHalfStates`] = l.halfHalf
        metrics[`${name}_meetings${k + 1}_twoInDenominator`] = l.twoInDenominator
      })
    })

    return verdict({
      status,
      claim:
        'the model\'s generators have every entry in Z[omega][1/6] (links in Z[omega][1/3], like meetings bring the 1/2, love-fear meetings only 1/3), 2 is inert in Z[omega], so no single amplitude of any word has |x|^2 = 1/2: no 50:50 split and no fine-grained full Hong-Ou-Mandel dip in any combination of modes (line words to width 4 never pass visibility 3/5), and a love-fear knot never reaches CHSH = 2 sqrt 2 (its Schmidt weights lie in Z[1/3]) while approaching it (gap 0.28, 0.047, 0.003 at one, two, three meetings); but the ring argument does not bind like pairs, and three swap-phase meetings reach Schmidt (1/2, 1/2, 0) and CHSH = 2 sqrt 2 exactly, so the hypothesis holds for splitters and love-fear knots and fails for like knots',
      metrics: {
        ...metrics,
        ...Object.fromEntries(Object.entries({ G1: g1, G2: g2, G3: g3, G4: g4, G5: g5, G6: g6 }).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      control: {
        gaussianRingHasNormTwiceOdd: gaussian ? 1 : 0,
        sqrtMinus7RingHasNormTwiceOdd: sqrtMinus7 ? 1 : 0,
        eisensteinRingHasNormTwiceOdd: eisenstein ? 1 : 0,
      },
      notes:
        'L1, exact. FIRST RUN (2026-09-26, 17 s): G1, G2, G3, G4, G6 pass, G5 fails as disclosed before the gates, status partial. Later runs only replaced two constant control entries with the computed G6 parts, reworded these notes and relabeled the depth L1 (no gate and no number changed). THE ONE LINK: the prime 2 is inert in Z[omega], so a single Eisenstein amplitude never carries |x|^2 = 1/2. That one fact is the 1:3 splitter (|1 + omega|^2 / 4 = 1/4), the Hong-Ou-Mandel visibility 3/5 = 2 R T / (R^2 + T^2) at R = 1/4, and the one-meeting CHSH sqrt 7: a single swap phase on ANY product |a>|b> (overlap c) gives Schmidt product l1 l2 = (3/16)(1 - |c|^2)^2 <= 3/16, so one meeting is at most (3/4, 1/4) and sqrt 7, derived here and met at depth 1 over the 12 stabilizer starts. What decides the rest is WHETHER 2 ENTERS THE DENOMINATORS. A love-fear knot only ever divides by 3 (0 of 399,744 enumerated states carry a 2), so its Schmidt weights are roots of a monic cubic with coefficients in Z[1/3], any rational one lies in Z[1/3], and 1/2 is out forever: CHSH approaches 2 sqrt 2 (gaps 0.276, 0.047, 0.0030 at one to three meetings, each step shrinking it 6 to 15 fold) and never reaches it. A like knot divides by 2 at every meeting, and a Schmidt weight is an eigenvalue, a SUM of norms, not one norm: at three meetings 27 of 223,056 distinct states sit at (1/2, 1/2, 0) exactly (E-QTM-0133). The Hong-Ou-Mandel line words never beat 3/5 and make no coarse dip either (0 in 411,632 runs), which the theorem does not forbid (a coarse dip needs only a SUM of norms at 1/2); a balanced line splitter needs a ring where 2 is not inert, Z[i] (so Z[omega, i] = Z[zeta_12]) or Z[(1 + sqrt -7) / 2] or sqrt 2, which the model lacks. The E-QTM-0112 reach search saw 2.8174 at three meetings because it merged states by sorted grid weights, which lost the exact ones. No numerical coincidence is claimed: every value here is exact and derived, so the E-MTH-0010 null is not engaged.',
    })
  },
})
