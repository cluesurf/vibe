// THE LINE LAW (E-SPN-0098). step-back.md idea H1: every piece of the working knit (the stream, the coin, the meeting,
// the store) acts inside one dock line, and the stream carries a vibe along its line, so the tone on every straight
// mesh line should be conserved exactly: a subsystem symmetry, the fracton reading of line locality. A mesh line is a
// component of "a slot and its stream target" and "a slot and the opposite slot of its dock line" (code/measure/
// full-key-paths meshLines: 6,144 on side 8, 49,152 on side 16). Its tone is the sum of its vibes (a stored pair, a
// love and a fear, is tone 0); its directed tone counts first-slot vibes +1 and second-slot vibes -1.
//
// PROBES before this file, disclosed (all on the registered key, code/measure/doublet-locked-readings exchangeAt,
// which on side 16 does not depend on the beat and on side 8 repeats every 4 beats, E-MTH-0029):
//  - tmp/line-law-probe (side 8, 48 beats, one lone love, Born path, coin on): tone conserved on 6,144 of 6,144 lines
//    with no mixer, broken on all 6,144 with G; directed tone broken on 1,153 even without G (the coin flips a vibe's
//    direction on its line).
//  - tmp/pair-mixer-probe (side 16, 72 beats): G on a frame's STORES (a pair is tone 0) broke the tone on 41,565 of
//    49,152 lines; tmp/pair-mixer-debug (side 8, the unseeded vacuum, old key) found the mixing step keeps every line
//    and the COLLISION changes 519, 1,059 and 1,141 lines at beats 3, 4 and 5. The collision has a second piece,
//    code/rule/occupation-veto-knit coinPiece (the bounce table permuting a dock's whole occupation), which can carry
//    vibes across lines once a moved store leaves a dock the table does not act on line by line.
// The gates below are those findings, read before this file, re-read on the full-period key (code/measure/full-key-
// paths fullPathKey, four offsets) with the old key as the control: a rerun of disclosed findings, not predictions.
//
// GATES.
//  L1 no mixer: the tone on every mesh line is conserved at every beat, side 8, 48 beats, one lone love at the center
//     dock's slot 0, on every full-key offset and on the old key.
//  L2 G (the frame mixer at 28/64): the tone is broken on at least one line on every key (the count is reported
//     against the probe's 6,144 of 6,144).
//  L3 the store mixer (side 16, 72 beats, the same lone love, full key offset 0), every beat stepped piece by piece,
//     the lines each piece changes counted: (a) the store mixer changes none; (b) the coin, the meeting, the pair move
//     and the stream change none; (c) the collision's bounce piece changes some (the law breaks, and only there); (d)
//     the same run with no store mixer: the bounce piece changes none.
//  L4 the attribution again on the unseeded vacuum (side 8, 6 beats, tmp/pair-mixer-debug's run): with the store
//     mixer, only the bounce piece changes lines, on both keys.
//  CONTROL: the old key reproduces tmp/pair-mixer-debug's counts (519, 1,059, 1,141 lines at beats 3, 4, 5) and
//     tmp/line-law-probe's 6,144 with G; and the piece-by-piece beat equals the rule's own beat (code/measure/full-key-
//     paths keyedRunner, the collision as code/rule/occupation-veto-knit collideVeto) bit for bit at every beat.
//  Verdict: pass if L1 to L4 and the instrument check hold; partial if only the old-key counts fail to reproduce;
//  fail otherwise.
//
// Depth L2: an exact conservation law of the rule, read on its own runs (a known structure, a subsystem symmetry).
// DETERMINISM: no random numbers; the path's choices are integer Weyl numbers of the key. NOTHING MOVES: each slot takes
// the value a piece hands it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import {
  samePoints,
  streamInto,
  THRESHOLD_BORN,
  tritsApart,
} from '@/code/measure/doublet-locked-readings'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import {
  cloneConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { coinPiece, pairPiece } from '@/code/rule/occupation-veto-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import {
  fullPathKey,
  keyedCoin,
  keyedMeet,
  keyedMix,
  keyedPairMix,
  keyedRunner,
  lineCharges,
  linesDiffering,
  meshLines,
  oldPathKey,
  pathOffset,
  type MeshLines,
  type PathKey,
} from '@/code/measure/full-key-paths'

const LAW_SIDE = 8
const LAW_BEATS = 48
const OFFSETS = 4
const PAIR_SIDE = 16
const PAIR_BEATS = 72
const DEBUG_BEATS = 6
const PROBE_DEBUG = [519, 1059, 1141]
const PIECES = [
  'mix',
  'coin',
  'meet',
  'pair',
  'bounce',
  'stream',
] as const

type Piece = (typeof PIECES)[number]
type Steps = Record<Piece, number>

// one beat stepped piece by piece; every piece of one kind runs on every dock before the next (docks are disjoint, so
// this is the rule's own dock-by-dock order); the lines each piece changes are added to `steps`, and per beat to `perBeat`
function tracedBeat(input: {
  tables: LockedTables
  a: Configuration
  b: Configuration
  key: PathKey
  t: number
  mix: 'pairs' | number
  lines: MeshLines
  steps: Steps
  perBeat?: Steps[]
}): void {
  const { tables, a, b, key, t, mix, lines, steps } = input
  const beat: Steps = {
    mix: 0,
    coin: 0,
    meet: 0,
    pair: 0,
    bounce: 0,
    stream: 0,
  }

  const step = (
    name: Piece,
    run: () => void,
    from: Configuration,
    to: Configuration,
  ): void => {
    const before = lineCharges(lines, from).tone

    run()
    beat[name] += linesDiffering(before, lineCharges(lines, to).tone)
  }

  step(
    'mix',
    () =>
      mix === 'pairs'
        ? keyedPairMix(tables, a, key, t)
        : keyedMix(tables, a, key, t, mix),
    a,
    a,
  )
  step('coin', () => keyedCoin(tables, a, key, THRESHOLD_BORN, t), a, a)
  step('meet', () => keyedMeet(tables, a, key, THRESHOLD_BORN, t), a, a)

  for (const piece of collisionOrder('alternate', t)) {
    if (piece === 'P') {
      step(
        'pair',
        () => {
          for (let x = 0; x < tables.cells; x++) {
            pairPiece('none', a, x)
          }
        },
        a,
        a,
      )
    } else {
      step(
        'bounce',
        () => {
          for (let x = 0; x < tables.cells; x++) {
            coinPiece(tables, a, x)
          }
        },
        a,
        a,
      )
    }
  }

  step('stream', () => streamInto(tables, a, b), a, b)

  for (const p of PIECES) {
    steps[p] += beat[p]
  }

  input.perBeat?.push(beat)
}

const newSteps = (): Steps => ({
  mix: 0,
  coin: 0,
  meet: 0,
  pair: 0,
  bounce: 0,
  stream: 0,
})

// the line law on side 8: lines whose tone (and directed tone) ever differs from beat 0
function lawRun(
  tables: LockedTables,
  start: Configuration,
  lines: MeshLines,
  key: PathKey,
  mix: number,
): { tone: number; directed: number; firstBroken: number } {
  const run = keyedRunner(tables, start, { key, mix })
  const first = lineCharges(lines, start)
  const tone = new Uint8Array(lines.count)
  const directed = new Uint8Array(lines.count)

  let firstBroken = -1

  for (let t = 0; t < LAW_BEATS; t++) {
    run.beat()

    const now = lineCharges(lines, run.state())

    for (let k = 0; k < lines.count; k++) {
      if (now.tone[k] !== first.tone[k]) {
        tone[k] = 1

        if (firstBroken < 0) {
          firstBroken = t + 1
        }
      }

      if (now.directed[k] !== first.directed[k]) {
        directed[k] = 1
      }
    }
  }

  return {
    tone: tone.reduce((s, x) => s + x, 0),
    directed: directed.reduce((s, x) => s + x, 0),
    firstBroken,
  }
}

// the store-mixer run on one box: traced seeded run, the rule's own seeded run (instrument), the unseeded run (wake)
function pairRun(
  side: number,
  beats: number,
  key: (cells: number) => PathKey,
  mix: 'pairs' | number,
  seeded: boolean,
): {
  steps: Steps
  perBeat: Steps[]
  broken: number
  wake: number[]
  same: boolean
  lines: number
} {
  const center = centerOf(side)
  const f = contactFresh(side, 'pass', center)
  const tables = f.tables
  const lines = meshLines(tables)
  const vacuum = wordVacuum(f, f.store)
  const start = cloneConfiguration(vacuum)

  if (seeded) {
    start.vibe[center * 24] = 1
    start.open[center * 24] = 1
  }

  const k = key(f.cells)
  const rule = keyedRunner(tables, start, { key: k, mix })
  const plain = keyedRunner(tables, vacuum, { key: k, mix })
  const steps = newSteps()
  const perBeat: Steps[] = []
  const first = lineCharges(lines, start).tone
  const wake: number[] = []

  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)
  let same = true

  for (let t = 0; t < beats; t++) {
    tracedBeat({ tables, a, b, key: k, t, mix, lines, steps, perBeat })

    const s = a

    a = b
    b = s
    rule.beat()
    plain.beat()
    same &&= samePoints(a, rule.state())
    wake.push(tritsApart(a, plain.state()))
  }

  return {
    steps,
    perBeat,
    broken: linesDiffering(first, lineCharges(lines, a).tone),
    wake,
    same,
    lines: lines.count,
  }
}

export default experiment({
  id: 'spin/line-law',
  code: 'E-SPN-0098',
  title:
    "the tone on every mesh line is an exact law of the knit with no mixer, and the collision's bounce piece is what breaks it once stores move, pass: on side 8 over 48 beats the tone holds on 6,144 of 6,144 lines on four full-key paths and the old key, and G breaks it on all 6,144 (the directed tone breaks on 1,153 even with no mixer, the coin flipping direction); the store mixer on side 16 breaks it on 41,699 of 49,152 lines in 72 beats, every break made by the collision's bounce piece (from beat 4) and none by the mixing step, the coin, the meeting, the pair move or the stream, while without the store mixer the bounce piece breaks none; the old key reproduces the probe's 519, 1,059, 1,141 exactly (full key 473, 1,025, 1,183)",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const t0 = Date.now()
    const metrics: Record<string, number> = {}

    // ---- L1, L2: side 8 ----
    const center = centerOf(LAW_SIDE)
    const f = contactFresh(LAW_SIDE, 'pass', center)
    const lines = meshLines(f.tables)
    const start = cloneConfiguration(wordVacuum(f, f.store))

    start.vibe[center * 24] = 1
    start.open[center * 24] = 1

    const keys: PathKey[] = [
      ...Array.from({ length: OFFSETS }, (_, k) =>
        fullPathKey(pathOffset(k)),
      ),
      oldPathKey(f.cells),
    ]
    const law = keys.map(key => ({
      key: key.name,
      none: lawRun(f.tables, start, lines, key, 0),
      g: lawRun(f.tables, start, lines, key, 4),
    }))
    const gL1 = law.every(r => r.none.tone === 0)
    const gL2 = law.every(r => r.g.tone > 0)
    const oldLaw = law[law.length - 1]!

    // ---- L3: the store mixer on side 16, full key offset 0 ----
    const pairs = pairRun(
      PAIR_SIDE,
      PAIR_BEATS,
      () => fullPathKey(0),
      'pairs',
      true,
    )
    const unmixed = pairRun(
      PAIR_SIDE,
      PAIR_BEATS,
      () => fullPathKey(0),
      0,
      true,
    )
    const others = (s: Steps): number =>
      s.coin + s.meet + s.pair + s.stream
    const gL3 =
      pairs.steps.mix === 0 &&
      others(pairs.steps) === 0 &&
      pairs.steps.bounce > 0 &&
      unmixed.steps.bounce === 0 &&
      others(unmixed.steps) === 0
    const firstBounce = pairs.perBeat.findIndex(s => s.bounce > 0)

    // ---- L4 and the control: tmp/pair-mixer-debug's run on both keys ----
    const debugOld = pairRun(
      LAW_SIDE,
      DEBUG_BEATS,
      cells => oldPathKey(cells),
      'pairs',
      false,
    )
    const debugFull = pairRun(
      LAW_SIDE,
      DEBUG_BEATS,
      () => fullPathKey(0),
      'pairs',
      false,
    )
    const onlyBounce = (r: { steps: Steps }): boolean =>
      r.steps.mix === 0 && others(r.steps) === 0
    const gL4 = onlyBounce(debugOld) && onlyBounce(debugFull)
    const instrument =
      pairs.same && unmixed.same && debugOld.same && debugFull.same
    const oldDebug = debugOld.perBeat.slice(3, 6).map(s => s.bounce)
    const reproduced =
      oldDebug.every((v, i) => v === PROBE_DEBUG[i]) &&
      oldLaw.g.tone === lines.count &&
      oldLaw.none.tone === 0
    const status = !(gL1 && gL2 && gL3 && gL4 && instrument)
      ? 'fail'
      : reproduced
        ? 'pass'
        : 'partial'

    for (const r of law) {
      const k = r.key === 'old' ? 'old' : r.key.replace('full+', 'full')

      metrics[`${k}_noneToneBroken`] = r.none.tone
      metrics[`${k}_noneDirectedBroken`] = r.none.directed
      metrics[`${k}_gToneBroken`] = r.g.tone
      metrics[`${k}_gFirstBroken`] = r.g.firstBroken
    }

    Object.assign(metrics, {
      gate_L1: gL1 ? 1 : 0,
      gate_L2: gL2 ? 1 : 0,
      gate_L3: gL3 ? 1 : 0,
      gate_L4: gL4 ? 1 : 0,
      instrument: instrument ? 1 : 0,
      oldReproduced: reproduced ? 1 : 0,
      linesSide8: lines.count,
      linesSide16: pairs.lines,
      pairsBrokenEnd: pairs.broken,
      pairsBounceLines: pairs.steps.bounce,
      pairsFirstBounceBeat: firstBounce + 1,
      pairsWakeEnd: pairs.wake[pairs.wake.length - 1]!,
      unmixedWakeMax: Math.max(...unmixed.wake),
      seconds: (Date.now() - t0) / 1000,
    })

    const fmt = (s: Steps): string =>
      PIECES.map(p => `${p} ${s[p]}`).join(', ')

    return verdict({
      status,
      claim: `the tone on every mesh line: with no mixer conserved on ${law.map(r => `${lines.count - r.none.tone}`).join('/')} of ${lines.count} lines (side ${LAW_SIDE}, ${LAW_BEATS} beats; full-key offsets then the old key); with G broken on ${law.map(r => r.g.tone).join('/')}; the store mixer (side ${PAIR_SIDE}, ${PAIR_BEATS} beats) breaks it on ${pairs.broken} of ${pairs.lines} lines, every break made by the collision's bounce piece (${fmt(pairs.steps)}; first at beat ${firstBounce + 1}), none by the mixing step itself; with no store mixer the bounce piece breaks none (${fmt(unmixed.steps)})`,
      metrics,
      control: {
        oldDebugBeat3: oldDebug[0]!,
        oldDebugBeat4: oldDebug[1]!,
        oldDebugBeat5: oldDebug[2]!,
        oldGToneBroken: oldLaw.g.tone,
        oldNoneDirectedBroken: oldLaw.none.directed,
      },
      notes: `L2. L1 ${gL1}, L2 ${gL2}, L3 ${gL3}, L4 ${gL4}, instrument (piece by piece equals the rule's beat) ${instrument}, old-key counts reproduced ${reproduced}. Directed tone broken with no mixer: ${law.map(r => r.none.directed).join('/')} (the probe 1,153). Unseeded vacuum with the store mixer, lines changed per piece per beat, old key: ${debugOld.perBeat.map(fmt).join(' | ')}; full key: ${debugFull.perBeat.map(fmt).join(' | ')}. Store-mixer wake (trits apart from the unseeded run with the same mixer) per beat: ${pairs.wake.join(' ')}. Bounce-piece line changes per beat: ${pairs.perBeat.map(s => s.bounce).join(' ')}. ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
    })
  },
})
