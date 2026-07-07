// The finite-size infrared cutoff of a discrete substrate, the mechanism behind the CMB large-angle
// (low multipole) power suppression. A field on a finite substrate cannot carry a wavelength longer
// than the substrate, so its mode spectrum has a smallest nonzero eigenvalue, a spectral gap, below
// which there are NO modes. A scale-invariant field puts power proportional to 1/eigenvalue into each
// mode, so the power in the largest-scale mode is capped at 1 / gap, finite on any finite substrate
// and unbounded only in the continuum limit. That cap is the low-multipole suppression: the biggest
// angular scales lose the power an infinite space would give them.
//
// Measured exactly on a cycle (a ring of `sites` cells), the minimal finite geometry with a closed-
// form Laplacian spectrum eigenvalue_k = 2 (1 - cos(2 pi k / sites)). The mechanism (a spectral gap
// that shrinks as the substrate grows) is generic to any finite substrate; the ring makes it exact.

// The spectral gap of a ring of `sites` cells, the lowest nonzero Laplacian eigenvalue
// 2 (1 - cos(2 pi / sites)). It scales as (2 pi / sites)^2 for large rings, so it vanishes toward the
// continuum.
export function cycleSpectralGap(sites: number): number {
  return 2 * (1 - Math.cos((2 * Math.PI) / sites))
}

// The largest-scale power a scale-invariant field carries, 1 / gap. Finite on a finite substrate (the
// low-multipole cap), diverging only as the substrate grows without bound.
export function largestScalePower(sites: number): number {
  return 1 / cycleSpectralGap(sites)
}

// The gap times the squared size, which tends to (2 pi)^2 as the ring grows, confirming the gap
// scales as 1 / size^2 (so the suppression scale scales as 1 / size).
export function gapTimesSizeSquared(sites: number): number {
  return cycleSpectralGap(sites) * sites * sites
}
