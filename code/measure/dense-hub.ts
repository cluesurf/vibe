// The coset-union hub vacuum (E-RLT-0093 to E-RLT-0095). MEASUREMENT and a vacuum STATE: no rule code is changed.
//
// THE COUNT. The hub pattern (code/measure/varying-vacuum, fact 4) stores on the 16 classes of D4 / 2 D4 as follows:
// the class 0 of the hub holds nothing and receives every vacuum vibe at beat 1; the 12 root classes r + 2 D4 each
// store the line of r; the 3 classes of norm 4 (2 e1, (1,1,1,1) and (1,1,1,-1) in standard coordinates, the three
// nonzero classes of L' / 2 D4, where L' = { v in D4 : all coordinates of one parity } is the sublattice of index 4)
// hold nothing and receive nothing. A vacuum unit at dock h + r streams its two vibes to h + r - r and h + r + r, both
// in the class of h, so the vibes of a 2-beat pair exchange visit exactly the classes {0} and the 12 root classes: 13
// of 16. The three norm-4 classes are 3 / 16 of the bulk, 768 of 4,096 docks on the side-8 box, and they are the
// only docks over the husk columns whose three husk coordinates are all odd (64 of 512): the 64 empty columns.
//
// WHY THEY ARE EMPTY, AND WHY THEY ARE HUBS. D4 / L' = Z2 x Z2 has four cosets: L' itself (the hub class and the
// three norm-4 classes) and the three triality frames F1, F2, F3 of D4 (each 4 mutually orthogonal lines: e.g.
// +-e1 +- e2, +-e3 +- e4). W(F4) about a hub fixes class 0 and permutes the three norm-4 classes transitively (the
// triality quotient S3), so a W(F4)-invariant pattern populates all three or none. Each norm-4 class c is the class
// 0 of the hub pattern TRANSLATED by c. The union over the four translates by L' / 2 D4 stores, on a dock of root
// class rho, the lines of rho - c for c in L' / 2 D4: four distinct lines, exactly the four lines of rho's frame. So
// the four translates never store the same unit twice, and every dock of L' is a hub.
//
// THE ORIENTATION. Translate k carries the hub vacuum's orientation translated by c_k. An element g of the hub's
// 576-element point group (about hub 0, no charge conjugation) keeps the hub orientation o, so it carries translate
// c's orientation T_c o to T_(g c) g o = T_(g c) o: the union is kept by the same 576 linear parts (with translations
// of period 4 D4). The forcing theorems that make the hub vacuum's husk transport isotropic apply unchanged.
//
// NOTHING MOVES: this file builds stores and reads classes; the stream copies values one dock along.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { makeColorWeave } from '@/code/rule/color-weave'
import { separatedLayout } from '@/code/rule/living-pair-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { makeBounceKernel, type BounceKernel } from '@/code/measure/bounce-pair-kernel'
import { bounceLawMatrices } from '@/code/measure/bounce-transport'
import { binaryTetrahedralIndices, boxMaps, coinData, orientedHubStore, pointGenerator, type AffineGenerator, type CoinData } from '@/code/measure/varying-vacuum'
import { closure, groupTable } from '@/code/measure/color-isotropy-bound'
import { d4BoxCell, d4BoxCoordinates, d4Coordinates } from '@/code/substrate/d4-box'
import { type Mesh } from '@/code/tool/mesh'

// the three norm-4 class representatives, standard coordinates (each in D4: even coordinate sum)
export const NORM4: readonly (readonly number[])[] = [
  [2, 0, 0, 0],
  [1, 1, 1, 1],
  [1, 1, 1, -1],
]

// L' / 2 D4 in basis coordinates: the hub class and the three norm-4 classes
export const HUB_SHIFTS: readonly (readonly number[])[] = [[0, 0, 0, 0], ...NORM4.map(v => d4Coordinates([...v]))]

let COINS: CoinData | undefined

export const coinsOnce = (): CoinData => (COINS ??= coinData(groupTable()))

// the hub of E-RLT-0082 to 0092 for the anchor dock 0: the dock at basis coordinates (anchor) - r0
export function baseHub(side: number, anchor = 0): number[] {
  const r0 = d4Coordinates(rootsD4()[LINE_FIRSTS[0] as number] as number[])

  return d4BoxCoordinates({ cell: anchor, side }).map((v, k) => v - (r0[k] as number))
}

// the union of the hub store translated by the given shifts (basis coordinates); throws on a doubly stored unit
export function unionHubStore(coins: CoinData, side: number, hub: readonly number[], shifts: readonly (readonly number[])[] = HUB_SHIFTS): Int8Array {
  const out = new Int8Array(side ** 4 * 12)

  for (const c of shifts) {
    const s = orientedHubStore(
      coins,
      side,
      hub.map((v, k) => v + (c[k] as number)),
    )

    for (let i = 0; i < s.length; i++) {
      if (s[i] === 0) continue
      if (out[i] !== 0) throw new Error(`unit ${i} stored by two translates`)

      out[i] = s[i] as number
    }
  }

  return out
}

// the class of a dock mod 2 D4 relative to the hub, as an index 0..15 (the four basis coordinates mod 2)
export function classOf(x: number, side: number, hub: readonly number[]): number {
  const c = d4BoxCoordinates({ cell: x, side })

  return c.reduce((s, v, k) => s + (((((v - (hub[k] as number)) % 2) + 2) % 2) << k), 0)
}

const FIRST_ROOT = rootsD4().map(r => d4Coordinates(r))

// the class (relative to the hub) of the two docks a unit (dock x, line l) streams its pair to: x -+ r_l
export function unitHubClass(x: number, l: number, side: number, hub: readonly number[]): number {
  const c = d4BoxCoordinates({ cell: x, side })
  const r = FIRST_ROOT[LINE_FIRSTS[l] as number] as number[]

  return c.reduce((s, v, k) => s + (((((v - (hub[k] as number) - (r[k] as number)) % 2) + 2) % 2) << k), 0)
}

// a store split into its parts by the hub class each unit streams to, in the order of HUB_SHIFTS
export function splitByHubClass(store: Int8Array, side: number, hub: readonly number[]): Int8Array[] {
  const keys = HUB_SHIFTS.map(c => c.reduce((s, v, k) => s + ((((v % 2) + 2) % 2) << k), 0))
  const parts = keys.map(() => new Int8Array(store.length))

  for (let i = 0; i < store.length; i++) {
    if (store[i] === 0) continue

    const k = keys.indexOf(unitHubClass(Math.floor(i / 12), i % 12, side, hub))

    if (k < 0) throw new Error('a unit streams to a root class')

    ;(parts[k] as Int8Array)[i] = store[i] as number
  }

  return parts
}

// the kind of a class: 'hub' (0), 'root' (a root class), 'norm4'
export function classKinds(): ('hub' | 'root' | 'norm4')[] {
  const roots = rootsD4()
  const key = (c: readonly number[]): number => c.reduce((s, v, k) => s + ((((v % 2) + 2) % 2) << k), 0)
  const out: ('hub' | 'root' | 'norm4')[] = Array.from({ length: 16 }, () => 'norm4')

  out[0] = 'hub'
  for (const r of roots) out[key(d4Coordinates(r))] = 'root'

  return out
}

// ---- orienting a pattern with several lines per dock ----

// the units (dock, line) of a store on the side-4 cell, 1 where held
export const heldOf = (store: Int8Array): Uint8Array => Uint8Array.from(store, v => (v !== 0 ? 1 : 0))

// Orient the held units so every generator carries the orientation to itself: each orbit of units gets +1 on its
// least unit and the generators carry the sign (the arriving side sign times the generator's charge sign c); a unit
// reached with both signs, or sent to a unit not held, is a conflict. The multi-line form of varying-vacuum's
// orientPattern.
export function orientUnits(held: Uint8Array, generators: readonly AffineGenerator[]): { ok: boolean; conflicts: number; orbits: number; signs: Int8Array } {
  const signs = new Int8Array(held.length)
  let conflicts = 0
  let orbits = 0

  for (let u0 = 0; u0 < held.length; u0++) {
    if (!held[u0] || signs[u0] !== 0) continue

    orbits++
    signs[u0] = 1

    const queue = [u0]

    while (queue.length > 0) {
      const u = queue.pop() as number
      const x = Math.floor(u / 12)
      const l = u % 12
      const s = signs[u] as number

      for (const gen of generators) {
        const v = (gen.map[x] as number) * 12 + (gen.lineImage[l] as number)

        if (!held[v]) {
          conflicts++
          continue
        }

        const image = gen.c * (gen.lineSign[l] as number) * s

        if (signs[v] === 0) {
          signs[v] = image
          queue.push(v)
        } else if (signs[v] !== image) conflicts++
      }
    }
  }

  return { ok: conflicts === 0, conflicts, orbits, signs }
}

// THE ORIENTED UNION, derived by search and then fixed, as orientedHub is: on the side-4 cell, the union pattern about
// hub 0 oriented so that 2T (left multiplication by the Hurwitz units, about hub 0) and ONE more element g carry the
// orientation to itself with no charge conjugation; g is the least element (in the group table's order, outside 2T)
// for which this has no conflict. Every orbit of units gets +1 on its least unit.
export type OrientedUnion = { readonly extra: number; readonly group: number[]; readonly signs: Int8Array; readonly orbits: number }

let ORIENTED_UNION: OrientedUnion | undefined

export function orientedUnion(coins: CoinData): OrientedUnion {
  if (ORIENTED_UNION) return ORIENTED_UNION

  const table = coins.table
  const twoT = binaryTetrahedralIndices(table)
  const box = boxMaps(coins, 4)
  const held = heldOf(unionHubStore(coins, 4, [0, 0, 0, 0]))
  const hub = [0, 0, 0, 0]
  const base = twoT.map(g => pointGenerator(coins, box, g, hub, 1))

  for (let g = 0; g < table.permutations.length; g++) {
    if (twoT.includes(g)) continue

    const o = orientUnits(held, [...base, pointGenerator(coins, box, g, hub, 1)])

    if (!o.ok) continue

    ORIENTED_UNION = { extra: g, group: closure(table, [...twoT, g]), signs: o.signs, orbits: o.orbits }

    return ORIENTED_UNION
  }

  throw new Error('no oriented union beyond 2T')
}

// the oriented union store on a box whose side is divisible by 4, hub at the given basis coordinates
export function orientedUnionStore(coins: CoinData, side: number, hub: readonly number[]): Int8Array {
  if (side % 4 !== 0) throw new Error('the oriented union has period 4 D4: the side must be divisible by 4')

  const o = orientedUnion(coins)
  const store = new Int8Array(side ** 4 * 12)

  for (let x = 0; x < side ** 4; x++) {
    const c = d4BoxCoordinates({ cell: x, side })
    const y = d4BoxCell({ coordinates: c.map((v, k) => v - (hub[k] as number)), side: 4 })

    for (let l = 0; l < 12; l++) store[x * 12 + l] = o.signs[y * 12 + l] as number
  }

  return store
}

// per dock of a store with any number of stored lines: its two collision matrices (code/measure/bounce-transport
// bounceLawMatrices, which takes a sign per line), one computation per distinct stored row. MEASUREMENT (floats).
export function multiLineDockMatrices(kind: CollisionKind, store: Int8Array, cells: number): { even: Float64Array[]; odd: Float64Array[]; distinct: number } {
  const cache = new Map<string, [Float64Array, Float64Array]>()
  const even: Float64Array[] = []
  const odd: Float64Array[] = []

  for (let x = 0; x < cells; x++) {
    const row = Array.from(store.subarray(x * 12, x * 12 + 12))
    const key = row.join(',')
    let pair = cache.get(key)

    if (!pair) {
      pair = bounceLawMatrices(kind, row)
      cache.set(key, pair)
    }

    even.push(pair[0])
    odd.push(pair[1])
  }

  return { even, odd, distinct: cache.size }
}

export type DenseFresh = {
  readonly kernel: BounceKernel
  readonly store: Int8Array
  readonly layout: Int8Array
  readonly cells: number
  readonly side: number
  readonly mesh: Mesh
  readonly hub: number[]
}

// which store: 'union' the oriented union (the candidate), 'translates' the four translated hub stores (whose union
// keeps only 24 elements), 'hub' the hub store of E-RLT-0082 to 0092 (the control)
export type StoreKind = 'union' | 'translates' | 'hub'

export function storeOfKind(which: StoreKind, side: number, hub: readonly number[]): Int8Array {
  const coins = coinsOnce()

  if (which === 'union') return orientedUnionStore(coins, side, hub)
  if (which === 'translates') return unionHubStore(coins, side, hub)

  return orientedHubStore(coins, side, hub)
}

// a fresh weave under whatever link start is current (never weaveOf, which caches per side); the anchor dock stores
// line 0 (the hub is the anchor minus r0)
export function denseFresh(side: number, kind: CollisionKind, which: StoreKind = 'union', anchor = 0): DenseFresh {
  const hub = baseHub(side, anchor)
  const weave = makeColorWeave({ side, table: 'bind' })

  return { kernel: makeBounceKernel(weave, kind), store: storeOfKind(which, side, hub), layout: separatedLayout(weave), cells: weave.mesh.cellCount, side, mesh: weave.mesh, hub }
}
