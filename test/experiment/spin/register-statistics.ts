// SPIN AND STATISTICS FROM THE REGISTER RULE (E-SPN-0191; OPEN-MAT-03, OP-08; moving-matter item 0002). E-SPN-0014 typed its
// exchange signs and E-SPN-0083 disagrees; E-SPN-0163 second-quantized the register rule by minors, so its fermion sign
// is a construction unless the bosonic quantization breaks one of the rule's own invariants. This file decides that,
// and compares the sign that survives with a member's 2 pi turn sign. CANDIDATE RULE (the register rule of E-SPN-0160,
// E-SPN-0163, E-SPN-0175): every result here is provisional until the rule is adopted (moving-matter item 0006).
//
// DERIVED BEFORE THE RUN (code/measure/register-statistics).
// 1. TWO QUANTIZATIONS, ONE BOX. Every piece of the register rule is one-body (E-SPN-0163 point 1), so a many-body rule
//    that restricts to it on one member and composes is Gamma(P) on some symmetry class: minors on 0/1 occupations
//    (fermions) or permanents on every occupation (bosons). Both are multiplicative (Cauchy-Binet holds for permanents
//    with the multiplicity weights), both unitary for a unitary P, and both commute with Gamma(T) for any one-body
//    symmetry T. So reversibility, composition and translation covariance cannot choose between them.
// 2. THE SEA AND THE CAPACITY CHOOSE. The rule's vacuum is the full sea: every (slot, register) mode holds one vibe, a
//    mode being a tone, not a count (E-SPN-0175: every slot holds 8, K is blocked by that capacity). Fermions: the full
//    sea's block is 1 x 1, det P, a unit, one branch every beat. Bosons: the same state goes to itself with perm(P),
//    which for a mixing P has |perm P| < 1, and the rest of its weight lands on states with a mode holding two or more:
//    the sea branches and the capacity breaks. On a 2-member start a boson sends 2 sum_c |P_ca P_cb|^2 to doubly held
//    modes, nonzero as soon as one mode feeds both. PREDICTED: fermions keep all four invariants, bosons fail the sea
//    and the capacity.
// 3. THE EXCHANGE SIGN. The second-quantized swap of modes a and b gives det = -1 on a fermion state holding both, +1
//    for bosons; relative to the empty box for members, relative to the full sea for holes (whose own amplitude under
//    the swap is det = -1, so two holes also exchange with -1). PREDICTED: -1 on every 1-, 2- and 3-member state.
// 4. THE TURN SIGN DEPENDS ON THE LIFT. W(F4) acts on the register by minors (E-SPN-0160), a genuine representation:
//    for a rotation of order k, (minors g)^k = minors(g^k) = 1, so the 2 pi turn reads +1. In Clifford terms the minors
//    action is w -> s w s~ = L(s) R(s~) for the rotor s of g. The rule's pieces are all left multiplications or act on
//    slots only (Q_S, Q_D = sum r_i r'_j L(e_i e_j), the coin X, the chiral J = R(vol)), so the rule's commutant contains
//    R(Cl+) (E-FRC-0259 A1) and the rule is ALSO covariant under slots(g) (x) L(s) alone, a projective lift whose 2 pi
//    turn is s^k = -1 (s = cos(pi / k) + sin(pi / k) B for a turn by 2 pi / k in the plane B). The minors action is the
//    spinor lift times a second spinor lift on the right index, so (-1)(-1) = +1. PREDICTED: minors +1, spin lift -1,
//    the rule covariant under both.
//
// PREDICTED VERDICT: PARTIAL. The statistics is fixed by the rule (only fermions survive, exchange sign -1, not typed),
// but the turn sign is not: the rule is covariant under a lift with turn sign +1 (minors, the action the code uses) and
// one with -1 (the spinor lift). The exchange sign equals the spinor lift's turn sign on every state and differs from
// the minors action's. Which lift is the member's rotation is a choice the rule does not make.
//
// GATES, fixed before the gate run (spec.md section 3, pathway C).
//  S STATISTICS FROM THE RULE, EXACT on the box (two docks of 4 modes, the light unit ringUnit(-1, 4), two beats):
//    each quantization is tested for R reversibility (each beat's block unitary, k = 1, 2, 3), C composition
//    (Gamma(beat 2) Gamma(beat 1) = Gamma(beat 2 beat 1), k = 1, 2, 3), T translation covariance (each beat commutes
//    with the dock translation, k = 1, 2, 3), V the sea (the full box, every mode once, keeps |amp|^2 = 1 on each beat)
//    and N the capacity (no weight from a 0/1 start reaches a doubly held mode, k = 2, 3, each beat). S holds when
//    exactly one quantization keeps all five.
//  E THE EXCHANGE SIGN of the survivor: one value on every state tested, exhaustively on the box: 1 member (the member
//    in dock x, mode m, with dock y full, swapped with the sea vibe at m + 4; 4 states), 2 members (all 28 pairs), 3
//    members (all 56 triples, each of their 3 pairs), 2 and 3 holes in the full sea (28 and 56 x 3, against the sea).
//  T THE TURN SIGN: over every W(F4) rotation that turns one plane only, the sign of (register action)^order, for the
//    rule's register action (minors, code/measure/spinor-register f4Group) and for the spinor lift L(s); and whether
//    the rule's projectors 24 Q_S and 48 Q_D commute with slots(g) (x) L(s) within 1e-12 for every one.
// Verdict (the kill of spec.md fixed 2026-10-08): open (circular) if both quantizations survive or neither; pass if one
// survives and its exchange sign equals the minors turn sign on every state; partial if it differs from the minors sign
// but equals the spinor lift's and the rule is covariant under that lift (the turn sign is then a choice of lift, the
// gap named); fail otherwise. A failed control or instrument makes a pass partial.
// CONTROLS. C1 the HARD-CORE quantization (permanents on the fermion's own 0/1 states: the exchange sign typed +1) must
//  fail at least one of R, C, T, V. C2 the gate fed a hand-typed opposite exchange sign must fail its comparison with
//  the turn sign the survivor matches.
// INSTRUMENT. I1 the minors action equals L(s) R(s~) within 1e-12 for every simple rotation (the rotor is right). I2 the
//  minors action commutes exactly with 24 Q_S and 48 Q_D for every simple rotation (E-SPN-0160's covariance). I3 the
//  box's beats are unitary one-body matrices (k = 1 of the fermion block) and det of each beat is a unit.
// READ, gating nothing: on the real 192-mode pieces (beat 1 and 2 at the light unit) the weight a bosonic 2-member start
//  at (slot 0, register 0) and (slot e, register 0) sends to doubly held modes; the bosonic sea amplitude |perm P|^2;
//  the orders of the simple rotations.
//
// FIRST RUN (tmp/stats.log in the moving-matter worktree, 2 s): PARTIAL, as predicted. No probe before it, no gate
//  moved, none rerun.
//  - S: fermions keep R, C, T, V (|det|^2 = 1 both beats) and N; bosons keep R, C, T and fail V (|perm|^2 = 0.552742 on
//    both beats) and N (up to 0.137755 of a 2- or 3-member start lands on doubled modes). Exactly one survives.
//  - E: -1 on all 396 readings (1 member, 2, 3, 2 holes, 3 holes). Bosons read +1, the hard-core control +1.
//  - T: 190 one-plane rotations (order 2: 90, 3: 64, 4: 36); minors turn sign +1 on all, spinor lift -1 on all; the
//    rule's projectors commute with slots (x) L(s) to 4.4e-16.
//  - Controls: C1 hard-core fails R, C and V; C2 holds. Instrument: minors = L(s) R(s~) to 2.5e-16, minors exactly
//    covariant, the box's beats unitary with unit det.
//  - Read: the real 192-mode pieces send 2.46e-2 (beat 1) and 2.33e-2 (beat 2) of a bosonic 2-member start to doubled
//    modes, so the capacity break is not an artifact of the box.
//
// DETERMINISM: no random numbers; every state of the box is enumerated. NOTHING MOVES on the base: the box is the
// register rule's one-body pieces on 8 modes and their two second quantizations.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { qwIsZero, qwMul, qwConj, qwSub, QW_ONE, type QW } from '@/code/measure/flavor-register'
import { qwDet } from '@/code/measure/register-many-body'
import { det4 } from '@/code/measure/chiral-register'
import {
  commutesExactly,
  f4Group,
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
  MODES,
} from '@/code/measure/spinor-register'
import {
  BOSON,
  capacityLeak,
  commutatorGap,
  covariant,
  exchangeSign,
  FERMION,
  HARD_CORE,
  largestGap,
  leftMultiplication,
  multiplicative,
  multiply8,
  powerSign,
  reversed,
  rightMultiplicationOf,
  seaKept,
  simpleRotations,
  spinLift,
  toyBox,
  unitary,
  type Quantization,
  type State,
} from '@/code/measure/register-statistics'

const LIGHT: readonly [number, number] = [-1, 4]
const KS: readonly number[] = [1, 2, 3]
const LIFT_TOL = 1e-12

const flag = (b: boolean): number => (b ? 1 : 0)
const real = (x: QW): number => (Number(x.a) - Number(x.b) / 2) / Number(x.d)

export default experiment({
  id: 'spin/register-statistics',
  code: 'E-SPN-0191',
  title:
    'spin and statistics from the register rule: of the two second quantizations of the register rule, only the fermionic one (minors) keeps the full sea one branch with a unit amplitude and the one-vibe capacity of a mode, the bosonic one (permanents) branches the sea and doubles modes, so the exchange sign is -1 on every 1-, 2- and 3-member state by the rule, not by a typed algebra; a member\'s 2 pi turn sign is +1 under the minors action of W(F4) on the register and -1 under the spinor lift L(s), and the rule is covariant under both, so spin-statistics holds on the spinor lift only and the rule does not choose the lift',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return registerStatisticsRun()
  },
})

type Survival = {
  reversible: boolean
  composes: boolean
  covariant: boolean
  sea: boolean
  capacity: boolean
  survives: boolean
  seaAmp2: number[]
  leak: number
}

function survival(q: Quantization): Survival {
  const box = toyBox(ringUnit(LIGHT[0], LIGHT[1]))
  const [b1, b2] = box.beats as [typeof box.beats[0], typeof box.beats[0]]
  const reversible = KS.every(k => box.beats.every(P => unitary(q, P, k)))
  const composes = KS.every(k => multiplicative(q, b2, b1, k))
  const cov = KS.every(k =>
    box.beats.every(P => covariant(q, P, box.translation, k)),
  )
  const seas = box.beats.map(P => seaKept(q, P))
  const leaks = [2, 3].flatMap(k => box.beats.map(P => capacityLeak(q, P, k)))
  const capacity = leaks.every(qwIsZero)
  const sea = seas.every(s => s.kept)

  return {
    reversible,
    composes,
    covariant: cov,
    sea,
    capacity,
    survives: reversible && composes && cov && sea && capacity,
    seaAmp2: seas.map(s => real(qwMul(s.amp, qwConj(s.amp)))),
    leak: Math.max(...leaks.map(real)),
  }
}

// every exchange reading on the box; the set of signs seen (null for a non-eigenstate)
function exchangeSigns(q: Quantization): {
  one: Set<number | null>
  two: Set<number | null>
  three: Set<number | null>
  holes2: Set<number | null>
  holes3: Set<number | null>
  count: number
} {
  const n = 8
  const all = Array.from({ length: n }, (_, i) => i)
  const pairsOf = (s: State): [number, number][] =>
    s.flatMap((a, i) => s.slice(i + 1).map(b => [a, b] as [number, number]))
  const subsets = (k: number): State[] => FERMION.states(n, k)

  let count = 0

  const read = (
    state: State,
    reference: State,
    a: number,
    b: number,
    into: Set<number | null>,
  ): void => {
    into.add(exchangeSign(q, n, state, reference, a, b))
    count++
  }
  const out = {
    one: new Set<number | null>(),
    two: new Set<number | null>(),
    three: new Set<number | null>(),
    holes2: new Set<number | null>(),
    holes3: new Set<number | null>(),
  }

  for (let m = 0; m < 4; m++) {
    read([m, 4, 5, 6, 7], [], m, m + 4, out.one)
  }

  for (const s of subsets(2)) {
    read(s, [], s[0]!, s[1]!, out.two)
  }

  for (const s of subsets(3)) {
    for (const [a, b] of pairsOf(s)) {
      read(s, [], a, b, out.three)
    }
  }

  for (const [k, into] of [
    [2, out.holes2],
    [3, out.holes3],
  ] as const) {
    for (const H of subsets(k)) {
      const state = all.filter(i => !H.includes(i))

      for (const [a, b] of pairsOf(H)) {
        read(state, all, a, b, into)
      }
    }
  }

  return { ...out, count }
}

const single = (s: Set<number | null>): number | null =>
  s.size === 1 ? [...s][0]! : null

export function registerStatisticsRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

  // ---------------- S: which quantization the rule keeps ----------------
  const fermion = survival(FERMION)

  log('fermion')

  const boson = survival(BOSON)

  log('boson')

  const hardCore = survival(HARD_CORE)

  log('hard-core')

  const survivors = [
    { q: FERMION, s: fermion },
    { q: BOSON, s: boson },
  ].filter(x => x.s.survives)
  const S = survivors.length === 1

  // ---------------- E: the survivor's exchange sign ----------------
  const readE = (q: Quantization) => {
    const e = exchangeSigns(q)
    const sets = [e.one, e.two, e.three, e.holes2, e.holes3]
    const values = sets.map(single)
    const sign =
      values.every(v => v !== null && v === values[0]) ? values[0]! : null

    return { ...e, values, sign }
  }
  const eFermion = readE(FERMION)
  const eBoson = readE(BOSON)
  const eHard = readE(HARD_CORE)
  const survivorE = S
    ? survivors[0]!.q === FERMION
      ? eFermion
      : eBoson
    : null
  const E = survivorE !== null && survivorE.sign !== null
  const exchange = survivorE?.sign ?? null

  log('exchange')

  // ---------------- T: the turn sign, both lifts ----------------
  const group = f4Group()
  const simple = simpleRotations(group, det4)
  const qS = singletProjector24()
  const qD = partnerProjector48()

  let liftGap = 0
  let spinGap = 0
  let minorsCovariant = true

  const minorsSigns = new Set<number | null>()
  const spinSigns = new Set<number | null>()
  const orders = new Map<number, number>()

  for (const { g, order } of simple) {
    const s = spinLift(g.matrix)
    const L = leftMultiplication(s)
    const LR = multiply8(L, rightMultiplicationOf(reversed(s)))

    orders.set(order, (orders.get(order) ?? 0) + 1)
    minorsSigns.add(powerSign(g.register, order))
    spinSigns.add(powerSign(L, order))
    liftGap = Math.max(liftGap, largestGap(LR, g.register))
    spinGap = Math.max(
      spinGap,
      commutatorGap(g.slots, L, qS),
      commutatorGap(g.slots, L, qD),
    )

    if (!commutesExactly(g, qS) || !commutesExactly(g, qD)) {
      minorsCovariant = false
    }
  }

  const turnMinors = single(minorsSigns)
  const turnSpin = single(spinSigns)
  const spinCovariant = spinGap <= LIFT_TOL
  const T =
    simple.length > 0 && turnMinors !== null && turnSpin !== null

  log('turn')

  // ---------------- controls and instrument ----------------
  const C1 =
    !hardCore.reversible ||
    !hardCore.composes ||
    !hardCore.covariant ||
    !hardCore.sea
  const matched =
    exchange !== null && exchange === turnMinors
      ? turnMinors
      : exchange !== null && exchange === turnSpin
        ? turnSpin
        : null
  const C2 = exchange !== null && matched !== null && -exchange !== matched
  const controls = C1 && C2
  const I1 = liftGap <= LIFT_TOL
  const I2 = minorsCovariant
  const box = toyBox(ringUnit(LIGHT[0], LIGHT[1]))
  const I3 =
    box.beats.every(P => unitary(FERMION, P, 1)) &&
    box.beats.every(P => {
      const d = qwDet(P)

      return qwIsZero(qwSub(qwMul(d, qwConj(d)), QW_ONE))
    })
  const instrument = I1 && I2 && I3

  // ---------------- read: the real 192-mode pieces ----------------
  const th = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const pieces = [
    registerPiece(scaled(qS, 24), u),
    registerPiece(scaled(qD, 48), [u[0], -u[1]]),
  ]
  const leak192 = pieces.map(P => {
    let worst = 0

    for (let e = 1; e < 24; e++) {
      const a = 0
      const b = e * 8

      let w = 0

      for (let c = 0; c < MODES; c++) {
        const pa = P.re[c * MODES + a]! ** 2 + P.im[c * MODES + a]! ** 2
        const pb = P.re[c * MODES + b]! ** 2 + P.im[c * MODES + b]! ** 2

        w += 2 * pa * pb
      }

      worst = Math.max(worst, w)
    }

    return worst
  })

  log('read')

  // ---------------- verdict ----------------
  const circular = survivors.length !== 1
  const status: Verdict['status'] = circular
    ? 'open'
    : !E || !T
      ? 'fail'
      : exchange === turnMinors
        ? controls && instrument
          ? 'pass'
          : 'partial'
        : exchange === turnSpin && spinCovariant
          ? 'partial'
          : 'fail'
  const set = (s: Set<number | null>): string =>
    [...s].map(x => (x === null ? 'none' : String(x))).join('/')
  const surv = (name: string, s: Survival): string =>
    `${name} R ${s.reversible} C ${s.composes} T ${s.covariant} V ${s.sea} (|amp|^2 ${s.seaAmp2.map(x => x.toFixed(6)).join(', ')}) N ${s.capacity} (leak ${s.leak.toFixed(6)}): ${s.survives ? 'survives' : 'fails'}`

  return verdict({
    status,
    claim: `S ${S} (${surv('fermion', fermion)}; ${surv('boson', boson)}); E ${E} (survivor ${S ? survivors[0]!.q.name : 'none'}, exchange sign ${exchange} on ${survivorE?.count ?? 0} readings: 1 member ${set(survivorE?.one ?? new Set())}, 2 ${set(survivorE?.two ?? new Set())}, 3 ${set(survivorE?.three ?? new Set())}, 2 holes ${set(survivorE?.holes2 ?? new Set())}, 3 holes ${set(survivorE?.holes3 ?? new Set())}); T ${T} (${simple.length} one-plane rotations, orders ${[...orders].map(([k, c]) => `${k}: ${c}`).join(', ')}; turn sign minors ${set(minorsSigns)}, spinor lift ${set(spinSigns)}; rule covariant under the spinor lift ${spinCovariant} (gap ${spinGap.toExponential(2)})); exchange ${exchange} ${exchange === turnMinors ? '=' : '!='} minors turn ${turnMinors}, ${exchange === turnSpin ? '=' : '!='} spinor turn ${turnSpin}; controls C1 ${C1} (${surv('hard-core', hardCore)}, typed exchange ${eHard.sign}) C2 ${C2}; instrument I1 ${I1} (minors = L(s) R(s~) to ${liftGap.toExponential(2)}) I2 ${I2} I3 ${I3}`,
    metrics: {
      S: flag(S),
      E: flag(E),
      T: flag(T),
      fermionSurvives: flag(fermion.survives),
      bosonSurvives: flag(boson.survives),
      exchange: exchange ?? 0,
      bosonExchange: eBoson.sign ?? 0,
      turnMinors: turnMinors ?? 0,
      turnSpin: turnSpin ?? 0,
      spinCovariant: flag(spinCovariant),
      spinGap,
      liftGap,
      simpleRotations: simple.length,
      bosonSeaAmp2Beat1: boson.seaAmp2[0]!,
      bosonSeaAmp2Beat2: boson.seaAmp2[1]!,
      bosonLeak: boson.leak,
      bosonLeak192Beat1: leak192[0]!,
      bosonLeak192Beat2: leak192[1]!,
      readings: survivorE?.count ?? 0,
      C1: flag(C1),
      C2: flag(C2),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2), instrument: flag(instrument) },
    notes: `L1. Candidate (register) rule, provisional until moving-matter item 0006. Box: two docks of 4 modes, light unit ringUnit(${LIGHT.join(', ')}), two beats. Boson exchange sign ${eBoson.sign}, hard-core (typed) ${eHard.sign}. Real 192-mode pieces, bosonic 2-member doubling weight from (slot 0, reg 0) and (slot e, reg 0), worst over e: beat 1 ${leak192[0]!.toExponential(3)}, beat 2 ${leak192[1]!.toExponential(3)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
