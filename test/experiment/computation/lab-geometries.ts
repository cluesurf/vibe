// The computation lab's twelve geometries, gated before any rule runs on them (plan M1-B, decision 001). A cell is a
// tile, so a {p,q} cell has p neighbors. Eight geometries are the ones the sources name (the line, {4,4}, {6,3},
// {3,6}, {5,4}, {7,3}, {8,3}, {3,4,3,4}); four are added so curvature is never confounded with degree: {4,5} against
// {4,4}, {6,4} against {6,3}, {3,7} against {3,6} and the flat D4 honeycomb {3,4,3,3} against {3,4,3,4}.
//
// Gates, each able to fail:
// - shells: every flat geometry meets its exact closed form (line 2, {4,4} 4r, {6,3} 6r, {3,6} 3r, D4 16r^3 + 8r)
//   and stays under the polynomial bound |S(1)| r^(d-1); every hyperbolic one breaks that bound at its last shell
//   and grows by at least 2 every two shells over its last three; {3,4,3,4} gives exactly 1, 24, 456, 8376.
// - a blind curvature read from the shells alone agrees with the declared curvature on all twelve.
// - each matched pair has equal first shells (same degree); the hyperbolic member is never smaller, splits off by
//   shell 3 and stays larger ({3,7} and {3,6} still agree at shell 2, 6 cells each, and split at shell 3).
// - interior cells (closer than the ball radius) have degree exactly p, no cell has more.
// - the greedy edge coloring of every ball and of closed rings: each color is a matching, the colors cover every
//   edge exactly once, the count is between the max degree (Vizing's floor) and 2 * degree - 1 (greedy's ceiling),
//   and an odd ring needs at least 3 colors.
// - two builds give identical adjacency.
// Negative controls the gates must reject: buildEuclideanLattice's own {3,6} (the vertex reading, degree 6), a
// coloring with two classes merged (not a matching), a coloring with one edge dropped (not a cover), and a ball too
// big for the float-safe patch (the adapter must throw rather than hand back a ball with missing edges).

import { buildEuclideanLattice } from '@/code/substrate/coxeter/cell-direct'
import {
  LAB_GEOMETRIES,
  LabGeometry,
  LabGeometryName,
  labGeometry,
  labShellSizes,
} from '@/code/substrate/lab-geometry'
import {
  Graph,
  adjacencyListsEqual,
  greedyEdgeColoring,
  neighborsOf,
  toCsr,
} from '@/code/tool/graph'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// ball radius per geometry: the largest the float-safe patch holds whole (hyperbolic) or a size that keeps the run
// short (flat)
const RADIUS: Record<LabGeometryName, number> = {
  line: 12,
  '{4,4}': 10,
  '{6,3}': 10,
  '{3,6}': 10,
  '{5,4}': 6,
  '{7,3}': 6,
  '{8,3}': 5,
  '{3,4,3,4}': 2,
  '{4,5}': 6,
  '{6,4}': 5,
  '{3,7}': 10,
  '{3,4,3,3}': 4,
}

// the exact flat coordination sequences, |S(r)| for r >= 1
function flatShell(name: LabGeometryName, r: number): number | null {
  switch (name) {
    case 'line':
      return 2
    case '{4,4}':
      return 4 * r
    case '{6,3}':
      return 6 * r
    case '{3,6}':
      return 3 * r
    case '{3,4,3,3}':
      return 16 * r * r * r + 8 * r
    default:
      return null
  }
}

interface ColoringCheck {
  colors: number
  matching: boolean
  cover: boolean
}

// Whether color classes (lists of edges) are matchings and cover the graph's edges exactly once.
function checkColoring(
  graph: Graph,
  classes: readonly (readonly [number, number])[][],
): ColoringCheck {
  let matching = true
  const seen = new Set<string>()
  let duplicate = false

  for (const edges of classes) {
    const touched = new Set<number>()

    for (const [a, b] of edges) {
      if (touched.has(a) || touched.has(b)) {
        matching = false
      }

      touched.add(a)
      touched.add(b)

      const key = a < b ? `${a},${b}` : `${b},${a}`

      if (seen.has(key)) {
        duplicate = true
      }

      seen.add(key)
    }
  }

  let edgeCount = 0
  let missing = false

  for (let a = 0; a < graph.size; a++) {
    for (const b of graph.neighbors[a] ?? []) {
      if (a < b) {
        edgeCount++

        if (!seen.has(`${a},${b}`)) {
          missing = true
        }
      }
    }
  }

  return {
    colors: classes.length,
    matching,
    cover: !duplicate && !missing && seen.size === edgeCount,
  }
}

function colorClasses(graph: Graph): [number, number][][] {
  const csr = toCsr(neighborsOf(graph))
  const coloring = greedyEdgeColoring({
    offsets: csr.offsets,
    adjacency: csr.adj,
    size: graph.size,
  })

  return coloring.byColor.map(list =>
    list.map(e => [coloring.eu[e]!, coloring.ev[e]!] as [number, number]),
  )
}

function maxDegree(graph: Graph): number {
  let m = 0

  for (const row of graph.neighbors) {
    m = Math.max(m, row.length)
  }

  return m
}

// interior cells (closer than the radius) have degree exactly p, and no cell has more than p
function degreesHold(geometry: LabGeometry): boolean {
  const p = geometry.spec.degree

  for (let c = 0; c < geometry.graph.size; c++) {
    const d = geometry.graph.neighbors[c]!.length
    const interior =
      geometry.boundary === 'closed' || geometry.distance[c]! < geometry.radius

    if (d > p || (interior && d !== p)) {
      return false
    }
  }

  return true
}

// blind curvature read: hyperbolic when the last shell breaks the polynomial bound |S(1)| R^(d-1)
function readCurvature(
  shells: readonly number[],
  dimension: number,
): 'flat' | 'hyperbolic' {
  const R = shells.length - 1

  return shells[R]! > shells[1]! * Math.pow(R, dimension - 1)
    ? 'hyperbolic'
    : 'flat'
}

export default experiment({
  id: 'computation/lab-geometries',
  code: 'E-CMP-0023',
  title:
    'the twelve lab geometries (eight named tilings and four degree-matched controls) are exact tile graphs: flat shells meet their closed forms, hyperbolic shells break every polynomial bound, interior degree is p, and every greedy edge-coloring class is a matching covering each edge once',
  category: 'computation',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const control: Record<string, number> = {}
    const failures: string[] = []
    const balls = new Map<LabGeometryName, LabGeometry>()

    for (const spec of LAB_GEOMETRIES) {
      const name = spec.name
      const tag = name.replace(/[{}]/g, '').replace(/,/g, '-')
      const geometry = labGeometry({
        name,
        boundary: 'openBall',
        radius: RADIUS[name],
      })
      const again = labGeometry({
        name,
        boundary: 'openBall',
        radius: RADIUS[name],
      })

      balls.set(name, geometry)

      if (
        !adjacencyListsEqual(
          neighborsOf(geometry.graph),
          neighborsOf(again.graph),
        )
      ) {
        failures.push(`${name}: two builds differ`)
      }

      if (!degreesHold(geometry)) {
        failures.push(`${name}: interior degree is not ${spec.degree}`)
      }

      // shells: the ball's own, which equal the tiling's to the radius, and one further for {3,4,3,4}
      const shells =
        name === '{3,4,3,4}'
          ? labShellSizes({ name, radius: 3 })
          : geometry.shellSizes

      if (
        name === '{3,4,3,4}' &&
        shells.join(',') !== [1, 24, 456, 8376].join(',')
      ) {
        failures.push(`{3,4,3,4}: shells ${shells.join(',')}`)
      }

      if (
        name === '{3,4,3,4}' &&
        geometry.shellSizes.join(',') !== shells.slice(0, 3).join(',')
      ) {
        failures.push('{3,4,3,4}: the ball disagrees with the shell count')
      }

      if (shells[1] !== spec.degree) {
        failures.push(`${name}: first shell ${shells[1]} is not ${spec.degree}`)
      }

      const R = shells.length - 1

      if (spec.curvature === 'flat') {
        for (let r = 1; r <= R; r++) {
          if (shells[r] !== flatShell(name, r)) {
            failures.push(`${name}: shell ${r} is ${shells[r]}`)
          }

          if (shells[r]! > shells[1]! * Math.pow(r, spec.dimension - 1)) {
            failures.push(`${name}: shell ${r} breaks the polynomial bound`)
          }
        }
      } else {
        for (let r = R - 2; r <= R; r++) {
          if (r >= 2 && shells[r]! < 2 * shells[r - 2]!) {
            failures.push(`${name}: shell ${r} grows less than 2 over two shells`)
          }
        }
      }

      const read = readCurvature(shells, spec.dimension)

      if (read !== spec.curvature) {
        failures.push(`${name}: shells read ${read}, declared ${spec.curvature}`)
      }

      const classes = colorClasses(geometry.graph)
      const check = checkColoring(geometry.graph, classes)
      const top = maxDegree(geometry.graph)

      if (!check.matching || !check.cover) {
        failures.push(`${name}: coloring matching ${check.matching} cover ${check.cover}`)
      }

      if (check.colors < top || check.colors > 2 * spec.degree - 1) {
        failures.push(`${name}: ${check.colors} colors outside [${top}, ${2 * spec.degree - 1}]`)
      }

      metrics[`${tag}Cells`] = geometry.graph.size
      metrics[`${tag}Radius`] = geometry.radius
      metrics[`${tag}LastShell`] = shells[R]!
      metrics[`${tag}Colors`] = check.colors
      metrics[`${tag}GrowthPerShell`] =
        R >= 2 ? Math.sqrt(shells[R]! / shells[R - 2]!) : 0
    }

    // matched pairs: same first shell, then the hyperbolic member splits off and stays larger
    let matchedPairs = 0

    for (const spec of LAB_GEOMETRIES) {
      if (spec.curvature !== 'flat' || !spec.matchedControl) {
        continue
      }

      const flat = balls.get(spec.name)!.shellSizes
      const curved = balls.get(spec.matchedControl)!.shellSizes
      const top = Math.min(flat.length, curved.length) - 1

      if (flat[1] !== curved[1]) {
        failures.push(`${spec.name}: first shell differs from its control`)
      }

      // the hyperbolic control is never smaller, splits by shell 3 at the latest, and once larger stays larger
      let split = -1

      for (let r = 2; r <= top; r++) {
        if (curved[r]! < flat[r]!) {
          failures.push(`${spec.name}: control smaller at shell ${r}`)
        }

        if (split < 0 && curved[r]! > flat[r]!) {
          split = r
        }

        if (split > 0 && curved[r]! <= flat[r]!) {
          failures.push(`${spec.name}: control not larger at shell ${r}`)
        }
      }

      if (split < 2 || split > 3) {
        failures.push(`${spec.name}: control splits at shell ${split}`)
      }

      metrics[`${spec.name.replace(/[{}]/g, '').replace(/,/g, '-')}SplitShell`] =
        split
      matchedPairs++
    }

    if (matchedPairs !== 4) {
      failures.push(`matched pairs ${matchedPairs}, expected 4`)
    }

    // closed rings: degree 2 everywhere, every color a matching, odd rings need 3 colors
    for (const size of [3, 4, 7, 8, 12, 13]) {
      const ring = labGeometry({ name: 'line', boundary: 'closed', size })
      const check = checkColoring(ring.graph, colorClasses(ring.graph))

      if (!degreesHold(ring) || ring.graph.size !== size) {
        failures.push(`ring ${size}: degree or size`)
      }

      if (!check.matching || !check.cover) {
        failures.push(`ring ${size}: coloring`)
      }

      if (size % 2 === 1 && check.colors < 3) {
        failures.push(`ring ${size}: odd ring with ${check.colors} colors`)
      }

      metrics[`ring${size}Colors`] = check.colors
    }

    // NEGATIVE CONTROL 1: buildEuclideanLattice read raw as {3,6} is the vertex reading, degree 6, and the degree
    // gate must reject it
    const raw = buildEuclideanLattice({ symbol: [3, 6], maxCells: 200 })
    const rawDegree = raw.neighbors[0]!.length
    const rawRejected = rawDegree !== 3

    control.rawThreeSixDegree = rawDegree
    control.rawThreeSixRejected = rawRejected ? 1 : 0

    // NEGATIVE CONTROL 2 and 3: a merged coloring is not a matching, a coloring missing one edge is not a cover
    const probe = balls.get('{7,3}')!
    const good = colorClasses(probe.graph)
    const merged = [[...good[0]!, ...good[1]!], ...good.slice(2)]
    const dropped = [good[0]!.slice(1), ...good.slice(1)]
    const mergedRejected = !checkColoring(probe.graph, merged).matching
    const droppedRejected = !checkColoring(probe.graph, dropped).cover

    control.mergedColoringRejected = mergedRejected ? 1 : 0
    control.droppedEdgeRejected = droppedRejected ? 1 : 0

    // NEGATIVE CONTROL 4: a ball bigger than the float-safe patch must throw, never come back with missing edges
    let oversizeRejected = false

    try {
      labGeometry({ name: '{8,3}', boundary: 'openBall', radius: 6 })
    } catch {
      oversizeRejected = true
    }

    control.oversizeBallRejected = oversizeRejected ? 1 : 0

    // NEGATIVE CONTROL 5: the blind curvature read must call a hyperbolic sequence hyperbolic when handed the flat
    // dimension's bound, and a flat one flat (the read is not constant)
    const readSplits =
      readCurvature(balls.get('{3,7}')!.shellSizes, 2) === 'hyperbolic' &&
      readCurvature(balls.get('{3,6}')!.shellSizes, 2) === 'flat'

    control.curvatureReadSplits = readSplits ? 1 : 0

    if (!rawRejected) {
      failures.push('control: raw {3,6} lattice passed the degree gate')
    }

    if (!mergedRejected || !droppedRejected) {
      failures.push('control: a broken coloring passed')
    }

    if (!oversizeRejected) {
      failures.push('control: an oversize ball did not throw')
    }

    if (!readSplits) {
      failures.push('control: the curvature read does not split')
    }

    metrics.geometries = LAB_GEOMETRIES.length
    metrics.matchedPairs = matchedPairs
    metrics.failures = failures.length

    const ok = failures.length === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'all twelve lab geometries build as exact tile graphs from the shared builders: the line, {4,4}, {6,3}, {3,6} and the flat D4 {3,4,3,3} meet their exact coordination sequences (2, 4r, 6r, 3r, 16r^3 + 8r), {5,4}, {7,3}, {8,3}, {4,5}, {6,4}, {3,7} and {3,4,3,4} break every polynomial bound ({3,4,3,4} shells 1, 24, 456, 8376 exactly), each degree-matched pair agrees at shell 1 and the hyperbolic member splits off by shell 3 and stays larger, interior cells have degree p, and every greedy edge-coloring class is a matching covering each edge once, with the color counts recorded',
      metrics,
      control,
      notes:
        `L2 infrastructure gate for the computation lab. Open balls are windows with vacuum outside; hyperbolic balls stop where buildCellGraph stays below its float precision wall (15,000 cells), so {3,4,3,4} is a radius-2 ball (481 cells) and its third shell is counted without cutting a ball. buildEuclideanLattice returns the vertex reading (degree 6) for {3,6}; the adapter reads the triangular faces of that lattice instead. Greedy coloring may use more than degree colors, which sets the open-ball radius a rule needs (c colors carry a difference c hops per round). ${ok ? '' : `Failures: ${failures.slice(0, 8).join('; ')}`}`.trim(),
    })
  },
})
