// CLOSED QUOTIENTS for the M1 lab: finite cell graphs with no
// boundary, on which a reversible rule's global map is a permutation of a finite set, so every orbit is periodic and
// the 16 vacuum-creating pair rules can run without a vacuum outside. Code: code/substrate/tiling-quotient.ts.
//
// Built: the hyperbolic regular maps {7,3} (Klein's quartic), {5,4} (Bring's surface), {8,3}, and the degree-matched
// controls {4,5}, {6,4}, {3,7}, each the smallest found in PGL(2, m) whose cell graph is simple and whose
// 1-balls are the tiling's; the flat torus of equal cell count and degree where a flat tiling of that degree exists;
// the {3,4,3,4} congruence quotients K mod (sqrt 2)^m under 20,000 docks, with the flat D4 torus of equal size.
//
// GATES (fail the experiment). A later pass split them into IDENTITIES of the construction, which
// hold by how the tables are built and are kept only as consistency checks, and INDEPENDENT checks, which read the
// quotient another way and can fail:
// G1 every cell has full degree p and p distinct neighbours (no self-adjacency); faces are p-gons, vertices have q
//    faces, edgeMate is a fixed-point-free involution, the cell graph is connected.
// G2 identities: the counted Euler characteristic is the catalog's (one value); V - E + F equals |G| (1/p + 1/q - 1/2)
//    (it follows from the orbit sizes G1 checks); the flat tori count Euler 0; the {3,4,3,4} open Euler characteristic
//    -E + F - C3 + C4 equals the dock count (it follows from the uniform incidence, E = 12 d and T = 24 d).
// G2i independent: the GF(2) homology of each surface's cell complex, by ranks of its boundary matrices (a computation
//    apart from the orbit count), has b0 = 1 and b2 = 1 (a connected closed surface) and b1 = 2 genus; the literature
//    values Klein's quartic (24 heptagons, |G| 168, genus 3) and Bring's surface (24 pentagons, |G| 120, genus 4), each
//    read off the homology; the duals, found by separate searches, agree: {3,7} has as many faces as {7,3} has vertices
//    and the same genus, {4,5} likewise against {5,4}. No independent Euler check exists here for {3,4,3,4}.
// G3 every r-ball equals the tiling's up to the systole >= 1 by counts, exact (the mismatch past it inside the complete
//    reference patch); and by ADJACENCY (G3i): from every centre (the centre 0 on the 4D quotients, whose automorphism
//    groups act transitively on cells: translations of the D4 torus, the frame group on the {3,4,3,4} docks) the
//    systole-ball is isomorphic to the tiling's by a map verified edge by edge, and some centre's next ball is not
//    (minor 17: the {3,4,3,4} frameSystole is gated exact here against the right-angled 24-cell group's ball); the loop
//    systole (G3l) from non-backtracking closed walks equals the count-derived one, and on the flat tori the lattice
//    value (min(a, b) for square and hexagon tori, 2 min(a, b) for triangle tori).
// G4 a greedy edge coloring splits every graph into matchings that cover each edge once (the partition schedule's
//    raw material); the color count is recorded.
// G5 two builds give identical tables.
//
// NEGATIVE CONTROLS (each must trip a gate): a 2 x 2 square torus (a directed edge twice), a triangle torus with one
// face reversed (orientation broken), Klein's quartic with two edges rewired (vertex degrees break, and its homology
// genus is read), the smallest simple {6,4} map in PGL(2,5) = S5 (simple, but its 1-balls are not the tiling's: systole
// 0, the reason the search asks for 1), the {3,4,3,4} level (sqrt 2)^3 of 32 docks (repeated neighbours); and, for the
// independent gates, a square torus with two edges crossed (same degrees, the adjacency and walk gates must reject
// it), two disjoint tori (b0 = 2) and a torus with one face removed (b2 = 0).
// POSITIVE CONTROL of the systole machinery: an L x L square torus has systole floor((L - 2) / 2) by hand (two cells r
// apart both ways along an axis meet when 2r >= L, and an extra edge closes when 2r + 1 >= L); a x b tori of all three
// flat kinds have the lattice loop systole by counts and by walks.
//
// Under keys 3 a cell is a tile (a dock), never a point. These quotients are instruments: the present is the whole
// infinite mesh, and a quotient holds its states that repeat under a group of symmetries.

import { rightAngledSpace, spaceBall } from '@/code/compute/lab/lazy-space'
import { tilingSystem } from '@/code/substrate/coxeter/chamber-tiling'
import { CosetGrowth } from '@/code/substrate/coxeter/small-roots'
import {
  REFERENCE_CELLS,
  analyzeMap,
  ballSystole,
  checkMatchings,
  closedQuotients,
  dartComplex,
  findRotaryMap,
  gf2Homology,
  hexagonTorus,
  honeycombQuotient3434,
  mapFromFaces,
  referenceTiling,
  rootedBall,
  rootedIsomorphism,
  rotaryMapSurvey,
  squareTorus,
  triangleTorus,
  walkLoopSystole,
  type CatalogEntry,
  type CellComplex,
  type FlatTorus,
} from '@/code/substrate/tiling-quotient'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

type Check = { name: string; ok: boolean }

// the primes whose PGL(2, m) holds elements of order 4 and 5 (4 and 5 divide m - 1, m, or m + 1), up to 41
const SURVEY_MODULI_4_5: readonly number[] = [5, 11, 19, 29, 31, 41]

// the search budget of one rooted isomorphism (the largest catalog search takes about 1,100 steps)
const ISOMORPHISM_BUDGET = 1_000_000
// the longest closed walk counted for the loop systole
const WALK_MAX_LENGTH = 16

// The adjacency gates of one cell graph against its tiling: every centre's r-ball isomorphic to the tiling's, some
// centre's (r + 1)-ball not, and the loop systole by walks.
type AdjacencyResult = {
  isomorphicCenters: number
  budgetStops: number
  nextIsomorphicCenters: number
  centers: number
  walkLoopSystole: number | null
  trustedLength: number
}

function adjacencyCheck(input: {
  neighbors: readonly (readonly number[])[]
  reference: readonly (readonly number[])[]
  degree: number
  radius: number
  centers: readonly number[]
}): AdjacencyResult {
  const { neighbors, reference, radius, centers } = input
  const refBall = rootedBall({ neighbors: reference, center: 0, radius })
  const refNext = rootedBall({ neighbors: reference, center: 0, radius: radius + 1 })

  let isomorphicCenters = 0
  let budgetStops = 0
  let nextIsomorphicCenters = 0

  for (const c of centers) {
    const own = rootedIsomorphism({
      first: refBall,
      second: rootedBall({ neighbors, center: c, radius }),
      budget: ISOMORPHISM_BUDGET,
    })
    const next = rootedIsomorphism({
      first: refNext,
      second: rootedBall({ neighbors, center: c, radius: radius + 1 }),
      budget: ISOMORPHISM_BUDGET,
    })

    isomorphicCenters += own.verdict === 'isomorphic' ? 1 : 0
    budgetStops += own.verdict === 'budget' || next.verdict === 'budget' ? 1 : 0
    nextIsomorphicCenters += next.verdict === 'isomorphic' ? 1 : 0
  }

  const walk = walkLoopSystole({
    neighbors,
    reference,
    referenceDegree: input.degree,
    maxLength: WALK_MAX_LENGTH,
    centers,
  })

  return {
    isomorphicCenters,
    budgetStops,
    nextIsomorphicCenters,
    centers: centers.length,
    walkLoopSystole: walk.loopSystole,
    trustedLength: walk.trustedLength,
  }
}

const adjacencyPasses = (a: AdjacencyResult, loopSystole: number | null): boolean =>
  a.budgetStops === 0 &&
  a.isomorphicCenters === a.centers &&
  a.nextIsomorphicCenters < a.centers &&
  loopSystole !== null &&
  a.walkLoopSystole === loopSystole

// the loop systole of a flat torus from its period lattice
function latticeLoopSystole(torus: FlatTorus): number {
  const [a, b] = torus.sides

  return torus.p === 3 ? 2 * Math.min(a, b) : Math.min(a, b)
}

function surfaceChecks(entry: CatalogEntry, reference: readonly (readonly number[])[]): {
  checks: Check[]
  adjacency: AdjacencyResult
} {
  const q = entry.quotient
  const checks: Check[] = []

  const add = (name: string, ok: boolean): void => {
    checks.push({ name: `${q.name}: ${name}`, ok })
  }

  const analysis = entry.rotary?.analysis ?? entry.torus?.analysis
  const map = entry.rotary?.map ?? entry.torus?.map

  if (analysis && map) {
    add('G1 surface gates', Object.values(analysis.gates).every(Boolean))
    add('G2 identity: integer genus', Number.isInteger(analysis.genus))
    add('G2 identity: counted euler is the catalog euler (one value)', analysis.euler === q.euler)

    const h = gf2Homology(dartComplex(map))

    add(`G2i GF(2) homology b0 1, b2 1, b1 2 genus (b0 ${h.b0}, b1 ${h.b1}, b2 ${h.b2})`, h.b0 === 1 && h.b2 === 1 && h.b1 === 2 * analysis.genus)
  }

  if (entry.rotary) {
    const { p, q: qq, groupOrder, relations } = entry.rotary

    add('G1 relations x^p = y^q = (xy)^2 = 1', relations.xOrder === p && relations.yOrder === qq && relations.xyOrder === 2)
    // chi = |G| (1/p + 1/q - 1/2), multiplied through by 2pq: follows from the orbit sizes (faces |G|/p, edges |G|/2,
    // vertices |G|/q) that G1 checks
    add('G2 identity: euler equals the group count', 2 * p * qq * analysis!.euler === groupOrder * (2 * qq + 2 * p - p * qq))
    add('G2 identity: hyperbolic genus >= 2', analysis!.genus >= 2)
  }

  if (entry.torus) {
    add('G1 orientation (each directed edge once, its reverse once)', entry.torus.orientation.directedOnce && entry.torus.orientation.reverseFound)
    add('G2 identity: flat genus 1', analysis!.euler === 0 && analysis!.genus === 1)
    add(`G3l lattice loop systole ${latticeLoopSystole(entry.torus)}`, q.loopSystole === latticeLoopSystole(entry.torus))
  }

  if (entry.honeycomb) {
    const h = entry.honeycomb

    add('G1 dock graph gates', h.gates.returnsExactly && h.gates.noSelfLoops && h.gates.distinctNeighbours)
    add('G2 base 24-cell has 96 edges and 96 triangles', h.baseEdges === 96 && h.baseTriangles === 96)
    add('G2 incidence classes 8 cells per edge, 4 per triangle', h.uniformIncidence)
    add('G2 identity: open euler equals the dock count (follows from the uniform incidence)', h.euler === h.docks)
  } else if (q.dimension === 4) {
    add('G1 D4 torus full degree 24, distinct', q.neighbors.every((row, c) => row.length === 24 && new Set(row).size === 24 && !row.includes(c)))
  }

  if (entry.systole) {
    add('G3 systole exact by counts (mismatch seen inside the reference patch)', !entry.systole.lowerBound)
  }

  add('G3 systole >= 1, not a lower bound', q.systole >= 1 && !q.systoleLowerBound)

  // the 4D quotients are cell-transitive (translations of the D4 torus, the frame group on the docks): centre 0 stands
  // for all; every 2D quotient is read from every centre
  const centers = q.dimension === 4 ? [0] : Array.from({ length: q.cells }, (_, c) => c)
  const adjacency = adjacencyCheck({ neighbors: q.neighbors, reference, degree: q.degree, radius: q.systole, centers })

  add(
    `G3i systole-ball isomorphic at ${adjacency.isomorphicCenters} of ${adjacency.centers} centres, next ball at ${adjacency.nextIsomorphicCenters}, budget stops ${adjacency.budgetStops}`,
    adjacency.budgetStops === 0 && adjacency.isomorphicCenters === adjacency.centers && adjacency.nextIsomorphicCenters < adjacency.centers,
  )

  add(
    `G3l loop systole by walks ${adjacency.walkLoopSystole} equals ${q.loopSystole} (walks trusted to length ${adjacency.trustedLength})`,
    q.loopSystole !== null && adjacency.walkLoopSystole === q.loopSystole,
  )

  const matching = checkMatchings(q.neighbors)

  add('G4 coloring into matchings covering every edge', matching.matchings && matching.covers)

  return { checks, adjacency }
}

function fingerprint(entries: CatalogEntry[]): string {
  return entries.map(e => `${e.quotient.name}:${e.quotient.neighbors.map(row => row.join(',')).join(';')}`).join('|')
}

// two complexes side by side (a disconnected "surface")
function disjointUnion(a: CellComplex, b: CellComplex): CellComplex {
  return {
    vertices: a.vertices + b.vertices,
    edges: [...a.edges, ...b.edges.map(([u, v]): [number, number] => [u + a.vertices, v + a.vertices])],
    faces: [...a.faces, ...b.faces.map(f => f.map(e => e + a.edges.length))],
  }
}

export function closedQuotientsRun(): Verdict {
  const log = (line: string): void => console.error(line)

  const entries = closedQuotients()
  const system3434 = tilingSystem([3, 4, 3, 4], 'tile')!
  const honeycombReference = spaceBall(rightAngledSpace({ name: system3434.name, coxeter: system3434.coxeter }), 3, 100_000)!.neighbors
  const references = new Map<string, number[][]>()

  const referenceOf = (symbol: readonly number[]): number[][] => {
    const key = symbol.join(',')

    let r = references.get(key)

    if (!r) {
      r = key === '3,4,3,4' ? honeycombReference : referenceTiling(symbol, key === '3,4,3,3' ? 20000 : REFERENCE_CELLS)
      references.set(key, r)
    }

    return r
  }

  const checks: Check[] = []
  const metrics: Record<string, number> = {}
  const byName = new Map(entries.map(e => [e.quotient.name, e]))

  for (const e of entries) {
    const q = e.quotient
    const own = surfaceChecks(e, referenceOf(q.symbol))
    const colors = checkMatchings(q.neighbors).colors

    checks.push(...own.checks)
    metrics[`${q.name}.cells`] = q.cells
    metrics[`${q.name}.degree`] = q.degree

    // a value not counted (genus of a 4-manifold, Euler characteristic of the D4 torus) is left out, never filled in
    if (q.genus !== null) {
      metrics[`${q.name}.genus`] = q.genus
    }

    if (q.euler !== null) {
      metrics[`${q.name}.euler`] = q.euler
    }

    metrics[`${q.name}.systole`] = q.systole
    metrics[`${q.name}.loopSystole`] = q.loopSystole ?? -1
    metrics[`${q.name}.isomorphicCenters`] = own.adjacency.isomorphicCenters
    metrics[`${q.name}.colors`] = colors
    log(`${q.name}: ${q.cells} cells, degree ${q.degree}, euler ${q.euler ?? 'not counted'}, genus ${q.genus ?? '-'}, systole ${q.systole}, loop systole ${q.loopSystole} (walks ${own.adjacency.walkLoopSystole}), ${colors} colors, partner ${q.partner ?? 'none'}; ${q.construction}`)

    // a partner has the same cell count and degree
    if (q.partner) {
      const partner = byName.get(q.partner)

      checks.push({
        name: `${q.name}: partner ${q.partner} has equal cells and degree`,
        ok: partner?.quotient.cells === q.cells && partner.quotient.degree === q.degree,
      })
    }
  }

  // the named surfaces, their genus read off the GF(2) homology, and the duals found by separate searches
  const bySymbol = (s: string): CatalogEntry | undefined => entries.find(e => e.quotient.symbol.join(',') === s)

  const homologyGenus = (e: CatalogEntry | undefined): number | null => {
    const map = e?.rotary?.map

    return map ? gf2Homology(dartComplex(map)).b1 / 2 : null
  }

  const klein = bySymbol('7,3')
  const bring = bySymbol('5,4')
  const kleinDual = bySymbol('3,7')
  const bringDual = bySymbol('4,5')

  checks.push({ name: 'G2i Klein quartic: 24 heptagons, |G| 168, homology genus 3', ok: klein?.quotient.cells === 24 && klein.rotary?.groupOrder === 168 && homologyGenus(klein) === 3 })
  checks.push({ name: 'G2i Bring surface: 24 pentagons, |G| 120, homology genus 4', ok: bring?.quotient.cells === 24 && bring.rotary?.groupOrder === 120 && homologyGenus(bring) === 4 })
  checks.push({ name: 'G2i dual of Klein: {3,7} has 56 faces (the {7,3} vertices), |G| 168, homology genus 3', ok: kleinDual?.quotient.cells === klein?.rotary?.analysis.vertices && kleinDual?.rotary?.groupOrder === 168 && homologyGenus(kleinDual) === 3 })
  checks.push({ name: 'G2i dual of Bring: {4,5} has 30 faces (the {5,4} vertices), |G| 120, homology genus 4', ok: bringDual?.quotient.cells === bring?.rotary?.analysis.vertices && bringDual?.rotary?.groupOrder === 120 && homologyGenus(bringDual) === 4 })
  checks.push({ name: 'every named symbol built', ok: ['7,3', '5,4', '8,3', '4,5', '6,4', '3,7', '3,4,3,4'].every(s => entries.some(e => e.quotient.symbol.join(',') === s)) })

  // G5
  const again = closedQuotients()

  checks.push({ name: 'G5 two builds identical', ok: fingerprint(entries) === fingerprint(again) })

  // ---- negative controls ----
  const negatives: Check[] = []
  const tiny = squareTorus(2, 2)

  negatives.push({ name: 'N1 2 x 2 square torus trips orientation', ok: !tiny.orientation.directedOnce })

  const triangle = triangleTorus(4, 7)
  const flipped = triangle.faceVertices.map((f, i) => (i === 0 ? [...f].reverse() : f))
  const flippedMap = mapFromFaces(flipped)

  negatives.push({ name: 'N2 one reversed face trips orientation', ok: !flippedMap.gates.directedOnce || !flippedMap.gates.reverseFound })

  let rewiredGenus = -1

  if (klein?.rotary) {
    const mate = Int32Array.from(klein.rotary.map.edgeMate)
    const d1 = 0
    const e1 = mate[d1]!
    const d2 = Math.floor(mate.length / 2) === e1 ? Math.floor(mate.length / 2) + 1 : Math.floor(mate.length / 2)
    const e2 = mate[d2]!

    mate[d1] = d2
    mate[d2] = d1
    mate[e1] = e2
    mate[e2] = e1

    const rewiredMap = { faceNext: klein.rotary.map.faceNext, edgeMate: mate }
    const rewired = analyzeMap(rewiredMap, 7, 3)
    const h = gf2Homology(dartComplex(rewiredMap))

    rewiredGenus = h.b0 === 1 && h.b2 === 1 ? h.b1 / 2 : -1
    negatives.push({ name: 'N3 two rewired edges trip a surface gate', ok: !Object.values(rewired.gates).every(Boolean) })
    negatives.push({ name: `N3h two rewired edges change the homology genus (${rewiredGenus}, Klein's is 3)`, ok: rewiredGenus !== 3 })
  } else {
    negatives.push({ name: 'N3 two rewired edges trip a surface gate', ok: false })
  }

  metrics['control.rewired-klein.homologyGenus'] = rewiredGenus

  const s5 = findRotaryMap({ p: 6, q: 4, moduli: [5] })
  const s5Systole = s5
    ? ballSystole({ neighbors: s5.analysis.neighbors, reference: referenceTiling([6, 4], 2000), referenceDegree: 6, maxRadius: 2 }).systole
    : -2

  negatives.push({ name: 'N4 simple {6,4} map in S5 has systole 0', ok: s5 !== null && s5.groupOrder === 120 && s5Systole === 0 })
  metrics['control.s5-6-4.systole'] = s5Systole

  const small = honeycombQuotient3434({ twoPower: 3, maxDocks: 20000 })

  negatives.push({ name: 'N5 {3,4,3,4} level 3 trips distinct neighbours', ok: small !== null && small.docks === 32 && !small.gates.distinctNeighbours })

  // N6: a 6 x 7 square torus with the edges a-b and c-d crossed into a-d and c-b, far apart: every degree stays 4, and
  // the adjacency gates (the torus's own systole 2 and loop systole 6) must reject it
  const square = referenceTiling([4, 4], 6000)
  const base67 = squareTorus(6, 7)
  const crossed = base67.analysis.neighbors.map(row => [...row])
  const ea = 0
  const eb = crossed[ea]![0]!
  const ec = 3 * 7 + 3
  const ed = crossed[ec]![0]!

  const swap = (row: number[], from: number, to: number): void => {
    row[row.indexOf(from)] = to
  }

  swap(crossed[ea]!, eb, ed)
  swap(crossed[eb]!, ea, ec)
  swap(crossed[ec]!, ed, eb)
  swap(crossed[ed]!, ec, ea)

  const base67Systole = ballSystole({ neighbors: base67.analysis.neighbors, reference: square, referenceDegree: 4 })
  const crossedAdjacency = adjacencyCheck({
    neighbors: crossed,
    reference: square,
    degree: 4,
    radius: base67Systole.systole,
    centers: Array.from({ length: crossed.length }, (_, c) => c),
  })
  const base67Adjacency = adjacencyCheck({
    neighbors: base67.analysis.neighbors,
    reference: square,
    degree: 4,
    radius: base67Systole.systole,
    centers: Array.from({ length: crossed.length }, (_, c) => c),
  })

  negatives.push({ name: `N6 control: the uncrossed 6 x 7 torus passes the adjacency gates (systole ${base67Systole.systole}, loop ${base67Systole.loopSystole})`, ok: adjacencyPasses(base67Adjacency, base67Systole.loopSystole) && base67Systole.loopSystole === 6 })
  negatives.push({ name: `N6 crossed edges: isomorphic at ${crossedAdjacency.isomorphicCenters} of ${crossedAdjacency.centers} centres, walk loop ${crossedAdjacency.walkLoopSystole}; the adjacency gates reject it`, ok: !adjacencyPasses(crossedAdjacency, base67Systole.loopSystole) && crossedAdjacency.isomorphicCenters < crossedAdjacency.centers })
  metrics['control.crossed-torus.isomorphicCenters'] = crossedAdjacency.isomorphicCenters
  metrics['control.crossed-torus.walkLoopSystole'] = crossedAdjacency.walkLoopSystole ?? -1

  // N7, N8: complexes that are not one closed surface
  const torusComplex = dartComplex(squareTorus(5, 6).map)
  const two = gf2Homology(disjointUnion(torusComplex, torusComplex))
  const holed = gf2Homology({ ...torusComplex, faces: torusComplex.faces.slice(1) })

  negatives.push({ name: `N7 two disjoint tori: b0 ${two.b0}, not 1`, ok: two.b0 === 2 })
  negatives.push({ name: `N8 torus with a face removed: b2 ${holed.b2}, not 1`, ok: holed.b2 === 0 })

  // ---- positive controls of the systole machinery ----
  for (const L of [5, 6, 9, 10]) {
    const torus = squareTorus(L, L)
    const s = ballSystole({ neighbors: torus.analysis.neighbors, reference: square, referenceDegree: 4 })
    const predicted = Math.floor((L - 2) / 2)

    metrics[`control.square-${L}.systole`] = s.systole
    negatives.push({ name: `P1 square torus ${L} x ${L} systole ${s.systole} = floor((L - 2) / 2) = ${predicted}`, ok: s.systole === predicted && !s.lowerBound })
  }

  // P2: a x b tori of every flat kind, loop systole by counts and by walks against the lattice value
  const flatTori: FlatTorus[] = [squareTorus(5, 8), squareTorus(7, 4), triangleTorus(3, 5), triangleTorus(5, 4), hexagonTorus(4, 7), hexagonTorus(9, 5)]

  for (const torus of flatTori) {
    const reference = referenceOf([torus.p, torus.q])
    const counts = ballSystole({ neighbors: torus.analysis.neighbors, reference, referenceDegree: torus.p })
    const walks = walkLoopSystole({ neighbors: torus.analysis.neighbors, reference, referenceDegree: torus.p, maxLength: WALK_MAX_LENGTH })
    const predicted = latticeLoopSystole(torus)

    negatives.push({
      name: `P2 {${torus.p},${torus.q}} torus ${torus.sides.join(' x ')} loop systole ${counts.loopSystole} by counts, ${walks.loopSystole} by walks, ${predicted} by the lattice`,
      ok: counts.loopSystole === predicted && walks.loopSystole === predicted,
    })
  }

  // ---- how far a {4,5} quotient's loop systole reaches ----
  //
  // The closed {4,5} full swap of E-CMP-0027 reads only on a quotient whose loop systole L exceeds 2 c T (c = 5 colors
  // of its greedy coloring, T = 24 rounds), so a mover cannot pass L / 2. Every r-ball of a quotient with injectivity
  // radius r embeds, and L <= 2r + 3, so L > 2 c T needs r >= c T - 1 and at least |B(c T - 1)| cells: the exact tile
  // count of that ball of the {4,5} tiling (CosetGrowth, the small-root automaton). The survey lists every {4,5} regular
  // map in PGL(2, m) over the stated primes with its L, and each must satisfy the same inequality cells >= |B(r)|.
  const survey = rotaryMapSurvey({ p: 4, q: 5, moduli: SURVEY_MODULI_4_5, reference: referenceTiling([4, 5], 15_000) })
  const growth45 = new CosetGrowth({ p: 4, q: 5 })

  const ball45 = (r: number): bigint => {
    let total = 0n

    for (let d = 0; d <= r; d++) {
      total += growth45.shell(d)
    }

    return total
  }

  const needRadius = 5 * 24 - 1
  const needCells = ball45(needRadius)
  const surveyMax = Math.max(...survey.map(s => s.loopSystole ?? -1))

  checks.push({
    name: `S1 {4,5} regular maps in PGL(2, m), m in ${SURVEY_MODULI_4_5.join(', ')}: ${survey.length} distinct, loop systoles ${survey.map(s => `${s.loopSystole} (${s.cells} cells)`).join(', ')}; each has cells >= |B(r)|`,
    ok: survey.length > 0 && survey.every(s => !s.lowerBound && s.loopSystole !== null && BigInt(s.cells) >= ball45(s.systole)),
  })

  checks.push({
    name: `S2 a {4,5} quotient with L > 2 c T = 240 needs r >= ${needRadius} and at least |B(${needRadius})| = ${needCells} cells; the largest surveyed L is ${surveyMax}`,
    ok: surveyMax > 0 && surveyMax <= 240 && needCells > 10n ** 40n,
  })
  metrics['survey45.maps'] = survey.length
  metrics['survey45.maxLoopSystole'] = surveyMax
  metrics['survey45.needRadius'] = needRadius
  metrics['survey45.needCellsLog10'] = needCells.toString().length - 1

  const failed = [...checks, ...negatives].filter(c => !c.ok)

  for (const c of failed) {
    log(`FAILED ${c.name}`)
  }

  metrics.gates = checks.length
  metrics.controls = negatives.length
  metrics.failed = failed.length

  const summary = entries
    .map(e => `${e.quotient.name} (${e.quotient.cells} cells, ${e.quotient.genus !== null ? `genus ${e.quotient.genus}` : `euler ${e.quotient.euler ?? 'not counted'}`}, systole ${e.quotient.systole}, loop systole ${e.quotient.loopSystole})`)
    .join('; ')

  return verdict({
    status: failed.length === 0 ? 'pass' : 'fail',
    claim: `closed boundary-free quotients for the M1 lab, every cell at full degree, the surfaces' genus read by GF(2) homology and matching the literature and the separately found duals, every r-ball isomorphic to the tiling's up to the systole by a map verified edge by edge, the loop systole by closed walks, and each split into matchings: ${summary}`,
    metrics,
    control: {
      squareSystole5: metrics['control.square-5.systole']!,
      squareSystole10: metrics['control.square-10.systole']!,
      s5Systole,
      negativesTripped: negatives.filter(c => c.ok).length,
    },
    notes:
      'L1 (an instrument, exact integers). Hyperbolic surfaces are regular maps of (2,p,q) rotation groups found in PGL(2, m), the smallest with a simple cell graph and tiling-like 1-balls at the first modulus that has one. The systole is the radius to which every ball looks like the infinite tiling, an injectivity radius; the loop systole is the shortest non-contractible closed walk. Identities of the construction (catalog Euler is the counted Euler, Euler equals the group count, the {3,4,3,4} open Euler equals the dock count) are kept as consistency checks only; the independent checks are the GF(2) homology, the literature surfaces and their separately found duals, the rooted ball isomorphisms (edge by edge, every centre on the 2D quotients, centre 0 on the cell-transitive 4D ones) and the walk loop systole. No independent Euler check exists here for {3,4,3,4}. The D4 torus Euler characteristic is not counted (0 for a flat 4-torus). Small systoles are the price of small quotients: Klein quartic and Bring surface reach only radius 1 (loop systole 4).',
  })
}

export default experiment({
  id: 'computation/closed-quotients',
  code: 'E-CMP-0024',
  title:
    'closed quotients for the M1 lab: Klein quartic {7,3}, Bring surface {5,4}, {8,3} and the degree-matched {4,5}, {6,4}, {3,7} as regular maps in PGL(2, m), flat tori of equal size and degree, and {3,4,3,4} congruence quotients under 20,000 docks with the flat D4 torus: full degree, GF(2) homology, ball isomorphism and loop systole against the tiling, matchings',
  category: 'computation',
  substrates: ['73', '54', '83', '45', '64', '37', '44', '36', '63', '3434', '3433'],
  depth: 'L1',
  paper: false,
  run() {
    return closedQuotientsRun()
  },
})
