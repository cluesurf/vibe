// Walls measured against the vacuum's OWN ideal (E-RLT-0090). MEASUREMENT: every count here is an exact integer,
// every comparison an exact comparison of trits.
//
// THE DECISION (user, 2026-09-26). The old wall gate (E-FRC-0159's battery, E-RLT-0082, E-RLT-0087) compared a
// half-late vacuum with the uniform one and asked for whole sheets of side^3 docks. That ideal is a UNIFORM vacuum's.
// A vacuum with built-in dock-to-dock structure (the oriented hub vacuum, period 4 D4) differs from its own late phase
// on some docks and not others, so the old ideal cannot be met by any rule on it (E-RLT-0087). The new rule: compute
// the ideal wall pattern FOR THIS VACUUM, from its own symmetry, and measure how far the actual pattern departs from it.
//
// THE CLOSED RULE, stated before any run.
//
//  1. THE SYMMETRY OF THE RULE. Gamma = (W(F4) about a dock) x (the translations of the box) x (charge conjugation C)
//     x (time shifts by the schedule's period, 2 beats). Every element carries a history of the rule to a history of
//     the rule (the knit is covariant under W(F4), the translations and C, and its schedule repeats every 2 beats).
//     On trits it acts by: a vibe on slot d of dock x goes to slot p_g(d) of dock g x + t, times c; a store tau on
//     line l of dock x goes to line l_g(l) of dock g x + t, times c times the side sign s_g(l); the history is read
//     s beats later.
//  2. THE GROUND MANIFOLD. M = Gamma V, the orbit of the vacuum's trit history V (and, where a gate plants a second
//     vacuum, Gamma U for that one too, reported as in or out of Gamma V). Its elements are the vacuum's GROUND
//     STATES. M is a finite set of cosets Gamma / Sigma, Sigma the stabilizer of V (its space group, with C and time).
//     For the hub vacuum Sigma holds the 4 D4 translations, so every ground state is fixed by its restriction to the
//     side-4 period cell, and M is computed there exactly (256 docks, one period of beats).
//  3. THE LOCAL READING. A dock's HISTORY is its 24 vibes and 12 stores over one aligned window of W beats (W a
//     multiple of every vacuum period, windows starting at beats that are multiples of W). S(x) is the set of ground
//     states whose history at x equals the run's, exactly.
//  4. DEFECTS AND WALLS. A dock with S(x) empty is a DEFECT (no ground state looks like it). An edge x, x + r (one
//     per line: 12 per dock) is a WALL when S(x) and S(y) are both non-empty and share no ground state: no single
//     ground state explains both ends. A difference that a symmetry of the vacuum explains is never a wall, because
//     one ground state then explains both ends. So the vacuum alone reads 0 defects and 0 walls BY CONSTRUCTION, on
//     any vacuum, uniform or not (gate (a)).
//  5. THE IDEAL. A domain assignment D (dock -> ground state) defines the IDEAL history: every dock holds its own
//     ground state's history. The ideal wall set is the reading of that history (4.) and is computed from structure
//     alone, never from the run it grades. The ideal holds 0 defects by construction.
//  6. THE DEPARTURE. Of a run from the same assignment: the docks x with D(x) not in S(x) (the dock left its own
//     ground state; defects included), and the symmetric difference between the run's wall edges and the ideal's.
//     Denominators: the docks, and 12 edges per dock.
//  7. THE OLD UNIFORM READING, beside it: a uniform vacuum's ideal says every dock looks alike, so every edge whose two
//     docks differ in history is a wall (reported as uniformWalls); and E-RLT-0087's trit difference against the
//     uniformly born vacuum (whole sheets or not).
//
// NO RULE CODE HERE: the runs use code/measure/bounce-pair-kernel unchanged. The start family is E-MTH-0028's.

import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { boxCellMapDoubled, d4BoxCell, d4BoxCoordinates } from '@/code/substrate/d4-box'
import { type CoinData } from '@/code/measure/varying-vacuum'
import { type Reduced } from '@/code/measure/living-pair-kernel'

// ---- histories and dock types ----

// the trits of one beat: vibes (cells x 24) and stores (cells x 12)
export type Frame = { readonly vibe: Int8Array; readonly store: Int8Array }

export const frameOf = (s: Reduced): Frame => ({ vibe: Int8Array.from(s.vibe), store: Int8Array.from(s.store) })

// A dock history is W beats of 36 trits. Its exact key: per beat two base-3 integers of 18 trits each.
export class TypeBook {
  readonly window: number
  private readonly index = new Map<string, number>()
  readonly contents: Int8Array[] = []

  constructor(window: number) {
    this.window = window
  }

  get size(): number {
    return this.contents.length
  }

  // content: W x 36 trits (beat-major, vibes 0..23 then stores 0..11)
  intern(content: Int8Array): number {
    const parts: number[] = []

    for (let b = 0; b < this.window; b++) {
      let a = 0
      let c = 0

      for (let i = 0; i < 18; i++) a = a * 3 + ((content[b * 36 + i] as number) + 1)
      for (let i = 18; i < 36; i++) c = c * 3 + ((content[b * 36 + i] as number) + 1)

      parts.push(a, c)
    }

    const key = parts.join(',')
    const known = this.index.get(key)

    if (known !== undefined) return known

    this.index.set(key, this.contents.length)
    this.contents.push(Int8Array.from(content))

    return this.contents.length - 1
  }

  // the type of a content if already known, else -1 (never adds)
  lookup(content: Int8Array): number {
    const parts: number[] = []

    for (let b = 0; b < this.window; b++) {
      let a = 0
      let c = 0

      for (let i = 0; i < 18; i++) a = a * 3 + ((content[b * 36 + i] as number) + 1)
      for (let i = 18; i < 36; i++) c = c * 3 + ((content[b * 36 + i] as number) + 1)

      parts.push(a, c)
    }

    return this.index.get(parts.join(',')) ?? -1
  }
}

const SCRATCH = new Int8Array(36 * 64)

// the type of every dock of a window of frames (frames[0..W-1]); unknown histories get -1 when `add` is false
export function dockTypes(book: TypeBook, frames: readonly Frame[], cells: number, add: boolean): Int32Array {
  const w = book.window
  const out = new Int32Array(cells)
  const content = w * 36 <= SCRATCH.length ? SCRATCH.subarray(0, w * 36) : new Int8Array(w * 36)

  for (let x = 0; x < cells; x++) {
    for (let b = 0; b < w; b++) {
      const f = frames[b] as Frame

      for (let d = 0; d < 24; d++) content[b * 36 + d] = f.vibe[x * 24 + d] as number
      for (let l = 0; l < 12; l++) content[b * 36 + 24 + l] = f.store[x * 12 + l] as number
    }

    out[x] = add ? book.intern(content) : book.lookup(content)
  }

  return out
}

// ---- the side-4 period cell ----

export type Cell4 = {
  readonly coords: readonly (readonly number[])[]
  // sub[a * 256 + b]: the cell of coords(a) - coords(b) mod 4
  readonly sub: Int32Array
  // per W(F4) element, its dock map on the cell (linear, about the origin)
  readonly linear: readonly Int32Array[]
}

export function cell4(coins: CoinData): Cell4 {
  const coords = Array.from({ length: 256 }, (_, x) => d4BoxCoordinates({ cell: x, side: 4 }))
  const sub = new Int32Array(256 * 256)

  for (let a = 0; a < 256; a++) {
    for (let b = 0; b < 256; b++) sub[a * 256 + b] = d4BoxCell({ coordinates: (coords[a] as number[]).map((v, k) => v - ((coords[b] as number[])[k] as number)), side: 4 })
  }

  const linear = coins.doubled.map((m, g) => {
    const map = boxCellMapDoubled({ doubled: m as number[][], side: 4 })

    if (!map) throw new Error(`element ${g} does not act on the side-4 cell`)

    return Int32Array.from(map)
  })

  return { coords, sub, linear }
}

// the cell (mod 4 D4) of every dock of a side-L box, L divisible by 4
export function cellOfDocks(side: number): Int32Array {
  if (side % 4 !== 0) throw new Error('the side must be divisible by 4')

  return Int32Array.from({ length: side ** 4 }, (_, x) => d4BoxCell({ coordinates: d4BoxCoordinates({ cell: x, side }), side: 4 }))
}

// is a history on the side-L box periodic under 4 D4, and its restriction to the cell (docks of the cell = the docks
// of the box with coordinates 0..3)
export function restrictToCell(frames: readonly Frame[], side: number): { periodic: boolean; mismatches: number; frames: Frame[] } {
  const cells = side ** 4
  const cellOf = cellOfDocks(side)
  const rep = new Int32Array(256).fill(-1)

  for (let x = 0; x < cells; x++) if ((rep[cellOf[x] as number] as number) < 0) rep[cellOf[x] as number] = x

  let mismatches = 0
  const out: Frame[] = []

  for (const f of frames) {
    const vibe = new Int8Array(256 * 24)
    const store = new Int8Array(256 * 12)

    for (let c = 0; c < 256; c++) {
      const x = rep[c] as number

      vibe.set(f.vibe.subarray(x * 24, x * 24 + 24), c * 24)
      store.set(f.store.subarray(x * 12, x * 12 + 12), c * 12)
    }

    for (let x = 0; x < cells; x++) {
      const c = cellOf[x] as number
      let differs = false

      for (let d = 0; d < 24 && !differs; d++) differs = f.vibe[x * 24 + d] !== vibe[c * 24 + d]
      for (let l = 0; l < 12 && !differs; l++) differs = f.store[x * 12 + l] !== store[c * 12 + l]

      mismatches += differs ? 1 : 0
    }

    out.push({ vibe, store })
  }

  return { periodic: mismatches === 0, mismatches, frames: out }
}

// ---- the group action on dock types ----

export type PointElement = { readonly g: number; readonly c: number; readonly s: number }

// the image of a type's content under (g, c) read s beats later
export function transformContent(coins: CoinData, content: Int8Array, window: number, e: PointElement): Int8Array {
  const out = new Int8Array(window * 36)
  const p = coins.table.permutations[e.g] as readonly number[]
  const li = coins.lineImage[e.g] as Int8Array
  const ls = coins.lineSign[e.g] as Int8Array

  for (let b = 0; b < window; b++) {
    const src = ((b + e.s) % window) * 36

    for (let d = 0; d < 24; d++) out[b * 36 + (p[d] as number)] = e.c * (content[src + d] as number)
    for (let l = 0; l < 12; l++) out[b * 36 + 24 + (li[l] as number)] = e.c * (ls[l] as number) * (content[src + 24 + l] as number)
  }

  return out
}

// the image of a cell type array (256 docks) under a point element (about the origin)
export function imageTypes(coins: CoinData, cell: Cell4, book: TypeBook, types: Int32Array, e: PointElement, cache: Map<string, number>): Int32Array {
  const lin = cell.linear[e.g] as Int32Array
  const out = new Int32Array(256)

  for (let y = 0; y < 256; y++) {
    const k = types[y] as number
    const key = `${k}:${e.g}:${e.c}:${e.s}`
    let img = cache.get(key)

    if (img === undefined) {
      img = book.intern(transformContent(coins, book.contents[k] as Int8Array, book.window, e))
      cache.set(key, img)
    }

    out[lin[y] as number] = img
  }

  return out
}

// the translations tau (cells) with tau . a = b, i.e. a[z - tau] = b[z] for every z
export function translationsBetween(cell: Cell4, a: Int32Array, b: Int32Array): number[] {
  const out: number[] = []

  for (let tau = 0; tau < 256; tau++) {
    let ok = true

    for (let z = 0; z < 256 && ok; z++) ok = a[cell.sub[z * 256 + tau] as number] === b[z]

    if (ok) out.push(tau)
  }

  return out
}

// ---- the ground manifold ----

export type GroundRep = {
  readonly base: number
  readonly element: PointElement
  readonly types: Int32Array
  // translations fixing it
  readonly stabilizer: number[]
  // canonical translation class of every tau (least member of tau + stabilizer)
  readonly canon: Int32Array
}

export type GroundManifold = {
  readonly book: TypeBook
  readonly cell: Cell4
  readonly reps: GroundRep[]
  // ground states: sum over reps of 256 / |stabilizer|
  readonly states: number
  // per base: how many point elements carry it to itself up to a translation (|Sigma| over the translations kept)
  readonly pointStabilizer: number[]
  // per base: the rep it belongs to and the translation that carries that rep to it
  readonly baseRep: { rep: number; tau: number }[]
  readonly shifts: number[]
  readonly pointElements: number
  // occurrences: per type, the (rep, cell dock) pairs holding it
  readonly occurrences: Map<number, number[]>
}

// Gamma's point part: every W(F4) element, both signs of C, and the time shifts allowed (multiples of 2 mod W)
export function groundManifold(coins: CoinData, cell: Cell4, book: TypeBook, bases: readonly Int32Array[], shifts: readonly number[]): GroundManifold {
  const reps: GroundRep[] = []
  const cache = new Map<string, number>()
  const pointStabilizer: number[] = []
  const baseRep: { rep: number; tau: number }[] = []
  const n = coins.table.permutations.length
  const known = (img: Int32Array): { rep: number; tau: number } | undefined => {
    for (let r = 0; r < reps.length; r++) {
      const t = translationsBetween(cell, (reps[r] as GroundRep).types, img)

      if (t.length > 0) return { rep: r, tau: t[0] as number }
    }

    return undefined
  }

  bases.forEach((base, bi) => {
    let stab = 0
    const found = known(base)

    if (!found) {
      const stabilizer = translationsBetween(cell, base, base)

      reps.push({ base: bi, element: { g: coins.table.identity, c: 1, s: 0 }, types: base, stabilizer, canon: canonOf(cell, stabilizer) })
      baseRep.push({ rep: reps.length - 1, tau: 0 })
    } else baseRep.push(found)

    for (let g = 0; g < n; g++) {
      for (const c of [1, -1]) {
        for (const s of shifts) {
          const e = { g, c, s }
          const img = imageTypes(coins, cell, book, base, e, cache)

          if (translationsBetween(cell, img, base).length > 0) stab++

          if (known(img)) continue

          const stabilizer = translationsBetween(cell, img, img)

          reps.push({ base: bi, element: e, types: img, stabilizer, canon: canonOf(cell, stabilizer) })
        }
      }
    }

    pointStabilizer.push(stab)
  })

  const occurrences = new Map<number, number[]>()

  reps.forEach((r, j) => {
    for (let y = 0; y < 256; y++) {
      const k = r.types[y] as number
      const list = occurrences.get(k) ?? []

      list.push(j, y)
      occurrences.set(k, list)
    }
  })

  return {
    book,
    cell,
    reps,
    states: reps.reduce((s, r) => s + 256 / r.stabilizer.length, 0),
    pointStabilizer,
    baseRep,
    shifts: [...shifts],
    pointElements: n * 2 * shifts.length,
    occurrences,
  }
}

function canonOf(cell: Cell4, stabilizer: readonly number[]): Int32Array {
  const canon = new Int32Array(256)

  for (let tau = 0; tau < 256; tau++) {
    let least = 256

    // tau + u = tau - (-u); sub[tau][neg u]
    for (const u of stabilizer) least = Math.min(least, cell.sub[tau * 256 + (cell.sub[0 * 256 + u] as number)] as number)

    canon[tau] = least
  }

  return canon
}

// the id of the ground state (rep j, translation tau)
export const stateId = (m: GroundManifold, j: number, tau: number): number => j * 256 + ((m.reps[j] as GroundRep).canon[tau] as number)

// ---- the local reading ----

export type Reading = {
  readonly defects: number
  readonly walls: number
  readonly uniformWalls: number
  // per dock: is its assigned ground state among S(x) (1), not (0); only when an assignment is given
  readonly holds?: Uint8Array
  readonly wallEdges: Uint8Array
  readonly uniformEdges: Uint8Array
  readonly empty: Uint8Array
}

export type BoxGeometry = { readonly side: number; readonly cells: number; readonly cellOf: Int32Array; readonly neighbour: Int32Array }

// neighbour[x * 12 + l]: the dock one root along line l's first slot
export function boxGeometry(side: number, target: Int32Array): BoxGeometry {
  const cells = side ** 4
  const neighbour = new Int32Array(cells * 12)

  for (let x = 0; x < cells; x++) for (let l = 0; l < 12; l++) neighbour[x * 12 + l] = Math.floor((target[x * 24 + (LINE_FIRSTS[l] as number)] as number) / 24)

  return { side, cells, cellOf: cellOfDocks(side), neighbour }
}

// S(x) as bitsets, then defects and walls; `assigned` (per dock a ground state id) adds the holds mask
export function readWindow(m: GroundManifold, box: BoxGeometry, types: Int32Array, assigned?: Int32Array): Reading {
  const bits = m.reps.length * 256
  const words = Math.ceil(bits / 32)
  const sets = new Uint32Array(box.cells * words)
  const empty = new Uint8Array(box.cells)
  const holds = assigned ? new Uint8Array(box.cells) : undefined
  let defects = 0

  for (let x = 0; x < box.cells; x++) {
    const occ = m.occurrences.get(types[x] as number)

    if (!occ || (types[x] as number) < 0) {
      empty[x] = 1
      defects++
      continue
    }

    const cx = box.cellOf[x] as number

    for (let i = 0; i < occ.length; i += 2) {
      const j = occ[i] as number
      const y = occ[i + 1] as number
      // rep j translated by tau holds x's history when rep j at x - tau does: tau = cx - y
      const id = stateId(m, j, m.cell.sub[cx * 256 + y] as number)

      sets[x * words + (id >>> 5)] = (sets[x * words + (id >>> 5)] as number) | (1 << (id & 31))
    }
  }

  if (holds && assigned) {
    for (let x = 0; x < box.cells; x++) {
      const id = assigned[x] as number

      holds[x] = ((sets[x * words + (id >>> 5)] as number) >>> (id & 31)) & 1
    }
  }

  const wallEdges = new Uint8Array(box.cells * 12)
  const uniformEdges = new Uint8Array(box.cells * 12)
  let walls = 0
  let uniformWalls = 0

  for (let x = 0; x < box.cells; x++) {
    for (let l = 0; l < 12; l++) {
      const y = box.neighbour[x * 12 + l] as number

      if (types[x] !== types[y] || types[x] === -1) {
        uniformEdges[x * 12 + l] = 1
        uniformWalls++
      }

      if (empty[x] === 1 || empty[y] === 1) continue

      let shared = false

      for (let w = 0; w < words && !shared; w++) shared = ((sets[x * words + w] as number) & (sets[y * words + w] as number)) !== 0

      if (!shared) {
        wallEdges[x * 12 + l] = 1
        walls++
      }
    }
  }

  return { defects, walls, uniformWalls, holds, wallEdges, uniformEdges, empty }
}

// the ideal history's dock types for an assignment (ground state (rep, tau) per dock): type of rep at x - tau
export function idealTypes(m: GroundManifold, box: BoxGeometry, rep: Int32Array, tau: Int32Array): Int32Array {
  return Int32Array.from({ length: box.cells }, (_, x) => (m.reps[rep[x] as number] as GroundRep).types[m.cell.sub[(box.cellOf[x] as number) * 256 + (tau[x] as number)] as number] as number)
}

// The known wall, by an independent path: for every edge, is there a ground state (every rep, every one of the 256
// translations, no bitsets and no canonical classes) whose history matches both ends
export function bruteForceWalls(m: GroundManifold, box: BoxGeometry, types: Int32Array): { walls: number; defects: number; edges: Uint8Array } {
  const edges = new Uint8Array(box.cells * 12)
  const matches = (j: number, tau: number, x: number): boolean => (m.reps[j] as GroundRep).types[m.cell.sub[(box.cellOf[x] as number) * 256 + tau] as number] === types[x]
  let walls = 0
  let defects = 0
  const explained = new Uint8Array(box.cells)

  for (let x = 0; x < box.cells; x++) {
    for (let j = 0; j < m.reps.length && explained[x] === 0; j++) for (let tau = 0; tau < 256 && explained[x] === 0; tau++) if (matches(j, tau, x)) explained[x] = 1

    defects += explained[x] === 1 ? 0 : 1
  }

  for (let x = 0; x < box.cells; x++) {
    for (let l = 0; l < 12; l++) {
      const y = box.neighbour[x * 12 + l] as number

      if (explained[x] === 0 || explained[y] === 0) continue

      let common = false

      for (let j = 0; j < m.reps.length && !common; j++) for (let tau = 0; tau < 256 && !common; tau++) common = matches(j, tau, x) && matches(j, tau, y)

      if (!common) {
        edges[x * 12 + l] = 1
        walls++
      }
    }
  }

  return { walls, defects, edges }
}

// the symmetric difference of two edge sets
export function edgeDifference(a: Uint8Array, b: Uint8Array): number {
  let n = 0

  for (let i = 0; i < a.length; i++) n += a[i] !== b[i] ? 1 : 0

  return n
}

// graph distance (in roots) from every dock to the nearest dock of another domain (1 for a dock with a neighbor in
// another domain); domains given per dock as integers
export function distanceToInterface(box: BoxGeometry, domain: Int32Array): Int32Array {
  const dist = new Int32Array(box.cells).fill(-1)
  let frontier: number[] = []

  // an edge between two domains puts both its ends at distance 1 (the edges are stored forward, one per line)
  for (let x = 0; x < box.cells; x++) {
    for (let l = 0; l < 12; l++) {
      const y = box.neighbour[x * 12 + l] as number

      if (domain[y] !== domain[x]) {
        dist[x] = 1
        dist[y] = 1
      }
    }
  }

  for (let x = 0; x < box.cells; x++) if (dist[x] === 1) frontier.push(x)

  let d = 1

  while (frontier.length > 0) {
    const next: number[] = []

    for (const x of frontier) {
      for (let l = 0; l < 12; l++) {
        const y = box.neighbour[x * 12 + l] as number

        if (dist[y] === -1) {
          dist[y] = d + 1
          next.push(y)
        }
      }
    }

    // backward edges: scan all docks whose forward neighbor is in the frontier (rare enough to scan once per level)
    const inFrontier = new Uint8Array(box.cells)

    for (const x of frontier) inFrontier[x] = 1

    for (let z = 0; z < box.cells; z++) {
      if (dist[z] !== -1) continue

      for (let l = 0; l < 12; l++) {
        if (inFrontier[box.neighbour[z * 12 + l] as number] === 1) {
          dist[z] = d + 1
          next.push(z)
          break
        }
      }
    }

    frontier = next
    d++
  }

  return dist
}

// ---- stores on the side-L box under a Gamma element ----

// the image of a store (cells x 12) under (g, c) about the origin followed by the translation t (basis coordinates)
export function storeImage(coins: CoinData, side: number, store: Int8Array, g: number, c: number, t: readonly number[]): Int8Array {
  const cells = side ** 4
  const map = boxCellMapDoubled({ doubled: coins.doubled[g] as number[][], side })

  if (!map) throw new Error(`element ${g} does not act on the side-${side} box`)

  const li = coins.lineImage[g] as Int8Array
  const ls = coins.lineSign[g] as Int8Array
  const out = new Int8Array(cells * 12)

  for (let x = 0; x < cells; x++) {
    const gx = d4BoxCoordinates({ cell: map[x] as number, side })
    const y = d4BoxCell({ coordinates: gx.map((v, k) => v + (t[k] as number)), side })

    for (let l = 0; l < 12; l++) {
      const v = store[x * 12 + l] as number

      if (v !== 0) out[y * 12 + (li[l] as number)] = c * (ls[l] as number) * v
    }
  }

  return out
}

// the image of a frame under (g, c) about the origin then t
export function frameImage(coins: CoinData, side: number, f: Frame, g: number, c: number, t: readonly number[]): Frame {
  const cells = side ** 4
  const map = boxCellMapDoubled({ doubled: coins.doubled[g] as number[][], side })

  if (!map) throw new Error(`element ${g} does not act on the side-${side} box`)

  const p = coins.table.permutations[g] as readonly number[]
  const vibe = new Int8Array(cells * 24)

  for (let x = 0; x < cells; x++) {
    const gx = d4BoxCoordinates({ cell: map[x] as number, side })
    const y = d4BoxCell({ coordinates: gx.map((v, k) => v + (t[k] as number)), side })

    for (let d = 0; d < 24; d++) vibe[y * 24 + (p[d] as number)] = c * (f.vibe[x * 24 + d] as number)
  }

  return { vibe, store: storeImage(coins, side, f.store, g, c, t) }
}

// ---- one run graded against its ideal ----

export type CaseReading = {
  readonly windows: number
  readonly idealWalls: number
  readonly idealUniformWalls: number
  readonly bulkDocks: number
  // per settled window
  readonly departureDocks: number[]
  readonly edgeDifference: number[]
  readonly actualWalls: number[]
  readonly defects: number[]
  readonly uniformWalls: number[]
  readonly bulkDeparture: number[]
  // the largest distance (in roots) from the interface of a departure dock, over every window (0 if none)
  readonly farthest: number
  // E-RLT-0087's reading, when a reference run is given: the trits where the run differs from it, per settled beat
  readonly oldTrits: number[]
}

type Runner = { state: () => Reduced; beat: () => void; time: () => number }

// Run `run` to beat `to` - 1, reading every aligned window of W beats from `from` (a multiple of W) against the ideal
// of the assignment (rep, tau per dock). `reference`, run in step, gives the old trit difference.
export function readCase(input: { m: GroundManifold; box: BoxGeometry; run: Runner; rep: Int32Array; tau: Int32Array; from: number; to: number; reference?: Runner; bulkFrom?: number }): CaseReading {
  const { m, box, run, rep, tau, from, to } = input
  const W = m.book.window
  const assigned = Int32Array.from({ length: box.cells }, (_, x) => stateId(m, rep[x] as number, tau[x] as number))
  const ideal = readWindow(m, box, idealTypes(m, box, rep, tau), assigned)
  const dist = distanceToInterface(box, assigned)
  const bulkFrom = input.bulkFrom ?? 3
  let bulkDocks = 0

  for (let x = 0; x < box.cells; x++) bulkDocks += (dist[x] as number) === -1 || (dist[x] as number) >= bulkFrom ? 1 : 0

  const out = { departureDocks: [] as number[], edgeDifference: [] as number[], actualWalls: [] as number[], defects: [] as number[], uniformWalls: [] as number[], bulkDeparture: [] as number[], oldTrits: [] as number[] }
  let farthest = 0
  let window: Frame[] = []

  if (from % W !== 0) throw new Error('windows must start at a multiple of W')

  while (run.time() < to) {
    const t = run.time()

    if (t >= from) {
      window.push(frameOf(run.state()))

      if (input.reference) {
        let n = 0
        const a = run.state()
        const b = input.reference.state()

        for (let i = 0; i < a.vibe.length; i++) n += a.vibe[i] !== b.vibe[i] ? 1 : 0
        for (let i = 0; i < a.store.length; i++) n += a.store[i] !== b.store[i] ? 1 : 0

        out.oldTrits.push(n)
      }

      if (window.length === W) {
        const r = readWindow(m, box, dockTypes(m.book, window, box.cells, false), assigned)
        let dep = 0
        let bulk = 0

        for (let x = 0; x < box.cells; x++) {
          if ((r.holds as Uint8Array)[x] === 1) continue

          dep++

          const d = dist[x] as number

          if (d === -1 || d >= bulkFrom) bulk++
          farthest = Math.max(farthest, d === -1 ? Infinity : d)
        }

        out.departureDocks.push(dep)
        out.edgeDifference.push(edgeDifference(r.wallEdges, ideal.wallEdges))
        out.actualWalls.push(r.walls)
        out.defects.push(r.defects)
        out.uniformWalls.push(r.uniformWalls)
        out.bulkDeparture.push(bulk)
        window = []
      }
    }

    run.beat()
    input.reference?.beat()
  }

  return { windows: out.departureDocks.length, idealWalls: ideal.walls, idealUniformWalls: ideal.uniformWalls, bulkDocks, farthest, ...out }
}
