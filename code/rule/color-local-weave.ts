// The color-local weave family: every turning-weave-shaped rule on which color is an exact local law.
//
// E-FRC-0124 showed color is conserved cell by cell exactly when the wire table has no hop. Nothing else
// in the turning weave's collision touches color: the couple swap trades two lines first slot to first
// slot, so every role point moves with its vibe and keeps its side sign. So every choice of the schedule
// is color-local as long as the wire tables are hop-free. This file makes that whole family one function
// of a spec, so it can be searched:
// - the wire tables, any sum-keeping 9-state tables, chosen per beat (a table and its negation conjugate
//   can alternate so CPT can hold for a table that is not its own negated inverse)
// - the couple partitions: the partition at beat zero, the line symmetry that turns it, and the walk of
//   the turn over the beats (the committed walk is out and back, the mirror)
// - which couple swaps on each beat (the committed order runs out and back), or none
// - whether the swap is a palindrome around the clock (swap, clock, swap) or runs once before it
// - the swap's condition, any predicate on the two lines' states. It is made symmetric in the two lines,
//   so the swap is an involution whatever it is
// The role update on a wire is the one that keeps color: the two role points swap exactly when the
// weight of the line's first slot changes sign, the weight being the vibe or, on a calm slot, its side
// sign. For the bind table that is the rule of code/rule/color-weave (both slots held a vibe before). The
// update depends only on the state before and after, so it is its own inverse and reversal is exact.
//
// The committed rule is the spec with the pair table and every default. The color weave is the spec with
// the bind table and every default. Only a hop-free table makes the family color-local, and
// colorLocalLeaks measures that on any spec rather than trusting it.

import { type Collision, BIND_MOVE_FORWARD, G_TURN, PAIR_FORWARD, TURN_COUPLES_ZERO, TURN_POS_MIRROR, TURN_SWAP_ORDER } from '@/code/rule/collision'
import { stream, streamInverse } from '@/code/rule/lattice-gas'
import { type VibeState, type VibeWeave, makeVibeWeave } from '@/code/rule/vibe-weave'

export type WireTable = readonly (readonly [number, number])[]

export type ColorLocalSpec = {
  // the wire tables, and which one runs on beat t (index into tables, taken mod the list's length)
  readonly tables: readonly WireTable[]
  readonly tableAt: readonly number[]
  // when given, the table index is tableAt[t] + coupleTable[k] (mod the number of tables) for the k-th
  // couple of the beat's partition, so different couples can run different tables
  readonly coupleTable?: readonly number[]
  // when given, the couple that swaps on a beat runs this table instead (a control that puts a table on
  // the palindromic couple alone)
  readonly swapTable?: number
  // the couples at beat zero as pairs of line indices, [line, wire], and the line symmetry that turns them
  readonly couplesZero: readonly (readonly [number, number])[]
  readonly turn: readonly number[]
  // the power of the turn used on beat t, mod the list's length
  readonly positionAt: readonly number[]
  // the couple that swaps on beat t (-1 for none), mod the list's length
  readonly swapAt: readonly number[]
  readonly palindrome: boolean
  // when the swap of a couple fires, on the two lines' state keys (0..8, key = (a + 1) * 3 + (b + 1)),
  // symmetrized: it fires when the predicate holds for (line, wire) or for (wire, line)
  readonly swapWhen: (line: number, wire: number) => boolean
}

const TONES = [-1, 0, 1]

export const stateKey = (a: number, b: number): number => (a + 1) * 3 + (b + 1)

export const keyState = (k: number): [number, number] => [Math.floor(k / 3) - 1, (k % 3) - 1]

export function invertTable(table: WireTable): WireTable {
  const inverse = new Array<[number, number]>(9)

  for (const a of TONES) {
    for (const b of TONES) {
      const out = table[stateKey(a, b)] ?? [a, b]

      inverse[stateKey(out[0], out[1])] = [a, b]
    }
  }

  return inverse
}

// the table with every vibe negated on both sides: N T N
export function negateTable(table: WireTable): WireTable {
  const out = new Array<[number, number]>(9)

  for (const a of TONES) {
    for (const b of TONES) {
      const image = table[stateKey(-a, -b)] ?? [-a, -b]

      out[stateKey(a, b)] = [-image[0], -image[1]]
    }
  }

  return out
}

// the four sum-keeping tables that make a pair from calm and have no hop: the lone-charge states fixed,
// calm, (1, -1) and (-1, 1) permuted with calm moved. 'bind' is code/rule/collision's bind-and-move table
export const HOP_FREE_TABLES: Readonly<Record<string, WireTable>> = {
  // calm -> (1, -1) -> (-1, 1) -> calm, the bind-and-move table
  bind: BIND_MOVE_FORWARD,
  // calm -> (-1, 1) -> (1, -1) -> calm, its inverse and its negation
  'bind-reverse': fromCycle([
    [stateKey(0, 0), stateKey(-1, 1)],
    [stateKey(-1, 1), stateKey(1, -1)],
    [stateKey(1, -1), stateKey(0, 0)],
  ]),
  // calm <-> (1, -1), (-1, 1) fixed
  'swap-plus': fromCycle([
    [stateKey(0, 0), stateKey(1, -1)],
    [stateKey(1, -1), stateKey(0, 0)],
  ]),
  // calm <-> (-1, 1), (1, -1) fixed
  'swap-minus': fromCycle([
    [stateKey(0, 0), stateKey(-1, 1)],
    [stateKey(-1, 1), stateKey(0, 0)],
  ]),
}

function fromCycle(moves: readonly (readonly [number, number])[]): WireTable {
  const table = Array.from({ length: 9 }, (_, k) => keyState(k))

  for (const [from, to] of moves) {
    table[from] = keyState(to)
  }

  return table
}

export const PAIR_TABLE: WireTable = PAIR_FORWARD

// controls that are not color-local: the committed table with the hop kept for one sign only
export const HOP_CONTROL_TABLES: Readonly<Record<string, WireTable>> = {
  // a love hops, a lone fear stays
  'hop-love': fromCycle([
    [stateKey(0, 0), stateKey(1, -1)],
    [stateKey(1, -1), stateKey(-1, 1)],
    [stateKey(-1, 1), stateKey(0, 0)],
    [stateKey(1, 0), stateKey(0, 1)],
    [stateKey(0, 1), stateKey(1, 0)],
  ]),
  // a fear hops, a lone love stays
  'hop-fear': fromCycle([
    [stateKey(0, 0), stateKey(1, -1)],
    [stateKey(1, -1), stateKey(-1, 1)],
    [stateKey(-1, 1), stateKey(0, 0)],
    [stateKey(-1, 0), stateKey(0, -1)],
    [stateKey(0, -1), stateKey(-1, 0)],
  ]),
}

// the committed turning weave's schedule, as a spec
export const TURNING_SCHEDULE = {
  couplesZero: TURN_COUPLES_ZERO,
  turn: G_TURN,
  positionAt: TURN_POS_MIRROR,
  swapAt: [...TURN_SWAP_ORDER, ...[...TURN_SWAP_ORDER].reverse()],
  palindrome: true,
  swapWhen: (line: number, wire: number): boolean => {
    const [a0, a1] = keyState(line)
    const [w0, w1] = keyState(wire)

    return a0 === 0 && a1 !== 0 && w0 === 0 && w1 === 0
  },
} as const

export function colorLocalSpec(input: Partial<ColorLocalSpec> & { tables: readonly WireTable[] }): ColorLocalSpec {
  return { tableAt: [0], ...TURNING_SCHEDULE, ...input }
}

type Built = {
  readonly lines: readonly (readonly [number, number])[]
  readonly positions: readonly (readonly (readonly [number, number])[])[]
  readonly forwardTables: readonly WireTable[]
  readonly inverseTables: readonly WireTable[]
  readonly fires: Uint8Array
}

const at = (list: readonly number[], t: number): number => list[((t % list.length) + list.length) % list.length] ?? 0

function build(spec: ColorLocalSpec, opposite: readonly number[]): Built {
  const lines: [number, number][] = []

  for (let d = 0; d < opposite.length; d++) {
    const o = opposite[d] ?? d

    if (d < o) {
      lines.push([d, o])
    }
  }

  const positions: (readonly [number, number])[][] = []

  let current = spec.couplesZero.map(([a, b]) => [a, b] as const)

  // the turn is applied to both members, keeping which one is the wire by the order the turn gives it:
  // the committed weave sorts each couple, so the wire is the larger line index after the turn
  const norm = (a: number, b: number): readonly [number, number] => (a < b ? [a, b] : [b, a])

  current = current.map(([a, b]) => norm(a, b))

  for (let i = 0; i < 12; i++) {
    positions.push(current)
    current = current.map(([a, b]) => norm(spec.turn[a] ?? a, spec.turn[b] ?? b))
  }

  const fires = new Uint8Array(81)

  for (let l = 0; l < 9; l++) {
    for (let w = 0; w < 9; w++) {
      fires[l * 9 + w] = spec.swapWhen(l, w) || spec.swapWhen(w, l) ? 1 : 0
    }
  }

  return { lines, positions, forwardTables: spec.tables, inverseTables: spec.tables.map(invertTable), fires }
}

// one cell's collision on vibes, and on role points when given, forward or its exact inverse
function collide(input: {
  spec: ColorLocalSpec
  built: Built
  vibe: Int8Array
  role: Int8Array | undefined
  base: number
  t: number
  forward: boolean
  tally?: Tally
}): void {
  const { spec, built, vibe, role, base, t, forward, tally } = input
  const tables = forward ? built.forwardTables : built.inverseTables
  const tableIndex = at(spec.tableAt, t)
  const couples = built.positions[at(spec.positionAt, t)] ?? []
  const swapIndex = at(spec.swapAt, t)

  for (let k = 0; k < couples.length; k++) {
    const table =
      (k === swapIndex && spec.swapTable !== undefined
        ? tables[spec.swapTable]
        : tables[(tableIndex + (spec.coupleTable?.[k] ?? 0)) % tables.length]) ?? []
    const line = built.lines[couples[k]?.[0] ?? 0] ?? [0, 0]
    const wire = built.lines[couples[k]?.[1] ?? 0] ?? [0, 0]
    const place = { vibe, role, base, line, wire, fires: built.fires, table, tally }

    if (k !== swapIndex) {
      clockLine(place)
    } else if (spec.palindrome) {
      swapLines(place)
      clockLine(place)
      swapLines(place)
    } else if (forward) {
      swapLines(place)
      clockLine(place)
    } else {
      clockLine(place)
      swapLines(place)
    }
  }
}

type Place = {
  readonly vibe: Int8Array
  readonly role: Int8Array | undefined
  readonly base: number
  readonly line: readonly [number, number]
  readonly wire: readonly [number, number]
  readonly fires: Uint8Array
  readonly table: WireTable
  readonly tally: Tally | undefined
}

// counts of what the collision did, for measuring mechanism: swaps that fired, and wire transitions
// out of calm (a pair made) and into calm (a pair gone)
export type Tally = { swaps: number; made: number; unmade: number }

// the couple's swap: the two lines trade contents slot for slot when the condition fires
function swapLines(place: Place): void {
  const { vibe, role, base, line, wire, fires, tally } = place
  const l = stateKey(vibe[base + line[0]] ?? 0, vibe[base + line[1]] ?? 0)
  const w = stateKey(vibe[base + wire[0]] ?? 0, vibe[base + wire[1]] ?? 0)

  if (fires[l * 9 + w] !== 1) {
    return
  }

  if (tally) {
    tally.swaps++
  }

  for (let s = 0; s < 2; s++) {
    const i = base + (line[s] ?? 0)
    const j = base + (wire[s] ?? 0)
    const v = vibe[i] ?? 0

    vibe[i] = vibe[j] ?? 0
    vibe[j] = v

    if (role) {
      const r = role[i] ?? 0

      role[i] = role[j] ?? 0
      role[j] = r
    }
  }
}

// the wire's table, with the two role points swapped when the first slot's weight changes sign (the
// weight is the vibe, or +1 on a calm first slot)
function clockLine(place: Place): void {
  const { vibe, role, base, wire, table, tally } = place
  const i = base + wire[0]
  const j = base + wire[1]
  const a = vibe[i] ?? 0
  const b = vibe[j] ?? 0
  const image = table[stateKey(a, b)] ?? [a, b]

  vibe[i] = image[0]
  vibe[j] = image[1]

  if (tally) {
    tally.made += a === 0 && b === 0 && (image[0] !== 0 || image[1] !== 0) ? 1 : 0
    tally.unmade += image[0] === 0 && image[1] === 0 && (a !== 0 || b !== 0) ? 1 : 0
  }

  if (role && (a !== 0 ? a : 1) !== (image[0] !== 0 ? image[0] : 1)) {
    const r = role[i] ?? 0

    role[i] = role[j] ?? 0
    role[j] = r
  }
}

// the vibe collision of beat t, forward or inverse, for the lattice-gas engine
export function colorLocalCollision(input: {
  spec: ColorLocalSpec
  opposite: readonly number[]
  forward?: boolean
  // when given, every swap that fires and every pair made or unmade on a wire is counted into it
  tally?: Tally
}): (t: number) => Collision {
  const built = build(input.spec, input.opposite)
  const forward = input.forward ?? true
  const tally = input.tally

  return t => (slots, base) => collide({ spec: input.spec, built, vibe: slots, role: undefined, base, t, forward, tally })
}

export type ColorLocalWeave = VibeWeave & {
  readonly spec: ColorLocalSpec
  readonly built: Built
  // +1 for the first slot of its line, -1 for the second: the sign of a calm slot's color
  readonly side: readonly number[]
}

export function makeColorLocalWeave(input: { side: number; spec: ColorLocalSpec }): ColorLocalWeave {
  const weave = makeVibeWeave({ side: input.side })
  const side = Array.from({ length: 24 }, (_, d) => (d < (weave.opposite[d] ?? d) ? 1 : -1))

  return { ...weave, spec: input.spec, built: build(input.spec, weave.opposite), side }
}

export function colorLocalBeat(weave: ColorLocalWeave, state: VibeState, t: number): VibeState {
  const { mesh, moves, links } = weave
  const vibe = Int8Array.from(state.vibe)
  const role = Int8Array.from(state.role)
  const flow = Int32Array.from(state.flow)

  for (let x = 0; x < mesh.cellCount; x++) {
    collide({ spec: weave.spec, built: weave.built, vibe, role, base: x * 24, t, forward: true })
  }

  const moved = new Int8Array(role.length)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const slot = x * 24 + d

      moved[mesh.neighbour(x, d) * 24 + d] = moves.act[links[slot] ?? moves.identity]?.[role[slot] ?? 0] ?? 0
      flow[slot] = (flow[slot] ?? 0) + (vibe[slot] ?? 0)
    }
  }

  return { vibe: stream({ mesh, data: vibe }).data, role: moved, flow }
}

export function colorLocalBeatBack(weave: ColorLocalWeave, state: VibeState, t: number): VibeState {
  const { mesh, moves, links, opposite } = weave
  const vibe = streamInverse({ mesh, data: Int8Array.from(state.vibe) }).data
  const role = new Int8Array(state.role.length)
  const flow = Int32Array.from(state.flow)

  for (let y = 0; y < mesh.cellCount; y++) {
    for (let d = 0; d < 24; d++) {
      const x = mesh.neighbour(y, opposite[d] ?? d)
      const slot = x * 24 + d

      role[slot] = moves.act[moves.inverse[links[slot] ?? moves.identity] ?? moves.identity]?.[state.role[y * 24 + d] ?? 0] ?? 0
      flow[slot] = (flow[slot] ?? 0) - (vibe[slot] ?? 0)
    }
  }

  for (let x = 0; x < mesh.cellCount; x++) {
    collide({ spec: weave.spec, built: weave.built, vibe, role, base: x * 24, t, forward: false })
  }

  return { vibe, role, flow }
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3

// how many cells the collision alone changes the color content of at beat t: [weight, x, y] mod 3, the
// weight of a slot its vibe or, on a calm slot, its side sign
export function colorLocalLeaks(weave: ColorLocalWeave, state: VibeState, t: number): number {
  const vibe = Int8Array.from(state.vibe)
  const role = Int8Array.from(state.role)
  const content = (x: number): string => {
    let w = 0
    let qx = 0
    let qy = 0

    for (let d = 0; d < 24; d++) {
      const v = vibe[x * 24 + d] ?? 0
      const weight = v !== 0 ? v : (weave.side[d] ?? 1)
      const p = role[x * 24 + d] ?? 0

      w += weight
      qx += weight * (p % 3)
      qy += weight * Math.floor(p / 3)
    }

    return `${mod3(w)},${mod3(qx)},${mod3(qy)}`
  }

  let leaks = 0

  for (let x = 0; x < weave.mesh.cellCount; x++) {
    const before = content(x)

    collide({ spec: weave.spec, built: weave.built, vibe, role, base: x * 24, t, forward: true })
    leaks += content(x) === before ? 0 : 1
  }

  return leaks
}
