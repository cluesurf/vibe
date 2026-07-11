// Whether a coherent record stays localized under the arrow-driven conserving rule, the measure
// behind the Lyapunov recordability ceiling. A record here is a compact same-sign blob (a
// localized excess of one tone). The question is whether, after the rule runs, the blob's excess
// is still concentrated where it started (a held record) or has been spread out to the background
// density (a washed-out record). Two things can wash it out: the arrow's chaos (mixing the excess
// into the created-pair sea) or, at arrow zero, plain diffusion.

import { neighborDistances, edgesFromCsr } from '@/code/tool/graph'
import { conservingEdgeSweepHashed } from '@/code/dynamics/conserving-sweep'

type Csr = {
  cellCount: number
  offsets: Int32Array
  adj: Int32Array
}

function neighborsOf(csr: Csr): number[][] {
  const out: number[][] = []

  for (let i = 0; i < csr.cellCount; i++) {
    const list: number[] = []

    for (let p = csr.offsets[i]!; p < csr.offsets[i + 1]!; p++)
      list.push(csr.adj[p]!)

    out.push(list)
  }

  return out
}

// Seed a compact +blob: every cell within graph radius `radius` of `center` set to +1, the rest at
// peace. The connected same-sign record the persistence and cluster measures start from.
export function seedCompactBlob(input: {
  csr: Csr
  center: number
  radius: number
}): Int8Array {
  const { csr, center, radius } = input
  const distance = neighborDistances({
    neighbors: neighborsOf(csr),
    size: csr.cellCount,
    source: center,
  })

  const tone = new Int8Array(csr.cellCount)

  for (let i = 0; i < csr.cellCount; i++) {
    if (distance[i]! >= 0 && distance[i]! <= radius) tone[i] = 1
  }

  return tone
}

// The record CONTRAST after `beats` of the arrow-driven conserving rule: seed a compact +blob at
// `center`, evolve, and return the +density inside the original blob region minus the +density
// outside it. Contrast near one means the record stayed localized; near zero means it washed out.
// Because the arrow floods BOTH the region and the background with created pairs equally, a raised
// background alone does not lower the contrast, only MIXING the blob's own excess away does, so the
// contrast reads record coherence and not the flood level.
export function recordContrast(input: {
  csr: Csr
  center: number
  radius: number
  arrow: number
  beats: number
}): {
  contrast: number
  insideDensity: number
  outsideDensity: number
} {
  const { csr, center, radius, arrow, beats } = input
  const tone = seedCompactBlob({ csr, center, radius })
  const inRegion = new Uint8Array(csr.cellCount)

  let regionSize = 0

  for (let i = 0; i < csr.cellCount; i++) {
    if (tone[i] === 1) {
      inRegion[i] = 1
      regionSize++
    }
  }

  const { eu, ev } = edgesFromCsr(csr.offsets, csr.adj, csr.cellCount)
  const moved = new Uint8Array(csr.cellCount)

  for (let t = 1; t <= beats; t++)
    conservingEdgeSweepHashed({ tone, eu, ev, moved, beat: t, arrow })

  let inPlus = 0
  let outPlus = 0

  for (let i = 0; i < csr.cellCount; i++) {
    if (tone[i] === 1) {
      if (inRegion[i]) {
        inPlus++
      } else {
        outPlus++
      }
    }
  }

  const insideDensity = inPlus / Math.max(1, regionSize)
  const outsideDensity =
    outPlus / Math.max(1, csr.cellCount - regionSize)

  return {
    contrast: insideDensity - outsideDensity,
    insideDensity,
    outsideDensity,
  }
}
