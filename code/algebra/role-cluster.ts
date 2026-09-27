// Clusters of roles and antiroles: the translation-neutral states of n roles and m antiroles, and how the turn
// group 2T = SL(2, 3) and the permutations of the roles act on them. Used by E-SPN-0060. Everything is computed
// from 3 x 3 traces or from vectors of length 3^(n + m), never a large matrix.
//
// The color frame is the Heisenberg group H = {omega^c D(v)} of 27 (E-SPN-0055): a role transforms by h, an antirole
// by conj(h). The neutral space is the range of Pi = (1/27) sum_h h^(x n) (x) conj(h)^(x m). The spin is the Weil lift
// of SL(2, 3) acting on every role at once (U on roles, conj(U) on antiroles). Since both commute with the
// permutations of the n roles, and Pi commutes with the spin, the character of (turn e, permutation s of the roles)
// on the neutral space factorizes over the cycles of s:
//
//   chi(e, s) = (1/27) sum_h prod_(cycles c of s) Tr((h U_e)^|c|) x conj(Tr(h U_e))^m.
//
// The irreducible characters of 2T are built from the model's own lifts rather than typed in: the natural doublet
// by element order (2, -2, -1, 0, 1 at orders 1, 2, 3, 4, 6), an order-3 character lambda as the scalar ratio of two
// Weil lifts, the twisted doublets as the natural one times lambda and lambda^2, and the triplet by order (3, 3,
// 0, -1, 0). E-SPN-0060 checks they are orthonormal before using them.

import { type ComplexMatrix, complexMultiply } from '@/code/algebra/linear/complex-matrix'
import { daggerMatrix, displacementMatrix, gridOrder, liftOf, scaleMatrix, traceOf, unitPhase, weilLifts, type GridMatrix } from '@/code/algebra/weil-representation'

export type Complex = [number, number]

const cmul = (a: Complex, b: Complex): Complex => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cconj = (a: Complex): Complex => [a[0], -a[1]]

export function cpow(a: Complex, n: number): Complex {
  let out: Complex = [1, 0]

  for (let k = 0; k < n; k++) {
    out = cmul(out, a)
  }

  return out
}

// the Heisenberg group of 27: omega^c D(a, b)
export function heisenbergGroup(): ComplexMatrix[] {
  const out: ComplexMatrix[] = []

  for (let c = 0; c < 3; c++) {
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        out.push(scaleMatrix(displacementMatrix(3, a, b), unitPhase(c / 3)))
      }
    }
  }

  return out
}

// the turns of 2T as the Weil lift's elements, with their order and grid matrix
export type Turn = { readonly unitary: ComplexMatrix; readonly grid: GridMatrix; readonly order: number }

export function spinTurns(): { turns: Turn[]; lambda: Complex[] } {
  const lifts = weilLifts(3)
  const base = lifts[0]
  const other = lifts[1]
  const turns = (base?.elements ?? []).map(e => ({ unitary: e.unitary, grid: e.grid, order: gridOrder(3, e.grid) }))
  // lambda(e) = lift1(e) lift0(e)^dagger, a scalar
  const lambda = turns.map(t => {
    const u = other ? liftOf(other, t.grid) : undefined

    if (!u) {
      return [1, 0] as Complex
    }

    const tr = traceOf(complexMultiply(u, daggerMatrix(t.unitary)))

    return [tr[0] / 3, tr[1] / 3] as Complex
  })

  return { turns, lambda }
}

const NATURAL: Record<number, number> = { 1: 2, 2: -2, 3: -1, 4: 0, 6: 1 }
const TRIPLET: Record<number, number> = { 1: 3, 2: 3, 3: 0, 4: -1, 6: 0 }

// the seven irreducible characters of 2T on the turns, with their dimensions and names
export function binaryTetrahedralCharacters(input: { turns: readonly Turn[]; lambda: readonly Complex[] }): { name: string; dimension: number; values: Complex[] }[] {
  const { turns, lambda } = input
  const natural = turns.map(t => [NATURAL[t.order] ?? 0, 0] as Complex)

  return [
    { name: 'trivial', dimension: 1, values: turns.map(() => [1, 0] as Complex) },
    { name: 'lambda', dimension: 1, values: [...lambda] },
    { name: 'lambdaSquared', dimension: 1, values: lambda.map(l => cmul(l, l)) },
    { name: 'natural', dimension: 2, values: natural },
    { name: 'twisted', dimension: 2, values: natural.map((v, i) => cmul(v, lambda[i] ?? [1, 0])) },
    { name: 'twistedSquared', dimension: 2, values: natural.map((v, i) => cmul(v, cmul(lambda[i] ?? [1, 0], lambda[i] ?? [1, 0]))) },
    { name: 'triplet', dimension: 3, values: turns.map(t => [TRIPLET[t.order] ?? 0, 0] as Complex) },
  ]
}

// the cycle lengths of a permutation of 0..k-1
export function cycleType(perm: readonly number[]): number[] {
  const seen = new Array<boolean>(perm.length).fill(false)
  const out: number[] = []

  for (let i = 0; i < perm.length; i++) {
    if (seen[i]) {
      continue
    }

    let length = 0
    let j = i

    while (!seen[j]) {
      seen[j] = true
      j = perm[j] ?? j
      length++
    }

    out.push(length)
  }

  return out.sort((a, b) => b - a)
}

export function permutations(k: number): number[][] {
  if (k === 0) {
    return [[]]
  }

  return permutations(k - 1).flatMap(p => Array.from({ length: k }, (_, at) => [...p.slice(0, at), k - 1, ...p.slice(at)]))
}

// chi(e, s) on the neutral space of n roles and m antiroles, s given by its cycle type on the roles
export function neutralCharacter(input: { group: readonly ComplexMatrix[]; turn: ComplexMatrix; cycles: readonly number[]; antiroles: number }): Complex {
  let sum: Complex = [0, 0]

  for (const h of input.group) {
    const he = complexMultiply(h, input.turn)
    let powered = he
    const traces: Complex[] = [traceOf(he) as Complex]

    for (let k = 2; k <= Math.max(1, ...input.cycles); k++) {
      powered = complexMultiply(powered, he)
      traces.push(traceOf(powered) as Complex)
    }

    let term: Complex = cpow(cconj(traces[0] ?? [0, 0]), input.antiroles)

    for (const c of input.cycles) {
      term = cmul(term, traces[c - 1] ?? [0, 0])
    }

    sum = [sum[0] + term[0] / input.group.length, sum[1] + term[1] / input.group.length]
  }

  return sum
}

// apply U to every role factor and conj(U) to every antirole factor of a vector on (C^3)^(n + m), roles first
export function applyToCluster(input: { vector: { re: Float64Array; im: Float64Array }; unitary: ComplexMatrix; roles: number; antiroles: number }): { re: Float64Array; im: Float64Array } {
  const { unitary, roles, antiroles } = input
  const total = roles + antiroles
  let re = Float64Array.from(input.vector.re)
  let im = Float64Array.from(input.vector.im)

  for (let factor = 0; factor < total; factor++) {
    const conjugate = factor >= roles
    const stride = 3 ** (total - 1 - factor)
    const nextRe = new Float64Array(re.length)
    const nextIm = new Float64Array(re.length)

    for (let i = 0; i < re.length; i++) {
      const digit = Math.floor(i / stride) % 3
      const base = i - digit * stride

      for (let row = 0; row < 3; row++) {
        const ur = unitary.re[row * 3 + digit] ?? 0
        const ui = conjugate ? -(unitary.im[row * 3 + digit] ?? 0) : unitary.im[row * 3 + digit] ?? 0
        const at = base + row * stride

        nextRe[at] = (nextRe[at] ?? 0) + ur * (re[i] ?? 0) - ui * (im[i] ?? 0)
        nextIm[at] = (nextIm[at] ?? 0) + ur * (im[i] ?? 0) + ui * (re[i] ?? 0)
      }
    }

    re = nextRe
    im = nextIm
  }

  return { re, im }
}
