// THE EIGENPHASES OF A UNITARY INSIDE A WINDOW, FROM ONE AUTOCORRELATION (FILTER DIAGONALIZATION, E-MTR-0030).
//
// For a unitary U (in any inner product) and a start r, the autocorrelation x_l = <r | U^l r> holds everything a
// Rayleigh-Ritz solve on the Krylov space of r needs, since x_(-l) is the conjugate of x_l. The basis is J filtered
// states phi_j = sum_(t < S) a_j(t) U^t r, a_j(t) = w(t) e^(-i theta_j t), with theta_j a grid over the window and w the
// Blackman-Harris taper, so every phi_j lies in the window. Then
//
//   S_ij = <phi_i | phi_j>     = sum_(s, t) conj(a_i(s)) a_j(t) x_(t - s)
//   M_ij = <phi_i | U phi_j>   = sum_(s, t) conj(a_i(s)) a_j(t) x_(t - s + 1)
//
// and the eigenphases are the generalized eigenvalues M c = z S c (Wall and Neuhauser 1995; Mandelshtam and Taylor
// 1997). S is diagonalized (code/algebra/linear/eig-hermitian-householder), directions below `cutoff` times its largest
// eigenvalue dropped, and the reduced M solved (code/algebra/linear/complex-eigen). A converged line has |z| = 1. Its
// weight in r is |<r | n>|^2 / <n | n>, with <r | phi_j> = sum_t a_j(t) x_t. Unlike a Fourier read, the solve resolves
// lines closer than 2 pi / S as long as the window holds fewer lines than the basis.
//
// The correlation needs x_0 .. x_(2 S - 1). Cost O(J S^2) for the matrices, which is seconds for J 60 and S 4096.
// Measurement only (floats). DETERMINISM: no random numbers.

import {
  complexEigenvalues,
  complexEigenvector,
} from '@/code/algebra/linear/complex-eigen'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'

export type FilterLine = { E: number; modulus: number; weight: number }

const A0 = 0.35875
const A1 = 0.48829
const A2 = 0.14128
const A3 = 0.01168

const taper = (t: number, S: number): number => {
  const x = (2 * Math.PI * t) / (S - 1)

  return A0 - A1 * Math.cos(x) + A2 * Math.cos(2 * x) - A3 * Math.cos(3 * x)
}

export function filterDiagonalize(input: {
  x: { re: ArrayLike<number>; im: ArrayLike<number> }
  lo: number
  hi: number
  basis: number
  length: number
  cutoff?: number
}): FilterLine[] {
  const { x, lo, hi, basis: J, length: S } = input
  const cutoff = input.cutoff ?? 1e-11

  if (x.re.length < 2 * S) {
    throw new Error(`filterDiagonalize: needs ${2 * S} correlation points, has ${x.re.length}`)
  }

  // x_m for m in (-S, S]
  const xr = (m: number): number => (m >= 0 ? x.re[m]! : x.re[-m]!)
  const xi = (m: number): number => (m >= 0 ? x.im[m]! : -x.im[-m]!)
  const theta = Array.from({ length: J }, (_, j) => lo + ((hi - lo) * j) / (J - 1))
  const ar = theta.map(th => Float64Array.from({ length: S }, (_, t) => taper(t, S) * Math.cos(-th * t)))
  const ai = theta.map(th => Float64Array.from({ length: S }, (_, t) => taper(t, S) * Math.sin(-th * t)))
  const Sr = new Float64Array(J * J)
  const Si = new Float64Array(J * J)
  const Mr = new Float64Array(J * J)
  const Mi = new Float64Array(J * J)
  const br = new Float64Array(J)
  const bi = new Float64Array(J)

  for (let j = 0; j < J; j++) {
    // y(s) = sum_t a_j(t) x_(t - s), z(s) = sum_t a_j(t) x_(t - s + 1)
    const yr = new Float64Array(S)
    const yi = new Float64Array(S)
    const zr = new Float64Array(S)
    const zi = new Float64Array(S)
    const pr = ar[j]!
    const pi = ai[j]!

    for (let s = 0; s < S; s++) {
      let a = 0
      let b = 0
      let c = 0
      let d = 0

      for (let t = 0; t < S; t++) {
        const u = pr[t]!
        const v = pi[t]!
        const x1r = xr(t - s)
        const x1i = xi(t - s)
        const x2r = xr(t - s + 1)
        const x2i = xi(t - s + 1)

        a += u * x1r - v * x1i
        b += u * x1i + v * x1r
        c += u * x2r - v * x2i
        d += u * x2i + v * x2r
      }

      yr[s] = a
      yi[s] = b
      zr[s] = c
      zi[s] = d
    }

    for (let i = 0; i < J; i++) {
      const qr = ar[i]!
      const qi = ai[i]!

      let a = 0
      let b = 0
      let c = 0
      let d = 0

      for (let s = 0; s < S; s++) {
        // conj(a_i(s)) * y(s)
        a += qr[s]! * yr[s]! + qi[s]! * yi[s]!
        b += qr[s]! * yi[s]! - qi[s]! * yr[s]!
        c += qr[s]! * zr[s]! + qi[s]! * zi[s]!
        d += qr[s]! * zi[s]! - qi[s]! * zr[s]!
      }

      Sr[i * J + j] = a
      Si[i * J + j] = b
      Mr[i * J + j] = c
      Mi[i * J + j] = d
    }

    let a = 0
    let b = 0

    for (let t = 0; t < S; t++) {
      a += pr[t]! * xr(t) - pi[t]! * xi(t)
      b += pr[t]! * xi(t) + pi[t]! * xr(t)
    }

    br[j] = a
    bi[j] = b
  }

  // symmetrize S against rounding, then its eigenbasis
  for (let i = 0; i < J; i++) {
    for (let j = i; j < J; j++) {
      const re = (Sr[i * J + j]! + Sr[j * J + i]!) / 2
      const im = (Si[i * J + j]! - Si[j * J + i]!) / 2

      Sr[i * J + j] = re
      Si[i * J + j] = im
      Sr[j * J + i] = re
      Si[j * J + i] = -im
    }
  }

  // scale S to unit trace per row first, so the QL shift of 1 is on its scale; scaling S and M together leaves the
  // pencil's eigenvalues unchanged, and B absorbs the scale
  let trace = 0

  for (let i = 0; i < J; i++) {
    trace += Sr[i * J + i]!
  }

  const unit = J / trace

  for (let k = 0; k < J * J; k++) {
    Sr[k] = Sr[k]! * unit
    Si[k] = Si[k]! * unit
    Mr[k] = Mr[k]! * unit
    Mi[k] = Mi[k]! * unit
  }

  const eig = hermitianEigenRows(J, Sr, Si)
  const top = Math.max(...eig.values)
  const keep = [...eig.values]
    .map((v, k) => [v, k] as const)
    .filter(([v]) => v > cutoff * top)
  const K = keep.length
  // B = V Lambda^(-1/2): column q is vector k / sqrt(lambda_k)
  const Br = new Float64Array(J * K)
  const Bi = new Float64Array(J * K)

  keep.forEach(([v, k], q) => {
    const f = 1 / Math.sqrt(v)

    for (let i = 0; i < J; i++) {
      Br[i * K + q] = eig.vectorsRe[k * J + i]! * f
      Bi[i * K + q] = eig.vectorsIm[k * J + i]! * f
    }
  })

  // R = B^dag M B
  const MBr = new Float64Array(J * K)
  const MBi = new Float64Array(J * K)

  for (let i = 0; i < J; i++) {
    for (let q = 0; q < K; q++) {
      let a = 0
      let b = 0

      for (let j = 0; j < J; j++) {
        const mr = Mr[i * J + j]!
        const mi = Mi[i * J + j]!
        const vr = Br[j * K + q]!
        const vi = Bi[j * K + q]!

        a += mr * vr - mi * vi
        b += mr * vi + mi * vr
      }

      MBr[i * K + q] = a
      MBi[i * K + q] = b
    }
  }

  const Rr = new Float64Array(K * K)
  const Ri = new Float64Array(K * K)

  for (let p = 0; p < K; p++) {
    for (let q = 0; q < K; q++) {
      let a = 0
      let b = 0

      for (let i = 0; i < J; i++) {
        const ur = Br[i * K + p]!
        const ui = -Bi[i * K + p]!

        a += ur * MBr[i * K + q]! - ui * MBi[i * K + q]!
        b += ur * MBi[i * K + q]! + ui * MBr[i * K + q]!
      }

      Rr[p * K + q] = a
      Ri[p * K + q] = b
    }
  }

  const ev = complexEigenvalues({ re: Rr, im: Ri, n: K })
  const lines: FilterLine[] = []

  for (let n = 0; n < K; n++) {
    const zr = ev.re[n]!
    const zi = ev.im[n]!
    const E = Math.atan2(zi, zr)

    if (E < lo || E > hi) {
      continue
    }

    // the reduced eigenvector c' (unit in the S metric, since B orthonormalizes), c = B c'
    const v = complexEigenvector({ re: Rr, im: Ri, n: K, value: [zr, zi] })

    let normV = 0

    for (let q = 0; q < K; q++) {
      normV += v.re[q]! ** 2 + v.im[q]! ** 2
    }

    let ovr = 0
    let ovi = 0

    for (let j = 0; j < J; j++) {
      let cr = 0
      let ci = 0

      for (let q = 0; q < K; q++) {
        cr += Br[j * K + q]! * v.re[q]! - Bi[j * K + q]! * v.im[q]!
        ci += Br[j * K + q]! * v.im[q]! + Bi[j * K + q]! * v.re[q]!
      }

      // <r | n> = sum_j c_j <r | phi_j>, <r | phi_j> = b_j
      ovr += br[j]! * cr - bi[j]! * ci
      ovi += br[j]! * ci + bi[j]! * cr
    }

    lines.push({
      E,
      modulus: Math.hypot(zr, zi),
      // <n | n> is normV in the scaled metric, normV / unit in the true one
      weight: ((ovr * ovr + ovi * ovi) * unit) / normV / x.re[0]!,
    })
  }

  return lines.sort((a, b) => a.E - b.E)
}
