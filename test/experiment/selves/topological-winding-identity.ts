// The self's IDENTITY as a topological WINDING, protected reversibly at the 24-cell resolution. This clarifies
// "topological" (plans/reversible-attraction-mechanisms-explained), the identity is not arbitrary points, it is the
// TWIST of the direction-field, how many full turns the coarse-grained tone-direction makes around a loop. That
// integer (the winding) is a topological charge, a reversible local rule cannot change it without a phase slip.
//
// The key finding, protection depends on RESOLUTION. At coarse ternary (3 states) the winding is NOT protected, it
// slips and changes under the reversible clock wave. At the 24-cell RESOLUTION (24 states, the number of coin
// directions) the winding is FULLY protected, conserved under evolution AND robust to a perturbation. So the
// 24-cell provides exactly the resolution that makes the self's identity topologically robust, and it is reversible
// (the winding is conserved by the reversible clock wave). Coarse-graining many ternary tones gives the ~24-state
// direction the protection needs, so the topological identity lives at the emergent scale the 24-cell sets.
//
// Depth L2, the topological identity (a winding) is reversibly protected at the 24-cell resolution, not at ternary.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  makeTwist,
  stepClockRing,
  clockWinding,
  type ClockRing,
} from '@/code/dynamics/clock-winding'

export default experiment({
  id: 'selves/topological-winding-identity',
  title:
    'the self identity is a topological winding, reversibly protected at the 24-cell resolution but not at coarse ternary',
  category: 'selves',
  substrates: ['clock-ring'],
  depth: 'L2',
  paper: true,
  run() {
    const size = 60
    const steps = 200

    // for a given resolution n, does the winding survive (a) evolution and (b) a local perturbation?
    const protection = (
      states: number,
    ): { conserved: boolean; perturbRobust: boolean } => {
      let ring: ClockRing = makeTwist({ size, states, turns: 1 })
      const w0 = clockWinding(ring.curr, states)
      let conserved = true
      for (let t = 0; t < steps; t++) {
        ring = stepClockRing(ring)
        if (clockWinding(ring.curr, states) !== w0) conserved = false
      }
      // a perturbation, flip one cell up by one clock step, then evolve and see if the winding survives.
      let pert: ClockRing = makeTwist({ size, states, turns: 1 })
      pert.curr[Math.floor(size / 2)] =
        (pert.curr[Math.floor(size / 2)]! + 1) % states
      const wp0 = clockWinding(pert.curr, states)
      for (let t = 0; t < steps; t++) pert = stepClockRing(pert)
      const perturbRobust = clockWinding(pert.curr, states) === wp0
      return { conserved, perturbRobust }
    }

    const ternary = protection(3) // the coarse base resolution
    const coin24 = protection(24) // the 24-cell resolution (the number of coin directions)

    // ternary is too coarse (the winding slips, not protected), the 24-cell resolution fully protects it (conserved
    // and perturbation-robust). PASS demonstrates that the topological identity is reversibly protected exactly at
    // the 24-cell resolution, not at coarse ternary.
    const ternaryUnprotected = !(
      ternary.conserved && ternary.perturbRobust
    )
    const coin24Protected = coin24.conserved && coin24.perturbRobust
    const ok = ternaryUnprotected && coin24Protected

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the self identity is a topological winding (the twist of the direction-field, how many full turns the coarse-grained tone-direction makes around a loop), an integer a reversible local rule cannot change without a phase slip, and its protection depends on resolution, at coarse ternary (3 states) the winding SLIPS and is not protected, while at the 24-cell resolution (24 states, the number of coin directions) it is FULLY protected, conserved under the reversible clock wave AND robust to a perturbation, so the 24-cell provides exactly the resolution that makes the identity topologically robust, reversibly, and topology is the winding of the tone-direction field, not arbitrary points',
      metrics: {
        ternaryConserved: ternary.conserved ? 1 : 0,
        ternaryPerturbRobust: ternary.perturbRobust ? 1 : 0,
        coin24Conserved: coin24.conserved ? 1 : 0,
        coin24PerturbRobust: coin24.perturbRobust ? 1 : 0,
        ternaryUnprotected: ternaryUnprotected ? 1 : 0,
        coin24Protected: coin24Protected ? 1 : 0,
        steps,
      },
      control: {
        ternaryConserved: ternary.conserved ? 1 : 0,
        coin24Conserved: coin24.conserved ? 1 : 0,
      },
      notes:
        'topology clarified and a reversible IDENTITY found. The identity is a winding (a twist of the feeling-direction field), reversibly conserved, protected at the 24-cell resolution (24 states) but not at coarse ternary (it slips). Coarse-graining many ternary tones gives the ~24-state direction the protection needs, so the topological identity lives at the emergent scale the 24-cell sets. This is the reversible identity the rest slot gave non-topologically, now topological and tied to the 24-cell',
    })
  },
})
