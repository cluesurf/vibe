// Equal-time vacuum two-point functions (Green's functions) of lattice field theories, summed over
// momentum modes with a positive spectral weight. The Kallen-Lehmann form C(r) = sum_k cos(k r) /
// (2 omega(k)) of a free field: each mode contributes its positive weight 1/(2 omega), so the
// correlator is manifestly reflection-positive. The reflection-positivity experiments build this
// from the Dirac-walk dispersion and read its range and Hankel positivity off it.

// The Dirac (coined-quantum-walk) field's equal-time vacuum correlator at mass `m`: dispersion
// omega(k) = arccos(cos k cos m), spectral weight 1/(2 omega), summed over `modes` momentum modes
// k = pi n / modes (n = 1 .. modes-1, skipping the zero mode). Returned for separations 0 .. maxR.
// Small mass gives a long-range correlator (a real propagating particle), large mass a contact one.
export function diracEqualTimeCorrelator(input: {
  mass: number
  maxR: number
  modes: number
}): number[] {
  const { mass, maxR, modes } = input
  const c = new Float64Array(maxR + 1)
  for (let n = 1; n < modes; n++) {
    const k = (Math.PI * n) / modes
    const omega = Math.acos(Math.max(-1, Math.min(1, Math.cos(k) * Math.cos(mass))))
    if (omega < 1e-9) continue
    const w = 1 / (2 * omega) // the positive spectral weight (Kallen-Lehmann)
    for (let r = 0; r <= maxR; r++) c[r]! += (w * Math.cos(k * r)) / modes
  }
  return Array.from(c)
}
