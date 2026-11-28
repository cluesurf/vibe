// The Z3-linear reversible pair rules (milestone M2-A, algebra Z3 cyclic):
// the tones of a matched edge read as residues mod 3 (0, +1, -1 stand for 0, 1, 2), and the pair map
//
//   (x, y) -> (a x + b y, c x + d y)   (mod 3)
//
// for an invertible 2 x 2 matrix [a b; c d] over Z3. These are the elements of GL(2,3), 48 of them. Exact integer
// arithmetic mod 3, no floating point, no random numbers.
//
// The same nine pairs and the same table layout as the spin-one rules (code/rule/pair-rule.ts: rule[p] is the image of
// pair p = (a + 1) * 3 + (b + 1)), so a Z3-linear rule runs on the same schedules, harness and measures. What changes is
// the algebra: a spin-one rule conserves the integer charge Q = a + b, a Z3-linear rule is additive mod 3. Only the
// identity and the swap are both.
//
// Structure, each fact gated live by the experiment:
//   - negation C is -I, central in GL(2,3), so every Z3-linear rule commutes with C: the class group {1, P, C, PC}
//     acts through P alone, and the 48 rules fall into (48 + 4) / 2 = 26 classes (4 matrices [a b; b a] commute with P)
//   - every rule fixes the vacuum pair (0, 0); it fixes all three uniform pairs (b, b) exactly when (1, 1) is an
//     eigenvector of eigenvalue 1, the row sums a + b = c + d = 1 (6 rules, the stabilizer of a vector)
//   - the sum mod 3 of a configuration is conserved exactly when (1, 1) M = (1, 1), the column sums a + c = b + d = 1
//     (6 rules, the stabilizer of a covector); the two sets of 6 share only the identity and the swap
//   - the excitation D = number of nonzero tones is conserved exactly by the 8 monomial matrices (one nonzero per row)
//   - the inverse rule is the table of the inverse matrix, det^-1 times the adjugate, det^-1 = det in Z3

import {
  PAIR_COUNT,
  PairTable,
  isBijection,
  pairIndex,
  pairTones,
  tableKey,
} from '@/code/rule/pair-rule'
import { fromZ3, toZ3 } from '@/code/tone/algebra'

// [a, b, c, d], each a residue 0, 1 or 2: (x, y) -> (a x + b y, c x + d y) mod 3
export type Z3Matrix = readonly [number, number, number, number]

export type Z3LinearRule = {
  matrix: Z3Matrix
  table: PairTable
  name: string
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3

export const Z3_IDENTITY: Z3Matrix = [1, 0, 0, 1]
export const Z3_SWAP: Z3Matrix = [0, 1, 1, 0]

export function z3Det(m: Z3Matrix): number {
  return mod3(m[0] * m[3] - m[1] * m[2])
}

// m n: apply n, then m
export function z3Multiply(m: Z3Matrix, n: Z3Matrix): Z3Matrix {
  return [
    mod3(m[0] * n[0] + m[1] * n[2]),
    mod3(m[0] * n[1] + m[1] * n[3]),
    mod3(m[2] * n[0] + m[3] * n[2]),
    mod3(m[2] * n[1] + m[3] * n[3]),
  ]
}

// det^-1 adj(m); the inverse of 1 is 1 and of 2 is 2 in Z3
export function z3Inverse(m: Z3Matrix): Z3Matrix {
  const det = z3Det(m)

  if (det === 0) {
    throw new Error(`z3-linear-pair: [${m.join(' ')}] is singular`)
  }

  return [
    mod3(det * m[3]),
    mod3(-det * m[1]),
    mod3(-det * m[2]),
    mod3(det * m[0]),
  ]
}

export function z3MatrixName(m: Z3Matrix): string {
  return `z3.${m[0]}${m[1]}${m[2]}${m[3]}`
}

// the pair table of a matrix (a bijection exactly when det != 0)
export function z3MatrixTable(m: Z3Matrix): PairTable {
  const table = new Int8Array(PAIR_COUNT)

  for (let p = 0; p < PAIR_COUNT; p++) {
    const [s, t] = pairTones(p)
    const x = toZ3(s)
    const y = toZ3(t)

    table[p] = pairIndex(fromZ3(m[0] * x + m[1] * y), fromZ3(m[2] * x + m[3] * y))
  }

  return table
}

export function z3LinearRule(m: Z3Matrix): Z3LinearRule {
  return { matrix: m, table: z3MatrixTable(m), name: z3MatrixName(m) }
}

// the pair index of the residue-wise sum of two pairs
export function z3PairAdd(p: number, q: number): number {
  const [a, b] = pairTones(p)
  const [c, d] = pairTones(q)

  return pairIndex(fromZ3(toZ3(a) + toZ3(c)), fromZ3(toZ3(b) + toZ3(d)))
}

// table[p + q] = table[p] + table[q] for every two pairs (mod 3, residue-wise); with the vacuum fixed this is
// linearity over Z3, since scalar multiples are repeated sums
export function isZ3Additive(table: PairTable): boolean {
  for (let p = 0; p < PAIR_COUNT; p++) {
    for (let q = 0; q < PAIR_COUNT; q++) {
      if (table[z3PairAdd(p, q)] !== z3PairAdd(table[p]!, table[q]!)) {
        return false
      }
    }
  }

  return true
}

// the matrix of an additive table, read off the images of (1, 0) and (0, 1)
export function z3MatrixOfTable(table: PairTable): Z3Matrix {
  const [a, c] = pairTones(table[pairIndex(1, 0)]!)
  const [b, d] = pairTones(table[pairIndex(0, 1)]!)

  return [toZ3(a), toZ3(b), toZ3(c), toZ3(d)]
}

// all three uniform pairs (b, b) fixed: row sums 1
export function z3FixesUniform(m: Z3Matrix): boolean {
  return mod3(m[0] + m[1]) === 1 && mod3(m[2] + m[3]) === 1
}

// the configuration sum mod 3 conserved: column sums 1
export function z3ConservesSum(m: Z3Matrix): boolean {
  return mod3(m[0] + m[2]) === 1 && mod3(m[1] + m[3]) === 1
}

// one nonzero entry per row and column: the excitation count is conserved
export function z3IsMonomial(m: Z3Matrix): boolean {
  return (m[1] === 0 && m[2] === 0) || (m[0] === 0 && m[3] === 0)
}

// commutes with the swap P = [0 1; 1 0]: [a b; b a]
export function z3CommutesWithSwap(m: Z3Matrix): boolean {
  return m[0] === m[3] && m[1] === m[2]
}

// Brute force, assuming nothing about matrices: every permutation of the nine pairs (Heap's algorithm), keeping the
// additive ones; and every one of the 81 matrices, keeping those with det != 0. The experiment checks the two agree.
export function z3LinearCensus(): {
  permutationsChecked: number
  additive: Z3LinearRule[]
  matricesChecked: number
  invertible: Z3LinearRule[]
} {
  const perm = new Int8Array(PAIR_COUNT)

  for (let p = 0; p < PAIR_COUNT; p++) {
    perm[p] = p
  }

  const counter = new Int32Array(PAIR_COUNT)
  const additive: Z3LinearRule[] = []

  let checked = 0

  const visit = (): void => {
    checked++

    if (isZ3Additive(perm)) {
      const table = Int8Array.from(perm)
      const matrix = z3MatrixOfTable(table)

      additive.push({ matrix, table, name: z3MatrixName(matrix) })
    }
  }

  visit()

  let i = 0

  while (i < PAIR_COUNT) {
    if (counter[i]! < i) {
      const j = i % 2 === 0 ? 0 : counter[i]!
      const t = perm[j]!

      perm[j] = perm[i]!
      perm[i] = t
      visit()
      counter[i] = counter[i]! + 1
      i = 0
    } else {
      counter[i] = 0
      i++
    }
  }

  const invertible: Z3LinearRule[] = []

  let matricesChecked = 0

  for (let code = 0; code < 81; code++) {
    const m: Z3Matrix = [
      code % 3,
      Math.floor(code / 3) % 3,
      Math.floor(code / 9) % 3,
      Math.floor(code / 27) % 3,
    ]

    matricesChecked++

    if (z3Det(m) !== 0) {
      const rule = z3LinearRule(m)

      if (!isBijection(rule.table)) {
        throw new Error(`z3-linear-pair: ${rule.name} has det != 0 but no bijective table`)
      }

      invertible.push(rule)
    }
  }

  const byTable = (x: Z3LinearRule, y: Z3LinearRule): number =>
    tableKey(x.table) < tableKey(y.table) ? -1 : 1

  additive.sort(byTable)
  invertible.sort(byTable)

  return { permutationsChecked: checked, additive, matricesChecked, invertible }
}
