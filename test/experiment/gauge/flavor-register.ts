// DO THREE FLAVORS WITH THE TRIMAXIMAL MIXING BREAK C AND CP TOGETHER ON THE REGISTER? (E-FRC-0259). E-FRC-0258 gave the
// Clifford register exact chirality: two mirror halves, a chiral mass that breaks P and CP and keeps C, and the ring's
// trimaximal mixing V_jk = w^(jk) / sqrt(-3) with the maximal Jarlskog invariant sqrt(3) / 18. Its named next step: a
// flavor index of size 3 that W(F4) does not touch, with V on the mass step of one half, so that C and CP break together.
// This file builds it (576 modes a member: 24 slots x 8 register x 3 flavors), and asks what a phase that no rephasing
// removes needs in this model.
//
// DERIVED BEFORE THE RUN (code/measure/flavor-register; eps, frames and readers as E-SPN-0160 and E-FRC-0258).
// 1. THE INVARIANTS SURVIVE (L1). W(F4) acts on slot (x) register and not on flavor, so every covariance statement of
//    E-FRC-0258 holds unchanged. The mass steps are A+ = V D V^dag on Q_S P+ and A- = D on Q_S P- (beat 1), and their
//    inverses A+^dag, A-^dag on Q_D P+- (beat 2), D = diag(u1, u2, u3). The register-flavor unitary W = P+ (x) V + P- (x)
//    1 commutes with the slot reversal, the stream and every projector (it acts on register and flavor the same way at
//    every slot, and P+- commute with Q_S and Q_D), and W^dag A W = D in both halves: so the whole rule is W-equivalent to
//    three decoupled copies, one per flavor, each E-SPN-0160's schedule at the mass of u_f in BOTH halves. Per flavor, and
//    exactly: 4 + 4 bands on pi +- E(K; M_f) and 88 flats in each half, gamma = 0, one light speed c / 4, R_f = tan m_f /
//    m_f, isotropy, and a closed census with B* = 2 M_f for m_f < pi / 6; a pair of two flavors sits at B* = 2 min(M_i,
//    M_j) (E-FRC-0258 point 4's argument, with the two masses of the two flavors). Masses: m = 0.143348 (ringUnit(2, 2)),
//    0.190126 (ringUnit(-1, 4)), 0.236904 (ringUnit(-4, 0)), all exact units, all in (0, pi / 6).
// 2. AND THE MIXING IS REMOVABLE (L1, the reason C and CP cannot break together here). W is a legitimate change of basis
//    of the rule (it commutes with every covariance and with every piece's structure), and it removes V entirely: so
//    mixing on one half alone is no mixing at all, and not even a P violation, since both halves then carry the same
//    three masses. A phase no rephasing removes needs TWO flavor bases referenced within ONE conserved species, or two
//    species coupled flavor-diagonally (the up and down quarks joined by the W boson). Within one half the only flavor
//    structures are A on beat 1 and its inverse on beat 2 (anything else gives particle and antiparticle different
//    masses, which CPT forbids): one basis. So the phase needs a piece that couples the halves.
// 3. NO SUCH PIECE EXISTS IN THE EXACT DIRAC CLASS (L1, a theorem). E-SPN-0160's one-body structure, the S - D pairing
//    that gives c / 4, gamma = 0, R = tan m / m and the closed census, is kept by a register operator B on Q_S and B' on Q_D
//    exactly when B' gamma(a) = gamma(a) B for every vector a, and for B = B' slot-uniform when B commutes with every
//    gamma_i^T gamma_j (left multiplication by the bivectors e_i e_j). The commutant of the left multiplications of
//    Cl+(4) is its right multiplications, R(x), x even: dimension 8. And the volume element is CENTRAL in Cl+(4) (vol
//    anticommutes with vectors and so commutes with bivectors), so every R(x) commutes with J = R(vol). No operator in the
//    class couples the two halves. Adding covariance under the 576 rotations leaves exactly span(P+, P-): the chiral
//    masses of E-FRC-0258, and nothing else. PREDICTED: commutant of the 16 bilinears of rank 56 (null 8), the eight R(x)
//    in it with rank 8, each commuting with J; with the rotations, null 2.
// 4. OUTSIDE THE CLASS THE PHASE IS PHYSICAL, AND IT COSTS CPT (L1 for the rest dynamics, L2 for the cost). Of the six
//    rotation-covariant register operators, two do not commute with J (the probe's count); the plainest, covariant under
//    all of W(F4), is the projector on the blade vol (every g sends vol to det(g) vol). A phase uK on Q_S (x) |vol><vol| (x)
//    1, uK = ringUnit(-3, 2) (angle 0.0936), joins the halves on the singlet's scalar pair. At rest the singlet decouples
//    from D (g(0) = 0), so the particle's dynamics on span(1, vol) (x) flavor is EXACTLY the 6 x 6 beat B = C (P+ (x) A+ +
//    P- (x) A-) over Q(w). The probability that weak flavor alpha in the - half is found as beta is then rational, and
//    the T-odd asymmetry A(t) = P(0 -> 1) - P(1 -> 0) is a rephasing invariant (it reads only |amplitudes| between
//    states of fixed flavor): it flips sign under V -> conj(V), vanishes for a real mixing and for V = 1, and with CPT
//    exact would equal the CP asymmetry. The rule's own CP invariant, with H+- = (A+- + A+-^dag) / 2, is
//    det[H+, H-] = -2 i J prod(c_i - c_j)^2 exactly (c the three cos theta_f). BUT the vol phase acts on S and has no
//    partner on D that keeps the pairing (point 3), so it breaks the exact Dirac band and, with it, the spectrum's
//    symmetry about pi, which is CPT's reading. PREDICTED: A(t) nonzero, exact, odd in V, zero for Householder and V = 1,
//    unchanged by 36 rephasings; the toy's spectra off the Dirac law and off the CPT reading by more than 1e-3, where the
//    free rule's are within 1e-9.
// 5. WHAT THIS LEAVES OF SAKHAROV (argued). (i) Baryon-number violation: LACKING, and now sharper: every one-body piece
//    in the exact Dirac class conserves N+ and N- separately (point 3), so a number-violating piece is necessarily
//    many-body. The pair table (an empty line to a love-fear pair and back, E-RLT-0103) changes member number by two and
//    keeps charge; whether a register pair it makes can be one + and one - member, which would make it the model's
//    sphaleron, depends on the many-body register rule, not yet written. (ii) C and CP together: NOT AT ONE BODY. The
//    trimaximal phase is maximal and exact but removable until the halves couple, and the only one-body coupling breaks
//    CPT (point 4). The coupling must be an INTERACTION between species, the W boson's shape: a two-body piece, flavor
//    diagonal, that turns a + member into a - member while emitting or absorbing something that carries the difference.
//    (iii) Departure from equilibrium: PRESENT (E-FRC-0258 point 7).
// 6. THE MIRROR HALF AND DARK MATTER (a structural finding, not a claim). Enumerating the rule's one-body pieces: the
//    stream (diagonal in slots), the swap coin (slots only; trivial on even forms), the mass mixers on Q_S P+- and Q_D P+-
//    (flavor matrices on the halves), the flavor mixing (flavor only): every one commutes with J, so the halves are
//    exactly decoupled (B1's leak between sectors). By point 3 no covariant one-body piece that keeps the Dirac structure
//    can couple them, and the one that couples them breaks CPT (point 4). So in the rule as it stands, the mirror half
//    meets this one through nothing but what reads both: the depth (gravity), and the many-body collision with registers,
//    which is not written. That is the structure dark matter has. Whether it IS dark matter needs the many-body rule
//    and a count of the mirror half's abundance.
//
// PREDICTED VERDICT: FAIL on G, as derived: no piece that keeps E-SPN-0160's one-body structure breaks C and CP together.
// Every other gate, the instrument and the controls hold.
//
// GATES, fixed before the gate run.
//  A1 THE COMMUTANT, EXACT: the 16 bilinears gamma_i^T gamma_j leave a commutant of rank 56 (null 8); the eight right
//     multiplications R(x) commute with all 16 and have rank 8; each commutes with J; with all 576 rotations added the
//     null space is 2, and P+ and P- lie in it.
//  A2 THE MIXING AND THE MASSES, EXACT: V V^dag = 1 over Z[w][1/3]; the three units norm one; masses distinct in (0, pi / 6).
//  A3 THE CP INVARIANT, EXACT: det[H+, H-] has real part 0 and equals -2 i J prod(c_i - c_j)^2 with J = sqrt(3) / 18 (the
//     imaginary coefficient ratio exactly -2/9 of prod, in the (a + b w) / d form: b / prod = -2 * 9 / 81 * ... read as
//     b = -(2 / 9) prod numerator over the same denominator); +2/9 for conj(V); exactly 0 for the Householder mixing.
//  B1 THE FREE RULE SPLITS: in the J eigenbasis with the + half's flavor rotated by V, both pieces are block diagonal in
//     (sector, flavor), weight between blocks at most 1e-14, and every block equals E-SPN-0160's registerPiece at u_f
//     cut by E-FRC-0258's sectorBlock, to 1e-14.
//  B2 PER FLAVOR: at 64 Weyl momenta each flavor's block has 4 + 4 phases on pi +- E(K; M_f) (1e-10) and 88 at 0 (1e-8);
//     the massless twin gives pairs of 8 with |gamma| / c0 <= 1e-9 and c0 = c / 4 to 1e-9; |R_f - tan m_f / m_f| <= 1e-9
//     along four directions; the K^2 coefficients isotropic to 1e-6.
//  B3 THE CHANNELS: each flavor's census (4 directions x 300 steps to 3 pi, 64 Weyl momenta) has no crossing and B* = 2
//     M_f to 1e-6; each pair of flavors' mixed census has no crossing and B* = 2 min(M_i, M_j) to 1e-6.
//  B4 THE MIXING IS INVISIBLE: at 8 Weyl momenta the + half's 288-mode spectrum (flavor unrotated) equals the union of
//     its three flavor blocks' spectra (1e-10), and the readings P_imp, P_rot, C (raw), CP and CPT, each on the two
//     halves' 288-mode spectra, are all at most 1e-9. The rest toy with no coupling equals W B(V = 1) W^dag exactly.
//  G  C AND CP TOGETHER IN THE EXACT DIRAC CLASS: a covariant one-body piece keeping the S - D pairing couples the halves.
//     By A1 it does not exist: G FAILS, as derived.
//  D1 THE COUPLING, EXACT: 24 Q_S (x) |vol><vol| is an integer matrix covariant under all 1,152 elements; it does not
//     commute with 2 P+; |vol><vol| does not commute with the 16 bilinears.
//  D2 THE PHASE IS PHYSICAL ONCE COUPLED, EXACT: A(t) for t = 1 .. 12 is real rational, nonzero for some t; conj(V) gives
//     -A(t) at every t; Householder and V = 1 give 0 at every t; all 36 rephasings (row 0 and column 0 of V by sixth
//     roots) give A(t) exactly; with no coupling A(t) = 0 at every t.
//  D3 ITS COST: at 2 Weyl momenta the toy's spectrum is more than 1e-3 from the Dirac law and its CPT reading more than
//     1e-3, while the free rule's are within 1e-9.
// INSTRUMENT (a failure makes the verdict partial at best). I1 the full 576-mode toy cycle at K = 0 reproduces the exact
//  rest probabilities P(0 -> 1) for t = 1 .. 8 to 1e-12.
// CONTROLS. C1 E-FRC-0258 BIT FOR BIT: the flavor-trivial chiral mass (u+ = ringUnit(-1, 4), u- = ringUnit(2, 2) on every
//  flavor) gives pieces equal to E-FRC-0258's chiralPiece entry for entry on every flavor diagonal (===) and exactly 0 off
//  it, so every E-FRC-0258 number follows unchanged. C2 the Householder mixing (real, exact over Z[1/3]) gives a zero CP
//  invariant and a zero asymmetry. C3 V = 1 gives a zero asymmetry.
// Verdict: fail if any of A1 to A3, B1 to B4, D1 to D3 fails, or if G fails (predicted); partial if all hold with G
// holding; a failed instrument or control is reported and keeps the verdict at fail or partial.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/flv-probe1.log: the commutant ranks (bilinears null
//  8, the R(x) commuting, commuting with J, rank 8; rotations alone null 6, of which 4 commute with J; all of W(F4) null
//  3; bilinears and rotations null 2); the three masses; uK's angle 0.0936; the exact asymmetry for the trimaximal
//  mixing coupled (0, -1.50e-9, -3.58e-8 ... -6.01e-4 at t = 12), its exact negative for conj(V), zeros for Householder,
//  V = 1 and no coupling, invariant over 36 rephasings; det[H+, H-] = (-959078961 - 1918157922 w) / 1276676260761792016
//  against prod^2 = 8631710649 / (same), so b = -(2/9) prod^2's numerator: -2 i J prod^2 with J = sqrt(3) / 18.
//  tmp/flv-probe2.log: the free rule's block leak 2.7e-16 and block gap 2.2e-16 against registerPiece, E-FRC-0258 bit
//  for bit, the rest instrument 8e-20, and at 2 momenta the free rule's CPT 4.0e-15 and Dirac-law distance 3.8e-15 with
//  528 flats, the toy's CPT 7.95e-2 and Dirac-law distance 7.95e-2 with 528 flats. tmp/flv-smoke.log: every code path on
//  a small plan (4 momenta, 30 census steps, 6 beats), 40 s: every gate as predicted, G false, verdict fail.
//
// FIRST RUN (tmp/flv-exp-run1.log, 159 s): FAIL on G, as derived; every other gate, the instrument and all three controls
//  hold. No gate moved and none was rerun.
//  - A1: bilinear commutant null 8, the eight R(x) in it with rank 8, each commuting with J; with the rotations null 2
//    (P+ and P-). Rotations alone null 6, of which 4 commute with J. A2 exact. A3: det[H+, H-] = (-959078961 - 1918157922
//    w) / 1276676260761792016 = -2 i J prod^2 exactly, the opposite for conj(V), 0 for Householder.
//  - B1 leak 2.7e-16, block gap 2.2e-16. B2: 4 + 4 on pi +- E(K; M_f) and 88 flat per flavor at 64 momenta (gap 2.4e-15),
//    massless pairs of 8 at c / 4 (to 8e-12), gamma to 2.7e-11, R - tan m / m at most 1.6e-11, isotropy 1.1e-11. B3:
//    B* 0.573390276, 0.760502413, 0.947614551 (= 2 M_f), mixed 0.573390276, 0.573390276, 0.760502413 (= 2 min), no
//    crossing. B4: union 3.6e-15, P_imp 2.5e-15, CP 3.1e-15, CPT 3.6e-15; removable at rest exactly.
//  - G: null with J 2, so no covariant Dirac-class operator couples the halves.
//  - D1 exact. D2: A(t) = 0, -1.504e-9, -3.583e-8, -2.955e-7, -1.458e-6, -5.274e-6, -1.545e-5, -3.887e-5, -8.706e-5,
//    -1.778e-4, -3.372e-4, -6.010e-4, exact rational, the opposite for conj(V), 0 for Householder, V = 1 and no coupling,
//    unchanged by 36 rephasings. D3: toy Dirac-law distance and CPT reading 7.95e-2, free rule 3.8e-15 and 4.0e-15.
//  - I1 8.1e-20. C1 E-FRC-0258 bit for bit, C2 and C3 zero.
// NEXT. (1) The many-body rule with registers: the one place left for a piece that couples the halves while keeping the
//  one-body Dirac structure, the W boson's shape (a two-body, flavor-diagonal transition carrying the difference). (2)
//  Whether the pair table can make a + member with a - member (number violation). (3) The mirror half's abundance.
//
// Depth L1 (the commutant, the removability, the rest dynamics and the CP invariant are exact algebra) and L2 (the bands,
// speeds, channels and symmetry readings of the 576-mode rule). DETERMINISM: no random numbers; Weyl sequences, grids and
// fixed paths. NOTHING MOVES: the pieces hand values between the slots, register components and flavors of one dock, and
// the stream takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  DOCK_ROOTS,
  wrap,
  type CMatrix,
} from '@/code/measure/dock-mixer'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import { cycleMatrix, cyclePhases } from '@/code/measure/swap-cone'
import {
  ringUnit,
  unitAngle,
  unitNormExact,
} from '@/code/measure/swap-string'
import { type RingUnit } from '@/code/rule/swap-mixer'
import {
  radialPaths,
  restFrame,
  type Census,
  type Frame,
} from '@/code/measure/two-beat'
import {
  commutesExactly,
  cycleMasslessPairN,
  diracPhase,
  EVEN,
  f4Group,
  frameRN,
  gammaMatrices,
  matMul,
  pairCensusN,
  partnerProjector48,
  registerPiece,
  sameMatrix,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  chiralPiece,
  chirality2,
  det4,
  mixedCensus,
  phaseMismatch,
  SECTOR_ROOTS,
  sectorBasis,
  sectorBlock,
  trimaximal,
  unitaryExact,
  volumeRight,
} from '@/code/measure/chiral-register'
import {
  commutantRows,
  FLAVOR_MODES,
  FLAVOR_ROOTS,
  flavorPiece,
  flavorSectorBlocks,
  HOUSEHOLDER,
  qw,
  qwAdd,
  qwConj,
  qwDagger,
  qwDet3,
  qwDiag,
  qwFromEisQMatrix,
  qwFromUnit,
  qwIdentity,
  qwMatEq,
  qwMatMul,
  qwMul,
  qwSub,
  qwToComplex,
  QW_ONE,
  rankExact,
  rephase,
  restToy,
  rightMultiplication,
  SECTOR_FLAVOR_ROOTS,
  sectorFlavorBlock,
  transition,
  type Complex,
  type QW,
  type QWMatrix,
} from '@/code/measure/flavor-register'

const C = Math.SQRT2
const C_QUARTER = C / 4
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GENERIC_RAW = [0.29, 0.52, 0.8, 0]
const GENERIC = GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW))
const DIRS: readonly number[][] = [
  [1, 0, 0, 0],
  [s2, s2, 0, 0],
  [s3, s3, s3, 0],
  GENERIC,
]
const SCALES: readonly number[] = [0.1, 0.2, 0.3, 0.4, 0.5]
const FLAVOR_UNITS: readonly (readonly [number, number])[] = [
  [2, 2],
  [-1, 4],
  [-4, 0],
]
const PLUS: readonly [number, number] = [-1, 4]
const MINUS: readonly [number, number] = [2, 2]
const MASSLESS: readonly [number, number] = [0, 3]
const COUPLING: readonly [number, number] = [-3, 2]
const BAND_TOLERANCE = 1e-10
const FLAT_TOLERANCE = 1e-8
const LEAK_TOLERANCE = 1e-14
const GAMMA_TOLERANCE = 1e-9
const R_EXACT = 1e-9
const ISOTROPY = 1e-6
const BSTAR_TOLERANCE = 1e-6
const SYMMETRY_HOLDS = 1e-9
const COST = 1e-3
const INSTRUMENT_TOLERANCE = 1e-12
const INSTRUMENT_BEATS = 8

export type FlavorPlan = {
  momenta: number
  censusSteps: number
  weylExtra: number
  symmetryMomenta: number
  toyMomenta: number
  beats: number
}

export const GATE_PLAN: FlavorPlan = {
  momenta: 64,
  censusSteps: 300,
  weylExtra: 64,
  symmetryMomenta: 8,
  toyMomenta: 2,
  beats: 12,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/flavor-register',
  code: 'E-FRC-0259',
  title:
    "three flavors with the trimaximal mixing on the Clifford register do not break C and CP together, fail as derived: a flavor index W(F4) does not touch keeps every one-body property of E-FRC-0258 exactly (three copies of E-SPN-0160 at three exact light masses, gamma = 0, c/4, R = tan m/m, isotropy, every census closed, mixed flavors at 2 min M), but mixing on one half is removed by a change of basis, and no piece that keeps E-SPN-0160's Dirac pairing can couple the halves, since its register operators are the right multiplications of Cl+(4) and the volume element is central (rank-exact commutant, with rotations only the chiral masses remain); the one covariant coupling, a phase on the volume blade, makes the trimaximal phase physical (an exact rational T-odd asymmetry, odd in V, rephasing invariant, det[H+, H-] = -2iJ prod dc^2) at the cost of the Dirac band and CPT; so C and CP together, and baryon-number violation, need a many-body interaction between the halves, and the mirror half meets this one only through depth and that interaction",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return flavorRegisterRun(GATE_PLAN)
  },
})

const unitValue = (u: RingUnit): [number, number] => {
  const t = unitAngle(u)

  return [Math.cos(t), Math.sin(t)]
}

const conj = (u: readonly [number, number]): [number, number] => [
  u[0],
  -u[1],
]
const mOf = (u: RingUnit): number => wrap(unitAngle(u) - Math.PI) / 2
const mm = (
  a: readonly (readonly number[])[],
  b: readonly (readonly number[])[],
): number[][] =>
  a.map(r =>
    (b[0] as number[]).map((_, j) =>
      r.reduce((s, x, k) => s + x * (b[k] as number[])[j]!, 0),
    ),
  )
const tr8 = (a: readonly (readonly number[])[]): number[][] =>
  (a[0] as number[]).map((_, j) => a.map(r => r[j]!))
const eqM = (
  a: readonly (readonly number[])[],
  b: readonly (readonly number[])[],
): boolean =>
  a.every((r, i) => r.every((x, j) => x === (b[i] as number[])[j]))
const scalar3 = (u: readonly [number, number]): Complex => ({
  re: [0, 1, 2].map(i => [0, 1, 2].map(j => (i === j ? u[0] : 0))),
  im: [0, 1, 2].map(i => [0, 1, 2].map(j => (i === j ? u[1] : 0))),
})
const asFraction = (x: QW): number => Number(x.a) / Number(x.d)

export function flavorRegisterRun(plan: FlavorPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const group = f4Group()
  const rotations = group.filter(g => det4(g.matrix) === 1)
  const J = volumeRight()
  const basis = sectorBasis(J)
  const gam = gammaMatrices()
  const bilinears = [0, 1, 2, 3].flatMap(i =>
    [0, 1, 2, 3].map(j => mm(tr8(gam[i]!), gam[j]!)),
  )

  // ---------------- A1: the commutant ----------------
  const nullBilinears = 64 - rankExact(commutantRows(bilinears, 1))
  const rights = EVEN.map(rightMultiplication)
  const rightsCommute = rights.every(R =>
    bilinears.every(L => eqM(mm(R, L), mm(L, R))),
  )
  const rightsRank = rankExact(
    rights.map(R => R.flat().map(x => BigInt(x))),
  )
  const rightsKeepJ = rights.every(R => eqM(mm(R, J), mm(J, R)))
  const nullWithRotations =
    64 -
    rankExact(
      commutantRows(
        [...bilinears, ...rotations.map(g => g.register)],
        4,
      ),
    )
  const nullRotations =
    64 -
    rankExact(
      commutantRows(
        rotations.map(g => g.register),
        4,
      ),
    )
  const nullRotationsJ =
    64 -
    rankExact(commutantRows([...rotations.map(g => g.register), J], 4))
  const Pplus = J.map((r, i) =>
    r.map((x, j) => (x + (i === j ? 1 : 0)) / 2),
  )
  const Pminus = J.map((r, i) =>
    r.map((x, j) => (-x + (i === j ? 1 : 0)) / 2),
  )
  const chiralInCommutant = [Pplus, Pminus].every(
    P =>
      bilinears.every(L => eqM(mm(P, L), mm(L, P))) &&
      rotations.every(g => eqM(mm(P, g.register), mm(g.register, P))),
  )
  const A1 =
    nullBilinears === 8 &&
    rightsCommute &&
    rightsRank === 8 &&
    rightsKeepJ &&
    nullWithRotations === 2 &&
    chiralInCommutant

  log('A1')

  // ---------------- A2: the mixing and the masses ----------------
  const units = FLAVOR_UNITS.map(([k, j]) => ringUnit(k, j))
  const masses = units.map(mOf)
  const A2 =
    unitaryExact(trimaximal()) &&
    units.every(unitNormExact) &&
    masses.every(m => m > 0 && m < Math.PI / 6) &&
    new Set(masses.map(m => m.toFixed(12))).size === 3

  // ---------------- A3: the CP invariant ----------------
  const D = qwDiag(units.map(qwFromUnit))
  const V = qwFromEisQMatrix(trimaximal())
  const Vbar = V.map(r => r.map(qwConj))
  const aPlus = (W: QWMatrix): QWMatrix =>
    qwMatMul(qwMatMul(W, D), qwDagger(W))
  const hermitian = (A: QWMatrix): QWMatrix =>
    A.map((r, i) =>
      r.map((x, j) => {
        const s = qwAdd(x, qwConj((A[j] as QW[])[i]!))

        return qw(s.a, s.b, s.d * 2n)
      }),
    )

  const commutator = (X: QWMatrix, Y: QWMatrix): QWMatrix => {
    const a = qwMatMul(X, Y)
    const b = qwMatMul(Y, X)

    return a.map((r, i) =>
      r.map((x, j) => qwSub(x, (b[i] as QW[])[j]!)),
    )
  }

  const cpInvariant = (W: QWMatrix): QW =>
    qwDet3(commutator(hermitian(aPlus(W)), hermitian(D)))
  const cosines = units
    .map(qwFromUnit)
    .map(x => qw(2n * x.a - x.b, 0n, 2n * x.d))
  const dc = (i: number, j: number): QW =>
    qwSub(cosines[i]!, cosines[j]!)
  const prod = [dc(0, 1), dc(1, 2), dc(2, 0)].reduce(
    (s, x) => qwMul(s, x),
    QW_ONE,
  )
  const prod2 = qwMul(prod, prod)
  const detV = cpInvariant(V)
  const detVbar = cpInvariant(Vbar)
  const detH = cpInvariant(HOUSEHOLDER)
  // (a + b w) / d is purely imaginary iff 2 a = b; its imaginary part is b sqrt(3) / (2 d); -2 i J prod^2 with J = sqrt(3)
  // / 18 has imaginary part -(sqrt(3) / 9) prod^2, so b / d = -(2 / 9) prod^2 exactly
  const ratio = (x: QW, sign: bigint): boolean =>
    2n * x.a === x.b &&
    x.b * 9n * prod2.d === sign * -2n * prod2.a * x.d
  const A3 =
    ratio(detV, 1n) &&
    ratio(detVbar, -1n) &&
    detH.a === 0n &&
    detH.b === 0n

  log('A2 A3')

  // ---------------- the 576-mode pieces ----------------
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const P2 = chirality2(J, 1)
  const M2 = chirality2(J, -1)
  const qSp = scaled(matMul(S24, P2), 48)
  const qSm = scaled(matMul(S24, M2), 48)
  const qDp = scaled(matMul(D48, P2), 96)
  const qDm = scaled(matMul(D48, M2), 96)
  const cx = qwToComplex
  const rule = (
    Aplus: QWMatrix,
    Aminus: QWMatrix,
    coupling?: readonly [number, number],
  ): CMatrix[] => [
    flavorPiece(
      [
        { q: qSp, F: cx(Aplus) },
        { q: qSm, F: cx(Aminus) },
      ],
      coupling ? { q: vol24Scaled(), u: coupling } : undefined,
    ),
    flavorPiece([
      { q: qDp, F: cx(qwDagger(Aplus)) },
      { q: qDm, F: cx(qwDagger(Aminus)) },
    ]),
  ]
  const free = rule(aPlus(V), D)
  const Vc = cx(V)

  // ---------------- B1: the free rule splits ----------------
  const split = free.map(P => flavorSectorBlocks(P, basis, Vc))
  const leak = Math.max(...split.map(x => x.leak))

  let blockGap = 0

  units.forEach((u, f) => {
    const own = [
      registerPiece(scaled(S24, 24), unitValue(u)),
      registerPiece(scaled(D48, 48), conj(unitValue(u))),
    ]

    for (const s of [0, 1] as const) {
      own.forEach((P, b) => {
        const ref = sectorBlock(P, basis, s).block
        const got = (split[b] as { blocks: CMatrix[][] }).blocks[s]![f]!

        blockGap = Math.max(
          blockGap,
          ...ref.re.map((x, i) => Math.abs(x - got.re[i]!)),
          ...ref.im.map((x, i) => Math.abs(x - got.im[i]!)),
        )
      })
    }
  })

  const B1 = leak <= LEAK_TOLERANCE && blockGap <= LEAK_TOLERANCE
  const flavorBlocks = [0, 1, 2].map(f =>
    split.map(x => x.blocks[0]![f]!),
  )
  const roots96 = SECTOR_ROOTS(DOCK_ROOTS)

  log('B1')

  // ---------------- B2: per flavor ----------------
  const Ms = masses.map(m => 2 * m)

  let bandCounts = true
  let bandGap = 0

  for (const K of weylMomenta(plan.momenta)) {
    flavorBlocks.forEach((blocks, f) => {
      const ph = cyclePhases(blocks, roots96, K)
      const E = diracPhase(K, Ms[f]!)
      const up = ph.filter(
        x => Math.abs(wrap(x - Math.PI - E)) <= BAND_TOLERANCE,
      ).length
      const down = ph.filter(
        x => Math.abs(wrap(x - Math.PI + E)) <= BAND_TOLERANCE,
      ).length
      const flat = ph.filter(
        x => Math.abs(wrap(x)) <= FLAT_TOLERANCE,
      ).length

      if (up !== 4 || down !== 4 || flat !== 88) {
        bandCounts = false
      }

      bandGap = Math.max(
        bandGap,
        ...ph.map(x =>
          Math.min(
            Math.abs(wrap(x)),
            Math.abs(wrap(x - Math.PI - E)),
            Math.abs(wrap(x - Math.PI + E)),
          ),
        ),
      )
    })
  }

  const uZ = ringUnit(MASSLESS[0], MASSLESS[1])
  const zeroMass = qwDiag([0, 1, 2].map(() => qwFromUnit(uZ)))
  const massless = rule(zeroMass, zeroMass).map(
    P => flavorSectorBlocks(P, basis, null).blocks[0]![0]!,
  )
  const pairs = DIRS.map(u =>
    cycleMasslessPairN(massless, Math.PI, u, 0.01, roots96),
  )
  const frames: Frame[] = units.map((u, f) =>
    restFrame(unitAngle(u), -unitAngle(u), Ms[f]),
  )
  const fits = flavorBlocks.map((blocks, f) =>
    DIRS.map(u =>
      frameRN(
        blocks,
        frames[f]!,
        unitAngle(units[f]!),
        u,
        C_QUARTER,
        SCALES,
        roots96,
      ),
    ),
  )
  const rGap = Math.max(
    ...fits.flatMap((row, f) =>
      row.map(x => Math.abs(x.R - Math.tan(masses[f]!) / masses[f]!)),
    ),
  )
  const iso = Math.max(
    ...fits.map(row =>
      Math.max(
        ...row.map(x =>
          Math.abs(x.c2 / (row[0] as { c2: number }).c2 - 1),
        ),
      ),
    ),
  )
  const B2 =
    bandCounts &&
    pairs.every(
      x =>
        x.size === 8 &&
        Math.abs(x.gamma) / C_QUARTER <= GAMMA_TOLERANCE &&
        Math.abs(x.c0 / C_QUARTER - 1) <= GAMMA_TOLERANCE,
    ) &&
    rGap <= R_EXACT &&
    iso <= ISOTROPY

  log('B2')

  // ---------------- B3: the channels ----------------
  const paths = radialPaths(DIRS, 3 * Math.PI, plan.censusSteps)
  const extra = weylMomenta(plan.weylExtra)
  const censuses = flavorBlocks.map((blocks, f) =>
    pairCensusN(blocks, frames[f]!, paths, extra, roots96),
  )
  const mixed: { i: number; j: number; c: Census }[] = []

  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      mixed.push({
        i,
        j,
        c: mixedCensus(
          flavorBlocks[i]!,
          frames[i]!,
          flavorBlocks[j]!,
          frames[j]!,
          paths,
          roots96,
        ),
      })
    }
  }

  const B3 =
    censuses.every(
      (c, f) =>
        c.crossings === 0 &&
        Math.abs(c.Bstar - 2 * Ms[f]!) <= BSTAR_TOLERANCE,
    ) &&
    mixed.every(
      ({ i, j, c }) =>
        c.crossings === 0 &&
        Math.abs(c.Bstar - 2 * Math.min(Ms[i]!, Ms[j]!)) <=
          BSTAR_TOLERANCE,
    )

  log('B3')

  // ---------------- B4: the mixing is invisible ----------------
  const roots288 = SECTOR_FLAVOR_ROOTS(DOCK_ROOTS)
  const halves = [0, 1].map(s =>
    free.map(P => sectorFlavorBlock(P, basis, s as 0 | 1).block),
  )
  const gK = (K: readonly number[]): number[] => [
    -K[0]!,
    -K[1]!,
    -K[2]!,
    K[3]!,
  ]
  const neg = (K: readonly number[]): number[] => K.map(x => -x)

  let unionGap = 0

  const read = { Pimp: 0, Prot: 0, Craw: 0, CP: 0, CPT: 0 }

  for (const K of weylMomenta(plan.symmetryMomenta)) {
    const pK = cyclePhases(halves[0]!, roots288, K)
    const mG = cyclePhases(halves[1]!, roots288, gK(K))
    const pN = cyclePhases(halves[0]!, roots288, neg(K))
    const mGN = cyclePhases(halves[1]!, roots288, neg(gK(K)))
    const mK = cyclePhases(halves[1]!, roots288, K)
    const union = flavorBlocks.flatMap(blocks =>
      cyclePhases(blocks, roots96, K),
    )

    unionGap = Math.max(unionGap, phaseMismatch(pK, union, false))
    read.Pimp = Math.max(read.Pimp, phaseMismatch(pK, mG, false))
    read.Prot = Math.max(read.Prot, phaseMismatch(pK, pN, false))
    read.Craw = Math.max(
      read.Craw,
      phaseMismatch(
        pK,
        pN.map(x => -x),
        false,
      ),
    )

    read.CP = Math.max(
      read.CP,
      phaseMismatch(
        pK,
        mGN.map(x => -x),
        true,
      ),
    )

    read.CPT = Math.max(
      read.CPT,
      phaseMismatch(
        pK,
        pK.map(x => -x),
        true,
      ),
      phaseMismatch(
        mK,
        mK.map(x => -x),
        true,
      ),
    )
  }

  const half = qw(1n, 0n, 2n)
  const Wrest: QWMatrix = Array.from({ length: 6 }, (_, i) =>
    Array.from({ length: 6 }, (_, j) => {
      // W = P+ (x) V + P- (x) 1 on span(1, vol) (x) flavor, P+- = (1/2) [[1, +-1], [+-1, 1]]
      const s = Math.floor(i / 3)
      const t = Math.floor(j / 3)
      const f = i % 3
      const g = j % 3
      const v = qwMul(half, (V[f] as QW[])[g]!)
      const one = f === g ? half : qw(0n, 0n)

      return s === t ? qwAdd(v, one) : qwSub(v, one)
    }),
  )
  const removable = qwMatEq(
    restToy(aPlus(V), D, QW_ONE),
    qwMatMul(qwMatMul(Wrest, restToy(D, D, QW_ONE)), qwDagger(Wrest)),
  )
  const B4 =
    unionGap <= BAND_TOLERANCE &&
    read.Pimp <= SYMMETRY_HOLDS &&
    read.Prot <= SYMMETRY_HOLDS &&
    read.Craw <= SYMMETRY_HOLDS &&
    read.CP <= SYMMETRY_HOLDS &&
    read.CPT <= SYMMETRY_HOLDS &&
    removable

  log('B4')

  // ---------------- G: C and CP together in the exact Dirac class ----------------
  // the class's covariant register operators are the null space of the bilinears and the rotations (A1); G asks for one
  // that does not commute with J: exists iff adding J to those conditions lowers the null space
  const nullWithJ =
    64 -
    rankExact(
      commutantRows(
        [...bilinears, ...rotations.map(g => g.register), J],
        4,
      ),
    )
  const G = nullWithJ < nullWithRotations

  // ---------------- D1: the coupling ----------------
  const vol24 = new Float64Array(192 * 192)

  for (let d = 0; d < 24; d++) {
    for (let e = 0; e < 24; e++) {
      vol24[(d * 8 + 7) * 192 + e * 8 + 7] = 1
    }
  }

  const volBlade = EVEN.map((_, i) =>
    EVEN.map((__, j) => (i === 7 && j === 7 ? 1 : 0)),
  )
  const D1 =
    group.every(g => commutesExactly(g, vol24)) &&
    !sameMatrix(matMul(vol24, P2), matMul(P2, vol24)) &&
    !bilinears.every(L => eqM(mm(volBlade, L), mm(L, volBlade)))

  function vol24Scaled(): Float64Array {
    const q = new Float64Array(192 * 192)

    for (let d = 0; d < 24; d++) {
      for (let e = 0; e < 24; e++) {
        q[(d * 8 + 7) * 192 + e * 8 + 7] = 1 / 24
      }
    }

    return q
  }

  // ---------------- D2: the phase is physical once coupled ----------------
  const uK = ringUnit(COUPLING[0], COUPLING[1])
  const qK = qwFromUnit(uK)

  const asymmetry = (W: QWMatrix, u: QW): QW[] => {
    const B = restToy(aPlus(W), D, u)
    const p = transition(B, 0, 1, plan.beats)
    const q = transition(B, 1, 0, plan.beats)

    return p.map((x, i) => qwSub(x, q[i]!))
  }

  const AV = asymmetry(V, qK)
  const AVbar = asymmetry(Vbar, qK)
  const AH = asymmetry(HOUSEHOLDER, qK)
  const AI = asymmetry(qwIdentity(3), qK)
  const Afree = asymmetry(V, QW_ONE)
  const zero = (xs: QW[]): boolean =>
    xs.every(x => x.a === 0n && x.b === 0n)
  const sixth: [bigint, bigint][] = [
    [1n, 0n],
    [1n, 1n],
    [0n, 1n],
    [-1n, 0n],
    [-1n, -1n],
    [0n, -1n],
  ]

  let rephased = true

  for (const a of sixth) {
    for (const b of sixth) {
      const Ar = asymmetry(rephase(V, a, b), qK)

      if (
        !Ar.every(
          (x, i) =>
            qwSub(x, AV[i]!).a === 0n && qwSub(x, AV[i]!).b === 0n,
        )
      ) {
        rephased = false
      }
    }
  }

  const D2 =
    AV.every(x => x.b === 0n) &&
    AV.some(x => x.a !== 0n) &&
    AVbar.every(
      (x, i) => qwAdd(x, AV[i]!).a === 0n && qwAdd(x, AV[i]!).b === 0n,
    ) &&
    zero(AH) &&
    zero(AI) &&
    zero(Afree) &&
    rephased

  log('D1 D2')

  // ---------------- instrument I1: the full cycle at rest ----------------
  const toy = rule(aPlus(V), D, unitValue(uK))
  const roots576 = FLAVOR_ROOTS(DOCK_ROOTS)
  const U0 = cycleMatrix(toy, roots576, [0, 0, 0, 0])
  const exactRest = transition(
    restToy(aPlus(V), D, qK),
    0,
    1,
    INSTRUMENT_BEATS,
  ).map(asFraction)
  const n = FLAVOR_MODES

  let xr = new Float64Array(n)
  let xi = new Float64Array(n)

  for (let d = 0; d < 24; d++) {
    xr[(d * 8 + 0) * 3 + 0] = 1 / Math.sqrt(48)
    xr[(d * 8 + 7) * 3 + 0] = -1 / Math.sqrt(48)
  }

  let instrumentGap = 0

  for (let t = 1; t <= INSTRUMENT_BEATS; t++) {
    const nr = new Float64Array(n)
    const ni = new Float64Array(n)

    for (let i = 0; i < n; i++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < n; k++) {
        const a = U0.re[i * n + k]!
        const b = U0.im[i * n + k]!

        sr += a * xr[k]! - b * xi[k]!
        si += a * xi[k]! + b * xr[k]!
      }

      nr[i] = sr
      ni[i] = si
    }

    xr = nr
    xi = ni

    let ar = 0
    let ai = 0

    for (let d = 0; d < 24; d++) {
      ar +=
        (xr[(d * 8 + 0) * 3 + 1]! - xr[(d * 8 + 7) * 3 + 1]!) /
        Math.sqrt(48)

      ai +=
        (xi[(d * 8 + 0) * 3 + 1]! - xi[(d * 8 + 7) * 3 + 1]!) /
        Math.sqrt(48)
    }

    instrumentGap = Math.max(
      instrumentGap,
      Math.abs(ar * ar + ai * ai - exactRest[t - 1]!),
    )
  }

  const I1 = instrumentGap <= INSTRUMENT_TOLERANCE

  log('I1')

  // ---------------- D3: the coupling's cost ----------------
  const cost = (Ps: CMatrix[]): { law: number; cpt: number } => {
    let law = 0
    let cpt = 0

    for (const K of weylMomenta(plan.toyMomenta)) {
      const ph = cyclePhases(Ps, roots576, K)
      const E = Ms.map(M => diracPhase(K, M))

      cpt = Math.max(
        cpt,
        phaseMismatch(
          ph,
          ph.map(x => -x),
          true,
        ),
      )

      law = Math.max(
        law,
        ...ph.map(x =>
          Math.min(
            Math.abs(wrap(x)),
            ...E.flatMap(e => [
              Math.abs(wrap(x - Math.PI - e)),
              Math.abs(wrap(x - Math.PI + e)),
            ]),
          ),
        ),
      )
    }

    return { law, cpt }
  }

  const freeCost = cost(free)
  const toyCost = cost(toy)
  const D3 =
    toyCost.law > COST &&
    toyCost.cpt > COST &&
    freeCost.law <= SYMMETRY_HOLDS &&
    freeCost.cpt <= SYMMETRY_HOLDS

  log('D3')

  // ---------------- controls ----------------
  const uP = unitValue(ringUnit(PLUS[0], PLUS[1]))
  const uM = unitValue(ringUnit(MINUS[0], MINUS[1]))
  const ctl = [
    flavorPiece([
      { q: qSp, F: scalar3(uP) },
      { q: qSm, F: scalar3(uM) },
    ]),
    flavorPiece([
      { q: qDp, F: scalar3(conj(uP)) },
      { q: qDm, F: scalar3(conj(uM)) },
    ]),
  ]
  const ref0258 = [
    chiralPiece(qSp, qSm, uP, uM),
    chiralPiece(qDp, qDm, conj(uP), conj(uM)),
  ]

  let C1 = true

  ctl.forEach((P, b) => {
    const R = ref0258[b]!

    for (let i = 0; i < 192; i++) {
      for (let j = 0; j < 192; j++) {
        for (let f = 0; f < 3; f++) {
          for (let g = 0; g < 3; g++) {
            const k = (i * 3 + f) * n + j * 3 + g

            if (
              f === g
                ? P.re[k] !== R.re[i * 192 + j] ||
                  P.im[k] !== R.im[i * 192 + j]
                : P.re[k] !== 0 || P.im[k] !== 0
            ) {
              C1 = false
            }
          }
        }
      }
    }
  })

  const C2 = detH.a === 0n && detH.b === 0n && zero(AH)
  const C3 = zero(AI)

  log('C')

  const hard = A1 && A2 && A3 && B1 && B2 && B3 && B4 && D1 && D2 && D3
  const controls = C1 && C2 && C3
  const status = hard && G && controls && I1 ? 'partial' : 'fail'
  const censusLine = (c: Census): string =>
    `B* ${c.Bstar.toFixed(9)} x${c.crossings}`
  const asymLine = (xs: QW[]): string =>
    xs.map(x => asFraction(x).toExponential(3)).join(' ')

  return verdict({
    status,
    claim: `A1 ${A1} (bilinear commutant null ${nullBilinears}, R(x) rank ${rightsRank}, all keep J ${rightsKeepJ}; with rotations null ${nullWithRotations}; rotations alone null ${nullRotations}, ${nullRotationsJ} of them keeping J) A2 ${A2} A3 ${A3} (det[H+, H-] = (${detV.a} + ${detV.b} w) / ${detV.d} = -2iJ prod^2); B1 ${B1} (leak ${leak.toExponential(2)}, block gap ${blockGap.toExponential(2)}) B2 ${B2} B3 ${B3} (${censuses.map(censusLine).join('; ')}; mixed ${mixed.map(x => `${x.i}${x.j} ${censusLine(x.c)}`).join('; ')}) B4 ${B4} (union ${unionGap.toExponential(2)}, P_imp ${read.Pimp.toExponential(2)}, CP ${read.CP.toExponential(2)}, CPT ${read.CPT.toExponential(2)}, removable at rest ${removable}); G ${G} (null with J ${nullWithJ}); D1 ${D1} D2 ${D2} (A(t) ${asymLine(AV)}) D3 ${D3} (toy law ${toyCost.law.toExponential(2)} CPT ${toyCost.cpt.toExponential(2)}, free ${freeCost.law.toExponential(2)}, ${freeCost.cpt.toExponential(2)}); instrument I1 ${I1} (${instrumentGap.toExponential(2)}); controls C1 ${C1} C2 ${C2} C3 ${C3}`,
    metrics: {
      A1: flag(A1),
      A2: flag(A2),
      A3: flag(A3),
      B1: flag(B1),
      B2: flag(B2),
      B3: flag(B3),
      B4: flag(B4),
      G: flag(G),
      D1: flag(D1),
      D2: flag(D2),
      D3: flag(D3),
      I1: flag(I1),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      nullBilinears,
      nullWithRotations,
      nullRotations,
      nullRotationsJ,
      leak,
      blockGap,
      bandGap,
      rGap,
      isotropy: iso,
      census0: censuses[0]!.Bstar,
      census1: censuses[1]!.Bstar,
      census2: censuses[2]!.Bstar,
      crossings:
        censuses.reduce((s, c) => s + c.crossings, 0) +
        mixed.reduce((s, x) => s + x.c.crossings, 0),
      unionGap,
      Pimp: read.Pimp,
      CP: read.CP,
      CPT: read.CPT,
      asymmetryLast: asFraction(AV[AV.length - 1]!),
      toyLaw: toyCost.law,
      toyCPT: toyCost.cpt,
      instrumentGap,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2), C3: flag(C3), I1: flag(I1) },
    notes: `L1 and L2. ${FLAVOR_MODES} modes a member. Masses ${masses.map(m => m.toFixed(6)).join(', ')} (ringUnit ${FLAVOR_UNITS.map(u => `(${u.join(', ')})`).join(', ')}); coupling ringUnit(${COUPLING.join(', ')}), angle ${unitAngle(uK).toFixed(6)}. Massless pairs ${pairs.map(x => `${x.size} c0/(c/4) ${(x.c0 / C_QUARTER).toFixed(12)} gamma ${(x.gamma / C_QUARTER).toExponential(2)}`).join('; ')}. R - tan m/m at most ${rGap.toExponential(2)}, isotropy ${iso.toExponential(2)}, band gap ${bandGap.toExponential(2)}. Census per flavor ${censuses.map((c, f) => `${censusLine(c)} (2M ${(2 * Ms[f]!).toFixed(9)})`).join('; ')}; mixed ${mixed.map(x => `${x.i}${x.j} ${censusLine(x.c)}`).join('; ')}. Free rule readings: P_imp ${read.Pimp.toExponential(2)}, P_rot ${read.Prot.toExponential(2)}, C raw ${read.Craw.toExponential(2)}, CP ${read.CP.toExponential(2)}, CPT ${read.CPT.toExponential(2)}. CP invariant det[H+, H-] (${detV.a} + ${detV.b} w) / ${detV.d}, prod^2 ${prod2.a} / ${prod2.d}; conj V (${detVbar.a} + ${detVbar.b} w); Householder ${detH.a}. Rest asymmetry A(t), t = 1 .. ${plan.beats}: trimaximal ${asymLine(AV)}; conj V ${asymLine(AVbar)}. Toy cost: Dirac law ${toyCost.law.toExponential(2)}, CPT ${toyCost.cpt.toExponential(2)}; free ${freeCost.law.toExponential(2)}, ${freeCost.cpt.toExponential(2)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
