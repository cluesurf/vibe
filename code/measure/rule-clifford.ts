// THE RULE'S PIECES AS EXACT OPERATORS, FOR A CLIFFORD TEST (E-QTM-0183). Each piece that superposes, and each link
// move, written as a sparse operator over Q(zeta_9) on a register of qubits and qutrits
// (code/algebra/group/exact-clifford), with the numbers taken from the rule's own gate code:
//
//   the coin          code/measure/rule-gates coinGate on a vibe's direction (R first, then L): one qubit
//   the line of two   code/measure/rule-gates lineOfTwo on two vibes' points, each point p = x + 3 y of the 3 x 3 grid
//                     written as two qutrits (y, x), so the pair is four qutrits; with `arm` set, the direction qubit
//                     first and the meeting only where the direction is that arm (a controlled piece)
//   a grid move       code/rule/vibe-weave gridMoves, an affine map of F3^2 with determinant 1, as a permutation of the
//                     nine points: two qutrits
//   the role kernels  code/measure/role-register's fear beat on two roles (qutrits): like U = P_sym + w P_anti, unlike
//                     V = 1 + (w - 1) Phi Phi^dag with Phi = sum_a |a a> / sqrt 3
//
// The register rule's own phases (the member mixer, the sector string and the sector contact of code/measure/register-
// holes) are norm-one ring units, tested without a basis by ringUnitReading in code/algebra/group/exact-clifford.
//
// DETERMINISM: no random numbers. EXACT: Q(omega) amplitudes read into Q(zeta_9), no floating point.

import {
  ninthFromEisenstein,
  registerSize,
  sparseFromColumns,
  sparsePermutation,
  type Register,
  type SparseOperator,
} from '@/code/algebra/group/exact-clifford'
import { add, mul, ninth, ONE, sub, zetaPower, type Ninth } from '@/code/algebra/ninth-field'
import {
  coinGate,
  label,
  lineOfTwo,
  pointsOf,
  dirOf,
  type Gate,
} from '@/code/measure/rule-gates'

const DIRECTIONS = ['R', 'L'] as const

// a rule-gates gate read as a sparse operator on labels enumerated in register order
function gateOperator(input: {
  register: Register
  labelOf: (index: number) => string
  indexOfLabel: (l: string) => number
  gate: Gate
}): SparseOperator {
  return sparseFromColumns({
    size: registerSize(input.register),
    column: j =>
      input.gate(input.labelOf(j)).map(
        ([l, v]) => [input.indexOfLabel(l), ninthFromEisenstein(v)] as const,
      ),
  })
}

// the coin on one vibe's direction, a qubit (R = 0, L = 1)
export function ruleCoinOperator(): { register: Register; operator: SparseOperator } {
  const register: Register = [2]

  return {
    register,
    operator: gateOperator({
      register,
      labelOf: j => label(DIRECTIONS[j]!, [0]),
      indexOfLabel: l => DIRECTIONS.indexOf(dirOf(l) as 'R' | 'L'),
      gate: coinGate,
    }),
  }
}

// the line of two on two vibes' points (index 9 pA + pB, the qutrits yA, xA, yB, xB), or with `arm` the controlled form
// on the direction qubit and the two points (index 81 dir + 9 pA + pB)
export function ruleMeetingOperator(arm: 'R' | 'L' | null): {
  register: Register
  operator: SparseOperator
} {
  const register: Register = arm === null ? [3, 3, 3, 3] : [2, 3, 3, 3, 3]
  const labelOf = (j: number): string =>
    arm === null
      ? label('-', [Math.floor(j / 9), j % 9])
      : label(DIRECTIONS[Math.floor(j / 81)]!, [
          Math.floor((j % 81) / 9),
          j % 9,
        ])
  const indexOfLabel = (l: string): number => {
    const p = pointsOf(l)
    const base = 9 * p[0]! + p[1]!

    return arm === null
      ? base
      : 81 * DIRECTIONS.indexOf(dirOf(l) as 'R' | 'L') + base
  }

  return {
    register,
    operator: gateOperator({
      register,
      labelOf,
      indexOfLabel,
      gate: lineOfTwo(0, 1, arm),
    }),
  }
}

// a grid move (a table of the nine points) as a permutation of two qutrits (y, x), index p = x + 3 y
export const gridMoveOperator = (table: ArrayLike<number>): SparseOperator =>
  sparsePermutation(Array.from(table))

const OMEGA = zetaPower(3)
const HALF = ninth([1], 2)
const THIRD = ninth([1], 3)

// the like kernel on two roles: U = P_sym + w P_anti = (1 + w)/2 1 + (1 - w)/2 SWAP
export function likeKernelOperator(): SparseOperator {
  const keep = mul(add(ONE, OMEGA), HALF)
  const exchange = mul(sub(ONE, OMEGA), HALF)

  return sparseFromColumns({
    size: 9,
    column: j => {
      const a = Math.floor(j / 3)
      const b = j % 3

      return [
        [j, keep],
        [3 * b + a, exchange],
      ]
    },
  })
}

// the unlike kernel on two roles: V = 1 + (w - 1) Phi Phi^dag, Phi Phi^dag = 1/3 on the diagonal states |a a>
export function unlikeKernelOperator(): SparseOperator {
  const off = mul(sub(OMEGA, ONE), THIRD)

  return sparseFromColumns({
    size: 9,
    column: j => {
      const out: [number, Ninth][] = [[j, ONE]]

      if (Math.floor(j / 3) === j % 3) {
        for (let a = 0; a < 3; a++) {
          out.push([4 * a, off])
        }
      }

      return out
    },
  })
}
