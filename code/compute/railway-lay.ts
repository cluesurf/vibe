// THE RAILWAY LAID ON A TILING, run as a cellular automaton. Margenstern draws his railway on the tiles of
// the heptagrid {7,3} and the pentagrid {5,4}: a track is a chain of tiles, the locomotive advances one tile
// per step, and a switch or a crossing is a tile where tracks meet (Vol II 4.3, arXiv:0903.2108 section 4).
// This file does the same for a circuit from railway-circuit.ts, on any cell graph with a position per cell.
//
// LAYING. Every switch and terminal of the circuit takes one tile, at least `spacing` steps from any other,
// so no two share a neighbor. The nodes are placed breadth first from the start, each on the free tile
// nearest its placed neighbors, ties to the tile nearer the root and then the lower index.
//
// Every track of the circuit becomes a path of tiles. A tile carries one path, or two on four different
// sides. Two paths whose sides alternate round the tile CROSS there, as tracks cross in Margenstern's
// circuits. Two whose sides do not alternate pass side by side through one tile, which his automata never
// do (each of his tiles carries one track), and the layout counts both. The paths are found together by negotiated
// congestion (McMurchie and Ebeling's PathFinder, 1995): each round routes every track by A*, letting a
// path pay to share a tile it may not share, and after the round every tile used illegally costs more for
// good, and sharing costs more each round, until a round ends with no illegal tile. Everything is a fixed
// function of the circuit and the cell graph.
//
// THE AUTOMATON. A tile's state is a fixed wiring (which neighbors it is joined to, and for a switch its
// kind) and a changing part: empty, the locomotive's HEAD (with the side it came in by), or its TAIL, and for
// a switch the selected track. One step, every tile at once, reading only itself and its joined neighbors:
//   head   becomes tail. A switch applies crossSwitch to its setting
//   tail   becomes empty
//   empty  becomes head if a joined neighbor is the head and that head leaves toward this tile
// Where the head leaves is read from the head's own state alone: the other side of a track tile, the
// opposite side of a crossing, crossSwitch's exit at a switch. So the rule is local, radius one.
//
// DIFFERENCES FROM MARGENSTERN. His automata have 4 states on {7,3} (0903.2108) and down to 2 on {5,4}
// (1512.07988), because his track is drawn by colored tiles and the rule must recognize a switch from its
// neighbors' colors. Here the wiring is part of each tile's state, a larger alphabet (a set of joined sides,
// a switch kind, a setting, the locomotive). It runs the same railway on the same tiles, one tile per step,
// and makes no claim to his state counts.

import {
  type Circuit,
  type Ending,
  type Visit,
  crossSwitch,
} from '@/code/compute/railway-circuit'

/** A cell graph, and each cell's neighbors in cyclic order round it. */
export type Tiling = {
  neighbors: number[][]
  ring: number[][]
}

/**
 * The role of a tile:
 *   0 empty
 *   1 track     two joined sides
 *   2 crossing  four joined sides, side 0 with 2 and side 1 with 3
 *   3 node      a switch or a terminal of the circuit, sides in the circuit's port order
 */
export const EMPTY = 0
export const TRACK = 1
export const CROSSING = 2
export const NODE = 3

/** The circuit laid on the tiles. */
export type Layout = {
  role: Uint8Array
  /** joined neighbors of each tile, in side order */
  sides: number[][]
  /** for a node tile, the circuit node it holds, else -1 */
  nodeOf: Int32Array
  /** for each circuit node, its tile */
  tileOf: number[]
  /** the tiles each circuit track runs through, in order, ends excluded */
  paths: number[][]
  /** the tiles in use, in index order: every other tile is empty and never changes */
  live: number[]
  /** tiles used: nodes, tracks and crossings */
  used: number
  /** tiles where two tracks cross, their sides alternating round the tile */
  crossings: number
  /** tiles holding two tracks side by side, their sides not alternating */
  doubles: number
  /** the largest distance from the root tile of any used tile */
  radius: number
  /** routing rounds until no tile was used illegally */
  rounds: number
}

/** Distances from one tile to every tile, -1 where unreached. */
function distancesFrom(tiling: Tiling, source: number): Int32Array {
  const distance = new Int32Array(tiling.neighbors.length).fill(-1)
  const queue = new Int32Array(tiling.neighbors.length)
  let head = 0
  let tail = 0

  distance[source] = 0
  queue[tail++] = source

  while (head < tail) {
    const cell = queue[head++]!

    for (const next of tiling.neighbors[cell]!) {
      if (distance[next] === -1) {
        distance[next] = distance[cell]! + 1
        queue[tail++] = next
      }
    }
  }

  return distance
}

/**
 * The neighbors of each tile in cyclic order round it: the tile moved to the center of the disk by the
 * Möbius map z -> (z - c) / (1 - conj(c) z), which keeps orientation, and its neighbors sorted by angle.
 */
export function cyclicNeighbors(tiling: {
  neighbors: number[][]
  coords: number[][]
}): number[][] {
  return tiling.neighbors.map((list, cell) => {
    const [cx, cy] = tiling.coords[cell]! as [number, number]

    const angle = (other: number): number => {
      const [zx, zy] = tiling.coords[other]! as [number, number]
      // numerator z - c, denominator 1 - conj(c) z
      const nx = zx - cx
      const ny = zy - cy
      const dx = 1 - (cx * zx + cy * zy)
      const dy = -(cx * zy - cy * zx)

      return Math.atan2(ny * dx - nx * dy, nx * dx + ny * dy)
    }

    return [...list].sort((a, b) => angle(a) - angle(b))
  })
}

/** Whether tiles x and y lie on different sides of the pair p, q in the cyclic order `ring`. */
export function alternate({
  ring,
  p,
  q,
  x,
  y,
}: {
  ring: number[]
  p: number
  q: number
  x: number
  y: number
}): boolean {
  const at = (cell: number) => ring.indexOf(cell)
  const [a, b] = [at(p), at(q)].sort((m, n) => m - n) as [number, number]
  const inside = (cell: number) => at(cell) > a && at(cell) < b

  return inside(x) !== inside(y)
}

/** Node tiles are at least this many steps apart, so no two nodes share a neighbor. */
export const DEFAULT_SPACING = 3

/** The most tracks that pass over one gap between consecutive nodes of an order. */
export function cutwidth({
  circuit,
  order,
}: {
  circuit: Circuit
  order: number[]
}): number {
  const position = new Int32Array(circuit.nodes.length)

  order.forEach((node, i) => {
    position[node] = i
  })

  const change = new Int32Array(order.length + 1)

  circuit.link.forEach((ports, a) => {
    for (const other of ports) {
      if (other && other.node > a) {
        const i = position[a]!
        const j = position[other.node]!

        change[Math.min(i, j)]! += 1
        change[Math.max(i, j)]! -= 1
      }
    }
  })

  let cut = 0
  let widest = 0

  for (let i = 0; i < order.length; i++) {
    cut += change[i]!
    widest = Math.max(widest, cut)
  }

  return widest
}

/** Passes of the local improvement of a line order. */
const ORDER_PASSES = 12

/** How far a node may move in one try of the local improvement. */
const ORDER_REACH = 6

/**
 * An order of the circuit's nodes along a line with few tracks over any gap (a small CUTWIDTH), since
 * every track over a gap must cross the band there. First the spectral order: nodes sorted by the Fiedler
 * vector of the circuit graph, found by power iteration on (c I - L) with the constant vector removed,
 * from a fixed start. Then single nodes are moved a few places at a time while that lowers the cutwidth,
 * or keeps it and shortens the tracks.
 */
export function lineOrder(circuit: Circuit): number[] {
  const n = circuit.nodes.length
  const adjacent = circuit.link.map(ports =>
    ports.filter(p => p !== null).map(p => p!.node),
  )
  const degree = adjacent.map(a => a.length)
  const shift = 2 * Math.max(...degree)
  let v = Array.from({ length: n }, (_, i) => Math.sin(i * 1.7) + i / n)

  for (let iteration = 0; iteration < 20000; iteration++) {
    const mean = v.reduce((a, b) => a + b, 0) / n
    const centered = v.map(x => x - mean)
    const next = centered.map(
      (x, i) =>
        (shift - degree[i]!) * x +
        adjacent[i]!.reduce((sum, j) => sum + centered[j]!, 0),
    )
    const norm = Math.sqrt(next.reduce((sum, x) => sum + x * x, 0))

    v = next.map(x => x / norm)
  }

  const length = (order: number[]) => {
    const position = new Int32Array(n)

    order.forEach((node, i) => {
      position[node] = i
    })

    let total = 0

    circuit.link.forEach((ports, a) => {
      for (const other of ports) {
        if (other && other.node > a) {
          total += Math.abs(position[a]! - position[other.node]!)
        }
      }
    })

    return total
  }
  const score = (order: number[]) =>
    cutwidth({ circuit, order }) * 1e6 + length(order)
  let best = [...v.keys()].sort((a, b) => v[a]! - v[b]! || a - b)
  let bestScore = score(best)

  for (let pass = 0; pass < ORDER_PASSES; pass++) {
    for (let i = 0; i < n; i++) {
      for (let j = Math.max(0, i - ORDER_REACH); j <= Math.min(n - 1, i + ORDER_REACH); j++) {
        if (j === i) {
          continue
        }

        const moved = [...best]
        const [node] = moved.splice(i, 1)

        moved.splice(j, 0, node!)

        const movedScore = score(moved)

        if (movedScore < bestScore) {
          best = moved
          bestScore = movedScore
        }
      }
    }
  }

  return best
}

/** Routing rounds before the router gives up. */
export const MAX_ROUNDS = 60

/** The extra cost of crossing a tile another path runs through, over an empty tile's 1. */
const CROSSING_COST = 0.5

/** The extra cost of passing a tile next to a node the track does not end at. */
const RING_COST = 3

/** The history a jam adds to each tile round it, beside the 1 it adds to itself. */
const NEAR_JAM = 0.5

/** How much dearer an illegal share gets each round. */
const SHARE_GROWTH = 1.3

/** A small binary heap of tiles keyed by a number, lowest first. */
class TileHeap {
  private keys: number[] = []
  private tiles: number[] = []

  get size(): number {
    return this.tiles.length
  }

  push(tile: number, key: number): void {
    const keys = this.keys
    const tiles = this.tiles
    let i = tiles.length

    keys.push(key)
    tiles.push(tile)

    while (i > 0) {
      const parent = (i - 1) >> 1

      if (keys[parent]! < key || (keys[parent] === key && tiles[parent]! <= tile)) {
        break
      }

      keys[i] = keys[parent]!
      tiles[i] = tiles[parent]!
      i = parent
    }

    keys[i] = key
    tiles[i] = tile
  }

  pop(): number {
    const keys = this.keys
    const tiles = this.tiles
    const top = tiles[0]!
    const lastKey = keys.pop()!
    const lastTile = tiles.pop()!
    const n = tiles.length

    if (n > 0) {
      let i = 0

      while (true) {
        let child = 2 * i + 1

        if (child >= n) {
          break
        }

        if (
          child + 1 < n &&
          (keys[child + 1]! < keys[child]! ||
            (keys[child + 1] === keys[child] && tiles[child + 1]! < tiles[child]!))
        ) {
          child += 1
        }

        if (keys[child]! > lastKey || (keys[child] === lastKey && tiles[child]! > lastTile)) {
          break
        }

        keys[i] = keys[child]!
        tiles[i] = tiles[child]!
        i = child
      }

      keys[i] = lastKey
      tiles[i] = lastTile
    }

    return top
  }
}

/** Lay a circuit on a tiling from a root tile. Throws when a node or a track cannot be placed. */
export function layCircuit({
  circuit,
  tiling,
  root,
  start,
  spacing = DEFAULT_SPACING,
  line,
  onRound,
}: {
  circuit: Circuit
  tiling: Tiling
  root: number
  start: number
  /** the least distance, in steps, between two node tiles */
  spacing?: number
  /**
   * tiles in order to put the nodes along, depth first from the start, instead of placing each node
   * greedily near the root
   */
  line?: number[]
  /** called after each routing round with the number of tiles still used illegally */
  onRound?: (report: { round: number; illegal: number; crowded: number }) => void
}): Layout {
  const cells = tiling.neighbors.length
  const degree = tiling.neighbors.reduce((most, n) => Math.max(most, n.length), 0)
  const ring = tiling.ring
  const depth = distancesFrom(tiling, root)
  const role = new Uint8Array(cells)
  const sides: number[][] = Array.from({ length: cells }, () => [])
  const nodeOf = new Int32Array(cells).fill(-1)
  const tileOf: number[] = new Array(circuit.nodes.length).fill(-1)
  // a tile closer than `spacing` steps to a node tile cannot take another node
  const crowded = new Uint8Array(cells)

  // the circuit's nodes, breadth first from the start
  const order: number[] = []
  const seen = new Uint8Array(circuit.nodes.length)

  seen[start] = 1
  order.push(start)

  for (let i = 0; i < order.length; i++) {
    for (const other of circuit.link[order[i]!]!) {
      if (other && !seen[other.node]) {
        seen[other.node] = 1
        order.push(other.node)
      }
    }
  }

  if (order.length !== circuit.nodes.length) {
    throw new Error('the circuit is not connected')
  }

  const place = (node: number, tile: number) => {
    tileOf[node] = tile
    nodeOf[tile] = node
    role[tile] = NODE
    sides[tile] = new Array(circuit.link[node]!.length).fill(-1)

    let shell = [tile]

    crowded[tile] = 1

    for (let step = 1; step < spacing; step++) {
      const outer: number[] = []

      for (const cell of shell) {
        for (const next of tiling.neighbors[cell]!) {
          if (!crowded[next]) {
            crowded[next] = 1
            outer.push(next)
          }
        }
      }

      shell = outer
    }
  }

  // a node tile needs a whole ring, and each ring tile a whole ring, so its tracks can leave
  const free = (tile: number) =>
    !crowded[tile] &&
    tiling.neighbors[tile]!.length === degree &&
    tiling.neighbors[tile]!.every(n => tiling.neighbors[n]!.length === degree)

  if (line !== undefined) {
    // the tiles of the line taken one after another as far apart as the spacing asks, and the nodes put
    // on them depth first from the start
    let at = 0
    const along = lineOrder(circuit)

    for (const node of along) {
      while (at < line.length && !free(line[at]!)) {
        at += 1
      }

      if (at === line.length) {
        throw new Error(`the line is full after ${along.indexOf(node)} nodes`)
      }

      place(node, line[at]!)
    }
  }

  for (const node of line === undefined ? order : []) {
    if (node === start) {
      place(node, root)
      continue
    }

    const anchors = circuit.link[node]!
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .map(p => tileOf[p.node]!)
      .filter(t => t >= 0)
    const fields = anchors.map(t => distancesFrom(tiling, t))
    let best = -1
    let bestKey = Infinity

    for (let tile = 0; tile < cells; tile++) {
      if (!free(tile)) {
        continue
      }

      let score = 0

      for (const field of fields) {
        score += field[tile]! < 0 ? cells : field[tile]!
      }

      // ties go nearer the root, then to the lower index
      const key = score * 1000 + depth[tile]!

      if (key < bestKey) {
        bestKey = key
        best = tile
      }
    }

    if (best < 0) {
      throw new Error(`no room for ${circuit.nodes[node]!.label}`)
    }

    place(node, best)
  }

  // every track of the circuit, once, shortest first
  const tracks: { a: number; pa: number; b: number; pb: number; span: number }[] = []
  const fields = new Map<number, Int32Array>()
  const fieldOf = (tile: number) => {
    let field = fields.get(tile)

    if (!field) {
      field = distancesFrom(tiling, tile)
      fields.set(tile, field)
    }

    return field
  }

  circuit.link.forEach((ports, a) => {
    ports.forEach((other, pa) => {
      if (other && (a < other.node || (a === other.node && pa < other.port))) {
        tracks.push({
          a,
          pa,
          b: other.node,
          pb: other.port,
          span: fieldOf(tileOf[other.node]!)[tileOf[a]!]!,
        })
      }
    })
  })

  tracks.sort((x, y) => x.span - y.span || x.a - y.a || x.pa - y.pa)

  // the path of each track, its ends excluded, and which tracks run through each tile
  const routes: number[][] = tracks.map(() => [])
  const users: number[][] = Array.from({ length: cells }, () => [])
  const history = new Float64Array(cells)
  let share = 1

  // the tiles before and after `tile` on track t's path, the node tiles counted as ends
  const around = (t: number, tile: number): [number, number] => {
    const route = routes[t]!
    const i = route.indexOf(tile)
    const before = i === 0 ? tileOf[tracks[t]!.a]! : route[i - 1]!
    const after = i === route.length - 1 ? tileOf[tracks[t]!.b]! : route[i + 1]!

    return [before, after]
  }

  // whether a tile carries its tracks legally: one, or two that cross
  const legal = (tile: number): boolean => {
    const list = users[tile]!

    if (list.length <= 1) {
      return true
    }

    if (list.length > 2) {
      return false
    }

    const [p, q] = around(list[0]!, tile)
    const [x, y] = around(list[1]!, tile)

    return p !== x && p !== y && q !== x && q !== y
  }

  // the node each tile is next to, or -1: node tiles are at least `spacing` apart, so there is at most one
  const ringOf = new Int32Array(cells).fill(-1)

  tileOf.forEach((tile, node) => {
    for (const next of tiling.neighbors[tile]!) {
      ringOf[next] = node
    }
  })

  const cost = new Float64Array(cells)
  const parent = new Int32Array(cells)
  const closed = new Int32Array(cells).fill(-1)
  const opened = new Int32Array(cells).fill(-1)

  // route track t by A* on tiles, the cost of a tile 1 plus its history, times the price of sharing it
  const route = (t: number, stamp: number): number[] => {
    const track = tracks[t]!
    const from = tileOf[track.a]!
    const to = tileOf[track.b]!
    const toward = fieldOf(to)
    const heap = new TileHeap()

    // the price of stepping from `here` (entered from `came`) onto `next`
    const price = (came: number, here: number, next: number): number => {
      let base = 1

      if (next !== to) {
        const others = users[next]!.filter(u => u !== t)

        base += history[next]!

        // a tile next to another node is that node's way out, so passing it costs more
        const owner = ringOf[next]!

        if (owner >= 0 && owner !== track.a && owner !== track.b) {
          base += RING_COST
        }

        if (others.length === 1) {
          base += CROSSING_COST
        } else if (others.length > 0) {
          base *= 1 + share * others.length
        }
      }

      // leaving a shared tile by a side its one other track uses is an illegal share
      if (here !== from) {
        const through = users[here]!.filter(u => u !== t)

        if (through.length === 1) {
          const [x, y] = around(through[0]!, here)
          const apart =
            came !== x && came !== y && next !== x && next !== y

          if (!apart) {
            base += share * 4
          }
        }
      }

      return base
    }

    opened[from] = stamp
    cost[from] = 0
    parent[from] = -1
    heap.push(from, toward[from]!)

    while (heap.size > 0) {
      const here = heap.pop()

      if (closed[here] === stamp) {
        continue
      }

      closed[here] = stamp

      if (here === to) {
        const path: number[] = []

        for (let cell = parent[to]!; cell !== from; cell = parent[cell]!) {
          path.push(cell)
        }

        return path.reverse()
      }

      const came = parent[here]!
      let onward: number[]

      if (here === from) {
        onward = tiling.neighbors[here]!
      } else {
        onward = tiling.neighbors[here]!.filter(
          n => n !== came && (role[n] !== NODE || n === to),
        )
      }

      for (const next of onward) {
        if (closed[next] === stamp) {
          continue
        }

        const step = price(came, here, next)
        const total = cost[here]! + step

        if (opened[next] !== stamp || total < cost[next]!) {
          opened[next] = stamp
          cost[next] = total
          parent[next] = here
          heap.push(next, total + toward[next]!)
        }
      }
    }

    let explored = 0

    for (let cell = 0; cell < cells; cell++) {
      explored += closed[cell] === stamp ? 1 : 0
    }

    throw new Error(
      `no route for the track ${circuit.nodes[track.a]!.label}.${track.pa} to ${circuit.nodes[track.b]!.label}.${track.pb}, ${explored} tiles explored, at depths ${depth[from]} and ${depth[to]}`,
    )
  }

  let rounds = 0
  let stamp = 0

  for (; rounds < MAX_ROUNDS; rounds++) {
    // odd rounds route the tracks in the reverse order, so no track always routes last round a jam
    for (let i = 0; i < tracks.length; i++) {
      const t = rounds % 2 === 0 ? i : tracks.length - 1 - i

      for (const tile of routes[t]!) {
        const list = users[tile]!

        list.splice(list.indexOf(t), 1)
      }

      routes[t] = route(t, stamp++)

      for (const tile of routes[t]!) {
        users[tile]!.push(t)
      }
    }

    let illegal = 0
    let crowdedTiles = 0

    for (let tile = 0; tile < cells; tile++) {
      if (!legal(tile)) {
        illegal += 1
        crowdedTiles += users[tile]!.length > 2 ? 1 : 0
        history[tile]! += 1

        // the tiles round a jam cost more too, so the tracks that box it in move away as well
        for (const next of tiling.neighbors[tile]!) {
          history[next]! += NEAR_JAM
        }
      }
    }

    onRound?.({ round: rounds, illegal, crowded: crowdedTiles })

    if (illegal === 0) {
      break
    }

    share *= SHARE_GROWTH
  }

  if (rounds === MAX_ROUNDS) {
    const worst = users.findIndex((_, tile) => !legal(tile))
    const detail =
      worst >= 0
        ? users[worst]!
            .map(
              u =>
                `${circuit.nodes[tracks[u]!.a]!.label} -> ${circuit.nodes[tracks[u]!.b]!.label} (${routes[u]!.length}, around ${around(u, worst).join('/')})`,
            )
            .join('; ')
        : ''

    throw new Error(
      `the tracks still share tiles after ${MAX_ROUNDS} rounds, tile ${worst} at depth ${depth[worst]}, ring ${ring[worst]!.join('/')}: ${detail}`,
    )
  }

  // write the wiring: a tile with one track is a track tile, with two a crossing tile, which is a true
  // crossing when the two tracks' sides alternate round it and two tracks side by side when they do not
  let crossings = 0
  let doubles = 0

  tracks.forEach((track, t) => {
    const chain = [tileOf[track.a]!, ...routes[t]!, tileOf[track.b]!]

    for (let i = 1; i < chain.length - 1; i++) {
      const cell = chain[i]!
      const before = chain[i - 1]!
      const after = chain[i + 1]!

      if (role[cell] === EMPTY) {
        role[cell] = TRACK
        sides[cell] = [before, after]
      } else {
        const [x, y] = sides[cell] as [number, number]

        role[cell] = CROSSING
        sides[cell] = [x, before, y, after]

        if (alternate({ ring: ring[cell]!, p: x, q: y, x: before, y: after })) {
          crossings += 1
        } else {
          doubles += 1
        }
      }
    }

    sides[tileOf[track.a]!]![track.pa] = chain[1]!
    sides[tileOf[track.b]!]![track.pb] = chain[chain.length - 2]!
  })

  const live: number[] = []
  let radius = 0

  for (let cell = 0; cell < cells; cell++) {
    if (role[cell] !== EMPTY) {
      live.push(cell)
      radius = Math.max(radius, depth[cell]!)
    }
  }

  const used = live.length

  return {
    role,
    sides,
    nodeOf,
    tileOf,
    paths: routes,
    live,
    used,
    crossings,
    doubles,
    radius,
    rounds: rounds + 1,
  }
}

/**
 * Check a layout is a real railway on the tiling: every joined pair are neighbors and joined both ways, a
 * track tile has two distinct sides, a crossing four with its two paths alternating, a node its ports on
 * distinct neighbors. Returns the problems found, empty when it holds.
 */
export function checkLayout({
  layout,
  tiling,
}: {
  layout: Layout
  tiling: Tiling
}): string[] {
  const problems: string[] = []
  const ring = tiling.ring

  layout.role.forEach((role, cell) => {
    if (role === EMPTY) {
      return
    }

    const sides = layout.sides[cell]!

    if (new Set(sides).size !== sides.length) {
      problems.push(`tile ${cell} joins one neighbor twice`)
    }

    for (const other of sides) {
      if (!tiling.neighbors[cell]!.includes(other)) {
        problems.push(`tile ${cell} joins ${other}, not a neighbor`)
      }

      if (!layout.sides[other]!.includes(cell)) {
        problems.push(`tile ${cell} joins ${other} one way`)
      }
    }

    if (role === TRACK && sides.length !== 2) {
      problems.push(`track tile ${cell} has ${sides.length} sides`)
    }

    if (role === CROSSING && sides.length !== 4) {
      problems.push(`crossing tile ${cell} has ${sides.length} sides`)
    }

    if (role === NODE && sides.some(side => side < 0)) {
      problems.push(`node tile ${cell} has an open port`)
    }
  })

  return problems
}

/** The automaton's changing state. */
export type RailState = {
  /** 0 empty, 1 head, 2 tail */
  locomotive: Int8Array
  /** the side the head came in by, -1 for the start */
  entry: Int8Array
  /** a switch tile's selected track */
  selected: Int8Array
}

export const HEAD = 1
export const TAIL = 2

/** The state at time 0: every switch at its circuit setting, the head on the start tile. */
export function initialState({
  circuit,
  layout,
  start,
}: {
  circuit: Circuit
  layout: Layout
  start: number
}): RailState {
  const cells = layout.role.length
  const state: RailState = {
    locomotive: new Int8Array(cells),
    entry: new Int8Array(cells).fill(-1),
    selected: new Int8Array(cells),
  }

  circuit.nodes.forEach((node, id) => {
    if (node.form === 'switch') {
      state.selected[layout.tileOf[id]!] = node.selected
    }
  })

  state.locomotive[layout.tileOf[start]!] = HEAD

  return state
}

/**
 * The tile a head on `cell` leaves toward, read from that tile's own state: -1 when it stops (a terminal)
 * or when the crossing is forbidden.
 */
export function exitOf({
  circuit,
  layout,
  state,
  cell,
}: {
  circuit: Circuit
  layout: Layout
  state: RailState
  cell: number
}): number {
  const sides = layout.sides[cell]!
  const entry = state.entry[cell]!
  const role = layout.role[cell]!

  if (role === TRACK) {
    return sides[1 - entry]!
  }

  if (role === CROSSING) {
    return sides[(entry + 2) % 4]!
  }

  const node = circuit.nodes[layout.nodeOf[cell]!]!

  if (node.form === 'terminal') {
    return node.kind === 'start' && entry === -1 ? sides[0]! : -1
  }

  const crossing = crossSwitch({
    kind: node.kind,
    selected: state.selected[cell] as 1 | 2,
    entry,
  })

  return crossing.forbidden ? -1 : sides[crossing.exit]!
}

/**
 * ONE STEP of the automaton, every tile at once. Returns the next state. Each tile's next state is computed
 * from its own state and its joined neighbors' states only.
 */
export function stepRailway({
  circuit,
  layout,
  state,
}: {
  circuit: Circuit
  layout: Layout
  state: RailState
}): RailState {
  const cells = layout.role.length
  const next: RailState = {
    locomotive: new Int8Array(cells),
    entry: new Int8Array(cells).fill(-1),
    selected: Int8Array.from(state.selected),
  }

  // an empty tile is empty at every step, so only the live tiles are updated
  for (const cell of layout.live) {
    const here = state.locomotive[cell]

    if (here === HEAD) {
      const nodeId = layout.nodeOf[cell]!
      const node = nodeId >= 0 ? circuit.nodes[nodeId]! : null

      // a head on a terminal it does not leave stays: the halt
      if (
        node?.form === 'terminal' &&
        exitOf({ circuit, layout, state, cell }) < 0
      ) {
        next.locomotive[cell] = HEAD
        next.entry[cell] = state.entry[cell]!
        continue
      }

      next.locomotive[cell] = TAIL

      if (node?.form === 'switch') {
        next.selected[cell] = crossSwitch({
          kind: node.kind,
          selected: state.selected[cell] as 1 | 2,
          entry: state.entry[cell]!,
        }).selected
      }

      continue
    }

    if (here === TAIL) {
      continue
    }

    const sides = layout.sides[cell]!

    for (let side = 0; side < sides.length; side++) {
      const other = sides[side]!

      if (
        state.locomotive[other] === HEAD &&
        exitOf({ circuit, layout, state, cell: other }) === cell
      ) {
        next.locomotive[cell] = HEAD
        next.entry[cell] = side
      }
    }
  }

  return next
}

/**
 * RUN the automaton until the head stops on a terminal, crosses a switch it may not, or `limit` steps pass.
 * Returns how it ended, the number of steps, the switch crossings in order (to compare with the
 * switch-level run), the final state, and the largest number of heads seen at once (which must be 1).
 */
export function runRailway({
  circuit,
  layout,
  start,
  limit,
}: {
  circuit: Circuit
  layout: Layout
  start: number
  limit: number
}): {
  ending: Ending
  steps: number
  visits: Visit[]
  state: RailState
  heads: number
} {
  let state = initialState({ circuit, layout, start })
  let head = layout.tileOf[start]!
  const visits: Visit[] = []
  let heads = 1

  for (let steps = 0; steps < limit; steps++) {
    const nodeId = layout.nodeOf[head]!
    const node = nodeId >= 0 ? circuit.nodes[nodeId]! : null

    if (node?.form === 'terminal' && !(node.kind === 'start' && steps === 0)) {
      return {
        ending:
          node.kind === 'halt'
            ? 'halt'
            : node.kind === 'overflow'
              ? 'overflow'
              : 'stray',
        steps,
        visits,
        state,
        heads,
      }
    }

    if (node?.form === 'switch') {
      visits.push({ node: nodeId, entry: state.entry[head]! })

      if (exitOf({ circuit, layout, state, cell: head }) < 0) {
        return { ending: 'forbidden', steps, visits, state, heads }
      }
    }

    state = stepRailway({ circuit, layout, state })

    const was = head
    let count = 0

    for (const cell of layout.live) {
      if (state.locomotive[cell] === HEAD) {
        count += 1
        head = cell
      }
    }

    heads = Math.max(heads, count)

    // one head, one tile further, on a tile joined to the one it left
    if (count !== 1 || !layout.sides[was]!.includes(head)) {
      return { ending: 'forbidden', steps: steps + 1, visits, state, heads }
    }
  }

  return { ending: 'limit', steps: limit, visits, state, heads }
}
