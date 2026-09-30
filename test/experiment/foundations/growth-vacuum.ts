// IS THE VACUUM SELECTED BY HISTORY? (E-FND-0168). A reversible rule has no ground state. E-FND-0159's energy ledger, the
// prime-unit count, selects nothing: the SU(2)+-breaking sea B reads 0, as the full sea does, and every sea of flat holes
// ties with it too (E-FND-0161). Under Gauss's law B is not a physical state (E-FRC-0271, Elitzur), and E-FRC-0273 left
// the Higgs row needing a center-odd scalar or "a vacuum other than the full sea that something selects". The mesh
// grows: new docks appear at its edge (the wake, /vibe/model/wake). A new dock enters in a state the growth writes. This
// file asks what that state is, what a grown region converges to, and whether it breaks SU(2)+.
//
// DERIVED BEFORE THE RUN.
// 1. WHAT THE WAKE WRITES TODAY. The wake (code/measure/gated-wake, E-GRV-0066) gives each dock a birth beat and takes
//    no state. The adopted knit runs on a closed box and has no rule for a growing edge (E-GRV-0066: 24 to 40,680 edge
//    slots at beats 0 to 7 would take from unborn docks); its vacuum is calm slots plus a prepared store layout
//    (code/measure/second-law-husk vacuumState, the coset-union store of E-RLT-0093) that no growth rule writes. The page
//    says a born dock is "calm in every slot". The one growing dynamics in code is the lattice gas's (code/rule/lattice-gas
//    growingBeat, E-FND-0086): an unborn dock holds peace, the frontier REFLECTS (a slot whose source dock is unborn takes
//    its own dock's opposite slot, so the map is a bijection on the born slots), and a born dock starts from calm; there
//    the charge rule's create move turns calm into the vacuum clock. The register rule (E-SPN-0175's pieces) has no
//    growth rule.
// 2. THE LEAST GROWTH RULE FOR THE REGISTER RULE (code/measure/register-growth). The lattice gas's, ported: the plain wake
//    (birth at graph distance in root steps from one seed, one shell a beat), the beat's one-body piece X (1 + (w - 1) Q)
//    at every born dock, the stream with the reflecting frontier, and a born dock written in a fixed dock state chi.
//    Reversible from birth (a fixed-state embedding is an isometry and the frontier is a bijection), local (a dock and its
//    root neighbors), one branch when chi is one Fock state. The pair pieces (the sector string and contact) act as
//    phases on every uniform sea below (their sector counts are sharp) and commute with every conserved quantity gated
//    here (E-FRC-0268 H1), so the runs use the one-body pieces and say so.
// 3. WHICH chi. A member is one register component of a slot (E-SPN-0175's occupancy: a slot holds 0 to 8), so the
//    knit's calm is chi = EMPTY, and R*'s sea is chi = FULL. A uniform product sea is stationary only if its dock space
//    1 (x) V0 is invariant at every torus momentum: under the stream's phases it is slot-diagonal, under the coin the
//    opposite slots agree, under Q_S (the uniform slot mode) every slot holds the same V0, and under Q_D the projector on
//    V0 commutes with Q_D. So the stationary one-branch product seas are the invariant subspaces of the dock-local
//    commutant of the pieces. E-FRC-0268 showed it holds R(Cl+(4)) = R(H+ + H-), real dimension 8, whose complexification
//    is M2(C) + M2(C). If that is all of it (V1), each half is either empty, one isospin line (a point on the sphere), or
//    full: NINE families. B is (a line on half +, full on half -). Every piece commutes with SU(2)+ x SU(2)-, so a growth
//    law built from the rule's pieces writes a chi fixed by them: empty, full, half + only or half - only. A line is
//    breaking put into the growth law by hand.
// 4. WHAT A GROWN REGION CONVERGES TO. (a) THE WAKE MOVES AT THE STREAM'S SPEED. A slot's content moves one root step a
//    beat and the plain wake births one shell a beat, so after beat 0 no content reaches the frontier: history writes chi
//    outside the light cone of every seed, and nothing ever changes it there. (b) Every piece and the reflecting frontier
//    conserve member number and commute with J, SU(2)+ and SU(2)-, and a covariant birth adds a singlet (T_k chi = 0 for
//    the empty and the full dock), so the seed's <T_k> and <T^2> are conserved through growth and its order parameter per
//    dock falls as 1 / N. (c) A chi that is the same at every dock fills both bands of a half alike, so no band
//    imbalance and no S - D charge can be written. So the vacuum is chosen by history, exactly: it is chi. The literal
//    port writes the EMPTY mesh, not R*'s full sea, and on the empty mesh K is not blocked (two members there put 0.217
//    of their weight on K's trigger, E-SPN-0175).
// 5. ELITZUR. The four covariant dock states lie wholly in the trivial Gauss sector of every dock: the empty dock reads
//    1, the full dock det Gamma(h)^24 = 1, half + det Gamma(h)^24, half - 1 (Gamma is the identity on half -). B's dock
//    reads 1/6 + (2/3) 2^-24 (E-FRC-0271).
// PREDICTED: every gate but B holds, and B FAILS (no covariant history breaks SU(2)+). Verdict fail on B alone.
//
// GATES, fixed before the gate run. The rule is E-SPN-0175's one-body cycle, the light unit ringUnit(-1, 4); tori L = 4
// and L = 6; seeds at the origin. Runs, each read at its last cycle:
//   C   the literal port: chi empty, the seed a full dock (192 member orbitals)
//   D   R*'s sea: chi full, the seed B's dock (48 hole orbitals, X_1 = +i on half +)
//   Cs, Ds  the same with a SLOW wake (a shell every 2 beats), so content does meet the frontier and reflects
//  V0 THE ENGINE: on the closed L = 4 torus one cycle of the growth engine sends a plane wave of every moving state of
//     E-FND-0161's frame, at momentum classes 0, 1, 5, 17, 40, 77, to the frame's A2 A1 image within 1e-12.
//  V1 THE COMMUTANT: the dock-local commutant of Q_S and Q_D (R0) and of those with E-FRC-0268's three chiral projectors
//     (R1) has real dimension exactly 8, with Gram-Schmidt's smallest accepted residual at least 1e-2 and largest rejected
//     at most 1e-12; and J and the six A_k P+-, A_k P- commute with every one of the five projectors exactly (gap 0).
//  W1 CALM WRITES THE EMPTY MESH: in C the member count is 192 within 1e-8 at the start and the end at both L, so the
//     filling at the end is 192 / (192 N) = 1 / N. (With an empty seed the region has no orbital at all: no piece makes
//     a member, so the literal port's history is the empty mesh at every beat. Derived, not read.)
//  W2 FULL WRITES THE FULL SEA: in D the hole count is 48 within 1e-8 at the start and the end at both L. (With a full
//     seed there is no hole at all. Derived, not read.)
//  LC THE LIGHT CONE: in C and D no orbital holds weight on an unborn dock at any beat (exactly 0), and in Cs and Ds the
//     same holds while the reflecting frontier is met (every orbital weight conserved within 1e-8).
//  H  CONSERVED ISOSPIN: in C, D, Cs, Ds at both L, <T_k> and <T^2> at the end equal their start within 1e-7: C (0, 0,
//     0; 0), D (24, 0, 0; 600).
//  BD BAND AND SECTOR CONTENT: on the plain wake the moving weight and the positive-phase band weight at the end equal the
//     seed dock's trace, C 16 and 8 (L = 4), D 4 and 2 (L = 4 and 6), within 1e-7; the S minus D count of the holes
//     relative to the full sea is 0 within 1e-7 in C and D (L = 4).
//  S  STATIONARITY: the uniform seas are exactly stationary (no orbital); C and D are NOT (the part of one cycle's image
//     outside the orbitals' span is above 1e-3 at L = 4): a seed's moving part keeps moving.
//  G  GAUSS: 4 Gamma(h) has integer determinant 4^8 for all 24 elements of 2T, so every covariant dock state has weight
//     exactly 1 in the trivial Gauss sector.
//  B  HISTORY BREAKS SU(2)+ (predicted to FAIL): some covariant run ends with an order parameter |<T>| / N that does not
//     dilute: nonzero at L = 4 and its L = 6 value at least half of it.
// CONTROLS (a failure makes the verdict partial at best).
//  CF THE FULL SEA BY HAND: D's seed in a full sea prepared on the whole L = 4 torus (every dock born at beat 0) ends with
//     the same hole count, <T_k> and <T^2> as D within 1e-7, and a seed-dock weight that differs from D's by more than
//     1e-6 (history changed the path, not the conserved content).
//  CB A BREAKING LAW: chi = B's dock at every birth on L = 4. The 48 hole orbitals of the seed and of the first dock of
//     every shell (added at each dock's birth) stay inside Pi = (P+ - i X_1) / 2 at every dock within 1e-12 at every
//     cycle boundary, so the grown sea is B, stationary, with <T_1> = 1/2 a hole (24 a dock) within 1e-7; and B's dock
//     reads E-FRC-0271's exact Gauss weight, (2^50 + 2^28) / (24 2^48), with no imaginary part.
//  CT THE UNCHANGED STREAM: C on L = 4 with the frontier reading an unborn dock as empty (not a bijection) ends with a
//     member count below 1 (the seed is lost, E-GRV-0066's "no edge rule"), where C keeps 192.
// READ, gating nothing: the seed-dock weight, the flat weight, the S and D counts, the stationarity residuals, the band
// content of Ds (the slow wake, whose frontier the seed's content does meet), seconds.
// Verdict: fail if V0, V1, W1, W2, LC, H, BD, S, G or B fails; partial if a control fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/vg-probe1 (L = 4, 8 cycles): the engine against
//  the frame 1.1e-16, both commutants 8 (accepted 0.756 and 0.242, rejected 1.7e-16), the L = 4 wake's shells 1, 24, 74,
//  28, 1; C kept 192 members, <T> 0, <T^2> -1.7e-10, moving 16, up 8, S 8; D kept 48 holes, <T_1> 24, <T^2> 600, moving
//  4, up 2. tmp/vg-smoke (SMOKE_PLAN, L = 4, 6 cycles) ran every path: every gate held but B (one side only), the
//  controls held (CF's seed weight 40.6 against D's 0.023, CB outside Pi 7e-30, CT 0 members), and Ds's band content
//  moved (moving 2.56, up 0.53 against 4 and 2). Tolerances were set before either, and none was changed after.
//
// FIRST RUN (tmp/vg-gate-E-FND-0168.log, 735 s): FAIL on B alone, as derived. No gate moved and none was rerun.
//  - V0 1.1e-16. V1: both commutants 8 (accepted 0.242, rejected 1.7e-16), J and the six A_k P+- commute exactly. G:
//    every 4 Gamma(h) has determinant 65,536 = 4^8.
//  - The wakes: L = 4 (N 128) shells 1, 24, 74, 28, 1; L = 6 (N 648) shells 1, 24, 144, 286, 160, 32, 1.
//  - C kept 192 members (drift 3.5e-9 at L = 6), D 48 holes, no weight on an unborn dock ever, and the slow wakes kept
//    both within 1e-9. <T> stayed 0 and (24, 0, 0), <T^2> 0 (within 1.1e-9) and 600 (within 2.2e-11), at both L.
//  - Band content, plain wake: C moving 16, up 8; D moving 4, up 2 at both L; S - D 0 within 6e-12. Stationarity
//    residuals C 29.5714 and D 7.3929 (207 / 7 and 207 / 28): neither seeded state is stationary.
//  - B: order parameter per dock 0.1875 (24 / 128) and 0.0370 (24 / 648): it dilutes as 1 / N.
//  - Controls: CF's seed weight 45.25 against D's 0.0064 with every conserved total equal; CB outside Pi 9.7e-29,
//    <T_1> 1/2 a hole, the Gauss weight exact; CT 0 members.
//  - Read: the slow wake moves the seed's band content and nothing conserved: Ds moving 2.565 and up 0.528 (L = 4),
//    2.553 and 0.487 (L = 6), against 4 and 2 on the plain wake. The seed-dock weights: C 0.026, D 0.0064, Cs 151.2,
//    Ds 37.8 (L = 4), nearly the same at L = 6.
//
// DETERMINISM: no random numbers; every orbital is a fixed local basis vector. FLOATS: the pieces are the exact
// projectors of code/measure/spinor-register times a ring unit; amplitudes are floats, as measurement.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  matMul,
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { sectorBases, torus, type Torus } from '@/code/measure/register-sea'
import { holeFrame, type HoleFrame } from '@/code/measure/register-holes'
import { chirality2, volumeRight } from '@/code/measure/chiral-register'
import {
  breakingGaussWeight,
  integerDeterminant,
  registerGauge,
} from '@/code/measure/register-link-field'
import {
  bandRead,
  breakingDock,
  dockModes,
  dockWeight,
  gramGap,
  growthBeat,
  growthScratch,
  isospinGenerators,
  isospinRead,
  localOrbitals,
  orbitalWeight,
  planeWave,
  registerCommutant,
  registerCommutatorGap,
  registerOutside,
  sectorCount,
  spanResidual,
  torusNeighbors,
  torusWake,
  unbornWeight,
  copyOrbital,
  type Isospin,
  type Orbital,
} from '@/code/measure/register-growth'

const LIGHT: readonly [number, number] = [-1, 4]
const V0_CLASSES = [0, 1, 5, 17, 40, 77]
const ENGINE_TOL = 1e-12
const MOVE_ACCEPT = 1e-2
const MOVE_REJECT = 1e-12
const COUNT_TOL = 1e-8
const ISO_TOL = 1e-7
const BAND_TOL = 1e-7
const MOVING_FLOOR = 1e-3
const STAY_TOL = 1e-12
const DIFFER = 1e-6

export type GrowthPlan = {
  sides: readonly number[]
  // cycles run from beat 0 on each side
  cycles: readonly number[]
  // read the band content of C at these sides (costly: 192 orbitals x 192 transforms)
  bandC: readonly number[]
}

export const GATE_PLAN: GrowthPlan = {
  sides: [4, 6],
  cycles: [32, 16],
  bandC: [4],
}

export const SMOKE_PLAN: GrowthPlan = {
  sides: [4],
  cycles: [6],
  bandC: [4],
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/growth-vacuum',
  code: 'E-FND-0168',
  title:
    "the vacuum is chosen by history, not by an energy, and a covariant growth law writes a symmetric one, fail on the Higgs row as derived: the wake gives birth beats and takes no state, and the least growth rule consistent with the register rule's pieces (the lattice gas's reflecting frontier, a born dock written in a fixed state) moves at the stream's own speed, so no content reaches the edge after the first beat and the grown vacuum is exactly the state written there; the dock-local commutant of the pieces is R(Cl+(4)), dimension 8, so the stationary one-branch product seas are nine families, and the four a covariant law can write (empty, full, one chiral half) keep SU(2)+ and lie wholly in the trivial Gauss sector; the knit's own calm writes the empty mesh, not the full sea; a seed's number and isospin are conserved through growth, so a breaking seed dilutes as 1 / N (a wake slower than light moves its band content, never its isospin); only a growth law that picks an isospin line by hand writes a breaking sea",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return growthVacuumRun(GATE_PLAN)
  },
})

const unit = (kj: readonly [number, number]): [number, number] => {
  const th = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(th), Math.sin(th)]
}

// the pieces, bases and generators shared by every run
type Setup = {
  u: [number, number]
  qS: Float64Array
  qD: Float64Array
  E: ReturnType<typeof sectorBases>
  Ps: ReturnType<typeof registerPiece>[]
  T: Isospin
  dock: ReturnType<typeof breakingDock>
}

// one run on a torus: the orbitals, the births, the cycles; returns the start and end readings
type RunSpec = {
  t: Torus
  nb: Int32Array
  birth: Int32Array
  orbitals: Orbital[]
  holes: boolean
  cycles: number
  reflect: boolean
  // CB: a breaking law's sampled docks, whose 48 holes are added at their birth
  sampled?: readonly number[]
}

type RunRead = {
  weight0: number
  weight: number
  gram: number
  unborn: number
  iso0: { mean: number[]; casimir: number }
  iso: { mean: number[]; casimir: number }
  seed: number
  outsidePi: number
  final: Orbital[]
  seconds: number
}

function runGrowth(s: Setup, r: RunSpec): RunRead {
  const started = Date.now()
  const N = r.t.sites.length
  const scratch = growthScratch(N)
  const orbitals = r.orbitals
  const iso0 = isospinRead(orbitals, s.T, r.holes)
  const weight0 = orbitalWeight(orbitals)
  const added = new Set<number>()

  let unborn = 0
  let outsidePi = 0

  for (let beat = 0; beat < 2 * r.cycles; beat++) {
    if (r.sampled) {
      for (const x of r.sampled) {
        if (r.birth[x]! <= beat && !added.has(x)) {
          added.add(x)
          orbitals.push(...localOrbitals(N, x, s.dock.holes))
        }
      }
    }

    unborn = Math.max(unborn, unbornWeight(orbitals, r.birth, beat))

    const one = beat % 2 === 0

    growthBeat(
      {
        nb: r.nb,
        birth: r.birth,
        E: one ? s.E.S : s.E.D,
        w: one ? s.u : [s.u[0], -s.u[1]],
        time: beat,
        reflect: r.reflect,
      },
      orbitals,
      scratch,
    )

    // read at every cycle boundary
    if (r.sampled && beat % 2 === 1) {
      outsidePi = Math.max(outsidePi, registerOutside(orbitals, s.dock.Pi))
    }
  }

  return {
    weight0,
    weight: orbitalWeight(orbitals),
    gram: gramGap(orbitals),
    unborn,
    iso0,
    iso: isospinRead(orbitals, s.T, r.holes),
    seed: dockWeight(orbitals, r.t.origin),
    outsidePi,
    final: orbitals,
    seconds: (Date.now() - started) / 1000,
  }
}

// one more cycle on copies of the orbitals (all docks born), and the part of the image outside their span
function stationarity(s: Setup, t: Torus, nb: Int32Array, orbitals: readonly Orbital[]): number {
  const N = t.sites.length
  const images = orbitals.map(copyOrbital)
  const all = new Int32Array(N)
  const scratch = growthScratch(N)

  growthBeat({ nb, birth: all, E: s.E.S, w: s.u, time: 0, reflect: true }, images, scratch)
  growthBeat(
    { nb, birth: all, E: s.E.D, w: [s.u[0], -s.u[1]], time: 1, reflect: true },
    images,
    scratch,
  )

  return spanResidual(orbitals, images)
}

// the S count at a cycle boundary and the D count after beat 1, of copies of the orbitals (all docks born)
function sectorCounts(
  s: Setup,
  t: Torus,
  nb: Int32Array,
  orbitals: readonly Orbital[],
): { S: number; D: number } {
  const N = t.sites.length
  const S = sectorCount(orbitals, s.E.S)
  const images = orbitals.map(copyOrbital)

  growthBeat(
    { nb, birth: new Int32Array(N), E: s.E.S, w: s.u, time: 0, reflect: true },
    images,
    growthScratch(N),
  )

  return { S, D: sectorCount(images, s.E.D) }
}

const isoGap = (
  a: { mean: number[]; casimir: number },
  b: { mean: number[]; casimir: number },
): number =>
  Math.max(
    Math.abs(a.casimir - b.casimir),
    ...a.mean.map((m, k) => Math.abs(m - b.mean[k]!)),
  )

const orderDensity = (iso: { mean: number[] }, N: number): number =>
  Math.hypot(...iso.mean) / N

export function growthVacuumRun(plan: GrowthPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const u = unit(LIGHT)
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const G = registerGauge()
  const s: Setup = {
    u,
    qS,
    qD,
    E: sectorBases(),
    Ps,
    T: isospinGenerators(G.units, G.J),
    dock: breakingDock(G.units, G.J),
  }
  const notes: string[] = []

  // ---------------- V1: the commutant ----------------
  const J = volumeRight()
  const chi = chirality2(J, 1)
  const five = [qS, qD, matMul(qD, chi), matMul(qS, chi), chi]
  const comR0 = registerCommutant([qS, qD])
  const comR1 = registerCommutant(five)
  const Pp = G.J.map((row, i) => row.map((x, j) => ((i === j ? 1 : 0) + x) / 2))
  const Pm = G.J.map((row, i) => row.map((x, j) => ((i === j ? 1 : 0) - x) / 2))
  const mul = (a: readonly (readonly number[])[], b: readonly (readonly number[])[]): number[][] =>
    a.map(row => b[0]!.map((_, j) => row.reduce((acc, x, k) => acc + x * b[k]![j]!, 0)))
  const members = [
    G.J,
    ...G.units.map(A => mul(A, Pp)),
    ...G.units.map(A => mul(A, Pm)),
  ]
  const memberGap = Math.max(
    ...members.flatMap(M => five.map(Q => registerCommutatorGap(M, Q))),
  )
  const comOk = (c: { dimension: number; accepted: number; rejected: number }): boolean =>
    c.dimension === 8 && c.accepted >= MOVE_ACCEPT && c.rejected <= MOVE_REJECT
  const V1 = comOk(comR0) && comOk(comR1) && memberGap === 0

  log(`V1 ${V1} R0 ${JSON.stringify(comR0)} R1 ${JSON.stringify(comR1)} member gap ${memberGap}`)

  // ---------------- G: Gauss ----------------
  const dets = G.gamma4.map(M => integerDeterminant(M))
  const Gok = dets.length === 24 && dets.every(d => d === 4 ** 8)
  const bw = breakingGaussWeight(G)
  const CBgauss =
    bw.imaginary === 0n &&
    bw.numerator * 24n * 2n ** 48n === (2n ** 50n + 2n ** 28n) * bw.denominator

  log(`G ${Gok} dets ${[...new Set(dets)].join(' ')}; B's dock ${bw.value}`)

  // ---------------- per side ----------------
  let V0 = true
  let v0Gap = 0
  let W1 = true
  let W2 = true
  let LC = true
  let H = true
  let BD = true
  let S = true
  let CF = true
  let CB = true
  let CT = true

  const density: number[] = []
  const metrics: Record<string, number> = {}

  plan.sides.forEach((L, si) => {
    const cycles = plan.cycles[si]!
    const t = torus(L)
    const N = t.sites.length
    const nb = torusNeighbors(t)
    const plain = torusWake(nb, N, t.origin)
    const slow = plain.map(b => 2 * b)
    const last = Math.max(...plain)
    const fr: HoleFrame = holeFrame(t, Ps, 16)

    log(`L ${L}: N ${N}, wake shells ${Array.from({ length: last + 1 }, (_, b) => plain.filter(x => x === b).length).join(' ')}`)

    // V0 on L = 4
    if (L === 4) {
      for (const j of V0_CLASSES) {
        const W = fr.W[j]!
        const A1 = fr.A1[j]!
        const A2 = fr.A2[j]!

        for (let b = 0; b < 16; b++) {
          const v = { re: new Float64Array(192), im: new Float64Array(192) }
          const want = { re: new Float64Array(192), im: new Float64Array(192) }
          // the column A2 A1 e_b
          const col = { re: new Float64Array(16), im: new Float64Array(16) }

          for (let r = 0; r < 16; r++) {
            for (let m = 0; m < 16; m++) {
              const ar = A2.re[r * 16 + m]!
              const ai = A2.im[r * 16 + m]!
              const br = A1.re[m * 16 + b]!
              const bi = A1.im[m * 16 + b]!

              col.re[r]! += ar * br - ai * bi
              col.im[r]! += ar * bi + ai * br
            }
          }

          for (let m = 0; m < 192; m++) {
            v.re[m] = W.re[m * 16 + b]!
            v.im[m] = W.im[m * 16 + b]!

            for (let c = 0; c < 16; c++) {
              const wr = W.re[m * 16 + c]!
              const wi = W.im[m * 16 + c]!

              want.re[m]! += wr * col.re[c]! - wi * col.im[c]!
              want.im[m]! += wr * col.im[c]! + wi * col.re[c]!
            }
          }

          const o = [planeWave(t, j, v)]
          const all = new Int32Array(N)
          const sc = growthScratch(N)

          growthBeat({ nb, birth: all, E: s.E.S, w: u, time: 0, reflect: true }, o, sc)
          growthBeat({ nb, birth: all, E: s.E.D, w: [u[0], -u[1]], time: 1, reflect: true }, o, sc)

          const ref = planeWave(t, j, want)

          for (let k = 0; k < ref.re.length; k++) {
            v0Gap = Math.max(
              v0Gap,
              Math.hypot(o[0]!.re[k]! - ref.re[k]!, o[0]!.im[k]! - ref.im[k]!),
            )
          }
        }
      }

      V0 = v0Gap <= ENGINE_TOL
      log(`V0 ${V0} gap ${v0Gap.toExponential(2)}`)
    }

    // the uniform seas: the empty law with an empty seed and the full law with a full seed have no minority orbital
    // (no piece creates a member or a hole: every orbital list below starts from the seed alone)
    const seedC = (): Orbital[] => localOrbitals(N, t.origin, dockModes())
    const seedD = (): Orbital[] => localOrbitals(N, t.origin, s.dock.holes)

    const C = runGrowth(s, { t, nb, birth: plain, orbitals: seedC(), holes: false, cycles, reflect: true })

    log(`L ${L} C: weight ${C.weight} gram ${C.gram.toExponential(2)} unborn ${C.unborn} iso ${JSON.stringify(C.iso)} seed ${C.seed.toFixed(6)} (${C.seconds.toFixed(0)} s)`)

    const D = runGrowth(s, { t, nb, birth: plain, orbitals: seedD(), holes: true, cycles, reflect: true })

    log(`L ${L} D: weight ${D.weight} gram ${D.gram.toExponential(2)} unborn ${D.unborn} iso ${JSON.stringify(D.iso)} seed ${D.seed.toFixed(6)} (${D.seconds.toFixed(0)} s)`)

    const Cs = runGrowth(s, { t, nb, birth: slow, orbitals: seedC(), holes: false, cycles, reflect: true })
    const Ds = runGrowth(s, { t, nb, birth: slow, orbitals: seedD(), holes: true, cycles, reflect: true })

    log(`L ${L} Cs: weight ${Cs.weight} iso ${JSON.stringify(Cs.iso)} seed ${Cs.seed.toFixed(6)}; Ds: weight ${Ds.weight} iso ${JSON.stringify(Ds.iso)} seed ${Ds.seed.toFixed(6)}`)

    const countOk = (r: RunRead, n: number): boolean =>
      Math.abs(r.weight0 - n) <= COUNT_TOL && Math.abs(r.weight - n) <= COUNT_TOL

    W1 &&= countOk(C, 192)
    W2 &&= countOk(D, 48)
    LC &&= C.unborn === 0 && D.unborn === 0 && countOk(Cs, 192) && countOk(Ds, 48)
    H &&= [C, D, Cs, Ds].every(r => isoGap(r.iso0, r.iso) <= ISO_TOL)
    H &&= isoGap(C.iso0, { mean: [0, 0, 0], casimir: 0 }) <= ISO_TOL
    H &&= isoGap(D.iso0, { mean: [24, 0, 0], casimir: 600 }) <= ISO_TOL

    // the band and sector content (plain wake)
    const bandD = bandRead(fr, D.final)
    const bandC = plan.bandC.includes(L) ? bandRead(fr, C.final) : null
    const bandDs = bandRead(fr, Ds.final)

    BD &&= Math.abs(bandD.moving - 4) <= BAND_TOL && Math.abs(bandD.up - 2) <= BAND_TOL

    if (bandC) {
      BD &&= Math.abs(bandC.moving - 16) <= BAND_TOL && Math.abs(bandC.up - 8) <= BAND_TOL
    }

    log(`L ${L} bands: C ${JSON.stringify(bandC)} D ${JSON.stringify(bandD)} Ds ${JSON.stringify(bandDs)}`)

    // S minus D of the holes relative to the full sea, and stationarity, on L = 4
    if (L === 4) {
      const scC = sectorCounts(s, t, nb, C.final)
      const scD = sectorCounts(s, t, nb, D.final)
      // C's orbitals are members on the empty mesh: relative to the full sea its holes are the rest of the 8 N sector
      // states of each kind, so their S - D is -(the members' S - D)
      const sdC = -(scC.S - scC.D)
      const sdD = scD.S - scD.D

      BD &&= Math.abs(sdC) <= BAND_TOL && Math.abs(sdD) <= BAND_TOL

      const resC = stationarity(s, t, nb, C.final)
      const resD = stationarity(s, t, nb, D.final)

      S &&= resC > MOVING_FLOOR && resD > MOVING_FLOOR

      metrics.sdC = sdC
      metrics.sdD = sdD
      metrics.countSC = scC.S
      metrics.countDC = scC.D
      metrics.countSD = scD.S
      metrics.countDD = scD.D
      metrics.stationaryC = resC
      metrics.stationaryD = resD
      log(`L 4 S-D: C members S ${scC.S} D ${scC.D}; D holes S ${scD.S} D ${scD.D}; stationarity residual C ${resC} D ${resD}`)

      // CF: D's seed in a hand-prepared full sea
      const F = runGrowth(s, {
        t,
        nb,
        birth: new Int32Array(N),
        orbitals: seedD(),
        holes: true,
        cycles,
        reflect: true,
      })

      CF =
        Math.abs(F.weight - D.weight) <= ISO_TOL &&
        isoGap(F.iso, D.iso) <= ISO_TOL &&
        Math.abs(F.seed - D.seed) > DIFFER

      metrics.seedF = F.seed
      log(`CF ${CF}: hand weight ${F.weight} iso ${JSON.stringify(F.iso)} seed ${F.seed} against grown ${D.seed}`)

      // CB: the breaking law, sampled docks
      const sampled = Array.from({ length: last + 1 }, (_, b) => plain.findIndex(x => x === b))
      const Bk = runGrowth(s, {
        t,
        nb,
        birth: plain,
        orbitals: [],
        holes: true,
        cycles,
        reflect: true,
        sampled,
      })
      const perHole = Bk.iso.mean[0]! / Bk.final.length

      CB &&= Bk.outsidePi <= STAY_TOL && Math.abs(perHole - 0.5) <= ISO_TOL && CBgauss

      metrics.cbOutside = Bk.outsidePi
      metrics.cbPerHole = perHole
      log(`CB ${CB}: sampled ${sampled.length} docks, ${Bk.final.length} holes, outside Pi ${Bk.outsidePi}, <T_1> per hole ${perHole}`)

      // CT: the unchanged stream
      const Tt = runGrowth(s, { t, nb, birth: plain, orbitals: seedC(), holes: false, cycles, reflect: false })

      CT = Tt.weight < 1 && C.weight > 191
      metrics.ctWeight = Tt.weight
      log(`CT ${CT}: weight ${Tt.weight}`)
    }

    density.push(Math.max(...[C, D, Cs, Ds].map(r => orderDensity(r.iso, N))))

    Object.assign(metrics, {
      [`N_${L}`]: N,
      [`lastBirth_${L}`]: last,
      [`weightC_${L}`]: C.weight,
      [`weightD_${L}`]: D.weight,
      [`weightCs_${L}`]: Cs.weight,
      [`weightDs_${L}`]: Ds.weight,
      [`gramC_${L}`]: C.gram,
      [`gramD_${L}`]: D.gram,
      [`casimirC_${L}`]: C.iso.casimir,
      [`casimirD_${L}`]: D.iso.casimir,
      [`casimirDs_${L}`]: Ds.iso.casimir,
      [`T1D_${L}`]: D.iso.mean[0]!,
      [`T1Ds_${L}`]: Ds.iso.mean[0]!,
      [`seedC_${L}`]: C.seed,
      [`seedD_${L}`]: D.seed,
      [`seedCs_${L}`]: Cs.seed,
      [`seedDs_${L}`]: Ds.seed,
      [`movingD_${L}`]: bandD.moving,
      [`upD_${L}`]: bandD.up,
      [`movingDs_${L}`]: bandDs.moving,
      [`upDs_${L}`]: bandDs.up,
      [`movingC_${L}`]: bandC?.moving ?? -1,
      [`upC_${L}`]: bandC?.up ?? -1,
      [`density_${L}`]: density[si]!,
    })
  })

  // B: some covariant run keeps an order parameter that does not dilute
  const Bgate =
    density.length >= 2 &&
    density[0]! > 0 &&
    density[1]! >= density[0]! / 2

  const hard = V0 && V1 && W1 && W2 && LC && H && BD && S && Gok && Bgate
  const controls = CF && CB && CT
  const status = !hard ? 'fail' : !controls ? 'partial' : 'pass'

  notes.push(
    `Depth L1 (the commutant, the light cone, the conservation laws, Gauss) and L2 (the growing runs). One-body cycle; the pair pieces are phases on every uniform sea and commute with every conserved quantity gated. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  )

  return verdict({
    status,
    claim: `V0 ${V0} (engine gap ${v0Gap.toExponential(1)}) V1 ${V1} (commutant R0 ${comR0.dimension}, R1 ${comR1.dimension}, accepted ${Math.min(comR0.accepted, comR1.accepted).toExponential(2)}, rejected ${Math.max(comR0.rejected, comR1.rejected).toExponential(1)}) W1 ${W1} W2 ${W2} LC ${LC} H ${H} BD ${BD} S ${S} G ${Gok} B ${Bgate} (order parameter per dock ${density.map(d => d.toFixed(6)).join(', ')} at L = ${plan.sides.join(', ')}); controls CF ${CF} CB ${CB} CT ${CT}`,
    metrics: {
      V0: flag(V0),
      V1: flag(V1),
      W1: flag(W1),
      W2: flag(W2),
      LC: flag(LC),
      H: flag(H),
      BD: flag(BD),
      S: flag(S),
      G: flag(Gok),
      B: flag(Bgate),
      v0Gap,
      commutantR0: comR0.dimension,
      commutantR1: comR1.dimension,
      breakingGauss: bw.value,
      ...metrics,
      seconds: (Date.now() - started) / 1000,
    },
    control: { CF: flag(CF), CB: flag(CB), CT: flag(CT) },
    notes: notes.join(' '),
  })
}
