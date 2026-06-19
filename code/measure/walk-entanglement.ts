// Entanglement entropy from the knit's OWN coined Dirac walk, not a Hamiltonian proxy. The directional knit's
// single-particle sector is a 2-component coined walk (relativity/dirac-from-discrete, P230) whose momentum-space
// step is the unitary U(k) = Shift(k) Coin(theta), Shift(k) = diag(e^{ik}, e^{-ik}), Coin(theta) the rotation by
// the emergent mass theta, with the Dirac dispersion cos E = cos(theta) cos(k). Filling the lower Floquet band
// gives a many-body state whose real-space two-component correlation matrix yields the entanglement entropy of an
// interval, the SAME free-fermion correlation-matrix method, but on the knit's own evolution operator. A massive
// (gapped) walk gives a SATURATING entropy (the area law), a gapless walk gives a GROWING entropy. So the area law
// is read off the knit's own dynamics.

import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

type Cx = [number, number]
const cMul = (a: Cx, b: Cx): Cx => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]
const cAdd = (a: Cx, b: Cx): Cx => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: Cx, b: Cx): Cx => [a[0] - b[0], a[1] - b[1]]
const cScale = (a: Cx, s: number): Cx => [a[0] * s, a[1] * s]
const cDiv = (x: Cx, d: Cx): Cx => {
  const dd = d[0] * d[0] + d[1] * d[1]

  return [
    (x[0] * d[0] + x[1] * d[1]) / dd,
    (x[1] * d[0] - x[0] * d[1]) / dd,
  ]
}

// the projector onto the lower Floquet band of the coined Dirac walk at momentum k, P_-(k) = (U(k) - e^{iE} I) /
// (e^{-iE} - e^{iE}), a 2x2 complex Hermitian projector. Singular exactly at the gapless band touchings (sin E = 0),
// so a gapless walk must be probed at a small nonzero mass.
function lowerBandProjector(theta: number, k: number): Cx[][] {
  const ck = Math.cos(k)
  const sk = Math.sin(k)
  const ct = Math.cos(theta)
  const st = Math.sin(theta)
  const eik: Cx = [ck, sk]
  const emik: Cx = [ck, -sk]
  const u: Cx[][] = [
    [cMul(eik, [ct, 0]), cMul(eik, [-st, 0])],
    [cMul(emik, [st, 0]), cMul(emik, [ct, 0])],
  ]
  const cosE = ct * ck
  const sinE = Math.sqrt(Math.max(0, 1 - cosE * cosE))
  const eiE: Cx = [cosE, sinE]
  const denom: Cx = [0, -2 * sinE]
  const p: Cx[][] = [
    [
      [0, 0],
      [0, 0],
    ],
    [
      [0, 0],
      [0, 0],
    ],
  ]
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      const num = cSub(u[a]![b]!, a === b ? eiE : [0, 0])
      p[a]![b] = cDiv(num, denom)
    }
  }

  return p
}

// the real-space two-component correlation matrix C(d) = (1/N) sum_k P_-(k) e^{ikd} of the filled lower band
function correlation(
  theta: number,
  momentumCount: number,
  d: number,
): Cx[][] {
  const out: Cx[][] = [
    [
      [0, 0],
      [0, 0],
    ],
    [
      [0, 0],
      [0, 0],
    ],
  ]
  for (let n = 0; n < momentumCount; n++) {
    const k = (2 * Math.PI * n) / momentumCount
    const p = lowerBandProjector(theta, k)
    const phase: Cx = [Math.cos(k * d), Math.sin(k * d)]
    for (let a = 0; a < 2; a++) {
      for (let b = 0; b < 2; b++) {
        out[a]![b] = cAdd(out[a]![b]!, cMul(p[a]![b]!, phase))
      }
    }
  }

  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      out[a]![b] = cScale(out[a]![b]!, 1 / momentumCount)
    }
  }

  return out
}

// the entanglement entropy (nats) of an interval of `intervalLength` sites for the coined Dirac walk of mass
// `theta`, summed over `momentumCount` momenta. Builds the Hermitian two-component correlation matrix, real-embeds
// it to a symmetric matrix (each eigenvalue doubled), and sums the single-mode binary entropies.
export function coinedWalkIntervalEntropy(input: {
  theta: number
  momentumCount: number
  intervalLength: number
}): number {
  const { theta, momentumCount, intervalLength: length } = input
  const m = 2 * length
  const real = new Float64Array(m * m)
  const imag = new Float64Array(m * m)
  const cache = new Map<number, Cx[][]>()
  const corrAt = (d: number): Cx[][] => {
    const key = ((d % momentumCount) + momentumCount) % momentumCount
    let value = cache.get(key)
    if (!value) {
      value = correlation(theta, momentumCount, d)
      cache.set(key, value)
    }

    return value
  }

  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
      const c = corrAt(i - j)
      for (let a = 0; a < 2; a++) {
        for (let b = 0; b < 2; b++) {
          real[(i * 2 + a) * m + (j * 2 + b)] = c[a]![b]![0]
          imag[(i * 2 + a) * m + (j * 2 + b)] = c[a]![b]![1]
        }
      }
    }
  }

  // real embedding [[A, -B], [B, A]] of the Hermitian matrix A + iB, eigenvalues are each true eigenvalue twice
  const embedded = makeDense({ rows: 2 * m, cols: 2 * m })
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      embedded.data[i * 2 * m + j] = real[i * m + j]!
      embedded.data[(i + m) * 2 * m + (j + m)] = real[i * m + j]!
      embedded.data[i * 2 * m + (j + m)] = -imag[i * m + j]!
      embedded.data[(i + m) * 2 * m + j] = imag[i * m + j]!
    }
  }

  const values = eigSymmetric({ matrix: embedded }).values
  let entropy = 0
  for (const value of values) {
    const z = Math.min(1 - 1e-12, Math.max(1e-12, value ?? 0))
    entropy -= z * Math.log(z) + (1 - z) * Math.log(1 - z)
  }

  return entropy / 2
}
