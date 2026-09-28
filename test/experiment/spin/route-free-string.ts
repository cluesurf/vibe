// A STRING WITH NO ROUTE RECORD (E-SPN-0131). note/research/vibe/roadmap/remaining-pieces.md, "K gated on origin too
// (E-SPN-0128, partial)" and its diagnosis, "coherent motion needs turning that leaves no record". In the vacuum-free
// stand-in (code/measure/frame-meson, E-SPN-0121/0123/0128) the mixed love-fear pair unbinds: after a turn the two sit
// on orthogonal axes, the string register holds the path they took, routes that differ end in different registers and
// cannot interfere, and the pair keeps 0.035 of its weight by beat 24 at rate 3. The change here: the string's state is
// a function of WHERE the two are, not of how they got there. The drift cost is read as a potential V(n) of the fear's
// offset n from the love (code/measure/route-free-meson), and the register is gone.
//
// DERIVED BEFORE THE RUN.
// 1. THE CANONICAL ROUTE-FREE COST. Both vibes keep their frame forever (the mixer turns a vibe only among its frame's 8
//    slots, the coin only on its line, the stream along its slot's root), so both walk on the frame lattice {sum n_a u_a},
//    a hypercubic Z^4 of four orthogonal roots, and the only links either can cross, so the only links the rule's own
//    register ever writes, are frame links. The fewest frame links joining the two is |n|_1 = sum_a |n_a|. That is also
//    what the Gauss-fixed flux costs in an axial gauge (the string laid axis by axis, a monotone staircase, every one of
//    which has |n|_1 links), and it is the minimum of the recorded register's count over every route to n, since a
//    register's nonzero links must join the two charges (Gauss mod 3: the love's and the fear's docks have nonzero
//    divergence, every other dock zero, so the nonzero links contain a path between them). So V = |n|_1 ('frame') is the
//    canonical choice on this mesh, the one that keeps the string on the links the rule writes. The D4 distance of the
//    two docks in the whole mesh (any of 24 roots a step, max(|v|_inf, |v|_1/2) with v = sum n_a r_a) can be shorter.
//    On a frame of roots (1,1,0,0), (1,-1,0,0), (0,0,1,1), (0,0,1,-1): n = (1,1,0,0) is v = (2,0,0,0), 2 against 2;
//    n = (1,0,1,0) is v = (1,1,1,1), 2 against 2; n = (2,1,0,0) is v = (3,1,0,0), 3 against 3; but n = (1,1,1,1) is
//    v = (2,0,2,0), 2 root steps against 4 frame links. It lays string on links neither member can cross, so it is
//    READ ('d4'), not gated.
// 2. IT REDUCES EXACTLY TO THE WORKING DRIFT COST ON ONE LINE. On one axis n = d e_a, |n|_1 = |d|, and the d4 reading
//    is |d| too (v = d r_a, |v|_inf = |d| = |v|_1/2). In one dimension Gauss fixes the register completely (no loop, so
//    no divergence-free part): the recorded string between two charges on a line is the straight one, |d| nonzero trits,
//    whatever the route. The drift cost e^(-i pi n_c/N) with n_c = |d| is then the same diagonal phase, class for
//    class, and with the mixer off the pair never leaves its line. So at rate 0 the route-free beat IS frame-meson's beat
//    on one line, amplitude for amplitude (checked: the autocorrelations agree to 1e-12), and E-SPN-0115's level,
//    energy and m*/E_rest come back (R3). R3 is a consistency check (L1), not evidence.
// 3. THE BEAT IS EXACT AND UNITARY. One beat is mixer, cost, coin, stream. The mixer M = I + (e^(i theta) - 1) J/8 (J/8
//    the projector on the uniform slot vector) is unitary on the 8 slots; its gate reads only whether the two are apart
//    (n != 0), which the mixer does not change, so the gated mixer is block diagonal with unitary blocks. The cost is
//    e^(-i pi V(n)/N), a diagonal phase in the offset. The coin is unitary on each vibe's line pair. The stream sends
//    (n, love slot, fear slot) to (n + s_f e_(a_f) - s_l e_(a_l), same slots): for each slot pair a fixed translation of
//    n, a permutation of the basis, with the Bloch phase e^(-i K . delta) of the love's step. V depends on the difference
//    only, so total momentum K is conserved and each U_K is unitary on the unbounded offset space. The only loss is the
//    window (|n|_1 over the cut), counted as escaped weight, and the floor, counted as dropped: held + escaped + dropped
//    = 1 is checked to 1e-10. (Floats, as measurement; the rule's own integer exactness is not claimed for a stand-in.)
// 4. WHAT IS LOST: GAUSS AS A LOCAL LAW, AND LOCALITY OF THE PHASE.
//    - The register was a set of link values with Gauss a local check at every dock and the cost a sum of one term per
//      link. Here there are no link values: Gauss is not violated, it is ABSENT, replaced by a function V(r_love -
//      r_fear) that no dock holds. The phase of a separated pair is read from both positions at once.
//    - Does a LOCAL form exist, a register whose update when one member steps is supported near that member? For the
//      phase alone, the mover needs dV for its step: along axis a that is sign(n_a) (L1), which flips when the partner
//      crosses the mover's hyperplane x_a = const, at ANY transverse distance. No register of bounded radius sees that,
//      except through a signal that travels, so no local register supplies an instantaneous route-free cost in 2 or more
//      dimensions. In one dimension the partner can only cross the mover at the mover's own dock, which is why the 1d
//      string is local and route-free at once.
//    - For the string itself: suppose a function R(r_love, r_fear), a minimal string, updated locally. Take the two
//      separated by one step along a and Y steps along b, Y large. R has exactly one a-link, somewhere on the staircase.
//      If the fear steps to cancel the a-separation, the string must become straight, which moves every link between the
//      a-link and the fear's end over by one; if the love steps, every link between the love and the a-link. Locality at
//      both ends needs the one a-link within a bounded distance of BOTH ends, impossible once Y exceeds twice that
//      distance. So no function of positions, stored on links, updates locally: the nonlocality grows with the separation.
//      This is the lattice form of Coulomb gauge's instantaneous longitudinal field.
//    - The only local route to a route-free string is a DYNAMICAL flux: Gauss kept locally (the crossed link changes, as
//      now), plus a divergence-free relaxation (plaquette moves) that removes the curl a turned route leaves. In a
//      reversible rule that curl cannot be destroyed, only moved: E-GRV-0130 found a reversible plaquette wave moves the
//      curl around the torus without losing it, and E-GRV-0133 that a finite reversible bulk shares it rather than
//      absorbing it. Carried off as radiation, the route is still recorded (in the radiation), and records decohere as
//      surely as the string did. Routes interfere only if the relaxed string is the SAME state after either route, which
//      a unitary rule allows (many histories, one final state) exactly when the string's own excitations are gapped or
//      fast against the members, so that slow motion leaves them in their ground state (the adiabatic, Born-Oppenheimer
//      limit, where the string's ground-state energy for fixed ends IS V). This rule has no such hierarchy: members and
//      any flux both move one dock a beat.
// 5. WHAT TO EXPECT. With V = |n|_1 every separation costs its own phase per beat, a linear potential along every frame
//    axis, so the relative motion should be Stark-localized on all four axes, and the mixer's turns now keep the phase
//    they would have had on a line. If the recorded string's loss came from the record and not from the turn itself, the
//    pair binds, and the mixer, turning the pair among four axes, should give its band a curvature off the line.
//
// GATES, fixed before the run. Stand-in: D = 6 (N = 13), E-SPN-0115's level on the four frame lines summed (the start of
// E-SPN-0128's O3), the frame of the line (1,1,0,0), window |n|_1 <= 12, floor 1e-14.
//  R1 a bound level at mixer rate 3 (theta = 2 pi/3, E-SPN-0128's angle, fixed here): at K = 0 the Ritz level of the
//     beat with the largest start weight (autocorrelation over 120 beats), evolved 128 beats, keeps fidelity
//     |<v|U^t v>|^2 >= 0.99 AND tail (escaped + dropped + weight at |n|_1 >= 10) <= 1e-3 at EVERY beat.
//  R2 its band curves in at least 2 independent directions: of the inverse mass tensor d2E/dK_i dK_j on e_1, e_2, e_3
//     (Cartesian, the dominant level's energy at K = step times the direction and its opposite, step E_rest/64), at least
//     2 eigenvalues at least a tenth of the one-line meson's curvature / 4 (O3's rule). Tensor and isotropy reported.
//  R3 along one line with the mixer off: E within 1e-9 of E-SPN-0115's 0.3188654375223234, m*/E_rest within 5e-5 of
//     1.7931, and 0 along e_3 to 1e-12.
// CONTROLS (a failed control makes the verdict partial).
//  CR the recorded string reproduces E-SPN-0128's unbinding: frame-meson with its register at rate 3, cut 6 links,
//     floor 1e-10, the same start, retained weight at beat 24 within 5e-4 of 0.0351.
//  CN with no cost the pair is unbound: the R1 procedure with V = 0 at rate 3 on the same window FAILS.
// CHECKS (a failed check makes the verdict partial): held + escaped + dropped = 1 to 1e-10 on every hold; at rate 0 the
// route-free and recorded autocorrelations on one line agree to 1e-12 over 120 beats; the D4 distance formula equals a
// breadth-first search over the 24 roots on every offset with |n|_1 <= 6; on one line every cost but 'none' reads |d|.
// READ, NOT GATED: rates 1 and 1/4; the 'd4' cost at rate 3 (and its tensor if held); the level's energy, start weight,
// residual, string-length shells and off-line weight; m*/E_rest along the line with the mixer on.
// Verdict: partial if a control or check fails; pass if R1, R2 and R3 hold; fail otherwise.
// PROBES: none. The first run (tmp/route-exp-run1.log) printed NaN for the level's mean string, because the placed
// start holds offsets out to 26 links that shellWeights did not size for; the fix touches no gate and the second run
// (tmp/route-exp-run2.log, 394 s) reproduced every gated number to the last digit.
//
// RESULT: FAIL on R1 and R2, R3 and both controls holding, every check passing.
//  - R1: the route-free cost does not hold the pair at rate 3. The dominant Ritz reading is not a level (start weight
//    0.225, residual 0.637), and evolved it keeps fidelity 0.650, 0.529, 0.411, 0.263 at beats 1, 32, 64, 128 with a
//    tail of 0.084 rising to 0.684. The D4 cost (read) does no better: fidelity 0.108, tail 0.861.
//  - R2: all three eigenvalues are NEGATIVE, -0.324, -0.293, -0.281 (e_4 -0.299), isotropy 1.15, against a threshold of
//    +0.0058. The reading is a band top, not a bound level's minimum, and with R1 failing it does not describe a pair.
//  - R3: E 0.3188654375223384, m*/E_rest 1.7930822, transverse 0, and the rate-0 autocorrelation equals the recorded
//    register's to 0 over 120 beats (consistency, L1).
//  - CR: the recorded register keeps 0.0351 by beat 24 (407,601 classes), E-SPN-0128 reproduced. CN: with no cost the
//    fidelity falls to 0.048 and the tail rises to 0.952, so R1 could tell bound from free.
//  - READ, what the route-free cost DOES change: at rate 1/4 fidelity stays at or above 0.9926 for all 128 beats and the
//    tail reaches 1.37e-3 only at the end (fails R1's tail by 37%), where the recorded register kept 0.955 by beat 24 and
//    was still falling. At rate 1: fidelity 0.830, tail 0.056 over 128 beats, against the recorded 0.293 by beat 24. So
//    removing the route record removes most of the loss at small angles, and none of it is enough at the working angle.
//  - WHY, as a reading, not a derivation: a cost that is a phase pi |n|_1/N a beat binds only a relative motion whose
//    quasi-energy spread is small against that gradient (one line: E-SPN-0115). The mixer at rate 3 turns each member
//    with amplitude comparable to the coin, and |n|_1 is flat along the faces of the cross-polytope (n_a up, n_b down at
//    one cost), so a turned pair slides at fixed cost and its spread outruns the gradient. The loss that remains is the
//    turn's own kinetic spread, not a record.
//  So the missing piece is NOT only a string with no route record. Route freedom is necessary (the recorded string fails
//  at every angle) and at small angles nearly sufficient, but at the working angle the pair also needs a binding stronger
//  than the drift cost's pi/N a link, or a mixer weaker than rate 3. The question of a LOCAL route-free register (point 4)
//  is therefore not yet the deciding one.
//
// Depth L2: a stand-in (floats, no vacuum, the rule's pieces with the register replaced), with a control that could
// fail (CN) and the recorded register reproduced (CR). DETERMINISM: no random numbers; every start is placed. NOTHING
// MOVES: the cost is a phase, the coin and mixer hand values between slots of one dock, the stream takes each value one
// dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootIndex } from '@/code/measure/crossing-lines'
import { meson, pairEmbed } from '@/code/measure/string-binding'
import { nrSeed, settle } from '@/code/measure/meson-band'
import { addStates, autocorrelation, axisOfLine, frameAxes, frameBeat, frameSpace, innerOf, lineFrame, lineState, normalized, ritzLevels, weightOf, type FrameState } from '@/code/measure/frame-meson'
import { d4Distance, frameLength, offLineWeight, routeAutocorrelation, routeBeat, routeLength, routeLevelVector, routeLineState, routeSpace, shellWeights, type RouteCost, type RouteSpace } from '@/code/measure/route-free-meson'
import { rootsD4 } from '@/code/algebra/group/integer-roots'
import { hermitianEigen } from '@/code/measure/quantum-ladder'
import { LINE_OF } from '@/code/rule/isometric-knit'

const B = rootIndex([1, 1, 0, 0])
const D = 6
const N = 2 * D + 1
const RATE = 3
const CUT = 12
const FLOOR = 1e-14
const RITZ_T = 120
const HOLD_BEATS = 128
const FIDELITY = 0.99
const TAIL = 1e-3
const TAIL_FROM = 10
const E_REST = 0.3188654375223234
const TOTAL = 1.7931
const TOTAL_SAME = 5e-5
const ENERGY_SAME = 1e-9
const TRANSVERSE_SAME = 1e-12
const MASS = Math.PI / 3
const CURVE_FRAC = 1 / 64
const CURVE_SHARE = 0.1
const CURVED_NEEDED = 2
const NORM_SAME = 1e-10
const LINE_FLOOR = 1e-24
const RECORDED_CUT = 6
const RECORDED_FLOOR = 1e-10
const RECORDED_BEATS = 24
const RECORDED_24 = 0.0351
const RECORDED_SAME = 5e-4
const AUTO_SAME = 1e-12
const BFS_REACH = 6
const READ_RATES = [1, 0.25]
const ZERO = [0, 0, 0, 0]

type Entry = { d: number; jl: number; jf: number; amp: [number, number] }
type Level = { energy: number; weight: number; residual: number; coefficients: [number, number][] }

export default experiment({
  id: 'spin/route-free-string',
  code: 'E-SPN-XXXX',
  title:
    "a string with no route record, the drift cost read as V = |n|_1 of the members' offset (the fewest frame links, the axial-gauge string), does not bind the mixed love-fear pair at the working mixer angle, fail (R1, R2): the beat is unitary (norm gap 6e-12) and on one line with the mixer off it is the recorded beat amplitude for amplitude (autocorrelation gap 0, E 0.3188654375, m*/E_rest 1.79308); at rate 3 the dominant level is not a level (start weight 0.225, residual 0.64) and keeps fidelity 0.26 with a tail of 0.68 at |n|_1 >= 10 by beat 128, its curvature negative in every direction (-0.32 to -0.28); no cost is worse (fidelity 0.048, tail 0.95) and the recorded register reproduces E-SPN-0128 (0.0351 by beat 24); read: at rate 1/4 the route-free pair keeps fidelity 0.9926 for 128 beats with a tail of 1.4e-3 (the recorded kept 0.955 by beat 24, still falling) and at rate 1 fidelity 0.83, so removing the route record removes most of the loss at small angles and not enough at rate 3; derived: no register stored on links, as a function of positions, updates locally in two or more dimensions, so a route-free string is nonlocal unless a dynamical flux relaxes to it",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- E-SPN-0115's level on one line, as E-SPN-0128 placed it ----
    const F = lineFrame(B)
    const axisB = axisOfLine(F, LINE_OF[B] as number)
    const uB = frameAxes(F)[axisB] as number[]
    const m = meson(D, 2 * N, 1)
    const level0 = settle(m, nrSeed(m))
    const full = pairEmbed(m, 0, level0.block)
    const entries: Entry[] = []

    for (let i = 0; i < m.b.size; i++) {
      if (full.re[i] === 0 && full.im[i] === 0) continue

      const c = Math.floor(i / m.b.labelCount)
      const r = i % m.b.labelCount

      entries.push({ d: m.b.configs[c]![1]!, jl: Math.floor(r / 2), jf: r % 2, amp: [full.re[i] as number, full.im[i] as number] })
    }

    const fourLines = (space: RouteSpace): FrameState => {
      let s: FrameState = new Map()

      for (let a = 0; a < 4; a++) s = addStates(s, routeLineState(space, a, entries))

      return normalized(s)
    }
    const dominant = (c: [number, number][]): Level => ritzLevels(c).sort((x, y) => y.weight - x.weight)[0] as Level
    const energyAt = (space: RouteSpace, K: readonly number[], start: FrameState): number => dominant(routeAutocorrelation(space, K, start, RITZ_T).c).energy

    // ---- R3: one line, mixer off ----
    const line0 = routeSpace({ frame: F, n: 0, D, cut: 2 * N, floor: LINE_FLOOR }, 'frame')
    const onB = routeLineState(line0, axisB, entries)
    const e0 = energyAt(line0, ZERO, onB)
    const eRest0 = 2 * MASS + e0
    const step0 = eRest0 * CURVE_FRAC
    const curve0 = (energyAt(line0, uB.map(x => x * step0), onB) + energyAt(line0, uB.map(x => -x * step0), onB) - 2 * e0) / (step0 * step0)
    const total0 = 1 / (curve0 * eRest0)
    const transverse = energyAt(line0, [0, 0, step0, 0], onB) - e0
    const R3 = Math.abs(e0 - E_REST) <= ENERGY_SAME && Math.abs(total0 - TOTAL) <= TOTAL_SAME && Math.abs(transverse) <= TRANSVERSE_SAME

    // check: the recorded register on one line at rate 0 is the same beat
    const rec0 = frameSpace({ frame: F, n: 0, D, cut: 2 * N, floor: LINE_FLOOR })
    const recStart = lineState(rec0, axisB, entries)
    const recC = autocorrelation(rec0, ZERO, recStart, RITZ_T).c
    const routeC = routeAutocorrelation(line0, ZERO, onB, RITZ_T).c
    const autoGap = Math.max(...recC.map((z, t) => Math.hypot(z[0] - (routeC[t] as [number, number])[0], z[1] - (routeC[t] as [number, number])[1])))

    log('R3')

    // ---- the R1 procedure: level, hold, tensor ----
    const bound = (cost: RouteCost, n: number, tensorToo: boolean) => {
      const space = routeSpace({ frame: F, n, D, cut: CUT, floor: FLOOR }, cost)
      const start = fourLines(space)
      const lv = dominant(routeAutocorrelation(space, ZERO, start, RITZ_T).c)
      const v = routeLevelVector(space, ZERO, start, lv.coefficients)
      const shells = shellWeights(space, v)
      const tally = { escaped: 0, dropped: 0 }
      const fidelity: number[] = []
      const tail: number[] = []
      let u = v

      for (let t = 0; t < HOLD_BEATS; t++) {
        u = routeBeat(space, ZERO, u, tally)

        const [r, i] = innerOf(v, u)
        const sh = shellWeights(space, u)

        fidelity.push(r * r + i * i)
        tail.push(tally.escaped + tally.dropped + sh.slice(TAIL_FROM).reduce((x, y) => x + y, 0))
      }

      const gap = Math.abs(weightOf(u) + tally.escaped + tally.dropped - 1)
      const held = fidelity.every(f => f >= FIDELITY) && tail.every(x => x <= TAIL)
      const eRest = 2 * MASS + lv.energy
      let tensor: number[][] = []
      let eigen: number[] = []
      let fourth = Number.NaN
      let along = Number.NaN

      if (tensorToo) {
        const e = energyAt(space, ZERO, start)
        const step = eRest * CURVE_FRAC
        const second = (w: readonly number[]): number => (energyAt(space, w.map(x => x * step), start) + energyAt(space, w.map(x => -x * step), start) - 2 * e) / (step * step)
        const unit = (a: number): number[] => [0, 1, 2, 3].map(k => (k === a ? 1 : 0))
        const diag = [0, 1, 2].map(a => second(unit(a)))

        tensor = [0, 1, 2].map(a => [0, 1, 2].map(b => (a === b ? (diag[a] as number) : second(unit(a).map((x, k) => (x + (unit(b)[k] as number)) / Math.SQRT2)) - ((diag[a] as number) + (diag[b] as number)) / 2)))
        eigen = hermitianEigen(3, Float64Array.from(tensor.flat()), new Float64Array(9)).values.slice().sort((x, y) => x - y)
        fourth = second(unit(3))
        along = 1 / (second(uB) * eRest)
      }

      return {
        cost,
        n,
        level: lv,
        eRest,
        shells,
        meanString: shells.reduce((x, w, L) => x + w * L, 0),
        offLine: offLineWeight(space, v),
        fidelity,
        tail,
        minFidelity: Math.min(...fidelity),
        maxTail: Math.max(...tail),
        gap,
        held,
        classes: space.classes.length,
        tensor,
        eigen,
        fourth,
        along,
      }
    }

    const main = bound('frame', RATE, true)
    const curved = main.eigen.filter(x => x >= (CURVE_SHARE * curve0) / 4).length
    const R1 = main.held
    const R2 = curved >= CURVED_NEEDED
    const isotropy = (main.eigen[0] as number) / (main.eigen[2] as number)

    log('R1 R2')

    // ---- CN: no cost ----
    const free = bound('none', RATE, false)
    const CN = !free.held

    log('CN')

    // ---- CR: the recorded register, E-SPN-0128's hold ----
    const recSpace = frameSpace({ frame: F, n: RATE, D, cut: RECORDED_CUT, floor: RECORDED_FLOOR })
    let rs: FrameState = new Map()

    for (let a = 0; a < 4; a++) rs = addStates(rs, lineState(recSpace, a, entries))
    rs = normalized(rs)

    const recTally = { escaped: 0, dropped: 0 }
    const recRetained: number[] = []

    for (let t = 0; t < RECORDED_BEATS; t++) {
      rs = frameBeat(recSpace, ZERO, rs, recTally)
      recRetained.push(weightOf(rs))
    }

    const rec24 = recRetained[RECORDED_BEATS - 1] as number
    const recGap = Math.abs(rec24 + recTally.escaped + recTally.dropped - 1)
    const CR = Math.abs(rec24 - RECORDED_24) <= RECORDED_SAME

    log('CR')

    // ---- reads ----
    const d4 = bound('d4', RATE, false)
    const d4Tensor = d4.held ? bound('d4', RATE, true) : undefined
    const smaller = READ_RATES.map(n => bound('frame', n, false))

    log('reads')

    // ---- checks ----
    // the D4 distance against a breadth-first search over the 24 roots
    const roots = rootsD4()
    const dist = new Map<string, number>([[ZERO.join(','), 0]])
    let front = [ZERO]

    for (let r = 1; r <= BFS_REACH; r++) {
      const next: number[][] = []

      for (const p of front) {
        for (const q of roots) {
          const x = p.map((v, k) => v + (q[k] as number))
          const key = x.join(',')

          if (dist.has(key)) continue
          dist.set(key, r)
          next.push(x)
        }
      }

      front = next
    }

    const probe = routeSpace({ frame: F, n: 0, D, cut: BFS_REACH, floor: FLOOR }, 'd4')
    let bfsOff = 0
    let bfsChecked = 0
    const span = [-BFS_REACH, BFS_REACH]

    for (let a = span[0] as number; a <= (span[1] as number); a++) {
      for (let b = span[0] as number; b <= (span[1] as number); b++) {
        for (let c = span[0] as number; c <= (span[1] as number); c++) {
          for (let d = span[0] as number; d <= (span[1] as number); d++) {
            const n = [a, b, c, d]

            if (frameLength(n) > BFS_REACH) continue

            const v = [0, 1, 2, 3].map(k => n.reduce((s, x, i) => s + x * ((probe.roots[i] as number[])[k] as number), 0))

            bfsChecked++
            if (dist.get(v.join(',')) !== d4Distance(v) || routeLength('d4', probe.roots, n) !== d4Distance(v)) bfsOff++
          }
        }
      }
    }

    let lineOff = 0

    for (let d = -CUT; d <= CUT; d++) {
      for (let a = 0; a < 4; a++) {
        const n = [0, 1, 2, 3].map(k => (k === a ? d : 0))

        for (const cost of ['frame', 'd4'] as RouteCost[]) if (routeLength(cost, probe.roots, n) !== Math.abs(d)) lineOff++
      }
    }

    const normGap = Math.max(main.gap, free.gap, d4.gap, recGap, ...smaller.map(s => s.gap))
    const checked = normGap <= NORM_SAME && autoGap <= AUTO_SAME && bfsOff === 0 && lineOff === 0
    const status = !CR || !CN || !checked ? 'partial' : R1 && R2 && R3 ? 'pass' : 'fail'

    const at = [1, 8, 32, 64, 128]
    const series = (xs: number[], f: (x: number) => string): string => at.map(t => f(xs[t - 1] as number)).join(' ')
    const describe = (b: ReturnType<typeof bound>): string =>
      `cost ${b.cost} rate ${b.n}: held ${b.held}, level E ${b.level.energy.toFixed(6)} (start weight ${b.level.weight.toFixed(4)}, residual ${b.level.residual.toExponential(2)}), fidelity ${series(b.fidelity, x => x.toFixed(5))} (min ${b.minFidelity.toFixed(5)}), tail ${series(b.tail, x => x.toExponential(2))} (max ${b.maxTail.toExponential(2)}), mean string ${b.meanString.toFixed(3)}, off-line ${b.offLine.toFixed(3)}, shells ${b.shells.map(x => x.toExponential(1)).join('/')}, ${b.classes} classes`

    const metrics: Record<string, number> = {
      R1: R1 ? 1 : 0,
      R2: R2 ? 1 : 0,
      R3: R3 ? 1 : 0,
      control_CR: CR ? 1 : 0,
      control_CN: CN ? 1 : 0,
      checked: checked ? 1 : 0,
      levelEnergy: main.level.energy,
      levelStartWeight: main.level.weight,
      levelResidual: main.level.residual,
      eRest: main.eRest,
      minFidelity: main.minFidelity,
      maxTail: main.maxTail,
      meanString: main.meanString,
      offLine: main.offLine,
      curvedDirections: curved,
      eigenMin: main.eigen[0] as number,
      eigenMid: main.eigen[1] as number,
      eigenMax: main.eigen[2] as number,
      isotropy,
      curveFourth: main.fourth,
      curveLine0: curve0,
      curveThreshold: (CURVE_SHARE * curve0) / 4,
      totalAlongMixed: main.along,
      standEnergy0: e0,
      standTotal0: total0,
      standTransverse: transverse,
      freeMinFidelity: free.minFidelity,
      freeMaxTail: free.maxTail,
      recordedRetained24: rec24,
      d4Held: d4.held ? 1 : 0,
      d4MinFidelity: d4.minFidelity,
      d4MaxTail: d4.maxTail,
      normGap,
      autoGap,
      bfsChecked,
      bfsOff,
      lineOff,
      classes: main.classes,
      seconds: (Date.now() - started) / 1000,
    }

    for (const s of smaller) {
      metrics[`rate${s.n}Held`] = s.held ? 1 : 0
      metrics[`rate${s.n}MinFidelity`] = s.minFidelity
      metrics[`rate${s.n}MaxTail`] = s.maxTail
    }
    if (d4Tensor) {
      metrics.d4EigenMin = d4Tensor.eigen[0] as number
      metrics.d4EigenMax = d4Tensor.eigen[2] as number
      metrics.d4Isotropy = (d4Tensor.eigen[0] as number) / (d4Tensor.eigen[2] as number)
    }

    return verdict({
      status,
      claim: `the stand-in's string cost read as V = |n|_1 of the two members' offset (no register): at rate ${RATE} the dominant level holds fidelity >= ${main.minFidelity.toFixed(5)} and tail <= ${main.maxTail.toExponential(2)} over ${HOLD_BEATS} beats (R1 ${R1}), inverse mass eigenvalues ${main.eigen.map(x => x.toFixed(5)).join(', ')} against ${((CURVE_SHARE * curve0) / 4).toFixed(5)} (R2 ${R2}, isotropy ${isotropy.toFixed(4)}), one line at rate 0 gives E ${e0} and m*/E_rest ${total0} (R3 ${R3}); the recorded register keeps ${rec24.toFixed(4)} by beat ${RECORDED_BEATS} (CR ${CR}) and no cost gives fidelity ${free.minFidelity.toFixed(4)}, tail ${free.maxTail.toExponential(2)} (CN ${CN})`,
      metrics,
      control: { recordedRetained24: rec24, freeMinFidelity: free.minFidelity, freeMaxTail: free.maxTail, standEnergy0: e0, standTotal0: total0 },
      notes: `L2. ${describe(main)}. Tensor on e_1..e_3 ${JSON.stringify(main.tensor)}, eigenvalues ${main.eigen.join(', ')}, e_4 curvature ${main.fourth}, one-line curvature ${curve0}, m*/E_rest along the line with the mixer on ${main.along}. CN: ${describe(free)}. CR: recorded retained ${recRetained.map(x => x.toFixed(4)).join(' ')}, ${recSpace.classes.length} classes. Reads: ${describe(d4)}${d4Tensor ? `, tensor eigenvalues ${d4Tensor.eigen.join(', ')}` : ''}; ${smaller.map(describe).join('; ')}. Checks: norm gap ${normGap.toExponential(2)}, rate-0 autocorrelation gap ${autoGap.toExponential(2)}, D4 distance against BFS ${bfsOff} off of ${bfsChecked}, one-line costs ${lineOff} off. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
