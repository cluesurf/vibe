// The qutrit Clifford group and its measures, for n qutrits (n = 1, 2): the Weyl-Heisenberg displacements,
// whether a unitary is Clifford (it maps every displacement to a phase times a displacement), its level in
// the Clifford hierarchy, mana, and the pieces a KCBS test on one role needs.
//
// Conventions follow code/measure/qutrit-phase-space: the displacement of one qutrit is D(a, b) =
// omega^(2ab) X^a Z^b, indexed 3 a + b, and n qutrits take the tensor product, index v1 9^(n-1) + ... + vn,
// the same order as phasePointOperators in code/measure/grid-weights.
//
// Theorems these measures stand on, cited rather than re-proved:
// - Gottesman (1998), Hostens, Dehaene and De Moor (2005): for odd prime d the Clifford group of n qudits mod
//   phases is Z_d^(2n) semidirect Sp(2n, d). For one qutrit that is ASL(2, 3), of order 9 x 24 = 216.
// - Gross (2006): for odd d a pure state has a nonnegative discrete Wigner function exactly when it is a
//   stabilizer state, and a Clifford unitary moves the Wigner function by an affine symplectic permutation.
// - Veitch, Mousavian, Gottesman and Emerson (2014): mana, M = ln sum |W|, is a monotone under stabilizer
//   operations, additive on products, and unchanged by any Clifford unitary.
// - Howard, Wallman, Veitch and Emerson (2014): for odd prime d, W(u) < 0 at some point is equivalent to
//   contextuality with respect to stabilizer measurements.
// - Klyachko, Can, Binicioglu and Shumovsky (2008): five projectors onto vectors v_k with v_k orthogonal to
//   v_(k+1) satisfy sum p_k <= 2 in any noncontextual model, and quantum states reach sqrt 5.
//
// Everything is floating point on at most 9 x 9 matrices, with stated tolerances, and no random numbers.

import { hermitianEigen } from '@/code/measure/photon-modes'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { complexLogNearIdentity } from '@/code/algebra/linear/complex-matrix'
import { type Matrix3 } from '@/code/dynamics/finite-gauge'
import { displacement } from '@/code/measure/qutrit-phase-space'
import {
  adjointOperator,
  identityOperator,
  multiplyOperators,
  operator,
  tensorOperators,
  type Operator,
} from '@/code/measure/grid-weights'

const MATCH_TOLERANCE = 1e-8
const SQRT5 = Math.sqrt(5)

// a 3 x 3 Matrix3 (interleaved re, im) as an Operator
export function operatorFrom3(m: Matrix3): Operator {
  const out = operator(3)

  for (let k = 0; k < 9; k++) {
    out.re[k] = m[2 * k] ?? 0
    out.im[k] = m[2 * k + 1] ?? 0
  }

  return out
}

// the displacement operators of n qutrits, index v1 9^(n-1) + ... + vn with v = 3 a + b
export function displacementOperators(qutrits: number): Operator[] {
  const single = [0, 1, 2].flatMap(a => [0, 1, 2].map(b => operatorFrom3(displacement(a, b))))
  let out: Operator[] = [identityOperator(1)]

  for (let q = 0; q < qutrits; q++) {
    out = out.flatMap(p => single.map(s => tensorOperators(p, s)))
  }

  return out
}

// Tr(a^dagger b)
export function innerProduct(a: Operator, b: Operator): [number, number] {
  let re = 0
  let im = 0

  for (let i = 0; i < a.n * a.n; i++) {
    const ar = a.re[i] ?? 0
    const ai = a.im[i] ?? 0
    const br = b.re[i] ?? 0
    const bi = b.im[i] ?? 0

    re += ar * br + ai * bi
    im += ar * bi - ai * br
  }

  return [re, im]
}

// u a u^dagger
export function conjugate(u: Operator, a: Operator): Operator {
  return multiplyOperators(multiplyOperators(u, a), adjointOperator(u))
}

// the displacement a matrix is a phase times, and that phase, or undefined
export function asDisplacement(m: Operator, displacements: readonly Operator[]): { index: number; phase: [number, number] } | undefined {
  const n = m.n

  for (let w = 0; w < displacements.length; w++) {
    const [re, im] = innerProduct(displacements[w] ?? m, m)

    if (Math.abs(Math.hypot(re, im) - n) < MATCH_TOLERANCE * n) {
      return { index: w, phase: [re / n, im / n] }
    }
  }

  return undefined
}

// The Clifford action of u: for each displacement D(v), the w and phase with u D(v) u^dagger = phase D(w),
// or undefined when some image is not a displacement (u is not Clifford)
export function cliffordAction(u: Operator, displacements: readonly Operator[]): { images: number[]; phases: [number, number][] } | undefined {
  const images: number[] = []
  const phases: [number, number][] = []

  for (const d of displacements) {
    const found = asDisplacement(conjugate(u, d), displacements)

    if (!found) {
      return undefined
    }

    images.push(found.index)
    phases.push(found.phase)
  }

  return { images, phases }
}

// The level of u in the Clifford hierarchy, up to maxLevel: 1 for a phase times a displacement, k when every
// u D u^dagger is at level k - 1. Returns maxLevel + 1 when u is at no level up to maxLevel
export function cliffordLevel(u: Operator, displacements: readonly Operator[], maxLevel: number): number {
  const within = (v: Operator, level: number): boolean => {
    if (asDisplacement(v, displacements)) {
      return true
    }

    if (level <= 1) {
      return false
    }

    return displacements.every(d => within(conjugate(v, d), level - 1))
  }

  for (let level = 1; level <= maxLevel; level++) {
    if (within(u, level)) {
      return level
    }
  }

  return maxLevel + 1
}

// the eigenphases of a unitary in turns, in [0, 1), sorted. Up to one global shift (sameSpectrumUpToPhase)
// they are invariant under conjugation by any unitary, so two gates with different lists are not conjugate
export function eigenphases(u: Operator): number[] {
  const n = u.n
  // a generic Hermitian combination (u + u^dagger) / 2 + MIX (u - u^dagger) / 2i shares u's eigenvectors
  const MIX = 0.371
  const h = makeComplexMatrix({ rows: n, cols: n })
  const ud = adjointOperator(u)

  for (let i = 0; i < n * n; i++) {
    const xr = ((u.re[i] ?? 0) + (ud.re[i] ?? 0)) / 2
    const xi = ((u.im[i] ?? 0) + (ud.im[i] ?? 0)) / 2
    const yr = ((u.im[i] ?? 0) - (ud.im[i] ?? 0)) / 2
    const yi = -((u.re[i] ?? 0) - (ud.re[i] ?? 0)) / 2

    h.re[i] = xr + MIX * yr
    h.im[i] = xi + MIX * yi
  }

  const eig = hermitianEigen(h)
  const turns: number[] = []

  for (let c = 0; c < n; c++) {
    // the eigenvalue of u on column c: v^dagger u v
    let re = 0
    let im = 0

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const vir = eig.vectorsRe[i * n + c] ?? 0
        const vii = eig.vectorsIm[i * n + c] ?? 0
        const vjr = eig.vectorsRe[j * n + c] ?? 0
        const vji = eig.vectorsIm[j * n + c] ?? 0
        const ur = u.re[i * n + j] ?? 0
        const ui = u.im[i * n + j] ?? 0
        // conj(v_i) u_ij v_j
        const pr = ur * vjr - ui * vji
        const pi = ur * vji + ui * vjr

        re += vir * pr + vii * pi
        im += vir * pi - vii * pr
      }
    }

    turns.push((((Math.atan2(im, re) / (2 * Math.PI)) % 1) + 1) % 1)
  }

  turns.sort((a, b) => a - b)

  return turns
}

// whether two eigenphase lists (in turns) agree up to one global shift, to a tolerance
export function sameSpectrumUpToPhase(a: readonly number[], b: readonly number[], tolerance = 1e-7): boolean {
  if (a.length !== b.length) {
    return false
  }

  const wrap = (x: number): number => x - Math.round(x)

  // try every shift that carries a's first phase onto one of b's, and compare as multisets on the circle
  return b.some(anchor => {
    const shift = anchor - (a[0] ?? 0)
    const used = new Array<boolean>(b.length).fill(false)

    return a.every(x => {
      const k = b.findIndex((y, i) => !used[i] && Math.abs(wrap(x + shift - y)) < tolerance)

      if (k < 0) {
        return false
      }

      used[k] = true

      return true
    })
  })
}

// mana of a quasi-probability, ln sum |W|, for weights summing to 1
export function mana(weights: readonly number[]): number {
  return Math.log(weights.reduce((s, w) => s + Math.abs(w), 0))
}

// mana of whole loves and fears: sum |W| = (loves + fears) / (loves - fears), exactly from the counts
export function manaOfCounts(input: { loves: bigint; fears: bigint }): number {
  const { loves, fears } = input

  return Math.log(Number(loves + fears) / Number(loves - fears))
}

// the density matrix sum_p W(p) A(p) of a quasi-probability on the phase points
export function operatorFromWigner(weights: readonly number[], points: readonly Operator[]): Operator {
  const n = points[0]?.n ?? 1
  const out = operator(n)

  points.forEach((a, p) => {
    const w = weights[p] ?? 0

    for (let i = 0; i < n * n; i++) {
      out.re[i] = (out.re[i] ?? 0) + w * (a.re[i] ?? 0)
      out.im[i] = (out.im[i] ?? 0) + w * (a.im[i] ?? 0)
    }
  })

  return out
}

// the eigenvalues of a Hermitian operator, ascending
export function hermitianSpectrum(a: Operator): number[] {
  const h = makeComplexMatrix({ rows: a.n, cols: a.n })

  h.re.set(a.re)
  h.im.set(a.im)

  return Array.from(hermitianEigen(h).values).sort((x, y) => x - y)
}

// the eigenvectors of a Hermitian operator as the columns of a unitary, in ascending order of eigenvalue
export function hermitianEigenvectors(a: Operator): { values: number[]; vectors: Operator } {
  const h = makeComplexMatrix({ rows: a.n, cols: a.n })

  h.re.set(a.re)
  h.im.set(a.im)

  const eig = hermitianEigen(h)
  const order = Array.from({ length: a.n }, (_, c) => c).sort((x, y) => (eig.values[x] ?? 0) - (eig.values[y] ?? 0))
  const vectors = operator(a.n)

  order.forEach((c, column) => {
    for (let i = 0; i < a.n; i++) {
      vectors.re[i * a.n + column] = eig.vectorsRe[i * a.n + c] ?? 0
      vectors.im[i * a.n + column] = eig.vectorsIm[i * a.n + c] ?? 0
    }
  })

  return { values: order.map(c => eig.values[c] ?? 0), vectors }
}

// the top eigenvector of a Hermitian operator
export function topEigenvector(a: Operator): { value: number; re: number[]; im: number[] } {
  const h = makeComplexMatrix({ rows: a.n, cols: a.n })

  h.re.set(a.re)
  h.im.set(a.im)

  const eig = hermitianEigen(h)
  let best = 0

  for (let c = 1; c < a.n; c++) {
    best = (eig.values[c] ?? 0) > (eig.values[best] ?? 0) ? c : best
  }

  return {
    value: eig.values[best] ?? 0,
    re: Array.from({ length: a.n }, (_, i) => eig.vectorsRe[i * a.n + best] ?? 0),
    im: Array.from({ length: a.n }, (_, i) => eig.vectorsIm[i * a.n + best] ?? 0),
  }
}

// The KCBS operator: the five unit vectors of the regular pentagram around the first basis vector of the
// frame, v_k = (cos t, sin t cos(4 pi k / 5), sin t sin(4 pi k / 5)) with cos^2 t = 1 / sqrt 5, so v_k is
// orthogonal to v_(k+1), then carried into the frame (the three columns of `frame`). Returns the five
// vectors and the sum of their projectors, whose eigenvalues are sqrt 5 on the axis and (5 - sqrt 5) / 2 twice
export function kcbsVectors(frame: Operator): { vectors: { re: number[]; im: number[] }[]; sum: Operator } {
  const cosT = Math.sqrt(1 / SQRT5)
  const sinT = Math.sqrt(1 - 1 / SQRT5)
  const vectors: { re: number[]; im: number[] }[] = []
  const sum = operator(3)

  for (let k = 0; k < 5; k++) {
    const angle = (4 * Math.PI * k) / 5
    const local = [cosT, sinT * Math.cos(angle), sinT * Math.sin(angle)]
    const re = [0, 1, 2].map(i => local.reduce((s, x, j) => s + x * (frame.re[i * 3 + j] ?? 0), 0))
    const im = [0, 1, 2].map(i => local.reduce((s, x, j) => s + x * (frame.im[i * 3 + j] ?? 0), 0))

    vectors.push({ re, im })

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        // v_i conj(v_j)
        sum.re[i * 3 + j] = (sum.re[i * 3 + j] ?? 0) + (re[i] ?? 0) * (re[j] ?? 0) + (im[i] ?? 0) * (im[j] ?? 0)
        sum.im[i * 3 + j] = (sum.im[i * 3 + j] ?? 0) + (im[i] ?? 0) * (re[j] ?? 0) - (re[i] ?? 0) * (im[j] ?? 0)
      }
    }
  }

  return { vectors, sum }
}

// the KCBS value Tr(rho K) of the pentagram whose axis is the -1 eigenvector of the phase-point operator
// A(u), in closed form from the Wigner weight: the axis probability is (1 - 3 W(u)) / 2, so
// K = (5 - sqrt 5) / 2 + (3 sqrt 5 - 5) / 2 x (1 - 3 W(u)) / 2, above 2 exactly when W(u) < -sqrt 5 / 15
export function kcbsAligned(weight: number): number {
  return (5 - SQRT5) / 2 + ((3 * SQRT5 - 5) / 2) * ((1 - 3 * weight) / 2)
}

export const KCBS_NEGATIVITY_THRESHOLD = -SQRT5 / 15

// the largest KCBS value of the regular pentagram over every orientation, for a state with eigenvalues r1 >=
// r2 >= r3: r1 sqrt 5 + (r2 + r3)(5 - sqrt 5) / 2 (von Neumann's trace inequality, attained)
export function kcbsBestOrientation(spectrum: readonly number[]): number {
  const top = Math.max(...spectrum)

  return top * SQRT5 + (1 - top) * ((5 - SQRT5) / 2)
}

// Lie algebra of the closure of a finite set of unitaries, measured. A word w of infinite order has a power
// w^k near a scalar; that power lies in the identity component of the closure of <w>, a torus, so its
// logarithm lies in the closure's Lie algebra. The algebra is then spanned by conjugating that element by
// words in the generators and taking brackets. Returns the rank reached (80 is all of su(9), 8 all of su(3))
// and the power used, or rank 0 when every candidate word has finite order.
export function closureLieRank(input: {
  generators: readonly Operator[]
  // candidate words, each a list of generator indices, tried in order for one of infinite order
  words: readonly (readonly number[])[]
  maxPower: number
  conjugationDepth: number
}): { rank: number; word: number; power: number; finiteWords: number } {
  const { generators, words, maxPower, conjugationDepth } = input
  const n = generators[0]?.n ?? 1
  const target = n * n - 1
  let logOf: Operator | undefined
  let chosenWord = -1
  let chosenPower = 0
  let finiteWords = 0

  for (let w = 0; w < words.length && !logOf; w++) {
    const word = (words[w] ?? []).reduce((acc, g) => multiplyOperators(acc, generators[g] ?? acc), identityOperator(n))
    let power = identityOperator(n)
    let finite = false

    for (let k = 1; k <= maxPower; k++) {
      power = multiplyOperators(power, word)

      const [tr, ti] = innerProduct(identityOperator(n), power)
      const size = Math.hypot(tr, ti)
      const distance = Math.sqrt(Math.max(0, 1 - size / n))

      if (distance < 1e-7) {
        finite = true
        break
      }

      if (distance < 0.02) {
        // divide out the phase of the trace, then take the logarithm near the identity
        const c = tr / size
        const s = -ti / size
        const scaled = operator(n)

        for (let i = 0; i < n * n; i++) {
          scaled.re[i] = (power.re[i] ?? 0) * c - (power.im[i] ?? 0) * s
          scaled.im[i] = (power.re[i] ?? 0) * s + (power.im[i] ?? 0) * c
        }

        const x = complexLogNearIdentity(scaled)

        logOf = { n, re: Float64Array.from(x.im), im: Float64Array.from(x.re, v => -v) }
        chosenWord = w
        chosenPower = k
        break
      }
    }

    finiteWords += finite ? 1 : 0
  }

  if (!logOf) {
    return { rank: 0, word: -1, power: 0, finiteWords }
  }

  const span = new HermitianSpan()
  const algebra: Operator[] = []
  let frontier: Operator[] = [identityOperator(n)]
  const conjugators: Operator[] = [identityOperator(n)]

  for (let depth = 0; depth < conjugationDepth; depth++) {
    const next: Operator[] = []

    for (const c of frontier) {
      for (const g of generators) {
        next.push(multiplyOperators(g, c))
      }
    }

    conjugators.push(...next)
    frontier = next
  }

  for (const c of conjugators) {
    const moved = conjugate(c, logOf)

    if (span.add(moved)) {
      algebra.push(moved)
    }

    if (span.rank >= target) {
      break
    }
  }

  for (let a = 0; a < algebra.length && span.rank < target; a++) {
    for (let b = a + 1; b < algebra.length && span.rank < target; b++) {
      const c = bracket(algebra[a]!, algebra[b]!)

      if (span.add(c)) {
        algebra.push(c)
      }
    }
  }

  return { rank: span.rank, word: chosenWord, power: chosenPower, finiteWords }
}

// i [a, b], Hermitian when a and b are
function bracket(a: Operator, b: Operator): Operator {
  const ab = multiplyOperators(a, b)
  const ba = multiplyOperators(b, a)
  const out = operator(a.n)

  for (let i = 0; i < a.n * a.n; i++) {
    out.re[i] = -((ab.im[i] ?? 0) - (ba.im[i] ?? 0))
    out.im[i] = (ab.re[i] ?? 0) - (ba.re[i] ?? 0)
  }

  return out
}

// a real span of traceless Hermitian matrices, by Gram-Schmidt with a relative floor
class HermitianSpan {
  private readonly basis: number[][] = []

  get rank(): number {
    return this.basis.length
  }

  add(a: Operator): boolean {
    const n = a.n
    let trace = 0

    for (let i = 0; i < n; i++) {
      trace += a.re[i * n + i] ?? 0
    }

    const v: number[] = []

    for (let i = 0; i < n * n; i++) {
      const diagonal = Math.floor(i / n) === i % n

      v.push((a.re[i] ?? 0) - (diagonal ? trace / n : 0), a.im[i] ?? 0)
    }

    const size = Math.sqrt(v.reduce((s, x) => s + x * x, 0))

    if (size < 1e-12) {
      return false
    }

    for (let pass = 0; pass < 2; pass++) {
      for (const b of this.basis) {
        const dot = v.reduce((s, x, i) => s + x * (b[i] ?? 0), 0)

        for (let i = 0; i < v.length; i++) {
          v[i] = (v[i] ?? 0) - dot * (b[i] ?? 0)
        }
      }
    }

    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0))

    if (norm < 1e-6 * size) {
      return false
    }

    this.basis.push(v.map(x => x / norm))

    return true
  }
}
