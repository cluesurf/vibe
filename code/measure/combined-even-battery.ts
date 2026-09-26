// E-FRC-0159's box-level and quantum items of the combined knit (H and its folded variants), with the box side a
// parameter, so the reference can be REMEASURED at the sides a dock-varying vacuum needs (E-RLT-0085 remeasures H on the
// side-4 box, where E-RLT-0082 took H's quantum gates from E-FRC-0159's side-3 run). The logic is
// test/experiment/gauge/combined-knit-battery.ts's boxGates and quantum, line for line, with QSIDE replaced by `side`;
// with side 3 it is that file's battery item for item (E-RLT-0085 checks this before it reads side 4).

import { makeColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  conjugateSecond,
  CONJUGATE_POINT,
  fearBeat,
  carryCoordinate,
  reduceWhole,
  wholeLovesAndFears,
  wholeUnits,
  makeLattice,
  type BeatRecord,
  type FearKernels,
  type Whole,
} from '@/code/rule/fear-weave'
import { doubledSwapPhase, exactFearKernels, exactWholeKernel } from '@/code/rule/fear-kernel-exact'
import { departureChances, departureOf, kernelIsUnital, kernelKeepsWeight, reduceDeparture, type Departure } from '@/code/rule/calm-weave'
import { timesOmega } from '@/code/rule/signed-knot'
import { makeSteeredKnit } from '@/code/rule/steered-knit'
import {
  combinedBeat,
  combinedBeatBack,
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
import { denseKnitState } from '@/code/measure/steered-acceptance'
import { roleChsh, roleDensity } from '@/code/measure/role-bell'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const BOX_BEATS = 48
const SEARCH_BEATS = 240
const Q_BEATS = 480
const REVERSAL_BEATS = 96
const GAUGE_BEATS = 48
const MATTER_SCALE = 2.11

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
export function combinedBoxGates(spec: CombinedKnitSpec, side: number): Record<string, number> {
  const knit = makeCombinedKnit({ side, spec })
  const { mesh, moves, opposite } = knit.weave
  const slots = mesh.cellCount * 24
  const fill = golden(slots, 1.37)
  const flux = spec.steer ? denseKnitState(makeSteeredKnit({ side, spec: scheduleOf(spec), steer: spec.steer })).flux : undefined
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

// E-QTM-0109's gates on one configuration, for the kernels given (the fear beat on or off), on the side-`side` box
export function combinedQuantum(spec: CombinedKnitSpec, mode: 'on' | 'off', boxSide: number): { gates: QuantumGates; metrics: Record<string, number> } {
  const knit = makeCombinedKnit({ side: boxSide, spec })
  const { mesh, moves, opposite } = knit.weave
  const weave = knit.weave
  const slots = mesh.cellCount * 24
  const flat = withLinks(knit, new Int16Array(slots).fill(moves.identity))
  // the kernels in exact Eisenstein integers, the phases as trits (E-FRC-0206; equal to fearKernels' tables)
  const kernels = exactFearKernels({ like: mode === 'on' ? 1 : 0, unlike: mode === 'on' ? 1 : 0, likeExchanged: false })
  const back = exactFearKernels({ like: mode === 'on' ? 2 : 0, unlike: mode === 'on' ? 2 : 0, likeExchanged: false })
  const off = exactFearKernels({ like: 0, unlike: 0, likeExchanged: false })
  const on = exactFearKernels({ like: 1, unlike: 1, likeExchanged: false })
  const swapExact = exactWholeKernel(doubledSwapPhase(1), 2)
  const swapControl: FearKernels = { ...on, unlike: conjugateSecond(swapExact.kernel), unlikeDivisor: swapExact.divisor }
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
  const transform = (state: CombinedState, whole: Whole): Whole => {
    const at = new Map<number, number>()

    state.token.forEach((tk, s) => at.set(tk, Math.floor(s / 24)))

    let moved = whole

    whole.tokens.forEach((tk, c) => {
      moved = carryCoordinate(moved, c, moves.act[frame[at.get(tk) ?? 0] ?? moves.identity] ?? [])
    })

    return moved
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
    const w = makeColorWeave({ side: boxSide, table: 'pair' })
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
