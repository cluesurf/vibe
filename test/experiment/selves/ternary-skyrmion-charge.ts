// The Skyrmion charge is exactly encoded by a 3-TRIT-per-cell direction field (the discrete ternary encoding of the
// topological state). The binding self is a topological soliton, and its charge (the identity) was, until now, only
// shown in a continuous spin field. Here the direction field is made of TRITS, each cell a 3-trit spin (sx, sy, sz
// each in {-1, 0, +1}, the 26-direction cube/octahedron target), and the Skyrmion degree is measured. It is exactly
// the integer charge, robust to the soliton size and to a perturbation. So the direction field and its topological
// charge are FULLY TERNARY, 3 trits per cell. (The degree is computed with the usual solid-angle formula as a
// MEASUREMENT of the emergent charge, the FIELD itself is ternary.)
//
// This closes the STATE half of the discrete encoding (the charge lives in trits). The remaining piece is the
// DYNAMICS, a reversible discrete rule that holds the soliton, which faces the coarse-reversible-stable trilemma and
// is resolved at the emergent scale (see the-two-layers-clarified).
//
// Depth L2, a 3-trit-per-cell direction field encodes the Skyrmion charge exactly, robust to size and perturbation.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  makeSkyrmionField,
  skyrmionDegree,
  snapToTrits,
  type Spin,
} from '@/code/dynamics/skyrmion-field'

export default experiment({
  id: 'selves/ternary-skyrmion-charge',
  title:
    'a 3-trit-per-cell direction field encodes the Skyrmion charge exactly (the topological state is fully ternary)',
  category: 'selves',
  substrates: ['spin-field'],
  depth: 'L2',
  paper: true,
  run() {
    const L = 48
    const degreeAt = (coreRadius: number): number =>
      skyrmionDegree(
        snapToTrits(makeSkyrmionField({ size: L, coreRadius })),
        L,
      )
    const r2 = degreeAt(2)
    const r4 = degreeAt(4)
    const r6 = degreeAt(6)
    const r10 = degreeAt(10)

    // a perturbation, tilt a patch, snap to trits, the charge must survive.
    const idx = (x: number, y: number): number =>
      ((y + L) % L) * L + ((x + L) % L)
    const field: Spin[] = makeSkyrmionField({ size: L, coreRadius: 6 })
    for (let y = 20; y < 24; y++) {
      for (let x = 28; x < 32; x++) {
        const n = Math.hypot(1, 0, 0.3)
        field[idx(x, y)] = [1 / n, 0, 0.3 / n]
      }
    }

    const perturbedDegree = skyrmionDegree(snapToTrits(field), L)

    const chargeAtAllSizes =
      Math.abs(r2 + 1) < 0.05 &&
      Math.abs(r4 + 1) < 0.05 &&
      Math.abs(r6 + 1) < 0.05 &&
      Math.abs(r10 + 1) < 0.05
    const chargeRobustToPerturbation =
      Math.abs(perturbedDegree + 1) < 0.05
    const ok = chargeAtAllSizes && chargeRobustToPerturbation

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Skyrmion charge is exactly encoded by a 3-trit-per-cell direction field, each cell a spin of three trits (the 26-direction cube target, fully ternary), and the topological degree is exactly the integer minus one across soliton sizes from radius two to ten and survives a perturbation, so the direction field and its topological charge live entirely in trits, three per cell, closing the discrete encoding of the topological STATE, the remaining piece is a reversible discrete dynamics that holds it',
      metrics: {
        degreeRadius2Times100: Math.round(r2 * 100),
        degreeRadius4Times100: Math.round(r4 * 100),
        degreeRadius6Times100: Math.round(r6 * 100),
        degreeRadius10Times100: Math.round(r10 * 100),
        perturbedDegreeTimes100: Math.round(perturbedDegree * 100),
        chargeAtAllSizes: chargeAtAllSizes ? 1 : 0,
        chargeRobustToPerturbation: chargeRobustToPerturbation ? 1 : 0,
        tritsPerCell: 3,
      },
      control: {
        degreeRadius2Times100: Math.round(r2 * 100),
        perturbedDegreeTimes100: Math.round(perturbedDegree * 100),
      },
      notes:
        'the discrete ternary encoding of the topological state, 3 trits per cell (a cube-direction spin) hold the Skyrmion charge exactly, robust to size and perturbation. The state is ternary, the remaining non-ternary piece was only the dynamics (a reversible discrete rule, the trilemma, resolved at the emergent scale). Geometry, the direction lives on the cube/octahedron (3-trit) target, in the 24-cell space',
    })
  },
})
