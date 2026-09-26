// Staggered vacuum timing on the living-pair knit (E-RLT-0083): can the vacuum's pair moves be scheduled, W(F4)-
// covariantly, so that vacuum pairs from different lines never share a dock on one beat, and does that bound the wake of
// a lone vibe?
//
// THE PROBLEM (E-RLT-0080 to E-RLT-0082). Isotropic husk transport needs a vacuum storing all 12 lines equally; the
// least such vacuum, the oriented hub, brings all 24 vacuum vibes of a hub's neighbours onto the hub at one beat, and a
// lone vibe arriving there scatters them into a box-filling wake (8,896 trits per period on side 8).
//
// DERIVED HERE (code/measure/staggered-vacuum):
//  1. A SCHEDULE PER LINE CLASS NEEDS NO CHANGE OF THE RULE. On a vacuum satisfying (Z) line by line (the hub does),
//     every collision a vacuum vibe meets is -1 on its line and the pair move acts line by line, so the vacuum's lines
//     evolve independently; a unit's phase in the period-6 cycle is fixed by the initial STATE. So staggering the lines
//     is a choice of vacuum state, and the rule keeps its whole W(F4)-covariance. E-RLT-0062's collapse (a schedule
//     written into the rule keeps only {I, -I}) does not arise, because nothing is written into the rule.
//  2. THE STAGGER IS BY FRAME. The 12 lines split into three frames of four mutually orthogonal lines. Frame c runs at
//     phase -2c mod 6 (an even shift keeps each unit's order of pieces). Each hub then holds ONE frame per beat: 4 lines,
//     8 vibes, instead of 12 lines.
//  3. THE STATE KEEPS 576 ELEMENTS AS SPACE-TIME SYMMETRIES. An element g of the orientation group (576 elements) that
//     cycles the frames by sigma carries V(t) to V(t + 2 sigma(g)). An element that transposes two frames has no time
//     shift that works. So the staggered vacuum keeps an index-2 subgroup of W(F4) with time shifts: the same 576
//     elements that orient the unstaggered hub, which force the husk scalars through k^4 and the shear at leading
//     order.
//  4. FOUR LINES IS THE FLOOR. Any covariant stagger gives the units around a hub phases phi(g u) = phi(u) + tau(g), tau a
//     homomorphism into the cyclic group of time shifts; its kernel holds the commutator subgroup and the root
//     stabilizers (the PHASE KERNEL), and the lines of one kernel orbit share a hub-beat. For 2T (the least group forcing
//     the husk scalars through k^4, E-RLT-0063) the phase kernel is Q8, whose line orbits are the three frames. The
//     census asks every two-generated subgroup of W(F4): none whose phase kernel has a line orbit below 4 forces the husk
//     scalars through k^4. So "one vacuum pair per dock-beat" is out of reach for an isotropic vacuum, and the frame
//     stagger is the finest there is.
//  5. AND ONE PAIR PER DOCK-BEAT WOULD NOT BE ENOUGH WITH K. The one-line vacuum IS that limit (every dock-beat holds at
//     most one vacuum pair), and its lone-vibe wake fills a plane (E-RLT-0077: 266 trits per period on side 9, about
//     3 L^2). The scattering is K's own: a lone vibe of root r turns every full line at 60 degrees to r (K = w_r = -s_r),
//     whether one pair shares its dock or twelve do. So staggering alone cannot bound the wake; the collision has to
//     change (E-RLT-0084).
//
// Gates, fixed before the first run of this file:
//  S1 frames: the lines form three frames of four, each line orthogonal to exactly three others
//  S2 the stagger is a state: on the side-4 and side-8 boxes the staggered hub vacuum runs under the UNCHANGED knit
//     with period 6, zero occupation momentum at every dock at every coin piece, exactly one third of the units made and
//     one third unmade on every beat, and at most 4 lines holding vibes on any dock at any coin piece (the unstaggered
//     vacuum: 12)
//  S3 symmetry: all 576 elements of the orientation group are space-time symmetries of the staggered vacuum with the
//     derived shift 2 sigma(g), and the group forces the husk scalars through k^4 and the shear at leading order
//  S4 the floor: 2T's phase kernel has order 8 and the three frames as its line orbits, and 0 two-generated subgroups
//     whose phase kernel has a line orbit below 4 force the husk scalars through k^4
//  W  the target: the lone-love wake on the staggered vacuum (side 8, 24 directions, 4 periods of 24 beats) is at most
//     the committed knit's dressing at side 8 in every period
// Verdict: pass if S1 to S4 and W hold; fail if S1 to S4 hold and W does not; partial otherwise.
//
// PREDICTED before this file ran: S1 to S4 hold, W FAILS (point 5). DISCLOSED: probes before this file measured the
// staggered vacuum (period 6, 4 lines, 64 made per beat on side 4), the space-time check (576 derived), the census
// (3,987 subgroups) and the staggered wake under K (8,952, 8,288, 8,344, 8,295 on side 8), so S2 to S4 and W are
// confirmations here, not predictions.
//
// Reported, not gated: the same staggered vacuum under the lone bounce collision of E-RLT-0084 (the wake the collision
// change gives, with and without the stagger), and the unstaggered controls.
//
// FIRST RUN (90.5 s): fail, as predicted and recorded as is. S1 to S4 hold (period 6, 4 lines per hub-beat against 12,
// 64 of 192 units made and unmade on every beat of the side-4 box, 576 space-time symmetries with the derived shift, the
// census 3,987 subgroups with 0 of the 3,602 below the floor forcing), W fails (8,952, 8,288, 8,344, 8,295 against the
// committed 28, 75, 129, 214). Under the lone bounce collision the staggered and unstaggered wakes are the same, 13, 15,
// 13, 15: the stagger adds nothing once the collision stops scattering. Title written after the run.
//
// Depth L2 (a construction on the knit, checked exhaustively; the census is over two-generated subgroups only, as
// E-RLT-0063's was). DETERMINISM: every start is the vacuum or a single vibe; Weyl-free; no draw.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { turningWeave } from '@/code/rule/collision'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { bounceRunner, makeBounceKernel } from '@/code/measure/bounce-pair-kernel'
import { tritDifference, type Reduced } from '@/code/measure/living-pair-kernel'
import { binaryTetrahedralIndices, coinData, huskForcing, orientedHub, orientedHubStore, uniformStore } from '@/code/measure/varying-vacuum'
import { layoutOf, weaveOf } from '@/code/measure/varying-living-battery'
import { dressing as ruleDressing, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { d4BoxCell, d4BoxCoordinates, d4Coordinates } from '@/code/substrate/d4-box'
import { framesCheck, history, lineOrbits, lineShareCensus, periodOf, phaseKernel, spaceTimeCheck, staggeredStart, type History } from '@/code/measure/staggered-vacuum'

const ROOTS = rootsD4()
const SHIFTS = [0, 4, 2]
const WAKE_SIDE = 8
const BEATS = 96

export default experiment({
  id: 'relativity/staggered-vacuum-timing',
  code: 'E-RLT-0083',
  title:
    'staggered vacuum timing on the living-pair knit, fail as predicted: staggering the hub vacuum by line frame is a choice of STATE (the knit unchanged, its W(F4)-covariance whole), runs the exact period-6 cycle with zero momentum at every dock-beat, holds 4 lines on a hub per beat instead of 12, and keeps 576 elements of W(F4) as space-time symmetries (the frame transpositions keep none); 4 lines is the floor (0 of 3,602 two-generated subgroups whose phase kernel has a line orbit below 4 force the husk scalars through k^4); but the lone-love wake under the isometric map stays box-filling (8,952 trits in the first period on side 8, unstaggered 8,896, committed 28), because that map scatters a 60-degree vacuum pair whether one or twelve share the dock (the one-line vacuum, one pair per dock-beat, wakes 266 on side 9)',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const table = groupTable()
    const coins = coinData(table)
    const r0 = d4Coordinates(ROOTS[LINE_FIRSTS[0] as number] as number[])
    const hub = orientedHub(coins)
    const twoT = binaryTetrahedralIndices(table)

    // S1
    const frames = framesCheck()
    const s1 = frames.frames === 3 && frames.sizes.every(s => s === 4) && frames.orthogonalEach.every(n => n === 3)

    // S2: the vacuum on sides 4 and 8, under the unchanged knit (K), unstaggered and staggered
    const vacuumOf = (side: number, kind: CollisionKind): { kernel: ReturnType<typeof makeBounceKernel>; plain: History; staggered: History; center: number } => {
      const kernel = makeBounceKernel(weaveOf(side), kind)
      const cells = kernel.cells
      const mid = side / 2
      const center = d4BoxCell({ coordinates: [mid, mid, mid, mid], side })
      const hubAt = d4BoxCoordinates({ cell: center, side }).map((v, k) => v - (r0[k] as number))
      const start: Reduced = { vibe: new Int8Array(cells * 24), point: new Int8Array(cells * 24), store: orientedHubStore(coins, side, hubAt), spoint: Int8Array.from(layoutOf(side)) }
      const plain = history(kernel, start, 24)

      return { kernel, plain, staggered: history(kernel, staggeredStart(plain, SHIFTS), 24), center }
    }
    const runs = [4, 8].map(side => ({ side, ...vacuumOf(side, 'isometric') }))
    const exactOf = (h: History, units: number): boolean =>
      periodOf(h.states, 12) === 6 && h.momentumDocks.every(n => n === 0) && h.made.every(n => 3 * n === units) && h.unmade.every(n => 3 * n === units) && Math.max(...h.maxLines) <= 4
    const s2 = runs.every(r => exactOf(r.staggered, r.plain.made[0] ?? 0))

    log('s2')

    // S3: space-time symmetry on side 4 with the hub at the origin
    const k4 = makeBounceKernel(weaveOf(4), 'isometric')
    const origin: Reduced = { vibe: new Int8Array(256 * 24), point: new Int8Array(256 * 24), store: orientedHubStore(coins, 4, [0, 0, 0, 0]), spoint: Int8Array.from(layoutOf(4)) }
    const plain0 = history(k4, origin, 12)
    const staggered0 = history(k4, staggeredStart(plain0, SHIFTS), 12)
    const orient = spaceTimeCheck({ coins, side: 4, group: hub.group, states: staggered0.states.slice(0, 6), period: 6 })
    const all = spaceTimeCheck({ coins, side: 4, group: table.permutations.map((_, i) => i), states: staggered0.states.slice(0, 6), period: 6 })
    const forcing = huskForcing(coins, hub.group)
    const s3 = orient.derived === 576 && orient.none === 0 && forcing.husk4 && forcing.huskShear2

    log('s3')

    // S4
    const q8 = phaseKernel(table, twoT, twoT)
    const q8Orbits = lineOrbits(coins, q8)
    const hubKernel = phaseKernel(table, hub.group, [...twoT, hub.extra])
    const census = lineShareCensus(table, coins, 4)
    const s4 = q8.length === 8 && q8Orbits.length === 3 && q8Orbits.every(o => o.length === 4) && census.belowForcing === 0

    log('s4')

    // W: the lone-love wake on the staggered vacuum, side 8, against the committed dressing at side 8
    const wake = (kind: CollisionKind, stagger: boolean): number[] => {
      const v = vacuumOf(WAKE_SIDE, kind)
      const start0 = stagger ? staggeredStart(v.plain, SHIFTS) : (v.plain.states[0] as Reduced)
      const vac = history(v.kernel, start0, BEATS)
      const worst = [0, 0, 0, 0]

      for (let d = 0; d < 24; d++) {
        const s = stagger ? staggeredStart(v.plain, SHIFTS) : ({ ...(v.plain.states[0] as Reduced), vibe: Int8Array.from((v.plain.states[0] as Reduced).vibe) } as Reduced)

        if (s.vibe[v.center * 24 + d] !== 0) continue

        s.vibe[v.center * 24 + d] = 1

        const run = bounceRunner(v.kernel, s)

        for (let t = 0; t < BEATS; t++) {
          run.beat()
          worst[Math.floor(t / 24)] = Math.max(worst[Math.floor(t / 24)] ?? 0, tritDifference(run.state(), vac.states[t + 1] as Reduced).trits)
        }
      }

      return worst
    }
    const committedRule: ScheduledRule = (opposite, forward) => turningWeave({ opposite, forward, table: 'pair' })
    const committed = ruleDressing(committedRule, { side: WAKE_SIDE, tone: 1 })
    const staggeredK = wake('isometric', true)
    const plainK = wake('isometric', false)
    const staggeredLone = wake('lone', true)
    const plainLone = wake('lone', false)
    const w = staggeredK.every((x, p) => x <= (committed.periodLargest[p] ?? 0))

    log('w')

    // the ideal limit, one pair per dock-beat: the one-line vacuum under K on side 9
    const oneLine = (() => {
      const kernel = makeBounceKernel(weaveOf(9), 'isometric')
      const cells = kernel.cells
      const center = d4BoxCell({ coordinates: [4, 4, 4, 4], side: 9 })
      const start: Reduced = { vibe: new Int8Array(cells * 24), point: new Int8Array(cells * 24), store: uniformStore(cells, [0]), spoint: Int8Array.from(layoutOf(9)) }
      const vac = history(kernel, start, BEATS)
      let worst = 0

      for (let d = 0; d < 24; d++) {
        const s: Reduced = { ...start, vibe: Int8Array.from(start.vibe) }

        s.vibe[center * 24 + d] = 1

        const run = bounceRunner(kernel, s)

        for (let t = 0; t < 24; t++) {
          run.beat()
          worst = Math.max(worst, tritDifference(run.state(), vac.states[t + 1] as Reduced).trits)
        }
      }

      return { worst, lines: Math.max(...vac.maxLines) }
    })()

    log('one line')

    const status = s1 && s2 && s3 && s4 ? (w ? 'pass' : 'fail') : 'partial'
    const per = (xs: readonly number[]): string => xs.join(', ')
    const r4 = runs[0]!
    const r8 = runs[1]!

    return verdict({
      status,
      claim: `staggering the hub vacuum by frame is a choice of STATE (the knit unchanged, W(F4)-covariant whole): it runs the exact period-6 cycle with (Z) at every dock-beat and puts ${Math.max(...r8.staggered.maxLines)} lines on a hub per beat instead of ${Math.max(...r8.plain.maxLines)}, and keeps ${orient.derived} of W(F4)'s elements as space-time symmetries (the frame transpositions keep none); no two-generated subgroup whose phase kernel has a line orbit below 4 forces the husk scalars (${census.belowForcing} of ${census.below}), so 4 lines per hub-beat is the floor; but the lone-love wake under K is ${per(staggeredK)} trits per period on side ${WAKE_SIDE} (unstaggered ${per(plainK)}, committed ${per(committed.periodLargest)}): the stagger does not bound it, because K scatters a 60-degree pair whether one or twelve share the dock (the one-line vacuum, one pair per dock-beat, wakes ${oneLine.worst} on side 9)`,
      metrics: {
        framesThree: s1 ? 1 : 0,
        side4PlainPeriod: periodOf(r4.plain.states, 12),
        side4StaggeredPeriod: periodOf(r4.staggered.states, 12),
        side4PlainLines: Math.max(...r4.plain.maxLines),
        side4StaggeredLines: Math.max(...r4.staggered.maxLines),
        side4StaggeredMomentumDocks: r4.staggered.momentumDocks.reduce((a, b) => a + b, 0),
        side4MadePerBeat: r4.staggered.made[0] ?? -1,
        side4Units: r4.plain.made[0] ?? -1,
        side8StaggeredPeriod: periodOf(r8.staggered.states, 12),
        side8PlainLines: Math.max(...r8.plain.maxLines),
        side8StaggeredLines: Math.max(...r8.staggered.maxLines),
        side8StaggeredMomentumDocks: r8.staggered.momentumDocks.reduce((a, b) => a + b, 0),
        side8MadePerBeat: r8.staggered.made[0] ?? -1,
        side8Units: r8.plain.made[0] ?? -1,
        vetoesInVacuum: r8.staggered.vetoed.reduce((a, b) => a + b, 0),
        orientationDerivedShift: orient.derived,
        orientationOtherShift: orient.otherShift,
        orientationNone: orient.none,
        wf4Derived: all.derived,
        wf4None: all.none,
        wf4Transpositions: all.transpositions,
        orientationForcesHusk4: forcing.husk4 ? 1 : 0,
        orientationForcesShear2: forcing.huskShear2 ? 1 : 0,
        q8Order: q8.length,
        q8LineOrbits: q8Orbits.length,
        hubPhaseKernelOrder: hubKernel.length,
        hubPhaseKernelLeastOrbit: Math.min(...lineOrbits(coins, hubKernel).map(o => o.length)),
        censusPairs: census.pairs,
        censusSubgroups: census.subgroups,
        censusBelow4: census.below,
        censusBelow4Forcing: census.belowForcing,
        ...Object.fromEntries(Object.entries(census.shares).map(([k, v]) => [`censusLeastOrbit${k}`, v])),
        ...Object.fromEntries(staggeredK.map((x, p) => [`staggeredKWakePeriod${p + 1}`, x])),
        ...Object.fromEntries(plainK.map((x, p) => [`plainKWakePeriod${p + 1}`, x])),
        ...Object.fromEntries(staggeredLone.map((x, p) => [`staggeredLoneWakePeriod${p + 1}`, x])),
        ...Object.fromEntries(plainLone.map((x, p) => [`plainLoneWakePeriod${p + 1}`, x])),
        ...Object.fromEntries(committed.periodLargest.map((x, p) => [`committedSide${WAKE_SIDE}Period${p + 1}`, x])),
        oneLineWakeSide9Period1: oneLine.worst,
        oneLineLinesPerDockBeat: oneLine.lines,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        unstaggeredLinesPerHubBeat: Math.max(...r8.plain.maxLines),
        unstaggeredKWakePeriod1: plainK[0] ?? -1,
      },
      notes: `L2. Gates: S1 ${s1}, S2 ${s2}, S3 ${s3}, S4 ${s4}, W ${w}. Frames ${JSON.stringify(frames.sizes)}. Staggered vacuum (shifts ${SHIFTS.join(', ')} by frame): side 4 period ${periodOf(r4.staggered.states, 12)}, ${Math.max(...r4.staggered.maxLines)} lines per dock at a coin piece (unstaggered ${Math.max(...r4.plain.maxLines)}), made per beat ${per(r4.staggered.made.slice(0, 6))} of ${r4.plain.made[0]} units, momentum docks ${r4.staggered.momentumDocks.reduce((a, b) => a + b, 0)}; side 8 period ${periodOf(r8.staggered.states, 12)}, lines ${Math.max(...r8.staggered.maxLines)}, made per beat ${per(r8.staggered.made.slice(0, 6))} of ${r8.plain.made[0]}. Space-time: the orientation group ${JSON.stringify(orient)}, all of W(F4) ${JSON.stringify(all)} (its 576 frame transpositions are symmetries at no time shift); the orientation group forces ${JSON.stringify(forcing)}. Phase kernels: 2T -> order ${q8.length}, line orbits ${JSON.stringify(q8Orbits)}; the orientation group -> order ${hubKernel.length}. Census over ${census.pairs} generator pairs, ${census.subgroups} subgroups: least phase-kernel line orbit ${JSON.stringify(census.shares)}; of the ${census.below} with an orbit below 4, ${census.belowForcing} force the husk scalars through k^4. Wake per period on side ${WAKE_SIDE} (24 directions, lone love): K staggered ${per(staggeredK)}, K unstaggered ${per(plainK)}, lone bounce staggered ${per(staggeredLone)}, lone bounce unstaggered ${per(plainLone)}; committed ${per(committed.periodLargest)}. One-line vacuum (one pair per dock-beat, ${oneLine.lines} line per dock) under K on side 9: first-period wake ${oneLine.worst}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
