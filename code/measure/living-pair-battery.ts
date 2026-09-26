// E-FRC-0159's battery, item for item, on the living-pair knit (code/rule/living-pair-knit, schedule 'alternate'), for
// E-RLT-0075. It is code/measure/candidate-battery (E-RLT-0070's transcription of the battery onto the candidate knit)
// with the beat replaced, and with four transcription changes that the living vacuum forces, each decided before any
// number was read:
//  - THE VACUUM holds vibes between collisions (every dock is full on the beats between a pair's making and its
//    unmaking), so "off the vacuum" is read against a vacuum run of the same box, never against an empty state. The
//    candidate's vacuum held none, so its offVacuum and this reading agree on it.
//  - THE LAYOUT. Every state carries the hot vacuum's separated point layout on its stored units (living-pair-knit's
//    condition (A), for the links the state runs on: the colored links, or the flat links of the interference test).
//  - THE VACUUM PAIR. The battery takes a line's two slot tokens of dock 0 that meet within 24 beats on the vacuum.
//    On a store that returns tokens the vacuum's held tokens are the store's (a pair is made from the tokens the
//    place holds), and the slot tokens stay calm. So the search takes, line by line, the slot tokens first and then the
//    place tokens of dock 0. On E-RLT-0070's candidate neither kind meets (its pairs live inside one collision).
//  - THE LONE-LOVE RESPONSE (E-FRC-0142's measure) counts the charge displacement of the run against the vacuum run,
//    beat by beat (the charge each slot's stream copies one root along), where E-RLT-0070 followed the one vibe.
//    On a vacuum that holds no vibe the two agree.
//
// The large-box items run on code/measure/living-pair-kernel, gated bit for bit against livingBeat.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { cloneStoreState, sameStoreState, storeCharge, transformStoreState, type TokenStoreState } from '@/code/rule/token-store-knit'
import { livingBeat, livingBeatBack, livingCollide, livingState, makeLivingKnit, separatedLayout, type LivingKnit, type LivingSchedule } from '@/code/rule/living-pair-knit'
import { cloneReduced, collideLiving, livingRunner, makeLivingKernel, tritDifference, type LivingKernel, type Reduced } from '@/code/measure/living-pair-kernel'
import { goldenFill } from '@/code/measure/candidate-kernel'
import { d4BoxCell, d4BoxCoordinates, d4BoxDistance } from '@/code/substrate/d4-box'
import { clockAmplitude } from '@/code/measure/clock-amplitude'
import { weylF4DirectionPermutations, permutationOrder } from '@/code/measure/coin-symmetry'
import { orientationOf } from '@/code/measure/rule-symmetry-ledger'
import {
  advanceWhole,
  conjugateSecond,
  CONJUGATE_POINT,
  fearBeat,
  makeLattice,
  carryCoordinate,
  moveCoordinate,
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

const ROOTS = rootsD4()
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)
const GOLDEN = (Math.sqrt(5) - 1) / 2
const PERIOD = 24
const QSIDE = 3
const BOX_BEATS = 48
const SEARCH_BEATS = 240
const Q_BEATS = 480
const REVERSAL_BEATS = 96
const GAUGE_BEATS = 48
const MATTER_SCALE = 2.11
const TRAVEL_BEATS = 6

const WEAVES = new Map<number, ColorWeave>()
const LAYOUTS = new Map<number, Int8Array>()
const KERNELS = new Map<string, LivingKernel>()

export function weaveOf(side: number): ColorWeave {
  const known = WEAVES.get(side)

  if (known) return known

  const w = makeColorWeave({ side, table: 'bind' })

  WEAVES.set(side, w)

  return w
}

export function layoutOf(side: number): Int8Array {
  const known = LAYOUTS.get(side)

  if (known) return known

  const l = separatedLayout(weaveOf(side))

  LAYOUTS.set(side, l)

  return l
}

function kernelOf(side: number, schedule: LivingSchedule): LivingKernel {
  const key = `${side}:${schedule}`
  const known = KERNELS.get(key)

  if (known) return known

  const k = makeLivingKernel(weaveOf(side), schedule)

  KERNELS.set(key, k)

  return k
}

function denseFill(slots: number): { vibe: Int8Array; point: Int8Array } {
  const vibe = new Int8Array(slots)
  const point = new Int8Array(slots)

  for (let i = 0; i < slots; i++) {
    const u = ((i + 1) * GOLDEN * 1.37) % 1

    vibe[i] = u < 0.2 ? -1 : u < 0.8 ? 0 : 1
    point[i] = Math.floor(((i + 3) * GOLDEN * 1.37 * 9) % 9)
  }

  return { vibe, point }
}

function reducedFill(fill: { vibe: Int8Array; point: Int8Array }, tau: number, layout: Int8Array): Reduced {
  const cells = fill.vibe.length / 24

  return { vibe: Int8Array.from(fill.vibe), point: Int8Array.from(fill.point), store: new Int8Array(cells * 12).fill(tau), spoint: Int8Array.from(layout) }
}

const emptyFill = (slots: number): { vibe: Int8Array; point: Int8Array } => ({ vibe: new Int8Array(slots), point: new Int8Array(slots) })

// The vacuum run of one box, one period of it when it has one (every state after `beats` beats is then read from the
// period), so a large box does not run its vacuum beside every seeded run
type VacuumTrack = { at: (t: number) => Reduced; period: number }

const TRACKS = new Map<string, VacuumTrack>()

function vacuumTrack(side: number, tau: number, schedule: LivingSchedule): VacuumTrack {
  const key = `${side}:${tau}:${schedule}`
  const known = TRACKS.get(key)

  if (known) return known

  const kernel = kernelOf(side, schedule)
  const run = livingRunner(kernel, reducedFill(emptyFill(kernel.cells * 24), tau, layoutOf(side)))
  const states: Reduced[] = [cloneReduced(run.state())]
  const same = (a: Reduced, b: Reduced): boolean => tritDifference(a, b).trits === 0
  let period = 0

  // the schedule has period 2, so a period of the vacuum is even; look up to 24
  for (let t = 1; t <= PERIOD && period === 0; t++) {
    run.beat()
    states.push(cloneReduced(run.state()))

    if (t % 2 === 0 && same(states[t] as Reduced, states[0] as Reduced)) period = t
  }

  if (period === 0) throw new Error(`the vacuum on side ${side} has no period up to ${PERIOD}`)

  const track: VacuumTrack = { at: (t: number) => states[t % period] as Reduced, period }

  TRACKS.set(key, track)

  return track
}

// ---- dock-level classical items ----

export function reversalAndCharge(tau: number, schedule: LivingSchedule = 'alternate'): { reverses: boolean; chargeKept: boolean } {
  const weave = weaveOf(5)
  const knit = makeLivingKnit(weave, schedule)
  const start = livingState({ ...denseFill(weave.mesh.cellCount * 24), tau, layout: layoutOf(5) })
  const none = new Uint8Array(start.point.length)
  const q0 = storeCharge(start)
  let s = start
  let chargeKept = true

  for (let t = 0; t < PERIOD; t++) {
    s = livingBeat(knit, s, none, t).state
    chargeKept = chargeKept && storeCharge(s) === q0
  }

  for (let t = PERIOD - 1; t >= 0; t--) s = livingBeatBack(knit, s, none, t).state

  return { reverses: sameStoreState(s, start), chargeKept }
}

// CPT at the collision level: charge conjugation commutes with both collisions (beats of either parity) on the 400
// sample vectors, each with the hot, the cold and a mixed store
export function cptAtCollision(schedule: LivingSchedule = 'alternate'): { phase: number; failures: number; cases: number } {
  const weave = weaveOf(QSIDE)
  const knit = makeLivingKnit(weave, schedule)
  const identity = Array.from({ length: 24 }, (_, d) => d)
  const layout = new Int8Array(12).fill(4)
  let failures = 0
  let cases = 0

  for (let n = 0; n < 400; n++) {
    const v = new Int8Array(24)
    const point = new Int8Array(24)

    for (let i = 0; i < 24; i++) {
      v[i] = ((n * 31 + i * 7 + ((n * i) % 5)) % 3) - 1

      if (n % 2 === 0 && (n + i) % 5 !== 0) v[i] = 0

      point[i] = (n * 5 + i * 2) % 9
    }

    for (const pattern of [1, 0, 2]) {
      const x = livingState({ vibe: v, point, tau: pattern === 2 ? 0 : pattern, layout })

      if (pattern === 2) for (let l = 0; l < 12; l++) x.store[l] = ((n + l) % 3) - 1

      for (const t of [0, 1]) {
        const lhs = transformStoreState(x, [0], identity, -1)

        livingCollide(knit, lhs, 0, t)

        const y = cloneStoreState(x)

        livingCollide(knit, y, 0, t)
        failures += sameStoreState(lhs, transformStoreState(y, [0], identity, -1)) ? 0 : 1
        cases++
      }
    }
  }

  return { phase: failures === 0 ? 0 : -1, failures, cases }
}

export function vacuumPeriod(tau: number, schedule: LivingSchedule = 'alternate'): number {
  const kernel = kernelOf(QSIDE, schedule)
  const run = livingRunner(kernel, reducedFill(emptyFill(kernel.cells * 24), tau, layoutOf(QSIDE)))
  const states: string[] = []

  for (let t = 0; t <= 3 * PERIOD; t++) {
    states.push(`${run.state().vibe.join('')}|${run.state().store.join(',')}`)
    run.beat()
  }

  for (let p = 1; p <= PERIOD; p++) if (states.every((x, t) => t + p >= states.length || x === states[t + p])) return p

  return 0
}

export function lineComponents(tau: number, dense: boolean, schedule: LivingSchedule = 'alternate'): { trits: number; vibes: number } {
  const kernel = kernelOf(5, schedule)
  const slots = kernel.cells * 24
  const fill = dense ? denseFill(slots) : emptyFill(slots)
  const center = 2 * (1 + 5 + 25 + 125)
  const lineOfSlot = Array.from({ length: 24 }, (_, d) => LINE_FIRSTS.findIndex((f, l) => f === d || LINE_SECONDS[l] === d))
  const parents = [Array.from({ length: 12 }, (_, i) => i), Array.from({ length: 12 }, (_, i) => i)]
  const find = (p: number[], x: number): number => (p[x] === x ? x : (p[x] = find(p, p[x] ?? x)))
  const background = livingRunner(kernel, reducedFill(fill, tau, layoutOf(5)))
  const backgroundStates: Reduced[] = []

  for (let t = 0; t < PERIOD; t++) {
    background.beat()
    backgroundStates.push(cloneReduced(background.state()))
  }

  for (let direction = 0; direction < 24; direction++) {
    const start = reducedFill(fill, tau, layoutOf(5))
    const slot = center * 24 + direction

    start.vibe[slot] = start.vibe[slot] === 1 ? -1 : 1

    const run = livingRunner(kernel, start)
    const touched = [new Set<number>(), new Set<number>()]

    for (let t = 0; t < PERIOD; t++) {
      run.beat()

      const a = run.state()
      const b = backgroundStates[t] as Reduced

      for (let i = 0; i < a.vibe.length; i++) {
        if (a.vibe[i] !== b.vibe[i]) {
          touched[0]!.add(lineOfSlot[i % 24] as number)
          touched[1]!.add(lineOfSlot[i % 24] as number)
        }
      }

      for (let i = 0; i < a.store.length; i++) if (a.store[i] !== b.store[i]) touched[0]!.add(i % 12)
    }

    for (const k of [0, 1]) for (const line of touched[k]!) parents[k]![find(parents[k]!, line)] = find(parents[k]!, lineOfSlot[direction] as number)
  }

  const count = (p: number[]): number => new Set(Array.from({ length: 12 }, (_, i) => find(p, i))).size

  return { trits: count(parents[0]!), vibes: count(parents[1]!) }
}

// superposition of the clock amplitude (side 11, two loves on direction 0 at [1,1,1,1] and [6,6,6,6], 6 beats)
export function additivityWorst(tau: number, schedule: LivingSchedule = 'alternate'): number {
  const kernel = kernelOf(11, schedule)
  const mesh = weaveOf(11).mesh
  const a = d4BoxCell({ coordinates: [1, 1, 1, 1], side: 11 })
  const b = d4BoxCell({ coordinates: [6, 6, 6, 6], side: 11 })
  const empty = (): Reduced => reducedFill(emptyFill(kernel.cells * 24), tau, layoutOf(11))
  const branch = (seeds: number[]): [number, number][] => {
    const vac = livingRunner(kernel, empty())
    const start = empty()

    for (const cell of seeds) start.vibe[cell * 24] = 1

    const seeded = livingRunner(kernel, start)
    const out: [number, number][] = []

    for (let t = 0; t < 6; t++) {
      vac.beat()
      seeded.beat()

      const x = clockAmplitude({ mesh, data: seeded.state().vibe })
      const y = clockAmplitude({ mesh, data: vac.state().vibe })

      out.push([x[0] - y[0], x[1] - y[1]])
    }

    return out
  }
  const one = branch([a])
  const two = branch([b])
  const joint = branch([a, b])

  return Math.max(...joint.map((j, t) => Math.hypot(j[0] - (one[t]?.[0] ?? 0) - (two[t]?.[0] ?? 0), j[1] - (one[t]?.[1] ?? 0) - (two[t]?.[1] ?? 0))))
}

// walls: the side-9 vacuum with the docks x0 >= 5 born one beat late (no collision on beat 0, the stream as always),
// 8 periods; the settled difference (from beat 72) in whole sheets of 9^3 docks
export function walls(tau: number, schedule: LivingSchedule = 'alternate'): { quantized: boolean; settledMax: number; settledMaxVibes: number } {
  const kernel = kernelOf(9, schedule)
  const cells = kernel.cells
  const late = Array.from({ length: cells }, (_, x) => (d4BoxCoordinates({ cell: x, side: 9 })[0] ?? 0) >= 5)
  const empty = (): Reduced => reducedFill(emptyFill(cells * 24), tau, layoutOf(9))
  const uniform = livingRunner(kernel, empty())
  const staggered = empty()

  for (let x = 0; x < cells; x++) if (!late[x]) collideLiving(kernel, staggered, x, 0)

  // beat 0's stream
  const streamed = cloneReduced(staggered)

  streamed.vibe.fill(0)

  for (let slot = 0; slot < staggered.vibe.length; slot++) {
    const v = staggered.vibe[slot] as number

    if (v === 0) continue

    const to = kernel.target[slot] as number

    streamed.vibe[to] = v
    streamed.point[to] = (kernel.move[slot] as Int8Array)[staggered.point[slot] as number] as number
  }

  const run = livingRunner(kernel, streamed, 1)

  uniform.beat()

  const settled: number[] = []
  const settledVibes: number[] = []

  for (let t = 1; t < 8 * PERIOD; t++) {
    run.beat()
    uniform.beat()

    if (t >= 3 * PERIOD) {
      const d = tritDifference(run.state(), uniform.state())

      settled.push(d.trits)
      settledVibes.push(d.vibes)
    }
  }

  return { quantized: settled.every(x => x % 9 ** 3 === 0), settledMax: Math.max(...settled), settledMaxVibes: Math.max(...settledVibes) }
}

// dressing: a lone love (or fear) at the center on every direction, 4 periods, the largest support per period (trits
// and vibes off the vacuum run), the bare species, the straight travelers, the per-direction support sequences
export type LivingDressing = {
  periodLargest: number[]
  periodLargestVibes: number[]
  protectedSpecies: number
  straight: number
  sequences: number[][]
}

export function dressing(tau: number, side: number, tone: number, schedule: LivingSchedule = 'alternate'): LivingDressing {
  const kernel = kernelOf(side, schedule)
  const cells = kernel.cells
  const mid = Math.floor(side / 2)
  const center = d4BoxCell({ coordinates: [mid, mid, mid, mid], side })
  const track = vacuumTrack(side, tau, schedule)
  const periodLargest = [0, 0, 0, 0]
  const periodLargestVibes = [0, 0, 0, 0]
  const sequences: number[][] = []
  let protectedSpecies = 0
  let straight = 0

  for (let direction = 0; direction < 24; direction++) {
    const start = reducedFill(emptyFill(cells * 24), tau, layoutOf(side))

    start.vibe[center * 24 + direction] = tone

    const run = livingRunner(kernel, start)
    const sequence: number[] = []
    let firstPeriodBare = true
    let slot = center * 24 + direction
    let onPath = true

    for (let t = 0; t < 4 * PERIOD; t++) {
      run.beat()

      const off = tritDifference(run.state(), track.at(t + 1))
      const p = Math.floor(t / PERIOD)

      periodLargest[p] = Math.max(periodLargest[p] ?? 0, off.trits)
      periodLargestVibes[p] = Math.max(periodLargestVibes[p] ?? 0, off.vibes)
      sequence.push(off.trits)

      if (t < PERIOD && off.vibes !== 1) firstPeriodBare = false

      slot = kernel.target[slot] as number
      onPath = onPath && off.vibes === 1 && run.state().vibe[slot] === tone
    }

    protectedSpecies += firstPeriodBare ? 1 : 0
    straight += onPath ? 1 : 0
    sequences.push(sequence)
  }

  return { periodLargest, periodLargestVibes, protectedSpecies, straight, sequences }
}

// travel: how far a lone love's disturbance (trits off the vacuum run) reaches in 6 beats on the side-13 box
export function travel(tau: number, schedule: LivingSchedule = 'alternate'): { travellers: number; fullSpeed: number; meanReach: number } {
  const kernel = kernelOf(13, schedule)
  const cells = kernel.cells
  const center = d4BoxCell({ coordinates: [6, 6, 6, 6], side: 13 })
  const track = vacuumTrack(13, tau, schedule)
  const reaches: number[] = []

  for (let direction = 0; direction < 24; direction++) {
    const start = reducedFill(emptyFill(cells * 24), tau, layoutOf(13))

    start.vibe[center * 24 + direction] = 1

    const run = livingRunner(kernel, start)

    for (let t = 0; t < TRAVEL_BEATS; t++) run.beat()

    const s = run.state()
    const v = track.at(TRAVEL_BEATS)
    let farthest = 0

    for (let x = 0; x < cells; x++) {
      let differs = false

      for (let d = 0; d < 24 && !differs; d++) differs = s.vibe[x * 24 + d] !== v.vibe[x * 24 + d]
      for (let l = 0; l < 12 && !differs; l++) differs = s.store[x * 12 + l] !== v.store[x * 12 + l]

      if (differs) farthest = Math.max(farthest, d4BoxDistance({ a: x, b: center, side: 13 }))
    }

    reaches.push(farthest)
  }

  const free = Math.SQRT2 * TRAVEL_BEATS

  return {
    travellers: reaches.filter(r => r >= free / 2).length,
    fullSpeed: reaches.filter(r => r >= free - 1e-9).length,
    meanReach: reaches.reduce((a, b) => a + b, 0) / reaches.length,
  }
}

// ---- box-level items (side 3, 48 beats, the golden fill at 1.37), the full rule ----

function dockOfTokens(s: TokenStoreState): Int32Array {
  const out = new Int32Array(s.point.length)

  for (let i = 0; i < s.token.length; i++) out[s.token[i] as number] = Math.floor(i / 24)
  for (let i = 0; i < s.place.length; i++) out[s.place[i] as number] = Math.floor(i / 24)

  return out
}

function heldContent(s: TokenStoreState, x: number): number {
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

// the frame field: a Weyl offset `salt` (11, the battery's own frame, unless E-RLT-0088 asks for another start)
function frameOf(weave: ColorWeave, salt = 11): { frame: number[]; links: Int16Array } {
  const { mesh, moves, links } = weave
  const frame = Array.from({ length: mesh.cellCount }, (_, x) => Math.floor((((x + salt) * GOLDEN * 5.9) % 1) * moves.act.length))
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

function framePoints(weave: ColorWeave, frame: number[], s: TokenStoreState): Int8Array {
  const at = dockOfTokens(s)

  return Int8Array.from(s.point, (p, t) => weave.moves.act[frame[at[t] as number] ?? weave.moves.identity]?.[p] ?? p)
}

const lineMomenta = (vibe: Int8Array): number[] => {
  const n = new Array<number>(12).fill(0)

  for (let i = 0; i < vibe.length; i++) {
    if (vibe[i] === 0) continue

    const d = i % 24
    const l = LINE_FIRSTS.indexOf(d)

    if (l >= 0) n[l] = (n[l] ?? 0) + 1
    else n[LINE_SECONDS.indexOf(d)] = (n[LINE_SECONDS.indexOf(d)] ?? 0) - 1
  }

  return n
}

const momentumOf = (vibe: Int8Array): number[] => {
  const p = [0, 0, 0, 0]

  for (let i = 0; i < vibe.length; i++) if (vibe[i] !== 0) (ROOTS[i % 24] as number[]).forEach((v, k) => (p[k] = (p[k] ?? 0) + v))

  return p
}

export function boxGates(tau: number, schedule: LivingSchedule = 'alternate'): Record<string, number> {
  const weave = weaveOf(QSIDE)
  const knit = makeLivingKnit(weave, schedule)
  const cells = weave.mesh.cellCount
  const layout = layoutOf(QSIDE)
  const start = livingState({ ...goldenFill(cells * 24, 1.37), tau, layout })
  const tokens = start.point.length
  const none = new Uint8Array(tokens)
  const all = new Uint8Array(tokens).fill(1)
  const q0 = storeCharge(start)
  const p0 = momentumOf(start.vibe)
  const n0 = lineMomenta(start.vibe)
  let s = start
  let open = start
  let chargeKept = true
  let pDrift = 0
  let lineDrift = 0
  let leaks = 0
  let openChanges = 0

  for (let t = 0; t < BOX_BEATS; t++) {
    const probe = cloneStoreState(s)

    for (let x = 0; x < cells; x++) {
      const before = heldContent(probe, x)

      livingCollide(knit, probe, x, t)
      leaks += heldContent(probe, x) === before ? 0 : 1
    }

    s = livingBeat(knit, s, none, t).state
    open = livingBeat(knit, open, all, t).state
    openChanges += sameStoreState(s, open) ? 0 : 1
    chargeKept = chargeKept && storeCharge(s) === q0
    pDrift = Math.max(pDrift, ...momentumOf(s.vibe).map((x, k) => Math.abs(x - (p0[k] ?? 0))))
    lineDrift = Math.max(lineDrift, ...lineMomenta(s.vibe).map((x, k) => Math.abs(x - (n0[k] ?? 0))))
  }

  for (let t = BOX_BEATS - 1; t >= 0; t--) s = livingBeatBack(knit, s, none, t).state

  const reverses = sameStoreState(s, start)
  const { frame, links } = frameOf(weave)
  const gauged: LivingKnit = { ...knit, weave: { ...weave, links } }
  const second = livingState({ ...goldenFill(cells * 24, 2.11), tau, layout })
  let a = second
  let b: TokenStoreState = { ...second, point: framePoints(weave, frame, second) }
  let frameMismatch = 0

  for (let t = 0; t < 24; t++) {
    a = livingBeat(knit, a, none, t).state
    b = livingBeat(gauged, b, none, t).state
    frameMismatch += sameStoreState({ ...a, point: framePoints(weave, frame, a) }, b) ? 0 : 1
  }

  return {
    boxReverses: reverses ? 1 : 0,
    boxChargeKept: chargeKept ? 1 : 0,
    boxColorLeaks: leaks,
    boxFrameMismatch: frameMismatch,
    pDrift,
    lineMomentumDrift: lineDrift,
    openingTokensChangesClassical: openChanges,
  }
}

// ---- the quantum items (E-QTM-0109's, as E-FRC-0159 asks them), side 3 ----

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

  return { tokens: whole.tokens, weight: whole.weight.map((_, i) => role[readingOf(i)] ?? 0n), ...(whole.own ? { own: whole.own } : {}) }
}

const chanceOf = (whole: Whole, reading: number): number =>
  Number(whole.weight.reduce((s, w, i) => (readingOf(i) === reading ? s + w : s), 0n)) / Number(wholeUnits(whole))

const native = (whole: Whole): Whole => ({
  tokens: whole.tokens,
  weight: whole.weight.map((_, i) => whole.weight[Math.floor(i / 9) * 9 + (CONJUGATE_POINT[i % 9] ?? 0)] ?? 0n),
})

export type QuantumRun = { gates: Record<string, boolean>; unevaluable: string[]; metrics: Record<string, number> }

// `carryOwnPoints` (E-RLT-0088): the frame change carries each coordinate's own point with its weights
// (carryCoordinate), which is a frame change of the adopted comoving fear beat; false is the old moveCoordinate, which
// moves the weights and leaves the own points behind. `frameSalt`: the frame field's Weyl offset
export function quantum(tau: number, mode: 'on' | 'off', schedule: LivingSchedule = 'alternate', carryOwnPoints = true, frameSalt = 11): QuantumRun {
  const weave = weaveOf(QSIDE)
  const knit = makeLivingKnit(weave, schedule)
  const { mesh, moves, opposite } = weave
  const slots = mesh.cellCount * 24
  const tokenCount = slots * 2
  const flatWeave: ColorWeave = { ...weave, links: new Int16Array(slots).fill(moves.identity) }
  const flat: LivingKnit = { ...knit, weave: flatWeave }
  const layout = layoutOf(QSIDE)
  const flatLayout = separatedLayout(flatWeave)
  const kernels = exactFearKernels({ like: mode === 'on' ? 1 : 0, unlike: mode === 'on' ? 1 : 0, likeExchanged: false })
  const back = exactFearKernels({ like: mode === 'on' ? 2 : 0, unlike: mode === 'on' ? 2 : 0, likeExchanged: false })
  const off = exactFearKernels({ like: 0, unlike: 0, likeExchanged: false })
  const on = exactFearKernels({ like: 1, unlike: 1, likeExchanged: false })
  const swapExact = exactWholeKernel(doubledSwapPhase(1), 2)
  const swapControl: FearKernels = { ...on, unlike: conjugateSecond(swapExact.kernel), unlikeDivisor: swapExact.divisor }
  const side = Array.from({ length: 24 }, (_, d) => (d < (opposite[d] ?? d) ? 1 : -1))
  const openOf = (list: readonly number[]): Uint8Array => {
    const open = new Uint8Array(tokenCount)

    for (const t of list) open[t] = 1

    return open
  }
  const vacuum = emptyFill(slots)
  const matter = goldenFill(slots, MATTER_SCALE)
  const stateOf = (bg: { vibe: Int8Array; point: Int8Array }, k: LivingKnit = knit): TokenStoreState => livingState({ ...bg, tau, layout: k === flat ? flatLayout : layout })
  const recordsOf = (bg: { vibe: Int8Array; point: Int8Array }, k: LivingKnit, open: Uint8Array, beats: number): BeatRecord[] => {
    let state = stateOf(bg, k)
    const out: BeatRecord[] = []

    for (let t = 0; t < beats; t++) {
      const r = livingBeat(k, state, open, t)

      state = r.state
      out.push(r.record)
    }

    return out
  }
  const advance = (whole: Whole, record: BeatRecord, color: FearKernels, fixed: boolean, forward = true): Whole | null =>
    advanceWhole({ weave, whole, record, kernel4: [], color, fixed, forward })

  // the vacuum pair: line by line of dock 0, its two slot tokens, then its two place tokens, the first that meet
  // within 24 beats on the vacuum
  let vacuumPair: number[] = []
  let vacuumPairKind = -1

  for (let kind = 0; kind < 2 && vacuumPair.length === 0; kind++) {
    for (let l = 0; l < 12 && vacuumPair.length === 0; l++) {
      const pair = kind === 0 ? [LINE_FIRSTS[l] as number, LINE_SECONDS[l] as number] : [slots + 2 * l, slots + 2 * l + 1]

      if (recordsOf(vacuum, knit, openOf(pair), 24).some(r => r.meetings.length > 0)) {
        vacuumPair = pair
        vacuumPairKind = kind
      }
    }
  }

  const dock0 = openOf(Array.from({ length: 24 }, (_, s) => s))
  const counts = new Map<number, number>()
  const loveFear = new Set<number>()
  const dockRecords = recordsOf(matter, knit, dock0, SEARCH_BEATS)

  for (const r of dockRecords) {
    r.meetings.forEach(([a, b], m) => {
      const key = Math.min(a, b) * tokenCount + Math.max(a, b)
      const [sa, sb] = r.signs?.[m] ?? [1, 1]

      counts.set(key, (counts.get(key) ?? 0) + 1)
      if (sa !== sb) loveFear.add(key)
    })
  }

  const order = [...counts.entries()].sort((x, y) => y[1] - x[1] || x[0] - y[0]).map(([k]) => k)
  const ranked = order.map(k => [Math.floor(k / tokenCount), k % tokenCount])
  const matterPair = ranked[0] ?? [0, 1]
  const loveFearKey = order.find(k => loveFear.has(k))
  const controlPair = loveFearKey === undefined ? matterPair : [Math.floor(loveFearKey / tokenCount), loveFearKey % tokenCount]
  // a token's sign: its vibe on the slot it starts on, else a place token's unit orientation, else its slot's side
  const labels = stateOf(matter).label
  const signOfToken = (vibe: Int8Array, tk: number): number => (tk < slots ? (vibe[tk] ?? 0) || (side[tk % 24] ?? 1) : (labels[tk] ?? 1))

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

  const study = (bg: { vibe: Int8Array; point: Int8Array }, tokens: number[], start: Whole) => {
    const records = recordsOf(bg, knit, openOf(tokens), Q_BEATS)
    let whole: Whole = start
    let pure = true
    let fearsMax = 0n
    let shareMax = 0
    let meetings = 0

    for (const record of records) {
      whole = advance(whole, record, kernels, false) as Whole

      const units = wholeUnits(whole)

      pure = pure && 81n * whole.weight.reduce((s, w) => s + w * w, 0n) === 9n * units * units

      if (record.meetings.length > 0) {
        meetings += record.meetings.length

        const { loves, fears } = wholeLovesAndFears(whole)

        fearsMax = fears > fearsMax ? fears : fearsMax
        shareMax = Math.max(shareMax, Number(fears) / Number(loves + fears))
      }
    }

    return { records, pure, fearsMax: Number(fearsMax), shareMax, meetings }
  }

  const hasVacuum = vacuumPair.length === 2
  const vacuumStudy = hasVacuum ? study(vacuum, vacuumPair, basisWhole(vacuumPair, [0, 0])) : undefined
  const matterStudy = study(matter, matterPair, basisWhole(matterPair, [0, 1]))
  const growerPair = ranked
    .slice(0, 12)
    .map(pair => {
      const records = recordsOf(matter, knit, openOf(pair), Q_BEATS)
      let whole = basisWhole(pair, [0, 1])
      let top = wholeUnits(whole)

      for (const record of records) {
        whole = advance(whole, record, on, false) as Whole
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
    const start = stateOf(matter)
    const whole0: Whole = { tokens: matterPair, weight: basisWhole(matterPair, [2, 0]).weight.map(w => w * (units / 9n)) }
    let state = start
    let whole: Whole | null = whole0

    for (let t = 0; t < REVERSAL_BEATS; t++) {
      const r = livingBeat(knit, state, open, t)

      state = r.state
      whole = whole ? advance(whole, r.record, kernels, true) : null
      chargeKept = chargeKept && whole !== null && wholeUnits(whole) === units
    }

    for (let t = REVERSAL_BEATS - 1; t >= 0; t--) {
      const r = livingBeatBack(knit, state, open, t)

      state = r.state
      whole = whole ? advance(whole, r.record, back, true, false) : null
    }

    reverses = whole !== null && whole.weight.every((w, i) => w === whole0.weight[i]) && sameStoreState(state, start)
  }

  // the frame change
  const { frame, links: gaugeLinks } = frameOf(weave, frameSalt)
  const gauged: LivingKnit = { ...knit, weave: { ...weave, links: gaugeLinks } }
  const transform = (state: TokenStoreState, whole: Whole): Whole => {
    const at = dockOfTokens(state)
    let moved = whole

    whole.tokens.forEach((tk, c) => {
      moved = (carryOwnPoints ? carryCoordinate : moveCoordinate)(moved, c, moves.act[frame[at[tk] as number] ?? moves.identity] ?? [])
    })

    return moved
  }
  const frameMismatch = (bg: { vibe: Int8Array; point: Int8Array }, list: number[], k: FearKernels, start: Whole): number => {
    const open = openOf(list)
    const sa = stateOf(bg)
    let a = { state: sa, whole: start }
    let b = { state: { ...sa, point: framePoints(weave, frame, sa) }, whole: transform(sa, start) }
    let mismatch = 0

    for (let t = 0; t < GAUGE_BEATS; t++) {
      const ra = livingBeat(knit, a.state, open, t)
      const rb = livingBeat(gauged, b.state, open, t)

      a = { state: ra.state, whole: advanceWhole({ weave, whole: a.whole, record: ra.record, kernel4: [], color: k, fixed: false, forward: true })! }
      b = { state: rb.state, whole: advanceWhole({ weave: gauged.weave, whole: b.whole, record: rb.record, kernel4: [], color: k, fixed: false, forward: true })! }

      const expected = reduceWhole(transform(a.state, a.whole)).weight
      const actual = reduceWhole(b.whole).weight

      mismatch += expected.reduce((n, w, i) => n + (w === actual[i] ? 0 : 1), 0)
    }

    return mismatch
  }
  const frameVacuum = hasVacuum ? frameMismatch(vacuum, vacuumPair, kernels, basisWhole(vacuumPair, [0, 0])) : -1
  const frameMatter = frameMismatch(matter, matterPair, kernels, basisWhole(matterPair, [0, 1]))
  const frameControl = hasVacuum
    ? frameMismatch(vacuum, vacuumPair, swapControl, basisWhole(vacuumPair, [0, 0]))
    : frameMismatch(matter, controlPair, swapControl, basisWhole(controlPair, [0, 1]))

  // interference on flat links and CHSH on live links
  const chances = (bg: { vibe: Int8Array; point: Int8Array }, pair: number[], digits: number[], k: FearKernels, dephased: boolean): number[] => {
    const records = recordsOf(bg, flat, openOf(pair), 60)
    let whole = basisWhole(pair, digits)
    const out: number[] = []

    for (const record of records) {
      whole = advance(whole, record, k, false) as Whole

      if (record.meetings.length > 0 && out.length < 3) {
        whole = dephased ? dephase(whole) : whole
        out.push(chanceOf(whole, 0))
      }
    }

    return out
  }
  const bellOn = (bg: { vibe: Int8Array; point: Int8Array }, pair: number[], digits: number[], records: BeatRecord[], dephased: boolean): number => {
    const first = records.findIndex(r => r.meetings.length > 0)

    if (first < 0) return 0

    let whole = basisWhole(pair, digits)

    for (let t = 0; t <= first + 1 && t < records.length; t++) {
      const record = records[t]!

      whole = advance(whole, record, kernels, false) as Whole
      whole = dephased && record.meetings.length > 0 ? dephase(whole) : whole
    }

    return roleChsh(roleDensity(native(whole)))
  }
  const exact = (x: number, y: number): boolean => Math.abs(x - y) < 1e-12
  const quantumChances = hasVacuum ? chances(vacuum, vacuumPair, [0, 0], kernels, false) : []
  const standIn = hasVacuum ? chances(vacuum, vacuumPair, [0, 0], kernels, true) : []
  const fearOff = hasVacuum ? chances(vacuum, vacuumPair, [0, 0], off, false) : chances(matter, matterPair, [0, 0], off, false)
  const bell = hasVacuum && vacuumStudy ? bellOn(vacuum, vacuumPair, [0, 0], vacuumStudy.records, false) : 0
  const bellStandIn = hasVacuum && vacuumStudy ? bellOn(vacuum, vacuumPair, [0, 0], vacuumStudy.records, true) : 0
  const matterChances = chances(matter, matterPair, [0, 0], kernels, false)
  const matterStandIn = chances(matter, matterPair, [0, 0], kernels, true)
  const matterBell = bellOn(matter, matterPair, [0, 0], matterStudy.records, false)
  const matterBellStandIn = bellOn(matter, matterPair, [0, 0], matterStudy.records, true)

  const unital = [kernels, back].every(
    k => kernelIsUnital(k.like, k.likeDivisor) && kernelKeepsWeight(k.like, k.likeDivisor) && kernelIsUnital(k.unlike, k.unlikeDivisor) && kernelKeepsWeight(k.unlike, k.unlikeDivisor),
  )
  const storage = (bg: { vibe: Int8Array; point: Int8Array }, list: number[], start: Whole): { q: number; mismatches: number } => {
    const records = recordsOf(bg, knit, openOf(list), Q_BEATS)
    const q = list.reduce((s, tk) => s + signOfToken(bg.vibe, tk), 0)
    const scale = 4n ** 200n * 3n ** 200n
    const d0 = departureOf(start)
    let plain: Whole = start
    let delta: Whole = { tokens: list, weight: d0.delta.map(x => x * scale) }
    const stored0 = timesOmega(delta.weight, delta.weight.map(() => 0n), q)
    let re: Whole = { tokens: list, weight: stored0.re }
    let om: Whole = { tokens: list, weight: stored0.om }
    const units = d0.units * scale
    let mismatches = 0

    for (const record of records) {
      plain = advance(plain, record, kernels, false) as Whole
      delta = advance(delta, record, kernels, true) as Whole
      re = advance(re, record, kernels, true) as Whole
      om = advance(om, record, kernels, true) as Whole

      const read = timesOmega(re.weight, om.weight, -q)
      const readsBack = read.om.every(x => x === 0n) && read.re.every((x, i) => x === delta.weight[i])
      const direct: Departure = reduceDeparture({ tokens: list, delta: delta.weight, units })
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
  const storedVacuum = hasVacuum ? storage(vacuum, vacuumPair, basisWhole(vacuumPair, [0, 0])) : { q: 0, mismatches: -1 }
  const storedMatter = storage(matter, matterPair, basisWhole(matterPair, [0, 1]))
  const storedGrower = storage(matter, growerPair, basisWhole(growerPair, [0, 1]))

  const committedFlips = (() => {
    const w = makeColorWeave({ side: QSIDE, table: 'pair' })
    let lattice = makeLattice(matter)
    const last = new Map<number, number>(Array.from({ length: 24 }, (_, tk) => [tk, signOfToken(matter.vibe, tk)]))
    const open = new Uint8Array(slots)
    let flips = 0

    for (let s = 0; s < 24; s++) open[s] = 1

    for (let t = 0; t < SEARCH_BEATS; t++) {
      const r = fearBeat({ weave: w, links: w.links, lattice, open, t })

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

  const knots = [vacuumStudy, matterStudy, growerStudy].filter((s): s is NonNullable<typeof s> => s !== undefined)
  const unevaluable = hasVacuum ? [] : ['frameCommutesVacuum', 'storageVacuum', 'interferenceBeyondStandIn', 'chshAbove2', 'knotsPure (vacuum knot)', 'fearShareUnderThird (vacuum knot)']
  const gates: Record<string, boolean> = {
    tokenSignsKept: dockFlips === 0,
    knotsPure: hasVacuum && knots.every(s => s.pure),
    fearShareUnderThird: hasVacuum && knots.every(s => s.shareMax <= 1 / 3 + 1e-12),
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
  const controlsHold = committedFlips > 0 && frameControl > 0 && fearOff.length === 3 && fearOff.every(c => c === 1) && bellStandIn <= 2 + 1e-9 && matterBellStandIn <= 2 + 1e-9

  return {
    gates,
    unevaluable,
    metrics: {
      controlsHold: controlsHold ? 1 : 0,
      hasVacuumPair: hasVacuum ? 1 : 0,
      vacuumPairKind,
      vacuumPairFirst: vacuumPair[0] ?? -1,
      vacuumPairSecond: vacuumPair[1] ?? -1,
      vacuumMeetings: vacuumStudy?.meetings ?? 0,
      vacuumFearsMax: vacuumStudy?.fearsMax ?? 0,
      vacuumFearShareMax: vacuumStudy?.shareMax ?? 0,
      vacuumPure: vacuumStudy?.pure ? 1 : 0,
      matterPairFirst: matterPair[0] ?? -1,
      matterPairSecond: matterPair[1] ?? -1,
      controlPairFirst: hasVacuum ? (vacuumPair[0] ?? -1) : (controlPair[0] ?? -1),
      controlPairSecond: hasVacuum ? (vacuumPair[1] ?? -1) : (controlPair[1] ?? -1),
      dockLoveFearPairs: loveFear.size,
      growerFirst: growerPair[0] ?? -1,
      growerSecond: growerPair[1] ?? -1,
      dockSignFlips: dockFlips,
      dockMeetings: dockRecords.reduce((s, r) => s + r.meetings.length, 0),
      matterMeetings: matterStudy.meetings,
      growerMeetings: growerStudy.meetings,
      fearsMaxMatter: matterStudy.fearsMax,
      fearsMaxGrower: growerStudy.fearsMax,
      fearShareMaxMatterAndGrower: Math.max(matterStudy.shareMax, growerStudy.shareMax),
      pureMatterAndGrower: matterStudy.pure && growerStudy.pure ? 1 : 0,
      frameMismatchVacuum: frameVacuum,
      frameMismatchMatter: frameMatter,
      frameMismatchSwapControl: frameControl,
      chanceAfterMeeting1: quantumChances[0] ?? -1,
      chanceAfterMeeting2: quantumChances[1] ?? -1,
      chanceAfterMeeting3: quantumChances[2] ?? -1,
      standIn1: standIn[0] ?? -1,
      standIn2: standIn[1] ?? -1,
      standIn3: standIn[2] ?? -1,
      fearOffChances: fearOff.length,
      chsh: bell,
      chshStandIn: bellStandIn,
      matterChance1: matterChances[0] ?? -1,
      matterChance2: matterChances[1] ?? -1,
      matterChance3: matterChances[2] ?? -1,
      matterStandIn1: matterStandIn[0] ?? -1,
      matterStandIn2: matterStandIn[1] ?? -1,
      matterStandIn3: matterStandIn[2] ?? -1,
      matterInterferenceBeyondStandIn: matterChances.length === 3 && matterChances.some((c, k) => !exact(c, matterStandIn[k] ?? -1)) ? 1 : 0,
      matterChsh: matterBell,
      matterChshStandIn: matterBellStandIn,
      storedVacuumMismatches: storedVacuum.mismatches,
      storedMatterMismatches: storedMatter.mismatches,
      storedGrowerMismatches: storedGrower.mismatches,
      storedGrowerCharge: storedGrower.q,
      committedTableSignFlips: committedFlips,
    },
  }
}

// ---- the Standard Model readings ----

// the coin maps (with their orientation) that commute with both collisions on the golden fill's 81 docks on the hot
// store after 5 beats
export function coinMapLedger(schedule: LivingSchedule = 'alternate'): { kept: number; orientationReversingKept: number; orientationReversing: number } {
  const weave = weaveOf(QSIDE)
  const knit = makeLivingKnit(weave, schedule)
  const cells = weave.mesh.cellCount
  let s = livingState({ ...goldenFill(cells * 24, 1.37), tau: 1, layout: layoutOf(QSIDE) })
  const none = new Uint8Array(s.point.length)

  for (let t = 0; t < 5; t++) s = livingBeat(knit, s, none, t).state

  const docks: TokenStoreState[] = Array.from({ length: cells }, (_, x) => ({
    vibe: s.vibe.slice(x * 24, x * 24 + 24),
    store: s.store.slice(x * 12, x * 12 + 12),
    token: s.token.slice(x * 24, x * 24 + 24),
    place: s.place.slice(x * 24, x * 24 + 24),
    point: s.point,
    label: s.label,
  }))
  const permutations = weylF4DirectionPermutations({ directions: ROOTS })
  let kept = 0
  let reversingKept = 0
  let reversing = 0

  for (const g of permutations) {
    const orientation = orientationOf(g)
    let ok = true

    reversing += orientation === -1 ? 1 : 0

    for (const t of [0, 1]) {
      for (const x of docks) {
        if (!ok) break

        const gx = transformStoreState(x, [0], g)

        livingCollide(knit, gx, 0, t)

        const cx = cloneStoreState(x)

        livingCollide(knit, cx, 0, t)
        ok = sameStoreState(gx, transformStoreState(cx, [0], g))
      }
    }

    kept += ok ? 1 : 0
    reversingKept += ok && orientation === -1 ? 1 : 0
  }

  return { kept, orientationReversingKept: reversingKept, orientationReversing: reversing }
}

// The lone-love current response over one period on a side-9 vacuum given by its store (one trit per line, the same
// on every dock): R = sum_d j_d r_d^T, j_d the charge displacement per beat of the run against the vacuum run (the
// charge each slot's stream copies one root along), for a lone love started on every direction d; its antisymmetric
// part split into the self-dual and anti-self-dual halves
// (options: the links, when not the color weave's; the layout, when not the separated layout on those links; the
// center cell, when not the box's middle)
export function loneResponse(
  store: readonly number[],
  options: { schedule?: LivingSchedule; side?: number; links?: Int16Array; layout?: Int8Array; center?: number } = {},
): { selfDual: number; antiSelfDual: number; symmetricTrace: number; antisymmetric: number[] } {
  const side = options.side ?? 9
  const links = options.links
  const weave = weaveOf(side)
  const kernel = makeLivingKernel(weave, options.schedule ?? 'alternate', links)
  const onWeave: ColorWeave = links ? { ...weave, links } : weave
  const layout = options.layout ?? (links ? separatedLayout(onWeave) : layoutOf(side))
  const cells = kernel.cells
  const mid = Math.floor(side / 2)
  const center = options.center ?? d4BoxCell({ coordinates: [mid, mid, mid, mid], side })
  const r = [0, 1, 2, 3].map(() => [0, 0, 0, 0])
  const vacuumOf = (): Reduced => {
    const v = reducedFill(emptyFill(cells * 24), 0, layout)

    for (let x = 0; x < cells; x++) for (let l = 0; l < 12; l++) v.store[x * 12 + l] = store[l] as number

    return v
  }
  const vac = livingRunner(kernel, vacuumOf())
  const vacuumStates: Reduced[] = []

  for (let t = 0; t < PERIOD; t++) {
    vac.beat()
    vacuumStates.push(cloneReduced(vac.state()))
  }

  for (let direction = 0; direction < 24; direction++) {
    const start = vacuumOf()

    // a lone love on the direction; where the vacuum's store would make a pair on its line, the love takes the slot
    start.vibe[center * 24 + direction] = 1

    const run = livingRunner(kernel, start)
    const displacement = [0, 0, 0, 0]

    for (let t = 0; t < PERIOD; t++) {
      run.beat()

      const a = run.state().vibe
      const b = (vacuumStates[t] as Reduced).vibe

      for (let i = 0; i < a.length; i++) {
        const q = (a[i] as number) - (b[i] as number)

        if (q === 0) continue

        const root = ROOTS[i % 24] as number[]

        for (let k = 0; k < 4; k++) displacement[k] = (displacement[k] ?? 0) + q * (root[k] ?? 0)
      }
    }

    const root = ROOTS[direction] as number[]

    for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) r[i]![k] = (r[i]![k] ?? 0) + ((displacement[i] ?? 0) / PERIOD) * (root[k] ?? 0)
  }

  const a = (i: number, k: number): number => ((r[i]?.[k] ?? 0) - (r[k]?.[i] ?? 0)) / 2
  const selfDual = Math.hypot(a(0, 1) + a(2, 3), a(0, 2) - a(1, 3), a(0, 3) + a(1, 2))
  const antiSelfDual = Math.hypot(a(0, 1) - a(2, 3), a(0, 2) + a(1, 3), a(0, 3) - a(1, 2))

  return {
    selfDual,
    antiSelfDual,
    symmetricTrace: [0, 1, 2, 3].reduce((s, i) => s + (r[i]?.[i] ?? 0), 0),
    antisymmetric: [a(0, 1), a(0, 2), a(0, 3), a(1, 2), a(1, 3), a(2, 3)],
  }
}

// the generation copies: the 16 A2 planes (a triality sigma per plane); per plane, the lone runs whose support sequence
// differs from the run of sigma's image of the direction, and whether sigma keeps the hot vacuum's orientation
export function generationCopies(love: LivingDressing, fear: LivingDressing): { planes: number; split: number; planesKeepingHot: number } {
  const permutations = weylF4DirectionPermutations({ directions: ROOTS })
  const selectors = permutations.filter(p => permutationOrder({ permutation: p }) === 3 && p.filter((image, d) => image === d).length === 6)
  const perPlane = new Map<string, readonly number[]>()

  for (const p of selectors) {
    const key = p
      .map((image, d) => (image === d ? d : -1))
      .filter(d => d >= 0)
      .join(',')

    if (!perPlane.has(key)) perPlane.set(key, p)
  }

  let split = 0
  let keepingHot = 0
  const same = (a: number[] | undefined, b: number[] | undefined): boolean => !!a && !!b && a.length === b.length && a.every((x, i) => x === b[i])

  for (const sigma of perPlane.values()) {
    let exceptions = 0

    for (let d = 0; d < 24; d++) {
      const e = sigma[d] as number

      exceptions += same(love.sequences[d], love.sequences[e]) ? 0 : 1
      exceptions += same(fear.sequences[d], fear.sequences[e]) ? 0 : 1
    }

    split += exceptions > 0 ? 1 : 0
    keepingHot += LINE_FIRSTS.every(f => LINE_FIRSTS.includes(sigma[f] as number)) ? 1 : 0
  }

  return { planes: perPlane.size, split, planesKeepingHot: keepingHot }
}
