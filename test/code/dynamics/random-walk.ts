// Conformance for code/dynamics/random-walk: classical random walks (the diffusive controls).
// Invariants:
//   - MSD(0) = 0 and MSD grows ~ LINEARLY in time (diffusive exponent ~ 1, the classical baseline the
//     ballistic quantum walk is contrasted against).
//   - DETERMINISM: a seeded walk is reproducible; the same seed gives the same endpoint / path.
//   - persistentWalk: mix=0 is ballistic (displacement = steps), mix=1 is diffusive (~ sqrt(steps)).

import { suite, check, close, equal, ok } from '@/test/code/harness'
import {
  classicalWalkMSD,
  randomWalkEndpoint,
  randomWalkPath,
  persistentWalkMeanDisplacement,
  graphWalkMsdExponent,
} from '@/code/dynamics/random-walk'
import { makeRng } from '@/code/tool/rng'

function ringNeighbors(n: number): number[][] {
  return Array.from({ length: n }, (_, i) => [
    (i - 1 + n) % n,
    (i + 1) % n,
  ])
}

suite('dynamics/random-walk: diffusive baseline', [
  check(
    'MSD starts at 0 and grows roughly linearly (exponent ~ 1)',
    () => {
      const msd = classicalWalkMSD({ steps: 200, runs: 400 })

      equal(msd[0]!, 0, 'MSD(0) = 0')

      // log-log slope over [10, 200]
      let sx = 0,
        sy = 0,
        sxx = 0,
        sxy = 0,
        m = 0

      for (let t = 10; t <= 200; t++) {
        if (msd[t]! <= 0) continue

        const x = Math.log(t)
        const y = Math.log(msd[t]!)

        sx += x
        sy += y
        sxx += x * x
        sxy += x * y
        m++
      }

      const exponent = (m * sxy - sx * sy) / (m * sxx - sx * sx)

      close(exponent, 1, 0.2, `diffusive exponent ${exponent} ~ 1`)
    },
  ),
  check(
    'a line-graph walk is diffusive (exponent < 1.5, well below ballistic)',
    () => {
      const exp = graphWalkMsdExponent({
        neighbors: ringNeighbors(401),
        start: 200,
        beats: 120,
        runs: 200,
      })

      ok(exp < 1.5, `graph-walk exponent ${exp} is diffusive`)
    },
  ),
])

suite('dynamics/random-walk: determinism', [
  check('the same seed gives the same endpoint and path', () => {
    const neighbors = ringNeighbors(50)
    const e1 = randomWalkEndpoint({
      neighbors,
      start: 0,
      steps: 100,
      rng: makeRng({ seed: 7 }),
    })

    const e2 = randomWalkEndpoint({
      neighbors,
      start: 0,
      steps: 100,
      rng: makeRng({ seed: 7 }),
    })

    equal(e1, e2, 'endpoint reproducible')

    const p1 = randomWalkPath({
      neighbors,
      start: 0,
      steps: 30,
      rng: makeRng({ seed: 9 }),
    })

    const p2 = randomWalkPath({
      neighbors,
      start: 0,
      steps: 30,
      rng: makeRng({ seed: 9 }),
    })

    equal(p1.length, 31, 'path includes the start')

    for (let i = 0; i < p1.length; i++)
      equal(p1[i]!, p2[i]!, `path step ${i}`)
  }),
  check(
    'classicalWalkMSD is seed-deterministic (fixed internal seeding)',
    () => {
      const a = classicalWalkMSD({ steps: 50, runs: 50 })
      const b = classicalWalkMSD({ steps: 50, runs: 50 })

      for (let i = 0; i < a.length; i++) equal(a[i]!, b[i]!, `msd ${i}`)
    },
  ),
])

suite('dynamics/random-walk: persistent walk limits', [
  check(
    'mix = 0 is ballistic: displacement equals the number of steps',
    () => {
      const directions = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]

      const d = persistentWalkMeanDisplacement({
        directions,
        mix: 0,
        steps: 50,
        runs: 8,
        rng: makeRng({ seed: 3 }),
      })

      close(d, 50, 1e-9, 'straight line of unit steps')
    },
  ),
  check(
    'mix = 1 (memoryless) is much shorter than the ballistic line',
    () => {
      const directions = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]

      const d = persistentWalkMeanDisplacement({
        directions,
        mix: 1,
        steps: 400,
        runs: 200,
        rng: makeRng({ seed: 5 }),
      })

      ok(d < 100, `diffusive displacement ${d} << ballistic 400`)
    },
  ),
  check('persistentWalk is deterministic under a fixed seed', () => {
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]

    const run = (): number =>
      persistentWalkMeanDisplacement({
        directions,
        mix: 0.5,
        steps: 80,
        runs: 20,
        rng: makeRng({ seed: 11 }),
      })

    equal(run(), run(), 'reproducible')
  }),
])
