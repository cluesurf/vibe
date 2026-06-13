// P33: black-hole entropy (the Bekenstein-Hawking area law).
// A black hole's entropy is proportional to its horizon AREA, not its volume (S = A/4),
// the founding clue of holography. The entanglement entropy of a spatial region across
// its boundary is the microscopic origin: the boundary is the horizon, and the entropy
// lives on it. P15 showed the 2D area law (entropy grows with the perimeter). Here we
// do the 3D case, the actual Bekenstein-Hawking setting: the entanglement entropy of a
// cubic region scales with its SURFACE AREA (l^2), not its volume (l^3). So a horizon's
// entropy is set by its area. See note/questions/frontiers.md. Run:
// npx tsx code/experiment/p33-black-hole.ts

import { makeDense, DenseMatrix } from '@/code/algebra/linear/dense'
import { correlationMatrix, regionEntropy } from '@/test/experiment/holography/entanglement'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// 3D periodic hopping Hamiltonian.
function torus3D(side: number): DenseMatrix {
  const n = side * side * side
  const h = makeDense({ rows: n, cols: n })
  const idx = (x: number, y: number, z: number): number =>
    (((z + side) % side) * side + ((y + side) % side)) * side + ((x + side) % side)
  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const v = idx(x, y, z)
        for (const [dx, dy, dz] of [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as const) {
          const w = idx(x + dx, y + dy, z + dz)
          h.data[v * n + w] = 1
          h.data[w * n + v] = 1
        }
      }
    }
  }
  return h
}

function fit(xs: number[], ys: number[]): { slope: number; residual: number } {
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let cov = 0
  let varx = 0
  for (let i = 0; i < n; i++) {
    cov += ((xs[i] ?? 0) - mx) * ((ys[i] ?? 0) - my)
    varx += ((xs[i] ?? 0) - mx) * ((xs[i] ?? 0) - mx)
  }
  const slope = varx === 0 ? 0 : cov / varx
  const c0 = my - slope * mx
  let residual = 0
  for (let i = 0; i < n; i++) {
    residual += ((ys[i] ?? 0) - (slope * (xs[i] ?? 0) + c0)) ** 2
  }
  return { slope, residual }
}

export function blackHoleEntropy(input: { side: number }): {
  ells: number[]
  entropies: number[]
  areaResidual: number
  volumeResidual: number
  areaBeatsVolume: boolean
} {
  const side = input.side
  const n = side * side * side
  const c = correlationMatrix({ h: torus3D(side), n })
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
    entropies.push(regionEntropy({ c, n, region }))
  }
  const area = ells.map((l) => l * l) // horizon surface area ~ l^2
  const volume = ells.map((l) => l * l * l)
  const areaFit = fit(area, entropies)
  const volumeFit = fit(volume, entropies)
  return {
    ells,
    entropies,
    areaResidual: areaFit.residual,
    volumeResidual: volumeFit.residual,
    areaBeatsVolume: areaFit.residual < volumeFit.residual,
  }
}

export default defineExperiment({
  id: 'holography/black-hole',
  title: 'region entropy scales with horizon area not volume (Bekenstein-Hawking)',
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
      metrics: { areaResidual: r.areaResidual, volumeResidual: r.volumeResidual },
      control: { volumeResidual: r.volumeResidual },
    })
  },
})
