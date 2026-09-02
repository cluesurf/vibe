// The Z_3 toric code on the mesh complex, the version whose alphabet is the tone's own. The qubit toric
// code (quantum/toric-code-from-the-mesh) took the D4 complex of d4Mesh over the field of two elements.
// The tone is ternary, so the natural code on the same complex is the qutrit one: the boundary maps with
// their orientations over Z_3, an X check on every vertex with entries +-1 on its edges, a Z check on
// every oriented triangle. The checks commute because d1 d2 = 0, and the number of logical qutrits is
// the first Betti number over Z_3, four for one four-torus (the torus has no torsion, so Z_2 and Z_3
// agree), eight on an even side where the mesh is two tori, zero on an open patch. Prior art: Kitaev
// 1997 for the Z_d toric codes, Dennis, Kitaev, Landahl and Preskill 2002. Depth L2: an exact known
// construction counted from the mesh's own complex, nothing put in.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  complexComponents,
  d4CellComplex,
  ternaryChecksCommute,
  ternaryTriangleCheckRows,
  ternaryVertexCheckRows,
} from '@/code/operator/toric-code'
import { ternaryMatrixRank } from '@/code/tool/bitset'

function qutritCode(input: { side: number; periodic: boolean }): {
  qutrits: number
  components: number
  commute: boolean
  logicalQutrits: number
} {
  const complex = d4CellComplex(input)
  const vertexRows = ternaryVertexCheckRows(complex)
  const triangleRows = ternaryTriangleCheckRows(complex)
  const qutrits = complex.edges.length

  return {
    qutrits,
    components: complexComponents(complex),
    commute: ternaryChecksCommute(vertexRows, triangleRows),
    logicalQutrits:
      qutrits - ternaryMatrixRank(vertexRows) - ternaryMatrixRank(triangleRows),
  }
}

export default experiment({
  id: 'quantum/qutrit-toric-code-from-the-mesh',
  code: 'E-QTM-0095',
  title:
    'the Z_3 toric code on the {3,4,3,4} mesh complex, with the tone alphabet as the qutrit: oriented vertex and triangle checks over the field of three elements commute exactly, and the number of logical qutrits by rank over Z_3 is four per four-torus (four at side 3, eight at the split even side 4) and zero on an open patch',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const torus3 = qutritCode({ side: 3, periodic: true })
    const torus4 = qutritCode({ side: 4, periodic: true })
    const patch = qutritCode({ side: 3, periodic: false })

    const commute = torus3.commute && torus4.commute && patch.commute
    const fourPerTorus =
      torus3.logicalQutrits === 4 * torus3.components &&
      torus4.logicalQutrits === 4 * torus4.components &&
      torus3.components === 1 &&
      torus4.components === 2
    const patchTrivial = patch.logicalQutrits === 0
    const ok = commute && fourPerTorus && patchTrivial

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the D4 complex of the periodic mesh the Z_3 vertex and triangle checks commute exactly, the number of logical qutrits by rank over the field of three elements is four per connected four-torus (four at side 3, eight at side 4 where the even side splits the mesh in two) and zero on an open patch, so the mesh carries the qutrit toric code whose alphabet is the tone',
      metrics: {
        qutritsSide3: torus3.qutrits,
        logicalSide3: torus3.logicalQutrits,
        qutritsSide4: torus4.qutrits,
        logicalSide4: torus4.logicalQutrits,
        componentsSide4: torus4.components,
        commute: commute ? 1 : 0,
      },
      // CONTROL: the open patch is contractible and carries no logical qutrit
      control: { patchQutrits: patch.qutrits, patchLogical: patch.logicalQutrits },
      notes:
        'The qubit and qutrit codes agree in k because the four-torus has no torsion. What the qutrit version adds is that the code alphabet is the ternary tone itself, so a tone configuration on the edges is a code state candidate, and the conserved charge (a stabiliser check for single-site errors, quantum/conservation-as-stabilizer) can be compared with the vertex checks directly. That comparison, and the hyperbolic (constant-rate) version on a closed quotient of the honeycomb, are the next steps.',
    })
  },
})
