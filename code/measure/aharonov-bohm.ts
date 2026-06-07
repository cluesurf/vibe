// Aharonov-Bohm phase: the phase a charged particle accumulates around a loop,
// even where the local field strength is zero. It is the charge times the Wilson
// loop phase (the line integral of the connection around the loop).

import { GaugeField } from '~/tool/gauge-field'
import { wilsonLoopPhase } from '~/measure/wilson-loop'

// charge * (accumulated link phase around the ordered loop).
export function aharonovBohmPhase(input: {
  field: GaugeField
  loop: Uint32Array
  charge: number
}): number {
  return (
    input.charge *
    wilsonLoopPhase({ field: input.field, loop: input.loop })
  )
}
