// Conformance for code/measure/shell-growth: the cells-per-shell counts and the growth-rate helpers.
// A complete branching-b tree has shell counts [1, b, b^2, ...], so its growth ratio is exactly b.
// The Euclidean L1 shell counts have exact closed forms (4n in Z^2, 4n^2+2 in Z^3) and ratios that
// tend to 1. Aitken extrapolation, the log-base exponent, and the order-2 recurrence fit are checked
// on constructed sequences with known answers.

import { suite, check, equal, close } from '@/test/code/harness'
import {
  shellCountsFromGraph,
  growthRatioFromShellCounts,
  euclideanL1ShellCount,
  euclideanL1ShellRatio,
  shellSeparationExponent,
  extrapolatedGrowthRate,
  fitOrder2Recurrence,
} from '@/code/measure/shell-growth'

// a complete rooted tree with branching factor b and the given depth, as a neighbor list
function regularTree(b: number, depth: number): {
  neighbors: number[][]
  count: number
} {
  const neighbors: number[][] = [[]]
  let frontier = [0]
  for (let d = 0; d < depth; d++) {
    const next: number[] = []
    for (const parent of frontier) {
      for (let c = 0; c < b; c++) {
        const child = neighbors.length
        neighbors.push([parent])
        neighbors[parent]!.push(child)
        next.push(child)
      }
    }
    frontier = next
  }
  return { neighbors, count: neighbors.length }
}

suite('measure/shell-growth: tree shell counts', [
  // A complete branching-3 tree of depth 4: shells [1, 3, 9, 27, 81].
  check('a branching-3 tree has shells [1, 3, 9, 27, 81]', () => {
    const t = regularTree(3, 4)
    const counts = shellCountsFromGraph({ neighbors: t.neighbors, cellCount: t.count })
    equal(counts.length, 5)
    equal(counts[0]!, 1)
    equal(counts[1]!, 3)
    equal(counts[2]!, 9)
    equal(counts[3]!, 27)
    equal(counts[4]!, 81)
  }),
  // growthRatioFromShellCounts drops the truncated last shell and reads ratio at len-2: 27/9 = 3.
  check('the growth ratio of the tree is the branching factor', () => {
    const r = growthRatioFromShellCounts([1, 3, 9, 27, 81])
    equal(r.ratio, 3)
    equal(r.shell, 3)
  }),
])

suite('measure/shell-growth: Euclidean L1 shells', [
  // |S(n)| in Z^2 is 4n (n>=1); in Z^3 it is 4n^2 + 2; in Z^1 it is 2.
  check('the exact L1 shell counts', () => {
    equal(euclideanL1ShellCount({ dimension: 2, shell: 1 }), 4)
    equal(euclideanL1ShellCount({ dimension: 2, shell: 3 }), 12)
    equal(euclideanL1ShellCount({ dimension: 3, shell: 1 }), 6)
    equal(euclideanL1ShellCount({ dimension: 3, shell: 2 }), 18)
    equal(euclideanL1ShellCount({ dimension: 3, shell: 3 }), 38)
    equal(euclideanL1ShellCount({ dimension: 1, shell: 5 }), 2)
    equal(euclideanL1ShellCount({ dimension: 3, shell: 0 }), 1)
  }),
  // The ratio in Z^2 is 4n / 4(n-1) = n/(n-1), tending to 1 (polynomial growth, the control).
  check('the L1 ratio is n/(n-1) and tends to 1', () => {
    close(euclideanL1ShellRatio({ dimension: 2, shell: 5 }), 5 / 4, 1e-9)
    close(euclideanL1ShellRatio({ dimension: 2, shell: 100 }), 100 / 99, 1e-9)
  }),
])

suite('measure/shell-growth: growth-rate algebra', [
  // ratio = lambda^p so p = log(ratio)/log(lambda): 8 = 2^3.
  check('the shell-separation exponent inverts lambda^p', () => {
    close(shellSeparationExponent({ ratio: 8, growthRate: 2 }), 3, 1e-12)
    close(shellSeparationExponent({ ratio: 81, growthRate: 3 }), 4, 1e-12)
  }),
  // Aitken on three equal ratios returns the ratio (the denominator is zero, so it falls through).
  check('Aitken on a clean geometric sequence returns the ratio', () => {
    close(extrapolatedGrowthRate([1, 2, 4, 8, 16, 32]), 2, 1e-12)
  }),
  // Aitken on ratios 1.5, 1.25, 1.125 (gaps halving toward 1) extrapolates to the limit 1.
  check('Aitken accelerates a converging ratio sequence to its limit', () => {
    // counts chosen so the interior ratios (indices 2..len-2) are 1.5, 1.25, 1.125
    close(extrapolatedGrowthRate([1, 8, 12, 15, 16.875, 999]), 1, 1e-9)
  }),
  // Fibonacci satisfies s[i] = s[i-1] + s[i-2]: a = b = 1, both integers.
  check('the Fibonacci shell sequence fits an order-2 integer recurrence', () => {
    const r = fitOrder2Recurrence([1, 1, 2, 3, 5, 8, 999])
    close(r.a, 1, 1e-9)
    close(r.b, 1, 1e-9)
    equal(r.isInteger, true)
  }),
])
