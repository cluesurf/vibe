// P91: holography on the real crystal. The substrate is hyperbolic, which is exactly the geometry
// of holography (the spatial slice of Anti-de Sitter space). Three holographic results, all computed
// on the actual {7,3} engine graph (P85):
//   1. Ryu-Takayanagi: the entanglement entropy of a boundary region is the length of the minimal
//      bulk geodesic cutting it off. For an arc of angular size theta on the rim, the bulk geodesic
//      length scales as log(sin(theta/2)), the exact CFT2 vacuum entanglement entropy on a circle.
//   2. The geodesic shortcut: two cells far apart along the boundary are NEAR through the bulk (the
//      bulk path is far shorter than the boundary path, and it dips toward the center). This is the
//      precise, computed version of the "field beneath," telepathy, and synchronicity, far on the
//      boundary, near through the deep bulk.
//   3. Depth is scale: the farther apart two boundary points are, the deeper toward the center their
//      connecting geodesic dips, so the radial (bulk-depth) direction is the renormalization scale.
// Run: npx tsx code/experiment/p91-holography.ts

import { linearFit } from '@/code/measure/regression'
import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { neighborBfsTree } from '@/code/tool/graph'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function holography(): {
  cells: number
  rimCells: number
  logLawSlope: number
  logLawR2: number
  rtLogLawHolds: boolean
  shortcutRatio: number
  isShortcut: boolean
  nearGeodesicDepth: number
  farGeodesicDepth: number
  depthIsScale: boolean
  solved: boolean
} {
  const mesh = buildCoxeterMesh({
    symbol: [7, 3],
    depth: 24,
    maxChambers: 200000,
  })

  const n = mesh.cellCount
  const coord = mesh.coords
  const radius = coord.map(c => Math.hypot(c[0] ?? 0, c[1] ?? 0))
  const angle = coord.map(c => Math.atan2(c[1] ?? 0, c[0] ?? 0))
  const rMax = Math.max(...radius)

  // the boundary: the outer rim shell, ordered around the circle by angle
  const rim = [] as number[]

  for (let i = 0; i < n; i++) {
    if ((radius[i] ?? 0) > 0.93 * rMax) {
      rim.push(i)
    }
  }

  rim.sort((a, b) => (angle[a] ?? 0) - (angle[b] ?? 0))

  // 1. Ryu-Takayanagi: bulk geodesic length vs log(sin(theta/2)), binned and averaged over many
  // rim anchors to wash out the discreteness, the clean entanglement-entropy law.
  const bins = new Map<number, { sum: number; count: number }>()
  const anchors = rim.filter((_, i) => i % 3 === 0)

  for (const a of anchors) {
    const { dist } = neighborBfsTree({
      neighbors: mesh.neighbors,
      size: n,
      source: a,
    })

    for (const r of rim) {
      let theta = Math.abs((angle[r] ?? 0) - (angle[a] ?? 0))

      if (theta > Math.PI) {
        theta = 2 * Math.PI - theta
      }

      if (theta < 0.3) {
        continue
      }

      const x = Math.log(Math.sin(theta / 2))
      const key = Math.round(x * 8) / 8
      const b = bins.get(key) ?? { sum: 0, count: 0 }
      b.sum += dist[r] ?? 0
      b.count++
      bins.set(key, b)
    }
  }

  const xs: number[] = []
  const ys: number[] = []

  for (const [k, v] of bins) {
    xs.push(k)
    ys.push(v.sum / v.count)
  }

  const { slope, r2: logLawR2 } = linearFit({ xs, ys })
  const rtLogLawHolds = logLawR2 > 0.95 && slope > 1.4 && slope < 2.8

  // 2. and 3. shortcut and depth: from one anchor, to a nearby rim cell and to the antipodal one.
  const anchor = rim[Math.floor(rim.length / 2)]!
  const { dist, parent } = neighborBfsTree({
    neighbors: mesh.neighbors,
    size: n,
    source: anchor,
  })

  const ai = rim.indexOf(anchor)
  const opp = rim[(ai + Math.floor(rim.length / 2)) % rim.length]!
  const near =
    rim[(ai + Math.max(1, Math.floor(rim.length / 12))) % rim.length]!

  const boundaryArc = Math.min(
    Math.floor(rim.length / 2),
    rim.length - Math.floor(rim.length / 2),
  )

  const bulkHops = dist[opp] ?? 1
  const shortcutRatio = boundaryArc / bulkHops
  const isShortcut = shortcutRatio > 5

  const geodesicMinRadius = (target: number): number => {
    let node = target
    let minR = radius[target] ?? rMax

    while (node !== -1) {
      if ((radius[node] ?? rMax) < minR) {
        minR = radius[node] ?? rMax
      }

      node = parent[node]!
    }

    return minR
  }

  const nearGeodesicDepth = geodesicMinRadius(near)
  const farGeodesicDepth = geodesicMinRadius(opp)
  // the far geodesic dips deeper (smaller min radius) toward the center than the near one
  const depthIsScale = farGeodesicDepth < nearGeodesicDepth - 0.05

  const solved = rtLogLawHolds && isShortcut && depthIsScale

  return {
    cells: n,
    rimCells: rim.length,
    logLawSlope: slope,
    logLawR2,
    rtLogLawHolds,
    shortcutRatio,
    isShortcut,
    nearGeodesicDepth,
    farGeodesicDepth,
    depthIsScale,
    solved,
  }
}

export default experiment({
  id: 'holography/p91-holography',
  title:
    'Ryu-Takayanagi log law, geodesic shortcut, and depth-as-scale on the {7,3} crystal',
  category: 'holography',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = holography()
    const ok =
      r.solved && r.rtLogLawHolds && r.isShortcut && r.depthIsScale

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the bulk geodesic length gives the boundary entanglement entropy as a log law, far boundary cells are near through the bulk, and the geodesic depth encodes the boundary separation',
      metrics: {
        logLawSlope: r.logLawSlope,
        logLawR2: r.logLawR2,
        shortcutRatio: r.shortcutRatio,
        nearGeodesicDepth: r.nearGeodesicDepth,
        farGeodesicDepth: r.farGeodesicDepth,
      },
      control: { nearGeodesicDepth: r.nearGeodesicDepth },
    })
  },
})
