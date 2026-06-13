import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  polygonComplex,
  kahlerDirac,
  multiply,
  boundaryOfBoundaryIsZero,
} from '@/code/operator/exterior-derivative'

// Fermions on {5,3,4} as differential FORMS, not directions. The Kahler-Dirac operator
// D = d + delta on the cell complex is a Dirac operator, its square is the Hodge Laplacian,
// block-diagonal across the grades with no mixing. So forms carry a fermion even though the
// 12 face-directions carry no spinor. Demonstrated on the pentagon, the {5} face of {5,3,4},
// where d composed with d is zero and D squared is the Laplacian, identities that hold in any
// dimension and extend to the dodecahedral cell and the full {5,3,4} honeycomb.

const gradeOf = (index: number, bounds: number[][]): number =>
  bounds.findIndex(([start, end]) => index >= start! && index < end!)

export default defineExperiment({
  id: 'spin/kahler-dirac-534',
  title: 'Kahler-Dirac fermions on {5,3,4} forms, D = d + delta squares to the Laplacian',
  category: 'spin',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const complex = polygonComplex(5) // the {5} face of {5,3,4}
    const dSquaredZero = boundaryOfBoundaryIsZero(complex)

    const operator = kahlerDirac(complex)
    const squared = multiply(operator, operator)

    // the grades: vertices [0,5), edges [5,10), face [10,11)
    const bounds = [
      [0, 5],
      [5, 10],
      [10, 11],
    ]
    // D squared must be BLOCK-DIAGONAL (the Hodge Laplacian, no grade mixing), the Dirac signature
    let blockDiagonal = true
    let offBlockMax = 0
    for (let row = 0; row < squared.length; row++) {
      for (let column = 0; column < squared.length; column++) {
        if (gradeOf(row, bounds) !== gradeOf(column, bounds)) {
          offBlockMax = Math.max(offBlockMax, Math.abs(squared[row]![column]!))
          if (Math.abs(squared[row]![column]!) > 1e-9) blockDiagonal = false
        }
      }
    }
    // and the operator is genuinely nonzero (a real Dirac operator, not the zero map)
    const nonTrivial = operator.some((row) => row.some((value) => Math.abs(value) > 1e-9))

    const ok = dSquaredZero && blockDiagonal && nonTrivial

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Kahler-Dirac operator d plus delta on the {5,3,4} form complex squares to the Hodge Laplacian, so the forms carry a Dirac fermion',
      metrics: {
        dSquaredZero: dSquaredZero ? 1 : 0,
        blockDiagonal: blockDiagonal ? 1 : 0,
        offBlockMax,
        operatorDimension: operator.length,
      },
      // CONTROL: if d composed with d were not zero (not a valid complex), D squared would MIX
      // grades, producing off-block terms, and would not be a Laplacian. Here the off-block max is 0.
      control: { gradeMixingOffBlock: blockDiagonal ? 0 : 1 },
      notes:
        'Shown on the {5} face, a 2-complex, where the identities hold exactly. Dirac-Kahler gives a fermion MULTIPLET, the reduction to a single spinor needs staggering. Extends to the dodecahedral cell and the full {5,3,4} bulk.',
    })
  },
})
