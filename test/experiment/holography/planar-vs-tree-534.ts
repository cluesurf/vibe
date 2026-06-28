import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'

// Refinement of happy-tiling-534. That experiment modelled the holographic code on the bulk TREE. The real
// HaPPY code lives on the PLANAR tiling, which has tangential loops the radial tree lacks. The loops give a
// bulk cell extra paths to the boundary, so it recovers more after a cut. We build a hyperbolic planar tiling
// ({7,3}) and its BFS spanning tree, erase a partial mid-depth annulus (cut cells), and measure how much of the
// boundary stays connected to the centre. On the planar tiling the loops route around the cut, so more boundary
// stays reachable than on the tree, hence the tree model is a conservative lower bound on the planar code.

const reachableBoundary = (
  neighbors: readonly (readonly number[])[],
  erased: boolean[],
  boundary: number[],
  centre: number,
): number => {
  const seen = new Uint8Array(neighbors.length)
  seen[centre] = 1

  let frontier = [centre]

  while (frontier.length) {
    const next: number[] = []

    for (const u of frontier) {
      for (const v of neighbors[u]!) {
        if (!erased[v] && seen[v] === 0) {
          seen[v] = 1
          next.push(v)
        }
      }
    }

    frontier = next
  }

  let reached = 0

  for (const b of boundary) {
    if (seen[b] === 1) {
      reached += 1
    }
  }

  return reached
}

export default experiment({
  id: 'holography/planar-vs-tree-534',
  code: 'E-HLG-0017',
  title:
    'the planar tiling loops keep more boundary reachable after a cut than the bulk tree (the HaPPY refinement)',
  category: 'holography',
  substrates: ['73'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = buildCoxeterMatrixMesh([7, 3], 1500)
    const planar = mesh.adjacency.map(row => row.filter(n => n >= 0))
    const size = planar.length
    const depth: number[] = new Array<number>(size).fill(-1)
    const parent: number[] = new Array<number>(size).fill(-1)
    depth[0] = 0

    let frontier = [0]

    while (frontier.length) {
      const next: number[] = []

      for (const u of frontier) {
        for (const v of planar[u]!) {
          if (depth[v] === -1) {
            depth[v] = depth[u]! + 1
            parent[v] = u
            next.push(v)
          }
        }
      }

      frontier = next
    }

    const maxDepth = depth.reduce((m, d) => Math.max(m, d), 0)
    const tree: number[][] = Array.from({ length: size }, () => [])

    for (let v = 0; v < size; v++) {
      if (parent[v] !== -1) {
        tree[v]!.push(parent[v]!)
        tree[parent[v]!]!.push(v)
      }
    }

    const boundary = [...Array(size).keys()].filter(
      c => (depth[c]!) === maxDepth - 1,
    )

    // erase every other cell of a mid-depth annulus (a partial cut)
    const cutDepth = Math.floor(maxDepth / 2)
    const erased: boolean[] = new Array<boolean>(size).fill(false)

    let cut = 0

    for (let c = 0; c < size; c++) {
      if (depth[c] === cutDepth && c % 2 === 0) {
        erased[c] = true
        cut += 1
      }
    }

    const planarReach = reachableBoundary(planar, erased, boundary, 0)
    const treeReach = reachableBoundary(tree, erased, boundary, 0)
    const planarKeepsMore = planarReach > treeReach * 1.1

    return verdict({
      status: planarKeepsMore ? 'pass' : 'fail',
      claim:
        'after erasing a partial mid-depth annulus, the planar hyperbolic tiling keeps far more of the boundary connected to the bulk centre than its spanning tree, because the tangential loops route around the cut, so the bulk-tree model of the holographic code understates the planar code robustness',
      metrics: {
        cells: size,
        cutCells: cut,
        planarBoundaryReached: planarReach,
        treeBoundaryReached: treeReach,
        planarKeepsMore: planarKeepsMore ? 1 : 0,
      },
      // CONTROL: the spanning tree (no loops, the bulk-tree model of happy-tiling-534) loses every subtree
      // below an erased cut cell, so its reachable boundary collapses, the extra robustness is the loops.
      control: {
        treeBoundaryReached: treeReach,
        totalBoundary: boundary.length,
      },
      notes:
        'Refines happy-tiling-534 (the bulk-tree model) toward the planar tensor network. The tree distance 3^depth is a lower bound, the planar loops only add recovery paths. A full stabilizer planar contraction of the {5,4} tiling is the complete version.',
    })
  },
})
