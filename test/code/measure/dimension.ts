// Conformance for code/measure/dimension: the dimension estimators. Each is checked
// on a substrate whose dimension is KNOWN by construction (a full L x L grid is 2D, a
// line is 1D, a ring is 1D, a 2D torus is 2D, a chain causal set has ordering fraction
// 1 -> Myrheim-Meyer dimension 1, a "star" order has fraction 1/2 -> dimension 2).
// The Myrheim-Meyer inversion is checked at its two fixed points f(1) = 1, f(2) = 1/2.

import {
  suite,
  check,
  close,
  equal,
  exactArray,
} from '@/test/code/harness'
import {
  dimensionFromOrderingFraction,
  myrheimMeyerDimension,
  ballGrowth,
  ballGrowthDimension,
  boxCountingDimension,
  spectralDimension,
} from '@/code/measure/dimension'
import { makeGraph, Graph } from '@/code/tool/graph'
import { makePosetFromRelation, Poset } from '@/code/tool/poset'

// A path graph 0-1-2-...-(n-1) as a Substrate.
function pathGraph(n: number): Graph {
  const neighbors: number[][] = []

  for (let i = 0; i < n; i++) {
    const row: number[] = []

    if (i > 0) row.push(i - 1)

    if (i < n - 1) row.push(i + 1)

    neighbors.push(row)
  }

  return makeGraph({ size: n, directed: false, neighbors })
}

// A ring (cycle) of n nodes as a plain neighbor list.
function ringNeighbors(n: number): number[][] {
  return Array.from({ length: n }, (_, i) => [
    (i - 1 + n) % n,
    (i + 1) % n,
  ])
}

// A 2D torus L x L (node = y*L + x) as a plain neighbor list.
function torusNeighbors(L: number): number[][] {
  const out: number[][] = []

  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      const id = y * L + x

      out[id] = [
        y * L + ((x + 1) % L),
        y * L + ((x - 1 + L) % L),
        ((y + 1) % L) * L + x,
        ((y - 1 + L) % L) * L + x,
      ]
    }
  }

  return out
}

// A 2D open grid L x L (no wrap), plain neighbor list.
function gridNeighbors(L: number): number[][] {
  const out: number[][] = []

  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      const id = y * L + x
      const row: number[] = []

      if (x + 1 < L) row.push(y * L + x + 1)

      if (x - 1 >= 0) row.push(y * L + x - 1)

      if (y + 1 < L) row.push((y + 1) * L + x)

      if (y - 1 >= 0) row.push((y - 1) * L + x)

      out[id] = row
    }
  }

  return out
}

// A poset from an explicit, already transitively-closed set of ordered pairs (a < b).
function posetFromPairs(
  size: number,
  pairs: [number, number][],
): Poset {
  const set = new Set(pairs.map(([a, b]) => a * size + b))

  return makePosetFromRelation({
    size,
    precedes: ({ a, b }) => set.has(a * size + b),
  })
}

suite('measure/dimension: Myrheim-Meyer inversion fixed points', [
  check('ordering fraction 1 inverts to dimension 1 (f(1) = 1)', () => {
    close(dimensionFromOrderingFraction(1), 1, 1e-3)
  }),
  check(
    'ordering fraction 1/2 inverts to dimension 2 (f(2) = 1/2)',
    () => {
      close(dimensionFromOrderingFraction(0.5), 2, 1e-3)
    },
  ),
  check(
    'the inversion is monotone: smaller fraction -> larger dimension',
    () => {
      const d1 = dimensionFromOrderingFraction(0.8)
      const d2 = dimensionFromOrderingFraction(0.5)
      const d3 = dimensionFromOrderingFraction(0.3)

      equal(d1 < d2 && d2 < d3, true)
    },
  ),
  check('guard: a non-positive fraction returns 0', () => {
    equal(dimensionFromOrderingFraction(0), 0)
    equal(dimensionFromOrderingFraction(-0.5), 0)
  }),
])

suite('measure/dimension: Myrheim-Meyer on causal sets', [
  check(
    'a total chain (ordering fraction 1) reads dimension ~ 1',
    () => {
      const pairs: [number, number][] = []

      for (let a = 0; a < 6; a++) {
        for (let b = a + 1; b < 6; b++) pairs.push([a, b])
      }

      close(
        myrheimMeyerDimension({ poset: posetFromPairs(6, pairs) }),
        1,
        1e-2,
      )
    },
  ),
  check(
    'a star order with ordering fraction 1/2 reads dimension ~ 2',
    () => {
      // 0 below 1,2,3 (3 of 6 pairs related) -> fraction 0.5 -> dimension 2.
      const poset = posetFromPairs(4, [
        [0, 1],
        [0, 2],
        [0, 3],
      ])

      close(myrheimMeyerDimension({ poset }), 2, 1e-2)
    },
  ),
  check('an antichain (no relations) reads dimension 0', () => {
    equal(myrheimMeyerDimension({ poset: posetFromPairs(5, []) }), 0)
  }),
])

suite('measure/dimension: ball growth on a path', [
  check('cumulative ball sizes on a path are 1,3,5,7,9,11', () => {
    const growth = ballGrowth({
      substrate: pathGraph(11),
      center: 5,
      maxRadius: 5,
    })

    exactArray(growth, [1, 3, 5, 7, 9, 11])
  }),
])

suite('measure/dimension: box-counting (Minkowski) dimension', [
  check(
    'a fully filled 32x32 sheet has box-counting dimension exactly 2',
    () => {
      const cells = Array.from({ length: 32 * 32 }, (_, i) => i)

      close(boxCountingDimension({ cells, sideLength: 32 }), 2, 1e-9)
    },
  ),
  check(
    'a single filled row (a line) has box-counting dimension exactly 1',
    () => {
      const cells = Array.from({ length: 32 }, (_, x) => x) // y = 0 row

      close(boxCountingDimension({ cells, sideLength: 32 }), 1, 1e-9)
    },
  ),
  check('guard: too few cells returns 0', () => {
    equal(boxCountingDimension({ cells: [0, 1], sideLength: 8 }), 0)
  }),
])

suite('measure/dimension: spectral dimension', [
  check('a 1D ring has spectral dimension ~ 1', () => {
    const ds = spectralDimension({
      neighbors: ringNeighbors(120),
      start: 0,
      t1: 10,
      t2: 40,
    })

    close(ds, 1, 0.2)
  }),
  check('a 2D torus has spectral dimension ~ 2', () => {
    const ds = spectralDimension({
      neighbors: torusNeighbors(25),
      start: 25 * 12 + 12,
      t1: 10,
      t2: 50,
    })

    close(ds, 2, 0.25)
  }),
])

suite('measure/dimension: ball-growth dimension', [
  check('a path graph reads ball-growth dimension ~ 1', () => {
    const neighbors = pathGraph(61).neighbors.map(r => Array.from(r))
    const d = ballGrowthDimension({
      neighbors,
      centers: [30],
      maxRadius: 25,
    })

    close(d, 1, 0.2)
  }),
  check('an open 2D grid reads ball-growth dimension near 2', () => {
    const d = ballGrowthDimension({
      neighbors: gridNeighbors(41),
      centers: [41 * 20 + 20],
      maxRadius: 18,
    })

    // The L1 ball count 2r^2+2r+1 only reaches the r^2 asymptote slowly at finite r,
    // so the fitted slope sits a little under 2; a generous band still excludes 1 and 3.
    close(d, 1.8, 0.35)
  }),
])
