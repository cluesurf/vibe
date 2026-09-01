// The quantum lift of the substrate's code ladder: the two classical codes sitting under the
// committed geometries (the parity code [4,3,2] under D4 and the Hamming code [8,4,4] under E8,
// E-FND-0067) are exactly the classical seeds of the two smallest quantum error-detecting codes.
// The CSS construction takes a nested pair of classical codes (C2 inside C1), puts X-type
// stabilizers on the codewords of C2 and Z-type stabilizers on the dual of C1, and yields a
// quantum stabilizer code when every X support meets every Z support evenly, which is exactly the
// classical nesting. The pair (parity [4,3,2] over the repetition code) gives the [[4,2,2]] code,
// the smallest quantum error-detecting code, and the pair (RM(1,3) over RM(0,3)) gives the
// [[8,3,2]] code, the smallest three-dimensional color code.
//
// Verified exactly: both stabilizer sets commute (every overlap even), the logical counts are
// k = 2 and k = 3 (dim C1 minus dim C2), and both distances are 2 (the minimum weight in C1
// outside C2 and in the dual of C2 outside the dual of C1), so the codes are [[4,2,2]] and
// [[8,3,2]] with every parameter reproduced from the classical pair.
//
// The control breaks the nesting: replacing the repetition subcode with a span containing an
// odd-weight word (not inside the parity code) makes an X stabilizer meet a Z stabilizer oddly, so
// the stabilizers anticommute and no quantum code exists. So the quantum code is specifically the
// payoff of the classical nesting, not of the CSS recipe alone.
//
// The bridge: stabilizer checks are conserved parities, and the substrate's committed geometries
// carry exactly the parity structure whose quantum lift is the smallest error-detecting codes. The
// companion dynamical result (E-QTM-0055) shows the substrate's own conserved charge already acts
// as such a check.
//
// Depth L1. It confirms the known CSS parameters ([[4,2,2]] from the parity pair, [[8,3,2]] from
// the Reed-Muller pair, distances included) exactly, with the non-nested anticommuting control.
// The novelty is the map from the committed geometric ladder to the quantum-code ladder.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  evenWeightCode,
  reedMuller13,
  repetitionCode,
  cssCode,
} from '@/code/measure/code-lattice'

export default experiment({
  id: 'quantum/css-codes-from-ladder',
  code: 'E-QTM-0054',
  title:
    'the classical codes under D4 and E8 lift by CSS to the [[4,2,2]] and [[8,3,2]] quantum codes exactly (commuting stabilizers, k and distance reproduced) while a non-nested pair anticommutes, the quantum-code ladder from the geometric ladder',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    // [[4,2,2]] from the D4 pair: parity [4,3,2] over the repetition code
    const four = cssCode({
      c1: evenWeightCode(4),
      c2: repetitionCode(4),
      n: 4,
    })

    // [[8,3,2]] from the E8 pair: RM(1,3) over RM(0,3)
    const eight = cssCode({
      c1: reedMuller13(),
      c2: repetitionCode(8),
      n: 8,
    })

    // CONTROL: break the nesting with an odd-weight word not inside the parity code
    const nonNested = cssCode({
      c1: evenWeightCode(4),
      c2: [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
      ],
      n: 4,
    })

    const fourIs422 =
      four.commute && four.k === 2 && four.distance === 2

    const eightIs832 =
      eight.commute && eight.k === 3 && eight.distance === 2

    const controlAnticommutes = !nonNested.commute

    const ok = fourIs422 && eightIs832 && controlAnticommutes

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the CSS construction on the parity pair ([4,3,2] over the repetition code, the code under D4) yields commuting stabilizers with two logical qubits and distance two, the [[4,2,2]] code, the smallest quantum error-detecting code, and on the Reed-Muller pair (RM(1,3) over RM(0,3), the code under E8) yields commuting stabilizers with three logical qubits and distance two, the [[8,3,2]] color code, every parameter reproduced exactly from the classical pair, while replacing the subcode with a non-nested span containing an odd-weight word makes the stabilizers anticommute so no quantum code exists, so the smallest quantum error-detecting codes are the quantum lift of exactly the classical codes sitting under the substrate committed geometries',
      metrics: {
        fourCommute: four.commute ? 1 : 0,
        fourLogical: four.k,
        fourDistance: four.distance,
        eightCommute: eight.commute ? 1 : 0,
        eightLogical: eight.k,
        eightDistance: eight.distance,
      },
      // CONTROL: the non-nested pair anticommutes, no quantum code.
      control: { nonNestedCommute: nonNested.commute ? 1 : 0 },
      notes:
        'CSS (Calderbank-Shor-Steane) on the codes under the committed geometries (E-FND-0067): [[4,2,2]] from the D4 parity pair, [[8,3,2]] from the E8 Reed-Muller pair. Stabilizer checks are conserved parities; the dynamical face is E-QTM-0055.',
    })
  },
})
