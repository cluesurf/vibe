// THE SORTED STORE: MANY HOLES OF THE REGISTER RULE, ANTISYMMETRIC BY CONSTRUCTION (E-FND-0163). E-FND-0161's engine
// (code/measure/register-holes) holds n holes as N^(n - 1) momentum tuples times f^n fiber indices, every ordering of
// the members stored. Holes are fermions of one kind, so every amplitude is a signed copy of the one at the momenta in
// increasing order. This module stores only those, and runs the same rule on them exactly.
//
// WHY IT IS EXACT (derived in E-FND-0163). Write psi(m; b) for the amplitude with member i at momentum class m_i and
// fiber index b_i. Antisymmetry is psi(m o tau; b o tau) = sgn(tau) psi(m; b) for every member permutation tau, with
// (m o tau)_k = m_(tau(k)).
//   the store     only rows whose momenta are nondecreasing, s_0 <= s_1 <= ... <= s_(n-1), each with ALL f^n fiber
//                 indices (a tie s_k = s_(k+1) keeps both orders of its fibers: a few percent of rows carry that
//                 redundancy, and it keeps the one-body step a plain matrix product). psi(m; b) = sgn(sigma) psi(s;
//                 b o sigma), sigma the stable sort of m
//   the one-body  every piece but the pair piece is a product of one-member matrices A(m_i), which never changes a
//                 member's momentum. So it maps a sorted row to itself, and is applied to the store as register-holes
//                 applies it to a tuple (the kernel's holeOneBody on the sorted rows' momenta)
//   the pair      the pair piece is a phase in relative SITE coordinates, which needs a fiber tuple's whole column over
//                 every momentum ordering. The members' fiber tuples fall into orbits under permutation. One column,
//                 for the orbit's sorted fiber tuple b, determines every stored entry of the orbit: gather it through
//                 psi(m; b) = sgn(sigma) psi(s; b o sigma), transform, phase and transform back exactly as the dense
//                 engine does its column, and scatter stored(s; b o tau) = sgn(tau) column(m) with m o tau = s. The
//                 piece commutes with member permutations, so the result is the dense engine's, antisymmetric
//   translation   the total momentum is fixed, as in the dense engine (the last member's class is the rest)
//
// SIZE. Four holes in one half at L = 4: 91,808 sorted rows (of 2,097,152 tuples) times 8^4 = 3.76e8 amplitudes, 6.0
// GB, against 8.6e9 (137 GB) in the dense layout. Three holes at L = 6: 70,335 rows, 3.6e7 amplitudes (0.58 GB).
//
// The steps run on a kernel (code/kernel): the js backend by default, which is the reference, and native with
// { backend: 'native', threads } byte for byte the same (task/kernel/check.ts). The point group is NOT used: the frames
// depend on momentum, so a rotation acts by 8 x 8 blocks on momentum orbits (remaining-pieces.md); the next reduction.
//
// DETERMINISM: no random numbers. FLOATS are measurement on exact pieces, as in register-sea.

import { kernel as kernelOf, type Kernel, type KernelOptions } from '@/code/kernel/index'
import {
  flatMatrices,
  holeFourierTables,
  holePatterns,
  inSectorOf,
  maskOf,
  phaseFor,
} from '@/code/kernel/holes'
import type { HoleFourierTables, HolePairTables, HolePhase } from '@/code/kernel/types'
import {
  allPerms,
  bandVectors,
  newHoles,
  permSign,
  type HoleEngine,
  type HoleFrame,
  type HoleRule,
  type Holes,
  type Vec,
} from '@/code/measure/register-holes'

export type SortedEngine = {
  frame: HoleFrame
  n: number
  total: number
  k: Kernel
  rows: number
  block: number
  // the sorted momenta of every row (rows * n), and each row's number of distinct orderings (the dense entries it holds)
  mom: Int32Array
  weight: Float64Array
  // the dense tuple index of each row's own ordering
  denseOf: Int32Array
  pair: HolePairTables
  masks: number[]
  fourier: HoleFourierTables
  A1: { re: Float64Array; im: Float64Array }
  A2: { re: Float64Array; im: Float64Array }
  up: { re: Float64Array; im: Float64Array }
  perms: number[][]
  phases: WeakMap<Float64Array, Map<string, HolePhase>>
}

export type Sorted = { re: Float64Array; im: Float64Array }

// the fiber tuple of index fb (member 0 the most significant digit), and back
const digits = (fb: number, n: number, f: number): number[] => {
  const out = new Array<number>(n)
  let rest = fb

  for (let i = n - 1; i >= 0; i--) {
    out[i] = rest % f
    rest = Math.floor(rest / f)
  }

  return out
}

const index = (b: readonly number[], f: number): number => b.reduce((x, d) => x * f + d, 0)

// the stable sort of m: sigma with (m o sigma) nondecreasing, ties kept in member order
function stableSort(m: ArrayLike<number>, n: number): number[] {
  return Array.from({ length: n }, (_, i) => i).sort((a, b) => m[a]! - m[b]! || a - b)
}

export function sortedEngine(
  fr: HoleFrame,
  n: number,
  total: number,
  options?: KernelOptions,
): SortedEngine {
  const F = fr.fourier
  const N = F.N
  const f = fr.fiber
  const block = f ** n
  const tuples = N ** (n - 1)
  const perms = allPerms(n)
  const nperm = perms.length
  const permIndex = new Map(perms.map((p, i) => [p.join(','), i]))
  const m = new Int32Array(n)
  // the full momenta of every dense tuple
  const full = new Int32Array(tuples * n)

  for (let T = 0; T < tuples; T++) {
    let rest = T
    let acc = total

    for (let i = n - 2; i >= 0; i--) {
      m[i] = rest % N
      rest = Math.floor(rest / N)
      acc = F.sum[acc * N + F.neg[m[i]!]!]!
    }

    m[n - 1] = acc
    full.set(m, T * n)
  }

  // the rows: the tuples whose momenta are nondecreasing, in tuple order
  const rowOfDense = new Int32Array(tuples).fill(-1)
  const denseRows: number[] = []

  for (let T = 0; T < tuples; T++) {
    let sorted = true

    for (let i = 1; i < n; i++) {
      if (full[T * n + i]! < full[T * n + i - 1]!) {
        sorted = false
        break
      }
    }

    if (sorted) {
      rowOfDense[T] = denseRows.length
      denseRows.push(T)
    }
  }

  const rows = denseRows.length
  const mom = new Int32Array(rows * n)
  const weight = new Float64Array(rows)
  const denseOf = Int32Array.from(denseRows)
  const tupleOf = (x: ArrayLike<number>): number => {
    let T = 0

    for (let i = 0; i < n - 1; i++) {
      T = T * N + x[i]!
    }

    return T
  }

  let fact = 1

  for (let i = 2; i <= n; i++) {
    fact *= i
  }

  denseRows.forEach((T, r) => {
    const s = full.subarray(T * n, T * n + n)

    mom.set(s, r * n)

    // n! over the product of the multiplicities' factorials
    let w = fact
    let run = 1

    for (let i = 1; i <= n; i++) {
      if (i < n && s[i] === s[i - 1]) {
        run++
      } else {
        for (let x = 2; x <= run; x++) {
          w /= x
        }

        run = 1
      }
    }

    weight[r] = w
  })

  // the gather: every dense tuple's sorted row and its stable sort
  const rowOf = new Int32Array(tuples)
  const permOf = new Int32Array(tuples)
  const s = new Int32Array(n)

  for (let T = 0; T < tuples; T++) {
    const mt = full.subarray(T * n, T * n + n)
    const sigma = stableSort(mt, n)

    sigma.forEach((j, k) => (s[k] = mt[j]!))
    rowOf[T] = rowOfDense[tupleOf(s)]!
    permOf[T] = permIndex.get(sigma.join(','))!
  }

  // the scatter: for each row and each tau, the dense tuple m with m_(tau(k)) = s_k
  const tOf = new Int32Array(rows * nperm)

  for (let r = 0; r < rows; r++) {
    const sr = mom.subarray(r * n, r * n + n)

    perms.forEach((tau, p) => {
      tau.forEach((j, k) => (m[j] = sr[k]!))
      tOf[r * nperm + p] = tupleOf(m)
    })
  }

  // the orbits: the sorted fiber tuples with an active pair (every pair of in-sector members)
  const { masks, index: patternOf } = holePatterns(n)
  const fbOf: number[] = []
  const pattern: number[] = []
  const writeOff = [0]
  const writeC: number[] = []
  const writeTau: number[] = []

  for (let fb = 0; fb < block; fb++) {
    const b = digits(fb, n, f)

    if (b.some((x, i) => i > 0 && x < b[i - 1]!)) {
      continue
    }

    const p = patternOf.get(maskOf(inSectorOf(fr, n, fb)))

    if (p === undefined) {
      continue
    }

    const seen = new Set<number>()

    perms.forEach((sigma, q) => {
      // b o sigma
      const c = index(
        sigma.map(j => b[j]!),
        f,
      )

      fbOf.push(c)

      if (!seen.has(c)) {
        seen.add(c)
        writeC.push(c)
        writeTau.push(q)
      }
    })

    pattern.push(p)
    writeOff.push(writeC.length)
  }

  return {
    frame: fr,
    n,
    total,
    k: kernelOf(options?.backend ?? 'js', options?.threads ?? 1),
    rows,
    block,
    mom,
    weight,
    denseOf,
    pair: {
      rowOf,
      permOf,
      psign: Int32Array.from(perms, p => permSign(p)),
      fbOf: Int32Array.from(fbOf),
      pattern: Int32Array.from(pattern),
      writeOff: Int32Array.from(writeOff),
      writeC: Int32Array.from(writeC),
      writeTau: Int32Array.from(writeTau),
      tOf,
    },
    masks,
    fourier: holeFourierTables(F),
    A1: flatMatrices(fr.A1, f),
    A2: flatMatrices(fr.A2, f),
    up: flatMatrices(fr.up, f),
    perms,
    phases: new WeakMap(),
  }
}

export const newSorted = (e: SortedEngine): Sorted => ({
  re: new Float64Array(e.rows * e.block),
  im: new Float64Array(e.rows * e.block),
})

export const copySorted = (s: Sorted): Sorted => ({
  re: Float64Array.from(s.re),
  im: Float64Array.from(s.im),
})

// the pair piece, one beat
function sortedPairs(e: SortedEngine, s: Sorted, angle: Float64Array | null | undefined, sign: 1 | -1): void {
  if (!angle || e.pair.pattern.length === 0) {
    return
  }

  const ph = phaseFor(e.phases, e.frame.fourier, e.n, angle, sign, undefined, e.masks)

  e.k.holePair(s.re, s.im, e.fourier, e.pair, ph)
}

// one cycle, register-holes holeCycle's steps on the store. A pair mask (rule.pairs) would break the members' symmetry
// and is refused
export function sortedCycle(e: SortedEngine, rule: HoleRule, s: Sorted): void {
  if (rule.pairs) {
    throw new Error('register-sorted-holes: a pair mask breaks the antisymmetry the store relies on')
  }

  const f = e.frame.fiber

  sortedPairs(e, s, rule.angle, 1)
  e.k.holeOneBody(s.re, s.im, e.mom, e.n, f, e.A1.re, e.A1.im)
  sortedPairs(e, s, rule.angle2 === undefined ? rule.angle : rule.angle2, -1)
  e.k.holeOneBody(s.re, s.im, e.mom, e.n, f, e.A2.re, e.A2.im)
}

// ---- starts and the bridge to the dense layout ----

// the antisymmetrized, normalized state of n holes, hole a in momentum class js[a] with fiber vector vs[a] (the momenta
// must sum to the total): stored(s; c) = sum over pi of sgn(pi) prod_k [js[pi(k)] = s_k] vs[pi(k)][c_k], normalized
export function sortedSlater(e: SortedEngine, js: readonly number[], vs: readonly Vec[]): Sorted {
  const one = slaterRow(e, js, vs)
  const out = newSorted(e)

  out.re.set(one.re, one.row * e.block)
  out.im.set(one.im, one.row * e.block)

  return out
}

// the one row a Slater determinant of distinct momenta occupies, normalized as the whole state would be
export function slaterRow(
  e: SortedEngine,
  js: readonly number[],
  vs: readonly Vec[],
): { row: number; re: Float64Array; im: Float64Array } {
  const n = e.n
  const f = e.frame.fiber
  const out = { re: new Float64Array(e.block), im: new Float64Array(e.block) }
  const target = [...js].sort((a, b) => a - b)
  const row = e.denseOf.findIndex((_, r) => target.every((x, k) => e.mom[r * n + k] === x))

  if (row < 0) {
    throw new Error('register-sorted-holes: the start momenta are not a row (do they sum to the total?)')
  }

  for (const pi of e.perms) {
    if (!pi.every((a, k) => js[a] === target[k])) {
      continue
    }

    const sg = permSign(pi)

    for (let c = 0; c < e.block; c++) {
      const cd = digits(c, n, f)

      let r = 1
      let im = 0

      for (let k = 0; k < n; k++) {
        const v = vs[pi[k]!]!
        const xr = v.re[cd[k]!]!
        const xi = v.im[cd[k]!]!
        const nr = r * xr - im * xi

        im = r * xi + im * xr
        r = nr
      }

      out.re[c]! += sg * r
      out.im[c]! += sg * im
    }
  }

  // the store's norm, sortedNorm's sum restricted to the one nonzero row
  let w = 0

  for (let c = 0; c < e.block; c++) {
    w += out.re[c]! * out.re[c]! + out.im[c]! * out.im[c]!
  }

  const nrm = Math.sqrt(e.weight[row]! * w)

  for (let x = 0; x < e.block; x++) {
    out.re[x]! /= nrm
    out.im[x]! /= nrm
  }

  return { row, ...out }
}

// the store of an antisymmetric dense state (its entries at the sorted orderings)
export function foldSorted(e: SortedEngine, dense: Holes): Sorted {
  const out = newSorted(e)

  for (let r = 0; r < e.rows; r++) {
    const from = e.denseOf[r]! * e.block

    out.re.set(dense.re.subarray(from, from + e.block), r * e.block)
    out.im.set(dense.im.subarray(from, from + e.block), r * e.block)
  }

  return out
}

// the dense state the store stands for: psi(m; b) = sgn(sigma) stored(s; b o sigma)
export function unfoldSorted(e: SortedEngine, de: HoleEngine, s: Sorted): Holes {
  const n = e.n
  const f = e.frame.fiber
  const out = newHoles(e.frame, n, e.total)
  const tuples = e.pair.rowOf.length
  const cOf = new Int32Array(e.perms.length * e.block)

  // b o sigma for every sigma and b
  e.perms.forEach((sigma, p) => {
    for (let b = 0; b < e.block; b++) {
      const bd = digits(b, n, f)

      cOf[p * e.block + b] = index(
        sigma.map(j => bd[j]!),
        f,
      )
    }
  })

  if (de.mom.length !== tuples * n) {
    throw new Error('register-sorted-holes: the dense engine has another shape')
  }

  for (let T = 0; T < tuples; T++) {
    const r = e.pair.rowOf[T]!
    const p = e.pair.permOf[T]!
    const sg = e.pair.psign[p]!

    for (let b = 0; b < e.block; b++) {
      const at = r * e.block + cOf[p * e.block + b]!

      out.re[T * e.block + b] = sg * s.re[at]!
      out.im[T * e.block + b] = sg * s.im[at]!
    }
  }

  return out
}

// ---- reads ----

// each row's weight, sum over fiber indices of |x|^2
function rowNorms(e: SortedEngine, s: Sorted): Float64Array {
  const out = new Float64Array(e.rows)

  for (let r = 0; r < e.rows; r++) {
    let x = 0

    for (let k = r * e.block; k < (r + 1) * e.block; k++) {
      x += s.re[k]! * s.re[k]! + s.im[k]! * s.im[k]!
    }

    out[r] = x
  }

  return out
}

// the dense state's norm: each row stands for weight[r] orderings
export function sortedNorm(e: SortedEngine, s: Sorted): number {
  const w = rowNorms(e, s)

  let x = 0

  for (let r = 0; r < e.rows; r++) {
    x += e.weight[r]! * w[r]!
  }

  return x
}

// the expected number of holes at each momentum class (sums to n times the norm)
export function sortedOccupation(e: SortedEngine, s: Sorted): Float64Array {
  const N = e.frame.fourier.N
  const w = rowNorms(e, s)
  const out = new Float64Array(N)

  for (let r = 0; r < e.rows; r++) {
    const x = e.weight[r]! * w[r]!

    for (let k = 0; k < e.n; k++) {
      out[e.mom[r * e.n + k]!]! += x
    }
  }

  return out
}

// the fraction of the holes in the cycle's positive-phase band (read at cycle boundaries), the dense bandWeights summed
// over members and divided by n: sum over rows of weight[r] times each position's band weight
export function sortedUp(e: SortedEngine, s: Sorted): number {
  const part = new Float64Array(e.rows * e.n)

  e.k.holeBand(s.re, s.im, e.mom, e.n, e.frame.fiber, e.up.re, e.up.im, part)

  let x = 0

  for (let r = 0; r < e.rows; r++) {
    let y = 0

    for (let k = 0; k < e.n; k++) {
      y += part[r * e.n + k]!
    }

    x += e.weight[r]! * y
  }

  return x / e.n
}

// the band basis at every momentum class, as the transfer that takes a fiber vector to its band coordinates:
// V(q)^dag, rows the band eigenvectors conjugated (bandVectors: the positive-phase band first, indices 0 .. f/2 - 1)
export function bandBasis(e: SortedEngine): { re: Float64Array; im: Float64Array } {
  const fr = e.frame
  const f = fr.fiber
  const N = fr.fourier.N
  const re = new Float64Array(N * f * f)
  const im = new Float64Array(N * f * f)

  for (let j = 0; j < N; j++) {
    const { up, down } = bandVectors(fr, j)

    ;[...up, ...down].forEach((v, r) => {
      for (let k = 0; k < f; k++) {
        re[j * f * f + r * f + k] = v.re[k]!
        im[j * f * f + r * f + k] = -v.im[k]!
      }
    })
  }

  return { re, im }
}

// the distribution of the number of holes in the OTHER band (not the positive-phase one): out[k] the weight with k
// holes there, k = 0 .. n (read at cycle boundaries). The store is copied a chunk of rows at a time into a small
// scratch, moved to band coordinates member by member on the kernel, and each fiber index's weight is counted by how
// many of its digits are in the other band. Band-resolved, so it separates a flip of every hole at once (the only way
// two free configurations of four holes can share a quasi-energy) from the dressing of each hole alone
export function sortedBandCounts(
  e: SortedEngine,
  s: Sorted,
  basis: { re: Float64Array; im: Float64Array },
  chunk = 2048,
): Float64Array {
  const n = e.n
  const f = e.frame.fiber
  const half = f / 2
  const count = new Int32Array(e.block)

  for (let c = 0; c < e.block; c++) {
    count[c] = digits(c, n, f).filter(d => d >= half).length
  }

  const out = new Float64Array(n + 1)
  const row = new Float64Array(n + 1)
  const sr = new Float64Array(Math.min(chunk, e.rows) * e.block)
  const si = new Float64Array(sr.length)

  for (let r0 = 0; r0 < e.rows; r0 += chunk) {
    const r1 = Math.min(e.rows, r0 + chunk)
    const xr = sr.subarray(0, (r1 - r0) * e.block)
    const xi = si.subarray(0, (r1 - r0) * e.block)

    xr.set(s.re.subarray(r0 * e.block, r1 * e.block))
    xi.set(s.im.subarray(r0 * e.block, r1 * e.block))
    e.k.holeOneBody(xr, xi, e.mom.subarray(r0 * n, r1 * n), n, f, basis.re, basis.im)

    for (let r = r0; r < r1; r++) {
      row.fill(0)

      const o = (r - r0) * e.block

      for (let c = 0; c < e.block; c++) {
        const x = xr[o + c]!
        const y = xi[o + c]!

        row[count[c]!]! += x * x + y * y
      }

      for (let k = 0; k <= n; k++) {
        out[k]! += e.weight[r]! * row[k]!
      }
    }
  }

  return out
}

// the expected number of holes at each momentum class in each band (read at cycle boundaries): out[j] in the
// positive-phase band, out[N + j] in the other, summing to n times the norm. The store is moved to band coordinates a
// chunk of rows at a time, as sortedBandCounts does, and each fiber index's weight is split over its members' digits
export function sortedBandOccupation(
  e: SortedEngine,
  s: Sorted,
  basis: { re: Float64Array; im: Float64Array },
  chunk = 2048,
): Float64Array {
  const n = e.n
  const f = e.frame.fiber
  const half = f / 2
  const N = e.frame.fourier.N
  // the band (0 up, 1 other) of each member's digit, per fiber index
  const bands = new Uint8Array(e.block * n)

  for (let c = 0; c < e.block; c++) {
    digits(c, n, f).forEach((d, k) => (bands[c * n + k] = d >= half ? 1 : 0))
  }

  const out = new Float64Array(2 * N)
  const row = new Float64Array(2 * n)
  const sr = new Float64Array(Math.min(chunk, e.rows) * e.block)
  const si = new Float64Array(sr.length)

  for (let r0 = 0; r0 < e.rows; r0 += chunk) {
    const r1 = Math.min(e.rows, r0 + chunk)
    const xr = sr.subarray(0, (r1 - r0) * e.block)
    const xi = si.subarray(0, (r1 - r0) * e.block)

    xr.set(s.re.subarray(r0 * e.block, r1 * e.block))
    xi.set(s.im.subarray(r0 * e.block, r1 * e.block))
    e.k.holeOneBody(xr, xi, e.mom.subarray(r0 * n, r1 * n), n, f, basis.re, basis.im)

    for (let r = r0; r < r1; r++) {
      row.fill(0)

      const o = (r - r0) * e.block

      for (let c = 0; c < e.block; c++) {
        const x = xr[o + c]!
        const y = xi[o + c]!
        const w = x * x + y * y

        for (let k = 0; k < n; k++) {
          row[k * 2 + bands[c * n + k]!]! += w
        }
      }

      for (let k = 0; k < n; k++) {
        const j = e.mom[r * n + k]!

        out[j]! += e.weight[r]! * row[k * 2]!
        out[N + j]! += e.weight[r]! * row[k * 2 + 1]!
      }
    }
  }

  return out
}

// the antisymmetry the store keeps at a tie: at rows with s_k = s_(k+1), the largest |stored(c) + stored(c with k and
// k + 1 swapped)| (twice |stored(c)| where the two fibers agree). Exact arithmetic keeps it 0; rounding may not
export function sortedTies(e: SortedEngine, s: Sorted): number {
  const n = e.n
  const f = e.frame.fiber
  // the fiber index with positions k and k + 1 swapped, for every k
  const swap = Array.from({ length: n - 1 }, (_, k) =>
    Int32Array.from({ length: e.block }, (_, c) => {
      const cd = digits(c, n, f)
      const t = cd[k]!

      cd[k] = cd[k + 1]!
      cd[k + 1] = t

      return index(cd, f)
    }),
  )

  let worst = 0

  for (let r = 0; r < e.rows; r++) {
    for (let k = 0; k + 1 < n; k++) {
      if (e.mom[r * n + k] !== e.mom[r * n + k + 1]) {
        continue
      }

      const sw = swap[k]!
      const o = r * e.block

      for (let c = 0; c < e.block; c++) {
        const c2 = sw[c]!

        if (c2 < c) {
          continue
        }

        worst = Math.max(worst, Math.hypot(s.re[o + c]! + s.re[o + c2]!, s.im[o + c]! + s.im[o + c2]!))
      }
    }
  }

  return worst
}
