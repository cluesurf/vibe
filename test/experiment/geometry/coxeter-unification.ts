// P47: the Coxeter unification (one machine, all the tessellations).
// The choosing-the-base analysis argues the tilings are not separate objects but special
// cases of one construction, the Coxeter (reflection-group) orbit, named by a Schlafli
// symbol. Here we run {7,3}, {5,4}, and {5,3,4} (2D and 3D) through ONE generator,
// coxeterTessellation, by only changing the symbol, and confirm all are Lorentz-safe. So
// the heptagrid, the pentagrid, and the dodecagrid are one machine on different settings.
// See the choosing-the-base analysis. Run: npx tsx code/experiment/p47-coxeter-unification.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '@/code/tool/rng'
import { coxeterTessellation } from '@/code/substrate/coxeter'
import { Graph } from '@/code/tool/graph'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function meanDegree(g: Graph): number {
  let total = 0
  for (let i = 0; i < g.size; i++) {
    total += (g.neighbors[i] ?? new Uint32Array(0)).length
  }
  return total / Math.max(1, g.size)
}

const SYMBOLS: { name: string; schlafli: number[] }[] = [
  { name: 'heptagrid {7,3}', schlafli: [7, 3] },
  { name: 'pentagrid {5,4}', schlafli: [5, 4] },
  { name: '{8,3}', schlafli: [8, 3] },
  { name: '{6,4}', schlafli: [6, 4] },
  { name: 'dodecagrid {5,3,4}', schlafli: [5, 3, 4] },
]

export function coxeterUnification(input: { seed: number }): Record<
  string,
  { dimension: number; size: number; degree: number; anisotropy: number; lorentzSafe: boolean }
> {
  const out: Record<string, { dimension: number; size: number; degree: number; anisotropy: number; lorentzSafe: boolean }> = {}
  for (const sym of SYMBOLS) {
    const g = coxeterTessellation({ schlafli: sym.schlafli, maxVertices: 2500 })
    const aniso = lorentzIsotropy({ substrate: g, samples: 3000, rng: makeRng({ seed: input.seed }) })
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

export function main(): void {
  const r = coxeterUnification({ seed: 2 })
  console.log('P47: the Coxeter unification (one machine, all the tessellations)')
  console.log('')
  console.log('  every tiling below comes from the SAME generator, coxeterTessellation,')
  console.log('  by changing only the Schlafli symbol:')
  console.log('')
  console.log('  tessellation          dim   vertices   mean degree   Lorentz anisotropy   Lorentz-safe')
  for (const [name, e] of Object.entries(r)) {
    console.log(
      '  ' +
        name.padEnd(22) +
        `${e.dimension}D`.padStart(4) +
        e.size.toString().padStart(10) +
        e.degree.toFixed(1).padStart(13) +
        e.anisotropy.toFixed(3).padStart(16) +
        (e.lorentzSafe ? 'YES' : 'no').padStart(12),
    )
  }
  console.log('')
  console.log('  The heptagrid, the pentagrid, the {8,3} and {6,4} relatives, and the 3D dodecagrid')
  console.log('  are not separate inventions. They are one construction, the Coxeter reflection-group')
  console.log('  orbit, on different settings of the Schlafli symbol. All are Lorentz-safe. So the')
  console.log('  base of the model is not a chosen tiling but the reflection-group principle itself,')
  console.log('  and the specific tiling is a special case, a gauge choice among equivalent options.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}

export default defineExperiment({
  id: 'geometry/coxeter-unification',
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
      all.every((e) => e.lorentzSafe) &&
      all.some((e) => e.dimension === 3)
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'changing the Schlafli symbol of one generator yields five tessellations spanning 2D and 3D that are all Lorentz-safe',
      metrics: {
        tessellationCount: all.length,
        maxAnisotropy: Math.max(...all.map((e) => e.anisotropy)),
      },
    })
  },
})
