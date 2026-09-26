// Reading light out of a link field: the Fourier modes of the flux on a PhotonLattice
// (code/rule/photon-links), their time-averaged correlators, and the frequencies the beat gives them.
//
// A mode n (integers, one per lattice coordinate) has the wave vector k = (2 pi / side) W n, W the lattice's
// `wave` matrix, and its phase at dock x is 2 pi n . c(x) / side, c the dock's integer coordinates. A link
// field is read at the link's midpoint, x + e_a / 2, so each mode is one complex number per link direction:
// a vector of length F (12 on the D4 box, 3 on the cubic torus).
//
// The frequencies come from the dynamics, not from a formula. For a field that oscillates in time at omega,
// the beat-to-beat change D(t) = E(t) - E(t - 1) of its Fourier amplitude has |D|^2 = 4 sin^2(omega / 2) |E|^2
// averaged over time, whatever the mix of standing and travelling waves. So with C0 = <E E^dagger> and
// C1 = <D D^dagger>, averaged over beats, the generalized eigenproblem C1 v = mu C0 v gives mu = 4 sin^2(omega /
// 2) for each independent motion. Directions where C0 vanishes are those the flux never takes: the
// longitudinal one, exactly, where Gauss's law pins the flux.
//
// The linear wave operator, the curl-curl matrix M(k) of the plaquettes, is here too: the prediction a
// measured frequency is compared with, 4 sin^2(omega / 2) = kappa lambda(k), kappa = 2 pi K / N.

import { makeComplexMatrix, type ComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { type PhotonLattice } from '@/code/rule/photon-links'

// The eigen decomposition of a Hermitian matrix, safe at degenerate eigenvalues. This was a local complex
// Gram-Schmidt over every real column of the embedding, written when a photon triplet of the D4 curl-curl
// operator came back from eigHermitian with rank 2 (E-FRC-0178). eigHermitian now completes every degenerate
// eigenspace itself (code/algebra/linear/eig-hermitian, witness E-MTH-0011), so this is that one solver. On
// all 320 curl-curl matrices of the side-4 D4 and cubic boxes the two agree to 2e-14 in the eigenvalues
// and 1.2e-12 in each eigenspace's projector (tmp/probe-photon-eigen.ts, 2026-09-25).
export function hermitianEigen(matrix: ComplexMatrix): { values: Float64Array; vectorsRe: Float64Array; vectorsIm: Float64Array } {
  return eigHermitian({ matrix })
}

export type ModeVector ={ readonly re: Float64Array; readonly im: Float64Array }

export function waveVector(lattice: PhotonLattice, n: readonly number[]): number[] {
  return lattice.wave.map(row => ((2 * Math.PI) / lattice.side) * row.reduce((s, w, j) => s + w * (n[j] ?? 0), 0))
}

// the phase 2 pi n . c(x) / side of every dock, and k . e_a / 2 for every link direction
function phases(lattice: PhotonLattice, n: readonly number[]): { dock: Float64Array; half: Float64Array } {
  const dock = new Float64Array(lattice.cells)
  const k = waveVector(lattice, n)

  for (let x = 0; x < lattice.cells; x++) {
    let s = 0

    for (let i = 0; i < lattice.dimension; i++) {
      s += (n[i] ?? 0) * (lattice.coordinates[x * lattice.dimension + i] ?? 0)
    }

    dock[x] = (2 * Math.PI * s) / lattice.side
  }

  const half = Float64Array.from(lattice.firsts, d => (lattice.vectors[d] ?? []).reduce((s, e, i) => s + e * (k[i] ?? 0), 0) / 2)

  return { dock, half }
}

export type ModeReader = { readonly n: readonly number[]; read(field: ArrayLike<number>): ModeVector }

// a reader of mode n: sum over links of field e^{-i (k . (x + e_a / 2))}, per link direction
export function modeReader(lattice: PhotonLattice, n: readonly number[]): ModeReader {
  const f = lattice.firsts.length
  const { dock, half } = phases(lattice, n)
  const cos = new Float64Array(lattice.links)
  const sin = new Float64Array(lattice.links)

  for (let x = 0; x < lattice.cells; x++) {
    for (let a = 0; a < f; a++) {
      const phi = (dock[x] ?? 0) + (half[a] ?? 0)

      cos[x * f + a] = Math.cos(phi)
      sin[x * f + a] = -Math.sin(phi)
    }
  }

  return {
    n,
    read(field) {
      const re = new Float64Array(f)
      const im = new Float64Array(f)

      for (let l = 0; l < lattice.links; l++) {
        const v = field[l] ?? 0
        const a = l % f

        re[a] = (re[a] ?? 0) + v * (cos[l] ?? 0)
        im[a] = (im[a] ?? 0) + v * (sin[l] ?? 0)
      }

      return { re, im }
    },
  }
}

// a running sum of v v^dagger
export type Correlator = { readonly size: number; readonly re: Float64Array; readonly im: Float64Array; count: number }

export function makeCorrelator(size: number): Correlator {
  return { size, re: new Float64Array(size * size), im: new Float64Array(size * size), count: 0 }
}

export function accumulate(c: Correlator, v: ModeVector): void {
  const n = c.size

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // v_i conj(v_j)
      c.re[i * n + j] = (c.re[i * n + j] ?? 0) + (v.re[i] ?? 0) * (v.re[j] ?? 0) + (v.im[i] ?? 0) * (v.im[j] ?? 0)
      c.im[i * n + j] = (c.im[i * n + j] ?? 0) + (v.im[i] ?? 0) * (v.re[j] ?? 0) - (v.re[i] ?? 0) * (v.im[j] ?? 0)
    }
  }

  c.count += 1
}

// a running sum of a b^dagger, for lagged correlators
export function accumulateCross(c: Correlator, a: ModeVector, b: ModeVector): void {
  const n = c.size

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      c.re[i * n + j] = (c.re[i * n + j] ?? 0) + (a.re[i] ?? 0) * (b.re[j] ?? 0) + (a.im[i] ?? 0) * (b.im[j] ?? 0)
      c.im[i * n + j] = (c.im[i * n + j] ?? 0) + (a.im[i] ?? 0) * (b.re[j] ?? 0) - (a.re[i] ?? 0) * (b.im[j] ?? 0)
    }
  }

  c.count += 1
}

export function difference(a: ModeVector, b: ModeVector): ModeVector {
  return { re: Float64Array.from(a.re, (x, i) => x - (b.re[i] ?? 0)), im: Float64Array.from(a.im, (x, i) => x - (b.im[i] ?? 0)) }
}

function asMatrix(c: Correlator): ComplexMatrix {
  const m = makeComplexMatrix({ rows: c.size, cols: c.size })

  for (let i = 0; i < c.size * c.size; i++) {
    m.re[i] = (c.re[i] ?? 0) / Math.max(1, c.count)
    m.im[i] = (c.im[i] ?? 0) / Math.max(1, c.count)
  }

  return m
}

export type ModeFrequencies = {
  // omega of each direction the flux takes, ascending
  readonly omega: number[]
  // directions the flux never takes: C0 below `tolerance` times its largest eigenvalue
  readonly nullDirections: number
  // the eigenvalues of C0, ascending, as fractions of the largest
  readonly spread: number[]
}

// C1 v = mu C0 v on the range of C0, mu = 4 sin^2(omega / 2)
//
// With `lag` tau, c1 is instead the lagged correlator <E(t) E(t - tau)^dagger>, whose Hermitian part is
// cos(omega tau) C0 on each motion, so the eigenvalues are cos(omega tau). This reads the frequency from the
// field itself rather than from its beat-to-beat change, which a broadband part of the force inflates
// (E-FRC-0165), and needs omega tau < pi for every branch
export function modeFrequencies(input: { c0: Correlator; c1: Correlator; tolerance?: number; lag?: number }): ModeFrequencies {
  const tolerance = input.tolerance ?? 1e-9
  const size = input.c0.size
  const e0 = hermitianEigen(asMatrix(input.c0))
  const top = Math.max(...Array.from(e0.values).map(Math.abs), 1e-300)
  const keep = Array.from(e0.values, (v, i) => [v, i] as const).filter(([v]) => v > tolerance * top)
  const r = keep.length
  // W = V_r diag(1 / sqrt(lambda)), size x r
  const wRe = new Float64Array(size * r)
  const wIm = new Float64Array(size * r)

  keep.forEach(([v, i], col) => {
    for (let a = 0; a < size; a++) {
      wRe[a * r + col] = (e0.vectorsRe[a * size + i] ?? 0) / Math.sqrt(v)
      wIm[a * r + col] = (e0.vectorsIm[a * size + i] ?? 0) / Math.sqrt(v)
    }
  })

  const c1 = asMatrix(input.c1)
  // T = C1 W, size x r
  const tRe = new Float64Array(size * r)
  const tIm = new Float64Array(size * r)

  for (let a = 0; a < size; a++) {
    for (let col = 0; col < r; col++) {
      let sr = 0
      let si = 0

      for (let b = 0; b < size; b++) {
        const xr = c1.re[a * size + b] ?? 0
        const xi = c1.im[a * size + b] ?? 0
        const yr = wRe[b * r + col] ?? 0
        const yi = wIm[b * r + col] ?? 0

        sr += xr * yr - xi * yi
        si += xr * yi + xi * yr
      }

      tRe[a * r + col] = sr
      tIm[a * r + col] = si
    }
  }

  // M = W^dagger T, r x r
  const m = makeComplexMatrix({ rows: r, cols: r })

  for (let i = 0; i < r; i++) {
    for (let j = 0; j < r; j++) {
      let sr = 0
      let si = 0

      for (let a = 0; a < size; a++) {
        const xr = wRe[a * r + i] ?? 0
        const xi = -(wIm[a * r + i] ?? 0)
        const yr = tRe[a * r + j] ?? 0
        const yi = tIm[a * r + j] ?? 0

        sr += xr * yr - xi * yi
        si += xr * yi + xi * yr
      }

      m.re[i * r + j] = sr
      m.im[i * r + j] = si
    }
  }

  // symmetrize against rounding
  for (let i = 0; i < r; i++) {
    for (let j = i; j < r; j++) {
      const re = ((m.re[i * r + j] ?? 0) + (m.re[j * r + i] ?? 0)) / 2
      const im = ((m.im[i * r + j] ?? 0) - (m.im[j * r + i] ?? 0)) / 2

      m.re[i * r + j] = re
      m.re[j * r + i] = re
      m.im[i * r + j] = im
      m.im[j * r + i] = -im
    }
  }

  const mu = r > 0 ? Array.from(hermitianEigen(m).values) : []
  const omega = mu
    .map(x =>
      input.lag === undefined
        ? 2 * Math.asin(Math.min(1, Math.sqrt(Math.max(0, x)) / 2))
        : Math.acos(Math.max(-1, Math.min(1, x))) / input.lag,
    )
    .sort((a, b) => a - b)

  return {
    omega,
    nullDirections: size - r,
    spread: Array.from(e0.values, v => v / top).sort((a, b) => a - b),
  }
}

// the curl-curl matrix M(k) of the plaquettes on mode n: M_ba = (curl^T curl A)_b at dock 0, for the plane
// wave A on direction a, both read at link midpoints
export function linearWaveMatrix(lattice: PhotonLattice, n: readonly number[]): ComplexMatrix {
  const f = lattice.firsts.length
  const size = lattice.plaquetteSize
  const { dock, half } = phases(lattice, n)
  const m = makeComplexMatrix({ rows: f, cols: f })
  const bRe = new Float64Array(lattice.plaquetteCount)
  const bIm = new Float64Array(lattice.plaquetteCount)
  const outRe = new Float64Array(lattice.links)
  const outIm = new Float64Array(lattice.links)
  const at = (l: number): [number, number] => {
    const phi = (dock[Math.floor(l / f)] ?? 0) + (half[l % f] ?? 0)

    return [Math.cos(phi), Math.sin(phi)]
  }

  for (let a = 0; a < f; a++) {
    bRe.fill(0)
    bIm.fill(0)
    outRe.fill(0)
    outIm.fill(0)

    for (let p = 0; p < lattice.plaquetteCount; p++) {
      for (let j = 0; j < size; j++) {
        const l = lattice.plaquetteLinks[p * size + j] ?? 0

        if (l % f !== a) {
          continue
        }

        const s = lattice.plaquetteSigns[p * size + j] ?? 0
        const [c, sn] = at(l)

        bRe[p] = (bRe[p] ?? 0) + s * c
        bIm[p] = (bIm[p] ?? 0) + s * sn
      }
    }

    for (let p = 0; p < lattice.plaquetteCount; p++) {
      for (let j = 0; j < size; j++) {
        const l = lattice.plaquetteLinks[p * size + j] ?? 0

        if (l >= f) {
          continue
        }

        const s = lattice.plaquetteSigns[p * size + j] ?? 0

        outRe[l] = (outRe[l] ?? 0) + s * (bRe[p] ?? 0)
        outIm[l] = (outIm[l] ?? 0) + s * (bIm[p] ?? 0)
      }
    }

    for (let b = 0; b < f; b++) {
      const [c, sn] = at(b)
      // multiply by e^{-i phase of link b at dock 0}
      const re = (outRe[b] ?? 0) * c + (outIm[b] ?? 0) * sn
      const im = (outIm[b] ?? 0) * c - (outRe[b] ?? 0) * sn

      m.re[b * f + a] = re
      m.im[b * f + a] = im
    }
  }

  return m
}

// the same M(k) from the plaquettes of dock 0 alone, which every lattice here lists first: each gives a row
// c(k), c_a = sum over its links on direction a of orientation * e^{i phase}, and M = sum of c^dagger c
export function plaquetteWaveMatrix(lattice: PhotonLattice, n: readonly number[]): ComplexMatrix {
  const f = lattice.firsts.length
  const size = lattice.plaquetteSize
  const perDock = lattice.plaquetteCount / lattice.cells
  const k = waveVector(lattice, n)
  const half = lattice.firsts.map(d => (lattice.vectors[d] ?? []).reduce((s, e, i) => s + e * (k[i] ?? 0), 0) / 2)
  const m = makeComplexMatrix({ rows: f, cols: f })

  for (let p = 0; p < perDock; p++) {
    const re = new Float64Array(f)
    const im = new Float64Array(f)

    for (let j = 0; j < size; j++) {
      const l = lattice.plaquetteLinks[p * size + j] ?? 0
      const x = Math.floor(l / f)
      const a = l % f

      let s = 0

      for (let i = 0; i < lattice.dimension; i++) {
        s += (n[i] ?? 0) * (lattice.coordinates[x * lattice.dimension + i] ?? 0)
      }

      const phi = (2 * Math.PI * s) / lattice.side + (half[a] ?? 0)
      const sign = lattice.plaquetteSigns[p * size + j] ?? 0

      re[a] = (re[a] ?? 0) + sign * Math.cos(phi)
      im[a] = (im[a] ?? 0) + sign * Math.sin(phi)
    }

    for (let b = 0; b < f; b++) {
      for (let a = 0; a < f; a++) {
        // conj(c_b) c_a
        m.re[b * f + a] = (m.re[b * f + a] ?? 0) + (re[b] ?? 0) * (re[a] ?? 0) + (im[b] ?? 0) * (im[a] ?? 0)
        m.im[b * f + a] = (m.im[b * f + a] ?? 0) + (re[b] ?? 0) * (im[a] ?? 0) - (im[b] ?? 0) * (re[a] ?? 0)
      }
    }
  }

  return m
}

// J^T M^+ J for the current J of a closed path of links (link index, orientation), M^+ the pseudo-inverse of
// the curl-curl operator: summed over every mode, (1 / volume) sum_n J(n)^dagger M(n)^+ J(n). A free
// massless photon at inverse temperature beta gives a Wilson loop <cos(sum of angles)> = exp(-S / (2 beta)),
// in radians, which is the Coulomb shape a measured loop is compared with
export function loopAction(lattice: PhotonLattice, path: readonly (readonly [number, number])[]): number {
  const f = lattice.firsts.length
  const volume = lattice.cells
  const dim = lattice.dimension

  let total = 0

  for (let i = 0; i < volume; i++) {
    const n = Array.from({ length: dim }, (_, j) => Math.floor(i / lattice.side ** j) % lattice.side)
    const k = waveVector(lattice, n)
    const half = lattice.firsts.map(d => (lattice.vectors[d] ?? []).reduce((s, e, j) => s + e * (k[j] ?? 0), 0) / 2)
    const jRe = new Float64Array(f)
    const jIm = new Float64Array(f)

    for (const [l, sign] of path) {
      const x = Math.floor(l / f)
      const a = l % f

      let s = 0

      for (let j = 0; j < dim; j++) {
        s += (n[j] ?? 0) * (lattice.coordinates[x * dim + j] ?? 0)
      }

      const phi = (2 * Math.PI * s) / lattice.side + (half[a] ?? 0)

      jRe[a] = (jRe[a] ?? 0) + sign * Math.cos(phi)
      jIm[a] = (jIm[a] ?? 0) - sign * Math.sin(phi)
    }

    const eig = hermitianEigen(plaquetteWaveMatrix(lattice, n))

    for (let e = 0; e < f; e++) {
      const lambda = eig.values[e] ?? 0

      if (lambda < 1e-9) {
        continue
      }

      // |v^dagger J|^2 / lambda
      let re = 0
      let im = 0

      for (let a = 0; a < f; a++) {
        const vr = eig.vectorsRe[a * f + e] ?? 0
        const vi = eig.vectorsIm[a * f + e] ?? 0

        re += vr * (jRe[a] ?? 0) + vi * (jIm[a] ?? 0)
        im += vr * (jIm[a] ?? 0) - vi * (jRe[a] ?? 0)
      }

      total += (re * re + im * im) / lambda
    }
  }

  return total / volume
}

// the eigenvalues of M(k), ascending
export function linearWaveEigenvalues(lattice: PhotonLattice, n: readonly number[]): number[] {
  return Array.from(hermitianEigen(plaquetteWaveMatrix(lattice, n)).values).sort((a, b) => a - b)
}

// the leapfrog frequency of a curl-curl eigenvalue: 4 sin^2(omega / 2) = kappa lambda, NaN past stability
export function leapfrogOmega(kappa: number, lambda: number): number {
  const s = Math.sqrt(Math.max(0, kappa * lambda)) / 2

  return s <= 1 ? 2 * Math.asin(s) : Number.NaN
}
