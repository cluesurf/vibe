// sin^2(theta_W) FROM A TRACE OVER THE REGISTER (E-FRC-0280, the route "sin²θ from a trace" in
// note/research/vibe/roadmap/routes/matter-forces-numbers.md, section "the weak force" row at line 522, and its echo "the
// trace over the register" at line 772 of section "O · sin²θ_W"). The route: at a unification point sin^2(theta_W) =
// Tr(T3^2) / Tr(Q^2) over every charged mode; the register's modes carry SU(2)+ isospin and the charge (love - fear) / 3,
// so the ratio is an exact count over the rule's own content, not 3/8 by assumption. Its kill, in its own words: "the
// charges cannot be assigned consistently, or the ratio comes out where no running can reach 0.2312".
//
// WHAT IS RUN. Exact traces over the modes of one register member, 576 = 24 slots x 8 register components x 3 flavors
// (E-SPN-0160, E-FRC-0259), with the charges the code gives them, and a one-loop run of the result to M_Z.
//
// WHICH MODES CARRY WHICH (Q, T3), read from the code before the run.
//  T3. SU(2)+ is right multiplication by the unit quaternions of the half + of Cl+(4) = H+ + H- (E-FRC-0268,
//    code/measure/register-symmetry rightMultiplication, chiral-register volumeRight). Its generators X_k = R(e_0k) P+,
//    P+ = (1 + J) / 2, are real antisymmetric 8 x 8 integer matrices with X_k^2 = -P+, so T3 = (i / 2) X_1 is Hermitian
//    with eigenvalues +-1/2 on half + (two doublets a slot, E-FRC-0271) and 0 on half - (the SU(2)+ singlets). It acts
//    as 1 on the slot and on the flavor. The axis (X_1, X_2 or X_3) is a choice of basis; all three are run.
//  Q. The code puts charge on the tone, not on the register: the pleasure field and the pain field fill their own seas, a
//    hole of the pain sea is a pleasure-tone member (+1 vibe) and a hole of the pleasure sea a pain-tone member (-1 vibe)
//    (code/measure/role-register, E-FND-0160); the rishon reading counts that vibe in thirds, Q = (love - fear) / 3
//    (E-FRC-0243, E-FRC-0170). Every piece of the register rule acts as 1 on the tone, and no code reads the tone on the
//    register, the slot or the flavor. So Q is the constant +1/3 on every one of a pleasure-tone member's 576 modes and -1/3
//    on a pain-tone member's, where SU(2)+ acts in the conjugate representation.
//  THE CANDIDATES the code allows, each gated: A1 one pleasure-tone member, Q = +1/3 on its 576 modes; A2 a pleasure-tone and a
//    pain-tone member together (1,152 modes); A3 Q in whole vibes (+1 on a pleasure-tone member), in case "charge" is read
//    as the vibe and not its third. The assignment of T3 is not ambiguous beyond the axis.
//
// DERIVED BEFORE THE GATE RUN (L1).
// 1. Tr T3^2 = -(1/4) Tr X_1^2 = Tr P+ / 4 = 1 a slot, so 24 x 3 = 72 over a member's 576 modes.
// 2. Tr Q^2 = 576 / 9 = 64 (A1), 128 against Tr T3^2 = 144 (A2), 576 (A3).
// 3. THE RATIO: 72 / 64 = 9/8 (A1, A2) and 1/8 (A3). 9/8 exceeds 1, which no angle has.
// 4. CONSISTENCY. The trace formula is Georgi and Glashow's only when Q = T3 + Y with Y commuting with SU(2) (the photon
//    is a combination of W3 and the U(1)). Then Tr(Q T3) = Tr(T3^2) + Tr(Y T3) = Tr(T3^2), since Tr(Y T3) vanishes on
//    every SU(2) multiplet, and Tr Q^2 = Tr T3^2 + Tr Y^2 is at least Tr T3^2. A charge that depends on the tone alone
//    commutes with all of SU(2)+, so Q - T3 does not (it holds -T3, and [T3, T1] is not 0), and Tr(Q T3) = q Tr(T3) =
//    0 against Tr T3^2 = 72. So no candidate the code allows is consistent, whatever the scale of Q: the photon of this
//    charge has no W3 in it, Q is pure hypercharge, and Tr T3^2 / Tr Q^2 is not a mixing angle. The kill's first clause
//    fires; for A1 and A2 the second fires too, since 9/8 is not a sin^2 (Y would need Tr Y^2 = -8).
// 5. WHAT A CONSISTENT CHARGE WOULD NEED (read, gating nothing): Q must hold T3 itself. The two shortest constructions
//    on the same register: B, Q = T3+ + tone / 6 (the left-handed quark doublet's hypercharge on half +, a singlet charge
//    1/6 on half -), ratio 1 / (1 + 2/9) = 9/11 a member; C, the left-right form Q = T3+ + T3- + tone / 6 (Pati and
//    Salam's B - L read as the tone in thirds, half - as the right hand), charges 2/3 and -1/3 on both halves, ratio 9/20,
//    the value of quark content without leptons. Neither is (pleasure - pain) / 3: each is a new charge, not a reading.
// 6. THE RUN. With 1/alpha_i(M_Z) = 1/alpha_U + (b_i / 2 pi) L, L = ln(M_X / M_Z), 1/alpha_em = 1/alpha_2 + 1/alpha_Y
//    and Y = Q - T3 with physical normalization, sin^2(M_Z) = s0 + (alpha_em L / 2 pi) ((1 - s0) b_2 - s0 b_Y). For any
//    s0 strictly between 0 and 1 some content (b_2, b_Y) and some M_X below the Planck mass reach 0.2312; for s0 >= 1
//    or an inconsistent Q there is no run, since there is no U(1) coupling with a real square to run. Which content the
//    model has is the census (route "run with the model's content"), not run here; the coefficient the target needs at
//    M_X = M_Planck is read.
//
// PROBES BEFORE THE GATES, disclosed. tmp/mt-probe1.ts (log tmp/mt-probe1.log): Tr J = 0, Tr P+ = 4, each X_k is
// antisymmetric with Tr X_k = 0 and Tr X_k^2 = -4, and [X_1, X_2] = +-2 X_3. Nothing else was run before the gates.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: for k = 1, 2, 3, X_k^2 = -P+, X_k P- = 0, X_k antisymmetric and traceless, exactly; the Casimir
//     sum_k T_k^2 = (3/4) P+ (every half + mode in a doublet); Tr T3^2 over a member is the same for all three axes.
//  I2 INSTRUMENT: the one-loop run of point 6, solved with the strong coupling for the meeting scale, reproduces
//     code/dynamics/renormalization-group predictWeinbergAngle (E-FRC-0054) with s0 = 3/8 for the SM and MSSM
//     coefficients to 1e-12.
//  C1 CONTROL (the instrument can read the other outcome): the same trace and consistency check reads the Standard
//     Model generation (code/measure/standard-model-charges) as consistent with ratio exactly 3/8 and Tr(Q T3) =
//     Tr(T3^2), and reads construction B on the register's own matrices as consistent (Y = Q - T3 commutes with X_1,
//     X_2, X_3 exactly, Tr(Q T3) = Tr T3^2) with s0 strictly between 0 and 1.
//  H1 THE ROUTE: some candidate the code allows (A1, A2, A3, any axis) assigns consistently: Q - T3 commutes with the
//     three generators exactly and Tr(Q T3) = Tr(T3^2).
//  H2 THE ROUTE: for that candidate s0 = Tr T3^2 / Tr Q^2 lies strictly between 0 and 1, so a run can reach 0.2312.
//  P1 FALSIFIER (predicted): every candidate fails H1 (Tr(Q T3) = 0 against 72 a member), and A1, A2 give s0 = 9/8.
// VERDICT, fixed before the gate run: FAIL when no candidate holds both H1 and H2 (the route's kill); PARTIAL when I1,
// I2 or C1 fails and the verdict would otherwise be pass; PASS when a candidate holds H1 and H2 and the instruments and
// control hold. PREDICTED: FAIL, on H1 for every candidate.
//
// FIRST RUN 2026-10-02 (tmp/mt-run1.log, 0.01 s): FAIL, as derived, on H1 and H2 for every candidate; no gate moved, not
//  rerun. Over a member's 576 modes: A1 Tr T3^2 72, Tr Q^2 64, Tr(Q T3) 0, s0 = 9/8; A2 144, 128, 0, 9/8; A3 72, 576,
//  0, 1/8; in each Q - T3 fails to commute with SU(2)+, and the three axes read identically. I1 holds; C1 holds (the
//  Standard Model generation reads 3/8 and consistent, construction B consistent). Reads: B Tr Q^2 88, Tr(Q T3) 72,
//  s0 = 9/11; C Tr Q^2 160, Tr(Q T3) 72, s0 = 9/20; the coefficient (1 - s0) b2 - s0 bY that reaches 0.2312 is -11.97
//  for B and -4.46 for C at M_X = M_Planck (-14.29 and -5.33 at 2e16 GeV).
//  I2 FAILS (gaps 3.4e-2 and 9.0e-2), on a defect of point 6's code found by the run: predictFromStrong and the SM
//  read take bY = h b1 with h = s0 / (1 - s0), where the GUT normalization 1/alpha_1 = h / alpha_Y gives bY = b1 / h.
//  A check after the run (tmp/mt-check1.ts, log tmp/mt-check1.log), with bY = b1 (1 - s0) / s0, reproduces
//  predictWeinbergAngle to 0 and 6e-17 (0.20744 SM, 0.23080 MSSM), and puts the SM's combination at -109/24 = -4.542
//  (not the printed -2.902) and the SM run from 3/8 at 2e16 GeV at 0.1885 (not 0.2558). The defect touches no gate that
//  decides the verdict (H1 and H2 are exact traces; the "needed" coefficients of B and C use no b1) and, by the rule
//  fixed above, an instrument failure changes only a pass. So the result stands as a fail with I2 recorded failed.
//  WHAT IT MEANS. The code puts charge on the tone, and the tone is blind to the register, so the route's charge is
//  pure hypercharge: its photon holds no W3 and the trace ratio is not a weak angle. The route dies as written. A weak
//  angle from the register needs a charge that holds T3, a new piece; with the shortest two the ratio is 9/11 or 9/20,
//  and 9/20, the quark-only value, needs (1 - s0) b2 - s0 bY near -4.5 at the Planck mass, about the SM's own -4.54.
//
// WHAT THIS CAN AND CANNOT SHOW. It can show that the charge the code gives the register's modes is or is not an
// electroweak charge in Georgi and Glashow's sense, and what the trace is. It cannot say what a new charge assignment
// would give beyond the two constructions read, it does not decide the model's beta coefficients (the census), and it
// does not touch the route "one bulk coupling for all three". A fail here kills the route as written, with Q =
// (pleasure - pain) / 3; it leaves open a charge that holds T3, which would be a new piece.
//
// PRIOR ART: Georgi and Glashow 1974 (PRL 32, 438); Georgi, Quinn and Weinberg 1974 (PRL 33, 451); Pati and Salam 1974
// (PRD 10, 275) for the left-right form of construction C; Harari 1979 (PLB 86, 83) for the rishon thirds.
//
// Depth L1: exact integer and rational traces; the run is a float with its residual reported. DETERMINISM: no random
// numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { EVEN } from '@/code/measure/spinor-register'
import { volumeRight } from '@/code/measure/chiral-register'
import {
  evenBlade,
  mul8,
  rightMultiplication,
} from '@/code/measure/register-symmetry'
import {
  STANDARD_MODEL_GENERATION,
  weinbergAngleAtUnification,
} from '@/code/measure/standard-model-charges'
import { predictWeinbergAngle } from '@/code/dynamics/renormalization-group'

const SLOTS = 24
const FLAVORS = 3
const REG = 8
const MEMBER_MODES = SLOTS * REG * FLAVORS
const TARGET = 0.2312
const ALPHA_EM_INVERSE = 127.95
const ALPHA_STRONG_INVERSE = 1 / 0.1184
const M_Z = 91.19
const M_PLANCK = 1.22e19
const M_GUT = 2e16
const BETA_SM: [number, number, number] = [41 / 10, -19 / 6, -7]
const BETA_MSSM: [number, number, number] = [33 / 5, 1, -3]
const RUN_TOLERANCE = 1e-12

const flag = (b: boolean): number => (b ? 1 : 0)

// ---- exact rationals ----

type Frac = { n: bigint; d: bigint }

const gcd = (a: bigint, b: bigint): bigint => {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y !== 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

const frac = (n: bigint, d: bigint): Frac => {
  const s = d < 0n ? -1n : 1n
  const g = gcd(n, d) || 1n

  return { n: (s * n) / g, d: (s * d) / g }
}

const fracText = (f: Frac): string =>
  f.d === 1n ? `${f.n}` : `${f.n}/${f.d}`
const fracValue = (f: Frac): number => Number(f.n) / Number(f.d)
const fracEq = (a: Frac, b: Frac): boolean => a.n * b.d === b.n * a.d

// ---- Gaussian-integer 8 x 8 matrices (operators times 6, so every entry is an integer) ----

type M8 = number[][]
type G8 = { re: M8; im: M8 }

const zero8 = (): M8 => EVEN.map(() => Array<number>(REG).fill(0))
const I8: M8 = EVEN.map((_, i) =>
  EVEN.map((__, j) => (i === j ? 1 : 0)),
)
const add8 = (a: M8, b: M8, k = 1): M8 =>
  a.map((row, i) => row.map((x, j) => x + k * b[i]![j]!))
const scale8 = (a: M8, k: number): M8 =>
  a.map(row => row.map(x => x * k))
const transpose8 = (a: M8): M8 =>
  a.map((row, i) => row.map((_, j) => a[j]![i]!))
const same8 = (a: M8, b: M8): boolean =>
  a.every((row, i) => row.every((x, j) => x === b[i]![j]!))
const isZero8 = (a: M8): boolean =>
  a.every(row => row.every(x => x === 0))
const trace8 = (a: M8): number =>
  a.reduce((s, row, i) => s + row[i]!, 0)

const g8 = (re: M8, im: M8 = zero8()): G8 => ({ re, im })
const gAdd = (a: G8, b: G8): G8 =>
  g8(add8(a.re, b.re), add8(a.im, b.im))
const gMul = (a: G8, b: G8): G8 =>
  g8(
    add8(mul8(a.re, b.re), mul8(a.im, b.im), -1),
    add8(mul8(a.re, b.im), mul8(a.im, b.re)),
  )
const gTrace = (a: G8): { re: number; im: number } => ({
  re: trace8(a.re),
  im: trace8(a.im),
})

const gCommutatorZero = (a: G8, b: G8): boolean => {
  const ab = gMul(a, b)
  const ba = gMul(b, a)

  return same8(ab.re, ba.re) && same8(ab.im, ba.im)
}

// one block of a member: 6 Q and 6 T3 on the 8 register components; the trace over the member multiplies by its
// 24 slots and 3 flavors (both operators act as 1 there)
type Block = {
  name: string
  q6: G8
  t6: G8
  generators: M8[]
  copies: number
}

type Reading = {
  name: string
  trT3sq: Frac
  trQsq: Frac
  trQT3: Frac
  imaginaryResidue: number
  yCommutes: boolean
  consistent: boolean
  s0: Frac
  inRange: boolean
}

function readBlocks(name: string, blocks: Block[]): Reading {
  let tt = 0
  let qq = 0
  let qt = 0
  let imaginaryResidue = 0
  let yCommutes = true

  for (const b of blocks) {
    const ttT = gTrace(gMul(b.t6, b.t6))
    const qqT = gTrace(gMul(b.q6, b.q6))
    const qtT = gTrace(gMul(b.q6, b.t6))

    tt += b.copies * ttT.re
    qq += b.copies * qqT.re
    qt += b.copies * qtT.re
    imaginaryResidue = Math.max(
      imaginaryResidue,
      Math.abs(ttT.im),
      Math.abs(qqT.im),
      Math.abs(qtT.im),
    )

    const y6 = gAdd(b.q6, g8(scale8(b.t6.re, -1), scale8(b.t6.im, -1)))

    yCommutes =
      yCommutes && b.generators.every(X => gCommutatorZero(y6, g8(X)))
  }

  // every trace of operators times 6 is an integer; a non-integer is reported as an imaginary residue (fails I1)
  imaginaryResidue = Math.max(
    imaginaryResidue,
    ...[tt, qq, qt].map(x => Math.abs(x - Math.round(x))),
  )
  tt = Math.round(tt)
  qq = Math.round(qq)
  qt = Math.round(qt)

  const trT3sq = frac(BigInt(tt), 36n)
  const trQsq = frac(BigInt(qq), 36n)
  const trQT3 = frac(BigInt(qt), 36n)
  const consistent =
    yCommutes && fracEq(trQT3, trT3sq) && imaginaryResidue === 0
  const s0 = frac(BigInt(tt), BigInt(qq))
  const inRange = s0.n > 0n && s0.n < s0.d

  return {
    name,
    trT3sq,
    trQsq,
    trQT3,
    imaginaryResidue,
    yCommutes,
    consistent,
    s0,
    inRange,
  }
}

const readingText = (r: Reading): string =>
  `${r.name}: Tr T3^2 ${fracText(r.trT3sq)}, Tr Q^2 ${fracText(r.trQsq)}, Tr Q T3 ${fracText(r.trQT3)}, Q - T3 commutes with SU(2)+ ${r.yCommutes}, consistent ${r.consistent}, s0 ${fracText(r.s0)}`

// ---- the one-loop run ----

// sin^2(M_Z) from s0 at M_X = M_Z e^L, with b_2 and the physical-normalization b_Y
const runDown = (
  s0: number,
  b2: number,
  bY: number,
  L: number,
): number =>
  s0 +
  (L / (2 * Math.PI * ALPHA_EM_INVERSE)) * ((1 - s0) * b2 - s0 * bY)

// GQW with the strong coupling fixing the meeting scale: the GUT-normalized b_1 = h^-1 b_Y with h = s0 / (1 - s0),
// 1/alpha_2 = sin^2 A, 1/alpha_3 = S, and sin^2 A - S = (b_2 - b_3) L / 2 pi; solved with runDown for (sin^2, L)
function predictFromStrong(
  s0: number,
  beta: [number, number, number],
): number {
  const [b1, b2, b3] = beta
  const h = s0 / (1 - s0)
  const bY = h * b1
  const A = ALPHA_EM_INVERSE
  const S = ALPHA_STRONG_INVERSE
  // sin^2 = s0 + c L with c = ((1 - s0) b2 - s0 bY) / (2 pi A); L = 2 pi (sin^2 A - S) / (b2 - b3)
  const c = ((1 - s0) * b2 - s0 * bY) / (2 * Math.PI * A)
  const k = (2 * Math.PI * A) / (b2 - b3)

  // sin^2 = s0 + c k sin^2 - c k S / A
  return (s0 - (c * k * S) / A) / (1 - c * k)
}

export default experiment({
  id: 'gauge/mixing-angle-trace',
  code: 'E-FRC-0280',
  title:
    "the weak mixing angle as a trace over the register's modes, fail as derived: the code puts charge on the tone, which no piece reads on the register, so Q = (pleasure - pain) / 3 is constant on all 576 modes of a member and commutes with SU(2)+, Tr(Q T3) = 0 against Tr T3^2 = 72, and Tr T3^2 / Tr Q^2 = 72 / 64 = 9/8 is no mixing angle (1/8 in whole vibes, still with no T3 in Q); a charge that holds T3 would be a new piece, Q = T3+ + tone / 6 giving 9/11 and the left-right Q = T3+ + T3- + tone / 6 giving 9/20; the run's own check failed on an inverted hypercharge normalization that decides no gate",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return mixingAngleTraceRun()
  },
})

export function mixingAngleTraceRun(): Verdict {
  const started = Date.now()

  // ---- the register's SU(2)+ and SU(2)- ----
  const J = volumeRight()
  const Pp2 = add8(I8, J)
  const Pm2 = add8(I8, J, -1)
  const idx = (b: string): number =>
    EVEN.findIndex(x => x.join(',') === b)
  const generatorsOf = (half2: M8): M8[] =>
    ['0,1', '0,2', '0,3'].map(b =>
      scale8(
        mul8(rightMultiplication(evenBlade(idx(b))), half2),
        1 / 2,
      ),
    )
  const Xp = generatorsOf(Pp2)
  const Xm = generatorsOf(Pm2)
  const Pp = scale8(Pp2, 1 / 2)
  const Pm = scale8(Pm2, 1 / 2)

  // ---- I1 ----
  const algebra = Xp.every(
    X =>
      same8(mul8(X, X), scale8(Pp, -1)) &&
      isZero8(mul8(X, Pm)) &&
      same8(transpose8(X), scale8(X, -1)) &&
      trace8(X) === 0,
  )
  // sum_k T_k^2 = -(1/4) sum_k X_k^2, times 4: -sum X_k^2 = 3 P+
  const casimir = same8(
    Xp.reduce((s, X) => add8(s, mul8(X, X), -1), zero8()),
    scale8(Pp, 3),
  )

  // 6 T3 = 3 i X_k (love tone); a fear-tone member carries the conjugate representation, -conj(T)^T = (i/2) X^T = -T
  const t6 = (X: M8, tone: 1 | -1): G8 =>
    g8(zero8(), scale8(X, 3 * tone))
  const scalar6 = (k: number): G8 => g8(scale8(I8, k))
  const copies = SLOTS * FLAVORS

  const candidateA = (axis: number): Reading[] => {
    const X = Xp[axis]!

    return [
      readBlocks(`A1 axis ${axis + 1}`, [
        {
          name: 'love',
          q6: scalar6(2),
          t6: t6(X, 1),
          generators: Xp,
          copies,
        },
      ]),
      readBlocks(`A2 axis ${axis + 1}`, [
        {
          name: 'love',
          q6: scalar6(2),
          t6: t6(X, 1),
          generators: Xp,
          copies,
        },
        {
          name: 'fear',
          q6: scalar6(-2),
          t6: t6(X, -1),
          generators: Xp,
          copies,
        },
      ]),
      readBlocks(`A3 axis ${axis + 1}`, [
        {
          name: 'love',
          q6: scalar6(6),
          t6: t6(X, 1),
          generators: Xp,
          copies,
        },
      ]),
    ]
  }

  const readings = [0, 1, 2].flatMap(candidateA)
  // readings are [A1, A2, A3] for axis 1, then axis 2, then axis 3
  const axisSame = readings.every((r, i) => {
    const base = readings[i % 3]!

    return (
      fracEq(r.trT3sq, base.trT3sq) &&
      fracEq(r.trQsq, base.trQsq) &&
      fracEq(r.trQT3, base.trQT3) &&
      r.consistent === base.consistent
    )
  })
  const I1 =
    algebra &&
    casimir &&
    axisSame &&
    readings.every(r => r.imaginaryResidue === 0)

  // ---- constructions B and C (reads, and B is C1's register half) ----
  const B = readBlocks('B (Q = T3+ + tone/6)', [
    {
      name: 'love',
      q6: gAdd(scalar6(1), t6(Xp[0]!, 1)),
      t6: t6(Xp[0]!, 1),
      generators: Xp,
      copies,
    },
  ])
  const C = readBlocks('C (Q = T3+ + T3- + tone/6)', [
    {
      name: 'love',
      q6: gAdd(gAdd(scalar6(1), t6(Xp[0]!, 1)), t6(Xm[0]!, 1)),
      t6: t6(Xp[0]!, 1),
      generators: Xp,
      copies,
    },
  ])

  // ---- C1: the Standard Model generation through the same consistency test ----
  const sixth = (x: number): bigint => BigInt(Math.round(6 * x))
  const smTT = STANDARD_MODEL_GENERATION.reduce(
    (s, f) => s + BigInt(f.mult) * sixth(f.t3) * sixth(f.t3),
    0n,
  )
  const smQQ = STANDARD_MODEL_GENERATION.reduce(
    (s, f) => s + BigInt(f.mult) * sixth(f.q) * sixth(f.q),
    0n,
  )
  const smQT = STANDARD_MODEL_GENERATION.reduce(
    (s, f) => s + BigInt(f.mult) * sixth(f.q) * sixth(f.t3),
    0n,
  )
  const smRatio = frac(smTT, smQQ)
  const smConsistent = smQT === smTT
  const C1 =
    smConsistent &&
    fracEq(smRatio, frac(3n, 8n)) &&
    Math.abs(weinbergAngleAtUnification() - 3 / 8) < 1e-15 &&
    B.consistent &&
    B.inRange

  // ---- I2: the run against E-FRC-0054's closed form ----
  const runGaps = [BETA_SM, BETA_MSSM].map(beta =>
    Math.abs(
      predictFromStrong(3 / 8, beta) -
        predictWeinbergAngle({
          alphaEmInverse: ALPHA_EM_INVERSE,
          alphaStrongInverse: ALPHA_STRONG_INVERSE,
          beta,
        }),
    ),
  )
  const I2 = runGaps.every(g => g <= RUN_TOLERANCE)

  // ---- H1, H2 ----
  const passing = readings.filter(r => r.consistent && r.inRange)
  const H1 = readings.some(r => r.consistent)
  const H2 = passing.length > 0

  // ---- reads: what a run would need ----
  const lPlanck = Math.log(M_PLANCK / M_Z)
  const lGut = Math.log(M_GUT / M_Z)
  // the coefficient combination (1 - s0) b2 - s0 bY that reaches the target at L
  const needed = (s0: number, L: number): number =>
    ((TARGET - s0) * 2 * Math.PI * ALPHA_EM_INVERSE) / L
  const smCombination =
    (5 / 8) * BETA_SM[1] - (3 / 8) * ((3 / 5) * BETA_SM[0])
  const smAtGut = runDown(3 / 8, BETA_SM[1], (3 / 5) * BETA_SM[0], lGut)
  const consistentReads = [B, C].map(r => {
    const s0 = fracValue(r.s0)

    return {
      name: r.name,
      s0,
      planck: needed(s0, lPlanck),
      gut: needed(s0, lGut),
    }
  })

  const status: Verdict['status'] = !(H1 && H2)
    ? 'fail'
    : !(I1 && I2 && C1)
      ? 'partial'
      : 'pass'
  const a1 = readings[0]!
  const a2 = readings[1]!
  const a3 = readings[2]!
  const seconds = (Date.now() - started) / 1000

  return verdict({
    status,
    claim: `H1 ${H1} H2 ${H2}. Over a member's ${MEMBER_MODES} modes: ${[a1, a2, a3].map(readingText).join('; ')} (axes 2 and 3 identical: ${axisSame}). Reads: ${readingText(B)}; ${readingText(C)}. Needed (1 - s0) b2 - s0 bY to reach ${TARGET} at M_X = M_Planck / 2e16 GeV: ${consistentReads.map(c => `${c.name} ${c.planck.toFixed(3)} / ${c.gut.toFixed(3)}`).join('; ')}, against the SM's ${smCombination.toFixed(3)} (SM from 3/8 at 2e16 GeV gives ${smAtGut.toFixed(4)}). Instruments I1 ${I1} I2 ${I2} (gaps ${runGaps.map(g => g.toExponential(1)).join(' ')}); control C1 ${C1} (SM ratio ${fracText(smRatio)}, consistent ${smConsistent}; B consistent ${B.consistent})`,
    metrics: {
      H1: flag(H1),
      H2: flag(H2),
      I1: flag(I1),
      I2: flag(I2),
      C1: flag(C1),
      memberModes: MEMBER_MODES,
      trT3sqA1: fracValue(a1.trT3sq),
      trQsqA1: fracValue(a1.trQsq),
      trQT3A1: fracValue(a1.trQT3),
      s0A1: fracValue(a1.s0),
      s0A2: fracValue(a2.s0),
      s0A3: fracValue(a3.s0),
      s0B: fracValue(B.s0),
      s0C: fracValue(C.s0),
      neededPlanckB: consistentReads[0]!.planck,
      neededPlanckC: consistentReads[1]!.planck,
      smCombination,
      smAtGut,
      runGapMax: Math.max(...runGaps),
      seconds,
    },
    control: {
      smRatio: fracValue(smRatio),
      smConsistent: flag(smConsistent),
      bConsistent: flag(B.consistent),
    },
    notes: `L1. Q from the tone (code/measure/role-register), T3 = (i/2) R(e_0k) P+ (E-FRC-0268). Operators carried times 6 as Gaussian-integer matrices; traces exact. alpha_em^-1 ${ALPHA_EM_INVERSE} at M_Z ${M_Z} GeV, M_Planck ${M_PLANCK} GeV. ${seconds.toFixed(1)} s.`,
  })
}
