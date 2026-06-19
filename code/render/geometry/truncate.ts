// Tiling variants by vertex truncation.
//
// HyperRogue exposes truncated and rectified variants of every regular tiling. We reach the same family with a
// pure Scene transform, no new builder and no file format. Truncation cuts a small polygon out of every vertex.
// A regular tiling {p,q} becomes a two-face tiling, the original p-gons shrink to 2p-gons and a fresh q-gon
// appears at each former vertex. At the truncation fraction 1/2 the original faces vanish and the result is the
// rectification, the quasiregular tiling with the vertex figures of both {p,q} and its dual.
//
// The transform is geometric, it works on the ball points of any Scene we build, in any dimension where the
// edges meet at shared vertices (the 2D tilings). It reads only the edge list, so it composes with every
// generator.

import { Scene, SceneEdge, Vec } from '@/code/render/scene'
import {
  mobiusAdd,
  negate,
  gyroScale,
} from '@/code/render/geometry/isometry'

// the point a fraction `t` of the way along the geodesic from `a` to `b`, in gyrovector form. t=0 is a, t=1 is b.
function geodesicFraction(a: Vec, b: Vec, t: number): Vec {
  return mobiusAdd(a, gyroScale(mobiusAdd(negate(a), b), t))
}

// a stable key for a ball point, so coincident edge endpoints collapse to one vertex
function vertexKey(v: Vec): string {
  return v.map(x => Math.round(x * 1e6) / 1e6).join(',')
}

export type TruncateOptions = {
  // how far along each incident edge to make the cut. 1/3 is the classic truncation, 1/2 is the rectification
  // (the original faces shrink to points), values in (0, 1/2].
  fraction?: number
}

// Truncate a 2D tiling Scene. Every vertex is replaced by the polygon of cut points around it, and every
// original edge is shortened to the segment between its two cut points.
export function truncateScene(
  scene: Scene,
  options: TruncateOptions = {},
): Scene {
  const fraction = options.fraction ?? 1 / 3

  // collect vertices and, for each, the neighbours it shares an edge with
  const vertexAt = new Map<string, Vec>()
  const neighbours = new Map<string, Vec[]>()

  const note = (v: Vec, u: Vec) => {
    const key = vertexKey(v)
    if (!vertexAt.has(key)) {
      vertexAt.set(key, v)
      neighbours.set(key, [])
    }
    neighbours.get(key)!.push(u)
  }

  for (const edge of scene.edges) {
    note(edge.a, edge.b)
    note(edge.b, edge.a)
  }

  const edges: SceneEdge[] = []

  // the cut point on edge (v -> u), keyed so the shortened-edge pass can find both ends
  const cutAt = new Map<string, Vec>()
  const cutKey = (vKey: string, uKey: string) => `${vKey}|${uKey}`

  // (1) the new polygon carved out of each vertex
  for (const [key, v] of vertexAt) {
    const around = neighbours.get(key)!
    // order the neighbours cyclically by translating v to the origin, where direction is a plain angle
    const ordered = around
      .map(u => {
        const local = mobiusAdd(negate(v), u)
        return { u, angle: Math.atan2(local[1] ?? 0, local[0] ?? 0) }
      })
      .sort((p, q) => p.angle - q.angle)

    const cuts = ordered.map(({ u }) => {
      const cut = geodesicFraction(v, u, fraction)
      cutAt.set(cutKey(key, vertexKey(u)), cut)
      return cut
    })

    // connect consecutive cut points into the truncation face boundary
    for (let i = 0; i < cuts.length; i++) {
      const a = cuts[i]!
      const b = cuts[(i + 1) % cuts.length]!
      if (cuts.length === 2 && i === 1) {
        break
      } // a degree-2 vertex makes a single segment, not a digon
      edges.push({ a, b })
    }
  }

  // (2) the shortened original edges, between the two cut points of each undirected edge
  const seen = new Set<string>()
  for (const edge of scene.edges) {
    const ka = vertexKey(edge.a)
    const kb = vertexKey(edge.b)
    const undirected = ka < kb ? `${ka}~${kb}` : `${kb}~${ka}`
    if (seen.has(undirected)) {
      continue
    }
    seen.add(undirected)
    const a = cutAt.get(cutKey(ka, kb))
    const b = cutAt.get(cutKey(kb, ka))
    if (a && b) {
      edges.push({ a, b })
    }
  }

  return {
    dim: scene.dim,
    symbol: scene.symbol,
    edges,
    cellCount: vertexAt.size + scene.cellCount,
  }
}
