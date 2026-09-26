// The Born rule as a count: does any count the knit makes over deterministic starts converge to the fear
// weave's chances? The roadmap's question (note/research/vibe/roadmap/atoms-and-quanta.md, section 1): a
// probability here must be a COUNT over deterministic histories, never a draw.
//
// The chance of a reading (the roles of the knot's two tokens) is its share of the signed weight,
// p = (loves on the reading - fears on it) / (loves - fears). Three counts the model has, each put to it:
//
// (a) THE HIDDEN POINT. A token outside the knot holds one classical grid point, and the knit moves it by the
//     link it crosses and by nothing else (fearBeat: point[tk] = moves.act[g][point[tk]]). Give both tokens
//     of a knot such a point, started on each joint point of the start knot's support (9 points of weight 1:
//     the enumeration), and count the readings the points give at every beat. Liouville's theorem on the
//     grid predicts the count is exactly the chance with the fear beat OFF (the same grid moves, no kernel),
//     since a grid move permutes points and so moves a count as it moves a weight. Where the fear beat
//     changes a chance, the count must then miss it. The environment family: N hidden starts picked by the
//     golden Weyl sequence, start k = support point floor(9 frac(k phi)), whose frequencies converge to the
//     same fear-off chance at the Weyl rate, about log N / N.
// (b) THE LOVE COUNT. The knot's weight is a set of loves and fears on grid points. Count loves only: the
//     share of the knot's loves on the reading, loves_j / L.
// (c) THE SIGNED COUNT. Loves count +1 and fears -1: (loves_j - fears_j) / (L - F). This IS the chance, by
//     definition: an identity, recorded as one.
//
// Arithmetic: 9 equal starts give counts in ninths. Every deterministic reversible rule on the hidden points
// (any permutation of the 81 joint points at any meeting) keeps that, so a chance outside (1/9) Z cannot be
// a count over these starts under ANY such rule, not only the knit's. E-QTM-0100's swap phase makes 1/4 and
// 3/4 (E-QTM-0100 section 1).
//
// Histories (code/measure/knot-histories): E-QTM-0100's swap and color readings on flat links (the
// interference run) and on live links, E-QTM-0109, E-FRC-0159 H and HF, E-RLT-0055, each from its own start
// over 480 beats.
//
// Gates, fixed before the first run:
//   instrument gates (must pass for the rest to mean anything):
//   I1 Liouville: the hidden-point count over the 9 support starts equals the fear-off chance exactly, as
//      a rational, at every beat of every history and for every reading: 0 mismatches.
//   I2 the signed count equals the chance at every beat: 0 mismatches (identity).
//   I3 the Weyl family's largest error against the fear-off chance on the live E-QTM-0100 swap history at
//      the reading beat falls with N from 2^6 to 2^16 with a log-log slope at most -0.8.
//   hypothesis gates (the question):
//   H1 the hidden-point count equals the weight chance at every beat of every history.
//   H2 the love count equals the weight chance at every beat of every history.
//   H3 every weight chance the flat-link swap run makes over its first three meetings is in (1/9) Z.
// Predicted before the run: I1 to I3 pass, H1 to H3 fail (H1 and H2 at the first meeting that makes a fear
// or turns a chance, H3 at 1/4). The status is pass only if every gate passes, so the predicted outcome is
// status fail: the Born rule is not a non-negative count of this model's deterministic starts.
//
// FIRST RUN (2026-09-26, 17 s): exactly as predicted. I1, I2, I3 pass (3,000 Liouville checks, 0
// mismatches; Weyl slope -0.93, error 1.7e-2 at 2^6 down to 2.7e-5 at 2^16), H1, H2, H3 fail: the hidden
// count misses on 2,304 of 3,000 beats, by up to 1 (a reading the count gives with certainty that the weight
// gives with chance 0), the love count on 1,892, by up to 0.268, and the flat swap run makes 1/4, 3/4, 1.
// The Weyl family converges to the fear-off chance, which misses the weight by 1/12 at the reading beat
// (1/3 against 1/4). The hidden count's first miss is always the history's first meeting (beat 6, 8, 10,
// and 0 for E-RLT-0055, whose pair meets on its first beat). The love count misses later on the color
// histories (beat 40 on E-QTM-0109) and never on E-QTM-0100's color run, whose readings carry no fear.
// WHY, as a theorem rather than a count: E-QTM-0117 shows the links are the Clifford group, and the hidden
// point is the phase-space point a Clifford moves (Gross 2006, the discrete Liouville theorem), so the count
// reproduces the stabilizer sector exactly and nothing beyond it. The fear beat is the magic gate
// (E-QTM-0118), and a state with mana > 0 has a Wigner function with negative weight that no non-negative
// count over starts can equal (Veitch, Ferrie, Gross and Emerson 2012). The Born rule of this model is the
// SIGNED count, loves minus fears, and the non-negative part of it fails exactly where mana is made.
//
// Depth L2. Substrate-independent: the readings are roles on the grid.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fearKernels, meetingKernel, swapPhase, wholeLovesAndFears, type Whole } from '@/code/rule/fear-weave'
import { makeColorWeave } from '@/code/rule/color-weave'
import { advanceKnot, bellHistories, lineKnot, physicalKnot, qtm0100Histories, type KnotHistory } from '@/code/measure/knot-histories'
import { GOLDEN } from '@/code/tool/weyl'

const BEATS = 480
const WEYL_POWERS = [6, 8, 10, 12, 14, 16]

// the reading of joint point i: role of the first token times 3 plus role of the second
const readingOf = (i: number): number => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3)

// a history's knot run with the fear beat off: the same record, identity kernels
function fearOff(h: KnotHistory): KnotHistory {
  const OFF = Math.PI

  return h.kernels.mode === 'swap'
    ? { ...h, kernels: { mode: 'swap', kernel4: meetingKernel(swapPhase(OFF)) ?? [] } }
    : {
        ...h,
        kernels: {
          mode: 'color',
          color:
            h.name === 'qtm0100-color'
              ? fearKernels({ like: OFF, unlike: 0 })!
              : fearKernels({ like: 0, unlike: 0, likeExchanged: false })!,
        },
      }
}

// the flat-link copy of E-QTM-0100's histories (its interference run): links never steer a token, only
// move its point, so the record on flat links is the live record with every crossing the identity
function flatHistories(): KnotHistory[] {
  const weave = makeColorWeave({ side: 3, table: 'pair' })
  const identity = weave.moves.identity

  return qtm0100Histories(60).map(h => ({
    ...h,
    name: `${h.name}-flat`,
    records: h.records.map(r => ({ ...r, crossings: r.crossings.map(([tk]) => [tk, identity] as const) })),
  }))
}

// chances per reading as exact numerators over the units
function chances(w: Whole): { num: bigint[]; units: bigint } {
  const num = new Array<bigint>(9).fill(0n)

  w.weight.forEach((x, i) => {
    num[readingOf(i)] = (num[readingOf(i)] ?? 0n) + x
  })

  return { num, units: w.weight.reduce((s, x) => s + x, 0n) }
}

function loveShares(w: Whole): { num: bigint[]; units: bigint } {
  const num = new Array<bigint>(9).fill(0n)
  let total = 0n

  w.weight.forEach((x, i) => {
    if (x > 0n) {
      num[readingOf(i)] = (num[readingOf(i)] ?? 0n) + x
      total += x
    }
  })

  return { num, units: total }
}

const equalShares = (a: { num: bigint[]; units: bigint }, b: { num: bigint[]; units: bigint }): boolean => a.num.every((x, k) => x * b.units === (b.num[k] ?? 0n) * a.units)
const gap = (a: { num: bigint[]; units: bigint }, b: { num: bigint[]; units: bigint }): number =>
  Math.max(...a.num.map((x, k) => Math.abs(Number(x) / Number(a.units) - Number(b.num[k] ?? 0n) / Number(b.units))))

export default experiment({
  id: 'quantum/born-rule-as-a-count',
  code: 'E-QTM-0113',
  title:
    'the Born rule as a count fails for every non-negative count the knit makes: the classical grid point a token carries counts exactly the fear-off chance over its enumerated starts (Liouville), converging at the Weyl rate to that wrong limit, the love count misses wherever a fear sits, nine equal starts cannot make the 1/4 the swap phase makes under any reversible rule, and only the signed count, fears negative, is the chance',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const histories = [...flatHistories(), ...bellHistories(BEATS)]
    let liouvilleChecks = 0
    let liouvilleMismatch = 0
    let signedMismatch = 0
    let hiddenMismatch = 0
    let hiddenGapMax = 0
    let loveMismatch = 0
    let loveGapMax = 0
    const per: Record<string, number> = {}

    for (const h of histories) {
      const off = fearOff(h)
      const supportA = [0, 1, 2].map(k => 3 * (h.start[0] ?? 0) + k)
      const supportB = [0, 1, 2].map(k => 3 * (h.start[1] ?? 0) + k)
      let on: Whole = lineKnot(h.tokens, supportA, supportB)
      let offWhole: Whole = on
      // the hidden points of the 9 starts, in the stored convention (both coordinates move by the same grid
      // move, as the knot's weights do)
      let hidden = supportA.flatMap(a => supportB.map(b => [a, b] as [number, number]))
      const coordinate = new Map(h.tokens.map((t, i) => [t, i]))
      let firstHidden = -1
      let firstLove = -1

      for (let t = 0; t < h.records.length; t++) {
        const record = h.records[t]!

        on = advanceKnot(h, on, record)
        offWhole = advanceKnot(off, offWhole, record)

        for (const [tk, g] of record.crossings) {
          const c = coordinate.get(tk)

          if (c !== undefined) {
            const act = h.weave.moves.act[g] ?? []

            hidden = hidden.map(p => (c === 0 ? [act[p[0]] ?? p[0], p[1]] : [p[0], act[p[1]] ?? p[1]]) as [number, number])
          }
        }

        // the hidden-point count, read in the physical convention like the weights
        const countNum = new Array<bigint>(9).fill(0n)

        for (const [x, y] of hidden) {
          const i = x * 9 + y
          const physical = h.conjugated ? x * 9 + (3 * Math.floor(y / 3) + ((3 - (y % 3)) % 3)) : i

          countNum[readingOf(physical)] = (countNum[readingOf(physical)] ?? 0n) + 1n
        }

        const count = { num: countNum, units: 9n }
        const weight = chances(physicalKnot(h, on))
        const offChance = chances(physicalKnot(off, offWhole))
        const loves = loveShares(physicalKnot(h, on))
        const { loves: L, fears: F } = wholeLovesAndFears(on)

        liouvilleChecks++
        liouvilleMismatch += equalShares(count, offChance) ? 0 : 1
        signedMismatch += L - F === weight.units ? 0 : 1

        if (!equalShares(count, weight)) {
          hiddenMismatch++
          hiddenGapMax = Math.max(hiddenGapMax, gap(count, weight))
          firstHidden = firstHidden < 0 ? t : firstHidden
        }

        if (!equalShares(loves, weight)) {
          loveMismatch++
          loveGapMax = Math.max(loveGapMax, gap(loves, weight))
          firstLove = firstLove < 0 ? t : firstLove
        }
      }

      per[`${h.name}_firstBeatHiddenMisses`] = firstHidden
      per[`${h.name}_firstBeatLoveCountMisses`] = firstLove
    }

    // H3: the flat-link swap run's chances over its first three meetings
    const flatSwap = histories[0]!
    const meetingChances: number[] = []
    let inNinths = true

    {
      let w = lineKnot(flatSwap.tokens, [0, 1, 2].map(k => 3 * (flatSwap.start[0] ?? 0) + k), [0, 1, 2].map(k => 3 * (flatSwap.start[1] ?? 0) + k))

      for (const record of flatSwap.records) {
        w = advanceKnot(flatSwap, w, record)

        if (record.meetings.length > 0 && meetingChances.length < 3) {
          const c = chances(w)

          meetingChances.push(Number(c.num[3] ?? 0n) / Number(c.units))
          inNinths = inNinths && c.num.every(x => (9n * x) % c.units === 0n)
        }
      }
    }

    // I3: the Weyl family on the live swap history at its reading beat
    const liveSwap = histories.find(x => x.name === 'qtm0100-swap')!
    const reading = liveSwap.records.findIndex(r => r.meetings.length > 0) + 1
    const support = [0, 1, 2].flatMap(a => [0, 1, 2].map(b => [3 * (liveSwap.start[0] ?? 0) + a, 3 * (liveSwap.start[1] ?? 0) + b] as [number, number]))
    const landed = support.map(([x0, y0]) => {
      let x = x0
      let y = y0
      const coordinate = new Map(liveSwap.tokens.map((t, i) => [t, i]))

      for (let t = 0; t <= reading; t++) {
        for (const [tk, g] of liveSwap.records[t]!.crossings) {
          const act = liveSwap.weave.moves.act[g] ?? []

          if (coordinate.get(tk) === 0) {
            x = act[x] ?? x
          } else if (coordinate.get(tk) === 1) {
            y = act[y] ?? y
          }
        }
      }

      return readingOf(x * 9 + y)
    })
    const exact = new Array<number>(9).fill(0)

    landed.forEach(r => {
      exact[r] = (exact[r] ?? 0) + 1 / 9
    })

    const weylErrors = WEYL_POWERS.map(power => {
      const n = 2 ** power
      const freq = new Array<number>(9).fill(0)

      for (let k = 1; k <= n; k++) {
        const x = k * GOLDEN
        const s = Math.floor(9 * (x - Math.floor(x)))

        freq[landed[s] ?? 0] = (freq[landed[s] ?? 0] ?? 0) + 1 / n
      }

      return Math.max(...freq.map((f, r) => Math.abs(f - (exact[r] ?? 0))))
    })
    const xs = WEYL_POWERS.map(p => p * Math.LN2)
    const ys = weylErrors.map(e => Math.log(Math.max(e, 1e-300)))
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length
    const my = ys.reduce((a, b) => a + b, 0) / ys.length
    const slope = xs.reduce((s, x, i) => s + (x - mx) * ((ys[i] ?? 0) - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0)
    const readingWeight = (() => {
      let w = lineKnot(
        liveSwap.tokens,
        [0, 1, 2].map(k => 3 * (liveSwap.start[0] ?? 0) + k),
        [0, 1, 2].map(k => 3 * (liveSwap.start[1] ?? 0) + k),
      )

      for (let t = 0; t <= reading; t++) {
        w = advanceKnot(liveSwap, w, liveSwap.records[t]!)
      }

      const c = chances(w)

      return c.num.map(x => Number(x) / Number(c.units))
    })()
    const limitGap = Math.max(...readingWeight.map((p, r) => Math.abs(p - (exact[r] ?? 0))))

    const gates = {
      I1: liouvilleChecks > 0 && liouvilleMismatch === 0,
      I2: signedMismatch === 0,
      I3: slope <= -0.8,
      H1: hiddenMismatch === 0,
      H2: loveMismatch === 0,
      H3: inNinths,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on flat and live links over the six Bell histories, the grid point a token carries counts exactly the fear-off chance over the 9 enumerated starts, and a golden Weyl family of starts converges to that same wrong limit at about 1/N; the love count misses wherever a fear sits; the swap phase makes chances 1/4 and 3/4 that no reversible rule on 9 equal starts can count; the signed count, fears negative, is the chance exactly. The Born rule is not a non-negative count of this model\'s deterministic starts',
      metrics: {
        liouvilleChecks,
        liouvilleMismatch,
        signedMismatch,
        hiddenMismatchBeats: hiddenMismatch,
        hiddenGapMax,
        loveMismatchBeats: loveMismatch,
        loveGapMax,
        flatSwapChance10Meeting1: meetingChances[0] ?? -1,
        flatSwapChance10Meeting2: meetingChances[1] ?? -1,
        flatSwapChance10Meeting3: meetingChances[2] ?? -1,
        weylSlope: slope,
        ...Object.fromEntries(WEYL_POWERS.map((p, i) => [`weylErrorAt2to${p}`, weylErrors[i] ?? -1])),
        weylLimitGapToWeight: limitGap,
        ...per,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        'L2, exact BigInt knots, the golden Weyl sequence of code/tool/weyl for the environment family, no random numbers. I1 and I2 are the instrument; H1 to H3 the hypothesis, predicted to fail. The hidden point is the classical point fearBeat keeps for a closed token, so (a) is the knit\'s own deterministic role, not an added variable. The Weyl rate is the discrepancy of frac(k phi) and measures the environment family, not the knit: it says how fast a count of deterministic starts settles, and to what.',
    })
  },
})
