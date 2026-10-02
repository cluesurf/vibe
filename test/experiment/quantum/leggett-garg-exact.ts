// Leggett-Garg K3 enumerated exactly on the lone vibe and on the role (E-QTM-0164).
//
// The ledger's Leggett-Garg row is a stand-in: E-QTM-0015 is a textbook qubit in floats. The routes map (A,
// Leggett-Garg) asks for K3 = C12 + C23 - C13 on two objects of the rule, exactly, and for the beyond-Luders
// version the role's 2 + 1 split makes native. Compute in code/measure/leggett-garg-exact.
//
// 1. THE LONE VIBE. On its line the working rule's lone vibe is the fear walk bit for bit (E-QTM-0157: on
//    trivial links to beat 16, on every one of the 17 starts' links to beat 7). Q = which slot (+1 right
//    moving, -1 left moving), read by an ideal reading that marks the slot only (Luders: the cell amplitudes
//    are kept), the reading E-QTM-0159's marker makes. Every triple 1 <= t1 < t2 < t3 <= 12 (220), from each
//    slot, on a ring of 32 cells (no wrap by beat 12). Joint chances are whole numbers over 4^t, K3 exact.
// 2. THE ROLE. Q = the 2 pi turn's sign about a point: -1 on the doublet, +1 on the odd line (Q = -A(0)),
//    a dichotomic Q with a 2 + 1 split. Between readings a link moves the role by a Clifford element (any of
//    Sigma(648) is one link, so one beat reaches every element, and schedules to beat 12 add nothing). Two
//    readings: Luders (the doublet kept whole) and the lock's slot reading (the doublet's two eigenlines of a
//    pi turn, the line's two slots, and the odd line, the rest state), the beyond-Luders scheme. Every pair
//    (g, h) of the 216 elements (mod phases), every axis; the largest K3 over all states is the top eigenvalue
//    of K = R(Q_g) + g^dagger R(Q_h) g - R(Q_hg), decided against thresholds exactly over Q(sqrt 3).
//
// KNOWN BOUNDS: macrorealism K3 <= 1 (Leggett and Garg 1985); Luders K3 <= 3/2 in every dimension (Fritz 2010,
// Budroni and Emary 2014); a qutrit read by a von Neumann (three-line) reading reaches 2.1547 over all
// unitaries (Budroni and Emary 2014, PRL 113, 050401, Table I, N = M = 3, a numerical maximum; it agrees with
// 1 + 2 / sqrt 3 to its printed digits), and a precessing spin 1 reaches 1.7565.
//
// HYPOTHESES, written before the first run:
//   HV  the lone vibe violates macrorealism: K3 > 1 on some triple from some slot
//   PV  falsifier (the route's kill): K3 <= 1 on every triple and both slots
//   HL  the role under Luders readings: K3 > 1 somewhere
//   HB  the role under the slot reading exceeds the Luders bound: K3 > 3/2 somewhere
//   PB  falsifier: K3 <= 3/2 on every schedule and axis
// GATES (instrument), fixed before the first run:
//   G1 the Luders bound: K3 <= 3/2 on every walk triple and every Luders role schedule, exactly
//   G2 the walk with the coin STAY (no hop): K3 = 1 exactly on every triple; with HOP: K3 <= 1
//   G3 the dephased twin (the walk's own keep 1/4, reverse 3/4 as a Markov chain): K3 <= 1 on every triple
//   G4 the role, slot reading, with both links drawn from the subgroup that permutes the reading's three
//      lines (a classical device): K3 <= 1 exactly
//   G5 the readings are exact: P_+ + P_- = the doublet projector, each P idempotent and rank one, P_+ P_- = 0
//   G6 no role schedule exceeds 2.1547 + 1e-4 (Budroni and Emary's numerical qutrit maximum)
// Verdict: fail if G1 to G6 fail; pass if HV and HB hold; partial if one of them holds; fail otherwise.
// Reported, not gated: the largest K3 and its triple, the count of triples above 1, the same restricted to
// t3 <= 7 (where E-QTM-0157 holds the walk on every start's links), the finer cell-and-slot reading on the walk,
// the largest change of a marginal by an earlier reading (no signaling in time), the stabilizer states' largest
// K3 on the role, and the exact characteristic polynomial of the best role K.
//
// FIRST RUN, 2026-10-01 (tmp/qx-lg-run1.log, 4 s): partial. Every gate held. HV failed and PV was met: the
// vibe's K3 tops out at 23/32 (right slot, beats 1, 3, 5), 0 of 440 triples above 1, and the finer cell-and-slot
// reading gives the same numbers. HL and HB held: the role reads 1.4714 under Luders readings (K = N / 2, N a
// root of x^3 - 9 x + 1) and exactly 1 + sqrt 6 / 4 under the slot reading (N / 4 with N = 4 + sqrt 6, from
// (x - 4)(x^2 - 8 x + 10)), on 9,216 schedules; from a stabilizer state the slot reading reaches exactly 3/2.
// The three readings found are the three pi-turn axes; the classical subgroup has 8 elements.
// AFTER THE FIRST RUN, disclosed: the other three Leggett-Garg forms (Q relabeled at one time: -C12 + C23 + C13,
// -C12 - C23 - C13, C12 - C23 + C13, each <= 1 under macrorealism) were added as reported, ungated metrics
// (runs 2 and 3). The vibe reaches 19/16 in them on 72 of 1,320 form-triples, the dephased twin 3/4; the role
// reaches 7/4 exactly under the slot reading ((x - 7)(x - 1)(x - 4) over 4) and exactly the Luders bound 3/2
// under Luders readings ((x - 3)^2 (x + 6) over 2), never above it. The verdict stays on the registered form.
//
// DETERMINISM: everything is enumerated, nothing random. Depth L2: a known temporal-correlation result measured
// on the rule's lone vibe (through E-QTM-0157's identity) and on the role's own readings and links, with
// computed classical controls.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  FEAR_COIN,
  HOP_COIN,
  STAY_COIN,
  walkStart,
  type ChanceState,
  type Coin,
} from '@/code/rule/fear-walk'
import { cliffordGroup } from '@/code/measure/eisenstein-words'
import {
  cycAdd,
  cycAdjoint,
  cycCharPoly,
  cycEqual,
  cycMul,
  cycScale,
  cycTimesElement,
  type CycMatrix,
} from '@/code/algebra/cyclotomic'
import {
  RING12,
  conjugateBy,
  expectation,
  fromMat3,
  identity3,
  k3,
  parity,
  readOut,
  realParts,
  signSqrt3,
  topAtMost,
  topEigenvalue,
  twinCorrelator,
  walkCorrelator,
  walkCorrelatorFine,
  walkMarginals,
  type Rational,
  type Reading,
} from '@/code/measure/leggett-garg-exact'

const CELLS = 32
const LAST_BEAT = 12
const E1_BEATS = 7
const BUDRONI_EMARY_QUTRIT = 2.1547

const above = (r: Rational, p: bigint, q: bigint): boolean =>
  r.num * q > p * r.den
const value = (r: Rational): number => Number(r.num) / Number(r.den)

type WalkSweep = {
  best: Rational
  bestTriple: number[]
  overOne: number
  overOneEarly: number
  overLuders: number
  worstFromOne: Rational
  allOne: boolean
  atMostOne: boolean
  otherBest: Rational
  otherOverOne: number
}

function triples(): number[][] {
  const out: number[][] = []

  for (let a = 1; a <= LAST_BEAT; a++) {
    for (let b = a + 1; b <= LAST_BEAT; b++) {
      for (let c = b + 1; c <= LAST_BEAT; c++) {
        out.push([a, b, c])
      }
    }
  }

  return out
}

function sweep(
  correlator: (start: number, ti: number, tj: number) => Rational,
): WalkSweep {
  const out: WalkSweep = {
    best: { num: -3n, den: 1n },
    bestTriple: [],
    overOne: 0,
    overOneEarly: 0,
    overLuders: 0,
    worstFromOne: { num: 0n, den: 1n },
    allOne: true,
    atMostOne: true,
    otherBest: { num: -3n, den: 1n },
    otherOverOne: 0,
  }

  for (const start of [0, 1]) {
    for (const [a = 0, b = 0, c = 0] of triples()) {
      const c12 = correlator(start, a, b)
      const c23 = correlator(start, b, c)
      const c13 = correlator(start, a, c)
      const value3 = k3(c12, c23, c13)
      const negate = (r: Rational): Rational => ({ num: -r.num, den: r.den })

      // the other three forms, Q relabeled at one time, each <= 1 under macrorealism: -C12 + C23 + C13,
      // -C12 - C23 - C13, C12 - C23 + C13 (k3 subtracts its third argument). Added after the first run,
      // reported, not gated
      for (const form of [
        k3(negate(c12), c23, negate(c13)),
        k3(negate(c12), negate(c23), c13),
        k3(c12, negate(c23), negate(c13)),
      ]) {
        if (form.num * out.otherBest.den > out.otherBest.num * form.den) {
          out.otherBest = form
        }

        if (above(form, 1n, 1n)) {
          out.otherOverOne++
        }
      }

      if (value3.num * out.best.den > out.best.num * value3.den) {
        out.best = value3
        out.bestTriple = [start, a, b, c]
      }

      if (above(value3, 1n, 1n)) {
        out.overOne++
        out.atMostOne = false

        if (c <= E1_BEATS) {
          out.overOneEarly++
        }
      }

      if (above(value3, 3n, 2n)) {
        out.overLuders++
      }

      if (value3.num !== value3.den) {
        out.allOne = false
      }
    }
  }

  return out
}

function walkFrom(coin: Coin, fine = false) {
  return (start: number, ti: number, tj: number): Rational =>
    (fine ? walkCorrelatorFine : walkCorrelator)(
      walkStart(CELLS, CELLS / 2, start === 0),
      coin,
      ti,
      tj,
    )
}

function twinStart(right: boolean): ChanceState {
  return {
    right: Array.from({ length: CELLS }, (_, x) =>
      x === CELLS / 2 && right ? 1n : 0n,
    ),
    left: Array.from({ length: CELLS }, (_, x) =>
      x === CELLS / 2 && !right ? 1n : 0n,
    ),
  }
}

// ---------------------------------------------------------------------------------------------------------
// the role

function matrixKey(m: CycMatrix): string {
  return `${m.den}|${m.entries.map(e => e.join(',')).join(';')}`
}

function isProjector(p: CycMatrix): boolean {
  return cycEqual(RING12, cycMul(RING12, p, p), p)
}

function trace(m: CycMatrix): { a: bigint; b: bigint; den: bigint } {
  let t = RING12.zero()

  for (let i = 0; i < 3; i++) {
    t = RING12.add(t, m.entries[4 * i]!)
  }

  return { ...realParts(t), den: m.den }
}

// the lock's slot readings: for every pi turn M about the origin (M^2 proportional to the parity, the doublet
// eigenvalues ±i times the odd line's), P_± = Pi_d (1 ∓ i conj(c) M) / 2 with c M's eigenvalue on the odd line
function slotReadings(
  group: readonly CycMatrix[],
  doublet: CycMatrix,
  odd: CycMatrix,
  p: CycMatrix,
): { readings: Reading[]; exact: boolean } {
  const seen = new Set<string>()
  const readings: Reading[] = []

  let exact = true

  for (const m of group) {
    const square = cycMul(RING12, m, m)
    const lead = square.entries[0]!

    if (RING12.isZero(lead)) {
      continue
    }

    const scaledP = cycTimesElement(RING12, { ...p, den: square.den }, lead)

    if (!cycEqual(RING12, square, scaledP)) {
      continue
    }

    // c = <o|M|o>, o = (|1> - |2>) / sqrt 2: (M11 - M12 - M21 + M22) / 2, over 2 den
    const e = m.entries
    const cNum = RING12.sub(
      RING12.add(e[4]!, e[8]!),
      RING12.add(e[5]!, e[7]!),
    )
    const cDen = 2n * m.den
    // i conj(c) M = i conj(cNum) M_num / (cDen m.den); |c| = 1
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

    // a pi turn: |c| = 1 and the two lines exact projectors of rank one spanning the doublet
    const cNorm = RING12.mul(cNum, RING12.conj(cNum))
    const unit = RING12.equal(
      cNorm,
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
      cycEqual(
        RING12,
        cycMul(RING12, plus, minus),
        cycScale(doublet, 0n),
      )

    if (!ok) {
      // an order-4 element whose doublet eigenvalues are not ±i c (not a pi turn of the lock): not a reading
      continue
    }

    seen.add(pair)
    exact &&= ok
    readings.push({ projectors: [plus, minus, odd], values: [-1n, -1n, 1n] })
  }

  return { readings, exact: exact && readings.length > 0 }
}

type RoleSweep = {
  best: number
  bestPoly: string
  pairs: number
  classes: number
  overOne: number
  overLuders: number
  atLuders: number
  overBound: number
  luderBoundHolds: boolean
  stabilizerBest: number
  stabilizerOverOne: number
  otherBest: number
  otherOverOne: number
  otherOverLuders: number
  otherAtLuders: number
  otherBestPoly: string
}

function roleSweep(
  group: readonly CycMatrix[],
  q: CycMatrix,
  reading: Reading,
  stabilizers: readonly CycMatrix[],
  allowed?: ReadonlySet<number>,
): RoleSweep {
  const heisenberg = group.map(g => conjugateBy(g, q))
  const classOf = new Map<string, number>()
  const classes: CycMatrix[] = []
  const hClass = heisenberg.map(x => {
    const key = matrixKey(x)

    if (!classOf.has(key)) {
      classOf.set(key, classes.length)
      classes.push(x)
    }

    return classOf.get(key)!
  })
  const readClasses = classes.map(x => readOut(reading, x))
  const out: RoleSweep = {
    best: Number.NEGATIVE_INFINITY,
    bestPoly: '',
    pairs: 0,
    classes: 0,
    overOne: 0,
    overLuders: 0,
    atLuders: 0,
    overBound: 0,
    luderBoundHolds: true,
    stabilizerBest: Number.NEGATIVE_INFINITY,
    stabilizerOverOne: 0,
    otherBest: Number.NEGATIVE_INFINITY,
    otherOverOne: 0,
    otherOverLuders: 0,
    otherAtLuders: 0,
    otherBestPoly: '',
  }
  const hCount = new Map<number, number>()

  group.forEach((_, h) => {
    if (!allowed || allowed.has(h)) {
      hCount.set(hClass[h]!, (hCount.get(hClass[h]!) ?? 0) + 1)
    }
  })

  group.forEach((g, gi) => {
    if (allowed && !allowed.has(gi)) {
      return
    }

    const first = readOut(reading, heisenberg[gi]!)

    for (const [z, count] of hCount) {
      const second = conjugateBy(g, readClasses[z]!)
      const last = readOut(reading, conjugateBy(g, classes[z]!))
      const k = cycAdd(RING12, cycAdd(RING12, first, second), last, -1n)

      out.pairs += count
      out.classes++

      // the other three forms (reported after the first run, not gated)
      for (const [s1, s2, s3] of [
        [-1n, 1n, 1n],
        [-1n, -1n, -1n],
        [1n, -1n, 1n],
      ] as const) {
        const form = cycAdd(
          RING12,
          cycAdd(RING12, cycScale(first, s1), cycScale(second, s2)),
          cycScale(last, s3),
        )

        const formTop = topEigenvalue(form)

        if (formTop > out.otherBest) {
          out.otherBest = formTop
          out.otherBestPoly = cycCharPoly(RING12, form)
            .map(c => {
              const { a, b } = realParts(c)

              return `${a} + ${b} sqrt3`
            })
            .join(' ; ')
            .concat(` (over ${form.den})`)
        }

        if (!topAtMost(form, { p: 1n, q: 0n, s: 1n }).atMost) {
          out.otherOverOne += count
        }

        const formLuders = topAtMost(form, { p: 3n, q: 0n, s: 2n })

        if (!formLuders.atMost) {
          out.otherOverLuders += count
        }

        if (formLuders.equal) {
          out.otherAtLuders += count
        }
      }

      const top = topEigenvalue(k)
      const one = topAtMost(k, { p: 1n, q: 0n, s: 1n })
      const luders = topAtMost(k, { p: 3n, q: 0n, s: 2n })
      // 2.1547 + 1e-4 as 21548 / 10000
      const bound = topAtMost(k, { p: 21548n, q: 0n, s: 10000n })

      if (!one.atMost) {
        out.overOne += count
      }

      if (!luders.atMost) {
        out.overLuders += count
      }

      if (luders.equal) {
        out.atLuders += count
      }

      if (!bound.atMost) {
        out.overBound += count
      }

      if (top > out.best) {
        out.best = top
        out.bestPoly = cycCharPoly(RING12, k)
          .map(c => {
            const { a, b } = realParts(c)

            return `${a} + ${b} sqrt3`
          })
          .join(' ; ')
          .concat(` (det(x - N), lowest first, K = N / ${k.den})`)
      }

      for (const s of stabilizers) {
        const e = expectation(k, s)
        const x = (Number(e.a) + Number(e.b) * Math.sqrt(3)) / Number(e.den)

        out.stabilizerBest = Math.max(out.stabilizerBest, x)

        if (signSqrt3(e.a - e.den, e.b) > 0) {
          out.stabilizerOverOne += count
        }
      }
    }
  })

  out.luderBoundHolds = out.overLuders === 0

  return out
}

// the twelve stabilizer states of a qutrit, as projectors: |j>, and (1, w^(a k^2 + b k)) / sqrt 3
function stabilizerProjectors(): CycMatrix[] {
  const vectors: number[][] = []

  for (let j = 0; j < 3; j++) {
    vectors.push([0, 1, 2].map(k => (k === j ? 0 : -1)))
  }

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      vectors.push([0, 1, 2].map(k => (a * k * k + b * k) % 3))
    }
  }

  // each vector as exponents of omega (-1 marks a zero amplitude)
  return vectors.map(v => {
    const nonzero = v.filter(x => x >= 0).length
    const amp = v.map(x => (x < 0 ? RING12.zero() : RING12.root(4 * x)))

    return {
      n: 3,
      entries: Array.from({ length: 9 }, (_, idx) =>
        RING12.mul(
          amp[Math.floor(idx / 3)]!,
          RING12.conj(amp[idx % 3]!),
        ),
      ),
      den: BigInt(nonzero),
    }
  })
}

export default experiment({
  id: 'quantum/leggett-garg-exact',
  code: 'E-QTM-0164',
  title:
    "Leggett-Garg K3 = C12 + C23 - C13 enumerated exactly, partial: on the lone vibe it never passes 1 (best 23/32 over 440 triples to beat 12, the registered falsifier met), while the role read by the lock's slot reading reaches 1 + sqrt 6 / 4 = 1.6124, above the Luders bound 3/2, on 9,216 of 46,656 schedules (1.4714, a root of 8 x^3 - 18 x + 1, under Luders readings); every classical control stays at or below 1. Reported after the first run: the other three Leggett-Garg forms reach 19/16 on the vibe and 7/4 on the role",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // 1. the lone vibe
    const vibe = sweep(walkFrom(FEAR_COIN))
    const fine = sweep(walkFrom(FEAR_COIN, true))
    const stay = sweep(walkFrom(STAY_COIN))
    const hop = sweep(walkFrom(HOP_COIN))
    const twin = sweep((start, ti, tj) =>
      twinCorrelator(twinStart(start === 0), ti, tj),
    )

    let signalingInTime = 0

    for (const start of [true, false]) {
      for (let a = 1; a <= LAST_BEAT; a++) {
        for (let b = a + 1; b <= LAST_BEAT; b++) {
          const m = walkMarginals(
            walkStart(CELLS, CELLS / 2, start),
            FEAR_COIN,
            a,
            b,
          )

          signalingInTime = Math.max(
            signalingInTime,
            Math.abs(Number(m.read - m.unread)) / 4 ** b,
          )
        }
      }
    }

    // 2. the role
    const group = cliffordGroup().map(fromMat3)
    const p = parity()
    const q = cycScale(p, -1n)
    const doublet = cycScale(cycAdd(RING12, identity3(), p), 1n, 2n)
    const odd = cycScale(cycAdd(RING12, identity3(), p, -1n), 1n, 2n)
    const luders: Reading = { projectors: [doublet, odd], values: [-1n, 1n] }
    const slots = slotReadings(group, doublet, odd, p)
    const stabilizers = stabilizerProjectors()
    const roleLuders = roleSweep(group, q, luders, stabilizers)
    const roleSlot = slots.readings.map(r =>
      roleSweep(group, q, r, stabilizers),
    )
    // G4: the subgroup permuting a reading's three lines
    const classical = slots.readings.map(r => {
      const keys = new Set(r.projectors.map(matrixKey))
      const allowed = new Set<number>()

      group.forEach((g, gi) => {
        const moved = r.projectors.map(x =>
          matrixKey(cycMul(RING12, cycMul(RING12, g, x), cycAdjoint(RING12, g))),
        )

        if (moved.every(k => keys.has(k))) {
          allowed.add(gi)
        }
      })

      return { allowed: allowed.size, sweep: roleSweep(group, q, r, [], allowed) }
    })
    const slotBest = Math.max(...roleSlot.map(r => r.best))
    const slotOverLuders = roleSlot.reduce((s, r) => s + r.overLuders, 0)
    const slotOverOne = roleSlot.reduce((s, r) => s + r.overOne, 0)
    const slotOverBound = roleSlot.reduce((s, r) => s + r.overBound, 0)
    const classicalOverOne = classical.reduce(
      (s, c) => s + c.sweep.overOne,
      0,
    )
    const bestSlot = roleSlot.reduce((a, b) => (b.best > a.best ? b : a))

    const g1 = vibe.overLuders === 0 && roleLuders.luderBoundHolds
    const g2 = stay.allOne && hop.atMostOne
    const g3 = twin.atMostOne
    const g4 = classicalOverOne === 0 && classical.every(c => c.allowed > 1)
    const g5 = slots.exact
    const g6 = slotOverBound === 0 && roleLuders.overBound === 0
    const instrument = g1 && g2 && g3 && g4 && g5 && g6
    const hv = vibe.overOne > 0
    const hb = slotOverLuders > 0
    const status = !instrument
      ? 'fail'
      : hv && hb
        ? 'pass'
        : hv || hb
          ? 'partial'
          : 'fail'

    return verdict({
      status,
      claim: `the lone vibe reads K3 up to ${value(vibe.best).toFixed(6)} (${vibe.best.num}/${vibe.best.den}, start ${vibe.bestTriple[0] === 0 ? 'right' : 'left'}, beats ${vibe.bestTriple.slice(1).join(', ')}), above 1 on ${vibe.overOne} of 440 triples (${vibe.overOneEarly} with t3 <= 7); the role reads ${roleLuders.best.toFixed(6)} under Luders readings and ${slotBest.toFixed(6)} under the lock's slot reading, above 3/2 on ${slotOverLuders} schedules; every classical control stays at 1 or below`,
      metrics: {
        vibeBest: value(vibe.best),
        vibeOverOne: vibe.overOne,
        vibeOverOneEarly: vibe.overOneEarly,
        vibeFineBest: value(fine.best),
        vibeFineOverOne: fine.overOne,
        vibeFineOverLuders: fine.overLuders,
        vibeSignalingInTime: signalingInTime,
        vibeOtherFormsBest: value(vibe.otherBest),
        vibeOtherFormsOverOne: vibe.otherOverOne,
        vibeFineOtherFormsBest: value(fine.otherBest),
        twinOtherFormsBest: value(twin.otherBest),
        roleLudersBest: roleLuders.best,
        roleLudersOverOne: roleLuders.overOne,
        roleLudersAtBound: roleLuders.atLuders,
        roleSlotBest: slotBest,
        roleSlotOverOne: slotOverOne,
        roleSlotOverLuders: slotOverLuders,
        roleSlotReadings: slots.readings.length,
        roleLudersOtherFormsBest: roleLuders.otherBest,
        roleLudersOtherFormsOverLuders: roleLuders.otherOverLuders,
        roleLudersOtherFormsAtLuders: roleLuders.otherAtLuders,
        roleSlotOtherFormsBest: Math.max(...roleSlot.map(r => r.otherBest)),
        roleSlotOtherFormsOverLuders: roleSlot.reduce(
          (s, r) => s + r.otherOverLuders,
          0,
        ),
        roleSlotOtherFormsOverOne: roleSlot.reduce(
          (s, r) => s + r.otherOverOne,
          0,
        ),
        rolePairs: roleLuders.pairs,
        roleClasses: roleLuders.classes,
        roleLudersStabilizerBest: roleLuders.stabilizerBest,
        roleSlotStabilizerBest: Math.max(
          ...roleSlot.map(r => r.stabilizerBest),
        ),
        roleSlotStabilizerOverOne: roleSlot.reduce(
          (s, r) => s + r.stabilizerOverOne,
          0,
        ),
      },
      control: {
        ludersBoundHolds: g1 ? 1 : 0,
        stayAllOne: stay.allOne ? 1 : 0,
        hopAtMostOne: hop.atMostOne ? 1 : 0,
        hopBest: value(hop.best),
        twinAtMostOne: twin.atMostOne ? 1 : 0,
        twinBest: value(twin.best),
        classicalSubgroupSize: classical[0]?.allowed ?? 0,
        classicalOverOne,
        classicalBest: Math.max(...classical.map(c => c.sweep.best)),
        readingsExact: g5 ? 1 : 0,
        overBudroniEmary: slotOverBound + roleLuders.overBound,
        budroniEmaryQutrit: BUDRONI_EMARY_QUTRIT,
      },
      notes: `L2. Best role K under the slot reading, exact: ${bestSlot.bestPoly}. Best role K under Luders: ${roleLuders.bestPoly}. Best of the other three forms, slot reading: ${roleSlot.reduce((a, b) => (b.otherBest > a.otherBest ? b : a)).otherBestPoly}; Luders: ${roleLuders.otherBestPoly}. The walk's best other form: ${vibe.otherBest.num}/${vibe.otherBest.den}. The walk runs the fear walk, which E-QTM-0157 holds equal to the rule's lone vibe on trivial links to beat 16 and on every start's links to beat 7; triples with t3 > 7 rest on the trivial-link identity. The role's schedules: 46,656 pairs of Clifford elements, which K depends on only through g and the point Q_h sits at (${roleLuders.classes} classes). The finer walk reading (cell and slot) is reported, not gated: it is not the marker's reading.`,
    })
  },
})
