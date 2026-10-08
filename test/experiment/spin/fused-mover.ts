// DO SINGLES AT ONE DOCK FUSE INTO A MOVER ALONG A NEW LINE (X-CUBE FUSION)? note/project/vibe/roadmap/research/remaining-pieces.md,
// "Six angles on 3d motion", angle 2. In the X-cube model a lineon along x and one along y fuse into one that moves
// along z, because their creation operators compose. The mesh's 12 line classes are the D4 roots up to sign, and roots
// add to roots, so a set of singles at one dock X on lines a and b might act, under the bounce K = w_P, like one
// excitation on the line of a + b (or another line) and translate along a line none of them started on. The idea
// adds nothing to the rule. E-SPN-0119's star theorem already confines any such composite's difference from the
// vacuum to the twelve lines through X, but a line through X is one of them, so the star alone does not forbid a
// mover along a NEW line through X. This experiment asks whether one exists.
//
// DERIVED BEFORE THE RUN.
// 1. A TRANSLATION NEEDS ONE LINE. If the difference D_t2 = D_t1 + v with v != 0, both lie on the star of X (E-SPN-0119).
//    A reading on a line of class l at dock y moves to the class-l line through y + v, which is a line of the star only
//    if v is along r_l (the star holds one line per class). So every reading of D lies on lines of one class, hence on
//    ONE line C through X, and v is along C. The star premise is then met: C passes through the hub. So the question
//    is whether D ever collapses onto one line.
// 2. K MAPS SINGLE LINES TO SINGLE LINES, ONE TO ONE. K = w_P is a linear isometry of the roots, so w(-r) = -w(r): it
//    carries a line's two slots onto one line, a single line onto a single line and a full line onto a full line, and
//    two distinct lines onto two distinct lines. So a firing never fuses two singles onto one line, and with two
//    singles it never puts one on the line of a + b (the images are roots summing to P = a + b, and if one were P the
//    other would be 0). With three it can (a single lands on the line of the sum of two firing roots), but one vibe
//    goes there, not the composite. `fusionCensus` reads all of this dock by dock.
// 3. THE DIFFERENCE NEVER COLLAPSES (the theorem). Every piece but K acts line by line, and off X (and at X when K
//    does not fire) it is the same bijection of a line's state in the run as in the vacuum (the key reads only beat,
//    dock and line; E-SPN-0119). So a line that differs from the vacuum at one moment differs at every later moment
//    until K fires. K fires only with two or more singles at X, and right after it (or at the start) two or more lines
//    through X each hold a single, which the vacuum never holds (condition Z). Take any beat t and the last firing
//    before it (or the start): the two or more single lines it left still differ at t. So EVERY beat has at least two
//    differing lines, and by 1 no translation exists, at any period, for any path, with or without the vacuum, for any
//    number of singles. Every keyed path obeys it, so every term of the superposed rule does, and no amplitude
//    translates either. With no vacuum the same argument reads: the composite always occupies at least two classes.
// PREDICTED: 0 fused movers and 0 translations of any kind in every search, the minimum number of differing lines 2,
// the planted mover found.
//
// GATES, fixed before the first run.
//  G1 the stand-in (no vacuum, `hubSearch`): over all 264 pairs of loves at X (every coin history of 24 beats) and all
//     1,760 triples (every history of 8 beats), 0 translations (a reached state S and a reached S + v, v != 0, with a
//     history between them, fused or not) and 0 reached states on one line class; and for every start the line-class
//     closure at every depth (`lineClosure`) holds 0 one-class nodes.
//  G2 the rule with its vacuum (`vacuumFusionRun`): over all 2,024 starts (the 264 pairs and 1,760 triples placed on
//     the vacuum at X) on 4 paths of 'pass' and 2 of 'lone' at side 4 (64 beats) and path 0 of 'pass' at side 8 (32
//     beats), 0 translation events of the difference (fused or not), 0 readings off the star, and at least 2 differing
//     mesh lines at every beat of every run.
//  G3 the dock census: over 270,336 two-single and 901,120 three-single docks (every set of full lines), K is
//     line-preserving and keeps the number of single lines on every firing dock, and fuses two singles onto one line
//     on 0 docks.
// CONTROLS (a failed control or check makes the verdict partial).
//  CP a planted mover: a modified contact that sends singles on (1,1,0,0) and (1,-1,0,0) (alone on their dock) to the
//     two slots of the line of (1,0,1,0). `hubSearch` must find at least one fused translation along that new line, with
//     a history between the translates, `lineClosure` must reach a one-class node on a class the start does not hold,
//     and `fusionCensus` with it must count at least one fused dock. So each of G1 and G3 can fail.
//  CT the rule's detector sees a translation: a lone love in the bare rule (no vacuum) at side 4, 64 beats, 'pass'
//     path 0, on slots 0, 5 and 11, gives at least one translation event of its difference, and 0 fused ones (its line
//     is its start's). So G2's reading can fail.
//  CL a lone love on the vacuum stays on its line: on the same three slots its difference is on 1 mesh line at every
//     beat and never on another.
//  CV the vacuum's own runs fire K 0 times on every path, side and contact used.
// CHECKS: the stepper (hub-star's starBeat) equals keyedRunner bit for bit on 8 starts; fusionCensus(2) fires on as
// many docks as E-SPN-0119's recruitCensus(2) (a second method on the same domain); every line-class set the
// stand-in search reaches lies in the closure; the vacuum's box has 0 star crossings at both sides.
// Verdict: partial if a check or control fails; pass if G1, G2 and G3 hold (no fused mover, by census and theorem);
// fail otherwise (a mover exists, and the F1 to F3 experiment of angle 2 is then owed).
// PROBES, disclosed (instrument only): tmp/fuse-probe-hub.log and -hub16.log (one pair and one triple at 6 and 16
// beats: 0 translations, fewest classes 2 and 3; the planted table finds fused translations along (1,0,1,0) with
// period 3 steps), tmp/fuse-probe-census.log (the dock census, 0 fused), tmp/fuse-probe-vac.log (40 starts at side 4,
// 32 beats: 0 translations, fewest lines 2; a bare lone love gives 6 to 43 translations, 0 fused). They set the beat
// horizons for speed only; no gate was set from them.
//
// FIRST RUN (tmp/fuse-exp-run1.log, 435 s): PASS, as predicted. The dock census: K fires on 172,032 of 270,336
// two-single docks (E-SPN-0119's number, a second method) and 507,904 of 901,120 three-single docks, with 0 split
// lines, 0 changes of the single-line count and 0 fusions. The X-cube channel is real for ONE vibe: with three singles
// a single lands on the line of the sum of two firing roots on 360,448 docks (and on a line no single held on
// 294,912), with two singles on 0 (as derived). The stand-in: 27,250,464 states over 2,024 starts, 0 translations,
// fewest classes 2; the closure holds 4,328 nodes (1,536 starts reach a line set other than their own), 0 on one
// class, and contains every set the search reached. The rule with its vacuum: 14,168 runs, K fired 267,280 times,
// all at X, 0 readings off the star, 0 translations (1,739 recurrences, v = 0), fewest differing lines 2 and most 12.
// Controls: the planted table gives 1,484 fused translations along the line of (1,0,1,0), step one root per 3 beats
// on the fewest-beats pair, its closure reaches the one-class node and its census counts 1 fused dock; a bare lone
// love gives 262 translations, 0 fused; a lone love on the vacuum differs on exactly its own line at every beat; the
// vacuum fires K 0 times; the stepper equals keyedRunner bit for bit. Title written after the run.
//
// Depth L1: an exact theorem on the committed rule and table, with exhaustive censuses bounded as stated and a planted
// mover showing the search can find one. DETERMINISM: no random numbers; the key is integer arithmetic on (beat, dock,
// line), and every start is placed. NOTHING MOVES: every piece hands a value to a slot, and the stream takes it one
// dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import {
  cloneConfiguration,
  type Configuration,
} from '@/code/rule/doublet-locked-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { LINE_OF } from '@/code/rule/isometric-knit'
import {
  fullPathKey,
  keyedRunner,
  meshLines,
  pathOffset,
} from '@/code/measure/full-key-paths'
import {
  placeLoves,
  recruitCensus,
  starBeat,
  starCrossings,
  starLines,
  type KEvent,
} from '@/code/measure/hub-star'
import {
  boxCoordinates,
  committedContact,
  fusionCensus,
  hubSearch,
  lineClosure,
  plantedContact,
  singleSets,
  slotOfRoot,
  vacuumFusionRun,
  vacuumPath,
  type FusionRun,
} from '@/code/measure/fused-mover'

const PAIR_BEATS = 24
const TRIPLE_BEATS = 8
const PLANTED_BEATS = 8
const RULE_RUNS: {
  side: number
  contact: CollisionKind
  path: number
  beats: number
}[] = [
  ...[0, 1, 2, 3].map(path => ({
    side: 4,
    contact: 'pass' as CollisionKind,
    path,
    beats: 64,
  })),
  ...[0, 1].map(path => ({
    side: 4,
    contact: 'lone' as CollisionKind,
    path,
    beats: 64,
  })),
  { side: 8, contact: 'pass', path: 0, beats: 32 },
]
const LOVE_SLOTS = [0, 5, 11]
const LOVE_BEATS = 64
const STEPPER_STARTS = 4
const STEPPER_BEATS = 32
const PLANT_A = [1, 1, 0, 0]
const PLANT_B = [1, -1, 0, 0]
const PLANT_C = [1, 0, 1, 0]

export default experiment({
  id: 'spin/fused-mover',
  code: 'E-SPN-0125',
  title:
    'singles at one dock never fuse into a mover along a new line, pass at L1 (G1, G2, G3; X-cube fusion, angle 2 of 3d motion): K = w_P is line-preserving and keeps the single-line count on all 679,936 firing docks of two and three singles with any vacuum full lines (0 fusions; with three singles one vibe lands on the line of a + b on 360,448 docks, with two on 0), and every other piece acts line by line as in the vacuum, so the difference from the vacuum holds at least two lines through the hub at every beat, while a translation needs it on one line: no fused mover exists at any period; exhaustively, 0 translations over all 264 pairs and 1,760 triples of loves at X in a vacuum-free stand-in (every coin history, 24 and 8 beats, 27,250,464 states, fewest line classes 2, and 0 one-class nodes in the line-class closure at every depth) and 0 over 14,168 runs of the working knit with its vacuum (6 paths at side 4, 64 beats, and side 8, 32 beats; fewest differing lines 2, 0 readings off the star); a planted table that sends (1,1,0,0) and (1,-1,0,0) onto the line of (1,0,1,0) gives 1,484 fused translations, a bare lone love 262 translations on its own line, and a lone love on the vacuum stays on its line',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const pass = committedContact('pass')
    const pairs = singleSets(2)
    const triples = singleSets(3)
    const starts = [...pairs, ...triples]

    // ---- G3: the dock census ----
    const census2 = fusionCensus(2, pass)
    const census3 = fusionCensus(3, pass)
    const G3 = [census2, census3].every(
      c =>
        c.splitLines === 0 &&
        c.singleCountChanged === 0 &&
        c.fused === 0,
    )
    const reference = recruitCensus(2, 'pass')

    log('census')

    // ---- G1: the stand-in search ----
    let g1Translations = 0
    let g1Fused = 0
    let g1OneClass = 0
    let g1MinClasses = 12
    let g1States = 0
    let closureOneClass = 0
    let closureMin = 12
    let closureNodes = 0
    let closureMisses = 0
    let lineChangingStarts = 0

    for (const s of starts) {
      const h = hubSearch(
        s,
        pass,
        s.length === 2 ? PAIR_BEATS : TRIPLE_BEATS,
      )
      const c = lineClosure(s, pass)

      g1Translations += h.translations
      g1Fused += h.fused
      g1OneClass += h.oneClass
      g1MinClasses = Math.min(g1MinClasses, h.minClasses)
      g1States += h.states
      closureOneClass += c.oneClass
      closureMin = Math.min(closureMin, c.minClasses)
      closureNodes += c.nodes.size

      if (c.nodes.size > 1) {
        lineChangingStarts++
      }

      for (const k of h.classSets) {
        if (!c.nodes.has(k)) {
          closureMisses++
        }
      }
    }

    const G1 =
      g1Translations === 0 &&
      g1Fused === 0 &&
      g1OneClass === 0 &&
      closureOneClass === 0

    log('stand-in')

    // ---- CP: the planted mover ----
    const a = slotOfRoot(PLANT_A)
    const b = slotOfRoot(PLANT_B)
    const c = slotOfRoot(PLANT_C)
    const planted = plantedContact(pass, a, b, c)
    const plantedSearch = hubSearch([a, b], planted, PLANTED_BEATS)
    const plantedClosure = lineClosure([a, b], planted)
    const plantedCensus = fusionCensus(2, planted)
    const plantedClass = LINE_OF[c]!
    const CP =
      plantedSearch.fused > 0 &&
      plantedSearch.example?.l === plantedClass &&
      plantedClosure.newClassOnly > 0 &&
      plantedCensus.fused > 0

    log('planted')

    // ---- G2: the rule with its vacuum ----
    type Setup = {
      side: number
      contact: CollisionKind
      X: number
      tables: ReturnType<typeof contactFresh>['tables']
      lines: ReturnType<typeof meshLines>
      vacuum: Configuration
      coords: number[][]
      crossings: number
    }

    const setups = new Map<string, Setup>()

    const setupOf = (side: number, contact: CollisionKind): Setup => {
      const k = `${side}/${contact}`
      const have = setups.get(k)

      if (have) {
        return have
      }

      const X = centerOf(side)
      const f = contactFresh(side, contact, X)
      const lines = meshLines(f.tables)
      const made: Setup = {
        side,
        contact,
        X,
        tables: f.tables,
        lines,
        vacuum: wordVacuum(f, f.store),
        coords: boxCoordinates(f.cells, side),
        crossings: starCrossings(
          f.cells,
          lines,
          starLines(lines, [X]),
          [X],
        ).length,
      }

      setups.set(k, made)

      return made
    }

    let g2Runs = 0
    let g2Translations = 0
    let g2Fused = 0
    let g2OffStar = 0
    let g2OffHub = 0
    let g2Events = 0
    let g2Recurrences = 0
    let g2MinLines = Number.POSITIVE_INFINITY
    let g2MaxLines = 0
    let vacuumEvents = 0

    const perRun: string[] = []

    for (const r of RULE_RUNS) {
      const s = setupOf(r.side, r.contact)
      const key = fullPathKey(pathOffset(r.path))
      const vp = vacuumPath(
        s.tables,
        s.vacuum,
        key,
        THRESHOLD_BORN,
        r.beats,
      )

      let min = Number.POSITIVE_INFINITY
      let translations = 0
      let events = 0

      vacuumEvents += vp.events

      for (const slots of starts) {
        const start = placeLoves(
          s.vacuum,
          slots.map(slot => ({ dock: s.X, slot })),
        )
        const startLines = new Set(
          slots.map(slot => s.lines.lineOf[s.X * 24 + slot]!),
        )
        const run: FusionRun = vacuumFusionRun({
          tables: s.tables,
          path: vp.path,
          start,
          lines: s.lines,
          hub: s.X,
          key,
          threshold: THRESHOLD_BORN,
          side: s.side,
          coords: s.coords,
          startLines,
        })

        g2Runs++
        g2Translations += run.translations
        g2Fused += run.fused
        g2OffStar += run.offStar
        g2OffHub += run.offHub
        g2Events += run.events
        g2Recurrences += run.recurrences
        g2MaxLines = Math.max(g2MaxLines, run.maxLines)
        min = Math.min(min, run.minLines)
        translations += run.translations
        events += run.events
      }

      g2MinLines = Math.min(g2MinLines, min)
      perRun.push(
        `${r.contact}/s${r.side}/p${r.path}/${r.beats}b: K ${events}, min lines ${min}, translations ${translations}`,
      )
      log(`rule ${r.contact} s${r.side} p${r.path}`)
    }

    const G2 =
      g2Translations === 0 &&
      g2Fused === 0 &&
      g2OffStar === 0 &&
      g2MinLines >= 2

    // ---- CT and CL: a lone love, bare and on the vacuum ----
    const s4 = setupOf(4, 'pass')
    const key0 = fullPathKey(0)
    const empty: Configuration = {
      ...s4.vacuum,
      vibe: new Int8Array(s4.vacuum.vibe.length),
      store: new Int8Array(s4.vacuum.store.length),
      sopen: new Uint8Array(s4.vacuum.sopen.length),
    }
    const emptyPath = vacuumPath(
      s4.tables,
      empty,
      key0,
      THRESHOLD_BORN,
      LOVE_BEATS,
    )
    const vacPath = vacuumPath(
      s4.tables,
      s4.vacuum,
      key0,
      THRESHOLD_BORN,
      LOVE_BEATS,
    )
    const loves = LOVE_SLOTS.map(slot => {
      const startLines = new Set([s4.lines.lineOf[s4.X * 24 + slot]!])
      const bare = vacuumFusionRun({
        tables: s4.tables,
        path: emptyPath.path,
        start: placeLoves(empty, [{ dock: s4.X, slot }]),
        lines: s4.lines,
        hub: s4.X,
        key: key0,
        threshold: THRESHOLD_BORN,
        side: 4,
        coords: s4.coords,
        startLines,
      })
      const onVacuum = vacuumFusionRun({
        tables: s4.tables,
        path: vacPath.path,
        start: placeLoves(s4.vacuum, [{ dock: s4.X, slot }]),
        lines: s4.lines,
        hub: s4.X,
        key: key0,
        threshold: THRESHOLD_BORN,
        side: 4,
        coords: s4.coords,
        startLines,
      })

      return { slot, bare, onVacuum }
    })
    const CT =
      loves.reduce((n, l) => n + l.bare.translations, 0) > 0 &&
      loves.every(l => l.bare.fused === 0)
    const CL = loves.every(
      l =>
        l.onVacuum.minLines === 1 &&
        l.onVacuum.maxLines === 1 &&
        l.onVacuum.offStart === 0,
    )
    const CV =
      vacuumEvents === 0 &&
      vacPath.events === 0 &&
      emptyPath.events === 0

    log('love')

    // ---- checks ----
    let stepperDiffer = 0

    const stepperStarts = [
      ...pairs.slice(0, STEPPER_STARTS),
      ...triples.slice(0, STEPPER_STARTS),
    ]

    for (const slots of stepperStarts) {
      const start = placeLoves(
        s4.vacuum,
        slots.map(slot => ({ dock: s4.X, slot })),
      )

      let p = cloneConfiguration(start)
      let q = cloneConfiguration(start)

      const check = keyedRunner(s4.tables, start, {
        key: key0,
        threshold: THRESHOLD_BORN,
      })
      const events: KEvent[] = []

      for (let t = 0; t < STEPPER_BEATS; t++) {
        starBeat(s4.tables, p, q, key0, THRESHOLD_BORN, t, events)
        ;[p, q] = [q, p]
        check.beat()

        const x = check.state()

        for (let i = 0; i < p.vibe.length; i++) {
          if (
            p.vibe[i] !== x.vibe[i] ||
            p.point[i] !== x.point[i] ||
            p.open[i] !== x.open[i]
          ) {
            stepperDiffer++
          }
        }

        for (let k = 0; k < p.store.length; k++) {
          if (
            p.store[k] !== x.store[k] ||
            p.spoint[k] !== x.spoint[k] ||
            p.sopen[k] !== x.sopen[k]
          ) {
            stepperDiffer++
          }
        }
      }
    }

    const crossings = [...setups.values()].reduce(
      (n, s) => n + s.crossings,
      0,
    )
    const checks = {
      stepper: stepperDiffer === 0,
      census:
        census2.fires === reference.fires &&
        census2.docks === reference.docks,
      closure: closureMisses === 0,
      crossings: crossings === 0,
    }
    const checked = Object.values(checks).every(Boolean)
    const controlled = CP && CT && CL && CV
    const status =
      !checked || !controlled
        ? 'partial'
        : G1 && G2 && G3
          ? 'pass'
          : 'fail'

    const metrics: Record<string, number> = {
      G1: G1 ? 1 : 0,
      G2: G2 ? 1 : 0,
      G3: G3 ? 1 : 0,
      control_CP: CP ? 1 : 0,
      control_CT: CT ? 1 : 0,
      control_CL: CL ? 1 : 0,
      control_CV: CV ? 1 : 0,
      starts: starts.length,
      census2Docks: census2.docks,
      census2Fires: census2.fires,
      census2SumPairs: census2.sumPairs,
      census2SumLanded: census2.sumLanded,
      census2SingleNewLine: census2.singleNewLine,
      census3Docks: census3.docks,
      census3Fires: census3.fires,
      census3SumPairs: census3.sumPairs,
      census3SumLanded: census3.sumLanded,
      census3SingleNewLine: census3.singleNewLine,
      censusSplitLines: census2.splitLines + census3.splitLines,
      censusCountChanged:
        census2.singleCountChanged + census3.singleCountChanged,
      censusFused: census2.fused + census3.fused,
      standInStates: g1States,
      standInTranslations: g1Translations,
      standInFused: g1Fused,
      standInOneClass: g1OneClass,
      standInMinClasses: g1MinClasses,
      closureNodes,
      closureOneClass,
      closureMinClasses: closureMin,
      closureMisses,
      lineChangingStarts,
      plantedStates: plantedSearch.states,
      plantedTranslations: plantedSearch.translations,
      plantedFused: plantedSearch.fused,
      plantedPeriod: plantedSearch.example?.period ?? -1,
      plantedClosureNewClassOnly: plantedClosure.newClassOnly,
      plantedCensusFused: plantedCensus.fused,
      ruleRuns: g2Runs,
      ruleTranslations: g2Translations,
      ruleFused: g2Fused,
      ruleRecurrences: g2Recurrences,
      ruleOffStar: g2OffStar,
      ruleEvents: g2Events,
      ruleOffHub: g2OffHub,
      ruleMinLines: g2MinLines,
      ruleMaxLines: g2MaxLines,
      vacuumEvents,
      loveBareTranslations: loves.reduce(
        (n, l) => n + l.bare.translations,
        0,
      ),
      loveBareFused: loves.reduce((n, l) => n + l.bare.fused, 0),
      loveVacuumOffStart: loves.reduce(
        (n, l) => n + l.onVacuum.offStart,
        0,
      ),
      stepperDiffer,
      starCrossings: crossings,
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `singles at one dock never fuse into a mover along a new line: K is line-preserving and keeps the single-line count on all ${census2.fires + census3.fires} firing docks (${census2.fused + census3.fused} fused), so the difference from the vacuum holds at least 2 lines at every beat; the stand-in finds ${g1Translations} translations over ${starts.length} starts (every coin history, ${PAIR_BEATS} and ${TRIPLE_BEATS} beats; fewest classes ${g1MinClasses}), the rule with its vacuum ${g2Translations} over ${g2Runs} runs (fewest differing lines ${g2MinLines}, ${g2OffStar} off the star); a planted fusing table gives ${plantedSearch.fused} fused translations`,
      metrics,
      control: {
        plantedFused: plantedSearch.fused,
        loveBareTranslations: metrics.loveBareTranslations!,
        vacuumEvents,
      },
      notes: `L1. G1 ${G1}, G2 ${G2}, G3 ${G3}; CP ${CP}, CT ${CT}, CL ${CL}, CV ${CV}; checks ${JSON.stringify(checks)}. Census 2: ${JSON.stringify(census2)}; 3: ${JSON.stringify(census3)}; recruitCensus(2) fires ${reference.fires} of ${reference.docks}. Stand-in: ${g1States} states, closure ${closureNodes} nodes (${lineChangingStarts} starts reach more than their own line set). Planted: ${JSON.stringify({ ...plantedSearch, classSets: plantedSearch.classSets.size })}, closure one-class new ${plantedClosure.newClassOnly}, census fused ${plantedCensus.fused}. Rule: ${perRun.join('; ')}. Loves: ${loves.map(l => `slot ${l.slot} bare ${l.bare.translations} translations (fused ${l.bare.fused}), vacuum lines ${l.onVacuum.minLines}-${l.onVacuum.maxLines} off-start ${l.onVacuum.offStart}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
