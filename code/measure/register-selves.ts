// INTEGRATION AND BINDING ACROSS LINES ON THE MANY-HOLE STORE (item 0022 of moving-matter, E-SLF-0179). Two reads of
// E-FND-0163's sorted store, both defined on the holes alone: no role, no line label, no member label (the holes are
// fermions of one kind, so a read must be symmetric in them).
//
// THE ONE-HOLE OCCUPATION n(k): the expected number of holes at momentum class k (register-sorted-holes'
// sortedOccupation, summing to n). A one-body rule that is the same at every dock keeps every hole's momentum class, so
// it keeps n(k) exactly; only the pair pieces, which depend on the holes' separation, can move it.
//
// THE PAIR DENSITY rho2(k1, k2): the expected number of ordered pairs of distinct holes with one at k1 and the other at
// k2 (summing to n (n - 1)). Each stored row r stands for weight[r] orderings of its sorted momenta s, each with the
// row's weight w[r], so every ordered pair of positions (a, b), a != b, adds weight[r] w[r] at (s_a, s_b), as
// sortedOccupation adds it at s_a. The free rule keeps every row's weight, so it keeps rho2 exactly too.
//
// THE CONNECTED PART C(k1, k2) = rho2(k1, k2) - n(k1) n(k2), for k1 != k2. With the total momentum fixed the one-hole
// density matrix is diagonal in momentum, so the exchange term of a Slater determinant lives on k1 = k2 only, and a
// Slater determinant of distinct classes has C = 0 off the diagonal. C is what the holes carry jointly beyond what each
// carries alone. The diagonal (two holes in one class with different fibers) is left out of C and reported.
//
// THE READS against the start (time 0):
//   integration I(t) = sum_k |n_t(k) - n_0(k)| / (2 n)        the fraction of the holes moved to other classes
//   binding     B(t) = sum_(k1 != k2) |C_t - C_0| / (n (n - 1)) the pair correlation built beyond the marginals
// Both are 0 under the free rule by the conservation above, so the free rule is the control (E-FND-0158's CS, 1.2e-13).
//
// DETERMINISM: no random numbers; pure arithmetic on the store.

import { bandVectors, type HoleFrame } from '@/code/measure/register-holes'
import {
  sortedOccupation,
  sortedSlater,
  type Sorted,
  type SortedEngine,
} from '@/code/measure/register-sorted-holes'

// each row's weight, sum over fiber indices of |x|^2
function rowWeights(e: SortedEngine, s: Sorted): Float64Array {
  const out = new Float64Array(e.rows)

  for (let r = 0; r < e.rows; r++) {
    let x = 0

    for (let k = r * e.block; k < (r + 1) * e.block; k++) {
      x += s.re[k]! * s.re[k]! + s.im[k]! * s.im[k]!
    }

    out[r] = x * e.weight[r]!
  }

  return out
}

export const holeOccupation = (e: SortedEngine, s: Sorted): Float64Array => sortedOccupation(e, s)

// the ordered pair density rho2, N x N (row k1, column k2), summing to n (n - 1) times the norm
export function pairDensity(e: SortedEngine, s: Sorted): Float64Array {
  const N = e.frame.fourier.N
  const n = e.n
  const w = rowWeights(e, s)
  const out = new Float64Array(N * N)

  for (let r = 0; r < e.rows; r++) {
    const x = w[r]!

    if (x === 0) {
      continue
    }

    const o = r * n

    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        if (a !== b) {
          out[e.mom[o + a]! * N + e.mom[o + b]!]! += x
        }
      }
    }
  }

  return out
}

// C = rho2 - n (x) n off the diagonal (the diagonal set to 0)
export function connectedPairs(occ: Float64Array, rho2: Float64Array): Float64Array {
  const N = occ.length
  const out = new Float64Array(N * N)

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (i !== j) {
        out[i * N + j] = rho2[i * N + j]! - occ[i]! * occ[j]!
      }
    }
  }

  return out
}

// the weight of rho2 on its diagonal (two holes in one class), reported
export function samePairs(rho2: Float64Array, N: number): number {
  let x = 0

  for (let i = 0; i < N; i++) {
    x += rho2[i * N + i]!
  }

  return x
}

export type SelvesRead = {
  occ: Float64Array
  rho2: Float64Array
  conn: Float64Array
}

export function selvesRead(e: SortedEngine, s: Sorted): SelvesRead {
  const occ = holeOccupation(e, s)
  const rho2 = pairDensity(e, s)

  return { occ, rho2, conn: connectedPairs(occ, rho2) }
}

export function integration(n: number, start: SelvesRead, now: SelvesRead): number {
  let x = 0

  for (let k = 0; k < start.occ.length; k++) {
    x += Math.abs(now.occ[k]! - start.occ[k]!)
  }

  return x / (2 * n)
}

export function binding(n: number, start: SelvesRead, now: SelvesRead): number {
  let x = 0

  for (let k = 0; k < start.conn.length; k++) {
    x += Math.abs(now.conn[k]! - start.conn[k]!)
  }

  return x / (n * (n - 1))
}

// distinct momentum classes summing to the total 0, the first n (3 or 4) in index order after `from` (E-FND-0163's
// start, so its four-hole run is the one read here)
export function distinctClasses(fr: HoleFrame, n: 3 | 4, from: number): number[] {
  const F = fr.fourier
  const N = F.N

  for (let a = from; a < N; a++) {
    for (let b = a + 1; b < N; b++) {
      const ab = F.sum[F.neg[a]! * N + F.neg[b]!]!

      if (n === 3) {
        if (ab > b) {
          return [a, b, ab]
        }

        continue
      }

      for (let c = b + 1; c < N; c++) {
        const d = F.sum[ab * N + F.neg[c]!]!

        if (d > c) {
          return [a, b, c, d]
        }
      }
    }
  }

  throw new Error('register-selves: no distinct start')
}

// the triples of distinct classes summing to 0 whose band levels form the multiset `key` (comma separated level indices,
// 0 the lowest), in index order: E-FND-0165's starts, so its three-hole runs are the ones read here
export function levelClasses(fr: HoleFrame, lev: Int32Array, key: string): number[][] {
  const F = fr.fourier
  const N = F.N
  const want = key.split(',').map(Number).sort((a, b) => a - b).join(',')
  const out: number[][] = []

  for (let a = 0; a < N; a++) {
    for (let b = a + 1; b < N; b++) {
      const c = F.sum[F.neg[a]! * N + F.neg[b]!]!

      if (c > b && [lev[a]!, lev[b]!, lev[c]!].sort((x, y) => x - y).join(',') === want) {
        out.push([a, b, c])
      }
    }
  }

  return out
}

// the Slater determinant of up-band eigenvectors at the given classes
export const bandSlater = (e: SortedEngine, js: readonly number[]): Sorted =>
  sortedSlater(e, js, js.map(j => bandVectors(e.frame, j).up[0]!))
