// The fear beat on the cold quaternion knit: the color mode of E-QTM-0109 (the swap phase where like vibes
// meet, the singlet phase where a love meets a fear, stored as the departure from calm times omega^q) run on
// code/rule/cold-quaternion-knit (E-RLT-0054).
//
// THE MEETING. E-QTM-0109's meetings are wire meetings: two vibes on one wire when its table acts. This knit
// has no wires. Its collision acts on footprints: the couple clock on the four slots of a couple, the
// exchange on the two lone tones it moves, the threshold on a couple and its payer line. A meeting is
// defined on those footprints, in one sentence: two vibes meet when a move changes a footprint that held
// exactly those two vibes, which is a clock move on a couple holding two vibes or an exchange (its two lone
// tones). The threshold is not a meeting (the payers' tones do not change, only their stores). A clock move
// on a couple holding three or four vibes is a many-body event with no pair to name, and records none; it is
// counted. Why this one: it is the wire meeting's own content (a move whose outcome depends jointly on two
// vibes and changes them), it names each pair once per move, meetings of one beat touch disjoint tokens
// within a footprint, and it is read off the pair (before, after) of the move, so the backward beat names the
// same meetings in the reverse order and the whole reverses. Tokens are the role-point carriers of
// code/rule/cold-quaternion-knit, moved by the weight-keeping rule, so every token keeps its weight (the vibe,
// or a calm slot's side sign) for life, as the color turn weave's 'first-sign' knit does; the like kernel is
// therefore the swap phase itself (likeExchanged false), as in E-QTM-0109.
//
// THE KNOTS. A cold vacuum makes no meetings at all, so E-QTM-0109's vacuum pair (two calm tokens that meet
// because the vacuum clocks) does not exist here: that is measured (every calm line of dock 0, 24 beats).
// Its role is taken by the love-fear pair: a love and a fear head on on one line of dock 0 in the cold
// vacuum, the first line whose two tokens meet within 24 beats. The matter pair (most meetings among dock-0
// tokens on a golden-ratio fill, 240 beats) and the grower (the pair of the twelve meeting most whose units
// grow most in 480 beats) are found as there.
//
// Gates, fixed before the first run, E-QTM-0109's own with the vacuum pair replaced:
// - the classical layer is the cold quaternion knit: with tokens and role points carried and the fear beat
//   on, tones, stores and counters equal the plain knit's at every slot for 24 beats, and no dock's color
//   content changes
// - the cold vacuum has no meetings; a love-fear pair exists
// - for the love-fear pair, the matter pair and the grower: 0 token sign flips, pure every beat, fear share
//   at most 1/3, no fear with the fear beat off; 0 sign flips over every dock-0 token (control: the
//   committed table's color weave flips some, as in E-QTM-0109)
// - the matter pair reverses exactly over 96 beats in fixed units 9 x 4^200 x 3^200 and keeps love minus fear
// - 0 frame mismatches under a frame change in every dock on the love-fear and matter pairs; some when the
//   love-fear kernel is the swap phase (the control)
// - on flat links the love-fear pair's chance of reading (0, 0) after its first three meetings is 1/3, 1/3,
//   1, the dephased stand-in 1/3, 1/3, 1/3, fear off 1; one beat after its first meeting on live links, CHSH
//   above 2, the fear-off rule and the stand-in at most 2
// - option-1 storage with the center phase on all three knots, the grower with q not 0: 0 mismatches over
//   480 beats; both kernels unital and weight-keeping
// Reported: meetings by kind (clock, exchange) and the many-body clock moves, like and love-fear meetings,
// grain, CHSH values, q of each knot.
//
// This module is E-RLT-0055's measurement, lifted out so E-RLT-0056 and E-RLT-0057 run the same gates on
// their knits: fearPortReading(knit) returns the gates, metrics and controls. For a knit in 'scatter' mode
// the meetings are its quads (like) and rotations (like or love-fear), by the same definition.

import { makeColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  conjugateSecond,
  CONJUGATE_POINT,
  fearBeat,
  makeLattice,
  carryCoordinate,
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
import { roleChsh, roleDensity } from '@/code/measure/role-bell'
import { d4BoxDistance } from '@/code/substrate/d4-box'
import { dockColor } from '@/code/rule/scatter-weave'
import {
  COLD_FIRSTS,
  COLD_OPPOSITE,
  COLD_SIDE,
  coldQuaternionBeat,
  coldQuaternionBeatBack,
  emptyColdState,
  makeColdQuaternionLattice,
  type ColdMeeting,
  type ColdQuaternionKnit,
  type ColdQuaternionLattice,
  type ColdQuaternionState,
} from '@/code/rule/cold-quaternion-knit'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const SIDE = 3
const MATTER_SCALE = 2.11
const SEARCH_BEATS = 240
const BEATS = 480
const REVERSAL_BEATS = 96
const GAUGE_BEATS = 48

type Row = { units: bigint; loves: bigint; fears: bigint }
type Step = { state: ColdQuaternionState; record: BeatRecord; kinds: Record<ColdMeeting['kind'], number> }

function basisWhole(tokens: readonly number[], digits: readonly number[]): Whole {
  const weight = new Array<bigint>(9 ** tokens.length).fill(0n)

  for (let i = 0; i < weight.length; i++) {
    const on = tokens.every((_, c) => Math.floor((Math.floor(i / 9 ** (tokens.length - 1 - c)) % 9) / 3) === digits[c])

    weight[i] = on ? 1n : 0n
  }

  return { tokens, weight }
}

const readingOf = (i: number): number => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3)

function dephase(whole: Whole): Whole {
  const role = new Array<bigint>(9).fill(0n)

  whole.weight.forEach((w, i) => {
    role[readingOf(i)] = (role[readingOf(i)] ?? 0n) + w
  })

  return { tokens: whole.tokens, weight: whole.weight.map((_, i) => role[readingOf(i)] ?? 0n) }
}

function chance(whole: Whole, reading: number): number {
  return Number(whole.weight.reduce((s, w, i) => (readingOf(i) === reading ? s + w : s), 0n)) / Number(wholeUnits(whole))
}

const native = (whole: Whole): Whole => ({ tokens: whole.tokens, weight: whole.weight.map((_, i) => whole.weight[Math.floor(i / 9) * 9 + (CONJUGATE_POINT[i % 9] ?? 0)] ?? 0n) })

export type FearPortReading = {
  readonly gates: Record<string, boolean>
  readonly metrics: Record<string, number>
  readonly control: Record<string, number>
}

type Kinds = Record<ColdMeeting['kind'], number>

const noKinds = (): Kinds => ({ clock: 0, exchange: 0, many: 0, quad: 0, rotation: 0 })

// E-RLT-0055's gates on any cold knit built by code/rule/cold-quaternion-knit (either mode), side-3 box
export function fearPortReading(knit: ColdQuaternionKnit): FearPortReading {
  {
    const weave = makeColorWeave({ side: SIDE, table: 'bind' })
    const { mesh, moves } = weave
    const slots = mesh.cellCount * 24
    const liveLinks = weave.links
    const flatLinks = new Int16Array(slots).fill(moves.identity)
    const lattice: ColdQuaternionLattice = makeColdQuaternionLattice(mesh, knit)
    // the kernels in exact Eisenstein integers (E-FRC-0206), the phases as trits: no cosine, sine or rounding
    // reaches the knit's fear beat (the user's rule of 2026-09-26); the tables equal fearKernels' entry for entry
    const on = exactFearKernels({ like: 1, unlike: 1, likeExchanged: false })
    const back = exactFearKernels({ like: 2, unlike: 2, likeExchanged: false })
    const off = exactFearKernels({ like: 0, unlike: 0, likeExchanged: false })
    const swapExact = exactWholeKernel(doubledSwapPhase(1), 2)
    const swapControl: FearKernels = { ...on, unlike: conjugateSecond(swapExact.kernel), unlikeDivisor: swapExact.divisor }
    const openOf = (tokens: readonly number[]): Uint8Array => {
      const open = new Uint8Array(slots)

      for (const t of tokens) open[t] = 1

      return open
    }
    const withLabels = (vibe: Int8Array, point: Int8Array): ColdQuaternionState => ({ ...emptyColdState(mesh, true), vibe: Int8Array.from(vibe), role: Int8Array.from(point) })
    const golden = (scale: number) => {
      const vibe = new Int8Array(slots)
      const point = new Int8Array(slots)

      for (let i = 0; i < slots; i++) {
        const u = ((i + 1) * GOLDEN * scale) % 1

        vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
        point[i] = Math.floor(((i + 3) * GOLDEN * scale * 9) % 9)
      }

      return { vibe, point }
    }

    // one beat of the classical layer with the record the whole reads: meetings of two open tokens, and
    // every open token's crossing (its link, or the inverse link going back)
    const step = (state: ColdQuaternionState, open: Uint8Array, links: Int16Array, forward: boolean): Step => {
      const raw = { meetings: [] as ColdMeeting[], crossings: [] as [number, number][] }
      const next = forward ? coldQuaternionBeat(lattice, state, raw) : coldQuaternionBeatBack(lattice, state, raw)
      const meetings: [number, number][] = []
      const signs: [number, number][] = []
      const kinds = noKinds()

      for (const m of raw.meetings) {
        kinds[m.kind]++

        if (m.kind !== 'many' && open[m.tokens[0]] === 1 && open[m.tokens[1]] === 1) {
          meetings.push([m.tokens[0], m.tokens[1]])
          signs.push([m.signs[0], m.signs[1]])
        }
      }

      const crossings: [number, number][] = []

      for (const [tk, slot] of raw.crossings) {
        if (open[tk] !== 1) continue

        const g = links[slot] ?? moves.identity

        crossings.push([tk, forward ? g : (moves.inverse[g] ?? moves.identity)])
      }

      return { state: next, record: { meetings, crossings, signs }, kinds }
    }
    const recordsOf = (start: ColdQuaternionState, links: Int16Array, open: Uint8Array, beats: number): { records: BeatRecord[]; kinds: Step['kinds']; states: ColdQuaternionState[] } => {
      let state = start
      const records: BeatRecord[] = []
      const kinds = noKinds()
      const states: ColdQuaternionState[] = [start]

      for (let t = 0; t < beats; t++) {
        const r = step(state, open, links, true)

        state = r.state
        records.push(r.record)
        states.push(state)

        for (const k of Object.keys(kinds) as ColdMeeting['kind'][]) kinds[k] += r.kinds[k]
      }

      return { records, kinds, states }
    }

    // the classical layer is the knit, and color stays local with the labels carried
    const matter = golden(MATTER_SCALE)
    let knitMismatch = 0
    let colorLeaks = 0

    {
      const allOpen = new Uint8Array(slots).fill(1)
      let labelled = withLabels(matter.vibe, matter.point)
      let plain: ColdQuaternionState = { ...emptyColdState(mesh), vibe: Int8Array.from(matter.vibe) }

      for (let t = 0; t < 24; t++) {
        // color: each dock's content before and after its collision, read through a beat without stream
        const before = Array.from({ length: mesh.cellCount }, (_, x) => dockColor(labelled.vibe, labelled.role ?? new Int8Array(0), x))
        const r = step(labelled, allOpen, liveLinks, true)
        // unstream the result to read each dock's content right after its collision
        const collidedVibe = new Int8Array(slots)
        const collidedRole = new Int8Array(slots)

        for (let i = 0; i < slots; i++) {
          collidedVibe[i] = r.state.vibe[lattice.target[i] ?? 0] ?? 0
          collidedRole[i] = r.state.role?.[lattice.target[i] ?? 0] ?? 0
        }

        for (let x = 0; x < mesh.cellCount; x++) {
          colorLeaks += dockColor(collidedVibe, collidedRole, x) === before[x] ? 0 : 1
        }

        labelled = r.state
        plain = coldQuaternionBeat(lattice, plain)

        for (let i = 0; i < slots; i++) {
          knitMismatch += labelled.vibe[i] === plain.vibe[i] && labelled.store[i] === plain.store[i] ? 0 : 1
        }

        for (let i = 0; i < plain.counter.length; i++) {
          knitMismatch += labelled.counter[i] === plain.counter[i] ? 0 : 1
        }
      }
    }

    // the cold vacuum has no meetings
    let vacuumMeetings = 0

    {
      const vacuum = withLabels(new Int8Array(slots), new Int8Array(slots))
      const all = new Uint8Array(slots).fill(1)

      for (const r of recordsOf(vacuum, liveLinks, all, 24).records) vacuumMeetings += r.meetings.length
    }

    // the love-fear pair
    let pairTokens: number[] = []
    let pairStart: ColdQuaternionState = withLabels(new Int8Array(slots), new Int8Array(slots))

    for (let l = 0; l < 12 && pairTokens.length === 0; l++) {
      const d = COLD_FIRSTS[l] ?? 0
      const o = COLD_OPPOSITE[d] ?? 0
      const vibe = new Int8Array(slots)

      vibe[d] = 1
      vibe[o] = -1

      const start = withLabels(vibe, new Int8Array(slots))

      if (recordsOf(start, liveLinks, openOf([d, o]), 24).records.some(r => r.meetings.length > 0)) {
        pairTokens = [d, o]
        pairStart = start
      }
    }

    // the matter pair and the grower
    const matterStart = withLabels(matter.vibe, matter.point)
    const dock0 = openOf(Array.from({ length: 24 }, (_, s) => s))
    const counts = new Map<string, number>()
    const search = recordsOf(matterStart, liveLinks, dock0, SEARCH_BEATS)

    for (const r of search.records) {
      for (const [a, b] of r.meetings) {
        const key = `${Math.min(a, b)},${Math.max(a, b)}`

        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }

    const ranked = [...counts.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).map(([k]) => k.split(',').map(Number))
    const matterPair = ranked[0] ?? [0, 1]
    const signOfToken = (vibe: Int8Array, tk: number): number => (vibe[tk] ?? 0) || (COLD_SIDE[tk % 24] ?? 1)

    const study = (start: ColdQuaternionState, tokens: number[], kernels: FearKernels, links: Int16Array, whole0: Whole) => {
      const { records } = recordsOf(start, links, openOf(tokens), BEATS)
      let whole: Whole = whole0
      const rows: Row[] = []
      let pure = true
      let like = 0
      let unlike = 0
      let flips = 0
      const last = new Map<number, number>(tokens.map(tk => [tk, signOfToken(start.vibe, tk)]))

      for (const record of records) {
        record.meetings.forEach(([ta, tb], k) => {
          const [sa, sb] = record.signs?.[k] ?? [1, 1]

          like += sa === sb ? 1 : 0
          unlike += sa === sb ? 0 : 1
          flips += (last.get(ta) === sa ? 0 : 1) + (last.get(tb) === sb ? 0 : 1)
          last.set(ta, sa)
          last.set(tb, sb)
        })

        whole = advanceWhole({ weave, whole, record, kernel4: [], color: kernels, fixed: false, forward: true })!

        const units = wholeUnits(whole)

        pure = pure && 81n * whole.weight.reduce((s, w) => s + w * w, 0n) === 9n * units * units

        if (record.meetings.length > 0) rows.push({ units, ...wholeLovesAndFears(whole) })
      }

      const top = rows.reduce((m, r) => (r.units > m ? r.units : m), wholeUnits(whole0))
      const power = (p: bigint): number => {
        let u = top
        let k = 0

        while (u % p === 0n) {
          u /= p
          k++
        }

        return k
      }

      return {
        records,
        pure,
        like,
        unlike,
        flips,
        twos: power(2n),
        threes: power(3n),
        fearsMax: Number(rows.reduce((m, r) => (r.fears > m ? r.fears : m), 0n)),
        shareMax: Math.max(0, ...rows.map(r => Number(r.fears) / Number(r.loves + r.fears))),
      }
    }

    const pairStudy = study(pairStart, pairTokens, on, liveLinks, basisWhole(pairTokens, [0, 0]))
    const matterStudy = study(matterStart, matterPair, on, liveLinks, basisWhole(matterPair, [0, 1]))
    const growerCandidates = ranked.slice(0, 12).map(pair => ({ pair, s: study(matterStart, pair, on, liveLinks, basisWhole(pair, [0, 1])) }))
    const grower = growerCandidates.reduce((best, c) => (c.s.twos + c.s.threes > best.s.twos + best.s.threes ? c : best), growerCandidates[0]!)
    const offStudies = [study(pairStart, pairTokens, off, liveLinks, basisWhole(pairTokens, [0, 0])), study(matterStart, matterPair, off, liveLinks, basisWhole(matterPair, [0, 1]))]

    // sign flips of every dock-0 token, on this knit and (control) on the committed table's color weave
    let knitFlips = 0

    {
      const last = new Map<number, number>(Array.from({ length: 24 }, (_, tk) => [tk, signOfToken(matter.vibe, tk)]))

      for (const r of recordsOf(matterStart, liveLinks, dock0, BEATS).records) {
        r.meetings.forEach(([ta, tb], k) => {
          const [sa, sb] = r.signs?.[k] ?? [1, 1]

          knitFlips += (last.get(ta) === sa ? 0 : 1) + (last.get(tb) === sb ? 0 : 1)
          last.set(ta, sa)
          last.set(tb, sb)
        })
      }
    }

    let committedFlips = 0

    {
      const committed = makeColorWeave({ side: SIDE, table: 'pair' })
      let lat = makeLattice(matter)
      const last = new Map<number, number>(Array.from({ length: 24 }, (_, tk) => [tk, (matter.vibe[tk] ?? 0) || (committed.side[tk % 24] ?? 1)]))

      for (let t = 0; t < BEATS; t++) {
        const r = fearBeat({ weave: committed, links: committed.links, lattice: lat, open: dock0, t })

        lat = r.lattice
        r.record.meetings.forEach(([ta, tb], k) => {
          const [sa, sb] = r.record.signs?.[k] ?? [1, 1]

          committedFlips += (last.get(ta) === sa ? 0 : 1) + (last.get(tb) === sb ? 0 : 1)
          last.set(ta, sa)
          last.set(tb, sb)
        })
      }
    }

    // reversal and charge on the matter pair, in fixed units
    let reverses = false
    let chargeKept = true

    {
      const units = 9n * 4n ** 200n * 3n ** 200n
      const open = openOf(matterPair)
      let state = matterStart
      const whole0: Whole = { tokens: matterPair, weight: basisWhole(matterPair, [2, 0]).weight.map(w => w * (units / 9n)) }
      let whole: Whole | null = whole0

      for (let t = 0; t < REVERSAL_BEATS; t++) {
        const r = step(state, open, liveLinks, true)

        state = r.state
        whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: [], color: on, fixed: true, forward: true }) : null
        chargeKept = chargeKept && whole !== null && wholeUnits(whole) === units
      }

      for (let t = REVERSAL_BEATS - 1; t >= 0; t--) {
        const r = step(state, open, liveLinks, false)

        state = r.state
        whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: [], color: back, fixed: true, forward: false }) : null
      }

      const final = whole

      reverses =
        final !== null &&
        final.weight.every((w, i) => w === whole0.weight[i]) &&
        state.token !== undefined &&
        state.token.every((tk, s) => tk === matterStart.token?.[s]) &&
        state.vibe.every((v, s) => v === matterStart.vibe[s]) &&
        state.store.every((v, s) => v === matterStart.store[s]) &&
        state.counter.every((v, s) => v === matterStart.counter[s])
    }

    // frame: a frame in every dock, links changed to match
    const frame = Array.from({ length: mesh.cellCount }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * moves.act.length))
    const gaugeLinks = new Int16Array(slots)

    for (let x = 0; x < mesh.cellCount; x++) {
      for (let d = 0; d < 24; d++) {
        gaugeLinks[x * 24 + d] = moves.compose(moves.compose(frame[mesh.neighbour(x, d)] ?? moves.identity, liveLinks[x * 24 + d] ?? moves.identity), moves.inverse[frame[x] ?? moves.identity] ?? moves.identity)
      }
    }

    const transform = (state: ColdQuaternionState, whole: Whole): Whole => {
      const at = new Map<number, number>()

      state.token?.forEach((tk, s) => at.set(tk, Math.floor(s / 24)))

      let moved = whole

      whole.tokens.forEach((tk, c) => {
        // a change of frame relabels the own point with the weights (the comoving beat reads it)
        moved = carryCoordinate(moved, c, moves.act[frame[at.get(tk) ?? 0] ?? moves.identity] ?? [])
      })

      return moved
    }
    const frameMismatch = (start: ColdQuaternionState, tokens: number[], kernels: FearKernels, whole0: Whole): { mismatch: number; meetings: number } => {
      const open = openOf(tokens)
      let a = { state: start, whole: whole0 }
      let b = { state: start, whole: transform(start, whole0) }
      let mismatch = 0
      let meetings = 0

      for (let t = 0; t < GAUGE_BEATS; t++) {
        const ra = step(a.state, open, liveLinks, true)
        const rb = step(b.state, open, gaugeLinks, true)

        meetings += ra.record.meetings.length
        a = { state: ra.state, whole: advanceWhole({ weave, whole: a.whole, record: ra.record, kernel4: [], color: kernels, fixed: false, forward: true })! }
        b = { state: rb.state, whole: advanceWhole({ weave, whole: b.whole, record: rb.record, kernel4: [], color: kernels, fixed: false, forward: true })! }

        const expected = reduceWhole(transform(a.state, a.whole)).weight
        const actual = reduceWhole(b.whole).weight

        mismatch += expected.reduce((n, w, i) => n + (w === actual[i] ? 0 : 1), 0)
      }

      return { mismatch, meetings }
    }
    const framePair = frameMismatch(pairStart, pairTokens, on, basisWhole(pairTokens, [0, 0]))
    const frameMatter = frameMismatch(matterStart, matterPair, on, basisWhole(matterPair, [0, 1]))
    const frameControl = frameMismatch(pairStart, pairTokens, swapControl, basisWhole(pairTokens, [0, 0]))

    // interference and CHSH on the love-fear pair
    const flatRecords = recordsOf(pairStart, flatLinks, openOf(pairTokens), 60).records
    const chances = (kernels: FearKernels, dephased: boolean): number[] => {
      let whole = basisWhole(pairTokens, [0, 0])
      const out: number[] = []

      for (const record of flatRecords) {
        whole = advanceWhole({ weave, whole, record, kernel4: [], color: kernels, fixed: false, forward: true })!

        if (record.meetings.length > 0 && out.length < 3) {
          whole = dephased ? dephase(whole) : whole
          out.push(chance(whole, 0))
        }
      }

      return out
    }
    const quantum = chances(on, false)
    const standIn = chances(on, true)
    const fearOff = chances(off, false)
    const live = recordsOf(pairStart, liveLinks, openOf(pairTokens), 60)
    const firstMeeting = live.records.findIndex(r => r.meetings.length > 0)
    const readState = (kernels: FearKernels, dephased: boolean): Whole => {
      let whole = basisWhole(pairTokens, [0, 0])

      for (let t = 0; t <= firstMeeting + 1; t++) {
        const record = live.records[t]!

        whole = advanceWhole({ weave, whole, record, kernel4: [], color: kernels, fixed: false, forward: true })!
        whole = dephased && record.meetings.length > 0 ? dephase(whole) : whole
      }

      return whole
    }
    const bell = roleChsh(roleDensity(native(readState(on, false))))
    const bellOff = roleChsh(roleDensity(native(readState(off, false))))
    const bellStandIn = roleChsh(roleDensity(native(readState(on, true))))
    const readAt = live.states[firstMeeting + 2]
    const readCells = pairTokens.map(tk => Math.floor((readAt?.token?.indexOf(tk) ?? 0) / 24))
    const separation = d4BoxDistance({ a: readCells[0] ?? 0, b: readCells[1] ?? 0, side: SIDE })

    // option-1 storage with the center phase
    const unital = [on, back].every(k => kernelIsUnital(k.like, k.likeDivisor) && kernelKeepsWeight(k.like, k.likeDivisor) && kernelIsUnital(k.unlike, k.unlikeDivisor) && kernelKeepsWeight(k.unlike, k.unlikeDivisor))
    const storage = (start: ColdQuaternionState, tokens: number[], whole0: Whole) => {
      const { records } = recordsOf(start, liveLinks, openOf(tokens), BEATS)
      const q = tokens.reduce((s, tk) => s + signOfToken(start.vibe, tk), 0)
      const scale = 4n ** 200n * 3n ** 200n
      const d0 = departureOf(whole0)
      let plain: Whole = whole0
      let delta: Whole = { tokens, weight: d0.delta.map(x => x * scale) }
      const stored0 = timesOmega(delta.weight, delta.weight.map(() => 0n), q)
      let re: Whole = { tokens, weight: stored0.re }
      let om: Whole = { tokens, weight: stored0.om }
      const units = d0.units * scale
      let mismatches = 0
      let meetings = 0

      for (const record of records) {
        meetings += record.meetings.length
        plain = advanceWhole({ weave, whole: plain, record, kernel4: [], color: on, fixed: false, forward: true })!
        delta = advanceWhole({ weave, whole: delta, record, kernel4: [], color: on, fixed: true, forward: true })!
        re = advanceWhole({ weave, whole: re, record, kernel4: [], color: on, fixed: true, forward: true })!
        om = advanceWhole({ weave, whole: om, record, kernel4: [], color: on, fixed: true, forward: true })!

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

      return { q, mismatches, beats: records.length, meetings }
    }
    const storedPair = storage(pairStart, pairTokens, basisWhole(pairTokens, [0, 0]))
    const storedMatter = storage(matterStart, matterPair, basisWhole(matterPair, [0, 1]))
    const storedGrower = storage(matterStart, grower.pair, basisWhole(grower.pair, [0, 1]))

    const exact = (x: number, y: number): boolean => Math.abs(x - y) < 1e-12
    const knots = [pairStudy, matterStudy, grower.s]
    const gates = {
      classicalIsTheKnit: knitMismatch === 0 && colorLeaks === 0,
      vacuumSilentAndPairFound: vacuumMeetings === 0 && pairTokens.length === 2,
      signsPureAndUnderAThird: knots.every(x => x.flips === 0 && x.pure && x.shareMax <= 1 / 3) && knitFlips === 0 && committedFlips > 0 && offStudies.every(x => x.fearsMax === 0),
      reversal: reverses && chargeKept,
      frame: framePair.mismatch === 0 && frameMatter.mismatch === 0 && frameControl.mismatch > 0 && framePair.meetings > 0,
      interference: exact(quantum[0] ?? 0, 1 / 3) && exact(quantum[1] ?? 0, 1 / 3) && exact(quantum[2] ?? 0, 1) && standIn.length === 3 && standIn.every(c => exact(c, 1 / 3)) && fearOff.length === 3 && fearOff.every(c => c === 1),
      chsh: bell > 2 + 1e-6 && bellOff <= 2 + 1e-9 && bellStandIn <= 2 + 1e-9,
      storage: unital && storedPair.mismatches === 0 && storedMatter.mismatches === 0 && storedGrower.mismatches === 0 && storedGrower.q !== 0,
    }
    return {
      gates,
      metrics: {
        knitMismatch,
        colorLeaks,
        vacuumMeetings,
        pairFirst: pairTokens[0] ?? -1,
        pairSecond: pairTokens[1] ?? -1,
        matterPairFirst: matterPair[0] ?? -1,
        matterPairSecond: matterPair[1] ?? -1,
        growerFirst: grower.pair[0] ?? -1,
        growerSecond: grower.pair[1] ?? -1,
        searchClockMeetings: search.kinds.clock,
        searchExchangeMeetings: search.kinds.exchange,
        searchManyBodyClockMoves: search.kinds.many,
        searchQuadMeetings: search.kinds.quad,
        searchRotationMeetings: search.kinds.rotation,
        ...Object.fromEntries(
          (
            [
              ['pair', pairStudy],
              ['matter', matterStudy],
              ['grower', grower.s],
            ] as const
          ).flatMap(([name, x]) => [
            [`${name}LikeMeetings`, x.like],
            [`${name}LoveFearMeetings`, x.unlike],
            [`${name}SignFlips`, x.flips],
            [`${name}UnitsMaxPowerOf2`, x.twos],
            [`${name}UnitsMaxPowerOf3`, x.threes],
            [`${name}FearsMax`, x.fearsMax],
            [`${name}FearShareMax`, x.shareMax],
            [`${name}Pure`, x.pure ? 1 : 0],
          ]),
        ),
        dock0SignFlips: knitFlips,
        reversesExactly: reverses ? 1 : 0,
        loveMinusFearKept: chargeKept ? 1 : 0,
        frameMismatchPair: framePair.mismatch,
        frameMeetingsPair: framePair.meetings,
        frameMismatchMatter: frameMatter.mismatch,
        frameMeetingsMatter: frameMatter.meetings,
        chanceAfterMeeting1: quantum[0] ?? -1,
        chanceAfterMeeting2: quantum[1] ?? -1,
        chanceAfterMeeting3: quantum[2] ?? -1,
        firstMeetingBeat: firstMeeting,
        tokenSeparationAtReading: separation,
        chsh: bell,
        kernelsUnitalAndWeightKeeping: unital ? 1 : 0,
        storedPairCharge: storedPair.q,
        storedPairMismatches: storedPair.mismatches,
        storedPairMeetings: storedPair.meetings,
        storedMatterCharge: storedMatter.q,
        storedMatterMismatches: storedMatter.mismatches,
        storedMatterMeetings: storedMatter.meetings,
        storedGrowerCharge: storedGrower.q,
        storedGrowerMismatches: storedGrower.mismatches,
        storedGrowerMeetings: storedGrower.meetings,
        storedBeats: storedMatter.beats,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      control: {
        committedTableSignFlips: committedFlips,
        frameMismatchSwapAtLoveFear: frameControl.mismatch,
        fearOffFearsMax: Math.max(...offStudies.map(x => x.fearsMax)),
        standInChance3: standIn[2] ?? -1,
        fearOffChanceMin: fearOff.length > 0 ? Math.min(...fearOff) : -1,
        chshFearOff: bellOff,
        chshStandIn: bellStandIn,
      },
    }
  }
}
