// DOES THE CLIFFORD REGISTER GIVE THE MODEL CHIRALITY, AND WITH IT P AND CP VIOLATION? (E-FRC-0258). E-FRC-0248 found the
// working rule keeps C, P, CP and CPT exactly, and that the knit "holds no spin apart from its slot"; the ledger triage
// (E-QTM-0157's report) said CP violation needs a spin apart from the slot and an orientation in depth. E-SPN-0160 gave
// each member a register, Cl+(4) = wedge^0 + wedge^2 + wedge^4 = H + H: a spin apart from the slot, with two halves.
// This file derives what the two halves are, builds the least piece that acts on one of them, and reads C, P, CP and
// CPT on it, then asks what the Sakharov conditions still lack.
//
// DERIVED BEFORE THE RUN (code/measure/chiral-register, code/measure/spinor-register; eps as E-SPN-0160's).
// 1. THE TWO HALVES (L1). Right Clifford multiplication by vol = e0 e1 e2 e3, J w = w vol, is an involution on the even
//    forms (vol^2 = +1 in Euclidean 4d, trace 0: halves of 4 and 4) that commutes with every LEFT multiplication, so with
//    every gamma_i^T gamma_j (left multiplication by e_i e_j) and hence with both of E-SPN-0160's projectors Q_S = Pi1
//    (x) 1 and Q_D = sum f_i f_j^T (x) gamma_i^T gamma_j / 4. W(F4) acts on forms as algebra automorphisms (minors), so
//    g(w vol) = g(w) g(vol) = det(g) g(w) vol: g J = det(g) J g. The 576 rotations keep each half, the 576 reflections
//    swap them. E-SPN-0160's whole schedule therefore splits EXACTLY into two decoupled 96-mode sectors, each four copies
//    of its 2 x 2 walk and 88 flats: the halves are two species, each with its own full Clifford (Dirac) structure,
//    mirror images of each other. THEY ARE NOT THE TWO HELICITIES OF ONE PARTICLE: the moving block of one sector holds
//    both S and D, and a reflection maps a whole sector onto the other. So a piece on one half makes the mirror world
//    differ from this one, the shape of mirror-asymmetric species, not of V - A couplings.
// 2. WHICH SYMMETRY THE MODEL NEEDS (L1 for the counting, argued for the physics). Every earlier covariance check asks
//    for all of W(F4) (1,152). What the physics needs from it is isotropy and one speed, and those are read off the
//    Taylor coefficients of the bands, which are invariant polynomials of K. By Molien's formula W+(F4), the rotations,
//    has EXACTLY W(F4)'s invariants in every degree below 24 and one more at degree 24 (the product of the 24 reflecting
//    hyperplanes, the pseudo-invariant): so a W+-covariant rule is isotropic exactly as a W-covariant one through the
//    23rd order in K, and differs only in its sign under reflections. PREDICTED counts: W and W+ both 1, 0, 1, 0, 1, 0,
//    2, 0, 3 ... (degrees 0 .. 8) and first different at 24. WHICH REFLECTION IS THE HUSK'S PARITY. A husk mirror
//    reverses the three husk axes; its bulk lifts are -I (reversing depth too: a rotation, det +1, which acts on the
//    register as the identity) and the depth-keeping map (det -1, which swaps the halves). E-FRC-0248 could not tell
//    them apart ("the two lifts the husk cannot tell apart") because the working rule has no register. With a register
//    they differ. The true mesh has a cusp: depth points toward the husk, and reversing it maps the bulk to its outside,
//    so -I is not a symmetry of the mesh the husk is read from. So THE PHYSICAL PARITY IS THE DEPTH-KEEPING, IMPROPER
//    LIFT, and a piece covariant under the rotations only breaks it. (Argued: the flat D4 box used here has no cusp, and
//    this experiment reads both lifts rather than choosing between them.) THE FRAMES AS THREE GENERATIONS. The three
//    8-root cross-polytopes (the pair partitions 01|23, 02|13, 03|12) are the model's natural 3. A piece that told them
//    apart could be covariant only under their joint stabilizer (order 192), which has THREE quartic invariants against
//    W(F4)'s one: such a rule is anisotropic at fourth order, which E-SPN-0126 excludes by 17 orders of magnitude. So
//    the generations cannot be the frames. PREDICTED: the stabilizer has order 192 and 3 invariants of degree 4.
// 3. THE CHIRAL MASS. Beat 1 the mixer u+ on Q_S P+ and u- on Q_S P-, beat 2 conj(u+) on Q_D P+ and conj(u-) on Q_D P-,
//    each after the swap coin, P+- = (1 +- J) / 2. The four projectors are dyadic multiples of integer matrices, mutually
//    orthogonal, and covariant under every rotation; u+- are ring units, so the pieces are exact over Z[w][1/42]. By 1
//    each sector is E-SPN-0160's walk at its own mass: 4 up and 4 down on pi +- E(K; M_s) and 88 flats at phase 0, so
//    per sector gamma = 0, one light speed c / 4, R_s = tan m_s / m_s and isotropy, all as in E-SPN-0160, and its census
//    closes with B* = 2 M_s for m_s < pi / 6. Masses: m+ = 0.190126 (ringUnit(-1, 4), E-SPN-0160's light point) and m- =
//    0.143348 (ringUnit(2, 2), the lightest positive unit below it on the ring's list, tmp/chi-probe2.log).
// 4. THE MIXED PAIR. A composite with one member in each sector sits below the threshold M+ + M-. Its channels are one
//    band from each sector. S+ + S- is the continuum itself (distance at most 0). S+ + D- has distance M+ + M- - E+(q) +
//    E-(q). With cos E = cos M (1 - g^2) - g^2 at the same g, dE / dM = sin M (1 - g^2) / sin E, which is below 1 for g > 0
//    while E < pi / 2 (E > M there): so E+(q) - E-(q) is largest at rest, M+ - M-, and the distance is at least 2 M-.
//    S- + D+ and D + D lie further. The flats sit at eps pi: F + D- vanishes only if E- = pi - M+ - M-, above Smax for
//    light members; F + F sits M+ + M- below. PREDICTED: no crossing and B* = 2 min(M+, M-) = 2 M- exactly.
// 5. THE DISCRETE SYMMETRIES, SECTOR BY SECTOR (L2, read as spectra: a sector's number is conserved exactly by 1, so the
//    rule can be rephased sector by sector, e^(i theta+ N+ + i theta- N-), and a symmetry only has to hold up to such a
//    shift). Definitions: P_imp is the depth-keeping g = diag(-1, -1, -1, 1) (improper: sector + at K to sector - at gK);
//    P_rot is -I (proper: each sector at K to itself at -K); C is the antiunitary particle-hole map in the real basis
//    every structure constant is written in (it keeps each sector, since J is real: phases at K to minus the phases at
//    -K); T keeps each sector with K to -K; CPT with P_rot maps phases at K to minus themselves. Every sector's spectrum
//    is symmetric about pi (E-SPN-0160 point 5), and E_M(gK) = E_M(K) (s(K) is W(F4)-covariant). PREDICTED for the
//    chiral mass: P_imp FAILS (sector + at K against sector - at gK differ by E+ - E-, at least 0.001 somewhere); P_rot
//    HOLDS; C HOLDS (raw, since the midpoint is pi); CP = C P_imp FAILS (it maps + onto - with the mass difference in
//    between); CPT with P_rot HOLDS. For the CHIRAL PHASE (a register phase v = ringUnit(1, 0) on P+ only, equal masses):
//    P_imp and C FAIL raw and HOLD rephased, since a phase on a conserved sector is a uniform shift of its spectrum: the
//    one-generation rephasing theorem, in this model.
// 6. WHAT THIS GIVES AND WHAT IT CANNOT (the reason for the verdict). The chiral mass breaks P and CP and keeps C. CP
//    violation WITH C kept makes no matter-antimatter asymmetry: a sector's particle and its antiparticle (the C image,
//    in the same sector) behave identically. The Sakharov asymmetry needs C and CP broken together by a phase no
//    rephasing removes, and with conserved sector numbers every sector phase is removable (point 5). A removable-proof
//    phase needs a closed loop of transitions between at least three species with complex amplitudes: the Jarlskog
//    invariant of a 3 x 3 mixing. The frames cannot be the three (point 2). A FLAVOR REGISTER of size 3 that W(F4) does
//    not touch keeps isotropy automatically, and THE RING ALREADY HOLDS THE MAXIMAL CP PHASE: the trimaximal matrix V_jk
//    = w^(jk) / sqrt(-3) is exactly unitary over Z[w][1/3] (sqrt(-3) = 1 + 2 w is an Eisenstein integer, and 3 divides
//    42), and its Jarlskog invariant is Im(V00 V11 conj(V01 V10)) = Im(9 w) / 81 = sqrt(3) / 18 = 1 / (6 sqrt 3), the
//    largest any 3 x 3 unitary can have. PREDICTED exactly.
// 7. THE SAKHAROV CONDITIONS (argued, no gate). (i) Baryon-number violation: LACKING. Every piece so far conserves member
//    number (the mixers are number-preserving unitaries on each dock, the stream moves values, the coin swaps), and the
//    register's two sector numbers are conserved separately; the many-body rule with registers, whose collision K could
//    change species, is not written. (ii) C and CP violation: P and CP now YES (points 3 and 5, with the physical parity
//    the improper lift, point 2), C together with CP NOT YET: it needs species mixing across sectors and a third flavor,
//    whose maximal phase the ring holds (point 6). (iii) Departure from equilibrium: PRESENT. The count of distinctions
//    runs one way, the line law kept the husk from any common temperature (the ledger's J rows), and a forming horizon
//    gives a burst with no steady state afterward (E-GRV-0136).
//
// PREDICTED: A1 to A4 hold; B1 to B4 hold (every sector's bands, speeds and census exactly E-SPN-0160's at its own mass,
// the mixed census B* = 2 M-); for the chiral mass P_imp and CP fail, P_rot, C and CPT hold; the chiral phase is
// removable; D1 and D2 hold exactly; every control and the instrument hold. VERDICT PARTIAL: the register gives the model
// exact chirality, and with it P and CP violation that keep every one-body property of E-SPN-0160, but no C-and-CP phase
// survives rephasing while the sectors are conserved, so it cannot yet make a matter-antimatter asymmetry.
//
// GATES, fixed before the gate run.
//  A1 THE INVOLUTION, EXACT: J is an integer matrix with J^2 = 1 and trace 0; J commutes with all sixteen gamma_i^T
//     gamma_j; g J = det(g) J g for all 1,152 elements of W(F4), exactly 576 with det +1.
//  A2 THE HALVES, EXACT: 2 P+ = 1 (x) (1 + J) on 192 modes commutes with 24 Q_S and 48 Q_D; it is covariant under all 576
//     rotations; every one of the 576 reflections g satisfies g (2 P+) = (2 P-) g.
//  A3 THE HUSK PARITY'S LIFTS, EXACT: -I is in W(F4) with det +1 and acts on the register as the identity; for each of the
//     four axes taken as depth, the map reversing the other three is in W(F4) with det -1.
//  A4 MOLIEN, EXACT (integer arithmetic): W(F4) and W+(F4) have the same number of invariants in every degree 0 .. 23 and
//     W+ has exactly one more at 24; both have 1 of degree 2 and 1 of degree 4; the joint stabilizer of the three frames
//     has order 192 and 3 invariants of degree 4.
//  B1 THE PIECES, EXACT: u+- norm one in the ring; 48 Q_S P+- and 96 Q_D P+- are integer matrices, idempotent at their
//     scales, traces 4, 4, 4, 4, pairwise products zero (Q_S P+ Q_S P- = 0, Q_S P+- Q_D P+- = 0 in every combination),
//     each covariant under all 576 rotations.
//  B2 THE SECTORS: each piece's weight between the sectors (in the rotated register basis) at most 1e-14; at 64 Weyl
//     momenta each sector has 4 phases on pi + E(K; M_s), 4 on pi - E(K; M_s) (1e-10) and 88 at 0 (1e-8).
//  B3 PER SECTOR: the massless twin (u = -1 in both sectors) gives pairs of 8 with |gamma| / c0 <= 1e-9 and c0 = c / 4 to
//     1e-9; along the four directions |R_s - tan m_s / m_s| <= 1e-9 and the K^2 coefficients isotropic to 1e-6.
//  B4 THE CHANNELS: each sector's census (4 directions x 300 steps to 3 pi, 64 Weyl momenta) has no crossing and B* = 2
//     M_s to 1e-6; the mixed census on the same paths has no crossing and B* = 2 M- to 1e-6.
//  S THE SYMMETRIES, at 64 Weyl momenta, each the largest sector-spectrum mismatch: for the chiral mass P_imp > 1e-3 (it
//     FAILS), P_rot <= 1e-9, C (raw) <= 1e-9, CP (rephased) > 1e-3 (it FAILS), CPT (P_rot, rephased) <= 1e-9.
//  D1 THE TRIMAXIMAL MIXING, EXACT: V V^dag = 1 in Z[w][1/3] and its Jarlskog numerator is 9 w over 81 (value sqrt(3) /
//     18, the maximum 1 / (6 sqrt 3), to 1e-15).
//  D2 REPHASING, EXACT: multiplying V's rows and columns by sixth roots of unity (the ring's units, 36 patterns: row 0
//     and column 0 by w^a, w^b each) leaves the Jarlskog numerator's imaginary part at 9 over 81.
// INSTRUMENT (a failure makes the verdict partial). I1 the two sectors' phases together equal the full 192-mode cycle's
//  phases at 8 momenta (1e-10). I2 the sector blocks of E-SPN-0160's own schedule (u+ = u-, the light point) reproduce
//  its band, 4 + 4 on pi +- E and 88 flat, in each sector (1e-10).
// CONTROLS (a failure makes the verdict partial). C1 THE MIRROR-SYMMETRIC MASS (u+ = u-): P_imp and CP both <= 1e-9, and
//  the chiral piece equals E-SPN-0160's registerPiece entry by entry to 1e-15. C2 THE CHIRAL PHASE IS REMOVABLE: raw P_imp
//  and raw C both > 1e-3, and P_imp, C and CP rephased all <= 1e-9. C3 A REAL MIXING HAS NO CP PHASE: the Jarlskog
//  numerator of the rational rotation [[3/5, 4/5, 0], [-4/5, 3/5, 0], [0, 0, 1]] has imaginary part exactly 0.
// Verdict: fail if A1 to A4, B1 to B4, S or D1 to D2 fails; partial if all of those hold (point 6: no asymmetry from a
// conserved-sector phase), or if a control or the instrument fails; pass is not available here.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/chi-probe1.log: J^2 = 1, trace 0, commuting with
//  every gamma_i^T gamma_j, g J = det(g) J g on all 1,152 (576 proper), 2 P+ commuting with Q_S and Q_D, covariant under
//  every rotation and no reflection, -I in the group with the register identity, the four depth-keeping parities in it
//  with det -1, the frame stabilizer 192 (96 proper), and the Molien series to degree 30 (W and W+ equal to degree 22,
//  16 against 17 at 24; the stabilizer 3 of degree 4). tmp/chi-probe2.log: the ring's unit masses (the table that chose
//  m-), the sector blocks' leak 0, each sector 4 up, 4 down, 88 flat (gap 1.1e-15), the chiral mass's symmetry readings
//  at 8 momenta with m- = -0.143348 (the unit (-2, 4), a negative mass, replaced here by (2, 2)): P_imp 0.084, P_rot 9e-16,
//  C 9e-16, CP 0.168, CPT 9e-16, and the trimaximal matrix unitary with Jarlskog 9 w / 81. tmp/chi-smoke.log: every code
//  path on a small plan, all gates held, BUT the rephased reading was flawed: it tried only the shifts that align the
//  first phase, so it was no minimum (rephased P_imp 0.168 above raw 0.084). CORRECTED BEFORE THE GATE RUN: a rephased
//  reading now compares the circular GAP sequences under the best rotation, which is exactly shift invariant (zero iff
//  the spectra agree up to some common phase); a gap mismatch can reach twice a phase mismatch, so rephased above raw is
//  expected. tmp/chi-smoke2.log reran every path with it: the same verdicts, C rephased 8.9e-16, CP 0.168.
//
// FIRST RUN (tmp/chi-exp-run1.log, 78 s): PARTIAL, as predicted: every hard gate, the instrument and all three controls
//  hold. No gate moved and none was rerun.
//  - A: J integer, J^2 = 1, trace 0, commuting with all sixteen bilinears; g J = det(g) J g on all 1,152 (576 rotations);
//    2 P+ commutes with Q_S and Q_D, is covariant under every rotation, and every reflection sends it to 2 P-; -I is a
//    rotation acting as the register identity, and the four depth-keeping parities are reflections. Molien: W and W+ equal
//    in every degree 0 .. 23, first different at 24 (16 against 17); the frame stabilizer has order 192 and 3 quartics.
//  - B: the four chiral projectors exact and covariant under the rotations; sector leak 0; each sector 4 + 4 on pi +- E and
//    88 flat at every one of 64 momenta (gap 2.0e-15); massless pairs of 8 per sector at c / 4 (to 8e-12), gamma to 2.6e-11;
//    R - tan m / m at most 4.9e-12 in both sectors, isotropy 6e-12; census + B* 0.760502413 = 2 M+, - B* 0.573390276 = 2 M-,
//    mixed B* 0.573390276 = 2 M-, all with no crossing.
//  - S (chiral mass): P_imp raw 0.090 (rephased 0.180) and CP 0.180 FAIL, as derived; P_rot 1.3e-15, C 1.3e-15 and CPT
//    1.3e-15 HOLD.
//  - D: V V^dag = 1 exactly, Jarlskog 9 w / 81 = sqrt(3) / 18, unchanged under all 36 unit rephasings.
//  - I1 1.3e-15, I2 exact. C1 (u+ = u-): every symmetry to 2.2e-15 and the piece equal to E-SPN-0160's entry by entry;
//    C2 (the chiral phase): raw P_imp 0.667 and C 1.33 fail, rephased all to 1.8e-15, so it is removable; C3 the rational
//    rotation's Jarlskog numerator is 0.
// NEXT. (1) Species mixing across the sectors with three flavors: a flavor register of 3, untouched by W(F4) (so isotropy
//  holds by construction), with the trimaximal mixing on the mass step; its phase survives rephasing, so C and CP break
//  together. Exact over Z[w][1/42] (the 3 is in 42). (2) A number-violating piece in the many-body rule with registers,
//  which is not yet written. (3) The cusp argument for which husk parity is physical (point 2) is argued, not measured:
//  run the chiral mass on the true hyperbolic mesh, where -I is not a symmetry.
//
// Depth L1 (the halves, the covariance count, the lifts, the frame exclusion and the trimaximal phase are mathematics) and
// L2 (the bands, speeds, channels and symmetry readings of a coined two-beat walk with a chiral register, read off exact
// pieces). DETERMINISM: no random numbers; Weyl sequences, grids and fixed paths. NOTHING MOVES: the pieces hand values
// between the slots and register components of one dock, and the stream takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  DOCK_ROOTS,
  wrap,
  type CMatrix,
} from '@/code/measure/dock-mixer'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import {
  cyclePhases,
  eisConj,
  eisMul,
  type Eis,
} from '@/code/measure/swap-cone'
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
} from '@/code/measure/two-beat'
import {
  commutesExactly,
  cycleMasslessPairN,
  diracPhase,
  f4Group,
  frameRN,
  gammaMatrices,
  matMul,
  MODES,
  pairCensusN,
  partnerProjector48,
  REGISTER_ROOTS,
  registerPiece,
  sameMatrix,
  scaled,
  singletProjector24,
  trace,
} from '@/code/measure/spinor-register'
import {
  chiralPiece,
  chirality2,
  det4,
  frameOf,
  intertwinesExactly,
  jarlskog,
  mixedCensus,
  molien,
  phaseAfter,
  phaseMismatch,
  SECTOR_ROOTS,
  sectorBasis,
  sectorBlock,
  trimaximal,
  unitaryExact,
  volumeRight,
  type EisQ,
} from '@/code/measure/chiral-register'

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
const PLUS: readonly [number, number] = [-1, 4]
const MINUS: readonly [number, number] = [2, 2]
const MASSLESS: readonly [number, number] = [0, 3]
const PHASE: readonly [number, number] = [1, 0]
const MOLIEN_DEGREE = 30
const PSEUDO_DEGREE = 24
const BAND_TOLERANCE = 1e-10
const FLAT_TOLERANCE = 1e-8
const LEAK_TOLERANCE = 1e-14
const GAMMA_TOLERANCE = 1e-9
const R_EXACT = 1e-9
const ISOTROPY = 1e-6
const BSTAR_TOLERANCE = 1e-6
const SYMMETRY_HOLDS = 1e-9
const SYMMETRY_BREAKS = 1e-3
const PAIR_KAPPA = 0.01
const PIECE_TOLERANCE = 1e-15
const JARLSKOG_TOLERANCE = 1e-15

export type ChiralPlan = {
  momenta: number
  censusSteps: number
  weylExtra: number
  symmetryMomenta: number
  checkMomenta: number
}

export const GATE_PLAN: ChiralPlan = {
  momenta: 64,
  censusSteps: 300,
  weylExtra: 64,
  symmetryMomenta: 64,
  checkMomenta: 8,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/chiral-register',
  code: 'E-FRC-0258',
  title:
    "the Clifford register gives the model exact chirality and P and CP violation, partial (C is kept, so no asymmetry yet): right multiplication by the volume element splits Cl+(4) into two halves that commute with every piece of E-SPN-0160 and that W(F4) keeps under its 576 rotations and swaps under its 576 reflections, so the member space is two mirror species; W+(F4) has W(F4)'s invariants in every degree below 24 (Molien), so a rule covariant under the rotations only is exactly as isotropic, and the husk parity that keeps depth (the cusp fixes it) is the reflection; a chiral mass (u on one half, another unit on the other) is exact over Z[w][1/42] and keeps gamma = 0, c/4, R = tan m/m, isotropy and every channel census closed (mixed pairs at 2 M-), breaks P and CP and keeps C, P under -I and CPT; a phase on one conserved half is removed by rephasing; the frames cannot be three generations (their stabilizer has three quartic invariants), and the ring holds the trimaximal mixing exactly, with the maximal Jarlskog invariant sqrt(3)/18",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return chiralRegisterRun(GATE_PLAN)
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
const eqM = (
  a: readonly (readonly number[])[],
  b: readonly (readonly number[])[],
): boolean =>
  a.every((r, i) => r.every((x, j) => x === (b[i] as number[])[j]))
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

export function chiralRegisterRun(plan: ChiralPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const group = f4Group()
  const dets = group.map(g => det4(g.matrix))
  const rotations = group.filter((_, i) => dets[i] === 1)
  const reflections = group.filter((_, i) => dets[i] === -1)

  // ---------------- A1: the involution ----------------
  const J = volumeRight()
  const I8 = J.map((_, i) => J.map((_, j) => (i === j ? 1 : 0)))
  const gam = gammaMatrices()
  const bilinears = [0, 1, 2, 3].flatMap(i =>
    [0, 1, 2, 3].map(j => mm(tr8(gam[i]!), gam[j]!)),
  )
  const A1 =
    J.every(r => r.every(x => Number.isInteger(x))) &&
    eqM(mm(J, J), I8) &&
    J.reduce((s, r, i) => s + r[i]!, 0) === 0 &&
    bilinears.every(b => eqM(mm(J, b), mm(b, J))) &&
    group.every((g, i) =>
      eqM(
        mm(g.register, J),
        mm(J, g.register).map(r => r.map(x => dets[i]! * x)),
      ),
    ) &&
    rotations.length === 576 &&
    group.length === 1152

  // ---------------- A2: the halves ----------------
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const P2 = chirality2(J, 1)
  const M2 = chirality2(J, -1)
  const commute = (x: Float64Array, y: Float64Array): boolean =>
    sameMatrix(matMul(x, y), matMul(y, x))
  const A2 =
    commute(P2, S24) &&
    commute(P2, D48) &&
    rotations.every(g => commutesExactly(g, P2)) &&
    reflections.every(g => intertwinesExactly(g, P2, M2))

  log('A1 A2')

  // ---------------- A3: the lifts ----------------
  const find = (m: readonly (readonly number[])[]) =>
    group.find(e =>
      e.matrix.every((r, i) =>
        r.every((x, j) => Math.abs(x - (m[i] as number[])[j]!) < 1e-12),
      ),
    )
  const minusI = find(
    [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => (i === j ? -1 : 0))),
  )
  const depthKeeping = [0, 1, 2, 3].map(depth =>
    find(
      [0, 1, 2, 3].map(i =>
        [0, 1, 2, 3].map(j => (i === j ? (i === depth ? 1 : -1) : 0)),
      ),
    ),
  )
  const A3 =
    !!minusI &&
    det4(minusI.matrix) === 1 &&
    eqM(minusI.register, I8) &&
    depthKeeping.every(e => !!e && det4(e.matrix) === -1)

  // ---------------- A4: Molien ----------------
  const frames = DOCK_ROOTS.map(frameOf)
  const stabilizer = group.filter(e =>
    DOCK_ROOTS.every((_, d) => frames[e.slots[d]!] === frames[d]),
  )
  const mW = molien(group, MOLIEN_DEGREE)
  const mWplus = molien(rotations, MOLIEN_DEGREE)
  const mStab = molien(stabilizer, MOLIEN_DEGREE)
  const firstDiff = mW.findIndex((x, n) => x !== mWplus[n])
  const A4 =
    mW.every(x => x >= 0n) &&
    mWplus.every(x => x >= 0n) &&
    firstDiff === PSEUDO_DEGREE &&
    mWplus[PSEUDO_DEGREE]! - mW[PSEUDO_DEGREE]! === 1n &&
    mW[2] === 1n &&
    mW[4] === 1n &&
    mWplus[2] === 1n &&
    mWplus[4] === 1n &&
    stabilizer.length === 192 &&
    mStab[4] === 3n

  log('A3 A4')

  // ---------------- B1: the pieces ----------------
  const uP = ringUnit(PLUS[0], PLUS[1])
  const uM = ringUnit(MINUS[0], MINUS[1])
  const uZ = ringUnit(MASSLESS[0], MASSLESS[1])
  const mP = mOf(uP)
  const mM = mOf(uM)
  const MP = 2 * mP
  const MM = 2 * mM
  const S48p = matMul(S24, P2)
  const S48m = matMul(S24, M2)
  const D96p = matMul(D48, P2)
  const D96m = matMul(D48, M2)
  const integer = (x: Float64Array): boolean =>
    x.every(v => Number.isInteger(v))
  const idem = (x: Float64Array, s: number): boolean =>
    sameMatrix(
      matMul(x, x),
      x.map(v => s * v),
    )
  const zero = (x: Float64Array, y: Float64Array): boolean =>
    matMul(x, y).every(v => v === 0)
  const four = [S48p, S48m, D96p, D96m]
  const scales = [48, 48, 96, 96]
  const B1 =
    unitNormExact(uP) &&
    unitNormExact(uM) &&
    unitNormExact(uZ) &&
    four.every(integer) &&
    four.every((x, i) => idem(x, scales[i]!)) &&
    four.every((x, i) => trace(x) / scales[i]! === 4) &&
    zero(S48p, S48m) &&
    zero(S48p, D96p) &&
    zero(S48p, D96m) &&
    zero(S48m, D96p) &&
    zero(S48m, D96m) &&
    zero(D96p, D96m) &&
    rotations.every(g => four.every(x => commutesExactly(g, x)))

  log('B1')

  const qSp = scaled(S48p, 48)
  const qSm = scaled(S48m, 48)
  const qDp = scaled(D96p, 96)
  const qDm = scaled(D96m, 96)
  const qP = scaled(P2, 2)
  const schedule = (
    a: readonly [number, number],
    b: readonly [number, number],
  ): CMatrix[] => [
    chiralPiece(qSp, qSm, a, b),
    chiralPiece(qDp, qDm, conj(a), conj(b)),
  ]
  const basis = sectorBasis(J)
  const roots = SECTOR_ROOTS(DOCK_ROOTS)

  const sectors = (
    Ps: readonly CMatrix[],
  ): { plus: CMatrix[]; minus: CMatrix[]; leak: number } => {
    const p = Ps.map(P => sectorBlock(P, basis, 0))
    const m = Ps.map(P => sectorBlock(P, basis, 1))

    return {
      plus: p.map(x => x.block),
      minus: m.map(x => x.block),
      leak: Math.max(...p.map(x => x.leak), ...m.map(x => x.leak)),
    }
  }

  const chiral = schedule(unitValue(uP), unitValue(uM))
  const ch = sectors(chiral)

  // ---------------- B2: the sectors ----------------
  const check = weylMomenta(plan.momenta)

  let bandGap = 0
  let bandCounts = true

  for (const K of check) {
    for (const [blocks, M] of [
      [ch.plus, MP],
      [ch.minus, MM],
    ] as const) {
      const ph = cyclePhases(blocks, roots, K)
      const E = diracPhase(K, M)
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
    }
  }

  const B2 = ch.leak <= LEAK_TOLERANCE && bandCounts

  log('B2')

  // ---------------- B3: per sector ----------------
  const zs = sectors(schedule(unitValue(uZ), unitValue(uZ)))
  const pairs = [zs.plus, zs.minus].flatMap(blocks =>
    DIRS.map(u =>
      cycleMasslessPairN(blocks, Math.PI, u, PAIR_KAPPA, roots),
    ),
  )
  const thetaP = unitAngle(uP)
  const thetaM = unitAngle(uM)
  const frameP = restFrame(thetaP, -thetaP, MP)
  const frameM = restFrame(thetaM, -thetaM, MM)
  const fitsP = DIRS.map(u =>
    frameRN(ch.plus, frameP, thetaP, u, C_QUARTER, SCALES, roots),
  )
  const fitsM = DIRS.map(u =>
    frameRN(ch.minus, frameM, thetaM, u, C_QUARTER, SCALES, roots),
  )
  const tanP = Math.tan(mP) / mP
  const tanM = Math.tan(mM) / mM
  const iso = (fits: { c2: number }[]): number =>
    Math.max(
      ...fits.map(x =>
        Math.abs(x.c2 / (fits[0] as { c2: number }).c2 - 1),
      ),
    )
  const B3 =
    pairs.every(
      x =>
        x.size === 8 &&
        Math.abs(x.gamma) / C_QUARTER <= GAMMA_TOLERANCE &&
        Math.abs(x.c0 / C_QUARTER - 1) <= GAMMA_TOLERANCE,
    ) &&
    fitsP.every(x => Math.abs(x.R - tanP) <= R_EXACT) &&
    fitsM.every(x => Math.abs(x.R - tanM) <= R_EXACT) &&
    iso(fitsP) <= ISOTROPY &&
    iso(fitsM) <= ISOTROPY

  log('B3')

  // ---------------- B4: the channels ----------------
  const paths = radialPaths(DIRS, 3 * Math.PI, plan.censusSteps)
  const extra = weylMomenta(plan.weylExtra)
  const censusP = pairCensusN(ch.plus, frameP, paths, extra, roots)
  const censusM = pairCensusN(ch.minus, frameM, paths, extra, roots)
  const censusX = mixedCensus(
    ch.plus,
    frameP,
    ch.minus,
    frameM,
    paths,
    roots,
  )
  const lighter = Math.min(MP, MM)
  const B4 =
    censusP.crossings === 0 &&
    Math.abs(censusP.Bstar - 2 * MP) <= BSTAR_TOLERANCE &&
    censusM.crossings === 0 &&
    Math.abs(censusM.Bstar - 2 * MM) <= BSTAR_TOLERANCE &&
    censusX.crossings === 0 &&
    Math.abs(censusX.Bstar - 2 * lighter) <= BSTAR_TOLERANCE

  log('B4')

  // ---------------- S: the symmetries ----------------
  const sym = weylMomenta(plan.symmetryMomenta)
  const gK = (K: readonly number[]): number[] => [
    -K[0]!,
    -K[1]!,
    -K[2]!,
    K[3]!,
  ]
  const neg = (K: readonly number[]): number[] => K.map(x => -x)

  const readings = (s: {
    plus: CMatrix[]
    minus: CMatrix[]
  }): {
    Pimp: number
    PimpRaw: number
    Prot: number
    Craw: number
    C: number
    CP: number
    CPT: number
  } => {
    const spec = (b: CMatrix[], K: readonly number[]): number[] =>
      cyclePhases(b, roots, K)
    const r = {
      Pimp: 0,
      PimpRaw: 0,
      Prot: 0,
      Craw: 0,
      C: 0,
      CP: 0,
      CPT: 0,
    }

    for (const K of sym) {
      const pK = spec(s.plus, K)
      const mK = spec(s.minus, K)
      const mG = spec(s.minus, gK(K))
      const pN = spec(s.plus, neg(K))
      const mN = spec(s.minus, neg(K))
      const mGN = spec(s.minus, neg(gK(K)))

      r.PimpRaw = Math.max(r.PimpRaw, phaseMismatch(pK, mG, false))
      r.Pimp = Math.max(r.Pimp, phaseMismatch(pK, mG, true))
      r.Prot = Math.max(
        r.Prot,
        phaseMismatch(pK, pN, false),
        phaseMismatch(mK, mN, false),
      )

      r.Craw = Math.max(
        r.Craw,
        phaseMismatch(
          pK,
          pN.map(x => -x),
          false,
        ),
        phaseMismatch(
          mK,
          mN.map(x => -x),
          false,
        ),
      )

      r.C = Math.max(
        r.C,
        phaseMismatch(
          pK,
          pN.map(x => -x),
          true,
        ),
        phaseMismatch(
          mK,
          mN.map(x => -x),
          true,
        ),
      )

      r.CP = Math.max(
        r.CP,
        phaseMismatch(
          pK,
          mGN.map(x => -x),
          true,
        ),
      )

      r.CPT = Math.max(
        r.CPT,
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

    return r
  }

  const mass = readings(ch)
  const S =
    mass.PimpRaw > SYMMETRY_BREAKS &&
    mass.Pimp > SYMMETRY_BREAKS &&
    mass.Prot <= SYMMETRY_HOLDS &&
    mass.Craw <= SYMMETRY_HOLDS &&
    mass.CP > SYMMETRY_BREAKS &&
    mass.CPT <= SYMMETRY_HOLDS

  log('S')

  // ---------------- D1, D2: the trimaximal mixing ----------------
  const V = trimaximal()
  const jV = jarlskog(V)
  const D1 =
    unitaryExact(V) &&
    jV.num[0] === 0n &&
    jV.num[1] === 9n &&
    jV.den === 81n &&
    Math.abs(jV.value - 1 / (6 * Math.sqrt(3))) <= JARLSKOG_TOLERANCE
  const sixth: Eis[] = [
    [1n, 0n],
    [1n, 1n],
    [0n, 1n],
    [-1n, 0n],
    [-1n, -1n],
    [0n, -1n],
  ]

  let D2 = true

  for (const a of sixth) {
    for (const b of sixth) {
      const W = V.map((row, j) =>
        row.map((x, k) => ({
          num: eisMul(
            eisMul(x.num, j === 0 ? a : [1n, 0n]),
            k === 0 ? b : [1n, 0n],
          ),
          den: x.den,
        })),
      )
      const jW = jarlskog(W)
      // the imaginary part of (p + q w) / den is q sqrt(3) / 2 / den, compared as q / den = 9 / 81
      const rephased =
        jW.num[1] * 81n === 9n * jW.den && jW.num[0] === 0n

      if (!rephased) {
        D2 = false
      }
    }
  }

  log('D')

  // ---------------- instrument ----------------
  let I1gap = 0

  for (const K of weylMomenta(plan.checkMomenta)) {
    const full = cyclePhases(chiral, REGISTER_ROOTS, K)
    const split = [
      ...cyclePhases(ch.plus, roots, K),
      ...cyclePhases(ch.minus, roots, K),
    ]

    I1gap = Math.max(I1gap, phaseMismatch(full, split, false))
  }

  const I1 = I1gap <= BAND_TOLERANCE
  const own = sectors([
    registerPiece(scaled(S24, 24), unitValue(uP)),
    registerPiece(scaled(D48, 48), conj(unitValue(uP))),
  ])

  let I2 = own.leak <= LEAK_TOLERANCE

  for (const K of weylMomenta(plan.checkMomenta)) {
    const E = diracPhase(K, MP)

    for (const blocks of [own.plus, own.minus]) {
      const ph = cyclePhases(blocks, roots, K)

      if (
        ph.filter(
          x => Math.abs(wrap(x - Math.PI - E)) <= BAND_TOLERANCE,
        ).length !== 4 ||
        ph.filter(
          x => Math.abs(wrap(x - Math.PI + E)) <= BAND_TOLERANCE,
        ).length !== 4 ||
        ph.filter(x => Math.abs(wrap(x)) <= FLAT_TOLERANCE).length !==
          88
      ) {
        I2 = false
      }
    }
  }

  log('I')

  // ---------------- controls ----------------
  const mirror = schedule(unitValue(uP), unitValue(uP))
  const mirrorReadings = readings(sectors(mirror))
  const own192 = [
    registerPiece(scaled(S24, 24), unitValue(uP)),
    registerPiece(scaled(D48, 48), conj(unitValue(uP))),
  ]
  const pieceGap = Math.max(
    ...mirror.map((P, b) =>
      Math.max(
        ...P.re.map((x, i) => Math.abs(x - own192[b]!.re[i]!)),
        ...P.im.map((x, i) => Math.abs(x - own192[b]!.im[i]!)),
      ),
    ),
  )
  const C1 =
    mirrorReadings.Pimp <= SYMMETRY_HOLDS &&
    mirrorReadings.CP <= SYMMETRY_HOLDS &&
    pieceGap <= PIECE_TOLERANCE
  const withPhase = [
    mirror[0]!,
    phaseAfter(mirror[1]!, qP, unitValue(ringUnit(PHASE[0], PHASE[1]))),
  ]
  const phaseReadings = readings(sectors(withPhase))
  const C2 =
    phaseReadings.PimpRaw > SYMMETRY_BREAKS &&
    phaseReadings.Craw > SYMMETRY_BREAKS &&
    phaseReadings.Pimp <= SYMMETRY_HOLDS &&
    phaseReadings.C <= SYMMETRY_HOLDS &&
    phaseReadings.CP <= SYMMETRY_HOLDS
  const rational: EisQ[][] = [
    [
      { num: [3n, 0n], den: 5n },
      { num: [4n, 0n], den: 5n },
      { num: [0n, 0n], den: 1n },
    ],
    [
      { num: [-4n, 0n], den: 5n },
      { num: [3n, 0n], den: 5n },
      { num: [0n, 0n], den: 1n },
    ],
    [
      { num: [0n, 0n], den: 1n },
      { num: [0n, 0n], den: 1n },
      { num: [1n, 0n], den: 1n },
    ],
  ]
  const C3 = jarlskog(rational).num[1] === 0n
  const conjCheck = eisConj([0n, 1n])

  void conjCheck

  log('C')

  const hard =
    A1 && A2 && A3 && A4 && B1 && B2 && B3 && B4 && S && D1 && D2
  const instrument = I1 && I2
  const status = !hard ? 'fail' : 'partial'
  const censusLine = (c: Census): string =>
    `B* ${c.Bstar.toFixed(9)} x${c.crossings}, nearest at |q| ${Math.hypot(...c.at).toFixed(4)} (pair ${c.pair.map(x => x.toFixed(4)).join(', ')})`
  const readLine = (r: ReturnType<typeof readings>): string =>
    `P_imp raw ${r.PimpRaw.toExponential(2)} rephased ${r.Pimp.toExponential(2)}, P_rot ${r.Prot.toExponential(2)}, C raw ${r.Craw.toExponential(2)} rephased ${r.C.toExponential(2)}, CP ${r.CP.toExponential(2)}, CPT ${r.CPT.toExponential(2)}`
  const series = (x: bigint[]): string =>
    x.filter((_, n) => n % 2 === 0).join(' ')

  return verdict({
    status,
    claim: `A1 ${A1} A2 ${A2} A3 ${A3} A4 ${A4} (first difference at degree ${firstDiff}, stabilizer ${stabilizer.length} with ${mStab[4]} quartics); B1 ${B1} B2 ${B2} (leak ${ch.leak.toExponential(2)}, band gap ${bandGap.toExponential(2)}) B3 ${B3} B4 ${B4} (+ ${censusLine(censusP)}, - ${censusLine(censusM)}, mixed ${censusLine(censusX)}); S ${S} (chiral mass: ${readLine(mass)}); D1 ${D1} D2 ${D2} (Jarlskog ${jV.num[1]} w / ${jV.den} = ${jV.value}); instrument I1 ${I1} (${I1gap.toExponential(2)}) I2 ${I2}; controls C1 ${C1} C2 ${C2} C3 ${C3}`,
    metrics: {
      A1: flag(A1),
      A2: flag(A2),
      A3: flag(A3),
      A4: flag(A4),
      B1: flag(B1),
      B2: flag(B2),
      B3: flag(B3),
      B4: flag(B4),
      S: flag(S),
      D1: flag(D1),
      D2: flag(D2),
      instrument: flag(instrument),
      I1: flag(I1),
      I2: flag(I2),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      mPlus: mP,
      mMinus: mM,
      firstMolienDifference: firstDiff,
      stabilizerQuartics: Number(mStab[4]),
      leak: ch.leak,
      bandGap,
      censusPlus: censusP.Bstar,
      censusMinus: censusM.Bstar,
      censusMixed: censusX.Bstar,
      crossings:
        censusP.crossings + censusM.crossings + censusX.crossings,
      Pimp: mass.Pimp,
      Prot: mass.Prot,
      Craw: mass.Craw,
      CP: mass.CP,
      CPT: mass.CPT,
      jarlskog: jV.value,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      instrument: flag(instrument),
    },
    notes: `L1 and L2. ${MODES} modes a member, two sectors of 96. Masses m+ ${mP.toFixed(6)} (ringUnit(${PLUS.join(', ')})), m- ${mM.toFixed(6)} (ringUnit(${MINUS.join(', ')})). Molien (even degrees 0 .. ${MOLIEN_DEGREE}): W(F4) ${series(mW)}; W+(F4) ${series(mWplus)}; frame stabilizer ${series(mStab)}. Group ${group.length}, rotations ${rotations.length}. Per sector: massless pairs ${pairs.map(x => `${x.size} c0/(c/4) ${(x.c0 / C_QUARTER).toFixed(12)} gamma ${(x.gamma / C_QUARTER).toExponential(2)}`).join('; ')}; R+ - tan m/m ${fitsP.map(x => (x.R - tanP).toExponential(2)).join(' ')}; R- - tan m/m ${fitsM.map(x => (x.R - tanM).toExponential(2)).join(' ')}; isotropy ${iso(fitsP).toExponential(2)}, ${iso(fitsM).toExponential(2)}. Census: + ${censusLine(censusP)} (2M ${(2 * MP).toFixed(9)}); - ${censusLine(censusM)} (2M ${(2 * MM).toFixed(9)}); mixed ${censusLine(censusX)} (2 M- ${(2 * lighter).toFixed(9)}). Symmetries: chiral mass ${readLine(mass)}; mirror-symmetric mass ${readLine(mirrorReadings)} (piece gap ${pieceGap.toExponential(2)}); chiral phase ${readLine(phaseReadings)}. Trimaximal Jarlskog ${jV.num[0]} + ${jV.num[1]} w over ${jV.den}, value ${jV.value} against 1/(6 sqrt 3) ${1 / (6 * Math.sqrt(3))}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
