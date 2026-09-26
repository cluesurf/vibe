// Two STAND-IN electrons with the doublet label, in a basis of lattice orbitals on the husk: the model's exclusion
// as a null space, not an antisymmetrizer. Built for E-MTR-0019.
//
// E-MTR-0018 found what the slot keeps for two moving tokens: with each label component its own slot, and the label
// turned by the motion along every husk axis (the locked token), every antisymmetric state is kept and the kept
// symmetric states are those that never meet. Here the same rule is put on two stand-ins in K lattice orbitals
// phi_a with a two-valued label s: a two-electron state c_(as, bt) is KEPT when its amplitude on two electrons at
// one dock in one label state vanishes, for every label state c of the three frames the motion turns it through
// (up / down, and the two diagonals, whose c x c span the label's symmetric part):
//
//   A_c(x) = sum over a, b, s, t of c_(as, bt) phi_a(x) phi_b(x) <c|s> <c|t> = 0 at every dock x.
//
// These are linear conditions, gathered as the null space of the positive form Q = sum over c and x of |A_c(x)|^2,
// which needs only the overlaps G_(ab, a'b') = sum over x of phi_a phi_b phi_a' phi_b'. Nothing imposes an exchange
// symmetry; which exchange sectors the null space holds is read afterwards. The two-electron Hamiltonian
// H = h(1) + h(2) + (ac|bd) is label-blind, so it is restricted to the kept space and diagonalized.
//
// A stand-in is not the electron: the orbitals are eigenstates of the band-projected stand-in on the husk
// (code/measure/standin-chemistry), and the label is the doublet by E-SPN-0066, not produced by a rule run here.

import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

// the overlaps of orbital products, G_(ab, cd) = sum over x of phi_a phi_b phi_c phi_d, as a K^4 table
export function productOverlaps(orbitals: readonly Float64Array[]): Float64Array {
  const k = orbitals.length
  const size = orbitals[0]?.length ?? 0
  const pairs: [number, number][] = []

  for (let a = 0; a < k; a++) {
    for (let b = a; b < k; b++) {
      pairs.push([a, b])
    }
  }

  const products = pairs.map(([a, b]) => {
    const u = orbitals[a] as Float64Array
    const v = orbitals[b] as Float64Array
    const p = new Float64Array(size)

    for (let x = 0; x < size; x++) {
      p[x] = (u[x] as number) * (v[x] as number)
    }

    return p
  })
  const table = new Float64Array(k ** 4)

  pairs.forEach(([a, b], p) => {
    pairs.forEach(([c, d], q) => {
      if (q < p) {
        return
      }

      const u = products[p] as Float64Array
      const v = products[q] as Float64Array

      let s = 0

      for (let x = 0; x < size; x++) {
        s += (u[x] as number) * (v[x] as number)
      }

      for (const [i, j] of [
        [a, b],
        [b, a],
      ] as const) {
        for (const [m, n] of [
          [c, d],
          [d, c],
        ] as const) {
          table[((i * k + j) * k + m) * k + n] = s
          table[((m * k + n) * k + i) * k + j] = s
        }
      }
    })
  })

  return table
}

// the label states of the three frames, real: up, down, and the two diagonals
const FRAMES: readonly (readonly [number, number])[] = [
  [1, 0],
  [0, 1],
  [Math.SQRT1_2, Math.SQRT1_2],
  [Math.SQRT1_2, -Math.SQRT1_2],
]

// index of the two-electron basis state (a, s; b, t): ((a 2 + s) 2K + (b 2 + t))
export const pairIndex = (k: number, a: number, s: number, b: number, t: number): number => (a * 2 + s) * (2 * k) + (b * 2 + t)

export type KeptTwoBody = {
  readonly k: number
  // an orthonormal basis of the kept space, as columns of length (2K)^2
  readonly basis: Float64Array[]
  // the eigenvalues of Q, ascending, and the threshold that split kept from removed
  readonly formValues: number[]
  readonly threshold: number
  // how many antisymmetric and symmetric directions the kept space holds, and each sector's dimension
  readonly antisymmetricKept: number
  readonly symmetricKept: number
  readonly antisymmetricDimension: number
  readonly symmetricDimension: number
  // the kept space split by the exchange: the Hamiltonian commutes with it, so each part is diagonalized alone and
  // a level's exchange sign is exact even inside a degenerate multiplet
  readonly antisymmetricBasis: Float64Array[]
  readonly symmetricBasis: Float64Array[]
}

// the exchange of the two electrons on a coefficient vector
export function exchangePair(k: number, v: Float64Array): Float64Array {
  const out = new Float64Array(v.length)

  for (let a = 0; a < k; a++) {
    for (let s = 0; s < 2; s++) {
      for (let b = 0; b < k; b++) {
        for (let t = 0; t < 2; t++) {
          out[pairIndex(k, a, s, b, t)] = v[pairIndex(k, b, t, a, s)] as number
        }
      }
    }
  }

  return out
}

// the kept space of the exclusion in every frame, as the null space of Q
export function keptTwoBody(input: { k: number; overlaps: Float64Array; relative?: number }): KeptTwoBody {
  const { k, overlaps } = input
  const n = (2 * k) ** 2
  const q = new Float64Array(n * n)

  // Q = sum over frames c of M_c^T G M_c, with (M_c v)_(ab) = sum over s, t of v_(as, bt) c_s c_t
  for (const c of FRAMES) {
    const w = [0, 1].map(s => [0, 1].map(t => (c[s] as number) * (c[t] as number)))

    for (let a = 0; a < k; a++) {
      for (let b = 0; b < k; b++) {
        for (let a2 = 0; a2 < k; a2++) {
          for (let b2 = 0; b2 < k; b2++) {
            const g = overlaps[((a * k + b) * k + a2) * k + b2] as number

            if (g === 0) {
              continue
            }

            for (let s = 0; s < 2; s++) {
              for (let t = 0; t < 2; t++) {
                const left = (w[s] as number[])[t] as number

                if (left === 0) {
                  continue
                }

                for (let s2 = 0; s2 < 2; s2++) {
                  for (let t2 = 0; t2 < 2; t2++) {
                    const right = (w[s2] as number[])[t2] as number

                    const at = pairIndex(k, a, s, b, t) * n + pairIndex(k, a2, s2, b2, t2)

                    q[at] = (q[at] as number) + left * right * g
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const eig = eigSymmetric({ matrix: { form: 'dense', rows: n, cols: n, data: q } })
  const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => (eig.values[i] as number) - (eig.values[j] as number))
  const values = order.map(i => eig.values[i] as number)
  const top = Math.max(...values.map(Math.abs))
  const threshold = (input.relative ?? 1e-10) * top
  const basis = order
    .filter(i => Math.abs(eig.values[i] as number) <= threshold)
    .map(i => Float64Array.from({ length: n }, (_, r) => eig.vectors[r * n + i] as number))

  // the exchange sectors inside the kept space: eigenvalues of the exchange restricted to it
  const m = basis.length
  const x = new Float64Array(m * m)

  basis.forEach((u, i) => {
    const xu = exchangePair(k, u)

    basis.forEach((v, j) => {
      let s = 0

      for (let r = 0; r < n; r++) {
        s += (v[r] as number) * (xu[r] as number)
      }

      x[j * m + i] = s
    })
  })

  const xe = m > 0 ? eigSymmetric({ matrix: { form: 'dense', rows: m, cols: m, data: x } }) : { values: new Float64Array(0), vectors: new Float64Array(0) }
  const xs = Array.from(xe.values)
  const antisymmetricDimension = ((2 * k) * (2 * k - 1)) / 2
  const symmetricDimension = n - antisymmetricDimension
  // the kept space rotated onto the exchange's eigenvectors, split by sign
  const rotated = (want: (v: number) => boolean): Float64Array[] =>
    xs
      .map((v, i) => ({ v, i }))
      .filter(e => want(e.v))
      .map(({ i }) => {
        const out = new Float64Array(n)

        for (let j = 0; j < m; j++) {
          const c = xe.vectors[j * m + i] as number
          const u = basis[j] as Float64Array

          for (let r = 0; r < n; r++) {
            out[r] = (out[r] as number) + c * (u[r] as number)
          }
        }

        return out
      })

  return {
    k,
    basis,
    formValues: values,
    threshold,
    antisymmetricKept: xs.filter(v => v < -0.5).length,
    symmetricKept: xs.filter(v => v > 0.5).length,
    antisymmetricDimension,
    symmetricDimension,
    antisymmetricBasis: rotated(v => v < -0.5),
    symmetricBasis: rotated(v => v > 0.5),
  }
}

// the label-blind two-electron Hamiltonian in the (2K)^2 basis, from orbital energies and the exact integrals
// (ac|bd) of code/measure/standin-chemistry pairIntegrals: H_(as bt),(cs' dt') = [s = s'][t = t'] (h_ac [b = d] +
// [a = c] h_bd + (ac|bd)), the orbitals being eigenstates of h
export function labeledHamiltonian(input: { k: number; oneBody: readonly number[]; integrals: Float64Array }): Float64Array {
  const { k, oneBody, integrals } = input
  const n = (2 * k) ** 2
  const h = new Float64Array(n * n)

  for (let a = 0; a < k; a++) {
    for (let b = 0; b < k; b++) {
      for (let c = 0; c < k; c++) {
        for (let d = 0; d < k; d++) {
          let value = integrals[((a * k + c) * k + b) * k + d] as number

          if (a === c && b === d) {
            value += (oneBody[a] as number) + (oneBody[b] as number)
          }

          for (let s = 0; s < 2; s++) {
            for (let t = 0; t < 2; t++) {
              h[pairIndex(k, a, s, b, t) * n + pairIndex(k, c, s, d, t)] = value
            }
          }
        }
      }
    }
  }

  return h
}

export type Level = {
  readonly energy: number
  readonly vector: Float64Array
  // <X>: +1 symmetric, -1 antisymmetric under the exchange
  readonly exchange: number
  // the label's total spin, from <S^2> = s (s + 1): 0 singlet, 1 triplet
  readonly spin: number
}

// the spectrum of H restricted to the kept space, each exchange sector on its own, each level with its exchange and
// label spin, all levels in ascending order
export function keptSpectrum(input: { k: number; kept: KeptTwoBody; hamiltonian: Float64Array }): Level[] {
  const { k, kept, hamiltonian } = input

  return [...sectorSpectrum(k, kept.antisymmetricBasis, hamiltonian), ...sectorSpectrum(k, kept.symmetricBasis, hamiltonian)].sort((a, b) => a.energy - b.energy)
}

function sectorSpectrum(k: number, basis: readonly Float64Array[], hamiltonian: Float64Array): Level[] {
  const n = (2 * k) ** 2
  const m = basis.length
  const kept = { basis }

  if (m === 0) {
    return []
  }

  const hv = kept.basis.map(v => {
    const out = new Float64Array(n)

    for (let r = 0; r < n; r++) {
      let s = 0

      for (let c = 0; c < n; c++) {
        const hrc = hamiltonian[r * n + c] as number

        if (hrc !== 0) {
          s += hrc * (v[c] as number)
        }
      }

      out[r] = s
    }

    return out
  })
  const small = new Float64Array(m * m)

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      let s = 0

      for (let r = 0; r < n; r++) {
        s += ((kept.basis[i] as Float64Array)[r] as number) * ((hv[j] as Float64Array)[r] as number)
      }

      small[i * m + j] = s
    }
  }

  for (let i = 0; i < m; i++) {
    for (let j = i + 1; j < m; j++) {
      const avg = ((small[i * m + j] as number) + (small[j * m + i] as number)) / 2

      small[i * m + j] = avg
      small[j * m + i] = avg
    }
  }

  const eig = eigSymmetric({ matrix: { form: 'dense', rows: m, cols: m, data: small } })

  return Array.from({ length: m }, (_, i) => i)
    .sort((i, j) => (eig.values[i] as number) - (eig.values[j] as number))
    .map(i => {
      const vector = new Float64Array(n)

      for (let j = 0; j < m; j++) {
        const c = eig.vectors[j * m + i] as number
        const u = kept.basis[j] as Float64Array

        for (let r = 0; r < n; r++) {
          vector[r] = (vector[r] as number) + c * (u[r] as number)
        }
      }

      const x = exchangePair(k, vector)
      let exchange = 0

      for (let r = 0; r < n; r++) {
        exchange += (vector[r] as number) * (x[r] as number)
      }

      return { energy: eig.values[i] as number, vector, exchange, spin: labelSpin(k, vector) }
    })
}

// the label's total spin s from <S^2> = s (s + 1), S = S1 + S2 on the two labels
function labelSpin(k: number, v: Float64Array): number {
  // S^2 = 3/2 + 2 S1 . S2, and 2 S1 . S2 = SWAP_label - 1/2
  let swap = 0
  let norm = 0

  for (let a = 0; a < k; a++) {
    for (let b = 0; b < k; b++) {
      for (let s = 0; s < 2; s++) {
        for (let t = 0; t < 2; t++) {
          const here = v[pairIndex(k, a, s, b, t)] as number

          norm += here * here
          swap += here * (v[pairIndex(k, a, t, b, s)] as number)
        }
      }
    }
  }

  const s2 = 1.5 + (swap / norm - 0.5)

  return (-1 + Math.sqrt(1 + 4 * s2)) / 2
}

// the interior minimum of E(R) by the parabola through the lowest sampled point and its neighbors
export function parabolaMinimum(r: readonly number[], e: readonly number[]): { r: number; energy: number; interior: boolean } {
  const i = e.indexOf(Math.min(...e))

  if (i <= 0 || i >= e.length - 1) {
    return { r: r[i] ?? Number.NaN, energy: e[i] ?? Number.NaN, interior: false }
  }

  const [x0, x1, x2] = [r[i - 1] as number, r[i] as number, r[i + 1] as number]
  const [y0, y1, y2] = [e[i - 1] as number, e[i] as number, e[i + 1] as number]
  const denominator = (x0 - x1) * (x0 - x2) * (x1 - x2)
  const a = (x2 * (y1 - y0) + x1 * (y0 - y2) + x0 * (y2 - y1)) / denominator
  const b = (x2 * x2 * (y0 - y1) + x1 * x1 * (y2 - y0) + x0 * x0 * (y1 - y2)) / denominator
  const c = (x1 * x2 * (x1 - x2) * y0 + x2 * x0 * (x2 - x0) * y1 + x0 * x1 * (x0 - x1) * y2) / denominator

  return { r: -b / (2 * a), energy: c - (b * b) / (4 * a), interior: true }
}

// the chance the two electrons of a kept state share a dock: sum over x of the pair density at (x, x)
export function contactChance(input: { k: number; vector: Float64Array; overlaps: Float64Array }): number {
  const { k, vector, overlaps } = input
  let s = 0

  // sum over s, t of sum_x |sum_ab c_(as,bt) phi_a phi_b|^2
  for (let si = 0; si < 2; si++) {
    for (let ti = 0; ti < 2; ti++) {
      for (let a = 0; a < k; a++) {
        for (let b = 0; b < k; b++) {
          const u = vector[pairIndex(k, a, si, b, ti)] as number

          if (u === 0) {
            continue
          }

          for (let c = 0; c < k; c++) {
            for (let d = 0; d < k; d++) {
              s += u * (vector[pairIndex(k, c, si, d, ti)] as number) * (overlaps[((a * k + b) * k + c) * k + d] as number)
            }
          }
        }
      }
    }
  }

  return s
}
