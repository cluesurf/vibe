// ROLES AND A TONE ON THE REGISTER RULE (E-FND-0160, OPEN-FND-01). The adopted knit carries a tone on every slot, a role
// point on every vibe (one of the 9 points of the role grid), a fear beat at every meeting and a Sigma(648) grid move on
// every link. R*, the register rule (E-SPN-0160, 0163, 0175: the love sea, the dock-wide mixer, the swap coin, the Cl+(4)
// register), carries none of them, so about 18 of the 46 constraints and the self rows are unread on it. This file
// builds one way to put them on R*, gates what R* already held, and reads the rows the knit's roles and fear beat make
// readable. The derivation is note/project/vibe/roadmap/research/remaining-pieces.md, "Roles and a tone on the register rule".
//
// THE CONSTRUCTION C* (code/measure/role-register). A member mode is (slot, register, role, tone), 24 x 8 x 3 x 2 = 1,152 a
// dock, and the full sea fills them all.
//  - R*'s pieces act as R* (x) 1 on role and tone.
//  - THE ROLE is a qutrit. The knit's 9 grid points are its phase space, and a grid move is a Clifford conjugation. The
//    love-tone role carries Sigma(648), the fear-tone role the complex conjugate (forced: the unlike kernel's singlet is
//    invariant under g (x) conj(g), and 3 (x) 3 has no invariant).
//  - THE TONE is a species: the love field and the fear field each fill their own sea. A hole of the love sea is a
//    fear-tone member (charge -1), a hole of the fear sea a love-tone member (+1), and the mirror swaps them. The tone as
//    the Dirac branch was rejected: both branches are holes of one sea, charge -1, where love and fear carry opposite
//    charge.
//  - THE LINKS carry Sigma(648) on the role and are flat, a frame per dock. A disordered link field makes the member heavy
//    (E-SPN-0161), and R*'s light member rests on flat links.
//  - THE FEAR BEAT is the knit's two kernels at angle 2 pi / 3 (ringUnit(0, 2)) as a sector contact counted from the sea:
//    at V = 0 with both holes in the beat's sector, a like pair takes U = P_sym + w P_anti on its roles and an unlike pair
//    V = 1 + (w - 1) Phi Phi^dag, reversed in beat 2 and for holes.
// Both kernels are diagonal in a fixed split of the role pair and every other piece is role-blind, so two holes are two
// orbital runs of E-SPN-0175's engine: one channel with the contact phase unchanged, one with it moved by the fear angle.
//
// DERIVED BEFORE THE RUN.
// 1. THE GRID IS NOT IN THE REGISTER (L1). The 216 grid moves act on ordered pairs of distinct points in one orbit, so the
//    9 points are 1 + 8 with the 8 irreducible. Their linear part is SL(2, 3), which is 2T, the slots' group. The central
//    move x -> -x fixes 0 of the 8 nonzero points (trace 0), while the center of 2T acts on the register's 8 parts as -1
//    (left or right multiplication, trace -8) or +1 (minors, trace +8). No map between the two 8s commutes with 2T.
// 2. THE LINKS ACT ON THE ROLE AS THE KNIT'S MOVES (L1). Sigma(648)'s 648 elements carry the 9 phase points by exactly 216
//    permutations, all affine of determinant 1, the same set as the knit's grid moves, with the 3 central elements acting
//    as the identity. V commutes with g (x) conj(g) and U with g (x) g for all 648, and V does not commute with g (x) g.
// 3. WHAT R* HELD STAYS HELD (L1 algebra, L2 runs). One branch: the one-body cycle on the full sea is det(R*)^6 = 1
//    (the slot stream is even, Q_S and Q_D have rank 8) and a hole-counted pair piece is 1 there. Flats: both kernels are
//    (Q (x) Q at V = 0) (x) a role projector, so E-SPN-0175's argument holds. K: a slot holds 48 members. Chirality and
//    SU(2)+-: 24 Q_S and 48 Q_D commute with J and with all 1,152 W(F4) elements, so both kernels do, member by member.
//    The pulled pair: E-SPN-0179.
// 4. THE LIKE KERNEL ON FERMIONS READS NO ROLE (L1). For identical holes role-antisymmetric is orbit-symmetric, so U acts
//    as a contact phase on orbit-symmetric pairs, and free exchange already entangles the roles of a pair read at two
//    places. So this file reads roles on UNLIKE pairs (distinguishable, one of each species), where it cannot confound.
// 5. AN UNLIKE PAIR'S ROLE STATE IS ONE NUMBER (L1). Started as phi0 (x) chi0 with chi0 = chi_perp + c Phi, the pair is
//    phi_perp(t) (x) chi_perp + phi_Phi(t) (x) c Phi, so its role state, both orbits traced, is fixed by g = <phi_perp |
//    phi_Phi>. With the fear beat off g = 1 and the roles stay the product chi0: no entanglement, no negative weight, CHSH
//    2, every context sum at least 4. With it on |g| < 1 and arg g turns: a singlet phase of angle arg g, partly
//    decohered by the orbit. What is not derivable is how large the effect is once the members are quantum walkers.
// 6. THE ISOSPIN PIECE AND THE JOINING CHANNEL (E-FND-0159) ARE NOT SUPPLIED (L1). Both kernels factor as (Q (x) Q) (x)
//    role, so on a sea that fills every role alike their count is a whole-sector count times a fixed factor, blind to
//    SU(2)+; and both commute with J on each member, so neither joins the halves.
//
// PREDICTED VERDICT: PASS. Depth L1 for the algebra and L2 for the runs. It is two holes on the 4d D4 torus, not the husk,
// on a rule that is not adopted, with no start family: no ledger row can become held from it.
//
// GATES, fixed before the gate run (the torus L = 4, 64 cycles; the role readings every cycle; the flats at cycles 1, 2,
// 4, 8, 16, 32, 64). The rule is E-SPN-0175's (the member mixers at ringUnit(-1, 4), the sector string ringUnit(-2, 1) a
// unit of V capped at 8, the sector contact v^2 with v = ringUnit(2, 0), hole angles reversed), with the fear angle w =
// ringUnit(0, 2) added to the contact on the kernel's channel. The unlike pair starts in the moving states, member 1 in
// slot 0 and member 2 in slot 1, register 0, on one dock (E-SPN-0175's P_W start, distinguishable). The role starts are
// |0>|+> (Phi-overlap 1/9) and |0>|0> (1/3), both stabilizer products.
//  G THE GRID AND THE LINKS: the central move fixes 0 nonzero points, the moves act on distinct pairs in 1 orbit;
//    Sigma(648) has 648 elements, 216 permutations, all affine of determinant 1 and equal to the grid moves, 3 acting as
//    the identity; [g (x) conj g, V] and [g (x) g, U] at most 1e-12 over the group, and [g (x) g, V] at least 0.1 somewhere.
//  S ONE BRANCH: the slot stream's parity is even, and 24 Q_S and 48 Q_D have trace 192 and 384 (rank 8 each).
//  K K BLOCKED: over every two-hole configuration with 48 members a slot, the least occupancy is 46 and K's and the
//    store's triggers never appear.
//  C CHIRALITY: 24 Q_S and 48 Q_D commute exactly with J and with all 1,152 elements of W(F4).
//  F FLATS FROZEN UNDER THE FEAR BEAT: on the unlike kernel's channel |N_F| <= 1e-12 from the moving start and |N_F - 1| <=
//    1e-12 from a flat-plus-moving start (E-SPN-0175's F (x) W), and on the like kernel's channel (orbit-symmetric,
//    contact moved by the fear angle) |N_F| <= 1e-12 from the moving start; that channel's antisymmetric part stays at
//    most 1e-20.
//  B BELL ON THE ROLES, FROM THE DYNAMICS: the role state of the unlike pair, both orbits traced, reaches CHSH above 2.02
//    at some cycle from each role start, and no reading (traced or at one configuration) exceeds 2 sqrt 2 + 1e-9.
//  X CONTEXTUAL FOR THE MODEL'S OWN READINGS: from |0>|+> the least context sum S_u over the 81 points falls below 3.8 at
//    some cycle.
//  M THE MIRROR: the pair with its members exchanged (love and fear swapped) gives the same g within 1e-10 at every cycle.
// CONTROLS (a failure makes the verdict partial at best).
//  CB THE FEAR BEAT OFF: the product role state (g = 1) reads CHSH at most 2 + 1e-9, least W at least -1e-12 and least
//    S_u at least 4 - 1e-12, from both starts.
//  CF THE KNIT-LITERAL PLACEMENT LEAKS: the fear beat as a phase on every pair sharing a dock, not in the sector, moves
//    |N_F - 1| above 1e-3 at some read from the flat-plus-moving start.
//  CC THE CHIRALITY CHECK HAS TEETH: E-SPN-0163's register exchange of two members does not commute with J (x) 1.
// INSTRUMENT (a failure makes the verdict partial at best). I1 the reader on the knit's exact one-meeting knots, V(2 pi /
//  3) on |0>|+> and |0>|0>, reads CHSH 2.36126047 and (2 + 4 sqrt 2) / 3 within 1e-6 (E-QTM-0140). I2 S_u = 36 W(u) + 4
//  within 1e-12 on every read state. I3 every run keeps its norm within 1e-9.
// READ, gating nothing: g every cycle, |g| and arg g, the negativity and mana, the per-configuration role state's block
//  CHSH at the last cycle (best, and weight above 2.5), and whether a start whose traced state passes CHSH 2 has any
//  negative weight.
// Verdict: fail if G, S, K, C, F, B, X or M fails; partial if all hold and a control or an instrument fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after the gate run).
//  tmp/rt-probe1.log: the first probe used ringUnit(0, 1), which is e^(i pi / 3), not the knit's angle, and a pure-slot
//   start, where g stayed above 0.997 (a slot start keeps most of its weight in the flats). Both were corrected before
//   any gate was written. tmp/rt-probe1-move.log (32 cycles, the moving start, the knit's angle): |g| 0.62 to 0.92, the
//   traced state's CHSH up to 2.053 (|0>|+>) and 2.141 (|0>|0>), least S_u 3.659 (|0>|+>), 4.000 (|0>|0>, no negative
//   weight at any cycle), norms kept within 1e-12. The gates B (2.02) and X (3.8) sit under those by a margin, not at
//   them. The reader read the knit's knots at 2.36126 and 2.55228 there.
//  tmp/rt-probe2.log (8 cycles): Sigma(648) 648 / 216 / kernel 3 / affine / equal to the grid, V and U commutators 6e-16
//   and 6e-17, [g (x) g, V] 1.0; central trace 0, pair orbits 1; stream parity even; least occupancy 46, triggers 0; the
//   flats 1.5e-14, 3.4e-14 and 4.5e-14 from 1; the like channel's antisymmetric part 1.3e-30; the knit-literal control
//   5.5e-2. The flat gates sit at 1e-12, about 20 times the probe's floor.
//  tmp/rt-smoke.log ran every code path for two cycles (pass on every gate at 2 cycles, 91 s). It read the mirror at
//   1.3e-13 after 2 cycles, a float-order difference that can grow over 64, so M was set at 1e-10 rather than 1e-12
//   before the gate run. Norms were kept within 4.2e-12.
//
// FIRST RUN (tmp/rt-gate-E-FND-0160.log, 378 s): PASS, as predicted. No gate moved and none was rerun.
//  - G: the central move fixes 0 of the 8 nonzero grid points, the moves act on distinct pairs in 1 orbit; Sigma(648)
//    has 648 elements making 216 permutations, all affine of determinant 1 and equal to the grid moves, 3 acting as the
//    identity; [g (x) conj g, V] 6.5e-16, [g (x) g, U] 6.2e-17, [g (x) g, V] 1.000.
//  - S, K, C: slot stream even, traces 192 and 384; least occupancy 46 of 48 over 4,718,592 configurations, K and the
//    store 0; J and all 1,152 W(F4) elements commute exactly with 24 Q_S and 48 Q_D.
//  - F: the flats held within 4.8e-14 (unlike channel, moving), 6.1e-14 of 1 (frozen), 2.0e-14 (like channel), and the
//    like channel's antisymmetric part stayed at 1.2e-29.
//  - B: the traced role state's CHSH reached 2.0600 from |0>|+> and 2.1594 from |0>|0>. At the last cycle the
//    per-configuration role states reach 2.7484 and 2.8284 (Tsirelson to 2e-6), but only 0.4% and 3.8% of the pair's
//    weight lies above 2.5: postselection on a configuration finds near-maximal entanglement in a small share.
//  - X: the least context sum from |0>|+> is 3.6152, below the noncontextual 4.
//  - M: the mirrored pair's g agrees within 3.3e-13.
//  - g: |g| 0.568 to 0.922 and arg g -0.330 to 0.158 over 64 cycles, oscillating rather than decaying on this torus.
//  - Controls: CB (the product role state reads CHSH 2, W >= 0, S >= 4), CF (the knit-literal placement moves 0.115 of
//    a member out of the flats), CC (the register exchange moves J (x) 1). Instrument: the knit's knots read 2.36126047
//    and 2.55228475, S = 36 W + 4 on every state, norms within 3.3e-12.
//  - READ: from |0>|0> the traced state passes CHSH 2 at every cycle, and its Wigner function is negative somewhere at
//    some cycles (least -0.0028) and nowhere at others (26 of 32 cycles of tmp/rt-probe1-move.log with CHSH 2.05 to
//    2.14): Bell with arbitrary settings does not need a fear, as the knit's own top color rung, a stabilizer state,
//    already showed. The escape through fears is a statement about the model's own readings, and those are what X reads.
//    Mana up to 0.294, so the fear share of |W| is at most 0.13, under the knit's cap of a third.
//  THE AUDIT, as harshly as a stranger's. G, S, K and C are L1: checks of algebra that holds by construction, each with
//  a control that fails when the construction is changed (CC, the [g (x) g, V] teeth, CF). F is E-SPN-0175's theorem
//  applied to the new pieces. B and X are the finding, at L2: that two quantum walkers meeting through the sector carry
//  the knit's unlike kernel onto their roles at a measurable size after the orbit is traced. Their zero with the fear
//  beat off is structural (every other piece is role-blind), so the informative part is the size, 2.06 and 2.16 against
//  the knit's 2.36 and 2.55 for one clean meeting, and the dephasing |g| that sets it. Two holes, the 4d torus, flat
//  links, one start: no ledger row becomes held.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  commutesExactly,
  f4Group,
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
  trace,
  type GroupElement,
} from '@/code/measure/spinor-register'
import {
  evenBlade,
  rightMultiplication,
} from '@/code/measure/register-symmetry'
import {
  flatCount,
  movingBlocks,
  newPair,
  pairNorm,
  pairStart,
  seaCycle,
  seaTriggers,
  sectorBases,
  streamParity,
  torus,
  type Pair,
  type SeaRule,
} from '@/code/measure/register-sea'
import { exchangeParts } from '@/code/measure/register-crossing'
import { roleChsh } from '@/code/measure/role-bell'
import {
  applySinglet,
  blockChsh,
  centralGridTrace,
  conditionalRole,
  contextSums,
  dockPhaseCycle,
  gridPairOrbits,
  negativity,
  pairOverlap,
  productRole,
  pureOperator,
  reducedRole,
  sigmaReading,
  twoRoleWigner,
  type RoleVector,
} from '@/code/measure/role-register'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const FEAR: readonly [number, number] = [0, 2]
const CAP = 8
const SLOT_A = 0
const SLOT_B = 1
const REG = 8
const CAPACITY = 48
const READS: readonly number[] = [1, 2, 4, 8, 16, 32, 64]
const COMMUTE = 1e-12
const TEETH = 0.1
const FLAT = 1e-12
const SECTOR = 1e-20
const BELL = 2.02
const OVER = 1e-9
const CONTEXT = 3.8
const MIRROR = 1e-10
const LEAK = 1e-3
const KNIT_TOL = 1e-6
const IDENTITY = 1e-12
const NORM = 1e-9
const KNIT_COLOR_MIDDLE = 2.36126047374
const KNIT_COLOR_TOP = (2 + 4 * Math.SQRT2) / 3
const TSIRELSON = 2 * Math.SQRT2
const CONDITIONAL_HIGH = 2.5

export type RolesPlan = { L: number; cycles: number; reads: readonly number[] }

export const GATE_PLAN: RolesPlan = { L: 4, cycles: 64, reads: READS }

const flag = (b: boolean): number => (b ? 1 : 0)

const unit = (kj: readonly [number, number]): [number, number] => {
  const th = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(th), Math.sin(th)]
}

const ZERO: [number, number][] = [
  [1, 0],
  [0, 0],
  [0, 0],
]
const PLUS: [number, number][] = [
  [1 / Math.sqrt(3), 0],
  [1 / Math.sqrt(3), 0],
  [1 / Math.sqrt(3), 0],
]

// one role state's readings: CHSH by E-QTM-0100's see-saw, the least Wigner weight, the negativity and mana, the least
// context sum and the identity S_u = 36 W(u) + 4
type RoleRead = {
  chsh: number
  least: number
  neg: number
  mana: number
  context: number
  identity: number
}

function readRole(rho: ReturnType<typeof reducedRole>): RoleRead {
  const W = twoRoleWigner(rho)
  const S = contextSums(W)
  const n = negativity(W)

  let identity = 0

  for (let u = 0; u < 81; u++) {
    identity = Math.max(identity, Math.abs(S[u]! - 36 * W[u]! - 4))
  }

  return {
    chsh: roleChsh(rho),
    least: n.least,
    neg: n.neg,
    mana: n.mana,
    context: Math.min(...S),
    identity,
  }
}

// the largest entry of (J (x) 1) SWAP - SWAP (J (x) 1) on two members' registers, SWAP the register exchange
function exchangeMovesJ(J: readonly (readonly number[])[]): number {
  let worst = 0

  // SWAP e_a (x) e_b = e_b (x) e_a, so the two products are compared entry by entry
  for (let a = 0; a < REG; a++) {
    for (let b = 0; b < REG; b++) {
      for (let c = 0; c < REG; c++) {
        for (let d = 0; d < REG; d++) {
          // entry ((c, d), (a, b)) of (J (x) 1) SWAP: J[c][b] delta(d, a); of SWAP (J (x) 1): J[d][a] delta(c, b)
          const left = J[c]![b]! * (d === a ? 1 : 0)
          const right = J[d]![a]! * (c === b ? 1 : 0)

          worst = Math.max(worst, Math.abs(left - right))
        }
      }
    }
  }

  return worst
}

export function registerRolesRun(plan: RolesPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const u = unit(LIGHT)
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const fear = unitAngle(ringUnit(FEAR[0], FEAR[1]))
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
  const fearRule: SeaRule = { ...rule, contact: -2 * vAng - fear }
  const spare = newPair(T)

  let worstNorm = 0

  const noteNorm = (s: Pair): void => {
    worstNorm = Math.max(worstNorm, Math.abs(pairNorm(s) - 1))
  }

  // ---------------- G: the grid and the links ----------------
  const centralTrace = centralGridTrace()
  const pairOrbits = gridPairOrbits()
  const sigma = sigmaReading(fear)
  const G =
    centralTrace === 0 &&
    pairOrbits === 1 &&
    sigma.order === 648 &&
    sigma.permutations === 216 &&
    sigma.kernel === 3 &&
    sigma.affine &&
    sigma.sameAsGrid &&
    sigma.singletConjugate <= COMMUTE &&
    sigma.swapSame <= COMMUTE &&
    sigma.singletSame >= TEETH

  log(`G ${G}: central trace ${centralTrace}, pair orbits ${pairOrbits}, sigma ${JSON.stringify(sigma)}`)

  // ---------------- S, K: one branch, K blocked ----------------
  const parity = streamParity(T)
  const qS24 = singletProjector24()
  const qD48 = partnerProjector48()
  const traceS = trace(qS24)
  const traceD = trace(qD48)
  const S = parity.slot === 0 && traceS === 24 * REG && traceD === 48 * REG
  const triggers = seaTriggers(T, CAPACITY)
  const K =
    triggers.leastOccupancy === CAPACITY - 2 &&
    triggers.kTriggers === 0 &&
    triggers.storeTriggers === 0

  log(`S ${S} K ${K}: parity ${JSON.stringify(parity)}, traces ${traceS} ${traceD}, triggers ${JSON.stringify(triggers)}`)

  // ---------------- C, CC: chirality ----------------
  const Jm = rightMultiplication(evenBlade(REG - 1))
  const identitySlots = Int32Array.from({ length: 24 }, (_, d) => d)
  const J: GroupElement = {
    matrix: [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => (i === j ? 1 : 0))),
    slots: identitySlots,
    register: Jm,
  }
  const jCommutes = commutesExactly(J, qS24) && commutesExactly(J, qD48)
  const f4 = f4Group()

  let f4Off = 0

  for (const g of f4) {
    if (!commutesExactly(g, qS24) || !commutesExactly(g, qD48)) {
      f4Off++
    }
  }

  const C = jCommutes && f4.length === 1152 && f4Off === 0
  const exchangeJ = exchangeMovesJ(Jm)
  const CC = exchangeJ > 0

  log(`C ${C}: J ${jCommutes}, W(F4) ${f4.length} elements, ${f4Off} off; CC ${CC} (${exchangeJ})`)

  // ---------------- I1: the reader on the knit's knots ----------------
  const starts: Record<string, RoleVector> = {
    zeroPlus: productRole(ZERO, PLUS),
    zeroZero: productRole(ZERO, ZERO),
  }
  const knitMiddle = readRole(pureOperator(applySinglet(starts.zeroPlus!, (2 * Math.PI) / 3)))
  const knitTop = readRole(pureOperator(applySinglet(starts.zeroZero!, (2 * Math.PI) / 3)))
  const I1 =
    Math.abs(knitMiddle.chsh - KNIT_COLOR_MIDDLE) <= KNIT_TOL &&
    Math.abs(knitTop.chsh - KNIT_COLOR_TOP) <= KNIT_TOL

  log(`I1 ${I1}: knit knots ${knitMiddle.chsh} ${knitTop.chsh}`)

  // ---------------- CB: the fear beat off ----------------
  const off = Object.values(starts).map(chi => readRole(reducedRole(chi, [1, 0])))
  const CB = off.every(
    r => r.chsh <= 2 + OVER && r.least >= -IDENTITY && r.context >= 4 - IDENTITY,
  )

  // ---------------- the unlike pair: the two channels, and their mirror ----------------
  const qS = scaled(qS24, 24)
  const qD = scaled(qD48, 48)
  const mv = movingBlocks(T, [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])])
  const a = SLOT_A * REG
  const b = SLOT_B * REG
  const perp = pairStart(T, mv, 'W', a, 'W', b, 0)
  const phi = pairStart(T, mv, 'W', a, 'W', b, 0)
  const perpM = pairStart(T, mv, 'W', b, 'W', a, 0)
  const phiM = pairStart(T, mv, 'W', b, 'W', a, 0)
  const trace0 = Object.fromEntries(
    Object.keys(starts).map(k => [k, [] as RoleRead[]]),
  ) as Record<string, RoleRead[]>
  const gs: [number, number][] = []

  let mirror = 0
  let flatMove = 0

  log('moving blocks')

  for (let c = 1; c <= plan.cycles; c++) {
    seaCycle(T, rule, B, perp, spare)
    seaCycle(T, fearRule, B, phi, spare)
    seaCycle(T, rule, B, perpM, spare)
    seaCycle(T, fearRule, B, phiM, spare)

    const g = pairOverlap(perp, phi)
    const gM = pairOverlap(perpM, phiM)

    gs.push(g)
    mirror = Math.max(mirror, Math.hypot(g[0] - gM[0], g[1] - gM[1]))

    for (const [k, chi] of Object.entries(starts)) {
      trace0[k]!.push(readRole(reducedRole(chi, g)))
    }

    if (plan.reads.includes(c)) {
      flatMove = Math.max(flatMove, Math.abs(flatCount(T, mv, phi).nF))
      log(`cycle ${c}: g ${g[0].toFixed(5)} ${g[1].toFixed(5)}, CHSH ${Object.values(trace0).map(r => r[r.length - 1]!.chsh.toFixed(4)).join(' ')}, flats ${flatMove.toExponential(2)}`)
    }
  }

  for (const s of [perp, phi, perpM, phiM]) {
    noteNorm(s)
  }

  // the per-configuration role states at the last cycle (read)
  const conditional = Object.fromEntries(
    Object.entries(starts).map(([k, chi]) => {
      let best = 0
      let high = 0
      let total = 0

      for (let x = 0; x < perp.re.length; x++) {
        const v = conditionalRole(
          chi,
          [perp.re[x]!, perp.im[x]!],
          [phi.re[x]!, phi.im[x]!],
        )

        let w = 0

        for (let i = 0; i < 9; i++) {
          w += v.re[i]! ** 2 + v.im[i]! ** 2
        }

        if (w === 0) {
          continue
        }

        const ch = blockChsh(v)

        total += w
        best = Math.max(best, ch)
        high += ch > CONDITIONAL_HIGH ? w : 0
      }

      return [k, { best, high: high / total }]
    }),
  ) as Record<string, { best: number; high: number }>

  const chshMax = Object.fromEntries(
    Object.entries(trace0).map(([k, r]) => [k, Math.max(...r.map(x => x.chsh))]),
  ) as Record<string, number>
  const contextLeast = Math.min(...trace0.zeroPlus!.map(x => x.context))
  const allChsh = [
    ...Object.values(trace0).flatMap(r => r.map(x => x.chsh)),
    ...Object.values(conditional).map(x => x.best),
  ]
  const B_ =
    chshMax.zeroPlus! > BELL &&
    chshMax.zeroZero! > BELL &&
    allChsh.every(x => x <= TSIRELSON + OVER)
  const X = contextLeast < CONTEXT
  const M = mirror <= MIRROR
  const I2 = Object.values(trace0).every(r => r.every(x => x.identity <= IDENTITY))

  log(`B ${B_} X ${X} M ${M}: CHSH max ${JSON.stringify(chshMax)}, least S ${contextLeast}, mirror ${mirror}`)

  // ---------------- F: the flats, on the other starts ----------------
  const frozen = pairStart(T, mv, 'F', a, 'W', b, 0)
  const like = pairStart(T, mv, 'W', a, 'W', b, 1)
  const literal = pairStart(T, mv, 'F', a, 'W', b, 0)

  let flatFrozen = 0
  let flatLike = 0
  let likeAnti = 0
  let literalLeak = 0

  for (let c = 1; c <= plan.cycles; c++) {
    seaCycle(T, fearRule, B, frozen, spare)
    seaCycle(T, fearRule, B, like, spare)
    dockPhaseCycle({ t: T, rule, bases: B, pair: literal, spare, angle: -fear })
    likeAnti = Math.max(likeAnti, exchangeParts(T, like).antisymmetric)

    if (plan.reads.includes(c)) {
      flatFrozen = Math.max(flatFrozen, Math.abs(flatCount(T, mv, frozen).nF - 1))
      flatLike = Math.max(flatLike, Math.abs(flatCount(T, mv, like).nF))
      literalLeak = Math.max(literalLeak, Math.abs(flatCount(T, mv, literal).nF - 1))
      log(`flats cycle ${c}: frozen ${flatFrozen.toExponential(2)} like ${flatLike.toExponential(2)} literal ${literalLeak.toExponential(2)}`)
    }
  }

  for (const s of [frozen, like, literal]) {
    noteNorm(s)
  }

  const F =
    flatMove <= FLAT &&
    flatFrozen <= FLAT &&
    flatLike <= FLAT &&
    likeAnti <= SECTOR
  const CF = literalLeak > LEAK
  const I3 = worstNorm <= NORM
  const hard = G && S && K && C && F && B_ && X && M
  const controls = CB && CF && CC
  const instrument = I1 && I2 && I3
  const status = !hard ? 'fail' : !controls || !instrument ? 'partial' : 'pass'
  const gAbs = gs.map(g => Math.hypot(g[0], g[1]))
  const gArg = gs.map(g => Math.atan2(g[1], g[0]))
  const bellNoFear = trace0.zeroZero!.filter(x => x.chsh > 2 + OVER)
  const metrics: Record<string, number> = {
    G: flag(G),
    S: flag(S),
    K: flag(K),
    C: flag(C),
    F: flag(F),
    B: flag(B_),
    X: flag(X),
    M: flag(M),
    CB: flag(CB),
    CF: flag(CF),
    CC: flag(CC),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    sigmaSingletConjugate: sigma.singletConjugate,
    sigmaSwapSame: sigma.swapSame,
    sigmaSingletSame: sigma.singletSame,
    leastOccupancy: triggers.leastOccupancy,
    flatMove,
    flatFrozen,
    flatLike,
    likeAnti,
    literalLeak,
    chshZeroPlus: chshMax.zeroPlus!,
    chshZeroZero: chshMax.zeroZero!,
    contextLeast,
    leastWZeroPlus: Math.min(...trace0.zeroPlus!.map(x => x.least)),
    leastWZeroZero: Math.min(...trace0.zeroZero!.map(x => x.least)),
    manaMax: Math.max(...trace0.zeroPlus!.map(x => x.mana)),
    gAbsMin: Math.min(...gAbs),
    gAbsMax: Math.max(...gAbs),
    gArgMin: Math.min(...gArg),
    gArgMax: Math.max(...gArg),
    mirror,
    conditionalBestZeroPlus: conditional.zeroPlus!.best,
    conditionalBestZeroZero: conditional.zeroZero!.best,
    conditionalHighZeroPlus: conditional.zeroPlus!.high,
    conditionalHighZeroZero: conditional.zeroZero!.high,
    bellWithoutFearCycles: bellNoFear.length,
    bellWithoutFearLeastW: bellNoFear.length > 0 ? Math.min(...bellNoFear.map(x => x.least)) : 0,
    knitMiddle: knitMiddle.chsh,
    knitTop: knitTop.chsh,
    worstNorm,
    seconds: (Date.now() - started) / 1000,
  }

  gs.forEach((g, i) => {
    if (plan.reads.includes(i + 1)) {
      metrics[`gAbs_c${i + 1}`] = Math.hypot(g[0], g[1])
      metrics[`gArg_c${i + 1}`] = Math.atan2(g[1], g[0])
    }
  })

  return verdict({
    status,
    claim: `G ${G} (central move fixes ${centralTrace} of 8 nonzero points, ${pairOrbits} orbit on distinct pairs; Sigma(648) ${sigma.order} elements, ${sigma.permutations} permutations, kernel ${sigma.kernel}, affine ${sigma.affine}, equal to the grid ${sigma.sameAsGrid}; [g x conj g, V] ${sigma.singletConjugate.toExponential(2)}, [g x g, U] ${sigma.swapSame.toExponential(2)}, [g x g, V] ${sigma.singletSame.toFixed(3)}); S ${S} (slot stream parity ${parity.slot}, traces ${traceS} ${traceD}); K ${K} (least occupancy ${triggers.leastOccupancy} of ${CAPACITY} over ${triggers.configurations} configurations, K ${triggers.kTriggers}, store ${triggers.storeTriggers}); C ${C} (J ${jCommutes}, ${f4Off} of ${f4.length} W(F4) elements off); F ${F} (unlike channel moving ${flatMove.toExponential(2)}, frozen ${flatFrozen.toExponential(2)}, like channel ${flatLike.toExponential(2)}, its antisymmetric part ${likeAnti.toExponential(2)}); B ${B_} (the traced role state's CHSH up to ${chshMax.zeroPlus!.toFixed(4)} from |0>|+> and ${chshMax.zeroZero!.toFixed(4)} from |0>|0>; per configuration at the last cycle up to ${conditional.zeroPlus!.best.toFixed(4)} and ${conditional.zeroZero!.best.toFixed(4)}); X ${X} (least context sum ${contextLeast.toFixed(4)}); M ${M} (${mirror.toExponential(2)}); |g| ${Math.min(...gAbs).toFixed(4)} to ${Math.max(...gAbs).toFixed(4)}, arg g ${Math.min(...gArg).toFixed(4)} to ${Math.max(...gArg).toFixed(4)}; controls CB ${CB} CF ${CF} (${literalLeak.toExponential(2)}) CC ${CC}; instrument I1 ${I1} (${knitMiddle.chsh.toFixed(8)}, ${knitTop.chsh.toFixed(8)}) I2 ${I2} I3 ${I3} (${worstNorm.toExponential(2)})`,
    metrics,
    control: {
      CB: flag(CB),
      CF: flag(CF),
      CC: flag(CC),
      literalLeak,
      instrument: flag(instrument),
    },
    notes: `L1 (the grid, the links, one branch, K, chirality) and L2 (the two-hole runs). The 4d D4 torus L ${plan.L}, ${T.sites.length} relative docks, not the husk; C* is not the adopted rule; two holes, one of each tone, on flat links. Slots ${SLOT_A} and ${SLOT_B}, register 0, moving start. Traced CHSH is the see-saw of code/measure/role-bell (a lower bound), per-configuration CHSH the Schmidt block value (a lower bound). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'foundations/register-roles',
  code: 'E-FND-0160',
  title:
    "roles, a tone, flat Sigma(648) links and the fear beat put on the many-body register rule (C*) keep one branch, the frozen flats, K blocked and chirality, and an unlike pair meeting through the sector entangles its roles, pass: the role is a qutrit (the grid's 9 points are its phase space; the central grid move fixes 0 of 8 nonzero points while -1 acts on the register with trace +-8, so the grid is not the register's 8 parts), the tone a species (a love-sea hole is fear-tone), the fear-tone role in 3-bar (forced by the singlet), and Sigma(648) acts on the role as exactly the 216 grid moves; the fear beat as a sector contact keeps the flats within 6e-14 while the knit-literal placement releases 0.115, K stays blocked (least occupancy 46 of 48) and 24 Q_S, 48 Q_D commute with J and all 1,152 W(F4) elements; an unlike pair's traced role state is fixed by one overlap g (|g| 0.57 to 0.92) and reaches CHSH 2.060 from |0>|+> and 2.159 from |0>|0>, never past 2 sqrt 2, and is contextual for the model's readings (least context sum 3.615), none of it with the fear beat off; the mirrored pair agrees to 3e-13; the kernels read no isospin and join no halves",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerRolesRun(GATE_PLAN)
  },
})
