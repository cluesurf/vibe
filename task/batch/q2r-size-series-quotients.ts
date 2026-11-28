// The quotients of the full-size series for the spin-one Q2R Blume-Capel pairs,
// built from code/substrate/tiling-quotient.ts by import and never changing it:
//
// - `regularMapSeries`: every {p,q} regular map with a simple cell graph whose rotation group <x, y> lies in PGL(2, m),
//   one per distinct (group order, genus, injectivity radius, loop systole), the same enumeration as
//   `rotaryMapSurvey` (x over one representative per conjugacy class of order-p elements, y over the order-q elements
//   with xy of order 2, ascending packed keys) but returning the map itself, so the run can read its cell graph.
//   Maps of one size and genus but different systoles are kept apart: they separate the systole from the genus.
// - `flatPartnerOf`: the flat torus of equal cell count and degree, by the catalog's own rule (the
//   factor pair closest to square, `torusSides`).
// - `d4Box`: the flat D4 honeycomb {3,4,3,3} on a box of even sides (a, b, c, d), the even-sum points of Z^4 modulo
//   the box, with the 24 D4 roots as the facet steps. `d4Torus(side)` is the cube; the box gives the matched sizes
//   the cube cannot (16384 docks = 8 x 16 x 16 x 16 / 2, 131072 = 16 x 16 x 32 x 32 / 2).
//
// Integers only. Nothing moves here: this file builds tables and counts.
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  analyzeMap,
  ballSystole,
  hexagonTorus,
  projectiveGroup,
  referenceTiling,
  rotaryMap,
  squareTorus,
  torusSides,
  triangleTorus,
  type DartMap,
  type FlatTorus,
  type ProjectiveGroup,
  type SurfaceAnalysis,
} from '@/code/substrate/tiling-quotient'

export type SeriesMap = {
  readonly p: number
  readonly q: number
  readonly modulus: number
  readonly x: [number, number, number, number]
  readonly y: [number, number, number, number]
  readonly groupOrder: number
  readonly map: DartMap
  readonly analysis: SurfaceAnalysis
  readonly systole: number
  readonly loopSystole: number | null
  readonly systoleLowerBound: boolean
}

// <x, y> by right multiplication from the identity, breadth first (the same closure as tiling-quotient.ts)
function closure(group: ProjectiveGroup, x: number, y: number): number[] {
  const seen = new Set<number>([group.identity])
  const list = [group.identity]

  for (const g of list) {
    for (const s of [x, y]) {
      const h = group.multiply(g, s)

      if (!seen.has(h)) {
        seen.add(h)
        list.push(h)
      }
    }
  }

  return list
}

// the hyperbolic reference patch for the systole: the survey's 15,000 cells, below buildCellGraph's float wall
export const HYPERBOLIC_REFERENCE_CELLS = 15_000

export function regularMapSeries(input: {
  p: number
  q: number
  moduli: readonly number[]
  maxCells: number
  minSystole: number
}): SeriesMap[] {
  const { p, q } = input
  const reference = referenceTiling([p, q], HYPERBOLIC_REFERENCE_CELLS)
  const out: SeriesMap[] = []
  const seen = new Set<string>()

  for (const m of input.moduli) {
    const group = projectiveGroup(m)

    // the rotation group has at most |PGL(2, m)| elements and p darts per face
    if (group.elements.length / p > input.maxCells * 2) {
      continue
    }

    const orders = new Map(group.elements.map(g => [g, group.order(g)]))

    const inverse = (g: number): number => {
      let h = group.identity

      for (let k = 1; k < orders.get(g)!; k++) {
        h = group.multiply(h, g)
      }

      return h
    }

    const xs = group.elements.filter(g => orders.get(g) === p)
    const ys = group.elements.filter(g => orders.get(g) === q)
    const classified = new Set<number>()
    const representatives: number[] = []

    for (const x of xs) {
      if (classified.has(x)) {
        continue
      }

      representatives.push(x)

      for (const g of group.elements) {
        classified.add(group.multiply(group.multiply(g, x), inverse(g)))
      }
    }

    for (const x of representatives) {
      for (const y of ys) {
        const xy = group.multiply(x, y)

        if (xy === group.identity || group.multiply(xy, xy) !== group.identity) {
          continue
        }

        const elements = closure(group, x, y)

        if (elements.length / p > input.maxCells) {
          continue
        }

        const map = rotaryMap(group, elements, x, y)
        const analysis = analyzeMap(map, p, q)

        if (!Object.values(analysis.gates).every(Boolean)) {
          continue
        }

        // the rotation group acts transitively on the faces, so cell 0 reads the systole
        const sys = ballSystole({ neighbors: analysis.neighbors, reference, referenceDegree: p, centers: [0] })

        if (sys.systole < input.minSystole) {
          continue
        }

        const key = `${elements.length}:${analysis.genus}:${sys.systole}:${sys.loopSystole}`

        if (seen.has(key)) {
          continue
        }

        seen.add(key)
        out.push({
          p,
          q,
          modulus: m,
          x: group.entries(x),
          y: group.entries(y),
          groupOrder: elements.length,
          map,
          analysis,
          systole: sys.systole,
          loopSystole: sys.loopSystole,
          systoleLowerBound: sys.lowerBound,
        })
      }
    }
  }

  return out.sort((a, b) => a.analysis.faces - b.analysis.faces || b.systole - a.systole)
}

// the flat tiling of each degree that has one
const FLAT_OF_DEGREE: Readonly<Record<number, readonly [number, number]>> = {
  3: [3, 6],
  4: [4, 4],
  6: [6, 3],
}

// the catalog's flat partner of a degree-p quotient with `cells` tiles, or null
export function flatPartnerOf(p: number, cells: number): FlatTorus | null {
  const flat = FLAT_OF_DEGREE[p]

  if (!flat) {
    return null
  }

  if (flat[0] === 3) {
    const sides = cells % 2 === 0 ? torusSides(cells / 2) : null

    return sides ? triangleTorus(sides[0], sides[1]) : null
  }

  const sides = torusSides(cells)

  if (!sides) {
    return null
  }

  return flat[0] === 4 ? squareTorus(sides[0], sides[1]) : hexagonTorus(sides[0], sides[1])
}

export type D4Box = { readonly sides: [number, number, number, number]; readonly cells: number; readonly neighbors: number[][] }

// The D4 honeycomb on the box (a, b, c, d): cell ids in lexicographic order of the even-sum points, neighbour k the
// cell across root k. Every side must be even (so the even-sum condition is well defined modulo the box) and at least
// 4 (so the 24 neighbours are distinct and none is the cell itself).
export function d4Box(sides: readonly [number, number, number, number]): D4Box {
  const [a, b, c, d] = sides

  for (const s of sides) {
    if (s % 2 !== 0 || s < 4) {
      throw new Error(`d4Box: sides must be even and at least 4, got ${sides.join(' x ')}`)
    }
  }

  const index = new Int32Array(a * b * c * d).fill(-1)
  const points: [number, number, number, number][] = []
  const key = (i: number, j: number, k: number, l: number): number => ((i * b + j) * c + k) * d + l

  for (let i = 0; i < a; i++) {
    for (let j = 0; j < b; j++) {
      for (let k = 0; k < c; k++) {
        for (let l = 0; l < d; l++) {
          if ((i + j + k + l) % 2 === 0) {
            index[key(i, j, k, l)] = points.length
            points.push([i, j, k, l])
          }
        }
      }
    }
  }

  const roots = rootsD4()
  const wrap = (x: number, n: number): number => ((x % n) + n) % n
  const neighbors = points.map(([i, j, k, l]) =>
    roots.map(r => index[key(wrap(i + r[0]!, a), wrap(j + r[1]!, b), wrap(k + r[2]!, c), wrap(l + r[3]!, d))]!),
  )

  return { sides: [a, b, c, d], cells: points.length, neighbors }
}

// the even box sides closest to a cube with abcd / 2 = cells, smallest side first, or null
export function d4BoxSides(cells: number): [number, number, number, number] | null {
  let best: [number, number, number, number] | null = null
  let bestSpread = Number.POSITIVE_INFINITY

  const volume = 2 * cells

  for (let a = 4; a ** 4 <= volume; a += 2) {
    for (let b = a; a * b ** 3 <= volume; b += 2) {
      for (let c = b; a * b * c * c <= volume; c += 2) {
        if (volume % (a * b * c) !== 0) {
          continue
        }

        const d = volume / (a * b * c)

        if (d < c || d % 2 !== 0) {
          continue
        }

        if (d - a < bestSpread) {
          best = [a, b, c, d]
          bestSpread = d - a
        }
      }
    }
  }

  return best
}
