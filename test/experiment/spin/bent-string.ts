// CAN A BOUND PAIR ON CROSSING LINES MOVE ONCE ITS STRING CAN BEND QUANTUM MECHANICALLY (E-SPN-0116)?
// note/project/vibe/roadmap/research/remaining-pieces.md section 3, "a bound pair on crossing lines (E-SPN-0110)" and "the
// plaquette move (E-GRV-0130)". E-SPN-0110 held a love and a fear on two crossing lines but could not move them (2e-5
// docks a beat against 0.17 predicted) and blamed the frozen string: the rule writes flux only where a vibe copies
// across a link, so Gauss fixes the string only up to closed loops and nothing changes them. E-GRV-0130's classical
// plaquette move spread the string instead of bending it. This test adds the QUANTUM plaquette term and asks again.
//
// THE PIECE (code/rule/plaquette-mixer). On each face of the plane of the two lines, Kogut-Susskind's magnetic term
// f(U_p) = sum_B zeta_42^(-r bal(B)^2) Pi_B as a quantum-walk coin on the face's Z_3 clock shift U_p (a unit of flux
// taken once around the face), CONTROLLED: it acts only on a face whose oriented boundary values s_l f_l are not all
// equal. U_p adds the same unit to every s_l f_l, so the control reads only what U_p leaves unchanged.
//
// DERIVED BEFORE THE RUN.
// 1. EXACT, UNITARY, REVERSIBLE, GAUSS. f(U_p) is lattice-qed's 'loop' step: entries (1 + 2 lambda)/3 and (1 - lambda)/3,
//    lambda = zeta_42^(-r), in (1/3) Z[zeta_42], the ring that holds the coin (w = zeta_42^14) and the cost (zeta_14 =
//    zeta_42^3), with the denominators 2^a 3^b carried. Its eigenvalues are roots of unity; the inverse is the same step
//    with the exponents negated. The control is constant on each U_p orbit, so the piece is f(U_p) on ON orbits and 1 on
//    OFF ones: unitary. Faces sharing a link do not commute, so the faces split into two classes with no shared link
//    (squares by a + b parity, triangles up and down) and the mixer is class 0 then class 1. U_p adds a closed loop, so
//    every dock's divergence (Gauss's charge) is unchanged on integers. Checked below in exact arithmetic.
// 2. WHAT IT CHANGES. A basis register is fixed iff every face boundary is uniform. The empty register (the vacuum) is
//    fixed exactly. A register holding an open string is not: every face along a string is ON. And NO control can keep
//    the vacuum, bend a straight string AND commute with the stream's recorded copies T (which is what would leave a
//    lone love's walk untouched): if M T = T M for every copy and M|0> = |0>, then M T|0> = T|0>, and T|0> ranges over
//    every straight string from X along the lines, so M bends none of them. So this mixer, which keeps the vacuum and
//    bends, must change a lone love's walk: the string's shape becomes a record of the love's path, and interference
//    between paths that left different shapes is lost. It never moves a vibe, so the love's line and the reach of its
//    front (one dock a beat) are unchanged exactly. Measured below as the total variation of its position
//    distribution, cost off, mixer on against off.
// 3. THE PAIR CANNOT MOVE, WHATEVER THE STRING DOES. The line law keeps the love on line A and the fear on line B, and the
//    two lines meet only at X. A string joining the love at s_A u_A and the fear at s_B u_B has at least their lattice
//    distance d in links: |s_A| + |s_B| on the square plane (g90), and at least max(|s_A|, |s_B|) on the triangular one
//    (g60). So a state with weight at most eps on strings longer than N has weight at most eps on |s_A| or |s_B| past N:
//    its centroid stays within N docks of X with weight 1 - eps. Moving the centroid moves BOTH vibes away from X, since
//    a common shift along the bisector raises s_A and s_B together. A bound level therefore has no free direction on two
//    crossing lines, bent string or not; E-SPN-0110's frozen-string account was the second reason, not the first. The
//    one-line trio moves because on one line the two coordinates share one separation and leave one free.
//    So B2 and B3 are predicted to FAIL for any held level, and B1 decides only whether a held level exists at theta.
// 4. B1 IS AT RISK TOO. The pair is held by a PHASE (the cost is a quasienergy potential, e^(-i pi/7) per link a beat),
//    a Wannier-Stark hold that needs the vibe's paths to interfere (item 2 says the mixer spoils that), and the live
//    faces' loop patterns are a reservoir that can absorb quasienergy mod 2 pi. The disclosed probes below saw the
//    unfiltered E-SPN-0110 level's tail climb past 1e-3 under the mixer.
//
// THE STAND-IN (code/measure/bent-string): E-SPN-0110's figure eight (rings of L = 28, g60 roots (1,1,0,0) and
// (1,0,1,0), g90 (1,1,0,0) and (0,0,1,1)) carried into the plane of its two lines, an L x L torus whose two cycles
// through X are the lines; flux on every link of the plane (the cost reads them all); the mixer on the faces within
// WINDOW = 1 dock of X (8 triangles for g60, 4 squares for g90), the smallest window that holds every corner-cutting
// face at the crossing, where the held pair sits. Floats as measurement; entries under FLOOR are dropped after every
// face and every beat, and the dropped weight is read as escaped. THETA: r = 1, M = 42 (theta = 2 pi / 42), the
// smallest angle the rule's ring holds and the only one the budget affords (r = 3 grows the state about 3^8 times).
//
// GATES, fixed before the first run of this file.
//  THE LEVEL. E-SPN-0110's exchange-symmetric level, run PROBE beats under the mixer; its energy E is spectralPeak of
//   that autocorrelation; the level is the filter sum_t w(t) e^(i E t) U^t psi over FILTER beats (sin^2 window).
//  B1 the level holds: over HOLD beats, tail (weight on strings longer than N = 7) plus the weight dropped so far is at
//     most 1e-3 at every beat, on both geometries.
//  B2 it moves: boosted along the bisector at K = pi/2 (each vibe k = K cos(theta_AB / 2) / 2 along its own line), MOVE
//     beats, the centroid's least-squares velocity projected on the bisector is at least 0.5 of the predicted
//     constituent average v_p |u_A + u_B| (v_p = the lone band's slope at k over 2, E-SPN-0110's prediction), AND the
//     boosted run still holds by B1's reading; both geometries.
//  B3 its dispersion along the bisector is the constituent average: at K = pi/4 and pi/2, dE = E(K) - E(0) by
//     spectralPeak (MOVE beats; E(0) from the B1 run) within 10 percent of [E_1(k) - E_1(0)] x 2; both geometries.
//  CONTROLS. C0 theta = 0 reproduces E-SPN-0110: the plane beat equals crossBeat entry for entry over 4 beats (largest
//     difference at most 1e-12), and the theta = 0 level boosted as in B2 moves at most 0.01 of the prediction.
//     C1 no string: with the cost off and the mixer on, the level's tail passes 1e-3 within CONTROL beats.
//     C2 the vacuum: the exact mixer fixes the empty register (whole plane and window), and the float beat returns a
//     state with no vibes unchanged.
//  CHECKS. The classes share no link; the exact mixer on the vacuum, a straight string and a bent one (whole plane and
//     window, both geometries) reverses exactly, keeps every dock's divergence, agrees with the float mixer to 1e-13 and
//     keeps the norm to 1e-12; the codec (vibes, winding, loops) is checked against the tracked flux on the first beats.
//  Verdict: partial if a check or control fails, pass if B1, B2 and B3 hold, fail otherwise.
//  REPORTED, gating nothing: the lone love's position distribution against the mixer off (item 2), and the held
//  level's string shapes (length, links off the lines, turned faces, length over the vibes' distance).
// PREDICTED: B2 and B3 fail (item 3); B1 at risk (item 4); the lone love's walk changed, its front and line not.
//
// FIRST RUN (1,833 s, tmp/bend-run-run1.log, the record): PARTIAL by the rule above, no gate moved. C0's velocity half
// failed on g90 by a hair (the theta = 0 level moves -2.12e-3 docks a beat against the 2.06e-3 bound; g60 -2.65e-3
// against 2.96e-3): 64 beats of a pruned level read E-SPN-0110's frozen pair at 1 percent of the prediction, not its
// 256-beat 1e-4; the entry-for-entry half holds exactly (distance 0 on both). Every check holds: the exact mixer
// reverses, keeps Gauss, fixes the vacuum and matches the float one to 3e-16 on both planes, whole and windowed.
// B1 FAILS: the level at theta (E 1.0276 g60, 1.0147 g90, share 0.93) leaks, tail plus dropped 7.7e-3 (g60) and 3.9e-2
// (g90) by beat 64, fidelity down to 0.69 and 0.15, growing about linearly (g60 1.6e-3 at 8 beats, 6.9e-3 at 64). With
// the mixer the phase hold of E-SPN-0104 and 0110 no longer holds (item 4). B2 FAILS: boosted to pi/2 the centroid
// moves -1.3e-3 (g60) and -1.0e-3 (g90) docks a beat against 0.296 and 0.206 predicted, reach 0.59 and 0.44 docks.
// B3 FAILS: dE -0.001, -0.004 (g60) against 0.066, 0.249; -0.001, -0.003 (g90) against 0.044, 0.170. C1: with no
// string the tail reaches 0.68 and 0.75. C2: the vacuum is fixed exactly and by the float beat. The lone love (cost
// off) keeps its line and its reach (14 docks both ways) exactly, and its position distribution moves 0.043 and 0.042
// in total variation: the change item 2 derived. The string's shapes in the level: bent weight 0.015 (g60) and 0.028
// (g90), 0.023 and 0.062 links off the lines on average, mean length 1.310 and 1.397 against 1.306 at theta 0, turned
// faces 0 / 1 / 2 with weight 0.985 / 0.013 / 0.001 (g60) and 0.972 / 0.025 / 0.003 (g90); after 64 beats the bent
// weight is 0.032 and 0.150 and the length's tail past 5 links has grown (g90 0.13 of the weight). Title written after
// the run.
//
// DISCLOSED PROBES (instrument only, before the gates were written): tmp/bend-probe1 (theta 0 equals crossBeat to 0;
// the unfiltered level under r = 1, window 1: g60 at floor 1e-8 tail 7e-5 rising to 2.3e-3 over 40 beats, fidelity
// 0.84; g90 at floor 1e-10 tail 1e-4 rising to 1.7e-2 over 40 beats, fidelity 0.52), tmp/bend-probe3 (the exact mixer reverses, keeps Gauss, fixes the vacuum, matches the float one to 3e-16),
// tmp/bend-probe2 and 4 (branch counts: the whole plane is out of reach, a straight string's column already 801 terms).
//
// Depth L2: a stand-in built from the rule's pieces plus one added piece (the mixer), with a derived prediction that
// could have been wrong and controls. DETERMINISM: no random numbers. NOTHING MOVES: the mixer takes a face's loop count
// to a superposition of its three values; the vibes take their values one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { loneBand } from '@/code/measure/moving-level'
import {
  conjugateOther,
  crossBeat,
  exchangeLines,
  levelState,
  oneBody,
  oneLevels,
  productState,
  prune,
  rootIndex,
  spectralPeak,
  sumStates,
  trackVelocity,
  lineDirection,
  type CrossSpec,
  type CrossState,
} from '@/code/measure/crossing-lines'
import {
  classesDisjoint,
  divergenceKey,
  exactMixer,
  exactRegistry,
  faceShift,
  fluxFromKey,
  fluxKey,
  liveFaces,
  mixClass,
  planePatch,
  registerFlux,
  activeFaces,
  type Flux,
  type PlanePatch,
} from '@/code/rule/plaquette-mixer'
import {
  exactBasis,
  exactEqual,
  reduce,
  toComplex,
} from '@/code/rule/lattice-qed'
import {
  bentBeat,
  bentBoost,
  bentCodec,
  bentTail,
  bentWeight,
  cloneBent,
  crossDistance,
  filterLevel,
  fromCross,
  lineLink,
  packConfig,
  positionWeights,
  pruneBent,
  runBent,
  shapes,
  toCross,
  totalVariation,
  type BentSpec,
  type BentState,
  type Codec,
} from '@/code/measure/bent-string'

const L = 28
const N = 7
const TAIL = 1e-3
const FLOOR = 1e-10
const WINDOW = 1
const RING = 42
const R = 1
const PROBE = 32
const FILTER = 32
const HOLD = 64
const MOVE = 64
const CONTROL = 16
const FRONT = 32
const EXACT = 1e-12
const HALF = 0.5
const TOL = 0.1
const FROZEN = 0.01
const KS = [Math.PI / 4, Math.PI / 2]
const GEOMETRIES = [
  { name: 'g60', second: [1, 0, 1, 0], kind: 'triangle' },
  { name: 'g90', second: [0, 0, 1, 1], kind: 'square' },
] as const

const wrap = (x: number): number => Math.atan2(Math.sin(x), Math.cos(x))
const f4 = (x: number): string => x.toFixed(4)
const e2 = (x: number): string => x.toExponential(2)
const predicted = (k: number): number =>
  2 * (loneBand(k).energy - loneBand(0).energy)

// the exact mixer on one register: reversible, divergence kept, float agreement, norm, image size
function exactCheck(
  patch: PlanePatch,
  f: Flux,
): {
  reversible: boolean
  gauss: boolean
  float: number
  norm: number
  size: number
  fixed: boolean
} {
  const mix = { m: RING, r: R }
  const reg = exactRegistry()
  const v = exactBasis(RING, registerFlux(reg, f))
  const image = reduce(exactMixer(patch, mix, reg, v))
  const back = exactMixer(patch, mix, reg, image, true)
  const div = divergenceKey(patch, f)
  const gauss = [...image.entries.keys()].every(
    k => divergenceKey(patch, fluxFromKey(reg.keys[k]!)) === div,
  )
  const float = new Map<string, [number, number]>()

  for (const x of mixClass(patch, mix, f, 0, 0)) {
    for (const y of mixClass(patch, mix, x.flux, 1, 0)) {
      const k = fluxKey(y.flux)
      const o = float.get(k) ?? [0, 0]

      float.set(k, [
        o[0] + x.amp[0] * y.amp[0] - x.amp[1] * y.amp[1],
        o[1] + x.amp[0] * y.amp[1] + x.amp[1] * y.amp[0],
      ])
    }
  }

  let worst = 0
  let norm = 0

  for (const [k, c] of image.entries) {
    const z = toComplex(c, image.den, RING)
    const y = float.get(reg.keys[k]!) ?? [0, 0]

    norm += z[0] ** 2 + z[1] ** 2
    worst = Math.max(worst, Math.hypot(z[0] - y[0], z[1] - y[1]))
  }

  return {
    reversible: exactEqual(back, v),
    gauss,
    float: worst,
    norm,
    size: image.entries.size,
    fixed: exactEqual(image, v),
  }
}

export default experiment({
  id: 'spin/bent-string',
  code: 'E-SPN-0116',
  title:
    "a controlled quantum plaquette mixer bends the string of a love-fear pair on crossing lines but the pair neither holds nor moves, partial (B1, B2, B3 fail; the theta = 0 velocity control missed its 1 percent bound on g90, -2.12e-3 against 2.06e-3): the Kogut-Susskind face term f(U_p) as a coin on each face's Z_3 clock shift, acting only where the face's oriented flux is not uniform, is exact in (1/3) Z[zeta_42], unitary, reverses bit for bit, keeps Gauss and fixes the vacuum; no mixer can keep the vacuum, bend a straight string and commute with the stream's recorded copies, so it changes a lone love's walk (0.043 in total variation) but not its line or reach; and a pair on two lines that meet once cannot move whatever the string does, since a common shift takes both vibes from the crossing and the string is at least their distance; at theta = 2 pi / 42 on the 8 (g60) and 4 (g90) faces at the crossing the level leaks (tail plus dropped 7.7e-3 and 3.9e-2 by 64 beats, the phase hold spoiled), moves 1e-3 docks a beat against 0.30 and 0.21 predicted, and its energy stays within 0.004 of rest against 0.25 and 0.17; its string is bent with weight 0.015 and 0.028, 1.5 and 2.8 percent of it cutting the corner",
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

    const results = GEOMETRIES.map(g => {
      const B = rootIndex(g.second)
      const cross: CrossSpec = {
        L,
        roots: [A, B],
        charges: [1, -1],
        cost: true,
        contact: 'rule',
      }
      const whole = planePatch(L, g.kind)
      const patch = planePatch(L, g.kind, WINDOW)
      const disjoint = classesDisjoint(whole) && classesDisjoint(patch)
      const cosTheta =
        [1, 1, 0, 0].reduce(
          (s, x, c) => s + x * (g.second[c] as number),
          0,
        ) / 2
      const cosHalf = Math.sqrt((1 + cosTheta) / 2)
      const uA = lineDirection(cross, 0)
      const uB = lineDirection(cross, 1)
      const bis = uA.map((x, c) => x + uB[c]!)
      const bisNorm = Math.hypot(...bis)
      const bisUnit = bis.map(x => x / bisNorm)

      // ---- the exact mixer ----
      const straight: Flux = new Map([
        [lineLink(L, 0, 0), 2],
        [lineLink(L, 0, 1), 2],
        [lineLink(L, 1, 0), 1],
      ])
      const corner =
        activeFaces(patch, straight, 0)[0] ??
        activeFaces(patch, straight, 1)[0]
      const bent =
        corner === undefined
          ? straight
          : faceShift(patch, straight, corner, 1)
      const exact = [whole, patch].flatMap(p =>
        [new Map<number, number>(), straight, bent].map(f =>
          exactCheck(p, f),
        ),
      )
      const exactHolds = exact.every(
        x =>
          x.reversible &&
          x.gauss &&
          x.float <= 1e-13 &&
          Math.abs(x.norm - 1) <= EXACT,
      )
      const vacuumExact =
        exact[0]?.fixed === true && exact[3]?.fixed === true
      const bends =
        (exact[1]?.size ?? 0) > 1 && (exact[4]?.size ?? 0) > 1

      log(`${g.name}: exact`)

      // ---- E-SPN-0110's level ----
      const o = oneBody({ ...cross, charges: [1], anchor: -1 }, 0)
      const one = oneLevels(o, N)
        .levels.slice()
        .sort((a, b) => a.meanString - b.meanString)[0]!
      const love = levelState(o, one.vector)
      const product = productState(love, conjugateOther(cross, love))
      const level0: CrossState = sumStates(
        product,
        exchangeLines(cross, product),
        1,
      )

      // ---- C0: theta = 0 is E-SPN-0110 ----
      const zeroSpec: BentSpec = {
        cross,
        patch,
        mix: { m: RING, r: 0 },
      }
      const zc = bentCodec(zeroSpec)

      let cz = level0
      let bz = fromCross(zc, level0)
      let c0Distance = 0

      for (let t = 0; t < 4; t++) {
        cz = crossBeat(cross, cz)
        prune(cz, 1e-30)
        bz = bentBeat(zc, bz, 0, true)
        pruneBent(bz, 1e-30)

        const back = toCross(zc, bz)

        c0Distance = Math.max(
          c0Distance,
          back ? crossDistance(cz, back) : Infinity,
        )
      }

      const K2 = Math.PI / 2
      const k2 = (K2 * cosHalf) / 2
      const vPred = (loneBand(k2).slope / 2) * bisNorm
      const zeroStart = fromCross(zc, level0)

      pruneBent(zeroStart, FLOOR)

      const zeroMove = runBent(
        zc,
        bentBoost(zc, zeroStart, [k2, k2]),
        MOVE,
        N,
        FLOOR,
      )
      const zeroVelocity = trackVelocity(
        cross,
        zeroMove.centroid,
      ).velocity.reduce((s, x, c) => s + x * bisUnit[c]!, 0)
      const c0 =
        c0Distance <= EXACT && Math.abs(zeroVelocity) <= FROZEN * vPred

      log(`${g.name}: theta 0`)

      // ---- the level at theta ----
      const spec: BentSpec = { cross, patch, mix: { m: RING, r: R } }
      const c = bentCodec(spec)
      const start = fromCross(c, level0)

      pruneBent(start, FLOOR)

      const probe = runBent(c, start, PROBE, N, FLOOR)
      const probePeak = spectralPeak(probe.overlap)
      const level = filterLevel(
        c,
        start,
        FILTER,
        probePeak.energy,
        FLOOR,
      )

      log(`${g.name}: level`)

      // strict codec on the first beats
      let strict = true

      try {
        let s = cloneBent(level)

        for (let t = 0; t < 2; t++) {
          s = bentBeat(c, s, FLOOR, true)
          pruneBent(s, FLOOR)
        }
      } catch {
        strict = false
      }

      // ---- B1 ----
      const held = runBent(c, level, HOLD, N, FLOOR)
      const heldWorst = Math.max(
        ...held.tail.map((x, t) => x + held.lost[t]!),
      )
      const e0 = spectralPeak(held.overlap)
      const b1 = heldWorst <= TAIL
      const levelShapes = shapes(c, level, 12)
      const endShapes = shapes(c, held.end, 12)
      const zeroShapes = shapes(zc, zeroStart, 12)

      log(`${g.name}: B1`)

      // ---- B2 and B3 ----
      const moves = KS.map(K => {
        const k = (K * cosHalf) / 2
        const r = runBent(
          c,
          bentBoost(c, level, [k, k]),
          MOVE,
          N,
          FLOOR,
        )
        const v = trackVelocity(cross, r.centroid)
        const along = v.velocity.reduce(
          (s, x, d) => s + x * bisUnit[d]!,
          0,
        )
        const peak = spectralPeak(r.overlap)
        const worst = Math.max(...r.tail.map((x, t) => x + r.lost[t]!))

        return {
          K,
          k,
          along,
          reach: v.reach,
          dE: wrap(peak.energy - e0.energy),
          pred: predicted(k),
          share: peak.share,
          worst,
          vPred: (loneBand(k).slope / 2) * bisNorm,
        }
      })

      log(`${g.name}: B2 B3`)

      const top = moves[moves.length - 1]!
      const b2 = top.along >= HALF * top.vPred && top.worst <= TAIL
      const b3 = moves.every(
        m => Math.abs(m.dE - m.pred) <= TOL * Math.abs(m.pred),
      )

      // ---- C1: no string ----
      const loose = runBent(
        bentCodec({
          cross: { ...cross, cost: false },
          patch,
          mix: { m: RING, r: R },
        }),
        level,
        CONTROL,
        N,
        FLOOR,
      )
      const c1 = Math.max(...loose.tail) > TAIL

      // ---- C2: the vacuum under the float beat ----
      const vc = bentCodec({
        cross: { ...cross, charges: [] },
        patch,
        mix: { m: RING, r: R },
      })
      const vacuum: BentState = new Map([
        [packConfig(vc, { bodies: [], sector: 0, m: 0 }), [1, 0]],
      ])
      const vacuumAfter = bentBeat(vc, vacuum)
      const vacuumFloat =
        vacuumAfter.size === 1 &&
        [...vacuumAfter].every(
          ([k, a]) => vacuum.has(k) && a[0] === 1 && a[1] === 0,
        )
      const c2 = vacuumExact && vacuumFloat

      // ---- the lone love's walk, cost off, mixer on against off ----
      const loneCross: CrossSpec = {
        ...cross,
        charges: [1],
        anchor: -1,
        cost: false,
      }

      const lone = (
        r: number,
      ): { w: Map<string, number>; codec: Codec; state: BentState } => {
        const codec = bentCodec({
          cross: loneCross,
          patch,
          mix: { m: RING, r },
        })

        let s: BentState = new Map([
          [
            packConfig(codec, {
              bodies: [{ line: 0, p: 0, j: 0 }],
              sector: 0,
              m: 0,
            }),
            [1, 0],
          ],
        ])

        for (let t = 0; t < FRONT; t++) {
          s = bentBeat(codec, s, FLOOR)
          pruneBent(s, FLOOR)
        }

        return { w: positionWeights(codec, s), codec, state: s }
      }

      const loneOn = lone(R)
      const loneOff = lone(0)
      const reach = (w: Map<string, number>): number =>
        Math.max(
          ...[...w.entries()]
            .filter(([, v]) => v > FLOOR)
            .map(([k]) => Math.abs(Number(k.split(':')[1]))),
        )
      const onLine = [...loneOn.w.keys()].every(k => k.startsWith('0:'))
      const front = {
        tv: totalVariation(loneOn.w, loneOff.w),
        reachOn: reach(loneOn.w),
        reachOff: reach(loneOff.w),
        onLine,
        lost: 1 - bentWeight(loneOn.state),
        tail: bentTail(loneOn.codec, loneOn.state, N),
      }

      log(`${g.name}: controls`)

      const checks = disjoint && exactHolds && bends && strict

      return {
        g,
        cosTheta,
        exact,
        exactHolds,
        bends,
        disjoint,
        c0Distance,
        zeroVelocity,
        vPred,
        c0,
        c1,
        c2,
        loose,
        probe,
        probePeak,
        level,
        held,
        heldWorst,
        e0,
        b1,
        moves,
        b2,
        b3,
        levelShapes,
        endShapes,
        zeroShapes,
        front,
        strict,
        checks,
        liveFaces: liveFaces(patch),
      }
    })

    const B1 = results.every(r => r.b1)
    const B2 = results.every(r => r.b2)
    const B3 = results.every(r => r.b3)
    const controls = results.every(r => r.c0 && r.c1 && r.c2)
    const checked = results.every(r => r.checks)
    const status =
      !checked || !controls
        ? 'partial'
        : B1 && B2 && B3
          ? 'pass'
          : 'fail'
    const metrics: Record<string, number> = {
      B1: B1 ? 1 : 0,
      B2: B2 ? 1 : 0,
      B3: B3 ? 1 : 0,
      theta: (2 * Math.PI * R) / RING,
      seconds: (Date.now() - started) / 1000,
    }

    for (const r of results) {
      const p = r.g.name

      metrics[`${p}_liveFaces`] = r.liveFaces
      metrics[`${p}_levelEnergy`] = r.e0.energy
      metrics[`${p}_levelShare`] = r.e0.share
      metrics[`${p}_probeEnergy`] = r.probePeak.energy
      metrics[`${p}_heldWorst`] = r.heldWorst
      metrics[`${p}_heldMaxTail`] = Math.max(...r.held.tail)
      metrics[`${p}_heldLost`] = r.held.lost[r.held.lost.length - 1]!
      metrics[`${p}_heldLeastFidelity`] = Math.min(...r.held.fidelity)
      metrics[`${p}_heldSize`] = r.held.size
      metrics[`${p}_probeMaxTail`] = Math.max(...r.probe.tail)
      metrics[`${p}_c0Distance`] = r.c0Distance
      metrics[`${p}_zeroVelocity`] = r.zeroVelocity
      metrics[`${p}_noStringMaxTail`] = Math.max(...r.loose.tail)
      metrics[`${p}_frontTV`] = r.front.tv
      metrics[`${p}_frontReachOn`] = r.front.reachOn
      metrics[`${p}_frontReachOff`] = r.front.reachOff
      metrics[`${p}_bent`] = r.levelShapes.bent
      metrics[`${p}_meanLength`] = r.levelShapes.meanLength
      metrics[`${p}_meanOffLine`] = r.levelShapes.meanOffLine
      metrics[`${p}_meanExcess`] = r.levelShapes.meanExcess
      metrics[`${p}_meanDistance`] = r.levelShapes.meanDistance
      metrics[`${p}_zeroMeanLength`] = r.zeroShapes.meanLength
      metrics[`${p}_endBent`] = r.endShapes.bent
      r.moves.forEach((m, i) => {
        metrics[`${p}_move${i}_along`] = m.along
        metrics[`${p}_move${i}_predicted`] = m.vPred
        metrics[`${p}_move${i}_reach`] = m.reach
        metrics[`${p}_move${i}_worst`] = m.worst
        metrics[`${p}_move${i}_dE`] = m.dE
        metrics[`${p}_move${i}_dEPredicted`] = m.pred
      })
    }

    const text = results.map(r => {
      const top = r.moves[r.moves.length - 1]!

      return `${r.g.name} (${r.liveFaces} live faces): level E ${f4(r.e0.energy)} (share ${f4(r.e0.share)}), tail + dropped at most ${e2(r.heldWorst)} over ${HOLD} beats (B1 ${r.b1}), least fidelity ${f4(Math.min(...r.held.fidelity))}; boosted to pi/2 its centroid moves ${e2(top.along)} docks a beat along the bisector against ${f4(top.vPred)} predicted, reach ${f4(top.reach)}, held ${e2(top.worst)} (B2 ${r.b2}); dE ${r.moves.map(m => `${f4(m.dE)} (${f4(m.pred)})`).join(', ')} (B3 ${r.b3}); string bent ${f4(r.levelShapes.bent)}, mean length ${f4(r.levelShapes.meanLength)} against ${f4(r.zeroShapes.meanLength)} at theta 0, ${f4(r.levelShapes.meanOffLine)} links off the lines, excess over the vibes' distance ${f4(r.levelShapes.meanExcess)}; theta 0 equals crossBeat to ${e2(r.c0Distance)} and moves ${e2(r.zeroVelocity)}; no string tail ${e2(Math.max(...r.loose.tail))}; the lone love's walk moved ${e2(r.front.tv)} in total variation, reach ${r.front.reachOn} against ${r.front.reachOff}`
    })

    return verdict({
      status,
      claim: text.join('; '),
      metrics,
      control: Object.fromEntries(
        results.flatMap(r => [
          [`${r.g.name}_thetaZeroDistance`, r.c0Distance],
          [`${r.g.name}_thetaZeroVelocity`, r.zeroVelocity],
          [`${r.g.name}_noStringMaxTail`, Math.max(...r.loose.tail)],
          [`${r.g.name}_vacuumFixed`, r.c2 ? 1 : 0],
        ]),
      ),
      notes: `L2. B1 ${B1}, B2 ${B2}, B3 ${B3}; controls ${controls}, checks ${checked}. theta = 2 pi ${R} / ${RING}, window ${WINDOW}, floor ${FLOOR}. ${results
        .map(
          r =>
            `${r.g.name}: exact mixer (vacuum, straight, bent; whole plane then window) ${r.exact.map(x => `${x.size} terms rev ${x.reversible} gauss ${x.gauss} float ${e2(x.float)} norm ${x.norm.toFixed(14)} fixed ${x.fixed}`).join('; ')}; classes disjoint ${r.disjoint}; strict codec ${r.strict}; C0 ${r.c0} C1 ${r.c1} C2 ${r.c2}; probe E ${f4(r.probePeak.energy)} share ${f4(r.probePeak.share)} max tail ${e2(Math.max(...r.probe.tail))}; held tails ${[8, 16, 32, 64].map(t => `${t}: ${e2(r.held.tail[t - 1] ?? NaN)} lost ${e2(r.held.lost[t - 1] ?? NaN)}`).join(', ')}, size ${r.held.size}; moves ${r.moves.map(m => `K ${f4(m.K)} k ${f4(m.k)} along ${e2(m.along)} pred ${f4(m.vPred)} reach ${f4(m.reach)} worst ${e2(m.worst)} dE ${f4(m.dE)} pred ${f4(m.pred)} share ${f4(m.share)}`).join('; ')}; level shapes length ${r.levelShapes.length.map(f4).join(' ')}, off-line ${r.levelShapes.offLine.map(f4).join(' ')}, turned faces ${r.levelShapes.turned.map(f4).join(' ')}, mean distance ${f4(r.levelShapes.meanDistance)}; after ${HOLD} beats bent ${f4(r.endShapes.bent)} length ${r.endShapes.length.map(f4).join(' ')}; theta 0 shapes length ${r.zeroShapes.length.map(f4).join(' ')}; lone love on its line ${r.front.onLine}, lost ${e2(r.front.lost)}, tail ${e2(r.front.tail)}`,
        )
        .join('. ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
