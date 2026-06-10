// Self-maintenance export: the REAL P171 experiment on the genuine {5,3,4}, for the /vibe/maintenance view.
//
// This replicates experiment P171 exactly, nothing invented. On the real hyperbolic {5,3,4} crystal, a
// controlled self REGION (a ball of cells, placed, as the experiment does) is given a BALANCED identity
// pattern (equal pleasure and pain, net charge zero). Two copies run under the same conserved-exchange
// rule. One is MAINTAINED, the will restores the region to its identity each beat (P171's mechanism, a
// balanced rewrite, so it never floods). The other is left alone. The maintained self keeps its identity,
// the unmaintained one dissolves into the churn (P159). A local patch of cells (the self plus its surround)
// is projected to flat 2D for viewing. See note/research/vibe/notes/what-counts-as-a-self.md.
//
// Honest scope, the region is a controlled probe (placed, as in the experiment), not an emergent self, and
// the maintenance is the will rewriting the balanced identity. The dynamics, the conservation, and the
// dissolution are the genuine model. Run: npx tsx code/viz/maintenance-export.ts

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { buildCellGraph } from '~/substrate/coxeter/cell-direct'
import { makeRng } from '~/tool/rng'

type Rng = { next: () => number }

const OUTPUT_PATH =
  '/Users/lancepollard/base/crew/cluesurf/mesh/site/clue.surf/home/public/vibe/maintenance.json'

// the conserved-exchange rule, one beat (exactly P171's beat, tones -1, 0, +1)
function beat(tone: Int8Array, edges: number[][], moved: Uint8Array, rng: Rng, arrow: number): void {
  moved.fill(0)
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
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w
      if (rng.next() < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if (a === 0 && b === 0 && rng.next() < arrow) {
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

export function exportMaintenance(input?: {
  maxCells?: number
  regionSize?: number
  surroundLayers?: number
  frames?: number
  stride?: number
  arrow?: number
  mediumDensity?: number
}): { bulkCells: number; viewCells: number; regionCells: number; frames: number; outputPath: string } {
  const maxCells = input?.maxCells ?? 50000
  const regionSize = input?.regionSize ?? 600
  const surroundLayers = input?.surroundLayers ?? 1
  const frameCount = input?.frames ?? 100
  const stride = input?.stride ?? 1
  const arrow = input?.arrow ?? 0.1
  const mediumDensity = input?.mediumDensity ?? 0.25

  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells })
  const N = g.cellCount
  const neighbors = g.neighbors
  const edges: number[][] = []
  for (let v = 0; v < N; v++) for (const w of neighbors[v]!) if (w > v) edges.push([v, w])

  // the self REGION, a BFS ball from the centre cell (a placed probe, exactly as P171 does)
  const inRegion = new Uint8Array(N)
  const region: number[] = []
  {
    inRegion[0] = 1
    let frontier = [0]
    while (frontier.length > 0 && region.length < regionSize) {
      const next: number[] = []
      for (const u of frontier) {
        if (region.length >= regionSize) break
        region.push(u)
        for (const w of neighbors[u]!) if (!inRegion[w]) {
          inRegion[w] = 1
          next.push(w)
        }
      }
      frontier = next
    }
  }
  inRegion.fill(0)
  for (const i of region) inRegion[i] = 1

  // the BALANCED identity pattern over the region (equal +/-, shuffled), net charge zero
  const target = new Int8Array(N)
  for (let k = 0; k < region.length; k++) target[region[k]!] = (k % 2 === 0 ? 1 : -1) as -1 | 1
  const shuffleRng = makeRng({ seed: 4 })
  for (let i = region.length - 1; i > 0; i--) {
    const j = Math.floor(shuffleRng.next() * (i + 1))
    const a = region[i]!
    const b = region[j]!
    const t = target[a]!
    target[a] = target[b]!
    target[b] = t
  }

  // the LOCAL view, the region plus a few BFS shells around it (the self and its immediate surround)
  const inView = new Uint8Array(N)
  for (const i of region) inView[i] = 1
  let shell = region.slice()
  for (let layer = 0; layer < surroundLayers; layer++) {
    const next: number[] = []
    for (const u of shell) for (const w of neighbors[u]!) if (!inView[w]) {
      inView[w] = 1
      next.push(w)
    }
    shell = next
  }
  const view: number[] = []
  for (let i = 0; i < N; i++) if (inView[i]) view.push(i)
  const viewIndex = new Int32Array(N).fill(-1)
  for (let a = 0; a < view.length; a++) viewIndex[view[a]!] = a

  // lay the view cells out flat, force-directed on their crystal adjacency (the same honest layout the
  // horosphere view uses, it only positions dots, it never touches the tones)
  const viewEdges: number[][] = []
  for (let a = 0; a < view.length; a++) for (const w of neighbors[view[a]!]!) {
    const b = viewIndex[w]!
    if (b > a) viewEdges.push([a, b])
  }
  const GOLDEN = Math.PI * (3 - Math.sqrt(5))
  const position = view.map((_, i) => {
    const r = Math.sqrt((i + 0.5) / view.length)
    return [r * Math.cos(i * GOLDEN), r * Math.sin(i * GOLDEN)]
  })
  const ideal = 1.6 / Math.sqrt(view.length)
  const iterations = 110
  for (let iter = 0; iter < iterations; iter++) {
    const dispX = new Float64Array(view.length)
    const dispY = new Float64Array(view.length)
    for (let i = 0; i < view.length; i++) {
      const ix = position[i]![0]!
      const iy = position[i]![1]!
      for (let j = i + 1; j < view.length; j++) {
        let dx = ix - position[j]![0]!
        let dy = iy - position[j]![1]!
        const d2 = dx * dx + dy * dy + 1e-9
        const f = (2.2 * ideal * ideal) / d2
        dx *= f
        dy *= f
        dispX[i]! += dx
        dispY[i]! += dy
        dispX[j]! -= dx
        dispY[j]! -= dy
      }
    }
    for (const e of viewEdges) {
      const a = e[0]!
      const b = e[1]!
      let dx = position[a]![0]! - position[b]![0]!
      let dy = position[a]![1]! - position[b]![1]!
      const d = Math.hypot(dx, dy) + 1e-6
      const f = (0.9 * d * d) / ideal
      dx = (dx / d) * f
      dy = (dy / d) * f
      dispX[a]! -= dx
      dispY[a]! -= dy
      dispX[b]! += dx
      dispY[b]! += dy
    }
    const temp = 0.04 * (1 - iter / iterations)
    for (let i = 0; i < view.length; i++) {
      const len = Math.hypot(dispX[i]!, dispY[i]!) + 1e-9
      position[i]![0]! += (dispX[i]! / len) * Math.min(len, temp)
      position[i]![1]! += (dispY[i]! / len) * Math.min(len, temp)
    }
  }
  let maxAbs = 1e-6
  for (const p of position) maxAbs = Math.max(maxAbs, Math.abs(p[0]!), Math.abs(p[1]!))
  const cells2d = position.map((p) => [Math.round((p[0]! / maxAbs) * 1000) / 1000, Math.round((p[1]! / maxAbs) * 1000) / 1000])

  // seed the two copies identically, region = identity, medium = sparse charges
  const seed = (tone: Int8Array, r: Rng): void => {
    tone.fill(0)
    for (const i of region) tone[i] = target[i]!
    for (let i = 0; i < N; i++) if (!inRegion[i] && r.next() < mediumDensity) tone[i] = (r.next() < 0.5 ? 1 : -1) as -1 | 1
  }
  const maintained = new Int8Array(N)
  const free = new Int8Array(N)
  seed(maintained, makeRng({ seed: 5 }))
  seed(free, makeRng({ seed: 5 }))
  const moved = new Uint8Array(N)
  const rngA = makeRng({ seed: 11 })
  const rngB = makeRng({ seed: 11 })

  const framesMaintained: number[][] = []
  const framesUnmaintained: number[][] = []
  for (let f = 0; f < frameCount; f++) {
    framesMaintained.push(view.map((i) => maintained[i]!))
    framesUnmaintained.push(view.map((i) => free[i]!))
    for (let s = 0; s < stride; s++) {
      beat(maintained, edges, moved, rngA, arrow)
      for (const i of region) maintained[i] = target[i]! // self-maintenance, restore the identity (P171)
      beat(free, edges, moved, rngB, arrow)
    }
  }

  const data = {
    note: 'real {5,3,4}, P171 self-maintenance, a placed self region maintained vs not, projected to flat 2D',
    bulkCells: N,
    viewCells: view.length,
    regionCells: region.length,
    cells: cells2d,
    inRegion: view.map((i) => inRegion[i]!),
    target: view.map((i) => target[i]!),
    framesMaintained,
    framesUnmaintained,
  }
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, JSON.stringify(data))

  return { bulkCells: N, viewCells: view.length, regionCells: region.length, frames: frameCount, outputPath: OUTPUT_PATH }
}

const result = exportMaintenance()
console.log('maintenance export (real {5,3,4}, P171):')
console.log(`  bulk cells: ${result.bulkCells}`)
console.log(`  self region (placed probe): ${result.regionCells} cells`)
console.log(`  view cells (self + surround, flat 2D): ${result.viewCells}`)
console.log(`  frames: ${result.frames}`)
console.log(`  wrote: ${result.outputPath}`)
