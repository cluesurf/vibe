// The Landau problem in the harmonic-oscillator (ladder) basis: a charged particle in a
// uniform magnetic field. The kinetic momenta pi_x, pi_y are built from the oscillator
// ladder a, a-dagger so that [pi_x, pi_y] = i q B exactly (the magnetic algebra), with no
// position lattice and so no fermion doublers. This is the clean setting in which the Dirac
// g-factor is MEASURED, not assumed: the relativistic Landau spectrum has a zero mode the
// spinless (scalar) particle lacks, and that gap difference IS the g = 2 magnetic moment.
//
// pi_x = sqrt(qB/2) (a + a-dagger), pi_y = -i sqrt(qB/2) (a - a-dagger).
// Then pi_x^2 + pi_y^2 = qB (2 N-hat + 1), the scalar Landau levels, and the 2-component
// Dirac operator sigma_x pi_x + sigma_y pi_y + sigma_z m squares to (pi^2 + m^2) - qB sigma_z,
// whose sigma_z (spin) term is the magnetic moment that the diagonalization reads back out.

import {
  makeComplexMatrix,
  makeDense,
  type ComplexMatrix,
  type DenseMatrix,
} from '@/code/algebra/linear/dense'

// The ladder momenta on a truncated oscillator basis of `levels` states. Returned as flat
// real arrays: pi_x is real symmetric, pi_y is purely imaginary (so we carry its imaginary
// part). Entry [row m, col n], using <m|a|n> = sqrt(n) [m = n-1] and <m|a-dagger|n> =
// sqrt(n+1) [m = n+1].
function ladderMomenta(
  levels: number,
  fieldStrength: number,
): { pixRe: number[][]; piyIm: number[][] } {
  const scale = Math.sqrt(fieldStrength / 2)
  const pixRe = Array.from({ length: levels }, () =>
    new Array<number>(levels).fill(0),
  )
  const piyIm = Array.from({ length: levels }, () =>
    new Array<number>(levels).fill(0),
  )
  for (let m = 0; m < levels; m++) {
    for (let n = 0; n < levels; n++) {
      const lower = m === n - 1 ? Math.sqrt(n) : 0 // <m|a|n>
      const raise = m === n + 1 ? Math.sqrt(n + 1) : 0 // <m|a-dagger|n>
      pixRe[m]![n] = scale * (lower + raise)
      piyIm[m]![n] = -scale * (lower - raise) // pi_y = -i sqrt(qB/2)(a - a-dagger)
    }
  }
  return { pixRe, piyIm }
}

// The 2-component (2+1D) Dirac operator in a uniform field B, H = sigma_x pi_x + sigma_y pi_y
// + sigma_z m, as a 2L-by-2L complex Hermitian matrix (spin index outermost, then level).
// Its eigenvalues are the relativistic Landau levels E = +/- sqrt(m^2 + 2 q B n), including a
// zero mode at E^2 = m^2 (the n = 0, spin-aligned level), the g = 2 fingerprint.
export function diracLandauHamiltonian(input: {
  levels: number
  fieldStrength: number
  mass: number
}): ComplexMatrix {
  const { levels, fieldStrength, mass } = input
  const { pixRe, piyIm } = ladderMomenta(levels, fieldStrength)
  const dimension = 2 * levels
  const h = makeComplexMatrix({ rows: dimension, cols: dimension })
  const at = (spin: number, level: number): number =>
    spin * levels + level
  for (let mLevel = 0; mLevel < levels; mLevel++) {
    for (let nLevel = 0; nLevel < levels; nLevel++) {
      // sigma_x couples spin 0 <-> 1 with pi_x (real)
      const px = pixRe[mLevel]![nLevel]!
      if (px !== 0) {
        h.re[at(0, mLevel) * dimension + at(1, nLevel)]! += px
        h.re[at(1, mLevel) * dimension + at(0, nLevel)]! += px
      }
      // sigma_y couples spin 0 <-> 1 with pi_y. sigma_y[0][1] = -i, sigma_y[1][0] = +i, and
      // pi_y is purely imaginary, so (-i)(i*piyIm) = +piyIm is real on the (0,1) block.
      const py = piyIm[mLevel]![nLevel]!
      if (py !== 0) {
        h.re[at(0, mLevel) * dimension + at(1, nLevel)]! += py // (-i) * (i py) = py
        h.re[at(1, mLevel) * dimension + at(0, nLevel)]! += -py // (+i) * (i py) = -py
      }
    }
    // sigma_z m on the spin-diagonal, level-diagonal
    h.re[at(0, mLevel) * dimension + at(0, mLevel)]! += mass
    h.re[at(1, mLevel) * dimension + at(1, mLevel)]! += -mass
  }
  return h
}

// The spinless (scalar / Klein-Gordon) energy-squared operator pi^2 + m^2 in the same field,
// an L-by-L real symmetric matrix. Its eigenvalues are the scalar Landau levels
// E^2 = m^2 + q B (2 n + 1), whose lowest is m^2 + qB: there is NO zero mode. This is the
// control: the gap between this and the Dirac zero mode is the spin magnetic moment.
export function scalarLandauSquared(input: {
  levels: number
  fieldStrength: number
  mass: number
}): DenseMatrix {
  const { levels, fieldStrength, mass } = input
  const { pixRe, piyIm } = ladderMomenta(levels, fieldStrength)
  const out = makeDense({ rows: levels, cols: levels })
  for (let i = 0; i < levels; i++) {
    for (let j = 0; j < levels; j++) {
      // (pi_x^2 + pi_y^2)[i][j] = sum_k pix[i][k] pix[k][j] + piy[i][k] piy[k][j].
      // pi_x is real, pi_y is purely imaginary, so piy[i][k] piy[k][j] = (i a)(i b) = -a b.
      let sum = 0
      for (let k = 0; k < levels; k++) {
        sum +=
          pixRe[i]![k]! * pixRe[k]![j]! - piyIm[i]![k]! * piyIm[k]![j]!
      }
      if (i === j) {
        sum += mass * mass
      }
      out.data[i * levels + j] = sum
    }
  }
  return out
}
