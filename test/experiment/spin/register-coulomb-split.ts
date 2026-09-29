// DOES SPLITTING THE PULL AROUND THE STREAM MAKE THE HELD REGISTER PAIR MOVE WITH INERTIA EQUAL TO ITS ENERGY?
// (E-SPN-XXXX). E-SPN-0173 held a light register pair (m 0.427) with the husk light's Coulomb pull and read R = 8.46
// against the static formula's 1.23 at a_B 3.5, 16.45 against 1.31 at a_B 3. Its reading of the cause: a member moves
// only by passing to its partner T D, one link away, so every center-of-mass step crosses the pull's gradient, a
// first-order splitting error that a symmetric (Strang) split of the pull around the stream would remove. This file
// derives what that error is, builds the split (code/measure/register-coulomb-split), and measures R with it.
//
// DERIVED BEFORE ANY RUN (per cycle of two beats; a pair's eps its cycle phase; the member unit u = ringUnit(-5, 1)).
// 1. WHERE THE FIRST-ORDER ERROR IS, AND WHY IT CANNOT MAKE THE EXCESS. E-SPN-0173's cycle is U = P_DS P_SD M2' P_DD
//    M1 P_SS: the S S pull with beat 1's mixer, the D D pull with beat 2's, then the two cross pieces. P_SS commutes with
//    M1 (both are functions of Q_S (x) 1 and 1 (x) Q_S, the phase diagonal in the orthonormal S_x), P_DD with M2', and
//    beat 1's piece is exactly M1 P_SS (its Q_S (x) Q_S coefficient (u - 1)^2 + u^2 (e^(i phi) - 1) is register-meson's
//    beta). So P_SS U = V K P_SS with V = P_SS P_DS P_SD P_DD the whole pull and K = M2' M1 the free cycle: U is the
//    factored cycle V K, conjugated. Write V = e^(-i Phi) and K = e^(-i H). Then
//        V K = exp(-i (Phi + H) - (1/2) [Phi, H] + third order)
//    and the first-order term is the [V, K] the reading named: [Phi, H] = -i (v1 - v2) . grad Phi on the relative
//    dock, odd in the members' velocities, of size alpha |grad G| v, about alpha / a_B^3 a cycle. But it is exactly the
//    generator of a conjugation: e^(-i Phi / 2) (Phi + H) e^(i Phi / 2) = Phi + H - (i / 2) [Phi, H] + O(Phi^2 H), so
//        V K = e^(-i Phi / 2) exp(-i (Phi + H) + second order) e^(i Phi / 2),
//    and it moves no eigenphase, at any K. (Equivalently, <[Phi, H + Phi]> = 0 in any eigenstate: the virial
//    identity.) ITS PREDICTION FOR THE R EXCESS IS ZERO, of either sign, at every alpha and a_B. The measured excess is
//    not small and not first order: R minus the formula is 7.23 at a_B 3.5 and 15.15 at a_B 3, a power a_B^-4.8 (the
//    ratio R / formula - 1, 5.90 and 11.57, a_B^-4.4), the scaling of a contact term alpha |psi(0)|^2 ~ a_B^-4, which
//    lives where the pull is 2.5 rad a cycle, not in the gentle gradient a hydrogenic pair mostly sees (0.03 rad a link
//    at its mean radius 5).
// 2. THE STRANG SPLIT, AND WHAT IT CAN CHANGE. Every piece at half the phase (the count n in steps of the square-root
//    unit rho^(1/2), so two halves are rho^(-n) exactly), placed before and after the free cycle: U_s = V_h K V_h =
//    V_h^(-1) (V_h^2 K) V_h, conjugate to V_h^2 K. So the split's spectrum differs from the unsplit one ONLY as V_h^2
//    differs from V, the commutators of the four pieces among themselves (P_SS and P_DD share no sector, but Q_S and Q_D'
//    overlap through C(K), so these commutators are K-dependent and can move R). They are second order in the pull and
//    not small at contact: the remainder of the split is O([Phi_a, Phi_b]) and O([Phi, [Phi, H]]), which at 2.5 rad a
//    cycle at contact is not a small correction. Every piece is a sector-projector phase, so W (x) W stays exact, the
//    projectors are unchanged (covariant), the member band is untouched (with the light off the split cycle IS the free
//    cycle, bit for bit: C2), and no piece reaches the flats (the census closed). THE SPLIT CANNOT REMOVE A FIRST-ORDER
//    ERROR, because the first-order term is a similarity already. PREDICTED: it moves R by the pieces' commutator, a
//    fraction of R (the probes: -2% to -17%), and leaves the excess of order 7.
// 3. THE TRUE DOCK, AND WHETHER IT IS THE SPLIT. T D_y's content sits on y + r_d with weight |E_d eta|^2, and
//    sum_d r_d E_d^T E_d = 0 (the roots come in +- pairs and E_(-d) = -E_d): the D content's charge centroid IS its
//    label, so placing the pull at the true dock changes nothing at first order. It changes the second moment: the S D
//    pair's charge separation is y + r_d (one root stencil), the D D pair's y + r_d - r_e (two), and the pull on a spread
//    charge is the mean of G over them. G is the Green's function of the root Laplacian, so the one-stencil mean equals G
//    at every dock but contact and the two-stencil mean at every dock beyond one link: the true-dock pull is E-SPN-0173's
//    with a softer core in the D sectors (19 sites re-counted, the contact count 414 -> 87 at a_B 3.5). It is NOT the
//    split: the split reorders the pull in time, the true dock resamples it in space, and neither touches the first
//    order. PREDICTED: a core-sized change of R, of either sign.
// 4. THE CONTINUUM TARGET (E-SPN-0155, E-SPN-0169, as E-SPN-0173 point 5): R_static = (2 tan m + (5/3) E_b) / (2 m - E_b)
//    per beat at the level's own E_b, and R_full = R_static - (8/3) E_b S / (2 m - E_b), whose limit is tan m / m = 1.0656.
//    The formula's own neglected terms are O((E_b / 2 m)^2), about 1%, so the 10% band below is set by the lattice, not
//    by the formula.
// 5. THE REACH. a_B 8 needs a ball of radius ~29 (R / a_B 3.6), ~102,000 sites and about 45 s a split cycle on this
//    engine: out of reach here. The symmetry-reduced engine (spin/register-coulomb-weak, E-SPN-0175) reads the unsplit
//    pull there, and by point 2 the split differs from it only by the pieces' commutator, which falls as alpha^2.
//
// GATES, fixed before the gate run (GATE_PLAN: m 0.427029; seven points, each a coupling, a ball and a placement of the
// pull: a_B 3.5 on radius 12 split, unsplit and at the true docks; a_B 3 on radius 10 split and unsplit, these five with
// filters 128, 512, 1024; a_B 5 on radius 14 split and unsplit with filters 128, 512; K filter 128 throughout; hold 64
// cycles; the witness coordinate ball 7, full ball 6). Every comparison the gates make between the split and the unsplit
// pull is on one ball with one filter schedule, so the ball's truncation (R / a_B 3.4, 3.3 and 2.8) is common to both
// and E-SPN-0173's own numbers (radius 16 and 14, filters to 2048, K filter 256) are not compared with.
//  H0 THE WITNESS: (a) the free cycle against the full 192 x 192 rule's two beats (the pieces, the swap coin, the stream,
//     every shift reduced to the quotient) with every phase zero; (b) the two in-beat pull pieces at half the phase (P_SS
//     then P_DD) against the full rule's two beats with the mixer 1, T X P_DD T X P_SS on the lift against T X T X on the
//     lift of the coordinates' result. Each at K = 0 and (0.31, -0.17, 0.52, 0), an S S start at y = 0 over the whole full
//     ball and a generic start within the full ball's radius less 3: entries 1e-12, the coordinate norm kept to 1e-12, S S
//     weights equal to 1e-10. (The cross pieces are checked as exact projectors by E-SPN-0173's I3, unchanged here.)
//  H1 THE HOLD at the split main level: |lambda| >= 1 - 1e-6, residual <= 1e-3, over 64 cycles the norm's change at most
//     1e-3, fidelity at least 1 - 1e-2, the outermost shell at most 1e-5 of the weight.
//  H2 ISOTROPY: the split main level's K^2 coefficient along the axis and a generic husk direction within 1e-3.
//  H3 THE STATIC R: the split main level's R_static = c*^2 / (2 a E_L) within 10% of the formula at its own E_b.
//  H4 R WITH THE DARWIN EXCHANGE: the split main level's R_full within 0.05 of tan m / m.
//  H5 THE TREND: the split excess |R_static / formula - 1| falls from a_B 3 to 3.5 to 5.
//  H6 THE SPLIT REMOVES THE ERROR (the hypothesis this file tests): at every coupling the split excess over the formula
//     at most half the unsplit's, R_s - formula <= (R_c - formula) / 2.
// INSTRUMENT (a failure makes the verdict partial). I1 the member coordinates' 16 phases equal the Dirac band at 5
//  momenta to 1e-12. I2 the member R equals tan m / m to 1e-6, and P_SS U s against V K P_SS s (point 1's conjugacy) to
//  1e-12 relative, a generic start within radius 3 of a radius-8 ball. I3 the split cycle keeps the Gram norm to 1e-11
//  over one cycle (a start within radius 3 of a radius-14 ball). I4 the D content's centroid below 1e-15 and its smeared
//  pull equal to G beyond one link to 1e-12 (point 3).
// CONTROLS (a failure makes the verdict partial). C1 THE UNSPLIT PULL IS E-SPN-0173'S: the 'coulomb' form against
//  register-coulomb's coulombCycle bit for bit, three cycles, a generic start filling a radius-6 ball. C2 THE LIGHT OFF:
//  the split cycle with every count zero is the free cycle bit for bit (free members). C3 THE TRANSVERSE EXCHANGE OFF:
//  darwinR at S = 0 equals staticR exactly.
// READ, gating nothing: the true-dock R at a_B 3.5, each level's pieces' commutator |V_h^2 v - V v|, E_b against the
//  continuum, shares, shells, S.
// PREDICTED: H0 and H2 hold; H1 FAILS or sits at the edge (E-SPN-0173's main level failed it at 1.5e-3); H3 and H4 FAIL
//  (R of order 8 at a_B 3.5); H5 holds; H6 FAILS (the split moves R by a fraction). VERDICT PREDICTED: FAIL.
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/rcs-probe1.log (a_B 3.5, ball 8, filters 64 and 256, K filter 128): P_SS U
//  against V K P_SS 1.1e-15; the split with the light off equals the free cycle bit for bit; |V_h^2 x - V x| / max|x|
//  8.9e-2 on the hydrogenic start and 9.8e-2 on a generic one; 0.44, 0.65 and 0.96 s a cycle unsplit, factored and split
//  (under load); R static 26.69 unsplit, 26.16 factored (the same spectrum, a different filtered mixture), 27.00 split,
//  against the formula 1.26 (the ball truncated). tmp/rcs-probe2.log: the D content's centroid 6.9e-18; the one- and
//  two-stencil means of G equal G to 8e-15 beyond one link, 0.79 off at contact and 0.28 at one link (two stencils).
//  tmp/rcs-probe3.log (the true docks, ball 8, as probe 1): the S D count at contact 414 -> 87, 18 more D D sites
//  re-counted; R static 31.42 against 1.25. tmp/rcs-smoke.log (every code path on a radius-6 ball, filters 16 and 32,
//  gating nothing): split against unsplit R 8.01 / 9.63 (a_B 3.5), 2.88 / 3.22 (3), 2.01 / 2.08 (5), the pieces'
//  commutator on the levels 0.009 to 0.044, the true docks 9.26. It found two defects in the gates as first written,
//  fixed before the gate run: I3 read the split norm on a radius-8 ball, where one split cycle (up to eight links) reaches
//  the edge (6.3e-11), so it reads a radius-14 ball; the smoke's witness at coordinate 5 / full 4 reads the edge (4e-3,
//  norms to 6e-9) as E-SPN-0173's probe did, which is why the gate witnesses at 7 / 6. These probes set the prediction.
//  A FIRST GATE START WAS STOPPED on its cost, not its numbers: planned on balls 14, 12 and 18 with filters to 2048 and K
//  filter 256, it ran at 7.2 s a split cycle on the radius-12 ball (the machine shared with four other gate processes),
//  about 13 hours for its longest point. Its witness part finished (tmp/rcs-part-parts.json, kept: the witness, the
//  instrument and C1, C2 do not depend on the points) and one point had read one filter (a_B 3, split, filter 128: E
//  1.5730, residual 3.5e-2). Nothing else was seen. The plan above is the one restarted, with smaller balls and filters.
//
// Depth L2 (a two-body quantum walk of register members on the husk quotient with an integer-counted Coulomb phase split
// around the free cycle, in the exact coordinates of its invariant block, witnessed piece by piece against the full
// rule). DETERMINISM: no random numbers; placed starts, filtered levels, Weyl values. NOTHING MOVES: the pieces hand
// values between slots and register components of one dock, the stream takes each slot's value one dock along, the pull
// is a phase on the pair's sectors.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { staticR, darwinR } from '@/code/measure/darwin-exchange'
import { DOCK_ROOTS, wrap } from '@/code/measure/dock-mixer'
import { infiniteGreenZero } from '@/code/measure/husk-coulomb'
import { huskGreenTable, type GreenTable } from '@/code/measure/husk-meson'
import { blockShares, clonePair, inner, memberCycle, newPair, norm2, normalizePair, pairCycle, type PairState } from '@/code/measure/register-meson'
import { coulombCounts, coulombCycle, coulombEngine, densityS, fullBeatQ, fullGapQ, fullRuleQ, greenOf, huskRelBall, hydrogenStart, liftQ, shells, siteWeights, type CoulombCount } from '@/code/measure/register-coulomb'
import { applyPull, dockCounts, sectorPiece, splitCycle, splitEngine, splitFilter, splitRead, type SplitEngine, type SplitForm } from '@/code/measure/register-coulomb-split'
import { diracPhase, gammaMatrices } from '@/code/measure/spinor-register'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'

const LIGHT: readonly [number, number] = [-5, 1]
const UNIT: readonly [number, number] = [11, 5]
const C_STAR2 = 0.5
const GENERIC_RAW = [0.29, 0.52, 0.8]
const GENERIC = [...GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW)), 0]
const DIRS: readonly number[][] = [[1, 0, 0, 0], GENERIC]
const WITNESS_K: readonly number[][] = [
  [0, 0, 0, 0],
  [0.31, -0.17, 0.52, 0],
]
const I1_MOMENTA: readonly number[][] = [
  [0, 0, 0, 0],
  [0.3, 0.1, -0.2, 0],
  [1.1, -0.7, 0.4, 0],
  [2.5, 0.3, 0.3, 0],
  [0.01, 0, 0, 0],
]
const KAPPA = 0.04

// the gate tolerances (fixed before the gate run; see the header)
const ENTRY = 1e-12
const WEIGHT = 1e-10
const NORM = 1e-12
const LAMBDA = 1e-6
const RESIDUAL = 1e-3
const LOST = 1e-3
const FIDELITY = 1e-2
const EDGE = 1e-5
const ISOTROPY = 1e-3
const STATIC_BAND = 0.1
const FULL_BAND = 0.05
const HALF = 0.5
const I1_TOLERANCE = 1e-12
const I2_TOLERANCE = 1e-6
const I3_TOLERANCE = 1e-12
const I4_NORM = 1e-11
const I5_CENTROID = 1e-15
const I5_SMEAR = 1e-12

// one point of the gate plan: a coupling, a ball, the filters, and the placement of the pull it reads
export type SplitPoint = { name: string; aB: number; radius: number; filters: readonly number[]; kFilter: number; form: SplitForm; dock: boolean }

export type SplitPlan = { points: readonly SplitPoint[]; hold: number; witnessCoord: number; witnessFull: number; sTorus: number; main: number; weak: number; strong: number }

export const GATE_PLAN: SplitPlan = {
  points: [
    { name: 'main-strang', aB: 3.5, radius: 12, filters: [128, 512, 1024], kFilter: 128, form: 'strang', dock: false },
    { name: 'main-coulomb', aB: 3.5, radius: 12, filters: [128, 512, 1024], kFilter: 128, form: 'coulomb', dock: false },
    { name: 'main-dock', aB: 3.5, radius: 12, filters: [128, 512, 1024], kFilter: 128, form: 'coulomb', dock: true },
    { name: 'strong-strang', aB: 3, radius: 10, filters: [128, 512, 1024], kFilter: 128, form: 'strang', dock: false },
    { name: 'strong-coulomb', aB: 3, radius: 10, filters: [128, 512, 1024], kFilter: 128, form: 'coulomb', dock: false },
    { name: 'weak-strang', aB: 5, radius: 14, filters: [128, 512], kFilter: 128, form: 'strang', dock: false },
    { name: 'weak-coulomb', aB: 5, radius: 14, filters: [128, 512], kFilter: 128, form: 'coulomb', dock: false },
  ],
  hold: 64,
  witnessCoord: 7,
  witnessFull: 6,
  sTorus: 64,
  main: 3.5,
  weak: 5,
  strong: 3,
}

const flag = (b: boolean): number => (b ? 1 : 0)
const unitValue = (angle: number): [number, number] => [Math.cos(angle), Math.sin(angle)]

// the member, the unit, the Green's function
export type Setup = { u: [number, number]; M0: number; m: number; tanOver: number; theta: number; mu: number; aMember: number; G0: number; table: GreenTable; alphaOf: (aB: number) => number }

export function setup(): Setup {
  const theta0 = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u = unitValue(theta0)
  const M0 = wrap(theta0 - Math.PI)
  const m = M0 / 2
  const theta = unitAngle(ringUnit(UNIT[0], UNIT[1]))
  const sEps = (k: number): number => {
    const c = memberCycle(u, [k, 0, 0, 0])
    const ev = complexEigenvalues({ re: c.re, im: c.im, n: 16 })

    return ev.re.map((x, i) => wrap(Math.atan2(ev.im[i] as number, x) - Math.PI)).reduce((b, x) => (Math.abs(x - M0) < Math.abs(b - M0) ? x : b))
  }
  const aMember = (4 * ((sEps(0.01) - M0) / 0.01 ** 2) - (sEps(0.02) - M0) / 0.02 ** 2) / 3
  const mu = C_STAR2 / (2 * aMember) / 2
  const G0 = infiniteGreenZero('husk', 64).value

  return { u, M0, m, tanOver: Math.tan(m) / m, theta, mu, aMember, G0, table: huskGreenTable(128, 16, G0), alphaOf: (aB: number) => (24 * Math.PI) / (mu * aB) }
}

// Weyl-filled generic coordinates on the sites within husk radius `within`
function genericState(ball: ReturnType<typeof huskRelBall>, within: number, seed: number): PairState {
  const s = newPair(ball)
  let w = seed

  ball.points.forEach((p, i) => {
    if (Math.hypot(p[0] as number, p[1] as number, p[2] as number) > within) return
    for (let k = 0; k < 256; k++) {
      w = (w + 0.6180339887498949) % 1
      s.re[i * 256 + k] = w - 0.5
      w = (w + 0.4142135623730951) % 1
      s.im[i * 256 + k] = w - 0.5
    }
  })

  return s
}

function relativeGap(a: PairState, b: PairState): number {
  let g = 0
  let n = 0

  for (let i = 0; i < a.re.length; i++) {
    g = Math.max(g, Math.hypot((a.re[i] as number) - (b.re[i] as number), (a.im[i] as number) - (b.im[i] as number)))
    n = Math.max(n, Math.hypot(a.re[i] as number, a.im[i] as number))
  }

  return g / n
}

// ---------------- the witness, the instrument and the controls (one part) ----------------

export type WitnessRead = { what: string; K: number[]; kind: string; gap: number; gapInner: number; weights: number[]; norms: number[] }

export type Parts = {
  witness: WitnessRead[]
  i1: number
  RMember: number
  conjugacy: number
  strangNorm: number
  centroid: number
  smear: number
  smearContact: number
  C1: boolean
  C2: boolean
}

export function partsRun(su: Setup, plan: SplitPlan, log: (what: string) => void): Parts {
  const { u, M0, theta, table } = su
  // I1: the member coordinates' 16 phases on the husk slice, the Dirac band
  let i1 = 0

  for (const K of I1_MOMENTA) {
    const c = memberCycle(u, K)
    const ev = complexEigenvalues({ re: c.re, im: c.im, n: 16 })
    const ph = ev.re.map((x, i) => Math.atan2(ev.im[i] as number, x)).sort((a, b) => a - b)
    const E = diracPhase(K, M0)
    const want = [...Array(8).fill(wrap(Math.PI + E)), ...Array(8).fill(wrap(Math.PI - E))].sort((a, b) => a - b)

    i1 = Math.max(i1, ...ph.map((x, i) => Math.abs(wrap(x - (want[i] as number)))))
  }

  const RMember = C_STAR2 / (2 * su.aMember * M0)

  log('I1 I2')

  // H0: the witness. (a) the free cycle against the full rule's two beats with every phase zero; (b) the two in-beat
  // pull pieces at half the phase (P_DD after P_SS) against the full rule's two beats with the mixer 1, where a beat is
  // the pieces, the swap coin and the stream: T X P_DD T X P_SS on the lift of s against T X T X on the lift of the
  // coordinates' P_DD P_SS s
  const witness: WitnessRead[] = []
  const coord = huskRelBall(plan.witnessCoord)
  const full = huskRelBall(plan.witnessFull)
  const alpha = su.alphaOf(plan.main)
  const cc = coulombCounts(coord, table, alpha, theta)
  const fc = coulombCounts(full, table, alpha, theta)
  const at = coord.index.get('0,0,0,0') as number

  for (const what of ['free', 'pieces'] as const) {
    for (const K of WITNESS_K) {
      for (const kind of ['SS', 'generic'] as const) {
        const e = splitEngine(coord, u, K, cc, 'strang')
        const s = newPair(coord)
        let w = 0.5

        for (let k = 0; k < (kind === 'SS' ? 64 : 256); k++) {
          w = (w + 0.6180339887498949) % 1
          s.re[at * 256 + k] = w - 0.5
          w = (w + 0.4142135623730951) % 1
          s.im[at * 256 + k] = w - 0.5
        }

        const n0 = norm2(e.free, s)
        const before = liftQ(coord, s, full, K)
        let two

        if (what === 'free') {
          pairCycle(e.free, s)

          const rule = fullRuleQ(full, u, K, new Array<number>(full.points.length).fill(0), 'vector')

          two = fullBeatQ(rule, fullBeatQ(rule, before, 1), 2)
        } else {
          sectorPiece(e.half, s, 'SS')
          sectorPiece(e.half, s, 'DD')

          const rule = fullRuleQ(full, [1, 0], K, Array.from(fc.counts, n => (-theta * n) / 2), 'vector')

          two = fullBeatQ(rule, fullBeatQ(rule, before, 1), 2)
        }

        const n1 = norm2(e.free, s)
        let want = liftQ(coord, s, full, K)

        if (what === 'pieces') {
          const idle = fullRuleQ(full, [1, 0], K, new Array<number>(full.points.length).fill(0), 'vector')

          want = fullBeatQ(idle, fullBeatQ(idle, want, 1), 2)
        }

        const g = fullGapQ(full, two, want)
        const gIn = fullGapQ(full, two, want, plan.witnessFull - 3)

        witness.push({ what, K: [...K], kind, gap: g.worst, gapInner: gIn.worst, weights: [g.weightA, g.weightB], norms: [n0, n1] })
        log(`witness ${what} ${kind} ${K.join(',')}`)
      }
    }
  }

  // I2 THE FACTORED CYCLE IS E-SPN-0173'S, CONJUGATED: P_SS U s against V K P_SS s, a generic start within radius 3
  const ball = huskRelBall(8)
  const count = coulombCounts(ball, table, alpha, theta)
  const Kg = WITNESS_K[1] as number[]
  let conjugacy = 0
  let strangNorm = 0

  {
    const ec = splitEngine(ball, u, Kg, count, 'coulomb')
    const ef = splitEngine(ball, u, Kg, count, 'factored')
    const s = genericState(ball, 3, 0.1)
    const a = clonePair(s)
    const b = clonePair(s)

    splitCycle(ec, a)
    sectorPiece(ef.pull, a, 'SS')
    sectorPiece(ef.pull, b, 'SS')
    splitCycle(ef, b)
    conjugacy = relativeGap(a, b)
  }

  // I3: the Strang cycle keeps the Gram norm (every piece unitary), one cycle, a generic start within radius 3 of a
  // radius-14 ball (one Strang cycle reaches up to eight links: two pulls of two each and the free cycle between)
  {
    const b14 = huskRelBall(14)
    const es = splitEngine(b14, u, Kg, coulombCounts(b14, table, alpha, theta), 'strang')
    const c = genericState(b14, 3, 0.1)
    const n0 = norm2(es.free, c)

    splitCycle(es, c)
    strangNorm = Math.abs(norm2(es.free, c) / n0 - 1)
  }

  log('I2 I3')

  // I4 THE TRUE DOCK: T D_y's charge centroid (sum_d r_d E_d^T E_d, every axis) and the smear of G over one and two
  // stencils against G beyond one link of contact
  const g = gammaMatrices()
  const f = 1 / (2 * Math.sqrt(12))
  const E = DOCK_ROOTS.map(r => Array.from({ length: 8 }, (_, a) => Array.from({ length: 8 }, (_, eta) => f * [0, 1, 2, 3].reduce((acc, i) => acc + (r[i] as number) * (((g[i] as number[][])[eta] as number[])[a] as number), 0))))
  let centroid = 0

  for (let axis = 0; axis < 4; axis++) {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        let acc = 0

        DOCK_ROOTS.forEach((r, d) => {
          for (let a = 0; a < 8; a++) acc += (r[axis] as number) * ((E[d] as number[][])[a] as number[])[x]! * ((E[d] as number[][])[a] as number[])[y]!
        })
        centroid = Math.max(centroid, Math.abs(acc))
      }
    }
  }

  const G = (p: readonly number[]): number => greenOf(table, p)
  const R3 = DOCK_ROOTS.map(r => [r[0] as number, r[1] as number, r[2] as number])
  let smear = 0
  let smearContact = 0

  for (let a = -8; a <= 8; a++) {
    for (let b = -8; b <= 8; b++) {
      for (let c = -8; c <= 8; c++) {
        const r = Math.hypot(a, b, c)

        if (r > 8) continue

        const gy = G([a, b, c])
        let one = 0
        let two = 0

        for (const q1 of R3) {
          one += G([a + (q1[0] as number), b + (q1[1] as number), c + (q1[2] as number)])
          for (const q2 of R3) two += G([a + (q1[0] as number) - (q2[0] as number), b + (q1[1] as number) - (q2[1] as number), c + (q1[2] as number) - (q2[2] as number)])
        }

        const worst = Math.max(Math.abs(one / 24 / gy - 1), Math.abs(two / 576 / gy - 1))

        if (r > Math.SQRT2 + 1e-9) smear = Math.max(smear, worst)
        else smearContact = Math.max(smearContact, worst)
      }
    }
  }

  log('I4')

  // C1 THE UNSPLIT PULL IS E-SPN-0173'S: the 'coulomb' form against register-coulomb's coulombCycle, bit for bit, three
  // cycles, a generic start filling a radius-6 ball
  let C1 = false
  // C2 THE LIGHT OFF: the Strang cycle with every count zero against the free cycle, bit for bit
  let C2 = false

  {
    const b6 = huskRelBall(6)
    const c6 = coulombCounts(b6, table, alpha, theta)
    const mine = splitEngine(b6, u, Kg, c6, 'coulomb')
    const theirs = coulombEngine(b6, u, Kg, c6, 'vector')
    const s = genericState(b6, Infinity, 0.3)
    const a = clonePair(s)
    const b = clonePair(s)

    for (let k = 0; k < 3; k++) {
      splitCycle(mine, a)
      coulombCycle(theirs, b)
    }
    C1 = a.re.every((x, i) => x === b.re[i]) && a.im.every((x, i) => x === b.im[i])

    const off = splitEngine(b6, u, Kg, { ...c6, counts: new Int32Array(c6.counts.length) }, 'strang')
    const c = clonePair(s)
    const d = clonePair(s)

    for (let k = 0; k < 3; k++) {
      splitCycle(off, c)
      pairCycle(off.free, d)
    }
    C2 = c.re.every((x, i) => x === d.re[i]) && c.im.every((x, i) => x === d.im[i])
  }

  log('C1 C2')

  return { witness, i1, RMember, conjugacy, strangNorm, centroid, smear, smearContact, C1, C2 }
}

// ---------------- one point: the level, the hold, the motion, S and R in one placement of the pull ----------------

export type PointRead = {
  name: string
  aB: number
  form: SplitForm
  dock: boolean
  alpha: number
  radius: number
  sites: number
  top: number
  nearest: number
  EL: number
  Eb: number
  EbContinuum: number
  lambdaAbs: number
  residual: number
  reads: number[]
  lost: number
  least: number
  edge: number
  mean: number
  shares: number[]
  shellsHead: number[]
  coefficients: number[]
  isotropy: number
  Rstatic: number
  RformulaStatic: number
  S: number
  Rfull: number
  commutator: number
  dockSites: number
  seconds: number
}

export function readPoint(su: Setup, plan: SplitPlan, p: SplitPoint, log: (what: string) => void): PointRead {
  const started = Date.now()
  const { u, M0, m, theta, table, mu } = su
  const alpha = su.alphaOf(p.aB)
  const ball = huskRelBall(p.radius)
  const count: CoulombCount = coulombCounts(ball, table, alpha, theta)
  const dock = p.dock ? dockCounts(ball, q => greenOf(table, q), alpha, theta) : undefined
  const dockSites = dock ? ball.points.filter((_, i) => dock.SD[i] !== count.counts[i] || dock.DD[i] !== count.counts[i]).length : 0
  const engineAt = (K: readonly number[]): SplitEngine => splitEngine(ball, u, K, count, p.form, dock)
  const e = engineAt([0, 0, 0, 0])
  const EbContinuum = (mu * (alpha / (24 * Math.PI)) ** 2) / 2
  let v = hydrogenStart(ball, p.aB)
  let phase = 2 * M0 - EbContinuum
  let read = splitRead(e, v)
  const reads: number[] = []

  normalizePair(e.free, v)
  for (const S of p.filters) {
    v = splitFilter(e, v, phase, S)
    normalizePair(e.free, v)
    read = splitRead(e, v)
    reads.push(read.residual)
    phase = read.phase
    log(`${p.name} filter ${S}: E ${read.phase} residual ${read.residual.toExponential(3)}`)
  }

  const EL = read.phase
  // the hold
  const s = clonePair(v)
  let least = 1

  for (let c = 1; c <= plan.hold; c++) {
    splitCycle(e, s)

    const [fr, fi] = inner(e.free, v, s)

    least = Math.min(least, fr * fr + fi * fi)
  }

  const lost = 1 - norm2(e.free, s)
  const w = siteWeights(ball, v)
  const sh = shells(ball, w)
  // the pieces' commutator on the level: |V_h^2 v - V v| / |v| (Gram), the size of what the Strang cycle changes
  const hv = clonePair(v)
  const fv = clonePair(v)

  applyPull(e.half, hv)
  applyPull(e.half, hv)
  applyPull(e.pull, fv)
  for (let i = 0; i < hv.re.length; i++) {
    hv.re[i] = (hv.re[i] as number) - (fv.re[i] as number)
    hv.im[i] = (hv.im[i] as number) - (fv.im[i] as number)
  }

  const commutator = Math.sqrt(norm2(e.free, hv))

  log(`${p.name} level E ${EL} hold ${least}`)

  const eAt = (K: number[]): number => {
    const ek = engineAt(K)
    const x = splitFilter(ek, v, EL, p.kFilter)

    normalizePair(ek.free, x)

    return splitRead(ek, x).phase
  }
  const base = eAt([0, 0, 0, 0])
  const coefficients = DIRS.map(d => {
    const e1 = eAt(d.map(x => x * KAPPA))
    const e2 = eAt(d.map(x => (x * KAPPA) / 2))

    return (4 * ((e2 - base) / (KAPPA / 2) ** 2) - (e1 - base) / KAPPA ** 2) / 3
  })
  const a0 = coefficients[0] as number
  const Rstatic = C_STAR2 / (2 * a0 * base)
  const dS = densityS(ball, w, plan.sTorus)
  const Eb = 2 * M0 - EL
  const RformulaStatic = staticR(m, Eb / 2)
  const Rfull = Rstatic + darwinR(m, Eb / 2, dS.S, 1) - RformulaStatic

  log(`${p.name} R ${Rstatic} formula ${RformulaStatic}`)

  return {
    name: p.name,
    aB: p.aB,
    form: p.form,
    dock: p.dock,
    alpha,
    radius: p.radius,
    sites: ball.points.length,
    top: count.top,
    nearest: count.nearest,
    EL,
    Eb,
    EbContinuum,
    lambdaAbs: Math.hypot(...read.lambda),
    residual: read.residual,
    reads,
    lost,
    least,
    edge: sh.edge,
    mean: sh.mean,
    shares: blockShares(e.free, v),
    shellsHead: sh.shells.slice(0, 8),
    coefficients,
    isotropy: Math.max(...coefficients.map(a => Math.abs(a / a0 - 1))),
    Rstatic,
    RformulaStatic,
    S: dS.S,
    Rfull,
    commutator,
    dockSites,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---------------- the verdict ----------------

export function combine(reads: readonly PointRead[], parts: Parts, plan: SplitPlan, su: Setup): Verdict {
  const { tanOver, m, M0, theta, mu, G0 } = su
  const find = (aB: number, form: SplitForm, dock = false): PointRead | undefined => reads.find(r => r.aB === aB && r.form === form && r.dock === dock)
  const main = find(plan.main, 'strang') as PointRead
  const excess = (r: PointRead | undefined): number => (r ? Math.abs(r.Rstatic / r.RformulaStatic - 1) : NaN)
  const H0 =
    parts.witness.length === 8 &&
    parts.witness.every(w => (w.kind === 'SS' ? w.gap : w.gapInner) <= ENTRY && Math.abs((w.norms[1] as number) / (w.norms[0] as number) - 1) <= NORM) &&
    parts.witness.filter(w => w.kind === 'SS').every(w => Math.abs((w.weights[0] as number) / (w.weights[1] as number) - 1) <= WEIGHT)
  const H1 = main.lambdaAbs >= 1 - LAMBDA && main.residual <= RESIDUAL && Math.abs(main.lost) <= LOST && main.least >= 1 - FIDELITY && main.edge <= EDGE
  const H2 = main.isotropy <= ISOTROPY
  const H3 = excess(main) <= STATIC_BAND
  const H4 = Math.abs(main.Rfull - tanOver) <= FULL_BAND
  const trend = [plan.strong, plan.main, plan.weak].map(aB => excess(find(aB, 'strang')))
  const H5 = trend.every(x => Number.isFinite(x)) && (trend[0] as number) > (trend[1] as number) && (trend[1] as number) > (trend[2] as number)
  // H6 THE SPLIT REMOVES THE FIRST-ORDER ERROR: at every coupling, the Strang cycle's excess over the formula at most half
  // the unsplit cycle's (the directive's hypothesis; the derivation predicts it fails)
  const pairs = [plan.strong, plan.main, plan.weak].map(aB => ({ aB, s: find(aB, 'strang'), c: find(aB, 'coulomb') }))
  const H6 = pairs.every(({ s, c }) => s !== undefined && c !== undefined && (s.Rstatic - s.RformulaStatic) <= HALF * (c.Rstatic - c.RformulaStatic))
  const I1 = parts.i1 <= I1_TOLERANCE
  const I2 = Math.abs(parts.RMember - tanOver) <= I2_TOLERANCE && parts.conjugacy <= I3_TOLERANCE
  const I3 = parts.strangNorm <= I4_NORM
  const I4 = parts.centroid <= I5_CENTROID && parts.smear <= I5_SMEAR
  const C3 = darwinR(m, main.Eb / 2, 0, 1) === staticR(m, main.Eb / 2)
  const instrument = I1 && I2 && I3 && I4
  const controls = parts.C1 && parts.C2 && C3
  const hard = H0 && H1 && H2 && H3 && H4 && H5 && H6
  const status = !hard ? 'fail' : !instrument || !controls ? 'partial' : 'pass'
  const pointClaim = (r: PointRead): string =>
    `${r.name} (a_B ${r.aB}, ${r.form}${r.dock ? ' at the true docks' : ''}, alpha ${r.alpha.toFixed(3)}, ball ${r.radius}, ${r.sites} sites${r.dock ? `, ${r.dockSites} sites re-counted` : ''}): E_L ${r.EL.toFixed(8)}, E_b ${r.Eb.toFixed(6)} (continuum ${r.EbContinuum.toFixed(6)}), |lambda| ${r.lambdaAbs.toFixed(10)}, residual ${r.residual.toExponential(2)} (after each filter ${r.reads.map(x => x.toExponential(2)).join(', ')}), lost ${r.lost.toExponential(2)} over ${plan.hold} cycles, least fidelity ${r.least.toFixed(10)}, edge ${r.edge.toExponential(2)}, mean r ${r.mean.toFixed(3)}, shares ${r.shares.map(x => x.toFixed(4)).join(' ')}, the pieces' commutator on the level ${r.commutator.toExponential(3)}; a ${r.coefficients.map(a => a.toFixed(10)).join(' ')} (isotropy ${r.isotropy.toExponential(2)}); R static ${r.Rstatic.toFixed(6)} against the formula ${r.RformulaStatic.toFixed(6)}; S ${r.S.toFixed(6)}; R with the Darwin exchange ${r.Rfull.toFixed(6)} against tan m / m ${tanOver.toFixed(6)} [${r.seconds.toFixed(0)} s]`
  const metrics: Record<string, number> = {
    H0: flag(H0),
    H1: flag(H1),
    H2: flag(H2),
    H3: flag(H3),
    H4: flag(H4),
    H5: flag(H5),
    H6: flag(H6),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    I4: flag(I4),
    C1: flag(parts.C1),
    C2: flag(parts.C2),
    C3: flag(C3),
    conjugacy: parts.conjugacy,
    centroid: parts.centroid,
    smear: parts.smear,
  }

  for (const r of reads) {
    metrics[`${r.name}_Rstatic`] = r.Rstatic
    metrics[`${r.name}_formula`] = r.RformulaStatic
    metrics[`${r.name}_Rfull`] = r.Rfull
    metrics[`${r.name}_Eb`] = r.Eb
    metrics[`${r.name}_residual`] = r.residual
    metrics[`${r.name}_commutator`] = r.commutator
  }

  return verdict({
    status,
    claim: `H0 ${H0} (${parts.witness.map(w => `${w.what} ${w.kind} K ${w.K.join(',')}: gap ${w.gap.toExponential(2)} (inner ${w.gapInner.toExponential(2)}), norm ${w.norms.map(x => x.toFixed(12)).join(' -> ')}`).join('; ')}); H1 ${H1}; H2 ${H2}; H3 ${H3} (the Strang cycle's static R within ${STATIC_BAND} of the formula at a_B ${plan.main}); H4 ${H4} (R with the Darwin exchange within ${FULL_BAND} of tan m / m); H5 ${H5} (the Strang excess over the formula ${trend.map(x => x.toFixed(4)).join(', ')} at a_B ${plan.strong}, ${plan.main}, ${plan.weak}, falling); H6 ${H6} (the Strang excess at most ${HALF} of the unsplit's at every coupling: ${pairs.map(({ aB, s, c }) => `a_B ${aB} ${s && c ? `${(s.Rstatic - s.RformulaStatic).toFixed(4)} against ${(c.Rstatic - c.RformulaStatic).toFixed(4)}` : 'not read'}`).join(', ')}). POINTS ${reads.map(pointClaim).join('. ')}. Instrument I1 ${I1} (${parts.i1.toExponential(2)}) I2 ${I2} (member R ${parts.RMember.toFixed(9)} vs ${tanOver.toFixed(9)}; P_SS U against V K P_SS ${parts.conjugacy.toExponential(2)}) I3 ${I3} (the Strang cycle's Gram norm over one cycle ${parts.strangNorm.toExponential(2)}) I4 ${I4} (the D content's centroid ${parts.centroid.toExponential(2)}; its smeared pull against G beyond one link ${parts.smear.toExponential(2)}, within it ${parts.smearContact.toExponential(2)}); controls C1 ${parts.C1} (the unsplit pull is E-SPN-0173's cycle bit for bit) C2 ${parts.C2} (light off: the Strang cycle is the free cycle bit for bit) C3 ${C3}`,
    metrics,
    control: { C1: flag(parts.C1), C2: flag(parts.C2), C3: flag(C3), instrument: flag(instrument) },
    notes: `L2. Light m ${m.toFixed(6)} (M0 ${M0.toFixed(6)}), the Coulomb count in steps of ringUnit(${UNIT.join(', ')}) (angle ${theta.toFixed(9)}), the half pull in steps of its square root, G(0) ${G0.toFixed(9)}, mu ${mu.toFixed(6)}.`,
  })
}

// run() reads every part in one process; the gate run reads the same parts in parallel processes and calls combine()
export function registerCoulombSplitRun(plan: SplitPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const su = setup()
  const parts = partsRun(su, plan, log)
  const reads = plan.points.map(p => readPoint(su, plan, p, log))

  return combine(reads, parts, plan, su)
}

export default experiment({
  id: 'spin/register-coulomb-split',
  code: 'E-SPN-XXXX',
  title: 'TITLE_PLACEHOLDER',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerCoulombSplitRun(GATE_PLAN)
  },
})
