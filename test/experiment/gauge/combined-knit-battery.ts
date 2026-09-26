// The combined knit (code/rule/combined-knit, built and checked in E-FRC-0158) through every battery this
// line of work has, with the fear beat off and on, and with and without the fold.
//
// PRE-REGISTERED, written into this header on 2026-09-25 before any number on the combined knit was run
// beyond E-FRC-0158's piece-by-piece checks.
//
// Configurations, every one on the head-on turn base (HEAD_TURN_SPEC) with the scatter block on:
//   H    the color turn schedule (unfolded), block at mirror phase 23
//   HF   the folded round robin, block at mirror phase 23 (the folded base's, measured in E-FRC-0158)
//   HFL  HF with lone steering (box-level only: steering reads the flux)
// and each with the fear beat OFF (the whole's kernels the identity) and ON (the color mode at the cube-root
// angles: the singlet phase where a love meets a fear, the swap phase where like vibes meet), its knots
// stored as the departure from calm times omega^q. Reference columns: the committed turning weave, the color
// turn weave (candidate A) and the E-FRC-0148 runner-up (candidate B).
//
// Classical gates (the base's; they decide nothing about the fear beat, and they are reported per
// configuration):
//   dock level, H and HF: every gate of E-FRC-0136 against the committed rule (reversal, charge, CPT at a
//   mirror phase, a periodic vacuum, line components on the vacuum and on a dense background no more than
//   the committed rule's, superposition, sheet-quantized walls), a love's and a fear's dressing no more than
//   the committed rule's in each of four periods at sides 7, 9 and 11;
//   box level, H, HF and HFL (side 3, 48 beats, dense fill): exact reversal with role points and flux,
//   charge kept, no color leak, frame change in every dock commutes, momentum P drift 0, line momenta
//   exchanged (some line momentum changes);
//   HFL also: the vacuum periodic with its flux, and a love's and a fear's dressing at side 7 no more than
//   the committed rule's.
// Quantum gates (E-QTM-0109's, on side 3, per configuration, evaluated with the fear beat off and on):
//   token signs kept for life by every dock-0 token; the vacuum, matter and grower knots pure, share of fear
//   at most 1/3; fears made (a knot holds a fear at some beat); exact reversal over 96 beats in fixed units
//   with love minus fear kept; frame change commutes on the vacuum and matter pairs; the calm-difference
//   storage times omega^q reads back real and equal, balanced, pure and with every chance equal, on the
//   vacuum, matter and grower (q not 0) knots; both kernels unital and weight-keeping; interference: the
//   chance sequence after the vacuum pair's first three meetings on flat links differs from the dephased
//   stand-in; CHSH above 2 one beat after the first meeting on live links.
//   Controls for every mode: the committed table flips token signs; the swap phase at love-fear meetings
//   breaks the frame change; with the fear beat off every chance is 1; the stand-in's CHSH is at most 2.
// THE ADOPTION RULE for the fear beat ("if it works with everything"): the fear beat works with the combined
// knit exactly when, on every configuration (H, HF, HFL), (a) no gate, classical or quantum, fails with the
// fear beat on that passes with it off, and (b) every quantum gate passes with it on. The classical gates
// are the base's and are not part of (b). The fold is left open: its choice waits on isotropy (E-RLT-0047,
// E-RLT-0048, another agent), and both are reported.
// Reported, not gated: the full E-FRC-0149 characterization (CPT search, kick law, travel, line sectors,
// ledger, handedness, spin lift, generation copies) of the committed rule, A, B, H and HF.
//
// Two instrument faults found in the first run, fixed before the second, neither touching a gate's rule: the
// steered vacuum was kept for 72 beats while the steered dressing ran 96, so its fourth period compared the
// seeded run with itself and read 0; and the steered vacuum's period was searched only up to 24 beats. A
// second run searched up to 48 and found none for the folded configurations; a probe then found the folded
// vacuum returns at 72 beats, so the third run searches up to 72 (over 144), and also reports each
// dock-level configuration's vacuum period up to 72 beside E-FRC-0136's one-period gate, which stays as
// registered. The characterization also read angles and lifts off a missing coin element for the folded
// turn, which no coin element carries; those now read -1 and 0.
//
// Depth L2: constructed rules against stated gates, with the committed rule and the fear-off rule as controls.
//
// RERUN 2026-09-26 under the adopted COMOVING fear beat (code/rule/fear-weave advanceWhole's default, E-SPN-0063),
// and under the 2026-09-26 frame and phase-index conventions (E-QTM-0123, E-QTM-0124) its first numbers predate.
// "On" is now the comoving beat. Two instrument changes, made before the rerun and touching no gate's rule: the
// frame change moves each coordinate's own point with its weights (the comoving beat reads the own points, so
// they are part of the state a frame change acts on), and the dephased stand-in keeps the own points (it drops
// the frames, as before). Both are exactly E-SPN-0063's harness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { turningWeave } from '@/code/rule/collision'
import { makeColorWeave } from '@/code/rule/color-weave'
import { HEAD_TURN_SPEC } from '@/code/rule/scatter-weave'
import {
  advanceWhole,
  conjugateSecond,
  CONJUGATE_POINT,
  fearBeat,
  fearBeatBack,
  fearKernels,
  makeLattice,
  moveCoordinate,
  phasePermOf,
  reduceWhole,
  swapPhase,
  wholeKernel,
  wholeLovesAndFears,
  wholeUnits,
  type BeatRecord,
  type FearKernels,
  type Whole,
} from '@/code/rule/fear-weave'
import { departureChances, departureOf, kernelIsUnital, kernelKeepsWeight, reduceDeparture, type Departure } from '@/code/rule/calm-weave'
import { timesOmega } from '@/code/rule/signed-knot'
import { foldRoundRobin, makeSteeredKnit } from '@/code/rule/steered-knit'
import {
  combinedBeat,
  combinedBeatBack,
  combinedCollision,
  combinedLeaks,
  combinedState,
  makeCombinedKnit,
  rolesOf,
  scheduleOf,
  type CombinedKnit,
  type CombinedKnitSpec,
  type CombinedState,
} from '@/code/rule/combined-knit'
import { lineMomenta, momentumOf } from '@/code/rule/momentum-weave'
import { acceptance, dressing, type Acceptance, type Dressing, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { characterizeKnit, committedNumbersReproduced, REFERENCE_KNITS, type Profile } from '@/code/measure/knit-characterization'
import { denseKnitState } from '@/code/measure/steered-acceptance'
import { vacuumCells } from '@/code/measure/lone-dressing'
import { roleChsh, roleDensity } from '@/code/measure/role-bell'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const OMEGA = (2 * Math.PI) / 3
const QSIDE = 3
const BOX_BEATS = 48
const SEARCH_BEATS = 240
const Q_BEATS = 480
const REVERSAL_BEATS = 96
const GAUGE_BEATS = 48
const MATTER_SCALE = 2.11
const SIDES = [7, 11]
const STEER_DRESSING_SIDE = 7
const STEER_DRESSING_BEATS = 96
// periods are searched up to three schedule periods (the folded round robin's vacuum returns at 72, the
// period E-FRC-0156's box instrument reads), each seen at least twice in the window
const LONGEST_PERIOD = 72
// the steered vacuum is kept for twice the longest period, which covers every beat the dressing runs
const VACUUM_BEATS = 2 * LONGEST_PERIOD

type Config = { readonly name: string; readonly spec: CombinedKnitSpec }

const CONFIGS: readonly Config[] = [
  { name: 'H', spec: { base: HEAD_TURN_SPEC, fold: false, scatter: true, mirror: 23, steer: false } },
  { name: 'HF', spec: { base: HEAD_TURN_SPEC, fold: true, scatter: true, mirror: 23, steer: false } },
  { name: 'HFL', spec: { base: HEAD_TURN_SPEC, fold: true, scatter: true, mirror: 23, steer: 'lone' } },
]

const ruleOf = (spec: CombinedKnitSpec): ScheduledRule => (opposite, forward) => combinedCollision({ spec, opposite, forward })

function golden(slots: number, scale: number): { vibe: Int8Array; point: Int8Array } {
  const vibe = new Int8Array(slots)
  const point = new Int8Array(slots)

  for (let i = 0; i < slots; i++) {
    const u = ((i + 1) * GOLDEN * scale) % 1

    vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
    point[i] = Math.floor(((i + 3) * GOLDEN * scale * 9) % 9)
  }

  return { vibe, point }
}

const differ = (a: ArrayLike<number>, b: ArrayLike<number>): number => {
  let n = 0

  for (let i = 0; i < a.length; i++) {
    n += a[i] === b[i] ? 0 : 1
  }

  return n
}

// the knit with its links replaced (a frame change, or flat links)
const withLinks = (knit: CombinedKnit, links: Int16Array): CombinedKnit => ({ ...knit, weave: { ...knit.weave, links } })

function frameOf(knit: CombinedKnit): { frame: number[]; links: Int16Array } {
  const { mesh, moves, links } = knit.weave
  const frame = Array.from({ length: mesh.cellCount }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * moves.act.length))
  const gauged = new Int16Array(links.length)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      gauged[x * 24 + d] = moves.compose(
        moves.compose(frame[mesh.neighbour(x, d)] ?? moves.identity, links[x * 24 + d] ?? moves.identity),
        moves.inverse[frame[x] ?? moves.identity] ?? moves.identity,
      )
    }
  }

  return { frame, links: gauged }
}

// box-level classical gates, side 3
function boxGates(spec: CombinedKnitSpec): Record<string, number> {
  const knit = makeCombinedKnit({ side: QSIDE, spec })
  const { mesh, moves, opposite } = knit.weave
  const slots = mesh.cellCount * 24
  const fill = golden(slots, 1.37)
  const flux = spec.steer ? denseKnitState(makeSteeredKnit({ side: QSIDE, spec: scheduleOf(spec), steer: spec.steer })).flux : undefined
  const start = combinedState(knit, { ...fill, flux })
  const none = new Uint8Array(slots)
  const all = new Uint8Array(slots).fill(1)
  const charge = (s: CombinedState): number => s.vibe.reduce((a, b) => a + b, 0)
  const p0 = momentumOf(start.vibe).p
  const n0 = lineMomenta(start.vibe, opposite)
  const sum0 = n0.reduce((a, b) => a + b, 0)

  let s = start
  let open = start
  let leaks = 0
  let chargeKept = true
  let pDrift = 0
  let lineDrift = 0
  let lineSumDrift = 0
  let openChanges = 0

  for (let t = 0; t < BOX_BEATS; t++) {
    leaks += combinedLeaks(knit, s, t)
    s = combinedBeat(knit, s, none, t).state
    open = combinedBeat(knit, open, all, t).state
    openChanges += differ(s.vibe, open.vibe) + differ(s.token, open.token) + differ(s.flux, open.flux)
    chargeKept = chargeKept && charge(s) === charge(start)
    pDrift = Math.max(pDrift, ...momentumOf(s.vibe).p.map((x, k) => Math.abs(x - (p0[k] ?? 0))))

    const n = lineMomenta(s.vibe, opposite)

    lineDrift = Math.max(lineDrift, ...n.map((x, k) => Math.abs(x - (n0[k] ?? 0))))
    lineSumDrift = Math.max(lineSumDrift, Math.abs(n.reduce((a, b) => a + b, 0) - sum0))
  }

  for (let t = BOX_BEATS - 1; t >= 0; t--) {
    s = combinedBeatBack(knit, s, none, t).state
  }

  const reverses = differ(s.vibe, start.vibe) + differ(s.token, start.token) + differ(s.point, start.point) + differ(s.flux, start.flux) === 0

  // the frame change
  const { frame, links } = frameOf(knit)
  const gauged = withLinks(knit, links)
  const gaugeRoles = (state: CombinedState): Int8Array => Int8Array.from(rolesOf(state), (p, i) => moves.act[frame[Math.floor(i / 24)] ?? moves.identity]?.[p] ?? 0)
  const second = golden(slots, 2.11)
  let a = combinedState(knit, { ...second, flux })
  let b = combinedState(gauged, { vibe: second.vibe, point: gaugeRoles(a), flux })
  let frameMismatch = 0

  for (let t = 0; t < 24; t++) {
    a = combinedBeat(knit, a, none, t).state
    b = combinedBeat(gauged, b, none, t).state
    frameMismatch += differ(gaugeRoles(a), rolesOf(b)) + differ(a.vibe, b.vibe)
  }

  return {
    boxReverses: reverses ? 1 : 0,
    boxChargeKept: chargeKept ? 1 : 0,
    boxColorLeaks: leaks,
    boxFrameMismatch: frameMismatch,
    pDrift,
    lineMomentumDrift: lineDrift,
    lineMomentumSumDrift: lineSumDrift,
    openingTokensChangesClassical: openChanges,
  }
}

// the steered knit's vacuum period with its flux, and its dressing at side 7, run on the whole box
function steeredBoxBattery(spec: CombinedKnitSpec): { period: number; vibePeriod: number; love: number[]; fear: number[] } {
  const vacKnit = makeCombinedKnit({ side: 7, spec })
  const slots7 = vacKnit.weave.mesh.cellCount * 24
  const none = new Uint8Array(slots7)
  const empty = combinedState(vacKnit, { vibe: new Int8Array(slots7), point: new Int8Array(slots7) })
  const states: CombinedState[] = [empty]

  for (let t = 0; t < VACUUM_BEATS; t++) {
    states.push(combinedBeat(vacKnit, states[t] ?? empty, none, t).state)
  }

  const periodOf = (withFlux: boolean): number => {
    for (let p = 1; p <= LONGEST_PERIOD; p++) {
      if (
        states.every(
          (s, t) =>
            t + p >= states.length ||
            (differ(s.vibe, states[t + p]?.vibe ?? s.vibe) === 0 && (!withFlux || differ(s.flux, states[t + p]?.flux ?? s.flux) === 0)),
        )
      ) {
        return p
      }
    }

    return 0
  }

  const middle = Math.floor(STEER_DRESSING_SIDE / 2)
  const center = middle * (1 + 7 + 49 + 343)
  const dressed = (tone: number): number[] => {
    const largest = [0, 0, 0, 0]

    for (let direction = 0; direction < 24; direction++) {
      const vibe = new Int8Array(slots7)

      vibe[center * 24 + direction] = tone

      let seeded = combinedState(vacKnit, { vibe, point: new Int8Array(slots7) })

      for (let t = 0; t < STEER_DRESSING_BEATS; t++) {
        seeded = combinedBeat(vacKnit, seeded, none, t).state

        const p = Math.floor(t / 24)

        largest[p] = Math.max(largest[p] ?? 0, differ(seeded.vibe, states[t + 1]?.vibe ?? seeded.vibe))
      }
    }

    return largest
  }

  return { period: periodOf(true), vibePeriod: periodOf(false), love: dressed(1), fear: dressed(-1) }
}

// the empty vacuum's period searched up to 72 beats over 216 (weave-acceptance's looks only up to 24); the
// vacuum is the same in every dock, so one dock's collision history is the whole of it
function longVacuumPeriod(spec: CombinedKnitSpec): number {
  const knit = makeCombinedKnit({ side: QSIDE, spec })
  const forward = combinedCollision({ spec, opposite: knit.weave.opposite })
  const cells = vacuumCells({ forward, beats: 3 * LONGEST_PERIOD })
  const states = ['1'.repeat(24), ...cells.map(c => Array.from(c, x => x + 1).join(''))]

  for (let p = 1; p <= LONGEST_PERIOD; p++) {
    if (states.every((x, t) => t + p >= states.length || x === states[t + p])) {
      return p
    }
  }

  return 0
}

// E-QTM-0109's helpers
const readingOf = (i: number): number => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3)

function basisWhole(tokens: readonly number[], digits: readonly number[]): Whole {
  const weight = new Array<bigint>(9 ** tokens.length).fill(0n)

  for (let i = 0; i < weight.length; i++) {
    weight[i] = tokens.every((_, c) => Math.floor((Math.floor(i / 9 ** (tokens.length - 1 - c)) % 9) / 3) === digits[c]) ? 1n : 0n
  }

  return { tokens, weight }
}

function dephase(whole: Whole): Whole {
  const role = new Array<bigint>(9).fill(0n)

  whole.weight.forEach((w, i) => {
    role[readingOf(i)] = (role[readingOf(i)] ?? 0n) + w
  })

  // the frames are dropped, the own points kept (the comoving beat reads them, E-SPN-0063's dephasing)
  return { tokens: whole.tokens, weight: whole.weight.map((_, i) => role[readingOf(i)] ?? 0n), ...(whole.own ? { own: whole.own } : {}) }
}

const chance = (whole: Whole, reading: number): number =>
  Number(whole.weight.reduce((s, w, i) => (readingOf(i) === reading ? s + w : s), 0n)) / Number(wholeUnits(whole))

const native = (whole: Whole): Whole => ({
  tokens: whole.tokens,
  weight: whole.weight.map((_, i) => whole.weight[Math.floor(i / 9) * 9 + (CONJUGATE_POINT[i % 9] ?? 0)] ?? 0n),
})

type QuantumGates = Record<string, boolean>

// E-QTM-0109's gates on one configuration, for the kernels given (the fear beat on or off)
function quantum(spec: CombinedKnitSpec, mode: 'on' | 'off'): { gates: QuantumGates; metrics: Record<string, number> } {
  const knit = makeCombinedKnit({ side: QSIDE, spec })
  const { mesh, moves, opposite } = knit.weave
  const weave = knit.weave
  const slots = mesh.cellCount * 24
  const flat = withLinks(knit, new Int16Array(slots).fill(moves.identity))
  const kernels = fearKernels({ like: mode === 'on' ? OMEGA : 0, unlike: mode === 'on' ? OMEGA : 0, likeExchanged: false })!
  const back = fearKernels({ like: mode === 'on' ? -OMEGA : 0, unlike: mode === 'on' ? -OMEGA : 0, likeExchanged: false })!
  const off = fearKernels({ like: 0, unlike: 0, likeExchanged: false })!
  const on = fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: false })!
  const swapControl: FearKernels = { ...on, unlike: conjugateSecond(wholeKernel(swapPhase(OMEGA), 1000)?.kernel ?? []), unlikeDivisor: 4 }
  const side = Array.from({ length: 24 }, (_, d) => (d < (opposite[d] ?? d) ? 1 : -1))
  const openOf = (tokens: readonly number[]): Uint8Array => {
    const open = new Uint8Array(slots)

    for (const t of tokens) {
      open[t] = 1
    }

    return open
  }
  const vacuum = { vibe: new Int8Array(slots), point: new Int8Array(slots) }
  const matter = golden(slots, MATTER_SCALE)
  const recordsOf = (background: { vibe: Int8Array; point: Int8Array }, k: CombinedKnit, open: Uint8Array, beats: number): BeatRecord[] => {
    let state = combinedState(k, background)
    const out: BeatRecord[] = []

    for (let t = 0; t < beats; t++) {
      const r = combinedBeat(k, state, open, t)

      state = r.state
      out.push(r.record)
    }

    return out
  }

  // the vacuum pair, the matter pair and the grower, found as E-QTM-0109 finds them
  let vacuumPair: number[] = []

  for (let d = 0; d < 24 && vacuumPair.length === 0; d++) {
    const o = opposite[d] ?? d

    if (o > d && recordsOf(vacuum, knit, openOf([d, o]), 24).some(r => r.meetings.length > 0)) {
      vacuumPair = [d, o]
    }
  }

  const dock0 = openOf(Array.from({ length: 24 }, (_, s) => s))
  const counts = new Map<string, number>()
  const dockRecords = recordsOf(matter, knit, dock0, SEARCH_BEATS)

  for (const r of dockRecords) {
    for (const [a, b] of r.meetings) {
      const key = `${Math.min(a, b)},${Math.max(a, b)}`

      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  const ranked = [...counts.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).map(([k]) => k.split(',').map(Number))
  const matterPair = ranked[0] ?? [0, 1]
  const signOfToken = (vibe: Int8Array, tk: number): number => (vibe[tk] ?? 0) || (side[tk % 24] ?? 1)

  // sign flips of every dock-0 token
  let dockFlips = 0

  {
    const last = new Map<number, number>(Array.from({ length: 24 }, (_, tk) => [tk, signOfToken(matter.vibe, tk)]))

    for (const r of dockRecords) {
      r.meetings.forEach(([ta, tb], k) => {
        const [sa, sb] = r.signs?.[k] ?? [1, 1]

        dockFlips += (last.get(ta) === sa ? 0 : 1) + (last.get(tb) === sb ? 0 : 1)
        last.set(ta, sa)
        last.set(tb, sb)
      })
    }
  }

  const study = (background: { vibe: Int8Array; point: Int8Array }, tokens: number[], start: Whole) => {
    const records = recordsOf(background, knit, openOf(tokens), Q_BEATS)
    let whole: Whole = start
    let pure = true
    let fearsMax = 0n
    let shareMax = 0
    let top = wholeUnits(start)

    for (const record of records) {
      whole = advanceWhole({ weave, whole, record, kernel4: [], color: kernels, fixed: false, forward: true })!

      const units = wholeUnits(whole)

      pure = pure && 81n * whole.weight.reduce((s, w) => s + w * w, 0n) === 9n * units * units
      top = units > top ? units : top

      if (record.meetings.length > 0) {
        const { loves, fears } = wholeLovesAndFears(whole)

        fearsMax = fears > fearsMax ? fears : fearsMax
        shareMax = Math.max(shareMax, Number(fears) / Number(loves + fears))
      }
    }

    const power = (p: bigint): number => {
      let u = top
      let k = 0

      while (u % p === 0n && u > 0n) {
        u /= p
        k++
      }

      return k
    }

    return { records, pure, fearsMax: Number(fearsMax), shareMax, twos: power(2n), threes: power(3n) }
  }

  const vacuumStudy = study(vacuum, vacuumPair, basisWhole(vacuumPair, [0, 0]))
  const matterStudy = study(matter, matterPair, basisWhole(matterPair, [0, 1]))
  // the grower is chosen with the fear beat on, so both modes study the same pair
  const growerPair = ranked
    .slice(0, 12)
    .map(pair => {
      const records = recordsOf(matter, knit, openOf(pair), Q_BEATS)
      let whole = basisWhole(pair, [0, 1])
      let top = wholeUnits(whole)

      for (const record of records) {
        whole = advanceWhole({ weave, whole, record, kernel4: [], color: on, fixed: false, forward: true })!
        top = wholeUnits(whole) > top ? wholeUnits(whole) : top
      }

      let score = 0

      for (const p of [2n, 3n]) {
        let u = top

        while (u % p === 0n && u > 0n) {
          u /= p
          score++
        }
      }

      return { pair, score }
    })
    .reduce((best, c) => (c.score > best.score ? c : best), { pair: matterPair, score: -1 }).pair
  const growerStudy = study(matter, growerPair, basisWhole(growerPair, [0, 1]))

  // reversal and love minus fear on the matter pair, fixed units
  let reverses = false
  let chargeKept = true

  {
    const units = 9n * 4n ** 200n * 3n ** 200n
    const open = openOf(matterPair)
    const start = combinedState(knit, matter)
    const whole0: Whole = { tokens: matterPair, weight: basisWhole(matterPair, [2, 0]).weight.map(w => w * (units / 9n)) }
    let state = start
    let whole: Whole | null = whole0

    for (let t = 0; t < REVERSAL_BEATS; t++) {
      const r = combinedBeat(knit, state, open, t)

      state = r.state
      whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: [], color: kernels, fixed: true, forward: true }) : null
      chargeKept = chargeKept && whole !== null && wholeUnits(whole) === units
    }

    for (let t = REVERSAL_BEATS - 1; t >= 0; t--) {
      const r = combinedBeatBack(knit, state, open, t)

      state = r.state
      whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: [], color: back, fixed: true, forward: false }) : null
    }

    reverses =
      whole !== null &&
      whole.weight.every((w, i) => w === whole0.weight[i]) &&
      differ(state.token, start.token) === 0 &&
      differ(state.vibe, start.vibe) === 0
  }

  // the frame change on the vacuum and matter pairs
  const { frame, links: gaugeLinks } = frameOf(knit)
  const gauged = withLinks(knit, gaugeLinks)
  // every coordinate moved by its dock's frame, and its own point with it (the comoving beat reads the own
  // points, so they are part of the state the frame change acts on)
  const transform = (state: CombinedState, whole: Whole): Whole => {
    const at = new Map<number, number>()

    state.token.forEach((tk, s) => at.set(tk, Math.floor(s / 24)))

    let moved = whole
    const own = whole.own ? [...whole.own] : new Array<number>(whole.tokens.length).fill(0)

    whole.tokens.forEach((tk, c) => {
      const table = moves.act[frame[at.get(tk) ?? 0] ?? moves.identity] ?? []

      moved = moveCoordinate(moved, c, table)
      own[c] = phasePermOf(table)[own[c] ?? 0] ?? 0
    })

    return { ...moved, own }
  }
  const frameMismatch = (background: { vibe: Int8Array; point: Int8Array }, tokens: number[], k: FearKernels, start: Whole): number => {
    const open = openOf(tokens)
    let a = { state: combinedState(knit, background), whole: start }
    let b = { state: combinedState(gauged, background), whole: transform(a.state, start) }
    let mismatch = 0

    for (let t = 0; t < GAUGE_BEATS; t++) {
      const ra = combinedBeat(knit, a.state, open, t)
      const rb = combinedBeat(gauged, b.state, open, t)

      a = { state: ra.state, whole: advanceWhole({ weave, whole: a.whole, record: ra.record, kernel4: [], color: k, fixed: false, forward: true })! }
      b = { state: rb.state, whole: advanceWhole({ weave, whole: b.whole, record: rb.record, kernel4: [], color: k, fixed: false, forward: true })! }

      const expected = reduceWhole(transform(a.state, a.whole)).weight
      const actual = reduceWhole(b.whole).weight

      mismatch += expected.reduce((n, w, i) => n + (w === actual[i] ? 0 : 1), 0)
    }

    return mismatch
  }
  const frameVacuum = frameMismatch(vacuum, vacuumPair, kernels, basisWhole(vacuumPair, [0, 0]))
  const frameMatter = frameMismatch(matter, matterPair, kernels, basisWhole(matterPair, [0, 1]))
  const frameControl = frameMismatch(vacuum, vacuumPair, swapControl, basisWhole(vacuumPair, [0, 0]))

  // interference on flat links, CHSH on live links
  const flatRecords = recordsOf(vacuum, flat, openOf(vacuumPair), 60)
  const chances = (k: FearKernels, dephased: boolean): number[] => {
    let whole = basisWhole(vacuumPair, [0, 0])
    const out: number[] = []

    for (const record of flatRecords) {
      whole = advanceWhole({ weave, whole, record, kernel4: [], color: k, fixed: false, forward: true })!

      if (record.meetings.length > 0 && out.length < 3) {
        whole = dephased ? dephase(whole) : whole
        out.push(chance(whole, 0))
      }
    }

    return out
  }
  const quantumChances = chances(kernels, false)
  const standIn = chances(kernels, true)
  const fearOff = chances(off, false)
  const liveRecords = vacuumStudy.records
  const firstMeeting = liveRecords.findIndex(r => r.meetings.length > 0)
  const readState = (k: FearKernels, dephased: boolean): Whole => {
    let whole = basisWhole(vacuumPair, [0, 0])

    for (let t = 0; t <= firstMeeting + 1 && t < liveRecords.length; t++) {
      const record = liveRecords[t]!

      whole = advanceWhole({ weave, whole, record, kernel4: [], color: k, fixed: false, forward: true })!
      whole = dephased && record.meetings.length > 0 ? dephase(whole) : whole
    }

    return whole
  }
  const bell = firstMeeting >= 0 ? roleChsh(roleDensity(native(readState(kernels, false)))) : 0
  const bellStandIn = firstMeeting >= 0 ? roleChsh(roleDensity(native(readState(kernels, true)))) : 0

  // the calm-difference storage times omega^q
  const unital = [kernels, back].every(
    k => kernelIsUnital(k.like, k.likeDivisor) && kernelKeepsWeight(k.like, k.likeDivisor) && kernelIsUnital(k.unlike, k.unlikeDivisor) && kernelKeepsWeight(k.unlike, k.unlikeDivisor),
  )
  const storage = (background: { vibe: Int8Array; point: Int8Array }, tokens: number[], start: Whole): { q: number; mismatches: number } => {
    const records = recordsOf(background, knit, openOf(tokens), Q_BEATS)
    const q = tokens.reduce((s, tk) => s + signOfToken(background.vibe, tk), 0)
    const scale = 4n ** 200n * 3n ** 200n
    const d0 = departureOf(start)
    let plain: Whole = start
    let delta: Whole = { tokens, weight: d0.delta.map(x => x * scale) }
    const stored0 = timesOmega(delta.weight, delta.weight.map(() => 0n), q)
    let re: Whole = { tokens, weight: stored0.re }
    let om: Whole = { tokens, weight: stored0.om }
    const units = d0.units * scale
    let mismatches = 0

    for (const record of records) {
      plain = advanceWhole({ weave, whole: plain, record, kernel4: [], color: kernels, fixed: false, forward: true })!
      delta = advanceWhole({ weave, whole: delta, record, kernel4: [], color: kernels, fixed: true, forward: true })!
      re = advanceWhole({ weave, whole: re, record, kernel4: [], color: kernels, fixed: true, forward: true })!
      om = advanceWhole({ weave, whole: om, record, kernel4: [], color: kernels, fixed: true, forward: true })!

      const read = timesOmega(re.weight, om.weight, -q)
      const readsBack = read.om.every(x => x === 0n) && read.re.every((x, i) => x === delta.weight[i])
      const direct: Departure = reduceDeparture({ tokens, delta: delta.weight, units })
      const fromPlain = departureOf(plain)
      const same = direct.units === fromPlain.units && direct.delta.every((x, i) => x === fromPlain.delta[i])
      const balanced = delta.weight.reduce((s, x) => s + x, 0n) === 0n
      const purity = 81n * delta.weight.reduce((s, x) => s + x * x, 0n) === 8n * units * units
      const c = departureChances(direct)
      const plainUnits = wholeUnits(plain)
      const chancesSame = c.numerator.every((n, reading) => n * plainUnits === plain.weight.reduce((s, w, i) => (readingOf(i) === reading ? s + w : s), 0n) * c.denominator)

      mismatches += (readsBack ? 0 : 1) + (same ? 0 : 1) + (balanced ? 0 : 1) + (purity ? 0 : 1) + (chancesSame ? 0 : 1)
    }

    return { q, mismatches }
  }
  const storedVacuum = storage(vacuum, vacuumPair, basisWhole(vacuumPair, [0, 0]))
  const storedMatter = storage(matter, matterPair, basisWhole(matterPair, [0, 1]))
  const storedGrower = storage(matter, growerPair, basisWhole(growerPair, [0, 1]))

  // the committed table's flips, the control
  const committedFlips = (() => {
    const w = makeColorWeave({ side: QSIDE, table: 'pair' })
    let lattice = makeLattice(matter)
    const last = new Map<number, number>(Array.from({ length: 24 }, (_, tk) => [tk, signOfToken(matter.vibe, tk)]))
    let flips = 0

    for (let t = 0; t < SEARCH_BEATS; t++) {
      const r = fearBeat({ weave: w, links: w.links, lattice, open: dock0, t })

      lattice = r.lattice
      r.record.meetings.forEach(([ta, tb], k) => {
        const [sa, sb] = r.record.signs?.[k] ?? [1, 1]

        flips += (last.get(ta) === sa ? 0 : 1) + (last.get(tb) === sb ? 0 : 1)
        last.set(ta, sa)
        last.set(tb, sb)
      })
    }

    return flips
  })()

  const exact = (x: number, y: number): boolean => Math.abs(x - y) < 1e-12
  const knots = [vacuumStudy, matterStudy, growerStudy]
  const gates: QuantumGates = {
    tokenSignsKept: dockFlips === 0,
    knotsPure: knots.every(s => s.pure),
    fearShareUnderThird: knots.every(s => s.shareMax <= 1 / 3 + 1e-12),
    fearsMade: knots.some(s => s.fearsMax > 0),
    reversesInFixedUnits: reverses,
    loveMinusFearKept: chargeKept,
    frameCommutesVacuum: frameVacuum === 0,
    frameCommutesMatter: frameMatter === 0,
    storageVacuum: storedVacuum.mismatches === 0,
    storageMatter: storedMatter.mismatches === 0,
    storageGrower: storedGrower.mismatches === 0 && storedGrower.q !== 0,
    kernelsUnital: unital,
    interferenceBeyondStandIn: quantumChances.length === 3 && quantumChances.some((c, k) => !exact(c, standIn[k] ?? -1)),
    chshAbove2: bell > 2 + 1e-6,
  }
  const controlsHold =
    committedFlips > 0 && frameControl > 0 && fearOff.length === 3 && fearOff.every(c => c === 1) && bellStandIn <= 2 + 1e-9

  return {
    gates,
    metrics: {
      controlsHold: controlsHold ? 1 : 0,
      vacuumPairFirst: vacuumPair[0] ?? -1,
      vacuumPairSecond: vacuumPair[1] ?? -1,
      matterPairFirst: matterPair[0] ?? -1,
      matterPairSecond: matterPair[1] ?? -1,
      growerFirst: growerPair[0] ?? -1,
      growerSecond: growerPair[1] ?? -1,
      dockSignFlips: dockFlips,
      fearsMaxVacuum: vacuumStudy.fearsMax,
      fearsMaxMatter: matterStudy.fearsMax,
      fearsMaxGrower: growerStudy.fearsMax,
      fearShareMax: Math.max(...knots.map(s => s.shareMax)),
      growerUnitsPowerOf2: growerStudy.twos,
      growerUnitsPowerOf3: growerStudy.threes,
      frameMismatchVacuum: frameVacuum,
      frameMismatchMatter: frameMatter,
      chanceAfterMeeting1: quantumChances[0] ?? -1,
      chanceAfterMeeting2: quantumChances[1] ?? -1,
      chanceAfterMeeting3: quantumChances[2] ?? -1,
      standInChance1: standIn[0] ?? -1,
      standInChance2: standIn[1] ?? -1,
      standInChance3: standIn[2] ?? -1,
      chsh: bell,
      chshStandIn: bellStandIn,
      storedVacuumMismatches: storedVacuum.mismatches,
      storedMatterMismatches: storedMatter.mismatches,
      storedGrowerMismatches: storedGrower.mismatches,
      storedGrowerCharge: storedGrower.q,
      committedTableSignFlips: committedFlips,
      frameMismatchSwapAtLoveFear: frameControl,
    },
  }
}

// per period: prefixPeriod1 .. prefixPeriod4
const periods = (prefix: string, xs: readonly number[]): Record<string, number> =>
  Object.fromEntries(xs.map((x, p) => [`${prefix}Period${p + 1}`, x]))

const flatten = (prefix: string, record: Record<string, number | boolean>): Record<string, number> =>
  Object.fromEntries(Object.entries(record).map(([k, v]) => [`${prefix}_${k}`, typeof v === 'boolean' ? (v ? 1 : 0) : v]))

export default experiment({
  id: 'gauge/combined-knit-battery',
  code: 'E-FRC-0159',
  title:
    'the combined knit through every battery, with the fear beat off and on and with and without the fold: the head-on turn base with the scatter block, unfolded, folded, and folded with lone steering, against the E-FRC-0136 dressing gates, the momentum gates, the color leaks, the E-QTM-0109 quantum gates and the full E-FRC-0149 characterization, with the gates that fail only with the fear beat on listed',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // the committed reference
    const committedRule: ScheduledRule = (opposite, forward) => turningWeave({ opposite, forward, table: 'pair' })
    const committed = acceptance(committedRule)
    const committedSides = SIDES.map(side => ({ side, love: dressing(committedRule, { side, tone: 1 }), fear: dressing(committedRule, { side, tone: -1 }) }))

    log('committed')

    // classical gates per configuration (fear-independent: the classical layer never reads the whole, and
    // boxGates measures that per configuration as openingTokensChangesClassical)
    const classical = CONFIGS.map(({ name, spec }): { name: string; gates: Record<string, boolean>; numbers: Record<string, number> } => {
      const box = boxGates(spec)

      if (spec.steer) {
        const steered = steeredBoxBattery(spec)
        const side7 = committedSides.find(s => s.side === STEER_DRESSING_SIDE)
        const dressedNoMore =
          steered.love.every((x, p) => x <= (side7?.love.periodLargest[p] ?? 0)) && steered.fear.every((x, p) => x <= (side7?.fear.periodLargest[p] ?? 0))
        const gates: Record<string, boolean> = {
          boxReverses: box.boxReverses === 1,
          boxChargeKept: box.boxChargeKept === 1,
          noColorLeak: box.boxColorLeaks === 0,
          frameCommutes: box.boxFrameMismatch === 0,
          momentumKept: box.pDrift === 0,
          lineMomentaExchanged: (box.lineMomentumDrift ?? 0) > 0,
          vacuumPeriodic: steered.period > 0,
          dressingSide7NoMore: dressedNoMore,
        }

        log(`classical ${name}`)

        return { name, gates, numbers: { ...box, vacuumPeriodWithFlux: steered.period, vacuumPeriodVibes: steered.vibePeriod, ...periods('side7Love', steered.love), ...periods('side7Fear', steered.fear) } }
      }

      const rule = ruleOf(spec)
      const battery: Acceptance = acceptance(rule)
      const sides = SIDES.map(side => ({ side, love: dressing(rule, { side, tone: 1 }), fear: dressing(rule, { side, tone: -1 }) }))
      const noMore = (a: Dressing, b: Dressing | undefined): boolean => a.periodLargest.every((x, p) => x <= (b?.periodLargest[p] ?? 0))
      const gates: Record<string, boolean> = {
        reverses: battery.reverses || !committed.reverses,
        chargeKept: battery.chargeKept || !committed.chargeKept,
        cptAtMirrorPhase: battery.cptPhase >= 0 || committed.cptPhase < 0,
        vacuumPeriodic: battery.vacuumPeriod > 0 || committed.vacuumPeriod <= 0,
        vacuumComponentsNoMore: battery.vacuumComponents <= committed.vacuumComponents,
        denseComponentsNoMore: battery.denseComponents <= committed.denseComponents,
        superposition: battery.additivityWorst < 1e-9 || committed.additivityWorst >= 1e-9,
        wallsQuantized: (battery.wallQuantized && battery.wallMax > 0) || !(committed.wallQuantized && committed.wallMax > 0),
        loveDressingSide9: noMore(battery.love, committed.love),
        fearDressingSide9: noMore(battery.fear, committed.fear),
        ...Object.fromEntries(
          sides.flatMap(s => {
            const ref = committedSides.find(r => r.side === s.side)

            return [
              [`loveDressingSide${s.side}`, noMore(s.love, ref?.love)],
              [`fearDressingSide${s.side}`, noMore(s.fear, ref?.fear)],
            ]
          }),
        ),
        boxReverses: box.boxReverses === 1,
        boxChargeKept: box.boxChargeKept === 1,
        noColorLeak: box.boxColorLeaks === 0,
        frameCommutes: box.boxFrameMismatch === 0,
        momentumKept: box.pDrift === 0,
        lineMomentaExchanged: (box.lineMomentumDrift ?? 0) > 0,
      }

      log(`classical ${name}`)

      return {
        name,
        gates,
        numbers: {
          ...box,
          reverses: battery.reverses ? 1 : 0,
          cptMirrorPhase: battery.cptPhase,
          vacuumPeriod: battery.vacuumPeriod,
          vacuumPeriodUpTo72: longVacuumPeriod(spec),
          vacuumComponents: battery.vacuumComponents,
          denseComponents: battery.denseComponents,
          additivityWorst: battery.additivityWorst,
          wallQuantized: battery.wallQuantized ? 1 : 0,
          wallSettledMax: battery.wallMax,
          travellers: battery.travellers,
          ...periods('side9Love', battery.love.periodLargest),
          ...periods('side9Fear', battery.fear.periodLargest),
          ...Object.fromEntries(
            sides.flatMap(s => [
              ...Object.entries(periods(`side${s.side}Love`, s.love.periodLargest)),
              ...Object.entries(periods(`side${s.side}Fear`, s.fear.periodLargest)),
            ]),
          ),
        },
      }
    })

    // the quantum gates, fear beat off and on
    const quantumRuns = CONFIGS.map(({ name, spec }) => {
      const off = quantum(spec, 'off')

      log(`quantum ${name} off`)

      const on = quantum(spec, 'on')

      log(`quantum ${name} on`)

      return { name, off, on }
    })

    // the characterization, reported
    const knits = [
      ...REFERENCE_KNITS,
      ...CONFIGS.filter(c => !c.spec.steer).map(c => ({ name: c.name, schedule: scheduleOf(c.spec), rule: ruleOf(c.spec) })),
    ]
    const profiles: { name: string; profile: Profile }[] = knits.map(k => {
      const profile = characterizeKnit(k)

      log(`characterized ${k.name}`)

      return { name: k.name, profile }
    })
    const committedProfile = profiles.find(p => p.name === 'committed')?.profile ?? {}

    // the adoption rule
    const failsOnlyOn: string[] = []
    const gainedOn: string[] = []
    const quantumOnFails: string[] = []

    for (const run of quantumRuns) {
      for (const [gate, passOn] of Object.entries(run.on.gates)) {
        const passOff = run.off.gates[gate] ?? false

        if (passOff && !passOn) {
          failsOnlyOn.push(`${run.name}:${gate}`)
        }

        if (!passOff && passOn) {
          gainedOn.push(`${run.name}:${gate}`)
        }

        if (!passOn) {
          quantumOnFails.push(`${run.name}:${gate}`)
        }
      }
    }

    // the classical layer is the same with the fear beat on or off, measured per configuration
    const classicalBlind = classical.every(c => (c.numbers.openingTokensChangesClassical ?? 1) === 0)
    const fearBeatWorks = classicalBlind && failsOnlyOn.length === 0 && quantumOnFails.length === 0
    const controls =
      committedNumbersReproduced(committedProfile) && quantumRuns.every(r => r.on.metrics.controlsHold === 1 && r.off.metrics.controlsHold === 1)
    const classicalFails = classical.flatMap(c => Object.entries(c.gates).filter(([, pass]) => !pass).map(([gate]) => `${c.name}:${gate}`))

    return verdict({
      status: controls && fearBeatWorks ? 'pass' : 'fail',
      claim: `by the rule registered before the run, the fear beat ${fearBeatWorks ? 'works' : 'does not work'} with the combined knit: ${failsOnlyOn.length} gates fail only with it on, ${quantumOnFails.length} quantum gates fail with it on, and the classical layer is ${classicalBlind ? 'the same' : 'not the same'} with it on and off on every configuration; the base's own classical gates fail at ${classicalFails.length} places, listed, which decide the base and not the fear beat`,
      metrics: {
        fearBeatWorks: fearBeatWorks ? 1 : 0,
        failsOnlyWithFearOn: failsOnlyOn.length,
        quantumGatesFailingWithFearOn: quantumOnFails.length,
        gainedWithFearOn: gainedOn.length,
        classicalLayerBlindToFear: classicalBlind ? 1 : 0,
        classicalGateFailures: classicalFails.length,
        ...Object.fromEntries(classical.flatMap(c => [...Object.entries(flatten(`${c.name}_gate`, c.gates)), ...Object.entries(flatten(c.name, c.numbers))])),
        ...Object.fromEntries(
          quantumRuns.flatMap(r => [
            ...Object.entries(flatten(`${r.name}_on_gate`, r.on.gates)),
            ...Object.entries(flatten(`${r.name}_off_gate`, r.off.gates)),
            ...Object.entries(flatten(`${r.name}_on`, r.on.metrics)),
            ...Object.entries(flatten(`${r.name}_off`, r.off.metrics)),
          ]),
        ),
        ...Object.fromEntries(profiles.filter(p => p.name === 'H' || p.name === 'HF').flatMap(p => Object.entries(flatten(p.name, p.profile)))),
      },
      control: {
        committedNumbersReproduced: committedNumbersReproduced(committedProfile) ? 1 : 0,
        ...periods('committedSide9Love', committed.love.periodLargest),
        ...periods('committedSide9Fear', committed.fear.periodLargest),
        ...Object.fromEntries(
          committedSides.flatMap(s => [
            ...Object.entries(periods(`committedSide${s.side}Love`, s.love.periodLargest)),
            ...Object.entries(periods(`committedSide${s.side}Fear`, s.fear.periodLargest)),
          ]),
        ),
        ...Object.fromEntries(profiles.filter(p => p.name !== 'H' && p.name !== 'HF').flatMap(p => Object.entries(flatten(p.name, p.profile)))),
      },
      notes: `L2, exact, no random numbers. Fails only with the fear beat on: ${failsOnlyOn.join(', ') || 'none'}. Quantum gates failing with it on: ${quantumOnFails.join(', ') || 'none'}. Gained with it on (fail off, pass on): ${gainedOn.join(', ') || 'none'}. The base's classical gate failures: ${classicalFails.join(', ') || 'none'}. The classical gates are the same with the fear beat on or off because the classical layer never reads the whole, measured here on every configuration (openingTokensChangesClassical 0 means opening every token changed no vibe, token or flux in 48 beats) and in E-FRC-0158. The fold is not chosen here: its choice waits on the isotropy measurements of E-RLT-0047 and E-RLT-0048. Steering reads the flux, so HFL has no dock-level collision: its gates are the box-level ones, its dressing is measured densely at side 7 only, and its CPT is E-FRC-0156's question (lone steering loses full-box CPT there). The kick law on the new base and the rest of the characterization are the H_ and HF_ metrics, beside the committed rule, A (chosen_) and B (runnerUp_) in the control block.`,
    })
  },
})
