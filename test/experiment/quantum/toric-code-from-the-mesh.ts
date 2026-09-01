// A quantum error-correcting code read off the {3,4,3,4} mesh's own cell complex. The cells of d4Mesh are
// the D4 lattice on a periodic side^4 box, the twenty-four directions are the D4 roots, so the mesh has
// edges (a cell and a root) and triangles (three roots that close). Put a qubit on every edge, an X-check
// on every vertex and a Z-check on every triangle: that is the toric code of Kitaev on this complex, and
// its logical qubit count is a topological invariant, k = n - rank H_X - rank H_Z = the first Betti
// number over Z_2 (Kitaev 1997, Dennis, Kitaev, Landahl and Preskill 2002). Nothing about the count is
// put in: the checks are built from the mesh and the ranks are computed over GF(2).
//
// The prediction is k = 4 x b_0: four logical qubits per four-torus. The first draft predicted k = 4 at
// every side and measured 8 at side 4, and the measurement was right: a D4 root changes the coordinate
// sum by an even number, so a periodic box of EVEN side is two disconnected lattices (even and odd
// coordinate sum), b_0 = 2, while an odd side wraps the two classes together. So the experiment now
// measures b_0 by breadth-first search and predicts k = 4 b_0, which is 4 at side 3 and 8 at side 4.
// That even-side split is a property of d4Mesh itself that every experiment on an even side inherits.
//
// Controls: the same construction on an OPEN patch (contractible, b_1 = 0) has k = 0, and the X and Z
// checks commute exactly (every triangle meets every vertex on an even number of edges), counted.
//
// Depth L2: a known construction reproduced on the committed substrate's complex, with a control that
// could have failed and a prediction that the measurement corrected. The rule does not enter: this is
// the mesh's geometry carrying a code, not the dynamics correcting errors (quantum/conservation-as-
// stabilizer is the rule-level, classical counterpart).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  complexComponents,
  d4CellComplex,
  toricCodeParameters,
  triangleCheckMatrix,
  vertexCheckMatrix,
} from '@/code/operator/toric-code'
import { popcountAndBetween } from '@/code/tool/bitset'

const SIDES = [3, 4]
const LOGICAL_QUBITS_PER_TORUS = 4 // b_1(T^4) over Z_2

export default experiment({
  id: 'quantum/toric-code-from-the-mesh',
  code: 'E-QTM-0093',
  title:
    'the toric code built from the {3,4,3,4} mesh complex (qubits on D4 edges, X-checks on cells, Z-checks on root triangles) has exactly four logical qubits per connected component, four at side 3 and eight at side 4 where the even side splits the mesh in two, while an open patch has zero and every X-check commutes with every Z-check',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const torus = SIDES.map(side => {
      const complex = d4CellComplex({ side, periodic: true })

      return {
        side,
        components: complexComponents(complex),
        ...toricCodeParameters(complex),
      }
    })

    const patch = toricCodeParameters(
      d4CellComplex({ side: SIDES[0]!, periodic: false }),
    )

    // the CSS condition, counted: no vertex check and triangle check share an odd number of edges
    const complex = d4CellComplex({ side: SIDES[0]!, periodic: true })
    const hx = vertexCheckMatrix(complex)
    const hz = triangleCheckMatrix(complex)

    let oddOverlaps = 0

    for (let v = 0; v < hx.rows; v++) {
      for (let t = 0; t < hz.rows; t++) {
        if (
          popcountAndBetween({ a: hx, rowA: v, b: hz, rowB: t }) % 2 ===
          1
        ) {
          oddOverlaps++
        }
      }
    }

    const fourPerComponent = torus.every(
      p => p.logicalQubits === LOGICAL_QUBITS_PER_TORUS * p.components,
    )

    const evenSideSplits =
      torus[0]!.components === 1 && torus[1]!.components === 2

    const patchIsTrivial = patch.logicalQubits === 0
    const checksCommute = oddOverlaps === 0

    const ok =
      fourPerComponent && evenSideSplits && patchIsTrivial && checksCommute

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the toric code on the D4 complex of the periodic {3,4,3,4} mesh has n = 972 qubits and k = 4 at side 3 (one component) and n = 3072 and k = 8 at side 4 (two components, because the D4 roots preserve coordinate-sum parity and an even side keeps the two classes apart), so k = 4 per four-torus, the first Betti number, every vertex X-check commutes with every triangle Z-check, and the same construction on an open contractible patch has k = 0, so the logical qubit count is a measured topological invariant of the mesh complex',
      metrics: {
        qubitsAtSide3: torus[0]!.qubits,
        qubitsAtSide4: torus[1]!.qubits,
        componentsAtSide3: torus[0]!.components,
        componentsAtSide4: torus[1]!.components,
        logicalQubitsAtSide3: torus[0]!.logicalQubits,
        logicalQubitsAtSide4: torus[1]!.logicalQubits,
        independentVertexChecksAtSide3: torus[0]!.independentVertexChecks,
        independentTriangleChecksAtSide3: torus[0]!.independentTriangleChecks,
        triangleChecksAtSide3: torus[0]!.triangleChecks,
        oddOverlaps,
      },
      control: {
        patchQubits: patch.qubits,
        patchLogicalQubits: patch.logicalQubits,
      },
      notes:
        'Known construction (Kitaev 1997, Dennis et al. 2002) on the committed substrate complex, measured by GF(2) rank of the check matrices built from the D4 roots on the periodic box. L2. The distance is not computed. The even-side split of d4Mesh (two disconnected lattices) is a fact about the mesh that this experiment found; it affects every experiment that uses d4Mesh with an even side and is tracked as roadmap item 0017. The rule itself does not enter here.',
    })
  },
})
