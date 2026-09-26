// HashLife for the knit (E-CMP-0016): Gosper's memoized space-time blocks, generalized to the 24-direction
// lattice gas on D4, with the beat's phase in the schedule carried in every memo key.
//
// Gosper's HashLife (1984) stores a pattern as a quadtree whose identical subtrees are one shared node, and
// memoizes, for each node of side 2^k, the state of its central half 2^(k-2) generations later. Here:
// - SPACE. The D4 lattice is the integer points of Z^4 with even coordinate sum, the root directions
//   (+-1, +-1, 0, 0) in every arrangement (rootsD4). A node of level k is an axis-aligned cube of 2^k
//   points on a side with a corner at a multiple of 2^k, so it has 16 children, and an odd-sum point holds
//   the NONE leaf. Every corner the recursion forms is a multiple of 2 (of 2^(k-2) for k >= 3), so a local
//   coordinate's parity is its global parity and the same content is always the same node. A leaf is one
//   dock's 24 slots, interned by its base-3 code (3^24 < 2^53, exact in a double).
// - TIME. A beat is collide then stream, and every coordinate moves at most 1 per beat, so a node of side
//   2^k determines its central 2^(k-1) cube for 2^(k-2) beats. The knit is scheduled (the collision of beat
//   t depends on t mod its period P), so a memo entry is keyed by (node, phase, log2 beats), and the
//   vacuum, the same in every dock and periodic, is one canonical node per level and phase.
// - THE RECURSION. For a node of level k: its 4^4 grandchildren form 3^4 = 81 overlapping level-(k-1)
//   nodes; each is advanced a half step to its centre, the 81 results form 2^4 = 16 overlapping level-(k-1)
//   nodes, each advanced the other half step, and their 16 centres are the answer. For a step below the
//   node's full 2^(k-2), the first half takes centres without advancing (Golly's variable step). The base
//   case is level 2 (4^4 points), advanced one beat directly by the dock collision and the stream.
// - THE UNIVERSE. The pattern sits in a root node with the vacuum everywhere outside it. Before an advance
//   of 2^j beats the root is padded with vacuum (at the current phase) until everything that differs from
//   the vacuum lies inside its central half with a margin of 2^j, so the result, the central half after 2^j
//   beats, holds all of it and the outside is still exactly vacuum. The lattice is therefore UNBOUNDED and
//   the run exact.
//
// Exact by construction (nothing is approximated, every memo entry is a pure function of its key);
// E-CMP-0016 checks it bit for bit against the dense lattice gas and the difference engine. What it cannot
// do: memoization pays only where space-time blocks repeat. The vacuum repeats perfectly; a dense
// disturbance does not, and then every block is new and the engine is slower than brute force.

import { type Collision } from '@/code/rule/collision'
import { rootsD4 } from '@/code/algebra/group/root-system'

const DEGREE = 24
const NONE_CODE = -1
const ROOTS: readonly (readonly number[])[] = rootsD4()
const POW3 = Array.from({ length: DEGREE }, (_, d) => 3 ** d)

export class HashLifeOverflow extends Error {
  constructor(readonly nodes: number) {
    super(`hash life: more than ${nodes} nodes`)
  }
}

export function encodeDock(state: ArrayLike<number>): number {
  let code = 0

  for (let d = 0; d < DEGREE; d++) {
    code += ((state[d] ?? 0) + 1) * (POW3[d] ?? 0)
  }

  return code
}

export function decodeDock(code: number, into: Int8Array = new Int8Array(DEGREE)): Int8Array {
  let c = code

  for (let d = 0; d < DEGREE; d++) {
    const r = c % 3

    into[d] = r - 1
    c = (c - r) / 3
  }

  return into
}

// the index of a local point (x, y, z, w) in a cube of side n
const pointIndex = (p: readonly number[], n: number): number => (p[0] ?? 0) + n * ((p[1] ?? 0) + n * ((p[2] ?? 0) + n * (p[3] ?? 0)))

export type HashLifeStats = {
  nodes: number
  leaves: number
  resultCalls: number
  resultMisses: number
  baseCalls: number
  baseMisses: number
}

export type Universe = {
  readonly root: number
  readonly level: number
  // the Z^4 coordinates of the root's least corner
  readonly origin: readonly number[]
  readonly beat: number
}

// a region of Z^4 (the cube of `side` points from corner `lo`) whose docks hold state(vector); `period`, a
// power of two dividing the side, declares state periodic with that period on every axis, which lets the
// builder share one node for every whole tile
export type Fill = {
  readonly lo: readonly number[]
  readonly side: number
  readonly period?: number
  readonly state: (vector: readonly number[]) => ArrayLike<number>
}

export type HashLife = {
  readonly period: number
  readonly stats: () => HashLifeStats
  // a universe holding these docks (Z^4 vectors with even sum, full 24-slot states) and this fill at beat
  // `beat`, vacuum everywhere else
  readonly universe: (input: { docks?: readonly { vector: readonly number[]; state: ArrayLike<number> }[]; fill?: Fill; beat: number }) => Universe
  // advance by 2^j beats
  readonly advance: (u: Universe, j: number) => Universe
  // every dock that differs from the vacuum, with its Z^4 vector
  readonly differences: (u: Universe) => { vector: number[]; state: Int8Array }[]
  // how many docks differ from the vacuum, counted through shared subtrees once
  readonly differenceCount: (u: Universe) => number
  // the state of one dock (vacuum outside the root)
  readonly stateAt: (u: Universe, vector: readonly number[]) => Int8Array
  // docks in the root (even-sum points)
  readonly rootDocks: (u: Universe) => number
  readonly vacuum: (t: number) => Int8Array
}

export function makeHashLife(input: { forward: (t: number) => Collision; period: number; maxNodes?: number }): HashLife {
  const { forward, period } = input
  const maxNodes = input.maxNodes ?? 1 << 22
  const rules = Array.from({ length: period }, (_, t) => forward(t))

  // the vacuum's dock state at each phase; the period must carry it round exactly
  const vacua: Int8Array[] = [new Int8Array(DEGREE)]

  for (let t = 0; t < period; t++) {
    const next = Int8Array.from(vacua[t] ?? new Int8Array(DEGREE))

    rules[t]?.(next, 0, DEGREE)
    vacua.push(next)
  }

  if (!(vacua[period] ?? new Int8Array(0)).every((x, d) => x === (vacua[0]?.[d] ?? 0))) {
    throw new Error(`hash life: the vacuum does not return in ${period} beats`)
  }

  const vacuum = (t: number): Int8Array => vacua[((t % period) + period) % period] ?? new Int8Array(DEGREE)

  // node store
  let capacity = 1 << 16
  let level = new Uint8Array(capacity)
  let kids = new Int32Array(capacity * 16)
  let codes = new Float64Array(capacity)
  let count = 0
  let indexSize = 1 << 17
  let index = new Int32Array(indexSize).fill(-1)
  const leafIds = new Map<number, number>()
  const stats: HashLifeStats = { nodes: 0, leaves: 0, resultCalls: 0, resultMisses: 0, baseCalls: 0, baseMisses: 0 }

  const allocate = (): number => {
    if (count >= maxNodes) {
      throw new HashLifeOverflow(maxNodes)
    }

    if (count >= capacity) {
      const bigger = capacity * 2

      level = Uint8Array.from({ length: bigger }, (_, i) => level[i] ?? 0)
      const k = new Int32Array(bigger * 16)

      k.set(kids)
      kids = k

      const c = new Float64Array(bigger)

      c.set(codes)
      codes = c
      capacity = bigger
    }

    return count++
  }

  const leaf = (code: number): number => {
    const found = leafIds.get(code)

    if (found !== undefined) {
      return found
    }

    const id = allocate()

    level[id] = 0
    codes[id] = code
    leafIds.set(code, id)
    stats.leaves += 1

    return id
  }

  const hashKids = (k: Int32Array | number[], at: number): number => {
    let h = 0x811c9dc5

    for (let i = 0; i < 16; i++) {
      h = Math.imul(h ^ (k[at + i] ?? 0), 0x01000193)
      h ^= h >>> 13
    }

    return h >>> 0
  }

  const rehash = (): void => {
    indexSize *= 2
    index = new Int32Array(indexSize).fill(-1)

    for (let id = 0; id < count; id++) {
      if (level[id] === 0) {
        continue
      }

      let i = hashKids(kids, id * 16) & (indexSize - 1)

      while ((index[i] ?? -1) !== -1) {
        i = (i + 1) & (indexSize - 1)
      }

      index[i] = id
    }
  }

  // intern the node whose 16 children are these (all of one level)
  const node = (children: number[]): number => {
    let i = hashKids(children, 0) & (indexSize - 1)

    for (;;) {
      const id = index[i] ?? -1

      if (id === -1) {
        break
      }

      let same = true

      for (let c = 0; c < 16 && same; c++) {
        same = kids[id * 16 + c] === children[c]
      }

      if (same) {
        return id
      }

      i = (i + 1) & (indexSize - 1)
    }

    const id = allocate()

    level[id] = (level[children[0] ?? 0] ?? 0) + 1

    for (let c = 0; c < 16; c++) {
      kids[id * 16 + c] = children[c] ?? 0
    }

    index[i] = id
    stats.nodes += 1

    if (stats.nodes * 2 > indexSize) {
      rehash()
    }

    return id
  }

  const NONE = leaf(NONE_CODE)

  // the vacuum node of a level at a phase
  const vacuumNodes = new Map<number, number>()
  const vacuumNode = (k: number, phase: number): number => {
    const key = k * period + phase
    const found = vacuumNodes.get(key)

    if (found !== undefined) {
      return found
    }

    let id: number

    if (k === 0) {
      id = leaf(encodeDock(vacuum(phase)))
    } else if (k === 1) {
      const dock = vacuumNode(0, phase)

      id = node(Array.from({ length: 16 }, (_, c) => ((c & 1) + ((c >> 1) & 1) + ((c >> 2) & 1) + ((c >> 3) & 1)) % 2 === 0 ? dock : NONE))
    } else {
      const child = vacuumNode(k - 1, phase)

      id = node(new Array<number>(16).fill(child))
    }

    vacuumNodes.set(key, id)

    return id
  }

  // the 4^4 grandchildren of a node of level >= 1 (for level 1, its 16 leaves are returned as a 2^4 grid)
  const grandchildren = (id: number): number[] => {
    const grid = new Array<number>(256)

    for (let c = 0; c < 16; c++) {
      const child = kids[id * 16 + c] ?? 0

      for (let g = 0; g < 16; g++) {
        const x = ((c & 1) << 1) | (g & 1)
        const y = (((c >> 1) & 1) << 1) | ((g >> 1) & 1)
        const z = (((c >> 2) & 1) << 1) | ((g >> 2) & 1)
        const w = (((c >> 3) & 1) << 1) | ((g >> 3) & 1)

        grid[x + 4 * (y + 4 * (z + 4 * w))] = kids[child * 16 + g] ?? 0
      }
    }

    return grid
  }

  // the node of the 2^4 grid entries of a grid of side n at a corner
  const scratchKids = new Array<number>(16)
  const fromGrid = (grid: number[], n: number, a: number, b: number, c: number, e: number): number => {
    for (let q = 0; q < 16; q++) {
      scratchKids[q] = grid[a + (q & 1) + n * (b + ((q >> 1) & 1) + n * (c + ((q >> 2) & 1) + n * (e + ((q >> 3) & 1))))] ?? 0
    }

    return node(scratchKids)
  }

  const center = (id: number): number => fromGrid(grandchildren(id), 4, 1, 1, 1, 1)

  // collided dock states, by code and phase
  const collided = new Map<number, Int8Array>()
  const collide = (code: number, phase: number): Int8Array => {
    const key = code * period + phase
    const found = collided.get(key)

    if (found) {
      return found
    }

    const state = decodeDock(code)

    rules[phase]?.(state, 0, DEGREE)

    if (collided.size > 1 << 20) {
      collided.clear()
    }

    collided.set(key, state)

    return state
  }

  const memo = new Map<number, number>()
  const baseMemo = new Map<number, number>()
  const ROOT_OFFSETS = ROOTS.map(r => pointIndex(r, 4))
  const out = new Int8Array(DEGREE)

  // level 2, one beat: the central 2^4 points
  const base = (id: number, phase: number): number => {
    stats.baseCalls += 1

    const key = id * period + phase
    const found = baseMemo.get(key)

    if (found !== undefined) {
      return found
    }

    stats.baseMisses += 1

    const grid = grandchildren(id)
    const states = new Array<Int8Array | undefined>(256)
    const children = new Array<number>(16)

    for (let q = 0; q < 16; q++) {
      const x = 1 + (q & 1)
      const y = 1 + ((q >> 1) & 1)
      const z = 1 + ((q >> 2) & 1)
      const w = 1 + ((q >> 3) & 1)

      if ((x + y + z + w) % 2 !== 0) {
        children[q] = NONE
        continue
      }

      const p = x + 4 * (y + 4 * (z + 4 * w))

      for (let d = 0; d < DEGREE; d++) {
        const source = p - (ROOT_OFFSETS[d] ?? 0)
        let s = states[source]

        if (!s) {
          s = collide(codes[grid[source] ?? 0] ?? 0, phase)
          states[source] = s
        }

        out[d] = s[d] ?? 0
      }

      children[q] = leaf(encodeDock(out))
    }

    const result = node(children)

    baseMemo.set(key, result)

    return result
  }

  // the central half of node `id` (level k >= 2) after 2^j beats from phase `phase`, j <= k - 2
  const result = (id: number, phase: number, j: number): number => {
    const k = level[id] ?? 0

    if (k === 2) {
      return base(id, phase)
    }

    stats.resultCalls += 1

    const key = (id * period + phase) * 32 + j
    const found = memo.get(key)

    if (found !== undefined) {
      return found
    }

    stats.resultMisses += 1

    const full = j === k - 2
    const half = full ? k - 3 : j
    const grid = grandchildren(id)
    const first = new Array<number>(81)

    for (let i = 0; i < 81; i++) {
      const a = i % 3
      const b = Math.floor(i / 3) % 3
      const c = Math.floor(i / 9) % 3
      const e = Math.floor(i / 27)
      const sub = fromGrid(grid, 4, a, b, c, e)

      first[i] = full ? result(sub, phase, k - 3) : center(sub)
    }

    const phase2 = full ? (phase + 2 ** (k - 3)) % period : phase
    const children = new Array<number>(16)

    for (let q = 0; q < 16; q++) {
      const sub = fromGrid(first, 3, q & 1, (q >> 1) & 1, (q >> 2) & 1, (q >> 3) & 1)

      children[q] = result(sub, phase2, half)
    }

    const answer = node(children)

    memo.set(key, answer)

    return answer
  }

  // build a node of level k with corner `origin`: listed docks, else the fill inside its box, else vacuum. A
  // node wholly inside a periodic fill, of a side the period divides, is the same node at every corner
  const build = (k: number, origin: readonly number[], phase: number, docks: Map<string, number>, boxes: readonly number[][], fill: Fill | undefined, tiles: Map<number, number>): number => {
    const side = 2 ** k
    const listed = boxes.some(v => v.every((x, a) => x >= (origin[a] ?? 0) && x < (origin[a] ?? 0) + side))
    const meets = fill !== undefined && origin.every((x, a) => x < (fill.lo[a] ?? 0) + fill.side && x + side > (fill.lo[a] ?? 0))
    const within = fill !== undefined && origin.every((x, a) => x >= (fill.lo[a] ?? 0) && x + side <= (fill.lo[a] ?? 0) + fill.side)
    const tiled = within && !listed && fill?.period !== undefined && side % fill.period === 0 && origin.every((x, a) => (x - (fill.lo[a] ?? 0)) % (fill.period ?? 1) === 0)

    if (!listed && !meets) {
      return vacuumNode(k, phase)
    }

    if (tiled && tiles.has(k)) {
      return tiles.get(k) ?? 0
    }

    let id: number

    if (k === 0) {
      const parity = origin.reduce((s, x) => s + x, 0)

      if (((parity % 2) + 2) % 2 !== 0) {
        return NONE
      }

      const listedCode = docks.get(origin.join(','))

      id = leaf(listedCode ?? (within && fill ? encodeDock(fill.state(origin)) : encodeDock(vacuum(phase))))
    } else {
      const half = side / 2

      id = node(Array.from({ length: 16 }, (_, q) => build(k - 1, origin.map((x, a) => x + ((q >> a) & 1) * half), phase, docks, boxes, fill, tiles)))
    }

    if (tiled) {
      tiles.set(k, id)
    }

    return id
  }

  const universe = (u: { docks?: readonly { vector: readonly number[]; state: ArrayLike<number> }[]; fill?: Fill; beat: number }): Universe => {
    const phase = ((u.beat % period) + period) % period
    const lookup = new Map<string, number>()
    const listed = u.docks ?? []

    for (const d of listed) {
      if (d.vector.reduce((s, x) => s + x, 0) % 2 !== 0) {
        throw new Error('hash life: a dock must have even coordinate sum')
      }

      lookup.set(d.vector.join(','), encodeDock(d.state))
    }

    const vectors = listed.map(d => [...d.vector])
    const corners = u.fill ? [[...u.fill.lo], u.fill.lo.map(x => x + (u.fill?.side ?? 1) - 1)] : []
    const all = [...vectors, ...corners]
    // the root is centred on the lattice origin, corner -2^(k-1) on every axis, so it is aligned with every
    // power of two up to its half side (which a periodic fill's tiles need)
    let k = 3
    const extent = Math.max(0, ...all.flatMap(v => v.map(x => (x < 0 ? -x : x + 1))))

    while (2 ** (k - 1) < extent + 1) {
      k += 1
    }

    const origin = [0, 1, 2, 3].map(() => -(2 ** (k - 1)))

    if (u.fill && (u.fill.side % 2 !== 0 || u.fill.lo.some(x => x % 2 !== 0) || (u.fill.period !== undefined && u.fill.side % u.fill.period !== 0))) {
      throw new Error('hash life: a fill needs an even corner and side, and a period dividing its side')
    }

    return { root: build(k, origin, phase, lookup, vectors, u.fill, new Map()), level: k, origin, beat: u.beat }
  }

  // the bounding box of what differs from the vacuum, in local coordinates, or undefined; memoized by node
  // and phase, so a shared subtree is measured once
  const boundsMemo = new Map<number, { lo: number[]; hi: number[] } | null>()
  const bounds = (id: number, phase: number): { lo: number[]; hi: number[] } | undefined => {
    const key = id * period + phase
    const found = boundsMemo.get(key)

    if (found !== undefined) {
      return found ?? undefined
    }

    const box = measureBounds(id, phase)

    if (boundsMemo.size > 1 << 22) {
      boundsMemo.clear()
    }

    boundsMemo.set(key, box ?? null)

    return box
  }
  const measureBounds = (id: number, phase: number): { lo: number[]; hi: number[] } | undefined => {
    const k = level[id] ?? 0

    if (id === vacuumNode(k, phase)) {
      return undefined
    }

    if (k === 0) {
      return id === NONE ? undefined : { lo: [0, 0, 0, 0], hi: [0, 0, 0, 0] }
    }

    const half = 2 ** (k - 1)
    let box: { lo: number[]; hi: number[] } | undefined

    for (let q = 0; q < 16; q++) {
      const inner = bounds(kids[id * 16 + q] ?? 0, phase)

      if (!inner) {
        continue
      }

      const shift = [0, 1, 2, 3].map(a => ((q >> a) & 1) * half)
      const lo = inner.lo.map((x, a) => x + (shift[a] ?? 0))
      const hi = inner.hi.map((x, a) => x + (shift[a] ?? 0))

      box = box ? { lo: box.lo.map((x, a) => Math.min(x, lo[a] ?? 0)), hi: box.hi.map((x, a) => Math.max(x, hi[a] ?? 0)) } : { lo, hi }
    }

    return box
  }

  // pad with vacuum: the node centred in a node one level up
  const expand = (u: Universe): Universe => {
    const k = u.level
    const phase = ((u.beat % period) + period) % period
    const empty = vacuumNode(k - 1, phase)
    const children: number[] = []

    for (let q = 0; q < 16; q++) {
      const grandkids: number[] = []

      for (let g = 0; g < 16; g++) {
        // block coordinate in the 4^4 grid of level-(k-1) blocks
        const block = [0, 1, 2, 3].map(a => (((q >> a) & 1) << 1) | ((g >> a) & 1))
        const inner = block.every(x => x === 1 || x === 2)

        grandkids.push(inner ? (kids[u.root * 16 + block.reduce((s, x, a) => s + ((x - 1) << a), 0)] ?? 0) : empty)
      }

      children.push(node(grandkids))
    }

    return { root: node(children), level: k + 1, origin: u.origin.map(x => x - 2 ** (k - 1)), beat: u.beat }
  }

  const advance = (start: Universe, j: number): Universe => {
    let u = start
    const phase = ((u.beat % period) + period) % period

    for (;;) {
      const side = 2 ** u.level
      const box = bounds(u.root, phase)
      const margin = 2 ** j
      const fits =
        u.level >= j + 2 &&
        (!box || box.lo.every((x, a) => x >= side / 4 + margin && (box.hi[a] ?? 0) < (3 * side) / 4 - margin))

      if (fits) {
        break
      }

      u = expand(u)
    }

    const next = result(u.root, phase, j)

    return { root: next, level: u.level - 1, origin: u.origin.map(x => x + 2 ** (u.level - 2)), beat: u.beat + 2 ** j }
  }

  const differences = (u: Universe): { vector: number[]; state: Int8Array }[] => {
    const phase = ((u.beat % period) + period) % period
    const found: { vector: number[]; state: Int8Array }[] = []
    const walk = (id: number, origin: number[]): void => {
      const k = level[id] ?? 0

      if (id === vacuumNode(k, phase) || id === NONE) {
        return
      }

      if (k === 0) {
        found.push({ vector: origin, state: decodeDock(codes[id] ?? 0) })

        return
      }

      const half = 2 ** (k - 1)

      for (let q = 0; q < 16; q++) {
        walk(kids[id * 16 + q] ?? 0, origin.map((x, a) => x + ((q >> a) & 1) * half))
      }
    }

    walk(u.root, [...u.origin])

    return found
  }

  // how many docks differ from the vacuum, memoized by node and phase
  const countMemo = new Map<number, number>()
  const countIn = (id: number, phase: number): number => {
    const k = level[id] ?? 0

    if (id === vacuumNode(k, phase) || id === NONE) {
      return 0
    }

    if (k === 0) {
      return 1
    }

    const key = id * period + phase
    const found = countMemo.get(key)

    if (found !== undefined) {
      return found
    }

    let total = 0

    for (let q = 0; q < 16; q++) {
      total += countIn(kids[id * 16 + q] ?? 0, phase)
    }

    countMemo.set(key, total)

    return total
  }

  const stateAt = (u: Universe, vector: readonly number[]): Int8Array => {
    const local = vector.map((x, a) => x - (u.origin[a] ?? 0))
    const side = 2 ** u.level

    if (local.some(x => x < 0 || x >= side)) {
      return Int8Array.from(vacuum(u.beat))
    }

    let id = u.root

    for (let k = u.level; k > 0; k--) {
      const half = 2 ** (k - 1)
      const q = local.reduce((s, x, a) => s + ((Math.floor(x / half) % 2) << a), 0)

      id = kids[id * 16 + q] ?? 0
    }

    return decodeDock(codes[id] ?? 0)
  }

  return {
    period,
    stats: () => ({ ...stats }),
    universe,
    advance,
    differences,
    differenceCount: u => countIn(u.root, ((u.beat % period) + period) % period),
    stateAt,
    rootDocks: u => 2 ** (4 * u.level) / 2,
    vacuum,
  }
}
