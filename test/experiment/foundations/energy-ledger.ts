// AN ENERGY LEDGER THAT COULD SELECT THE VACUUM (E-FND-0159, OPEN-FND-14). E-FRC-0268 found that the register rule keeps
// SU(2)+ x SU(2)- exactly (the right multiplications of Cl+(4), one SU(2) on each chiral half), that the full sea keeps
// it too, and that a stationary sea breaking SU(2)+ exists: fill one eigenspace of one generator. On the chiral face
// the light levels are SU(2)+ doublets of one hand, so their mass needs a condensate that breaks SU(2)+. What would
// pick a breaking sea over a symmetric one is an energy, and the rule has none. This file defines one that is native to
// the rule, and asks whether it selects the breaking sea.
//
// WHAT "ENERGY" CAN MEAN ON A REVERSIBLE CYCLE (derived before any code, L1).
// 1. There is no ground state by fiat. The cycle U is unitary, so every stationary state has an eigenvalue lambda on the
//    unit circle, and the quasi-energy -arg(lambda) is defined only mod 2 pi, per member. The candidates:
//    (a) THE QUASI-ENERGY ITSELF. Exactly conserved, but circle-valued, so it orders nothing. A sea of 10^6 members has
//        a phase, not a size.
//    (b) THE QUASI-ENERGY WITH A BRANCH CUT, summed over the occupied modes (the Floquet Dirac-sea convention). It orders
//        seas, but the cut is a choice. On this rule the 176 flat modes sit at phase 0 and the moving bands near pi
//        (probe 1: +-2.76 at K = 0), so a cut in the members' own frame (phase 0) runs through 176 V modes, and the only
//        cut in a gap that the tone mirror keeps is at pi, which makes a member at rest the HIGHEST level, not the
//        lowest. Either way the order is put in by the cut.
//    (c) A CONSERVED CHARGE OF THE CYCLE (number, number per half, flat number). These are counts, and they label
//        sectors, but they cannot order seas inside one sector, which is where the vacuum question lives.
//    (d) THE PRIME-UNIT COUNT (chosen). Every unit the rule multiplies by is ringUnit(k, j) = rho^k w^j with ONE prime
//        unit rho = (3 + w) / (3 + conj w), of infinite order, times a sixth root of 1. So the exponent of rho in an
//        eigenvalue is an integer, not an angle. Hold every unit as e^(i (k theta + j pi / 3)) and define
//           E(psi) = -d arg(lambda) / d theta.
//        On a sea whose eigenvalue is rho^n w^j, E = -n exactly: an integer, with no branch and nothing mod 2 pi. By
//        Hellmann-Feynman on the product of beats (each piece p is rho^(k_p C_p) times permutations, which carry no
//        rho), E = -sum_p k_p <C_p>, each count read at the beat where p acts: a mixer's sector occupancy, and the pair
//        pieces' normal-ordered hole counts (E-SPN-0175's (N_x - r)(N_y - r) = h_x h_y). The full sea is 0, and a hole
//        adds the count of the mode it removes. As an operator, the dephased generator (the eigenphase derivatives) commutes
//        with U, so it is conserved exactly; on a sea with sharp counts it is the exact integer exponent.
//    CHOSEN: (d). It is the only candidate that is a count in the model's integers, exactly conserved, and ordered
//    without a choice put in. Its one convention is the sign, E = -d arg / d theta (the codebase's E = -phase), and the
//    verdict below is read so that it holds under either sign.
//
// DERIVED BEFORE THE RUN, on R0 (E-SPN-0175's many-body register rule: the member mixers at ringUnit(-1, 4), the
// sector string ringUnit(-2, 1) a unit of min(V, 8), the sector contact v^2, v = ringUnit(2, 0)) and R1 (its chiral
// Wilson variant on half +, at E-FRC-0268's ringUnit(-2, 5), with the same pair pieces).
// 2. THE BREAKING SEA IS AN EXACT EIGENSTATE WITH E = 0 (L1). Let B be the full sea less the -i eigenspace of X_1 on half
//    + at every dock (Pi_down = (P+ + i X_1) / 2 on the register; the +i choice is the same by SU(2)+). Every piece
//    commutes with 1 (x) Pi_down, so the hole space is invariant and every sector count is sharp: h_S = Tr(Q_S Pi_down) =
//    2 and h_D = 2 at every dock. The one-body count per dock is k (h_S - h_D) = 0 on R0 and k (h_S + 2 h_D+ - h_D - 2
//    h_S+) = 0 on R1 (exact integer traces). The string and the contact see h_S h_S in beat 1 and h_D h_D in beat 2,
//    reversed, so they cancel exactly. So lambda_B = w^j with n = 0: E(B) = 0, the full sea's value, exactly, and every
//    SU(2)+ rotation of B the same (a degenerate family, SU(2)+ / U(1)).
// 3. THE MIDPOINT THEOREM, for ANY one-body ledger (L1). The rule conserves the number in each half and the number in the
//    flats (E-FRC-0267, E-SPN-0175), so B is compared inside its own sector. On half + the modes are K+ (x) C^2 with
//    SU(2)+ acting on C^2, and every one-body piece is A (x) 1, so every level of every one-body ledger f has even
//    multiplicity, the two copies of each doublet equal. B takes every half-+ level ONCE; the symmetric seas at B's
//    number take half the levels TWICE. Any two complementary choices (a half of the levels twice, and the other half
//    twice) sum to every level twice, so f(B) is their exact average. Taking the lowest half and the highest half, B is
//    the minimum of a one-body ledger only if every level is equal, and then it selects nothing. On this rule the moving
//    half-+ levels are not equal (probe 1), so every one-body ledger places B strictly between two symmetric seas.
// 4. THE FLATS ARE BLIND (L1). The flat modes have eigenvalue exactly 1 and lie outside every sector projector (Q_S and
//    Q_D sit inside the moving space, E-SPN-0175 point 4), so every count reads 0 on them. B's flat part (44 holes a
//    dock on R0, 40 on R1) breaks SU(2)+, and any symmetric rearrangement of it has exactly the same ledger. The ledger
//    cannot see whether the flats break SU(2)+.
// 5. THE PAIR PIECES SEE ONLY SPIN-SUMMED COUNTS (L1). The string and the contact are functions of the sector counts,
//    which sum over the two members of each doublet. Take two complementary band seas on half + (at each momentum, the
//    levels leaning most to the singlet S, or their complement, leaning to the partner D; each level whole, so both
//    are SU(2)+-symmetric). Their hole spaces add to the whole moving half-+ space, whose sector density is 1 on the
//    half-+ copies (S and D lie in the moving space), so A(K) -> 1 - A(K): the one-body count is ODD, the string's
//    exchange term is EVEN (its kernel has w(0) = 0), and n -> 4 - n in each sector. Derived after probe 2
//    (disclosed): inside the moving space a mode's S and D weights add to 1, so n_S + n_D is the hole number, and the
//    two sectors' variances and exchange terms are equal. Then the direct and contact terms are odd as well, and on
//    these seas the ledger per dock is
//       E = E1 + (n_S - n_D)(4 W - 6),   W = sum_r min(V(r), 8) over the torus (260 at L = 4),
//    with E1 = -(n_S - n_D) on R0 (so E = (n_S - n_D)(4 W - 7)) and E1 odd on R1. B has n_S = n_D and E1 = 0. So B sits at
//    the exact midpoint of the two band seas, and the imbalance n_S - n_D, weighted by the capped string's reach W,
//    decides everything else. The string is a long-range charge (S and D carry opposite signs, since beat 2 is
//    reversed), and a sea that is not neutral in it has a ledger that grows with the box.
// 6. WHAT B WOULD SPLIT (L1, read, not gated). B is diagonal in the halves. What it distinguishes is the two members of
//    each SU(2)+ doublet inside half +, a Zeeman-like split, and its sector Casimir <T^2> is 2 (the two holes of a sector
//    in a triplet). The mass E-FRC-0268 asks for joins one hand to the other, <psi_-^dag psi_+> != 0, which B does not
//    carry. So even a ledger that selected B would not give the face's doublets a mass.
//
// PREDICTED VERDICT: FAIL, on S. B reads 0 exactly, and it sits at the exact midpoint of the two band seas: probe 3 read,
// a dock, the S-heavy sea +3121.78 and the D-heavy sea -3121.78 on R0 (one-body -3.02 and +3.02, imbalance +-3.02) and
// +3564.32 and -3564.32 on R1 (one-body +4.75 and -4.75, imbalance +-3.44). On R0 the string's direct term reverses the
// one-body order. So under either sign a symmetric sea lies below B by thousands a dock. At L = 6 the band seas move
// further out (W grows), and B stays at 0.
//
// GATES, fixed before the gate run (runs: R0 at L = 4, R1 at L = 4, R0 at L = 6; the torus of E-SPN-0175).
//  E THE LEDGER IS AN EXACT COUNT ON B. From integer traces, 4 Tr(Q Pi_down) = 8 for every sector projector of the rule
//    (24 Q_S, 48 Q_D, and their products with 2 P+), and B's one-body count per dock is 0 + 0i exactly; the integer
//    projectors commute with 1 (x) Y_1 and 1 (x) J with gap exactly 0. The float ledger of B (every mode) and of its moving
//    part B_W along X_1, X_2 and X_3 is within 1e-9 of 0, with n_S = n_D = 2 and both count variances within 1e-9 of 0.
//    The full sea reads within 1e-12 of 0.
//  H HELLMANN-FEYNMAN. At momenta 0, 5 and 37, every cluster's count equals the finite-difference derivative (step
//    1e-5) of the sum of its phases within 1e-6, and every moving half-+ level splits into two equal SU(2)+ halves (its
//    down part is half its plus part, in dimension and count, within 1e-9).
//  F THE FLATS ARE BLIND. Every flat part's count and sector blocks are within 1e-10 of 0.
//  M THE MIDPOINT. With D_S and D_D the S-heavy and D-heavy band seas of point 5 (complementary at every momentum):
//    E1(B_W) = (E1(D_S) + E1(D_D)) / 2 within 1e-9, with |E1(D_S) - E1(D_D)| > 1 a dock; and the whole ledger E(B_W) =
//    (E(D_S) + E(D_D)) / 2 within 1e-9 times max(1, |E(D_S)|).
//  S THE HYPOTHESIS, THE LEDGER SELECTS B: E(B_W) < E(sigma) - 1e-6 for every SU(2)+-symmetric sea sigma read in B's
//    sector (D_S and D_D), on every run. PREDICTED TO FAIL.
// CONTROLS (a failure makes the verdict partial). C1 A SEA KNOWN TO BE EXCITED: the lower of D_S and D_D with momentum 0
//  given the other band choice reads above it by more than 1e-6. C2 A LEDGER THAT SHOULD FAIL: the one-body ledger alone
//  must not select B: min(E1(D_S), E1(D_D)) < E1(B_W) - 1 on every run (point 3 says it cannot). C3 THE SIGN: under E and
//  under -E alike B is not selected, since some rival reads below B and some above it, by more than 1e-6.
// READ, gating nothing: every sea's numbers a dock (one-body, the string's direct and exchange terms, the contact, n_S,
//  n_D, the variances), the S-minus-D imbalance of the band seas, and each sector's SU(2)+ Casimir <T^2> at one dock
//  (what an isospin Hund piece would read).
// Verdict: pass if S and every other gate and control hold; fail if S fails and E, H, F, M and the controls hold;
// partial otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after the gate run).
//  tmp/el-probe1 (15 momenta a rule): R0's moving bands are +-phi(K), each 8-fold (4 on each half), with 176 flats at
//  phase 0; R1's half + holds 16 moving modes in four 4-fold levels (8 at K = 0) and 80 flats.
//  tmp/el-probe2, el-probe2b (L = 4, register parts only): the counts equal finite differences of the phases to 8
//  digits; the flats read 1.3e-15 (R0) and 9.6e-15 (R1); B and B_W along X_1, X_2, X_3 read 0 with n_S = n_D = 2 and
//  variance 0. The band seas, then ordered by one-body count, read +-3121.780195 (R0) and +-2999.320909 (R1), exactly
//  antisymmetric, with the string's exchange terms cancelling between S and D. That antisymmetry is what point 5's
//  second half derives, written after this probe. On R1 the momentum-0 flip lowered the lower sea, because K = 0 is where
//  the Wilson mixers invert the mass and the one-body order and the S-minus-D order disagree there, so the band seas
//  were redefined by their S-minus-D lean before the gate run.
//  tmp/el-probe3 (this file's readings at L = 4 on R0 and R1, 995 s): E, H, F, M and C1 to C3 held, S failed, as
//  predicted. It also carried a gate T, a spin-polarized SU(2)+-symmetric sea built inside each cluster from the
//  singlet's copies (P_c E_S pi E_S^dag P_c / w), argued to tie B through a symmetry on the singlet's copies. The
//  construction failed its own check: rebuilding B that way missed B by 2 (R0) and 8 (R1) in a count, and the sea held
//  3.375 holes a dock where B holds 4, because at momenta where a band is purely singlet or purely partner (K = 0 and the
//  zeros of s(K)) it has no singlet weight to build from. T, the spin sea and a sea joining the halves built the same way
//  were removed before the gate run, and the copy-symmetry argument is not claimed.
//
// FIRST RUN (pnpm rerun E-FND-0159, tmp/el-gate-run1.log, 2,806 s): FAIL on S alone, as predicted. No gate moved.
//  - E: B's exact count 0 + 0i, every 4 Tr(Q Pi_down) = 8, commutator gaps 0; B and B_W along X_1, X_2, X_3 within
//    1.2e-12 of 0, n_S = n_D = 2, variances below 1e-15; the full sea 0.
//  - H: counts against finite differences within 2.9e-8; every moving half-+ level splits into equal halves. F: the
//    flats read at most 9.6e-15.
//  - M and S: the band seas read +-3,121.780195 (R0, L 4), +-3,564.317493 (R1, L 4) and +-23,136.113816 (R0, L 6) a
//    dock, B exactly at their midpoint. One-body parts -3.022 and +3.022, +4.746 and -4.746, -2.930 and +2.930;
//    imbalances n_S - n_D of 3.022, 3.443 and 2.930. E = E1 + (n_S - n_D)(4W - 6) holds with W = 260 (L 4) and
//    1,976 (L 6).
//  - Controls: C1 the excited sea -3,057.22, -3,499.57, -23,038.62 against -3,121.78, -3,564.32, -23,136.11; C2 the
//    one-body ledger places a symmetric sea 3 to 5 below B; C3 B lies strictly between rivals on every run.
//  - Read: <T^2> in the singlet sector 2 for B, 0.32, 0.19, 0.35 for the band seas.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { cycleMatrix } from '@/code/measure/swap-cone'
import {
  EVEN,
  MODES,
  REGISTER_ROOTS,
  matMul,
  partnerProjector48,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { chirality2, volumeRight } from '@/code/measure/chiral-register'
import { wilsonSchedule, unitaryEigen } from '@/code/measure/wilson-register'
import { singletBasis, torus } from '@/code/measure/register-sea'
import { partnerBasis } from '@/code/measure/register-meson'
import {
  evenBlade,
  IDENTITY_SLOTS,
  mul8,
  registerGap,
  rightMultiplication,
} from '@/code/measure/register-symmetry'
import {
  ledgerBlocks,
  seaLedger,
  sectorImage,
  stringKernel,
  type Block,
  type Choice,
  type LedgerRule,
  type RegisterProjector,
  type SeaReading,
  type SectorIsospin,
} from '@/code/measure/energy-ledger'

// E-SPN-0175's member unit and E-FRC-0267/0268's chiral unit, as (k, j) in ringUnit(k, j) = rho^k w^j
const LIGHT: readonly [number, number] = [-1, 4]
const HEAVY: readonly [number, number] = [-2, 5]
const STRING_EXPONENT = -2
const CONTACT_EXPONENT = 4
const CAP = 8
const EXACT = 1e-9
const FLAT_BLIND = 1e-10
const HF_STEP = 1e-5
const HF_TOLERANCE = 1e-6
const HF_MOMENTA: readonly number[] = [0, 5, 37]
const CLUSTER = 1e-7
const SELECT = 1e-6

export type LedgerPlan = { runs: readonly { rule: 'R0' | 'R1'; L: number }[] }

export const GATE_PLAN: LedgerPlan = {
  runs: [
    { rule: 'R0', L: 4 },
    { rule: 'R1', L: 4 },
    { rule: 'R0', L: 6 },
  ],
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/energy-ledger',
  code: 'E-FND-0159',
  title:
    "an energy ledger native to the register rule, the exponent of its one prime unit in a sea's eigenvalue (an integer, read by Hellmann-Feynman, no branch cut), does not select the SU(2)+-breaking sea, fail as derived: the breaking sea is an exact eigenstate at 0, the full sea's value, from exact integer traces; any one-body ledger puts it at the exact midpoint of two symmetric seas, the flats read 0 in every count, and the whole ledger is ruled by the sector string's singlet-minus-partner imbalance, E = E1 + (n_S - n_D)(4W - 6), so the two symmetric band seas straddle the breaking sea exactly, by thousands a dock, and move out with the box; the breaking sea is also diagonal in the halves, so it could not give the face's doublets a mass; selection needs a neutral string, a sector piece that reads the isospin (B's sector Casimir is 2), and for the mass a channel joining the halves",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return energyLedgerRun(GATE_PLAN)
  },
})

// ---- the register side: the halves, the SU(2)+ generators and their eigenspaces ----

type Register = {
  J: number[][]
  plus: number[][]
  minus: number[][]
  // X_k = R(e_0k) P+, k = 1, 2, 3: X_k^2 = -P+
  X: number[][][]
  // twice X_k, an integer matrix: R(e_0k) (1 + J)
  Y: number[][][]
}

function register(): Register {
  const J = volumeRight()
  const I8 = EVEN.map((_, i) => EVEN.map((__, j) => (i === j ? 1 : 0)))
  const idx = (b: string): number => EVEN.findIndex(x => x.join(',') === b)
  const onePlusJ = I8.map((r, i) => r.map((x, j) => x + J[i]![j]!))
  const Y = ['0,1', '0,2', '0,3'].map(b =>
    mul8(rightMultiplication(evenBlade(idx(b))), onePlusJ),
  )

  return {
    J,
    plus: onePlusJ.map(r => r.map(x => x / 2)),
    minus: I8.map((r, i) => r.map((x, j) => (x - J[i]![j]!) / 2)),
    X: Y.map(y => y.map(r => r.map(x => x / 2))),
    Y,
  }
}

// the -i eigenspace of X_k on half +: (P+ + i X_k) / 2
const downOf = (g: Register, k: number): RegisterProjector => ({
  re: g.plus.map(r => r.map(x => x / 2)),
  im: g.X[k]!.map(r => r.map(x => x / 2)),
})


// ---- the rules ----

const unitAt = (kj: readonly [number, number], shift = 0): [number, number] => {
  const t = unitAngle(ringUnit(kj[0], kj[1])) + kj[0] * shift

  return [Math.cos(t), Math.sin(t)]
}

type Sectors = { qS: Float64Array; qD: Float64Array; plus192: Float64Array }

function sectors(g: Register): Sectors {
  return {
    qS: scaled(singletProjector24(), 24),
    qD: scaled(partnerProjector48(), 48),
    plus192: scaled(chirality2(g.J, 1), 2),
  }
}

// R0: E-SPN-0175's many-body register rule. R1: its chiral Wilson variant on half + (E-FRC-0267, 0268). `shift` moves
// the angle of rho by that much in every unit (for the Hellmann-Feynman check)
function ruleOf(name: 'R0' | 'R1', s: Sectors, shift = 0): LedgerRule {
  const base = {
    string: STRING_EXPONENT,
    contact: CONTACT_EXPONENT,
    cap: CAP,
    ES: singletBasis(),
    ED: partnerBasis(),
  }

  if (name === 'R0') {
    const k = LIGHT[0]

    return {
      ...base,
      name,
      pieces: wilsonSchedule(s.qS, s.qD, unitAt(LIGHT, shift), {
        wilson: false,
      }),
      beat1: [{ q: s.qS, k }],
      beat2: [{ q: s.qD, k: -k }],
    }
  }

  const k = HEAVY[0]
  const u = unitAt(HEAVY, shift)
  const ub: [number, number] = [u[0], -u[1]]
  const v: [number, number] = [ub[0] * ub[0] - ub[1] * ub[1], 2 * ub[0] * ub[1]]

  return {
    ...base,
    name,
    pieces: wilsonSchedule(s.qS, s.qD, u, {
      wilson: true,
      half: s.plus192,
      v,
    }),
    beat1: [
      { q: s.qS, k },
      { q: matMul(s.qD, s.plus192), k: 2 * k },
    ],
    beat2: [
      { q: s.qD, k: -k },
      { q: matMul(s.qS, s.plus192), k: -2 * k },
    ],
  }
}

// ---- the exact count of B: integer traces ----

// Tr((1 (x) m) q) for an integer 8 x 8 m and an integer 192 x 192 q
function liftedTraceWith(m: readonly (readonly number[])[], q: Float64Array): number {
  let s = 0

  for (let d = 0; d < 24; d++) {
    for (let a = 0; a < 8; a++) {
      for (let b = 0; b < 8; b++) {
        const x = m[a]![b]!

        if (x !== 0) {
          s += x * q[(d * 8 + b) * MODES + d * 8 + a]!
        }
      }
    }
  }

  return s
}

// B's one-body count per dock, exactly: 4 Tr(Q Pi_down) = Tr((1 (x) (1 + J)) Q) + i Tr((1 (x) Y_1) Q), with Q the integer
// matrices 24 Q_S, 48 Q_D and their products with 2 P+; returned as numerator over denominator
function exactCount(
  name: 'R0' | 'R1',
  g: Register,
): { re: number; im: number; den: number; ranks: number[] } {
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const P2 = chirality2(g.J, 1)
  const onePlusJ = g.plus.map(r => r.map(x => 2 * x))
  const Y1 = g.Y[0]!
  const trace = (q: Float64Array, scale: number): { re: number; im: number } => ({
    re: liftedTraceWith(onePlusJ, q) / scale,
    im: liftedTraceWith(Y1, q) / scale,
  })
  // ranks x 4: Tr(Q Pi_down) * 4, from the integer traces (scale removes the 24 or 48, and the 2 of 2 P+)
  const qs = trace(S24, 24)
  const qd = trace(D48, 48)
  const k = name === 'R0' ? LIGHT[0] : HEAVY[0]

  if (name === 'R0') {
    return {
      re: k * qs.re - k * qd.re,
      im: k * qs.im - k * qd.im,
      den: 4,
      ranks: [qs.re, qd.re],
    }
  }

  const qdP = trace(matMul(D48, P2), 96)
  const qsP = trace(matMul(S24, P2), 48)

  return {
    re: k * qs.re + 2 * k * qdP.re - k * qd.re - 2 * k * qsP.re,
    im: k * qs.im + 2 * k * qdP.im - k * qd.im - 2 * k * qsP.im,
    den: 4,
    ranks: [qs.re, qd.re, qdP.re, qsP.re],
  }
}

// ---- the seas ----

const PART_PLUS = 0
const PART_DOWN = [1, 2, 3]
const PART_MINUS = 4

const movingOf = (b: Block): number[] =>
  b.clusters
    .map((c, i) => ({ c, i }))
    .filter(x => Math.abs(x.c.phase) > 1e-6)
    .map(x => x.i)
const flatOf = (b: Block): number[] =>
  b.clusters
    .map((c, i) => ({ c, i }))
    .filter(x => Math.abs(x.c.phase) <= 1e-6)
    .map(x => x.i)

const trace8 = (A: { re: Float64Array }): number => {
  let s = 0

  for (let i = 0; i < 8; i++) {
    s += A.re[i * 8 + i]!
  }

  return s
}

// the SU(2)+-symmetric band seas on half +: half of the moving half-+ levels at each momentum, taken whole (each level
// is an SU(2)+ multiplet), the levels with the most singlet weight per mode against partner weight first (sHeavy) or
// the most partner weight first (the complement). The two are complementary at every momentum, so B, which takes every
// level once, is their exact average in any linear reading
function bandSea(b: Block, sHeavy: boolean): Choice[] {
  const m = movingOf(b)
    .map(i => ({ i, p: b.clusters[i]!.parts[PART_PLUS]! }))
    .filter(x => x.p.dim > 0.5)
    .map(x => ({ ...x, lean: (trace8(x.p.AS) - trace8(x.p.AD)) / x.p.dim }))
    .sort((x, y) => y.lean - x.lean)
  const total = m.reduce((s, x) => s + x.p.dim, 0)
  const out: Choice[] = []

  let have = 0

  for (const x of sHeavy ? m : [...m].reverse()) {
    if (have + 0.5 < total / 2) {
      out.push({ cluster: x.i, part: PART_PLUS })
      have += x.p.dim
    }
  }

  return out
}

type RunReading = {
  rule: string
  L: number
  full: SeaReading
  B: SeaReading
  BW: SeaReading[]
  sHeavy: SeaReading
  dHeavy: SeaReading
  lowest: SeaReading
  excited: SeaReading
  exact: { re: number; im: number; den: number; ranks: number[] }
  commutes: number
  flatWorst: number
  hfWorst: number
  multiplets: boolean
  seconds: number
}

function isospinOf(g: Register, rule: LedgerRule): SectorIsospin {
  const gen = (E: Float64Array): { re: Float64Array; im: Float64Array }[] =>
    g.X.map(x => {
      const img = sectorImage(E, x)
      // t = (i / 2) img
      const re = new Float64Array(64)
      const im = new Float64Array(64)

      img.forEach((r, a) => r.forEach((v, b) => (im[a * 8 + b] = v / 2)))

      return { re, im }
    })

  return { S: gen(rule.ES), D: gen(rule.ED) }
}

function readRule(
  name: 'R0' | 'R1',
  L: number,
  g: Register,
  s: Sectors,
  log: (w: string) => void,
): RunReading {
  const started = Date.now()
  const rule = ruleOf(name, s)
  const t = torus(L)
  const projectors: RegisterProjector[] = [
    { re: g.plus, im: g.plus.map(r => r.map(() => 0)) },
    downOf(g, 0),
    downOf(g, 1),
    downOf(g, 2),
    { re: g.minus, im: g.minus.map(r => r.map(() => 0)) },
  ]
  const blocks = ledgerBlocks(rule, t, projectors, CLUSTER)

  log(`${name} L ${L} blocks`)

  const kernel = stringKernel(t, CAP)
  const isospin = isospinOf(g, rule)
  const read = (choose: (b: Block, j: number) => readonly Choice[]): SeaReading =>
    seaLedger(rule, t, blocks, choose, kernel, isospin)

  // the flats: the largest count or sector weight any flat part carries
  let flatWorst = 0
  // every moving half-+ level is an SU(2)+ multiplet: its down part is half its plus part, exactly in dimension and count
  let multiplets = true

  for (const b of blocks) {
    for (const i of flatOf(b)) {
      for (const p of b.clusters[i]!.parts) {
        flatWorst = Math.max(
          flatWorst,
          Math.abs(p.count),
          ...Array.from(p.AS.re, Math.abs),
          ...Array.from(p.AS.im, Math.abs),
          ...Array.from(p.AD.re, Math.abs),
          ...Array.from(p.AD.im, Math.abs),
        )
      }
    }

    for (const i of movingOf(b)) {
      const c = b.clusters[i]!
      const plus = c.parts[PART_PLUS]!

      for (const k of PART_DOWN) {
        const d = c.parts[k]!

        multiplets &&=
          Math.abs(2 * d.dim - plus.dim) <= EXACT &&
          Math.abs(2 * d.count - plus.count) <= EXACT * Math.max(1, Math.abs(plus.count))
      }
    }
  }

  // Hellmann-Feynman against finite differences of the phases, at a few momenta (both halves summed)
  let hfWorst = 0

  for (const j of HF_MOMENTA) {
    const K = t.momenta[j]!
    const b = blocks[j]!
    const phases = (shift: number): number[] => {
      const e = unitaryEigen(
        cycleMatrix(ruleOf(name, s, shift).pieces, REGISTER_ROOTS, K),
        MODES,
      )

      return [...e.phases].sort((x, y) => x - y)
    }
    const up = phases(HF_STEP)
    const dn = phases(-HF_STEP)

    let at = 0

    for (const c of b.clusters) {
      let fd = 0

      for (let i = at; i < at + c.size; i++) {
        fd += (up[i]! - dn[i]!) / (2 * HF_STEP)
      }

      at += c.size
      hfWorst = Math.max(
        hfWorst,
        Math.abs(fd - (c.parts[PART_PLUS]!.count + c.parts[PART_MINUS]!.count)),
      )
    }
  }

  log(`${name} L ${L} hf`)

  // B: E-FRC-0268's sea, the full sea less the -i eigenspace of X_1 on half + at every mode, flats included
  const B = read(b => b.clusters.map((_, i) => ({ cluster: i, part: PART_DOWN[0]! })))
  // its moving part, along each of the three generators
  const BW = PART_DOWN.map(k =>
    read(b => movingOf(b).map(i => ({ cluster: i, part: k }))),
  )
  const sHeavy = read(b => bandSea(b, true))
  const dHeavy = read(b => bandSea(b, false))
  // the lower of the two band seas under the ledger, and the same sea with momentum 0 given the other choice: a sea
  // known to be excited above it, since the ledger's leading term is the imbalance and the lower sea has it extreme
  const sLower = sHeavy.total <= dHeavy.total
  const lowest = sLower ? sHeavy : dHeavy
  const excited = read((b, j) => bandSea(b, j === 0 ? !sLower : sLower))
  const full = read(() => [])

  log(`${name} L ${L} seas`)

  // the rule's sector projectors (as integer matrices: 24 Q_S, 48 Q_D, and their products with 2 P+) against 1 (x) Y_1
  // and 1 (x) J, exactly
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const P2 = chirality2(g.J, 1)
  const commutes = Math.max(
    ...[S24, D48, matMul(D48, P2), matMul(S24, P2)].map(q =>
      Math.max(
        registerGap(q, IDENTITY_SLOTS, g.Y[0]!),
        registerGap(q, IDENTITY_SLOTS, g.J),
      ),
    ),
  )

  return {
    rule: name,
    L,
    full,
    B,
    BW,
    sHeavy,
    dHeavy,
    lowest,
    excited,
    exact: exactCount(name, g),
    commutes,
    flatWorst,
    hfWorst,
    multiplets,
    seconds: (Date.now() - started) / 1000,
  }
}

export function energyLedgerRun(plan: LedgerPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const g = register()
  const s = sectors(g)
  const runs = plan.runs.map(r => readRule(r.rule, r.L, g, s, log))

  for (const r of runs) {
    const row = (name: string, x: SeaReading): string =>
      `${r.rule} L${r.L} ${name.padEnd(8)} E ${x.total.toFixed(6)} one ${x.oneBody.toFixed(6)} pair ${x.pair.toFixed(6)} (direct ${x.stringDirect.toFixed(5)} exchange ${x.stringExchange.toFixed(5)} contact ${x.contactPart.toFixed(5)}) nS ${x.nS.toFixed(5)} nD ${x.nD.toFixed(5)} varS ${x.varS.toExponential(2)} varD ${x.varD.toExponential(2)} T2 ${x.casimirS.toFixed(4)} ${x.casimirD.toFixed(4)} holes ${x.holes.toFixed(3)}`

    console.error(row('full', r.full))
    console.error(row('B', r.B))
    r.BW.forEach((x, k) => console.error(row(`B_W X${k + 1}`, x)))
    console.error(row('S-heavy', r.sHeavy))
    console.error(row('D-heavy', r.dHeavy))
    console.error(row('excited', r.excited))
    console.error(
      `${r.rule} L${r.L} exact ${JSON.stringify(r.exact)} commutes ${r.commutes} flat ${r.flatWorst.toExponential(2)} hf ${r.hfWorst.toExponential(2)} multiplets ${r.multiplets} ${r.seconds.toFixed(0)} s`,
    )
  }

  const near = (x: number, y: number, tol: number): boolean =>
    Math.abs(x - y) <= tol
  const each = (f: (r: RunReading) => boolean): boolean => runs.every(f)

  // ---- E: the ledger is an exact count on B ----
  const E = each(
    r =>
      r.exact.re === 0 &&
      r.exact.im === 0 &&
      r.exact.ranks.every(x => x === 8) &&
      r.commutes === 0 &&
      [r.B, ...r.BW].every(
        x =>
          near(x.total, 0, EXACT) &&
          near(x.nS, 2, EXACT) &&
          near(x.nD, 2, EXACT) &&
          near(x.varS, 0, EXACT) &&
          near(x.varD, 0, EXACT),
      ) &&
      near(r.full.total, 0, 1e-12),
  )
  // ---- H: Hellmann-Feynman ----
  const H = each(r => r.hfWorst <= HF_TOLERANCE && r.multiplets)
  // ---- F: the flats are blind ----
  const F = each(r => r.flatWorst <= FLAT_BLIND)
  // ---- M: the midpoint, one-body and whole ----
  const M = each(
    r =>
      near(r.BW[0]!.oneBody, (r.sHeavy.oneBody + r.dHeavy.oneBody) / 2, EXACT) &&
      Math.abs(r.sHeavy.oneBody - r.dHeavy.oneBody) > 1 &&
      near(
        r.BW[0]!.total,
        (r.sHeavy.total + r.dHeavy.total) / 2,
        EXACT * Math.max(1, Math.abs(r.sHeavy.total)),
      ),
  )
  // ---- S: the hypothesis, the ledger selects B ----
  const rivals = (r: RunReading): SeaReading[] => [r.sHeavy, r.dHeavy]
  const S = each(r => rivals(r).every(x => r.BW[0]!.total < x.total - SELECT))
  // ---- controls ----
  const C1 = each(r => r.excited.total > r.lowest.total + SELECT)
  const C2 = each(
    r => Math.min(r.sHeavy.oneBody, r.dHeavy.oneBody) < r.BW[0]!.oneBody - 1,
  )
  const C3 = each(
    r =>
      rivals(r).some(x => x.total < r.BW[0]!.total - SELECT) &&
      rivals(r).some(x => x.total > r.BW[0]!.total + SELECT),
  )

  const instrument = E && H && F && M
  const controls = C1 && C2 && C3
  const status: Verdict['status'] = S
    ? instrument && controls
      ? 'pass'
      : 'partial'
    : instrument && controls
      ? 'fail'
      : 'partial'
  const per = (key: string, f: (r: RunReading) => number): Record<string, number> =>
    Object.fromEntries(runs.map(r => [`${key}_${r.rule}_L${r.L}`, f(r)]))

  return verdict({
    status,
    claim: `E ${E} H ${H} F ${F} M ${M} S ${S} (the ledger selects B); controls C1 ${C1} C2 ${C2} C3 ${C3}. ${runs
      .map(
        r =>
          `${r.rule} L${r.L}: B ${r.BW[0]!.total.toFixed(9)}, band seas ${r.sHeavy.total.toFixed(4)} and ${r.dHeavy.total.toFixed(4)} (one-body ${r.sHeavy.oneBody.toFixed(4)} and ${r.dHeavy.oneBody.toFixed(4)}, S minus D ${(r.sHeavy.nS - r.sHeavy.nD).toFixed(5)} and ${(r.dHeavy.nS - r.dHeavy.nD).toFixed(5)}), the excited sea ${r.excited.total.toFixed(4)}, T^2 in the singlet sector of B ${r.BW[0]!.casimirS.toFixed(4)} and of the band seas ${r.sHeavy.casimirS.toFixed(4)}`,
      )
      .join('; ')}`,
    metrics: {
      E: flag(E),
      H: flag(H),
      F: flag(F),
      M: flag(M),
      S: flag(S),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      ...per('B', r => r.BW[0]!.total),
      ...per('excited', r => r.excited.total),
      ...per('sHeavy', r => r.sHeavy.total),
      ...per('dHeavy', r => r.dHeavy.total),
      ...per('sHeavyOneBody', r => r.sHeavy.oneBody),
      ...per('dHeavyOneBody', r => r.dHeavy.oneBody),
      ...per('imbalance', r => r.sHeavy.nS - r.sHeavy.nD),
      ...per('casimirB', r => r.BW[0]!.casimirS),
      ...per('casimirBand', r => r.sHeavy.casimirS),
      ...per('hf', r => r.hfWorst),
      ...per('flat', r => r.flatWorst),
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2), C3: flag(C3) },
    notes: `L1 (the count, the midpoint, the blind flats) and L2 (the band seas' numbers on the torus). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
