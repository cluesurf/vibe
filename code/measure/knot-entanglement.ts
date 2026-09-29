// Entanglement readings of two- and three-role knots, for E-QTM-0153: the density matrix of a whole's weights,
// partial traces, bounds on the concurrence of a two-qutrit mixed state, and a Mermin see-saw over two-outcome
// observables on three roles.
//
// Measurement code: it reads a whole's exact integer weights and computes in floats. The rule never calls it.
//
// Concurrence of two qutrits (Rungta et al. 2001): C(psi) = sqrt(2 (1 - Tr rho_A^2)) for a pure state, and for a
// mixed state the convex roof, which has no closed form. Bounded here from both sides:
// - lower, Chen, Albeverio and Fei (2005): C(rho) >= sqrt(2 / (m (m - 1))) (max(||rho^(T_B)||_1, ||R(rho)||_1) - 1),
//   m = 3, with R the realignment
// - upper: sum_i p_i C(psi_i) over the eigen-decomposition, one decomposition of the roof
// - exact, when the state lies in the antisymmetric subspace: every vector of C^3 wedge C^3 is a decomposable
//   a wedge b (the space has dimension 3), so every pure state of every decomposition has Schmidt weights
//   (1/2, 1/2) and C^2 = 1 exactly (Ou 2007)

import {
  hermitianEigenvectors,
  hermitianSpectrum,
} from '@/code/measure/qutrit-clifford'
import {
  operator,
  phasePointOperators,
  type Operator,
} from '@/code/measure/grid-weights'
import { signOf } from '@/code/measure/role-bell'

type Hermitian3 = { re: Float64Array; im: Float64Array }

const ONE_ROLE = phasePointOperators(1)

// rho = sum_x W(x) A(x1) x ... x A(xk) for k = 1, 2, 3 roles, by contracting one role at a time
export function densityOf(
  weight: readonly bigint[],
  roles: number,
): Operator {
  const n = Number(weight.reduce((a, b) => a + b, 0n))
  const dim = 3 ** roles

  // current: for each remaining prefix of points, an operator on the roles already contracted (the last ones)
  let current: { re: Float64Array; im: Float64Array }[] = weight.map(
    w => ({
      re: Float64Array.of(Number(w) / n),
      im: Float64Array.of(0),
    }),
  )
  let done = 0

  for (let r = roles - 1; r >= 0; r--) {
    const size = 3 ** done
    const next: { re: Float64Array; im: Float64Array }[] = []

    for (let prefix = 0; prefix < current.length / 9; prefix++) {
      const bigger = 3 * size
      const re = new Float64Array(bigger * bigger)
      const im = new Float64Array(bigger * bigger)

      for (let p = 0; p < 9; p++) {
        const block = current[prefix * 9 + p]!
        const a = ONE_ROLE[p]!

        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const ar = a.re[i * 3 + j] ?? 0
            const ai = a.im[i * 3 + j] ?? 0

            if (ar === 0 && ai === 0) {
              continue
            }

            for (let k = 0; k < size; k++) {
              for (let l = 0; l < size; l++) {
                const br = block.re[k * size + l] ?? 0
                const bi = block.im[k * size + l] ?? 0
                const at = (i * size + k) * bigger + (j * size + l)

                re[at] = (re[at] ?? 0) + ar * br - ai * bi
                im[at] = (im[at] ?? 0) + ar * bi + ai * br
              }
            }
          }
        }
      }

      next.push({ re, im })
    }

    current = next
    done++
  }

  const out = operator(dim)

  out.re.set(current[0]!.re)
  out.im.set(current[0]!.im)

  return out
}

// the reduced operator of the kept roles (in their order), for an operator on `roles` qutrits
export function partialTrace(
  rho: Operator,
  roles: number,
  keep: readonly number[],
): Operator {
  const dim = 3 ** keep.length
  const out = operator(dim)
  const digit = (index: number, r: number): number =>
    Math.floor(index / 3 ** (roles - 1 - r)) % 3

  for (let row = 0; row < rho.n; row++) {
    for (let col = 0; col < rho.n; col++) {
      let same = true

      for (let r = 0; r < roles && same; r++) {
        same = keep.includes(r) || digit(row, r) === digit(col, r)
      }

      if (!same) {
        continue
      }

      const kr = keep.reduce((a, r) => a * 3 + digit(row, r), 0)
      const kc = keep.reduce((a, r) => a * 3 + digit(col, r), 0)

      out.re[kr * dim + kc] =
        (out.re[kr * dim + kc] ?? 0) + (rho.re[row * rho.n + col] ?? 0)

      out.im[kr * dim + kc] =
        (out.im[kr * dim + kc] ?? 0) + (rho.im[row * rho.n + col] ?? 0)
    }
  }

  return out
}

function traceNormHermitian(a: Operator): number {
  return hermitianSpectrum(a).reduce((s, x) => s + Math.abs(x), 0)
}

// the trace norm of any square operator: the sum of the square roots of the eigenvalues of a^dagger a
function traceNorm(a: Operator): number {
  const n = a.n
  const g = operator(n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < n; k++) {
        // conj(a_ki) a_kj
        const xr = a.re[k * n + i] ?? 0
        const xi = -(a.im[k * n + i] ?? 0)
        const yr = a.re[k * n + j] ?? 0
        const yi = a.im[k * n + j] ?? 0

        re += xr * yr - xi * yi
        im += xr * yi + xi * yr
      }

      g.re[i * n + j] = re
      g.im[i * n + j] = im
    }
  }

  return hermitianSpectrum(g).reduce(
    (s, x) => s + Math.sqrt(Math.max(0, x)),
    0,
  )
}

// the concurrence of a pure two-qutrit vector, sqrt(2 (1 - Tr rho_A^2))
export function pureConcurrence(
  re: readonly number[],
  im: readonly number[],
): number {
  let purity = 0

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let r = 0
      let m = 0

      for (let k = 0; k < 3; k++) {
        // psi_ik conj(psi_jk)
        r +=
          (re[3 * i + k] ?? 0) * (re[3 * j + k] ?? 0) +
          (im[3 * i + k] ?? 0) * (im[3 * j + k] ?? 0)

        m +=
          (im[3 * i + k] ?? 0) * (re[3 * j + k] ?? 0) -
          (re[3 * i + k] ?? 0) * (im[3 * j + k] ?? 0)
      }

      purity += r * r + m * m
    }
  }

  return Math.sqrt(Math.max(0, 2 * (1 - purity)))
}

export type ConcurrenceBounds = {
  lower: number
  upper: number
  antisymmetric: boolean
  exact: number | null
}

// bounds on the concurrence of a two-qutrit density matrix (9 x 9, index 3 i + j)
export function concurrenceBounds(rho: Operator): ConcurrenceBounds {
  const pt = operator(9)
  const realigned = operator(9)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          const from = (3 * i + j) * 9 + (3 * k + l)

          // partial transpose on B: (i l),(k j)
          pt.re[(3 * i + l) * 9 + (3 * k + j)] = rho.re[from] ?? 0
          pt.im[(3 * i + l) * 9 + (3 * k + j)] = rho.im[from] ?? 0
          // realignment: (i k),(j l)
          realigned.re[(3 * i + k) * 9 + (3 * j + l)] =
            rho.re[from] ?? 0

          realigned.im[(3 * i + k) * 9 + (3 * j + l)] =
            rho.im[from] ?? 0
        }
      }
    }
  }

  const lower = Math.max(
    0,
    (Math.max(traceNormHermitian(pt), traceNorm(realigned)) - 1) /
      Math.sqrt(3),
  )
  const { values, vectors } = hermitianEigenvectors(rho)

  let upper = 0

  values.forEach((p, c) => {
    if (p > 1e-14) {
      upper +=
        p *
        pureConcurrence(
          Array.from(
            { length: 9 },
            (_, i) => vectors.re[i * 9 + c] ?? 0,
          ),
          Array.from(
            { length: 9 },
            (_, i) => vectors.im[i * 9 + c] ?? 0,
          ),
        )
    }
  })

  // the weight of the symmetric subspace, Tr(rho (1 + SWAP) / 2)
  let symmetric = 0

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      symmetric +=
        ((rho.re[(3 * i + j) * 9 + (3 * i + j)] ?? 0) +
          (rho.re[(3 * i + j) * 9 + (3 * j + i)] ?? 0)) /
        2
    }
  }

  const antisymmetric = Math.abs(symmetric) < 1e-12

  return {
    lower,
    upper,
    antisymmetric,
    exact: antisymmetric ? 1 : null,
  }
}

// Tr_(others)[rho (O_q x O_r)] as a 3 x 3 operator on `party`, for three roles, given the other two parties'
// observables in role order
function contract(
  rho: Operator,
  party: number,
  others: readonly [Hermitian3, Hermitian3],
): Hermitian3 {
  const out: Hermitian3 = {
    re: new Float64Array(9),
    im: new Float64Array(9),
  }
  const [q, r] = [0, 1, 2].filter(x => x !== party) as [number, number]

  const index = (p: number, a: number, b: number): number => {
    const d = [0, 0, 0]

    d[party] = p
    d[q] = a
    d[r] = b

    return 9 * d[0]! + 3 * d[1]! + d[2]!
  }

  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 3; k++) {
      let re = 0
      let im = 0

      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) {
          for (let c = 0; c < 3; c++) {
            for (let d = 0; d < 3; d++) {
              // rho_(i a b),(k c d) O_q[c][a] O_r[d][b]
              const at = index(i, a, b) * 27 + index(k, c, d)
              const rr = rho.re[at] ?? 0
              const ri = rho.im[at] ?? 0
              const or =
                (others[0].re[c * 3 + a] ?? 0) *
                  (others[1].re[d * 3 + b] ?? 0) -
                (others[0].im[c * 3 + a] ?? 0) *
                  (others[1].im[d * 3 + b] ?? 0)
              const oi =
                (others[0].re[c * 3 + a] ?? 0) *
                  (others[1].im[d * 3 + b] ?? 0) +
                (others[0].im[c * 3 + a] ?? 0) *
                  (others[1].re[d * 3 + b] ?? 0)

              re += rr * or - ri * oi
              im += rr * oi + ri * or
            }
          }
        }
      }

      out.re[i * 3 + k] = re
      out.im[i * 3 + k] = im
    }
  }

  // the Hermitian part
  const h: Hermitian3 = {
    re: new Float64Array(9),
    im: new Float64Array(9),
  }

  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 3; k++) {
      h.re[i * 3 + k] =
        ((out.re[i * 3 + k] ?? 0) + (out.re[k * 3 + i] ?? 0)) / 2

      h.im[i * 3 + k] =
        ((out.im[i * 3 + k] ?? 0) - (out.im[k * 3 + i] ?? 0)) / 2
    }
  }

  return h
}

function traceWith(a: Hermitian3, b: Hermitian3): number {
  let s = 0

  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 3; k++) {
      s +=
        (a.re[i * 3 + k] ?? 0) * (b.re[k * 3 + i] ?? 0) -
        (a.im[i * 3 + k] ?? 0) * (b.im[k * 3 + i] ?? 0)
    }
  }

  return s
}

const add = (a: Hermitian3, b: Hermitian3, s: number): Hermitian3 => ({
  re: a.re.map((x, i) => x + s * (b.re[i] ?? 0)),
  im: a.im.map((x, i) => x + s * (b.im[i] ?? 0)),
})

// Mermin's M = <A1 B1 C1> - <A1 B2 C2> - <A2 B1 C2> - <A2 B2 C1> (local bound 2, quantum 4) over two-outcome
// observables on each of three roles, by a see-saw from deterministic starts (a lower bound on the maximum).
// starts: a list of six Hermitian 3 x 3 matrices per start (A1, A2, B1, B2, C1, C2 before taking signs)
export function merminSeeSaw(
  rho: Operator,
  starts: readonly (readonly Hermitian3[])[],
  steps: number,
): number {
  // terms: (setting of A, of B, of C, sign)
  const terms: readonly (readonly [number, number, number, number])[] =
    [
      [0, 0, 0, 1],
      [0, 1, 1, -1],
      [1, 0, 1, -1],
      [1, 1, 0, -1],
    ]

  let best = Number.NEGATIVE_INFINITY

  for (const start of starts) {
    const o: Hermitian3[][] = [0, 1, 2].map(p => [
      signOf(start[2 * p]!),
      signOf(start[2 * p + 1]!),
    ])

    let value = Number.NEGATIVE_INFINITY

    for (let step = 0; step < steps; step++) {
      for (let party = 0; party < 3; party++) {
        const x: Hermitian3[] = [0, 1].map(() => ({
          re: new Float64Array(9),
          im: new Float64Array(9),
        }))

        for (const t of terms) {
          const settings = [t[0], t[1], t[2]]
          const others = [0, 1, 2]
            .filter(p => p !== party)
            .map(p => o[p]![settings[p]!]!) as [Hermitian3, Hermitian3]
          const c = contract(rho, party, others)
          const s = settings[party]!

          x[s] = add(x[s]!, c, t[3])
        }

        o[party] = [signOf(x[0]!), signOf(x[1]!)]

        if (party === 2) {
          const next =
            traceWith(o[2]![0]!, x[0]!) + traceWith(o[2]![1]!, x[1]!)

          if (Math.abs(next - value) < 1e-13) {
            value = next
            step = steps
            break
          }

          value = next
        }
      }
    }

    best = Math.max(best, value)
  }

  return best
}

export type { Hermitian3 }
