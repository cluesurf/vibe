// The comoving fear beat (E-SPN-0062, the fear beat read in each token's own frame) through the battery the user's
// adoption condition names: E-FRC-0159's, gate for gate, on the combined knit (code/rule/combined-knit).
//
// STATUS (2026-09-26, E-MTH-0028): fail at the default integer link start (E-MTH-0027) on its frame control alone,
// pass on 11 of 17 starts of the start family. Each failing start (integer+0, 4, 6, 7, 9, 12) is one where the vacuum
// pair makes no fear and the frame control reads 0 in both paired columns: uninformative, not a failure. Paired on
// the same start, the comoving beat adds no quantum-gate failure against the fear-off column or the fixed-frame beat
// on any of the 17, and gains CHSH above 2 on HF and HFL at 4.
//
// The user adopted the fear beat into the knit "if it works with everything" (tmp/integration.md, E-FRC-0158 and
// 0159). E-SPN-0062 found that reading each meeting in the tokens' own frames makes the role's fermion number
// exact on live links, is covariant under all 648 frame changes, and is the model's beat on pure-gauge links. That
// was measured in the grain mode on the committed color weave. The knit runs the COLOR mode (the swap phase at
// like meetings, the singlet phase at love-fear meetings with the fear's coordinate at the reflected point, and
// E-QTM-0123's frames). So the change is made to that law (code/rule/comoving-weave advanceComoving) and the
// comoving beat is run through the same battery.
//
// WHAT IS RUN AND WHAT IS CARRIED OVER. Every classical gate of E-FRC-0159 (dressing, vacuum period, components,
// walls, superposition, CPT, momentum, color leaks, box reversal, frame change of the vibes) and the whole
// E-FRC-0149 characterization are properties of combinedBeat, which takes no kernel: the whole never enters the
// classical layer, so those gates are the same numbers under any fear law. They are carried over from E-FRC-0159's
// run (tmp/integration-runs-second/gauge-combined-knit-battery.log) and not rerun. What IS rerun here, beside the
// quantum gates, is the evidence for that: the classical state with every token open and with none, 48 beats, on
// each configuration (0 differences), and, on HFL, Gauss's law for the steered flux beat by beat.
//
// PREDICTIONS, written before any run.
// P1 advanceComoving with the translation off is advanceWhole's color mode, weight for weight and frame for frame.
// P2 Every one of E-FRC-0159's 14 quantum gates passes with the comoving beat on H, HF and HFL: the kernels are
//    Clifford conjugates of the model's (same grain, unital, weight-keeping, invertible), covariant, and the
//    tokens' own points are record data. The numbers that move are the fear counts, the grower's units and CHSH,
//    since the comoving beat differs from the model's wherever the two points differ. On flat links (the
//    interference gate) the points never move, so those three chances are the model's.
// P3 The fermion number: on the studied pairs and E-FRC-0159's twelve most-met dock-0 pairs, the comoving beat
//    keeps m_a + m_b at every like meeting and m_love - m_fear at every love-fear meeting (m a coordinate's weight
//    at its own point over the units) and changes no m on a meeting-free beat, while the model's beat breaks the
//    kept sum at more than 0 meetings on at least one configuration.
// P4 On pure-gauge links the comoving and the model's law give the same whole on every beat.
//
// Gates, fixed before the first run:
// G1 (control) with the translation off, advanceComoving equals advanceWhole on every beat of the vacuum, matter and
//    grower studies of every configuration (0 weight or frame mismatches)
// G2 (the adoption rule, applied to the comoving beat) on H, HF and HFL: no quantum gate fails with the comoving
//    beat that passes with the model's beat on or with the fear beat off, every quantum gate passes with the
//    comoving beat, and E-FRC-0159's controls hold in the comoving runs
// G3 the classical layer is blind to the fear law: opening every token changes no vibe, token or flux over 48 beats
//    on every configuration, the box charge is kept, and on HFL the change of each dock's charge equals the net
//    flux into it on every beat (Gauss's law, 0 violations)
// G4 the fermion number: comoving 0 changes of the kept combination at meetings and 0 changes of any m on
//    meeting-free beats over every pair studied; more than 0 meetings change the fear share under the comoving
//    beat; the model's beat changes the kept combination at more than 0 meetings (control)
// G5 on pure-gauge links, the comoving and the model's law differ on 0 beats (vacuum and matter pairs, every
//    configuration)
// G6 determinism: the whole comoving battery run twice gives identical metrics
//
// Depth L2: a constructed change to a constructed rule, against the registered battery, with the model's beat
// and the fear-off rule as controls.
//
// ADOPTED 2026-09-26 on this result: advanceWhole's default is now the comoving beat, so every "model's beat" run
// here passes `comoving: false` (the fixed-frame beat), and advanceComoving is a thin use of advanceWhole. The
// gates and the three columns are unchanged.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import { HEAD_TURN_SPEC } from '@/code/rule/scatter-weave'
import {
  advanceWhole,
  conjugateSecond,
  CONJUGATE_POINT,
  fearBeat,
  makeLattice,
  moveCoordinate,
  phasePermOf,
  reduceWhole,
  wholeLovesAndFears,
  wholeUnits,
  type BeatRecord,
  type FearKernels,
  type Whole,
} from '@/code/rule/fear-weave'
import { doubledSwapPhase, exactFearKernels, exactWholeKernel } from '@/code/rule/fear-kernel-exact'
import { departureChances, departureOf, kernelIsUnital, kernelKeepsWeight, reduceDeparture, type Departure } from '@/code/rule/calm-weave'
import { timesOmega } from '@/code/rule/signed-knot'
import { makeSteeredKnit } from '@/code/rule/steered-knit'
import { combinedBeat, combinedBeatBack, combinedState, makeCombinedKnit, scheduleOf, type CombinedKnit, type CombinedKnitSpec, type CombinedState } from '@/code/rule/combined-knit'
import { advanceComoving, comovingOf, ownMarginals, type ComovingWhole } from '@/code/rule/comoving-weave'
import { pureGaugeLinks, sameRatio } from '@/code/measure/comoving-parity'
import { denseKnitState } from '@/code/measure/steered-acceptance'
import { roleChsh, roleDensity } from '@/code/measure/role-bell'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const QSIDE = 3
const BOX_BEATS = 48
const SEARCH_BEATS = 240
const Q_BEATS = 480
const REVERSAL_BEATS = 96
const GAUGE_BEATS = 48
const MATTER_SCALE = 2.11
const RANKED_PAIRS = 12

type Mode = 'off' | 'on' | 'comoving'
type Config = { readonly name: string; readonly spec: CombinedKnitSpec }

const CONFIGS: readonly Config[] = [
  { name: 'H', spec: { base: HEAD_TURN_SPEC, fold: false, scatter: true, mirror: 23, steer: false } },
  { name: 'HF', spec: { base: HEAD_TURN_SPEC, fold: true, scatter: true, mirror: 23, steer: false } },
  { name: 'HFL', spec: { base: HEAD_TURN_SPEC, fold: true, scatter: true, mirror: 23, steer: 'lone' } },
]

// E-FRC-0159's classical gate results, carried over (the classical layer takes no kernel): failing gates per
// configuration, from tmp/integration-runs-second/gauge-combined-knit-battery.log
const CARRIED_CLASSICAL_FAILURES = {
  H: ['fearDressingSide9', 'fearDressingSide11'],
  HF: ['vacuumPeriodic', 'vacuumComponentsNoMore', 'loveDressingSide9', 'fearDressingSide9', 'loveDressingSide7', 'fearDressingSide7', 'loveDressingSide11', 'fearDressingSide11'],
  HFL: ['momentumKept', 'dressingSide7NoMore'],
}

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

const readingOf = (i: number): number => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3)

function basisWhole(tokens: readonly number[], digits: readonly number[]): ComovingWhole {
  const weight = new Array<bigint>(9 ** tokens.length).fill(0n)

  for (let i = 0; i < weight.length; i++) {
    weight[i] = tokens.every((_, c) => Math.floor((Math.floor(i / 9 ** (tokens.length - 1 - c)) % 9) / 3) === digits[c]) ? 1n : 0n
  }

  return comovingOf({ tokens, weight })
}

// E-FRC-0159's dephasing, which drops the frames; the own points are kept
function dephase(whole: ComovingWhole): ComovingWhole {
  const role = new Array<bigint>(9).fill(0n)

  whole.weight.forEach((w, i) => {
    role[readingOf(i)] = (role[readingOf(i)] ?? 0n) + w
  })

  return { tokens: whole.tokens, weight: whole.weight.map((_, i) => role[readingOf(i)] ?? 0n), own: whole.own }
}

const chance = (whole: Whole, reading: number): number =>
  Number(whole.weight.reduce((s, w, i) => (readingOf(i) === reading ? s + w : s), 0n)) / Number(wholeUnits(whole))

const native = (whole: Whole): Whole => ({
  tokens: whole.tokens,
  weight: whole.weight.map((_, i) => whole.weight[Math.floor(i / 9) * 9 + (CONJUGATE_POINT[i % 9] ?? 0)] ?? 0n),
})

const sameWhole = (a: Whole | null, b: Whole | null): boolean =>
  !!a && !!b && a.weight.length === b.weight.length && a.weight.every((w, i) => w === b.weight[i]) && (a.frame ?? []).join() === (b.frame ?? []).join()

type Fermion = { meetings: number; kept: number; freeChanges: number; shareChanges: number; pointsDiffer: number; modelBroken: number }

// E-FRC-0159's quantum gates on one configuration, for one fear law, plus this experiment's own measurements
function quantum(spec: CombinedKnitSpec, mode: Mode): { gates: Record<string, boolean>; metrics: Record<string, number>; controlMismatches: number; fermion: Fermion; pureGaugeDifferences: number } {
  const knit = makeCombinedKnit({ side: QSIDE, spec })
  const { mesh, moves, opposite } = knit.weave
  const weave = knit.weave
  const slots = mesh.cellCount * 24
  const flat = withLinks(knit, new Int16Array(slots).fill(moves.identity))
  // the kernels in exact Eisenstein integers, the phases as trits (E-FRC-0206; equal to fearKernels' tables)
  const trit = mode === 'off' ? 0 : 1
  const kernels = exactFearKernels({ like: trit, unlike: trit, likeExchanged: false })
  const back = exactFearKernels({ like: (3 - trit) % 3, unlike: (3 - trit) % 3, likeExchanged: false })
  const off = exactFearKernels({ like: 0, unlike: 0, likeExchanged: false })
  const on = exactFearKernels({ like: 1, unlike: 1, likeExchanged: false })
  const swapExact = exactWholeKernel(doubledSwapPhase(1), 2)
  const swapControl: FearKernels = { ...on, unlike: conjugateSecond(swapExact.kernel), unlikeDivisor: swapExact.divisor }
  const side = Array.from({ length: 24 }, (_, d) => (d < (opposite[d] ?? d) ? 1 : -1))
  // the law under test: the comoving beat, or the model's color mode (on, off)
  const advance = (w: ComovingWhole, record: BeatRecord, k: FearKernels, fixed: boolean, forward: boolean, onWeave = weave): ComovingWhole | null =>
    mode === 'comoving'
      ? advanceComoving({ weave: onWeave, whole: w, record, color: k, fixed, forward, comoving: true })
      : (advanceWhole({ weave: onWeave, whole: w, record, kernel4: [], color: k, fixed, forward, comoving: false }) as ComovingWhole | null)
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

  // G1's control: the translation-off comoving law against advanceWhole, on every study
  let controlMismatches = 0

  const study = (background: { vibe: Int8Array; point: Int8Array }, tokens: number[], start: ComovingWhole) => {
    const records = recordsOf(background, knit, openOf(tokens), Q_BEATS)
    let whole: ComovingWhole = start
    let plain: ComovingWhole | null = start
    let reference: Whole | null = start
    let pure = true
    let fearsMax = 0n
    let shareMax = 0
    let top = wholeUnits(start)

    for (const record of records) {
      whole = advance(whole, record, kernels, false, true)!
      plain = plain ? advanceComoving({ weave, whole: plain, record, color: kernels, fixed: false, forward: true, comoving: false }) : null
      reference = reference ? advanceWhole({ weave, whole: reference, record, kernel4: [], color: kernels, fixed: false, forward: true, comoving: false }) : null
      controlMismatches += sameWhole(plain, reference) ? 0 : 1

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
  // the grower is chosen as E-FRC-0159 chose it, with the model's beat on, so every mode studies the same pair
  const growerPair = ranked
    .slice(0, 12)
    .map(pair => {
      const records = recordsOf(matter, knit, openOf(pair), Q_BEATS)
      let whole: Whole = basisWhole(pair, [0, 1])
      let top = wholeUnits(whole)

      for (const record of records) {
        whole = advanceWhole({ weave, whole, record, kernel4: [], color: on, fixed: false, forward: true, comoving: false })!
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

  let reverses = false
  let chargeKept = true

  {
    const units = 9n * 4n ** 200n * 3n ** 200n
    const open = openOf(matterPair)
    const start = combinedState(knit, matter)
    const whole0: ComovingWhole = comovingOf({ tokens: matterPair, weight: basisWhole(matterPair, [2, 0]).weight.map(w => w * (units / 9n)) })
    let state = start
    let whole: ComovingWhole | null = whole0

    for (let t = 0; t < REVERSAL_BEATS; t++) {
      const r = combinedBeat(knit, state, open, t)

      state = r.state
      whole = whole ? advance(whole, r.record, kernels, true, true) : null
      chargeKept = chargeKept && whole !== null && wholeUnits(whole) === units
    }

    for (let t = REVERSAL_BEATS - 1; t >= 0; t--) {
      const r = combinedBeatBack(knit, state, open, t)

      state = r.state
      whole = whole ? advance(whole, r.record, back, true, false) : null
    }

    reverses =
      whole !== null &&
      whole.weight.every((w, i) => w === whole0.weight[i]) &&
      (mode !== 'comoving' || whole.own.every((p, c) => p === whole0.own[c])) &&
      differ(state.token, start.token) === 0 &&
      differ(state.vibe, start.vibe) === 0
  }

  // the frame change: every coordinate, and its own point, moved by the dock's frame
  const { frame, links: gaugeLinks } = frameOf(knit)
  const gauged = withLinks(knit, gaugeLinks)
  const transform = (state: CombinedState, whole: ComovingWhole): ComovingWhole => {
    const at = new Map<number, number>()

    state.token.forEach((tk, s) => at.set(tk, Math.floor(s / 24)))

    let moved: Whole = whole
    const own = [...whole.own]

    whole.tokens.forEach((tk, c) => {
      const table = moves.act[frame[at.get(tk) ?? 0] ?? moves.identity] ?? []

      moved = moveCoordinate(moved, c, table)
      own[c] = phasePermOf(table)[own[c] ?? 0] ?? 0
    })

    return { ...moved, own }
  }
  const frameMismatch = (background: { vibe: Int8Array; point: Int8Array }, tokens: number[], k: FearKernels, start: ComovingWhole): number => {
    const open = openOf(tokens)
    let a = { state: combinedState(knit, background), whole: start }
    let b = { state: combinedState(gauged, background), whole: transform(a.state, start) }
    let mismatch = 0

    for (let t = 0; t < GAUGE_BEATS; t++) {
      const ra = combinedBeat(knit, a.state, open, t)
      const rb = combinedBeat(gauged, b.state, open, t)

      a = { state: ra.state, whole: advance(a.whole, ra.record, k, false, true)! }
      b = { state: rb.state, whole: advance(b.whole, rb.record, k, false, true, gauged.weave)! }

      const expected = reduceWhole(transform(a.state, a.whole)).weight
      const actual = reduceWhole(b.whole).weight

      mismatch += expected.reduce((n, w, i) => n + (w === actual[i] ? 0 : 1), 0)
    }

    return mismatch
  }
  const frameVacuum = frameMismatch(vacuum, vacuumPair, kernels, basisWhole(vacuumPair, [0, 0]))
  const frameMatter = frameMismatch(matter, matterPair, kernels, basisWhole(matterPair, [0, 1]))
  const frameControl = frameMismatch(vacuum, vacuumPair, swapControl, basisWhole(vacuumPair, [0, 0]))

  const flatRecords = recordsOf(vacuum, flat, openOf(vacuumPair), 60)
  const chances = (k: FearKernels, dephased: boolean): number[] => {
    let whole = basisWhole(vacuumPair, [0, 0])
    const out: number[] = []

    for (const record of flatRecords) {
      whole = advance(whole, record, k, false, true, flat.weave)!

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

      whole = advance(whole, record, k, false, true)!
      whole = dephased && record.meetings.length > 0 ? dephase(whole) : whole
    }

    return whole
  }
  const bell = firstMeeting >= 0 ? roleChsh(roleDensity(native(readState(kernels, false)))) : 0
  const bellStandIn = firstMeeting >= 0 ? roleChsh(roleDensity(native(readState(kernels, true)))) : 0

  const unital = [kernels, back].every(
    k => kernelIsUnital(k.like, k.likeDivisor) && kernelKeepsWeight(k.like, k.likeDivisor) && kernelIsUnital(k.unlike, k.unlikeDivisor) && kernelKeepsWeight(k.unlike, k.unlikeDivisor),
  )
  const storage = (background: { vibe: Int8Array; point: Int8Array }, tokens: number[], start: ComovingWhole): { q: number; mismatches: number } => {
    const records = recordsOf(background, knit, openOf(tokens), Q_BEATS)
    const q = tokens.reduce((s, tk) => s + signOfToken(background.vibe, tk), 0)
    const scale = 4n ** 200n * 3n ** 200n
    const d0 = departureOf(start)
    let plain: ComovingWhole = start
    let delta: ComovingWhole = comovingOf({ tokens, weight: d0.delta.map(x => x * scale) })
    const stored0 = timesOmega(delta.weight, delta.weight.map(() => 0n), q)
    let re: ComovingWhole = comovingOf({ tokens, weight: stored0.re })
    let om: ComovingWhole = comovingOf({ tokens, weight: stored0.om })
    const units = d0.units * scale
    let mismatches = 0

    for (const record of records) {
      plain = advance(plain, record, kernels, false, true)!
      delta = advance(delta, record, kernels, true, true)!
      re = advance(re, record, kernels, true, true)!
      om = advance(om, record, kernels, true, true)!

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

  // the fermion number on the three studies and the twelve most-met pairs, comoving against the model's beat,
  // both read at the tracked own points (the model's run is advanceComoving with the translation off, equal to
  // advanceWhole by G1)
  const fermion: Fermion = { meetings: 0, kept: 0, freeChanges: 0, shareChanges: 0, pointsDiffer: 0, modelBroken: 0 }

  if (mode === 'comoving') {
    const pairs = [vacuumPair, matterPair, growerPair, ...ranked.slice(0, RANKED_PAIRS)]
    const seen = new Set<string>()

    for (const [pi, pair] of pairs.entries()) {
      const key = `${pi === 0 ? 'v' : 'm'}:${pair.join(',')}`

      if (seen.has(key)) {
        continue
      }

      seen.add(key)

      const background = pi === 0 ? vacuum : matter
      const records = recordsOf(background, knit, openOf(pair), Q_BEATS)

      for (const digits of [
        [0, 0],
        [0, 1],
        [2, 1],
      ]) {
        for (const law of [true, false]) {
          let w: ComovingWhole = basisWhole(pair, digits)

          for (const record of records) {
            const before = ownMarginals(w)
            const next = advanceComoving({ weave, whole: w, record, color: kernels, fixed: false, forward: true, comoving: law })!
            const after = ownMarginals(next)
            const meeting = record.meetings[0]

            if (!meeting) {
              if (law) {
                fermion.freeChanges += before.own.every((m, c) => sameRatio(m, before.units, after.own[c] ?? 0n, after.units)) ? 0 : 1
              }
            } else {
              const [sa, sb] = record.signs?.[0] ?? [1, 1]
              const ca = w.tokens.indexOf(meeting[0])
              const cb = w.tokens.indexOf(meeting[1])
              const combine = (r: { own: bigint[] }): bigint =>
                sa === sb ? (r.own[ca] ?? 0n) + (r.own[cb] ?? 0n) : sa > 0 ? (r.own[ca] ?? 0n) - (r.own[cb] ?? 0n) : (r.own[cb] ?? 0n) - (r.own[ca] ?? 0n)
              const kept = sameRatio(combine(before), before.units, combine(after), after.units)

              if (law) {
                fermion.meetings++
                fermion.kept += kept ? 1 : 0

                const reflect = (c: number, s: number): number => {
                  const f = w.frame?.[c] ?? 0

                  return f !== 0 && f !== s ? (CONJUGATE_POINT[w.own[c] ?? 0] ?? 0) : (w.own[c] ?? 0)
                }

                fermion.pointsDiffer += reflect(ca, sa) === reflect(cb, sb) ? 0 : 1

                const share = (x: Whole): number => {
                  const { loves, fears } = wholeLovesAndFears(x)

                  return Number(fears) / Number(loves + fears)
                }

                fermion.shareChanges += Math.abs(share(next) - share(w)) > 1e-12 ? 1 : 0
              } else {
                fermion.modelBroken += kept ? 0 : 1
              }
            }

            w = next
          }
        }
      }
    }
  }

  // pure-gauge links: the comoving and the model's law beat for beat, vacuum and matter pairs
  let pureGaugeDifferences = 0

  if (mode === 'comoving') {
    const gaugeKnit = withLinks(knit, pureGaugeLinks(weave))

    for (const [background, pair, digits] of [
      [vacuum, vacuumPair, [0, 0]],
      [matter, matterPair, [0, 1]],
    ] as const) {
      const records = recordsOf(background, gaugeKnit, openOf(pair), Q_BEATS)
      let a: ComovingWhole = basisWhole(pair, digits)
      let b: Whole = basisWhole(pair, digits)

      for (const record of records) {
        a = advanceComoving({ weave: gaugeKnit.weave, whole: a, record, color: kernels, fixed: false, forward: true, comoving: true })!
        b = advanceWhole({ weave: gaugeKnit.weave, whole: b, record, kernel4: [], color: kernels, fixed: false, forward: true, comoving: false })!
        pureGaugeDifferences += sameWhole(a, b) ? 0 : 1
      }
    }
  }

  const exact = (x: number, y: number): boolean => Math.abs(x - y) < 1e-12
  const knots = [vacuumStudy, matterStudy, growerStudy]
  const gates: Record<string, boolean> = {
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
  const controlsHold = committedFlips > 0 && frameControl > 0 && fearOff.length === 3 && fearOff.every(c => c === 1) && bellStandIn <= 2 + 1e-9

  return {
    gates,
    controlMismatches,
    fermion,
    pureGaugeDifferences,
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

// G3: the classical layer with every token open and with none, the box charge, and Gauss's law on HFL
function classicalBlind(spec: CombinedKnitSpec): { openChanges: number; chargeKept: boolean; gaussViolations: number; gaussChecks: number } {
  const knit = makeCombinedKnit({ side: QSIDE, spec })
  const slots = knit.weave.mesh.cellCount * 24
  const fill = golden(slots, 1.37)
  const steered = knit.steered
  const flux = spec.steer ? denseKnitState(makeSteeredKnit({ side: QSIDE, spec: scheduleOf(spec), steer: spec.steer })).flux : undefined
  const start = combinedState(knit, { ...fill, flux })
  const none = new Uint8Array(slots)
  const all = new Uint8Array(slots).fill(1)
  const charge = (s: CombinedState): number => s.vibe.reduce((a, b) => a + b, 0)
  const dockCharge = (s: CombinedState, x: number): number => {
    let q = 0

    for (let d = 0; d < 24; d++) {
      q += s.vibe[x * 24 + d] ?? 0
    }

    return q
  }
  let s = start
  let open = start
  let openChanges = 0
  let chargeKept = true
  let gaussViolations = 0
  let gaussChecks = 0

  for (let t = 0; t < BOX_BEATS; t++) {
    const next = combinedBeat(knit, s, none, t).state

    open = combinedBeat(knit, open, all, t).state
    openChanges += differ(next.vibe, open.vibe) + differ(next.token, open.token) + differ(next.flux, open.flux)
    chargeKept = chargeKept && charge(next) === charge(start)

    if (steered) {
      const inflow = new Int32Array(knit.weave.mesh.cellCount)

      steered.edges.forEach(([a, b], l) => {
        const change = (next.flux[l] ?? 0) - (s.flux[l] ?? 0)

        inflow[a] = (inflow[a] ?? 0) + change
        inflow[b] = (inflow[b] ?? 0) - change
      })

      for (let x = 0; x < knit.weave.mesh.cellCount; x++) {
        gaussChecks++
        gaussViolations += dockCharge(next, x) - dockCharge(s, x) === (inflow[x] ?? 0) ? 0 : 1
      }
    }

    s = next
  }

  return { openChanges, chargeKept, gaussViolations, gaussChecks }
}

type Battery = {
  runs: { name: string; off: ReturnType<typeof quantum>; on: ReturnType<typeof quantum>; comoving: ReturnType<typeof quantum> }[]
  classical: { name: string; blind: ReturnType<typeof classicalBlind> }[]
}

function battery(): Battery {
  return {
    runs: CONFIGS.map(({ name, spec }) => ({ name, off: quantum(spec, 'off'), on: quantum(spec, 'on'), comoving: quantum(spec, 'comoving') })),
    classical: CONFIGS.map(({ name, spec }) => ({ name, blind: classicalBlind(spec) })),
  }
}

const flatten = (prefix: string, record: Record<string, number | boolean>): [string, number][] =>
  Object.entries(record).map(([k, v]) => [`${prefix}_${k}`, typeof v === 'boolean' ? (v ? 1 : 0) : v])

export default experiment({
  id: 'spin/comoving-battery',
  code: 'E-SPN-0063',
  title:
    'the comoving fear beat through E-FRC-0159\'s battery on the combined knit, gate for gate, fail at the default integer link start (E-MTH-0027) on its frame control alone, and pass on 11 of 17 starts of E-MTH-0028\'s family: 0 of 42 quantum gates fail and 0 change verdict against the model\'s beat on H, HF and HFL (CHSH 2.55 on all three at the default start); each of the 6 failing starts is one where the vacuum pair makes no fear and the frame control (the swap phase at love-fear meetings) reads 0 in both paired columns, uninformative rather than a failure; paired on the same start, the comoving beat adds a quantum-gate failure against the fear-off column on 0 of 17 and against the fixed-frame beat on 0 of 17, and gains CHSH above 2 on HF and HFL at 4; the classical layer takes no kernel (Gauss\'s law on 3,888 of 3,888 dock-beats), and the fermion number is kept at 831 of 831 meetings where the model\'s beat breaks it at 197',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const first = battery()
    const second = battery()
    const digest = (b: Battery): string =>
      JSON.stringify(
        b.runs.map(r => [r.comoving.gates, r.comoving.metrics, r.comoving.fermion, r.comoving.pureGaugeDifferences, r.comoving.controlMismatches]),
        (_, v) => (typeof v === 'bigint' ? v.toString() : v),
      )
    const deterministic = digest(first) === digest(second)
    const { runs, classical } = first

    const failsOnlyComoving: string[] = []
    const comovingFails: string[] = []
    const moved: string[] = []

    for (const run of runs) {
      for (const [gate, passComoving] of Object.entries(run.comoving.gates)) {
        const passOn = run.on.gates[gate] ?? false
        const passOff = run.off.gates[gate] ?? false

        if ((passOn || passOff) && !passComoving) {
          failsOnlyComoving.push(`${run.name}:${gate}`)
        }

        if (!passComoving) {
          comovingFails.push(`${run.name}:${gate}`)
        }

        if (passOn !== passComoving) {
          moved.push(`${run.name}:${gate}`)
        }
      }
    }

    const controlMismatches = runs.reduce((s, r) => s + r.on.controlMismatches + r.off.controlMismatches + r.comoving.controlMismatches, 0)
    const controlsHold = runs.every(r => r.comoving.metrics.controlsHold === 1 && r.on.metrics.controlsHold === 1)
    const fermion = runs.map(r => ({ name: r.name, ...r.comoving.fermion }))
    const pureGauge = runs.reduce((s, r) => s + r.comoving.pureGaugeDifferences, 0)
    const blind = classical.every(c => c.blind.openChanges === 0 && c.blind.chargeKept)
    const gauss = classical.find(c => c.name === 'HFL')?.blind

    const g1 = controlMismatches === 0
    const g2 = failsOnlyComoving.length === 0 && comovingFails.length === 0 && controlsHold
    const g3 = blind && gauss !== undefined && gauss.gaussChecks > 0 && gauss.gaussViolations === 0
    const g4 =
      fermion.every(f => f.kept === f.meetings && f.freeChanges === 0) && fermion.some(f => f.shareChanges > 0) && fermion.some(f => f.modelBroken > 0)
    const g5 = pureGauge === 0
    const g6 = deterministic
    const ok = g1 && g2 && g3 && g4 && g5 && g6

    // the numbers that move, on against comoving
    const movedNumbers: string[] = []

    for (const run of runs) {
      for (const [name, value] of Object.entries(run.comoving.metrics)) {
        const was = run.on.metrics[name]

        if (was !== undefined && Math.abs(was - value) > 1e-9) {
          movedNumbers.push(`${run.name} ${name} ${Number(was.toPrecision(6))} -> ${Number(value.toPrecision(6))}`)
        }
      }
    }

    const carried = Object.entries(CARRIED_CLASSICAL_FAILURES).flatMap(([name, gates]) => gates.map(g => `${name}:${g}`))

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the comoving fear beat ${g2 ? 'passes' : 'does not pass'} E-FRC-0159's battery on the combined knit: ${failsOnlyComoving.length} quantum gates fail with it that pass with the model's beat or with the fear beat off, ${comovingFails.length} of ${runs.length * 14} fail with it, and ${moved.length} change verdict against the model's beat; the classical layer takes no kernel (opening every token changed ${classical.reduce((s, c) => s + c.blind.openChanges, 0)} vibes, tokens or fluxes in ${BOX_BEATS} beats on every configuration, and Gauss's law for the steered flux held on ${(gauss?.gaussChecks ?? 0) - (gauss?.gaussViolations ?? 0)} of ${gauss?.gaussChecks ?? 0} dock-beats), so E-FRC-0159's ${carried.length} classical failures are the base's and carry over unchanged; the fermion number is kept at ${fermion.reduce((s, f) => s + f.kept, 0)} of ${fermion.reduce((s, f) => s + f.meetings, 0)} meetings (the two own points differ at ${fermion.reduce((s, f) => s + f.pointsDiffer, 0)}) and changes on ${fermion.reduce((s, f) => s + f.freeChanges, 0)} meeting-free beats, while the model's beat breaks it at ${fermion.reduce((s, f) => s + f.modelBroken, 0)}; on pure-gauge links the two laws differ on ${pureGauge} beats; the run is ${deterministic ? '' : 'NOT '}deterministic`,
      metrics: {
        comovingPassesBattery: g2 ? 1 : 0,
        failsOnlyWithComoving: failsOnlyComoving.length,
        quantumGatesFailingWithComoving: comovingFails.length,
        gatesChangingVerdict: moved.length,
        controlMismatches,
        classicalOpenChanges: classical.reduce((s, c) => s + c.blind.openChanges, 0),
        gaussChecksHFL: gauss?.gaussChecks ?? 0,
        gaussViolationsHFL: gauss?.gaussViolations ?? -1,
        pureGaugeDifferences: pureGauge,
        deterministic: deterministic ? 1 : 0,
        ...Object.fromEntries(fermion.flatMap(f => flatten(`${f.name}_fermion`, { meetings: f.meetings, kept: f.kept, freeChanges: f.freeChanges, shareChanges: f.shareChanges, pointsDiffer: f.pointsDiffer, modelBroken: f.modelBroken }))),
        ...Object.fromEntries(runs.flatMap(r => [...flatten(`${r.name}_comoving_gate`, r.comoving.gates), ...flatten(`${r.name}_comoving`, r.comoving.metrics)])),
      },
      control: {
        ...Object.fromEntries(runs.flatMap(r => [...flatten(`${r.name}_on_gate`, r.on.gates), ...flatten(`${r.name}_on`, r.on.metrics), ...flatten(`${r.name}_off_gate`, r.off.gates)])),
      },
      notes: "RERUN 2026-09-26 after the adoption (advanceComoving now a thin use of advanceWhole, the model's column run with comoving false, exact Eisenstein kernels): status pass, every gate and every comoving number the same except the swap-at-love-fear control 1,303 -> 352 on H and 2,959 -> 1,760 on HF and HFL, because the old comoving-weave skipped the translation wherever the two own points coincided, which is exact for the color law's kernels (all 9 diagonal pairs) but not for that control kernel. " + (`L2, exact, deterministic, no random numbers. Fails only with the comoving beat: ${failsOnlyComoving.join(', ') || 'none'}. Quantum gates failing with it: ${comovingFails.join(', ') || 'none'}. Verdicts that move against the model's beat: ${moved.join(', ') || 'none'}. Numbers that move (model's beat -> comoving): ${movedNumbers.join('; ') || 'none'}. Carried over from E-FRC-0159 unchanged, since combinedBeat takes no kernel: the base's classical failures ${carried.join(', ')} and the whole E-FRC-0149 characterization. The change itself: each meeting's kernel is the model's with both coordinates translated to the tokens' own role points, which are record data (moved by the same grid move as the weights at every crossing, reflected with them at every frame rewrite), so the meeting needs only what the two tokens hold at the dock. The kernel depends only on the difference of the two points and is the model's wherever they coincide, which is every meeting on a pure-gauge field. The fermion number read here is each coordinate's weight at its own point over the units, in the frame it is written in; a like meeting keeps the sum of the two, a love-fear meeting the love's minus the fear's. First run, recorded: every gate passed. The model's own column here does NOT reproduce E-FRC-0159's logged numbers (H fearsMaxMatter 1,809,349,279 against 1,751,142,021, HF 27,747,493,661 against 26,119,651,318, HF and HFL CHSH 2.3749 against 2.3689, the swap-at-love-fear control 1,303 against 2,788 on H): that log predates the 2026-09-26 frame tracking and phase-index convention (E-QTM-0123, E-QTM-0124) now in advanceWhole. Every E-FRC-0159 quantum verdict is the same here, but its registered numbers are stale and it should be rerun.`),
    })
  },
})
