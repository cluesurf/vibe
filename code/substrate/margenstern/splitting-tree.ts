// Margenstern's splitting tree for the pentagrid {5,4} and (by the twin theorem {p,4} <-> {p+2,3}) the
// heptagrid {7,3}, as a REGULAR LANGUAGE over Zeckendorf addresses. This is the exact, integer, maximally
// optimal coordinate system, navigation is pure string surgery, no geometry and no floating point.
//
// The rule, every tile is a Zeckendorf word (a binary string with no "11"). A WHITE tile (a "quarter", a
// 3-node, address ending in 0) has three children, formed by appending "00", "01", "10". A BLACK tile (a
// "strip", a 2-node, address ending in 1) has two children, appending "00", "01" (appending "10" would make a
// forbidden "11"). The PREFERRED SON (the continuator) is always the "+00" child, and the parent is the
// address with its last two digits removed. That single uniform rule is what lets a finite machine walk an
// infinite, undrawable plane. See note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md and
// the splitting-method notes (land/text/papers/maurice-margenstern/notes/02-splitting-method.md).

import {
  fromZeckendorf,
  isZeckendorf,
} from '@/code/substrate/margenstern/zeckendorf'

// a white tile is a 3-node (a quarter), a black tile a 2-node (a strip)
export type TileColor = 'white' | 'black'

// the canonical root of one sector of the pentagrid, a white tile. The full grid is a central tile ringed by
// p such sectors (5 for {5,4}, 7 for {7,3}), each an independent copy of this tree.
export const SECTOR_ROOT = '10'

// a tile's color, decided by its last digit, a tile ending in 0 can take the "10" child (so it is a 3-node),
// a tile ending in 1 cannot (so it is a 2-node)
export function colorOf(address: string): TileColor {
  return address.endsWith('0') ? 'white' : 'black'
}

// a tile's children addresses, left to right, the preferred son first
export function childrenOf(address: string): string[] {
  const kids = [address + '00', address + '01']

  if (colorOf(address) === 'white') kids.push(address + '10')

  return kids
}

// the preferred son (the continuator), the "+00" child every tile has
export function preferredSon(address: string): string {
  return address + '00'
}

// the parent address, the tile's address with its last two digits stripped, or null at a sector root
export function parentOf(address: string): string | null {
  if (address.length <= 2) return null

  return address.slice(0, -2)
}

// the exact integer coordinate of a tile (its Zeckendorf value), a stable, drift-free identity
export function coordinateOf(address: string): number {
  return fromZeckendorf(address)
}

// a materialized, append-only, effectively infinite sector tree. Nodes are assigned integer ids in
// breadth-first order as they are reached, and every node carries its exact Zeckendorf address, so cells can be
// deduplicated and identified by exact integer coordinate, never by a floating-point center.
export class SplittingTree {
  private readonly addresses: string[] = []
  private readonly parents: number[] = []
  private readonly idByAddress = new Map<string, number>()
  private readonly childIds: (number[] | null)[] = []

  constructor(rootAddress: string = SECTOR_ROOT) {
    if (!isZeckendorf(rootAddress)) {
      throw new Error(
        `root must be a legal Zeckendorf address, got ${rootAddress}`,
      )
    }

    this.addresses.push(rootAddress)
    this.parents.push(-1)
    this.childIds.push(null)
    this.idByAddress.set(rootAddress, 0)
  }

  get size(): number {
    return this.addresses.length
  }

  readonly root: number = 0

  address(id: number): string {
    return this.addresses[id]!
  }

  color(id: number): TileColor {
    return colorOf(this.addresses[id]!)
  }

  coordinate(id: number): number {
    return coordinateOf(this.addresses[id]!)
  }

  parent(id: number): number {
    return this.parents[id]!
  }

  // the children ids, materializing them on first access (the lazy, on-demand growth)
  children(id: number): number[] {
    const cached = this.childIds[id]

    if (cached) return cached

    const kids: number[] = []

    for (const childAddress of childrenOf(this.addresses[id]!)) {
      let childId = this.idByAddress.get(childAddress)

      if (childId === undefined) {
        childId = this.addresses.length
        this.idByAddress.set(childAddress, childId)
        this.addresses.push(childAddress)
        this.parents.push(id)
        this.childIds.push(null)
      }

      kids.push(childId)
    }

    this.childIds[id] = kids

    return kids
  }

  // the id of a tile by its address, or undefined if it has not been materialized yet
  idOf(address: string): number | undefined {
    return this.idByAddress.get(address)
  }

  // grow breadth-first until at least `count` tiles exist (a convenience over repeated children() calls)
  grow(count: number): void {
    for (
      let id = 0;
      id < this.addresses.length && this.addresses.length < count;
      id++
    )
      this.children(id)
  }

  // the path of tile ids from a node up to the sector root
  pathToRoot(id: number): number[] {
    const path: number[] = [id]

    let current = id

    while (this.parents[current]! >= 0) {
      current = this.parents[current]!
      path.push(current)
    }

    return path
  }
}
