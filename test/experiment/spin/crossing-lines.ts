// CAN A BOUND COMPOSITE MOVE OFF A LINE (E-SPN-0110)? note/research/vibe/roadmap/remaining-pieces.md section 3, ideas
// 3a (loves on crossing lines) and 3b (isotropy from the line classes).
//
// DERIVED BEFORE THE RUN.
// 1. VELOCITY. The line law (E-SPN-0098) keeps every vibe's copies on its own mesh line, so a lone vibe's velocity lies
//    along its line and the centroid of n vibes moves at the mean of theirs. For two vibes on lines of roots r_A, r_B
//    the centroid can move only within the plane span{r_A, r_B}.
// 2. THE STRING IS WRITTEN ONLY WHERE A VIBE COPIES. The drift cost's register is a trit on every link, written only by
//    the stream's recorded copy (code/rule/drift-cost-line: f - q forward, f + q back); a closed vibe records nothing,
//    and no piece writes a link that no open vibe crosses. So in 3d, f = f0 + sum over vibes v of q_v on the links
//    between v's start and its present place ALONG ITS OWN LINE. Gauss fixes f only up to closed loops, and the loop
//    part is f0's forever: the rule has no plaquette term (that is idea 3c). How the rule reads f off a line
//    (code/rule/bound-line-pieces): on one ring Gauss leaves one free trit, the cut's c, and f_l = c + Q(l); in 3d the
//    free part is one trit per independent loop, all frozen. So the string's PATH between two lines is fixed, not
//    dynamical: only its ends move, each along its own line.
// 3. THE COST SEPARATES. With one vibe on each of lines A and B, A's links are written by the vibe on A alone and B's
//    by the vibe on B alone, so the cost's count is n_A(s_A) + n_B(s_B) + (f0's links off both lines, a constant): a
//    sum, with no term in the separation. Off the crossing dock the beat is U_A (x) U_B, each factor a lone vibe
//    dragging a string from the fixed point where f0 meets its line: a linear phase potential, the Wannier-Stark hold
//    E-SPN-0104 measured on a lone love (far weight 1.7e-4). So each vibe is held near that point and the composite is
//    a level with NO free direction. On ONE line the count is n(s_1 - s_2), flat under a common shift, which is why the
//    one-line trio moves (E-SPN-0105). A composite moves only along a direction on which the string's count is flat;
//    for vibes on different lines a common shift moves each along its own line and the count grows in every |s_v|. So
//    the reachable span is not the plane of item 1 but the single point where the string meets the lines.
// 4. Z_3. Two LOVES carry charge 2, not 0 mod 3, and Gauss summed over a closed graph is 0, so on a closed window no
//    flux assignment exists at all (counted below on a figure eight of L = 3). Their string must end on a third charge
//    or leave the window; wherever it ends it is frozen (item 2), so item 3 holds whatever it is. The run takes the
//    neutral pair, a love and a fear (idea 1c's meson), whose string closes through the crossing.
// 5. THE CROSSING DOCK. The coin and the like meeting act inside one dock line, so two vibes on two lines at one dock
//    meet only through the collision's bounce piece, which reads the dock's whole occupation: with two single lines it
//    is the isometric map w_P, P = r_1 + r_2 (the working 'pass' kind). Read from the committed table
//    (tmp/move3d-cross-probe, and crossingCensus below): roots at 60 degrees (dot 1) keep their slots; at 90 (dot 0)
//    and 120 degrees (dot -1) they SWAP slots, each leaving on the other's line. For two loves the swap is invisible in
//    the occupation (E-SPN-0100: 'two meeting loves stay on their two lines'); for a love and a fear it sends the love
//    to line B and the fear to line A. It acts only when both are at X, so the holding point stays X. The swap commutes
//    with exchanging the two lines, so the exchange-symmetric product of one one-vibe level on both lines is left
//    EXACTLY invariant (at X it maps the product to its exchange image and back): an exact two-vibe level of the rule
//    with the contact. The plain product and the antisymmetric sum are not.
// 6. 3b. The line law conserves the tone on every line, so a composite on one line class never passes to another: a
//    state spread over the twelve classes is twelve composites, each with its own band E(K . u_l) and its own velocity
//    along u_l, with nothing coupling them. Their MEAN energy is isotropic through K^4, because the 24 D4 roots are a
//    spherical 5-design: sum (n . u)^2 = 3 and sum (n . u)^4 = 3/2 for every unit n in 4d, so on the 3d husk too (the
//    husk's weighting, axes 2 and face diagonals 1, is these twelve projected, and its symbol 6 p^2 - p^4 / 2 is this
//    statement). The sixth moment is not (1/12 of 0.75, 1.125, 0.917 on the axis, face and body diagonal). And the
//    branches separate at speeds comparable to their mean drift. So the line law forbids one isotropic moving
//    composite and allows only an isotropic AVERAGE of line composites, which falls apart into twelve.
//
// THE STAND-IN (code/measure/crossing-lines): the two lines closed into rings of L = 28 docks sharing X, the flux on all
// 2L links carried explicitly, the cost pi / 7 per costly link per beat, the working coin, the contact read on every
// branch from the committed bounce table, the recorded stream; floats as measurement. Two geometries: g60 (roots
// (1,1,0,0) and (1,0,1,0)) and g90 ((1,1,0,0) and (0,0,1,1)). The one-vibe levels are the eigenvectors of the one-vibe
// beat (a vibe with the string's other end a static charge at X); the level is the one of least mean string. The fear's
// level is the love's carried by conjugateOther, and the two-vibe level is (psi + exchangeLines psi) / norm.
//
// GATES, fixed before the first run of this file (N = 7 links, the stand-in's own tail length).
//  M1 the level holds: run 256 beats by the stand-in with the contact, its weight on strings longer than N is at most
//     1e-3 at every beat, on both geometries.
//  M2 its group velocity leaves both lines: boosted along the bisector at K = pi/2 (each vibe k = K cos(theta/2) / 2
//     along its own line, theta the lines' angle), 256 beats, the centroid's least-squares velocity v = a u_A + b u_B
//     has |a| 256 >= 3 and |b| 256 >= 3 docks, on both geometries.
//  M3 its dispersion is the constituents' average: at K = pi/8, pi/4, 3pi/8, pi/2 on the bisector, dE = E(K) - E(0)
//     read by spectralPeak (128 beats, 256 at pi/2) equals [E_1(k_A) - E_1(0)] + [E_1(k_B) - E_1(0)] (E_1 the lone
//     love's band, code/measure/moving-level loneBand) within 5 percent of that prediction at every K, both geometries.
//  CONTROL: the same start with the cost off must fail M1 (largest tail over 128 beats above 1e-3).
//  CALIBRATIONS (each reading can say yes): (a) M2's reading on a string-bound love and fear on ONE line (both on line
//     A, envelope e^(-x^2/8) to |x| <= 4, k = pi/4 each, the lone band's spinor; the stand-in tokens' convention, no
//     contact) reaches |a| 256 >= 3; (b) M3's reading on two free vibes (no cost; the beat then factorizes, so the pair's
//     autocorrelation is the square of one vibe's, run as a packet of width 16 on a ring of 256) gives each bisector
//     K's prediction within 5 percent.
//  CHECKS: the census (dot 1 keep, dot 0 and -1 swap, nothing else, for love+fear and love+love); the Z_3 count on
//     L = 3 (two loves 0 assignments, a love and a fear 9); Gauss on every start entry; the one-vibe level box
//     independent (L = 28 against 42, energy within 1e-9) with eigen residual below 1e-8; separability (no contact:
//     the plain product holds with fidelity at least 1 - 1e-9 over 32 beats); the exact level (fidelity at least
//     1 - 1e-9 over the M1 run).
//  Verdict: partial if a check or calibration fails, pass if M1, M2 and M3 hold, fail otherwise.
// PREDICTED (items 3 and 5, and the probes below): M1 holds, M2 and M3 fail: the pair is held at X, v about 0, dE
// about 0 against a predicted 0.2 at pi/2.
//
// FIRST RUN (850 s, tmp/move3d-exp-run1.log, the record): PARTIAL, by the rule above, no gate moved. M1 holds, M2 and
// M3 fail as predicted, the control and every check hold, but calibration (a) FAILED: the one-line pair packet's
// least-squares velocity over 256 beats is -0.00765 docks a beat, 1.96 docks against the 3 required, although it
// travels (reach 5.52 docks; -0.0206 a beat over the probe's 64 beats). The packet is not one level, and its parts
// drift back, so the slope reading chosen for M2 could not say yes on it. M2's failure is not close either way:
// g60 a = b = -2.2e-5 a beat (0.0056 docks over 256 beats, reach 0.76) against 0.171 each predicted; g90 -4.5e-5
// (reach 0.54) against 0.146. M1: the exchange-symmetric level (E 0.822112, one-vibe level -2.730537 at mean string
// 0.65, 8 one-vibe levels held within N) holds with tail at most 7.19e-5 and fidelity 1 - 1.2e-13 over 256 beats on
// both geometries, while the plain product under the contact falls to fidelity 0.33 (g60) and 0.40 (g90) and the
// antisymmetric sum to 0.06: the contact is real and the symmetric level is exact, as item 5 said. M3: dE stays
// within 9e-4 of 0 (g60 -0.0001, -0.0002, -0.0006, -0.0003 against 0.0166, 0.0655, 0.1441, 0.2487; g90 against
// 0.0111 to 0.1696), and along each line's direction likewise (-0.0009 against 0.2056 at pi/2): no dispersion. The
// same spectral reading on two free vibes gives every prediction within 1.1 percent (calibration (b) holds). Control:
// with the cost off the tail reaches 0.993. Checks: census exact (dot 1 keep 192, dot 0 swap 144, dot -1 swap 192,
// both kind pairs), two loves 0 flux assignments and a love and a fear 9, Gauss on every start entry, box 4e-16,
// residual 9e-13, separability 1 - 1e-13. 3b: the class average's energy agrees over axis, face and body to 1.3e-6,
// 6.6e-5, 1.9e-3 at K = pi/8, pi/4, pi/2 (a K^6 residue: moments 2 and 4 equal, 6 unequal), and the twelve branches'
// velocities spread sqrt 3 = 1.732 times their mean drift at every K: the average moves isotropically and falls apart
// faster than it moves. Title written after the run.
//
// DISCLOSED PROBES (instrument only): tmp/move3d-probe2.log (one-vibe levels: 8 held within N, the nearest at mean
// string 0.65, box independent), tmp/move3d-probe3.log (the plain product: contact off exact, contact on fidelity
// 0.31, tail 4.6e-3; boosted v about 1e-3; the one-line packet moves at 0.021 docks a beat, the crossing packet
// 0.002), tmp/move3d-probe4.log (the symmetric level exact under the contact, E 0.822111; boosted, the peak stays at
// 0.8211 to 0.8221 while the prediction rises).
//
// Depth L2: a stand-in two-vibe dynamics built from the rule's pieces (the bounce table is the committed one), with an
// analytic prediction that could have been wrong (item 3) and a control. DETERMINISM: no random numbers; every start is
// placed. NOTHING MOVES: the cost is a phase, the flux a register written by the stream's own copies.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { loneBand } from '@/code/measure/moving-level'
import {
  boost,
  classAverage,
  conjugateOther,
  crossingCensus,
  decode,
  designSum,
  exchangeLines,
  gaussCount,
  gaussHolds,
  levelState,
  oneBody,
  oneLevels,
  placedPacket,
  productState,
  rootIndex,
  runCross,
  spectralPeak,
  sumStates,
  trackVelocity,
  type Amp,
  type CrossSpec,
  type CrossState,
} from '@/code/measure/crossing-lines'

const L = 28
const L_CHECK = 42
const N = 7
const TAIL = 1e-3
const LONG = 256
const SHORT = 128
const SEPARABLE = 32
const FLOOR = 1e-24
const REACH = 3
const TOL = 0.05
const EXACT = 1e-9
const KS = [Math.PI / 8, Math.PI / 4, (3 * Math.PI) / 8, Math.PI / 2]
const LINE_KS = [Math.PI / 4, Math.PI / 2]
const CAL = { ring: 256, width: 16, radius: 48 }
const PAIR = { radius: 4, k: Math.PI / 4 }
const GEOMETRIES = [
  { name: 'g60', second: [1, 0, 1, 0] },
  { name: 'g90', second: [0, 0, 1, 1] },
] as const

const wrap = (x: number): number => Math.atan2(Math.sin(x), Math.cos(x))
const f4 = (x: number): string => x.toFixed(4)
const f6 = (x: number): string => x.toFixed(6)
const e2 = (x: number): string => x.toExponential(2)
const spinor = (k: number): [Amp, Amp] =>
  loneBand(k).vector.map(c => [c[0], c[1]] as Amp) as [Amp, Amp]
const predicted = (kA: number, kB: number): number =>
  loneBand(kA).energy -
  loneBand(0).energy +
  loneBand(kB).energy -
  loneBand(0).energy

export default experiment({
  id: 'spin/crossing-lines',
  code: 'E-SPN-0110',
  title:
    "two vibes on crossing mesh lines bound by the drift cost's string are held at the crossing and cannot move, partial (M1 holds, M2 and M3 fail, one calibration failed): the rule writes a link only where a vibe copies across it, so the string's path between two lines is frozen and its cost separates into one term per line (n_A(s_A) + n_B(s_B), no term in the separation), and the pair is held at the dock where the string meets both lines; two loves admit no flux at all (Z_3 charge 2: 0 assignments against a love and a fear's 9), and at the crossing the working bounce swaps two vibes whose roots meet at 90 or 120 degrees and keeps them at 60; in the stand-in (rings of 28, explicit flux, the committed bounce table) the exchange-symmetric level holds exactly (tail 7.2e-5, fidelity 1 - 1e-13 over 256 beats, g60 and g90), but boosted along the bisector to pi/2 it moves 2e-5 docks a beat against 0.17 predicted and its energy stays within 9e-4 against a predicted rise to 0.25, while the same reading on two free vibes follows the prediction to 1.1 percent; the one-line pair calibration moved 5.5 docks but its least-squares slope reached 1.96 of the 3 docks required; spreading over the twelve line classes averages to an energy isotropic through K^4 (D4 is a 5-design) but its branches separate at sqrt 3 times the mean drift",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const A = rootIndex([1, 1, 0, 0])

    // ---- checks that need no run ----
    const census = [crossingCensus([1, -1]), crossingCensus([1, 1])]
    const censusText = census.map(c =>
      [...c.entries()]
        .sort()
        .map(([k, v]) => `${k} ${v}`)
        .join(', '),
    )
    const censusHolds = census.every(
      c =>
        c.size === 3 &&
        c.get('1:keep') === 192 &&
        c.get('0:swap') === 144 &&
        c.get('-1:swap') === 192,
    )
    const small: CrossSpec = {
      L: 3,
      roots: [A, rootIndex([1, 0, 1, 0])],
      charges: [1, 1],
      cost: true,
      contact: 'rule',
    }
    const twoLoves = gaussCount(small, [
      { line: 0, p: 1, j: 0 },
      { line: 1, p: 2, j: 0 },
    ])
    const loveFear = gaussCount({ ...small, charges: [1, -1] }, [
      { line: 0, p: 1, j: 0 },
      { line: 1, p: 2, j: 0 },
    ])
    const z3Holds = twoLoves === 0 && loveFear === 9

    // ---- 3b: the class average ----
    const dirs = {
      axis: [1, 0, 0, 0],
      face: [Math.SQRT1_2, Math.SQRT1_2, 0, 0],
      body: [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3), 0],
    }
    const moments = Object.fromEntries(
      Object.entries(dirs).map(([k, n]) => [
        k,
        [2, 4, 6].map(m => designSum(n, m)),
      ]),
    )
    const averages = Object.fromEntries(
      Object.entries(dirs).map(([k, n]) => [
        k,
        [Math.PI / 8, Math.PI / 4, Math.PI / 2].map(K =>
          classAverage(n, K, loneBand),
        ),
      ]),
    )
    const averageSpread = [0, 1, 2].map(i => {
      const es = Object.values(averages).map(
        a => a[i]!.energy - loneBand(0).energy,
      )

      return Math.max(...es) - Math.min(...es)
    })
    const drift = Object.values(averages).map(a => a[0]!)
    const driftRatio = drift.map(
      d => d.spread / Math.hypot(...d.velocity),
    )

    // ---- the geometries ----
    const results = GEOMETRIES.map(g => {
      const B = rootIndex(g.second)
      const spec: CrossSpec = {
        L,
        roots: [A, B],
        charges: [1, -1],
        cost: true,
        contact: 'rule',
      }
      const cosTheta =
        [1, 1, 0, 0].reduce(
          (s, x, c) => s + x * (g.second[c] as number),
          0,
        ) / 2
      const cosHalf = Math.sqrt((1 + cosTheta) / 2)

      // the one-vibe level nearest X, and its box check
      const levelOf = (ring: number) => {
        const o = oneBody(
          { ...spec, L: ring, charges: [1], anchor: -1 },
          0,
        )
        const { levels, residual } = oneLevels(o, N)
        const sorted = levels
          .slice()
          .sort((a, b) => a.meanString - b.meanString)

        return {
          o,
          level: sorted[0]!,
          held: levels.filter(l => l.tail <= TAIL).length,
          residual,
        }
      }

      const one = levelOf(L)
      const big = levelOf(L_CHECK)
      const boxOff = Math.abs(wrap(one.level.energy - big.level.energy))
      const loveState = levelState(one.o, one.level.vector)
      const product = productState(
        loveState,
        conjugateOther(spec, loveState),
      )
      const level = sumStates(product, exchangeLines(spec, product), 1)
      const antisymmetric = sumStates(
        product,
        exchangeLines(spec, product),
        -1,
      )

      let gauss = true

      for (const k of level.keys()) {
        const d = decode(k)

        gauss &&= gaussHolds(spec, d.bodies, d.flux)
      }

      log(`${g.name}: levels`)

      // separability, the exact level (M1), the antisymmetric sum, the control
      const separable = runCross(
        { ...spec, contact: 'off' },
        product,
        SEPARABLE,
        N,
        FLOOR,
      )
      const plain = runCross(spec, product, SEPARABLE, N, FLOOR)
      const held = runCross(spec, level, LONG, N, FLOOR)
      const anti = runCross(spec, antisymmetric, SEPARABLE, N, FLOOR)
      const control = runCross(
        { ...spec, cost: false },
        level,
        SHORT,
        N,
        FLOOR,
      )
      const e0 = spectralPeak(held.overlap)

      log(`${g.name}: M1`)

      // the bisector (M2 at pi/2, M3 at every K)
      const bisector = KS.map(K => {
        const k = (K * cosHalf) / 2
        const r = runCross(
          spec,
          boost(spec, level, [k, k]),
          K === Math.PI / 2 ? LONG : SHORT,
          N,
          FLOOR,
        )
        const peak = spectralPeak(r.overlap)
        const dE = wrap(peak.energy - e0.energy)
        const pred = predicted(k, k)

        return {
          K,
          k,
          dE,
          pred,
          share: peak.share,
          velocity: trackVelocity(spec, r.centroid),
          least: Math.min(...r.fidelity),
          tail: Math.max(...r.tail),
          beats: r.fidelity.length,
          vPred: loneBand(k).slope / 2,
        }
      })

      log(`${g.name}: bisector`)

      // along each line's direction
      const along = [0, 1].flatMap(line =>
        LINE_KS.map(K => {
          const kA = line === 0 ? K / 2 : (K * cosTheta) / 2
          const kB = line === 0 ? (K * cosTheta) / 2 : K / 2
          const r = runCross(
            spec,
            boost(spec, level, [kA, kB]),
            SHORT,
            N,
            FLOOR,
          )
          const peak = spectralPeak(r.overlap)

          return {
            line,
            K,
            kA,
            kB,
            dE: wrap(peak.energy - e0.energy),
            pred: predicted(kA, kB),
            share: peak.share,
            velocity: trackVelocity(spec, r.centroid),
          }
        }),
      )

      log(`${g.name}: along`)

      // calibration (a): the same kind of pair on one line
      const onLine: CrossSpec = { ...spec, contact: 'off' }
      const pairPacket = placedPacket(
        onLine,
        [0, 0],
        PAIR.radius,
        x => Math.exp(-(x * x) / 8),
        [PAIR.k, PAIR.k],
        [spinor(PAIR.k), spinor(PAIR.k)],
      )
      const pairRun = runCross(onLine, pairPacket, LONG, N, FLOOR)
      const pairVelocity = trackVelocity(onLine, pairRun.centroid)

      // calibration (b): two free vibes on the bisector, read by the same spectral reading
      const free: CrossSpec = {
        L: CAL.ring,
        roots: [A, B],
        charges: [1],
        cost: false,
        contact: 'off',
        anchor: -1,
      }
      const freeReadings = KS.map((K, i) => {
        const k = (K * cosHalf) / 2
        const packet: CrossState = placedPacket(
          free,
          [0],
          CAL.radius,
          x => Math.exp(-(x * x) / (2 * CAL.width * CAL.width)),
          [k],
          [spinor(k)],
        )
        const r = runCross(free, packet, bisector[i]!.beats, N, FLOOR)
        const squared: Amp[] = r.overlap.map(a => [
          a[0] * a[0] - a[1] * a[1],
          2 * a[0] * a[1],
        ])
        const rest = runCross(
          free,
          placedPacket(
            free,
            [0],
            CAL.radius,
            x => Math.exp(-(x * x) / (2 * CAL.width * CAL.width)),
            [0],
            [spinor(0)],
          ),
          r.fidelity.length,
          N,
          FLOOR,
        )
        const squaredRest: Amp[] = rest.overlap.map(a => [
          a[0] * a[0] - a[1] * a[1],
          2 * a[0] * a[1],
        ])
        const dE = wrap(
          spectralPeak(squared).energy -
            spectralPeak(squaredRest).energy,
        )

        return { K, dE, pred: predicted(k, k) }
      })

      log(`${g.name}: calibrations`)

      const m1 = Math.max(...held.tail) <= TAIL
      const top = bisector[bisector.length - 1]!
      const m2 =
        Math.abs(top.velocity.alpha) * LONG >= REACH &&
        Math.abs(top.velocity.beta) * LONG >= REACH
      const m3 = bisector.every(
        b => Math.abs(b.dE - b.pred) <= TOL * Math.abs(b.pred),
      )
      const controlHolds = Math.max(...control.tail) > TAIL
      const calA = Math.abs(pairVelocity.alpha) * LONG >= REACH
      const calB = freeReadings.every(
        f => Math.abs(f.dE - f.pred) <= TOL * Math.abs(f.pred),
      )
      const checks =
        gauss &&
        boxOff <= EXACT &&
        one.residual < 1e-8 &&
        Math.min(...separable.fidelity) >= 1 - EXACT &&
        Math.min(...held.fidelity) >= 1 - EXACT

      return {
        g,
        cosTheta,
        one,
        boxOff,
        gauss,
        separable,
        plain,
        held,
        anti,
        control,
        e0,
        bisector,
        along,
        pairVelocity,
        pairRun,
        freeReadings,
        m1,
        m2,
        m3,
        controlHolds,
        calA,
        calB,
        checks,
      }
    })

    const M1 = results.every(r => r.m1)
    const M2 = results.every(r => r.m2)
    const M3 = results.every(r => r.m3)
    const controls = results.every(r => r.controlHolds)
    const calibrated = results.every(r => r.calA && r.calB)
    const checked =
      censusHolds && z3Holds && results.every(r => r.checks)
    const status =
      !checked || !calibrated || !controls
        ? 'partial'
        : M1 && M2 && M3
          ? 'pass'
          : 'fail'

    const metrics: Record<string, number> = {
      M1: M1 ? 1 : 0,
      M2: M2 ? 1 : 0,
      M3: M3 ? 1 : 0,
      twoLovesAssignments: twoLoves,
      loveFearAssignments: loveFear,
      averageSpreadK8: averageSpread[0]!,
      averageSpreadK4: averageSpread[1]!,
      averageSpreadK2: averageSpread[2]!,
      seconds: (Date.now() - started) / 1000,
    }

    for (const [k, m] of Object.entries(moments)) {
      m.forEach((x, i) => (metrics[`${k}Moment${2 * i + 2}`] = x))
    }

    driftRatio.forEach(
      (x, i) => (metrics[`classSpreadOverDrift${i}`] = x),
    )

    for (const r of results) {
      const p = r.g.name
      const top = r.bisector[r.bisector.length - 1]!

      metrics[`${p}_levelEnergy`] = r.one.level.energy
      metrics[`${p}_levelMeanString`] = r.one.level.meanString
      metrics[`${p}_oneHeld`] = r.one.held
      metrics[`${p}_boxOff`] = r.boxOff
      metrics[`${p}_pairEnergy`] = r.e0.energy
      metrics[`${p}_heldMaxTail`] = Math.max(...r.held.tail)
      metrics[`${p}_heldLeastFidelity`] = Math.min(...r.held.fidelity)
      metrics[`${p}_separableLeastFidelity`] = Math.min(
        ...r.separable.fidelity,
      )
      metrics[`${p}_plainLeastFidelity`] = Math.min(...r.plain.fidelity)
      metrics[`${p}_plainMaxTail`] = Math.max(...r.plain.tail)
      metrics[`${p}_antisymmetricLeastFidelity`] = Math.min(
        ...r.anti.fidelity,
      )
      metrics[`${p}_controlMaxTail`] = Math.max(...r.control.tail)
      metrics[`${p}_alphaPi2`] = top.velocity.alpha
      metrics[`${p}_betaPi2`] = top.velocity.beta
      metrics[`${p}_reachPi2`] = top.velocity.reach
      metrics[`${p}_vPredictedPi2`] = top.vPred
      metrics[`${p}_pairAlpha`] = r.pairVelocity.alpha
      metrics[`${p}_pairReach`] = r.pairVelocity.reach
      r.bisector.forEach((b, i) => {
        metrics[`${p}_bisector${i}_dE`] = b.dE
        metrics[`${p}_bisector${i}_predicted`] = b.pred
        metrics[`${p}_bisector${i}_share`] = b.share
        metrics[`${p}_bisector${i}_leastFidelity`] = b.least
      })

      r.freeReadings.forEach((f, i) => {
        metrics[`${p}_free${i}_dE`] = f.dE
        metrics[`${p}_free${i}_predicted`] = f.pred
      })
    }

    const geoText = results.map(r => {
      const top = r.bisector[r.bisector.length - 1]!

      return `${r.g.name} (cos ${f4(r.cosTheta)}): level E ${f6(r.e0.energy)}, tail at most ${e2(Math.max(...r.held.tail))} over ${LONG} beats (M1 ${r.m1}), fidelity ${f6(Math.min(...r.held.fidelity))}; at K = pi/2 on the bisector v = ${e2(top.velocity.alpha)} u_A + ${e2(top.velocity.beta)} u_B, reach ${f4(top.velocity.reach)} docks, against ${f4(top.vPred)} each predicted (M2 ${r.m2}); dE ${r.bisector.map(b => `${f4(b.dE)} (${f4(b.pred)})`).join(', ')} (M3 ${r.m3}); control tail ${e2(Math.max(...r.control.tail))}; one-line pair ${e2(r.pairVelocity.alpha)} a beat, free pair dE ${r.freeReadings.map(f => `${f4(f.dE)} (${f4(f.pred)})`).join(', ')}`
    })

    return verdict({
      status,
      claim: `${geoText.join('; ')}; crossing census ${censusHolds}, two loves admit ${twoLoves} flux assignments on L = 3 and a love and a fear ${loveFear}; the class average's energy spread over axis, face and body ${averageSpread.map(e2).join(', ')} at K = pi/8, pi/4, pi/2, branch spread over mean drift ${driftRatio.map(f4).join(', ')}`,
      metrics,
      control: Object.fromEntries(
        results.flatMap(r => [
          [`${r.g.name}_costOffMaxTail`, Math.max(...r.control.tail)],
          [`${r.g.name}_calibrationPairAlpha`, r.pairVelocity.alpha],
        ]),
      ),
      notes: `L2. M1 ${M1}, M2 ${M2}, M3 ${M3}; controls ${controls}, calibrations ${calibrated}, checks ${checked}. Census love+fear: ${censusText[0]}; love+love: ${censusText[1]}. Moments sum (n.u)^m, m = 2, 4, 6: ${Object.entries(
        moments,
      )
        .map(([k, m]) => `${k} ${m.map(f4).join(' ')}`)
        .join('; ')}. ${results
        .map(
          r =>
            `${r.g.name}: one-vibe level E ${r.one.level.energy} mean string ${f4(r.one.level.meanString)} tail ${e2(r.one.level.tail)}, ${r.one.held} one-vibe levels held within N, box ${e2(r.boxOff)}, residual ${e2(r.one.residual)}, Gauss ${r.gauss}; separable least fidelity ${r.separable.fidelity.reduce((a, b) => Math.min(a, b), 1)}; plain product under the contact least fidelity ${f4(Math.min(...r.plain.fidelity))} tail ${e2(Math.max(...r.plain.tail))} over ${SEPARABLE} beats; antisymmetric ${f4(Math.min(...r.anti.fidelity))}; held dropped ${e2(r.held.dropped)} size ${r.held.size}; bisector ${r.bisector.map(b => `K ${f4(b.K)} k ${f4(b.k)} dE ${f6(b.dE)} pred ${f6(b.pred)} share ${f4(b.share)} least fidelity ${f4(b.least)} tail ${e2(b.tail)} v ${e2(b.velocity.alpha)} ${e2(b.velocity.beta)} reach ${f4(b.velocity.reach)}`).join('; ')}; along ${r.along.map(a => `line ${a.line} K ${f4(a.K)} (k ${f4(a.kA)}, ${f4(a.kB)}) dE ${f6(a.dE)} pred ${f6(a.pred)} share ${f4(a.share)} v ${e2(a.velocity.alpha)} ${e2(a.velocity.beta)}`).join('; ')}; one-line pair reach ${f4(r.pairVelocity.reach)} tail ${e2(Math.max(...r.pairRun.tail))}`,
        )
        .join('. ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
