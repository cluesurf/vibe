// P47: the Coxeter unification (one machine, all the tessellations).
// The choosing-the-base analysis argues the tilings are not separate objects but special
// cases of one construction, the Coxeter (reflection-group) orbit, named by a Schlafli
// symbol. Here we run {7,3}, {5,4}, and {5,3,4} (2D and 3D) through ONE generator,
// coxeterTessellation, by only changing the symbol, and confirm all are Lorentz-safe. So
// the heptagrid, the pentagrid, and the dodecagrid are one machine on different settings.
// See the choosing-the-base analysis. Run: npx tsx code/experiment/p47-coxeter-unification.ts

import { makeRng } from '@/code/tool/rng'
import { coxeterTessellation } from '@/code/substrate/coxeter'
import { meanDegree } from '@/code/tool/graph'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// meanDegree lives in code/tool/graph.

const SYMBOLS: { name: string; schlafli: number[] }[] = [
  { name: 'heptagrid {7,3}', schlafli: [7, 3] },
  { name: 'pentagrid {5,4}', schlafli: [5, 4] },
  { name: '{8,3}', schlafli: [8, 3] },
  { name: '{6,4}', schlafli: [6, 4] },
  { name: 'dodecagrid {5,3,4}', schlafli: [5, 3, 4] },
]

export function coxeterUnification(input: { seed: number }): Record<
  string,
  {
    dimension: number
    size: number
    degree: number
    anisotropy: number
    lorentzSafe: boolean
  }
> {
  const out: Record<
    string,
    {
      dimension: number
      size: number
      degree: number
      anisotropy: number
      lorentzSafe: boolean
    }
  > = {}

  for (const sym of SYMBOLS) {
    const g = coxeterTessellation({
      schlafli: sym.schlafli,
      maxVertices: 2500,
    })

    const aniso = lorentzIsotropy({
      substrate: g,
      samples: 3000,
      rng: makeRng({ seed: input.seed }),
    })

    out[sym.name] = {
      dimension: sym.schlafli.length,
      size: g.size,
      degree: meanDegree(g),
      anisotropy: aniso.anisotropy,
      lorentzSafe: aniso.anisotropy < 0.25,
    }
  }

  return out
}

export default experiment({
  id: 'geometry/coxeter-unification',
  code: 'E-GMT-0005',
  title: 'one machine yields all the tessellations, all Lorentz-safe',
  category: 'geometry',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = coxeterUnification({ seed: 2 })
    const all = Object.values(r)
    const ok =
      all.length === 5 &&
      all.every(e => e.lorentzSafe) &&
      all.some(e => e.dimension === 3)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'changing the Schlafli symbol of one generator yields five tessellations spanning 2D and 3D that are all Lorentz-safe',
      metrics: {
        tessellationCount: all.length,
        maxAnisotropy: Math.max(...all.map(e => e.anisotropy)),
      },
    })
  },
})
