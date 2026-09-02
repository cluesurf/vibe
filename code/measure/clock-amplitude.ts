// The coarse Z_3 clock amplitude of a will, and its phase arithmetic. The ternary tone is the cyclic
// group Z_3 whose natural complex representation is omega^tone with omega = e^{2 pi i / 3}, so summing
// omega^tone over slots gives a many-to-one complex amplitude, the one kind of coarse variable the
// permutation theorem (foundations/permutation-rule-cannot-interfere) leaves open. Under the charge rule
// the vacuum's amplitude cancels over its three-beat cycle and a defect's amplitude carries the vacuum
// clock as a phase (foundations/vacuum-clock-amplitude), and defects made in different beats of the clock
// interfere exactly (foundations/birth-beat-interference, on its own branch). These helpers lived inside
// that experiment until 2026-09-01.

import { ComplexPair } from '@/code/algebra/linear/complex-pair'
import { Will } from '@/code/tone/will'

const THIRD = (2 * Math.PI) / 3

// the coarse Z_3 amplitude of the whole will, the sum of omega^tone over every slot
export function clockAmplitude(will: Will): ComplexPair {
  let re = 0
  let im = 0

  for (const tone of will.data) {
    re += Math.cos(THIRD * tone)
    im += Math.sin(THIRD * tone)
  }

  return [re, im]
}

// the same sum over the slots of one set of cells, so regions can carry their own amplitude
export function regionClockAmplitude(
  will: Will,
  cells: Iterable<number>,
): ComplexPair {
  const degree = will.mesh.degree

  let re = 0
  let im = 0

  for (const cell of cells) {
    const base = cell * degree

    for (let d = 0; d < degree; d++) {
      const tone = will.data[base + d]!

      re += Math.cos(THIRD * tone)
      im += Math.sin(THIRD * tone)
    }
  }

  return [re, im]
}

// the phase of an amplitude in whole degrees, rounded, for exact comparisons of lattice phases
export function phaseDegrees(a: ComplexPair): number {
  return Math.round((Math.atan2(a[1], a[0]) * 180) / Math.PI)
}

// the relative phase of two amplitudes folded into [0, 360) degrees
export function relativeDegrees(a: ComplexPair, b: ComplexPair): number {
  return (((phaseDegrees(a) - phaseDegrees(b)) % 360) + 360) % 360
}
