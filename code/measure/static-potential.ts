// The static quark-antiquark potential V(R), read off Wilson loops, and the numbers that come from
// fitting it: the string tension sigma, the Coulomb coefficient e and the Sommer scale r0.
//
// The Cornell form is V(R) = V0 - e G(R) + sigma R. At long distance a confining flux tube is a
// vibrating string, whose zero-point energy gives exactly e = pi / 12 (Luscher 1981), independent
// of the gauge group. At short distance e is the one-gluon exchange (4/3) alpha_s instead. G is the
// lattice Coulomb term: on a lattice 1 / R is replaced by the Green function of the lattice
// Laplacian, which removes the leading lattice artifact of the small-R points (the standard
// "lattice-corrected" fit, Michael 1992).
//
// r0 (Sommer 1994) is defined by r0^2 F(r0) = 1.65 with F = dV / dR, so for the Cornell form
// r0 = sqrt((1.65 - e) / sigma) in lattice units. Physically r0 is near 0.5 fm.

// 4 pi times the lattice Coulomb Green function at on-axis distance R, from the momentum sum over a
// periodic L^3 box with the zero mode dropped. Dropping the zero mode shifts every G(R) by the same
// constant, which the V0 of a fit absorbs, so only the R dependence is used.
export function latticeCoulomb(input: {
  r: number
  box?: number
}): number {
  const box = input.box ?? 48
  const step = (2 * Math.PI) / box

  let total = 0

  for (let a = 0; a < box; a++) {
    const s0 = Math.sin((step * a) / 2) ** 2
    const c = Math.cos(step * a * input.r)

    for (let b = 0; b < box; b++) {
      const s1 = Math.sin((step * b) / 2) ** 2

      for (let d = 0; d < box; d++) {
        if (a === 0 && b === 0 && d === 0) {
          continue
        }

        total += c / (4 * (s0 + s1 + Math.sin((step * d) / 2) ** 2))
      }
    }
  }

  return (4 * Math.PI * total) / box ** 3
}

// V(R) = ln(W(R, T) / W(R, T + 1)) from an averaged table of static loops, the effective energy at
// time T. NaN where a loop is not positive.
export function potentialAt(input: {
  table: readonly (readonly number[])[]
  t: number
  maxR: number
}): number[] {
  return Array.from({ length: input.maxR }, (_, i) => {
    const r = i + 1
    const a = input.table[r]?.[input.t] ?? Number.NaN
    const b = input.table[r]?.[input.t + 1] ?? Number.NaN

    return a > 0 && b > 0 ? Math.log(a / b) : Number.NaN
  })
}

// r0 in lattice units from Cornell parameters.
export function sommerScale(input: {
  coulomb: number
  tension: number
}): number {
  return Math.sqrt((1.65 - input.coulomb) / input.tension)
}

// The Necco-Sommer parametrization of r0 / a for the Wilson action (Nucl. Phys. B622 (2002) 328),
// valid for 5.7 <= beta <= 6.92: ln(a / r0) = -1.6804 - 1.7331 x + 0.7849 x^2 - 0.4428 x^3,
// x = beta - 6. The published values a measurement is compared to, never an input to one.
export function neccoSommerScale(input: { beta: number }): number {
  const x = input.beta - 6

  return Math.exp(
    1.6804 + 1.7331 * x - 0.7849 * x * x + 0.4428 * x * x * x,
  )
}
