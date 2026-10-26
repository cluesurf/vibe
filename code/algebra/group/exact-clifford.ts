// Exact Clifford tests on mixed registers of qubits and qutrits (E-QTM-0183). A unitary G is Clifford when it maps
// every generalized Pauli operator to a phase times a Pauli operator. It is enough to test the generators X_j and Z_j
// of every factor: G is Clifford exactly when every G X_j G^dag and G Z_j G^dag has ONE nonzero Pauli coefficient.
// The number of nonzero coefficients is the Pauli spread, 1 for a Clifford image and more for anything else.
//
//   a register        the local dimensions, each 2 or 3, the first factor most significant in the index
//   a Pauli           X^a Z^b |x> = zeta_d^(b . x) |x + a>, componentwise with each factor's own d (zeta_3 = omega,
//                     zeta_2 = -1), so the Pauli group of the register is the product of the factors' groups
//   the coefficient   of X^a Z^b in M is Tr((X^a Z^b)^dag M) / D = (1 / D) sum_x zeta^(-b . x) <x + a| M |x>
//   operators         sparse, column by column, over Q(zeta_9) (code/algebra/ninth-field), so every equality is exact
//
// A second, basis-free test for a phase gate whose eigenvalue u lies in Q(omega) (ringUnitReading): Q(omega) holds only
// the six sixth roots of unity, so u is a root of unity exactly when u^6 = 1. A gate whose eigenvalues have a ratio that
// is not a root of unity has infinite order modulo phases, and the Clifford group of any number of qudits is finite
// modulo phases, so such a gate is Clifford in no dimension and no factorization. Further, a norm-one u is a root of
// x^2 - t x + 1 with t = u + conj u rational; if t has a prime other than 2 or 3 in its denominator, u is not integral
// over Z[1/6], while every eigenvalue ratio of a unitary with entries in Z[zeta_N][1/6] is (the eigenvalues are units
// integral over that ring), so no circuit of qubit or qutrit Clifford and T gates, on any number of ancillas, equals
// the gate exactly, even up to a global phase.
//
// Theorems used, cited: Gottesman (1998) and Hostens, Dehaene and De Moor (2005) for the qudit Clifford group mod
// phases (Z_d^(2n) semidirect Sp(2n, d), finite); the roots of unity of Q(omega).
//
// DETERMINISM: no random numbers. EXACT: no floating point anywhere.

import {
  add,
  conj,
  isZero,
  mul,
  neg,
  ninth,
  ONE,
  ZERO,
  zetaPower,
  type Ninth,
  type NinthMatrix,
} from '@/code/algebra/ninth-field'

export type Register = readonly number[]

// column j holds the nonzero entries of column j, row -> value
export type SparseOperator = {
  readonly size: number
  readonly columns: readonly Map<number, Ninth>[]
}

export const registerSize = (register: Register): number =>
  register.reduce((p, d) => p * d, 1)

// the digits of an index, first factor first
export function digitsOf(input: {
  register: Register
  index: number
}): number[] {
  const { register } = input
  const out = new Array<number>(register.length)
  let x = input.index

  for (let k = register.length - 1; k >= 0; k--) {
    out[k] = x % register[k]!
    x = Math.floor(x / register[k]!)
  }

  return out
}

export function indexOf(input: {
  register: Register
  digits: readonly number[]
}): number {
  return input.register.reduce(
    (x, d, k) => x * d + (input.digits[k] ?? 0),
    0,
  )
}

function addEntry(column: Map<number, Ninth>, row: number, v: Ninth): void {
  const s = add(column.get(row) ?? ZERO, v)

  if (isZero(s)) {
    column.delete(row)
  } else {
    column.set(row, s)
  }
}

// an operator from a rule for its columns: column j is the image of basis state j, as (row, value) pairs
export function sparseFromColumns(input: {
  size: number
  column: (j: number) => readonly (readonly [number, Ninth])[]
}): SparseOperator {
  const columns: Map<number, Ninth>[] = []

  for (let j = 0; j < input.size; j++) {
    const c = new Map<number, Ninth>()

    for (const [row, v] of input.column(j)) {
      addEntry(c, row, v)
    }

    columns.push(c)
  }

  return { size: input.size, columns }
}

export function sparseFromDense(m: NinthMatrix): SparseOperator {
  return sparseFromColumns({
    size: m.length,
    column: j =>
      m
        .map((row, r) => [r, row[j]!] as const)
        .filter(([, v]) => !isZero(v)),
  })
}

// a permutation of the basis, j -> perm[j]
export function sparsePermutation(perm: readonly number[]): SparseOperator {
  return sparseFromColumns({
    size: perm.length,
    column: j => [[perm[j]!, ONE]],
  })
}

// a diagonal operator
export function sparseDiagonal(values: readonly Ninth[]): SparseOperator {
  return sparseFromColumns({
    size: values.length,
    column: j => [[j, values[j]!]],
  })
}

// a b: column j of the product is a applied to column j of b
export function sparseMultiply(
  a: SparseOperator,
  b: SparseOperator,
): SparseOperator {
  const columns = b.columns.map(bc => {
    const out = new Map<number, Ninth>()

    for (const [k, bv] of bc) {
      for (const [r, av] of a.columns[k]!) {
        addEntry(out, r, mul(av, bv))
      }
    }

    return out
  })

  return { size: b.size, columns }
}

export function sparseDagger(a: SparseOperator): SparseOperator {
  const columns = Array.from(
    { length: a.size },
    () => new Map<number, Ninth>(),
  )

  a.columns.forEach((c, j) => {
    for (const [r, v] of c) {
      columns[r]!.set(j, conj(v))
    }
  })

  return { size: a.size, columns }
}

// a^dag a = 1 exactly
export function sparseIsUnitary(a: SparseOperator): boolean {
  const p = sparseMultiply(sparseDagger(a), a)

  return p.columns.every(
    (c, j) =>
      c.size === 1 &&
      c.has(j) &&
      isZero(add(c.get(j)!, neg(ONE))),
  )
}

// a (x) b, the first factor most significant
export function sparseKron(
  a: SparseOperator,
  b: SparseOperator,
): SparseOperator {
  return sparseFromColumns({
    size: a.size * b.size,
    column: j => {
      const ja = Math.floor(j / b.size)
      const jb = j % b.size
      const out: [number, Ninth][] = []

      for (const [ra, va] of a.columns[ja]!) {
        for (const [rb, vb] of b.columns[jb]!) {
          out.push([ra * b.size + rb, mul(va, vb)])
        }
      }

      return out
    },
  })
}

// the phase (-1)^s omega^e as a field element, s mod 2 and e mod 3
const PHASES: readonly Ninth[] = [0, 1].flatMap(s =>
  [0, 1, 2].map(e => (s ? neg(zetaPower(3 * e)) : zetaPower(3 * e))),
)

const phase = (s: number, e: number): Ninth =>
  PHASES[3 * (((s % 2) + 2) % 2) + (((e % 3) + 3) % 3)]!

// the Pauli X^a Z^b on the register, a and b digit vectors
export function pauliOperator(input: {
  register: Register
  a: readonly number[]
  b: readonly number[]
}): SparseOperator {
  const { register, a, b } = input

  return sparseFromColumns({
    size: registerSize(register),
    column: j => {
      const x = digitsOf({ register, index: j })
      let s = 0
      let e = 0

      x.forEach((xk, k) => {
        if (register[k] === 2) {
          s += b[k]! * xk
        } else {
          e += b[k]! * xk
        }
      })

      const y = x.map((xk, k) => (xk + a[k]!) % register[k]!)

      return [[indexOf({ register, digits: y }), phase(s, e)]]
    },
  })
}

// X_k and Z_k for every factor k, named
export function pauliGenerators(
  register: Register,
): { name: string; operator: SparseOperator }[] {
  const zeros = register.map(() => 0)

  return register.flatMap((_, k) => {
    const unit = zeros.map((_, i) => (i === k ? 1 : 0))

    return [
      {
        name: `X${k}`,
        operator: pauliOperator({ register, a: unit, b: zeros }),
      },
      {
        name: `Z${k}`,
        operator: pauliOperator({ register, a: zeros, b: unit }),
      },
    ]
  })
}

// the number of nonzero Pauli coefficients of m: 1 exactly when m is a phase times one Pauli
export function pauliSpread(input: {
  register: Register
  operator: SparseOperator
}): number {
  const { register, operator } = input
  const size = registerSize(register)

  // the entries <x + a| m |x>, grouped by the shift a
  const bands = new Map<number, [number[], Ninth][]>()

  operator.columns.forEach((c, j) => {
    const x = digitsOf({ register, index: j })

    for (const [r, v] of c) {
      const y = digitsOf({ register, index: r })
      const a = indexOf({
        register,
        digits: y.map((yk, k) => (yk - x[k]! + register[k]!) % register[k]!),
      })
      const list = bands.get(a) ?? []

      list.push([x, v])
      bands.set(a, list)
    }
  })

  let spread = 0

  for (const list of bands.values()) {
    for (let bi = 0; bi < size; bi++) {
      const b = digitsOf({ register, index: bi })
      let sum = ZERO

      for (const [x, v] of list) {
        let s = 0
        let e = 0

        x.forEach((xk, k) => {
          if (register[k] === 2) {
            s -= b[k]! * xk
          } else {
            e -= b[k]! * xk
          }
        })

        sum = add(sum, mul(v, phase(s, e)))
      }

      if (!isZero(sum)) {
        spread++
      }
    }
  }

  return spread
}

export type CliffordReading = {
  // G^dag G = 1 exactly
  unitary: boolean
  // the Pauli spread of G P G^dag for each generator P, in the order of pauliGenerators
  spreads: number[]
  names: string[]
  // every spread is 1
  clifford: boolean
  // the largest spread
  largest: number
}

export function cliffordReading(input: {
  register: Register
  gate: SparseOperator
}): CliffordReading {
  const { register, gate } = input

  if (gate.size !== registerSize(register)) {
    throw new Error(
      `exact-clifford: a gate of size ${gate.size} on a register of size ${registerSize(register)}`,
    )
  }

  const back = sparseDagger(gate)
  const generators = pauliGenerators(register)
  const spreads = generators.map(g =>
    pauliSpread({
      register,
      operator: sparseMultiply(gate, sparseMultiply(g.operator, back)),
    }),
  )

  return {
    unitary: sparseIsUnitary(gate),
    spreads,
    names: generators.map(g => g.name),
    clifford: spreads.every(s => s === 1),
    largest: Math.max(...spreads),
  }
}

// ---- the basis-free test of a phase in Q(omega) ----

// a + b omega over d, the shape of code/measure/rule-gates Qw and code/rule/swap-mixer RingUnit
export type EisensteinFraction = {
  readonly a: bigint
  readonly b: bigint
  readonly d: bigint
}

export type RingUnitReading = {
  // |u|^2 = 1 exactly
  normOne: boolean
  // u^6 = 1, which in Q(omega) is the same as being a root of unity
  rootOfUnity: boolean
  // t = u + conj u = (2 a - b) / d as a reduced fraction
  traceNumerator: bigint
  traceDenominator: bigint
  // the trace's denominator with every factor 2 and 3 removed: 1 exactly when u is integral over Z[1/6]
  residualDenominator: bigint
}

const gcdBig = (x: bigint, y: bigint): bigint => {
  let p = x < 0n ? -x : x
  let q = y < 0n ? -y : y

  while (q !== 0n) {
    ;[p, q] = [q, p % q]
  }

  return p
}

// (a + b w)(c + e w) with w^2 = -1 - w, numerators only
const eisMul = (
  p: readonly [bigint, bigint],
  q: readonly [bigint, bigint],
): [bigint, bigint] => [
  p[0] * q[0] - p[1] * q[1],
  p[0] * q[1] + p[1] * q[0] - p[1] * q[1],
]

export function ringUnitReading(u: EisensteinFraction): RingUnitReading {
  const normNumerator = u.a * u.a - u.a * u.b + u.b * u.b
  let power: [bigint, bigint] = [1n, 0n]

  for (let k = 0; k < 6; k++) {
    power = eisMul(power, [u.a, u.b])
  }

  const d6 = u.d ** 6n
  const t = 2n * u.a - u.b
  const g = gcdBig(t, u.d)
  const traceNumerator = t / g
  const traceDenominator = u.d / g
  let residualDenominator = traceDenominator < 0n ? -traceDenominator : traceDenominator

  while (residualDenominator % 2n === 0n) {
    residualDenominator /= 2n
  }

  while (residualDenominator % 3n === 0n) {
    residualDenominator /= 3n
  }

  return {
    normOne: normNumerator === u.d * u.d,
    rootOfUnity: power[0] === d6 && power[1] === 0n,
    traceNumerator,
    traceDenominator,
    residualDenominator,
  }
}

// a + b omega over d as a number of Q(zeta_9), omega = zeta^3
export const ninthFromEisenstein = (u: EisensteinFraction): Ninth =>
  ninth([u.a, 0n, 0n, u.b], u.d)

// ---- standard gates, the controls of a Clifford test ----

const omegaTo = (k: number): Ninth => zetaPower(3 * k)

// on one qutrit: X|j> = |j + 1>, Z = diag(1, w, w^2), the phase gate diag(1, 1, w), the T gate of Howard and Vala
// (2012) diag(1, zeta_9, zeta_9^-1), which is not Clifford
export const QUTRIT_SHIFT = sparsePermutation([1, 2, 0])
export const QUTRIT_CLOCK = sparseDiagonal([0, 1, 2].map(omegaTo))
export const QUTRIT_PHASE = sparseDiagonal([ONE, ONE, omegaTo(1)])
export const QUTRIT_T = sparseDiagonal([ONE, zetaPower(1), zetaPower(-1)])

// on two qutrits: SUM |a, b> = |a, a + b>, SWAP
export const QUTRIT_SUM = sparsePermutation(
  Array.from({ length: 9 }, (_, j) => {
    const a = Math.floor(j / 3)

    return 3 * a + ((j + a) % 3)
  }),
)
export const QUTRIT_SWAP = sparsePermutation(
  Array.from({ length: 9 }, (_, j) => 3 * (j % 3) + Math.floor(j / 3)),
)

// on three qutrits: CCZ |a, b, c> = w^(abc) |a, b, c>, cubic over F3 and so not Clifford
export const QUTRIT_CCZ = sparseDiagonal(
  Array.from({ length: 27 }, (_, j) =>
    omegaTo(Math.floor(j / 9) * (Math.floor(j / 3) % 3) * (j % 3)),
  ),
)

// on qubits: X, Z, CNOT (first controls), CZ
export const QUBIT_X = sparsePermutation([1, 0])
export const QUBIT_Z = sparseDiagonal([ONE, neg(ONE)])
export const QUBIT_CNOT = sparsePermutation([0, 1, 3, 2])
export const QUBIT_CZ = sparseDiagonal([ONE, ONE, ONE, neg(ONE)])
