// P40: a family of non-random substrates, and which ones are Lorentz-safe.
// P39 gave one deterministic substrate (the golden-angle sunflower). Here we test
// several at once, including the regular {p,q} hyperbolic tessellations of Margenstern's
// work ({7,3} and {5,4}), a Halton-sequence disc, and the random sprinkle, against the
// flat lattice. The decisive test is Lorentz isotropy: a flat lattice has a strong
// preferred frame, and the question is which non-random substrates avoid one. The
// striking result is that even the REGULAR hyperbolic tilings are isotropic, because
// hyperbolic curvature scrambles the global directions a flat lattice would line up.
// See note/deterministic-substrate.md. Run: npx tsx code/experiment/p40-non-random-substrates.ts

import { makeRng } from '@/code/tool/rng'
import {
  hyperbolicGraph,
  hyperbolicSunflower,
  hyperbolicHalton,
  hyperbolicTiling,
} from '@/code/substrate/hyperbolic-graph'
import { lattice } from '@/code/substrate/lattice'
import {
  Substrate,
  substrateUndirectedMeanDegree,
} from '@/code/tool/substrate'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import { reachIsExponential } from '@/code/measure/dimension'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The exponential-reach classifier lives in code/measure/dimension.
const reachExponential = (s: Substrate): boolean =>
  reachIsExponential({ substrate: s, maxRadius: 14 })

function evaluate(
  s: Substrate,
  seed: number,
): { degree: number; anisotropy: number; reach: boolean } {
  const aniso = lorentzIsotropy({
    substrate: s,
    samples: 3000,
    rng: makeRng({ seed }),
  })

  return {
    degree: substrateUndirectedMeanDegree({ substrate: s }),
    anisotropy: aniso.anisotropy,
    reach: reachExponential(s),
  }
}

export function nonRandomSubstrates(input: { seed: number }): Record<
  string,
  {
    degree: number
    anisotropy: number
    reach: boolean
    lorentzSafe: boolean
  }
> {
  const builders: Record<string, Substrate> = {
    'random sprinkle': hyperbolicGraph({
      count: 1500,
      radius: 7,
      connectThreshold: 3.0,
      rng: makeRng({ seed: input.seed }),
    }),
    'sunflower (golden angle)': hyperbolicSunflower({
      count: 1500,
      radius: 7,
      connectThreshold: 3.0,
    }),
    'halton (2,3) disc': hyperbolicHalton({
      count: 1500,
      radius: 7,
      connectThreshold: 3.0,
    }),
    'tiling {7,3}': hyperbolicTiling({
      p: 7,
      q: 3,
      depth: 5,
      connectThreshold: 0.8,
      maxVertices: 2500,
    }),
    'tiling {5,4}': hyperbolicTiling({
      p: 5,
      q: 4,
      depth: 6,
      connectThreshold: 0.9,
      maxVertices: 2500,
    }),
    'flat lattice (control)': lattice({
      dimension: 2,
      extent: 40,
      signature: 'riemannian',
    }),
  }

  const out: Record<
    string,
    {
      degree: number
      anisotropy: number
      reach: boolean
      lorentzSafe: boolean
    }
  > = {}

  for (const [name, s] of Object.entries(builders)) {
    const e = evaluate(s, input.seed + 1)
    out[name] = { ...e, lorentzSafe: e.anisotropy < 0.25 }
  }

  return out
}

export default experiment({
  id: 'substrate-survey/non-random-substrates',
  code: 'E-SBT-0016',
  title:
    'every hyperbolic substrate is Lorentz-safe while the flat lattice is not',
  category: 'substrate-survey',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = nonRandomSubstrates({ seed: 1 })
    const hyperbolicSafe = [
      'random sprinkle',
      'sunflower (golden angle)',
      'halton (2,3) disc',
      'tiling {7,3}',
      'tiling {5,4}',
    ].every(k => r[k]?.lorentzSafe === true)

    const latticeUnsafe =
      r['flat lattice (control)']?.lorentzSafe === false

    const tilingsIsotropic =
      (r['tiling {7,3}']?.anisotropy ?? 1) < 0.1 &&
      (r['tiling {5,4}']?.anisotropy ?? 1) < 0.1

    const ok = hyperbolicSafe && latticeUnsafe && tilingsIsotropic

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'random, sunflower, halton, and the regular hyperbolic tilings are all Lorentz-safe while the flat lattice is not, so regularity does not break Lorentz invariance once the space is curved',
      metrics: {
        anisotropy73: r['tiling {7,3}']?.anisotropy ?? 0,
        anisotropy54: r['tiling {5,4}']?.anisotropy ?? 0,
      },
      control: {
        anisotropyFlatLattice:
          r['flat lattice (control)']?.anisotropy ?? 0,
      },
    })
  },
})
