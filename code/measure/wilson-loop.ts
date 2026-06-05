// Wilson loops: gauge-invariant observables on a gauge field. The loop phase is
// the parallel transport around an oriented cycle; its cosine is the real Wilson
// loop value, and the mean (1 - value) over plaquettes is a coarse string-tension
// proxy (the static potential). See testbed/08-path-to-gauge-and-matter.md.

import { GaugeField, PlaquetteSet, linkPhase } from '~/core/gauge-field'

// Sum of link phases around the ordered loop vertices (wrapping the last vertex
// back to the first). The loop is a list of vertex ids tracing a closed cycle.
export function wilsonLoopPhase(input: {
  field: GaugeField
  loop: Uint32Array
}): number {
  const loop = input.loop
  const length = loop.length
  if (length < 2) {
    return 0
  }
  let phase = 0
  for (let i = 0; i < length; i++) {
    const from = loop[i] ?? 0
    const to = loop[(i + 1) % length] ?? 0
    phase += linkPhase(input.field, { from, to })
  }
  return phase
}

// The real Wilson loop value: cosine of the accumulated loop phase. Equals 1 for
// a flat (zero field strength) loop and decreases as field strength threads it.
export function wilsonLoopValue(input: {
  field: GaugeField
  loop: Uint32Array
}): number {
  return Math.cos(wilsonLoopPhase(input))
}

// A coarse string-tension proxy: the mean of (1 - Wilson value) over all
// plaquettes. Near 0 in a deconfined / flat field, growing as plaquettes carry
// field strength. Returns 0 when there are no plaquettes.
export function staticPotentialProxy(input: {
  field: GaugeField
  plaquettes: PlaquetteSet
}): number {
  const loops = input.plaquettes.loops
  if (loops.length === 0) {
    return 0
  }
  let total = 0
  for (const loop of loops) {
    total += 1 - wilsonLoopValue({ field: input.field, loop })
  }
  return total / loops.length
}
