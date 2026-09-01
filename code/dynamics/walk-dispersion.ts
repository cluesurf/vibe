// The momentum-space dynamics of the emergent Dirac walk, measured from evolution. A single
// momentum mode is a two-component spinor evolved by the coin (mass mixing) followed by the shift
// (opposite phases for the two chiralities). The mode's frequency is read off the dynamical
// autocorrelation by the exact two-frequency linear-prediction identity
// a(t+1) + a(t-1) = 2 cos(omega) a(t), which holds exactly because the one-step operator has the
// two eigenphases plus and minus omega. This gives the dispersion from the dynamics itself at
// machine precision, feeding the nonrelativistic (Schrodinger) limit and the flux-period results.

import { ComplexPair as Complex, pairAdd as add, pairMul as mul } from '@/code/algebra/linear/complex-pair'

type Spinor = readonly [Complex, Complex]

// one walk step on a momentum-k spinor: the mass coin then the chirality-split shift phases
function stepMode(input: {
  k: number
  mass: number
  spinor: Spinor
}): Spinor {
  const { k, mass, spinor } = input
  const c = Math.cos(mass)
  const s = Math.sin(mass)

  const coinedRight = add(
    mul([c, 0], spinor[0]),
    mul([0, -s], spinor[1]),
  )

  const coinedLeft = add(
    mul([0, -s], spinor[0]),
    mul([c, 0], spinor[1]),
  )

  return [
    mul([Math.cos(k), Math.sin(k)], coinedRight),
    mul([Math.cos(-k), Math.sin(-k)], coinedLeft),
  ]
}

// The mode frequency omega(k) measured from the dynamics: evolve a generic spinor, record the
// autocorrelation, and apply the exact linear-prediction identity at an interior beat.
export function omegaFromDynamics(input: {
  k: number
  mass: number
}): number {
  const { k, mass } = input

  let spinor: Spinor = [
    [0.8, 0],
    [0.6, 0],
  ]

  const initial = spinor
  const series: Complex[] = [[1, 0]]

  for (let t = 1; t <= 6; t++) {
    spinor = stepMode({ k, mass, spinor })

    const real =
      initial[0][0] * spinor[0][0] +
      initial[0][1] * spinor[0][1] +
      initial[1][0] * spinor[1][0] +
      initial[1][1] * spinor[1][1]

    const imaginary =
      initial[0][0] * spinor[0][1] -
      initial[0][1] * spinor[0][0] +
      initial[1][0] * spinor[1][1] -
      initial[1][1] * spinor[1][0]

    series.push([real, imaginary])
  }

  const numerator = add(series[5]!, series[3]!)
  const denominator = series[4]!
  const magnitude =
    denominator[0] * denominator[0] + denominator[1] * denominator[1]

  const cosOmega =
    (numerator[0] * denominator[0] + numerator[1] * denominator[1]) /
    (2 * magnitude)

  return Math.acos(Math.max(-1, Math.min(1, cosOmega)))
}

// The full ring spectrum with a flux threaded through: each allowed momentum 2 pi n / size is
// shifted by flux / size (the per-hop holonomy), and the sorted set of mode frequencies is the
// observable spectrum.
export function ringSpectrumWithFlux(input: {
  size: number
  mass: number
  flux: number
}): number[] {
  const { size, mass, flux } = input
  const out: number[] = []

  for (let n = 0; n < size; n++) {
    out.push(
      omegaFromDynamics({
        k: (2 * Math.PI * n) / size + flux / size,
        mass,
      }),
    )
  }

  return out.sort((a, b) => a - b)
}
