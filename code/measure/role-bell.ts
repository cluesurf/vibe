// CHSH on two roles read off a knot's grid weights: the density matrix rho = sum W(x) A(x) and the largest
// CHSH value over two-outcome measurements on each role, by a deterministic see-saw from eight fixed
// golden-ratio starts (a lower bound on the maximum). Promoted from the inline helpers of E-QTM-0100
// (test/experiment/quantum/fear-witness), unchanged, so later experiments import one copy.

import { twoRolePoints, wholeUnits, type Whole } from '@/code/rule/fear-weave'
import { type Operator } from '@/code/measure/grid-weights'

const GOLDEN = (Math.sqrt(5) - 1) / 2

type Hermitian = { re: Float64Array; im: Float64Array }

// real symmetric eigen-decomposition by cyclic Jacobi, columns of the returned matrix
function jacobi(a: number[][]): { values: number[]; vectors: number[][] } {
  const n = a.length
  const m = a.map(row => [...row])
  const v: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)))

  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += (m[p]?.[q] ?? 0) ** 2
      }
    }

    if (off < 1e-28) {
      break
    }

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = m[p]?.[q] ?? 0

        if (Math.abs(apq) < 1e-300) {
          continue
        }

        const theta = ((m[q]?.[q] ?? 0) - (m[p]?.[p] ?? 0)) / (2 * apq)
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let k = 0; k < n; k++) {
          const mkp = m[k]?.[p] ?? 0
          const mkq = m[k]?.[q] ?? 0

          m[k]![p] = c * mkp - s * mkq
          m[k]![q] = s * mkp + c * mkq
        }

        for (let k = 0; k < n; k++) {
          const mpk = m[p]?.[k] ?? 0
          const mqk = m[q]?.[k] ?? 0

          m[p]![k] = c * mpk - s * mqk
          m[q]![k] = s * mpk + c * mqk
        }

        for (let k = 0; k < n; k++) {
          const vkp = v[k]?.[p] ?? 0
          const vkq = v[k]?.[q] ?? 0

          v[k]![p] = c * vkp - s * vkq
          v[k]![q] = s * vkp + c * vkq
        }
      }
    }
  }

  return { values: m.map((row, i) => row[i] ?? 0), vectors: v }
}

// the sign of a 3 x 3 Hermitian matrix (eigenvalues sent to +1 or -1), through its 6 x 6 real form
function signOf(h: Hermitian): Hermitian {
  const z = Array.from({ length: 6 }, () => new Array<number>(6).fill(0))

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const re = h.re[i * 3 + j] ?? 0
      const im = h.im[i * 3 + j] ?? 0

      z[i]![j] = re
      z[i + 3]![j + 3] = re
      z[i]![j + 3] = -im
      z[i + 3]![j] = im
    }
  }

  const { values, vectors } = jacobi(z)
  const out: Hermitian = { re: new Float64Array(9), im: new Float64Array(9) }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < 6; k++) {
        const sign = (values[k] ?? 0) >= 0 ? 1 : -1

        re += sign * (vectors[i]?.[k] ?? 0) * (vectors[j]?.[k] ?? 0)
        im += sign * (vectors[i + 3]?.[k] ?? 0) * (vectors[j]?.[k] ?? 0)
      }

      out.re[i * 3 + j] = re
      out.im[i * 3 + j] = im
    }
  }

  return out
}

function combine(a: Hermitian, b: Hermitian, s: number): Hermitian {
  return { re: a.re.map((x, i) => x + s * (b.re[i] ?? 0)), im: a.im.map((x, i) => x + s * (b.im[i] ?? 0)) }
}

// rho = sum W(x) A(x) on two roles, row-major 9 x 9
export function roleDensity(whole: Whole): Operator {
  const points = twoRolePoints()
  const units = Number(wholeUnits(whole))
  const rho: Operator = { n: 9, re: new Float64Array(81), im: new Float64Array(81) }

  whole.weight.forEach((w, x) => {
    if (w === 0n) {
      return
    }

    const weight = Number(w) / units
    const a = points[x]!

    for (let k = 0; k < 81; k++) {
      rho.re[k] = (rho.re[k] ?? 0) + weight * (a.re[k] ?? 0)
      rho.im[k] = (rho.im[k] ?? 0) + weight * (a.im[k] ?? 0)
    }
  })

  return rho
}

// the reduced operator on one role against an observable on the other
function reduce(rho: Operator, o: Hermitian, side: 0 | 1): Hermitian {
  const out: Hermitian = { re: new Float64Array(9), im: new Float64Array(9) }

  for (let p = 0; p < 3; p++) {
    for (let q = 0; q < 3; q++) {
      let re = 0
      let im = 0

      for (let s = 0; s < 3; s++) {
        for (let u = 0; u < 3; u++) {
          const row = side === 1 ? 3 * s + p : 3 * p + s
          const col = side === 1 ? 3 * u + q : 3 * q + u
          const rr = rho.re[row * 9 + col] ?? 0
          const ri = rho.im[row * 9 + col] ?? 0
          const or = o.re[u * 3 + s] ?? 0
          const oi = o.im[u * 3 + s] ?? 0

          re += rr * or - ri * oi
          im += rr * oi + ri * or
        }
      }

      out.re[p * 3 + q] = re
      out.im[p * 3 + q] = im
    }
  }

  const h: Hermitian = { re: new Float64Array(9), im: new Float64Array(9) }

  for (let p = 0; p < 3; p++) {
    for (let q = 0; q < 3; q++) {
      h.re[p * 3 + q] = ((out.re[p * 3 + q] ?? 0) + (out.re[q * 3 + p] ?? 0)) / 2
      h.im[p * 3 + q] = ((out.im[p * 3 + q] ?? 0) - (out.im[q * 3 + p] ?? 0)) / 2
    }
  }

  return h
}

function traceProduct(a: Hermitian, b: Hermitian): number {
  let re = 0

  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 3; k++) {
      re += (a.re[i * 3 + k] ?? 0) * (b.re[k * 3 + i] ?? 0) - (a.im[i * 3 + k] ?? 0) * (b.im[k * 3 + i] ?? 0)
    }
  }

  return re
}

function fixedHermitian(seed: number): Hermitian {
  const h: Hermitian = { re: new Float64Array(9), im: new Float64Array(9) }

  for (let i = 0; i < 3; i++) {
    for (let j = i; j < 3; j++) {
      const u = (((seed + 1) * 7 + i * 3 + j + 1) * GOLDEN) % 1
      const v = (((seed + 2) * 11 + i * 5 + j + 3) * GOLDEN) % 1

      h.re[i * 3 + j] = u - 0.5
      h.re[j * 3 + i] = u - 0.5
      h.im[i * 3 + j] = i === j ? 0 : v - 0.5
      h.im[j * 3 + i] = i === j ? 0 : 0.5 - v
    }
  }

  return h
}

// the largest CHSH value the see-saw finds from eight fixed starts
export function roleChsh(rho: Operator): number {
  let best = Number.NEGATIVE_INFINITY

  for (let start = 0; start < 8; start++) {
    let a0 = signOf(fixedHermitian(2 * start))
    let a1 = signOf(fixedHermitian(2 * start + 1))
    let value = 0

    for (let step = 0; step < 200; step++) {
      const b0 = signOf(reduce(rho, combine(a0, a1, 1), 1))
      const b1 = signOf(reduce(rho, combine(a0, a1, -1), 1))

      a0 = signOf(reduce(rho, combine(b0, b1, 1), 0))
      a1 = signOf(reduce(rho, combine(b0, b1, -1), 0))

      const next = traceProduct(reduce(rho, combine(b0, b1, 1), 0), a0) + traceProduct(reduce(rho, combine(b0, b1, -1), 0), a1)

      if (Math.abs(next - value) < 1e-13) {
        value = next
        break
      }

      value = next
    }

    best = Math.max(best, value)
  }

  return best
}
