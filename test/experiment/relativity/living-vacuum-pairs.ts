// Vacuum pairs that live across beats: the candidate knit with the pair move applied once per beat, alternately before
// and after the coin map (code/rule/living-pair-knit), E-RLT-0074.
//
// THE BLOCKER (E-RLT-0070). The candidate knit's collision is P K P. Its hot vacuum makes every pair and unmakes it
// inside one collision, so no vacuum token is ever held between collisions, no two meet, and the fear beat never acts
// in the vacuum: 6 of the battery's 14 quantum gates had nothing to read.
//
// DERIVED FIRST (the rule file's header carries each step):
//  (a) THE PALINDROME CANNOT BE REPAIRED. On a calm dock with every store holding a unit, the first P fills the dock,
//      whose momentum is then 0, where every covariant coin map K is the identity or -1; P commutes with both, so the
//      second P returns the calm dock. Any collision with P on both sides of K kills the vacuum's pairs inside itself.
//  (b) SO P ACTS ONCE PER BEAT, and a made pair meets the stream before the next P. Every word in P, K and the stream
//      keeps W(F4) and charge conjugation (each piece does) and is a bijection. What decides the variant is the motion
//      reversal. One phase (S K P every beat, 'first'): T U T = U^-1 with T = S R needs K P = P K, false, and no
//      other T is offered. Two phases alternating (S K P on even beats, S P K on odd, 'alternate'): with T = S R,
//      T U_0 T = U_1^-1 and T U_1 T = U_0^-1 exactly (R P R = P, R K R = K, R S R = S^-1). So the alternating
//      schedule is the one that keeps motion reversal, and CPT with it; it is the rule tested here.
//  (c) THE HOT VACUUM on it: made on beat 0, each unit's love and fear stream apart; on beat 1 every dock is full, K =
//      -1 turns every vibe round, and P meets a love and a fear of two DIFFERENT units on every line, which the veto
//      must refuse; on beat 2 each unit's own two tokens are home again on their own line with their points restored
//      (a link, then its inverse), and P unmakes them into the store with +1. Beats 3 to 5 repeat it with the love
//      going the other way. Period 6, the store +1 at every calm beat, every vacuum pair alive for two beats, and its
//      two tokens meet again. The veto at beat 1 holds exactly when the stored points obey condition (A),
//      link(x, f) p(x) != link(x + 2r, s) p(x + 2r), which a greedy layout always meets (two constraints, nine points).
//
// Gates, fixed before the first run (the side-3 box with the color weave's links, bind table):
//  G1 W(F4) and C: both collisions (K P and P K) commute with all 1,152 coin maps and with charge conjugation on 162
//     sample docks (the golden fill on the hot vacuum after 5 beats, and E-RLT-0067's Kronecker start after 5), and
//     all 1,152 box automorphisms commute with a beat of each parity on the box (0 failures)
//  G2 reversal: 96 beats forward and back return every trit, token, place and point (three starts); the motion
//     reversal T = S R obeys T U_t = U_(t+1)^-1 T on three starts and both parities (0 failures), and CPT (charge
//     conjugation, the inversion with its cell map and links, and T) likewise (0 failures)
//  G3 charge, momentum and energy E = count + 2 sum |tau| exact over 96 beats on two starts
//  G4 the held color through every collision (0 of the box's dock-beats over 48 beats) and no token sign flip at any
//     meeting of an all-open 240-beat run on the golden fill
//  G5 THE LIVING VACUUM (derived in (c)): on the side-3, 5, 7 and 9 boxes the separated layout meets (A) everywhere,
//     and the hot vacuum runs exactly as derived: period 6, every dock making 12 pairs on beats 0 and 3 mod 6,
//     refusing 12 on beats 1 and 4, unmaking 12 on beats 2 and 5 and nothing else, the store +1 on every line after
//     beats 2 and 5; on the side-3 box with every token open, every meeting in 24 beats falls on beats 1 or 2 mod 3,
//     those on beats 2 mod 3 all between a unit's own two tokens and those on beats 1 mod 3 all between two units
//  G6 THE FEAR BEAT ACTS IN THE VACUUM: dock 0's vacuum pair (the battery's search, slot tokens then place tokens)
//     meets within 24 beats, meets at least 150 times in 480 beats (160 derived), and with the fear beat on the
//     whole carries fears at a meeting (with it off, none)
// Controls, fixed before the first run:
//  C1 the palindrome P K P (E-RLT-0067's candidate): no two tokens meet on the hot vacuum in 24 beats, every token open
//  C2 the one-phase schedule 'first': still a bijection (96 beats back and forth), but the motion reversal T = S R
//     fails (failures > 0), so G2 can fail
//  C3 a layout that breaks (A) (every stored point 0, on flat links): the veto refuses nothing on the vacuum and the
//     period is not 6, so G5's vacuum depends on the layout as derived
// Verdict: pass if G1 to G6 and C1 to C3 hold; fail if G1 to G4 and C1 to C3 hold and G5 or G6 does not; partial
// otherwise.
//
// DISCLOSED: tmp/live-probe1.ts ran before this file was written: the kernel agreed with the rule bit for bit on four
// side-3 starts, the layout met (A) on sides 3 to 9, and the vacuum's period (6) and its make, refuse and unmake counts
// per beat were read, which are G5's numbers (derived first in the rule file, then seen). tmp/live-probe2.ts computed
// the orbits of the uniform hot orientations (for E-RLT-0076).
//
// FIRST RUN (100.4 s): fail, on G6 alone (the vacuum pair meets 160 times but its whole never carries a fear, on or
// off). ADDED AFTER THE FIRST RUN, a reading with no gate and no gate moved (the second run reproduces every gated
// number): the whole of the vacuum pair from each of the 9 basis starts, the meetings that change it and the distinct
// wholes it visits. G6 as written asked for fears; what the reading shows is that the fear beat does act (the whole
// changes at all 160 meetings from an equal-digit start) and still makes none, for a structural reason stated in the
// notes.
//
// Depth L2. DETERMINISM: golden and Kronecker starts, fixed layouts, no draw. The husk is not read here (a rule's
// symmetries and its vacuum, stated as bulk facts); the husk transport is E-RLT-0075's.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { cloneStoreState, sameStoreState, storeCharge, storeEnergy, transformLinks, transformStoreState, type TokenStoreState } from '@/code/rule/token-store-knit'
import {
  layoutViolations,
  livingBeat,
  livingBeatBack,
  livingCollide,
  livingMotionReversal,
  livingState,
  makeLivingKnit,
  separatedLayout,
  type LivingKnit,
  type LivingSchedule,
} from '@/code/rule/living-pair-knit'
import { livingRunner, livingVacuum, makeLivingKernel, type KernelTally } from '@/code/measure/living-pair-kernel'
import { goldenFill } from '@/code/measure/candidate-kernel'
import { storeStart } from '@/code/measure/token-store-gates'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { boxCellMap, linearMapOf } from '@/code/substrate/d4-box'
import { advanceWhole, reduceWhole, wholeLovesAndFears, type Whole } from '@/code/rule/fear-weave'
import { exactFearKernels } from '@/code/rule/fear-kernel-exact'

const ROOTS = rootsD4()
const SIDE_LENGTH = 3

const weave = makeColorWeave({ side: SIDE_LENGTH, table: 'bind' })
const cells = weave.mesh.cellCount
const slots = cells * 24
const tokens = slots * 2
const layout = separatedLayout(weave)

const hotGolden = (): TokenStoreState => livingState({ ...goldenFill(slots, 1.37), tau: 1, layout })
const hotVacuum = (on: ColorWeave = weave, lay: Int8Array = layout): TokenStoreState =>
  livingState({ vibe: new Int8Array(on.mesh.cellCount * 24), point: new Int8Array(on.mesh.cellCount * 24), tau: 1, layout: lay })
const starts = (): TokenStoreState[] => [hotGolden(), storeStart(cells, 101), storeStart(cells, 2003)]

function run(k: LivingKnit, s: TokenStoreState, beats: number, open?: Uint8Array): TokenStoreState {
  const o = open ?? new Uint8Array(s.point.length)
  let x = s

  for (let t = 0; t < beats; t++) x = livingBeat(k, x, o, t).state

  return x
}

// G1
function covariance(k: LivingKnit): { coinFailures: number; conjugationFailures: number; dockSamples: number; boxAutomorphisms: number; boxFailures: number } {
  const permutations = weylF4DirectionPermutations({ directions: ROOTS })
  const samples: TokenStoreState[] = []

  for (const start of [hotGolden(), storeStart(cells, 11)]) {
    const s = run(k, start, 5)

    for (let x = 0; x < cells; x++) {
      samples.push({
        vibe: s.vibe.slice(x * 24, x * 24 + 24),
        store: s.store.slice(x * 12, x * 12 + 12),
        token: s.token.slice(x * 24, x * 24 + 24),
        place: s.place.slice(x * 24, x * 24 + 24),
        point: s.point,
        label: s.label,
      })
    }
  }

  const failures = (g: readonly number[], sign: number): number => {
    let bad = 0

    for (const t of [0, 1]) {
      for (const x of samples) {
        const gx = transformStoreState(x, [0], g, sign)

        livingCollide(k, gx, 0, t)

        const cx = cloneStoreState(x)

        livingCollide(k, cx, 0, t)
        bad += sameStoreState(gx, transformStoreState(cx, [0], g, sign)) ? 0 : 1
      }
    }

    return bad
  }
  let coinFailures = 0

  for (const g of permutations) coinFailures += failures(g, 1)

  const conjugationFailures = failures(
    Array.from({ length: 24 }, (_, d) => d),
    -1,
  )
  const boxStart = run(k, storeStart(cells, 777), 3)
  const none = new Uint8Array(tokens)
  let boxAutomorphisms = 0
  let boxFailures = 0

  for (const g of permutations) {
    const matrix = linearMapOf(g)
    const cellMap = matrix ? boxCellMap({ matrix, side: SIDE_LENGTH }) : undefined

    if (!cellMap) continue

    boxAutomorphisms++

    const kg: LivingKnit = { ...k, weave: { ...weave, links: transformLinks(weave.links, cellMap, g) } }

    for (const t of [0, 1]) {
      const lhs = livingBeat(kg, transformStoreState(boxStart, cellMap, g), none, t).state
      const rhs = transformStoreState(livingBeat(k, boxStart, none, t).state, cellMap, g)

      boxFailures += sameStoreState(lhs, rhs) ? 0 : 1
    }
  }

  return { coinFailures, conjugationFailures, dockSamples: samples.length, boxAutomorphisms, boxFailures }
}

// G2 and C2
function reversal(schedule: LivingSchedule): { reverses: boolean; motionFailures: number; cptFailures: number } {
  const k = makeLivingKnit(weave, schedule)
  const none = new Uint8Array(tokens)
  let reverses = true

  for (const start of starts()) {
    let s = start

    for (let t = 0; t < 96; t++) s = livingBeat(k, s, none, t).state
    for (let t = 95; t >= 0; t--) s = livingBeatBack(k, s, none, t).state

    reverses = reverses && sameStoreState(s, start)
  }

  const permutations = weylF4DirectionPermutations({ directions: ROOTS })
  let inversionCells: number[] = []

  for (const g of permutations) {
    if (!g.every((image, d) => image === OPPOSITE[d])) continue

    const matrix = linearMapOf(g)

    inversionCells = matrix ? (boxCellMap({ matrix, side: SIDE_LENGTH }) ?? []) : []
  }

  const kp: LivingKnit = { ...k, weave: { ...weave, links: transformLinks(weave.links, inversionCells, OPPOSITE) } }
  let motionFailures = 0
  let cptFailures = 0

  for (const x of starts()) {
    for (const t of [0, 1]) {
      // T U_t x against U_(t+1)^-1 T x
      const lhs = livingMotionReversal(k, livingBeat(k, x, none, t).state, t)
      const rhs = livingBeatBack(k, livingMotionReversal(k, x, t + 1), none, t + 1).state

      motionFailures += sameStoreState(lhs, rhs) ? 0 : 1

      // CPT: M = charge conjugation with the inversion carries the knit onto kp; M^-1 T U_t T M x = U_(t+1)^-1 x
      const m = transformStoreState(x, inversionCells, OPPOSITE, -1)
      const y = livingBeat(kp, livingMotionReversal(kp, m, t), none, t).state
      const undone = transformStoreState(livingMotionReversal(kp, y, t + 1), inversionCells, OPPOSITE, -1)

      cptFailures += sameStoreState(undone, livingBeatBack(k, x, none, t + 1).state) ? 0 : 1
    }
  }

  return { reverses, motionFailures, cptFailures: inversionCells.length === cells ? cptFailures : -1 }
}

// G3
function laws(k: LivingKnit): boolean {
  const none = new Uint8Array(tokens)
  const momentum = (st: TokenStoreState): number[] => {
    const p = [0, 0, 0, 0]

    for (let i = 0; i < st.vibe.length; i++) if (st.vibe[i] !== 0) (ROOTS[i % 24] as number[]).forEach((v, c) => (p[c] = (p[c] as number) + v))

    return p
  }
  let exact = true

  for (const start of [hotGolden(), storeStart(cells, 11)]) {
    let s = start
    const q0 = storeCharge(s)
    const e0 = storeEnergy(s)
    const p0 = momentum(s)

    for (let t = 0; t < 96; t++) {
      s = livingBeat(k, s, none, t).state
      exact = exact && storeCharge(s) === q0 && storeEnergy(s) === e0 && momentum(s).every((v, c) => v === p0[c])
    }
  }

  return exact
}

// G4
function heldColorAndSigns(k: LivingKnit): { leaks: number; dockBeats: number; flips: number; meetings: number } {
  const none = new Uint8Array(tokens)
  const content = (s: TokenStoreState, x: number): number => {
    let w = 0
    let qx = 0
    let qy = 0

    for (let d = 0; d < 24; d++) {
      const v = s.vibe[x * 24 + d] as number

      if (v === 0) continue

      const p = s.point[s.token[x * 24 + d] as number] as number

      w += v
      qx += v * (p % 3)
      qy += v * Math.floor(p / 3)
    }

    const m = (v: number): number => ((v % 3) + 3) % 3

    return m(w) * 9 + m(qx) * 3 + m(qy)
  }
  let s = hotGolden()
  let leaks = 0

  for (let t = 0; t < 48; t++) {
    const probe = cloneStoreState(s)

    for (let x = 0; x < cells; x++) {
      const before = content(probe, x)

      livingCollide(k, probe, x, t)
      leaks += content(probe, x) === before ? 0 : 1
    }

    s = livingBeat(k, s, none, t).state
  }

  const all = new Uint8Array(tokens).fill(1)
  const last = new Int8Array(tokens)
  let flips = 0
  let meetings = 0

  s = hotGolden()

  for (let t = 0; t < 240; t++) {
    const r = livingBeat(k, s, all, t)

    r.record.meetings.forEach(([a, b], m) => {
      const [sa, sb] = r.record.signs?.[m] ?? [1, 1]

      flips += (last[a] !== 0 && last[a] !== sa ? 1 : 0) + (last[b] !== 0 && last[b] !== sb ? 1 : 0)
      last[a] = sa
      last[b] = sb
      meetings++
    })
    s = r.state
  }

  return { leaks, dockBeats: 48 * cells, flips, meetings }
}

// G5, and C3
function vacuumPattern(on: ColorWeave, lay: Int8Array, beats: number): { period: number; exact: boolean; vetoed: number; tallies: string } {
  const k = makeLivingKernel(on)
  const n = 12 * on.mesh.cellCount
  const r = livingRunner(k, livingVacuum(on.mesh.cellCount, 1, lay))
  const states: string[] = []
  const seen: string[] = []
  let exact = true
  let vetoed = 0

  for (let t = 0; t < beats; t++) {
    states.push(`${r.state().vibe.join('')}|${r.state().store.join('')}`)

    const tally: KernelTally = { made: 0, unmade: 0, vetoed: 0 }

    r.beat(tally)
    vetoed += tally.vetoed

    const phase = t % 3
    const expected = phase === 0 ? [n, 0, 0] : phase === 1 ? [0, 0, n] : [0, n, 0]

    exact = exact && tally.made === expected[0] && tally.unmade === expected[1] && tally.vetoed === expected[2]

    if (phase === 2) exact = exact && r.state().store.every(v => v === 1)

    if (t < 6) seen.push(`${tally.made}/${tally.unmade}/${tally.vetoed}`)
  }

  states.push(`${r.state().vibe.join('')}|${r.state().store.join('')}`)

  let period = 0

  for (let p = 1; p <= 24 && period === 0; p++) if (states.every((x, t) => t + p >= states.length || x === states[t + p])) period = p

  return { period, exact: exact && period === 6, vetoed, tallies: seen.join(' ') }
}

function partnerMeetings(k: LivingKnit, beats: number): { partner: number; across: number; stray: number } {
  const all = new Uint8Array(tokens).fill(1)
  let s = hotVacuum()
  let partner = 0
  let across = 0
  let stray = 0

  for (let t = 0; t < beats; t++) {
    const r = livingBeat(k, s, all, t)

    for (const [a, b] of r.record.meetings) {
      // a unit's own two tokens are the two place tokens it starts with (the store returns them)
      const own = a >= slots && b >= slots && Math.floor((a - slots) / 2) === Math.floor((b - slots) / 2)

      if (t % 3 === 2 && own) partner++
      else if (t % 3 === 1 && !own) across++
      else stray++
    }

    s = r.state
  }

  return { partner, across, stray }
}

// G6 and C1: the vacuum pair, the battery's search
function vacuumPair(k: LivingKnit): { pair: number[]; kind: number } {
  const openOf = (pair: number[]): Uint8Array => {
    const o = new Uint8Array(tokens)

    for (const t of pair) o[t] = 1

    return o
  }
  const firsts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(l => {
    const f = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].filter(d => d < (OPPOSITE[d] ?? d))[l] as number

    return [f, OPPOSITE[f] as number]
  })

  for (let kind = 0; kind < 2; kind++) {
    for (let l = 0; l < 12; l++) {
      const pair = kind === 0 ? (firsts[l] as number[]) : [slots + 2 * l, slots + 2 * l + 1]
      let s = hotVacuum()
      const open = openOf(pair)

      for (let t = 0; t < 24; t++) {
        const r = livingBeat(k, s, open, t)

        if (r.record.meetings.length > 0) return { pair, kind }

        s = r.state
      }
    }
  }

  return { pair: [], kind: -1 }
}

// the vacuum pair's whole from a basis start (both roles at the given digits; E-FRC-0159's vacuum start is 0, 0),
// 480 beats: its meetings, the most fears it carries at a meeting, the meetings that change the whole (added after
// the first run, a reading), and the distinct wholes it visits at meetings
function fearInVacuum(k: LivingKnit, pair: number[], mode: 'on' | 'off', digits: readonly number[] = [0, 0]): { meetings: number; fearsMax: number; changes: number; distinct: number } {
  const kernels = exactFearKernels({ like: mode === 'on' ? 1 : 0, unlike: mode === 'on' ? 1 : 0, likeExchanged: false })
  const open = new Uint8Array(tokens)

  for (const t of pair) open[t] = 1

  const weight = new Array<bigint>(81).fill(0n)

  for (let i = 0; i < 81; i++) weight[i] = Math.floor(Math.floor(i / 9) / 3) === digits[0] && Math.floor((i % 9) / 3) === digits[1] ? 1n : 0n

  let whole: Whole = { tokens: pair, weight }
  let s = hotVacuum()
  let meetings = 0
  let fearsMax = 0n
  let changes = 0
  const seen = new Set<string>()

  for (let t = 0; t < 480; t++) {
    const r = livingBeat(k, s, open, t)
    const before = reduceWhole(whole).weight.join(',')

    whole = advanceWhole({ weave, whole, record: r.record, kernel4: [], color: kernels, fixed: false, forward: true }) as Whole

    if (r.record.meetings.length > 0) {
      meetings += r.record.meetings.length

      const f = wholeLovesAndFears(whole).fears
      const after = reduceWhole(whole).weight.join(',')

      fearsMax = f > fearsMax ? f : fearsMax
      changes += after === before ? 0 : 1
      seen.add(after)
    }

    s = r.state
  }

  return { meetings, fearsMax: Number(fearsMax), changes, distinct: seen.size }
}

export default experiment({
  id: 'relativity/living-vacuum-pairs',
  code: 'E-RLT-0074',
  title:
    "vacuum pairs that live across beats, fail on one gate (the vacuum pair carries no fear): the pair move applied once per beat, alternately before and after the coin map, keeps W(F4) (0 failures over 1,152 coin maps on both collisions and 1,152 box automorphisms), charge conjugation, exact reversal, the motion reversal T = S R (0 failures; the one-phase schedule fails 6 of 6), CPT, charge, momentum and energy, the held color and every token's sign; its hot vacuum runs exactly as derived on sides 3 to 9 (period 6, each dock making, refusing and unmaking 12 pairs in turn), every vacuum pair streams two beats and meets its own partner again (7,776 partner and 7,776 cross meetings in 24 beats, 0 stray) where the palindrome's vacuum meets 0 times, and dock 0's pair meets 160 times in 480 beats; but it meets only its partner with net identity transport, so the love-fear kernel (I + (omega - 1) P, P on the correlated state sum_j |j, j>) cycles it through 3 wholes from an equal-digit start, leaves the other 6 basis starts untouched, and never makes a fear",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const k = makeLivingKnit(weave)
    const cov = covariance(k)
    const rev = reversal('alternate')
    const lawsExact = laws(k)
    const held = heldColorAndSigns(k)
    const boxes = [3, 5, 7, 9].map(side => {
      const w = side === SIDE_LENGTH ? weave : makeColorWeave({ side, table: 'bind' })
      const lay = side === SIDE_LENGTH ? layout : separatedLayout(w)

      return { side, violations: layoutViolations(w, lay), ...vacuumPattern(w, lay, 24) }
    })
    const partners = partnerMeetings(k, 24)
    const pair = vacuumPair(k)
    const fearOn = pair.pair.length === 2 ? fearInVacuum(k, pair.pair, 'on') : { meetings: 0, fearsMax: 0, changes: 0, distinct: 0 }
    const fearOff = pair.pair.length === 2 ? fearInVacuum(k, pair.pair, 'off') : { meetings: 0, fearsMax: 0, changes: 0, distinct: 0 }
    // added after the first run (a reading, no gate): every basis start of the vacuum pair
    const digitScan = pair.pair.length === 2 ? [0, 1, 2].flatMap(a => [0, 1, 2].map(b => ({ a, b, ...fearInVacuum(k, pair.pair, 'on', [a, b]) }))) : []

    // controls
    const palindrome = makeLivingKnit(weave, 'palindrome')
    const paliMeetings = (() => {
      const all = new Uint8Array(tokens).fill(1)
      let s = hotVacuum()
      let n = 0

      for (let t = 0; t < 24; t++) {
        const r = livingBeat(palindrome, s, all, t)

        n += r.record.meetings.length
        s = r.state
      }

      return n
    })()
    const first = reversal('first')
    const flatWeave: ColorWeave = { ...weave, links: new Int16Array(slots).fill(weave.moves.identity) }
    const equalLayout = new Int8Array(cells * 12)
    const broken = vacuumPattern(flatWeave, equalLayout, 24)
    const flatSeparated = separatedLayout(flatWeave)
    const flatGood = vacuumPattern(flatWeave, flatSeparated, 24)

    const g1 = cov.coinFailures === 0 && cov.conjugationFailures === 0 && cov.boxAutomorphisms === 1152 && cov.boxFailures === 0
    const g2 = rev.reverses && rev.motionFailures === 0 && rev.cptFailures === 0
    const g3 = lawsExact
    const g4 = held.leaks === 0 && held.flips === 0 && held.meetings > 0
    const g5 = boxes.every(b => b.violations === 0 && b.exact) && partners.partner === 8 * 12 * cells && partners.across === 8 * 12 * cells && partners.stray === 0
    const g6 = pair.pair.length === 2 && fearOn.meetings >= 150 && fearOn.fearsMax > 0 && fearOff.fearsMax === 0
    const c1 = paliMeetings === 0
    const c2 = first.reverses && first.motionFailures > 0
    const c3 = broken.vetoed === 0 && broken.period !== 6
    const instruments = g1 && g2 && g3 && g4 && c1 && c2 && c3
    const status = instruments ? (g5 && g6 ? 'pass' : 'fail') : 'partial'
    const seconds = (Date.now() - started) / 1000
    const metrics: Record<string, number> = {
      coinMapFailures: cov.coinFailures,
      chargeConjugationFailures: cov.conjugationFailures,
      dockSamples: cov.dockSamples,
      boxAutomorphisms: cov.boxAutomorphisms,
      boxAutomorphismFailures: cov.boxFailures,
      reverses: rev.reverses ? 1 : 0,
      motionReversalFailures: rev.motionFailures,
      cptFailures: rev.cptFailures,
      lawsExact: lawsExact ? 1 : 0,
      heldColorLeaks: held.leaks,
      heldColorDockBeats: held.dockBeats,
      signFlips: held.flips,
      allOpenMeetings: held.meetings,
      ...Object.fromEntries(boxes.flatMap(b => [
        [`side${b.side}_layoutViolations`, b.violations],
        [`side${b.side}_vacuumPeriod`, b.period],
        [`side${b.side}_patternExact`, b.exact ? 1 : 0],
      ])),
      partnerMeetings: partners.partner,
      acrossMeetings: partners.across,
      strayMeetings: partners.stray,
      vacuumPairKind: pair.kind,
      vacuumPairFirst: pair.pair[0] ?? -1,
      vacuumPairSecond: pair.pair[1] ?? -1,
      vacuumPairMeetings480: fearOn.meetings,
      vacuumFearsMaxOn: fearOn.fearsMax,
      vacuumFearsMaxOff: fearOff.fearsMax,
      vacuumWholeChangesOn: fearOn.changes,
      vacuumDistinctWholesOn: fearOn.distinct,
      ...Object.fromEntries(digitScan.flatMap(d => [
        [`start${d.a}${d.b}_fearsMax`, d.fearsMax],
        [`start${d.a}${d.b}_changes`, d.changes],
        [`start${d.a}${d.b}_distinct`, d.distinct],
      ])),
      palindromeVacuumMeetings: paliMeetings,
      firstReverses: first.reverses ? 1 : 0,
      firstMotionReversalFailures: first.motionFailures,
      brokenLayoutVetoes: broken.vetoed,
      brokenLayoutPeriod: broken.period,
      flatSeparatedPeriod: flatGood.period,
      flatSeparatedExact: flatGood.exact ? 1 : 0,
      seconds,
    }

    return verdict({
      status,
      claim: `the pair move applied once per beat, alternately before and after the coin map, keeps W(F4) (${cov.coinFailures} failures over 1,152 coin maps on ${cov.dockSamples} docks and both collisions, ${cov.boxFailures} over ${cov.boxAutomorphisms} box automorphisms), charge conjugation, exact reversal, the motion reversal T = S R (${rev.motionFailures} failures, the one-phase control ${first.motionFailures}) and CPT (${rev.cptFailures}), charge, momentum and energy, the held color (${held.leaks} of ${held.dockBeats} dock-beats) and every token's sign (${held.flips} flips in ${held.meetings} meetings); its hot vacuum runs exactly as derived on sides 3 to 9 (period ${boxes.map(b => b.period).join(', ')}; beats made, refused, unmade ${boxes[0]?.tallies}), every vacuum pair streams two beats and its own tokens meet again (${partners.partner} partner and ${partners.across} cross meetings in 24 beats, ${partners.stray} stray), dock 0's vacuum pair meets ${fearOn.meetings} times in 480 beats and the fear beat puts fears in it (${fearOn.fearsMax} at most, ${fearOff.fearsMax} with it off); the palindrome's vacuum meets ${paliMeetings} times`,
      metrics,
      control: { palindromeVacuumMeetings: paliMeetings, firstMotionReversalFailures: first.motionFailures, brokenLayoutVetoes: broken.vetoed, brokenLayoutPeriod: broken.period },
      notes: `L2. Gates: G1 ${g1}, G2 ${g2}, G3 ${g3}, G4 ${g4}, G5 ${g5}, G6 ${g6}; controls C1 ${c1}, C2 ${c2}, C3 ${c3}. The vacuum pair is of kind ${pair.kind === 0 ? 'slot tokens' : pair.kind === 1 ? 'place tokens' : 'none'} (${pair.pair.join(', ')}). On flat links with a separated layout the vacuum has period ${flatGood.period} (pattern exact ${flatGood.exact}); with every stored point equal (the broken layout) the veto refuses ${broken.vetoed} and the period is ${broken.period}: two units' members pair off across the vacuum each beat. THE VACUUM PAIR'S WHOLE (added after the first run): from each basis start, fears at most ${digitScan.map(d => d.fearsMax).join(', ')}, meetings that change the whole ${digitScan.map(d => d.changes).join(', ')}, distinct wholes ${digitScan.map(d => d.distinct).join(', ')} (starts 00, 01, 02, 10, 11, 12, 20, 21, 22). WHY NO FEAR: a vacuum pair meets nobody but its own partner, and between two meetings each token crosses one link and then its inverse, so its whole sees the same love-fear kernel at every meeting and nothing between; that kernel is the singlet phase I + (omega - 1) P, P the projector on the correlated state sum_j |j, j> / sqrt 3 (code/rule/fear-kernel-exact tripledSingletPhase), whose cube is the identity and which moves only the equal-digit starts, so the whole cycles through at most 3 states, and from the basis starts those states carry no negative weight. The fears E-FRC-0159 read on H's vacuum pair come from meetings mixed with transport (like and love-fear kernels, links between); this vacuum has neither. FIRST RUN 100.4 s, fail on G6, recorded as is. ${seconds.toFixed(1)} s.`,
    })
  },
})
