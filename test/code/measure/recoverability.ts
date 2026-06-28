// Conformance for code/measure/recoverability: Herbert's R = accessible / total on the lattice gas.
// Under the reversible, charge-conserving knit (passThrough collide + stream is a pure permutation of
// tone slots) the total L1 tone-structure is EXACTLY conserved, so rGlobal = 1 at every beat. The
// window and coarse observers can only ever recover a sub-part, so rWindow, rCoarse lie in [0, rGlobal].
// These are the strong invariants of a reversible substrate, re-derived from conservation, not the impl.

import { suite, check, close, ok } from '@/test/code/harness'
import { recoverabilityTrace } from '@/code/measure/recoverability'
import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern } from '@/code/tone/will'
import { passThrough } from '@/code/rule/collision'

function patternWill() {
  const will = makeWill(d4Mesh({ side: 4 }))
  fillWillPattern(will)

  return will
}

suite('measure/recoverability: reversible knit conserves rGlobal = 1', [
  check('rGlobal stays exactly 1 at every beat under the conserving rule', () => {
    const trace = recoverabilityTrace({
      will: patternWill(),
      collision: passThrough,
      meshSide: 4,
      windowRadius: 1,
      blockSide: 2,
      beats: 3,
    })

    for (const point of trace) {
      close(point.rGlobal, 1, 1e-9)
    }
  }),
  check('window and coarse observers recover a sub-part: 0 <= rWindow, rCoarse <= rGlobal', () => {
    const trace = recoverabilityTrace({
      will: patternWill(),
      collision: passThrough,
      meshSide: 4,
      windowRadius: 1,
      blockSide: 2,
      beats: 3,
    })

    for (const point of trace) {
      ok(point.rWindow >= -1e-12 && point.rWindow <= point.rGlobal + 1e-9, 'rWindow in [0, rGlobal]')
      ok(point.rCoarse >= -1e-12 && point.rCoarse <= point.rGlobal + 1e-9, 'rCoarse in [0, rGlobal]')
    }
  }),
  check('the trace has one point per beat (0..beats inclusive)', () => {
    const trace = recoverabilityTrace({
      will: patternWill(),
      collision: passThrough,
      meshSide: 4,
      windowRadius: 1,
      blockSide: 2,
      beats: 3,
    })

    ok(trace.length === 4, `expected 4 points, got ${trace.length}`)
  }),
])
