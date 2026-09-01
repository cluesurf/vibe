// Slow-roll observables of a single-field inflaton potential, in the potential slow-roll
// approximation (units 8 pi G = 1). The caller supplies V, V' and V'' as one function of phi.
//   epsilon = (1/2) (V'/V)^2,   eta = V''/V,   n_s = 1 - 6 epsilon + 2 eta,   r = 16 epsilon.
// Inflation ends where epsilon reaches one, and the pivot is the field value N e-folds before
// that end, found by integrating dN = (V/V') dphi back up the potential. Two experiments
// (alpha-attractor-from-hyperbolic, plateau-inflation-tensor) each carried these.

export type SlowRollPotential = (phi: number) => {
  V: number
  Vp: number
  Vpp: number
}

// The field value where slow roll ends (epsilon >= 1), walking down from `guess` in steps of 1e-4.
export function slowRollEnd(pot: SlowRollPotential, guess: number): number {
  let phi = guess

  for (let i = 0; i < 2000000; i++) {
    const p = pot(phi)
    const eps = 0.5 * (p.Vp / p.V) ** 2

    if (eps >= 1) {
      return phi
    }

    phi -= 1e-4
  }

  return phi
}

// The spectral index and tensor-to-scalar ratio at the field value `targetN` e-folds before `phiEnd`.
export function slowRollObservables(
  pot: SlowRollPotential,
  phiEnd: number,
  targetN: number,
): { ns: number; r: number } {
  let phi = phiEnd
  let efolds = 0

  const dphi = 1e-4

  while (efolds < targetN && phi < 200) {
    const p = pot(phi)

    efolds += Math.abs((p.V / p.Vp) * dphi)
    phi += dphi
  }

  const p = pot(phi)
  const eps = 0.5 * (p.Vp / p.V) ** 2
  const eta = p.Vpp / p.V

  return { ns: 1 - 6 * eps + 2 * eta, r: 16 * eps }
}
