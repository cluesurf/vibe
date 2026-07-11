// Conformance for code/geometry/packing: the kissing-configuration helpers. The 24 D4 roots are the optimal 4D
// kissing shell (the 24-cell): pairwise minimum angle 60 degrees (max normalized cosine 1/2), 8-regular at that
// minimum angle, and maximal (no direction can be added at 60 degrees). We re-derive the cosine from the root
// geometry, so the 1/2 is forced, not asserted from the implementation. relaxRiesz is the documented honest
// negative: a generic start does NOT descend to the 24-cell, so its relaxed cosine stays strictly above 1/2.

import {
  suite,
  check,
  equal,
  ok,
  close,
  allFinite,
} from '@/test/code/harness'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  unit,
  maxPairwiseCosine,
  isKissingConfiguration,
  canExtendKissing,
  coordinationAtMinAngle,
  deterministicSpiral,
  relaxRiesz,
} from '@/code/geometry/packing'

const D4 = rootsD4()

suite('geometry/packing: unit normalization', [
  check('unit returns a vector of norm 1', () => {
    const u = unit([3, 4])

    close(Math.hypot(...u), 1, 1e-12, 'normalized to the unit sphere')
    close(u[0]!, 0.6, 1e-12, 'x component')
    close(u[1]!, 0.8, 1e-12, 'y component')
  }),
])

suite('geometry/packing: the 24-cell is the optimal 4D kissing shell', [
  check(
    'the minimum pairwise angle is 60 degrees (max cosine 1/2)',
    () => {
      // D4 roots have squared norm 2; the closest distinct pair has dot 1, so the
      // normalized cosine is 1/2 -> 60 degrees. This is geometry, not the impl.
      close(
        maxPairwiseCosine(D4),
        0.5,
        1e-12,
        'closest pair subtends exactly 60 degrees',
      )
    },
  ),
  check(
    'the 24 roots are a kissing configuration at 60 degrees',
    () => {
      ok(
        isKissingConfiguration(D4, 60),
        'every pair at least 60 degrees apart',
      )
    },
  ),
  check('a too-close pair is NOT a kissing configuration', () => {
    // Two directions 45 degrees apart violate the 60-degree floor.
    const close45 = [
      [1, 0],
      [1, 1],
    ]

    ok(
      !isKissingConfiguration(close45, 60),
      '45 degrees is below the floor',
    )
  }),
  check('the 24-cell is 8-regular at the minimum angle', () => {
    const histogram = coordinationAtMinAngle(D4)

    // Every root must have exactly 8 nearest neighbours; no other coordination.
    equal(
      histogram[8],
      24,
      'all 24 roots have 8 neighbours at 60 degrees',
    )

    equal(
      Object.keys(histogram).length,
      1,
      'no other coordination number appears',
    )
  }),
])

suite('geometry/packing: kissing maximality', [
  check(
    'no D4 root can be re-added (the 24-cell is maximal at 60 degrees)',
    () => {
      ok(
        !canExtendKissing(D4, D4, 60),
        'every candidate is already present or too close',
      )
    },
  ),
  check(
    'an orthogonal direction CAN extend a sparse configuration',
    () => {
      ok(
        canExtendKissing([[1, 0, 0, 0]], [[0, 1, 0, 0]], 60),
        '90 degrees clears the 60-degree floor',
      )
    },
  ),
])

suite('geometry/packing: deterministic spiral and Riesz relaxation', [
  check(
    'the spiral returns the requested count of finite unit vectors',
    () => {
      const points = deterministicSpiral(24, 4)

      equal(points.length, 24, 'count')

      for (const p of points) {
        equal(p.length, 4, 'dimension')
        allFinite(p, 'spiral point is finite')
        close(Math.hypot(...p), 1, 1e-9, 'on the unit sphere')
      }
    },
  ),
  check(
    'honest negative: a generic start does NOT relax to the 24-cell',
    () => {
      const start = deterministicSpiral(24, 4)
      const relaxed = relaxRiesz(start, { steps: 400 })

      for (const p of relaxed) {
        close(
          Math.hypot(...p),
          1,
          1e-9,
          'relaxed points stay on the sphere',
        )
      }

      // The 24-cell would reach cosine 1/2; local descent traps strictly worse.
      ok(
        maxPairwiseCosine(relaxed) > 0.5,
        'local minimization does not self-assemble the optimal 24-cell',
      )
    },
  ),
])
