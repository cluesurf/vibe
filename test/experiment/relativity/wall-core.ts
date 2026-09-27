// Walls with a one-dock core: the restated wall gate B' on the hub vacuum's own ideal (E-RLT-0092).
//
// THE DECISION, AND WHEN IT WAS MADE. E-RLT-0090 (relativity/vacuum-own-walls) graded walls against the hub vacuum's
// own ideal (code/measure/coset-walls: 3,072 ground states, a dock's history over a 6-beat window, S(x) the ground
// states that hold it) and asked for ZERO departure (its gate B). It failed on all 17 starts. Its numbers, which the
// user SAW before making this decision: the four spatial cosets that keep the hub lattice (C, g, gC, the translation
// 2 r0) froze into a wall at exactly the ideal place, 432 departing docks (2 interfaces x 216), every one a DEFECT at
// distance 1 from the interface, 0 in the bulk, the same at all 20 windows and all 17 starts, with 0 wall edges (a
// dock that sees both domains holds neither history); the time coset (the old half-late wall) departed on 16,847 to
// 16,848 of 20,736 docks and the translation r0 on 20,567 to 20,647, bulk 5,616 and about 6,870 of 6,912.
//
// THE USER'S DECISION (2026-09-26, after those numbers): gate B is restated. A wall may have a core: departure from
// the vacuum's own ideal is allowed ONLY on the docks at the ideal wall (the end docks of the ideal's wall edges), and
// nowhere else. B' was chosen AFTER seeing E-RLT-0090's numbers. E-RLT-0090's strict verdict (fail) stands as its
// own record and is not changed; this file is a NEW experiment under the restated gate.
//
// THE RESTATED GATE B', exactly (code/measure/wall-core):
//   E           the end docks of the ideal's wall edges: both ends of every edge the ideal patchwork reads as a wall
//   departing   the docks x with D(x) not in S(x) (the dock left its own domain's ground state; defects included),
//               plus both endpoints of every edge in the symmetric difference of the run's wall edges and the ideal's
//   B'          at every settled window the departing set is a subset of E, and the core does not grow between
//               windows: departing(w + 1) is a subset of departing(w) for consecutive settled windows
// C stays exactly as in E-RLT-0090: at every settled window no dock 3 or more roots from the interface has D(x) not in
// S(x) (denominator: those docks, 6,912 of 20,736).
//
// HUSK FIRST. A husk dock is a column of bulk docks (code/measure/causal-components boxHusk; side^3 = 1,728 columns on
// side 12). The husk reading of B' is the number of columns holding a departing dock outside E, of 1,728; the bulk
// reading beside it is the number of such docks, of 20,736. A column holds one exactly when the bulk count is
// positive, so the two verdicts agree by construction; the numbers differ. Beside: the departing columns outside E's
// columns (the coarser husk reading), and the core's columns and column sums.
//
// THE CORE, DESCRIBED (not gated). At the last settled window each dock of E with D(x) not in S(x) is a core dock (a
// departing dock of E that holds its own ground state departs only as the end of a changed edge; it is counted and
// checked equal to its own ground state trit for trit, not described). Its 216 trits
// (6 beats x 24 vibes and 12 stores) are compared with the two ground states that meet there, its own domain's and
// the other's, each read at that dock: QUIET (both sides agree and so does the run), NOVEL (both agree, the run does
// not), OWN or OTHER (the sides disagree and the run takes that side), NEITHER (the sides disagree and the run takes
// the third value). Also the stores and vibes separately, silent docks, distinct core histories, and docks whose
// history changed between the first settled window and the last.
//
// SETUP: E-RLT-0090's exactly (copied into code/measure/wall-core because 0090 does not export it): the lone bounce
// knit L (code/measure/bounce-pair-kernel 'lone'), the oriented hub vacuum anchored so dock 0 stores line 0, M from
// the side-8 vacuum restricted to the side-4 period cell, graded runs on SIDE 12, settled windows beats 72 to 191 (20
// windows of 6), each of E-MTH-0028's 17 link starts building its own weave inside withStart (makeColorWeave; never
// weaveOf or hubSetup, which cache per side and would read one start 17 times). Six cases, a slab of the six layers
// with first coordinate >= 6 against the vacuum: time (the half-late vacuum = time coset s = 2), C, g, gC (the three
// nontrivial spatial point cosets), r0 and 2r0 (the slab's store translated).
//
// Gates, fixed before the first run of this file:
//  A  on every start, the hub vacuum run alone reads 0 departing docks (E is empty there) and 0 strict departure at
//     every settled window
//  R  on every start, the strict reading reproduces E-RLT-0090's record: over the 17 starts the strict departure docks
//     range time 16,847..16,848, C, g, gC and 2r0 432..432, r0 20,567..20,647; and the husk map has 0 step errors
//  K  (default start, on the ideal patchwork of each of the six cases) the controls make B' informative: the clean
//     ideal PASSES; a full one-dock core (every dock of E made a defect by one flipped trit) PASSES; a planted defect
//     one dock away from E FAILS; a planted defect deep in a domain (the greatest distance from the interface, at
//     least 3) FAILS; a core two docks thick (E and every neighbor of E made defects) FAILS; a core that grows between
//     two windows (half of E, then all of E; replaced after the first run by: the clean ideal, then all of E) FAILS; one that shrinks (all of E, then half) PASSES; and every planted
//     defect is a history no ground state holds
//  B' on every start, for every case (husk reading first)
//  C  on every start, for every case, as in E-RLT-0090
// Verdict: partial if A, R or K fails (the instrument). Otherwise pass if B' and C hold for all six cases on all 17
// starts; partial if the four lattice-keeping cosets (C, g, gC, 2r0) pass B' and C on all 17 starts and some other
// case fails; fail if any lattice-keeping coset fails B' or C on any start.
//
// PREDICTED before the first run: A, R and K hold; the four lattice-keeping cosets (C, g, gC, 2r0) PASS B' and C on
// all 17 starts (their 432 frozen defects lie on E, no departure grows); the time coset and r0 FAIL (thousands of
// departing docks outside E, and C fails); so the verdict is partial. The core's content is not predicted beyond
// "it holds neither side's history" (E-RLT-0090).
//
// DISCLOSED: one probe before the first run of this file (tmp/wall92-probe, 5 s): the default start, case C only,
// with its controls. It read E = 3,024 docks, departing 3,024 at every window (the 432 strict defects plus the ends of
// the 2,592 ideal wall edges the run no longer shows, all in E), and the C controls informative. After it, and before
// the first run, the core DESCRIPTION (not a gate) was narrowed from every departing dock of E to the docks of E with
// D(x) not in S(x), because the rest hold their own ground state and have nothing to describe. No gate was moved.
//
// FIRST RUN (174 s, tmp/wall92-exp-first.log): partial, BY THE INSTRUMENT. A and R held (the strict reading equals
// E-RLT-0090's record on every case and start). K FAILED on one clause of one case: on r0 the growing control (half
// of E, then all of E) read grew 0 and passed, because on r0 every dock of E is the end of an ideal wall edge to some
// dock of the half core, so the half core already departs on all of E; every other K clause held on all six cases.
// B' and C: C, g, gC and 2r0 on 17 of 17 starts, time and r0 on 0 of 17, exactly as predicted.
// GATE MOVED AFTER THE FIRST RUN (disclosed): the gated growth control became "a core that grows from nothing" (the
// clean ideal, then the full core), which cannot be defeated by the geometry of E; the half-E version is kept and
// reported, not gated. Nothing else changed. The second run's status is the record; the first run's is stated here.
// SECOND RUN (200 s, tmp/wall92-exp-second.log): partial, as predicted, on the result: A, R and K hold (growth from
// nothing grew 5,616, 3,024, 1,620, 1,836, 6,912 and 2,052 docks; on r0 the half core departs 6,912 = all of E,
// confirming the first run's reason); every B', C and core number identical to the first run. Title written after it.
//
// Depth L2. DETERMINISM: fixed starts (E-MTH-0028's family), fixed slabs, planted defects at the first dock in index
// order meeting each condition, exact trit comparisons, no draw.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { coinData } from '@/code/measure/varying-vacuum'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { startFamily } from '@/code/measure/start-ensemble'
import { cell4 } from '@/code/measure/coset-walls'
import { CASES, LATTICE_KEEPING, SIDE, readMember, type CaseName, type CoreReading, type MemberReading } from '@/code/measure/wall-core'

// E-RLT-0090's record of the strict departure docks over its 17 starts (min over starts and windows, max likewise)
const RECORD: Record<CaseName, [number, number]> = {
  time: [16847, 16848],
  C: [432, 432],
  g: [432, 432],
  gC: [432, 432],
  r0: [20567, 20647],
  '2r0': [432, 432],
}

const max = (xs: readonly number[]): number => (xs.length === 0 ? 0 : Math.max(...xs))
const min = (xs: readonly number[]): number => (xs.length === 0 ? 0 : Math.min(...xs))
const range = (xs: readonly number[]): string => (xs.length === 0 ? 'none' : `${min(xs)}..${max(xs)}`)
const primePasses = (c: CoreReading): boolean => c.outside.every(v => v === 0) && c.grew.every(v => v === 0)
const cPasses = (c: CoreReading): boolean => c.bulkDeparture.every(v => v === 0)

export default experiment({
  id: 'relativity/wall-core',
  code: 'E-RLT-0092',
  title:
    "walls with a one-dock core, the restated wall gate B' (departure only on the ideal wall's end docks, never growing; chosen after E-RLT-0090's numbers, disclosed), partial as predicted: the controls separate on all six cases (a one-dock core passes; a defect one dock away, a deep defect, a two-dock core and a growing core fail) and the strict reading reproduces E-RLT-0090 exactly; the four cosets that keep the hub lattice (C, g, gC, 2 r0) pass B' and C on 17 of 17 starts, 0 of 20,736 docks and 0 of 1,728 husk columns departing outside the end docks, a frozen core of 432 docks (216 per side, 72 columns, the same at every window and start) whose every trit is one side's value (0 novel), stores all its own, vibes a splice of both sides; the time coset (the old half-late wall) and r0 fail on 0 of 17 (11,250 to 11,344 and 13,732 to 13,778 docks outside, on about 1,000 and 1,152 columns): they melt, B' cannot rescue them",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const coins = coinData(groupTable())
    const cell = cell4(coins)
    const members = startFamily(16)
    const results: MemberReading[] = []

    for (const member of members) results.push(readMember(coins, cell, member, member.name === 'integer+0'))

    const def = results[0] as MemberReading
    const controls = def.controls as NonNullable<MemberReading['controls']>
    const gateA = results.every(r => max(r.alone.departing) === 0 && max(r.alone.strictDocks) === 0 && r.alone.windows === 20)
    const strictMin = (n: CaseName): number => min(results.map(r => min(r.cases[n].strictDocks)))
    const strictMax = (n: CaseName): number => max(results.map(r => max(r.cases[n].strictDocks)))
    const gateR = results.every(r => r.stepErrors === 0) && CASES.every(n => strictMin(n) === RECORD[n][0] && strictMax(n) === RECORD[n][1])
    const gateK = CASES.every(n => controls[n].informative)
    const primeOn = (n: CaseName): number => results.filter(r => primePasses(r.cases[n])).length
    const cOn = (n: CaseName): number => results.filter(r => cPasses(r.cases[n])).length
    const allSix = CASES.every(n => primeOn(n) === results.length && cOn(n) === results.length)
    const fourHold = LATTICE_KEEPING.every(n => primeOn(n) === results.length && cOn(n) === results.length)
    const status = !(gateA && gateR && gateK) ? 'partial' : allSix ? 'pass' : fourHold ? 'partial' : 'fail'
    const metrics: Record<string, number> = {
      gateA: gateA ? 1 : 0,
      gateR: gateR ? 1 : 0,
      gateK: gateK ? 1 : 0,
      gatePrimeAllSix: allSix ? 1 : 0,
      gatePrimeLatticeKeeping: fourHold ? 1 : 0,
      starts: results.length,
      groundStates: def.states,
      pointCosets: def.reps,
      vacuumPeriod: def.periodV,
      lateIsTwoAhead: results.every(r => r.lateIsAhead2) ? 1 : 0,
      huskColumns: def.columns,
      docks: SIDE ** 4,
      stepErrorsMax: max(results.map(r => r.stepErrors)),
      startsWithOtherLinks: results.slice(1).filter(r => r.links.some((v, i) => v !== def.links[i])).length,
    }

    for (const n of CASES) {
      const c = def.cases[n]
      const k = controls[n]
      const over = (f: (c: CoreReading) => number): number[] => results.map(r => f(r.cases[n]))

      metrics[`${n}_startsPrime`] = primeOn(n)
      metrics[`${n}_startsC`] = cOn(n)
      metrics[`${n}_idealWalls`] = c.idealWalls
      metrics[`${n}_endDocks`] = c.endDocks
      metrics[`${n}_endColumns`] = c.endColumns
      metrics[`${n}_outsideColumnsMax`] = max(over(x => max(x.outsideColumns)))
      metrics[`${n}_outsideColumnsMin`] = min(over(x => min(x.outsideColumns)))
      metrics[`${n}_outsideDocksMax`] = max(over(x => max(x.outside)))
      metrics[`${n}_outsideDocksMin`] = min(over(x => min(x.outside)))
      metrics[`${n}_departingMax`] = max(over(x => max(x.departing)))
      metrics[`${n}_departingMin`] = min(over(x => min(x.departing)))
      metrics[`${n}_grewMax`] = max(over(x => max(x.grew)))
      metrics[`${n}_departingColumnsOutsideEndMax`] = max(over(x => max(x.departingColumnsOutsideEnd)))
      metrics[`${n}_strictMin`] = strictMin(n)
      metrics[`${n}_strictMax`] = strictMax(n)
      metrics[`${n}_bulkDepartureMax`] = max(over(x => max(x.bulkDeparture)))
      metrics[`${n}_bulkDocks`] = c.bulkDocks
      metrics[`${n}_coreDocks`] = c.core.docks
      metrics[`${n}_coreColumns`] = c.core.columns
      metrics[`${n}_coreColumnMax`] = c.core.columnMax
      metrics[`${n}_coreQuiet`] = c.core.quiet
      metrics[`${n}_coreNovel`] = c.core.novel
      metrics[`${n}_coreOwn`] = c.core.own
      metrics[`${n}_coreOther`] = c.core.other
      metrics[`${n}_coreNeither`] = c.core.neither
      metrics[`${n}_coreTrits`] = c.core.trits
      metrics[`${n}_coreStoreEqualsOwn`] = c.core.storeEqualsOwn
      metrics[`${n}_coreVibeEqualsOwn`] = c.core.vibeEqualsOwn
      metrics[`${n}_coreVibeEqualsOther`] = c.core.vibeEqualsOther
      metrics[`${n}_coreSilent`] = c.core.silent
      metrics[`${n}_coreHistories`] = c.core.histories
      metrics[`${n}_coreChanged`] = c.core.changed
      metrics[`${n}_edgeOnly`] = c.core.edgeOnly
      metrics[`${n}_edgeOnlyExact`] = c.core.edgeOnlyExact
      metrics[`${n}_coreFingerprints`] = new Set(results.map(r => JSON.stringify(r.cases[n].core))).size
      metrics[`${n}_K_informative`] = k.informative ? 1 : 0
      metrics[`${n}_K_oneAwayOutside`] = max(k.oneAway.outside)
      metrics[`${n}_K_deepOutside`] = max(k.deep.outside)
      metrics[`${n}_K_deepDistance`] = k.deepDistance
      metrics[`${n}_K_thickOutside`] = max(k.thick.outside)
      metrics[`${n}_K_growingGrew`] = max(k.growing.grew)
      metrics[`${n}_K_growingHalfDeparting`] = k.growing.departing[0] ?? 0
      metrics[`${n}_K_growingFromCleanGrew`] = max(k.growingFromClean.grew)
      metrics[`${n}_K_fullCoreDeparting`] = max(k.fullCore.departing)
    }

    metrics.seconds = (Date.now() - started) / 1000

    const coreText = (n: CaseName, c: CoreReading): string => {
      const k = c.core

      return `${n}: ideal ${c.idealWalls} wall edges, E ${c.endDocks} docks on ${c.endColumns} of ${def.columns} columns; departing ${range(c.departing)} docks, OUTSIDE E ${range(c.outsideColumns)} columns of ${def.columns} (husk) and ${range(c.outside)} docks of ${SIDE ** 4} (bulk), grew ${range(c.grew)}, shrank ${range(c.shrank)}; strict ${range(c.strictDocks)}, C bulk ${range(c.bulkDeparture)} of ${c.bulkDocks}; departing docks of E holding their own ground state ${k.edgeOnly} (${k.edgeOnlyExact} equal to it trit for trit); core ${k.docks} docks (${k.inside} inside, ${k.outside} outside) on ${k.columns} columns, at most ${k.columnMax} per column; core trits ${k.trits}: quiet ${k.quiet}, novel ${k.novel}, own ${k.own}, other ${k.other}, neither ${k.neither}; per dock differs from own ${k.ownDiffMin}..${k.ownDiffMax} and from other ${k.otherDiffMin}..${k.otherDiffMax} of 216 (vibes ${k.vibeOwnDiff} and stores ${k.storeOwnDiff} from own, vibes ${k.vibeOtherDiff} and stores ${k.storeOtherDiff} from other); stores equal own on ${k.storeEqualsOwn}, vibes equal own on ${k.vibeEqualsOwn} and other on ${k.vibeEqualsOther}; silent ${k.silent}; ${k.histories} distinct core histories; changed first to last window ${k.changed}`
    }
    const controlText = CASES.map(n => {
      const k = controls[n]

      return `${n}: E ${k.endDocks}; clean ${k.clean.passes ? 'passes' : 'FAILS'}, full core ${k.fullCore.passes ? 'passes' : 'FAILS'} (${max(k.fullCore.departing)} departing), one away ${k.oneAway.passes ? 'PASSES' : 'fails'} (${max(k.oneAway.outside)} outside), deep at distance ${k.deepDistance} ${k.deep.passes ? 'PASSES' : 'fails'} (${max(k.deep.outside)}), two thick ${k.thick.passes ? 'PASSES' : 'fails'} (${max(k.thick.outside)} outside of ${k.thickExtra} added), growing from nothing ${k.growingFromClean.passes ? 'PASSES' : 'fails'} (grew ${max(k.growingFromClean.grew)}), growing from half of E (reported since the second run) ${k.growing.passes ? 'passes' : 'fails'} (departing ${k.growing.departing.join(' then ')}, grew ${max(k.growing.grew)}), shrinking ${k.shrinking.passes ? 'passes' : 'FAILS'}, unplantable ${k.unplantable}`
    }).join('; ')

    return verdict({
      status,
      claim: `B' (departure only on the ideal wall's end docks, no growth), chosen after E-RLT-0090's numbers: ${CASES.map(n => `${n} ${primeOn(n)}/${results.length}`).join(', ')} starts pass B'; C ${CASES.map(n => `${n} ${cOn(n)}/${results.length}`).join(', ')}; controls ${gateK ? 'separate' : 'do not separate'}`,
      metrics,
      notes: `L2. Gates: A ${gateA}, R ${gateR}, K ${gateK}, B' and C on all six ${allSix}, on the four lattice-keeping cosets ${fourHold}. Per start (ground states, period, step errors): ${results.map(r => `${r.name} ${r.states}/${r.periodV}/${r.stepErrors}`).join(', ')}. Controls (default start): ${controlText}. Default start, side ${SIDE}: ${CASES.map(n => coreText(n, def.cases[n])).join('. ')}. Over the starts, outside-E docks per case (min..max): ${CASES.map(n => `${n} ${metrics[`${n}_outsideDocksMin`]}..${metrics[`${n}_outsideDocksMax`]}`).join(', ')}; distinct core descriptions per case: ${CASES.map(n => `${n} ${metrics[`${n}_coreFingerprints`]}`).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
