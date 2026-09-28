// IS 3D TURNING ON THE HUSK THE SHADOW OF MOTION FREE IN THE 4D BULK (E-SPN-0127)? note/research/vibe/roadmap/
// remaining-pieces.md, "Six angles on 3d motion", angle 5, and "The star theorem" (E-SPN-0119). Vibes live on bulk
// lines; a line with a depth component casts a husk shadow along one husk direction, and several bulk lines share one
// shadow (E-SPN-0091's flavors). The idea: a composite spread over bulk lines might have a husk centroid that moves in a
// direction no single husk line allows.
//
// DERIVED BEFORE THE RUN (code/measure/bulk-shadow).
// 1. THE MAP. The husk reading is pi(v_1, v_2, v_3, w) = (v_1, v_2, v_3), a homomorphism of D4 onto Z^3 with kernel
//    (0, 0, 0, 2k). The twelve bulk line classes go to nine husk directions: e_a +- e_b (w = 0) one to one, and the six
//    depth classes e_a +- e_4 two to one onto the three axes e_a. On the box of side L it maps D4 / L D4 onto the husk
//    torus with fibers of L docks, so each face-diagonal husk line carries L parallel bulk lines (one per depth offset)
//    and each axis husk line 2L (L per class). No root lies in the kernel, so the stream from x to x + r is read on the
//    husk as the stream from pi(x) to pi(x) + pi(r): THE PROJECTION COMMUTES WITH THE LINE LAW. `projectionCensus` and
//    `huskLineCensus` read it on every slot and every line.
// 2. WHICH PIECES CONNECT LINES OF DIFFERENT SHADOW. The coin, the meeting, the pair move and the stream act inside one
//    dock line (E-SPN-0117), so they never change a vibe's bulk line, let alone its shadow. K, the bounce on a dock of
//    two or more singles, permutes that dock's 24 slots. Without the vacuum: on two singles it keeps or swaps them
//    (E-SPN-0110), so the pair's line set and shadow set are kept while each vibe may take the other's line, of another
//    shadow; on three or more it changes the line set, and the shadow set with it (`shadowCensus`). So YES, K connects
//    bulk lines whose shadows differ without touching the vacuum, but only at the one dock where it fires: every image
//    is a slot of that dock, so the new line passes through the same bulk dock and hence the same husk point.
// 3. THE STAR THEOREM UNDER PROJECTION. E-SPN-0119's proof is already a BULK theorem: its docks are the D4 box's and
//    its twelve lines are bulk lines. Projection keeps it. If the difference from the vacuum lies on the bulk star S of
//    X at every beat, its husk image lies on pi(S), nine husk lines through pi(X), at every beat. The worry that a bulk
//    dock's lines project to MORE husk directions is backwards: 12 bulk lines project to 9 husk lines (the depth pairs
//    merge). The worry that two bulk hubs project onto one husk region is real but belongs to the bulk: K reads a bulk
//    dock, so where two star lines' shadows meet on the husk above two different depths (a HUSK crossing) nothing
//    fires; two hubs over one husk point (X and X + (0, 0, 0, 2k)) are a two-hub composite in the bulk, whose stars
//    cross at bulk docks (`huskStar`: 6 docks for 2k = 2), which is E-SPN-0120's cascade class, not a mover.
// 4. WHICH COMPOSITES THE HUSK COULD READ AS MOVING IN A NEW DIRECTION. pi is linear, so the husk centroid is the shadow
//    of the bulk centroid and its velocity is pi of the bulk velocity. A bound composite whose members keep their
//    lines r_i has a common bulk velocity V with V in span(r_i) for every moving member, so V lies in the intersection
//    of the spans: 0 for two distinct classes. Its husk velocity pi(V) lies in pi of that intersection, inside the
//    intersection of the shadows' spans. So: members of ONE class move along its shadow (E-SPN-0115's meson); members
//    of two classes with ONE shadow ((1,0,0,1) and (1,0,0,-1)) are pinned in the bulk and so on the husk, although the
//    husk sees them on one line; members of different shadows are pinned. A new husk direction needs bulk motion off
//    every member's line, which needs the line set to change as the composite goes, which by item 2 happens only at a
//    hub, and a single hub is pinned (item 3). THE BULK ADDS NOTHING: the husk sees exactly the shadow of the bulk's
//    line law, and the no-go of E-SPN-0115..0121 is a bulk statement that projection cannot undo. The one opening left
//    is the one E-SPN-0120 left in the bulk, and the husk reading does not widen it.
// PREDICTED: B1 fails (every bound candidate's husk velocity is 0 to the reading's resolution), B2 holds (condition Z,
// the star theorem at each candidate's hub), B3 fails (no mover). Controls hold.
//
// GATES, fixed before the first run of this file.
//  B1 a bound composite moves in a new husk direction: for some candidate (a love and a fear on two crossing bulk lines
//     through X, bound by the drift cost's string, E-SPN-0110's exchange-symmetric level on rings of 28, boosted along
//     the lines' bisector to K = pi/2), the husk projection of its centroid's least-squares velocity over 128 beats lies
//     off every constituent's shadow by more than 100 times the control's (C1), with a floor of 1e-4 docks a beat on
//     the control (the held levels of E-SPN-0110 read 2e-5 to 4.5e-5 there): a threshold of 1e-2 docks a beat, 1.28
//     docks over the run. And it is bound: the unboosted level's weight on strings past 7 links is at most 1e-3 over 64
//     beats, and the boosted run's at most 0.1 at every beat (it does not come apart while it goes).
//  B2 the vacuum stays untouched: in the working knit with its vacuum (side 8, 64 beats, path 0, 'pass'), each
//     candidate's love and fear placed at X give 0 readings off the bulk star of X, the vacuum run holds 0 single lines
//     and fires K 0 times.
//  B3 movers along at least 3 independent husk directions: among candidates passing B1 and B2, the husk velocities
//     have rank at least 3.
// CANDIDATES: h60 (1,1,0,0), (1,0,1,0), E-SPN-0110's g60 (shadows two face diagonals); xy60 (1,0,0,1), (0,1,0,1); xz60
//  (1,0,0,1), (0,0,1,1); yz60 (0,1,0,1), (0,0,1,1) (each the bulk bisector casting a face diagonal no member has);
//  xy120 (1,0,0,1), (0,1,0,-1) (at 120 degrees, a swap at X); xx90 (1,0,0,1), (1,0,0,-1) (two bulk classes of ONE shadow, a swap at X,
//  whose only husk freedom would be along x, so it is read and reported but cannot pass B1 by construction).
// CONTROLS (a failed control makes the verdict partial).
//  C1 a composite on one bulk line class moves only along its shadow: a love and a fear bound on ONE line of (1,0,0,1)
//     (E-SPN-0110's calibration (a): a packet to |x| <= 4, envelope e^(-x^2/8), k = pi/4 each, no contact), 128 beats:
//     its centroid reaches at least 1 dock, and its husk velocity off the shadow is at most 1e-12.
//  C2 the star theorem reproduces for a single bulk hub: in the working knit, E-SPN-0119's trio (1,1,0,0), (1,0,1,0),
//     (0,1,1,0) and the depth trio (1,0,0,1), (0,1,0,1), (0,0,1,1), loves at X, give 0 readings off the star and 0 K
//     firings off X, K fires at X at least once on each, and the box has 0 star crossings.
//  CP the knit reading can see the vacuum touched: two hubs over ONE husk point, loves on (1,0,0,1), (0,1,0,1) at X and
//     on (1,0,0,-1), (0,1,0,-1) at Y = X + (0,0,0,2), give readings off the union of the two stars.
//  CAL the velocity reading can say yes to a new direction: two FREE vibes (no cost, no contact) on xy60, packets as C1
//     at k = pi/4 on rings of 64, 32 beats, have a husk velocity off both shadows above B1's threshold, and the bound
//     reading rejects them (strings past 7 links reach more than 0.1).
// CHECKS: the projection commutes on every slot (0 off) with fibers of L docks; every bulk line lands on one husk line
//  (0 off) with L bulk lines per face-diagonal husk line and 2L per axis; K on two singles changes 0 line sets; every
//  unboosted level exact (fidelity at least 1 - 1e-9 over 64 beats); the knit stepper equals keyedRunner on every run.
// Verdict: partial if a check or a control fails; pass if B1, B2 and B3 hold; fail otherwise.
// PROBES, disclosed (instrument only): tmp/bulkturn-probe-1.log (side 8: the projection 0 off of 98,304 slots, fibers
// of 8; 6,144 bulk lines on 576 husk lines, 8 per face-diagonal husk line and 16 per axis; the star of X covers 9 husk
// lines, no fiber dock lies on it, and the six other stacked hubs' stars cross X's at 6 bulk docks (12 for the
// antipode); K without the vacuum: two singles 0 line changes and 156 of 264 carry a vibe onto a line of another
// shadow, three singles change the shadow set on 552 of 1,760 and flip depth only on 24; xy60 boosted, 64 beats:
// husk velocity (-0.0011, -0.0011, 0), reach 0.62, tail 2.1e-3, 12.5 s).
//
// FIRST RUN (tmp/bulkturn-exp-run1.log, 368 s): FAIL on B1 and B3, as predicted; every control and check holds and no
// gate moved. The pair then named xy90 is at 120 degrees ((1,0,0,1) . (0,1,0,-1) = -1), so it was renamed xy120
// after the run: a label only. B1: husk velocities off the shadows 5.7e-4 (h60), 4.7e-4 (xy60, xz60, yz60), 2.7e-4
// (xy120), 0 (xx90, one shadow) docks a beat against a threshold of 1e-2, reach 0.28 to 0.76 docks over 128 beats. The
// four 60-degree pairs give the same numbers because a W(D4) symmetry carries (1,1,0,0), (1,0,1,0) onto each depth
// pair: the husk sees different shadows of ONE bulk dynamics. Each level holds (tail 7.2e-5, fidelity 1 - 9e-14).
// B2: 0 off-star readings for every pair in the working knit (K fires 16 to 35 times at X, recruiting 0 to 9 vacuum
// pairs). B3: 0 movers. C1: one bulk class moves 5.5 docks, husk v (-0.0151, 0, 0), 0 off its shadow. C2: both trios
// 0 off-star and 0 K off X (33 and 13 firings), 0 star crossings. CP: the stacked hubs put 418,798 readings off their
// stars, K on 4,083 docks. CAL: two free vibes on xy60 read 0.118 off both shadows with tail 0.99. Title written after
// the run.
//
// Depth L1: an exact theorem (items 1 to 4) on the committed rule, read on its integer box and table, with stand-in
// readings (floats, L2 instruments) that could have shown a mover and did not. DETERMINISM: no random numbers; every
// start is placed. NOTHING MOVES: the projection only reads, the cost is a phase, the stream takes each value one dock
// along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { loneBand } from '@/code/measure/moving-level'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import { fullPathKey, meshLines } from '@/code/measure/full-key-paths'
import { placeLoves, starCrossings, starLines, starRun, type StarReading } from '@/code/measure/hub-star'
import { boost, conjugateOther, exchangeLines, levelState, oneBody, oneLevels, placedPacket, productState, rootIndex, runCross, sumStates, trackVelocity, type Amp, type CrossSpec } from '@/code/measure/crossing-lines'
import { huskLineCensus, huskStar, offShadow, projectionCensus, shadowCensus, shadowClasses, shadowOf } from '@/code/measure/bulk-shadow'
import { rootsD4 } from '@/code/algebra/group/integer-roots'
import { d4BoxCell, d4BoxCoordinates, d4Coordinates } from '@/code/substrate/d4-box-integer'

const ROOTS = rootsD4()
const SIDE = 8
const KNIT_BEATS = 64
const RING = 28
const N = 7
const HOLD = 64
const READ = 128
const FLOOR = 1e-24
const TAIL = 1e-3
const APART = 0.1
const FACTOR = 100
const CONTROL_FLOOR = 1e-4
const EXACT = 1e-9
const ZERO = 1e-12
const K = Math.PI / 2
const PACKET = { radius: 4, k: Math.PI / 4 }
const CAL = { ring: 64, beats: 32 }
const DEPTH_STACK = [0, 0, 0, 2]

const CANDIDATES = [
  { name: 'h60', a: [1, 1, 0, 0], b: [1, 0, 1, 0] },
  { name: 'xy60', a: [1, 0, 0, 1], b: [0, 1, 0, 1] },
  { name: 'xz60', a: [1, 0, 0, 1], b: [0, 0, 1, 1] },
  { name: 'yz60', a: [0, 1, 0, 1], b: [0, 0, 1, 1] },
  { name: 'xy120', a: [1, 0, 0, 1], b: [0, 1, 0, -1] },
  { name: 'xx90', a: [1, 0, 0, 1], b: [1, 0, 0, -1] },
] as const
const HUSK_TRIO = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
]
const DEPTH_TRIO = [
  [1, 0, 0, 1],
  [0, 1, 0, 1],
  [0, 0, 1, 1],
]

const f4 = (x: number): string => x.toFixed(4)
const e2 = (x: number): string => x.toExponential(2)
const spinor = (k: number): [Amp, Amp] => loneBand(k).vector.map(c => [c[0], c[1]] as Amp) as [Amp, Amp]
const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, c) => s + x * (b[c] as number), 0)
const envelope = (x: number): number => Math.exp(-(x * x) / 8)

// the rank of a set of real vectors (Gaussian elimination with a tolerance)
function rankOf(vectors: readonly (readonly number[])[]): number {
  const rows = vectors.map(v => v.slice())
  let r = 0

  for (let c = 0; c < (rows[0]?.length ?? 0) && r < rows.length; c++) {
    let p = -1

    for (let i = r; i < rows.length; i++) if (Math.abs((rows[i] as number[])[c] as number) > ZERO && (p < 0 || Math.abs((rows[i] as number[])[c] as number) > Math.abs((rows[p] as number[])[c] as number))) p = i
    if (p < 0) continue
    ;[rows[r], rows[p]] = [rows[p] as number[], rows[r] as number[]]
    for (let i = 0; i < rows.length; i++) {
      if (i === r) continue
      const f = ((rows[i] as number[])[c] as number) / ((rows[r] as number[])[c] as number)

      rows[i] = (rows[i] as number[]).map((x, k) => x - f * ((rows[r] as number[])[k] as number))
    }
    r++
  }

  return r
}

export default experiment({
  id: 'spin/bulk-shadow-turn',
  code: 'E-SPN-0127',
  title:
    "the bulk adds no 3d motion, the husk being the bulk's shadow, fail (B1, B3) at L1 as derived: the husk reading pi drops the depth, maps D4 onto Z^3 with fibers of L docks and commutes with the stream on every slot (0 of 98,304 off at side 8), so 12 bulk line classes cast 9 husk directions (the 6 depth classes two to one onto the axes), each face-diagonal husk line carrying 8 bulk lines and each axis 16; K without the vacuum changes a line's shadow (156 of 264 two-single dockings swap a vibe onto a line of another shadow, 552 of 992 three-single firings change the shadow set) but only at its own dock, so the star theorem is a bulk theorem that projection keeps (12 star lines onto 9 husk lines, no dock over pi(X) on the star); a bound pair's husk velocity is pi of its bulk velocity, which lies in the intersection of its lines' spans, so no bound composite can move off its members' shadows: E-SPN-0110's love and fear on six bulk line pairs (h60, the depth pairs xy60, xz60, yz60 whose bisector casts a face diagonal no member has, xy120, and xx90, two classes of one shadow) held exactly (tail 7.2e-5, fidelity 1 - 9e-14) and boosted to pi/2 move 2.7e-4 to 5.7e-4 docks a beat off their shadows against the 1e-2 threshold (the four 60-degree pairs read the same numbers, being W(D4) images of one another), 0 movers; one bulk class moves 5.5 docks along its shadow with 0 off it, and two free vibes read 0.118 off both shadows but come apart (tail 0.99); in the working knit every pair at X keeps the vacuum off its star (0 readings, B2), E-SPN-0119's trio and a depth trio stay pinned, and two hubs stacked over one husk point (X and X + (0,0,0,2), whose stars cross at 6 bulk docks) cascade over 4,083 of 4,096 docks: a husk region shared by two bulk hubs is E-SPN-0120's two-hub cascade, not a mover",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- items 1 to 3 on the box ----
    const X = centerOf(SIDE)
    const fresh = contactFresh(SIDE, 'pass', X)
    const lines = meshLines(fresh.tables)
    const classes = shadowClasses()
    const projection = projectionCensus(fresh.tables, SIDE)
    const huskLines = huskLineCensus(fresh.tables, lines, SIDE)
    const star = huskStar(fresh.tables, lines, SIDE, X)
    const census = { two: shadowCensus([1, -1]), twoLoves: shadowCensus([1, 1]), three: shadowCensus([1, 1, 1]), four: shadowCensus([1, 1, 1, 1]) }
    const projectionHolds = projection.off === 0 && projection.fiberMin === SIDE && projection.fiberMax === SIDE
    const linesHold = huskLines.off === 0 && huskLines.perHusk.every(h => h.bulkPerHusk.length === 1 && h.bulkPerHusk[0] === SIDE * h.bulkClasses)
    const pairKeeps = census.two.lineChange === 0 && census.twoLoves.lineChange === 0

    log('box')

    // ---- the stand-in candidates ----
    const standIn = CANDIDATES.map(g => {
      const A = rootIndex(g.a)
      const B = rootIndex(g.b)
      const spec: CrossSpec = { L: RING, roots: [A, B], charges: [1, -1], cost: true, contact: 'rule' }
      const one = oneBody({ ...spec, charges: [1], anchor: -1 }, 0)
      const { levels } = oneLevels(one, N)
      const nearest = levels.slice().sort((p, q) => p.meanString - q.meanString)[0] as (typeof levels)[number]
      const love = levelState(one, nearest.vector)
      const product = productState(love, conjugateOther(spec, love))
      const level = sumStates(product, exchangeLines(spec, product), 1)
      const held = runCross(spec, level, HOLD, N, FLOOR)
      const cosTheta = dot(g.a, g.b) / 2
      const k = (K * Math.sqrt((1 + cosTheta) / 2)) / 2
      const moved = runCross(spec, boost(spec, level, [k, k]), READ, N, FLOOR)
      const velocity = trackVelocity(spec, moved.centroid)
      const husk = shadowOf(velocity.velocity)
      const shadows = [shadowOf(g.a), shadowOf(g.b)]

      log(`stand-in ${g.name}`)

      return { g, cosTheta, k, held, moved, velocity, husk, off: offShadow(husk, shadows), heldTail: Math.max(...held.tail), movedTail: Math.max(...moved.tail), exact: Math.min(...held.fidelity) >= 1 - EXACT }
    })

    // ---- C1: one bulk line class ----
    const A1 = rootIndex([1, 0, 0, 1])
    const onLine: CrossSpec = { L: RING, roots: [A1, rootIndex([0, 1, 0, 1])], charges: [1, -1], cost: true, contact: 'off' }
    const lineRun = runCross(onLine, placedPacket(onLine, [0, 0], PACKET.radius, envelope, [PACKET.k, PACKET.k], [spinor(PACKET.k), spinor(PACKET.k)]), READ, N, FLOOR)
    const lineVelocity = trackVelocity(onLine, lineRun.centroid)
    const lineHusk = shadowOf(lineVelocity.velocity)
    const controlOff = offShadow(lineHusk, [shadowOf(ROOTS[A1] as number[])])
    const C1 = lineVelocity.reach >= 1 && controlOff <= ZERO
    const threshold = FACTOR * Math.max(controlOff, CONTROL_FLOOR)

    log('C1')

    // ---- CAL: two free vibes on xy60 ----
    const xy = CANDIDATES[1]
    const free: CrossSpec = { L: CAL.ring, roots: [rootIndex(xy.a), rootIndex(xy.b)], charges: [1, -1], cost: false, contact: 'off' }
    const freeRun = runCross(free, placedPacket(free, [0, 1], PACKET.radius, envelope, [PACKET.k, PACKET.k], [spinor(PACKET.k), spinor(PACKET.k)]), CAL.beats, N, FLOOR)
    const freeVelocity = trackVelocity(free, freeRun.centroid)
    const freeHusk = shadowOf(freeVelocity.velocity)
    const freeOff = offShadow(freeHusk, [shadowOf(xy.a), shadowOf(xy.b)])
    const freeTail = Math.max(...freeRun.tail)
    const CAL_HOLDS = freeOff > threshold && freeTail > APART

    log('CAL')

    // ---- the working knit: B2, C2, CP ----
    const key = fullPathKey(0)
    const vacuum = wordVacuum(fresh, fresh.store)
    const run = (start: ReturnType<typeof placeLoves>, hub: number[]): StarReading => starRun({ tables: fresh.tables, vacuum, start, lines, hub, key, threshold: THRESHOLD_BORN, beats: KNIT_BEATS, side: SIDE })
    const withFear = (start: ReturnType<typeof placeLoves>, dock: number, slot: number): ReturnType<typeof placeLoves> => {
      start.vibe[dock * 24 + slot] = -1

      return start
    }
    const knit = CANDIDATES.map(g => {
      const r = run(withFear(placeLoves(vacuum, [{ dock: X, slot: rootIndex(g.a) }, { dock: X, slot: rootIndex(g.b) }]), X, rootIndex(g.b)), [X])

      log(`knit ${g.name}`)

      return { name: g.name, r, b2: r.offStar === 0 && r.vacuumSingles === 0 && r.vacuumEvents === 0 }
    })
    const crossings = starCrossings(fresh.cells, lines, starLines(lines, [X]), [X]).length
    const trios = [HUSK_TRIO, DEPTH_TRIO].map(t => run(placeLoves(vacuum, t.map(r => ({ dock: X, slot: rootIndex(r) }))), [X]))
    const C2 = crossings === 0 && trios.every(r => r.offStar === 0 && r.offHub === 0 && r.events.length > 0)
    const Xc = d4BoxCoordinates({ cell: X, side: SIDE })
    const Y = d4BoxCell({ coordinates: Xc.map((c, k) => c + (d4Coordinates(DEPTH_STACK)[k] as number)), side: SIDE })
    const stacked = run(
      placeLoves(vacuum, [
        { dock: X, slot: rootIndex([1, 0, 0, 1]) },
        { dock: X, slot: rootIndex([0, 1, 0, 1]) },
        { dock: Y, slot: rootIndex([1, 0, 0, -1]) },
        { dock: Y, slot: rootIndex([0, 1, 0, -1]) },
      ]),
      [X, Y],
    )
    const stackedCrossings = starCrossings(fresh.cells, lines, starLines(lines, [X, Y]), [X, Y]).length
    const CP = stacked.offStar > 0

    log('knit')

    // ---- the gates ----
    const b1 = standIn.map(s => s.off > threshold && s.heldTail <= TAIL && s.movedTail <= APART)
    const B1 = b1.some(Boolean)
    const B2 = knit.every(k => k.b2)
    const movers = standIn.filter((_, i) => b1[i] && (knit[i] as (typeof knit)[number]).b2)
    const moverRank = movers.length === 0 ? 0 : rankOf(movers.map(m => m.husk))
    const B3 = moverRank >= 3
    const stepper = [...knit.map(k => k.r), ...trios, stacked].every(r => r.stepperDiffer === 0)
    const checks = { projection: projectionHolds, lines: linesHold, pairKeeps, exact: standIn.every(s => s.exact), stepper }
    const checked = Object.values(checks).every(Boolean)
    const controls = { C1, C2, CP, CAL: CAL_HOLDS }
    const controlled = Object.values(controls).every(Boolean)
    const status = !checked || !controlled ? 'partial' : B1 && B2 && B3 ? 'pass' : 'fail'

    const metrics: Record<string, number> = {
      B1: B1 ? 1 : 0,
      B2: B2 ? 1 : 0,
      B3: B3 ? 1 : 0,
      control_C1: C1 ? 1 : 0,
      control_C2: C2 ? 1 : 0,
      control_CP: CP ? 1 : 0,
      calibration: CAL_HOLDS ? 1 : 0,
      bulkClasses: classes.huskOf.length,
      huskDirections: classes.keys.length,
      projectionSlots: projection.slots,
      projectionOff: projection.off,
      fiber: projection.fiberMin,
      huskPoints: projection.huskPoints,
      bulkLines: huskLines.bulkLines,
      huskLines: huskLines.huskLines,
      huskLineOff: huskLines.off,
      starHuskLines: star.huskLines,
      starHuskCrossings: star.huskCrossings,
      fiberOnStar: star.fiberOnStar,
      stackedStarCrossings: stackedCrossings,
      starCrossings: crossings,
      twoFires: census.two.fires,
      twoLineChange: census.two.lineChange,
      twoVibeShadowChange: census.two.vibeShadowChange,
      threeFires: census.three.fires,
      threeLineChange: census.three.lineChange,
      threeShadowSetChange: census.three.shadowSetChange,
      threeDepthOnly: census.three.depthOnly,
      fourLineChange: census.four.lineChange,
      fourShadowSetChange: census.four.shadowSetChange,
      fourDepthOnly: census.four.depthOnly,
      threshold,
      controlOff,
      controlReach: lineVelocity.reach,
      controlHuskSpeed: Math.hypot(...lineHusk),
      freeOff,
      freeTail,
      moverRank,
      trioHuskOffStar: (trios[0] as StarReading).offStar,
      trioHuskK: (trios[0] as StarReading).events.length,
      trioDepthOffStar: (trios[1] as StarReading).offStar,
      trioDepthK: (trios[1] as StarReading).events.length,
      trioDepthOffHub: (trios[1] as StarReading).offHub,
      stackedOffStar: stacked.offStar,
      stackedK: stacked.events.length,
      stackedKDocks: new Set(stacked.events.map(e => e.dock)).size,
      stackedWakeLast: stacked.wake[stacked.wake.length - 1] as number,
      seconds: (Date.now() - started) / 1000,
    }

    standIn.forEach(s => {
      const p = s.g.name

      metrics[`${p}_off`] = s.off
      metrics[`${p}_huskSpeed`] = Math.hypot(...s.husk)
      metrics[`${p}_reach`] = s.velocity.reach
      metrics[`${p}_heldTail`] = s.heldTail
      metrics[`${p}_movedTail`] = s.movedTail
      metrics[`${p}_leastFidelity`] = Math.min(...s.held.fidelity)
    })
    knit.forEach(k => {
      metrics[`${k.name}_knitOffStar`] = k.r.offStar
      metrics[`${k.name}_knitK`] = k.r.events.length
      metrics[`${k.name}_knitRecruited`] = k.r.recruited
    })

    const standText = standIn.map(s => `${s.g.name} husk v (${s.husk.map(e2).join(', ')}) off ${e2(s.off)}, reach ${f4(s.velocity.reach)}, tails ${e2(s.heldTail)} / ${e2(s.movedTail)}`).join('; ')
    const knitText = knit.map(k => `${k.name} off-star ${k.r.offStar}, K ${k.r.events.length} (recruited ${k.r.recruited})`).join('; ')
    return verdict({
      status,
      claim: `the husk read as the projection of the D4 box: 12 bulk line classes cast 9 husk directions (the 6 depth classes two to one onto the axes), the stream commutes with the projection on ${projection.off === 0 ? 'every' : 'not every'} slot, each face-diagonal husk line carries ${SIDE} bulk lines and each axis ${2 * SIDE}; K without the vacuum keeps two singles' line set (0 of ${census.two.fires} change it) and changes three singles' shadow set on ${census.three.shadowSetChange} of ${census.three.fires} firings, always at its own dock; bound pairs boosted along their bisector: ${standText} (threshold ${e2(threshold)}; B1 ${B1}); in the working knit ${knitText} (B2 ${B2}); movers' rank ${moverRank} (B3 ${B3}); two hubs over one husk point: off-star ${stacked.offStar}, K on ${new Set(stacked.events.map(e => e.dock)).size} docks`,
      metrics,
      control: { controlOff, controlReach: lineVelocity.reach, freeOff, freeTail, trioOffStar: (trios[0] as StarReading).offStar + (trios[1] as StarReading).offStar, stackedOffStar: stacked.offStar },
      notes: `L1. B1 ${B1}, B2 ${B2}, B3 ${B3}; controls ${JSON.stringify(controls)}; checks ${JSON.stringify(checks)}. Classes ${JSON.stringify(classes)}. Projection ${JSON.stringify(projection)}. Husk lines ${JSON.stringify(huskLines)}. Star ${JSON.stringify(star)}, stacked star crossings ${stackedCrossings}. K census ${JSON.stringify(census)}. Stand-in: ${standIn.map(s => `${s.g.name} cos ${f4(s.cosTheta)} k ${f4(s.k)} v4 (${s.velocity.velocity.map(e2).join(', ')}) least fidelity ${Math.min(...s.held.fidelity)} size ${s.moved.size} dropped ${e2(s.moved.dropped)}`).join('; ')}. C1: husk v (${lineHusk.map(e2).join(', ')}), reach ${f4(lineVelocity.reach)}, off ${e2(controlOff)}. CAL: husk v (${freeHusk.map(e2).join(', ')}), off ${e2(freeOff)}, tail ${e2(freeTail)}. Trios: husk off-star ${(trios[0] as StarReading).offStar} K ${(trios[0] as StarReading).events.length} off X ${(trios[0] as StarReading).offHub}; depth off-star ${(trios[1] as StarReading).offStar} K ${(trios[1] as StarReading).events.length} off X ${(trios[1] as StarReading).offHub}. Stacked hubs X ${X}, Y ${Y}: off-star ${stacked.offStar}, K ${stacked.events.length} on ${new Set(stacked.events.map(e => e.dock)).size} docks, wake ${stacked.wake.filter((_, i) => i % 16 === 15).join(' ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
