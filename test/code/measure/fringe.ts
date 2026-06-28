// Conformance for code/measure/fringe. fringeStatistics reads the populated parity of a 1D
// distribution and counts oscillatory maxima, deep near-nodes, and the contrast (total variation /
// peak). We build distributions whose even-index samples are a known shape (odd indices are filled
// with junk to confirm they are ignored) and hand-count the features.

import { suite, check, equal, close } from '@/test/code/harness'
import { fringeStatistics } from '@/code/measure/fringe'

// Even indices 0,2,4,6,8 carry `even`; odd indices carry 99 (must be ignored by the parity scan).
function distributionFromEven(even: number[]): Float64Array {
  const p = new Float64Array(even.length * 2)

  for (let i = 0; i < even.length; i++) {
    p[2 * i] = even[i]!
    if (2 * i + 1 < p.length) {
      p[2 * i + 1] = 99
    }
  }

  return p
}

suite('measure/fringe: fringeStatistics', [
  check('a fringed pattern [0,1,0,1,0] has 2 maxima, 1 node, contrast 3', () => {
    // arr = [0,1,0,1,0], peak=1.
    // maxima at i=1 and i=3 (each 1 > both neighbors and > 0.05). node at i=2 (0 < 0.15, flanked by 1>0.3).
    // total variation over interior = |1-0|+|0-1|+|1-0| = 3, contrast = 3/peak = 3.
    const r = fringeStatistics({
      distribution: distributionFromEven([0, 1, 0, 1, 0]),
      offset: 0,
      width: 9,
    })
    equal(r.maxima, 2)
    equal(r.nodes, 1)
    close(r.contrast, 3, 1e-9)
  }),
  check('a single smooth hump [0,1,2,1,0] has 1 maximum, 0 nodes', () => {
    // arr=[0,1,2,1,0], peak=2, one interior max at i=2, no deep dips.
    // total variation = |1-0|+|2-1|+|1-2| = 3, contrast = 3/2 = 1.5.
    const r = fringeStatistics({
      distribution: distributionFromEven([0, 1, 2, 1, 0]),
      offset: 0,
      width: 9,
    })
    equal(r.maxima, 1)
    equal(r.nodes, 0)
    close(r.contrast, 1.5, 1e-9)
  }),
])
