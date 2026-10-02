// THE TEMPORAL LADDER (E-QTM-0173, OPEN-QTM-08, routes file quantum-relativity-light-computation.md, the row "the
// temporal ladder" under Leggett-Garg). One meeting's spatial Bell values fall on exact rungs, 2, 4 / sqrt 3 and
// sqrt 7 (E-QTM-0140). The row asks whether temporal CHSH values on one vibe and on the role, over schedules, fall on
// the same rungs, which would tie both to Z[w] arithmetic. Its kill, which the row itself calls weak: temporal values
// off the ladder.
//
// WHAT IS RUN. A temporal CHSH test reads one object twice: at the first time with one of two settings A0, A1, at the
// second with one of B0, B1, and S = C00 + C01 + C10 - C11 with C the two-time correlator of the outcomes. A reading
// that keeps its outcome's projector P_k and the value q_k makes C(A, B) = Tr(rho R_A(B)), R_A(B) = sum_k q_k P_k B P_k
// (code/measure/leggett-garg-exact readOut), so for given settings the largest S over all states is the top
// eigenvalue of K = R_A0(B0 + B1) + R_A1(B0 - B1).
//  THE ROLE (E-QTM-0164's readings): Q = the 2 pi turn's sign about a point (-1 on the doublet, +1 on the odd line).
//   A link moves the role by a local Clifford, and one beat reaches every one of the 216 (mod phase), so a schedule is
//   a choice of Clifford frame for each reading, and the readings over all schedules are the Clifford images of two
//   base readings: Luders (the doublet kept whole, 9 images) and the lock's slot reading (the doublet's two pi-turn
//   eigenlines and the odd line, values -1, -1, +1, 27 images). The second reading's observable is one of the 9 images
//   of Q. Every quadruple with A0 fixed to one representative per orbit of the group (a common Clifford leaves the
//   spectrum of K unchanged) and A1, B0, B1 free: 729 Luders, 2,187 slot and 5,832 mixed operators, each 3 x 3 over
//   Z[zeta_12], top eigenvalue and characteristic polynomial exact.
//  THE LONE VIBE (the fear walk, the rule's lone vibe by E-QTM-0157): Q = its slot (+1 right moving, -1 left), read by
//   the slot-marking Luders reading (E-QTM-0164). Settings are reading times: A0, A1 at beats a0 != a1, B0, B1 at
//   b0 != b1, every a before every b, beats 1 to 12, from each slot: 3,960 quadruples; C is a whole number over 4^b,
//   so S is rational, and |S| is taken (the forms with three minus signs).
//
// DERIVED BEFORE THE GATE RUN.
// 1. The vibe's values are rational, so the only rung they can meet is 2: 4 / sqrt 3 and sqrt 7 are irrational.
// 2. Rung tests, exact: K's top eigenvalue equals r = (p + q sqrt 3) / s when r den - N is positive semidefinite and
//    singular (code/measure/leggett-garg-exact topAtMost), which decides 2 and 4 / sqrt 3 = 4 sqrt 3 / 3. sqrt 7 is
//    not in Q(sqrt 3), so it is a root of the numerator's characteristic polynomial x^3 + c2 x^2 + c1 x + c0 (c_i in
//    Q(sqrt 3), roots den times K's) at x = sqrt 7 den exactly when c1 = -7 den^2 and c0 = -7 den^2 c2; it is then the
//    top when the third root -c2 is at most sqrt 7 den.
// 3. Bounds: a macrorealist object gives |S| <= 2; Luders readings give at most 2 sqrt 2 in any dimension (Fritz 2010,
//    the temporal Tsirelson bound); the slot reading is not Luders and is not bounded by it.
//
// PROBES BEFORE THE GATES, DISCLOSED. tmp/tl-probe1.ts with tmp/tl-core.ts (the same sweeps, 3 s): the vibe's |S| tops
//  out at 407/256 = 1.590 (right slot, beats 1, 3 then 6, 4), never 2; the dephased twin 7/8. The role: 9 Luders
//  images, 27 slot images, 9 observables. Above 2: Luders values 2.2485 and 2.4714 only, neither 4 / sqrt 3 = 2.3094
//  nor sqrt 7 = 2.6458; the slot reading 12 values from 2.0624 to 2.75; mixed 21; 2 itself on many quadruples. So the
//  outcome of P1 below was seen before the gates were written.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: every reading is exact (projectors idempotent, mutually orthogonal, summing to 1; 9 Luders, 27 slot
//     images, 9 observables, each squaring to 1); every Luders role operator has top eigenvalue at most 2 sqrt 2 (to
//     1e-12, from the exact polynomial) and every role operator at most 3 exactly; the vibe's S^2 <= 8 on every
//     quadruple exactly.
//  C1 CONTROL (the tests read every outcome): planted operators with top eigenvalue sqrt 7 (diag block [[2, sqrt 3],
//     [sqrt 3, -2]]), 4 / sqrt 3, 2 and 5/2 are classified as sqrt 7, 4 / sqrt 3, 2 and off the ladder; and the
//     vibe's dephased twin (its own one-beat chances as a Markov chain, a macrorealist control) gives |S| <= 2 on every
//     quadruple.
//  H1 THE ROUTE: some temporal value exceeds 2, and every value above 2 (vibe and role, all readings) is a rung,
//     4 / sqrt 3 or sqrt 7 exactly.
//  P1 THE KILL (the row's own): some temporal value above 2 is off the ladder.
// VERDICT, fixed before the run: FAIL if I1 or C1 fails (the instrument); PASS if H1 holds; FAIL as predicted if P1
//  fires; PARTIAL otherwise (no value above 2 at all). Predicted from the probe: P1 fires on the role (Luders values
//  2.2485 and 2.4714), and the vibe never exceeds 2.
// REPORTED, NOT GATED: the distinct values above 2 per reading family with counts and polynomials; how many operators
//  sit exactly on 2; the vibe's best quadruple.
// WHAT THIS CAN AND CANNOT SHOW. The state is maximized over all states of the role (a top eigenvalue), not drawn
//  from the rule; the schedules are every Clifford frame, which one beat reaches, not a history the mesh runs. The
//  vibe's settings are reading times on its line. A fail says the temporal values of these readings are not the
//  spatial rungs; the row itself marks the link to the ladder as the speculative part.
//
// FIRST RUN 2026-10-02 (tmp/tl-run1.log, 2 s): FAIL as predicted, I1 and C1 held, H1 failed, P1 fired, no gate moved,
//  title written after the run. The vibe's |S| tops out at 407/256 = 1.5898 (right slot, beats 1, 3 then 6, 4) over
//  3,960 quadruples, never 2 (the twin 7/8). The role: 9 Luders, 27 slot readings, 9 observables, all exact; every
//  Luders value at most 2 sqrt 2. Above 2 there are 20 distinct values in all (the metric valuesAbove2Distinct, 33,
//  counts the mixed family's values again under Luders and slot): Luders 2 (2.2485, a root of 4 x^3 - 18 x - 5, on 96
//  operators, and 2.4714, a root of 8 x^3 - 24 x^2 + 6 x + 11, on 144), slot 11 (2.0624 to 2.75 = 11/4), 7 more from
//  mixed readings. None is 4 / sqrt 3 or sqrt 7; 2 itself is reached on 249, 67 and 1,016 operators. Read after the
//  run: the top Luders value is exactly 1 plus E-QTM-0164's Luders K3 maximum 1.4714 (substituting x = 1 + y in its
//  polynomial gives this one), and the slot value 2.6124 is 1 plus its slot maximum 1 + sqrt 6 / 4. So the temporal
//  values follow the readings' own arithmetic, not the spatial rungs.
//
// Depth L1: exact enumeration over Z[zeta_12] and exact rationals; floats only in reported values. Deterministic.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  FEAR_COIN,
  walkStart,
  type ChanceState,
} from '@/code/rule/fear-walk'
import { cliffordGroup } from '@/code/measure/eisenstein-words'
import {
  cycAdd,
  cycCharPoly,
  cycEqual,
  cycMul,
  cycScale,
  cycTimesElement,
  type CycMatrix,
} from '@/code/algebra/cyclotomic'
import {
  RING12,
  SQRT3,
  conjugateBy,
  fromMat3,
  identity3,
  parity,
  readOut,
  realParts,
  signSqrt3,
  topAtMost,
  topEigenvalue,
  twinCorrelator,
  walkCorrelator,
  type Rational,
  type Reading,
} from '@/code/measure/leggett-garg-exact'

const CELLS = 32
const LAST_BEAT = 12
const TSIRELSON = 2 * Math.SQRT2

const matrixKey = (m: CycMatrix): string =>
  `${m.den}|${m.entries.map(e => e.join(',')).join(';')}`

const isProjector = (p: CycMatrix): boolean =>
  cycEqual(RING12, cycMul(RING12, p, p), p)

function trace(m: CycMatrix): { a: bigint; b: bigint; den: bigint } {
  let t = RING12.zero()

  for (let i = 0; i < 3; i++) {
    t = RING12.add(t, m.entries[4 * i]!)
  }

  return { ...realParts(t), den: m.den }
}

const zero3 = (): CycMatrix => cycScale(identity3(), 0n)

// the lock's slot readings about the origin (E-QTM-0164 slotReadings): for every pi turn M, P_± = Pi_d (1 ∓ i conj(c)
// M) / 2, c M's eigenvalue on the odd line
function slotReadings(
  group: readonly CycMatrix[],
  doublet: CycMatrix,
  odd: CycMatrix,
  p: CycMatrix,
): Reading[] {
  const seen = new Set<string>()
  const readings: Reading[] = []

  for (const m of group) {
    const square = cycMul(RING12, m, m)
    const lead = square.entries[0]!

    if (RING12.isZero(lead)) {
      continue
    }

    const scaledP = cycTimesElement(
      RING12,
      { ...p, den: square.den },
      lead,
    )

    if (!cycEqual(RING12, square, scaledP)) {
      continue
    }

    const e = m.entries
    const cNum = RING12.sub(
      RING12.add(e[4]!, e[8]!),
      RING12.add(e[5]!, e[7]!),
    )
    const cDen = 2n * m.den
    const factor = RING12.mul(RING12.root(3), RING12.conj(cNum))
    const turned: CycMatrix = {
      n: 3,
      entries: m.entries.map(x => RING12.mul(factor, x)),
      den: cDen * m.den,
    }
    const plus = cycScale(
      cycMul(RING12, doublet, cycAdd(RING12, identity3(), turned, -1n)),
      1n,
      2n,
    )
    const minus = cycScale(
      cycMul(RING12, doublet, cycAdd(RING12, identity3(), turned)),
      1n,
      2n,
    )
    const pair = [matrixKey(plus), matrixKey(minus)].sort().join('#')

    if (seen.has(pair)) {
      continue
    }

    const unit = RING12.equal(
      RING12.mul(cNum, RING12.conj(cNum)),
      RING12.scale(RING12.one(), cDen * cDen),
    )
    const rankOne = [plus, minus].every(x => {
      const t = trace(x)

      return t.b === 0n && t.a === t.den
    })
    const ok =
      unit &&
      isProjector(plus) &&
      isProjector(minus) &&
      rankOne &&
      cycEqual(RING12, cycAdd(RING12, plus, minus), doublet) &&
      cycEqual(RING12, cycMul(RING12, plus, minus), zero3())

    if (ok) {
      seen.add(pair)
      readings.push({
        projectors: [plus, minus, odd],
        values: [-1n, -1n, 1n],
      })
    }
  }

  return readings
}

const readingKey = (r: Reading): string =>
  r.projectors
    .map((p, i) => `${r.values[i]}:${matrixKey(p)}`)
    .sort()
    .join('#')

const rotate = (g: CycMatrix, r: Reading): Reading => ({
  projectors: r.projectors.map(p => conjugateBy(g, p)),
  values: r.values,
})

// a reading is exact: idempotent, mutually orthogonal projectors summing to 1
function readingExact(r: Reading): boolean {
  let sum = zero3()

  for (let i = 0; i < r.projectors.length; i++) {
    const p = r.projectors[i]!

    if (!isProjector(p)) {
      return false
    }

    for (let j = i + 1; j < r.projectors.length; j++) {
      if (
        !cycEqual(RING12, cycMul(RING12, p, r.projectors[j]!), zero3())
      ) {
        return false
      }
    }

    sum = cycAdd(RING12, sum, p)
  }

  return cycEqual(RING12, sum, identity3())
}

type Rung = 'two' | 'mid' | 'top' | 'off' | 'below'

type Classified = { rung: Rung; value: number; poly: string }

// the exact rung of K's top eigenvalue (point 2)
function classify(k: CycMatrix): Classified {
  const two = topAtMost(k, { p: 2n, q: 0n, s: 1n })
  const c = cycCharPoly(RING12, k).map(x => realParts(x))
  const poly = `${c
    .map(
      x =>
        `${x.a}${x.b !== 0n ? `${x.b > 0n ? '+' : ''}${x.b}r3` : ''}`,
    )
    .join(';')} over ${k.den}`
  const value = topEigenvalue(k)

  if (two.atMost) {
    return { rung: two.equal ? 'two' : 'below', value, poly }
  }

  if (topAtMost(k, { p: 0n, q: 4n, s: 3n }).equal) {
    return { rung: 'mid', value, poly }
  }

  const d2 = 7n * k.den * k.den
  const [c0, c1, c2] = c as [
    { a: bigint; b: bigint },
    { a: bigint; b: bigint },
    { a: bigint; b: bigint },
  ]

  if (
    c1.a === -d2 &&
    c1.b === 0n &&
    c0.a === -d2 * c2.a &&
    c0.b === -d2 * c2.b
  ) {
    const ra = -c2.a
    const rb = -c2.b
    const third =
      signSqrt3(ra, rb) <= 0 ||
      signSqrt3(d2 - ra * ra - 3n * rb * rb, -2n * ra * rb) >= 0

    if (third) {
      return { rung: 'top', value, poly }
    }
  }

  return { rung: 'off', value, poly }
}

const chshOperator = (
  a0: Reading,
  a1: Reading,
  b0: CycMatrix,
  b1: CycMatrix,
): CycMatrix =>
  cycAdd(
    RING12,
    readOut(a0, cycAdd(RING12, b0, b1)),
    readOut(a1, cycAdd(RING12, b0, b1, -1n)),
  )

type RoleFamily = {
  name: string
  operators: number
  values: Map<string, { count: number; c: Classified }>
  atTwo: number
  luders: boolean
  tsirelsonOk: boolean
  atMostThree: boolean
}

function roleFamily(
  name: string,
  reps: readonly Reading[],
  list: readonly Reading[],
  obs: readonly CycMatrix[],
  luders: boolean,
): RoleFamily {
  const out: RoleFamily = {
    name,
    operators: 0,
    values: new Map(),
    atTwo: 0,
    luders,
    tsirelsonOk: true,
    atMostThree: true,
  }

  for (const a0 of reps) {
    for (const a1 of list) {
      for (const b0 of obs) {
        for (const b1 of obs) {
          const k = chshOperator(a0, a1, b0, b1)
          const c = classify(k)

          out.operators++
          out.atMostThree &&= topAtMost(k, {
            p: 3n,
            q: 0n,
            s: 1n,
          }).atMost

          if (luders) {
            out.tsirelsonOk &&= c.value <= TSIRELSON + 1e-12
          }

          if (c.rung === 'two') {
            out.atTwo++
          }

          if (c.rung === 'below' || c.rung === 'two') {
            continue
          }

          const key = c.value.toFixed(9)
          const e = out.values.get(key)

          if (e) {
            e.count++
          } else {
            out.values.set(key, { count: 1, c })
          }
        }
      }
    }
  }

  return out
}

type VibeSweep = {
  quadruples: number
  best: Rational
  bestAt: number[]
  over2: number
  at2: number
  overTsirelson: number
}

function vibeSweep(
  corr: (right: boolean, ta: number, tb: number) => Rational,
): VibeSweep {
  const den = 4n ** BigInt(LAST_BEAT)
  const cache = new Map<string, Rational>()

  const at = (s: boolean, a: number, b: number): bigint => {
    const key = `${s}|${a}|${b}`

    let v = cache.get(key)

    if (!v) {
      v = corr(s, a, b)
      cache.set(key, v)
    }

    return v.num * (den / v.den)
  }

  const out: VibeSweep = {
    quadruples: 0,
    best: { num: 0n, den },
    bestAt: [],
    over2: 0,
    at2: 0,
    overTsirelson: 0,
  }

  for (const s of [true, false]) {
    for (let a0 = 1; a0 <= LAST_BEAT; a0++) {
      for (let a1 = 1; a1 <= LAST_BEAT; a1++) {
        if (a1 === a0) {
          continue
        }

        for (let b0 = Math.max(a0, a1) + 1; b0 <= LAST_BEAT; b0++) {
          for (let b1 = Math.max(a0, a1) + 1; b1 <= LAST_BEAT; b1++) {
            if (b1 === b0) {
              continue
            }

            const num =
              at(s, a0, b0) +
              at(s, a0, b1) +
              at(s, a1, b0) -
              at(s, a1, b1)
            const abs = num < 0n ? -num : num

            out.quadruples++
            out.over2 += abs > 2n * den ? 1 : 0
            out.at2 += abs === 2n * den ? 1 : 0
            out.overTsirelson += abs * abs > 8n * den * den ? 1 : 0

            if (abs > out.best.num) {
              out.best = { num: abs, den }
              out.bestAt = [s ? 0 : 1, a0, a1, b0, b1]
            }
          }
        }
      }
    }
  }

  return out
}

const vibeCorrelator = (
  right: boolean,
  ta: number,
  tb: number,
): Rational =>
  walkCorrelator(walkStart(CELLS, CELLS / 2, right), FEAR_COIN, ta, tb)

const twinCorrelatorFrom = (
  right: boolean,
  ta: number,
  tb: number,
): Rational => {
  const start: ChanceState = {
    right: Array.from({ length: CELLS }, (_, x) =>
      x === CELLS / 2 && right ? 1n : 0n,
    ),
    left: Array.from({ length: CELLS }, (_, x) =>
      x === CELLS / 2 && !right ? 1n : 0n,
    ),
  }

  return twinCorrelator(start, ta, tb)
}

// planted operators for C1, as diagonal or block matrices over Z[zeta_12]
function planted(): { name: string; k: CycMatrix; want: Rung }[] {
  const z = RING12.zero()
  const n = (v: bigint) => RING12.scale(RING12.one(), v)
  const negSqrt3 = RING12.scale(SQRT3, -1n)

  return [
    {
      name: 'sqrt7',
      k: {
        n: 3,
        entries: [n(2n), SQRT3, z, SQRT3, n(-2n), z, z, z, z],
        den: 1n,
      },
      want: 'top',
    },
    {
      name: 'mid',
      k: {
        n: 3,
        entries: [RING12.scale(SQRT3, 4n), z, z, z, z, z, z, z, z],
        den: 3n,
      },
      want: 'mid',
    },
    {
      name: 'two',
      k: {
        n: 3,
        entries: [n(2n), z, z, z, n(1n), z, z, z, z],
        den: 1n,
      },
      want: 'two',
    },
    {
      name: 'off',
      k: {
        n: 3,
        entries: [n(5n), z, z, z, negSqrt3, z, z, z, z],
        den: 2n,
      },
      want: 'off',
    },
  ]
}

export default experiment({
  id: 'quantum/temporal-ladder',
  code: 'E-QTM-0173',
  title:
    'temporal CHSH values are not on the spatial ladder, fail as predicted: over every Clifford schedule the role reaches 20 distinct values above 2 (Luders 2.2485 and 2.4714 = 1 + 1.4714, the Luders K3 maximum of E-QTM-0164; slot readings up to 11/4), none of them 4 / sqrt 3 or sqrt 7 by exact test, and 2 itself on many schedules; the lone vibe never exceeds 2 (best 407/256 over 3,960 time quadruples, rational, so it could meet no rung above 2)',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )

    // the vibe
    const vibe = vibeSweep(vibeCorrelator)
    const twin = vibeSweep(twinCorrelatorFrom)

    log('vibe')

    // the role
    const group = cliffordGroup().map(fromMat3)
    const p = parity()
    const q = cycScale(p, -1n)
    const doublet = cycScale(cycAdd(RING12, identity3(), p), 1n, 2n)
    const odd = cycScale(cycAdd(RING12, identity3(), p, -1n), 1n, 2n)
    const luders: Reading = {
      projectors: [doublet, odd],
      values: [-1n, 1n],
    }

    const collect = (base: readonly Reading[]): Reading[] => {
      const m = new Map<string, Reading>()

      for (const r of base) {
        for (const g of group) {
          const x = rotate(g, r)

          m.set(readingKey(x), x)
        }
      }

      return [...m.values()]
    }

    const representatives = (list: readonly Reading[]): Reading[] => {
      const done = new Set<string>()
      const out: Reading[] = []

      for (const r of list) {
        if (done.has(readingKey(r))) {
          continue
        }

        out.push(r)

        for (const g of group) {
          done.add(readingKey(rotate(g, r)))
        }
      }

      return out
    }

    const ludList = collect([luders])
    const slotList = collect(slotReadings(group, doublet, odd, p))
    const obsMap = new Map<string, CycMatrix>()

    for (const g of group) {
      const x = conjugateBy(g, q)

      obsMap.set(matrixKey(x), x)
    }

    const obs = [...obsMap.values()]
    const readingsExact =
      ludList.length === 9 &&
      slotList.length === 27 &&
      obs.length === 9 &&
      [...ludList, ...slotList].every(readingExact) &&
      obs.every(o =>
        cycEqual(RING12, cycMul(RING12, o, o), identity3()),
      )
    const mixedList = [...ludList, ...slotList]
    const families = [
      roleFamily(
        'luders',
        representatives(ludList),
        ludList,
        obs,
        true,
      ),
      roleFamily(
        'slot',
        representatives(slotList),
        slotList,
        obs,
        false,
      ),
      roleFamily(
        'mixed',
        representatives(mixedList),
        mixedList,
        obs,
        false,
      ),
    ]

    log('role')

    const plants = planted().map(x => ({
      ...x,
      got: classify(x.k).rung,
    }))
    const above2 = families.flatMap(f =>
      [...f.values.values()].map(v => ({ family: f.name, ...v })),
    )
    const offLadder = above2.filter(v => v.c.rung === 'off')
    const onRung = above2.filter(
      v => v.c.rung === 'mid' || v.c.rung === 'top',
    )
    const anyAbove2 = above2.length > 0 || vibe.over2 > 0
    const g = {
      I1:
        readingsExact &&
        families.every(f => f.tsirelsonOk && f.atMostThree) &&
        vibe.overTsirelson === 0,
      C1: plants.every(x => x.got === x.want) && twin.over2 === 0,
      H1: anyAbove2 && offLadder.length === 0,
      P1: offLadder.length > 0,
    }
    const status =
      !g.I1 || !g.C1
        ? 'fail'
        : g.H1
          ? 'pass'
          : g.P1
            ? 'fail'
            : 'partial'
    const seconds = (Date.now() - started) / 1000
    const value = (r: Rational): number => Number(r.num) / Number(r.den)
    const metrics: Record<string, number> = {
      vibeQuadruples: vibe.quadruples,
      vibeBest: value(vibe.best),
      vibeOver2: vibe.over2,
      vibeAt2: vibe.at2,
      twinBest: value(twin.best),
      twinOver2: twin.over2,
      ludersReadings: ludList.length,
      slotReadings: slotList.length,
      observables: obs.length,
      valuesAbove2Distinct: above2.length,
      valuesOffLadder: offLadder.length,
      valuesOnRung: onRung.length,
      seconds,
    }

    for (const f of families) {
      const vals = [...f.values.values()]

      metrics[`${f.name}_operators`] = f.operators
      metrics[`${f.name}_atTwo`] = f.atTwo
      metrics[`${f.name}_distinctAbove2`] = vals.length
      metrics[`${f.name}_offLadder`] = vals.filter(
        v => v.c.rung === 'off',
      ).length

      metrics[`${f.name}_max`] = Math.max(
        2,
        ...vals.map(v => v.c.value),
      )
    }

    for (const [k, v] of Object.entries(g)) {
      metrics[`gate_${k}`] = v ? 1 : 0
    }

    const listing = families
      .map(
        f =>
          `${f.name} (${f.operators} operators, ${f.atTwo} at 2): ${[
            ...f.values.entries(),
          ]
            .sort()
            .map(
              ([k, v]) => `${k} x${v.count} ${v.c.rung} [${v.c.poly}]`,
            )
            .join(', ')}`,
      )
      .join(' | ')

    return verdict({
      status,
      claim: `temporal CHSH on the lone vibe never exceeds 2 (best ${value(vibe.best).toFixed(6)} over ${vibe.quadruples} time quadruples, rational); on the role ${above2.length} distinct values exceed 2 over every Clifford schedule (Luders ${metrics.luders_distinctAbove2}, slot ${metrics.slot_distinctAbove2}, mixed ${metrics.mixed_distinctAbove2}), of which ${onRung.length} are a spatial rung (4 / sqrt 3 or sqrt 7) and ${offLadder.length} are off the ladder; largest ${Math.max(metrics.luders_max!, metrics.slot_max!, metrics.mixed_max!).toFixed(6)}`,
      metrics,
      control: {
        plantedClassified: plants.filter(x => x.got === x.want).length,
        twinOver2: twin.over2,
      },
      notes: `L1. Gates ${Object.entries(g)
        .map(([k, v]) => `${k} ${v}`)
        .join(
          ', ',
        )}. Vibe best quadruple [slot, a0, a1, b0, b1] ${vibe.bestAt.join(',')} = ${vibe.best.num}/${vibe.best.den}. Planted: ${plants.map(x => `${x.name} ${x.got}`).join(', ')}. Values above 2: ${listing}. ${seconds.toFixed(0)} s.`,
    })
  },
})
