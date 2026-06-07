// P40: a family of non-random substrates, and which ones are Lorentz-safe.
// P39 gave one deterministic substrate (the golden-angle sunflower). Here we test
// several at once, including the regular {p,q} hyperbolic tessellations of Margenstern's
// work ({7,3} and {5,4}), a Halton-sequence disc, and the random sprinkle, against the
// flat lattice. The decisive test is Lorentz isotropy: a flat lattice has a strong
// preferred frame, and the question is which non-random substrates avoid one. The
// striking result is that even the REGULAR hyperbolic tilings are isotropic, because
// hyperbolic curvature scrambles the global directions a flat lattice would line up.
// See note/deterministic-substrate.md. Run: npx tsx code/experiment/p40-non-random-substrates.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import {
  hyperbolicGraph,
  hyperbolicSunflower,
  hyperbolicHalton,
  hyperbolicTiling,
} from '~/substrate/hyperbolic-graph'
import { lattice } from '~/substrate/lattice'
import { Substrate, undirectedAdjacency } from '~/tool/substrate'
import { lorentzIsotropy } from '~/measure/lorentz'
import { ballGrowth } from '~/measure/dimension'

function meanDegree(s: Substrate): number {
  const adj = undirectedAdjacency({ substrate: s })
  let total = 0
  for (let i = 0; i < s.size; i++) {
    total += (adj[i] ?? new Uint32Array(0)).length
  }
  return total / Math.max(1, s.size)
}

function reachExponential(s: Substrate): boolean {
  const adj = undirectedAdjacency({ substrate: s })
  let center = 0
  let best = -1
  for (let i = 0; i < s.size; i++) {
    const d = (adj[i] ?? new Uint32Array(0)).length
    if (d > best) {
      best = d
      center = i
    }
  }
  const growth = ballGrowth({ substrate: s, center, maxRadius: 14 })
  const final = growth[growth.length - 1] ?? 1
  const ratios: number[] = []
  for (let r = 1; r < growth.length; r++) {
    const prev = growth[r - 1] ?? 0
    const cur = growth[r] ?? 0
    if (prev >= 2 && prev < 0.5 * final && cur > prev) {
      ratios.push(cur / prev)
    }
  }
  if (ratios.length === 0) {
    return false
  }
  return ratios.reduce((a, b) => a + b, 0) / ratios.length > 1.8
}

function evaluate(s: Substrate, seed: number): { degree: number; anisotropy: number; reach: boolean } {
  const aniso = lorentzIsotropy({ substrate: s, samples: 3000, rng: makeRng({ seed }) })
  return { degree: meanDegree(s), anisotropy: aniso.anisotropy, reach: reachExponential(s) }
}

export function nonRandomSubstrates(input: { seed: number }): Record<
  string,
  { degree: number; anisotropy: number; reach: boolean; lorentzSafe: boolean }
> {
  const builders: Record<string, Substrate> = {
    'random sprinkle': hyperbolicGraph({ count: 1500, radius: 7, connectThreshold: 3.0, rng: makeRng({ seed: input.seed }) }),
    'sunflower (golden angle)': hyperbolicSunflower({ count: 1500, radius: 7, connectThreshold: 3.0 }),
    'halton (2,3) disc': hyperbolicHalton({ count: 1500, radius: 7, connectThreshold: 3.0 }),
    'tiling {7,3}': hyperbolicTiling({ p: 7, q: 3, depth: 5, connectThreshold: 0.8, maxVertices: 2500 }),
    'tiling {5,4}': hyperbolicTiling({ p: 5, q: 4, depth: 6, connectThreshold: 0.9, maxVertices: 2500 }),
    'flat lattice (control)': lattice({ dimension: 2, extent: 40, signature: 'riemannian' }),
  }
  const out: Record<string, { degree: number; anisotropy: number; reach: boolean; lorentzSafe: boolean }> = {}
  for (const [name, s] of Object.entries(builders)) {
    const e = evaluate(s, input.seed + 1)
    out[name] = { ...e, lorentzSafe: e.anisotropy < 0.25 }
  }
  return out
}

export function main(): void {
  const r = nonRandomSubstrates({ seed: 1 })
  console.log('P40: a family of non-random substrates, and which are Lorentz-safe')
  console.log('')
  console.log('  substrate                  mean degree   Lorentz anisotropy   reach   Lorentz-safe')
  for (const [name, e] of Object.entries(r)) {
    console.log(
      '  ' +
        name.padEnd(26) +
        e.degree.toFixed(1).padStart(7) +
        e.anisotropy.toFixed(3).padStart(16) +
        (e.reach ? 'yes' : 'no').padStart(10) +
        (e.lorentzSafe ? 'YES' : 'no').padStart(12),
    )
  }
  console.log('')
  console.log('  The flat lattice has a strong preferred frame (anisotropy near one). Every')
  console.log('  hyperbolic substrate is Lorentz-safe (anisotropy small), INCLUDING the regular')
  console.log('  {7,3} and {5,4} tessellations, which come out as isotropic as the random sprinkle')
  console.log('  or better. The reason is curvature: in hyperbolic space there is no global')
  console.log('  parallelism, so a regular tiling fans its cell directions around the disc and')
  console.log('  never lines them up the way a flat lattice does. So regularity does not cost')
  console.log('  Lorentz invariance once the space is curved.')
  console.log('')
  console.log('  Several non-random substrates work: the golden-angle sunflower, the Halton disc,')
  console.log('  and the regular {7,3} and {5,4} tilings. Randomness is not required for a')
  console.log('  Lorentz-safe mesh. What matters is hyperbolic curvature, not disorder.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
