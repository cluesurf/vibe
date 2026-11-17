// THE PARITY SECTOR (item vibe-roadmap-grounding-0032, E-SLF-0192). On the line engine every love moves one dock a beat,
// so every pairwise separation keeps its parity and a lock that needs a neighbour (separation 1) never opens on a start
// whose separations are all even (T-0030a). This file holds what the experiment needs to ask the same on the honeycomb:
//
// - `colouring`: a breadth-first 2-colouring of a 24-regular dock table (-1 entries skipped), the count of edges whose
//   ends share a colour (0 exactly when the graph is bipartite), and, when one does, an odd closed walk through the
//   first such edge and the two tree paths back to their meeting dock.
// - `sectorOf`: Q_t, the number of a term's loves on docks of colour t mod 2. A love that moves exactly one dock a beat
//   on a bipartite graph keeps Q_t, and Q_t fixes the parity of every pairwise separation.
// - `branchLock`: E-SLF-0190's lockedMixBranch (test/experiment/selves/locked-mixer.ts) restated here, unchanged, on a
//   neighbour function, so the sparse lock is gated against the branch code without importing an experiment.
// - `branchKeyed` / `sparseKeyed`: a branch-code state and a sparse state as exact reduced amplitudes keyed by their
//   occupied slots and values, and `keyedDiffer`, the entries where two such maps differ (0 when equal).
// - `exactNorm`: the sparse state's summed norm over clock slices, total against unit, by a loop (no spread).
//
// NOTHING MOVES: this file colours tables and reads states.

import { FRAME_SLOTS, loneFrames } from '@/code/rule/coined-locked-knit'
import { cloneConfiguration, times, type Branch } from '@/code/rule/doublet-locked-knit'
import type { Amp, SparseState } from '@/code/measure/cross-ball'

const SLOTS = 24

export type Colouring = {
  col: Uint8Array
  // docks reached from dock 0
  reached: number
  // edges (counted once from each end) whose ends share a colour
  conflicts: number
  // an odd closed walk through the first conflicting edge, as docks (empty when bipartite)
  witness: number[]
}

export function colouring(table: Int32Array, docks: number): Colouring {
  const col = new Uint8Array(docks)
  const parent = new Int32Array(docks).fill(-2)
  const order = new Int32Array(docks)

  parent[0] = -1

  let head = 0
  let tail = 1

  while (head < tail) {
    const x = order[head++]!

    for (let d = 0; d < SLOTS; d++) {
      const y = table[x * SLOTS + d]!

      if (y < 0 || parent[y] !== -2) {
        continue
      }

      parent[y] = x
      col[y] = col[x]! ^ 1
      order[tail++] = y
    }
  }

  let conflicts = 0
  let first: [number, number] | null = null

  for (let i = 0; i < tail; i++) {
    const x = order[i]!

    for (let d = 0; d < SLOTS; d++) {
      const y = table[x * SLOTS + d]!

      if (y >= 0 && col[y] === col[x]) {
        conflicts++
        first ??= [x, y]
      }
    }
  }

  const witness: number[] = []

  if (first) {
    const up = (z: number): number[] => {
      const path = [z]

      while (parent[path[path.length - 1]!]! >= 0) {
        path.push(parent[path[path.length - 1]!]!)
      }

      return path
    }
    const a = up(first[0])
    const b = up(first[1])
    const inB = new Set(b)
    const meet = a.find(z => inB.has(z))!

    witness.push(...a.slice(0, a.indexOf(meet) + 1))
    witness.push(...b.slice(0, b.indexOf(meet)).reverse())
  }

  return { col, reached: tail, conflicts, witness }
}

// Q_t of a term: its loves on docks of colour t mod 2
export function sectorOf(slots: Int32Array, col: Uint8Array, beat: number): number {
  let n = 0

  for (const s of slots) {
    if (col[Math.floor(s / SLOTS)] === beat % 2) {
      n++
    }
  }

  return n
}

// true when some pair of the term's loves sits at an odd dock distance (different colours)
export function hasOddPair(slots: Int32Array, col: Uint8Array): boolean {
  const q = sectorOf(slots, col, 0)

  return q > 0 && q < slots.length
}

// ---- E-SLF-0190's branch lock, unchanged ----

const cloneBranch = (b: Branch): Branch => ({ ...cloneConfiguration(b), a: b.a, b: b.b, k: b.k })

// LF-G on one branch: G on each lone frame of a dock with an occupied facet neighbour (nb(x, d) the neighbour, -1 off
// the ball). Its own inverse
export function branchLock(cells: number, br: Branch, nb: (x: number, d: number) => number): Branch[] {
  const held = new Uint8Array(cells)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24 && !held[x]; d++) {
      if (br.vibe[x * 24 + d] !== 0) {
        held[x] = 1
      }
    }

    for (let s = 0; s < 12 && !held[x]; s++) {
      if (br.store[x * 12 + s] !== 0) {
        held[x] = 1
      }
    }
  }

  const lone = loneFrames(cells, br).filter(f => {
    const x = f.base / 24

    for (let d = 0; d < 24; d++) {
      const y = nb(x, d)

      if (y >= 0 && held[y]) {
        return true
      }
    }

    return false
  })

  if (lone.length === 0) {
    return [br]
  }

  if (lone.length > 4) {
    throw new Error(`parity-sector: ${lone.length} unlocked lone frames in one branch, over the guard 4`)
  }

  const out: Branch[] = []

  for (let code = 0; code < 8 ** lone.length; code++) {
    const b = cloneBranch(br)

    let rest = code

    for (const { base, frame, q } of lone) {
      const o = rest % 8
      const ss = FRAME_SLOTS[frame]!

      rest = (rest - o) / 8

      if (o === 0) {
        times(b, 3n, 0n)
        continue
      }

      const from = base + ss[q]!
      const to = base + ss[q ^ o]!

      b.vibe[to] = b.vibe[from]!
      b.point[to] = b.point[from]!
      b.open[to] = b.open[from]!
      b.vibe[from] = 0
      b.point[from] = 0
      b.open[from] = 0
      times(b, -1n, 0n)
    }

    b.k += 2 * lone.length
    out.push(b)
  }

  return out
}

// ---- exact comparison ----

function reduced(a: bigint, b: bigint, k: number): Amp {
  while (k > 0 && a % 2n === 0n && b % 2n === 0n) {
    a /= 2n
    b /= 2n
    k--
  }

  return { a, b, k }
}

function addReduced(m: Map<string, Amp>, key: string, x: Amp): void {
  const o = m.get(key)

  if (!o) {
    m.set(key, reduced(x.a, x.b, x.k))
    return
  }

  const k = Math.max(o.k, x.k)
  const r = reduced(
    o.a * (1n << BigInt(k - o.k)) + x.a * (1n << BigInt(k - x.k)),
    o.b * (1n << BigInt(k - o.k)) + x.b * (1n << BigInt(k - x.k)),
    k,
  )

  m.set(key, r)
}

const keyOf = (slots: readonly number[], values: readonly number[]): string =>
  slots.map((s, i) => `${s}${values[i]! > 0 ? '+' : '-'}`).join(',')

// a branch-code state keyed by occupied slots and values (no store, every vibe open with point 0, else it throws)
export function branchKeyed(branches: readonly Branch[]): Map<string, Amp> {
  const out = new Map<string, Amp>()

  for (const br of branches) {
    const slots: number[] = []
    const values: number[] = []

    for (let i = 0; i < br.vibe.length; i++) {
      if (br.vibe[i] === 0) {
        continue
      }

      if (br.open[i] !== 1 || br.point[i] !== 0) {
        throw new Error('parity-sector: a closed vibe or a nonzero point in the branch code')
      }

      slots.push(i)
      values.push(br.vibe[i]!)
    }

    if (br.store.some(v => v !== 0)) {
      throw new Error('parity-sector: a store in the branch code')
    }

    addReduced(out, keyOf(slots, values), { a: br.a, b: br.b, k: br.k })
  }

  for (const [key, x] of out) {
    if (x.a === 0n && x.b === 0n) {
      out.delete(key)
    }
  }

  return out
}

// a sparse state keyed the same way (clock slice 0 only, as with the cost off; any other slice throws)
export function sparseKeyed(s: SparseState): Map<string, Amp> {
  const out = new Map<string, Amp>()

  for (const term of s.values()) {
    for (const [e, x] of term.amps) {
      if (e !== 0) {
        throw new Error('parity-sector: a nonzero clock slice with the cost off')
      }

      addReduced(out, keyOf(Array.from(term.slots), Array.from(term.values)), x)
    }
  }

  for (const [key, x] of out) {
    if (x.a === 0n && x.b === 0n) {
      out.delete(key)
    }
  }

  return out
}

export function keyedDiffer(a: Map<string, Amp>, b: Map<string, Amp>): number {
  let n = 0

  for (const key of new Set([...a.keys(), ...b.keys()])) {
    const p = a.get(key)
    const q = b.get(key)

    if (!p || !q || p.a !== q.a || p.b !== q.b || p.k !== q.k) {
      n++
    }
  }

  return n
}

// the exact summed norm of a sparse state over clock slices: sum N(a + b w) 4^(K - k) against 4^K
export function exactNorm(s: SparseState): { total: bigint; unit: bigint } {
  let K = 0

  for (const term of s.values()) {
    for (const x of term.amps.values()) {
      K = Math.max(K, x.k)
    }
  }

  let total = 0n

  for (const term of s.values()) {
    for (const x of term.amps.values()) {
      total += (x.a * x.a - x.a * x.b + x.b * x.b) * (1n << BigInt(2 * (K - x.k)))
    }
  }

  return { total, unit: 1n << BigInt(2 * K) }
}
