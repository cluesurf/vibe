// Gravity hole-finder: does the bare {5,3,4} rule produce any LONG-RANGE attraction between two lumps of
// matter, the way gravity pulls masses together? (what-counts-as-a-self.md, P110.)
//
// Adversarial test. In the real universe, two clumps of matter attract across empty space (gravity) and
// fall together into stars and galaxies. We place two lumps of matter (charged balls) on the genuine
// hyperbolic {5,3,4}, separated by peace, run the cohesive conserved-exchange rule, and measure whether
// their separation SHRINKS (attraction) over time, for several starting gaps. The suspected hole, the rule
// is LOCAL and has no long-range force, so the lumps should only interact on CONTACT (merge, P110) and
// ignore each other across a gap. If so, the theory has contact forces but NO gravity, a real missing
// ingredient. Run: npx tsx code/viz/gravity-test.ts

import { pathToFileURL } from 'node:url'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'

type Rng = { next: () => number }

// the cohesive perception rule (P106), so the lumps are stable selves rather than instantly dissolving
function beat(
  tone: Int8Array,
  edges: number[][],
  neighbors: number[][],
  moved: Uint8Array,
  rng: Rng,
  arrow: number,
): void {
  moved.fill(0)

  const agree = (i: number, q: number, except: number): number => {
    let c = 0

    for (const w of neighbors[i]!) {
      if (w !== except && tone[w] === q) {
        c++
      }
    }

    return c
  }

  for (const e of edges) {
    const v = e[0]!
    const w = e[1]!

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

function bfsDistance(
  neighbors: number[][],
  source: number,
  n: number,
): Int32Array {
  const dist = new Int32Array(n).fill(-1)

  dist[source] = 0

  let frontier = [source]

  while (frontier.length > 0) {
    const next: number[] = []

    for (const u of frontier) {
      for (const w of neighbors[u]!) {
        if (dist[w] === -1) {
          dist[w] = dist[u]! + 1
          next.push(w)
        }
      }
    }

    frontier = next
  }

  return dist
}

// a lump = a BFS ball of `size` cells around a centre
function makeLump(
  neighbors: number[][],
  center: number,
  size: number,
  n: number,
): number[] {
  const inLump = new Uint8Array(n)
  const lump: number[] = []

  inLump[center] = 1

  let frontier = [center]

  while (frontier.length > 0 && lump.length < size) {
    const next: number[] = []

    for (const u of frontier) {
      if (lump.length >= size) break

      lump.push(u)

      for (const w of neighbors[u]!) {
        if (!inLump[w]) {
          inLump[w] = 1
          next.push(w)
        }
      }
    }

    frontier = next
  }

  return lump
}

export function gravityTest(input?: {
  maxCells?: number
  lumpSize?: number
  beats?: number
}): {
  maxCells: number
  lumpSize: number
  trials: {
    startGap: number
    gaps: number[]
    approached: boolean
    merged: boolean
  }[]
  anyLongRangeAttraction: boolean
  onlyContactInteraction: boolean
  gravityMissing: boolean
} {
  const maxCells = input?.maxCells ?? 40000
  const lumpSize = input?.lumpSize ?? 250
  const beats = input?.beats ?? 60
  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells })
  const n = g.cellCount
  const neighbors = g.neighbors
  const edges: number[][] = []

  for (let v = 0; v < n; v++) {
    for (const w of neighbors[v]!) {
      if (w > v) edges.push([v, w])
    }
  }

  const distFrom0 = bfsDistance(neighbors, 0, n)

  // measure the separation of the two lumps as the minimum graph distance between a still-charged cell of
  // lump A and a still-charged cell of lump B, which tracks whether the matter has bridged the gap
  const separation = (
    tone: Int8Array,
    lumpA: number[],
    lumpB: number[],
  ): number => {
    const distA = new Int32Array(n).fill(-1)

    let frontier: number[] = []

    for (const i of lumpA) {
      if (tone[i] !== 0) {
        distA[i] = 0
        frontier.push(i)
      }
    }

    if (frontier.length === 0) return -1

    const chargedB = new Set(lumpB.filter(i => tone[i] !== 0))

    if (chargedB.size === 0) return -1

    while (frontier.length > 0) {
      const next: number[] = []

      for (const u of frontier) {
        if (chargedB.has(u)) return distA[u]!

        for (const w of neighbors[u]!) {
          if (distA[w] === -1) {
            distA[w] = distA[u]! + 1
            next.push(w)
          }
        }
      }

      frontier = next
    }

    return -1
  }

  const trials: {
    startGap: number
    gaps: number[]
    approached: boolean
    merged: boolean
  }[] = []

  for (const startGap of [3, 6, 10]) {
    // centre A at cell 0, centre B at a cell roughly `lumpRadius*2 + startGap` away so the lump SURFACES
    // start `startGap` apart
    let centerB = 0
    let bestDelta = Infinity

    const targetDist = startGap + 14 // lumps have radius ~7 at 250 cells, so centres this far gives the gap

    for (let i = 0; i < n; i++) {
      const d = Math.abs(distFrom0[i]! - targetDist)

      if (d < bestDelta) {
        bestDelta = d
        centerB = i
      }
    }

    const lumpA = makeLump(neighbors, 0, lumpSize, n)
    const lumpB = makeLump(neighbors, centerB, lumpSize, n)

    const tone = new Int8Array(n)
    const rng = makeRng({ seed: 7 })

    // matter, balanced charges so the lumps are neutral mass (not driven by net charge)
    for (const i of lumpA) tone[i] = rng.next() < 0.5 ? 1 : -1

    for (const i of lumpB) tone[i] = rng.next() < 0.5 ? 1 : -1

    const moved = new Uint8Array(n)
    const gaps: number[] = []

    for (let t = 0; t <= beats; t++) {
      if (t % 10 === 0) {
        const s = separation(tone, lumpA, lumpB)

        gaps.push(s)
      }

      beat(tone, edges, neighbors, moved, rng, 0.06)
    }

    const valid = gaps.filter(s => s >= 0)
    const first = valid[0] ?? -1
    const last = valid[valid.length - 1] ?? -1
    const approached = first > 0 && last >= 0 && last < first - 1
    const merged = last === 0

    trials.push({ startGap, gaps, approached, merged })
  }

  // long-range attraction means the FAR-apart lumps approached. Contact-only means only the closest gap
  // merged while the far ones did not move together.
  const farTrials = trials.filter(tr => tr.startGap >= 6)
  const anyLongRangeAttraction = farTrials.some(tr => tr.approached)
  const onlyContactInteraction = !anyLongRangeAttraction
  const gravityMissing = onlyContactInteraction

  return {
    maxCells,
    lumpSize,
    trials,
    anyLongRangeAttraction,
    onlyContactInteraction,
    gravityMissing,
  }
}

export function main(): void {
  const r = gravityTest()

  console.log(
    'Gravity hole-finder: do two lumps of matter attract across a gap on the {5,3,4}?',
  )
  console.log('')
  console.log(
    `  ${r.maxCells} cells, two lumps of ${r.lumpSize} cells (neutral matter)`,
  )
  console.log('')

  for (const tr of r.trials) {
    console.log(
      `  start gap ${tr.startGap}: separation over beats = [${tr.gaps.join(', ')}]  approached: ${tr.approached}  merged: ${tr.merged}`,
    )
  }

  console.log('')
  console.log(
    `  LONG-RANGE attraction (far lumps fall together, gravity): ${r.anyLongRangeAttraction}`,
  )

  console.log(
    `  only CONTACT interaction (merge when touching, ignore across a gap): ${r.onlyContactInteraction}`,
  )
  console.log('')

  if (r.gravityMissing) {
    console.log(
      '  => HOLE FOUND. The bare rule has contact forces (merge on touch, P110) but NO long-range',
    )

    console.log(
      '     attraction. Matter does not fall together across space, so there is NO GRAVITY in the',
    )

    console.log(
      '     five base things as they stand. Gravity is a missing ingredient.',
    )
  } else {
    console.log(
      '  => Surprising, the far lumps approached, an emergent long-range attraction worth probing.',
    )
  }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
)
  main()
