// E-SPN-0166 A WILSON MASS ON THE REGISTER MAKES THE HUSK A DOMAIN WALL (the domain-wall route to member-number
// violation). E-SPN-0165 proved no gauge winding changes a chiral half's member number while every piece commutes with J,
// found that at E-SPN-0160's uniform mass the bulk's second Chern number is 0 (the Dirac vector's 72 zeros have indices
// summing to 0 and the band's mass is M at every one), and named the escape: a Wilson mass, M + w W(K), of the other
// sign at every zero but K = 0. This experiment builds that mass as a rule piece and reads its boundary.
//
// DERIVATION (written before the gate run):
//  1. THE WILSON MASS FROM PIECES THE RULE HAS. The cycle is U = T P2 T P1 with P = X G, and X T X = T^dag with X
//     commuting with Q_S and Q_D, so U = T G2 T^dag G1 exactly (E-SPN-0159 point 1). E-SPN-0160: G1 = 1 + (u - 1) Q_S, G2
//     = 1 + (conj u - 1) Q_D. Add a mixer v on Q_S to BEAT 2 and y = conj v on Q_D to BEAT 1: G1 = 1 + (u - 1) Q_S + (y -
//     1) Q_D, G2 = 1 + (conj u - 1) Q_D + (v - 1) Q_S (Q_S and Q_D are orthogonal, so each G is a ring mixer on two
//     sectors, covariant under all of W(F4), exact when u and v are ring units). Beat 2 sits between T^dag and T, so the
//     singlet sees v only through the stream: at a zero of the Dirac vector its return amplitude is c(K) = <S| T |S> =
//     (1 / 24) sum_r cos(K . r) = 1 - W(K) / 24. The partner sees y the same way in the conjugate cycle G1 T G2 T^dag,
//     since Q_D T Q_D on D is tr(J) / 48 = 1 - W / 24 at a zero (J = sum eps r r^T). So v and y are a Wilson term: whole
//     at K = 0, absent at the twelve half-periods (W = 24, c = 0), weighted by c = -1/3, -1/6, -1/8 at the other
//     doublers (W = 32, 28, 27). With u at pi + M: the singlet rests at pi - m0, m0 = -(M + arg v), and the partner at
//     pi + m0 (inverted when arg v < -M), while at every W = 24 half-period they stay at pi + M and pi - M. Wilson's
//     recipe: heavy doublers (M), a light member (m0). v = conj u^2 gives m0 = M, the symmetric case.
//  2. THE SECOND CHERN NUMBER. At a zero of s the singlet's Floquet offset from pi is the mass: -m0 at K = 0, and at the
//     doublers +M (W = 24) or the root of the 2 x 2 walk of S and T S (lambda1 lambda2 = u v, lambda1 + lambda2 = u + v +
//     (u - 1)(v - 1) c^2), which stays above pi for |c| <= 1/3. So every zero but K = 0 flips: C2 = (1/2) sum sign(det)
//     sign(m) = -1 per two-component copy (K = 0 det +, the other 71 sum to -1). ORIENTATION: vol is central in Cl+(4)
//     and acts as J, +1 on one half and -1 on the other, so the halves carry the two inequivalent spinors of Spin(4) and
//     their C2 have opposite signs. MULTIPLICITY: the register's right multiplications by the half's quaternions commute
//     with every piece and the stream (the commutant of E-SPN-0163), and covariance forbids any piece that splits them
//     (a covariant right multiplication must be central: 1 or vol, a scalar on each half). So every level is a doublet
//     of that right SU(2), both copies with one topology: C2 = -+2 per half.
//  3. THE BOUNDARY (bulk-boundary correspondence, Jackiw-Rebbi). A slab whose depth classes run the Wilson schedule on
//     one side and E-SPN-0160's on the other has two walls. The mass changes sign across a wall at K = 0 only, so each
//     wall carries the zero mode of each copy: a Weyl cone per copy, 4 states per wall per half at the node, net
//     chirality +-2 per wall per half (basis-free: Im tr(H0 H1 H2) / (2 v0 v1 v2) over the wall's node space), opposite at
//     the two walls, opposite between the halves (the mirror). With the Wilson pieces on one half only (Q_S P+, Q_D P+,
//     covariant under the 576 rotations, as E-FRC-0258's chiral mass), only that half's walls carry Weyl cones: the face
//     then has net chirality 2, and its member number, not only N+ - N-, is anomalous.
//  4. WHAT IT KEEPS AND COSTS. Kept exactly: J (so the halves stay apart and E-SPN-0165's theorems still hold: the whole
//     system's det winding stays 0, the anomaly can only appear as flow between walls); the massless point (at u = -1
//     the Wilson units are 1 and the schedule IS E-SPN-0160's, so c0 = c/4, gamma = 0); the curvature's isotropy (W is
//     isotropic at order K^2, the roots being a 2-design); the top speed c/4. At rest T = 1, so the Wilson member at rest
//     is E-SPN-0160's member of mass m0 with its unit conjugated, and E-SPN-0164's rest asymmetry (even in the vertex,
//     odd in V, kept by complex conjugation) is exactly reversed: A_S(1) = +3047158125 / 10851569165584. COST: the mass's
//     K^2 term lowers the singlet's curvature by about m0 (M + m0), so R exceeds tan m / m at second order in the masses.
//  5. E . B. On the q = 3 magnetic supercell the field is exact in Z[omega] only at flux 1/3 per unit (B = 2 pi / 3):
//     the ring holds sixth roots of unity alone. Its magnetic length, 1 / sqrt B = 0.69, is shorter than the inversion
//     radius (W = 12 at |K| near 0.71), so the field mixes K = 0 with the doublers and averages the Wilson mass to about
//     zero: the Wilson bulk's pi gap collapses in the field while the trivial bulk's does not, and the two walls'
//     lowest Landau levels hybridize across the slab. PREDICTED (after probes 7 and 8, disclosed): no per-wall flow is
//     resolvable at the exact field; G false.
//
// GATES (fixed before the gate run):
//  W1 EXACT AND COVARIANT. Every unit a ring unit (norm exact); conj u^2 = ringUnit(-2k, -2j) (the symmetric v); Q_S Q_D
//     = 0 exactly and 2P+ commutes with both (integer matrices); every piece unitary (1e-13); the symmetric schedule
//     commutes with all 1,152 elements of W(F4) (1e-13); the chiral variant with the 576 rotations (1e-13) and not with a
//     reflection (a departure above 1e-3).
//  W2 THE WILSON MASS AT THE ZEROS. On the 72 zeros of s (grid 12), both halves, the light and the symmetric heavy
//     construction: the singlet's Floquet offset from pi (its weight summed over each degenerate eigenphase cluster in
//     the Dirac window) is negative at K = 0 and positive at all 71 doublers; the pi gap over a Weyl sample of 512 is at
//     least 0.1. The uniform mass (Wilson off) is positive at all 72 (the control of point 2).
//  W3 C2 BY THE ZEROS. -1 per copy for both constructions and both halves; 0 for the uniform mass.
//  W4 THE WALL. The symmetric heavy slab (L = 12, half Wilson): per half 8 in-gap states at husk k = 0, split 4 and 4 by
//     the depth projector (weights above 0.99 and below 0.01); each wall's net chirality within 1e-3 of +-2; wall A
//     opposite wall B; half 0's wall A opposite half 1's; the cone isotropic (its three speeds equal to 1e-6). The chiral
//     variant: the Wilson half the same, the other half 0 in-gap states.
//  W5 WHAT IT KEEPS. The light construction: the rest spectrum 8 at pi - m0, 8 at pi + m0, 176 at 0 (1e-10); the
//     curvature isotropic over 4 directions (1e-9); the fastest band at most c/4 (1 + 1e-6); the massless point's pieces
//     equal E-SPN-0160's (1e-15) with c0 / (c/4) - 1 and gamma below 1e-9; the rest asymmetry with E-SPN-0164's masses
//     conjugated equals +3047158125 / 10851569165584 exactly.
//  W6 THE EXACT FIELD WASHES OUT THE INVERSION (predicted after probes). On the q = 3, p = 1 field (L = 2, no wall), the
//     Wilson bulk's smallest |phase - pi| over 6 values of k2 is at most 0.02 while the trivial bulk's is at least 0.7,
//     and without the field both are at least 0.45.
//  G A PER-WALL MEMBER-NUMBER FLOW AT THE EXACT FIELD (predicted false): not resolvable, since W6 holds.
//  Instrument. I1 the reduction: |(1 - B B^dag) U B| at most 1e-12 on every slab read. I2 on the one-class slab the
//     reduced spectrum and the zeros make up E-SPN-0165's half cycle (1e-12). I3 the Cayley eigensolver's residual at
//     most 1e-10.
//  Controls. C1 the Wilson-off pieces equal E-SPN-0160's registerPiece bit for bit. C2 a pure gauge on the magnetic slab
//     moves no level (1e-11). C3 E-SPN-0165's threaded-flux det winding is still 0 per half with the Wilson pieces
//     (theorem 2 holds for any J-keeping pieces), and its chiral-stream positive control winds -96. C4 E-SPN-0164's
//     A_S(1) = -3047158125 / 10851569165584 reproduced exactly.
//  READ, gating nothing: R against tan m / m for the constructions (the cost, against m0 (M + m0)); the wall's Weyl speed
//  against c/4; the pair census of the light construction; the lowest in-gap pair of the L = 12 magnetic slab at k2 =
//  0.3 (which level leans to wall A) for half 0 and half 1 at p = 1, half 0 at p = 2, and at p = 0.
//
// PROBES, disclosed: tmp/wil-probe1.log (plain lattice, the Wilson schedule v = conj u^2, u = (-1, 4) and (-2, 5): singlet
//  offsets -M at K = 0 and +M, +0.287 / +0.494, +0.356 / +0.682, +0.367 / +0.715 at W = 24, 32, 28, 27; zero-count C2 -1
//  in both halves; pi gap 0.326 / 0.542; its partner reading by a single eigenvector was wrong inside degenerate spaces,
//  an instrument flaw fixed by the cluster weights). tmp/wil-probe1b.log (the cluster weights: uniform signs + at all 72,
//  C2 0; Wilson - at K = 0, + at every doubler, C2 -1; at the doublers the partner is T D, not D, which sits at phase 0,
//  so the mass is read from the singlet alone). tmp/wil-probe2.log (the plain slab, L = 12: leak 1.5e-15, 8 in-gap states
//  per half at k = 0, a cone +-0.6225 per unit k per cycle along x0, x1, x2). tmp/wil-probe3.log (the walls' chirality:
//  symmetric half 0 A +2 B -2, half 1 A -2 B +2; chiral variant half 0 as symmetric, half 1 no in-gap states; speed 0.311
//  per beat). tmp/wil-probe4.log (one magnetic step at L = 6 and 8: 1.4 s and 3.7 s). tmp/wil-probe5.log (an E . B loop
//  at L = 6: no crossing, the walls' A weights 0.68). tmp/wil-probe6.log (unitarity 3.8e-15, covariance 1.7e-18, rest
//  8 + 8 + 176, R 1.771 against tan m / m 1.012 for u = (-1, 4), v = conj u^2). tmp/wil-probe7.log (the L = 12 magnetic
//  slab: the lowest pair +-0.129 at k2 = 0, the upper leaning to wall A, 0.65 to 0.71, as k2 grows). tmp/wil-probe8.log
//  (the field's bulk gaps: Wilson 0.0051 at k2 = 0 in the field, 0.61 without; trivial 0.76 either way; the L = 12 slab's
//  smallest |phase - pi| over a k2 loop 0.129). tmp/wil-probe9.log (the light construction u = (-2, 5), v = (-3, 1): m0
//  0.193, C2 -1, R 1.335). tmp/wil-probe10.log (R - 1 against m0 (M + m0) over four exact pairs: 0.335 / 0.184, 0.197 /
//  0.111, 0.122 / 0.071, 0.042 / 0.027). Points 1 to 4 were derived before probe 1; point 5, W6 and G were written after
//  probes 7 and 8; the light construction's choice (the smallest R cost of probe 10) after probe 10. tmp/wil-smoke.log
//  (every code path on a small plan, 605 s): W4 missed at L = 8 (the two walls hybridize on so short a slab, depth
//  weights 0.16 against 0.998) and C3's positive control read 0 and 1 at 96 and 97 steps (a winding of 96 aliases
//  there, E-SPN-0165's known flaw); both are the small plan, and the gate plan's L = 12 and 480 / 481 steps were fixed
//  before it. It also READ the light construction's pair census OPEN (10,492 crossings, B* 0) and the heavy symmetric
//  construction's R negative (-1.61): the Wilson mass reopens a pair channel that E-SPN-0160 had closed. Neither gates
//  anything; both are reported. No gate changed after the smoke run.
//
// FIRST RUN (tmp/wil-exp-run1.log, 1,237 s): FAIL on W4's isotropy clause only, everything else as derived. W1 units
//  exact, unitary 1.1e-15, covariant under 1,152 6.9e-18, chiral variant under the 576 rotations 6.9e-18 and off a
//  reflection 4.2e-2. W2 72 zeros, the singlet's offset -m0 at K = 0 and positive at all 71 doublers in both
//  constructions and halves (light: -0.0936 at K = 0; 0.1931, 0.1607, 0.1850, 0.1886 at W = 24, 32, 28, 27), pi gaps
//  0.190 and 0.542, the uniform mass positive at all 72. W3 C2 -1 per copy in all four, uniform 0. W4 the walls (L = 12):
//  8 in-gap states per half at k = 0, split 4 and 4 (depth weights 0.9967 and 0.0033), net chirality A +2.0000 B -2.0000
//  in half 0, A -2.0000 B +2.0000 in half 1, the chiral variant +2 / -2 in the Wilson half with 0 in-gap states in the
//  other; but the cone's three speeds per cycle read 0.62248 / 0.62247 / 0.62248, equal to 1.6e-5, against the
//  pre-registered 1e-6. The symmetric difference at K_STEP 0.01 carries an O(k^2) error near 1e-4, so the tolerance was
//  below the instrument's resolution; it was fixed before the run and is kept as a fail. Weyl speed 0.880 of c/4. W5 rest
//  8 + 8 + 176, isotropy 7.7e-12, fastest band 0.858 of c/4, the massless pieces 1.0e-17 from E-SPN-0160's, the rest
//  asymmetry with the masses conjugated +3047158125 / 10851569165584 exactly. W6 the q = 3 field's Wilson bulk gap 0.0051
//  against 0.4955 free, the trivial 0.7606 and 0.7609. G false. I1 leak 5.6e-15, I2 1.8e-15, I3 2.6e-14. C1 bit for bit,
//  C2 8.0e-15, C3 Wilson windings 1.4e-16 and the chiral stream -96.0000 at 480 and 481, C4 exact. Read: R 1.0424 against
//  tan m/m 1.0007 for the light construction (m0 0.0936, M 0.1931), 1.7714 for u = (-1, 4), -1.61 for the heavy
//  symmetric one; the light census OPEN, 10,492 crossings; the L = 12 field slab's lowest pair at k2 0.3 leans 0.71 to
//  wall A above pi and 0.30 below in half 0, the reverse in half 1, and splits evenly (0.53) at p = 0.
//
// DETERMINISM: no random numbers (grids and Weyl sequences). EXACT: the projectors (integers and dyadics), the ring units,
// E-SPN-0164's rest asymmetry (Eisenstein rationals). Floats elsewhere, as measurement. NOTHING MOVES: a slot takes its
// neighbor's value; the Wilson mixers act on a dock's own register.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle, unitNormExact } from '@/code/measure/swap-string'
import { DOCK_ROOTS, wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import { cycleBand, cyclePhases } from '@/code/measure/swap-cone'
import { radialPaths, restFrame } from '@/code/measure/two-beat'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { cycleMasslessPairN, f4Group, frameRN, matMul, pairCensusN, partnerProjector48, rangeBasis, REGISTER_ROOTS, registerPiece, scaled, singletProjector24, type GroupElement } from '@/code/measure/spinor-register'
import { chirality2, det4, sectorBasis, sectorBlock, trimaximal, volumeRight } from '@/code/measure/chiral-register'
import { chernFromZeros, halfCycle, halfPieces, halfPhases, scanZeros, windingOfDet, type Zero } from '@/code/measure/chiral-flow'
import { qw, qwAdd, qwDiag, qwFromEisQMatrix, qwFromUnit, qwIsZero, qwMul, qwSub, QW_ZERO, type QW, type QWMatrix } from '@/code/measure/flavor-register'
import { exchangeCount, fockGamma, fockStates, qwMatMulSq, unitPower } from '@/code/measure/register-many-body'
import { branchBeat, holeImage, pairRate, type FockVector } from '@/code/measure/sea-conjugation'
import { clusterWeights, eigenResidual, slabReduced, unitaryEigen, wallChirality, wilsonSchedule, windowLevels, type HalfSet, type Slab } from '@/code/measure/wilson-register'

const C_QUARTER = Math.SQRT2 / 4
const HEAVY: readonly [number, number] = [-2, 5]
const LIGHT_U: readonly [number, number] = [5, 0]
const LIGHT_V: readonly [number, number] = [-2, 1]
const E0160_U: readonly [number, number] = [-1, 4]
const MASSLESS: readonly [number, number] = [0, 3]
const FLAVOR_UNITS: readonly (readonly [number, number])[] = [
  [2, 2],
  [-1, 4],
  [-4, 0],
]
const RECORDED_AS1 = qw(-3047158125n, 0n, 10851569165584n)
const PREDICTED_AS1 = qw(3047158125n, 0n, 10851569165584n)
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GEN_RAW = [0.29, 0.52, 0.8, 0]
const DIRS: readonly number[][] = [[1, 0, 0, 0], [s2, s2, 0, 0], [s3, s3, s3, 0], GEN_RAW.map(x => x / Math.hypot(...GEN_RAW))]
const SCALES: readonly number[] = [0.1, 0.2, 0.3, 0.4, 0.5]
const WINDOW_GAP = 0.1
const K_STEP = 0.01
const FIELD_K2: readonly number[] = [0, 0.4, 0.8, 1.6, 2.4, Math.PI]

export type WilsonPlan = { grid: number; gapMomenta: number; wallL: number; fieldL: number; speedMomenta: number; censusSteps: number; windingSteps: number; controlSteps: readonly number[] }

export const GATE_PLAN: WilsonPlan = { grid: 12, gapMomenta: 512, wallL: 12, fieldL: 12, speedMomenta: 256, censusSteps: 120, windingSteps: 48, controlSteps: [480, 481] }

const flag = (b: boolean): number => (b ? 1 : 0)
const unitValue = (k: number, j: number): [number, number] => {
  const t = unitAngle(ringUnit(k, j))

  return [Math.cos(t), Math.sin(t)]
}

export default experiment({
  id: 'spin/wilson-wall',
  code: 'E-SPN-0166',
  title:
    'a Wilson mass on the register makes the husk a domain wall with a chiral doublet on each face, partial (the E . B flow is not resolvable at the only fields the ring holds exactly): a singlet mixer in beat 2 and a partner mixer in beat 1, both ring units, are seen through the stream only as c(K) = 1 - W(K)/24, an exact Wilson term that inverts the rest mass and keeps every doubler normal, covariant under all of W(F4); the second Chern number by the zeros is -1 per copy, and the register right SU(2) that commutes with every piece makes each level a doublet, so a slab with a Wilson side and an E-SPN-0160 side carries on each wall two Weyl cones of one chirality per half (net chirality +-2), opposite at the two walls and between the halves, and with the Wilson pieces on one half only, one face gains net chirality 2 and its member number becomes anomalous; J, the massless point, the curvature isotropy and the top speed c/4 are kept, E-SPN-0164 C and CP violation holds with its sign reversed, and the inertia pays about 1.7 m0 (M + m0); the exact field, flux 1/3, has a magnetic length shorter than the inversion radius and washes the Wilson gap out, so no per-wall flow shows',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return wilsonWallRun(GATE_PLAN)
  },
})

// covariance of a 192 piece under a list of W(F4) elements: the largest |g P - P g| entry
function covarianceGap(P: CMatrix, group: readonly GroupElement[]): number {
  const n = 192
  let worst = 0

  for (const g of group) {
    for (let d = 0; d < 24; d++) {
      for (let e = 0; e < 24; e++) {
        const sd = g.slots[d] as number
        const se = g.slots[e] as number

        for (let a = 0; a < 8; a++) {
          for (let c = 0; c < 8; c++) {
            let lr = 0
            let li = 0
            let rr = 0
            let ri = 0

            for (let b = 0; b < 8; b++) {
              const ga = (g.register[a] as number[])[b] as number
              const gc = (g.register[b] as number[])[c] as number

              lr += ga * (P.re[(d * 8 + b) * n + e * 8 + c] as number)
              li += ga * (P.im[(d * 8 + b) * n + e * 8 + c] as number)
              rr += (P.re[(sd * 8 + a) * n + se * 8 + b] as number) * gc
              ri += (P.im[(sd * 8 + a) * n + se * 8 + b] as number) * gc
            }
            worst = Math.max(worst, Math.abs(lr - rr), Math.abs(li - ri))
          }
        }
      }
    }
  }

  return worst
}

function unitarityGap(P: CMatrix): number {
  const n = 192
  let worst = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let r = 0
      let im = 0

      for (let k = 0; k < n; k++) {
        r += (P.re[k * n + i] as number) * (P.re[k * n + j] as number) + (P.im[k * n + i] as number) * (P.im[k * n + j] as number)
        im += (P.re[k * n + i] as number) * (P.im[k * n + j] as number) - (P.im[k * n + i] as number) * (P.re[k * n + j] as number)
      }
      worst = Math.max(worst, Math.abs(r - (i === j ? 1 : 0)), Math.abs(im))
    }
  }

  return worst
}

export function wilsonWallRun(plan: WilsonPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const qS = scaled(S24, 24)
  const qD = scaled(D48, 48)
  const J = volumeRight()
  const P2plus = chirality2(J, 1)
  const pPlus = scaled(P2plus, 2)
  const basis = sectorBasis(J)
  const group = f4Group()
  const rotations = group.filter(g => det4(g.matrix) === 1)
  const reflection = group.find(g => det4(g.matrix) === -1) as GroupElement
  const ang = (kj: readonly [number, number]): number => unitAngle(ringUnit(kj[0], kj[1]))
  const thetaH = ang(HEAVY)
  const thetaL = ang(LIGHT_U)
  const thetaLV = ang(LIGHT_V)
  const MH = wrap(thetaH - Math.PI)
  const ML = wrap(thetaL - Math.PI)
  const m0L = -(ML + thetaLV)
  const uH = unitValue(HEAVY[0], HEAVY[1])
  const uL = unitValue(LIGHT_U[0], LIGHT_U[1])
  const vL = unitValue(LIGHT_V[0], LIGHT_V[1])
  const heavy = wilsonSchedule(qS, qD, uH, { wilson: true })
  const light = wilsonSchedule(qS, qD, uL, { wilson: true, v: vL })
  const chiral = wilsonSchedule(qS, qD, uH, { wilson: true, half: pPlus })
  const trivialH = wilsonSchedule(qS, qD, uH, { wilson: false })
  const trivialL = wilsonSchedule(qS, qD, uL, { wilson: false })

  // ---------------- W1: exact and covariant ----------------
  const unitsExact = [HEAVY, LIGHT_U, LIGHT_V, [2 * HEAVY[0], 2 * HEAVY[1]] as const, [-2 * HEAVY[0], -2 * HEAVY[1]] as const].every(([k, j]) => unitNormExact(ringUnit(k, j)))
  const symmetricV = Math.abs(wrap(ang([-2 * HEAVY[0], -2 * HEAVY[1]]) + 2 * thetaH)) <= 1e-12
  const orthogonal = matMul(S24, D48).every(x => x === 0)
  const commuteS = matMul(S24, P2plus).every((x, i) => x === (matMul(P2plus, S24)[i] as number))
  const commuteD = matMul(D48, P2plus).every((x, i) => x === (matMul(P2plus, D48)[i] as number))
  const unitary = Math.max(...[...heavy, ...light, ...chiral].map(unitarityGap))
  const covSym = Math.max(...[...heavy, ...light].map(P => covarianceGap(P, group)))
  const covChiralRot = Math.max(...chiral.map(P => covarianceGap(P, rotations)))
  const covChiralRef = Math.max(...chiral.map(P => covarianceGap(P, [reflection])))
  const W1 = unitsExact && symmetricV && orthogonal && commuteS && commuteD && unitary <= 1e-13 && covSym <= 1e-13 && covChiralRot <= 1e-13 && covChiralRef > 1e-3

  log('W1')

  // ---------------- W2, W3: the mass at the zeros, and C2 ----------------
  const zeros = scanZeros(plan.grid).zeros
  let worstResidual = 0
  const massesAt = (P192: CMatrix[], half: 0 | 1): number[] => {
    const pieces = halfPieces(P192, basis, half).pieces
    const QS = sectorBlock({ re: qS, im: new Float64Array(qS.length) }, basis, half).block.re

    return zeros.map((z, i) => {
      const { U, n } = halfCycle(pieces, { q: 1, p: 0 }, z.K)
      const e = unitaryEigen(U, n)

      if (i % 12 === 0) worstResidual = Math.max(worstResidual, eigenResidual(U, e))

      const cs = clusterWeights(e, QS, 1e-7).filter(c => Math.abs(wrap(c.phase - Math.PI)) < Math.PI / 2)

      return cs.reduce((s, c) => s + c.weight * wrap(c.phase - Math.PI), 0) / cs.reduce((s, c) => s + c.weight, 0)
    })
  }
  const piGap = (P192: CMatrix[], half: 0 | 1): number => {
    const pieces = halfPieces(P192, basis, half).pieces
    let g = Math.PI

    for (const K of weylMomenta(plan.gapMomenta)) for (const ph of halfPhases(pieces, { q: 1, p: 0 }, K)) g = Math.min(g, Math.abs(wrap(ph - Math.PI)))

    return g
  }
  const isRest = (z: Zero): boolean => Math.abs(z.wilson) < 1e-9
  const readings = [
    { name: 'light', P: light },
    { name: 'heavy', P: heavy },
  ].flatMap(c =>
    ([0, 1] as const).map(half => {
      const masses = massesAt(c.P, half)

      return { name: c.name, half, masses, c2: chernFromZeros(zeros, masses), gap: piGap(c.P, half) }
    }),
  )
  const uniform = massesAt(trivialL, 0)
  const uniformC2 = chernFromZeros(zeros, uniform)
  const W2 =
    zeros.length === 72 &&
    readings.every(r => r.masses.every((m, i) => (isRest(zeros[i] as Zero) ? m < 0 : m > 0)) && r.gap >= WINDOW_GAP) &&
    uniform.every(m => m > 0)
  const W3 = readings.every(r => r.c2 === -1) && uniformC2 === 0

  log('W2 W3')

  // ---------------- W4: the walls ----------------
  const halfSets = (P: CMatrix[], half: 0 | 1, triv: CMatrix[]): HalfSet[] => [{ pieces: halfPieces(triv, basis, half).pieces }, { pieces: halfPieces(P, basis, half).pieces }]
  const ranges = (half: 0 | 1): { sR: number[][]; dR: number[][] } => ({
    sR: rangeBasis(sectorBlock({ re: qS, im: new Float64Array(qS.length) }, basis, half).block.re, 96),
    dR: rangeBasis(sectorBlock({ re: qD, im: new Float64Array(qD.length) }, basis, half).block.re, 96),
  })
  const L = plan.wallL
  const wallSlab: Slab = { L, qa: 1, p: 0, profile: Array.from({ length: L }, (_, c) => (c < L / 2 ? 1 : 0)) }
  const aDepths = new Set([L / 2 - 3, L / 2 - 2, L / 2 - 1, L / 2, L / 2 + 1, L / 2 + 2].map(c => ((c % L) + L) % L))
  const wall = (P: CMatrix[], half: 0 | 1) => {
    const r = ranges(half)

    return wallChirality(wallSlab, halfSets(P, half, trivialH), DOCK_ROOTS, r.sR, r.dR, aDepths, K_STEP, WINDOW_GAP)
  }
  const sym = [wall(heavy, 0), wall(heavy, 1)] as const
  const chi = [wall(chiral, 0), wall(chiral, 1)] as const
  const splitOk = (w: ReturnType<typeof wall>): boolean => w.inGap === 8 && w.weights.filter(x => x > 0.99).length === 4 && w.weights.filter(x => x < 0.01).length === 4
  const chirOf = (w: ReturnType<typeof wall>, i: number): number => (w.walls[i] as { chirality: number }).chirality
  const isoOf = (w: ReturnType<typeof wall>): number => Math.max(...w.walls.map(x => (x.states ? Math.max(...x.speeds) / Math.min(...x.speeds) - 1 : 0)))
  const two = (x: number): boolean => Math.abs(Math.abs(x) - 2) <= 1e-3
  const W4 =
    sym.every(splitOk) &&
    sym.every(w => two(chirOf(w, 0)) && two(chirOf(w, 1)) && Math.sign(chirOf(w, 0)) === -Math.sign(chirOf(w, 1))) &&
    Math.sign(chirOf(sym[0], 0)) === -Math.sign(chirOf(sym[1], 0)) &&
    sym.every(w => isoOf(w) <= 1e-6) &&
    splitOk(chi[0]) &&
    Math.abs(chirOf(chi[0], 0) - chirOf(sym[0], 0)) <= 1e-3 &&
    chi[1].inGap === 0
  const weylSpeed = (((sym[0].walls[0] as { speeds: number[] }).speeds[0] as number) / 2) / C_QUARTER

  log('W4')

  // ---------------- W5: what it keeps ----------------
  const restL = cyclePhases(light, REGISTER_ROOTS, [0, 0, 0, 0])
  const sRest = wrap(Math.PI - m0L)
  const dRest = wrap(Math.PI + m0L)
  const count = (ph: number): number => restL.filter(x => Math.abs(wrap(x - ph)) <= 1e-10).length
  const restOk = count(sRest) === 8 && count(dRest) === 8 && count(0) === 176
  const frameL = restFrame(sRest, dRest, -m0L)
  const fits = DIRS.map(d => frameRN(light, frameL, sRest, d, C_QUARTER, SCALES, REGISTER_ROOTS))
  const isotropy = Math.max(...fits.map(f => Math.abs(f.c2 / (fits[0] as { c2: number }).c2 - 1)))
  let top = 0

  for (const K of [...weylMomenta(plan.speedMomenta), ...DIRS.flatMap(d => [0.01, 0.1, 0.3, 1, 2].map(r => d.map(x => x * r)))]) top = Math.max(top, ...cycleBand(light, REGISTER_ROOTS, K).velocity.map(v => Math.hypot(...v)))

  const uz = unitValue(MASSLESS[0], MASSLESS[1])
  const PZ = wilsonSchedule(qS, qD, uz, { wilson: true })
  const PZ0 = [registerPiece(qS, uz), registerPiece(qD, [uz[0], -uz[1]])]
  let masslessGap = 0

  PZ.forEach((P, b) => {
    const Q = PZ0[b] as CMatrix

    for (let i = 0; i < P.re.length; i++) masslessGap = Math.max(masslessGap, Math.abs((P.re[i] as number) - (Q.re[i] as number)), Math.abs((P.im[i] as number) - (Q.im[i] as number)))
  })

  const pairs = DIRS.map(d => cycleMasslessPairN(PZ, Math.PI, d, 0.01, REGISTER_ROOTS))
  const masslessOk = masslessGap <= 1e-15 && pairs.every(x => Math.abs(x.c0 / C_QUARTER - 1) <= 1e-9 && Math.abs(x.gamma) <= 1e-9)
  // E-SPN-0164's rest asymmetry, and with every flavor mass conjugated
  const V = qwFromEisQMatrix(trimaximal())
  const vtx = qwFromUnit(ringUnit(2, 0))
  const Pex = (unitPower(exchangeCount(2, 3), [0, 2, 3, 4, 6, 8, 12], vtx) as { U: QWMatrix }).U
  const four = fockStates(6, 4)
  const dense = (U: QWMatrix, block: readonly number[]) => (x: FockVector): FockVector => {
    const out: FockVector = new Map()

    for (const to of block) {
      let s = QW_ZERO

      for (const [from, a] of x) {
        const w = (U[to] as QW[])[from] as QW

        if (!qwIsZero(w)) s = qwAdd(s, qwMul(w, a))
      }
      if (!qwIsZero(s)) out.set(to, s)
    }

    return out
  }
  const asym = (units: readonly (readonly [number, number])[]): QW => {
    const D = qwDiag(units.map(([a, b]) => qwFromUnit(ringUnit(a, b))))
    const US = qwMatMulSq(qwMatMulSq(Pex, fockGamma(branchBeat(V, D, 'S'))), Pex)
    const rate = (a: number, b: number): QW[] => pairRate(dense(US, four), x => holeImage(x, 6), -1, a, b, 1)

    return qwSub(rate(0, 1)[0] as QW, rate(1, 0)[0] as QW)
  }
  const a0 = asym(FLAVOR_UNITS)
  const a1 = asym(FLAVOR_UNITS.map(([a, b]) => [-a, -b] as const))
  const conjUnits = FLAVOR_UNITS.every(([a, b]) => Math.abs(wrap(ang([-a, -b]) + ang([a, b]))) <= 1e-12)
  const C4 = qwIsZero(qwSub(a0, RECORDED_AS1))
  const W5 = restOk && isotropy <= 1e-9 && top / C_QUARTER <= 1 + 1e-6 && masslessOk && conjUnits && qwIsZero(qwSub(a1, PREDICTED_AS1))

  log('W5')

  // ---------------- W6 and G: the exact field ----------------
  const halfH = halfSets(heavy, 0, trivialH)
  const r0 = ranges(0)
  const minGapAt = (s: Slab, sets: readonly HalfSet[], K: number[]): { gap: number; leak: number } => {
    const red = slabReduced(s, sets, K, DOCK_ROOTS, r0.sR, r0.dR)
    const e = complexEigenvalues({ re: red.U.re, im: red.U.im, n: red.d })

    return { gap: Math.min(...e.re.map((x, i) => Math.abs(wrap(Math.atan2(e.im[i] as number, x) - Math.PI)))), leak: red.leak }
  }
  let worstLeak = 0
  const bulk = (profile: number[], p: number): number =>
    Math.min(
      ...FIELD_K2.map(k2 => {
        const r = minGapAt({ L: 2, qa: 3, p, profile }, halfH, [0.1, 0.05, k2, 0])

        worstLeak = Math.max(worstLeak, r.leak)

        return r.gap
      }),
    )
  const bulkWilsonField = bulk([1, 1], 1)
  const bulkWilsonFree = bulk([1, 1], 0)
  const bulkTrivialField = bulk([0, 0], 1)
  const bulkTrivialFree = bulk([0, 0], 0)
  const W6 = bulkWilsonField <= 0.02 && bulkTrivialField >= 0.7 && bulkWilsonFree >= 0.45 && bulkTrivialFree >= 0.45
  const G = !W6

  log('W6')

  // the lowest in-gap pair of the L = fieldL magnetic slab at k2 = 0.3 (read)
  const FL = plan.fieldL
  const fieldADepths = new Set(Array.from({ length: FL / 2 }, (_, i) => (((FL / 4 + i) % FL) + FL) % FL))
  const branch = (half: 0 | 1, p: number): string => {
    const sets = halfSets(heavy, half, trivialH)
    const r = ranges(half)
    const slab: Slab = { L: FL, qa: 3, p, profile: Array.from({ length: FL }, (_, c) => (c < FL / 2 ? 1 : 0)) }
    const red = slabReduced(slab, sets, [0.1, 0.05, 0.3, 0], DOCK_ROOTS, r.sR, r.dR)

    worstLeak = Math.max(worstLeak, red.leak)

    const e = complexEigenvalues({ re: red.U.re, im: red.U.im, n: red.d })
    const phases = e.re.map((x, i) => Math.atan2(e.im[i] as number, x))
    const lv = windowLevels(slab, red, phases, Math.PI, 0.3, fieldADepths).sort((a, b) => Math.abs(wrap(a.phase - Math.PI)) - Math.abs(wrap(b.phase - Math.PI)))

    return lv
      .slice(0, 4)
      .map(l => `${wrap(l.phase - Math.PI).toFixed(4)}/${l.wallA.toFixed(2)}`)
      .join(' ')
  }
  const branches = [
    { at: 'half 0 p 1', read: branch(0, 1) },
    { at: 'half 1 p 1', read: branch(1, 1) },
    { at: 'half 0 p 2', read: branch(0, 2) },
    { at: 'half 0 p 0', read: branch(0, 0) },
  ]

  log('branches')

  // ---------------- instrument ----------------
  // I1: every slab read's leak (the walls' and the field's)
  const I1 = worstLeak <= 1e-12
  // I2: the one-class slab against E-SPN-0165's half cycle
  const oneClass: Slab = { L: 1, qa: 1, p: 0, profile: [1] }
  const Kc = [0.37, -0.21, 0.83, 0.4]
  const red1 = slabReduced(oneClass, halfH, Kc, DOCK_ROOTS, r0.sR, r0.dR)
  const e1 = complexEigenvalues({ re: red1.U.re, im: red1.U.im, n: red1.d })
  const reduced = [...e1.re.map((x, i) => Math.atan2(e1.im[i] as number, x)), ...Array(96 - red1.d).fill(0)].sort((a, b) => a - b)
  const full = [...halfPhases((halfH[1] as HalfSet).pieces as CMatrix[], { q: 1, p: 0 }, Kc)].sort((a, b) => a - b)
  const oneClassGap = Math.max(...full.map((x, i) => Math.abs(wrap(x - (reduced[i] as number)))))
  const I2 = full.length === reduced.length && oneClassGap <= 1e-12 && red1.leak <= 1e-12
  const I3 = worstResidual <= 1e-10

  // ---------------- controls ----------------
  // C1: the Wilson-off pieces are E-SPN-0160's, bit for bit
  const e0160 = [registerPiece(qS, uH), registerPiece(qD, [uH[0], -uH[1]])]
  const C1 = trivialH.every((P, b) => P.re.every((x, i) => x === ((e0160[b] as CMatrix).re[i] as number)) && P.im.every((x, i) => x === ((e0160[b] as CMatrix).im[i] as number)))
  // C2: a pure gauge on the magnetic slab
  const gslab: Slab = { L: 4, qa: 3, p: 1, profile: [1, 1, 0, 0] }
  const chiList = Array.from({ length: 12 }, (_, i) => 0.37 * i - 0.11 * i * i)
  const Kg = [0.2, -0.1, 0.7, 0]
  const sorted = (s: Slab): number[] => {
    const red = slabReduced(s, halfH, Kg, DOCK_ROOTS, r0.sR, r0.dR)
    const e = complexEigenvalues({ re: red.U.re, im: red.U.im, n: red.d })

    return e.re.map((x, i) => Math.atan2(e.im[i] as number, x)).sort((a, b) => a - b)
  }
  const bare = sorted(gslab)
  const gauged = sorted({ ...gslab, chi: chiList })
  const gaugeGap = bare.length === gauged.length ? Math.max(...bare.map((x, i) => Math.abs(wrap(x - (gauged[i] as number))))) : Infinity
  const C2 = gaugeGap <= 1e-11
  // C3: E-SPN-0165's theorem 2 with the Wilson pieces, and its positive control
  const windings = ([0, 1] as const).flatMap(half => {
    const pieces = halfPieces(heavy, basis, half).pieces

    return [
      [0.3, 0.1, 0],
      [1.1, -0.7, Math.PI],
    ].map(t => windingOfDet(s => halfCycle(pieces, { q: 1, p: 0 }, [t[0] as number, t[1] as number, 2 * Math.PI * s, t[2] as number]), plan.windingSteps).winding)
  })
  const ident = (n: number): CMatrix => {
    const re = new Float64Array(n * n)

    for (let i = 0; i < n; i++) re[i * n + i] = 1

    return { re, im: new Float64Array(n * n) }
  }
  const chiralRoots = DOCK_ROOTS.map(r => ((r[2] as number) < 0 ? r.map(x => -x) : [...r]))
  const positive = plan.controlSteps.map(steps => windingOfDet(s => halfCycle([ident(96), ident(96)], { q: 1, p: 0 }, [0.3, 0.1, 2 * Math.PI * s, 0], chiralRoots), steps).winding)
  const C3 = windings.every(w => Math.abs(w) < 1e-9) && positive.every(w => Math.abs(w + 96) < 1e-6)

  log('instrument and controls')

  // ---------------- reads ----------------
  const Rof = (P: CMatrix[], m0: number): number => {
    const sr = wrap(Math.PI - m0)

    return frameRN(P, restFrame(sr, wrap(Math.PI + m0), -m0), sr, [1, 0, 0, 0], C_QUARTER, SCALES, REGISTER_ROOTS).R
  }
  const e0160u = unitValue(E0160_U[0], E0160_U[1])
  const M0160 = wrap(ang(E0160_U) - Math.PI)
  const costs = [
    { name: `u (${LIGHT_U.join(',')}) v (${LIGHT_V.join(',')})`, M: ML, m0: m0L, R: fits[0]!.R },
    { name: `u (${HEAVY.join(',')}) v conj u^2`, M: MH, m0: MH, R: Rof(heavy, MH) },
    { name: `u (${E0160_U.join(',')}) v conj u^2`, M: M0160, m0: M0160, R: Rof(wilsonSchedule(qS, qD, e0160u, { wilson: true }), M0160) },
  ]
  const census = pairCensusN(light, frameL, radialPaths(DIRS, 3 * Math.PI, plan.censusSteps), weylMomenta(64), REGISTER_ROOTS)

  log('reads')

  const hard = W1 && W2 && W3 && W4 && W5 && W6
  const instrument = I1 && I2 && I3
  const controls = C1 && C2 && C3 && C4
  const status = !hard || !instrument || !controls ? 'fail' : G ? 'pass' : 'partial'
  const cost = costs.map(c => `${c.name}: M ${c.M.toFixed(4)} m0 ${c.m0.toFixed(4)} R ${c.R.toFixed(6)} tan m/m ${(Math.tan(c.m0 / 2) / (c.m0 / 2)).toFixed(6)} (R - 1 ${(c.R - 1).toFixed(4)}, m0 (M + m0) ${(c.m0 * (c.M + c.m0)).toFixed(4)})`).join('; ')

  return verdict({
    status,
    claim: `W1 ${W1} (units exact, Q_S Q_D = 0 and 2P+ commuting exactly, unitary ${unitary.toExponential(1)}, covariant under 1152 ${covSym.toExponential(1)}, chiral variant under 576 rotations ${covChiralRot.toExponential(1)} and not a reflection ${covChiralRef.toExponential(1)}); W2 ${W2} (72 zeros, the singlet's offset negative at K = 0 and positive at 71 doublers for both constructions and halves, pi gaps ${readings.map(r => r.gap.toFixed(4)).join(', ')}, uniform all positive); W3 ${W3} (C2 by the zeros ${readings.map(r => r.c2).join(', ')} per copy, uniform ${uniformC2}); W4 ${W4} (walls: symmetric net chirality A/B ${sym.map(w => `${chirOf(w, 0).toFixed(4)}/${chirOf(w, 1).toFixed(4)}`).join(' and ')}, chiral variant ${chi[0].walls.map(x => x.chirality.toFixed(4)).join('/')} with ${chi[1].inGap} in-gap states in the other half, Weyl speed ${weylSpeed.toFixed(6)} of c/4); W5 ${W5} (rest 8 + 8 + 176, isotropy ${isotropy.toExponential(1)}, fastest band ${(top / C_QUARTER).toFixed(9)} of c/4, massless pieces ${masslessGap.toExponential(1)} from E-SPN-0160's, rest asymmetry with the masses conjugated ${a1.a}/${a1.d}); W6 ${W6} (the q = 3 field's bulk pi gap: Wilson ${bulkWilsonField.toFixed(4)} against ${bulkWilsonFree.toFixed(4)} without the field, trivial ${bulkTrivialField.toFixed(4)} and ${bulkTrivialFree.toFixed(4)}); G ${G} (a per-wall flow at the exact field: predicted false); instrument I1 ${I1} (leak ${worstLeak.toExponential(1)}) I2 ${I2} (${oneClassGap.toExponential(1)}) I3 ${I3} (${worstResidual.toExponential(1)}); controls C1 ${C1} C2 ${C2} (${gaugeGap.toExponential(1)}) C3 ${C3} (Wilson windings ${Math.max(...windings.map(Math.abs)).toExponential(1)}, chiral stream ${positive.map(w => w.toFixed(4)).join(', ')}) C4 ${C4}; read: ${cost}`,
    metrics: {
      W1: flag(W1),
      W2: flag(W2),
      W3: flag(W3),
      W4: flag(W4),
      W5: flag(W5),
      W6: flag(W6),
      G: flag(G),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      C4: flag(C4),
      unitary,
      covSym,
      covChiralRot,
      covChiralRef,
      c2Light: (readings[0] as { c2: number }).c2,
      chiralityA0: chirOf(sym[0], 0),
      chiralityB0: chirOf(sym[0], 1),
      chiralityA1: chirOf(sym[1], 0),
      weylSpeed,
      isotropy,
      topOverQuarter: top / C_QUARTER,
      RLight: fits[0]!.R,
      bulkWilsonField,
      bulkTrivialField,
      worstLeak,
      oneClassGap,
      gaugeGap,
      censusCrossings: census.crossings,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2), C3: flag(C3), C4: flag(C4), instrument: flag(instrument) },
    notes: `L2. Light construction u = ringUnit(${LIGHT_U.join(', ')}) (doublers M ${ML.toFixed(6)}), v = ringUnit(${LIGHT_V.join(', ')}) (rest mass m0 ${m0L.toFixed(6)}); heavy symmetric u = ringUnit(${HEAVY.join(', ')}) (M ${MH.toFixed(6)}), v = conj u^2. Masses at one zero of each class, light half 0: ${[...new Map(zeros.map((z, i) => [`${z.wilson.toFixed(0)}`, ((readings[0] as { masses: number[] }).masses[i] as number).toFixed(4)])).entries()].map(([w, m]) => `W ${w}: ${m}`).join(', ')}. Walls (symmetric, L ${L}): in-gap ${sym.map(w => w.inGap).join(', ')}, depth weights ${sym[0].weights.map(x => x.toFixed(4)).join(' ')}, speeds per cycle ${sym[0].walls.map(x => x.speeds.map(v => v.toFixed(5)).join('/')).join(' ')}. The R cost: ${cost}. Light census: crossings ${census.crossings}, B* ${census.Bstar.toFixed(6)} (2 m0 ${(2 * m0L).toFixed(6)}). E-SPN-0164 A_S(1) ${a0.a}/${a0.d}, masses conjugated ${a1.a}/${a1.d}. The exact field, the L ${FL} slab's lowest pair at k2 0.3 (offset from pi / wall A weight): ${branches.map(b => `${b.at}: ${b.read}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
