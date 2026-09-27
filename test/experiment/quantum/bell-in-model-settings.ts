// Bell with settings made inside the model (E-QTM-0138): each party measures with the reflection R through
// the frame direction, its apparatus a love-fear pair whose line comes from the apparatus's own history.
//
// THE APPARATUS. A love and a fear placed on the two slots of a line of one dock of the color weave (side 3,
// the committed pair table, live links, the vacuum elsewhere), every dock and line, each
// with its 81 start points (see FIRST RUN for the count). The knit's classical layer runs it; the knit never
// reads a point, so each token's point after t beats is its start point moved by the links it crossed
// (code/measure/in-model-apparatus apparatusHistory). At beat t the apparatus is usable when its two tokens
// still hold a love and a fear and their points p_t != q_t; its SETTING is the line l(p_t, q_t), its class
// the family read. By E-QTM-0137 the classical member itself writes the stand-in's record, so no opening is
// used: R acts with the record at p_t and the reference at q_t, and a party's OUTCOME is the record's
// label along l. Both parties' tokens are read in the love frame (sum-record's physicalFrame), R with the
// system as a love. The meeting is applied at the beat read, by hand: WHEN the three tokens meet is not
// scheduled by the knit here (E-QTM-0136 has a three-slot rule, not run inside these histories). That
// scheduling is the one stand-in left.
//
// THE SYSTEM. E-QTM-0111's six Bell histories (code/measure/knot-histories), their own start at every beat
// after a meeting and all 144 line-product starts at the reading beat (one beat after the first meeting).
//
// TWO COUNTS OF THE SAME RUNS. The whole is the signed count, loves minus fears, over the system's hidden
// joint points (E-QTM-0113, E-QTM-0130). The model's deterministic RUNS are its classical members: each
// joint point of the start moved by the grid moves and exchanges alone, the fear beat off (every kernel the
// identity on the tokens' coordinates). A run's outcome is a function of its own party's member and its own
// apparatus points (R's formula). The runs' count is non-negative.
//
// Predictions, written before the experiment's first run. A probe, tmp/qtm138-probe.ts, ran first on 12 and
// then all 324 placements (disclosed): the usable apparatus reach all 4 classes at 424 of 480 beats, and
// their number falls from 243 placements at beat 1 to 27 at beat 479 (a love or fear often turns calm).
//   P1 at every beat the usable apparatus reach at least 2 line classes, so each party has two in-model
//      settings at every beat (the 424 is the probe's reading, not a prediction).
//   P2 with R and member apparatus, every correlator is a signed count of the system's knot, and the record
//      observables are E-QTM-0111's line observables relabeled, so on every state at a beat with all 4
//      classes the in-model CHSH equals E-QTM-0111's plain-settings CHSH exactly (numerator and units), and
//      at the other beats it is never above it.
//   P3 the whole passes 2: the largest in-model CHSH is 62/27 = 2.296 (E-QTM-0111's value), carried by
//      fear; at the reading beats of the own starts it is 2.
//   P4 the runs never pass 2: the fear-off count is non-negative on every state and its CHSH is at most 2.
//   P5 measurement independence, in the knit itself: an apparatus run in the SAME lattice as E-QTM-0100's
//      system tokens (4 and 7) reaches identical points, vibes and tokens for all 81 start points of the
//      system, so no setting depends on the system's hidden points. Over the enumerated product of system
//      members and apparatus starts the mutual information of setting and member is 0 (by construction
//      once the in-situ check holds).
//   P6 no influence crosses the gap: Alice's outcome counts for each of her 12 settings are the same for
//      every one of Bob's 12 (static, every state), and Bob's R at the reading beat, which moves his token
//      by his apparatus's color content (one of 9 translations, a grid move), leaves Alice's counts exactly
//      as they were at every beat before the pair meets again (E-QTM-0111's gate on the R moves), while some
//      translation changes them after the next meeting.
//
// Gates, fixed before the first run: G1 = P1, G2 = P2 (0 mismatches), G3 = P3 (largest value > 2), G4 = P4,
// G5 = P5 (0 differences), G6 = P6 (0 mismatches, and a change after contact). Status pass when all hold.
//
// What the gates decide is a fork, stated before the run: if G3 and G4 both hold, the model's whole violates
// CHSH with settings made in the model while its deterministic runs cannot, and with G5 and G6 it is
// neither superdeterministic nor nonlocal. Bell's theorem is then escaped only because the whole is a
// SIGNED count over the runs, not a probability over them.
//
// FIRST RUN (2026-09-26, 259 s): fail, on G1 only. The box is all 81 docks (972 placements, 78,732
// apparatus starts), not the 27 docks x 12 lines this header first said; the probe had read 27 docks. At
// some beat no apparatus is usable at all (fewest classes 0), so P1 was wrong: every usable apparatus loses
// its love or fear there. All 4 classes are usable at 424 of 480 beats, and 1,173 of the 1,222 states read
// fall on such a beat. G2 to G6 hold as predicted: the in-model CHSH equals E-QTM-0111's plain value on all
// 1,173 full-class states and is below it on the other 49; the whole reaches 62/27 = 2.2963 (qtm0100-color,
// beat 78, 16 fears), 2 at the own reading beats; the fear-off runs are non-negative on every state and
// never pass 2 (largest exactly 2); 972 in-situ runs, 0 differences; 14,076 static and 36,864 dynamic
// no-signaling checks, 0 mismatches, 6,128 translation settings change Alice's counts after contact. No gate
// was moved.
//
// Depth L2: the knit's own histories and apparatus, exact integers. The husk is not read: every number is
// a role-grid number, the same on the bulk and the husk.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import { CONJUGATE_POINT, fearKernels, meetingKernel, movePhaseCoordinate, swapPhase, wholeLovesAndFears, type Whole } from '@/code/rule/fear-weave'
import { advanceKnot, bellHistories, lineKnot, physicalKnot, type KnotHistory } from '@/code/measure/knot-histories'
import { enumeratedChsh, gridLines } from '@/code/measure/bell-gates'
import { addPoints } from '@/code/measure/frame-covariant-meeting'
import { apparatusHistory, LABEL, LINES, lineIndexThrough, memberRecord } from '@/code/measure/in-model-apparatus'

const BEATS = 480
const SITU_BEATS = 60
const GROUPINGS = Array.from({ length: 8 }, (_, g) => [0, 1, 2].map(r => ((g >> r) & 1 ? -1 : 1)))

// the record's label for each system point, for each of the 12 settings (member at the line's first two
// points; E-QTM-0137 shows every member writes the same label)
const RECORD = LINES.map(l => Int8Array.from({ length: 9 }, (_, x) => LABEL[9 * l.c + memberRecord(x, l.points[0] ?? 0, l.points[1] ?? 0).record] ?? 0))

// the distinct +-1 observables on the system's point the records of the lines in `lines` give
function recordObservables(lines: readonly number[]): Int8Array[] {
  const seen = new Map<string, Int8Array>()

  for (const l of lines) {
    for (const g of GROUPINGS) {
      const o = Int8Array.from({ length: 9 }, (_, x) => g[RECORD[l]![x] ?? 0] ?? 1)

      seen.set(o.join(','), o)
    }
  }

  return [...seen.values()]
}

// the largest CHSH over the given observables, exact, as enumeratedChsh does it
function chshOver(weight: readonly bigint[], observables: readonly Int8Array[]): { numerator: bigint; units: bigint } {
  const table = observables.map(a =>
    observables.map(b => {
      let s = 0n

      for (let i = 0; i < 81; i++) {
        const w = weight[i] ?? 0n

        if (w !== 0n) {
          s += BigInt((a[Math.floor(i / 9)] ?? 0) * (b[i % 9] ?? 0)) * w
        }
      }

      return s
    }),
  )
  const n = table.length
  let best = -1n << 400n

  for (let a0 = 0; a0 < n; a0++) {
    for (let a1 = 0; a1 < n; a1++) {
      let plus = -1n << 400n
      let minus = -1n << 400n

      for (let b = 0; b < n; b++) {
        const p = (table[a0]?.[b] ?? 0n) + (table[a1]?.[b] ?? 0n)
        const m = (table[a0]?.[b] ?? 0n) - (table[a1]?.[b] ?? 0n)

        plus = p > plus ? p : plus
        minus = m > minus ? m : minus
      }

      best = plus + minus > best ? plus + minus : best
    }
  }

  return { numerator: best, units: weight.reduce((s, w) => s + w, 0n) }
}

// the same history with the fear beat off: every meeting the identity on the tokens' coordinates
function fearOff(h: KnotHistory): KnotHistory {
  if (h.kernels.mode === 'swap') {
    return { ...h, kernels: { mode: 'swap', kernel4: meetingKernel(swapPhase(Math.PI)) ?? [] } }
  }

  const exchanged = h.name === 'qtm0100-color'

  return { ...h, kernels: { mode: 'color', color: fearKernels({ like: exchanged ? Math.PI : 0, unlike: 0, likeExchanged: exchanged })! } }
}

const nextMeeting = (h: KnotHistory, from: number): number => {
  for (let t = from; t < h.records.length; t++) {
    if ((h.records[t]?.meetings.length ?? 0) > 0) {
      return t
    }
  }

  return h.records.length
}

// Alice's outcome counts: for each of her 12 settings, the weight on each record label
function aliceCounts(weight: readonly bigint[]): bigint[] {
  const out = new Array<bigint>(36).fill(0n)

  for (let i = 0; i < 81; i++) {
    const w = weight[i] ?? 0n

    if (w !== 0n) {
      for (let l = 0; l < 12; l++) {
        const k = 3 * l + (RECORD[l]![Math.floor(i / 9)] ?? 0)

        out[k] = (out[k] ?? 0n) + w
      }
    }
  }

  return out
}

export default experiment({
  id: 'quantum/bell-in-model-settings',
  code: 'E-QTM-0138',
  title:
    'Bell with settings made inside the model: each party measures with the reflection through the frame direction and a love-fear apparatus whose line comes from its own history in the knit; the whole passes CHSH 2 up to 62/27, the model\'s deterministic runs never do, every setting is independent of the system\'s hidden points and no influence crosses the gap, so the violation is carried only by the signed count',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the apparatus: which lines are usable at each beat
    const weave = makeColorWeave({ side: 3, table: 'pair' })
    const slots = weave.mesh.cellCount * 24
    const lineMask = new Uint16Array(BEATS)
    const usable = new Int32Array(BEATS)
    const coincident = new Int32Array(BEATS)
    const classUse = new Array<number>(4 * BEATS).fill(0)
    let apparatusStarts = 0

    for (let x = 0; x < weave.mesh.cellCount; x++) {
      for (let d = 0; d < 24; d++) {
        const o = weave.opposite[d] ?? d

        if (o < d) {
          continue
        }

        const vibe = new Int8Array(slots)

        vibe[x * 24 + d] = 1
        vibe[x * 24 + o] = -1

        const run = apparatusHistory({ weave, vibe, love: x * 24 + d, fear: x * 24 + o, beats: BEATS })

        apparatusStarts += 81

        for (let t = 0; t < BEATS; t++) {
          for (let p0 = 0; p0 < 9; p0++) {
            for (let q0 = 0; q0 < 9; q0++) {
              const p = run.moves[t * 18 + p0] ?? 0
              const q = run.moves[t * 18 + 9 + q0] ?? 0

              if (p === q) {
                coincident[t] = (coincident[t] ?? 0) + 1
              } else if (run.valid[t]) {
                const l = lineIndexThrough(p, q)

                usable[t] = (usable[t] ?? 0) + 1
                lineMask[t] = (lineMask[t] ?? 0) | (1 << l)
                classUse[4 * t + LINES[l]!.c] = (classUse[4 * t + LINES[l]!.c] ?? 0) + 1
              }
            }
          }
        }
      }
    }

    const settingsAt = (t: number): number[] => LINES.map((_, l) => l).filter(l => ((lineMask[t] ?? 0) >> l) & 1)
    const classesAt = (t: number): number => new Set(settingsAt(t).map(l => LINES[l]!.c)).size

    // P5 in situ: E-QTM-0100's system tokens 4 and 7 in the same lattice as an apparatus, 81 system points
    let situRuns = 0
    let situDifferences = 0

    for (let d = 0; d < 24; d++) {
      const o = weave.opposite[d] ?? d
      const x = 13

      if (o < d) {
        continue
      }

      const vibe = new Int8Array(slots)

      vibe[x * 24 + d] = 1
      vibe[x * 24 + o] = -1

      let reference: Int8Array | undefined

      for (let s = 0; s < 81; s++) {
        const points = new Int8Array(slots)

        points[4] = Math.floor(s / 9)
        points[7] = s % 9

        const run = apparatusHistory({ weave, vibe, love: x * 24 + d, fear: x * 24 + o, beats: SITU_BEATS, points })
        const signature = Int8Array.from([...run.moves, ...run.valid])

        situRuns++

        if (!reference) {
          reference = signature
        } else {
          situDifferences += signature.every((v, i) => v === reference![i]) ? 0 : 1
        }
      }
    }

    // the Bell tests
    const { lines } = gridLines()
    const counts = {
      states: 0,
      statesAllClasses: 0,
      recordVsPlainBad: 0,
      recordAbovePlain: 0,
      statesBelowPlain: 0,
      runsNegative: 0,
      runsAbove2: 0,
      staticChecks: 0,
      staticBad: 0,
      dynamicChecks: 0,
      dynamicBad: 0,
      contactChanges: 0,
    }
    let wholeBest = { numerator: 0n, units: 1n, history: '', beat: -1, fears: 0n }
    let runsBest = { numerator: 0n, units: 1n }
    let readingOwnMax = 0
    const perHistory: Record<string, number> = {}

    const examine = (h: KnotHistory, w: Whole, off: Whole, t: number, own: boolean): void => {
      const physical = physicalKnot(h, w)
      const settings = settingsAt(t)
      const observables = recordObservables(settings)
      const inModel = chshOver(physical.weight, observables)
      const plain = enumeratedChsh(physical.weight)

      counts.states++
      counts.statesAllClasses += classesAt(t) === 4 ? 1 : 0
      if (classesAt(t) === 4) {
        counts.recordVsPlainBad += inModel.numerator === plain.numerator && inModel.units === plain.units ? 0 : 1
      } else {
        counts.recordAbovePlain += inModel.numerator * plain.units > plain.numerator * inModel.units ? 1 : 0
        counts.statesBelowPlain += inModel.numerator * plain.units < plain.numerator * inModel.units ? 1 : 0
      }

      const value = Number(inModel.numerator) / Number(inModel.units)

      if (value > Number(wholeBest.numerator) / Number(wholeBest.units)) {
        wholeBest = { ...inModel, history: h.name, beat: t, fears: wholeLovesAndFears(physical).fears }
      }

      perHistory[`${h.name}_chshInModelMax`] = Math.max(perHistory[`${h.name}_chshInModelMax`] ?? 0, value)

      const offPhysical = physicalKnot(h, off)
      const runs = chshOver(offPhysical.weight, observables)

      counts.runsNegative += offPhysical.weight.some(x => x < 0n) ? 1 : 0
      counts.runsAbove2 += runs.numerator > 2n * runs.units ? 1 : 0

      if (Number(runs.numerator) / Number(runs.units) > Number(runsBest.numerator) / Number(runsBest.units)) {
        runsBest = runs
      }

      perHistory[`${h.name}_chshRunsMax`] = Math.max(perHistory[`${h.name}_chshRunsMax`] ?? 0, Number(runs.numerator) / Number(runs.units))

      // static no signaling: Alice's counts per setting, whatever Bob's setting (Bob's record relabels his
      // own coordinate, so the sum over his outcomes is the marginal for every one of his settings)
      for (const lb of settings) {
        const bobRelabeled = new Array<bigint>(81).fill(0n)

        physical.weight.forEach((x, i) => {
          const k = 9 * Math.floor(i / 9) + 3 * (RECORD[lb]![i % 9] ?? 0)

          bobRelabeled[k] = (bobRelabeled[k] ?? 0n) + x
        })

        const fromBob = aliceCounts(bobRelabeled.map((_, i) => (i % 3 === 0 ? (bobRelabeled[i] ?? 0n) + (bobRelabeled[i + 1] ?? 0n) + (bobRelabeled[i + 2] ?? 0n) : 0n)))
        const direct = aliceCounts(physical.weight)

        counts.staticChecks++
        counts.staticBad += fromBob.every((x, k) => x === direct[k]) ? 0 : 1
      }

      if (own && t === nextMeeting(h, 0) + 1) {
        readingOwnMax = Math.max(readingOwnMax, value)
      }
    }

    for (const h of bellHistories(BEATS)) {
      const off = fearOff(h)
      const first = nextMeeting(h, 0)
      const reading = first + 1
      const after = nextMeeting(h, reading + 1)
      const startOf = (a: readonly number[], b: readonly number[]): Whole => lineKnot(h.tokens, a, b)

      for (const a of lines) {
        for (const b of lines) {
          const own = a.every(p => Math.floor(p / 3) === h.start[0]) && b.every(p => Math.floor(p / 3) === h.start[1])
          let w = startOf(a, b)
          let o = startOf(a, b)
          const trail: Whole[] = []

          for (let t = 0; t < (own ? BEATS : reading + 1); t++) {
            w = advanceKnot(h, w, h.records[t]!)
            o = advanceKnot(off, o, h.records[t]!)
            trail.push(w)

            if (t === reading || (own && (h.records[t]?.meetings.length ?? 0) > 0)) {
              examine(h, w, o, t, own)
            }
          }

          // dynamic no signaling: Bob's R at the reading beat moves his token by a translation v
          const atReading = trail[reading]

          if (!atReading) {
            continue
          }

          const baseline: bigint[][] = []
          const units: bigint[] = []
          let run = atReading

          for (let t = reading + 1; t < Math.min(BEATS, after + 2); t++) {
            run = advanceKnot(h, run, h.records[t]!)
            baseline[t] = aliceCounts(physicalKnot(h, run).weight)
            units[t] = run.weight.reduce((s, x) => s + x, 0n)
          }

          for (let v = 1; v < 9; v++) {
            const frame = atReading.frame?.[1] ?? 0
            const stored = frame === -1 || (frame === 0 && h.conjugated) ? (CONJUGATE_POINT[v] ?? 0) : v
            let moved = movePhaseCoordinate(atReading, 1, Array.from({ length: 9 }, (_, s) => addPoints(s, stored)))
            let changed = false

            for (let t = reading + 1; t < Math.min(BEATS, after + 2); t++) {
              moved = advanceKnot(h, moved, h.records[t]!)

              const mine = aliceCounts(physicalKnot(h, moved).weight)
              const u = moved.weight.reduce((s, x) => s + x, 0n)
              const same = mine.every((x, k) => x * (units[t] ?? 1n) === (baseline[t]?.[k] ?? 0n) * u)

              if (t < after) {
                counts.dynamicChecks++
                counts.dynamicBad += same ? 0 : 1
              } else if (!same) {
                changed = true
              }
            }

            counts.contactChanges += changed ? 1 : 0
          }
        }
      }
    }

    const wholeValue = Number(wholeBest.numerator) / Number(wholeBest.units)
    const runsValue = Number(runsBest.numerator) / Number(runsBest.units)
    const beatsRead = Array.from({ length: BEATS }, (_, t) => t)
    const gates = {
      G1: beatsRead.every(t => classesAt(t) >= 2),
      G2: counts.recordVsPlainBad === 0 && counts.recordAbovePlain === 0 && counts.states > 0,
      G3: wholeValue > 2,
      G4: counts.runsNegative === 0 && counts.runsAbove2 === 0,
      G5: situDifferences === 0 && situRuns > 0,
      G6: counts.staticBad === 0 && counts.dynamicBad === 0 && counts.dynamicChecks > 0 && counts.contactChanges > 0,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `with settings made in the knit (the line of a love-fear apparatus after its own history, all 4 classes usable at ${beatsRead.filter(t => classesAt(t) === 4).length} of ${BEATS} beats, ${apparatusStarts.toLocaleString()} apparatus starts) and R as the measurement, the in-model CHSH equals E-QTM-0111's plain value on all ${counts.states.toLocaleString()} states, and the whole passes 2, up to ${wholeBest.numerator}/${wholeBest.units} = ${wholeValue.toFixed(4)} (${wholeBest.history}, beat ${wholeBest.beat}), carried by fear, while the model's deterministic runs (the fear-off count, non-negative on every state) never pass 2 (largest ${runsValue.toFixed(4)}); no setting depends on the system's hidden points (${situRuns} in-situ runs, ${situDifferences} differences) and no influence crosses the gap (${counts.staticChecks.toLocaleString()} static and ${counts.dynamicChecks.toLocaleString()} dynamic checks, ${counts.staticBad + counts.dynamicBad} mismatches), so the model is neither superdeterministic nor nonlocal and its Bell violation lives only in the signed count, which is not a count of its runs`,
      metrics: {
        apparatusStarts,
        beatsAllClasses: beatsRead.filter(t => classesAt(t) === 4).length,
        usableAtBeat1: usable[1] ?? 0,
        usableAtBeat479: usable[479] ?? 0,
        coincidentAtBeat479: coincident[479] ?? 0,
        ...Object.fromEntries([0, 1, 2, 3].map(c => [`classUseAtBeat479_${c}`, classUse[4 * 479 + c] ?? 0])),
        fewestClassesAtABeat: Math.min(...beatsRead.map(classesAt)),
        situRuns,
        situDifferences,
        ...counts,
        chshWholeMax: wholeValue,
        chshWholeMaxNumerator: Number(wholeBest.numerator),
        chshWholeMaxUnits: Number(wholeBest.units),
        chshWholeMaxFears: Number(wholeBest.fears),
        chshWholeMaxBeat: wholeBest.beat,
        chshReadingOwnMax: readingOwnMax,
        chshRunsMax: runsValue,
        ...perHistory,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        "RERUN 2026-09-26 under the adopted comoving fear beat (Bob's translation kept as an operation on the role, his own point unmoved): status fail as before, on G1 only; the whole's largest in-model CHSH 2.2963 -> 2.5298 (rlt0055), every no-signaling and contact count unchanged. " + ('L2, exact BigInt knots, no random numbers: apparatus starts, system starts and translations are enumerated. The one stand-in left: WHEN the system meets its apparatus is chosen by hand (the beat read), not scheduled by the knit. Mutual information between setting and system member is 0 by construction once the in-situ check holds (the setting is a function of the apparatus start alone). The whole is the signed count over the runs; a CHSH value above 2 at these settings needs negative weight (the bound 2 (L + F) / (L - F) of code/measure/bell-gates).'),
    })
  },
})
