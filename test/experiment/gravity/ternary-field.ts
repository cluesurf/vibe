// The gravity field made TERNARY, a stack of tones, not binary. The discrete gravity field (the 1A route,
// selves/gravity-bound-self) is a bounded integer potential. Here we hold that potential in BALANCED TERNARY,
// base three with digits {-1, 0, +1}, which is exactly the tone alphabet, so the field is a stack of K tones
// per cell, the ternary-native form consistent with the rest of the base. K trits cover [-(3^K-1)/2,
// (3^K-1)/2], so a deeper, longer-range well needs more trits. We measure the binding range, a test mass
// displaced three cells from a body is pulled down the well to the body by a THREE-trit potential (range
// thirteen) but not by a SINGLE trit (range one, too coarse), confirming the earlier finding that a single
// ternary level is too coarse while a few trits suffice. The field is checked to be genuinely balanced ternary
// at every cell. So gravity, when added, can be a small stack of tones like everything else, not a binary
// integer. Depth L2, a measured binding range versus the number of trits, with the single-trit field as the
// too-coarse control. Deterministic throughout.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { bulkMass, relaxPotential } from '@/code/dynamics/gravity-field'
import { balancedTernaryCap, isBalancedTernaryField } from '@/code/tool/balanced-ternary'

const SIDE = 16
const SPATIAL_DEGREE = 24

// the body's well held in K balanced-ternary trits, and whether it pulls a test mass displaced three cells in
// to the body. Returns the test mass's final distance and whether the field is genuinely balanced ternary.
function bindingTest(digits: number): { finalDistance: number; ternary: boolean; wellRange: number } {
  const mesh = d4Mesh({ side: SIDE })
  const cellCount = mesh.cellCount
  const half = Math.floor(SIDE / 2)
  const coord = (c: number): number[] => [
    c % SIDE,
    Math.floor(c / SIDE) % SIDE,
    Math.floor(c / (SIDE * SIDE)) % SIDE,
    Math.floor(c / SIDE ** 3) % SIDE,
  ]
  const centre = half + half * SIDE + half * SIDE * SIDE + half * SIDE ** 3
  const centreCoord = coord(centre)
  const neighbour = (c: number, d: number): number => mesh.neighbour(c, d)
  const distance = (c: number): number => coord(c).reduce((s, v, i) => s + Math.abs(v - centreCoord[i]!), 0)

  const body = new Uint8Array(cellCount)
  for (let c = 0; c < cellCount; c++) {
    const p = coord(c)
    if ((p[0]! - half) ** 2 + (p[1]! - half) ** 2 + (p[2]! - half) ** 2 + (p[3]! - half) ** 2 <= 4) body[c] = 1
  }
  const cap = balancedTernaryCap(digits)
  const phi = relaxPotential({
    source: bulkMass({ occupied: body, neighbour, cellCount, spatialDegree: SPATIAL_DEGREE, minNeighbours: 3 }),
    neighbour,
    cellCount,
    spatialDegree: SPATIAL_DEGREE,
    sweeps: 80,
    strength: 6,
    cap,
  })
  const ternary = isBalancedTernaryField(phi, digits)
  let wellRange = 0
  for (let c = 0; c < cellCount; c++) if (phi[c]! < 0 && distance(c) > wellRange) wellRange = distance(c)

  // a test mass displaced three cells, walking down the gradient to the body surface (distance two)
  let piece = centre
  for (let k = 0; k < 3; k++) piece = neighbour(piece, 0)
  for (let step = 0; step < 40; step++) {
    let best = -1
    let bestPhi = phi[piece]!
    for (let d = 0; d < SPATIAL_DEGREE; d++) {
      const target = neighbour(piece, d)
      if (phi[target]! < bestPhi && distance(target) >= 2) {
        bestPhi = phi[target]!
        best = target
      }
    }
    if (best < 0) break
    piece = best
    if (distance(piece) <= 2) break
  }
  return { finalDistance: distance(piece), ternary, wellRange }
}

export default experiment({
  id: 'gravity/ternary-field',
  title: 'the gravity field as a stack of tones, three balanced-ternary trits bind, a single trit is too coarse',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const threeTrits = bindingTest(3)
    const oneTrit = bindingTest(1)

    // three trits bind the displaced mass (it reaches the body surface), one trit does not (too coarse), and
    // both are genuine balanced-ternary fields (each cell a stack of tones)
    const threeBinds = threeTrits.finalDistance <= 2
    const oneTooCoarse = oneTrit.finalDistance >= 3
    const bothTernary = threeTrits.ternary && oneTrit.ternary
    const ok = threeBinds && oneTooCoarse && bothTernary

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a gravity potential held in three balanced-ternary trits (each a tone, the digits {-1,0,+1}) binds a test mass displaced three cells, pulling it down the well to the body, while a single trit is too coarse to bind, and both are genuine balanced-ternary fields, so the added gravity field can be a small stack of tones like the rest of the base, not a binary integer',
      metrics: {
        threeTritCap: balancedTernaryCap(3),
        oneTritCap: balancedTernaryCap(1),
        threeTritFinalDistance: threeTrits.finalDistance,
        oneTritFinalDistance: oneTrit.finalDistance,
        threeTritWellRange: threeTrits.wellRange,
        oneTritWellRange: oneTrit.wellRange,
      },
      control: { oneTritFinalDistance: oneTrit.finalDistance },
      notes:
        'balanced ternary uses the digits {-1,0,+1}, exactly the tone alphabet, so a K-trit potential is a stack of K tones. Three trits (range thirteen) bind a three-cell displacement, a single trit (range one) is too coarse, matching selves/minimal-attraction-field. The field is verified balanced-ternary at every cell. This makes the added gravity field ternary-native rather than binary.',
    })
  },
})
