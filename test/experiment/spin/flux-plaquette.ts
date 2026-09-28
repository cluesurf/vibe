// A TRIANGLE PLAQUETTE TERM FOR THE Z3 LINK FLUX: CAN A MAGNETIC PIECE UNDO THE TREE AND MAKE A TIED MEMBER LIGHT
// WHILE THE STRING STILL CONFINES (E-SPN-0151)? E-SPN-0150's local Z3 electric flux records each member's path, so a
// member tied to a charge walks the 24-regular tree and sits above the Kesten floor pi/2 - arcsin(rho cos m0) >= 1.159.
// Its NEXT asked for a magnetic term that lets flux patterns differing by a closed loop interfere. This file derives that
// term on D4's smallest loops, derives what it can and cannot do, and runs the one form that can act on a tied member.
//
// DERIVED BEFORE THE RUN (the machinery: code/measure/flux-plaquette; energies eps in E-SPN-0146's units).
// 1. THE LOOPS. Roots u, v with u . v = 1 close a triangle x, x + u, x + v. 8 triangles per link (the third dock x + b,
//    b . r = 1), 32 per dock (12 x 8 / 3), in 32 shapes, two per A2 subsystem. Every square (u . v = 0, 18 per dock) is the
//    equator of a 16-cell, the D4 Delaunay cell, and is the sum of the 4 triangles coning it to an apex; every rhombus (u .
//    v = +-1, 48 per dock) is 2 triangles. So the triangles generate every closed Z3 flux (I1, exact), and any two Gauss-
//    legal patterns with the same charges differ by a sum of triangle shifts.
// 2. THE PIECE. f(U_p) = lambda I + (1 - lambda) Pi_0, Pi_0 = (I + U_p + U_p^2)/3 the flat projector, lambda a norm-one
//    element of Z[w][1/42] (a ringUnit, the string's own ring): stay (1 + 2 lambda)/3, shift once or twice (1 - lambda)/3.
//    Its eigenvalues are 1 on the flat combination and lambda on the curved ones: exp(-i theta [F_p != 0]), Kogut-
//    Susskind's magnetic term at angle theta = -arg lambda, exact in the ring (I2). A shift adds a closed loop, so GAUSS'S
//    LAW IS KEPT on every branch, and the piece moves no member: REACH is the stream's, one root a beat (c). c* is a
//    theorem about bands on D4 and binds only where the member walks D4.
// 3. THE KS FORM (every triangle, always). All U_p are shifts of one abelian register, so they commute: the product is
//    ORDER-FREE and COVARIANT under W(F4). But the empty register is not inert: each face keeps it with amplitude (1 + 2
//    lambda)/3, weight (5 + 4 cos theta)/9, so loops are made from nothing everywhere (I3 reads it). What it keeps is
//    the FLAT state F = 0 (the uniform sum over closed loops), not E = 0.
//    THEOREM A (the decisive check). The member's hop is a shift of the same register (and the coin never reads it), so
//    the KS piece COMMUTES WITH THE WHOLE STRINGLESS WALK: U^t = M^t W^t, and M acts on the register alone, so the member's
//    reduced state is independent of theta at every beat from every register-definite start. At sigma = 0 the KS term
//    cannot move a tied member off the Kesten floor by any amount at any coupling (P1a, predicted to FAIL at float
//    rounding). The tree is not a property of the missing magnetic term: it is the E = 0 register itself, which is the
//    uniform mixture over every Z3 gauge field F (the Haar average of strong coupling, beta = 0, that keeps only loops run
//    0 mod 3 times; E-SPN-0150's triple loops).
//    THEOREM B (lightness against tension). The hop is block-diagonal in F; in F = 0 the member walks D4 exactly (edge eps
//    = m0) at every theta, theta = 0 included, and the flat state is an exact eigenstate at sigma = 0. In ANY joint
//    eigenstate of the U_p every link's flux is uniform on Z3 (a closed loop runs through every link), so the string's
//    cost, the number of links holding flux, has mean 2/3 a link wherever the charges are: THE STRING TENSION IS EXACTLY 0.
//    Exact D4 lightness and any tension exclude each other, for every magnetic piece that is a function of the U_p. The
//    strong-g limit is this flat, flux-loop-condensed (deconfined) phase; the weak-g limit the E = 0 electric (confined)
//    phase, tension sigma a link, members on the tree.
// 4. THE CONTROLLED FORM (E-SPN-0116's control: a face acts only if its oriented values are not all equal). The empty
//    register and the love sea are fixed points (INERT), Gauss is exact. Faces sharing a link do not commute, so the
//    triangles split into 8 classes (8 per link needs 8; each class 4 shapes covering the 12 lines once) acting in a fixed
//    order, which W(F4) does not keep: NOT COVARIANT. It does not commute with the hop, so it CAN move a member: a face
//    on the string's end bends it, and two histories a b and c (r_a + r_b = r_c) can land on one pattern. But each shift
//    it makes on a string also writes a new pattern (a bent or decorated string), a fresh which-path record, at the same
//    order: per flux link and beat a weight 16 |1 - lambda|^2/9 = (32/9)(1 - cos theta) leaves the plain string. PREDICTED:
//    the interference it restores and the decoration it writes grow together as theta^2; where the first is of order one
//    the string has boiled past any box. P1b predicted to FAIL.
// 5. THE WINDOW. What is known: 4d Z3 lattice gauge theory has one transition, first order, at its self-dual point
//    (Creutz, Jacobs and Rebbi 1979; Z_N with N <= 4 alike, N >= 5 adds a Coulomb phase with a massless photon and a 1/r
//    potential, which does not confine either). The reason is structural: Z3 admits a cubic invariant, so its mean-field
//    transition is first order, and the rule's gauge field lives in 4 space dimensions plus the beat, deeper in the mean-
//    field regime. A first-order transition leaves a finite correlation length on the confined side: the tension jumps
//    to zero at the transition instead of falling continuously, so there is NO window where the lift above m0 and the
//    tension are both small. The rule's version is worse: a beat has no ground state, and a generic state heats toward the
//    maximally mixed register, which is the uniform F mixture, the tree again. Only the small-angle (Trotter) regime
//    imitates the Hamiltonian H = sigma H_E + theta H_B, whose phases are the two limits of point 3.
// So the light-and-confined window does not exist for any Z3 plaquette term. P3 and P4 are gated on P1 and are not run
// when P1 fails.
//
// GATES, fixed before the gate run. The light unit u = ringUnit(-1, 4) (m0 0.190126). The member starts at the origin,
// empty register, its 24 slots alike, sigma = 0. T = 3 beats (the first beat where D4 and the tree differ: at beat 2 the
// two paths to r_a + r_b arrive in different slots).
//  P1 ONE TIED MEMBER LEAVES THE TREE, either
//   P1a the KS form on the 3 triangles on the link from the origin along slot 0 (classes 0, 1, 2), theta alpha, 2 pi/3,
//       pi: the member's reduced state (24 x 24 per dock) moves from the piece-off one by more than 1e-6 at some theta; or
//   P1b the controlled form on the cost box 4, theta 0.0936, 0.187, alpha, pi/3, 2 pi/3, pi: at some theta the
//       interference fraction I(3) >= 0.5 with the weight absorbed at the box <= 1e-2. I(t) = <P - P_tree, P_D4 -
//       P_tree> / |P_D4 - P_tree|^2 over the member's dock distribution P at beat t: 0 the tree, 1 the stringless D4 walk.
//  P2 EXACT: every pattern any run interns is Gauss-legal with the fear at the member's dock; the controlled form keeps
//     the vacuum (the rule with the register on the empty box and the love sea, side 4, 32 beats, at the light unit: one
//     branch, no link ever holding flux, so every face is off); every pattern holding weight after t beats has the
//     member within t root steps (reach c).
//  P3 (only if P1): the static pair's string energy grows linearly with separation at the chosen theta.
//  P4 (only if P1 to P3): a light composite holds (E-SPN-0150 L3's witness, isotropic to 1e-6) with R toward 1.
// CONTROLS (a failure makes the verdict partial). C1 theta = 0 reproduces E-SPN-0150: the piece off equals link-flux
//  treeBeat on wordSpace(3) bit for bit (===) at every word, slot and beat, and the controlled path at lambda = 1 equals
//  the piece off bit for bit. C2 the reduced-state witness can see a change: the controlled form at theta 0.0936 moves the
//  reduced state by more than 1e-6 (so P1a's null is not blindness).
// INSTRUMENT (a failure makes the verdict partial). I1 the census: 32 shapes, 8 per link, 144 of 144 squares and 384 of
//  384 rhombi from the origin equal to triangle sums, 8 classes of 4 with disjoint lines. I2 every piece exactly unitary
//  in Z[w][1/42]. I3 the KS form alone on the empty register over the 3 faces keeps weight ((5 + 4 cos theta)/9)^3 in one
//  beat, to 1e-14.
// READ, gating nothing: per theta the absorbed weight and the plain-string weight (on the tree's own words) at each beat,
//  |P - P_tree|, and the cost profile.
// Verdict: partial if the instrument or a control fails; pass if P1 to P4 hold; fail otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/pq-probe2-3-3.log: the KS form on 3 faces, 3
//  beats: reduced-state gap to the piece off 6.2e-17, 2.1e-17, 2.8e-17 at alpha, 2 pi/3, pi (Theorem A). tmp/pq-probe1-
//  3-4.log: the census as in I1; the piece off equals treeBeat on 955,656 amplitudes; the controlled form on the cost box 4
//  interns 427,196 patterns by beat 3 at every theta; at theta 0.0936 it absorbs 3.0e-3 and I(3) = 0.020; at alpha it
//  absorbs 0.20 in the first beat and 0.68 by beat 3; at pi/3 0.96 by beat 3, at 2 pi/3 0.9988 in the first beat. A cost
//  box 6 did not finish one beat (the decorations fill it). tmp/pq-probe3-3.log: at the strong string sigma = alpha the
//  tied member's root level is eps -1.2940 on the tree and -1.2839 for a D4 member in the same well, 0.01 apart, so a
//  strong string cannot tell the two apart and the gate reads the stringless member at short times instead.
//
// FIRST RUN (tmp/pq-exp-run1.log, 556 s): FAIL on P1, as predicted; P2, both controls and the instrument hold. No gate
//  moved and none was rerun.
//  - P1a fails: the KS form moves the member's reduced state by 6.2e-17, 2.1e-17, 2.8e-17 at alpha, 2 pi/3, pi, while
//    its register leaves the plain string (plain weight 0.07, 0.23 to 1.00 and back, 0.008 at beat 3): Theorem A, read.
//  - P1b fails:
//      theta     I(3)      absorbed(3)   plain string (beats 1, 2, 3)
//      0.0936    0.0205    3.0e-3        0.992  0.994  0.966
//      0.187     0.255     2.6e-2        0.969  0.972  0.896
//      alpha     (7.95)    0.685         0.620  0.437  0.212
//      pi/3      (11.2)    0.958         0.245  0.114  0.029
//      2 pi/3    (11.7)    1.000         6e-4   1e-4   0
//      pi        (11.7)    1.000         0      0      0
//    The whole D4-to-tree gap in the member's dock distribution at beat 3 is 1.59e-2. At 0.0936, where the box loses
//    only 3.0e-3, the piece restores 2% of it (3.8e-4 of movement) while 3.4e-2 of the weight has left the plain string:
//    about a hundred times more new path record than erased. HONEST LIMIT OF THE WITNESS: I(3) is clean only where the
//    absorbed weight is well under the 1.59e-2 gap. At 0.187 the box loss (2.6e-2) exceeds the gap, so its I = 0.255 is not
//    separable from the loss, and from alpha on the bracketed values are box loss, not interference; there P1b fails on
//    its absorbed clause. The test therefore shows the piece's cost (the string boils) cleanly and its benefit cleanly
//    only at small theta.
//  - P2 holds: every one of the interned patterns in every run (13,273 to 427,196) Gauss-legal with the fear at the
//    member's dock, no member past t root steps, the rule's empty box and love sea (side 4, 32 beats, 196,608 sea
//    crossings) exact with no link ever holding flux, so the controlled piece never acts there.
//  - C1: the piece off equals treeBeat on 955,656 amplitudes bit for bit, and lambda = 1 equals the piece off bit for
//    bit. C2: the controlled piece moves the reduced state by 2.0e-3 at 0.0936. I1 to I3 exact (I3's kept weight equals
//    ((5 + 4 cos theta)/9)^3 to 1.4e-17).
//  - P3, P4 not run (gated on P1).
// NEXT. A Z3 register cannot give light members and a confining string at once (Theorem B exactly, the first-order
//  transition near it), and the vacuum-inert form of its magnetic term decorates strings faster than it merges them. A
//  confined light member needs a continuous confinement transition, which needs a NON-ABELIAN link register. On this mesh
//  the natural one is the binary tetrahedral group 2T, the 24 unit Hurwitz quaternions that are the roots themselves, a
//  finite subgroup of SU(2). Its known caveat: finite subgroups freeze at a first-order transition at weak coupling
//  (Petcher and Weingarten 1980, Bhanot and Rebbi 1981), and 2T freezes before the SU(2) scaling region while the binary
//  icosahedral group (120) reaches it. The first check there is gauge-only, two static charges: does the string energy
//  per link fall continuously toward zero as the plaquette coupling grows, before any freezing, on the largest box.
//
// THE EXACT EMPTY REGISTER IS THE CONFINING VACUUM, NOT A TREE BY ACCIDENT. E-SPN-0150's Kesten floor is exact on the
//  free tree; the true register space is the Z3 homology cover of D4, which is amenable, so its spectrum reaches m0 only
//  through regions where the averaged field happens to be flat, a Lifshitz tail of weight about 3^-(the triangles in a
//  ball), invisible at any affordable time.
//
// Depth L1 (the loop census, commutation of shifts, the flat-sector identity) and L2 (Kogut-Susskind's magnetic term on a
// discrete-time walk; the strong-coupling and deconfined limits of Z3 lattice gauge theory). DETERMINISM: no random
// numbers; placed starts. NOTHING MOVES: the piece changes values on the links of one face; the stream takes each slot's
// value one dock along; the register is a value on a link.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { blockGap, d4Walk, faceOf, loopCensus, pieceExact, TiedFlux, tiedBlocks, tiedCostProfile, tiedPositions, triangles, type Face } from '@/code/measure/flux-plaquette'
import { patternGauss, patternKey, ruleVacuumFlux, treeBeat, wordPattern, wordSpace } from '@/code/measure/link-flux'
import { overEmpty, ringUnit, unitAngle, vibeDockExact, vibeShape } from '@/code/measure/swap-string'
import { d4Ball, d4Steps } from '@/code/measure/swap-sector'

const LIGHT: readonly [number, number] = [-1, 4]
const KS_THETAS: readonly (readonly [string, number, number])[] = [
  ['alpha', 1, 0],
  ['2pi/3', 0, 2],
  ['pi', 0, 3],
]
const CONTROLLED_THETAS: readonly (readonly [string, number, number])[] = [
  ['0.0936', 3, 4],
  ['0.187', -6, 4],
  ['alpha', 1, 0],
  ['pi/3', 0, 1],
  ['2pi/3', 0, 2],
  ['pi', 0, 3],
]
const ONE: readonly [number, number] = [0, 0]
const KS_FACES = 3
const MOVED = 1e-6
const INTERFERENCE = 0.5
const ABSORB = 1e-2
const VACUUM_TOLERANCE = 1e-14
const CENSUS = { types: 32, perLink: 8, squares: 144, rhombi: 384, classes: 8 }

export type PlaquettePlan = { beats: number; box: number; vacuumBeats: number; vacuumSide: number }

export const GATE_PLAN: PlaquettePlan = { beats: 3, box: 4, vacuumBeats: 32, vacuumSide: 4 }

export default experiment({
  id: 'spin/flux-plaquette',
  code: 'E-SPN-0151',
  title: 'a triangle plaquette term for the Z3 link flux cannot make a tied member light, fail (P1): the Kogut-Susskind piece (order-free, W(F4) covariant, Gauss exact, not inert on the empty register) commutes with the member walk, so the member reduced state is unchanged to 6e-17 at every angle, and D4 motion exists only in the flat sector, where every link flux is uniform and the string tension is exactly 0; the vacuum-inert controlled piece (8 ordered classes, not covariant) does move the member but writes more path record than it erases: at theta 0.0936 it restores 2% of the D4-to-tree difference while 3.4e-2 of the weight leaves the plain string (twice that whole difference), and from theta alpha the string boils past the cost-4 box within 3 beats (0.69 to 1.00 absorbed); Gauss holds on 427,196 patterns, the vacuum and love sea stay exact, and the piece off reproduces E-SPN-0150 bit for bit; Z3 in 4d has a first-order transition, so no light-and-confined window exists',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return fluxPlaquetteRun(GATE_PLAN)
  },
})

type Run = { name: string; theta: number; positions: Map<string, number>[]; blocks: Map<string, Float64Array>[]; absorbed: number[]; plain: number[]; profile: number[][]; patterns: number; gaussBad: number; reachBad: number; amplitudes: Map<string, Float64Array>[] }

export function fluxPlaquetteRun(plan: PlaquettePlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const e2 = (x: number): string => x.toExponential(2)
  const u = ringUnit(LIGHT[0], LIGHT[1])
  const shape = vibeShape(overEmpty(vibeDockExact(1, 0, u), u))
  const table = Float64Array.from([shape.c[0], shape.c[1], shape.beta[0], shape.beta[1]])
  const T = plan.beats

  // ---------------- I1, I2 ----------------
  const census = loopCensus()
  const I1 = census.types === CENSUS.types && census.perLink === CENSUS.perLink && census.squares === CENSUS.squares && census.squaresFilled === CENSUS.squares && census.rhombi === CENSUS.rhombi && census.rhombiFilled === CENSUS.rhombi && census.linesDistinct && census.classes === CENSUS.classes && census.classesDisjoint
  const pieces = [...KS_THETAS, ...CONTROLLED_THETAS, ['one', ONE[0], ONE[1]] as const].map(([name, k, j]) => ({ name, ...pieceExact(ringUnit(k, j)) }))
  const I2 = pieces.every(p => p.unitary)

  log(`I1 ${I1} ${JSON.stringify(census)}; I2 ${I2}`)

  // the tree's words and their patterns (C1, and the plain-string weight)
  const ws = wordSpace(T)
  const wordKeys = new Map<string, number>()

  for (let w = 0; w < ws.words; w++) wordKeys.set(patternKey(wordPattern(ws, w)), w)

  // ---------------- the runs ----------------
  const ksFaces: Face[] = (triangles().onLine.get(0) as { type: number; offset: number[] }[]).slice(0, KS_FACES).map(t => faceOf(t.type, t.offset))
  const runOf = (name: string, lambda: readonly [number, number] | null, kind: 'off' | 'controlled' | 'ks', box: number, keep = false): Run => {
    const p = lambda ? pieceExact(ringUnit(lambda[0], lambda[1])) : null
    const magnetic = kind === 'off' || !p ? ({ kind: 'off' } as const) : kind === 'ks' ? ({ kind: 'ks', stay: p.stayFloat, move: p.moveFloat, faces: ksFaces } as const) : ({ kind: 'controlled', stay: p.stayFloat, move: p.moveFloat } as const)
    const s = new TiedFlux(shape, 0, magnetic, box)
    let re = new Float64Array(24)
    let im = new Float64Array(24)
    const out: Run = { name, theta: lambda ? unitAngle(ringUnit(lambda[0], lambda[1])) : 0, positions: [], blocks: [], absorbed: [], plain: [], profile: [], patterns: 0, gaussBad: 0, reachBad: 0, amplitudes: [] }
    let lost = 0

    s.intern([], [0, 0, 0, 0])
    for (let d = 0; d < 24; d++) re[d] = 1 / Math.sqrt(24)

    for (let t = 1; t <= T; t++) {
      const r = s.beat(re, im)

      re = r.re
      im = r.im
      lost += r.lost

      let plain = 0

      for (let i = 0; i < s.size && i * 24 < re.length; i++) {
        let w = 0

        for (let d = 0; d < 24; d++) w += (re[i * 24 + d] as number) ** 2 + (im[i * 24 + d] as number) ** 2
        if (w === 0) continue
        if (wordKeys.has(patternKey(s.patterns[i] as number[]))) plain += w
        if (d4Steps(s.where[i] as number[]) > t) out.reachBad++
      }

      out.positions.push(tiedPositions(s, re, im))
      out.blocks.push(tiedBlocks(s, re, im))
      out.absorbed.push(Math.abs(lost))
      out.plain.push(plain)
      out.profile.push(tiedCostProfile(s, re, im))
      // the nonzero amplitudes by pattern (kept for the two runs C1 compares)
      if (keep) {
        const m = new Map<string, Float64Array>()

        for (let i = 0; i < s.size && i * 24 < re.length; i++) {
          const v = Float64Array.from([...re.subarray(i * 24, i * 24 + 24), ...im.subarray(i * 24, i * 24 + 24)])

          if (v.some(x => x !== 0)) m.set(patternKey(s.patterns[i] as number[]), v)
        }

        out.amplitudes.push(m)
      }
    }

    for (let i = 0; i < s.size; i++) {
      const g = patternGauss(s.patterns[i] as number[])
      const x = s.where[i] as number[]

      if (!g.legal || g.fear.some((v, k) => v !== x[k])) out.gaussBad++
    }

    out.patterns = s.size
    log(`${kind} ${name}: patterns ${s.size}, absorbed ${out.absorbed.map(e2).join(' ')}, plain ${out.plain.map(x => x.toFixed(6)).join(' ')}, gauss bad ${out.gaussBad}, reach bad ${out.reachBad}`)

    return out
  }

  const off = runOf('off', null, 'off', plan.box, true)

  // ---------------- C1: the tree bit for bit, and lambda = 1 ----------------
  let c1Compared = 0
  let c1Differ = 0
  {
    let wre = new Float64Array(ws.words * 24)
    let wim = new Float64Array(ws.words * 24)
    const s = new TiedFlux(shape, 0, { kind: 'off' }, T)
    let re = new Float64Array(24)
    let im = new Float64Array(24)

    s.intern([], [0, 0, 0, 0])
    for (let d = 0; d < 24; d++) {
      wre[d] = 1 / Math.sqrt(24)
      re[d] = 1 / Math.sqrt(24)
    }

    for (let t = 1; t <= T; t++) {
      const ore = new Float64Array(ws.words * 24)
      const oim = new Float64Array(ws.words * 24)

      treeBeat(ws, table, 0, wre, wim, ore, oim)
      wre = ore
      wim = oim

      const r = s.beat(re, im)

      re = r.re
      im = r.im

      for (let w = 0; w < ws.words; w++) {
        const i = s.index.get(patternKey(wordPattern(ws, w)))

        for (let d = 0; d < 24; d++) {
          const a = i === undefined || i * 24 >= re.length ? 0 : (re[i * 24 + d] as number)
          const b = i === undefined || i * 24 >= im.length ? 0 : (im[i * 24 + d] as number)

          c1Compared++
          if (a !== wre[w * 24 + d] || b !== wim[w * 24 + d]) c1Differ++
        }
      }
    }
  }
  const unit = runOf('lambda 1', ONE, 'controlled', plan.box, true)
  // the lambda = 1 run interns more patterns (its zero-amplitude branches) in another order, so the two are compared by
  // pattern: the same nonzero patterns, every amplitude equal (===)
  const unitSame = unit.amplitudes.every((a, t) => {
    const b = off.amplitudes[t] as Map<string, Float64Array>

    if (a.size !== b.size) return false

    for (const [k, v] of a) {
      const w = b.get(k)

      if (!w || v.some((x, j) => x !== w[j])) return false
    }

    return true
  })
  const C1 = c1Differ === 0 && c1Compared > 0 && unitSame

  log(`C1 treeBeat ${c1Compared} compared, ${c1Differ} differ; lambda 1 same ${unitSame}`)

  // ---------------- the D4 walk ----------------
  const ball = d4Ball(T + 1)
  const np = ball.points.length
  let dre = new Float64Array(np * 24)
  let dim = new Float64Array(np * 24)
  const d4P: Map<string, number>[] = []

  for (let d = 0; d < 24; d++) dre[(ball.index.get('0,0,0,0') as number) * 24 + d] = 1 / Math.sqrt(24)
  for (let t = 1; t <= T; t++) {
    const r = d4Walk(table, ball.step, np, dre, dim)

    dre = r.re
    dim = r.im

    const q = new Map<string, number>()

    for (let p = 0; p < np; p++) {
      let s = 0

      for (let d = 0; d < 24; d++) s += (dre[p * 24 + d] as number) ** 2 + (dim[p * 24 + d] as number) ** 2
      if (s > 0) q.set((ball.points[p] as number[]).join(','), s)
    }

    d4P.push(q)
  }

  const interference = (r: Run, t: number): { I: number; move: number; gap: number } => {
    const P = r.positions[t] as Map<string, number>
    const B = off.positions[t] as Map<string, number>
    const D = d4P[t] as Map<string, number>
    let dot = 0
    let n2 = 0
    let m2 = 0

    for (const k of new Set([...P.keys(), ...B.keys(), ...D.keys()])) {
      const a = (D.get(k) ?? 0) - (B.get(k) ?? 0)
      const c = (P.get(k) ?? 0) - (B.get(k) ?? 0)

      dot += a * c
      n2 += a * a
      m2 += c * c
    }

    return { I: dot / n2, move: Math.sqrt(m2), gap: Math.sqrt(n2) }
  }

  // ---------------- P1a: KS ----------------
  const ks = KS_THETAS.map(([name, k, j]) => {
    const r = runOf(name, [k, j], 'ks', plan.box + 3 * KS_FACES)
    const gap = Math.max(...r.blocks.map((b, t) => blockGap(b, off.blocks[t] as Map<string, Float64Array>)))

    return { name, theta: r.theta, gap, run: r }
  })
  const P1a = ks.some(x => x.gap > MOVED)

  log(`P1a ${ks.map(x => `${x.name} ${e2(x.gap)}`).join(', ')}`)

  // ---------------- I3: KS on the empty register ----------------
  const i3 = KS_THETAS.map(([name, k, j]) => {
    const p = pieceExact(ringUnit(k, j))
    const s = new TiedFlux(shape, 0, { kind: 'ks', stay: p.stayFloat, move: p.moveFloat, faces: ksFaces }, 3 * KS_FACES)
    const re = new Float64Array(24)
    const im = new Float64Array(24)
    const th = unitAngle(ringUnit(k, j))

    s.intern([], [0, 0, 0, 0])
    re[0] = 1

    // the member held still: the magnetic step alone (the class products), read on the empty register's index
    const kept = ksAlone(s, re, im)
    const want = ((5 + 4 * Math.cos(th)) / 9) ** KS_FACES

    return { name, kept, want, gap: Math.abs(kept - want) }
  })
  const I3 = i3.every(x => x.gap <= VACUUM_TOLERANCE)

  log(`I3 ${JSON.stringify(i3)}`)

  // ---------------- P1b: the controlled form ----------------
  const controlled = CONTROLLED_THETAS.map(([name, k, j]) => {
    const r = runOf(name, [k, j], 'controlled', plan.box)
    const f = interference(r, T - 1)
    const gap = Math.max(...r.blocks.map((b, t) => blockGap(b, off.blocks[t] as Map<string, Float64Array>)))

    return { name, theta: r.theta, I: f.I, move: f.move, absorbed: r.absorbed[T - 1] as number, plain: r.plain, gap, run: r, pass: f.I >= INTERFERENCE && (r.absorbed[T - 1] as number) <= ABSORB }
  })
  const P1b = controlled.some(x => x.pass)
  const P1 = P1a || P1b
  const C2 = (controlled[0] as { gap: number }).gap > MOVED
  const d4Gap = interference(off, T - 1).gap

  log(`P1b ${controlled.map(x => `${x.name}: I ${x.I.toFixed(5)} absorbed ${e2(x.absorbed)} plain ${x.plain.map(y => y.toFixed(4)).join(' ')}`).join('; ')}`)

  // ---------------- P2 ----------------
  const vacuum = [0, 1].map(sea => ({ sea, ...ruleVacuumFlux(u, plan.vacuumSide, sea, plan.vacuumBeats) }))
  const runs = [off, unit, ...ks.map(x => x.run), ...controlled.map(x => x.run)]
  const gaussBad = runs.reduce((s, r) => s + r.gaussBad, 0)
  const reachBad = runs.reduce((s, r) => s + r.reachBad, 0)
  const P2 = gaussBad === 0 && reachBad === 0 && vacuum.every(v => v.exact && v.worstLinks === 0)

  log(`P2 gauss bad ${gaussBad}, reach bad ${reachBad}, vacuum ${JSON.stringify(vacuum)}`)

  // P3 and P4 are run only when P1 holds; this plan has no engine for them, so a P1 that held would make the verdict
  // partial rather than pass on gates never run
  const P3 = false
  const P4 = false
  const instrument = I1 && I2 && I3
  const controls = C1 && C2
  const status = !instrument || !controls || P1 ? 'partial' : 'fail'

  return verdict({
    status,
    claim: `P1 ${P1} (P1a KS: reduced-state gap to the piece off ${ks.map(x => `${e2(x.gap)} at ${x.name}`).join(', ')}; P1b controlled on the cost box ${plan.box}: ${controlled.map(x => `I(3) ${x.I.toFixed(4)} absorbed ${e2(x.absorbed)} at ${x.name}`).join(', ')}); P2 ${P2}; P3, P4 not run; controls C1 ${C1} C2 ${C2}; instrument I1 ${I1} I2 ${I2} I3 ${I3}`,
    metrics: {
      P1: P1 ? 1 : 0,
      P1a: P1a ? 1 : 0,
      P1b: P1b ? 1 : 0,
      P2: P2 ? 1 : 0,
      P3: P3 ? 1 : 0,
      P4: P4 ? 1 : 0,
      C1: C1 ? 1 : 0,
      C2: C2 ? 1 : 0,
      I1: I1 ? 1 : 0,
      I2: I2 ? 1 : 0,
      I3: I3 ? 1 : 0,
      ksGap: Math.max(...ks.map(x => x.gap)),
      smallI: (controlled[0] as { I: number }).I,
      smallAbsorbed: (controlled[0] as { absorbed: number }).absorbed,
      d4TreeGap: d4Gap,
      patterns: off.patterns,
      controlledPatterns: (controlled[0] as { run: Run }).run.patterns,
      c1Compared,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: C1 ? 1 : 0, C2: C2 ? 1 : 0, instrument: instrument ? 1 : 0 },
    notes: `L1 and L2. Light unit m0 0.190126, sigma 0, ${T} beats, cost box ${plan.box}. |P_D4 - P_tree| at beat ${T}: ${e2(d4Gap)}. Census ${JSON.stringify(census)}. Pieces ${pieces.map(p => `${p.name} stay ${p.stayFloat.map(x => x.toFixed(6)).join(',')} move ${p.moveFloat.map(x => x.toFixed(6)).join(',')}`).join('; ')}. KS ${ks.map(x => `${x.name} (theta ${x.theta.toFixed(6)}): gap ${e2(x.gap)}, patterns ${x.run.patterns}`).join('; ')}. I3 ${JSON.stringify(i3)}. Controlled ${controlled.map(x => `${x.name} (theta ${x.theta.toFixed(6)}): I(3) ${x.I.toFixed(5)}, |P - P_tree| ${e2(x.move)}, reduced-state gap ${e2(x.gap)}, absorbed by beat ${x.run.absorbed.map(e2).join(' ')}, plain-string weight ${x.plain.map(y => y.toFixed(5)).join(' ')}, cost profile at beat ${T} ${(x.run.profile[T - 1] as number[]).map(e2).join(' ')}, patterns ${x.run.patterns}`).join('; ')}. C1 ${c1Compared} amplitudes compared with treeBeat, ${c1Differ} differ; lambda 1 same ${unitSame}. P2 gauss bad ${gaussBad}, reach bad ${reachBad}, vacuum ${JSON.stringify(vacuum)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

// the KS step alone on a basis register (the member does not move): the weight kept on the empty register, reading
// TiedFlux's magnetic stage through a beat whose coin and stream are the identity (a table with c = 1, beta = 0 and
// the member's slot sent back to itself would move it, so the stage is read by its own class products instead)
function ksAlone(s: TiedFlux, re: Float64Array, im: Float64Array): number {
  if (s.magnetic.kind !== 'ks') return NaN

  const { stay, move, faces } = s.magnetic
  let amp = new Map<number, [number, number]>([[0, [re[0] as number, im[0] as number]]])

  for (let c = 0; c < 8; c++) {
    const next = new Map<number, [number, number]>()

    for (const [i, a] of amp) {
      const br = s.mixTargets(i, c, faces)

      for (let m = 0; m < br.to.length; m++) {
        const t = br.to[m] as number

        if (t < 0) continue

        let f: [number, number] = [1, 0]

        for (let j = 0; j < (br.code[m] as number); j++) {
          const g = j < (br.moved[m] as number) ? move : stay

          f = [f[0] * g[0] - f[1] * g[1], f[0] * g[1] + f[1] * g[0]]
        }

        const v: [number, number] = [a[0] * f[0] - a[1] * f[1], a[0] * f[1] + a[1] * f[0]]
        const had = next.get(t) ?? [0, 0]

        next.set(t, [had[0] + v[0], had[1] + v[1]])
      }
    }

    amp = next
  }

  const kept = amp.get(0) ?? [0, 0]

  return kept[0] * kept[0] + kept[1] * kept[1]
}


