// Exact hyperbolic tile balls for the computation lab (item vibe-computation-models-0027, decision 003 of
// vibe/computation/models). buildCellGraph places tiles by floating-point positions and stops near 15,000 cells, which
// held the hyperbolic open windows of E-CMP-0027 to radius 2 ({3,4,3,4}) to 15 ({3,7}). chamber-tiling.ts builds the
// same tile graphs from the Coxeter group alone (integer chamber ids, the Coxeter matrix, no coordinates), lazily, to
// any radius memory allows. This experiment proves those balls exact before the lab uses them.
//
// Gates, each able to fail:
// - every Coxeter system of every hyperbolic lab tiling ('tile', 'sector', 'chamber') builds chamber shells equal to
//   Steinberg's growth series of its own Coxeter matrix (system-growth.ts, a closed formula that never builds the
//   group), word length by word length; on the linear 'chamber' systems system-growth.ts also equals coxeter-growth.ts.
// - where a tiling has two or three systems, their tile balls are isomorphic (origin to origin) and have equal shells:
//   independent constructions of one graph.
// - every exact ball is isomorphic to the float ball of the same radius wherever the float build holds one (radius 7
//   for {5,4} and {7,3}, 5 for {8,3} and {6,4}, 8 for {4,5}, 15 for {3,7}, 2 for {3,4,3,4}).
// - {3,4,3,4}: the right-angled 24-cell group gives shells 1, 24, 456, 8376, 153192 to radius 4, equal to its Steinberg
//   series, and its radius-3 ball is isomorphic to the Z[sqrt 2] construction of exact-3434.ts (slot a of a cell at
//   depth d is generator a for even d and opposite(a) for odd d, since exact-3434 steps by k_a = F_a Z).
// - large balls (the largest under 400,000 tiles per tiling): interior tiles have degree p, edges are symmetric with no
//   repeats, and the tile shells equal the tile group's Steinberg series where the tiles are chambers ({5,4}, {6,4},
//   {3,4,3,4}), elsewhere satisfy one short linear recurrence fixed by the first terms that predicts every later term.
// Isomorphisms are found through rotation systems (2D; the float side's from its positions) or slot labels (4D) and are
// proven only by the verified map, an edge-preserving bijection.
// - the lab adapter's exact option returns those balls, throws past maxCells, and two fresh builds give identical
//   adjacency.
// Negative controls the gates must reject: a complex with the residue walk of one generator pair dropped (duplicate
// chambers), the {5,6} tile group against the float {5,4} (same degree, other tiling), a degree-preserving edge swap in
// an exact ball, an ask over maxCells, and a series with its last term changed by one.

import {
  type BallIsomorphism,
  graphMatches,
  labeledIsomorphism,
  rotationFromPositions,
  rotationIsomorphism,
} from '@/code/substrate/ball-isomorphism'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import {
  ChamberComplex,
  TileBallTooLarge,
  clearChamberComplexes,
  exactTileBall,
  tilingSystem,
  type SystemKind,
} from '@/code/substrate/coxeter/chamber-tiling'
import {
  coxeterGrowthSeries,
  expandSeries,
} from '@/code/substrate/coxeter/coxeter-growth'
import {
  buildExactBall,
  exactCell,
} from '@/code/substrate/coxeter/exact-3434'
import {
  fitRecurrence,
  systemGrowthSeries,
} from '@/code/substrate/coxeter/system-growth'
import {
  LAB_GEOMETRIES,
  LabGeometryName,
  labGeometry,
} from '@/code/substrate/lab-geometry'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const KINDS: readonly SystemKind[] = ['tile', 'sector', 'chamber']

// the largest radius the float build holds whole (E-CMP-0027's old windows)
const FLOAT_RADIUS: Partial<Record<LabGeometryName, number>> = {
  '{5,4}': 7,
  '{7,3}': 7,
  '{8,3}': 5,
  '{3,4,3,4}': 2,
  '{4,5}': 8,
  '{6,4}': 5,
  '{3,7}': 15,
}

// radius at which the systems of one tiling are compared (the slowest system stays under a few million chambers)
const CROSS_RADIUS: Partial<Record<LabGeometryName, number>> = {
  '{5,4}': 8,
  '{8,3}': 6,
  '{4,5}': 10,
  '{6,4}': 6,
}

// a large ball: the largest radius whose ball holds at most this many tiles
const LARGE_TILES = 400_000
const RECURRENCE_MAX_ORDER = 6
const RECURRENCE_MIN_PREDICTED = 4
const THREE_FOUR_SHELLS = [1, 24, 456, 8376, 153192]

const tagOf = (name: string): string =>
  name.replace(/[{}]/g, '').replace(/,/g, '-')

function degreesAndSymmetry(
  neighbors: readonly (readonly number[])[],
  distance: Int32Array,
  radius: number,
  degree: number,
): boolean {
  for (let u = 0; u < neighbors.length; u++) {
    const row = neighbors[u]!

    if (new Set(row).size !== row.length || row.includes(u)) {
      return false
    }

    if (row.length > degree || (distance[u]! < radius && row.length !== degree)) {
      return false
    }

    for (const v of row) {
      if (!neighbors[v]!.includes(u)) {
        return false
      }
    }
  }

  return true
}

// The float reference ball with its positions: buildCellGraph under the lab's cap, cut breadth-first exactly as the lab
// adapter cuts it (the experiment checks the two agree row for row), and its rotation system from the positions.
function floatBall(
  symbol: readonly number[],
  radius: number,
): { neighbors: number[][]; rotation: number[][] } {
  const raw = buildCellGraph({ symbol: [...symbol], maxCells: 15_000 })
  const distance = new Int32Array(raw.cellCount).fill(-1)
  const order = [0]

  distance[0] = 0

  for (const u of order) {
    if (distance[u]! >= radius) {
      continue
    }

    for (const w of raw.neighbors[u]!) {
      if (distance[w] === -1) {
        distance[w] = distance[u]! + 1
        order.push(w)
      }
    }
  }

  const index = new Int32Array(raw.cellCount).fill(-1)

  order.forEach((u, i) => {
    index[u] = i
  })

  const neighbors = order.map(u =>
    raw.neighbors[u]!.filter(w => index[w]! >= 0).map(w => index[w]!),
  )
  const positions = order.map(u => raw.coords[u]!)

  return { neighbors, rotation: rotationFromPositions(positions, neighbors) }
}

// The {3,4,3,4} ball of the right-angled 24-cell group, slot-labelled by its generators, against the float build,
// slot-labelled by its face reflections. The float face reflections are the reflections in the base cell's 24 facets,
// so they generate the same right-angled group; the slot rule is a match tau of the two facet labellings by which
// pairs commute (read for the float build from its own table: faces i, j commute when the two-step paths i j and j i
// from the origin end at one cell). Any such match is a group isomorphism, so the first one is propagated.
function honeycombAgainstFloat(radius: number): BallIsomorphism {
  const system = tilingSystem([3, 4, 3, 4], 'tile')!
  const complex = new ChamberComplex({ system })
  const ball = complex.tileBall({ radius })
  const mine = complex.slotTable(ball)
  const raw = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells: 15_000 })
  const faces = raw.faceNeighbor!
  const slots = 24
  const distance = new Int32Array(raw.cellCount).fill(-1)
  const order = [0]

  distance[0] = 0

  for (const u of order) {
    if (distance[u]! >= radius) {
      continue
    }

    for (const w of raw.neighbors[u]!) {
      if (distance[w] === -1) {
        distance[w] = distance[u]! + 1
        order.push(w)
      }
    }
  }

  const index = new Int32Array(raw.cellCount).fill(-1)

  order.forEach((u, i) => {
    index[u] = i
  })

  const float = new Int32Array(order.length * slots).fill(-1)

  order.forEach((u, i) => {
    for (let f = 0; f < slots; f++) {
      const v = faces[u]![f]!

      float[i * slots + f] = v >= 0 ? index[v]! : -1
    }
  })

  const floatCommute = Array.from({ length: slots }, (_, i) =>
    Array.from({ length: slots }, (_, j) => {
      const viaI = faces[faces[0]![i]!]![j]!
      const viaJ = faces[faces[0]![j]!]![i]!

      return i !== j && viaI >= 0 && viaI === viaJ
    }),
  )
  const mineCommute = system.coxeter.map(row => row.map(m => m === 2))
  const [tau] = graphMatches({ first: floatCommute, second: mineCommute, limit: 1 })

  if (!tau) {
    return {
      verdict: 'different',
      mapping: null,
      branches: 0,
      reason: 'no facet match commutes alike',
    }
  }

  return labeledIsomorphism({
    first: float,
    second: mine,
    slots,
    relabel: a => tau[a]!,
  })
}

export default experiment({
  id: 'computation/exact-tiling',
  code: 'E-CMP-0029',
  title:
    'exact hyperbolic tile balls from the Coxeter group alone: chamber shells equal Steinberg series, independent Coxeter systems and the float build give isomorphic balls, {3,4,3,4} shells 1, 24, 456, 8376, 153192, and balls of 90,000 to 400,000 tiles with no floating point in the adjacency',
  category: 'computation',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const control: Record<string, number> = {}
    const failures: string[] = []
    const hyperbolic = LAB_GEOMETRIES.filter(g => g.curvature === 'hyperbolic')

    for (const spec of hyperbolic) {
      const tag = tagOf(spec.name)

      // ---- Steinberg: every system's chamber shells, at the cross radius or radius 4 ----
      const balls = new Map<SystemKind, { neighbors: number[][]; shells: number[] }>()

      for (const kind of KINDS) {
        const system = tilingSystem(spec.symbol, kind)

        if (!system) {
          continue
        }

        const complex = new ChamberComplex({ system })
        const radius = CROSS_RADIUS[spec.name] ?? 4
        const ball = complex.tileBall({ radius })
        const shells = complex.chamberShells()
        const steinberg = systemGrowthSeries(system.coxeter, shells.length)

        if (shells.some((x, i) => BigInt(x) !== steinberg[i])) {
          failures.push(`${system.name}: chamber shells leave the Steinberg series`)
        }

        if (kind === 'chamber') {
          const linear = expandSeries(
            coxeterGrowthSeries([...spec.symbol]),
            shells.length,
          )

          if (linear.some((x, i) => x !== steinberg[i])) {
            failures.push(`${system.name}: system-growth disagrees with coxeter-growth`)
          }
        }

        balls.set(kind, { neighbors: ball.neighbors, shells: ball.shellSizes })
        metrics[`${tag}${kind}Chambers`] = complex.chamberCount
        metrics[`${tag}${kind}WordLength`] = complex.top
        metrics[`${tag}${kind}TileOrder`] = complex.tileOrder
      }

      // ---- independent systems agree ----
      const kinds = [...balls.keys()]

      for (let i = 1; i < kinds.length; i++) {
        const x = balls.get(kinds[0]!)!
        const y = balls.get(kinds[i]!)!
        // 2D exact balls list neighbours as rotation systems already
        const same = rotationIsomorphism({
          first: x.neighbors,
          firstRotation: x.neighbors,
          second: y.neighbors,
          secondRotation: y.neighbors,
          degree: spec.degree,
        })

        if (x.shells.join(',') !== y.shells.join(',') || same.verdict !== 'isomorphic') {
          failures.push(`${spec.name}: ${kinds[0]} and ${kinds[i]} differ (${same.reason})`)
        }
      }

      metrics[`${tag}Systems`] = kinds.length

      // ---- the float build, where it holds a ball ----
      const floatRadius = FLOAT_RADIUS[spec.name]!
      const float = labGeometry({
        name: spec.name,
        boundary: 'openBall',
        radius: floatRadius,
      })
      const exact = labGeometry({
        name: spec.name,
        boundary: 'openBall',
        radius: floatRadius,
        exact: true,
      })
      // the lab's graphs sort each row; the tile ball keeps the rotation system, and must be the same graph
      const sorted = (rows: readonly (readonly number[] | Uint32Array)[]): string[] =>
        rows.map(row => [...row].sort((x, y) => x - y).join(','))
      const tiles = exactTileBall({ symbol: spec.symbol, radius: floatRadius })

      if (sorted(tiles.neighbors).join(';') !== sorted(exact.graph.neighbors).join(';')) {
        failures.push(`${spec.name}: the lab's exact ball is not the tile ball`)
      }

      let iso: BallIsomorphism

      if (spec.dimension === 2) {
        const reference = floatBall(spec.symbol, floatRadius)

        if (sorted(reference.neighbors).join(';') !== sorted(float.graph.neighbors).join(';')) {
          failures.push(`${spec.name}: the float reference is not the lab's float ball`)
        }

        iso = rotationIsomorphism({
          first: tiles.neighbors,
          firstRotation: tiles.neighbors,
          second: reference.neighbors,
          secondRotation: reference.rotation,
          degree: spec.degree,
        })
      } else {
        iso = honeycombAgainstFloat(floatRadius)
      }

      if (iso.verdict !== 'isomorphic') {
        failures.push(`${spec.name}: exact and float balls of radius ${floatRadius} are ${iso.verdict} (${iso.reason})`)
      }

      metrics[`${tag}FloatRadius`] = floatRadius
      metrics[`${tag}FloatCells`] = float.graph.size
      metrics[`${tag}FloatBranches`] = iso.branches

      // ---- a large ball: degree, symmetry, recurrence ----
      let radius = 1
      let large = exactTileBall({ symbol: spec.symbol, radius })

      for (;;) {
        try {
          large = exactTileBall({ symbol: spec.symbol, radius: radius + 1, maxCells: LARGE_TILES })
          radius++
        } catch (error) {
          if (!(error instanceof TileBallTooLarge)) {
            throw error
          }

          break
        }
      }

      if (!degreesAndSymmetry(large.neighbors, large.distance, radius, spec.degree)) {
        failures.push(`${spec.name}: the radius-${radius} ball breaks degree or symmetry`)
      }

      const series = large.shellSizes.map(BigInt)
      const recurrence = fitRecurrence({
        series,
        maxOrder: RECURRENCE_MAX_ORDER,
        minPredicted: RECURRENCE_MIN_PREDICTED,
      })

      // where the tiles are the chambers, the tile shells ARE the Steinberg series; elsewhere the recurrence must hold
      const tileSystem = tilingSystem(spec.symbol, 'tile')

      if (!recurrence && !tileSystem) {
        failures.push(`${spec.name}: no recurrence of order <= ${RECURRENCE_MAX_ORDER} predicts the shells`)
      }

      if (tileSystem) {
        const steinberg = systemGrowthSeries(tileSystem.coxeter, series.length)

        if (series.some((x, i) => x !== steinberg[i])) {
          failures.push(`${spec.name}: tile shells leave the tile group's Steinberg series`)
        }
      }

      metrics[`${tag}LargeRadius`] = radius
      metrics[`${tag}LargeTiles`] = large.neighbors.length
      metrics[`${tag}LargeLastShell`] = large.shellSizes[radius]!
      metrics[`${tag}LargeChambers`] = large.chambers
      metrics[`${tag}RecurrenceOrder`] = recurrence?.order ?? -1
      metrics[`${tag}RecurrencePredicted`] = recurrence?.predicted ?? 0

      clearChamberComplexes()
    }

    // ---- {3,4,3,4}: closed-form shells and the Z[sqrt 2] construction ----
    const tileGroup = tilingSystem([3, 4, 3, 4], 'tile')!
    const honeycomb = exactTileBall({ symbol: [3, 4, 3, 4], radius: 4 })
    const honeycombSteinberg = systemGrowthSeries(tileGroup.coxeter, 5).map(Number)

    if (
      honeycomb.shellSizes.join(',') !== THREE_FOUR_SHELLS.join(',') ||
      honeycombSteinberg.join(',') !== THREE_FOUR_SHELLS.join(',')
    ) {
      failures.push(`{3,4,3,4}: shells ${honeycomb.shellSizes.join(',')}, Steinberg ${honeycombSteinberg.join(',')}`)
    }

    // exact-3434 steps by k_a = F_a Z (the facet reflection, then the cell's point inversion Z), so a cell found at
    // depth d holds the frame w Z^d, w in the right-angled group, and Z F_a Z = F_opposite(a): its slot a is the
    // group's generator a at even depth and opposite(a) at odd depth
    const algebraic = buildExactBall({ radius: 3 })
    const opposite = exactCell().opposite
    const honeycombComplex = new ChamberComplex({ system: tileGroup })
    const honeycombThree = honeycombComplex.tileBall({ radius: 3 })
    const againstAlgebraic = labeledIsomorphism({
      first: algebraic.table,
      second: honeycombComplex.slotTable(honeycombThree),
      slots: 24,
      relabel: (a, depth) => (depth % 2 === 1 ? opposite[a]! : a),
    })

    if (againstAlgebraic.verdict !== 'isomorphic' || algebraic.inconsistentSteps !== 0) {
      failures.push(`{3,4,3,4}: the radius-3 ball against exact-3434 is ${againstAlgebraic.verdict}`)
    }

    metrics.honeycombShell4 = honeycomb.shellSizes[4]!
    metrics.honeycombAlgebraicCells = algebraic.cells

    // ---- the lab adapter: exact option, cap, determinism ----
    const adapter = labGeometry({
      name: '{5,4}',
      boundary: 'openBall',
      radius: 10,
      exact: true,
      maxCells: 90_000,
    })

    clearChamberComplexes()

    const again = labGeometry({
      name: '{5,4}',
      boundary: 'openBall',
      radius: 10,
      exact: true,
    })
    const identical = adapter.graph.neighbors.every(
      (row, u) => row.join(',') === again.graph.neighbors[u]!.join(','),
    )

    if (!identical || adapter.graph.size !== again.graph.size) {
      failures.push('{5,4}: two fresh exact builds differ')
    }

    metrics.adapterCells = adapter.graph.size

    // ---- negative controls ----
    // N1: drop the residue walk of one pair: duplicate chambers must be caught (a throw or a Steinberg mismatch)
    let brokenCaught = false

    try {
      const broken = new ChamberComplex({
        system: tilingSystem([7, 3], 'chamber')!,
        skipPair: [1, 2],
      })

      broken.tileBall({ radius: 4, maxCells: 100_000 })

      const shells = broken.chamberShells()
      const steinberg = systemGrowthSeries(broken.system.coxeter, shells.length)

      brokenCaught = shells.some((x, i) => BigInt(x) !== steinberg[i])
    } catch {
      brokenCaught = true
    }

    control.brokenClosureCaught = brokenCaught ? 1 : 0

    // N2: another tiling of the same degree, the {5,6} tile group, against the float {5,4}
    const otherTiling = new ChamberComplex({ system: tilingSystem([5, 6], 'tile')! })
    const floatFiveFour = floatBall([5, 4], 5)
    const otherBall = otherTiling.tileBall({ radius: 5 }).neighbors
    const otherVerdict = rotationIsomorphism({
      first: otherBall,
      firstRotation: otherBall,
      second: floatFiveFour.neighbors,
      secondRotation: floatFiveFour.rotation,
      degree: 5,
    }).verdict

    control.otherTilingRejected = otherVerdict === 'different' ? 1 : 0

    // N3: a degree-preserving edge swap in the exact {5,4} ball of radius 5 (two far edges a-b, c-d become a-d, c-b)
    const exactFiveFour = exactTileBall({ symbol: [5, 4], radius: 5 })
    const swapped = exactFiveFour.neighbors.map(row => [...row])
    const n = swapped.length
    const a = 1
    const b = swapped[a]!.find(v => v > a)!
    const c = n - 1
    const d = swapped[c]!.find(v => v !== a && v !== b && !swapped[a]!.includes(v) && !swapped[b]!.includes(v))!

    const replace = (u: number, from: number, to: number): void => {
      swapped[u] = swapped[u]!.map(v => (v === from ? to : v))
    }

    replace(a, b, d)
    replace(d, c, a)
    replace(c, d, b)
    replace(b, a, c)

    const swapVerdict = rotationIsomorphism({
      first: swapped,
      firstRotation: swapped,
      second: floatFiveFour.neighbors,
      secondRotation: floatFiveFour.rotation,
      degree: 5,
    }).verdict
    // and the unswapped ball passes the same test (the control is not rejecting everything)
    const unswappedVerdict = rotationIsomorphism({
      first: exactFiveFour.neighbors,
      firstRotation: exactFiveFour.neighbors,
      second: floatFiveFour.neighbors,
      secondRotation: floatFiveFour.rotation,
      degree: 5,
    }).verdict

    if (unswappedVerdict !== 'isomorphic') {
      failures.push('{5,4}: the unswapped radius-5 ball is not isomorphic to the float one')
    }

    control.edgeSwapRejected = swapVerdict === 'different' ? 1 : 0

    // N4: an ask over maxCells throws
    let capThrows = false

    try {
      labGeometry({ name: '{8,3}', boundary: 'openBall', radius: 8, exact: true, maxCells: 90_000 })
    } catch (error) {
      capThrows = error instanceof TileBallTooLarge
    }

    control.capThrows = capThrows ? 1 : 0

    // N5: the recurrence check rejects a series with its last term off by one
    const fiveFour = exactTileBall({ symbol: [5, 4], radius: 10 }).shellSizes.map(BigInt)
    const perturbed = [...fiveFour.slice(0, -1), fiveFour[fiveFour.length - 1]! + 1n]
    const perturbedFit = fitRecurrence({
      series: perturbed,
      maxOrder: RECURRENCE_MAX_ORDER,
      minPredicted: RECURRENCE_MIN_PREDICTED,
    })

    control.perturbedSeriesRejected = perturbedFit === null ? 1 : 0

    clearChamberComplexes()

    for (const [name, value] of Object.entries(control)) {
      if (value !== 1) {
        failures.push(`control ${name} not rejected`)
      }
    }

    metrics.failures = failures.length

    const ok = failures.length === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the hyperbolic lab tilings {5,4}, {7,3}, {8,3}, {4,5}, {6,4}, {3,7} and {3,4,3,4} build exactly from their Coxeter groups with no floating point: chamber shells equal Steinberg series, two or three independent Coxeter systems of one tiling give isomorphic balls, every exact ball is isomorphic to the float ball where the float build holds one, {3,4,3,4} has shells 1, 24, 456, 8376, 153192 and its radius-3 ball equals the Z[sqrt 2] construction, and the largest balls under 400,000 tiles (radius 12, 11, 8, 13, 9, 24, 4 in that order) keep degree p inside, with shells equal to the tile group Steinberg series ({5,4}, {6,4}, {3,4,3,4}) or predicted exactly by one short linear recurrence fixed by the first terms ({7,3}, {8,3}, {4,5}, {3,7})',
      metrics,
      control,
      notes:
        `L2 infrastructure gate (decision 003 of vibe/computation/models): hyperbolic open windows of the M1 harness come from these balls. The 'tile' systems ({5,4}, {6,4}: right-angled polygon groups; {3,4,3,4}: the right-angled 24-cell) make word length equal to facet distance, so nothing is built outside the ball; 'sector' and 'chamber' systems build extra chambers beyond it (counted in the chamber metrics). Steinberg's formula and the isomorphism tests are independent of the construction; the recurrence is a consistency check, not a proof of the series for {7,3}, {8,3}, {4,5} and {3,7}. ${ok ? '' : `Failures: ${failures.slice(0, 8).join('; ')}`}`.trim(),
    })
  },
})
