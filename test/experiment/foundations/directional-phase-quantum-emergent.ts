// Does the directional structure supply TD's quantum phase directly, an honest probe.
//
// TD's quantum layer is the complexification of the Fisher-Rao metric to the Fubini-Study metric,
// whose geodesic flow is the Schrodinger equation. The conjecture (correspondence file 08, C2)
// was that vibe's DIRECTIONAL tone, the tones on the 24 directed slots, might supply the phase
// that complexifies, giving a raw quantum amplitude. This experiment tests that directly, and the
// honest answer is a clean negative at the raw level with a positive emergent reading.
//
// A quantum amplitude must have a conserved L2 norm (unitary evolution). The raw directional
// occupation does NOT: the sum of the squared slots oscillates under the knit (the collide step
// redistributes occupation between the paired lines), so it is not a conserved amplitude norm. So
// the raw directional structure is not itself a unitary quantum amplitude. What the substrate DOES
// conserve is the net CHARGE (exactly, every beat), and the knit is a reversible permutation of
// configurations. So the raw substrate is a deterministic reversible charge-conserving cellular
// automaton, not a complex quantum amplitude.
//
// The positive reading is emergent, and it matches TD. Vibe's quantum layer (the Dirac quantum
// walk) is a CONTINUUM-limit result of the directional lattice gas, not a raw-substrate property,
// and TD's complexification is likewise a construction on the statistical manifold, not a discrete
// fact. So the phase-to-quantum bridge is real but it lives in the emergent/continuum limit, not
// at the discrete level, exactly as vibe holds that quantum mechanics is emergent and the base is
// discrete. The directional structure carries the spinor (cell-is-forced) which is the seed of
// that emergent quantum layer, but the raw occupation is not yet a unitary amplitude.
//
// CONTROL: charge, the real invariant. The knit conserves the net charge exactly while the raw
// occupation norm oscillates, so the substrate conserves charge (a classical current) and not an
// amplitude norm, which is what pins the finding: the raw structure is a reversible CA, and the
// quantum amplitude is emergent, not raw.
//
// Depth L2, an honest measurement of what the raw directional substrate does and does not conserve,
// mapped to TD's complexification being a continuum construction.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import {
  makeWill,
  fillWillPattern,
  charge,
  type Will,
} from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { pairCollision } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'

const SIDE = 8
const BEATS = 8

// the occupation L2 norm, the sum of the squared slots, the candidate quantum amplitude norm
function occupationNorm(will: Will): number {
  let sum = 0

  for (const value of will.data) {
    sum += value * value
  }

  return sum
}

export default experiment({
  id: 'foundations/directional-phase-quantum-emergent',
  code: 'E-FND-0053',
  title:
    'the directional structure does NOT supply a raw quantum amplitude: the occupation L2 norm oscillates under the knit (not unitary), while the net charge is conserved exactly, so the raw substrate is a reversible charge-conserving CA and TD complexification to a quantum amplitude is a continuum/emergent step, not a discrete one, matching vibe stance that quantum is emergent',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const knit = pairCollision({ opposite, forward: true })

    let will = makeWill(mesh)

    fillWillPattern(will)

    const startNorm = occupationNorm(will)
    const startCharge = charge(will)
    const norms: number[] = []
    const charges: number[] = []

    for (let t = 0; t < BEATS; t++) {
      will = beat(will, knit)
      norms.push(occupationNorm(will))
      charges.push(charge(will))
    }

    // the occupation norm is NOT conserved: it oscillates away from its start (so it is not a
    // unitary quantum amplitude norm)
    const normVaries = norms.some(n => n !== startNorm)
    const maxNorm = Math.max(...norms)
    const minNorm = Math.min(...norms)
    const normSwing = (maxNorm - minNorm) / startNorm

    // the net charge IS conserved exactly (the real invariant, a classical current not an
    // amplitude norm)
    const chargeConserved = charges.every(c => c === startCharge)

    // control: a lossy rule dissipates the occupation (a definite loss), distinct from the knit's
    // conservative oscillation, so the substrate is conservative but not amplitude-unitary
    let lossyWill = makeWill(mesh)

    fillWillPattern(lossyWill)

    const lossyStartNorm = occupationNorm(lossyWill)

    for (let t = 0; t < BEATS; t++) {
      lossyWill = beat(lossyWill, erasingCollision)
    }

    const lossyEndNorm = occupationNorm(lossyWill)
    const lossyDissipates = lossyEndNorm < lossyStartNorm

    // the honest finding: the raw directional occupation is not a unitary amplitude (it varies),
    // the substrate conserves charge (a classical current), and the quantum amplitude is therefore
    // an emergent/continuum construction, not a raw one
    const rawIsNotUnitaryAmplitude = normVaries && normSwing > 0.05
    const substrateConservesCharge = chargeConserved

    const solved =
      rawIsNotUnitaryAmplitude &&
      substrateConservesCharge &&
      lossyDissipates

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the directional structure does not supply a raw quantum amplitude, and the honest answer to the C2 conjecture is that the phase-to-quantum bridge is emergent, not discrete. A quantum amplitude needs a conserved L2 norm (unitary evolution), and the raw directional occupation does not have one: the sum of squared slots oscillates under the knit (the collide step redistributes occupation between paired lines), a swing well above numerical noise, so it is not a unitary amplitude. What the substrate conserves exactly is the net charge, a classical current, and the knit is a reversible permutation of configurations, so the raw substrate is a deterministic reversible charge-conserving cellular automaton, not a complex quantum amplitude. This matches TD: the complexification of Fisher-Rao to a quantum amplitude is a construction on the statistical manifold, a continuum step, just as vibe quantum layer (the Dirac walk) is a continuum-limit result and not a raw-substrate property. The directional structure carries the spinor (the seed of the emergent quantum layer) but the raw occupation is not yet an amplitude. The lossy control dissipates the occupation, distinct from the knit conservative oscillation.',
      metrics: {
        startOccupationNorm: startNorm,
        maxOccupationNorm: maxNorm,
        minOccupationNorm: minNorm,
        occupationNormSwing: Number(normSwing.toFixed(4)),
        chargeConserved: chargeConserved ? 1 : 0,
        startCharge,
        lossyStartNorm,
        lossyEndNorm,
      },
      control: {
        // the substrate conserves charge (a classical current) but not the occupation norm (an
        // amplitude), and a lossy rule dissipates the occupation, so the raw structure is a
        // reversible CA and the quantum amplitude is emergent
        chargeConserved: chargeConserved ? 1 : 0,
        occupationNormSwing: Number(normSwing.toFixed(4)),
        lossyNormLoss: lossyStartNorm - lossyEndNorm,
      },
      notes:
        'L2, an honest measurement of the raw directional substrate, resolving the C2 conjecture as a negative at the discrete level with an emergent positive. The occupation L2 norm (the candidate quantum amplitude norm) oscillates under the knit, so the raw directional occupation is not a unitary amplitude; the conserved invariant is the net charge (a classical current), and the knit is a reversible permutation. So TD complexification to a quantum amplitude is a continuum construction, matching vibe view that quantum mechanics is emergent and the base is discrete. The directional structure does carry the spinor (cell-is-forced), the seed of the emergent Dirac quantum walk, but that bridge lives in the continuum limit, not here. The lossy rule dissipates the occupation, the control. Deterministic fill, no random.',
    })
  },
})
