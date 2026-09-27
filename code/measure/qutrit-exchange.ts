// Exchange symmetry of several identical qutrits, read on their discrete phase space as whole numbers
// of loves and fears.
//
// n qutrits have the 9^n phase points (x1, ..., xn), each xi a point (a, b) of Z_3^2, and a state rho
// has the Wigner function W(x) = Tr(rho A(x1) ... A(xn)) / 3^n, real, summing to 1, with A the
// phase-point operators of code/measure/qutrit-phase-space (Wootters, Gross). A negative W is what
// no classical mixture of phase points can give: written with whole units, the positive units are
// loves and the negative ones fears (E-FRC-0120 introduced this reading for the color singlet).
//
// The states here are the uniform mixtures over the SYMMETRIC (bosonic) and the ANTISYMMETRIC
// (fermionic) subspaces of n qutrits, built from orthonormal bases of symmetrized basis tuples, and any
// pure state given by its amplitudes. Exact up to floating sums of the 3 x 3 phase-point entries.

import { phasePoint } from '@/code/measure/qutrit-phase-space'

export type PureState = { re: Float64Array; im: Float64Array }

export type Mixture = { weight: number; state: PureState }[]

// the 9 phase-point operators in the order (a, b) = (0,0), (0,1), ..., (2,2), point index 3 a + b
const OPERATORS = [0, 1, 2].flatMap(a => [0, 1, 2].map(b => phasePoint(a, b)))

function digitsOf(index: number, n: number, base: number): number[] {
  return Array.from(
    { length: n },
    (_, k) => Math.floor(index / base ** (n - 1 - k)) % base,
  )
}

function permutationsOf(n: number): { perm: number[]; sign: number }[] {
  if (n === 1) {
    return [{ perm: [0], sign: 1 }]
  }

  const out: { perm: number[]; sign: number }[] = []

  for (const { perm, sign } of permutationsOf(n - 1)) {
    for (let at = 0; at <= perm.length; at++) {
      const next = [...perm.slice(0, at), n - 1, ...perm.slice(at)]
      // inserting n - 1 at position `at` passes over (length - at) larger-position entries
      const crossings = perm.length - at

      out.push({ perm: next, sign: crossings % 2 === 0 ? sign : -sign })
    }
  }

  return out
}

// the uniform mixture over the symmetric or antisymmetric subspace of n qutrits
export function exchangeSubspace(input: {
  n: number
  symmetry: 'symmetric' | 'antisymmetric'
}): Mixture {
  const { n, symmetry } = input
  const size = 3 ** n
  const perms = permutationsOf(n)
  const states: PureState[] = []

  for (let index = 0; index < size; index++) {
    const tuple = digitsOf(index, n, 3)
    const sorted = tuple.every((v, k) => k === 0 || (tuple[k - 1] ?? 0) <= v)

    if (!sorted) {
      continue
    }

    const re = new Float64Array(size)

    for (const { perm, sign } of perms) {
      const image = perm.map(k => tuple[k] ?? 0)
      const target = image.reduce((sum, v) => sum * 3 + v, 0)

      re[target] = (re[target] ?? 0) + (symmetry === 'symmetric' ? 1 : sign)
    }

    const norm = Math.hypot(...re)

    if (norm < 1e-9) {
      continue
    }

    states.push({ re: re.map(v => v / norm), im: new Float64Array(size) })
  }

  return states.map(state => ({ weight: 1 / states.length, state }))
}

// apply the 3 x 3 operator to qutrit `factor` (0 the most significant digit) of an n-qutrit vector
function applyOn(
  op: Float64Array,
  factor: number,
  n: number,
  state: PureState,
): PureState {
  const size = 3 ** n
  const re = new Float64Array(size)
  const im = new Float64Array(size)
  const stride = 3 ** (n - 1 - factor)

  for (let index = 0; index < size; index++) {
    const digit = Math.floor(index / stride) % 3
    const base = index - digit * stride

    for (let k = 0; k < 3; k++) {
      const sr = state.re[base + k * stride] ?? 0
      const si = state.im[base + k * stride] ?? 0
      const or = op[2 * (3 * digit + k)] ?? 0
      const oi = op[2 * (3 * digit + k) + 1] ?? 0

      re[index] = (re[index] ?? 0) + or * sr - oi * si
      im[index] = (im[index] ?? 0) + or * si + oi * sr
    }
  }

  return { re, im }
}

// W over the 9^n phase points, point index sum_k p_k 9^(n - 1 - k) with p_k = 3 a_k + b_k
export function wignerOfMixture(input: { n: number; mixture: Mixture }): number[] {
  const { n, mixture } = input
  const points = 9 ** n
  const out = new Array<number>(points).fill(0)

  for (let x = 0; x < points; x++) {
    const p = digitsOf(x, n, 9)
    let value = 0

    for (const { weight, state } of mixture) {
      let moved = state

      for (let k = n - 1; k >= 0; k--) {
        moved = applyOn(OPERATORS[p[k] ?? 0] ?? new Float64Array(18), k, n, moved)
      }

      let inner = 0

      for (let i = 0; i < state.re.length; i++) {
        inner +=
          (state.re[i] ?? 0) * (moved.re[i] ?? 0) +
          (state.im[i] ?? 0) * (moved.im[i] ?? 0)
      }

      value += weight * inner
    }

    out[x] = value / 3 ** n
  }

  return out
}

// the smallest N up to a limit making every N W a whole number, with the love and fear unit counts
export function lovesAndFears(
  wigner: readonly number[],
  limit = 5000,
): { units: number; loves: number; fears: number } {
  for (let n = 1; n <= limit; n++) {
    if (wigner.every(x => Math.abs(n * x - Math.round(n * x)) < 1e-7)) {
      const counts = wigner.map(x => Math.round(n * x))

      return {
        units: n,
        loves: counts.filter(c => c > 0).reduce((a, b) => a + b, 0),
        fears: counts.filter(c => c < 0).reduce((a, b) => a - b, 0),
      }
    }
  }

  return { units: -1, loves: -1, fears: -1 }
}

// whether some two of the n phase points of index x coincide
export function hasCoincidence(x: number, n: number): boolean {
  const p = digitsOf(x, n, 9)

  return p.some((v, k) => p.indexOf(v) !== k)
}

// whether all n phase points of index x are the same point
export function allCoincide(x: number, n: number): boolean {
  const p = digitsOf(x, n, 9)

  return p.every(v => v === p[0])
}

// the qutrit (role) marginal: the probability of each basis tuple, summing W over the tilts, where the
// basis state j sits on the phase points with first coordinate a = j (E-FRC-0120 checks this)
export function roleMarginal(input: { n: number; wigner: readonly number[] }): number[] {
  const { n, wigner } = input
  const out = new Array<number>(3 ** n).fill(0)

  wigner.forEach((w, x) => {
    const roles = digitsOf(x, n, 9).map(p => Math.floor(p / 3))
    const index = roles.reduce((sum, v) => sum * 3 + v, 0)

    out[index] = (out[index] ?? 0) + w
  })

  return out
}
