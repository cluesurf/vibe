// Coherent plane waves through a U(1) link sector, launched from the exact linear symbol
// (code/measure/photon-symbol) and read back one mode at a time: the protocol of E-FRC-0180 B, shared by
// E-FRC-0181.
//
// A wave is a standing wave Re(v e^(i phase)) of one symbol eigenvector v, scaled so its largest plaquette
// |B| is a target and rounded to integer angles, with the flux 0. Its frequency is read by the three-point
// recurrence on the flux projected onto v's dual: x_(t+1) + x_(t-1) = 2 cos(omega) x_t holds exactly for one
// leapfrog block, so on the linear rule the reading is the symbol's omega to rounding.
//
// The husk read. The husk field of a depth-even bulk vector v = P^T G^(-1/2) u (u an eigenvector of the
// Hermitian husk symbol, G the husk weights) is P v = G^(1/2) u, so the amplitude of u in a husk field h is
// u^dagger G^(-1/2) h: the husk branches are orthogonal in the 1 / w metric. E-FRC-0180 read with P v itself
// (the Euclidean product) and its linear control missed by 2.1e-5 for that reason. `huskPhotons` returns the
// dual G^(-1/2) u.

import { modeReader, plaquetteWaveMatrix } from '@/code/measure/photon-modes'
import { bulkModeOfHusk, HUSK_VECTORS, HUSK_WEIGHTS, type Husk } from '@/code/measure/photon-husk'
import { centered, eigenvalues, eigenvector, huskSymbol, leapfrogBlock, liftEven } from '@/code/measure/photon-symbol'
import { type PhotonLattice } from '@/code/rule/photon-links'

export type WaveVector = { re: Float64Array; im: Float64Array }

const modulo = (x: number, m: number): number => ((x % m) + m) % m
const symmetricRound = (x: number): number => Math.sign(x) * Math.round(Math.abs(x))

// the phase of every bulk link for the bulk mode n: 2 pi n . c / side + k . r_a / 2
export function bulkPhase(bulk: PhotonLattice, n: readonly number[]): Float64Array {
  const f = bulk.firsts.length
  const k = bulk.wave.map(row => ((2 * Math.PI) / bulk.side) * row.reduce((s, w, j) => s + w * (n[j] ?? 0), 0))
  const half = bulk.firsts.map(d => (bulk.vectors[d] ?? []).reduce((s, e, i) => s + e * (k[i] ?? 0), 0) / 2)
  const out = new Float64Array(bulk.links)

  for (let x = 0; x < bulk.cells; x++) {
    let s = 0

    for (let i = 0; i < bulk.dimension; i++) {
      s += (n[i] ?? 0) * (bulk.coordinates[x * bulk.dimension + i] ?? 0)
    }

    for (let a = 0; a < f; a++) {
      out[x * f + a] = (2 * Math.PI * s) / bulk.side + (half[a] ?? 0)
    }
  }

  return out
}

// the phase of every bulk link for the husk mode m, from the husk coordinates alone, so that it is exactly
// the same on a link and its depth mirror: 2 pi (m . y + m . u_a / 2) / side
export function huskPhase(husk: Husk, m: readonly number[]): Float64Array {
  const bulk = husk.bulk
  const f = bulk.firsts.length
  const side = husk.side
  const out = new Float64Array(bulk.links)

  for (let x = 0; x < bulk.cells; x++) {
    const col = husk.column[x] ?? 0
    const y = [col % side, Math.floor(col / side) % side, Math.floor(col / (side * side))]

    for (let a = 0; a < f; a++) {
      const u = HUSK_VECTORS[husk.shadow[a] ?? 0] ?? [0, 0, 0]
      const s = (m[0] ?? 0) * (2 * (y[0] ?? 0) + (u[0] ?? 0)) + (m[1] ?? 0) * (2 * (y[1] ?? 0) + (u[1] ?? 0)) + (m[2] ?? 0) * (2 * (y[2] ?? 0) + (u[2] ?? 0))

      out[x * f + a] = (Math.PI * s) / side
    }
  }

  return out
}

export type Launch = { angle: Int32Array; amplitude: number; peak: number }

// integer angles of the standing wave Re(v e^(i phase)), scaled so its largest unrounded plaquette |B| is
// `target`, rounded symmetrically, mod n; `peak` is the largest centered |B| after rounding
export function launchWave(input: { lattice: PhotonLattice; n: number; phase: Float64Array; v: WaveVector; target: number }): Launch {
  const { lattice, n, phase, v } = input
  const f = lattice.firsts.length
  const size = lattice.plaquetteSize
  const wave = Float64Array.from(phase, (phi, l) => (v.re[l % f] ?? 0) * Math.cos(phi) - (v.im[l % f] ?? 0) * Math.sin(phi))
  const curl = (field: ArrayLike<number>, p: number): number => {
    let b = 0

    for (let j = 0; j < size; j++) {
      b += (lattice.plaquetteSigns[p * size + j] ?? 0) * (field[lattice.plaquetteLinks[p * size + j] ?? 0] ?? 0)
    }

    return b
  }

  let top = 0

  for (let p = 0; p < lattice.plaquetteCount; p++) {
    top = Math.max(top, Math.abs(curl(wave, p)))
  }

  const amplitude = input.target / top
  const angle = Int32Array.from(wave, w => modulo(symmetricRound(amplitude * w), n))

  let peak = 0

  for (let p = 0; p < lattice.plaquetteCount; p++) {
    peak = Math.max(peak, Math.abs(centered(curl(angle, p), n)))
  }

  return { angle, amplitude, peak }
}

// cos omega = Re sum conj(x_t)(x_(t+1) + x_(t-1)) / (2 sum |x_t|^2) over t = 1 .. T - 1, with x_0 the reading
// before the first beat
export function threePoint(series: readonly (readonly [number, number])[]): number {
  let num = 0
  let den = 0

  for (let t = 1; t + 1 < series.length; t++) {
    const [a, b] = series[t] ?? [0, 0]
    const [c, d] = series[t + 1] ?? [0, 0]
    const [e, g] = series[t - 1] ?? [0, 0]

    num += a * (c + e) + b * (d + g)
    den += 2 * (a * a + b * b)
  }

  return den > 0 ? Math.acos(Math.max(-1, Math.min(1, num / den))) : 0
}

// the first zero of the autocorrelation of a complex series, interpolated, NaN if none within maxLag
export function autocorrelationFirstZero(series: readonly (readonly number[])[], maxLag: number): number {
  const r = (tau: number): number => {
    let sum = 0

    for (let t = 0; t + tau < series.length; t++) {
      sum += (series[t + tau]?.[0] ?? 0) * (series[t]?.[0] ?? 0) + (series[t + tau]?.[1] ?? 0) * (series[t]?.[1] ?? 0)
    }

    return sum / Math.max(1, series.length - tau)
  }

  let previous = r(0)

  for (let tau = 1; tau <= maxLag; tau++) {
    const value = r(tau)

    if (value <= 0) {
      return tau - 1 + previous / (previous - value)
    }

    previous = value
  }

  return Number.NaN
}

// one photon: the bulk vector to launch, the dual to read with (on the read lattice), its symbol lambda and
// its omega at the given coupling
export type Photon = { v: WaveVector; read: WaveVector; lambda: number; omega: number }

// the depth-even photons of the husk mode m (ranks 1 and 2 of the Hermitian husk symbol), read on the husk
// with the dual G^(-1/2) u
export function huskPhotons(husk: Husk, m: readonly number[], kappa: number): Photon[] {
  const symbol = huskSymbol(husk, plaquetteWaveMatrix(husk.bulk, bulkModeOfHusk(m)))

  return [1, 2].map(rank => {
    const e = eigenvector(symbol.hermitian, rank)
    const scale = (h: number): number => 1 / Math.sqrt(HUSK_WEIGHTS[h] ?? 1)

    return {
      v: liftEven(husk, e.re, e.im),
      read: { re: Float64Array.from(e.re, (x, h) => x * scale(h)), im: Float64Array.from(e.im, (x, h) => x * scale(h)) },
      lambda: e.value,
      omega: leapfrogBlock(kappa, e.value).omega,
    }
  })
}

// the bulk photons of the bulk mode n (ranks 1 to 3 of M), read on the bulk with themselves
export function bulkPhotons(bulk: PhotonLattice, n: readonly number[], kappa: number): Photon[] {
  const matrix = plaquetteWaveMatrix(bulk, n)
  const values = eigenvalues(matrix)

  return [1, 2, 3].map(rank => {
    const e = eigenvector(matrix, rank)

    return { v: { re: e.re, im: e.im }, read: { re: e.re, im: e.im }, lambda: values[rank] ?? 0, omega: leapfrogBlock(kappa, values[rank] ?? 0).omega }
  })
}

// x = sum over directions of conj(read_a) times mode n of `field`, on the read lattice
export function modeProjector(lattice: PhotonLattice, n: readonly number[], read: WaveVector): (field: ArrayLike<number>) => [number, number] {
  const reader = modeReader(lattice, n)

  return field => {
    const r = reader.read(field)

    let re = 0
    let im = 0

    for (let a = 0; a < r.re.length; a++) {
      re += (read.re[a] ?? 0) * (r.re[a] ?? 0) + (read.im[a] ?? 0) * (r.im[a] ?? 0)
      im += (read.re[a] ?? 0) * (r.im[a] ?? 0) - (read.im[a] ?? 0) * (r.re[a] ?? 0)
    }

    return [re, im]
  }
}
