// Zeno with a true record: do SUM records every n beats freeze the vacuum pair's transfer?
//
// E-QTM-0116 found the model's own record (a fear-beat meeting with a fresh token) suppresses the transfer
// of E-QTM-0100's vacuum pair by RESETTING the pair to the fresh token's role, and that an ideal role record
// (a stand-in dephasing) does not freeze it. E-QTM-0127 showed SUM is a true role record in the model's own
// group. Here the record is SUM: every n beats, each token of the pair is copied into a fresh token on role
// line 0 and the fresh token is traced out. The pair is E-QTM-0100's, on flat links, from |0>|1>, the swap
// phase at every meeting: with no record the chance of the reading (1, 0) goes 1/4, 3/4, 1 over the first
// three meetings.
//
// The prediction, written before the first run: a SUM record and its trace is exactly the dephasing of the
// role (E-QTM-0127 G4: the tilt is flattened, the role untouched), so SUM records every beat must give the
// ideal stand-in's 1/4, 3/8, 7/16 and no freeze. Zeno freezing needs the change between records to start
// quadratically in time; a meeting of the fear beat moves a finite 1/4 at once and nothing moves between
// meetings, so records denser than the meetings add nothing. The control that shows the instrument CAN see a
// freeze: a stand-in fear beat split into m equal steps (U(-pi / (3 m)) on the tokens, m of them per meeting,
// floating point), with SUM records of both tokens after every step. Its transfer after three meetings'
// worth of steps is predicted (1 - (1 - 2 sin^2(pi / (6 m)))^(3 m)) / 2, which is 7/16 at m = 1 and falls
// like pi^2 / (12 m): a freeze, as the step shrinks.
//
// The flow record (the coordinator's question): E-QTM-0127 G8 found the color weave's flow update is SUM with
// the copied vibe as control. Whether it can freeze anything is asked by the one thing a record must do to
// freeze: act back. In the color weave the vibes never read the flow, so a flow record every beat and no
// record at all must give the same vibes.
//
// Gates, fixed before the first run:
//   G1 no record: 1/4, 3/4, 1 exactly after the first three meetings.
//   G2 SUM records of both tokens every beat: 1/4, 3/8, 7/16 exactly, and the pair's whole equals the ideal
//      stand-in's (E-QTM-0116's dephase) at every one of 480 beats, as exact ratios.
//   G3 a true record, not a reset: no SUM record step changes the pair's reading distribution (0 changes
//      over every n).
//   G4 no freeze in the model: for every n, the chance of (1, 0) after the third meeting is at least 7/16.
//   G5 the instrument sees a freeze: the split-step control's transfer after three meetings' worth falls at
//      every doubling of m from 1 to 32, is 7/16 at m = 1 to 1e-12, matches the closed form to 1e-9 at every
//      m, and is below 0.05 at m = 32.
//   G6 the flow cannot freeze: over 48 beats of the color weave (side-3 D4 box, golden Weyl fill), the vibes
//      and role points are identical at every beat with the flow kept and with the flow reset to 0 before
//      every beat.
// Reported: the transfer after the third meeting and the time mean over 480 beats, for every n, for SUM
// records of both tokens and of token A alone, and the time-mean chance of the start reading (0, 1) with
// records every beat (E-QTM-0116's reset record: 0.006).
//
// FIRST RUN (2026-09-26, 3.2 s): every gate passes, every prediction held. SUM records every 1, 2, 3, 4 and
// 8 beats give 7/16 after the third meeting (records every 6 and 12 give 5/8, every 24 and never give 1): the
// curve depends only on how many meetings fall between records, never on density below that. Every record
// step leaves the readings unchanged (0 resets), the whole equals the ideal stand-in's at all 480 beats, and
// the time-mean chance of the start reading with records every beat is 0.518 (0.474 with none, 0.006 under
// E-QTM-0116's reset). Recording token A alone gives the same numbers as both, since on this pair's
// subspace A's role fixes B's. The split-step stand-in freezes as predicted: 0.4375, 0.2891, 0.1702,
// 0.0932, 0.0489, 0.0251 for m = 1 to 32, each to 1e-14 of the closed form. The flow: 48 beats, the vibes
// and role points identical with the flow kept and reset (0 beats differ). A second run, after the shared
// fear weave changed under this session (E-QTM-0123, E-QTM-0124), repeats every number (flat links, so the
// grid-move convention does not enter).
//
// Depth L2. The husk is not read: the readings are roles on the grid, and the flow check runs on the bulk D4
// box, a statement about the substrate's link variable.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { swapPhase, wignerKernel, type Whole } from '@/code/rule/fear-weave'
import { makeColorWeave, colorBeat } from '@/code/rule/color-weave'
import { advanceKnot, lineKnot, qtm0100Histories } from '@/code/measure/knot-histories'
import { openToken, permuteTwo, sumPermutation, traceOut } from '@/code/measure/sum-record'
import { GOLDEN, SILVER } from '@/code/tool/weyl'

const BEATS = 480
const FLOW_BEATS = 48
const INTERVALS = [1, 2, 3, 4, 6, 8, 12, 24, 0]
const SPLITS = [1, 2, 4, 8, 16, 32]
const ROLE_LINE_0 = [0, 1, 2]

const frac = (x: number): number => x - Math.floor(x)
// the reading of joint point i of two tokens: role of the first times 3 plus role of the second
const readingOf = (i: number): number => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3)
const readings = (w: Whole): bigint[] => {
  const out = new Array<bigint>(9).fill(0n)

  w.weight.forEach((x, i) => {
    out[readingOf(i)] = (out[readingOf(i)] ?? 0n) + x
  })

  return out
}
const unitsOf = (w: Whole): bigint => w.weight.reduce((s, x) => s + x, 0n)
const chanceOf = (w: Whole, reading: number): number => Number(((readings(w)[reading] ?? 0n) * 10n ** 15n) / unitsOf(w)) / 1e15
const proportional = (a: readonly bigint[], b: readonly bigint[]): boolean => {
  const ua = a.reduce((s, x) => s + x, 0n)
  const ub = b.reduce((s, x) => s + x, 0n)

  return a.every((x, i) => x * ub === (b[i] ?? 0n) * ua)
}

// a SUM record of coordinate c of a two-token whole, traced: open, copy, trace
function recordToken(w: Whole, c: number): Whole {
  return traceOut(permuteTwo(openToken(w, -1, ROLE_LINE_0), c, 2, sumPermutation()), 2)
}

// E-QTM-0116's ideal record: the pair's weight replaced by its reading's total on every point
function dephase(w: Whole): Whole {
  const r = readings(w)

  return { tokens: w.tokens, weight: w.weight.map((_, i) => r[readingOf(i)] ?? 0n) }
}

// the same SUM record in floating point, on 81 weights, for the split-step control
function recordFloat(w: Float64Array, c: number): Float64Array {
  const sum = sumPermutation()
  const out = new Float64Array(81)

  for (let i = 0; i < 81; i++) {
    const x = w[i] ?? 0

    if (x === 0) {
      continue
    }

    for (const r of ROLE_LINE_0) {
      const own = c === 0 ? Math.floor(i / 9) : i % 9
      const image = sum[9 * own + r] ?? 0
      const moved = c === 0 ? 9 * Math.floor(image / 9) + (i % 9) : 9 * Math.floor(i / 9) + Math.floor(image / 9)

      out[moved] = (out[moved] ?? 0) + x / 3
    }
  }

  return out
}

export default experiment({
  id: 'quantum/sum-zeno',
  code: 'E-QTM-0129',
  title:
    'no Zeno freeze from a true record: SUM records of the vacuum pair every beat give exactly the ideal record\'s 1/4, 3/8, 7/16, change no reading, and never push the third-meeting transfer below 7/16, because a fear-beat meeting is a finite step; a stand-in fear beat split into m steps does freeze, as pi^2 / (12 m), and the flow, a SUM record of the vibe, never acts back on the vibes',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const [live] = qtm0100Histories(BEATS)
    const h = { ...live!, records: live!.records.map(r => ({ ...r, crossings: r.crossings.map(([tk]) => [tk, live!.weave.moves.identity] as const) })) }
    const start = lineKnot(h.tokens, [0, 1, 2].map(k => 3 * (h.start[0] ?? 0) + k), [0, 1, 2].map(k => 3 * (h.start[1] ?? 0) + k))
    const startReading = 3 * (h.start[0] ?? 0) + (h.start[1] ?? 0)

    let resetSteps = 0
    let idealMismatch = 0

    const runWith = (n: number, which: 'both' | 'first', compareIdeal = false): { firstThree: number[]; mean: number; startMean: number } => {
      let w = start
      let ideal = start
      const firstThree: number[] = []
      let sum = 0
      let startSum = 0

      for (let t = 0; t < BEATS; t++) {
        const r = h.records[t]!

        w = advanceKnot(h, w, r)
        ideal = advanceKnot(h, ideal, r)

        if (n > 0 && (t + 1) % n === 0) {
          const before = readings(w)

          w = recordToken(w, 0)

          if (which === 'both') {
            w = recordToken(w, 1)
          }

          resetSteps += proportional(before, readings(w)) ? 0 : 1
          ideal = dephase(ideal)
        }

        if (compareIdeal) {
          idealMismatch += proportional(w.weight, ideal.weight) ? 0 : 1
        }

        if (r.meetings.length > 0 && firstThree.length < 3) {
          firstThree.push(chanceOf(w, 3))
        }

        sum += chanceOf(w, 3)
        startSum += chanceOf(w, startReading)
      }

      return { firstThree, mean: sum / BEATS, startMean: startSum / BEATS }
    }

    const none = runWith(0, 'both')
    const everyBeat = runWith(1, 'both', true)
    const curves: Record<string, number> = {}
    let lowest = Number.POSITIVE_INFINITY

    for (const n of INTERVALS) {
      for (const which of ['both', 'first'] as const) {
        const r = runWith(n, which)
        const tag = `${which}_every${n === 0 ? 'Never' : n}`

        curves[`${tag}_afterThirdMeeting`] = r.firstThree[2] ?? -1
        curves[`${tag}_meanOver480`] = r.mean

        if (which === 'both') {
          lowest = Math.min(lowest, r.firstThree[2] ?? -1)
        }
      }
    }

    curves.both_every1_meanChanceOfStart = everyBeat.startMean
    curves.none_meanChanceOfStart = none.startMean

    // the split-step control: m steps of U(-pi / (3 m)) per meeting, SUM records of both tokens after each
    const split = SPLITS.map(m => {
      const kernel = wignerKernel(swapPhase(-Math.PI / (3 * m)))
      let w = new Float64Array(81)

      // |0>|1>: weight 1/9 on each point of role line 0 x role line 1
      for (const x of [0, 1, 2]) {
        for (const y of [3, 4, 5]) {
          w[9 * x + y] = 1 / 9
        }
      }

      for (let s = 0; s < 3 * m; s++) {
        const next = new Float64Array(81)

        for (let r = 0; r < 81; r++) {
          let v = 0
          const row = kernel[r] ?? []

          for (let c = 0; c < 81; c++) {
            v += (row[c] ?? 0) * (w[c] ?? 0)
          }

          next[r] = v
        }

        w = recordFloat(recordFloat(next, 0), 1)
      }

      let transfer = 0

      w.forEach((x, i) => {
        transfer += readingOf(i) === 3 ? x : 0
      })

      const closed = (1 - (1 - 2 * Math.sin(Math.PI / (6 * m)) ** 2) ** (3 * m)) / 2

      return { m, transfer, closed }
    })

    // the flow: vibes with the flow kept against the flow reset every beat
    const weave = makeColorWeave({ side: 3, table: 'bind' })
    const slots = weave.mesh.cellCount * 24
    const fill = {
      vibe: Int8Array.from({ length: slots }, (_, i) => (frac((i + 1) * GOLDEN) < 0.25 ? (frac((i + 1) * SILVER) < 0.5 ? 1 : -1) : 0)),
      role: Int8Array.from({ length: slots }, (_, i) => Math.floor(9 * frac((i + 3) * GOLDEN))),
      flow: new Int32Array(slots),
    }
    let kept = fill
    let reset = fill
    let flowDiffer = 0

    for (let t = 0; t < FLOW_BEATS; t++) {
      kept = colorBeat(weave, kept, t)
      reset = colorBeat(weave, { ...reset, flow: new Int32Array(slots) }, t)
      flowDiffer += kept.vibe.every((v, i) => v === reset.vibe[i]) && kept.role.every((v, i) => v === reset.role[i]) ? 0 : 1
    }

    const exact = (x: number, y: number): boolean => Math.abs(x - y) < 1e-12
    const gates = {
      G1: exact(none.firstThree[0] ?? 0, 1 / 4) && exact(none.firstThree[1] ?? 0, 3 / 4) && exact(none.firstThree[2] ?? 0, 1),
      G2: exact(everyBeat.firstThree[0] ?? 0, 1 / 4) && exact(everyBeat.firstThree[1] ?? 0, 3 / 8) && exact(everyBeat.firstThree[2] ?? 0, 7 / 16) && idealMismatch === 0,
      G3: resetSteps === 0,
      G4: lowest >= 7 / 16 - 1e-12,
      G5:
        exact(split[0]?.transfer ?? 0, 7 / 16) &&
        split.every(s => Math.abs(s.transfer - s.closed) < 1e-9) &&
        split.every((s, i) => i === 0 || s.transfer < (split[i - 1]?.transfer ?? 0)) &&
        (split[split.length - 1]?.transfer ?? 1) < 0.05,
      G6: flowDiffer === 0,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'SUM records of the vacuum pair every 1 to 4 beats give exactly the ideal record\'s 1/4, 3/8, 7/16, equal its whole at all 480 beats and change no reading, so they measure without resetting (time-mean chance of the start 0.518 against the fear-beat record\'s 0.006), but they never freeze the transfer below 7/16, because a fear-beat meeting moves a finite quarter at once; a stand-in fear beat split into m steps with a record after each freezes as pi^2 / (12 m), 0.4375 to 0.0251 for m = 1 to 32, so the instrument sees a freeze where one exists; the flow, a SUM record of the vibe, never acts back on the vibes and can freeze nothing',
      metrics: {
        lowestAfterThirdMeeting: lowest,
        resetSteps,
        idealMismatchBeats: idealMismatch,
        ...curves,
        ...Object.fromEntries(split.flatMap(s => [[`split${s.m}_transfer`, s.transfer], [`split${s.m}_closedForm`, s.closed]])),
        flowBeatsWhereVibesDiffer: flowDiffer,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        'L2, exact BigInt wholes for the model; the split-step control is a stand-in (the fear beat divided into m equal rotations, not a rule of the model), in floating point, labeled as one. The SUM record is E-QTM-0127\'s, opened on role line 0 and traced at once.',
    })
  },
})
