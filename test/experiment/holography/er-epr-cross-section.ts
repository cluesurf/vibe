// The wormhole is the entanglement: its cross-section is the mutual information. In the holographic
// picture vibe already uses, the physical world is a boundary skin on the hyperbolic bulk, and two
// entangled boundary regions are joined by a bridge through the bulk, an Einstein-Rosen wormhole.
// The identity ER=EPR (Maldacena, Susskind) says the entanglement is that bridge, and van Raamsdonk's
// argument makes it quantitative: the mutual information between the two regions measures the width of
// the wormhole throat, so reducing the entanglement pinches the bridge off and disconnects the
// boundary, while maximal entanglement opens the throat fully.
//
// Measured on the two-qubit family cos(theta)|00> + sin(theta)|11>, sweeping the entanglement from a
// product state to a maximally entangled one: the mutual information (the wormhole cross-section)
// rises monotonically from exactly zero at the product state (the boundary disconnected, no wormhole)
// through intermediate widths to exactly two at maximal entanglement (the throat fully open), so the
// bridge is built by the entanglement and closes as the entanglement is removed.
//
// The control is the product state itself: zero entanglement gives zero mutual information, a pinched
// wormhole and a disconnected boundary, so the bridge exists only when the two sides are actually
// entangled, not for any two regions.
//
// Depth L2. It measures the wormhole cross-section as the mutual information of a boundary pair,
// rising from zero (pinched) to two (open) with the entanglement, the ER=EPR / van Raamsdonk
// correspondence on the substrate holographic picture, with the product-state control. A model-level
// result on the emergent boundary-and-bulk structure.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  entanglementEntropy,
  wormholeCrossSection,
} from '@/code/measure/wormhole'

const FRACTIONS = [0, 0.25, 0.5, 0.75, 1]

export default experiment({
  id: 'holography/er-epr-cross-section',
  code: 'E-HLG-0034',
  title:
    'the wormhole cross-section is the mutual information: it rises from exactly zero at a product boundary (pinched off) to exactly two at maximal entanglement (throat open), so entanglement builds the ER=EPR bridge and removing it disconnects the boundary',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const angles = FRACTIONS.map(f => (f * Math.PI) / 4)
    const crossSections = angles.map(wormholeCrossSection)

    // rises monotonically with entanglement
    let monotone = true

    for (let i = 1; i < crossSections.length; i++) {
      if (crossSections[i]! < crossSections[i - 1]! - 1e-12) {
        monotone = false
      }
    }

    const pinchedAtProduct = crossSections[0]! < 1e-12
    const openAtMaximal =
      Math.abs(crossSections[crossSections.length - 1]! - 2) < 1e-12

    // the cross-section is exactly twice the entanglement entropy at every point
    let worstRelation = 0

    for (let i = 0; i < angles.length; i++) {
      worstRelation = Math.max(
        worstRelation,
        Math.abs(
          crossSections[i]! - 2 * entanglementEntropy(angles[i]!),
        ),
      )
    }

    const crossSectionIsMutualInformation = worstRelation < 1e-12

    const ok =
      monotone &&
      pinchedAtProduct &&
      openAtMaximal &&
      crossSectionIsMutualInformation

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'sweeping the two-qubit boundary state from a product to a maximally entangled one, the mutual information between the two sides (the wormhole cross-section) rises monotonically from exactly zero at the product state (the boundary disconnected, the Einstein-Rosen bridge pinched off) through intermediate widths to exactly two at maximal entanglement (the throat fully open), and equals twice the entanglement entropy at every point, so the wormhole is built by the entanglement and closes as the entanglement is removed, the ER=EPR and van Raamsdonk correspondence, while a product state (zero entanglement) has zero cross-section so the bridge exists only between actually entangled regions',
      metrics: {
        crossSectionAtProduct: Number(crossSections[0]!.toFixed(4)),
        crossSectionAtHalf: Number(crossSections[2]!.toFixed(4)),
        crossSectionAtMaximal: Number(
          crossSections[crossSections.length - 1]!.toFixed(4),
        ),
        worstMutualInfoRelation: Number(worstRelation.toExponential(2)),
      },
      // CONTROL: the product state has zero cross-section, no wormhole.
      control: {
        crossSectionAtProduct: Number(crossSections[0]!.toFixed(4)),
      },
      notes:
        'ER=EPR / van Raamsdonk: the wormhole cross-section is the mutual information, zero (pinched) to two (open) with entanglement. Complements Ryu-Takayanagi (E-HLG-0019), entanglement-geometry (E-HLG-0021), and the bulk shortcut (E-HLG-0033). Pairs with traversable teleportation (E-QTM-0068).',
    })
  },
})
