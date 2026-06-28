// Conformance for code/substrate/lattice-ball: BFS ball and word metric of a Cayley graph of Z^d under
// integer step generators. With the axis steps of Z^2 the word metric is the L1 (taxicab) distance, so the
// ball of radius R has the known taxicab counts, the metric is symmetric, and distance to self is 0. EXACT.

import { suite, check, equal, ok } from '@/test/code/harness'
import { latticeBall, latticeWordDistance } from '@/code/substrate/lattice-ball'

// The four axis steps of Z^2: word metric becomes the L1 distance.
const z2 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

suite('substrate/lattice-ball: the BFS ball', [
  check('the radius-2 L1 ball of Z^2 has 13 points with correct distances', () => {
    const ball = latticeBall({ generators: z2, radius: 2 })
    // |{x : |x|_1 <= 2}| = 1 + 4 + 8 = 13.
    equal(ball.cells.length, 13, 'taxicab ball size')
    equal(ball.dist.get('0,0'), 0, 'origin distance 0')
    equal(ball.dist.get('1,0'), 1, 'unit step distance 1')
    equal(ball.dist.get('2,0'), 2, 'two steps')
    equal(ball.dist.get('1,1'), 2, 'diagonal is two L1 steps')
  }),
  check('every reached point distance equals its L1 norm', () => {
    const ball = latticeBall({ generators: z2, radius: 3 })
    for (const [key, d] of ball.dist) {
      const [x, y] = key.split(',').map(Number)
      equal(Math.abs(x!) + Math.abs(y!), d, `L1 norm of ${key}`)
    }
  }),
])

suite('substrate/lattice-ball: the word metric', [
  check('the word distance is the L1 distance and is symmetric', () => {
    const d1 = latticeWordDistance({ a: [0, 0], b: [2, 1], generators: z2, cap: 10 })
    equal(d1, 3, 'L1 distance (0,0)-(2,1)')
    const d2 = latticeWordDistance({ a: [2, 1], b: [0, 0], generators: z2, cap: 10 })
    equal(d1, d2, 'symmetric')
    equal(
      latticeWordDistance({ a: [3, -2], b: [3, -2], generators: z2, cap: 10 }),
      0,
      'distance to self is 0',
    )
  }),
  check('an unreachable target within the cap returns cap + 1', () => {
    // Cap below the true distance: the search gives up at cap + 1.
    const d = latticeWordDistance({ a: [0, 0], b: [9, 9], generators: z2, cap: 3 })
    ok(d === 4, 'cap + 1 sentinel')
  }),
])
