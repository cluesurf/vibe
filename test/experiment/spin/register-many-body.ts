// THE MANY-BODY RULE WITH REGISTERS (E-SPN-0163; 0162 was taken first by spin/register-meson-hold, running alongside). E-SPN-0160 (the Clifford register), E-FRC-0258 (its two chiral halves)
// and E-FRC-0259 (three flavors) all end at one missing piece: the many-body rule with registers. It is the one place
// left for "K never fires" to have content under registers, for C and CP to break together (a two-body, flavor-diagonal
// transition turning a + member into a - member, the W boson's shape), for member number to change (the pair table),
// and for the mirror half to meet this one. This file writes that rule and decides those four questions exactly, on the
// few-body sectors that decide them.
//
// DERIVED BEFORE THE RUN (code/measure/register-many-body; the register rule, masses and mixing of E-SPN-0160, E-FRC-0258
// and E-FRC-0259; eps and frames as E-SPN-0160).
// 1. THE RULE IS GAUSSIAN (L1). Every piece of the register rule is ONE-BODY: the swap coin X, the mixers 1 + (u - 1) Q
//    on Q_S and Q_D, the chiral and flavor masses on Q P+-, the stream. A fermionic many-body rule that restricts to these
//    on one member, is multiplicative and blocks two members from one mode (Pauli) is exactly the second quantization
//    Gamma(P): on a k-member state <S'| Gamma(P) |S> = det P[S', S] (the exterior power; Gamma(AB) = Gamma(A) Gamma(B) is
//    Cauchy-Binet). E-SPN-0140's dock mixer M = 1 + (e^(i theta) - 1) N_U is the rank-one case, Gamma(1 + (e^(i theta) -
//    1) |U><U|) = 1 + (e^(i theta) - 1) N_U, since N_U has eigenvalues 0 and 1 for a rank-one projector. (For a projector
//    of rank r > 1 the two differ: Gamma gives u^(N_Q), not 1 + (u - 1) N_Q, and only Gamma is multiplicative.)
// 2. THE VACUUM (L1). The full sea is the top block of every dock: Gamma(P) acts there as det P. det X = +1 (the slot
//    reversal is 12 swaps of 8-mode blocks, 96 transpositions), det(1 + (u - 1) Q) = u^(tr Q) for a projector, tr Q_S =
//    tr Q_D = 8, so beat 1 multiplies the sea by u^(8 cells) and beat 2 by conj(u)^(8 cells): ONE branch, a unit
//    amplitude every beat, exactly 1 every cycle (u^8 conj(u)^8 = 1, E-SPN-0160 F2). The stream moves each (slot,
//    register) mode along its root, 8 identical copies of the slot stream, so its parity is (parity)^8 = +1 on any box.
//    Every slot holds 8 at every beat: no charge moves and K's trigger (a single-occupancy slot, a fear, a store,
//    E-SPN-0130) never appears. K ITSELF: it is defined on one vibe a slot and permutes slot contents; with registers the
//    natural lift permutes whole member states (slot and register together, as the flavor rides along), which is
//    covariant because W(F4) acts on both. On the full sea (occupancy 8 everywhere) and on one hole (occupancies 8 and 7,
//    never 1) that trigger is absent, so the lifted K never fires on either. The register rule as written holds no K.
// 3. ONE HOLE IS THE MEMBER (L1 for the propagator, L2 for the band). By Jacobi, the one-hole block of Gamma(U) is
//    <full \ j| Gamma(U) |full \ i> = (-1)^(i+j) det U conj(U_ji): the hole moves by det(U) Z conj(U) Z. Per cycle det is 1,
//    and conj(U(K)) = U_conj(-K), so the hole band at K is minus the member's at -K: {pi -+ E(K), 0} = the member's own set
//    (E is even in K, the flats sit at 0). So the hole has E-SPN-0160's band exactly: c / 4, gamma = 0, R = tan m / m.
// 4. THE TWO-BODY VERTEX (L1).
//    (a) NO DIRAC-CLASS PIECE OF ANY ORDER CHANGES A MEMBER'S CHIRALITY. The commutant of the left multiplications
//        L(Cl+) on one member is R(Cl+) (E-FRC-0259 A1), and for the algebra L (x) L on two members it is R (x) R (the
//        commutant of a tensor product of algebras is the tensor product of commutants), and so on for n. Every R(x)
//        commutes with J = R(vol) because vol is central in Cl+. So a piece of ANY order that keeps each member's Dirac
//        generators keeps each member's half. A chirality-changing piece must act on the members' Dirac content, which a
//        CONTACT vertex (acting only when two members meet) may do without touching the free band.
//    (b) THE VERTEX. The register exchange O (swap two members' registers, keep their flavors) commutes with g (x) g for
//        every g in W(F4) (it is the tensor swap) and with J (x) J, and not with J (x) 1: it turns a pair (+, -) into
//        (-, +), flavor-diagonal, the W boson's shape without a W. H' = sum over pairs (1 - swap) = N (N - 1) / 2 - O is
//        integer valued (for a two-valued register with spin S, H' = N (N - 1) / 2 - S (S + 1) - N (N - 4) / 4), so the
//        vertex v^H' is an exact unit phase for a ring unit v. It is real and symmetric in the register basis (T-even) and
//        commutes with every g (x) g, reflections included (P-even).
//    (c) THE PHASE BECOMES PHYSICAL. On two members at rest in E-FRC-0259's singlet scalar pair (blades 1, vol) x 3
//        flavors (6 modes, 64 Fock states), with the free beat Gamma(b), b = restToy(V D V^dag, D, 1) (no one-body
//        coupling at all), and the palindromic step U = v^H' Gamma(b) v^H': the basis change W = P+ (x) V + P- (x) 1 that
//        removed V (E-FRC-0259 point 2) no longer commutes with the vertex, since the vertex maps + to - with the flavor
//        kept; the only rephasing left is the same diagonal phase on both halves, under which V is defined up to its
//        rows. The observable Q(alpha -> beta) = (1/3) sum_gamma sum_gamma' P(|-alpha, +gamma> -> |-beta, +gamma'>) (a -
//        member of flavor alpha found as beta, the + partner traced) is invariant under every symmetry left, and exactly
//        rational. With b symmetric for a real V, v^H' real symmetric and the step a palindrome, U^T = U(conj V), so
//        A_T = Q(0 -> 1) - Q(1 -> 0) = Q_V(0 -> 1) - Q_conj V(0 -> 1): it is odd under V -> conj(V), zero for a real
//        mixing, zero for V = 1, and zero with no vertex (v = 1, where the - member cannot change flavor: A- = D is
//        diagonal and nothing converts it). PREDICTED: A_T nonzero, exact, as stated, and unchanged by 36 rephasings.
// 5. C AND CP DO NOT BREAK TOGETHER WITH THIS VERTEX (L1). Charge conjugation is particle-hole, Xi (c <-> c^dag, the
//    empty state to the full one). Xi Gamma(b) Xi^-1 = det(b) Gamma(conj b) (Gamma of the conjugate, a phase), and
//    normal ordering (1/2) sum c_tf c_sg c^dag_tg c^dag_sf gives Xi O Xi^-1 = O + 3 - N, so Xi H' Xi^-1 = H' + 12 - 4 N:
//    a constant on every member-number sector. The vertex is C-even, as every one-body piece is (E-FRC-0258 read C held
//    for the chiral mass). So C is kept and the vertex breaks CP only (through the physical trimaximal phase): C AND CP
//    STILL DO NOT BREAK TOGETHER. The least C-odd vertex must distinguish particles from holes, love from fear: a phase
//    on love-love meetings with the inverse phase on fear-fear ones, which needs the tones in the many-body register
//    rule, not written here (the rest toy has one tone).
// 6. NUMBER CAN MOVE BETWEEN THE HALVES (L1). The pair table turns an empty line into a love-fear pair (charge 0,
//    E-RLT-0103). Lifted to registers, the pair's register state must be invariant. By characters of the 576 rotations
//    on H+ and H- (4 dimensions each), the invariant pair states number 2 in H+ (x) H+, 2 in H- (x) H-, and 1 in
//    H+ (x) H-: psi = e_1 (x) e_1 - e_vol (x) e_vol = e+ (x) e- + e- (x) e+ (e+- = (1 +- vol) / sqrt 2, J e+- = +- e+-),
//    which every g in W(F4) keeps (g e_vol = det(g) e_vol). So a covariant, P-even, real (T-even) pair table CAN make
//    one + member and one - member: in each branch our half's member number moves by +-1 and the mirror's by -+1, total
//    kept. The two branches weigh 1/2 each while C holds (psi is C-even and P-even), so the net transfer is zero until C
//    and CP break together (point 5): the same missing piece.
// 7. WHAT THE FULL RUN WOULD NEED. Two members with momentum (192^2 = 36,864 register pair modes a site), the tones (love
//    and fear) carried with the registers so that C can be read as love <-> fear, the lifted K on meetings, and a box
//    large enough to read the pair table's transfer against the stream. None of it changes points 1 to 6, which are
//    statements about pieces, and each is decided on the exact sectors below.
//
// PREDICTED VERDICT: PARTIAL. R, V, H, W and N hold; G (C and CP together) FAILS, as derived: the vertex exists, is exact,
// covariant, CPT-safe and makes the trimaximal phase physical, but it is C-even.
//
// GATES, fixed before the gate run.
//  R THE RULE IS GAUSSIAN, EXACT (8-mode register Fock space, A = 1 + (u - 1) P+ at the light unit, B a rotation's register
//    action with half-integer entries): Gamma(AB) = Gamma(A) Gamma(B) on every member-number block; Gamma(A) unitary; the
//    8-member block equals det(AB); the 7-member block equals (-1)^(i+j) det(AB) conj((AB)_ji). And the rank-one case: on 6
//    modes Gamma(1 + (l - 1) P) = 1 + (l - 1) N_P for P = |z><z| / 6, z uniform, l the light unit, exactly.
//  V THE VACUUM, EXACT: X on 192 modes even (96 transpositions); 24 Q_S and 48 Q_D idempotent with traces 8 and 8;
//    u^8 conj(u)^8 = 1 at the light unit, pi/6 and u = -1; so per beat one branch with the unit amplitude u^(8 cells) or
//    conj(u)^(8 cells), and 1 per cycle.
//  H ONE HOLE IS THE MEMBER: at 64 Weyl momenta the conjugated cycle's sorted phases equal the member's to 1e-12; the
//    massless twin's hole pairs have 16 states, c0 / (c / 4) within 1e-9 of 1 and |gamma| / c0 <= 1e-9 along three
//    directions; R read from the hole spectrum (the member's frame) equals tan m / m to 1e-9 along three directions.
//  W THE VERTEX: (a) exact on the 64-dimensional register pair space: the swap commutes with g (x) g for all 1,152 g and
//    with J (x) J, and not with J (x) 1; the eight R(x) commute with J. (b) exact on the 6-mode rest Fock space: prod over
//    l in {0, 2, 3, 4, 6, 8, 12} of (H' - l) = 0, v^H' unitary, v = ringUnit(2, 0). (c) exact: A_T(t), t = 1 .. 12, real
//    rational and nonzero for some t; conj(V) gives -A_T(t) at every t; Householder, V = 1 and v = 1 give 0 at every t;
//    all 36 rephasings (row 0 and column 0 of V by sixth roots) give A_T(t) exactly; and Gamma(W) does not commute with
//    the vertex.
//  G C AND CP TOGETHER: the vertex is C-odd (Xi H' Xi^-1 - H' not constant on some member-number sector). PREDICTED FAIL:
//    Xi H' Xi^-1 = H' + 12 - 4 N exactly.
//  N NUMBER BETWEEN THE HALVES, EXACT: the rotation characters give 2, 2 and 1 invariants in H+ (x) H+, H- (x) H- and
//    H+ (x) H-, and W(F4) 3 in the whole pair space; psi = e_1 (x) e_1 - e_vol (x) e_vol is invariant under all 1,152;
//    (P+ (x) P+) psi = (P- (x) P-) psi = 0; on the pair line (a love on one slot, a fear on the opposite, the pair
//    table's support, the smallest box it acts on) the lifted pair reads (love +, fear -) and (love -, fear +) with
//    weight 1/2 each and (+, +), (-, -) with 0, exactly.
// INSTRUMENT (a failure makes the verdict partial at best). I1 Xi Gamma(b) Xi^-1 = det(b) Gamma(conj b) exactly on the 64
//  Fock states; I2 the one-member block of Gamma(b) equals b exactly; I3 the particle-hole map is an involution up to sign
//  and preserves the number operator's complement (Xi N Xi^-1 = 6 - N).
// CONTROLS (a failure makes the verdict partial at best). C1 E-SPN-0160: the register schedule at the light unit has rest
//  multiplets 8 + 8 + 176, as its F1 (b). C2 E-SPN-0140: the flat side-4 love sea under its dock mixer and the coin stays
//  one branch equal to its start with a unit amplitude for 16 beats, as its D1. C3 E-FRC-0259: det[H+, H-] equals its
//  recorded (-959078961 - 1918157922 w) / 1276676260761792016 exactly, and restToy(V D V^dag, D, 1) = W restToy(D, D,
//  1) W^dag exactly (its removability).
// READ, gating nothing: A_T(t) for the one-sided step, the H' spectrum per sector, Q(0 -> 1) itself.
// Verdict: fail if R, V, H, W or N fails; partial if all hold and G fails (predicted), or if the instrument or a control
// fails; pass if all hold with G.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/mbr-probe1.log: H' eigenvalues {0, 2, 3, 4, 6, 8,
//  12}; Xi H' Xi^-1 - H' = 12 - 4 N exactly; the vertex (angle 1.333893) unitary; A_T for the one-sided step (0, -2.8e-4,
//  ... -5.2e-2) and the palindrome (-2.8e-4, -1.5e-3, ... -3.0e-2), each the exact negative for conj(V), zero (to float
//  summation) for Householder and exactly zero for V = 1 and v = 1; the palindrome's A_T unchanged by 36 rephasings;
//  Xi Gamma(b) Xi^-1 = det(b) Gamma(conj b); Cauchy-Binet, unitarity, the full block and one-hole Jacobi on 8 modes; the
//  characters 2, 2, 1 (rotations) and 3 (W(F4)). The probe summed probabilities in floats; the gate sums them exactly.
//  tmp/mbr-probe2.log: the hole cycle's sorted phases equal the member's to 1.8e-15 at 16 momenta; the hole's massless
//  pairs 16 at c / 4 (to 8e-12) with |gamma| / c0 <= 2.7e-11; X 96 transpositions; R read with a hole frame at -theta
//  tracked the wrong band (R - tan m / m = -1.01), which fixed the gate's reading to the member's frame (the hole's
//  spectrum IS the member's set, point 3). tmp/mbr-smoke.log: every code path on a small plan (4 momenta, 4 beats, 2 sea
//  beats), 11 s: every gate as predicted, G false (C-even), verdict partial; exact A_T(1) = -3047158125 / 10851569165584.
//
// FIRST RUN (tmp/mbr-exp-run1.log, 30 s): PARTIAL, as predicted. R, V, H, W and N hold, the instrument and all three
//  controls hold, and G fails (the vertex is C-even). No gate moved and none was rerun.
//  - R: Cauchy-Binet, unitarity, the full block det(AB) and the one-hole Jacobi identity exact on all 256 register Fock
//    states; Gamma of the rank-one mixer equals E-SPN-0140's 1 + (l - 1) N_P exactly.
//  - V: X 96 transpositions (even), 24 Q_S and 48 Q_D exact projectors of trace 8, u^8 conj(u)^8 = 1 at three units.
//  - H: the hole cycle's phases equal the member's to 1.8e-15 at 64 momenta; hole pairs of 16 at c / 4 to 8e-12, gamma /
//    c0 at most 2.6e-11; R - tan m / m 8.2e-12, 8.0e-12, 2.3e-12.
//  - W: the swap covariant under all 1,152, keeping J (x) J and moving J (x) 1, the eight R(x) keeping J; H' in {0, 2,
//    3, 4, 6, 8, 12}, v^H' unitary; A_T(t) = -2.8080e-4, -1.4551e-3, -2.0637e-3, -7.3595e-4, -1.5061e-4, -5.2174e-3,
//    -1.5571e-2, -2.2396e-2, -1.7206e-2, -5.0487e-3, -4.7397e-3, -2.9995e-2 (exact rationals, A_T(1) = -3047158125 /
//    10851569165584), the exact negatives for conj(V), exactly 0 for Householder, V = 1 and v = 1, unchanged under 36
//    rephasings; Gamma(W) moves the vertex.
//  - G: Xi H' Xi^-1 = H' + 12 - 4 N exactly, constant on every member-number sector: C-even, so G fails.
//  - N: invariants 2, 2, 1 (rotations) and 3 (W(F4)); psi invariant under all 1,152; weights (+, +) 0, (-, -) 0, (+, -)
//    1/2, (-, +) 1/2.
//  - C1 multiplets 8 + 8 + 176; C2 the side-4 love sea one branch, unit amplitude, 16 beats; C3 E-FRC-0259's CP invariant
//    and removability exact.
// NEXT. (1) A C-ODD vertex: the tones (love, fear) carried with the registers in the many-body rule, and a meeting phase
//  that differs between love-love and fear-fear pairs (the particle-hole image of this vertex is itself, point 5, so C
//  needs a piece that tells a particle from a hole). With it, C and CP break together, and the pair table's two branches
//  (point 6) stop weighing 1/2 each: that is the model's route to an asymmetry. (2) The two-member rule with momentum
//  (point 7), to read the vertex against the moving band and the flats. (3) The lifted K on meetings.
//
// Depth L1 (the second quantization, the vacuum, the one-hole propagator, the commutant, the vertex's integer spectrum
// and its particle-hole image, the characters: exact algebra) and L2 (the hole band read off the register cycle).
// DETERMINISM: no random numbers; Weyl momenta and fixed directions. NOTHING MOVES: every piece hands values between the
// modes of one dock, the stream takes each mode's value one dock along, and the vertex exchanges register content
// between two members that meet.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  dockMixBranch,
  wrap,
  type CMatrix,
} from '@/code/measure/dock-mixer'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import {
  cycleMultiplets,
  cyclePhases,
  eisConj,
  eisMul,
  eisPow,
  type Eis,
} from '@/code/measure/swap-cone'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { type RingUnit } from '@/code/rule/swap-mixer'
import { restFrame } from '@/code/measure/two-beat'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { seaConfiguration } from '@/code/measure/pauli-mixer'
import { flatLinks, tablesOn } from '@/code/measure/link-holonomy'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import {
  lockedState,
  mergeBranches,
  norm,
  sameConfiguration,
  type Branch,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  cycleMasslessPairN,
  EVEN,
  f4Group,
  frameRN,
  matMul,
  partnerProjector48,
  REGISTER_ROOTS,
  registerPiece,
  sameMatrix,
  scaled,
  singletProjector24,
  trace,
} from '@/code/measure/spinor-register'
import {
  det4,
  trimaximal,
  volumeRight,
} from '@/code/measure/chiral-register'
import {
  HOUSEHOLDER,
  qw,
  qwAdd,
  qwConj,
  qwDagger,
  qwDet3,
  qwDiag,
  qwFromEisQMatrix,
  qwFromUnit,
  qwIsZero,
  qwMatMul,
  qwMul,
  qwSub,
  rephase,
  restToy,
  rightMultiplication,
  QW_ONE,
  QW_ZERO,
  type QW,
  type QWMatrix,
} from '@/code/measure/flavor-register'
import {
  applyBlock,
  chiralPair,
  exchangeCount,
  fockGamma,
  fockGammaBlock,
  fockOperator,
  fockStates,
  numberOperator,
  overlap,
  particleHole,
  qwAbs2,
  qwDaggerSq,
  qwDet,
  qwFromNumbers,
  qwIdentityOf,
  qwMatEqual,
  qwMatMulSq,
  qwMatSub,
  qwNeg,
  qwScalar,
  unitPower,
} from '@/code/measure/register-many-body'

const C_QUARTER = Math.SQRT2 / 4
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const DIRS: readonly number[][] = [
  [1, 0, 0, 0],
  [s2, s2, 0, 0],
  [s3, s3, s3, 0],
]
const SCALES: readonly number[] = [0.1, 0.2, 0.3, 0.4, 0.5]
const LIGHT: readonly [number, number] = [-1, 4]
const SIXTH: readonly [number, number] = [0, 4]
const MASSLESS: readonly [number, number] = [0, 3]
const VERTEX: readonly [number, number] = [2, 0]
const FLAVOR_UNITS: readonly (readonly [number, number])[] = [
  [2, 2],
  [-1, 4],
  [-4, 0],
]
const H_VALUES: readonly number[] = [0, 2, 3, 4, 6, 8, 12]
const SIXTH_ROOTS: readonly Eis[] = [
  [1n, 0n],
  [1n, 1n],
  [0n, 1n],
  [-1n, 0n],
  [-1n, -1n],
  [0n, -1n],
]
const RECORDED_CP = qw(-959078961n, -1918157922n, 1276676260761792016n)
const BAND_TOLERANCE = 1e-12
const GAMMA_TOLERANCE = 1e-9
const R_EXACT = 1e-9
const FLAT_TOLERANCE = 1e-8

export type ManyBodyPlan = {
  momenta: number
  beats: number
  seaBeats: number
}

export const GATE_PLAN: ManyBodyPlan = {
  momenta: 64,
  beats: 12,
  seaBeats: 16,
}

const flag = (b: boolean): number => (b ? 1 : 0)

const unitValue = (u: RingUnit): [number, number] => {
  const t = unitAngle(u)

  return [Math.cos(t), Math.sin(t)]
}

const conjPiece = (P: CMatrix): CMatrix => ({
  re: P.re,
  im: P.im.map(x => -x),
})
const asNumber = (x: QW): number => Number(x.a) / Number(x.d)

export default experiment({
  id: 'spin/register-many-body',
  code: 'E-SPN-0163',
  title:
    "the many-body rule with registers is Gaussian, keeps the full sea exactly and makes one hole a member, and a covariant two-body vertex makes the trimaximal phase physical and lets number move between the halves, partial (C and CP still do not break together): every piece of the register rule is one-body, so the fermionic rule is its second quantization (minors, Cauchy-Binet, exact on the register Fock space), the full sea stays one branch with a unit amplitude every beat and exactly 1 per cycle (det X = +1, u^8 conj(u)^8 = 1), and by Jacobi one hole moves with the member's own band (c/4, gamma = 0, R = tan m/m); no Dirac-class piece of any order changes a member's chirality (the commutant R (x) R commutes with J), but a contact vertex, the register exchange (covariant under all 1,152, exact, integer-valued, T-even and P-even), turns a (+, -) pair into (-, +) flavor-diagonally and makes the trimaximal phase physical (an exact T-odd asymmetry, odd in V, zero for real mixing, rephasing invariant); it is C-even (particle-hole maps it to itself up to 12 - 4N), so C is kept; and a covariant pair table can make one + member and one - member (the rotations keep exactly one pair state in H+ (x) H-), moving number between the halves with no net direction while C holds",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return registerManyBodyRun(GATE_PLAN)
  },
})

export function registerManyBodyRun(plan: ManyBodyPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const group = f4Group()
  const rotations = group.filter(g => det4(g.matrix) === 1)
  const J = volumeRight()
  const Pplus = J.map((r, i) =>
    r.map((x, j) => (x + (i === j ? 1 : 0)) / 2),
  )
  const Pminus = J.map((r, i) =>
    r.map((x, j) => (-x + (i === j ? 1 : 0)) / 2),
  )
  const uL = ringUnit(LIGHT[0], LIGHT[1])
  const qL = qwFromUnit(uL)

  // ---------------- R: the rule is Gaussian ----------------
  const A = qwFromNumbers(Pplus).map((r, i) =>
    r.map((x, j) =>
      qwAdd(i === j ? QW_ONE : QW_ZERO, qwMul(qwSub(qL, QW_ONE), x)),
    ),
  )
  const halfRotation = rotations.find(g =>
    g.register.some(r => r.some(x => Math.abs(x) === 0.5)),
  )!
  const B = qwFromNumbers(halfRotation.register)
  const AB = qwMatMulSq(A, B)

  let cauchyBinet = true
  let unitary = true

  for (let k = 0; k <= 8; k++) {
    const GA = fockGammaBlock(A, k)
    const GB = fockGammaBlock(B, k)

    if (!qwMatEqual(qwMatMulSq(GA, GB), fockGammaBlock(AB, k))) {
      cauchyBinet = false
    }

    if (
      !qwMatEqual(
        qwMatMulSq(GA, qwDaggerSq(GA)),
        qwIdentityOf(GA.length),
      )
    ) {
      unitary = false
    }
  }

  const detAB = qwDet(AB)
  const fullIsDet = qwMatEqual(fockGammaBlock(AB, 8), [[detAB]])
  const holes7 = fockStates(8, 7)
  const G7 = fockGammaBlock(AB, 7)

  let jacobi = true

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const from = holes7.indexOf(255 ^ (1 << i))
      const to = holes7.indexOf(255 ^ (1 << j))
      const want = qwMul(detAB, qwConj((AB[j] as QW[])[i]!))
      const signed = (i + j) % 2 === 0 ? want : qwNeg(want)

      if (!qwIsZero(qwSub((G7[to] as QW[])[from]!, signed))) {
        jacobi = false
      }
    }
  }

  // the rank-one case on 6 modes: Gamma(1 + (l - 1) P) = 1 + (l - 1) N_P, P = |z><z| / 6
  const sixth = qw(1n, 0n, 6n)
  const P1: QWMatrix = Array.from({ length: 6 }, () =>
    Array.from({ length: 6 }, () => sixth),
  )
  const rankOne = P1.map((r, i) =>
    r.map((x, j) =>
      qwAdd(i === j ? QW_ONE : QW_ZERO, qwMul(qwSub(qL, QW_ONE), x)),
    ),
  )
  const NP = fockOperator(
    6,
    Array.from({ length: 36 }, (_, k) => ({
      coef: sixth,
      ops: [
        { dag: true, mode: Math.floor(k / 6) },
        { dag: false, mode: k % 6 },
      ],
    })),
  )
  const rankOneOk = qwMatEqual(
    fockGamma(rankOne),
    qwIdentityOf(64).map((r, i) =>
      r.map((x, j) =>
        qwAdd(x, qwMul(qwSub(qL, QW_ONE), (NP[i] as QW[])[j]!)),
      ),
    ),
  )
  const R = cauchyBinet && unitary && fullIsDet && jacobi && rankOneOk

  log('R')

  // ---------------- V: the vacuum ----------------
  const perm = Array.from(
    { length: 192 },
    (_, i) => OPPOSITE[Math.floor(i / 8)]! * 8 + (i % 8),
  )
  const seen = new Uint8Array(192)

  let transpositions = 0

  for (let i = 0; i < 192; i++) {
    let j = i
    let len = 0

    while (!seen[j]) {
      seen[j] = 1
      j = perm[j]!
      len++
    }

    if (len > 0) {
      transpositions += len - 1
    }
  }

  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const projectorsOk =
    sameMatrix(
      matMul(S24, S24),
      S24.map(x => 24 * x),
    ) &&
    sameMatrix(
      matMul(D48, D48),
      D48.map(x => 48 * x),
    ) &&
    trace(S24) / 24 === 8 &&
    trace(D48) / 48 === 8

  const cycleUnit = (u: RingUnit): boolean => {
    const num: Eis = [u.num[0], u.num[1]]
    const p = eisMul(eisPow(num, 8), eisPow(eisConj(num), 8))

    return p[0] === u.den ** 16n && p[1] === 0n
  }

  const unitsOk = [
    uL,
    ringUnit(SIXTH[0], SIXTH[1]),
    ringUnit(MASSLESS[0], MASSLESS[1]),
  ].every(cycleUnit)
  const V = transpositions % 2 === 0 && projectorsOk && unitsOk

  log('V')

  // ---------------- H: one hole is the member ----------------
  const qS = scaled(S24, 24)
  const qD = scaled(D48, 48)
  const schedule = (u: [number, number]): CMatrix[] => [
    registerPiece(qS, u),
    registerPiece(qD, [u[0], -u[1]]),
  ]
  const PL = schedule(unitValue(uL))
  const HL = PL.map(conjPiece)

  let holeGap = 0

  for (const K of weylMomenta(plan.momenta)) {
    const a = cyclePhases(PL, REGISTER_ROOTS, K)
      .map(wrap)
      .sort((x, y) => x - y)
    const b = cyclePhases(HL, REGISTER_ROOTS, K)
      .map(wrap)
      .sort((x, y) => x - y)

    a.forEach(
      (x, i) =>
        (holeGap = Math.max(holeGap, Math.abs(wrap(x - b[i]!)))),
    )
  }

  const PZ = schedule(unitValue(ringUnit(MASSLESS[0], MASSLESS[1])))
  const holePairs = DIRS.map(u =>
    cycleMasslessPairN(
      PZ.map(conjPiece),
      Math.PI,
      u,
      0.01,
      REGISTER_ROOTS,
    ),
  )
  const thetaL = unitAngle(uL)
  const mL = wrap(thetaL - Math.PI) / 2
  const holeFits = DIRS.map(u =>
    frameRN(
      HL,
      restFrame(thetaL, -thetaL, 2 * mL),
      thetaL,
      u,
      C_QUARTER,
      SCALES,
      REGISTER_ROOTS,
    ),
  )
  const tanL = Math.tan(mL) / mL
  const H =
    holeGap <= BAND_TOLERANCE &&
    holePairs.every(
      p =>
        p.size === 16 &&
        Math.abs(p.c0 / C_QUARTER - 1) <= GAMMA_TOLERANCE &&
        Math.abs(p.gamma) / C_QUARTER <= GAMMA_TOLERANCE,
    ) &&
    holeFits.every(f => Math.abs(f.R - tanL) <= R_EXACT)

  log('H')

  // ---------------- W (a): the vertex on the register pair space ----------------
  const kron = (
    a: readonly (readonly number[])[],
    b: readonly (readonly number[])[],
  ): number[][] =>
    Array.from({ length: 64 }, (_, i) =>
      Array.from(
        { length: 64 },
        (_, j) =>
          (a[Math.floor(i / 8)] as number[])[Math.floor(j / 8)]! *
          (b[i % 8] as number[])[j % 8]!,
      ),
    )
  const swapThen = (M: number[][]): number[][] =>
    M.map((_, i) => M[(i % 8) * 8 + Math.floor(i / 8)]!)
  const thenSwap = (M: number[][]): number[][] =>
    M.map(r => r.map((_, j) => r[(j % 8) * 8 + Math.floor(j / 8)]!))
  const eq = (a: number[][], b: number[][]): boolean =>
    a.every((r, i) => r.every((x, j) => x === b[i]![j]))
  const I8 = J.map((r, i) => r.map((_, j) => (i === j ? 1 : 0)))
  const swapCovariant = group.every(g => {
    const gg = kron(g.register, g.register)

    return eq(swapThen(gg), thenSwap(gg))
  })
  const JJ = kron(J, J)
  const J1 = kron(J, I8)
  const swapKeepsJJ = eq(swapThen(JJ), thenSwap(JJ))
  const swapMovesJ1 = !eq(swapThen(J1), thenSwap(J1))
  const mm8 = (
    a: readonly (readonly number[])[],
    b: readonly (readonly number[])[],
  ): number[][] =>
    a.map(r =>
      (b[0] as number[]).map((_, j) =>
        r.reduce((s, x, k) => s + x * (b[k] as number[])[j]!, 0),
      ),
    )
  const rightsKeepJ = EVEN.map(rightMultiplication).every(Rx =>
    eq(mm8(Rx, J), mm8(J, Rx)),
  )
  const Wa = swapCovariant && swapKeepsJJ && swapMovesJ1 && rightsKeepJ

  log('W a')

  // ---------------- W (b), (c) and G: the rest pair toy ----------------
  const Hx = exchangeCount(2, 3)
  const vUnit = ringUnit(VERTEX[0], VERTEX[1])
  const vertex = unitPower(Hx, H_VALUES, qwFromUnit(vUnit))
  const vertexUnitary =
    vertex !== null &&
    qwMatEqual(
      qwMatMulSq(vertex.U, qwDaggerSq(vertex.U)),
      qwIdentityOf(64),
    )
  const units = FLAVOR_UNITS.map(([k, j]) => ringUnit(k, j))
  const Dm = qwDiag(units.map(qwFromUnit))
  const Vt = qwFromEisQMatrix(trimaximal())
  const aPlus = (W: QWMatrix): QWMatrix =>
    qwMatMul(qwMatMul(W, Dm), qwDagger(W))
  const two = fockStates(6, 2)

  const stepOf = (
    W: QWMatrix,
    v: QW,
    palindrome: boolean,
  ): QWMatrix => {
    const G = fockGamma(restToy(aPlus(W), Dm, QW_ONE))
    const Uv = (unitPower(Hx, H_VALUES, v) as { U: QWMatrix }).U

    return palindrome
      ? qwMatMulSq(qwMatMulSq(Uv, G), Uv)
      : qwMatMulSq(Uv, G)
  }

  // |amplitude|^2 / 16 (two unnormalized two-member states, norm^2 4 each), averaged over the 3 spectator flavors
  const perState = qw(1n, 0n, 48n)

  const Q = (
    U: QWMatrix,
    alpha: number,
    beta: number,
    beats: number,
  ): QW[] => {
    const out: QW[] = Array.from({ length: beats }, () => QW_ZERO)

    for (let g = 0; g < 3; g++) {
      let x = new Map<number, QW>()

      for (const [k, c] of chiralPair(-1, alpha, 1, g)) {
        x.set(k, qw(c, 0n))
      }

      for (let t = 0; t < beats; t++) {
        x = applyBlock(U, two, x)

        for (let g2 = 0; g2 < 3; g2++) {
          out[t] = qwAdd(
            out[t]!,
            qwMul(
              perState,
              qwAbs2(overlap(chiralPair(-1, beta, 1, g2), x)),
            ),
          )
        }
      }
    }

    return out
  }

  const asym = (U: QWMatrix, beats: number): QW[] => {
    const f = Q(U, 0, 1, beats)
    const b = Q(U, 1, 0, beats)

    return f.map((x, t) => qwSub(x, b[t]!))
  }

  const qv = qwFromUnit(vUnit)
  const AT = asym(stepOf(Vt, qv, true), plan.beats)
  const ATbar = asym(
    stepOf(
      Vt.map(r => r.map(qwConj)),
      qv,
      true,
    ),
    plan.beats,
  )
  const ATH = asym(stepOf(HOUSEHOLDER, qv, true), plan.beats)
  const AT1 = asym(stepOf(qwIdentityOf(3), qv, true), plan.beats)
  const ATv1 = asym(stepOf(Vt, QW_ONE, true), plan.beats)
  const ATone = asym(stepOf(Vt, qv, false), plan.beats)
  const real = AT.every(x => x.b === 0n)
  const nonzero = AT.some(x => !qwIsZero(x))
  const odd = AT.every((x, t) => qwIsZero(qwAdd(x, ATbar[t]!)))
  const zeros = [ATH, AT1, ATv1].every(a => a.every(qwIsZero))

  let rephased = true

  for (const a of SIXTH_ROOTS) {
    for (const b of SIXTH_ROOTS) {
      const A2 = asym(stepOf(rephase(Vt, a, b), qv, true), plan.beats)

      if (!A2.every((x, t) => qwIsZero(qwSub(x, AT[t]!)))) {
        rephased = false
      }
    }
  }

  const half = qw(1n, 0n, 2n)
  const Wrest: QWMatrix = Array.from({ length: 6 }, (_, i) =>
    Array.from({ length: 6 }, (_, j) => {
      const same = Math.floor(i / 3) === Math.floor(j / 3)
      const v = qwMul(half, (Vt[i % 3] as QW[])[j % 3]!)
      const one = i % 3 === j % 3 ? half : QW_ZERO

      return same ? qwAdd(v, one) : qwSub(v, one)
    }),
  )
  const GW = fockGamma(Wrest)
  const wMovesVertex =
    vertex !== null &&
    !qwMatEqual(qwMatMulSq(GW, vertex.U), qwMatMulSq(vertex.U, GW))
  const Wb = vertex !== null && vertexUnitary
  const Wc = real && nonzero && odd && zeros && rephased && wMovesVertex
  const W = Wa && Wb && Wc

  log('W b c')

  const Xi = particleHole(6)
  const Nop = numberOperator(6)
  const XiH = qwMatMulSq(qwMatMulSq(Xi, Hx), qwDaggerSq(Xi))
  const shift = qwMatSub(XiH, Hx)
  const cEven = qwMatEqual(
    shift,
    Nop.map((r, i) =>
      r.map((x, j) => (i === j ? qw(12n - 4n * x.a, 0n) : QW_ZERO)),
    ),
  )
  const shiftConstantPerSector = [0, 1, 2, 3, 4, 5, 6].every(k => {
    const st = fockStates(6, k)
    const d0 = (shift[st[0]!] as QW[])[st[0]!]!

    return st.every(a =>
      st.every(b =>
        qwIsZero(qwSub((shift[a] as QW[])[b]!, a === b ? d0 : QW_ZERO)),
      ),
    )
  })
  const G = !shiftConstantPerSector

  log('G')

  // ---------------- N: number between the halves ----------------
  const tr = (m: readonly (readonly number[])[]): number =>
    m.reduce((s, r, i) => s + r[i]!, 0)

  let pp = 0
  let mmv = 0
  let pm = 0
  let all = 0

  for (const g of rotations) {
    const cp = tr(mm8(g.register, Pplus))
    const cm = tr(mm8(g.register, Pminus))

    pp += cp * cp
    mmv += cm * cm
    pm += cp * cm
  }

  for (const g of group) {
    all += tr(g.register) ** 2
  }

  const invariants = {
    pp: pp / rotations.length,
    mm: mmv / rotations.length,
    pm: pm / rotations.length,
    all: all / group.length,
  }
  const psi = Array.from({ length: 64 }, (_, k) =>
    k === 0 ? 1 : k === 63 ? -1 : 0,
  )
  const apply64 = (M: number[][], x: readonly number[]): number[] =>
    M.map(r => r.reduce((s, y, k) => s + y * x[k]!, 0))
  const psiInvariant = group.every(g =>
    apply64(kron(g.register, g.register), psi).every(
      (x, k) => x === psi[k],
    ),
  )
  const onPP = apply64(kron(Pplus, Pplus), psi)
  const onMM = apply64(kron(Pminus, Pminus), psi)
  const onPM = apply64(kron(Pplus, Pminus), psi)
  const onMP = apply64(kron(Pminus, Pplus), psi)
  const norm2 = (x: readonly number[]): number =>
    x.reduce((s, y) => s + y * y, 0)
  const weights = {
    pp: norm2(onPP) / norm2(psi),
    mm: norm2(onMM) / norm2(psi),
    pm: norm2(onPM) / norm2(psi),
    mp: norm2(onMP) / norm2(psi),
  }
  const N =
    invariants.pp === 2 &&
    invariants.mm === 2 &&
    invariants.pm === 1 &&
    invariants.all === 3 &&
    psiInvariant &&
    weights.pp === 0 &&
    weights.mm === 0 &&
    weights.pm === 0.5 &&
    weights.mp === 0.5

  log('N')

  // ---------------- instrument ----------------
  const b = restToy(aPlus(Vt), Dm, QW_ONE)
  const Gb = fockGamma(b)
  const I1 = qwMatEqual(
    qwMatMulSq(qwMatMulSq(Xi, Gb), qwDaggerSq(Xi)),
    qwScalar(fockGamma(b.map(r => r.map(qwConj))), qwDet(b)),
  )
  const one = fockStates(6, 1)
  const I2 = one.every((to, i) =>
    one.every((from, j) =>
      qwIsZero(qwSub((Gb[to] as QW[])[from]!, (b[i] as QW[])[j]!)),
    ),
  )
  const XiN = qwMatMulSq(qwMatMulSq(Xi, Nop), qwDaggerSq(Xi))
  const I3 =
    qwMatEqual(
      qwMatMulSq(Xi, Xi).map(r => r.map(x => qwMul(x, x))),
      qwIdentityOf(64),
    ) &&
    qwMatEqual(
      XiN,
      Nop.map((r, i) =>
        r.map((x, j) => (i === j ? qw(6n - x.a, 0n) : QW_ZERO)),
      ),
    )
  const instrument = I1 && I2 && I3

  log('instrument')

  // ---------------- controls ----------------
  const multiplets = cycleMultiplets(PL, REGISTER_ROOTS)
  const at0 = (phase: number): number =>
    multiplets
      .filter(x => Math.abs(wrap(x.center - phase)) <= FLAT_TOLERANCE)
      .reduce((s, x) => s + x.size, 0)
  const C1 =
    multiplets.length === 3 &&
    at0(thetaL) === 8 &&
    at0(-thetaL) === 8 &&
    at0(0) === 176
  const X4 = centerOf(4)
  const fr = contactFresh(4, 'pass', X4)
  const flat = tablesOn(fr.weave, 'pass', flatLinks(fr.weave))
  const sea = seaConfiguration(fr.cells, 1)

  let st: LockedState = lockedState(sea)
  let seaExact = true

  for (let t = 0; t < plan.seaBeats; t++) {
    st = {
      branches: mergeBranches(
        st.branches.flatMap(br =>
          dockMixBranch(fr.cells, br, false, false),
        ),
      ),
    }
    st = coinedVetoBeat('none', flat, st, t)

    const br = st.branches[0]!

    if (
      st.branches.length !== 1 ||
      !sameConfiguration(br, sea) ||
      br.k !== 0 ||
      norm(br.a, br.b) !== 1n
    ) {
      seaExact = false
    }
  }

  const C2 = seaExact
  const herm = (M: QWMatrix): QWMatrix =>
    M.map((r, i) =>
      r.map((x, j) => {
        const s = qwAdd(x, qwConj((M[j] as QW[])[i]!))

        return qw(s.a, s.b, s.d * 2n)
      }),
    )

  const comm = (X: QWMatrix, Y: QWMatrix): QWMatrix => {
    const p = qwMatMul(X, Y)
    const q = qwMatMul(Y, X)

    return p.map((r, i) =>
      r.map((x, j) => qwSub(x, (q[i] as QW[])[j]!)),
    )
  }

  const cpInvariant = qwDet3(comm(herm(aPlus(Vt)), herm(Dm)))
  const removable = qwMatEqual(
    restToy(aPlus(Vt), Dm, QW_ONE),
    qwMatMul(qwMatMul(Wrest, restToy(Dm, Dm, QW_ONE)), qwDagger(Wrest)),
  )
  const C3 = qwIsZero(qwSub(cpInvariant, RECORDED_CP)) && removable
  const controls = C1 && C2 && C3

  log('controls')

  // ---------------- verdict ----------------
  const hard = R && V && H && W && N
  const status = !hard
    ? 'fail'
    : !instrument || !controls
      ? 'partial'
      : G
        ? 'pass'
        : 'partial'
  const line = (xs: readonly QW[]): string =>
    xs.map(x => asNumber(x).toExponential(4)).join(' ')
  const metrics: Record<string, number> = {
    R: flag(R),
    V: flag(V),
    H: flag(H),
    W: flag(W),
    Wa: flag(Wa),
    Wb: flag(Wb),
    Wc: flag(Wc),
    G: flag(G),
    N: flag(N),
    instrument: flag(instrument),
    C1: flag(C1),
    C2: flag(C2),
    C3: flag(C3),
    transpositions,
    holeGap,
    holeRgap: Math.max(...holeFits.map(f => Math.abs(f.R - tanL))),
    holeC0gap: Math.max(
      ...holePairs.map(p => Math.abs(p.c0 / C_QUARTER - 1)),
    ),
    holeGamma: Math.max(
      ...holePairs.map(p => Math.abs(p.gamma) / C_QUARTER),
    ),
    invariantsPP: invariants.pp,
    invariantsMM: invariants.mm,
    invariantsPM: invariants.pm,
    invariantsAll: invariants.all,
    vertexAngle: unitAngle(vUnit),
    seconds: (Date.now() - started) / 1000,
  }

  AT.forEach((x, t) => (metrics[`AT_${t + 1}`] = asNumber(x)))

  return verdict({
    status,
    claim: `R ${R} (Cauchy-Binet ${cauchyBinet}, unitary ${unitary}, full = det ${fullIsDet}, one-hole Jacobi ${jacobi}, rank one = E-SPN-0140's mixer ${rankOneOk}); V ${V} (X ${transpositions} transpositions, projectors exact ${projectorsOk}, u^8 conj(u)^8 = 1 ${unitsOk}); H ${H} (hole phases against the member's ${holeGap.toExponential(2)} at ${plan.momenta} momenta, hole pairs ${holePairs.map(p => `${p.size} c0/(c/4) ${(p.c0 / C_QUARTER).toFixed(12)}`).join(', ')}, R - tan m/m ${holeFits.map(f => (f.R - tanL).toExponential(2)).join(' ')}); W ${W} (a ${Wa}: swap covariant under 1,152 ${swapCovariant}, keeps J (x) J ${swapKeepsJJ}, moves J (x) 1 ${swapMovesJ1}, R(x) keep J ${rightsKeepJ}; b ${Wb}: H' in {${H_VALUES.join(', ')}}, vertex unitary ${vertexUnitary}; c ${Wc}: A_T ${line(AT)}, odd in V ${odd}, zero for Householder, V = 1 and v = 1 ${zeros}, 36 rephasings ${rephased}, Gamma(W) moves the vertex ${wMovesVertex}); G ${G} (Xi H' Xi^-1 = H' + 12 - 4N ${cEven}, constant per sector ${shiftConstantPerSector}: C-even); N ${N} (invariants ${invariants.pp}, ${invariants.mm}, ${invariants.pm}, all ${invariants.all}; psi invariant under 1,152 ${psiInvariant}; weights (+,+) ${weights.pp} (-,-) ${weights.mm} (+,-) ${weights.pm} (-,+) ${weights.mp}); instrument I1 ${I1} I2 ${I2} I3 ${I3}; controls C1 ${C1} C2 ${C2} C3 ${C3}`,
    metrics,
    control: {
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      instrument: flag(instrument),
    },
    notes: `L1 and L2. Vertex v = ringUnit(${VERTEX.join(', ')}), angle ${unitAngle(vUnit).toFixed(6)}; masses ${units.map(u => (wrap(unitAngle(u) - Math.PI) / 2).toFixed(6)).join(', ')}. A_T(t), t = 1 .. ${plan.beats}, palindrome: ${line(AT)}; conj V ${line(ATbar)}; one-sided (read) ${line(ATone)}. Exact A_T(1) = (${AT[0]!.a}) / ${AT[0]!.d}. Hole: phase gap ${holeGap.toExponential(2)}, pairs ${holePairs.map(p => `${p.size} gamma/c0 ${(p.gamma / C_QUARTER).toExponential(2)}`).join('; ')}, R - tan m/m ${holeFits.map(f => (f.R - tanL).toExponential(2)).join(' ')}. Characters: rotations (+,+) ${invariants.pp}, (-,-) ${invariants.mm}, (+,-) ${invariants.pm}; W(F4) ${invariants.all}. E-SPN-0140 sea ${plan.seaBeats} beats one branch ${seaExact}. E-FRC-0259 CP invariant (${cpInvariant.a} + ${cpInvariant.b} w) / ${cpInvariant.d}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
