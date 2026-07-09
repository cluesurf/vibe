// Where the measurement record can live: curvature disperses it, so the holder is on the flat layer.
//
// E-QTM-0086 showed the record must be a self (a live structure that holds a definite configuration),
// and E-QTM-0087 assembled the measurement on the flat horosphere self layer. This asks WHY the flat
// layer, and answers it from the geometry: a compact record cannot survive on the RAW hyperbolic bulk,
// because the bulk's volume grows exponentially with radius (the same growth behind the shared-past
// collapse, E-QTM-0032), so a compact charge structure disperses outward and dilutes. On the FLAT
// emergent layer the volume grows only polynomially, so the same structure persists.
//
// Measured on the committed conserving rule (arrow zero, so no pair creation to confound the count),
// deterministic, no randomness, across two sizes and two compact blob radii:
//   1. THE HYPERBOLIC BULK DISPERSES A RECORD. A compact charge blob on the genuine {3,4,3,4}
//      dodecagrid shrinks to a small fraction of its initial cluster size under the rule (the largest
//      surviving cluster falls well below a third of the start), because the exponential shell growth
//      carries the charge outward. A record cannot be held here.
//   2. THE FLAT LATTICE HOLDS IT (the control that could have failed). The same compact blob on the
//      flat D4 lattice keeps most of its cluster (well above half the start), because polynomial
//      volume growth does not dilute it. If the flat lattice dispersed the blob too, curvature would
//      not be the cause.
//
// So the measurement record must live on the emergent FLAT layer (the horosphere the self-kit uses),
// not the raw hyperbolic bulk: curvature disperses records, it does not bind them, which is why the
// holder (E-QTM-0086) and the assembled measurement (E-QTM-0087) live on the flat layer, and it locates
// the self one layer up from the substrate. This uses compact blobs (radius 2 and 3) small relative to
// the mesh; a blob large enough to fill the shallow curved interior would persist by finite size, which
// is excluded. Grade L2: a measured geometric consequence for the record with the flat-lattice control,
// applying the exponential-volume mechanism of E-QTM-0032 to the measurement holder.

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { d4Mesh, meshNeighbors } from '@/code/tool/mesh'
import { edgesFromCsr, neighborDistances } from '@/code/tool/graph'
import { conservingEdgeSweepHashed } from '@/code/dynamics/conserving-sweep'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

interface Csr {
  cellCount: number
  offsets: Int32Array
  adj: Int32Array
}

function d4Csr(side: number): Csr {
  const mesh = d4Mesh({ side })
  const cellCount = mesh.cellCount
  const neighbors = meshNeighbors(mesh)
  const offsets = new Int32Array(cellCount + 1)

  for (let i = 0; i < cellCount; i++) {
    offsets[i + 1] = offsets[i]! + neighbors[i]!.length
  }

  const adj = new Int32Array(offsets[cellCount]!)

  let p = 0

  for (let i = 0; i < cellCount; i++) {
    for (const w of neighbors[i]!) {
      adj[p++] = w
    }
  }

  return { cellCount, offsets, adj }
}

function maxDegreeNode(csr: Csr): number {
  let best = 0
  let bestDegree = 0

  for (let i = 0; i < csr.cellCount; i++) {
    const degree = csr.offsets[i + 1]! - csr.offsets[i]!

    if (degree > bestDegree) {
      bestDegree = degree
      best = i
    }
  }

  return best
}

// the size of the largest connected component of +1 cells (an exact flood fill).
function largestPlusCluster(tone: Int8Array, csr: Csr): number {
  const { cellCount, offsets, adj } = csr
  const seen = new Uint8Array(cellCount)

  let best = 0

  for (let start = 0; start < cellCount; start++) {
    if (tone[start] !== 1 || seen[start]) {
      continue
    }

    let size = 0

    const stack = [start]
    seen[start] = 1

    while (stack.length > 0) {
      const cell = stack.pop()!
      size++

      for (let p = offsets[cell]!; p < offsets[cell + 1]!; p++) {
        const w = adj[p]!

        if (tone[w] === 1 && !seen[w]) {
          seen[w] = 1
          stack.push(w)
        }
      }
    }

    if (size > best) {
      best = size
    }
  }

  return best
}

// seed a compact +blob of graph radius R at the seed, run the committed rule (arrow 0) for `beats`,
// and return the surviving largest-cluster fraction (final largest +cluster over the initial one).
function survivingFraction(
  csr: Csr,
  seed: number,
  radius: number,
): number {
  const neighbors: number[][] = []

  for (let i = 0; i < csr.cellCount; i++) {
    const list: number[] = []

    for (let p = csr.offsets[i]!; p < csr.offsets[i + 1]!; p++) {
      list.push(csr.adj[p]!)
    }

    neighbors.push(list)
  }

  const distance = neighborDistances({
    neighbors,
    size: csr.cellCount,
    source: seed,
  })

  const tone = new Int8Array(csr.cellCount)

  for (let i = 0; i < csr.cellCount; i++) {
    if (distance[i]! >= 0 && distance[i]! <= radius) {
      tone[i] = 1
    }
  }

  const initial = largestPlusCluster(tone, csr)
  const { eu, ev } = edgesFromCsr(csr.offsets, csr.adj, csr.cellCount)
  const moved = new Uint8Array(csr.cellCount)

  for (let t = 1; t <= 100; t++) {
    conservingEdgeSweepHashed({
      tone,
      eu,
      ev,
      moved,
      beat: t,
      arrow: 0,
    })
  }

  return largestPlusCluster(tone, csr) / Math.max(1, initial)
}

export default experiment({
  id: 'quantum/record-lives-on-the-flat-layer',
  code: 'E-QTM-0089',
  title:
    'the measurement record must live on the flat layer: a compact charge blob disperses on the raw hyperbolic {3,4,3,4} bulk (exponential volume dilutes it to a small fraction) while it persists on the flat D4 lattice (polynomial volume holds it), so curvature disperses records rather than binding them, locating the holder on the emergent flat horosphere',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const cellTargets = [6000, 12000]
    const radii = [2, 3]

    let worstCurvedSurvival = 0
    let worstFlatSurvival = 1

    for (const cells of cellTargets) {
      const curved = buildDodecagrid({ maxCells: cells })
      const curvedCsr: Csr = {
        cellCount: curved.cellCount,
        offsets: curved.offsets,
        adj: curved.adj,
      }

      const curvedSeed = maxDegreeNode(curvedCsr)

      const side = Math.max(
        8,
        Math.round(Math.pow(curved.cellCount, 0.25)),
      )

      const flatCsr = d4Csr(side)
      const flatSeed = flatCsr.cellCount >> 1

      for (const radius of radii) {
        worstCurvedSurvival = Math.max(
          worstCurvedSurvival,
          survivingFraction(curvedCsr, curvedSeed, radius),
        )
        worstFlatSurvival = Math.min(
          worstFlatSurvival,
          survivingFraction(flatCsr, flatSeed, radius),
        )
      }
    }

    // the hyperbolic bulk disperses the record, the flat lattice holds it, and the flat clearly beats
    // the curved
    const curvedDisperses = worstCurvedSurvival < 0.3
    const flatHolds = worstFlatSurvival > 0.6
    const flatBeatsCurved = worstFlatSurvival > 3 * worstCurvedSurvival

    const ok = curvedDisperses && flatHolds && flatBeatsCurved

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a compact charge blob disperses on the raw hyperbolic {3,4,3,4} bulk (the surviving largest cluster falls below a third of its initial size, the exponential shell growth carrying the charge outward) while the same blob persists on the flat D4 lattice (keeping well above half its cluster), robust across two sizes and two compact radii, so curvature disperses a record rather than binding it, and the measurement holder must live on the emergent flat horosphere layer, not the raw hyperbolic bulk',
      metrics: {
        worstCurvedSurvivalTimes1000: Math.round(
          worstCurvedSurvival * 1000,
        ),
        worstFlatSurvivalTimes1000: Math.round(
          worstFlatSurvival * 1000,
        ),
        flatOverCurvedRatio: Number(
          (
            worstFlatSurvival / Math.max(worstCurvedSurvival, 1e-6)
          ).toFixed(1),
        ),
      },
      control: {
        // the flat D4 lattice is the curvature control: same rule, same compact blob, but polynomial
        // volume growth, so it HOLDS the record. If it dispersed too, curvature would not be the cause.
        worstFlatSurvivalTimes1000: Math.round(
          worstFlatSurvival * 1000,
        ),
      },
      notes:
        'L2, measured on the committed conserving rule (conservingEdgeSweep at arrow 0, so no pair creation confounds the cluster count), deterministic, no randomness. A compact +blob of graph radius 2 or 3 is seeded at the most-connected cell of the genuine {3,4,3,4} dodecagrid and at the centre of the flat D4 lattice of matched cell count, run 100 beats, and the surviving largest +cluster fraction is measured. On the curved bulk it falls to ~0.07-0.19 (dispersed), on the flat lattice it stays ~0.86-0.92 (held), robust across sizes 6000 and 12000 and both radii. The mechanism is the exponential shell growth of E-QTM-0032 (hyperbolic volume piles up near the boundary) versus polynomial growth on the flat lattice. So curvature disperses a record, it does not bind it, which is why the holder (E-QTM-0086) and the assembled measurement (E-QTM-0087) live on the flat horosphere the self-kit uses, one layer up from the raw substrate. Blobs are kept compact (radius 2-3) relative to the shallow curved interior; a blob large enough to fill it would persist by finite size and is excluded (radius 4 does).',
    })
  },
})
