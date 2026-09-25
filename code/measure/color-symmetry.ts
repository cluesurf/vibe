// What a color triplet asks of a local rule, measured on small tensor products of d-state slots.
// A slot carries the fundamental of U(d) (plain) or its conjugate. A group element g acts on a block
// of slots as g or g* on each, so an algebra element X acts as the sum over slots of X (plain) or
// -X^T (conjugate, the complex-linear form of X* for anti-Hermitian X). Everything here is exact
// linear algebra on at most a few hundred states, with no random numbers.
//
// Slot 0 is the least significant digit of a basis index: state = s_0 + d s_1 + d^2 s_2 + ...

import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { jacobiEigenvalues } from '@/code/algebra/linear/eig-jacobi'

export type SlotKind = 'plain' | 'conjugate'

export type Operator = {
  readonly size: number
  readonly re: Float64Array
  readonly im: Float64Array
}

export function makeOperator(input: { size: number }): Operator {
  const cells = input.size * input.size

  return {
    size: input.size,
    re: new Float64Array(cells),
    im: new Float64Array(cells),
  }
}

export function identityOperator(input: { size: number }): Operator {
  const out = makeOperator(input)

  for (let i = 0; i < input.size; i++) {
    out.re[i * input.size + i] = 1
  }

  return out
}

// The permutation matrix sending basis state s to map[s].
export function permutationOperator(input: {
  map: readonly number[]
}): Operator {
  const out = makeOperator({ size: input.map.length })

  input.map.forEach((image, s) => {
    out.re[image * input.map.length + s] = 1
  })

  return out
}

export function multiplyOperators(a: Operator, b: Operator): Operator {
  const n = a.size
  const out = makeOperator({ size: n })

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = a.re[i * n + k] ?? 0
      const ai = a.im[i * n + k] ?? 0

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        const br = b.re[k * n + j] ?? 0
        const bi = b.im[k * n + j] ?? 0

        out.re[i * n + j] = (out.re[i * n + j] ?? 0) + ar * br - ai * bi
        out.im[i * n + j] = (out.im[i * n + j] ?? 0) + ar * bi + ai * br
      }
    }
  }

  return out
}

// The tensor product with a on slot 0 (the less significant digit) and b on slot 1.
export function kroneckerOperator(a: Operator, b: Operator): Operator {
  const size = a.size * b.size
  const out = makeOperator({ size })

  for (let r0 = 0; r0 < a.size; r0++) {
    for (let c0 = 0; c0 < a.size; c0++) {
      const ar = a.re[r0 * a.size + c0] ?? 0
      const ai = a.im[r0 * a.size + c0] ?? 0

      for (let r1 = 0; r1 < b.size; r1++) {
        for (let c1 = 0; c1 < b.size; c1++) {
          const br = b.re[r1 * b.size + c1] ?? 0
          const bi = b.im[r1 * b.size + c1] ?? 0
          const cell = (r0 + a.size * r1) * size + (c0 + a.size * c1)

          out.re[cell] = ar * br - ai * bi
          out.im[cell] = ar * bi + ai * br
        }
      }
    }
  }

  return out
}

// A complex linear combination sum_t (re_t + i im_t) operator_t.
export function combineOperators(
  terms: readonly { operator: Operator; re: number; im?: number }[],
): Operator {
  const size = terms[0]?.operator.size ?? 0
  const out = makeOperator({ size })

  for (const { operator, re, im = 0 } of terms) {
    for (let c = 0; c < size * size; c++) {
      const xr = operator.re[c] ?? 0
      const xi = operator.im[c] ?? 0

      out.re[c] = (out.re[c] ?? 0) + re * xr - im * xi
      out.im[c] = (out.im[c] ?? 0) + re * xi + im * xr
    }
  }

  return out
}

// The Frobenius norm of a - b.
export function operatorDistance(a: Operator, b: Operator): number {
  let sum = 0

  for (let c = 0; c < a.size * a.size; c++) {
    sum +=
      ((a.re[c] ?? 0) - (b.re[c] ?? 0)) ** 2 +
      ((a.im[c] ?? 0) - (b.im[c] ?? 0)) ** 2
  }

  return Math.sqrt(sum)
}

// The permutation a matrix is, when every column holds one entry equal to 1 and the rest 0.
export function asPermutation(input: {
  operator: Operator
  tolerance?: number
}): number[] | undefined {
  const { operator, tolerance = 1e-9 } = input
  const n = operator.size
  const map: number[] = []

  for (let s = 0; s < n; s++) {
    let image = -1

    for (let r = 0; r < n; r++) {
      const re = operator.re[r * n + s] ?? 0
      const im = operator.im[r * n + s] ?? 0

      if (Math.abs(re - 1) < tolerance && Math.abs(im) < tolerance) {
        if (image >= 0) {
          return undefined
        }

        image = r
      } else if (Math.abs(re) > tolerance || Math.abs(im) > tolerance) {
        return undefined
      }
    }

    if (image < 0) {
      return undefined
    }

    map.push(image)
  }

  return new Set(map).size === n ? map : undefined
}

// A real basis of u(d), anti-Hermitian: i E_jj, then E_jk - E_kj and i (E_jk + E_kj) for j < k.
// With special, the traceless su(d) instead: the diagonal ones become i (E_jj - E_{j+1,j+1}).
export function unitaryAlgebra(input: {
  d: number
  special?: boolean
}): Operator[] {
  const { d, special = false } = input
  const basis: Operator[] = []
  const at = (i: number, j: number): number => i * d + j

  for (let j = 0; j < (special ? d - 1 : d); j++) {
    const x = makeOperator({ size: d })

    x.im[at(j, j)] = 1

    if (special) {
      x.im[at(j + 1, j + 1)] = -1
    }

    basis.push(x)
  }

  for (let j = 0; j < d; j++) {
    for (let k = j + 1; k < d; k++) {
      const antisymmetric = makeOperator({ size: d })
      const symmetric = makeOperator({ size: d })

      antisymmetric.re[at(j, k)] = 1
      antisymmetric.re[at(k, j)] = -1
      symmetric.im[at(j, k)] = 1
      symmetric.im[at(k, j)] = 1
      basis.push(antisymmetric, symmetric)
    }
  }

  return basis
}

// X acting on a block of slots: the sum over slots of X or -X^T on that slot.
export function liftGenerator(input: {
  generator: Operator
  d: number
  slots: readonly SlotKind[]
}): Operator {
  const { generator, d, slots } = input
  const size = d ** slots.length
  const out = makeOperator({ size })

  for (let col = 0; col < size; col++) {
    slots.forEach((kind, slot) => {
      const place = d ** slot
      const digit = Math.floor(col / place) % d

      for (let image = 0; image < d; image++) {
        // plain: <image|X|digit>. conjugate: <image|-X^T|digit> = -<digit|X|image>.
        const cell =
          kind === 'plain' ? image * d + digit : digit * d + image
        const sign = kind === 'plain' ? 1 : -1
        const re = sign * (generator.re[cell] ?? 0)
        const im = sign * (generator.im[cell] ?? 0)

        if (re === 0 && im === 0) {
          continue
        }

        const row = col + (image - digit) * place

        out.re[row * size + col] = (out.re[row * size + col] ?? 0) + re
        out.im[row * size + col] = (out.im[row * size + col] ?? 0) + im
      }
    })
  }

  return out
}

// The dimension of the subalgebra of span(basis) whose lift commutes with operator, over R: the null
// space of the Gram matrix of the commutators [operator, lift(X_a)].
// A lift other than the slot sum can be passed, such as one acting on a single tensor factor.
export function symmetryDimension(input: {
  operator: Operator
  d: number
  slots: readonly SlotKind[]
  basis?: readonly Operator[]
  lift?: (generator: Operator) => Operator
  tolerance?: number
}): number {
  const { operator, d, slots, tolerance = 1e-9 } = input
  const basis = input.basis ?? unitaryAlgebra({ d })
  const commutators = basis.map(generator => {
    const lifted =
      input.lift?.(generator) ?? liftGenerator({ generator, d, slots })

    return combineOperators([
      { operator: multiplyOperators(operator, lifted), re: 1 },
      { operator: multiplyOperators(lifted, operator), re: -1 },
    ])
  })
  const gram = commutators.map(a =>
    commutators.map(b => {
      let sum = 0

      for (let c = 0; c < a.size * a.size; c++) {
        sum +=
          (a.re[c] ?? 0) * (b.re[c] ?? 0) +
          (a.im[c] ?? 0) * (b.im[c] ?? 0)
      }

      return sum
    }),
  )

  return jacobiEigenvalues(gram, 200, 1e-24).filter(
    value => Math.abs(value) < tolerance,
  ).length
}

// The lifted E_jk (j != k), or E_jj when diagonal, as integer matrices: the complexified algebra, so
// a permutation commutes with every real generator exactly when it commutes with these.
function liftedUnits(input: {
  d: number
  slots: readonly SlotKind[]
  diagonal: boolean
}): Int8Array[] {
  const { d, slots, diagonal } = input
  const units: Int8Array[] = []

  for (let j = 0; j < d; j++) {
    for (let k = 0; k < d; k++) {
      if ((j === k) !== diagonal) {
        continue
      }

      const unit = makeOperator({ size: d })

      unit.re[j * d + k] = 1

      const lifted = liftGenerator({ generator: unit, d, slots })

      units.push(Int8Array.from(lifted.re, x => Math.round(x)))
    }
  }

  return units
}

// Every permutation of the d^k basis states that commutes with the lifted algebra, found by an
// exhaustive depth-first search that abandons a partial assignment only once it already violates
// P G P^T = G on the states assigned so far. With diagonal, only the Cartan (weight) generators are
// imposed, which is the symmetry a clock phase alone would ask for.
export function colorPermutations(input: {
  d: number
  slots: readonly SlotKind[]
  diagonal?: boolean
  limit?: number
}): number[][] {
  const {
    d,
    slots,
    diagonal = false,
    limit = Number.POSITIVE_INFINITY,
  } = input
  const size = d ** slots.length
  const units = liftedUnits({ d, slots, diagonal })
  const map = new Array<number>(size).fill(-1)
  const used = new Uint8Array(size)
  const found: number[][] = []

  const consistent = (s: number): boolean => {
    const image = map[s] ?? 0

    for (let t = 0; t <= s; t++) {
      const other = map[t] ?? 0

      for (const unit of units) {
        if (unit[image * size + other] !== unit[s * size + t]) {
          return false
        }

        if (unit[other * size + image] !== unit[t * size + s]) {
          return false
        }
      }
    }

    return true
  }

  const search = (s: number): void => {
    if (found.length >= limit) {
      return
    }

    if (s === size) {
      found.push(map.slice())

      return
    }

    for (let image = 0; image < size; image++) {
      if (used[image]) {
        continue
      }

      map[s] = image
      used[image] = 1

      if (consistent(s)) {
        search(s + 1)
      }

      used[image] = 0
    }

    map[s] = -1
  }

  search(0)

  return found
}

// The same count by brute force over all (d^k)! permutations (Heap's algorithm), for small blocks.
export function bruteForceColorPermutations(input: {
  d: number
  slots: readonly SlotKind[]
}): number {
  const { d, slots } = input
  const size = d ** slots.length
  const units = liftedUnits({ d, slots, diagonal: false })
  const map = Array.from({ length: size }, (_, s) => s)
  const counters = new Array<number>(size).fill(0)

  const commutes = (): boolean =>
    units.every(unit => {
      for (let a = 0; a < size; a++) {
        for (let b = 0; b < size; b++) {
          if (
            unit[(map[a] ?? 0) * size + (map[b] ?? 0)] !==
            unit[a * size + b]
          ) {
            return false
          }
        }
      }

      return true
    })

  let count = commutes() ? 1 : 0
  let i = 1

  while (i < size) {
    if ((counters[i] ?? 0) < i) {
      const j = i % 2 === 0 ? 0 : (counters[i] ?? 0)
      const held = map[j] ?? 0

      map[j] = map[i] ?? 0
      map[i] = held

      if (commutes()) {
        count++
      }

      counters[i] = (counters[i] ?? 0) + 1
      i = 1
    } else {
      counters[i] = 0
      i++
    }
  }

  return count
}

// The permutation of basis states that exchanges two slots.
export function slotSwapMap(input: {
  d: number
  k: number
  i: number
  j: number
}): number[] {
  const { d, k, i, j } = input

  return Array.from({ length: d ** k }, (_, state) => {
    const digits = Array.from(
      { length: k },
      (_, slot) => Math.floor(state / d ** slot) % d,
    )
    const held = digits[i] ?? 0

    digits[i] = digits[j] ?? 0
    digits[j] = held

    return digits.reduce(
      (sum, digit, slot) => sum + digit * d ** slot,
      0,
    )
  })
}

// The color-symmetric two-slot unitaries, up to an overall phase. For two plain slots the commutant
// is spanned by the identity and the swap S, so U = P_sym + e^{i phase} P_anti. For a plain and a
// conjugate slot it is spanned by the identity and J = sum_{a,b} |a a><b b|, the singlet being J / d,
// so U = (1 - J / d) + e^{i phase} J / d.
export function pairExchangeUnitary(input: {
  d: number
  kind: SlotKind
  phase: number
}): Operator {
  const { d, kind, phase } = input
  const size = d * d
  const identity = identityOperator({ size })
  const c = Math.cos(phase)
  const s = Math.sin(phase)

  if (kind === 'plain') {
    const swap = permutationOperator({
      map: slotSwapMap({ d, k: 2, i: 0, j: 1 }),
    })

    return combineOperators([
      { operator: identity, re: (1 + c) / 2, im: s / 2 },
      { operator: swap, re: (1 - c) / 2, im: -s / 2 },
    ])
  }

  const singlet = makeOperator({ size })

  for (let a = 0; a < d; a++) {
    for (let b = 0; b < d; b++) {
      singlet.re[(a + d * a) * size + (b + d * b)] = 1 / d
    }
  }

  return combineOperators([
    { operator: identity, re: 1 },
    { operator: singlet, re: c - 1, im: s },
  ])
}

// The operator linear entropy of a two-slot operator across the slot cut: U read as a vector in
// (in 0, out 0) x (in 1, out 1), normalized, and E = 1 - Tr rho^2 of its first half.
function operatorEntropy(input: {
  operator: Operator
  d: number
}): number {
  const { operator, d } = input
  const size = d * d
  const dim = d * d
  // M[(a, c)][(b, e)] = U[a + d b][c + d e] / d
  const mRe = new Float64Array(dim * dim)
  const mIm = new Float64Array(dim * dim)

  for (let a = 0; a < d; a++) {
    for (let b = 0; b < d; b++) {
      for (let c = 0; c < d; c++) {
        for (let e = 0; e < d; e++) {
          const cell = (a + d * b) * size + (c + d * e)
          const index = (a + d * c) * dim + (b + d * e)

          mRe[index] = (operator.re[cell] ?? 0) / d
          mIm[index] = (operator.im[cell] ?? 0) / d
        }
      }
    }
  }

  // rho = M M^dagger, purity = Tr rho^2 = sum |rho_ij|^2
  let purity = 0

  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < dim; k++) {
        const ar = mRe[i * dim + k] ?? 0
        const ai = mIm[i * dim + k] ?? 0
        const br = mRe[j * dim + k] ?? 0
        const bi = -(mIm[j * dim + k] ?? 0)

        re += ar * br - ai * bi
        im += ar * bi + ai * br
      }

      purity += re * re + im * im
    }
  }

  return 1 - purity
}

// Zanardi's entangling power of a two-slot unitary, the mean linear entropy it makes from product
// states: e_p = (d / (d + 1))^2 (E(U) + E(U S) - E(S)). Zero for every product of local unitaries and
// for the swap, 2 / 9 at most for qubits (CNOT), 1 / 6 for the square root of the qubit swap.
export function entanglingPower(input: {
  operator: Operator
  d: number
}): number {
  const { operator, d } = input
  const swap = permutationOperator({
    map: slotSwapMap({ d, k: 2, i: 0, j: 1 }),
  })
  const scale = (d / (d + 1)) ** 2

  return (
    scale *
    (operatorEntropy({ operator, d }) +
      operatorEntropy({
        operator: multiplyOperators(operator, swap),
        d,
      }) -
      operatorEntropy({ operator: swap, d }))
  )
}

// The number of independent color singlets in a block: states every su(d) generator annihilates, as
// the zero eigenvalues of the Casimir-like sum over the basis of lift(X)^dagger lift(X).
export function singletCount(input: {
  d: number
  slots: readonly SlotKind[]
  tolerance?: number
}): number {
  const { d, slots, tolerance = 1e-8 } = input
  const lifts = unitaryAlgebra({ d, special: true }).map(generator =>
    liftGenerator({ generator, d, slots }),
  )
  const size = d ** slots.length
  const terms = lifts.map(lifted => {
    const adjoint = makeOperator({ size })

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        adjoint.re[c * size + r] = lifted.re[r * size + c] ?? 0
        adjoint.im[c * size + r] = -(lifted.im[r * size + c] ?? 0)
      }
    }

    return { operator: multiplyOperators(adjoint, lifted), re: 1 }
  })
  const casimir = combineOperators(terms)
  const matrix = makeComplexMatrix({ rows: size, cols: size })

  matrix.re.set(casimir.re)
  matrix.im.set(casimir.im)

  return Array.from(eigHermitian({ matrix }).values).filter(
    value => Math.abs(value) < tolerance,
  ).length
}

// The largest norm any su(d) generator leaves on a state: zero exactly for a singlet.
export function singletResidual(input: {
  d: number
  slots: readonly SlotKind[]
  re: Float64Array
  im: Float64Array
}): number {
  const { d, slots, re, im } = input
  const size = d ** slots.length

  let worst = 0

  for (const generator of unitaryAlgebra({ d, special: true })) {
    const lifted = liftGenerator({ generator, d, slots })

    let norm = 0

    for (let r = 0; r < size; r++) {
      let xr = 0
      let xi = 0

      for (let c = 0; c < size; c++) {
        const ar = lifted.re[r * size + c] ?? 0
        const ai = lifted.im[r * size + c] ?? 0

        xr += ar * (re[c] ?? 0) - ai * (im[c] ?? 0)
        xi += ar * (im[c] ?? 0) + ai * (re[c] ?? 0)
      }

      norm += xr * xr + xi * xi
    }

    worst = Math.max(worst, Math.sqrt(norm))
  }

  return worst
}

// The totally antisymmetric epsilon state of three d = 3 slots, the baryon's color wave function.
export function epsilonState(): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(27)
  const orders: [number, number, number, number][] = [
    [0, 1, 2, 1],
    [1, 2, 0, 1],
    [2, 0, 1, 1],
    [0, 2, 1, -1],
    [2, 1, 0, -1],
    [1, 0, 2, -1],
  ]

  for (const [a, b, c, sign] of orders) {
    re[a + 3 * b + 9 * c] = sign / Math.sqrt(6)
  }

  return { re, im: new Float64Array(27) }
}
