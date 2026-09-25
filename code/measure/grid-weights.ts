// Grid weights of n qutrits: the discrete Wigner function on the 9^n points of the role grid, and the
// exact kernel by which a gate moves those weights. A state's weights sum to 1 and are all at least 0
// exactly for a classical mixture. A set of vibes on grid points is a signed weighting, love +1 and
// fear -1, so a state is written by whole loves and fears when N W(x) is whole on every point for some
// number of units N (note/experiment/gauge/what-the-base-needs, E-FRC-0120 to E-FRC-0122).

import { phasePoint } from '@/code/measure/qutrit-phase-space'

// a complex square matrix, row-major
export type Operator = { n: number; re: Float64Array; im: Float64Array }

export function operator(n: number): Operator {
  return { n, re: new Float64Array(n * n), im: new Float64Array(n * n) }
}

export function identityOperator(n: number): Operator {
  const out = operator(n)

  for (let i = 0; i < n; i++) {
    out.re[i * n + i] = 1
  }

  return out
}

export function multiplyOperators(a: Operator, b: Operator): Operator {
  const out = operator(a.n)

  for (let i = 0; i < a.n; i++) {
    for (let k = 0; k < a.n; k++) {
      const ar = a.re[i * a.n + k] ?? 0
      const ai = a.im[i * a.n + k] ?? 0

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < a.n; j++) {
        const br = b.re[k * a.n + j] ?? 0
        const bi = b.im[k * a.n + j] ?? 0

        out.re[i * a.n + j] =
          (out.re[i * a.n + j] ?? 0) + ar * br - ai * bi

        out.im[i * a.n + j] =
          (out.im[i * a.n + j] ?? 0) + ar * bi + ai * br
      }
    }
  }

  return out
}

export function adjointOperator(a: Operator): Operator {
  const out = operator(a.n)

  for (let i = 0; i < a.n; i++) {
    for (let j = 0; j < a.n; j++) {
      out.re[i * a.n + j] = a.re[j * a.n + i] ?? 0
      out.im[i * a.n + j] = -(a.im[j * a.n + i] ?? 0)
    }
  }

  return out
}

export function tensorOperators(a: Operator, b: Operator): Operator {
  const n = a.n * b.n
  const out = operator(n)

  for (let i = 0; i < a.n; i++) {
    for (let j = 0; j < a.n; j++) {
      const ar = a.re[i * a.n + j] ?? 0
      const ai = a.im[i * a.n + j] ?? 0

      for (let k = 0; k < b.n; k++) {
        for (let l = 0; l < b.n; l++) {
          const br = b.re[k * b.n + l] ?? 0
          const bi = b.im[k * b.n + l] ?? 0
          const index = (i * b.n + k) * n + (j * b.n + l)

          out.re[index] = ar * br - ai * bi
          out.im[index] = ar * bi + ai * br
        }
      }
    }
  }

  return out
}

// the phase-point operators of n qutrits, A(x1) x ... x A(xn), point index x1 * 9^(n-1) + ... + xn
export function phasePointOperators(qutrits: number): Operator[] {
  const single = [0, 1, 2].flatMap(a =>
    [0, 1, 2].map(b => {
      const m = phasePoint(a, b)
      const out = operator(3)

      for (let k = 0; k < 9; k++) {
        out.re[k] = m[2 * k] ?? 0
        out.im[k] = m[2 * k + 1] ?? 0
      }

      return out
    }),
  )

  let points: Operator[] = [identityOperator(1)]

  for (let q = 0; q < qutrits; q++) {
    points = points.flatMap(p => single.map(s => tensorOperators(p, s)))
  }

  return points
}

// the grid weights W(x) = <psi| A(x) |psi> / 3^n of a pure state
export function gridWeights(input: {
  re: readonly number[]
  im: readonly number[]
  points: readonly Operator[]
}): number[] {
  const { re, im, points } = input
  const dimension = re.length

  return points.map(a => {
    let value = 0

    for (let i = 0; i < dimension; i++) {
      let ar = 0
      let ai = 0

      for (let j = 0; j < dimension; j++) {
        const xr = a.re[i * dimension + j] ?? 0
        const xi = a.im[i * dimension + j] ?? 0

        ar += xr * (re[j] ?? 0) - xi * (im[j] ?? 0)
        ai += xr * (im[j] ?? 0) + xi * (re[j] ?? 0)
      }

      value += (re[i] ?? 0) * ar + (im[i] ?? 0) * ai
    }

    return value / dimension
  })
}

// the fewest units N up to a limit making every N W whole, and the love and fear units, or n = -1
export function wholeUnits(input: {
  weights: readonly number[]
  limit: number
}): { n: number; loves: number; fears: number } {
  const { weights, limit } = input

  for (let n = 1; n <= limit; n++) {
    if (
      weights.every(x => Math.abs(n * x - Math.round(n * x)) < 1e-7)
    ) {
      const counts = weights.map(x => Math.round(n * x))

      return {
        n,
        loves: counts.filter(c => c > 0).reduce((a, b) => a + b, 0),
        fears: -counts.filter(c => c < 0).reduce((a, b) => a + b, 0),
      }
    }
  }

  return { n: -1, loves: -1, fears: -1 }
}

// apply a unitary to a state vector
export function applyOperator(
  u: Operator,
  re: readonly number[],
  im: readonly number[],
): { re: number[]; im: number[] } {
  const outRe: number[] = []
  const outIm: number[] = []

  for (let i = 0; i < u.n; i++) {
    let r = 0
    let m = 0

    for (let j = 0; j < u.n; j++) {
      const ur = u.re[i * u.n + j] ?? 0
      const ui = u.im[i * u.n + j] ?? 0

      r += ur * (re[j] ?? 0) - ui * (im[j] ?? 0)
      m += ur * (im[j] ?? 0) + ui * (re[j] ?? 0)
    }

    outRe.push(r)
    outIm.push(m)
  }

  return { re: outRe, im: outIm }
}
