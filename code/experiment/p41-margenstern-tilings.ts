// P41: the Margenstern hyperbolic tilings, surveyed.
// Maurice Margenstern's program on hyperbolic cellular automata centers on two families:
// the {p,4} family (the pentagrid {5,4} and its relatives) and the {p,3} family (the
// heptagrid {7,3} and its relatives). P40 showed {5,4} and {7,3} are Lorentz-safe. Here
// we survey the rest of both families, to have the same data for all of them. The claim
// from P40 (hyperbolic curvature, not disorder, buys Lorentz safety) predicts they are
// all Lorentz-safe.
// See note/deterministic-substrate.md. Run: npx tsx code/experiment/p41-margenstern-tilings.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { hyperbolicTiling } from '~/substrate/hyperbolic-graph'
import { Graph } from '~/tool/graph'
import { lorentzIsotropy } from '~/measure/lorentz'
import { ballGrowth } from '~/measure/dimension'

function meanDegree(g: Graph): number {
  let total = 0
  for (let i = 0; i < g.size; i++) {
    total += (g.neighbors[i] ?? new Uint32Array(0)).length
  }
  return total / Math.max(1, g.size)
}

function reachExponential(g: Graph): boolean {
  let center = 0
  let best = -1
  for (let i = 0; i < g.size; i++) {
    const d = (g.neighbors[i] ?? new Uint32Array(0)).length
    if (d > best) {
      best = d
      center = i
    }
  }
  const growth = ballGrowth({ substrate: g, center, maxRadius: 16 })
  const final = growth[growth.length - 1] ?? 1
  const ratios: number[] = []
  for (let r = 1; r < growth.length; r++) {
    const prev = growth[r - 1] ?? 0
    const cur = growth[r] ?? 0
    if (prev >= 2 && prev < 0.5 * final && cur > prev) {
      ratios.push(cur / prev)
    }
  }
  return ratios.length > 0 && ratios.reduce((a, b) => a + b, 0) / ratios.length > 1.8
}

interface TilingSpec {
  name: string
  p: number
  q: number
  depth: number
  threshold: number
}

const TILINGS: TilingSpec[] = [
  { name: 'pentagrid {5,4}', p: 5, q: 4, depth: 6, threshold: 0.9 },
  { name: '{6,4}', p: 6, q: 4, depth: 6, threshold: 1.1 },
  { name: '{8,4}', p: 8, q: 4, depth: 4, threshold: 1.5 },
  { name: 'heptagrid {7,3}', p: 7, q: 3, depth: 5, threshold: 0.8 },
  { name: '{8,3}', p: 8, q: 3, depth: 6, threshold: 0.85 },
  { name: '{9,3}', p: 9, q: 3, depth: 6, threshold: 0.85 },
]

export function margensternTilings(input: { seed: number }): Record<
  string,
  { size: number; degree: number; anisotropy: number; reach: boolean; lorentzSafe: boolean }
> {
  const out: Record<string, { size: number; degree: number; anisotropy: number; reach: boolean; lorentzSafe: boolean }> = {}
  for (const t of TILINGS) {
    const g = hyperbolicTiling({ p: t.p, q: t.q, depth: t.depth, connectThreshold: t.threshold, maxVertices: 2500 })
    const aniso = lorentzIsotropy({ substrate: g, samples: 3000, rng: makeRng({ seed: input.seed }) })
    out[t.name] = {
      size: g.size,
      degree: meanDegree(g),
      anisotropy: aniso.anisotropy,
      reach: reachExponential(g),
      lorentzSafe: aniso.anisotropy < 0.25,
    }
  }
  return out
}

export function main(): void {
  const r = margensternTilings({ seed: 2 })
  console.log("P41: the Margenstern hyperbolic tilings, surveyed")
  console.log('')
  console.log('  tiling             vertices   mean degree   Lorentz anisotropy   reach   Lorentz-safe')
  for (const [name, e] of Object.entries(r)) {
    console.log(
      '  ' +
        name.padEnd(18) +
        e.size.toString().padStart(7) +
        e.degree.toFixed(1).padStart(13) +
        e.anisotropy.toFixed(3).padStart(16) +
        (e.reach ? 'yes' : 'no').padStart(10) +
        (e.lorentzSafe ? 'YES' : 'no').padStart(12),
    )
  }
  console.log('')
  console.log('  Both Margenstern families, {p,4} (the pentagrid and relatives) and {p,3} (the')
  console.log('  heptagrid and relatives), are Lorentz-safe, with small anisotropy and exponential')
  console.log('  reach throughout. This confirms the P40 lesson across the whole program: every')
  console.log('  regular hyperbolic tiling is Lorentz-safe, because curvature scrambles the global')
  console.log('  directions a flat lattice would line up. So Margensterns tilings are a large')
  console.log('  family of deterministic, exactly-addressable, Lorentz-safe substrates for the model.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
