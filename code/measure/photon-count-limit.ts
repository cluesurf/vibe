// The finite-state limit of counted light (E-FRC-0204): exact arithmetic on the linear leapfrog at
// kappa = 1/Q, to show which modes a rule with a bounded integer state can carry exactly and which it cannot.
//
// The argument. Any rule whose state is a bounded set of integers has, for any readout that is a fixed
// integer-linear function of the state over a fixed denominator D, a readout in the lattice (1/D) Z^n. If
// that readout obeyed the linear leapfrog T (A <- A + E, E <- E - kappa M A) exactly, its orbit would span a
// T-invariant lattice, so T restricted to the span would have a characteristic polynomial with integer
// coefficients, and for every eigenvalue lambda of M = C^T C present in the orbit, 2 - kappa lambda (the trace
// of the 2 x 2 block) would be an algebraic integer, so kappa lambda would be one. The conjugates of lambda are
// eigenvalues of the integer matrix M, all in [0, lambda_max]. With kappa = 1/Q and Q >= lambda_max every
// conjugate of kappa lambda lies in [0, 1], so its norm has absolute value below 1 unless every conjugate is 1,
// and a nonzero algebraic integer has norm at least 1 in absolute value. So the only modes a bounded integer
// state can shadow exactly are lambda = 0 (gauge and static fields) and lambda = Q (kappa lambda = 1, where the
// block [[1, 1], [-1, 0]] has trace 1 and determinant 1, eigenvalues e^(+-i pi/3), and order 6). At
// Q = 16 = lambda_max that is the gauge and the top of the band.
// Every photon (0 < lambda < 16) is out of reach of an exact shadow, and the best a counter can do is carry
// its remainder: E-FRC-0205's 2^-S.
//
// The measurements, all exact except the spectrum:
// - the spectrum of M over every wave vector of the side 2, 3 and 4 boxes (floating point), and on side 2 the
//   exact integer identity M (M - 4)(M - 8)(M - 12)(M - 16) w = 0, with each factor needed
// - the linear leapfrog run in exact rationals (BigInt numerators over a power of 2) from integer starts, the
//   denominator's exponent per beat: a generic start, and starts projected exactly onto one eigenvalue
//   (integer projectors, products of the other factors M - mu)

import { emptyPhotonState, makePhotonRule, photonLatticeD4, type PhotonLattice } from '@/code/rule/photon-links'
import { linearWaveEigenvalues } from '@/code/measure/photon-modes'
import { centered } from '@/code/measure/photon-symbol'
import type { Start } from '@/code/measure/photon-battery'

// the spectrum of the curl-curl operator over every wave vector of the box
export function boxSpectrum(side: number): { values: number[]; max: number; min: number } {
  const lattice = photonLatticeD4({ side })
  const values: number[] = []

  for (let a = 0; a < side; a++) {
    for (let b = 0; b < side; b++) {
      for (let c = 0; c < side; c++) {
        for (let d = 0; d < side; d++) {
          values.push(...linearWaveEigenvalues(lattice, [a, b, c, d]))
        }
      }
    }
  }

  return { values, max: Math.max(...values), min: Math.min(...values) }
}

// M v = C^T (C v), exact, on bigint link vectors
export function applyCurlCurl(lattice: PhotonLattice, v: readonly bigint[]): bigint[] {
  const size = lattice.plaquetteSize
  const out: bigint[] = Array.from({ length: lattice.links }, () => 0n)

  for (let p = 0, o = 0; p < lattice.plaquetteCount; p++, o += size) {
    let b = 0n

    for (let j = 0; j < size; j++) {
      b += BigInt(lattice.plaquetteSigns[o + j] ?? 0) * (v[lattice.plaquetteLinks[o + j] ?? 0] ?? 0n)
    }

    if (b === 0n) {
      continue
    }

    for (let j = 0; j < size; j++) {
      const l = lattice.plaquetteLinks[o + j] ?? 0

      out[l] = (out[l] ?? 0n) + BigInt(lattice.plaquetteSigns[o + j] ?? 0) * b
    }
  }

  return out
}

// the product of (M - mu) over mu in `factors`, applied to w
export function applyFactors(lattice: PhotonLattice, factors: readonly number[], w: readonly bigint[]): bigint[] {
  let v = [...w]

  for (const mu of factors) {
    const m = applyCurlCurl(lattice, v)

    v = m.map((x, i) => x - BigInt(mu) * (v[i] ?? 0n))
  }

  return v
}

// an integer test vector on the links from an integer Weyl sequence, entries in -8 .. 7
export function testVector(links: number, salt: number): bigint[] {
  return Array.from({ length: links }, (_, l) => BigInt((((l + 1 + 97 * salt) * 40503) & 65535) >> 12) - 8n)
}

const isZero = (v: readonly bigint[]): boolean => v.every(x => x === 0n)

// the 2-adic valuation of a nonzero bigint
function twos(x: bigint): number {
  let n = 0
  let y = x < 0n ? -x : x

  while (y > 0n && (y & 1n) === 0n) {
    y >>= 1n
    n += 1
  }

  return n
}

export type ExactRun = { exponents: number[]; periodSix: boolean; static: boolean; final: { angle: bigint[]; flux: bigint[]; exponent: number } }

// The linear leapfrog at kappa = 2^-qBits in exact rationals: angle and flux are numerators over 2^exponent,
// reduced every beat. exponents[t] is the denominator's exponent after beat t + 1.
export function exactLeapfrog(lattice: PhotonLattice, qBits: number, angle0: readonly bigint[], flux0: readonly bigint[], beats: number): ExactRun {
  let angle = [...angle0]
  let flux = [...flux0]
  let exponent = 0
  const exponents: number[] = []
  const scale = 1n << BigInt(qBits)

  let periodSix = false
  let unchanged = true

  for (let t = 0; t < beats; t++) {
    angle = angle.map((a, l) => a + (flux[l] ?? 0n))

    const force = applyCurlCurl(lattice, angle)

    // E - M A / 2^qBits at exponent + qBits
    angle = angle.map(a => a * scale)
    flux = flux.map((e, l) => e * scale - (force[l] ?? 0n))
    exponent += qBits

    // reduce by the largest power of 2 dividing every numerator, not below exponent 0
    let common = exponent

    for (const x of [...angle, ...flux]) {
      if (x !== 0n) {
        common = Math.min(common, twos(x))
      }

      if (common === 0) {
        break
      }
    }

    if (common > 0) {
      const shift = BigInt(common)

      angle = angle.map(a => a >> shift)
      flux = flux.map(e => e >> shift)
      exponent -= common
    }

    exponents.push(exponent)

    const same = exponent === 0 && angle.every((a, l) => a === angle0[l]) && flux.every((e, l) => e === flux0[l])

    if (t === 5) {
      periodSix = same
    }

    unchanged = unchanged && same
  }

  return { exponents, periodSix, static: unchanged, final: { angle, flux, exponent } }
}

// an integer start as bigint link vectors (angles centered from the N = 8192 starts of code/measure/photon-battery)
export function startVectors(lattice: PhotonLattice, start: Start): { angle: bigint[]; flux: bigint[] } {
  const base = makePhotonRule({ lattice, n: 8192, k: 80, capacity: 0, hop: false, charge: 1 })
  const s = emptyPhotonState(base)

  start(base, s)

  return { angle: Array.from(s.angle, a => BigInt(centered(a, 8192))), flux: Array.from(s.flux, e => BigInt(e)) }
}

// the least-squares slope of y against t over [from, to)
export function slope(y: readonly number[], from: number, to: number): number {
  let st = 0
  let sy = 0
  let stt = 0
  let sty = 0
  const n = to - from

  for (let t = from; t < to; t++) {
    const v = y[t] ?? 0

    st += t
    sy += v
    stt += t * t
    sty += t * v
  }

  return (n * sty - st * sy) / (n * stt - st * st)
}
