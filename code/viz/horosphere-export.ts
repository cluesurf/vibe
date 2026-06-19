// Horosphere export: the real {5,3,4} does the computing, the horosphere gives the flat picture.
//
// The faithful selves pipeline (note/research/vibe/notes/visualizing-the-selves.md, what-is-a-self.md,
// 04-life.md). The cohesive perception rule (the P106 rule, a charge hops toward where it has MORE
// same-sign neighbours, conserving) runs on the genuine hyperbolic {5,3,4} crystal. We then take a
// HOROSPHERE slice (a flat Busemann level set, P142), project its cells to flat 2D (perpendicular to the
// ideal point), and record the slice's tones beat by beat. The integrated self-patches (P106) live in the
// 3D bulk and cross the horosphere as 2D regions, so what we render in flatland is the cross-section of the
// real selves growing, merging, and healing on the crystal. Nothing about the rule is changed, only the
// state is viewed in the emergent flat layer.
//
// Writes a JSON the browser page /vibe/horosphere replays. Run: npx tsx code/viz/horosphere-export.ts

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'

type Rng = { next: () => number }

// where the browser page reads the replay from (the clue.surf home site public dir)
const OUTPUT_PATH =
  '/Users/lancepollard/base/crew/cluesurf/mesh/site/clue.surf/home/public/vibe/horosphere.json'

// the cohesive perception rule (P106), one beat on the bulk. A charge hops into an adjacent peace cell when
// that move lands it among MORE same-sign neighbours (cohesion), with a rare random escape, opposite
// charges annihilate (share), two peace cells may birth a balanced pair (the arrow). Charge is conserved.
function beat(
  tone: Int8Array,
  edges: number[][],
  neighbors: number[][],
  moved: Uint8Array,
  rng: Rng,
  arrowProb: number,
): void {
  moved.fill(0)
  const agree = (i: number, q: number, except: number): number => {
    let count = 0
    for (const w of neighbors[i]!)
      if (w !== except && tone[w] === q) count++
    return count
  }
  for (const edge of edges) {
    const v = edge[0]!
    const w = edge[1]!
    if (moved[v] || moved[w]) continue
    const a = tone[v]!
    const b = tone[w]!
    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      tone[v] = 0
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      const charge = a === 0 ? w : v
      const empty = a === 0 ? v : w
      const q = tone[charge]!
      if (
        agree(empty, q, charge) >= agree(charge, q, empty) ||
        rng.next() < 0.02
      ) {
        tone[empty] = q
        tone[charge] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if (a === 0 && b === 0 && rng.next() < arrowProb) {
      if (rng.next() < 0.5) {
        tone[v] = 1
        tone[w] = -1
      } else {
        tone[v] = -1
        tone[w] = 1
      }
      moved[v] = 1
      moved[w] = 1
    }
  }
}

export function exportHorosphere(input?: {
  maxCells?: number
  bandHalfWidth?: number
  warmup?: number
  frames?: number
  stride?: number
  arrowProb?: number
  outputPath?: string
}): {
  bulkCells: number
  bandCells: number
  frames: number
  outputPath: string
} {
  const maxCells = input?.maxCells ?? 500000
  const bandHalfWidth = input?.bandHalfWidth ?? 1.2
  const warmup = input?.warmup ?? 250
  const frameCount = input?.frames ?? 110
  const stride = input?.stride ?? 2
  const arrowProb = input?.arrowProb ?? 0.06
  const outputPath = input?.outputPath ?? OUTPUT_PATH

  // the genuine hyperbolic {5,3,4} bulk, with Poincare-ball coordinates
  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells })
  const bulkCells = g.cellCount
  const coords = g.coords
  const norm = (v: number[]): number =>
    Math.sqrt(v.reduce((s, x) => s + x * x, 0))

  // ideal point xi = direction of the farthest cell (closest to the boundary)
  let far = 0
  let farRadius = -1
  for (let i = 0; i < bulkCells; i++) {
    const r = norm(coords[i]!)
    if (r > farRadius) {
      farRadius = r
      far = i
    }
  }
  const fc = coords[far]!
  const fn = norm(fc)
  const xi = fc.map(v => v / fn)

  // Busemann function, its level sets are the horospheres tangent at xi
  const busemann = coords.map(x => {
    let d2 = 0
    for (let k = 0; k < x.length; k++) d2 += (x[k]! - xi[k]!) ** 2
    const r2 = x.reduce((s, v) => s + v * v, 0)
    return Math.log(d2 / Math.max(1e-12, 1 - r2))
  })

  // the band of bulk cells lying on the horosphere through the origin (a thin flat slab)
  const band: number[] = []
  for (let i = 0; i < bulkCells; i++) {
    if (Math.abs(busemann[i]! - 0) < bandHalfWidth) band.push(i)
  }

  // a 2D orthonormal frame perpendicular to xi, to flatten the slab onto the plane it is tangent to
  const seed = Math.abs(xi[0]!) < 0.9 ? [1, 0, 0] : [0, 1, 0]
  const dotSeed =
    seed[0]! * xi[0]! + seed[1]! * xi[1]! + seed[2]! * xi[2]!
  let e1 = [
    seed[0]! - dotSeed * xi[0]!,
    seed[1]! - dotSeed * xi[1]!,
    seed[2]! - dotSeed * xi[2]!,
  ]
  const e1n = norm(e1)
  e1 = e1.map(v => v / e1n)
  // e2 = xi cross e1
  const e2 = [
    xi[1]! * e1[2]! - xi[2]! * e1[1]!,
    xi[2]! * e1[0]! - xi[0]! * e1[2]!,
    xi[0]! * e1[1]! - xi[1]! * e1[0]!,
  ]

  // project each band cell to flat horosphere coordinates by the genuine horospherical map, an inversion
  // centred at the ideal point xi sends the ball to the half-space tangent at xi, where the horospheres
  // become FLAT planes (no boundary crowding). The component perpendicular to xi is the flat (u, v), the
  // component along xi is the height. This is the correct "flatten hyperbolic space onto a horosphere".
  const bandCount = band.length

  // the slice's own adjacency, two band cells that are neighbours on the {5,3,4} crystal. This is the
  // honest connectivity of the flat sheet, used both to lay it out and to find the self-patches
  const reindex = new Int32Array(bulkCells).fill(-1)
  for (let a = 0; a < bandCount; a++) reindex[band[a]!] = a
  const bandNeighbors: number[][] = band.map(() => [])
  for (let a = 0; a < bandCount; a++) {
    for (const w of g.neighbors[band[a]!]!) {
      const b = reindex[w]!
      if (b >= 0) bandNeighbors[a]!.push(b)
    }
  }
  const layoutEdges: number[][] = []
  for (let a = 0; a < bandCount; a++)
    for (const b of bandNeighbors[a]!)
      if (b > a) layoutEdges.push([a, b])

  // initial positions from the horospherical projection (an inversion centred at the ideal point), then a
  // force-directed relaxation that realizes the horosphere's INTRINSIC flatness, neighbours pull together
  // and everything repels, so the sheet spreads EVENLY instead of crowding at the projection centre (which
  // both the tangent and the raw inversion do, because the extrinsic embedding does not see the flatness)
  const position = band.map(i => {
    const c = coords[i]!
    const dx = [c[0]! - xi[0]!, c[1]! - xi[1]!, c[2]! - xi[2]!]
    const d2 = Math.max(
      1e-9,
      dx[0]! * dx[0]! + dx[1]! * dx[1]! + dx[2]! * dx[2]!,
    )
    const fp = [
      xi[0]! + (2 * dx[0]!) / d2,
      xi[1]! + (2 * dx[1]!) / d2,
      xi[2]! + (2 * dx[2]!) / d2,
    ]
    const along = fp[0]! * xi[0]! + fp[1]! * xi[1]! + fp[2]! * xi[2]!
    const flat = [
      fp[0]! - along * xi[0]!,
      fp[1]! - along * xi[1]!,
      fp[2]! - along * xi[2]!,
    ]
    return [
      flat[0]! * e1[0]! + flat[1]! * e1[1]! + flat[2]! * e1[2]!,
      flat[0]! * e2[0]! + flat[1]! * e2[1]! + flat[2]! * e2[2]!,
    ]
  })
  // an even sunflower (Fibonacci) disk as the starting layout, so even disconnected cells begin spread out
  // (the raw projection crowds the centre, which made the relaxation collapse or ring). The relaxation then
  // pulls crystal-neighbours together to recover the local structure.
  const GOLDEN = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < bandCount; i++) {
    const r = Math.sqrt((i + 0.5) / bandCount)
    position[i] = [r * Math.cos(i * GOLDEN), r * Math.sin(i * GOLDEN)]
  }
  const idealLength = 1.6 / Math.sqrt(bandCount)
  const iterations = 200
  for (let iter = 0; iter < iterations; iter++) {
    const dispX = new Float64Array(bandCount)
    const dispY = new Float64Array(bandCount)
    // GLOBAL all-pairs repulsion, so the whole sheet spreads out evenly (local-only repulsion let the
    // centre collapse). The horosphere is intrinsically flat, this recovers that even spread from the real
    // crystal adjacency. It only positions the dots, it never touches the tones or which cells are selves.
    for (let i = 0; i < bandCount; i++) {
      const ix = position[i]![0]!
      const iy = position[i]![1]!
      for (let j = i + 1; j < bandCount; j++) {
        let dx = ix - position[j]![0]!
        let dy = iy - position[j]![1]!
        const dist2 = dx * dx + dy * dy + 1e-9
        const force = (2.2 * idealLength * idealLength) / dist2
        dx *= force
        dy *= force
        dispX[i]! += dx
        dispY[i]! += dy
        dispX[j]! -= dx
        dispY[j]! -= dy
      }
    }
    // attraction along the crystal edges
    for (const edge of layoutEdges) {
      const a = edge[0]!
      const b = edge[1]!
      let dx = position[a]![0]! - position[b]![0]!
      let dy = position[a]![1]! - position[b]![1]!
      const dist = Math.hypot(dx, dy) + 1e-6
      const force = (0.9 * dist * dist) / idealLength
      dx = (dx / dist) * force
      dy = (dy / dist) * force
      dispX[a]! -= dx
      dispY[a]! -= dy
      dispX[b]! += dx
      dispY[b]! += dy
    }
    const temperature = 0.04 * (1 - iter / iterations)
    for (let i = 0; i < bandCount; i++) {
      const length = Math.hypot(dispX[i]!, dispY[i]!) + 1e-9
      position[i]![0]! +=
        (dispX[i]! / length) * Math.min(length, temperature)
      position[i]![1]! +=
        (dispY[i]! / length) * Math.min(length, temperature)
    }
  }
  // normalize the relaxed layout into [-1, 1]
  let maxAbs = 1e-6
  for (const p of position)
    maxAbs = Math.max(maxAbs, Math.abs(p[0]!), Math.abs(p[1]!))
  const cells2d = position.map(p => [p[0]! / maxAbs, p[1]! / maxAbs])

  // run the cohesive rule on the FULL bulk and record the band cells' tones each frame
  const tone = new Int8Array(bulkCells)
  const moved = new Uint8Array(bulkCells)
  const edges: number[][] = []
  for (let v = 0; v < bulkCells; v++)
    for (const w of g.neighbors[v]!) if (w > v) edges.push([v, w])
  const rng = makeRng({ seed: 9 })
  for (let b = 0; b < warmup; b++)
    beat(tone, edges, g.neighbors, moved, rng, arrowProb)

  const frames: number[][] = []
  for (let f = 0; f < frameCount; f++) {
    frames.push(band.map(i => tone[i]!))
    for (let s = 0; s < stride; s++)
      beat(tone, edges, g.neighbors, moved, rng, arrowProb)
  }

  // round the coordinates to keep the file small
  const cellsOut = cells2d.map(p => [
    Math.round(p[0]! * 1000) / 1000,
    Math.round(p[1]! * 1000) / 1000,
  ])
  const data = {
    note: 'real {5,3,4} cohesive perception rule (P106), horosphere slice, projected to flat 2D',
    bulkCells,
    bandCells: bandCount,
    cells: cellsOut,
    neighbors: bandNeighbors,
    frames,
  }
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, JSON.stringify(data))

  return {
    bulkCells,
    bandCells: bandCount,
    frames: frameCount,
    outputPath,
  }
}

const result = exportHorosphere()
console.log('horosphere export:')
console.log(`  bulk {5,3,4} cells: ${result.bulkCells}`)
console.log(`  horosphere band cells (flat 2D): ${result.bandCells}`)
console.log(`  frames: ${result.frames}`)
console.log(`  wrote: ${result.outputPath}`)
