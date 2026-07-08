// P170: the non-local bulk channel beneath the physical layer. (P111, P142, 13-the-esoteric-realm.md.)
//
// The physical world lives on the emergent FLAT layer (a horosphere / shell, P142). But beneath it the
// hyperbolic BULK has a TINY diameter (P111), so two points that are FAR apart ALONG the flat physical
// layer are only a few hops apart THROUGH the bulk. This is a real, geometric, non-local channel hidden
// beneath physical space, the substrate's "ether". We measure, on a shell (the physical surface) of the
// {5,3,4}, the WITHIN-SURFACE distance between two cells versus their THROUGH-BULK distance, and show the
// surface distance vastly exceeds the bulk distance (or the surface is disconnected entirely). This is the
// honest, tested STRUCTURE that the esoteric reading interprets as telepathy and synchronicity, distant
// minds connected beneath the physical. Run: npx tsx code/experiment/p170-bulk-nonlocality.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { csrDistances } from '@/code/tool/graph'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function bulkNonlocality(input?: { n?: number }): {
  n: number
  shellRadius: number
  shellSize: number
  meanBulkDistance: number
  meanSurfaceDistance: number
  unreachableFraction: number
  ratio: number
  nonLocalChannel: boolean
  solved: boolean
} {
  const n = input?.n ?? 40000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount

  const nbr = (i: number): number[] => {
    const out: number[] = []

    for (let p = g.offsets[i]!; p < g.offsets[i + 1]!; p++) {
      out.push(g.adj[p]!)
    }

    return out
  }

  const bfs = (src: number, allowed?: Uint8Array): Int32Array =>
    csrDistances({
      offsets: g.offsets,
      adj: g.adj,
      size: N,
      source: src,
      allowed,
    })

  // radial layers from a root, the shell at radius R is a "physical surface" (a horosphere-like sphere)
  const radial = bfs(0)

  let maxR = 0

  for (let i = 0; i < N; i++) {
    if (radial[i]! > maxR) {
      maxR = radial[i]!
    }
  }

  // count internal edges per shell, and pick the shell with the MOST internal edges (a real connected
  // surface, not the all-leaf outer frontier)
  const internalEdges = new Array<number>(maxR + 1).fill(0)

  for (let v = 0; v < N; v++) {
    const rv = radial[v]!

    if (rv < 0) {
      continue
    }

    for (const w of nbr(v)) {
      if (w > v && radial[w] === rv) {
        internalEdges[rv]!++
      }
    }
  }

  let shellRadius = 1

  for (let r = 1; r <= maxR; r++) {
    if (internalEdges[r]! > internalEdges[shellRadius]!) {
      shellRadius = r
    }
  }

  const onShell = new Uint8Array(N)
  const shellCells: number[] = []

  for (let i = 0; i < N; i++) {
    if (radial[i] === shellRadius) {
      onShell[i] = 1
      shellCells.push(i)
    }
  }

  // for several source cells, find the BULK-farthest surface cell (the physically distant target), and
  // compare its through-bulk distance to its within-surface distance
  let bulkSum = 0
  let surfSum = 0
  let pairs = 0
  let unreachable = 0
  let unreachableTotal = 0

  const samples = Math.min(12, shellCells.length)

  for (let s = 0; s < samples; s++) {
    const src =
      shellCells[Math.floor((s * shellCells.length) / samples)]!

    const dBulk = bfs(src) // through the whole bulk
    const dSurf = bfs(src, onShell) // restricted to the physical surface

    // the bulk-farthest surface cell = a physically distant target
    let far = src

    for (const c of shellCells) {
      if (c === src) {
        continue
      }

      if (dBulk[c]! > dBulk[far]!) {
        far = c
      }
    }

    if (far === src) {
      continue
    }

    bulkSum += dBulk[far]!
    pairs++
    // its within-surface distance (or unreachable)
    unreachableTotal++

    if (dSurf[far] === -1) {
      unreachable++
    } else {
      surfSum += dSurf[far]!
    }
  }

  const meanBulkDistance = pairs > 0 ? bulkSum / pairs : 0
  const reachablePairs = pairs - unreachable
  const meanSurfaceDistance =
    reachablePairs > 0 ? surfSum / reachablePairs : Infinity

  const unreachableFraction =
    unreachableTotal > 0 ? unreachable / unreachableTotal : 0

  // ratio = how much longer the physical-surface path is than the bulk path (infinite if the surface is
  // disconnected, so the bulk is the ONLY channel)
  const ratio =
    reachablePairs > 0 && meanBulkDistance > 0
      ? meanSurfaceDistance / meanBulkDistance
      : Infinity

  // a non-local channel exists if the surface path is much longer than the bulk path, or the surface is
  // largely disconnected (so the bulk is the only channel)
  const nonLocalChannel = ratio > 2.5 || unreachableFraction > 0.5
  const solved = nonLocalChannel

  return {
    n: N,
    shellRadius,
    shellSize: shellCells.length,
    meanBulkDistance,
    meanSurfaceDistance,
    unreachableFraction,
    ratio,
    nonLocalChannel,
    solved,
  }
}

export default experiment({
  id: 'holography/bulk-nonlocality',
  code: 'E-HLG-0004',
  title:
    'distant surface points are joined by a short hidden path through the bulk',
  category: 'holography',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = bulkNonlocality({ n: 40000 })
    const ok = r.solved && r.nonLocalChannel

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the physical surface is internally disconnected so distant surface points are joined only by a short path through the tree-like hyperbolic bulk',
      metrics: {
        unreachableFraction: r.unreachableFraction,
        meanBulkDistance: r.meanBulkDistance,
        meanSurfaceDistance: r.meanSurfaceDistance,
      },
      control: { meanSurfaceDistance: r.meanSurfaceDistance },
    })
  },
})
