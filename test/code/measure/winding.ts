// Conformance for code/measure/winding. The phase winding is the total signed phase advance around a
// ring divided by 2*pi (an integer); the director winding folds steps mod pi and reports the advance
// in units of pi (a half-integer disclination shows up exactly). We build phase ramps with a known
// number of wraps and re-derive the winding.

import { suite, check, equal, close } from '@/test/code/harness'
import { phaseWinding, directorWinding } from '@/code/measure/winding'

// A phase ramp that winds `turns` times around a ring of `n` samples.
function ramp(n: number, turns: number): number[] {
  return Array.from(
    { length: n },
    (_, i) => (2 * Math.PI * turns * i) / n,
  )
}

suite('measure/winding: phaseWinding', [
  check('a single smooth wrap has winding 1', () => {
    equal(phaseWinding(ramp(8, 1)), 1)
  }),
  check('a double wrap has winding 2', () => {
    equal(phaseWinding(ramp(12, 2)), 2)
  }),
  check('a backward wrap has winding -1', () => {
    equal(phaseWinding(ramp(8, -1)), -1)
  }),
  check('a constant phase has winding 0', () => {
    equal(phaseWinding([0.4, 0.4, 0.4, 0.4]), 0)
  }),
])

suite('measure/winding: directorWinding', [
  check('a pi-advance (1/2 disclination) reads 1 in pi-units', () => {
    // director angle advances by pi total over the ring -> total/pi = 1.
    const phi = Array.from({ length: 8 }, (_, i) => (Math.PI * i) / 8)
    close(directorWinding(phi), 1, 1e-9)
  }),
  check('a full 2*pi director advance reads 2 in pi-units', () => {
    close(directorWinding(ramp(8, 1)), 2, 1e-9)
  }),
  check('a constant director has winding 0', () => {
    close(directorWinding([0.2, 0.2, 0.2, 0.2]), 0, 1e-12)
  }),
])
