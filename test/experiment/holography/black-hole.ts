// P33: black-hole entropy (the Bekenstein-Hawking area law).
// A black hole's entropy is proportional to its horizon AREA, not its volume (S = A/4),
// the founding clue of holography. The entanglement entropy of a spatial region across
// its boundary is the microscopic origin: the boundary is the horizon, and the entropy
// lives on it. P15 showed the 2D area law (entropy grows with the perimeter). Here we
// do the 3D case, the actual Bekenstein-Hawking setting: the entanglement entropy of a
// cubic region scales with its SURFACE AREA (l^2), not its volume (l^3). So a horizon's
// entropy is set by its area. See note/questions/frontiers.md. Run:
// npx tsx code/experiment/p33-black-hole.ts

import { linearFit } from '@/code/measure/regression'
import {
  freeFermionCorrelationMatrix,
  regionEntanglementEntropy,
} from '@/code/measure/entanglement'
import { torusHoppingHamiltonian } from '@/code/operator/tight-binding'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function blackHoleEntropy(input: { side: number }): {
  ells: number[]
  entropies: number[]
  areaResidual: number
  volumeResidual: number
  areaBeatsVolume: boolean
} {
  const side = input.side
  const n = side * side * side
  const c = freeFermionCorrelationMatrix({
    h: torusHoppingHamiltonian({ dimension: 3, side }),
    n,
  })
  const ells = [2, 3, 4]
  const entropies: number[] = []
  for (const l of ells) {
    const region: number[] = []
    for (let z = 0; z < l; z++) {
      for (let y = 0; y < l; y++) {
        for (let x = 0; x < l; x++) {
          region.push((z * side + y) * side + x)
        }
      }
    }
    entropies.push(regionEntanglementEntropy({ c, n, region }))
  }
  const area = ells.map(l => l * l) // horizon surface area ~ l^2
  const volume = ells.map(l => l * l * l)
  const areaFit = linearFit({ xs: area, ys: entropies })
  const volumeFit = linearFit({ xs: volume, ys: entropies })
  return {
    ells,
    entropies,
    areaResidual: areaFit.residual,
    volumeResidual: volumeFit.residual,
    areaBeatsVolume: areaFit.residual < volumeFit.residual,
  }
}

export default experiment({
  id: 'holography/black-hole',
  title:
    'region entropy scales with horizon area not volume (Bekenstein-Hawking)',
  category: 'holography',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = blackHoleEntropy({ side: 8 })
    const increasing =
      (r.entropies[0] ?? 0) < (r.entropies[1] ?? 0) &&
      (r.entropies[1] ?? 0) < (r.entropies[2] ?? 0)
    const ok = r.areaBeatsVolume && increasing
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the entanglement entropy of a 3D region scales with its surface area and an area fit beats a volume fit',
      metrics: {
        areaResidual: r.areaResidual,
        volumeResidual: r.volumeResidual,
      },
      control: { volumeResidual: r.volumeResidual },
    })
  },
})
