// IS SU(2) BROKEN BY THE VACUUM AND NOT BY THE KNIT, ON THE REGISTER RULE? (E-FRC-0268). The constraint "SU(2) is broken
// by the vacuum, not by the knit" is broken on the turning weave: all 144 of its rule blocks keep only the charge U(1),
// so the arrow breaks SU(2) explicitly, and its period-24 condensate is Higgs-like with no Higgs mechanism (E-FRC-0143).
// It was never read on the adopted knit. This file reads it on the register rule, where an SU(2) can be named exactly.
//
// DIAGNOSIS (the cause, on the turning weave). A rule that is not covariant under an SU(2) breaks it explicitly, whatever
// its vacuum does. The turning weave's arrow picks one direction in every line's internal space, so no SU(2) survives in
// its blocks. For the constraint the rule must keep an SU(2) exactly and its vacuum must not.
//
// DERIVED BEFORE THE RUN (L1).
// 1. THE RULE KEEPS SU(2) x SU(2). Every piece is X (1 + sum (u_k - 1) q_k), with q_k built from Q_S = Pi1 (x) 1, Q_D =
//    Phi^dag Phi / 4 (Phi(a (x) w) = gamma(a) w, LEFT Clifford multiplication) and J = R(vol). A right multiplication R(x)
//    commutes with every left one, and Phi R(x) = R_odd(x) Phi, so R(x) commutes with Q_D, with Q_S and with J, for every
//    even x: the commutant of the rule holds R(Cl+(4)) = R(H+ + H-). Its norm-one elements are SU(2)+ x SU(2)-, one SU(2)
//    acting on each chiral half and nothing on the other. The singlet-pair string (E-SPN-0162, phases on Q_S (x) Q_S and
//    Q_D (x) Q_D) and the register exchange (E-SPN-0163) commute with R(x) (x) R(x) for the same reason.
// 2. IT IS INTERNAL. Left and right multiplications commute, so R(x) commutes with the untwisted rotation L(s) (E-FRC-0267
//    point 2), the spinor action of the 576 rotations: SU(2)+ commutes with space rotations and with spin.
// 3. THE VACUUM KEEPS IT. The full sea's amplitude under a one-body unitary V is det V. For V in SU(2)+ acting on all 192
//    modes, det V = 1 (every generator is traceless: X_k^2 = -P+ on an 8-dimensional register, eigenvalues +-i in pairs).
//    So the full sea, the working vacuum of the candidate rule, is invariant: THE VACUUM DOES NOT BREAK SU(2). The
//    constraint's first clause then fails on this rule, by a different cause than on the turning weave.
// 4. A BROKEN VACUUM EXISTS AND IS STATIONARY, BUT NOTHING SELECTS IT. U commutes with X_1, so each eigenspace of X_1 (+i
//    and -i, on half +) is invariant, and a sea filled on one of them is stationary. X_2 anticommutes with X_1 and swaps
//    them, so that sea is not invariant: a degenerate family of vacua, SU(2)+/U(1), is in the rule's state space. What
//    would pick one over the full sea is an energy, and the rule has no energy ledger (OPEN-FND-14).
// 5. THE CHIRAL SCREEN NEEDS IT. On the chiral slab (E-FRC-0267) every light level of a face lies in the Wilson half, where
//    X_k^2 = -1 leaves no invariant vector, so the light members are SU(2)+ doublets of one hand, the shape of the weak
//    doublets. A mass that pairs one hand with the other on the same face must join the halves, and no one-body piece
//    that keeps the Dirac structure can (E-FRC-0259, a theorem: such pieces are right multiplications, and vol is
//    central). So on a one-sided screen these doublets are massless until a many-body condensate joins the halves, and
//    that condensate carries SU(2)+ charge: a Higgs field is not optional on this rule, it is what a mass needs.
//
// PREDICTED: H1 to H3 hold (the knit keeps SU(2)), H5 holds (the screen's light levels are in one half, in doublets), and
// V FAILS (the vacuum keeps SU(2)). Verdict fail, on V, as derived.
//
// GATES, fixed before the gate run.
//  H1 THE KNIT KEEPS IT. For each of 24 Q_S, 48 Q_D, 96 Q_D P+, 48 Q_S P+ and 2 P+ and each of the 8 even blades e_B, Q
//     (1 (x) R(e_B)) = (1 (x) R(e_B)) Q exactly.
//  H2 AN SU(2) ON ONE HALF. With Y_k = R(e_0k) (1 + J) (twice the generator on half +, an integer matrix): Y_k^2 = -2 (1 +
//     J), Y_1 Y_2 = -Y_2 Y_1 = +-2 Y_3, Y_k (1 - J) = 0, exactly; the same with (1 - J) for half -.
//  H3 INTERNAL. Each Y_k commutes with the untwisted rotation L(s) of all 576 rotations (the lifts of code/measure/
//     register-symmetry) to 1e-12.
//  V  THE VACUUM BREAKS IT (predicted to FAIL). Some generator acts on the full sea nontrivially: the trace of 1 (x) Y_k
//     over the 192 modes is nonzero for some k.
//  H5 THE SCREEN'S DOUBLETS. On the chiral slab (L = 12, ringUnit(-2, 5), Wilson on half +) at k = 0, the levels within
//     0.1 of the member's rest (the in-gap levels) number more than 0 in half + and 0 in half -, and their count in half +
//     is even.
// CONTROLS (a failure makes the verdict partial). C1 A PIECE THAT BREAKS IT IS CAUGHT: the projector on the volume blade
//  (E-FRC-0259's phase piece, 1 (x) |vol><vol|) fails H1's check for some e_B. C2 THE LEFT MULTIPLICATIONS ARE NOT
//  SYMMETRIES: some L(e_B) fails to commute with 48 Q_D.
// READ, gating nothing: the traces, the commutator gaps, the in-gap levels.
// Verdict: fail if H1, H2, H3, H5 or V fails; partial if a control fails; pass otherwise.
//
// FIRST RUN (tmp/bc-su2-gate-run1.log, 6 s): FAIL on V alone, as derived. No gate moved.
//  - H1: every commutator gap 0 (5 projectors, 8 blades). H2: both halves' generators obey the quaternion relations
//    exactly and annihilate the other half. H3: each generator commutes with all 576 untwisted rotations (gap 0).
//  - V FAILS: the six generators' traces on the 192 modes are 0 0 0 0 0 0, so the full sea is invariant and the vacuum
//    does not break SU(2).
//  - H5: 8 in-gap levels in half + at +-1.220e-4 (the wall member's mass at L = 12, E-SPN-0168's 0.000122), 0 in half -.
//  - C1 and C2 hold.
//
// DETERMINISM: no random numbers. EXACT: blades, projectors and the Y_k are integer matrices; the spin lifts and the slab
// spectrum are floats, as measurement.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { DOCK_ROOTS, type CMatrix } from '@/code/measure/dock-mixer'
import {
  EVEN,
  f4Group,
  matMul,
  partnerProjector48,
  rangeBasis,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  chirality2,
  det4,
  sectorBasis,
  sectorBlock,
  volumeRight,
} from '@/code/measure/chiral-register'
import { halfPieces } from '@/code/measure/chiral-flow'
import {
  wilsonSchedule,
  type HalfSet,
  type Slab,
} from '@/code/measure/wilson-register'
import { slabLevels } from '@/code/measure/wall-face'
import {
  evenBlade,
  IDENTITY_SLOTS,
  leftMultiplication,
  liftedTrace,
  mul8,
  registerGap,
  rightMultiplication,
  spinLift,
} from '@/code/measure/register-symmetry'

const HEAVY: readonly [number, number] = [-2, 5]
const LIFT_TOLERANCE = 1e-12
const IN_GAP = 0.1

export type Su2Plan = { wallL: number }

export const GATE_PLAN: Su2Plan = { wallL: 12 }

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/register-internal-su2',
  code: 'E-FRC-0268',
  title:
    'the register rule keeps an SU(2) on each chiral half exactly and its vacuum keeps it too, fail as derived (SU(2) is not broken by the knit, and not by the vacuum either): every piece commutes with the right multiplications of Cl+(4) = H + H, so SU(2)+ x SU(2)- acts on the two register halves, commutes with the spinor rotation, and is internal; the full sea is invariant, since every generator is traceless; on the chiral slab every light level of a face lies in the Wilson half, as SU(2)+ doublets of one hand, and since no one-body piece can join the halves their mass needs a many-body condensate that carries SU(2)+ charge, a vacuum the rule allows and nothing yet selects',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerSu2Run(GATE_PLAN)
  },
})

const unitValue = (kj: readonly [number, number]): [number, number] => {
  const t = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(t), Math.sin(t)]
}

const sameMatrix8 = (
  a: readonly (readonly number[])[],
  b: readonly (readonly number[])[],
  k = 1,
): boolean => a.every((row, i) => row.every((x, j) => x === k * b[i]![j]!))

export function registerSu2Run(plan: Su2Plan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const J = volumeRight()
  const chi2 = chirality2(J, 1)
  const ruleQ = [S24, D48, matMul(D48, chi2), matMul(S24, chi2), chi2]

  // ---- H1 ----
  const blades = EVEN.map((_, b) => rightMultiplication(evenBlade(b)))
  const h1Gaps = ruleQ.map(q =>
    Math.max(...blades.map(R => registerGap(q, IDENTITY_SLOTS, R))),
  )
  const H1 = h1Gaps.every(g => g === 0)

  // ---- H2 ----
  const I8 = EVEN.map((_, i) => EVEN.map((__, j) => (i === j ? 1 : 0)))
  const onePlus = I8.map((row, i) => row.map((x, j) => x + J[i]![j]!))
  const oneMinus = I8.map((row, i) => row.map((x, j) => x - J[i]![j]!))
  const idx = (b: string): number => EVEN.findIndex(x => x.join(',') === b)
  const gens = (half: number[][]): number[][][] =>
    ['0,1', '0,2', '0,3'].map(b =>
      mul8(rightMultiplication(evenBlade(idx(b))), half),
    )
  const zero8 = I8.map(row => row.map(() => 0))
  const su2On = (half: number[][], other: number[][]): boolean => {
    const Y = gens(half)
    const [Y1, Y2, Y3] = Y as [number[][], number[][], number[][]]
    const squares = Y.every(y => sameMatrix8(mul8(y, y), half, -2))
    const y12 = mul8(Y1, Y2)
    const y21 = mul8(Y2, Y1)
    const anti = sameMatrix8(y12, y21, -1)
    const closes = sameMatrix8(y12, Y3, 2) || sameMatrix8(y12, Y3, -2)
    const annihilates = Y.every(y => sameMatrix8(mul8(y, other), zero8))

    return squares && anti && closes && annihilates
  }
  const H2 = su2On(onePlus, oneMinus) && su2On(oneMinus, onePlus)
  const Yplus = gens(onePlus)

  log('H1 H2')

  // ---- H3 ----
  const rotations = f4Group().filter(g => det4(g.matrix) === 1)

  let internalGap = 0

  for (const g of rotations) {
    const Ls = leftMultiplication(spinLift(g.matrix).s)

    for (const Y of Yplus) {
      const a = mul8(Ls, Y)
      const b = mul8(Y, Ls)

      internalGap = Math.max(
        internalGap,
        ...a.flatMap((row, i) => row.map((x, j) => Math.abs(x - b[i]![j]!))),
      )
    }
  }

  const H3 = rotations.length === 576 && internalGap <= LIFT_TOLERANCE

  log('H3')

  // ---- V: the vacuum ----
  const traces = [...Yplus, ...gens(oneMinus)].map(liftedTrace)
  const V = traces.some(t => t !== 0)

  // ---- H5: the screen's doublets ----
  const qS = scaled(S24, 24)
  const qD = scaled(D48, 48)
  const basis = sectorBasis(J)
  const uH = unitValue(HEAVY)
  const trivial = wilsonSchedule(qS, qD, uH, { wilson: false })
  const chiral = wilsonSchedule(qS, qD, uH, {
    wilson: true,
    half: scaled(chi2, 2),
  })
  const setsOf = (P: CMatrix[], half: 0 | 1): HalfSet[] => [
    { pieces: halfPieces(trivial, basis, half).pieces },
    { pieces: halfPieces(P, basis, half).pieces },
  ]
  const rangeOf = (q: Float64Array, half: 0 | 1): number[][] =>
    rangeBasis(
      sectorBlock({ re: q, im: new Float64Array(q.length) }, basis, half)
        .block.re,
      96,
    )
  const L = plan.wallL
  const slab: Slab = {
    L,
    qa: 1,
    p: 0,
    profile: Array.from({ length: L }, (_, c) => (c < L / 2 ? 1 : 0)),
  }
  const inGap = ([0, 1] as const).map(
    half =>
      slabLevels(
        slab,
        setsOf(chiral, half),
        [0, 0, 0, 0],
        DOCK_ROOTS,
        rangeOf(qS, half),
        rangeOf(qD, half),
        false,
      ).eps.filter(x => Math.abs(x) < IN_GAP),
  )
  const H5 =
    inGap[0]!.length > 0 &&
    inGap[0]!.length % 2 === 0 &&
    inGap[1]!.length === 0

  log('H5')

  // ---- controls ----
  const volIndex = idx('0,1,2,3')
  const volProjector = new Float64Array(192 * 192)

  for (let d = 0; d < 24; d++) {
    const i = d * 8 + volIndex

    volProjector[i * 192 + i] = 1
  }

  const C1 = blades.some(R => registerGap(volProjector, IDENTITY_SLOTS, R) > 0)
  const C2 = EVEN.some(
    (_, b) =>
      registerGap(D48, IDENTITY_SLOTS, leftMultiplication(evenBlade(b))) >
      0,
  )

  const hard = H1 && H2 && H3 && H5 && V
  const status = !hard ? 'fail' : !C1 || !C2 ? 'partial' : 'pass'

  return verdict({
    status,
    claim: `H1 ${H1} (commutator gaps ${h1Gaps.join(' ')}) H2 ${H2} H3 ${H3} (576 rotations, untwisted gap ${internalGap.toExponential(1)}) V ${V} (the vacuum breaks SU(2): traces of the six generators on the 192 modes ${traces.join(' ')}) H5 ${H5} (in-gap levels at k = 0: half + ${inGap[0]!.length} at ${inGap[0]!.map(x => x.toExponential(3)).join(' ')}, half - ${inGap[1]!.length}); controls C1 ${C1} C2 ${C2}`,
    metrics: {
      H1: flag(H1),
      H2: flag(H2),
      H3: flag(H3),
      V: flag(V),
      H5: flag(H5),
      C1: flag(C1),
      C2: flag(C2),
      internalGap,
      inGapPlus: inGap[0]!.length,
      inGapMinus: inGap[1]!.length,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2) },
    notes: `L1 (the commutant, the halves, the traces) and L2 (the slab's levels). Slab L ${L}, unit ringUnit(${HEAVY.join(', ')}). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
