// The combined knit: one rule carrying every piece proposed for the base, each switchable, so they can be
// measured together and apart (E-FRC-0158, E-FRC-0159).
//
// The pieces, each imported or copied from the module that owns it:
// - THE BASE: a color-local spec (code/rule/color-local-weave), by default the head-on turn weave
//   (code/rule/scatter-weave HEAD_TURN_SPEC, E-FLD-0024): the color turn schedule, the bind table, the
//   exchange firing only between a like head-on pair and a calm line, so every couple keeps its line momenta.
//   Role points (here, tokens) move as that module moves them: with the palindromic exchange, and at a wire
//   where the first slot's weight changes sign.
// - THE FOLD: the base's schedule replaced by the round robin folded into the 24-beat palindrome
//   (code/rule/steered-knit foldRoundRobin, E-FRC-0152), so every line meets every other.
// - THE SCATTER BLOCK: the four-line binary scattering of code/rule/scatter-weave, side-keeping, lone tones
//   only, on scatterSchedule's sets, placed as S_t after the base after S_(c - t), c the base's CPT mirror
//   phase (measured on the base, and passed in the spec).
// - STEERING: code/rule/steered-knit's trade (lone, line, slot or either) run as a palindrome S K S around
//   everything above, reading the flux on each link, which streaming changes by what crosses it. The trade
//   is steerDock itself, run on a scratch copy of the dock with the slot indices riding as role points, so
//   the permutation it applies moves the tokens too.
// - THE FEAR BEAT: the quantum layer of code/rule/fear-weave. Every slot carries a token; tokens move exactly
//   as the vibes do, through every piece above and the stream, and a closed token's classical role point is
//   moved by the link it crosses. Where two open tokens meet at a wire (both slots held a vibe before the
//   table acts) the meeting is recorded with the two vibes' signs, in the form fearBeat records it, so the
//   whole (advanceWhole in color mode, or its calm departure times omega^q, code/rule/calm-weave and
//   code/rule/signed-knot) evolves by the same kernels. The classical layer never reads the whole, so
//   switching the fear beat on or off cannot change a vibe, a token or a flux: only the whole's weights.
//   Since 2026-09-26 that beat is the COMOVING one, by the user's decision (E-SPN-0063): each meeting's kernel
//   read about the two tokens' own role points, which the whole carries beside its weights and moves by the
//   same grid move a closed token's classical role point takes here. Nothing in this module changes for it:
//   the record it hands over (meetings, signs, crossings) is all the comoving beat reads.
//
// The dock collision of beat t, forward:  G_t  S_t  B_t  S_(c - t)  G_t,  G the steering trade, S the scatter
// set, B the base. Backward: G_t  S_(c - t)  B_t^-1  S_t  G_t. Then every slot streams, forward or back.

import { type Collision } from '@/code/rule/collision'
import { type ColorLocalSpec, invertTable, stateKey, type WireTable } from '@/code/rule/color-local-weave'
import { HEAD_TURN_SPEC, scatterSchedule, type Scattering } from '@/code/rule/scatter-weave'
import { foldRoundRobin, makeSteeredKnit, partitionAt, steerDock, type KnitSteer, type SteeredKnit } from '@/code/rule/steered-knit'
import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import { type BeatRecord } from '@/code/rule/fear-weave'

export type CombinedKnitSpec = {
  // the base before any fold
  readonly base: ColorLocalSpec
  readonly fold: boolean
  readonly scatter: boolean
  // the CPT mirror phase of the scheduled base (folded or not), which places the scatter block
  readonly mirror: number
  readonly steer: KnitSteer
}

export const COMBINED_DEFAULT: CombinedKnitSpec = { base: HEAD_TURN_SPEC, fold: false, scatter: true, mirror: 23, steer: false }

// the base with the fold applied
export function scheduleOf(spec: CombinedKnitSpec): ColorLocalSpec {
  return spec.fold ? foldRoundRobin(spec.base) : spec.base
}

type Built = {
  readonly schedule: ColorLocalSpec
  readonly lines: readonly (readonly [number, number])[]
  readonly positions: readonly (readonly (readonly [number, number])[])[]
  readonly forwardTables: readonly WireTable[]
  readonly inverseTables: readonly WireTable[]
  readonly fires: Uint8Array
  readonly sets: readonly Int32Array[]
  readonly opposite: readonly number[]
}

const at = (list: readonly number[], t: number): number => list[((t % list.length) + list.length) % list.length] ?? 0
const mod = (t: number, n: number): number => ((t % n) + n) % n
const mod3 = (x: number): number => ((x % 3) + 3) % 3
const weight = (v: number): number => (v !== 0 ? v : 1)

function build(spec: CombinedKnitSpec, opposite: readonly number[]): Built {
  const schedule = scheduleOf(spec)
  const lines: [number, number][] = []

  for (let d = 0; d < opposite.length; d++) {
    const o = opposite[d] ?? d

    if (d < o) {
      lines.push([d, o])
    }
  }

  const norm = (a: number, b: number): readonly [number, number] => (a < b ? [a, b] : [b, a])
  const positions: (readonly [number, number])[][] = []

  let current = schedule.couplesZero.map(([a, b]) => norm(a, b))

  for (let i = 0; i < 12; i++) {
    positions.push(current)
    current = current.map(([a, b]) => norm(schedule.turn[a] ?? a, schedule.turn[b] ?? b))
  }

  const fires = new Uint8Array(81)

  for (let l = 0; l < 9; l++) {
    for (let w = 0; w < 9; w++) {
      fires[l * 9 + w] = schedule.swapWhen(l, w) || schedule.swapWhen(w, l) ? 1 : 0
    }
  }

  const sets = spec.scatter ? scatterSchedule().map((set: readonly Scattering[]) => Int32Array.from(set.flatMap(s => [...s]))) : []

  return { schedule, lines, positions, forwardTables: schedule.tables, inverseTables: schedule.tables.map(invertTable), fires, sets, opposite }
}

// the per-dock working set: vibes, and optionally tokens, which open tokens they are, and where to record
type Dock = {
  readonly vibe: Int8Array
  readonly token: Int32Array | undefined
  readonly open: Uint8Array | undefined
  readonly base: number
  readonly meetings: [number, number][]
  readonly signs: [number, number][]
}

const swapSlots = (dock: Dock, i: number, j: number): void => {
  const { vibe, token } = dock
  const v = vibe[i] ?? 0

  vibe[i] = vibe[j] ?? 0
  vibe[j] = v

  if (token) {
    const r = token[i] ?? 0

    token[i] = token[j] ?? 0
    token[j] = r
  }
}

// the scattering set, as code/rule/scatter-weave's scatter with lone tones only
function scatter(dock: Dock, built: Built, set: Int32Array): void {
  const { vibe, base } = dock

  for (let k = 0; k < set.length; k += 4) {
    const [a = 0, b = 0, c = 0, e = 0] = [set[k], set[k + 1], set[k + 2], set[k + 3]]

    if (
      vibe[base + (built.opposite[a] ?? 0)] !== 0 ||
      vibe[base + (built.opposite[b] ?? 0)] !== 0 ||
      vibe[base + (built.opposite[c] ?? 0)] !== 0 ||
      vibe[base + (built.opposite[e] ?? 0)] !== 0
    ) {
      continue
    }

    const u = base + a
    const v = base + b
    const w = base + c
    const x = base + e
    const here = vibe[u] !== 0 && vibe[v] !== 0 && vibe[w] === 0 && vibe[x] === 0
    const there = vibe[w] !== 0 && vibe[x] !== 0 && vibe[u] === 0 && vibe[v] === 0

    if (here || there) {
      swapSlots(dock, u, w)
      swapSlots(dock, v, x)
    }
  }
}

function exchange(dock: Dock, built: Built, line: readonly [number, number], wire: readonly [number, number]): void {
  const { vibe, base } = dock
  const l = stateKey(vibe[base + line[0]] ?? 0, vibe[base + line[1]] ?? 0)
  const w = stateKey(vibe[base + wire[0]] ?? 0, vibe[base + wire[1]] ?? 0)

  if (built.fires[l * 9 + w] === 1) {
    swapSlots(dock, base + line[0], base + wire[0])
    swapSlots(dock, base + line[1], base + wire[1])
  }
}

// the wire's table; tokens exchanged where the first slot's weight changes sign; a meeting of two open
// tokens recorded as fear-weave's collideCell records it
function clock(dock: Dock, wire: readonly [number, number], table: WireTable, preimage: WireTable, forward: boolean): void {
  const { vibe, token, open, base } = dock
  const i = base + wire[0]
  const j = base + wire[1]
  const a = vibe[i] ?? 0
  const b = vibe[j] ?? 0
  const image = table[stateKey(a, b)] ?? [a, b]
  const before = forward ? [a, b] : (preimage[stateKey(a, b)] ?? [a, b])

  vibe[i] = image[0]
  vibe[j] = image[1]

  if (!token) {
    return
  }

  const after0 = forward ? image[0] : a
  const exchanged = weight(before[0] ?? 0) !== weight(after0)
  const ti = token[i] ?? 0
  const tj = token[j] ?? 0

  if (open && before[0] !== 0 && before[1] !== 0 && open[ti] === 1 && open[tj] === 1) {
    dock.meetings.push([ti, tj])
    dock.signs.push(forward || !exchanged ? [before[0] ?? 0, before[1] ?? 0] : [before[1] ?? 0, before[0] ?? 0])
  }

  if (exchanged) {
    token[i] = tj
    token[j] = ti
  }
}

function baseCollide(dock: Dock, built: Built, t: number, forward: boolean): void {
  const schedule = built.schedule
  const tables = forward ? built.forwardTables : built.inverseTables
  const tableIndex = at(schedule.tableAt, t)
  const couples = built.positions[at(schedule.positionAt, t)] ?? []
  const swapIndex = at(schedule.swapAt, t)

  for (let k = 0; k < couples.length; k++) {
    const index =
      k === swapIndex && schedule.swapTable !== undefined ? schedule.swapTable : (tableIndex + (schedule.coupleTable?.[k] ?? 0)) % tables.length
    const table = tables[index] ?? []
    const preimage = built.inverseTables[index] ?? []
    const line = built.lines[couples[k]?.[0] ?? 0] ?? [0, 0]
    const wire = built.lines[couples[k]?.[1] ?? 0] ?? [0, 0]

    if (k !== swapIndex) {
      clock(dock, wire, table, preimage, forward)
    } else if (schedule.palindrome) {
      exchange(dock, built, line, wire)
      clock(dock, wire, table, preimage, forward)
      exchange(dock, built, line, wire)
    } else if (forward) {
      exchange(dock, built, line, wire)
      clock(dock, wire, table, preimage, forward)
    } else {
      clock(dock, wire, table, preimage, forward)
      exchange(dock, built, line, wire)
    }
  }
}

// the steering trade on one dock, run through steerDock on a scratch copy whose role points are the slot
// indices: the permutation steerDock applies is then read off and applied to the dock's vibes and tokens
const SCRATCH_VIBE = new Int8Array(24)
const SCRATCH_ROLE = new Int8Array(24)

function steer(dock: Dock, knit: SteeredKnit, string: (d: number) => boolean, t: number, couples: readonly (readonly [number, number])[]): void {
  for (let d = 0; d < 24; d++) {
    SCRATCH_VIBE[d] = dock.vibe[dock.base + d] ?? 0
    SCRATCH_ROLE[d] = d
  }

  steerDock({ knit, slots: SCRATCH_VIBE, base: 0, string, t, role: SCRATCH_ROLE, couples })

  const token = dock.token
  const tokens = token ? Array.from({ length: 24 }, (_, d) => token[dock.base + (SCRATCH_ROLE[d] ?? d)] ?? 0) : undefined

  for (let d = 0; d < 24; d++) {
    dock.vibe[dock.base + d] = SCRATCH_VIBE[d] ?? 0

    if (token && tokens) {
      token[dock.base + d] = tokens[d] ?? 0
    }
  }
}

function dockCollide(input: {
  knit: CombinedKnit
  dock: Dock
  t: number
  forward: boolean
  string?: (d: number) => boolean
  couples?: readonly (readonly [number, number])[]
}): void {
  const { knit, dock, t, forward, string, couples } = input
  const built = knit.built
  const n = built.sets.length
  const first = n > 0 ? built.sets[mod(knit.spec.mirror - t, n)] : undefined
  const last = n > 0 ? built.sets[mod(t, n)] : undefined
  const steering = knit.steered && knit.spec.steer && string && couples

  if (steering) {
    steer(dock, knit.steered!, string, t, couples)
  }

  if (forward) {
    if (first) scatter(dock, built, first)
    baseCollide(dock, built, t, true)
    if (last) scatter(dock, built, last)
  } else {
    if (last) scatter(dock, built, last)
    baseCollide(dock, built, t, false)
    if (first) scatter(dock, built, first)
  }

  if (steering) {
    steer(dock, knit.steered!, string, t, couples)
  }
}

export type CombinedKnit = {
  readonly spec: CombinedKnitSpec
  readonly built: Built
  // the classical scaffolding the fear layer reads: mesh, links, grid moves (makeColorWeave)
  readonly weave: ColorWeave
  // the flux links and the steering trade, when steering is on
  readonly steered: SteeredKnit | undefined
  readonly target: Int32Array
}

export function makeCombinedKnit(input: { side: number; spec: CombinedKnitSpec }): CombinedKnit {
  const weave = makeColorWeave({ side: input.side, table: 'bind' })
  const target = new Int32Array(weave.mesh.cellCount * 24)

  for (let x = 0; x < weave.mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      target[x * 24 + d] = weave.mesh.neighbour(x, d) * 24 + d
    }
  }

  const steered = input.spec.steer ? makeSteeredKnit({ side: input.side, spec: scheduleOf(input.spec), steer: input.spec.steer }) : undefined

  return { spec: input.spec, built: build(input.spec, weave.opposite), weave, steered, target }
}

// the vibe collision of beat t, forward or inverse, for the lattice-gas engine and every dock-level
// instrument. Steering reads the flux, which a dock collision cannot see, so it has none
export function combinedCollision(input: { spec: CombinedKnitSpec; opposite: readonly number[]; forward?: boolean }): (t: number) => Collision {
  if (input.spec.steer) {
    throw new Error('a steered knit reads the flux: run it through combinedBeat')
  }

  const knit: CombinedKnit = {
    spec: input.spec,
    built: build(input.spec, input.opposite),
    weave: undefined as unknown as ColorWeave,
    steered: undefined,
    target: new Int32Array(0),
  }
  const forward = input.forward ?? true

  return t => (slots, base) =>
    dockCollide({ knit, dock: { vibe: slots, token: undefined, open: undefined, base, meetings: [], signs: [] }, t, forward })
}

// the classical state: a vibe and a token at every slot, the classical role point of every token (the
// points of open tokens are carried by the whole instead), and the flux on every link (steering only)
export type CombinedState = {
  readonly vibe: Int8Array
  readonly token: Int32Array
  readonly point: Int8Array
  readonly flux: Int32Array
}

export function combinedState(knit: CombinedKnit, input: { vibe: Int8Array; point: Int8Array; flux?: Int32Array }): CombinedState {
  return {
    vibe: Int8Array.from(input.vibe),
    token: Int32Array.from({ length: input.vibe.length }, (_, i) => i),
    point: Int8Array.from(input.point),
    flux: input.flux ? Int32Array.from(input.flux) : new Int32Array(knit.steered?.edges.length ?? 0),
  }
}

function collideAll(knit: CombinedKnit, state: { vibe: Int8Array; token: Int32Array; flux: Int32Array }, open: Uint8Array, t: number, forward: boolean): BeatRecord {
  const meetings: [number, number][] = []
  const signs: [number, number][] = []
  const steered = knit.steered
  const couples = steered ? partitionAt(steered.spec, t) : undefined

  for (let x = 0; x < knit.weave.mesh.cellCount; x++) {
    const string = steered ? (d: number): boolean => mod3(state.flux[steered.edgeOf[x * 24 + d] ?? 0] ?? 0) !== 0 : undefined

    dockCollide({ knit, dock: { vibe: state.vibe, token: state.token, open, base: x * 24, meetings, signs }, t, forward, string, couples })
  }

  return { meetings, crossings: [], signs }
}

// one beat forward: collide every dock, then stream vibes and tokens (moving each closed token's role point
// by its link), and change each link's flux by what crossed it. Returns what the beat did to open tokens
export function combinedBeat(knit: CombinedKnit, state: CombinedState, open: Uint8Array, t: number): { state: CombinedState; record: BeatRecord } {
  const vibe = Int8Array.from(state.vibe)
  const token = Int32Array.from(state.token)
  const point = Int8Array.from(state.point)
  const flux = Int32Array.from(state.flux)
  const collided = collideAll(knit, { vibe, token, flux }, open, t, true)
  const { moves, links } = knit.weave
  const streamedVibe = new Int8Array(vibe.length)
  const streamedToken = new Int32Array(token.length)
  const crossings: [number, number][] = []
  const steered = knit.steered

  if (steered) {
    steered.edges.forEach(([a, b, d], l) => {
      flux[l] = (flux[l] ?? 0) + (vibe[b * 24 + (steered.opposite[d] ?? d)] ?? 0) - (vibe[a * 24 + d] ?? 0)
    })
  }

  for (let s = 0; s < vibe.length; s++) {
    const tk = token[s] ?? 0
    const g = links[s] ?? moves.identity
    const to = knit.target[s] ?? 0

    streamedVibe[to] = vibe[s] ?? 0
    streamedToken[to] = tk

    if (open[tk] === 1) {
      crossings.push([tk, g])
    } else {
      point[tk] = moves.act[g]?.[point[tk] ?? 0] ?? 0
    }
  }

  return {
    state: { vibe: streamedVibe, token: streamedToken, point, flux },
    record: { meetings: collided.meetings, crossings, signs: collided.signs },
  }
}

// one beat backward, the exact inverse of combinedBeat at beat t
export function combinedBeatBack(knit: CombinedKnit, state: CombinedState, open: Uint8Array, t: number): { state: CombinedState; record: BeatRecord } {
  const { moves, links } = knit.weave
  const vibe = new Int8Array(state.vibe.length)
  const token = new Int32Array(state.token.length)
  const point = Int8Array.from(state.point)
  const flux = Int32Array.from(state.flux)
  const crossings: [number, number][] = []

  for (let s = 0; s < vibe.length; s++) {
    const from = knit.target[s] ?? 0
    const tk = state.token[from] ?? 0
    const g = moves.inverse[links[s] ?? moves.identity] ?? moves.identity

    vibe[s] = state.vibe[from] ?? 0
    token[s] = tk

    if (open[tk] === 1) {
      crossings.push([tk, g])
    } else {
      point[tk] = moves.act[g]?.[point[tk] ?? 0] ?? 0
    }
  }

  const steered = knit.steered

  if (steered) {
    steered.edges.forEach(([a, b, d], l) => {
      flux[l] = (flux[l] ?? 0) - (vibe[b * 24 + (steered.opposite[d] ?? d)] ?? 0) + (vibe[a * 24 + d] ?? 0)
    })
  }

  const collided = collideAll(knit, { vibe, token, flux }, open, t, false)

  return { state: { vibe, token, point, flux }, record: { meetings: collided.meetings, crossings, signs: collided.signs } }
}

// each slot's classical role point: the point of the token it holds
export function rolesOf(state: CombinedState): Int8Array {
  return Int8Array.from(state.token, tk => state.point[tk] ?? 0)
}

// how many docks the collision of beat t changes the color content of ([weight, x, y] mod 3, a calm slot
// weighted by its side), with role points read through the tokens
export function combinedLeaks(knit: CombinedKnit, state: CombinedState, t: number): number {
  const vibe = Int8Array.from(state.vibe)
  const token = Int32Array.from(state.token)
  const flux = state.flux
  const side = Array.from({ length: 24 }, (_, d) => (d < (knit.built.opposite[d] ?? d) ? 1 : -1))
  const content = (x: number): string => {
    let w = 0
    let qx = 0
    let qy = 0

    for (let d = 0; d < 24; d++) {
      const v = vibe[x * 24 + d] ?? 0
      const wt = v !== 0 ? v : (side[d] ?? 1)
      const p = state.point[token[x * 24 + d] ?? 0] ?? 0

      w += wt
      qx += wt * (p % 3)
      qy += wt * Math.floor(p / 3)
    }

    return `${mod3(w)},${mod3(qx)},${mod3(qy)}`
  }
  const steered = knit.steered
  const couples = steered ? partitionAt(steered.spec, t) : undefined
  const open = new Uint8Array(0)

  let leaks = 0

  for (let x = 0; x < knit.weave.mesh.cellCount; x++) {
    const before = content(x)
    const string = steered ? (d: number): boolean => mod3(flux[steered.edgeOf[x * 24 + d] ?? 0] ?? 0) !== 0 : undefined

    dockCollide({ knit, dock: { vibe, token, open, base: x * 24, meetings: [], signs: [] }, t, forward: true, string, couples })
    leaks += content(x) === before ? 0 : 1
  }

  return leaks
}
