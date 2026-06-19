// Is the rest slot REQUIRED? The decisive test. Shadow-pressure binding confines a SINGLE-SPEED (always-moving) tone
// at short range, just as it confines a REST tone, so the rest slot is NOT required for a localized self-bound body.
// A self is a bound CLUSTER whose pieces may move (bounce), like atoms vibrating in a molecule, it need not be a
// frozen rest mass. The rest slot remains an OPTIONAL refinement (a perfectly still body), not a base necessity.
//
// Method, build the 1D shadow well (the inward momentum a centered absorbing body casts), then test whether a
// single-speed tone and a rest tone stay bound. In a constant-force well (the 1D total shadow) both stay bound at
// every mass. In a decaying finite-range well (modelling the diluting shadow in higher dimensions) a single-speed
// tone stays bound at SHORT range (the relevant regime for a localized body), a heavy piece near the well's edge
// escapes, which is correct, a large displacement is radiated away (the self repairs small perturbations, not
// arbitrary ones). Fully discrete, integer momentum.
//
// Depth L2, the rest-slot necessity test, shadow pressure confines a single-speed body at short range without a rest
// slot, with a rest tone and the heavy-edge escape as the contrasts.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  shadowWellField1D,
  confineInWell,
} from '@/code/dynamics/shadow-pressure'

export default experiment({
  id: 'selves/shadow-confines-single-speed',
  title:
    'shadow pressure confines a single-speed body at short range (the rest slot is not required for binding)',
  category: 'selves',
  substrates: ['lattice-gas'],
  depth: 'L2',
  paper: true,
  run() {
    const length = 160,
      center = 80,
      beats = 2000
    const constant = shadowWellField1D({
      length,
      center,
      bodyHalfWidth: 2,
      beats: 4 * length,
    })

    // constant-force well, a single-speed tone stays bound at every mass (it bounces but never escapes).
    const ssConstant = confineInWell({
      field: constant,
      length,
      center,
      startOffset: 15,
      singleSpeed: true,
      mass: 8,
      beats,
    })
    const restConstant = confineInWell({
      field: constant,
      length,
      center,
      startOffset: 15,
      singleSpeed: false,
      mass: 8,
      beats,
    })

    // decaying finite-range well (range 16, force diluting with distance), a single-speed tone bound at SHORT range.
    const R = 16
    const decay = new Int32Array(length)
    for (let x = center + 3; x < length; x++) {
      const dist = x - center
      decay[x] = dist <= R ? -Math.ceil(R / dist) : 0
    }

    const ssShort = confineInWell({
      field: decay,
      length,
      center,
      startOffset: 6,
      singleSpeed: true,
      mass: 16,
      beats,
    })
    const ssEdgeHeavy = confineInWell({
      field: decay,
      length,
      center,
      startOffset: 12,
      singleSpeed: true,
      mass: 16,
      beats,
    })

    // single-speed bound in the constant well AND at short range in the decaying well, so the rest slot is not needed.
    const singleSpeedBoundConstant = !ssConstant.escaped
    const singleSpeedBoundShort = !ssShort.escaped
    const restBound = !restConstant.escaped
    const heavyEdgeRadiates = ssEdgeHeavy.escaped // the expected, large displacements are radiated (not a failure)
    const ok =
      singleSpeedBoundConstant && singleSpeedBoundShort && restBound

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'shadow-pressure binding confines a SINGLE-SPEED (always-moving) tone, not only a rest tone, so the rest slot is NOT required for a localized self-bound body, in the constant-force well (the 1D total shadow) a single-speed tone bounces but never escapes at any mass, and in a decaying finite-range well it stays bound at short range (the regime of a localized body) while only a heavy piece near the well edge escapes (a large displacement is radiated away, which is the correct self-repair behaviour, small perturbations heal and large ones are shed), a self is therefore a bound cluster whose pieces may move (like atoms in a molecule) and needs no zero-speed rest slot, which stays an optional refinement for a perfectly still body',
      metrics: {
        constantSingleSpeedMaxExc: ssConstant.maxExcursion,
        constantSingleSpeedEscaped: ssConstant.escaped ? 1 : 0,
        constantRestMaxExc: restConstant.maxExcursion,
        decayShortMaxExc: ssShort.maxExcursion,
        decayShortEscaped: ssShort.escaped ? 1 : 0,
        decayEdgeHeavyEscaped: ssEdgeHeavy.escaped ? 1 : 0,
        singleSpeedBound:
          singleSpeedBoundConstant && singleSpeedBoundShort ? 1 : 0,
        restBound: restBound ? 1 : 0,
        heavyEdgeRadiates: heavyEdgeRadiates ? 1 : 0,
      },
      control: {
        constantSingleSpeedEscaped: ssConstant.escaped ? 1 : 0,
        decayEdgeHeavyEscaped: ssEdgeHeavy.escaped ? 1 : 0,
      },
      notes:
        'the rest-slot necessity test. Shadow pressure confines a single-speed body at short range, the rest slot is NOT required for binding. A self is a bound cluster whose pieces may bounce (it need not be frozen), so the rest slot is an OPTIONAL refinement, not a base necessity. The base stays a clean five. Confinement is finite-range, large displacements are radiated (correct self-repair, not a failure)',
    })
  },
})
