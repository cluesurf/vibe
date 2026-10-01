// TWO REGISTER MEMBERS STARTED ON DIFFERENT LINES (E-FND-0158): the OPEN-FND-03 reruns this engine can read. The
// adopted knit keeps the tone of every mesh line (E-SPN-0098), so two vibes on different lines never share a slot,
// never exchange, never trade momentum and never change one another. Integration across lines read exactly 0
// (E-SLF-0178). That blocked every row whose test needs matter to meet or trade across lines: bosons and no anyons
// (ledger C), temperature and the Bose and Fermi laws (J), hydrodynamics (K), binding, persistence and integration
// (P). E-SPN-0175 ran the many-body register rule with the sea present: two holes of the full sea, exactly, on the D4
// torus L = 4, with the member mixers, the sector string and the sector contact counted from the sea. This file puts
// two holes on one dock on two DIFFERENT lines and reads, for each blocked row, the one thing the line law forbade.
//
// WHAT THIS CAN AND CANNOT SETTLE, stated before the run. It is two holes on the 4d bulk torus, one tone, one flavor,
// on the register rule, which is not the adopted rule. So no ledger row can become held from it: the held bar needs the
// 3d husk, the one rule, and the start family where the start enters. What it can settle is whether the register
// rule lifts the line law for two bodies, which each blocked row needs first. What each row needs beyond that is
// listed in note/research/vibe/roadmap/open.md, OPEN-FND-03.
//
// DERIVED BEFORE THE RUN (code/measure/register-crossing on code/measure/register-sea).
// 1. EXCHANGE IS A CONSERVED SIGN, +1 OR -1 (L1; rows C "no anyons", C "bosons"). With (P12 psi)(y)[m1][m2] =
//    psi(-y)[m2][m1], every piece commutes with P12: the member mixers are one piece on both members; the sector pieces
//    are symmetric in the two members and depend on V(y) = V(-y); the swap coin and the stream take y to y + r_d - r_e,
//    whose image under P12 is -(y + r_d - r_e). So each eigenspace of P12 is kept exactly, and P12^2 = 1 leaves no
//    other exchange phase in the rule's own exchange. The sea selects -1 (a hole of the full sea is a fermion,
//    E-SPN-0163, 0175). The turn: a turn by pi lifts to e_01 with L(e_01)^2 = -1 on one member (E-FRC-0267), so N
//    members turn by (-1)^N, and two composites of N members exchange by (-1)^(N^2) = (-1)^N: a two-member composite
//    turns and exchanges as a boson. This is kinematics. It does not make a composite (E-SPN-0162 holds one, 35 times
//    too heavy) and does not show Bose statistics of composites in the dynamics, which needs four holes.
// 2. PAULI ACROSS LINES (L2; rows C, J). Start two holes on one dock, in slot 0 (line 0) and slot 1 (line 1),
//    register 0, as an antisymmetric (A), symmetric (S) or distinguishable (D) pair. With the mixers off, the swap
//    coin and the stream keep each member on its line, so neither ever reaches the other's slot: the weight with both
//    in one slot is 0 for every statistics (the line law). With the member mixers a lone member reaches every line in
//    one cycle (E-FND-0157), so D reaches one slot and one mode, while A never holds weight in one mode. The starts are
//    orthogonal to their exchange images and the rule keeps P12, so P_S + P_A = 2 P_D exactly for any P12-symmetric
//    read P, and the exchange term P_D - P_A is what statistics adds. It is nonzero: exclusion and exchange now act
//    between members that started on different lines.
// 3. MOMENTUM TRADED (L1 for the free rule, L2 for the rule; rows J, K). A one-body rule that is the same at every dock
//    keeps each member's momentum, so at total momentum 0 the weight w(q) at each relative momentum is kept exactly:
//    the free register rule is integrable in the strongest sense (every one-body Floquet mode's occupation is a
//    conserved charge) and cannot equilibrate anything. The sector string and contact depend on the separation, so
//    they move weight between momenta. That is scattering, the first thing equilibration and viscosity need.
// 4. ONE MEMBER CHANGES ANOTHER ACROSS LINES (L2; rows P). E-SLF-0178's reading, cut and remove: member 1's weight on
//    each of the 12 lines with member 2 present and interacting (the rule) against member 2 present and not
//    interacting (the free rule, which is member 1 alone, exactly, for a distinguishable pair). The knit reads 0 across
//    lines. A member held in the flats is never in a sector (S lies in W, E-SPN-0175), so for it the rule and the free
//    rule agree exactly: that is the control.
//
// PREDICTED VERDICT: PASS, at depth L2. What it does not show: a self, a temperature, a Bose or Fermi law, a fluid.
//
// GATES, fixed before the gate run (the torus L = 4, 64 cycles, reads at cycles 1, 2, 4, 8, 16, 32, 64; the exchange
// and slot weights every cycle). The rule is E-SPN-0175's: the member mixers at the light unit ringUnit(-1, 4), the
// sector string ringUnit(-2, 1) a unit of V (cap 8) and the sector contact v^2 with v = ringUnit(2, 0), hole angles
// reversed. The free rule is the member mixers alone. The starts are slot 0 and slot 1, register 0, on one dock.
//  X EXCHANGE SECTORS. Under the rule, from A the symmetric part stays at most 1e-20 of the weight at every cycle, and
//    from S the antisymmetric part does. L(e_01)^2 = -1 on one member's 8 register states, (L (x) L)^2 = +1 on two
//    members' 64 and (L (x) L (x) L)^2 = -1 on three members' 512, exactly (integer matrices).
//  H PAULI ACROSS LINES. Under the free rule: D's weight with both members in one mode exceeds 1e-3 at some cycle;
//    A's is at most 1e-24 at every cycle; and the exchange term of the one-slot weight, |P_D - P_A|, exceeds 1e-3 at
//    some cycle.
//  S MOMENTUM TRADED. Under the rule from D, sum over q of |w(q) - w_0(q)| over sum w exceeds 1e-4 at some read.
//  I A MEMBER CHANGED ACROSS LINES. From D, the L1 distance between member 1's line weights under the rule and under the
//    free rule exceeds 1e-4 at some read.
// CONTROLS (a failure makes the verdict partial at best).
//  CL THE LINE LAW, REPRODUCED. With the mixers off (the unit 1, no pair piece: the swap coin and the stream), the
//    one-slot weight of A, S and D is at most 1e-24 at every cycle, and member 1 of D holds at most 1e-24 off line 0.
//  CS THE FREE RULE IS INTEGRABLE. Under the free rule from D, sum |w(q) - w_0(q)| / sum w is at most 1e-10 at every read.
//  CX THE SIGN CHECK HAS TEETH. The rule with member 1 given a further unit ringUnit(1, 2) on the beat's sector (its
//    conjugate in beat 2), so the two members differ: from A the symmetric part exceeds 1e-6 at some cycle.
//  CI THE FROZEN MEMBER FEELS NOTHING. Member 1 projected onto the flats F and member 2 onto the moving states W
//    (E-SPN-0175's F (x) W start, slots 0 and 1, register 0, distinguishable): the L1 distance of member 1's line
//    weights, rule against free, is at most 1e-10 at every read.
// INSTRUMENT (a failure makes the verdict partial at best). I1 the exchange identity P_S + P_A = 2 P_D, on the one-slot
//  and the contact weights under the free rule, within 1e-10 at every cycle. I2 every run keeps its norm within 1e-9.
//  I3 Parseval: sum w equals the sites times the norm within 1e-8.
// READ, gating nothing: the contact weight's exchange term, the one-slot weight under the rule, member 1's weight off
//  its start line, the spread of w over momenta.
// Verdict: fail if X, H, S or I fails; partial if all hold and a control or the instrument fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after the gate run). tmp/ofd3-probe1 (4 cycles, the rule, the
//  free rule and the mixers off, contact slot starts): under the rule A's symmetric part 4e-32; w(q) moved 5.7e-4 (A),
//  1.1e-3 (D), 1.8e-3 (S) of the total by cycle 4, against 9e-14 and 1e-13 under the free rule; member 1 of D held
//  0.788218 on its start line under the rule and 0.788590 under the free rule; norms kept within 2.4e-11, which set I2
//  at 1e-9 rather than E-SPN-0175's 1e-10. tmp/ofd3-probe2 (16 cycles): under the free rule D's one-mode weight
//  reached 8.8e-3 at cycle 1, A's stayed below 1e-34, S's one-slot weight was twice D's, the identity held to 1e-16;
//  with the mixers off every one-slot weight and member 1's weight off its line read exactly 0; the asymmetric rule
//  put 0.03 to 0.14 of A in the symmetric part; the frozen start's member 1 differed between the rule and the free rule
//  by at most 7e-16. The thresholds 1e-3 (H) and 1e-4 (S, I) were set from these, a factor of 3 to 10 under the probe
//  values; the control thresholds sit many orders from both the probe values and the float floor.
//  tmp/ofd3-smoke ran every code path for two cycles before the gate run (pass on every gate at 2 cycles). It read
//  the contact identity at 5.6e-13, a float sum over order-one weights, so I1 was set at 1e-10 rather than 1e-12.
//
// FIRST RUN (tmp/ofd3-gate-run1.log, 457 s): PASS, as predicted. No gate moved and none was rerun.
//  - X: L(e_01)^2 = -1, (L (x) L)^2 = +1, (L (x) L (x) L)^2 = -1 exactly; under the rule A's symmetric part at most
//    1.9e-30 and S's antisymmetric part 1.5e-30 over 64 cycles.
//  - H: under the free rule D reaches one mode with 8.76e-3 (cycle 1), A stays at 4.2e-33, and the one-slot exchange
//    term is 8.77e-3 (the contact exchange term, read, 2.4e-3).
//  - S: the rule moved 9.8e-5, 9.4e-4, 1.1e-3, 1.6e-3, 2.1e-3, 2.1e-3, 1.6e-3 of the pair's weight between relative
//    momenta at cycles 1 to 64; the free rule 1.2e-13 at most.
//  - I: member 1's line weights, rule against free, L1 1.0e-2, 8.8e-3, 7.4e-4, 1.8e-3, 8.7e-3, 7.3e-3, 1.5e-4 at the
//    reads: an oscillation, not a growth. Member 1 ends with 0.136 of its weight off its start line.
//  - Controls: mixers off, every one-slot weight and member 1's off-line weight exactly 0; the free rule's momentum
//    weights kept to 1.2e-13; the asymmetric rule puts 0.145 of A in the symmetric part; the frozen member 1.8e-15.
//  - Instrument: the exchange identity 5.6e-13, norms 2.0e-12, Parseval 2.0e-11.
//  - A read that says nothing, disclosed: the participation of w over momenta is 128 of 128 at every read, because a
//    start on one relative dock has a flat momentum distribution to begin with and the pair pieces move only 0.2% of
//    it. It cannot show a relaxation and was not a gate.
//  THE AUDIT, as harshly as a stranger's. X is a symmetry check, L1, with teeth (CX). H is E-FND-0157's reach applied to
//  two members: the antisymmetric pair's zero in one mode is its construction, and what is measured is that the
//  distinguishable pair reaches one mode at all, which the mixers-off control forbids. S and I are close to the
//  definition of an interaction (any piece that depends on the separation scatters, E-SLF-0178's own circularity note
//  says the same of its cut); what is not circular is that the members started on different lines, the free and
//  frozen controls, and the size: a pure-slot start keeps most of its weight in the flats, so only a few thousandths
//  of the pair's weight trades. Depth L2 at most, and no row can be held from a 4d torus.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { LINE_OF } from '@/code/rule/isometric-knit'
import {
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
  EVEN,
} from '@/code/measure/spinor-register'
import {
  evenBlade,
  leftMultiplication,
} from '@/code/measure/register-symmetry'
import {
  contactWeights,
  FULL,
  movingBlocks,
  newPair,
  pairNorm,
  pairStart,
  seaBeat,
  seaCycle,
  sectorBases,
  torus,
  type Pair,
  type SeaRule,
  type SectorBases,
  type Torus,
} from '@/code/measure/register-sea'
import {
  exchangeParts,
  localPair,
  memberLines,
  relativeWeights,
  sameSlotWeights,
  sidePiece,
  LINES,
} from '@/code/measure/register-crossing'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const EXTRA: readonly [number, number] = [1, 2]
const CAP = 8
const READS: readonly number[] = [1, 2, 4, 8, 16, 32, 64]
const SLOT_A = 0
const SLOT_B = 1
const REG = 8
const SECTOR_TOL = 1e-20
const PAULI_ZERO = 1e-24
const PAULI_REACH = 1e-3
const TRADE = 1e-4
const CHANGE = 1e-4
const INTEGRABLE = 1e-10
const TEETH = 1e-6
const FROZEN = 1e-10
const IDENTITY = 1e-10
const NORM = 1e-9
const PARSEVAL = 1e-8

export type CrossingPlan = { L: number; cycles: number; reads: readonly number[] }

export const GATE_PLAN: CrossingPlan = { L: 4, cycles: 64, reads: READS }

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/register-crossing',
  code: 'E-FND-0158',
  title:
    "two holes of the full sea started on one dock on two different lines lift the knit's line law on the many-body register rule, pass (the OPEN-FND-03 reruns this engine can read; no ledger row moves, since it is two holes on the 4d torus): the rule keeps the exchange sign exactly (the other sector below 2e-30 for 64 cycles, while a rule that treats the members differently puts 0.145 there), so the rule's own exchange is +1 or -1, and with L(e_01)^2 = -1 a two-member composite turns and exchanges as a boson; under the member mixers a distinguishable pair reaches one mode (8.8e-3) and an antisymmetric pair never does (4e-33), so Pauli acts across lines; the pair pieces move up to 2.1e-3 of the pair's weight between relative momenta, which the free rule never does (1.2e-13: one-body, the register rule cannot equilibrate); and member 1's line weights differ by up to 1.0e-2 with member 2 interacting rather than free, where the knit's integration across lines is 0; with the mixers off every one-slot weight is exactly 0 (the line law), and a member held in the flats is changed by 1.8e-15",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerCrossingRun(GATE_PLAN)
  },
})

// integer 8 x 8, 64 x 64 and 512 x 512 Kronecker powers, squared, compared with +-1
function kron(a: readonly number[][], b: readonly number[][]): number[][] {
  const n = a.length
  const m = b.length

  return Array.from({ length: n * m }, (_, i) =>
    Array.from(
      { length: n * m },
      (_, j) => a[Math.floor(i / m)]![Math.floor(j / m)]! * b[i % m]![j % m]!,
    ),
  )
}

function square(a: readonly number[][]): number[][] {
  const n = a.length

  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      let s = 0

      for (let k = 0; k < n; k++) {
        s += a[i]![k]! * a[k]![j]!
      }

      return s
    }),
  )
}

const isSign = (a: readonly number[][], sign: number): boolean =>
  a.every((row, i) => row.every((x, j) => x === (i === j ? sign : 0)))

// one cycle of the rule with member 1 given a further unit on the beat's sector (the CX control)
function asymmetricCycle(
  t: Torus,
  rule: SeaRule,
  B: SectorBases,
  extra: readonly [number, number],
  s: Pair,
  spare: Pair,
): void {
  const a1: [number, number] = [extra[0] - 1, extra[1]]
  const a2: [number, number] = [extra[0] - 1, -extra[1]]

  for (let i = 0; i < t.sites.length; i++) {
    sidePiece(s.re, s.im, i * FULL, B.S, a1, 1)
  }

  const mid = seaBeat(t, rule, B, s, 1, spare)

  for (let i = 0; i < t.sites.length; i++) {
    sidePiece(mid.re, mid.im, i * FULL, B.D, a2, 1)
  }

  seaBeat(t, rule, B, mid, 2, s)
}

const l1 = (a: Float64Array, b: Float64Array): number => {
  let d = 0

  for (let k = 0; k < a.length; k++) {
    d += Math.abs(a[k]! - b[k]!)
  }

  return d
}

const sum = (a: Float64Array): number => a.reduce((s, x) => s + x, 0)

// the weight on every line but one, summed directly (so an exact zero reads as 0)
const offLineWeight = (lines: Float64Array, keep: number): number =>
  lines.reduce((s, x, l) => (l === keep ? s : s + x), 0)

export function registerCrossingRun(plan: CrossingPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const unit = (kj: readonly [number, number]): [number, number] => {
    const th = unitAngle(ringUnit(kj[0], kj[1]))

    return [Math.cos(th), Math.sin(th)]
  }
  const u = unit(LIGHT)
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const T = torus(plan.L)
  const B = sectorBases()
  const rule: SeaRule = {
    u,
    string: -sAng,
    cap: CAP,
    contact: -2 * vAng,
    dock: null,
    member: false,
  }
  const free: SeaRule = { u, string: 0, cap: CAP, contact: 0, dock: null, member: false }
  const off: SeaRule = {
    u: [1, 0],
    string: 0,
    cap: CAP,
    contact: 0,
    dock: null,
    member: false,
  }
  const a = SLOT_A * REG
  const b = SLOT_B * REG
  const lineA = LINE_OF[SLOT_A]!
  const lineB = LINE_OF[SLOT_B]!
  const spare = newPair(T)

  let worstNorm = 0

  const noteNorm = (s: Pair): void => {
    worstNorm = Math.max(worstNorm, Math.abs(pairNorm(s) - 1))
  }

  // ---------------- X: the turn, exactly ----------------
  const L01 = leftMultiplication(evenBlade(EVEN.findIndex(x => x.join(',') === '0,1')))
  const L2 = kron(L01, L01)
  const L3 = kron(L2, L01)
  const turnOne = isSign(square(L01), -1)
  const turnTwo = isSign(square(L2), 1)
  const turnThree = isSign(square(L3), -1)

  log('turn')

  // ---------------- X: the exchange sectors under the rule ----------------
  const sectorLeak = { A: 0, S: 0 }

  for (const sym of [-1, 1] as const) {
    const s = localPair(T, T.origin, a, b, sym)

    for (let c = 1; c <= plan.cycles; c++) {
      seaCycle(T, rule, B, s, spare)

      const e = exchangeParts(T, s)
      const leak = sym === -1 ? e.symmetric : e.antisymmetric

      sectorLeak[sym === -1 ? 'A' : 'S'] = Math.max(
        sectorLeak[sym === -1 ? 'A' : 'S'],
        leak,
      )
    }

    noteNorm(s)
    log(`rule ${sym === -1 ? 'A' : 'S'} leak ${sectorLeak[sym === -1 ? 'A' : 'S'].toExponential(3)}`)
  }

  const X =
    turnOne &&
    turnTwo &&
    turnThree &&
    sectorLeak.A <= SECTOR_TOL &&
    sectorLeak.S <= SECTOR_TOL

  // ---------------- H, I1, CL: the free rule and the mixers off, three statistics each ----------------
  type Hom = {
    modeD: number
    modeA: number
    slotTerm: number
    contactTerm: number
    identity: number
    slotAll: number
    offLine: number
  }

  const hom = (r: SeaRule): Hom => {
    const st = ([-1, 0, 1] as const).map(sym =>
      localPair(T, T.origin, a, b, sym),
    )
    const out: Hom = {
      modeD: 0,
      modeA: 0,
      slotTerm: 0,
      contactTerm: 0,
      identity: 0,
      slotAll: 0,
      offLine: 0,
    }

    for (let c = 1; c <= plan.cycles; c++) {
      st.forEach(s => seaCycle(T, r, B, s, spare))

      const w = st.map(s => sameSlotWeights(T, s))
      const cw = st.map(s => contactWeights(T, s).contact)
      const [wA, wD, wS] = w as [
        { slot: number; mode: number },
        { slot: number; mode: number },
        { slot: number; mode: number },
      ]
      const [cA, cD, cS] = cw as [number, number, number]
      const lines = memberLines(T, st[1]!, 1)

      out.modeD = Math.max(out.modeD, wD.mode)
      out.modeA = Math.max(out.modeA, wA.mode)
      out.slotTerm = Math.max(out.slotTerm, Math.abs(wD.slot - wA.slot))
      out.contactTerm = Math.max(out.contactTerm, Math.abs(cD - cA))
      out.identity = Math.max(
        out.identity,
        Math.abs(wS.slot + wA.slot - 2 * wD.slot),
        Math.abs(cS + cA - 2 * cD),
      )
      out.slotAll = Math.max(out.slotAll, wA.slot, wD.slot, wS.slot)
      out.offLine = Math.max(out.offLine, offLineWeight(lines, lineA))
    }

    st.forEach(noteNorm)

    return out
  }

  const hFree = hom(free)

  log(`free: mode D ${hFree.modeD.toExponential(3)} A ${hFree.modeA.toExponential(3)} slot term ${hFree.slotTerm.toExponential(3)}`)

  const hOff = hom(off)

  log(`off: one-slot ${hOff.slotAll.toExponential(3)} off line ${hOff.offLine.toExponential(3)}`)

  const H =
    hFree.modeD > PAULI_REACH &&
    hFree.modeA <= PAULI_ZERO &&
    hFree.slotTerm > PAULI_REACH
  const CL = hOff.slotAll <= PAULI_ZERO && hOff.offLine <= PAULI_ZERO
  const I1 = hFree.identity <= IDENTITY

  // ---------------- S, I, CS, I3: the distinguishable pair, rule against free ----------------
  const dRule = localPair(T, T.origin, a, b, 0)
  const dFree = localPair(T, T.origin, a, b, 0)
  const w0 = relativeWeights(T, dRule)
  const total0 = sum(w0)
  const trade: { cycle: number; rule: number; free: number; spread: number }[] = []

  let changeMax = 0
  let parseval = Math.abs(total0 / T.sites.length - pairNorm(dRule))

  const changes: number[] = []

  for (let c = 1; c <= plan.cycles; c++) {
    seaCycle(T, rule, B, dRule, spare)
    seaCycle(T, free, B, dFree, spare)

    if (plan.reads.includes(c)) {
      const wr = relativeWeights(T, dRule)
      const wf = relativeWeights(T, dFree)
      const tr = sum(wr)
      const tf = sum(wf)
      const change = l1(memberLines(T, dRule, 1), memberLines(T, dFree, 1))

      parseval = Math.max(
        parseval,
        Math.abs(tr / T.sites.length - pairNorm(dRule)),
        Math.abs(tf / T.sites.length - pairNorm(dFree)),
      )

      // the participation of w over momenta, (sum w)^2 / sum w^2, gating nothing
      let sq = 0

      for (let j = 0; j < wr.length; j++) {
        sq += wr[j]! ** 2
      }

      trade.push({
        cycle: c,
        rule: l1(wr, w0) / tr,
        free: l1(wf, w0) / tf,
        spread: (tr * tr) / sq,
      })
      changes.push(change)
      changeMax = Math.max(changeMax, change)
      log(`D cycle ${c}: traded ${(l1(wr, w0) / tr).toExponential(3)} free ${(l1(wf, w0) / tf).toExponential(3)} member 1 change ${change.toExponential(3)}`)
    }
  }

  noteNorm(dRule)
  noteNorm(dFree)

  const S = trade.some(x => x.rule > TRADE)
  const CS = trade.every(x => x.free <= INTEGRABLE)
  const I = changeMax > CHANGE
  const I3 = parseval <= PARSEVAL
  const memberOffLine = offLineWeight(memberLines(T, dRule, 1), lineA)

  // ---------------- CX: the asymmetric rule ----------------
  const asym = localPair(T, T.origin, a, b, -1)
  const extra = unit(EXTRA)

  let cxLeak = 0

  for (let c = 1; c <= plan.cycles; c++) {
    asymmetricCycle(T, rule, B, extra, asym, spare)
    cxLeak = Math.max(cxLeak, exchangeParts(T, asym).symmetric)
  }

  noteNorm(asym)
  log(`asymmetric: symmetric part ${cxLeak.toExponential(3)}`)

  const CX = cxLeak > TEETH

  // ---------------- CI: the frozen member ----------------
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const mv = movingBlocks(T, Ps)
  const fRule = pairStart(T, mv, 'F', a, 'W', b, 0)
  const fFree = pairStart(T, mv, 'F', a, 'W', b, 0)

  let frozen = 0

  for (let c = 1; c <= plan.cycles; c++) {
    seaCycle(T, rule, B, fRule, spare)
    seaCycle(T, free, B, fFree, spare)

    if (plan.reads.includes(c)) {
      frozen = Math.max(
        frozen,
        l1(memberLines(T, fRule, 1), memberLines(T, fFree, 1)),
      )
    }
  }

  noteNorm(fRule)
  noteNorm(fFree)
  log(`frozen: member 1 change ${frozen.toExponential(3)}`)

  const CI = frozen <= FROZEN
  const I2 = worstNorm <= NORM
  const hard = X && H && S && I
  const controls = CL && CS && CX && CI
  const instrument = I1 && I2 && I3
  const status = !hard ? 'fail' : !controls || !instrument ? 'partial' : 'pass'
  const tradeText = trade
    .map(
      x =>
        `c${x.cycle} ${x.rule.toExponential(3)} (free ${x.free.toExponential(1)}, spread ${x.spread.toFixed(2)} of ${T.momenta.length})`,
    )
    .join(', ')
  const metrics: Record<string, number> = {
    X: flag(X),
    H: flag(H),
    S: flag(S),
    I: flag(I),
    CL: flag(CL),
    CS: flag(CS),
    CX: flag(CX),
    CI: flag(CI),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    turnOne: flag(turnOne),
    turnTwo: flag(turnTwo),
    turnThree: flag(turnThree),
    sectorLeakA: sectorLeak.A,
    sectorLeakS: sectorLeak.S,
    freeModeD: hFree.modeD,
    freeModeA: hFree.modeA,
    freeSlotTerm: hFree.slotTerm,
    freeContactTerm: hFree.contactTerm,
    freeIdentity: hFree.identity,
    offSlot: hOff.slotAll,
    offLine: hOff.offLine,
    tradedMax: Math.max(...trade.map(x => x.rule)),
    tradedFreeMax: Math.max(...trade.map(x => x.free)),
    memberChangeMax: changeMax,
    memberOffLine,
    asymmetricLeak: cxLeak,
    frozenChange: frozen,
    worstNorm,
    parseval,
    seconds: (Date.now() - started) / 1000,
  }

  trade.forEach(x => (metrics[`traded_c${x.cycle}`] = x.rule))
  changes.forEach((x, i) => (metrics[`change_c${plan.reads[i]}`] = x))

  return verdict({
    status,
    claim: `X ${X} (L(e_01)^2 = -1 ${turnOne}, (L x L)^2 = +1 ${turnTwo}, (L x L x L)^2 = -1 ${turnThree}; under the rule A's symmetric part at most ${sectorLeak.A.toExponential(2)}, S's antisymmetric part ${sectorLeak.S.toExponential(2)}); H ${H} (free rule: D in one mode up to ${hFree.modeD.toExponential(3)}, A ${hFree.modeA.toExponential(2)}, one-slot exchange term ${hFree.slotTerm.toExponential(3)}, contact exchange term ${hFree.contactTerm.toExponential(3)}); S ${S} (w(q) moved ${tradeText}); I ${I} (member 1's line weights, rule against free, L1 ${changes.map(x => x.toExponential(3)).join(' ')} at cycles ${plan.reads.join(' ')}); controls CL ${CL} (mixers off: one-slot ${hOff.slotAll.toExponential(2)}, off line ${hOff.offLine.toExponential(2)}) CS ${CS} CX ${CX} (${cxLeak.toExponential(3)}) CI ${CI} (${frozen.toExponential(3)}); instrument I1 ${I1} (${hFree.identity.toExponential(2)}) I2 ${I2} (${worstNorm.toExponential(2)}) I3 ${I3} (${parseval.toExponential(2)})`,
    metrics,
    control: {
      CL: flag(CL),
      CS: flag(CS),
      CX: flag(CX),
      CI: flag(CI),
      instrument: flag(instrument),
    },
    notes: `L1 (the exchange sectors, the turn, the free rule's conserved momenta) and L2 (the two-hole runs). The 4d D4 torus L ${plan.L}, ${T.sites.length} relative docks, not the husk; the register rule, not the adopted one; one tone, one flavor, two holes. Slots ${SLOT_A} (line ${lineA}) and ${SLOT_B} (line ${lineB}), register 0, on one dock. Lines ${LINES}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
