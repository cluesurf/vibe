// The gates of a token-store pair move (code/rule/token-store-knit) with OPEN tokens, shared by E-RLT-0067 and
// E-RLT-0068: frame covariance of the whole and the classical layer, the held color, the fermion number, W(F4),
// charge conjugation, motion reversal and CPT, the laws, states, blindness and determinism.
//
// THE BOX. The side-3 integer torus with the color weave's links (makeColorWeave, bind table), E-FRC-0159's frame
// change (a golden frame per dock), Kronecker trits for the vibes and the store (kroneckerPairDock at 7 x plus an
// offset), role points from one Weyl rotation, latent labels from another. A token of a stored unit is given its
// partner's point (the stored pair is neutral) and the labels the unit's orientation names; a held token's label is
// its sign. Nothing is drawn.
//
// THE OPEN PAIRS. From an all-open classical run of SEARCH beats on the variant's own dynamics: the 3 pairs that
// meet most, the 2 that have most love-fear meetings, and the 2 that meet most among pairs whose two tokens are
// both remade (held, then not held, then held again) in that run. A meeting is two held slots of one line of a
// dock before the collision, as code/rule/isometric-role-knit records it.
//
// The whole is advanced by the knit's own law (code/rule/comoving-weave: advanceWhole in color mode, frames on,
// the comoving beat), the kernels fearKernels(2 pi / 3, 2 pi / 3, likeExchanged false), each coordinate's own point
// starting at its token's role point.

import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import {
  conjugateSecond,
  fearKernels,
  GRID_OF_PHASE,
  moveCoordinate,
  phasePermOf,
  physicalWhole,
  reduceWhole,
  swapPhase,
  wholeKernel,
  wholeUnits,
  type BeatRecord,
  type FearKernels,
  type Whole,
} from '@/code/rule/fear-weave'
import { advanceComoving, comovingOf, ownMarginals, type ComovingWhole } from '@/code/rule/comoving-weave'
import { sameRatio } from '@/code/measure/comoving-parity'
import { makePairKnit } from '@/code/rule/pair-making-knit'
import { kroneckerPairDock } from '@/code/measure/pair-knit-linearization'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  cloneStoreState,
  returns,
  sameStoreState,
  storeBeat,
  storeBeatBack,
  storeCharge,
  storeDockCollide,
  storeEnergy,
  storeMotionReversal,
  transformLinks,
  transformStoreState,
  type StoreTally,
  type StoreVariant,
  type TokenStoreKnit,
  type TokenStoreState,
} from '@/code/rule/token-store-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { boxCellMap, linearMapOf } from '@/code/substrate/d4-box'
import { phasePointOperators } from '@/code/measure/grid-weights'
import { hermitianSpectrum, operatorFromWigner } from '@/code/measure/qutrit-clifford'
import { weyl, GOLDEN } from '@/code/tool/weyl'

const ROOTS = rootsD4()
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)
const OMEGA = (2 * Math.PI) / 3
const SIDE_LENGTH = 3
const POINT_RATE = Math.sqrt(163) - Math.floor(Math.sqrt(163))
const LABEL_RATE = Math.sqrt(167) - Math.floor(Math.sqrt(167))
export const SEARCH_BEATS = 480
export const Q_BEATS = 480
const REVERSAL_BEATS = 96
const BOX_BEATS = 48

export type StoreStudy = { variant: StoreVariant; gates: Record<string, boolean>; metrics: Record<string, number>; pairs: number[][] }

export function storeWeave(): ColorWeave {
  return makeColorWeave({ side: SIDE_LENGTH, table: 'bind' })
}

export function storeKnit(weave: ColorWeave, variant: StoreVariant): TokenStoreKnit {
  return { weave, knit: makePairKnit({ mesh: weave.mesh }), variant }
}

// the start: Kronecker vibes and stores, Weyl points and labels, stored units neutral and labeled by their sign
export function storeStart(cells: number, offset: number): TokenStoreState {
  const vibe = new Int8Array(cells * 24)
  const store = new Int8Array(cells * 12)

  for (let x = 0; x < cells; x++) {
    const dock = kroneckerPairDock(offset + 7 * x)

    vibe.set(dock.vibe, x * 24)
    store.set(dock.store, x * 12)
  }

  const tokens = cells * 48
  const point = Int8Array.from({ length: tokens }, (_, t) => Math.floor(weyl(t + 1, POINT_RATE) * 9) % 9)
  const label = Int8Array.from({ length: tokens }, (_, t) => (weyl(t + 1, LABEL_RATE) < 0.5 ? 1 : -1))
  const place = Int32Array.from({ length: cells * 24 }, (_, i) => cells * 24 + i)

  for (let i = 0; i < cells * 24; i++) if (vibe[i] !== 0) label[i] = vibe[i] as number

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const tau = store[x * 12 + l] as number
      const t0 = place[x * 24 + 2 * l] as number
      const t1 = place[x * 24 + 2 * l + 1] as number

      if (tau !== 0) {
        point[t1] = point[t0] as number
        label[t0] = tau
        label[t1] = -tau
      }
    }
  }

  return { vibe, store, token: Int32Array.from({ length: cells * 24 }, (_, i) => i), place, point, label }
}

// the dock each token sits in (slot or store place)
function dockOfTokens(s: TokenStoreState): Int32Array {
  const out = new Int32Array(s.point.length)

  for (let i = 0; i < s.token.length; i++) out[s.token[i] as number] = Math.floor(i / 24)
  for (let i = 0; i < s.place.length; i++) out[s.place[i] as number] = Math.floor(i / 24)

  return out
}

// whether each token is held (on a slot with a vibe)
function heldTokens(s: TokenStoreState, out: Int8Array): void {
  out.fill(0)

  for (let i = 0; i < s.token.length; i++) if (s.vibe[i] !== 0) out[s.token[i] as number] = s.vibe[i] as number
}

function basisWhole(tokens: readonly number[], digits: readonly number[], own: readonly number[]): ComovingWhole {
  const weight = new Array<bigint>(9 ** tokens.length).fill(0n)

  for (let i = 0; i < weight.length; i++) {
    weight[i] = tokens.every((_, c) => Math.floor((Math.floor(i / 9 ** (tokens.length - 1 - c)) % 9) / 3) === digits[c]) ? 1n : 0n
  }

  return comovingOf({ tokens, weight }, own)
}

function openOf(size: number, tokens: readonly number[]): Uint8Array {
  const open = new Uint8Array(size)

  for (const t of tokens) open[t] = 1

  return open
}

// the held-slot color content of dock x (held true) or the held slots plus the stored units (store true), mod 3
function content(s: TokenStoreState, x: number, withStore: boolean): number {
  let w = 0
  let qx = 0
  let qy = 0
  const add = (sign: number, p: number): void => {
    w += sign
    qx += sign * (p % 3)
    qy += sign * Math.floor(p / 3)
  }

  for (let d = 0; d < 24; d++) {
    const v = s.vibe[x * 24 + d] as number

    if (v !== 0) add(v, s.point[s.token[x * 24 + d] as number] as number)
  }

  if (withStore) {
    for (let l = 0; l < 12; l++) {
      const tau = s.store[x * 12 + l] as number

      if (tau === 0) continue

      add(tau, s.point[s.place[x * 24 + 2 * l] as number] as number)
      add(-tau, s.point[s.place[x * 24 + 2 * l + 1] as number] as number)
    }
  }

  const m = (v: number): number => ((v % 3) + 3) % 3

  return m(w) * 9 + m(qx) * 3 + m(qy)
}

// the held color through the collision, every token closed: dock-beats whose held content changes, and whose held
// plus stored content changes ('returned' variants store the tokens, so the stored units carry their points)
export function heldColor(variant: StoreVariant, beats = BOX_BEATS): { heldChanges: number; totalChanges: number; dockBeats: number; made: number; unmade: number } {
  const weave = storeWeave()
  const k = storeKnit(weave, variant)
  const cells = weave.mesh.cellCount
  let s = storeStart(cells, 11)
  const closed = new Uint8Array(cells * 48)
  const tally: StoreTally = { made: 0, unmade: 0 }
  let heldChanges = 0
  let totalChanges = 0

  for (let t = 0; t < beats; t++) {
    const probe = cloneStoreState(s)

    for (let x = 0; x < cells; x++) {
      const h = content(probe, x, false)
      const all = content(probe, x, true)

      storeDockCollide(k, probe, x, tally)
      heldChanges += content(probe, x, false) === h ? 0 : 1
      totalChanges += content(probe, x, true) === all ? 0 : 1
    }

    s = storeBeat(k, s, closed).state
  }

  return { heldChanges, totalChanges: returns(variant) ? totalChanges : -1, dockBeats: beats * cells, made: tally.made, unmade: tally.unmade }
}

// the open pairs, and the all-open run's counts
function choosePairs(k: TokenStoreKnit, start: TokenStoreState): { pairs: number[][]; flips: number; remakes: number; meetings: number; loveFear: number } {
  const tokens = start.point.length
  const open = new Uint8Array(tokens).fill(1)
  const meet = new Map<number, number>()
  const loveFear = new Map<number, number>()
  const flipsOf = new Map<number, number>()
  const lastSign = new Int8Array(tokens)
  const remade = new Int32Array(tokens)
  const wasHeld = new Uint8Array(tokens)
  const held = new Int8Array(tokens)
  const everHeld = new Uint8Array(tokens)
  let s = start
  let flips = 0
  let meetings = 0
  let lf = 0

  heldTokens(s, held)
  for (let t = 0; t < tokens; t++) {
    wasHeld[t] = held[t] !== 0 ? 1 : 0
    everHeld[t] = wasHeld[t] as number
  }

  for (let beat = 0; beat < SEARCH_BEATS; beat++) {
    const r = storeBeat(k, s, open)

    r.record.meetings.forEach(([a, b], m) => {
      const [sa, sb] = r.record.signs?.[m] ?? [1, 1]
      const key = Math.min(a, b) * tokens + Math.max(a, b)
      const f = (lastSign[a] !== 0 && lastSign[a] !== sa ? 1 : 0) + (lastSign[b] !== 0 && lastSign[b] !== sb ? 1 : 0)

      meetings++
      lf += sa !== sb ? 1 : 0
      flips += f
      meet.set(key, (meet.get(key) ?? 0) + 1)
      if (sa !== sb) loveFear.set(key, (loveFear.get(key) ?? 0) + 1)
      if (f > 0) flipsOf.set(key, (flipsOf.get(key) ?? 0) + f)
      lastSign[a] = sa
      lastSign[b] = sb
    })
    s = r.state
    heldTokens(s, held)

    for (let t = 0; t < tokens; t++) {
      const h = held[t] !== 0 ? 1 : 0

      if (h === 1 && wasHeld[t] === 0 && everHeld[t] === 1) remade[t] = (remade[t] as number) + 1
      if (h === 1) everHeld[t] = 1
      wasHeld[t] = h
    }
  }

  const byCount = (m: Map<number, number>, filter: (key: number) => boolean = () => true): number[] =>
    [...m.entries()]
      .filter(([key]) => filter(key))
      .sort((x, y) => y[1] - x[1] || x[0] - y[0])
      .map(([key]) => key)
  const bothRemade = (key: number): boolean => (remade[Math.floor(key / tokens)] as number) > 0 && (remade[key % tokens] as number) > 0
  const chosen: number[] = []
  const take = (keys: number[], n: number): void => {
    let taken = 0

    for (const key of keys) {
      if (taken >= n) break
      if (chosen.includes(key)) continue
      chosen.push(key)
      taken++
    }
  }

  take(byCount(meet), 3)
  take(byCount(loveFear), 2)
  take(byCount(meet, bothRemade), 2)
  // the pairs whose tokens flip (the flip controls have them; a variant that never flips has none)
  take(byCount(flipsOf), 2)

  let remakes = 0

  for (let t = 0; t < tokens; t++) remakes += remade[t] as number

  return { pairs: chosen.map(key => [Math.floor(key / tokens), key % tokens]), flips, remakes, meetings, loveFear: lf }
}

export function storeStudy(variant: StoreVariant): StoreStudy {
  const weave = storeWeave()
  const k = storeKnit(weave, variant)
  const { mesh, moves } = weave
  const cells = mesh.cellCount
  const tokens = cells * 48
  const start = (): TokenStoreState => storeStart(cells, 11)
  const s0 = start()
  const kernels = fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: false }) as FearKernels
  const back = fearKernels({ like: -OMEGA, unlike: -OMEGA, likeExchanged: false }) as FearKernels
  const swapControl: FearKernels = { ...kernels, unlike: conjugateSecond(wholeKernel(swapPhase(OMEGA), 1000)?.kernel ?? []), unlikeDivisor: 4 }
  const ownOf = (s: TokenStoreState, pair: readonly number[]): number[] => pair.map(t => GRID_OF_PHASE[s.point[t] as number] ?? 0)
  const advance = (w: ComovingWhole, record: BeatRecord, kk: FearKernels, fixed: boolean, forward: boolean, onWeave: ColorWeave, comoving = true): ComovingWhole | null =>
    advanceComoving({ weave: onWeave, whole: w, record, color: kk, fixed, forward, comoving })
  const chosen = choosePairs(k, s0)
  const pairs = chosen.pairs

  // G1: the frame change, on the classical layer and the whole
  const frame = Array.from({ length: cells }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * moves.act.length))
  const gaugedLinks = new Int16Array(weave.links.length)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24; d++) {
      gaugedLinks[x * 24 + d] = moves.compose(
        moves.compose(frame[mesh.neighbour(x, d)] ?? moves.identity, weave.links[x * 24 + d] ?? moves.identity),
        moves.inverse[frame[x] ?? moves.identity] ?? moves.identity,
      )
    }
  }

  const gauged: TokenStoreKnit = { ...k, weave: { ...weave, links: gaugedLinks } }
  const framePoints = (s: TokenStoreState): Int8Array => {
    const at = dockOfTokens(s)

    return Int8Array.from(s.point, (p, t) => moves.act[frame[at[t] as number] ?? moves.identity]?.[p] ?? p)
  }
  const transformWhole = (s: TokenStoreState, whole: ComovingWhole): ComovingWhole => {
    const at = dockOfTokens(s)
    let moved: Whole = whole
    const own = [...whole.own]

    whole.tokens.forEach((tk, c) => {
      const table = moves.act[frame[at[tk] as number] ?? moves.identity] ?? []

      moved = moveCoordinate(moved, c, table)
      own[c] = phasePermOf(table)[own[c] ?? 0] ?? 0
    })

    return { ...moved, own }
  }
  const points2 = phasePointOperators(2)
  const floatOf = (w: Whole): number[] => {
    const units = Number(wholeUnits(w))

    return w.weight.map(x => Number(x) / units)
  }
  const states = { wholes: 0, nonStates: 0, least: 0, impure: 0 }
  const frameTest = (pair: number[], kk: FearKernels, readStates: boolean) => {
    const open = openOf(tokens, pair)
    let a = { state: start(), whole: basisWhole(pair, [0, 1], ownOf(s0, pair)) }
    const bStart = { ...start(), point: framePoints(a.state) }
    let b = { state: bStart, whole: transformWhole(a.state, a.whole) }
    let mismatch = 0
    let classical = 0
    let loveFear = 0
    let flips = 0
    let passages = 0
    const last = new Map<number, number>()
    const held = new Int8Array(tokens)
    const was = new Int8Array(tokens)
    const ever = new Uint8Array(tokens)

    heldTokens(a.state, was)
    for (const tk of pair) ever[tk] = was[tk] !== 0 ? 1 : 0

    for (let t = 0; t < Q_BEATS; t++) {
      const ra = storeBeat(k, a.state, open)
      const rb = storeBeat(gauged, b.state, open)

      ra.record.meetings.forEach(([ta, tb], m) => {
        const [sa, sb] = ra.record.signs?.[m] ?? [1, 1]

        flips += (last.has(ta) && last.get(ta) !== sa ? 1 : 0) + (last.has(tb) && last.get(tb) !== sb ? 1 : 0)
        last.set(ta, sa)
        last.set(tb, sb)
      })
      loveFear += (ra.record.signs ?? []).filter(([x, y]) => x !== y).length
      a = { state: ra.state, whole: advance(a.whole, ra.record, kk, false, true, weave) as ComovingWhole }
      b = { state: rb.state, whole: advance(b.whole, rb.record, kk, false, true, gauged.weave) as ComovingWhole }
      heldTokens(a.state, held)

      for (const tk of pair) {
        // a passage: a token held before, not held, and held again (through the store, or through a calm slot)
        if (was[tk] === 0 && held[tk] !== 0 && ever[tk] === 1) passages++
        if (held[tk] !== 0) ever[tk] = 1
        was[tk] = held[tk] as number
      }

      const expectedPoints = framePoints(a.state)

      classical += sameStoreState({ ...a.state, point: expectedPoints }, b.state) ? 0 : 1

      const expected = reduceWhole(transformWhole(a.state, a.whole))
      const actual = reduceWhole(b.whole)

      mismatch += expected.weight.reduce((n, w, i) => n + (w === actual.weight[i] ? 0 : 1), 0)
      mismatch += (expected.own ?? []).every((p, c) => p === (actual as ComovingWhole).own[c]) ? 0 : 1

      if (readStates) {
        const w = floatOf(physicalWhole(a.whole))
        const least = hermitianSpectrum(operatorFromWigner(w, points2))[0] ?? 0
        const units = wholeUnits(a.whole)

        states.wholes++
        states.nonStates += least < -1e-9 ? 1 : 0
        states.least = Math.min(states.least, least)
        states.impure += 81n * a.whole.weight.reduce((q, x) => q + x * x, 0n) === 9n * units * units ? 0 : 1
      }
    }

    return { mismatch, classical, loveFear, flips, passages }
  }
  const covariance = pairs.map(p => frameTest(p, kernels, true))
  const control = pairs.map(p => frameTest(p, swapControl, false))

  // G3: the fermion number
  const fermion = { meetings: 0, kept: 0, freeChanges: 0, modelBroken: 0, loveFearMeetings: 0 }

  for (const pair of pairs) {
    const open = openOf(tokens, pair)
    const records: BeatRecord[] = []
    let s = start()

    for (let t = 0; t < Q_BEATS; t++) {
      const r = storeBeat(k, s, open)

      records.push(r.record)
      s = r.state
    }

    for (const digits of [
      [0, 0],
      [0, 1],
      [2, 1],
    ]) {
      for (const law of [true, false]) {
        let w: ComovingWhole = basisWhole(pair, digits, ownOf(s0, pair))

        for (const record of records) {
          const before = ownMarginals(w)
          const next = advance(w, record, kernels, false, true, weave, law) as ComovingWhole
          const after = ownMarginals(next)
          const meeting = record.meetings[0]

          if (!meeting) {
            if (law) fermion.freeChanges += before.own.every((m, c) => sameRatio(m, before.units, after.own[c] ?? 0n, after.units)) ? 0 : 1
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
              fermion.loveFearMeetings += sa === sb ? 0 : 1
            } else {
              fermion.modelBroken += kept ? 0 : 1
            }
          }

          w = next
        }
      }
    }
  }

  // G4: W(F4) and charge conjugation, dock by dock and on the box
  const permutations = weylF4DirectionPermutations({ directions: ROOTS })
  const dockSamples: TokenStoreState[] = []

  for (const offset of [11, 2003, 40009]) {
    let s = storeStart(cells, offset)
    const closed = new Uint8Array(tokens)

    for (let t = 0; t < 5; t++) s = storeBeat(k, s, closed).state

    for (let x = 0; x < cells; x++) {
      dockSamples.push({
        vibe: s.vibe.slice(x * 24, x * 24 + 24),
        store: s.store.slice(x * 12, x * 12 + 12),
        token: s.token.slice(x * 24, x * 24 + 24),
        place: s.place.slice(x * 24, x * 24 + 24),
        point: s.point,
        label: s.label,
      })
    }
  }

  const dockFailures = (g: readonly number[], sign: number): number => {
    let bad = 0

    for (const x of dockSamples) {
      const gx = transformStoreState(x, [0], g, sign)

      storeDockCollide(k, gx, 0)

      const cx = cloneStoreState(x)

      storeDockCollide(k, cx, 0)
      bad += sameStoreState(gx, transformStoreState(cx, [0], g, sign)) ? 0 : 1
    }

    return bad
  }
  let coinFailures = 0

  for (const g of permutations) coinFailures += dockFailures(g, 1)

  const identity24 = Array.from({ length: 24 }, (_, d) => d)
  const conjugationFailures = dockFailures(identity24, -1)
  let dockChanges = 0

  for (const x of dockSamples) {
    const y = cloneStoreState(x)

    storeDockCollide(k, y, 0)

    const z = cloneStoreState(y)

    storeDockCollide(k, z, 0)
    dockChanges += sameStoreState(z, x) ? 0 : 1
  }

  let boxAutomorphisms = 0
  let boxCoinFailures = 0
  let inversionCells: number[] = []
  const boxStart = (() => {
    let s = storeStart(cells, 777)

    for (let t = 0; t < 3; t++) s = storeBeat(k, s, new Uint8Array(tokens)).state

    return s
  })()
  const none = new Uint8Array(tokens)

  for (const g of permutations) {
    const matrix = linearMapOf(g)
    const cellMap = matrix ? boxCellMap({ matrix, side: SIDE_LENGTH }) : undefined

    if (!cellMap) continue

    boxAutomorphisms++

    if (g.every((image, d) => image === OPPOSITE[d])) inversionCells = cellMap

    const kg: TokenStoreKnit = { ...k, weave: { ...weave, links: transformLinks(weave.links, cellMap, g) } }
    const lhs = storeBeat(kg, transformStoreState(boxStart, cellMap, g), none).state
    const rhs = transformStoreState(storeBeat(k, boxStart, none).state, cellMap, g)

    boxCoinFailures += sameStoreState(lhs, rhs) ? 0 : 1
  }

  // G5: reversal, motion reversal, CPT
  let reverses = true
  let chargeKept = true

  for (const pair of pairs.slice(0, 2)) {
    const units = 9n * 4n ** 200n * 3n ** 200n
    const open = openOf(tokens, pair)
    const first = start()
    const own = ownOf(first, pair)
    const whole0: ComovingWhole = comovingOf({ tokens: pair, weight: basisWhole(pair, [2, 0], own).weight.map(x => x * (units / 9n)) }, own)
    let s = first
    let whole: ComovingWhole | null = whole0

    for (let t = 0; t < REVERSAL_BEATS; t++) {
      const r = storeBeat(k, s, open)

      s = r.state
      whole = whole ? advance(whole, r.record, kernels, true, true, weave) : null
      chargeKept = chargeKept && whole !== null && wholeUnits(whole) === units
    }

    for (let t = REVERSAL_BEATS - 1; t >= 0; t--) {
      const r = storeBeatBack(k, s, open)

      s = r.state
      whole = whole ? advance(whole, r.record, back, true, false, weave) : null
    }

    reverses = reverses && whole !== null && whole.weight.every((w, i) => w === whole0.weight[i]) && whole.own.every((p, c) => p === whole0.own[c]) && sameStoreState(s, first)
  }

  let motionFailures = 0
  let cptFailures = 0
  const inversionLinks = transformLinks(weave.links, inversionCells, OPPOSITE)
  const kp: TokenStoreKnit = { ...k, weave: { ...weave, links: inversionLinks } }

  for (const offset of [101, 2003, 40009]) {
    const x = storeStart(cells, offset)
    const forward = storeBeat(k, storeMotionReversal(k, x), none).state

    motionFailures += sameStoreState(storeMotionReversal(k, forward), storeBeatBack(k, x, none).state) ? 0 : 1

    const cpt = storeMotionReversal(kp, transformStoreState(x, inversionCells, OPPOSITE, -1))
    const y = storeBeat(kp, cpt, none).state
    const undone = transformStoreState(storeMotionReversal(kp, y), inversionCells, OPPOSITE, -1)

    cptFailures += sameStoreState(undone, storeBeatBack(k, x, none).state) ? 0 : 1
  }

  // G6: the laws, and signs at meetings, on the all-open run
  let lawsExact = true
  {
    let s = start()
    const q0 = storeCharge(s)
    const e0 = storeEnergy(s)
    const momentum = (st: TokenStoreState): number[] => {
      const p = [0, 0, 0, 0]

      for (let i = 0; i < st.vibe.length; i++) if (st.vibe[i] !== 0) (ROOTS[i % 24] as number[]).forEach((v, c) => (p[c] = (p[c] as number) + v))

      return p
    }
    const p0 = momentum(s)

    for (let t = 0; t < REVERSAL_BEATS; t++) {
      s = storeBeat(k, s, none).state
      lawsExact = lawsExact && storeCharge(s) === q0 && storeEnergy(s) === e0 && momentum(s).every((v, c) => v === p0[c])
    }
  }

  // G8: blind
  let openChanges = 0
  {
    let a = start()
    let b = start()
    const all = new Uint8Array(tokens).fill(1)

    for (let t = 0; t < BOX_BEATS; t++) {
      a = storeBeat(k, a, none).state
      b = storeBeat(k, b, all).state
      openChanges += sameStoreState(a, b) ? 0 : 1
    }
  }

  const sum = (xs: { [key: string]: number }[], key: string): number => xs.reduce((s, x) => s + (x[key] ?? 0), 0)
  const frameMismatch = sum(covariance, 'mismatch')
  const classicalMismatch = sum(covariance, 'classical')
  const mismatchOnFlipFree = covariance.filter(c => c.flips === 0).reduce((s, c) => s + c.mismatch, 0)

  const gates: Record<string, boolean> = {
    frameCovariant: pairs.length > 0 && frameMismatch === 0 && classicalMismatch === 0,
    frameTestSensitive: sum(covariance, 'loveFear') > 0 && sum(covariance, 'passages') > 0,
    swapControlBites: sum(control, 'mismatch') > 0,
    fermionKept: fermion.meetings > 0 && fermion.kept === fermion.meetings && fermion.freeChanges === 0,
    fermionControlBreaks: fermion.modelBroken > 0,
    wf4: coinFailures === 0 && conjugationFailures === 0 && dockChanges === 0 && boxAutomorphisms === 1152 && boxCoinFailures === 0,
    reversalAndCpt: reverses && chargeKept && motionFailures === 0 && cptFailures === 0 && inversionCells.length === cells,
    laws: lawsExact,
    noFlips: chosen.flips === 0,
    states: states.nonStates === 0 && states.impure === 0,
    blind: openChanges === 0,
  }

  return {
    variant,
    pairs,
    gates,
    metrics: {
      openPairs: pairs.length,
      searchMeetings: chosen.meetings,
      searchLoveFearMeetings: chosen.loveFear,
      searchSignFlips: chosen.flips,
      searchRemakes: chosen.remakes,
      frameMismatch,
      classicalMismatch,
      frameMismatchOnFlipFreePairs: mismatchOnFlipFree,
      frameLoveFearMeetings: sum(covariance, 'loveFear'),
      frameSignFlips: sum(covariance, 'flips'),
      framePassages: sum(covariance, 'passages'),
      swapControlMismatch: sum(control, 'mismatch'),
      fermionMeetings: fermion.meetings,
      fermionKept: fermion.kept,
      fermionLoveFearMeetings: fermion.loveFearMeetings,
      fermionFreeChanges: fermion.freeChanges,
      fixedFrameBreaks: fermion.modelBroken,
      dockSamples: dockSamples.length,
      coinMapFailures: coinFailures,
      chargeConjugationFailures: conjugationFailures,
      involutionFailures: dockChanges,
      boxAutomorphisms,
      boxCoinMapFailures: boxCoinFailures,
      reverses: reverses ? 1 : 0,
      loveMinusFearKept: chargeKept ? 1 : 0,
      motionReversalFailures: motionFailures,
      cptFailures,
      lawsExact: lawsExact ? 1 : 0,
      wholesRead: states.wholes,
      nonStates: states.nonStates,
      leastEigenvalue: states.least,
      impure: states.impure,
      openChanges,
    },
  }
}
