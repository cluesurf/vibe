// Rapidity of timelike causal links in a 1+1 causal set, and the Lorentz boost of
// the coordinates. The boost parameter of a timelike causal link a->b is its
// rapidity eta = atanh(dx / dt), with (dt, dx) = coord(b) - coord(a). A boost by
// xi shifts every rapidity by xi (rapidities add), so a structure with no
// preferred frame has a flat (translation-invariant) rapidity distribution in the
// bulk, while one with a rest frame piles up at rapidity 0.

// Rapidities of the timelike causal links, optionally restricted to a central time
// band (to suppress the diamond's boundary bias). `coords` is laid out (t, x) per
// element with stride 2.
export function linkRapidities(input: {
  coords: Float64Array
  links: ReadonlyArray<Uint32Array>
  band: { lo: number; hi: number } | null
}): number[] {
  const { coords, links, band } = input
  const out: number[] = []
  for (let a = 0; a < links.length; a++) {
    const ta = coords[a * 2] ?? 0
    const xa = coords[a * 2 + 1] ?? 0
    for (const b of links[a] ?? []) {
      const tb = coords[b * 2] ?? 0
      const xb = coords[b * 2 + 1] ?? 0
      const dt = tb - ta
      const dx = xb - xa
      if (dt <= 1e-9) continue
      const v = dx / dt
      if (Math.abs(v) >= 1 - 1e-9) continue // null/spacelike, no finite rapidity
      if (band && (ta < band.lo || tb > band.hi)) continue
      out.push(Math.atanh(v))
    }
  }
  return out
}

// Lorentz boost of an energy-momentum two-vector (omega, k) by rapidity phi:
//   omega' = omega cosh(phi) + k sinh(phi),
//   k'     = k cosh(phi) + omega sinh(phi).
// A lightlike vector (|omega| = |k|) stays lightlike under any boost, the
// frame-independent lightcone.
export function boostEnergyMomentum(input: {
  omega: number
  wavenumber: number
  rapidity: number
}): { omega: number; wavenumber: number } {
  const ch = Math.cosh(input.rapidity)
  const sh = Math.sinh(input.rapidity)
  return {
    omega: input.omega * ch + input.wavenumber * sh,
    wavenumber: input.wavenumber * ch + input.omega * sh,
  }
}

// Relativistic velocity addition: a particle of velocity v seen from a frame moving at u has
// velocity (v + u) / (1 + u v), which never exceeds the light speed c = 1.
export function addVelocities(input: {
  velocity: number
  frame: number
}): number {
  const { velocity, frame } = input
  return (velocity + frame) / (1 + frame * velocity)
}

// Relativistic on-shell energy E = sqrt(m^2 + p^2) (c = 1), the continuum dispersion whose invariant
// E^2 - p^2 = m^2 is preserved under boosts.
export function relativisticEnergy(input: {
  mass: number
  momentum: number
}): number {
  return Math.sqrt(
    input.mass * input.mass + input.momentum * input.momentum,
  )
}

// Active Lorentz boost of 1+1 coordinates by rapidity xi:
//   t' = cosh(xi) * t + sinh(xi) * x,
//   x' = sinh(xi) * t + cosh(xi) * x.
// Coordinates are laid out (t, x) per element with stride 2. The causal order
// (hence the link set) is unchanged.
export function boostCoords(input: {
  coords: Float64Array
  rapidity: number
}): Float64Array {
  const { coords, rapidity } = input
  const ch = Math.cosh(rapidity)
  const sh = Math.sinh(rapidity)
  const n = coords.length / 2
  const out = new Float64Array(coords.length)
  for (let i = 0; i < n; i++) {
    const t = coords[i * 2] ?? 0
    const x = coords[i * 2 + 1] ?? 0
    out[i * 2] = ch * t + sh * x
    out[i * 2 + 1] = sh * t + ch * x
  }
  return out
}
