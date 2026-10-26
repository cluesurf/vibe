// BELL VIOLATION AGAINST DISTANCE ON THE RULE (E-QTM-0188, OPEN-QTM-20). The open row: an argued power-law falloff of
// the Bell violation beyond a crossover distance, exponent "about 1.38" (v1.2.0 falsifiable-predictions.md), where
// quantum mechanics predicts none for an isolated pair.
//
// WHAT THE ARGUED FALLOFF RESTS ON (E-QTM-0042, E-QTM-0034, code/measure/cusp-distance). Not decoherence by the vacuum,
// and not any dynamics of an entangled pair. It is a geometric bound: on a Bethe tree (the hyperbolic bulk) the two
// measuring sites' past cones share a fraction eta of their ancestors, eta falls as a power law in the leaf-index gap
// (each doubling of the boundary gap adds about two generations to the common ancestor), and Hall's measurement-
// dependence budget S <= 2 + 2 eta, capped at 2 sqrt 2, turns eta into a ceiling on S for a model whose correlations
// come from correlated settings. The exponent is a property of the tree and of the two chosen metrics. E-QTM-0042 as it
// runs today fits 1.056 (r2 0.977), not 1.38. No entangled state is evolved in that argument.
//
// THE TEST POSED HERE, which could fail. The rule does make entangled pairs: a like meeting of two open vibes with
// unequal points leaves a knot (E-RLT-0105, sqrt 7 at its first meeting, up to 2.8284 after re-meetings, E-QTM-0163).
// Between meetings the two vibes move apart along their line, one dock a beat each, and each meets the working
// vacuum's store on its own (every third beat both are taken into a store and come back out). If the vacuum read or
// scrambled the points it meets, the knot would lose its violation as the parts separate, and the loss would grow with
// the number of contacts and so with distance: the falloff the row argues for, made by the rule. If the vacuum keeps
// the points, the knot keeps its value at every distance, as quantum mechanics says of an isolated pair.
//
// METHOD. Boxes of side 4, 8, 16, 32 (the pair's next meeting comes 3 side / 4 beats after its first, so the window
// and the largest separation grow with the side). Per side, E-RLT-0105's like pair (likePairStart, the rule's own first
// unequal-point like meeting) is run under the working rule (coinedVetoBeat, veto 'none', the pass contact). At every
// beat from the first split meeting to the beat before the second, where both vibes are out of the store, the pair is
// read by code/measure/separated-knot pairKnot: the terms grouped by everything but the pair's two points (one class
// means the points are a pure two-party state; more means the vacuum holds a record of them), then the Schmidt weights
// and the CHSH maximum. The separation is the shortest dock path in the box (dockDistance).
// CONTROL, the quantum-mechanics baseline: the state just after the first meeting with every other vibe and the whole
// store cleared (isolatePair), carried by the knit's meeting, collision and stream with no coin and no vacuum
// (vetoBeat), read the same way until its own next meeting.
//
// GATES, fixed before the first run:
//  I1 every readable beat of every window (vacuum on and vacuum off) has exactly one environment class
//  I2 at the first meeting, on every side, the knot reads (3/4, 1/4) to 1e-12 and CHSH sqrt 7 to 1e-9
//  I3 the parts separate: the largest separation in the window grows strictly with the side
//  C0 vacuum off: every readable beat of its window reads CHSH sqrt 7 to 1e-12
//  P1 the reading sees a change when the points are read: side 4 run to beat 16, some beat after a later meeting
//     reads a CHSH away from sqrt 7 by more than 1e-6
//  F1 the falloff fit sees a falloff when there is one: the same log-log fit on E-QTM-0042's model curve
//     S = min(2 + 2 eta, 2 sqrt 2) gives a positive exponent with r2 above 0.9
//  M1 the measurement: vacuum on, every readable beat of every window reads the first meeting's CHSH to 1e-12, and the
//     vacuum-on reading equals the vacuum-off reading at the same separation to 1e-12
// Verdict: fail (instrument) if I1, I2, I3, C0, P1 or F1 fails. If M1 holds, the knot does not fall with distance:
// status fail for the argued prediction, the negative stated. If M1 fails with the vacuum-on CHSH falling and a fitted
// exponent in [1.0, 1.8], pass; any other failure of M1, partial.
//
// LIMIT, stated before the run: the window lasts 3 side / 4 beats. E-QTM-0042 puts its crossover at a leaf gap near 512;
// a direct reading there is far past memory (side 32 took 3.4 GB). Beyond the window the result rests on the per-contact
// reading: each store contact is read exactly. Measured (corrected after the run, no gate moved): the largest
// separation is side / 2 links (16 at side 32), so a separation of 512 links needs a box of side 1024 (1.1e12 docks).
//
// FIRST RUN (188 s, run directly from deck/vibe/tmp/qtm188-one.ts because test/experiment/all.ts did not load another
// agent's in-progress file): every gate held. CHSH sqrt 7 exactly (deviation 0) at 2, 4, 8, 16 readings on sides 4, 8,
// 16, 32, separations 0 to 2, 4, 8, 16 links, through 1, 2, 4, 8 beats with both parts in the store; one environment
// class at every reading; vacuum off the same value at every separation; side 4 after later meetings 2.659955 and
// 2.711677; the fit on E-QTM-0042's curve 1.056 (r2 0.977); the fit on the rule slope 2e-32. Title written after.
//
// DETERMINISM: no random number; the pair is the rule's own pick on each side. Amplitudes exact in Z[w][1/2]; Schmidt
// weights and CHSH are floats. Depth L2: an entangled pair under local dynamics keeping its violation is known physics
// (no-signaling and local unitaries keep Schmidt weights), here measured on the rule with its vacuum and a computed
// control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  contactFresh,
  likePairStart,
} from '@/code/measure/occupation-veto-readings'
import { vacuumConfiguration } from '@/code/measure/doublet-locked-readings'
import { toWords, vetoBeat } from '@/code/rule/occupation-veto-knit'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import {
  lockedState,
  newTally,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  dockDistance,
  isolatePair,
  pairKnot,
} from '@/code/measure/separated-knot'
import { bulkTreeSamples } from '@/code/measure/cusp-distance'
import { linearFit } from '@/code/measure/regression'

const SIDES = [4, 8, 16, 32] as const
const SEARCH = 12
const P1_BEATS = 16
const SQRT7 = Math.sqrt(7)
const TSIRELSON = 2 * Math.SQRT2

type Read = {
  beat: number
  distance: number
  classes: number
  chsh: number | undefined
  weights: number[]
}

type SideRun = {
  side: number
  found: boolean
  first: number
  second: number
  firstWeights: number[]
  firstChsh: number
  on: Read[]
  off: Read[]
  stored: number
  after: Read[]
}

function readAt(tables: LockedTables, s: LockedState, beat: number): Read | undefined {
  const k = pairKnot(s.branches)

  if (!k.readable) {
    return undefined
  }

  return {
    beat,
    distance: dockDistance(
      tables,
      Math.floor(k.open[0]! / 24),
      Math.floor(k.open[1]! / 24),
    ),
    classes: k.classes,
    chsh: k.chsh,
    weights: k.weights,
  }
}

function sideRun(side: number, log: (w: string) => void): SideRun {
  const f = contactFresh(side, 'pass')
  const pick = likePairStart(
    'none',
    f.tables,
    toWords(vacuumConfiguration(f, 'none')),
    SEARCH,
  )
  const out: SideRun = {
    side,
    found: pick !== undefined && pick.clean,
    first: -1,
    second: -1,
    firstWeights: [],
    firstChsh: 0,
    on: [],
    off: [],
    stored: 0,
    after: [],
  }

  if (!pick) {
    return out
  }

  const cap = Math.max(P1_BEATS, 2 * side + 4)
  const tally = newTally()

  let s: LockedState = lockedState(pick.start)
  let atFirst: LockedState | undefined

  for (let t = 0; t < cap; t++) {
    const before = tally.splitMeetings

    s = coinedVetoBeat('none', f.tables, s, t, tally)

    const split = tally.splitMeetings > before

    if (split && out.first < 0) {
      out.first = t
      atFirst = s

      const r = readAt(f.tables, s, t)

      out.firstWeights = r?.weights ?? []
      out.firstChsh = r?.chsh ?? 0
      out.on.push(...(r ? [r] : []))
      continue
    }

    if (split && out.second < 0) {
      out.second = t
    }

    if (out.first >= 0 && out.second < 0) {
      const r = readAt(f.tables, s, t)

      if (r) {
        out.on.push(r)
      } else {
        out.stored++
      }
    }

    if (out.second >= 0) {
      const r = readAt(f.tables, s, t)

      if (r) {
        out.after.push(r)
      }

      // side 4 runs on to P1_BEATS for the change gate; larger sides stop at their second meeting
      if (side !== SIDES[0] || t >= P1_BEATS - 1) {
        break
      }
    }
  }

  log(`side ${side} on: meetings ${out.first}, ${out.second}`)

  if (!atFirst) {
    return out
  }

  // the control: the knot alone, no vacuum, no coin
  let c: LockedState = { branches: isolatePair(atFirst.branches) }

  const cTally = newTally()

  for (let t = out.first + 1; t < out.first + cap; t++) {
    const before = cTally.splitMeetings

    c = vetoBeat('none', f.tables, c, t, cTally)

    if (cTally.splitMeetings > before) {
      break
    }

    const r = readAt(f.tables, c, t)

    if (r) {
      out.off.push(r)
    }
  }

  log(`side ${side} off`)

  return out
}

export default experiment({
  id: 'quantum/bell-against-distance',
  code: 'E-QTM-0188',
  title:
    "Bell violation does not fall with distance on the rule, fail for the argued falloff (OPEN-QTM-20): the like pair's knot reads CHSH sqrt 7 exactly at every beat between its first and second meeting on boxes of side 4, 8, 16, 32 (30 readings, separations up to 16 links, 15 beats with both parts in the vacuum's store), one environment class at every reading, and the same knot carried with no vacuum reads the same; the reading sees later meetings move it (2.7117) and the same fit finds E-QTM-0042's model falloff, whose exponent is 1.056 today, not 1.38; the argued falloff is a measurement-dependence bound on a tree, not a dynamics of the rule's pairs",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const runs = SIDES.map(side => sideRun(side, log))

    // F1: the fit on E-QTM-0042's own model curve (its samples and gaps)
    const model = bulkTreeSamples({
      coordination: 2,
      depth: 15,
      coneDepth: 8,
      gaps: [
        8, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024,
        1536, 2048, 3072, 4096, 6144, 8192, 12288, 16000, 24000, 28000,
        32000, 32700,
      ],
    }).filter(m => m.eta < Math.SQRT2 - 1)
    const modelFit = linearFit({
      xs: model.map(m => Math.log(m.physical)),
      ys: model.map(m => Math.log(Math.min(2 + 2 * m.eta, TSIRELSON) - 2)),
    })

    // the fit on the rule: every vacuum-on reading at separation >= 1
    const onAll = runs.flatMap(r => r.on).filter(r => r.distance >= 1)
    const ruleFit = linearFit({
      xs: onAll.map(r => Math.log(r.distance)),
      ys: onAll.map(r => Math.log((r.chsh ?? 2) - 2)),
    })
    const near = (a: number | undefined, b: number, tol: number): boolean =>
      a !== undefined && Math.abs(a - b) <= tol
    const maxDistance = runs.map(r => Math.max(0, ...r.on.map(x => x.distance)))
    const offAt = (r: SideRun, d: number): Read[] => r.off.filter(x => x.distance === d)
    const g = {
      I1: runs.every(
        r =>
          r.on.every(x => x.classes === 1) &&
          r.off.every(x => x.classes === 1) &&
          r.after.every(x => x.classes === 1),
      ),
      I2: runs.every(
        r =>
          r.found &&
          r.firstWeights.length === 2 &&
          near(r.firstWeights[0], 0.75, 1e-12) &&
          near(r.firstWeights[1], 0.25, 1e-12) &&
          near(r.firstChsh, SQRT7, 1e-9),
      ),
      I3:
        maxDistance.every((d, i) => i === 0 || d > maxDistance[i - 1]!) &&
        runs.every(r => r.on.every(x => x.distance >= 0)),
      C0: runs.every(
        r => r.off.length > 0 && r.off.every(x => near(x.chsh, SQRT7, 1e-12)),
      ),
      P1: runs[0]!.after.some(
        x => x.chsh !== undefined && Math.abs(x.chsh - SQRT7) > 1e-6,
      ),
      F1: -modelFit.slope > 0 && modelFit.r2 > 0.9,
      M1: runs.every(
        r =>
          r.second > r.first &&
          r.on.every(
            x =>
              near(x.chsh, r.firstChsh, 1e-12) &&
              offAt(r, x.distance).every(y => near(y.chsh, x.chsh!, 1e-12)),
          ),
      ),
    }
    const instrument = g.I1 && g.I2 && g.I3 && g.C0 && g.P1 && g.F1
    const exponent = -ruleFit.slope
    const falls = runs.some(r => r.on.some(x => (x.chsh ?? 0) < r.firstChsh - 1e-12))
    const status = !instrument
      ? 'fail'
      : g.M1
        ? 'fail'
        : falls && exponent >= 1 && exponent <= 1.8
          ? 'pass'
          : 'partial'
    const metrics: Record<string, number> = {
      modelExponent: -modelFit.slope,
      modelR2: modelFit.r2,
      ruleSlope: ruleFit.slope,
      ruleReadings: onAll.length,
      seconds: 0,
    }

    runs.forEach(r => {
      const on = r.on.map(x => x.chsh ?? 0)
      const p = `side${r.side}_`

      metrics[`${p}firstMeeting`] = r.first
      metrics[`${p}secondMeeting`] = r.second
      metrics[`${p}readings`] = r.on.length
      metrics[`${p}storedBeats`] = r.stored
      metrics[`${p}maxDistance`] = Math.max(0, ...r.on.map(x => x.distance))
      metrics[`${p}chshMin`] = Math.min(...on)
      metrics[`${p}chshMax`] = Math.max(...on)
      metrics[`${p}maxDeviation`] = Math.max(...on.map(v => Math.abs(v - SQRT7)))
      metrics[`${p}offReadings`] = r.off.length
      metrics[`${p}offMaxDistance`] = Math.max(0, ...r.off.map(x => x.distance))
      metrics[`${p}offMaxDeviation`] = Math.max(
        0,
        ...r.off.map(x => Math.abs((x.chsh ?? 0) - SQRT7)),
      )
    })

    metrics.side4_afterChshMax = Math.max(
      0,
      ...runs[0]!.after.map(x => x.chsh ?? 0),
    )

    for (const [k, v] of Object.entries(g)) {
      metrics[`gate_${k}`] = v ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    const curve = (r: SideRun): string =>
      r.on.map(x => `${x.beat}:${x.distance}:${(x.chsh ?? 0).toFixed(12)}`).join(' ')
    const offCurve = (r: SideRun): string =>
      r.off.map(x => `${x.beat}:${x.distance}:${(x.chsh ?? 0).toFixed(12)}`).join(' ')
    const largest = Math.max(...maxDistance)
    const worst = Math.max(...runs.map(r => metrics[`side${r.side}_maxDeviation`]!))

    return verdict({
      status,
      claim: !instrument
        ? `the instrument failed: gates ${Object.entries(g).map(([k, v]) => `${k} ${v}`).join(', ')}`
        : g.M1
          ? `no falloff, a negative for the argued prediction: the knot of the rule's like pair reads CHSH sqrt 7 at every readable beat between its first and second meeting on boxes of side 4, 8, 16, 32 (${runs.map(r => r.on.length).join(', ')} readings, separations up to ${largest} links, largest deviation ${worst.toExponential(1)}), through ${runs.map(r => r.stored).join(', ')} beats with both parts held in the vacuum's store, and equals the same knot carried with no vacuum at every separation; one environment class at every reading, so the vacuum keeps no record of the points; the reading sees a change when the points are read (side 4 after its later meetings up to ${metrics.side4_afterChshMax!.toFixed(4)}) and the same fit finds E-QTM-0042's model falloff (exponent ${(-modelFit.slope).toFixed(3)}, not 1.38); the argued falloff is a measurement-dependence bound on a tree, not a dynamics of the rule's pairs`
          : `the knot falls with distance: fitted exponent ${exponent.toFixed(3)} (r2 ${ruleFit.r2.toFixed(3)}) against the argued 1.38`,
      metrics,
      control: {
        vacuumOffMaxDeviation: Math.max(
          ...runs.map(r => metrics[`side${r.side}_offMaxDeviation`]!),
        ),
        modelFitExponent: -modelFit.slope,
      },
      notes: `L2. Gates ${Object.entries(g)
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}. Per side, beat:links:CHSH, vacuum on then off. ${runs
        .map(r => `Side ${r.side} (meetings ${r.first}, ${r.second}): on ${curve(r)}; off ${offCurve(r)}`)
        .join('. ')}. Side 4 after its second meeting: ${runs[0]!.after
        .map(x => `${x.beat}:${(x.chsh ?? 0).toFixed(6)}`)
        .join(' ')}. Limit: side 32 reaches ${maxDistance[3]} links; E-QTM-0042's crossover (leaf gap near 512) would need a box of side ${2 * 512} (the largest separation is side / 2 links), not runnable, so the exclusion past the window rests on every store contact read exactly. ${metrics.seconds.toFixed(0)} s.`,
    })
  },
})
