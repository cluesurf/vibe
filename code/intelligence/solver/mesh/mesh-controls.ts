/**
 * Negative controls for level 4 (E-CMP-0056): each runs the mesh-wave solver with one part swapped for something
 * else and still makes the honest claims (an M3-B self-0 wave, an M4 register at spacing 2). Each finds valid
 * paths, so the evaluator alone grades it clean; the judge must catch the false claim.
 *
 * - externalFrontier: the frontier is a breadth-first layer computed by candidate code, and the field it reports
 *   is +1 on the layer, 0 elsewhere (an external queue claimed as a mesh signal);
 * - foreignLaw: the wave with self 1 (another rule claimed as the M3-B wave);
 * - adjacentRegister: register slots at spacing 1, where two adjacent opposite tones trade cells (an invalid M4
 *   layout claimed as a valid one).
 */

import type { Solver } from '@/code/intelligence/solver/solver'
import { HONEST_SETTINGS, SWITCH_SETTINGS, meshWaveSolver } from '@/code/intelligence/solver/mesh/mesh-wave'
import { EXPAND_SWITCH, LIT_SWITCH, type MeshHost } from '@/code/intelligence/solver/mesh/switch'

export function externalFrontier<S>(): Solver<S> {
  return meshWaveSolver<S>({ ...HONEST_SETTINGS, frontier: 'external' })
}

export function foreignLaw<S>(): Solver<S> {
  return meshWaveSolver<S>({ ...HONEST_SETTINGS, self: 1 })
}

export function adjacentRegister<S>(): Solver<S> {
  return meshWaveSolver<S>({ ...HONEST_SETTINGS, spacing: 1 })
}

/**
 * Slice 2 controls (E-CMP-0060), each claiming the certified switch layouts:
 *
 * - formulaDecisions: the lit test and the expand gate decided by candidate code, the frame made up from the output
 *   alone (a decision in candidate code claimed as a mesh layout);
 * - extraConstantSwitch: the evaluator runs, metered, the expand layout with one more constant far outside the read
 *   cell's light cone, so every decision is right but the layout run is not the certified one;
 * - lookupSwitch (decision 003): each layout run once per input word in candidate code (3 lit words, 9 expand words),
 *   every decision looked up; its report is the honest solver's, field for field, and only the evaluator's meter,
 *   which shows no run, tells it apart.
 */
export function formulaDecisions<S>(): Solver<S> {
  return meshWaveSolver<S>({ ...SWITCH_SETTINGS, decisions: 'formula' })
}

export function extraConstantSwitch<S>(_args: unknown, host: MeshHost<S>): Solver<S> {
  const window = [...EXPAND_SWITCH.window]

  while (window.length < 20) {
    window.push(0)
  }

  window.push(1)

  return meshWaveSolver<S>({ ...SWITCH_SETTINGS, layouts: { lit: LIT_SWITCH, expand: { ...EXPAND_SWITCH, window } } }, host)
}

export function lookupSwitch<S>(): Solver<S> {
  return meshWaveSolver<S>({ ...SWITCH_SETTINGS, decisions: 'lookup' })
}
