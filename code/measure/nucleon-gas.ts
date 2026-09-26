// Singlets of the paid-string rule (code/rule/string-graph) read off one snapshot, on the D4 box, in the bulk
// and on the husk. The measuring half of the nuclei experiments (E-FRC-0195 to 0199).
//
// A snapshot of the rule is a vibe per dock and an integer flux per link. The energy, and so every move the
// rule takes, reads the flux only mod 3 (a link is paid when E mod 3 is not 0), so what a snapshot says about
// binding is the PAID SUPPORT: the links with E mod 3 not 0. Its connected pieces, over the docks they join,
// are the singlets: by Gauss's law mod 3 a piece whose boundary links are all unpaid carries a charge that is
// 0 mod 3, so every piece holding a charge is a color singlet (a meson, a baryon, or a cluster of them). A
// charge with no paid link at all cannot exist (its divergence is 1 or -1 mod 3), so every charge is in a
// piece.
//
// Nothing moves: a piece is not an object that persists from beat to beat, it is read afresh from each
// snapshot, and a love has no partner fear except the one its piece holds at that beat.
//
// Distances. A displacement between two docks of the side-L box is taken at its minimal image over the
// periods L D4 (the 81 shifts of d4BoxDistance, tabulated once per box). It is reported three ways:
// - the D4 vector itself (bulk, in the lattice's own units, a root has length sqrt 2)
// - the graph distance on D4, max(|v|_inf, |v|_1 / 2), the fewest roots that sum to v
// - its husk shadow: the first three coordinates, dropping the depth x4 (code/measure/photon-husk: the husk is
//   the column sum along e4, so a husk dock is a column and a husk displacement is v without its depth)

import { d4BoxCell, d4BoxCoordinates, d4Vector } from '@/code/substrate/d4-box'
import { graphBeat, graphEnergy, graphGaussHolds, type GraphState, type StringGraph } from '@/code/rule/string-graph'
import { GOLDEN as GOLDEN_RATIO_FRACTION, SILVER as SILVER_RATIO_FRACTION } from '@/code/tool/weyl'

// one singlet piece of a snapshot
export type Piece = {
  // the docks holding a love and a fear in this piece
  readonly loves: number[]
  readonly fears: number[]
  // how many paid links the piece spans
  readonly paid: number
  // the paid links themselves
  readonly links: number[]
}

// the minimal-image displacement table of a side-L box
export type BoxGeometry = {
  readonly side: number
  readonly cells: number
  // the basis coordinates of every dock
  readonly coordinates: readonly (readonly number[])[]
  // the minimal-image D4 vector for each displacement index (the dock index of the coordinate difference)
  readonly minimal: readonly (readonly number[])[]
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3

export function makeBoxGeometry(side: number): BoxGeometry {
  const cells = side ** 4
  const coordinates = Array.from({ length: cells }, (_, x) => d4BoxCoordinates({ cell: x, side }))
  const minimal: number[][] = []

  for (let i = 0; i < cells; i++) {
    const c = (coordinates[i] ?? []).map(x => (x > side / 2 ? x - side : x))

    let best: number[] = []
    let bestNorm = Infinity

    for (let shift = 0; shift < 81; shift++) {
      const s = [0, 1, 2, 3].map(k => (Math.floor(shift / 3 ** k) % 3) - 1)
      const v = d4Vector(c.map((x, k) => x + side * (s[k] ?? 0)))
      const norm = v.reduce((a, b) => a + b * b, 0)

      if (norm < bestNorm) {
        bestNorm = norm
        best = v
      }
    }

    minimal.push(best)
  }

  return { side, cells, coordinates, minimal }
}

// the minimal-image D4 vector from dock b to dock a
export function boxDisplacement(geometry: BoxGeometry, a: number, b: number): readonly number[] {
  const ca = geometry.coordinates[a] ?? []
  const cb = geometry.coordinates[b] ?? []

  return geometry.minimal[d4BoxCell({ coordinates: ca.map((x, k) => x - (cb[k] ?? 0)), side: geometry.side })] ?? []
}

// the fewest D4 roots that sum to v
export function d4GraphDistance(v: readonly number[]): number {
  return Math.max(...v.map(Math.abs), v.reduce((a, b) => a + Math.abs(b), 0) / 2)
}

export const bulkLength = (v: readonly number[]): number => Math.hypot(...v)

// the husk shadow of a bulk displacement: drop the depth coordinate
export const huskLength = (v: readonly number[]): number => Math.hypot(v[0] ?? 0, v[1] ?? 0, v[2] ?? 0)

// the singlet pieces of one snapshot: union-find over the paid links
// Union-find scratch, per dock count: parent[x] is -1 for a dock no paid link touches in this snapshot, and
// `touched` lists the docks to reset. Typed arrays only, so a snapshot allocates nothing but its pieces (the
// first version used Maps and was the slow part of every long gas run; the pieces and their order are the
// same: a piece is listed where its first paid link falls in link order).
const SCRATCH = new Map<number, { parent: Int32Array; piece: Int32Array; touched: Int32Array }>()

export function singletPieces(graph: StringGraph, state: GraphState): Piece[] {
  const cells = graph.mesh.cellCount

  let scratch = SCRATCH.get(cells)

  if (!scratch) {
    scratch = { parent: new Int32Array(cells).fill(-1), piece: new Int32Array(cells).fill(-1), touched: new Int32Array(cells) }
    SCRATCH.set(cells, scratch)
  }

  const { parent, piece, touched } = scratch
  const find = (x: number): number => {
    let r = x

    while ((parent[r] as number) !== r) {
      r = parent[r] as number
    }

    let y = x

    while ((parent[y] as number) !== r) {
      const up = parent[y] as number

      parent[y] = r
      y = up
    }

    return r
  }
  const paidLinks: number[] = []

  let count = 0

  for (let l = 0; l < graph.links.length; l++) {
    if (mod3(state.flux[l] ?? 0) !== 0) {
      const link = graph.links[l] ?? [0, 0, 0]
      const a = link[0]
      const b = link[1]

      paidLinks.push(l)

      if (parent[a] === -1) {
        parent[a] = a
        touched[count++] = a
      }

      if (parent[b] === -1) {
        parent[b] = b
        touched[count++] = b
      }

      const ra = find(a)
      const rb = find(b)

      if (ra !== rb) {
        parent[ra] = rb
      }
    }
  }

  const pieces: { loves: number[]; fears: number[]; links: number[] }[] = []

  for (const l of paidLinks) {
    const r = find((graph.links[l] ?? [0, 0, 0])[0])

    if (piece[r] === -1) {
      piece[r] = pieces.length
      pieces.push({ loves: [], fears: [], links: [] })
    }

    pieces[piece[r] as number]?.links.push(l)
  }

  for (let x = 0; x < cells; x++) {
    const v = state.vibe[x] ?? 0

    // a charge always has a paid link (its divergence is not 0 mod 3), so it is always in a piece
    if (v !== 0 && parent[x] !== -1) {
      const p = pieces[piece[find(x)] as number]

      if (p) {
        ;(v > 0 ? p.loves : p.fears).push(x)
      }
    }
  }

  for (let k = 0; k < count; k++) {
    const x = touched[k] as number

    parent[x] = -1
    piece[x] = -1
  }

  return pieces.filter(p => p.loves.length + p.fears.length > 0).map(p => ({ ...p, paid: p.links.length }))
}

// The displacement between the midpoints of two links (a1, b1) and (a2, b2): the minimal image of a2 - a1 plus
// half the difference of their steps. Near half a period this can miss a shorter image, which the observed
// and the reference counts share, since both are read through this one function.
export function midpointDisplacement(input: { graph: StringGraph; geometry: BoxGeometry; first: number; second: number }): number[] {
  const { graph, geometry, first, second } = input
  const [a1, b1] = graph.links[first] ?? [0, 0, 0]
  const [a2, b2] = graph.links[second] ?? [0, 0, 0]
  const base = boxDisplacement(geometry, a2, a1)
  const s1 = boxDisplacement(geometry, b1, a1)
  const s2 = boxDisplacement(geometry, b2, a2)

  return base.map((x, k) => x + ((s2[k] ?? 0) - (s1[k] ?? 0)) / 2)
}

// The seeds a gas starts from: mesons (a love and a fear on neighboring docks, flux 1 on their link) and
// baryon-antibaryon pairs (three loves then three fears along direction 0, fluxes 1, 2, 3, 2, 1, the middle
// link costing nothing), at docks spread by the golden Weyl sequence, each moved on to the next free place.
export function seedGas(input: { graph: StringGraph; mesons: number; baryons: number }): { vibe: Int8Array; flux: Int32Array } {
  const { graph, mesons, baryons } = input
  const { mesh } = graph
  const cells = mesh.cellCount
  const vibe = new Int8Array(cells)
  const flux = new Int32Array(graph.links.length)
  const busy = new Uint8Array(cells)
  const place = (k: number, signs: number[], fluxes: number[]): void => {
    let x = Math.floor(((k + 1) * GOLDEN_RATIO_FRACTION) % 1 * cells)

    const run = (start: number): number[] => {
      const docks = [start]

      for (let j = 1; j < signs.length; j++) {
        docks.push(mesh.neighbour(docks[j - 1] ?? 0, 0))
      }

      return docks
    }

    // free means the docks and all their neighbours are empty, so a seed never starts in contact
    const free = (docks: number[]): boolean => docks.every(d => busy[d] === 0 && Array.from({ length: 24 }, (_, e) => mesh.neighbour(d, e)).every(y => busy[y] === 0))

    while (!free(run(x))) {
      x = (x + 1) % cells
    }

    const docks = run(x)

    docks.forEach((d, j) => {
      vibe[d] = signs[j] ?? 0
      busy[d] = 1
    })
    fluxes.forEach((e, j) => (flux[graph.linkAt[(docks[j] ?? 0) * 24] ?? 0] = e))
  }

  for (let k = 0; k < mesons; k++) {
    place(k, [1, -1], [1])
  }

  for (let k = 0; k < baryons; k++) {
    place(mesons + k, [1, 1, 1, -1, -1, -1], [1, 2, 3, 2, 1])
  }

  return { vibe, flux }
}

// The same beat as graphBeat of code/rule/string-graph, flattened into typed arrays and run in place, for long
// runs on large boxes (graphBeat allocates a state per beat). Every caller checks it against graphBeat bit for
// bit on its own box before trusting it (fastBeatAgrees).
export type FastGraph = {
  readonly from: Int32Array
  readonly to: Int32Array
  readonly order: Int32Array
  readonly next: Int32Array
  readonly mass: number
  readonly tension: number
  readonly capacity: number
  readonly scratch: Int32Array
}

export function makeFastGraph(graph: StringGraph): FastGraph {
  const n = graph.links.length

  return {
    from: Int32Array.from(graph.links, l => l[0]),
    to: Int32Array.from(graph.links, l => l[1]),
    order: Int32Array.from(graph.matchings.flat()),
    next: Int32Array.from(graph.next),
    mass: graph.mass,
    tension: graph.tension,
    capacity: graph.capacity,
    scratch: new Int32Array(n),
  }
}

export function fastBeat(fast: FastGraph, state: GraphState): void {
  const { from, to, order, next, mass, tension, capacity, scratch } = fast
  const vibe = state.vibe as Int8Array
  const flux = state.flux as Int32Array
  const demon = state.demon as Int32Array

  for (let k = 0; k < order.length; k++) {
    const l = order[k] as number
    const i = from[l] as number
    const j = to[l] as number
    const a = vibe[i] as number
    const b = vibe[j] as number

    let na: number
    let nb: number
    let change: number
    let massChange = 0

    if (a !== 0 && b === 0) {
      na = 0
      nb = a
      change = -a
    } else if (a === 0 && b !== 0) {
      na = b
      nb = 0
      change = b
    } else if (a === 0 && b === 0) {
      na = 1
      nb = -1
      change = 1
      massChange = 2 * mass
    } else if (a === 1 && b === -1) {
      na = 0
      nb = 0
      change = -1
      massChange = -2 * mass
    } else {
      continue
    }

    const e = flux[l] as number
    const before = ((e % 3) + 3) % 3 !== 0 ? tension : 0
    const after = (((e + change) % 3) + 3) % 3 !== 0 ? tension : 0
    const d = (demon[l] as number) - (after - before + massChange)

    if (d < 0 || d > capacity) {
      continue
    }

    vibe[i] = na
    vibe[j] = nb
    flux[l] = e + change
    demon[l] = d
  }

  scratch.set(demon)

  for (let l = 0; l < scratch.length; l++) {
    demon[next[l] as number] = scratch[l] as number
  }
}

// does fastBeat reproduce graphBeat bit for bit from this state over this many beats
export function fastBeatAgrees(graph: StringGraph, start: GraphState, beats: number): boolean {
  const fast = makeFastGraph(graph)
  const mine: GraphState = { vibe: Int8Array.from(start.vibe), flux: Int32Array.from(start.flux), demon: Int32Array.from(start.demon) }

  let reference = start

  for (let t = 0; t < beats; t++) {
    reference = graphBeat(graph, reference)
    fastBeat(fast, mine)

    const same =
      mine.vibe.every((v, i) => v === reference.vibe[i]) && mine.flux.every((v, i) => v === reference.flux[i]) && mine.demon.every((v, i) => v === reference.demon[i])

    if (!same) {
      return false
    }
  }

  return true
}

// A gas run: seed, fill the demons by the silver Weyl sequence at the given fill, settle, then call `look` on
// every `every`-th beat. Returns the measured mean demon and the energy and Gauss checks. The rule is
// code/rule/string-graph, unchanged.
export function runGas(input: {
  graph: StringGraph
  mesons: number
  baryons: number
  fill: number
  settle: number
  beats: number
  every: number
  look: (state: GraphState, beat: number) => void
}): { meanDemon: number; exact: boolean; agrees: boolean } {
  const { graph, mesons, baryons, fill, settle, beats, every, look } = input
  const seeded = seedGas({ graph, mesons, baryons })
  const start: GraphState = {
    ...seeded,
    demon: Int32Array.from({ length: graph.links.length }, (_, l) => (((l + 1) * SILVER_RATIO_FRACTION) % 1 < fill ? 1 : 0)),
  }
  const e0 = graphEnergy(graph, start)
  const agrees = fastBeatAgrees(graph, start, AGREEMENT_BEATS)
  const fast = makeFastGraph(graph)
  const s: GraphState = { vibe: Int8Array.from(start.vibe), flux: Int32Array.from(start.flux), demon: Int32Array.from(start.demon) }

  let exact = graphGaussHolds(graph, start)
  let demonSum = 0
  let samples = 0

  for (let t = 0; t < settle + beats; t++) {
    fastBeat(fast, s)

    if (t >= settle && (t - settle) % every === 0) {
      if (samples % EXACT_CHECK_EVERY === 0) {
        exact = exact && graphEnergy(graph, s) === e0 && graphGaussHolds(graph, s)
      }

      let d = 0

      for (let l = 0; l < graph.links.length; l++) {
        d += s.demon[l] ?? 0
      }

      demonSum += d / graph.links.length
      samples += 1
      look(s, t)
    }
  }

  exact = exact && graphEnergy(graph, s) === e0 && graphGaussHolds(graph, s)

  return { meanDemon: demonSum / Math.max(1, samples), exact, agrees }
}

// how many beats every run checks fastBeat against graphBeat from its own start
const AGREEMENT_BEATS = 40

// the energy and Gauss's law are checked on every this-many-th snapshot, and on the last
const EXACT_CHECK_EVERY = 25

// A histogram keyed by 4 x a squared length (exact for every length here, whose squares are multiples of 1/4).
export type LengthHistogram = Map<number, number>

export const lengthKey = (squared: number): number => Math.round(4 * squared)

export function addTo(histogram: LengthHistogram, key: number, weight = 1): void {
  histogram.set(key, (histogram.get(key) ?? 0) + weight)
}

// How many dock displacements of the box have each bulk and each husk squared length: the normalizer that
// turns a histogram of love-fear displacements into a profile per dock (bulk) and per dock of a column (husk).
export function dockShells(geometry: BoxGeometry): { bulk: LengthHistogram; husk: LengthHistogram } {
  const bulk: LengthHistogram = new Map()
  const husk: LengthHistogram = new Map()

  geometry.minimal.forEach((v, i) => {
    if (i === 0) {
      return
    }

    addTo(bulk, lengthKey(bulkLength(v) ** 2))
    addTo(husk, lengthKey(huskLength(v) ** 2))
  })

  return { bulk, husk }
}

// How many ordered pairs of links (the first one of the 12 at dock 0, which by translation stands for every
// link) sharing no dock have each bulk and husk squared midpoint distance: the ideal-gas reference for a pair
// of compact singlets.
export function linkPairShells(graph: StringGraph, geometry: BoxGeometry): { bulk: LengthHistogram; husk: LengthHistogram; total: number } {
  const bulk: LengthHistogram = new Map()
  const husk: LengthHistogram = new Map()
  const firsts = Array.from({ length: 24 }, (_, d) => graph.linkAt[d] ?? -1).filter(l => l >= 0)

  let total = 0

  for (const first of firsts) {
    const [a1, b1] = graph.links[first] ?? [0, 0, 0]

    for (let second = 0; second < graph.links.length; second++) {
      const [a2, b2] = graph.links[second] ?? [0, 0, 0]

      if (a2 === a1 || a2 === b1 || b2 === a1 || b2 === b1) {
        continue
      }

      const v = midpointDisplacement({ graph, geometry, first, second })

      addTo(bulk, lengthKey(bulkLength(v) ** 2))
      addTo(husk, lengthKey(huskLength(v) ** 2))
      total += 1
    }
  }

  return { bulk, husk, total }
}

// A weighted straight-line fit y = intercept + slope x.
export function weightedLine(points: { x: number; y: number; w: number }[]): { slope: number; intercept: number } {
  const sw = points.reduce((a, p) => a + p.w, 0)
  const mx = points.reduce((a, p) => a + p.w * p.x, 0) / sw
  const my = points.reduce((a, p) => a + p.w * p.y, 0) / sw
  const sxx = points.reduce((a, p) => a + p.w * (p.x - mx) ** 2, 0)
  const sxy = points.reduce((a, p) => a + p.w * (p.x - mx) * (p.y - my), 0)
  const slope = sxy / sxx

  return { slope, intercept: my - slope * mx }
}

// The decay rate m of an Ornstein-Zernike form A e^(-m r) / r^power, fitted to per-shell values with their
// counts: the weighted line through ln(value r^power) against r, each point weighted by its count (the
// variance of the log of a Poisson count is one over the count). Returns NaN with fewer than three points.
export function ornsteinZernikeRate(input: { points: { r: number; value: number; count: number }[]; power: number }): number {
  const { points, power } = input
  const usable = points.filter(p => p.value > 0 && p.count > 0)

  if (usable.length < 3) {
    return Number.NaN
  }

  const fit = weightedLine(usable.map(p => ({ x: p.r, y: Math.log(p.value * p.r ** power), w: p.count })))

  return -fit.slope
}
