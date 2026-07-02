// Conformance for code/measure/spectrum: distinctLevels and zeroModeCensus. The
// zeroModeCensus check guards a bug the audit just fixed: a "zero mode" is defined by
// MAGNITUDE |v| < tolerance, so a symmetric spectrum's negative eigenvalues must NOT
// be miscounted as zero modes (the old signed v < tolerance test counted every
// negative level as zero). All values here are hand-derived.

import {
  suite,
  check,
  close,
  equal,
  exactArray,
} from '@/test/code/harness'
import { distinctLevels, zeroModeCensus } from '@/code/measure/spectrum'

suite('measure/spectrum: distinctLevels', [
  check('values within tolerance merge into one level', () => {
    // Two clusters near 1 and 2, each split by 1e-5 (< default tol 1e-4) -> {1, 2}.
    const out = distinctLevels([2, 1 + 1e-5, 2 + 1e-5, 1])
    equal(out.length, 2)
    close(out[0]!, 1, 1e-9)
    close(out[1]!, 2, 1e-9)
  }),
  check('well-separated values are all kept, ascending', () => {
    exactArray(distinctLevels([3, 1, 2]), [1, 2, 3])
  }),
  check(
    'negative and positive levels are not merged (they are far apart)',
    () => {
      equal(distinctLevels([-2, -1, 1, 2]).length, 4)
    },
  ),
])

suite('measure/spectrum: zeroModeCensus', [
  check(
    '{-3, -1e-9, 0, 2}: two zero modes by magnitude, minNonzero = 2',
    () => {
      const out = zeroModeCensus([-3, -1e-9, 0, 2])
      equal(out.zero, 2)
      equal(out.nonzero, 2)
      close(out.minNonzero, 2, 1e-12)
    },
  ),
  check(
    'REGRESSION: negative eigenvalues are NOT counted as zero modes',
    () => {
      // The fixed test |v| < tol; a signed v < tol test would call all three of these
      // negatives "zero". They are all nonzero physical modes.
      const out = zeroModeCensus([-3, -2, -1])
      equal(out.zero, 0)
      equal(out.nonzero, 3)
      close(out.minNonzero, 1, 1e-12)
    },
  ),
  check(
    'minNonzero takes the smallest MAGNITUDE, even when it is negative',
    () => {
      const out = zeroModeCensus([-0.5, 1, 3])
      equal(out.zero, 0)
      equal(out.nonzero, 3)
      close(out.minNonzero, 0.5, 1e-12)
    },
  ),
  check(
    'a symmetric +/-E pair spectrum has the right gap and no false zeros',
    () => {
      const out = zeroModeCensus([-4, -2, 2, 4])
      equal(out.zero, 0)
      equal(out.nonzero, 4)
      close(out.minNonzero, 2, 1e-12)
    },
  ),
])
