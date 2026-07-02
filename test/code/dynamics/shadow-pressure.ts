// Conformance for code/dynamics/shadow-pressure: discrete radiation-pressure (Casimir-shadow) attraction.
// Invariants:
//   - CONTROL IS EXACTLY ZERO: with no body, the D4 vacuum is symmetric and the 24 root directions cancel,
//     so the net x-momentum at the test plane is exactly 0 (no spurious force).
//   - A BODY ATTRACTS: with a body the absorbed shadow makes the net x-momentum point TOWARD the body
//     (negative) at a plane behind it.
//   - DETERMINISM.

import { suite, check, close, ok, equal } from '@/test/code/harness'
import {
  shadowPressureD4,
  selfContainedShadowD4,
  shadowPressureRun,
} from '@/code/dynamics/shadow-pressure'

const base = { side: 10, beats: 20, bodyLoX: 2, bodyHiX: 5, testX: 8 }

suite('dynamics/shadow-pressure: D4 vacuum control and attraction', [
  check('the no-body control is exactly zero (root symmetry)', () => {
    close(
      shadowPressureD4({ ...base, body: false }),
      0,
      1e-12,
      'symmetric vacuum cancels',
    )
  }),
  check(
    'a body makes the net momentum point toward it (attraction)',
    () => {
      ok(
        shadowPressureD4({ ...base, body: true }) < 0,
        'net x-momentum is inward (negative)',
      )
    },
  ),
  check(
    'the self-contained (self-generated vacuum) control is also ~ 0',
    () => {
      close(
        selfContainedShadowD4({ ...base, body: false }),
        0,
        1e-9,
        'symmetric self-vacuum cancels',
      )
    },
  ),
])

suite('dynamics/shadow-pressure: 1D run', [
  check(
    'a body shadows the +x flux, pushing the mass toward it',
    () => {
      const out = shadowPressureRun({
        length: 60,
        massStart: 40,
        bodyLo: 5,
        bodyHi: 12,
        beats: 200,
        threshold: 30,
        body: true,
      })

      ok(out.netMomentum < 0, 'net momentum toward the body')
      ok(
        out.hitsLeft > out.hitsRight,
        'more hits from the open side than the shadowed side',
      )
    },
  ),
  check('shadowPressureD4 is deterministic', () => {
    equal(
      shadowPressureD4({ ...base, body: true }),
      shadowPressureD4({ ...base, body: true }),
      'reproducible',
    )
  }),
])
