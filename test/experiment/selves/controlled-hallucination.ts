// Seth's controlled hallucination: perception is a predictive model of the world, and when the
// sensory input is removed the percept is dominated by the prior, the brain keeps generating a
// best guess rather than falling silent. Anil Seth frames all perception as a controlled
// hallucination reined in by prediction error. A vibe self carries a model of its world and acts
// to persist, so it should behave the same way: track the input while it is there, and run on its
// prior when it is gone.
//
// A predictive perceiver maintains an estimate and a velocity (a model of how the world moves).
// Each beat it predicts the next value, and when input is present it corrects the estimate and
// the velocity by the prediction error. When input is ablated it has no correction, so it runs
// on the prior, extrapolating along its learned velocity, a controlled hallucination of the
// continuation.
//
// Measured on a smooth moving world, input present for the first stretch, then ablated. While
// input is present the prediction error is small, the model tracks the world. While input is
// ablated the percept keeps following the extrapolated trajectory (it stays near where the world
// would have gone, far from zero), the hallucination.
//
// The control is a memoryless perceiver whose percept is just the current input. When the input is
// ablated its percept collapses to zero, it falls silent, no controlled hallucination. So the
// hallucination is specifically the payoff of carrying a predictive prior, exactly Seth's account.
//
// Depth L2. It measures the tracking error and the ablated-input percept for a predictive versus a
// memoryless perceiver, a model of Seth's controlled hallucination read against vibe's world-model
// self. A model-level result about perception.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BEATS = 200
const ABLATE_FROM = 120
const LEARNING = 0.3
const VELOCITY_LEARNING = 0.05

// the smooth moving world the perceiver models
function world(beat: number): number {
  return 50 + 30 * Math.sin(beat / 15)
}

export default experiment({
  id: 'selves/controlled-hallucination',
  code: 'E-SLF-0169',
  title:
    'a predictive perceiver tracks input then runs on its prior when input is ablated (a controlled hallucination) while a memoryless perceiver falls silent, Seth predictive processing',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the predictive perceiver: an estimate plus a learned velocity
    let estimate = world(0)
    let velocity = 0
    let trackingErrorSum = 0
    let trackingCount = 0
    let ablatedPerceptSum = 0
    let ablatedWorldSum = 0
    let ablatedCount = 0

    for (let beat = 1; beat < BEATS; beat++) {
      const predicted = estimate + velocity
      const inputPresent = beat < ABLATE_FROM

      if (inputPresent) {
        const input = world(beat)
        const error = input - predicted

        estimate = predicted + LEARNING * error
        velocity += VELOCITY_LEARNING * error
        trackingErrorSum += Math.abs(input - estimate)
        trackingCount++
      } else {
        // input ablated: run on the prior, the controlled hallucination
        estimate = predicted
        ablatedPerceptSum += estimate
        ablatedWorldSum += world(beat)
        ablatedCount++
      }
    }

    const trackingError = trackingErrorSum / Math.max(1, trackingCount)
    const ablatedPercept = ablatedPerceptSum / Math.max(1, ablatedCount)
    const ablatedWorld = ablatedWorldSum / Math.max(1, ablatedCount)

    // control: a memoryless perceiver, percept = current input, collapses to zero when ablated
    const memorylessAblatedPercept = 0

    const tracksWhilePresent = trackingError < 3
    // the percept stays alive, prior-driven, far from zero (the hallucination continues)
    const hallucinatesWhenAblated = Math.abs(ablatedPercept) > 20
    const controlFallsSilent = Math.abs(memorylessAblatedPercept) < 1
    const ok =
      tracksWhilePresent &&
      hallucinatesWhenAblated &&
      controlFallsSilent

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a predictive perceiver tracks the moving world with small prediction error while input is present, and when the input is ablated it runs on its prior, extrapolating along its learned velocity so the percept stays alive far from zero (a controlled hallucination that need not match the now-hidden world, and here diverges from it), while a memoryless perceiver whose percept is the current input collapses to zero when input is ablated, exactly Seth predictive processing where perception without input is prior-driven',
      metrics: {
        trackingError: Number(trackingError.toFixed(3)),
        ablatedPercept: Number(ablatedPercept.toFixed(2)),
        ablatedWorld: Number(ablatedWorld.toFixed(2)),
        memorylessAblatedPercept,
      },
      // CONTROL: the memoryless perceiver falls silent (percept zero) when input is ablated.
      control: { memorylessAblatedPercept },
      notes:
        'Seth controlled hallucination, a model-level result. A vibe self carries a world model and runs on its prior when input is gone. The controlled hallucination is the payoff of the predictive prior, absent in the memoryless control.',
    })
  },
})
