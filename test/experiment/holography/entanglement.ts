// P15: the entanglement area law (the holography rung).
// AdS/CFT ties bulk geometry to boundary entropy, and black-hole entropy scales as
// area, not volume. We compute the entanglement entropy of a region in the
// free-fermion ground state on the mesh, by the correlation-matrix method, and check
// the scaling: in 1D the gapless ground state gives the conformal log law
// S ~ (c/3) ln(L) with c = 1, and in 2D it gives an AREA law, S growing with the
// boundary of the region, not its volume. See note/questions/next-version.md (P15).
// Run: npx tsx code/experiment/p15-entanglement.ts

import { linearFit } from '@/code/measure/regression'
import {
  freeFermionCorrelationMatrix,
  regionEntanglementEntropy,
} from '@/code/measure/entanglement'
import {
  ringHoppingHamiltonian,
  torusHoppingHamiltonian,
} from '@/code/operator/tight-binding'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// 1D: slope of S versus ln(block length), expected near c/3 = 1/3 for c = 1.
export function logLawSlope1D(input: { n: number }): number {
  const c = freeFermionCorrelationMatrix({
    h: ringHoppingHamiltonian({ n: input.n }),
    n: input.n,
  })

  const lengths = [4, 6, 8, 12, 16, 20, 24]
  const lnL: number[] = []
  const s: number[] = []

  for (const L of lengths) {
    const region = Array.from({ length: L }, (_, i) => i)

    lnL.push(Math.log(L))
    s.push(regionEntanglementEntropy({ c, n: input.n, region }))
  }

  return linearFit({ xs: lnL, ys: s }).slope
}

// 2D: entropy of an l x l block versus l. An area law is linear in l (the boundary),
// not in l^2 (the volume). Returns the boundary slope and whether area beats volume.
export function areaLaw2D(input: { side: number }): {
  boundaryFit: number
  areaBeatsVolume: boolean
} {
  const n = input.side * input.side
  const c = freeFermionCorrelationMatrix({
    h: torusHoppingHamiltonian({ dimension: 2, side: input.side }),
    n,
  })

  const ells = [2, 3, 4, 5]
  const ellArr: number[] = []
  const ell2Arr: number[] = []
  const s: number[] = []

  for (const l of ells) {
    const region: number[] = []

    for (let y = 0; y < l; y++) {
      for (let x = 0; x < l; x++) region.push(y * input.side + x)
    }

    ellArr.push(l)
    ell2Arr.push(l * l)
    s.push(regionEntanglementEntropy({ c, n, region }))
  }

  // Residual of a linear (boundary) fit versus a quadratic (volume) fit.
  const boundaryFit = linearFit({ xs: ellArr, ys: s }).slope
  const areaResidual = linearFit({ xs: ellArr, ys: s }).residual
  const volumeResidual = linearFit({ xs: ell2Arr, ys: s }).residual

  return { boundaryFit, areaBeatsVolume: areaResidual < volumeResidual }
}

export default experiment({
  id: 'holography/entanglement',
  code: 'E-HLG-0006',
  title:
    'free-fermion entanglement follows a 1D conformal log law and a 2D area law',
  category: 'holography',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const slope1D = logLawSlope1D({ n: 120 })
    const two = areaLaw2D({ side: 12 })
    const ok =
      slope1D > 0.25 &&
      slope1D < 0.42 &&
      two.areaBeatsVolume &&
      two.boundaryFit > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 1D entanglement slope sits near c/3 for c about 1 and the 2D entropy follows a boundary area law that beats a volume law',
      metrics: { slope1D, boundaryFit2D: two.boundaryFit },
    })
  },
})
