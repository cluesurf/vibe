// Color from the roles, not the side sum: the three-trit role layer on the isometric knit (E-RLT-0066).
//
// THE QUESTION. The isometric knit (E-RLT-0061) keeps W(F4) and gives up exact local color in the classical
// side-sum sense: the dock content [W, x, y] mod 3, with a calm slot weighted by its side (code/rule/color-weave),
// changes on 5,273 of 21,152 docks. In the three-trit model color is the ROLE frame: carried by the links' Clifford
// moves, read by the comoving fear beat at meetings (adopted 2026-09-26). Hypothesis: the role-level color law is
// exact on the isometric knit, because the collision acts on the vibes and carries the tokens with them, and never
// reads a role. And which color is the physical one?
//
// WHAT CAN BE SAID BEFORE RUNNING. The side-sum content of a dock splits into the vibes' part, sum over held slots
// of v (1, a, b), and the calm slots' part, sum over calm slots of side (1, a, b). A coin map moves held slots
// with their tokens, so it keeps the vibes' part exactly; it moves calm slots to slots of the other side, so it
// changes the calm part. The calm part enters no meeting (a meeting needs two held slots) and no whole. It enters
// the vibes' color only where a PAIR IS MADE FROM CALM: the pair takes the two calm tokens' role points, and the
// color weave's side weighting is exactly what makes that bookkeeping exact (the love on the first side takes
// +p_first, the fear on the second -p_second, which is the calm part of that line). So the prediction is that the
// side sum matters physically only together with pair creation: while the count is kept (E-RLT-0061), the calm
// part is invisible; with a pair move (E-RLT-0064) it is color made from nothing, unless the pair is made only
// between two tokens that hold one role point (a NEUTRAL pair), which keeps the vibes' color exactly.
//
// THE RULE (code/rule/isometric-role-knit): the isometric knit (or the pair-making knit, E-RLT-0064) on the vibes,
// tokens riding with them, a closed token's role point moved by every link it crosses, and the whole advanced by
// the comoving fear beat (code/rule/fear-weave advanceWhole, color mode, frames on) at the meetings: two open
// tokens on the two slots of one line of a dock, both held, before the collision. On the side-3 integer torus with
// the color weave's links (makeColorWeave, bind table), E-FRC-0159's frame change (a golden frame per dock).
//
// Gates, fixed before the first run (E-SPN-0063's role-law gates, adapted to this knit; no probe was run):
//  G1 frame covariance (the Sigma(648) gate): with the links changed by a frame per dock and every whole
//     coordinate and own point moved by its dock's frame, the whole run on the changed links equals the moved
//     whole, 0 mismatches over 48 beats, on the two most-met matter pairs, for the isometric knit and for the
//     pair-making knit; the swap phase at love-fear meetings in place of the singlet phase (the control) gives
//     more than 0 mismatches on the isometric knit
//  G2 the fermion number (E-SPN-0059): on the twelve most-met pairs, three starts each, 480 beats, the comoving
//     beat keeps m_a + m_b at every like meeting and m_love - m_fear at every love-fear meeting (0 changes) and
//     changes no m on a meeting-free beat, on both knits; the fixed-frame beat breaks the kept combination at more
//     than 0 meetings (control)
//  G3 reversal: 96 beats forward and back in fixed units return the whole, its own points and the classical state
//     exactly, with love minus fear kept on every beat, on both knits
//  G4 the knots stay pure (81 sum w^2 = 9 units^2) on the three most-met pairs for 480 beats, both knits
//  G5 the classical layer is blind to the whole: opening every token changes no vibe, token or store over 48 beats
//  G6 on pure-gauge links the comoving and the fixed-frame beat give the same whole on every beat (two pairs)
//  G7 the vibes' color: with every token closed, over 48 beats of the isometric knit, the collision changes the
//     held slots' content sum v (1, a, b) mod 3 on 0 dock-beats, and the side-sum content on more than 0
//  G8 pair making and color: the plain pair move changes the held slots' content on more than 0 dock-beats (color
//     from nothing); the neutral pair move changes it on 0, still makes more than 0 pairs, and keeps charge,
//     momentum and energy exactly
//  G9 determinism: the role gates run twice give identical numbers
// Verdict: pass if G1 to G9 hold, fail otherwise.
//
// Depth L2. DETERMINISM: Kronecker trits and golden role points and frames, no draw. The husk is not read: this is
// a law of the bulk role layer on the dock grid, stated as such.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  conjugateSecond,
  fearKernels,
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
import { advanceComoving, comovingOf, ownMarginals, type ComovingWhole } from '@/code/rule/comoving-weave'
import { pureGaugeLinks, sameRatio } from '@/code/measure/comoving-parity'
import { makePairKnit, pairCharge, pairEnergy, pairMomentum, type PairTally } from '@/code/rule/pair-making-knit'
import { roleKnitBeat, roleKnitBeatBack, roleKnitState, type RoleKnit, type RoleKnitState } from '@/code/rule/isometric-role-knit'
import { kroneckerPairDock } from '@/code/measure/pair-knit-linearization'
import { pairDockCollide } from '@/code/rule/pair-making-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { weyl } from '@/code/tool/weyl'

const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

const GOLDEN = (Math.sqrt(5) - 1) / 2
const OMEGA = (2 * Math.PI) / 3
const SIDE_LENGTH = 3
const Q_BEATS = 480
const SEARCH_BEATS = 240
const GAUGE_BEATS = 48
const REVERSAL_BEATS = 96
const BOX_BEATS = 48
const RANKED_PAIRS = 12
const POINT_RATE = Math.sqrt(163) - Math.floor(Math.sqrt(163))

type KnitName = 'isometric' | 'pairMaking'

function makeRoleKnit(weave: ColorWeave, name: KnitName, neutral = false): RoleKnit {
  return { weave, knit: makePairKnit({ mesh: weave.mesh, pairs: name === 'pairMaking' }), neutral }
}

const withLinks = (knit: RoleKnit, links: Int16Array): RoleKnit => ({ ...knit, weave: { ...knit.weave, links } })

// the matter background: Kronecker trits per dock, role points from one Weyl rotation, stores for the pair knit
function background(weave: ColorWeave): { vibe: Int8Array; store: Int8Array; point: Int8Array } {
  const cells = weave.mesh.cellCount
  const vibe = new Int8Array(cells * 24)
  const store = new Int8Array(cells * 12)

  for (let x = 0; x < cells; x++) {
    const dock = kroneckerPairDock(11 + 7 * x)

    vibe.set(dock.vibe, x * 24)
    store.set(dock.store, x * 12)
  }

  return { vibe, store, point: Int8Array.from({ length: cells * 24 }, (_, i) => Math.floor(weyl(i + 1, POINT_RATE) * 9) % 9) }
}

function basisWhole(tokens: readonly number[], digits: readonly number[]): ComovingWhole {
  const weight = new Array<bigint>(9 ** tokens.length).fill(0n)

  for (let i = 0; i < weight.length; i++) {
    weight[i] = tokens.every((_, c) => Math.floor((Math.floor(i / 9 ** (tokens.length - 1 - c)) % 9) / 3) === digits[c]) ? 1n : 0n
  }

  return comovingOf({ tokens, weight })
}

const sameWhole = (a: Whole | null, b: Whole | null): boolean =>
  !!a && !!b && a.weight.length === b.weight.length && a.weight.every((w, i) => w === b.weight[i]) && (a.frame ?? []).join() === (b.frame ?? []).join()

function openOf(slots: number, tokens: readonly number[]): Uint8Array {
  const open = new Uint8Array(slots)

  for (const t of tokens) open[t] = 1

  return open
}

type Study = { name: KnitName; gates: Record<string, boolean>; metrics: Record<string, number> }

function roleStudy(name: KnitName): Study {
  const weave = makeColorWeave({ side: SIDE_LENGTH, table: 'bind' })
  const knit = makeRoleKnit(weave, name)
  const { mesh, moves } = weave
  const slots = mesh.cellCount * 24
  const fill = background(weave)
  const start = (): RoleKnitState => roleKnitState({ vibe: fill.vibe, point: fill.point, store: name === 'pairMaking' ? fill.store : undefined, cells: mesh.cellCount })
  const kernels = fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: false }) as FearKernels
  const back = fearKernels({ like: -OMEGA, unlike: -OMEGA, likeExchanged: false }) as FearKernels
  const swapControl: FearKernels = { ...kernels, unlike: conjugateSecond(wholeKernel(swapPhase(OMEGA), 1000)?.kernel ?? []), unlikeDivisor: 4 }
  const recordsOf = (k: RoleKnit, open: Uint8Array, beats: number): BeatRecord[] => {
    let state = start()
    const out: BeatRecord[] = []

    for (let t = 0; t < beats; t++) {
      const r = roleKnitBeat(k, state, open)

      state = r.state
      out.push(r.record)
    }

    return out
  }

  // the most-met pairs among dock 0's tokens
  const counts = new Map<string, number>()

  for (const r of recordsOf(knit, openOf(slots, Array.from({ length: 24 }, (_, s) => s)), SEARCH_BEATS)) {
    for (const [a, b] of r.meetings) {
      const key = `${Math.min(a, b)},${Math.max(a, b)}`

      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  const ranked = [...counts.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).map(([k]) => k.split(',').map(Number))
  const pairs = ranked.slice(0, RANKED_PAIRS)
  const advance = (w: ComovingWhole, record: BeatRecord, k: FearKernels, fixed: boolean, forward: boolean, onWeave: ColorWeave, comoving = true): ComovingWhole | null =>
    advanceComoving({ weave: onWeave, whole: w, record, color: k, fixed, forward, comoving })

  // G1: the frame change
  const frame = Array.from({ length: mesh.cellCount }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * moves.act.length))
  const gaugedLinks = new Int16Array(weave.links.length)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      gaugedLinks[x * 24 + d] = moves.compose(
        moves.compose(frame[mesh.neighbour(x, d)] ?? moves.identity, weave.links[x * 24 + d] ?? moves.identity),
        moves.inverse[frame[x] ?? moves.identity] ?? moves.identity,
      )
    }
  }

  const gauged = withLinks(knit, gaugedLinks)
  const transform = (state: RoleKnitState, whole: ComovingWhole): ComovingWhole => {
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
  const frameMismatch = (tokens: number[], k: FearKernels, digits: number[], beats = GAUGE_BEATS): { mismatch: number; loveFear: number; signFlips: number } => {
    const open = openOf(slots, tokens)
    const w0 = basisWhole(tokens, digits)
    let a = { state: start(), whole: w0 }
    let b = { state: start(), whole: transform(a.state, w0) }
    let mismatch = 0
    let loveFear = 0
    // a token met with the other sign than at its last meeting (reported after the first run, disclosed)
    let signFlips = 0
    const last = new Map<number, number>()

    for (let t = 0; t < beats; t++) {
      const ra = roleKnitBeat(knit, a.state, open)
      const rb = roleKnitBeat(gauged, b.state, open)

      ra.record.meetings.forEach(([ta, tb], m) => {
        const [sa, sb] = ra.record.signs?.[m] ?? [1, 1]

        signFlips += (last.has(ta) && last.get(ta) !== sa ? 1 : 0) + (last.has(tb) && last.get(tb) !== sb ? 1 : 0)
        last.set(ta, sa)
        last.set(tb, sb)
      })
      loveFear += (ra.record.signs ?? []).filter(([x, y]) => x !== y).length
      a = { state: ra.state, whole: advance(a.whole, ra.record, k, false, true, weave) as ComovingWhole }
      b = { state: rb.state, whole: advance(b.whole, rb.record, k, false, true, gauged.weave) as ComovingWhole }

      const expected = reduceWhole(transform(a.state, a.whole)).weight
      const actual = reduceWhole(b.whole).weight

      mismatch += expected.reduce((n, w, i) => n + (w === actual[i] ? 0 : 1), 0)
    }

    return { mismatch, loveFear, signFlips }
  }
  const covariance = pairs.slice(0, 2).map(p => frameMismatch(p, kernels, [0, 1]))
  const controlFrame = pairs.slice(0, 2).map(p => frameMismatch(p, swapControl, [0, 1]))
  // G1b, ADDED AFTER THE FIRST RUN (disclosed): the first run's two most-met pairs had no love-fear meeting in the
  // 48 gauge beats, so the swap-phase control could not bite and G1 failed on its control clause. The same test
  // over 480 beats on the two most-met pairs that have a love-fear meeting in 480 beats, gated as G1 was
  const loveFearPairs = pairs.filter(p => recordsOf(knit, openOf(slots, p), Q_BEATS).some(r => (r.signs ?? []).some(([x, y]) => x !== y))).slice(0, 2)
  const extended = loveFearPairs.map(p => frameMismatch(p, kernels, [0, 1], Q_BEATS))
  const extendedControl = loveFearPairs.map(p => frameMismatch(p, swapControl, [0, 1], Q_BEATS))

  // G2: the fermion number
  const fermion = { meetings: 0, kept: 0, freeChanges: 0, shareChanges: 0, modelBroken: 0, loveFearMeetings: 0 }

  for (const pair of pairs) {
    const records = recordsOf(knit, openOf(slots, pair), Q_BEATS)

    for (const digits of [
      [0, 0],
      [0, 1],
      [2, 1],
    ]) {
      for (const law of [true, false]) {
        let w: ComovingWhole = basisWhole(pair, digits)

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

  // G3: reversal in fixed units
  let reverses = true
  let chargeKept = true

  for (const pair of pairs.slice(0, 2)) {
    const units = 9n * 4n ** 200n * 3n ** 200n
    const open = openOf(slots, pair)
    const s0 = start()
    const whole0: ComovingWhole = comovingOf({ tokens: pair, weight: basisWhole(pair, [2, 0]).weight.map(x => x * (units / 9n)) })
    let state = s0
    let whole: ComovingWhole | null = whole0

    for (let t = 0; t < REVERSAL_BEATS; t++) {
      const r = roleKnitBeat(knit, state, open)

      state = r.state
      whole = whole ? advance(whole, r.record, kernels, true, true, weave) : null
      chargeKept = chargeKept && whole !== null && wholeUnits(whole) === units
    }

    for (let t = REVERSAL_BEATS - 1; t >= 0; t--) {
      const r = roleKnitBeatBack(knit, state, open)

      state = r.state
      whole = whole ? advance(whole, r.record, back, true, false, weave) : null
    }

    reverses =
      reverses &&
      whole !== null &&
      whole.weight.every((w, i) => w === whole0.weight[i]) &&
      whole.own.every((p, c) => p === whole0.own[c]) &&
      state.vibe.every((v, i) => v === s0.vibe[i]) &&
      state.token.every((v, i) => v === s0.token[i]) &&
      state.store.every((v, i) => v === s0.store[i])
  }

  // G4: purity
  let pure = true
  let fearsMax = 0n

  for (const pair of pairs.slice(0, 3)) {
    let w: ComovingWhole = basisWhole(pair, [0, 1])

    for (const record of recordsOf(knit, openOf(slots, pair), Q_BEATS)) {
      w = advance(w, record, kernels, false, true, weave) as ComovingWhole

      const units = wholeUnits(w)

      pure = pure && 81n * w.weight.reduce((s, x) => s + x * x, 0n) === 9n * units * units

      const { fears } = wholeLovesAndFears(w)

      fearsMax = fears > fearsMax ? fears : fearsMax
    }
  }

  // G5: blind
  let openChanges = 0

  {
    let none = start()
    let all = start()
    const noneOpen = new Uint8Array(slots)
    const allOpen = new Uint8Array(slots).fill(1)

    for (let t = 0; t < BOX_BEATS; t++) {
      none = roleKnitBeat(knit, none, noneOpen).state
      all = roleKnitBeat(knit, all, allOpen).state

      for (let i = 0; i < slots; i++) openChanges += (none.vibe[i] === all.vibe[i] ? 0 : 1) + (none.token[i] === all.token[i] ? 0 : 1)
      for (let i = 0; i < none.store.length; i++) openChanges += none.store[i] === all.store[i] ? 0 : 1
    }
  }

  // G6: pure gauge
  let pureGaugeDifferences = 0
  const gaugeKnit = withLinks(knit, pureGaugeLinks(weave))

  for (const pair of pairs.slice(0, 2)) {
    let a: ComovingWhole = basisWhole(pair, [0, 1])
    let b: Whole = basisWhole(pair, [0, 1])

    for (const record of recordsOf(gaugeKnit, openOf(slots, pair), Q_BEATS)) {
      a = advance(a, record, kernels, false, true, gaugeKnit.weave) as ComovingWhole
      b = advanceWhole({ weave: gaugeKnit.weave, whole: b, record, kernel4: [], color: kernels, fixed: false, forward: true, comoving: false }) as Whole
      pureGaugeDifferences += sameWhole(a, b) ? 0 : 1
    }
  }

  const covarianceMismatch = covariance.reduce((s, c) => s + c.mismatch, 0)
  const controlMismatch = controlFrame.reduce((s, c) => s + c.mismatch, 0)
  const gates: Record<string, boolean> = {
    frameCovariant: pairs.length >= 2 && covarianceMismatch === 0,
    fermionKept: fermion.meetings > 0 && fermion.kept === fermion.meetings && fermion.freeChanges === 0,
    fermionControlBreaks: fermion.modelBroken > 0,
    reverses,
    loveMinusFearKept: chargeKept,
    pure,
    blind: openChanges === 0,
    pureGauge: pureGaugeDifferences === 0,
    extendedFrameCovariant: loveFearPairs.length === 2 && extended.every(c => c.mismatch === 0),
    extendedControlBites: extendedControl.some(c => c.mismatch > 0),
  }

  return {
    name,
    gates,
    metrics: {
      extendedPairs: loveFearPairs.length,
      extendedFrameMismatch: extended.reduce((s, c) => s + c.mismatch, 0),
      extendedLoveFearMeetings: extended.reduce((s, c) => s + c.loveFear, 0),
      extendedSwapControlMismatch: extendedControl.reduce((s, c) => s + c.mismatch, 0),
      extendedTokenSignFlips: extended.reduce((s, c) => s + c.signFlips, 0),
      extendedMismatchOnPairWithoutFlips: extended.filter(c => c.signFlips === 0).reduce((s, c) => s + c.mismatch, 0),
      extendedPairsWithoutFlips: extended.filter(c => c.signFlips === 0).length,
      pairsFound: ranked.length,
      topPairMeetings: counts.get(`${pairs[0]?.[0]},${pairs[0]?.[1]}`) ?? 0,
      frameMismatch: covarianceMismatch,
      frameLoveFearMeetings: covariance.reduce((s, c) => s + c.loveFear, 0),
      swapControlFrameMismatch: controlMismatch,
      fermionMeetings: fermion.meetings,
      fermionKept: fermion.kept,
      fermionLoveFearMeetings: fermion.loveFearMeetings,
      fermionFreeChanges: fermion.freeChanges,
      fermionShareChanges: fermion.shareChanges,
      fixedFrameBreaks: fermion.modelBroken,
      reverses: reverses ? 1 : 0,
      pure: pure ? 1 : 0,
      fearsMax: Number(fearsMax),
      openChanges,
      pureGaugeDifferences,
    },
  }
}

// G7, G8: the vibes' color and the side-sum color through the collision, every token closed
function colorContents(name: KnitName, neutral: boolean): { heldChanges: number; sideChanges: number; dockBeats: number; made: number; unmade: number; lawsExact: boolean } {
  const weave = makeColorWeave({ side: SIDE_LENGTH, table: 'bind' })
  const knit = makeRoleKnit(weave, name, neutral)
  const cells = weave.mesh.cellCount
  const fill = background(weave)
  let state = roleKnitState({ vibe: fill.vibe, point: fill.point, store: name === 'pairMaking' ? fill.store : undefined, cells })
  const closed = new Uint8Array(cells * 24)
  const mod3 = (x: number): number => ((x % 3) + 3) % 3
  const content = (s: { vibe: Int8Array; token: Int32Array; point: Int8Array }, x: number, held: boolean): string => {
    let w = 0
    let qx = 0
    let qy = 0

    for (let d = 0; d < 24; d++) {
      const v = s.vibe[x * 24 + d] as number

      if (held && v === 0) continue

      const wt = v !== 0 ? v : weave.side[d] ?? 1
      const p = s.point[s.token[x * 24 + d] as number] as number

      w += wt
      qx += wt * (p % 3)
      qy += wt * Math.floor(p / 3)
    }

    return `${mod3(w)},${mod3(qx)},${mod3(qy)}`
  }
  const tally: PairTally = { made: 0, unmade: 0 }
  const q0 = pairCharge(state)
  const e0 = pairEnergy(state)
  const p0 = pairMomentum(state)
  let heldChanges = 0
  let sideChanges = 0
  let lawsExact = true

  for (let t = 0; t < BOX_BEATS; t++) {
    const vibe = Int8Array.from(state.vibe)
    const store = Int8Array.from(state.store)
    const token = Int32Array.from(state.token)
    const probe = { vibe, token, point: state.point }

    for (let x = 0; x < cells; x++) {
      const heldBefore = content(probe, x, true)
      const sideBefore = content(probe, x, false)

      // the knit's own dock collision, with the neutral veto when asked (the same the beat applies)
      pairDockCollide(knit.knit, { vibe, store }, x, token, tally, neutral ? neutralVeto(token, state.point) : undefined)
      heldChanges += content(probe, x, true) === heldBefore ? 0 : 1
      sideChanges += content(probe, x, false) === sideBefore ? 0 : 1
    }

    state = roleKnitBeat(knit, state, closed).state
    lawsExact = lawsExact && pairCharge(state) === q0 && pairEnergy(state) === e0 && pairMomentum(state).every((v, k) => v === p0[k])
  }

  return { heldChanges, sideChanges, dockBeats: BOX_BEATS * cells, made: tally.made, unmade: tally.unmade, lawsExact }
}

// the neutral veto on the classical points (as code/rule/isometric-role-knit applies it)
function neutralVeto(token: Int32Array, point: Int8Array): (base: number, l: number) => boolean {
  return (base, l) => point[token[base + (LINE_FIRSTS[l] as number)] as number] === point[token[base + (LINE_SECONDS[l] as number)] as number]
}

export default experiment({
  id: 'relativity/role-color-isometric',
  code: 'E-RLT-0066',
  title:
    "color from the roles on the isometric knit, fail on one control clause as registered: with tokens riding the isometric coin map and the comoving fear beat at head-on meetings, the frame change commutes with the run (0 mismatches; the 48-beat test met no love-fear pair, so its swap-phase control read 0, and over 480 beats, added after the first run, 0 mismatches against the control's 48,825), the fermion number is kept at 54 of 54 meetings (fixed-frame beat breaks 26), reversal, purity and love minus fear exact, and the collision keeps the held slots' color on 3,888 of 3,888 dock-beats while the side sum moves on 2,030; the side sum matters only with pair creation: the plain covariant pair move makes color from nothing on 1,530 dock-beats and breaks frame covariance where a token unmade into the store is remade with the other sign (5,928 mismatches, all on the pair whose tokens flipped), while a neutral pair move (only between equal role points) keeps the held color exactly (0) and still makes 749 pairs",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const studies = (['isometric', 'pairMaking'] as const).map(roleStudy)
    const again = (['isometric', 'pairMaking'] as const).map(roleStudy)
    const deterministic = JSON.stringify(studies.map(s => s.metrics)) === JSON.stringify(again.map(s => s.metrics))
    const [iso, pair] = studies as [Study, Study]
    const plain = colorContents('isometric', false)
    const pairPlain = colorContents('pairMaking', false)
    const pairNeutral = colorContents('pairMaking', true)

    const roleGates = [iso, pair].every(s => s.gates.frameCovariant && s.gates.fermionKept && s.gates.reverses && s.gates.loveMinusFearKept && s.gates.pure && s.gates.blind && s.gates.pureGauge)
    const controls = iso.metrics.swapControlFrameMismatch! > 0 && [iso, pair].every(s => s.gates.fermionControlBreaks)
    const g7 = plain.heldChanges === 0 && plain.sideChanges > 0 && plain.lawsExact
    const g8 = pairPlain.heldChanges > 0 && pairNeutral.heldChanges === 0 && pairNeutral.made > 0 && pairNeutral.lawsExact && pairPlain.lawsExact
    const ok = roleGates && controls && g7 && g8 && deterministic

    const metrics: Record<string, number> = {
      deterministic: deterministic ? 1 : 0,
      isometricHeldColorChanges: plain.heldChanges,
      isometricSideSumChanges: plain.sideChanges,
      dockBeats: plain.dockBeats,
      pairPlainHeldColorChanges: pairPlain.heldChanges,
      pairPlainSideSumChanges: pairPlain.sideChanges,
      pairPlainMade: pairPlain.made,
      pairPlainUnmade: pairPlain.unmade,
      pairNeutralHeldColorChanges: pairNeutral.heldChanges,
      pairNeutralSideSumChanges: pairNeutral.sideChanges,
      pairNeutralMade: pairNeutral.made,
      pairNeutralUnmade: pairNeutral.unmade,
      seconds: 0,
    }

    for (const s of studies) {
      for (const [k, v] of Object.entries(s.metrics)) metrics[`${s.name}_${k}`] = v
      for (const [k, v] of Object.entries(s.gates)) metrics[`${s.name}_gate_${k}`] = v ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `${ok ? '' : 'fail on G1\'s control clause, as registered: the two most-met pairs met no love-fear pair in the 48 gauge beats, so the swap-phase control could not bite; '}on the isometric knit the role-level color law holds on every reading: the frame change commutes with the run (${iso.metrics.frameMismatch} mismatches in 48 beats; over 480 beats on the two pairs with love-fear meetings, added after the first run, ${iso.metrics.extendedFrameMismatch} mismatches at ${iso.metrics.extendedLoveFearMeetings} love-fear meetings, where the swap-phase control gives ${iso.metrics.extendedSwapControlMismatch}), the comoving fear beat keeps the fermion number at ${iso.metrics.fermionKept} of ${iso.metrics.fermionMeetings} meetings (the fixed-frame beat breaks it at ${iso.metrics.fixedFrameBreaks}), reversal, purity and love minus fear are exact; on the pair-making knit the fermion number (${pair.metrics.fermionKept} of ${pair.metrics.fermionMeetings}), reversal and purity hold and the frame test passes in 48 beats, but over 480 beats it breaks (${pair.metrics.extendedFrameMismatch} mismatches, ${pair.metrics.extendedMismatchOnPairWithoutFlips} of them on pairs whose tokens never changed sign) where a token unmade into the store is remade with the other sign (${pair.metrics.extendedTokenSignFlips} sign changes at meetings, against ${iso.metrics.extendedTokenSignFlips} on the isometric knit); the collision keeps the held slots' color on every dock-beat (${plain.heldChanges} of ${plain.dockBeats} change) while the side sum moves on ${plain.sideChanges}; the side sum matters only with pair creation: the plain pair move makes color from nothing on ${pairPlain.heldChanges} dock-beats, the neutral one on ${pairNeutral.heldChanges} while making ${pairNeutral.made} pairs`,
      metrics,
      control: { swapPhaseFrameMismatch: iso.metrics.swapControlFrameMismatch ?? -1, fixedFrameFermionBreaks: iso.metrics.fixedFrameBreaks ?? -1 },
      notes: `L2. Gates: role gates G1 to G6 ${roleGates} (isometric ${JSON.stringify(iso.gates)}, pair-making ${JSON.stringify(pair.gates)}), controls ${controls}, G7 ${g7}, G8 ${g8}, G9 ${deterministic}. First run recorded as is: every gate held but G1's control clause (the swap-phase control gave 0 mismatches because the two most-met pairs had no love-fear meeting in 48 beats; meetings are rare on this knit, 54 at 12 pairs over 480 beats). DISCLOSED: G1b was added after the first run and does not change the registered verdict: the same frame test over 480 beats on the two most-met pairs that have a love-fear meeting (extended covariant: isometric ${iso.gates.extendedFrameCovariant}, pair-making ${pair.gates.extendedFrameCovariant}; control bites: isometric ${iso.gates.extendedControlBites}, pair-making ${pair.gates.extendedControlBites}). The pair-making failure was found by G1b, and the count of tokens met with the other sign than at their last meeting was added after that run to locate it (disclosed): every mismatch sits on the pair whose tokens changed sign. Why: a token unmade into the store keeps its slot, and a pair remade there can give that slot the other sign; the whole then rewrites the coordinate into the other frame by the reflection (a, b) -> (a, -b), which is antisymplectic and does not commute with a frame change (E-QTM-0123), so a role that crosses from love to fear through the store is not covariant. The combined knit never meets this because its tokens never change sign (E-SPN-0063's tokenSignsKept gate). A pair move that keeps role covariance must give a remade vibe a fresh role (not the calm token's) or never flip a token's sign; not built here. The role layer is the knit's own (advanceWhole in color mode with frames, comoving), with the isometric coin map in place of the combined knit's wire tables; a meeting is two held slots of one line of a dock before the collision, as combined-knit records it at a wire. Tokens ride with their vibes and never change sign, so no frame rewrite occurs on the isometric knit; on the pair-making knit a token's vibe can go calm and come back. The neutral pair move reads classical role points, so it is tested with every token closed; with open tokens it would need each token's own point, which E-SPN-0063 shows is record data, and that is not built here. Husk not read: a law of the role layer on the side-3 dock torus.`,
    })
  },
})
